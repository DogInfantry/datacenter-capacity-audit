import type { payablesAgeing } from "@/lib/diagnostics/payables";
import { Icon } from "./Visual";

/**
 * A balance placed past its due date by one note, and a statute reporting
 * nothing about it in the next.
 *
 * The top half draws the whole payables balance across the buckets the filing
 * prints, on one scale, with the micro and small enterprise row marked where it
 * falls. Drawing it as a proportion of the total rather than on its own keeps a
 * reader from taking a small absolute number for a small problem.
 *
 * The bottom half sets out the five statutory clauses as the filing sets them
 * out, each with what it reports. A table of five zeroes is the finding, so it
 * is shown rather than summarised.
 */

type Data = ReturnType<typeof payablesAgeing>;

const mn = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TONE: Record<string, string> = {
  NOT_DUE: "var(--accent)",
  UNDER_1Y: "var(--signal)",
  Y1_2: "var(--rung-1)",
  Y2_3: "var(--rung-1)",
  OVER_3Y: "var(--rung-1)",
};

export function PayablesAgeing({ data }: { data: Data }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <span className="text-sm text-foreground">{data.headerWords}</span>
        <span className="tnum text-sm text-foreground">{mn(data.totalMn)}</span>
      </div>
      <div
        className="mt-2 flex h-8 overflow-hidden rounded-sm border border-line"
        role="img"
        aria-label={`Of ${mn(data.totalMn)} million of trade payables, ${mn(data.notDueMn)} is not yet due and ${mn(data.overdueMn)} is past its due date`}
      >
        {data.ageing.map((r) => {
          const v = r.msmeMn + r.othersMn;
          return v > 0 ? (
            <span
              key={r.bucket}
              className="h-full"
              style={{ width: `${(v / data.totalMn) * 100}%`, background: TONE[r.bucket] }}
            />
          ) : null;
        })}
      </div>
      <dl className="mt-2 grid gap-x-6 gap-y-1 text-xs text-muted sm:grid-cols-2">
        {data.ageing.map((r) => (
          <span key={r.bucket}>
            <dt className="inline">{r.label} </dt>
            <dd className="tnum inline text-foreground">{mn(r.msmeMn + r.othersMn)}</dd>
            {r.msmeMn > 0 ? (
              <dd className="inline text-muted">
                {" "}
                of which micro and small <span className="tnum">{mn(r.msmeMn)}</span>
              </dd>
            ) : null}
          </span>
        ))}
      </dl>
      <p className="mt-3 text-xs leading-relaxed text-muted">
        The columns run from the due date of payment, so everything outside the first is already
        late: <span className="tnum text-foreground">{data.overdueSharePct.toFixed(1)}</span> per cent
        of the balance, against{" "}
        <span className="tnum text-foreground">{data.overduePriorSharePct.toFixed(1)}</span> a year
        earlier. The whole micro and small enterprise balance of{" "}
        <span className="tnum text-foreground">{mn(data.msmePrincipalMn)}</span> sits in an overdue
        column and <span className="tnum text-foreground">{mn(data.msmeNotDueMn)}</span> in the column
        for amounts not yet due, in both years, while the balance rose{" "}
        <span className="tnum text-foreground">{data.msmeRisePct.toFixed(1)}</span> per cent. Printed
        page {data.ageingPage}.
      </p>

      <div className="mt-7 border-t border-line pt-5">
        <p className="text-sm text-foreground">
          What the filing reports under the Act, one page later
        </p>
        <table className="mt-3 w-full border-collapse text-xs">
          <caption className="sr-only">
            The five disclosures required by the Micro, Small and Medium Enterprises Development Act
            2006, and the amount each reports
          </caption>
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-1.5 pr-3 font-medium">Clause</th>
              <th className="py-1.5 pr-3 font-medium">What it requires</th>
              <th className="py-1.5 text-right font-medium">Reported</th>
            </tr>
          </thead>
          <tbody>
            {data.clauses.map((c) => (
              <tr key={c.clause} className="border-b border-line">
                <td className="tnum py-1.5 pr-3 align-top text-muted">({c.clause})</td>
                <td className="py-1.5 pr-3">{c.label}</td>
                <td className="tnum py-1.5 text-right text-foreground">
                  {c.interestMn === 0 ? "nil" : mn(c.interestMn)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-xs text-muted">
          <span className="tnum text-foreground">{data.nilClauseCount}</span> of{" "}
          <span className="tnum text-foreground">{data.clauses.length}</span> report nothing, in both
          years. Printed page {data.clausesPage}.
        </p>
      </div>

      <div className="mt-5 flex gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <p>
          {data.bucketLimitNote} Two further things belong beside it. The filing says the balance was
          identified as follows: {data.identificationQuote} So its completeness rests on what
          suppliers told the company. And letters of credit, secured against the plant, the fixed
          deposits and the receivables, now stand behind{" "}
          <span className="tnum text-foreground">{mn(data.letterOfCreditMn)}</span> of these payables,{" "}
          <span className="tnum text-foreground">{data.letterOfCreditSharePct.toFixed(0)}</span> per
          cent of the total and up{" "}
          <span className="tnum text-foreground">{data.letterOfCreditRisePct.toFixed(0)}</span> per
          cent on the year, which is a third way of paying later alongside the two above.
        </p>
      </div>
    </div>
  );
}
