# What was actually read

Every document this project has opened, with what came out of it. Assembled from the data files
themselves rather than from memory, so it can be checked line by line.

The distinction that matters throughout: **read** means opened and cited. **Harvested** means pulled
by machine into `data/raw/` and validated. **Carried in** means a figure taken from the project
brief without going back to the underlying publisher. Only the first two are ever tagged primary.

---

## 1. The prospectus, the first document read page by page

**Sify Infinit Spaces Limited, Draft Red Herring Prospectus, dated 16 October 2025.**
563 pages.
`https://www.morganstanley.com/content/dam/msdotcom/en/indiaofferdocuments/pdfs/Project_Green_DRHP.pdf`
SHA256 `30f945978b141ffc9b622c547bd32b9abe3d70a9e2e983ab6e474752af44525f`

The binary is deliberately not committed, at 12.5 MB. `data/raw/prospectus/drhp_extracts.json`
carries the URL, the checksum and the printed to PDF page offset, so any figure can be audited
against a fresh download. **Printed page plus 4 equals the zero based PDF index.**

Fourteen printed pages are cited across the site. That is 2.5 per cent of the document, and
`/methodology` publishes the count rather than implying more:

| Printed page | Section | What was taken from it |
|---|---|---|
| 17 | Summary of the offer document | Offer size, fresh issue against offer for sale |
| 36 | Risk factors | Revenue by client, top ten table. The client concentration finding |
| 46 | Risk factors, RF 17 | Share of revenue on contract terms of at least seven years |
| 49 | Risk factors | Built capacity defined as engineered to support |
| 79 | The offer | Offer structure |
| 109 | Objects of the offer | Objects, deployment schedule, auditor certification |
| 142 | Basis for offer price | Key performance indicators. Built capacity defined a second way |
| 144 | Basis for offer price | Peer comparison, the issuer's own chosen peer set |
| 260 | Industry overview | The peer benchmarking table. Return on capital, depreciation rate, capex and depreciation for five Indian and three global operators across three fiscal years |
| 261 | Industry overview | The return on capital formula, printed inside the commissioned 1Lattice and Cushman and Wakefield report rather than beside the issuer's own figures |
| 301 | Our business | Capacity and utilisation by data centre, thirteen sites |
| 353 | Restated consolidated financials | Statement of assets and liabilities. Net worth, borrowings, lease liabilities and cash, four periods |
| 355 | Restated consolidated financials | Statement of cash flow. Cash from operations, tax paid, capital expenditure, depreciation and right of use payments, four periods |
| 398 | Restated consolidated financials | Notes 23 to 26, the expense stack |

The two findings that came out of it: the same 188.04 MW figure is defined two different ways on
printed pages 49 and 142, and the long contract revenue share on page 46 equals the sum of the top
three clients on page 36 to the second decimal, a reconciliation the document never performs.

The third finding came out of the cash flow statement at printed 355: across the four filed periods
the estate absorbed roughly 1.87 times the cash operations produced, and the single period where
operations covered the spending is the last full year before the offer, with the quarter after it
back under.

The fifth is on printed 260 and 261, and it is about the whole Indian set rather than one company.
Every one of the five Indian operators in the peer table earned a lower return on capital in Fiscal
2024 than in Fiscal 2023, the average falling by more than a third in a year. On the facing page the
issuer summarises that table as showing its own return "significantly higher than its global peers".
Against the Indian operators printed directly above them it ranks third of five in both comparable
years, and in Fiscal 2024 it does not clear the best global peer either.

The fourth came from joining the balance sheet at printed 353 to a formula printed at 261, inside the
industry report the issuer commissioned rather than beside the figures it claims for itself. Rebuilt
from the issuer's own numbers, three of the four published returns on capital land on the second
decimal, and only on the reading where lease liabilities count as borrowings, which the printed
definition does not say and which flatters the company less than the alternative. The fourth cannot
be rebuilt at all, because an average needs a year the four column balance sheet does not carry, and
it is the highest of the four and half of what the claim to beating global peers rests on.

**Not read**, with the page map already recorded in `drhp_extracts.json`: the rest of the restated
financials through printed 433, related party transactions inside those notes, and outstanding
litigation at printed 463. The governance pillar of every risk register waits on the notes and the
litigation.

**The reading order for what remains**, stated before it is used rather than after, so it can be
judged on its own terms: corporate and business overview with segments, then the chairman or
managing director letter, then management discussion and analysis, then the board report, then the
auditor's report and the opinion type, then the financial statements, then the key notes to
accounts. The sustainability narrative, the ceremonial opening paragraphs, the static mission
statements and the standard statutory boilerplate are skipped. This is the order that fills the two
pillars the registers currently leave empty.

**It has now been used once, on the Anant Raj annual report below, and it half worked.** The first
section of the order, the corporate and business overview, carried the entire capacity finding, and
the auditor's opinion was where the order said it would be. The chairman or managing director letter
does not exist in that report under any of the names the order expects, so that step was skipped
rather than followed. The financial statements and the notes, which are the last two steps and the
ones that fill the empty pillars, were not reached.

**Also generated from it:** `data/drhp_triage.json`, a density score for all 553 scorable pages with
the 28 term hedge lexicon that produced it. `/methodology` publishes both, including the finding
that the rule ranked the capacity pages 1 and 2 of 553 and buried the contract page at 461.

---

## 1b. The second document read page by page

**Anant Raj Limited, annual report for FY2024-25.** 275 pages.
`https://nsearchives.nseindia.com/annual_reports/AR_26635_ANANTRAJ_2024_2025_A_28062025220835.pdf`
SHA256 `0811ca69b22ef07870d29a26a7f16b638288702b71f4c10958c993fbfbe9b8c7`

Filed with the exchange rather than found on a company website. It is here because nothing else
reaches this filer: the machine harvest that produced the Sify, Equinix, Digital Realty, Infosys and
Wipro figures covers filers registered with the United States Securities and Exchange Commission, and
Anant Raj files with SEBI and the Indian exchanges. That is a structural gap, not an oversight, and
it is why every figure on that page was secondary until now.

**The printed page number is the zero based PDF index minus two**, checked against four pages that
print their own number.

Read for two things only, and the page says which:

| Printed page | Section | What was taken from it |
|---|---|---|
| 3 | Corporate overview, highlights | Operationalised 6 MW at Manesar, an additional 15 MW at Manesar and 7 MW at Panchkula |
| 5 | Corporate overview, highlights | The 28 MW headline, printed with the words "operational and advance stage to operationalise" |
| 7 | Corporate overview | Total IT load capacity of 307 MW, and the 0.5 MW of cloud services inside the operational figure |
| 18 | Corporate overview | The three parks at 50 MW, 200 MW and 57 MW |
| 112 | Corporate governance report | The audit opinion, unmodified, standalone and consolidated, from Ranjana Vandana and Co. |

The finding: **the 28 MW that reaches the market is the company's own headline with its qualifier
removed.** The report prints the parts on another page, and they sum to it exactly. Six megawatts are
operational, of which half a megawatt is cloud services rather than colocation; the other twenty two
are described as ready or at an advance stage. That also dissolves the source conflict this project
had recorded and refused to average: 21 is Manesar alone, operational plus ready, and 28 adds
Panchkula. Two rungs of one ladder, and neither is the operational figure.

**Not read**, in the same file: the audited financial statements and the notes to them, revenue,
margins, cash flow, and related party transactions. The risk register on that page still carries no
row for cash conversion or the balance sheet, and that is why.

---

## 2. Earnings calls, read as transcripts

Coded into `data/raw/transcripts/`. The window is **1 January 2024 to 31 July 2026**, defined on the
date the call happened rather than on fiscal labels, which are not consistent across these filers.

| Company | Calls in window | Questions pressed | Refusals coded |
|---|---|---|---|
| Sify Technologies | 35 | 15 | 2 |
| Equinix | 42 | 20 | 9 |
| Digital Realty | 42 | 34 | 9 |

Two topic families only, chosen so that every published rate rests on questions which are
unambiguously unit economics: **pricing mechanics** and **cost margin bridge**. Complete topic
partitions, never a keyword search, because searching for a phrase finds only questions worded that
way and the denominator then describes the search instead of the calls.

**The Sify capacity ladder**, `data/sify_capacity.json`, is built from verbatim management answers
across eight calls: 30 Jul 2021, 29 Oct 2021, 21 Oct 2022, 24 Apr 2023, 18 Jan 2024, 22 Oct 2024,
17 Jan 2025 and 27 Oct 2025. Three forward claims and five refusals, each quoted.

The 27 October 2025 call is the one that matters most. Eleven days after the prospectus was dated,
management described the same estate as "188 megawatts of design capacity, of which about 130
megawatt is built". The call used the ordinary meanings. The filed document moved the words one
rung up.

**Stated margins**, the external check on the whole harvest method, quoted with speaker and date:

- Equinix, Adaire Rita Fox-Martin, CEO, 31 Jul 2025, Q2 2025 at 50 per cent
- Equinix, Keith D. Taylor, CFO, 31 Jul 2025, FY2025 guide at 49 per cent
- Equinix, Olivier Leonetti, CFO, 29 Jul 2026, Q2 2026 at 52 per cent
- Equinix, Keith Taylor, CFO, 14 Feb 2018 and 16 Feb 2017, FY2017 and FY2016
- Digital Realty, Andrew Power, CFO, 26 Apr 2019, FY2019 at 58 per cent
- Digital Realty, Matt Mercier, CFO, 27 Apr 2023, FY2023 at 49.3 per cent

---

## 3. Filings harvested by machine

Structured pulls into `data/companies/*.json`, validated by `CompanyDoc`, with the raw facts kept in
`data/raw/filings/`.

| Company | Years | Filings drawn on |
|---|---|---|
| Sify Technologies | FY2021 to FY2026 | 20-F for FY2023, FY2025 and FY2026, and a 20-F/A for FY2024 |
| Equinix | FY2018 to FY2025 | 10-K for FY2020 through FY2025 |
| Digital Realty | FY2017 to FY2025 | 10-K for FY2019 through FY2025 |
| Infosys | FY2022 to FY2026 | 20-F for FY2024, FY2025 and FY2026 |
| Wipro | FY2022 to FY2026 | 20-F for FY2024, FY2025 and FY2026 |

All five index from SEC EDGAR. Sify's is `https://www.sec.gov/Archives/edgar/data/1094324`; the rest
resolve through the EDGAR company browse endpoint recorded on each file.

Equinix and Digital Realty exist in this repository for one reason: to check the method against
companies that publish the answer. Rebuilding Equinix's own adjusted EBITDA from its own filings
lands 35 basis points from what its chief executive said on the call, against a 150 basis point
tolerance written down before the check was run. Digital Realty cannot be reconciled at all from
FY2023, because its share based compensation is tagged in shares rather than dollars and its
impairment concept stops at 2022. That failure is kept, because it establishes where the method
degrades.

---

## 4. Government data

**Ministry of Power, tabled in the Rajya Sabha.** "Project-wise Ongoing Delayed Inter State
Transmission Systems (ISTS) Transmission Projects", unstarred question of 5 April 2022.
`https://data.gov.in/resource/2341d1d1-34bd-4471-88b5-815d45a919d0`

25 delayed projects, Rs 24,945 crore of approved cost. Median slip 7 months, cost weighted 13.7,
ninetieth percentile 32. Every project was still running when tabled, so the delays are right
censored and 13.7 is a floor. Pulled by `pipeline/ists_base_rate.py`, which needs `DATA_GOV_KEY`.

---

## 5. Carried in from the brief, not independently verified

These have **not** been traced to the publishers named. They are tagged SECONDARY everywhere they
appear, and the pages say so.

- **Capacity forecasts.** Colliers 4.5 GW by 2030, Rubix Data Sciences 6.5 GW by 2030, aggregated
  bull cases 8 to 13.5 GW by 2032. Current operational capacity about 1.5 GW; Colliers counted
  1,263 MW at April 2025.
- **Build rate.** 387 MW added in 2025 against 191 MW in 2024, per Rubix.
- **Market size.** About 10 bn USD in 2025 to 22 bn by 2030, per Vestian, carried in IBEF summaries.
- **The coverage universe.** Eight operators and a six name watchlist in `data/universe.json`, from
  company announcements, brokerage notes and press reporting. One row of the eight claims primary,
  and only because it is the Sify prospectus.
- **Anant Raj.** 307 MW announced, 28 called operational, 8 handed over, from a Value Research note.
  The annual report has since been opened and it contradicts the second of those figures. See
  section 1b.
- **Netweb.** Order book of Rs 2,507 crore at 30 June 2026, an IndiaAI Mission order of Rs 1,734
  crore awarded September 2025, AI systems at 64 per cent of Q3 FY26 revenue and 48 per cent of
  9M FY26, and about 99 times trailing earnings. No Netweb filing has been opened.

### In the brief, deliberately not yet carried

Because nothing renders them, and a data file with no page is how this project previously lost a
finding: the hyperscaler pledges (Microsoft 17.5bn USD, AWS 12.7bn, Google 15bn), state incentive
policies, the Ministry of Power demand curve, and the Equinix and Digital Realty valuation
multiples.

**The IndiaAI Mission is no longer on that list.** The outlay of Rs 10,371 crore, the ten empanelled
providers, the national installed total of more than 17,300 processors by mid 2025 and the single
published offer of 9,216 are carried into `data/macro.json` and rendered on the sector page, tagged
secondary throughout. What is not carried is a per provider installed figure, because none has been
published; the exhibit groups providers by what was reported about them and marks the five with no
public record either way.

---

## Company marks

The logos in `public/logos` are each company's own mark, taken from its website or from Wikimedia
Commons, resized and optimised but not altered. They remain the property of their owners and are
reproduced here to identify the companies analysed. Ten of the fourteen covered names have one; the
rest render as a drawn monogram until a mark is added.

---

## The honest summary

Two documents read properly, one of them a prospectus and one an annual report. Three companies' calls coded across a defined window. Five filers
harvested. One government dataset. Everything else on this site is a research note figure wearing a
tag that says so.
