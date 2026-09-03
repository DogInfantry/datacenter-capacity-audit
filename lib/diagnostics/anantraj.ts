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
/**
 * The struck off list, sized and split by the report's own relationship column.
 *
 * Note 45 sits four notes after the related party disclosures, and four of its
 * eleven rows are related parties, so the natural reading is that this is a
 * related party problem. The arithmetic says otherwise: one row is larger than
 * the rest of the list put together by two orders of magnitude, and the report
 * classifies that counterparty as Others.
 *
 * Receivables and payables are kept apart rather than netted. Money owed to a
 * company struck off the register and money owed by it are not the same
 * exposure, and a net figure would hide the larger one behind the smaller.
 */
export function struckOff(d: AnantRaj) {
  const rows = [...d.governance.struckOff.rows].sort((a, b) => b.amountLakh - a.amountLakh);
  const receivable = rows.filter((r) => r.kind === "RECEIVABLE");
  const payable = rows.filter((r) => r.kind === "PAYABLE");
  const sum = (rs: typeof rows) => rs.reduce((t, r) => t + r.amountLakh, 0);
  const receivableLakh = sum(receivable);
  const largest = rows[0];
  return {
    rows,
    receivable,
    payable,
    receivableLakh,
    payableLakh: sum(payable),
    relatedCount: rows.filter((r) => r.relationship === "RELATED_PARTY").length,
    count: rows.length,
    largest,
    /** What the single largest row is of everything receivable from this list.
     *  The number the page leads on, because it is what makes the other rows a
     *  rounding error rather than the story. */
    largestShareOfReceivablePct: (largest.amountLakh / receivableLakh) * 100,
    /** Unchanged balances are the second finding. A receivable from a company
     *  struck off the register that has not moved in a year is not being
     *  collected. */
    unchanged: rows.filter((r) => r.amountLakh === r.amountPriorLakh).length,
    page: d.governance.struckOff.source.page,
  };
}

/**
 * Related party lending, and the one row that does not roll forward.
 *
 * The report prints a transactions table and a balances table on facing pages.
 * For lending to relatives of key management they behave as a reader would
 * expect: the balance rises by roughly what was granted, less what came back.
 * For lending to associates the balance at the close equals the amount granted
 * during the year exactly, while the balance a year earlier was not nil and no
 * repayment from associates is printed for the period.
 *
 * The gap is reported rather than explained. An associate leaving the perimeter
 * would account for it, and so would a presentational choice in either table,
 * and the report says neither.
 */
export function relatedPartyLending(d: AnantRaj) {
  return d.governance.relatedParty.lending.map((l) => {
    const expected = l.outstandingPriorLakh + l.grantedLakh;
    return {
      ...l,
      /** Times larger the closing balance is than the one before it. */
      growth: l.outstandingPriorLakh > 0 ? l.outstandingLakh / l.outstandingPriorLakh : null,
      expected,
      gap: expected - l.outstandingLakh,
      rollsForward: Math.abs(expected - l.outstandingLakh) < 0.01,
    };
  });
}

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
