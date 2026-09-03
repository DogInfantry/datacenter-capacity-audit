import type { Sisl } from "@/lib/schema";

/**
 * Customer concentration, and the three places one filing states it.
 *
 * The issuer publishes the same fact three times, in three sections, and never
 * joins any two of them.
 *
 * Printed 36 is a table of revenue by client, in the risk factors. Printed 46
 * is a single percentage, also a risk factor, offered as evidence that the
 * revenue base is durable because it sits on long contracts. Printed 407 is
 * note 33 to the restated financial information, which gives an amount for
 * revenue from three customers.
 *
 * Two of those agreeing is weaker evidence than it looks. Both are risk
 * factors: written by the issuer, for the issuer's document, about itself, and
 * a house style that computes one figure twice the same way would produce the
 * agreement without it meaning anything. The third sits inside the accounts the
 * auditor examined, which is a different kind of claim, and it lands on the
 * same number to the paisa in every filed period.
 *
 * What the three together say is that the contract base the issuer calls
 * durable, the client concentration it discloses as a risk, and the customer
 * revenue its audited note reports are one set of counterparties.
 */

export type PeriodTie = {
  label: string;
  /** How many customers the audited note aggregates. */
  customers: number;
  /** The amount that note reports. */
  auditedMn: number;
  /** The same customers summed out of the client table. */
  tableMn: number;
  /** Their share of restated revenue, computed from the audited amount. */
  auditedSharePct: number;
  /** The percentage the long contract risk factor prints. */
  longContractSharePct: number;
  /** Whether all three sections land on the same fact in this period. */
  agrees: boolean;
};

/** A hundredth of a million rupees. The filing rounds to two places, so this is
 *  the tightest tolerance the source can support, and anything wider would let
 *  a mistyped digit through. */
const TOLERANCE_MN = 0.01;

/** The long contract share is printed to two decimals, so it is compared at
 *  that precision rather than at the amounts' tolerance. */
const TOLERANCE_PCT = 0.01;

/**
 * One row per filed period, in the order the file carries them.
 *
 * Returns what each section says rather than a verdict, so a page can put the
 * three figures beside each other and let a reader make the comparison the
 * document declined to make.
 */
export function concentrationTie(d: Sisl): PeriodTie[] {
  return d.majorCustomer.map((m) => {
    const c = d.clients.find((x) => x.label === m.label)!;
    const period = d.periods.find((p) => p.label === m.label)!;
    const contract = d.contracts.find((x) => x.label === m.label);
    const tableMn = c.rows.filter((r) => r.rank <= m.customers).reduce((t, r) => t + r.amount, 0);
    const auditedSharePct = (m.amountMn / period.revenue) * 100;
    const longContractSharePct = contract?.longContractRevenueShare ?? NaN;
    return {
      label: m.label,
      customers: m.customers,
      auditedMn: m.amountMn,
      tableMn,
      auditedSharePct,
      longContractSharePct,
      agrees:
        Math.abs(tableMn - m.amountMn) <= TOLERANCE_MN &&
        Math.abs(auditedSharePct - longContractSharePct) <= TOLERANCE_PCT,
    };
  });
}

/**
 * The share of revenue the long contract risk factor prints, keyed by period.
 *
 * Lives here rather than on the page because two things now need it, and a
 * second copy is how the figure a page shows and the figure a guard checks
 * drift apart.
 */
export function longContractShare(d: Sisl): Record<string, number> {
  return Object.fromEntries(d.contracts.map((c) => [c.label, c.longContractRevenueShare]));
}

/** The pages the three statements sit on, for a page that wants to name them. */
export function concentrationPages(d: Sisl) {
  return {
    clients: d.clientsSource.page,
    longContract: d.contractsSource.page,
    audited: d.majorCustomerSource.page,
  };
}
