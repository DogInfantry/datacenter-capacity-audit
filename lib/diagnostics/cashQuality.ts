import { CASH_CONVERSION, type Band } from "@/lib/config";
import type { CompanyDoc, Sisl } from "@/lib/schema";

/**
 * Cash conversion, the pillar the brief calls the heart of the engine.
 *
 * "Net income is an opinion; cash is a fact." Two measures carry that, and this
 * file computes both rather than picking the one that agrees with a view.
 *
 * The design rule the rest of this repository already follows applies here with
 * more force, because a scorecard is the surface most tempted to break it: a
 * metric that cannot be computed returns a refusal naming what is missing, and
 * a combined reading is withheld rather than averaged over the gap. A number
 * that quietly stands in for an absence is worse than an empty cell, since a
 * reader cannot tell the two apart.
 */

export type Metric = {
  key: string;
  label: string;
  /** Null where the inputs do not support a reading. */
  value: number | null;
  unit: string;
  band: Band;
  /** Why a null is null, in terms of the figure rather than the code. */
  refusal?: string;
  /** The threshold sentence this reading was graded against. */
  rule: string;
};

const RULE_CFO_PAT =
  `Below ${CASH_CONVERSION.cfoToPat.amberBelow} is a flag and below ` +
  `${CASH_CONVERSION.cfoToPat.redBelow} is serious.`;

const RULE_ACCRUAL =
  `Outside plus or minus ${(CASH_CONVERSION.accrualRatio.redOutside * 100).toFixed(0)} per cent is the danger line.`;

/**
 * Operating cash against profit after tax.
 *
 * Refuses a negative denominator rather than returning a ratio. A loss making
 * period makes the quotient change sign without the underlying conversion
 * changing at all, so a negative reading would sort and colour like a grade
 * while meaning nothing.
 */
export function cfoToPat(cfo: number, pat: number): Metric {
  const base = { key: "cfoToPat", label: "Operating cash to profit after tax", unit: "times", rule: RULE_CFO_PAT };
  if (pat <= 0) {
    return {
      ...base,
      value: null,
      band: "REFUSED",
      refusal: "Profit after tax is not positive in this period, and a ratio against it would change sign without the cash changing.",
    };
  }
  const value = cfo / pat;
  const { amberBelow, redBelow } = CASH_CONVERSION.cfoToPat;
  return { ...base, value, band: value < redBelow ? "RED" : value < amberBelow ? "AMBER" : "GREEN" };
}

/**
 * The Sloan accrual ratio, on the brief's definition.
 *
 * Net income less operating cash less investing cash, over total assets. Both
 * cash figures are taken with the sign the statement prints, so nothing here
 * depends on remembering which way an outflow points.
 */
export function accrualRatio(
  netIncome: number,
  cfo: number,
  cfi: number,
  totalAssets: number,
): Metric {
  const base = { key: "accrualRatio", label: "Sloan accrual ratio", unit: "per cent of total assets", rule: RULE_ACCRUAL };
  if (!(totalAssets > 0)) {
    return { ...base, value: null, band: "REFUSED", refusal: "Total assets are not published for this period." };
  }
  const value = (netIncome - cfo - cfi) / totalAssets;
  return {
    ...base,
    value: value * 100,
    band: Math.abs(value) > CASH_CONVERSION.accrualRatio.redOutside ? "RED" : "GREEN",
  };
}

export type PillarReading = {
  ticker: string;
  name: string;
  period: string;
  metrics: Metric[];
  /** How many metrics resolved to a number. */
  resolved: number;
  /** The worst band across the metrics that resolved, or null where too few
   *  did. Never an average: a mean over two metrics that disagree hides the
   *  disagreement, and the disagreement is the informative part. */
  worst: Band | null;
  /** Why no combined reading, where there is none. */
  withheld?: string;
};

const SEVERITY: Record<Band, number> = { GREEN: 0, AMBER: 1, RED: 2, REFUSED: -1 };

/** One company, one period, both metrics, and a combined view only if earned. */
export function pillar(
  ticker: string,
  name: string,
  period: string,
  metrics: Metric[],
): PillarReading {
  const resolved = metrics.filter((m) => m.value !== null);
  if (resolved.length < CASH_CONVERSION.minimumMetricsForCombined) {
    return {
      ticker,
      name,
      period,
      metrics,
      resolved: resolved.length,
      worst: null,
      withheld: `${resolved.length} of ${metrics.length} measures resolved, and a combined reading needs ${CASH_CONVERSION.minimumMetricsForCombined}.`,
    };
  }
  const worst = resolved.reduce<Band>(
    (acc, m) => (SEVERITY[m.band] > SEVERITY[acc] ? m.band : acc),
    "GREEN",
  );
  return { ticker, name, period, metrics, resolved: resolved.length, worst };
}

/** Whether a company's two measures reach opposite verdicts, which is a finding
 *  about the measures rather than about the company. */
export function metricsDisagree(reading: PillarReading): boolean {
  const bands = reading.metrics.filter((m) => m.value !== null).map((m) => m.band);
  return bands.includes("RED") && bands.includes("GREEN");
}

/**
 * The subsidiary's own filed periods, read from the restated statements.
 *
 * The stub quarter is labelled rather than annualised, because a quarter of
 * cash against a quarter of profit is a real ratio and a quarter scaled up by
 * four is not. The basis is on every label for the same reason it is stored per
 * period: two of these columns are standalone under a heading that says
 * consolidated on all four.
 *
 * Lives here rather than on the company page because two routes now read it,
 * and a second copy would let the two pages label the same periods differently.
 */
export function sislReadings(sisl: Sisl): PillarReading[] {
  return sisl.periods.map((p) => {
    const cf = sisl.cashFlow.find((c) => c.label === p.label)!;
    const bs = sisl.balanceSheet.find((b) => b.label === p.label)!;
    const basis = p.basis === "CONSOLIDATED" ? "consolidated" : "standalone";
    const period = p.stub ? `${p.label}, ${basis}, unannualised` : `${p.label}, ${basis}`;
    return pillar("SISL", sisl.entity, period, [
      cfoToPat(cf.cfo, p.pat),
      accrualRatio(p.pat, cf.cfo, cf.cfi, bs.totalAssets),
    ]);
  });
}

type FinancialRow = CompanyDoc["financials"][number];

/** A metric that could not be attempted, because an input the formula needs is
 *  not in the file. Distinct from a refusal the formula itself returns: one is
 *  about the disclosure, the other about the arithmetic. */
const absent = (base: Omit<Metric, "value" | "band">, why: string): Metric => ({
  ...base,
  value: null,
  band: "REFUSED",
  refusal: why,
});

/**
 * The pillar read off one filed year of a harvested filer.
 *
 * Every refusal below names the missing figure rather than the missing field,
 * because a reader checking the claim goes to the filing, not to the schema.
 */
export function rowReading(c: CompanyDoc, row: FinancialRow): PillarReading {
  const conv = { key: "cfoToPat", label: "Operating cash to profit after tax", unit: "times", rule: RULE_CFO_PAT };
  const accr = { key: "accrualRatio", label: "Sloan accrual ratio", unit: "per cent of total assets", rule: RULE_ACCRUAL };

  const first =
    row.cfo === undefined
      ? absent(conv, "Net cash from operating activities is not harvested for this period.")
      : row.pat === undefined
        ? absent(conv, "Profit after tax is not harvested for this period.")
        : cfoToPat(row.cfo, row.pat.value);

  const second =
    row.pat === undefined || row.cfo === undefined || row.cfi === undefined
      ? absent(accr, "The statement of cash flows is not harvested in full for this period.")
      : row.totalAssets === undefined
        ? absent(
            accr,
            "No balance sheet is filed at this date. An annual report prints its statement of financial position one year behind the cash flow filed beside it.",
          )
        : accrualRatio(row.pat.value, row.cfo, row.cfi.value, row.totalAssets.value);

  return pillar(c.ticker, c.name, row.fy, [first, second]);
}

/**
 * One row per harvested filer, each on its own most recently filed year.
 *
 * The years are deliberately not aligned. Three of these filers close on 31
 * March and two on 31 December, so a single calendar column would either drop
 * the most recent filing from three companies or put two different twelve month
 * periods under one heading. The period is printed on every row instead.
 *
 * Companies with no harvested profit figure are excluded rather than shown
 * empty, on the same rule the rest of the pillar follows: a blank and a measured
 * zero are indistinguishable once the number is gone.
 */
export function peerCashConversion(companies: CompanyDoc[]): PillarReading[] {
  return companies
    .map((c) => {
      const rows = [...c.financials].sort((a, b) => a.periodEnd.localeCompare(b.periodEnd));
      const latest = rows[rows.length - 1];
      return latest && latest.pat !== undefined ? rowReading(c, latest) : null;
    })
    .filter((r): r is PillarReading => r !== null);
}

/**
 * The data centre arm and the group that owns it, on the years both filed.
 *
 * Nowhere else on this site is one business measured from two documents on the
 * same pillar. The subsidiary files restated statements into a draft
 * prospectus; the parent files a 20-F. The stub quarter is dropped here, since
 * the parent files no quarter to set beside it and a three month ratio in a
 * column of twelve month ones would read as a fourth year.
 *
 * The two are reported in different scales of the same currency, millions
 * against absolute rupees. Nothing is converted and nothing needs to be: one
 * measure is a ratio and the other a percentage, so the scale cancels on both
 * sides and only the levels behind them would have needed rebasing.
 */
export function armAgainstParent(sisl: Sisl, parent: CompanyDoc): PillarReading[] {
  // sislReadings maps one to one over the filed periods, so the index carries
  // the label across without a second join.
  const arm = new Map(sislReadings(sisl).map((r, i) => [sisl.periods[i].label, r]));
  const full = sisl.periods.filter((p) => !p.stub).map((p) => p.label);
  const out: PillarReading[] = [];
  for (const label of [...full].sort()) {
    const row = parent.financials.find((f) => f.fy === label);
    if (!row) continue;
    out.push(arm.get(label)!, rowReading(parent, row));
  }
  return out;
}
