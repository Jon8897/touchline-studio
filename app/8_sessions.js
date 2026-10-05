/* ===== Session planner ===== */
const THEMES=[
 {id:'press-beat',n:'Playing out vs a press',kw:['build','press','escape','free player','third-man','switch','play out','pivot','keeper']},
 {id:'press-high',n:'High pressing',kw:['press','trap','trigger','counter-press','regain','win it']},
 {id:'possession',n:'Possession & rotations',kw:['rondo','possession','rotation','positional','keep','circulat','scan','passing']},
 {id:'final-third',n:'Final third & finishing',kw:['finish','shoot','cut-back','box','combination','1v1','score','overload']},
 {id:'wide',n:'Wide play & crossing',kw:['cross','overlap','wide','byline','wing','underlap','channel']},
 {id:'defending',n:'Defending & back line',kw:['defend','block','back four','back five','line','cover','shift','jockey','tackle','crosses','compact']},
 {id:'transition',n:'Transitions & counters',kw:['transition','counter','regain','waves','recover','6 seconds','5 seconds']},
 {id:'setpieces',n:'Set pieces',kw:['corner','free kick','free-kick','throw','penalt']},
 {id:'fitness',n:'Match fitness',kw:['conditioning','small-sided','repeat','sprint','box-to-box','3v3','4v4','intensity']},
 {id:'gk',n:'Goalkeeping',kw:['keeper','gk','save','claim','distribution','1v1']}
];
const MDS=[['md4','MD-4 (heavy day)'],['md3','MD-3 (tactical)'],['md2','MD-2 (speed)'],['md1','MD-1 (sharpen)'],['md+1','MD+1 (recovery)'],['pre','Pre-season']];
const STRUCTS=[['classic','Classic progression','Technical → unit → team game'],['wpw','Whole–part–whole','Game, then drills, then the game again'],['games','Game-based','Three conditioned games'],['stations','Stations circuit','Four rotating stations'],['phase','Phase of play','Unit patterns → phase → game']];
const POOLS={
 'press-beat':{Individual:['def-pass-pressure','mid-scan','mid-first-touch','mid-escape','cb-switch','gk-distribution','mid-passing-diamond'],Unit:['build-3v2','back3-build','mid3-rotate','mid-double-pivot','rondo','mid-switch-zones'],Team:['press-escape','build-press','team-playout-11v8','team-phase-build','team-thirds','pos-game']},
 'press-high':{Individual:['mid-intercept','def-jockey','def-recovery','mid-first-touch','mid-box-run'],Unit:['front3-press','mid-counterpress-4v4','mid-rondo-transition','mid-double-pivot','cb-2v2'],Team:['press-trap','team-wide-trap-8v8','team-shadow-press','team-gegenpress','team-second-balls','team-conditioned-11']},
 'possession':{Individual:['mid-passing-diamond','mid-first-touch','mid-scan','mid-wallpass','mid-escape','am-pocket'],Unit:['rondo','mid-rondo-transition','mid-3v3-targets','mid-switch-zones','mid3-rotate','combo'],Team:['pos-game','team-possession-9v9','team-3zone-switch','team-thirds','team-endzone','team-ssg-7v7']},
 'final-third':{Individual:['st-finish','st-turn-shoot','st-1v1-gk','cm-shoot','w-cutin','st-volley','fw-rebounds','att-1v1'],Unit:['combo','fw-cutback-patterns','fw-3v2','fw-2v2','fw-timing-runs','mid-box-arrivals','fw-rotations'],Team:['team-attack-def','team-overload-6v4','team-endzone','crossing','team-ssg-7v7','team-waves']},
 'wide':{Individual:['fb-overlap','fb-cross-zones','w-byline','w-cutin','w-speed-dribble','wb-shuttle','st-heading'],Unit:['wide-2v1','fw-wide-overload','fw-cutback-patterns','mid-box-arrivals','fb-cb-cover'],Team:['crossing','team-wide-play','team-ssg-7v7','team-3zone-switch','team-attack-def']},
 'defending':{Individual:['def-jockey','def-tackle-timing','def-recovery','def-blocking','def-footwork','cb-aerial','dm-screen'],Unit:['back4','back4-offside','back4-crosses','back5-shift','cb-2v2','fb-cb-cover','def-6v4','mid-double-pivot'],Team:['block','team-lowblock-10','team-defend-crosses','team-def-transition','team-rest-defence','team-attack-def']},
 'transition':{Individual:['def-recovery','mid-box-run','w-speed-dribble','mid-intercept','st-1v1-gk'],Unit:['mid-rondo-transition','mid-counterpress-4v4','fw-3v2','cb-2v2','mid-3v3-targets'],Team:['transition','team-counter-8v8','team-waves','team-gegenpress','team-def-transition','team-rest-defence']},
 'setpieces':{Individual:['st-heading','cb-aerial','fb-cross-zones','st-volley','fw-rebounds'],Unit:['back4-crosses','mid-box-arrivals','gk-back4-comms','fw-timing-runs'],Team:['corners','team-corners-attack','team-freekicks','team-throwins','team-penalties','team-defend-crosses']},
 'fitness':{Individual:['mid-box-run','wb-shuttle','w-speed-dribble','def-recovery','fw-rebounds'],Unit:['mid-counterpress-4v4','fw-3v2','mid-rondo-transition','cb-2v2','fw-2v2'],Team:['ssg-4v4','team-ssg-3v3','team-waves','team-ssg-7v7','team-gegenpress','team-counter-8v8']},
 'gk':{Individual:['gk-react','gk-footwork','gk-cross','gk-1v1','gk-deflection','gk-distribution'],Unit:['gk-back4-comms','back4-crosses','build-3v2','back3-build'],Team:['team-defend-crosses','build-press','team-playout-11v8','team-penalties','corners']}
};
const RPE={Low:3,Medium:5,High:8};
const TEMPLATES=[
 {n:'Match prep',sub:'MD-1 · 60 min',ic:'up',o:{theme:'setpieces',minutes:60,md:'md1',struct:'classic'}},
 {n:'Possession masterclass',sub:'75 min',ic:'cycle',o:{theme:'possession',minutes:75,md:'md3',struct:'wpw'}},
 {n:'Pressing day',sub:'MD-3 · 90 min',ic:'trap',o:{theme:'press-high',minutes:90,md:'md3',struct:'phase'}},
 {n:'Beat the press',sub:'75 min',ic:'zig',o:{theme:'press-beat',minutes:75,md:'md3',struct:'phase'}},
 {n:'Finishing school',sub:'75 min',ic:'arc',o:{theme:'final-third',minutes:75,md:'md2',struct:'stations'}},
 {n:'Defensive shape',sub:'90 min',ic:'shield',o:{theme:'defending',minutes:90,md:'md3',struct:'phase'}},
 {n:'Wide play',sub:'75 min',ic:'swap',o:{theme:'wide',minutes:75,md:'md3',struct:'classic'}},
 {n:'Transition chaos',sub:'MD-2 · 60 min',ic:'cpress',o:{theme:'transition',minutes:60,md:'md2',struct:'games'}},
 {n:'Small-sided fitness',sub:'MD-4 · 75 min',ic:'man',o:{theme:'fitness',minutes:75,md:'md4',struct:'games'}},
 {n:'Pre-season engine',sub:'105 min',ic:'mid',o:{theme:'fitness',minutes:105,md:'pre',struct:'stations'}},
 {n:'Recovery',sub:'MD+1 · 45 min',ic:'low',o:{theme:'possession',minutes:45,md:'md+1',struct:'classic'}},
 {n:'Goalkeepers',sub:'60 min',ic:'layers',o:{theme:'gk',minutes:60,md:'md3',struct:'stations',line:'Goalkeeping'}}
];
const WARMS=['Jog 4 min and dynamic mobility, then 5v2 rondos at rising tempo. Finish with 3 × 20 m strides.','Y-shaped passing pattern with movement, building from two-touch to one-touch, with mobility between rounds.','Activation circuit: mini-band glute work, A- and B-skips, lateral shuffles, then 4 × 15 m accelerations.','4v4+2 keep-ball at walking pace, then half pace, then full pace for the final two minutes.','Ball mastery: sole rolls, inside–outside touches and turns on the coach’s call, then 3 × 20 m dribble sprints.','Pass and move in pairs, volleys and headers, then reaction sprints on the coach’s call.','Tag game in a 20 × 20 m box to raise the heart rate, then dynamic stretches.','Dynamic warm-up in lines: high knees, heel flicks, carioca, open/close the gate, then 4 × 20 m build-ups.'];
const GKWARMS=['Footwork ladder, handling warm-up in pairs, then low dives building to full saves.','Hand–eye reactions with tennis balls, set-position drills, then progressive diving.'];
const COOLS=['Easy jog 3 min and light stretching. Debrief: repeat the key messages and ask what worked.','Walk and static stretches for hamstrings, hips and calves. Players name one thing they did well.','Foam-roll and mobility in a circle while the coach recaps the session aims and the next game.','Slow keep-ball in pairs, then stretching. Ask two players to explain the key message in their own words.'];
const RECOVERY_WARM='Light jog, mobility and foam-rolling. Keep everything below 60% effort.';
let SES=null, cbEdit=-1, pCat='All', pQ='';
const pick=a=>a[Math.floor(Math.random()*a.length)];
const minOf=d=>{const m=parseInt(d.time,10); return isFinite(m)?m:15};
function minPlayers(d){
  const t=d.players.toLowerCase(); let m=t.match(/(\d+)\s*v\s*(\d+)/); if(m) return +m[1]+ +m[2];
  m=t.match(/(\d+)\s*(players|attackers|defenders|midfielders)/); if(m) return +m[1];
  return d.cat==='Individual'?1:d.cat==='Unit'?4:10;
}
function themeScore(d,th){const txt=(d.name+' '+d.focus+' '+d.setup).toLowerCase(); return th.kw.reduce((s,k)=>s+(txt.includes(k)?1:0),0)}
function candidates(cat,o,used,pref){
  const pool=POOLS[o.theme]||POOLS.possession, cats=cat==='Any'?['Individual','Unit','Team']:[cat];
  const capHigh=o.md==='md1'||o.md==='md+1';
  const ok=d=>d&&!used.has(d.id)&&minPlayers(d)<=Math.max(o.players,2)&&(!capHigh||d.int!=='High'||d.cat==='Individual')&&(o.md!=='md+1'||d.int!=='High');
  const out=[];
  cats.forEach(c=>(pool[c]||[]).forEach((id,i)=>{const d=drillById(id); if(ok(d)){let sc=20-i+(o.line&&o.line!=='All lines'&&d.line===o.line?4:0)+(pref&&pref.test(d.name+' '+d.focus)?3:0)+((o.md==='md2'||o.md==='pre')&&/sprint|speed|1v1|counter|wave/i.test(d.name+d.focus)?2:0); SCORE[id]=sc; out.push([id,sc])}}));
  DRILLS.filter(d=>d.custom&&cats.includes(d.cat)&&(d.themes||[]).includes(o.theme)&&ok(d)&&!out.some(x=>x[0]===d.id)).forEach(d=>{SCORE[d.id]=24; out.push([d.id,24])});
  if(out.length<2){ // fall back to the rest of the library of that type
    DRILLS.filter(d=>cats.includes(d.cat)&&ok(d)&&!out.some(x=>x[0]===d.id)&&(o.theme==='gk'||d.line!=='Goalkeeping')).forEach(d=>{SCORE[d.id]=1; out.push([d.id,1])});
  }
  return out.sort((a,b)=>b[1]-a[1]).map(x=>x[0]);
}
const SCORE={};
function choose(c){let top=c.filter(id=>(SCORE[id]||0)>=10).slice(0,6); if(top.length<1) top=c.slice(0,3); if(!top.length) return null; const w=top.map((_,i)=>6-i), tot=w.reduce((a,b)=>a+b,0); let r=Math.random()*tot; for(let i=0;i<top.length;i++){r-=w[i]; if(r<=0) return top[i]} return top[0]}
function partsFor(o,R){
  if(o.md==='md+1') return [['Technical (light)','Individual',.5],['Recovery rondos','Unit',.5,/rondo|possession|passing/i]];
  const GAME=/game|small-sided|\dv\d|v\d|ssg/i;
  switch(o.struct){
    case 'wpw': return [['Whole: game','Team',.25,GAME],['Part: technical','Individual',.2],['Part: unit','Unit',.2],['Whole: game again','Team',.35,GAME]];
    case 'games': return [['Game 1','Team',.32,GAME],['Game 2','Team',.33,GAME],['Game 3','Team',.35,GAME]];
    case 'stations': return [['Station 1','Individual',.25],['Station 2','Unit',.25],['Station 3','Individual',.25],['Station 4','Unit',.25]];
    case 'phase': return [['Unit patterns','Unit',.3],['Phase of play','Team',.35,/phase|build|press|block|attack v|9v|8v|7v/i],['Conditioned game','Team',.35,GAME]];
    default: return o.md==='md1'?[['Technical','Individual',.3],['Unit patterns','Unit',.35],['Set pieces','Team',.35,/corner|free.kick|throw|penalt/i]]:[['Technical','Individual',.25],['Unit work','Unit',.3],['Team game','Team',.45,GAME]];
  }
}
function buildSession(o){
  o={struct:'classic',line:'All lines',players:16,...o};
  const D=o.minutes, used=new Set();
  const warm=D<=60?10:15, cool=D<=60?5:8, R=D-warm-cool;
  const r5=v=>Math.max(5,Math.round(v/5)*5);
  const blocks=[{type:'warm',label:'Warm-up',min:warm,note:o.md==='md+1'?RECOVERY_WARM:o.theme==='gk'?pick(GKWARMS):pick(WARMS)}];
  partsFor(o,R).forEach(([label,cat,f,pref])=>{
    let c=candidates(cat,o,used,pref);
    if(!c.length) c=candidates('Any',o,used,pref);
    const id=choose(c); if(!id) return;
    used.add(id); blocks.push({type:'drill',label,cat:drillById(id).cat,id,cands:c,ci:c.indexOf(id),min:r5(R*f)});
  });
  blocks.push({type:'cool',label:'Cool-down & debrief',min:cool,note:pick(COOLS)});
  const tot=blocks.reduce((s,b)=>s+b.min,0); if(tot!==D){const last=blocks.filter(b=>b.type==='drill').pop(); if(last) last.min=Math.max(5,last.min+D-tot)}
  const th=THEMES.find(t=>t.id===o.theme)||THEMES[0];
  return {title:o.title||`${th.n} · ${MDS.find(m=>m[0]===o.md)[1].split(' (')[0]}`,o,blocks,msgs:keyMsgs(o.theme)};
}
function keyMsgs(t){return ({'press-beat':['Find the free player before the ball arrives','The keeper is part of the build-up','Switch when one side is crowded'],'press-high':['Press together or not at all','Curve your run to block the switch','The back pass is our trigger'],'possession':['Width and depth on every pass','Scan twice before receiving','Counter-press the moment we lose it'],'final-third':['Arrive in the box as the ball arrives','Cut-backs beat crosses into crowds','Shoot early when the lane opens'],'wide':['Commit the defender before releasing','Cross early, before the defence sets','Three runners in the box'],'defending':['Pressure, cover, balance','10–12 m between teammates','Step up together when the ball goes back'],'transition':['First look forward after winning it','Nearest player hunts the ball after losing it','Sprint to the line of the ball'],'setpieces':['Same routine, every time','Attack the ball forward','Second ball is ours'],'fitness':['Quality under fatigue','Work hard, recover harder','Every rep at match speed'],'gk':['Set before the shot','Call early and loud','Distribute to the free player']})[t]||[]}
function blockRPE(b){if(b.type==='warm') return 3; if(b.type==='cool') return 2; if(b.type==='custom') return RPE[b.int]||5; const d=drillById(b.id); return d?RPE[d.int]||5:5}
const IB={up:'<svg viewBox="0 0 24 24"><path d="M12 6l6 7H6z"/></svg>',down:'<svg viewBox="0 0 24 24"><path d="M12 18l6-7H6z"/></svg>',dup:'<svg viewBox="0 0 24 24"><path d="M8 3h12v12H8zM4 7h2v12h12v2H4z"/></svg>',del:'<svg viewBox="0 0 24 24"><path d="M6 7h12l-1 14H7zM9 3h6l1 2h4v2H4V5h4z"/></svg>',edit:'<svg viewBox="0 0 24 24"><path d="M4 17v3h3l11-11-3-3zM17 4l3 3 1-1a2 2 0 0 0-3-3z"/></svg>',swap:'<svg viewBox="0 0 24 24"><path d="M4 8h13l-3-3 1.4-1.4L21 9l-5.6 5.4L14 13l3-3H4zm16 8H7l3 3-1.4 1.4L3 15l5.6-5.4L10 11l-3 3h13z"/></svg>'};
function renderTemplates(){
  $('#sTpl').innerHTML=TEMPLATES.map((t,i)=>`<button class="pcard tpl" data-tpl="${i}"><span class="pg">${gly(t.ic)}</span><b>${t.n}</b><small>${t.sub}</small></button>`).join('')+`<button class="pcard tpl blank" data-tpl="blank"><span class="pg">${gly('layers')}</span><b>Blank session</b><small>Build your own</small></button>`;
}
function renderSession(){
  if(!SES){$('#sesPlan').innerHTML=''; return}
  SES.blocks=SES.blocks.filter(b=>b.type!=='drill'||drillById(b.id));
  const tot=SES.blocks.reduce((s,b)=>s+b.min,0), load=SES.blocks.reduce((s,b)=>s+b.min*blockRPE(b),0);
  const band=load<300?['Light','lo']:load<520?['Moderate','md']:['Hard','hi'];
  let t=0; const n=SES.blocks.length;
  const strip=SES.blocks.map(b=>{const r=blockRPE(b), c=r<=3?'lo':r<=5?'md':'hi'; return `<i class="${c}" style="flex:${b.min}" title="${esc(b.label)}: ${b.min} min"></i>`}).join('');
  const st=SES.o&&STRUCTS.find(x=>x[0]===SES.o.struct);
  $('#sesPlan').innerHTML=`
  <div class="card sesh">
    <div class="sesh-top"><div><p class="eyebrow">Your session${st?` · ${st[1]}`:SES.custom?' · Custom':''}</p><input id="sesTitle" class="titleinp" value="${esc(SES.title)}" aria-label="Session name"></div>
    <div class="sesh-stats"><div><b class="mono">${tot}</b><span>minutes</span></div><div><b class="mono">${load}</b><span>load (min × RPE)</span></div><div><b class="tag ${band[1]}">${band[0]}</b><span>session</span></div></div></div>
    <div class="istrip" aria-label="Intensity across the session">${strip}</div>
    <div class="ilegend"><span><i class="lo"></i>Low</span><span><i class="md"></i>Medium</span><span><i class="hi"></i>High</span></div>
    ${SES.msgs&&SES.msgs.length?`<div class="msgs"><h3>Key messages</h3>${li(SES.msgs,'teal')}</div>`:''}
    <div class="sesbtns"><button class="btn" id="sesRun">${ICON.play}Run session</button><button class="btn ghost" id="sesSave">Save</button><button class="btn ghost wkadd" data-addweek="ses">+ Week</button>${SES.o&&!SES.custom?`<button class="btn ghost" id="sesAgain">${gly('cycle')}Another version</button>`:''}</div>
  </div>
  <ol class="blocks">${SES.blocks.map((b,i)=>{const start=t; t+=b.min; const d=b.type==='drill'?drillById(b.id):null; const r=blockRPE(b), c=r<=3?'lo':r<=5?'md':'hi';
    const body=d?`<div class="brow"><div class="bprev">${miniPreview(d.sc)}</div><div style="min-width:0"><b>${esc(d.name)}</b><p>${esc(b.note||d.focus)}</p><div class="dmeta">${intDots(d.int)}<span>${esc(d.players.split(/ \(|,/)[0])}</span></div></div></div>`
      :b.type==='custom'?`<div><b class="cbname">${esc(b.name)}</b>${b.note?`<p>${esc(b.note)}</p>`:''}<div class="dmeta">${intDots(b.int||'Medium')}<span>Custom block</span></div></div>`
      :`<p>${esc(b.note||'')}</p>`;
    return `<li class="blk2 ${c}"><div class="bt mono">${start}′<small>to ${start+b.min}′</small></div>
     <div class="bmain"><p class="eyebrow">${esc(b.label)}</p>${body}
     <div class="bact"><div class="step"><button data-dm="${i}" aria-label="5 minutes less">−</button><span class="mono">${b.min}′</span><button data-dp="${i}" aria-label="5 minutes more">+</button></div>
      ${d?`<button class="mini" data-view="${d.id}">View</button><button class="ibtn" data-swap="${i}" aria-label="Swap drill" title="Swap drill">${IB.swap}</button>`:''}
      <button class="ibtn" data-edit="${i}" aria-label="Edit block" title="Edit">${IB.edit}</button>
      <span class="bsp"></span>
      <button class="ibtn" data-mu="${i}" aria-label="Move up" ${i===0?'disabled':''}>${IB.up}</button><button class="ibtn" data-md="${i}" aria-label="Move down" ${i===n-1?'disabled':''}>${IB.down}</button>
      <button class="ibtn" data-dup="${i}" aria-label="Duplicate">${IB.dup}</button><button class="ibtn" data-rm="${i}" aria-label="Remove">${IB.del}</button></div></div></li>`}).join('')}</ol>
  <div class="addrow"><button class="btn ghost" id="sesAddDrill">+ Add drill</button><button class="btn ghost" id="sesAddCustom">+ Custom block</button></div>
  <div class="card cbform" id="cbForm" hidden>
    <h3 id="cbHead">Custom block</h3>
    <label class="fl" for="cbName">Name</label><input id="cbName" class="inp" maxlength="60" placeholder="e.g. Shooting competition">
    <div class="fgrid"><div><label class="fl" for="cbMin">Minutes</label><select id="cbMin" class="sel">${[5,10,15,20,25,30,35,40,45].map(m=>`<option>${m}</option>`).join('')}</select></div>
    <div><label class="fl" for="cbInt">Intensity</label><select id="cbInt" class="sel"><option>Low</option><option selected>Medium</option><option>High</option></select></div></div>
    <label class="fl" for="cbNote">Notes for the coach</label><textarea id="cbNote" rows="3" placeholder="Set-up, rules and coaching points"></textarea>
    <div class="frow"><button class="btn" id="cbSave">Add block</button><button class="btn ghost" id="cbCancel">Cancel</button></div>
  </div>`;
  store.set('session',SES);
}
function insertBlock(bl){const i=SES.blocks.findIndex(b=>b.type==='cool'); SES.blocks.splice(i<0?SES.blocks.length:i,0,bl)}
function addToSession(id){
  const d=drillById(id); if(!d) return;
  if(!SES) SES=blankSession();
  insertBlock({type:'drill',label:d.cat==='Team'?'Team game':d.cat==='Unit'?'Unit work':'Technical',cat:d.cat,id,cands:[id],ci:0,min:minOf(d)});
  renderSession();
}
function blankSession(){return {title:'My session',custom:true,o:{...readOpts()},blocks:[{type:'warm',label:'Warm-up',min:12,note:pick(WARMS)},{type:'cool',label:'Cool-down & debrief',min:8,note:pick(COOLS)}],msgs:[]}}
function readOpts(){return {theme:$('#sTheme').value,minutes:+$('#sMin').value,players:+$('#sPlayers').value||16,md:$('#sMd').value,line:$('#sLine').value,struct:$('#sStruct').value}}
function setOpts(o){['Theme','Min','Players','Md','Line','Struct'].forEach(k=>{const v=o[{Theme:'theme',Min:'minutes',Players:'players',Md:'md',Line:'line',Struct:'struct'}[k]]; if(v!=null) $('#s'+k).value=v})}
function renderSaved2(){
  const list=store.get('sessions',[]);
  $('#sesSaved').innerHTML=list.length?list.map((s,i)=>`<div class="row"><div><b>${esc(s.title)}</b><small>${s.blocks.reduce((a,b)=>a+b.min,0)} min · ${s.blocks.length} blocks</small></div><div style="display:flex;gap:6px"><button class="mini" data-sopen="${i}">Open</button><button class="mini" data-sdel="${i}">Delete</button></div></div>`).join(''):'<p class="muted" style="margin:0">No saved sessions yet.</p>';
}
/* week builder */
const WEEKS_MD={2:['md3','md1'],3:['md4','md2','md1'],4:['md4','md3','md2','md1'],5:['md+1','md4','md3','md2','md1']};
function buildWeek(nDays,o){
  const focus=o.theme, alt={md4:'fitness',md3:focus,md2:'transition',md1:'setpieces','md+1':'possession'};
  const str={md4:'games',md3:'phase',md2:'classic',md1:'classic','md+1':'classic'};
  const len={md4:90,md3:90,md2:75,md1:60,'md+1':45};
  return WEEKS_MD[nDays].map(md=>buildSession({...o,theme:md==='md3'?focus:alt[md],md,struct:str[md],minutes:Math.min(len[md],o.minutes+15)}));
}
/* drill picker */
function renderPicker(){
  $('#pSeg').innerHTML=['All','Individual','Unit','Team'].map(c=>`<button data-pc="${c}" aria-pressed="${pCat===c}">${c}</button>`).join('');
  const q=pQ.trim().toLowerCase(); const inS=new Set((SES?SES.blocks:[]).map(b=>b.id).filter(Boolean));
  const ds=DRILLS.filter(d=>(pCat==='All'||d.cat===pCat)&&(!q||(d.name+' '+d.focus+' '+d.line).toLowerCase().includes(q)));
  $('#pickList').innerHTML=`<button class="prow newd" data-newdrill><span class="bprev nd">+</span><span class="pinfo"><b>Create a new drill</b><small>Design it on the pitch, then add it here</small></span><span class="padd">Create</span></button>`+(ds.length?ds.map(d=>`<button class="prow${inS.has(d.id)?' added':''}" data-add="${d.id}"><span class="bprev">${miniPreview(d.sc)}</span><span class="pinfo"><b>${esc(d.name)}</b><small>${d.custom?'Mine · ':''}${d.cat} · ${d.line} · ${esc(d.time)}</small></span><span class="padd">${inS.has(d.id)?'Added':'Add'}</span></button>`).join(''):'<p class="muted" style="padding:16px">No drills match.</p>');
}
function openPicker(){pCat='All'; pQ=''; $('#pSearch').value=''; renderPicker(); $('#pickSheet').hidden=false; document.body.classList.add('locked'); $('#pickScroll').scrollTop=0}
function closePicker(){$('#pickSheet').hidden=true; document.body.classList.remove('locked')}
function initSessions(){
  $('#sTheme').innerHTML=THEMES.map(t=>`<option value="${t.id}">${t.n}</option>`).join('');
  $('#sMd').innerHTML=MDS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
  $('#sLine').innerHTML=['All lines','Goalkeeping','Defence','Midfield','Forwards'].map(l=>`<option>${l}</option>`).join('');
  $('#sStruct').innerHTML=STRUCTS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('');
  $('#sMd').value='md3';
  renderTemplates();
  const saved=store.get('session',null);
  SES=saved&&Array.isArray(saved.blocks)&&saved.blocks.length?saved:buildSession(readOpts());
  if(SES.o) setOpts(SES.o);
  renderSession(); renderSaved2();
  const status=t=>{$('#sesStatus').className='status'; $('#sesStatus').textContent=t};
  $('#sBuild').onclick=()=>{SES=buildSession(readOpts()); renderSession(); status('Session built. Tap “Another version” for different drills.'); $('#sesPlan').scrollIntoView({behavior:'smooth',block:'start'})};
  $('#sTpl').addEventListener('click',e=>{const b=e.target.closest('[data-tpl]'); if(!b) return;
    if(b.dataset.tpl==='blank'){SES=blankSession(); renderSession(); status('Blank session: add drills or your own blocks.')}
    else {const T=TEMPLATES[+b.dataset.tpl]; setOpts({line:'All lines',...T.o}); SES=buildSession({...readOpts(),title:T.n}); renderSession(); status(`“${T.n}” built. Tap “Another version” for a different mix.`)}
    $('#sesPlan').scrollIntoView({behavior:'smooth',block:'start'})});
  $('#sWeek').onclick=()=>{const n=+$('#sDays').value; const wk=buildWeek(n,readOpts()); const list=store.get('sessions',[]); wk.slice().reverse().forEach(s=>list.unshift(s)); store.set('sessions',list.slice(0,40)); renderSaved2(); SES=wk[0]; renderSession(); status(`Built ${n} sessions for the week and added them to Saved sessions.`)};
  $('#sesPlan').addEventListener('input',e=>{if(e.target.id==='sesTitle'){SES.title=e.target.value; store.set('session',SES)}});
  $('#sesPlan').addEventListener('click',e=>{
    const g=k=>{const el=e.target.closest(`[data-${k}]`); return el?+el.dataset[k]:null};
    let i;
    if((i=g('dm'))!==null){SES.blocks[i].min=Math.max(5,SES.blocks[i].min-5); renderSession(); return}
    if((i=g('dp'))!==null){SES.blocks[i].min=Math.min(90,SES.blocks[i].min+5); renderSession(); return}
    if((i=g('rm'))!==null){SES.blocks.splice(i,1); renderSession(); return}
    if((i=g('mu'))!==null&&i>0){[SES.blocks[i-1],SES.blocks[i]]=[SES.blocks[i],SES.blocks[i-1]]; renderSession(); return}
    if((i=g('md'))!==null&&i<SES.blocks.length-1){[SES.blocks[i+1],SES.blocks[i]]=[SES.blocks[i],SES.blocks[i+1]]; renderSession(); return}
    if((i=g('dup'))!==null){SES.blocks.splice(i+1,0,JSON.parse(JSON.stringify(SES.blocks[i]))); renderSession(); return}
    if((i=g('swap'))!==null){const b=SES.blocks[i]; const used=new Set(SES.blocks.filter(x=>x!==b&&x.id).map(x=>x.id)); if(!b.cands||b.cands.length<2) b.cands=[b.id,...candidates(drillById(b.id).cat,SES.o||readOpts(),new Set([b.id]))]; let n=b.ci||0; for(let k=0;k<b.cands.length;k++){n=(n+1)%b.cands.length; if(!used.has(b.cands[n])) break} b.ci=n; b.id=b.cands[n]; b.note=''; renderSession(); return}
    if((i=g('edit'))!==null){const b=SES.blocks[i]; cbEdit=i; const f=$('#cbForm'); f.hidden=false; $('#cbHead').textContent='Edit block'; $('#cbSave').textContent='Save changes';
      $('#cbName').value=b.type==='custom'?b.name:b.type==='drill'?drillById(b.id).name:b.label; $('#cbName').disabled=b.type!=='custom'; $('#cbMin').value=String(Math.min(45,Math.round(b.min/5)*5)||5); $('#cbInt').value=b.int||(b.type==='drill'?drillById(b.id).int:'Medium'); $('#cbInt').disabled=b.type!=='custom'; $('#cbNote').value=b.note||''; f.scrollIntoView({behavior:'smooth',block:'center'}); return}
    const v=e.target.closest('[data-view]'); if(v){show('drills'); openDrill(v.dataset.view); return}
    if(e.target.closest('#sesAgain')){SES=buildSession({...SES.o,title:SES.title}); renderSession(); return}
    if(e.target.closest('#sesAddDrill')){openPicker(); return}
    if(e.target.closest('#sesAddCustom')){cbEdit=-1; const f=$('#cbForm'); f.hidden=false; $('#cbHead').textContent='Custom block'; $('#cbSave').textContent='Add block'; $('#cbName').disabled=false; $('#cbInt').disabled=false; $('#cbName').value=''; $('#cbNote').value=''; $('#cbMin').value='15'; $('#cbInt').value='Medium'; $('#cbName').focus(); return}
    if(e.target.closest('#cbCancel')){$('#cbForm').hidden=true; return}
    if(e.target.closest('#cbSave')){const name=$('#cbName').value.trim(), min=+$('#cbMin').value, int=$('#cbInt').value, note=$('#cbNote').value.trim();
      if(cbEdit>=0){const b=SES.blocks[cbEdit]; if(b.type==='custom'){if(!name){$('#cbName').focus(); return} b.name=name; b.label=name; b.int=int} b.min=min; b.note=note}
      else {if(!name){$('#cbName').focus(); $('#cbName').placeholder='Give the block a name'; return} insertBlock({type:'custom',label:'Custom',name,min,int,note})}
      SES.custom=SES.custom||cbEdit<0; renderSession(); return}
    if(e.target.closest('#sesRun')){openTimer({name:SES.title,seq:SES.blocks.map(b=>({n:b.type==='drill'?`${b.label}: ${drillById(b.id).name}`:b.type==='custom'?b.name:b.label,sec:b.min*60}))}); return}
    if(e.target.closest('#sesSave')){const list=store.get('sessions',[]); const c=JSON.parse(JSON.stringify(SES)); const k=list.findIndex(s=>s.title===c.title); if(k>=0) list[k]=c; else list.unshift(c); store.set('sessions',list.slice(0,40)); renderSaved2(); const b=$('#sesSave'); b.textContent='Saved ✓'; setTimeout(()=>{if(b.isConnected) b.textContent='Save'},1500)}
  });
  $('#sesSaved').addEventListener('click',e=>{
    const o=e.target.closest('[data-sopen]'); if(o){SES=JSON.parse(JSON.stringify(store.get('sessions',[])[+o.dataset.sopen])); if(SES.o) setOpts(SES.o); renderSession(); $('#sesPlan').scrollIntoView({behavior:'smooth'}); return}
    const d=e.target.closest('[data-sdel]'); if(d){if(d.dataset.sure){const l=store.get('sessions',[]); l.splice(+d.dataset.sdel,1); store.set('sessions',l); renderSaved2()} else {d.dataset.sure='1'; d.textContent='Tap to confirm'; setTimeout(()=>{if(d.isConnected){delete d.dataset.sure; d.textContent='Delete'}},3000)}}
  });
  $('#pSeg').addEventListener('click',e=>{const b=e.target.closest('[data-pc]'); if(b){pCat=b.dataset.pc; renderPicker()}});
  $('#pSearch').addEventListener('input',e=>{pQ=e.target.value; renderPicker()});
  $('#pickList').addEventListener('click',e=>{if(e.target.closest('[data-newdrill]')){closePicker(); openDrillEditor(null,{fromSession:true}); return} const b=e.target.closest('[data-add]'); if(!b) return; addToSession(b.dataset.add); renderPicker()});
  $('#pickSheet').addEventListener('click',e=>{if(e.target.id==='pickSheet'||e.target.closest('#pickX')||e.target.closest('#pickDone')) closePicker()});
  addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#pickSheet').hidden) closePicker()});
}
