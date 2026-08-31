"use client";

import Link from "next/link";
import type { AnantRaj } from "@/lib/schema";
import { anantRajRiskMeasures, pillarCoverage } from "@/lib/diagnostics/risk";
import { Exhibit } from "./Exhibits";
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
};

const TONE: Record<string, string> = {
  AMBITION: "var(--rung-1)",
  CLAIMED: "var(--rung-2)",
  DELIVERED: "var(--accent-deep)",
};

/**
 * Anant Raj, the delivery case.
 *
 * The page carries capacity and delivery and nothing else. There is no margin,
 * no return and no cost stack, because the annual report was read for capacity
 * and for the audit opinion only and the financial statements inside it were
 * not. The list of what was not read sits on the page rather than in a
 * footnote, because a thin page that admits its thinness is worth more than a
 * thick one that does not.
 */
export function AnantRajBody({ data, sify }: Props) {
  const [announced, operational, handed] = data.ladder;
  // Counted rather than written into the title, so the sentence shortens by
  // itself the first time a document is read for this name.
  const covered = pillarCoverage(data.risks.rows).filter((p) => p.count > 0).length;
  const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six"];
  // The schema guarantees one claimed rung and that the parts sum to it, so the
  // subtraction below is the report's own arithmetic rather than an estimate.
  const ar = data.annualReport;
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
              report {data.annualReport.fiscalYear} read for capacity and the audit opinion
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
            <span className="tnum">{data.annualReport.auditOpinion.page}</span>. The financial
            statements in the same document are not cited here, and the register above carries no row
            for cash conversion or the balance sheet.
          </p>
        </Exhibit>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">Where the rest of the numbers are</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          The capacity is filed. The economics sit in the accounts.
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The capacity ladder and the audit opinion above come from the annual report for
          FY2024-25 and carry their printed pages. Margin, return on capital, the cost stack and
          client concentration are not among them. Each one sits in the audited financial statements
          inside that same report.
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
