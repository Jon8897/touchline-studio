'use strict';
/* Admin tasks from the VPS command line.
   node admin.js users                         list coaches
   node admin.js reset-password <email>        set a new temporary password
   node admin.js set-teams <email> <n>         change how many active teams a coach may have
   node admin.js delete-user <email>           remove a coach and all their data
   node admin.js stats                         totals
   node admin.js backup [file]                 safe copy of the database
   node admin.js test-email <address>          send a test email to check your email settings
   node admin.js teams <email>                 list a coach's teams and assistants
   node admin.js reports [all]                 feedback, concerns and privacy requests (open ones, or all)
   node admin.js report-done <id>              mark a report as dealt with
   node admin.js take-down <link or code>      remove a published player page (e.g. after a concern)
   node admin.js export-user <email>           write a coach's data to a file (for a data request by email)
   node admin.js inactive [months]             coaches who haven't logged in for a while (default 24 months) */
process.removeAllListeners('warning');
process.on('warning',w=>{if(w.name!=='ExperimentalWarning') console.warn(w)});
const crypto=require('node:crypto'), path=require('node:path');
const {db,hashPassword}=require('./lib');
const [cmd,...args]=process.argv.slice(2);
const user=email=>{const u=db.prepare('SELECT * FROM users WHERE email=?').get(String(email||'').toLowerCase()); if(!u){console.error('No coach with that email.'); process.exit(1)} return u};
const d=t=>t?new Date(t).toISOString().slice(0,16).replace('T',' '):'never';
switch(cmd){
  case 'users':{
    const rows=db.prepare(`SELECT u.*, (SELECT COUNT(*) FROM teams t WHERE t.owner_id=u.id AND t.archived=0) teams FROM users u ORDER BY created`).all();
    if(!rows.length) console.log('No coaches yet.');
    for(const u of rows) console.log(`${u.email.padEnd(32)} ${u.name.padEnd(22)} teams ${u.teams}/${u.max_teams}  plan ${u.plan.padEnd(6)} last login ${d(u.last_login)}`);
    break}
  case 'reset-password':{
    const u=user(args[0]); const pw=args[1]||crypto.randomBytes(6).toString('base64url');
    db.prepare('UPDATE users SET pass=? WHERE id=?').run(hashPassword(pw),u.id); db.prepare('DELETE FROM sessions WHERE user_id=?').run(u.id);
    console.log(`New password for ${u.email}: ${pw}\nAsk them to change it under Team week → Account.`); break}
  case 'set-teams':{
    const u=user(args[0]); const n=parseInt(args[1],10); if(!(n>=1)){console.error('Give a number of teams, e.g. 5'); process.exit(1)}
    db.prepare('UPDATE users SET max_teams=? WHERE id=?').run(n,u.id); console.log(`${u.email} can now have ${n} active team(s).`); break}
  case 'delete-user':{
    const u=user(args[0]); if(args[1]!=='--yes'){console.log(`This deletes ${u.email} and all their teams, drills and posts.\nRun again with --yes to confirm:  node admin.js delete-user ${u.email} --yes`); break}
    db.prepare('DELETE FROM users WHERE id=?').run(u.id); console.log('Deleted.'); break}
  case 'stats':{
    const c=t=>db.prepare(`SELECT COUNT(*) n FROM ${t}`).get().n;
    console.log(`Coaches ${c('users')} · Teams ${c('teams')} · Published weeks ${c('weeks')} · Player views ${db.prepare('SELECT COALESCE(SUM(views),0) n FROM weeks').get().n}`); break}
  case 'backup':{
    const file=args[0]||path.join(__dirname,'backups',`touchline-${new Date().toISOString().slice(0,10)}.db`);
    require('node:fs').mkdirSync(path.dirname(file),{recursive:true}); try{require('node:fs').unlinkSync(file)}catch(e){}
    db.exec(`VACUUM INTO '${file.replace(/'/g,"''")}'`); console.log('Backup written to '+file); break}
  case 'test-email':{
    const to=args[0]; if(!to){console.error('Give an email address: node admin.js test-email you@example.com'); process.exit(1)}
    const {sendMail,E,layout}=require('./mailer');
    console.log(`Sending with provider "${E.provider}" from ${E.from}…`);
    sendMail({to,subject:'Touchline Studio test email',...layout({title:'It works',intro:'Your Touchline Studio email settings are working.',paras:['Coaches will now get password reset links, invites and welcome emails.']})}).then(ok=>{console.log(ok?(E.provider==='console'?'Printed above (EMAIL_PROVIDER is console, so nothing was really sent).':'Sent. Check the inbox and spam folder.'):'Failed. See the error above.'); process.exit(ok?0:1)}); break}
  case 'teams':{
    const u=user(args[0]);
    for(const t of db.prepare('SELECT * FROM teams WHERE owner_id=? ORDER BY archived, created').all(u.id)){
      const m=db.prepare('SELECT u.name,u.email FROM team_members tm JOIN users u ON u.id=tm.user_id WHERE tm.team_id=?').all(t.id);
      console.log(`${t.name}${t.archived?' (archived)':''}: ${m.length?m.map(x=>`${x.name} <${x.email}>`).join(', '):'no assistants'}`)}
    for(const t of db.prepare('SELECT t.name, o.email owner FROM team_members tm JOIN teams t ON t.id=tm.team_id JOIN users o ON o.id=t.owner_id WHERE tm.user_id=?').all(u.id)) console.log(`${t.name}: assistant (head coach ${t.owner})`);
    break}
  case 'reports':{
    const rows=db.prepare(`SELECT * FROM reports ${args[0]==='all'?'':'WHERE done IS NULL'} ORDER BY created`).all();
    if(!rows.length) console.log(args[0]==='all'?'No reports yet.':'No open reports.');
    for(const r of rows){const age=Math.floor((Date.now()-r.created)/864e5); console.log(`#${r.id} ${r.kind.toUpperCase()} ${d(r.created)} (${age} days old${!r.done&&age>=21?' - REPLY SOON, 30-day limit':''})${r.done?' done':''}\n   from: ${r.email||'not given'}   page: ${r.page||'-'}\n   ${r.message.replace(/\n/g,'\n   ')}\n`)}
    break}
  case 'report-done':{const r=db.prepare('UPDATE reports SET done=? WHERE id=?').run(Date.now(),+args[0]); console.log(r.changes?'Marked as done.':'No report with that number.'); break}
  case 'take-down':{
    const code=String(args[0]||'').replace(/\/+$/,'').split('/').pop(); const w=db.prepare('SELECT w.slug,w.title,t.name team,u.email FROM weeks w JOIN teams t ON t.id=w.team_id JOIN users u ON u.id=t.owner_id WHERE w.slug=?').get(code);
    if(!w){console.error('No published page with that link.'); process.exit(1)}
    if(args[1]!=='--yes'){console.log(`This removes "${w.title}" (${w.team}, coach ${w.email}). Run again with --yes to confirm.`); break}
    db.prepare('DELETE FROM weeks WHERE slug=?').run(w.slug); console.log('Removed. Let the coach know why.'); break}
  case 'export-user':{
    const u=user(args[0]); const J=s=>{try{return JSON.parse(s)}catch(e){return null}};
    const out={exported:new Date().toISOString(),account:{name:u.name,email:u.email,created:new Date(u.created).toISOString(),termsAccepted:u.terms_accepted_at?new Date(u.terms_accepted_at).toISOString():null},
      teams:db.prepare('SELECT * FROM teams WHERE owner_id=?').all(u.id).map(t=>({name:t.name,draft:J((db.prepare('SELECT data FROM team_drafts WHERE team_id=?').get(t.id)||{}).data),weeks:db.prepare('SELECT slug,title,data FROM weeks WHERE team_id=?').all(t.id).map(w=>({...w,data:J(w.data)}))})),
      library:Object.fromEntries(db.prepare('SELECT key,data FROM user_store WHERE user_id=?').all(u.id).map(r=>[r.key,J(r.data)]))};
    const file=path.join(__dirname,'backups',`export-${u.email.replace(/[^a-z0-9]+/gi,'_')}.json`); require('node:fs').mkdirSync(path.dirname(file),{recursive:true});
    require('node:fs').writeFileSync(file,JSON.stringify(out,null,2)); console.log('Written to '+file+'\nEmail it to them, then delete the file.'); break}
  case 'inactive':{
    const m=+(args[0]||24), cut=Date.now()-m*30.44*864e5;
    const rows=db.prepare('SELECT email,name,created,last_login FROM users WHERE COALESCE(last_login,created)<? ORDER BY COALESCE(last_login,created)').all(cut);
    if(!rows.length) console.log(`No coaches inactive for ${m}+ months.`);
    for(const u of rows) console.log(`${u.email.padEnd(32)} ${u.name.padEnd(22)} last login ${d(u.last_login||u.created)}`);
    if(rows.length) console.log(`\nEmail them, wait 30 days, then remove with: node admin.js delete-user <email> --yes`); break}
  default: console.log(require('node:fs').readFileSync(__filename,'utf8').split('\n').slice(1,15).join('\n').replace(/^\/\*|\*\/$/g,''));
}
