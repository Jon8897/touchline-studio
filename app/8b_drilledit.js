/* ===== Drill creator: coaches design, animate and save their own drills ===== */
const AREAS=[['none','No area',0,0],['10x10','10 × 10 m',10,10],['15x15','15 × 15 m',15,15],['20x20','20 × 20 m',20,20],['30x20','30 × 20 m',30,20],['40x30','40 × 30 m',40,30],['50x40','50 × 40 m',50,40],['box','Penalty area',40.3,16.5],['half','Half pitch',68,52.5]];
const PIECES=[['t','Player'],['o','Opponent'],['gk','Keeper'],['k','Server'],['c','Cone'],['g','Mini goal'],['p','Pole']];
let MK=null, mkCur=0, mkSel=null, mkLoose=false, mkFromSession=false;
function loadMyDrills(){
  const list=store.get('mydrills',[]);
  list.forEach(d=>{if(d&&d.id&&d.sc&&!DRILLS.some(x=>x.id===d.id)) DRILLS.push({...d,custom:true})});
}
function saveMyDrills(){store.set('mydrills',DRILLS.filter(d=>d.custom).map(d=>({...d})))}
function viewCenter(v){const [a,b]=VIEWS[v||'full']; return (a+b)/2}
function areaGrid(key,view){
  const A=AREAS.find(a=>a[0]===key); if(!A||!A[2]) return [];
  if(key==='box') return [[20.4,0,59.2,15.7,'Penalty area']];
  if(key==='half') return [[0,0,100,50,'Half pitch']];
  const w=A[2]/68*100, h=A[3]/105*100, cy=viewCenter(view);
  return [[50-w/2,Math.max(0,Math.min(100-h,cy-h/2)),w,h,A[1]]];
}
function blankDrill(){return {id:null,name:'',cat:'Unit',line:'Midfield',pos:[],focus:'',players:'',area:'20 × 20 m',time:'15 min',int:'Medium',kit:'',setup:'',steps:[],pts:[],prog:[],themes:[],tm:{work:60,rest:30,rounds:6,sets:1,sr:120},areaKey:'20x20',sc:{view:'mid',grid:areaGrid('20x20','mid'),e:{},b:null,f:[{h:'Set-up',c:'',m:{}}]}}}
function mkScene(){return {...MK.sc,tag:MK.name||'New drill'}}
function mkRefresh(keep=true){
  const b=boards.mk; b.load(mkScene(),false,Math.min(mkCur,MK.sc.f.length-1)); b.setEditing(true); b.setBallMode(mkLoose);
  if(mkSel&&b.toks[mkSel]) b.toks[mkSel].classList.add('sel');
  renderMkSteps(); renderMkSel();
}
function renderMkSteps(){
  $('#mkSteps').innerHTML=MK.sc.f.map((f,i)=>`<button class="chip sm" data-mst="${i}" aria-pressed="${i===mkCur}">${i===0?'Set-up':i+1}</button>`).join('')+`<button class="chip sm" id="mkAddStep">+ Step</button>${MK.sc.f.length>1&&mkCur>0?'<button class="chip sm" id="mkDelStep">Delete step</button>':''}`;
  const f=MK.sc.f[mkCur]||MK.sc.f[0];
  if(document.activeElement!==$('#mkPhase')) $('#mkPhase').value=f.h||'';
  if(document.activeElement!==$('#mkCap')) $('#mkCap').value=f.c||'';
  $('#mkStepHint').textContent=mkCur===0?'Set-up: place pieces where the drill starts.':`Step ${mkCur+1}: drag players to where they finish this step. Arrows show the movement.`;
}
function renderMkSel(){
  const bar=$('#mkSelBar'); const e=mkSel&&MK.sc.e[mkSel];
  if(!e){bar.hidden=true; return}
  bar.hidden=false; const isPlayer='tohk'.includes(e[3]||'t');
  $('#mkSelLbl').value=e[2]||''; $('#mkSelLbl').disabled=!isPlayer; $('#mkGive').hidden=!isPlayer;
}
function nextLabel(kind){
  const ex=Object.values(MK.sc.e).filter(v=>(v[3]||'t')===kind).map(v=>v[2]);
  if(kind==='k') return 'S';
  if(kind==='o'){const L='ABCDEFGHIJKLMNOPQRSTUVWXYZ'; for(const c of L) if(!ex.includes(c)) return c; return '?'}
  for(let n=1;n<40;n++) if(!ex.includes(String(n))) return String(n); return '';
}
function addPiece(type){
  const kind=type==='gk'?'t':type, n=Object.keys(MK.sc.e).length;
  const id=kind+Date.now().toString(36).slice(-4)+n;
  const [va,vb]=VIEWS[MK.sc.view||'full'], cy=(va+vb)/2;
  const taken=Object.values(MK.sc.e).map(v=>[v[0],v[1]]);
  let x=50,y=cy;
  if(type==='gk'){x=50; y=MK.sc.view==='att'?3:Math.min(96,vb-2)}
  else{ const spots=[]; for(let r=0;r<5;r++) for(let c=0;c<7;c++) spots.push([50+(c%2?1:-1)*Math.ceil(c/2)*11,cy+(r%2?1:-1)*Math.ceil(r/2)*8]);
    const free=spots.find(([sx,sy])=>sy>va+2&&sy<vb-2&&taken.every(([tx,ty])=>Math.hypot((sx-tx)*.68,(sy-ty)*1.05)>6.5)); if(free) [x,y]=free; }
  const label=type==='gk'?'GK':'tok'.includes(kind)?nextLabel(kind):'';
  MK.sc.e[id]=[Math.round(x*10)/10,Math.round(y*10)/10,label,...(kind==='t'?[]:[kind])];
  mkSel=id; mkRefresh();
}
function mkDelete(id){
  delete MK.sc.e[id];
  MK.sc.f.forEach(f=>{if(f.m) delete f.m[id]; if(f.b===id) delete f.b});
  if(MK.sc.b===id) MK.sc.b=null;
  mkSel=null; mkRefresh();
}
function linesOf(id){return $(id).value.split('\n').map(s=>s.replace(/^\s*[-•\d.)]+\s*/,'').trim()).filter(Boolean)}
function fillMkForm(){
  const D=MK;
  $('#mkName').value=D.name; $('#mkCat').value=D.cat; $('#mkLine').value=D.line; $('#mkFocus').value=D.focus; $('#mkPlayers').value=D.players;
  $('#mkTime').value=parseInt(D.time,10)||15; $('#mkInt').value=D.int; $('#mkKit').value=D.kit; $('#mkSetup').value=D.setup;
  $('#mkRun').value=(D.steps||[]).join('\n'); $('#mkPts').value=(D.pts||[]).join('\n'); $('#mkProg').value=(D.prog||[]).join('\n');
  $('#mkWork').value=D.tm.work; $('#mkRest').value=D.tm.rest; $('#mkReps').value=D.tm.rounds; $('#mkSets').value=D.tm.sets||1;
  $('#mkArea').value=D.areaKey||'none'; $('#mkView').value=D.sc.view||'full';
  $('#mkPos').innerHTML=POSITIONS.map(p=>`<button type="button" class="chip sm" data-mpos="${p.id}" aria-pressed="${D.pos.includes(p.id)}">${p.short}</button>`).join('');
  $('#mkThemes').innerHTML=THEMES.map(t=>`<button type="button" class="chip sm" data-mth="${t.id}" aria-pressed="${(D.themes||[]).includes(t.id)}">${t.n}</button>`).join('');
}
function openDrillEditor(src,opts={}){
  mkFromSession=!!opts.fromSession;
  if(src){const c=JSON.parse(JSON.stringify(src)); MK={...blankDrill(),...c,themes:c.themes||[],sc:{view:c.sc.view||'full',grid:c.sc.grid||[],e:c.sc.e,b:c.sc.b??null,f:c.sc.f&&c.sc.f.length?c.sc.f:[{h:'Set-up',c:'',m:{}}]}}; if(!c.custom){MK.id=null; MK.name=c.name+' (my version)'; MK.areaKey='none'}}
  else MK=blankDrill();
  mkCur=0; mkSel=null; mkLoose=false;
  $('#mkTitle').textContent=MK.id?'Edit drill':src?'Customise drill':'Create a drill';
  $('#mkStatus').textContent='';
  fillMkForm();
  $('#mkSheet').hidden=false; document.body.classList.add('locked'); $('#mkScroll').scrollTop=0;
  if(!boards.mk) boards.mk=new Board($('#mkBoard'),{
    onTok:id=>{ if(mkLoose) return; mkSel=id; mkRefresh() },
    onDrag:(id,p)=>{ if(mkCur===0){MK.sc.e[id][0]=p[0]; MK.sc.e[id][1]=p[1]; delete MK.sc.f[0].m[id]} else MK.sc.f[mkCur].m[id]=p; mkSel=id; mkRefresh() },
    onStep:i=>{mkCur=i; renderMkSteps()}
  });
  mkRefresh();
}
function closeDrillEditor(){$('#mkSheet').hidden=true; document.body.classList.remove('locked'); if(boards.mk) boards.mk.stop()}
function saveDrill(){
  const name=$('#mkName').value.trim(), st=$('#mkStatus');
  if(!name){st.className='status err'; st.textContent='Give the drill a name.'; $('#mkName').focus(); return}
  const pieces=Object.keys(MK.sc.e).length;
  if(!pieces){st.className='status err'; st.textContent='Add at least one player, cone or goal to the pitch.'; return}
  const id=MK.id||('my-'+Date.now().toString(36));
  const minutes=Math.max(1,parseInt($('#mkTime').value,10)||15);
  const D={id,custom:true,name,cat:$('#mkCat').value,line:$('#mkLine').value,pos:MK.pos.slice(),themes:(MK.themes||[]).slice(),
    focus:$('#mkFocus').value.trim()||'Coach’s own drill',players:$('#mkPlayers').value.trim()||`${Object.values(MK.sc.e).filter(v=>'tok'.includes(v[3]||'t')).length} players`,
    area:(AREAS.find(a=>a[0]===$('#mkArea').value)||AREAS[0])[1].replace('No area','Open space'),areaKey:$('#mkArea').value,time:minutes+' min',int:$('#mkInt').value,kit:$('#mkKit').value.trim()||'Balls, cones, bibs',
    setup:$('#mkSetup').value.trim()||'See the diagram.',steps:linesOf('#mkRun'),pts:linesOf('#mkPts'),prog:linesOf('#mkProg'),
    tm:{work:Math.max(5,+$('#mkWork').value||60),rest:Math.max(0,+$('#mkRest').value||0),rounds:Math.max(1,+$('#mkReps').value||1),sets:Math.max(1,+$('#mkSets').value||1),sr:120},
    sc:JSON.parse(JSON.stringify({view:MK.sc.view,grid:MK.sc.grid,e:MK.sc.e,b:MK.sc.b,f:MK.sc.f.map((f,i)=>({...f,h:f.h||(i===0?'Set-up':'Step '+(i+1))}))}))};
  if(!D.steps.length) D.steps=['Run the drill as shown in the diagram.'];
  if(!D.pts.length) D.pts=['Quality and intensity on every rep.'];
  const i=DRILLS.findIndex(d=>d.id===id); if(i>=0) DRILLS[i]=D; else DRILLS.push(D);
  saveMyDrills(); closeDrillEditor();
  dLine='My drills'; dCat='All'; dPos='all'; dQ=''; $('#dSearch').value=''; renderDrills();
  if(mkFromSession){addToSession(id); show('sessions')} else {show('drills'); openDrill(id)}
}
function deleteMyDrill(id){
  const i=DRILLS.findIndex(d=>d.id===id&&d.custom); if(i<0) return;
  DRILLS.splice(i,1); saveMyDrills();
  if(SES){SES.blocks=SES.blocks.filter(b=>b.type!=='drill'||b.id!==id); renderSession()}
  closeDrill(); renderDrills();
}
function initDrillEditor(){
  $('#mkCat').innerHTML=['Individual','Unit','Team'].map(c=>`<option>${c}</option>`).join('');
  $('#mkLine').innerHTML=['Goalkeeping','Defence','Midfield','Forwards','Whole team'].map(c=>`<option>${c}</option>`).join('');
  $('#mkArea').innerHTML=AREAS.map(a=>`<option value="${a[0]}">${a[1]}</option>`).join('');
  $('#mkView').innerHTML=[['full','Full pitch'],['att','Attacking half'],['mid','Middle third'],['def','Defending half']].map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
  $('#mkTools').innerHTML=PIECES.map(([k,n])=>`<button type="button" class="tool" data-piece="${k}"><span class="tk tk-${k}"></span>${n}</button>`).join('');
  $('#mkTools').addEventListener('click',e=>{const b=e.target.closest('[data-piece]'); if(b) addPiece(b.dataset.piece)});
  $('#mkLooseBtn').onclick=()=>{mkLoose=!mkLoose; $('#mkLooseBtn').setAttribute('aria-pressed',mkLoose); boards.mk.setBallMode(mkLoose); $('#mkStepHint').textContent=mkLoose?'Tap an empty spot on the pitch where the ball goes at the end of this step.':''};
  $('#mkNoBall').onclick=()=>{const f=MK.sc.f[mkCur]; if(mkCur===0) MK.sc.b=null; f.b=null; mkRefresh()};
  $('#mkBoard').addEventListener('click',e=>{
    if(!mkLoose||e.target.closest('.tok')) return; const svg=e.target.closest('svg.pitch'); if(!svg) return;
    const m=svg.getScreenCTM(); if(!m) return; const q=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse());
    MK.sc.f[mkCur].b=[Math.round(Math.max(1,Math.min(99,q.x/PW*100))*10)/10,Math.round(Math.max(1,Math.min(99,q.y/PL*100))*10)/10];
    mkLoose=false; $('#mkLooseBtn').setAttribute('aria-pressed','false'); mkRefresh();
  });
  $('#mkGive').onclick=()=>{if(!mkSel) return; MK.sc.f[mkCur].b=mkSel; if(mkCur===0) MK.sc.b=mkSel; mkRefresh()};
  $('#mkSelDel').onclick=()=>mkSel&&mkDelete(mkSel);
  $('#mkSelLbl').addEventListener('input',e=>{if(mkSel&&MK.sc.e[mkSel]){MK.sc.e[mkSel][2]=e.target.value.slice(0,3); const t=boards.mk.toks[mkSel]; const tx=t&&t.querySelector('.lbl'); if(tx) tx.textContent=MK.sc.e[mkSel][2]}});
  $('#mkSelDone').onclick=()=>{mkSel=null; mkRefresh()};
  $('#mkSteps').addEventListener('click',e=>{
    const s=e.target.closest('[data-mst]'); if(s){mkCur=+s.dataset.mst; mkRefresh(); return}
    if(e.target.closest('#mkAddStep')){MK.sc.f.splice(mkCur+1,0,{h:'',c:'',m:{}}); mkCur++; mkRefresh(); $('#mkCap').focus(); return}
    if(e.target.closest('#mkDelStep')&&mkCur>0){MK.sc.f.splice(mkCur,1); mkCur--; mkRefresh()}
  });
  $('#mkPhase').addEventListener('input',e=>{MK.sc.f[mkCur].h=e.target.value; $('.cap-h',$('#mkBoard')).textContent=e.target.value});
  $('#mkCap').addEventListener('input',e=>{MK.sc.f[mkCur].c=e.target.value; $('.cap-t',$('#mkBoard')).textContent=e.target.value});
  $('#mkArea').addEventListener('change',e=>{MK.areaKey=e.target.value; MK.sc.grid=areaGrid(e.target.value,MK.sc.view); mkRefresh()});
  $('#mkView').addEventListener('change',e=>{MK.sc.view=e.target.value; MK.sc.grid=areaGrid(MK.areaKey,MK.sc.view); mkRefresh()});
  $('#mkName').addEventListener('input',e=>{MK.name=e.target.value});
  $('#mkPos').addEventListener('click',e=>{const b=e.target.closest('[data-mpos]'); if(!b) return; const p=b.dataset.mpos; MK.pos=MK.pos.includes(p)?MK.pos.filter(x=>x!==p):[...MK.pos,p]; b.setAttribute('aria-pressed',MK.pos.includes(p))});
  $('#mkThemes').addEventListener('click',e=>{const b=e.target.closest('[data-mth]'); if(!b) return; const t=b.dataset.mth; MK.themes=MK.themes.includes(t)?MK.themes.filter(x=>x!==t):[...MK.themes,t]; b.setAttribute('aria-pressed',MK.themes.includes(t))});
  $('#mkPlay').onclick=()=>{mkSel=null; mkLoose=false; boards.mk.load(mkScene(),true,0); boards.mk.setEditing(true)};
  $('#mkSave').onclick=saveDrill;
  $('#mkSheet').addEventListener('click',e=>{if(e.target.id==='mkSheet'||e.target.closest('#mkX')||e.target.closest('#mkCancel')) closeDrillEditor()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#mkSheet').hidden) closeDrillEditor()});
}
