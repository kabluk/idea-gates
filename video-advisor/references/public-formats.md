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
does not have: **a ready instruction, a verified number, the author's own
take or test.** A how-to that saves the reader the 15 minutes of watching is
itself the value.

## The voice: "I found how to do X", not "a video about X"

The post is written by the user, in the first person, as someone who watched
the video, understood it and is sharing **what they found and how to do it**.
It is a how-to with an opinion, not a review of the video and not a news
digest. The reader should be able to act on the post without opening the
video.

- Yes: «Нашёл, как заставить Claude Code самому рисовать дизайн в Stitch.
  Вот что нужно…»
- No: «В новом ролике AI LABS показали…», «Чего в ролике нет…»,
  «Автор рассказывает…»

## Rules for every post

1. **First person, only true first person.** "Нашёл / разобрался / посмотрел"
   is true — the user has the brief. "Сделал / проверил на своём проекте /
   заработал" only if the user did it; otherwise leave a placeholder
   `[если сделали сами — результат: время, цифры]` for them to fill or delete.
   Never invent results.
2. **Nothing private leaks.** Nothing from the brief's gig, business and plan
   sections, nothing from `docs/FOUNDER.md`. Those are the user's edge; the
   post shares the know-how, not the money plan.
3. **Steps, not adjectives.** The core of every post is the steps: exact
   commands, prompts, settings. At least one verified number with its date
   (a version, a price, a limit).
4. **"Где споткнётесь"** — the practical pitfalls and their fixes, in the
   first person ("у меня бы сломалось на…" only if true; otherwise "имейте в
   виду…"). This replaces any critique of the video.
5. **The headline is the capability or the result**, not the news and not
   the video's clickbait: «Claude Code теперь сам рисует дизайн в Stitch —
   вот как подключить», not «Google исправил AI-дизайн».
6. **Credit in one line at the end**: «Подсмотрел у <channel>: <link>».
   Short, but always there — repackaging without credit gets called out.
7. **Hook to the next post** when the user will really follow up: «Соберу так
   лендинг и покажу, сколько ушло времени». Marked as optional in the draft.
8. **Adapt, do not translate.** English versions are written for an
   international audience, not machine-translated from Russian.

## Which platforms for which video

Not every video deserves four posts. Default:

| Signal score | Telegram RU | X thread EN | LinkedIn EN | vc.ru / Хабр RU |
|---|---|---|---|---|
| ≤ 4 | skip, or a two-line tip if there is one good trick | skip | skip | skip |
| 5–6 | yes | yes | only if there is a business angle | no |
| ≥ 7, or the user ran their own test | yes | yes | yes | offer it |

Write the long-read only after asking: it costs the user an evening of
editing, and it is best when it contains their own experiment.

## Telegram (RU), 800–1300 characters

```
**<Что теперь можно сделать — одной строкой>**

<1–2 предложения от первого лица: что нашёл и почему это полезно. Одна проверенная цифра.>

Как сделать:
1. <шаг с точной командой / промптом>
2. <шаг>
3. <шаг>

Где споткнётесь: <1–2 ловушки и как их обойти>.

<Своя мысль — одно-два предложения: зачем это на самом деле, механизм.>

<Крючок (опционально): «Соберу так … и покажу цифры».>

Подсмотрел у <канал>: <ссылка>
```

As a text post this fits easily (limit 4096). A caption under a picture is
capped at 1024 characters (2048 with Premium): if the user wants an image,
cut to ≤ 1000 or post the image separately.

Telegram markdown: `**bold**`, `` `code` ``, links inline. Emoji at most one or
two, functional (📊 🛠), never decorative chains.

## X / Threads (EN), 5–7 posts

- Post 1 (≤ 280 chars): the capability + why it matters, first person ("Found
  a way to…"). Must work alone — most people read only this one. No "🧵"
  filler.
- Posts 2–5: the steps, one per post, with exact commands or prompts.
- Post 6: the pitfall and the fix, or the take (the mechanism).
- Last post: "Picked this up from <channel>" + link. Links in post 1 cut reach
  on X; put them last.

Threads takes the same text; posts can be up to 500 characters, so merge pairs.

## LinkedIn (EN), 1200–1800 characters

Business framing: what this changes for a team or a product, in money or time.

```
<Hook line — a claim or number, under 150 characters (the "…see more" cut).>

<Blank line, then 2–3 short paragraphs, first person: what I found, what it
changes for a team in time or money.>

How it works:
→ <step>
→ <step>
→ <step>

What to watch for: <the pitfall, one line>

<The takeaway in one sentence.>

<Question to the reader — a real one, not engagement bait.>

Picked this up from <channel> (link in the first comment)
```

LinkedIn penalises external links in the post body; the draft says "link in
the first comment" and gives the link separately.

## vc.ru / Хабр (RU), long-read, 6–12K characters

Simon Willison's structure, adapted:

1. Заголовок: возможность + результат («Claude Code + Stitch: собрал лендинг
   за N минут — пошагово»).
2. Лид: 2–3 предложения — что я сделал и что читатель унесёт.
3. Что это и зачем (кратко, со ссылками на первоисточники).
4. Как я это сделал — точные команды и промпты, блоки кода.
5. Что получилось — скриншоты, цифры (время, деньги, токены).
6. Где споткнётесь — ловушки и обходы.
7. Вывод — когда это применять и когда нет.

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
- [ ] крючок «соберу и покажу» — оставить, только если правда сделаете
```

Before handing the draft over, re-read it against the voice and rules 1–2:
no sentence describes the video ("в ролике", "автор", "показали"), every "I"
statement is true, and nothing from the private sections appears.
