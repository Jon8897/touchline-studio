/* redirect old app links (/#reset..., /#invite..., /#w...) to the app */
if(/^#(reset|invite|w)\./.test(location.hash)) location.replace('/app'+location.hash);
/* ===== Landing page demos ===== */
const DEMOS=[
 {k:'a',tag:'Attack',id:'at-overlap',n:'Overlap & cross',sub:'2v1 on the flank, then three runners in the box',note:'<b>Use it when</b> their full-back jumps out to your winger. The winger drags him inside, the overlapping player gets to the byline, and the cross arrives as the runners do.'},
 {k:'a',tag:'Attack',id:'at-thirdman',n:'Third-man combination',sub:'Bounce it, run beyond, slip the winger in',note:'<b>Use it when</b> their midfield marks tight. The striker drops, plays first time to a runner, and the third man faces goal.'},
 {k:'d',tag:'Defend',id:'dv-trap',n:'Wide pressing trap',sub:'Curve the press, use the touchline',note:'<b>Use it when</b> their full-back is weak on the ball. The striker blocks the switch, the pass wide is the trigger, three players close the trap.'},
 {k:'d',tag:'Defend',id:'dv-mid',n:'Mid block',sub:'Slide together, protect the middle',note:'<b>Use it when</b> they are better on the ball. Shift as the ball travels, keep 10–12 metres between players, intercept the pass inside.'},
 {k:'r',tag:'Under pressure',id:'through',n:'Beat the press',sub:'Find the free player, play through',note:'<b>Use it when</b> they press man-to-man. The keeper is the spare player: bait the press, drop the striker, and the third man is free.'},
 {k:'r',tag:'Drill',id:'drill:rondo',n:'Rondo 4v2',sub:'The classic possession drill',note:'<b>From the drill library:</b> hundreds of touches under pressure, sharp angles and instant counter-pressing in 12 minutes. Every drill comes with set-up, coaching points and a timer.'}
];
let dCur=0, dBoard=null, hBoard=null;
const formList=FORMATIONS.filter((f,i,a)=>a.findIndex(x=>x.name===f.name)===i||['433inv','442d'].includes(f.id));
function demoScene(D,formId,oppId){
  const F=FORMATIONS.find(f=>f.id===formId)||FORMATIONS[0];
  if(D.id.startsWith('drill:')){const d=DEMO_DRILLS[D.id.slice(6)]; return {...d.sc,fit:true,tag:d.name}}
  if(D.id.startsWith('at-')) return {...attVarScene(F,D.id,oppId),tag:`${F.name} v ${(FORMATIONS.find(f=>f.id===oppId)||{}).name}`};
  if(D.id.startsWith('dv-')) return {...defVarScene(F,D.id,oppId),tag:`${F.name} v ${(FORMATIONS.find(f=>f.id===oppId)||{}).name}`};
  return {...withContext(pressScene(F,D.id),{ours:false}),tag:`${F.name} under pressure`};
}
function renderDemo(){
  const D=DEMOS[dCur];
  $('#dTabs').innerHTML=DEMOS.map((x,i)=>`<button role="tab" class="dtab" data-di="${i}" aria-selected="${i===dCur}"><span class="k ${x.k}">${x.tag.toUpperCase()}</span><b>${x.n}</b><small>${x.sub}</small></button>`).join('');
  $('#dNote').innerHTML=D.note;
  const drill=D.id.startsWith('drill:');
  $('#dForm').disabled=drill; $('#dOpp').disabled=drill||D.id==='through';
  const sel=$('#dTabs [aria-selected="true"]'); if(sel&&matchMedia('(max-width:959px)').matches){const t=$('#dTabs'); t.scrollTo({left:sel.offsetLeft-16,behavior:RM?'auto':'smooth'})}
  dBoard.load(demoScene(D,$('#dForm').value,$('#dOpp').value),!RM);
}
function initLanding(){
  document.body.classList.add('landing');
  $('#yr').textContent=new Date().getFullYear();
  $('#dForm').innerHTML=FORMATIONS.map(f=>`<option value="${f.id}">${f.name} ${f.v}</option>`).join('');
  $('#dOpp').innerHTML=['433','442','4231','352','343'].map(o=>`<option value="${o}">${FORMATIONS.find(f=>f.id===o).name}</option>`).join('');
  $('#dOpp').value='442';
  dBoard=new Board($('#demoBoard'),{three:matchMedia('(min-width:900px)').matches});
  $('#dTabs').addEventListener('click',e=>{const b=e.target.closest('[data-di]'); if(b){dCur=+b.dataset.di; renderDemo()}});
  $('#dForm').onchange=renderDemo; $('#dOpp').onchange=renderDemo;
  renderDemo();
  // hero: rotate through a few patterns
  hBoard=new Board($('#heroBoard'),{});
  const HERO=[['dv-trap','433','442','Wide pressing trap'],['at-overlap','4231','541','Overlap & cross'],['at-halfspace','343','442','Half-space overload'],['dv-cpress','433','4231','Counter-press']];
  let hi=0;
  const nextHero=()=>{const [id,f,o,n]=HERO[hi%HERO.length]; const F=FORMATIONS.find(x=>x.id===f), O=FORMATIONS.find(x=>x.id===o);
    const sc=id.startsWith('at-')?attVarScene(F,id,o):defVarScene(F,id,o);
    hBoard.load({...sc,tag:n},!RM); $('#heroCap').textContent=`${n} · ${F.name} v ${O.name}`; hi++};
  nextHero();
  const orig=hBoard.begin.bind(hBoard);
  hBoard.begin=function(i){ if(i===0&&this._looped){this._looped=false; nextHero(); return} if(i===this.n-1) this._looped=true; return orig(i)};
  // pause animations when off screen
  if('IntersectionObserver' in window&&!RM){const io=new IntersectionObserver(es=>es.forEach(en=>{const b=en.target===$('#heroBoard')?hBoard:dBoard; if(en.isIntersecting) b.play(); else b.stop()}),{threshold:.25}); io.observe($('#heroBoard')); io.observe($('#demoBoard'))}
}
initLanding();
