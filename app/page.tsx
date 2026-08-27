import type { Metadata } from "next";
import Link from "next/link";
import { baseRate, sify, sifyCo } from "@/lib/data";
import { fundingGap, toCr } from "@/lib/diagnostics/capital";
import { segmentShare } from "@/lib/diagnostics/narrative";

export const metadata: Metadata = {
  title: "The Gigawatt Gap",
  description:
    "India announced a gigawatt data centre buildout. This measures what the grid, the accounts and the silences will actually carry.",
};

const cr = (v: number) => Math.round(toCr(v)).toLocaleString("en-IN");

const REGISTERS = [
  {
    href: "/grid",
    kicker: "Physical",
    title: "What the grid can carry",
    body: "Inter-state transmission slips a cost weighted 13.7 months, from the Ministry of Power's own tabling of its late projects. Private developers slip about 2.5 times harder than the state utility.",
  },
  {
    href: "/disclosure",
    kicker: "Disclosure",
    title: "What management will not say",
    body: "A decade of earnings calls, coded. Two capacity promises graded against what was delivered, and the refusals tested for whether the answer existed anywhere at all.",
  },
  {
    href: "/financials",
    kicker: "Accounts",
    title: "What the statements show",
    body: "Nine years of audited segment economics. Data centre margin, capital intensity, and the revenue per megawatt that was declined on a call but is derivable from the filings.",
  },
];

export default function Home() {
  const gap = fundingGap(sifyCo.financials, "FY2022");
  const shares = segmentShare(sifyCo.financials, sifyCo.segments);
  const missed = sify.claims.filter((c) => c.status === "MISSED").length;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-5">
      <section className="py-16 sm:py-24">
        <p className="sc text-accent">The Gigawatt Gap</p>
        <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-5xl">
          India announced a gigawatt data centre buildout. Three records decide
          how much of it lands.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Announcements are measured in gigawatts and delivery in megawatts. Most
          analysis of that gap argues about company intent. This measures three
          things that do not depend on intent: what the grid can physically
          carry, what the accounts eventually record, and what management
          declines to put a number on.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Three registers</p>
        <div className="mt-8 grid gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-3">
          {REGISTERS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="group bg-card p-5 transition-colors hover:bg-accent-soft"
            >
              <p className="sc text-accent">{r.kicker}</p>
              <h2 className="mt-2 font-serif text-xl tracking-tight group-hover:text-accent">
                {r.title}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{r.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">What has been measured so far</p>
        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4">
          <div className="bg-card p-4">
            <dt className="text-xs text-muted">Transmission slip, cost weighted</dt>
            <dd className="mt-1 font-serif text-2xl tnum">
              {baseRate.cost_weighted_mean_months} mo
            </dd>
          </div>
          <div className="bg-card p-4">
            <dt className="text-xs text-muted">Capacity promises graded missed</dt>
            <dd className="mt-1 font-serif text-2xl tnum">{missed}</dd>
          </div>
          <div className="bg-card p-4">
            <dt className="text-xs text-muted">Capex above cash flow, FY2022 to FY2026</dt>
            <dd className="mt-1 font-serif text-2xl tnum">Rs {cr(gap.gap)} cr</dd>
          </div>
          <div className="bg-card p-4">
            <dt className="text-xs text-muted">Data centre share of revenue</dt>
            <dd className="mt-1 font-serif text-2xl tnum">
              {(shares[shares.length - 1].share * 100).toFixed(0)}%
            </dd>
          </div>
        </dl>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          Every figure on this site carries its source and how far it has been
          checked. The{" "}
          <Link href="/method" className="underline decoration-line underline-offset-2 hover:text-accent">
            method page
          </Link>{" "}
          states each formula, its denominator and its sample size, because a
          rate without a denominator is decoration.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Educational and portfolio work. Not investment advice, not a research
        product, and not affiliated with any company or agency named.
      </footer>
    </div>
  );
}
