import type { Metadata } from "next";
import Link from "next/link";
import { sisl, anantRaj, netweb, prospectus, macro } from "@/lib/data";
import { compareRows, compareSubjects, comparableCount } from "@/lib/diagnostics/compare";
import { Exhibit } from "@/components/Exhibits";
import { CompareTable } from "@/components/CompareTable";

export const metadata: Metadata = {
  title: "Compare",
  description:
    "Two Indian data centre operators, both read from a filed document, and the single row that is genuinely like for like between them.",
};

/**
 * The comparison tool, and why it took this long to be honest.
 *
 * This page was blocked on something real rather than merely unstarted. Three
 * covered names sat on three units, and a side by side table would have compared
 * a megawatt against an order book, or left most cells empty while letting a
 * reader take the emptiness for zero.
 *
 * What unblocked it was not a fourth company. It was reading a filing for the
 * second operator, which produced one ratio that asks the same question of both.
 * The page leads on how few rows survive that test, because that count is the
 * most honest thing it knows about itself.
 */
export default function ComparePage() {
  const subjects = compareSubjects(sisl, anantRaj, netweb);
  const rows = compareRows(sisl, anantRaj, prospectus, macro);
  const { comparable, total } = comparableCount(rows);
  const share = rows.find((r) => r.metric === "Earning share of the headline")!;
  const sifyShare = share.cells.SIFY.value!;
  const arShare = share.cells.ANANTRAJ.value!;

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-5">
      <section className="py-12 sm:py-16">
        <p className="sc text-accent">Compare</p>
        <h1 className="mt-3 max-w-3xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          {comparable} of {total} rows are a comparison.
          <br />
          The rest are two numbers in a column.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Two companies build data centres in India and neither uses the other&apos;s words. One
          publishes built, installed and sold capacity. The other publishes a planned figure, a
          headline that mixes operational with advance stage, and an operational figure two pages
          away. Putting those levels side by side would produce a table that looks like a comparison
          and is not one.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          One ratio survives. What earns, divided by what the company headlines, asks the same
          question of both, and both publish both numbers in a filed document. On that measure{" "}
          <Link
            href="/company/SIFY"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            Sify
          </Link>{" "}
          earns on <span className="tnum text-foreground">{sifyShare.toFixed(1)}</span> per cent of
          its headline and{" "}
          <Link
            href="/company/ANANTRAJ"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            Anant Raj
          </Link>{" "}
          on <span className="tnum text-foreground">{arShare.toFixed(1)}</span>.
        </p>
      </section>

      <section className="border-t border-line py-12">
        <Exhibit
          n={1}
          title={`Only ${comparable} of ${total} rows ask the same question of both companies`}
          units="A row marked like for like is a ratio that survives two different vocabularies. Everything else is a level, or a figure that exists for one company because a document was read and not for the other because it was not. An absent figure names the document that would fill it rather than showing a blank."
          source="Sify Infinit Spaces from its draft red herring prospectus. Anant Raj from its annual report for FY2024-25, filed with the exchange. Both pinned by checksum, both cited by printed page, and both listed in the sources document."
        >
          <CompareTable subjects={subjects} rows={rows} />
        </Exhibit>
      </section>

      <section className="border-t border-line py-12">
        <p className="sc text-accent">What would fill the table</p>
        <h2 className="mt-3 max-w-3xl font-display text-3xl leading-tight tracking-tight">
          One document, already downloaded
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Every empty cell on the Anant Raj side is in the same annual report the capacity figures
          came from. The financial statements sit inside it and have not been read. That is a
          decision about where the reading stopped rather than a limit of the company&apos;s
          disclosure, and the table says so in each cell instead of in a footnote nobody reaches.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          A fourth operator would widen this page more than a fourth metric would. Several of the
          names on the{" "}
          <Link
            href="/universe"
            className="underline decoration-line underline-offset-4 hover:text-accent"
          >
            coverage matrix
          </Link>{" "}
          publish megawatts and file in India, so what limits this page is reading time rather than
          availability.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Educational and portfolio work, not investment advice. Every figure here derives at render
        from the data files, and every absence names what is missing.
      </footer>
    </div>
  );
}
