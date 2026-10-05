/* ===== Separate attacking and defending formation scenes ===== */
function lanesZones(){return [[0,4,18,40,'WIDE'],[19,4,18,40,'HALF'],[38,4,24,40,'CENTRE'],[63,4,18,40,'HALF'],[82,4,18,40,'WIDE']].map(z=>[...z,'gold'])}
function attackScene(F){
  const S=formationScene(F), P=S.parts, ids=P.ids, R=i=>F.r[i], PL=PLANS[F.id]||PLANS['433'];
  const sh=a=>{const m={};a.forEach((p,i)=>m[ids[i]]=[p[0],p[1]]);return m};
  const fin=P.fin.map(p=>[...p]);
  const occupied=[[0,18],[19,37],[38,62],[63,81],[82,100]].filter(([a,b])=>fin.some((p,i)=>i&&p[1]<=30&&p[0]>=a&&p[0]<=b)).length;
  const f=[
    {h:'Base shape',c:`${F.name} ${F.v} at rest. Watch how it changes shape the moment we have the ball.`},
    {h:'Attacking shape',m:sh(fin),z:lanesZones(),c:`With the ball the ${F.name} becomes a ${F.ipN}. ${P.nOnLast} players on the last line, ${occupied} of the 5 vertical lanes occupied. Width from the touchlines, players between the lines, and a base behind the ball.`},
    {h:'Build-up',m:sh(P.build),b:'p0',c:PL.build},
    {h:'Build-up',b:ids[P.bH],c:`The ${R(P.bH)} receives with time. First look: break a line with a pass into midfield.`},
    {h:'Progression',m:sh(P.prog),b:ids[P.pH],c:PL.prog},
    {h:'Final third',m:sh(fin),b:ids[P.wH],c:PL.final},
    {h:'Box attack',m:sh(P.cross),c:`The ${R(P.wH)} attacks the byline. ${R(P.fH)} near post, ${R(P.f2)} far post, ${R(P.f3)} arrives for the cut-back. The rest stay behind the ball as rest defence.`},
    {h:'Finish',b:ids[P.fH],c:'Low cross to the near post, timed so the runner arrives as the ball does.'},
    {h:'Score',b:[46,0],c:PL.toA?`And when we win the ball back: ${PL.toA}`:'Goal.'}
  ];
  return {title:`Attacking · ${F.name} ${F.v}`,tag:`${F.name} attacking`,view:'full',e:S.e,b:'p0',f};
}
function defendScene(F){
  const S=formationScene(F), P=S.parts, ids=P.ids, R=i=>F.r[i], PL=PLANS[F.id]||PLANS['433'];
  const sh=a=>{const m={};a.forEach((p,i)=>m[ids[i]]=[p[0],p[1]]);return m};
  const ob0=[50,30];
  const midNeutral=F.b.map((p,i)=>i?[50+(p[0]-50)*.85,p[1]+2]:[50,95]);
  const f=[
    {h:'Defensive shape',m:{...sh(midNeutral),o:ob0},b:'o',c:`Without the ball the ${F.name} closes up into a ${F.lbN}. Keep 10–12 m between players and less than 35 m from the front line to the back line.`,z:[[14,30,72,38,'COMPACT','gold']]},
    {h:'High press',m:{...sh(P.press),o:P.pb},c:PL.press},
    {h:'Mid block',m:{...sh(P.mid),o:P.ob},z:P.zones,c:`${PL.block} Red zones show where this system is weakest.`},
    {h:'Low block',m:{...sh(P.low),o:P.ol},c:`Deep defending: a ${F.lbN} protecting the box. Nearest player presses the ball, everyone else protects the space in front of goal and the cut-back zone.`},
    {h:'Regain',m:{o:null},b:ids[P.lp],c:`The ${R(P.lp)} wins it. ${PL.toA}`},
    {h:'We attack',m:{...sh(P.cross),o:null},b:ids[P.wH],c:'Now picture the other transition: we are attacking and commit players forward.'},
    {h:'Counter-press',m:{...sh(P.cp),o:P.lost},b:'o',c:`Ball lost. ${PL.toD} The three nearest players hunt it for five seconds.`},
    {h:'Recover',m:{...sh(midNeutral),o:[50,40]},b:'o',c:'If the counter-press fails, everyone sprints back behind the ball into the defensive shape.'}
  ];
  return {title:`Defending · ${F.name} ${F.v}`,tag:`${F.name} defending`,view:'full',e:{...S.e,o:[null,null,'','o']},b:'p0',t:'d',f};
}
const ATT_PH=[['Attacking shape',1],['Build-up',2],['Progression',4],['Final third',5],['Box attack',6]];
const DEF_PH=[['Defensive shape',0],['High press',1],['Mid block',2],['Low block',3],['Counter-press',6]];
