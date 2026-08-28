# Architecture

How this project is built and why it is built that way. For what it found, see the
[README](README.md). For what is deliberately unfinished, see [ROADMAP.md](ROADMAP.md). For the
failures worth knowing about before touching the data, see [docs/GOTCHAS.md](docs/GOTCHAS.md).

## Stack

Next.js 16 App Router, TypeScript, Tailwind 4, Zod. Static output, no database and no API routes.
Python for the offline pipeline. Node 24, npm 11, Python 3.14. Deploy target Vercel.

## The thesis, and why it is not a sector dashboard

The obvious version of this project picks a theme, curates a universe, scores it and ships a
dashboard. That produces a ranking nobody can check.

What replaces the scorecard is one thesis in three registers, each a different record of the same
gap between claim and delivery.

**Grid, the physical register.** How late Indian inter state transmission actually runs, from the
Ministry of Power's own answer to Parliament. Cost weighted slip of 13.7 months against a median
of 7, because large projects slip harder than small ones and a gigawatt scale campus does not
interconnect through a small one. Every project on that list was still running when tabled, so
each delay is anticipated rather than realised: the observations are right censored and the figure
is a floor.

**Disclosure, what management will not put a number on.** Coded from earnings calls. The measure is
two dimensional and that is the point: declining to quantify unit economics is the industry norm,
so a refusal is only interesting when the answer is published nowhere at all. Measured as a rate
with a visible denominator over complete topic partitions, never a keyword search.

**Accounts, what the statements eventually show.** Segment economics, capital intensity and derived
unit economics from filings, with the harvest method validated against companies that publish the
answer.

## Layers

Four layers. Diagnostics are pure functions over one normalised model, which is what lets them
compose rather than compete.

- **Layer 0, evidence.** `data/raw/`, one file per source, never hand edited. Real from the Equinix
  and Digital Realty harvest onward, and read directly by the test suite so it has a consumer and
  cannot rot unnoticed. Sify predates the practice and is the one remaining backfill.
- **Layer 1, normalised model.** `data/companies/<name>.json`, validated by `CompanyDoc` in
  `lib/schema.ts`. An SEC filer and a hand entered export are downstream identical.
- **Layer 2, diagnostics.** `lib/diagnostics/`, pure and unit tested.
- **Layer 3, synthesis.** Pages assemble from the modules. No verdict is hand assigned.

## Key decisions

- **Zod validates at import and fails the build with the field path.** Bad data must never render.
- **Provenance is a required field, not a footnote.** PRIMARY, SECONDARY or UNVERIFIED on every
  figure, including seed data. A prospectus figure additionally carries the printed page it was
  read from; a figure attributed to a 563 page document without saying where in it is not
  checkable.
- **Cross company comparison uses margins and ratios only, never absolute money**, unless a rate is
  stated. Five filers, two currencies. Wipro is the reason: from FY2023 to FY2026 its rupee revenue
  rose while its dollar revenue fell about 10 per cent.
- **Comparisons key on period end, not fiscal label.** Three filers close on 31 March and two on
  31 December, so FY2026 means different years to different companies. The period end is the fact;
  the label is the company's own convention.
- **A rate is never shown without its denominator.** A company rarely asked has fewer chances to
  refuse, so a refusal rate without its counts is decoration.
- **A missing value is not a zero.** `reconcileMargin` returns NOT_RECONCILABLE when the non-GAAP
  add backs cannot be built, rather than treating them as nought, on the same principle as
  `assertSameSign`.
- **Analogies are stored as data, not prose.** The slippage band on the schedule chart measures
  transmission delay, not construction delay, so `scheduleBasis` is a required literal in the
  schema. A caveat sentence can be edited away; a required field fails the build.
- **No charting library.** Small series are inline SVG in server components. The palette is checked
  with a contrast validator in both themes rather than chosen by eye.
- **DuckDB-WASM is installed and deliberately unused.** Twenty five rows read fine as JSON. It
  earns its place when the fact base justifies it.

## File map

```
app/page.tsx              landing: three registers, computed stat tiles
app/grid/page.tsx         transmission base rate, ownership split, campus ledger
app/disclosure/page.tsx   capacity ladder, graded claims, measured refusal rates
app/financials/page.tsx   segment economics, cross company ratios, the external check
app/prospectus/page.tsx   offer, capacity definitions, objects, schedule against slippage
app/method/page.tsx       every formula with its denominator, provenance rules, known limits
app/layout.tsx            fonts, metadata, Nav
app/globals.css           theme tokens in all three scopes, validated palette

components/Nav.tsx               five tabs
components/Cite.tsx              provenance tag with hover source
components/CapacityStep.tsx      commissioned MW step chart
components/CapexVsCfo.tsx        grouped bars, one axis
components/DefinitionLadder.tsx  four capacity definitions, dated per rung
components/ScheduleVsSlip.tsx    stated deployment against the slippage distribution
components/FluffScatter.tsx      every prospectus page by numbers against hedging

lib/schema.ts                        all Zod schemas and invariants
lib/data.ts                          validated loaders, companies array, helpers
lib/diagnostics/capital.ts           capexVsCfo, fundingGap, toCr
lib/diagnostics/unitEconomics.ts     segmentMargins, revenuePerMW, assertSameSign
lib/diagnostics/narrative.ts         segmentShare
lib/diagnostics/reconcile.ts         reconcileMargin, PASS FAIL NOT_RECONCILABLE
lib/diagnostics/disclosure.ts        refusalRate, publishedElsewhereSplit, pressurePerCall
lib/diagnostics/schedule.ts          fiscal year math, slipBand
lib/diagnostics/diagnostics.test.mjs 42 tests, run with node --test

data/base_rate.json                generated by the pipeline, do not hand edit
data/campuses.json                 3 seeded campuses, secondary at best
data/sify_capacity.json            capacity ladder, 3 claims, 5 refusals
data/companies/*.json              5 companies, normalised
data/disclosure_register.json      refusal rates, complete topic partitions
data/prospectus.json               offer, capacity definitions, objects, all page cited
data/drhp_triage.json              every page scored on numbers and hedging, with the lexicon
data/raw/                          Layer 0 evidence, unedited

pipeline/fetch.py          data.gov.in pull, needs DATA_GOV_KEY
pipeline/ists_base_rate.py self check then recompute the base rate
pipeline/drhp_triage.py    score all 563 prospectus pages, checksum verified against the manifest
scripts/check-prose.mjs    fails the build on an em or en dash
```

## Data sources

**Works.** data.gov.in API v2.2.0 for transmission and groundwater, key from `DATA_GOV_KEY` in the
environment. A commercial filings and earnings call service for SEC filers, covering Sify,
Infosys, Wipro, Equinix and Digital Realty. The Sify Infinit Spaces draft prospectus, read
directly from the filed PDF and cited by printed page.

**Which source, and when.** The filings store holds what is XBRL tagged, so it holds GAAP. Anything
non-GAAP, adjusted EBITDA above all, is not there for any filer and must come from the earnings
call transcripts, where it arrives as a dated verbatim quote with a named speaker. That split is
not a limitation to work around. It is the disclosure thesis showing up in the plumbing: a figure a
company publishes only in an untagged supplemental is public and out of reach at the same time.

**Does not work, do not plan around it.** Electricity tariffs are not in data.gov.in; a tariff
search returns customs and excise only, and they come from state regulator orders as PDFs.
Substation level data returns nothing and must come from CEA and Grid-India. Indian listed only
names have no structured source and need hand entered exports.

## House rules

- No em dashes or en dashes in prose. Date ranges read "to". Enforced by `npm run check:prose`,
  which is verified to fail on a planted dash.
- Every figure carries a source and a verification tag.
- A rate without a visible denominator is decoration.
- Announcements are labelled as announcements.

## Commands

```
npm run dev
npm run build
npm test
npm run check
python pipeline/ists_base_rate.py
```
