# Посты: Claude Code + Google Stitch

Статус: черновик
Бриф: ../2026-10-16-google-stitch-cli-claude-code.md
Источник: https://www.youtube.com/watch?v=au2TI8sdq8E
Сигнал 6/10 → Telegram RU + X EN + LinkedIn EN. Хабр/vc.ru — после того как соберёте свой лендинг и будут цифры.

## Telegram (RU)

**Claude Code теперь сам рисует дизайн в Google Stitch — вот как подключить**

Связка, которая может заменить дизайнера на первом черновике лендинга: у Stitch есть официальный CLI (пакет `@google/stitch` в npm с 1 октября), и Claude Code управляет им сам — генерирует варианты, отбраковывает слабые и собирает из лучшего живой сайт.

Как сделать:
1. `npm i -g @google/stitch && stitch login`
2. `stitch agent-skills add`, затем скопировать `.agents/skills` в `.claude/skills` — иначе Claude скилл не увидит
3. Попросить Claude проинтервьюировать вас и записать всё в `brief.md` — все промпты в Stitch идут из него, и стиль не «гуляет»
4. «Сделай в Stitch 3–4 варианта по brief.md, DESKTOP и MOBILE, исправляй проблемные» → «собери сайт из лучшего»
5. Отдельным шагом — проверка скриншотами на 375/768/1440 px

Где споткнётесь: ошибка `MISSING_CANVAS_CREDENTIALS` — нужен `STITCH_API_KEY` даже после логина. И если не просить MOBILE, сайт развалится на телефоне.

Главное тут даже не Stitch, а схема: один бриф → генератор → независимый проверяющий. Качество делает проверяющий, а не число попыток.

[если сделали сами — результат: время, цифры]

Процесс — из ролика AI LABS: https://www.youtube.com/watch?v=au2TI8sdq8E; детали CLI и ловушки — из документации @google/stitch и моих заметок.

## X thread (EN)

1/ A setup that can turn Claude Code into a first-draft web designer: Google Stitch has an official CLI (on npm since Oct 1), so the agent can generate designs, reject weak ones and build the site from the best. Here's how to wire it up.

2/ Install and log in:
npm i -g @google/stitch
stitch login
Then `stitch agent-skills add` — and copy .agents/skills into .claude/skills, or Claude Code won't see the skill.

3/ Have Claude interview you and write brief.md: the story the page tells, section by section. Every Stitch prompt comes from that one file, so the designs stop drifting in style.

4/ Prompt: "Using brief.md, create 3–4 Stitch variants for DESKTOP and MOBILE; regenerate any with problems." Then: "Download the best one and build the site."

5/ Add a review step: a skill that screenshots the page at 375 / 768 / 1440 px and fixes what broke. Skip it and the desktop-only design falls apart on phones.

6/ Gotcha: some commands fail with MISSING_CANVAS_CREDENTIALS even after login — set STITCH_API_KEY. And keep variants to 3–4 per round; Stitch is free but credit-capped daily.

7/ Workflow from AI LABS: https://www.youtube.com/watch?v=au2TI8sdq8E — CLI details and gotchas from the @google/stitch docs and my notes.

## LinkedIn (EN)

A coding agent can now do a designer's first draft — and check its own work.

Google's Stitch now has an official command-line tool (on npm since October 1). Wired into Claude Code, the agent interviews you, writes a brief, generates several design variants in Stitch, throws out the weak ones and builds a responsive site from the winner.

In the workflow I studied, what made the difference wasn't the generator. It was two pieces around it: one written brief that every prompt comes from, and a separate reviewer step that screenshots the page on phone, tablet and desktop and fixes what broke.

How it works:
→ npm i -g @google/stitch, stitch login, add the Stitch skill to Claude Code
→ agent interviews you → brief.md
→ 3–4 variants in Stitch → build the best → automated review at three screen widths

What to watch for: some commands need an API key even after login, and Stitch's free tier is capped daily.

For teams, generation is no longer the bottleneck. Writing the brief and owning the review are where the judgement — and the value — now sit.

Who owns the reviewer role on your team when an agent does the first draft?

Workflow from AI LABS (link in the first comment); CLI details from the @google/stitch docs

## Ссылка для первого комментария LinkedIn

https://www.youtube.com/watch?v=au2TI8sdq8E · https://www.npmjs.com/package/@google/stitch

## Перед публикацией

- [ ] заполнить или удалить `[если сделали сами …]` в Telegram
- [ ] X: ссылка в последнем посте, не в первом
- [ ] LinkedIn: ссылку — в первый комментарий
