import type { supplierFinance } from "@/lib/diagnostics/supplierFinance";
import { Icon } from "./Visual";

/**
 * How long the company takes to pay, and where the obligation went.
 *
 * The top half is two ranges on one scale of days. Ranges rather than points,
 * because the filing gives both as bands and picking a midpoint would invent a
 * precision the disclosure withholds.
 *
 * The bottom half is one bar rather than two, because the question is what
 * share of a single reported figure arrived without cash. Drawing the two
 * components side by side would invite reading them as separate balances.
 */

type Data = ReturnType<typeof supplierFinance>;

const mn = (n: number) =>
  n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function SupplierFinance({ data }: { data: Data }) {
  const scale = data.arrangementDays.high;
  const bands = [
    {
      label: "Comparable trade payables outside the arrangement",
      lo: data.comparableDays.low,
      hi: data.comparableDays.high,
      tone: "var(--rung-1)",
    },
    {
      label: "Liabilities inside the arrangement",
      lo: data.arrangementDays.low,
      hi: data.arrangementDays.high,
      tone: "var(--signal)",
    },
  ];
  const reclassPct = data.shareOfStandaloneBorrowingsPct;

  return (
    <div>
      <div className="grid gap-3">
        {bands.map((b) => (
          <div key={b.label}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4">
              <span className="text-sm text-foreground">{b.label}</span>
              <span className="tnum text-sm text-foreground">
                {b.lo} to {b.hi} days
              </span>
            </div>
            <div className="mt-1.5 h-7 w-full rounded-sm border border-line">
              <div
                className="h-full rounded-sm"
                style={{
                  marginLeft: `${(b.lo / scale) * 100}%`,
                  width: `${((b.hi - b.lo) / scale) * 100}%`,
                  background: b.tone,
                }}
                role="img"
                aria-label={`${b.label}: ${b.lo} to ${b.hi} days after invoice date`}
              />
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs leading-relaxed text-muted">
        Days after the invoice date, on one scale. The financed terms start{" "}
        <span className="tnum text-foreground">{data.extraDaysLow}</span> days later than the
        comparable ones and end <span className="tnum text-foreground">{data.extraDaysHigh}</span>{" "}
        days later, so the company pays at roughly twice the remove it does outside the arrangement.
        Interest runs at {data.interestWords}, against collateral. Printed page {data.standalonePage}.
      </p>

      <div className="mt-7 border-t border-line pt-5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-4">
          <span className="text-sm text-foreground">
            What the standalone reports as current borrowings
          </span>
          <span className="tnum text-sm text-foreground">{mn(data.standaloneBorrowingsMn)}</span>
        </div>
        <div
          className="mt-2 flex h-8 overflow-hidden rounded-sm border border-line"
          role="img"
          aria-label={`Of ${mn(data.standaloneBorrowingsMn)} million reported as current borrowings, ${mn(data.reclassifiedMn)} arrived by reclassification from trade payables with no cash moving`}
        >
          <span className="h-full" style={{ width: `${reclassPct}%`, background: "var(--signal)" }} />
          <span className="h-full flex-1" style={{ background: "var(--accent)" }} />
        </div>
        <dl className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
          <span>
            <dt className="inline">Moved from trade payables, no cash </dt>
            <dd className="tnum inline text-foreground">
              {mn(data.reclassifiedMn)}, {reclassPct.toFixed(0)}%
            </dd>
          </span>
          <span>
            <dt className="inline">Actually borrowed </dt>
            <dd className="tnum inline text-foreground">
              {mn(data.standaloneBorrowingsMn - data.reclassifiedMn)}
            </dd>
          </span>
          <span>Printed page {data.netDebtPage}</span>
        </dl>
      </div>

      <div className="mt-5 flex gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <p>
          The arrangement is <span className="tnum text-foreground">{data.overCommitment.toFixed(2)}</span>{" "}
          times the <span className="tnum text-foreground">{mn(data.commitmentMn)}</span> the company
          has contracted to spend on capital account. Two things about it point opposite ways and both
          belong here. Placing the liability under borrowings rather than leaving it among payables is
          the stricter of the two treatments available, and the company chose it. Recording the move
          as a non cash transfer is also correct, and its effect is that a doubling of the time taken
          to pay leaves no mark on either half of the cash flow statement. Against the payables it
          came out of the amount is small, at{" "}
          <span className="tnum text-foreground">{data.shareOfTradePayablesPct.toFixed(2)}</span> per
          cent of the total. The disclosure exists at all because the amendments requiring it were
          notified partway through the year, on printed page {data.adoptionPage}.
        </p>
      </div>
    </div>
  );
}
