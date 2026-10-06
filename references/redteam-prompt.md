# Red-team prompt template for external LLMs

Distilled from a validation prompt refined over six runs across Perplexity,
DeepSeek, GPT, Gemini and Grok. The one addition over that prompt is the
feasibility section (B2 below) — its absence cost the case-study project three
weeks. Fill in the [BRACKETED] blocks and leave the rest alone: the word
limits, labels and JSON are tuned so that answers stay comparable across
models.

Run rules:
- paste it as is, without "I like this idea" — any extra line shifts the score;
- one run per model, default temperature;
- sign the model got the right version: the answer has an improvements section
  and a `top_improvements` array in the JSON (otherwise it got an old prompt);
- store answers verbatim + annotation: wrong / cannot confirm / new.

---

## Prompt structure

**1. Role and rules** — a skeptical practitioner from the project's niche. Five
rules: base rate for the class of companies first, then the idea; tag every
market claim [KNOW] / [BELIEVE] / [DON'T KNOW], invention is forbidden; no
politeness; numbers instead of adjectives; attack the assumptions — the inputs
are tagged [FACT] / [THESIS] / [ASSUMPTION] / [UNVERIFIED].

**2. Project description** — the essence in one paragraph; founder and
resources (honestly: where they live, whether solo, what they will not do —
from `FOUNDER.md`); market and "why now"; customer; product; business model;
evidence of demand with numbers; weak spots we already see. Every item carries
a confidence tag.

**3. Task** (limit ~1,800 words for A–G; H is JSON only):

- **A. Base rate** (120 words): probability of success for the class
  "[PROJECT CLASS]", three factors that shift it, whether the arithmetic adds up.
- **B. Knowledge self-check** (150 words): what the model actually knows about
  [DOMAIN / PLATFORM] — each item [KNOW] / [BELIEVE] / [DON'T KNOW]. This is a
  hallucination probe: check its [KNOW] items against primary sources before
  trusting its conclusions.
- **B2. Feasibility gate** (150 words): name the first physical action of the
  project that requires a stranger's consent (who they are, what they do, what
  they risk), and estimate the probability in % that THIS founder — with their
  location, languages, reputation and "will not do" list — gets that consent
  within 30 days. If < 30%, explain what actually produces that consent in
  comparable businesses that made it.
- **C. Three views** (450 words): the typical customer — will they pay, and when
  will they cancel; the PM of the strongest competitor — what they would copy
  and how fast, and what is hard to copy; an investor — named analogues that
  went down this path ([ANALOGUES]) and what from their fate applies.
- **D. The three most load-bearing assumptions** (350 words): why each may be
  false, P(false), the cheapest test in ≤ 30 days and ≤ [BUDGET] — **one this
  founder can run alone** (a test that needs a stranger's trust does not count
  as cheap).
- **E. Pre-mortem** (200 words): two years later the project is closed; the
  specific chain of events.
- **F. Kill criteria and verdict** (230 words): 3–5 measurable signals; the one
  change with the largest effect; GO / GO WITH CONDITIONS / NO-GO with a
  probability.
- **G. Constructive** (400 words): 3–5 improvements tied to specific modules of
  the project, at least one each for moat / acquisition / retention, each with
  a mechanism, effort S/M/L and the assumption it rests on. Generic advice
  ("improve the UX") is forbidden.
- **H. JSON** (1–10 scales, where 10 = best for the project):

```json
{
  "verdict": "GO | GO_WITH_CONDITIONS | NO_GO",
  "success_probability_pct": 0,
  "base_rate_pct": 0,
  "scores_1_to_10": {
    "market_size": 0,
    "timing": 0,
    "wedge_strength": 0,
    "moat": 0,
    "monetization": 0,
    "founder_market_fit": 0,
    "first_step_executability": 0,
    "execution_feasibility": 0
  },
  "load_bearing_assumption": "one sentence",
  "top_killer_risk": "one sentence",
  "cheapest_next_test": "one sentence",
  "first_human_gate": "who has to agree, and to what",
  "knowledge_gaps_flagged": ["..."],
  "top_improvements": [
    {
      "idea": "one sentence",
      "lever": "moat | acquisition | retention | monetization",
      "builds_on": "project module or data",
      "effort": "S | M | L",
      "assumes_verified": "assumption, or 'nothing'"
    }
  ]
}
```

## Reading the results

Put the JSON into a table by model. Look not at averages but at:
- **convergence of `load_bearing_assumption`** — if 3+ models name the same
  thing, that is the number for Phase 1 / gate 4;
- **the minimum of `founder_market_fit` and `first_step_executability`** — any
  score ≤ 3 is a gate; go back to Phase 1;
- **disagreement on `top_killer_risk`** — usually not different risks but
  different ways to fail the same experiment;
- **repetition of `top_improvements` across models** — a structural
  recommendation repeated three times outweighs any verdict.

Model probabilities are ordinal, not cardinal: base rates for identical inputs
can range from 4% to 18% across models.
