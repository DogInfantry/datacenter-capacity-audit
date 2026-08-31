"use client";

import { useState } from "react";
import { verdictTone } from "./Visual";
import { Logo } from "./Logo";

type Op = {
  id: string;
  operator: string;
  listedParent: string;
  ticker: string;
  announcedMW: number;
  liveMW: number;
  handedOverMW: number | null;
  verdict: string;
  note: string;
  source: { label: string; verification: string };
};

/**
 * Execution versus Ambition.
 *
 * Both axes are megawatts on a log scale, because the set spans 10 MW to 5,000
 * and a linear axis would collapse everything except Reliance and Adani into the
 * origin. The log scale is written on both axes rather than left to inference.
 *
 * The diagonal is parity: delivered equals announced. The vertical drop under
 * each point is the gap this project exists to measure. A name sitting hard
 * right and low has announced gigawatts and delivered nothing.
 *
 * Only operators measured in megawatts are plotted. Server makers and systems
 * integrators sit in the watchlist on their own metrics, because putting an
 * order book and a megawatt on the same axes would invent a comparability that
 * does not exist.
 */
export function ExecutionAmbition({ operators }: { operators: Op[] }) {
  const [active, setActive] = useState<string | null>(null);

  const W = 720;
  const H = 470;
  const M = { top: 26, right: 26, bottom: 52, left: 62 };
  const pw = W - M.left - M.right;
  const ph = H - M.top - M.bottom;

  const lo = 1;
  const hi = 6000;
  const sx = (mw: number) =>
    M.left + (Math.log10(Math.max(mw, lo) / lo) / Math.log10(hi / lo)) * pw;
  const sy = (mw: number) =>
    M.top + ph - (Math.log10(Math.max(mw, lo) / lo) / Math.log10(hi / lo)) * ph;

  const ticks = [1, 10, 100, 1000, 6000];
  const label = (v: number) => (v >= 1000 ? `${v / 1000} GW` : `${v} MW`);
  const floored = operators.filter((o) => o.liveMW === 0);
  const flooredAnnounced = floored.reduce((t, o) => t + o.announcedMW, 0);

  return (
    <div>
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[34rem]"
          role="img"
          aria-label="Announced capacity against live capacity, both on a logarithmic megawatt scale"
          onMouseLeave={() => setActive(null)}
        >
          {ticks.map((t) => (
            <g key={`x${t}`}>
              <line x1={sx(t)} x2={sx(t)} y1={M.top} y2={M.top + ph} stroke="var(--grid)" />
              <text
                x={sx(t)}
                y={H - M.bottom + 16}
                textAnchor="middle"
                fontSize={10}
                fill="var(--muted)"
              >
                {label(t)}
              </text>
            </g>
          ))}
          {ticks.map((t) => (
            <g key={`y${t}`}>
              <line x1={M.left} x2={M.left + pw} y1={sy(t)} y2={sy(t)} stroke="var(--grid)" />
              <text x={M.left - 8} y={sy(t) + 3} textAnchor="end" fontSize={10} fill="var(--muted)">
                {label(t)}
              </text>
            </g>
          ))}

          {/* Parity. Everything below this has announced more than it has built. */}
          <line
            x1={sx(lo)}
            y1={sy(lo)}
            x2={sx(hi)}
            y2={sy(hi)}
            stroke="var(--muted)"
            strokeWidth={1}
            strokeDasharray="4 4"
          />
          <text x={sx(hi) - 6} y={sy(hi) + 16} textAnchor="end" fontSize={10} fill="var(--muted)">
            delivered = announced
          </text>

          <text x={M.left + 6} y={M.top + 16} fontSize={11} fill="var(--muted)">
            Executing
          </text>
          <text
            x={M.left + pw - 6}
            y={M.top + ph - 8}
            textAnchor="end"
            fontSize={11}
            fill="var(--signal)"
          >
            Announced, not delivered
          </text>

          {operators.map((o) => {
            const on = active === o.id;
            const cx = sx(o.announcedMW);
            const cy = sy(o.liveMW);
            return (
              <g key={o.id} onMouseEnter={() => setActive(o.id)} style={{ cursor: "pointer" }}>
                <line
                  x1={cx}
                  y1={cy}
                  x2={cx}
                  y2={sy(o.announcedMW)}
                  stroke="var(--signal)"
                  strokeWidth={on ? 2 : 1}
                  opacity={0.5}
                />
                <circle
                  cx={cx}
                  cy={cy}
                  r={on ? 8 : 6}
                  fill={o.liveMW === 0 ? "var(--signal)" : "var(--accent)"}
                  stroke="var(--card)"
                  strokeWidth={2}
                  opacity={active && !on ? 0.45 : 1}
                  style={{ transition: "opacity 160ms" }}
                />
                <text
                  x={cx}
                  y={cy - (on ? 14 : 12)}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill={on ? "var(--foreground)" : "var(--muted)"}
                  pointerEvents="none"
                >
                  {o.ticker}
                </text>
              </g>
            );
          })}

          <text x={M.left + pw / 2} y={H - 6} textAnchor="middle" fontSize={11} fill="var(--muted)">
            Announced capacity, log scale
          </text>
          <text
            x={-(M.top + ph / 2)}
            y={14}
            textAnchor="middle"
            fontSize={11}
            fill="var(--muted)"
            transform="rotate(-90)"
          >
            Live capacity, log scale
          </text>
        </svg>
      </div>

      <div className="mt-3 min-h-[3.5rem] text-sm">
        {(() => {
          const o = operators.find((x) => x.id === active);
          if (!o)
            return (
              <p className="text-muted">
                The vertical drop under each point is announced capacity minus what is live. Every
                one of the {operators.length} sits below parity.{" "}
                <span className="text-signal">{floored.length} are on the floor</span>, holding{" "}
                <span className="tnum text-foreground">
                  {(flooredAnnounced / 1000).toFixed(0)} GW
                </span>{" "}
                of announcements between them and nothing live.
              </p>
            );
          return (
            <p>
              <span className="font-medium">{o.operator}</span>
              <span className="text-muted"> · {o.listedParent} · </span>
              <span className="tnum">{o.liveMW}</span>
              <span className="text-muted"> MW live of </span>
              <span className="tnum">{o.announcedMW}</span>
              <span className="text-muted"> announced</span>
              {o.handedOverMW !== null && o.handedOverMW < o.liveMW && (
                <span className="text-signal">
                  {" "}
                  · only <span className="tnum">{o.handedOverMW}</span> MW handed over
                </span>
              )}
            </p>
          );
        })()}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-xs">
          <caption className="sr-only">
            Announced against live capacity by operator, with verification tag
          </caption>
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-2 pr-3 font-medium">Operator</th>
              <th className="py-2 pr-3 font-medium">Listed via</th>
              <th className="py-2 pr-3 text-right font-medium">Announced</th>
              <th className="py-2 pr-3 text-right font-medium">Live</th>
              <th className="py-2 pr-3 text-right font-medium">Delivered</th>
              <th className="py-2 font-medium">Sourcing</th>
            </tr>
          </thead>
          <tbody>
            {[...operators]
              .sort((a, b) => b.announcedMW - a.announcedMW)
              .map((o) => {
                const pct = (o.liveMW / o.announcedMW) * 100;
                return (
                  <tr
                    key={o.id}
                    className="border-b border-line"
                    onMouseEnter={() => setActive(o.id)}
                    onMouseLeave={() => setActive(null)}
                  >
                    <td className="py-2 pr-3">
                      <span className="flex items-center gap-2">
                        <Logo ticker={o.ticker} name={o.listedParent} size="sm" tone={verdictTone(o.verdict)} />
                        <span className={active === o.id ? "text-accent" : ""}>{o.operator}</span>
                      </span>
                    </td>
                    <td className="py-2 pr-3 text-muted">{o.ticker}</td>
                    <td className="py-2 pr-3 text-right tnum">{o.announcedMW}</td>
                    <td className="py-2 pr-3 text-right tnum">{o.liveMW}</td>
                    <td
                      className={
                        "py-2 pr-3 text-right tnum " + (pct < 20 ? "text-signal" : "text-muted")
                      }
                    >
                      {pct.toFixed(0)}%
                    </td>
                    <td className="py-2">
                      <span
                        className={
                          "rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide " +
                          (o.source.verification === "PRIMARY" ? "text-accent" : "text-muted")
                        }
                      >
                        {o.source.verification.toLowerCase()}
                      </span>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 border-t border-line pt-3 text-xs leading-relaxed text-muted">
        Announced capacity is an ambition, not a result: every one of these figures is a company
        statement about the future. Only Sify is traced to a filed document. The rest are research
        note figures carried at secondary or unverified and marked as such on the row, and they
        upgrade as filings are read.
      </p>
    </div>
  );
}
