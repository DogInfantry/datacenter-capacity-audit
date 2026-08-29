import type { Metadata } from "next";
import Link from "next/link";
import { sisl } from "@/lib/data";
import { CapacityVsReturns } from "@/components/CapacityVsReturns";
import { Exhibit, Estate, RevenuePerMW } from "@/components/Exhibits";

export const metadata: Metadata = {
  title: "Built, Installed, Sold",
};

export default function Home() {
  const full = sisl.periods.filter((p) => !p.stub);
  const first = full[0];
  const fy25 = full[full.length - 1];
  const stub = sisl.periods.find((p) => p.stub)!;
  const cost25 = sisl.costStack.find((c) => c.label === fy25.label)!;

  const powerShare = (cost25.power / fy25.revenue) * 100;
  const labourShare = (cost25.employee / fy25.revenue) * 100;
  const defsApart = Math.abs(
    sisl.capacityDefinitions.availableToSell.page -
      sisl.capacityDefinitions.engineeredToSupport.page,
  );

  const rail = [
    { k: "Revenue", v: fy25.revenue.toLocaleString("en-IN"), u: `Rs mn, ${fy25.label}` },
    {
      k: "EBITDA margin",
      v: `${fy25.ebitdaMargin}%`,
      u: `from ${first.ebitdaMargin}% in ${first.label}`,
    },
    { k: "ROCE", v: `${fy25.roce}%`, u: `from ${first.roce}% in ${first.label}` },
    {
      k: "Net debt / EBITDA",
      v: `${fy25.netDebtToEbitda}x`,
      u: `Rs ${fy25.netDebt.toLocaleString("en-IN")} mn`,
    },
    { k: "Built capacity", v: `${fy25.builtMW}`, u: "MW, engineered" },
    { k: "Sold capacity", v: `${fy25.operationalMW}`, u: "MW, earning revenue" },
  ];

  const argument: [string, string][] = [
    [
      "Returns fell while the estate doubled.",
      `Built capacity went from ${first.builtMW} MW to ${fy25.builtMW}. Return on capital went from ${first.roce}% to ${fy25.roce}%.`,
    ],
    [
      "The damage is below the operating line.",
      `EBITDA margin rose from ${first.ebitdaMargin}% to ${fy25.ebitdaMargin}% over the same years, then net margin fell to ${stub.patMargin}% in the stub quarter. Everything between the two is depreciation and interest.`,
    ],
    [
      `Interest is being capitalised at ${sisl.capitalisationRate}%.`,
      `Rs ${cost25.interestCapitalised.toLocaleString("en-IN")} mn of ${fy25.label} interest went to the balance sheet rather than the income statement. When a tower commissions that stops, and depreciation starts.`,
    ],
    [
      "The headline capacity figure is defined twice.",
      `The prospectus calls ${fy25.builtMW} MW "engineered to support" on one page and "available power capacity that can be sold to customers" on another, ${defsApart} printed pages apart.`,
    ],
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-5">
      <section className="py-12 sm:py-16">
        <p className="sc text-accent">
          Sify Infinit Spaces · Initiating · Draft red herring prospectus, 16 October 2025
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          Capacity was capitalised and financed faster than it was sold
        </h1>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="rounded-md border border-line bg-card p-6">
            <p className="exhibit-label">The argument</p>
            <ol className="mt-4 space-y-4">
              {argument.map(([h, b], i) => (
                <li key={h} className="flex gap-4">
                  <span className="exhibit-label mt-1 shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>
                    <span className="font-medium">{h}</span> <span className="text-muted">{b}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
              The prospectus carries no price band, so there is no target price here and no rating.
              What follows is the arithmetic and where it breaks.
            </p>
          </div>

          <dl className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-md border border-line bg-line lg:grid-cols-1">
            {rail.map((r) => (
              <div key={r.k} className="bg-card px-4 py-3">
                <dt className="text-[11px] text-muted">{r.k}</dt>
                <dd className="mt-0.5 font-display text-2xl tracking-tight tnum">{r.v}</dd>
                <p className="text-[11px] text-muted">{r.u}</p>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="space-y-6 border-t border-line py-12">
        <Exhibit
          n={1}
          title="Built capacity doubled. Return on capital fell."
          units={`Indexed, ${first.label} = 100. Full fiscal years only.`}
          source="Sify Infinit Spaces DRHP, key performance indicators and return on capital employed."
          page={sisl.periodsSource.page}
        >
          <CapacityVsReturns
            rows={full.map((p) => ({ label: p.label, builtMW: p.builtMW, roce: p.roce }))}
            page={sisl.periodsSource.page}
          />
        </Exhibit>

        <div className="grid gap-6 lg:grid-cols-2">
          <Exhibit
            n={2}
            title="Two towers hold a quarter of the estate and sell almost none of it"
            units={`Megawatts by data centre, as at ${sisl.sitesAsOf}. Bars nest: sold inside commissioned inside engineered.`}
            source={sisl.sitesSource.label}
            page={sisl.sitesSource.page}
          >
            <Estate sites={sisl.sites} />
          </Exhibit>

          <Exhibit
            n={3}
            title="The same megawatts earn far more elsewhere, and lose money doing it"
            units="Revenue per MW, Rs millions, across the issuer's own chosen peer set."
            source={sisl.peersSource.label}
            page={sisl.peersSource.page}
          >
            <RevenuePerMW peers={sisl.peers} />
          </Exhibit>
        </div>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">What this rests on, and what is still open</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              h: "Read and cited",
              b: "Nine printed pages of the prospectus: the KPI block, the peer comparison, the capacity table printed twice, the expense notes, the contract risk factor, the leased land risk factor, and management's own discussion of the year.",
            },
            {
              h: "Power is the cost base",
              b: `Power runs ${powerShare.toFixed(1)} per cent of revenue against labour at ${labourShare.toFixed(1)}. Contracts escalate ${sisl.escalatorMinPct} to ${sisl.escalatorMaxPct} per cent a year, with limited rights to reprice mid-term.`,
            },
            {
              h: "Still to build",
              b: "Balance sheet and cash flow, the revenue build and three year forecast, bull base and bear cases, two way sensitivity, implied valuation against peers, and the risk matrix.",
            },
          ].map((c) => (
            <div key={c.h} className="rounded-md border border-line bg-card p-5">
              <p className="font-display text-lg tracking-tight">{c.h}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{c.b}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          {[
            ["/prospectus", "Prospectus"],
            ["/financials", "Financials"],
            ["/disclosure", "Disclosure"],
            ["/grid", "Grid"],
            ["/method", "Method"],
          ].map(([href, label]) => (
            <Link
              key={href}
              href={href}
              className="underline decoration-line underline-offset-4 hover:text-accent"
            >
              {label}
            </Link>
          ))}
        </div>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Every figure is read from the Sify Infinit Spaces draft red herring prospectus dated 16
        October 2025 and cited by its printed page. Restated consolidated basis, amounts in Indian
        Rupees millions. The document carries no price band, so nothing here is a valuation or a
        recommendation. Educational and portfolio work, not investment advice.
      </footer>
    </div>
  );
}
