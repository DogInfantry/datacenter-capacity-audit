"use client";

import { useState } from "react";

type Site = {
  name: string;
  city: string;
  state: string;
  builtMW: number;
  installedMW: number;
  operationalMW: number;
};

/**
 * The estate, placed geographically.
 *
 * Plotted on a graticule rather than over a drawn national outline. A hand
 * traced border would be decoration carrying a political claim this project has
 * no business making, and getting it subtly wrong on an India piece is worse
 * than leaving it out. Cities sit at their true coordinates on an
 * equirectangular projection, which is honest about being a coordinate plot.
 *
 * Bubble area is proportional to built capacity, so the eye compares area rather
 * than radius. The filled inner disc is the share that actually earns revenue.
 */
const CITY: Record<string, { lat: number; lon: number }> = {
  "Navi Mumbai": { lat: 19.03, lon: 73.02 },
  Noida: { lat: 28.54, lon: 77.39 },
  Hyderabad: { lat: 17.39, lon: 78.49 },
  Bengaluru: { lat: 12.97, lon: 77.59 },
  Chennai: { lat: 13.08, lon: 80.27 },
  Kolkata: { lat: 22.57, lon: 88.36 },
};

const LON: [number, number] = [68, 98];
const LAT: [number, number] = [7, 37];

export function SiteMap({ sites }: { sites: Site[] }) {
  const [active, setActive] = useState<string | null>(null);

  const byCity = Object.entries(
    sites.reduce<Record<string, Site[]>>((acc, s) => {
      (acc[s.city] ??= []).push(s);
      return acc;
    }, {}),
  ).map(([city, rows]) => ({
    city,
    state: rows[0].state,
    count: rows.length,
    built: rows.reduce((t, r) => t + r.builtMW, 0),
    operational: rows.reduce((t, r) => t + r.operationalMW, 0),
  }));

  const W = 460;
  const H = 500;
  const M = 34;
  const x = (lon: number) => M + ((lon - LON[0]) / (LON[1] - LON[0])) * (W - 2 * M);
  const y = (lat: number) => H - M - ((lat - LAT[0]) / (LAT[1] - LAT[0])) * (H - 2 * M);

  const maxBuilt = Math.max(...byCity.map((c) => c.built));
  const r = (mw: number) => 9 + Math.sqrt(mw / maxBuilt) * 26;

  const totalBuilt = byCity.reduce((t, c) => t + c.built, 0);
  const totalOper = byCity.reduce((t, c) => t + c.operational, 0);
  const twoStates = byCity
    .filter((c) => ["Maharashtra", "Tamil Nadu"].includes(c.state))
    .reduce((t, c) => t + c.operational, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,21rem)_1fr]">
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full min-w-[16rem]"
          role="img"
          aria-label="Data centre locations by city, bubble area proportional to built capacity, inner disc the share sold"
        >
          {[70, 78, 86, 94].map((lon) => (
            <g key={lon}>
              <line
                x1={x(lon)}
                x2={x(lon)}
                y1={M}
                y2={H - M}
                stroke="var(--grid)"
                strokeWidth={1}
              />
              <text x={x(lon)} y={H - M + 15} textAnchor="middle" fontSize={9} fill="var(--muted)">
                {lon}E
              </text>
            </g>
          ))}
          {[10, 18, 26, 34].map((lat) => (
            <g key={lat}>
              <line
                x1={M}
                x2={W - M}
                y1={y(lat)}
                y2={y(lat)}
                stroke="var(--grid)"
                strokeWidth={1}
              />
              <text x={M - 8} y={y(lat) + 3} textAnchor="end" fontSize={9} fill="var(--muted)">
                {lat}N
              </text>
            </g>
          ))}

          {byCity.map((c) => {
            const p = CITY[c.city];
            if (!p) return null;
            const R = r(c.built);
            const share = c.operational / c.built;
            const on = active === c.city;
            return (
              <g
                key={c.city}
                onMouseEnter={() => setActive(c.city)}
                onMouseLeave={() => setActive(null)}
                style={{ cursor: "pointer" }}
              >
                <circle
                  cx={x(p.lon)}
                  cy={y(p.lat)}
                  r={R}
                  fill="var(--rung-1)"
                  stroke={on ? "var(--accent-deep)" : "var(--card)"}
                  strokeWidth={2}
                  opacity={active && !on ? 0.5 : 1}
                  style={{ transition: "opacity 180ms" }}
                />
                <circle
                  cx={x(p.lon)}
                  cy={y(p.lat)}
                  r={R * Math.sqrt(share)}
                  fill="var(--accent)"
                  pointerEvents="none"
                />
                <text
                  x={x(p.lon)}
                  y={y(p.lat) - R - 6}
                  textAnchor="middle"
                  fontSize={10.5}
                  fill={on ? "var(--foreground)" : "var(--muted)"}
                  pointerEvents="none"
                >
                  {c.city}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div>
        <div className="mb-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--accent)" }}
            />
            Sold
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--rung-1)" }}
            />
            Built, not sold
          </span>
          <span>Bubble area is built MW</span>
        </div>

        <ul className="divide-y divide-line">
          {[...byCity]
            .sort((a, b) => b.built - a.built)
            .map((c) => {
              const pct = (c.operational / c.built) * 100;
              return (
                <li
                  key={c.city}
                  className="grid grid-cols-[1fr_auto] items-baseline gap-x-3 py-2"
                  onMouseEnter={() => setActive(c.city)}
                  onMouseLeave={() => setActive(null)}
                >
                  <span className="text-sm">
                    <span className={active === c.city ? "text-accent" : ""}>{c.city}</span>
                    <span className="ml-2 text-xs text-muted">
                      {c.state} · {c.count} {c.count === 1 ? "site" : "sites"}
                    </span>
                  </span>
                  <span className="text-right text-xs tnum">
                    <span className="text-accent">{c.operational.toFixed(2)}</span>
                    <span className="text-muted"> of {c.built.toFixed(2)} MW · </span>
                    <span className={pct < 50 ? "text-signal" : "text-muted"}>
                      {pct.toFixed(0)}%
                    </span>
                  </span>
                </li>
              );
            })}
        </ul>

        <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-muted">
          Six cities, {sites.length} data centres,{" "}
          <span className="tnum text-foreground">{totalBuilt.toFixed(2)}</span> MW built against{" "}
          <span className="tnum text-foreground">{totalOper.toFixed(2)}</span> MW sold. Maharashtra
          and Tamil Nadu alone hold{" "}
          <span className="tnum text-foreground">
            {((twoStates / totalOper) * 100).toFixed(0)}
          </span>{" "}
          per cent of the capacity that earns, which is why the power tariff work starts with those
          two regulators.
        </p>
      </div>
    </div>
  );
}
