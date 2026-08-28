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
  calculation the financials page performs. The company confirmed the method in its own words.
- **A measurement whose limit had to be written down with it.** The published elsewhere dimension
  is coded from what management says on the call, so it can detect a company naming where a figure
  lives and cannot show that a figure is unpublished. Equinix and Digital Realty both publish
  quarterly supplements that a call answer may simply not mention. That limit is stated on the
  page beside the number rather than in a footnote, because without it the second dimension reads
  as an accusation it cannot support.
- **A defect in shipped work, found by tooling rather than by eye.** The first chart palette had
  two hues 10.1 apart on the normal vision scale against a floor of 15. Full colour readers could
  not separate them. Replaced with a validated set and re-checked in both themes.

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
- **Per company pages and compare.** Blocked on the above. One company does not need a company
  page.
- **The prospectus teardown.** Reachable at
  `sebi.gov.in/filings/public-issues/oct-2025/sify-infinit-spaces-limited-drhp_97481.html`, dated
  16 October 2025. Several hundred pages through a markdown converter, so it will arrive in
  sections rather than whole.
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
- **The Indian four.** Netweb, Anant Raj, E2E and Techno Electric. No structured source exists;
  they need Screener exports by hand, which is why they trail the structured set.

## Terminal, not pending

Marked so rather than left looking like work.

- **The private transmission sample will stay at seven projects**, three of them under one parent,
  unless a wider primary source appears. It is enough to raise the question of whether ownership
  predicts delivery and not enough to answer it. Widening it from the National Electricity Plan is
  the only route, and that document is not machine readable.
- **`valuation.ts` stays unwritten** until a market data source is in the repo. A half sourced
  multiple is worse than no multiple.
- **The 188 megawatt discrepancy stays unverified.** Published summaries of the prospectus report
  188.04 MW as built capacity; the October 2025 call describes 188 MW as design capacity of which
  130 MW is built. Paraphrase is the likely explanation. It is recorded on `/prospectus` as an
  open question and stays off the product until the filed document is read. If it does not
  survive, it gets dropped without complaint.
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
