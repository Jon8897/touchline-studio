/* Checks the built files themselves: every page exists and every script in them is valid JavaScript. */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const PUB = path.join(ROOT, 'dist', 'touchline', 'public');
const scripts = html => [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);

for (const f of ['index.html', 'landing.html', 'privacy.html', 'terms.html', 'safeguarding.html', 'cookies.html', 'og.png'])
  test(`built ${f}`, () => assert.ok(fs.statSync(path.join(PUB, f)).size > 1000, `${f} is missing or empty`));

for (const [name, file] of [['app', path.join(PUB, 'index.html')], ['front page', path.join(PUB, 'landing.html')], ['preview', path.join(ROOT, 'dist', 'preview.html')]])
  test(`${name}: scripts are valid JavaScript`, () => {
    const html = fs.readFileSync(file, 'utf8'); const list = scripts(html);
    assert.ok(list.length > 0);
    list.forEach((s, i) => assert.doesNotThrow(() => new vm.Script(s, { filename: `${name}-script-${i}.js` })));
  });

test('legal pages are linked from the front page footer', () => {
  const html = fs.readFileSync(path.join(PUB, 'landing.html'), 'utf8');
  for (const p of ['/privacy', '/terms', '/safeguarding', '/cookies']) assert.ok(html.includes(`href="${p}"`), `footer links to ${p}`);
});

test('no draft markers left in the legal pages', () => {
  for (const f of ['privacy.html', 'terms.html', 'safeguarding.html', 'cookies.html']) {
    const html = fs.readFileSync(path.join(PUB, f), 'utf8');
    assert.ok(!/\{\{\w+\}\}/.test(html), `${f} has an unreplaced {{detail}}`);
    if (process.env.REQUIRE_FINAL_LEGAL) assert.ok(!html.includes('[fill in:'), `${f} still has blanks: fill in app/legal-details.json`);
  }
});
