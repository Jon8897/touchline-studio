'use strict';
/* Plans, limits and Stripe payments. No npm packages: Stripe's API is called with fetch,
   and webhook signatures are checked with Node's crypto.

   PAYMENTS=off (default)  everyone keeps the free-beta allowance (FREE_TEAM_LIMIT teams, everything unlocked)
   PAYMENTS=on             Free / Coach / Club plans apply, Stripe Checkout + billing portal + webhooks

   Access is decided here, on the server, from what Stripe's webhooks have told us. The browser is never trusted. */
const crypto = require('node:crypto');
const { CFG, db, now } = require('./lib');

const env = k => (process.env[k] || '').trim();
const B = {
  on: /^(1|on|true|yes)$/i.test(env('PAYMENTS')),
  key: env('STRIPE_SECRET_KEY'),
  whsec: env('STRIPE_WEBHOOK_SECRET'),
  api: (env('STRIPE_API_BASE') || 'https://api.stripe.com').replace(/\/+$/, ''),
  price: {
    coach_monthly: env('STRIPE_PRICE_COACH_MONTHLY'), coach_yearly: env('STRIPE_PRICE_COACH_YEARLY'),
    club_monthly: env('STRIPE_PRICE_CLUB_MONTHLY'),
    extra_monthly: env('STRIPE_PRICE_EXTRA_TEAM_MONTHLY'), extra_yearly: env('STRIPE_PRICE_EXTRA_TEAM_YEARLY'),
  },
  founderCoupon: env('STRIPE_FOUNDER_COUPON'),
  portalConfig: env('STRIPE_PORTAL_CONFIG'),
  trialDays: Math.max(0, parseInt(env('TRIAL_DAYS') || '14', 10) || 0),
  founderGraceUntil: Date.parse(env('FOUNDER_GRACE_UNTIL') || '') || 0,
  tosConsent: /^(1|on|true|yes)$/i.test(env('STRIPE_TOS_CONSENT')),
};
B.liveMode = B.key.startsWith('sk_live_') || B.key.startsWith('rk_live_');
if (B.on && !B.key) console.warn('PAYMENTS=on but STRIPE_SECRET_KEY is empty: checkout will not work.');
if (B.on && CFG.env !== 'production' && B.liveMode) { console.error('Refusing to start: a LIVE Stripe key is set on a non-production site. Use test keys (sk_test_...) on staging.'); process.exit(1); }

/* ---------- database ---------- */
{
  const cols = db.prepare('PRAGMA table_info(users)').all().map(c => c.name);
  const add = (c, def) => { if (!cols.includes(c)) db.exec(`ALTER TABLE users ADD COLUMN ${c} ${def}`); };
  add('extra_teams', 'INTEGER NOT NULL DEFAULT 0'); add('founder', 'INTEGER NOT NULL DEFAULT 0'); add('comp_until', 'INTEGER');
  add('period_end', 'INTEGER'); add('cancel_at_end', 'INTEGER NOT NULL DEFAULT 0'); add('trial_end', 'INTEGER');
  add('trial_used', 'INTEGER NOT NULL DEFAULT 0'); add('billing_consent_at', 'INTEGER'); add('billing_interval', 'TEXT');
  db.exec(`CREATE TABLE IF NOT EXISTS stripe_events(id TEXT PRIMARY KEY, type TEXT NOT NULL, received INTEGER NOT NULL);
           CREATE INDEX IF NOT EXISTS users_customer ON users(billing_customer);`);
}

/* ---------- plans ---------- */
const PRICES = { coach: { monthly: '£4.99 a month', yearly: '£39 a year' }, club: { monthly: '£19.99 a month' }, extra: { monthly: '£2 a month', yearly: '£20 a year' } };
const PAID_STATUSES = ['active', 'trialing', 'past_due'];
const LIMITS = {
  free: { teams: 1, weeksPerTeam: 1, assistants: false },
  coach: { teams: 1, weeksPerTeam: Infinity, assistants: true },
  club: { teams: 12, weeksPerTeam: Infinity, assistants: true },
};
/* what this coach can do right now */
function entitlements(u) {
  if (!B.on) return { plan: 'beta', label: 'Free beta', teams: u.max_teams || CFG.teamLimit, weeksPerTeam: Infinity, assistants: true, paid: true, payments: false };
  const t = now();
  if (u.comp_until && u.comp_until > t) return { plan: 'comp', label: 'Complimentary', teams: Math.max(u.max_teams || 3, 3), weeksPerTeam: Infinity, assistants: true, paid: true, until: u.comp_until, payments: true };
  if (PAID_STATUSES.includes(u.billing_status) && LIMITS[u.plan] && u.plan !== 'free') {
    const L = LIMITS[u.plan], teams = u.plan === 'coach' ? 1 + (u.extra_teams || 0) : L.teams;
    return { plan: u.plan, label: u.plan === 'club' ? 'Club' : 'Coach', teams, weeksPerTeam: L.weeksPerTeam, assistants: L.assistants, paid: true, status: u.billing_status, pastDue: u.billing_status === 'past_due', payments: true };
  }
  if (u.founder && t < B.founderGraceUntil) return { plan: 'founder', label: 'Founding coach (free until paid plans start)', teams: Math.max(u.max_teams || 3, 3), weeksPerTeam: Infinity, assistants: true, paid: true, until: B.founderGraceUntil, payments: true };
  return { plan: 'free', label: 'Free', ...LIMITS.free, paid: false, payments: true };
}
const ownerOf = teamOwnerId => db.prepare('SELECT * FROM users WHERE id=?').get(teamOwnerId);

/* ---------- Stripe API ---------- */
function form(obj, prefix = '', out = []) {
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null) continue;
    const key = prefix ? `${prefix}[${k}]` : k;
    if (Array.isArray(v)) v.forEach((x, i) => (typeof x === 'object' ? form(x, `${key}[${i}]`, out) : out.push([`${key}[${i}]`, String(x)])));
    else if (typeof v === 'object') form(v, key, out);
    else out.push([key, String(v)]);
  }
  return out;
}
async function stripe(method, path, params) {
  if (!B.key) throw Object.assign(new Error('Payments are not set up yet.'), { status: 503 });
  const qs = params ? new URLSearchParams(form(params)).toString() : '';
  const url = B.api + path + (method === 'GET' && qs ? '?' + qs : '');
  const res = await fetch(url, { method, headers: { Authorization: `Bearer ${B.key}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: method === 'GET' ? undefined : qs });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) { const e = new Error((data.error && data.error.message) || `Stripe error ${res.status}`); e.status = res.status >= 500 ? 502 : 400; e.stripe = data.error; throw e; }
  return data;
}

/* Stripe-Signature: t=timestamp,v1=hex(hmac_sha256(secret, `${t}.${rawBody}`)) */
function verifySignature(raw, header, secret, toleranceSec = 300) {
  if (!secret || !header) return false;
  const parts = {}; for (const kv of String(header).split(',')) { const i = kv.indexOf('='); if (i > 0) (parts[kv.slice(0, i)] ||= []).push(kv.slice(i + 1)); }
  const t = parseInt((parts.t || [])[0], 10); if (!t || Math.abs(Date.now() / 1000 - t) > toleranceSec) return false;
  const want = crypto.createHmac('sha256', secret).update(`${t}.`).update(raw).digest();
  return (parts.v1 || []).some(sig => { try { const b = Buffer.from(sig, 'hex'); return b.length === want.length && crypto.timingSafeEqual(b, want); } catch { return false; } });
}

/* ---------- keep our records in step with Stripe ---------- */
const planOfPrice = id => (id && (id === B.price.club_monthly ? 'club' : [B.price.coach_monthly, B.price.coach_yearly].includes(id) ? 'coach' : null));
const isExtra = id => id && (id === B.price.extra_monthly || id === B.price.extra_yearly);
function applySubscription(user, sub) {
  const items = (sub.items && sub.items.data) || [];
  const main = items.find(i => planOfPrice(i.price && i.price.id)); const extra = items.find(i => isExtra(i.price && i.price.id));
  const periodEnd = sub.current_period_end || (items[0] && items[0].current_period_end) || null;
  const plan = main ? planOfPrice(main.price.id) : user.plan;
  const interval = main && main.price.recurring ? main.price.recurring.interval : null;
  db.prepare(`UPDATE users SET plan=?, billing_status=?, billing_subscription=?, billing_customer=COALESCE(?,billing_customer), extra_teams=?, period_end=?, cancel_at_end=?, trial_end=?, billing_interval=?, trial_used=1 WHERE id=?`)
    .run(plan || 'free', sub.status, sub.id, typeof sub.customer === 'string' ? sub.customer : (sub.customer && sub.customer.id) || null,
      plan === 'coach' && extra ? extra.quantity || 0 : 0, periodEnd ? periodEnd * 1000 : null, sub.cancel_at_period_end ? 1 : 0, sub.trial_end ? sub.trial_end * 1000 : null, interval, user.id);
}
const userForStripe = (customerId, userId) => (userId && db.prepare('SELECT * FROM users WHERE id=?').get(userId)) || (customerId && db.prepare('SELECT * FROM users WHERE billing_customer=?').get(customerId)) || null;

/* ---------- routes ---------- */
function install({ route, send, fail, Mail, limited }) {
  const base = CFG.base;
  const summary = u => {
    const e = entitlements(u), teamsUsed = db.prepare('SELECT COUNT(*) n FROM teams WHERE owner_id=? AND archived=0').get(u.id).n;
    return { ...e, teams: Number.isFinite(e.teams) ? e.teams : null, weeksPerTeam: Number.isFinite(e.weeksPerTeam) ? e.weeksPerTeam : null, teamsUsed,
      subscription: u.billing_subscription ? { status: u.billing_status, plan: u.plan, interval: u.billing_interval, extraTeams: u.extra_teams || 0, periodEnd: u.period_end, cancelAtPeriodEnd: !!u.cancel_at_end, trialEnd: u.trial_end } : null,
      founder: !!u.founder, trialDays: u.trial_used ? 0 : B.trialDays, prices: PRICES, testMode: B.on && !B.liveMode, ready: !!(B.key && B.price.coach_monthly) };
  };
  route('GET', '/api/billing', (req, res, { user }) => send(res, 200, summary(user)));

  route('POST', '/api/billing/checkout', async (req, res, { user, body }) => {
    if (!B.on) return fail(res, 400, 'Payments aren’t switched on.');
    if (limited('checkout:' + user.id, 10, 3600e3)) return fail(res, 429, 'Too many attempts. Try again later.');
    const choice = ['coach_monthly', 'coach_yearly', 'club_monthly'].includes(body.plan) ? body.plan : null;
    if (!choice || !B.price[choice]) return fail(res, 400, 'Choose a plan.');
    if (body.consent !== true) return fail(res, 400, 'Please tick the box to agree to the payment terms.');
    if (PAID_STATUSES.includes(user.billing_status)) return fail(res, 409, 'You already have a plan. Use “Manage billing” to change it.');
    const interval = choice.endsWith('yearly') ? 'yearly' : 'monthly';
    const extra = choice.startsWith('coach') ? Math.max(0, Math.min(20, parseInt(body.extraTeams, 10) || 0)) : 0;
    try {
      let customer = user.billing_customer;
      if (!customer) {
        customer = (await stripe('POST', '/v1/customers', { email: user.email, name: user.name, metadata: { user_id: user.id } })).id;
        db.prepare('UPDATE users SET billing_customer=? WHERE id=?').run(customer, user.id);
      }
      const line_items = [{ price: B.price[choice], quantity: 1 }];
      if (extra && B.price['extra_' + interval]) line_items.push({ price: B.price['extra_' + interval], quantity: extra });
      const trial = user.trial_used ? 0 : B.trialDays;
      const amount = PRICES[choice.split('_')[0]][interval];
      const params = {
        mode: 'subscription', customer, client_reference_id: user.id, line_items,
        success_url: `${base}/app?billing=done#week`, cancel_url: `${base}/app?billing=cancelled#week`,
        subscription_data: { metadata: { user_id: user.id }, ...(trial ? { trial_period_days: trial } : {}) },
        billing_address_collection: 'auto',
        custom_text: { submit: { message: `${trial ? `Free for ${trial} days, then ${amount}` : amount}${extra ? ` plus ${extra} extra team${extra > 1 ? 's' : ''}` : ''}, renewing automatically. Cancel any time in Team week → Plan & billing; you keep access until the end of the period you’ve paid for. Terms and refund policy: ${base}/terms and ${base}/refunds` } },
        ...(user.founder && B.founderCoupon ? { discounts: [{ coupon: B.founderCoupon }] } : { allow_promotion_codes: true }),
        ...(B.tosConsent ? { consent_collection: { terms_of_service: 'required' } } : {}),
      };
      const s = await stripe('POST', '/v1/checkout/sessions', params);
      db.prepare('UPDATE users SET billing_consent_at=? WHERE id=?').run(now(), user.id);
      send(res, 200, { url: s.url });
    } catch (e) { console.error('checkout:', e.message); fail(res, e.status || 502, e.message); }
  });

  route('POST', '/api/billing/portal', async (req, res, { user }) => {
    if (!user.billing_customer) return fail(res, 400, 'No billing account yet.');
    try { const s = await stripe('POST', '/v1/billing_portal/sessions', { customer: user.billing_customer, return_url: `${base}/app#week`, ...(B.portalConfig ? { configuration: B.portalConfig } : {}) }); send(res, 200, { url: s.url }); }
    catch (e) { fail(res, e.status || 502, e.message); }
  });

  const setCancel = flag => async (req, res, { user }) => {
    if (!user.billing_subscription || !PAID_STATUSES.includes(user.billing_status)) return fail(res, 400, 'You don’t have an active plan.');
    try { const sub = await stripe('POST', `/v1/subscriptions/${encodeURIComponent(user.billing_subscription)}`, { cancel_at_period_end: flag ? 'true' : 'false' }); applySubscription(user, sub); send(res, 200, summary(db.prepare('SELECT * FROM users WHERE id=?').get(user.id))); }
    catch (e) { fail(res, e.status || 502, e.message); }
  };
  route('POST', '/api/billing/cancel', setCancel(true));
  route('POST', '/api/billing/resume', setCancel(false));

  route('POST', '/api/billing/extra-teams', async (req, res, { user, body }) => {
    const n = Math.max(0, Math.min(20, parseInt(body.extraTeams, 10) || 0));
    if (user.plan !== 'coach' || !PAID_STATUSES.includes(user.billing_status)) return fail(res, 400, 'Extra teams are part of the Coach plan.');
    const active = db.prepare('SELECT COUNT(*) n FROM teams WHERE owner_id=? AND archived=0').get(user.id).n;
    if (1 + n < active) return fail(res, 400, `You have ${active} active teams. Archive ${active - 1 - n} first.`);
    try {
      const sub = await stripe('GET', `/v1/subscriptions/${encodeURIComponent(user.billing_subscription)}`);
      const items = sub.items.data, extra = items.find(i => isExtra(i.price.id)), main = items.find(i => planOfPrice(i.price.id));
      const interval = main.price.recurring && main.price.recurring.interval === 'year' ? 'yearly' : 'monthly';
      if (extra && n === 0) await stripe('DELETE', `/v1/subscription_items/${extra.id}`, { proration_behavior: 'create_prorations' });
      else if (extra) await stripe('POST', `/v1/subscription_items/${extra.id}`, { quantity: n, proration_behavior: 'create_prorations' });
      else if (n > 0) await stripe('POST', '/v1/subscription_items', { subscription: sub.id, price: B.price['extra_' + interval], quantity: n, proration_behavior: 'create_prorations' });
      applySubscription(user, await stripe('GET', `/v1/subscriptions/${encodeURIComponent(sub.id)}`));
      send(res, 200, summary(db.prepare('SELECT * FROM users WHERE id=?').get(user.id)));
    } catch (e) { fail(res, e.status || 502, e.message); }
  });
}

/* webhook: needs the raw body, so server.js calls this before normal JSON parsing */
async function handleWebhook(req, res, { send, fail, readRaw, Mail }) {
  if (req.method !== 'POST') return fail(res, 405, 'Method not allowed');
  let raw; try { raw = await readRaw(req); } catch { return fail(res, 413, 'Too large'); }
  if (!verifySignature(raw, req.headers['stripe-signature'], B.whsec)) return fail(res, 400, 'Bad signature');
  let ev; try { ev = JSON.parse(raw.toString('utf8')); } catch { return fail(res, 400, 'Bad JSON'); }
  if (db.prepare('SELECT 1 FROM stripe_events WHERE id=?').get(ev.id)) return send(res, 200, { received: true, duplicate: true });
  const o = ev.data && ev.data.object || {};
  try {
    const subId = o.object === 'subscription' ? o.id : o.subscription || (o.parent && o.parent.subscription_details && o.parent.subscription_details.subscription) || null;
    const customer = typeof o.customer === 'string' ? o.customer : o.customer && o.customer.id;
    const u = userForStripe(customer, o.client_reference_id || (o.metadata && o.metadata.user_id) || (o.subscription_details && o.subscription_details.metadata && o.subscription_details.metadata.user_id));
    switch (ev.type) {
      case 'checkout.session.completed':
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
      case 'customer.subscription.paused':
      case 'customer.subscription.resumed':
      case 'invoice.payment_succeeded':
      case 'invoice.paid': {
        if (!u || !subId) break;
        const before = u.billing_status;
        const sub = await stripe('GET', `/v1/subscriptions/${encodeURIComponent(subId)}`);   // always re-read: events can arrive out of order
        applySubscription(u, sub);
        if (ev.type === 'customer.subscription.deleted' || (sub.status === 'canceled' && before !== 'canceled')) Mail.planEnded(u.email, u.name);
        if (ev.type === 'checkout.session.completed') Mail.planStarted(u.email, u.name, sub.status === 'trialing' && sub.trial_end ? new Date(sub.trial_end * 1000) : null);
        break;
      }
      case 'invoice.payment_failed':
        if (u) { if (subId) applySubscription(u, await stripe('GET', `/v1/subscriptions/${encodeURIComponent(subId)}`)); Mail.paymentFailed(u.email, u.name); }
        break;
      default: break;
    }
    db.prepare('INSERT OR IGNORE INTO stripe_events(id,type,received) VALUES(?,?,?)').run(ev.id, ev.type, now());
    send(res, 200, { received: true });
  } catch (e) {
    console.error('stripe webhook', ev.type, e.message);
    fail(res, 500, 'Webhook processing failed');   // Stripe retries later
  }
}

module.exports = { B, entitlements, ownerOf, install, handleWebhook, stripe, verifySignature, PRICES };
