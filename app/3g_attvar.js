/* ===== Attacking patterns: any formation v any opponent, full 11 v 11 ===== */
function attRoles(F,A){
  const pos=i=>roleToPos(F.r[i]), used=new Set([0]), bx=i=>F.b[i][0];
  const take=(cands,score)=>{const c=cands.filter(i=>!used.has(i)); if(!c.length) return null; const b=c.slice().sort((a,b)=>score(a)-score(b))[0]; used.add(b); return b};
  const near=p=>i=>d2(A[i],p);
  const by=(...ps)=>OUT.filter(i=>ps.includes(pos(i)));
  const R=x=>i=>bx(i)>50===x;
  const st=take(by('st'),i=>Math.abs(bx(i)-50)+A[i][1]*.1)??take(OUT,near([50,16]));
  const rw=take(by('w').filter(R(true)),i=>-bx(i))??take(by('wb','fb').filter(R(true)),i=>-bx(i))??take(OUT,near([86,24]));
  const lw=take(by('w').filter(R(false)),i=>bx(i))??take(by('wb','fb').filter(R(false)),i=>bx(i))??take(by('st'),near([40,16]))??take(OUT,near([14,24]));
  const rfb=take(by('fb','wb').filter(R(true)),i=>-bx(i));
  const lfb=take(by('fb','wb').filter(R(false)),i=>bx(i));
  const r8=take(by('cm','am','dm','w'),near([64,36]))??take(OUT,near([64,36]));
  const l8=take(by('cm','am','dm','w'),near([36,36]))??take(OUT,near([36,36]));
  const six=take(by('dm','cm','am'),near([50,58]))??take(by('cb'),near([50,70]))??take(OUT,near([50,60]));
  const rfb2=rfb??take(by('cm','am','dm').filter(R(true)),i=>-bx(i))??take(by('cb').filter(R(true)),i=>-bx(i))??r8;
  const lfb2=lfb??take(by('cm','am','dm').filter(R(false)),i=>bx(i))??take(by('cb').filter(R(false)),i=>bx(i))??l8;
  const cbs=OUT.filter(i=>!used.has(i)&&pos(i)==='cb').sort((a,b)=>bx(a)-bx(b));
  const rest=OUT.filter(i=>!used.has(i)).sort((a,b)=>A[b][1]-A[a][1]);
  return {st,rw,lw,r8,l8,six,rfb:rfb2,lfb:lfb2,lcb:cbs[0]??rest[0]??six,rcb:cbs[cbs.length-1]??rest[1]??six};
}
function qShift(base,b,k=.24){const m={}; base.forEach((p,i)=>{m['q'+i]=i?pt(50+(p[0]-50)*.88+(b[0]-50)*k,p[1]+(b[1]-p[1])*.06):pt(50+(b[0]-50)*.08,p[1])}); return m}
function uShift(base,b,skip,k=.18){const m={}; base.forEach((p,i)=>{if(i&&!skip.includes(i)) m['p'+i]=pt(p[0]+(b[0]-50)*k,p[1]+(b[1]-p[1])*.05)}); return m}
function seqBuilder(F,O,U0,Q0){
  const f=[]; const e=dvEnts(F,U0,O,Q0);
  return {e,f,step(h,c,mov,b,extra){const m={}; for(const k in mov) if(mov[k]) m[k]=pt(mov[k][0],mov[k][1]); const fr={h,c,m}; if(b!==undefined) fr.b=b; Object.assign(fr,extra||{}); f.push(fr)}};
}
const nearQ=(Q,p,skip=[])=>OUT.filter(i=>!skip.includes(i)).sort((a,b)=>d2(Q[a],p)-d2(Q[b],p))[0];
const AT_STARTS={};
const ATT_VARS=[
{id:'at-overlap',n:'Overlap & cross',sub:'2v1 on the flank',ic:'over',when:'Their full-back steps out to your winger and nobody covers outside him.',pts:['Winger drives inside to drag the full-back','Overlapper calls and sprints outside','Cross early, between the keeper and the back line'],
 gen(F,O){const P=formationScene(F).parts, A=P.fin, R=attRoles(F,A), Q=oppShapes(O).low;
  const s=seqBuilder(F,O,A,Q), W=A[R.rw], marker=nearQ(Q,W);
  s.step('Set',`Ball with the ${F.r[R.r8]}. Our ${F.r[R.rw]} is wide; the ${F.r[R.rfb]} is behind him, ready to overlap.`,{...qShift(Q,A[R.r8])},'p'+R.r8);
  s.step('Into the winger',`Pass to the ${F.r[R.rw]}. Their full-back jumps out to him.`,{...qShift(Q,W),['q'+marker]:[W[0]-2,W[1]-5]},'p'+R.rw);
  s.step('Overlap',`The ${F.r[R.rfb]} calls “Overlap!” and sprints around the outside. The ${F.r[R.rw]} drives inside and drags the full-back with him.`,{['p'+R.rfb]:[93,W[1]-8],['p'+R.rw]:[W[0]-12,W[1]-6],['q'+marker]:[W[0]-12,W[1]-9]});
  s.step('Release',`Slipped into the overlapper’s path.`,{['p'+R.rfb]:[94,14]},'p'+R.rfb);
  s.step('Box runs',`${F.r[R.st]} attacks the near post, ${F.r[R.lw]} the far post, the ${F.r[R.l8]} waits for the cut-back.`,{['p'+R.st]:[57,8],['p'+R.lw]:[38,9],['p'+R.l8]:[50,22],...qShift(Q,[80,12],.1)});
  s.step('Finish',`Early, low cross to the near post. Finish first time.`,{},'p'+R.st);
  s.step('Goal','Goal.',{},[52,0]);
  return {e:s.e,b:'p'+R.r8,f:s.f}}},
{id:'at-underlap',n:'Underlap & cut-back',sub:'Run inside the winger',ic:'under',when:'Their full-back is pinned by your winger on the touchline.',pts:['Winger holds the touchline','The runner attacks the channel between full-back and centre-back','Cut-back to the penalty spot, not the six-yard box'],
 gen(F,O){const P=formationScene(F).parts, A=P.fin, R=attRoles(F,A), Q=oppShapes(O).low;
  const s=seqBuilder(F,O,A,Q), W=[92,Math.max(26,A[R.rw][1])];
  s.step('Pin',`The ${F.r[R.rw]} stays wide on the touchline and pins their full-back.`,{['p'+R.rw]:W,...qShift(Q,W)},'p'+R.rw);
  s.step('Underlap',`The ${F.r[R.r8]} sprints inside him, into the gap between full-back and centre-back.`,{['p'+R.r8]:[77,18]});
  s.step('Through',`Ball into the channel.`,{['p'+R.r8]:[80,9]},'p'+R.r8);
  s.step('Arrive',`Box fills: ${F.r[R.st]} near post, ${F.r[R.lw]} far post, ${F.r[R.l8]} to the penalty spot.`,{['p'+R.st]:[58,8],['p'+R.lw]:[40,8],['p'+R.l8]:[50,19],...qShift(Q,[78,10],.1)});
  s.step('Cut-back',`Pulled back to the penalty spot.`,{},'p'+R.l8);
  s.step('Goal','First-time finish.',{},[46,0]);
  return {e:s.e,b:'p'+R.rw,f:s.f}}},
{id:'at-thirdman',n:'Third-man combination',sub:'Bounce and run beyond',ic:'third',when:'Their midfield marks tightly and you can’t play forward directly.',pts:['The wall player plays first time','The third man starts running as the first pass travels','Play forward the moment he faces goal'],
 gen(F,O){const P=formationScene(F).parts, A=P.prog, R=attRoles(F,A), Q=oppShapes(O).base;
  const s=seqBuilder(F,O,A,Q), ST=A[R.st];
  s.step('Set',`Ball with the ${F.r[R.six]}. Their midfield is tight to ours.`,{...qShift(Q,A[R.six])},'p'+R.six);
  s.step('Drop',`The ${F.r[R.st]} drops toward the ball and pulls his centre-back out.`,{['p'+R.st]:[50,ST[1]+12],['q'+nearQ(Q,ST)]:[50,ST[1]+8]});
  s.step('Into feet',`Firm pass into the ${F.r[R.st]}. As it travels, the ${F.r[R.r8]} runs past his marker.`,{['p'+R.r8]:[60,ST[1]+4]},'p'+R.st);
  s.step('Lay-off',`First-time lay-off: the ${F.r[R.r8]} is the third man, facing goal.`,{},'p'+R.r8);
  s.step('Slip',`Through ball for the ${F.r[R.rw]}, who runs in behind the full-back.`,{['p'+R.rw]:[70,12],...qShift(Q,[66,20],.1)},'p'+R.rw);
  s.step('Goal','Finish across the keeper.',{},[46,0]);
  return {e:s.e,b:'p'+R.six,f:s.f}}},
{id:'at-switch',n:'Switch to the weak side',sub:'Overload, then switch',ic:'swap',when:'Their block slides heavily toward the ball.',pts:['Circulate on one side to attract them','Switch in one or two passes','Winger attacks before help arrives'],
 gen(F,O){const P=formationScene(F).parts, A=P.prog, R=attRoles(F,A), Q=oppShapes(O).base;
  const s=seqBuilder(F,O,A,Q), L=[A[R.lfb][0],A[R.lfb][1]];
  s.step('Attract',`We keep the ball on the left. Their whole block slides across.`,{...qShift(Q,[20,45],.38),...uShift(A,[20,45],[R.rw])},'p'+R.lfb);
  s.step('Circulate',`Into the ${F.r[R.l8]}, who looks up.`,{},'p'+R.l8);
  s.step('Back',`Back to the ${F.r[R.six]}: the far side is empty.`,{},'p'+R.six);
  s.step('Switch',`Driven switch to the ${F.r[R.rw]}, isolated 1v1.`,{['p'+R.rw]:[90,34]},'p'+R.rw,{d:1800});
  s.step('Attack',`He attacks the full-back before help arrives.`,{['p'+R.rw]:[82,16],...qShift(Q,[86,30],.3)});
  s.step('Finish','Cut inside and shoot.',{},[46,0]);
  return {e:s.e,b:'p'+R.lfb,f:s.f}}},
{id:'at-halfspace',n:'Half-space overload',sub:'3v2 on one side',ic:'tri',when:'Opponent defends with a flat back four and a flat midfield.',pts:['Occupy touchline, half-space and channel','Receive between the lines, half-turned','Diagonal run behind the full-back'],
 gen(F,O){const P=formationScene(F).parts, A=P.prog, R=attRoles(F,A), Q=oppShapes(O).base;
  const s=seqBuilder(F,O,A,Q);
  s.step('Overload',`The ${F.r[R.rw]}, ${F.r[R.r8]} and ${F.r[R.rfb]} make a triangle on the right: 3 against 2.`,{['p'+R.rw]:[90,30],['p'+R.r8]:[70,34],['p'+R.rfb]:[84,46],...qShift(Q,[80,36],.3)},'p'+R.rfb);
  s.step('Between lines',`The ${F.r[R.r8]} receives in the half-space between their lines.`,{},'p'+R.r8);
  s.step('Diagonal',`The ${F.r[R.rw]} runs diagonally behind the full-back.`,{['p'+R.rw]:[72,14],['p'+R.st]:[46,12]});
  s.step('Through',`Through ball into the run.`,{['p'+R.rw]:[66,9]},'p'+R.rw);
  s.step('Goal','Finish low across the keeper.',{},[44,0]);
  return {e:s.e,b:'p'+R.rfb,f:s.f}}},
{id:'at-f9',n:'False 9 & runners',sub:'Drop deep, run beyond',ic:'f9',when:'Their centre-backs follow your striker when he drops.',pts:['Striker drops early','Wingers and 8s run into the space he leaves','Pass into space, not to feet'],
 gen(F,O){const P=formationScene(F).parts, A=P.fin, R=attRoles(F,A), Q=oppShapes(O).base;
  const s=seqBuilder(F,O,A,Q), cb=nearQ(Q,A[R.st]);
  s.step('Set',`Ball with the ${F.r[R.six]}.`,{},'p'+R.six);
  s.step('Drop',`The ${F.r[R.st]} drops into midfield. Their centre-back follows him.`,{['p'+R.st]:[50,40],['q'+cb]:[50,35]});
  s.step('Receive',`Ball into the ${F.r[R.st]}.`,{},'p'+R.st);
  s.step('Runners',`Both wide players sprint into the hole the centre-back left.`,{['p'+R.rw]:[60,14],['p'+R.lw]:[38,14],['p'+R.r8]:[60,30]});
  s.step('Release',`Ball into the space for the ${F.r[R.rw]}.`,{['p'+R.rw]:[56,8]},'p'+R.rw);
  s.step('Goal','1v1 with the keeper: finish.',{},[50,0]);
  return {e:s.e,b:'p'+R.six,f:s.f}}},
{id:'at-counter',n:'Counter-attack',sub:'Win it, go in 10 s',ic:'counter',when:'You win the ball while they have players committed forward.',pts:['First look forward','Wide runners stretch, the carrier drives','Finish within 10 seconds'],
 gen(F,O){const P=formationScene(F).parts, A=F.lb.map((p,i)=>i?pt(p[0],p[1]-6):[50,95]), R=attRoles(F,P.fin), Q=oppShapes(O).ip.map((p,i)=>i?pt(p[0],Math.min(p[1]+6,78)):p);
  const s=seqBuilder(F,O,A,Q), lost=nearQ(Q,[50,62]);
  s.step('Regain',`The ${F.r[R.six]} wins it. They have players committed forward.`,{['p'+R.six]:[50,62]},'p'+R.six);
  s.step('Release',`First look forward: into the ${F.r[R.st]}. Both wide players sprint.`,{['p'+R.st]:[50,44],['p'+R.rw]:[80,40],['p'+R.lw]:[20,40]},'p'+R.st);
  s.step('Drive',`He drives at the last defenders while the runners stretch them.`,{['p'+R.st]:[50,28],['p'+R.rw]:[80,20],['p'+R.lw]:[22,20],['p'+R.r8]:[60,40]});
  s.step('Square',`A defender commits: square pass to the free runner.`,{['p'+R.rw]:[68,12]},'p'+R.rw);
  s.step('Goal','Finish inside 10 seconds.',{},[54,0]);
  return {e:s.e,b:'q'+lost,f:s.f}}},
{id:'at-lowblock',n:'Breaking a low block',sub:'Circulate, rotate, cut back',ic:'low',when:'Opponent defends deep with ten behind the ball.',pts:['Ball speed: one and two touch','Overload a flank and rotate','Cut-backs and shots from the edge'],
 gen(F,O){const P=formationScene(F).parts, A=P.fin, R=attRoles(F,A), Q=oppShapes(O).low;
  const s=seqBuilder(F,O,A,Q);
  s.step('Circulate',`Quick passes across the top of their block.`,{...qShift(Q,A[R.l8],.25)},'p'+R.l8);
  s.step('Switch',`Into the ${F.r[R.r8]}; the block slides across.`,{...qShift(Q,A[R.r8],.3)},'p'+R.r8);
  s.step('Rotate',`The ${F.r[R.r8]} drifts wide, the ${F.r[R.rw]} attacks the half-space, the ${F.r[R.rfb]} pushes up.`,{['p'+R.r8]:[86,24],['p'+R.rw]:[70,16],['p'+R.rfb]:[84,36]},'p'+R.rfb);
  s.step('Byline',`Out to the ${F.r[R.r8]}, who gets to the byline.`,{['p'+R.r8]:[88,8]},'p'+R.r8);
  s.step('Cut-back',`Defenders collapse onto the six-yard box: cut it back to the edge.`,{['p'+R.l8]:[52,22],['p'+R.st]:[54,7]},'p'+R.l8);
  s.step('Shot','Strike low through the crowd.',{},[48,0]);
  return {e:s.e,b:'p'+R.l8,f:s.f}}},
{id:'at-direct',n:'Direct play & second ball',sub:'Long, flick, run',ic:'arc',when:'You have a strong target striker, or they push their line high.',pts:['Midfield squeezes up before the ball','Aim between centre-back and full-back','Win the second ball and play forward'],
 gen(F,O){const P=formationScene(F).parts, A=P.prog, R=attRoles(F,A), Q=oppShapes(O).base;
  const s=seqBuilder(F,O,A,Q), ST=A[R.st];
  s.step('Squeeze',`Ball with the ${F.r[R.rcb]}. Midfielders squeeze up close to the striker.`,{['p'+R.r8]:[ST[0]+10,ST[1]+10],['p'+R.l8]:[ST[0]-10,ST[1]+10]},'p'+R.rcb);
  s.step('Long ball',`Long into the ${F.r[R.st]}.`,{['q'+nearQ(Q,ST)]:[ST[0]+1,ST[1]-2]},'p'+R.st,{d:1900});
  s.step('Flick',`Flick-on: the ${F.r[R.r8]} wins the second ball.`,{['p'+R.r8]:[ST[0]+6,ST[1]-4]},'p'+R.r8);
  s.step('Runner',`The ${F.r[R.lw]} runs diagonally in behind.`,{['p'+R.lw]:[40,12]},'p'+R.lw);
  s.step('Goal','First-time finish.',{},[48,0]);
  return {e:s.e,b:'p'+R.rcb,f:s.f}}},
{id:'at-isolate',n:'Isolate the winger',sub:'Clear the side, 1v1',ic:'iso',when:'Your winger is quicker than their full-back.',pts:['Teammates move away to clear the space','Switch quickly to the isolated winger','Attack the defender at speed'],
 gen(F,O){const P=formationScene(F).parts, A=P.fin, R=attRoles(F,A), Q=oppShapes(O).base;
  const s=seqBuilder(F,O,A,Q);
  s.step('Clear',`The ${F.r[R.r8]} and ${F.r[R.rfb]} move inside, leaving the right side empty for the ${F.r[R.rw]}.`,{['p'+R.r8]:[52,32],['p'+R.rfb]:[66,46],['p'+R.rw]:[90,30],...qShift(Q,[40,40],.2)},'p'+R.l8);
  s.step('Switch',`Quick switch to the isolated ${F.r[R.rw]}.`,{},'p'+R.rw,{d:1700});
  s.step('Attack',`He drives at the full-back at full speed.`,{['p'+R.rw]:[84,20],['q'+nearQ(Q,[86,26])]:[82,17]});
  s.step('Beat him',`Change of pace on the outside.`,{['p'+R.rw]:[90,8]});
  s.step('Cut-back',`Cut back to the arriving ${F.r[R.r8]}.`,{['p'+R.r8]:[56,18],['p'+R.st]:[52,7]},'p'+R.r8);
  s.step('Goal','Finish.',{},[48,0]);
  return {e:s.e,b:'p'+R.l8,f:s.f}}},
{id:'at-rotation',n:'Wide rotation',sub:'Swap roles, lose markers',ic:'rot',when:'Their wide players man-mark and follow runs.',pts:['Winger comes inside, 8 runs wide','Full-back pushes high','Markers get confused: one player is always free'],
 gen(F,O){const P=formationScene(F).parts, A=P.prog, R=attRoles(F,A), Q=oppShapes(O).base;
  const s=seqBuilder(F,O,A,Q);
  s.step('Start',`Ball with the ${F.r[R.six]}. Right side: ${F.r[R.rw]} wide, ${F.r[R.r8]} inside, ${F.r[R.rfb]} deep.`,{},'p'+R.six);
  s.step('Rotate',`Winger comes inside, the ${F.r[R.r8]} runs wide, the ${F.r[R.rfb]} pushes high. Their markers follow and collide.`,{['p'+R.rw]:[68,30],['p'+R.r8]:[90,30],['p'+R.rfb]:[86,40]});
  s.step('Free man',`The ${F.r[R.rw]} is free in the half-space.`,{},'p'+R.rw);
  s.step('Wide',`Out to the ${F.r[R.r8]} on the touchline.`,{['p'+R.r8]:[90,16]},'p'+R.r8);
  s.step('Cross',`Cross for the ${F.r[R.st]}.`,{['p'+R.st]:[52,7]},'p'+R.st);
  s.step('Goal','Header in.',{},[50,0]);
  return {e:s.e,b:'p'+R.six,f:s.f}}},
{id:'at-behind',n:'Ball in behind a high line',sub:'Beat the offside trap',ic:'beh',when:'Their defensive line steps up high.',pts:['Runners start on the last defender’s shoulder','Curve the run to stay onside','Passer looks up: that is the cue'],
 gen(F,O){const P=formationScene(F).parts, A=P.prog, R=attRoles(F,A), Q=oppShapes(O).base.map((p,i)=>i?pt(p[0],p[1]+10):pt(50,12));
  const s=seqBuilder(F,O,A,Q);
  const line=Math.min(...OUT.map(i=>Q[i][1]));
  s.step('High line',`Their line is high, around halfway.`,{['p'+R.st]:[48,line+1],['p'+R.rw]:[72,line+1]},'p'+R.six);
  s.step('Cue',`The ${F.r[R.six]} lifts his head: that’s the cue.`,{});
  s.step('Curve',`The ${F.r[R.st]} curves his run across the defender to stay onside.`,{['p'+R.st]:[56,line-8]});
  s.step('Over the top',`Ball dropped in behind.`,{['p'+R.st]:[56,14],...qShift(Q.map(p=>[p[0],p[1]-8]),[56,20],.1)},'p'+R.st,{d:1800});
  s.step('Goal','1v1: finish across the keeper.',{},[46,0]);
  return {e:s.e,b:'p'+R.six,f:s.f}}}
];
function attVarScene(F,id,oppId){
  const V=ATT_VARS.find(v=>v.id===id), O=FORMATIONS.find(f=>f.id===oppId)||FORMATIONS[0];
  return {title:`${V.n} · ${F.name}`,tag:`${F.name} v ${O.name}`,view:'full',...V.gen(F,O)};
}
