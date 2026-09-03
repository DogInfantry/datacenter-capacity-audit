import type { coverageMatrix } from "@/lib/diagnostics/coverage";
import { Monogram } from "./Visual";

/**
 * Six pillars against the subjects each could be put to, as filled and empty
 * cells rather than as five paragraphs saying the same thing at greater length.
 *
 * The prose version of this went stale three times in one working session,
 * because every new measure invalidated a sentence written by the one before
 * it. Counting is the fix: the cells derive from the same file the states are
 * checked against, so adding a measure moves the picture without anyone
 * rewriting a claim.
 *
 * The empty cells carry the meaning here, so they are drawn rather than left
 * out. A row that is mostly empty is the honest shape of that pillar.
 */

type Data = ReturnType<typeof coverageMatrix>;

/**
 * Three tones rather than four, and the cell fill does not use them.
 *
 * A filled cell means the same thing in every row, so colouring it by the row's
 * state made the most complete pillar the least visible in the dark theme,
 * where the deep accent sits almost on the card. The fill is now one colour for
 * measured and the chip carries the state, as an outline so that it reads in
 * both themes without depending on a background it cannot check.
 */
const STATE_TONE: Record<string, string> = {
  BUILT: "var(--accent)",
  PARTIAL: "var(--accent)",
  BLOCKED: "var(--signal)",
  TERMINAL: "var(--muted)",
};

/**
 * The words describe coverage rather than completeness, because that is what the
 * guard behind them checks. A pillar asked of most of its subjects still has
 * plenty open on each of them, and calling that Built read as finished.
 */
const STATE_WORD: Record<string, string> = {
  BUILT: "Most subjects",
  PARTIAL: "Some subjects",
  BLOCKED: "Blocked",
  TERMINAL: "Terminal",
};

export function PillarMatrix({ data }: { data: Data }) {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-line pb-4">
        <p className="max-w-md text-sm leading-relaxed text-muted">
          Every pillar against every subject a filing has been read or harvested for. A filled cell
          is a measure that computes and renders. The empty ones are the point.
        </p>
        <p className="shrink-0">
          <span className="tnum font-display text-3xl tracking-tight text-foreground">
            {data.filled}
          </span>
          <span className="tnum text-lg text-muted"> / {data.total}</span>
        </p>
      </div>

      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 border-b border-line pb-3 text-[11px] text-muted">
        {data.subjects.map((s) => (
          <span key={s.id} className="flex items-center gap-1.5">
            <Monogram name={s.mark} size={16} />
            <dt className="inline">{s.label}</dt>
          </span>
        ))}
      </dl>

      <div className="mt-4 grid gap-4">
        {data.rows.map((r) => (
          <div key={r.id}>
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span className="flex items-center gap-2">
                <span className="font-display text-base tracking-tight">{r.label}</span>
                <span
                  className="rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
                  style={{ borderColor: STATE_TONE[r.state], color: STATE_TONE[r.state] }}
                >
                  {STATE_WORD[r.state]}
                </span>
              </span>
              <span className="tnum text-xs text-muted">
                {r.count} of {data.subjects.length}
                {r.exhibits.length > 0
                  ? ` · Exhibit ${r.exhibits.join(", ")}`
                  : " · no exhibit"}
              </span>
            </div>

            <div
              className="mt-1.5 flex gap-1"
              role="img"
              aria-label={`${r.label}: measured for ${r.count} of ${data.subjects.length} subjects, ${r.covered.join(", ") || "none"}`}
            >
              {r.cells.map((c) => (
                <span
                  key={c.id}
                  title={`${c.label}: ${c.covered ? "measured" : "not measured"}`}
                  className="h-4 flex-1 rounded-[2px] border"
                  style={{
                    background: c.covered ? "var(--accent)" : "transparent",
                    borderColor: c.covered ? "var(--accent)" : "var(--line)",
                  }}
                />
              ))}
            </div>

            <p className="mt-1.5 text-xs leading-relaxed text-muted">{r.open}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
