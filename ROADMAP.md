# Roadmap

What is deliberately unfinished, and why. Nothing here is a placeholder.

## Cleared, and how

Recorded with the finding each one produced, because a tick is not a result.

- **The transmission base rate.** `pipeline/ists_base_rate.py`. The Ministry of Power tables its
  own late projects with an explicit delay column, so the slippage is not an estimate. Median 7
  months, cost weighted 13.7, ninetieth percentile 32. The cost weighting is the finding: large
  projects slip roughly twice as hard as the median, and a gigawatt campus interconnects through a
  large project.
- **The ownership split.** Power Grid cost weights at 8.7 months against 21.5 for private
  transmission developers. The pipeline self check asserts this gap holds, so a refresh that
  inverts it fails the build instead of leaving a stale sentence on the page.
- **The capacity ladder.** Sify said 100 MW would go live in eighteen months, then 124 MW in
  twelve. Operational capacity ran 100 MW in October 2022 to about 120 MW in January 2025. Roughly
  30 MW delivered against 124 promised, every figure a verbatim quote.
- **The two dimensional refusal measure.** The first version assumed Indian operators refuse where
  global peers disclose. They do not: Digital Realty declined on cost per megawatt and Equinix
  declined on revenue attribution. What separates them is where the answer lives, so a refusal now
  counts only when the figure is published nowhere. That correction came from probing the peers
  before writing the page, and it made the measure defensible rather than merely pointed.
- **The funding gap.** Capex exceeded operating cash flow in every year from FY2022 to FY2026, by
  about Rs 2,047 crore cumulatively. The fresh issue in the draft prospectus is Rs 2,500 crore.
  Neither document says the listing is a funding requirement. Holding them together does.
- **Revenue per megawatt, computed.** Declined twice on calls, but derivable from segment revenue
  in the 20-F over contracted capacity from the calls. About Rs 1.1 crore per megawatt per month,
  reported as a range, bracketing an independent reference of roughly Rs 0.9 crore. The point is
  that the refused figure was public arithmetic all along.
- **A result that cut the other way, kept for that reason.** The data centre share of Sify group
  revenue rose from 23 to 39 per cent, so the stated pivot is real in the accounts. A project that
  only ever finds companies wanting is editorialising rather than measuring.
- **The harvest method, checked against something outside the project.** Every margin here was
  computed by us and confirmed by nobody until Equinix and Digital Realty were harvested for that
  purpose. Rebuilding Equinix's own definition of adjusted EBITDA from its own filings gives 49.65
  per cent for the second quarter of 2025 against the 50 per cent its chief executive stated on
  the call, and 47.69 per cent for FY2025 against 49 per cent guided. Tolerances of 150 basis
  points against an actual and 250 against a guide were written down before the check was run, and
  both are asserted in the test suite, so a future harvest that drifts fails the build rather than
  leaving a confident number on a page. The finding is not that the number matched. It is that the
  method now has a way of being wrong that would be noticed.
- **A check that failed, kept because failing is what it was for.** The same method applied to
  Digital Realty cannot be completed at all. Its share based compensation is tagged in shares
  rather than dollars, its impairment concept stops at 2022 and its transaction costs are never
  tagged, so the add backs that would reconcile it do not exist in the source. The derived margin
  matches the guided band in FY2018 at 57.0 per cent and then walks away to 40.5 per cent by
  FY2023 against 49.3 implied by the company's own guidance. What that establishes is narrower and
  more useful than a clean pass: the method is sound where a filer tags its income statement
  completely, and it degrades exactly where untagged non-GAAP adjustments grow. Those years are
  marked UNVERIFIED and kept out of every cross company margin claim.
- **The disclosure register became a rate, and the rate went the wrong way.** Refusals were five
  hand coded examples from one company. They are now measured across three, over the same two
  topic families and the same window, with complete denominators: Sify refused 2 of 15 questions
  on unit economics, Equinix 9 of 20, Digital Realty 9 of 34. The Indian operator refuses least
  and the largest global operator refuses most, which is the second time this project has gone
  looking for an Indian disclosure gap and found the opposite. The rate alone would still mislead,
  because Sify is asked 0.43 unit economics questions a call against Digital Realty's 0.81, so the
  denominator stays on the page. The single sharpest instance also runs against the thesis: asked
  for realization per megawatt, Sify declined and then described the reverse working, which is the
  calculation this project performs in `revenuePerMW`. The company confirmed the method in its own
  words. That page has since been deleted, but the diagnostic and its denominator survive it.
- **A measurement whose limit had to be written down with it.** The published elsewhere dimension
  is coded from what management says on the call, so it can detect a company naming where a figure
  lives and cannot show that a figure is unpublished. Equinix and Digital Realty both publish
  quarterly supplements that a call answer may simply not mention. That limit is stated on the
  page beside the number rather than in a footnote, because without it the second dimension reads
  as an accusation it cannot support.
- **A defect in shipped work, found by tooling rather than by eye.** The first chart palette had
  two hues 10.1 apart on the normal vision scale against a floor of 15. Full colour readers could
  not separate them. Replaced with a validated set and re-checked in both themes.

- **The drift, caught and reversed.** This project began as the brief's eighteen name coverage
  product, narrowed over several sessions into a single company teardown, and was pulled back on
  2026-08-30. It was not caught by a review. It was caught by a symptom: a data file holding Anant
  Raj at 21 MW live against 307 announced was rendering on no page at all, because its only page
  had been deleted. The coverage universe and matrix were restored the same day and the four routes
  from the abandoned direction were removed. The full log is published on `/methodology`, because
  the failure mode is the instructive part: every step toward the narrow version was a reasonable
  answer to the last instruction.
- **Three deep dives, three different units.** Sify from a filed prospectus cited by printed page,
  Anant Raj on delivery where announced and operational and handed over are three separate numbers,
  and Netweb on an order book because it manufactures servers and owns no estate. The third is
  deliberately absent from the two by two rather than forced onto it, since an order book and a
  megawatt do not belong on the same axes. That completes the brief's own Recommendation 1.
- **The invariant register, checked against the code.** Thirty build guards are published on
  `/methodology` with what each protects and the message it emits. Three tests assert that every
  documented fragment still exists in the schema source, that each identifies exactly one guard,
  and that the count in the source equals the count documented. The mechanism caught its own author
  during the session that built it: a new guard on the limits list failed the count test
  immediately, which is why the thirtieth row exists.

## Open, and what unblocks it

- **Three companies left to harvest.** Infosys, Wipro, Equinix and Digital Realty are in. Nebius,
  Applied Digital and Core Scientific are confirmed present with a decade of filings. Unblocked by
  nothing except the work, and each should now be put through `reconcileMargin` before its margins
  are trusted, which is a check that did not exist when the first three were harvested.
- **The Equinix reconstruction on charge years.** FY2024 rebuilds to 43.4 per cent against a
  company reporting close to 48, because the fourth quarter carried a charge and the only add back
  harvested was stock compensation. `Asset impairment charges` is present as a quarterly series
  2016 to 2026 and would close most of the gap. FY2016 and FY2017 already have their stated
  margins in the doc and could be checked as well, but they also need annual operating income,
  which the store does not carry before 2020.
- **The comparison tool.** Three company pages now exist, so the objection that one company does
  not need a company page has expired. A `/compare` route picking two to four names is the brief's
  remaining product surface, and it is blocked on something real: the three covered names are
  measured on three different units, so a side by side table would either compare megawatts against
  an order book or leave most cells empty. It waits on a fourth and fifth name that share a unit
  with an existing one.
- **The six pillar forensic scorecard.** In the brief, never built, and deliberately not faked. No
  scoring engine exists in this repository; the two by two plots two stated figures against each
  other so a reader can argue with a source rather than with a hidden weighting. Building it needs
  cash flow and balance sheet data for more than one name, which is the same blocker as below.
- **The rest of the prospectus teardown.** The document is read and partly extracted: the offer,
  the objects and deployment schedule, and the capacity definitions, each cited by printed page.
  Still to extract, with the page map already recorded in
  `data/raw/prospectus/drhp_extracts.json`: the restated financial information for the standalone
  entity at printed 349, related party transactions inside its notes, customer concentration, and
  outstanding litigation at printed 463. The standalone accounts are the valuable one, because
  they turn the Sify Technologies segment note into something checkable rather than assumed.
- **`cashQuality.ts` and `concentration.ts`.** Both need PAT and total assets, which are available
  and simply not yet pulled. Concentration is the more interesting of the two: Sify discloses a
  single customer revenue line running 2017 to 2026.
- **Disclosure rates beyond the two unit economics families.** The register measures pricing
  mechanics and cost margin bridge, chosen so that every published rate rests on topics that are
  unambiguously unit economics. Capacity milestone and capital allocation were pulled during the
  same session and their windowed counts are known to be complete, but they were not written to
  Layer 0 and so are not in the repo. Adding them costs six calls and is first a decision about
  what the measure is for: capacity and funding questions are adjacent to unit economics rather
  than the same thing, and mixing them in would widen the denominator without sharpening the
  claim.
- **The Indian four.** Netweb and Anant Raj now have pages, but built from research note figures
  rather than statements: capacity and delivery for one, order book and revenue mix for the other,
  with no margin, no cash flow and no client table on either. Both pages list what was not read
  rather than hiding it. E2E and Techno Electric have nothing yet. All four still need Screener
  exports by hand, because no structured source exists, which is why they trail the structured set.

## Terminal, not pending

Marked so rather than left looking like work.

- **The private transmission sample will stay at seven projects**, three of them under one parent,
  unless a wider primary source appears. It is enough to raise the question of whether ownership
  predicts delivery and not enough to answer it. Widening it from the National Electricity Plan is
  the only route, and that document is not machine readable.
- **`valuation.ts` stays unwritten** until a market data source is in the repo. A half sourced
  multiple is worse than no multiple.
- **The 188 megawatt question is closed, and paraphrase was not the explanation.** It was carried
  as an open question on the assumption that a summary had garbled a term. The filed document says
  otherwise. The prospectus defines built capacity as "the maximum IT load a data center is
  engineered to support", calculated from "present design specifications" and "total planned
  electrical load", and reports 188.04 MW under that word. Installed capacity, meaning equipped
  and commissioned, is 131.88 MW. Operational capacity, meaning sold to customers, is 113.67 MW.
  Eleven days after the prospectus was dated, the same estate was described on an earnings call as
  188 MW of design capacity of which 130 is built. The call used the ordinary meanings. The filed
  document moved the words one rung up, and the headline figure is 65 per cent larger than the
  estate earning revenue. Every figure cites its printed page.
- **Peer segmentation will never be like for like.** Equinix and Digital Realty are pure plays, so
  group equals segment. Infosys and Wipro segment by industry vertical, not by AI. The narrative
  test therefore measures something weaker for the services names than for Sify, and that is a
  property of what companies disclose rather than a gap to close.
- **Digital Realty's margin stays unreconciled from FY2023.** Not for want of trying and not
  pending more work. The three add backs needed are absent from the source: share based
  compensation is tagged in shares rather than dollars, impairment stops at 2022, transaction
  costs are never tagged. The company does publish its adjusted EBITDA, in a quarterly supplemental
  that carries no machine readable tagging, so the figure is public and out of reach at the same
  time. Reading that supplemental by hand would fix one company and teach nothing, which is why it
  is marked terminal rather than queued. The years are labelled UNVERIFIED and excluded from
  comparison, and the gap is shown on the page with its cause named.
- **Screener data stays manual.** Terms of service permit export, not scraping.
