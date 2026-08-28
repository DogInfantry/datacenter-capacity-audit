import type { Metadata } from "next";
import { CapacityStep } from "@/components/CapacityStep";
import { DefinitionLadder } from "@/components/DefinitionLadder";
import { sify, disclosureRegister } from "@/lib/data";
import {
  refusalRate,
  publishedElsewhereSplit,
  pressurePerCall,
} from "@/lib/diagnostics/disclosure";

export const metadata: Metadata = {
  title: "Disclosure",
  description:
    "What management will and will not put a number on, coded from a decade of earnings calls, measured as a refusal rate across three operators with the denominator visible, and what happened to the capacity they promised.",
};

export default function Disclosure() {
  const reg = disclosureRegister;
  const rows = reg.companies.map((c) => ({
    c,
    rate: refusalRate(c),
    split: publishedElsewhereSplit(c.refusals),
    press: pressurePerCall(c),
  }));
  const pct = (v: number) => (v * 100).toFixed(1) + "%";

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

      <section className="border-t border-line py-14">
        <p className="sc text-accent">The register, measured</p>
        <h2 className="mt-3 max-w-3xl font-serif text-3xl tracking-tight">
          Sify refuses least, and is asked least
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Everything above this line is an exemplar: individual questions, read
          closely. An exemplar cannot say how often something happens. This can.
          Every question analysts asked these three companies in the two topic
          families that are unit economics, pricing and cost margin, between{" "}
          {reg.window.start} and {reg.window.end}, counted whole.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The denominator is the entire topic partition, not a keyword search.
          Searching for the phrase &ldquo;revenue per megawatt&rdquo; would find
          only the questions worded that way and the denominator would then
          describe the search rather than the calls.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-sm">
            <caption className="sr-only">
              Refusal rate on unit economics questions, by company
            </caption>
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">Company</th>
                <th className="py-2 pr-4 text-right font-medium">Pressed</th>
                <th className="py-2 pr-4 text-right font-medium">Answered</th>
                <th className="py-2 pr-4 text-right font-medium">Partial</th>
                <th className="py-2 pr-4 text-right font-medium">Refused</th>
                <th className="py-2 pr-4 text-right font-medium">Rate</th>
                <th className="py-2 text-right font-medium">Per call</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ c, rate, press }) => (
                <tr key={c.ticker} className="border-b border-line">
                  <td className="py-2.5 pr-4">
                    <span className="font-medium">{c.ticker}</span>
                    <span className="block text-xs text-muted">
                      {c.callsCovered} calls covered
                    </span>
                  </td>
                  <td className="py-2.5 pr-4 text-right tnum">{rate.pressed}</td>
                  <td className="py-2.5 pr-4 text-right tnum">{rate.confirmed}</td>
                  <td className="py-2.5 pr-4 text-right tnum">{rate.partial}</td>
                  <td className="py-2.5 pr-4 text-right tnum">{rate.refused}</td>
                  <td className="py-2.5 pr-4 text-right tnum text-accent">
                    {rate.refused} of {rate.pressed}, {pct(rate.rate)}
                  </td>
                  <td className="py-2.5 text-right tnum">
                    {press.perCall.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          This is the second time this project has gone looking for an Indian
          disclosure gap and found the opposite. Sify refuses least of the
          three. Equinix, the largest and most heavily covered operator in the
          set, refuses most. A partial answer is counted as an answer, not a
          refusal, because folding it into the numerator would let the measure
          say whatever was wanted of it.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The last column is the one that complicates the rate. Sify faces{" "}
          <span className="tnum">
            {rows.find((r) => r.c.ticker === "SIFY")!.press.perCall.toFixed(2)}
          </span>{" "}
          unit economics questions a call against Digital Realty&apos;s{" "}
          <span className="tnum">
            {rows.find((r) => r.c.ticker === "DLR")!.press.perCall.toFixed(2)}
          </span>
          . A company that is rarely asked has fewer chances to refuse, so a low
          rate is not the same as a transparent one, and the denominator has to
          stay visible for that reason.
        </p>

        <div className="mt-8 rounded-sm border border-line bg-card p-5">
          <p className="sc text-accent">The second dimension, and its limit</p>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted">
            A refusal that points at a published document is ordinary investor
            relations. A refusal that points nowhere is a gap. Across the{" "}
            <span className="tnum">
              {rows.reduce((s, r) => s + r.split.total, 0)}
            </span>{" "}
            refusals in this window, management named a source{" "}
            <span className="tnum">
              {rows.reduce((s, r) => s + r.split.namedASource, 0)}
            </span>{" "}
            times.
          </p>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">
            <strong className="text-foreground">Read that carefully.</strong>{" "}
            This dimension is coded from what was said out loud on the call. It
            detects a company naming where a figure lives. It cannot show that a
            figure is unpublished, because a company can publish something in a
            supplemental and simply not mention it while answering. Equinix and
            Digital Realty both publish extensive quarterly supplements. Nothing
            here should be read as evidence that they do not.
          </p>
        </div>

        <p className="mt-8 max-w-2xl leading-relaxed text-muted">
          The clearest instance runs against the grain of the whole thesis.
          Asked in October 2024 for average realization per megawatt, Sify
          declined, and then explained where to find it.
        </p>
        <blockquote className="mt-6 border-l-2 border-accent pl-4">
          <p className="text-sm leading-relaxed">
            &ldquo;See, these are customer specific numbers. I don&apos;t think
            it will be appropriate. But it&apos;s available in our published
            financials, the gross revenue. And I told you about the capacity.
            You could do a reverse working on that.&rdquo;
          </p>
          <footer className="mt-2 text-xs text-muted">
            Sify management, 22 October 2024, answering HiFi Advisory Services
          </footer>
        </blockquote>
        <p className="mt-6 max-w-2xl leading-relaxed text-muted">
          The reverse working management describes is the calculation on the
          financials page: segment revenue over contracted capacity. The company
          declined to state the number and then described the arithmetic that
          produces it. That is the strongest possible confirmation that the
          figure was public all along, and it comes from the company rather than
          from us.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Refusal rates are computed from complete topic partitions of the
        earnings call claim graph, over {reg.window.start} to {reg.window.end},
        across {reg.families.join(" and ")}. Educational and portfolio work. Not
        investment advice, not a research product, and not affiliated with any
        company or agency named.
      </footer>
    </div>
  );
}
