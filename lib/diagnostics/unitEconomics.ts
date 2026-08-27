import type { CompanySegment } from "@/lib/schema";

export type SegmentYear = {
  fy: string;
  revenue: number;
  opex: number;
  margin: number;
  depreciation?: number;
  ebitMargin?: number;
};

/**
 * Segment margin by year.
 *
 * Opex is taken as an absolute value because the filings are not consistent
 * about its sign: one period is filed negative while every other is positive.
 * The magnitudes agree, so normalising the sign is safe, but doing it silently
 * is not, which is why `assertSameSign` exists and is called on ingest.
 */
export function segmentMargins(rows: CompanySegment[]): SegmentYear[] {
  return rows.map((r) => {
    const opex = Math.abs(r.opex);
    const margin = (r.revenue - opex) / r.revenue;
    return {
      fy: r.fy,
      revenue: r.revenue,
      opex,
      margin,
      depreciation: r.depreciation,
      ebitMargin:
        r.depreciation !== undefined
          ? (r.revenue - opex - r.depreciation) / r.revenue
          : undefined,
    };
  });
}

/**
 * The number management declined to give.
 *
 * Revenue per megawatt is not disclosed, but it is the quotient of two figures
 * the company does disclose: segment revenue in the 20-F and contracted
 * capacity on the call. Contracted is the correct denominator, since design and
 * commissioned capacity include megawatts nobody is paying for.
 *
 * Capacity moves during a year, so this returns a range built from the opening
 * and closing denominators rather than a single figure implying a precision the
 * inputs do not carry.
 */
export function revenuePerMW(
  segmentRevenue: number,
  contractedMwOpen: number,
  contractedMwClose: number,
) {
  if (contractedMwOpen <= 0 || contractedMwClose <= 0) return null;
  const perYear = (mw: number) => segmentRevenue / mw;
  const hi = perYear(Math.min(contractedMwOpen, contractedMwClose));
  const lo = perYear(Math.max(contractedMwOpen, contractedMwClose));
  return {
    lowPerYear: lo,
    highPerYear: hi,
    lowPerMonth: lo / 12,
    highPerMonth: hi / 12,
    denominator: "contracted MW, opening and closing",
  };
}

/** Fails loudly rather than silently flipping a margin. */
export function assertSameSign(rows: CompanySegment[]) {
  const signs = new Set(rows.map((r) => Math.sign(r.opex)).filter((s) => s !== 0));
  return { consistent: signs.size <= 1, signs: [...signs] };
}
