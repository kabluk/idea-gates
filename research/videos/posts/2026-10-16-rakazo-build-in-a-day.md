# Посты: продукт за день — /goal, скриншоты, эмуляторы

Статус: черновик
Бриф: ../2026-10-16-rakazo-build-in-a-day.md
Источник: https://www.youtube.com/watch?v=xk-aLMQRYfk
Сигнал 7/10 → Telegram RU + X EN + LinkedIn EN. Хабр/vc.ru — предложить после своего прогона метода.

## Telegram (RU)

**Как заставить агента строить всю ночь и не врать, что «всё готово»**

Разобрал, как Elie Steinbock собрал open-source аналог Grok Bot за день (4,3K звёзд на 16 октября). Секрет не в модели, а в проверке: агенту не верят на слово — у него принимают скриншоты.

Мой вариант его метода:
1. План в PLAN.md с чекбоксами + правило в AGENTS.md: ни одной жёсткой зависимости от внешних сервисов, всё за интерфейсами
2. Эмуляторы вместо настоящих API — например, `npx emulate` от Vercel Labs: агент тестирует интеграции без банов и лимитов. Для своих сервисов Элай писал эмуляторы силами агента
3. `/goal Все пункты PLAN.md отмечены, для каждого экрана есть скриншот на 375 и 1440 px, тесты зелёные` — и на ночь
4. Дальше — скриншоты всех экранов на каждый PR в GitHub Actions

Где, по-моему, споткнётесь: `/goal` с условием «сделай хорошо» не сработает — агент сам решит, что готово. Условие должно проверяться файлами и тестами.

По-моему, это и есть главный навык 2026 года: не писать код, а превращать «готово» в проверяемый факт.

[если сделали сами — что собрали, сколько шло]

Подсмотрел у Elie Steinbock: https://www.youtube.com/watch?v=xk-aLMQRYfk

## X thread (EN)

1/ How Elie Steinbock built an open-source Grok Bot alternative in a day (4.3K stars as of Oct 16): the trick isn't the model, it's verification. You don't trust the agent's "done" — you accept screenshots.

2/ My take on his method. Step 1: a plan. PLAN.md with checkboxes, plus a rule in AGENTS.md: no hard dependency on any third-party service, everything behind an interface. Any model, any sandbox.

3/ Step 2: emulators instead of real APIs. Tools like Vercel Labs' `npx emulate` give stateful local copies, so the agent tests integrations without bans or rate limits. For his own integrations, Elie had the agent write the emulators.

4/ Step 3: the overnight run.
/goal Every PLAN.md item checked, a Playwright screenshot of every screen at 375 and 1440 px, all tests green against the emulators.
No screenshot = not done.

5/ Step 4: screenshots of every screen on every PR in GitHub Actions. That's how one person runs a project with 100 contributors — and a bot merges the simple fixes.

6/ My gotcha: a /goal with a vague condition ("make it good") just ends when the agent decides it's done. The condition has to be checkable by files and tests.

7/ Picked this up from Elie Steinbock: https://www.youtube.com/watch?v=xk-aLMQRYfk

## LinkedIn (EN)

The bottleneck in AI-built software has moved from writing code to proving it works.

I looked at how Elie Steinbock built an open-source alternative to Grok Bot in a day — 4,300 GitHub stars as of October 16 and around 100 contributors. The model choice barely mattered. What mattered was that the agent was never trusted on its word.

How it works:
→ A plan with checkboxes, and a rule that nothing depends hard on a third-party service
→ Local emulators of third-party APIs (he had the agent build his own), so integrations are tested without real accounts
→ An overnight run whose finish line is a screenshot of every screen and green tests — no screenshot, not done
→ Screenshots of every screen on every pull request, so one maintainer can review a hundred contributors

What to watch for: an agent given a vague goal will decide on its own that it's finished. The finish line has to be a fact a machine can check.

For teams adopting agents, the new core skill is writing the verification, not the code.

Where does your team still accept "it's done" without proof?

Picked this up from Elie Steinbock (link in the first comment)

## Ссылка для первого комментария LinkedIn

https://www.youtube.com/watch?v=xk-aLMQRYfk · https://github.com/elie222/rakazo

## Перед публикацией

- [ ] заполнить или удалить `[если сделали сами …]`
- [ ] «Разобрал» / «I looked at» — верно; «сделал/собрал сам» — только если прогоняли метод
- [ ] X: ссылка в последнем посте; LinkedIn: ссылку — в первый комментарий
