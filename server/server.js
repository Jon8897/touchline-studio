'use strict';
/* Touchline Studio server: accounts, teams, cloud saving and player links.
   No npm packages needed. Run with:  node server.js   (Node.js 22.13+) */
process.removeAllListeners('warning');
process.on('warning',w=>{if(w.name!=='ExperimentalWarning') console.warn(w)});
const http=require('node:http'), fs=require('node:fs'), path=require('node:path');
const {CFG,db,now,rid,slug,sha,hashPassword,verifyPassword,validEmail}=require('./lib');
const {Mail}=require('./mailer');
const Billing=require('./billing');

const PUB=path.join(__dirname,'public');
const fileCache=new Map();
function readPub(name){ // cached read of a file in public/, refreshed when the file changes; null if missing
  const f=path.join(PUB,name); let st; try{st=fs.statSync(f)}catch(e){return null}
  const c=fileCache.get(f); if(c&&c.m===st.mtimeMs) return c.d;
  const d=fs.readFileSync(f); fileCache.set(f,{m:st.mtimeMs,d}); return d;
}
const indexHtml=()=>readPub('index.html').toString('utf8');
const pageHtml=name=>{const b=readPub(name); if(!b) return null; let h=b.toString('utf8').replaceAll('__BASE__',CFG.base); if(CFG.contact) h=h.replaceAll('hello@touchlinestudio.com',CFG.contact); return h};
const VERSION=(()=>{try{return fs.readFileSync(path.join(__dirname,'VERSION'),'utf8').trim()}catch(e){return 'dev'}})();
const STATIC_TYPES={'.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.ico':'image/x-icon','.webp':'image/webp','.txt':'text/plain; charset=utf-8','.woff2':'font/woff2','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8'};

const SESSION_DAYS=30, MAX_BODY=3*1024*1024, USER_KEYS=['mydrills','plays','sessions'];
const COOKIE='tls_sid';

/* ---------- prepared statements ---------- */
const Q={
  userByEmail:db.prepare('SELECT * FROM users WHERE email=?'),
  userById:db.prepare('SELECT * FROM users WHERE id=?'),
  insUser:db.prepare('INSERT INTO users(id,email,name,pass,max_teams,created) VALUES(?,?,?,?,?,?)'),
  setLogin:db.prepare('UPDATE users SET last_login=? WHERE id=?'),
  setPass:db.prepare('UPDATE users SET pass=? WHERE id=?'),
  setName:db.prepare('UPDATE users SET name=? WHERE id=?'),
  insSess:db.prepare('INSERT INTO sessions(token_hash,user_id,created,expires) VALUES(?,?,?,?)'),
  sess:db.prepare('SELECT * FROM sessions WHERE token_hash=? AND expires>?'),
  delSess:db.prepare('DELETE FROM sessions WHERE token_hash=?'),
  delUserSess:db.prepare('DELETE FROM sessions WHERE user_id=? AND token_hash<>?'),
  gcSess:db.prepare('DELETE FROM sessions WHERE expires<?'),
  teams:db.prepare('SELECT t.*, u.name owner_name FROM teams t JOIN users u ON u.id=t.owner_id WHERE t.owner_id=? OR t.id IN (SELECT team_id FROM team_members WHERE user_id=?) ORDER BY t.archived, t.created'),
  insReset:db.prepare('INSERT INTO password_resets(token_hash,user_id,created,expires) VALUES(?,?,?,?)'),
  reset:db.prepare('SELECT * FROM password_resets WHERE token_hash=? AND used=0 AND expires>?'),
  useReset:db.prepare('UPDATE password_resets SET used=1 WHERE user_id=?'),
  recentResets:db.prepare('SELECT COUNT(*) n FROM password_resets WHERE user_id=? AND created>?'),
  delAllSess:db.prepare('DELETE FROM sessions WHERE user_id=?'),
  members:db.prepare('SELECT u.id,u.name,u.email,m.role FROM team_members m JOIN users u ON u.id=m.user_id WHERE m.team_id=? ORDER BY u.name'),
  memberCount:db.prepare('SELECT COUNT(*) n FROM team_members WHERE team_id=?'),
  addMember:db.prepare("INSERT OR IGNORE INTO team_members(team_id,user_id,role) VALUES(?,?,'assistant')"),
  delMember:db.prepare('DELETE FROM team_members WHERE team_id=? AND user_id=?'),
  insInvite:db.prepare('INSERT INTO team_invites(id,token_hash,team_id,email,invited_by,created,expires) VALUES(?,?,?,?,?,?,?)'),
  invite:db.prepare('SELECT i.*, t.name team_name, t.archived team_archived, u.name inviter_name FROM team_invites i JOIN teams t ON t.id=i.team_id JOIN users u ON u.id=i.invited_by WHERE i.token_hash=?'),
  invites:db.prepare('SELECT id,email,created,expires FROM team_invites WHERE team_id=? AND accepted IS NULL AND expires>? ORDER BY created DESC'),
  pendingFor:db.prepare('SELECT id FROM team_invites WHERE team_id=? AND email=? AND accepted IS NULL AND expires>?'),
  delInvite:db.prepare('DELETE FROM team_invites WHERE id=? AND team_id=?'),
  acceptInvite:db.prepare('UPDATE team_invites SET accepted=?, accepted_by=? WHERE id=?'),
  team:db.prepare('SELECT * FROM teams WHERE id=?'),
  member:db.prepare('SELECT role FROM team_members WHERE team_id=? AND user_id=?'),
  activeCount:db.prepare('SELECT COUNT(*) n FROM teams WHERE owner_id=? AND archived=0'),
  insTeam:db.prepare('INSERT INTO teams(id,owner_id,name,color,created,updated) VALUES(?,?,?,?,?,?)'),
  updTeam:db.prepare('UPDATE teams SET name=?, color=?, updated=? WHERE id=?'),
  archTeam:db.prepare('UPDATE teams SET archived=?, updated=? WHERE id=?'),
  getStore:db.prepare('SELECT key,data FROM user_store WHERE user_id=?'),
  putStore:db.prepare('INSERT INTO user_store(user_id,key,data,updated) VALUES(?,?,?,?) ON CONFLICT(user_id,key) DO UPDATE SET data=excluded.data, updated=excluded.updated'),
  getDraft:db.prepare('SELECT data FROM team_drafts WHERE team_id=?'),
  putDraft:db.prepare('INSERT INTO team_drafts(team_id,data,updated) VALUES(?,?,?) ON CONFLICT(team_id) DO UPDATE SET data=excluded.data, updated=excluded.updated'),
  weeks:db.prepare('SELECT slug,title,published,updated,views FROM weeks WHERE team_id=? ORDER BY published DESC LIMIT 100'),
  week:db.prepare('SELECT * FROM weeks WHERE slug=?'),
  insWeek:db.prepare('INSERT INTO weeks(id,slug,team_id,title,data,draft,published,updated) VALUES(?,?,?,?,?,?,?,?)'),
  updWeek:db.prepare('UPDATE weeks SET title=?, data=?, draft=?, updated=? WHERE slug=?'),
  delWeek:db.prepare('DELETE FROM weeks WHERE slug=?'),
  viewWeek:db.prepare('UPDATE weeks SET views=views+1 WHERE slug=?'),
};
setInterval(()=>{Q.gcSess.run(now()); db.prepare('DELETE FROM password_resets WHERE expires<?').run(now()-864e5); db.prepare('DELETE FROM team_invites WHERE accepted IS NULL AND expires<?').run(now()-30*864e5)},6*3600e3).unref();

/* ---------- small http helpers ---------- */
const SEC_HEADERS={
  'X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','X-Frame-Options':'SAMEORIGIN',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy':"default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'self'; base-uri 'self'; form-action 'self'"
};
function send(res,code,body,headers={}){
  if(CFG.env!=='production') headers={'X-Robots-Tag':'noindex, nofollow',...headers};
  const isJson=typeof body!=='string'&&!Buffer.isBuffer(body); const data=isJson?JSON.stringify(body):body;
  res.writeHead(code,{...SEC_HEADERS,'Content-Type':isJson?'application/json; charset=utf-8':'text/html; charset=utf-8','Cache-Control':'no-store','X-Touchline':'1',...headers});
  res.end(data);
}
const fail=(res,code,error,extra={})=>send(res,code,{error,...extra});
function readRaw(req,max=MAX_BODY){return new Promise((resolve,reject)=>{let size=0; const chunks=[]; req.on('data',c=>{size+=c.length; if(size>max){reject(Object.assign(new Error('too_large'),{code:413})); req.destroy(); return} chunks.push(c)}); req.on('end',()=>resolve(Buffer.concat(chunks))); req.on('error',reject)})}
function readBody(req){return new Promise((resolve,reject)=>{let size=0; const chunks=[];
  req.on('data',c=>{size+=c.length; if(size>MAX_BODY){reject(Object.assign(new Error('too_large'),{code:413})); req.destroy(); return} chunks.push(c)});
  req.on('end',()=>{if(!chunks.length) return resolve({}); try{resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')))}catch(e){reject(Object.assign(new Error('bad_json'),{code:400}))}});
  req.on('error',reject)})}
function cookies(req){const out={}; (req.headers.cookie||'').split(';').forEach(p=>{const i=p.indexOf('='); if(i>0) out[p.slice(0,i).trim()]=decodeURIComponent(p.slice(i+1).trim())}); return out}
function setCookie(res,value,maxAge){res.setHeader('Set-Cookie',`${COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${CFG.secure?'; Secure':''}`)}
const ipOf=req=>(req.headers['x-forwarded-for']||'').split(',')[0].trim()||req.socket.remoteAddress||'';
const hits=new Map();
function limited(key,max,windowMs){const t=now(); let h=hits.get(key); if(!h||h.reset<t){h={n:0,reset:t+windowMs}; hits.set(key,h)} h.n++; return h.n>max}
setInterval(()=>{const t=now(); for(const [k,h] of hits) if(h.reset<t) hits.delete(k)},600e3).unref();

/* ---------- auth ---------- */
function currentUser(req){const tok=cookies(req)[COOKIE]; if(!tok) return null; const s=Q.sess.get(sha(tok),now()); if(!s) return null; const u=Q.userById.get(s.user_id); if(u) u._tok=tok; return u||null}
function startSession(res,user){const tok=rid(32); Q.insSess.run(sha(tok),user.id,now(),now()+SESSION_DAYS*864e5); Q.setLogin.run(now(),user.id); setCookie(res,tok,SESSION_DAYS*86400)}
const publicUser=u=>({id:u.id,email:u.email,name:u.name,plan:u.plan,maxTeams:u.max_teams,termsAcceptedAt:u.terms_accepted_at||null,termsVersion:u.terms_version||null});
const publicTeam=(t,uid)=>({id:t.id,name:t.name,color:t.color,archived:!!t.archived,owner:t.owner_id===uid,role:t.owner_id===uid?'owner':'assistant',ownerName:t.owner_name||null,created:t.created});
function canTeam(user,teamId){const t=Q.team.get(teamId); if(!t) return null; if(t.owner_id===user.id) return t; return Q.member.get(teamId,user.id)?t:null}
const clean=(s,max)=>String(s??'').replace(/[\u0000-\u001f]/g,' ').trim().slice(0,max);
const COLOR=/^#[0-9a-f]{6}$/i;

/* ---------- routes ---------- */
const routes=[];
const route=(method,pattern,handler,opts={})=>routes.push({method,re:new RegExp('^'+pattern.replace(/:(\w+)/g,'(?<$1>[^/]+)')+'$'),handler,...opts});

route('GET','/api/config',(req,res)=>send(res,200,{signupCodeRequired:!!CFG.signupCode,teamLimit:CFG.teamLimit,emailEnabled:require('./mailer').E.provider!=='console',beta:CFG.beta,env:CFG.env,termsVersion:CFG.termsVersion}),{public:true});

route('POST','/api/signup',async(req,res,{body})=>{
  if(limited('signup:'+ipOf(req),+process.env.SIGNUP_LIMIT||10,3600e3)) return fail(res,429,'Too many attempts. Try again later.');
  const email=clean(body.email,200).toLowerCase(), name=clean(body.name,60), pw=String(body.password||'');
  const inv=body.invite?validInvite(String(body.invite)):null;
  if(CFG.signupCode&&!inv&&String(body.code||'').trim()!==CFG.signupCode) return fail(res,403,'That invite code isn’t right. Ask for a new one.');
  if(!validEmail(email)) return fail(res,400,'Enter a valid email address.');
  if(!name) return fail(res,400,'Enter your name.');
  if(pw.length<8) return fail(res,400,'Use a password of at least 8 characters.');
  if(body.agree!==true) return fail(res,400,'Please confirm you’re 18 or over and agree to the Terms and Privacy Policy.');
  if(Q.userByEmail.get(email)) return fail(res,409,'An account with that email already exists. Log in instead.');
  const id=rid(); Q.insUser.run(id,email,name,hashPassword(pw),CFG.teamLimit,now()); db.prepare('UPDATE users SET terms_accepted_at=?, terms_version=? WHERE id=?').run(now(),CFG.termsVersion,id);
  const teamName=clean(body.team,60); if(teamName){const tid=rid(); Q.insTeam.run(tid,id,teamName,'#e7b53c',now(),now())}
  const nu=Q.userById.get(id); let joined=null; if(inv) joined=acceptInvite(nu,inv);
  startSession(res,nu); Mail.welcome(email,name); send(res,201,{ok:true,joinedTeam:joined});
},{public:true});

route('POST','/api/login',async(req,res,{body})=>{
  const email=clean(body.email,200).toLowerCase();
  if(limited('login:'+ipOf(req),20,900e3)||limited('login:'+email,10,900e3)) return fail(res,429,'Too many attempts. Wait 15 minutes and try again.');
  const u=Q.userByEmail.get(email);
  if(!u||!verifyPassword(String(body.password||''),u.pass)) return fail(res,401,'Wrong email or password.');
  startSession(res,u); send(res,200,{ok:true});
},{public:true});

route('POST','/api/logout',(req,res,{user})=>{Q.delSess.run(sha(user._tok)); setCookie(res,'',0); send(res,200,{ok:true})});

route('GET','/api/me',(req,res,{user})=>send(res,200,{user:publicUser(user),teams:Q.teams.all(user.id,user.id).map(t=>publicTeam(t,user.id))}));

route('GET','/api/bootstrap',(req,res,{user})=>{
  const store={}; for(const r of Q.getStore.all(user.id)) try{store[r.key]=JSON.parse(r.data)}catch(e){}
  const ent=Billing.entitlements(user);
  send(res,200,{user:publicUser(user),teams:Q.teams.all(user.id,user.id).map(t=>publicTeam(t,user.id)),store,teamLimit:ent.teams,plan:{plan:ent.plan,label:ent.label,paid:ent.paid,pastDue:!!ent.pastDue,payments:ent.payments,assistants:ent.assistants,weeksPerTeam:Number.isFinite(ent.weeksPerTeam)?ent.weeksPerTeam:null},beta:CFG.beta,env:CFG.env,termsVersion:CFG.termsVersion});
});

route('PUT','/api/store/:key',(req,res,{user,params,body})=>{
  if(!USER_KEYS.includes(params.key)) return fail(res,400,'Unknown key');
  if(!Array.isArray(body.value)) return fail(res,400,'Expected a list');
  Q.putStore.run(user.id,params.key,JSON.stringify(body.value),now()); send(res,200,{ok:true});
});

route('PATCH','/api/account',(req,res,{user,body})=>{
  if(body.name!==undefined){const n=clean(body.name,60); if(!n) return fail(res,400,'Enter your name.'); Q.setName.run(n,user.id)}
  if(body.newPassword!==undefined){
    if(!verifyPassword(String(body.currentPassword||''),user.pass)) return fail(res,403,'Your current password isn’t right.');
    if(String(body.newPassword).length<8) return fail(res,400,'Use a password of at least 8 characters.');
    Q.setPass.run(hashPassword(String(body.newPassword)),user.id); Q.delUserSess.run(user.id,sha(user._tok)); Mail.passwordChanged(user.email,user.name);
  }
  send(res,200,{user:publicUser(Q.userById.get(user.id))});
});


/* your data: download a copy, accept updated terms, delete the account */
route('GET','/api/account/export',(req,res,{user})=>{
  const J=s=>{try{return JSON.parse(s)}catch(e){return null}};
  const owned=db.prepare('SELECT * FROM teams WHERE owner_id=?').all(user.id).map(t=>({id:t.id,name:t.name,colour:t.color,archived:!!t.archived,created:new Date(t.created).toISOString(),
    draft:J((Q.getDraft.get(t.id)||{}).data),
    assistants:db.prepare('SELECT u.name,u.email FROM team_members m JOIN users u ON u.id=m.user_id WHERE m.team_id=?').all(t.id),
    publishedWeeks:db.prepare('SELECT slug,title,data,published,views FROM weeks WHERE team_id=?').all(t.id).map(w=>({link:weekUrl(w.slug),title:w.title,published:new Date(w.published).toISOString(),views:w.views,content:J(w.data)}))}));
  const assisting=db.prepare('SELECT t.name, o.name owner FROM team_members m JOIN teams t ON t.id=m.team_id JOIN users o ON o.id=t.owner_id WHERE m.user_id=?').all(user.id);
  const store={}; for(const r of Q.getStore.all(user.id)) store[r.key]=J(r.data);
  const out={exported:new Date().toISOString(),account:{name:user.name,email:user.email,created:new Date(user.created).toISOString(),lastLogin:user.last_login?new Date(user.last_login).toISOString():null,plan:user.plan,termsAccepted:user.terms_accepted_at?new Date(user.terms_accepted_at).toISOString():null,termsVersion:user.terms_version},
    teamsYouRun:owned,teamsYouAssist:assisting,yourLibrary:store,
    reports:db.prepare('SELECT kind,message,page,created FROM reports WHERE user_id=?').all(user.id).map(r=>({...r,created:new Date(r.created).toISOString()}))};
  send(res,200,JSON.stringify(out,null,2),{'Content-Type':'application/json; charset=utf-8','Content-Disposition':`attachment; filename="touchline-data-${new Date().toISOString().slice(0,10)}.json"`});
});
route('POST','/api/account/terms',(req,res,{user,body})=>{if(body.agree!==true) return fail(res,400,'Please tick the box to agree.'); db.prepare('UPDATE users SET terms_accepted_at=?, terms_version=? WHERE id=?').run(now(),CFG.termsVersion,user.id); send(res,200,{ok:true})});
route('POST','/api/account/delete',async(req,res,{user,body})=>{
  if(limited('del:'+user.id,5,3600e3)) return fail(res,429,'Too many attempts. Try again later.');
  if(!verifyPassword(String(body.password||''),user.pass)) return fail(res,403,'That password isn’t right.');
  if(user.billing_subscription&&['active','trialing','past_due','unpaid','incomplete'].includes(user.billing_status)){
    try{await Billing.stripe('DELETE',`/v1/subscriptions/${encodeURIComponent(user.billing_subscription)}`)}   // stop future payments straight away
    catch(e){return fail(res,502,'We couldn’t cancel your subscription with Stripe, so nothing was deleted. Try again in a minute.')}
  }
  db.prepare('DELETE FROM reports WHERE user_id=?').run(user.id);
  db.prepare('DELETE FROM users WHERE id=?').run(user.id);   // teams, weeks, drafts, sessions and library go with it (ON DELETE CASCADE)
  setCookie(res,'',0); Mail.deleted(user.email,user.name); send(res,200,{ok:true});
});

/* feedback, concerns about a page, privacy requests (public: players and parents can use it too) */
route('POST','/api/report',(req,res,{user,body})=>{
  if(limited('report:'+ipOf(req),8,3600e3)) return fail(res,429,'Too many messages. Try again later.');
  const kind=['feedback','concern','privacy'].includes(body.kind)?body.kind:'feedback';
  const message=String(body.message??'').replace(/\u0000/g,'').trim().slice(0,4000), page=clean(body.page,300), email=clean(body.email,200).toLowerCase();
  if(message.length<3) return fail(res,400,'Please write a short message.');
  if(email&&!validEmail(email)) return fail(res,400,'That email address doesn’t look right.');
  const me=user||currentUser(req);
  const r=db.prepare('INSERT INTO reports(kind,message,page,email,user_id,created) VALUES(?,?,?,?,?,?) RETURNING id').get(kind,message,page,email||(me&&me.email)||null,me?me.id:null,now());
  const info={id:r.id,kind,message,page,email:email||(me&&me.email)||'',userEmail:me&&me.email};
  if(CFG.adminEmail) Mail.report(CFG.adminEmail,info); else console.log(`[report #${r.id}] ${kind}: ${message}`);
  if(info.email) Mail.reportAck(info.email,info);
  send(res,201,{ok:true,id:r.id});
},{public:true});

Billing.install({route,send,fail,Mail,limited});

/* password reset */
route('POST','/api/password/forgot',(req,res,{body})=>{
  const email=clean(body.email,200).toLowerCase();
  if(limited('forgot:'+ipOf(req),10,3600e3)||limited('forgot:'+email,3,3600e3)) return fail(res,429,'Too many requests. Try again in an hour.');
  const u=validEmail(email)?Q.userByEmail.get(email):null;
  if(u&&Q.recentResets.get(u.id,now()-3600e3).n<5){const tok=rid(24); Q.insReset.run(sha(tok),u.id,now(),now()+3600e3); Mail.reset(u.email,u.name,`${CFG.base}/app#reset.${tok}`)}
  send(res,200,{ok:true});
},{public:true});
route('POST','/api/password/reset',(req,res,{body})=>{
  if(limited('reset:'+ipOf(req),20,3600e3)) return fail(res,429,'Too many attempts. Try again later.');
  const r=Q.reset.get(sha(String(body.token||'')),now()); if(!r) return fail(res,400,'This reset link has expired or was already used. Ask for a new one.');
  const pw=String(body.password||''); if(pw.length<8) return fail(res,400,'Use a password of at least 8 characters.');
  const u=Q.userById.get(r.user_id); if(!u) return fail(res,400,'Account not found.');
  Q.setPass.run(hashPassword(pw),u.id); Q.useReset.run(u.id); Q.delAllSess.run(u.id);
  startSession(res,u); Mail.passwordChanged(u.email,u.name); send(res,200,{ok:true});
},{public:true});

/* assistant coaches */
function validInvite(tok){const i=Q.invite.get(sha(tok)); if(!i||i.accepted||i.expires<now()||i.team_archived) return null; return i}
function acceptInvite(user,inv){
  const t=Q.team.get(inv.team_id); if(!t) return null;
  if(t.owner_id!==user.id) Q.addMember.run(t.id,user.id);
  Q.acceptInvite.run(now(),user.id,inv.id);
  if(t.owner_id!==user.id) Mail.added(user.email,user.name,t.name,inv.inviter_name);
  return t.id;
}
route('GET','/api/invites/:token',(req,res,{params})=>{
  const i=validInvite(params.token); if(!i) return fail(res,404,'This invite has expired or was already used. Ask the coach to send a new one.');
  send(res,200,{team:i.team_name,inviter:i.inviter_name,email:i.email});
},{public:true});
route('POST','/api/invites/accept',(req,res,{user,body})=>{
  const i=validInvite(String(body.token||'')); if(!i) return fail(res,404,'This invite has expired or was already used. Ask the coach to send a new one.');
  send(res,200,{teamId:acceptInvite(user,i),team:i.team_name});
});
route('GET','/api/teams/:id/members',(req,res,{user,params})=>{
  const t=canTeam(user,params.id); if(!t) return fail(res,404,'Team not found'); const o=Q.userById.get(t.owner_id);
  send(res,200,{owner:{id:o.id,name:o.name,email:o.email},members:Q.members.all(t.id),invites:t.owner_id===user.id?Q.invites.all(t.id,now()):[],you:t.owner_id===user.id?'owner':'assistant',max:CFG.maxAssistants});
});
route('POST','/api/teams/:id/invites',(req,res,{user,params,body})=>{
  const t=canTeam(user,params.id); if(!t||t.owner_id!==user.id) return fail(res,403,'Only the team’s head coach can invite coaches.');
  if(t.archived) return fail(res,403,'Restore this team first.');
  if(limited('invite:'+user.id,30,3600e3)) return fail(res,429,'Too many invites. Try again later.');
  const email=clean(body.email,200).toLowerCase(); if(!validEmail(email)) return fail(res,400,'Enter a valid email address.');
  if(email===user.email.toLowerCase()) return fail(res,400,'That’s your own email.');
  if(!Billing.entitlements(user).assistants) return fail(res,403,'Assistant coaches are part of the Coach and Club plans.',{code:'plan_required'});
  const existing=Q.userByEmail.get(email); if(existing&&Q.member.get(t.id,existing.id)) return fail(res,409,'They’re already a coach on this team.');
  if(Q.memberCount.get(t.id).n+Q.invites.all(t.id,now()).length>=CFG.maxAssistants) return fail(res,403,`A team can have up to ${CFG.maxAssistants} assistant coaches.`);
  for(const p of Q.pendingFor.all(t.id,email,now())) Q.delInvite.run(p.id,t.id);
  const tok=rid(24), id=rid(); Q.insInvite.run(id,sha(tok),t.id,email,user.id,now(),now()+14*864e5);
  const link=`${CFG.base}/app#invite.${tok}`; Mail.invite(email,user.name,t.name,link);
  send(res,201,{invite:{id,email},link});
});
route('DELETE','/api/teams/:id/invites/:iid',(req,res,{user,params})=>{const t=canTeam(user,params.id); if(!t||t.owner_id!==user.id) return fail(res,403,'Only the head coach can do that.'); Q.delInvite.run(params.iid,t.id); send(res,200,{ok:true})});
route('DELETE','/api/teams/:id/members/:uid',(req,res,{user,params})=>{const t=canTeam(user,params.id); if(!t||t.owner_id!==user.id) return fail(res,403,'Only the head coach can remove coaches.'); Q.delMember.run(t.id,params.uid); send(res,200,{ok:true})});
route('POST','/api/teams/:id/leave',(req,res,{user,params})=>{const t=canTeam(user,params.id); if(!t) return fail(res,404,'Team not found'); if(t.owner_id===user.id) return fail(res,400,'You run this team. Archive it instead.'); Q.delMember.run(t.id,user.id); send(res,200,{ok:true})});

/* teams */
route('GET','/api/teams',(req,res,{user})=>send(res,200,{teams:Q.teams.all(user.id,user.id).map(t=>publicTeam(t,user.id)),limit:Billing.entitlements(user).teams}));
route('POST','/api/teams',(req,res,{user,body})=>{
  const name=clean(body.name,60); if(!name) return fail(res,400,'Give the team a name.');
  const n=Q.activeCount.get(user.id).n, E=Billing.entitlements(user);
  if(n>=E.teams) return fail(res,403,E.plan==='free'?'The Free plan includes 1 team. Upgrade to Coach to add more teams.':E.plan==='coach'?`Your plan includes ${E.teams} active team${E.teams>1?'s':''}. Add an extra team under Plan & billing, or archive one.`:`Your plan includes ${E.teams} active teams. Archive a team to add another.`,{code:'team_limit',limit:E.teams});
  const id=rid(), color=COLOR.test(body.color||'')?body.color:'#e7b53c';
  Q.insTeam.run(id,user.id,name,color,now(),now()); send(res,201,{team:publicTeam(Q.team.get(id),user.id)});
});
route('PATCH','/api/teams/:id',(req,res,{user,params,body})=>{
  const t=canTeam(user,params.id); if(!t||t.owner_id!==user.id) return fail(res,404,'Team not found');
  const name=body.name!==undefined?clean(body.name,60):t.name; if(!name) return fail(res,400,'Give the team a name.');
  const color=COLOR.test(body.color||'')?body.color:t.color;
  Q.updTeam.run(name,color,now(),t.id); send(res,200,{team:publicTeam(Q.team.get(t.id),user.id)});
});
route('POST','/api/teams/:id/archive',(req,res,{user,params})=>{const t=canTeam(user,params.id); if(!t||t.owner_id!==user.id) return fail(res,404,'Team not found'); Q.archTeam.run(1,now(),t.id); send(res,200,{ok:true})});
route('POST','/api/teams/:id/restore',(req,res,{user,params})=>{
  const t=canTeam(user,params.id); if(!t||t.owner_id!==user.id) return fail(res,404,'Team not found');
  {const E=Billing.entitlements(user); if(Q.activeCount.get(user.id).n>=E.teams) return fail(res,403,`You already have ${E.teams} active team${E.teams>1?'s':''}. Archive one first or upgrade.`,{code:'team_limit',limit:E.teams})}
  Q.archTeam.run(0,now(),t.id); send(res,200,{ok:true});
});
route('GET','/api/teams/:id/draft',(req,res,{user,params})=>{const t=canTeam(user,params.id); if(!t) return fail(res,404,'Team not found'); const r=Q.getDraft.get(t.id); send(res,200,{value:r?JSON.parse(r.data):null})});
route('PUT','/api/teams/:id/draft',(req,res,{user,params,body})=>{const t=canTeam(user,params.id); if(!t) return fail(res,404,'Team not found'); if(!body.value||typeof body.value!=='object') return fail(res,400,'Expected a draft'); Q.putDraft.run(t.id,JSON.stringify(body.value),now()); send(res,200,{ok:true})});

/* weeks */
const weekUrl=s=>`${CFG.base}/w/${s}`;
route('GET','/api/teams/:id/weeks',(req,res,{user,params})=>{const t=canTeam(user,params.id); if(!t) return fail(res,404,'Team not found'); send(res,200,{weeks:Q.weeks.all(t.id).map(w=>({...w,url:weekUrl(w.slug)}))})});
route('POST','/api/teams/:id/weeks',(req,res,{user,params,body})=>{
  const t=canTeam(user,params.id); if(!t) return fail(res,404,'Team not found');
  if(t.archived) return fail(res,403,'Restore this team before publishing.');
  if(!body.data||typeof body.data!=='object') return fail(res,400,'Nothing to publish');
  {const E=Billing.entitlements(Billing.ownerOf(t.owner_id)); const live=db.prepare('SELECT COUNT(*) n FROM weeks WHERE team_id=?').get(t.id).n;
   if(live>=E.weeksPerTeam) return fail(res,403,'The Free plan keeps one weekly link live per team. Update the current week, delete it, or upgrade to Coach for unlimited weeks.',{code:'week_limit'})}
  const data={...body.data,team:t.name,posted:now()}; let s; do{s=slug()}while(Q.week.get(s));
  Q.insWeek.run(rid(),s,t.id,clean(data.title||'This week',80),JSON.stringify(data),body.draft?JSON.stringify(body.draft):null,now(),now());
  send(res,201,{slug:s,url:weekUrl(s)});
});
route('GET','/api/weeks/:slug',(req,res,{user,params})=>{const w=Q.week.get(params.slug); if(!w||!canTeam(user,w.team_id)) return fail(res,404,'Week not found'); send(res,200,{slug:w.slug,url:weekUrl(w.slug),data:JSON.parse(w.data),draft:w.draft?JSON.parse(w.draft):null})});
route('PUT','/api/weeks/:slug',(req,res,{user,params,body})=>{
  const w=Q.week.get(params.slug); if(!w) return fail(res,404,'Week not found'); const t=canTeam(user,w.team_id); if(!t) return fail(res,404,'Week not found');
  if(!body.data||typeof body.data!=='object') return fail(res,400,'Nothing to publish');
  const data={...body.data,team:t.name,posted:now()};
  Q.updWeek.run(clean(data.title||'This week',80),JSON.stringify(data),body.draft?JSON.stringify(body.draft):w.draft,now(),w.slug); send(res,200,{slug:w.slug,url:weekUrl(w.slug)});
});
route('DELETE','/api/weeks/:slug',(req,res,{user,params})=>{const w=Q.week.get(params.slug); if(!w||!canTeam(user,w.team_id)) return fail(res,404,'Week not found'); Q.delWeek.run(w.slug); send(res,200,{ok:true})});
route('GET','/api/public/weeks/:slug',(req,res,{params})=>{const w=Q.week.get(params.slug); if(!w) return fail(res,404,'Week not found'); send(res,200,{data:JSON.parse(w.data)})},{public:true});

/* ---------- pages ---------- */
const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeJson=o=>JSON.stringify(o).replace(/</g,'\\u003c').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
function weekPage(res,w){
  const d=JSON.parse(w.data), m=d.match||{};
  const desc=[m.opp?`Next match: ${m.ha==='Away'?'@':'v'} ${m.opp}${m.date?' · '+new Date(m.date+'T12:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'}):''}`:'',(d.train||[]).length?`${d.train.length} training session${d.train.length>1?'s':''}`:'',d.sheet?'Team sheet':'',(d.items||[]).length?`${d.items.length} tactic${d.items.length>1?'s':''} & drills`:''].filter(Boolean).join(' · ')||'This week’s training and tactics';
  const title=`${d.title||'This week'} · ${d.team||'Touchline Studio'}`;
  const meta=`<meta property="og:type" content="website"><meta property="og:site_name" content="Touchline Studio"><meta property="og:title" content="${escHtml(title)}"><meta property="og:description" content="${escHtml(desc)}"><meta property="og:url" content="${escHtml(weekUrl(w.slug))}"><meta name="twitter:card" content="summary"><meta name="description" content="${escHtml(desc)}"><script>window.__WEEK__=${safeJson(d)};</script>`;
  const html=indexHtml().replace(/<title>[^<]*<\/title>/,`<title>${escHtml(title)}</title>`).replace('</head>',meta+'</head>');
  Q.viewWeek.run(w.slug); send(res,200,html,{'Cache-Control':'no-cache','X-Robots-Tag':'noindex, nofollow, noarchive'});
}

/* ---------- server ---------- */
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://x'); const p=url.pathname;
    if(p==='/healthz'){let ok=true; try{db.prepare('SELECT 1').get()}catch(e){ok=false} return send(res,ok?200:503,{ok,version:VERSION,env:CFG.env})}
    if(p==='/api/webhooks/stripe') return await Billing.handleWebhook(req,res,{send,fail,readRaw,Mail});
    if(p.startsWith('/api/')){
      const r=routes.find(r=>r.method===req.method&&r.re.test(p)); if(!r) return fail(res,404,'Not found');
      if(req.method!=='GET'&&req.headers['x-tls']!=='1') return fail(res,403,'Missing request header');
      const params=p.match(r.re).groups||{};
      const user=currentUser(req); if(!r.public&&!user) return fail(res,401,'Please log in.');
      const body=req.method==='GET'||req.method==='DELETE'?{}:await readBody(req);
      return await r.handler(req,res,{user,params,body});
    }
    if(req.method!=='GET'&&req.method!=='HEAD') return fail(res,405,'Method not allowed');
    const wm=p.match(/^\/w\/([a-z0-9]{4,12})\/?$/);
    if(wm){const w=Q.week.get(wm[1]); if(w) return weekPage(res,w); return send(res,404,indexHtml().replace('</head>','<script>window.__WEEK_MISSING__=1;</script></head>'))}
    if(p==='/robots.txt') return send(res,200,CFG.env==='production'?`User-agent: *\nDisallow: /w/\nDisallow: /app\nDisallow: /api/\n`:`User-agent: *\nDisallow: /\n`,{'Content-Type':'text/plain'});
    // the app itself
    if(p==='/app'||p.startsWith('/app/')) return send(res,200,indexHtml(),{'Cache-Control':'no-cache'});
    if(p==='/demo'||p==='/demo/') return send(res,200,indexHtml().replace('</head>','<script>window.__DEMO__=1;</script></head>').replace(/<title>[^<]*<\/title>/,'<title>Demo · Touchline Studio</title>'),{'Cache-Control':'no-cache'});
    // the public website: front page, privacy, terms (fall back to the app if there is no front page)
    if(p==='/'){const h=pageHtml('landing.html'); return send(res,200,h||indexHtml(),{'Cache-Control':'no-cache'})}
    const pm=p.match(/^\/([a-z][a-z-]{1,30})\/?$/);   // /privacy, /terms, /safeguarding, /cookies ... = public/<name>.html
    if(pm&&!['index','landing'].includes(pm[1])){const h=pageHtml(pm[1]+'.html'); if(h) return send(res,200,h,{'Cache-Control':'no-cache'})}
    // static files in public/ (images, favicon)
    const ext=path.extname(p).toLowerCase();
    if(STATIC_TYPES[ext]&&/^\/((fonts|vendor)\/)?[a-z0-9_-][a-z0-9._-]*$/i.test(p)){const b=readPub(p.slice(1)); if(b) return send(res,200,b,{'Content-Type':STATIC_TYPES[ext],'Cache-Control':ext==='.woff2'?'public, max-age=31536000, immutable':'public, max-age=86400'})}
    // old-style links (/#reset..., /#invite...) arrive as "/" and are handled by the front page script
    return send(res,404,`<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not found</title><body style="background:#0b0f0e;color:#eef2ee;font:16px system-ui;display:grid;place-items:center;min-height:90vh;text-align:center"><div><h1>Page not found</h1><p><a style="color:#e7b53c" href="/">Go to the home page</a> or <a style="color:#e7b53c" href="/app">open the coach app</a>.</p></div>`,{'Content-Type':'text/html; charset=utf-8'});
  }catch(err){
    if(err&&err.code===413) return fail(res,413,'That’s too big to save.');
    if(err&&err.code===400) return fail(res,400,'Bad request');
    console.error(err); if(!res.headersSent) fail(res,500,'Something went wrong on the server.');
  }
});
server.listen(CFG.port,CFG.host,()=>console.log(`Touchline Studio running on http://${CFG.host}:${CFG.port}  (public address: ${CFG.base})`));
for(const sig of ['SIGINT','SIGTERM']) process.on(sig,()=>{server.close(); try{db.close()}catch(e){} process.exit(0)});
