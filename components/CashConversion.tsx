import type { Band } from "@/lib/config";
import type { PillarReading } from "@/lib/diagnostics/cashQuality";
import { Icon } from "./Visual";

/**
 * Cash conversion, one period per row.
 *
 * Two measures of the same idea, side by side, because they can disagree and
 * the disagreement is worth more than either verdict alone. Nothing is averaged
 * into a score: a mean over two measures that point opposite ways would report
 * the midpoint of a contradiction as though it were a finding.
 *
 * A refused cell carries the reason in place of the number. An empty cell and a
 * measured zero look identical once a value is missing, so the reason is the
 * only thing that keeps them apart.
 */

const TONE: Record<Band, string> = {
  GREEN: "var(--accent)",
  AMBER: "var(--rung-2)",
  RED: "var(--signal)",
  REFUSED: "var(--muted)",
};

const WORD: Record<Band, string> = {
  GREEN: "within",
  AMBER: "flagged",
  RED: "outside",
  REFUSED: "refused",
};

function Chip({ band }: { band: Band }) {
  return (
    <span
      className="rounded-sm border px-1.5 py-0.5 text-[10px] uppercase tracking-wide"
      style={{ color: TONE[band], borderColor: TONE[band] }}
    >
      {WORD[band]}
    </span>
  );
}

export function CashConversion({ readings }: { readings: PillarReading[] }) {
  const keys = readings[0].metrics.map((m) => ({ key: m.key, label: m.label, unit: m.unit }));

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <thead>
            <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
              <th className="py-2 pr-4 font-normal">Period</th>
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
              <tr key={r.period} className="border-b border-line align-top">
                <td className="py-3 pr-4 text-muted">{r.period}</td>
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

      <dl className="mt-4 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
        {keys.map((k) => {
          const rule = readings[0].metrics.find((m) => m.key === k.key)!.rule;
          return (
            <div key={k.key} className="bg-card p-4">
              <dt className="text-[11px] uppercase tracking-wider text-muted">{k.label}</dt>
              <dd className="mt-1.5 text-xs leading-relaxed text-muted">{rule}</dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
