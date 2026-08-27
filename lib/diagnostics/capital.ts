import type { CompanyFinancials } from "@/lib/schema";

/** Rupees to crore. One crore is ten million. */
export const toCr = (rupees: number) => rupees / 1e7;

export type CapexYear = {
  fy: string;
  cfo: number;
  capex: number;
  ratio: number;
  gap: number;
};

/**
 * Capex against operating cash flow.
 *
 * The whole data centre thesis is a capex bet, so the question that matters is
 * whether the building is funded by the business or by someone else. A ratio
 * above 1 means the year's construction outran the cash the year produced.
 */
export function capexVsCfo(rows: CompanyFinancials[]): CapexYear[] {
  return rows
    .filter((r) => r.cfo !== undefined && r.capex !== undefined)
    .map((r) => ({
      fy: r.fy,
      cfo: r.cfo!,
      capex: r.capex!,
      ratio: r.capex! / r.cfo!,
      gap: r.capex! - r.cfo!,
    }));
}

/**
 * The cumulative funding gap over a run of years.
 *
 * Summed rather than averaged on purpose: a shortfall does not reset each April,
 * it accumulates on the balance sheet until someone funds it.
 */
export function fundingGap(rows: CompanyFinancials[], fromFy: string) {
  const years = capexVsCfo(rows).filter((y) => y.fy >= fromFy);
  const capex = years.reduce((s, y) => s + y.capex, 0);
  const cfo = years.reduce((s, y) => s + y.cfo, 0);
  return {
    fromFy,
    years: years.length,
    capex,
    cfo,
    gap: capex - cfo,
    yearsOutspending: years.filter((y) => y.ratio > 1).length,
  };
}
