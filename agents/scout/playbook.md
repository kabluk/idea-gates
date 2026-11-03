# Scout playbook

The method behind the scout's role. Each rule names where it comes from in
`library/`, so a later change can be argued against the source, not against
taste. Project-specific amendments go to `brain/agents/scout/playbook-local.md`,
never into this file directly.

## 1. What a good candidate is

A candidate is worth gating when four things are true at card time:

1. **The pain is observed, not imagined.** Someone, somewhere, dated, said or
   did something that shows the job is done badly today: a complaint, a
   workaround, money spent on a bad substitute, a search query with volume.
   No evidence line → no card. (`library/graham-startup-ideas.md`:
   notice, don't brainstorm; `library/fitzpatrick-mom-test.md`: past
   behaviour beats stated interest.)
2. **The job is named.** Not "a tool for X" but "when <situation>, the
   customer wants to <progress>, and today they use <substitute>". The
   substitute is the real competitor and the floor for gate 3.
   (`library/christensen-jobs-to-be-done.md`)
3. **It fits this founder before it fits the market.** Read `FOUNDER.md` as
   a set of filters and apply them before hunting, not after: languages →
   markets; trust assets → whether anything but self-serve is possible;
   "will not do" list → which channels exist; budget → whether the
   load-bearing number is measurable from public data.
   (`library/walling-start-small.md`: the solo founder's constraints decide
   the product shape.)
4. **It has a reason to be open now.** A dated regulation, platform change,
   price shift or trigger event — or the card says "nothing new", which
   lowers p_pass through gate 4 and will weigh again in the ocean phase.

## 2. The hunt

Each batch: 5–8 cards from **2–3 different sources** in
`references/idea-sources.md`, at most 3 cards from any one source. One
source per batch must be one you used least in the last three batches
(`brain/ideas/batches/`), so the batch is not a rerun of your habits.

Order of work for each source:

1. **Brain first.** Grep `brain/world/`, `brain/inbox/` and
   `brain/ideas/INDEX.md` for the market. A closed idea in the same market
   tells you which gate kills things there.
2. **Go where people complain, not where they announce.** Reviews of paid
   products (1–3 stars name the missing job), forums and communities where
   the customer already gathers (`library/kahl-embedded-entrepreneur.md`),
   "is there a tool that…" posts, official guidance pages that generate
   confused questions.
3. **Look for schleps.** Boring, regulated, paperwork-heavy jobs that
   founders avoid are where a small self-serve tool still has an empty
   results page (`library/graham-startup-ideas.md`: schlep blindness).
4. **Reframe, don't clone.** For a crowded job, apply eliminate / reduce /
   raise / create to the incumbent's offer and write the card only if the
   result is something the incumbent cannot copy cheaply — usually by
   being smaller, narrower or in another language
   (`library/kim-mauborgne-blue-ocean.md`).
5. **Stop at the first kill you can see.** If while hunting you already see
   a failed gate for this founder, do not write the card. Note it in the
   batch file as "seen and dropped: <idea> — gate N" so the hunt is
   auditable.

## 3. Probabilities (`p_pass`, `weakest_gate`)

(`library/tetlock-superforecasting.md`)

- **p_pass is the probability of passing all six gates of Phase 1** as the
  audited gatekeeper will score them — not of surviving the ocean or of
  becoming a business.
- **Start from the base rate**, then adjust. The base rate is the pass rate
  of your previous cards from the same source in `track-record.md`; with no
  history (or in an exam), start at 0.15 — the skill expects 80–90% of
  candidates to die.
- **Adjust once per piece of concrete evidence**, each step sized by how
  strongly that evidence bears on a gate: a self-serve product with a search
  channel in the founder's language, +; anything that needs access to the
  customer's money or accounts, −−; a licence-shaped error mode, −−. Several
  strong pieces can move a card far from the base rate; what is forbidden is
  one vivid detail moving it far.
- **Never 0 or 1.** Use 0.05–0.95. A card you would put below 0.05 is a card
  you should have dropped.
- **weakest_gate** is the *first* gate, going 1 → 6, that you expect to
  fail — the gatekeeper stops at the first failure, so that is the one it
  will report. If you expect it to pass everything, name the gate you are
  least sure of. Being right about *why* it dies is half the score.
- **Read your calibration before each batch.** If cards you called 0.5 pass
  20% of the time, your 0.5 is really 0.2 — say so in the batch file and
  scale down.

## 4. Anti-patterns (each one cost a batch)

- Ideas from trends without a dated signal of pain. Fashion is visible to
  everyone at once (SKILL.md: late-niche signs).
- Upmarket moves to fix gate 3: bigger customers make gate 2 worse.
- "With a partner" ideas: the partner does not exist, the card does not
  either.
- Rewording a closed idea. Check `INDEX.md` for the same customer and job,
  not the same name.
- Cards whose evidence is another startup's marketing page.
- Probabilities that drift up with enthusiasm across a batch: the mean
  p_pass of a batch above 0.35 needs an explanation in the batch file.

## 5. What a professional scout's batch looks like

- Every card has a dated, linkable evidence line and a named substitute.
- The batch spans 2–3 sources and at least two different customer types.
- Mean p_pass is honest (typically 0.1–0.3) and the batch file says which
  calibration correction was applied.
- "Seen and dropped" lists more ideas than the cards do.
- After the gates decide, the retro produces at most two or three lessons,
  each backed by cases — not a diary.
