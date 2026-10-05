/* ===== Defending variations: full 11 v 11, any formation v any opponent ===== */
const DV_OPPS=['433','442','4231','352','343'];
const mirA=a=>a.map(p=>[100-p[0],100-p[1]]);
const cl2=(v,a,b)=>Math.max(a,Math.min(b,v));
const d2=(p,q)=>Math.hypot((p[0]-q[0])*.68,(p[1]-q[1])*1.05);
const R1=v=>Math.round(v*10)/10;
const pt=(x,y)=>[R1(cl2(x,2,98)),R1(cl2(y,2,98))];
function oppShapes(O){
  const L=(a,b,t)=>a+(b-a)*t;
  const build=O.b.map((p,i)=>i?[L(p[0],O.ip[i][0],.5),Math.min(90,L(p[1],O.ip[i][1],.5)+13)]:[50,95]);
  const mid=mirA(O.ip).map((p,i)=>i?pt(p[0],Math.max(i&&O.b[i][1]>70?18:26,p[1]-20)):[50,4]);
  return {build:mirA(build).map(p=>pt(p[0],p[1])),base:mirA(O.b).map(p=>pt(p[0],p[1])),ip:mirA(O.ip).map((p,i)=>i?pt(p[0],Math.min(94,p[1]+4)):[50,5]),low:mirA(O.lb).map(p=>pt(p[0],p[1])),mid};
}
function dvEnts(F,ours,O,opp){const e={}; F.r.forEach((r,i)=>e['p'+i]=[ours[i][0],ours[i][1],r]); if(O) O.r.forEach((r,i)=>e['q'+i]=[opp[i][0],opp[i][1],r,'o']); return e}
const shp=(pre,arr,skip=[])=>{const m={}; arr.forEach((p,i)=>{if(!skip.includes(i)) m[pre+i]=pt(p[0],p[1])}); return m};
const OUT=[1,2,3,4,5,6,7,8,9,10];
function greedy(A,B,cost){const pairs=[]; A.forEach(a=>B.forEach(b=>pairs.push([a,b,cost(a,b)]))); pairs.sort((x,y)=>x[2]-y[2]); const ua=new Set(),ub=new Set(),out=[]; for(const [a,b] of pairs){if(ua.has(a)||ub.has(b)) continue; ua.add(a); ub.add(b); out.push([a,b])} return out}
const nearestTo=(arr,p,cands=OUT)=>cands.slice().sort((a,b)=>d2(arr[a],p)-d2(arr[b],p))[0];
function block(F,b,shape=F.b,k=.28,cmp=.8){return shape.map((p,i)=>i?pt(50+(p[0]-50)*cmp+(b[0]-50)*k,p[1]+(b[1]-45)*.18):[50,95])}

const DEF_VARS=[
{id:'dv-full',n:'Full defensive sequence',when:'Overview of every defensive moment for this system.',pts:['High press, mid block and low block in one flow','Weak spots are marked in red','Ends with the counter-press after losing the ball']},
{id:'dv-man',n:'Man-to-man high press',when:'Opponent builds short from the keeper and you want to win the ball near their goal.',pts:['Every outfield player locks onto one opponent, goal-side','The keeper sweeps behind a high line','Leave them only the long ball, then win the header'],
 gen(F,O){
  const P=formationScene(F).parts, os=oppShapes(O), e=dvEnts(F,P.base,O,os.build);
  const pairs=greedy(OUT,OUT,(a,b)=>d2(P.press[a],os.build[b]));
  const lock={p0:[50,72]}; pairs.forEach(([a,b])=>{const q=os.build[b]; lock['p'+a]=pt(q[0]+(50-q[0])*.06,q[1]+3.5)});
  const backs=OUT.filter(i=>os.build[i][1]<32).sort((a,b)=>Math.abs(os.build[a][0]-38)-Math.abs(os.build[b][0]-38));
  const t=backs[0]??1, tp=os.build[t], pr=(pairs.find(p=>p[1]===t)||[1])[0];
  const tight={}; for(const k in lock) tight[k]=k==='p0'?lock[k]:pt(lock[k][0],lock[k][1]-1.2); tight['p'+pr]=pt(tp[0]+1.5,tp[1]+2.4);
  const st=OUT.slice().sort((a,b)=>os.build[b][1]-os.build[a][1])[0], stp=os.build[st];
  const mk=(pairs.find(p=>p[1]===st)||[2])[0];
  return {e,b:'q0',f:[
   {h:'Start',c:'Their keeper has the ball. We start in our normal shape, waiting for the signal to press.'},
   {h:'Lock on',m:lock,c:'Signal given: every outfield player picks up his man, goal-side and close enough to touch. Our keeper steps up to sweep behind the line.'},
   {h:'Trigger',b:'q'+t,m:tight,c:`Keeper plays short to the ${O.r[t]}. His marker jumps on the pass and everyone tightens one more step.`},
   {h:'No way out',b:[50,52],m:{['q'+st]:pt(50,56)},d:1800,c:'Every short option is covered, so he has to kick long and hope.'},
   {h:'Win it',b:'p'+mk,m:{['p'+mk]:pt(50,58)},c:`The ${F.r[mk]} attacks the long ball first. Regain in midfield with their team spread out.`}]};
 }},
{id:'dv-trap',n:'Wide pressing trap',when:'Their full-back is weaker on the ball, or you want to use the touchline as an extra defender.',pts:['Striker curves his run to block the switch','The pass to the full-back is the trigger','Three players close the ball; the far side tucks in'],
 gen(F,O){
  const P=formationScene(F).parts, os=oppShapes(O), e=dvEnts(F,P.press,O,os.build);
  const backs=OUT.filter(i=>os.build[i][1]<38);
  const fb=backs.slice().sort((a,b)=>os.build[b][0]-os.build[a][0])[0], f=os.build[fb];
  const cb=backs.filter(i=>i!==fb&&os.build[i][0]>45).sort((a,b)=>os.build[b][0]-os.build[a][0])[0]??backs[0], c=os.build[cb];
  const st=OUT.slice().sort((a,b)=>P.press[a][1]-P.press[b][1])[0];
  const s1={...shp('p',P.press.map((p,i)=>i?[p[0]+(c[0]-50)*.15,p[1]]:p)),['p'+st]:pt(c[0]-7,c[1]+3)};
  const near=OUT.filter(i=>i!==st).sort((a,b)=>d2(s1['p'+a],f)-d2(s1['p'+b],f));
  const trap={}; OUT.forEach(i=>{const p=s1['p'+i]; trap['p'+i]=pt(p[0]+(f[0]-50)*.3,p[1]-4)});
  trap['p'+near[0]]=pt(f[0]-1.5,f[1]+4); trap['p'+near[1]]=pt(Math.min(96,f[0]+1),f[1]+13); trap['p'+near[2]]=pt(f[0]-11,f[1]+3); trap['p'+st]=pt((f[0]+c[0])/2-2,(f[1]+c[1])/2+3);
  return {e,b:'q'+cb,f:[
   {h:'Curve',m:s1,c:`Ball with their ${O.r[cb]}. Our ${F.r[st]} curves his run from the inside so the pass back across is blocked: the only easy pass is wide.`},
   {h:'Trigger',b:'q'+fb,c:'He plays to the full-back. That pass is the trigger: everyone moves while the ball travels.'},
   {h:'Trap',m:trap,c:`The ${F.r[near[0]]} presses, the ${F.r[near[1]]} blocks the line down the touchline, the ${F.r[near[2]]} closes the inside pass and the ${F.r[st]} cuts the back pass. The far side tucks in.`},
   {h:'Win it',b:'p'+near[0],m:{['p'+near[0]]:pt(f[0]-.5,f[1]+2.5)},c:'Trapped against the touchline with no options. Ball won close to their goal.'}]};
 }},
{id:'dv-mid',n:'Mid block: zonal shifting',when:'Opponent is better on the ball. Protect the centre and wait for a mistake.',pts:['Move while the ball travels, not after','Nearest player steps out, the rest cover behind','Keep 10–12 m between teammates'],
 gen(F,O){
  const os=oppShapes(O), om=os.mid, cIdx=nearestTo(om,[50,42]);
  const L=OUT.filter(i=>om[i][1]>24&&om[i][1]<70).sort((a,b)=>om[a][0]-om[b][0]);
  const l=L[0], r=L[L.length-1], c=cIdx;
  const step=(b,i)=>{const s=block(F,om[b]); const n=nearestTo(s,om[b]); s[n]=pt(om[b][0]+(50-om[b][0])*.06,om[b][1]+4.5); return shp('p',s)};
  const e=dvEnts(F,block(F,om[c]),O,om);
  const ic=pt((om[r][0]+om[c][0])/2,(om[r][1]+om[c][1])/2+1), s4=block(F,om[r]); const ii=nearestTo(s4,ic);
  return {e,b:'q'+c,f:[
   {h:'Compact',m:step(c),c:'Their midfielder has it in the centre. We are compact and narrow; the nearest player steps out to stop him turning.'},
   {h:'Shift left',b:'q'+l,m:step(l),c:`Ball goes to their ${O.r[l]}. The whole block slides across together while the ball is still travelling.`},
   {h:'Back inside',b:'q'+c,m:step(c),c:'Back into the middle. We slide back and stay connected: never more than 12 m between teammates.'},
   {h:'Shift right',b:'q'+r,m:step(r),c:`Switch to their ${O.r[r]}. Same again: nearest player presses, the line behind covers the space.`},
   {h:'Intercept',b:'p'+ii,m:{['p'+ii]:ic},c:`He tries to play back inside through the block. The ${F.r[ii]} reads it and intercepts.`}]};
 }},
{id:'dv-low',n:'Low block: defending crosses',when:'Protecting a lead, or under heavy pressure from a team that crosses a lot.',pts:['Mark goal-side: see the ball and your man','Far-side full-back covers the back post','The 6 protects the cut-back zone'],
 gen(F,O){
  const os=oppShapes(O), oi=os.ip; const wc=OUT.filter(i=>oi[i][1]>50); const w=(wc.length?wc:OUT).slice().sort((a,b)=>oi[b][0]-oi[a][0])[0]; const wp=pt(Math.max(oi[w][0],84),Math.max(oi[w][1],72));
  const low=F.lb.map((p,i)=>i?pt(50+(p[0]-50)*.86+(wp[0]-50)*.2,p[1]):[54,96]);
  const opp=oi.map((p,i)=>i===w?wp:p); const e=dvEnts(F,low,O,opp);
  const fbp=nearestTo(low,wp); const f1={['p'+fbp]:pt(wp[0]-2,wp[1]+4)};
  const runners=OUT.filter(i=>i!==w).sort((a,b)=>opp[b][1]-opp[a][1]).slice(0,2);
  const backs=OUT.filter(i=>i!==fbp).sort((a,b)=>low[b][1]-low[a][1]);
  const cbs=backs.slice(0,4).sort((a,b)=>Math.abs(low[a][0]-50)-Math.abs(low[b][0]-50)).slice(0,2);
  const farFb=backs.slice(0,5).filter(i=>!cbs.includes(i)).sort((a,b)=>low[a][0]-low[b][0])[0];
  const six=nearestTo(low,[50,78],OUT.filter(i=>![fbp,...cbs,farFb].includes(i)));
  const f2={['q'+w]:pt(93,91),['q'+runners[0]]:pt(57,89),['q'+runners[1]]:pt(44,90),['p'+cbs[0]]:pt(57,92),['p'+cbs[1]]:pt(44,93),['p'+fbp]:pt(90,88),p0:pt(53,97)};
  if(farFb) f2['p'+farFb]=pt(36,92); if(six) f2['p'+six]=pt(50,81);
  OUT.filter(i=>![fbp,...cbs,farFb,six].includes(i)).forEach(i=>{f2['p'+i]=pt(50+(low[i][0]-50)*.6+6,Math.max(low[i][1],76))});
  return {e,b:'q'+w,f:[
   {h:'Ball wide',m:f1,c:'Deep block. Their winger has it wide; our nearest full-back closes him to stop an easy cross.'},
   {h:'Byline',m:f2,c:`He reaches the byline. Centre-backs go goal-side of the near- and far-post runners, the far full-back covers the back post and the ${six?F.r[six]:'6'} guards the cut-back zone.`},
   {h:'Cross',b:'p'+cbs[0],m:{['p'+cbs[0]]:pt(56,90.5)},c:`Cross to the near post. The ${F.r[cbs[0]]} attacks the ball first.`},
   {h:'Clear & step out',b:[22,60],m:Object.fromEntries(OUT.map(i=>{const p=f2['p'+i]||low[i]; return ['p'+i,pt(p[0],p[1]-9)]})),c:'Headed high and wide. The whole team steps out together so their second ball is played offside.'}]};
 }},
{id:'dv-cpress',n:'Counter-press after losing the ball',when:'You lose the ball high up the pitch while their team is still spread out to attack.',pts:['Nearest player presses the ball at once','Others block the forward passes','Five seconds: win it back or drop'],
 gen(F,O){
  const P=formationScene(F).parts, os=oppShapes(O), ol=os.low; const e=dvEnts(F,P.cross,O,ol);
  const lo=nearestTo(ol,P.lost); const won=nearestTo(P.cp,P.lost);
  return {e,b:'p'+P.wH,f:[
   {h:'Attacking',c:'We attack with players committed forward into their box.'},
   {h:'Lost',b:'q'+lo,m:{['q'+lo]:pt(P.lost[0],P.lost[1])},c:`Their ${O.r[lo]} wins the ball. This is the moment: they are spread out to attack, we are close to the ball.`},
   {h:'Swarm',m:shp('p',P.cp),c:'The three nearest players hunt the ball inside a second; the rest step up to block forward passes.'},
   {h:'Win it back',b:'p'+won,c:`Won back within five seconds by the ${F.r[won]}.`},
   {h:'Attack again',b:'p'+P.fH,c:'Their defence is out of shape. Attack the goal immediately.'}]};
 }},
{id:'dv-rest',n:'Rest defence v the counter',when:'You attack with many players and need protection if the ball is lost.',pts:['3 + 2 stay behind the ball while we attack','Delay the ball carrier; don’t dive in','Everyone else sprints back to the line of the ball'],
 gen(F,O){
  const P=formationScene(F).parts, os=oppShapes(O), ol=os.low; const fin=P.fin;
  const rest=OUT.filter(i=>fin[i][1]>=54).sort((a,b)=>fin[b][1]-fin[a][1]);
  const e=dvEnts(F,fin,O,ol);
  const car=nearestTo(ol,[50,40]); const fw=OUT.filter(i=>i!==car).sort((a,b)=>ol[b][1]-ol[a][1]).slice(0,2);
  const del=rest.slice().sort((a,b)=>Math.abs(fin[a][0]-50)-Math.abs(fin[b][0]-50)).find(i=>fin[i][1]<72)??rest[0];
  const back=shp('p',F.b.map((p,i)=>i?[p[0],p[1]+4]:[50,95]),[del]);
  return {e,b:'p'+P.wH,f:[
   {h:'Rest defence',c:`We attack, but ${rest.length} players stay behind the ball as rest defence: the centre-backs and the holding midfielder watch their forwards.`},
   {h:'Lost',b:'q'+car,m:{['q'+car]:pt(50,42)},c:'Ball lost. Their midfielder turns to start the counter.'},
   {h:'Counter',m:{['q'+car]:pt(50,52),['q'+fw[0]]:pt(36,70),['q'+fw[1]]:pt(64,70)},c:'He drives forward; two forwards sprint into the channels.'},
   {h:'Delay',m:{...back,['p'+del]:pt(50,58)},c:`The ${F.r[del]} delays the carrier without diving in. Centre-backs drop and narrow, everyone else sprints back behind the ball.`},
   {h:'Regain',b:'p'+del,c:'Help arrives and the ball is won. Counter stopped.'}]};
 }},
{id:'dv-backpass',n:'Back-pass pressing trigger',when:'The opponent recycles the ball backwards under pressure.',pts:['A back pass means: everyone steps up together','First presser curves to cut the switch','The back line squeezes up so the long ball is easy'],
 gen(F,O){
  const os=oppShapes(O), om=os.mid; const c=nearestTo(om,[50,42]); const cb=OUT.filter(i=>om[i][1]<30).sort((a,b)=>Math.abs(om[a][0]-42)-Math.abs(om[b][0]-42))[0]??1;
  const s=block(F,om[c]); const e=dvEnts(F,s,O,om);
  const up={}; OUT.forEach(i=>up['p'+i]=pt(s[i][0],s[i][1]-10)); up.p0=pt(50,82);
  const pr=OUT.slice().sort((a,b)=>s[a][1]-s[b][1])[0]; up['p'+pr]=pt(om[cb][0]+3,om[cb][1]+4);
  const after=s.map((p,i)=>i?up['p'+i]:p); const win=nearestTo(after,[50,52],OUT.filter(i=>i!==pr));
  return {e,b:'q'+c,f:[
   {h:'Block',c:'Mid block. Their midfielder receives facing his own goal.'},
   {h:'Back pass',b:'q'+cb,c:'He plays it backwards to the centre-back. That back pass is our trigger.'},
   {h:'Step up',m:up,c:'Everyone steps up 10 metres together while the ball travels. The first presser curves to block the switch.'},
   {h:'Forced long',b:[50,50],d:1700,c:'No time and no short pass: he has to go long.'},
   {h:'Win it',b:'p'+win,m:{['p'+win]:pt(50,53)},c:`Our ${F.r[win]} wins the header with the whole team already pushed up.`}]};
 }}
];
function defVarScene(F,id,oppId){
  const V=DEF_VARS.find(v=>v.id===id), O=FORMATIONS.find(f=>f.id===oppId)||FORMATIONS[0];
  const s=V.gen(F,O);
  return {title:`${V.n} · ${F.name}`,tag:`${F.name} v ${O.name}`,view:'full',t:'d',...s};
}
