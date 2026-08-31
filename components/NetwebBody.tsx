import Link from "next/link";
import type { Netweb } from "@/lib/schema";
import { orderBookConcentration } from "@/lib/diagnostics/netweb";
import { netwebRiskMeasures } from "@/lib/diagnostics/risk";
import { Exhibit } from "./Exhibits";
import { RiskMatrix } from "./RiskMatrix";
import { NetwebOrderBook } from "./NetwebOrderBook";
import { Icon, Pictogram, StatTile } from "./Visual";
import { Logo } from "./Logo";

type Props = {
  data: Netweb;
  /** Sify's client concentration, computed by the page from the filed table. */
  sify: { sharePct: number; page: number };
};

/**
 * Netweb, the order book case.
 *
 * The other two deep dives are capacity stories. This one cannot be: Netweb
 * builds the servers that go inside somebody else's data centre and owns no
 * megawatts, so it is deliberately absent from the Execution against Ambition
 * plot and is read on the unit its business actually runs on.
 */
export function NetwebBody({ data, sify }: Props) {
  const c = orderBookConcentration(data.orderBook, data.anchorOrder);
  // The schema guarantees exactly one of each, so the nesting the exhibit
  // describes is the nesting the data actually holds.
  const quarter = data.revenueMix.find((r) => r.span === "QUARTER")!;
  const nineMonths = data.revenueMix.find((r) => r.span === "NINE_MONTHS")!;
  const mixGap = quarter.aiSharePct - nineMonths.aiSharePct;

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-5">
      <section className="py-12 sm:py-16">
        <div className="flex items-center gap-3">
          <Logo ticker={data.ticker} name={data.listedParent} size="lg" tone="var(--accent-deep)" />
          <div>
            <p className="sc text-accent">
              {data.listedParent} · {data.exchange} {data.ticker}
            </p>
            <p className="text-xs text-muted">
              {data.role} · sourcing {data.source.verification.toLowerCase()}, no filing read
            </p>
          </div>
        </div>

        <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          {c.sharePct.toFixed(0)} per cent of the order book
          <br />
          is one government order.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Netweb owns no megawatts. It builds the machines that fill other people&apos;s data
          centres, so there is no capacity ladder here and it is deliberately absent from the plot
          on the front page. The unit it is measured on is the order book, and the concentration
          that sits inside the other names&apos; revenue sits inside its backlog instead.
        </p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon="contract"
            label="Order book"
            value={c.bookCr.toLocaleString("en-IN")}
            unit="Rs cr"
            note={`As at ${data.orderBook.asOf}.`}
          />
          <StatTile
            icon="client"
            label={data.anchorOrder.name}
            value={c.anchorCr.toLocaleString("en-IN")}
            unit="Rs cr"
            note={`${data.anchorOrder.scope} Awarded ${data.anchorOrder.awarded}, due ${data.anchorOrder.deliveryDue}.`}
          />
          <StatTile
            icon="warning"
            label="Share of the book"
            value={`${c.sharePct.toFixed(1)}%`}
            unit="one counterparty"
            note={`Everything else, every other customer, is Rs ${c.restCr.toLocaleString("en-IN")} cr.`}
            tone="signal"
          />
          <StatTile
            icon="capital"
            label="Trailing earnings"
            value={`${data.valuation.trailingPE}x`}
            note={data.valuation.note}
          />
        </dl>
      </section>

      <section className="space-y-6 border-t border-line py-12">
        <Exhibit
          n={1}
          title={`${c.sharePct.toFixed(0)} per cent of the book is one counterparty, and it is backlog rather than revenue`}
          units="Share of each company's own whole. Netweb, order book in Rs cr at the date stated. Sify, revenue from operations. The two wholes are different quantities and are labelled as such."
          source={`${data.source.label} Sify from its draft red herring prospectus, revenue by client.`}
        >
          <NetwebOrderBook
            concentration={c}
            anchor={data.anchorOrder}
            bookAsOf={data.orderBook.asOf}
            caveat={data.concentrationCaveat}
            sify={sify}
          />
        </Exhibit>

        <Exhibit
          n={2}
          title={`AI systems are ${quarter.aiSharePct} per cent of the quarter and ${nineMonths.aiSharePct} per cent of the nine months holding it`}
          units="Share of revenue, per cent. Each square is one per cent. The longer period contains the shorter one, so these are not two independent readings."
          source={data.source.label}
        >
          <div className="grid gap-8 sm:grid-cols-2">
            {[quarter, nineMonths].map((m) => (
              <div key={m.period}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">{m.period}</span>
                  <span className="tnum text-sm text-muted">
                    <span className="text-foreground">{m.aiSharePct}</span> per cent
                  </span>
                </div>
                <p className="mb-3 mt-0.5 text-xs text-muted">{m.basis}</p>
                <Pictogram
                  filledPct={m.aiSharePct}
                  filledLabel="AI systems"
                  emptyLabel="everything else"
                  columns={10}
                  unit="rupees of revenue"
                />
              </div>
            ))}
          </div>

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The quarter runs <span className="tnum text-foreground">{mixGap}</span> points above the
            period that contains it. Netweb is described as an AI company on the strength of{" "}
            {quarter.period}, and the nine months that include it are still under half. Both
            readings are true. Only one of them is a year.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The earlier quarters are not backed out of the two figures here. Doing that needs an
            assumption that revenue lands evenly across quarters, which is exactly what a lumpy
            project business does not do, and the arithmetic would look more precise than the
            evidence is.
          </p>
        </Exhibit>

        <Exhibit
          n={3}
          title="The one name here with no filing read is the only one that can price itself"
          units="Severity against likelihood, graded by this project. A chip is filled where the magnitude is derived from the figures recorded for this name and outlined where the row is judgement. Valuation carries a row here and none on the Sify page, because a multiple needs only a price and a reported earnings figure, and the prospectus read for that name carries no price band at all."
          source={data.source.label}
        >
          <RiskMatrix register={data.risks} measures={netwebRiskMeasures(data)} />
        </Exhibit>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">The price, and what has not been read</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          This page is thin, and says so
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Every figure above comes from a research note. No Netweb filing has been opened, so there
          is no revenue in rupees, no margin, no cash flow and no receivables here. What the page
          can say is what the order book is made of, and what is being paid for it.
        </p>

        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          <div className="rounded-md border border-line bg-card p-5">
            <p className="font-display text-lg tracking-tight">
              <span className="tnum">{data.valuation.trailingPE}</span> times trailing earnings
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {data.valuation.note} The multiple is on earnings already reported. The concentration
              is in work not yet delivered. Those are different periods, and the price is paid today
              for the second one.
            </p>
          </div>
          <div className="rounded-md border border-line bg-card p-5">
            <p className="font-display text-lg tracking-tight">One delivery window</p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Rs <span className="tnum">{c.anchorCr.toLocaleString("en-IN")}</span> cr, or{" "}
              <span className="tnum">{c.sharePct.toFixed(0)}</span> per cent of the book, is due{" "}
              {data.anchorOrder.deliveryDue}. The research note gives no schedule for the remaining
              Rs <span className="tnum">{c.restCr.toLocaleString("en-IN")}</span> cr, so no timeline
              is drawn for it here.
            </p>
          </div>
        </div>

        <ul className="mt-6 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {data.notRead.map((n) => (
            <li key={n} className="flex items-start gap-2 bg-card p-4 text-sm text-muted">
              <span className="mt-0.5 shrink-0">
                <Icon name="warning" size={14} />
              </span>
              {n}
            </li>
          ))}
        </ul>

        <p className="mt-6 text-sm text-muted">
          <Link
            href="/company/SIFY"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            Sify is the name where the filings were read
          </Link>
          , and the difference in what can be said about the two is the difference between a research
          note and a prospectus.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Every figure on this page is secondary, sourced from a research note rather than a filing,
        and is tagged as such. An order book is work not yet delivered, not revenue. Educational and
        portfolio work, not investment advice.
      </footer>
    </div>
  );
}
