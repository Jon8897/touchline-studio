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
   node admin.js inactive [months]             coaches who haven't logged in for a while (default 24 months)
   node admin.js stripe-setup                  create the Stripe products, prices, founder coupon, billing portal and webhook (prints the settings to copy into .env)
   node admin.js comp <email> [months] [teams] give a coach free access (demo / partner accounts); months 0 removes it
   node admin.js founders [--mark-all]         list founding coaches, or mark everyone who has signed up so far
   node admin.js billing <email>               a coach's plan and Stripe status */
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
    const finish=()=>{db.prepare('DELETE FROM users WHERE id=?').run(u.id); console.log('Deleted.')};
    if(u.billing_subscription&&['active','trialing','past_due','unpaid','incomplete'].includes(u.billing_status)){
      require('./billing').stripe('DELETE',`/v1/subscriptions/${encodeURIComponent(u.billing_subscription)}`).then(()=>{console.log('Stripe subscription cancelled.'); finish()}).catch(e=>{console.error('Could not cancel their Stripe subscription ('+e.message+'). Nothing deleted.'); process.exit(1)});
    } else finish(); break}
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
  case 'stripe-setup':{
    const {stripe,B}=require('./billing'); const {CFG}=require('./lib');
    if(!B.key){console.error('Set STRIPE_SECRET_KEY in .env first (sk_test_... on staging, sk_live_... on production).'); process.exit(1)}
    (async()=>{
      const mode=B.liveMode?'LIVE':'TEST'; console.log(`Creating Touchline Studio products in Stripe ${mode} mode…`);
      const prod=(name,desc)=>stripe('POST','/v1/products',{name,description:desc,metadata:{app:'touchline'}});
      const price=(product,amount,interval,nick)=>stripe('POST','/v1/prices',{product,unit_amount:amount,currency:'gbp',recurring:{interval},nickname:nick,tax_behavior:'inclusive',metadata:{app:'touchline'}});
      const coach=await prod('Touchline Studio Coach','1 team, unlimited weekly links, assistant coaches');
      const club=await prod('Touchline Studio Club','Up to 12 teams for a club');
      const extra=await prod('Touchline Studio extra team','One more active team on the Coach plan');
      const p={COACH_MONTHLY:await price(coach.id,499,'month','Coach monthly'),COACH_YEARLY:await price(coach.id,3900,'year','Coach yearly'),CLUB_MONTHLY:await price(club.id,1999,'month','Club monthly'),
        EXTRA_TEAM_MONTHLY:await price(extra.id,200,'month','Extra team monthly'),EXTRA_TEAM_YEARLY:await price(extra.id,2000,'year','Extra team yearly')};
      const coupon=await stripe('POST','/v1/coupons',{percent_off:50,duration:'forever',name:'Founding coach: half price for life',metadata:{app:'touchline'}});
      const portal=await stripe('POST','/v1/billing_portal/configurations',{business_profile:{headline:'Touchline Studio: manage your plan',privacy_policy_url:CFG.base+'/privacy',terms_of_service_url:CFG.base+'/terms'},
        features:{customer_update:{enabled:true,allowed_updates:['email','address']},invoice_history:{enabled:true},payment_method_update:{enabled:true},
          subscription_cancel:{enabled:true,mode:'at_period_end',cancellation_reason:{enabled:true,options:['too_expensive','missing_features','unused','other']}},
          subscription_update:{enabled:true,default_allowed_updates:['price'],proration_behavior:'create_prorations',products:[{product:coach.id,prices:[p.COACH_MONTHLY.id,p.COACH_YEARLY.id]},{product:club.id,prices:[p.CLUB_MONTHLY.id]}]}}});
      const hook=await stripe('POST','/v1/webhook_endpoints',{url:CFG.base+'/api/webhooks/stripe',description:'Touchline Studio ('+CFG.env+')',
        enabled_events:['checkout.session.completed','customer.subscription.created','customer.subscription.updated','customer.subscription.deleted','customer.subscription.paused','customer.subscription.resumed','invoice.paid','invoice.payment_succeeded','invoice.payment_failed']});
      console.log(`\nDone. Add these lines to this site's .env, then restart it:\n`);
      for(const [k,v] of Object.entries(p)) console.log(`STRIPE_PRICE_${k}=${v.id}`);
      console.log(`STRIPE_FOUNDER_COUPON=${coupon.id}\nSTRIPE_PORTAL_CONFIG=${portal.id}\nSTRIPE_WEBHOOK_SECRET=${hook.secret}\nPAYMENTS=on`);
      console.log(`\nWebhook sends to ${hook.url}. Run this once on staging (test keys) and once on production (live keys).`);
    })().catch(e=>{console.error('Stripe said: '+e.message); process.exit(1)}); break}
  case 'comp':{
    const u=user(args[0]); const months=args[1]===undefined?12:+args[1]; const teams=args[2]?Math.max(1,+args[2]):Math.max(u.max_teams||3,3);
    const until=months>0?Date.now()+months*30.44*864e5:null;
    db.prepare('UPDATE users SET comp_until=?, max_teams=? WHERE id=?').run(until,teams,u.id);
    console.log(until?`${u.email} has free access with ${teams} teams until ${d(until)}.`:`Free access removed for ${u.email}.`); break}
  case 'founders':{
    if(args[0]==='--mark-all'){const r=db.prepare('UPDATE users SET founder=1 WHERE founder=0').run(); console.log(`${r.changes} coach(es) marked as founding coaches. They get the founder discount at checkout${process.env.FOUNDER_GRACE_UNTIL?` and keep full access until ${process.env.FOUNDER_GRACE_UNTIL}`:''}.`); break}
    const rows=db.prepare('SELECT email,name,created,plan,billing_status FROM users WHERE founder=1 ORDER BY created').all();
    if(!rows.length) console.log('No founding coaches yet. Mark everyone so far with: node admin.js founders --mark-all');
    for(const u of rows) console.log(`${u.email.padEnd(32)} ${u.name.padEnd(22)} joined ${d(u.created)}  ${u.plan}${u.billing_status?' / '+u.billing_status:''}`); break}
  case 'billing':{
    const u=user(args[0]); const {entitlements}=require('./billing'); const e=entitlements(u);
    console.log(`${u.email}\n  access:   ${e.label}  (${Number.isFinite(e.teams)?e.teams:'∞'} teams, ${Number.isFinite(e.weeksPerTeam)?e.weeksPerTeam:'unlimited'} live weeks per team, assistants ${e.assistants?'yes':'no'})`);
    console.log(`  stripe:   customer ${u.billing_customer||'-'}  subscription ${u.billing_subscription||'-'}  status ${u.billing_status||'-'}`);
    console.log(`  plan:     ${u.plan}${u.billing_interval?' ('+u.billing_interval+'ly)':''}  extra teams ${u.extra_teams||0}  renews/ends ${u.period_end?d(u.period_end):'-'}${u.cancel_at_end?'  CANCELS AT PERIOD END':''}  trial end ${u.trial_end?d(u.trial_end):'-'}`);
    console.log(`  founder:  ${u.founder?'yes':'no'}   complimentary until: ${u.comp_until?d(u.comp_until):'-'}`); break}
  default: console.log(require('node:fs').readFileSync(__filename,'utf8').split('\n').slice(1,19).join('\n').replace(/^\/\*|\*\/$/g,''));
}
