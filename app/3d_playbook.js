/* ===== Ready-made playbook (key actors; everyone else positioned automatically) ===== */
const PLAYBOOK=[
/* ---- Build-up ---- */
{id:'pb-6drop',cat:'Build-up',name:'6 drops: back three vs two strikers',sum:'The 6 drops between the centre-backs so two pressing strikers face three defenders.',when:'Opponent presses with two strikers.',keys:['Centre-backs split to the width of the box','Full-backs push high to pin their wingers','Play to the free centre-back and let him carry'],
 sc:{t:'a',e:{g:[50,95,'GK'],a:[38,80,'LCB'],b:[62,80,'RCB'],c:[50,68,'DM'],d:[14,70,'LB'],f:[86,70,'RB'],x:[44,68,'9','o'],y:[56,68,'9','o']},b:'g',f:[
  {h:'Problem',c:'Their two strikers press our two centre-backs: 2v2 and no free player.'},
  {h:'Drop',m:{c:[50,84],a:[28,82],b:[72,82],d:[10,58],f:[90,58],x:[42,77],y:[58,77]},c:'The 6 drops between the centre-backs, who split wide. Full-backs push up. Now it is 3v2.'},
  {h:'Free man',b:'b',c:'Keeper finds the free right centre-back.'},
  {h:'Carry',m:{b:[72,66],y:[64,72]},c:'He carries into midfield. A striker has to leave his man to stop him.'},
  {h:'Release',b:'f',m:{f:[90,48]},c:'Out to the right-back, who now has time to play forward.'}]}},
{id:'pb-invfb',cat:'Build-up',name:'Inverted full-back: 3-2 base',sum:'The left-back steps inside next to the 6, the right-back tucks in as a third centre-back.',when:'You want control and protection against counter-attacks.',keys:['Inverted full-back must scan before receiving','The winger holds the touchline','Box of four in midfield'],
 sc:{t:'a',e:{a:[36,80,'LCB'],b:[64,80,'RCB'],d:[14,72,'LB'],f:[86,72,'RB'],c:[50,66,'DM'],w:[12,40,'LW'],x:[50,60,'10','o'],y:[20,52,'7','o']},b:'a',f:[
  {h:'Start',c:'Normal back four with the ball at the left centre-back.'},
  {h:'Invert',m:{d:[38,62],f:[70,78],b:[54,80],a:[30,78],c:[56,64]},c:'Left-back steps into midfield beside the 6. The right-back tucks in: back three plus two in midfield.'},
  {h:'Free winger',m:{y:[34,58],w:[8,40]},c:'Their winger follows the full-back inside, so our left winger is completely free.'},
  {h:'Switch',b:'w',c:'Pass straight out to the free winger, who attacks 1v1.'}]}},
{id:'pb-triangle',cat:'Build-up',name:'Wide triangle escape',sum:'Full-back, 8 and winger form a triangle on the flank; a third-man pass breaks the press.',when:'They press you into the touchline.',keys:['Winger pins their full-back high','8 drops into the half-space','First-time passes'],
 sc:{t:'a',e:{f:[86,64,'RB'],c:[66,52,'RCM'],w:[90,36,'RW'],x:[84,56,'11','o'],y:[68,46,'8','o'],z:[86,30,'3','o']},b:'f',f:[
  {h:'Pressed',m:{x:[86,58]},c:'Our right-back is pressed toward the touchline.'},
  {h:'Show',m:{c:[72,58],y:[72,52]},c:'The 8 drops into the half-space to give an angle.'},
  {h:'Bounce',b:'c',c:'Ball into the 8, who plays first time…'},
  {h:'Third man',b:'w',m:{w:[88,26],z:[82,30]},c:'…into the winger. The press is behind the ball.'},
  {h:'Go',m:{w:[80,16],f:[92,40]},c:'Winger drives inside, full-back overlaps.'}]}},
{id:'pb-long',cat:'Build-up',name:'Long goal kick & second ball',sum:'Skip a man-to-man press with a long kick to the striker, with midfield squeezed up for the second ball.',when:'Every short option is marked.',keys:['Aim between centre-back and full-back','Midfielders squeeze before the kick','Win the second ball, then play forward'],
 sc:{t:'a',e:{g:[50,95,'GK'],s:[44,36,'ST'],c:[40,54,'LCM'],d:[60,54,'RCM'],w:[16,38,'LW'],x:[42,32,'CB','o'],y:[50,50,'6','o']},b:'g',f:[
  {h:'Squeeze',m:{c:[40,44],d:[56,44],w:[20,32]},c:'Midfielders squeeze up close to the striker before the kick.'},
  {h:'Long',b:'s',d:1900,m:{s:[40,30],x:[40,28]},c:'Long kick into the channel. The striker attacks it.'},
  {h:'Flick',b:'c',m:{c:[38,36]},c:'Flick-on: the nearest midfielder wins the second ball.'},
  {h:'Attack',b:'w',m:{w:[16,16]},c:'Their defence is facing its own goal. Release the winger in behind.'}]}},

/* ---- Attacking patterns ---- */
{id:'at-overlap',cat:'Attacking pattern',name:'Overlap and cross',sum:'Full-back runs outside the winger to create a 2v1 on the flank.',when:'Winger receives wide and their full-back steps up.',keys:['Call the overlap','Winger drives inside to drag the defender','Cross early in front of the defence'],
 sc:{t:'a',e:{f:[86,54,'RB'],w:[84,34,'RW'],s:[50,22,'ST'],c:[62,34,'RCM'],x:[82,28,'3','o'],y:[64,16,'CB','o'],z:[46,16,'CB','o']},b:'w',f:[
  {h:'Trigger',c:'Winger receives; their full-back steps up to him.'},
  {h:'Overlap',m:{f:[93,30]},c:'Right-back sprints around the outside.'},
  {h:'Release',b:'f',m:{w:[74,28],x:[76,28],f:[93,18]},c:'Winger drives inside, dragging the defender, and slides the ball outside.'},
  {h:'Cross',b:'s',m:{s:[48,8],c:[58,14],y:[54,10]},c:'Early cross to the near post.'}]}},
{id:'at-underlap',cat:'Attacking pattern',name:'Underlap and cut-back',sum:'Full-back or 8 runs inside the winger into the gap between full-back and centre-back.',when:'Winger holds the touchline and pins their full-back.',keys:['Winger stays wide','Run into the channel','Low cut-back to the penalty spot'],
 sc:{t:'a',e:{w:[92,32,'RW'],c:[68,46,'RCM'],s:[50,22,'ST'],a:[38,30,'LCM'],x:[86,30,'3','o'],y:[64,22,'CB','o']},b:'w',f:[
  {h:'Pin',c:'Winger holds the touchline and pins their full-back.'},
  {h:'Underlap',m:{c:[76,26]},c:'The 8 runs inside him into the channel.'},
  {h:'Receive',b:'c',m:{c:[78,12],y:[70,14]},c:'Through ball into the box.'},
  {h:'Cut-back',b:'a',m:{s:[46,8],a:[50,20]},c:'Cut back to the late runner at the penalty spot.'}]}},
{id:'at-thirdman',cat:'Attacking pattern',name:'Third-man run through midfield',sum:'Pass into a player, who lays off to a third player running beyond.',when:'Their midfield marks tightly.',keys:['The wall player plays first time','The runner starts as the first pass travels','Finish or slip the striker'],
 sc:{t:'a',e:{c:[50,62,'DM'],s:[50,32,'ST'],h:[66,48,'RCM'],x:[58,44,'8','o'],y:[52,28,'CB','o']},b:'c',f:[
  {h:'Into feet',b:'s',m:{s:[52,36]},c:'The 6 plays into the striker’s feet.'},
  {h:'Run',m:{h:[60,38]},c:'As the ball travels, the 8 runs past his marker.'},
  {h:'Lay-off',b:'h',m:{h:[58,28]},c:'First-time lay-off into his path: third man.'},
  {h:'Shoot',b:[48,0],m:{h:[56,24]},c:'He faces goal between the lines and shoots.'}]}},
{id:'at-halfspace',cat:'Attacking pattern',name:'Half-space overload 3v2',sum:'Winger, 8 and full-back overload one side to free a runner into the box.',when:'Opponent defends in a back four with a flat midfield.',keys:['Occupy touchline, half-space and channel','Quick one-twos','Attack the box with 3'],
 sc:{t:'a',e:{f:[14,46,'LB'],c:[32,40,'LCM'],w:[10,30,'LW'],s:[48,20,'ST'],x:[14,30,'2','o'],y:[30,32,'7','o']},b:'f',f:[
  {h:'Overload',m:{c:[28,32],w:[8,28]},c:'Three of ours against two of theirs on the left.'},
  {h:'Pass',b:'c',c:'Into the 8 in the half-space.'},
  {h:'Run',m:{w:[22,16],x:[18,22]},c:'Winger makes a diagonal run in behind.'},
  {h:'Through',b:'w',m:{w:[30,10]},c:'Through ball. Winger is in the box.'}]}},
{id:'at-switch',cat:'Attacking pattern',name:'Switch to the isolated winger',sum:'Draw the opponent to one side, then switch quickly to the far winger in a 1v1.',when:'The block shifts heavily toward the ball.',keys:['Circulate to attract','Switch in two passes maximum','Winger attacks before help arrives'],
 sc:{t:'a',e:{c:[34,52,'LCM'],a:[38,74,'LCB'],w:[90,30,'RW'],x:[86,26,'3','o']},b:'c',f:[
  {h:'Attract',c:'We keep the ball on the left; their whole block slides across.'},
  {h:'Back',b:'a',c:'Back to the centre-back, who looks up.'},
  {h:'Switch',b:'w',d:1800,c:'Long diagonal to the right winger.'},
  {h:'1v1',m:{w:[80,16],x:[82,20]},c:'He attacks his full-back 1v1 before help arrives.'}]}},
{id:'at-cutback',cat:'Attacking pattern',name:'Byline cut-back',sum:'Get to the byline and pull the ball back to a runner arriving at the penalty spot.',when:'Defenders drop deep and collapse toward goal.',keys:['Near-post run pulls defenders','Late runner holds his run','Cut-back low and firm'],
 sc:{t:'a',e:{w:[86,28,'RW'],s:[50,20,'ST'],c:[60,40,'RCM'],x:[46,14,'CB','o'],y:[58,16,'CB','o']},b:'w',f:[
  {h:'Drive',m:{w:[88,10]},c:'Winger reaches the byline.'},
  {h:'Pull',m:{s:[56,7],x:[54,8],y:[60,9]},c:'Striker attacks the near post and takes both centre-backs.'},
  {h:'Cut-back',b:'c',m:{c:[52,20]},c:'Cut-back to the 8 arriving late.'},
  {h:'Finish',b:[46,0],c:'First-time finish.'}]}},
{id:'at-f9',cat:'Attacking pattern',name:'False 9 drop and runners',sum:'The striker drops into midfield; wingers and 8s run into the space he leaves.',when:'Their centre-backs like to follow the striker.',keys:['9 drops early','Runners go as he receives','Pass into the space, not to feet'],
 sc:{t:'a',e:{s:[50,28,'F9'],c:[36,48,'LCM'],w:[86,32,'RW'],a:[14,32,'LW'],y:[50,22,'CB','o']},b:'c',f:[
  {h:'Drop',m:{s:[50,40],y:[50,32]},c:'False 9 drops; their centre-back follows him.'},
  {h:'Receive',b:'s',c:'Ball into the false 9.'},
  {h:'Runs',m:{w:[62,14],a:[36,14]},c:'Both wingers sprint into the hole behind the centre-back.'},
  {h:'Release',b:'w',m:{w:[58,8]},c:'Through ball. 1v1 with the keeper.'}]}},
{id:'at-direct',cat:'Attacking pattern',name:'Direct play: target man',sum:'Play early into a strong striker, then support quickly with runners.',when:'You have a target striker or face a high line.',keys:['Contact before the ball','Runners beyond, supporter underneath','Quick finish'],
 sc:{t:'a',e:{a:[62,76,'RCB'],s:[50,34,'ST'],c:[58,48,'RCM'],w:[20,36,'LW'],x:[50,30,'CB','o']},b:'a',f:[
  {h:'Early ball',b:'s',d:1800,c:'Centre-back plays early into the striker.'},
  {h:'Hold',b:'c',m:{c:[56,40]},c:'Striker holds off the defender and lays off.'},
  {h:'Runner',m:{w:[34,14]},c:'Winger runs diagonally in behind.'},
  {h:'Through',b:'w',c:'First-time pass into his run.'}]}},
{id:'at-lowblock',cat:'Attacking pattern',name:'Breaking a low block',sum:'Circulate fast, overload a flank, rotate players and look for the cut-back or the shot from the edge.',when:'Opponent defends deep with ten behind the ball.',keys:['Ball speed and switches','Rotations to move markers','Edge-of-box shots and cut-backs'],
 sc:{t:'a',e:{c:[40,42,'LCM'],d:[60,42,'RCM'],f:[90,40,'RB'],w:[78,26,'RW'],s:[50,18,'ST']},b:'c',f:[
  {h:'Circulate',b:'d',c:'Move the ball quickly across the top of their block.'},
  {h:'Overload',b:'f',m:{f:[92,30]},c:'Out to the full-back. Winger moves inside.'},
  {h:'Rotate',m:{w:[72,18],d:[80,26]},c:'The 8 rotates wide while the winger attacks the half-space.'},
  {h:'Edge',b:'c',m:{c:[44,28]},c:'Ball back to the edge of the box. Shoot through the gap.'},
  {h:'Shot',b:[50,0],c:'Strike low through the crowd.'}]}},
{id:'at-onetwo',cat:'Attacking pattern',name:'One-two at the edge of the box',sum:'Give and go past a defender into the box.',when:'A defender steps out to close you down.',keys:['Pass and move immediately','Return first time','Finish early'],
 sc:{t:'a',e:{h:[46,36,'10'],s:[54,24,'ST'],x:[48,32,'6','o']},b:'h',f:[
  {h:'Engage',m:{x:[47,34]},c:'A midfielder steps out to the 10.'},
  {h:'Give',b:'s',m:{h:[40,26]},c:'Pass into the striker and run.'},
  {h:'Go',b:'h',m:{h:[42,18]},c:'Return first time into the box.'},
  {h:'Finish',b:[44,0],c:'Finish across the keeper.'}]}},

/* ---- Transitions ---- */
{id:'tr-counter',cat:'Transition',name:'Counter-attack 3v2',sum:'Win the ball and attack before the opponent can recover.',when:'You regain the ball in midfield against a high line.',keys:['First look forward','Wide runners stretch, ball carrier drives','Finish within 10 seconds'],
 sc:{t:'a',e:{c:[50,60,'DM'],w:[18,48,'LW'],v:[82,48,'RW'],s:[50,46,'ST'],x:[52,58,'8','o']},b:'x',f:[
  {h:'Regain',b:'c',c:'The 6 wins the ball.'},
  {h:'Release',b:'s',m:{w:[16,32],v:[84,32],s:[50,40]},c:'Into the striker; both wingers sprint wide and forward.'},
  {h:'Drive',m:{s:[50,26]},c:'Striker drives at the last two defenders.'},
  {h:'Square',b:'v',m:{v:[70,12]},c:'Square pass to the free runner.'},
  {h:'Finish',b:[54,0],c:'Finish.'}]}},
{id:'tr-gegen',cat:'Transition',name:'Counter-press: win it back in 5 seconds',sum:'The nearest players swarm the ball the moment possession is lost.',when:'You lose the ball high up the pitch.',keys:['Nearest player presses the ball','Others block forward passes','Win it, then attack the open space'],
 sc:{t:'a',e:{c:[34,30,'LCM'],d:[54,34,'RCM'],w:[18,24,'LW'],s:[44,20,'ST'],x:[30,28,'8','o']},b:'c',f:[
  {h:'Lost',b:'x',c:'We lose it in their half.'},
  {h:'Swarm',m:{c:[31,32],w:[24,26],d:[38,32],s:[34,22]},c:'Four players close the ball and the forward passes.'},
  {h:'Win',b:'d',m:{d:[34,30]},c:'Ball won back while they are still spread out.'},
  {h:'Attack',b:'s',m:{s:[42,10]},c:'Instant attack through the gap.'}]}},
{id:'tr-recover',cat:'Transition',name:'Defensive transition: delay and recover',sum:'When the counter is on, the nearest player delays while everyone sprints behind the ball.',when:'You lose it with players committed forward.',keys:['Delay, don’t dive in','Sprint to the line of the ball','Protect the middle first'],
 sc:{t:'d',e:{c:[50,56,'DM'],a:[40,74,'LCB'],b:[60,74,'RCB'],x:[50,48,'8','o'],y:[30,52,'11','o']},b:'x',f:[
  {h:'Counter',m:{x:[50,56]},c:'They break through the middle.'},
  {h:'Delay',m:{c:[50,64],x:[50,60]},c:'The 6 backs off and delays; he does not dive in.'},
  {h:'Recover',m:{a:[42,78],b:[58,78]},c:'Centre-backs drop and narrow; everyone else sprints back.'},
  {h:'Win',b:'c',m:{c:[50,62]},c:'Help arrives, then the 6 steps in.'}]}},

/* ---- Pressing & defending ---- */
{id:'df-widetrap',cat:'Pressing & defending',name:'Wide pressing trap',sum:'Show play to the full-back, then press with the touchline as an extra defender.',when:'Their full-back is the weakest on the ball.',keys:['Curved run blocks the central option','Pass to full-back = trigger','Far side tucks in'],
 sc:{t:'d',e:{s:[50,30,'ST'],w:[80,32,'RW'],d:[64,44,'RCM'],x:[64,12,'CB','o'],y:[90,24,'2','o'],z:[50,26,'6','o']},b:'x',f:[
  {h:'Curve',m:{s:[56,16]},c:'Striker curves his run to block the switch and the 6.'},
  {h:'Trigger',b:'y',c:'They play to the full-back: that is the trigger.'},
  {h:'Trap',m:{w:[86,26],d:[78,32],s:[74,18]},c:'Winger presses, 8 locks the inside, striker blocks the back pass.'},
  {h:'Win',b:'w',m:{w:[88,25]},c:'No way out. Ball won near their goal.'}]}},
{id:'df-backpass',cat:'Pressing & defending',name:'Back-pass trigger press',sum:'Whenever they pass backwards, the whole team steps up and presses together.',when:'Opponent recycles under pressure.',keys:['Back pass = everyone steps 5 m','Press the receiver’s first touch','Line squeezes up'],
 sc:{t:'d',e:{s:[50,34,'ST'],c:[40,48,'LCM'],x:[40,30,'8','o'],y:[50,12,'CB','o']},b:'x',f:[
  {h:'Back pass',b:'y',c:'Their midfielder plays backwards.'},
  {h:'Step',m:{s:[50,18],c:[42,36]},c:'Trigger: the whole team steps up together.'},
  {h:'Force',b:[50,40],m:{s:[50,15]},c:'Rushed long ball under pressure.'}]}},
{id:'df-midblock',cat:'Pressing & defending',name:'Mid block 4-4-2: shift and step',sum:'Two compact banks of four slide together; the near player steps to the ball.',when:'Opponent is better on the ball; protect the centre.',keys:['10–12 m between players','Shift as the ball travels','Show wide, protect inside'],
 sc:{t:'d',e:{m:[84,60,'RM'],x:[86,48,'3','o'],y:[50,46,'8','o']},b:'y',f:[
  {h:'Compact',c:'Two banks of four, compact and central.'},
  {h:'Pass wide',b:'x',c:'Ball goes wide; everyone slides across.'},
  {h:'Step',m:{m:[84,52]},c:'Right midfielder steps to press; the block shifts behind him.'}]}},
{id:'df-lowblock',cat:'Pressing & defending',name:'Low block: defend the box',sum:'Drop deep, protect the box and the cut-back zone, clear crosses.',when:'Protecting a lead or under heavy pressure.',keys:['Under 35 m from front to back','Cover the cut-back zone','Clear high and wide'],
 sc:{t:'d',e:{g:[50,96,'GK'],a:[44,86,'LCB'],b:[56,86,'RCB'],x:[86,80,'11','o'],y:[50,82,'9','o']},b:'x',f:[
  {h:'Deep',c:'Block drops to the edge of the box.'},
  {h:'Byline',m:{x:[90,92],y:[54,90],b:[56,90]},c:'Winger reaches the byline. Centre-back tracks the near-post run.'},
  {h:'Cross',b:[54,90],c:'Cross into the six-yard box.'},
  {h:'Clear',b:[22,66],m:{b:[55,89]},c:'Header clear, high and wide.'}]}},

/* ---- Set pieces ---- */
{id:'sp-nearflick',cat:'Set piece',name:'Corner: near-post flick',sum:'Driven corner to the near post, flicked on to runners at the far post.',when:'Opponent defends zonally at the near post.',keys:['Driven delivery at head height','Near-post runner attacks across','Far-post runners time it late'],
 sc:{t:'a',e:{k:[99,1,'C'],a:[56,12,'CB'],b:[46,14,'ST'],c:[40,18,'CB'],g:[50,2,'GK','o']},b:'k',f:[
  {h:'Set',c:'Two runners wait, one to attack the near post.'},
  {h:'Runs',m:{a:[60,5],b:[46,6],c:[40,8]},c:'Near-post run, two late runs to the far post.'},
  {h:'Flick',b:'a',d:1500,c:'Driven ball flicked on.'},
  {h:'Finish',b:'c',m:{c:[42,4]},c:'Far-post finish.'}]}},
{id:'sp-short',cat:'Set piece',name:'Short corner routine',sum:'Short corner creates a 2v1 and a better crossing angle.',when:'They leave only one player to block short.',keys:['Second player comes short','Return pass on the run','Cross from the edge of the box'],
 sc:{t:'a',e:{k:[99,1,'C'],a:[90,10,'W'],x:[90,6,'7','o'],s:[50,10,'ST']},b:'k',f:[
  {h:'Short',b:'a',c:'Short to the winger.'},
  {h:'Return',b:'k',m:{k:[86,14]},c:'Return pass on the run.'},
  {h:'Cross',b:'s',c:'Cross from a better angle to the penalty spot.'}]}},
{id:'sp-fk',cat:'Set piece',name:'Wide free kick to the back post',sum:'Whipped delivery between keeper and defenders, runners attack across the line.',when:'Free kick wide near the box.',keys:['Delivery between keeper and line','Runners start offside-safe and attack together','Back post is the target'],
 sc:{t:'a',e:{k:[86,24,'FK'],a:[46,18,'CB'],b:[56,18,'CB'],c:[38,18,'ST']},b:'k',f:[
  {h:'Line up',c:'Runners line up level with their defensive line.'},
  {h:'Runs',m:{a:[46,8],b:[54,6],c:[36,8]},c:'All runners attack together as the kick is taken.'},
  {h:'Delivery',b:'c',d:1500,c:'Whipped to the back post.'},
  {h:'Finish',b:[40,0],c:'Header back across goal.'}]}}
];
