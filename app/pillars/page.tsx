import type { Metadata } from "next";
import Link from "next/link";
import { companies, sisl, sifyCo, disclosureRegister, e2e, technoe, macro } from "@/lib/data";
import { growthQuality, earningsQuality } from "@/lib/diagnostics/e2e";
import { RevenueQuality } from "@/components/RevenueQuality";
import { refusalRate, pressurePerCall } from "@/lib/diagnostics/disclosure";
import { DisclosureRates } from "@/components/DisclosureRates";
import { armAgainstParent, peerCashConversion } from "@/lib/diagnostics/cashQuality";
import { leverage } from "@/lib/diagnostics/capital";
import { CASH_CONVERSION } from "@/lib/config";
import { Exhibit } from "@/components/Exhibits";
import { PeerCashConversion } from "@/components/PeerCashConversion";
import { Leverage } from "@/components/Leverage";
import { contractedCapital, struckOffDenial, segmentAbsence } from "@/lib/diagnostics/technoe";
import { ContractedCapital } from "@/components/ContractedCapital";
import { supplierFinance } from "@/lib/diagnostics/supplierFinance";
import { SupplierFinance } from "@/components/SupplierFinance";
import { payablesAgeing } from "@/lib/diagnostics/payables";
import { PayablesAgeing } from "@/components/PayablesAgeing";

export const metadata: Metadata = {
  title: "Pillars",
  description:
    "Four of the brief's six forensic pillars, built. Cash conversion across every filer whose statements are machine readable, leverage on both readings of a lease liability the filing never defines, revenue quality on the one covered name that publishes no capacity at all, and governance on the filer whose contracted capital buys a fifth of a megawatt against a 250 megawatt target.",
};

/**
 * The forensic scorecard, three pillars in.
 *
 * The brief asks for six. This route carries the three that have been built and
 * names the three that have not, rather than shipping empty headings that would
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

  // Ranked by refusal rate so the page can name the least and the most
  // forthcoming without either being typed into the prose.
  const reg = [...disclosureRegister.companies].sort(
    (a, b) => refusalRate(a).rate - refusalRate(b).rate,
  );
  const leastRefusing = reg[0];
  const mostRefusing = reg[reg.length - 1];
  const grow = growthQuality(e2e);
  const earn = earningsQuality(e2e);
  const mostAsked = [...reg].sort(
    (a, b) => pressurePerCall(b).perCall - pressurePerCall(a).perCall,
  )[0];
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

  const capex = macro.unitEconomics.capexCrPerMW;
  const ct = contractedCapital(technoe, capex.low, capex.high);
  const so = struckOffDenial(technoe);
  const seg = segmentAbsence(technoe);
  const sfd = supplierFinance(technoe);
  const sf2 = technoe.supplierFinance;
  const payd = payablesAgeing(technoe);
  const pay2 = technoe.payables;

  return (
    <main className="mx-auto w-full max-w-5xl px-5 py-12">
      <p className="sc text-accent">The forensic scorecard</p>
      <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight tracking-tight">
        Net income is an opinion. Cash is a fact. One of these filers cannot be asked the
        question at all.
      </h1>
      <p className="mt-5 max-w-2xl leading-relaxed text-muted">
        Cash conversion is the first of the brief&rsquo;s six pillars to be built, the balance
        sheet is the second, revenue quality is the third and governance is the fourth. Eight
        exhibits, and the last three read one annual report that had been opened once for
        megawatts alone. The first runs two measures of one
        idea and reports them side by side rather than averaging them, because they can disagree
        and the disagreement is worth more than either verdict alone. The bands are published on{" "}
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

        <Exhibit
          n={4}
          title={`${leastRefusing.name} refuses least of the three, and the reason it can is that nobody asks it much`}
          units={`Questions pressed on unit economics and how many were refused, over ${disclosureRegister.window.start} to ${disclosureRegister.window.end}. Bars are on one scale, so the width is the asking and the filled part is the refusing. Only a declined or deflected answer counts as a refusal; a partial answer is an answer.`}
          source={`Earnings call transcripts across ${reg.reduce((t, c) => t + c.callsCovered, 0)} calls. ${disclosureRegister.familyNote} ${disclosureRegister.window.note}`}
        >
          <DisclosureRates companies={reg} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The expected shape of this measure is an Indian operator that says less than its global
            peers. It runs the other way.{" "}
            <span className="text-foreground">{leastRefusing.name}</span> refuses{" "}
            <span className="tnum text-foreground">{refusalRate(leastRefusing).refused}</span> of{" "}
            <span className="tnum text-foreground">{refusalRate(leastRefusing).pressed}</span>{" "}
            questions on its own unit economics.{" "}
            <span className="text-foreground">{mostRefusing.name}</span> refuses{" "}
            <span className="tnum text-foreground">{refusalRate(mostRefusing).refused}</span> of{" "}
            <span className="tnum text-foreground">{refusalRate(mostRefusing).pressed}</span>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The rate alone would still mislead, which is why the denominator is the bar rather than
            a footnote. <span className="text-foreground">{mostAsked.name}</span> is asked{" "}
            <span className="tnum text-foreground">
              {pressurePerCall(mostAsked).perCall.toFixed(2)}
            </span>{" "}
            unit economics questions a call against{" "}
            <span className="tnum text-foreground">
              {pressurePerCall(leastRefusing).perCall.toFixed(2)}
            </span>
            . A company nobody presses has little to refuse. The sharpest single instance runs
            against the thesis too: asked for realisation per megawatt, the Indian operator declined
            and then described the reverse working, which is the calculation this analysis performs.
            The company confirmed the method in its own words while declining the number.
          </p>
        </Exhibit>

        <Exhibit
          n={5}
          title={`A year reported up ${grow.reportedGrowthPct.toFixed(0)} per cent ends at a rate that annualises ${grow.shortfallPct.toFixed(0)} per cent below it`}
          units={`${e2e.entity}, ${e2e.fiscalYear}. The top three bars are crore of revenue on one scale. The bar beneath them is the profit before tax, split into what the operations produced and what arrived as other income, in ${e2e.unit}. Both units are as the report prints them, two pages apart, and neither is converted into the other.`}
          source={e2e.source.label}
          page={e2e.source.page}
        >
          <RevenueQuality growth={grow} earnings={earn} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            This is the coverage name with no capacity to measure. Its report states no megawatt and
            no kilowatt in{" "}
            <span className="tnum text-foreground">{e2e.pagination.pdfPages}</span> pages, and it is
            a tenant in someone else&rsquo;s hall rather than an operator, so the question this
            analysis usually asks cannot be put to it. Two questions can, and both come out of
            figures it prints itself.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The first is where in the year the growth happened. The only operating rate the company
            publishes is monthly recurring revenue, in its own words:{" "}
            <span className="text-foreground">&ldquo;{grow.quote}&rdquo;</span> That is{" "}
            <span className="tnum text-foreground">{grow.exitGrowthPct.toFixed(2)}</span> per cent
            against a year reported up{" "}
            <span className="tnum text-foreground">{grow.reportedGrowthPct.toFixed(2)}</span>. A
            year of that shape has its growth behind it rather than in front.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The second is where the profit came from. Other income of{" "}
            <span className="tnum text-foreground">
              {earn.otherIncomeLakh.toLocaleString("en-US")}
            </span>{" "}
            is{" "}
            <span className="tnum text-foreground">
              {earn.otherOverOperating?.toFixed(2) ?? "not comparable"}
            </span>{" "}
            times the{" "}
            <span className="tnum text-foreground">
              {earn.operatingLakh.toLocaleString("en-US")}
            </span>{" "}
            the business made before tax, and{" "}
            <span className="tnum text-foreground">{earn.otherShareOfPbtPct.toFixed(0)}</span> per
            cent of the profit before tax. The report gives the figure and never its composition.
            The same summary table is printed twice, in the directors&rsquo; report and again in the
            management discussion, with identical figures and no explanation in either.
          </p>
        </Exhibit>

        <Exhibit
          n={6}
          title={`The target is ${ct.targetMW} megawatts. The contracts signed for capital spending buy ${ct.mwHigh.toFixed(2)}.`}
          units="Three lines from one annual report, in millions of rupees, none of them converted. The megawatt band underneath divides the contracted capital by the sector build cost of 60 to 70 crore per megawatt, which is a sector figure rather than this filer's, because no operator in this coverage publishes its own."
          source={`${technoe.commitments.source.label}. The auditor's paragraph is quoted from the independent auditor's report on the standalone financial statements.`}
          page={technoe.commitments.consolidatedPage}
        >
          <ContractedCapital data={ct} segment={seg} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The capacity target and the campus megawatts are management commentary, printed in the
            management discussion. The three bars are audited. Setting them beside each other is the
            whole measure: the only line in either set of accounts recording contracts for future
            capital spending is{" "}
            <span className="tnum text-foreground">{ct.contingentOverCommitment.toFixed(2)}</span>{" "}
            times smaller than the tax the company is disputing, and{" "}
            <span className="tnum text-foreground">{ct.overdueOverCommitment.toFixed(2)}</span> times
            smaller than the balances its auditor drew attention to as substantially overdue and
            carrying no impairment provision.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            The commitment did rise, from{" "}
            <span className="tnum text-foreground">{ct.commitmentPriorMn.toFixed(2)}</span> million a
            year earlier to <span className="tnum text-foreground">{ct.commitmentMn.toFixed(2)}</span>
, a fourfold rise on a base small enough that fourfold changes
            nothing. The smallest campus the report names, {ct.smallestCampusName} at{" "}
            <span className="tnum text-foreground">{ct.smallestCampusMW}</span> MW, costs{" "}
            <span className="tnum text-foreground">
              {ct.smallestCampusOverCommitment.toFixed(0)}
            </span>{" "}
            times the whole commitment at the low end of the sector rate.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            The struck off disclosure on the same filer runs to{" "}
            <span className="tnum text-foreground">{so.count}</span> counterparty, a{" "}
            {so.largest.natureWords.toLowerCase()} balance of{" "}
            <span className="tnum text-foreground">{so.largest.amountMn.toFixed(2)}</span> million
            with {so.largest.name}, against eleven on the other annual report read here. The
            consolidated note numbers two clauses ({so.clauseNumeral}). The first tables that
            balance. The second reads, in full, &ldquo;{so.denialQuote}&rdquo; Printed page{" "}
            {so.consolidatedPage}.
          </p>
        </Exhibit>

        <Exhibit
          n={7}
          title={`A liability moved from payables to borrowings, and the cash flow statement records nothing moving`}
          units="Two payment ranges on one scale of days, then one reported balance split by how it arrived. Millions of rupees, from the standalone statements, converted nowhere. The disclosure exists because amendments to Ind AS 7 and Ind AS 107 were notified partway through the year the report covers."
          source={sf2.source.label}
        >
          <SupplierFinance data={sfd} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Supplier finance pays a vendor early and collects from the buyer later. The buyer&rsquo;s
            own terms lengthen and the obligation stops being a trade payable. Here the terms roughly
            double, from{" "}
            <span className="tnum text-foreground">{sfd.comparableDays.low}</span> to{" "}
            <span className="tnum text-foreground">{sfd.comparableDays.high}</span> days to{" "}
            <span className="tnum text-foreground">{sfd.arrangementDays.low}</span> to{" "}
            <span className="tnum text-foreground">{sfd.arrangementDays.high}</span>, and{" "}
            <span className="tnum text-foreground">
              {sfd.shareOfStandaloneBorrowingsPct.toFixed(0)}
            </span>{" "}
            per cent of everything the standalone reports as current borrowings arrived by that move
            rather than by borrowing.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            The company classified it under borrowings rather than leaving it among payables, which is
            the stricter of the two treatments and cuts against the reading above. Both are on the
            page for that reason. What the treatment cannot do is put the lengthening into the cash
            flow statement: the transfer is non cash, so neither operating nor financing activities
            record it, and the same figure covers{" "}
            <span className="tnum text-foreground">
              {sfd.shareOfConsolidatedRisePct?.toFixed(0) ?? "not comparable"}
            </span>{" "}
            per cent of the rise in consolidated current borrowings across the year.
          </p>
        </Exhibit>

        <Exhibit
          n={8}
          title={`One note places the whole micro and small enterprise balance past its due date. The next reports nil interest, five times over.`}
          units="Millions of rupees from the standalone statements, converted nowhere. The ageing columns run from the due date of payment rather than from the invoice date, so every column except the first holds amounts already late."
          source={pay2.source.label}
        >
          <PayablesAgeing data={payd} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Interest on a payment made after the appointed day is automatic under the Act rather than
            something a supplier has to claim. The filing reports{" "}
            <span className="tnum text-foreground">{payd.nilClauseCount}</span> of{" "}
            <span className="tnum text-foreground">{payd.clauses.length}</span> clauses as nothing, in
            both years, one printed page after the table that placed{" "}
            <span className="tnum text-foreground">{payd.msmePrincipalMn.toFixed(2)}</span> million
            past its due date. This is the second time in one document that a clause tables a balance
            and a neighbouring clause says there is none to table.
          </p>

          <p className="mt-4 text-sm leading-relaxed text-muted">
            What the table cannot settle is stated with it rather than left out. The shortest overdue
            bucket runs to a year and the appointed day is forty five days, so the balance being past
            its due date is not the same as every rupee of it having passed the day the statute names.
            The five clauses are what report that none of it did.
          </p>
        </Exhibit>
      </div>

      <section className="mt-12 border-t border-line pt-8">
        <p className="sc text-accent">What is not here</p>
        <h2 className="mt-3 max-w-3xl font-display text-2xl leading-tight tracking-tight">
          Five pillars, and how far each one has got
        </h2>
        <dl className="mt-6 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
          {[
            {
              h: "Governance",
              b: "Three names now. The materiality threshold, the associate exposure and the key management coverage on the operator whose prospectus is read page by page, eleven struck off counterparties on the second, and on the third, in Exhibit 6 above, an emphasis of matter over overdue balances and a statutory note that tables a struck off balance in one clause and denies having one in the next. The three United States filers have had no governance section opened.",
            },
            {
              h: "Revenue quality",
              b: "Two results, in Exhibit 4 and Exhibit 5 above. Customer concentration is read for the two Indian operators, and one of them states the same concentration in three sections including an audited note, all agreeing exactly. Growth quality is read for a third, whose exit run rate annualises below the year it reported. Pricing, contract duration and churn are unread for every filer.",
            },
            {
              h: "Balance sheet",
              b: "Built for the operator whose statements are read page by page, in Exhibit 3 above, and opened on a second name in Exhibit 7, where a supplier finance arrangement moves a liability from trade payables into borrowings without any cash moving. The five harvested filers have total assets but no borrowings or lease liability split, so leverage cannot yet be asked of them.",
            },
            {
              h: "Business model",
              b: "Rests on segment disclosure, and the segmentation is not like for like across this set. Two filers are pure plays, two segment by industry vertical and one by service line. The sixth, in Exhibit 6 above, discloses no segments at all across 433 printed pages, so the business it calls its most consequential decision in a generation cannot be sized apart from the engineering business funding it.",
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
