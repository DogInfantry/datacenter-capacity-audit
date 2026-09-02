import type { Metadata } from "next";
import Link from "next/link";
import { universe, sisl, prospectus, drhpTriage, invariants, method, macro } from "@/lib/data";
import { verificationTally, citedPages } from "@/lib/diagnostics/sourcing";
import { citedPageRanks } from "@/lib/diagnostics/triage";
import { Exhibit } from "@/components/Exhibits";
import { SourcingTiers, PageGrid } from "@/components/Sourcing";
import { ReadingRule } from "@/components/ReadingRule";
import { InvariantLedger } from "@/components/InvariantLedger";
import { Cite } from "@/components/Cite";
import { CASH_CONVERSION } from "@/lib/config";
import { StatTile, type IconName } from "@/components/Visual";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How far each figure on this site has actually been checked, counted rather than asserted, and every invariant that fails the build when a claim stops being true.",
};

export default function MethodologyPage() {
  const tally = verificationTally(universe.operators);
  const cited = citedPages(sisl, prospectus, macro);
  const total = prospectus.document.pdfPages;
  const readShare = (cited.length / total) * 100;
  const triage = citedPageRanks(drhpTriage.pages, cited);

  // One operator per tier, picked out of the coverage data rather than written
  // down, so a tier that empties stops being demonstrated instead of being
  // faked with a row that no longer belongs to it.
  const tierExamples = (["PRIMARY", "SECONDARY", "UNVERIFIED"] as const)
    .map((v) => universe.operators.find((o) => o.source.verification === v))
    .filter((o) => o !== undefined);

  const tiers: { name: string; count: number; tone: string; rule: string; icon: IconName }[] = [
    {
      name: "Primary",
      count: tally.counts.PRIMARY,
      tone: "var(--accent-deep)",
      icon: "contract",
      rule: "Traced to a document filed with a regulator and cited by its printed page. A schema refinement rejects any row claiming this without naming a filed document, so the tier cannot be awarded by assertion.",
    },
    {
      name: "Secondary",
      count: tally.counts.SECONDARY,
      tone: "var(--rung-2)",
      icon: "client",
      rule: "A figure from company announcements, brokerage notes or press reporting, not yet traced to a filing inside this repository. Most of the coverage sits here, and every row says so.",
    },
    {
      name: "Unverified",
      count: tally.counts.UNVERIFIED,
      tone: "var(--rung-1)",
      icon: "warning",
      rule: "Either the sources disagree or the figure is an estimate rather than a company statement. Nothing is averaged across disagreeing sources and no cell is imputed; the row is downgraded instead.",
    },
  ];

  const rail: { icon: IconName; k: string; v: string; u: string; n: string; tone?: "signal" }[] = [
    {
      icon: "contract",
      k: "Traced to a filing",
      v: `${tally.counts.PRIMARY}`,
      u: `of ${tally.total}`,
      n: "Operators whose capacity figure comes out of a filed document rather than a research note.",
    },
    {
      icon: "datacentre",
      k: "Pages cited",
      v: `${cited.length}`,
      u: `of ${total}`,
      n: `${readShare.toFixed(1)} per cent of the one prospectus this site reads.`,
      tone: "signal",
    },
    {
      icon: "grid",
      k: "Names covered",
      v: `${universe.operators.length + universe.watchlist.length}`,
      u: "in the matrix",
      n: `${universe.operators.length} operators carrying megawatts, ${universe.watchlist.length} on the watchlist measured on something else.`,
    },
    {
      icon: "clock",
      k: "Coverage as at",
      v: universe.asOf,
      u: "",
      n: "Nothing on this site updates itself. Every figure is a snapshot with a date on it.",
    },
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-5">
      <section className="py-12 sm:py-16">
        <p className="sc text-accent">Methodology</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          The evidence base is {cited.length} printed pages.
          <br />
          Here is exactly where it ends.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          This site argues that announced capacity is reported with more confidence than the
          evidence behind it carries. A methodology page that asserted its own rigour would be
          making the same move, so everything below is counted from the data rather than claimed.
          The numbers move when the data does.
        </p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {rail.map((r) => (
            <StatTile
              key={r.k}
              icon={r.icon}
              label={r.k}
              value={r.v}
              unit={r.u || undefined}
              note={r.n}
              tone={r.tone}
            />
          ))}
        </dl>
      </section>

      <section className="space-y-6 border-t border-line py-12">
        <Exhibit
          n={1}
          title={`One operator in ${tally.total} is traced to a filing, and the filing is read on ${cited.length} of its ${total} pages`}
          units={`Left, the ${tally.total} operators by how far each has been checked. Right, the prospectus, one cell per page, with every page this site cites lit.`}
          source={`Verification tags from the coverage data. Cited pages collected from every sourced block in the Sify Infinit Spaces and offer data, as at ${universe.asOf}.`}
        >
          <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <SourcingTiers tiers={tiers} total={tally.total} />
            <PageGrid totalPages={total} cited={cited} offset={drhpTriage.document.pagination.pdfIndexOfPrintedOne - 1} />
          </div>

          <div className="mt-6 border-t border-line pt-4">
            <p className="text-sm leading-relaxed text-muted">
              The tag beside a figure states what kind of claim that figure makes about its own
              evidence, and it is the same tag wherever it appears. One of each, each carrying a
              real row, with the document named on hover:
            </p>
            <p className="mt-3 flex flex-wrap items-baseline gap-x-7 gap-y-3 text-sm">
              {tierExamples.map((o) => (
                <span key={o.ticker} className="text-foreground">
                  {o.operator}
                  <Cite source={o.source} />
                </span>
              ))}
            </p>
          </div>

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Both halves say the same thing from opposite ends. The coverage is wide and thin: of{" "}
            <span className="tnum text-foreground">{tally.total}</span> operators only{" "}
            <span className="tnum text-foreground">{tally.counts.PRIMARY}</span> rests on a filed
            document. Where a filing does exist the reading is narrow and deep,{" "}
            <span className="tnum text-foreground">{cited.length}</span> pages of{" "}
            <span className="tnum text-foreground">{total}</span>, or{" "}
            <span className="tnum text-foreground">{readShare.toFixed(1)}</span> per cent. A
            published rule proposed where to start.{" "}
            <span className="tnum text-foreground">{triage.foundByRule}</span> of those{" "}
            <span className="tnum text-foreground">{cited.length}</span> pages came from it and{" "}
            <span className="tnum text-foreground">{triage.foundByReading}</span> did not, which the
            next exhibit takes apart.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            That is a limit, not a boast. Nothing here supports a claim about the{" "}
            <span className="tnum text-foreground">{total - cited.length}</span> unlit pages, and no
            page on this site makes one.{" "}
            <Link
              href="/universe"
              className="underline decoration-line underline-offset-4 hover:text-accent"
            >
              The tag sits on every row of the coverage matrix
            </Link>
            .
          </p>
        </Exhibit>

        <Exhibit
          n={2}
          title={`The rule put two cited pages at ${triage.rows[0].rank} and ${triage.rows[1].rank}, and buried another at ${triage.rows[triage.rows.length - 1].rank} of ${triage.scored}`}
          units={`Each cited page by its position among the ${triage.scored} scored pages, best first. Score is number density divided by one plus hedge density.`}
          source={`Reading rule applied to every page of the prospectus. ${drhpTriage.method.lexiconNote}`}
        >
          <ReadingRule
            rows={triage.rows}
            scored={triage.scored}
            cutoff={triage.cutoff}
            lexicon={drhpTriage.method.hedgeLexicon}
          />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The rule works exactly where it was designed to and fails exactly where it was not. The
            two pages that define the same capacity figure two different ways rank{" "}
            <span className="tnum text-foreground">{triage.rows[0].rank}</span> and{" "}
            <span className="tnum text-foreground">{triage.rows[1].rank}</span> of{" "}
            <span className="tnum text-foreground">{triage.scored}</span>, because a definition
            footnote is dense with numbers and carries almost no hedging. Finding them was the rule
            doing its job.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The page carrying the contract concentration ranks{" "}
            <span className="tnum text-foreground">
              {triage.rows[triage.rows.length - 1].rank}
            </span>
            , near the bottom. It is a risk factor, so it is thick with the hedging vocabulary the
            score divides by, and a density rule will never surface a finding stated in a sentence.
            That page produced one of the strongest results on this site. It was found by reading
            forward from a table on another page, not by ranking.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            So the rule is a starting point and not a method.{" "}
            <span className="tnum text-foreground">{triage.foundByRule}</span> of the cited pages sit
            in its top decile and <span className="tnum text-foreground">{triage.foundByReading}</span>{" "}
            do not. Published anyway, with the word list, because a triage that is presented as
            complete is worse than one that shows where it stops.
          </p>
        </Exhibit>

        <Exhibit
          n={3}
          title={`${invariants.rows.length} claims are asserted at build time, so a sentence that stops being true stops the build`}
          units={`Every refinement in the schema, grouped by what it is for. Each row names the guard, what it protects, and the message the build emits when it fires.`}
          source="Generated from the schema register. The test suite asserts that every fragment below is still present in the schema source, and that the number of guards in the source equals the number of rows here."
        >
          <InvariantLedger data={invariants} />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The register is checked against the code it describes. Three tests assert that every
            fragment above still appears in the schema, that each one identifies exactly one guard,
            and that the number of guards in the source equals the{" "}
            <span className="tnum text-foreground">{invariants.rows.length}</span> rows listed here.
            A guard added without being written up fails the suite, and so does a row left behind
            after its guard is deleted. Without that, a page publishing its own guarantees is just a
            longer way of asking to be trusted.
          </p>
        </Exhibit>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">The bands a reading is graded against</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          The thresholds are published, so disagreeing means disagreeing with a number
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Cash conversion is the first of the six pillars to be built. These are the bands it
          applies, and they are read from the same file the pages apply, so the rule shown here and
          the rule used to colour a cell cannot drift apart. A build guard fails if a component
          writes a band of its own.
        </p>
        <dl className="mt-7 grid gap-px overflow-hidden rounded-md border border-line bg-line lg:grid-cols-2">
          <div className="bg-card p-5">
            <dt className="font-display text-lg tracking-tight">
              Operating cash to profit after tax
            </dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">
              Flagged below{" "}
              <span className="tnum text-foreground">{CASH_CONVERSION.cfoToPat.amberBelow}</span>,
              serious below{" "}
              <span className="tnum text-foreground">{CASH_CONVERSION.cfoToPat.redBelow}</span>.
              Refused where profit after tax is not positive, because the quotient changes sign
              without the cash changing and a negative reading would sort like a grade.
            </dd>
          </div>
          <div className="bg-card p-5">
            <dt className="font-display text-lg tracking-tight">Sloan accrual ratio</dt>
            <dd className="mt-2 text-sm leading-relaxed text-muted">
              Net income less operating cash less investing cash, over total assets. Outside plus or
              minus{" "}
              <span className="tnum text-foreground">
                {(CASH_CONVERSION.accrualRatio.redOutside * 100).toFixed(0)}
              </span>{" "}
              per cent is the danger line. Its numerator adds investing cash back in, so on an
              operator part way through a build it moves with the size of the build rather than with
              the quality of the earnings. Both measures are shown for that reason and neither is
              called the verdict.
            </dd>
          </div>
        </dl>
        <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted">
          A combined reading is withheld below{" "}
          <span className="tnum text-foreground">
            {CASH_CONVERSION.minimumMetricsForCombined}
          </span>{" "}
          resolved measures rather than averaged over the gap, and the two are never averaged
          against each other. Where they disagree, the disagreement is reported instead, because the
          midpoint of a contradiction is not a finding.
        </p>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">Every formula, with its denominator</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          A rate without a denominator is decoration
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Each measure used anywhere on this site, with the sample it was computed over and the
          reason it is built the way it is. The sample is a required field, so a measure cannot be
          published here without one.
        </p>
        <ul className="mt-7 grid gap-px overflow-hidden rounded-md border border-line bg-line lg:grid-cols-2">
          {method.formulas.map((f) => (
            <li key={f.name} className="bg-card p-5">
              <p className="font-display text-lg tracking-tight">{f.name}</p>
              <p className="mt-2 overflow-x-auto rounded-sm border border-line bg-grid p-2.5 font-mono text-[11px]">
                {f.formula}
              </p>
              <p className="mt-2 text-xs text-muted">
                <span className="exhibit-label">Sample</span> {f.sample}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.note}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">Known limits</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          {method.limits.filter((l) => l.status === "OPEN").length} open,{" "}
          {method.limits.filter((l) => l.status === "CLOSED").length} closed and kept on the page
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          A limits list that only ever grows is a pose. A closed limit has to name what closed it,
          and that is a build invariant rather than a habit, so a limit cannot quietly become
          something that simply stopped being mentioned. One of the closed rows is an error this
          site published and had to correct.
        </p>
        <ul className="mt-7 space-y-3">
          {[...method.limits]
            .sort((a, b) => (a.status === b.status ? 0 : a.status === "OPEN" ? -1 : 1))
            .map((l) => (
              <li key={l.id} className="rounded-md border border-line bg-card p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <span className="exhibit-label">{l.id}</span>
                  <span
                    className={
                      l.status === "OPEN"
                        ? "font-mono text-[11px] text-signal"
                        : "font-mono text-[11px] text-accent"
                    }
                  >
                    {l.status.toLowerCase()}
                  </span>
                </div>
                <p className="mt-1.5 text-sm leading-relaxed">{l.limit}</p>
                {l.closedBy && (
                  <p className="mt-2 border-t border-line pt-2 text-sm leading-relaxed text-muted">
                    <span className="text-accent">Closed by. </span>
                    {l.closedBy}
                  </p>
                )}
              </li>
            ))}
        </ul>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">Pivot log</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          This project drifted off its own brief, and was pulled back
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Recorded because the failure is the interesting part. Every step was a reasonable answer
          to the last instruction, and the destination was somewhere nobody had chosen.
        </p>
        <ol className="mt-7 space-y-px overflow-hidden rounded-md border border-line bg-line">
          {method.pivots.map((p, i) => (
            <li key={p.what} className="grid gap-x-5 gap-y-2 bg-card p-5 sm:grid-cols-[8.5rem_1fr]">
              <span className="flex items-baseline gap-2.5">
                <span className="exhibit-label">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-mono text-xs text-muted">{p.when}</span>
              </span>
              <span>
                <span className="block text-sm leading-relaxed">{p.what}</span>
                <span className="mt-1.5 block text-sm leading-relaxed text-muted">{p.why}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Every figure on this page is derived from the data files at render, including the counts of
        how well sourced those files are. Educational and portfolio work, not investment advice.
      </footer>
    </div>
  );
}
