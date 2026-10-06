---
name: idea-gates
description: Check a business idea before falling in love with it — first six feasibility gates scored against this specific founder, then market analysis, then a red-team pass through external LLMs, then a build / defer / closed verdict. Use whenever someone brings a new project, service or niche idea, asks "is this idea worth building", "should I build X", "validate my idea", "find a niche" or "find a blue ocean", wants to judge whether an idea is viable, or starts a project that has not been through the gates. Also use to re-check a live project when conditions change (new market, new pricing model, new customer segment).
---

# idea-gates — gates before the ocean

## Why this order

A marketplace-seller service in Brazil was shut down after a market check that
looked great. Demand was measured (about 24K searches a month), the search page
was winnable, the timing was right, and the code was written and covered by
tests. The project died on one question: the first physical action — "a seller
who has never heard of you gives an anonymous foreigner access to their business
finances" — was impossible for that founder. Checking that question takes ten
minutes and costs nothing. Nobody checked it, because the analysis started with
the market.

Hence the rule: **market analysis of an infeasible idea is wasted work.** Gates
first (minutes, free), then the ocean (hours, paid APIs), then red-team (days,
external LLMs). Never the other way round.

## Phase 0 — founder profile

If the repository has `docs/FOUNDER.md`, read it. If not, ask the user once and
save the answers there, using `templates/FOUNDER.example.md` as the shape:

- where they live, which languages they work in, what legal entity they have;
- trust assets: audience, public case studies, contacts in the niche, reputation;
- what the founder **will not** do (calls, cold outreach, in-person sales,
  travel, being public) — these are constraints as hard as the budget;
- budget for validating one idea, and hours per week.

Without a profile the gates cannot be scored: feasibility is always relative to
one specific person, not to "some founder".

## Phase 0.5 — candidate generation ("find a niche" mode)

When the user asks you to find an idea instead of bringing one, generate
**batches of 5–8** and run the whole batch through the gates. Expect 80–90%
to die — that is normal and cheap. Do not marry the first survivor; pick the
best of 2–3 survivors from different batches. Put one known corpse in the first
batch (a project the user already closed) as a control: if the gates do not
catch it, the gates are broken.

Generate FROM the profile, not from trends. Every constraint in `FOUNDER.md` is
an input filter: no trust assets → self-serve only; validation budget of $N →
the load-bearing number must be visible in data that costs ≤ $N; languages →
markets in those languages.

Patterns the founder has already won with outweigh fashionable ones. A pattern
that often works for a solo, search-driven founder: "new confusing regulation →
free checker/calculator → weak, fresh search results → paid templates or
monitoring" (for example GPSR or EPR compliance in the EU, FSMA 204 in the US).
Fresh regulation gives what mature niches never do: a results page with no
Ahrefs and no TurboTax on it yet.

Sign that you are late to a fashionable niche: CPC of $30+ while the top results
already hold funded brands and half a dozen free tools (example: AI-visibility
checkers, a year late).

Where to get candidates: a catalogue of eight sources with extraction recipes
and the trap of each — `references/idea-sources.md` (regulatory windows,
unbundling fat products, pain from reviews, the Product Hunt graveyard,
systematic search-gap scans, geo and language arbitrage, platform shifts,
trigger events; plus trap segments). Use 2–3 sources per session, not all.

## Phase 1 — six gates (ten minutes, no tools)

Failing any gate = stop. The idea goes to the archive in one line: which gate
and why. Do not move to Phase 2 "just in case".

**1. First-step gate.** Describe, literally and physically, the first action of
the project that requires a stranger's consent: who that person is, what they
must do, what they risk losing by doing it. Then ask: will they do it for THIS
founder with their current reputation — not for a company that does not exist
yet? *(Case study: "give OAuth access to your seller-account finances to someone
from a Facebook group" — failed, discovered after three weeks instead of ten
minutes.)*

**2. Trust gate.** Does the product need access to the customer's money,
accounts or sensitive data? If yes, the product is the trust and the code is
secondary; an anonymous founder without a trust carrier (partner, platform,
brand) does not pass. Note the scissors: the bigger the customer, the more they
have to lose and the less likely they grant access — "moving upmarket" makes
this gate worse, not better.

**3. Small-customer math gate.** One multiplication before any dreaming: how
much money per month does the typical (not the best) customer bring at honest
rates? *(Case study: 300 orders x R$80 x 0.5% leakage x 20% fee = R$24/month.
One line would have killed the segment on the spot.)* If the number is
laughable, recompute with a customer who does pay off, and take that customer
back through gate 2.

**4. Measurability gate.** Name the ONE unmeasured number the whole idea rests
on. Can the founder measure it alone, without anyone's permission, within the
validation budget from `FOUNDER.md` (default ceiling ~$500)? If measuring it
requires the very trust the founder does not have (gate 2), that is a circular
blocker, the most insidious kind: the idea can be neither confirmed nor cheaply
buried. *(Case study: "how much the marketplace underpays a seller" is
measurable only from inside a stranger's account.)*

**5. Channel gate.** Through which channel will the founder personally reach the
first ten customers — in a language they work in, without anything on their
"will not do" list (from `FOUNDER.md`, e.g. "no cold calls")? "We'll hire a
salesperson" and "we'll find a partner" are not answers: people who do not exist
are not a channel.

**6. Regulatory-risk gate.** Does the product itself fall under someone else's
licence or a ban: legal advice (unauthorised practice of law), tax and
financial advice, medicine, immigration, payment processing, children's
personal data? Tell-tale: if a product error causes the customer legal or
financial harm, that usually requires a licence the founder lacks. "Calculate
or check it yourself against the official rules" tools usually pass; "we'll
tell you what to do in your situation" usually does not. *(Found on the first
run of this skill: "help a diaspora community with immigration forms" passed
gates 1–5 and died here.)*

General rule: if the answer to a gate is "we need a co-founder / partner /
local person", that is not an improvement of the idea, it is an unmet
condition. The idea is closed until the partner exists in reality (a name, an
agreement), not in a plan.

## Phase 2 — the ocean (survivors only)

Check with data, not memory. Tools: DataForSEO and `scripts/gap-scan.mjs` — the
pipeline seed → related keywords → split by intent → volumes → flags → SERP
audit of the top gaps. Setup and credentials: `scripts/README.md`.

**Trend hygiene (paid for by a mistake).** Google Ads reports volume in coarse
buckets (…246k, 301k, 368k, 450k, 1M…), so the difference between two single
months measures rounding, not demand: a control run showed "how to tie a tie"
at +22% and a 301k → 1M → 450k series on flat demand. Compare the mean of the
last 3 months with the same 3 months a year earlier (gap-scan does this) —
anything else measures either noise or season. And if several niches in a row
show decline, run a control on known-stable queries before believing "the
market is dying": a metric artefact looks exactly the same.

- **Demand**: volumes + related keywords; collapse word-order variants;
  direction (growing / falling) matters more than the absolute number.
- **Winnability**: audit the SERP by hand for 2–3 head queries. The Ads
  `competition_index` is NOT organic difficulty; do not substitute one for the
  other.
- **Size via the leader**: the category leader's organic traffic by country is a
  cheap proxy for market size. *(Case study: the leader got 10x more traffic in
  Brazil than in all Spanish-speaking markets combined — "Brazil only" decided
  in one query.)*
- **Invisible demand**: no searches ≠ no pain, but it means selling only by
  showing up, which runs into gates 1–2. Mark it explicitly.
- **Purchase intent separately from learning intent**: measure the
  "[topic] software / tool / template / service" cluster, not just the head
  informational query. A head query can be huge and falling at the same time —
  that is a market that has already bought.
- **A free competitor in the results** = gate 3 in hindsight: work out what
  people pay for ON TOP of the free option before counting volumes.

## Phase 3 — red-team through external LLMs

Prompt template: `references/redteam-prompt.md`. Fill in the project, run it
through 3–4 different models, and store the answers verbatim with annotations:
where the model contradicted verified facts, what cannot be confirmed, what it
added that is new.

Rules for reading the answers (learned the hard way):
- Two LLMs agreeing is not a fact; more often it is one shared source (a vendor
  blog). Check each model's [KNOW] claims against the primary source.
- Founder fit ≤ 3/10 from even one model is a gate, not a footnote. Go back to
  Phase 1 and find the gate you missed.
- "Find a local partner" among the top improvements signals a failed gate 2 or
  5 — see the general rule in Phase 1.

## Phase 4 — verdict to the user

In plain language, no jargon, in one message:

1. Verdict: **build / defer / closed** — and if "build", only "build on
   condition X" where X already exists.
2. The load-bearing number and how to measure it (by whom, for how much, by
   when).
3. The first physical action: who has to agree, and why they will.
4. The typical customer's math in one line.
5. Kill criteria: 3–5 measurable "we shut it down" signals.
6. An honest ceiling: "a $X-a-year business for one person" rather than
   "billions", if that is what the math says.

Do not present "this road is closed" findings as progress. A closed road is a
closed road; say so plainly.
