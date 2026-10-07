/* ===== Team week: coach area, weekly post, share link, player view ===== */
const DAYS=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
const ss={get(k){try{return sessionStorage.getItem('tls:'+k)}catch(e){return null}},set(k,v){try{sessionStorage.setItem('tls:'+k,v)}catch(e){}},del(k){try{sessionStorage.removeItem('tls:'+k)}catch(e){}}};
let WK=null, pvBoards=[], pvIO=null, PV=null;
const coachCfg=()=>SRV.on?{team:(curTeam()||{}).name||'',name:SRV.user.name,site:location.origin+'/'}:store.get('coach',null);
const isCoach=()=>SRV.on||(!!coachCfg()&&ss.get('unlocked')==='1');
async function hashPin(pin,salt){const data=new TextEncoder().encode(salt+':'+pin); try{const h=await crypto.subtle.digest('SHA-256',data); return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('')}catch(e){let h=5381; for(const c of data) h=((h<<5)+h+c)|0; return 'x'+(h>>>0).toString(16)}}
const b64u=u8=>{let s=''; for(let i=0;i<u8.length;i+=0x8000) s+=String.fromCharCode.apply(null,u8.subarray(i,i+0x8000)); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')};
const ub64=str=>{str=str.replace(/-/g,'+').replace(/_/g,'/'); while(str.length%4) str+='='; const b=atob(str), u=new Uint8Array(b.length); for(let i=0;i<b.length;i++) u[i]=b.charCodeAt(i); return u};
async function packWeek(o){const bytes=new TextEncoder().encode(JSON.stringify(o)); if(window.CompressionStream){try{const buf=await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer(); return 'z'+b64u(new Uint8Array(buf))}catch(e){}} return 'j'+b64u(bytes)}
async function unpackWeek(s){const k=s[0], u=ub64(s.slice(1)); let bytes=u; if(k==='z'){if(!window.DecompressionStream) throw new Error('This browser is too old to open the link. Please update it.'); bytes=new Uint8Array(await new Response(new Blob([u]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer())} return JSON.parse(new TextDecoder().decode(bytes))}
function toast(t){let el=$('#toast'); if(!el){el=document.createElement('div'); el.id='toast'; el.className='toast'; el.setAttribute('role','status'); document.body.appendChild(el)} el.textContent=t; el.classList.add('on'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('on'),2400)}
const blankWeek=()=>({title:'',match:{opp:'',date:'',time:'',venue:'',ha:'Home'},msg:'',train:[],items:[]});
function loadDraft(){WK=store.get('weekdraft',null)||blankWeek(); WK.match=WK.match||blankWeek().match; WK.train=WK.train||[]; WK.items=WK.items||[]}
function saveDraft(){store.set('weekdraft',WK)}
const modeLabel=m=>{const all=[...ATT_CARDS.map(c=>['Attack',c]),...DEF_CARDS.map(c=>['Defend',c])]; const f=all.find(([,c])=>c[0]===m); return m==='cycle'?'Full cycle':f?`${f[1][1]}`:'Shape'};
const modeSide=m=>m==='cycle'?'cycle':(m==='def'||m.startsWith('dv-'))?'def':'att';
function tacScene(formId,m,opp){
  const F=FORMATIONS.find(f=>f.id===formId)||FORMATIONS[0];
  if(m==='att') return withContext(attackScene(F),{ours:false,oppCount:10});
  if(m==='def') return withContext(defendScene(F),{ours:false,oppCount:10});
  if(m.startsWith('dv-')) return defVarScene(F,m,opp);
  if(m.startsWith('at-')) return attVarScene(F,m,opp);
  if(m==='cycle') return withContext(formationScene(F),{ours:false,oppCount:10});
  return withContext(pressScene(F,m),{ours:false});
}
const cleanSes=S=>({title:S.title,msgs:S.msgs||[],blocks:S.blocks.filter(b=>b.type!=='drill'||drillById(b.id)).map(b=>{const o={type:b.type,label:b.label,min:b.min}; ['id','name','note','int'].forEach(k=>{if(b[k]) o[k]=b[k]}); return o})});
const nextFreeDay=()=>{const used=WK.train.map(t=>t.day); return DAYS.find(d=>!used.includes(d))||'Mon'};
function needCoach(){if(SRV.on){if(SRV.tid) return true; toast('Create a team first'); show('week'); return false} if(isCoach()) return true; toast('Log in to the coach area first'); show('week'); return false}
function addToWeek(item){
  if(!needCoach()) return; loadDraft();
  if(item.t==='train') WK.train.push({day:nextFreeDay(),time:'18:30',place:'',ses:item.ses});
  else WK.items.push(item);
  saveDraft(); toast(item.t==='train'?'Session added to this week’s training':'Added to this week’s post'); if(!$('#v-week').hidden) renderWeek();
}
/* ---------- coach area ---------- */
function renderWeek(){
  const el=$('#weekBody'), C=coachCfg();
  $('#teamBtn').classList.toggle('on',isCoach());
  if(SRV.on){updateTeamBtn(); if(!SRV.tid){el.innerHTML=cloudNoTeam(); return}}
  if(!C){el.innerHTML=`<div class="card authcard"><p class="eyebrow">Coach area</p><h2>Set up your team</h2><p class="muted">Create the coach area on this device. You’ll use the PIN to unlock it. Players never need it: they just open the link you send.</p>
    <label class="fl" for="suTeam">Team name</label><input id="suTeam" class="inp" maxlength="40" placeholder="e.g. Riverside FC U18">
    <label class="fl" for="suName">Your name</label><input id="suName" class="inp" maxlength="40" placeholder="e.g. Coach Jordan">
    <div class="fgrid"><div><label class="fl" for="suPin">PIN (4–8 digits)</label><input id="suPin" class="inp" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password"></div><div><label class="fl" for="suPin2">Repeat PIN</label><input id="suPin2" class="inp" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password"></div></div>
    <div class="frow"><button class="btn" id="suGo">Create coach area</button></div><p class="status" id="authMsg" aria-live="polite"></p>
    <p class="hint">The PIN locks the coach tools in this browser only. Anyone with a week link can view that week.</p></div>`; return}
  if(!isCoach()){el.innerHTML=`<div class="card authcard"><p class="eyebrow">${esc(C.team)}</p><h2>Coach log in</h2><p class="muted">Welcome back, ${esc(C.name)}. Enter your PIN to post this week’s plan.</p>
    <label class="fl" for="liPin">PIN</label><input id="liPin" class="inp pinput" type="password" inputmode="numeric" maxlength="8" autocomplete="current-password">
    <div class="frow"><button class="btn" id="liGo">Log in</button></div><p class="status" id="authMsg" aria-live="polite"></p>
    <p class="hint"><button class="link" id="liReset">Forgot PIN? Reset the coach area</button></p></div>`; setTimeout(()=>{const p=$('#liPin'); if(p) p.focus()},50); return}
  loadDraft();
  const saved=store.get('sessions',[]), plays=store.get('plays',[]), hist=SRV.on?SRV.weeks:store.get('weeks',[]);
  const formOpts=FORMATIONS.map(f=>`<option value="${f.id}">${f.name} ${f.v}</option>`).join('');
  const modeOpts=`<optgroup label="Attack">${ATT_CARDS.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</optgroup><optgroup label="Defend">${DEF_CARDS.map(c=>`<option value="${c[0]}">${c[1]}</option>`).join('')}</optgroup><optgroup label="Other"><option value="cycle">Full cycle</option></optgroup>`;
  const oppOpts=DV_OPPS.map(o=>`<option value="${o}">${FORMATIONS.find(f=>f.id===o).name}</option>`).join('');
  const itemRow=(it,i)=>{const lab=it.t==='tac'?`${(FORMATIONS.find(f=>f.id===it.form)||{}).name||''} · ${modeLabel(it.mode)}`:it.t==='play'?it.title:it.t==='drill'?(drillById(it.id)||{name:'Deleted drill'}).name:'';
    const kind=it.t==='tac'?(modeSide(it.mode)==='def'?'DEF':'ATT'):it.t==='play'?'PLAY':'DRILL';
    return `<li class="wkitem"><div class="wkih"><span class="k ${kind==='DEF'?'d':'a'}">${kind}</span><b>${esc(lab)}</b><span class="bsp"></span><button class="ibtn" data-iu="${i}" aria-label="Move up" ${i===0?'disabled':''}>${IB.up}</button><button class="ibtn" data-id2="${i}" aria-label="Move down" ${i===WK.items.length-1?'disabled':''}>${IB.down}</button><button class="ibtn" data-ix="${i}" aria-label="Remove">${IB.del}</button></div>
      <textarea class="wknote" data-inote="${i}" rows="2" placeholder="Note for the players (optional)">${esc(it.note||'')}</textarea></li>`};
  el.innerHTML=`
  ${SRV.on?cloudBar():`<div class="wkbar"><div><p class="eyebrow">${esc(C.team)}</p><h2>This week’s post</h2></div><div class="wkbar-btns"><button class="btn ghost" id="wkPreview">Preview as player</button><button class="btn ghost" id="wkLogout">Log out</button></div></div>`}
  <div class="split">
    <div class="info">
      <div class="card"><h3>Week & next match</h3>
        <label class="fl" for="wkTitle">Post title</label><input id="wkTitle" class="inp" data-k="title" maxlength="60" placeholder="e.g. Week 12: build-up and pressing" value="${esc(WK.title)}">
        <div class="fgrid">
          <div style="grid-column:1/-1"><label class="fl" for="wkOpp">Opponent</label><input id="wkOpp" class="inp" data-m="opp" maxlength="40" placeholder="e.g. Rovers" value="${esc(WK.match.opp)}"></div>
          <div><label class="fl" for="wkDate">Match date</label><input id="wkDate" class="inp" type="date" data-m="date" value="${esc(WK.match.date)}"></div>
          <div><label class="fl" for="wkTime">Kick-off</label><input id="wkTime" class="inp" type="time" data-m="time" value="${esc(WK.match.time)}"></div>
          <div><label class="fl" for="wkVenue">Venue</label><input id="wkVenue" class="inp" data-m="venue" maxlength="60" value="${esc(WK.match.venue)}"></div>
          <div><label class="fl" for="wkHA">Home / away</label><select id="wkHA" class="sel" data-m="ha">${['Home','Away','Neutral'].map(h=>`<option${WK.match.ha===h?' selected':''}>${h}</option>`).join('')}</select></div>
        </div>
        <label class="fl" for="wkMsg">Message to the players</label><textarea id="wkMsg" data-k="msg" rows="4" placeholder="What we’re working on this week and what I expect from you.">${esc(WK.msg)}</textarea>
      </div>
      ${typeof sheetCard==='function'?sheetCard():''}
      <div class="card"><h3>Training this week</h3>
        ${WK.train.length?`<ol class="wklist">${WK.train.map((t,i)=>{const tot=t.ses.blocks.reduce((a,b)=>a+b.min,0); return `<li class="wktrain"><div class="wkt-row"><select class="sel sm" data-tday="${i}" aria-label="Day">${DAYS.map(d=>`<option${t.day===d?' selected':''}>${d}</option>`).join('')}</select><input class="inp sm" type="time" data-ttime="${i}" value="${esc(t.time||'')}" aria-label="Start time"><input class="inp sm" data-tplace="${i}" placeholder="Location" value="${esc(t.place||'')}" aria-label="Location"><button class="ibtn" data-tx="${i}" aria-label="Remove">${IB.del}</button></div><p><b>${esc(t.ses.title)}</b> <span class="muted">· ${tot} min · ${t.ses.blocks.filter(b=>b.type!=='warm'&&b.type!=='cool').length} blocks</span></p></li>`}).join('')}</ol>`:'<p class="muted">No training added yet.</p>'}
        <div class="frow"><button class="btn ghost" id="wkAddCur">+ Current session</button>${saved.length?`<select class="sel" id="wkSaved" style="flex:1;min-width:160px"><option value="">+ From saved sessions…</option>${saved.map((s,i)=>`<option value="${i}">${esc(s.title)}</option>`).join('')}</select>`:''}</div>
        <p class="hint">Build sessions in the Sessions tab, then add them here. You can also tap “+ Week” on a session.</p>
      </div>
      <div class="card"><h3>Tactics, plays & drills</h3>
        ${WK.items.length?`<ol class="wklist">${WK.items.map(itemRow).join('')}</ol>`:'<p class="muted">Nothing added yet. Add tactics below, or tap “+ Week” on a formation, a coach play or a drill.</p>'}
        <div class="addtac"><p class="fl" style="margin:14px 0 6px">Add a tactic</p>
          <div class="fgrid"><div style="grid-column:1/-1"><select id="atForm" class="sel" aria-label="Formation">${formOpts}</select></div><div><select id="atMode" class="sel" aria-label="Pattern">${modeOpts}</select></div><div><select id="atOpp" class="sel" aria-label="Against">${oppOpts}</select></div></div>
          <div class="frow"><button class="btn ghost" id="atAdd">+ Add tactic</button>${plays.length?`<select class="sel" id="wkPlay" style="flex:1;min-width:160px"><option value="">+ From saved coach plays…</option>${plays.map((p,i)=>`<option value="${i}">${esc(p.title)}</option>`).join('')}</select>`:''}</div>
        </div>
      </div>
    </div>
    <div class="info">
      <div class="card pubcard"><h3>Publish</h3>
        ${SRV.on?`<p class="muted">Publishes a short link for ${esc(C.team)}. Send it in your team group chat: players open it on any phone, no account needed.</p>
        ${WK._slug?`<p class="hint">You’re editing a published week. “Update” keeps the same link, so players see the changes straight away.</p><div class="frow"><button class="btn" id="wkPublish">Update published week</button><button class="btn ghost" id="wkPublishNew">Publish as a new week</button></div>`:`<div class="frow"><button class="btn" id="wkPublish">Publish & get link</button></div>`}
        <div class="frow" style="margin-top:6px"><button class="btn ghost" id="wkClear">Start a new week</button></div>`
        :`<p class="muted">Creates a link with the whole week inside it. Send it in your team group chat: players open it on any phone, no account needed.</p>
        <label class="fl" for="wkSite">Your website address</label><input id="wkSite" class="inp" placeholder="https://yourclub.netlify.app/" value="${esc(C.site||'')}">
        <p class="hint">Links are built from this address. Leave it empty to use the address this page is open on.</p>
        <div class="frow"><button class="btn" id="wkPublish">Publish & get link</button><button class="btn ghost" id="wkClear">Start a new week</button></div>`}
        <div id="wkOut"></div>
      </div>
      <div class="card"><h3>Published weeks</h3>${hist.length?`<div class="saved">${hist.map((h,i)=>`<div class="row"><div><b>${esc(h.title)}</b><small>${new Date(h.posted||h.published).toLocaleDateString(undefined,{day:'numeric',month:'short',year:'numeric'})}${h.views!=null?` · ${h.views} view${h.views===1?'':'s'}`:''}</small></div><div style="display:flex;gap:6px;flex-wrap:wrap"><button class="mini" data-hcopy="${i}">Copy link</button><button class="mini" data-hedit="${i}">Edit</button><button class="mini" data-hdel="${i}">Delete</button></div></div>`).join('')}</div>`:'<p class="muted" style="margin:0">Nothing published yet.</p>'}</div>
      ${SRV.on?cloudSettings():`<div class="card"><h3>Coach settings</h3>
        <div class="fgrid"><div><label class="fl" for="csTeam">Team</label><input id="csTeam" class="inp" value="${esc(C.team)}" maxlength="40"></div><div><label class="fl" for="csName">Coach</label><input id="csName" class="inp" value="${esc(C.name)}" maxlength="40"></div>
        <div><label class="fl" for="csPin">New PIN</label><input id="csPin" class="inp" type="password" inputmode="numeric" maxlength="8" autocomplete="new-password"></div><div style="align-self:end"><button class="btn ghost" id="csSave" style="width:100%">Save</button></div></div>
      </div>`}
    </div>
  </div>`;
}
const linkBase=()=>{const C=coachCfg(); let b=(C&&C.site||'').trim(); if(b){if(!/^https?:\/\//i.test(b)) b='https://'+b; return b.split('#')[0]} return location.href.split('#')[0]};
function weekPayload(){
  const C=coachCfg();
  const ids=new Set(); WK.train.forEach(t=>t.ses.blocks.forEach(b=>{if(b.id) ids.add(b.id)})); WK.items.forEach(i=>{if(i.t==='drill') ids.add(i.id)});
  const drills=[...ids].map(drillById).filter(d=>d&&d.custom).map(d=>{const o={...d}; delete o.areaKey; return o});
  const sheet=typeof sheetPayload==='function'?sheetPayload():null;
  return {v:1,team:C.team,coach:C.name,posted:Date.now(),title:WK.title||'This week',match:WK.match,msg:WK.msg,...(sheet?{sheet}:{}),train:WK.train.slice().sort((a,b)=>DAYS.indexOf(a.day)-DAYS.indexOf(b.day)),items:WK.items.filter(i=>i.t!=='drill'||drillById(i.id)),drills};
}
let qrLoading=null;
function loadQR(){if(window.qrcode) return Promise.resolve(); if(qrLoading) return qrLoading; qrLoading=new Promise((res,rej)=>{const s=document.createElement('script'); s.src=/^https?:$/.test(location.protocol)&&!/claude|anthropic/.test(location.hostname)?'/vendor/qrcode.js':'https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js'; s.onload=res; s.onerror=rej; document.head.appendChild(s)}); return qrLoading}
async function publishWeek(){
  const p=weekPayload(); if(!p.train.length&&!p.items.length&&!p.msg&&!p.sheet){toast('Add training, tactics, a team sheet or a message first'); return}
  const out=$('#wkOut'); out.innerHTML='<p class="muted">Creating link…</p>';
  const packed=await packWeek(p); const url=linkBase()+'#w.'+packed;
  const hist=store.get('weeks',[]); hist.unshift({title:p.title,posted:p.posted,url,wk:JSON.parse(JSON.stringify(WK))}); store.set('weeks',hist.slice(0,20));
  showLink(url,p.title); renderHistoryOnly();
}
function renderHistoryOnly(){const keep=$('#wkOut').innerHTML; renderWeek(); $('#wkOut').innerHTML=keep}
function showLink(url,title){
  const out=$('#wkOut');
  out.innerHTML=`<div class="linkbox"><label class="fl" for="wkLink">Share this link</label><input id="wkLink" class="inp mono" readonly value="${esc(url)}">
    <div class="frow"><button class="btn" id="wkCopy">Copy link</button>${navigator.share?'<button class="btn ghost" id="wkShare">Share…</button>':''}<a class="btn ghost" href="${esc(url)}" target="_blank" rel="noopener">Open</a></div>
    <p class="hint">${url.length.toLocaleString()} characters. ${url.length>2800?'Too long for a QR code: share the link instead.':'Players can also scan the QR code at training.'}</p><div id="wkQR" class="qr"></div></div>`;
  $('#wkCopy').onclick=async()=>{try{await navigator.clipboard.writeText(url); toast('Link copied')}catch(e){const i=$('#wkLink'); i.focus(); i.select(); toast('Press and hold to copy the selected link')}};
  const sh=$('#wkShare'); if(sh) sh.onclick=async()=>{try{await navigator.share({title:title||'This week',text:`${coachCfg().team}: ${title}`,url})}catch(e){}};
  if(url.length<=2800) loadQR().then(()=>{try{const q=qrcode(0,'L'); q.addData(url); q.make(); $('#wkQR').innerHTML=q.createSvgTag({cellSize:4,margin:3,scalable:true})}catch(e){$('#wkQR').innerHTML=''}}).catch(()=>{});
}
function initWeek(){
  $('#teamBtn').onclick=()=>{if(document.body.classList.contains('pmode')) exitPlayer(); show('week'); window.scrollTo({top:0})};
  const body=$('#weekBody');
  body.addEventListener('click',async e=>{
    const msg=t=>{const m=$('#authMsg'); if(m){m.className='status err'; m.textContent=t}};
    if(e.target.closest('#suGo')){const team=$('#suTeam').value.trim(), name=$('#suName').value.trim(), p1=$('#suPin').value, p2=$('#suPin2').value;
      if(!team||!name) return msg('Enter the team name and your name.'); if(!/^\d{4,8}$/.test(p1)) return msg('The PIN must be 4 to 8 digits.'); if(p1!==p2) return msg('The two PINs don’t match.');
      const salt=Math.random().toString(36).slice(2,10); store.set('coach',{team,name,salt,hash:await hashPin(p1,salt),site:''}); ss.set('unlocked','1'); renderWeek(); toast('Coach area created'); return}
    if(e.target.closest('#liGo')){const C=coachCfg(), pin=$('#liPin').value; if(await hashPin(pin,C.salt)===C.hash){ss.set('unlocked','1'); renderWeek(); toast('Logged in')} else {msg('Wrong PIN. Try again.'); $('#liPin').value=''; $('#liPin').focus()} return}
    const rs=e.target.closest('#liReset'); if(rs){if(rs.dataset.sure){['coach','weekdraft','weeks'].forEach(k=>store.set(k,null)); ss.del('unlocked'); renderWeek(); toast('Coach area reset')} else {rs.dataset.sure='1'; rs.textContent='Tap again to delete the coach area and its posts on this device'} return}
    if(e.target.closest('#wkLogout')){ss.del('unlocked'); renderWeek(); toast('Logged out'); return}
    if(e.target.closest('#wkPreview')){const p=weekPayload(); if(SRV.on){openPlayer({...p,team:C2().team})} else {const packed=await packWeek(p); location.hash='w.'+packed} return}
    if(e.target.closest('#wkPublish')){if(SRV.on) await publishCloud(false); else await publishWeek(); return}
    if(e.target.closest('#wkPublishNew')){await publishCloud(true); return}
    if(SRV.on&&await cloudClick(e)) return;
    const cl=e.target.closest('#wkClear'); if(cl){if(cl.dataset.sure){const keep={squad:WK.squad||[],form:(WK.sheet||{}).form,on:(WK.sheet||{}).on}; WK=blankWeek(); WK.squad=keep.squad; if(keep.form) WK.sheet={...ssBlank(keep.form),on:keep.on!==false}; saveDraft(); renderWeek()} else {cl.dataset.sure='1'; cl.textContent='Tap again to clear'; setTimeout(()=>{if(cl.isConnected){delete cl.dataset.sure; cl.textContent='Start a new week'}},3000)} return}
    if(e.target.closest('#wkAddCur')){if(SES){WK.train.push({day:nextFreeDay(),time:'18:30',place:'',ses:cleanSes(SES)}); saveDraft(); renderWeek()} return}
    if(e.target.closest('#atAdd')){WK.items.push({t:'tac',form:$('#atForm').value,mode:$('#atMode').value,opp:$('#atOpp').value,note:''}); saveDraft(); renderWeek(); return}
    const g=k=>{const x=e.target.closest(`[data-${k}]`); return x?+x.dataset[k]:null}; let i;
    if((i=g('tx'))!==null){WK.train.splice(i,1); saveDraft(); renderWeek(); return}
    if((i=g('ix'))!==null){WK.items.splice(i,1); saveDraft(); renderWeek(); return}
    if((i=g('iu'))!==null&&i>0){[WK.items[i-1],WK.items[i]]=[WK.items[i],WK.items[i-1]]; saveDraft(); renderWeek(); return}
    if((i=g('id2'))!==null&&i<WK.items.length-1){[WK.items[i+1],WK.items[i]]=[WK.items[i],WK.items[i+1]]; saveDraft(); renderWeek(); return}
    if((i=g('hcopy'))!==null){const h=(SRV.on?SRV.weeks:store.get('weeks',[]))[i]; try{await navigator.clipboard.writeText(h.url); toast('Link copied')}catch(err){showLink(h.url,h.title); $('#wkOut').scrollIntoView({behavior:'smooth'})} return}
    if((i=g('hedit'))!==null&&SRV.on){try{const r=await api('GET','/api/weeks/'+SRV.weeks[i].slug); WK=r.draft||blankWeek(); WK._slug=r.slug; saveDraft(); renderWeek(); toast('Loaded. “Update” keeps the same link.'); window.scrollTo({top:0,behavior:'smooth'})}catch(err){toast(err.message)} return}
    if((i=g('hedit'))!==null){WK=JSON.parse(JSON.stringify(store.get('weeks',[])[i].wk)); saveDraft(); renderWeek(); toast('Loaded. Publish again to get an updated link.'); window.scrollTo({top:0,behavior:'smooth'}); return}
    const hd=e.target.closest('[data-hdel]'); if(hd&&SRV.on){if(hd.dataset.sure){try{const sl=SRV.weeks[+hd.dataset.hdel].slug; await api('DELETE','/api/weeks/'+sl); if(WK._slug===sl){delete WK._slug; saveDraft()} await refreshWeeks(); renderWeek(); toast('Week deleted. Its link no longer works.')}catch(err){toast(err.message)}} else {hd.dataset.sure='1'; hd.textContent='Tap to confirm'} return}
    if(hd){if(hd.dataset.sure){const h=store.get('weeks',[]); h.splice(+hd.dataset.hdel,1); store.set('weeks',h); renderHistoryOnly()} else {hd.dataset.sure='1'; hd.textContent='Tap to confirm'} return}
    if(e.target.closest('#csSave')){const C=coachCfg(); C.team=$('#csTeam').value.trim()||C.team; C.name=$('#csName').value.trim()||C.name; const np=$('#csPin').value; if(np){if(!/^\d{4,8}$/.test(np)){toast('The PIN must be 4 to 8 digits');return} C.salt=Math.random().toString(36).slice(2,10); C.hash=await hashPin(np,C.salt)} store.set('coach',C); renderWeek(); toast('Settings saved'); return}
  });
  body.addEventListener('keydown',e=>{if(e.key==='Enter'&&e.target.id==='liPin') $('#liGo').click()});
  if(typeof initSheet==='function') initSheet();
  body.addEventListener('input',e=>{const t=e.target;
    if(t.dataset.k){WK[t.dataset.k]=t.value; saveDraft(); return}
    if(t.dataset.m){WK.match[t.dataset.m]=t.value; saveDraft(); return}
    if(t.dataset.inote!=null){WK.items[+t.dataset.inote].note=t.value; saveDraft(); return}
    if(t.dataset.ttime!=null){WK.train[+t.dataset.ttime].time=t.value; saveDraft(); return}
    if(t.dataset.tplace!=null){WK.train[+t.dataset.tplace].place=t.value; saveDraft(); return}
    if(t.id==='wkSite'){const C=coachCfg(); C.site=t.value.trim(); store.set('coach',C)}
  });
  body.addEventListener('change',e=>{const t=e.target;
    if(t.dataset.m){WK.match[t.dataset.m]=t.value; saveDraft(); return}
    if(t.dataset.tday!=null){WK.train[+t.dataset.tday].day=t.value; saveDraft(); return}
    if(t.id==='wkSaved'&&t.value!==''){const S=store.get('sessions',[])[+t.value]; if(S){WK.train.push({day:nextFreeDay(),time:'18:30',place:'',ses:cleanSes(S)}); saveDraft(); renderWeek()}}
    if(t.id==='wkPlay'&&t.value!==''){const P=store.get('plays',[])[+t.value]; if(P){WK.items.push({t:'play',title:P.title,play:{title:P.title,e:P.e,b:P.b,f:P.f},note:''}); saveDraft(); renderWeek()}}
  });
  // "+ Week" buttons elsewhere
  document.addEventListener('click',e=>{
    const w=e.target.closest('[data-addweek]'); if(!w) return;
    const k=w.dataset.addweek;
    if(k==='tac') addToWeek({t:'tac',form:curF.id,mode:fMode,opp:fOpp,note:''});
    else if(k==='play'&&play) addToWeek({t:'play',title:play.title||'Coach play',play:JSON.parse(JSON.stringify({title:play.title,e:play.e,b:play.b,f:play.f})),note:''});
    else if(k==='ses'&&SES) addToWeek({t:'train',ses:cleanSes(SES)});
    else if(k==='drill'&&curD) addToWeek({t:'drill',id:curD.id,note:''});
  });
}
/* ---------- player view ---------- */
function fmtDate(d){if(!d) return ''; const x=new Date(d+'T12:00:00'); return isNaN(x)?d:x.toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'long'})}
function stopPv(){pvBoards.forEach(b=>b.stop()); pvBoards=[]; if(pvIO){pvIO.disconnect(); pvIO=null}}
async function openPlayer(data){
  const raw=location.hash.slice(3);
  let W=data; if(!W) try{W=await unpackWeek(raw)}catch(err){document.body.classList.add('pmode'); $('#pv').hidden=false; $('#pv').innerHTML=`<div class="wrap pvwrap"><div class="card"><h2>This link can’t be opened</h2><p class="muted" style="margin-top:8px">${esc(err&&err.message&&/old/.test(err.message)?err.message:'The link may be incomplete. Ask your coach to send it again, and make sure you copy the whole link.')}</p><div class="frow"><button class="btn" data-exitpv>Open Touchline Studio</button></div></div></div>`; return}
  PV=W;
  (W.drills||[]).forEach(d=>{if(!DRILLS.some(x=>x.id===d.id)) DRILLS.push({...d,custom:true,shared:true})});
  Object.values(boards).forEach(b=>b&&b.stop&&b.stop()); stopPv();
  document.body.classList.add('pmode'); $('#pv').hidden=false; window.scrollTo({top:0});
  const M=W.match||{};
  const trainHtml=(W.train||[]).map((t,ti)=>{const S=t.ses, tot=S.blocks.reduce((a,b)=>a+b.min,0); let tt=0;
    const strip=S.blocks.map(b=>{const r=blockRPE(b), c=r<=3?'lo':r<=5?'md':'hi'; return `<i class="${c}" style="flex:${b.min}"></i>`}).join('');
    return `<article class="card pvtrain"><div class="pvday"><b>${esc(t.day)}</b><span>${esc(t.time||'')}</span></div><div class="pvtmain"><h3 class="pvh">${esc(S.title)}</h3><p class="muted">${tot} min${t.place?` · ${esc(t.place)}`:''}</p>
      <div class="istrip" style="margin:10px 0">${strip}</div>
      ${S.msgs&&S.msgs.length?`<div class="pvmsgs">${li(S.msgs,'teal')}</div>`:''}
      <ol class="pvblocks">${S.blocks.map(b=>{const st=tt; tt+=b.min; const d=b.type==='drill'?drillById(b.id):null;
        return `<li>${d?`<button class="pvb" data-pvd="${d.id}"><span class="bprev">${miniPreview(d.sc)}</span>`:'<div class="pvb static">'}<span class="pvbi"><small class="mono">${st}′ · ${b.min} min · ${esc(b.label)}</small><b>${esc(d?d.name:b.type==='custom'?b.name:b.label)}</b>${b.note?`<em>${esc(b.note)}</em>`:''}</span>${d?'<span class="pvgo">View</span></button>':'</div>'}</li>`}).join('')}</ol></div></article>`}).join('');
  const boardItems=(W.items||[]).filter(i=>i.t!=='drill');
  const drillItems=(W.items||[]).filter(i=>i.t==='drill'&&drillById(i.id));
  $('#pv').innerHTML=`<div class="pvtop"><div class="wrap pvtopin"><span class="brand"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="#e7b53c" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="none" stroke="#e7b53c" stroke-width="2"/><path d="M20 2v36" stroke="#e7b53c" stroke-width="2"/><circle cx="29" cy="13" r="3.2" fill="#ec5157"/></svg><span><b>${esc(W.team||'Team')}</b><i>PLAYER VIEW</i></span></span>${isCoach()&&!window.__WEEK__?'<button class="btn ghost sm2" data-backcoach>Back to coach area</button>':''}</div></div>
  <div class="wrap pvwrap">
    <section class="pvhero"><p class="eyebrow">${esc(W.team||'')} · This week</p><h1>${esc(W.title)}</h1><p class="muted">Posted by ${esc(W.coach||'your coach')} · ${new Date(W.posted).toLocaleDateString(undefined,{weekday:'short',day:'numeric',month:'short'})}</p></section>
    ${M.opp?`<section class="pvmatch"><p class="eyebrow">Next match</p><div class="pvm"><b>${esc(M.ha==='Away'?'@ ':'v ')}${esc(M.opp)}</b><span class="tag ${M.ha==='Home'?'lo':M.ha==='Away'?'hi':'md'}">${esc(M.ha||'')}</span></div><p>${[fmtDate(M.date),M.time&&('Kick-off '+M.time),M.venue].filter(Boolean).map(esc).join(' · ')}</p></section>`:''}
    ${W.sheet&&typeof sheetSection==='function'?sheetSection(W.sheet,W):''}
    ${W.msg?`<section class="card pvmsg"><h3>From ${esc(W.coach||'the coach')}</h3><p>${esc(W.msg).replace(/\n/g,'<br>')}</p></section>`:''}
    ${trainHtml?`<div class="sechead"><h2>Training</h2><span class="muted">${W.train.length} session${W.train.length>1?'s':''}</span></div><div class="pvlist">${trainHtml}</div>`:''}
    ${boardItems.length?`<div class="sechead"><h2>Tactics to study</h2><span class="muted">Tap play on each board</span></div><div class="pvtacs">${boardItems.map((it,i)=>`<article class="card pvtac"><p class="eyebrow" style="color:var(--${it.t==='tac'&&modeSide(it.mode)==='def'?'red':'teal'})">${it.t==='tac'?(modeSide(it.mode)==='def'?'Defending':modeSide(it.mode)==='att'?'Attacking':'Full cycle'):'Coach play'}</p><h3 class="pvh">${esc(it.t==='tac'?`${(FORMATIONS.find(f=>f.id===it.form)||{}).name||''} · ${modeLabel(it.mode)}`:it.title)}</h3>${it.note?`<p class="pvnote">${esc(it.note)}</p>`:''}<div class="pvboard" data-pvi="${i}"></div></article>`).join('')}</div>`:''}
    ${drillItems.length?`<div class="sechead"><h2>Drills to practise</h2></div><div class="dgrid">${drillItems.map(it=>drillCard(drillById(it.id),false)).join('')}</div>${drillItems.some(i=>i.note)?`<div class="card" style="margin-top:12px">${drillItems.filter(i=>i.note).map(i=>`<p><b>${esc(drillById(i.id).name)}:</b> ${esc(i.note)}</p>`).join('')}</div>`:''}`:''}
    <div class="pvfoot"><button class="btn ghost" data-exitpv>Open the full Touchline Studio</button></div>
    <p class="pvlegal">Something wrong or worrying on this page? <button class="link" data-report="concern">Report a concern</button> · <a href="/privacy">Privacy</a> · <a href="/safeguarding">Safeguarding</a><br><a class="kcredit" href="https://keefecodes.com/" target="_blank" rel="noopener">Created by <b>KeefeCodes</b></a></p>
  </div>`;
  $$('.pvboard',$('#pv')).forEach(host=>{const it=boardItems[+host.dataset.pvi]; const sc=it.t==='tac'?tacScene(it.form,it.mode,it.opp):(()=>{const s={...it.play,view:'full'}; return (typeof autoShift==='function')?autoShift(s):s})();
    const b=new Board(host,{}); b.load({...sc,tag:it.t==='tac'?(FORMATIONS.find(f=>f.id===it.form)||{}).name:it.title},false); pvBoards.push(b); host._b=b});
  if('IntersectionObserver' in window&&!RM){pvIO=new IntersectionObserver(es=>es.forEach(en=>{const b=en.target._b; if(!b) return; if(en.isIntersecting&&en.intersectionRatio>.55) b.play(); else b.stop()}),{threshold:[0,.55,.9]}); $$('.pvboard',$('#pv')).forEach(h=>pvIO.observe(h))}
  document.title=`${W.title} · ${W.team||'Touchline Studio'}`;
}
function exitPlayer(){stopPv(); document.body.classList.remove('pmode'); $('#pv').hidden=true; $('#pv').innerHTML=''; document.title='Touchline Studio'}
function initPlayer(){
  $('#pv').addEventListener('click',e=>{
    const d=e.target.closest('[data-pvd]')||e.target.closest('#pv [data-d]'); if(d){openDrill(d.dataset.pvd||d.dataset.d); return}
    if(e.target.closest('[data-exitpv]')){if(window.__WEEK__){location.href='/'; return} exitPlayer(); history.replaceState(null,'','#formations'); show('formations'); return}
    if(e.target.closest('[data-backcoach]')){exitPlayer(); history.replaceState(null,'','#week'); show('week'); window.scrollTo({top:0})}
  });
}

/* ---------- cloud-mode pieces of the Team week page ---------- */
const C2=()=>coachCfg()||{team:'',name:''};
const TEAM_COLORS=['#e7b53c','#ec5157','#40d6a5','#5aa9ff','#b38cff','#ff8a3d','#f2f2f2'];
function cloudNoTeam(){return `<div class="card authcard"><p class="eyebrow">Welcome, ${esc(SRV.user.name)}</p><h2>Create your first team</h2><p class="muted">Each team gets its own weekly posts and player links. Your drills, plays and sessions are shared across all your teams.</p>
  ${activeTeams().length===0&&SRV.teams.some(t=>t.archived&&t.owner)?`<p class="hint">You have archived teams. Restore one below or create a new one.</p>`:''}
  <label class="fl" for="tmName">Team name</label><input id="tmName" class="inp" maxlength="60" placeholder="e.g. Riverside FC U18">
  <p class="fl" style="margin:12px 0 6px">Colour</p><div class="swatches" id="tmColors">${TEAM_COLORS.map((c,i)=>`<button type="button" class="sw" data-col="${c}" aria-pressed="${i===0}" style="--c:${c}" aria-label="Colour ${c}"></button>`).join('')}</div>
  <div class="frow"><button class="btn" id="tmAdd">Create team</button></div>
  ${SRV.teams.filter(t=>t.archived&&t.owner).map(t=>`<div class="row teamrow"><span class="tdot" style="--c:${t.color}"></span><b>${esc(t.name)}</b><span class="bsp"></span><button class="mini" data-trest="${t.id}">Restore</button></div>`).join('')}
  <div class="frow"><button class="btn ghost" id="acLogout">Log out</button></div></div>`}
function cloudBar(){const t=curTeam(), act=activeTeams();
  return `<div class="wkbar"><div><p class="eyebrow">Team week <span class="syncdot" id="syncDot" data-s="saved" title="All changes saved"></span></p><h2>${esc(t.name)}</h2></div><div class="wkbar-btns"><a class="btn ghost" href="/guide" target="_blank" rel="noopener">How to use</a><button class="btn ghost" id="wkPreview">Preview as player</button></div></div>
  <div class="teamsw" role="tablist" aria-label="Your teams">${act.map(x=>`<button role="tab" class="tchip" data-team="${x.id}" aria-selected="${x.id===SRV.tid}" style="--c:${x.color}"><span class="tdot"></span>${esc(x.name)}${x.owner?'':'<small class="asst">Asst</small>'}</button>`).join('')}<button class="tchip add" data-goteams>+ Add team</button></div>`}
function coachesCard(){const t=curTeam(), M=SRV.members; if(!t||!M) return '';
  const own=M.you==='owner';
  const rows=[`<div class="row teamrow"><span class="cav">${esc((M.owner.name||'?')[0])}</span><span class="cinfo"><b>${esc(M.owner.name)}</b><small>Head coach${M.owner.id===SRV.user.id?' · you':''}</small></span></div>`,
    ...M.members.map(m=>`<div class="row teamrow"><span class="cav a">${esc((m.name||'?')[0])}</span><span class="cinfo"><b>${esc(m.name)}</b><small>Assistant coach${m.id===SRV.user.id?' · you':''}${own?' · '+esc(m.email):''}</small></span><span class="bsp"></span>${own?`<button class="mini" data-mrem="${m.id}">Remove</button>`:''}</div>`),
    ...M.invites.map(i=>`<div class="row teamrow"><span class="cav p">@</span><span class="cinfo"><b>${esc(i.email)}</b><small>Invited · waiting to accept</small></span><span class="bsp"></span><button class="mini" data-ires="${esc(i.email)}">Resend</button><button class="mini" data-irev="${i.id}">Cancel</button></div>`)];
  return `<div class="card" id="coachesCard"><h3>Coaches · ${esc(t.name)}</h3><div class="saved">${rows.join('')}</div>
    ${own?`<label class="fl" for="invEmail">Invite an assistant coach</label><div class="frow" style="margin-top:0"><input id="invEmail" class="inp" type="email" style="flex:1;min-width:160px" placeholder="their@email.com" maxlength="200"><button class="btn ghost" id="invGo">Send invite</button></div>
    <p class="hint">Assistants can build and publish this team’s weekly plan. They don’t count towards your team limit. Up to ${M.max} per team.</p><div id="invOut"></div>`
    :`<p class="hint">You’re an assistant coach for this team. ${esc(M.owner.name)} manages it.</p><div class="frow"><button class="btn ghost" id="leaveTeam">Leave this team</button></div>`}</div>`}
function cloudSettings(){const t=curTeam(), act=activeTeams(), mine=act.filter(x=>x.owner), arch=SRV.teams.filter(x=>x.archived&&x.owner), full=mine.length>=SRV.limit;
  return `${typeof billingCard==='function'?billingCard():''}${coachesCard()}<div class="card" id="teamsCard"><h3>My teams</h3>
    <p class="muted" style="margin-bottom:10px">You run ${mine.length} of ${SRV.limit} team${SRV.limit>1?'s':''} · ${SRV.plan&&SRV.plan.payments?esc(SRV.plan.label)+' plan':'free while we test'}</p>
    <div class="saved">${act.map(x=>`<div class="row teamrow"><span class="tdot" style="--c:${x.color}"></span><span class="cinfo"><b>${esc(x.name)}</b><small>${x.owner?'Head coach':'Assistant · '+esc(x.ownerName||'')}${x.id===SRV.tid?' · current':''}</small></span><span class="bsp"></span>${x.id!==SRV.tid?`<button class="mini" data-team="${x.id}">Open</button>`:''}${x.owner?`<button class="mini" data-tarch="${x.id}">Archive</button>`:''}</div>`).join('')}</div>
    ${full?`<p class="hint" style="margin-top:10px">You’ve reached your ${SRV.limit}-team limit. Archive a team to add another${SRV.plan&&SRV.plan.payments?', or <button class="link" data-upgrade>upgrade your plan</button>':''}.</p>`:`<div class="frow" style="align-items:end"><div style="flex:2;min-width:160px"><label class="fl" for="tmName">New team</label><input id="tmName" class="inp" maxlength="60" placeholder="Team name"></div><button class="btn ghost" id="tmAdd">+ Add team</button></div><div class="swatches" id="tmColors" style="margin-top:8px">${TEAM_COLORS.map((c,i)=>`<button type="button" class="sw" data-col="${c}" aria-pressed="${i===0}" style="--c:${c}" aria-label="Colour ${c}"></button>`).join('')}</div>`}
    ${t&&t.owner?`<label class="fl" for="tmRename">Rename ${esc(t.name)}</label><div class="frow" style="margin-top:0"><input id="tmRename" class="inp" style="flex:1;min-width:140px" maxlength="60" value="${esc(t.name)}"><button class="btn ghost" id="tmRenameGo">Save</button></div>`:''}
    ${arch.length?`<p class="fl" style="margin:14px 0 6px">Archived</p><div class="saved">${arch.map(x=>`<div class="row teamrow"><span class="tdot" style="--c:${x.color}"></span><b>${esc(x.name)}</b><span class="bsp"></span><button class="mini" data-trest="${x.id}">Restore</button></div>`).join('')}</div>`:''}
  </div>
  <div class="card"><h3>Account</h3><p class="muted" style="margin-bottom:6px">${esc(SRV.user.email)}</p>
    <label class="fl" for="acName">Your name</label><div class="frow" style="margin-top:0"><input id="acName" class="inp" style="flex:1;min-width:140px" maxlength="60" value="${esc(SRV.user.name)}"><button class="btn ghost" id="acNameGo">Save</button></div>
    <div class="fgrid"><div><label class="fl" for="acCur">Current password</label><input id="acCur" class="inp" type="password" autocomplete="current-password"></div><div><label class="fl" for="acNew">New password</label><input id="acNew" class="inp" type="password" autocomplete="new-password" minlength="8"></div></div>
    <div class="frow"><button class="btn ghost" id="acPwGo">Change password</button><button class="btn ghost" id="acLogout">Log out</button></div>
  </div>
  <div class="card"><h3>Your data &amp; help</h3>
    <p class="muted">You agreed to the terms on ${SRV.user.termsAcceptedAt?new Date(SRV.user.termsAcceptedAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}):'(not recorded)'}. <a href="/terms" target="_blank" rel="noopener">Terms</a> · <a href="/privacy" target="_blank" rel="noopener">Privacy</a> · <a href="/safeguarding" target="_blank" rel="noopener">Safeguarding</a></p>
    <div class="frow"><a class="btn ghost" href="/api/account/export" download>Download my data</a><button class="btn ghost" data-report="feedback">Send feedback</button><button class="btn ghost" data-report="privacy">Privacy request</button></div>
    <details class="danger"><summary>Delete my account</summary>
      <p class="muted" style="margin:8px 0">This permanently deletes your account, your library and every team you run, including their player links. Assistants lose access to those teams. It can’t be undone.</p>
      <label class="fl" for="acDelPw">Type your password to confirm</label>
      <div class="frow" style="margin-top:0"><input id="acDelPw" class="inp" type="password" autocomplete="current-password" style="flex:1;min-width:140px"><button class="btn danger" id="acDelGo">Delete everything</button></div>
    </details>
  </div>`}
async function publishCloud(asNew){
  const p=weekPayload(); if(!p.train.length&&!p.items.length&&!p.msg&&!p.sheet){toast('Add training, tactics, a team sheet or a message first'); return}
  const draft=JSON.parse(JSON.stringify(WK)); delete draft._slug;
  try{
    const r=(WK._slug&&!asNew)?await api('PUT','/api/weeks/'+WK._slug,{data:p,draft}):await api('POST',`/api/teams/${SRV.tid}/weeks`,{data:p,draft});
    WK._slug=r.slug; saveDraft(); await refreshWeeks(); renderWeek(); showLink(r.url,p.title); $('#wkOut').scrollIntoView({behavior:'smooth',block:'center'});
    toast(asNew||!draft||!r?'Published':'Published');
  }catch(err){toast(err.message)}
}
async function cloudClick(e){
  const t=e.target;
  const tm=t.closest('[data-team]'); if(tm){await setTeam(tm.dataset.team); toast(`Switched to ${curTeam().name}`); return true}
  if(t.closest('[data-goteams]')){const c=$('#teamsCard'); if(c){c.scrollIntoView({behavior:'smooth',block:'center'}); const n=$('#tmName'); if(n) setTimeout(()=>n.focus(),400)} return true}
  const sw=t.closest('[data-col]'); if(sw){$$('#tmColors .sw').forEach(b=>b.setAttribute('aria-pressed',b===sw)); return true}
  if(t.closest('#tmAdd')){const name=($('#tmName')||{}).value?.trim(); if(!name){toast('Give the team a name'); return true}
    const col=($('#tmColors .sw[aria-pressed="true"]')||{}).dataset?.col||'#e7b53c';
    try{const r=await api('POST','/api/teams',{name,color:col}); await refreshTeams(); await setTeam(r.team.id); toast(`${r.team.name} created`)}catch(err){toast(err.message)} return true}
  if(t.closest('#tmRenameGo')){try{await api('PATCH','/api/teams/'+SRV.tid,{name:$('#tmRename').value}); await refreshTeams(); renderWeek(); toast('Team renamed')}catch(err){toast(err.message)} return true}
  const ar=t.closest('[data-tarch]'); if(ar){if(!ar.dataset.sure){ar.dataset.sure='1'; ar.textContent='Tap to archive'; return true}
    try{await api('POST',`/api/teams/${ar.dataset.tarch}/archive`); await refreshTeams(); const next=activeTeams()[0]; await setTeam(ar.dataset.tarch===SRV.tid?(next?next.id:null):SRV.tid); toast('Team archived. Its published links keep working.')}catch(err){toast(err.message)} return true}
  const rs=t.closest('[data-trest]'); if(rs){try{await api('POST',`/api/teams/${rs.dataset.trest}/restore`); await refreshTeams(); await setTeam(rs.dataset.trest); toast('Team restored')}catch(err){toast(err.message)} return true}
  if(t.closest('#acNameGo')){try{const r=await api('PATCH','/api/account',{name:$('#acName').value}); SRV.user=r.user; renderWeek(); toast('Name saved')}catch(err){toast(err.message)} return true}
  if(t.closest('#acPwGo')){try{await api('PATCH','/api/account',{currentPassword:$('#acCur').value,newPassword:$('#acNew').value}); $('#acCur').value=''; $('#acNew').value=''; toast('Password changed. Other devices have been logged out.')}catch(err){toast(err.message)} return true}
  if(t.closest('#invGo')){const em=$('#invEmail').value.trim(); if(!em){toast('Enter their email');return true}
    try{const r=await api('POST',`/api/teams/${SRV.tid}/invites`,{email:em}); await refreshMembers(); renderWeek(); showInvite(r.link,r.invite.email)}catch(err){toast(err.message)} return true}
  const ires=t.closest('[data-ires]'); if(ires){try{const r=await api('POST',`/api/teams/${SRV.tid}/invites`,{email:ires.dataset.ires}); await refreshMembers(); renderWeek(); showInvite(r.link,r.invite.email)}catch(err){toast(err.message)} return true}
  const irev=t.closest('[data-irev]'); if(irev){try{await api('DELETE',`/api/teams/${SRV.tid}/invites/${irev.dataset.irev}`); await refreshMembers(); renderWeek(); toast('Invite cancelled')}catch(err){toast(err.message)} return true}
  const mrem=t.closest('[data-mrem]'); if(mrem){if(!mrem.dataset.sure){mrem.dataset.sure='1'; mrem.textContent='Tap to remove'; return true}
    try{await api('DELETE',`/api/teams/${SRV.tid}/members/${mrem.dataset.mrem}`); await refreshMembers(); renderWeek(); toast('Coach removed from the team')}catch(err){toast(err.message)} return true}
  const lv=t.closest('#leaveTeam'); if(lv){if(!lv.dataset.sure){lv.dataset.sure='1'; lv.textContent='Tap again to leave'; return true}
    try{await api('POST',`/api/teams/${SRV.tid}/leave`); await refreshTeams(); const next=activeTeams()[0]; await setTeam(next?next.id:null); toast('You’ve left the team')}catch(err){toast(err.message)} return true}
  if(t.closest('#acDelGo')){const pw=$('#acDelPw').value; if(!pw){toast('Type your password first'); return true}
    if(!confirm('Delete your account and all your teams for good?')) return true;
    try{await api('POST','/api/account/delete',{password:pw}); try{Object.keys(localStorage).filter(k=>k.startsWith('tls:')).forEach(k=>localStorage.removeItem(k))}catch(e){} alert('Your account has been deleted.'); location.href='/'}catch(err){toast(err.message)} return true}
  if(t.closest('#acLogout')){try{await api('POST','/api/logout')}catch(err){} location.href='/app'; return true}
  return false;
}

function showInvite(link,email){
  const out=$('#invOut'); if(!out) return;
  out.innerHTML=`<div class="linkbox"><p class="status" style="margin:0">Invite sent to ${esc(email)}. If it doesn’t arrive, send them this link yourself (it works for 14 days):</p><input id="invLink" class="inp mono" readonly value="${esc(link)}"><div class="frow"><button class="btn ghost" id="invCopy">Copy invite link</button>${navigator.share?'<button class="btn ghost" id="invShare">Share…</button>':''}</div></div>`;
  $('#invCopy').onclick=async()=>{try{await navigator.clipboard.writeText(link); toast('Invite link copied')}catch(e){const i=$('#invLink'); i.focus(); i.select()}};
  const sh=$('#invShare'); if(sh) sh.onclick=async()=>{try{await navigator.share({title:'Coach invite',text:`Join me as a coach for ${curTeam().name} on Touchline Studio`,url:link})}catch(e){}};
  out.scrollIntoView({behavior:'smooth',block:'center'});
}
