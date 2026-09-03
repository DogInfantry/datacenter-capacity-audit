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
against a fresh download. **Printed page one sits at PDF index 5**, and 556 folios the document prints on itself agree.

Twenty printed pages are cited across the site. That is 3.6 per cent of the document, and
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
| 350 | Auditor's examination report | The report names the periods it covers and which entity each one is: consolidated for June 2025 and March 2025, standalone for March 2024 and 2023 |
| 353 | Restated consolidated financials | Statement of assets and liabilities. Net worth, borrowings, lease liabilities, cash and total assets, four periods, and the Consolidated against Standalone column header printed above them |
| 355 | Restated consolidated financials | Statement of cash flow. Cash from operations, tax paid, capital expenditure, depreciation and right of use payments, four periods |
| 398 | Restated consolidated financials | Notes 23 to 26, the expense stack |
| 463 | Outstanding litigation and material developments | The policy on materiality, adopted by board resolution two days before the document is dated. Three tests, the lower of which sets the disclosure threshold |
| 464 | Litigation involving the Company | The Visakhapatnam land writ naming the Company, and two summary criminal cases the Company says it learned of from the E-courts services website |
| 407 | Note 33, segment reporting | One reportable segment, and the Major Customer line giving revenue from three customers as an amount in all four periods |
| 408, 409, 410 | Note 34, related parties and transactions | The related party list and the transactions table for the stub quarter and the last full year: the associate's loan, preference shares, security deposit and corporate guarantee, the expense and revenue transfers from the parent, and the footnotes on what the key management line covers |
| 470 | Outstanding litigation, tax and creditors | Twenty income tax appeals found by third party checks and unquantifiable for want of service, a GST show cause notice of 1,175.83 million, and the creditor materiality threshold |

The seventh is about the four columns rather than about anything in them. The restated statements
are titled **Restated Consolidated** throughout, and the header printed directly above the columns
reads **Consolidated** for the two most recent periods and **Standalone** for the two older ones. The
auditor's examination report at printed 350 says the same in words. Four columns a reader takes as
one series are therefore two reporting entities.

The series survives it, and the reason is worth stating rather than assuming. The associate, SKVR
Software Solution Private Limited, contributed nothing at all in the two standalone years, so a
consolidated statement for those years would have been the same statement. Where it does register is
the stub quarter, whose share of the associate's loss is 8.4 per cent of the profit reported for it.
The condition is now a build guard: a standalone column carrying an associate share would mean every
exhibit spanning four periods is comparing a group against a parent.

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

The sixth came out of the legal section and is about the disclosure rather than about a dispute. The
threshold a matter must reach before it has to be disclosed is never printed as a figure; it is
printed as a formula taking the lower of three tests, over net worth, turnover and average profit.
Computed from the issuer's own restated statements the profit test binds, at 52.72 million rupees,
which is 5.4 times below the next test up and 0.37 per cent of a year's revenue. Taking the lowest
is the inclusive choice and is worth saying plainly. It also means the bar moves with earnings
rather than with the size of the company.

Against that bar, twenty two proceedings are disclosed which the issuer says reached it through
public databases rather than through service, in its own words on both counts, and the twenty tax
appeals among them carry no amount because the grounds and quantum are not available to a party
nobody has served. The largest number in the section is therefore the largest number that could be
written down rather than the largest exposure in it.

The eighth is about who the disclosed remuneration is for. In the last full year the related party
table shows 2.62 million of key management remuneration, and a footnote says that covers one of the
three officers the same note names: the others are inside an expense transfer from the parent. A
second footnote prices what moved, at 6.50 million inside a transfer of 526.88. So the disclosed
figure is 29 per cent of what the note itself says key management cost, and it is a floor rather
than a total, because the note says the transfer includes that much remuneration rather than that it
is all of it. In the stub quarter the same line covers all three officers, so one disclosure means
two different things in two adjacent columns of one table.

**Not read**, with the page map already recorded in `drhp_extracts.json`: the rest of the restated
financials through printed 433, and related party transactions inside those notes. The governance
pillar is opened rather than finished: it rests on the litigation section alone, and the auditor's
report and the related party notes are still not cited.

**The reading order for what remains**, stated before it is used rather than after, so it can be
judged on its own terms: corporate and business overview with segments, then the chairman or
managing director letter, then management discussion and analysis, then the board report, then the
auditor's report and the opinion type, then the financial statements, then the key notes to
accounts. The sustainability narrative, the ceremonial opening paragraphs, the static mission
statements and the standard statutory boilerplate are skipped. This is the order that fills the two
pillars the registers currently leave empty.

**It has now been used twice on the Anant Raj annual report below, and it worked both times.** The
first section of the order, the corporate and business overview, carried the entire capacity finding,
and the auditor's opinion was where the order said it would be. The chairman or managing director
letter does not exist in that report under any of the names the order expects, so that step was
skipped rather than followed. The financial statements and the key notes, the last two steps, were
reached on the second pass and produced a larger finding than the first pass did. The order held:
the segment note and the statement of subsidiaries were where it said they would be.

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

**Printed page one sits at PDF index 3**, and 267 folios the document prints on itself agree, from
index 4 through to index 219.

Read in two passes. The first took capacity and the audit opinion. The second took the audited
consolidated statements and the notes that matter for a data centre:

| Printed page | Section | What was taken from it |
|---|---|---|
| 3 | Corporate overview, highlights | Operationalised 6 MW at Manesar, an additional 15 MW at Manesar and 7 MW at Panchkula |
| 5 | Corporate overview, highlights | The 28 MW headline, printed with the words "operational and advance stage to operationalise" |
| 7 | Corporate overview | Total IT load capacity of 307 MW, and the 0.5 MW of cloud services inside the operational figure |
| 18 | Corporate overview | The three parks at 50 MW, 200 MW and 57 MW |
| 112 | Corporate governance report | The audit opinion, unmodified, standalone and consolidated, from Ranjana Vandana and Co. |
| 79 | Annexure V, Form AOC-1, statement of subsidiaries | Anant Raj Cloud Private Limited: share capital, reserves, total assets, total liabilities, turnover and result for the year |
| 222 | Consolidated balance sheet | Total assets and equity, borrowings and lease liabilities current and non current, cash, investment property, inventories |
| 223 | Statement of consolidated profit and loss | Revenue, the full expense stack, profit before and after tax, both years |
| 224 | Consolidated cash flow statement | Cash generated from operations, tax paid, net operating cash flow, the movement in current borrowings presented among the working capital adjustments, and the four capital expenditure lines |
| 225 | Consolidated cash flow statement, continued | Cash flows from finance activities. Proceeds and repayment of borrowings, both filed years |
| 260 | Note 40, segment reporting | The single reportable segment, and the statement that no external customer exceeds ten per cent of revenue |
| 262, 263 | Note 41, related party disclosures | Loans granted to and outstanding from associate companies and relatives of key management, both filed years, and the company's own statement that the transactions are at arm's length |
| 266 | Note 45, other statutory information | Every balance with a company struck off under Section 248 of the Companies Act: eleven counterparties, the relationship column the report assigns each one, and both filed years |
| 267 | Note 47, financial ratios | Return on equity, return on capital employed and debt to equity, each with its numerator and denominator printed beside it |
| 268 | Note 48, entities consolidated | The same subsidiary's share of consolidated net assets and profit, which ties to printed page 79 |

The finding: **the 28 MW that reaches the market is the company's own headline with its qualifier
removed.** The report prints the parts on another page, and they sum to it exactly. Six megawatts are
operational, of which half a megawatt is cloud services rather than colocation; the other twenty two
are described as ready or at an advance stage. That also dissolves the source conflict this project
had recorded and refused to average: 21 is Manesar alone, operational plus ready, and 28 adds
Panchkula. Two rungs of one ladder, and neither is the operational figure.

The second finding is larger than the first. **The data centre arm the market prices this company on
is 1.0 per cent of its revenue, and it loses money.** Anant Raj Cloud Private Limited turned over
2,151.36 lakh rupees against the group's 2,05,997.42, lost 252.99, and closed the year with
liabilities exceeding assets by 866.44. That subsidiary is printed twice, in the statement of
subsidiaries at printed 79 and in the consolidated entity table at printed 268, and the two agree to
the paisa. Neither figure appears in the group income statement, because note 40 at printed 260
states the business falls within a single reportable segment and that segment is real estate
development. The capacity is disclosed in the corporate overview. The economics of it are disclosed
only as one column in a statement of subsidiaries.

The third finding came out of the notes and runs the other way from the obvious reading. **Eleven
counterparties have been struck off the register under Section 248 and the company still carries
balances with all of them.** Four are related parties, which invites the conclusion that this is a
related party problem. It is not. The largest balance is 5,000.00 lakh owed to the company by
Vibrant Softech Private Limited, which the report classifies as Others, and it is 335 times
everything else receivable on that list put together. Ten of the eleven balances are identical to
the year before, to the paisa.

Beside it, in note 41, **related party lending stepped up sharply in one year**: loans outstanding
to associates went from 875.29 to 3,969.54 lakh and loans to relatives of key management from 174.00
to 1,229.10. The associates row does not roll forward. The transactions table says 3,969.54 was lent
during the year and prints no repayment from associates, which added to the opening balance gives
4,844.83 against a closing balance of 3,969.54. An associate leaving the perimeter would account for
the difference and so would a presentation choice in either table. The report says neither, and what
the gap is has not been named here.

The third finding is a presentation choice rather than a number. The movement in current borrowings,
8,189.39 lakh out, is presented inside operating activities as a working capital adjustment at printed
224, while proceeds and repayment of borrowings appear again under finance activities at printed 225.
Capital expenditure is 9,914.60 lakh across the four lines the investing section prints. Against
operating cash flow as filed that is 1.03 times the cash the year produced; against operating cash
flow with the borrowings movement taken back out, 17,850.41, it is 0.56 times. The spending does not
change and the answer does. Both filed years present the item the same way, and a build guard now
asserts that both sections still carry it.

**Still not published by the company**, at any level of detail, and therefore absent here: a data
centre revenue line, a margin or return on capital for the arm, revenue per megawatt, and contracted
or let capacity at the three campuses. A single segment disclosure is what makes each of those
unavailable rather than merely unread. Related party transaction detail beyond the parties named is
in the report and is not cited.

---

## 1c. The third document read page by page

**Techno Electric & Engineering Company Limited, annual report for FY2025-26.** 219 PDF pages.
`https://nsearchives.nseindia.com/annual_reports/AR_31018_TECHNOE_2025_2026_A_6626981_01092026181431.pdf`
SHA256 `862265cb8f78636d7cc82440409e5629fa32f0e24dd04a2a42173a46e99e3def`

Filed with the exchange on 1 September 2026 and opened the day after. It was opened for one reason:
`data/universe.json` carried this operator at 36 MW live, from the research note, and nothing had
tested that figure against the company.

**This report is laid out as two page spreads**, so one PDF page carries two printed pages and a
printed page is half a PDF page. **Printed page one is the right half of PDF index 2**, and 320 folios
agree. Both halves of a spread are consecutive, so printed 72 is the left half of index 38 and
printed 73 is the right half of the same index.

Which half a figure sits in was resolved by the horizontal position of each text run rather than by
splitting the extracted string. The folio itself could not be used for that: this document sets both
numbers of a spread in one run at the left edge, sometimes twice over, so index 100 reads "196 197"
and index 38 reads "72 7372 73". A rule that took position alone found eight folios out of several
hundred and every one of them was a stray table number.

| Printed page | Section | What was taken from it |
|---|---|---|
| 72 | Management discussion, hyperscale campuses | The three campuses, each with the report's own words for its status: Chennai 24 MW, Kolkata 8 MW, Noida 16 MW and its 500 kW first phase |
| 73 | Management discussion, edge network | 102 edge locations across 23 states with RailTel, on a Build, Operate and Maintain contract, with no megawatt figure attached |
| 73 | Management discussion, stated target | 250 MW of data centre capacity targeted by FY 2029-30, across hyperscale and edge |

The finding is the figure that changed. **The company names one campus as commissioned and live and
it is 24 MW, not 36.** The row carried 36 for as long as nothing had been read, and the correction is
12 MW on a 36 MW claim. What is live is 9.6 per cent of what is targeted.

The second finding is the same gap drawn inside a single site. **Noida is described as a 16 MW campus
whose first phase is 500 kW**, so the ratio between the headline and the first delivered increment is
about thirty two to one without leaving one address.

The third is a definition rather than a number. Chennai is called "Commissioned and live" in the same
bullet that says "Phase II capex planning is underway", so the 24 MW is the campus rather than what
is earning, in the same way 188.04 MW and 28 MW are on the other two names. Both halves of the
sentence are recorded and neither is resolved here.

**Taken from it on a second reading**, once the megawatts were settled: the capital commitment, the
contingent liabilities, the emphasis of matter in both auditors' reports, the struck off balance and
the absence of any segment disclosure. Those are on `/pillars` as Exhibit 6.

| Printed page | Section | What was taken from it |
|---|---|---|
| 174 | Independent auditor's report on the standalone statements, emphasis of matter | Trade receivables and other financial assets of 896.35 million rupees, "pending settlement / realisation and are substantially overdue", carried with no impairment provision and an unmodified opinion |
| 280 | Independent auditor's report on the consolidated statements, emphasis of matter | The same 896.35 million, in the same words, from the second report |
| 264 | Note 38 to the standalone statements | Capital commitments of 118.05 million rupees, and contingent liabilities of 251.03 against 167.24 |
| 368 | Note 37 to the consolidated statements | The same commitment and the same contingent total, with the prior year commitment at 29.35 |
| 278 | Note 44 to the standalone statements, other statutory information | One balance with a company struck off the register: Pyrotech Electronics Private Ltd, trade payables, vendor, 0.02 |
| 381 | Note 42 to the consolidated statements, other statutory information | The same balance, and directly beneath it a second clause sharing the numeral (ii) reading "The Group do not have any transactions with struck off companies" |
| 243 | Note 21 to the standalone statements | Supplier finance of 196.24 million rupees against nil a year earlier, financed terms of 120 to 180 days against 60 to 90 for comparable trade payables, at SOFR plus 70bps against collateral |
| 349 | Note 19 to the consolidated statements | The same arrangement, in the same words, at group level |
| 267 and 369 | Net debt reconciliations, standalone and consolidated | 194.59 million reclassified from trade payables to borrowings and recorded as a non cash transfer under Ind AS 7, against nil a year earlier |
| 217 | Note on standards notified in the year | The amendments to Ind AS 7 and Ind AS 107 requiring the disclosure, notified 13 August 2025, which is why the arrangement appears for the first time |
| 244 | Note 22 to the standalone statements, trade payables ageing | The whole micro and small enterprise balance of 403.83 million in an overdue column and nothing in the column for amounts not yet due, in both years, on a table headed from the due date of payment. Letters of credit standing behind 5,343.84 of the payables against 3,054.21 |
| 245 | Note 22 to the standalone statements, disclosure under the MSMED Act 2006 | Nil at all five statutory clauses, in both years |
| 298 | Note 1 to the consolidated statements, group overview | One business described in power infrastructure. No segment disclosure follows it, and none appears anywhere in the document |

The finding is the commitment. The target of 250 MW is management commentary and the campus figures
are too. The only line in either set of accounts recording contracts for future capital spending is
118.05 million rupees, which at the sector build cost of 60 to 70 crore per megawatt carried in
`data/macro.json` buys between 0.17 and 0.20 MW. It is 2.13 times smaller than the tax the company
disputes and 7.59 times smaller than the balances its own auditor flagged as overdue.

The second finding is an absence, and it is stated with the terms that were searched so it can be
re-run. Across all 433 printed pages the accounts carry no segment disclosure: no Ind AS 108, no
reportable segment, no operating segment, no segment information, no chief operating decision maker.
The business the report calls "the most consequential strategic decision we have made in a
generation" therefore has no revenue, no margin and no asset base a reader can separate from the
engineering business that funds it. That is the answer to the question the brief's business model
pillar was blocked on, and it is a property of what the company discloses rather than a gap to close.

The extraction was checked before the absence was believed. Every printed page was recovered by
splitting each spread on the horizontal position of its text runs, and the halves reconcile to the
raw page totals, so the search covered text the document actually contains.

A third result came out of the same reading and it cuts two ways, so both ways are published. The
supplier finance arrangement lengthens what the company takes to pay from 60 to 90 days to 120 to
180, and moves 194.59 million rupees out of trade payables. Classifying that under borrowings
rather than leaving it among payables is the stricter of the two treatments available and the
company chose it. What the treatment cannot do is put the lengthening into the cash flow
statement: the transfer is non cash, so 97 per cent of everything the standalone reports as
current borrowings arrived without cash moving. Against the payables it came out of the amount is
small, at 1.71 per cent of the total, and that is on the page beside the rest.

A fourth result repeats the shape of the struck off one, which is why both are published rather
than one standing for the pair. The ageing table places 403.83 million owed to micro and small
enterprises past its due date, and the five clauses of the MSMED Act printed on the next page
report nothing at every one of them. Interest after the appointed day is automatic under that
statute. The limit belongs with the finding: the shortest overdue bucket runs to a year and the
appointed day is forty five days, so the table cannot show that every rupee passed it, and what
the five clauses report is that none of it did.

**Still not taken from it:** the order book, the transmission business and the revenue and margin
lines, which remain the majority of this company.

---

## 1d. How a printed page becomes a position in the PDF

Every primary claim above names a printed page, so the mapping from that number to a position in the
file carries the whole citation chain. It used to be a sentence in each manifest, and the sentences
disagreed with each other: one document recorded the offset as a positive number meaning index equals
printed plus four, another recorded it as a negative number meaning printed equals index minus two.
Applying either reading to the other document moves every citation by four pages, and nothing in the
build would have noticed.

The mapping is now stored as **the position of printed page one** rather than as a signed offset,
because a position cannot be read backwards. Beside it sit **anchors**: folios the document prints on
itself, recovered by `pipeline/find_folios.py`, which fits the mapping the largest number of printed
folios agree on and lists the ones that disagree. A build guard recomputes every anchor from the
declared mapping, so the claim and its evidence cannot drift apart. Moving any of the three mappings
by a single page fails the build with a message naming what the document actually prints.

| Document | Layout | Printed page one | Folios agreeing |
|---|---|---|---|
| Sify DRHP | One printed page per PDF page | PDF index 5 | 556 |
| Anant Raj annual report | One printed page per PDF page | PDF index 3 | 267 |
| Techno Electric annual report | Two page spreads | Right half of PDF index 2 | 320 |

---

## 1d. The fourth document read, and the one that found an absence

**E2E Networks Limited, annual report for FY2024-25.** 148 pages.
`https://nsearchives.nseindia.com/annual_reports/AR_28419_E2E_2024_2025_A_2031137_04092025160657.pdf`
SHA256 `a9b767ac30a4258f744d7be478d513cbaf330573bdf25d468b36298a7982e3a7`

Located through the exchange's own annual reports endpoint rather than guessed at, since the archive
filenames carry a submission id and a timestamp that cannot be derived. The byte count in the
filename matches the file, which is a free integrity check the other three did not offer.

**The whole document contains no megawatt figure, and no kilowatt figure either.** That is the
result, and it is about the coverage row rather than about the company. This was the one covered name
with nothing read, carrying 25 MW announced against 10 MW live from the project brief, flagged in the
data file as an estimate and the least reliable number on the plot. Reading the filing cannot upgrade
those numbers, because the company does not publish in that unit and is not the kind of business that
would.

What it does say, in its own words: it is "the leading hyperscaler from India with a focus on
advanced Cloud GPU infrastructure" and an IaaS provider. It never calls itself a data centre
operator. It does not own the estate it runs on: it "has expanded its capacity by setting up GPU
clusters at L&T's state-of-the-art data center facility in Chennai", and serves compute from
facilities in Noida, Chennai and Mumbai. A tenant with servers in someone else's hall does not have
announced capacity in the sense the rest of this coverage uses, which is why the row now names the
absence beside the number instead of leaving a reader to assume the figure was merely unchecked.

The unit it does publish is monthly recurring revenue, and it points the other way from the headline:

| Measure | FY2024-25 | FY2023-24 | Change |
|---|---|---|---|
| Revenue from operations, Rs lakh | 16,396.08 | 9,446.36 | +73.57% |
| Monthly recurring revenue at year end, Rs crore | 11.2 | 10.90 | +2.75% |
| Depreciation, Rs lakh | 6,007.61 | 1,574.78 | +281% |
| Other income, Rs lakh | 3,942.68 | 163.38 | +2,313% |

**The exit rate is below the year it just finished.** Annualising 11.2 crore a month gives 134.4
crore against revenue from operations of 163.96 crore, so a year reported as up 73.57 per cent ends
at a run rate a fifth below its own average. **And most of the profit is not from operations.**
Earnings before interest, tax and depreciation of 9,666.08 lakh, less depreciation of 6,007.61 and
finance costs of 1,322.01, leaves 2,336.46 lakh from the business; other income of 3,942.68 lakh is
1.69 times that and 63 per cent of the 6,279.14 lakh profit before tax. The report does not say what
the other income is, and it is not guessed at here.

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
| Sify Technologies | FY2021 to FY2026 | 20-F for FY2023, FY2025 and FY2026, and 20-F/A for FY2022 and FY2024 |
| Equinix | FY2018 to FY2025 | 10-K for FY2018 through FY2025 |
| Digital Realty | FY2017 to FY2025 | 10-K for FY2018 through FY2025 |
| Infosys | FY2022 to FY2026 | 20-F for FY2023 through FY2026 |
| Wipro | FY2022 to FY2026 | 20-F for FY2023 through FY2026 |

All five index from SEC EDGAR. Sify's is `https://www.sec.gov/Archives/edgar/data/1094324`; the rest
resolve through the EDGAR company browse endpoint recorded on each file. **The pulls are served
through the FactIQ filings store rather than fetched from EDGAR directly**, which is what the
`_source` line in every `data/raw/filings/*/facts.json` records. The store names the filing that
served each individual figure, and that is why the three fields below carry a source each rather
than sharing the row's.

**Three concepts were added on 2026-09-03**, for all five filers: profit after tax, total assets and
net cash used in investing. Together they are what the cash conversion pillar needs, and their
absence was the stated blocker on every remaining pillar. Under US GAAP they are `Assets`, `Net
income loss` and `Net cash provided by used in investing activities`; under IFRS they are `Assets
(IFRS)`, `Profit loss (IFRS)` and `Cash flows from used in investing activities`. Each figure is
taken in the currency its own file declares. Sify and Wipro publish both a rupee and a dollar series
and only the rupee one is stored, because taking the other would be a currency conversion arriving
through the back door.

**Total assets stop one year short of the cash flow for both US filers.** A 10-K prints its
statement of financial position for the year it closes and the year before, and the store serves
what was printed, so FY2025 has operating and investing cash on both sides and no balance sheet to
divide by. The accrual ratio refuses those two cells and names the reason on the page.

**One fact, three sections, and the document joins none of them.** Printed 36 gives revenue by
client, in the risk factors. Printed 46 gives the share of revenue on contracts of at least seven
years, also a risk factor, offered as evidence of durability. Printed 407 is note 33 to the restated
financial information, which reports revenue from three customers as an amount. The top three
clients equal the audited amount to the paisa in all four filed periods, and that amount over
restated revenue equals the long contract share to the second decimal. Two of the three are written
by the issuer for its own document, so their agreeing proves little; the third sits inside the
accounts the auditor examined, which is a different kind of claim. Both legs are build guards.

**The Sify harvest is now used for a second check, against the prospectus rather than against a
call.** Sify Technologies reports a data centre segment in its 20-F; Sify Infinit Spaces reports its
own revenue in the prospectus. Both describe the same business, neither cites the other, and neither
reconciles the two. Across the three years they overlap the subsidiary reports more than the segment
by 87.79, 87.70 and 87.65 million rupees, while the business grows forty per cent and the reporting
basis changes from standalone to consolidated underneath it. A difference that holds its size
through both is a fixed item on one side of a boundary rather than a measurement drifting from
another. What the item is cannot be named from either document, and is not guessed at here.

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
- **Hyperscaler pledges.** Microsoft 17.5 bn USD over four years announced December 2025, Google 15
  bn over five years for a Visakhapatnam hub whose first phase is stated at 1 GW, AWS 12.7 bn by
  2030 of which 8.3 bn is earmarked for Maharashtra. Company announcements and press reporting, none
  traced to the announcing company's own release. Only the Google figure names a capacity, and the
  sector page draws only that one against the national estate.
- **Cumulative sector commitment.** Nearly 94 bn USD committed to Indian data centres between 2019
  and the third quarter of 2025, per CBRE. Commitments, not capital deployed.
- **The power demand curve.** Data centre electricity demand of about 1 GW today against 13.56 GW by
  2031-32, a Ministry of Power estimate. Not traced to the ministry's own publication, unlike the
  transmission delay dataset in section 4, which was pulled from the ministry directly.
- **Unit economics.** Capital cost of 60 to 70 crore rupees per megawatt per CareEdge, colocation
  EBITDA margins of 40 to 50 per cent stabilising near 43, and power at about 65 per cent of
  operating cost. The capital cost is the only one of these anything derives from: it is what turns
  each capacity forecast into a capital requirement on the sector page.
- **The coverage universe.** Eight operators and a six name watchlist in `data/universe.json`, from
  company announcements, brokerage notes and press reporting. Two rows of the eight claim primary:
  Sify, from the prospectus, and Techno Electric, from the annual report read in section 1c, which
  is also the row that reading corrected.
- **Anant Raj.** 307 MW announced, 28 called operational, 8 handed over, from a Value Research note.
  The annual report has since been opened and it contradicts the second of those figures. See
  section 1b.
- **Netweb.** Order book of Rs 2,507 crore at 30 June 2026, an IndiaAI Mission order of Rs 1,734
  crore awarded September 2025, AI systems at 64 per cent of Q3 FY26 revenue and 48 per cent of
  9M FY26, and about 99 times trailing earnings. No Netweb filing has been opened.

### In the brief, deliberately not yet carried

Because nothing renders them, and a data file with no page is how this project previously lost a
finding: state incentive policies, of which Maharashtra's electricity duty exemption is the most
generous, and the Equinix and Digital Realty valuation multiples that would anchor a valuation panel
this project has not built.

**The IndiaAI Mission is no longer on that list.** The outlay of Rs 10,371 crore, the ten empanelled
providers, the national installed total of more than 17,300 processors by mid 2025 and the single
published offer of 9,216 are carried into `data/macro.json` and rendered on the sector page, tagged
secondary throughout. What is not carried is a per provider installed figure, because none has been
published; the exhibit groups providers by what was reported about them and marks the five with no
public record either way.

**The hyperscaler pledges, the demand curve and the unit economics are no longer on it either.** All
three are in `data/macro.json` and all three are rendered, tagged secondary, and listed above. Three
things about them are worth stating rather than leaving implicit. Two of the three pledges name no
capacity, so only the one that does is set against national live capacity and the other two appear
nowhere in that comparison. Grid demand and built IT load capacity are different measurements, and
the factor between them is a facility efficiency figure this project has not read, so the two are
drawn on one axis for magnitude and never converted. And no exchange rate appears anywhere: the
pledges stay in dollars, the capital requirement stays in rupees, and the government scheme's own
outlay is what the rupee figures are benchmarked against.

---

## Company marks

The logos in `public/logos` are each company's own mark, taken from its website or from Wikimedia
Commons, resized and optimised but not altered. They remain the property of their owners and are
reproduced here to identify the companies analysed. All fourteen covered names now have one; a name
without a mark renders as a drawn monogram instead.

Two of the last four came from Wikimedia Commons, Tata Consultancy Services and Black Box. The other
two are from the companies themselves: RailTel from its own site, and Techno Electric from
`techno.co.in`, which is the address printed in its annual report. That last one is worth recording,
because searching the web for the company name reaches `techno-electric.com` first, and that is a
residential electrical contractor in the United States with a similar name and no connection to the
Indian filer. The annual report settled it.

---

## The honest summary

Four documents read properly, one prospectus and three annual reports, one of the three read
twice. Three companies' calls coded across a defined window. Five filers
harvested. One government dataset. Everything else on this site is a research note figure wearing a
tag that says so.
