/* ===== Pitch animation engine ===== */
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const NS='http://www.w3.org/2000/svg';
const PW=68, PL=105;
const VIEWS={full:[0,100],att:[0,58],def:[44,100],mid:[16,84]};
const mx=x=>x*PW/100, my=y=>y*PL/100;
const ease=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
const RM=matchMedia('(prefers-reduced-motion: reduce)').matches;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function sv(tag,a,p){const e=document.createElementNS(NS,tag);if(a)for(const k in a)e.setAttribute(k,a[k]);if(p)p.appendChild(e);return e}
const ICON={
  play:'<svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>',
  pause:'<svg viewBox="0 0 24 24"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  prev:'<svg viewBox="0 0 24 24"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
  next:'<svg viewBox="0 0 24 24"><path d="M16 5h2v14h-2zM4 5v14l11-7z"/></svg>',
  restart:'<svg viewBox="0 0 24 24"><path d="M12 5V2L7 6l5 4V7a5 5 0 1 1-5 5H5a7 7 0 1 0 7-7z"/></svg>',
  timer:'<svg viewBox="0 0 24 24"><path d="M9 1h6v2H9zm3 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16zm-1 3v6l5 3 1-1.7-4-2.3V8z"/></svg>'
};

function drawPitch(g){
  sv('rect',{x:-8,y:-8,width:PW+16,height:PL+16,class:'pg'},g);
  for(let i=0;i<12;i++) if(i%2) sv('rect',{x:0,y:i*PL/12,width:PW,height:PL/12,class:'ps'},g);
  const L={class:'ln'};
  sv('rect',{x:0,y:0,width:PW,height:PL,...L},g);
  sv('line',{x1:0,y1:PL/2,x2:PW,y2:PL/2,...L},g);
  sv('circle',{cx:PW/2,cy:PL/2,r:9.15,...L},g);
  sv('circle',{cx:PW/2,cy:PL/2,r:.4,class:'lnd'},g);
  for(const top of [true,false]){
    const y=top?0:PL, s=top?1:-1;
    const box=(w,d)=>sv('rect',{x:(PW-w)/2,y:top?0:PL-d,width:w,height:d,...L},g);
    box(40.32,16.5); box(18.32,5.5);
    sv('circle',{cx:PW/2,cy:y+s*11,r:.35,class:'lnd'},g);
    const ay=y+s*16.5;
    sv('path',{d:`M${PW/2-7.31} ${ay} A9.15 9.15 0 0 ${top?0:1} ${PW/2+7.31} ${ay}`,...L},g);
    sv('rect',{x:PW/2-3.66,y:top?-1.8:PL,width:7.32,height:1.8,class:'goal'},g);
  }
  for(const [cx,cy,a,b] of [[0,0,'1 0','0 1'],[PW,0,'-1 0','0 1'],[0,PL,'1 0','0 -1'],[PW,PL,'-1 0','0 -1']]){
    const [ax,ay]=a.split(' ').map(Number),[bx,by]=b.split(' ').map(Number);
    const sw=(cx===0)===(cy===0)?1:0;
    sv('path',{d:`M${cx+ax} ${cy+ay} A1 1 0 0 ${sw} ${cx+bx} ${cy+by}`,...L},g);
  }
}

let UID=0;
class Board{
  constructor(host,o={}){
    this.o=o; this.uid=++UID; this.speed=1; this.playing=false; this.raf=0;
    host.classList.add('board');
    host.innerHTML=`<div class="stage${o.three?' is3d':''}"><div class="stage-tag"><span class="t"></span><span class="ph"></span></div><div class="tilt"><svg class="pitch${o.onTok?' clickable':''}" role="img" aria-label="Animated tactics board"></svg></div></div>
<div class="cap"><div class="cap-top"><span class="cap-h"></span><span class="cap-n mono"></span></div><p class="cap-t"></p></div>
<div class="ctrl"><button class="ib" data-a="restart" aria-label="Restart">${ICON.restart}</button><button class="ib" data-a="prev" aria-label="Previous step">${ICON.prev}</button><button class="ib play" data-a="play" aria-label="Play or pause">${ICON.pause}</button><button class="ib" data-a="next" aria-label="Next step">${ICON.next}</button><div class="pips"></div><button class="chip sm" data-a="speed" aria-label="Playback speed">1×</button><button class="chip sm" data-a="three" aria-pressed="${!!o.three}">3D</button></div>
<div class="legend"><span><i class="lg-u"></i>Your team</span>${o.hero?'<span><i class="lg-h"></i>You</span>':''}<span><i class="lg-o"></i>Opponent</span><span><i class="lg-r"></i>Run</span><span><i class="lg-p"></i>Pass / ball</span></div>`;
    this.h=host; this.stage=$('.stage',host); this.svg=$('svg',host);
    const d=sv('defs',{},this.svg), u=this.uid;
    const grad=(id,c)=>{const gr=sv('radialGradient',{id:id+u,cx:'35%',cy:'30%',r:'75%'},d);c.forEach(([o,col])=>sv('stop',{offset:o,'stop-color':col},gr))};
    grad('gold',[['0','#fbe3a0'],['.55','#e7b53c'],['1','#946609']]);
    grad('grey',[['0','#e9eef0'],['.6','#a4adb2'],['1','#5d666b']]);
    grad('dark',[['0','#4a5753'],['1','#151c1a']]);
    for(const [k,c] of [['run','#40d6a5'],['hero','#ec5157'],['opp','#a4adb2'],['pass','#f8d888']]){
      const m=sv('marker',{id:'m'+k+u,viewBox:'0 0 10 10',refX:'7',refY:'5',markerUnits:'userSpaceOnUse',markerWidth:'2.4',markerHeight:'2.4',orient:'auto'},d);
      sv('path',{d:'M0 0L10 5L0 10z',fill:c},m);
    }
    this.gP=sv('g',{},this.svg); drawPitch(this.gP);
    this.lGrid=sv('g',{},this.svg); this.lZone=sv('g',{},this.svg); this.lArr=sv('g',{},this.svg); this.lTok=sv('g',{},this.svg);
    this.ball=sv('g',{class:'ball'},this.svg); sv('circle',{r:.95},this.ball);
    host.addEventListener('click',e=>{const b=e.target.closest('[data-a]'); if(b) this.act(b.dataset.a,b)});
    if(o.onTok) this.lTok.addEventListener('click',e=>{const g=e.target.closest('.tok'); if(g&&!this.dragged) o.onTok(g.dataset.id,g.dataset.k)});
    if(o.onDrag){
      const pt=e=>{const m=this.svg.getScreenCTM(); if(!m) return null; const q=new DOMPoint(e.clientX,e.clientY).matrixTransform(m.inverse()); return [Math.max(0,Math.min(100,q.x/PW*100)),Math.max(0,Math.min(100,q.y/PL*100))]};
      this.lTok.addEventListener('pointerdown',e=>{
        if(!this.editing||this.ballMode) return; const g=e.target.closest('.tok'); if(!g||'cgp'.includes(g.dataset.k)&&false) return;
        e.preventDefault(); this.stop(); this.drag={g,id:g.dataset.id,p:null}; this.dragged=false; g.classList.add('drag'); try{g.setPointerCapture(e.pointerId)}catch(_){}
      });
      this.lTok.addEventListener('pointermove',e=>{if(!this.drag) return; const p=pt(e); if(!p) return; this.drag.p=p; this.dragged=true; this.drag.g.setAttribute('transform',`translate(${mx(p[0])} ${my(p[1])})`)});
      const end=()=>{if(!this.drag) return; const d=this.drag; this.drag=null; d.g.classList.remove('drag'); if(d.p) o.onDrag(d.id,[Math.round(d.p[0]*10)/10,Math.round(d.p[1]*10)/10]); setTimeout(()=>this.dragged=false,0)};
      this.lTok.addEventListener('pointerup',end); this.lTok.addEventListener('pointercancel',end);
    }
  }
  mkTok(id,s){
    const [,,label='',kind]=s, k=kind||(id==='h'?'h':'t'), u=this.uid;
    const g=sv('g',{class:'tok k-'+k,'data-id':id,'data-k':k},this.lTok);
    if(k==='c') sv('path',{d:'M0 -1.15L1.05 .85H-1.05z',class:'cone'},g);
    else if(k==='g') sv('rect',{x:-2.4,y:-.75,width:4.8,height:1.5,rx:.2,class:'mgoal'},g);
    else if(k==='p') sv('rect',{x:-.75,y:-1.7,width:1.5,height:3.4,rx:.7,class:'pole'},g);
    else{
      if(k==='h'){sv('circle',{r:3.6,class:'halo'},g);sv('circle',{r:3.25,class:'ring'},g)}
      sv('circle',{r:2.6,fill:`url(#${k==='o'?'grey':k==='k'?'dark':'gold'}${u})`},g);
      sv('circle',{r:2.6,class:'rim'},g);
      const t=sv('text',{y:label.length>2?.56:.72,class:'lbl'+(label.length>2?' sm':'')},g); t.textContent=label;
      const ti=sv('title',{},g); ti.textContent=label;
    }
    return g;
  }
  zone(layer,r,cls){
    const [x,y,w,h,label,col]=r;
    sv('rect',{x:mx(x),y:my(y),width:mx(w),height:my(h),rx:.8,class:cls+(col?' '+col:'')},layer);
    if(label){const t=sv('text',{x:mx(x+w/2),y:cls==='grid'?my(y)-.7:my(y)+my(h)/2+.9,class:cls+'-t'+(col?' '+col:'')},layer); t.textContent=label}
  }
  setEditing(on){this.editing=on; this.svg.classList.toggle('editing',on); if(on){this.stage.classList.remove('is3d'); const t=$('[data-a="three"]',this.h); if(t) t.setAttribute('aria-pressed','false')}}
  setBallMode(on){this.ballMode=on; this.svg.classList.toggle('ballmode',on)}
  load(sc,auto=true,start=0){
    this.stop(); this.sc=sc;
    if(sc.fit&&typeof fitRange==='function'){const [x0,y0,x1,y1]=fitRange(sc); this.svg.setAttribute('viewBox',`${mx(x0)} ${my(y0)} ${mx(x1-x0)} ${my(y1-y0)}`)}
    else{const [a,b]=VIEWS[sc.view||'full'], p=3; this.svg.setAttribute('viewBox',`${-p} ${my(a)-p} ${PW+2*p} ${my(b)-my(a)+2*p}`)}
    {const vb=this.svg.viewBox.baseVal; if(vb&&vb.height) this.stage.style.setProperty('--ar',(vb.width/vb.height).toFixed(3))}
    $('.stage-tag .t',this.h).textContent=sc.tag||sc.title||'';
    this.lTok.innerHTML=''; this.lGrid.innerHTML=''; this.toks={}; this.kind={};
    (sc.grid||[]).forEach(r=>this.zone(this.lGrid,r,'grid'));
    const pos={};
    for(const id in sc.e){const s=sc.e[id]; pos[id]=s[0]==null?null:[s[0],s[1]]; this.kind[id]=s[3]||(id==='h'?'h':'t'); this.toks[id]=this.mkTok(id,s)}
    // keep hero on top
    this.ctx=new Set(sc.ctx||[]); this.ctx.forEach(id=>this.toks[id]&&this.toks[id].classList.add('ctx'));
    if(this.toks.h) this.lTok.appendChild(this.toks.h);
    const S=[{pos,ball:sc.b===undefined?null:sc.b}];
    for(const f of sc.f){const pr=S[S.length-1], n={pos:{...pr.pos},ball:pr.ball}; if(f.m) for(const id in f.m) n.pos[id]=f.m[id]; if('b' in f) n.ball=f.b; S.push(n)}
    this.S=S; this.n=sc.f.length;
    const pips=$('.pips',this.h); pips.innerHTML=sc.f.map((f,i)=>`<button aria-label="Step ${i+1}${f.h?': '+esc(f.h):''}" data-i="${i}"></button>`).join('');
    pips.onclick=e=>{const b=e.target.closest('button'); if(b) this.begin(+b.dataset.i)};
    this.playing=auto&&!RM; this.icon();
    this.begin(start);
  }
  ballAt(st,P){
    const b=st.ball; if(b==null) return null;
    if(typeof b==='string'){const q=P[b]; if(!q) return null; const o=this.kind[b]==='o'?[1.5,1.8]:[1.5,-1.8]; return [mx(q[0])+o[0],my(q[1])+o[1]]}
    return [mx(b[0]),my(b[1])];
  }
  render(i,t){
    const A=this.S[i], B=this.S[i+1], e=ease(t), P={};
    for(const id in this.toks){
      const pa=A.pos[id], pb=B.pos[id], g=this.toks[id]; let x,y,op=1;
      if(pa&&pb){x=pa[0]+(pb[0]-pa[0])*e; y=pa[1]+(pb[1]-pa[1])*e}
      else if(pb){[x,y]=pb; op=e} else if(pa){[x,y]=pa; op=1-e} else {g.style.opacity=0; continue}
      P[id]=[x,y]; g.setAttribute('transform',`translate(${mx(x).toFixed(2)} ${my(y).toFixed(2)})`); g.style.opacity=op;
    }
    let bp;
    if(typeof A.ball==='string'&&A.ball===B.ball) bp=this.ballAt(B,P);
    else{const a=this.ballAt(A,A.pos), b=this.ballAt(B,B.pos), tb=ease(Math.max(0,Math.min(1,(t-.1)/.9)));
      bp=a&&b?[a[0]+(b[0]-a[0])*tb,a[1]+(b[1]-a[1])*tb]:(t<.5?a:b)}
    if(bp){this.ball.style.opacity=1; this.ball.setAttribute('transform',`translate(${bp[0].toFixed(2)} ${bp[1].toFixed(2)})`)} else this.ball.style.opacity=0;
  }
  arrow(a,b,cls,s0,s1){
    const dx=b[0]-a[0], dy=b[1]-a[1], L=Math.hypot(dx,dy); if(L<s0+s1+1) return;
    const ux=dx/L, uy=dy/L, A=[a[0]+ux*s0,a[1]+uy*s0], B=[b[0]-ux*s1,b[1]-uy*s1];
    let d;
    if(cls==='pass') d=`M${A[0]} ${A[1]}L${B[0]} ${B[1]}`;
    else{const bend=Math.min(3.5,L*.12), cx=(A[0]+B[0])/2-uy*bend, cy=(A[1]+B[1])/2+ux*bend; d=`M${A[0]} ${A[1]}Q${cx} ${cy} ${B[0]} ${B[1]}`}
    sv('path',{d,class:'arr a-'+cls,'marker-end':`url(#m${cls}${this.uid})`},this.lArr);
  }
  decorate(i){
    this.lArr.innerHTML=''; this.lZone.innerHTML='';
    const A=this.S[i], B=this.S[i+1], f=this.sc.f[i];
    (f.z||[]).forEach(r=>this.zone(this.lZone,r,'zone'));
    for(const id in this.toks){
      const k=this.kind[id]; if('cgp'.includes(k)||this.ctx.has(id)) continue;
      const a=A.pos[id], b=B.pos[id]; if(!a||!b) continue;
      if(Math.hypot(mx(b[0]-a[0]),my(b[1]-a[1]))<2.2) continue;
      this.arrow([mx(a[0]),my(a[1])],[mx(b[0]),my(b[1])],k==='o'?'opp':k==='h'?'hero':'run',2.8,3.1);
    }
    if(!(typeof A.ball==='string'&&A.ball===B.ball)){const a=this.ballAt(A,A.pos), b=this.ballAt(B,B.pos); if(a&&b) this.arrow(a,b,'pass',1.1,1.3)}
  }
  begin(i){
    i=Math.max(0,Math.min(this.n-1,i)); this.i=i;
    const f=this.sc.f[i];
    $('.cap-t',this.h).textContent=f.c||''; $('.cap-h',this.h).textContent=f.h||this.sc.title||'';
    $('.cap-n',this.h).textContent=`${i+1} / ${this.n}`; $('.stage-tag .ph',this.h).textContent=f.h||'';
    $$('.pips button',this.h).forEach((b,k)=>{b.className=k<i?'done':k===i?'cur':''});
    this.decorate(i);
    this.dur=(f.d||1400); this.hold=Math.min(5600,Math.max(2300,1300+(f.c||'').length*32))+(i===this.n-1?900:0);
    this.el=0;
    if(this.playing){this.phase='move'; this.render(i,0); this.loop()}
    else{this.phase='hold'; this.render(i,1)}
    if(this.o.onStep) this.o.onStep(i);
  }
  loop(){
    cancelAnimationFrame(this.raf); this.last=performance.now();
    const tick=now=>{
      if(!this.playing) return;
      const dt=Math.min(64,now-this.last)*this.speed; this.last=now; this.el+=dt;
      if(this.phase==='move'){const t=Math.min(1,this.el/this.dur); this.render(this.i,t); if(t>=1){this.phase='hold'; this.el=0}}
      else if(this.el>=this.hold){ this.begin(this.i<this.n-1?this.i+1:0); return }
      this.raf=requestAnimationFrame(tick);
    };
    this.raf=requestAnimationFrame(tick);
  }
  icon(){const b=$('[data-a="play"]',this.h); b.innerHTML=this.playing?ICON.pause:ICON.play}
  play(){if(this.playing||!this.sc) return; this.playing=true; this.icon(); if(this.phase==='hold'&&this.el===0&&this.i===this.n-1){this.begin(0);return} this.loop()}
  stop(){this.playing=false; cancelAnimationFrame(this.raf); if(this.sc) this.icon()}
  act(a,b){
    if(a==='play'){this.playing?this.stop():this.play()}
    else if(a==='prev') this.begin(this.i-1);
    else if(a==='next') this.begin(this.i+1);
    else if(a==='restart'){this.playing=true; this.icon(); this.begin(0)}
    else if(a==='speed'){const s=[1,1.5,.5]; this.speed=s[(s.indexOf(this.speed)+1)%3]; b.textContent=this.speed+'×'}
    else if(a==='three'){if(this.editing) return; const on=!this.stage.classList.contains('is3d'); this.stage.classList.toggle('is3d',on); b.setAttribute('aria-pressed',on)}
  }
}
