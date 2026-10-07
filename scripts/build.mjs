#!/usr/bin/env node
/* Builds everything from app/ and server/ into dist/:
     dist/touchline/            the server package that gets deployed (server code + public/ pages)
     dist/touchline-<ver>.tar.gz  the same, packed for the pipeline
     dist/preview.html          single-file preview (home page + app, no server needed)
   Usage: node scripts/build.mjs [--version abc123] [--no-tar]                                   */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const APP = path.join(ROOT, 'app'), SRV = path.join(ROOT, 'server'), DIST = path.join(ROOT, 'dist');
const OUT = path.join(DIST, 'touchline'), PUB = path.join(OUT, 'public');
const arg = n => { const i = process.argv.indexOf(n); return i > 0 ? process.argv[i + 1] : null; };
const read = f => fs.readFileSync(f, 'utf8');

let version = arg('--version') || process.env.GITHUB_SHA || '';
if (!version) { try { version = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: ROOT, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); } catch { version = 'dev'; } }
version = version.slice(0, 12);

/* order matters: later files use what earlier ones define */
const APP_JS = ['2_engine', '3_formations', '3b_plans', '3c_context', '3d_playbook', '3e_phases', '3f_defvar', '3g_attvar', '4_positions',
  '5_drills', '5b_drills', '5c_drills', '7b_compose', '7_coach', '8_sessions', '8b_drilledit', '9_team', '9b_cloud', '9c_safety', '9d_sheet', '9e_billing', '6_app'];
const ENGINE_JS = ['2_engine', '3_formations', '3b_plans', '3c_context', '3d_playbook', '3e_phases', '3f_defvar', '3g_attvar'];
const js = list => list.map(n => read(path.join(APP, n + '.js'))).join('\n');

const FAV = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='%230b0f0e' stroke='%23e7b53c' stroke-width='2.5'/%3E%3Ccircle cx='20' cy='20' r='6' fill='none' stroke='%23e7b53c' stroke-width='2.5'/%3E%3Ccircle cx='29' cy='13' r='3.5' fill='%23ec5157'/%3E%3C/svg%3E";
const BASE_CSS = 'html{-webkit-text-size-adjust:100%}body{margin:0}[hidden]{display:none!important}img{max-width:100%}';

const shell = read(path.join(APP, '1_shell.html'));
const cut = shell.indexOf('</style>') + 8;
const shellHead = shell.slice(0, cut), shellBody = shell.slice(cut);
const headWithGoogleFonts = shellHead.replace(/<title>[^<]*<\/title>/, '');
// served pages use our own copy of the fonts (no visitor IPs sent to Google); the single-file preview keeps Google Fonts
const headNoTitle = headWithGoogleFonts.replace(/<link rel="preconnect"[^>]*fonts\.g[^>]*>\s*/g, '').replace(/<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com[^>]*>/, '<link rel="preload" href="/fonts/big-shoulders-display-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin><link rel="stylesheet" href="/fonts/fonts.css">');
if (headNoTitle === headWithGoogleFonts) throw new Error('Font link not found in 1_shell.html');
const landingCss = read(path.join(APP, 'landing/landing.css'));
const landingBodyRaw = read(path.join(APP, 'landing/body.html'));
const landingJs = read(path.join(APP, 'landing/landing.js'));
const demoDrills = JSON.stringify(JSON.parse(read(path.join(APP, 'landing/demo_drills.json'))));
const appScript = js(APP_JS);
/* business details for the legal pages: {{businessName}} etc. Empty ones show as [fill in: ...] and block production */
const LEGAL = JSON.parse(read(path.join(APP, 'legal-details.json')));
const label = k => k.replace(/([A-Z])/g, ' $1').toLowerCase();
/* <!--if:key-->…<!--/if--> keeps a passage only when that detail is filled in */
const ifDetails = html => html.replace(/<!--if:(\w+)-->([\s\S]*?)<!--\/if-->/g, (m, k, inner) => (String(LEGAL[k] || '').trim() ? inner : ''));
const fillDetails = html => ifDetails(html).replace(/mailto:\{\{contactEmail\}\}/g, 'mailto:' + (String(LEGAL.contactEmail || '').trim() || 'hello@touchlinestudio.com')).replace(/\{\{(\w+)\}\}/g, (m, k) => {
  if (!(k in LEGAL)) throw new Error(`Unknown legal detail {{${k}}}`);
  const v = String(LEGAL[k] || '').trim();
  if (v) return v.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return (LEGAL._optional || []).includes(k) ? '' : `<mark class="fillin">[fill in: ${label(k)}]</mark>`;
});
const landingBody = fillDetails(landingBodyRaw);

const doc = ({ title, meta = '', head, body, bodyClass = '' }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${title}</title>
<meta name="theme-color" content="#0b0f0e">
<meta name="app-version" content="${version}">
<meta name="author" content="KeefeCodes (https://keefecodes.com/)">
<link rel="icon" href="${FAV}">
${meta}
<style>${BASE_CSS}</style>
${head}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
${body}
</body>
</html>
`;

/* ---------- 1. the app (/app, /demo, /w/...) ---------- */
const appHtml = doc({
  title: 'Touchline Studio',
  meta: '<meta name="description" content="Touchline Studio: animated football formations, attacking and defending patterns, position deep dives, 100 drills, a session planner and fitness plans.">',
  head: headNoTitle,
  body: `${shellBody}\n<script>\n${appScript}\n</script>`,
});

/* ---------- 2. the front page (/) ---------- */
const DESC = 'Animated football tactics, 100 drills, a session planner and one weekly link for your players. Built for grassroots coaches. Free while in beta.';
const landingMeta = `<meta name="description" content="${DESC}">
<meta property="og:type" content="website"><meta property="og:site_name" content="Touchline Studio">
<meta property="og:title" content="Touchline Studio · Plan the week. Show the players.">
<meta property="og:description" content="${DESC}">
<meta property="og:image" content="__BASE__/og.png"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630">
<meta property="og:url" content="__BASE__/"><meta name="twitter:card" content="summary_large_image">`;
const landingHtml = doc({
  title: 'Touchline Studio · Football coaching made simple',
  meta: landingMeta,
  head: `${headNoTitle}\n<style>html{scroll-behavior:smooth}section[id]{scroll-margin-top:70px}${landingCss}</style>`,
  body: `${landingBody}\n<script>\n${js(ENGINE_JS)}\nconst DEMO_DRILLS=${demoDrills};\n${landingJs}\n</script>`,
});

/* ---------- 3. legal and info pages (/privacy, /terms, /safeguarding, ...) ---------- */
const nav = landingBody.slice(0, landingBody.indexOf('<main>')).replace(/href="#(demo|features|how|pricing|faq)"/g, 'href="/#$1"');
const foot = landingBody.slice(landingBody.indexOf('<footer'));
const PAGE_TITLES = { guide: 'How to use Touchline', refunds: 'Refund and cancellation policy', privacy: 'Privacy policy', terms: 'Terms and conditions', safeguarding: 'Safeguarding', cookies: 'Cookies', 'acceptable-use': 'Acceptable use' };
const pages = {};
for (const f of fs.readdirSync(path.join(APP, 'pages')).filter(f => f.endsWith('.html'))) {
  const name = f.replace(/\.html$/, '');
  pages[name] = doc({
    title: `${PAGE_TITLES[name] || name} · Touchline Studio`,
    head: `${headNoTitle}\n<style>${landingCss}</style>`,
    bodyClass: 'landing',
    body: `${nav}\n${fillDetails(read(path.join(APP, 'pages', f)))}\n${foot}\n<script>document.getElementById('yr').textContent=new Date().getFullYear()</script>`,
  });
}

/* ---------- 4. single-file preview: home page first, buttons open the app ---------- */
const previewGlue = read(path.join(ROOT, 'scripts/preview-glue.js'));
const previewCss = `${landingCss}
body.sitemode{padding-bottom:0}
body.sitemode>*:not(#site){display:none!important}
body:not(.sitemode)>#site{display:none}
#site a[href="/privacy"],#site a[href="/terms"],#site a[href="/safeguarding"],#site a[href="/cookies"],#site a[href="/refunds"],#site a[href="/acceptable-use"]{display:none}
.homebar{position:relative;z-index:25}
@media(max-width:600px){.homebar span{display:none}}`;
const previewLanding = landingJs.replace(/^\/\* redirect old app links[\s\S]*?\n[\s\S]*?\n/, '');
const previewHtml = doc({
  title: 'Touchline Studio',
  head: `${headWithGoogleFonts}\n<style>${previewCss}</style>`,
  body: `<script>window.__H0=location.hash</script>\n<div id="site">\n${landingBody.replace('<main>', '<div class="lmain">').replace('</main>', '</div>')}\n</div>\n${shellBody}
<script>\n${appScript}\n</script>\n<script>\nconst DEMO_DRILLS=${demoDrills};\n${previewLanding}\n${previewGlue}\n</script>`,
});

/* ---------- write ---------- */
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(PUB, { recursive: true });
for (const f of ['server.js', 'lib.js', 'mailer.js', 'billing.js', 'admin.js', 'package.json', '.env.example']) fs.copyFileSync(path.join(SRV, f), path.join(OUT, f));
fs.writeFileSync(path.join(OUT, 'VERSION'), version + '\n');
fs.writeFileSync(path.join(PUB, 'index.html'), appHtml);
fs.writeFileSync(path.join(PUB, 'landing.html'), landingHtml);
for (const [n, h] of Object.entries(pages)) fs.writeFileSync(path.join(PUB, n + '.html'), h);
fs.cpSync(path.join(APP, 'assets'), PUB, { recursive: true });
fs.mkdirSync(path.join(OUT, 'deploy'), { recursive: true });
fs.cpSync(path.join(ROOT, 'deploy'), path.join(OUT, 'deploy'), { recursive: true });
fs.writeFileSync(path.join(DIST, 'preview.html'), previewHtml);

if (!process.argv.includes('--no-tar')) {
  const tar = path.join(DIST, `touchline-${version}.tar.gz`);
  execFileSync('tar', ['-czf', tar, '-C', DIST, 'touchline']);
  console.log(`Packed ${path.relative(ROOT, tar)}`);
}
const kb = f => Math.round(fs.statSync(f).size / 1024) + ' KB';
console.log(`Built version ${version}: app ${kb(path.join(PUB, 'index.html'))}, front page ${kb(path.join(PUB, 'landing.html'))}, pages: ${Object.keys(pages).join(', ')}, preview ${kb(path.join(DIST, 'preview.html'))}`);
