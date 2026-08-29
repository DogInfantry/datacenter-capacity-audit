import type { Metadata } from "next";
import Link from "next/link";
import { sisl } from "@/lib/data";
import { CapacityVsReturns } from "@/components/CapacityVsReturns";

export const metadata: Metadata = {
  title: "Built, Installed, Sold",
};

const pct = (n: number) => n.toFixed(1);

export default function Home() {
  const full = sisl.periods.filter((p) => !p.stub);
  const first = full[0];
  const fy25 = full[full.length - 1];
  const stub = sisl.periods.find((p) => p.stub)!;
  const cost25 = sisl.costStack.find((c) => c.label === fy25.label)!;

  const powerShare = (cost25.power / fy25.revenue) * 100;
  const headroom = (fy25.builtMW / fy25.operationalMW - 1) * 100;
  const defsApart = Math.abs(
    sisl.capacityDefinitions.availableToSell.page -
      sisl.capacityDefinitions.engineeredToSupport.page,
  );

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-5">
      <section className="py-16 sm:py-20">
        <p className="sc text-accent">
          Sify Infinit Spaces · Draft red herring prospectus, October 2025
        </p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          Built capacity doubled.
          <br />
          Return on capital fell.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          India&apos;s first data centre listing is a company that got better at operating and
          worse at earning. Between {first.label} and {fy25.label} it more than doubled the
          capacity it calls built, while return on capital dropped from{" "}
          <span className="tnum text-foreground">{first.roce}%</span> to{" "}
          <span className="tnum text-foreground">{fy25.roce}%</span>. The reason is not
          operational. It sits between the operating line and the bottom line.
        </p>

        <CapacityVsReturns
          rows={full.map((p) => ({ label: p.label, builtMW: p.builtMW, roce: p.roce }))}
          page={sisl.periodsSource.page}
        />
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">The mechanism</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          Capacity was capitalised and financed faster than it was sold
        </h2>

        <ol className="mt-8 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3">
          {[
            {
              n: "01",
              h: "Build ahead of demand",
              b: `${fy25.builtMW} MW is called built. ${fy25.operationalMW} MW earns revenue. The headline runs ${Math.round(headroom)} per cent ahead of the estate that pays.`,
            },
            {
              n: "02",
              h: "Capitalise the interest",
              b: `While a tower is under construction its borrowing cost is capitalised at ${sisl.capitalisationRate}% a year. In ${fy25.label} that was Rs ${cost25.interestCapitalised.toLocaleString("en-IN")} million that never reached the income statement.`,
            },
            {
              n: "03",
              h: "Commission it",
              b: `Capitalisation stops, depreciation starts, and both land in the profit and loss account at once. Net margin fell from ${fy25.patMargin}% to ${stub.patMargin}% in the quarter that followed.`,
            },
          ].map((s) => (
            <li key={s.n} className="bg-card p-5">
              <p className="exhibit-label">{s.n}</p>
              <p className="mt-2 font-display text-xl tracking-tight">{s.h}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{s.b}</p>
            </li>
          ))}
        </ol>

        <p className="mt-6 max-w-2xl leading-relaxed text-muted">
          None of this sits above the operating line. Margin on that measure rose from{" "}
          <span className="tnum text-foreground">{first.ebitdaMargin}%</span> to{" "}
          <span className="tnum text-foreground">{fy25.ebitdaMargin}%</span> across the same
          three years. The metric the issuer leads with in its own key performance indicators is
          the one measure this cannot show.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Three numbers that set up the rest</p>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3">
          {[
            {
              k: "Built against sold",
              v: `${fy25.builtMW} / ${fy25.operationalMW}`,
              u: "MW",
              n: `The prospectus defines built two different ways, ${defsApart} printed pages apart.`,
            },
            {
              k: "Power, share of revenue",
              v: pct(powerShare),
              u: "%",
              n: `Against contract escalators capped at ${sisl.escalatorMinPct} to ${sisl.escalatorMaxPct} per cent a year.`,
            },
            {
              k: "Interest capitalised",
              v: cost25.interestCapitalised.toLocaleString("en-IN"),
              u: `Rs mn, ${fy25.label}`,
              n: `Charged to the balance sheet at ${sisl.capitalisationRate}% rather than to the year.`,
            },
          ].map((s) => (
            <div key={s.k} className="bg-card p-5">
              <dt className="text-xs text-muted">{s.k}</dt>
              <dd className="mt-2 font-display text-3xl tracking-tight tnum">
                {s.v}
                <span className="ml-1.5 text-sm font-normal text-muted">{s.u}</span>
              </dd>
              <p className="mt-2 text-xs leading-relaxed text-muted">{s.n}</p>
            </div>
          ))}
        </dl>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Working pages</p>
        <p className="max-w-2xl leading-relaxed text-muted">
          The rest of the argument is being rebuilt. These are the earlier pages, still standing
          while the exhibits are ported across.
        </p>
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
        Every figure on this page is read from the Sify Infinit Spaces draft red herring
        prospectus dated 16 October 2025 and cited by its printed page. Restated consolidated
        basis, amounts in Indian Rupees millions. Educational and portfolio work, not investment
        advice.
      </footer>
    </div>
  );
}
