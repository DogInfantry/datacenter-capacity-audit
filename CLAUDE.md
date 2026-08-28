@AGENTS.md

# The Gigawatt Gap

## Project

India announced a gigawatt data centre buildout. This measures what the grid, the accounts and the
silences will actually carry. Portfolio piece ten for DogInfantry.

Next.js 16 App Router, TypeScript, Tailwind 4, Zod, static, no database and no API routes. Python
for the offline pipeline. Deploy target Vercel. Node 24, npm 11, Python 3.14.

**Branch is `master`, there is no git remote, nothing has been pushed.**

## The thesis, and why it is not another sector dashboard

Nine earlier portfolio pieces share one recipe: pick a theme, curate a universe, score it, ship a
dashboard. `india-ai-public-equity-landscape` already did that for this subject and is stale.
Nothing carries over from it and it is not to be extended.

What replaces the scorecard is one thesis in three registers, each a different record of the same
gap between claim and delivery.

**Grid, the physical register.** How late Indian inter-state transmission actually runs, from the
Ministry of Power's own answer to Parliament. Cost weighted slip 13.7 months against a median of
7, because large projects slip harder and a gigawatt campus needs a large project. Every project
on that list was still running when tabled, so each delay is anticipated rather than realised: the
observations are right censored and the figure is a floor.

**Disclosure, what management will not put a number on.** Coded from earnings calls. The measure
is two dimensional and that is the whole point: refusing to quantify unit economics is the
industry norm, so a refusal only counts when the answer is published nowhere at all. Digital
Realty declines on cost per megawatt but points at its own development table. Indian operators
decline and have no supplemental to point at.

**Accounts, what the statements eventually show.** Segment economics, capital intensity and
derived unit economics from filings.

## Architecture

Three layers. Diagnostics are pure functions over one normalised model, which is what lets them
compose rather than compete.

- **Layer 0, evidence.** `data/raw/`, one file per source, never hand edited. Real from the EQIX
  and DLR harvest onward and read by the test suite; Sify predates it and is not backfilled.
- **Layer 1, normalised company model.** `data/companies/<name>.json`, validated by `CompanyDoc`
  in `lib/schema.ts`. An SEC filer and a manual Screener export are downstream identical.
- **Layer 2, diagnostics.** `lib/diagnostics/`, pure and unit tested.
- **Layer 3, synthesis.** Pages assemble from the modules; no verdict is hand assigned.

Key decisions and why:

- **Zod validates at import and fails the build with the field path.** Bad data must never render.
- **Provenance is a required field**, not a footnote. PRIMARY, SECONDARY or UNVERIFIED on every
  figure, including our own seed data.
- **Cross company comparison uses margins and ratios only, never absolute money**, unless a rate
  is stated. Three filers, two currencies. Wipro is the reason: FY2023 to FY2026 its rupee revenue
  rose while its dollar revenue fell 10 per cent.
- **No charting library.** Small series rendered as inline SVG in server components. The palette is
  validated with the dataviz skill validator, not chosen by eye.
- **DuckDB-WASM is installed but deliberately unused.** Twenty five rows read fine as JSON. It
  earns its place when the fact base justifies it.

## File map

```
app/page.tsx              landing: three registers, computed stat tiles
app/grid/page.tsx         ISTS base rate, ownership split, campus ledger
app/disclosure/page.tsx   capacity ladder, graded claims, refusal mechanism
app/financials/page.tsx   Sify segment economics, cross company ratios, currency exhibit
app/prospectus/page.tsx   DRHP offer structure, funding gap link, the open 188 MW question
app/method/page.tsx       every formula with its denominator, provenance rules, known limits
app/layout.tsx            fonts, metadata, Nav
app/globals.css           theme tokens in all three scopes, validated palette

components/Nav.tsx               five tabs
components/Cite.tsx              provenance tag with hover source
components/CapacityStep.tsx      Sify commissioned MW step chart
components/CapexVsCfo.tsx        grouped bars, one axis
components/DefinitionLadder.tsx  four capacity definitions, dated per rung

lib/schema.ts                        all Zod schemas and invariants
lib/data.ts                          validated loaders, companies array, helpers
lib/diagnostics/capital.ts           capexVsCfo, fundingGap, toCr
lib/diagnostics/unitEconomics.ts     segmentMargins, revenuePerMW, assertSameSign
lib/diagnostics/narrative.ts         segmentShare
lib/diagnostics/reconcile.ts         reconcileMargin, the external check, PASS FAIL NOT_RECONCILABLE
lib/diagnostics/disclosure.ts        refusalRate, publishedElsewhereSplit, pressurePerCall
lib/diagnostics/diagnostics.test.mjs 23 tests, run with node --test

data/base_rate.json                generated by the pipeline, do not hand edit
data/campuses.json                 3 seeded campuses, mostly UNVERIFIED
data/sify_capacity.json            capacity ladder, 3 claims, 5 refusals
data/companies/sify.json           full: financials and segments
data/companies/wipro.json          financials only
data/companies/infosys.json        financials only
data/companies/equinix.json        financials, pure play segments, 5 stated margins
data/companies/digitalrealty.json  financials, pure play segments, 2 stated margins
data/disclosure_register.json      refusal rates, three companies, complete topic partitions
data/raw/ists_delays.json          raw API response

Layer 0, populated from the EQIX and DLR harvest onward:
data/raw/filings/EQIX/facts.json               harvested concepts, unedited, with what is absent
data/raw/filings/DLR/facts.json                same, plus the concept name traps
data/raw/transcripts/EQIX/stated_margins.json  verbatim adjusted EBITDA margin claims
data/raw/transcripts/DLR/stated_margins.json   the two that exist, and a note on what does not
data/raw/transcripts/EQIX/pressure_points.json two families, every row, newest first
data/raw/transcripts/DLR/pressure_points.json  same
data/raw/transcripts/SIFY/pressure_points.json same, transcribed by hand because the responses
                                               returned inline rather than to a file

.claude/launch.json          dev server config, used by the preview tool rather than by bash

pipeline/fetch.py          data.gov.in pull, curl transport, needs DATA_GOV_KEY
pipeline/ists_base_rate.py self check then recompute the base rate
scripts/check-prose.mjs    fails the build on an em or en dash
ROADMAP.md                 what is deliberately unfinished, and why
memory/                    dated session handoffs
```

## Current state

Ten commits, clean tree, nothing pushed. Six routes build and prerender statically. Twenty three
tests pass. Prose, lint and pipeline self checks pass. Dev server runs on port 3000, started through
`.claude/launch.json` rather than through bash.

**Done.**

- **The harvest method has been validated against an outside number, once.** Equinix reconstructs
  to 49.65 per cent for the second quarter of 2025 against the 50 per cent its chief executive
  stated on the call, a gap of 35 basis points, and to 47.69 per cent for FY2025 against 49 per
  cent guided, a gap of 131 basis points. Tolerances of 150 and 250 basis points were written down
  before the check ran. The test suite asserts both and fails the build if either drifts.
- **Digital Realty could not be reconciled, and that is the more useful half.** Its derived margin
  matches the guided band in FY2018 at 57.0 per cent, then walks away to 40.5 per cent by FY2023
  against 49.3 implied, because stock compensation is tagged in shares, impairment stops at 2022
  and transaction costs are never tagged. The method is sound where a filer tags its income
  statement completely and degrades exactly where untagged non-GAAP adjustments grow. DLR's
  post 2022 years are marked UNVERIFIED and excluded from cross company margin comparison.

- Grid register complete: base rate, ownership split, censoring caveat.
- Sify capacity ladder, two graded MISSED claims, and the DRHP prohibition mechanism, which is
  the clean case of a company going quiet with a documented cause.
- Financials for Sify: nine years of segment economics, margin 40 to 46 per cent, capex versus
  cash flow gap of Rs 2,047 cr against a Rs 2,500 cr fresh issue, revenue per MW derived.
- Cross company capital intensity across Sify, Wipro and Infosys, plus the Wipro currency exhibit.
- Five tabs, method page, state files.

- **The disclosure register is a measured rate, not five examples.** Across pricing mechanics and
  cost margin bridge, 2024-01-01 to 2026-07-31, with complete topic partitions: Sify refused 2 of
  15, Equinix 9 of 20, Digital Realty 9 of 34. Sify refuses least and is also asked least, 0.43
  unit economics questions a call against Digital Realty's 0.81, so the denominator stays visible.
  The published elsewhere dimension is coded only from what management says on the call and cannot
  prove a figure is unpublished; that limit is on the page next to the number.

**Half done.**

- Coverage is 5 of 12. NBIS, APLD and CORZ confirmed available and not harvested.
- The disclosure register covers two topic families of the eleven that exist. Capacity milestone
  and capital allocation were pulled during the session and their windowed counts are known, but
  **they were never written to Layer 0** and are therefore gone. Adding them means re-harvesting:
  four calls for EQIX and DLR, plus two for Sify.
- Wipro and Infosys have no segment data, marked `segmentBasis: NOT_HARVESTED`.
- The prospectus is read and partly extracted. The offer, the objects and deployment schedule and
  the capacity definitions are PRIMARY and cited by printed page. The standalone entity accounts
  at printed 349, related parties, concentration and litigation are not yet extracted, and the
  page map for them is in `data/raw/prospectus/drhp_extracts.json`.

**Not started.** Per company routes, compare view, cashQuality, concentration, valuation, the
scoreboard, the published dataset, the map.

## Active task

Nothing in flight, tree clean. Equinix and Digital Realty are harvested, the harvest method is
validated against what those companies said out loud, and the disclosure register is a measured
rate across three companies rather than five examples from one.

## Next steps, in order

1. **Tighten the Equinix reconstruction on charge years.** `Asset impairment charges` exists as a
   quarterly series 2016 to 2026 and was not harvested. Without it, FY2024 rebuilds to 43.4 per
   cent when the company reports close to 48, because the fourth quarter carried a charge that the
   stock compensation add back alone does not cover. Adding that one concept should pull the
   annual series into line and would let FY2016 and FY2017, whose stated margins are already in
   the doc, be checked too. Those two years also need annual operating income, which is not in the
   store before 2020.
2. **Harvest NBIS, APLD, CORZ**, financials only. APLD and CORZ carry two calls and one call, so
   they contribute to capital intensity and nothing to disclosure. Run each one through
   `reconcileMargin` before trusting its margins, now that there is a check to run.
3. **`/company/[ticker]` and `/compare`**, once there are enough companies to justify them.
4. **The prospectus teardown.** SEBI hosts it at
   `sebi.gov.in/filings/public-issues/oct-2025/sify-infinit-spaces-limited-drhp_97481.html`, dated
   16 October 2025. Resolve the 188 MW definitional question, extract project capex,
   concentration, related parties.
5. **`concentration.ts` and `cashQuality.ts`**, which need PAT and total assets, both available.
6. **The Indian four** by Screener export.

## Gotchas, each of which cost real time once

- **Segment opex sign flips between filings.** Sify FY2023 is filed negative, every other year
  positive. Magnitudes agree, only the convention differs. Use `assertSameSign` and fail loudly.
- **Concept names drift between filers.** Infosys tags recent capex as "Expenditure on property,
  plant and equipment and intangibles"; Sify and Wipro use "Purchase of property plant and
  equipment classified as investing activities". The Infosys one includes intangibles and is not
  strictly comparable. Run a `search_target=metrics` query before assuming a concept name.
- **Fiscal labels are unreliable.** The transcript source tags January 2024 as FY2023Q3 and
  January 2025 as FY2025Q3. Order by calendar date, always.
- **Python `write_text` defaults to cp1252 here** and corrupts UTF-8. Always pass
  `encoding="utf-8"`. It silently broke two files once.
- **Large heredocs are fragile in this shell.** Writing long TSX or Markdown through a bash
  heredoc fails unpredictably on quoting. Use the Write tool for anything sizeable.
- **`next start` survives `pkill`.** Kill by port with PowerShell `Get-NetTCPConnection`, or you
  will serve a stale build and debug a phantom.
- **The Run button executes PowerShell 5.1, which has no `&&`.** Give the user one command per
  fenced block, never chained, or the play button fails with a parser error.
- **The preview pane will not composite screenshots in this environment.** Verify chart layout by
  measuring text bounding boxes for overlap and out of bounds instead. That method caught three
  real defects.
- **Turbopack dev reports a hydration mismatch from `next/font`** that does not exist in the
  production build. Check production before chasing one.
- **`overflow-x-auto` does not save you inside a flex column.** `body` is `flex flex-col`, so the
  page root needed `min-w-0` or it refused to shrink below the table's `min-w-[42rem]`.
- **The transcripts schema rejects `run_sql`** for non-admin users. Aggregate locally and get
  completeness by partitioning on `claim_family`. A keyword search gives a biased denominator.
- **The transcripts tool caps every response at 50 rows and has no pagination.** `limit` is
  validated at 50 or less and there is no `offset` parameter. Six of eight family partitions came
  back at exactly 50 and were silently censored. The only reliable completeness test is
  `rows returned < limit`.
- **`truncated: false` is a lie when the response is capped.** It reported false on a 50 row
  response drawn from a set of 239. Never trust that flag; compare the row count against the limit.
- **Rows arrive newest first, which is what rescued the disclosure rate.** Because every capped
  response reached back past the start of the analysis window, the window itself was complete even
  where the full history was not. Check `min(calendar_date) < window start` before assuming a
  capped response is unusable, and before spending calls on per quarter paging.
- **`quarter_filter` takes one exact quarter, never a year.** `FY2025` returns zero rows while
  `FY2025Q2` works. Paging a capped family across a full history therefore costs 42 calls.
- **`claim_family` with no `query` returns the complete family**, with `relevance_score: 0` and
  `description: "(all)"`. Adding a query silently turns a partition into a ranked search and
  destroys the denominator.
- **`response_quality` arrives lower case** (`confirmed`, `partial`, `deflected`, `declined`)
  while the schema enum is upper case. Map on ingest.
- **The pressure points field names differ from the ones we store.** The source calls them
  `topic_pressed`, `pressing_firms` and `specific_ask`; the register uses `topic`, `askedBy` and
  `refusedNumber`.
- **Re-validate the palette** whenever a hue changes, in both themes, against this site's own
  surfaces. The first palette shipped with two hues 10.1 apart on the normal vision scale against
  a floor of 15, and full colour readers could not separate them.
- **`data/raw/filings/SIFY` and `data/raw/transcripts/SIFY` are still empty.** Layer 0 is now real
  for EQIX and DLR, populated during their harvest, and the diagnostics test reads the EQIX file
  rather than retyping its numbers, so the layer has a consumer and cannot rot silently. Sify
  predates the practice and is the one remaining backfill. Say that, rather than claiming the
  layer exists everywhere.
- **Adjusted EBITDA is in no metric class, for either EQIX or DLR.** It is not GAAP, so it is not
  tagged. `search_company_filings` returns zero rows for it. The figure lives in
  `search_earnings_transcripts` instead, as a dated verbatim quote with a named speaker. When a
  measure is non-GAAP, reach for the transcripts tool, not the filings tool.
- **`concept="revenues"` on DLR silently returns the wrong line.** It resolves to
  `Equity method investment summarized financial information revenue`, roughly twenty times too
  small. The total revenue concept is `Revenue`. A wrong concept does not error, it just answers a
  different question, which is the expensive kind of mistake.
- **DLR tags share based compensation in shares, not dollars.** The only matching concept is
  `Share based compensation arrangement by share based payment award shares issued in period`.
  There is no dollar expense series, so DLR's adjusted EBITDA cannot be rebuilt. Its impairment
  concept also stops at 2022, which is exactly where the derived margin starts drifting.
- **EQIX has no annual operating income before 2020**, and its segment class is quarterly from
  2023 with a separate annual run of 2017 to 2021 and a gap at 2022. Annual income statement
  detail that looks missing is often present under a different concept: `Depreciation depletion
  and amortization` does have an annual series back to 2016 even though a keyword query for it
  with `report_type=annual` returned nothing useful. Query by concept before concluding absence.
- **A missing add back is not a zero add back.** `reconcileMargin` returns NOT_RECONCILABLE when
  the add backs are undefined rather than quietly treating them as nought, on the same principle
  as `assertSameSign`. A filer that does not tag its stock compensation has not told us it pays
  none.

## Data sources

**Works.** data.gov.in API v2.2.0 for transmission and groundwater, key from `DATA_GOV_KEY` in the
environment. FactIQ MCP for SEC filers and coded earnings calls, which covers Sify, Infosys,
Wipro, Equinix and Digital Realty.

**Which FactIQ tool, and when.** `search_company_filings` holds what is XBRL tagged, so it holds
GAAP. Anything non-GAAP, adjusted EBITDA above all, is not there for any filer and must come from
`search_earnings_transcripts`, where it arrives as a dated verbatim quote with a named speaker.
That split is not a limitation to work around, it is the disclosure thesis showing up in the
plumbing: a figure a company publishes only in an untagged supplemental is public and still out of
reach.

**Does not work, do not plan around it.** Electricity tariffs are not in data.gov.in, a `tariff`
search returns customs and excise only; they come from state ERC orders as PDFs. Substation level
data returns zero results and must come from CEA and Grid-India. Indian-listed-only names have no
structured source and need Screener exports by hand.

## House rules

- **No em dashes or en dashes in prose.** Date ranges read "to". Enforced by `npm run check:prose`
  and verified to fail on a planted dash.
- No needless hyphens between words.
- **Commit as DogInfantry.** Prose subject line, body explaining why, co-author trailer retained.
- Every figure carries a source and a verification tag.
- A rate without a visible denominator is decoration.
- Announcements are labelled as announcements.

## Commands

Run these one at a time. The Run button is PowerShell 5.1 and has no `&&`.

```
npm run dev
```

```
npm run build
```

```
npm test
```

```
npm run check
```

```
python pipeline/ists_base_rate.py
```
