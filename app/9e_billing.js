/* ===== Plan & billing (server mode with PAYMENTS=on) =====
   The server decides what each plan allows; this only shows it and sends coaches to Stripe. */
let BILL = null;
const fmtDay = ms => ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
async function loadBilling() { try { BILL = await api('GET', '/api/billing'); } catch (e) { BILL = null; } return BILL; }

function billingCard() {
  if (!SRV.on || !SRV.plan || !SRV.plan.payments) return '';
  if (!BILL) { loadBilling().then(() => { const c = $('#billCard'); if (c) c.outerHTML = billingCard(); }); return '<div class="card" id="billCard"><h3>Plan &amp; billing</h3><p class="muted">Loading…</p></div>'; }
  const B = BILL, S = B.subscription, live = S && ['active', 'trialing', 'past_due'].includes(S.status);
  const planName = B.plan === 'coach' ? `Coach${S && S.interval ? (S.interval === 'year' ? ' (yearly)' : ' (monthly)') : ''}` : B.plan === 'club' ? 'Club' : B.label;
  const limits = `${B.teams} team${B.teams === 1 ? '' : 's'} · ${B.weeksPerTeam ? 'one weekly link live per team' : 'unlimited weekly links'} · ${B.assistants ? 'assistant coaches' : 'no assistant coaches'}`;
  let status = '';
  if (live && S.status === 'trialing') status = `Free trial until <b>${fmtDay(S.trialEnd)}</b>. ${S.cancelAtPeriodEnd ? 'Cancelled: you won’t be charged.' : 'Your first payment is taken then.'}`;
  else if (live && S.status === 'past_due') status = `<span class="err">Your last payment failed.</span> Update your card in Manage billing to keep your plan.`;
  else if (live && S.cancelAtPeriodEnd) status = `Cancelled. You keep everything until <b>${fmtDay(S.periodEnd)}</b>, then move to the Free plan.`;
  else if (live) status = `Renews on <b>${fmtDay(S.periodEnd)}</b>.`;
  else if (B.plan === 'founder') status = `As a founding coach you have full access until <b>${fmtDay(B.until)}</b>, and half price for life when you subscribe.`;
  else if (B.plan === 'comp') status = `Complimentary access until <b>${fmtDay(B.until)}</b>.`;
  return `<div class="card billcard" id="billCard">
    <div class="sshead"><h3>Plan &amp; billing</h3>${B.testMode ? '<span class="tag md">TEST MODE</span>' : ''}</div>
    <p class="billplan"><b>${esc(planName)}</b><small>${limits}${B.teamsUsed != null ? ` · using ${B.teamsUsed}` : ''}</small></p>
    ${status ? `<p class="muted" style="margin:6px 0 0">${status}</p>` : ''}
    ${live && S.plan === 'coach' ? `<div class="frow" style="align-items:end"><div style="flex:1;min-width:150px"><label class="fl" for="biExtra">Extra teams (${esc(B.prices.extra[S.interval === 'year' ? 'yearly' : 'monthly'])} each)</label><input id="biExtra" class="inp" type="number" min="0" max="20" value="${S.extraTeams}"></div><button class="btn ghost" id="biExtraGo">Update</button></div>` : ''}
    <div class="frow">
      ${!live ? `<button class="btn" data-upgrade>${B.trialDays ? `Start ${B.trialDays}-day free trial` : 'Choose a plan'}</button>` : ''}
      ${S || live ? '<button class="btn ghost" id="biPortal">Manage billing</button>' : ''}
      ${live && !S.cancelAtPeriodEnd ? '<button class="btn ghost danger" id="biCancel">Cancel plan</button>' : ''}
      ${live && S.cancelAtPeriodEnd ? '<button class="btn ghost" id="biResume">Keep my plan</button>' : ''}
    </div>
    <p class="hint">Payments are handled securely by Stripe. Cancel any time and keep access until the end of the period you’ve paid for. <a href="/refunds" target="_blank" rel="noopener">Refund policy</a></p>
  </div>`;
}
function rerenderBilling() { const c = $('#billCard'); if (c) c.outerHTML = billingCard(); }
async function refreshPlan() {
  await loadBilling();
  try { const b = await api('GET', '/api/bootstrap'); SRV.plan = b.plan; SRV.limit = b.teamLimit; SRV.teams = b.teams || SRV.teams; } catch (e) {}
  if (!$('#v-week').hidden) renderWeek(); planBanner();
}

/* upgrade sheet */
function openUpgrade(reason) {
  if (!SRV.on || !SRV.plan || !SRV.plan.payments) return;
  const go = async () => {
    if (!BILL) await loadBilling(); const B = BILL; if (!B) { toast('Couldn’t load plans. Try again.'); return; }
    if (B.subscription && ['active', 'trialing', 'past_due'].includes(B.subscription.status)) { toast(reason || 'Change your plan in Manage billing'); show('week'); setTimeout(() => $('#billCard') && $('#billCard').scrollIntoView({ behavior: 'smooth', block: 'center' }), 200); return; }
    let el = $('#upSheet'); if (el) el.remove();
    el = document.createElement('div'); el.className = 'sheet'; el.id = 'upSheet';
    const trial = B.trialDays, founder = B.founder;
    const opt = (v, name, price, perks, on) => `<label class="upopt"><input type="radio" name="upPlan" value="${v}"${on ? ' checked' : ''}><span><b>${name}</b><em>${price}${founder ? ' <i>half price for founding coaches</i>' : ''}</em><small>${perks}</small></span></label>`;
    el.innerHTML = `<div class="sheet-in pick" role="dialog" aria-modal="true" aria-labelledby="upH">
      <div class="sheet-head"><div><p class="eyebrow">${reason ? esc(reason) : 'Upgrade'}</p><h2 id="upH">${trial ? `Try it free for ${trial} days` : 'Choose your plan'}</h2></div><button class="ib" data-upx aria-label="Close">✕</button></div>
      <div class="sheet-scroll">
        <div class="upopts">
          ${opt('coach_monthly', 'Coach, monthly', B.prices.coach.monthly, 'Unlimited weekly links, assistant coaches, 1 team (add more for ' + esc(B.prices.extra.monthly) + ' each)', true)}
          ${opt('coach_yearly', 'Coach, yearly', B.prices.coach.yearly, 'Same as monthly, about 35% cheaper. Extra teams ' + esc(B.prices.extra.yearly) + ' each')}
          ${opt('club_monthly', 'Club', B.prices.club.monthly, 'Up to 12 teams for your club, assistant coaches on every team')}
        </div>
        <div id="upExtraRow"><label class="fl" for="upExtra">Extra teams (optional)</label><input id="upExtra" class="inp" type="number" min="0" max="20" value="${Math.max(0, (B.teamsUsed || 1) - 1)}" style="max-width:120px"></div>
        <label class="check agree"><input type="checkbox" id="upConsent"><span>I want my plan to start now. I agree to the <a href="/terms" target="_blank" rel="noopener">Terms</a> and <a href="/refunds" target="_blank" rel="noopener">Refund policy</a>, and understand it renews automatically until I cancel.${trial ? ` I won’t be charged if I cancel in the ${trial}-day free trial.` : ''}</span></label>
        <div class="frow"><button class="btn" id="upGo">Continue to secure payment</button></div>
        <p class="status" id="upSt" aria-live="polite"></p>
        <p class="hint">You’ll enter your card on Stripe’s secure page. ${trial ? 'Nothing is charged until the trial ends. ' : ''}Cancel any time under Team week → Plan &amp; billing.</p>
      </div></div>`;
    document.body.appendChild(el);
    const sync = () => { $('#upExtraRow').hidden = !String((el.querySelector('input[name=upPlan]:checked') || {}).value).startsWith('coach'); };
    el.addEventListener('change', sync); sync();
    el.addEventListener('click', async e => {
      if (e.target === el || e.target.closest('[data-upx]')) return el.remove();
      if (e.target.closest('#upGo')) {
        const st = $('#upSt'); if (!$('#upConsent').checked) { st.className = 'status err'; st.textContent = 'Please tick the box to continue.'; return; }
        st.className = 'status'; st.textContent = 'Opening secure checkout…'; $('#upGo').disabled = true;
        try { const r = await api('POST', '/api/billing/checkout', { plan: el.querySelector('input[name=upPlan]:checked').value, extraTeams: +$('#upExtra').value || 0, consent: true }); location.href = r.url; }
        catch (err) { st.className = 'status err'; st.textContent = err.message; $('#upGo').disabled = false; }
      }
    });
  };
  go();
}
function planBanner() {
  let b = $('#planBar'); const pd = SRV.on && SRV.plan && SRV.plan.pastDue;
  if (!pd) { if (b) b.remove(); return; }
  if (!b) { b = document.createElement('div'); b.id = 'planBar'; b.className = 'envbar'; document.body.prepend(b); }
  b.innerHTML = 'Your last payment failed. <button class="link" id="pbFix" style="color:#fff">Update your card</button> to keep your plan.';
}
function initBilling() {
  window.addEventListener('tls:limit', e => openUpgrade(e.detail && e.detail.error));
  document.addEventListener('click', async e => {
    if (e.target.closest('[data-upgrade]')) { e.preventDefault(); openUpgrade(); return; }
    const portal = e.target.closest('#biPortal') || e.target.closest('#pbFix');
    if (portal) { portal.disabled = true; try { const r = await api('POST', '/api/billing/portal'); location.href = r.url; } catch (err) { toast(err.message); portal.disabled = false; } return; }
    const cn = e.target.closest('#biCancel');
    if (cn) { if (!cn.dataset.sure) { cn.dataset.sure = '1'; cn.textContent = 'Tap again to cancel'; return; } try { BILL = await api('POST', '/api/billing/cancel'); rerenderBilling(); toast('Plan cancelled. You keep access until the end of this period.'); } catch (err) { toast(err.message); } return; }
    if (e.target.closest('#biResume')) { try { BILL = await api('POST', '/api/billing/resume'); rerenderBilling(); toast('Great, your plan will carry on'); } catch (err) { toast(err.message); } return; }
    if (e.target.closest('#biExtraGo')) { try { BILL = await api('POST', '/api/billing/extra-teams', { extraTeams: +$('#biExtra').value || 0 }); await refreshPlan(); toast('Teams updated'); } catch (err) { toast(err.message); } return; }
  });
  planBanner();
  const q = new URLSearchParams(location.search).get('billing');
  if (q) {
    history.replaceState(null, '', location.pathname + location.hash);
    if (q === 'done') {
      toast('Thanks! Setting up your plan…'); show('week');
      let n = 0; const poll = async () => { await refreshPlan(); if ((BILL && BILL.subscription) || ++n > 10) { if (BILL && BILL.subscription) toast('Your plan is active'); return; } setTimeout(poll, 1500); }; poll();
    } else toast('Checkout cancelled. Nothing was charged.');
  }
}
