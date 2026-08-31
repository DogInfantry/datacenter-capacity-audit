"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Icon, verdictTone } from "./Visual";
import { Logo } from "./Logo";

type Op = {
  id: string;
  operator: string;
  listedParent: string;
  ticker: string;
  exchange: string;
  announcedMW: number;
  liveMW: number;
  handedOverMW: number | null;
  verdict: string;
  note: string;
  source: { label: string; verification: string };
};

type Watch = {
  name: string;
  ticker: string;
  bucket: string;
  role: string;
  verdict: string;
  metric: string;
  note: string;
};

type Row = {
  key: string;
  name: string;
  parent: string;
  ticker: string;
  bucket: string;
  verdict: string;
  metric: string;
  note: string;
  verification: string;
  liveMW: number | null;
  handedOverMW: number | null;
};

const VERDICT_TONE: Record<string, string> = {
  EXECUTING: "text-accent",
  ADVANCING: "text-accent",
  PLANNING: "text-muted",
  LAGGING: "text-signal",
  AMBITION_OVER_EXECUTION: "text-signal",
};

const label = (s: string) =>
  s
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());

/**
 * The coverage matrix.
 *
 * Operators carry megawatts and appear on the two by two. Everyone else carries
 * whatever metric their business is actually measured on, and is deliberately
 * absent from that plot, because an order book and a megawatt do not belong on
 * the same axes. Both kinds sit in one table here because a reader wants the
 * coverage in one place, with the difference marked rather than hidden.
 */
export function UniverseMatrix({
  operators,
  watchlist,
  covered,
}: {
  operators: Op[];
  watchlist: Watch[];
  /** Tickers with a deep-dive. The route owns that list, not this table. */
  covered: string[];
}) {
  const hasPage = new Set(covered);
  const [bucket, setBucket] = useState("ALL");
  const [verdict, setVerdict] = useState("ALL");

  const rows: Row[] = useMemo(
    () => [
      ...operators.map((o) => ({
        key: o.id,
        name: o.operator,
        parent: o.listedParent,
        ticker: o.ticker,
        bucket: "DC_AI_INFRA",
        verdict: o.verdict,
        metric: `${o.liveMW} MW live of ${o.announcedMW} announced`,
        note: o.note,
        verification: o.source.verification,
        liveMW: o.liveMW,
        handedOverMW: o.handedOverMW,
      })),
      ...watchlist.map((w) => ({
        key: w.ticker,
        name: w.name,
        parent: w.name,
        ticker: w.ticker,
        bucket: w.bucket,
        verdict: w.verdict,
        metric: w.metric,
        note: w.note,
        verification: "SECONDARY",
        liveMW: null,
        handedOverMW: null,
      })),
    ],
    [operators, watchlist],
  );

  const buckets = ["ALL", ...Array.from(new Set(rows.map((r) => r.bucket)))];
  const verdicts = ["ALL", ...Array.from(new Set(rows.map((r) => r.verdict)))];

  const shown = rows.filter(
    (r) =>
      (bucket === "ALL" || r.bucket === bucket) && (verdict === "ALL" || r.verdict === verdict),
  );
  const plotted = shown.filter((r) => r.liveMW !== null).length;

  return (
    <div>
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {[
          { name: "Bucket", value: bucket, set: setBucket, options: buckets },
          { name: "Verdict", value: verdict, set: setVerdict, options: verdicts },
        ].map((f) => (
          <div key={f.name} className="flex flex-wrap items-center gap-2">
            <span className="exhibit-label">{f.name}</span>
            {f.options.map((o) => (
              <button
                key={o}
                type="button"
                onClick={() => f.set(o)}
                aria-pressed={f.value === o}
                className={
                  "rounded-sm border px-2 py-1 text-xs transition-colors " +
                  (f.value === o
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line text-muted hover:text-accent")
                }
              >
                {o === "ALL" ? "All" : label(o)}
              </button>
            ))}
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted">
        <span className="tnum text-foreground">{shown.length}</span> of{" "}
        <span className="tnum">{rows.length}</span> names.{" "}
        <span className="tnum text-foreground">{plotted}</span> carry megawatts and appear on the
        Execution against Ambition plot. The rest are measured on order books, revenue mix or
        backlog, which are not megawatts and do not plot against them.
      </p>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[52rem] border-collapse text-sm">
          <caption className="sr-only">
            Coverage universe with verdict, metric and sourcing
          </caption>
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="w-[17rem] py-2 pr-4 font-medium">Company</th>
              <th className="py-2 pr-4 font-medium">Ticker</th>
              <th className="py-2 pr-4 font-medium">Bucket</th>
              <th className="py-2 pr-4 font-medium">Verdict</th>
              <th className="py-2 pr-4 font-medium">Where it actually is</th>
              <th className="py-2 font-medium">Sourcing</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((r) => (
              <tr key={r.key} className="border-b border-line align-top">
                <td className="py-3 pr-4">
                  <span className="flex items-center gap-2">
                    <Logo ticker={r.ticker} name={r.parent} size="sm" tone={verdictTone(r.verdict)} />
                    <span>
                      {hasPage.has(r.ticker) ? (
                        <Link
                          href={`/company/${r.ticker}`}
                          className="block underline decoration-line underline-offset-4 hover:text-accent"
                        >
                          {r.name}
                        </Link>
                      ) : (
                        <span className="block">{r.name}</span>
                      )}
                      {r.parent !== r.name && (
                        <span className="block text-xs text-muted">via {r.parent}</span>
                      )}
                    </span>
                  </span>
                </td>
                <td className="py-3 pr-4 font-mono text-xs text-muted">{r.ticker}</td>
                <td className="py-3 pr-4 text-xs text-muted">{label(r.bucket)}</td>
                <td className={"py-3 pr-4 text-xs " + (VERDICT_TONE[r.verdict] ?? "text-muted")}>
                  <span className="flex items-center gap-1.5">
                    {r.verdict === "AMBITION_OVER_EXECUTION" && <Icon name="warning" size={13} />}
                    {label(r.verdict)}
                  </span>
                </td>
                <td className="py-3 pr-4 text-xs">
                  <span className="block tnum">{r.metric}</span>
                  {r.handedOverMW !== null && r.liveMW !== null && r.handedOverMW < r.liveMW && (
                    <span className="mt-0.5 block text-signal">
                      only <span className="tnum">{r.handedOverMW}</span> MW handed over
                    </span>
                  )}
                  <span className="mt-1 block leading-relaxed text-muted">{r.note}</span>
                </td>
                <td className="py-3">
                  <span
                    className={
                      "rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide " +
                      (r.verification === "PRIMARY" ? "text-accent" : "text-muted")
                    }
                  >
                    {r.verification.toLowerCase()}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {shown.length === 0 && (
        <p className="mt-6 text-sm text-muted">No name matches that combination.</p>
      )}
    </div>
  );
}
