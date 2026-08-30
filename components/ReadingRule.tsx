type Row = {
  printedPage: number;
  section: string;
  substanceScore: number;
  rank: number;
  percentile: number;
  foundByRule: boolean;
};

/**
 * Whether the reading rule actually found the pages that produced findings.
 *
 * Drawn as a ranking rather than a score, because the score's units mean
 * nothing to a reader while its position among five hundred and fifty three
 * pages means everything. The rows the rule missed are the point of the
 * exhibit, so they are neither sorted away nor shaded out.
 */
export function ReadingRule({
  rows,
  scored,
  cutoff,
  lexicon,
}: {
  rows: Row[];
  scored: number;
  cutoff: number;
  lexicon: string[];
}) {
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        {[
          ["Found by the rule, top decile", "var(--accent-deep)"],
          ["Found by reading, below it", "var(--signal)"],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>

      <ul className="space-y-2">
        {rows.map((r) => (
          <li
            key={r.printedPage}
            className="grid grid-cols-[3.25rem_1fr_4.75rem] items-center gap-3 text-xs"
          >
            <span className="tnum text-muted">p. {r.printedPage}</span>
            <span className="relative block h-5 overflow-hidden rounded-sm bg-grid">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{
                  width: `${r.percentile}%`,
                  background: r.foundByRule ? "var(--accent-deep)" : "var(--signal)",
                }}
              />
              <span className="absolute inset-y-0 left-2 right-2 flex items-center text-[10px] text-muted">
                <span className="truncate">{r.section.toLowerCase()}</span>
              </span>
            </span>
            <span className="text-right tnum text-muted">
              {r.rank} of {scored}
            </span>
          </li>
        ))}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        Bar length is the page&apos;s position in the ranking, not its score. The cutoff is the top{" "}
        <span className="tnum text-foreground">{cutoff}</span> of{" "}
        <span className="tnum text-foreground">{scored}</span> scored pages.
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted hover:text-accent">
          The hedge lexicon, all {lexicon.length} terms
        </summary>
        <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">{lexicon.join(", ")}</p>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Published so the ranking can be argued with. A score whose word list is hidden is not
          falsifiable, and this one is wrong often enough that hiding it would matter.
        </p>
      </details>
    </div>
  );
}
