# Autonomous mode — a team of agents runs the pipeline

The single-agent skill asks one model to generate ideas, judge them, measure
the market and give a verdict. That model grades its own homework: the same
context that wrote "gate 1 passes" is asked whether gate 1 passes. Autonomous
mode splits the work between agents that do not share a context, and lets no
step finish until someone who did not do it has checked it.

Three rules carry the whole design:

1. **Files are the shared state.** Agents talk only through
   `brain/ideas/<slug>/`. Any step can be re-run, audited or resumed by a
   fresh agent, and the founder can read exactly what each one saw.
2. **Every step is audited by an agent that did not do it.** Work → audit →
   fix, at most two fix rounds, then escalate to the founder. Numbers are
   checked by a script (`scripts/verify-sources.mjs`), judgement by the
   auditor.
3. **Gates before money.** No paid call (DataForSEO, external LLMs) for an
   idea until its gates have passed *and* the audit of the gates is accepted.

## The team

Each role is a folder in `agents/<role>/`: `ROLE.md` is a complete system
prompt with Claude Code subagent frontmatter, and a role may carry its
method (`playbook.md`) and its exam (`evals/`). `ROLE.md` works three ways:
copied to `.claude/agents/` as a named subagent, passed as the prompt of a
general-purpose subagent, or used as a bot's instructions on another agent
runtime (see Rakazo below). What a role learns in a project lives in that
project's brain, not here — see `references/memory.md`.

Paths in the role files: `SKILL.md`, `agents/`, `library/`, `references/`
and `scripts/` are relative to the skill directory, `brain/` and `docs/` to
the project root. The orchestrator tells each agent the skill directory.
If the project root has `.idea-gates.json` (`references/memory.md`, "A
project that already has a memory"), the orchestrator reads it first: it
tells every agent that the file exists, takes the skill directory from
`skill`, and when the skill is not installed there clones `skill_repo` to
`/tmp/idea-gates` and uses that.

| Role | File | Writes | Paid calls |
|---|---|---|---|
| Scout | `agents/scout/` (+ playbook, exam) | `card.md` with p_pass, batch file, retro proposals | no |
| Gatekeeper | `agents/gatekeeper/` | `gates.md` | no |
| Auditor | `agents/auditor/` | `audit-*.md` | no |
| Ocean analyst | `agents/ocean-analyst/` | `ocean.md` + raw JSON, world facts | DataForSEO |
| Red-teamer | `agents/red-teamer/` | `redteam-prompt.md`, `redteam.md` | founder runs external LLMs |
| Judge | `agents/judge/` | `verdict.md`, `INDEX.md` line, scout exam case | no |
| Librarian | `agents/librarian/` | the brain's long-term memory, `log.md` | no |

The orchestrator is the agent the founder talks to. It runs no phase itself:
it starts agents, reads their front-matter, decides the next step and keeps
`STATE.md` current.

## Files per idea

```
brain/ideas/
  INDEX.md                 one line per idea ever judged (judge writes it)
  <slug>/
    STATE.md               orchestrator's log: phase, round, last result, spend
    card.md                scout
    gates.md               gatekeeper   (front-matter: result, failed_gate, round)
    audit-gates.md         auditor      (front-matter: verdict accept|fix|escalate)
    scan-*.json, serp-*.json  raw measurements
    ocean.md               ocean analyst (every number cites its JSON)
    audit-ocean.md
    redteam-prompt.md, answers/<model>.md, redteam.md
    audit-redteam.md
    verdict.md             judge
    audit-verdict.md
```

`STATE.md` is a short append-only log, newest last:

```
2026-11-03 14:02  gates     round 1  gatekeeper  result=pass
2026-11-03 14:05  gates     round 1  auditor     verdict=fix (gate 5: channel needs cold outreach)
2026-11-03 14:09  gates     round 2  gatekeeper  result=fail gate=5
2026-11-03 14:10  closed    judge    verdict=closed
```

## The loop

For each phase P of one idea (gates → ocean → red-team → verdict):

```
round = 1
run the phase agent                        → P.md
run the auditor on P.md                    → audit-P.md
while audit verdict == fix and round < 3:
    round += 1
    run the phase agent with audit-P.md    → P.md (answers every finding)
    run the auditor again                  → audit-P.md
if verdict == escalate or still fix:
    stop this idea, ask the founder the auditor's exact question
if verdict == accept: next phase
```

Transitions:

- **gates** `result: fail` and audit accepted → straight to the judge with
  `verdict: closed`. No ocean "just in case".
- **ocean** `signal: none` → judge (`closed` or `defer` with the dated
  reopening event). `signal: unmeasured` (no credentials) → ask the founder
  whether to spend before going further.
- **red-team** `waiting-for-answers` → hand the founder
  `redteam-prompt.md` and stop; resume when `answers/` has 3-4 files.
  `back_to_gates: true` → re-run the gates with the red-team file as the
  audit, round counter reset.
- **verdict** accepted → done; report to the founder.
- **batch decided** (every idea of a batch has a verdict or is waiting on
  the founder) → the learning loop from `references/memory.md`:
  `track-record.mjs`, scout `retro`, librarian `review`.

Ideas are independent: run the gatekeeper for a whole batch in parallel, one
agent per idea, then the auditors in parallel. Only the ocean phase is
serialised behind the budget.

## Guards

- **Budget.** Before the ocean phase the orchestrator splits the validation
  budget from `FOUNDER.md` between survivors and passes each analyst its
  share. The analyst reads the DataForSEO balance before and after and writes
  `spend:`. Overrun → stop and ask.
- **Control idea.** In "find a niche" mode the first batch includes one idea
  the founder already closed (`control: true`). If it survives the audited
  gates, stop the whole run: the gates or the profile are wrong.
- **Founder checkpoints.** The founder is asked only for: an `escalate` from
  the auditor, spend beyond the budget, running the external LLMs, and the
  final verdicts. Everything else runs unattended.
- **No self-review.** The auditor is always a separate agent run with a fresh
  context. If the runtime cannot start one, the step is marked
  `self-reviewed` in `STATE.md` and in the verdict — never silently accepted.

## Running it

### Claude Code, interactive

Install the role files once, from the project root:

```sh
mkdir -p .claude/agents
for d in .claude/skills/idea-gates/agents/*/; do
  cp "$d/ROLE.md" ".claude/agents/idea-gates-$(basename "$d").md"
done
cp -r .claude/skills/idea-gates/templates/brain brain   # first time only
```

Then: *"Run idea-gates in autonomous mode: find a niche, two batches."* or
*"Run idea-gates autonomously on these four ideas: …"*. Without the copied
files the orchestrator reads each role file and passes it as the prompt of a
general-purpose subagent — same result, one step more.

### Claude Code, headless (scheduled or CI)

```sh
claude -p "Run idea-gates in autonomous mode on the seeds in brain/ideas/seeds.md. \
Skill directory: .claude/skills/idea-gates. \
Stop at founder checkpoints and list them at the end." \
  --permission-mode acceptEdits --allowedTools "Bash(node:*)" "WebSearch" "WebFetch"
```

Because all state is in files, the next run (by hand, cron or a CI job)
resumes from `STATE.md` instead of starting over. Commit `brain/`
between runs if the machine is ephemeral.

### Rakazo

[Rakazo](https://github.com/elie222/rakazo) is a self-hosted runtime for
persistent bots with their own computer, memory, routines, group chats and
subagents. It does not replace this skill — it is a place to run the team
around the clock instead of in one Claude Code session.

- **Skills.** Add this repository with *Skills → From GitHub*. Rakazo imports
  skills as instructions only and does not run their scripts, so give the
  ocean-analyst bot a Team Computer and have it `git clone` the repository
  there and run `scripts/*.mjs` from its terminal; DataForSEO credentials go
  into the bot's secrets, not the repository.
- **Bots.** One bot per role, instructions = the body of the role file, and
  a one-line *How other bots see it* description taken from the file's
  `description`. Put them in one group chat with the orchestrator as the
  first bot. Keep Rakazo's own bot memory for conversation context only;
  what a role learns goes to `brain/agents/<role>/` through the librarian,
  so it stays reviewable, versioned and portable (`references/memory.md`).
- **Shared state.** The `brain/` folder (a git clone) on the shared Team Computer
  plays the same role as on disk here. Give the auditor a separate bot, not a
  subagent of the gatekeeper, so its context is really independent.
- **Routines.** A weekly routine on the orchestrator bot ("run one
  find-a-niche batch, stop at founder checkpoints"), and a *when something
  changes* routine watching `brain/ideas/*/answers/` to resume red-team
  runs when the founder drops answers in. The librarian bot gets the weekly
  garden routine and an inbox watch (see `references/memory.md`).

What does not carry over: Rakazo is a full stack (Postgres, Docker
computers, model credentials) and is in beta — worth it if the team should
run unattended for weeks; overkill for judging a handful of ideas, where
Claude Code with the role files is enough.
