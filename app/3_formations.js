/* ===== Formations ===== */
const R433=['GK','LB','LCB','RCB','RB','LCM','DM','RCM','LW','ST','RW'];
const B433=[[50,95],[14,72],[37,77],[63,77],[86,72],[32,56],[50,64],[68,56],[15,38],[50,33],[85,38]];
const LB433=[[50,96],[16,82],[38,85],[62,85],[84,82],[34,70],[50,74],[66,70],[14,66],[50,52],[86,66]];
const R352=['GK','LCB','CB','RCB','LWB','LCM','DM','RCM','RWB','LST','RST'];
const LB352=[[50,96],[30,86],[50,87],[70,86],[12,82],[34,70],[50,74],[66,70],[88,82],[42,52],[58,52]];

const FORMATIONS=[
{id:'433',name:'4-3-3',v:'Single pivot',fam:'Back four',r:R433,b:B433,lb:LB433,
 ip:[[50,92],[10,42],[34,70],[66,70],[90,42],[34,38],[50,58],[66,38],[12,22],[50,18],[88,22]],
 ipN:'2-1-4-3',lbN:'4-5-1',
 desc:'Three forwards stretch the back line while a lone 6 anchors two attacking 8s. Built to press high and attack with width on both flanks.',
 str:['Natural triangles all over the pitch for quick combinations','The front three can press a back four, with the 8s jumping onto midfielders','Winger and full-back overload each flank'],
 wk:['Space either side of the lone 6 when the 8s push on','Full-backs leave space behind them in transition','The striker gets isolated if the wingers stay wide'],
 best:'A strong, disciplined 6, two box-to-box 8s and quick wide forwards.',
 wz:[[16,59,24,11,'SPACE'],[60,59,24,11,'SPACE']],
 cap:{mid:'Mid block: wingers tuck in to make a 4-5-1 and the block slides toward the ball. The weak spot is either side of the lone 6.'}},

{id:'433f9',name:'4-3-3',v:'False 9',fam:'Back four',r:['GK','LB','LCB','RCB','RB','LCM','DM','RCM','LW','F9','RW'],b:B433,lb:LB433,
 ip:[[50,92],[12,45],[35,70],[65,70],[88,45],[35,26],[50,58],[65,26],[14,20],[50,40],[86,20]],
 ipN:'2-3-1-4',lbN:'4-5-1',
 desc:'The striker drops into midfield. Either a centre-back follows him and leaves a hole, or he turns free between the lines. Wingers and 8s attack the space he leaves.',
 str:['Creates a 4v3 overload in central midfield','Centre-backs face a dilemma every time he drops','Runners arriving from midfield are hard to track'],
 wk:['No fixed target in the box for crosses','Needs a striker with elite passing and vision','Can lack penetration against a deep, patient block'],
 best:'A technical striker who can play as a 10, plus 8s who score goals.',
 wz:[[16,59,24,11,'SPACE'],[60,59,24,11,'SPACE']],
 cap:{final:'Final third: the false 9 drops between the lines and both 8s and both wingers sprint beyond. Four runners against four defenders.'}},

{id:'433inv',name:'4-3-3',v:'Inverted full-back',fam:'Back four',r:R433,b:B433,lb:LB433,
 ip:[[50,92],[40,58],[28,72],[50,74],[72,72],[32,24],[60,58],[68,24],[8,22],[50,16],[92,22]],
 ipN:'3-2-5',lbN:'4-5-1',
 desc:'In possession the left-back steps into midfield beside the 6, the right-back becomes a third centre-back and the 8s push up. The result is a 3-2-5 with strong protection against counters.',
 str:['Five attackers fill all five channels on the last line','A 3+2 base stops counter-attacks before they start','The midfield box makes it easy to keep the ball'],
 wk:['The inverted full-back needs a midfielder’s scanning and passing','If he is caught inside, the flank behind him is open','Width on the left depends on one player'],
 best:'A full-back who is comfortable in midfield and a winger who holds the touchline.',
 wz:[[16,59,24,11,'SPACE'],[60,59,24,11,'SPACE']],
 cap:{build:'Build-up: the right-back stays back as a third centre-back while the left-back steps inside next to the 6.',final:'Final third: a 3-2-5. Wingers hold the touchlines, the 8s attack the half-spaces and the striker pins both centre-backs.'}},

{id:'433six',name:'4-3-3',v:'6 drops (back three build)',fam:'Back four',r:R433,b:B433,lb:LB433,
 ip:[[50,92],[8,40],[26,74],[74,74],[92,40],[36,46],[50,76],[64,46],[22,22],[50,16],[78,22]],
 ipN:'3-4-3',lbN:'4-5-1',
 desc:'The 6 drops between the centre-backs to make a back three. Full-backs push high and wide like wing-backs and the wingers move inside.',
 str:['3v2 against a two-striker press','Full-backs get forward early as wing-backs','Simple, reliable route out of pressure'],
 wk:['Removes the 6 from midfield and can leave a central gap','Opponents can man-mark the 8s','The 6 must be calm receiving close to his own goal'],
 best:'Teams facing two strikers who press high.',
 wz:[[30,56,40,12,'GAP']],
 cap:{build:'Build-up: the 6 drops between the centre-backs, who split wide. Two pressing strikers now face three defenders.'}},

{id:'4231',name:'4-2-3-1',v:'Double pivot',fam:'Back four',r:['GK','LB','LCB','RCB','RB','LDM','RDM','LW','CAM','RW','ST'],
 b:[[50,95],[14,72],[37,77],[63,77],[86,72],[40,62],[60,62],[16,44],[50,46],[84,44],[50,32]],
 ip:[[50,92],[10,40],[34,72],[66,72],[90,46],[40,58],[60,60],[28,24],[50,30],[88,22],[50,16]],
 lb:[[50,96],[16,82],[38,85],[62,85],[84,82],[42,72],[58,72],[14,70],[50,58],[86,70],[50,48]],
 ipN:'2-3-5',lbN:'4-4-1-1',
 desc:'Two holding midfielders give stability while the 10 links midfield to a lone striker. One of the most balanced systems in the game.',
 str:['Two holding midfielders shield the back four','The 10 finds pockets between the lines','Easy switch to a 4-4-1-1 without the ball'],
 wk:['The striker can be isolated','If the 10 does not defend, the pivot gets overrun','Predictable without runners beyond the striker'],
 best:'A creative 10, a mobile striker and two disciplined holding midfielders.',
 wz:[[4,58,20,14,'SPACE'],[76,58,20,14,'SPACE']],
 cap:{final:'Final third: the left winger moves inside, the left-back overlaps and the 10 arrives behind the striker. Five players on the last line.'}},

{id:'442',name:'4-4-2',v:'Flat',fam:'Back four',r:['GK','LB','LCB','RCB','RB','LM','LCM','RCM','RM','LST','RST'],
 b:[[50,95],[14,74],[37,78],[63,78],[86,74],[14,54],[40,57],[60,57],[86,54],[42,34],[58,36]],
 ip:[[50,92],[10,48],[35,72],[65,72],[90,48],[10,26],[40,50],[60,44],[90,26],[44,18],[56,24]],
 lb:[[50,96],[16,84],[38,86],[62,86],[84,84],[16,70],[40,72],[60,72],[84,70],[44,54],[56,56]],
 ipN:'4-2-4',lbN:'4-4-2',
 desc:'Two banks of four and a strike partnership. Simple, compact and hard to break down, with clear jobs for everyone.',
 str:['Two compact banks of four are easy to organise','Strike pair: one runs in behind, one comes short','Two players on each flank for 2v1s'],
 wk:['2v3 in central midfield against a midfield three','A 10 can find space between the lines','Can become direct and lose control of the ball'],
 best:'Organised, hard-working teams with a quick striker and a target striker.',
 wz:[[28,62,44,11,'SPACE']],
 cap:{mid:'Mid block: two flat banks of four slide together toward the ball. The gap to watch is between the lines, where a 10 can receive.'}},

{id:'442d',name:'4-4-2',v:'Diamond',fam:'Back four',r:['GK','LB','LCB','RCB','RB','DM','LCM','RCM','AM','LST','RST'],
 b:[[50,95],[14,72],[37,77],[63,77],[86,72],[50,66],[32,56],[68,56],[50,46],[42,32],[58,32]],
 ip:[[50,92],[8,36],[34,72],[66,72],[92,36],[50,60],[30,44],[70,44],[50,32],[40,18],[60,18]],
 lb:[[50,96],[18,82],[38,85],[62,85],[82,82],[50,72],[30,70],[70,70],[50,58],[42,46],[58,46]],
 ipN:'2-1-2-1-4',lbN:'4-3-1-2',
 desc:'Four central midfielders in a diamond overload the middle, with two strikers ahead. All the width comes from the full-backs.',
 str:['Numbers in central midfield','Two strikers occupy both centre-backs','Short distances for combinations through the middle'],
 wk:['No natural width; full-backs cover the whole flank','Wide areas are exposed to switches of play','Very demanding for the full-backs and the shuttling 8s'],
 best:'Technical central midfielders and full-backs with huge engines.',
 wz:[[2,48,16,24,'SPACE'],[82,48,16,24,'SPACE']],
 cap:{mid:'Mid block: the diamond stays narrow and shuffles across. Weak spot: the wide areas outside the 8s.'}},

{id:'4141',name:'4-1-4-1',v:'Holding 6',fam:'Back four',r:['GK','LB','LCB','RCB','RB','DM','LM','LCM','RCM','RM','ST'],
 b:[[50,95],[14,74],[37,78],[63,78],[86,74],[50,66],[14,50],[38,52],[62,52],[86,50],[50,32]],
 ip:[[50,92],[10,46],[34,72],[66,72],[90,46],[50,60],[10,24],[36,32],[64,32],[90,24],[50,16]],
 lb:[[50,96],[16,83],[38,86],[62,86],[84,83],[50,76],[14,66],[38,66],[62,66],[86,66],[50,50]],
 ipN:'2-3-5',lbN:'4-1-4-1',
 desc:'A single 6 screens the back four with a line of four in front. Defensively solid and it turns into a 4-3-3 the moment you win the ball.',
 str:['The 6 protects the back four in a compact block','Five in midfield control the centre','The 8s can jump to press'],
 wk:['The striker is isolated','The 6 can be overloaded by two 10s','Needs disciplined wide midfielders'],
 best:'Teams that defend in a mid block and break quickly.',
 wz:[[20,58,20,10,'SPACE'],[60,58,20,10,'SPACE']]},

{id:'4222',name:'4-2-2-2',v:'Box midfield',fam:'Back four',r:['GK','LB','LCB','RCB','RB','LDM','RDM','LAM','RAM','LST','RST'],
 b:[[50,95],[14,72],[37,77],[63,77],[86,72],[40,62],[60,62],[32,46],[68,46],[42,32],[58,32]],
 ip:[[50,92],[8,36],[34,72],[66,72],[92,36],[40,58],[60,58],[34,30],[66,30],[42,18],[58,18]],
 lb:[[50,96],[16,83],[38,86],[62,86],[84,83],[40,74],[60,74],[20,64],[80,64],[44,50],[56,50]],
 ipN:'2-2-2-4',lbN:'4-4-2',
 desc:'Two holding midfielders, two narrow attacking midfielders and two strikers. A compact central box that suits fast, vertical attacks and counter-pressing.',
 str:['Central overload for quick combinations','Four players close together to counter-press','Two strikers and two 10s attack the box'],
 wk:['Full-backs provide all of the width','Exposed to switches of play','High running demands on the 10s without the ball'],
 best:'High-energy pressing teams that attack vertically.',
 wz:[[2,50,18,22,'SPACE'],[80,50,18,22,'SPACE']]},

{id:'352',name:'3-5-2',v:'Wing-backs',fam:'Back three',r:R352,
 b:[[50,95],[30,78],[50,80],[70,78],[10,58],[34,56],[50,64],[66,56],[90,58],[42,34],[58,34]],
 ip:[[50,92],[24,72],[50,76],[76,72],[8,30],[34,40],[50,58],[66,40],[92,30],[42,18],[58,20]],
 lb:LB352,ipN:'3-1-4-2',lbN:'5-3-2',
 desc:'Three centre-backs, wing-backs for width, a midfield three and a front two. Strong through the middle and flexible between attack and defence.',
 str:['An extra centre-back covers the strike partnership','Wing-backs give width at both ends','Midfield three plus two strikers dominate the centre'],
 wk:['Wing-backs face 2v1s on the flanks','Space behind the wing-backs in transition','Huge fitness demands on the wing-backs'],
 best:'Ball-playing centre-backs and two tireless wing-backs.',
 wz:[[2,64,16,16,'SPACE'],[82,64,16,16,'SPACE']]},

{id:'343',name:'3-4-3',v:'Front three',fam:'Back three',r:['GK','LCB','CB','RCB','LWB','LCM','RCM','RWB','LW','ST','RW'],
 b:[[50,95],[30,78],[50,80],[70,78],[10,56],[40,60],[60,60],[90,56],[22,38],[50,32],[78,38]],
 ip:[[50,92],[22,70],[50,74],[78,70],[6,28],[40,54],[60,54],[94,28],[30,22],[50,16],[70,22]],
 lb:[[50,96],[30,86],[50,87],[70,86],[12,82],[40,72],[60,72],[88,82],[22,66],[50,52],[78,66]],
 ipN:'3-2-5',lbN:'5-4-1',
 desc:'A back three with wing-backs, a double pivot and an attacking front three. Aggressive, and well suited to pressing high.',
 str:['Five players on the last line in attack','The front three can press a back three or four','The back three gives width in build-up'],
 wk:['Only two central midfielders can be outnumbered','Wing-backs must defend 1v1 against wingers','Half-spaces either side of the pivot are exposed'],
 best:'Teams with quick wide forwards and athletic wing-backs.',
 wz:[[12,58,22,11,'SPACE'],[66,58,22,11,'SPACE']]},

{id:'3421',name:'3-4-2-1',v:'Two 10s',fam:'Back three',r:['GK','LCB','CB','RCB','LWB','LCM','RCM','RWB','LAM','RAM','ST'],
 b:[[50,95],[30,78],[50,80],[70,78],[10,56],[40,62],[60,62],[90,56],[34,44],[66,44],[50,32]],
 ip:[[50,92],[22,70],[50,74],[78,70],[6,26],[40,56],[60,56],[94,26],[34,26],[66,26],[50,16]],
 lb:[[50,96],[30,86],[50,87],[70,86],[12,82],[40,72],[60,72],[88,82],[30,64],[70,64],[50,50]],
 ipN:'3-2-5',lbN:'5-4-1',
 desc:'Two 10s play in the half-spaces behind a lone striker while the wing-backs hold the width. Creates central overloads between the lines.',
 str:['Two 10s occupy the half-spaces between the lines','Five-player last line in possession','A solid back five without the ball'],
 wk:['The lone striker must hold the ball up','A two-man midfield can be outnumbered','Depends heavily on wing-back fitness'],
 best:'Two creative attacking midfielders and a striker who links play.',
 wz:[[12,58,22,11,'SPACE'],[66,58,22,11,'SPACE']]},

{id:'532',name:'5-3-2',v:'Counter-attack',fam:'Back five',r:R352,
 b:[[50,95],[30,80],[50,82],[70,80],[10,74],[34,58],[50,64],[66,58],[90,74],[42,36],[58,36]],
 ip:[[50,92],[24,72],[50,76],[76,72],[8,36],[34,42],[50,58],[66,42],[92,36],[42,18],[58,20]],
 lb:LB352,ipN:'3-5-2',lbN:'5-3-2',
 desc:'Five defenders protect the box, then two strikers and the wing-backs spring counter-attacks. A low-risk system that is hard to break down.',
 str:['Very solid protection of the box','Two strikers stay high, ready to counter','Wing-backs fly forward in transition'],
 wk:['Little pressure on the ball high up the pitch','Invites long spells of pressure','The midfield three must cover the full width'],
 best:'Underdog matchups and protecting a lead.',
 wz:[[8,52,20,12,'SPACE'],[72,52,20,12,'SPACE']]},

{id:'541',name:'5-4-1',v:'Deep block',fam:'Back five',r:['GK','LWB','LCB','CB','RCB','RWB','LM','LCM','RCM','RM','ST'],
 b:[[50,95],[10,74],[30,79],[50,81],[70,79],[90,74],[16,56],[40,58],[60,58],[84,56],[50,36]],
 ip:[[50,92],[8,40],[26,72],[50,75],[74,72],[92,40],[22,24],[40,52],[60,52],[78,24],[50,16]],
 lb:[[50,96],[12,84],[30,87],[50,88],[70,87],[88,84],[16,72],[40,74],[60,74],[84,72],[50,54]],
 ipN:'3-4-3',lbN:'5-4-1',
 desc:'Two compact lines of five and four in front of goal. Designed to deny space and counter through the wide players.',
 str:['Nine defenders leave very few gaps','Wide midfielders can break quickly','Clear zonal responsibilities'],
 wk:['The striker is very isolated','Hard to keep the ball after winning it','Concedes long spells of possession'],
 best:'Defending a lead or facing a much stronger opponent.',
 wz:[[30,40,40,12,'SPACE']]}
];

const roleToPos=r=>r==='GK'?'gk':/WB$/.test(r)?'wb':/CB$/.test(r)?'cb':/^(LB|RB)$/.test(r)?'fb':/DM$/.test(r)?'dm':/CM$/.test(r)?'cm':/AM$/.test(r)?'am':/^(LW|RW|LM|RM)$/.test(r)?'w':'st';
const PHASES=[['Shape',0],['Build-up',1],['Progression',3],['Final third',4],['Counter-press',7],['High press',8],['Mid block',9],['Low block',10]];

function formationScene(F){
  const ids=F.r.map((_,i)=>'p'+i), cap=F.cap||{};
  const L=(a,b,t)=>a+(b-a)*t, cl=(v,a,b)=>Math.max(a,Math.min(b,v));
  const mix=(A,B,t,dy)=>A.map((p,i)=>[L(p[0],B[i][0],t),cl(L(p[1],B[i][1],t)+dy,4,92)]);
  const sh=arr=>{const m={};arr.forEach((p,i)=>m[ids[i]]=[p[0],p[1]]);return m};
  const outf=[1,2,3,4,5,6,7,8,9,10];
  const arg=(arr,score,filt=()=>true)=>outf.filter(i=>filt(arr[i],i)).sort((a,b)=>score(arr[a])-score(arr[b]))[0];
  const dist=(p,q)=>Math.hypot(p[0]-q[0],p[1]-q[1]);
  const base=F.b, ip=F.ip, lb=F.lb;
  const build=mix(base,ip,.5,13); build[0]=[50,95];
  const prog=mix(base,ip,.85,5); prog[0]=[50,90];
  const fin=ip.map(p=>[p[0],p[1]]); fin[0]=[50,84];
  const bH=arg(build,p=>p[0],p=>p[1]>=68)??arg(build,p=>-p[1]);
  const pH=arg(prog,p=>dist(p,[46,52]),(p,i)=>i!==bH);
  const wH=arg(fin,p=>p[0],p=>p[1]<45);
  const adv=outf.filter(i=>i!==wH).sort((a,b)=>(fin[a][1]-fin[b][1])||(Math.abs(fin[a][0]-50)-Math.abs(fin[b][0]-50)));
  const fH=adv[0], f2=adv[1];
  const f3=outf.filter(i=>![wH,fH,f2].includes(i)).sort((a,b)=>dist(fin[a],[50,30])-dist(fin[b],[50,30]))[0];
  const cross=fin.map(p=>[...p]); cross[wH]=[7,10]; cross[fH]=[43,7]; cross[f2]=[60,9]; cross[f3]=[50,22];
  const lost=[26,26];
  const cp=cross.map((p,i)=>i?[p[0],cl(p[1]+6,4,92)]:[50,82]);
  outf.slice().sort((a,b)=>dist(cross[a],lost)-dist(cross[b],lost)).slice(0,3).forEach((i,k)=>{const o=[[-5,-1],[4,-2],[1,5]][k]; cp[i]=[lost[0]+o[0],lost[1]+o[1]]});
  const pb=[36,9];
  const press=base.map((p,i)=>i?[cl(p[0]+(pb[0]-p[0])*.12,4,96),cl(p[1]-24,6,92)]:[50,72]);
  const pr=arg(press,p=>p[1]); press[pr]=[40,14];
  const ob=[80,46], msh=x=>50+(x-50)*.82+(ob[0]-50)*.22;
  const mid=base.map((p,i)=>i?[cl(msh(p[0]),4,96),p[1]]:[54,94]);
  const mp=arg(mid,p=>dist(p,ob)); mid[mp]=[ob[0]-3,ob[1]+4];
  const zones=(F.wz||[]).map(([x,y,w,h,t])=>[msh(x+w/2)-w*.41,y,w*.82,h,t]);
  const ol=[18,70];
  const low=lb.map((p,i)=>i?[cl(50+(p[0]-50)*.86+(ol[0]-50)*.2,4,96),p[1]]:[46,96]);
  const lp=arg(low,p=>dist(p,ol)); low[lp]=[ol[0]+3,ol[1]+4];
  const nOnLast=ip.filter((p,i)=>i&&p[1]<=26).length;
  const e={}; F.r.forEach((r,i)=>e[ids[i]]=[base[i][0],base[i][1],r]); e.o=[null,null,'','o'];
  const R=i=>F.r[i];
  const f=[
    {h:'Shape',c:cap.shape||`${F.name} ${F.v}: ${F.desc.split('. ')[0]}.`},
    {h:'Build-up',m:sh(build),c:cap.build||`Build-up: the keeper has it. Centre-backs split to the edges of the box and the team stretches toward its ${F.ipN} attacking shape.`},
    {h:'Build-up',b:ids[bH],c:`The ${R(bH)} receives from the keeper with time to look up. First option: break a line with a pass into midfield.`},
    {h:'Progression',m:sh(prog),b:ids[pH],c:cap.prog||`Progression: the ${R(pH)} receives between the opposition’s lines and turns. The full team steps up behind the ball.`},
    {h:'Final third',m:sh(fin),b:ids[wH],c:cap.final||`Final third: the ${F.ipN} shape puts ${nOnLast} players on the last line. Ball goes wide to the ${R(wH)} to isolate the full-back.`},
    {h:'Final third',m:sh(cross),c:`The ${R(wH)} attacks the byline. Runners fill the box: ${R(fH)} near post, ${R(f2)} far post, ${R(f3)} arrives for the cut-back.`},
    {h:'Final third',b:ids[fH],c:`Low cross to the near post. Timing beats pace: arrive as the ball arrives, not before.`},
    {h:'Counter-press',m:{...sh(cp),o:lost},b:'o',c:'Ball lost: the three nearest players hunt it immediately for five seconds while the rest drop to protect against the counter.'},
    {h:'High press',m:{...sh(press),o:pb},c:cap.press||`High press: the whole team pushes 20+ metres up. The ${R(pr)} presses the centre-back with a curved run; the line behind locks the short passes.`},
    {h:'Mid block',m:{...sh(mid),o:ob},z:zones,c:cap.mid||`Mid block: compact and shifted toward the ball. Red zones show this system’s weak spot when it defends in a ${F.lbN}-style block.`},
    {h:'Low block',m:{...sh(low),o:ol},c:cap.low||`Low block: drops into a ${F.lbN}. Protect the box, keep under 35 m from front to back, and send the nearest player to the ball.`},
    {h:'Regain',m:{o:null},b:ids[lp],c:`Ball won by the ${R(lp)}. First look forward: is there a counter-attack on?`},
    {h:'Reset',m:sh(base),c:`Back into the ${F.name} shape. Tap any player to study that position.`}
  ];
  return {title:`${F.name} · ${F.v}`,tag:`${F.name} ${F.v}`,view:'full',e,b:'p0',f,parts:{base,build,prog,fin,cross,cp,press,mid,low,bH,pH,wH,fH,f2,f3,lp,pr,mp,zones,lost,pb,ob,ol,nOnLast,ids}};
}
