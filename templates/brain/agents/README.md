# agents — each role's memory

Every role has a folder here. The role's method lives in the skill
(`agents/<role>/ROLE.md`, `playbook.md`); this folder holds what it learned
in this project:

```
<role>/
  MEMORY.md            core lessons, read on every run (≤ 900 words)
  playbook-local.md    founder-approved amendments to the playbook (optional)
  lessons/             accepted lessons, one per file
  lessons/proposed/    lessons the role proposed, waiting for the librarian
  lessons/retired/     lessons that stopped holding, with the reason
  track-record.md      generated scores (scout), never edited by hand
  evals/cases/         this project's decided ideas as exam cases (scout)
```

## Lesson format

```
---
role: <role>
proposed: <YYYY-MM-DD>
accepted: <YYYY-MM-DD, set by the librarian>
last_used: <YYYY-MM-DD, set by the librarian from citations>
confidence: low | medium | high
---
# <the rule, in one line, as an instruction>

## Evidence
- [[ideas/<slug>/gates]] — what happened that supports the rule

## Counter-evidence
- cases that would contradict it, or "none found" after a search

## How it changes the work
- the concrete change to the role's next run
```

Rules: a lesson needs at least two supporting cases, or one case that
exposes a broken playbook rule. When a role applies a lesson, it cites it
(`applied: [[agents/scout/lessons/<file>]]`) in its output, which is how the
librarian knows the lesson is alive. The auditor does not read the memory of
the role it is auditing.
