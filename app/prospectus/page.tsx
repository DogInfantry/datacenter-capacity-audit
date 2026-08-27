import type { Metadata } from "next";
import Link from "next/link";
import { sifyCo } from "@/lib/data";
import { fundingGap, toCr } from "@/lib/diagnostics/capital";

export const metadata: Metadata = {
  title: "Prospectus",
  description:
    "The Sify Infinit Spaces draft red herring prospectus read against the company's own earnings calls and Form 20-F filings.",
};

const cr = (v: number) => Math.round(toCr(v)).toLocaleString("en-IN");

export default function Prospectus() {
  const gap = fundingGap(sifyCo.financials, "FY2022");

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-5">
      <section className="py-14">
        <p className="sc text-accent">Prospectus</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight">
          India&apos;s first data centre listing, read against the filings
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          Sify Infinit Spaces filed a draft red herring prospectus with SEBI in
          October 2025, since approved. It is the richest single document in this
          subject, and the only one that states what the company will build,
          where, and with whose money.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">The offer</p>
        <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4">
          {[
            ["Total issue", "Rs 3,700 cr"],
            ["Fresh issue", "Rs 2,500 cr"],
            ["Offer for sale", "Rs 1,200 cr"],
            ["Colocation sites", "14, six metros"],
          ].map(([k, v]) => (
            <div key={k} className="bg-card p-4">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-1 font-serif text-xl tnum">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          The offer for sale is entirely Kotak Data Center Fund (Rs 643 cr) and
          Kotak Special Situations Fund (Rs 557 cr). Stated uses of the fresh
          issue include Rs 465 cr to complete Tower B at Chennai 02 and Rs 860 cr
          for Towers 11 and 12 at Rabale in Navi Mumbai.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Why it exists</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          The fresh issue is the size of the funding gap
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Between FY2022 and FY2026 Sify spent{" "}
          <span className="tnum">Rs {cr(gap.gap)} crore</span> more on capital
          than the business generated in operating cash flow. The fresh issue is{" "}
          <span className="tnum">Rs 2,500 crore</span>. Read on its own the
          prospectus is a growth story. Read against{" "}
          <Link
            href="/financials"
            className="underline decoration-line underline-offset-2 hover:text-accent"
          >
            five years of cash flow statements
          </Link>{" "}
          it is closer to a funding requirement that had been accumulating in
          plain sight.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Open question, not a finding</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          The same 188 megawatts, described two ways
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Published summaries of the prospectus report built IT capacity of
          188.04 MW as at 30 June 2025. On the call of 27 October 2025,
          management described 188 MW as design capacity ready for sale, of which
          about 130 MW is built. The same figure appears under two different
          definitions, weeks apart.
        </p>
        <div className="mt-6 rounded-sm border border-line bg-card p-5">
          <p className="sc text-accent">Status: unverified</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            This rests on secondary summaries, not the filed document. Paraphrase
            is the likely explanation, and the claim stays off this page until
            the prospectus itself is read. It is recorded here as an open
            question rather than quietly dropped, because the discipline this
            project argues for applies to its own unfinished work.
          </p>
        </div>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Sources: Sify Infinit Spaces draft red herring prospectus as reported,
        pending verification against the filed document; Sify Technologies
        earnings call, 27 October 2025; Form 20-F filings FY2022 to FY2026.
        Educational and portfolio work, not investment advice.
      </footer>
    </div>
  );
}
