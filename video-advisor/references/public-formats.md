# Public post formats

The public half of a video brief: drafts the user approves and publishes under
their own name. Built from what the most-read AI channels actually do, measured
in October 2026:

| Source | Audience | What it contributes |
|---|---|---|
| The Rundown AI | 2M+ email | Rigid skeleton: what happened → details as a list → why it matters; readable in a minute |
| Simon Willison's blog | the most-cited developer blog | "I tried it": exact command or prompt, what came out, "key things I learned", quote the source |
| эйай ньюз (97K) | Telegram | Headline is the fact; dense paragraphs with hard numbers (price, VRAM, seconds); links at the bottom |
| Сиолошная (80K) | Telegram | Author's opinion plus a human story; own calculations |
| Data Secrets (95K) | Telegram | Fact → story → one dry closing line |
| Denis Sexy IT (138K) | Telegram | Own projects, debunks, one-line jokes |

What got **2× a channel's normal views** in the sample: a human story, the
author's own experiment or project, a debunk ("checked it — not true"), a
one-liner. A plain retelling of news gets the channel's baseline. So a post
built on someone else's video earns attention only through what the video
does not have: **a check with numbers, a debunk of its headline, or the
author's own test.**

## Rules for every post

1. **First person, but only true first person.** "I checked" is allowed for
   what the brief actually verified (npm registry, prices, dates). "I tried it"
   only if the user did — otherwise leave a placeholder
   `[если пробовали сами — 1–2 фразы о результате]` for them to fill or delete.
   Never invent personal experience.
2. **Nothing private leaks.** No content from sections 5–7 of the brief (ideas
   scored against the founder, the plan, the philosopher's question addressed
   to the user), nothing from `docs/FOUNDER.md`. The public post is about the
   news and the check, not about the user's business.
3. **Credit the source.** Name the channel and link the video. A post that
   repackages someone's video without credit gets called out — and deserves to.
4. **The headline is the fact, not the clickbait.** If the video's title
   overstates ("Google fixed AI design"), the post's headline states what
   actually happened ("Google shipped a CLI for Stitch") — the gap itself is
   often the best hook.
5. **One number beats three adjectives.** Every post carries at least one
   verified number with its date.
6. **"What they didn't tell you" is mandatory** when the brief's red flags or
   relevance check found something. It is the main reason to share the post.
7. **End with a hook to the next post** when there is one: "I'll test it and
   come back with numbers" — and then the follow-up is an own-experiment post,
   the strongest format. Do not promise what the user will not do; mark it as
   a suggestion in the draft.
8. **Adapt, do not translate.** The English versions are written for an
   international audience (no RU-specific references, different examples if
   needed), not machine-translated from Russian.

## Which platforms for which video

Not every video deserves four posts. Default:

| Signal score | Telegram RU | X thread EN | LinkedIn EN | vc.ru / Хабр RU |
|---|---|---|---|---|
| ≤ 4 | skip, or a two-line post if the debunk is good | skip | skip | skip |
| 5–6 | yes | yes | only if there is a business angle | no |
| ≥ 7, or the user ran their own test | yes | yes | yes | offer it |

Write the long-read only after asking: it costs the user an evening of
editing, and it is best when it contains their own experiment.

## Telegram (RU), 800–1300 characters

```
**<Факт одной строкой — что произошло, без кликбейта>**

<2 предложения: что именно вышло / случилось, дата, одна проверенная цифра.>

<Как это работает / как применить — 3–4 пункта через «—»>

Чего в ролике нет: <пробелы, оговорки, проверенные факты, которые меняют картину>.

<Своя мысль — одно-два предложения. Механизм, а не пересказ.>

<Крючок: «Проверю сам и вернусь с цифрами» — только если пользователь это сделает.>

Источник: <канал>, <ссылка на видео>
```

As a text post this fits easily (limit 4096). A caption under a picture is
capped at 1024 characters (2048 with Premium): if the user wants an image,
cut to ≤ 1000 or post the image separately.

Telegram markdown: `**bold**`, `` `code` ``, links inline. Emoji at most one or
two, functional (📊 🛠), never decorative chains.

## X / Threads (EN), 5–7 posts

- Post 1 (≤ 280 chars): the fact + the gap. Must work alone — most people read
  only this one. No "🧵" or "a thread" filler.
- Posts 2–5: one idea each — how it works, the numbers, what's missing.
- Post 6: the takeaway (the mechanism).
- Last post: source credit + link. Links in post 1 cut reach on X; put them last.

Threads takes the same text; posts can be up to 500 characters, so merge pairs.

## LinkedIn (EN), 1200–1800 characters

Business framing: what this changes for a team or a product, in money or time.

```
<Hook line — a claim or number, under 150 characters (the "…see more" cut).>

<Blank line, then 2–3 short paragraphs: what happened, what it means for teams.>

What the demo doesn't show:
→ <point>
→ <point>

<The takeaway in one sentence.>

<Question to the reader — a real one, not engagement bait.>

Source: <channel> (link in the first comment)
```

LinkedIn penalises external links in the post body; the draft says "link in
the first comment" and gives the link separately.

## vc.ru / Хабр (RU), long-read, 6–12K characters

Simon Willison's structure, adapted:

1. Заголовок: факт + обещание проверки («Google выпустил CLI для Stitch:
   проверил, сколько стоит один лендинг»).
2. Лид: 2–3 предложения — что произошло и что читатель узнает.
3. Что это и зачем (кратко, со ссылками на первоисточники).
4. Как я это сделал — точные команды и промпты, блоки кода.
5. Что получилось — скриншоты, цифры (время, деньги, токены).
6. Чего не говорят в роликах — оговорки, ограничения, проверенные факты.
7. Вывод — механизм, когда это применять и когда нет.

Хабр не любит самопиар и пересказ видео без своей работы; без раздела «как я
это сделал» статью туда не отправлять — предложить vc.ru или отложить до
эксперимента.

## Draft file and approval

Save drafts to `research/videos/posts/<same-slug-as-brief>.md`:

```
# Посты: <title>

Статус: черновик        ← пользователь меняет на «согласовано» или просит правки
Бриф: ../<brief file>.md
Видео: <url>

## Telegram (RU)
...
## X thread (EN)
1/ ...
## LinkedIn (EN)
...
## Ссылка для первого комментария LinkedIn
...
## Перед публикацией
- [ ] заполнить или удалить плейсхолдеры [ … ]
- [ ] крючок «проверю сам» — оставить, только если правда будете проверять
```

Before handing the draft over, re-read it against rules 1–2: every "I"
statement must be true, and nothing from the private sections may appear.
