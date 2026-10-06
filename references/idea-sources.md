# Idea sources for Phase 0.5 ("find a niche" mode)

A catalogue of places to draw candidates from, BEFORE the gates. For each
source: what it is, how to mine it cheaply, and the trap of that source. The
recipes assume a lean toolkit (paid DataForSEO access, a reader proxy for
scraping, a validation budget around $20) — adjust to the resources in your
`FOUNDER.md`. Gates and the ocean are still mandatory: a source gives
candidates, not verdicts.

## 1. Regulatory windows

New confusing rule → thousands of people obliged to comply → fresh, weak search
results → free checker → paid templates or monitoring.

**Mining:** effective-date calendars — FDA, EU (EUR-Lex), FTC, US states
(privacy laws), customs. Queries like "[law] compliance", "[law] checklist",
"does [law] apply to". Growth over 6 months matters more than the absolute
number.

**Check the deadline FIRST, against the primary source.** The window lives
until the deadline; after it, demand does not "stabilise", it collapses —
whoever had to buy has bought. Marker of a passed window: purchase-intent
queries ("[topic] software", "[topic] tool") drop 30–90% over six months while
the informational head query is still large. The head query is misleading here:
it measures "what is this", not "who can I sell to".
*(Making Tax Digital run, UK, 2026-09: "making tax digital" at 90,500/month
looked like 4x the previous wedge, but the GBP 50k deadline had passed five months
earlier and the whole purchase cluster was down 34–89%. I first read the decline
on the head query as "panic right now" — it reads exactly the opposite way.)*

**Trap:** deadlines move in both directions, forward and back (in the case
study, three LLMs "knew" about a platform reform that did not exist on the
platform's own site). Multi-wave regimes (thresholds lowered year by year) give
a next window, but the next wave is usually poorer than the previous one, and
the results page for it is already held by whoever entered on the first wave.

## 2. Unbundling fat products ("clone one feature")

Successful products accrete features; customers pay $99 for one of them. A
standalone version of that feature for $9 is a classic wedge.

**Mining (all measurable in DataForSEO for cents):**
- volumes for "[product] alternative", "[product] alternative for [use]",
  "[product] too expensive", "free [product] for X";
- 1–2-star reviews on G2 / Capterra / Trustpilot via a reader proxy: complaint
  clusters like "I only use it for Y", "I overpay for Z";
- the SERP for "alternative" queries: if it shows forums and listicles rather
  than a ready standalone tool, there is a gap.

**Trap:** the feature may have stayed bundled because on its own it does not
pay off (check with gate 3), or because the fat product gives it away free in
the trial. Also: the fat product has a "make this feature free" button — you
need a moat from day one.

## 3. Pain mining from reviews and forums

People describe pain where they complain, not where they search for solutions —
so there may be no searches (invisible demand) while the pain is real.

**Mining:** `scripts/pain-scan.mjs --topic "<topic>"`. What is actually
reachable (checked 2026-09): **HN Algolia** — open API, no key, the best of
the three; **Stack Exchange API** — open, ~180 topical sites, not just
programming (money, workplace, freelancing, law, DIY); **Reddit** — 403
directly and through reader proxies, but reachable through the DataForSEO SERP
`advanced` endpoint with a `site:` operator (the regular endpoint silently
ignores the operator). "Spreadsheet for X" is the golden marker: the person has
already built a solution by hand.

**Trap #1 (the main one):** demand invisible in search = selling only by showing
up → runs into gates 1–2 and 5. That is why the script cross-checks the phrases
it finds against search volume: pain with no search footprint is unsellable for
a founder whose channel is SEO, and that is a kill signal, not "we'll educate
the market".

**Trap #2 — source precision.** All three rank by phrase match and mostly ignore
the topic: without a "the topic must appear in the text" filter, queries about
"bookkeeping" and "scheduling" return the same popular threads. The script
filters, but after filtering the corpus is small (10–30 posts), and frequency
extraction does not work at that size — **read the posts, do not count them**.
The phrase ranking in the report is a hint, not a measurement.

**Honest rating:** the weakest of the eight for a search-driven founder. HN
skews to software development, SE money to personal finance, Reddit via SERP
loses half its precision. And everything found still has to pass a volume
check, i.e. it ends up where source 5 starts. Use it as a supplement to
gap-scan (to learn the language of the pain and collect phrasings for seeds),
not as the main candidate generator.

## 4. Product Hunt and product graveyards

PH is a radar of what people try; the graveyard is validated demand with
abandoned execution (the team burned out, the pain stayed).

**Mining:** PH top lists by year via a reader proxy; products that had
traction and have been dead 1–2 years (site down, socials silent); launch
comments — ready-made feature-request lists. Plus "[dead product] alternative"
in volumes.

**Trap:** the PH audience is makers who buy out of curiosity. Upvotes are not
willingness to pay. PH names a candidate; whether anyone pays is checked by
volumes and gate 3.

## 5. Systematic search gaps (fully automatable)

Do not wait for an idea — scan: industry → seed terms → related keywords →
filter by intent patterns "calculator | template | checker | generator | how to
calculate | requirements" → measure volume of what passes → SERP audit: if the
top holds PDFs, forums and articles with nothing interactive, it is a gap.

**Mining:** DataForSEO keyword ideas + volumes + SERP, an evening's script
(`scripts/gap-scan.mjs`). This is a pipeline, not a one-off find — you can run
it on one industry a week.

**Trap:** a gap in the results ≠ money (gate 3 is mandatory: who pays, and for
what, after the free tool).

## 6. Geo and language arbitrage

A model proven in one language or market is empty in another. Limit this to
the languages listed in your `FOUNDER.md`.

**Mining:** take a working self-serve tool in language A → measure demand in
language B (and the reverse); run the category leader by country (one query for
the leader's traffic by country shows where the market exists).

**Trap:** an empty market is sometimes not a gap but an answer (ability to pay,
habit of paying, an entrenched local competitor outside Google). And check
jurisdiction: the market's payments and taxes must be accessible to your legal
entity (e.g. a US LLC).

## 7. Platform shifts

A new platform or ecosystem = a tooling vacuum for 1–2 years: GPT / Claude app
stores, new APIs, Chrome extensions with hundreds of thousands of installs and
a 2–3 star rating (better to clone).

**Mining:** Chrome Web Store (installs and ratings are public), new-platform
directories, changelogs of major APIs.

**Trap:** the lateness markers from Phase 0.5 (CPC $30+, funded brands in the
results — AI niches burn out within a year). And dependence on one platform is
the case study's other risk: the platform changes the rules and the product
goes to zero.

## 8. Trigger events (dying products)

A product shuts down, gets acquired or raises prices → refugees look for a
replacement right now, demand spikes.

**Mining:** sunset news, "[product] shutting down", "[product] price
increase", spikes of "[product] alternative" in monthly volume data.

**Trap:** the window is short (months), and every competitor goes after the
refugees at once; it works only if you can ship within weeks, which at 10–25
hours a week is a gate question to ask yourself.

**Combo 8x6 (a spike in another country):** the most underrated move — look for
trigger events not only in the US: a regulatory deadline in the UK / EU /
India, the sunset of a product popular in one region, a price shock from a
local leader. DataForSEO measures any country for the same cents
(`--location UK/IN/...`), and competition outside the US is often years
thinner. The limits of the combo come from the profile, not from ambition: the
market's language must be one the founder works in (the case study failed
partly on a language the founder did not speak), and payments from that
country must be accepted by the founder's legal entity (Paddle / LemonSqueezy
cover most, but check BEFORE falling in love — it is gate 3/6, not a detail).

## Trap segments (fine to check, expect red)

- **Tools for traders:** the gates are formally passable (journal, position-size
  calculator), but the market is funded and scorched, the audience burns out
  and churns, and anything "signal"-like hits gate 6. Only on data.
- **Dating, casino-adjacent, crypto signals:** gate 6, and/or payment
  processors dislike them — check that you can accept payments before falling
  in love.
- **"Tools for makers / startup founders":** an audience without money that buys
  out of curiosity, with trader-level churn.

## How to use

Per session: pick 2–3 sources → pull 5–8 candidates → add the control corpse to
the batch → gates (Phase 1) → data (Phase 2) → compare survivors across
batches; do not marry the first one.
