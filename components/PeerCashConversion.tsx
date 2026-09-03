import type { PillarReading } from "@/lib/diagnostics/cashQuality";
import { Chip } from "./CashConversion";
import { Icon } from "./Visual";
import { Logo } from "./Logo";

/**
 * Cash conversion across the filers whose statements are machine readable, one
 * row per company on that company's own most recently filed year.
 *
 * The sibling exhibit reads one company down its periods. This reads one period
 * across companies, which is a different table and not a prop on that one: the
 * axis a reader scans changes, and so does what an empty cell means.
 *
 * Two things are deliberately on the face of it rather than in a footnote. The
 * period sits in its own column, because three of these filers close in March
 * and two in December and a shared heading would put two different years under
 * one word. And the unit sits beside the company, because these accounts are
 * filed in three currencies and nothing here converts between them: the two
 * measures are a ratio and a percentage, so they travel where the levels do not.
 */

export function PeerCashConversion({
  readings,
  unitFor,
}: {
  readings: PillarReading[];
  unitFor: Record<string, string>;
}) {
  const keys = readings[0].metrics.map((m) => ({ key: m.key, label: m.label, unit: m.unit }));

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[42rem] border-collapse text-sm">
        <thead>
          <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
            <th className="py-2 pr-4 font-normal">Filer</th>
            <th className="py-2 pr-4 font-normal">Year filed</th>
            {keys.map((k) => (
              <th key={k.key} className="py-2 pr-4 font-normal">
                {k.label}
                <span className="block normal-case tracking-normal opacity-70">{k.unit}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {readings.map((r) => (
            <tr key={`${r.ticker}-${r.period}`} className="border-b border-line align-top">
              <td className="py-3 pr-4">
                <span className="flex items-center gap-2.5">
                  <Logo ticker={r.ticker} name={r.name} size="md" />
                  <span>
                    <span className="block text-foreground">{r.name}</span>
                    <span className="block text-xs text-muted">
                      Accounts in {unitFor[r.ticker]}
                    </span>
                  </span>
                </span>
              </td>
              <td className="tnum py-3 pr-4 text-muted">{r.period}</td>
              {r.metrics.map((m) => (
                <td key={m.key} className="py-3 pr-4">
                  {m.value === null ? (
                    <span className="flex gap-1.5 text-xs leading-relaxed text-muted">
                      <span className="mt-0.5 shrink-0">
                        <Icon name="warning" size={13} />
                      </span>
                      {m.refusal}
                    </span>
                  ) : (
                    <span className="flex items-baseline gap-2">
                      <span className="tnum text-lg text-foreground">
                        {m.key === "accrualRatio"
                          ? `${m.value.toFixed(1)}%`
                          : `${m.value.toFixed(2)}x`}
                      </span>
                      <Chip band={m.band} />
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
