type ObjectRow = {
  object: string;
  totalEstimatedCost: number;
  deployed: number;
  fromNetProceeds: number;
  fromBorrowings: number;
  fiscal2027: number;
  fiscal2028: number;
  fiscal2029: number;
};

type Offer = {
  totalMn: number;
  freshIssueMn: number;
  offerForSaleMn: number;
};

/**
 * SEBI caps general corporate purposes at 25 per cent of gross proceeds. The
 * unallocated share is therefore not a rounding remainder, it is a regulated
 * quantity, and a reader should see it against its ceiling rather than against
 * zero.
 */
export const GCP_CAP_PCT = 25;

/**
 * What the offer actually funds.
 *
 * The prospectus states the offer on one printed page and the objects on
 * another. Neither page performs this subtraction, and the subtraction is the
 * exhibit.
 */
export function useOfProceeds(offer: Offer, rows: ObjectRow[]) {
  const allocated = rows.reduce((t, r) => t + r.fromNetProceeds, 0);
  const unallocated = offer.freshIssueMn - allocated;
  return {
    total: offer.totalMn,
    /** Goes to the selling shareholders, never to the company. */
    offerForSale: offer.offerForSaleMn,
    offerForSaleShare: (offer.offerForSaleMn / offer.totalMn) * 100,
    freshIssue: offer.freshIssueMn,
    allocated,
    unallocated,
    unallocatedShare: (unallocated / offer.freshIssueMn) * 100,
    headroomToCap: GCP_CAP_PCT - (unallocated / offer.freshIssueMn) * 100,
  };
}

/**
 * The gap between what a project costs and what the offer pays for.
 *
 * Every rupee of project cost the net proceeds do not cover is itemised in the
 * issuer's own table as `fromBorrowings`. The offer does not fund the projects
 * it names. It part funds them and borrows the rest.
 */
export function fundingGapByObject(rows: ObjectRow[]) {
  return rows
    .filter((r) => r.fromBorrowings > 0)
    .map((r) => ({
      object: r.object,
      cost: r.totalEstimatedCost,
      fromNetProceeds: r.fromNetProceeds,
      fromBorrowings: r.fromBorrowings,
      borrowedShare: (r.fromBorrowings / r.totalEstimatedCost) * 100,
    }));
}

/**
 * The net debt bridge.
 *
 * One object repays borrowings. Two others are part funded by new borrowings,
 * itemised in the same table. Netting them is arithmetic the document never
 * performs, and the result is that a headline use of proceeds barely moves the
 * balance sheet.
 */
export function netDebtBridge(rows: ObjectRow[], openingNetDebt: number) {
  const repaid = rows
    .filter((r) => /repay/i.test(r.object))
    .reduce((t, r) => t + r.fromNetProceeds, 0);
  const borrowed = rows.reduce((t, r) => t + r.fromBorrowings, 0);
  const net = borrowed - repaid;
  return {
    opening: openingNetDebt,
    repaid,
    borrowed,
    /** Negative means net debt falls. */
    net,
    closing: openingNetDebt + net,
    reductionPct: (-net / openingNetDebt) * 100,
  };
}

/**
 * Deployment by fiscal year, across all objects.
 *
 * The schedule is certified by the statutory auditor, which makes it a stronger
 * claim than a management projection and worth drawing as stated.
 */
export function deploymentByYear(rows: ObjectRow[]) {
  const years = [
    { year: "Fiscal 2027", key: "fiscal2027" as const },
    { year: "Fiscal 2028", key: "fiscal2028" as const },
    { year: "Fiscal 2029", key: "fiscal2029" as const },
  ];
  return years.map(({ year, key }) => ({
    year,
    total: rows.reduce((t, r) => t + r[key], 0),
    byObject: rows.map((r) => ({ object: r.object, amount: r[key] })),
  }));
}
