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

/**
 * Cash conversion, and the single line that decides it.
 *
 * Capital expenditure is the four lines the investing section prints, summed
 * rather than taken from a total the statement never strikes. Operating cash
 * flow is returned twice: as the statement files it, and again with the
 * movement in current borrowings taken back out of it.
 *
 * That movement is a financing item sitting among the working capital
 * adjustments, and the repayment of borrowings is printed again in the finance
 * section on the next page. Both readings are the report's own arithmetic on
 * the report's own figures; neither is an adjustment invented here, which is
 * why both are returned and neither is called the right one.
 *
 * Lakhs of rupees throughout, the unit the statements print. Nothing rescaled
 * and nothing converted.
 */
export function cashConversion(fin: AnantRaj["financials"]) {
  const cf = fin.cashFlow;
  const capexLines = [
    { label: "Acquisition of property, plant and equipment", amount: cf.acquisitionOfPropertyPlantAndEquipment },
    { label: "Acquisition of investment property", amount: cf.acquisitionOfInvestmentProperty },
    { label: "Capital work in progress", amount: cf.additionsToCapitalWorkInProgress },
    { label: "Right to use assets", amount: cf.additionsToRightOfUse },
  ];
  const capex = capexLines.reduce((t, l) => t + l.amount, 0);
  const filed = cf.netCashFromOperations;
  // The line is stored as an outflow, so taking it out of the section adds it
  // back to the cash the section reports.
  const restated = filed - cf.currentBorrowingsInsideOperating;

  return {
    capexLines,
    capex,
    filed,
    restated,
    coverFiled: capex / filed,
    coverRestated: capex / restated,
    /** The same category of item, as each section prints it. */
    operating: {
      printedAs: cf.currentBorrowingsInsideOperatingPrintedAs,
      amount: cf.currentBorrowingsInsideOperating,
      prior: cf.currentBorrowingsInsideOperatingPrior,
      page: cf.source.page,
      section: "Operating activities",
    },
    financing: {
      printedAs: cf.financingRepaymentOfBorrowings.printedAs,
      amount: cf.financingRepaymentOfBorrowings.amount,
      prior: cf.financingRepaymentOfBorrowings.amountPrior,
      page: cf.financingRepaymentOfBorrowings.source.page,
      section: "Finance activities",
    },
  };
}
