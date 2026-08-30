type ScoredPage = {
  printedPage: number;
  section: string;
  numberDensity: number;
  hedgeDensity: number;
  substanceScore: number;
};

/** The top tenth of scored pages. A rule that recommends half the document has
 *  not triaged anything, so the threshold is stated rather than tuned. */
export const TOP_DECILE = 0.1;

/**
 * Where the pages this site actually cites fall in the ranking the reading rule
 * produces.
 *
 * This exists to be able to fail, and it does. The rule scores number density
 * divided by one plus hedge density, so it rewards tables and punishes prose,
 * and the honest question is whether the pages that produced findings are the
 * pages it recommends. For some of them it is. For the rest it is not, and the
 * reason is a property of the rule rather than an accident: a finding stated in
 * a sentence inside a risk factor scores near the bottom however load bearing
 * it turns out to be.
 */
export function citedPageRanks(pages: ScoredPage[], cited: number[]) {
  const ranked = [...pages].sort((a, b) => b.substanceScore - a.substanceScore);
  const rankOf = new Map(ranked.map((p, i) => [p.printedPage, i + 1]));
  const cutoff = Math.round(ranked.length * TOP_DECILE);

  const rows = cited
    .map((printedPage) => {
      const page = ranked.find((p) => p.printedPage === printedPage);
      if (!page) return null;
      const rank = rankOf.get(printedPage)!;
      return {
        printedPage,
        section: page.section,
        substanceScore: page.substanceScore,
        numberDensity: page.numberDensity,
        hedgeDensity: page.hedgeDensity,
        rank,
        /** 100 is the top of the ranking, 0 the bottom. */
        percentile: ((ranked.length - rank) / (ranked.length - 1)) * 100,
        foundByRule: rank <= cutoff,
      };
    })
    .filter((r): r is NonNullable<typeof r> => r !== null)
    .sort((a, b) => a.rank - b.rank);

  return {
    scored: ranked.length,
    cutoff,
    rows,
    foundByRule: rows.filter((r) => r.foundByRule).length,
    foundByReading: rows.filter((r) => !r.foundByRule).length,
    /** The rule's own recommendation, whether or not anybody read it. */
    topByRule: ranked.slice(0, cutoff).map((p) => p.printedPage),
  };
}
