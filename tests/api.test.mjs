/* End-to-end tests of the built server: run with  npm test  (after npm run build).
   Starts the real server from dist/touchline on a spare port with an empty database,
   then works through what coaches, assistants and players do.                         */
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import net from 'node:net';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PKG = path.join(ROOT, 'dist', 'touchline');
let srv, BASE, log = '', tmp;

const freePort = () => new Promise(r => { const s = net.createServer().listen(0, '127.0.0.1', () => { const p = s.address().port; s.close(() => r(p)); }); });
const wait = ms => new Promise(r => setTimeout(r, ms));
const emailsTo = to => log.split('[email → ').slice(1).filter(b => b.startsWith(to)).map(b => b.split('\n[email')[0]);
const linkIn = txt => (txt.match(/https?:\/\/\S+#(reset|invite)\.[\w-]+/) || [])[0];
const tokenOf = url => url.split(/#(?:reset|invite)\./)[1];

/* a tiny browser: keeps its own cookie, sends the header the server expects */
function client() {
  let cookie = '';
  const call = async (method, url, body, extra = {}) => {
    const res = await fetch(BASE + url, { method, redirect: 'manual', headers: { 'Content-Type': 'application/json', ...(method !== 'GET' ? { 'X-TLS': '1' } : {}), ...(cookie ? { Cookie: cookie } : {}), ...extra }, body: body ? JSON.stringify(body) : undefined });
    const sc = res.headers.get('set-cookie'); if (sc) cookie = sc.split(';')[0].endsWith('=') ? '' : sc.split(';')[0];
    const text = await res.text(); let json = null; try { json = JSON.parse(text); } catch {}
    return { status: res.status, json, text, headers: res.headers };
  };
  return { get: u => call('GET', u), post: (u, b) => call('POST', u, b), put: (u, b) => call('PUT', u, b), patch: (u, b) => call('PATCH', u, b), del: u => call('DELETE', u), raw: call };
}
const signup = (c, email, extra = {}) => c.post('/api/signup', { name: email.split('@')[0], email, password: 'password-123', team: 'Test FC', code: 'TESTCODE', agree: true, ...extra });

before(async () => {
  assert.ok(fs.existsSync(path.join(PKG, 'server.js')), 'Run "npm run build" first');
  tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'touchline-test-'));
  const port = await freePort(); BASE = `http://127.0.0.1:${port}`;
  srv = spawn(process.execPath, ['--no-warnings', 'server.js'], { cwd: PKG, env: { ...process.env, PORT: String(port), HOST: '127.0.0.1', BASE_URL: BASE, DB_PATH: path.join(tmp, 'test.db'), SIGNUP_CODE: 'TESTCODE', EMAIL_PROVIDER: 'console', ADMIN_EMAIL: 'owner@test.dev', APP_ENV: 'staging', TERMS_VERSION: '2026-10', FREE_TEAM_LIMIT: '2', SIGNUP_LIMIT: '200' } });
  srv.stdout.on('data', d => { log += d; }); srv.stderr.on('data', d => { log += d; });
  for (let i = 0; i < 50; i++) { try { if ((await fetch(BASE + '/healthz')).ok) return; } catch {} await wait(100); }
  throw new Error('Server did not start:\n' + log);
});
after(() => { srv?.kill(); fs.rmSync(tmp, { recursive: true, force: true }); });

test('health check reports version and environment', async () => {
  const r = await client().get('/healthz');
  assert.equal(r.status, 200); assert.equal(r.json.ok, true); assert.equal(r.json.env, 'staging');
  assert.equal(r.json.version, fs.readFileSync(path.join(PKG, 'VERSION'), 'utf8').trim());
});

test('website pages, demo and app are served', async () => {
  const c = client();
  for (const [url, needle] of [['/', 'Plan the week'], ['/app', 'Formations in motion'], ['/demo', '__DEMO__'], ['/privacy', 'Privacy'], ['/terms', 'Terms'], ['/safeguarding', 'Safeguarding'], ['/cookies', 'Cookies']]) {
    const r = await c.get(url); assert.equal(r.status, 200, url); assert.ok(r.text.includes(needle), `${url} should contain ${needle}`);
  }
  assert.equal((await c.get('/does-not-exist')).status, 404);
  assert.equal((await c.get('/og.png')).headers.get('content-type'), 'image/png');
  const home = await c.get('/'); assert.ok(home.text.includes(`${BASE}/og.png`), 'share image uses the real address');
});

test('staging is hidden from search engines', async () => {
  const c = client();
  assert.match((await c.get('/robots.txt')).text, /Disallow: \/\n/);
  assert.equal((await c.get('/')).headers.get('x-robots-tag'), 'noindex, nofollow');
});

test('security headers are set', async () => {
  const r = await client().get('/app');
  assert.match(r.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(r.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(r.headers.get('x-frame-options'), 'SAMEORIGIN');
});

test('sign-up needs the invite code, a real email, a long password and agreement to the terms', async () => {
  const c = client();
  assert.equal((await signup(c, 'a@test.dev', { code: 'WRONG' })).status, 403);
  assert.equal((await signup(c, 'not-an-email')).status, 400);
  assert.equal((await signup(c, 'a@test.dev', { password: 'short' })).status, 400);
  const noAgree = await signup(c, 'a@test.dev', { agree: false });
  assert.equal(noAgree.status, 400); assert.match(noAgree.json.error, /18 or over/);
  assert.equal((await signup(c, 'a@test.dev')).status, 201);
  assert.equal((await signup(client(), 'A@Test.dev')).status, 409, 'same email, different case');
  const me = await c.get('/api/bootstrap');
  assert.equal(me.status, 200); assert.ok(me.json.user.termsAcceptedAt); assert.equal(me.json.user.termsVersion, '2026-10');
  assert.equal(me.json.teams.length, 1); assert.equal(me.json.beta, true);
  await wait(100); assert.ok(emailsTo('a@test.dev').some(e => e.includes('Welcome')), 'welcome email sent');
});

test('requests without the app header or without logging in are refused', async () => {
  const c = client(); await signup(c, 'hdr@test.dev');
  assert.equal((await c.raw('POST', '/api/teams', { name: 'X' }, { 'X-TLS': '' })).status, 403);
  assert.equal((await client().get('/api/bootstrap')).status, 401);
});

test('log in, log out and wrong passwords', async () => {
  const c = client(); await signup(c, 'login@test.dev');
  await c.post('/api/logout'); assert.equal((await c.get('/api/me')).status, 401);
  assert.equal((await c.post('/api/login', { email: 'login@test.dev', password: 'nope-nope' })).status, 401);
  assert.equal((await c.post('/api/login', { email: 'LOGIN@test.dev', password: 'password-123' })).status, 200);
  assert.equal((await c.get('/api/me')).status, 200);
});

test('teams: create up to the limit, rename, archive, restore', async () => {
  const c = client(); await signup(c, 'teams@test.dev');
  const t2 = await c.post('/api/teams', { name: 'Second XI' }); assert.equal(t2.status, 201);
  const t3 = await c.post('/api/teams', { name: 'Third XI' }); assert.equal(t3.status, 403); assert.equal(t3.json.code, 'team_limit');
  const id = t2.json.team.id;
  assert.equal((await c.patch('/api/teams/' + id, { name: 'Reserves' })).status, 200);
  assert.equal((await c.post(`/api/teams/${id}/archive`)).status, 200);
  assert.equal((await c.post('/api/teams', { name: 'Third XI' })).status, 201, 'archived teams free a slot');
  assert.equal((await c.post(`/api/teams/${id}/restore`)).status, 403, 'cannot restore over the limit');
});

test('coaches cannot see or change other coaches’ teams', async () => {
  const a = client(), b = client(); await signup(a, 'own1@test.dev'); await signup(b, 'own2@test.dev');
  const tid = (await a.get('/api/teams')).json.teams[0].id;
  assert.equal((await b.get(`/api/teams/${tid}/draft`)).status, 404);
  assert.equal((await b.put(`/api/teams/${tid}/draft`, { value: { title: 'hacked' } })).status, 404);
  assert.equal((await b.post(`/api/teams/${tid}/weeks`, { data: { title: 'x' } })).status, 404);
  assert.equal((await b.patch(`/api/teams/${tid}`, { name: 'hacked' })).status, 404);
});

test('library saves online and comes back', async () => {
  const c = client(); await signup(c, 'lib@test.dev');
  assert.equal((await c.put('/api/store/plays', { value: [{ title: 'My press' }] })).status, 200);
  assert.equal((await c.put('/api/store/secrets', { value: [] })).status, 400);
  assert.deepEqual((await c.get('/api/bootstrap')).json.store.plays, [{ title: 'My press' }]);
});

test('publish a week: short player link, link preview, update keeps the link, delete stops it', async () => {
  const c = client(); await signup(c, 'pub@test.dev');
  const tid = (await c.get('/api/teams')).json.teams[0].id;
  const week = { title: 'Week 1', team: 'Test FC', coach: 'Coach', msg: 'Train hard', match: { opp: 'Rovers', ha: 'Home', date: '2026-10-10' }, train: [], items: [] };
  const p = await c.post(`/api/teams/${tid}/weeks`, { data: week }); assert.equal(p.status, 201);
  const slug = p.json.slug; assert.match(p.json.url, new RegExp(`/w/${slug}$`));
  const page = await client().get('/w/' + slug);
  assert.equal(page.status, 200); assert.match(page.text, /og:title" content="Week 1/); assert.match(page.text, /Rovers/);
  assert.ok(page.text.includes('window.__WEEK__='));
  assert.equal((await c.put('/api/weeks/' + slug, { data: { ...week, title: 'Week 1 (updated)' } })).status, 200);
  assert.equal((await client().get('/api/public/weeks/' + slug)).json.data.title, 'Week 1 (updated)');
  assert.ok((await c.get(`/api/teams/${tid}/weeks`)).json.weeks[0].views >= 1, 'views are counted');
  assert.equal((await c.del('/api/weeks/' + slug)).status, 200);
  assert.equal((await client().get('/w/' + slug)).status, 404);
});

test('player pages escape what coaches type', async () => {
  const c = client(); await signup(c, 'xss@test.dev');
  const tid = (await c.get('/api/teams')).json.teams[0].id;
  const p = await c.post(`/api/teams/${tid}/weeks`, { data: { title: '</script><script>alert(1)</script>', team: '"><img src=x onerror=alert(1)>', train: [], items: [] } });
  const page = await client().get('/w/' + p.json.slug);
  assert.ok(!page.text.includes('</script><script>alert(1)'), 'no script injection in the page');
  assert.ok(!page.text.includes('"><img src=x'), 'no attribute injection in meta tags');
});

test('password reset: email link works once and logs out other devices', async () => {
  const a = client(), other = client(); await signup(a, 'reset@test.dev');
  await other.post('/api/login', { email: 'reset@test.dev', password: 'password-123' });
  assert.equal((await client().post('/api/password/forgot', { email: 'reset@test.dev' })).status, 200);
  assert.equal((await client().post('/api/password/forgot', { email: 'nobody@test.dev' })).status, 200, 'same answer for unknown emails');
  await wait(150);
  const link = linkIn(emailsTo('reset@test.dev').find(e => e.includes('Reset your')));
  assert.ok(link && link.includes('/app#reset.'), 'reset email has a link to the app');
  const r = client();
  assert.equal((await r.post('/api/password/reset', { token: tokenOf(link), password: 'new-password-1' })).status, 200);
  assert.equal((await r.get('/api/me')).status, 200, 'logged in after reset');
  assert.equal((await client().post('/api/password/reset', { token: tokenOf(link), password: 'again-again' })).status, 400, 'link only works once');
  assert.equal((await other.get('/api/me')).status, 401, 'other device logged out');
  assert.equal((await client().post('/api/login', { email: 'reset@test.dev', password: 'new-password-1' })).status, 200);
});

test('assistant coaches: invite, sign up without a code, publish, leave, remove', async () => {
  const head = client(); await signup(head, 'head@test.dev');
  const tid = (await head.get('/api/teams')).json.teams[0].id;
  const inv = await head.post(`/api/teams/${tid}/invites`, { email: 'asst@test.dev' }); assert.equal(inv.status, 201);
  await wait(150);
  const link = linkIn(emailsTo('asst@test.dev').find(e => e.includes('invited you'))); assert.ok(link.includes('/app#invite.'));
  const asst = client();
  assert.equal((await asst.get('/api/invites/' + tokenOf(link))).json.team, 'Test FC');
  const s = await signup(asst, 'asst@test.dev', { code: '', invite: tokenOf(link), team: '' }); assert.equal(s.status, 201);
  const at = (await asst.get('/api/teams')).json.teams; assert.equal(at.length, 1); assert.equal(at[0].role, 'assistant');
  assert.equal((await asst.post(`/api/teams/${tid}/weeks`, { data: { title: 'From the assistant', train: [], items: [] } })).status, 201);
  assert.equal((await asst.patch(`/api/teams/${tid}`, { name: 'Taken over' })).status, 404, 'assistants cannot rename');
  assert.equal((await asst.post(`/api/teams/${tid}/invites`, { email: 'x@test.dev' })).status, 403, 'assistants cannot invite');
  const members = (await head.get(`/api/teams/${tid}/members`)).json;
  const aid = members.members.find(m => m.email === 'asst@test.dev').id;
  assert.equal((await head.del(`/api/teams/${tid}/members/${aid}`)).status, 200);
  assert.equal((await asst.get('/api/teams')).json.teams.length, 0);
});

test('download my data', async () => {
  const c = client(); await signup(c, 'export@test.dev');
  await c.put('/api/store/mydrills', { value: [{ name: 'My drill' }] });
  const r = await c.get('/api/account/export');
  assert.equal(r.status, 200); assert.match(r.headers.get('content-disposition'), /attachment; filename="touchline-data-/);
  assert.equal(r.json.account.email, 'export@test.dev'); assert.ok(r.json.account.termsAccepted);
  assert.equal(r.json.teamsYouRun.length, 1); assert.deepEqual(r.json.yourLibrary.mydrills, [{ name: 'My drill' }]);
  assert.ok(!r.text.includes('s1$'), 'password hash is never exported');
});

test('feedback and concerns reach the admin and the sender gets an acknowledgement', async () => {
  const c = client();
  assert.equal((await c.post('/api/report', { kind: 'concern', message: 'x' })).status, 400);
  const r = await c.post('/api/report', { kind: 'concern', message: 'This page shows a phone number', page: '/w/abc', email: 'parent@test.dev' });
  assert.equal(r.status, 201); await wait(150);
  assert.ok(emailsTo('owner@test.dev').some(e => e.includes('concern')), 'admin told');
  assert.ok(emailsTo('parent@test.dev').some(e => e.includes('received')), 'sender acknowledged');
});

test('updated terms must be agreed again', async () => {
  const c = client(); await signup(c, 'terms@test.dev');
  assert.equal((await c.post('/api/account/terms', { agree: false })).status, 400);
  assert.equal((await c.post('/api/account/terms', { agree: true })).status, 200);
});

test('delete my account removes the coach, their teams and player links', async () => {
  const c = client(); await signup(c, 'bye@test.dev');
  const tid = (await c.get('/api/teams')).json.teams[0].id;
  const slug = (await c.post(`/api/teams/${tid}/weeks`, { data: { title: 'W', train: [], items: [] } })).json.slug;
  assert.equal((await c.post('/api/account/delete', { password: 'wrong-pass' })).status, 403);
  assert.equal((await c.post('/api/account/delete', { password: 'password-123' })).status, 200);
  assert.equal((await c.get('/api/me')).status, 401);
  assert.equal((await client().get('/w/' + slug)).status, 404);
  assert.equal((await client().post('/api/login', { email: 'bye@test.dev', password: 'password-123' })).status, 401);
  await wait(150); assert.ok(emailsTo('bye@test.dev').some(e => e.includes('deleted')));
});

test('too many wrong logins are slowed down', async () => {
  const c = client(); let last;
  for (let i = 0; i < 12; i++) last = await c.post('/api/login', { email: 'brute@test.dev', password: 'guess-' + i });
  assert.equal(last.status, 429);
});
