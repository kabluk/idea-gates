#!/usr/bin/env node
// Forum pain miner for the idea-gates skill, source 3 (pain mining).
//
// Finds where people describe a problem in their own words, then — and this is
// the part that matters for a founder whose only channel is search — checks
// whether that pain has a search footprint at all. Pain with no search volume
// is the trap from the case study: real, expensive to reach, unsellable without trust.
//
// Sources (as of 2026-09):
//   Hacker News   — Algolia API, free, no auth. Tech/startup/indie pain.
//   Stack Exchange— free API across ~180 topical sites (money, law, workplace,
//                   freelancing, DIY, parenting...), not just programming.
//   Reddit        — blocked directly (403) and through reader proxies, but
//                   reachable via DataForSEO SERP `advanced` with a site:
//                   operator (the `regular` endpoint silently drops it).
//
// Auth: DATAFORSEO_LOGIN / DATAFORSEO_PASSWORD (only needed for Reddit and
// the volume cross-check).
//
// Usage:
//   node scripts/pain-scan.mjs --topic "invoicing" --subreddits smallbusiness,freelance
//   node scripts/pain-scan.mjs --topic "inventory" --no-volume --out research/niche-search/pain-inventory.json
//
// Options:
//   --topic        subject to mine (required)
//   --subreddits   comma-separated, default smallbusiness,freelance,Entrepreneur
//   --se-sites     Stack Exchange sites, default money,workplace,freelancing
//   --patterns     override the pain patterns (comma-separated)
//   --no-volume    skip the DataForSEO volume cross-check (free run)
//   --min-mentions phrase must appear this often to be reported (default 3)
//   --out          where to write the JSON report

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

// Phrases people use when they have a problem and no product solves it.
// "spreadsheet for" is the strongest single marker: it means they already
// built a manual workaround, which is willingness-to-work, one step from
// willingness-to-pay.
const DEFAULT_PATTERNS = [
  'is there a tool',
  'is there an app',
  'spreadsheet for',
  'how do you deal with',
  'how do you track',
  'anyone know a',
  'tired of manually',
  'wish there was',
];

const STOPWORDS = new Set(`a an the and or but if is are was were be been being do does did doing
have has had having i we you they it he she my our your their this that these those for of to in on
at by with from as not no so than then there here what which who whom whose when where why how
can could will would should may might must just really very much many any some all each other
about into over under again more most such only own same too also get got make made use used using
does doesn don dont didn isn aren wasn weren won wouldn shouldn couldn like need want know think
one two three new best good great help please thanks thank question answer people time way
post posts comment comments quot amp nbsp gt lt something anything nothing everyone someone
better easier simple simply easy hard difficult team members create created creating else
looking recommend recommendation recommendations suggestions advice guys folks hey everybody
free paid cheap small business businesses company companies work working works stuff things`.split(/\s+/));

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const next = argv[i + 1];
      if (next === undefined || next.startsWith('--')) args[key] = true;
      else { args[key] = next; i++; }
    } else args._.push(argv[i]);
  }
  return args;
}

function curlJson(url, extra = []) {
  const out = execFileSync('curl',
    ['-sS', '-m', '60', '--compressed', '-A', 'Mozilla/5.0 (niche research)', ...extra, url],
    { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  try { return JSON.parse(out); } catch { return null; }
}

function dfsAuth() {
  const { DATAFORSEO_LOGIN: login, DATAFORSEO_PASSWORD: password } = process.env;
  if (!login || !password) return null;
  return 'Basic ' + Buffer.from(`${login}:${password}`).toString('base64');
}

function dfsPost(path, body) {
  const auth = dfsAuth();
  if (!auth) throw new Error('Set DATAFORSEO_LOGIN and DATAFORSEO_PASSWORD (or pass --no-volume).');
  const out = execFileSync('curl',
    ['-sS', '-m', '120', '-H', `Authorization: ${auth}`, '-H', 'Content-Type: application/json',
      '-X', 'POST', '--data-binary', JSON.stringify(body), `https://api.dataforseo.com/v3${path}`],
    { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  const json = JSON.parse(out);
  if (json.status_code !== 20000) throw new Error(`API ${json.status_code}: ${json.status_message}`);
  return json;
}

const args = parseArgs(process.argv.slice(2));
const topic = args.topic;
if (!topic || topic === true) {
  console.error('Pass --topic "<subject>".');
  process.exit(1);
}
const patterns = args.patterns && args.patterns !== true
  ? String(args.patterns).split(',').map(s => s.trim())
  : DEFAULT_PATTERNS;
const subreddits = String(args.subreddits && args.subreddits !== true
  ? args.subreddits : 'smallbusiness,freelance,Entrepreneur').split(',').map(s => s.trim());
const seSites = String(args['se-sites'] && args['se-sites'] !== true
  ? args['se-sites'] : 'money,workplace,freelancing').split(',').map(s => s.trim());
const minMentions = Number(args['min-mentions'] || 3);

/**
 * Every source ranks by phrase match and treats the topic as a weak hint, so
 * without this filter a scan for "bookkeeping" and a scan for "scheduling"
 * return the identical popular "spreadsheet for..." threads. The topic has to
 * actually appear in the text for the hit to be about the topic.
 */
const topicWords = topic.toLowerCase().split(/\s+/).filter(w => w.length > 3);
const onTopic = (text) => {
  if (!topicWords.length) return true;
  const lower = text.toLowerCase();
  return topicWords.some(w => lower.includes(w));
};

/** @type {{source: string, title: string, url: string, pattern: string}[]} */
const findings = [];

// --- Hacker News (Algolia, free) -------------------------------------------
console.error('Hacker News...');
for (const pattern of patterns) {
  const query = encodeURIComponent(`"${pattern}" ${topic}`);
  const json = curlJson(`https://hn.algolia.com/api/v1/search?query=${query}&hitsPerPage=25`);
  for (const hit of json?.hits || []) {
    const text = hit.title || hit.comment_text || hit.story_title || '';
    if (!text || !onTopic(text)) continue;
    findings.push({
      source: 'hn',
      title: text.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").slice(0, 300),
      url: hit.objectID ? `https://news.ycombinator.com/item?id=${hit.objectID}` : '',
      pattern,
    });
  }
}

// --- Stack Exchange (free API, many non-technical sites) --------------------
console.error('Stack Exchange...');
for (const site of seSites) {
  for (const pattern of patterns.slice(0, 4)) {
    const query = encodeURIComponent(`${pattern} ${topic}`);
    const json = curlJson(
      `https://api.stackexchange.com/2.3/search/advanced?order=desc&sort=votes&q=${query}&site=${site}&pagesize=20`);
    for (const item of json?.items || []) {
      if (!onTopic(item.title || '')) continue;
      findings.push({
        source: `se:${site}`,
        title: (item.title || '').replace(/&#39;/g, "'").replace(/&quot;/g, '"'),
        url: item.link || '',
        pattern,
      });
    }
  }
}

// --- Reddit (via DataForSEO SERP advanced; direct access is 403) ------------
if (!args['no-volume'] && dfsAuth()) {
  console.error('Reddit (via SERP)...');
  for (const sub of subreddits) {
    for (const pattern of patterns.slice(0, 4)) {
      try {
        const json = dfsPost('/serp/google/organic/live/advanced', [{
          keyword: `site:reddit.com/r/${sub} "${pattern}" ${topic}`,
          location_code: 2840,
          language_code: 'en',
          depth: 20,
        }]);
        const items = json.tasks?.[0]?.result?.[0]?.items || [];
        // Google matches a quoted site: query loosely — roughly half the hits
        // do not contain the phrase at all. Keep only titles that actually do,
        // otherwise the extraction downstream is fed noise.
        for (const item of items.filter(i => i.type === 'organic'
          && (i.title || '').toLowerCase().includes(pattern.toLowerCase())
          && onTopic(i.title || ''))) {
          findings.push({
            source: `reddit:${sub}`,
            title: item.title || '',
            url: item.url || '',
            pattern,
          });
        }
      } catch (err) {
        console.error(`  reddit ${sub}/"${pattern}": ${err.message}`);
      }
    }
  }
}

// --- Extract what the pain is ABOUT ----------------------------------------
// The signal is not anywhere in the title, it is immediately after the pain
// marker: "spreadsheet for [tracking client hours]", "is there a tool for
// [reconciling invoices]". Taking n-grams from the whole title instead pulls
// in whatever else the thread mentions — a first run on "inventory" returned
// "cs2 inventory" and "artificial intelligence", which is noise, not pain.
const counts = new Map();
for (const { title, pattern } of findings) {
  const clean = title.toLowerCase()
    .replace(/\s*:\s*r\/\w+\s*$/, ' ')      // Reddit's " : r/subreddit" suffix
    .replace(/&#?\w+;/g, ' ')                // HTML entities (&quot; -> "quot")
    .replace(/x2f|%2f|https?:\S+/g, ' ')     // URL-encoding debris
    .replace(/[^a-z0-9\s-]/g, ' ');
  const at = clean.indexOf(pattern.toLowerCase());
  if (at === -1) continue;                    // pattern matched elsewhere in the body
  const after = clean.slice(at + pattern.length)
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOPWORDS.has(w))
    .slice(0, 5);                             // the object of the pain, not the whole post
  // Single words are almost always noise here ("post", "template", "monsters");
  // a pain object needs at least two words to mean anything.
  for (let n = 2; n <= 3; n++) {
    for (let i = 0; i + n <= after.length; i++) {
      const phrase = after.slice(i, i + n).join(' ');
      if (phrase.length < 4) continue;
      counts.set(phrase, (counts.get(phrase) || 0) + 1);
    }
  }
}
const phrases = [...counts.entries()]
  .filter(([, count]) => count >= minMentions)
  .sort((a, b) => b[1] - a[1])
  .slice(0, 40)
  .map(([phrase, mentions]) => ({ phrase, mentions, volume: null, cpc: null }));

// --- Cross-check against search demand -------------------------------------
// The decisive step. A phrase people repeat in forums but nobody searches for
// can only be sold by showing up in person — which a search-only founder
// cannot do. Silence here is a kill signal, not a "we'll educate the market".
if (!args['no-volume'] && phrases.length && dfsAuth()) {
  console.error(`Checking search volume for ${phrases.length} phrases...`);
  const json = dfsPost('/keywords_data/google_ads/search_volume/live', [{
    keywords: phrases.map(p => p.phrase),
    location_code: 2840,
    language_code: 'en',
  }]);
  const byKeyword = new Map((json.tasks?.[0]?.result || [])
    .map(r => [r.keyword, r]));
  for (const p of phrases) {
    const row = byKeyword.get(p.phrase);
    p.volume = row?.search_volume ?? 0;
    p.cpc = row?.cpc ?? null;
  }
}

const searchable = phrases.filter(p => (p.volume ?? 0) >= 50);
const report = {
  scanned_at: new Date().toISOString(),
  topic,
  patterns,
  sources: { hn: true, stack_exchange: seSites, reddit: subreddits },
  findings_count: findings.length,
  by_source: findings.reduce((acc, f) => {
    acc[f.source] = (acc[f.source] || 0) + 1;
    return acc;
  }, {}),
  phrases,
  searchable_phrases: searchable,
  findings: findings.slice(0, 200),
};

const out = args.out && args.out !== true
  ? args.out
  : `research/niche-search/pain-${topic.replace(/\W+/g, '-').toLowerCase()}.json`;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify(report, null, 2));
console.error(`Saved: ${out}`);

console.log(`\n=== pain scan: "${topic}" - ${findings.length} posts`);
for (const [source, count] of Object.entries(report.by_source)) {
  console.log(`  ${source.padEnd(22)} ${count}`);
}
console.log('\nRecurring phrases (mentions | monthly searches):');
for (const p of phrases.slice(0, 20)) {
  const vol = p.volume === null ? 'not checked' : `${p.volume}/mo`;
  console.log(`  ${String(p.mentions).padStart(3)}x  ${String(vol).padStart(12)}  ${p.phrase}`);
}
if (!args['no-volume']) {
  console.log(`\n${searchable.length} of ${phrases.length} phrases have >= 50 searches/mo.`);
  if (!searchable.length && phrases.length) {
    console.log('NO SEARCH FOOTPRINT — this pain is real but invisible to search.');
    console.log('For a founder whose only channel is SEO, that is a kill signal:');
    console.log('selling it requires showing up in person (gates 1, 2, 5).');
  }
}
