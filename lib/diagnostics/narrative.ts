import type { CompanyFinancials, CompanySegment } from "@/lib/schema";

/**
 * Does the story show up in the accounts?
 *
 * A company can say data centres are its future for years without the segment
 * moving. This is the cheapest honest test of that: the segment's share of
 * group revenue, year by year. It is deliberately not a score. A rising share
 * is evidence the pivot is real; it says nothing about whether it is wise.
 */
export function segmentShare(
  financials: CompanyFinancials[],
  segments: CompanySegment[],
) {
  const byFy = new Map(financials.map((f) => [f.fy, f]));
  return segments
    .filter((s) => byFy.has(s.fy))
    .map((s) => ({
      fy: s.fy,
      segmentRevenue: s.revenue,
      groupRevenue: byFy.get(s.fy)!.revenue,
      share: s.revenue / byFy.get(s.fy)!.revenue,
    }));
}
