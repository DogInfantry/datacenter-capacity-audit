import type { LadderCompany } from "@/lib/diagnostics/compare";
import { Logo } from "./Logo";
import { Pictogram } from "./Visual";

/** Descending rungs, light to dark, because these are magnitudes of one
 *  quantity rather than separate identities. The same ramp the estate exhibit
 *  and the Anant Raj ladder already use. */
const TONES = ["var(--rung-1)", "var(--rung-2)", "var(--rung-4)", "var(--rung-4)"];

/**
 * Two estates, two vocabularies, one megawatt scale.
 *
 * Each column is one company's own rungs in its own words. Nothing is drawn
 * between the columns, because a bar in one is not the same measurement as the
 * bar beside it: one company publishes built, installed and sold, the other
 * publishes a headline that mixes operational with advance stage and an
 * operational figure printed two pages away.
 *
 * What does travel is the figure above each ladder, which is that company's own
 * earning capacity over its own headline. It is the same question asked twice,
 * and it is set in the largest type in the exhibit because it is the only thing
 * here a reader can carry from one column to the other.
 *
 * The shared scale is the second finding. Both ladders are drawn against the
 * widest rung anywhere in the exhibit, so the smaller operator's whole estate
 * reads as the fraction of the larger one that it is.
 */
export function CapacityLadders({
  companies,
  max,
  scaleNote,
}: {
  companies: LadderCompany[];
  max: number;
  scaleNote: string;
}) {
  const w = (v: number) => `${(v / max) * 100}%`;
  const mw = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 2 });

  return (
    <div>
      <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line lg:grid-cols-2">
        {companies.map((c) => (
          <div key={c.ticker} className="bg-card p-5">
            <div className="flex items-center gap-2.5">
              <Logo ticker={c.ticker} name={c.name} size="md" tone="var(--accent-deep)" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">{c.name}</span>
                <span className="block text-[11px] text-muted">{c.period}</span>
              </span>
            </div>

            <p className="mt-4 flex items-baseline gap-2">
              <span className="font-display text-4xl tracking-tight tnum text-accent">
                {c.earningShare.toFixed(1)}
              </span>
              <span className="text-sm text-muted">per cent of its headline earns</span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted">
              <span className="tnum">{mw(c.earningMW)}</span> MW of{" "}
              <span className="tnum">{mw(c.headlineMW)}</span>, both printed in the same document.
            </p>

            <ul className="mt-5 space-y-2.5">
              {c.rungs.map((r, i) => (
                <li key={r.rung} className="text-xs">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate">
                      <span className={r.kind === "DELIVERED" ? "text-foreground" : "text-muted"}>
                        {r.rung}
                      </span>
                      <span className="ml-1.5 text-[10px] text-muted">page {r.page}</span>
                    </span>
                    <span className="shrink-0 tnum text-muted">{mw(r.mw)} MW</span>
                  </div>
                  <span className="mt-1.5 block h-6 rounded-sm bg-grid">
                    <span
                      className="block h-6 rounded-sm transition-[width] duration-500"
                      style={{ width: w(r.mw), background: TONES[Math.min(i, TONES.length - 1)] }}
                    />
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">{scaleNote}</p>

      <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
        {companies.map((c) => (
          <div key={c.ticker} className="bg-card p-4">
            <p className="text-[11px] uppercase tracking-wider text-muted">{c.name}</p>
            <div className="mt-3">
              <Pictogram
                filledPct={c.earningShare}
                filledLabel="earning"
                emptyLabel="not earning"
                columns={20}
                unit="megawatts of the headline figure"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
