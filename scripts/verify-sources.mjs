#!/usr/bin/env node
// Source checker for idea-gates reports — the deterministic half of the
// multi-agent audit (references/multi-agent.md). An LLM reviewer can judge
// whether an argument holds; it cannot be trusted to notice that "24K
// searches" became "42K" between the JSON and the report. This script can.
//
// Convention: every measured number in a report carries its source right
// after it, as a file plus a path inside that JSON file:
//
//   Tool intent is 4,400/mo [src: brain/ideas/gpsr/scan-de.json#buckets.tool.total_volume]
//   The leader ranks #3 [src: brain/ideas/gpsr/scan-de.json#serps[0].items[2].pos]
//
// For every citation the script checks that the file exists, the path
// resolves, and the number written just before the citation matches the value
// there (24K, 24k, 24,000 and 24 000 all read as 24000). Default tolerance is
// 5%, so "24K" for 24,300 passes; tighten it with --tolerance 0 for exact data.
//
// With --strict it also lists lines that contain a number with a unit that
// usually needs a source (/mo, %, $, €, R$, searches, CPC) but no citation —
// candidates for "a number someone remembered instead of measured".
//
// Usage:
//   node scripts/verify-sources.mjs brain/ideas/gpsr/ocean.md
//   node scripts/verify-sources.mjs brain/ideas/*/ocean.md --strict --tolerance 0
//
// Exit code: 0 if every citation checks out (and, with --strict, no uncited
// numbers); 1 otherwise. Output is JSON on stdout so an agent can act on it.

import { readFileSync, existsSync } from 'node:fs';

const argv = process.argv.slice(2);
const files = [];
let strict = false;
let tolerance = 5; // percent: "24K" for 24,900 is 3.6% off and still honest
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--strict') strict = true;
  else if (argv[i] === '--tolerance') tolerance = Number(argv[++i]);
  else files.push(argv[i]);
}
if (!files.length) {
  console.error('Usage: verify-sources.mjs <report.md> [...] [--strict] [--tolerance PCT]');
  process.exit(2);
}

const CITE = /\[src:\s*([^\]#\s]+)(?:#((?:\[\d+\]|[^\]\s])+))?\s*\]/g;
// A number as people write it: 24,000 / 24 000 / 24.5 / 24K / 1.2M / -12%
const NUM = /-?\d+(?:[ ,. ]\d{3})*(?:[.,]\d+)?\s*[kKmM]?(?![\w])/g;
const NEEDS_SOURCE = /(\d[\d ,.]*\s*[kKmM]?\s*(\/mo|%|searches|visits|orders|offers|bids|reviews)|[$€£]\s*\d|R\$\s*\d|\bCPC\b[^.]*\d)/;

function parseNumber(text) {
  let t = text.trim().replace(/ /g, ' ');
  let mult = 1;
  if (/[kK]$/.test(t)) { mult = 1e3; t = t.slice(0, -1).trim(); }
  else if (/[mM]$/.test(t)) { mult = 1e6; t = t.slice(0, -1).trim(); }
  // "24,000" / "24 000" are thousands separators; "24,5" (one or two digits) is a decimal comma.
  if (/^-?\d{1,3}([ ,.]\d{3})+$/.test(t)) t = t.replace(/[ ,.]/g, '');
  else t = t.replace(',', '.');
  const n = Number(t);
  return Number.isFinite(n) ? n * mult : null;
}

function resolvePath(obj, path) {
  if (!path) return obj;
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for (const p of parts) {
    if (cur == null || !(p in Object(cur))) return { missing: p };
    cur = cur[p];
  }
  return { value: cur };
}

const jsonCache = new Map();
function loadJson(file) {
  if (!jsonCache.has(file)) {
    try { jsonCache.set(file, { data: JSON.parse(readFileSync(file, 'utf8')) }); }
    catch (e) { jsonCache.set(file, { error: existsSync(file) ? `not valid JSON: ${e.message}` : 'file not found' }); }
  }
  return jsonCache.get(file);
}

const problems = [];
let checked = 0;

for (const file of files) {
  const lines = readFileSync(file, 'utf8').split('\n');
  let inFence = false;
  lines.forEach((line, idx) => {
    if (/^\s*```/.test(line)) { inFence = !inFence; return; }
    if (inFence) return;
    const where = `${file}:${idx + 1}`;
    const cites = [...line.matchAll(CITE)];

    for (const c of cites) {
      checked++;
      const [raw, srcFile, path] = c;
      const loaded = loadJson(srcFile);
      if (loaded.error) { problems.push({ where, cite: raw, problem: loaded.error }); continue; }
      const r = resolvePath(loaded.data, path);
      if ('missing' in r) { problems.push({ where, cite: raw, problem: `path does not resolve (missing "${r.missing}")` }); continue; }
      // The claimed number is the last number before the citation, after the previous citation.
      const prevEnd = cites.filter(o => o.index < c.index).map(o => o.index + o[0].length).pop() ?? 0;
      const before = line.slice(prevEnd, c.index);
      const nums = [...before.matchAll(NUM)].map(m => m[0]);
      if (!nums.length) { problems.push({ where, cite: raw, problem: 'no number before the citation' }); continue; }
      const claimed = parseNumber(nums[nums.length - 1]);
      const actual = typeof r.value === 'number' ? r.value : parseNumber(String(r.value));
      if (claimed == null || actual == null) {
        problems.push({ where, cite: raw, problem: `cannot compare "${nums[nums.length - 1]}" with ${JSON.stringify(r.value)}` });
        continue;
      }
      const diff = actual === 0 ? Math.abs(claimed) : Math.abs(claimed - actual) / Math.abs(actual) * 100;
      if (diff > tolerance) {
        problems.push({ where, cite: raw, problem: `report says ${nums[nums.length - 1].trim()}, source says ${r.value}` });
      }
    }

    if (strict && !cites.length && NEEDS_SOURCE.test(line) && !/\[(est|assumption|unmeasured)\]/i.test(line)) {
      problems.push({ where, problem: 'number without a source', text: line.trim().slice(0, 160) });
    }
  });
}

console.log(JSON.stringify({ files, checked, ok: problems.length === 0, problems }, null, 2));
process.exit(problems.length ? 1 : 0);
