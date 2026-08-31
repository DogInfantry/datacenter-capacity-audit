import { Icon } from "./Visual";

type CapitalRow = {
  publisher: string;
  byYear: number;
  addMW: number;
  addMWTop: number;
  banded: boolean;
  lakhCrLow: number;
  lakhCrHigh: number;
  timesBenchmark: number;
};

/**
 * The grid first, then the money, then what a megawatt costs to run.
 *
 * The top panel is the one place on this site where two quantities that sound
 * identical are drawn near each other, so both rows are labelled with the
 * quantity they measure and a divider sits between them. Grid demand is what
 * the building draws. Built capacity is what the servers are rated for. The
 * factor between them is a facility efficiency figure nothing in this
 * repository has read, so no conversion is drawn and none is implied.
 *
 * The middle panel is the same forecasts as the first exhibit on this page,
 * priced. The benchmark rule underneath them is the national artificial
 * intelligence programme's entire outlay, drawn at the same scale, and it is
 * meant to be nearly invisible.
 */
export function PowerAndCapital({
  currentGw,
  targetGw,
  targetLabel,
  estimator,
  builtCurrentGw,
  builtCurrentYear,
  forecastLowGw,
  forecastHighGw,
  capital,
  capexLow,
  capexHigh,
  capexSourceLabel,
  benchmarkLabel,
  marginLow,
  marginHigh,
  marginStable,
  powerShare,
}: {
  currentGw: number;
  targetGw: number;
  targetLabel: string;
  estimator: string;
  builtCurrentGw: number;
  builtCurrentYear: number;
  forecastLowGw: number;
  forecastHighGw: number;
  capital: {
    rows: CapitalRow[];
    max: number;
    benchmarkLakhCr: number;
  };
  capexLow: number;
  capexHigh: number;
  capexSourceLabel: string;
  benchmarkLabel: string;
  marginLow: number;
  marginHigh: number;
  marginStable: number;
  powerShare: number;
}) {
  const gwMax = Math.max(targetGw, forecastHighGw, builtCurrentGw, currentGw);
  const gw = (v: number) => `${(v / gwMax) * 100}%`;

  const crMax = capital.max / 1e5;
  const cr = (v: number) => `${(v / crMax) * 100}%`;

  return (
    <div className="space-y-7">
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            What the grid is asked to carry
          </p>
          <p className="text-[11px] text-muted">Gigawatts</p>
        </div>

        <ul
          className="mt-3 space-y-2"
          role="img"
          aria-label={`Data centre electricity demand is about ${currentGw} gigawatts today and is estimated by the ${estimator} at ${targetGw} gigawatts by ${targetLabel}.`}
        >
          <li className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-xs sm:grid-cols-[12rem_1fr_3.75rem]">
            <span className="truncate text-muted">Grid demand today</span>
            <span className="relative block h-7 rounded-sm bg-grid">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{ width: gw(currentGw), background: "var(--rung-2)" }}
              />
            </span>
            <span className="text-right tnum text-muted">{currentGw.toFixed(1)}</span>
          </li>
          <li className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-xs sm:grid-cols-[12rem_1fr_3.75rem]">
            <span className="truncate text-signal">Grid demand, {targetLabel} estimate</span>
            <span className="relative block h-7 rounded-sm bg-grid">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{ width: gw(targetGw), background: "var(--signal)" }}
              />
            </span>
            <span className="text-right tnum text-signal">{targetGw.toFixed(2)}</span>
          </li>
        </ul>

        <p className="mt-3 border-t border-dashed border-line pt-3 text-[11px] uppercase tracking-wider text-muted">
          A different quantity, on the same axis for size only
        </p>

        <ul
          className="mt-3 space-y-2"
          role="img"
          aria-label={`Built IT load capacity is ${builtCurrentGw} gigawatts in ${builtCurrentYear} and is forecast between ${forecastLowGw} and ${forecastHighGw} gigawatts.`}
        >
          <li className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-xs sm:grid-cols-[12rem_1fr_3.75rem]">
            <span className="truncate text-muted">Built IT load, {builtCurrentYear}</span>
            <span className="relative block h-7 rounded-sm bg-grid">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{ width: gw(builtCurrentGw), background: "var(--accent-deep)" }}
              />
            </span>
            <span className="text-right tnum text-muted">{builtCurrentGw.toFixed(1)}</span>
          </li>
          <li className="grid grid-cols-[7.5rem_1fr_3.5rem] items-center gap-3 text-xs sm:grid-cols-[12rem_1fr_3.75rem]">
            <span className="truncate text-muted">Built IT load, forecast range</span>
            <span className="relative block h-7 rounded-sm bg-grid">
              <span
                aria-hidden
                className="absolute inset-y-0 rounded-sm border border-dashed border-accent"
                style={{
                  left: gw(forecastLowGw),
                  width: gw(forecastHighGw - forecastLowGw),
                }}
              />
            </span>
            <span className="text-right tnum text-muted">
              {forecastLowGw.toFixed(1)} to {forecastHighGw.toFixed(1)}
            </span>
          </li>
        </ul>
      </section>

      <section className="border-t border-line pt-6">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[11px] uppercase tracking-wider text-muted">
            What that capacity costs to build
          </p>
          <p className="text-[11px] text-muted">Lakh crore rupees</p>
        </div>

        <ul
          className="mt-3 space-y-2"
          role="img"
          aria-label={`Each forecast priced at ${capexLow} to ${capexHigh} crore rupees per megawatt of new capacity.`}
        >
          {capital.rows.map((r) => (
            <li
              key={r.publisher}
              className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 text-xs sm:grid-cols-[12rem_1fr_5rem]"
            >
              <span className="truncate text-muted">
                {r.publisher}
                <span className="ml-1.5 text-[10px]">by {r.byYear}</span>
              </span>
              <span className="relative block h-7 rounded-sm bg-grid">
                <span
                  className="absolute inset-y-0 left-0 rounded-sm"
                  style={{ width: cr(r.lakhCrLow), background: "var(--rung-3)" }}
                />
                <span
                  aria-hidden
                  className="absolute inset-y-0 rounded-sm border border-dashed border-accent"
                  style={{
                    left: cr(r.lakhCrLow),
                    width: cr(r.lakhCrHigh - r.lakhCrLow),
                  }}
                />
              </span>
              <span className="text-right tnum text-muted">
                {r.lakhCrLow.toFixed(1)} to {r.lakhCrHigh.toFixed(1)}
              </span>
            </li>
          ))}
          <li className="grid grid-cols-[7.5rem_1fr_4.5rem] items-center gap-3 text-xs sm:grid-cols-[12rem_1fr_5rem]">
            <span className="truncate text-signal">{benchmarkLabel}</span>
            <span className="relative block h-7 rounded-sm bg-grid">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{
                  width: cr(capital.benchmarkLakhCr),
                  minWidth: "2px",
                  background: "var(--signal)",
                }}
              />
            </span>
            <span className="text-right tnum text-signal">{capital.benchmarkLakhCr.toFixed(2)}</span>
          </li>
        </ul>

        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          Solid is the low build cost applied to the base case megawatts. The dashed extension runs
          to the high build cost applied to the top of each publisher&apos;s own range.
        </p>
      </section>

      <section className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
        <div className="bg-card p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">Capital cost</p>
          <p className="mt-1.5 font-display text-2xl tracking-tight tnum">
            {capexLow} to {capexHigh}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted">
            Crore rupees per megawatt, {capexSourceLabel}. The multiplier every bar above uses.
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">Colocation margin</p>
          <p className="mt-1.5 font-display text-2xl tracking-tight tnum">
            {marginLow} to {marginHigh}
            <span className="ml-1.5 text-sm font-normal text-muted">per cent</span>
          </p>
          <span className="relative mt-2 block h-2 rounded-sm bg-grid">
            <span
              aria-hidden
              className="absolute inset-y-0 rounded-sm"
              style={{
                left: `${marginLow}%`,
                width: `${marginHigh - marginLow}%`,
                background: "var(--rung-2)",
              }}
            />
            <span
              aria-hidden
              className="absolute inset-y-0 w-[2px]"
              style={{ left: `${marginStable}%`, background: "var(--accent-deep)" }}
            />
          </span>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Stabilising at {marginStable}, marked on the band.
          </p>
        </div>
        <div className="bg-card p-4">
          <p className="text-[11px] uppercase tracking-wider text-muted">Power, share of opex</p>
          <p className="mt-1.5 font-display text-2xl tracking-tight tnum">
            {powerShare}
            <span className="ml-1.5 text-sm font-normal text-muted">per cent</span>
          </p>
          <span className="relative mt-2 block h-2 rounded-sm bg-grid">
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 rounded-sm"
              style={{ width: `${powerShare}%`, background: "var(--signal)" }}
            />
          </span>
          <p className="mt-2 text-xs leading-relaxed text-muted">
            Electricity is the largest single thing one of these operators buys.
          </p>
        </div>
      </section>

      <p className="flex gap-1.5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <span>
          Grid demand and built IT load are different measurements and are drawn on one axis for
          magnitude only. Converting between them needs a facility efficiency figure, which is not
          published for the national estate and is not assumed here.
        </span>
      </p>
    </div>
  );
}
