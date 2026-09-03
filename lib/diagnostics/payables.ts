import type { TechnoElectric } from "@/lib/schema";

/**
 * What is owed, how long it has been owed, and what the statute says about it.
 *
 * The ageing table heads its columns from the due date of payment rather than
 * from the invoice date, so every column except the first holds amounts that
 * are already late. That is what makes the micro and small enterprise row
 * readable: the entire balance sits in an overdue column and nothing sits in
 * the column for amounts not yet due.
 *
 * The five clauses printed one page later are the other half. Interest on a
 * payment made after the appointed day is automatic under the Act, and all five
 * report nothing, in both years.
 *
 * The limit is carried with the finding rather than left out of it. The
 * shortest overdue bucket runs to a year and the appointed day is forty five
 * days, so the table cannot show that every rupee passed it.
 */
export function payablesAgeing(d: TechnoElectric) {
  const p = d.payables;
  const notDue = p.ageing.find((r) => r.bucket === "NOT_DUE")!;
  const overdueMn = p.totalMn - notDue.othersMn - notDue.msmeMn;
  const overduePriorMn = p.totalPriorMn - notDue.othersPriorMn - notDue.msmePriorMn;
  return {
    totalMn: p.totalMn,
    totalPriorMn: p.totalPriorMn,
    ageing: p.ageing,
    notDueMn: notDue.othersMn + notDue.msmeMn,
    overdueMn,
    overdueSharePct: (overdueMn / p.totalMn) * 100,
    overduePriorSharePct: (overduePriorMn / p.totalPriorMn) * 100,
    msmePrincipalMn: p.msmePrincipalMn,
    msmeNotDueMn: notDue.msmeMn,
    msmeRisePct: (p.msmePrincipalMn / p.msmePrincipalPriorMn - 1) * 100,
    clauses: p.msmedClauses,
    /** Every clause reporting nothing is the claim, so it is counted rather
     *  than assumed from the shape of the array. */
    nilClauseCount: p.msmedClauses.filter((c) => c.interestMn === 0 && c.interestPriorMn === 0).length,
    letterOfCreditMn: p.letterOfCreditMn,
    letterOfCreditSharePct: (p.letterOfCreditMn / p.totalMn) * 100,
    letterOfCreditRisePct: (p.letterOfCreditMn / p.letterOfCreditPriorMn - 1) * 100,
    headerWords: p.ageingHeaderWords,
    identificationQuote: p.identificationQuote,
    bucketLimitNote: p.bucketLimitNote,
    ageingPage: p.ageingPage,
    clausesPage: p.clausesPage,
  };
}
