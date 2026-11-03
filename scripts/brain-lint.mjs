#!/usr/bin/env node
// Hygiene check for the idea-gates brain (references/memory.md). The
// librarian runs it before every garden pass and acts on what it reports;
// it changes nothing itself.
//
// Checks:
//   expired      world/ facts whose `expires:` date has passed (re-verify or archive)
//   no-expiry    world/ facts without `expires:` or `source:`
//   no-evidence  accepted lessons without at least one [[link]] in their evidence
//   stale        accepted lessons not used for `--stale-days` (default 120) — `last_used:`
//   memory-size  agents/*/MEMORY.md over `--memory-words` (default 900) words
//   broken-link  [[wikilinks]] that resolve to no file in the brain (inbox is raw, not checked)
//   inbox        inbox items waiting (not an error, a count)
//   proposed     lesson proposals waiting for review (a count)
//
// Usage:
//   node scripts/brain-lint.mjs                 # brain/ in the current directory
//   node scripts/brain-lint.mjs --brain path/to/brain --today 2026-11-03
// Prints JSON. Exit 1 if anything other than the two counts is reported.

import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, basename, dirname } from 'node:path';

const args = {};
for (let i = 2; i < process.argv.length; i++) {
  const a = process.argv[i];
  if (a.startsWith('--')) args[a.slice(2)] = process.argv[++i];
}
const root = args.brain || 'brain';
const today = args.today || new Date().toISOString().slice(0, 10);
const staleDays = Number(args['stale-days'] || 120);
const memoryWords = Number(args['memory-words'] || 900);
if (!existsSync(root)) { console.error(`No brain at ${root}`); process.exit(2); }

function walk(dir) {
  const out = [];
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name.startsWith('.')) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p)); else out.push(p);
  }
  return out;
}
function frontMatter(text) {
  const m = text.match(/^---\n([\s\S]*?)\n---/);
  const fm = {};
  if (m) for (const line of m[1].split('\n')) {
    const kv = line.match(/^([\w-]+):\s*(.*?)\s*$/);
    if (kv) fm[kv[1]] = kv[2];
  }
  return fm;
}
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

const files = walk(root);
const md = files.filter(f => f.endsWith('.md'));
const rel = f => relative(root, f);
const isReadme = f => basename(f) === 'README.md';
const findings = [];
const add = (check, file, detail) => findings.push({ check, file: rel(file), detail });

// Link resolution: [[path/to/note]] relative to the brain root, or a bare
// name that matches a file's basename anywhere (Obsidian's default).
const byRel = new Set(files.map(f => rel(f).replace(/\.md$/, '')));
const byBase = new Set(files.map(f => basename(f).replace(/\.md$/, '')));

for (const f of md) {
  const text = readFileSync(f, 'utf8');
  const fm = frontMatter(text);
  const r = rel(f);

  if (r.startsWith('world/') && !isReadme(f)) {
    if (!fm.source) add('no-expiry', f, 'fact without source:');
    if (!fm.expires) add('no-expiry', f, 'fact without expires:');
    else if (fm.expires < today) add('expired', f, `expired ${fm.expires}`);
  }

  if (/^agents\/[^/]+\/lessons\/[^/]+\.md$/.test(r) && !isReadme(f)) {
    const evidence = text.split(/^##\s+Evidence/m)[1]?.split(/^##\s/m)[0] ?? '';
    if (!/\[\[[^\]]+\]\]/.test(evidence)) add('no-evidence', f, 'accepted lesson with no [[link]] under ## Evidence');
    const last = fm.last_used || fm.accepted;
    if (last && days(last, today) > staleDays) add('stale', f, `not used since ${last}`);
  }

  if (/^agents\/[^/]+\/MEMORY\.md$/.test(r)) {
    const words = text.replace(/^---[\s\S]*?---/, '').split(/\s+/).filter(Boolean).length;
    if (words > memoryWords) add('memory-size', f, `${words} words (limit ${memoryWords}) — demote lessons to lessons/`);
  }

  const prose = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`\n]*`/g, '').replace(/<!--[\s\S]*?-->/g, '');
  if (!r.startsWith('inbox/')) for (const m of prose.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)) {
    const target = m[1].trim().replace(/\\$/, '').replace(/\.md$/, ''); // '\|' escapes the alias pipe inside tables
    const fromHere = relative(root, join(dirname(f), target));
    if (!byRel.has(target) && !byRel.has(fromHere) && !byBase.has(basename(target))) add('broken-link', f, `[[${m[1]}]]`);
  }
}

const count = dir => existsSync(dir) ? walk(dir).filter(f => !isReadme(f) && statSync(f).isFile()).length : 0;
const inbox = count(join(root, 'inbox'));
const proposed = existsSync(join(root, 'agents'))
  ? readdirSync(join(root, 'agents')).reduce((n, a) => n + count(join(root, 'agents', a, 'lessons', 'proposed')), 0) : 0;

console.log(JSON.stringify({ brain: root, today, inbox, proposed, ok: findings.length === 0, findings }, null, 2));
process.exit(findings.length ? 1 : 0);
