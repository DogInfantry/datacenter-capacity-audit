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
- **A defect in shipped work, found by tooling rather than by eye.** The first chart palette had
  two hues 10.1 apart on the normal vision scale against a floor of 15. Full colour readers could
  not separate them. Replaced with a validated set and re-checked in both themes.

## Open, and what unblocks it

- **Seven companies harvested.** Infosys, Wipro, Equinix, Digital Realty, Nebius, Applied Digital
  and Core Scientific are confirmed present with a decade of filings. Unblocked by nothing except
  the work: roughly seven MCP calls each into `data/companies/<ticker>.json`.
- **Per company pages and compare.** Blocked on the above. One company does not need a company
  page.
- **The prospectus teardown.** Reachable at
  `sebi.gov.in/filings/public-issues/oct-2025/sify-infinit-spaces-limited-drhp_97481.html`, dated
  16 October 2025. Several hundred pages through a markdown converter, so it will arrive in
  sections rather than whole.
- **`cashQuality.ts` and `concentration.ts`.** Both need PAT and total assets, which are available
  and simply not yet pulled. Concentration is the more interesting of the two: Sify discloses a
  single customer revenue line running 2017 to 2026.
- **Disclosure rates with an honest denominator.** Needs the quarter partitioned harvest across
  the peers. Until then the site shows exemplars and says so, rather than quoting a rate computed
  from a keyword search, which would be biased by the keywords.
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
- **Screener data stays manual.** Terms of service permit export, not scraping.
