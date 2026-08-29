# Architecture

How this project is built and why it is built that way. For what it found, see the
[README](README.md). For what is deliberately unfinished, see [ROADMAP.md](ROADMAP.md). For the
failures worth knowing about before touching the data, see [docs/GOTCHAS.md](docs/GOTCHAS.md).

## Stack

Next.js 16 App Router, TypeScript, Tailwind 4, Zod. Static output, no database and no API routes.
Python for the offline pipeline. Node 24, npm 11, Python 3.14. Deploy target Vercel.

## The thesis, and the shape that carries it

Announced capacity is reported with more confidence than the evidence behind it carries. The
product separates the announcement from the delivery on the one unit operators are comparable on,
then reads the companies where a document exists to work out what a delivered megawatt is worth.

The shape is coverage plus worked examples, not a score.

**Coverage.** Fourteen listed names, announced megawatts and live megawatts in separate columns,
every row carrying how far its figure has actually been checked. Names that own no megawatts sit in
a watchlist and are deliberately absent from the two by two, because an order book and a megawatt
do not belong on the same axes.

**Three deep dives, each on a different unit.** Sify read from a filed prospectus and cited by
printed page. Anant Raj on delivery, where announced, operational and handed over are three
different numbers. Netweb on an order book, because it manufactures the servers and owns no estate
at all.

**No composite score.** There is no scoring engine in this repository and none is implied. The two
by two plots announced against live megawatts directly, both of them stated figures, so a reader
can disagree with a placement by disagreeing with a source rather than with a weighting nobody
published. The brief's six pillar forensic scorecard remains unbuilt, and `/methodology` says so
rather than gesturing at one.

### The register framing, and why it is no longer the architecture

An earlier direction organised the project as one thesis in three registers, grid, disclosure and
accounts, explicitly in place of a sector dashboard. That framing is what narrowed an eighteen name
coverage product into a single company teardown over several sessions, and it was reversed on
2026-08-30. The work itself was not wasted, but it is now evidence feeding the product rather than
the product's structure:

- **Grid.** The transmission base rate still runs, and now sits under the deployment timeline on
  `/offer` as a slippage band against the issuer's own certified schedule.
- **Disclosure.** Harvested and validated, currently rendering on no page. Recorded as such in the
  README rather than advertised as a feature.
- **Accounts.** Feeds the Sify deep dive and the peer comparison. The reconciliation check against
  Equinix's stated adjusted EBITDA remains the method's external validation.

`/methodology` carries the full pivot log, because the failure is the instructive part: every step
toward the narrow version was a reasonable answer to the last instruction, which is exactly why it
went unnoticed.

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
app/page.tsx                 sector view: stat tiles, the two by two, operator cards
app/universe/page.tsx        coverage matrix, filterable, covered names link through
app/offer/page.tsx           offer anatomy, funding gap, net debt bridge, schedule against slippage
app/company/[ticker]/page.tsx  the three deep dives, one branch each
app/methodology/page.tsx     sourcing counted, the invariant register, formulas, limits, pivot log
app/layout.tsx               fonts, metadata, Nav
app/globals.css              theme tokens in all three scopes, validated palette

components/Nav.tsx               Universe, The offer, Method
components/Visual.tsx            the vocabulary: Icon, Monogram, Pictogram, StatTile
components/Exhibits.tsx          Exhibit chrome, Estate, RevenuePerMW
components/ExecutionAmbition.tsx the two by two, announced against live
components/UniverseMatrix.tsx    the coverage table, bucket and verdict filters
components/OfferAnatomy.tsx      Sankey, funding gap, net debt bridge
components/ScheduleVsSlip.tsx    stated deployment against the slippage distribution
components/ClientConcentration.tsx  the reconciliation the prospectus never performs
components/CapacityVsReturns.tsx indexed built capacity against return on capital
components/SiteMap.tsx           the estate, bubble area is built MW
components/AnantRajBody.tsx      the delivery case
components/NetwebBody.tsx        the order book case
components/NetwebOrderBook.tsx   one order against the book, beside Sify's revenue share
components/Sourcing.tsx          the three tiers, and the document as a page grid
components/InvariantLedger.tsx   every build guard, grouped by what it protects

components/CapacityStep.tsx      orphaned, wanted for the capacity ladder work
components/CapexVsCfo.tsx        orphaned, wanted once the cash flow statement is extracted
components/Cite.tsx              orphaned, belongs on the methodology page
components/DefinitionLadder.tsx  orphaned, four capacity definitions dated per rung

lib/schema.ts                        all Zod schemas and invariants
lib/data.ts                          validated loaders, companies array, helpers
lib/diagnostics/capital.ts           capexVsCfo, fundingGap, toCr
lib/diagnostics/unitEconomics.ts     segmentMargins, revenuePerMW, assertSameSign
lib/diagnostics/narrative.ts         segmentShare
lib/diagnostics/reconcile.ts         reconcileMargin, PASS FAIL NOT_RECONCILABLE
lib/diagnostics/disclosure.ts        refusalRate, publishedElsewhereSplit, pressurePerCall
lib/diagnostics/schedule.ts          fiscal year math, slipBand
lib/diagnostics/offer.ts             useOfProceeds, fundingGapByObject, netDebtBridge
lib/diagnostics/netweb.ts            orderBookConcentration
lib/diagnostics/sourcing.ts          verificationTally, citedPages
lib/diagnostics/diagnostics.test.mjs 49 tests, run with node --test

data/universe.json                 8 operators plus a 6 name watchlist, feeds the 2x2 and matrix
data/sisl.json                     Sify Infinit Spaces, every block page cited
data/anantraj.json                 capacity ladder, the source conflict, what was not read
data/netweb.json                   order book, the anchor order, revenue mix, what was not read
data/prospectus.json               offer, capacity definitions, objects, all page cited
data/invariants.json               every build guard, checked against lib/schema.ts by the tests
data/method.json                   formulas with denominators, known limits, the pivot log
data/base_rate.json                generated by the pipeline, do not hand edit
data/campuses.json                 3 seeded campuses, conflicts with universe.json by design
data/sify_capacity.json            capacity ladder, 3 claims, 5 refusals
data/companies/*.json              5 companies, normalised
data/disclosure_register.json      refusal rates, complete topic partitions, renders nowhere yet
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
