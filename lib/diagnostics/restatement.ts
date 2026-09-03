import type { CompanyDoc } from "@/lib/schema";

/**
 * How much of what a filer published it later went back and changed.
 *
 * The measure is deliberately a rate over a visible denominator rather than a
 * count. A count would put the two filers with the most concepts harvested at
 * the top for a reason that has nothing to do with their accounts, and a rate
 * on its own would do the reverse: the filer asked for three concepts over six
 * years has eighteen chances to restate and the one asked for nine over eight
 * has seventy six. Neither number means anything without the other, which is
 * why the page draws the denominator as the length of the bar.
 *
 * This is the same correction the disclosure register needed. There, the
 * company refusing least turned out to be the one asked least.
 */
export function restatementRates(companies: CompanyDoc[]) {
  const rows = companies.map((c) => {
    const r = c.restatements;
    const periods = [...new Set(r.rows.map((x) => x.period))].sort();
    const concepts = [...new Set(r.rows.map((x) => x.concept))].sort();
    return {
      ticker: c.ticker,
      name: c.name,
      points: r.annualPoints,
      conceptsHarvested: r.concepts,
      restated: r.rows.length,
      ratePct: (r.rows.length / r.annualPoints) * 100,
      periods,
      conceptsRestated: concepts,
      rows: r.rows,
      page: r.source.label,
    };
  });
  const maxPoints = Math.max(...rows.map((r) => r.points));
  const withShare = rows.map((r) => ({ ...r, trackPct: (r.points / maxPoints) * 100 }));
  const restating = withShare.filter((r) => r.restated > 0);
  return {
    rows: [...withShare].sort((a, b) => b.ratePct - a.ratePct || b.points - a.points),
    maxPoints,
    restatingCount: restating.length,
    cleanCount: withShare.length - restating.length,
    totalPoints: rows.reduce((t, r) => t + r.points, 0),
    totalRestated: rows.reduce((t, r) => t + r.restated, 0),
    /** The filer with the most harvested points, which is the one a count alone
     *  would put at the top. */
    largestDenominator: [...withShare].sort((a, b) => b.points - a.points)[0],
  };
}
