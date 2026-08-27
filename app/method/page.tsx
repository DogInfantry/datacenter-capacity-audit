import type { Metadata } from "next";
import { baseRate } from "@/lib/data";

export const metadata: Metadata = {
  title: "Method",
  description:
    "Every formula, denominator, threshold and sample size used on this site, plus what remains unverified.",
};

const FORMULAS = [
  {
    name: "Transmission slippage base rate",
    formula: "cost weighted mean = sum(delay x approved cost) / sum(approved cost)",
    denominator: "25 delayed ISTS projects, Rs 24,945 cr approved cost",
    note: "Every project was still running when tabled, so each delay is the slip anticipated at that moment rather than the slip realised. The observations are right censored and the figure is a floor.",
  },
  {
    name: "Segment margin",
    formula: "(segment revenue - segment operating expense) / segment revenue",
    denominator: "9 annual periods, FY2018 to FY2026, Form 20-F",
    note: "Operating expense is taken as an absolute value because FY2023 is filed with a negative sign while every other year is positive. The magnitudes agree; only the convention differs. The result must land in the 40 to 50 per cent band the sector reports for stabilised colocation, or the series is being misread.",
  },
  {
    name: "Revenue per megawatt",
    formula: "data centre segment revenue / contracted MW",
    denominator: "FY2026 segment revenue over opening and closing contracted capacity, 110 to 130 MW",
    note: "Derived, not disclosed. Contracted is the correct denominator because design and commissioned capacity both include megawatts nobody is paying for. Reported as a range because capacity moves during the year. Cross-checked against an independent figure of about Rs 0.9 crore per MW per month.",
  },
  {
    name: "Funding gap",
    formula: "sum(capex) - sum(operating cash flow), summed not averaged",
    denominator: "5 financial years, FY2022 to FY2026",
    note: "Summed deliberately: a shortfall does not reset each April, it accumulates until someone funds it.",
  },
  {
    name: "Adjusted EBITDA reconstruction",
    formula: "operating income + depreciation + add backs, over revenue",
    denominator:
      "Equinix, one quarter and one financial year with a stated reference, from Form 10-Q and 10-K",
    note: "The check on everything else here. Adjusted EBITDA is not GAAP and is tagged nowhere in the filings database, so the reference is what management said on the call, verbatim and dated. Add backs are stock compensation and any tagged one off charge. An add back that is not tagged is not treated as zero: the period is reported as not reconcilable instead, because a company that does not tag its stock compensation has not told us it pays none.",
  },
  {
    name: "Reconciliation tolerance",
    formula: "absolute(rebuilt margin - stated margin), in basis points",
    denominator: "150 bp against a reported actual, 250 bp against guidance",
    note: "Both were fixed in writing before the check was run, so that the result could not be rationalised afterwards. Guidance earns the wider band because a guide is a range and not a point. Equinix cleared the first at 35 basis points for the second quarter of 2025 and the second at 131 basis points for the 2025 financial year. Digital Realty cleared neither, because its add backs cannot be built from the source at all.",
  },
  {
    name: "Segment share of revenue",
    formula: "segment revenue / group revenue",
    denominator: "6 annual periods where both figures are reported",
    note: "The cheapest honest test of a stated pivot. It says whether a claimed shift is visible in the accounts. It says nothing about whether the shift is wise.",
  },
];

export default function Method() {
  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-5">
      <section className="py-14">
        <p className="sc text-accent">Method</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight">
          Every formula, with its denominator
        </h1>
        <p className="mt-5 max-w-2xl leading-relaxed text-muted">
          A rate without a denominator is decoration. Each measure used on this
          site is stated below with the sample it was computed over and the
          reason it is built the way it is.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <ul className="space-y-8" role="list">
          {FORMULAS.map((f) => (
            <li key={f.name}>
              <h2 className="font-serif text-xl tracking-tight">{f.name}</h2>
              <p className="mt-2 overflow-x-auto rounded-sm border border-line bg-card p-3 font-mono text-xs">
                {f.formula}
              </p>
              <p className="mt-2 text-xs text-muted">
                <span className="uppercase tracking-wide">Sample</span>{" "}
                {f.denominator}
              </p>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
                {f.note}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Provenance</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Three tags, and they are enforced
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Every figure carries one of three tags. <strong>Primary</strong> means
          read out of a filing, a tariff order or a government dataset.{" "}
          <strong>Secondary</strong> means reported by a named third party that
          was not the original publisher. <strong>Unverified</strong> means
          carried in from research notes and not yet traced to a source. The
          schema refuses a figure without a tag, and the build fails with the
          offending field path rather than rendering it.
        </p>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Two further invariants are enforced the same way: a claim graded
          against its horizon cannot exist without the evidence that graded it,
          and a refusal cannot be marked as published elsewhere without naming
          where.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Known limits</p>
        <ul
          className="mt-6 max-w-2xl space-y-3 text-sm leading-relaxed text-muted"
          role="list"
        >
          <li>
            The transmission sample is {baseRate.n} projects, of which only seven
            are private developers and three of those share one parent. It is
            enough to raise the question of whether ownership predicts delivery
            and not enough to answer it.
          </li>
          <li>
            Sify is currently the only Indian operator here with a full statement
            and transcript record, because it lists in the United States. One
            company cannot represent Indian disclosure practice; it anchors the
            method while the coverage widens.
          </li>
          <li>
            The 188 megawatt definitional discrepancy rests on secondary
            summaries and is labelled unverified until the prospectus itself is
            read.
          </li>
          <li>
            Revenue per megawatt is derived rather than disclosed, and carries
            its formula and denominator wherever it appears.
          </li>
        </ul>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Educational and portfolio work. Not investment advice, not a research
        product, and not affiliated with any company or agency named.
      </footer>
    </div>
  );
}
