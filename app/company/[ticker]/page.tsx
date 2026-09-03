import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  sisl,
  sify,
  prospectus,
  macro,
  universe,
  anantRaj,
  netweb,
  COVERED_TICKERS,
  ladder,
} from "@/lib/data";
import { citedPages } from "@/lib/diagnostics/sourcing";
import { subsidiaryAgainstSegment } from "@/lib/diagnostics/reconcile";
import { sifyCo } from "@/lib/data";
import { CapacityVsReturns } from "@/components/CapacityVsReturns";
import { CapacityStep } from "@/components/CapacityStep";
import { Exhibit, Estate, RevenuePerMW } from "@/components/Exhibits";
import { ClientConcentration } from "@/components/ClientConcentration";
import {
  concentrationPages,
  concentrationTie,
  longContractShare,
} from "@/lib/diagnostics/concentration";
import { SiteMap } from "@/components/SiteMap";
import { RiskMatrix } from "@/components/RiskMatrix";
import { CapexVsCfo } from "@/components/CapexVsCfo";
import { sifyRiskMeasures } from "@/lib/diagnostics/risk";
import { sislReadings } from "@/lib/diagnostics/cashQuality";
import {
  associateExposure,
  disclosureReach,
  materialityThreshold,
} from "@/lib/diagnostics/governance";
import { AssociateExposure } from "@/components/AssociateExposure";
import { CashConversion } from "@/components/CashConversion";
import { RoceCheck } from "@/components/RoceCheck";
import { issuerCapexCover, roceReconciliation } from "@/lib/diagnostics/capital";
import { Pictogram, StatTile, type IconName } from "@/components/Visual";
import { Logo } from "@/components/Logo";
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
        sifyCover={{
          multiple: issuerCapexCover(sisl.cashFlow).multiple,
          periods: issuerCapexCover(sisl.cashFlow).periods.length,
        }}
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
  // The commissioning record as management described it on its own calls, which
  // is a different source from the prospectus the rest of this page reads.
  const said = ladder(sify).filter((o) => o.commissioned_mw);
  const saidFirst = said[0];
  const saidLast = said[said.length - 1];
  const saidYears =
    (Date.parse(saidLast.date) - Date.parse(saidFirst.date)) / (365.25 * 86_400_000);
  const missed = sify.claims.filter((c) => c.status === "MISSED");
  // Cash conversion, one reading per filed period. The same readings back the
  // arm against parent exhibit on /pillars, so they are built in one place.
  const cashReadings = sislReadings(sisl);
  const conv = cashReadings.map((r) => r.metrics[0].value!);
  // The bar this issuer set for telling anyone about a dispute, computed from
  // its own statements because the document publishes the formula and never
  // the number.
  // The subsidiary's own accounts against the segment its parent reports for
  // the same business, which this project used as a stand in for years
  // without testing whether the substitution held.
  const seg = subsidiaryAgainstSegment(sisl.periods, sifyCo.segments);
  const bar = materialityThreshold(sisl);
  const reach = disclosureReach(sisl);
  const assoc = associateExposure(sisl);
  const accrualPeak = cashReadings.reduce((a, r) =>
    Math.abs(r.metrics[1].value!) > Math.abs(a.metrics[1].value!) ? r : a,
  );
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
  // Both the exhibit and the guard need this, so it is built in one place.
  const contractShare = longContractShare(sisl);
  const tie = concentrationTie(sisl);
  const tiePages = concentrationPages(sisl);

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
      `Printed page ${sisl.contractsSource.page} reports ${contractShare[clientsLatest.label].toFixed(2)}% of revenue on contracts of at least seven years and calls it durability. The audited note on printed page ${tiePages.audited} reports the same revenue as an amount. All three agree in all four periods, and the document joins no two of them.`,
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
          <Logo ticker={row.ticker} name={row.listedParent} size="lg" tone="var(--accent-deep)" />
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
          title="The contract book the prospectus calls durable is three Hyperscalers, and the audited note agrees"
          units="Share of revenue from operations, per cent. Four periods, most recent first. Three sections of the filing describe these same counterparties and the document joins none of them."
          source={`${sisl.clientsSource.label} ${sisl.majorCustomerSource.label}`}
          page={sisl.clientsSource.page}
        >
          <ClientConcentration
            periods={sisl.clients}
            tie={tie}
            page={tiePages.clients}
            contractPage={tiePages.longContract}
            auditedPage={tiePages.audited}
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

        <Exhibit
          n={3}
          title={`Management put commissioned capacity at ${saidLast.commissioned_mw} MW after ${saidYears.toFixed(1)} years of answering the question, and ${missed.length} dated promises came due unmet`}
          units="Megawatts commissioned, taken from management's own answers on earnings calls rather than from the prospectus. Stepped rather than smoothed, because capacity arrives in lumps and a straight line between two quarters would draw megawatts that were never live. The dates promises were made are marked on the axis; their targets are not drawn as levels, because the verbatim claims do not say whether the figure is incremental or absolute."
          source={sify.source.label}
        >
          <CapacityStep data={sify} />

          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Across <span className="tnum text-foreground">{said.length}</span> calls between{" "}
            {saidFirst.date} and {saidLast.date}, commissioned capacity moved from{" "}
            <span className="tnum text-foreground">{saidFirst.commissioned_mw}</span> MW to{" "}
            <span className="tnum text-foreground">{saidLast.commissioned_mw}</span> MW. The flat
            stretches are the finding, so nothing here softens them.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            This is the same estate the rest of the page reads out of the prospectus, described in
            different words. On the call the figure is what has been commissioned. In the filed
            document the widest number is built capacity, and it is{" "}
            <span className="tnum text-foreground">{fy25.builtMW}</span> MW. The promises marked
            here carry the date they were made rather than a verdict, because that is what the
            record supports.
          </p>
        </Exhibit>

        <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
          <Exhibit
            n={4}
            title="Six cities, and most of what earns sits in two states"
            units="Bubble area is built MW. The inner disc is the share sold. Equirectangular projection, no border drawn."
            source={sisl.sitesSource.label}
            page={sisl.sitesSource.page}
          >
            <SiteMap sites={sisl.sites} />
          </Exhibit>

          <Exhibit
            n={5}
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
            n={6}
            title="Two towers hold a quarter of the estate and sell almost none of it"
            units={`Megawatts by data centre, as at ${sisl.sitesAsOf}. Bars nest: sold inside commissioned inside engineered.`}
            source={sisl.sitesSource.label}
            page={sisl.sitesSource.page}
          >
            <Estate sites={sisl.sites} />
          </Exhibit>

          <Exhibit
            n={7}
            title="The same megawatts earn far more elsewhere, and lose money doing it"
            units="Revenue per MW, Rs millions, across the issuer's own chosen peer set."
            source={sisl.peersSource.label}
            page={sisl.peersSource.page}
          >
            <RevenuePerMW peers={sisl.peers} />
          </Exhibit>
        </div>

        <Exhibit
          n={8}
          title="Every risk in the worst cell is one the filing already puts a number on"
          units="Severity against likelihood, an analyst grading rather than the issuer's. A chip is filled where the magnitude beside the row is derived from the filed numbers and outlined where the row is judgement."
          source={`Sify Infinit Spaces DRHP, risk factors and the restated financial information, printed pages ${riskPages.join(", ")}.`}
        >
          <RiskMatrix register={sisl.risks} measures={riskMeasures} />
        </Exhibit>

        <Exhibit
          n={9}
          title={`Only ${cover.covered[0].fy} paid for its own construction, and it is the last full year before the offer`}
          units="Rupees crore, restated consolidated, as filed. Capital expenditure is the purchase of property, plant and equipment. Land and lease payments are reported separately in the same statement and are excluded here rather than folded in, which would enlarge the gap. The stub quarter is not annualised and is compared against its own quarter of cash."
          source={sisl.cashFlowSource.label}
          page={sisl.cashFlowSource.page}
        >
          <CapexVsCfo
            rows={sisl.cashFlow.map((r) => ({
              label: r.label,
              cfo: cr(r.cfo),
              capex: cr(r.capex),
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
          n={10}
          title={`Every filed period turns profit into at least ${Math.min(...conv).toFixed(1)} times as much operating cash, and the accrual ratio still peaks at ${accrualPeak.metrics[1].value!.toFixed(0)} per cent`}
          units="Two measures of one idea, one row per filed period. Rupees millions behind them, restated and as filed. The thresholds are the ones published on the methodology page, applied here from the same file that publishes them. The stub quarter is compared against its own quarter of cash rather than annualised."
          source={`${sisl.cashFlowSource.label} Total assets from the restated statement of assets and liabilities at printed page ${sisl.balanceSheetSource.page}.`}
          page={sisl.cashFlowSource.page}
        >
          <CashConversion readings={cashReadings} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            On the first measure this issuer is the opposite of a cash conversion problem. Profit
            after tax turns into between{" "}
            <span className="tnum text-foreground">{Math.min(...conv).toFixed(2)}</span> and{" "}
            <span className="tnum text-foreground">{Math.max(...conv).toFixed(2)}</span> times as
            much operating cash across the filed periods, which is what a business with heavy
            depreciation and customers on contract looks like.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The second measure is the one to read carefully, and it is why both are shown. Its
            numerator adds investing cash back in, so on an operator part way through building an
            estate it moves with the size of the build rather than with the quality of the
            earnings. It sits at{" "}
            <span className="tnum text-foreground">
              {accrualPeak.metrics[1].value!.toFixed(1)}
            </span>{" "}
            per cent in {accrualPeak.period}, near the threshold, and falls away in the year capital
            spending fell. Nothing about the earnings changed between those readings. The spending
            did.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The basis beside each period is the document&apos;s own. All four columns sit under a
            heading that reads restated consolidated, and the column header printed above them says
            consolidated for the two most recent and standalone for the two older ones. The series
            still holds, because the associate contributed{" "}
            <span className="tnum text-foreground">
              {sisl.periods.filter((p) => p.basis === "STANDALONE").reduce((t, p) => t + Math.abs(p.associateShareOfProfit), 0)}
            </span>{" "}
            in the standalone years, so a consolidated statement for those years would have been the
            same statement. Where it does register is the stub, whose share of the associate&apos;s
            loss is{" "}
            <span className="tnum text-foreground">
              {((Math.abs(stub.associateShareOfProfit) / stub.pat) * 100).toFixed(1)}
            </span>{" "}
            per cent of the profit reported for that quarter.
          </p>
        </Exhibit>

        <Exhibit
          n={11}
          title={`A dispute has to reach ${bar.threshold.toFixed(0)} million rupees before it must be disclosed, and the smallest of three tests sets that`}
          units={`Rupees millions. The policy takes the lower of three tests over figures from ${bar.period}, and the document publishes the formula rather than the figure, so each row is computed from the issuer's own restated statements. The profit test averages the three years ${bar.window.join(", ")}.`}
          source={`${sisl.governance.materiality.source.label}, adopted by board resolution dated ${sisl.governance.materiality.adoptedOn}, two days before the document itself is dated.`}
          page={bar.page}
        >
          <ul className="space-y-2.5">
            {bar.tests.map((t) => (
              <li key={t.basis}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
                  <span className={t.binding ? "text-foreground" : "text-muted"}>{t.label}</span>
                  <span className="tnum text-muted">
                    {t.value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    {t.binding && <span className="ml-2 text-signal">binds</span>}
                  </span>
                </div>
                <div className="mt-1.5 h-5 w-full rounded-sm bg-grid">
                  <div
                    className="h-5 rounded-sm"
                    style={{
                      width: `${(t.value / Math.max(...bar.tests.map((x) => x.value))) * 100}%`,
                      background: t.binding ? "var(--signal)" : "var(--rung-1)",
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>

          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The policy takes the lowest of the three, so the bar is{" "}
            <span className="tnum text-signal">{bar.threshold.toFixed(2)}</span> million rupees,{" "}
            <span className="tnum text-foreground">{bar.shareOfRevenuePct.toFixed(2)}</span> per
            cent of a year&apos;s revenue, and the next test up sits{" "}
            <span className="tnum text-foreground">
              {(bar.nextUp / bar.threshold).toFixed(1)}
            </span>{" "}
            times higher. Taking the lowest is the inclusive choice and it is worth saying so: a net
            worth test alone would have set the bar at{" "}
            <span className="tnum text-foreground">
              {bar.tests.find((t) => t.basis === "NET_WORTH")!.value.toFixed(0)}
            </span>
            . It also means the bar moves with earnings rather than with the size of the company, so
            a more profitable year raises it.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Against that bar, the largest matter carrying a number is{" "}
            <span className="tnum text-foreground">
              {reach.largest.amountMn.toLocaleString("en-IN")}
            </span>{" "}
            million,{" "}
            <span className="tnum text-foreground">{reach.largestOverThreshold.toFixed(0)}</span>{" "}
            times the threshold. The more interesting entries carry no number at all.
          </p>

          <div className="mt-5 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
            {reach.unserved.map((u) => (
              <div key={u.matter} className="bg-card p-4">
                <p className="flex items-baseline gap-2">
                  <span className="font-display text-2xl tnum">{u.count}</span>
                  <span className="text-xs text-muted">found via {u.foundVia}</span>
                </p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{u.matter}</p>
                <p className="mt-2 text-xs leading-relaxed text-foreground">
                  &ldquo;{u.quote}&rdquo;
                </p>
                <p className="mt-1 text-[11px] text-muted">
                  Printed page <span className="tnum">{u.page}</span>
                </p>
              </div>
            ))}
          </div>

          <p className="mt-5 text-sm leading-relaxed text-muted">
            <span className="tnum text-foreground">{reach.unservedCount}</span> proceedings reached
            this issuer through a public database rather than through service, in its own words on
            both counts. Twenty of them carry no amount, because the grounds and the quantum are not
            available to a party nobody has served. So the largest number in the legal section is
            the largest number that could be written down, which is a different thing from the
            largest exposure in it.
          </p>
        </Exhibit>

        <Exhibit
          n={12}
          title={`Two filings measure the same business and differ by the same ${seg.meanGap.toFixed(0)} million every year`}
          units={`Rupees millions. The subsidiary's own revenue from its prospectus against the data centre segment its parent reports in its 20-F, for the ${seg.rows.length} years both cover. The 20-F prints absolute rupees and the prospectus prints millions, a change of scale inside one currency, and no rate is applied anywhere because there is none to apply.`}
          source={`Sify Infinit Spaces DRHP, restated statement of profit and loss at printed page ${sisl.periodsSource.page}, against the data centre segment reported by Sify Technologies in its annual report on Form 20-F, held in the harvested filings.`}
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[30rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-line text-left text-[11px] uppercase tracking-wider text-muted">
                  <th className="py-2 pr-4 font-normal">Year</th>
                  <th className="py-2 pr-4 text-right font-normal">Subsidiary, own accounts</th>
                  <th className="py-2 pr-4 text-right font-normal">Parent, data centre segment</th>
                  <th className="py-2 text-right font-normal">Gap</th>
                </tr>
              </thead>
              <tbody>
                {seg.rows.map((r) => (
                  <tr key={r.fy} className="border-b border-line">
                    <td className="py-2.5 pr-4">
                      {r.fy}
                      <span className="ml-2 text-[11px] text-muted">
                        {r.basis === "CONSOLIDATED" ? "consolidated" : "standalone"}
                      </span>
                    </td>
                    <td className="py-2.5 pr-4 text-right tnum">
                      {r.subsidiary.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 pr-4 text-right tnum text-muted">
                      {r.segment.toLocaleString("en-IN", { maximumFractionDigits: 2 })}
                    </td>
                    <td className="py-2.5 text-right tnum text-signal">{r.gap.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Across these years the subsidiary&apos;s revenue grows{" "}
            <span className="tnum text-foreground">
              {(((seg.rows[seg.rows.length - 1].subsidiary - seg.rows[0].subsidiary) / seg.rows[0].subsidiary) * 100).toFixed(0)}
            </span>{" "}
            per cent and the gap moves by{" "}
            <span className="tnum text-foreground">{seg.spread.toFixed(2)}</span> million. A
            difference that holds its size while the business it sits inside grows by two fifths is
            a fixed item on one side of a boundary, not a measurement drifting from another.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            It also survives the change of reporting basis. Two of these years are the subsidiary
            standalone and one is consolidated, and the gap does not notice, which is the second
            thing suggesting it belongs to the definition of the segment rather than to the
            perimeter of the company.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Neither document cites the other and neither reconciles the two, so what the item is
            cannot be named from either of them. What can be said is that the parent&apos;s segment
            and the subsidiary&apos;s accounts are not the same measurement, and anyone treating one
            as a stand in for the other is out by a fixed amount in every year they overlap.
          </p>
        </Exhibit>

        <Exhibit
          n={13}
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

        <Exhibit
          n={14}
          title={`The associate is ${assoc.latest.onSheetShareOfNetWorthPct.toFixed(0)} per cent of net worth on the balance sheet and ${assoc.latest.withGuaranteeShareOfNetWorthPct.toFixed(0)} per cent with the guarantee, and it returned a loss of ${Math.abs(assoc.shareOfProfit[assoc.shareOfProfit.length - 1].amount).toFixed(2)}`}
          units={`Amounts owed by and committed to ${assoc.name}, the ${assoc.ownershipPct} per cent associate, against the issuer's own net worth at the same date. Rupees millions. A loan, a preference share subscription and a security deposit are on the balance sheet. The corporate guarantee is not, and is drawn separately.`}
          source={sisl.governance.associate.source.label}
          page={assoc.page}
        >
          <AssociateExposure data={assoc} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            This company already appears twice in this analysis, once as the reason four columns of
            accounts can be read as one series. The statements are titled consolidated throughout
            and two of the four periods are standalone, and what keeps them comparable is that the
            associate contributed exactly nothing to profit in those two years. That is true and it
            is asserted as a build guard. Read alone it invites the conclusion that the associate
            does not matter.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The related party note says what else it is. At{" "}
            <span className="text-foreground">{assoc.latest.asOf}</span> the issuer was owed{" "}
            <span className="tnum text-foreground">
              {assoc.latest.loanReceivableMn.toLocaleString("en-US")}
            </span>{" "}
            on loan, held{" "}
            <span className="tnum text-foreground">
              {assoc.latest.preferenceSharesMn.toLocaleString("en-US")}
            </span>{" "}
            of its preference shares and had{" "}
            <span className="tnum text-foreground">
              {assoc.latest.securityDepositMn.toLocaleString("en-US")}
            </span>{" "}
            out as a security deposit, and had guaranteed{" "}
            <span className="tnum text-foreground">
              {assoc.latest.guaranteeGivenMn.toLocaleString("en-US")}
            </span>{" "}
            more off the balance sheet. What that capital returned in the same period was{" "}
            <span className="tnum text-foreground">
              {assoc.shareOfProfit[assoc.shareOfProfit.length - 1].amount.toFixed(2)}
            </span>
            , a loss. Immaterial to the income statement and{" "}
            <span className="tnum text-foreground">
              {assoc.latest.onSheetShareOfNetWorthPct.toFixed(1)}
            </span>{" "}
            per cent of net worth are not in conflict. They are two different questions, and the
            document answers them in two sections that never refer to each other.
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
              b: `${citedPages(sisl, prospectus, macro).length} printed pages of the prospectus: the KPI block, the peer comparison, the client table, the capacity table printed twice, the expense notes, the statement of cash flow, the contract and leased land risk factors, and management's own discussion.`,
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
