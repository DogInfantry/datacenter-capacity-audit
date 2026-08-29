"use client";

import { useState, type ReactNode } from "react";
import { Monogram } from "./Visual";

/**
 * Exhibit chrome. A number so it can be referred to, an action title that states
 * the finding rather than the topic, a units line, and a source carrying the
 * printed page. Research convention, and most of what makes a chart read as
 * professional rather than decorative.
 */
export function Exhibit({
  n,
  title,
  units,
  source,
  page,
  children,
}: {
  n: number;
  title: string;
  units: string;
  source: string;
  page?: number;
  children: ReactNode;
}) {
  return (
    <figure className="rise overflow-hidden rounded-md border border-line bg-card">
      <figcaption className="border-b border-line px-5 py-4">
        <p className="exhibit-label">Exhibit {n}</p>
        <p className="mt-1.5 font-display text-xl leading-snug tracking-tight">{title}</p>
        <p className="mt-1 text-xs text-muted">{units}</p>
      </figcaption>
      <div className="px-5 py-5">{children}</div>
      <p className="border-t border-line px-5 py-3 text-[11px] leading-relaxed text-muted">
        Source: {source}{page ? ` Printed page ${page}.` : ""}
      </p>
    </figure>
  );
}

type Site = {
  name: string;
  city: string;
  builtMW: number;
  installedMW: number;
  operationalMW: number;
};

/**
 * The estate, one row per site, sorted by built capacity.
 *
 * Stacked rather than three grouped bars because the rungs are nested by
 * definition: operational sits inside installed, which sits inside built. The
 * ramp is one hue light to dark for the same reason, since these are magnitudes
 * of one quantity rather than three separate identities.
 */
export function Estate({ sites }: { sites: Site[] }) {
  const [hover, setHover] = useState<string | null>(null);
  const rows = [...sites].sort((a, b) => b.builtMW - a.builtMW);
  const max = Math.max(...rows.map((r) => r.builtMW));
  const paper = rows.filter((r) => r.operationalMW / r.builtMW < 0.2);
  const paperBuilt = paper.reduce((t, r) => t + r.builtMW, 0);
  const totalBuilt = rows.reduce((t, r) => t + r.builtMW, 0);
  const paperOper = paper.reduce((t, r) => t + r.operationalMW, 0);
  const totalOper = rows.reduce((t, r) => t + r.operationalMW, 0);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        {[
          ["Sold", "var(--rung-4)"],
          ["Commissioned, unsold", "var(--rung-2)"],
          ["Engineered only", "var(--rung-1)"],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>

      <ul className="space-y-1.5">
        {rows.map((r) => {
          const lit = r.operationalMW / r.builtMW < 0.2;
          const w = (v: number) => `${(v / max) * 100}%`;
          return (
            <li
              key={r.name}
              className="grid grid-cols-[8.5rem_1fr_3.25rem] items-center gap-3 text-xs sm:grid-cols-[10rem_1fr_3.5rem]"
              onMouseEnter={() => setHover(r.name)}
              onMouseLeave={() => setHover(null)}
            >
              <span className={lit ? "truncate text-signal" : "truncate text-muted"}>
                {r.name}
              </span>
              <span className="relative block h-5 rounded-sm bg-grid">
                <span
                  className="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-300"
                  style={{ width: w(r.builtMW), background: "var(--rung-1)" }}
                />
                <span
                  className="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-300"
                  style={{ width: w(r.installedMW), background: "var(--rung-2)" }}
                />
                <span
                  className="absolute inset-y-0 left-0 rounded-sm transition-[width] duration-300"
                  style={{ width: w(r.operationalMW), background: "var(--rung-4)" }}
                />
                {lit && (
                  <span
                    aria-hidden
                    className="absolute inset-y-0 left-0 rounded-sm border border-signal"
                    style={{ width: w(r.builtMW) }}
                  />
                )}
              </span>
              <span className="text-right tnum text-muted">
                {hover === r.name ? r.operationalMW.toFixed(2) : r.builtMW.toFixed(2)}
              </span>
            </li>
          );
        })}
      </ul>

      <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-muted">
        The <span className="text-signal">{paper.length} outlined rows</span> carry{" "}
        <span className="tnum text-foreground">{paperBuilt.toFixed(2)}</span> MW of built capacity,{" "}
        <span className="tnum text-foreground">
          {((paperBuilt / totalBuilt) * 100).toFixed(0)}
        </span>{" "}
        per cent of the estate, and sell{" "}
        <span className="tnum text-foreground">{paperOper.toFixed(2)}</span> MW, or{" "}
        <span className="tnum text-foreground">{((paperOper / totalOper) * 100).toFixed(0)}</span>{" "}
        per cent of what earns.
      </p>

      <details className="mt-3">
        <summary className="cursor-pointer text-xs text-muted hover:text-accent">
          Show the numbers
        </summary>
        <div className="overflow-x-auto">
          <table className="mt-3 w-full min-w-[26rem] border-collapse text-xs">
            <caption className="sr-only">Capacity by data centre and rung</caption>
            <thead>
              <tr className="border-b border-line text-left text-muted">
                <th className="py-1.5 pr-3 font-medium">Data centre</th>
                <th className="py-1.5 pr-3 text-right font-medium">Built</th>
                <th className="py-1.5 pr-3 text-right font-medium">Installed</th>
                <th className="py-1.5 text-right font-medium">Operational</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.name} className="border-b border-line">
                  <td className="py-1.5 pr-3">{r.name}</td>
                  <td className="py-1.5 pr-3 text-right tnum">{r.builtMW.toFixed(2)}</td>
                  <td className="py-1.5 pr-3 text-right tnum">{r.installedMW.toFixed(2)}</td>
                  <td className="py-1.5 text-right tnum">{r.operationalMW.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}

type Peer = {
  name: string;
  fiscalEnd: string;
  revenue: number;
  builtMW: number | null;
  operationalMW: number | null;
  pat: number;
  self: boolean;
};

/**
 * Revenue per megawatt, on both denominators, across the peer set the issuer
 * chose for itself.
 *
 * Where the issuer printed "not applicable" the bar is absent and the row says
 * so. Imputing those cells would destroy the finding, which is that a comparison
 * table went into a prospectus with the comparison left out of it.
 */
export function RevenuePerMW({ peers }: { peers: Peer[] }) {
  const rows = peers.map((p) => ({
    ...p,
    perBuilt: p.builtMW ? p.revenue / p.builtMW : null,
    perOper: p.operationalMW ? p.revenue / p.operationalMW : null,
  }));
  const max = Math.max(...rows.flatMap((r) => [r.perBuilt ?? 0, r.perOper ?? 0]));
  const self = rows.find((r) => r.self)!;
  const rival = rows.find((r) => !r.self && r.perOper !== null);

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        {[
          ["Per MW built", "var(--rung-1)"],
          ["Per MW sold", "var(--accent)"],
        ].map(([l, c]) => (
          <span key={l} className="flex items-center gap-2">
            <span aria-hidden className="h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>

      <ul className="space-y-3.5">
        {rows.map((r) => (
          <li key={r.name} className="text-xs">
            <div className="flex items-baseline justify-between gap-3">
              <span className="flex items-center gap-2">
                <Monogram name={r.name} size={22} />
                <span className={r.self ? "font-medium text-accent" : "text-muted"}>
                  {r.name}
                  <span className="ml-1.5 text-[10px] text-muted">{r.fiscalEnd}</span>
                </span>
              </span>
              <span className="tnum text-muted">
                {r.perOper ? `${r.perOper.toFixed(0)} per MW sold` : "capacity not disclosed"}
              </span>
            </div>
            <div className="mt-1.5 space-y-1">
              <span className="block h-3 rounded-sm bg-grid">
                {r.perBuilt !== null && (
                  <span
                    className="block h-3 rounded-sm transition-[width] duration-300"
                    style={{ width: `${(r.perBuilt / max) * 100}%`, background: "var(--rung-1)" }}
                  />
                )}
              </span>
              <span className="block h-3 rounded-sm bg-grid">
                {r.perOper !== null && (
                  <span
                    className="block h-3 rounded-sm transition-[width] duration-300"
                    style={{ width: `${(r.perOper / max) * 100}%`, background: "var(--accent)" }}
                  />
                )}
              </span>
            </div>
          </li>
        ))}
      </ul>

      {rival && (
        <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-muted">
          {rival.name} sells almost exactly the same megawatts,{" "}
          <span className="tnum text-foreground">{rival.operationalMW}</span> against{" "}
          <span className="tnum text-foreground">{self.operationalMW}</span>, and earns{" "}
          <span className="tnum text-foreground">
            {(((rival.perOper ?? 0) / (self.perOper ?? 1) - 1) * 100).toFixed(0)}
          </span>{" "}
          per cent more revenue on them. It also lost{" "}
          <span className="tnum text-foreground">
            {Math.abs(rival.pat).toLocaleString("en-IN")}
          </span>{" "}
          million rupees doing it, against a profit of{" "}
          <span className="tnum text-foreground">{self.pat.toLocaleString("en-IN")}</span>. Two of
          the four columns the issuer chose carry no capacity figure at all.
        </p>
      )}
    </div>
  );
}
