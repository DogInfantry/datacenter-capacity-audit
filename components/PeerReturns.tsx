type Row = {
  name: string;
  market: "DOMESTIC" | "GLOBAL";
  self: boolean;
  roce: (number | null)[];
  depreciationRate: (number | null)[];
};

const W = 720;
const H = 300;
const M = { top: 18, right: 148, bottom: 34, left: 40 };

/**
 * Return on capital, eight operators, three years.
 *
 * One axis and one line per operator. Indian operators are drawn solid, global
 * ones dashed and recessive, because the comparison a reader is invited to make
 * here runs the opposite way to the one the source makes.
 *
 * A year an operator did not report is a break in its line, not a point at
 * zero. Three of the five Indian operators stop after two years, and a line
 * dropping to the floor would read as a collapse nobody reported.
 */
export function PeerReturns({ rows, fiscalYears }: { rows: Row[]; fiscalYears: string[] }) {
  const all = rows.flatMap((r) => r.roce).filter((v): v is number => v !== null);
  const hi = Math.ceil(Math.max(...all) / 5) * 5;
  const lo = Math.min(0, Math.floor(Math.min(...all) / 5) * 5);

  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const x = (i: number) => M.left + (i / (fiscalYears.length - 1)) * plotW;
  const y = (v: number) => M.top + (1 - (v - lo) / (hi - lo)) * plotH;

  const ticks = Array.from({ length: 5 }, (_, i) => lo + ((hi - lo) / 4) * i);

  const tone = (r: Row) =>
    r.self ? "var(--signal)" : r.market === "DOMESTIC" ? "var(--accent)" : "var(--rung-1)";

  return (
    <div>
      <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-0.5 w-5 rounded-full"
            style={{ background: "var(--signal)" }}
          />
          The issuer
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-0.5 w-5 rounded-full"
            style={{ background: "var(--accent)" }}
          />
          Indian operators
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-0.5 w-5 rounded-full"
            style={{
              backgroundImage:
                "repeating-linear-gradient(90deg, var(--rung-1) 0 4px, transparent 4px 7px)",
            }}
          />
          Global operators
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[34rem]"
          role="img"
          aria-label={`Return on capital employed for ${rows.length} data centre operators across ${fiscalYears.join(", ")}. Every Indian operator falls between the first two years.`}
        >
          {ticks.map((t) => (
            <g key={t}>
              <line x1={M.left} x2={M.left + plotW} y1={y(t)} y2={y(t)} stroke="var(--grid)" />
              <text
                x={M.left - 8}
                y={y(t) + 3}
                textAnchor="end"
                fontSize={10}
                fill="var(--muted)"
                className="tnum"
              >
                {t}
              </text>
            </g>
          ))}

          {fiscalYears.map((fy, i) => (
            <text
              key={fy}
              x={x(i)}
              y={H - 12}
              textAnchor="middle"
              fontSize={11}
              fill="var(--muted)"
            >
              {fy}
            </text>
          ))}

          {rows.map((r) => {
            const pts = r.roce
              .map((v, i) => (v === null ? null : { i, v }))
              .filter((p): p is { i: number; v: number } => p !== null);
            if (!pts.length) return null;
            const d = pts.map((p, k) => `${k === 0 ? "M" : "L"} ${x(p.i)} ${y(p.v)}`).join(" ");
            const last = pts[pts.length - 1];
            return (
              <g key={r.name}>
                <path
                  d={d}
                  fill="none"
                  stroke={tone(r)}
                  strokeWidth={r.self ? 2.4 : 1.6}
                  strokeDasharray={r.market === "GLOBAL" ? "4 3" : undefined}
                  strokeLinecap="round"
                />
                {pts.map((p) => (
                  <circle
                    key={p.i}
                    cx={x(p.i)}
                    cy={y(p.v)}
                    r={r.self ? 4 : 3}
                    fill={tone(r)}
                    stroke="var(--background)"
                    strokeWidth={1.5}
                  />
                ))}
                <text
                  x={x(last.i) + 9}
                  y={y(last.v) + 3.5}
                  fontSize={10.5}
                  fill={r.self ? "var(--signal)" : "var(--muted)"}
                  fontWeight={r.self ? 600 : 400}
                >
                  {r.name}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="mt-2 text-[11px] text-muted">
        Return on capital employed, per cent. A gap in a line is a year the operator did not report.
      </p>
    </div>
  );
}
