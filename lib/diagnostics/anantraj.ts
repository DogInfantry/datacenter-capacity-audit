import type { AnantRaj } from "@/lib/schema";

/**
 * The data centre arm, set against the group that owns it.
 *
 * The capacity ladder at the top of this company's page belongs to one
 * subsidiary. The group reports a single segment and it is real estate
 * development, so no data centre revenue, margin or asset line appears anywhere
 * in the consolidated income statement. What does exist is that subsidiary's
 * own column in the statement of subsidiaries, and the same company again in
 * the consolidated entity table, and the two agree to the paisa.
 *
 * Everything stays in lakhs of rupees, the unit the statements print. Nothing
 * here is rebased, rescaled or converted.
 */
export function dataCentreArm(fin: AnantRaj["financials"]) {
  const arm = fin.dataCentreArm;
  const pl = fin.profitAndLoss;

  return {
    entity: arm.entity,
    holdingPct: arm.holdingPct,
    turnover: arm.turnover,
    groupRevenue: pl.revenue,
    /** The figure the exhibit is built on. */
    turnoverSharePct: (arm.turnover / pl.revenue) * 100,
    restOfGroupRevenue: pl.revenue - arm.turnover,
    pat: arm.profitAfterTax,
    groupPat: pl.profitAfterTax,
    /** Share capital plus reserves, which the schema asserts equals both the
     *  subsidiary's own assets less liabilities and the consolidated table's
     *  figure for the same company. */
    netAssets: arm.shareCapital + arm.reservesAndSurplus,
    totalAssets: arm.totalAssets,
    totalLiabilities: arm.totalLiabilities,
    /** Both pages that print this subsidiary, so each can be cited. */
    subsidiaryPage: arm.source.page,
    groupTablePage: arm.groupShare.source.page,
    segmentPage: fin.segment.source.page,
  };
}
