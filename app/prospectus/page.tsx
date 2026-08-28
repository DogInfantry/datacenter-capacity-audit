import type { Metadata } from "next";
import Link from "next/link";
import { sifyCo, prospectus, baseRate, drhpTriage } from "@/lib/data";
import { fundingGap, toCr } from "@/lib/diagnostics/capital";
import { Cite } from "@/components/Cite";
import { ScheduleVsSlip } from "@/components/ScheduleVsSlip";
import { FluffScatter } from "@/components/FluffScatter";

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
        <p className="sc text-accent">How this document was read</p>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl tracking-tight">
          Nobody reads {drhpTriage.document.pdfPages} pages. The question is
          which <span className="tnum text-accent">40</span> to read, and why
          those.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Selective reading without a stated rule is cherry picking, and this
          project does not get to do that while documenting other people&apos;s
          missing denominators. So every page is scored the same way, on two
          things that are cheap to measure and hard to fake: how many numbers it
          carries, and how heavily it hedges. A page thick with figures and thin
          on &ldquo;may&rdquo; and &ldquo;no assurance&rdquo; is where the issuer
          committed to something.
        </p>

        <FluffScatter
          pages={drhpTriage.pages}
          lexiconSize={drhpTriage.method.hedgeLexicon.length}
        />

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">
              Prospectus sections by number and hedging density
            </caption>
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">Section</th>
                <th className="py-2 pr-4 text-right font-medium">Pages</th>
                <th className="py-2 pr-4 text-right font-medium">Share</th>
                <th className="py-2 pr-4 text-right font-medium">Numbers</th>
                <th className="py-2 text-right font-medium">Hedging</th>
              </tr>
            </thead>
            <tbody>
              {[...drhpTriage.sections]
                .sort((a, b) => b.pages - a.pages)
                .slice(0, 8)
                .map((s) => (
                  <tr key={s.section} className="border-b border-line">
                    <td className="py-2.5 pr-4 text-xs">
                      {s.section.charAt(0) + s.section.slice(1).toLowerCase()}
                    </td>
                    <td className="py-2.5 pr-4 text-right tnum">{s.pages}</td>
                    <td className="py-2.5 pr-4 text-right tnum">
                      {s.shareOfScored}%
                    </td>
                    <td className="py-2.5 pr-4 text-right tnum">
                      {s.numberDensity}%
                    </td>
                    <td
                      className={
                        "py-2.5 text-right tnum " +
                        (s.section === "RISK FACTORS" ? "text-private" : "")
                      }
                    >
                      {s.hedgeDensity}%
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          Risk factors carry more than twice the hedging of any other section and
          among the fewest figures. That is fluff, measured rather than asserted.
          Add the{" "}
          <span className="tnum">
            {drhpTriage.sections.find((s) => s.section === "INDUSTRY OVERVIEW")
              ?.pages ?? 0}
          </span>{" "}
          pages of market study the issuer commissioned from its own consultants,
          and roughly two fifths of this document is not evidence about the
          company at all.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The rule also validates itself. The densest page in the entire
          document, half numbers and no hedging at all, is printed page 49. That
          is the capacity table below, and the score found it without being told
          what it contained. In only{" "}
          <span className="tnum">
            {drhpTriage.sections.reduce((s, x) => s + x.footnoteDefinitions, 0)}
          </span>{" "}
          places across {drhpTriage.document.pdfPages} pages does this document
          define its own measures, and five of them are on that one page.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Closed, by reading the document</p>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl tracking-tight">
          The prospectus calls it built. Its own footnote defines built as
          designed.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          This page used to carry the 188 megawatt discrepancy as an open
          question, because it rested on secondary summaries. The filed document
          has now been read and it settles the matter, in a direction the open
          question did not anticipate.
        </p>
        <blockquote className="mt-6 border-l-2 border-line pl-4">
          <p className="text-sm leading-relaxed">
            &ldquo;{prospectus.capacity.headlineClaim.quote}&rdquo;
          </p>
          <footer className="mt-2 text-xs text-muted">
            Draft red herring prospectus, printed page{" "}
            {prospectus.capacity.headlineClaim.page}
          </footer>
        </blockquote>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted">
          The capacity table on printed page {prospectus.capacity.page} defines
          three terms, and the widest of them is the one the headline uses.
        </p>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">
              Capacity rungs as defined by the prospectus
            </caption>
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">Term</th>
                <th className="py-2 pr-4 text-right font-medium">MW</th>
                <th className="py-2 font-medium">What the document says it means</th>
              </tr>
            </thead>
            <tbody>
              {prospectus.capacity.rungs.map((r) => (
                <tr key={r.name} className="border-b border-line align-top">
                  <td className="py-2.5 pr-4 font-medium">{r.name}</td>
                  <td className="py-2.5 pr-4 text-right tnum">
                    {r.mw.toFixed(2)}
                  </td>
                  <td className="py-2.5 text-xs leading-relaxed text-muted">
                    {r.definition}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          Built capacity is what a facility is{" "}
          <em>engineered to support</em>, from design specifications and planned
          electrical load. Nothing about it has been constructed. The capacity
          that is equipped and commissioned is{" "}
          <span className="tnum">{prospectus.capacity.rungs[1].mw}</span> MW. The
          capacity actually sold to customers is{" "}
          <span className="tnum text-accent">
            {prospectus.capacity.rungs[2].mw}
          </span>{" "}
          MW. The headline figure is{" "}
          <span className="tnum">
            {Math.round(
              (prospectus.capacity.rungs[0].mw / prospectus.capacity.rungs[2].mw -
                1) *
                100,
            )}
            %
          </span>{" "}
          larger than the estate earning revenue
          <Cite source={prospectus.capacity.source} />.
        </p>

        <div className="mt-8 rounded-sm border border-line bg-card p-5">
          <p className="sc text-accent">What the call said, eleven days later</p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed">
            &ldquo;{prospectus.capacity.callComparison.quote}&rdquo;
          </p>
          <p className="mt-2 text-xs text-muted">
            Sify management, {prospectus.capacity.callComparison.date}
          </p>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
            On the call the 188 figure is called design and the 131 figure is
            called built. In the prospectus the 188 figure is called built. The
            same estate, described with the words moved one rung up in the
            document a reader uses to price the offer. This is not a
            contradiction to resolve. It is the gap this project measures,
            appearing inside one company&apos;s own two disclosures.
          </p>
        </div>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">What the money is for</p>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl tracking-tight">
          The second largest object is{" "}
          <span className="tnum text-accent">0.1 per cent</span> spent
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The deployment schedule on printed page {prospectus.objects.page},
          certified by the statutory auditor, states what each object costs, what
          has been spent as of {prospectus.objects.deployedAsOf}, and when the
          rest is due. Figures in {prospectus.objects.unit}.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[44rem] border-collapse text-sm">
            <caption className="sr-only">
              Objects of the offer and deployment schedule
            </caption>
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">Object</th>
                <th className="py-2 pr-4 text-right font-medium">Est. cost</th>
                <th className="py-2 pr-4 text-right font-medium">Spent</th>
                <th className="py-2 pr-4 text-right font-medium">Spent %</th>
                <th className="py-2 pr-4 text-right font-medium">FY27</th>
                <th className="py-2 pr-4 text-right font-medium">FY28</th>
                <th className="py-2 text-right font-medium">FY29</th>
              </tr>
            </thead>
            <tbody>
              {prospectus.objects.rows.map((r) => {
                const pctSpent = (r.deployed / r.totalEstimatedCost) * 100;
                return (
                  <tr key={r.object} className="border-b border-line">
                    <td className="py-2.5 pr-4">{r.object}</td>
                    <td className="py-2.5 pr-4 text-right tnum">
                      {r.totalEstimatedCost.toLocaleString("en-IN")}
                    </td>
                    <td className="py-2.5 pr-4 text-right tnum">
                      {r.deployed ? r.deployed.toLocaleString("en-IN") : "n/a"}
                    </td>
                    <td
                      className={
                        "py-2.5 pr-4 text-right tnum " +
                        (r.deployed && pctSpent < 1 ? "text-private" : "")
                      }
                    >
                      {r.deployed ? pctSpent.toFixed(1) + "%" : "n/a"}
                    </td>
                    <td className="py-2.5 pr-4 text-right tnum">
                      {r.fiscal2027 ? r.fiscal2027.toLocaleString("en-IN") : ""}
                    </td>
                    <td className="py-2.5 pr-4 text-right tnum">
                      {r.fiscal2028 ? r.fiscal2028.toLocaleString("en-IN") : ""}
                    </td>
                    <td className="py-2.5 text-right tnum">
                      {r.fiscal2029 ? r.fiscal2029.toLocaleString("en-IN") : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          Rabale towers 11 and 12 carry an estimated cost of{" "}
          <span className="tnum">11,277</span> million rupees against{" "}
          <span className="tnum">10.76</span> million spent. That is a project at
          the starting line, with its money scheduled across three fiscal years
          ending in 2029
          <Cite source={prospectus.objects.source} />. Held against the
          transmission slippage on the grid page, where the cost weighted delay
          runs 13.7 months and the ninetieth percentile runs 32, a schedule that
          reaches Fiscal 2029 is the part of this offer worth watching.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Where the three registers meet</p>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl tracking-tight">
          The schedule, against the record of how late large infrastructure runs
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Two primary sources, one axis, neither of them ours. The solid bar is
          the company&apos;s own deployment window from printed page{" "}
          {prospectus.objects.page}. The band extending from it is the slippage
          distribution computed from the Ministry of Power&apos;s tabling of its
          own late transmission projects: {baseRate.n} projects, a median of{" "}
          <span className="tnum">{baseRate.median_months}</span> months, a cost
          weighted mean of{" "}
          <span className="tnum">{baseRate.cost_weighted_mean_months}</span>, and
          a ninetieth percentile of{" "}
          <span className="tnum">{baseRate.p90_months}</span>.
        </p>

        <ScheduleVsSlip
          rows={prospectus.objects.rows}
          base={baseRate}
          basisNote={prospectus.objects.scheduleBasisNote}
        />

        <p className="mt-6 max-w-2xl leading-relaxed text-muted">
          The debt repayment is the only object that finishes early, because
          repaying a loan does not require anyone to energise anything. The two
          construction objects both run to Fiscal 2029 as stated, and at the
          ninetieth percentile of observed transmission slippage they reach the
          back half of 2031. That is the gap this project is named for, drawn
          from the company&apos;s own schedule and the government&apos;s own
          record, with no estimate of ours in between.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Sources: {prospectus.document.issuer} {prospectus.document.title}, dated{" "}
        {prospectus.document.documentDate}, {prospectus.document.pdfPages} pages,
        read from the filed document and cited by printed page; Sify Technologies
        earnings call, 27 October 2025; Form 20-F filings FY2022 to FY2026.
        Educational and portfolio work, not investment advice.
      </footer>
    </div>
  );
}
