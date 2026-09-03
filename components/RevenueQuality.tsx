import type { growthQuality, earningsQuality } from "@/lib/diagnostics/e2e";
import { Icon } from "./Visual";

/**
 * A year reported as growth, and the two figures inside it that disagree.
 *
 * The top half is one bar against another on one scale: the revenue the year
 * reported, and what the rate it ended at annualises to. A percentage would
 * have made the same point and made it abstract. Two bars of visibly different
 * length, the shorter one being the more recent, is the finding.
 *
 * The bottom half is the profit split into what the business made and what
 * arrived from elsewhere. It is drawn as one bar rather than two, because the
 * proportions of a total are the question, and side by side would invite
 * reading them as independent quantities.
 */

type Growth = ReturnType<typeof growthQuality>;
type Earnings = ReturnType<typeof earningsQuality>;

const cr = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 1 });
const lakh = (n: number) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });

export function RevenueQuality({ growth, earnings }: { growth: Growth; earnings: Earnings }) {
  const scale = Math.max(growth.revenueCrore, growth.exitAnnualised, growth.priorCrore);
  const bars = [
    { label: "The year before, as reported", value: growth.priorCrore, tone: "var(--grid)" },
    { label: "The year reported", value: growth.revenueCrore, tone: "var(--accent)" },
    {
      label: "The rate it ended at, annualised",
      value: growth.exitAnnualised,
      tone: "var(--signal)",
    },
  ];

  // The pre-tax profit split. Other income is what is left once the operating
  // result is taken out, which is how the report's own summary is built.
  const pbt = earnings.profitBeforeTaxLakh;
  const opShare = (earnings.operatingLakh / pbt) * 100;

  return (
    <div>
      <div className="grid gap-3">
        {bars.map((b) => (
          <div key={b.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="text-sm text-foreground">{b.label}</span>
              <span className="tnum text-sm text-foreground">{cr(b.value)} cr</span>
            </div>
            <div
              className="mt-1.5 h-7 rounded-sm"
              style={{ width: `${(b.value / scale) * 100}%`, background: b.tone }}
              role="img"
              aria-label={`${b.label}: ${cr(b.value)} crore`}
            />
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Revenue rose{" "}
        <span className="tnum text-foreground">{growth.reportedGrowthPct.toFixed(2)}</span> per cent
        over the year. The rate it ended on rose{" "}
        <span className="tnum text-foreground">{growth.exitGrowthPct.toFixed(2)}</span> per cent, and
        annualises <span className="tnum text-foreground">{cr(growth.shortfallCrore)}</span> crore
        below the year it just finished, or{" "}
        <span className="tnum text-foreground">{growth.shortfallPct.toFixed(1)}</span> per cent of
        it. Twelve times a month is a run rate rather than a forecast; the point is that both figures
        describe the same twelve months. Printed page {growth.page}.
      </p>

      <div className="mt-7 border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="text-sm text-foreground">Where the profit before tax came from</span>
          <span className="tnum text-sm text-foreground">{lakh(pbt)} lakh</span>
        </div>
        <div
          className="mt-2 flex h-8 overflow-hidden rounded-sm border border-line"
          role="img"
          aria-label={`Of ${lakh(pbt)} lakh profit before tax, ${lakh(earnings.operatingLakh)} came from operations and ${lakh(earnings.otherIncomeLakh)} from other income`}
        >
          <span className="h-full" style={{ width: `${opShare}%`, background: "var(--accent)" }} />
          <span className="h-full flex-1" style={{ background: "var(--signal)" }} />
        </div>
        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
          <span>
            <dt className="inline">From operations </dt>
            <dd className="tnum inline text-foreground">
              {lakh(earnings.operatingLakh)} lakh, {opShare.toFixed(0)}%
            </dd>
          </span>
          <span>
            <dt className="inline">Other income </dt>
            <dd className="tnum inline text-foreground">
              {lakh(earnings.otherIncomeLakh)} lakh, {earnings.otherShareOfPbtPct.toFixed(0)}%
            </dd>
          </span>
          <span>Printed pages {earnings.pages.join(" and ")}</span>
        </dl>
      </div>

      <div className="mt-5 flex gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <p>
          Other income is{" "}
          <span className="tnum text-foreground">
            {earnings.otherOverOperating?.toFixed(2) ?? "not comparable"}
          </span>{" "}
          times what the operations produced before tax, against{" "}
          <span className="tnum text-foreground">{lakh(earnings.otherIncomeLakhPrior)}</span> lakh
          the year before. The operating result is thin against earnings before interest, tax and
          depreciation of <span className="tnum text-foreground">{lakh(earnings.ebitdaLakh)}</span>{" "}
          because depreciation took{" "}
          <span className="tnum text-foreground">{lakh(earnings.depreciationLakh)}</span>, which is
          what a year of buying accelerators looks like once it reaches the income statement. What
          the other income is, the report does not say, and it is not guessed at here.
        </p>
      </div>
    </div>
  );
}
