/* ===== Positions ===== */
const POSITIONS=[
{id:'gk',num:'1',name:'Goalkeeper',short:'GK',fit:'gk',
 sum:'The last defender and the first attacker. A modern keeper stops shots, commands the box and starts the build-up with both feet.',
 stats:[['5–6 km','distance per match'],['30–45','passes per match'],['<0.3 s','reaction window on close shots']],
 attrs:['Shot-stopping','Handling','Angles & positioning','Command of the box','Distribution with both feet','Communication'],
 att:['Stay 5–10 m behind your centre-backs at an angle so they can always play back to you','Scan before the ball arrives so your first touch sets up the pass','Find the free player: if the striker presses one centre-back, the other is open','Choose the speed: short and quick to beat a press, long and early to beat a high line','Release quickly after a catch to start counter-attacks'],
 def:['Stand on the line between the ball and the centre of the goal; adjust with every pass','Set your feet before the shot: on your toes, weight forward','Your starting position rises with the defensive line: behind a high line, stand 10–15 m off your line','Commit fully on crosses and call early: “Keeper!” or “Away!”','In 1v1s stay big and upright as long as possible and spread late','Organise the wall and the back line at set pieces'],
 mis:['Flat-footed when the shot comes','Parrying back into the middle of the goal','Late or quiet calls on crosses','Hurried distribution when there is no pressure'],
 drills:['gk-react','gk-cross','build-3v2','corners'],
 sc:[
 {t:'a',title:'Beat the press: find the free centre-back',view:'def',e:{h:[50,96,'GK'],a:[34,90,'LCB'],b:[66,90,'RCB'],c:[50,78,'6'],d:[12,74,'LB'],f:[88,74,'RB'],x:[50,80,'9','o'],y:[38,74,'8','o']},b:'h',f:[
  {h:'Set-up',c:'You have the ball. Both centre-backs split to the edges of the box and the 6 shows in the middle.',m:{a:[24,92],b:[76,92]}},
  {h:'Read',c:'Their striker curves his run to press you and cuts off the pass to the left centre-back.',m:{x:[42,93],y:[30,84]}},
  {h:'Play',c:'The right centre-back is now free. Open your body and play a firm pass to his far foot.',b:'b',m:{b:[78,90]}},
  {h:'Break',c:'He drives into the space in front of him. One pass has taken out their first line of pressure.',m:{b:[72,76],f:[90,60],x:[56,88]}},
  {h:'Support',c:'Re-position 6–8 m behind your defenders so you are always the safe back-pass option.',m:{h:[58,93]}}]},
 {t:'a',title:'Sweeper keeper: claim the ball behind the line',view:'def',e:{h:[50,95,'GK'],a:[38,62,'LCB'],b:[62,62,'RCB'],x:[48,58,'9','o'],y:[50,46,'8','o']},b:'y',f:[
  {h:'Start position',c:'Your back line is high. Start well off your line, around 14 m out, to cover the space behind it.',m:{h:[50,83]}},
  {h:'Read',c:'Their midfielder lifts his head to play the ball in behind. Read the pass early.',m:{y:[50,44]}},
  {h:'Decide',c:'Ball played over the top. If you will arrive first, go now and call “Keeper!” loudly.',b:[50,74],m:{x:[50,70],a:[42,70],b:[58,70],h:[50,76]}},
  {h:'Act',c:'You win the race. Control it with your feet and pass to a teammate instead of just clearing.',b:'a',m:{h:[50,75],a:[34,74]}}]},
 {t:'d',title:'Positioning for a cross',view:'def',e:{h:[50,98,'GK'],a:[44,90,'CB'],b:[56,90,'CB'],d:[80,84,'RB'],x:[86,76,'11','o'],y:[50,84,'9','o'],z:[38,88,'10','o']},b:'x',f:[
  {h:'Start position',c:'Ball wide. Stand in the back half of the goal, about two-thirds across toward the far post, on your toes.',m:{h:[54,97]}},
  {h:'Read',c:'The winger beats the full-back and reaches the byline. Shift toward the near post as the angle changes.',m:{x:[90,92],d:[86,90],h:[58,97]}},
  {h:'Attack the ball',c:'The cross comes in. Call “Keeper!” and attack it at its highest point, take-off on one leg, knee up for protection.',b:[50,93],m:{y:[50,92],h:[51,94]}},
  {h:'Secure',c:'Catch it if you can. If you punch, punch high and wide, never back into the middle.',b:'h',m:{h:[50,93]}}]},
 {t:'d',title:'1v1 against a striker',view:'def',e:{h:[50,98,'GK'],x:[50,70,'9','o'],a:[40,70,'CB']},b:'x',f:[
  {h:'Close down',c:'Striker is through. Come off your line quickly while the ball is away from his feet.',m:{x:[50,80],h:[50,92],a:[44,80]}},
  {h:'Set',c:'Set your feet just before he touches the ball again. Never be moving when the shot comes.',m:{x:[51,85],h:[50,89]}},
  {h:'Stay big',c:'Stay upright, arms wide, and close the angle to the near post. Make him decide first.',m:{x:[56,87],h:[53,90]}},
  {h:'Spread',c:'As he shoots, spread low and wide to block. Recover to your feet immediately.',b:'h',m:{x:[57,88],h:[54,90]}}]}
 ]},

{id:'cb',num:'4',name:'Centre-back',short:'CB',fit:'cb',
 sum:'The organiser of the back line. Wins duels in the air and on the ground, protects the box and, in the modern game, starts attacks by breaking lines with passes and carries.',
 stats:[['9.5–10.5 km','distance per match'],['15–25','sprints per match'],['5–10','aerial duels']],
 attrs:['Heading','Tackling & timing','Reading the game','Line-breaking passing','Composure under pressure','Leadership'],
 att:['Split wide to the edges of the box when the keeper has it','Carry the ball into free space to drag a presser out','Play forward first: through the lines into a midfielder or striker','Use the long diagonal to switch play when the opponent has shifted','Stay in a back line behind the ball (rest defence) to stop counters'],
 def:['Get goal-side and keep the ball and your man in view','Talk constantly: “Step!”, “Drop!”, “Man on!”','Step out with a striker who drops; your partner covers behind','Hold the line together; squeeze up when the ball goes backwards','In the box, attack the ball first and clear high, wide and far'],
 mis:['Ball-watching and losing your runner','Diving in when you only need to delay','Playing square passes into pressure','Dropping too deep and playing others onside'],
 drills:['cb-aerial','def-footwork','back4','build-3v2','corners'],
 sc:[
 {t:'a',title:'Break the first line with a pass',view:'mid',e:{h:[36,80,'LCB'],a:[64,80,'RCB'],b:[50,68,'6'],c:[32,56,'8'],d:[50,36,'9'],x:[50,70,'9','o'],y:[38,58,'8','o'],z:[62,58,'8','o']},b:'h',f:[
  {h:'Scan',c:'You have the ball. Their striker stands in front of your 6 to block the simple pass.'},
  {h:'Carry',c:'Drive forward into the space in front of you. Carrying the ball makes an opponent come to you.',m:{h:[36,70],y:[36,63]}},
  {h:'Break the line',c:'Their midfielder steps out, so a gap opens. Pass through the line into your 8.',b:'c',m:{c:[30,52]}},
  {h:'Recover',c:'Your 8 turns with two opponents out of the game. Get back into your position in the line.',m:{c:[34,46],h:[38,76]}}]},
 {t:'a',title:'Switch play with a long diagonal',view:'full',e:{h:[36,78,'LCB'],a:[62,78,'RCB'],b:[12,62,'LB'],c:[88,58,'RB'],d:[88,36,'RW'],e:[32,56,'8'],x:[28,62,'7','o'],y:[40,58,'8','o'],z:[22,50,'2','o'],w:[78,32,'3','o']},b:'h',f:[
  {h:'Scan',c:'The opponent has shifted across to your side. Before receiving, check where the free player is.'},
  {h:'Spot',c:'Your right winger is isolated 1v1 against their full-back on the far side.',m:{d:[88,34]}},
  {h:'Switch',c:'Strike a driven diagonal into his path: low, flat and to his front foot.',b:'d',m:{d:[90,30]},d:1600},
  {h:'Result',c:'They have to shift 40 metres across. Your winger is 1v1 with time to attack.',m:{x:[46,60],y:[58,56],z:[38,48],w:[84,30]}}]},
 {t:'d',title:'Defend a cross in the box',view:'def',e:{h:[42,86,'LCB'],a:[56,86,'RCB'],d:[82,80,'RB'],g:[50,98,'GK'],x:[86,74,'11','o'],y:[46,82,'9','o'],z:[58,84,'10','o']},b:'x',f:[
  {h:'Position',c:'Ball wide. Stay goal-side of your striker and see both the ball and the man, with an open body.'},
  {h:'Track',c:'The winger reaches the byline and your striker darts to the near post. Go with him.',m:{x:[88,90],y:[54,90],h:[52,90],z:[60,88],a:[60,89]}},
  {h:'Attack',c:'Get in front of him and attack the ball first. Head through the middle of the ball.',b:[52,90],m:{h:[53,91]}},
  {h:'Clear',c:'Head it high, wide and far, away from the centre. Then push the line out together.',b:[26,66],m:{h:[50,84],a:[60,82]}}]},
 {t:'d',title:'Step out on a dropping striker',view:'mid',e:{h:[60,76,'RCB'],a:[40,76,'LCB'],d:[14,72,'LB'],c:[86,72,'RB'],x:[56,68,'9','o'],y:[50,46,'8','o']},b:'y',f:[
  {h:'Read',c:'Their striker drops off to receive with his back to goal.',m:{x:[58,57]}},
  {h:'Step',c:'Step out early and follow him toward the ball. Your partner and full-back slide across to cover.',m:{h:[58,61],a:[50,74],d:[22,74]}},
  {h:'Engage',c:'The pass arrives and you are already touch-tight. Stop him turning: low, side-on, eyes on the ball.',b:'x',m:{h:[58,60]}},
  {h:'Win it',c:'Nick the ball when it moves away from his feet, then get back into the line.',b:'h',m:{h:[57,58],x:[60,56]}}]}
 ]},

{id:'fb',num:'2',name:'Full-back',short:'FB',fit:'fb',
 sum:'Defends the flank 1v1 and joins attacks with overlaps, underlaps or by tucking into midfield. Needs to repeat high-speed runs all game.',
 stats:[['10.5–11.5 km','distance per match'],['25–35','sprints per match'],['3–8','crosses per match']],
 attrs:['1v1 defending','Recovery pace','Crossing','Stamina','Timing of runs','Positional discipline'],
 att:['Give width when the winger comes inside; tuck inside when the winger holds the touchline','Overlap on the outside or underlap into the half-space depending on where the gap is','Cross early, before defenders set, or cut back from the byline','Offer a safe passing angle behind the ball when the attack stalls','Only go forward when the team has cover behind you'],
 def:['Close down while the ball travels, then slow down to stay balanced','Show the winger down the line, away from goal','Stay on your feet; tackle only when the ball leaves his feet','Tuck in when the ball is on the far side to keep the line compact','Attack the back post on crosses from the other flank'],
 mis:['Diving into tackles and getting beaten','Ball-watching at the back post','Overlapping when nobody is covering','Losing the runner behind you'],
 drills:['fb-overlap','wide-2v1','def-footwork','back4','crossing'],
 sc:[
 {t:'a',title:'Overlap the winger and cross',view:'att',e:{h:[86,56,'RB'],a:[84,34,'RW'],b:[48,24,'9'],c:[58,36,'8'],x:[80,30,'3','o'],y:[78,46,'11','o'],z:[50,14,'CB','o'],w:[40,16,'CB','o']},b:'a',f:[
  {h:'Trigger',c:'Your winger receives wide and the full-back steps up to him. That is your trigger.'},
  {h:'Overlap',c:'Sprint around the outside and call “Overlap!” so he knows you are coming.',m:{h:[93,30],y:[84,44]}},
  {h:'Release',c:'The winger drives inside and drags the full-back with him, then slips the ball into your path.',b:'h',m:{a:[72,30],x:[74,30],h:[93,20]}},
  {h:'Deliver',c:'Cross early into the space between the defenders and the keeper. Your striker attacks the near post.',b:'b',m:{b:[46,8],c:[56,14],z:[48,9],h:[93,15]}}]},
 {t:'a',title:'Underlap into the half-space',view:'att',e:{h:[84,58,'RB'],a:[92,34,'RW'],b:[64,44,'8'],c:[50,22,'9'],x:[86,32,'3','o'],y:[64,22,'CB','o'],z:[42,20,'CB','o']},b:'a',f:[
  {h:'Pin',c:'Your winger holds the touchline and pins their full-back wide.'},
  {h:'Underlap',c:'Run on the inside of your winger, into the channel between full-back and centre-back.',m:{h:[74,32]}},
  {h:'Receive',c:'The ball arrives on the half-turn. You are behind the defence inside the box.',b:'h',m:{h:[74,20],y:[68,18]}},
  {h:'Cut back',c:'Pull it back low across the six-yard box for the striker arriving.',b:'c',m:{c:[50,10],z:[46,12]}}]},
 {t:'d',title:'Defend the 1v1 against a winger',view:'def',e:{h:[82,76,'RB'],a:[62,80,'RCB'],b:[80,56,'RM'],x:[84,58,'11','o'],y:[50,82,'9','o']},b:'x',f:[
  {h:'Close',c:'The winger receives. Close the distance while the ball travels to him.',m:{h:[82,66]}},
  {h:'Set',c:'At arm’s length, slow down. Low, side-on, inside foot forward to show him down the line.',m:{h:[81,63]}},
  {h:'Jockey',c:'He pushes it down the line. Match his speed and stay goal-side; do not dive in.',m:{x:[90,74],h:[87,73]}},
  {h:'Strike',c:'The touch goes too far. Now tackle and win it, or block the cross.',b:'h',m:{h:[89,77],x:[91,76]}}]},
 {t:'d',title:'Tuck in when the ball is on the far side',view:'def',e:{h:[86,74,'RB'],a:[62,80,'RCB'],c:[40,80,'LCB'],d:[16,74,'LB'],x:[10,70,'7','o'],y:[50,82,'9','o'],z:[86,62,'11','o'],g:[50,98,'GK']},b:'x',f:[
  {h:'Scan',c:'The ball is on the far side. Don’t stay out wide marking space.'},
  {h:'Tuck in',c:'Narrow up with the back line as it shifts toward the ball. You cover the back post.',m:{h:[68,84],a:[52,84],c:[34,82],d:[14,80],x:[12,82]}},
  {h:'Check',c:'Keep scanning over your shoulder: their winger is sneaking in behind you.',m:{z:[78,80]}},
  {h:'Clear',c:'Cross to the back post. You are there first: head it away.',b:[70,88],m:{h:[70,87]}}]}
 ]},

{id:'wb',num:'3',name:'Wing-back',short:'WB',fit:'fb',
 sum:'The engine of a back-three system. Provides all the width in attack and drops in to make a back five without the ball. The most physically demanding role on the pitch.',
 stats:[['11–12 km','distance per match'],['30–40','sprints per match'],['Highest','high-speed running in the team']],
 attrs:['Repeat-sprint ability','Crossing on the run','1v1 attacking','Recovery speed','Positional awareness','Stamina'],
 att:['Hold the touchline: you are the only wide player on your flank','Get high and wide early so the centre-backs can find you','Attack the full-back 1v1 or cross early','Arrive at the back post when the ball is on the other wing'],
 def:['Recovery sprint: run to the line of your centre-backs, not to the ball','Jump forward to press the opposition full-back when he receives','Make it a back five in a low block','Communicate with your near centre-back on who takes the winger'],
 mis:['Jogging back in transition','Staying too deep, leaving your team without width','Getting caught between pressing and dropping'],
 drills:['fb-overlap','wide-2v1','crossing','ssg-4v4'],
 sc:[
 {t:'a',title:'Provide width in a 3-5-2',view:'att',e:{h:[90,42,'RWB'],a:[64,40,'8'],b:[52,20,'9'],c:[62,56,'6'],x:[82,34,'3','o'],y:[76,48,'11','o'],z:[64,18,'CB','o']},b:'c',f:[
  {h:'Width',c:'In a 3-5-2 you are the only player on the right touchline. Stay high and wide.'},
  {h:'Receive',c:'The switch comes to you. Their full-back has to come out to meet you.',b:'h',m:{x:[86,38]}},
  {h:'Combine',c:'He jumps out, so your 8 runs into the space behind him.',m:{a:[82,22],x:[87,39]}},
  {h:'Release',c:'Play the ball into the run. Your 8 is in behind with a crossing chance.',b:'a',m:{a:[86,16],h:[88,32]}}]},
 {t:'d',title:'Recovery sprint in transition',view:'full',e:{h:[88,30,'RWB'],a:[70,62,'RCB'],b:[50,64,'CB'],c:[30,62,'LCB'],x:[80,46,'11','o'],y:[50,50,'9','o']},b:'x',f:[
  {h:'Lost it',c:'We lose the ball in the final third and their winger breaks into the space you left.'},
  {h:'Sprint',c:'Sprint back. Run to the line of your centre-backs, not to the ball.',m:{h:[86,58],x:[82,62],a:[72,70],b:[52,72],c:[34,70],y:[52,64]}},
  {h:'Back five',c:'You arrive level with the back three and make it five. The 2v3 is now 2v4.',m:{h:[86,74],x:[80,72],a:[66,78],b:[50,80],c:[34,78],y:[50,76]}}]},
 {t:'d',title:'Jump to press the full-back',view:'mid',e:{h:[88,58,'RWB'],a:[70,76,'RCB'],b:[50,78,'CB'],c:[30,76,'LCB'],d:[12,60,'LWB'],e:[64,48,'8'],x:[86,34,'3','o'],y:[80,54,'11','o'],w:[56,30,'CB','o']},b:'w',f:[
  {h:'Trigger',c:'Their centre-back plays out to the full-back. In a 5-3-2, you press him.',b:'x'},
  {h:'Jump',c:'Jump on the pass with a curved run that cuts off the line down the touchline.',m:{h:[84,40]}},
  {h:'Cover',c:'The back line shuffles across: right centre-back picks up the winger and the far wing-back drops in to keep a back four.',m:{a:[80,62],b:[62,74],c:[44,76],d:[24,76],y:[82,58]}},
  {h:'Force',c:'Under pressure he hits it long. Your centre-back wins the header.',b:'a',m:{a:[80,60]}}]}
 ]},

{id:'dm',num:'6',name:'Defensive midfielder',short:'6',fit:'mid',
 sum:'The anchor. Screens the back four, keeps the ball moving and sets the rhythm. Always positioned to stop the counter-attack before it starts.',
 stats:[['11–12 km','distance per match'],['60–100','passes per match'],['2–5','interceptions per match']],
 attrs:['Scanning','Passing range','Positioning','Interceptions','Composure','Tactical discipline'],
 att:['Scan over both shoulders before every pass arrives','Find the passing lane away from your marker; receive half-turned','Drop between the centre-backs to beat a two-striker press','Switch play quickly when one side is crowded','Stay behind the ball as the base of the attack'],
 def:['Screen the pass into the striker or the 10 with your body (cover shadow)','Stay connected to the back four: no more than 10–15 m in front','Counter-press: block the forward pass the moment we lose it','Fill in for a full-back or centre-back who has stepped out','Foul smartly to stop a counter if there is no other option'],
 mis:['Receiving with your back to play under pressure','Wandering forward and leaving the centre open','Sideways passes that invite the press'],
 drills:['mid-scan','rondo','build-3v2','pos-game'],
 sc:[
 {t:'a',title:'Drop between the centre-backs',view:'def',e:{h:[50,72,'6'],a:[38,80,'LCB'],b:[62,80,'RCB'],c:[14,72,'LB'],d:[86,72,'RB'],g:[50,96,'GK'],x:[42,70,'9','o'],y:[58,70,'9','o']},b:'g',f:[
  {h:'Problem',c:'Their two strikers press your two centre-backs: it is 2v2.'},
  {h:'Drop',c:'Drop between the centre-backs. They split wide and the full-backs push high. Now it is 3v2.',m:{h:[50,84],a:[26,82],b:[74,82],c:[10,60],d:[90,60]}},
  {h:'Receive',c:'The keeper finds you. The strikers can’t cover all three players.',b:'h',m:{x:[44,78],y:[56,76]}},
  {h:'Release',c:'Play to the free centre-back, who drives forward into midfield.',b:'a',m:{a:[26,72]}}]},
 {t:'a',title:'Receive on the half-turn and switch',view:'mid',e:{h:[50,62,'6'],a:[36,76,'LCB'],b:[66,48,'8'],c:[90,46,'RB'],x:[50,54,'10','o'],y:[30,52,'8','o'],z:[20,46,'7','o']},b:'a',f:[
  {h:'Scan',c:'Before the ball arrives, check over both shoulders: where is the pressure, where is the space?'},
  {h:'Move',c:'Step away from your marker into the passing lane. Open your body to face the far side.',m:{h:[44,64]}},
  {h:'Receive',c:'Receive on your back foot, already facing forward. No extra touch needed.',b:'h',m:{x:[46,58],y:[34,56]}},
  {h:'Switch',c:'Ping it out to the free full-back on the far side. The press has been beaten.',b:'c',m:{c:[90,40]}}]},
 {t:'d',title:'Screen the back four',view:'def',e:{h:[50,66,'6'],a:[40,80,'LCB'],b:[60,80,'RCB'],x:[54,72,'10','o'],y:[44,52,'8','o'],w:[18,56,'7','o'],z:[50,84,'9','o']},b:'y',f:[
  {h:'Threat',c:'Their 10 drifts into the gap between you and your centre-backs.'},
  {h:'Screen',c:'Shuffle into the passing lane. Your body blocks the pass into the 10, so he is out of the game.',m:{h:[50,62]}},
  {h:'Force wide',c:'With the middle closed, he has to play wide instead.',b:'w'},
  {h:'Slide',c:'Slide across with the ball and stay connected to your back line.',m:{h:[38,66],x:[44,72],a:[34,80],b:[54,80]}}]},
 {t:'d',title:'Counter-press after losing the ball',view:'mid',e:{h:[50,52,'6'],a:[34,40,'8'],b:[66,40,'8'],c:[50,24,'9'],x:[44,38,'8','o'],y:[28,50,'7','o'],z:[70,52,'11','o']},b:'a',f:[
  {h:'Lost',c:'Your 8 loses the ball in midfield.',b:'x'},
  {h:'Hunt',c:'First five seconds: close the ball carrier and block his forward pass. Nearest teammates squeeze too.',m:{h:[45,44],a:[38,36],b:[52,36]}},
  {h:'Win',c:'He is trapped. Win it back while their team is still spread out to attack.',b:'h',m:{h:[44,41]}},
  {h:'Attack',c:'Ball regained high up the pitch: play forward quickly into the striker.',b:'c',m:{c:[48,20]}}]}
 ]},

{id:'cm',num:'8',name:'Central midfielder',short:'8',fit:'mid',
 sum:'The box-to-box link. Helps build play, makes runs into the box, and presses and recovers. Covers the most ground of any outfield player.',
 stats:[['11.5–12.5 km','distance per match'],['20–30','sprints per match'],['40–70','passes per match']],
 attrs:['Aerobic engine','Passing on the move','Timing of runs','Pressing intensity','Ball retention','Shooting from range'],
 att:['Support the ball carrier at an angle, never in a straight line','Use third-man runs: pass, then run past the player who receives','Time runs into the box late, arriving at the cut-back zone','Move into the half-space between full-back and centre-back','Shoot from the edge of the box when space opens'],
 def:['Jump to press when an opponent receives with his back to goal','Track runners from midfield all the way into your box','Stay compact with your midfield partner','Recover behind the ball quickly when the attack breaks down'],
 mis:['Arriving too early in the box and getting marked','Following the ball instead of protecting space','Hiding behind opponents instead of offering an angle'],
 drills:['mid-scan','rondo','combo','pos-game','ssg-4v4'],
 sc:[
 {t:'a',title:'The third-man run',view:'mid',e:{h:[66,50,'8'],a:[50,30,'9'],c:[50,62,'6'],x:[58,44,'8','o'],y:[40,44,'6','o'],z:[54,24,'CB','o']},b:'c',f:[
  {h:'Set',c:'Your 6 has the ball. Their midfielder is marking you closely.'},
  {h:'Wall pass',c:'The pass goes into the striker. That is your cue to start your run behind the midfield line.',b:'a',m:{a:[52,34],h:[62,42],z:[54,30]}},
  {h:'Third man',c:'The striker lays it into your path. You were the third man, so nobody tracked you.',b:'h',m:{h:[58,30]}},
  {h:'Finish',c:'Facing goal between the lines: shoot or slip a winger through.',b:[48,0],m:{h:[56,26]}}]},
 {t:'a',title:'Late arrival for the cut-back',view:'att',e:{h:[60,40,'8'],a:[86,30,'RW'],b:[50,20,'9'],x:[46,14,'CB','o'],y:[58,16,'CB','o'],z:[58,34,'6','o']},b:'a',f:[
  {h:'Pull',c:'Your winger drives at the byline. The striker runs to the near post and takes both centre-backs.',m:{a:[88,12],b:[56,8],x:[54,8],y:[60,10]}},
  {h:'Hold',c:'Arrive late. Wait outside the box until the cut-back is on, so the 6 can’t track you.',m:{h:[60,28],z:[60,32]}},
  {h:'Arrive',c:'Cut-back to the penalty spot area. You arrive at full speed.',b:'h',m:{h:[54,20]}},
  {h:'Finish',c:'Strike first time, low and across the keeper.',b:[46,0]}]},
 {t:'d',title:'Press when he receives facing his own goal',view:'mid',e:{h:[36,46,'8'],a:[50,30,'9'],b:[50,58,'6'],y:[46,20,'CB','o'],x:[38,38,'8','o'],z:[64,36,'6','o']},b:'y',f:[
  {h:'Trigger',c:'Their midfielder is about to receive with his back to you. That is your pressing trigger.'},
  {h:'Close',c:'Close him down while the ball travels and arrive as it arrives.',b:'x',m:{h:[38,42],a:[48,24]}},
  {h:'Win',c:'Press from his blind side. He can’t turn, and you take the ball.',b:'h',m:{h:[38,40],x:[40,38]}},
  {h:'Go',c:'Ball won near their box: attack immediately.',b:'a',m:{a:[46,16]}}]},
 {t:'d',title:'Track a runner into the box',view:'def',e:{h:[60,58,'8'],x:[58,56,'8','o'],y:[36,52,'10','o'],a:[42,80,'CB'],b:[62,80,'CB']},b:'y',f:[
  {h:'Read',c:'Their midfielder starts a run beyond you. Don’t just watch him go.',m:{x:[60,64]}},
  {h:'Track',c:'Go with him and stay on his goal-side shoulder. Keep the ball in view.',m:{x:[62,78],h:[60,78]}},
  {h:'Cut out',c:'The through ball is played, but you are in the lane. Intercept it.',b:'h',m:{h:[58,79]}}]}
 ]},

{id:'am',num:'10',name:'Attacking midfielder',short:'10',fit:'wide',
 sum:'The creator between the lines. Receives in tight pockets, turns, and plays the final pass or shoots. Defensively, presses the opposition 6.',
 stats:[['10.5–11.5 km','distance per match'],['2–4','key passes per match'],['20–30','sprints per match']],
 attrs:['Receiving on the half-turn','Vision','Final pass','Close control','Finishing from distance','Pressing'],
 att:['Find the pocket between their midfield and defence, on the blind side of the 6','Receive on the half-turn so you can play forward','Play quick one-twos around the edge of the box','Time your run into the box when the ball goes wide','Shoot when the shooting lane opens'],
 def:['Stay touch-tight to their 6 so they can’t build through him','Press with the striker to force play wide','Recover behind the ball when the press is broken'],
 mis:['Standing in the same line as their midfielders','Receiving with your back to goal every time','Switching off when the team loses the ball'],
 drills:['combo','att-1v1','rondo','pos-game'],
 sc:[
 {t:'a',title:'Find the pocket between the lines',view:'att',e:{h:[50,48,'10'],a:[50,62,'6'],b:[52,22,'9'],x:[38,40,'8','o'],y:[50,42,'6','o'],z:[62,40,'8','o'],w:[40,22,'CB','o'],v:[60,22,'CB','o']},b:'a',f:[
  {h:'Space',c:'They defend in two lines. The space you want is between those lines.',z:[[28,25,44,12,'POCKET','gold']]},
  {h:'Drift',c:'Drift into the pocket on the blind side of their 6, where he can’t see you.',m:{h:[40,32]}},
  {h:'Receive',c:'Receive facing forward. Their whole midfield is now behind the ball.',b:'h',m:{y:[44,38]}},
  {h:'Thread',c:'Slip the striker through between the centre-backs.',b:'b',m:{b:[56,8],v:[60,16]}}]},
 {t:'a',title:'One-two at the edge of the box',view:'att',e:{h:[46,36,'10'],a:[54,22,'9'],x:[48,32,'6','o'],y:[52,18,'CB','o'],z:[40,18,'CB','o']},b:'h',f:[
  {h:'Engage',c:'You have the ball with a midfielder closing you.',m:{x:[47,34]}},
  {h:'Give',c:'Play it into the striker’s feet and immediately run past your marker.',b:'a',m:{h:[42,26]}},
  {h:'Go',c:'The striker returns it first time into your path.',b:'h',m:{h:[42,18]}},
  {h:'Finish',c:'Shoot early, before the centre-back can block.',b:[44,0]}]},
 {t:'d',title:'Lock their 6 out of the game',view:'att',e:{h:[50,42,'10'],a:[50,30,'9'],x:[36,14,'CB','o'],y:[64,14,'CB','o'],z:[50,30,'6','o'],w:[14,26,'FB','o']},b:'x',f:[
  {h:'Job',c:'Your job: keep their 6 out of the game while your striker presses.'},
  {h:'Press',c:'Striker presses the centre-back with a curved run. You stay touch-tight to the 6.',m:{a:[42,18],h:[50,33],z:[50,32]}},
  {h:'Trap',c:'With the middle closed, he has to go wide. The trap is set.',b:'w'}]}
 ]},

{id:'w',num:'7',name:'Winger',short:'W',fit:'wide',
 sum:'Beats defenders 1v1, stretches the pitch and creates or scores chances from wide. Also the first line of defence on the flank.',
 stats:[['10.5–11.5 km','distance per match'],['30–40','sprints per match'],['5–10','take-ons per match']],
 attrs:['Acceleration','Dribbling 1v1','Crossing & cut-backs','Finishing','Decision-making at speed','Work rate'],
 att:['Hold the width early so the full-back has to choose: you or the space inside','Attack the defender at speed and make him commit','Use the inside or the outside depending on your stronger foot','Arrive at the back post when the ball is on the other wing','Combine with your full-back on overlaps and underlaps'],
 def:['Track the opposition full-back on his overlap','Press their full-back from the inside to force him down the line','Get goal-side quickly when the ball is lost'],
 mis:['Slowing down before taking on the defender','Crossing into the keeper','Not tracking back'],
 drills:['att-1v1','w-cutin','wide-2v1','crossing','front3-press'],
 sc:[
 {t:'a',title:'Beat the full-back down the line',view:'att',e:{h:[14,34,'LW'],x:[20,26,'2','o'],a:[52,22,'9'],y:[48,16,'CB','o']},b:'h',f:[
  {h:'Attack',c:'Isolated 1v1. Run straight at the defender at speed to make him stop.',m:{h:[16,30],x:[20,26]}},
  {h:'Feint',c:'Feint inside. He shifts his weight to block it.',m:{h:[19,27],x:[23,25]}},
  {h:'Explode',c:'Push it past him down the outside and accelerate away.',m:{h:[9,12],x:[18,16]}},
  {h:'Deliver',c:'Cross low across the six-yard box for the striker.',b:'a',m:{a:[46,8],y:[50,10]}}]},
 {t:'a',title:'Cut inside and shoot',view:'att',e:{h:[88,28,'RW'],x:[82,22,'3','o'],c:[86,46,'RB'],y:[64,14,'CB','o']},b:'h',f:[
  {h:'Receive',c:'You receive wide on the right as a left-footer.'},
  {h:'Decoy',c:'Your full-back overlaps, so the defender has to respect the outside.',m:{c:[93,20],x:[84,22]}},
  {h:'Cut in',c:'Cut inside onto your stronger foot as he drifts out.',m:{h:[70,20],x:[76,20],y:[66,16]}},
  {h:'Curl',c:'Curl it toward the far post.',b:[42,0],d:1500}]},
 {t:'d',title:'Track the overlapping full-back',view:'mid',e:{h:[18,42,'LW'],x:[22,48,'2','o'],y:[28,58,'7','o'],a:[16,74,'LB'],b:[38,78,'LCB']},b:'y',f:[
  {h:'Read',c:'Their full-back sets off on an overlap past you.',m:{x:[12,58]}},
  {h:'Track',c:'Go with him. Stay on his inside shoulder so he can’t receive in front of you.',m:{h:[14,60],x:[8,68],y:[24,64]}},
  {h:'2v2',c:'Now your full-back has help. It is 2v2, not 1v2. The pass down the line is cut out.',b:'h',m:{h:[10,68],x:[8,72]}}]}
 ]},

{id:'st',num:'9',name:'Striker',short:'ST',fit:'st',
 sum:'Scores goals, occupies the centre-backs and leads the press. Movement off the ball decides most of a striker’s chances.',
 stats:[['10–11 km','distance per match'],['20–30','sprints per match'],['2–5','shots per match']],
 attrs:['Finishing','Movement in the box','Hold-up play','Heading','Acceleration','Pressing'],
 att:['Stay on the last defender’s blind side and shoulder','Curve your run to stay onside, then go when the passer is ready','Make one movement away before attacking the near post','Get your body into the defender before a ball into feet','Finish across the keeper; low shots are hardest to save'],
 def:['Curve your run when pressing to block the pass to the other centre-back','Press the backward pass: it is the best trigger','Screen the opposition 6 when you are not pressing'],
 mis:['Standing still on the defender’s line','Running in straight lines and getting caught offside','Pressing alone without the team behind you'],
 drills:['st-finish','st-holdup','combo','crossing','front3-press'],
 sc:[
 {t:'a',title:'Run in behind the last defender',view:'att',e:{h:[50,26,'9'],x:[44,22,'CB','o'],y:[58,22,'CB','o'],a:[50,48,'8'],g:[50,2,'GK','o']},b:'a',f:[
  {h:'Position',c:'Stand on the shoulder of the last defender, on his blind side.',m:{h:[46,23]}},
  {h:'Curve',c:'Curve your run across him to stay onside, then go as your midfielder lifts his head.',m:{h:[52,16],x:[46,18],y:[58,18]}},
  {h:'Receive',c:'The ball comes over the top into your path.',b:'h',m:{h:[54,8],y:[56,12]},d:1500},
  {h:'Finish',c:'Finish across the keeper, low, into the far corner.',b:[46,0],m:{g:[52,3]}}]},
 {t:'a',title:'Hold-up play with your back to goal',view:'mid',e:{h:[50,30,'9'],x:[50,26,'CB','o'],a:[62,46,'8'],b:[86,30,'RW'],c:[40,72,'CB']},b:'c',f:[
  {h:'Prepare',c:'A long ball is coming. Get your body into the defender before it arrives.',m:{h:[50,31],x:[50,28]}},
  {h:'Control',c:'Cushion it and protect it, using your arms for balance and space.',b:'h',d:1600},
  {h:'Lay off',c:'Lay it off to your onrushing midfielder.',b:'a',m:{a:[58,36]}},
  {h:'Spin',c:'Spin off your marker into the box for the return.',m:{h:[44,16]},b:'b'}]},
 {t:'d',title:'Lead the press with a curved run',view:'att',e:{h:[50,30,'9'],x:[50,2,'GK','o'],y:[66,12,'CB','o'],z:[34,12,'CB','o'],w:[12,26,'FB','o'],a:[50,40,'10']},b:'z',f:[
  {h:'Read',c:'Ball is with their left-sided centre-back.'},
  {h:'Curve',c:'Curve your run from the inside so your body blocks the pass back across to his partner.',m:{h:[40,16],a:[50,30]}},
  {h:'Trap',c:'He can only go wide to the full-back. Your winger is waiting: the trap is set.',b:'w'}]}
 ]}
];
