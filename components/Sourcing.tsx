import { Icon, type IconName } from "./Visual";

type Tier = {
  name: string;
  count: number;
  tone: string;
  rule: string;
  icon: IconName;
};

/**
 * The three sourcing tiers, with the counts that actually obtain.
 *
 * Ordered by how far a figure has been checked rather than by how many there
 * are of it, so the shape of the bars is the argument: the tier the whole
 * product rests on is the smallest one.
 */
export function SourcingTiers({ tiers, total }: { tiers: Tier[]; total: number }) {
  return (
    <ul className="space-y-4">
      {tiers.map((t) => (
        <li key={t.name}>
          <div className="flex items-baseline justify-between gap-3">
            <span className="flex items-center gap-2 text-sm font-medium">
              <span style={{ color: t.tone }}>
                <Icon name={t.icon} size={16} />
              </span>
              {t.name}
            </span>
            <span className="tnum text-sm text-muted">
              <span className="text-foreground">{t.count}</span> of {total}
            </span>
          </div>
          <div className="mt-1.5 h-4 w-full overflow-hidden rounded-sm bg-grid">
            <div
              className="h-4 rounded-sm"
              style={{ width: `${(t.count / total) * 100}%`, background: t.tone }}
            />
          </div>
          <p className="mt-1.5 text-xs leading-relaxed text-muted">{t.rule}</p>
        </li>
      ))}
    </ul>
  );
}

/**
 * The document, one cell per page, with the cited pages lit.
 *
 * Ten pages of five hundred and sixty three is a sentence a reader skims. The
 * same fact as a grid is a picture of how narrow the evidence base is, and it
 * is built from the citations themselves rather than from a count typed into
 * prose, so it cannot drift away from what the site actually cites.
 */
export function PageGrid({
  totalPages,
  cited,
  offset,
}: {
  totalPages: number;
  cited: number[];
  /** Printed page plus this equals the index in the PDF. The grid is drawn in
   *  PDF order, because that is the physical document. */
  offset: number;
}) {
  const lit = new Set(cited.map((p) => p + offset));
  return (
    <div>
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: "repeat(40, minmax(0, 1fr))" }}
        role="img"
        aria-label={`A ${totalPages} page document. ${cited.length} printed pages are cited on this site: ${cited.join(", ")}.`}
      >
        {Array.from({ length: totalPages }, (_, i) => (
          <span
            key={i}
            className="aspect-square rounded-[1px]"
            style={{ background: lit.has(i) ? "var(--accent)" : "var(--grid)" }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--accent)" }}
          />
          <span className="tnum font-medium">{cited.length}</span>
          <span className="text-muted">printed pages read and cited</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--grid)" }}
          />
          <span className="tnum font-medium">{totalPages - cited.length}</span>
          <span className="text-muted">not read</span>
        </span>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        Printed pages {cited.join(", ")}. Printed page plus {offset} is the index in the PDF, which
        is why the lit cells sit slightly right of where the printed numbers alone would put them.
      </p>
    </div>
  );
}
