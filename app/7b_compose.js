/* ===== Offline plan composer: coach's words -> 11v11 animation ===== */
const INTENTS=[
 ['at-lowblock',/break(ing)? (down )?(a |their |the )?(low )?block|against a (deep|low) block|when they sit deep|park the bus/i,'Breaking a low block'],
 ['at-underlap',/underlap/i,'Underlap & cut-back'],
 ['at-overlap',/overlap/i,'Overlap & cross'],
 ['at-thirdman',/third[- ]man|lay[- ]?off|bounce pass|wall pass/i,'Third-man combination'],
 ['at-switch',/switch (play|it|sides|the play)|weak side|far side|change the point/i,'Switch to the weak side'],
 ['at-halfspace',/half[- ]?space|overload/i,'Half-space overload'],
 ['at-f9',/false ?9|striker drops|9 drops/i,'False 9 & runners'],
 ['at-isolate',/isolate|1 ?v ?1|one v one|one on one/i,'Isolate the winger'],
 ['at-rotation',/rotat|interchange|swap positions/i,'Wide rotation'],
 ['at-behind',/in behind|over the top|through ball|beat (the|their) (high )?line|high line/i,'Ball in behind'],
 ['at-direct',/target man|second ball|flick[- ]on/i,'Direct play'],
 ['beatpress',/(they|opponents?|opposition|their \w+) (press|pressing|close us)|under pressure|beat(ing)? (the|their) press|escape the press|when we('re| are) pressed|against (a|their) press/i,'Beating the press'],
 ['long',/long ball|go long|direct|target man|second ball|kick long/i,'Going long'],
 ['switchgk',/use the keeper|through the keeper|switch (it|play)? ?(via|through) the (keeper|goalkeeper)/i,'Switch via keeper'],
 ['build',/build(ing)?[- ]?up|play(ing)? out|from the back|goal ?kick|keeper has (it|the ball)/i,'Build-up'],
 ['final',/final third|cross|overlap|underlap|wide|winger|byline|cut-?back|attack the box|score|finish|chance/i,'Final third'],
 ['counter',/counter[- ]?attack|break (quickly|fast)|when we win (it|the ball)|win (it|the ball) (and|then)|transition to attack/i,'Counter-attack'],
 ['cpress',/counter[- ]?press|gegen|win it back|when we lose (it|the ball)|lose the ball|lost the ball/i,'Counter-press'],
 ['trap',/trap|force (them|it|play) (wide|outside)|touchline|show (them|it) wide/i,'Pressing trap'],
 ['backpass',/back[- ]?pass|play(s)? (it )?backwards/i,'Back-pass trigger'],
 ['manpress',/man[- ]?to[- ]?man|man[- ]?mark|press (high|them|their)|high press|we press|press from the front/i,'High press'],
 ['mid',/mid[- ]?block|compact|shift (across|together)|zonal/i,'Mid block'],
 ['crosses',/defend(ing)? (crosses|the box)|(their|in) crosses|cross(es)? into (our|the) box/i,'Defending crosses'],
 ['low',/low block|sit deep|defend deep|park the bus|drop deep|protect (the|a) lead/i,'Low block'],
 ['rest',/rest defen|protect against (the )?counter|stay behind the ball/i,'Rest defence']
];
function findFormation(token,ctx){
  const name=token.replace(/\s/g,'').replace(/–/g,'-'), t=(ctx||'').toLowerCase();
  let c=FORMATIONS.filter(f=>f.name===name);
  if(!c.length){const alias={'4-1-2-1-2':'442d','4-3-1-2':'442d','5-2-3':'343','3-4-1-2':'352','4-5-1':'4141','3-1-4-2':'352','4-4-1-1':'4231','4-2-4':'442','3-2-5':'433inv','2-3-5':'433inv'}; if(alias[name]) c=[FORMATIONS.find(f=>f.id===alias[name])]}
  if(!c.length) return null;
  const pick=k=>c.find(f=>f.id===k);
  return (/false ?9/.test(t)&&pick('433f9'))||(/invert/.test(t)&&pick('433inv'))||(/(6|six|pivot) drops|back three/.test(t)&&pick('433six'))||(/diamond/.test(t)&&pick('442d'))||(/flat/.test(t)&&pick('442'))||c[0];
}
function detectForms(text){
  let ours=null,opp=null; const re=/\b[2-5]\s*[-–]\s*[1-6]\s*[-–]\s*[1-5](?:\s*[-–]\s*[1-4])?\b/g; let m;
  while((m=re.exec(text))){
    const before=text.slice(Math.max(0,m.index-32),m.index).toLowerCase(), after=text.slice(m.index+m[0].length,m.index+m[0].length+28);
    const F=findFormation(m[0],after); if(!F) continue;
    const isOpp=/(their|against|vs\.?|versus|opponents?|opposition|they)(\W+\w+){0,3}\W*$/.test(before);
    if(isOpp&&!opp) opp=F; else if(!ours&&!isOpp) ours=F; else if(!opp) opp=F;
  }
  return {ours,opp};
}
function segFrames(kind,F,O,P){
  const sh=(pre,arr)=>{const m={}; arr.forEach((p,i)=>m[pre+i]=[Math.round(p[0]*10)/10,Math.round(p[1]*10)/10]); return m};
  const os=O?oppShapes(O):null;
  const att=()=>attackScene(F).f;
  const fromScene=(sc)=>{const pre={...Object.fromEntries(Object.entries(sc.e).filter(([k,v])=>v[0]!=null&&(/^p\d+$/.test(k)||/^q\d+$/.test(k))).map(([k,v])=>[k,[v[0],v[1]]]))}; return [{m:pre,b:sc.b,_set:true},...sc.f]};
  switch(kind){
    case 'build': return [{m:{...sh('p',P.build),...(os?sh('q',os.mid):{})},b:'p0',_set:true},...att().slice(3,5)];
    case 'final': return [{m:sh('p',P.prog),b:'p'+P.pH,_set:true},...att().slice(5,9)];
    case 'beatpress': case 'long': case 'switchgk':{const r=kind==='beatpress'?'through':kind==='long'?'long':'switch'; const sc=pressScene(F,r); return [{m:{...sh('p',P.build),...(os?{q0:[50,4]}:{})},b:'p0',_set:true},...sc.f]}
    case 'counter': return [{m:sh('p',P.low),b:'p'+P.lp,_set:true,h:'Regain'},{m:sh('p',P.prog),b:'p'+P.pH,h:'Break'},{m:sh('p',P.fin),b:'p'+P.wH,h:'Attack'},{m:sh('p',P.cross),h:'Box'},{b:'p'+P.fH,h:'Finish'}];
    default:{if(kind.startsWith('at-')){const V=ATT_VARS.find(v=>v.id===kind); if(!V||!O) return null; return fromScene(V.gen(F,O))}
      const map={cpress:'dv-cpress',trap:'dv-trap',backpass:'dv-backpass',manpress:'dv-man',mid:'dv-mid',crosses:'dv-low',low:'dv-low',rest:'dv-rest'}; const V=DEF_VARS.find(v=>v.id===map[kind]); if(!V||!O) return null; return fromScene(V.gen(F,O))}
  }
}
function composePlan(text,formSel,oppSel){
  const det=detectForms(text);
  const F=formSel!=='auto'?FORMATIONS.find(f=>f.id===formSel):(det.ours||FORMATIONS[0]);
  const oppId=oppSel!=='auto'?oppSel:(det.opp?det.opp.id:'433'); const O=oppId==='none'?null:FORMATIONS.find(f=>f.id===oppId);
  const P=formationScene(F).parts;
  const clauses=text.replace(/\s+/g,' ').split(/(?<=[.!?;:])\s+|\n+|,\s*|\s+(?=(?:and )?then\b|after that\b|when we\b|when they\b|if they\b|if we\b|and when\b|out of possession\b|in possession\b)|\s+and\s+(?=we\b|our\b|they\b|if\b|when\b|press\b|defend\b|sit\b|force\b|counter|attack\b|break\b|go\b|win\b|build\b|play\b)/i).map(s=>s.trim()).filter(s=>s.length>2);
  const segs=[];
  clauses.forEach(sen=>{
    let hits=INTENTS.map(([k,re])=>{const m=re.exec(sen); return m?[k,m.index]:null}).filter(Boolean).sort((a,b)=>a[1]-b[1]).map(x=>x[0]);
    const has=k=>hits.includes(k), drop=(...ks)=>{hits=hits.filter(h=>!ks.includes(h))};
    if(has('at-lowblock')) drop('low','mid');
    if(has('crosses')) drop('low','final');
    if(has('at-underlap')) drop('at-overlap');
    if(hits.some(h=>h.startsWith('at-')||['trap','manpress','mid','low','crosses','backpass','cpress','rest'].includes(h))) drop('final');
    if(/\b(they|their|opponents?)\b[^.]*\b(long|second ball)/i.test(sen)) drop('at-direct','long');
    if(has('beatpress')) drop('manpress','long','build');
    if(has('trap')) drop('manpress');
    if(has('at-direct')) drop('long');
    if(has('cpress')) drop('counter');
    hits=[...new Set(hits)];
    const needsOpp=k=>!['build','final','counter','beatpress','long','switchgk'].includes(k);
    const ok=hits.filter(k=>!(O==null&&needsOpp(k)));
    if(ok.length) ok.forEach((k,j)=>{ if(segs.length&&segs[segs.length-1].k===k) return; segs.push({k,sen:j===0?sen:''}) });
    else if(segs.length) segs[segs.length-1].extra=(segs[segs.length-1].extra||'')+' '+sen;
  });
  const used=segs.length?segs:[{k:'build',sen:''},{k:'final',sen:''},{k:'mid',sen:''}].filter(s=>O||s.k!=='mid');
  const e={}; F.r.forEach((r,i)=>e['p'+i]=[F.b[i][0],F.b[i][1],r]); if(O){const ob=oppShapes(O).base; O.r.forEach((r,i)=>e['q'+i]=[ob[i][0],ob[i][1],r,'o'])}
  const f=[]; const label=k=>(INTENTS.find(x=>x[0]===k)||[,,'Plan'])[2];
  f.push({h:'Line-up',c:`${F.name} ${F.v}${O?' against a '+O.name:''}. ${segs.length?'Here is the plan, step by step.':'No specific phases recognised, so here is the shape in build-up, attack and defence.'}`});
  used.slice(0,8).forEach(sg=>{const fr=segFrames(sg.k,F,O,P); if(!fr) return;
    fr.forEach((x,j)=>{const g={...x}; delete g._set; g.m={...(g.m||{})}; for(const id in g.m) if(!(id in e)) delete g.m[id]; if(typeof g.b==='string'&&!(g.b in e)) delete g.b; if(g.b==='o') delete g.b;
      if(j===0){g.h=label(sg.k); g.c=(sg.sen?sg.sen+(sg.extra?' '+sg.extra:''):x.c)||label(sg.k); g.d=1500}
      f.push(g)})});
  return {title:(segs.length?segs.slice(0,2).map(s=>label(s.k)).join(' + '):'Team shape')+` · ${F.name}`,form:F.id,opp:O?O.id:'none',e,b:'p0',f,recognised:segs.map(s=>label(s.k)),F,O};
}
