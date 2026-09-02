import type { Metadata } from "next";
import Link from "next/link";
import { sisl, anantRaj, netweb, prospectus, macro } from "@/lib/data";
import { citedPages } from "@/lib/diagnostics/sourcing";
import { dataCentreArm } from "@/lib/diagnostics/anantraj";
import { Logo } from "@/components/Logo";
import { Icon } from "@/components/Visual";

export const metadata: Metadata = {
  title: "Deep dives",
  description:
    "Three companies read at length, each on the unit its own disclosure supports: a pure play read from a filed prospectus, a property developer read from its audited accounts, and a server maker with no megawatts to plot.",
};

/**
 * The way in to the deep dives.
 *
 * They existed before this page did and were reachable only by clicking a row
 * in the coverage matrix or a link inside another page's prose, which meant the
 * three longest pieces of work on the site were the three hardest to find.
 *
 * Each card says what the page is measured on before it says anything else,
 * because the three are not comparable and the reason they are not is the most
 * useful thing to know before opening one.
 */
export default function CompanyIndexPage() {
  const full = sisl.periods.filter((p) => !p.stub);
  const fy = full[full.length - 1];
  const arm = dataCentreArm(anantRaj.financials);
  const claimed = anantRaj.annualReport.rungs.find((r) => r.kind === "CLAIMED")!;
  const live = anantRaj.annualReport.rungs.find((r) => r.rung === "Operationalised")!;

  const cards = [
    {
      ticker: "SIFY",
      name: sisl.entity,
      parent: "Sify Technologies",
      unit: "Megawatts, built against sold",
      document: `Draft red herring prospectus dated ${prospectus.document.documentDate}, ${citedPages(sisl, prospectus, macro).length} printed pages cited`,
      headline: `${((fy.operationalMW / fy.builtMW) * 100).toFixed(0)} per cent of built capacity earns`,
      detail: `${fy.operationalMW} MW sold of ${fy.builtMW} MW the document calls built, in ${fy.label}.`,
    },
    {
      ticker: "ANANTRAJ",
      name: anantRaj.listedParent,
      parent: anantRaj.entity,
      unit: "Megawatts, announced against handed over",
      document: `Annual report ${anantRaj.annualReport.fiscalYear}, filed with the exchange`,
      headline: `${arm.turnoverSharePct.toFixed(1)} per cent of group revenue is the data centre`,
      detail: `${claimed.mw} MW is called operational and ${live.mw} MW is, and the arm that owns it loses money.`,
    },
    {
      ticker: "NETWEB",
      name: netweb.listedParent,
      parent: netweb.listedParent,
      unit: "An order book, because it owns no estate",
      document: "Research note figures, secondary on every row and marked so",
      headline: `${netweb.orderBook.valueCr.toLocaleString("en-IN")} crore of order book`,
      detail: `Measured on backlog and revenue mix rather than capacity, since it builds the machines that fill somebody else's estate.`,
    },
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-5">
      <section className="py-12 sm:py-16">
        <p className="sc text-accent">Deep dives</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          Three companies, three units, and no single table that holds them.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Two of these are read from documents they filed themselves and cite the printed page for
          every figure. The third is read from a research note and says so on every row. What each
          page is measured on is written on its card, because the three do not share a unit and a
          reader deciding where to start should know that first.
        </p>
      </section>

      <section className="grid gap-px overflow-hidden rounded-md border border-line bg-line md:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.ticker}
            href={`/company/${c.ticker}`}
            className="group bg-card p-6 transition-colors hover:bg-grid"
          >
            <div className="flex items-center gap-2.5">
              <Logo ticker={c.ticker} name={c.name} size="lg" tone="var(--accent-deep)" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{c.name}</span>
                <span className="block font-mono text-[11px] text-muted">{c.ticker}</span>
              </span>
            </div>

            <p className="mt-5 font-display text-2xl leading-tight tracking-tight">{c.headline}</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">{c.detail}</p>

            <dl className="mt-5 space-y-2 border-t border-line pt-4 text-xs leading-relaxed">
              <div>
                <dt className="text-muted">Measured on</dt>
                <dd className="text-foreground">{c.unit}</dd>
              </div>
              <div>
                <dt className="text-muted">Read from</dt>
                <dd className="text-foreground">{c.document}</dd>
              </div>
            </dl>

            <p className="mt-5 flex items-center gap-1.5 text-sm text-accent">
              Open the deep dive
              <span className="transition-transform group-hover:translate-x-0.5">
                <Icon name="contract" size={14} />
              </span>
            </p>
          </Link>
        ))}
      </section>

      <section className="border-t border-line py-12">
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
          The wider coverage runs to fourteen names on the{" "}
          <Link
            href="/universe"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            coverage matrix
          </Link>
          , where every row carries its verification tag. Two of the three above are set against each
          other on{" "}
          <Link
            href="/compare"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            the comparison
          </Link>
          , alongside a third operator whose megawatts are filed but whose statements are not drawn
          on here.
        </p>
      </section>
    </div>
  );
}
