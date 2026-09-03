import type { TechnoElectric } from "@/lib/schema";

/**
 * A liability that moved between two lines without any cash moving.
 *
 * Supplier finance pays a vendor early and collects from the buyer later. The
 * buyer's own terms lengthen, and the obligation stops being a trade payable
 * and becomes a borrowing. Both halves of that are visible here, which is not
 * always the case: the disclosure exists because the amendments to Ind AS 7 and
 * Ind AS 107 required it from the year this report covers.
 *
 * Two things are worth separating, because they point opposite ways. Putting
 * the liability under borrowings rather than leaving it in payables is the
 * stricter of the two available treatments and the company chose it. Recording
 * the move as a non cash transfer is also correct, and its effect is that a
 * doubling of the time the company takes to pay leaves no mark on either half
 * of the cash flow statement.
 */
export function supplierFinance(d: TechnoElectric) {
  const s = d.supplierFinance;
  const consolidatedRise = s.consolidatedCurrentBorrowingsMn - s.consolidatedCurrentBorrowingsPriorMn;
  return {
    carryingAmountMn: s.carryingAmountMn,
    reclassifiedMn: s.reclassifiedMn,
    priorMn: s.carryingAmountPriorMn,
    arrangementDays: s.arrangementDays,
    comparableDays: s.comparableDays,
    /** How much longer the financed terms run, at each end of the two ranges. */
    extraDaysLow: s.arrangementDays.low - s.comparableDays.low,
    extraDaysHigh: s.arrangementDays.high - s.comparableDays.high,
    standaloneBorrowingsMn: s.standaloneCurrentBorrowingsMn,
    /** The share of what the standalone calls current borrowings that arrived by
     *  reclassification rather than by borrowing. */
    shareOfStandaloneBorrowingsPct: (s.reclassifiedMn / s.standaloneCurrentBorrowingsMn) * 100,
    consolidatedRise,
    shareOfConsolidatedRisePct: consolidatedRise > 0 ? (s.reclassifiedMn / consolidatedRise) * 100 : null,
    /** The counterweight, and it belongs on the page. Against the payables it
     *  came out of, the amount is small. */
    shareOfTradePayablesPct: (s.reclassifiedMn / s.tradePayablesMn) * 100,
    overCommitment: s.carryingAmountMn / d.commitments.capitalCommitmentMn,
    commitmentMn: d.commitments.capitalCommitmentMn,
    interestWords: s.interestWords,
    collateralQuote: s.collateralQuote,
    nonCashQuote: s.nonCashQuote,
    adoptionWords: s.adoptionWords,
    adoptionPage: s.adoptionPage,
    standalonePage: s.standalonePage,
    netDebtPage: s.netDebtStandalonePage,
  };
}
