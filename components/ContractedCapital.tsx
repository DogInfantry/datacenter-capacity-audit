import type { contractedCapital, segmentAbsence } from "@/lib/diagnostics/technoe";
import { Icon } from "./Visual";

/**
 * Three audited figures on one scale, and a capacity target that appears on
 * none of them.
 *
 * The target and the campus megawatts are management commentary. The three
 * bars are lines an auditor has looked at, in one unit, from one document. The
 * point of putting them on a single scale is that the smallest of the three is
 * the only one that represents building anything.
 *
 * The megawatt translation sits underneath rather than beside, because it uses
 * a sector build cost rather than a figure of the company's own, and mixing a
 * derived quantity into a row of filed ones would flatten that difference.
 */

type Data = ReturnType<typeof contractedCapital>;
type Segment = ReturnType<typeof segmentAbsence>;

const mn = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function ContractedCapital({ data, segment }: { data: Data; segment: Segment }) {
  const bars = [
    {
      label: "Contracts on capital account remaining to be executed",
      value: data.commitmentMn,
      tone: "var(--accent)",
    },
    {
      label: "Tax demands disputed and unprovided",
      value: data.contingentTotalMn,
      tone: "var(--rung-1)",
    },
    {
      label: "Overdue balances drawn to the auditor's attention",
      value: data.overdueMn,
      tone: "var(--signal)",
    },
  ];
  const scale = Math.max(...bars.map((b) => b.value));

  return (
    <div>
      <div className="grid gap-3">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="text-sm text-foreground">{b.label}</span>
              <span className="tnum text-sm text-foreground">{mn(b.value)}</span>
            </div>
            <div
              className="mt-1.5 h-7 rounded-sm"
              style={{ width: `${(b.value / scale) * 100}%`, background: b.tone }}
              role="img"
              aria-label={`${b.label}: ${mn(b.value)} million rupees`}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Millions of rupees, all three from the year ended 31 March 2026. The disputed tax is{" "}
        <span className="tnum text-foreground">{data.contingentOverCommitment.toFixed(2)}</span> times
        the contracted capital and the overdue balances are{" "}
        <span className="tnum text-foreground">{data.overdueOverCommitment.toFixed(2)}</span> times
        it. Printed pages {data.standalonePage} and {data.consolidatedPage} for the commitment, and{" "}
        {data.emphasisPage} for the auditor&rsquo;s paragraph.
      </p>

      <div className="mt-7 border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="text-sm text-foreground">
            What the contracted capital buys at the sector build cost
          </span>
          <span className="tnum text-sm text-foreground">
            {data.mwLow.toFixed(2)} to {data.mwHigh.toFixed(2)} MW
          </span>
        </div>
        <div className="mt-2 flex h-8 overflow-hidden rounded-sm border border-line">
          <span
            className="h-full"
            style={{
              width: `${Math.max((data.mwHigh / data.targetMW) * 100, 0.4)}%`,
              background: "var(--accent)",
            }}
          />
        </div>
        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
          <span>
            <dt className="inline">Targeted by {"FY 2029-30"} </dt>
            <dd className="tnum inline text-foreground">{data.targetMW} MW</dd>
          </span>
          <span>
            <dt className="inline">Commissioned and live </dt>
            <dd className="tnum inline text-foreground">{data.liveMW} MW</dd>
          </span>
          <span>
            <dt className="inline">Contracted </dt>
            <dd className="tnum inline text-foreground">
              {data.mwLow.toFixed(2)} to {data.mwHigh.toFixed(2)} MW
            </dd>
          </span>
        </dl>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          The bar is the contracted megawatts against the target, and it is drawn at a floor width so
          that it renders at all. Printed page {data.targetPage} for the target.
        </p>
      </div>

      <div className="mt-5 flex gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <p>
          Across{" "}
          <span className="tnum text-foreground">{segment.printedPagesSearched}</span> printed pages
          the accounts carry no segment disclosure. The terms searched were{" "}
          {segment.termsSearched.join(", ")}. So the business the report calls{" "}
          &ldquo;{segment.ambitionWords}&rdquo; on printed page {segment.ambitionPage} has no revenue,
          no margin and no asset base a reader can separate from the engineering business that funds
          it. Every megawatt figure above is management commentary; every rupee figure is audited.
        </p>
      </div>
    </div>
  );
}
