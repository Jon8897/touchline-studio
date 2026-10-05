/* ===== Fitness plans ===== */
const FIT_GROUPS=[{id:'gk',n:'Goalkeeper',pos:['gk']},{id:'cb',n:'Centre-back',pos:['cb']},{id:'fb',n:'Full-back / Wing-back',pos:['fb','wb']},{id:'mid',n:'Midfielder (6 / 8)',pos:['dm','cm']},{id:'wide',n:'Winger / 10',pos:['w','am']},{id:'st',n:'Striker',pos:['st']}];
const WEEKS=[
 {n:'Rebuild',e:'80–85%',f:'Aerobic base, tendons and technique. Runs at 80–85% effort. Finish every session feeling you could do more.'},
 {n:'Build',e:'90%',f:'More volume. Repeated sprints come in and strength work gets heavier. Runs at about 90%.'},
 {n:'Intensity',e:'95%',f:'Less jogging, more high-speed running and shorter rests. Sleep and food matter most this week.'},
 {n:'Match sharp',e:'100%',f:'Full-speed sprints, match-like work, lower total volume. You should feel fresh and quick by the weekend.'}
];
const COND={
 gk:{n:'Reaction & dive circuit',d:'Set position → shuffle 2 m → dive and save, alternating sides → back to your feet.',tm:w=>({work:20,rest:40,rounds:[6,8,10,12][w],sets:[2,2,3,3][w],sr:120})},
 cb:{n:'Accelerate, turn & jump',d:'Backpedal 5 m, turn, sprint 10 m, then 3 maximal header jumps.',tm:w=>({work:12,rest:48,rounds:[6,8,8,10][w],sets:[1,2,2,3][w],sr:180})},
 fb:{n:'Overlap repeat sprints',d:'Sprint 40 m down the touchline as if overlapping, jog 20 m back.',tm:w=>({work:7,rest:23,rounds:[6,8,8,10][w],sets:[2,2,3,3][w],sr:180})},
 mid:{n:'Box-to-box 4 × 4',d:'4 min hard but steady (you can say 2–3 words), then 3 min easy jog.',tm:w=>({work:240,rest:180,rounds:[3,4,4,4][w],sets:1})},
 wide:{n:'Sprint & recover',d:'30 m sprint with a curved finish, walk back slowly.',tm:w=>({work:6,rest:54,rounds:[6,8,10,10][w],sets:[1,2,2,3][w],sr:180})},
 st:{n:'Spin, sprint, finish',d:'Back to goal, spin, sprint 20 m and strike a ball (or touch a cone).',tm:w=>({work:8,rest:52,rounds:[6,8,10,12][w],sets:[1,1,2,2][w],sr:150})}
};
const STR_A=['Goblet squat','Romanian deadlift','Rear-foot split squat','Nordic hamstring curl','Plank'];
const STR_X={gk:['Lateral bound (stick the landing)','Med-ball overhead throw'],cb:['Trap-bar deadlift','Box jump'],fb:['Single-leg hip thrust','Lateral lunge'],mid:['Step-up','Pallof press'],wide:['Single-leg hip thrust','Bounding'],st:['Hip thrust','Rotational med-ball throw']};
const AGIL={gk:'Drop-step and dive',cb:'Backpedal 5 m, hip turn, sprint 10 m',fb:'Jockey 5 m, turn, sprint 20 m',mid:'5-10-5 shuttle',wide:'Cone weave into a curved sprint',st:'Check 5 m, spin, sprint 15 m'};
function rx(name,w){
  if(/Nordic/.test(name)) return `${[2,2,3,3][w]} × ${[3,4,5,6][w]} slow lowers`;
  if(/Plank|Pallof/.test(name)) return `${[2,3,3,3][w]} × ${[30,40,45,45][w]} s`;
  if(/Copenhagen/.test(name)) return `${[2,2,3,3][w]} × ${[15,20,25,30][w]} s each side`;
  if(/calf/i.test(name)) return `${[2,3,3,3][w]} × ${[15,15,12,12][w]} each leg`;
  if(/bound|jump|throw|Bounding/i.test(name)) return `${[2,3,3,3][w]} × ${[5,6,6,5][w]}, full rest`;
  return `${[2,3,3,3][w]} × ${[12,10,8,6][w]}${/split|Step-up|Single-leg|Lateral lunge/.test(name)?' each leg':''}`;
}
function plan(g,w){
  const C=COND[g], gp=FIT_GROUPS.find(x=>x.id===g);
  const drills=DRILLS.filter(d=>d.cat!=='Team'&&d.pos.some(p=>gp.pos.includes(p)));
  const d1=drills[0], d2=drills[1]||drills[0];
  const aer=[{work:60,rest:60,rounds:8},{work:90,rest:60,rounds:8},{work:120,rest:60,rounds:8},{work:15,rest:15,rounds:20,sets:2,sr:180}][w];
  if(g==='gk'){aer.rounds=Math.max(6,aer.rounds-2)}
  const aerTxt=w<3?`${aer.rounds} × ${aer.work}s run / ${aer.rest}s walk at ${WEEKS[w].e} effort`:`2 sets of 20 × 15 s fast / 15 s jog, 3 min between sets`;
  return [
   {d:'Mon',t:'Aerobic + ball work',s:[
     {n:'Warm-up',x:'10 min: jog, dynamic stretches, 3 × 20 m build-ups'},
     {n:'Aerobic intervals',x:aerTxt,tm:{...aer,name:'Aerobic intervals'}},
     {n:'Ball work: '+d1.name,x:`${d1.time} from the drill library. Focus: ${d1.focus.toLowerCase()}.`,drill:d1.id}]},
   {d:'Tue',t:'Strength A',s:[
     {n:'Warm-up',x:'8 min: bike or skipping, glute bridges, leg swings'},
     ...STR_A.map(e=>({n:e,x:rx(e,w)})),
     {n:'Copenhagen side plank',x:rx('Copenhagen',w)}]},
   {d:'Wed',t:'Position conditioning',s:[
     {n:'Warm-up',x:'12 min including 4 × 30 m strides at 70–80%'},
     {n:C.n,x:`${C.d} ${C.tm(w).rounds} reps × ${C.tm(w).sets} set${C.tm(w).sets>1?'s':''} at ${WEEKS[w].e}.`,tm:{...C.tm(w),name:C.n}},
     {n:'Core',x:`Dead bug ${[2,3,3,3][w]} × 10 · side plank ${[2,3,3,3][w]} × ${[20,30,30,40][w]} s each side`}]},
   {d:'Thu',t:'Recovery',rest:true,s:[
     {n:'Mobility flow',x:'20 min: hips, ankles, hamstrings and upper back'},
     {n:'Optional easy cardio',x:'20–30 min easy bike, swim or brisk walk. Conversation pace.'}]},
   {d:'Fri',t:'Speed, agility & strength B',s:[
     {n:'Warm-up',x:'12 min, finishing with A-skips and B-skips'},
     {n:'Acceleration',x:`${[4,6,6,8][w]} × 10 m from a split stance. Walk back; full rest.`,tm:{work:3,rest:57,rounds:[4,6,6,8][w],sets:1,name:'Acceleration 10 m'}},
     ...(w?[{n:'Flying sprints',x:`${[0,3,4,4][w]} × 20 m flat out after a 15 m build-up. 2 min rest.`,tm:{work:5,rest:115,rounds:[0,3,4,4][w],sets:1,name:'Flying 20 m'}}]:[]),
     {n:'Agility: '+AGIL[g],x:`${[4,5,6,6][w]} reps each side. Walk back as rest.`},
     ...STR_X[g].map(e=>({n:e,x:rx(e,w)})),
     {n:'Single-leg calf raise',x:rx('calf',w)}]},
   {d:'Sat',t:'Match simulation',s:[
     {n:'Ball work: '+d2.name,x:`${d2.time} from the drill library.`,drill:d2.id},
     {n:'With a team: small-sided 4v4',x:`${[3,4,4,5][w]} × 4 min / 2 min. Go all out.`,tm:{work:240,rest:120,rounds:[3,4,4,5][w],sets:1,name:'Small-sided 4v4'},drill:'ssg-4v4'},
     {n:'Training alone: tempo runs',x:`${[8,10,12,12][w]} × 100 m at 70% / walk 50 m.`,tm:{work:20,rest:40,rounds:[8,10,12,12][w],sets:1,name:'Tempo runs'}}]},
   {d:'Sun',t:'Rest',rest:true,s:[{n:'Full rest',x:'Sleep 8+ hours, eat well, walk if you feel stiff.'}]}
  ];
}

/* ===== Storage (per-viewer convenience only) ===== */
const SP=window.__DEMO__?'tlsdemo:':'tls:';
const store={get(k,d){try{const v=localStorage.getItem(SP+k);return v==null?d:JSON.parse(v)}catch(e){return d}},set(k,v){try{localStorage.setItem(SP+k,JSON.stringify(v))}catch(e){} if(typeof syncHook==='function') syncHook(k,v)}};

/* ===== Timer ===== */
const T={el:$('#timer'),cfg:null,phase:'ready',left:0,total:0,round:1,set:1,run:false,iv:0,ac:null,wl:null};
const fmt=s=>{s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
function beep(f=880,ms=120){try{T.ac=T.ac||new (window.AudioContext||window.webkitAudioContext)();const o=T.ac.createOscillator(),g=T.ac.createGain();o.frequency.value=f;g.gain.value=.12;o.connect(g);g.connect(T.ac.destination);o.start();o.stop(T.ac.currentTime+ms/1000)}catch(e){}}
function tSet(p,sec){T.phase=p;T.left=sec;T.total=sec;tDraw()}
function tDraw(){
  const c=T.cfg; if(!c) return;
  T.el.dataset.p=T.phase;
  if(c.seq){const b=c.seq[T.si||0], nx=c.seq[(T.si||0)+1];
    $('#tPh').textContent=T.phase==='ready'?'Get ready':T.phase==='done'?'Session done':b.n; $('#tClock').textContent=T.phase==='done'?'✓':fmt(T.left);
    $('#tBar').style.width=(T.total?100*(1-T.left/T.total):100)+'%'; $('#tRound').textContent=`Block ${Math.min((T.si||0)+1,c.seq.length)}/${c.seq.length}`;
    $('#tSet').textContent=nx&&T.phase!=='done'?'Next: '+nx.n.split(':')[0]:''; $('#tSpec').textContent=fmt(c.seq.reduce((a,x)=>a+x.sec,0))+' total'; $('#tPlay').innerHTML=T.run?ICON.pause:ICON.play; return}
  $('#tPh').textContent={ready:'Get ready',work:'Work',rest:'Rest',setrest:'Set rest',done:'Session done'}[T.phase];
  $('#tClock').textContent=T.phase==='done'?'✓':fmt(T.left);
  $('#tBar').style.width=(T.total?100*(1-T.left/T.total):100)+'%';
  $('#tRound').textContent=`Rep ${Math.min(T.round,c.rounds)}/${c.rounds}`;
  $('#tSet').textContent=`Set ${Math.min(T.set,c.sets||1)}/${c.sets||1}`;
  $('#tSpec').textContent=`${fmt(c.work)} / ${fmt(c.rest)}`;
  $('#tPlay').innerHTML=T.run?ICON.pause:ICON.play;
}
function tNext(){
  const c=T.cfg, sets=c.sets||1;
  if(c.seq){ if(T.phase==='ready'){T.si=0; tSet('work',c.seq[0].sec); beep(1200,250); return}
    if(T.si<c.seq.length-1){T.si++; tSet('work',c.seq[T.si].sec); beep(1200,400); return}
    T.run=false; clearInterval(T.iv); tSet('done',0); beep(1400,500); return }
  if(T.phase==='ready'||T.phase==='rest'||T.phase==='setrest'){tSet('work',c.work);beep(1200,250);return}
  if(T.phase==='work'){
    if(T.round<c.rounds){T.round++; if(c.rest>0){tSet('rest',c.rest);beep(600,250)} else {tSet('work',c.work)} return}
    if(T.set<sets){T.set++;T.round=1;tSet('setrest',c.sr||120);beep(600,400);return}
    T.run=false;clearInterval(T.iv);tSet('done',0);beep(1400,500);setTimeout(()=>beep(1400,500),600);return;
  }
}
function tTick(){T.left-=.25; if(T.left<=3.01&&T.left>0&&Math.abs(T.left-Math.round(T.left))<.01) beep(880,80); if(T.left<=0) tNext(); tDraw()}
function tPlay(){
  if(T.phase==='done'){tReset()}
  T.run=!T.run; clearInterval(T.iv);
  if(T.run){T.iv=setInterval(tTick,250); try{navigator.wakeLock&&navigator.wakeLock.request('screen').then(l=>T.wl=l).catch(()=>{})}catch(e){} beep(1000,60)}
  tDraw();
}
function tReset(){clearInterval(T.iv);T.run=false;T.round=1;T.set=1;T.si=0;tSet('ready',5)}
function openTimer(cfg){T.cfg={sets:1,rounds:1,work:0,rest:0,...cfg};$('#tName').textContent=cfg.name||'Timer';T.el.hidden=false;tReset();}
$('#tPlay').onclick=tPlay; $('#tReset').onclick=tReset; $('#tSkip').onclick=()=>{if(T.phase!=='done'){tNext();tDraw()}};
$('#tClose').onclick=()=>{clearInterval(T.iv);T.run=false;T.el.hidden=true;try{T.wl&&T.wl.release()}catch(e){}};

/* ===== Views ===== */
const views=['formations','positions','drills','sessions','coach','fitness','week'];
let boards={};
/* scroll a horizontal rail just enough to show el, respecting the rail's side padding */
function keepInView(r,el){if(r.scrollWidth<=r.clientWidth){r.scrollLeft=0;return} const rr=r.getBoundingClientRect(), er=el.getBoundingClientRect(), pl=parseFloat(getComputedStyle(r).paddingLeft)||0, pr=parseFloat(getComputedStyle(r).paddingRight)||0;
  if(el===r.querySelector('button')){r.scrollLeft=0;return}
  if(er.left<rr.left+pl) r.scrollLeft-=rr.left+pl-er.left; else if(er.right>rr.right-pr) r.scrollLeft+=er.right-(rr.right-pr)}
function show(v){
  if(!views.includes(v)) v='formations';
  if(v!=='drills'&&!$('#drillSheet').hidden&&!document.body.classList.contains('pmode')) closeDrill();
  if(v==='week'){renderWeek(); if(typeof refreshWeekView==='function') refreshWeekView()}
  views.forEach(x=>{$('#v-'+x).hidden=x!==v});
  $$('#nav button').forEach(b=>b.setAttribute('aria-current',b.dataset.v===v?'page':'false'));
  Object.entries(boards).forEach(([k,b])=>{ if(k===v) b.play(); else b.stop() });
  store.set('view',v);
  if(location.hash!=='#'+v) history.replaceState(null,'','#'+v);
}
$('#nav').addEventListener('click',e=>{const b=e.target.closest('button'); if(b){show(b.dataset.v); window.scrollTo({top:0,behavior:'smooth'})}});
const li=(a,cls='')=>`<ul class="tick ${cls}">${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul>`;
const posById=id=>POSITIONS.find(p=>p.id===id);
const drillById=id=>DRILLS.find(d=>d.id===id);

/* Formations */
let curF=FORMATIONS[0];
function renderFormPick(){
  const fams=[...new Set(FORMATIONS.map(f=>f.fam))];
  $('#formPick').innerHTML=fams.map(fm=>`<div class="fgroup"><span class="flab">${fm}</span><div class="fitems">${FORMATIONS.filter(f=>f.fam===fm).map(f=>`<button class="fcard" data-f="${f.id}" aria-pressed="${f===curF}"><b>${f.name}</b><small>${f.v}</small></button>`).join('')}</div></div>`).join('');
  const sel=$('#formPick .fcard[aria-pressed="true"]'); if(sel) keepInView($('#formPick'),sel);
}
$('#formPick').addEventListener('click',e=>{const b=e.target.closest('[data-f]'); if(b) setForm(b.dataset.f)});
let fTab='att', fMode='att', fOpp=store.get('fopp','433');
const TABS=[['att','Attack'],['def','Defend'],['cycle','Full cycle']];
const GLY={
 up:'<path d="M14 4l7 8h-4.5v11h-5V12H7z"/>',
 zig:'<path d="M4 22l6-8 5 4 7-12" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="22" cy="6" r="2.4"/>',
 arc:'<path d="M5 22C7 9 17 5 23 7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-dasharray="3 3"/><circle cx="23" cy="7" r="2.6"/><circle cx="5" cy="22" r="2.6"/>',
 swap:'<path d="M4 10h17l-4-4M24 18H7l4 4" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>',
 layers:'<path d="M14 4l10 5-10 5-10-5zM4 14l10 5 10-5M4 19l10 5 10-5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linejoin="round"/>',
 man:'<circle cx="8" cy="9" r="3.6"/><circle cx="20" cy="9" r="3.6" opacity=".5"/><circle cx="8" cy="20" r="3.6"/><circle cx="20" cy="20" r="3.6" opacity=".5"/><path d="M11.5 9h5M11.5 20h5" stroke="currentColor" stroke-width="2"/>',
 trap:'<path d="M24 4v20H4" fill="none" stroke="currentColor" stroke-width="2.6"/><circle cx="18" cy="18" r="3"/><circle cx="11" cy="17" r="2.2" opacity=".6"/><circle cx="18" cy="10" r="2.2" opacity=".6"/>',
 mid:'<path d="M4 10h20M4 18h20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M9 6l-3 4 3 4M19 14l3 4-3 4" fill="none" stroke="currentColor" stroke-width="2"/>',
 low:'<rect x="6" y="14" width="16" height="10" fill="none" stroke="currentColor" stroke-width="2.4"/><path d="M4 10h20" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M14 2v6" stroke="currentColor" stroke-width="2" stroke-dasharray="2 2"/>',
 cpress:'<circle cx="14" cy="14" r="3.4"/><path d="M14 4a10 10 0 0 1 10 10M14 24A10 10 0 0 1 4 14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M24 14l-3-3M4 14l3 3" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 shield:'<path d="M14 3l9 4v6c0 6-4 10-9 12-5-2-9-6-9-12V7z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><path d="M10 14l3 3 5-6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 back:'<path d="M20 6H9l3-3M9 6l3 3" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><path d="M6 24V13M6 13l-3 3M6 13l3 3M22 24V13M22 13l-3 3M22 13l3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 over:'<path d="M20 24V8M20 8l-3 3M20 8l3 3" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><path d="M10 22c-6-6-3-14 9-17" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="3 2.5" stroke-linecap="round"/><circle cx="20" cy="14" r="3"/>',
 under:'<path d="M24 24V6" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="24" cy="14" r="2.8"/><path d="M10 24c0-8 4-14 10-18" fill="none" stroke="currentColor" stroke-width="2.4" stroke-dasharray="3 2.5" stroke-linecap="round"/>',
 third:'<circle cx="6" cy="22" r="3"/><circle cx="14" cy="8" r="3"/><circle cx="22" cy="20" r="3"/><path d="M8 19l5-8M16 11l5 6" stroke="currentColor" stroke-width="2"/>',
 tri:'<path d="M14 4l10 18H4z" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><circle cx="14" cy="4" r="2.6"/><circle cx="4" cy="22" r="2.6"/><circle cx="24" cy="22" r="2.6"/>',
 f9:'<path d="M14 4v12" stroke="currentColor" stroke-width="2.4" stroke-dasharray="3 2.5"/><circle cx="14" cy="20" r="3.4"/><path d="M6 18L4 4M22 18l2-14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/>',
 counter:'<path d="M4 22L24 6M24 6h-7M24 6v7" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 12l4 4" stroke="currentColor" stroke-width="2"/>',
 iso:'<rect x="16" y="4" width="8" height="20" rx="2" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="3 2"/><circle cx="20" cy="14" r="3"/><circle cx="7" cy="10" r="2.4" opacity=".5"/><circle cx="7" cy="19" r="2.4" opacity=".5"/>',
 rot:'<circle cx="8" cy="8" r="3"/><circle cx="20" cy="20" r="3"/><path d="M12 6c6 0 9 3 9 9M16 22c-6 0-9-3-9-9" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>',
 beh:'<path d="M3 15h22" stroke="currentColor" stroke-width="2" stroke-dasharray="2.5 2"/><path d="M8 24C9 12 16 6 22 6" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"/><circle cx="22" cy="6" r="2.8"/>',
 cycle:'<path d="M6 14a8 8 0 0 1 14-5.3M22 14a8 8 0 0 1-14 5.3" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/><path d="M20 4v5h-5M8 24v-5h5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>'
};
const gly=k=>`<svg viewBox="0 0 28 28" aria-hidden="true" fill="currentColor">${GLY[k]||''}</svg>`;
const ATT_CARDS=[['att','All phases','Build-up to finish','up'],...ATT_VARS.map(v=>[v.id,v.n,v.sub,v.ic]),['through','Beat the press','Through the striker','zig'],['long','Go long vs press','Skip the press','arc'],['switch','Switch via keeper','Use the spare man','swap']];
const DEF_CARDS=[['def','Overview','Press, block, recover','layers'],['dv-man','Man-to-man','High press','man'],['dv-trap','Wide trap','Use the touchline','trap'],['dv-mid','Mid block','Zonal shifting','mid'],['dv-low','Low block','Defend crosses','low'],['dv-cpress','Counter-press','Win it in 5 s','cpress'],['dv-rest','Rest defence','Stop the counter','shield'],['dv-backpass','Back-pass trigger','Step up together','back']];
function renderModes(){
  const cards=fTab==='att'?ATT_CARDS:fTab==='def'?DEF_CARDS:null;
  $('#formModes').innerHTML=`<div class="ftabs ${fTab}" role="tablist">${TABS.map(([k,n])=>`<button role="tab" class="ftab ${k}" data-tab="${k}" aria-selected="${fTab===k}">${k==='cycle'?gly('cycle'):''}${n}</button>`).join('')}</div>`+
   (cards?`<div class="prail ${fTab}" role="group" aria-label="${fTab==='att'?'Attacking':'Defensive'} pattern">${cards.map(([k,n,sub,g])=>`<button class="pcard" data-mode="${k}" aria-pressed="${fMode===k}"><span class="pg">${gly(g)}</span><b>${n}</b><small>${sub}</small></button>`).join('')}</div>`:'')+
   ((fTab==='def'&&fMode!=='def')||fMode.startsWith('at-')?`<div class="opprow"><span>Against</span><div class="oseg">${DV_OPPS.map(o=>{const O=FORMATIONS.find(f=>f.id===o); return `<button data-opp="${o}" aria-pressed="${fOpp===o}">${O.name}</button>`}).join('')}</div></div>`:'');
  const sel=$('#formModes .pcard[aria-pressed="true"]'); if(sel) keepInView(sel.parentElement,sel);
}
$('#formModes').addEventListener('click',e=>{const t=e.target.closest('[data-tab]'); if(t){fTab=t.dataset.tab; store.set('ftab',fTab); setForm(curF.id); return} const b=e.target.closest('[data-mode]'); if(b){setMode(b.dataset.mode); return} const o=e.target.closest('[data-opp]'); if(o){fOpp=o.dataset.opp; store.set('fopp',fOpp); setMode(fMode)}});
function sceneFor(m){
  if(m==='att') return withContext(attackScene(curF),{ours:false,oppCount:10});
  if(m==='def') return withContext(defendScene(curF),{ours:false,oppCount:10});
  if(m.startsWith('dv-')) return defVarScene(curF,m,fOpp);
  if(m.startsWith('at-')) return attVarScene(curF,m,fOpp);
  if(m==='cycle') return withContext(formationScene(curF),{ours:false,oppCount:10});
  return withContext(pressScene(curF,m),{ours:false});
}
function setMode(m){fMode=m; renderModes(); renderDefInfo(); boards.formations.load(sceneFor(m),!$('#v-formations').hidden); $$('#phaseChips .chip').forEach(c=>c.classList.remove('on'))}
function setForm(id){
  curF=FORMATIONS.find(f=>f.id===id)||FORMATIONS[0]; store.set('form',curF.id);
  renderFormPick();
  const PL=PLANS[curF.id]||PLANS['433'];
  const jobs=(r)=>(JOB_OVR[curF.id]||{})[r]||JOBS[roleToPos(r)];
  const seen=new Set(), roles=curF.r.filter(r=>!seen.has(r)&&seen.add(r));
  const roleRows=k=>roles.map(r=>{const j=jobs(r); return `<button data-pos="${roleToPos(r)}"><span class="rn">${r}</span><span style="grid-column:2">${k===0?'<b>With the ball:</b> ':'<i>Without the ball:</i> '}${esc(j[k])}</span></button>`}).join('');
  const head=`<div class="card"><h2>${curF.name} <span class="muted" style="font-weight:700">· ${curF.v}</span></h2><p style="margin-top:10px">${esc(curF.desc)}</p>
   <div class="tags" style="margin-top:14px"><span class="tag md">Attacking shape: ${curF.ipN}</span><span class="tag hi">Defending shape: ${curF.lbN}</span><span class="tag">${curF.fam}</span></div></div>`;
  const phase=list=>`<div class="card"><h3>Jump to a moment</h3><div class="phases" id="phaseChips">${list.map(([n,i])=>`<button class="chip" data-step="${i}">${n}</button>`).join('')}</div></div>`;
  let body;
  if(fTab==='att') body=`
   <div id="dvInfo"></div>
   <div class="card side-att"><p class="eyebrow" style="color:var(--teal)">In possession</p><h2 style="margin-top:6px">Attacking shape: ${curF.ipN}</h2>
    <dl class="plan" style="margin:14px 0 0"><dt>Build-up</dt><dd>${esc(PL.build)}</dd><dt>Progression</dt><dd>${esc(PL.prog)}</dd><dt>Final third</dt><dd>${esc(PL.final)}</dd><dt>When we win the ball</dt><dd>${esc(PL.toA)}</dd></dl></div>
   ${phase(ATT_PH)}
   <div class="card"><h3>When you’re being pressed</h3>${li(PL.vs,'teal')}<div class="phases" style="margin-top:14px">${PRESS_ROUTES.map(([k,n])=>`<button class="chip" data-route="${k}">▶ ${n}</button>`).join('')}</div></div>
   <div class="card"><h3>Attacking strengths</h3>${li(curF.str,'teal')}</div>
   <div class="card"><h3>Every player’s job with the ball</h3><div class="roles">${roleRows(0)}</div><p class="hint">Tap a role to open its position deep dive.</p></div>`;
  else if(fTab==='def') body=`
   <div id="dvInfo"></div>
   <div class="card side-def"><p class="eyebrow" style="color:var(--red)">Out of possession</p><h2 style="margin-top:6px">Defending shape: ${curF.lbN}</h2>
    <dl class="plan" style="margin:14px 0 0"><dt>High press</dt><dd>${esc(PL.press)}</dd><dt>Mid / low block</dt><dd>${esc(PL.block)}</dd><dt>When we lose the ball</dt><dd>${esc(PL.toD)}</dd></dl></div>
   ${phase(DEF_PH)}
   <div class="card"><h3>Weak spots to protect</h3>${li(curF.wk,'red')}</div>
   <div class="card"><h3>Distances to keep</h3>${li(['10–12 m between teammates across the pitch','Under 35 m from the striker to the back line','Back line steps up when the ball goes backwards','Far-side players tuck in toward the ball'],'red')}</div>
   <div class="card"><h3>Every player’s job without the ball</h3><div class="roles">${roleRows(1)}</div><p class="hint">Tap a role to open its position deep dive.</p></div>`;
  else body=`${phase(PHASES)}
   <div class="two"><div class="card"><h3>Strengths</h3>${li(curF.str,'teal')}</div><div class="card"><h3>Weak spots</h3>${li(curF.wk,'red')}</div></div>
   <div class="card"><h3>Best for</h3><p>${esc(curF.best)}</p></div>`;
  $('#formInfo').innerHTML=head+body;
  setMode(fTab==='att'?(['through','long','switch'].includes(fMode)||fMode.startsWith('at-')?fMode:'att'):fTab==='def'?(fMode.startsWith('dv-')?fMode:'def'):fTab);
  renderDefInfo();
}
$('#formInfo').addEventListener('click',e=>{
  const r=e.target.closest('[data-route]'); if(r){setMode(r.dataset.route); $('#formModes').scrollIntoView({behavior:'smooth',block:'start'}); return}
  const s=e.target.closest('[data-step]'); if(s){const want=fTab==='att'?'att':fTab; if(fMode!==want) setMode(want); boards.formations.begin(+s.dataset.step); return}
  const p=e.target.closest('[data-pos]'); if(p){setPos(p.dataset.pos); show('positions'); window.scrollTo({top:0})}
});
function renderDefInfo(){
  const el=$('#dvInfo'); if(!el) return;
  const V=fMode.startsWith('at-')?ATT_VARS.find(v=>v.id===fMode):DEF_VARS.find(v=>v.id===(fMode==='def'?'dv-full':fMode));
  if(!V||(fTab==='att'&&!fMode.startsWith('at-'))){el.innerHTML='';return}
  const att=fMode.startsWith('at-');
  el.innerHTML=`<div class="card ${att?'side-att':'side-def'}"><p class="eyebrow" style="color:var(--${att?'teal':'red'})">${att?'Attacking':'Defensive'} pattern</p><h2 style="margin-top:6px">${esc(V.n)}</h2><p class="muted" style="margin-top:8px"><b style="color:var(--fg)">Use it when:</b> ${esc(V.when)}</p><div style="margin-top:12px">${li(V.pts,att?'teal':'red')}</div></div>`;
}
function markPhase(i){const L=fMode==='att'?ATT_PH:fMode==='def'?DEF_PH:fMode==='cycle'?PHASES:null; if(!L) return; const ph=L.slice().reverse().find(([,k])=>k<=i); $$('#phaseChips .chip').forEach(c=>c.classList.toggle('on',ph&&+c.dataset.step===ph[1]))}

/* Positions */
let curP=POSITIONS[0], curTab='a', curSc=0;
function renderPosPick(){$('#posPick').innerHTML=POSITIONS.map(p=>`<button class="chip" data-p="${p.id}" aria-pressed="${p===curP}"><span class="num">${p.num}</span>${p.name}</button>`).join('')}
$('#posPick').addEventListener('click',e=>{const b=e.target.closest('[data-p]'); if(b) setPos(b.dataset.p)});
function setPos(id){
  curP=posById(id)||POSITIONS[0]; store.set('pos',curP.id); curTab='a'; curSc=0;
  renderPosPick();
  const P=curP;
  $('#posHead').innerHTML=`<div class="phead"><div class="big">${P.num}</div><div class="t"><h2>${P.name}</h2><p>${esc(P.sum)}</p></div></div>`;
  $('#posInfo').innerHTML=`
   <div class="card"><h3>Typical elite match (approx.)</h3><div class="stats">${P.stats.map(([b,s])=>`<div><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join('')}</div></div>
   <div class="card"><h3>Key attributes</h3><div class="tags">${P.attrs.map(a=>`<span class="tag">${esc(a)}</span>`).join('')}</div></div>
   <div class="card"><h3>How to attack</h3>${li(P.att,'teal')}</div>
   <div class="card"><h3>How to defend</h3>${li(P.def,'red')}</div>
   <div class="card"><h3>Common mistakes</h3>${li(P.mis)}</div>
   <div class="card"><h3>Drills for this position</h3><div class="tags">${P.drills.map(d=>{const D=drillById(d);return D?`<button class="chip" data-drill="${d}">${esc(D.name)} <small>${D.cat}</small></button>`:''}).join('')}</div></div>
   <div class="card" style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap"><div><h3 style="margin:0">Get back in shape</h3><p class="muted" style="margin-top:4px">4-week plan built for a ${P.name.toLowerCase()}’s demands.</p></div><button class="btn" data-fit="${P.fit}">Open plan</button></div>`;
  renderSc();
}
function renderSc(){
  const P=curP, list=P.sc.map((s,i)=>({...s,i})), na=list.filter(s=>s.t==='a').length, nd=list.length-na;
  $('#scTabs').innerHTML=`<button class="chip" data-tab="a" aria-pressed="${curTab==='a'}">Attacking <small>${na}</small></button><button class="chip" data-tab="d" aria-pressed="${curTab==='d'}">Defending <small>${nd}</small></button>`;
  const shown=list.filter(s=>s.t===curTab);
  if(!shown.some(s=>s.i===curSc)) curSc=shown[0].i;
  $('#scList').innerHTML=shown.map(s=>`<button class="sc${s.i===curSc?' on':''}" data-sc="${s.i}"><span class="k ${s.t}">${s.t==='a'?'ATT':'DEF'}</span><span>${esc(s.title)}</span></button>`).join('');
  const s=P.sc[curSc];
  boards.positions.load({...withContext(s),tag:`${P.short} · ${s.t==='a'?'Attack':'Defend'}`},!$('#v-positions').hidden);
}
$('#scTabs').addEventListener('click',e=>{const b=e.target.closest('[data-tab]'); if(b){curTab=b.dataset.tab; curSc=-1; renderSc()}});
$('#scList').addEventListener('click',e=>{const b=e.target.closest('[data-sc]'); if(b){curSc=+b.dataset.sc; renderSc()}});
$('#posInfo').addEventListener('click',e=>{
  const d=e.target.closest('[data-drill]'); if(d){show('drills'); setDrill(d.dataset.drill); window.scrollTo({top:0}); return}
  const f=e.target.closest('[data-fit]'); if(f){setFit(f.dataset.fit); show('fitness'); window.scrollTo({top:0})}
});

/* Drills */
const FAV=[['rondo','The classic possession drill. Hundreds of touches under pressure, sharp angles and instant counter-pressing in 12 minutes.'],['pos-game','Teaches width, depth and finding the free player: the core of positional play.'],['press-escape','Rehearses the three ways out of a man-to-man press until the decision is automatic.'],['press-trap','Coordinated pressing: curve, trigger, trap. Turns pressing from effort into a plan.'],['ssg-4v4','Game-realistic conditioning: more 1v1s, sprints and turns per player than an 11v11.'],['transition','Rewards the first seconds after a regain, when opponents are most disorganised.'],['build-press','Full build-up structure against pressure: staggered midfield, free man, switch.'],['back4','Builds the distances and communication a back four needs, at low physical cost.'],['crossing','High-volume crossing and box movement at match speed that doubles as conditioning.'],['st-finish','Movement before the finish: the habit behind most strikers’ goals.'],['att-1v1','Short, repeatable 1v1s that build confidence and change of pace.'],['mid-scan','Builds the scanning habit midfielders need to receive on the half-turn.']];
const FAVMAP=Object.fromEntries(FAV);
const LINES=['All lines','My drills','Goalkeeping','Defence','Midfield','Forwards','Whole team'];
let curD=null, dCat='All', dPos='all', dLine='All lines', dQ='', dTab='overview';
function miniPreview(sc){
  const {S,kind}=sceneStates(sc); const st=S[Math.min(1,S.length-1)];
  const [fx0,fy0,fx1,fy1]=fitRange(sc);
  let o=`<svg viewBox="${mx(fx0)} ${my(fy0)} ${mx(fx1-fx0)} ${my(fy1-fy0)}" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><rect x="-6" y="-6" width="${PW+12}" height="${PL+12}" fill="#0f271d"/>`;
  for(let i=1;i<12;i+=2) o+=`<rect x="0" y="${i*PL/12}" width="${PW}" height="${PL/12}" fill="#11301f"/>`;
  o+=`<g fill="none" stroke="rgba(214,236,222,.4)" stroke-width=".35"><rect width="${PW}" height="${PL}"/><line y1="${PL/2}" x2="${PW}" y2="${PL/2}"/><circle cx="${PW/2}" cy="${PL/2}" r="9.15"/><rect x="13.84" width="40.32" height="16.5"/><rect x="13.84" y="${PL-16.5}" width="40.32" height="16.5"/></g>`;
  (sc.grid||[]).forEach(([x,y,w,h])=>o+=`<rect x="${mx(x)}" y="${my(y)}" width="${mx(w)}" height="${my(h)}" fill="rgba(255,255,255,.04)" stroke="rgba(255,255,255,.5)" stroke-width=".3" stroke-dasharray="1 .8"/>`);
  for(const id in st.pos){const q=st.pos[id]; if(!q) continue; const k=kind(id), X=mx(q[0]), Y=my(q[1]);
    if(k==='c') o+=`<path d="M${X} ${Y-1.3}L${X+1.2} ${Y+.9}H${X-1.2}z" fill="#f07a2b"/>`;
    else if(k==='g') o+=`<rect x="${X-2.4}" y="${Y-.7}" width="4.8" height="1.4" fill="none" stroke="#fff" stroke-width=".35"/>`;
    else if(k==='p') o+=`<rect x="${X-.7}" y="${Y-1.6}" width="1.4" height="3.2" rx=".6" fill="#f2d04a"/>`;
    else o+=`<circle cx="${X}" cy="${Y}" r="2.3" fill="${k==='o'?'#a4adb2':k==='k'?'#2c3633':'#e7b53c'}"${k==='h'?' stroke="#ec5157" stroke-width=".7"':''}/>`;}
  const bp=st.ball; const bq=typeof bp==='string'?st.pos[bp]:bp; if(bq) o+=`<circle cx="${mx(bq[0])+1.4}" cy="${my(bq[1])-1.6}" r=".95" fill="#fff"/>`;
  return o+'</svg>';
}
const intDots=i=>`<span class="idots i-${i.toLowerCase()}" title="${i} intensity"><i></i><i></i><i></i></span>`;
function drillCard(d,fav){
  return `<button class="dcard${fav?' fav':''}" data-d="${d.id}"><div class="dprev">${miniPreview(d.sc)}<span class="dbadge c-${d.cat.toLowerCase()}">${d.cat}</span>${d.custom?'<span class="dmine">Mine</span>':''}</div>
   <div class="dbody"><span class="cat">${d.line}</span><b>${esc(d.name)}</b><p>${esc(fav?FAVMAP[d.id]:d.focus)}</p>
   <div class="dmeta"><span>${ICON.timer}${esc(d.time)}</span><span>${esc(d.players.split(/ \(|,/)[0])}</span>${intDots(d.int)}</div></div></button>`;
}
const drillMatches=()=>{const q=dQ.trim().toLowerCase(); return DRILLS.filter(d=>(dCat==='All'||d.cat===dCat)&&(dLine==='All lines'||(dLine==='My drills'?d.custom:d.line===dLine))&&(dPos==='all'||d.pos.includes(dPos))&&(!q||(d.name+' '+d.focus+' '+d.line+' '+d.setup).toLowerCase().includes(q)))};
function renderDrillFilt(){
  const lineOk=d=>dLine==='All lines'||(dLine==='My drills'?d.custom:d.line===dLine);
  const base=d=>lineOk(d)&&(dPos==='all'||d.pos.includes(dPos));
  $('#dSeg').innerHTML=['All','Individual','Unit','Team'].map(c=>`<button data-cat="${c}" aria-pressed="${dCat===c}">${c}<small>${DRILLS.filter(d=>(c==='All'||d.cat===c)&&base(d)).length}</small></button>`).join('');
  const nMine=DRILLS.filter(d=>d.custom).length; $('#dLines').innerHTML=LINES.map(l=>`<button class="pill${l==='My drills'?' mine':''}" data-line="${l}" aria-pressed="${dLine===l}">${l}${l==='My drills'?` <small>${nMine}</small>`:''}</button>`).join('');
  $('#dPosSel').innerHTML=`<option value="all">All positions</option>${POSITIONS.map(p=>`<option value="${p.id}"${dPos===p.id?' selected':''}>${p.name}</option>`).join('')}`;
}
function renderDrills(){
  renderDrillFilt();
  const ds=drillMatches(), filtered=dCat!=='All'||dLine!=='All lines'||dPos!=='all'||dQ.trim();
  $('#favWrap').hidden=!!filtered;
  $('#favRow').innerHTML=FAV.map(([id])=>drillById(id)).filter(Boolean).map(d=>drillCard(d,true)).join('');
  $('#dCount').textContent=`${ds.length} drill${ds.length===1?'':'s'}${filtered?' match your filters':''}`;
  $('#drillGrid').innerHTML=ds.length?ds.map(d=>drillCard(d,false)).join(''):(dLine==='My drills'&&!DRILLS.some(d=>d.custom)?`<div class="empty"><b>No drills of your own yet.</b><p>Design a drill on the pitch, animate it and save it here. Or open any drill and tap “Customise” to make your own version.</p><button class="btn" data-newdrill>+ Create drill</button></div>`:`<div class="empty"><b>No drills match.</b><p>Try another position, or clear the search.</p><button class="btn ghost" id="dClear">Clear filters</button></div>`);
}
$('#dSeg').addEventListener('click',e=>{const b=e.target.closest('[data-cat]'); if(b){dCat=b.dataset.cat; renderDrills()}});
$('#dLines').addEventListener('click',e=>{const b=e.target.closest('[data-line]'); if(b){dLine=b.dataset.line; renderDrills()}});
$('#dPosSel').addEventListener('change',e=>{dPos=e.target.value; renderDrills()});
$('#dSearch').addEventListener('input',e=>{dQ=e.target.value; renderDrills()});
function clearDrillFilters(){dCat='All'; dPos='all'; dLine='All lines'; dQ=''; $('#dSearch').value=''; renderDrills()}
['#drillGrid','#favRow'].forEach(s=>$(s).addEventListener('click',e=>{if(e.target.closest('#dClear')){clearDrillFilters();return} if(e.target.closest('[data-newdrill]')){openDrillEditor();return} const b=e.target.closest('[data-d]'); if(b) openDrill(b.dataset.d)}));
function sheetBody(D){
  const t=dTab;
  if(t==='overview') return `<p class="lead">${esc(FAVMAP[D.id]||('Objective: '+D.focus+'.'))}</p>
    <dl class="meta"><div><dt>Players</dt><dd>${esc(D.players)}</dd></div><div><dt>Area</dt><dd>${esc(D.area)}</dd></div><div><dt>Duration</dt><dd>${esc(D.time)}</dd></div><div><dt>Intensity</dt><dd>${intDots(D.int)} ${D.int}</dd></div><div style="grid-column:1/-1"><dt>Equipment</dt><dd>${esc(D.kit)}</dd></div><div style="grid-column:1/-1"><dt>Work : rest</dt><dd class="mono">${D.tm.rounds} × ${fmt(D.tm.work)} / ${fmt(D.tm.rest)}${(D.tm.sets||1)>1?` · ${D.tm.sets} sets`:''}</dd></div></dl>
    <h3 style="margin-top:18px">Set-up</h3><p>${esc(D.setup)}</p>
    <h3 style="margin-top:18px">Positions</h3><div class="tags">${D.pos.map(p=>{const P=posById(p);return `<button class="chip" data-pos="${p}"><span class="num">${P.num}</span>${P.name}</button>`}).join('')}</div>`;
  if(t==='run') return `<ol class="steps">${D.steps.map(s=>`<li>${esc(s)}</li>`).join('')}</ol>`;
  return `<h3>Coaching points</h3>${li(D.pts,'teal')}<h3 style="margin-top:18px">Progressions</h3>${li(D.prog)}`;
}
function renderSheet(){
  const D=curD;
  $('#sheetHead').innerHTML=`<div><p class="eyebrow">${D.cat} · ${D.line}</p><h2>${esc(D.name)}</h2></div><button class="x big" id="sheetX" aria-label="Close drill">×</button>`;
  $('#sheetTabs').innerHTML=[['overview','Overview'],['run','How to run'],['coach','Coaching']].map(([k,n])=>`<button role="tab" data-st="${k}" aria-selected="${dTab===k}">${n}</button>`).join('');
  $('#sheetBody').innerHTML=sheetBody(D);
  $('#sMine').innerHTML=D.custom?`<button class="btn ghost" data-mkedit>Edit</button><button class="btn ghost danger" data-mkdel>Delete</button>`:`<button class="btn ghost" data-mkcopy>Customise</button>`;
}
function openDrill(id){
  curD=drillById(id)||DRILLS[0]; dTab='overview';
  $('#drillSheet').hidden=false; document.body.classList.add('locked');
  renderSheet(); $('#sheetScroll').scrollTop=0;
  if(boards.drills) boards.drills.stop();
  boards.drills=new Board($('#sheetBoard'),{});
  boards.drills.load({...curD.sc,fit:true,tag:curD.name},true);
}
function closeDrill(){$('#drillSheet').hidden=true; document.body.classList.remove('locked'); if(boards.drills) boards.drills.stop()}
const setDrill=id=>{openDrill(id)};
$('#drillSheet').addEventListener('click',e=>{
  if(e.target.id==='drillSheet'||e.target.closest('#sheetX')){closeDrill();return}
  const t=e.target.closest('[data-st]'); if(t){dTab=t.dataset.st; renderSheet(); return}
  const p=e.target.closest('[data-pos]'); if(p){closeDrill(); setPos(p.dataset.pos); show('positions'); window.scrollTo({top:0}); return}
  if(e.target.closest('[data-mkedit]')||e.target.closest('[data-mkcopy]')){const D=curD; closeDrill(); openDrillEditor(D); return}
  const del=e.target.closest('[data-mkdel]'); if(del){if(del.dataset.sure){deleteMyDrill(curD.id)} else {del.dataset.sure='1'; del.textContent='Tap again to delete'; setTimeout(()=>{if(del.isConnected){delete del.dataset.sure; del.textContent='Delete'}},3000)} return}
});
$('#sTimer').onclick=()=>curD&&openTimer({...curD.tm,name:curD.name});
$('#sAdd').onclick=()=>{if(!curD) return; addToSession(curD.id); const b=$('#sAdd'); b.textContent='Added to session ✓'; setTimeout(()=>b.innerHTML='+ Add to session',1600)};
addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#drillSheet').hidden) closeDrill()});

/* Fitness */
let curG=FIT_GROUPS[1].id, curW=0;
const doneMap=()=>store.get('done',{});
function setFit(g){curG=g; store.set('fitG',g); renderFit()}
function renderFit(){
  $('#fitPos').innerHTML=FIT_GROUPS.map(g=>`<button class="chip" data-g="${g.id}" aria-pressed="${g.id===curG}">${g.n}</button>`).join('');
  const done=doneMap();
  $('#fitWeeks').innerHTML=WEEKS.map((wk,i)=>{const P=plan(curG,i); let tot=0,dn=0; P.forEach((d,di)=>d.s.forEach((s,si)=>{tot++; if(done[`${curG}-${i}-${di}-${si}`]) dn++})); return `<button class="wk${i===curW?' on':''}" data-w="${i}"><small>WEEK ${i+1}</small><b>${wk.n}</b><div class="bar"><i style="width:${Math.round(100*dn/tot)}%"></i></div></button>`}).join('');
  const W=WEEKS[curW];
  $('#fitWeekNote').innerHTML=`<h3>Week ${curW+1}: ${W.n}</h3><p>${esc(W.f)}</p>`;
  const P=plan(curG,curW);
  $('#fitDays').innerHTML=P.map((d,di)=>`<article class="day${d.rest?' rest':''}"><div class="dayh"><div><small>${d.d.toUpperCase()}</small><b>${esc(d.t)}</b></div></div>
    ${d.s.map((s,si)=>{const k=`${curG}-${curW}-${di}-${si}`; return `<div class="blk"><div class="bn">${esc(s.n)}</div><p class="bd">${esc(s.x)}</p><div class="row">
      <label class="check"><input type="checkbox" id="c-${k}" data-k="${k}"${done[k]?' checked':''}>Done</label>
      ${s.tm&&s.tm.rounds?`<button class="mini" data-tm='${JSON.stringify(s.tm).replace(/'/g,"&#39;")}'>${ICON.timer}Timer</button>`:''}
      ${s.drill?`<button class="mini" data-drill="${s.drill}">View drill</button>`:''}</div></div>`}).join('')}</article>`).join('');
}
$('#fitPos').addEventListener('click',e=>{const b=e.target.closest('[data-g]'); if(b) setFit(b.dataset.g)});
$('#fitWeeks').addEventListener('click',e=>{const b=e.target.closest('[data-w]'); if(b){curW=+b.dataset.w; store.set('fitW',curW); renderFit()}});
$('#fitDays').addEventListener('click',e=>{
  const t=e.target.closest('[data-tm]'); if(t){openTimer(JSON.parse(t.dataset.tm)); return}
  const d=e.target.closest('[data-drill]'); if(d){show('drills'); setDrill(d.dataset.drill); window.scrollTo({top:0})}
});
$('#fitDays').addEventListener('change',e=>{const c=e.target.closest('[data-k]'); if(!c) return; const m=doneMap(); if(c.checked) m[c.dataset.k]=1; else delete m[c.dataset.k]; store.set('done',m); const sc=scrollY; renderFit(); scrollTo(0,sc)});

/* Boot */
function bootApp(opts={}){
boards.formations=new Board($('#formBoard'),{three:matchMedia('(min-width:960px)').matches,onTok:id=>{if(!/^p\d+$/.test(id)) return; const i=+id.slice(1); {setPos(roleToPos(curF.r[i])); show('positions'); window.scrollTo({top:0})}},onStep:markPhase});
boards.positions=new Board($('#posBoard'),{hero:true});
loadMyDrills();
initDrillEditor();
$('#dNew').onclick=()=>openDrillEditor();
renderDrills();
fTab=['att','def','cycle'].includes(store.get('ftab','att'))?store.get('ftab','att'):'att';
renderModes();
setForm(store.get('form','433'));
setPos(store.get('pos','cb'));
initSessions();
curW=Math.min(3,Math.max(0,+store.get('fitW',0)||0)); curG=store.get('fitG','cb'); if(!FIT_GROUPS.some(g=>g.id===curG)) curG='cb';
renderFit();
initCoach();
initWeek(); initPlayer();
if(opts.player) return;
if((location.hash||'').startsWith('#w.')) openPlayer(); else show((location.hash||'').slice(1)||store.get('view','formations'));
addEventListener('hashchange',()=>{if(document.body.classList.contains('authmode')) return; if(location.hash.startsWith('#w.')) openPlayer(); else {if(document.body.classList.contains('pmode')) exitPlayer(); show(location.hash.slice(1))}});
document.addEventListener('visibilitychange',()=>{const v=views.find(x=>!$('#v-'+x).hidden); if(document.hidden) Object.values(boards).forEach(b=>b.stop()); else boards[v]&&boards[v].play()});
}
startApp();
