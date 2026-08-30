import type { AnantRaj, Netweb, RiskItem, RiskPillar, Sisl } from "@/lib/schema";
import { orderBookConcentration } from "./netweb";

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
      unit: "million rupees capitalised, not expensed",
      basis: `Borrowing cost taken to assets under construction, ${fy.label}`,
    },
    leverage: {
      value: stub.netDebtToEbitda,
      unit: "times EBITDA",
      basis: `Net debt to EBITDA, ${stub.label}, unannualised`,
    },
  };
}

/**
 * Anant Raj, where the magnitudes are derived from recorded figures rather than
 * from a filing, because no Anant Raj document has been opened.
 *
 * The distinction matters and the exhibit draws it: derived is not the same as
 * read. Every number below comes out of `data/anantraj.json`, and every figure
 * in that file came out of a research note.
 */
export function anantRajRiskMeasures(d: AnantRaj): Record<string, Measure> {
  const [announced, operational, handed] = d.ladder;
  const conflict = Math.abs(d.conflict.a.value - d.conflict.b.value);

  return {
    "handover-gap": {
      value: (1 - handed.mw / operational.mw) * 100,
      unit: "per cent of what is called operational",
      basis: "Capacity described as operational, less what is actually handed over",
    },
    "delivery-against-ambition": {
      value: (handed.mw / announced.mw) * 100,
      unit: "per cent of the announced target",
      basis: `Handed over against the target for ${d.targetFiscalYear}`,
    },
    "source-conflict": {
      value: (conflict / Math.max(d.conflict.a.value, d.conflict.b.value)) * 100,
      unit: "per cent of the operational estate in dispute",
      basis: `Two recorded figures for ${d.conflict.field.toLowerCase()}, neither averaged`,
    },
    "capital-programme": {
      value: d.capexUsdBn,
      unit: "billion dollars of stated capex",
      basis: `Stated cost of reaching the target for ${d.targetFiscalYear}`,
    },
  };
}

/**
 * Netweb, measured on a backlog rather than an estate.
 *
 * The concentration comes from the function the order book exhibit already
 * uses, so the register and that exhibit cannot drift apart into two different
 * numbers for the same share.
 */
export function netwebRiskMeasures(d: Netweb): Record<string, Measure> {
  const c = orderBookConcentration(d.orderBook, d.anchorOrder);
  const quarter = d.revenueMix.find((r) => r.span === "QUARTER");
  const nineMonths = d.revenueMix.find((r) => r.span === "NINE_MONTHS");

  return {
    "book-concentration": {
      value: c.sharePct,
      unit: "per cent of the order book, one counterparty",
      basis: `${d.anchorOrder.name} against the book at ${d.orderBook.asOf}`,
    },
    "delivery-window": {
      value: c.restCr,
      unit: "crore rupees of book with no published schedule",
      basis: "The order book less the single order whose delivery date is known",
    },
    "valuation-multiple": {
      value: d.valuation.trailingPE,
      unit: "times trailing earnings",
      basis: "Price paid today against earnings already reported",
    },
    "mix-is-one-quarter": {
      value: (quarter?.aiSharePct ?? 0) - (nineMonths?.aiSharePct ?? 0),
      unit: "points between the quarter and the nine months holding it",
      basis: `${quarter?.period ?? ""} against ${nineMonths?.period ?? ""}`,
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
