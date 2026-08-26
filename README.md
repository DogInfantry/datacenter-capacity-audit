# The Gigawatt Gap

India announced a gigawatt data centre buildout. This measures what the grid,
the water table and the tariff will actually carry.

## The finding

Across the 25 inter-state transmission projects the Ministry of Power reported
as delayed, the median slip is **7 months**. Weight those projects by approved
cost and it nearly doubles, to **13.7 months**. One in five slips past a year,
and the 90th percentile is 32 months.

That weighting is the point. Large transmission projects slip harder than small
ones, and a gigawatt scale campus does not interconnect through a small one.

Split by who is building, the gap widens again:

| Developer | Cost weighted slip | n | Approved cost |
|---|---|---|---|
| Power Grid, the central utility | 8.7 months | 17 | Rs 13,481 cr |
| Private transmission developers | 21.5 months | 7 | Rs 9,599 cr |

Seven private projects, three of them under one group, is enough to raise the
question of whether ownership predicts delivery and not enough to answer it.
The site says so on the page, in the same size type as the finding.

## Read the number as a floor

Every project on that list was **still running** when the answer was tabled. The
delay recorded against each one is the slip anticipated at that moment, not the
slip finally realised. Every observation is right censored, so the true figure
is at least this large. That cuts in favour of the argument made here, which is
why it is stated up front rather than buried in a methodology note.

## Why this and not another scorecard

The crowded question is which listed company is executing. It is crowded because
it is cheap to answer: read the announcements, score the intent, publish an
opinion that ages badly.

The uncrowded question is whether the physical infrastructure exists to carry
what has been announced. A grid interconnection date is not an opinion. It has a
deadline, a named executing agency, and a public record of how often that agency
has missed one before.

## Provenance is a field, not a footnote

Every number on the site carries a verification tag:

- **primary** read out of a filing, a tariff order or a government dataset
- **secondary** reported by a named third party that was not the original publisher
- **unverified** carried in from research notes, not yet traced to a primary source

Most of the campus ledger is currently **unverified** and displays that way. A
project about overconfident reporting does not get to be overconfident about
itself. The Zod schema in `lib/schema.ts` makes the tag mandatory, so a number
cannot reach the page without one, and the build fails with the offending field
path if a row is malformed.

## Data

| Layer | Source | Status |
|---|---|---|
| Transmission slippage | data.gov.in resource `2341d1d1`, Ministry of Power, tabled in the Rajya Sabha, unstarred question 5 April 2022 | live |
| Campus ledger | research notes, pending primary verification | seeded, 3 rows |
| Grid nodes, load | CEA and Grid-India | not yet built |
| Groundwater | India-WRIS and CGWB | not yet built |
| Tariffs | state ERC orders, by hand | not yet built |

Electricity tariffs are **not** available through data.gov.in. A `tariff` search
there returns customs and excise schedules only. They have to be read out of the
state commission orders as PDFs, which is the largest piece of hand work still
outstanding.

## Running it

```bash
cp .env.example .env.local     # then put a data.gov.in key in it
export DATA_GOV_KEY=...
python pipeline/fetch.py            # pull raw tables
python pipeline/ists_base_rate.py   # self-check, then recompute the base rate
npm install
npm run dev
```

`pipeline/ists_base_rate.py` runs an assert based self-check before it writes
anything. One of those asserts guards the headline claim directly: if a data
refresh ever inverts the private versus PSU gap, the pipeline fails rather than
letting the landing page keep a stale sentence.

## Status

Phase 0. The base rate is real and computed from source. The campus ledger is
three seeded rows carrying honest provenance tags. The map, the constraint joins
and the delivery scoreboard are next.

## Disclaimer

Educational and portfolio work. Not investment advice, not a research product,
not affiliated with any company or agency named. See `docs/DISCLAIMER.md`.
