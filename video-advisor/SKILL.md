---
name: video-advisor
description: Turn a YouTube video into two outputs — a private advisor's brief for the user (claims and how well they are supported, whether they are still true today, the mechanism, business ideas run through the idea-gates feasibility gates against this founder, an action plan, the philosophical assumption underneath, red flags) and public post drafts the user approves and publishes under their own name (Telegram, X/Threads, LinkedIn, vc.ru/Хабр, Russian and English). Use whenever the user sends a YouTube link (youtube.com, youtu.be, shorts, live) or a pasted transcript and wants a summary, takeaways, "what can I do with this", "is this worth watching", "разбери видео", "что из этого применить", "сделай выжимку", or asks to compare a new video with ones already analysed, or wants a post / thread / article made from a video.
---

# video-advisor — a video in, a decision out

## Why this exists

People in long videos say genuinely useful things, but watching costs an hour
and a retelling costs almost as much attention while giving almost nothing:
a summary of an interview is still an interview. What the user wants is what
a good advisor would say after watching it for them: *is any of this true,
does it still hold, what would I do with it, starting when.*

So the rule of this skill: **every section must end in something the user can
believe, check or do.** A paragraph that only restates the speaker is cut.

Every video produces two things with different readers:

- **The brief** — private, for the user only: their founder profile, ideas
  scored against it, their plan, the uncomfortable question. Never published.
- **Public post drafts** — for other people, published by the user under their
  own name after they approve them. Built only from the parts of the brief
  that are about the world (verified facts, the mechanism, what the video
  leaves out), never from the parts that are about the user.

## Step 1 — get the transcript

```sh
node video-advisor/scripts/transcript.mjs "<url>" --out research/videos/raw/<VIDEO_ID>.md
```

(The path is relative to where the skill lives; if it is installed in
`.claude/skills/video-advisor`, run `.claude/skills/video-advisor/scripts/transcript.mjs`.)

It writes title, channel, duration, upload date, description and a transcript
with `[mm:ss]` marks. Then **read the whole file**, in chunks if it is long —
the best idea in a podcast is often in the last twenty minutes, and a brief
built from the first third is a lie of omission.

If it fails:
- `Sign in to confirm you're not a bot` → retry with `--cookies chrome` (or
  `firefox`, `safari`); this needs yt-dlp (`pipx install yt-dlp` or
  `pip install --user yt-dlp`).
- No captions at all → ask the user to paste the transcript (YouTube: "…more"
  → "Show transcript") or a few lines on what the video is about. Do not
  analyse from the title and description alone and present it as a brief.
- Auto-generated captions mangle names, numbers and jargon. When a number
  matters to the conclusion and looks odd, say it may be a caption error.

## Step 2 — context before judgement

1. Read `docs/FOUNDER.md` if it exists (the idea-gates founder profile:
   location, languages, legal entity, trust assets, budget, what the user will
   not do). Ideas and plans are scored against this person, not a generic
   reader. If it does not exist, do not interrogate the user — write the brief
   for a solo founder with little money and time, and say once at the end that
   a profile would make it sharper (`templates/FOUNDER.example.md` in the
   idea-gates repo).
2. Note the **age of the video**: upload date vs today. Anything about AI
   tools, platforms, ad channels, prices, regulation or "what works now" older
   than ~6 months is suspect by default.
3. Skim `research/videos/INDEX.md` if it exists: if an earlier video made the
   same or the opposite claim, say so — repetition across independent sources
   is evidence, a contradiction is a question worth surfacing.

## Step 3 — the brief

Write in the user's language (the language they wrote to you in), not the
video's. Keep the whole brief readable in **under five minutes**; length goes
into the claims table, not into prose. Use this structure:

### 0. Verdict (3 lines)
- **One sentence**: what this video is actually worth to this user.
- **Watch it yourself?** No / only `[mm:ss]–[mm:ss]` / yes, all of it — and why.
- **Signal score 1–10**: density of claims that are new, supported and usable.
  A charismatic hour with two ideas is a 3.

### 1. Core thesis
Two or three sentences: the one idea the whole video rests on, in your own
words. Not the topics covered — the claim.

### 2. Claims worth keeping
A table, 3–8 rows, only claims that change a decision:

| Claim | [mm:ss] | Evidence | Strength |
|---|---|---|---|

Evidence is one of: *data* (numbers with a source), *case* (their own result),
*anecdote* (someone they know), *opinion*, *sales pitch*. Strength: strong /
plausible / weak / wrong. One case is not a pattern — say so.

### 3. Is it still true? (relevance)
For each claim that depends on time (prices, channel performance, tool
capabilities, laws, market size, "nobody is doing X yet"): is it still true on
today's date? **Check the two or three load-bearing ones with web search**
rather than memory, and give the date of what you found. Mark each:
*still true* / *changed: how* / *could not verify*. "Nobody is doing X yet" in
a video with 500K views is almost by definition no longer true.

### 4. Strategist: the mechanism
Why does the thing they describe work — what is the underlying lever (an
information asymmetry, a platform subsidy, a new regulation, a cost that fell,
a habit that shifted)? Then:
- **Who captures the value** and who will copy it once it is public;
- **Second-order effects**: what happens when many viewers act on this;
- **Shelf life**: how long the window stays open, and the signal that it closed.

A mechanism outlives the tactic. If the speaker's tactic is already dead, the
mechanism may still point somewhere new — say where.

### 5. Business analyst: ideas for this user
1–3 business or project ideas the video opens up **for this founder**, not
the speaker's own business restated. Run each through the six idea-gates
gates, one line per gate, and stop at the first failure:

1. **First step** — the first action needing a stranger's consent; will they
   give it to this founder as they are today?
2. **Trust** — does it need access to customers' money, accounts or sensitive
   data? Anonymous founder without a trust carrier fails.
3. **Small-customer math** — typical (not best) customer × honest price per
   month, one multiplication.
4. **Measurability** — the one unmeasured number it rests on; can the founder
   measure it alone within their validation budget?
5. **Channel** — how they personally reach the first ten customers without
   anything on their "will not do" list.
6. **Regulation** — does it fall under a licence (legal, tax, financial,
   medical, immigration advice, payments, children's data)?

An idea that dies at a gate is still a useful result — write which gate and
why in one line. If an idea survives all six and the idea-gates skill is
installed, offer to run the full idea-gates pass (market data, red-team).
If the video has no business angle, say so and skip this section; do not
manufacture one.

### 6. Planner: what to do
- **Today, ≤ 1 hour**: one concrete action that tests the most valuable claim
  cheaply (a search, a message, a calculation, a landing page, a query in a
  data tool). Name the exact thing to type or open.
- **This week**: 2–3 steps, each with what "done" looks like.
- **30 days**: the experiment, its success metric, its budget in money and
  hours, and the **kill criterion** — the result that means stop.
If the honest advice is "do nothing, this does not apply to you", say that;
it saves the user more time than any plan.

### 7. Philosopher: the assumption underneath
- What does the speaker take for granted about people, markets or a good
  life? (e.g. "growth is always good", "hustle beats leverage", "freedom =
  location independence")
- The strongest **counter-view**, stated fairly, in two sentences.
- What it means for *this* user's priorities, if `FOUNDER.md` says anything
  about them.
- **One question to sit with** — the question the video raises but does not
  answer. One, not a list.

### 8. Red flags
The speaker's incentives (course, agency, affiliate links, fund portfolio —
check the description), survivorship bias, cherry-picked timeframes, numbers
without a denominator, "anyone can do this". If there are none, write "none
found" — do not invent scepticism for balance.

### 9. Remember
One line the user could still recall in a month. Plus 3–5 tags.

## Step 4 — save it

Save the brief to `research/videos/YYYY-MM-DD-<short-slug>.md` (today's date,
slug from the title), with the video URL, channel, upload date and signal
score at the top. Add one line to `research/videos/INDEX.md` (create it with
a header if missing):

```
| date | title (linked to the brief) | channel | signal | ideas that survived gates | tags |
```

Keep the raw transcript in `research/videos/raw/` — it lets a later question
("what did that guy say about pricing?") be answered without refetching.

## Step 5 — public post drafts

Read `references/public-formats.md` and follow it: which platforms the
signal score earns, the format for each (Telegram RU, X/Threads EN, LinkedIn
EN, vc.ru/Хабр RU long-read only on request), and the rules — first person
only where it is true, nothing from the private sections, credit the source,
the headline states the fact rather than the video's clickbait.

Save the drafts to `research/videos/posts/<same slug as the brief>.md` with
`Статус: черновик`. Nothing is published by this skill: the user edits,
approves and posts. When the user approves, change the status to
`согласовано` and the date; when they report it is posted, add the links.

## Reply in chat

Show sections 0 and 6 of the brief (verdict and plan), then the Telegram draft
in full (it is the shortest and the one most likely to be posted as is), and
the paths to the full brief and to all drafts.

## Several videos at once

When the user sends several links, write one brief per video, then a short
**synthesis**: claims that repeat across independent speakers (stronger),
claims that contradict each other (name the disagreement and which side the
evidence favours), and the single best next action across all of them.

## Mistakes this skill is built against

- **Retelling instead of judging.** "The speaker then talks about…" is the
  sentence this skill exists to delete.
- **Trusting the date of the video as the date of the world.** A tactic from
  2023 presented as current advice is the most common way a summary misleads.
- **Generic advice.** "Consider building an audience" applies to everyone and
  therefore to no one. Every action must name a concrete first step for this
  user.
- **Ideas the founder cannot execute.** A plan that requires cold calls for a
  user who will not make them, or a licence they do not have, is noise —
  that is what the gates are for.
- **Manufactured depth.** If a video is shallow, a short brief that says so is
  the right output. The philosopher section for a video about Excel shortcuts
  can be one line.
