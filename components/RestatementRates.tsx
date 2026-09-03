import type { restatementRates } from "@/lib/diagnostics/restatement";
import { Monogram } from "./Visual";

/**
 * What each filer went back and changed, drawn over what it was asked.
 *
 * The bar length is the denominator. A filer harvested for nine concepts across
 * eight years has seventy six chances to restate and one harvested for three
 * across six has eighteen, so a rate alone would flatter the second and a count
 * alone would flatter the first. Drawing the track at its true length puts both
 * on the page at once: the short bar that is heavily filled and the long bar
 * that is empty say different things, and neither is legible without the other.
 *
 * The cells are the harvested points themselves rather than a proportion, so a
 * filer that restated nothing shows an unbroken empty track rather than a bar
 * of zero width that a reader could take for missing data.
 */

type Data = ReturnType<typeof restatementRates>;

export function RestatementRates({ data }: { data: Data }) {
  return (
    <div>
      <div className="grid gap-4">
        {data.rows.map((r) => {
          return (
            <div key={r.ticker}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <span className="flex items-center gap-2 text-sm text-foreground">
                  <Monogram name={r.name} size={18} />
                  {r.name}
                </span>
                <span className="tnum text-xs text-muted">
                  {r.restated} of {r.points} points ·{" "}
                  <span className="text-foreground">{r.ratePct.toFixed(1)}%</span> ·{" "}
                  {r.conceptsHarvested} concepts
                </span>
              </div>
              <div
                className="mt-1.5 flex h-5 gap-px"
                style={{ width: `${r.trackPct}%` }}
                role="img"
                aria-label={`${r.name}: ${r.restated} of ${r.points} harvested annual points later restated, ${r.ratePct.toFixed(1)} per cent`}
              >
                {Array.from({ length: r.points }, (_, i) => (
                  <span
                    key={i}
                    className="h-full flex-1 rounded-[1px]"
                    style={{
                      background: i < r.restated ? "var(--signal)" : "var(--grid)",
                      minWidth: "2px",
                    }}
                  />
                ))}
              </div>
              {r.restated > 0 ? (
                <p className="mt-1.5 text-xs leading-relaxed text-muted">
                  {r.conceptsRestated.join(", ")} · {r.periods.join(", ")}
                </p>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        Each track is one harvested annual point per cell, and the track is as long as the filer was
        asked. {data.largestDenominator.name} has the longest track at{" "}
        <span className="tnum text-foreground">{data.largestDenominator.points}</span> points and
        restated <span className="tnum text-foreground">{data.largestDenominator.restated}</span> of
        them. <span className="tnum text-foreground">{data.cleanCount}</span> of{" "}
        <span className="tnum text-foreground">{data.rows.length}</span> filers restated nothing at
        all.
      </p>
    </div>
  );
}
