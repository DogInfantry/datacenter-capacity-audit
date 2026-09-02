import type { AnantRaj, Netweb, Sisl, TechnoElectric } from "@/lib/schema";

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

export function compareSubjects(
  sisl: Sisl,
  ar: AnantRaj,
  nw: Netweb,
  te: TechnoElectric,
): CompareSubject[] {
  return [
    { ticker: "SIFY", name: sisl.entity, unit: "megawatts", excluded: null },
    { ticker: "ANANTRAJ", name: ar.listedParent, unit: "megawatts", excluded: null },
    {
      ticker: "TECHNOE",
      name: te.listedParent,
      unit: "megawatts",
      excluded:
        "Its megawatts are filed and cited, so it stands in the ladders. The financial statements in the same report are not drawn on here, so it appears in none of the financial rows.",
    },
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
/**
 * Lakhs to millions.
 *
 * A change of scale inside one currency, the same move as megawatts to
 * gigawatts, and not a currency conversion. Ten lakh is one million by
 * definition, so nothing below rests on a rate that would have to be sourced
 * and could not be. The two filings print different scales; the table prints
 * one, and says which in every unit label.
 */
const lakhToMillion = (lakh: number) => lakh / 10;

export function compareRows(sisl: Sisl, ar: AnantRaj): CompareRow[] {
  const full = sisl.periods.filter((p) => !p.stub);
  const fy = full[full.length - 1];
  const claimed = ar.annualReport.rungs.find((r) => r.kind === "CLAIMED")!;
  const live = ar.annualReport.rungs.find((r) => r.rung === "Operationalised")!;
  // The last full year, which ends on the same date as the other company's, so
  // the rows below are the same twelve months on both sides.
  const cfoLatest = sisl.cashFlow[sisl.cashFlow.length - 2];
  const fin = ar.financials;
  const arm = fin.dataCentreArm;

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
      metric: "Revenue from data centres",
      basis:
        "The second row that is like for like. One of these companies is a data centre operator entire, so its revenue is the answer. The other prints its data centre arm as one column in a statement of subsidiaries, and that column is the answer. Same measure, same period end, both filed.",
      comparable: true,
      kind: "FINANCIAL",
      cells: {
        SIFY: cell(fy.revenue, "Rs mn"),
        ANANTRAJ: cell(lakhToMillion(arm.turnover), "Rs mn"),
      },
    },
    {
      metric: "Revenue, whole group",
      basis:
        "Not a comparison, and it is here to stop the row above being read as one. For one company the group is the data centre. For the other the group is a property developer, and the data centre is about one per cent of it.",
      comparable: false,
      kind: "FINANCIAL",
      cells: {
        SIFY: cell(fy.revenue, "Rs mn"),
        ANANTRAJ: cell(lakhToMillion(fin.profitAndLoss.revenue), "Rs mn"),
      },
    },
    {
      metric: "Operating cash flow, whole group",
      basis:
        "Filed by both, at group level by both. For one that is cash from selling megawatts. For the other it is mostly cash from selling homes, so the levels sit side by side without asking the same question.",
      comparable: false,
      kind: "FINANCIAL",
      cells: {
        SIFY: cell(cfoLatest.cfo, "Rs mn"),
        ANANTRAJ: cell(lakhToMillion(fin.cashFlow.netCashFromOperations), "Rs mn"),
      },
    },
    {
      metric: "Return on capital, as each publishes it",
      basis:
        "Both print the ratio and neither prints the same one. One divides by average capital employed, the other by capital employed at the close. A closing denominator in a year of rising equity flatters the result, so these two numbers are not a ranking however alike they look.",
      comparable: false,
      kind: "FINANCIAL",
      cells: {
        SIFY: cell(fy.roce, "per cent, average capital"),
        ANANTRAJ: cell(fin.ratios.returnOnCapitalEmployed * 100, "per cent, closing capital"),
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
  /** The company's own words for the earning rung, where the phrasing carries a
   *  qualifier worth quoting rather than paraphrasing. */
  earningWords?: string;
};

/**
 * The third operator's disclosure, at a level the other two are not measured on.
 *
 * Sify and Anant Raj publish an estate. This one publishes three campuses and
 * the phasing inside one of them, which puts the announced against delivered gap
 * inside a single address rather than across a portfolio. Returned as numbers so
 * the page states the ratio rather than repeating it.
 */
export function technoDisclosure(te: TechnoElectric) {
  const phased = te.campuses.filter((c) => c.firstPhaseMW !== null);
  return {
    phased: phased.map((c) => ({
      name: c.name,
      campusMW: c.mw,
      firstPhaseMW: c.firstPhaseMW as number,
      ratio: c.mw / (c.firstPhaseMW as number),
      words: c.statusWords,
      page: c.page,
    })),
    live: te.campuses
      .filter((c) => c.status === "LIVE")
      .map((c) => ({ name: c.name, mw: c.mw, words: c.statusWords, page: c.page })),
    targetMW: te.target.mw,
    targetBy: te.target.by,
    targetPage: te.target.page,
  };
}

/**
 * The three estates as ladders on one megawatt scale.
 *
 * Each ladder is one company's own published rungs in that company's own words.
 * The words do not correspond across the two, which is why nothing is drawn
 * between them and only the ratio at the foot of each ladder travels: what
 * earns over what is headlined, asked of each company against its own numbers.
 *
 * One shared scale rather than three indexed ones. Indexing each estate to its
 * own top would draw every ladder the same width and hide that one of these
 * companies operates an order of magnitude more capacity than the others.
 *
 * Forward looking rungs are excluded. A planned figure is not capacity and
 * putting it on the same axis as a built one is the move this whole site exists
 * to point at.
 */
export function compareLadders(sisl: Sisl, ar: AnantRaj, te: TechnoElectric) {
  const full = sisl.periods.filter((p) => !p.stub);
  const fy = full[full.length - 1];
  const page = sisl.periodsSource.page;

  const arRungs = ar.annualReport.rungs.filter((r) => r.kind !== "AMBITION");
  const claimed = arRungs.find((r) => r.kind === "CLAIMED")!;
  const live = arRungs.find((r) => r.rung === "Operationalised")!;
  // Only the campuses the report calls live. The 250 MW target is an ambition
  // and is excluded here for the same reason Anant Raj's 307 is.
  const teLive = te.campuses.filter((c) => c.status === "LIVE").reduce((t, c) => t + c.mw, 0);
  const tePortfolio = te.campuses.reduce((t, c) => t + c.mw, 0);

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
    // The third operator publishes campuses rather than an estate, so its widest
    // rung is the three of them added together. That sum is not a figure the
    // report prints, and the rung is named for what it is rather than borrowing
    // the authority of a printed total.
    {
      ticker: "TECHNOE",
      name: te.listedParent,
      period: te.annualReport.fiscalYear,
      rungs: [
        {
          rung: "Three campuses added together",
          mw: tePortfolio,
          kind: "CLAIMED" as const,
          page: te.campusesSource.page,
        },
        {
          rung: "Commissioned and live",
          mw: teLive,
          kind: "DELIVERED" as const,
          page: te.campusesSource.page,
        },
      ],
      headlineMW: tePortfolio,
      earningMW: teLive,
      earningShare: (teLive / tePortfolio) * 100,
      sourceLabel: te.campusesSource.label,
      earningWords: te.campuses.find((c) => c.status === "LIVE")?.statusWords,
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
