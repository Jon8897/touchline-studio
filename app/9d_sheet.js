/* ===== Team sheet: squad list, pick the side, publish it in the weekly link =====
   Squad = first names / nicknames + shirt numbers only (no surnames or other details).
   Stored in the team's weekly draft, so assistants share it and it survives "Start a new week". */
const SS_FORMS = [
  // 5-a-side (GK + 4)
  { id: 's5-121', size: 5, name: '1-2-1', pos: [['D', 50, 76], ['LM', 22, 58], ['RM', 78, 58], ['F', 50, 38]] },
  { id: 's5-22', size: 5, name: '2-2', pos: [['LD', 32, 74], ['RD', 68, 74], ['LF', 32, 44], ['RF', 68, 44]] },
  // 7-a-side (GK + 6)
  { id: 's7-231', size: 7, name: '2-3-1', pos: [['LD', 32, 76], ['RD', 68, 76], ['LM', 16, 54], ['CM', 50, 58], ['RM', 84, 54], ['ST', 50, 34]] },
  { id: 's7-321', size: 7, name: '3-2-1', pos: [['LB', 18, 72], ['CB', 50, 77], ['RB', 82, 72], ['LM', 34, 54], ['RM', 66, 54], ['ST', 50, 34]] },
  { id: 's7-2121', size: 7, name: '2-1-2-1', pos: [['LD', 32, 77], ['RD', 68, 77], ['DM', 50, 64], ['LM', 20, 48], ['RM', 80, 48], ['ST', 50, 32]] },
  // 9-a-side (GK + 8)
  { id: 's9-332', size: 9, name: '3-3-2', pos: [['LB', 18, 74], ['CB', 50, 78], ['RB', 82, 74], ['LM', 16, 54], ['CM', 50, 58], ['RM', 84, 54], ['LS', 38, 34], ['RS', 62, 34]] },
  { id: 's9-323', size: 9, name: '3-2-3', pos: [['LB', 18, 74], ['CB', 50, 78], ['RB', 82, 74], ['LCM', 36, 58], ['RCM', 64, 58], ['LW', 16, 38], ['ST', 50, 32], ['RW', 84, 38]] },
  { id: 's9-3131', size: 9, name: '3-1-3-1', pos: [['LB', 18, 74], ['CB', 50, 78], ['RB', 82, 74], ['DM', 50, 63], ['LM', 16, 48], ['AM', 50, 46], ['RM', 84, 48], ['ST', 50, 30]] },
];
const ssForm = id => {
  const s = SS_FORMS.find(f => f.id === id);
  if (s) return { id: s.id, size: s.size, name: `${s.name} (${s.size}-a-side)`, slots: [['GK', 50, 94], ...s.pos] };
  const F = FORMATIONS.find(f => f.id === id) || FORMATIONS[0];
  return { id: F.id, size: 11, name: `${F.name} ${F.v}`, slots: F.r.map((r, i) => [r, F.b[i][0], F.b[i][1]]) };
};
const ssFormOptions = cur => {
  const grp = (label, list) => `<optgroup label="${label}">${list.map(f => `<option value="${f.id}"${f.id === cur ? ' selected' : ''}>${f.name}</option>`).join('')}</optgroup>`;
  const elevens = FORMATIONS.filter((f, i, a) => a.findIndex(x => x.id === f.id) === i).map(f => ({ id: f.id, name: `${f.name} ${f.v}` }));
  return [5, 7, 9].map(n => grp(`${n}-a-side`, SS_FORMS.filter(f => f.size === n))).join('') + grp('11-a-side', elevens);
};
const ssBlank = (form = '433') => ({ on: true, form, xi: [], subs: [], out: [], cap: '', meet: '', kit: '', note: '' });
const ssId = () => Math.random().toString(36).slice(2, 9);
function ssEnsure() {
  WK.squad = Array.isArray(WK.squad) ? WK.squad : [];
  WK.sheet = WK.sheet && typeof WK.sheet === 'object' ? { ...ssBlank(WK.sheet.form || '433'), ...WK.sheet } : ssBlank();
  const S = WK.sheet, n = ssForm(S.form).slots.length, ids = new Set(WK.squad.map(p => p.id));
  S.xi = Array.from({ length: n }, (_, i) => (ids.has(S.xi[i]) ? S.xi[i] : ''));
  const inXI = new Set(S.xi.filter(Boolean));
  S.subs = S.subs.filter(id => ids.has(id) && !inXI.has(id));
  S.out = S.out.filter(id => ids.has(id) && !inXI.has(id) && !S.subs.includes(id));
  if (S.cap && !inXI.has(S.cap) && !S.subs.includes(S.cap)) S.cap = '';
}
const ssP = id => WK.squad.find(p => p.id === id);
const ssLabel = p => (p ? `${p.num ? p.num + ' ' : ''}${p.name}` : '');
const ssSort = list => list.slice().sort((a, b) => (+a.num || 999) - (+b.num || 999) || a.name.localeCompare(b.name));

/* pitch drawing, shared by the coach card and the player page. players: [{label,x,y,name,num,cap}] */
function ssPitchSVG(players, opts = {}) {
  const X = x => x * 0.68, Y = y => y * 1.05, y0 = 22, y1 = 103;
  const L = 'stroke="rgba(255,255,255,.55)" stroke-width=".35" fill="none"';
  const stripes = Array.from({ length: 8 }, (_, i) => `<rect x="0" y="${Y(y0 + i * 10)}" width="68" height="${Y(5)}" fill="rgba(255,255,255,.035)"/>`).join('');
  const toks = players.map(p => {
    const has = !!p.name, cx = X(p.x), cy = Y(p.y), nm = has ? p.name : (opts.empty || '');
    const short = nm.length > 11 ? nm.slice(0, 10) + '…' : nm;
    return `<g class="sstok${has ? '' : ' empty'}"${opts.slots ? ` data-shslot="${p.i}"` : ''}>
      <circle cx="${cx}" cy="${cy}" r="3.6" fill="${has ? 'url(#ssGold)' : 'rgba(255,255,255,.08)'}" stroke="${has ? '#7a5a10' : 'rgba(255,255,255,.4)'}" stroke-width=".35" ${has ? '' : 'stroke-dasharray="1 .8"'}/>
      <text x="${cx}" y="${cy + 1.15}" text-anchor="middle" font-size="${has && p.num ? 3.1 : 2.2}" font-weight="800" fill="${has ? '#241a04' : 'rgba(255,255,255,.75)'}" font-family="Barlow,system-ui,sans-serif">${esc(has ? (p.num || p.label) : p.label)}</text>
      ${short ? `<text x="${cx}" y="${cy + 6.7}" text-anchor="middle" font-size="2.55" font-weight="700" fill="#fff" stroke="rgba(0,0,0,.65)" stroke-width=".5" paint-order="stroke" font-family="Barlow,system-ui,sans-serif">${esc(short)}${p.cap ? ' (C)' : ''}</text>` : ''}
    </g>`;
  }).join('');
  return `<svg class="sspitch" viewBox="0 ${Y(y0)} 68 ${Y(y1 - y0)}" role="img" aria-label="${esc(opts.aria || 'Team sheet')}">
    <defs><radialGradient id="ssGold" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#ffe08a"/><stop offset=".6" stop-color="#e7b53c"/><stop offset="1" stop-color="#a77812"/></radialGradient></defs>
    <rect x="0" y="${Y(y0)}" width="68" height="${Y(y1 - y0)}" fill="#13392a"/>${stripes}
    <rect x="1.5" y="${Y(y0)}" width="65" height="${Y(99.5) - Y(y0)}" ${L}/>
    <line x1="1.5" y1="${Y(50)}" x2="66.5" y2="${Y(50)}" ${L}/><circle cx="34" cy="${Y(50)}" r="9.15" ${L}/>
    <rect x="13.84" y="${Y(99.5) - 16.5}" width="40.32" height="16.5" ${L}/><rect x="24.84" y="${Y(99.5) - 5.5}" width="18.32" height="5.5" ${L}/>
    <path d="M26.7 ${Y(99.5) - 16.5} A9.15 9.15 0 0 1 41.3 ${Y(99.5) - 16.5}" ${L}/>
    ${toks}</svg>`;
}
const ssPlayersForPitch = (opts = {}) => { const S = WK.sheet; return ssForm(S.form).slots.map(([label, x, y], i) => { const p = ssP(S.xi[i]); return { i, label, x, y, name: p ? p.name : '', num: p ? p.num : '', cap: p && S.cap === p.id }; }); };

/* ---------- coach card (Team week) ---------- */
function sheetCard() {
  ssEnsure();
  const S = WK.sheet, F = ssForm(S.form), squad = ssSort(WK.squad), inXI = new Set(S.xi.filter(Boolean));
  const opt = (sel, avoid) => `<option value="">-</option>` + squad.map(p => `<option value="${p.id}"${p.id === sel ? ' selected' : ''}${p.id !== sel && avoid.has(p.id) ? ' data-taken="1"' : ''}>${esc(ssLabel(p))}${p.id !== sel && avoid.has(p.id) ? ' (picked)' : ''}</option>`).join('');
  const rest = squad.filter(p => !inXI.has(p.id));
  const picked = S.xi.filter(Boolean).length;
  return `<div class="card sheetcard" id="sheetCard">
    <div class="sshead"><h3>Team sheet</h3><label class="check"><input type="checkbox" id="shOn"${S.on ? ' checked' : ''}> Include in this week’s post</label></div>
    <details class="sssquad"${WK.squad.length ? '' : ' open'}><summary><b>Squad</b> <span class="muted">${WK.squad.length} player${WK.squad.length === 1 ? '' : 's'}</span></summary>
      <p class="hint" style="margin-top:6px">First names or nicknames only, no surnames. Players under 18 are visible to anyone with the link.</p>
      ${squad.length ? `<div class="sschips">${squad.map(p => `<span class="sschip"><b>${esc(p.num || '–')}</b> ${esc(p.name)}<button class="ssx" data-shdel="${p.id}" aria-label="Remove ${esc(p.name)}">×</button></span>`).join('')}</div>` : ''}
      <div class="ssadd"><input id="shNum" class="inp sm" inputmode="numeric" maxlength="3" placeholder="No." aria-label="Shirt number"><input id="shName" class="inp sm" maxlength="20" placeholder="First name" aria-label="First name"><button class="btn ghost" id="shAdd">Add</button></div>
      <label class="fl" for="shBulk">Or paste a list, one per line, e.g. “7 Sam”</label><textarea id="shBulk" rows="3" placeholder="1 Alex&#10;2 Jordan&#10;7 Sam"></textarea>
      <div class="frow" style="margin-top:6px"><button class="btn ghost" id="shBulkGo">Add list</button></div>
    </details>
    ${WK.squad.length ? `
    <div class="ssgrid">
      <div class="sspitchwrap">${ssPitchSVG(ssPlayersForPitch(), { slots: true, empty: '', aria: `Starting line-up, ${F.name}` })}</div>
      <div class="ssside">
        <label class="fl" for="shForm">Formation</label><select id="shForm" class="sel">${ssFormOptions(S.form)}</select>
        <p class="fl" style="margin:12px 0 6px">Starting ${F.slots.length} <span class="muted" style="letter-spacing:.05em">· ${picked}/${F.slots.length} picked</span></p>
        <div class="ssxi">${F.slots.map(([label], i) => `<label class="ssrow"><span>${esc(label)}</span><select class="sel sm" data-shxi="${i}" aria-label="${esc(label)}">${opt(S.xi[i], inXI)}</select></label>`).join('')}</div>
        <div class="frow"><button class="btn ghost" id="shAuto">Fill in squad order</button><button class="btn ghost" id="shClearXI">Clear</button></div>
      </div>
    </div>
    ${rest.length ? `<p class="fl" style="margin:14px 0 6px">Everyone else</p><div class="ssrest">${rest.map(p => { const st = S.subs.includes(p.id) ? 'sub' : S.out.includes(p.id) ? 'out' : ''; return `<div class="ssr"><span>${esc(ssLabel(p))}</span><div class="ssseg"><button data-shst="${p.id}" data-v="sub" aria-pressed="${st === 'sub'}">Sub</button><button data-shst="${p.id}" data-v="out" aria-pressed="${st === 'out'}">Not available</button></div></div>`; }).join('')}</div><p class="hint">“Not available” players are only shown to coaches, never on the player page.</p>` : ''}
    <div class="fgrid">
      <div><label class="fl" for="shCap">Captain</label><select id="shCap" class="sel">${`<option value="">None</option>` + squad.filter(p => inXI.has(p.id) || S.subs.includes(p.id)).map(p => `<option value="${p.id}"${p.id === S.cap ? ' selected' : ''}>${esc(ssLabel(p))}</option>`).join('')}</select></div>
      <div><label class="fl" for="shMeet">Meet time</label><input id="shMeet" class="inp" data-shf="meet" maxlength="40" placeholder="e.g. 9:15 at the clubhouse" value="${esc(S.meet)}"></div>
      <div style="grid-column:1/-1"><label class="fl" for="shKit">Kit</label><input id="shKit" class="inp" data-shf="kit" maxlength="60" placeholder="e.g. Home kit, shin pads, water bottle" value="${esc(S.kit)}"></div>
      <div style="grid-column:1/-1"><label class="fl" for="shNote">Note on the team sheet (optional)</label><textarea id="shNote" data-shf="note" rows="2" maxlength="300" placeholder="e.g. Everyone will get game time. Subs warm up at half-time.">${esc(S.note)}</textarea></div>
    </div>
    <div class="frow"><button class="btn ghost" id="shCopy">Copy for group chat</button><button class="btn ghost" id="shPrint">Print</button></div>` : '<p class="muted" style="margin-top:10px">Add your squad to pick the team.</p>'}
  </div>`;
}
function ssRender() { const c = $('#sheetCard'); if (c) { const open = c.querySelector('details.sssquad')?.open; c.outerHTML = sheetCard(); if (open) { const d = $('#sheetCard details.sssquad'); if (d) d.open = true; } } }

/* what goes into the published week (only the picked players, never the "not available" list) */
function sheetPayload() {
  ssEnsure(); const S = WK.sheet; if (!S.on || !S.xi.some(Boolean)) return null;
  const F = ssForm(S.form), pub = p => p ? { name: p.name, num: p.num || '' } : null;
  return { form: F.name, size: F.slots.length, xi: F.slots.map(([label, x, y], i) => { const p = ssP(S.xi[i]); return { label, x, y, ...(pub(p) || { name: '', num: '' }), cap: !!p && p.id === S.cap }; }),
    subs: ssSort(S.subs.map(ssP).filter(Boolean)).map(p => ({ ...pub(p), cap: p.id === S.cap })), meet: S.meet, kit: S.kit, note: S.note };
}
function sheetText(sp, W) {
  const M = (W && W.match) || {}, lines = [];
  lines.push(`TEAM SHEET${M.opp ? ` · ${M.ha === 'Away' ? '@' : 'v'} ${M.opp}` : ''}`);
  if (M.date || M.time) lines.push([fmtDate(M.date), M.time && 'KO ' + M.time, M.venue].filter(Boolean).join(' · '));
  if (sp.meet) lines.push(`Meet: ${sp.meet}`);
  lines.push('', `Starting · ${sp.form}`);
  sp.xi.filter(p => p.name).forEach(p => lines.push(`${p.label}  ${p.num ? p.num + ' ' : ''}${p.name}${p.cap ? ' (C)' : ''}`));
  if (sp.subs.length) lines.push('', `Subs: ${sp.subs.map(p => `${p.num ? p.num + ' ' : ''}${p.name}${p.cap ? ' (C)' : ''}`).join(', ')}`);
  if (sp.kit) lines.push('', `Kit: ${sp.kit}`);
  if (sp.note) lines.push('', sp.note);
  return lines.join('\n');
}
/* player page section */
function sheetSection(sp, W) {
  if (!sp || !sp.xi) return '';
  return `<section class="card pvsheet"><div class="sshead"><div><p class="eyebrow">Team sheet</p><h3 class="pvh" style="margin:4px 0 0">${esc(sp.form)}</h3></div>${sp.meet ? `<div class="ssmeet"><small>MEET</small><b>${esc(sp.meet)}</b></div>` : ''}</div>
    <div class="ssgrid pv"><div class="sspitchwrap">${ssPitchSVG(sp.xi.map((p, i) => ({ ...p, i })), { aria: 'Starting line-up' })}</div>
    <div class="ssside">
      <p class="fl" style="margin:0 0 6px">Starting</p><ol class="sslist">${sp.xi.filter(p => p.name).map(p => `<li><span class="ssn">${esc(p.num || '')}</span><b>${esc(p.name)}</b>${p.cap ? '<span class="sscap">C</span>' : ''}<small>${esc(p.label)}</small></li>`).join('')}</ol>
      ${sp.subs.length ? `<p class="fl" style="margin:12px 0 6px">Subs</p><ol class="sslist">${sp.subs.map(p => `<li><span class="ssn">${esc(p.num || '')}</span><b>${esc(p.name)}</b>${p.cap ? '<span class="sscap">C</span>' : ''}</li>`).join('')}</ol>` : ''}
      ${sp.kit ? `<p class="sskit"><small>KIT</small> ${esc(sp.kit)}</p>` : ''}
      ${sp.note ? `<p class="muted" style="margin-top:8px">${esc(sp.note)}</p>` : ''}
    </div></div></section>`;
}
function sheetPrint(sp, W) {
  const M = (W && W.match) || {}, team = (W && W.team) || '';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>Team sheet${M.opp ? ' v ' + esc(M.opp) : ''}</title><style>
    body{font:14px/1.4 system-ui,Arial,sans-serif;color:#111;margin:24px}h1{margin:0;font-size:24px}p{margin:4px 0}.g{display:grid;grid-template-columns:300px 1fr;gap:24px;margin-top:16px;align-items:start}
    table{border-collapse:collapse;width:100%}td{border-bottom:1px solid #ccc;padding:5px 6px}td:first-child{width:40px;font-weight:700}.c{font-weight:700}svg{width:100%;height:auto;border-radius:8px}
    @media print{body{margin:10mm}}</style></head><body>
    <h1>${esc(team)} team sheet</h1><p>${[M.opp && `${M.ha === 'Away' ? 'Away at' : 'v'} ${esc(M.opp)}`, fmtDate(M.date), M.time && 'Kick-off ' + esc(M.time), esc(M.venue || '')].filter(Boolean).join(' · ')}</p>
    ${sp.meet ? `<p><b>Meet:</b> ${esc(sp.meet)}</p>` : ''}${sp.kit ? `<p><b>Kit:</b> ${esc(sp.kit)}</p>` : ''}
    <div class="g"><div>${ssPitchSVG(sp.xi.map((p, i) => ({ ...p, i })))}</div><div><h3>Starting · ${esc(sp.form)}</h3><table>${sp.xi.filter(p => p.name).map(p => `<tr><td>${esc(p.num || '')}</td><td>${esc(p.name)}${p.cap ? ' <span class="c">(C)</span>' : ''}</td><td>${esc(p.label)}</td></tr>`).join('')}</table>
    ${sp.subs.length ? `<h3>Subs</h3><table>${sp.subs.map(p => `<tr><td>${esc(p.num || '')}</td><td>${esc(p.name)}${p.cap ? ' (C)' : ''}</td></tr>`).join('')}</table>` : ''}
    ${sp.note ? `<p style="margin-top:12px">${esc(sp.note)}</p>` : ''}</div></div><script>onload=()=>setTimeout(()=>print(),200)<\/script></body></html>`;
  const w = window.open('', '_blank');
  if (!w) { toast('Allow pop-ups to print, or use “Copy for group chat”'); return; }
  w.document.open(); w.document.write(html); w.document.close();
}

/* ---------- events (Team week) ---------- */
function initSheet() {
  const body = $('#weekBody'); if (!body) return;
  const save = (re = true) => { saveDraft(); if (re) ssRender(); };
  const addPlayer = (num, name) => { name = String(name || '').replace(/[<>]/g, '').trim().slice(0, 20); num = String(num || '').replace(/\D/g, '').slice(0, 3); if (!name) return false; WK.squad.push({ id: ssId(), name, num }); return true; };
  body.addEventListener('click', e => {
    if (!$('#sheetCard') || !e.target.closest('#sheetCard')) return;
    ssEnsure(); const S = WK.sheet; let el;
    if (e.target.closest('#shAdd')) { if (addPlayer($('#shNum').value, $('#shName').value)) { save(); const d = $('#sheetCard details.sssquad'); if (d) d.open = true; setTimeout(() => $('#shName') && $('#shName').focus(), 0); } else toast('Type a first name'); return; }
    if (e.target.closest('#shBulkGo')) { let n = 0; $('#shBulk').value.split(/\n|,/).forEach(l => { const m = l.trim().match(/^#?(\d{1,3})?[\s.)-]*(.+)$/); if (m && addPlayer(m[1], m[2])) n++; }); if (n) { save(); toast(`${n} player${n > 1 ? 's' : ''} added`); } return; }
    if ((el = e.target.closest('[data-shdel]'))) { const id = el.dataset.shdel; WK.squad = WK.squad.filter(p => p.id !== id); save(); return; }
    if (e.target.closest('#shAuto')) { const used = new Set(S.xi.filter(Boolean)), pool = ssSort(WK.squad).filter(p => !used.has(p.id) && !S.out.includes(p.id)); S.xi = S.xi.map(id => id || (pool.shift() || {}).id || ''); S.subs = S.subs.filter(id => !S.xi.includes(id)); save(); return; }
    if (e.target.closest('#shClearXI')) { S.xi = S.xi.map(() => ''); save(); return; }
    if ((el = e.target.closest('[data-shst]'))) { const id = el.dataset.shst, v = el.dataset.v, cur = S.subs.includes(id) ? 'sub' : S.out.includes(id) ? 'out' : ''; S.subs = S.subs.filter(x => x !== id); S.out = S.out.filter(x => x !== id); if (cur !== v) (v === 'sub' ? S.subs : S.out).push(id); save(); return; }
    if ((el = e.target.closest('[data-shslot]'))) { const s = $(`[data-shxi="${el.dataset.shslot}"]`); if (s) { s.focus(); s.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); } return; }
    if (e.target.closest('#shCopy')) { const sp = sheetPayload(); if (!sp) { toast('Pick at least one player first'); return; } const t = sheetText(sp, WK); navigator.clipboard.writeText(t).then(() => toast('Team sheet copied: paste it in your group chat'), () => { prompt('Copy the team sheet:', t); }); return; }
    if (e.target.closest('#shPrint')) { const sp = sheetPayload(); if (!sp) { toast('Pick at least one player first'); return; } sheetPrint(sp, { ...WK, team: (coachCfg() || {}).team }); return; }
  });
  body.addEventListener('keydown', e => { if (e.key === 'Enter' && (e.target.id === 'shName' || e.target.id === 'shNum')) { e.preventDefault(); $('#shAdd').click(); } });
  body.addEventListener('change', e => {
    const t = e.target; if (!t.closest || !t.closest('#sheetCard')) return; ssEnsure(); const S = WK.sheet;
    if (t.id === 'shOn') { S.on = t.checked; save(false); toast(t.checked ? 'Team sheet will be in this week’s post' : 'Team sheet left out of this week’s post'); return; }
    if (t.id === 'shForm') { const old = S.xi.filter(Boolean); S.form = t.value; const n = ssForm(S.form).slots.length; S.xi = Array.from({ length: n }, (_, i) => old[i] || ''); const extra = old.slice(n); S.subs = [...new Set([...extra, ...S.subs])]; save(); return; }
    if (t.dataset.shxi != null) { const i = +t.dataset.shxi, id = t.value; const j = S.xi.indexOf(id); if (id && j > -1 && j !== i) S.xi[j] = S.xi[i]; S.xi[i] = id; S.subs = S.subs.filter(x => x !== id); S.out = S.out.filter(x => x !== id); save(); return; }
    if (t.id === 'shCap') { S.cap = t.value; save(); return; }
  });
  body.addEventListener('input', e => { const t = e.target; if (t.dataset && t.dataset.shf) { ssEnsure(); WK.sheet[t.dataset.shf] = t.value; saveDraft(); } });
}
