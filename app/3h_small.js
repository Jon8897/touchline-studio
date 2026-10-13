/* ===== Small-sided formations: 5, 7 and 9-a-side (same ids as the team sheet) =====
   Same scene builders as 11-a-side (formationScene / attackScene / defendScene), with an opponent of the same size. */
const SMALL_FORMS=[
{id:'s5-121',n:5,name:'1-2-1',v:'Diamond',fam:'5-a-side',r:['GK','CB','LM','RM','ST'],
 b:[[50,95],[50,74],[22,56],[78,56],[50,36]], ip:[[50,90],[50,62],[12,38],[88,38],[50,20]], lb:[[50,96],[50,84],[30,72],[70,72],[50,58]],
 ipN:'1-2-1 wide',lbN:'1-2-1 tight',
 desc:'A diamond: one at the back, two wide, one up front. The most common 5-a-side shape because every player always has a passing angle.',
 str:['Natural triangles everywhere, so there is always a pass on','Width from the two wide players stretches a small pitch','Clear jobs that young players learn quickly'],
 wk:['One defender can be left 1v1 if the wide players don’t track back','The striker gets isolated if the wide players stay deep','Gaps between the lines if the diamond gets too big'],
 best:'U7–U8 teams learning to spread out and pass, and any team with a confident last defender.',
 wz:[[34,62,32,12,'SPACE']]},
{id:'s5-22',n:5,name:'2-2',v:'Box',fam:'5-a-side',r:['GK','LCB','RCB','LST','RST'],
 b:[[50,95],[32,74],[68,74],[32,44],[68,44]], ip:[[50,90],[18,60],[82,60],[30,24],[70,24]], lb:[[50,96],[36,84],[64,84],[38,68],[62,68]],
 ipN:'2-2 wide',lbN:'2-2 compact',
 desc:'Two at the back and two up front. Simple, solid and easy to understand: defenders defend, attackers attack, and everyone helps.',
 str:['Always two defenders behind the ball','Two attackers can combine and press as a pair','Very easy for young players to understand'],
 wk:['A big gap in the middle if the pairs split apart','Fewer passing angles than the diamond','Teams that play through the middle can cut it open'],
 best:'Teams that want safety at the back, or players new to positions.',
 wz:[[38,52,24,14,'MIDDLE']]},
{id:'s7-231',n:7,name:'2-3-1',v:'Classic',fam:'7-a-side',r:['GK','LCB','RCB','LM','CM','RM','ST'],
 b:[[50,95],[32,76],[68,76],[16,54],[50,58],[84,54],[50,34]], ip:[[50,90],[22,64],[78,64],[10,32],[50,46],[90,32],[50,18]], lb:[[50,96],[38,85],[62,85],[22,74],[50,76],[78,74],[50,58]],
 ipN:'2-1-3',lbN:'2-3-1 compact',
 desc:'Two defenders, three across the middle and a striker. The standard 7-a-side shape: balanced, with width and a clear spine.',
 str:['Good balance between attack and defence','Wide midfielders give width and get forward','A clear spine: keeper, centre-backs, CM, striker'],
 wk:['The two defenders can be stretched by wide attacks','The CM has a lot of ground to cover','The striker needs support quickly or gets isolated'],
 best:'Most U9–U10 teams. A great default while players learn every position.',
 wz:[[8,62,18,12,'WIDE'],[74,62,18,12,'WIDE']]},
{id:'s7-321',n:7,name:'3-2-1',v:'Back three',fam:'7-a-side',r:['GK','LB','CB','RB','LCM','RCM','ST'],
 b:[[50,95],[18,72],[50,77],[82,72],[34,54],[66,54],[50,34]], ip:[[50,90],[10,46],[50,68],[90,46],[36,36],[64,36],[50,18]], lb:[[50,96],[24,84],[50,86],[76,84],[38,72],[62,72],[50,58]],
 ipN:'1-4-1',lbN:'3-2-1',
 desc:'Three at the back, two in midfield and a striker. Solid against quick wingers, and the wide defenders love to bomb on.',
 str:['Three defenders cover the width of a 7-a-side pitch','Wide defenders can carry the ball forward','Two midfielders support each other'],
 wk:['Only two in midfield, so it can be outnumbered centrally','Lots of running for the wide defenders','The striker needs midfield runners to support him'],
 best:'Teams that concede down the wings, with defenders who are comfortable on the ball.',
 wz:[[30,44,40,12,'MIDDLE']]},
{id:'s7-2121',n:7,name:'2-1-2-1',v:'Diamond',fam:'7-a-side',r:['GK','LCB','RCB','DM','LM','RM','ST'],
 b:[[50,95],[32,77],[68,77],[50,64],[20,48],[80,48],[50,32]], ip:[[50,90],[24,68],[76,68],[50,54],[10,30],[90,30],[50,18]], lb:[[50,96],[38,86],[62,86],[50,77],[26,72],[74,72],[50,58]],
 ipN:'2-1-2-1 wide',lbN:'2-3-1',
 desc:'A diamond midfield: a holding player in front of the defence and two wide midfielders behind the striker. Great for passing triangles.',
 str:['The holding player protects the defence','Lots of triangles for quick passing','Wide midfielders arrive late in the box'],
 wk:['The flanks can be exposed if the wide players push too high','Relies on the holding player reading the game','Needs good communication in the diamond'],
 best:'Passing teams with one calm player who likes to sit and organise.',
 wz:[[8,58,20,12,'WIDE'],[72,58,20,12,'WIDE']]},
{id:'s9-332',n:9,name:'3-3-2',v:'Two strikers',fam:'9-a-side',r:['GK','LB','CB','RB','LM','CM','RM','LST','RST'],
 b:[[50,95],[18,74],[50,78],[82,74],[16,54],[50,58],[84,54],[38,34],[62,34]], ip:[[50,90],[12,52],[50,70],[88,52],[8,32],[50,48],[92,32],[38,18],[62,18]], lb:[[50,96],[24,85],[50,87],[76,85],[22,72],[50,74],[78,72],[40,58],[60,58]],
 ipN:'1-3-2-2',lbN:'3-3-2',
 desc:'Three at the back, three in midfield and two strikers. Strikers work as a pair, and the wide midfielders give the team its width.',
 str:['Two strikers can combine and press their defenders','Three across midfield covers the width','Simple lines of three that are easy to coach'],
 wk:['Wide midfielders have a lot of running to do','Space between midfield and attack if the strikers stay high','The CM can be outnumbered by a midfield of four'],
 best:'U11–U12 teams with two forwards who like playing together.',
 wz:[[30,44,40,12,'BETWEEN']]},
{id:'s9-323',n:9,name:'3-2-3',v:'Front three',fam:'9-a-side',r:['GK','LB','CB','RB','LCM','RCM','LW','ST','RW'],
 b:[[50,95],[18,74],[50,78],[82,74],[36,58],[64,58],[16,38],[50,32],[84,38]], ip:[[50,90],[14,54],[50,70],[86,54],[36,44],[64,44],[10,20],[50,16],[90,20]], lb:[[50,96],[24,85],[50,87],[76,85],[38,74],[62,74],[18,70],[50,58],[82,70]],
 ipN:'1-4-3',lbN:'3-4-1',
 desc:'Three defenders, two central midfielders and a front three. An attacking shape that presses high and gets lots of players forward.',
 str:['A front three to press and attack','Wingers stretch the pitch for the striker','Good preparation for 4-3-3 at 11-a-side'],
 wk:['Two midfielders can be outnumbered','Wingers must track back or the wide defenders are exposed','Leaves space behind when it presses'],
 best:'Attacking teams with quick wingers, moving on to 11-a-side soon.',
 wz:[[8,54,20,12,'WIDE'],[72,54,20,12,'WIDE']]},
{id:'s9-3131',n:9,name:'3-1-3-1',v:'Holding midfielder',fam:'9-a-side',r:['GK','LB','CB','RB','DM','LM','AM','RM','ST'],
 b:[[50,95],[18,74],[50,78],[82,74],[50,63],[16,48],[50,46],[84,48],[50,30]], ip:[[50,90],[14,56],[50,72],[86,56],[50,58],[8,28],[50,34],[92,28],[50,16]], lb:[[50,96],[24,85],[50,87],[76,85],[50,78],[22,72],[50,66],[78,72],[50,56]],
 ipN:'1-3-1-3',lbN:'3-1-3-1',
 desc:'A holding midfielder protects the back three while an attacking midfielder plays behind the striker. Balanced and good for possession.',
 str:['The holding midfielder screens the defence','The attacking midfielder links play to the striker','Lots of passing lanes through the middle'],
 wk:['Wide midfielders have to cover a lot of ground','Space beside the holding midfielder','The striker can be isolated if the AM doesn’t get forward'],
 best:'Possession teams with a calm holding player and a creative 10.',
 wz:[[24,56,20,12,'SPACE'],[56,56,20,12,'SPACE']]}
];
const SMALL_PLANS={
 's5-121':{build:'The keeper rolls it to the defender or a wide player. Wide players stay right on the touchlines to make the pitch big.',prog:'Pass into the striker’s feet, then the wide players run past for the return.',final:'The striker holds it up, a wide player arrives at the back post, and the defender stays back.',press:'The striker presses the ball, the wide players squeeze in and the defender stays as cover.',block:'Get compact: the wide players tuck in beside the defender and the striker drops to the halfway line.',toD:'The nearest player presses straight away; everyone else gets back behind the ball.',toA:'Look for the striker first, then the wide player running forward.',vs:['If they press high, the keeper is the spare player','Wide players drop to make a short pass easy','If both wide players are marked, pass long to the striker']},
 's5-22':{build:'The two defenders split wide and the keeper picks the free one.',prog:'Defender passes up to a striker, who lays it back or turns.',final:'The two strikers combine: one goes short, one goes in behind.',press:'Both strikers press together, one on the ball and one blocking the pass back across.',block:'The front pair drop to the halfway line and the back pair hold the edge of the box.',toD:'Nearest striker presses; the defenders get goal-side straight away.',toA:'Quick pass to a striker before their defenders recover.',vs:['Keeper joins in as an extra defender','A striker drops short to give an option','Switch to the other defender if one side is pressed']},
 's7-231':{build:'Centre-backs split, the CM shows between them and the wide midfielders stay wide.',prog:'Find the CM on the half-turn, or play down the line to the wide midfielder.',final:'Wide midfielder takes on the defender, the striker attacks the near post and the far-side midfielder arrives at the back post.',press:'The striker presses a defender, the wide midfielders jump onto their wide players and the CM covers.',block:'The midfield three tuck in and stay close to the two defenders. Show them wide.',toD:'The three nearest players press for five seconds; both centre-backs stay back.',toA:'Look for the striker or a wide midfielder running into space.',vs:['The CM drops between the centre-backs to make three at the back','Use the keeper as the spare player','Pass long to the striker with the CM close for the second ball']},
 's7-321':{build:'The keeper finds a wide defender, who steps forward with the ball.',prog:'Wide defender carries it forward and passes into a midfielder.',final:'Both midfielders support the striker; one wide defender overlaps.',press:'The striker and both midfielders press; the back three step up together.',block:'Back three stay narrow, midfielders sit in front, and the striker blocks the middle.',toD:'Counter-press with the midfielders; the back three hold their line.',toA:'Wide defenders run forward, and the striker runs in behind.',vs:['Middle defender drops between the keeper and the wide defenders','Midfielders show for the ball at angles','Go long to the striker if they press with everyone']},
 's7-2121':{build:'The holding player drops between the centre-backs and the wide midfielders stay high and wide.',prog:'Into the holding player, who turns and finds a wide midfielder.',final:'Wide midfielders get to the byline and cut it back; the striker attacks the near post.',press:'The striker and wide midfielders press across; the holding player stays as cover.',block:'Wide midfielders drop level with the holding player to make a line of three.',toD:'The holding player stays; the others press for five seconds.',toA:'First look: striker. Second: the wide midfielder on the far side.',vs:['The holding player drops to make three at the back','Keeper switches it to the free side','Striker drops to link play if the midfield is crowded']},
 's9-332':{build:'Back three spread across the box, the CM shows in the middle and the wide midfielders hold the width.',prog:'Into the CM, or down the line to the wide midfielder, with a striker dropping to link.',final:'One striker drops, one runs in behind, and the wide midfielders cross for both.',press:'The two strikers press their centre-backs; the midfield three slide across behind them.',block:'Two banks of three in front of the box; the strikers screen their midfield.',toD:'Counter-press with the nearest three; the back three stay.',toA:'Look for the strikers straight away while the other team are out of shape.',vs:['The CM drops into the back three to make four','Keeper switches it to the free wide defender','A striker drops short to receive under pressure']},
 's9-323':{build:'Back three split, both midfielders show, and the front three pin their defenders.',prog:'Into a midfielder, who turns and finds a winger 1v1.',final:'Wingers take on their defenders, the striker attacks the near post and a midfielder arrives for the cut-back.',press:'The front three press their back line, and the midfielders jump onto their midfield.',block:'Wingers drop back beside the midfielders to make a line of four.',toD:'Front three counter-press; the back three and one midfielder stay back.',toA:'Wingers run in behind straight away.',vs:['One midfielder drops into the back line','Wingers come short to receive','Long ball to the striker with the wingers running past']},
 's9-3131':{build:'The holding midfielder drops in front of the back three; the wide midfielders stay wide.',prog:'Through the holding midfielder into the AM between the lines.',final:'The AM plays the striker in; the wide midfielders attack the back post.',press:'The striker and AM press together; the wide midfielders jump onto their wide players.',block:'The AM drops beside the holding midfielder; the wide midfielders tuck in.',toD:'The holding midfielder and the back three stay; the rest press.',toA:'Find the AM or the striker before their midfield recovers.',vs:['Holding midfielder drops between the defenders','AM drops deeper to receive','Keeper switches to the free side']}
};
Object.assign(PLANS, SMALL_PLANS);
const isSmall=F=>!!(F&&F.n&&F.n<11);
const allForms=()=>FORMATIONS.concat(SMALL_FORMS);
const formById=id=>allForms().find(f=>f.id===id);
/* an opponent with the same number of players: the first formation of that size, mirrored */
function smallCtx(F){
  const O=SMALL_FORMS.find(f=>f.n===F.n)||F, L=(a,b,t)=>a+(b-a)*t, mir=a=>a.map(p=>[100-p[0],100-p[1]]);
  return {oppDef:mir(O.b), oppAtt:mir(O.b.map((p,i)=>[L(p[0],O.ip[i][0],.45),L(p[1],O.ip[i][1],.45)])), oppR:O.r};
}
function smallScene(F,m){
  const sc=m==='def'?defendScene(F):m==='cycle'?formationScene(F):attackScene(F);
  return withContext(sc,{ours:false,oppCount:F.n-1,shapes:smallCtx(F)});
}
