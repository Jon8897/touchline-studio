/* ===== More drills ===== */
DRILLS.push(
{id:'cb-switch',cat:'Individual',pos:['cb','dm'],name:'Long diagonal switch',focus:'Driven long passing, body shape to receive',players:'2–3 players',area:'40 × 30 m',time:'12 min',int:'Low',kit:'Balls ×8, 4 cones',
 setup:'Two players 40 m apart on a diagonal, each in a 5 × 5 m cone box. Optional third player in the middle as a passive presser.',
 steps:['Player A receives a short pass from the middle player','Open the body on the first touch, out of your feet toward the target','Strike a driven, low-flight diagonal into B’s box','B controls inside his box and repeats the other way','10 passes each foot'],
 pts:['Look before you receive','Lock the ankle, strike through the middle-bottom of the ball','Follow through toward the target','Flat and fast beats high and floaty'],
 prog:['Presser becomes active','First-time switches only','Target box shrinks to 3 × 3 m'],
 tm:{work:60,rest:30,rounds:6,sets:1},
 sc:{view:'full',grid:[[14,66,10,7,''],[76,24,10,7,'']],e:{h:[19,70,'A'],b:[81,28,'B'],m:[30,58,'M']},b:'m',f:[
  {h:'Set',c:'Middle player plays into A.',b:'h'},
  {h:'Open',c:'Open the body on the first touch, toward the far box.',m:{h:[20,68]}},
  {h:'Switch',c:'Driven diagonal into B’s box, 40 m away.',b:'b',d:1800},
  {h:'Repeat',c:'B controls inside the box and returns it.',b:'h',d:1800}]}},

{id:'wb-shuttle',cat:'Individual',pos:['wb','fb'],name:'Wing-back up & back shuttle',focus:'Repeat sprints, crossing tired, recovery runs',players:'1 wing-back + 1 server',area:'Full touchline',time:'15 min',int:'High',kit:'Balls ×10, 4 cones, 1 mini goal or target',
 setup:'Cones at your own box edge, halfway and the opposition box edge along one touchline. Server near halfway.',
 steps:['Start at your own box cone','Sprint to halfway, receive from the server, carry to the final third','Cross into a target zone','Turn and sprint back to your box cone: the recovery run','Walk 30 s, repeat'],
 pts:['Recovery run at full speed, not jogging','Head up before crossing','Keep crossing quality when tired'],
 prog:['Add a defender at the final third','Recovery run must finish in 10 s','Both flanks alternately'],
 tm:{work:25,rest:35,rounds:6,sets:2,sr:150},
 sc:{view:'full',e:{h:[90,82,'WB'],k:[76,50,'S','k'],c1:[92,84,'','c'],c2:[92,52,'','c'],c3:[92,18,'','c'],g:[50,8,'','g']},b:'k',f:[
  {h:'Sprint up',c:'Sprint to halfway and receive.',b:'h',m:{h:[90,50]}},
  {h:'Carry',c:'Carry into the final third.',m:{h:[90,20]}},
  {h:'Cross',c:'Cross into the target zone.',b:[50,10]},
  {h:'Recover',c:'Sprint back to your box: this is the real work.',m:{h:[90,82]},d:2200}]}},

{id:'dm-screen',cat:'Individual',pos:['dm'],name:'Cover-shadow screening',focus:'Blocking passing lanes, body position',players:'1 midfielder + 2 passers + 1 target',area:'20 × 20 m',time:'12 min',int:'Medium',kit:'Balls ×6, cones',
 setup:'Two passers on one side of a square, a target player on the far side. The 6 in the middle must stop passes reaching the target.',
 steps:['Passers move the ball between them','The 6 shuffles to keep his body in the line between ball and target','Passers try to slip a pass through to the target','Point to the 6 for every intercept or forced back-pass','90 s rounds'],
 pts:['Move as the ball travels, not after','Small, quick side-steps','Stay on your toes, ready to intercept','Scan the target, not just the ball'],
 prog:['Two targets','Passers can dribble','6 must win the ball, not just block'],
 tm:{work:90,rest:45,rounds:6,sets:1},
 sc:{view:'mid',grid:[[30,38,40,24,'20 × 20 m']],e:{h:[50,52,'6'],x:[36,40,'P','o'],y:[64,40,'P','o'],t:[50,62,'T']},b:'x',f:[
  {h:'Shadow',c:'The 6 stands in the line between the ball and the target.',m:{h:[44,50]}},
  {h:'Shift',c:'Ball moves across. The 6 shuffles as it travels.',b:'y',m:{h:[56,50]}},
  {h:'Intercept',c:'Pass tried through the lane. The 6 steps in and wins it.',b:'h',m:{h:[54,52]}}]}},

{id:'cm-shoot',cat:'Individual',pos:['cm','am'],name:'Receive, turn & shoot from range',focus:'Half-turn receiving, shooting technique',players:'1 midfielder + 1 server + GK',area:'Edge of the box',time:'15 min',int:'Medium',kit:'Balls ×12, 2 mannequins',
 setup:'Server on the edge of the centre circle side. Midfielder 25 m from goal with a mannequin behind him.',
 steps:['Check away from the mannequin, then show for the ball','Receive on the half-turn, first touch out of your feet toward goal','Shoot within two touches','Alternate shooting foot each rep','Swap with the server after 6 reps'],
 pts:['Open hips to see the goal early','First touch sets the shot','Strike through the ball, land on the kicking foot','Aim low, just inside the post'],
 prog:['Mannequin becomes an active defender','One-touch shots','Add a lay-off from a striker first'],
 tm:{work:15,rest:45,rounds:8,sets:2,sr:90},
 sc:{view:'att',e:{h:[50,36,'8'],p:[50,40,'','p'],k:[70,50,'S','k'],g:[50,2,'GK','o']},b:'k',f:[
  {h:'Check',c:'Check away, then show.',m:{h:[56,34]}},
  {h:'Turn',c:'Receive on the half-turn; first touch toward goal.',b:'h',m:{h:[54,30]}},
  {h:'Shoot',c:'Shoot low inside the post.',b:[45,0],m:{g:[47,3]}}]}},

{id:'am-pocket',cat:'Individual',pos:['am','cm'],name:'Pocket receiving & through ball',focus:'Finding space between lines, the final pass',players:'1 attacking midfielder + 1 server + 1 runner',area:'30 × 30 m',time:'15 min',int:'Medium',kit:'Balls ×10, 6 mannequins',
 setup:'Two rows of three mannequins as midfield and defensive lines. The 10 starts beside the midfield row.',
 steps:['Server has the ball behind the midfield row','The 10 drifts into a gap between the rows on the blind side','Receive on the half-turn','Play a through ball between two back-row mannequins to the runner','Change gaps every rep'],
 pts:['Arrive in the pocket as the passer looks up','Shoulder check before receiving','Weight the through ball into the runner’s path'],
 prog:['Live defender in the pocket','One-touch through ball','Runner can be offside: time the pass'],
 tm:{work:30,rest:30,rounds:8,sets:2,sr:90},
 sc:{view:'att',e:{h:[26,42,'10'],k:[50,60,'S','k'],r:[70,26,'9'],p1:[30,40,'','p'],p2:[50,40,'','p'],p3:[70,40,'','p'],p4:[34,20,'','p'],p5:[50,20,'','p'],p6:[66,20,'','p']},b:'k',f:[
  {h:'Drift',c:'Drift into the gap between the rows.',m:{h:[40,30]}},
  {h:'Receive',c:'Receive on the half-turn.',b:'h'},
  {h:'Thread',c:'Through ball between the back row to the runner.',b:'r',m:{r:[58,10]}}]}},

{id:'mid3-rotate',cat:'Unit',pos:['dm','cm','am'],name:'Midfield three rotations',focus:'Rotating 6 and 8s, staying connected',players:'3 midfielders + 2 CBs v 3 defenders',area:'40 × 30 m',time:'15 min',int:'Medium',kit:'Balls ×8, bibs, cone gates',
 setup:'Two centre-backs and a midfield three against three pressing midfielders. Score by passing through one of two end gates.',
 steps:['Centre-backs start with the ball','When the 6 is marked, an 8 drops into his space and the 6 rotates forward','Keep a triangle at all times','Break through a gate','Rotate defenders every 2 minutes'],
 pts:['If you move, someone fills your space','Communicate the rotation','Stagger heights: never three on one line'],
 prog:['Add a fourth defender','Two-touch limit','Gate only counts after a rotation'],
 tm:{work:120,rest:60,rounds:6,sets:1},
 sc:{view:'mid',e:{a:[38,72,'CB'],b:[62,72,'CB'],h:[50,60,'6'],c:[34,46,'8'],d:[66,46,'8'],x:[50,56,'D','o'],y:[36,50,'D','o'],z:[64,50,'D','o'],c1:[42,24,'','c'],c2:[58,24,'','c']},b:'a',f:[
  {h:'Problem',c:'Their midfielder marks the 6 tightly.'},
  {h:'Rotate',c:'The left 8 drops into the 6’s space; the 6 rotates forward.',m:{c:[44,62],h:[40,44],y:[42,58],x:[46,48]}},
  {h:'Free',c:'Centre-back plays to the dropping 8, who turns.',b:'c'},
  {h:'Break',c:'Into the 6 now high and free, through the gate.',b:'h',m:{h:[48,28]}}]}},

{id:'back5-shift',cat:'Unit',pos:['cb','wb'],name:'Back five: shift & wing-back jump',focus:'Back-three systems without the ball',players:'5 defenders + 4 servers',area:'Half pitch',time:'15 min',int:'Low',kit:'Balls ×6, cones',
 setup:'Back five in their line. Four servers pass the ball across the pitch in front.',
 steps:['Ball central: flat five, compact','Ball to a wide server: near wing-back jumps to press','Back three shifts across; far wing-back tucks in to keep a back four','Ball back inside: wing-back drops back into the five','Coach freezes play to check distances'],
 pts:['Wing-back jumps on the pass, not after','The near centre-back covers behind the wing-back','The far wing-back never leaves a gap at the back post'],
 prog:['Two attackers make runs','Servers can play through balls','Live 5v4'],
 tm:{work:180,rest:60,rounds:4,sets:1},
 sc:{view:'def',e:{d1:[12,80,'LWB'],d2:[30,84,'LCB'],d3:[50,85,'CB'],d4:[70,84,'RCB'],d5:[88,80,'RWB'],x1:[12,56,'S','o'],x2:[38,52,'S','o'],x3:[62,52,'S','o'],x4:[88,56,'S','o']},b:'x2',f:[
  {h:'Central',c:'Flat five, compact across the box.'},
  {h:'Jump',c:'Ball wide right: the right wing-back jumps; the line shifts and the far wing-back tucks in.',b:'x4',m:{d5:[86,64],d4:[74,78],d3:[58,82],d2:[42,84],d1:[26,82]}},
  {h:'Reset',c:'Ball back inside: the wing-back drops back into the five.',b:'x3',m:{d5:[86,80],d4:[68,82],d3:[52,84],d2:[34,84],d1:[16,80]}},
  {h:'Jump',c:'Ball to the left: left wing-back jumps.',b:'x1',m:{d1:[14,64],d2:[26,78],d3:[42,82],d4:[58,84],d5:[74,82]}}]}},

{id:'press-escape',cat:'Team',pos:['gk','cb','fb','dm','cm','st'],name:'Escape the man-to-man press',focus:'Third-man, long ball and switch escape routes',players:'GK + 8 v 8 pressers',area:'Two-thirds of the pitch',time:'25 min',int:'High',kit:'Balls ×10, bibs, 3 cone gates at halfway',
 setup:'Your keeper and eight outfield players build out against eight opponents marking man-to-man. Score by getting the ball through a gate at halfway under control.',
 steps:['Keeper starts every rep','Round 1: escape only by the third-man route (drop, bounce, run beyond)','Round 2: escape only long, with midfielders squeezing for the second ball','Round 3: escape by switching through the keeper','Round 4: free choice: players read which route is on'],
 pts:['The keeper is the free player: use him','Move the marker first, then the ball','Play the pass first time when the marker is tight','Go long early if every option is marked'],
 prog:['Pressers +1','Gates only count within 10 seconds','Pressers score triple if they win it in your third'],
 tm:{work:240,rest:120,rounds:4,sets:1},
 sc:{view:'full',e:{g:[50,95,'GK'],a:[30,84,'LCB'],b:[70,84,'RCB'],c:[12,64,'LB'],d:[88,64,'RB'],e:[50,70,'6'],f:[36,54,'8'],s:[50,38,'9'],qa:[32,80,'','o'],qb:[68,80,'','o'],qc:[14,60,'','o'],qd:[86,60,'','o'],qe:[50,66,'','o'],qf:[38,50,'','o'],qs:[50,34,'','o'],qx:[66,50,'','o'],c1:[30,50,'','c'],c2:[50,50,'','c'],c3:[70,50,'','c']},b:'g',f:[
  {h:'Pressed',c:'Every outfield player is marked. The keeper is free.'},
  {h:'Bait',c:'Keeper to the left centre-back; the presser jumps.',b:'a',m:{qa:[31,82]}},
  {h:'Drop',c:'Striker drops short and drags his marker.',m:{s:[42,56],qs:[42,52]}},
  {h:'Bounce',c:'Into the striker, who lays it off first time to the 8 running past his marker.',b:'s'},
  {h:'Third man',c:'The 8 is free and facing forward.',b:'f',m:{f:[34,42]}},
  {h:'Gate',c:'Through the gate. Press escaped.',m:{f:[32,48]}}]}},

{id:'press-trap',cat:'Team',pos:['st','w','am','cm','dm'],name:'High press trap 8v7',focus:'Pressing as a team, triggers and traps',players:'8 pressers v 6 + GK',area:'Attacking half',time:'20 min',int:'High',kit:'Balls ×10, bibs, cones',
 setup:'Opponents build from their keeper with six players. Your eight press. They score through two halfway gates; you score by winning it and shooting within 8 s.',
 steps:['Their keeper starts every rep','Striker curves his press to force play to one side','The pass to the full-back is the trigger: the whole team shifts and locks the touchline','Near-side midfielder jumps onto their 6; far-side players tuck in','Win it, shoot within 8 seconds'],
 pts:['Never press alone','Curve the run to block the switch','Sprint on the trigger, slow down to tackle','Far-side players come inside: the touchline is your extra defender'],
 prog:['Opponents +1','Count regains in 2 minutes','Opponents can play long to a target'],
 tm:{work:180,rest:90,rounds:5,sets:1},
 sc:{view:'att',e:{s:[50,30,'9'],a:[20,32,'LW'],b:[80,32,'RW'],c:[38,44,'8'],d:[62,44,'8'],x1:[36,12,'CB','o'],x2:[64,12,'CB','o'],x3:[10,24,'FB','o'],x4:[90,24,'FB','o'],x5:[50,26,'6','o'],gk:[50,2,'GK','o']},b:'x2',f:[
  {h:'Curve',c:'Striker curves to block the switch and force play to their left side.',m:{s:[56,16]}},
  {h:'Trigger',c:'Pass to the full-back: trigger. Winger presses, the team shifts and locks the touchline.',b:'x4',m:{b:[86,26],s:[70,16],d:[74,32],c:[56,28],a:[34,24]}},
  {h:'Trap',c:'No way out. Tackle.',b:'b',m:{b:[88,25]}},
  {h:'Shoot',c:'Shoot within 8 seconds.',b:[52,0],m:{s:[60,10]}}]}}
);
POSITIONS.forEach(p=>{const add={cb:['cb-switch','back5-shift','press-escape'],wb:['wb-shuttle','back5-shift'],fb:['wb-shuttle','press-escape'],dm:['dm-screen','cb-switch','mid3-rotate','press-escape'],cm:['cm-shoot','mid3-rotate','press-trap'],am:['am-pocket','cm-shoot','press-trap'],w:['press-trap'],st:['press-trap','press-escape'],gk:['press-escape']}[p.id]||[]; p.drills=[...new Set([...p.drills,...add])]});
