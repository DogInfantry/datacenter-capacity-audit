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

/**
 * The subsidiary's own accounts against the parent's segment note.
 *
 * Sify Infinit Spaces files a prospectus reporting its own revenue. Its parent,
 * Sify Technologies, files a 20-F reporting a data centre segment. Both describe
 * the same business, neither cites the other, and until now this project used
 * the segment note as a stand in for the subsidiary without ever testing whether
 * that substitution held.
 *
 * Both figures are rupees. The prospectus prints millions and the 20-F prints
 * absolute, which is a change of scale inside one currency and is applied here
 * rather than a rate, because there is no rate to apply.
 *
 * What the comparison finds is not a match and not drift. It is a gap of about
 * the same size every year while the business grows by forty per cent, which is
 * the signature of a fixed item sitting inside one boundary and outside the
 * other. Naming that item would need a reconciliation neither document performs,
 * so this reports the gap and stops there.
 */
export type SegmentGap = {
  fy: string;
  /** The subsidiary's own revenue, from its prospectus, in millions. */
  subsidiary: number;
  /** The parent's data centre segment for the same year, rescaled to millions. */
  segment: number;
  gap: number;
  gapPct: number;
  /** Which entity the subsidiary column reports for that year. */
  basis: string;
};

export function subsidiaryAgainstSegment(
  periods: { label: string; revenue: number; stub: boolean; basis: string }[],
  segments: CompanySegment[],
): { rows: SegmentGap[]; meanGap: number; spread: number } {
  const bySegment = new Map(segments.map((s) => [s.fy, s.revenue / 1e6]));

  const rows = periods
    .filter((p) => !p.stub && bySegment.has(p.label))
    .map((p) => {
      const segment = bySegment.get(p.label)!;
      const gap = p.revenue - segment;
      return {
        fy: p.label,
        subsidiary: p.revenue,
        segment,
        gap,
        gapPct: (gap / p.revenue) * 100,
        basis: p.basis,
      };
    });

  const gaps = rows.map((r) => r.gap);
  const meanGap = gaps.reduce((t, g) => t + g, 0) / gaps.length;
  return { rows, meanGap, spread: Math.max(...gaps) - Math.min(...gaps) };
}
