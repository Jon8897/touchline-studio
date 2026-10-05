/* ===== Full-team context: every other player positions with the ball ===== */
const CTX_SHAPES=(()=>{
  const L=(a,b,t)=>a+(b-a)*t;
  const F433=FORMATIONS[0], F442=FORMATIONS.find(f=>f.id==='442');
  const ourAtt=F433.b.map((p,i)=>[L(p[0],F433.ip[i][0],.45),L(p[1],F433.ip[i][1],.45)]);
  const ourDef=F433.b.map((p,i)=>[L(p[0],F433.lb[i][0],.4),L(p[1],F433.lb[i][1],.4)]);
  const mir=a=>a.map(p=>[100-p[0],100-p[1]]);
  return {ourAtt,ourDef,oppAtt:mir(ourAtt),oppDef:mir(F442.b),ourR:F433.r,oppR:F442.r,oppAttR:F433.r};
})();
const isPlayerKind=k=>k==='t'||k==='h'||k==='o'||k==='k';
function sceneStates(sc){
  const kind=id=>sc.e[id][3]||(id==='h'?'h':'t');
  const pos={}; for(const id in sc.e) pos[id]=sc.e[id][0]==null?null:[sc.e[id][0],sc.e[id][1]];
  const S=[{pos,ball:sc.b===undefined?null:sc.b}];
  for(const f of sc.f){const p=S[S.length-1], n={pos:{...p.pos},ball:p.ball}; if(f.m) for(const k in f.m) n.pos[k]=f.m[k]; if('b' in f) n.ball=f.b; S.push(n)}
  return {S,kind};
}
function ballXY(st){const b=st.ball; if(b==null) return null; if(typeof b==='string') return st.pos[b]||null; return b}
/* Add the missing players of both teams and move them with the ball every step */
function withContext(sc,o={}){
  const ours=o.ours!==false, opp=o.opp!==false;
  sc={...sc,e:{...sc.e},f:sc.f.map(f=>({...f,m:{...(f.m||{})}}))};
  const {S,kind}=sceneStates(sc);
  const ids=Object.keys(sc.e);
  const expl=side=>ids.filter(id=>{const k=kind(id); return side==='o'?k==='o':(k==='t'||k==='h')});
  let poss=sc.t==='d'?'o':'u';
  const possAt=st=>{const b=st.ball; if(typeof b==='string') return kind(b)==='o'?'o':'u'; return null};
  const ctx=[];
  const add=(side,count)=>{
    const shape=side==='u'?CTX_SHAPES.ourAtt:CTX_SHAPES.oppDef, R=side==='u'?CTX_SHAPES.ourR:CTX_SHAPES.oppR;
    let slots=[...Array(11).keys()];
    const ex=expl(side);
    // remove the slot nearest to each explicit player
    ex.forEach(id=>{const p=S[0].pos[id]||S.find(s=>s.pos[id])?.pos[id]; if(!p||!slots.length) {slots.pop(); return}
      const lab=String(sc.e[id][2]||'').toUpperCase();
      let best=slots.find(i=>lab==='GK'&&i===0); if(best===undefined) best=slots.filter(i=>i!==0||lab==='GK').sort((a,b)=>Math.hypot(shape[a][0]-p[0],shape[a][1]-p[1])-Math.hypot(shape[b][0]-p[0],shape[b][1]-p[1]))[0];
      slots=slots.filter(i=>i!==best)});
    slots.slice(0,Math.max(0,count??slots.length)).forEach(i=>{const id=(side==='u'?'cu':'co')+i; ctx.push({id,side,i}); sc.e[id]=[null,null,side==='o'&&i===0?'GK':(side==='u'?R[i]:''),side==='o'?'o':'t']});
  };
  if(ours) add('u'); if(opp) add('o',o.oppCount);
  if(!ctx.length) return sc;
  const target=(c,b,possSide)=>{
    const att=possSide===c.side;
    const sh=c.side==='u'?(att?CTX_SHAPES.ourAtt:CTX_SHAPES.ourDef):(att?CTX_SHAPES.oppAtt:CTX_SHAPES.oppDef);
    const p=sh[c.i], gk=c.i===0, kx=gk?.08:.32, ky=gk?.05:.5;
    let x=p[0]+kx*(b[0]-50), y=p[1]+ky*(b[1]-50);
    if(gk) y=c.side==='u'?Math.max(84,Math.min(97,y)):Math.min(16,Math.max(3,y));
    return [x,y];
  };
  const sep=(p,st,self)=>{let [x,y]=p; for(let pass=0;pass<2;pass++) for(const id in st.pos){if(id===self) continue; const q=st.pos[id]; if(!q) continue; const k=kind(id); if(!isPlayerKind(k)) continue; const ex=(x-q[0])*.68, ey=(y-q[1])*1.05, d=Math.hypot(ex,ey); if(d<6.2){const ux=d<.01?1:ex/d, uy=d<.01?0:ey/d, push=6.2-d; x+=ux*push/.68; y+=uy*push/1.05}} return [Math.max(2,Math.min(98,Math.round(x*10)/10)),Math.max(2,Math.min(98,Math.round(y*10)/10))]};
  // initial positions
  let b0=ballXY(S[0])||ballXY(S[1]||S[0])||[50,50]; const p0=possAt(S[0]); if(p0) poss=p0;
  const cur={...S[0].pos};
  ctx.forEach(c=>{const p=sep(target(c,b0,poss),{pos:cur},c.id); sc.e[c.id][0]=p[0]; sc.e[c.id][1]=p[1]; cur[c.id]=p});
  // every step
  sc.f.forEach((f,k)=>{
    const st=S[k+1], b=ballXY(st)||b0; const ps=possAt(st); if(ps) poss=ps; b0=b;
    const live={...st.pos}; ctx.forEach(c=>live[c.id]=cur[c.id]);
    ctx.forEach(c=>{const p=sep(target(c,b,poss),{pos:live},c.id); f.m[c.id]=p; live[c.id]=p; cur[c.id]=p});
  });
  sc.ctx=ctx.map(c=>c.id);
  return sc;
}
/* For coach plays: players not told to move drift with the ball as a team */
function autoShift(sc){
  sc={...sc,f:sc.f.map(f=>({...f,m:{...(f.m||{})}}))};
  const {S,kind}=sceneStates(sc);
  const anchor={}; const b0=ballXY(S[0])||[50,50];
  for(const id in sc.e){const k=kind(id); if(!isPlayerKind(k)||!S[0].pos[id]) continue; anchor[id]={p:S[0].pos[id],b:b0}}
  let lastB=b0;
  sc.f.forEach((f,k)=>{
    const st=S[k+1]; const b=ballXY(st)||lastB; lastB=b;
    for(const id in anchor){
      if(f.m[id]){anchor[id]={p:f.m[id],b}; continue}
      if(typeof st.ball==='string'&&st.ball===id) continue;
      const a=anchor[id], gk=String(sc.e[id][2]||'').toUpperCase()==='GK';
      const kx=gk?.08:.3, ky=gk?.05:.45;
      let x=a.p[0]+kx*(b[0]-a.b[0]), y=a.p[1]+ky*(b[1]-a.b[1]);
      const prev=S[k].pos[id]; if(prev&&Math.hypot(x-prev[0],y-prev[1])<1.2) continue;
      f.m[id]=[Math.max(2,Math.min(98,Math.round(x*10)/10)),Math.max(2,Math.min(98,Math.round(y*10)/10))];
      // keep later states consistent
      for(let j=k+1;j<S.length;j++){ if(sc.f[j-1]&&sc.f[j-1].m&&sc.f[j-1].m[id]&&j-1!==k) break; S[j].pos[id]=f.m[id] }
    }
  });
  return sc;
}

/* Zoom a drill onto the space it uses */
function fitRange(sc){
  const {S}=sceneStates(sc); let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  const add=(x,y)=>{x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)};
  S.forEach(st=>{for(const id in st.pos){const q=st.pos[id]; if(q) add(q[0],q[1])} const b=st.ball; if(Array.isArray(b)) add(b[0],b[1])});
  (sc.grid||[]).forEach(([x,y,w,h])=>{add(x,y);add(x+w,y+h)});
  if(x0>x1){return [-3,-3,103,103]}
  x0-=9;x1+=9;y0-=8;y1+=8;
  let w=x1-x0,h=y1-y0; if(w<46){const d=(46-w)/2;x0-=d;x1+=d} if(h<34){const d=(34-h)/2;y0-=d;y1+=d}
  // keep the box between 0.8 and 1.5 wide:tall in metres
  w=(x1-x0)*.68; h=(y1-y0)*1.05;
  if(w/h>1.5){const nh=w/1.5/1.05, d=(nh-(y1-y0))/2; y0-=d;y1+=d}
  if(w/h<.8){const nw=h*.8/.68, d=(nw-(x1-x0))/2; x0-=d;x1+=d}
  const sh=(a,b,lo,hi)=>{if(b-a>hi-lo) return [lo,hi]; if(a<lo) return [lo,lo+(b-a)]; if(b>hi) return [hi-(b-a),hi]; return [a,b]};
  [x0,x1]=sh(x0,x1,-4,104); [y0,y1]=sh(y0,y1,-4,104);
  return [x0,y0,x1,y1];
}
