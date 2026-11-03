# Philip Tetlock, Dan Gardner — *Superforecasting: The Art and Science of Prediction* (2015)

What distinguished forecasters who beat the field in long-running forecasting
tournaments.

## Ideas we use

- **Start with the outside view (base rate)**, then adjust with the
  specifics of the case. → p_pass starts from the scout's own historical
  pass rate for the source, or 0.15.
- **Make forecasts precise and scorable.** Vague words ("might work") can't
  be checked; probabilities can. → Every card carries p_pass and
  weakest_gate, scored by `scripts/track-record.mjs`.
- **Brier score** measures accuracy of probability forecasts (0 = perfect,
  0.25 = always saying 50%). → The scout's exam and track record.
- **Update in small, frequent steps** as evidence arrives; avoid both
  under- and over-reaction.
- **Keep score and review it**: forecasters improve when they get feedback
  and study their misses. → The retro mode and lessons.
- **Granularity and calibration**: good forecasters distinguish 60% from
  70%, and their 70% happens about 70% of the time.
- **Beware of a single story**; consider what would make you wrong.
  → The auditor's job, applied before the auditor sees it.

## Limits

Tournament questions were well-defined with clear resolution dates. Gate
outcomes are decided by another agent, so the scout's score is partly a
measure of agreement with the gatekeeper; the auditor's acceptance is what
makes the outcome worth scoring against.

## Cited by

`agents/scout/playbook.md` §3; auditor and judge.
