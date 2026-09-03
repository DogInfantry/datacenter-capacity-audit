import type { struckOff } from "@/lib/diagnostics/anantraj";

/**
 * Balances with companies struck off the register.
 *
 * The list is eleven rows and one of them is the exhibit. Drawn on a log scale
 * it would be readable and would lie: the whole point is that the largest row
 * is three orders of magnitude above the smallest, and a scale chosen to make
 * the small rows visible would flatten exactly the disparity worth seeing.
 *
 * So the largest row is drawn as a bar and everything else receivable is drawn
 * as a single bar on the same scale, with the full table underneath for anyone
 * who wants the names. The relationship column is the report's own and is on
 * every row, because the obvious inference from a struck off list sitting a few
 * notes below the related party disclosures is the wrong one here.
 */

type Data = ReturnType<typeof struckOff>;

/**
 * Two decimals, as the report prints them, and three only for the one row that
 * needs a third. Splitting at one rupee gave 0.600 for a figure the source
 * prints as 0.60, and letting the locale trim gave a bare 2 for 2.00. Both read
 * as a rendering fault rather than as the filed number.
 */
const lakh = (n: number) =>
  n < 0.01
    ? n.toFixed(3)
    : n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const WORD: Record<string, string> = {
  RELATED_PARTY: "Related party",
  OTHERS: "Others",
};

export function StruckOff({ data }: { data: Data }) {
  const rest = data.receivableLakh - data.largest.amountLakh;
  const restCount = data.receivable.length - 1;

  return (
    <div>
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-sm text-foreground">{data.largest.name}</p>
          <p className="tnum text-sm text-foreground">{lakh(data.largest.amountLakh)}</p>
        </div>
        <div
          className="mt-1.5 h-8 w-full rounded-sm"
          style={{ background: "var(--signal)" }}
          role="img"
          aria-label={`${data.largest.name}, ${lakh(data.largest.amountLakh)} lakh receivable, ${data.largestShareOfReceivablePct.toFixed(1)} per cent of everything receivable from this list`}
        />
        <p className="mt-1.5 text-xs text-muted">
          {WORD[data.largest.relationship]} &middot;{" "}
          <span className="tnum">{data.largestShareOfReceivablePct.toFixed(1)}%</span> of everything
          receivable from this list
        </p>

        <div className="mt-5 flex items-baseline justify-between gap-4">
          <p className="text-sm text-foreground">
            The other {restCount} receivable rows, added together
          </p>
          <p className="tnum text-sm text-foreground">{lakh(rest)}</p>
        </div>
        <div className="mt-1.5 h-8 rounded-sm border border-line">
          <div
            className="h-full rounded-sm"
            style={{
              background: "var(--rung-1)",
              width: `${(rest / data.largest.amountLakh) * 100}%`,
              minWidth: "2px",
            }}
          />
        </div>
        <p className="mt-1.5 text-xs text-muted">
          Drawn on the same scale as the bar above it, which is the exhibit.
        </p>
      </div>

      <div className="mt-6 overflow-x-auto border-t border-line pt-4">
        <table className="w-full min-w-[32rem] border-collapse text-xs">
          <caption className="sr-only">
            Every balance with a company struck off under Section 248, by counterparty
          </caption>
          <thead>
            <tr className="border-b border-line text-left text-muted">
              <th className="py-1.5 pr-3 font-medium">Counterparty</th>
              <th className="py-1.5 pr-3 font-medium">Relationship</th>
              <th className="py-1.5 pr-3 font-medium">Direction</th>
              <th className="py-1.5 pr-3 text-right font-medium">This year</th>
              <th className="py-1.5 text-right font-medium">Year before</th>
            </tr>
          </thead>
          <tbody>
            {data.rows.map((r) => (
              <tr key={r.name} className="border-b border-line">
                <td className="py-1.5 pr-3">{r.name}</td>
                <td className="py-1.5 pr-3 text-muted">{WORD[r.relationship]}</td>
                <td className="py-1.5 pr-3 text-muted">
                  {r.kind === "RECEIVABLE" ? "Owed to the company" : "Owed by it"}
                </td>
                <td className="tnum py-1.5 pr-3 text-right">{lakh(r.amountLakh)}</td>
                <td className="tnum py-1.5 text-right text-muted">{lakh(r.amountPriorLakh)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-muted">
        <span className="tnum text-foreground">{data.unchanged}</span> of the{" "}
        <span className="tnum text-foreground">{data.count}</span> balances are identical to the
        year before, to the paisa. A balance with a company that has been removed from the register
        and has not moved in twelve months is not being settled.
      </p>
    </div>
  );
}
