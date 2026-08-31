import type { AnantRaj, Netweb, Sisl } from "@/lib/schema";

/**
 * The comparison, and the reason most of it is empty.
 *
 * Three covered names sit on three different units. One table across all of
 * them would compare a megawatt against an order book, or leave most cells
 * blank while letting a reader take a blank for a zero.
 *
 * One ratio is genuinely like for like: what earns, divided by what the company
 * headlines. Both operators publish both numbers in a filed document on a
 * printed page, so that row asks the same question of each rather than being a
 * coincidence of arithmetic.
 *
 * Everything else is reported as absent rather than blank, with the document
 * the figure lives in named. A comparison tool whose honest output is how
 * little can be compared is worth more than one that fills every cell.
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
  /** Capacity rows are drawn as ladders. Financial rows are tabulated, because
   *  three of the four cells in them have no number to draw. */
  kind: "CAPACITY" | "FINANCIAL";
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
export function compareRows(sisl: Sisl, ar: AnantRaj): CompareRow[] {
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
      kind: "CAPACITY",
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
      kind: "CAPACITY",
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
      kind: "CAPACITY",
      cells: {
        SIFY: cell((fy.operationalMW / fy.builtMW) * 100, "per cent"),
        ANANTRAJ: cell((live.mw / claimed.mw) * 100, "per cent"),
      },
    },
    {
      metric: "Revenue",
      basis:
        "One operator files a restated income statement inside its offer document. The other's sits in a set of audited accounts, and the figure below names where.",
      comparable: false,
      kind: "FINANCIAL",
      cells: {
        SIFY: cell(fy.revenue, "Rs mn"),
        ANANTRAJ: cell(
          null,
          "Rs mn",
          "The audited financial statements, inside the same annual report the capacity figures come from.",
        ),
      },
    },
    {
      metric: "Operating cash flow",
      basis:
        "The number that says whether the estate above pays for itself. It exists for both companies and is cited for one.",
      comparable: false,
      kind: "FINANCIAL",
      cells: {
        SIFY: cell(priorCfo.cfo, "Rs mn"),
        ANANTRAJ: cell(null, "Rs mn", "The statement of cash flow in the same annual report."),
      },
    },
    {
      metric: "Return on capital",
      basis:
        "Published by one operator and rebuilt from its own balance sheet to check it. The other does not print the ratio, and the inputs to it sit in the accounts.",
      comparable: false,
      kind: "FINANCIAL",
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

export type LadderRung = {
  rung: string;
  mw: number;
  kind: "AMBITION" | "CLAIMED" | "DELIVERED";
  page: number;
};

export type LadderCompany = {
  ticker: string;
  name: string;
  period: string;
  /** The company's own rungs, in its own words, descending. */
  rungs: LadderRung[];
  headlineMW: number;
  earningMW: number;
  earningShare: number;
  sourceLabel: string;
};

/**
 * The two estates as ladders on one megawatt scale.
 *
 * Each ladder is one company's own published rungs in that company's own words.
 * The words do not correspond across the two, which is why nothing is drawn
 * between them and only the ratio at the foot of each ladder travels: what
 * earns over what is headlined, asked of each company against its own numbers.
 *
 * One shared scale rather than two indexed ones. Indexing each estate to its own
 * top would draw both ladders the same width and hide that one of these
 * companies operates an order of magnitude more capacity than the other.
 *
 * Forward looking rungs are excluded. A planned figure is not capacity and
 * putting it on the same axis as a built one is the move this whole site exists
 * to point at.
 */
export function compareLadders(sisl: Sisl, ar: AnantRaj) {
  const full = sisl.periods.filter((p) => !p.stub);
  const fy = full[full.length - 1];
  const page = sisl.periodsSource.page;

  const arRungs = ar.annualReport.rungs.filter((r) => r.kind !== "AMBITION");
  const claimed = arRungs.find((r) => r.kind === "CLAIMED")!;
  const live = arRungs.find((r) => r.rung === "Operationalised")!;

  const companies: LadderCompany[] = [
    {
      ticker: "SIFY",
      name: sisl.entity,
      period: fy.label,
      rungs: [
        { rung: "Built", mw: fy.builtMW, kind: "CLAIMED", page },
        { rung: "Installed", mw: fy.installedMW, kind: "CLAIMED", page },
        { rung: "Sold", mw: fy.operationalMW, kind: "DELIVERED", page },
      ],
      headlineMW: fy.builtMW,
      earningMW: fy.operationalMW,
      earningShare: (fy.operationalMW / fy.builtMW) * 100,
      sourceLabel: sisl.periodsSource.label,
    },
    {
      ticker: "ANANTRAJ",
      name: ar.listedParent,
      period: ar.annualReport.fiscalYear,
      rungs: arRungs.map((r) => ({ rung: r.rung, mw: r.mw, kind: r.kind, page: r.page })),
      headlineMW: claimed.mw,
      earningMW: live.mw,
      earningShare: (live.mw / claimed.mw) * 100,
      sourceLabel: ar.annualReport.compositionSource.label,
    },
  ];

  return {
    companies,
    max: Math.max(...companies.flatMap((c) => c.rungs.map((r) => r.mw))),
    /** How many times larger one operator's headline estate is than the other's. */
    sizeMultiple:
      Math.max(...companies.map((c) => c.headlineMW)) /
      Math.min(...companies.map((c) => c.headlineMW)),
  };
}
