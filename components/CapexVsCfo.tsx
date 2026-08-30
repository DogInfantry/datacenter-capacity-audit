const W = 720;
const H = 320;
const M = { top: 34, right: 20, bottom: 44, left: 52 };

/**
 * Operating cash flow against capital expenditure, both in crore.
 *
 * One axis, deliberately. Two measures in the same unit belong on the same
 * scale, and the entire point of the exhibit is that one bar is taller than the
 * other, which a second axis would let you hide.
 *
 * The rows arrive already converted and already labelled, and the caller passes
 * its own description and note. This component previously carried a sentence
 * asserting that capex exceeded cash flow in every period, which was true of the
 * filer it was written for and is false of the issuer it now also serves. A
 * claim belongs with the data that supports it, not baked into a chart.
 */
type Row = { label: string; cfoCr: number; capexCr: number };

export function CapexVsCfo({
  rows: data,
  aria,
  note,
}: {
  rows: Row[];
  aria: string;
  note: string;
}) {
  const max = Math.max(...data.flatMap((r) => [r.cfoCr, r.capexCr]));
  const yMax = Math.ceil(max / 200) * 200;

  const bandW = (W - M.left - M.right) / data.length;
  const barW = Math.min(26, bandW / 2 - 3);
  const py = (v: number) => H - M.bottom - (v / yMax) * (H - M.top - M.bottom);

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-4 text-xs text-muted">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-psu" />
          Operating cash flow
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-sm bg-private" />
          Capital expenditure
        </span>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={aria}
      >
        <text x={M.left - 10} y={M.top - 14} textAnchor="end" fontSize={11} fill="var(--muted)">
          Rs cr
        </text>

        {Array.from({ length: 5 }, (_, i) => (yMax / 4) * i).map((v) => (
          <g key={v}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={py(v)}
              y2={py(v)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            <text x={M.left - 10} y={py(v) + 4} textAnchor="end" fontSize={11} fill="var(--muted)">
              {v.toLocaleString("en-IN")}
            </text>
          </g>
        ))}

        {data.map((r, i) => {
          const x = M.left + i * bandW;
          const cfo = r.cfoCr;
          const cap = r.capexCr;
          const outspent = cap > cfo;
          return (
            <g key={r.label}>
              <title>{`${r.label}: operating cash Rs ${cfo.toFixed(0)} cr, capex Rs ${cap.toFixed(0)} cr`}</title>
              <rect
                x={x + bandW / 2 - barW - 1}
                y={py(cfo)}
                width={barW}
                height={py(0) - py(cfo)}
                rx={3}
                fill="var(--psu)"
              />
              <rect
                x={x + bandW / 2 + 1}
                y={py(cap)}
                width={barW}
                height={py(0) - py(cap)}
                rx={3}
                fill="var(--private)"
              />
              {outspent ? (
                <text
                  x={x + bandW / 2}
                  y={py(Math.max(cfo, cap)) - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fontWeight={600}
                  fill="var(--foreground)"
                >
                  {(cap / cfo).toFixed(1)}x
                </text>
              ) : null}
              <text
                x={x + bandW / 2}
                y={H - M.bottom + 16}
                textAnchor="middle"
                fontSize={10}
                fill="var(--muted)"
              >
                {r.label.replace("FY", "")}
              </text>
            </g>
          );
        })}
      </svg>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        {note} The multiple above each pair is capex divided by operating cash flow, shown only
        where capex was the larger of the two.
      </p>
    </div>
  );
}
