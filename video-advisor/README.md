# video-advisor

A Claude Code skill: send it a YouTube link, get back an advisor's brief instead of a retelling.

For every video it writes a private brief:

- **Verdict** — what the video gives you, signal score, whether to watch it yourself.
- **What this opens up** — the new capabilities, one per bullet.
- **Instruction** — step by step, with exact commands and prompts, every fact checked against today,
  plus the pitfalls the video skips. You can act without watching.
- **Money** — freelance gigs this makes sellable, with real market numbers from Russian-speaking and
  international platforms: Kwork via `scripts/kwork-scan.mjs` (offers, price quartiles, reviews of top
  sellers), Freelancer.com via `scripts/freelancer-scan.mjs` (open jobs, USD budgets, bids per job),
  Fiverr and Upwork via web search,
  effective hourly rate, and ready gig cards with packages and a kill criterion.
- **Bigger** — product or business ideas, each run through the six [idea-gates](../README.md) gates.
- **Plan** — today (≤ 1 hour), this week, 30 days with a kill criterion.
- **Why it works and how long it lasts** — the lever, and the shelf life of the gig window.

Briefs are saved to `research/videos/` with an `INDEX.md`, so they build up into a library that later
briefs check new claims against.

Alongside the private brief it writes **first-person how-to post drafts** — as if you watched the
video and are sharing what you found — that you approve and publish under your own name: a Telegram post (RU), an X/Threads thread and a LinkedIn post (EN), and on request a vc.ru /
Хабр long-read. The formats come from what the most-read AI channels do (The Rundown, Simon Willison,
эйай ньюз, Сиолошная, Data Secrets, Denis Sexy IT) — see `references/public-formats.md`. Nothing from
the private brief (gigs, ideas, plan) goes into a post, and "I" statements are only ones that
are true.

## Install

Clone the repository anywhere and link the skill into your project (or into `~/.claude/skills` for
every project):

```sh
git clone https://github.com/kabluk/idea-gates ~/src/idea-gates
mkdir -p .claude/skills
ln -s ~/src/idea-gates/video-advisor .claude/skills/video-advisor
ln -s ~/src/idea-gates .claude/skills/idea-gates   # optional: full idea-gates pass for surviving ideas
```

Needs Node.js 18+ and `curl`. Strongly recommended: [yt-dlp](https://github.com/yt-dlp/yt-dlp)
(`pipx install yt-dlp`) — the script first tries YouTube's player endpoint directly and falls back to
yt-dlp when YouTube asks for a bot check, which happens often from cloud and VPN addresses.

Then in Claude Code: *"Разбери: https://youtu.be/..."* or *"What can I do with this video? <link>"*.

## The transcript script on its own

```sh
node video-advisor/scripts/transcript.mjs "https://youtu.be/VIDEO_ID"                # to stdout
node video-advisor/scripts/transcript.mjs VIDEO_ID --lang ru --out raw/VIDEO_ID.md   # pick a language
node video-advisor/scripts/transcript.mjs VIDEO_ID --list                            # list caption tracks
node video-advisor/scripts/transcript.mjs VIDEO_ID --cookies chrome                  # past a bot check
```

Manual captions are preferred over auto-generated ones, and the spoken language over machine
translations. Output is Markdown: metadata, description, and the transcript in ~30-second paragraphs
with `[mm:ss]` marks.
