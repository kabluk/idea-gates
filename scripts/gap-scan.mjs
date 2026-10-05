#!/usr/bin/env node
// Search-gap scanner for the idea-gates skill, source 5 (systematic gap scan)
// and the purchase-intent rule added after a Making Tax Digital (UK) run ("MTD").
//
// Pipeline: seed terms -> DataForSEO related keywords -> filter by intent
// patterns -> search volume -> rank -> (optional) SERP audit of the top gaps.
//
// The point is to separate two things the MTD run proved are different:
//   INFORMATIONAL intent ("what is X")     — big, and can be big while dying
//   PURCHASE intent     ("X software")     — what actually predicts revenue
//   TOOL intent         ("X calculator")   — what a free wedge can capture
// A candidate is interesting when TOOL intent has volume, PURCHASE intent is
// growing, and the SERP for the tool terms holds no interactive tool.
//
// Auth from env: DATAFORSEO_LOGIN, DATAFORSEO_PASSWORD.
//
// Usage:
//   node scripts/gap-scan.mjs --seeds "food safety compliance,haccp plan" --location US --out research/niche-search/scan-food.json
//   node scripts/gap-scan.mjs --seeds-file seeds.json --location UK --serp 5
//
// Options:
//   --seeds        comma-separated seed terms (or --seeds-file with a JSON array)
//   --location     US|UK|DE|ES|FR|IT|NL|PL|BR|... (default US)
//   --depth        related-keyword tree depth 0-4 (default 3; higher = wider, costs more)
//   --limit        max related keywords to pull per seed (default 200)
//   --min-volume   ignore keywords below this monthly volume (default 50)
//   --serp N       after ranking, audit SERPs for the top N tool-intent gaps (costs extra)
//   --out          where to write the JSON report

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const API = 'https://api.dataforseo.com/v3';

const LOCATIONS = {
  US: { code: 2840, lang: 'en' }, UK: { code: 2826, lang: 'en' },
  DE: { code: 2276, lang: 'de' }, ES: { code: 2724, lang: 'es' },
  FR: { code: 2250, lang: 'fr' }, IT: { code: 2380, lang: 'it' },
  NL: { code: 2528, lang: 'en' }, PL: { code: 2616, lang: 'pl' },
  BR: { code: 2076, lang: 'pt' }, MX: { code: 2484, lang: 'es' },
  AR: { code: 2032, lang: 'es' }, CL: { code: 2152, lang: 'es' },
  CO: { code: 2170, lang: 'es' }, UY: { code: 2858, lang: 'es' },
  PE: { code: 2604, lang: 'es' }, EC: { code: 2218, lang: 'es' },
  CA: { code: 2124, lang: 'en' }, AU: { code: 2036, lang: 'en' },
  IE: { code: 2372, lang: 'en' }, IN: { code: 2356, lang: 'en' },
  AE: { code: 2784, lang: 'en' }, SA: { code: 2682, lang: 'en' }, SG: { code: 2702, lang: 'en' },
};

// Intent buckets. A keyword can land in several; the report keeps them apart
// because a big informational cluster next to a dying purchase cluster is the
// signature of a market that has already bought (MTD, 2026-09).
const INTENT = {
  tool: /\b(calculator|calculate|checker|check if|generator|template|simulator|estimator|converter|worksheet|spreadsheet)\b/i,
  purchase: /\b(software|tool|tools|app|platform|service|provider|vendor|pricing|cost of|best|alternative|alternatives|vs)\b/i,
  informational: /\b(what is|what are|how to|how do|guide|meaning|explained|requirements|rules|deadline|do i need|does .* apply)\b/i,
  urgency: /\b(deadline|penalty|penalties|fine|fines|late|due date|compliance|comply|mandatory|required)\b/i,
};

function auth() {
  const { DATAFORSEO_LOGIN: login, DATAFORSEO_PASSWORD: password } = process.env;
  if (!login || !password) {
    console.error('Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD.');
    process.exit(1);
  }
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
}

// curl, not fetch: Node's fetch ignores HTTPS_PROXY, so behind a proxy it would fail.
function call(path, body) {
  const cliArgs = ['-sS', '-H', `Authorization: ${auth()}`, '-H', 'Content-Type: application/json'];
  if (body) cliArgs.push('-X', 'POST', '--data-binary', JSON.stringify(body));
  cliArgs.push(`${API}${path}`);
  const out = execFileSync('curl', cliArgs, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  let json;
  try { json = JSON.parse(out); } catch { throw new Error(`Non-JSON: ${out.slice(0, 300)}`); }
  if (json.status_code !== 20000) throw new Error(`API ${json.status_code}: ${json.status_message}`);
  return json;
}

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) args[argv[i].slice(2)] = argv[++i];
    else args._.push(argv[i]);
  }
  return args;
}

/**
 * Year-over-year change: mean of the last 3 months against the SAME 3 months
 * a year earlier. Two earlier versions of this were wrong, both in ways that
 * flipped signs on real keywords:
 *
 *   v1, single month vs the month 6 back — Google Ads reports volume in coarse
 *   buckets (…246k, 301k, 368k, 450k, 1M…), so one bucket step reads as a
 *   +/-20-30% "trend". Control: "how to tie a tie" showed +22% on flat demand.
 *
 *   v2, 3-month mean vs the 3 months 6 back — smooths the buckets but compares
 *   May-July against Nov-Jan, i.e. summer against winter. Control: "concrete
 *   calculator" read +58% (construction season) while it is actually -12% YoY.
 *
 * Same months, different years, is the only comparison that is neither noise
 * nor season. It needs more than 12 months of history, so it comes from the
 * Labs historical endpoint rather than from related_keywords.
 */
function trendYoY(monthlySearches) {
  if (!Array.isArray(monthlySearches) || monthlySearches.length < 15) return null;
  const series = [...monthlySearches].sort((a, b) =>
    b.year - a.year || b.month - a.month);
  const mean = (slice) => {
    if (!slice.length) return 0;
    return slice.reduce((sum, m) => sum + (m?.search_volume ?? 0), 0) / slice.length;
  };
  const recent = mean(series.slice(0, 3));
  const yearAgo = mean(series.slice(12, 15));
  if (!yearAgo) return null;
  return Math.round(((recent - yearAgo) / yearAgo) * 100);
}

/**
 * Flags a series whose shape makes its trend untrustworthy. Google's keyword
 * data occasionally re-buckets a term: the series sits flat for years, then
 * steps up several-fold within a month or two and decays. In a 2026-09 run,
 * "invoice generator" and "unit converter" — unrelated terms — both sat at
 * 40-60k for two years, then both peaked at exactly 550k in the same month.
 * That is a data event, not demand, and it produced +639% and +547% trends.
 * A step this sharp against a long flat base is the signature to distrust.
 */
function seriesSuspect(monthlySearches) {
  if (!Array.isArray(monthlySearches) || monthlySearches.length < 24) return false;
  const series = [...monthlySearches]
    .sort((a, b) => b.year - a.year || b.month - a.month)
    .slice(0, 26)
    .map(m => m?.search_volume ?? 0);
  const recentPeak = Math.max(...series.slice(0, 6));
  const baseline = series.slice(8, 26).filter(v => v > 0);
  if (!baseline.length || !recentPeak) return false;
  const baselineMax = Math.max(...baseline);
  // A recent peak several times the entire preceding two-year range.
  return recentPeak >= baselineMax * 4;
}

/** Fetch multi-year history and attach a YoY trend to each row, in chunks. */
function attachTrends(rows, location) {
  const byKeyword = new Map(rows.map(r => [r.keyword, r]));
  const keywords = [...byKeyword.keys()];
  for (let i = 0; i < keywords.length; i += 100) {
    const chunk = keywords.slice(i, i + 100);
    console.error(`  history ${i + 1}-${i + chunk.length} of ${keywords.length}`);
    const json = call('/dataforseo_labs/google/historical_search_volume/live', [{
      keywords: chunk,
      location_code: location.code,
      language_code: location.lang,
    }]);
    for (const item of json.tasks?.[0]?.result?.[0]?.items || []) {
      const row = byKeyword.get(item.keyword);
      if (!row) continue;
      const monthly = item.keyword_info?.monthly_searches;
      row.trend_yoy = trendYoY(monthly);
      row.series_suspect = seriesSuspect(monthly);
    }
  }
}

function classify(keyword) {
  return Object.entries(INTENT)
    .filter(([, re]) => re.test(keyword))
    .map(([name]) => name);
}

const args = parseArgs(process.argv.slice(2));
const seeds = args['seeds-file']
  ? JSON.parse(readFileSync(args['seeds-file'], 'utf8'))
  : (args.seeds || '').split(',').map(s => s.trim()).filter(Boolean);

if (!seeds.length) {
  console.error('Pass --seeds "term one,term two" or --seeds-file <file.json>.');
  process.exit(1);
}

const key = (args.location || 'US').toUpperCase();
const location = LOCATIONS[key];
if (!location) {
  console.error(`Unknown location "${key}". Known: ${Object.keys(LOCATIONS).join(', ')}`);
  process.exit(1);
}
const limit = Number(args.limit || 200);
const minVolume = Number(args['min-volume'] || 50);
// Depth 3 is the useful default: depth 2 returns a dozen keywords even for a
// live seed, which is too thin to tell a gap from a dead end.
const depth = Number(args.depth ?? 3);

// 1. Expand seeds into the keyword space around them.
console.error(`Expanding ${seeds.length} seed(s) in ${key}...`);
const expanded = new Map();
for (const seed of seeds) {
  const json = call('/dataforseo_labs/google/related_keywords/live', [{
    keyword: seed,
    location_code: location.code,
    language_code: location.lang,
    depth,
    limit,
  }]);
  for (const item of json.tasks?.[0]?.result?.[0]?.items || []) {
    const kd = item.keyword_data;
    if (!kd?.keyword) continue;
    const volume = kd.keyword_info?.search_volume ?? 0;
    if (volume < minVolume) continue;
    expanded.set(kd.keyword, {
      keyword: kd.keyword,
      volume,
      cpc: kd.keyword_info?.cpc ?? null,
      competition: kd.keyword_info?.competition ?? null,
      trend_yoy: null, // filled by attachTrends from multi-year history
      seed,
      intent: classify(kd.keyword),
    });
  }
  console.error(`  "${seed}" -> ${expanded.size} kept so far`);
}

const rows = [...expanded.values()].sort((a, b) => b.volume - a.volume);

// 1b. Year-over-year trends need multi-year history, which related_keywords
//     does not carry; fetch it for the kept set.
console.error(`Fetching history for ${rows.length} keywords...`);
attachTrends(rows, location);

// 2. Summarise per intent bucket. This is the part that would have killed MTD
//    on sight: purchase volume falling while informational volume stays big.
const buckets = {};
for (const name of Object.keys(INTENT)) {
  const inBucket = rows.filter(r => r.intent.includes(name));
  const totalVolume = inBucket.reduce((sum, r) => sum + r.volume, 0);
  // Suspect series are excluded from the median so one data glitch cannot
  // define a bucket's trend.
  const trends = inBucket.filter(r => !r.series_suspect)
    .map(r => r.trend_yoy).filter(t => t !== null);
  buckets[name] = {
    keywords: inBucket.length,
    total_volume: totalVolume,
    median_trend_yoy: trends.length
      ? trends.sort((a, b) => a - b)[Math.floor(trends.length / 2)]
      : null,
    top: inBucket.slice(0, 10).map(r => ({ keyword: r.keyword, volume: r.volume, trend_yoy: r.trend_yoy, cpc: r.cpc })),
  };
}

// 3. Verdict heuristics — advisory only; the gates in the skill still decide.
const flags = [];
const purchase = buckets.purchase, tool = buckets.tool, info = buckets.informational;
if (purchase.median_trend_yoy !== null && purchase.median_trend_yoy <= -20) {
  flags.push(`PURCHASE INTENT FALLING YoY (median ${purchase.median_trend_yoy}%) — the market may have already bought; check whether a deadline or event has passed.`);
}
if (info.total_volume > 5 * Math.max(purchase.total_volume, 1)) {
  flags.push('INFORMATIONAL DWARFS PURCHASE — big head term, few buyers. Verify someone pays before building.');
}
if (tool.total_volume >= 2000 && (tool.median_trend_yoy ?? 0) >= 0) {
  flags.push(`TOOL INTENT LIVE (${tool.total_volume}/mo, YoY ${tool.median_trend_yoy}%) — a free wedge could capture this; audit the SERP for an existing interactive tool.`);
}
const suspects = rows.filter(r => r.series_suspect);
if (suspects.length) {
  flags.push(`${suspects.length} keyword(s) have a suspect series shape (a recent peak several times the preceding two-year range) — likely a Google data re-bucketing, not demand. Excluded from medians; inspect before quoting: ${suspects.slice(0, 5).map(r => r.keyword).join(', ')}`);
}
const pricey = rows.filter(r => (r.cpc ?? 0) >= 25).length;
if (pricey >= 5) {
  flags.push(`${pricey} keywords at CPC >= $25 — funded competition likely; check the SERP for incumbents and free tools before going further.`);
}

// 4. Optional SERP audit of the top tool-intent terms: a gap is only a gap if
//    nobody has shipped the interactive thing yet.
const serpCount = Number(args.serp || 0);
const serps = [];
for (const row of rows.filter(r => r.intent.includes('tool')).slice(0, serpCount)) {
  console.error(`SERP: ${row.keyword}`);
  const json = call('/serp/google/organic/live/regular', [{
    keyword: row.keyword,
    location_code: location.code,
    language_code: location.lang,
    depth: 10,
  }]);
  serps.push({
    keyword: row.keyword,
    volume: row.volume,
    items: (json.tasks?.[0]?.result?.[0]?.items || [])
      .filter(i => i.type === 'organic')
      .map(i => ({ pos: i.rank_absolute, domain: i.domain, title: i.title, url: i.url })),
  });
}

const report = {
  scanned_at: new Date().toISOString(),
  location: key,
  seeds,
  kept_keywords: rows.length,
  min_volume: minVolume,
  buckets,
  flags,
  serps,
  rows: rows.slice(0, 300),
};

const out = args.out || `research/niche-search/scan-${key.toLowerCase()}.json`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 2));
console.error(`Saved: ${out}`);

console.log(`\n=== ${key} - seeds: ${seeds.join(', ')} - ${rows.length} keywords >= ${minVolume}/mo\n`);
for (const [name, b] of Object.entries(buckets)) {
  console.log(`${name.padEnd(14)} ${String(b.total_volume).padStart(8)}/mo  ${String(b.keywords).padStart(4)} kw  median YoY: ${b.median_trend_yoy ?? 'n/a'}%`);
}
if (flags.length) {
  console.log('\nFlags:');
  for (const f of flags) console.log(`  - ${f}`);
}
console.log('\nTop tool-intent keywords (the free-wedge candidates):');
for (const r of buckets.tool.top) {
  const mark = rows.find(x => x.keyword === r.keyword)?.series_suspect ? ' [SUSPECT SERIES]' : '';
  console.log(`  ${String(r.volume).padStart(7)}/mo  YoY=${r.trend_yoy ?? '?'}%  cpc=${r.cpc ?? '?'}  ${r.keyword}${mark}`);
}
