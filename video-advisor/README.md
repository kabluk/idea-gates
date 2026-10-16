# video-advisor

A Claude Code skill: send it a YouTube link, get back an advisor's brief instead of a retelling.

For every video it answers:

- **Verdict** — what the video is worth to you, whether to watch it yourself (and which minutes), signal score.
- **Claims worth keeping** — with timestamps, the kind of evidence behind each, and how strong it is.
- **Is it still true?** — time-sensitive claims checked against today, with web search, not memory.
- **Strategist** — the mechanism behind the tactic, who captures the value, how long the window stays open.
- **Business analyst** — 1–3 ideas for *you*, each run through the six [idea-gates](../README.md) gates against your `docs/FOUNDER.md`.
- **Planner** — one action for today (≤ 1 hour), steps for the week, a 30-day experiment with a kill criterion.
- **Philosopher** — the assumption underneath, the strongest counter-view, one question to sit with.
- **Red flags** — the speaker's incentives, survivorship bias, numbers without a denominator.

Briefs are saved to `research/videos/` with an `INDEX.md`, so they build up into a library that later
briefs check new claims against.

Alongside the private brief it writes **public post drafts** you approve and publish under your own
name: a Telegram post (RU), an X/Threads thread and a LinkedIn post (EN), and on request a vc.ru /
Хабр long-read. The formats come from what the most-read AI channels do (The Rundown, Simon Willison,
эйай ньюз, Сиолошная, Data Secrets, Denis Sexy IT) — see `references/public-formats.md`. Nothing from
the private brief (your profile, ideas, plan) goes into a post, and "I" statements are only ones that
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
