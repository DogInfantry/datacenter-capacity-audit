import type { CapacityLadder } from "@/lib/schema";
import { ladder } from "@/lib/data";

const W = 720;
const H = 300;
const M = { top: 34, right: 24, bottom: 40, left: 48 };

const day = (d: string) => Date.parse(d) / 86_400_000;

/**
 * Observed commissioned capacity, stepped.
 *
 * Stepped rather than smoothed because capacity is commissioned in lumps: a
 * straight interpolation between two quarters would draw megawatts that were
 * never live. The flat stretch is the finding, so nothing may soften it.
 *
 * The chart plots observations only. Promise dates are marked on the axis but
 * their targets are not drawn as levels, because the verbatim claims are
 * ambiguous about whether the figure is incremental or absolute, and guessing
 * would put a number on the page that management never said.
 */
export function CapacityStep({ data }: { data: CapacityLadder }) {
  const obs = ladder(data).filter((o) => o.commissioned_mw);
  const xs = obs.map((o) => day(o.date));
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  // Derived, with one gridline of headroom above the tallest observation. A
  // typed ceiling is a displayed number that stops matching its data the
  // first time a new quarter is coded.
  const yMax = Math.ceil(Math.max(...obs.map((o) => o.commissioned_mw!)) / 20) * 20 + 20;

  const px = (d: string) =>
    M.left + ((day(d) - x0) / (x1 - x0)) * (W - M.left - M.right);
  const py = (v: number) => H - M.bottom - (v / yMax) * (H - M.top - M.bottom);

  // step-after: hold the level until the next observation
  let path = "";
  obs.forEach((o, i) => {
    const X = px(o.date);
    const Y = py(o.commissioned_mw!);
    if (i === 0) path += `M ${X} ${Y}`;
    else path += ` L ${X} ${py(obs[i - 1].commissioned_mw!)} L ${X} ${Y}`;
  });

  const marks = data.claims
    .filter((c) => c.status === "MISSED")
    .map((c) => ({ made: c.made_on, due: c.horizon_end, value: c.value }));

  return (
    <figure className="mt-8">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        role="img"
        aria-label={`Sify commissioned data centre capacity from ${obs[0].date} to ${
          obs[obs.length - 1].date
        }, rising from ${obs[0].commissioned_mw} to ${
          obs[obs.length - 1].commissioned_mw
        } megawatts, flat at 100 megawatts between October 2022 and January 2024.`}
      >
        {/* recessive gridlines */}
        {[35, 70, 105, 140].map((v) => (
          <g key={v}>
            <line
              x1={M.left}
              x2={W - M.right}
              y1={py(v)}
              y2={py(v)}
              stroke="var(--line)"
              strokeWidth={1}
            />
            {v === 35 ? (
              <line
                x1={M.left}
                x2={W - M.right}
                y1={py(0)}
                y2={py(0)}
                stroke="var(--line)"
                strokeWidth={1}
              />
            ) : null}
            <text
              x={M.left - 8}
              y={py(v) + 4}
              textAnchor="end"
              fontSize={11}
              fill="var(--muted)"
            >
              {v}
            </text>
          </g>
        ))}

        {/* the window in which both missed promises fell due */}
        {marks.map((m, mi) => (
          <g key={m.made}>
            <line
              x1={px(m.made)}
              x2={px(m.made)}
              y1={M.top}
              y2={H - M.bottom}
              stroke="var(--missed)"
              strokeWidth={1}
              strokeDasharray="3 3"
            />
            {/* staggered: the two claims are six months apart and their labels
                collide at this scale if both sit on the same line */}
            <text
              x={px(m.made) + 4}
              y={M.top + 10 + mi * 14}
              fontSize={10}
              fill="var(--muted)"
            >
              +{m.value} MW promised
            </text>
          </g>
        ))}

        <path
          d={path}
          fill="none"
          stroke="var(--series-1)"
          strokeWidth={2}
          strokeLinejoin="round"
        />

        {obs.map((o) => (
          <g key={o.date}>
            {/* title first: an SVG <title> is only the accessible name of its
                parent when it is that parent's first child */}
            <title>{`${o.date}: ${o.commissioned_mw} MW commissioned`}</title>
            <circle
              cx={px(o.date)}
              cy={py(o.commissioned_mw!)}
              r={4}
              fill="var(--series-1)"
              stroke="var(--card)"
              strokeWidth={2}
            />
          </g>
        ))}

        {/* direct labels, selectively: first, the flat run, and last */}
        {[obs[0], obs[2], obs[4], obs[obs.length - 1]].map((o) => (
          <text
            key={"lbl" + o.date}
            x={px(o.date)}
            y={py(o.commissioned_mw!) - 12}
            textAnchor="middle"
            fontSize={11}
            fontWeight={600}
            fill="var(--foreground)"
          >
            {o.commissioned_mw}
          </text>
        ))}

        {obs.map((o, i) =>
          i % 2 === 0 || i === obs.length - 1 ? (
            <text
              key={"ax" + o.date}
              x={px(o.date)}
              y={H - M.bottom + 16}
              textAnchor="middle"
              fontSize={10}
              fill="var(--muted)"
            >
              {o.date.slice(0, 7)}
            </text>
          ) : null,
        )}

        {/* unit sits at the head of the axis it belongs to, which also keeps
            the plot area free for the series to run to the right edge */}
        <text x={M.left - 8} y={M.top - 12} textAnchor="end" fontSize={11} fill="var(--muted)">
          MW
        </text>
      </svg>


      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted hover:text-accent">
          Table view
        </summary>
        <table className="mt-3 w-full border-collapse text-xs">
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-1.5 pr-4 font-medium">Call date</th>
              <th className="py-1.5 pr-4 text-right font-medium">Commissioned MW</th>
              <th className="py-1.5 font-medium">Management wording</th>
            </tr>
          </thead>
          <tbody>
            {obs.map((o) => (
              <tr key={"t" + o.date} className="border-b border-line align-top">
                <td className="py-1.5 pr-4 tnum">{o.date}</td>
                <td className="py-1.5 pr-4 text-right tnum">{o.commissioned_mw}</td>
                <td className="py-1.5 text-muted">{o.quote}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <figcaption className="mt-3 text-xs leading-relaxed text-muted">
        Commissioned capacity as Sify described it on its own earnings calls.
        Ordered by call date, not by the fiscal labels, which are inconsistent in
        the source. Promise markers show when a forward capacity claim was made,
        not a target level: the wording does not make clear whether the figure
        was incremental or absolute, and the chart will not invent one.
      </figcaption>
    </figure>
  );
}
