# Built, Installed, Sold

India is planning its data centre buildout in gigawatts. This measures what has actually been
delivered, on the one unit operators are comparable on, and then reads the single company whose
filings are public to work out what a delivered megawatt is worth.

Fourteen listed names with data centre or AI infrastructure exposure, with the announcement and the
delivery kept in separate columns. Three worked deep dives underneath it. Every figure carries a
source and a verification tag, every rate shows its denominator, and forty nine tests plus thirty
build invariants enforce it: a claim that stops being true fails the build rather than going stale
on the page.

## The argument

Supply is counted in **built capacity**, and built does not mean earning. On the one estate that
can be measured from a filing, sixty per cent of built capacity is sold to a customer. A national
forecast of 4.7 to 5.7 GW stated in that same unit is not 4.7 to 5.7 GW of revenue.

## What it found

**A prospectus reports 188.04 MW as built, and defines built as designed.** The Sify Infinit Spaces
draft prospectus of 16 October 2025 headlines "a built IT power capacity of 188.04 megawatt". Its
own footnote on printed page 49 defines built capacity as "the maximum IT load a data center is
engineered to support", calculated from "present design specifications" and "total planned
electrical load". Installed capacity, meaning equipped and commissioned, is 131.88 MW. Operational
capacity, meaning sold to a customer, is 113.67 MW. The headline is 65 per cent larger than the
estate earning revenue, and the key performance indicator table a reader uses to judge the offer
price prints built and operational while omitting installed.

Eleven days later, on an earnings call, management described the same estate as "188 megawatts of
design capacity, of which about 130 megawatt is built". The call used the ordinary meanings. The
filed document moved the words one rung up.

**The contract book the prospectus calls durable is three customers.** Printed page 46 reports the
share of revenue on contracts of at least seven years across four periods. Printed page 36 gives
revenue by client. In every period the first figure equals the sum of the top three clients, all
three of them Hyperscalers, to the second decimal. The document never joins the two tables. Joined,
they say the long contract base and the client concentration are the same three counterparties, and
that client one alone moved from 38.18 to 44.68 per cent of revenue. That reconciliation is
asserted as a build invariant.

**The second largest object of the offer is 0.1 per cent spent.** Rabale towers 11 and 12 carry an
estimated cost of 11,277 million rupees against 10.76 million deployed as of 31 August 2025, with
the balance scheduled across Fiscals 2027 to 2029. The schedule is certified by the statutory
auditor. Held against the transmission slippage below, it reaches November 2031 at the ninetieth
percentile.

**A headline use of proceeds moves net debt by 1.4 per cent.** Of a 37,000 million rupee offer,
12,000 is an offer for sale and never reaches the company. Repayment of borrowings is a named
object at 6,000 million, and the same table commits 5,629 million of new borrowings to other
objects, so net debt falls by 371 million. Neither page of the document performs that subtraction.

**Announced 307 MW, called 28 operational, handed over 8.** Anant Raj is the delivery case, and the
gap between operational and handed over is the one a capacity table will not show you. Sify keeps
sixty per cent of its widest number by the time it reaches revenue. Anant Raj keeps 2.6.

**One government order is 69 per cent of an order book.** Netweb owns no megawatts at all, so it is
read on backlog instead: an IndiaAI Mission award of 1,734 crore inside a book of 2,507 crore at 30
June 2026. That is a ceiling rather than a measurement, because anything already delivered has left
the book, and the page says so beside the bar.

**Transmission slips a cost weighted 13.7 months against a median of 7.** Across the 25 inter state
projects the Ministry of Power reported as delayed, weighting by approved cost nearly doubles the
slip, because large projects slip harder than small ones and a gigawatt campus does not
interconnect through a small one. Power Grid runs 8.7 months late, private transmission developers
21.5. Every project was still running when tabled, so each delay is anticipated rather than
realised: the observations are right censored and 13.7 is a floor.

## What is harvested but does not yet render

Recorded here rather than advertised as a feature, because a finding on no page is not a finding.

- **The disclosure register.** Refusal rates with complete topic partitions as denominators, for
  Sify, Equinix and Digital Realty. Held in `data/disclosure_register.json`.
- **The reconciliation check.** Rebuilding Equinix's own adjusted EBITDA from its own filings lands
  35 basis points from what its chief executive said on the call, against a 150 basis point
  tolerance written down beforehand. Digital Realty cannot be reconciled at all, because its share
  based compensation is tagged in shares rather than dollars.
- **The prospectus triage.** Density scores across all 563 pages, which is how the pages worth
  reading were chosen. Held in `data/drhp_triage.json`.

## What it is not

Not investment advice, not a research product, and not affiliated with any company or agency named.

Not a forecast. The slippage band drawn against the prospectus schedule measures inter state
transmission projects, not data centre construction. It is the delay distribution of the grid
connections a campus depends on, and the same prospectus places an on site 230 kV substation at
Chennai 02. That distinction is stored as a required field in the schema rather than as a sentence,
because a sentence can be edited away.

Not comprehensive. One operator in eight is traced to a filed document, and that filing is read on
ten of its 563 pages. Both numbers are counted and published on the methodology page rather than
estimated, and nothing here claims anything about the pages that were not read.

## How to check any figure

Every figure carries a `Source` with a verification tag: PRIMARY read from a filing, a tariff order
or a government dataset; SECONDARY carried in from a named publisher; UNVERIFIED where the project
has not yet done the work. Zod validates at import and the build fails with the field path, so bad
data cannot render. A row cannot claim PRIMARY without naming a filed document, and that is checked
rather than trusted.

Prospectus figures additionally carry the printed page they were read from. The document itself is
not committed, because it is 12 MB, but `data/raw/prospectus/drhp_extracts.json` records the URL, a
SHA256 and the printed to PDF page offset, so anyone can re download the file and audit a number
against it.

`/methodology` publishes all of it: the sourcing counted from both ends, every one of the forty two
build invariants with what it protects and the message it emits when it fires, every formula with
its denominator and sample, the known limits including two now closed, and a log of how this
project's direction changed.

## Running it

```bash
npm install
npm run dev
```

```bash
npm test
npm run check
npm run build
```

The offline pipeline needs a data.gov.in key in the environment:

```bash
export DATA_GOV_KEY=...
python pipeline/ists_base_rate.py
```

## More

- [ARCHITECTURE.md](ARCHITECTURE.md), how it is built and why
- [docs/SOURCES.md](docs/SOURCES.md), every document actually read, and what came out of it
- [docs/GOTCHAS.md](docs/GOTCHAS.md), the failures that cost real time once
- [ROADMAP.md](ROADMAP.md), what is deliberately unfinished, and what is terminal rather than
  pending

## Licence and data

Code is MIT, see [LICENSE](LICENSE).

The figures are facts drawn from public filings, government datasets and earnings calls. Quoted
excerpts remain the property of their publishers and are used as short attributed quotations for
analysis and comment.
