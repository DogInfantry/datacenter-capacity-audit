import type { associateExposure } from "@/lib/diagnostics/governance";
import { Icon } from "./Visual";

/**
 * The associate that is nothing in the profit line and a quarter of net worth.
 *
 * Drawn as one bar per period against net worth, because the whole point is a
 * proportion rather than a level: the amounts mean nothing to a reader who does
 * not know what the company is worth, and every alternative to a bar here was a
 * number that had to be divided in the head.
 *
 * The guarantee is a separate, hatched segment rather than part of the filled
 * one. It sits off the balance sheet, and the document gives its direction two
 * different ways in the same note, so drawing it as though it were settled
 * would resolve on the reader's behalf a question the source leaves open.
 */

type Exposure = ReturnType<typeof associateExposure>;

const fmt = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

/**
 * The exposures run to thousands and the associate's share of profit to
 * fractions, so one precision cannot serve both. Rounded to the whole number
 * the exposures want, a loss of 0.45 prints as minus zero, which reads as a
 * rendering fault and hides the thing worth seeing: the contribution is not
 * absent, it is small and negative.
 */
const fmtSmall = (n: number) =>
  n === 0 ? "nil" : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function AssociateExposure({ data }: { data: Exposure }) {
  // One scale across the periods, set by the widest bar, so the rows are
  // comparable to each other and not only each to itself.
  const max = Math.max(...data.rows.map((r) => r.withGuaranteeShareOfNetWorthPct));

  return (
    <div>
      <div className="grid gap-6">
        {data.rows.map((r) => {
          const profit = data.shareOfProfit.find((p) => p.label === r.label);
          const guaranteePct = r.withGuaranteeShareOfNetWorthPct - r.onSheetShareOfNetWorthPct;
          return (
            <div key={r.label}>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="text-sm text-foreground">
                  {r.label}
                  <span className="ml-2 text-xs text-muted">as at {r.asOf}</span>
                </p>
                <p className="text-xs text-muted">
                  Net worth <span className="tnum text-foreground">{fmt(r.netWorth)}</span>
                </p>
              </div>

              <div
                className="mt-2 flex h-7 w-full overflow-hidden rounded-sm border border-line"
                role="img"
                aria-label={`${r.label}: exposure on the balance sheet is ${r.onSheetShareOfNetWorthPct.toFixed(1)} per cent of net worth, and ${guaranteePct.toFixed(1)} per cent more if the guarantee is counted`}
              >
                <span
                  className="h-full"
                  style={{
                    width: `${(r.onSheetShareOfNetWorthPct / max) * 100}%`,
                    background: "var(--signal)",
                  }}
                />
                <span
                  className="h-full"
                  style={{
                    width: `${(guaranteePct / max) * 100}%`,
                    backgroundImage:
                      "repeating-linear-gradient(135deg, var(--signal) 0 2px, transparent 2px 6px)",
                  }}
                />
              </div>

              <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                <span>
                  <dt className="inline">On the balance sheet </dt>
                  <dd className="tnum inline text-foreground">
                    {fmt(r.onSheet)}, {r.onSheetShareOfNetWorthPct.toFixed(1)}% of net worth
                  </dd>
                </span>
                <span>
                  <dt className="inline">Guarantee, off it </dt>
                  <dd className="tnum inline text-foreground">{fmt(r.guaranteeGivenMn)}</dd>
                </span>
                <span>
                  <dt className="inline">The associate&rsquo;s share of profit </dt>
                  <dd className="tnum inline text-foreground">
                    {profit ? fmtSmall(profit.amount) : "not reported"}
                  </dd>
                </span>
                <span>Printed page {r.page}</span>
              </dl>
            </div>
          );
        })}
      </div>

      <div className="mt-6 flex gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <p>
          The guarantee row is printed under a heading reading{" "}
          <span className="text-foreground">{data.headingWords}</span>, and carries this footnote:{" "}
          <span className="text-foreground">{data.footnoteQuote}</span> The heading has the
          associate standing behind the issuer. The footnote has the issuer standing behind the
          associate. Both are on printed page {data.page}, the filing does not reconcile them, and
          the guarantee is drawn apart from the rest for that reason rather than added to it.
        </p>
      </div>
    </div>
  );
}
