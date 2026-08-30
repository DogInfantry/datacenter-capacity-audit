type Row = {
  publisher: string;
  mw: number;
  mwHigh: number | null;
  mwTop: number;
  byYear: number;
  basis: string;
  soldMW: number;
  soldMWTop: number;
};

const gw = (mw: number) => (mw / 1000).toFixed(1);

/**
 * The published forecasts, and the same forecasts in the unit that earns.
 *
 * Two bars per house, nested rather than side by side, because the second is
 * not a rival forecast. It is the same number restated, and nesting says so,
 * where two adjacent bars would imply a competing projection this project has
 * not made and could not support.
 *
 * The current operational figure is drawn on the same scale, because the
 * distance between it and even the lowest forecast is the part a reader should
 * leave with.
 */
export function ForecastSpread({
  rows,
  max,
  currentMW,
  currentYear,
  conversion,
}: {
  rows: Row[];
  max: number;
  currentMW: number;
  currentYear: number;
  conversion: number;
}) {
  const pct = (v: number) => `${(v / max) * 100}%`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        {[
          ["As published, built capacity", "var(--rung-1)"],
          ["Restated at the measured sold share", "var(--accent-deep)"],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
            {l}
          </span>
        ))}
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-[2px]"
            style={{ background: "var(--foreground)" }}
          />
          Floor of a published band
        </span>
      </div>

      <ul className="space-y-4">
        {rows.map((r) => (
          <li key={r.publisher}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-sm font-medium">{r.publisher}</span>
              <span className="tnum text-xs text-muted">
                <span className="text-foreground">
                  {gw(r.mw)}
                  {r.mwHigh ? ` to ${gw(r.mwHigh)}` : ""}
                </span>{" "}
                GW by {r.byYear}
              </span>
            </div>
            <span className="relative mt-1.5 block h-6 overflow-hidden rounded-sm bg-grid">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{ width: pct(r.mwTop), background: "var(--rung-1)" }}
              />
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{ width: pct(r.soldMWTop), background: "var(--accent-deep)" }}
              />
              {/* The floor of a published band, drawn as a tick rather than a
                  second fill. On the bull row it falls within a rounding of the
                  restated top, and two fills at the same width would read as a
                  rendering fault instead of the coincidence it is. */}
              {r.mwHigh && (
                <span
                  aria-hidden
                  className="absolute inset-y-0 w-[2px]"
                  style={{ left: pct(r.mw), background: "var(--foreground)" }}
                />
              )}
            </span>
            <p className="mt-1 text-[11px] text-muted">
              {r.basis}. Restated:{" "}
              <span className="tnum">
                {gw(r.soldMW)}
                {r.mwHigh ? ` to ${gw(r.soldMWTop)}` : ""}
              </span>{" "}
              GW earning.
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-line pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
          <span className="text-sm font-medium text-signal">Operational today, {currentYear}</span>
          <span className="tnum text-xs text-muted">
            <span className="text-foreground">{gw(currentMW)}</span> GW
          </span>
        </div>
        <span className="relative mt-1.5 block h-6 overflow-hidden rounded-sm bg-grid">
          <span
            className="absolute inset-y-0 left-0 rounded-sm"
            style={{ width: pct(currentMW), background: "var(--signal)" }}
          />
        </span>
        <p className="mt-1 text-[11px] text-muted">
          Drawn on the same scale as the forecasts above it.
        </p>
      </div>

      <p className="mt-5 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        The sold share applied is{" "}
        <span className="tnum text-foreground">{(conversion * 100).toFixed(0)}</span> per cent,
        measured from a filed prospectus rather than assumed. It is one estate, and it is the only
        Indian estate where built and sold capacity are both printed.
      </p>
    </div>
  );
}
