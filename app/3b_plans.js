/* ===== Formation game plans ===== */
const JOBS={
 gk:['Spare player in build-up. Stay available behind the centre-backs and switch play when one side is pressed.','Sweep behind a high line, command the box, organise set pieces.'],
 cb:['Split wide, break lines with passes into midfield, carry into free space.','Hold the line, step out to dropping forwards, win the first header.'],
 fb:['Give width when the winger tucks in; underlap when he holds the line. Cross early.','Defend 1v1 down the line, tuck in on the far side, attack the back post.'],
 wb:['Hold the touchline high: you are all the width on your flank.','Drop in to make a back five; jump out to press their full-back.'],
 dm:['Base of the attack. Scan, keep the ball moving, switch play.','Screen the back line, counter-press, fill gaps left by others.'],
 cm:['Half-space and third-man runs, late arrivals in the box.','Press on triggers, track runners, stay compact with your partner.'],
 am:['Receive in the pockets between the lines, final pass, shoot.','Mark their 6 and press with the striker.'],
 w:['Pin the full-back, beat him 1v1, attack the back post.','Press from the inside, track the overlapping full-back.'],
 st:['Pin both centre-backs, run in behind, finish.','Lead the press with curved runs to block the switch.']
};
const PLANS={
 '433':{build:'Centre-backs split to the edges of the box, the 6 shows between their strikers and the full-backs start level with the halfway line. The keeper is the spare man.',prog:'Find an 8 on the half-turn in the half-space, or play to the full-back and into the winger’s feet.',final:'Wingers isolate full-backs 1v1, the 8s attack the channel between full-back and centre-back, the striker pins both centre-backs and the full-back overlaps.',press:'Striker curves onto one centre-back, wingers press from the inside, the 8s jump onto their midfielders and the 6 stays as cover.',block:'Wingers drop level with the 8s to make a 4-5-1. Show play wide, slide together and protect the space either side of the 6.',toD:'Counter-press for 5 seconds. The 6, both centre-backs and one full-back stay as rest defence.',toA:'First look: striker or a winger running behind the full-back who has pushed on.',
  vs:['Against two pressing strikers: drop the 6 between the centre-backs to make 3v2','If their 10 marks the 6, an 8 drops into the space and the 6 rotates up','Use the keeper as the free man to switch sides','If every short option is marked, go long to the striker with both 8s close for the second ball']},
 '433f9':{build:'Same as the 4-3-3, but the false 9 drops early to give a fourth midfield option.',prog:'Play into the false 9 between the lines; he turns or lays off to an 8 running beyond.',final:'The 9 drops, both 8s and both wingers run in behind. If a centre-back follows the 9, the space behind him is the target.',press:'The false 9 screens their 6 while the wingers press the centre-backs from the outside in.',block:'4-5-1 with the false 9 staying close to the midfield line.',toD:'Counter-press immediately; the false 9 is usually already close to the ball in midfield.',toA:'Wingers and 8s sprint beyond; the 9 receives short and releases.',
  vs:['The false 9 drops into midfield to create a free player','Bounce passes through the 9 to a running 8 (third man)','Keep the wingers high to stop their full-backs pressing','Long ball is weaker here: no target man, so stay short and patient']},
 '433inv':{build:'Right-back stays as a third centre-back, left-back steps inside beside the 6. Back three + two pivots = a 3-2 base.',prog:'The two pivots receive between their strikers; the 8s wait in the half-spaces to receive on the turn.',final:'A 3-2-5: wingers on both touchlines, 8s in the half-spaces, striker in the middle. Every channel of their back line is occupied.',press:'Front three press the back line; inverted full-back and 6 lock the middle together.',block:'Back to a normal back four and 4-5-1. The inverted full-back must sprint back to his flank.',toD:'Excellent rest defence: 3+2 behind the ball stop counters before they start.',toA:'Quick release to the wingers who are already high and wide.',
  vs:['3 v 2 at the back beats a two-striker press','The inverted full-back pulls their winger inside, freeing the flank','If their wingers press the outside centre-backs, play into the box of four in midfield','Switch through the middle centre-back']},
 '433six':{build:'The 6 drops between the centre-backs who split very wide; the full-backs push up like wing-backs; wingers move inside.',prog:'Outside centre-backs carry forward into midfield; the 8s show between the lines.',final:'Full-backs give width, wingers attack the half-spaces, striker pins the centre-backs.',press:'Same as a 4-3-3 press: front three plus 8s jumping.',block:'4-5-1 mid block.',toD:'The dropped 6 must recover to midfield fast, or the space in front of the centre-backs is open.',toA:'Wide centre-backs and full-backs break forward together.',
  vs:['3v2 at the back against two strikers','Outside centre-backs drive into the space beside their strikers','If their 10 follows the 6 back, an 8 is free in midfield','Full-backs high and wide stretch their press']},
 '4231':{build:'Centre-backs split, the two holding midfielders stagger (one higher, one lower), full-backs offer width.',prog:'Play into the 10 between the lines or a holding midfielder facing forward.',final:'Left winger moves inside, left-back overlaps, the 10 arrives behind the striker: five on the last line.',press:'Striker and 10 press their centre-backs and 6, wingers press full-backs, the double pivot holds.',block:'4-4-1-1: the 10 sits on their 6, two banks of four behind.',toD:'The double pivot plus both centre-backs give a solid 4-man rest defence.',toA:'The 10 receives and turns; wingers sprint in behind.',
  vs:['Stagger the two holding midfielders so they are not on the same line','The 10 drops to receive and lays off (third man)','Use the full-back as the outlet when the press is central','Long to the striker, with the 10 and wingers squeezing for the second ball']},
 '442':{build:'Centre-backs split, both central midfielders show at different heights, wide midfielders hold width, one striker drops short.',prog:'Into the striker coming short, who lays off to a midfielder; or wide into the wide midfielder.',final:'One striker runs in behind, the other attacks the near post; wide midfielders cross, full-backs overlap.',press:'Both strikers press the centre-backs; wide midfielders press the full-backs; centre midfielders mark their midfield.',block:'Two flat banks of four. Stay compact; strikers block the passes into their 6.',toD:'Central midfielders hold; both full-backs recover.',toA:'Quick ball to the strikers: one in behind, one into feet.',
  vs:['One central midfielder drops between the centre-backs to escape two pressers','Direct ball to the target striker with the partner running off him','Wide midfielders come inside to receive between lines','Play the full-back early before the press is set']},
 '442d':{build:'Centre-backs split, the base of the diamond drops in, full-backs push high and wide.',prog:'Short combinations through the diamond: 6 to 8 to 10.',final:'Two strikers pin the centre-backs, the 10 arrives in the box, full-backs give the width and cross.',press:'Two strikers press centre-backs, the 10 locks their 6, 8s jump on full-backs or midfielders.',block:'Narrow 4-3-1-2. Force play wide, then trap on the touchline.',toD:'Counter-press with four midfielders close together.',toA:'Quick combinations through the middle and runs from the two strikers.',
  vs:['Base of the diamond drops between centre-backs','Diamond gives natural triangles for one-twos','Strikers split wide to receive in the channels','Full-backs high so the 8s can find them']},
 '4141':{build:'Centre-backs split, the 6 shows, 8s stay higher between their lines.',prog:'Into an 8 on the half-turn, then wide to the winger.',final:'Wide midfielders attack full-backs, 8s arrive in the box, striker pins the centre-backs.',press:'Striker on the centre-back, 8s jump onto their midfielders; the 6 covers.',block:'4-1-4-1 mid block: line of four in front of the 6.',toD:'The 6 stays as a screen while the 8s counter-press.',toA:'Wide midfielders break, 8s support quickly.',
  vs:['The 6 drops in to make a back three','8s drop into the space their midfielders leave','Use the wide midfielders as outlets on the touchline','Striker drops short to lay off']},
 '4222':{build:'The two holding midfielders stagger, full-backs push very high.',prog:'Into the two 10s in the half-spaces.',final:'Two strikers and two 10s overload the box; full-backs cross.',press:'Strikers press centre-backs, 10s press full-backs from the inside, pivots jump on midfielders.',block:'Narrow 4-4-2 with the 10s tucking in.',toD:'Four central players counter-press immediately.',toA:'Vertical attack: four players ready to break.',
  vs:['One holding midfielder drops between the centre-backs','Play into a 10 who bounces to a running striker','Long ball to the strikers with four players close for second balls','Full-backs as outlets']},
 '352':{build:'Three centre-backs give a spare player against one or two strikers. Wing-backs hold the touchline high.',prog:'Outside centre-backs carry forward; switch to the far wing-back.',final:'Wing-backs cross, two strikers attack near and far post, 8s arrive late.',press:'Strikers press centre-backs, 8s jump on their midfielders, wing-backs jump on full-backs.',block:'5-3-2. Midfield three slides across; strikers block their 6.',toD:'Wing-backs sprint back; three centre-backs hold.',toA:'Quick ball into the strikers or to the wing-backs breaking.',
  vs:['Three centre-backs = a spare man against two strikers','Outside centre-backs drive into the space beside the strikers','Long diagonal to the wing-back','Strikers split into the channels for longer passes']},
 '343':{build:'Back three with the double pivot ahead; wing-backs high.',prog:'Into the inside forwards in the half-spaces.',final:'3-2-5: wing-backs wide, inside forwards in half-spaces, striker central.',press:'Front three press the back line man-to-man; wing-backs jump on full-backs.',block:'5-4-1: inside forwards drop into midfield.',toD:'The pivot and back three form a 3-2 rest defence.',toA:'Front three break immediately with the wing-backs.',
  vs:['Spare centre-back against one or two strikers','Inside forwards drop into the half-spaces to receive','Switch through the middle centre-back to the far wing-back','Long to the front three, pivot squeezes for the second ball']},
 '3421':{build:'Back three, double pivot, wing-backs high, two 10s between the lines.',prog:'Into a 10 in the half-space who turns.',final:'Two 10s plus striker plus wing-backs = 5 on the last line.',press:'Striker on the middle centre-back, 10s press outside centre-backs, wing-backs jump.',block:'5-4-1 with the 10s dropping wide.',toD:'Pivot screens, back three hold.',toA:'The 10s receive on the turn and run.',
  vs:['Spare man at the back','10s drop between the lines to receive','Wing-backs as outlets','Striker holds up long balls with both 10s close']},
 '532':{build:'Three centre-backs, wing-backs stay deeper than in a 3-5-2.',prog:'Direct into the strikers or carry through the outside centre-backs.',final:'Wing-backs push on; two strikers in the box.',press:'Rarely press high: strikers screen their 6 and force play wide.',block:'Deep 5-3-2. Protect the box, clear crosses.',toD:'Drop quickly into the block.',toA:'Counter fast: strikers in behind, wing-backs flying forward.',
  vs:['Go long early to the strikers','Wing-backs as outlets','Spare centre-back always available','Don’t overplay near your own box']},
 '541':{build:'Back three in possession with wing-backs pushing on.',prog:'Direct to the striker or wide midfielders.',final:'Wide midfielders and wing-backs overload the flank.',press:'Low priority: protect the box.',block:'Deep 5-4-1. Nine players in two lines.',toD:'Recover quickly to the block.',toA:'Wide midfielders break; striker holds up.',
  vs:['Long ball to the striker to relieve pressure','Wide midfielders run the channels','Use the keeper to switch','Accept clearing danger when necessary']}
};
const JOB_OVR={
 '433inv':{LB:['Step inside next to the 6 in possession to make a 3-2 base.','Back to left-back without the ball; sprint back on transitions.'],RB:['Stay back as the third centre-back in possession.','Normal right-back out of possession.']},
 '433f9':{F9:['Drop between the lines to receive; drag a centre-back out or turn.','Screen their 6, press when the ball goes backwards.']},
 '433six':{DM:['Drop between the centre-backs to build as a back three.','Return to screen the back four without the ball.']}
};

/* ===== Beat-the-press scenes ===== */
const PRESS_ROUTES=[['through','Play through'],['long','Go long'],['switch','Switch via keeper']];
function pressScene(F,route){
  const ids=F.r.map((_,i)=>'p'+i), L=(a,b,t)=>a+(b-a)*t, cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const B=F.b.map((p,i)=>i?[L(p[0],F.ip[i][0],.5),cl(L(p[1],F.ip[i][1],.5)+13,4,90)]:[50,95]);
  const outf=[1,2,3,4,5,6,7,8,9,10], d=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  const back=outf.filter(i=>B[i][1]>=68).sort((a,b)=>B[a][0]-B[b][0]);
  const lcb=back[0], rcb=back[back.length-1];
  const st=outf.slice().sort((a,b)=>B[a][1]-B[b][1]||Math.abs(B[a][0]-50)-Math.abs(B[b][0]-50))[0];
  const free=outf.filter(i=>![lcb,rcb,st].includes(i));
  const piv=free.slice().sort((a,b)=>d(B[a],[50,64])-d(B[b],[50,64]))[0];
  const eight=free.filter(i=>i!==piv&&B[i][1]>40).sort((a,b)=>d(B[a],[38,52])-d(B[b],[38,52]))[0]??free.find(i=>i!==piv);
  const farW=outf.filter(i=>i!==rcb&&B[i][1]>40).sort((a,b)=>B[b][0]-B[a][0])[0];
  const wing=outf.filter(i=>i!==st&&B[i][1]<50).sort((a,b)=>B[a][0]-B[b][0])[0]??st;
  const e={}; F.r.forEach((r,i)=>e[ids[i]]=[B[i][0],B[i][1],r]);
  const mk={}; outf.forEach(i=>{e['q'+i]=[null,null,'','o']; mk['q'+i]=[B[i][0]+(B[i][0]<50?1.5:-1.5),cl(B[i][1]-4.5,3,92)]});
  const R=i=>F.r[i], P=i=>B[i];
  const f=[{h:'The press',m:mk,c:'They press man-to-man: every outfield player has a marker breathing down his neck. Your keeper is the only free player. Stay calm, keep the shape wide and look for the escape route.',d:1600}];
  if(route==='through'){
    const s2=[cl(P(lcb)[0]+12,10,90),cl(Math.max(P(st)[1]+22,48),30,62)];
    const e2=[cl(s2[0]-10,8,92),s2[1]-10];
    f.push(
     {h:'Bait',b:ids[lcb],m:{['q'+lcb]:[P(lcb)[0]+2,P(lcb)[1]-3]},c:`Keeper plays to the ${R(lcb)}. His marker jumps to press: that is what you want.`},
     {h:'Drop short',m:{[ids[st]]:s2,['q'+st]:[s2[0],s2[1]-3.5]},c:`The ${R(st)} drops toward the ball and drags his centre-back with him. That leaves space behind the midfield.`},
     {h:'Into feet',b:ids[st],c:`Firm pass into the ${R(st)}’s feet. He plays with his back to goal, so one or two touches only.`},
     {h:'Third man',m:{[ids[eight]]:e2},b:ids[eight],c:`The ${R(eight)} runs past his marker and the ${R(st)} lays it off first time. The third man is facing forward with the whole press behind him.`},
     {h:'Exploit',m:{[ids[eight]]:[e2[0]+4,e2[1]-14],[ids[wing]]:[P(wing)[0],12]},c:'Their back line is now exposed with fewer defenders. Drive at it and play the winger in behind.'}
    );
  } else if(route==='long'){
    const sq={}; outf.filter(i=>i!==st&&B[i][1]<74).forEach(i=>{sq[ids[i]]=[L(B[i][0],B[st][0],.3),cl(B[i][1]-6,6,90)]});
    const near=outf.filter(i=>i!==st&&B[i][1]<74).sort((a,b)=>d(sq[ids[a]],P(st))-d(sq[ids[b]],P(st)))[0];
    const nb=[P(st)[0]+6,P(st)[1]+4];
    f.push(
     {h:'Squeeze',m:sq,c:'Every short option is marked, so go long. First, the midfielders squeeze up close to the striker to win the second ball.'},
     {h:'Long ball',b:ids[st],m:{['q'+st]:[P(st)[0]+1,P(st)[1]-2.5]},d:1900,c:`Keeper kicks long to the ${R(st)}. Aim for the gap between his marker and their full-back, not straight onto the centre-back’s head.`},
     {h:'Second ball',b:ids[near],m:{[ids[near]]:nb},c:`Flick-on or knock-down: the ${R(near)} is closest and arrives first. Win the second ball and you have skipped their entire press.`},
     {h:'Attack',b:ids[wing],m:{[ids[wing]]:[P(wing)[0]<50?14:86,10]},c:'Their defenders are facing their own goal. Release the runner in behind immediately.'}
    );
  } else {
    const shift={}; outf.forEach(i=>{const k='q'+i; shift[k]=[mk[k][0]-8,mk[k][1]]}); shift['q'+lcb]=[P(lcb)[0]+2,P(lcb)[1]-3];
    const back2={}; outf.forEach(i=>{const k='q'+i; back2[k]=[mk[k][0]-3,mk[k][1]]});
    f.push(
     {h:'Bait',b:ids[lcb],m:shift,c:`Ball to the ${R(lcb)}. The whole press slides across to that side to trap him.`},
     {h:'Back to keeper',b:'p0',m:{p0:[44,93]},c:'He plays back to the keeper. The keeper moves to give a good angle: he is still the free player.'},
     {h:'Switch',b:ids[rcb],m:{...back2,p0:[48,94]},d:1600,c:`Keeper switches first time to the ${R(rcb)}. Their press has to run 30+ metres back across.`},
     {h:'Outlet',b:ids[farW],m:{[ids[farW]]:[P(farW)[0],P(farW)[1]-8],[ids[rcb]]:[P(rcb)[0],P(rcb)[1]-4]},c:`On to the ${R(farW)} on the far side, who now has time and space.`},
     {h:'Drive',m:{[ids[farW]]:[P(farW)[0],P(farW)[1]-24]},c:'Drive forward into the space their press has left. Press beaten.'}
    );
  }
  return {title:`Beat the press · ${F.name} ${F.v}`,tag:`${F.name} vs press`,view:'full',e,b:'p0',f};
}
