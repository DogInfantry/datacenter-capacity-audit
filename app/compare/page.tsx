import type { Metadata } from "next";
import Link from "next/link";
import { sisl, anantRaj, netweb } from "@/lib/data";
import {
  compareRows,
  compareSubjects,
  comparableCount,
  compareLadders,
} from "@/lib/diagnostics/compare";
import { Exhibit } from "@/components/Exhibits";
import { CapacityLadders } from "@/components/CapacityLadders";
import { CompareTable } from "@/components/CompareTable";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Two Indian data centre operators, both read from a filed document. One earns on most of its headline capacity and the other on a fifth of it.",
};

/**
 * Two operators, the same question, very different answers.
 *
 * The page leads on how few measures survive two vocabularies, because that
 * count is the most honest thing it knows about itself. Two do: earning share
 * of the headline, and what each company's data centres actually earned. The
 * rest are levels, including the one place both companies print the same words
 * for return on capital and divide by different denominators.
 */
export default function ComparePage() {
  const subjects = compareSubjects(sisl, anantRaj, netweb);
  const rows = compareRows(sisl, anantRaj);
  const { comparable, total } = comparableCount(rows);
  const ladders = compareLadders(sisl, anantRaj);
  const [big, small] = [...ladders.companies].sort((a, b) => b.headlineMW - a.headlineMW);
  // The second like for like row, and the multiple it produces. Derived from
  // the row rather than restated, so the title cannot drift from the table.
  const dcRow = rows.find((r) => r.metric === "Revenue from data centres")!;
  const dcMultiple = dcRow.cells.SIFY.value! / dcRow.cells.ANANTRAJ.value!;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-5">
      <section className="py-12 sm:py-16">
        <p className="sc text-accent">Compare</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          The same question, asked of two operators.
          <br />
          <span className="tnum">{big.earningShare.toFixed(0)}</span> per cent, and{" "}
          <span className="tnum">{small.earningShare.toFixed(0)}</span>.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Two companies build data centres in India and neither uses the other&apos;s words. One
          publishes built, installed and sold capacity. The other publishes a headline that mixes
          operational with advance stage, and an operational figure two pages away from it. Putting
          those levels side by side produces a table that looks like a comparison and is not one.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Two measures survive. What earns divided by what the company headlines, and what each
          company&apos;s data centres actually earned. Both ask the same question of both, and
          every figure in them is printed in a filed document. On the first,{" "}
          <Link
            href="/company/SIFY"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            {big.name}
          </Link>{" "}
          earns on <span className="tnum text-foreground">{big.earningShare.toFixed(1)}</span> per
          cent of its headline and{" "}
          <Link
            href="/company/ANANTRAJ"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            {small.name}
          </Link>{" "}
          on <span className="tnum text-foreground">{small.earningShare.toFixed(1)}</span>. Of{" "}
          <span className="tnum text-foreground">{total}</span> measures below,{" "}
          <span className="tnum text-foreground">{comparable}</span> travel between them.
        </p>
      </section>

      <section className="space-y-6 border-t border-line py-12">
        <Exhibit
          n={1}
          title={`${big.name} sells ${big.earningShare.toFixed(0)} per cent of what it headlines. ${small.name} operates ${small.earningShare.toFixed(0)}`}
          units={`Megawatts, both ladders on one scale. Each column is that company's own rungs in its own words, and no bar in one column is the same measurement as the bar beside it.`}
          source={`${big.sourceLabel} ${small.sourceLabel}`}
        >
          <CapacityLadders
            companies={ladders.companies}
            max={ladders.max}
            scaleNote={`One scale, so relative size is visible as well as relative shape. ${big.name} headlines ${ladders.sizeMultiple.toFixed(1)} times the megawatts ${small.name} does, and both ladders are drawn against the widest rung in the exhibit rather than each against its own.`}
          />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The rung names do not correspond. {big.name} descends from built to installed to sold,
            three rungs of one estate defined in one document. {small.name} descends from a headline
            printed with the words &ldquo;operational and advance stage to operationalise&rdquo; to
            an operational figure printed elsewhere in the same report, and then to the part of that
            figure which is colocation rather than cloud. Reading either ladder against the other
            rung by rung would set one definition beside a different one.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The number above each ladder is the one that travels, because it is built from that
            company&apos;s own two figures.{" "}
            <span className="tnum text-foreground">{big.earningShare.toFixed(1)}</span> per cent
            against <span className="tnum text-foreground">{small.earningShare.toFixed(1)}</span> is
            not a difference in disclosure quality. Both companies disclosed enough to be measured.
            It is a difference in how much of what reaches the market is a built asset with a
            customer on it.
          </p>
        </Exhibit>

        <Exhibit
          n={2}
          title={`${big.name} earns ${dcMultiple.toFixed(0)} times what ${small.name}'s data centre arm earns`}
          units="Millions of rupees on both sides, and the same twelve months to 31 March 2025. Lakhs are restated as millions, which is a change of scale inside one currency rather than a conversion between two."
          source="Sify Infinit Spaces from its draft red herring prospectus. Anant Raj from its annual report for FY2024-25, filed with the exchange. Both pinned by checksum and cited by printed page in the sources document."
        >
          <CompareTable subjects={subjects} rows={rows.filter((r) => r.kind === "FINANCIAL")} />

          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Both sides are filed figures for the same year now. The row that travels is the first
            one, because it asks each company what its data centres earned:{" "}
            {big.name} is a data centre operator entire, and {small.name} prints its arm as one
            column in a statement of subsidiaries. On that measure they are{" "}
            <span className="tnum text-foreground">{dcMultiple.toFixed(0)}</span> times apart.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The three rows under it are levels rather than comparisons, and the last is the sharpest
            of them. Both companies print the words return on capital employed, and neither prints
            the same arithmetic: one divides by average capital employed, the other by capital
            employed at the close. In a year when equity rose, the closing denominator is the
            kinder one. The higher number on that row is not the better return, it is the different
            formula.
          </p>
        </Exhibit>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">Where this widens</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          A third operator, not a fourth metric
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Both figures on this page come from a document filed with a regulator or an exchange.
          Several more names on the{" "}
          <Link
            href="/universe"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            coverage matrix
          </Link>{" "}
          publish megawatts and file the same way, so the ratio above can be asked of them on the
          same terms. Adding one of those widens this comparison. Adding another metric does not,
          because a metric only travels when both companies print both of its numbers.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Educational and portfolio work, not investment advice. Every figure here derives at render
        from the data files, and every absence names the document that carries it. The sourcing is
        set out on the{" "}
        <Link href="/methodology" className="underline decoration-line underline-offset-4">
          methodology page
        </Link>
        .
      </footer>
    </div>
  );
}
