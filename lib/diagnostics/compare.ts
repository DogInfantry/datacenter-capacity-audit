import type { AnantRaj, Netweb, Prospectus, Sisl } from "@/lib/schema";
// The same counter the methodology page publishes. A second walker here
// counted only one file and printed a different total for the same claim.
import { citedPages } from "./sourcing";

/**
 * The comparison, and the reason most of it is empty.
 *
 * This surface was blocked for a long time on a real problem: three covered
 * names measured on three different units. One table would have compared a
 * megawatt against an order book, or left most cells blank while letting a
 * reader take the blanks for zeros.
 *
 * The unblock was not a fourth name. It was reading a filing for the second
 * operator, which made one ratio genuinely like for like: what earns, divided by
 * what the company headlines. Both operators now publish both numbers in a
 * document, on a printed page, so that row is a comparison rather than a
 * coincidence of arithmetic.
 *
 * Everything else is reported as absent rather than blank, with the document
 * that would fill it named. A comparison tool whose honest output is how little
 * can be compared is worth more than one that fills every cell.
 */

export type Cell = {
  /** Null where this company has no figure of this kind at all. */
  value: number | null;
  unit: string;
  /** What would have to be read for a null to become a number. */
  missing?: string;
};

export type CompareRow = {
  metric: string;
  /** Why this row is a comparison, or why it is not. */
  basis: string;
  comparable: boolean;
  cells: Record<string, Cell>;
};

export type CompareSubject = {
  ticker: string;
  name: string;
  unit: string;
  /** Excluded subjects are named on the page with the reason, never dropped. */
  excluded: string | null;
};

export function compareSubjects(sisl: Sisl, ar: AnantRaj, nw: Netweb): CompareSubject[] {
  return [
    { ticker: "SIFY", name: sisl.entity, unit: "megawatts", excluded: null },
    { ticker: "ANANTRAJ", name: ar.listedParent, unit: "megawatts", excluded: null },
    {
      ticker: "NETWEB",
      name: nw.listedParent,
      unit: "order book",
      excluded:
        "Owns no megawatts. It builds the machines that fill other people's estates, so every row below would compare a megawatt against a rupee of backlog.",
    },
  ];
}

const cell = (value: number | null, unit: string, missing?: string): Cell => ({
  value,
  unit,
  ...(missing ? { missing } : {}),
});

/**
 * The one row that is genuinely like for like, and the rows that are not.
 *
 * Both operators publish a headline capacity figure and a smaller figure for
 * what actually earns, in a filed document. The ratio between them asks the same
 * question of both, even though the two companies use entirely different words
 * for the rungs, which is exactly why the ratio travels and the levels do not.
 */
export function compareRows(sisl: Sisl, ar: AnantRaj, pros: Prospectus): CompareRow[] {
  const full = sisl.periods.filter((p) => !p.stub);
  const fy = full[full.length - 1];
  const claimed = ar.annualReport.rungs.find((r) => r.kind === "CLAIMED")!;
  const live = ar.annualReport.rungs.find((r) => r.rung === "Operationalised")!;
  const priorCfo = sisl.cashFlow[sisl.cashFlow.length - 2];

  return [
    {
      metric: "Headline capacity",
      basis:
        "Each company's own widest published figure. They are not the same kind of number, which is why this row is a denominator rather than a comparison.",
      comparable: false,
      cells: {
        SIFY: cell(fy.builtMW, "MW built"),
        ANANTRAJ: cell(claimed.mw, "MW operational and advance stage"),
      },
    },
    {
      metric: "Capacity that earns",
      basis:
        "What each company says is actually sold or operational, printed in the same document as the headline above it.",
      comparable: false,
      cells: {
        SIFY: cell(fy.operationalMW, "MW sold"),
        ANANTRAJ: cell(live.mw, "MW operationalised"),
      },
    },
    {
      metric: "Earning share of the headline",
      basis:
        "The one row that is like for like. Both companies publish both numbers in a filing, so this asks the same question of each, and neither has to borrow the other's vocabulary for it to hold.",
      comparable: true,
      cells: {
        SIFY: cell((fy.operationalMW / fy.builtMW) * 100, "per cent"),
        ANANTRAJ: cell((live.mw / claimed.mw) * 100, "per cent"),
      },
    },
    {
      metric: "Printed pages cited",
      basis:
        "How much of each document this project actually opened. A measure of the reading, not of the company.",
      comparable: true,
      cells: {
        SIFY: cell(citedPages(sisl, pros).length, "pages"),
        ANANTRAJ: cell(
          new Set([
            ...ar.annualReport.rungs.map((r) => r.page),
            ar.annualReport.auditOpinion.page,
            ar.annualReport.compositionSource.page,
          ]).size,
          "pages",
        ),
      },
    },
    {
      metric: "Revenue",
      basis: "Read for one and not the other. The absence is the finding, and it is not a zero.",
      comparable: false,
      cells: {
        SIFY: cell(fy.revenue, "Rs mn"),
        ANANTRAJ: cell(
          null,
          "Rs mn",
          "The audited financial statements inside the annual report already downloaded and pinned.",
        ),
      },
    },
    {
      metric: "Operating cash flow",
      basis: "Same document, same gap, one step further in.",
      comparable: false,
      cells: {
        SIFY: cell(priorCfo.cfo, "Rs mn"),
        ANANTRAJ: cell(null, "Rs mn", "The statement of cash flow in the same annual report."),
      },
    },
    {
      metric: "Return on capital",
      basis:
        "Published by one and rebuilt here from its own balance sheet. Not published by the other in anything that has been read.",
      comparable: false,
      cells: {
        SIFY: cell(fy.roce, "per cent"),
        ANANTRAJ: cell(null, "per cent", "The financial statements, and a capital employed figure."),
      },
    },
  ];
}

/** How many rows survive as an actual comparison. The headline of the page. */
export function comparableCount(rows: CompareRow[]) {
  return { comparable: rows.filter((r) => r.comparable).length, total: rows.length };
}
