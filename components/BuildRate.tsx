type Row = {
  publisher: string;
  byYear: number;
  years: number;
  perYear: number;
  perYearTop: number;
  multiple: number;
  multipleTop: number;
};

/**
 * What each forecast needs per year, against what was actually built.
 *
 * The actual bar is drawn last and in the signal colour rather than first and
 * in grey, because it is the only measured quantity on the chart. Everything
 * above it is a requirement implied by somebody's projection, and the visual
 * order should not let those requirements read as the baseline.
 */
export function BuildRate({
  rows,
  actualAddedMW,
  actualYear,
  priorAddedMW,
  priorYear,
  max,
}: {
  rows: Row[];
  actualAddedMW: number;
  actualYear: number;
  priorAddedMW: number;
  priorYear: number;
  max: number;
}) {
  const pct = (v: number) => `${(v / max) * 100}%`;

  return (
    <div>
      <ul className="space-y-3.5">
        {rows.map((r) => (
          <li key={r.publisher}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
              <span className="font-medium">
                {r.publisher}
                <span className="ml-1.5 text-muted">
                  to {r.byYear}, {r.years} years
                </span>
              </span>
              <span className="tnum text-muted">
                <span className="text-foreground">
                  {Math.round(r.perYear)}
                  {r.perYearTop !== r.perYear ? ` to ${Math.round(r.perYearTop)}` : ""}
                </span>{" "}
                MW a year
              </span>
            </div>
            <span className="relative mt-1.5 block h-5 overflow-hidden rounded-sm bg-grid">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{ width: pct(r.perYearTop), background: "var(--rung-1)" }}
              />
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{ width: pct(r.perYear), background: "var(--rung-2)" }}
              />
            </span>
            <p className="mt-1 text-[11px] text-muted">
              <span className="tnum">
                {r.multiple.toFixed(1)}
                {r.multipleTop !== r.multiple ? ` to ${r.multipleTop.toFixed(1)}` : ""}
              </span>{" "}
              times what was actually added in {actualYear}.
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-5 border-t border-line pt-4">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-xs">
          <span className="font-medium text-signal">Actually added, {actualYear}</span>
          <span className="tnum text-muted">
            <span className="text-foreground">{actualAddedMW}</span> MW
          </span>
        </div>
        <span className="relative mt-1.5 block h-5 overflow-hidden rounded-sm bg-grid">
          <span
            className="absolute inset-y-0 left-0 rounded-sm"
            style={{ width: pct(actualAddedMW), background: "var(--signal)" }}
          />
        </span>
        <p className="mt-1 text-[11px] text-muted">
          The only measured bar on this chart, and itself a record:{" "}
          <span className="tnum">{(actualAddedMW / priorAddedMW).toFixed(1)}</span> times the{" "}
          <span className="tnum">{priorAddedMW}</span> MW added in {priorYear}.
        </p>
      </div>
    </div>
  );
}
