"use client";

import { useState } from "react";

const mn = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 0 });

type Flow = { key: string; label: string; value: number; fill: string; note: string };

/**
 * Where the offer money comes from and where it goes.
 *
 * A Sankey rather than two tables, because the point is a flow: the left column
 * is what is raised, the right is what it becomes, and the ribbon widths carry
 * arithmetic the prospectus never puts on one page. The offer for sale ribbon
 * runs straight through to the selling shareholders without touching the
 * company, which is the part a first time reader misses.
 */
export function UseOfProceeds({ sources, uses }: { sources: Flow[]; uses: Flow[] }) {
  const [hover, setHover] = useState<string | null>(null);

  const W = 720;
  const H = 380;
  const colW = 132;
  const pad = 26;
  const total = sources.reduce((t, s) => t + s.value, 0);
  const gap = 8;
  const usable = H - pad * 2 - gap * Math.max(sources.length, uses.length);
  const h = (v: number) => (v / total) * usable;

  // Laid out with reduce rather than a running variable, because the React
  // compiler forbids reassigning across a map during render.
  const stack = <T extends Flow>(items: T[]) =>
    items.reduce<{ y: number; out: (T & { y: number; h: number })[] }>(
      (acc, item) => {
        const hh = h(item.value);
        return { y: acc.y + hh + gap, out: [...acc.out, { ...item, y: acc.y, h: hh }] };
      },
      { y: pad, out: [] },
    ).out;

  const srcBoxes = stack(sources);
  const useBoxes = stack(uses);

  const x0 = colW;
  const x1 = W - colW;

  const ribbons = useBoxes.reduce<{
    cursor: Record<string, number>;
    out: { id: string; fill: string; y0: number; y1: number; hh: number }[];
  }>(
    (acc, u) => {
      const src = srcBoxes.find((s) => s.key === u.key)!;
      const from = acc.cursor[src.key] ?? src.y;
      return {
        cursor: { ...acc.cursor, [src.key]: from + u.h },
        out: [...acc.out, { id: u.label, fill: u.fill, y0: from, y1: u.y, hh: u.h }],
      };
    },
    { cursor: {}, out: [] },
  ).out;

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[36rem]"
          role="img"
          aria-label="Flow of offer proceeds from sources to uses"
          onMouseLeave={() => setHover(null)}
        >
          {ribbons.map((r) => {
            const on = hover === r.id;
            const mid = (x0 + x1) / 2;
            return (
              <path
                key={r.id}
                d={`M ${x0} ${r.y0} C ${mid} ${r.y0}, ${mid} ${r.y1}, ${x1} ${r.y1} L ${x1} ${r.y1 + r.hh} C ${mid} ${r.y1 + r.hh}, ${mid} ${r.y0 + r.hh}, ${x0} ${r.y0 + r.hh} Z`}
                fill={r.fill}
                opacity={hover && !on ? 0.18 : 0.55}
                style={{ transition: "opacity 160ms" }}
                onMouseEnter={() => setHover(r.id)}
              />
            );
          })}

          {srcBoxes.map((s) => (
            <g key={s.key}>
              <rect x={x0 - 10} y={s.y} width={10} height={s.h} fill={s.fill} rx={1} />
              <text x={x0 - 18} y={s.y + 14} textAnchor="end" fontSize={12} fill="var(--foreground)">
                {s.label}
              </text>
              <text
                x={x0 - 18}
                y={s.y + 30}
                textAnchor="end"
                fontSize={11}
                className="tnum"
                fill="var(--muted)"
              >
                {mn(s.value)}
              </text>
            </g>
          ))}

          {useBoxes.map((u) => {
            const on = hover === u.label;
            return (
              <g key={u.label} onMouseEnter={() => setHover(u.label)} style={{ cursor: "pointer" }}>
                <rect x={x1} y={u.y} width={10} height={u.h} fill={u.fill} rx={1} />
                <text
                  x={x1 + 18}
                  y={u.y + 13}
                  fontSize={12}
                  fill={on ? "var(--foreground)" : "var(--muted)"}
                >
                  {u.label}
                </text>
                <text x={x1 + 18} y={u.y + 28} fontSize={11} className="tnum" fill="var(--muted)">
                  {mn(u.value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="mt-3 min-h-[3rem] text-sm">
        {hover ? (
          <p className="text-muted">{useBoxes.find((u) => u.label === hover)?.note}</p>
        ) : (
          <p className="text-muted">
            Hover a ribbon. One of the widest never reaches the company at all.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * What each project costs against what the offer pays for it.
 *
 * The remainder is not an inference. The issuer itemises it in the same table as
 * an amount to be met from borrowings.
 */
export function FundingGap({
  rows,
}: {
  rows: {
    object: string;
    cost: number;
    fromNetProceeds: number;
    fromBorrowings: number;
    borrowedShare: number;
  }[];
}) {
  const max = Math.max(...rows.map((r) => r.cost));
  return (
    <div className="space-y-5">
      {rows.map((r) => (
        <div key={r.object}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span>{r.object}</span>
            <span className="tnum text-xs text-muted">
              {mn(r.cost)} total · <span className="text-signal">{mn(r.fromBorrowings)}</span>{" "}
              borrowed
            </span>
          </div>
          <div className="mt-2 flex h-6 w-full overflow-hidden rounded-sm bg-grid">
            <span
              className="h-full"
              style={{ width: `${(r.fromNetProceeds / max) * 100}%`, background: "var(--accent)" }}
            />
            <span
              className="h-full"
              style={{ width: `${(r.fromBorrowings / max) * 100}%`, background: "var(--signal)" }}
            />
          </div>
          <p className="mt-1.5 text-xs text-muted">
            <span className="tnum">{r.borrowedShare.toFixed(0)}</span> per cent of this project is
            funded by new debt, not by the offer.
          </p>
        </div>
      ))}
      <div className="flex flex-wrap gap-x-5 gap-y-1.5 border-t border-line pt-3 text-xs text-muted">
        {[
          ["Funded by net proceeds", "var(--accent)"],
          ["Funded by new borrowings", "var(--signal)"],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * The net debt bridge.
 *
 * A waterfall, because the shape of the finding is a cancellation: a large bar
 * down, a nearly equal bar up, and a closing column that has barely moved.
 */
export function NetDebtBridge({
  bridge,
}: {
  bridge: {
    opening: number;
    repaid: number;
    borrowed: number;
    net: number;
    closing: number;
    reductionPct: number;
  };
}) {
  const steps = [
    { label: "Net debt today", value: bridge.opening, kind: "total" as const },
    { label: "Repaid from proceeds", value: -bridge.repaid, kind: "delta" as const },
    { label: "New borrowings", value: bridge.borrowed, kind: "delta" as const },
    { label: "Net debt after", value: bridge.closing, kind: "total" as const },
  ];
  const max = Math.max(bridge.opening, bridge.closing);
  const H = 210;
  const barW = 96;
  const gapW = 52;
  const W = steps.length * barW + (steps.length - 1) * gapW + 40;
  const h = (v: number) => (Math.abs(v) / max) * (H - 60);

  const bars = steps.reduce<{
    running: number;
    out: { label: string; value: number; kind: "total" | "delta"; x: number; y: number; hh: number }[];
  }>(
    (acc, s, i) => {
      const x = 20 + i * (barW + gapW);
      if (s.kind === "total") {
        return {
          running: s.value,
          out: [...acc.out, { ...s, x, y: H - 30 - h(s.value), hh: h(s.value) }],
        };
      }
      const next = acc.running + s.value;
      return {
        running: next,
        out: [
          ...acc.out,
          {
            ...s,
            x,
            y: H - 30 - h(Math.max(acc.running, next)),
            hh: h(Math.abs(s.value)),
          },
        ],
      };
    },
    { running: 0, out: [] },
  ).out;

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[30rem]"
          role="img"
          aria-label="Net debt bridge from repayment and new borrowings"
        >
          {bars.map((b) => (
            <g key={b.label}>
              <rect
                x={b.x}
                y={b.y}
                width={barW}
                height={Math.max(b.hh, 2)}
                rx={2}
                fill={
                  b.kind === "total"
                    ? "var(--rung-2)"
                    : b.value < 0
                      ? "var(--accent)"
                      : "var(--signal)"
                }
              />
              <text
                x={b.x + barW / 2}
                y={b.y - 6}
                textAnchor="middle"
                fontSize={11}
                className="tnum"
                fill="var(--foreground)"
              >
                {b.value < 0 ? "less " : b.kind === "delta" ? "plus " : ""}
                {mn(Math.abs(b.value))}
              </text>
              <text
                x={b.x + barW / 2}
                y={H - 12}
                textAnchor="middle"
                fontSize={9.5}
                fill="var(--muted)"
              >
                {b.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <p className="mt-3 border-t border-line pt-3 text-sm leading-relaxed text-muted">
        Repayment of borrowings is a headline use of proceeds at{" "}
        <span className="tnum text-foreground">{mn(bridge.repaid)}</span> million. The same table
        commits <span className="tnum text-foreground">{mn(bridge.borrowed)}</span> million of new
        borrowings to part fund the two construction objects. Net debt falls by{" "}
        <span className="tnum text-signal">{mn(Math.abs(bridge.net))}</span> million, which is{" "}
        <span className="tnum text-signal">{bridge.reductionPct.toFixed(1)}</span> per cent of where
        it starts.
      </p>
    </div>
  );
}
