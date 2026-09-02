import { CASH_CONVERSION, type Band } from "@/lib/config";

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
