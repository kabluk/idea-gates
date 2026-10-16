# Посты: Google Just Fixed AI Design By Releasing This

Статус: черновик
Бриф: ../2026-10-16-google-stitch-cli-claude-code.md
Видео: https://www.youtube.com/watch?v=au2TI8sdq8E
Сигнал брифа: 5/10 → Telegram RU + X EN + LinkedIn EN (есть деловой угол). Лонгрид для vc.ru/Хабра — только после собственной проверки.

## Telegram (RU)

**Google выпустил CLI для Stitch — теперь Claude Code сам рисует дизайн**

1 октября в npm появился `@google/stitch` — официальный CLI дизайн-инструмента Google. Раньше, чтобы агент управлял Stitch, нужно было настраивать MCP через Google Cloud. Теперь хватает `npm i -g @google/stitch && stitch login`.

Как это используют в ролике AI LABS:
— Claude опрашивает вас и пишет `brief.md`; все промпты идут из него, поэтому стиль дизайнов не «гуляет»
— просит у Stitch несколько вариантов и сам отбраковывает слабые (у них вышло 8 итераций)
— отдельный скилл-ревьюер сверяет сайт с макетом на трёх ширинах экрана; без него сайт ломался на телефоне

Чего в ролике нет: ни времени, ни расхода кредитов. Stitch бесплатный, но с дневным лимитом, а 8 итераций на страницу — это заметная часть лимита. CLI вышел две недели назад, версия 0.11: команды ещё будут меняться. А заголовок «Google исправил AI-дизайн» — это про бета-CLI, не про дизайн.

Главное тут не Stitch, а схема: один бриф → генератор → независимый критик. Она переносится на любую работу с агентами, и именно критик делает результат лучше, а не количество итераций.

[если пробовали сами — 1–2 фразы о результате]

Проверю на своём лендинге и вернусь с цифрами: сколько времени и кредитов уходит на одну страницу.

Источник: AI LABS, https://www.youtube.com/watch?v=au2TI8sdq8E

## X thread (EN)

1/ Google shipped an official CLI for Stitch on Oct 1. Claude Code can now design in Stitch directly — no Google Cloud MCP setup. The demo everyone's sharing skips the two numbers that matter: time and credits.

2/ Setup is two commands: `npm i -g @google/stitch` and `stitch login`. Add the Stitch skill to `.claude/skills/` and the agent knows the tool exists and how to use it.

3/ The workflow that makes it work isn't Stitch itself:
— the agent interviews you and writes brief.md
— every Stitch prompt comes from that one brief, so styles stop drifting
— the agent generates variants and rejects weak ones (8 rounds in the demo)

4/ The step worth stealing: a separate review skill that diffs the built site against the design at phone, tablet and desktop widths. Without it, sites looked fine on desktop and broke on mobile — Stitch designed for desktop only.

5/ What's missing: no timing, no credit count. Stitch is free but capped daily, and 8 rounds per page eats into that. The CLI is v0.11 and two weeks old. "Google fixed AI design" = a beta CLI shipped.

6/ The takeaway generalizes beyond design: one written brief → a generator → an independent critic. Quality comes from the critic, not from more generations.

7/ Source: AI LABS — https://www.youtube.com/watch?v=au2TI8sdq8E
I'll run it on a real landing page and post the time and credit numbers.

## LinkedIn (EN)

Google quietly shipped a CLI for Stitch on October 1 — and it changes who does the design work.

Until now, getting an AI agent to drive Stitch meant setting up an MCP server through Google Cloud. Now it's two terminal commands, and a coding agent like Claude Code can generate, compare and reject design variants on its own, then build the site from the winner.

The interesting part isn't the tool. It's the workflow around it: one written brief that every prompt comes from, several generated variants, and a separate review step that checks the result on phone, tablet and desktop. In the demo, that review caught a site that looked right on desktop and broke on mobile.

What the demo doesn't show:
→ how long it takes (8 design rounds for one page)
→ how many of Stitch's free daily credits that burns
→ that the CLI is v0.11, two weeks old, in a Google Labs beta

For teams, the lesson is bigger than design: generation is cheap now. The brief and the independent reviewer are where the quality — and the human judgement — live.

Who on your team owns the "reviewer" role when an agent produces the first draft?

Source: AI LABS (link in the first comment)

## Ссылка для первого комментария LinkedIn

Video walkthrough: https://www.youtube.com/watch?v=au2TI8sdq8E · Package: https://www.npmjs.com/package/@google/stitch

## Перед публикацией

- [ ] заполнить или удалить плейсхолдер `[если пробовали сами …]` в Telegram
- [ ] крючок «проверю и вернусь с цифрами» (Telegram, X 7/) — оставить, только если правда будете проверять; иначе удалить последнюю фразу
- [ ] X: ссылка стоит в последнем посте, не переносить её в первый
- [ ] LinkedIn: ссылку — в первый комментарий, не в текст поста
