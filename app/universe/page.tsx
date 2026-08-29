import type { Metadata } from "next";
import Link from "next/link";
import { universe } from "@/lib/data";
import { UniverseMatrix } from "@/components/UniverseMatrix";
import { StatTile, type IconName } from "@/components/Visual";

export const metadata: Metadata = {
  title: "Coverage universe",
  description:
    "Every Indian listed name with data centre or AI infrastructure exposure, scored on what is announced against what is live, with the sourcing of each figure shown.",
};

export default function UniversePage() {
  const ops = universe.operators;
  const announced = ops.reduce((t, o) => t + o.announcedMW, 0);
  const live = ops.reduce((t, o) => t + o.liveMW, 0);
  const zero = ops.filter((o) => o.liveMW === 0);
  const primary = ops.filter((o) => o.source.verification === "PRIMARY").length;

  const tiles: {
    icon: IconName;
    k: string;
    v: string;
    u: string;
    n: string;
    tone?: "signal";
  }[] = [
    {
      icon: "datacentre",
      k: "Announced",
      v: (announced / 1000).toFixed(1),
      u: "GW",
      n: `Across ${ops.length} operators. Every figure is a company statement about the future.`,
    },
    {
      icon: "power",
      k: "Live",
      v: live.toFixed(0),
      u: "MW",
      n: `${((live / announced) * 100).toFixed(1)} per cent of what has been announced.`,
    },
    {
      icon: "warning",
      k: "Announced, nothing live",
      v: `${zero.length}`,
      u: `of ${ops.length}`,
      n: `${zero.map((o) => o.listedParent).join(" and ")}, carrying ${(
        zero.reduce((t, o) => t + o.announcedMW, 0) / 1000
      ).toFixed(0)} GW between them.`,
      tone: "signal",
    },
    {
      icon: "contract",
      k: "Traced to a filing",
      v: `${primary}`,
      u: `of ${ops.length}`,
      n: "The rest are research note figures, tagged secondary or unverified on every row.",
    },
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-5">
      <section className="py-12 sm:py-16">
        <p className="sc text-accent">Coverage</p>
        <h1 className="mt-4 max-w-3xl font-display text-4xl leading-[1.1] tracking-tight">
          Who is building, and who has announced
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          Indian listed exposure to data centres and AI infrastructure is messy. The largest
          builders are conglomerates where the asset is buried, most pure plays are unlisted, and
          the accessible mid caps have re-rated on announcements. This is the coverage, with the
          announcement and the delivery kept in separate columns.
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

      <section className="border-t border-line py-12">
        <UniverseMatrix operators={universe.operators} watchlist={universe.watchlist} />
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">How to read the sourcing</p>
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          {[
            [
              "Primary",
              "Traced to a document filed with a regulator and cited by its printed page. One name qualifies: Sify Infinit Spaces, read from its draft red herring prospectus.",
            ],
            [
              "Secondary",
              "A researched figure from company announcements, brokerage notes or press reporting, not yet traced to a filing inside this repository. Most of the universe sits here.",
            ],
            [
              "Unverified",
              "Either the sources disagree or the figure is an estimate rather than a company statement. AdaniConneX and E2E Networks are marked this way, and the reason is written on the row.",
            ],
          ].map(([h, b]) => (
            <div key={h} className="rounded-md border border-line bg-card p-5">
              <p className="font-display text-lg tracking-tight">{h}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{b}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          Nothing is averaged across disagreeing sources and no cell is imputed. Where this
          repository already held a figure that conflicts with the research note, both are recorded
          and the row is downgraded rather than reconciled quietly.{" "}
          <Link href="/" className="underline decoration-line underline-offset-4 hover:text-accent">
            The plot is on the front page
          </Link>
          .
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Announced capacity is an ambition, not a result. Coverage as at {universe.asOf}. Educational
        and portfolio work, not investment advice.
      </footer>
    </div>
  );
}
