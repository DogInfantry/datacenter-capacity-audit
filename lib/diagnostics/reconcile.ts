import type { CompanySegment, StatedMargin } from "@/lib/schema";

/**
 * The first external check this project has had.
 *
 * Every margin on this site until now was computed by us from filings and
 * checked against nothing outside the repo. Equinix and Digital Realty both
 * state an adjusted EBITDA margin out loud, so they can be used to ask whether
 * the harvest reads a filing the way the company that filed it does.
 *
 * The measure is non-GAAP and appears in no metric class of the filings store
 * for either company, so the reference comes from the earnings call, verbatim
 * and dated. What is rebuilt here is the company's own definition:
 *
 *   adjusted EBITDA = operating income + depreciation + add backs
 *
 * where the add backs are stock compensation and any tagged one off charges.
 * Since segment opex is stored excluding depreciation, revenue less opex is
 * already operating income plus depreciation, and only the add backs remain.
 */

export type Verdict = "PASS" | "FAIL" | "NOT_RECONCILABLE";

export type Reconciliation = {
  label: string;
  revenue: number;
  /** Before the non-GAAP add backs. Always computable, always a floor. */
  derivedMargin: number;
  /** After them. Null when the add backs could not be built. */
  reconstructedMargin: number | null;
  statedMargin: number | null;
  toleranceBp: number;
  deltaBp: number | null;
  verdict: Verdict;
};

/**
 * Fixed before the check was run, so that the outcome could not be
 * rationalised afterwards. Guidance is a band rather than a point, so it earns
 * the wider of the two.
 */
export const TOLERANCE_ACTUAL_BP = 150;
export const TOLERANCE_GUIDE_BP = 250;

/**
 * Reconcile one period against what management said about it.
 *
 * `addBacks` undefined is not the same as zero and must never be treated as
 * zero: a filer that does not tag its stock compensation has not told us it
 * pays none. That case returns NOT_RECONCILABLE, on the same principle as
 * `assertSameSign`, which fails loudly rather than flipping a margin quietly.
 */
export function reconcileMargin(input: {
  label: string;
  revenue: number;
  /** Operating expenses with depreciation already removed. */
  opexExDepreciation: number;
  addBacks?: number;
  stated?: { value: number; isActual: boolean } | null;
}): Reconciliation {
  const { label, revenue, opexExDepreciation, addBacks, stated } = input;
  const opex = Math.abs(opexExDepreciation);
  const ebitda = revenue - opex;
  const derivedMargin = ebitda / revenue;

  const reconstructedMargin =
    addBacks === undefined ? null : (ebitda + addBacks) / revenue;

  const statedMargin = stated ? stated.value / 100 : null;
  const toleranceBp =
    stated && !stated.isActual ? TOLERANCE_GUIDE_BP : TOLERANCE_ACTUAL_BP;

  if (reconstructedMargin === null || statedMargin === null) {
    return {
      label,
      revenue,
      derivedMargin,
      reconstructedMargin,
      statedMargin,
      toleranceBp,
      deltaBp: null,
      verdict: "NOT_RECONCILABLE",
    };
  }

  const deltaBp = (reconstructedMargin - statedMargin) * 10000;
  return {
    label,
    revenue,
    derivedMargin,
    reconstructedMargin,
    statedMargin,
    toleranceBp,
    deltaBp,
    verdict: Math.abs(deltaBp) <= toleranceBp ? "PASS" : "FAIL",
  };
}

/** The same check driven off a stored segment row. */
export function reconcileSegment(
  seg: CompanySegment,
  stated?: StatedMargin | null,
): Reconciliation {
  return reconcileMargin({
    label: seg.fy,
    revenue: seg.revenue,
    opexExDepreciation: seg.opex,
    addBacks: seg.nonGaapAddBacks,
    stated: stated ? { value: stated.value, isActual: stated.isActual } : null,
  });
}

/**
 * Match a stated margin to a fiscal year.
 *
 * Both of these filers close on 31 December, so the fiscal label and the
 * calendar year of the period end agree. Quarterly statements are skipped
 * here: they are checked directly in the tests, against the quarter's own
 * figures, because a quarter cannot be compared with an annual row.
 */
export function statedForFy(
  statedMargins: StatedMargin[],
  fy: string,
): StatedMargin | null {
  const year = fy.replace("FY", "");
  return (
    statedMargins.find((s) => s.period === fy || s.periodEnd === `${year}-12-31`) ??
    null
  );
}
