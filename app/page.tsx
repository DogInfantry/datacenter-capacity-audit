import type { Metadata } from "next";
import Link from "next/link";
import { universe, sisl } from "@/lib/data";
import { Exhibit } from "@/components/Exhibits";
import { ExecutionAmbition } from "@/components/ExecutionAmbition";
import { StatTile, Monogram, type IconName } from "@/components/Visual";

export const metadata: Metadata = {
  title: "Built, Installed, Sold",
};

/** Tickers with a deep-dive. Everything else renders as a card without a link. */
const COVERED = new Set(["SIFY"]);

export default function Home() {
  const ops = universe.operators;
  const announcedMW = ops.reduce((t, o) => t + o.announcedMW, 0);
  const liveMW = ops.reduce((t, o) => t + o.liveMW, 0);
  const stub = sisl.periods.find((p) => p.stub)!;
  const clientsLatest = sisl.clients[0];
  const top3 = clientsLatest.rows.filter((r) => r.rank <= 3).reduce((t, r) => t + r.share, 0);
  const soldShare = (stub.operationalMW / stub.builtMW) * 100;
  const primary = ops.filter((o) => o.source.verification === "PRIMARY").length;

  const tiles: { icon: IconName; k: string; v: string; u: string; n: string; tone?: "signal" }[] = [
    {
      icon: "datacentre",
      k: "Announced",
      v: (announcedMW / 1000).toFixed(1),
      u: "GW",
      n: `Across ${ops.length} operators. Every figure is a statement about the future.`,
    },
    {
      icon: "power",
      k: "Live",
      v: liveMW.toFixed(0),
      u: "MW",
      n: `${((liveMW / announcedMW) * 100).toFixed(1)} per cent of what has been announced.`,
      tone: "signal",
    },
    {
      icon: "client",
      k: "Bought by",
      v: `${top3.toFixed(0)}%`,
      u: "three clients",
      n: "On the one operator whose client table is filed, three Hyperscalers are two thirds of revenue.",
      tone: "signal",
    },
    {
      icon: "contract",
      k: "Traced to a filing",
      v: `${primary}`,
      u: `of ${ops.length}`,
      n: "The rest are research note figures, tagged on every row rather than smoothed over.",
    },
  ];

  const cards = [...ops]
    .sort((a, b) => b.announcedMW - a.announcedMW)
    .map((o) => ({
      ...o,
      delivered: (o.liveMW / o.announcedMW) * 100,
      href: COVERED.has(o.ticker) ? `/company/${o.ticker}` : null,
    }));

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-5">
      <section className="py-14 sm:py-20">
        <p className="sc text-accent">India · Data centres and AI infrastructure</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          India is planning in gigawatts.
          <br />
          Three customers are buying them.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          The sector is being priced on announcements. This separates what has been announced from
          what is live, on the one unit operators are actually comparable on, then reads the single
          company whose filings are public to see what delivered megawatts are worth.
        </p>

        <dl className="mt-9 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
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

      <section className="border-t border-line py-12">
        <Exhibit
          n={1}
          title={`India has announced ${(announcedMW / 1000).toFixed(1)} GW. ${liveMW.toFixed(0)} MW of it is live.`}
          units="Announced against live capacity by operator, megawatts, both axes logarithmic. Operators only."
          source={universe.watchlistSource.label}
        >
          <ExecutionAmbition operators={universe.operators} />
        </Exhibit>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">Coverage</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          Eight operators carry megawatts. One has filings you can check.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Sify Infinit Spaces filed a draft red herring prospectus, so its capacity, clients, cost
          base and offer are all readable. The rest are research note figures until their filings
          are read, and they say so on every row.
        </p>

        <ul className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => {
            const body = (
              <>
                <span className="flex items-center gap-2">
                  <Monogram name={c.listedParent} size={24} />
                  <span className="text-sm">{c.listedParent}</span>
                </span>
                <span className="mt-3 block font-display text-2xl tracking-tight tnum">
                  {c.liveMW}
                  <span className="ml-1 text-sm font-normal text-muted">of {c.announcedMW} MW</span>
                </span>
                <span
                  className={
                    "mt-1 block text-xs tnum " + (c.delivered < 20 ? "text-signal" : "text-muted")
                  }
                >
                  {c.delivered.toFixed(0)} per cent delivered
                </span>
                <span className="mt-2 block text-[11px] text-muted">
                  {c.href ? "Read the deep dive" : "Not yet covered in depth"}
                </span>
              </>
            );
            return (
              <li key={c.id} className="bg-card">
                {c.href ? (
                  <Link href={c.href} className="block p-5 transition-colors hover:bg-accent-soft">
                    {body}
                  </Link>
                ) : (
                  <span className="block p-5">{body}</span>
                )}
              </li>
            );
          })}
        </ul>

        <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
          <Link
            href="/universe"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            The full coverage matrix, fourteen names
          </Link>
          <Link
            href="/offer"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            Anatomy of the Sify offer
          </Link>
        </div>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">Why this is the interesting question</p>
        <div className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            {
              h: "The unit does not earn",
              b: `Supply is counted in built capacity. On the one estate measurable from a filing, ${soldShare.toFixed(0)} per cent of built capacity is sold. A 4.7 to 5.7 GW national forecast stated in the same unit is not 4.7 to 5.7 GW of revenue.`,
            },
            {
              h: "Demand is three counterparties",
              b: `Two thirds of that operator's revenue is three Hyperscalers, and one of them alone is ${clientsLatest.rows[0].share} per cent. The AI buildout, at company level, is a very small number of customers getting larger.`,
            },
            {
              h: "The returns went the wrong way",
              b: "Operating margin improved while return on capital fell, because capacity was capitalised and financed faster than it was sold. Energy is the consequence, not the subject.",
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
        Announced capacity is an ambition, not a result, and is labelled as such throughout. Company
        level figures are read from filed documents and cited by printed page; sector figures are
        research note estimates and carry a verification tag. Coverage as at {universe.asOf}.
        Educational and portfolio work, not investment advice.
      </footer>
    </div>
  );
}
