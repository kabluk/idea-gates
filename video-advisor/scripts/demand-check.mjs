#!/usr/bin/env node
// Demand check for the video-advisor skill: before a gig or niche is called
// "free" or "underserved", measure whether anyone is looking for it.
//
// Few competitors means one of two things — nobody noticed, or nobody buys.
// The Typeform case settled which is more common: "self hosted typeform" had
// 10 searches a month per country while "tally forms" (the free tool people
// actually switched to) had 4,400 and doubled in a year. This script makes
// that check a one-liner.
//
// Google Ads volumes via DataForSEO, 16 months of history, so the trend is
// honest year over year: the mean of the last 3 months vs the same 3 months
// a year earlier (single months measure Google's rounding, not demand).
// Series with a sudden multi-fold step are flagged — that is usually a Google
// re-categorisation, not people.
//
// Russia is not available in Google Ads data (Yandex Wordstat is the source
// there); for Russian-language queries the default locations are Kazakhstan
// Uzbekistan and Ukraine as a proxy, and Kwork reviews remain the main demand signal.
//
// Auth: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD. Cost: about $0.09 per location
// per call for up to 1000 keywords.
//
// Usage:
//   node video-advisor/scripts/demand-check.mjs "typeform alternative" "self hosted typeform" "tally forms"
//   node video-advisor/scripts/demand-check.mjs --loc US,UK,DE,IN "scroll animation website"
//   node video-advisor/scripts/demand-check.mjs "квиз для сайта" "лендинг"     # Cyrillic → KZ,UZ,UA by default
//   node video-advisor/scripts/demand-check.mjs --json "landing page"

import { execFileSync } from 'node:child_process';

const LOC = {
  US: 2840, UK: 2826, DE: 2276, FR: 2250, ES: 2724, IT: 2380, NL: 2528, PL: 2616, BR: 2076,
  MX: 2484, IN: 2356, CA: 2124, AU: 2036, AE: 2784, SG: 2702, KZ: 2398, UZ: 2860, UA: 2804,
};

const args = process.argv.slice(2);
const opt = (n) => { const i = args.indexOf(`--${n}`); return i >= 0 ? args[i + 1] : undefined; };
const asJson = args.includes('--json');
const keywords = args.filter((a, i) => !a.startsWith('--') && args[i - 1] !== '--loc');
if (!keywords.length) {
  console.error('usage: demand-check.mjs [--loc US,UK,DE] [--json] "<keyword>" ...');
  process.exit(2);
}
const cyrillic = keywords.some((k) => /[а-яё]/i.test(k));
const locs = (opt('loc') || (cyrillic ? 'KZ,UZ,UA' : 'US,UK,DE')).split(',').map((s) => s.trim().toUpperCase());

const { DATAFORSEO_LOGIN: login, DATAFORSEO_PASSWORD: password } = process.env;
if (!login || !password) {
  console.error('Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD (see scripts/README.md). Without them, say demand was not measured.');
  process.exit(1);
}
const auth = 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');

const d = new Date();
// 16 months back gives the last 3 months plus the same 3 months a year earlier.
const from = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 16, 1)).toISOString().slice(0, 10);

function volumes(code) {
  const body = JSON.stringify([{ keywords, location_code: code, date_from: from }]);
  const out = execFileSync('curl', ['-sS', '--max-time', '120', '-H', `Authorization: ${auth}`, '-H', 'Content-Type: application/json',
    '-X', 'POST', '--data-binary', body, 'https://api.dataforseo.com/v3/keywords_data/google_ads/search_volume/live'], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const json = JSON.parse(out);
  const t = json.tasks?.[0];
  if (json.status_code !== 20000 || t?.status_code !== 20000) throw new Error(t?.status_message || json.status_message);
  return { cost: t.cost || 0, rows: t.result || [] };
}

function trend(monthly) {
  // monthly_searches is newest first.
  const m = (monthly || []).map((x) => x.search_volume ?? 0);
  if (m.length < 15) return { yoy: null, step: false };
  const now = m[0] + m[1] + m[2], before = m[12] + m[13] + m[14];
  const nz = m.filter((v) => v > 0);
  const step = nz.length > 3 && Math.max(...nz) / Math.min(...nz) >= 4;
  return { yoy: before ? Math.round((now / before - 1) * 100) : null, step };
}

const byKw = Object.fromEntries(keywords.map((k) => [k, { keyword: k, total: 0, perLoc: {}, trends: {} }]));
let cost = 0;
for (const L of locs) {
  if (!LOC[L]) { console.error(`unknown location ${L}; known: ${Object.keys(LOC).join(',')}`); continue; }
  let r;
  try {
    r = volumes(LOC[L]);
  } catch (e) {
    console.error(`${L}: ${e.message} — skipped`);
    continue;
  }
  cost += r.cost;
  for (const row of r.rows) {
    const k = byKw[row.keyword] || byKw[keywords.find((x) => x.toLowerCase() === row.keyword)];
    if (!k) continue;
    k.perLoc[L] = row.search_volume ?? 0;
    k.total += row.search_volume ?? 0;
    k.trends[L] = trend(row.monthly_searches);
    if (row.cpc != null) k.cpc = Math.max(k.cpc || 0, row.cpc);
  }
}

// Monthly searches summed over the checked locations.
const verdict = (n) => (n < 50 ? 'noise — nobody is looking' : n < 500 ? 'niche — small but real' : n < 5000 ? 'market' : 'big market');
const rows = Object.values(byKw).map((k) => ({ ...k, verdict: verdict(k.total) })).sort((a, b) => b.total - a.total);

if (asJson) {
  console.log(JSON.stringify({ fetched: d.toISOString().slice(0, 10), locations: locs, costUsd: cost, rows }, null, 2));
} else {
  console.log(`Google monthly searches, ${d.toISOString().slice(0, 10)} · ${locs.join(', ')} · trend = last 3 months vs same 3 a year ago · cost $${cost.toFixed(2)}\n`);
  for (const r of rows) {
    const per = locs.map((L) => `${L} ${r.perLoc[L] ?? '–'}`).join(' · ');
    const main = locs.find((L) => r.perLoc[L] === Math.max(...locs.map((x) => r.perLoc[x] ?? 0)));
    const t = r.trends[main] || {};
    const trendTxt = t.yoy == null ? 'trend n/a' : `${t.yoy > 0 ? '+' : ''}${t.yoy}% (${main})${t.step ? ' ⚠ step in series — check before trusting' : ''}`;
    console.log(`${String(r.total).padStart(7)}  ${r.keyword}\n         ${per} · ${trendTxt}${r.cpc ? ` · CPC $${r.cpc.toFixed(2)}` : ''} → ${r.verdict}`);
  }
}
