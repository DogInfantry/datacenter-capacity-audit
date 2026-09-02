"use client";

import Link from "next/link";
import type { AnantRaj } from "@/lib/schema";
import { anantRajRiskMeasures, pillarCoverage } from "@/lib/diagnostics/risk";
import { cashConversion, dataCentreArm } from "@/lib/diagnostics/anantraj";
import { Exhibit } from "./Exhibits";
import { CapexVsCfo } from "./CapexVsCfo";
import { DataCentreArm } from "./DataCentreArm";
import { RiskMatrix } from "./RiskMatrix";
import { Icon, StatTile } from "./Visual";
import { Logo } from "./Logo";

type Props = {
  /** The schema type rather than a hand written copy of it. A copy drifts the
   *  moment the data file gains a field, which is how a register ends up
   *  validated at build and rendered on no page. */
  data: AnantRaj;
  /** Sify's rungs, for the cross company comparison. */
  sify: { rung: string; mw: number }[];
  /** The same question asked of the operator with a filed prospectus, derived
   *  from its restated cash flow rather than written down here. */
  sifyCover: { multiple: number; periods: number };
};

const TONE: Record<string, string> = {
  AMBITION: "var(--rung-1)",
  CLAIMED: "var(--rung-2)",
  DELIVERED: "var(--accent-deep)",
};

/**
 * Anant Raj, the delivery case.
 *
 * Two tiers of evidence run down this page and every exhibit says which it is
 * standing on. The capacity ladder and the source conflict come from a research
 * note. The composition, the data centre arm and the cash conversion below it
 * come from the audited annual report and cite their printed pages.
 *
 * What the group still does not publish stays listed at the foot of the page
 * rather than in a footnote, because a single reportable segment makes several
 * of the measures that matter for an operator unavailable rather than missing,
 * and a page that says which is worth more than one that quietly omits them.
 */
export function AnantRajBody({ data, sify, sifyCover }: Props) {
  const [announced, operational, handed] = data.ladder;
  // Counted rather than written into the title, so the sentence shortens by
  // itself the first time a document is read for this name.
  const covered = pillarCoverage(data.risks.rows).filter((p) => p.count > 0).length;
  const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six"];
  // The schema guarantees one claimed rung and that the parts sum to it, so the
  // subtraction below is the report's own arithmetic rather than an estimate.
  const ar = data.annualReport;
  // The subsidiary that holds the capacity above, against the group that
  // owns it. Both figures are the report's own and are printed twice.
  const arm = dataCentreArm(data.financials);
  // Capital spending against the cash the year produced, twice, because the
  // statement's own classification changes the answer.
  const cc = cashConversion(data.financials);
  const claimed = ar.rungs.find((r) => r.kind === "CLAIMED")!;
  const arLive = ar.rungs.find((r) => r.rung === "Operationalised")!;
  const arColo = ar.rungs.find((r) => r.rung === "Operationalised colocation")!;
  const notYet = ar.composition.filter((c) => !c.operational).reduce((t, c) => t + c.mw, 0);
  const max = announced.mw;
  const conflictMax = Math.max(data.conflict.a.value, data.conflict.b.value);

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
              {data.role} · capacity ladder {data.ladderSource.verification.toLowerCase()}, annual
              report {data.annualReport.fiscalYear} read for capacity, the audit opinion and the
              consolidated statements
            </p>
          </div>
        </div>

        <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          {announced.mw} megawatts announced.
          <br />
          {handed.mw} actually handed over.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          The same problem as the rest of this sector, in a different vocabulary. Sify calls the gap
          built against sold. Here it is announced against operational against handed over, and the
          drop between the last two sits inside a number the company already calls operational.
        </p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          <StatTile
            icon="datacentre"
            label="Announced"
            value={`${announced.mw}`}
            unit="MW"
            note={`Target by ${data.targetFiscalYear}, against roughly ${data.capexUsdBn} billion dollars of capex.`}
          />
          <StatTile
            icon="power"
            label="Called operational"
            value={`${operational.mw}`}
            unit="MW"
            note={`${data.sites.map((s) => `${s.name} ${s.operationalMW}`).join(", ")}.`}
          />
          <StatTile
            icon="contract"
            label="Handed over"
            value={`${handed.mw}`}
            unit="MW"
            note="The rest was still in the handover process."
            tone="signal"
          />
          <StatTile
            icon="warning"
            label="Delivered"
            value={`${((handed.mw / announced.mw) * 100).toFixed(1)}%`}
            unit="of announced"
            note="Handed over as a share of the target."
            tone="signal"
          />
        </dl>
      </section>

      <section className="space-y-6 border-t border-line py-12">
        <Exhibit
          n={1}
          title="Each rung is a different question, and only the last one earns"
          units="Megawatts. Bar length is proportional; the drop between rungs is the finding."
          source={data.ladderSource.label}
        >
          <ul className="space-y-4">
            {data.ladder.map((r) => (
              <li key={r.rung}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="text-sm font-medium">{r.rung}</span>
                  <span className="tnum text-sm">{r.mw} MW</span>
                </div>
                <div className="mt-1.5 h-7 w-full rounded-sm bg-grid">
                  <div
                    className="h-7 rounded-sm transition-[width] duration-500"
                    style={{ width: `${(r.mw / max) * 100}%`, background: TONE[r.kind] }}
                  />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted">{r.definition}</p>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-line pt-3 text-sm leading-relaxed text-muted">
            From announced to operational is a{" "}
            <span className="tnum text-foreground">
              {(100 - (operational.mw / announced.mw) * 100).toFixed(0)}
            </span>{" "}
            per cent drop. From operational to handed over is another{" "}
            <span className="tnum text-signal">
              {(100 - (handed.mw / operational.mw) * 100).toFixed(0)}
            </span>{" "}
            per cent, and that one is hidden inside a figure already described as operational.
          </p>
        </Exhibit>

        <div className="grid gap-6 lg:grid-cols-2">
          <Exhibit
            n={2}
            title="The same gap, two companies, two vocabularies"
            units="Each estate indexed to its own widest rung = 100."
            source="Anant Raj from the research note; Sify from its draft red herring prospectus, printed pages 49 and 301."
          >
            <div className="space-y-5">
              {[
                { name: data.listedParent, rows: data.ladder.map((r) => ({ k: r.rung, v: r.mw })) },
                { name: "Sify Infinit Spaces", rows: sify.map((r) => ({ k: r.rung, v: r.mw })) },
              ].map((co) => {
                const top = co.rows[0].v;
                return (
                  <div key={co.name}>
                    <p className="text-sm font-medium">{co.name}</p>
                    <ul className="mt-2 space-y-1.5">
                      {co.rows.map((r, i) => (
                        <li
                          key={r.k}
                          className="grid grid-cols-[6.5rem_1fr_2.75rem] items-center gap-2 text-xs"
                        >
                          <span className="truncate text-muted">{r.k}</span>
                          <span className="block h-4 rounded-sm bg-grid">
                            <span
                              className="block h-4 rounded-sm"
                              style={{
                                width: `${(r.v / top) * 100}%`,
                                background: `var(--rung-${i === 0 ? 1 : i === 1 ? 2 : 4})`,
                              }}
                            />
                          </span>
                          <span className="text-right tnum text-muted">
                            {((r.v / top) * 100).toFixed(0)}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 border-t border-line pt-3 text-sm leading-relaxed text-muted">
              Sify keeps{" "}
              <span className="tnum text-foreground">
                {((sify[2].mw / sify[0].mw) * 100).toFixed(0)}
              </span>{" "}
              per cent of its widest number by the time it reaches revenue. Anant Raj keeps{" "}
              <span className="tnum text-signal">
                {((handed.mw / announced.mw) * 100).toFixed(1)}
              </span>{" "}
              per cent. One is measuring a built estate and the other a plan, and the words do not
              warn you which.
            </p>
          </Exhibit>

          <Exhibit
            n={3}
            title="Two sources disagree by a quarter of the estate"
            units="Operational capacity, megawatts. Both figures recorded, neither averaged."
            source={data.ladderSource.label}
          >
            <div className="space-y-4">
              {[data.conflict.a, data.conflict.b].map((c, i) => (
                <div key={c.source}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-sm tnum">{c.value} MW</span>
                    <span
                      className={
                        "rounded-sm border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wide " +
                        (i === 0 ? "text-accent" : "text-muted")
                      }
                    >
                      {i === 0 ? "carried" : "also recorded"}
                    </span>
                  </div>
                  <div className="mt-1.5 h-5 w-full rounded-sm bg-grid">
                    <div
                      className="h-5 rounded-sm"
                      style={{
                        width: `${(c.value / conflictMax) * 100}%`,
                        background: i === 0 ? "var(--rung-2)" : "var(--rung-1)",
                      }}
                    />
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{c.source}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 flex gap-2 border-t border-line pt-3 text-sm leading-relaxed text-muted">
              <span className="mt-0.5 shrink-0 text-signal">
                <Icon name="warning" size={16} />
              </span>
              <span>{data.conflict.note}</span>
            </p>
          </Exhibit>
        </div>

        <Exhibit
          n={4}
          title={`${WORDS[covered]} of the six forensic pillars carry a row, and the rest name the one document that carries them`}
          units="Severity against likelihood, an analyst grading rather than the company's. A chip is filled where the magnitude is derived from the figures recorded for this name and outlined where the row is judgement. No row in this register cites a printed page."
          source={data.ladderSource.label}
        >
          <RiskMatrix register={data.risks} measures={anantRajRiskMeasures(data)} />
        </Exhibit>

        <Exhibit
          n={5}
          title={`The ${claimed.mw} MW everyone repeats is ${arLive.mw} MW operational and ${notYet} MW that is not`}
          units={`Megawatts of IT load, from the company's own annual report for ${data.annualReport.fiscalYear}. The headline figure and the parts it is made of are both printed in that report, on different pages, and it never subtracts one from the other.`}
          source={data.annualReport.compositionSource.label}
          page={data.annualReport.compositionSource.page}
        >
          <ul className="space-y-1.5">
            {data.annualReport.composition.map((c) => (
              <li
                key={c.part}
                className="grid grid-cols-[1fr_3.5rem] items-center gap-3 text-xs sm:grid-cols-[1fr_4rem]"
              >
                <span className="min-w-0">
                  <span className="relative block h-6 rounded-sm bg-grid">
                    <span
                      className="absolute inset-y-0 left-0 rounded-sm"
                      style={{
                        width: `${(c.mw / claimed.mw) * 100}%`,
                        background: c.operational ? "var(--rung-4)" : "var(--rung-1)",
                        border: c.operational ? "none" : "1px solid var(--signal)",
                      }}
                    />
                    <span className="absolute inset-y-0 left-2 flex items-center text-[11px] text-foreground">
                      {c.part}
                    </span>
                  </span>
                </span>
                <span className="text-right tnum text-muted">{c.mw} MW</span>
              </li>
            ))}
          </ul>

          <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The highlights page prints <span className="tnum text-foreground">{claimed.mw}</span> MW
            beside the words{" "}
            <span className="text-foreground">&ldquo;{claimed.rung.toLowerCase()}&rdquo;</span>. The
            qualifier is the half that does not travel. Two pages earlier the same report says what
            is actually operational: <span className="tnum text-foreground">{arLive.mw}</span>{" "}
            MW at Manesar, of which{" "}
            <span className="tnum text-foreground">
              {(arLive.mw - arColo.mw).toFixed(1)}
            </span>{" "}
            MW is cloud services rather than colocation.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            This also settles the disagreement drawn above. The two figures recorded there,{" "}
            <span className="tnum text-foreground">{data.conflict.a.value}</span> and{" "}
            <span className="tnum text-foreground">{data.conflict.b.value}</span>, were never a
            contradiction. One is Manesar alone, operational plus ready. The other adds Panchkula.
            They are two rungs of the same ladder, and neither of them is the operational figure.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The audit opinion on this report is{" "}
            <span className="text-foreground">
              {data.annualReport.auditOpinion.type.toLowerCase()}
            </span>
            , from {data.annualReport.auditOpinion.auditor}.{" "}
            {data.annualReport.auditOpinion.scope}, at printed page{" "}
            <span className="tnum">{data.annualReport.auditOpinion.page}</span>. The consolidated
            statements it covers are set out below.
          </p>
        </Exhibit>

        <Exhibit
          n={6}
          title={`The data centre arm is ${arm.turnoverSharePct.toFixed(1)} per cent of group revenue, and it loses money`}
          units={`Squares are rupees of consolidated revenue, one hundred in total. Amounts in ${data.financials.unit}, the unit the statements print, converted nowhere.`}
          source={`${data.financials.dataCentreArm.source.label}, printed page ${arm.subsidiaryPage}, and note 48 to the consolidated financial statements, printed page ${arm.groupTablePage}.`}
        >
          <DataCentreArm
            entity={arm.entity}
            holdingPct={arm.holdingPct}
            turnover={arm.turnover}
            groupRevenue={arm.groupRevenue}
            turnoverSharePct={arm.turnoverSharePct}
            pat={arm.pat}
            groupPat={arm.groupPat}
            netAssets={arm.netAssets}
            totalAssets={arm.totalAssets}
            totalLiabilities={arm.totalLiabilities}
            subsidiaryPage={arm.subsidiaryPage}
            groupTablePage={arm.groupTablePage}
            unit={data.financials.unit}
            fiscalYear={data.financials.fiscalYear}
          />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The megawatts at the top of this page belong to {arm.entity}. In the year read it turned
            over <span className="tnum text-foreground">{arm.turnover.toLocaleString("en-IN")}</span>{" "}
            {data.financials.unit} against the group&apos;s{" "}
            <span className="tnum text-foreground">{arm.groupRevenue.toLocaleString("en-IN")}</span>,
            lost <span className="tnum text-signal">{Math.abs(arm.pat).toLocaleString("en-IN")}</span>{" "}
            while the group made{" "}
            <span className="tnum text-foreground">{arm.groupPat.toLocaleString("en-IN")}</span>, and
            closed the year with liabilities exceeding assets by{" "}
            <span className="tnum text-signal">
              {Math.abs(arm.netAssets).toLocaleString("en-IN")}
            </span>
            .
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            None of that appears in the group income statement. Note 40, at printed page{" "}
            <span className="tnum">{arm.segmentPage}</span>, reads:{" "}
            <span className="text-foreground">&ldquo;{data.financials.segment.quote}&rdquo;</span>{" "}
            There is one reportable segment and it is {data.financials.segment.description}, so no
            data centre revenue, margin or asset line is published anywhere in the consolidated
            accounts. The capacity is disclosed in the corporate overview. The economics of it are
            disclosed only as one column in a statement of subsidiaries.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The same note records that{" "}
            <span className="text-foreground">
              &ldquo;{data.financials.segment.customerConcentrationQuote}&rdquo;
            </span>{" "}
            That is the opposite shape to the other operator read here, where three counterparties
            are two thirds of revenue. Selling homes to many buyers and selling megawatts to a few
            hyperscalers are different businesses, and this company&apos;s revenue is still almost
            entirely the first one.
          </p>
        </Exhibit>

        <Exhibit
          n={7}
          title={`Capital spending was ${cc.coverFiled.toFixed(2)} times the cash operations produced, or ${cc.coverRestated.toFixed(2)}, depending on where one line sits`}
          units={`Amounts in ${data.financials.unit}, the unit the consolidated statements print, converted nowhere. Capital expenditure is the four lines the investing section prints, summed. Both bars on the left are the year as filed; both on the right are the same year with one working capital line taken back out.`}
          source={`${data.financials.cashFlow.source.label} Printed pages ${cc.operating.page} and ${cc.financing.page}.`}
        >
          <CapexVsCfo
            unit={data.financials.unit.replace("INR", "Rs")}
            precision={2}
            rows={[
              { label: "As filed", cfo: cc.filed, capex: cc.capex },
              { label: "Borrowings line removed", cfo: cc.restated, capex: cc.capex },
            ]}
            aria={`Capital expenditure of ${cc.capex.toFixed(0)} against operating cash flow of ${cc.filed.toFixed(0)} as filed and ${cc.restated.toFixed(0)} with the movement in current borrowings removed, in ${data.financials.unit}.`}
            note={`Capital expenditure is the same in both pairs and is the sum of ${cc.capexLines.length} lines: ${cc.capexLines.map((l) => l.label.toLowerCase()).join(", ")}.`}
          />

          <div className="mt-6 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2">
            {[cc.operating, cc.financing].map((sec) => (
              <div key={sec.section} className="bg-card p-4">
                <p className="sc text-accent">{sec.section}</p>
                <p className="mt-2 text-sm leading-snug text-foreground">
                  &ldquo;{sec.printedAs}&rdquo;
                </p>
                <p className="mt-2 tnum text-2xl">
                  {Math.abs(sec.amount).toLocaleString("en-IN", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted">
                  Outflow, printed page <span className="tnum">{sec.page}</span>. The year before
                  carries{" "}
                  <span className="tnum">
                    {Math.abs(sec.prior).toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>{" "}
                  on the same line.
                </p>
              </div>
            ))}
          </div>

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Capital expenditure was{" "}
            <span className="tnum text-foreground">
              {cc.capex.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>{" "}
            {data.financials.unit}. Against the operating cash flow the statement files,{" "}
            <span className="tnum text-foreground">
              {cc.filed.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            , the spending is{" "}
            <span className="tnum text-signal">{cc.coverFiled.toFixed(2)}</span> times the cash. Take
            the borrowings movement back out and operating cash flow is{" "}
            <span className="tnum text-foreground">
              {cc.restated.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            , and the same spending is{" "}
            <span className="tnum text-foreground">{cc.coverRestated.toFixed(2)}</span> times it. The
            building did not change size. One line changed section.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Borrowings reach a reader twice in this statement. The movement in them sits among the
            working capital adjustments inside operating activities at printed page{" "}
            <span className="tnum">{cc.operating.page}</span>, and the repayment of them appears
            again under finance activities on the page after it. Both filed years do it, so the
            classification is a habit rather than a one year effect.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The other operator read here, whose figures come from a filed prospectus, absorbed{" "}
            <span className="tnum text-foreground">{sifyCover.multiple.toFixed(2)}</span> times the
            cash its operations produced across{" "}
            <span className="tnum text-foreground">{sifyCover.periods}</span> filed periods. That is
            a capital programme outrunning the business by a wide margin, and it is visible without
            reclassifying anything. What sits on this page is narrower and turns on where a line is
            printed rather than on how much was spent.
          </p>
        </Exhibit>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">What the report still does not carry</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          A segment that does not exist cannot be measured
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The group publishes one segment, so several of the measures that matter for a data
          centre operator have no published value for this company at any level of detail. A
          margin, a return on capital or a revenue per megawatt for the arm would each need a
          numerator the report does not print.
        </p>
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
            Sify is the name with the deepest disclosure here
          </Link>
          , and the difference in what can be said about the two is the difference between a headline
          and a filed statement.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Announced capacity is an ambition, not a result. The capacity ladder here is secondary,
        from a research note. The annual report block is primary and cites its printed pages. Every
        figure carries its tag. Educational and portfolio work, not investment advice.
      </footer>
    </div>
  );
}
