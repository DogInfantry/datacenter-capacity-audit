const W = 720;
const H = 430;
const M = { top: 18, right: 18, bottom: 46, left: 54 };

type Page = {
  printedPage: number;
  section: string;
  numberDensity: number;
  hedgeDensity: number;
};

/**
 * Three groups, not twenty. A dot per section would need a palette nobody can
 * read; the argument only needs evidence, the commissioned study, and the
 * hedged sections separated from each other.
 */
function group(section: string) {
  if (section === "RISK FACTORS" || section === "OFFER STRUCTURE") return "hedged";
  if (section === "INDUSTRY OVERVIEW") return "commissioned";
  if (
    section.startsWith("RESTATED") ||
    section.startsWith("OBJECTS") ||
    section.startsWith("SUMMARY OF FINANCIAL") ||
    section.startsWith("OTHER FINANCIAL") ||
    section.startsWith("CAPITALISATION")
  )
    return "audited";
  return "other";
}

const TONE: Record<string, string> = {
  audited: "var(--accent)",
  hedged: "var(--private)",
  commissioned: "var(--ord-3)",
  other: "var(--muted)",
};

const LABEL: Record<string, string> = {
  audited: "Audited and objects",
  hedged: "Risk factors and offer procedure",
  commissioned: "Commissioned market study",
  other: "Everything else",
};

const median = (xs: number[]) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

/**
 * Every page of the prospectus, plotted by how much it commits to.
 *
 * Numbers on one axis, hedging on the other. A page thick with figures and thin
 * on "may" and "no assurance" is where the issuer committed to something. The
 * opposite corner is where it did not. The rule is applied to every scored page
 * equally, so this is a ranking rather than a selection, and the word list
 * behind the hedging axis ships in the data so it can be argued with.
 */
export function FluffScatter({
  pages,
  lexiconSize,
}: {
  pages: Page[];
  lexiconSize: number;
}) {
  const maxNum = Math.max(...pages.map((p) => p.numberDensity));
  const maxHedge = Math.max(...pages.map((p) => p.hedgeDensity));
  const mx = median(pages.map((p) => p.hedgeDensity));
  const my = median(pages.map((p) => p.numberDensity));

  const px = (v: number) => M.left + (v / maxHedge) * (W - M.left - M.right);
  const py = (v: number) => H - M.bottom - (v / maxNum) * (H - M.top - M.bottom);

  // the two pages the triage ranks highest, both of which define their own terms
  const marked = pages
    .filter((p) => p.printedPage === 49 || p.printedPage === 301)
    .sort((a, b) => a.printedPage - b.printedPage);

  return (
    <figure className="mt-8">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        {(["audited", "commissioned", "hedged", "other"] as const).map((g) => (
          <span key={g} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: TONE[g], opacity: g === "other" ? 0.45 : 1 }}
            />
            {LABEL[g]}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[36rem]"
          role="img"
          aria-label={`Scatter of ${pages.length} prospectus pages. Horizontal axis is hedging word density, vertical axis is numeric density. Audited and objects pages cluster high on numbers and low on hedging; risk factors and offer procedure cluster the opposite way.`}
        >
          <line x1={px(mx)} y1={M.top} x2={px(mx)} y2={H - M.bottom} stroke="var(--line)" />
          <line x1={M.left} y1={py(my)} x2={W - M.right} y2={py(my)} stroke="var(--line)" />

          <text x={M.left + 6} y={M.top + 12} fontSize="10" fill="var(--muted)">
            evidence: figures, little hedging
          </text>
          <text
            x={W - M.right - 6}
            y={H - M.bottom - 6}
            textAnchor="end"
            fontSize="10"
            fill="var(--muted)"
          >
            defensive prose: hedging, few figures
          </text>

          {pages.map((p) => {
            const g = group(p.section);
            return (
              <circle
                key={p.printedPage}
                cx={px(p.hedgeDensity)}
                cy={py(p.numberDensity)}
                r={g === "other" ? 2 : 2.6}
                fill={TONE[g]}
                opacity={g === "other" ? 0.32 : 0.7}
              />
            );
          })}

          {marked.map((p) => (
            <g key={p.printedPage}>
              <circle
                cx={px(p.hedgeDensity)}
                cy={py(p.numberDensity)}
                r="5"
                fill="none"
                stroke="var(--foreground)"
                strokeWidth="1.5"
              />
              <text
                x={px(p.hedgeDensity) + 9}
                y={py(p.numberDensity) + 4}
                fontSize="10"
                fill="var(--foreground)"
              >
                p{p.printedPage}
              </text>
            </g>
          ))}

          <text
            x={(W + M.left) / 2}
            y={H - 10}
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted)"
          >
            hedging words, per cent of page
          </text>
          <text
            x={-(H - M.bottom + M.top) / 2}
            y={14}
            transform="rotate(-90)"
            textAnchor="middle"
            fontSize="11"
            fill="var(--muted)"
          >
            numbers, per cent of page
          </text>
        </svg>
      </div>

      <figcaption className="mt-4 max-w-2xl text-xs leading-relaxed text-muted">
        All {pages.length} scored pages, ranked by a rule rather than selected by hand. Hedging is
        counted against a published list of {lexiconSize} terms that defer, qualify or disclaim, so
        the horizontal axis can be disagreed with on its own terms. The two circled pages are the
        densest in the document, and both are places where it defines its own measures.
      </figcaption>
    </figure>
  );
}
