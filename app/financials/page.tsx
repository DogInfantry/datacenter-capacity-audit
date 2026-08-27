import type { Metadata } from "next";
import { CapexVsCfo } from "@/components/CapexVsCfo";
import {
  companies,
  sifyCo,
  wipro,
  equinix,
  digitalRealty,
  periodEndYear,
} from "@/lib/data";
import { fundingGap, toCr } from "@/lib/diagnostics/capital";
import { segmentMargins, revenuePerMW } from "@/lib/diagnostics/unitEconomics";
import { segmentShare } from "@/lib/diagnostics/narrative";
import { reconcileSegment, statedForFy } from "@/lib/diagnostics/reconcile";

export const metadata: Metadata = {
  title: "Financials",
  description:
    "A decade of Sify segment economics read out of Form 20-F filings: data centre margin, capital intensity, the revenue per megawatt management declined to give, and the harvest method checked against Equinix and Digital Realty.",
};

const cr = (v: number) => Math.round(toCr(v)).toLocaleString("en-IN");
const pct = (v: number) => (v * 100).toFixed(1) + "%";
const pct2 = (v: number) => (v * 100).toFixed(2) + "%";

/** The five year window the cross company table shows, by period end year. */
const WINDOW = [2022, 2023, 2024, 2025, 2026];

export default function Financials() {
  const gap = fundingGap(sifyCo.financials, "FY2022");
  const margins = segmentMargins(sifyCo.segments);
  const shares = segmentShare(sifyCo.financials, sifyCo.segments);
  const latest = margins[margins.length - 1];

  // FY2026 segment revenue over contracted capacity. Contracted is the right
  // denominator: design and commissioned capacity both include megawatts nobody
  // pays for. The opening and closing figures come from the company's own calls.
  const rpm = revenuePerMW(latest.revenue, 110, 130)!;
  const first = shares[shares.length - 6];
  const last = shares[shares.length - 1];

  // The external check. Equinix can be reconciled because it tags every
  // component of its own adjusted EBITDA definition. Digital Realty cannot.
  const eqxCheck = equinix.segments
    .map((s) => reconcileSegment(s, statedForFy(equinix.statedMargins, s.fy)))
    .filter((r) => r.statedMargin !== null);
  const dlrSeries = digitalRealty.segments.map((s) => ({
    ...reconcileSegment(s, statedForFy(digitalRealty.statedMargins, s.fy)),
    verification: s.source.verification,
  }));

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-5">
      <section className="py-14">
        <p className="sc text-accent">Financials</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight">
          Five years of building beyond the cash the business made
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          Sify files a Form 20-F because it lists on NASDAQ, so a decade of
          audited segment economics is public while its Indian-listed peers
          disclose far less. Everything here is read out of those filings.
          Figures are in rupees as filed, converted to crore for display only.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Capital intensity</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Capex beat operating cash flow in{" "}
          <span className="tnum text-accent">
            {gap.yearsOutspending} of {gap.years}
          </span>{" "}
          years
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          A data centre thesis is a capital expenditure bet, so the question that
          decides it is whether the building is funded by the business or by
          someone else. From FY2022 to FY2026 Sify spent{" "}
          <span className="tnum">Rs {cr(gap.capex)} crore</span> of capital
          against <span className="tnum">Rs {cr(gap.cfo)} crore</span> of
          operating cash flow.
        </p>

        <CapexVsCfo rows={sifyCo.financials} />

        <div className="mt-8 rounded-sm border border-line bg-card p-5">
          <p className="sc text-accent">Where the prospectus comes from</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            The cumulative shortfall across those five years is{" "}
            <span className="tnum text-foreground">Rs {cr(gap.gap)} crore</span>.
            The fresh issue in the Sify Infinit Spaces draft prospectus is{" "}
            <span className="tnum text-foreground">Rs 2,500 crore</span>. The
            listing is not a growth story bolted onto the business. It is close
            to the arithmetic consequence of five years of outspending internal
            cash, and reading the two documents together is what makes that
            visible.
          </p>
        </div>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">The number they declined to give</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Revenue per megawatt is about{" "}
          <span className="tnum text-accent">
            Rs {toCr(rpm.lowPerMonth).toFixed(2)} to{" "}
            {toCr(rpm.highPerMonth).toFixed(2)} crore
          </span>{" "}
          a month
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Asked twice for revenue per megawatt, management gave a qualitative
          answer both times. The figure is not disclosed, but it is the quotient
          of two figures that are: data centre segment revenue in the 20-F, and
          contracted capacity stated on the calls. FY2026 segment revenue of{" "}
          <span className="tnum">Rs {cr(latest.revenue)} crore</span> over 110 to
          130 contracted megawatts gives the range above.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The point is not the number. It is that the refused figure was
          derivable from public filings the whole time, so the refusal was a
          choice rather than a constraint.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          <strong className="text-foreground">Read it as a range.</strong>{" "}
          Capacity moves during a year, so the denominator is stated as opening
          and closing contracted megawatts rather than one figure. Contracted is
          used deliberately: design and commissioned capacity both include
          megawatts nobody is paying for. For reference, the research brief
          carries a single-source figure of about Rs 0.9 crore per megawatt per
          month for Indian colocation, which this range brackets.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Does the story show up in the accounts</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Data centres went from <span className="tnum">{pct(first.share)}</span>{" "}
          of revenue to{" "}
          <span className="tnum text-accent">{pct(last.share)}</span>
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          A company can call data centres its future for years without the
          segment moving. Here it moved. This is the cheapest honest test of a
          stated pivot, and Sify passes it. That matters: a project that only
          ever finds companies wanting is editorialising rather than measuring.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[38rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">FY</th>
                <th className="py-2 pr-4 text-right font-medium">Group revenue</th>
                <th className="py-2 pr-4 text-right font-medium">DC revenue</th>
                <th className="py-2 pr-4 text-right font-medium">DC share</th>
                <th className="py-2 pr-4 text-right font-medium">DC margin</th>
                <th className="py-2 text-right font-medium">Restated</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((s) => {
                const m = margins.find((x) => x.fy === s.fy)!;
                const f = sifyCo.financials.find((x) => x.fy === s.fy)!;
                return (
                  <tr key={s.fy} className="border-b border-line">
                    <td className="py-2.5 pr-4 tnum">{s.fy}</td>
                    <td className="py-2.5 pr-4 text-right tnum">
                      {cr(s.groupRevenue)}
                    </td>
                    <td className="py-2.5 pr-4 text-right tnum">
                      {cr(s.segmentRevenue)}
                    </td>
                    <td className="py-2.5 pr-4 text-right tnum">{pct(s.share)}</td>
                    <td className="py-2.5 pr-4 text-right tnum">{pct(m.margin)}</td>
                    <td className="py-2.5 text-right text-xs text-muted">
                      {f.restated ? "yes" : ""}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          The margin column is segment revenue less segment operating expense. It
          settles between 40 and 46 per cent, inside the 40 to 50 band the sector
          reports for stabilised colocation, which is the check that the series is
          being read correctly rather than merely being read. Three of these six
          years were restated by a later filing, and the restated column says
          which.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">The first external check</p>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl tracking-tight">
          The method reads a filing the way the filer does, to{" "}
          <span className="tnum text-accent">35 basis points</span>
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Every margin above was computed here and checked against nothing
          outside this project. Equinix and Digital Realty are the check. Both
          are pure play data centre operators, so group equals segment, and both
          state an adjusted EBITDA margin out loud. Rebuilding their own
          definition from their own filings and comparing it against what they
          said is the first time this harvest has been tested against an outside
          number.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The reference does not come from a filing. Adjusted EBITDA is not
          GAAP, and it appears in no metric class of the filings database for
          either company. Management says it on the earnings call instead, so
          the call is its primary source and every figure below carries the
          speaker and the date.
        </p>

        <div className="mt-8 rounded-sm border border-line bg-card p-5">
          <p className="sc text-accent">Equinix, second quarter 2025</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            Operating income of <span className="tnum">$494m</span> plus
            depreciation of <span className="tnum">$499m</span> plus stock
            compensation of <span className="tnum">$127m</span> is{" "}
            <span className="tnum">$1,120m</span> of adjusted EBITDA on{" "}
            <span className="tnum">$2,256m</span> of revenue, which is{" "}
            <span className="tnum text-foreground">49.65 per cent</span>. The
            chief executive said{" "}
            <span className="tnum text-foreground">50 per cent</span>. The
            arithmetic and the company are 35 basis points apart.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            &ldquo;Adjusted EBITDA margins increased to 50% of revenues for the
            first time in our history.&rdquo; Adaire Fox-Martin, chief
            executive, 31 July 2025. The test suite asserts this reconciliation
            against the raw figures and fails the build if it drifts more than
            150 basis points.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">
              Equinix reconciliation of derived margin to stated adjusted EBITDA
              margin
            </caption>
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">Equinix</th>
                <th className="py-2 pr-4 text-right font-medium">Derived</th>
                <th className="py-2 pr-4 text-right font-medium">Rebuilt</th>
                <th className="py-2 pr-4 text-right font-medium">Stated</th>
                <th className="py-2 pr-4 text-right font-medium">Delta</th>
                <th className="py-2 text-right font-medium">Verdict</th>
              </tr>
            </thead>
            <tbody>
              {eqxCheck.map((r) => (
                <tr key={r.label} className="border-b border-line">
                  <td className="py-2.5 pr-4 tnum">{r.label}</td>
                  <td className="py-2.5 pr-4 text-right tnum">
                    {pct2(r.derivedMargin)}
                  </td>
                  <td className="py-2.5 pr-4 text-right tnum">
                    {r.reconstructedMargin !== null
                      ? pct2(r.reconstructedMargin)
                      : "n/a"}
                  </td>
                  <td className="py-2.5 pr-4 text-right tnum">
                    {r.statedMargin !== null ? pct2(r.statedMargin) : "n/a"}
                  </td>
                  <td className="py-2.5 pr-4 text-right tnum">
                    {r.deltaBp !== null ? `${r.deltaBp.toFixed(0)} bp` : "n/a"}
                  </td>
                  <td className="py-2.5 text-right text-xs">
                    {r.verdict === "PASS" ? (
                      <span className="text-accent">pass</span>
                    ) : (
                      <span className="text-muted">{r.verdict.toLowerCase()}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          Derived is before the items a company adds back to reach its own
          measure. Rebuilt adds them. The full year figure is checked against
          guidance rather than a reported actual, so it is allowed 250 basis
          points instead of 150. Both tolerances were fixed before the check was
          run.
        </p>

        <h3 className="mt-12 font-serif text-2xl tracking-tight">
          Digital Realty cannot be reconciled at all, and that is the finding
        </h3>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The same method applied to Digital Realty produces a margin that
          matches in{" "}
          <span className="tnum text-foreground">2018</span> and then walks away
          from the stated figure year after year. The cause is not the
          arithmetic. It is that the three items needed to rebuild this
          company&apos;s adjusted EBITDA are not in the data: stock compensation
          is tagged in shares rather than dollars, impairment stops being tagged
          after 2022, and transaction costs are never tagged. A missing add back
          is not a zero add back, so nothing here is reconciled rather than
          reconciled badly.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <caption className="sr-only">
              Digital Realty derived margin against stated references
            </caption>
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">Digital Realty</th>
                <th className="py-2 pr-4 text-right font-medium">Derived</th>
                <th className="py-2 pr-4 text-right font-medium">Stated</th>
                <th className="py-2 text-right font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {dlrSeries.map((r) => (
                <tr key={r.label} className="border-b border-line">
                  <td className="py-2.5 pr-4 tnum">{r.label}</td>
                  <td
                    className={
                      "py-2.5 pr-4 text-right tnum " +
                      (r.verification === "UNVERIFIED" ? "text-muted" : "")
                    }
                  >
                    {pct2(r.derivedMargin)}
                  </td>
                  <td className="py-2.5 pr-4 text-right tnum">
                    {r.statedMargin !== null ? pct2(r.statedMargin) : ""}
                  </td>
                  <td className="py-2.5 text-right text-xs text-muted">
                    {r.verification === "UNVERIFIED" ? "unverified" : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          In 2018 the derived margin is 57.01 per cent against a chief financial
          officer who guided to 57 to 59. By 2023 it is 40.52 per cent against
          49.3 per cent implied by the company&apos;s own adjusted EBITDA
          guidance, a gap of about 880 basis points. The years with no stated
          figure to check against are marked unverified and are kept out of
          every cross company margin comparison on this site.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          <strong className="text-foreground">
            What the check actually established.
          </strong>{" "}
          The harvest method is sound where a filer tags its income statement
          completely, and it degrades exactly where non-GAAP adjustments grow
          and go untagged. Digital Realty publishes its adjusted EBITDA in a
          quarterly supplemental that carries no machine readable tagging, so
          the number is public and still out of reach. That is the same
          distinction the disclosure register draws between refusing to answer
          and answering somewhere else, arriving this time from the accounts
          rather than from the call.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Across the coverage</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          The same business model question, in one ratio
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Capital expenditure divided by operating cash flow is currency free,
          so it compares a rupee filer against a dollar filer without an
          exchange rate and without an argument. Above 1 the year built more
          than the business earned. It separates an asset heavy operator from an
          asset light one by roughly twenty times, and the two global operators
          land where the business model says they should: alongside Sify, not
          alongside the services firms.
        </p>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          <strong className="text-foreground">Read the columns carefully.</strong>{" "}
          They are period end years, not fiscal labels. Sify, Wipro and Infosys
          close on 31 March; Equinix and Digital Realty close on 31 December. A
          March closing year is placed in the calendar year it ends in, so it
          overlaps its column by nine months rather than twelve. Keying this
          table on the fiscal label instead would put a year ending March 2026
          and a year ending December 2026 in one column and quietly compare
          different things. Blank cells are years the filer has not closed.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[36rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 pr-4 font-medium">Reports in</th>
                {WINDOW.map((y) => (
                  <th key={y} className="py-2 pr-4 text-right font-medium">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.ticker} className="border-b border-line">
                  <td className="py-2.5 pr-4">
                    <span className="font-medium">{c.ticker}</span>
                    <span className="block text-xs text-muted">{c.role}</span>
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-muted">{c.currency}</td>
                  {WINDOW.map((y) => {
                    const r = c.financials.find((x) => periodEndYear(x) === y);
                    const ratio =
                      r && r.cfo && r.capex ? r.capex / r.cfo : null;
                    return (
                      <td
                        key={y}
                        className={
                          "py-2.5 pr-4 text-right tnum " +
                          (ratio && ratio > 1 ? "text-private" : "")
                        }
                      >
                        {ratio ? ratio.toFixed(2) : "n/a"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          Infosys tags its capital spend as expenditure on property, plant and
          equipment <em>and intangibles</em> from FY2019, while Sify&apos;s
          concept excludes intangibles. Close enough to separate an order of
          magnitude, not close enough to read the second decimal.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Why the currency rule exists</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Wipro grew in rupees and shrank in dollars
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Wipro reports both. Between FY2023 and FY2026 the rupee line rose from{" "}
          <span className="tnum">Rs 9.05 lakh crore</span> to{" "}
          <span className="tnum">Rs 9.26 lakh crore</span>, while the dollar line
          fell from <span className="tnum">$11.01 billion</span> to{" "}
          <span className="tnum">$9.87 billion</span>. The difference is
          currency, not business. Quoting only the rupee figure would present a
          three year decline as growth, which is why nothing here compares
          absolute money across filers.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[30rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">FY</th>
                <th className="py-2 pr-4 text-right font-medium">Revenue, Rs bn</th>
                <th className="py-2 text-right font-medium">Revenue, USD bn</th>
              </tr>
            </thead>
            <tbody>
              {wipro.financials.map((r) => (
                <tr key={r.fy} className="border-b border-line">
                  <td className="py-2.5 pr-4 tnum">{r.fy}</td>
                  <td className="py-2.5 pr-4 text-right tnum">
                    {(r.revenue / 1e9).toFixed(1)}
                  </td>
                  <td className="py-2.5 text-right tnum">
                    {r.revenueUsd ? (r.revenueUsd / 1e9).toFixed(2) : "n/a"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Sources: Sify Technologies Form 20-F filings, FY2018 to FY2026; Equinix
        and Digital Realty Form 10-K and 10-Q filings, 2016 to 2025; all via SEC
        EDGAR. Stated adjusted EBITDA margins are verbatim from the companies&apos;
        own earnings calls, which is the only place they are published in a form
        this project can read. Educational and portfolio work, not investment
        advice.
      </footer>
    </div>
  );
}
