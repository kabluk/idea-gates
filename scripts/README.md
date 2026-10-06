# scripts

Measurement helpers for Phase 2 (the ocean) and two of the idea sources. Plain
Node.js (18+), no dependencies; HTTP goes through `curl`, so the scripts respect
`HTTPS_PROXY`. They are optional — the gates in Phase 1 need no tools at all.

## Credentials

The scripts call the [DataForSEO](https://dataforseo.com/) API and read
credentials only from environment variables:

| Variable | Meaning |
|---|---|
| `DATAFORSEO_LOGIN` | your DataForSEO API login |
| `DATAFORSEO_PASSWORD` | your DataForSEO API password |

```sh
export DATAFORSEO_LOGIN=...
export DATAFORSEO_PASSWORD=...
```

Never commit them. `pain-scan.mjs --no-volume` runs without credentials (Hacker
News and Stack Exchange only).

## The scripts

**`gap-scan.mjs`** — seed terms → related keywords → split by intent (tool /
purchase / informational / urgency) → volumes with year-over-year trend →
warning flags → optional SERP audit of the top tool-intent gaps. Trends compare
the last 3 months with the same 3 months a year earlier, which avoids Google's
volume rounding and seasonality; series with a sudden multi-fold step (a Google
re-categorisation, not demand) are flagged and excluded from medians.

```sh
node scripts/gap-scan.mjs --seeds "food safety compliance,haccp plan" --location US --serp 5
```

**`pain-scan.mjs`** — mines pain phrases ("is there a tool", "spreadsheet
for"...) from Hacker News, Stack Exchange and Reddit (via DataForSEO SERP), then
checks whether those phrases have any search volume. The weakest source; read
the posts rather than trusting the counts.

```sh
node scripts/pain-scan.mjs --topic "invoicing" --subreddits smallbusiness,freelance
```

**`seo-data.mjs`** — basic helper: account balance, search volume for a list of
keywords, top-10 organic SERP for a query.

```sh
node scripts/seo-data.mjs balance
node scripts/seo-data.mjs volume --keywords keywords.json --location UK
node scripts/seo-data.mjs serp --query "gpsr responsible person" --location DE
```

All three write JSON reports under `research/` by default (override with
`--out`). Each call costs real money on your DataForSEO account; check
`seo-data.mjs balance` first and keep within the budget in your `FOUNDER.md`.
