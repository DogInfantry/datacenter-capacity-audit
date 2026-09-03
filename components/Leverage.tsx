import type { LeverageRow } from "@/lib/diagnostics/capital";
import { Icon } from "./Visual";

/**
 * Net debt, and what the issuer counts inside it.
 *
 * Two columns carry the exhibit. The published ratio is the issuer's own. The
 * one beside it is the same measure with lease liabilities taken back out,
 * which is what the printed definition of capital employed gives a reader who
 * reads it literally, and it is always the flattering one. Showing both is the
 * point: the issuer took the stricter reading and said so nowhere.
 *
 * The rebuild column is not decoration. It is the evidence that leases sit
 * inside the published figure, and without it the claim would rest on the
 * return on capital reconciliation alone, which is an inference from a result
 * rather than a statement of the convention.
 */

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function Leverage({ rows }: { rows: LeverageRow[] }) {
  const annualised = rows.filter((r) => r.annualised);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-sm">
          <caption className="sr-only">
            Net debt as published, rebuilt from the balance sheet, and the leverage ratio on both
            readings of the lease liability
          </caption>
          <thead>
            <tr className="border-b border-line text-left align-bottom text-[11px] uppercase tracking-wider text-muted">
              <th className="py-2 pr-4 font-normal">Period</th>
              <th className="py-2 pr-4 text-right font-normal">
                Net debt
                <span className="block normal-case tracking-normal opacity-70">as published</span>
              </th>
              <th className="py-2 pr-4 text-right font-normal">
                Rebuilt
                <span className="block normal-case tracking-normal opacity-70">leases counted</span>
              </th>
              <th className="py-2 pr-4 text-right font-normal">
                Net debt to EBITDA
                <span className="block normal-case tracking-normal opacity-70">as published</span>
              </th>
              <th className="py-2 text-right font-normal">
                On the printed wording
                <span className="block normal-case tracking-normal opacity-70">leases removed</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              // The stub's published ratio is annualised, so the comparison
              // column is built on the same earnings figure the issuer used.
              // Rebuilding it from the quarter's own earnings would read as a
              // collapse in leverage rather than as a change of basis.
              const earnings = r.netDebt / r.netDebtToEbitda;
              const exLeases = r.netDebtExLeases / earnings;
              return (
                <tr key={r.label} className="border-b border-line">
                  <td className="py-3 pr-4">
                    {r.label}
                    {r.stub && (
                      <span className="block text-xs text-muted">annualised by the issuer</span>
                    )}
                  </td>
                  <td className="tnum py-3 pr-4 text-right">{fmt(r.netDebt)}</td>
                  <td className="tnum py-3 pr-4 text-right">
                    {fmt(r.rebuilt)}
                    <span className="ml-2 text-xs text-accent">
                      {r.leasesAreDebt ? "exact" : "differs"}
                    </span>
                  </td>
                  <td className="tnum py-3 pr-4 text-right text-lg text-foreground">
                    {r.netDebtToEbitda.toFixed(2)}x
                  </td>
                  <td className="tnum py-3 text-right text-lg text-muted">{exLeases.toFixed(2)}x</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 flex gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <p>
          {annualised.length === 1 ? "One period is" : `${annualised.length} periods are`} published
          on a different basis from the earnings printed for{" "}
          {annualised.length === 1 ? "it" : "them"}. Dividing the published net debt by the published
          ratio recovers the earnings the issuer used, and for{" "}
          <span className="text-foreground">{annualised.map((r) => r.label).join(", ")}</span> that
          figure is{" "}
          <span className="tnum text-foreground">{annualised[0]?.earningsMultiple.toFixed(2)}</span>{" "}
          times the earnings the same period reports. The quarter is annualised for this ratio. The
          same document reports the same quarter&rsquo;s return on capital without annualising it,
          and labels neither.
        </p>
      </div>
    </div>
  );
}
