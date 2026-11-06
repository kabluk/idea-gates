# Scout calibration exam

Cases with a known gate outcome. The scout reads each `card.md` (never
`gates.md`, which is the answer key), predicts `p_pass` and `weakest_gate`,
and `scripts/track-record.mjs` scores it:

```sh
node scripts/track-record.mjs --ideas agents/scout/evals/cases --predictions predictions.json
```

- **Brier score** (controls excluded): 0 is perfect, 0.25 is what "50% for everything" gets.
  A useful scout is clearly below the baseline the script prints (always
  predicting the cases' own pass rate).
- **Gate accuracy**: for cases that failed, how often `weakest_gate` named
  the gate that actually killed it.

All seed cases are scored against `FOUNDER.md` in this folder. Exam cards
carry no `p_pass`, `weakest_gate` or evidence fields — the scout supplies
the predictions — and add `origin`, which normal cards do not have.

- `origin: skill-case-study` cases are SKILL.md's own case studies, so the
  scout knows their outcome before reading them. They are marked
  `control: true`: the script reports them separately (a scout that gives a
  control a high p_pass is broken) and leaves them out of the Brier score.
- `origin: synthetic` cases were written for this exam to cover the
  passing side and other gates. With two scored seed cases the score is a
  smoke test, not a measurement; it becomes one as the project's own
  decided ideas are added.

The exam grows: the judge copies every decided idea of the project into
`brain/agents/scout/evals/cases/`, scored against the project's own
founder profile. A playbook change is accepted only if the exam on both
folders does not get worse (see `references/memory.md`).
