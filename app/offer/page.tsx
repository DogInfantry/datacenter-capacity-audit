import type { Metadata } from "next";
import { prospectus, sisl, baseRate } from "@/lib/data";
import {
  useOfProceeds,
  fundingGapByObject,
  netDebtBridge,
  deploymentByYear,
  GCP_CAP_PCT,
} from "@/lib/diagnostics/offer";
import { Exhibit } from "@/components/Exhibits";
import { UseOfProceeds, FundingGap, NetDebtBridge } from "@/components/OfferAnatomy";
import { ScheduleVsSlip } from "@/components/ScheduleVsSlip";
import { StatTile, type IconName } from "@/components/Visual";

export const metadata: Metadata = {
  title: "Anatomy of the offer",
  description:
    "Where the Sify Infinit Spaces offer money comes from, where it goes, and what it leaves behind on the balance sheet.",
};

const mn = (v: number) => v.toLocaleString("en-IN", { maximumFractionDigits: 0 });

export default function OfferPage() {
  const rows = prospectus.objects.rows;
  const flow = useOfProceeds(prospectus.offer, rows);
  const gap = fundingGapByObject(rows);
  const stub = sisl.periods.find((p) => p.stub)!;
  const bridge = netDebtBridge(rows, stub.netDebt);
  const years = deploymentByYear(rows);

  const sources = [
    { key: "fresh", label: "Fresh issue", value: flow.freshIssue, fill: "var(--accent)", note: "" },
    {
      key: "ofs",
      label: "Offer for sale",
      value: flow.offerForSale,
      fill: "var(--signal)",
      note: "",
    },
  ];

  const uses = [
    ...rows.map((r) => ({
      key: "fresh",
      label: r.object,
      value: r.fromNetProceeds,
      fill: "var(--accent)",
      note: `${mn(r.fromNetProceeds)} million of net proceeds against a total estimated cost of ${mn(r.totalEstimatedCost)} million.`,
    })),
    {
      key: "fresh",
      label: "Unallocated",
      value: flow.unallocated,
      fill: "var(--rung-1)",
      note: `${mn(flow.unallocated)} million, or ${flow.unallocatedShare.toFixed(1)} per cent of the fresh issue, is not tied to a named object. SEBI caps general corporate purposes at ${GCP_CAP_PCT} per cent of gross proceeds, so this sits ${flow.headroomToCap.toFixed(1)} points under the ceiling.`,
    },
    {
      key: "ofs",
      label: "Selling shareholders",
      value: flow.offerForSale,
      fill: "var(--signal)",
      note: `${mn(flow.offerForSale)} million, or ${flow.offerForSaleShare.toFixed(1)} per cent of the total offer, goes to the two Kotak funds selling down. The company receives none of it and it funds no project on this page.`,
    },
  ];

  const tiles: { icon: IconName; k: string; v: string; u: string; n: string; tone?: "signal" }[] = [
    {
      icon: "capital",
      k: "Total offer",
      v: mn(flow.total),
      u: "Rs mn",
      n: `${mn(flow.freshIssue)} fresh issue and ${mn(flow.offerForSale)} offer for sale.`,
    },
    {
      icon: "warning",
      k: "Never reaches the company",
      v: `${flow.offerForSaleShare.toFixed(0)}%`,
      u: "of the offer",
      n: "The offer for sale is the two Kotak funds selling down, not capital for the business.",
      tone: "signal",
    },
    {
      icon: "contract",
      k: "Unallocated",
      v: `${flow.unallocatedShare.toFixed(1)}%`,
      u: "of fresh issue",
      n: `Not tied to a named object, against a statutory ceiling of ${GCP_CAP_PCT} per cent.`,
      tone: "signal",
    },
    {
      icon: "grid",
      k: "Net debt reduction",
      v: `${bridge.reductionPct.toFixed(1)}%`,
      u: "after the offer",
      n: `${mn(bridge.repaid)} repaid against ${mn(bridge.borrowed)} of new borrowings in the same table.`,
      tone: "signal",
    },
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-5">
      <section className="py-12 sm:py-16">
        <p className="sc text-accent">
          Sify Infinit Spaces · The offer · Printed pages {prospectus.offer.page} and{" "}
          {prospectus.objects.page}
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          A third never reaches the company.
          <br />
          The debt repayment is re-borrowed.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          The prospectus states the offer on printed page {prospectus.offer.page} and the objects on
          printed page {prospectus.objects.page}. The arithmetic between those two pages is never
          performed in the document. Performed here, it changes what the raise is for.
        </p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <StatTile
              key={t.k}
              icon={t.icon}
              label={t.k}
              value={t.v}
              unit={t.u}
              note={t.n}
              tone={t.tone}
            />
          ))}
        </dl>
      </section>

      <section className="space-y-6 border-t border-line py-12">
        <Exhibit
          n={1}
          title="Where the money comes from, and where it actually goes"
          units="Rs millions. Ribbon width is proportional to amount."
          source={prospectus.objects.source.label}
          page={prospectus.objects.page}
        >
          <UseOfProceeds sources={sources} uses={uses} />
        </Exhibit>

        <div className="grid gap-6 lg:grid-cols-2">
          <Exhibit
            n={2}
            title="The offer does not fund the projects it names"
            units="Total estimated cost against the split between net proceeds and new borrowings, Rs millions."
            source={prospectus.objects.source.label}
            page={prospectus.objects.page}
          >
            <FundingGap rows={gap} />
          </Exhibit>

          <Exhibit
            n={3}
            title={`Repaying ${mn(bridge.repaid)} million moves net debt by ${bridge.reductionPct.toFixed(1)} per cent`}
            units="Net debt bridge, Rs millions. Opening net debt as at the June 2025 quarter."
            source={`${prospectus.objects.source.label} Opening net debt from the key performance indicators, printed page ${sisl.periodsSource.page}.`}
            page={prospectus.objects.page}
          >
            <NetDebtBridge bridge={bridge} />
          </Exhibit>
        </div>

        <Exhibit
          n={4}
          title="Both construction objects run to Fiscal 2029 as stated"
          units={`Deployment schedule certified by ${prospectus.objects.certifiedBy}. The band is the observed slippage distribution for inter state transmission, not a construction forecast.`}
          source={prospectus.objects.source.label}
          page={prospectus.objects.page}
        >
          <ScheduleVsSlip
            rows={prospectus.objects.rows}
            base={baseRate}
            basisNote={prospectus.objects.scheduleBasisNote}
          />
        </Exhibit>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">What the schedule commits to</p>
        <div className="mt-6 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
          {years.map((y) => (
            <div key={y.year} className="bg-card p-5">
              <p className="exhibit-label">{y.year}</p>
              <p className="mt-2 font-display text-2xl tracking-tight tnum">{mn(y.total)}</p>
              <p className="mt-2 text-xs leading-relaxed text-muted">
                {y.byObject
                  .filter((o) => o.amount > 0)
                  .map((o) => `${o.object.split(",")[0]} ${mn(o.amount)}`)
                  .join(" · ") || "Nothing scheduled."}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted">
          The schedule is certified by the statutory auditor rather than offered as a management
          projection, which makes it a firmer claim than most forward looking disclosure and worth
          drawing exactly as stated.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Every figure on this page is read from the Sify Infinit Spaces draft red herring prospectus
        dated {prospectus.document.documentDate} and cited by its printed page. Amounts in Indian
        Rupees millions. The document carries no price band, so nothing here is a valuation or a
        recommendation. Educational and portfolio work, not investment advice.
      </footer>
    </div>
  );
}
