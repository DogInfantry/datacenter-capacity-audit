"use client";

import Link from "next/link";
import type { AnantRaj } from "@/lib/schema";
import { anantRajRiskMeasures, pillarCoverage } from "@/lib/diagnostics/risk";
import { Exhibit } from "./Exhibits";
import { RiskMatrix } from "./RiskMatrix";
import { Icon, Monogram, StatTile } from "./Visual";

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
 * No filing has been read for this name, so the page carries capacity and
 * delivery and nothing else. There is no margin, no return, no cost stack, and
 * the list of what was not read sits on the page rather than in a footnote,
 * because a thin page that admits its thinness is worth more than a thick one
 * that does not.
 */
export function AnantRajBody({ data, sify }: Props) {
  const [announced, operational, handed] = data.ladder;
  // Counted rather than written into the title, so the sentence shortens by
  // itself the first time a document is read for this name.
  const covered = pillarCoverage(data.risks.rows).filter((p) => p.count > 0).length;
  const WORDS = ["No", "One", "Two", "Three", "Four", "Five", "Six"];
  const max = announced.mw;
  const conflictMax = Math.max(data.conflict.a.value, data.conflict.b.value);

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-5">
      <section className="py-12 sm:py-16">
        <div className="flex items-center gap-3">
          <Monogram name={data.listedParent} size={34} />
          <div>
            <p className="sc text-accent">
              {data.listedParent} · {data.exchange} {data.ticker}
            </p>
            <p className="text-xs text-muted">
              {data.role} · sourcing {data.ladderSource.verification.toLowerCase()}, no filing read
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
          title={`${WORDS[covered]} of the six forensic pillars carry a row, and the rest name the one document that would fill them`}
          units="Severity against likelihood, graded by this project. A chip is filled where the magnitude is derived from the figures recorded for this name and outlined where the row is judgement. Nothing on this page is read from a filing."
          source={data.ladderSource.label}
        >
          <RiskMatrix register={data.risks} measures={anantRajRiskMeasures(data)} />
        </Exhibit>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">What has not been read</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          This page is thin, and says so
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Every figure above comes from a research note. No Anant Raj filing has been opened, so
          there is no margin, no return on capital, no cost stack and no client concentration here.
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
            Sify is the name where the filings were read
          </Link>
          , and the difference in what can be said about the two is the difference between a research
          note and a prospectus.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Announced capacity is an ambition, not a result. Every figure on this page is secondary,
        sourced from a research note rather than a filing, and is tagged as such. Educational and
        portfolio work, not investment advice.
      </footer>
    </div>
  );
}
