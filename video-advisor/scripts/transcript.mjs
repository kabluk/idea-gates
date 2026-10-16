#!/usr/bin/env node
// Transcript fetcher for the video-advisor skill.
//
// YouTube URL (or bare video id) -> title, channel, duration, description and
// a plain-text transcript with [mm:ss] marks every ~30 seconds, so the advisor
// can cite the moment a claim was made.
//
// How: ask YouTube's player endpoint (ANDROID client, no key) for the caption
// track list, pick the best track, download it as timedtext XML and flatten
// it. Manual captions beat auto-generated ones; the requested language beats
// the original language. If that path breaks (YouTube changes it every few
// months) and yt-dlp is installed, fall back to yt-dlp.
//
// No dependencies; HTTP goes through curl, so HTTPS_PROXY is respected.
//
// Usage:
//   node video-advisor/scripts/transcript.mjs "https://youtu.be/VIDEO_ID"
//   node video-advisor/scripts/transcript.mjs VIDEO_ID --lang ru --out research/videos/raw/VIDEO_ID.md
//
// Options:
//   --lang   preferred caption language (default: the video's own language)
//   --out    write the result to this file instead of stdout
//   --list   only list available caption tracks
//   --cookies <browser>  passed to yt-dlp as --cookies-from-browser (chrome, firefox...)
//            when YouTube answers "Sign in to confirm you're not a bot"

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { execFileSync } from 'node:child_process';

const args = process.argv.slice(2);
const opt = (name) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const input = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--') && args[i - 1] !== '--list'));
if (!input) {
  console.error('usage: transcript.mjs <youtube-url-or-id> [--lang xx] [--out file] [--list]');
  process.exit(2);
}

function videoId(s) {
  if (/^[\w-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|\/shorts\/|\/live\/|\/embed\/)([\w-]{11})/);
  if (!m) throw new Error(`cannot find a video id in: ${s}`);
  return m[1];
}

function curl(url, { body, headers = [] } = {}) {
  const a = ['-sS', '--fail', '--max-time', '60', '-L', url];
  for (const h of headers) a.push('-H', h);
  if (body) a.push('-X', 'POST', '-H', 'Content-Type: application/json', '--data-binary', body);
  return execFileSync('curl', a, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function decode(s) {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n));
}

const mmss = (ms) => {
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), r = s % 60;
  const p = (n) => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(r)}` : `${p(m)}:${p(r)}`;
};

// [{ms, text}] -> paragraphs with a timestamp every ~30s.
function flatten(cues) {
  const out = [];
  let para = [], start = null;
  for (const c of cues) {
    const t = c.text.replace(/\s+/g, ' ').trim();
    if (!t) continue;
    if (start === null) start = c.ms;
    para.push(t);
    if (c.ms - start >= 30000) {
      out.push(`[${mmss(start)}] ${para.join(' ')}`);
      para = []; start = null;
    }
  }
  if (para.length) out.push(`[${mmss(start)}] ${para.join(' ')}`);
  return out.join('\n\n');
}

function parseTimedtext(xml) {
  const cues = [];
  // format 3: <p t="ms" d="ms">text or <s>word</s>...</p>
  for (const m of xml.matchAll(/<p\b[^>]*\bt="(\d+)"[^>]*>([\s\S]*?)<\/p>/g)) {
    cues.push({ ms: +m[1], text: decode(m[2]) });
  }
  if (cues.length) return cues;
  // legacy format: <text start="sec" dur="sec">text</text>
  for (const m of xml.matchAll(/<text\b[^>]*\bstart="([\d.]+)"[^>]*>([\s\S]*?)<\/text>/g)) {
    cues.push({ ms: Math.round(+m[1] * 1000), text: decode(decode(m[2])) });
  }
  return cues;
}

function viaPlayer(id, lang) {
  const body = JSON.stringify({
    context: { client: { clientName: 'ANDROID', clientVersion: '20.10.38', androidSdkVersion: 30, hl: 'en' } },
    videoId: id,
  });
  const p = JSON.parse(curl('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', { body }));
  const status = p.playabilityStatus?.status;
  if (status && status !== 'OK') throw new Error(`video not playable: ${status} ${p.playabilityStatus?.reason || ''}`);
  const v = p.videoDetails || {};
  const tracks = p.captions?.playerCaptionsTracklistRenderer?.captionTracks || [];
  const meta = {
    title: v.title, channel: v.author, seconds: +v.lengthSeconds || 0,
    description: v.shortDescription || '', views: v.viewCount,
  };
  const list = tracks.map((t) => ({ lang: t.languageCode, auto: t.kind === 'asr', name: t.name?.runs?.[0]?.text || t.name?.simpleText || '', url: t.baseUrl }));
  if (!list.length) return { meta, list, cues: [] };

  // The auto-generated track is in the language actually spoken.
  const spoken = list.find((t) => t.auto)?.lang;
  const want = lang || spoken;
  const same = (t) => want && (t.lang === want || t.lang.split('-')[0] === want.split('-')[0]);
  const pick = list.find((t) => same(t) && !t.auto) || list.find((t) => same(t)) || list.find((t) => !t.auto) || list[0];
  const cues = parseTimedtext(curl(pick.url));
  return { meta, list, pick, cues };
}

// Fallback: let yt-dlp solve whatever YouTube currently demands, take the
// caption URLs from its metadata and download only the one track we need
// (asking yt-dlp to write several tracks trips HTTP 429 on the extra ones).
function viaYtDlp(id, lang) {
  const a = ['--dump-json', '--skip-download', '--no-warnings',
    ...(opt('cookies') ? ['--cookies-from-browser', opt('cookies')] : []),
    `https://www.youtube.com/watch?v=${id}`];
  const run = (cmd, pre) => execFileSync(cmd, [...pre, ...a], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'pipe'] });
  let json;
  try {
    json = run('yt-dlp', []);
  } catch (e) {
    if (e.code !== 'ENOENT') throw e;
    json = run('python3', ['-m', 'yt_dlp']); // pip install --user yt-dlp
  }
  const info = JSON.parse(json);
  const list = [];
  for (const [auto, src] of [[false, info.subtitles], [true, info.automatic_captions]]) {
    for (const [code, fmts] of Object.entries(src || {})) {
      if (code === 'live_chat') continue;
      const f = fmts.find((x) => x.ext === 'srv3') || fmts.find((x) => x.ext === 'vtt');
      if (f) list.push({ lang: code.replace(/-orig$/, ''), orig: code.endsWith('-orig'), auto, name: f.name || '', url: f.url, ext: f.ext });
    }
  }
  const spoken = info.language || list.find((t) => t.orig)?.lang;
  const want = lang || spoken;
  const same = (t) => want && (t.lang === want || t.lang.split('-')[0] === want.split('-')[0]);
  // Auto tracks in other languages are machine translations; only the -orig one is real.
  const pick = list.find((t) => same(t) && !t.auto) || list.find((t) => same(t) && t.orig) || list.find((t) => same(t))
    || list.find((t) => !t.auto) || list.find((t) => t.orig);
  let cues = [];
  if (pick) {
    const body = curl(pick.url);
    cues = pick.ext === 'srv3' ? parseTimedtext(body) : parseVtt(body);
  }
  return {
    meta: { title: info.title, channel: info.channel || info.uploader, seconds: info.duration || 0, description: info.description || '', views: info.view_count, uploaded: info.upload_date },
    list, pick, cues,
  };
}

function parseVtt(vtt) {
  const cues = [];
  let last = '';
  for (const block of vtt.split(/\n\n+/)) {
    const m = block.match(/(\d+):(\d+):(\d+)\.(\d+) -->/);
    if (!m) continue;
    const text = decode(block.split('\n').slice(1).filter((l) => !l.includes('-->')).join(' ')).trim();
    if (!text || text === last) continue; // auto-subs repeat each line
    last = text;
    cues.push({ ms: ((+m[1] * 60 + +m[2]) * 60 + +m[3]) * 1000, text });
  }
  return cues;
}

const id = videoId(input);
const lang = opt('lang');
let r, firstError;
try {
  r = viaPlayer(id, lang);
} catch (e) {
  firstError = e;
}
if (!r || (!r.cues.length && !args.includes('--list'))) {
  try {
    r = viaYtDlp(id, lang);
  } catch (e) {
    if (!r) {
      console.error(`player endpoint failed: ${firstError?.message}`);
      console.error(`yt-dlp fallback failed: ${(e.code === 'ENOENT' ? 'yt-dlp not installed' : String(e.stderr || e.message).trim().split('\n').pop())}`);
      console.error('install yt-dlp (pipx install yt-dlp), retry with --cookies chrome, or paste the transcript manually.');
      process.exit(1);
    }
  }
}

if (args.includes('--list')) {
  for (const t of r.list.filter((t) => !t.auto || t.orig !== false)) console.log(`${t.lang}\t${t.auto ? 'auto' : 'manual'}\t${t.name}`);
  process.exit(0);
}

const m = r.meta;
const header = [
  `# ${m.title || id}`,
  '',
  `- URL: https://www.youtube.com/watch?v=${id}`,
  `- Channel: ${m.channel || '?'}`,
  `- Duration: ${mmss((m.seconds || 0) * 1000)}`,
  m.views ? `- Views: ${m.views}` : null,
  m.uploaded ? `- Uploaded: ${m.uploaded}` : null,
  `- Captions: ${r.pick ? `${r.pick.lang} (${r.pick.auto ? 'auto-generated' : 'manual'})` : 'none'}`,
  `- Fetched: ${new Date().toISOString().slice(0, 10)}`,
  '',
  '## Description',
  '',
  m.description.trim() || '(empty)',
  '',
  '## Transcript',
  '',
  r.cues.length ? flatten(r.cues) : '(no captions available — ask the user for a transcript or a summary of the video)',
  '',
].filter((l) => l !== null).join('\n');

const out = opt('out');
if (out) {
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, header);
  console.error(`wrote ${out} (${r.cues.length} cues, ${header.length} chars)`);
} else {
  process.stdout.write(header);
}
