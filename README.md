# The Gigawatt Gap

India announced a gigawatt scale data centre buildout. This measures what the grid, the accounts
and the silences will actually carry.

Three registers, each a different record of the same gap between claim and delivery: how late the
transmission that powers a campus actually runs, what management will and will not put a number
on, and what the statements eventually show. Every figure carries a source and a verification tag.
Every rate shows its denominator. Thirty five tests enforce it and the build fails on bad data.

## What it found

**Transmission slips a cost weighted 13.7 months against a median of 7.** Across the 25 inter
state projects the Ministry of Power reported as delayed, weighting by approved cost nearly
doubles the slip, because large projects slip harder than small ones and a gigawatt campus does
not interconnect through a small one. Split by owner, Power Grid runs 8.7 months late and private
transmission developers 21.5. Every project was still running when tabled, so each delay is
anticipated rather than realised: the observations are right censored and 13.7 is a floor.

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

**The second largest object of the offer is 0.1 per cent spent.** Rabale towers 11 and 12 carry an
estimated cost of 11,277 million rupees against 10.76 million deployed as of 31 August 2025, with
the balance scheduled across Fiscals 2027 to 2029. The schedule is certified by the statutory
auditor. Held against the transmission slippage above, it reaches November 2031 at the ninetieth
percentile.

**Refusal rates, with the denominators visible.** Across the two topic families that are
unambiguously unit economics, between January 2024 and July 2026, with the topic partition taken
whole rather than searched by keyword: Sify declined or deflected on 2 of 15 questions, Equinix on
9 of 20, Digital Realty on 9 of 34. The Indian operator refuses least and the largest global
operator refuses most, which is the opposite of the easy story and is kept for that reason. Sify
is also asked least, 0.43 unit economics questions a call against Digital Realty's 0.81, and a
company that is rarely asked has fewer chances to refuse, which is why the denominator stays on
the page.

**The harvest method was checked against companies that publish the answer.** Rebuilding Equinix's
own definition of adjusted EBITDA from its own filings gives 49.65 per cent for the second quarter
of 2025 against the 50 per cent its chief executive stated on the call, a gap of 35 basis points.
Tolerances of 150 basis points against an actual and 250 against guidance were written down before
the check was run. Digital Realty could not be reconciled at all, because its share based
compensation is tagged in shares rather than dollars and its impairment concept stops at 2022. The
method is sound where a filer tags its income statement completely and degrades exactly where
untagged non-GAAP adjustments grow.

## What it is not

Not investment advice, not a research product, and not affiliated with any company or agency named.

Not a forecast. The slippage band drawn against the prospectus schedule measures inter state
transmission projects, not data centre construction. It is the delay distribution of the grid
connections a campus depends on, and the same prospectus places an on site 230 kV substation at
Chennai 02. That distinction is stored as a required field in the schema rather than as a
sentence, because a sentence can be edited away.

## How to check any figure

Every figure carries a `Source` with a verification tag: PRIMARY read from a filing, a tariff order
or a government dataset; SECONDARY carried in from a named publisher; UNVERIFIED where the project
has not yet done the work. Zod validates at import and the build fails with the field path, so bad
data cannot render.

Prospectus figures additionally carry the printed page they were read from, and a test fails the
build if any of them loses it. The document itself is not committed, because it is 12 MB, but
`data/raw/prospectus/drhp_extracts.json` records the URL, a SHA256 and the printed to PDF page
offset, so anyone can re download the file and audit a number against it.

`app/method/page.tsx` states every formula with its denominator, its sample size and its known
limits.

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
- [docs/GOTCHAS.md](docs/GOTCHAS.md), the failures that cost real time once
- [ROADMAP.md](ROADMAP.md), what is deliberately unfinished, and what is terminal rather than
  pending

## Licence and data

Code is MIT, see [LICENSE](LICENSE).

The figures are facts drawn from public filings, government datasets and earnings calls. Quoted
excerpts remain the property of their publishers and are used as short attributed quotations for
analysis and comment.
