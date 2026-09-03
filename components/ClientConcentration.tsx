"use client";

import { useState } from "react";
import type { PeriodTie } from "@/lib/diagnostics/concentration";

type Row = { rank: number; amount: number; share: number; type: "Hyperscaler" | "Enterprise" };
type Period = { label: string; top10Amount: number; top10Share: number; rows: Row[] };

/**
 * Exhibit: revenue by client, against the contract disclosure it reconciles to.
 *
 * The issuer publishes two tables ten printed pages apart. Page 46 says a little
 * over two thirds of revenue sits on contracts of at least seven years, offered
 * as evidence of durability. Page 36 gives revenue by client. The first equals
 * the sum of the top three clients, all Hyperscalers, in every period to the
 * second decimal. Nowhere does the document put them together.
 *
 * The bracket is the exhibit. Without it this is a stacked bar anyone could draw.
 * With it, the chart states that the contract security and the client
 * concentration are the same three counterparties.
 */
export function ClientConcentration({
  periods,
  tie,
  page,
  contractPage,
  auditedPage,
}: {
  periods: Period[];
  /** Carries the long contract share too, so it is not passed twice. */
  tie: PeriodTie[];
  page: number;
  contractPage: number;
  auditedPage: number;
}) {
  const [hover, setHover] = useState<{ p: string; seg: string } | null>(null);

  const W = 720;
  const L = 92;
  const R = 78;
  const barW = W - L - R;
  const rowH = 34;
  const gap = 22;
  const top = 74;
  const H = top + periods.length * (rowH + gap) + 10;

  const segs = (p: Period) => {
    const r = (n: number) => p.rows.find((x) => x.rank === n)!;
    const restTop10 = p.rows.filter((x) => x.rank > 3).reduce((t, x) => t + x.share, 0);
    return [
      { key: "Client 1", share: r(1).share, fill: "var(--accent-deep)" },
      { key: "Client 2", share: r(2).share, fill: "var(--accent)" },
      { key: "Client 3", share: r(3).share, fill: "var(--rung-2)" },
      { key: "Clients 4 to 10", share: restTop10, fill: "var(--rung-1)" },
      { key: "Everyone else", share: 100 - p.top10Share, fill: "var(--grid)" },
    ];
  };

  const latest = periods[0];
  const earliest = periods[periods.length - 1];
  const top3Latest = latest.rows.filter((r) => r.rank <= 3).reduce((t, r) => t + r.share, 0);
  const bracketW = (top3Latest / 100) * barW;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted">
        {[
          ["Client 1", "var(--accent-deep)"],
          ["Client 2", "var(--accent)"],
          ["Client 3", "var(--rung-2)"],
          ["Clients 4 to 10", "var(--rung-1)"],
          ["Everyone else", "var(--grid)"],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-1.5">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[36rem]"
          role="img"
          aria-label={
            // A `title` element inside this svg is hoisted by React as document
            // metadata and hydrates differently from the server render, which
            // logged a recoverable error on this page for as long as the exhibit
            // has existed. An aria-label gives the identical accessible name
            // with no element to hoist.
            `Revenue by client across four periods. In ${latest.label} the top three clients, ` +
            `all Hyperscalers, are ${top3Latest.toFixed(2)} per cent of revenue, the same figure ` +
            `the prospectus reports separately as revenue on contracts of at least seven years.`
          }
          onMouseLeave={() => setHover(null)}
        >

          {/* The bracket. This is the finding, drawn on the plot. */}
          <g>
            <text x={L} y={top - 50} fontSize={11.5} fill="var(--muted)">
              Three Hyperscalers. Printed page {contractPage} reports the identical figure as
              &ldquo;revenue on contracts of at least 7 years&rdquo;.
            </text>
            <text
              x={L + bracketW / 2}
              y={top - 33}
              textAnchor="middle"
              fontSize={13}
              fontWeight={600}
              fill="var(--signal)"
              className="tnum"
            >
              {top3Latest.toFixed(2)}%
            </text>
            <path
              d={`M ${L} ${top - 16} L ${L} ${top - 26} L ${L + bracketW} ${top - 26} L ${L + bracketW} ${top - 16}`}
              fill="none"
              stroke="var(--signal)"
              strokeWidth={1.5}
            />
          </g>

          {periods.map((p, i) => {
            const y = top + i * (rowH + gap);
            let x = L;
            return (
              <g key={p.label}>
                <text
                  x={L - 12}
                  y={y + rowH / 2 + 4}
                  textAnchor="end"
                  fontSize={12}
                  fill="var(--muted)"
                >
                  {p.label}
                </text>

                {segs(p).map((s) => {
                  const w = (s.share / 100) * barW;
                  const at = x;
                  x += w;
                  return (
                    <g key={s.key}>
                      <rect
                        x={at}
                        y={y}
                        width={Math.max(w - 2, 0)}
                        height={rowH}
                        rx={2}
                        fill={s.fill}
                        opacity={hover && hover.p === p.label && hover.seg !== s.key ? 0.4 : 1}
                        style={{ transition: "opacity 180ms" }}
                        onMouseEnter={() => setHover({ p: p.label, seg: s.key })}
                      />
                      {s.key === "Client 1" && w > 70 && (
                        <text
                          x={at + 10}
                          y={y + rowH / 2 + 4}
                          fontSize={12}
                          fontWeight={600}
                          fill="var(--on-accent)"
                          className="tnum"
                          pointerEvents="none"
                        >
                          {s.share.toFixed(2)}%
                        </text>
                      )}
                    </g>
                  );
                })}

                <text
                  x={W - R + 10}
                  y={y + rowH / 2 + 4}
                  fontSize={11}
                  fill="var(--muted)"
                  className="tnum"
                >
                  {p.top10Share.toFixed(1)}%
                </text>
              </g>
            );
          })}

          <text x={W - R + 10} y={top - 8} fontSize={10} fill="var(--muted)">
            Top 10
          </text>
        </svg>
      </div>

      <div className="mt-3 min-h-[2.75rem] text-sm">
        {hover ? (
          <p className="tnum">
            <span className="font-medium">{hover.p}</span>
            <span className="text-muted"> · {hover.seg} · </span>
            {segs(periods.find((p) => p.label === hover.p)!)
              .find((s) => s.key === hover.seg)!
              .share.toFixed(2)}
            % of revenue
          </p>
        ) : (
          <p className="text-muted">
            Client 1 alone moved from{" "}
            <span className="tnum text-foreground">{earliest.rows[0].share}%</span> of revenue to{" "}
            <span className="tnum text-foreground">{latest.rows[0].share}%</span>. The AI buildout,
            for this company, is one customer getting larger.
          </p>
        )}
      </div>

      <div className="mt-4 rounded-md border border-line bg-paper p-4">
        <p className="exhibit-label">The reconciliation</p>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[28rem] border-collapse text-xs">
            <caption className="sr-only">
              The top three clients as an amount and a share, against the audited note and the long
              contract revenue share, by period
            </caption>
            <thead>
              <tr className="border-b border-line text-left align-bottom text-muted">
                <th className="py-1.5 pr-3 font-medium">Period</th>
                <th className="py-1.5 pr-3 text-right font-medium">
                  Top 3 clients
                  <span className="block font-normal opacity-70">Rs mn, page {page}</span>
                </th>
                <th className="py-1.5 pr-3 text-right font-medium">
                  Audited note
                  <span className="block font-normal opacity-70">Rs mn, page {auditedPage}</span>
                </th>
                <th className="py-1.5 pr-3 text-right font-medium">
                  Their share
                  <span className="block font-normal opacity-70">of revenue</span>
                </th>
                <th className="py-1.5 text-right font-medium">
                  7 year contracts
                  <span className="block font-normal opacity-70">page {contractPage}</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {tie.map((t) => (
                <tr key={t.label} className="border-b border-line">
                  <td className="py-1.5 pr-3">{t.label}</td>
                  <td className="tnum py-1.5 pr-3 text-right">{t.tableMn.toFixed(2)}</td>
                  <td className="tnum py-1.5 pr-3 text-right">{t.auditedMn.toFixed(2)}</td>
                  <td className="tnum py-1.5 pr-3 text-right">{t.auditedSharePct.toFixed(2)}%</td>
                  <td className="tnum py-1.5 text-right text-accent">
                    {t.longContractSharePct.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted">
          Three sections, {tie.filter((t) => t.agrees).length} of {tie.length} periods agreeing on
          both comparisons, to the paisa and to the second decimal. Two of the three are risk
          factors, written by the issuer for its own document, so their matching proves less than it
          looks. The third sits in the notes to the restated financial information, inside the
          accounts the auditor examined, and it reports the same revenue from the same{" "}
          {tie[0].customers} customers. The contract base the prospectus calls durable
          and the client concentration it discloses as a risk are one set of counterparties, and the
          document sets no two of the three side by side.
        </p>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted hover:text-accent">
          Show every client row
        </summary>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full min-w-[30rem] border-collapse text-xs">
            <caption className="sr-only">Revenue share by client rank and period</caption>
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-1.5 pr-3 font-medium">Client</th>
                <th className="py-1.5 pr-3 font-medium">Type</th>
                {periods.map((p) => (
                  <th key={p.label} className="py-1.5 pr-3 text-right font-medium">
                    {p.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods[0].rows.map((r) => (
                <tr key={r.rank} className="border-b border-line">
                  <td className="py-1.5 pr-3">Client {r.rank}</td>
                  <td className="py-1.5 pr-3 text-muted">{r.type}</td>
                  {periods.map((p) => (
                    <td key={p.label} className="py-1.5 pr-3 text-right tnum">
                      {p.rows.find((x) => x.rank === r.rank)!.share.toFixed(2)}%
                    </td>
                  ))}
                </tr>
              ))}
              <tr className="font-medium">
                <td className="py-1.5 pr-3">Top 10</td>
                <td className="py-1.5 pr-3" />
                {periods.map((p) => (
                  <td key={p.label} className="py-1.5 pr-3 text-right tnum">
                    {p.top10Share.toFixed(2)}%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
