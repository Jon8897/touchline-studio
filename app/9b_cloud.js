/* ===== Cloud mode: active when the page is served by the Touchline server ===== */
const SRV={on:false,user:null,teams:[],tid:null,weeks:[],limit:3};
const SYNC_KEYS=['mydrills','plays','sessions'];
const pend={};
async function api(method,url,body){
  const r=await fetch(url,{method,credentials:'same-origin',headers:{'Content-Type':'application/json','X-TLS':'1'},body:body?JSON.stringify(body):undefined});
  let j={}; try{j=await r.json()}catch(e){}
  if(!r.ok){const e=new Error(j.error||'Something went wrong. Try again.'); e.status=r.status; e.data=j; e.code=j.code;
    if(r.status===403&&['team_limit','week_limit','plan_required'].includes(j.code)) setTimeout(()=>window.dispatchEvent(new CustomEvent('tls:limit',{detail:j})),0);
    throw e}
  return j;
}
function cacheSet(k,v){try{localStorage.setItem('tls:'+k,JSON.stringify(v))}catch(e){}}
function setSync(s,msg){const el=$('#syncDot'); if(el){el.dataset.s=s; el.title=s==='saved'?'All changes saved':s==='saving'?'Saving…':msg||'Not saved'} if(s==='error'&&msg) toast(msg)}
function queueSync(key,fn,delay=700){
  clearTimeout(pend[key]); setSync('saving');
  pend[key]=setTimeout(async()=>{
    try{await fn(); delete pend[key]; if(!Object.keys(pend).length) setSync('saved')}
    catch(e){if(e.status===401){delete pend[key]; setSync('error','You’ve been logged out. Log in again to keep saving.'); return}
      setSync('error','Couldn’t save just now. Retrying…'); pend[key]=setTimeout(()=>queueSync(key,fn,0),5000)}
  },delay);
}
function syncHook(k,v){
  if(!SRV.on) return;
  if(SYNC_KEYS.includes(k)) queueSync(k,()=>api('PUT','/api/store/'+k,{value:Array.isArray(v)?v:[]}));
  else if(k==='weekdraft'&&SRV.tid&&v){const tid=SRV.tid; queueSync('wd:'+tid,()=>api('PUT',`/api/teams/${tid}/draft`,{value:v}))}
}
addEventListener('beforeunload',e=>{if(SRV.on&&Object.keys(pend).length){e.preventDefault(); e.returnValue=''}});
const curTeam=()=>SRV.teams.find(t=>t.id===SRV.tid)||null;
const activeTeams=()=>SRV.teams.filter(t=>!t.archived);
async function loadTeamData(tid){
  const [d,w,m]=await Promise.all([api('GET',`/api/teams/${tid}/draft`),api('GET',`/api/teams/${tid}/weeks`),api('GET',`/api/teams/${tid}/members`).catch(()=>null)]);
  cacheSet('weekdraft',d.value||null); SRV.weeks=w.weeks||[]; SRV.members=m; try{localStorage.setItem('tls:tid',JSON.stringify(tid))}catch(e){}
}
async function refreshTeams(){const r=await api('GET','/api/teams'); SRV.teams=r.teams; SRV.limit=r.limit}
async function refreshMembers(){if(!SRV.tid) return; SRV.members=await api('GET',`/api/teams/${SRV.tid}/members`).catch(()=>null)}
async function refreshWeeks(){if(!SRV.tid) return; const w=await api('GET',`/api/teams/${SRV.tid}/weeks`); SRV.weeks=w.weeks||[]}
async function setTeam(tid){
  if(!tid){SRV.tid=null; cacheSet('weekdraft',null); updateTeamBtn(); renderWeek(); return}
  SRV.tid=tid; await loadTeamData(tid); updateTeamBtn(); renderWeek();
}
function updateTeamBtn(){const b=$('#teamBtn span'); if(!b) return; const t=curTeam(); b.textContent=SRV.on?(t?t.name:'My team'):'Team week'}

/* ---------- login / sign up ---------- */
function showAuth(cfg={},ctx={}){
  document.body.classList.add('authmode');
  const el=document.createElement('div'); el.className='auth'; el.id='auth';
  el.innerHTML=`<div class="authbox">
    <div class="brand" style="margin-bottom:18px"><svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="18" fill="none" stroke="#e7b53c" stroke-width="2"/><circle cx="20" cy="20" r="6" fill="none" stroke="#e7b53c" stroke-width="2"/><path d="M20 2v36" stroke="#e7b53c" stroke-width="2"/><circle cx="29" cy="13" r="3.2" fill="#ec5157"/></svg><span><b>TOUCHLINE</b><i>STUDIO</i></span></div>
    <h1 class="authh">Coach log in</h1>
    <p class="muted" id="authLede">Plan tactics, build sessions and send your players the week’s plan.</p>
    <div class="invbanner" id="auInvite" hidden></div>
    <div class="seg two" role="tablist"><button role="tab" data-at="login" aria-pressed="true">Log in</button><button role="tab" data-at="signup" aria-pressed="false">Create account</button></div>
    <form id="authForm" novalidate>
      <div class="su" hidden><label class="fl" for="auName">Your name</label><input id="auName" class="inp" autocomplete="name" maxlength="60"></div>
      <div class="em"><label class="fl" for="auEmail">Email</label><input id="auEmail" class="inp" type="email" autocomplete="email" maxlength="200" required></div>
      <div class="pw"><label class="fl" for="auPw">Password</label><input id="auPw" class="inp" type="password" autocomplete="current-password" minlength="8" required></div>
      <div class="pw2" hidden><label class="fl" for="auPw2">Repeat new password</label><input id="auPw2" class="inp" type="password" autocomplete="new-password" minlength="8"></div>
      <div class="su" hidden><label class="fl" for="auTeam">First team name</label><input id="auTeam" class="inp" maxlength="60" placeholder="e.g. Riverside FC U18"></div>
      ${cfg.signupCodeRequired&&!ctx.invite?`<div class="su" hidden><label class="fl" for="auCode">Invite code</label><input id="auCode" class="inp" autocomplete="off" maxlength="60"><p class="hint">Touchline Studio is invite-only while we test it.</p></div>`:''}
      <div class="su" hidden><label class="check agree"><input type="checkbox" id="auAgree"><span>I’m 18 or over and I agree to the <a href="/terms" target="_blank" rel="noopener">Terms and conditions</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy policy</a>.</span></label></div>
      <div class="rem"><label class="check"><input type="checkbox" id="auRemember"><span>Keep me logged in on this device for 30 days</span></label><p class="hint">Leave this unticked on a shared computer. You’ll be logged out after 12 hours without using Touchline, or when you close the browser.</p></div>
      <button class="btn authgo" id="auGo" type="submit">Log in</button>
      <p class="status" id="auMsg" aria-live="polite"></p>
    </form>
    <p class="hint" id="auForgotRow"><button class="link" id="auForgot" type="button">Forgot your password?</button></p>
    <p class="hint authback"><a href="/">← Back to the website</a> · <a href="/demo">Try the demo</a></p>
  </div>`;
  document.body.appendChild(el);
  let mode='login';
  const T={login:['Coach log in','Log in'],signup:['Create your account','Create account'],forgot:['Reset your password','Email me a reset link'],reset:['Choose a new password','Save new password']};
  const setMode=m=>{mode=m; const tabs=m==='login'||m==='signup';
    $('.seg.two',el).hidden=!tabs; $$('[data-at]',el).forEach(b=>b.setAttribute('aria-pressed',b.dataset.at===m)); $$('.su',el).forEach(x=>x.hidden=m!=='signup');
    $('.rem',el).hidden=!tabs; $('.em',el).hidden=m==='reset'; $('.pw',el).hidden=m==='forgot'; $('.pw2',el).hidden=m!=='reset';
    $('.authh',el).textContent=T[m][0]; $('#auGo').textContent=T[m][1]; $('#auPw').autocomplete=m==='login'?'current-password':'new-password';
    $('label[for="auPw"]',el).textContent=m==='reset'?'New password':'Password';
    $('#authLede').textContent=m==='forgot'?'Enter your email and we’ll send you a link to choose a new password.':m==='reset'?'Use at least 8 characters.':'Plan tactics, build sessions and send your players the week’s plan.';
    $('#auForgotRow').innerHTML=m==='forgot'||m==='reset'?'<button class="link" type="button" data-at="login">Back to log in</button>':'<button class="link" id="auForgot" type="button">Forgot your password?</button>';
    $('#auMsg').textContent=''};
  el.addEventListener('click',e=>{if(e.target.closest('#auForgot')) setMode('forgot')});
  if(ctx.invite){const b=$('#auInvite',el); b.hidden=false; b.innerHTML=`<b>${esc(ctx.invite.inviter)}</b> invited you to coach <b>${esc(ctx.invite.team)}</b>. Create a free account or log in to accept.`; $('#auEmail').value=ctx.invite.email||''}
  el.addEventListener('click',e=>{const b=e.target.closest('[data-at]'); if(b) setMode(b.dataset.at)});
  $('#authForm').addEventListener('submit',async e=>{
    e.preventDefault(); const msg=$('#auMsg'); msg.className='status'; msg.textContent=mode==='login'?'Logging in…':'Creating your account…'; $('#auGo').disabled=true;
    try{
      if(mode==='forgot'){await api('POST','/api/password/forgot',{email:$('#auEmail').value.trim()}); msg.className='status'; msg.textContent='If there’s an account with that email, we’ve sent a reset link. Check your inbox (and spam folder).'; $('#auGo').disabled=false; return}
      if(mode==='reset'){const a=$('#auPw').value, b=$('#auPw2').value; if(a!==b) throw new Error('The two passwords don’t match.'); await api('POST','/api/password/reset',{token:ctx.reset,password:a}); history.replaceState(null,'',appPath()); location.reload(); return}
      const body={email:$('#auEmail').value.trim(),password:$('#auPw').value,remember:$('#auRemember').checked};
      if(mode==='signup'){if(!$('#auAgree').checked) throw new Error('Please tick the box to confirm you’re 18 or over and agree to the Terms and Privacy policy.'); body.agree=true; body.name=$('#auName').value.trim(); body.team=$('#auTeam').value.trim(); const c=$('#auCode'); if(c) body.code=c.value.trim(); if(ctx.inviteToken) body.invite=ctx.inviteToken}
      const r=await api('POST',mode==='login'?'/api/login':'/api/signup',body);
      if(ctx.inviteToken){ if(mode==='signup'){try{localStorage.removeItem('tls:pendingInvite'); if(r.joinedTeam) localStorage.setItem('tls:justJoined',JSON.stringify({teamId:r.joinedTeam,team:ctx.invite.team}))}catch(e){}} history.replaceState(null,'',appPath()+'#week') }
      location.reload();
    }catch(err){msg.className='status err'; msg.textContent=err.message; $('#auGo').disabled=false}
  });
  if(ctx.reset) setMode('reset'); else if(ctx.invite||location.hash==='#signup') setMode('signup');
  if(ctx.invite) $('.su #auTeam')&&($('#auTeam').closest('.su').hidden=true);
  if(ctx.error){$('#auMsg').className='status err'; $('#auMsg').textContent=ctx.error}
  setTimeout(()=>(ctx.reset?$('#auPw'):$('#auEmail')).focus(),50);
}

/* ---------- start ---------- */
const appPath=()=>location.pathname.startsWith('/app')?'/app':location.pathname==='/'?'/':location.pathname;
function demoBanner(){const b=document.createElement('div'); b.className='demobanner'; b.innerHTML='<span>Demo mode: everything saves on this device only.</span> <a href="/app#signup">Create a free account</a> <a href="/">Back to the website</a>'; document.body.prepend(b)}
async function startApp(){
  if(window.__WEEK__){bootApp({player:true}); openPlayer(window.__WEEK__); return}
  if(window.__DEMO__){bootApp(); demoBanner(); return}
  let srv=false, boot=null;
  if(/^https?:$/.test(location.protocol)){
    try{const r=await fetch('/api/bootstrap',{credentials:'same-origin'}); if(r.headers.get('x-touchline')==='1'){srv=true; if(r.ok) boot=await r.json()}}catch(e){}
  }
  if(window.__WEEK_MISSING__){bootApp({player:true}); showMissingWeek(); return}
  const h=location.hash||''; const resetTok=h.startsWith('#reset.')?h.slice(7):null; const invTok=h.startsWith('#invite.')?h.slice(8):null;
  if(invTok){try{localStorage.setItem('tls:pendingInvite',JSON.stringify(invTok))}catch(e){}}
  if(srv&&(!boot||resetTok)){
    const cfg=await fetch('/api/config').then(r=>r.json()).catch(()=>({}));
    const ctx={}; if(resetTok) ctx.reset=resetTok;
    if(invTok){try{ctx.invite=await api('GET','/api/invites/'+invTok); ctx.inviteToken=invTok}catch(e){ctx.error=e.message; try{localStorage.removeItem('tls:pendingInvite')}catch(_){}}}
    showAuth(cfg,ctx); return}
  let joined=null; try{joined=JSON.parse(localStorage.getItem('tls:justJoined')); localStorage.removeItem('tls:justJoined')}catch(e){}
  if(srv&&boot){let pend=null; try{pend=JSON.parse(localStorage.getItem('tls:pendingInvite'))}catch(e){}
    if(pend){try{localStorage.removeItem('tls:pendingInvite')}catch(e){} try{const r=await api('POST','/api/invites/accept',{token:pend}); joined=r; boot.teams=(await api('GET','/api/teams')).teams}catch(e){setTimeout(()=>toast(e.message),800)}}
    if(invTok) history.replaceState(null,'',appPath()+'#week')}
  if(srv){
    SRV.on=true; SRV.user=boot.user; SRV.teams=boot.teams||[]; SRV.limit=boot.teamLimit; SRV.beta=!!boot.beta; SRV.plan=boot.plan||null; SRV.termsVersion=boot.termsVersion||null; SRV.env=boot.env||'production';
    SYNC_KEYS.forEach(k=>cacheSet(k,(boot.store||{})[k]||[]));
    const act=activeTeams(); let want=null; try{want=JSON.parse(localStorage.getItem('tls:tid'))}catch(e){}
    SRV.tid=(joined&&act.find(t=>t.id===joined.teamId)||act.find(t=>t.id===want)||act[0]||{}).id||null;
    if(SRV.tid){try{await loadTeamData(SRV.tid)}catch(e){cacheSet('weekdraft',null)}} else cacheSet('weekdraft',null);
    document.body.classList.add('cloud');
  }
  bootApp(); updateTeamBtn(); if(SRV.on&&typeof initSafety==='function') initSafety(); if(SRV.on&&typeof initBilling==='function') initBilling();
  if(joined){show('week'); setTimeout(()=>toast(`You’re now a coach for ${joined.team}`),300)}
}
function showMissingWeek(){
  document.body.classList.add('pmode'); $('#pv').hidden=false;
  $('#pv').innerHTML=`<div class="wrap pvwrap"><div class="card"><h2>This week isn’t available</h2><p class="muted" style="margin-top:8px">The coach may have deleted it, or the link is incomplete. Ask your coach for the latest link.</p></div></div>`;
}
addEventListener('hashchange',()=>{const h=location.hash||''; if(h.startsWith('#reset.')||h.startsWith('#invite.')) location.reload(); else if(h==='#signup'||h==='#login'){const b=document.querySelector(`#auth [data-at="${h.slice(1)}"]`); if(b) b.click()}});
let wkRefreshing=false;
async function refreshWeekView(){
  if(!SRV.on||!SRV.tid||wkRefreshing) return; wkRefreshing=true;
  try{
    const tid=SRV.tid;
    const [t,w,m,d]=await Promise.all([api('GET','/api/teams'),api('GET',`/api/teams/${tid}/weeks`),api('GET',`/api/teams/${tid}/members`).catch(()=>null),api('GET',`/api/teams/${tid}/draft`)]);
    if(SRV.tid!==tid) return;
    SRV.teams=t.teams; SRV.limit=t.limit; SRV.weeks=w.weeks||[]; SRV.members=m;
    if(!SRV.teams.some(x=>x.id===tid&&!x.archived)){const next=activeTeams()[0]; await setTeam(next?next.id:null); return}
    const editing=document.activeElement&&$('#weekBody').contains(document.activeElement)&&/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName);
    if(!pend['wd:'+tid]&&!editing&&d.value) cacheSet('weekdraft',d.value);
    if(!editing&&!$('#v-week').hidden) renderWeek();
  }catch(e){} finally{wkRefreshing=false}
}
