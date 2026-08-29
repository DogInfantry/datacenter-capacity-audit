import type { Invariants } from "@/lib/schema";

/** One step of the ramp per category, so the summary bar and the block headings
 *  agree without either of them naming a colour twice. */
const TONES = [
  "var(--accent-deep)",
  "var(--accent)",
  "var(--rung-2)",
  "var(--rung-1)",
  "var(--rung-4)",
  "var(--signal)",
  "var(--muted)",
];

/**
 * What the build guarantees, grouped by what each guarantee is for.
 *
 * The register is long on purpose: the count is the point. It opens on the
 * findings, because those are the rows where a guard does something a schema
 * normally cannot, holding a sentence of published prose to the numbers
 * underneath it. The rest fold away so the page stays readable without the
 * total being quietly hidden.
 */
export function InvariantLedger({ data }: { data: Invariants }) {
  const groups = data.categories.map((c, i) => ({
    ...c,
    tone: TONES[i % TONES.length],
    rows: data.rows.filter((r) => r.category === c.id),
  }));
  const total = data.rows.length;

  return (
    <div>
      <div className="flex h-5 w-full overflow-hidden rounded-sm bg-grid">
        {groups.map((g) => (
          <div
            key={g.id}
            className="h-5"
            style={{ width: `${(g.rows.length / total) * 100}%`, background: g.tone }}
          />
        ))}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        {groups.map((g) => (
          <span key={g.id} className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: g.tone }} />
            <span className="tnum text-foreground">{g.rows.length}</span>
            {g.name.toLowerCase()}
          </span>
        ))}
      </div>

      <div className="mt-7 space-y-4">
        {groups.map((g, i) => (
          <details key={g.id} open={i === 0} className="rounded-md border border-line">
            <summary className="cursor-pointer list-none px-5 py-4 hover:bg-accent-soft">
              <span className="flex items-baseline justify-between gap-3">
                <span className="flex items-baseline gap-2.5">
                  <span
                    aria-hidden
                    className="inline-block h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ background: g.tone }}
                  />
                  <span className="font-display text-lg tracking-tight">{g.name}</span>
                </span>
                <span className="tnum shrink-0 text-sm text-muted">
                  <span className="text-foreground">{g.rows.length}</span> of {total}
                </span>
              </span>
              <span className="mt-1.5 block text-sm leading-relaxed text-muted">{g.gloss}</span>
            </summary>

            <ul className="border-t border-line">
              {g.rows.map((r) => (
                <li key={r.id} className="border-b border-line px-5 py-4 last:border-b-0">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                    <span className="exhibit-label">{r.id}</span>
                    <span className="font-mono text-[11px] text-muted">{r.schema}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed">{r.protects}</p>
                  <p className="mt-2 font-mono text-[11px] leading-relaxed text-muted">
                    <span className="text-signal">build fails: </span>
                    {r.fragment}
                  </p>
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
