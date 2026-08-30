"use client";

import { useState } from "react";

type Row = { label: string; builtMW: number; roce: number };

/**
 * Exhibit 1. Built capacity against return on capital, both indexed to the first
 * full fiscal year.
 *
 * Indexed deliberately. The obvious drawing of this finding is megawatts on one
 * axis and a percentage on the other, and a dual axis chart lets whoever draws it
 * choose the two scales that make the lines cross wherever they like. Indexing
 * both to the same base puts them on one axis, so the divergence is a property of
 * the data rather than of the drawing.
 *
 * The stub quarter is not on here. Its return on capital is filed unannualised,
 * and putting three months of return beside three full years would invent a
 * collapse steeper than the filing claims.
 */
export function CapacityVsReturns({ rows, page }: { rows: Row[]; page: number }) {
  const [hover, setHover] = useState<number | null>(null);

  const base = rows[0];
  const pts = rows.map((r) => ({
    label: r.label,
    builtMW: r.builtMW,
    roce: r.roce,
    cap: (r.builtMW / base.builtMW) * 100,
    ret: (r.roce / base.roce) * 100,
  }));

  const W = 720;
  const H = 380;
  const M = { top: 28, right: 132, bottom: 44, left: 52 };
  const plotW = W - M.left - M.right;
  const plotH = H - M.top - M.bottom;
  const yMax = 220;
  const step = plotW / (pts.length - 1);

  const x = (i: number) => M.left + i * step;
  const y = (v: number) => M.top + (1 - v / yMax) * plotH;

  const path = (key: "cap" | "ret") =>
    pts.map((p, i) => `${i === 0 ? "M" : "L"} ${x(i)} ${y(p[key])}`).join(" ");

  const last = pts[pts.length - 1];
  const ticks = [0, 50, 100, 150, 200];

  const series = [
    { key: "cap" as const, name: "Built capacity", color: "var(--accent)", end: last.cap },
    { key: "ret" as const, name: "Return on capital", color: "var(--signal)", end: last.ret },
  ];

  return (
    <figure className="mt-8">
      <div className="mb-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {series.map((s) => (
          <span key={s.key} className="flex items-center gap-2 text-xs text-muted">
            <span
              aria-hidden
              className="inline-block h-0.5 w-5 rounded-full"
              style={{ background: s.color }}
            />
            {s.name}
          </span>
        ))}
        <span className="text-xs text-muted">
          Indexed, {base.label} = <span className="tnum">100</span>
        </span>
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[34rem]"
          role="img"
          aria-label={
            // An svg `title` carrying an id is hoisted by React as document
            // metadata and hydrates differently from the server render. A bare
            // svg title is left alone, which is why the other exhibits are fine
            // and this one logged a recoverable error on every load.
            `Built capacity rose to ${Math.round(last.cap)} and return on capital fell to ` +
            `${Math.round(last.ret)}, both indexed to ${base.label} equals 100.`
          }
          onMouseLeave={() => setHover(null)}
        >

          {ticks.map((t) => (
            <g key={t}>
              <line
                x1={M.left}
                x2={W - M.right}
                y1={y(t)}
                y2={y(t)}
                stroke="var(--grid)"
                strokeWidth={1}
              />
              <text
                x={M.left - 10}
                y={y(t) + 4}
                textAnchor="end"
                className="tnum"
                fontSize={11}
                fill="var(--muted)"
              >
                {t}
              </text>
            </g>
          ))}

          {/* The index base. Above it the measure grew, below it the measure shrank. */}
          <line
            x1={M.left}
            x2={W - M.right}
            y1={y(100)}
            y2={y(100)}
            stroke="var(--muted)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />

          {pts.map((p, i) => (
            <text
              key={p.label}
              x={x(i)}
              y={H - 16}
              textAnchor="middle"
              fontSize={12}
              fill="var(--muted)"
            >
              {p.label}
            </text>
          ))}

          {series.map((s) => (
            <path
              key={s.key}
              d={path(s.key)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {series.map((s) =>
            pts.map((p, i) => (
              <circle
                key={`${s.key}-${i}`}
                cx={x(i)}
                cy={y(p[s.key])}
                r={hover === i ? 6 : 4.5}
                fill={s.color}
                stroke="var(--background)"
                strokeWidth={2}
              />
            )),
          )}

          {/* Direct labels, so identity never rests on colour alone. */}
          {series.map((s) => (
            <text
              key={`lbl-${s.key}`}
              x={W - M.right + 14}
              y={y(s.end) + 4}
              fontSize={13}
              fill={s.color}
              fontWeight={600}
              className="tnum"
            >
              {Math.round(s.end)}
            </text>
          ))}
          {series.map((s) => (
            <text
              key={`nm-${s.key}`}
              x={W - M.right + 14}
              y={y(s.end) + 21}
              fontSize={11}
              fill="var(--muted)"
            >
              {s.name}
            </text>
          ))}

          {hover !== null && (
            <line
              x1={x(hover)}
              x2={x(hover)}
              y1={M.top}
              y2={M.top + plotH}
              stroke="var(--muted)"
              strokeWidth={1}
            />
          )}

          {pts.map((_, i) => (
            <rect
              key={`hit-${i}`}
              x={x(i) - step / 2}
              y={M.top}
              width={step}
              height={plotH}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
            />
          ))}
        </svg>
      </div>

      <div className="mt-3 min-h-[3.25rem] text-sm">
        {hover === null ? (
          <p className="text-muted">
            Built capacity more than doubled over three fiscal years. Return on capital ended the
            period <span className="tnum">{(100 - last.ret).toFixed(0)}</span> per cent below
            where it started.
          </p>
        ) : (
          <p className="tnum">
            <span className="font-medium">{pts[hover].label}</span>
            <span className="text-muted"> · built </span>
            {pts[hover].builtMW.toFixed(2)} MW
            <span className="text-muted"> (index {Math.round(pts[hover].cap)})</span>
            <span className="text-muted"> · return on capital </span>
            {pts[hover].roce.toFixed(2)}%
            <span className="text-muted"> (index {Math.round(pts[hover].ret)})</span>
          </p>
        )}
      </div>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer text-xs text-muted hover:text-accent">
          Show the numbers
        </summary>
        <table className="mt-3 w-full border-collapse text-sm">
          <caption className="sr-only">
            Built capacity and return on capital by fiscal year, with both indexed to {base.label}
          </caption>
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="py-2 pr-4 font-medium">Fiscal year</th>
              <th className="py-2 pr-4 text-right font-medium">Built MW</th>
              <th className="py-2 pr-4 text-right font-medium">Index</th>
              <th className="py-2 pr-4 text-right font-medium">ROCE</th>
              <th className="py-2 text-right font-medium">Index</th>
            </tr>
          </thead>
          <tbody>
            {pts.map((p) => (
              <tr key={p.label} className="border-b border-line">
                <td className="py-2 pr-4">{p.label}</td>
                <td className="py-2 pr-4 text-right tnum">{p.builtMW.toFixed(2)}</td>
                <td className="py-2 pr-4 text-right tnum">{Math.round(p.cap)}</td>
                <td className="py-2 pr-4 text-right tnum">{p.roce.toFixed(2)}%</td>
                <td className="py-2 text-right tnum">{Math.round(p.ret)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <figcaption className="mt-4 text-xs leading-relaxed text-muted">
        Built capacity from the issuer&apos;s key performance indicators, return on capital
        employed as stated by the issuer, both from the draft red herring prospectus, printed
        pages {page} and 287. The three months ended June 30, 2025 are excluded: return on capital
        for that stub is filed unannualised and is not comparable to a full year.
      </figcaption>
    </figure>
  );
}
