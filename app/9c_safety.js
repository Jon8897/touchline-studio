/* ===== Safety & legal: report / feedback form, beta badge, updated-terms prompt ===== */
const CONTACT='hello@touchlinestudio.com';
const REPORT_TXT={
  feedback:['Send feedback','What’s working, what isn’t, what’s missing? Every message is read during the beta.','Your feedback'],
  concern:['Report a concern','Tell us what’s wrong with this page: something unsafe, offensive, illegal, or personal information that shouldn’t be there. We review every report.','What’s the problem?'],
  privacy:['Privacy request','Ask for a copy of your data, a correction, deletion, or raise a data protection complaint. We acknowledge within 30 days.','Your request']};
function openReport(kind='feedback',page){
  const T=REPORT_TXT[kind]||REPORT_TXT.feedback; let el=$('#repSheet'); if(el) el.remove();
  el=document.createElement('div'); el.className='sheet'; el.id='repSheet';
  el.innerHTML=`<div class="sheet-in pick" role="dialog" aria-modal="true" aria-labelledby="repH">
    <div class="sheet-head"><div><p class="eyebrow">${kind==='feedback'?'Beta':'Touchline Studio'}</p><h2 id="repH">${T[0]}</h2></div><button class="ib" data-repx aria-label="Close">✕</button></div>
    <div class="sheet-scroll"><p class="muted" style="margin:0 0 6px">${T[1]}</p>
      <label class="fl" for="repMsg">${T[2]}</label><textarea id="repMsg" rows="5" maxlength="4000"></textarea>
      ${SRV.on?'':`<label class="fl" for="repEmail">Your email (optional, so we can reply)</label><input id="repEmail" class="inp" type="email" maxlength="200" autocomplete="email">`}
      ${kind==='concern'?'<p class="hint">If a child is in immediate danger, call 999. For worries about a child in football, contact the club welfare officer or the FA safeguarding team.</p>':''}
      <div class="frow"><button class="btn" id="repGo">Send</button></div><p class="status" id="repSt" aria-live="polite"></p></div></div>`;
  document.body.appendChild(el); setTimeout(()=>$('#repMsg').focus(),50);
  const close=()=>el.remove();
  el.addEventListener('click',async e=>{
    if(e.target===el||e.target.closest('[data-repx]')) return close();
    if(e.target.closest('#repGo')){const st=$('#repSt'), msg=$('#repMsg').value.trim(); if(msg.length<3){st.className='status err'; st.textContent='Please write a short message.'; return}
      st.className='status'; st.textContent='Sending…'; $('#repGo').disabled=true;
      try{const r=await api('POST','/api/report',{kind,message:msg,page:page||location.href,email:($('#repEmail')||{}).value||''}); st.textContent=`Sent, thank you. Reference #${r.id}.`; setTimeout(close,1800)}
      catch(err){$('#repGo').disabled=false; st.className='status err'; st.innerHTML=/fetch|network|Failed|404|405|Server/i.test(err.message)?`Couldn’t send from here. Please email <a href="mailto:${CONTACT}">${CONTACT}</a>.`:esc(err.message)}}
  });
  el.addEventListener('keydown',e=>{if(e.key==='Escape') close()});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-report]'); if(!b) return; e.preventDefault(); openReport(b.dataset.report,b.dataset.page||location.href)});

function initSafety(){
  // beta badge doubles as the feedback button
  if(SRV.beta&&!$('#betaPill')){const b=document.createElement('button'); b.id='betaPill'; b.className='betapill'; b.dataset.report='feedback'; b.innerHTML='<span>Beta</span><i>Feedback</i>'; b.title='Touchline Studio is in beta. Send feedback'; $('.top .brand').after(b)}
  if(SRV.env&&SRV.env!=='production'&&!$('#envBar')){const d=document.createElement('div'); d.id='envBar'; d.className='envbar'; d.textContent=`${SRV.env.toUpperCase()} site: for testing only. Data here may be wiped.`; document.body.prepend(d)}
  // terms updated since this coach agreed (or never recorded): ask once
  if(SRV.termsVersion&&SRV.user&&SRV.user.termsVersion!==SRV.termsVersion){
    const el=document.createElement('div'); el.className='sheet'; el.id='termsSheet';
    el.innerHTML=`<div class="sheet-in pick" role="dialog" aria-modal="true" aria-labelledby="tmH"><div class="sheet-head"><div><p class="eyebrow">Please review</p><h2 id="tmH">${SRV.user.termsVersion?'We’ve updated our terms':'Before you carry on'}</h2></div></div>
      <div class="sheet-scroll"><p class="muted" style="margin:0 0 12px">Please read and agree to the <a href="/terms" target="_blank" rel="noopener">Terms of use</a> and <a href="/privacy" target="_blank" rel="noopener">Privacy policy</a> to keep using Touchline Studio.</p>
      <label class="check agree"><input type="checkbox" id="tmAgree"><span>I’m 18 or over and I agree to the Terms of use and Privacy policy.</span></label>
      <div class="frow"><button class="btn" id="tmGo">Continue</button><button class="btn ghost" id="tmOut">Log out</button></div><p class="status" id="tmSt"></p></div></div>`;
    document.body.appendChild(el);
    el.addEventListener('click',async e=>{
      if(e.target.closest('#tmOut')){try{await api('POST','/api/logout')}catch(err){} location.href='/'; return}
      if(e.target.closest('#tmGo')){if(!$('#tmAgree').checked){$('#tmSt').className='status err'; $('#tmSt').textContent='Please tick the box to agree.'; return}
        try{await api('POST','/api/account/terms',{agree:true}); SRV.user.termsVersion=SRV.termsVersion; SRV.user.termsAcceptedAt=Date.now(); el.remove()}catch(err){$('#tmSt').className='status err'; $('#tmSt').textContent=err.message}}
    });
  }
}
