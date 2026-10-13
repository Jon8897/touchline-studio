/* ===== Currency: the visitor's choice, or a guess from their time zone and language. Prices come from prices.json (MONEY). ===== */
const CUR_KEY = 'tls:cur';
const CA_TZ = /^America\/(Toronto|Montreal|Vancouver|Edmonton|Calgary|Winnipeg|Halifax|Regina|St_Johns|Moncton|Whitehorse|Yellowknife|Iqaluit|Glace_Bay|Goose_Bay|Swift_Current|Dawson_Creek|Dawson|Fort_Nelson|Creston|Inuvik|Rankin_Inlet|Resolute|Cambridge_Bay|Atikokan|Blanc-Sablon|Nipigon|Thunder_Bay|Rainy_River|Pangnirtung)$/;
function curGuess() {
  try { const s = localStorage.getItem(CUR_KEY); if (s && MONEY.currencies[s]) return s; } catch (e) {}
  let tz = ''; try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  const lang = (navigator.languages && navigator.languages[0]) || navigator.language || '', region = (lang.split('-')[1] || '').toUpperCase();
  if (/^Europe\/(London|Belfast|Guernsey|Jersey|Isle_of_Man)$/.test(tz)) return 'gbp';
  if (/^Australia\//.test(tz)) return 'aud';
  if (/^Pacific\/(Auckland|Chatham)$/.test(tz)) return 'nzd';
  if (CA_TZ.test(tz)) return 'cad';
  if (/^(America\/|Pacific\/Honolulu)/.test(tz)) return 'usd';
  if (/^(Europe\/|Atlantic\/(Canary|Madeira|Azores)|Asia\/Nicosia)/.test(tz)) return 'eur';
  const byRegion = { GB: 'gbp', IE: 'eur', US: 'usd', CA: 'cad', AU: 'aud', NZ: 'nzd' };
  if (byRegion[region]) return byRegion[region];
  return tz ? 'usd' : MONEY.default;
}
function curSet(c) { try { localStorage.setItem(CUR_KEY, c); } catch (e) {} }
function curFmt(c, minor) { const C = MONEY.currencies[c] || MONEY.currencies[MONEY.default]; return C.symbol + (minor % 100 ? (minor / 100).toFixed(2) : String(minor / 100)); }
function curOptions(sel) { return Object.entries(MONEY.currencies).map(([c, v]) => `<option value="${c}"${c === sel ? ' selected' : ''}>${v.symbol} ${v.code}</option>`).join(''); }
/* fill every [data-p="coach_monthly"] etc. on the page, and [data-cur] with the currency code */
function curApply(c) {
  const C = MONEY.currencies[c]; if (!C) return;
  document.querySelectorAll('[data-p]').forEach(e => { const k = e.dataset.p; e.textContent = k === 'zero' ? curFmt(c, 0) : curFmt(c, C[k]); });
  document.querySelectorAll('[data-cur]').forEach(e => { e.textContent = C.code; });
  document.querySelectorAll('select[data-cursel]').forEach(s => { s.value = c; });
}
