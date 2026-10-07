/* Payments end to end, against a fake Stripe API (no real Stripe account or network needed).
   Covers: free-plan limits, checkout, signed webhooks, upgrades, extra teams, cancel/resume,
   failed payments, cancellation, account deletion and the live-key safety check. */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';
import http from 'node:http';
import crypto from 'node:crypto';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PKG = path.join(ROOT, 'dist', 'touchline');
const WHSEC = 'whsec_test_secret';
const PRICE = { cm: 'price_coach_m', cy: 'price_coach_y', club: 'price_club_m', xm: 'price_extra_m', xy: 'price_extra_y' };
let srv, stripeSrv, BASE, STRIPE, log = '', tmp;
const calls = [];
const subs = {};  // fake Stripe state

const freePort = () => new Promise(r => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const wait = ms => new Promise(r => setTimeout(r, ms));
const emailsTo = to => log.split('[email → ').slice(1).filter(b => b.startsWith(to));

function fakeStripe(req, res) {
  let body = ''; req.on('data', c => body += c); req.on('end', () => {
    const p = new URLSearchParams(body), url = new URL(req.url, 'http://x'), j = (code, o) => { res.writeHead(code, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(o)); };
    calls.push({ method: req.method, path: url.pathname, params: Object.fromEntries(p), auth: req.headers.authorization });
    if (req.headers.authorization !== 'Bearer sk_test_fake') return j(401, { error: { message: 'bad key' } });
    let m;
    if (req.method === 'POST' && url.pathname === '/v1/customers') return j(200, { id: 'cus_' + crypto.randomBytes(4).toString('hex') });
    if (req.method === 'POST' && url.pathname === '/v1/checkout/sessions') return j(200, { id: 'cs_1', url: 'https://checkout.stripe.test/c/cs_1' });
    if (req.method === 'POST' && url.pathname === '/v1/billing_portal/sessions') return j(200, { url: 'https://billing.stripe.test/p/1' });
    if ((m = url.pathname.match(/^\/v1\/subscriptions\/(\w+)$/))) {
      const s = subs[m[1]]; if (!s) return j(404, { error: { message: 'No such subscription' } });
      if (req.method === 'POST' && p.has('cancel_at_period_end')) s.cancel_at_period_end = p.get('cancel_at_period_end') === 'true';
      if (req.method === 'DELETE') s.status = 'canceled';
      return j(200, s);
    }
    if (req.method === 'POST' && url.pathname === '/v1/subscription_items') { const s = subs[p.get('subscription')]; const it = { id: 'si_x' + s.items.data.length, quantity: +p.get('quantity'), price: { id: p.get('price'), recurring: { interval: 'month' } } }; s.items.data.push(it); return j(200, it); }
    if ((m = url.pathname.match(/^\/v1\/subscription_items\/(\w+)$/))) {
      for (const s of Object.values(subs)) { const i = s.items.data.findIndex(x => x.id === m[1]); if (i > -1) { if (req.method === 'DELETE') s.items.data.splice(i, 1); else s.items.data[i].quantity = +p.get('quantity'); return j(200, {}); } }
      return j(404, { error: { message: 'no item' } });
    }
    const gen = { '/v1/products': 'prod', '/v1/prices': 'price', '/v1/coupons': 'coup', '/v1/billing_portal/configurations': 'bpc', '/v1/webhook_endpoints': 'we' }[url.pathname];
    if (req.method === 'POST' && gen) return j(200, { id: gen + '_' + crypto.randomBytes(3).toString('hex'), ...(gen === 'we' ? { secret: 'whsec_new', url: p.get('url') } : {}) });
    j(404, { error: { message: 'not faked: ' + url.pathname } });
  });
}
function makeSub(id, customer, userId, { status = 'trialing', price = PRICE.cm } = {}) {
  subs[id] = { id, object: 'subscription', customer, status, cancel_at_period_end: false, current_period_end: Math.floor(Date.now() / 1000) + 30 * 86400, trial_end: status === 'trialing' ? Math.floor(Date.now() / 1000) + 14 * 86400 : null,
    metadata: { user_id: userId }, items: { data: [{ id: 'si_main', quantity: 1, price: { id: price, recurring: { interval: price === PRICE.cy ? 'year' : 'month' } } }] } };
  return subs[id];
}
async function webhook(event, { secret = WHSEC, tamper = false } = {}) {
  const raw = JSON.stringify(event), t = Math.floor(Date.now() / 1000);
  const sig = crypto.createHmac('sha256', secret).update(`${t}.${raw}`).digest('hex');
  return fetch(BASE + '/api/webhooks/stripe', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Stripe-Signature': `t=${t},v1=${sig}` }, body: tamper ? raw.replace(event.id, event.id + 'x') : raw });
}
function client() {
  let cookie = '';
  const call = async (method, url, body) => {
    const res = await fetch(BASE + url, { method, headers: { 'Content-Type': 'application/json', ...(method !== 'GET' ? { 'X-TLS': '1' } : {}), ...(cookie ? { Cookie: cookie } : {}) }, body: body ? JSON.stringify(body) : undefined });
    const sc = res.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0];
    const text = await res.text(); let json = null; try { json = JSON.parse(text); } catch {}
    return { status: res.status, json };
  };
  return { get: u => call('GET', u), post: (u, b) => call('POST', u, b), put: (u, b) => call('PUT', u, b) };
}
const signup = (c, email) => c.post('/api/signup', { name: email.split('@')[0], email, password: 'password-123', team: 'Test FC', code: 'TESTCODE', agree: true });
const ENV = port => ({ ...process.env, PORT: String(port), HOST: '127.0.0.1', BASE_URL: `http://127.0.0.1:${port}`, DB_PATH: path.join(tmp, 'b.db'), SIGNUP_CODE: 'TESTCODE', SIGNUP_LIMIT: '200', EMAIL_PROVIDER: 'console', APP_ENV: 'staging',
  PAYMENTS: 'on', STRIPE_SECRET_KEY: 'sk_test_fake', STRIPE_WEBHOOK_SECRET: WHSEC, STRIPE_API_BASE: STRIPE, STRIPE_PRICE_COACH_MONTHLY: PRICE.cm, STRIPE_PRICE_COACH_YEARLY: PRICE.cy, STRIPE_PRICE_CLUB_MONTHLY: PRICE.club,
  STRIPE_PRICE_EXTRA_TEAM_MONTHLY: PRICE.xm, STRIPE_PRICE_EXTRA_TEAM_YEARLY: PRICE.xy, TRIAL_DAYS: '14' });

before(async () => {
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'touchline-billing-'));
  const sp = await freePort(); stripeSrv = http.createServer(fakeStripe).listen(sp, '127.0.0.1'); STRIPE = `http://127.0.0.1:${sp}`;
  const port = await freePort(); BASE = `http://127.0.0.1:${port}`;
  srv = spawn(process.execPath, ['--no-warnings', 'server.js'], { cwd: PKG, env: ENV(port) });
  srv.stdout.on('data', d => { log += d; }); srv.stderr.on('data', d => { log += d; });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE + '/healthz')).ok) return; } catch {} await wait(100); }
  throw new Error('Server did not start:\n' + log);
});
after(() => { srv?.kill(); stripeSrv?.close(); fs.rmSync(tmp, { recursive: true, force: true }); });

test('a live Stripe key is refused on the staging site', () => {
  const r = spawnSync(process.execPath, ['--no-warnings', 'server.js'], { cwd: PKG, env: { ...ENV(1), STRIPE_SECRET_KEY: 'sk_live_oops', DB_PATH: path.join(tmp, 'x.db') }, timeout: 5000, encoding: 'utf8' });
  assert.notEqual(r.status, 0); assert.match(r.stderr, /LIVE Stripe key/);
});

test('free plan: 1 team, 1 live week per team, no assistants', async () => {
  const c = client(); await signup(c, 'free@test.dev');
  const b = (await c.get('/api/billing')).json;
  assert.equal(b.plan, 'free'); assert.equal(b.teams, 1); assert.equal(b.trialDays, 14);
  const t2 = await c.post('/api/teams', { name: 'Second' }); assert.equal(t2.status, 403); assert.equal(t2.json.code, 'team_limit');
  const tid = (await c.get('/api/teams')).json.teams[0].id;
  assert.equal((await c.post(`/api/teams/${tid}/weeks`, { data: { title: 'W1', train: [], items: [] } })).status, 201);
  const w2 = await c.post(`/api/teams/${tid}/weeks`, { data: { title: 'W2', train: [], items: [] } }); assert.equal(w2.status, 403); assert.equal(w2.json.code, 'week_limit');
  const inv = await c.post(`/api/teams/${tid}/invites`, { email: 'a@test.dev' }); assert.equal(inv.status, 403); assert.equal(inv.json.code, 'plan_required');
});

test('checkout needs consent and a real plan, and carries the trial, the user and the terms', async () => {
  const c = client(); await signup(c, 'buyer@test.dev');
  assert.equal((await c.post('/api/billing/checkout', { plan: 'coach_monthly' })).status, 400, 'no consent');
  assert.equal((await c.post('/api/billing/checkout', { plan: 'gold', consent: true })).status, 400, 'unknown plan');
  const r = await c.post('/api/billing/checkout', { plan: 'coach_monthly', consent: true, extraTeams: 1 });
  assert.equal(r.status, 200); assert.match(r.json.url, /^https:\/\/checkout\.stripe\.test/);
  const s = calls.filter(x => x.path === '/v1/checkout/sessions').pop().params;
  assert.equal(s.mode, 'subscription'); assert.equal(s['line_items[0][price]'], PRICE.cm); assert.equal(s['line_items[1][price]'], PRICE.xm); assert.equal(s['line_items[1][quantity]'], '1');
  assert.equal(s['subscription_data[trial_period_days]'], '14'); assert.ok(s.client_reference_id);
  assert.match(s['custom_text[submit][message]'], /Cancel any time/); assert.match(s['custom_text[submit][message]'], /\/refunds/);
  assert.ok(calls.every(x => x.auth === 'Bearer sk_test_fake'), 'secret key only ever sent to Stripe in the header');
});

test('webhooks: wrong signature, tampered body and replays are rejected; a real one unlocks the plan', async () => {
  const c = client(); await signup(c, 'paid@test.dev');
  await c.post('/api/billing/checkout', { plan: 'coach_monthly', consent: true });
  const s = calls.filter(x => x.path === '/v1/checkout/sessions').pop().params, uid = s.client_reference_id, cus = s.customer;
  makeSub('sub_paid', cus, uid);
  const ev = { id: 'evt_1', type: 'checkout.session.completed', data: { object: { object: 'checkout.session', client_reference_id: uid, customer: cus, subscription: 'sub_paid' } } };
  assert.equal((await webhook(ev, { secret: 'whsec_wrong' })).status, 400);
  assert.equal((await webhook(ev, { tamper: true })).status, 400);
  assert.equal((await fetch(BASE + '/api/webhooks/stripe', { method: 'POST', body: JSON.stringify(ev) })).status, 400, 'no signature');
  assert.equal((await c.get('/api/billing')).json.plan, 'free', 'nothing unlocked by fake events');
  assert.equal((await webhook(ev)).status, 200);
  assert.equal((await (await webhook(ev)).json()).duplicate, true, 'replay ignored');
  const b = (await c.get('/api/billing')).json;
  assert.equal(b.plan, 'coach'); assert.equal(b.subscription.status, 'trialing'); assert.ok(b.subscription.trialEnd);
  const tid = (await c.get('/api/teams')).json.teams[0].id;
  for (let i = 0; i < 3; i++) assert.equal((await c.post(`/api/teams/${tid}/weeks`, { data: { title: 'W' + i, train: [], items: [] } })).status, 201);
  assert.equal((await c.post(`/api/teams/${tid}/invites`, { email: 'asst@test.dev' })).status, 201);
  await wait(150); assert.ok(emailsTo('paid@test.dev').some(e => e.includes('plan is active')));

  // extra teams
  assert.equal((await c.post('/api/teams', { name: 'Second XI' })).status, 403);
  const x = await c.post('/api/billing/extra-teams', { extraTeams: 2 }); assert.equal(x.status, 200); assert.equal(x.json.teams, 3);
  assert.equal((await c.post('/api/teams', { name: 'Second XI' })).status, 201);
  assert.equal((await c.post('/api/billing/extra-teams', { extraTeams: 0 })).status, 400, 'cannot drop below active teams');

  // cancel at period end, then resume
  const cn = await c.post('/api/billing/cancel'); assert.equal(cn.json.subscription.cancelAtPeriodEnd, true); assert.equal(cn.json.plan, 'coach', 'access kept until period end');
  assert.equal((await c.post('/api/billing/resume')).json.subscription.cancelAtPeriodEnd, false);
  assert.match((await c.post('/api/billing/portal')).json.url, /billing\.stripe\.test/);

  // payment fails: still has access (Stripe retries), gets an email
  subs.sub_paid.status = 'past_due';
  assert.equal((await webhook({ id: 'evt_2', type: 'invoice.payment_failed', data: { object: { object: 'invoice', customer: cus, subscription: 'sub_paid' } } })).status, 200);
  const pd = (await c.get('/api/billing')).json; assert.equal(pd.pastDue, true); assert.equal(pd.plan, 'coach');
  await wait(150); assert.ok(emailsTo('paid@test.dev').some(e => e.includes('didn’t go through')));

  // subscription ends: back to free, nothing deleted
  subs.sub_paid.status = 'canceled';
  assert.equal((await webhook({ id: 'evt_3', type: 'customer.subscription.deleted', data: { object: subs.sub_paid } })).status, 200);
  const fr = (await c.get('/api/billing')).json; assert.equal(fr.plan, 'free'); assert.equal(fr.teamsUsed, 2, 'teams kept');
  assert.equal((await c.post('/api/teams', { name: 'Third' })).status, 403);
  await wait(150); assert.ok(emailsTo('paid@test.dev').some(e => e.includes('plan has ended')));
  assert.equal((await c.get('/api/billing')).json.trialDays, 0, 'no second free trial');
});

test('deleting an account cancels the Stripe subscription first', async () => {
  const c = client(); await signup(c, 'leaver@test.dev');
  await c.post('/api/billing/checkout', { plan: 'coach_yearly', consent: true });
  const s = calls.filter(x => x.path === '/v1/checkout/sessions').pop().params;
  assert.equal(s['line_items[0][price]'], PRICE.cy);
  makeSub('sub_leaver', s.customer, s.client_reference_id, { status: 'active', price: PRICE.cy });
  await webhook({ id: 'evt_l1', type: 'customer.subscription.created', data: { object: subs.sub_leaver } });
  assert.equal((await c.post('/api/account/delete', { password: 'password-123' })).status, 200);
  assert.ok(calls.some(x => x.method === 'DELETE' && x.path === '/v1/subscriptions/sub_leaver'));
  assert.equal(subs.sub_leaver.status, 'canceled');
});

test('complimentary access (demo accounts) unlocks everything without paying', async () => {
  const c = client(); await signup(c, 'demo@test.dev');
  const r = spawnSync(process.execPath, ['--no-warnings', 'admin.js', 'comp', 'demo@test.dev', '3', '4'], { cwd: PKG, env: { ...process.env, DB_PATH: path.join(tmp, 'b.db') }, encoding: 'utf8' });
  assert.equal(r.status, 0, r.stderr); assert.match(r.stdout, /free access with 4 teams/);
  const b = (await c.get('/api/billing')).json; assert.equal(b.plan, 'comp'); assert.equal(b.teams, 4);
  assert.equal((await c.post('/api/teams', { name: 'Second' })).status, 201);
});

test('stripe-setup creates the products, prices, coupon, portal and webhook and prints the settings', async () => {
  // async: the fake Stripe API runs in this process, so it must not be blocked
  const r = await new Promise(res => { const ch = spawn(process.execPath, ['--no-warnings', 'admin.js', 'stripe-setup'], { cwd: PKG, env: { ...ENV(1), DB_PATH: path.join(tmp, 'b.db') } }); let stdout = '', stderr = '';
    ch.stdout.on('data', d => stdout += d); ch.stderr.on('data', d => stderr += d); ch.on('close', status => res({ status, stdout, stderr })); });
  assert.equal(r.status, 0, r.stderr);
  for (const k of ['STRIPE_PRICE_COACH_MONTHLY=price_', 'STRIPE_PRICE_COACH_YEARLY=price_', 'STRIPE_PRICE_CLUB_MONTHLY=price_', 'STRIPE_PRICE_EXTRA_TEAM_MONTHLY=price_', 'STRIPE_PRICE_EXTRA_TEAM_YEARLY=price_', 'STRIPE_FOUNDER_COUPON=coup_', 'STRIPE_PORTAL_CONFIG=bpc_', 'STRIPE_WEBHOOK_SECRET=whsec_new', 'PAYMENTS=on']) assert.ok(r.stdout.includes(k), k);
  const prices = calls.filter(x => x.path === '/v1/prices').map(x => [x.params.unit_amount, x.params['recurring[interval]'], x.params.currency]);
  assert.deepEqual(prices, [['499', 'month', 'gbp'], ['3900', 'year', 'gbp'], ['1999', 'month', 'gbp'], ['200', 'month', 'gbp'], ['2000', 'year', 'gbp']]);
  const hook = calls.find(x => x.path === '/v1/webhook_endpoints').params;
  assert.match(hook.url, /\/api\/webhooks\/stripe$/); assert.equal(hook['enabled_events[0]'], 'checkout.session.completed');
  assert.equal(calls.find(x => x.path === '/v1/billing_portal/configurations').params['features[subscription_cancel][mode]'], 'at_period_end');
});
