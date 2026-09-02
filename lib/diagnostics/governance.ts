import type { Sisl } from "@/lib/schema";

/**
 * Governance, read out of the legal section rather than out of a rating.
 *
 * The useful question a prospectus can be made to answer is not whether its
 * litigation looks bad. It is how large a matter has to be before the issuer is
 * obliged to mention it, and how the matters it does mention reached it.
 *
 * The first has an exact answer that the document never prints. The policy is
 * published as a formula over three figures that live in the financial
 * statements, so the threshold is computed here from the issuer's own numbers
 * and is primary in the same sense every other figure on that page is.
 */

export type ThresholdTest = {
  label: string;
  /** The figure the test is taken over, and its value. */
  basis: string;
  basisValue: number;
  value: number;
  binding: boolean;
};

/**
 * The disclosure threshold, and which of the three tests sets it.
 *
 * The policy takes the lower of the three, so the binding test is the one that
 * decides what a reader is told about. Every figure is the issuer's own, from
 * the last full year in the restated statements.
 */
export function materialityThreshold(d: Sisl) {
  const full = d.periods.filter((p) => !p.stub);
  const latest = full[full.length - 1];
  const sheet = d.balanceSheet.find((b) => b.label === latest.label)!;
  const window = full.slice(-3);
  const avgAbsPat = window.reduce((t, p) => t + Math.abs(p.pat), 0) / window.length;

  const basisValue: Record<string, number> = {
    NET_WORTH: sheet.netWorth,
    REVENUE: latest.revenue,
    AVG_ABS_PAT_3: avgAbsPat,
  };

  const raw = d.governance.materiality.tests.map((t) => ({
    label: t.label,
    basis: t.basis,
    basisValue: basisValue[t.basis],
    value: t.rate * basisValue[t.basis],
  }));
  const threshold = Math.min(...raw.map((r) => r.value));
  const tests: ThresholdTest[] = raw.map((r) => ({ ...r, binding: r.value === threshold }));
  const binding = tests.find((t) => t.binding)!;

  return {
    tests,
    binding,
    threshold,
    /** How far the binding test sits below the next one up. The gap is the
     *  point: the bar is set by the smallest of three and moves if earnings do. */
    nextUp: Math.min(...raw.filter((r) => r.value !== threshold).map((r) => r.value)),
    shareOfRevenuePct: (threshold / latest.revenue) * 100,
    period: latest.label,
    window: window.map((p) => p.label),
    page: d.governance.materiality.source.page,
  };
}

/**
 * How the disclosed matters reached the issuer, and how they size against the
 * bar it set for itself.
 *
 * Two of the entries in this section say in the issuer's own words that it was
 * never served, and names the public database it used instead. One of those
 * cannot be quantified at all, which means the largest number in the section is
 * not necessarily the largest exposure in it.
 */
export function disclosureReach(d: Sisl) {
  const { threshold } = materialityThreshold(d);
  const unservedCount = d.governance.unserved.reduce((t, u) => t + u.count, 0);
  const largest = [...d.governance.quantified].sort((a, b) => b.amountMn - a.amountMn)[0];
  return {
    unserved: d.governance.unserved,
    unservedCount,
    largest,
    /** The largest quantified matter against the bar for disclosing anything. */
    largestOverThreshold: largest.amountMn / threshold,
    threshold,
  };
}
