#!/usr/bin/env node
// Gig-market scan for the video-advisor skill: how crowded a freelance niche
// is and what it pays, from Kwork's public search (kwork.ru).
//
// Fiverr and Upwork block scripted requests (captcha), so for them the skill
// uses web search; Kwork answers plain HTTP and gives the three numbers that
// matter for a quick-money gig:
//   offers   — how many sellers already sell it (competition)
//   price    — p25 / median / p75 of the first page (what the market pays)
//   reviews  — reviews of the top sellers (proof that buyers exist; a niche
//              with 3000 offers and nobody past 20 reviews has no buyers)
//
// No dependencies; HTTP goes through curl, so HTTPS_PROXY is respected.
//
// Usage:
//   node video-advisor/scripts/kwork-scan.mjs "лендинг" "адаптивная вёрстка" "анимация сайта"
//   node video-advisor/scripts/kwork-scan.mjs --json "лендинг"

import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const queries = args.filter((a) => a !== '--json');
if (!queries.length) {
  console.error('usage: kwork-scan.mjs [--json] "<query>" ["<query>" ...]');
  process.exit(2);
}

function fetchPage(q) {
  const url = `https://kwork.ru/search?query=${encodeURIComponent(q)}&c=all`;
  return execFileSync('curl', ['-sS', '--fail', '--max-time', '40', '-A', 'Mozilla/5.0', url], {
    encoding: 'utf8', maxBuffer: 32 * 1024 * 1024,
  });
}

// The page embeds its search state as JSON; pull the "data":[...] array of
// kworks out by bracket matching rather than trusting a regex on prices.
function extractItems(html) {
  const start = html.indexOf('"data":[{"id"');
  if (start < 0) return [];
  const seg = html.slice(start + 7);
  let depth = 0, inStr = false, esc = false;
  for (let i = 0; i < seg.length; i++) {
    const ch = seg[i];
    if (inStr) {
      if (esc) esc = false;
      else if (ch === '\\') esc = true;
      else if (ch === '"') inStr = false;
      continue;
    }
    if (ch === '"') inStr = true;
    else if (ch === '[') depth++;
    else if (ch === ']' && --depth === 0) return JSON.parse(seg.slice(0, i + 1));
  }
  return [];
}

const pct = (sorted, p) => (sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] : null);

const results = [];
for (const q of queries) {
  try {
    const html = fetchPage(q);
    const items = extractItems(html);
    // Several "total" fields exist (an empty paging stub reads 0); the real one is the largest.
    const total = Math.max(0, ...[...html.matchAll(/"total":(\d+),"total_formatted"/g)].map((m) => +m[1]));
    const prices = items.map((x) => +x.price).filter(Boolean).sort((a, b) => a - b);
    const top = items
      .map((x) => ({ title: x.gtitle, price: +x.price, reviews: +x.userRatingCount || 0, url: `https://kwork.ru${x.url}` }))
      .sort((a, b) => b.reviews - a.reviews)
      .slice(0, 5);
    results.push({ query: q, offers: total, sample: items.length, p25: pct(prices, 0.25), median: pct(prices, 0.5), p75: pct(prices, 0.75), top });
  } catch (e) {
    results.push({ query: q, error: String(e.stderr || e.message).trim().split('\n').pop() });
  }
}

if (asJson) {
  console.log(JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), results }, null, 2));
} else {
  console.log(`Kwork, ${new Date().toISOString().slice(0, 10)} (prices in ₽ from the first page of results)\n`);
  for (const r of results) {
    if (r.error) { console.log(`## ${r.query}\n  error: ${r.error}\n`); continue; }
    console.log(`## ${r.query}`);
    console.log(`  offers: ${r.offers} · price p25/median/p75: ${r.p25} / ${r.median} / ${r.p75} (n=${r.sample})`);
    for (const t of r.top) console.log(`  ${String(t.reviews).padStart(5)} reviews · ${String(t.price).padStart(6)} ₽ · ${t.title}`);
    console.log();
  }
}
