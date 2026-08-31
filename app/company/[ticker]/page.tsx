import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { sisl, prospectus, universe, anantRaj, netweb, COVERED_TICKERS } from "@/lib/data";
import { citedPages } from "@/lib/diagnostics/sourcing";
import { CapacityVsReturns } from "@/components/CapacityVsReturns";
import { Exhibit, Estate, RevenuePerMW } from "@/components/Exhibits";
import { ClientConcentration } from "@/components/ClientConcentration";
import { SiteMap } from "@/components/SiteMap";
import { RiskMatrix } from "@/components/RiskMatrix";
import { CapexVsCfo } from "@/components/CapexVsCfo";
import { sifyRiskMeasures } from "@/lib/diagnostics/risk";
import { RoceCheck } from "@/components/RoceCheck";
import { issuerCapexCover, roceReconciliation } from "@/lib/diagnostics/capital";
import { Pictogram, StatTile, Monogram, type IconName } from "@/components/Visual";
import { AnantRajBody } from "@/components/AnantRajBody";
import { NetwebBody } from "@/components/NetwebBody";

/**
 * Company deep-dives.
 *
 * Sify is read from a filed document. Anant Raj and Netweb are read from a
 * research note and say so on every figure. A ticker outside this list refuses
 * rather than rendering a shell, so a reader never meets a page that looks
 * finished and is not.
 *
 * Sify and Anant Raj are operators and carry megawatts. Netweb does not: it
 * builds the servers that go inside somebody else's estate, so it lives in the
 * universe watchlist rather than the operator table and is read on its order
 * book. Anything here that looks a company up has to handle both.
 *
 * The list itself lives in lib/data.ts, because the front page and the coverage
 * matrix need the same one and three copies of it would drift apart.
 */
const COVERED = COVERED_TICKERS;

export function generateStaticParams() {
  return COVERED.map((ticker) => ({ ticker }));
}

export async function generateMetadata({
  params,
}: PageProps<"/company/[ticker]">): Promise<Metadata> {
  const { ticker } = await params;
  // Operators first, then the watchlist, because Netweb carries no megawatts and
  // sits only in the second. Looking in one place returned an untitled page.
  const row =
    universe.operators.find((o) => o.ticker === ticker) ??
    universe.watchlist.find((w) => w.ticker === ticker);
  if (!row) return { title: "Company" };
  return {
    title: "listedParent" in row ? row.listedParent : row.name,
    description: row.note,
  };
}

export default async function CompanyPage({ params }: PageProps<"/company/[ticker]">) {
  const { ticker } = await params;
  if (!COVERED.includes(ticker as (typeof COVERED)[number])) notFound();

  if (ticker === "ANANTRAJ") {
    const stub = sisl.periods.find((p) => p.stub)!;
    return (
      <AnantRajBody
        data={anantRaj}
        sify={[
          { rung: "Built", mw: stub.builtMW },
          { rung: "Installed", mw: stub.installedMW },
          { rung: "Sold", mw: stub.operationalMW },
        ]}
      />
    );
  }

  if (ticker === "NETWEB") {
    // The comparison is Sify's client concentration, computed here from the
    // filed table rather than typed, the same way Anant Raj is handed Sify's
    // capacity rungs above.
    const latest = sisl.clients[0];
    return (
      <NetwebBody
        data={netweb}
        sify={{
          sharePct: latest.rows.filter((r) => r.rank <= 3).reduce((t, r) => t + r.share, 0),
          page: sisl.clientsSource.page,
        }}
      />
    );
  }

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

  const riskMeasures = sifyRiskMeasures(sisl);
  const cover = issuerCapexCover(sisl.cashFlow);
  const roce = roceReconciliation(sisl);
  const checkable = roce.filter((r) => r.checkable);
  const unchecked = roce.find((r) => !r.checkable)!;
  const exact = checkable.filter((r) => Math.abs(r.deltaWith ?? 1) < 0.005);
  const highest = [...roce].sort((a, b) => b.printed - a.printed)[0];
  const cr = (mn: number) => mn / 10;
  // FY2025 is the pivot the exhibit turns on, so the two rates beside it are
  // derived from the periods either side rather than written into the prose.
  const before = cover.periods[cover.periods.length - 3];
  const pivot = cover.periods[cover.periods.length - 2];
  // The pages the register rests on, derived from the rows rather than typed
  // into the source line, so a row added or moved cannot leave the citation
  // describing a set of pages the exhibit no longer uses.
  const riskPages = [...new Set(sisl.risks.rows.map((r) => r.page))]
    .filter((p): p is number => p !== null)
    .sort((a, b) => a - b);

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

        <Exhibit
          n={7}
          title="Every risk in the worst cell is one the filing already puts a number on"
          units="Severity against likelihood, graded by this project and not by the issuer. A chip is filled where the magnitude beside the row is derived from the filed numbers and outlined where the row is judgement."
          source={`Sify Infinit Spaces DRHP, risk factors and the restated financial information, printed pages ${riskPages.join(", ")}.`}
        >
          <RiskMatrix register={sisl.risks} measures={riskMeasures} />
        </Exhibit>

        <Exhibit
          n={8}
          title={`Only ${cover.covered[0].fy} paid for its own construction, and it is the last full year before the offer`}
          units="Rupees crore, restated consolidated, as filed. Capital expenditure is the purchase of property, plant and equipment. Land and lease payments are reported separately in the same statement and are excluded here rather than folded in, which would enlarge the gap. The stub quarter is not annualised and is compared against its own quarter of cash."
          source={sisl.cashFlowSource.label}
          page={sisl.cashFlowSource.page}
        >
          <CapexVsCfo
            rows={sisl.cashFlow.map((r) => ({
              label: r.label,
              cfoCr: cr(r.cfo),
              capexCr: cr(r.capex),
            }))}
            aria={`Operating cash flow against capital expenditure for ${cover.periods
              .map((p) => p.fy)
              .join(", ")}. Capex is the larger of the two in ${cover.outspent.length} of the ${
              cover.periods.length
            } filed periods.`}
            note="Consolidated figures as filed in the restated statement of cash flow, converted to crore for display only."
          />

          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Across the four filed periods the estate absorbed{" "}
            <span className="tnum text-foreground">
              {cr(cover.capex).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>{" "}
            crore against{" "}
            <span className="tnum text-foreground">
              {cr(cover.cfo).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>{" "}
            crore of cash from operations, so the building ran at{" "}
            <span className="tnum text-foreground">{cover.multiple.toFixed(2)}</span> times what the
            business produced and the difference,{" "}
            <span className="tnum text-foreground">
              {cr(cover.gap).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
            </span>{" "}
            crore, came from somewhere else.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The single covered period is not a change of habit. Capital expenditure fell{" "}
            <span className="tnum text-foreground">
              {((1 - pivot.capex / before.capex) * 100).toFixed(0)}
            </span>{" "}
            per cent in {pivot.fy} while operating cash rose{" "}
            <span className="tnum text-foreground">
              {((pivot.cfo / before.cfo - 1) * 100).toFixed(0)}
            </span>{" "}
            per cent, and the quarter that follows it is back to spending more than it earns. Capex
            leads commissioning by years, so a year of low spending is not a year of low building.
            It is a gap in the trail, and the offer is what fills it.
          </p>
        </Exhibit>

        <Exhibit
          n={9}
          title={`${exact.length} of the ${roce.length} published returns on capital rebuild exactly, and the one that cannot be checked is the highest`}
          units="Points of return on capital, measured from the figure the issuer published. The formula is the document's own. Zero means the rebuild landed on the published figure."
          source={`${sisl.roceFormulaSource.label} The inputs are the key performance indicators, the statement of cash flow and the balance sheet, at printed pages ${sisl.periodsSource.page}, ${sisl.cashFlowSource.page} and ${sisl.balanceSheetSource.page}.`}
          page={sisl.roceFormulaSource.page}
        >
          <RoceCheck rows={roce} />

          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The formula sits on printed page{" "}
            <span className="tnum text-foreground">{sisl.roceFormulaSource.page}</span>, inside the
            industry report the issuer commissioned. The figures sit in the business section, as the
            issuer&apos;s own achievement. The document never joins them, and joined they hold: every
            period that can be rebuilt lands on the published number to the second decimal.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            It only holds on one reading. Capital employed is defined as net worth plus total
            borrowings less cash, and the definition does not say whether lease liabilities are
            borrowings. Counted, the rebuild is exact. Left out, as the words alone would have it,
            every period comes out{" "}
            <span className="tnum text-foreground">
              {(
                checkable.reduce((t, r) => t + (r.deltaWithout ?? 0), 0) / checkable.length
              ).toFixed(2)}
            </span>{" "}
            points too high. The stricter reading is the one the issuer used, which flatters it less,
            and the document does not say so anywhere.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            <span className="text-foreground">{unchecked.label}</span> cannot be rebuilt at all. An
            average needs the capital employed of the year before it, and the balance sheet carries
            four columns. That period is also the highest of the four at{" "}
            <span className="tnum text-foreground">{highest.printed.toFixed(2)}</span> per cent, and
            it is half of what the claim to beating global peers rests on.
          </p>
        </Exhibit>
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
              b: `${citedPages(sisl, prospectus).length} printed pages of the prospectus: the KPI block, the peer comparison, the client table, the capacity table printed twice, the expense notes, the statement of cash flow, the contract and leased land risk factors, and management's own discussion.`,
            },
            {
              h: "Still to build",
              b: "Balance sheet and cash flow, the revenue build and three year forecast, bull base and bear cases, two way sensitivity, and an implied valuation against peers. The risk register is built and sits above, with the pillars it cannot evidence marked.",
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
