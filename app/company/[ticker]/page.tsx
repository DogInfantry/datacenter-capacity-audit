import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sisl, universe } from "@/lib/data";
import { CapacityVsReturns } from "@/components/CapacityVsReturns";
import { Exhibit, Estate, RevenuePerMW } from "@/components/Exhibits";
import { ClientConcentration } from "@/components/ClientConcentration";
import { SiteMap } from "@/components/SiteMap";
import { Pictogram, StatTile, Monogram, type IconName } from "@/components/Visual";

/**
 * Company deep-dives.
 *
 * Only Sify has one today, because it is the only name in the universe read from
 * a filed document rather than a research note. Anant Raj and Netweb get pages
 * when their data is seeded. Until then the route refuses rather than rendering
 * a shell, so a reader never meets a page that looks finished and is not.
 */
const COVERED = ["SIFY"] as const;

export function generateStaticParams() {
  return COVERED.map((ticker) => ({ ticker }));
}

export async function generateMetadata({
  params,
}: PageProps<"/company/[ticker]">): Promise<Metadata> {
  const { ticker } = await params;
  const row = universe.operators.find((o) => o.ticker === ticker);
  return { title: row ? row.listedParent : "Company", description: row?.note };
}

export default async function CompanyPage({ params }: PageProps<"/company/[ticker]">) {
  const { ticker } = await params;
  if (!COVERED.includes(ticker as (typeof COVERED)[number])) notFound();

  const row = universe.operators.find((o) => o.ticker === ticker)!;

  const full = sisl.periods.filter((p) => !p.stub);
  const first = full[0];
  const fy25 = full[full.length - 1];
  const stub = sisl.periods.find((p) => p.stub)!;
  const cost25 = sisl.costStack.find((c) => c.label === fy25.label)!;

  const powerShare = (cost25.power / fy25.revenue) * 100;
  const labourShare = (cost25.employee / fy25.revenue) * 100;
  const soldShare = (fy25.operationalMW / fy25.builtMW) * 100;
  const defsApart = Math.abs(
    sisl.capacityDefinitions.availableToSell.page -
      sisl.capacityDefinitions.engineeredToSupport.page,
  );

  const clientsLatest = sisl.clients[0];
  const clientsFirst = sisl.clients[sisl.clients.length - 1];
  const top3 = clientsLatest.rows.filter((r) => r.rank <= 3).reduce((t, r) => t + r.share, 0);
  const longContractShare = Object.fromEntries(
    sisl.contracts.map((c) => [c.label, c.longContractRevenueShare]),
  );

  const rail: {
    icon: IconName;
    k: string;
    v: string;
    u: string;
    tone?: "accent" | "signal" | "muted";
  }[] = [
    {
      icon: "capital",
      k: "Revenue",
      v: fy25.revenue.toLocaleString("en-IN"),
      u: `Rs mn, ${fy25.label}`,
    },
    {
      icon: "power",
      k: "EBITDA margin",
      v: `${fy25.ebitdaMargin}%`,
      u: `from ${first.ebitdaMargin}% in ${first.label}`,
    },
    {
      icon: "warning",
      k: "ROCE",
      v: `${fy25.roce}%`,
      u: `from ${first.roce}% in ${first.label}`,
      tone: "signal",
    },
    {
      icon: "grid",
      k: "Net debt / EBITDA",
      v: `${fy25.netDebtToEbitda}x`,
      u: `Rs ${fy25.netDebt.toLocaleString("en-IN")} mn`,
    },
    { icon: "datacentre", k: "Built capacity", v: `${fy25.builtMW}`, u: "MW, engineered" },
    { icon: "contract", k: "Sold capacity", v: `${fy25.operationalMW}`, u: "MW, earning" },
  ];

  const argument: [string, string][] = [
    [
      "Three customers are two thirds of the revenue.",
      `Clients 1, 2 and 3 are Hyperscalers in every period and together are ${top3.toFixed(2)}% of revenue. Client 1 alone went from ${clientsFirst.rows[0].share}% to ${clientsLatest.rows[0].share}%. The AI buildout, here, is one customer getting larger.`,
    ],
    [
      "The contract security and the concentration are the same three names.",
      `Printed page ${sisl.contractsSource.page} reports ${longContractShare[clientsLatest.label].toFixed(2)}% of revenue on contracts of at least seven years and calls it durability. That is the same number, to the decimal, in all four periods. The document never joins the two tables.`,
    ],
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
        <div className="flex items-center gap-3">
          <Monogram name={row.listedParent} size={34} />
          <div>
            <p className="sc text-accent">
              {row.listedParent} · {row.exchange} {row.ticker}
            </p>
            <p className="text-xs text-muted">
              Draft red herring prospectus, {sisl.periodsSource.asOf} · sourcing{" "}
              {row.source.verification.toLowerCase()}
            </p>
          </div>
        </div>

        <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
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
              The prospectus carries no price band, so there is no target price here and no rating.{" "}
              <Link
                href="/offer"
                className="underline decoration-line underline-offset-4 hover:text-accent"
              >
                The anatomy of the offer is its own page
              </Link>
              .
            </p>
          </div>

          <div className="grid grid-cols-2 gap-px self-start overflow-hidden rounded-md border border-line bg-line lg:grid-cols-1">
            {rail.map((r) => (
              <StatTile key={r.k} icon={r.icon} label={r.k} value={r.v} note={r.u} tone={r.tone} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6 border-t border-line py-12">
        <Exhibit
          n={1}
          title="The contract book the prospectus calls durable is three Hyperscalers"
          units="Share of revenue from operations, per cent. Four periods, most recent first."
          source={sisl.clientsSource.label}
          page={sisl.clientsSource.page}
        >
          <ClientConcentration
            periods={sisl.clients}
            longContractShare={longContractShare}
            page={sisl.clientsSource.page}
            contractPage={sisl.contractsSource.page}
          />
        </Exhibit>

        <Exhibit
          n={2}
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

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Exhibit
            n={3}
            title="Six cities, and most of what earns sits in two states"
            units="Bubble area is built MW. The inner disc is the share sold. Equirectangular projection, no border drawn."
            source={sisl.sitesSource.label}
            page={sisl.sitesSource.page}
          >
            <SiteMap sites={sisl.sites} />
          </Exhibit>

          <Exhibit
            n={4}
            title="Sixty megawatts in every hundred earn anything"
            units={`Built capacity converted to sold, ${fy25.label}. Each square is one per cent of ${fy25.builtMW} MW.`}
            source="Sify Infinit Spaces DRHP, capacity by data centre."
            page={sisl.sitesSource.page}
          >
            <Pictogram
              filledPct={soldShare}
              filledLabel="sold to customers"
              emptyLabel="engineered, not earning"
              columns={10}
            />
            <p className="mt-4 border-t border-line pt-3 text-sm leading-relaxed text-muted">
              The industry counts national supply in the same word. India&apos;s forecast of 4.7 to
              5.7 GW by Fiscal 2030 is stated as built capacity, and on the one estate where the
              conversion can be measured from a filing it runs at{" "}
              <span className="tnum text-foreground">{soldShare.toFixed(0)}</span> per cent.
            </p>
          </Exhibit>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Exhibit
            n={5}
            title="Two towers hold a quarter of the estate and sell almost none of it"
            units={`Megawatts by data centre, as at ${sisl.sitesAsOf}. Bars nest: sold inside commissioned inside engineered.`}
            source={sisl.sitesSource.label}
            page={sisl.sitesSource.page}
          >
            <Estate sites={sisl.sites} />
          </Exhibit>

          <Exhibit
            n={6}
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
        <p className="sc text-accent">Cost base and what is still open</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[
            {
              h: "Power is the cost base",
              b: `Power runs ${powerShare.toFixed(1)} per cent of revenue against labour at ${labourShare.toFixed(1)}. Contracts escalate ${sisl.escalatorMinPct} to ${sisl.escalatorMaxPct} per cent a year, with limited rights to reprice mid-term.`,
            },
            {
              h: "Read and cited",
              b: "Ten printed pages of the prospectus: the KPI block, the peer comparison, the client table, the capacity table printed twice, the expense notes, the contract and leased land risk factors, and management's own discussion.",
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
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Every figure is read from the Sify Infinit Spaces draft red herring prospectus dated{" "}
        {sisl.periodsSource.asOf} and cited by its printed page. Restated consolidated basis, amounts
        in Indian Rupees millions. The document carries no price band, so nothing here is a valuation
        or a recommendation. Educational and portfolio work, not investment advice.
      </footer>
    </div>
  );
}
