@AGENTS.md

# The Gigawatt Gap

India announced a gigawatt data centre buildout. This measures what the grid, the accounts and the
silences will actually carry.

Portfolio piece ten for DogInfantry. Live at `india-gigawatt-gap`, deployed to Vercel, static.

## The thesis, and why it is not another sector dashboard

Nine earlier portfolio pieces share one recipe: pick a theme, curate a universe, score it, ship a
dashboard. `india-ai-public-equity-landscape` already did exactly that for this subject and is
stale. Nothing carries over from it and it is not to be extended.

What replaces the scorecard is one thesis measured in three registers, each a different record of
the same gap between claim and delivery.

**Grid, the physical register.** How late Indian inter-state transmission actually runs, taken
from the Ministry of Power's own answer to Parliament. The cost weighted slip is 13.7 months
against a median of 7, because large projects slip harder and a gigawatt campus needs a large
project. Every project on that list was still running when tabled, so each delay is anticipated
rather than realised: the observations are right censored and the figure is a floor. Route
`/grid`, data `data/base_rate.json`, pipeline `pipeline/ists_base_rate.py`.

**Disclosure, what management will not put a number on.** Coded from earnings calls. The measure
is two dimensional and that distinction is the whole point: refusing to quantify unit economics is
the industry norm, so a refusal only counts as a finding when the answer is published nowhere at
all. Digital Realty declines on cost per megawatt but points at its own development table. Indian
operators decline and have no supplemental to point at. Route `/disclosure`, data
`data/sify_capacity.json`.

**Accounts, what the statements eventually show.** Segment economics from filings. Route
`/financials`, data `data/companies/*.json`.

## Architecture

Three layers. Diagnostics are pure functions over one normalised model, which is what lets them
compose rather than compete.

- **Layer 0, evidence.** `data/raw/`, one file per source, never hand edited.
- **Layer 1, the normalised company model.** `data/companies/<ticker>.json`, validated by
  `CompanyDoc` in `lib/schema.ts`. An SEC filer and a manual export are downstream identical.
- **Layer 2, diagnostics.** `lib/diagnostics/`. Each is pure, unit tested, and emits a value plus
  the evidence that produced it.
- **Layer 3, synthesis.** Per company verdicts and cross company comparison, assembled from the
  modules, never hand assigned.

Next.js 16 App Router, static, no database, no API routes. Zod validates every data file at import
and fails the build with the offending field path. MapLibre for the map. DuckDB-WASM is installed
but deliberately unused until the fact base justifies it.

## Data sources

**Works.** data.gov.in API v2.2.0 for transmission and groundwater, key from `DATA_GOV_KEY` in the
environment. FactIQ MCP for SEC filers and coded earnings calls, which covers Sify, Infosys and
Wipro because all three list in the United States.

**Does not work, do not plan around it.** Electricity tariffs are not in data.gov.in, a `tariff`
search returns customs and excise only; they must come from state ERC orders as PDFs. Substation
level data returns zero results and must come from CEA and Grid-India. Indian-listed-only names
(Netweb, Anant Raj, E2E, Techno Electric) have no structured source and need Screener exports by
hand.

## House rules

- **No em dashes or en dashes anywhere in prose.** Date ranges read "to". Enforced by
  `npm run check:prose`, which is verified to fail on a planted dash.
- No needless hyphens between words.
- **Commit as DogInfantry.** Prose subject line, body explaining why, co-author trailer retained.
- **Every figure carries a source and a verification tag**, one of PRIMARY, SECONDARY or
  UNVERIFIED. The schema refuses a figure without one. This applies to our own seed data: a
  project about overconfident reporting does not get to be overconfident about itself.
- Announcements are labelled as announcements. Keeping that line bright is the product.
- A rate without a visible denominator is decoration.

## Traps, each of which cost real time once

- **Segment opex sign flips between filings.** Sify FY2023 is filed negative while every other
  year is positive. Magnitudes agree, only the convention differs. Normalise with
  `assertSameSign` and fail loudly rather than silently inverting a margin.
- **Fiscal labels are unreliable.** The transcript source tags January 2024 as FY2023Q3 and
  January 2025 as FY2025Q3. **Order by calendar date, always.**
- **`write_text` defaults to cp1252 on this machine** and corrupts UTF-8. Always pass
  `encoding="utf-8"`. This silently broke two files once.
- **Python heredocs break on a raw apostrophe inside a `'''` literal.** Use `"""` delimiters.
- **`next start` survives `pkill`.** Kill by port with PowerShell `Get-NetTCPConnection` or you
  will serve a stale build and debug a phantom.
- **The palette must be re-validated** with the dataviz skill validator whenever a hue changes, in
  both themes, against this site's own surfaces. The first palette shipped with two hues 10.1
  apart on the normal vision scale against a floor of 15, and nobody could tell them apart.
- **The transcripts schema rejects `run_sql`** for non-admin users. Aggregate locally, and get
  completeness by partitioning on `quarter_filter`.
- Hydration warnings under Turbopack dev come from `next/font` hash mismatch and do not appear in
  the production build. Check production before chasing one.

## Coverage state

See `ROADMAP.md` for what is unfinished and why. As of 2026-08-27: one company complete (SIFY),
seven confirmed available and not yet harvested, four Indian-listed names requiring manual export.

## Commands

```
npm run dev          local
npm run build        production build
npm test             diagnostics arithmetic
npm run check:prose  dash rule
npm run check        prose, tests, lint
python pipeline/fetch.py            pull raw tables, needs DATA_GOV_KEY
python pipeline/ists_base_rate.py   self check, then recompute the base rate
```
