'use strict';
/* Email sending with no npm packages.
   EMAIL_PROVIDER = console (default: prints emails to the server log)
                  | resend   (RESEND_API_KEY)
                  | postmark (POSTMARK_TOKEN)
                  | smtp     (SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_SECURE) */
const net=require('node:net'), tls=require('node:tls'), crypto=require('node:crypto'), os=require('node:os');
const {CFG}=require('./lib');

const E={
  provider:(process.env.EMAIL_PROVIDER||'console').toLowerCase(),
  from:process.env.EMAIL_FROM||'Touchline Studio <no-reply@localhost>',
  replyTo:process.env.EMAIL_REPLY_TO||'',
  resendKey:process.env.RESEND_API_KEY||'',
  postmarkToken:process.env.POSTMARK_TOKEN||'',
  smtp:{host:process.env.SMTP_HOST||'',port:+process.env.SMTP_PORT||587,user:process.env.SMTP_USER||'',pass:process.env.SMTP_PASS||'',secure:/^(1|true|yes)$/i.test(process.env.SMTP_SECURE||'')||(+process.env.SMTP_PORT===465)}
};
const addrOf=s=>{const m=String(s).match(/<([^>]+)>/); return (m?m[1]:String(s)).trim()};

/* ---------- branded layout ---------- */
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function layout({title,intro,paras=[],cta,ctaUrl,foot}){
  const html=`<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title></head>
<body style="margin:0;padding:0;background:#f2f4f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;color:#17201d">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f3;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:14px;overflow:hidden">
<tr><td style="background:#0b0f0e;padding:18px 24px"><span style="font-weight:800;letter-spacing:2px;color:#ffffff;font-size:16px">TOUCHLINE</span> <span style="font-weight:700;letter-spacing:3px;color:#e7b53c;font-size:11px">STUDIO</span></td></tr>
<tr><td style="padding:28px 24px 8px"><h1 style="margin:0 0 12px;font-size:22px;line-height:1.25;color:#0b0f0e">${esc(title)}</h1>
<p style="margin:0 0 14px;font-size:16px;line-height:1.5">${esc(intro)}</p>
${paras.map(p=>`<p style="margin:0 0 14px;font-size:15px;line-height:1.5;color:#3b4744">${esc(p)}</p>`).join('')}
${cta?`<p style="margin:22px 0 10px"><a href="${esc(ctaUrl)}" style="display:inline-block;background:#e7b53c;color:#2b1e04;text-decoration:none;font-weight:800;letter-spacing:1px;padding:13px 22px;border-radius:999px;font-size:14px;text-transform:uppercase">${esc(cta)}</a></p>
<p style="margin:0 0 14px;font-size:12px;line-height:1.5;color:#6b7774;word-break:break-all">Or copy this link: ${esc(ctaUrl)}</p>`:''}
</td></tr>
<tr><td style="padding:14px 24px 22px;font-size:12px;line-height:1.5;color:#6b7774;border-top:1px solid #e6eae8">${esc(foot||'You’re receiving this because of your Touchline Studio account.')}</td></tr>
</table></td></tr></table></body></html>`;
  const text=[title,'',intro,'',...paras.flatMap(p=>[p,'']),...(cta?[`${cta}: ${ctaUrl}`,'']:[]),'-',foot||'Touchline Studio'].join('\n');
  return {html,text};
}

/* ---------- providers ---------- */
async function viaResend(m){
  const r=await fetch('https://api.resend.com/emails',{method:'POST',headers:{'Authorization':`Bearer ${E.resendKey}`,'Content-Type':'application/json'},
    body:JSON.stringify({from:E.from,to:[m.to],subject:m.subject,html:m.html,text:m.text,...(E.replyTo?{reply_to:E.replyTo}:{})})});
  if(!r.ok) throw new Error(`Resend ${r.status}: ${(await r.text()).slice(0,300)}`);
}
async function viaPostmark(m){
  const r=await fetch('https://api.postmarkapp.com/email',{method:'POST',headers:{'X-Postmark-Server-Token':E.postmarkToken,'Content-Type':'application/json','Accept':'application/json'},
    body:JSON.stringify({From:E.from,To:m.to,Subject:m.subject,HtmlBody:m.html,TextBody:m.text,MessageStream:'outbound',...(E.replyTo?{ReplyTo:E.replyTo}:{})})});
  if(!r.ok) throw new Error(`Postmark ${r.status}: ${(await r.text()).slice(0,300)}`);
}
const b64=s=>Buffer.from(s,'utf8').toString('base64');
const wrap76=s=>s.replace(/.{1,76}/g,x=>x+'\r\n');
const hdr=s=>/^[\x20-\x7e]*$/.test(s)?s:`=?UTF-8?B?${b64(s)}?=`;
function mime(m){
  const boundary='tls_'+crypto.randomBytes(12).toString('hex'), domain=addrOf(E.from).split('@')[1]||'localhost';
  const fromName=String(E.from).match(/^\s*"?([^"<]*?)"?\s*</); const fromHdr=fromName&&fromName[1]?`${hdr(fromName[1])} <${addrOf(E.from)}>`:addrOf(E.from);
  return [`From: ${fromHdr}`,`To: <${m.to}>`,`Subject: ${hdr(m.subject)}`,`Date: ${new Date().toUTCString()}`,`Message-ID: <${crypto.randomUUID()}@${domain}>`,
    ...(E.replyTo?[`Reply-To: ${E.replyTo}`]:[]),'MIME-Version: 1.0',`Content-Type: multipart/alternative; boundary="${boundary}"`,'',
    `--${boundary}`,'Content-Type: text/plain; charset=utf-8','Content-Transfer-Encoding: base64','',wrap76(b64(m.text)),
    `--${boundary}`,'Content-Type: text/html; charset=utf-8','Content-Transfer-Encoding: base64','',wrap76(b64(m.html)),`--${boundary}--`,''].join('\r\n');
}
function smtpConn(sock){
  let buf='', waiting=null, failed=null;
  const feed=d=>{buf+=d; check()};
  const check=()=>{if(!waiting) return; const m=buf.match(/(?:^|\r\n)(\d{3}) [^\r\n]*\r\n/); if(!m) return; const end=m.index+m[0].length; const text=buf.slice(0,end); buf=buf.slice(end); const w=waiting; waiting=null; w.res({code:+m[1],text})};
  const attach=s=>{s.setEncoding('utf8'); s.on('data',feed); s.on('error',e=>{failed=e; if(waiting){const w=waiting; waiting=null; w.rej(e)}}); s.on('close',()=>{if(waiting){const w=waiting; waiting=null; w.rej(new Error('SMTP connection closed'))}})};
  attach(sock);
  const api={sock,
    read(){return new Promise((res,rej)=>{if(failed) return rej(failed); waiting={res,rej}; check()})},
    async cmd(line,expect){if(line!=null) api.sock.write(line+'\r\n'); const r=await api.read(); if(expect&&!expect.includes(r.code)) throw new Error(`SMTP ${line?line.split(' ')[0]:'greeting'} failed: ${r.text.trim().slice(0,200)}`); return r},
    upgrade(host){return new Promise((res,rej)=>{const s=tls.connect({socket:api.sock,servername:host},()=>{api.sock=s; attach(s); res()}); s.once('error',rej)})}};
  return api;
}
async function viaSmtp(m){
  const S=E.smtp; if(!S.host) throw new Error('SMTP_HOST is not set');
  const sock=await new Promise((res,rej)=>{const s=S.secure?tls.connect({host:S.host,port:S.port,servername:S.host},()=>res(s)):net.connect({host:S.host,port:S.port},()=>res(s)); s.once('error',rej); s.setTimeout(30000,()=>s.destroy(new Error('SMTP timeout')))});
  const c=smtpConn(sock); const me=os.hostname()||'localhost';
  try{
    await c.cmd(null,[220]);
    let ehlo=await c.cmd(`EHLO ${me}`,[250]);
    if(!S.secure&&/STARTTLS/i.test(ehlo.text)){await c.cmd('STARTTLS',[220]); await c.upgrade(S.host); ehlo=await c.cmd(`EHLO ${me}`,[250])}
    if(S.user){
      if(/AUTH[^\r\n]*PLAIN/i.test(ehlo.text)) await c.cmd('AUTH PLAIN '+Buffer.from(`\0${S.user}\0${S.pass}`).toString('base64'),[235]);
      else {await c.cmd('AUTH LOGIN',[334]); await c.cmd(b64(S.user),[334]); await c.cmd(b64(S.pass),[235])}
    }
    await c.cmd(`MAIL FROM:<${addrOf(E.from)}>`,[250]);
    await c.cmd(`RCPT TO:<${m.to}>`,[250,251]);
    await c.cmd('DATA',[354]);
    const body=mime(m).replace(/\r\n\./g,'\r\n..');
    await c.cmd(body+'\r\n.',[250]);
    c.sock.write('QUIT\r\n');
  } finally { setTimeout(()=>{try{c.sock.destroy()}catch(e){}},500) }
}
async function sendMail(m){
  try{
    if(E.provider==='resend') await viaResend(m);
    else if(E.provider==='postmark') await viaPostmark(m);
    else if(E.provider==='smtp') await viaSmtp(m);
    else {console.log(`\n[email → ${m.to}] ${m.subject}\n${m.text}\n`); return true}
    return true;
  }catch(err){console.error(`Email to ${m.to} failed:`,err.message); return false}
}

/* ---------- messages ---------- */
const app=CFG.base+'/app';
const Mail={
  welcome:(to,name)=>sendMail({to,subject:'Welcome to Touchline Studio',...layout({title:`Welcome, ${name}`,intro:'Your coach account is ready.',paras:['Plan tactics, build training sessions and send your players a link with the week’s plan. Players never need an account.','Add your teams under Team week. You can invite assistant coaches to each team too.'],cta:'Open Touchline Studio',ctaUrl:app})}),
  reset:(to,name,link)=>sendMail({to,subject:'Reset your Touchline Studio password',...layout({title:'Reset your password',intro:`Hi ${name}, we got a request to reset your password.`,paras:['This link works for 1 hour and can only be used once.'],cta:'Choose a new password',ctaUrl:link,foot:'If you didn’t ask for this, you can ignore this email: your password won’t change.'})}),
  passwordChanged:(to,name)=>sendMail({to,subject:'Your Touchline Studio password was changed',...layout({title:'Password changed',intro:`Hi ${name}, the password for your account was just changed.`,paras:['If this was you, there’s nothing else to do.','If it wasn’t, reset your password straight away using “Forgot password?” on the login page, and tell the person who runs your Touchline Studio.'],cta:'Go to login',ctaUrl:app})}),
  invite:(to,inviter,team,link)=>sendMail({to,subject:`${inviter} invited you to coach ${team}`,...layout({title:`Help coach ${team}`,intro:`${inviter} has invited you to be an assistant coach for ${team} on Touchline Studio.`,paras:['You’ll be able to build the weekly plan with them and send it to the players. It’s free, and players don’t need an account.','The invite link works for 14 days.'],cta:'Accept the invite',ctaUrl:link,foot:'If you weren’t expecting this, you can ignore it.'})}),
  added:(to,name,team,owner)=>sendMail({to,subject:`You’re now a coach for ${team}`,...layout({title:`You’re on the coaching team`,intro:`Hi ${name}, you’ve joined ${team} as an assistant coach with ${owner}.`,paras:['Open Team week and pick the team to see and edit this week’s plan.'],cta:'Open Team week',ctaUrl:app+'#week'})}),
  deleted:(to,name)=>sendMail({to,subject:'Your Touchline Studio account was deleted',...layout({title:'Account deleted',intro:`Hi ${name}, your Touchline Studio account and the teams you ran have been deleted.`,paras:['Your player links have stopped working. Copies in our backups are removed automatically within 14 days.','If you didn’t do this, reply to this email straight away.']})}),
  report:(to,r)=>sendMail({to,subject:`[Touchline ${r.kind}] ${r.message.slice(0,60)}`,...layout({title:`New ${r.kind} #${r.id}`,intro:r.message,paras:[`Page: ${r.page||'-'}`,`From: ${r.email||'not given'}${r.userEmail?` (coach account ${r.userEmail})`:''}`,'Reply within 30 days. List open items with: node admin.js reports']})}),
  reportAck:(to,r)=>sendMail({to,subject:'We’ve received your message',...layout({title:'Thanks, we’ve got it',intro:`We’ve received your ${r.kind==='feedback'?'feedback':'message'} (reference #${r.id}).`,paras:[r.kind==='feedback'?'We read every message during the beta.':'We’ll look into it and reply as soon as we can, and within 30 days at the latest.']})}),
  planStarted:(to,name,trialEnd)=>sendMail({to,subject:'Your Touchline Studio plan is active',...layout({title:'You’re all set',intro:`Hi ${name}, thanks for subscribing to Touchline Studio.`,paras:[trialEnd?`Your free trial runs until ${trialEnd.toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}. You won’t be charged if you cancel before then.`:'Your plan is active now.','You can change or cancel any time under Team week → Plan & billing. If you cancel, you keep access until the end of the period you’ve paid for.'],cta:'Open Touchline Studio',ctaUrl:app+'#week'})}),
  paymentFailed:(to,name)=>sendMail({to,subject:'Your Touchline Studio payment didn’t go through',...layout({title:'Payment problem',intro:`Hi ${name}, we couldn’t take your latest payment.`,paras:['Please update your card under Team week → Plan & billing → Manage billing. We’ll try again over the next few days. If payment still fails, your account moves to the Free plan; nothing is deleted.'],cta:'Update payment details',ctaUrl:app+'#week'})}),
  planEnded:(to,name)=>sendMail({to,subject:'Your Touchline Studio plan has ended',...layout({title:'Your plan has ended',intro:`Hi ${name}, your paid plan has ended and your account is now on the Free plan.`,paras:['All your teams, sessions and drills are still there. On the Free plan you can run 1 team with one weekly link live at a time.','You can subscribe again any time under Team week → Plan & billing.'],cta:'Open Touchline Studio',ctaUrl:app+'#week'})}),
};
module.exports={sendMail,Mail,E,layout};
