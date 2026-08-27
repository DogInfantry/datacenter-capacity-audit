import type { Metadata } from "next";
import { CapacityStep } from "@/components/CapacityStep";
import { DefinitionLadder } from "@/components/DefinitionLadder";
import { sify } from "@/lib/data";

export const metadata: Metadata = {
  title: "Disclosure",
  description:
    "What management will and will not put a number on, coded from a decade of earnings calls, and what happened to the capacity they promised.",
};

export default function Disclosure() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-5">
      <section className="py-14">
        <p className="sc text-accent">The disclosure register</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight">
          What a company will not put a number on
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          Sify is the one Indian data centre pure play with a decade of
          transcribed earnings calls, because it lists on NASDAQ. Every figure
          below is a verbatim answer its management gave an analyst. Nothing here
          is estimated, modelled, or inferred.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">The disclosure register</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Sify promised <span className="tnum">124 MW</span> in twelve months and
          delivered about <span className="tnum">20</span>
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Sify is the one Indian data centre pure play with a decade of
          transcribed earnings calls, because it lists on NASDAQ. Every figure
          below is a verbatim answer its management gave an analyst. Nothing here
          is estimated, modelled, or inferred.
        </p>

        <CapacityStep data={sify} />

        <div className="mt-10 space-y-6">
          {sify.claims
            .filter((c) => c.status === "MISSED")
            .map((c) => (
              <blockquote
                key={c.made_on}
                className="border-l-2 border-missed pl-4"
              >
                <p className="text-sm leading-relaxed">
                  &ldquo;{c.verbatim}&rdquo;
                </p>
                <footer className="mt-2 text-xs leading-relaxed text-muted">
                  <span className="uppercase tracking-wide text-missed">
                    Missed
                  </span>{" "}
                  · said {c.made_on}, due {c.horizon_end}. {c.resolved_evidence}
                </footer>
              </blockquote>
            ))}
        </div>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Four numbers, one word</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Capacity means whichever figure is largest
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Asked for the full picture in October 2025, Sify gave two numbers in
          one breath: <span className="tnum">188 MW</span> of design capacity, of
          which <span className="tnum">130 MW</span> is built. Earlier calls give
          two more. A press release is free to quote the first and a reader has
          no way to know which one they are being shown.
        </p>
        <DefinitionLadder />
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Why the numbers stopped</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          A refusal is only a finding if the answer exists nowhere
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Refusing to quantify unit economics is the industry norm, not an Indian
          habit. Digital Realty declined on cost per megawatt. Equinix declined
          on revenue attribution and deflected on pricing. What separates them is
          where the answer lives: Digital Realty deflects by pointing at its own
          development table, Equinix gives a cost per kilowatt outright. A
          refusal counts against a company only when the figure is published
          nowhere at all.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          October 2025 is the clean case. Asked how much capacity was in the
          build pipeline, Sify declined and named the reason.
        </p>
        <blockquote className="mt-6 border-l-2 border-line pl-4">
          <p className="text-sm leading-relaxed">
            &ldquo;I have a little bit of a constraint. Generally, we don&apos;t
            make forward statements and more importantly, having filed the draft
            prospectus with the securities regulator I&apos;m prohibited from
            making any forward statements.&rdquo;
          </p>
          <footer className="mt-2 text-xs text-muted">
            Sify management, 27 October 2025, answering Sidoti &amp; Company
          </footer>
        </blockquote>
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          That is a company going quiet with a documented cause, and the figure
          moved into the prospectus rather than disappearing. It codes as
          ordinary practice, not a gap. The measure only earns its name when it
          can tell those two apart.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Educational and portfolio work. Not investment advice, not a research
        product, and not affiliated with any company or agency named.
      </footer>
    </div>
  );
}
