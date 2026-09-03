import type { Metadata } from "next";
import Link from "next/link";
import { companies, sisl, sifyCo } from "@/lib/data";
import { armAgainstParent, peerCashConversion } from "@/lib/diagnostics/cashQuality";
import { leverage } from "@/lib/diagnostics/capital";
import { CASH_CONVERSION } from "@/lib/config";
import { Exhibit } from "@/components/Exhibits";
import { PeerCashConversion } from "@/components/PeerCashConversion";
import { Leverage } from "@/components/Leverage";

export const metadata: Metadata = {
  title: "Pillars",
  description:
    "Two of the brief's six forensic pillars, built. Cash conversion across every filer whose statements are machine readable, and leverage on both readings of a lease liability the filing never defines.",
};

/**
 * The forensic scorecard, two pillars in.
 *
 * The brief asks for six. This route carries the two that have been built and
 * names the four that have not, rather than shipping empty headings that would
 * read as work in progress instead of as work not done.
 *
 * The page is not a ranking. Two of these filers are IT services groups and two
 * are colocation pure plays, and none of the four is a comparable of the Indian
 * operator this coverage is about. What they have in common is narrower and is
 * the thing being tested: their statements are complete enough in the store to
 * ask the question of at all. Where a measure cannot be computed the cell says
 * why, and the two reasons on this page are different in kind.
 */
export default function PillarsPage() {
  const readings = peerCashConversion(companies);
  const unitFor: Record<string, string> = {
    ...Object.fromEntries(companies.map((c) => [c.ticker, c.currency])),
    SISL: `${sisl.currency}, ${sisl.unit}`,
  };

  const pair = armAgainstParent(sisl, sifyCo);
  // Split by entity rather than by position. The exhibit below argues from the
  // difference between the two, and an off by one would invert the claim.
  const armRows = pair.filter((r) => r.ticker === "SISL");
  const parentRows = pair.filter((r) => r.ticker === sifyCo.ticker);
  const armConv = armRows.map((r) => r.metrics[0].value).filter((v): v is number => v !== null);
  const lev = leverage(sisl);
  const levStub = lev.find((r) => r.annualised);
  const parentConv = parentRows
    .map((r) => r.metrics[0].value)
    .filter((v): v is number => v !== null);
  // The parent's profit line across every year it has filed, which is what
  // makes the ratio above it climb and then stop resolving. Shown in millions
  // to sit on the same scale as the arm's statements. A change of scale inside
  // one currency, and the unit is named wherever the figure appears.
  const parentPat = sifyCo.financials
    .filter((f) => f.pat !== undefined)
    .map((f) => ({ fy: f.fy, mn: f.pat!.value / 1_000_000 }));
  const patFirst = parentPat[0];
  const patLast = parentPat[parentPat.length - 1];

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12">
      <p className="sc text-accent">The forensic scorecard</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight tracking-tight">
        Net income is an opinion. Cash is a fact. One of these filers cannot be asked the
        question at all.
      </h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">
        Cash conversion is the first of the brief&rsquo;s six pillars to be built and the balance
        sheet is the second. The first runs two measures of the same idea and reports them side by
        side rather than averaging them, because they can disagree and the disagreement is worth
        more than either verdict alone. The bands are published on{" "}
        <Link href="/methodology" className="underline decoration-line underline-offset-4">
          the methodology page
        </Link>{" "}
        and read from the same file that applies them here.
      </p>

      <div className="mt-10 grid gap-8">
        <Exhibit
          n={1}
          title="One pillar, five filers, three currencies and no conversion between them"
          units="One row per filer, on that filer's own most recently filed year. Three of these companies close on 31 March and two on 31 December, so the year is printed on every row rather than assumed by a column heading. Both measures are ratios, so nothing here depends on the currency the accounts were filed in."
          source="Harvested from the filings store one concept at a time, with the filing that served each figure recorded against it. Filings are 10-K for the two US filers and 20-F for the three that report to the SEC as foreign private issuers."
        >
          <PeerCashConversion readings={readings} unitFor={unitFor} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The empty cells are empty for different reasons and the page keeps them apart. The
            Indian operator&rsquo;s group made a loss in this period, so a ratio against profit
            would change sign without the cash changing, and the measure refuses rather than
            returning a negative that would sort like a grade. The two US filers are missing a
            denominator instead: an annual report prints its statement of financial position one
            year behind the cash flow filed beside it, so the most recent year has cash on both
            sides and no balance sheet to divide by. One absence is about the company. The other
            is about the document.
          </p>
        </Exhibit>

        <Exhibit
          n={2}
          title={`The group scores ${Math.max(...parentConv).toFixed(0)} times on this measure in the year its profit almost disappeared, and refuses it the year after`}
          units="Two documents measuring one business, on the years both filed. The arm files restated statements into a draft prospectus in rupees millions; the parent files a 20-F in absolute rupees. Neither figure is converted and neither needs to be, because both measures divide the scale out. The stub quarter is excluded, since the parent files no quarter to set beside it."
          source={`The arm from ${sisl.cashFlowSource.label} The parent from its 20-F, as served by the filings store.`}
          page={sisl.cashFlowSource.page}
        >
          <PeerCashConversion readings={pair} unitFor={unitFor} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Read the parent&rsquo;s row and the measure improves from{" "}
            <span className="tnum text-foreground">{Math.min(...parentConv).toFixed(2)}</span> to{" "}
            <span className="tnum text-foreground">{Math.max(...parentConv).toFixed(2)}</span>{" "}
            times, then stops resolving. Nothing improved. Profit after tax went from{" "}
            <span className="tnum text-foreground">{patFirst.mn.toFixed(0)}</span> million rupees
            in {patFirst.fy} to a loss of{" "}
            <span className="tnum text-foreground">{Math.abs(patLast.mn).toFixed(0)}</span> million
            in {patLast.fy}, while operating cash stayed in the thousands of millions. The quotient
            climbed on a shrinking denominator and then hit a negative one. A ratio against profit
            is at its least informative exactly where the profit line is in trouble, which is why
            the measure refuses a non-positive denominator rather than printing the number.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            The subsidiary underneath it is the steady one, turning profit into between{" "}
            <span className="tnum text-foreground">{Math.min(...armConv).toFixed(2)}</span> and{" "}
            <span className="tnum text-foreground">{Math.max(...armConv).toFixed(2)}</span> times
            as much operating cash, above the{" "}
            <span className="tnum text-foreground">{CASH_CONVERSION.cfoToPat.amberBelow}</span>{" "}
            flag in every year. Its accrual ratio runs far higher than the parent&rsquo;s in the
            two standalone years, which is the build showing through rather than the earnings: the
            measure nets investing cash back into its numerator, and this company is spending. The
            two documents are never reconciled to each other, and the gap between the
            parent&rsquo;s segment note and the arm&rsquo;s own accounts is separately{" "}
            <Link href="/company/SIFY" className="underline decoration-line underline-offset-4">
              a constant 87.7 million rupees
            </Link>{" "}
            in every year they overlap.
          </p>
        </Exhibit>

        <Exhibit
          n={3}
          title="The document never says whether a lease is a borrowing. Its own net debt line answers it in every period"
          units={`Rupees millions and times earnings, for the operator whose statements are read page by page. Net debt as the issuer publishes it, rebuilt from the balance sheet lines beside it, and the leverage ratio on both readings of the lease liability. Source at printed page ${sisl.balanceSheetSource.page}.`}
          source={sisl.balanceSheetSource.label}
          page={sisl.balanceSheetSource.page}
        >
          <Leverage rows={lev} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The return on capital formula this issuer prints defines capital employed as net worth
            plus total borrowings less cash, and never says whether a lease liability counts as a
            borrowing. That question decides the answer:{" "}
            <Link
              href="/company/SIFY"
              className="underline decoration-line underline-offset-4"
            >
              the published returns only rebuild on the reading where it does
            </Link>
            , which is an inference drawn backwards from a result. The net debt line settles it
            forwards. In all{" "}
            <span className="tnum text-foreground">
              {lev.filter((r) => r.leasesAreDebt).length}
            </span>{" "}
            filed periods the issuer&rsquo;s own published net debt equals borrowings plus lease
            liabilities less cash, to the paisa. The convention is written nowhere and provable
            everywhere.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            It is also the stricter of the two. Read the printed wording literally and leverage
            falls to{" "}
            <span className="tnum text-foreground">
              {(lev[0].netDebtExLeases / (lev[0].netDebt / lev[0].netDebtToEbitda)).toFixed(2)}
            </span>{" "}
            times from{" "}
            <span className="tnum text-foreground">{lev[0].netDebtToEbitda.toFixed(2)}</span> in the
            first filed period. The issuer took the reading that flatters it less, here and on the
            return on capital, and states that choice in neither place.
          </p>
          {levStub && (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              One more thing falls out of the same arithmetic. Dividing published net debt by the
              published ratio recovers the earnings figure behind it, and for{" "}
              <span className="text-foreground">{levStub.label}</span> that is{" "}
              <span className="tnum text-foreground">{levStub.earningsMultiple.toFixed(2)}</span>{" "}
              times the earnings the same period reports, so the quarter is annualised for this
              ratio. The same document reports that quarter&rsquo;s return on capital
              unannualised. Two ratios, one period, opposite conventions, and neither is labelled.
            </p>
          )}
        </Exhibit>
      </div>

      <section className="mt-12 border-t border-line pt-8">
        <p className="sc text-accent">What is not here</p>
        <h2 className="mt-3 max-w-3xl font-display text-2xl leading-tight tracking-tight">
          Five pillars, and the reason each is still empty
        </h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          {[
            {
              h: "Governance",
              b: "Carries its first row on the Indian operator, built from the litigation section of the prospectus. The auditor's report and the related party notes inside the restated financial information are not cited yet.",
            },
            {
              h: "Revenue quality",
              b: "Customer concentration is read for the two Indian operators and carries its first result. One states the same concentration in three sections, including an audited note, and all three agree exactly; the other discloses no customer above a tenth of revenue. Pricing, contract duration and churn are unread for every filer.",
            },
            {
              h: "Balance sheet",
              b: "Built for the operator whose statements are read page by page, in Exhibit 3 above. The five harvested filers have total assets but no borrowings or lease liability split, so leverage cannot yet be asked of them, and no second operator has had a balance sheet read.",
            },
            {
              h: "Business model",
              b: "Rests on segment disclosure, and the segmentation is not like for like across this set. Two filers are pure plays, two segment by industry vertical and one by service line.",
            },
            {
              h: "Valuation",
              b: "Terminal rather than pending. Every figure here comes from a filed document, no market data source has been read, and a draft prospectus carries no price band. A half sourced multiple is worse than no multiple.",
            },
          ].map((c) => (
            <div key={c.h} className="bg-card p-5">
              <dt className="font-display text-lg tracking-tight">{c.h}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-muted">{c.b}</dd>
            </div>
          ))}
        </dl>
      </section>
    </main>
  );
}
