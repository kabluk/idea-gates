# Посты: REA — Reverse Engineer Anything

Статус: черновик
Бриф: ../2026-10-16-rea-reverse-engineer-anything.md
Источник: https://www.youtube.com/watch?v=CvzHYLEHZ6Y
Сигнал 5/10 → Telegram RU + X EN. LinkedIn — по желанию (угол: SaaS с простой механикой дешевеет).

## Telegram (RU)

**Claude Code теперь сам разбирает, как устроена чужая функция, — и собирает свою**

Разобрался с REA (Reverse Engineer Anything) — MCP-сервером, который за пару недель набрал больше 100 тысяч звёзд на GitHub. Он даёт агенту инструменты реверс-инжиниринга: сайты, Electron-приложения, нативные программы через Ghidra.

Как попробовать:
1. `npx rea-agents setup` → выбрать Claude Code → перезапустить
2. Промпт: «Используя REA, разбери публичную форму <ссылка>: переходы, клавиатура, ветвление, проверка. Ничего не отправляй. В отчёте у каждого вывода пометка: увидел / предположено / неизвестно. Потом собери такую же механику у меня — в моём дизайне и без их кода»
3. Пометки «увидел / предположено» — главное: README прямо пишет, что выводы могут быть неверными

Где споткнётесь: открытый софт (тот же LibreOffice) не нужно декомпилировать — исходники и так на GitHub. Чужие программы разбирать только в виртуалке. И граница: повторить механику — да; копировать код, обходить лицензии и DRM — нет, REA это прямо не поддерживает.

По-моему, главный эффект не в «клонировании», а в том, что простые SaaS вроде форм и квизов перестают оправдывать подписку: их механику агент повторяет за вечер.

[если сделали сами — что разобрали, сколько заняло]

Подсмотрел у HinkoK: https://www.youtube.com/watch?v=CvzHYLEHZ6Y

## X thread (EN)

1/ REA (Reverse Engineer Anything) gives Claude Code real reverse-engineering tools — websites, Electron apps, native binaries via Ghidra. The useful part isn't "clone any app". It's "explain how this feature works, with evidence, then build my own".

2/ Setup:
npx rea-agents setup
Pick your agent, approve the config change, restart. Get it only from morluto/rea, rea.tools or the rea-agents npm package — the README warns about lookalike copies.

3/ The prompt pattern that works: "Using REA, analyse <public page>: step transitions, keyboard, branching, validation. Submit nothing. Tag every finding as observed / inferred / unknown. Then build the same mechanics in my design, without their code."

4/ For Electron apps there's a one-liner:
npx -y rea-agents@latest analyze-javascript-application /path/to/app --json

5/ Gotchas: open-source software doesn't need decompiling — read the source. Run unknown binaries in a VM. And results go to your model provider, so don't feed it anything you can't send out.

6/ Where the line is: REA supports security research, interoperability and analysing software you own. It doesn't support bypassing DRM or licence checks, or copying proprietary code. Rebuilding behaviour ≠ copying code.

7/ My take: the real shift is that simple SaaS — forms, quizzes, widgets — gets harder to justify as a subscription when an agent rebuilds the mechanics in an evening.

8/ Picked this up from HinkoK: https://www.youtube.com/watch?v=CvzHYLEHZ6Y

## Перед публикацией

- [ ] заполнить или удалить `[если сделали сами …]`
- [ ] «разобрался с REA» — оставить, только если правда ставили; иначе «Посмотрел, как работает REA»
- [ ] X: ссылка в последнем посте
