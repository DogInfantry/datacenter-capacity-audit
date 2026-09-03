import type { TechnoElectric } from "@/lib/schema";

/**
 * What a filer has contracted to build, set against what it says it will build.
 *
 * The capacity target and the campus figures are management commentary. The
 * commitment is an audited line, printed in both sets of accounts, recording
 * the contracts on capital account that remain to be executed. Those are two
 * different kinds of claim about the same future, and the second is the only
 * one an auditor has looked at.
 *
 * The translation into megawatts uses the sector build cost carried in the
 * macro file rather than any figure of this company's, because no operator here
 * publishes its own cost per megawatt. It is passed in for the same reason
 * `capitalRequirement` takes it as an argument: the rate belongs to the sector
 * and the arithmetic belongs here.
 */

const MN_PER_CRORE = 10;

export function contractedCapital(d: TechnoElectric, crPerMwLow: number, crPerMwHigh: number) {
  const c = d.commitments;
  const commitmentCr = c.capitalCommitmentMn / MN_PER_CRORE;
  const priorCr = c.capitalCommitmentPriorMn / MN_PER_CRORE;
  const live = d.campuses.filter((x) => x.status === "LIVE").reduce((t, x) => t + x.mw, 0);

  return {
    commitmentMn: c.capitalCommitmentMn,
    commitmentPriorMn: c.capitalCommitmentPriorMn,
    commitmentCr,
    priorCr,
    contingentTotalMn: c.contingentTotalMn,
    contingentTotalPriorMn: c.contingentTotalPriorMn,
    overdueMn: d.governance.emphasisOfMatter.amountMn,
    /** What the contracted capital buys at the sector rate, as a band. The high
     *  cost per megawatt gives the low megawatt figure. */
    mwLow: commitmentCr / crPerMwHigh,
    mwHigh: commitmentCr / crPerMwLow,
    targetMW: d.target.mw,
    liveMW: live,
    /** How many times the auditor's flagged balances cover the contracted
     *  capital. Both are audited and both are in the same unit. */
    overdueOverCommitment: d.governance.emphasisOfMatter.amountMn / c.capitalCommitmentMn,
    contingentOverCommitment: c.contingentTotalMn / c.capitalCommitmentMn,
    standalonePage: c.standalonePage,
    consolidatedPage: c.consolidatedPage,
    emphasisPage: d.governance.emphasisOfMatter.standalonePage,
    targetPage: d.target.page,
  };
}

/**
 * The struck off note, and the sentence printed beside it.
 *
 * One row rather than a list, which is why this returns the row and the denial
 * rather than a distribution. The comparison worth drawing is against the other
 * annual report read here, where the same disclosure runs to eleven
 * counterparties.
 */
export function struckOffDenial(d: TechnoElectric) {
  const s = d.governance.struckOff;
  const rows = [...s.rows].sort((a, b) => b.amountMn - a.amountMn);
  return {
    rows,
    count: rows.length,
    largest: rows[0],
    totalMn: rows.reduce((t, r) => t + r.amountMn, 0),
    denialQuote: s.denialQuote,
    clauseNumeral: s.clauseNumeral,
    standalonePage: s.standalonePage,
    consolidatedPage: s.consolidatedPage,
  };
}

/**
 * What the accounts separate. For this filer the answer is nothing, and the
 * terms searched are carried with the result so the absence can be re-run
 * rather than taken on trust.
 */
export function segmentAbsence(d: TechnoElectric) {
  const s = d.segmentation;
  return {
    reported: s.reported,
    termsSearched: s.termsSearched,
    printedPagesSearched: s.printedPagesSearched,
    ambitionWords: s.ambitionWords,
    ambitionPage: s.ambitionPage,
    page: s.source.page,
  };
}
