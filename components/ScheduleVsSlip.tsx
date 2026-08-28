import {
  objectWindow,
  slipBand,
  monthLabel,
  monthsFromAnchor,
} from "@/lib/diagnostics/schedule";

const W = 720;
const M = { top: 16, right: 26, bottom: 38, left: 148 };
const ROW = 48;
const BAR = 15;

type Row = {
  object: string;
  fiscal2027: number;
  fiscal2028: number;
  fiscal2029: number;
};

type Base = {
  median_months: number;
  cost_weighted_mean_months: number;
  p90_months: number;
};

/** Decreasing confidence, one hue. The band gets fainter as it gets later. */
const SHADE: Record<string, number> = { median: 0.6, costWeighted: 0.4, p90: 0.22 };

/**
 * The stated schedule, and how far it would move at the observed slippage.
 *
 * Two primary sources on one axis: the prospectus says when the money lands,
 * the Ministry of Power's tabling of its own late projects says how far a large
 * infrastructure schedule typically slips. Neither number is ours.
 *
 * The band is drawn fainter as it extends, because it is a distribution rather
 * than a prediction, and a solid block at 32 months would read as a forecast.
 */
export function ScheduleVsSlip({
  rows,
  base,
  basisNote,
}: {
  rows: Row[];
  base: Base;
  basisNote: string;
}) {
  const windows = rows
    .map((r) => ({ row: r, win: objectWindow(r) }))
    .filter(
      (x): x is { row: Row; win: NonNullable<ReturnType<typeof objectWindow>> } =>
        x.win !== null,
    );

  const bands = windows.map(({ win }) => slipBand(win.end, base));
  const maxM = Math.max(...bands.flat().map((s) => s.at)) + 4;
  const H = M.top + windows.length * ROW + M.bottom;
  const px = (m: number) => M.left + (m / maxM) * (W - M.left - M.right);

  // January gridlines, because a reader thinks in calendar years even where the
  // company reports in fiscal ones
  const years: number[] = [];
  for (let y = 2026; monthsFromAnchor(y, 1) <= maxM; y++) years.push(y);

  return (
    <figure className="mt-8">
      <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--accent)" }}
          />
          Stated deployment window
        </span>
        {slipBand(0, base).map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-sm"
              style={{ background: "var(--private)", opacity: SHADE[s.key] }}
            />
            {s.label}, plus {s.months} months
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[38rem]"
          role="img"
          aria-label={`Stated deployment windows for ${windows.length} objects of the offer, each extended by the observed transmission slippage at the median of ${base.median_months} months, the cost weighted mean of ${base.cost_weighted_mean_months} months, and the ninetieth percentile of ${base.p90_months} months.`}
        >
          {years.map((y) => {
            const x = px(monthsFromAnchor(y, 1));
            return (
              <g key={y}>
                <line
                  x1={x}
                  y1={M.top}
                  x2={x}
                  y2={H - M.bottom}
                  stroke="var(--line)"
                  strokeWidth="1"
                />
                <text
                  x={x}
                  y={H - M.bottom + 16}
                  textAnchor="middle"
                  fontSize="10"
                  fill="var(--muted)"
                >
                  {y}
                </text>
              </g>
            );
          })}

          {windows.map(({ row, win }, i) => {
            const y = M.top + i * ROW;
            const band = slipBand(win.end, base);
            let cursor = win.end;
            return (
              <g key={row.object}>
                <text
                  x={M.left - 10}
                  y={y + BAR}
                  textAnchor="end"
                  fontSize="11"
                  fill="var(--foreground)"
                >
                  {row.object.length > 30 ? row.object.slice(0, 29) + "…" : row.object}
                </text>

                <rect
                  x={px(win.start)}
                  y={y + 4}
                  width={Math.max(2, px(win.end) - px(win.start))}
                  height={BAR}
                  rx="2"
                  fill="var(--accent)"
                />

                {band.map((s) => {
                  const from = cursor;
                  cursor = s.at;
                  return (
                    <rect
                      key={s.key}
                      x={px(from)}
                      y={y + 4}
                      width={Math.max(1, px(s.at) - px(from))}
                      height={BAR}
                      fill="var(--private)"
                      opacity={SHADE[s.key]}
                    />
                  );
                })}

                <text x={px(win.start)} y={y + BAR + 18} fontSize="10" fill="var(--muted)">
                  stated {monthLabel(win.start)} to {monthLabel(win.end)}
                </text>
                <text
                  x={px(band[2].at)}
                  y={y + BAR + 18}
                  textAnchor="end"
                  fontSize="10"
                  fill="var(--muted)"
                >
                  {monthLabel(band[2].at)} at the 90th percentile
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <figcaption className="mt-4 max-w-2xl text-xs leading-relaxed text-muted">
        {basisNote}
      </figcaption>
    </figure>
  );
}
