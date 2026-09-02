/**
 * Thresholds, in one place.
 *
 * The methodology page publishes these and the diagnostics apply them. A band
 * written into a component would let the rule a reader is shown drift away from
 * the rule the page actually used, which is the quietest way for a scorecard to
 * become dishonest.
 *
 * The numbers are the brief's rather than this project's, and are stated here
 * with the brief's own reasoning attached so that disagreeing with a grade means
 * disagreeing with a published threshold rather than with a hidden weighting.
 */

/** Cash conversion, the brief's second pillar. */
export const CASH_CONVERSION = {
  /**
   * Operating cash against profit after tax. Below one, reported profit is not
   * arriving as cash. The brief calls persistent readings under 0.8 worth a
   * flag and treats under 0.5 as serious.
   */
  cfoToPat: { amberBelow: 0.8, redBelow: 0.5 },
  /**
   * The Sloan accrual ratio, net income less operating cash less investing
   * cash, over total assets. The brief puts the danger line at plus or minus
   * 25 per cent.
   *
   * It carries a caveat this project measured rather than assumed: the
   * numerator nets investing cash back in, so for an operator part way through
   * building an estate the ratio moves with the size of the build rather than
   * with the quality of the earnings. Both readings are published for that
   * reason, and neither is called the verdict.
   */
  accrualRatio: { redOutside: 0.25 },
  /**
   * How many metrics have to resolve before a pillar reports a combined view.
   * Below this it reports the metrics it has and refuses the combination,
   * because averaging over an absence turns a gap into a grade.
   */
  minimumMetricsForCombined: 2,
} as const;

export type Band = "GREEN" | "AMBER" | "RED" | "REFUSED";
