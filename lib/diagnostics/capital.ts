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
export function capexVsCfo(rows: { fy: string; cfo?: number; capex?: number }[]): CapexYear[] {
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

type RoceInput = {
  periods: { label: string; ebitda: number; roce: number }[];
  balanceSheet: {
    label: string;
    netWorth: number;
    borrowings: number;
    leaseLiabilities: number;
    cash: number;
  }[];
  cashFlow: { label: string; depreciation: number }[];
};

/**
 * The published return on capital, rebuilt from the issuer's own balance sheet.
 *
 * The document prints the formula in one place, inside a commissioned industry
 * report, and the answers in another, as the issuer's own achievement. It never
 * joins them. This does.
 *
 * Both readings of "total borrowings" come back, because the formula does not
 * say whether lease liabilities sit inside it and the choice moves the answer by
 * more than half a point. Only one of the two reproduces what the issuer
 * published, and which one is the finding.
 *
 * The first period returns nothing at all. An average needs the capital employed
 * of the year before, and the balance sheet carries four columns, so there is
 * nothing to average against. That is not a gap in the method. It is a gap in
 * the document, and it falls on the highest of the four published figures.
 */
export function roceReconciliation(d: RoceInput) {
  const bs = new Map(d.balanceSheet.map((b) => [b.label, b]));
  const dep = new Map(d.cashFlow.map((c) => [c.label, c.depreciation]));
  const employed = (b: RoceInput["balanceSheet"][number], withLeases: boolean) =>
    b.netWorth + b.borrowings + (withLeases ? b.leaseLiabilities : 0) - b.cash;

  return d.periods.map((p, i) => {
    const here = bs.get(p.label);
    const prior = i > 0 ? bs.get(d.periods[i - 1].label) : undefined;
    const da = dep.get(p.label);
    const rebuild = (withLeases: boolean) =>
      here && prior && da !== undefined
        ? ((p.ebitda - da) / ((employed(prior, withLeases) + employed(here, withLeases)) / 2)) * 100
        : null;
    const withLeases = rebuild(true);
    const withoutLeases = rebuild(false);
    return {
      label: p.label,
      printed: p.roce,
      withLeases,
      withoutLeases,
      deltaWith: withLeases === null ? null : withLeases - p.roce,
      deltaWithout: withoutLeases === null ? null : withoutLeases - p.roce,
      /** False where the document cannot check its own published figure. */
      checkable: withLeases !== null,
    };
  });
}

/**
 * The same question asked of the issuer's own restated statement.
 *
 * The harvested filer above reports in rupees. The issuer reports in millions,
 * and its periods are not all years: the last one is a stub quarter, which is
 * why the labels are carried through rather than reconstructed from a fiscal
 * year. Nothing is annualised. A quarter of spending against a quarter of cash
 * is a fair comparison; a quarter against a year is not, and no row here mixes
 * the two.
 *
 * `covered` is the interesting set: the periods where operations paid for the
 * building. On this issuer there is exactly one, and where it sits in the
 * sequence is the finding.
 */
export function issuerCapexCover(rows: { label: string; cfo: number; capex: number }[]) {
  const periods = capexVsCfo(rows.map((r) => ({ fy: r.label, cfo: r.cfo, capex: r.capex })));
  const capex = periods.reduce((s, p) => s + p.capex, 0);
  const cfo = periods.reduce((s, p) => s + p.cfo, 0);
  return {
    periods,
    capex,
    cfo,
    gap: capex - cfo,
    multiple: capex / cfo,
    covered: periods.filter((p) => p.ratio <= 1),
    outspent: periods.filter((p) => p.ratio > 1),
  };
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
