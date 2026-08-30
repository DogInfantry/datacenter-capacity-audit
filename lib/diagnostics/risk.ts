import type { RiskItem, RiskPillar, Sisl } from "@/lib/schema";

/**
 * The risk register, arranged.
 *
 * A risk register is the easiest surface on a research site to fake, because
 * severity and likelihood are opinions and an opinion renders as confidently as
 * a reading. The defence here is that every row a reader meets in the worst
 * cell carries a magnitude derived from a filing, and the derivation lives in
 * this file rather than in the row.
 *
 * Nothing below formats. Values come back as numbers with the unit they are in,
 * and the component decides how to print them.
 */

export type Measure = {
  value: number;
  unit: string;
  /** What the number is, and over which period. Labels only, never figures. */
  basis: string;
};

/**
 * The magnitude for each Sify risk, read out of the filed numbers.
 *
 * The keys are risk ids. A row in `data/sisl.json` marked `measured` must have
 * one here, and the test suite reads this file as text to check that it does,
 * so a row can never claim a derived figure that nothing derives.
 */
export function sifyRiskMeasures(d: Sisl): Record<string, Measure> {
  const full = d.periods.filter((p) => !p.stub);
  const fy = full[full.length - 1];
  // The stub is the most recent period the filing reports. Its ratios are
  // unannualised, which is stated wherever one of them is drawn.
  const stub = d.periods.find((p) => p.stub) ?? fy;
  const cost = d.costStack.find((c) => c.label === fy.label)!;
  const clients = d.clients[0];
  const contract = d.contracts.find((c) => c.label === clients.label);

  return {
    "power-cost-base": {
      value: (cost.power / fy.revenue) * 100,
      unit: "per cent of revenue",
      basis: `Power cost against revenue, ${fy.label}`,
    },
    "unsold-built-capacity": {
      value: (1 - fy.operationalMW / fy.builtMW) * 100,
      unit: "per cent of built capacity",
      basis: `Built capacity less what is sold to customers, ${fy.label}`,
    },
    "client-concentration": {
      value: clients.rows.filter((r) => r.rank <= 3).reduce((t, r) => t + r.share, 0),
      unit: "per cent of revenue",
      basis: `Clients ranked one to three, ${clients.label}`,
    },
    "contract-escalators": {
      value: contract?.longContractRevenueShare ?? 0,
      unit: "per cent of revenue",
      basis: `Revenue on contracts of at least seven years, ${clients.label}`,
    },
    "capitalised-interest": {
      value: cost.interestCapitalised,
      unit: "Rs mn capitalised, not expensed",
      basis: `Borrowing cost taken to assets under construction, ${fy.label}`,
    },
    leverage: {
      value: stub.netDebtToEbitda,
      unit: "times EBITDA",
      basis: `Net debt to EBITDA, ${stub.label}, unannualised`,
    },
  };
}

/** Worst first, so the number a row carries on the page is its rank. */
export function numbered(rows: RiskItem[]) {
  return rows.map((r, i) => ({ ...r, n: i + 1 }));
}

const GRADES = ["LOW", "MED", "HIGH"] as const;

/**
 * The three by three, severity falling down the page and likelihood rising
 * across it, so the cell a reader looks at first is the top right one.
 */
export function matrixCells(rows: ReturnType<typeof numbered>) {
  return [...GRADES].reverse().map((severity) => ({
    severity,
    cells: GRADES.map((likelihood) => ({
      likelihood,
      rows: rows.filter((r) => r.severity === severity && r.likelihood === likelihood),
      worst: severity === "HIGH" && likelihood === "HIGH",
    })),
  }));
}

/** The cell the exhibit makes its claim about. */
export function worstCell(rows: ReturnType<typeof numbered>) {
  return rows.filter((r) => r.severity === "HIGH" && r.likelihood === "HIGH");
}

/** The brief's six pillars, in the order it lists them. */
export const PILLARS: RiskPillar[] = [
  "REVENUE_QUALITY",
  "CASH_CONVERSION",
  "BALANCE_SHEET",
  "GOVERNANCE",
  "BUSINESS_MODEL",
  "VALUATION",
];

export const PILLAR_LABEL: Record<RiskPillar, string> = {
  REVENUE_QUALITY: "Revenue quality",
  CASH_CONVERSION: "Cash conversion",
  BALANCE_SHEET: "Balance sheet",
  GOVERNANCE: "Governance",
  BUSINESS_MODEL: "Business model",
  VALUATION: "Valuation",
};

/**
 * Which pillars carry a row and which do not.
 *
 * Derived rather than listed, because a hand written list of gaps stops being
 * true the moment a row is added and nobody remembers to shorten it. An empty
 * pillar is a document that has not been read, and the register says which.
 */
export function pillarCoverage(rows: RiskItem[]) {
  return PILLARS.map((pillar) => ({
    pillar,
    label: PILLAR_LABEL[pillar],
    count: rows.filter((r) => r.category === pillar).length,
  }));
}
