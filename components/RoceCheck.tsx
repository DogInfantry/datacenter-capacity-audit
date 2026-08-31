type Row = {
  label: string;
  printed: number;
  withLeases: number | null;
  withoutLeases: number | null;
  deltaWith: number | null;
  deltaWithout: number | null;
  checkable: boolean;
};

/**
 * The published return on capital against the same figure rebuilt.
 *
 * Drawn as deviation from what the issuer printed rather than as two bars of
 * the level. The levels sit close enough together that a paired bar chart would
 * show two bars of the same height and hide the entire point, which is how far
 * each reading of the formula misses by. Zero is the printed figure, so a bar
 * of no length means the rebuild landed on it exactly.
 *
 * The period that cannot be checked is drawn as an absence with the reason
 * written inside it, never as a zero. A zero would say the rebuild agreed.
 */
export function RoceCheck({ rows }: { rows: Row[] }) {
  const spans = rows
    .flatMap((r) => [r.deltaWith, r.deltaWithout])
    .filter((v): v is number => v !== null);
  const max = Math.max(0.8, ...spans.map(Math.abs));

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--accent)" }}
          />
          Lease liabilities counted as borrowings
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--signal)" }}
          />
          Lease liabilities excluded, the formula as printed
        </span>
      </div>

      <ul className="space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="grid grid-cols-[6rem_1fr] items-center gap-3 text-xs">
            <span className="flex flex-col text-muted">
              <span className="truncate">{r.label}</span>
              <span className="tnum text-foreground">{r.printed.toFixed(2)} per cent</span>
            </span>

            {r.checkable ? (
              <span className="relative block h-9">
                {/* Zero is what the issuer printed. Everything is measured from it. */}
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-1/2 w-px"
                  style={{ background: "var(--line)" }}
                />
                {[
                  { d: r.deltaWith as number, tone: "var(--accent)", top: "0.25rem", label: "1.5" },
                  {
                    d: r.deltaWithout as number,
                    tone: "var(--signal)",
                    top: "1.25rem",
                    label: "6",
                  },
                ].map((b) => {
                  const w = (Math.abs(b.d) / max) * 46;
                  return (
                    <span key={b.tone}>
                      <span
                        className="absolute h-3 rounded-sm"
                        style={{
                          top: b.top,
                          background: b.tone,
                          width: `${Math.max(w, 0.4)}%`,
                          left: b.d >= 0 ? "50%" : `${50 - w}%`,
                        }}
                      />
                      <span
                        className="absolute right-0 tnum text-[11px] text-muted"
                        style={{ top: `${b.label}` === "1.5" ? "0.15rem" : "1.15rem" }}
                      >
                        {/* A rebuild that lands exactly reads 0.00, never minus
                            zero, which looks like a miss too small to see. */}
                        {Math.abs(b.d) < 0.005 ? "0.00" : `${b.d > 0 ? "+" : ""}${b.d.toFixed(2)}`}
                      </span>
                    </span>
                  );
                })}
              </span>
            ) : (
              <span className="block rounded-sm border border-dashed border-line px-3 py-2 text-[11px] leading-relaxed text-muted">
                Cannot be rebuilt. An average needs the capital employed of the year before, and the
                balance sheet stops here.
              </span>
            )}
          </li>
        ))}
      </ul>

      <p className="mt-4 text-[11px] leading-relaxed text-muted">
        Points of return on capital, measured from the figure the issuer published. Zero is exact
        agreement.
      </p>
    </div>
  );
}
