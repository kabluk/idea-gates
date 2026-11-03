#!/usr/bin/env node
// Track record for the idea-gates scout: how well its card-time predictions
// (p_pass, weakest_gate) matched what the gates decided. This is the score
// the scout learns from (retro mode) and is examined on (exam mode); see
// agents/scout/ROLE.md and references/memory.md.
//
// Reads <ideas>/<slug>/card.md and <ideas>/<slug>/gates.md front-matter:
//   card.md : p_pass (0-1), weakest_gate (1-6), source, evidence, evidence_date, control
//   gates.md: result (pass|fail), failed_gate (1-6 or none)
// Ideas without gates.md are pending and not scored.
//
// Usage:
//   node scripts/track-record.mjs --ideas brain/ideas --out brain/agents/scout/track-record.md
//   node scripts/track-record.mjs --ideas agents/scout/evals/cases --predictions predictions.json
//
// --predictions  JSON {"<slug>": {"p_pass": 0.2, "weakest_gate": 2}} that
//                replaces the cards' own values (exam mode; card lint is off)
// --out          also write a markdown report (the scout's track-record.md)
// Prints JSON to stdout. Exit 1 if a card or prediction is malformed.

import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[i + 1]?.startsWith('--') ? true : process.argv[++i];
}
if (!args.ideas) {
  console.error('Usage: track-record.mjs --ideas <dir> [--predictions file.json] [--out report.md]');
  process.exit(2);
}

function frontMatter(file) {
  if (!existsSync(file)) return null;
  const m = readFileSync(file, 'utf8').match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*?)\s*$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}
const gateNum = v => { const m = String(v ?? '').match(/[1-6]/); return m ? Number(m[0]) : null; };

const predictions = args.predictions ? JSON.parse(readFileSync(args.predictions, 'utf8')) : null;
const examMode = Boolean(predictions);
const problems = [];
const scored = [];
let pending = 0;

const slugs = readdirSync(args.ideas, { withFileTypes: true })
  .filter(d => d.isDirectory() && existsSync(join(args.ideas, d.name, 'card.md')))
  .map(d => d.name).sort();

for (const slug of slugs) {
  const card = frontMatter(join(args.ideas, slug, 'card.md'));
  const gates = frontMatter(join(args.ideas, slug, 'gates.md'));
  const pred = examMode ? predictions[slug] : card;
  if (examMode && !pred) { problems.push({ slug, problem: 'no prediction for this case' }); continue; }
  const p = Number(pred?.p_pass);
  if (!Number.isFinite(p) || p < 0 || p > 1) { problems.push({ slug, problem: `p_pass missing or not in 0-1 (${pred?.p_pass})` }); continue; }
  if (p < 0.05 || p > 0.95) problems.push({ slug, problem: `p_pass ${p} outside 0.05-0.95 — the playbook forbids certainty` });
  if (!examMode) {
    if (!card.evidence) problems.push({ slug, problem: 'card has no evidence line' });
    if (!card.evidence_date) problems.push({ slug, problem: 'card has no evidence_date' });
  }
  if (!gates || !/^(pass|fail)$/.test(gates.result || '')) { pending++; continue; }
  const passed = gates.result === 'pass' ? 1 : 0;
  scored.push({
    slug, p, passed,
    source: card.source || 'unknown',
    control: card.control === 'true',
    predicted_gate: gateNum(pred.weakest_gate),
    failed_gate: passed ? null : gateNum(gates.failed_gate),
  });
}

// Controls (known-dead ideas, or cases whose outcome the scout already knows)
// are a sanity check, not a forecast: report them, keep them out of the score.
const controls = scored.filter(r => r.control).map(r => ({ slug: r.slug, p_pass: r.p, result: r.passed ? 'pass' : 'fail', predicted_gate: r.predicted_gate, failed_gate: r.failed_gate, ok: !r.passed && r.p <= 0.2 }));
for (const c of controls) if (!c.ok) problems.push({ slug: c.slug, problem: c.result === 'pass' ? 'control idea PASSED the gates — the gates or the profile are wrong' : `control given p_pass ${c.p_pass} (> 0.2) — the scout is not using what it already knows` });
scored.splice(0, scored.length, ...scored.filter(r => !r.control));

const mean = xs => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : null;
const brier = rows => mean(rows.map(r => (r.p - r.passed) ** 2));
const r3 = x => x == null ? null : Math.round(x * 1000) / 1000;

const baseRate = mean(scored.map(r => r.passed));
const summary = {
  scored: scored.length,
  pending,
  pass_rate: r3(baseRate),
  mean_p_pass: r3(mean(scored.map(r => r.p))),
  brier: r3(brier(scored)),
  // What you would score by always predicting this set's own pass rate. Beat it.
  brier_baseline: r3(baseRate == null ? null : mean(scored.map(r => (baseRate - r.passed) ** 2))),
};
const fails = scored.filter(r => !r.passed && r.failed_gate);
summary.gate_accuracy = fails.length ? r3(fails.filter(r => r.predicted_gate === r.failed_gate).length / fails.length) : null;

const buckets = [[0, 0.2], [0.2, 0.4], [0.4, 0.6], [0.6, 0.8], [0.8, 1.01]].map(([lo, hi]) => {
  const rows = scored.filter(r => r.p >= lo && r.p < hi);
  return { range: `${lo}-${Math.min(hi, 1)}`, n: rows.length, mean_p: r3(mean(rows.map(r => r.p))), actual: r3(mean(rows.map(r => r.passed))) };
}).filter(b => b.n);

const bySource = Object.entries(Object.groupBy ? Object.groupBy(scored, r => r.source)
  : scored.reduce((acc, r) => ((acc[r.source] ||= []).push(r), acc), {}))
  .map(([source, rows]) => ({ source, n: rows.length, mean_p: r3(mean(rows.map(r => r.p))), pass_rate: r3(mean(rows.map(r => r.passed))), brier: r3(brier(rows)) }))
  .sort((a, b) => b.n - a.n);

const failedGates = {};
for (const r of fails) failedGates[r.failed_gate] = (failedGates[r.failed_gate] || 0) + 1;

const misses = scored
  .map(r => ({ ...r, err: Math.abs(r.p - r.passed) }))
  .filter(r => r.err >= 0.5 || (!r.passed && r.predicted_gate && r.failed_gate && r.predicted_gate !== r.failed_gate))
  .sort((a, b) => b.err - a.err)
  .map(r => ({ slug: r.slug, p_pass: r.p, result: r.passed ? 'pass' : 'fail', predicted_gate: r.predicted_gate, failed_gate: r.failed_gate }));

const report = { ideas: args.ideas, exam: examMode, summary, controls, calibration: buckets, by_source: bySource, failed_gates: failedGates, misses, problems };
console.log(JSON.stringify(report, null, 2));

if (args.out) {
  const tbl = (rows, cols) => [`| ${cols.join(' | ')} |`, `|${cols.map(() => '---').join('|')}|`,
    ...rows.map(r => `| ${cols.map(c => r[c] ?? '–').join(' | ')} |`)].join('\n');
  const md = `# Scout track record

Generated by \`scripts/track-record.mjs\` on ${new Date().toISOString().slice(0, 10)} from \`${args.ideas}\`. Do not edit by hand.

- Decided cards: ${summary.scored} (pending: ${summary.pending}; controls, not scored: ${controls.length})
- Actual pass rate: ${summary.pass_rate ?? '–'} · mean predicted p_pass: ${summary.mean_p_pass ?? '–'}
- Brier: ${summary.brier ?? '–'} (baseline ${summary.brier_baseline ?? '–'}; lower is better)
- Weakest-gate accuracy on failures: ${summary.gate_accuracy ?? '–'}

## Calibration — when I said p, how often did it pass?

${buckets.length ? tbl(buckets, ['range', 'n', 'mean_p', 'actual']) : 'No decided cards yet.'}

## By source

${bySource.length ? tbl(bySource, ['source', 'n', 'mean_p', 'pass_rate', 'brier']) : 'No decided cards yet.'}

## Which gate kills my cards

${Object.keys(failedGates).length ? Object.entries(failedGates).sort((a, b) => b[1] - a[1]).map(([g, n]) => `- gate ${g}: ${n}`).join('\n') : 'No failures yet.'}

## Biggest misses (retro material)

${misses.length ? misses.map(m => `- [[ideas/${m.slug}/gates|${m.slug}]] — said ${m.p_pass}, ${m.result}${m.failed_gate ? ` at gate ${m.failed_gate}` : ''}${m.predicted_gate && m.failed_gate && m.predicted_gate !== m.failed_gate ? ` (I bet on gate ${m.predicted_gate})` : ''}`).join('\n') : 'None.'}
${controls.length ? `\n## Controls\n\n${controls.map(c => `- ${c.slug}: said ${c.p_pass}, ${c.result} — ${c.ok ? 'ok' : 'NOT OK'}`).join('\n')}\n` : ''}${problems.length ? `\n## Card problems\n\n${problems.map(p => `- ${p.slug}: ${p.problem}`).join('\n')}\n` : ''}`;
  mkdirSync(dirname(args.out), { recursive: true });
  writeFileSync(args.out, md);
  console.error(`Saved: ${args.out}`);
}

process.exit(problems.length ? 1 : 0);
