/* ===== Coach's board ===== */
let pbCat='All';
function renderPlaybook(){
  const cats=['All',...new Set(PLAYBOOK.map(p=>p.cat))];
  $('#pbCats').innerHTML=cats.map(c=>`<button class="chip" data-pc="${c}" aria-pressed="${c===pbCat}">${c}</button>`).join('');
  $('#pbList').innerHTML=PLAYBOOK.filter(p=>pbCat==='All'||p.cat===pbCat).map(p=>`<button class="sc" data-pb="${p.id}"><span class="k ${/Press|Transition: defensive|defend/i.test(p.cat+p.name)?'d':'a'}">${p.cat.split(' ')[0].slice(0,5).toUpperCase()}</span><span>${esc(p.name)}<small style="display:block;color:var(--muted);font-weight:500;margin-top:2px">${esc(p.sum)}</small></span></button>`).join('');
}
const OPPS=[['none','No opponents'],['442','4-4-2'],['433','4-3-3'],['4231','4-2-3-1'],['352','3-5-2'],['541','5-4-1']];
let play=null, cur=0, ballMode=false, looseMode=false;
const clampN=v=>Math.max(2,Math.min(98,Math.round(v*10)/10));
function buildEnts(formId,oppId){
  const F=FORMATIONS.find(f=>f.id===formId)||FORMATIONS[0], e={};
  F.r.forEach((r,i)=>e['p'+i]=[F.b[i][0],F.b[i][1],r]);
  if(oppId!=='none'){const O=FORMATIONS.find(f=>f.id===oppId); if(O) O.r.forEach((r,i)=>e['q'+i]=[100-O.b[i][0],Math.max(3,100-O.b[i][1]-(i?6:0)),r,'o'])}
  return e;
}
function newPlay(formId,oppId,title){return {title:title||'New play',form:formId,opp:oppId,e:buildEnts(formId,oppId),b:'p0',f:[{h:'Start',c:'Set the starting shape. Drag players, then add the next step.',m:{}}]}}
const frame=()=>play.f[cur];
function saveDraft(){store.set('draft',play)}
function refresh(autoplay=false){
  play.f.forEach(f=>{f.m=f.m||{}});
  const shown=($('#cAuto')&&$('#cAuto').checked)?autoShift(play):play;
  boards.coach.load({...shown,tag:play.title,view:'full'},autoplay,autoplay?0:cur);
  boards.coach.setEditing(true);
  renderSteps(); fillEditor(); saveDraft();
}
function renderSteps(){
  $('#cSteps').innerHTML=play.f.map((f,i)=>`<button class="chip" data-st="${i}" aria-pressed="${i===cur}">${i+1}${f.h?' · '+esc(f.h):''}</button>`).join('');
}
function fillEditor(){
  const f=frame(); $('#cStepNo').textContent=`${cur+1} / ${play.f.length}`;
  if(document.activeElement!==$('#cPhase')) $('#cPhase').value=f.h||'';
  if(document.activeElement!==$('#cCap')) $('#cCap').value=f.c||'';
  $('#cTitle').value=play.title||'';
  $('#cDel').disabled=play.f.length<2;
}
function setBall(on){ballMode=on; looseMode=false; boards.coach.setBallMode(on); $('#cBall').setAttribute('aria-pressed',on); $('#cLoose').setAttribute('aria-pressed','false'); $('#cHint').textContent=on?'Tap the player who should have the ball at the end of this step.':'Drag any player to set where he finishes this step. Arrows show the movement from the previous step.'}
function setLoose(on){looseMode=on; ballMode=false; boards.coach.setBallMode(on); $('#cLoose').setAttribute('aria-pressed',on); $('#cBall').setAttribute('aria-pressed','false'); $('#cHint').textContent=on?'Tap an empty spot on the pitch where the ball should go.':'Drag any player to set where he finishes this step. Arrows show the movement from the previous step.'}

function renderSaved(){
  const list=store.get('plays',[]);
  $('#cSaved').innerHTML=list.length?list.map((p,i)=>`<div class="row"><div><b>${esc(p.title)}</b><small>${p.f.length} steps</small></div><div style="display:flex;gap:6px"><button class="mini" data-load="${i}">Open</button><button class="mini" data-delp="${i}">Delete</button></div></div>`).join(''):'<p class="muted" style="margin:0">No saved plays yet. Build one and tap “Save play”.</p>';
}

function generate(){
  const desc=$('#cDesc').value.trim(), st=$('#cStatus');
  if(desc.length<15){st.className='status err'; st.textContent='Write a sentence or two about how your team should play first.'; return}
  const r=composePlan(desc,$('#cFormA').value,$('#cOppA').value);
  play={title:r.title,form:r.form,opp:r.opp,e:r.e,b:r.b,f:r.f}; cur=0; refresh(true);
  st.className='status';
  st.textContent=r.recognised.length?`Built: ${r.F.name} ${r.F.v}${r.O?' v '+r.O.name:''}. Recognised: ${r.recognised.join(' → ')}. Drag players or rewrite any step to fine-tune it.`:`Built the ${r.F.name} shape. Tip: mention phases like “build-up”, “when they press us”, “overlap and cross”, “press high”, “mid block”, “low block”, “counter-attack” or “counter-press”.`;
  $('#coachBoard').scrollIntoView({behavior:'smooth',block:'start'});
}
function initCoach(){
  const fo=FORMATIONS.map(f=>`<option value="${f.id}">${f.name} ${f.v}</option>`).join(''), oo=OPPS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
  $('#cForm').innerHTML=fo; $('#cOpp').innerHTML=oo; $('#cOpp').value='442';
  $('#cFormA').innerHTML='<option value="auto">Auto (from my plan)</option>'+fo; $('#cOppA').innerHTML='<option value="auto">Auto (from my plan)</option>'+oo;
  boards.coach=new Board($('#coachBoard'),{
    onTok:(id)=>{if(!ballMode) return; frame().b=id; setBall(false); refresh()},
    onDrag:(id,p)=>{frame().m[id]=p; refresh()},
    onStep:i=>{cur=i; renderSteps(); fillEditor()}
  });
  $('#coachBoard svg').addEventListener('click',e=>{
    if(!looseMode||e.target.closest('.tok')) return;
    const m=e.currentTarget.getScreenCTM(); if(!m) return; const q=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());
    frame().b=[clampN(q.x/PW*100),clampN(q.y/PL*100)]; setLoose(false); refresh();
  });
  const draft=store.get('draft',null);
  if(draft&&draft.e&&Array.isArray(draft.f)&&draft.f.length) play=draft;
  else {const ex=pressScene(FORMATIONS[0],'through'); play={title:'Example: beat a man-to-man press',form:'433',opp:'custom',e:ex.e,b:ex.b,f:ex.f.map(f=>({...f,m:{...(f.m||{})}}))}}
  refresh(false);
  renderSaved();
  $('#cSteps').addEventListener('click',e=>{const b=e.target.closest('[data-st]'); if(!b) return; cur=+b.dataset.st; boards.coach.stop(); boards.coach.begin(cur)});
  $('#cPhase').addEventListener('input',e=>{frame().h=e.target.value; renderSteps(); $('.cap-h',$('#coachBoard')).textContent=e.target.value; $('.stage-tag .ph',$('#coachBoard')).textContent=e.target.value; saveDraft()});
  $('#cCap').addEventListener('input',e=>{frame().c=e.target.value; $('.cap-t',$('#coachBoard')).textContent=e.target.value; saveDraft()});
  $('#cTitle').addEventListener('input',e=>{play.title=e.target.value; $('.stage-tag .t',$('#coachBoard')).textContent=e.target.value; saveDraft()});
  $('#cBall').onclick=()=>setBall(!ballMode);
  $('#cLoose').onclick=()=>setLoose(!looseMode);
  $('#cAdd').onclick=()=>{play.f.splice(cur+1,0,{h:frame().h||'',c:'',m:{}}); cur++; refresh(); $('#cCap').focus()};
  $('#cDel').onclick=()=>{if(play.f.length<2) return; play.f.splice(cur,1); cur=Math.max(0,cur-1); refresh()};
  $('#cPlay').onclick=()=>{setBall(false); cur=0; refresh(true)};
  $('#cNew').onclick=()=>{play=newPlay($('#cForm').value,$('#cOpp').value,$('#cTitle').value.trim()||'New play'); cur=0; refresh(); $('#cStatus').textContent=''};
  $('#cSave').onclick=()=>{const list=store.get('plays',[]); const copy=JSON.parse(JSON.stringify(play)); const i=list.findIndex(p=>p.title===copy.title); if(i>=0) list[i]=copy; else list.unshift(copy); store.set('plays',list.slice(0,40)); renderSaved(); $('#cSave').textContent='Saved'; setTimeout(()=>$('#cSave').textContent='Save play',1500)};
  $('#cSaved').addEventListener('click',e=>{
    const l=e.target.closest('[data-load]'); if(l){play=JSON.parse(JSON.stringify(store.get('plays',[])[+l.dataset.load])); cur=0; refresh(true); $('#coachBoard').scrollIntoView({behavior:'smooth',block:'start'}); return}
    const d=e.target.closest('[data-delp]'); if(d){ if(d.dataset.sure){const list=store.get('plays',[]); list.splice(+d.dataset.delp,1); store.set('plays',list); renderSaved()} else {d.dataset.sure='1'; d.textContent='Tap to confirm'; setTimeout(()=>{if(d.isConnected){delete d.dataset.sure; d.textContent='Delete'}},3000)} }
  });
  $('#cAuto').onchange=()=>refresh();
  renderPlaybook();
  $('#pbCats').addEventListener('click',e=>{const b=e.target.closest('[data-pc]'); if(b){pbCat=b.dataset.pc; renderPlaybook()}});
  $('#pbList').addEventListener('click',e=>{const b=e.target.closest('[data-pb]'); if(!b) return; const P=PLAYBOOK.find(p=>p.id===b.dataset.pb); const sc=withContext(P.sc); play={title:P.name,form:'433',opp:'auto',e:sc.e,b:sc.b,f:sc.f,ctx:sc.ctx}; cur=0; refresh(true); $('#cStatus').className='status'; $('#cStatus').textContent=`Loaded “${P.name}”. ${P.when}`; $('#coachBoard').scrollIntoView({behavior:'smooth',block:'start'})});
  $('#cGen').onclick=generate;

}
