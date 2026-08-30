# What was actually read

Every document this project has opened, with what came out of it. Assembled from the data files
themselves rather than from memory, so it can be checked line by line.

The distinction that matters throughout: **read** means opened and cited. **Harvested** means pulled
by machine into `data/raw/` and validated. **Carried in** means a figure taken from the project
brief without going back to the underlying publisher. Only the first two are ever tagged primary.

---

## 1. The prospectus, the only document read page by page

**Sify Infinit Spaces Limited, Draft Red Herring Prospectus, dated 16 October 2025.**
563 pages.
`https://www.morganstanley.com/content/dam/msdotcom/en/indiaofferdocuments/pdfs/Project_Green_DRHP.pdf`
SHA256 `30f945978b141ffc9b622c547bd32b9abe3d70a9e2e983ab6e474752af44525f`

The binary is deliberately not committed, at 12.5 MB. `data/raw/prospectus/drhp_extracts.json`
carries the URL, the checksum and the printed to PDF page offset, so any figure can be audited
against a fresh download. **Printed page plus 4 equals the zero based PDF index.**

Ten printed pages are cited across the site. That is 1.8 per cent of the document, and
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
| 301 | Our business | Capacity and utilisation by data centre, thirteen sites |
| 398 | Restated consolidated financials | Notes 23 to 26, the expense stack |

The two findings that came out of it: the same 188.04 MW figure is defined two different ways on
printed pages 49 and 142, and the long contract revenue share on page 46 equals the sum of the top
three clients on page 36 to the second decimal, a reconciliation the document never performs.

**Not read**, with the page map already recorded in `drhp_extracts.json`: the restated standalone
financials at printed 349 to 433, related party transactions inside those notes, and outstanding
litigation at printed 463. The standalone accounts are the valuable gap, and they block the model.

**Also generated from it:** `data/drhp_triage.json`, a density score for all 553 scorable pages with
the 28 term hedge lexicon that produced it. `/methodology` publishes both, including the finding
that the rule ranked the capacity pages 1 and 2 of 553 and buried the contract page at 461.

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
  No Anant Raj filing has been opened.
- **Netweb.** Order book of Rs 2,507 crore at 30 June 2026, an IndiaAI Mission order of Rs 1,734
  crore awarded September 2025, AI systems at 64 per cent of Q3 FY26 revenue and 48 per cent of
  9M FY26, and about 99 times trailing earnings. No Netweb filing has been opened.

### In the brief, deliberately not yet carried

Because nothing renders them, and a data file with no page is how this project previously lost a
finding: the hyperscaler pledges (Microsoft 17.5bn USD, AWS 12.7bn, Google 15bn), the IndiaAI
Mission outlay of Rs 10,371 crore and its GPU deployment record, state incentive policies, and the
Equinix and Digital Realty valuation multiples.

---

## The honest summary

One document read properly. Three companies' calls coded across a defined window. Five filers
harvested. One government dataset. Everything else on this site is a research note figure wearing a
tag that says so.
