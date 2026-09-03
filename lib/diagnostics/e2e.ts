import type { E2E } from "@/lib/schema";

/**
 * The two questions a report with no capacity figure can still be asked.
 *
 * Both come out of figures the company prints itself, and both cut against the
 * headline it leads with. Neither needs a megawatt.
 */

/** Lakh to crore. A change of scale inside one currency, and the only reason it
 *  is needed is that the report gives its revenue in lakh and its recurring
 *  revenue in crore, two pages apart. */
const lakhToCrore = (lakh: number) => lakh / 100;

/**
 * Growth quality: what the year reported against what it ended at.
 *
 * A company can report a year up seventy three per cent and leave it at a run
 * rate below that year's own average, if the growth happened early and stopped.
 * The monthly recurring revenue is the only operating rate this filer
 * publishes, so annualising it is the only way to ask where the year finished.
 *
 * Twelve times a month is a run rate, not a forecast, and the page says so. The
 * point is not what next year will be. It is that the exit rate and the reported
 * growth describe the same year and disagree about it.
 */
export function growthQuality(d: E2E) {
  const p = d.performance;
  const revenueCrore = lakhToCrore(p.revenueLakh);
  const exitAnnualised = d.recurring.monthlyCrore * 12;
  return {
    revenueCrore,
    priorCrore: lakhToCrore(p.revenueLakhPrior),
    reportedGrowthPct: ((p.revenueLakh - p.revenueLakhPrior) / p.revenueLakhPrior) * 100,
    exitAnnualised,
    exitGrowthPct:
      ((d.recurring.monthlyCrore - d.recurring.monthlyCrorePrior) / d.recurring.monthlyCrorePrior) *
      100,
    /** How far below the year just reported the exit rate annualises. Negative
     *  would mean the year ended above its own average, the ordinary shape for a
     *  growing company, and it is what the build guard watches for. */
    shortfallCrore: revenueCrore - exitAnnualised,
    shortfallPct: ((revenueCrore - exitAnnualised) / revenueCrore) * 100,
    priorExitAnnualised: d.recurring.monthlyCrorePrior * 12,
    page: d.recurring.page,
    quote: d.recurring.quote,
  };
}

/**
 * Earnings quality: how much of the profit the operations produced.
 *
 * Built from the report's own summary rather than from a definition of our own.
 * Earnings before interest, tax and depreciation, less depreciation and finance
 * costs, is what the business made before tax. Everything between that and the
 * printed profit before tax is other income, and the report never says what it
 * is.
 */
export function earningsQuality(d: E2E) {
  const p = d.performance;
  const operating = p.ebitdaLakh - p.depreciationLakh - p.financeCostsLakh;
  return {
    operatingLakh: operating,
    otherIncomeLakh: p.otherIncomeLakh,
    otherIncomeLakhPrior: p.otherIncomeLakhPrior,
    profitBeforeTaxLakh: p.profitBeforeTaxLakh,
    depreciationLakh: p.depreciationLakh,
    ebitdaLakh: p.ebitdaLakh,
    /** Times the operating result that other income represents. Above one means
     *  more of the pre-tax profit arrived from outside the business than from
     *  it. Null on a non-positive operating result, where the ratio would
     *  change sign without the composition changing. */
    otherOverOperating: operating > 0 ? p.otherIncomeLakh / operating : null,
    otherShareOfPbtPct: (p.otherIncomeLakh / p.profitBeforeTaxLakh) * 100,
    pages: p.pages,
  };
}
