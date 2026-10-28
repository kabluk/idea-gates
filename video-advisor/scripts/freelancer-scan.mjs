#!/usr/bin/env node
// Demand-side scan for the video-advisor skill: open jobs on Freelancer.com
// that match a service, with budgets in USD and how many freelancers already
// bid on each.
//
// Kwork and Fiverr show supply (who sells); this shows demand (who buys right
// now, for how much, against how many competitors). Freelancer's public API
// needs no key. Its text search is close to useless ("landing page" returns
// SEO and PDF jobs), so query by skill category instead: "label@id[,id]".
// Plain text still works as a fallback, keeping only jobs whose title or
// preview contains every word.
//
// Useful skill ids: 482 Landing Pages, 2247 Web Animation, 17 Website Design,
// 2701 Web Design, 1936 Figma, 247 PSD to HTML, 1595 Webflow, 2825 Framer,
// 873 Wix, 959 UI / User Interface, 3105 AI Animation. Full list:
// curl https://www.freelancer.com/api/projects/0.1/jobs/
//
// No dependencies; HTTP goes through curl, so HTTPS_PROXY is respected.
//
// Usage:
//   node video-advisor/scripts/freelancer-scan.mjs "landing pages@482" "web animation@2247" "figma@1936"
//   node video-advisor/scripts/freelancer-scan.mjs --filter "redesign@17,2701"   # also require the words
//   node video-advisor/scripts/freelancer-scan.mjs --json "landing pages@482"

import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const asJson = args.includes('--json');
const queries = args.filter((a) => !a.startsWith('--'));
if (!queries.length) {
  console.error('usage: freelancer-scan.mjs [--json] [--filter] "<label>@<skill-id>[,<id>]" | "<text>" ...');
  process.exit(2);
}

const API = 'https://www.freelancer.com/api/projects/0.1/projects/active/';

function fetchJobs(text, ids) {
  const url = ids.length
    ? `${API}?limit=100&${ids.map((id) => `jobs[]=${id}`).join('&')}`
    : `${API}?query=${encodeURIComponent(text)}&limit=100`;
  const out = execFileSync('curl', ['-sS', '--fail', '--max-time', '40', url], { encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
  const d = JSON.parse(out);
  if (d.status !== 'success') throw new Error(d.message || 'API error');
  return d.result;
}

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s.length ? s[Math.floor(s.length / 2)] : null;
};
const round = (n) => (n == null ? null : Math.round(n));

const results = [];
for (const q of queries) {
  try {
    const [label, idPart] = q.split('@');
    const ids = (idPart || '').split(',').map((x) => x.trim()).filter(Boolean);
    const r = fetchJobs(label, ids);
    // With a category, the label filters only when it is not just the category's name.
    const words = ids.length && !args.includes('--filter') ? [] : label.toLowerCase().split(/\s+/).filter(Boolean);
    const now = Date.now() / 1000;
    const jobs = r.projects
      .filter((p) => {
        const text = `${p.title} ${p.preview_description || ''}`.toLowerCase();
        return words.every((w) => text.includes(w));
      })
      .map((p) => {
        const rate = p.currency?.exchange_rate || 1;
        const lo = (p.budget?.minimum || 0) * rate, hi = (p.budget?.maximum || p.budget?.minimum || 0) * rate;
        return {
          title: p.title,
          type: p.type, // fixed | hourly
          budgetUsd: [round(lo), round(hi)],
          midUsd: (lo + hi) / 2,
          bids: p.bid_stats?.bid_count || 0,
          avgBidUsd: round((p.bid_stats?.bid_avg || 0) * rate),
          ageDays: Math.round((now - p.time_submitted) / 86400),
          url: `https://www.freelancer.com/projects/${p.seo_url}`,
        };
      });
    const fixed = jobs.filter((j) => j.type === 'fixed');
    results.push({
      query: q,
      looseMatches: r.total_count,
      scanned: r.projects.length,
      relevant: jobs.length,
      medianBudgetUsd: round(median(fixed.map((j) => j.midUsd))),
      medianAvgBidUsd: round(median(fixed.map((j) => j.avgBidUsd).filter(Boolean))),
      medianBids: median(jobs.map((j) => j.bids)),
      jobs: jobs.sort((a, b) => a.ageDays - b.ageDays).slice(0, 6),
    });
  } catch (e) {
    results.push({ query: q, error: String(e.stderr || e.message).trim().split('\n').pop() });
  }
}

if (asJson) {
  console.log(JSON.stringify({ fetched: new Date().toISOString().slice(0, 10), results }, null, 2));
} else {
  console.log(`Freelancer.com open jobs, ${new Date().toISOString().slice(0, 10)} (USD; fixed-price medians)\n`);
  for (const r of results) {
    if (r.error) { console.log(`## ${r.query}\n  error: ${r.error}\n`); continue; }
    console.log(`## ${r.query}`);
    console.log(`  relevant open jobs: ${r.relevant} of ${r.scanned} scanned (loose matches: ${r.looseMatches})`);
    console.log(`  median budget: $${r.medianBudgetUsd} · median average bid: $${r.medianAvgBidUsd} · median bids per job: ${r.medianBids}`);
    for (const j of r.jobs) console.log(`  ${String(j.ageDays).padStart(3)}d · ${j.type === 'hourly' ? 'hourly' : 'fixed '} $${j.budgetUsd[0]}–${j.budgetUsd[1]} · ${String(j.bids).padStart(3)} bids · ${j.title}`);
    console.log();
  }
}
