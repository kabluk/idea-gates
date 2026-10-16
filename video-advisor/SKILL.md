---
name: video-advisor
description: Turn a YouTube video into action instead of a retelling — a private brief for the user (what it opens up, a step-by-step instruction checked against today, freelance gigs it makes sellable with real Kwork/Fiverr market data, bigger ideas through the idea-gates gates, a plan with a kill criterion) and first-person how-to post drafts the user approves and publishes under their own name (Telegram, X/Threads, LinkedIn, vc.ru/Хабр, Russian and English). Use whenever the user sends a YouTube link (youtube.com, youtu.be, shorts, live) or a pasted transcript and wants a summary, takeaways, "what can I do with this", "is this worth watching", "разбери видео", "что из этого применить", "сделай выжимку", or asks to compare a new video with ones already analysed, or wants a post / thread / article made from a video.
---

# video-advisor — a video in, a decision out

## Why this exists

People in long videos say genuinely useful things, but watching costs an hour
and a retelling costs almost as much attention while giving almost nothing:
a summary of an interview is still an interview. What the user wants is what
they would know if they had watched it, turned into action: *what can I now
do, exactly how, is it still true today, and where can I make money with it
this week.*

So the rule of this skill: **every section must end in something the user can
believe, check or do.** A paragraph that only restates the speaker is cut.

Every video produces two things with different readers:

- **The brief** — private, for the user only: the instruction, the gigs and
  their market numbers, ideas scored against the founder profile, the plan.
  Never published.
- **Public post drafts** — the user's own first-person how-to posts, published
  under their name after they approve them. They share the know-how (the
  instruction, the pitfalls, a take), never the money plan.

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
video's. Readable in **under five minutes**, except the instruction, which is
as long as the steps need.

**Voice: describe the thing, not the video.** The user wants what they would
know if they had watched it, turned into action. Never "the speaker says",
"in the video they show", "the author explains". Write "Stitch now has a CLI;
install it with…", not "the video shows how to install the CLI". Timestamps
appear only as references in brackets, `[05:26]`, so the user can jump to the
moment if they want to see it.

Every fact the instruction depends on (a command, a version, a price, a limit,
"free") is **checked against today** with the package registry, official docs
or web search, and the check date is written next to it. A video is a lead,
not a source.

Structure:

### 0. Verdict (3 lines)
- **What this gives me** — one sentence: the new capability or opportunity.
- **Signal 1–10** — how much usable, still-true, new material there is.
- **Watch it yourself?** No / only `[mm:ss]–[mm:ss]` / yes — and why.

### 1. What this opens up
3–5 bullets, each a concrete capability: "now X can be done in Y instead of Z".
For a video about new features or a product update: one bullet per feature
that matters, with what it replaces. Skip features that change nothing.

### 2. Instruction — how to do it
A playbook the user can follow without watching:
- **What you need** — accounts, tools, cost, limits (checked, with date).
- **Steps** — numbered; exact commands, exact prompts, where to click; what
  you should see after each step; rough time per step.
- **Where it breaks** — the pitfalls (including ones the video skips) and the
  fix for each.
- **Result** — what you have at the end, and how long the whole thing takes.

For a feature-review video: per feature — how to turn it on, one concrete use,
and the trap. Write commands and prompts in code blocks, ready to paste.

### 3. Money: gigs and quick opportunities
What someone who can now do this can sell **this week** on freelance
platforms. Check the market, do not guess:

- **Kwork** (RU): `node video-advisor/scripts/kwork-scan.mjs "<query>" ...` —
  number of offers (competition), p25/median/p75 price, reviews of the top
  sellers (proof that buyers exist). Scan 4–6 queries: the broad service and
  the narrow ones closest to what the video enables.
- **Fiverr / Upwork** (EN): they block scripts; use web search for gig pages
  and prices (`site:fiverr.com "<service>"`), and say the numbers are a sample.

Then a table:

| Gig | Platform | Offers | Median price | Top seller reviews | Time per order with this workflow | ≈ per hour | Verdict |
|---|---|---|---|---|---|---|---|

How to read it: many offers + top sellers with hundreds of reviews = proven
demand, hard entry, compete on speed or a narrow angle; few offers + a top
seller with real reviews = an underserved niche, the best case; few offers
and nobody with reviews = no buyers. Effective hourly rate is median price
divided by honest hours per order **including** revisions and communication.

For the best 1–2 gigs write a **ready gig card**: title (RU for Kwork, EN for
Fiverr), what the buyer gets, three packages with prices and delivery times,
the 2–3 portfolio pieces to make first with this very workflow (a new seller
without examples gets no orders), and the kill criterion (e.g. "no order
within 14 days after 3 portfolio pieces → drop or reprice"). Note the
platform's rules on AI-made work when they matter (Fiverr asks sellers to be
transparent about AI use; do not sell AI output as hand-made).

If the video gives nothing sellable, say so in one line and skip the section.

### 4. Bigger: product or business
Only if the video opens something beyond gigs. 1–2 ideas for **this founder**,
each through the six idea-gates gates, one line per gate, stop at the first
failure:

1. **First step** — the first action needing a stranger's consent; will they
   give it to this founder as they are today?
2. **Trust** — access to customers' money, accounts or sensitive data?
3. **Small-customer math** — typical customer × honest price per month.
4. **Measurability** — the one unmeasured number; measurable alone, within
   budget?
5. **Channel** — how they personally reach the first ten customers.
6. **Regulation** — does it fall under a licence?

If an idea survives and the idea-gates skill is installed, offer the full pass.

### 5. Plan
- **Today, ≤ 1 hour** — the one action, exact command or page to open.
- **This week** — 2–3 steps with what "done" looks like (usually: run the
  instruction once, make portfolio pieces, publish the gig).
- **30 days** — the experiment, metric, budget in money and hours, and the
  **kill criterion**.

### 6. Why it works and how long it lasts
Two or three short paragraphs, the strategist and the philosopher together:
the lever underneath (a cost that fell, a new tool, a platform shift), who
will copy it and how fast — **the shelf life of the gig opportunity** in
particular, since a trick shown to 50K viewers fills the gig market within
weeks — and one question worth sitting with.

### 7. Watch out
The source's incentives (sponsors, paid community, agency upsell — check the
description), claims that did not survive the check, numbers without a
denominator. Short; "none found" is a valid answer.

### 8. Remember
One line the user could still recall in a month. Plus 3–5 tags.

## Step 4 — save it

Save the brief to `research/videos/YYYY-MM-DD-<short-slug>.md` (today's date,
slug from the title), with the video URL, channel, upload date and signal
score at the top. Add one line to `research/videos/INDEX.md` (create it with
a header if missing):

```
| date | title (linked to the brief) | channel | signal | best gig or idea | tags |
```

Keep the raw transcript in `research/videos/raw/` — it lets a later question
("what did that guy say about pricing?") be answered without refetching.

## Step 5 — public post drafts

Read `references/public-formats.md` and follow it. The posts are written by
the user in the first person, as someone who watched the video and is sharing
what they found and how to do it — a how-to, not a review of the video. Which
platforms the signal score earns, the format for each (Telegram RU, X/Threads
EN, LinkedIn EN, vc.ru/Хабр RU long-read on request), and the rules: "I" only
where it is true, nothing from the private sections (gigs, ideas, plan),
credit the source in one line at the end.

Save the drafts to `research/videos/posts/<same slug as the brief>.md` with
`Статус: черновик`. Nothing is published by this skill: the user edits,
approves and posts. When the user approves, change the status to
`согласовано` and the date; when they report it is posted, add the links.

## Reply in chat

Show sections 0, 3 (the gig table) and 5 (plan) of the brief, then the Telegram draft
in full (it is the shortest and the one most likely to be posted as is), and
the paths to the full brief and to all drafts.

## Several videos at once

When the user sends several links, write one brief per video, then a short
**synthesis**: claims that repeat across independent speakers (stronger),
claims that contradict each other (name the disagreement and which side the
evidence favours), and the single best next action across all of them.

## Mistakes this skill is built against

- **Describing the video instead of the thing.** "The speaker then talks
  about…", "in the video they show…" — the sentences this skill exists to
  delete. The user wants the know-how and the opportunity, not a review.
- **Guessing the gig market.** "There is demand for landing pages" is not a
  finding; 4513 offers at a median of 8000 ₽ with top sellers at 1000+
  reviews is.
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
