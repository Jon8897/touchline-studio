'use strict';
const fs=require('node:fs'), path=require('node:path'), crypto=require('node:crypto');

/* ---------- config (.env file + environment) ---------- */
function loadEnv(file=path.join(__dirname,'.env')){
  if(!fs.existsSync(file)) return;
  for(const line of fs.readFileSync(file,'utf8').split(/\r?\n/)){
    const m=line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/); if(!m||line.trim().startsWith('#')) continue;
    let v=m[2]; if(/^(['"]).*\1$/.test(v)) v=v.slice(1,-1);
    if(process.env[m[1]]===undefined) process.env[m[1]]=v;
  }
}
loadEnv();
const CFG={
  port:+process.env.PORT||3000,
  host:process.env.HOST||'127.0.0.1',
  base:(process.env.BASE_URL||'http://localhost:3000').replace(/\/+$/,''),
  contact:(process.env.CONTACT_EMAIL||'').trim(),
  signupCode:process.env.SIGNUP_CODE||'',
  teamLimit:Math.max(1,+process.env.FREE_TEAM_LIMIT||3),
  maxAssistants:Math.max(1,+process.env.MAX_ASSISTANTS||10),
  dbPath:(process.env.DB_PATH||'').trim()||path.join(__dirname,'data','touchline.db'),
  adminEmail:(process.env.ADMIN_EMAIL||process.env.CONTACT_EMAIL||'').trim(),
  beta:!/^(0|false|no|off)$/i.test(process.env.BETA||'1'),
  termsVersion:(process.env.TERMS_VERSION||'2026-10').trim(),
  env:(process.env.APP_ENV||'production').trim(),
};
CFG.secure=CFG.base.startsWith('https://');

/* ---------- database ---------- */
const [maj,min]=process.versions.node.split('.').map(Number);
if(maj<22||(maj===22&&min<13)){console.error(`Touchline needs Node.js 22.13 or newer (you have ${process.version}).`); process.exit(1)}
const {DatabaseSync}=require('node:sqlite');
fs.mkdirSync(path.dirname(CFG.dbPath),{recursive:true});
const db=new DatabaseSync(CFG.dbPath);
db.exec(`
PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;
CREATE TABLE IF NOT EXISTS users(
  id TEXT PRIMARY KEY, email TEXT NOT NULL UNIQUE COLLATE NOCASE, name TEXT NOT NULL, pass TEXT NOT NULL,
  plan TEXT NOT NULL DEFAULT 'free',             -- billing later: 'free' | 'coach' ...
  max_teams INTEGER NOT NULL DEFAULT 3,          -- billing later: = paid team quantity
  billing_customer TEXT, billing_subscription TEXT, billing_status TEXT,
  created INTEGER NOT NULL, last_login INTEGER);
CREATE TABLE IF NOT EXISTS sessions(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS teams(id TEXT PRIMARY KEY, owner_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, name TEXT NOT NULL, color TEXT NOT NULL DEFAULT '#e7b53c', archived INTEGER NOT NULL DEFAULT 0, created INTEGER NOT NULL, updated INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS team_members(team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, role TEXT NOT NULL DEFAULT 'assistant', PRIMARY KEY(team_id,user_id));
CREATE TABLE IF NOT EXISTS user_store(user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, key TEXT NOT NULL, data TEXT NOT NULL, updated INTEGER NOT NULL, PRIMARY KEY(user_id,key));
CREATE TABLE IF NOT EXISTS team_drafts(team_id TEXT PRIMARY KEY REFERENCES teams(id) ON DELETE CASCADE, data TEXT NOT NULL, updated INTEGER NOT NULL);
CREATE TABLE IF NOT EXISTS weeks(id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE, title TEXT NOT NULL, data TEXT NOT NULL, draft TEXT, published INTEGER NOT NULL, updated INTEGER NOT NULL, views INTEGER NOT NULL DEFAULT 0);
CREATE INDEX IF NOT EXISTS weeks_team ON weeks(team_id, published DESC);
CREATE TABLE IF NOT EXISTS password_resets(token_hash TEXT PRIMARY KEY, user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created INTEGER NOT NULL, expires INTEGER NOT NULL, used INTEGER NOT NULL DEFAULT 0);
CREATE TABLE IF NOT EXISTS team_invites(id TEXT PRIMARY KEY, token_hash TEXT NOT NULL UNIQUE, team_id TEXT NOT NULL REFERENCES teams(id) ON DELETE CASCADE, email TEXT NOT NULL COLLATE NOCASE, invited_by TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE, created INTEGER NOT NULL, expires INTEGER NOT NULL, accepted_by TEXT, accepted INTEGER);
CREATE INDEX IF NOT EXISTS teams_owner ON teams(owner_id);
CREATE TABLE IF NOT EXISTS reports(id INTEGER PRIMARY KEY AUTOINCREMENT, kind TEXT NOT NULL, message TEXT NOT NULL, page TEXT, email TEXT, user_id TEXT, created INTEGER NOT NULL, done INTEGER);
`);
/* small migrations for databases made by earlier versions */
{const cols=db.prepare('PRAGMA table_info(users)').all().map(c=>c.name);
 if(!cols.includes('terms_accepted_at')) db.exec('ALTER TABLE users ADD COLUMN terms_accepted_at INTEGER');
 if(!cols.includes('terms_version')) db.exec('ALTER TABLE users ADD COLUMN terms_version TEXT');}
{const sc=db.prepare('PRAGMA table_info(sessions)').all().map(c=>c.name);
 if(!sc.includes('remember')) db.exec('ALTER TABLE sessions ADD COLUMN remember INTEGER NOT NULL DEFAULT 1');}

/* ---------- helpers ---------- */
const now=()=>Date.now();
const rid=(n=12)=>crypto.randomBytes(n).toString('base64url');
const SLUG_CHARS='abcdefghjkmnpqrstuvwxyz23456789';
const slug=(n=7)=>{const b=crypto.randomBytes(n); let s=''; for(const x of b) s+=SLUG_CHARS[x%SLUG_CHARS.length]; return s};
const sha=s=>crypto.createHash('sha256').update(s).digest('hex');
function hashPassword(pw){const salt=crypto.randomBytes(16); const h=crypto.scryptSync(pw,salt,64,{N:16384,r:8,p:1}); return `s1$${salt.toString('hex')}$${h.toString('hex')}`}
function verifyPassword(pw,stored){try{const [v,s,h]=stored.split('$'); if(v!=='s1') return false; const calc=crypto.scryptSync(pw,Buffer.from(s,'hex'),64,{N:16384,r:8,p:1}); const want=Buffer.from(h,'hex'); return want.length===calc.length&&crypto.timingSafeEqual(calc,want)}catch(e){return false}}
const validEmail=e=>typeof e==='string'&&e.length<=200&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);

module.exports={CFG,db,now,rid,slug,sha,hashPassword,verifyPassword,validEmail};
