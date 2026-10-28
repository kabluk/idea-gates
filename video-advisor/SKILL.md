---
name: video-advisor
description: Turn a YouTube video into action instead of a retelling — a private brief that looks at it from several sides (a step-by-step instruction checked against today, what was said between the lines, freelance gigs with real Kwork/Freelancer/Fiverr market data, education products from workshop to course, bigger ideas through the idea-gates gates, the trend stage), scores every opportunity in one table, plans around the winner and is checked by an independent reviewer and first-person how-to post drafts the user approves and publishes under their own name (Telegram, X/Threads, LinkedIn, vc.ru/Хабр, Russian and English). Use whenever the user sends a YouTube link (youtube.com, youtu.be, shorts, live) or a pasted transcript and wants a summary, takeaways, "what can I do with this", "is this worth watching", "разбери видео", "что из этого применить", "сделай выжимку", or asks to compare a new video with ones already analysed, or wants a post / thread / article made from a video.
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

- **The brief** — private, for the user only. It looks at the video from
  several sides — the practitioner (instruction), what was said between the
  lines, quick money (gigs), education products, a bigger product, the trend
  — then scores every opportunity in one table and plans around the winner.
  An independent reviewer checks it before it is handed over. Never
  published.
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

### 1b. Between the lines
People say more than the main thread of a video. Mine the transcript (and the
description, chapters and links) for what is said in passing — it is often
worth more than the headline:
- **Tools and services mentioned by name**, with what each was used for and a
  link (checked to exist).
- **Exact numbers** — time spent, costs, counts, results — with timestamps.
- **Prompts, commands, settings quoted verbatim.**
- **The speaker's mistakes and lessons** ("I had to run it twice", "the AI
  adds too much copy").
- **Opinions and predictions** worth tracking, marked as opinion.
- **The speaker's real business** — what the video is a funnel for. An
  open-source project, a free tool or a course is often marketing for
  something else; that model can be an opportunity in itself.
The transcript has no picture: if a key moment is visual ("as you can see"),
say so and give the timestamp instead of guessing what was on screen.

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
platforms — Russian-speaking **and** international. Check the market, do not
guess. Supply (who already sells it) and demand (who is buying right now) are
different numbers; get both:

- **Kwork** (RU, supply): `node video-advisor/scripts/kwork-scan.mjs "<query>" ...`
  — offers (competition), p25/median/p75 price, reviews of the top sellers
  and bookmarks of their gigs. **Seller reviews are the seller's whole
  history, not this gig's** — a seller with thousands of reviews over a dozen-plus gigs proves
  the seller, not the niche (one such seller's gig in a new niche had 4 bookmarks). Say "seller
  with N reviews", never "the gig has N reviews"; the gig's bookmarks are the
  only public gig-level signal. Scan 4–6 queries: the broad service and the narrow ones
  closest to what the video enables.
- **Freelancer.com** (EN, demand): `node video-advisor/scripts/freelancer-scan.mjs "<label>@<skill-id>" ...`
  — open jobs, budgets in USD, bids per job. Hundreds of bids per job = a
  price race; skill ids are listed in the script header.
- **Fiverr** (EN, supply): blocks scripts; web search `site:fiverr.com "<service>"`
  — how many gigs exist, how specialised they are, prices where visible.
- **Upwork** (EN, demand and supply): blocks scripts; web search
  `site:upwork.com/jobs "<service>"` and `site:upwork.com/services "<service>"`
  — budgets and proposal counts from job pages, rates from service pages.
- Say plainly which numbers are a full scan and which are a sample.

**Demand check — mandatory before calling anything "free", "underserved" or
"almost nobody does this".** Few competitors means either nobody noticed or
nobody buys, and the second is more common. Run:

```sh
node video-advisor/scripts/demand-check.mjs "<what the buyer would search>" "<the free/self-serve alternative>" ...
```

Google monthly searches over US, UK, DE (Cyrillic queries default to KZ, UZ,
UA — Google Ads has no data for Russia), year-over-year trend, a flag for
suspicious steps in the series. Always include in the same run **the
alternative the buyer already has** (a free tool, a DIY route): if the
alternative grows while your angle sits at noise level, the buyer solves the
problem without you. *(Case: "self hosted typeform" — 10 searches a month per
country; "tally forms", the free tool people actually switched to — 6,700
and +114% in a year. The "free angle" was free because nobody wanted it.)*

Reading it: under 50 a month across the checked countries — noise, do not
build a gig on it; 50–500 — a niche, fine for a narrow gig; 500+ — a market,
expect competition. For marketplace gigs Google volume measures interest in
the outcome, not buyers on the platform: the platform's own signal (gig
bookmarks and specialised sellers on Kwork, open jobs on Freelancer and
Upwork) still decides, and
both must agree before a gig is called promising. For Russian-language gigs
the KZ/UZ/UA numbers are only a rough proxy — say so, and lean on Kwork
reviews. Without DataForSEO credentials, write "demand not measured" next to
the claim instead of guessing.

Then a table:

| Gig | Platform | Competition | Price | Proof of buyers | Time per order with this workflow | ≈ per hour | Verdict |
|---|---|---|---|---|---|---|---|

End the section with a one-paragraph **"where it sells"** verdict: which
platform fits this gig and why (language barrier, price level, how saturated,
whether a newcomer without reviews can get the first order).

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

### 3b. Education products
What this know-how could become as a workshop, a niche course or a big
programme. Follow `references/education-products.md`: a ladder (free lead
magnet → workshop → niche course → cohort), 5–10 named ideas with audience,
result, programme, price checked against comparable offers, and **the own
case the user needs first** — nobody buys a course from someone who only
watched the video. Courses sell through an audience, not search, so tie each
idea to the posts that would build that audience. Skip the section if the
topic is not teachable (a one-off news item).

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

### 4b. Scorecard — what to do first
Put every opportunity from sections 3, 3b and 4 (and "build an audience with
posts", if the topic suits) into one table and score each 1–5:

| Opportunity | Money potential | Speed to first money | Demand evidence | Competition (5 = little) | Fit with the user | Risk (5 = low) | Shelf life | Total |
|---|---|---|---|---|---|---|---|---|

Rules: **demand evidence above 2 requires a measurement** from this brief
(demand-check, marketplace jobs, comparable sales) — an unmeasured "people
want this" scores 1 or 2. "Fit" uses `docs/FOUNDER.md`; without it, score 3
and say so. Name the winner and the runner-up in one line each, and say what
would change the ranking (usually: the first two weeks of real orders).

### 5. Plan
Built around the scorecard winner.
- **Today, ≤ 1 hour** — the one action, exact command or page to open.
- **This week** — 2–3 steps with what "done" looks like (usually: run the
  instruction once, make portfolio pieces, publish the gig).
- **30 days** — the experiment, metric, budget in money and hours, and the
  **kill criterion**.

### 6. Trend: where this is on the curve
Use numbers, not adjectives:
- **Search trend** — demand-check on the topic's main terms (year over year);
- **Supply trend** — new gigs, clones, competitors appearing (marketplace
  counts, GitHub stars or forks of the tool and its alternatives, with dates);
- **Stage** — one of: *early* (practitioners only, little search, few
  offers), *rising* (search growing fast, clones appearing), *peak hype*
  (search at its highest, marketplaces flooding), *mainstream* (flat search,
  crowded, prices falling), *fading*. Say what evidence put it there.
- **Window** — how long each opportunity in the scorecard stays open at this
  stage, and the signal that it closed.

Then two short paragraphs: the lever underneath (why it works at all), and
one question worth sitting with.

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

## Step 4b — independent review

The brief is checked by someone who did not write it — the same principle
that makes agents reliable: do not accept "done" without proof. If the Agent
tool is available, spawn a general-purpose subagent with this prompt (fill in
the paths):

```
You are the independent reviewer of a video brief. Read the transcript
<raw transcript path> and the brief <brief path>. Report, as a list:
1. Claims in the brief that are not in the transcript and have no cited source.
2. Numbers without a source or date.
3. Any niche called free/underserved without a demand measurement.
4. Scorecard scores that contradict the evidence in the brief (e.g. demand
   evidence > 2 with nothing measured).
5. Marketplace claims that confuse seller-level reviews with gig-level demand.
6. Valuable things said in the transcript that the brief missed.
7. Anything in the public post drafts that leaks the private sections or
   claims a first-person result the user did not get.
Be specific: quote the line, say what is wrong, propose the fix. No praise.
```

Fix what it finds, then add a short **"Review"** note at the end of the
brief: what was checked, what was changed, what remains unverified. Without
the Agent tool, run the same seven checks yourself, one by one, and say in the
note that the review was a self-review.

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

Show sections 0, 4b (the scorecard) and 5 (plan) of the brief, then the Telegram draft
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
- **"Nobody does this" without a demand check.** An empty niche is usually
  empty because there are no buyers. Measure searches for the angle and for
  the buyer's free alternative before writing "free angle".
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
