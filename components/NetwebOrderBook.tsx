import { Icon } from "./Visual";

type Concentration = {
  bookCr: number;
  anchorCr: number;
  restCr: number;
  sharePct: number;
  restSharePct: number;
};

type Props = {
  concentration: Concentration;
  anchor: { name: string; counterparty: string; awarded: string; deliveryDue: string };
  bookAsOf: string;
  caveat: string;
  /** The same shape on the one name whose filings were read. A different unit,
   *  and the caption says so rather than letting the bars imply otherwise. */
  sify: { sharePct: number; page: number };
};

const cr = (v: number) => v.toLocaleString("en-IN");

/**
 * One order against the book that holds it, drawn beside the client
 * concentration on the one name whose filings were read.
 *
 * Both bars run the full width, because both are a share of their own whole.
 * That is the finding and also the trap: the two wholes are not the same
 * quantity. Netweb's is an order book, work not yet delivered, at a date.
 * Sify's is revenue, money already earned across filed periods. The bars are
 * drawn alike because the shape is alike, and every label on them exists to
 * stop a reader concluding the measurement is.
 */
export function NetwebOrderBook({ concentration, anchor, bookAsOf, caveat, sify }: Props) {
  const rows = [
    {
      company: "Netweb Technologies",
      unit: `Order book, Rs ${cr(concentration.bookCr)} cr, as at ${bookAsOf}`,
      headSharePct: concentration.sharePct,
      head: {
        label: anchor.name,
        tone: "var(--accent-deep)",
        amount: `Rs ${cr(concentration.anchorCr)} cr`,
      },
      tail: { label: "Every other customer", amount: `Rs ${cr(concentration.restCr)} cr` },
      sourcing: "Research note, no filing cited",
    },
    {
      company: "Sify Infinit Spaces",
      unit: "Revenue from operations, latest filed period",
      headSharePct: sify.sharePct,
      head: { label: "Clients 1, 2 and 3, all Hyperscalers", tone: "var(--rung-2)", amount: null },
      tail: { label: "Every other client", amount: null },
      sourcing: `Draft red herring prospectus, printed page ${sify.page}`,
    },
  ];

  return (
    <div>
      <ul className="space-y-6">
        {rows.map((r) => (
          <li key={r.company}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <span className="text-sm font-medium">{r.company}</span>
              <span className="tnum text-sm text-muted">
                <span className="text-foreground">{r.headSharePct.toFixed(1)}</span> per cent
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted">{r.unit}</p>

            <div className="mt-2 flex h-7 w-full overflow-hidden rounded-sm bg-grid">
              <div
                className="h-7"
                style={{ width: `${r.headSharePct}%`, background: r.head.tone }}
              />
              <div className="h-7 flex-1" style={{ background: "var(--rung-1)" }} />
            </div>

            <div className="mt-1.5 grid gap-1 text-xs sm:grid-cols-2">
              {[r.head, r.tail].map((seg, i) => (
                <span key={seg.label} className="flex items-start gap-2 text-muted">
                  <span
                    aria-hidden
                    className="mt-1 h-2.5 w-2.5 shrink-0 rounded-sm"
                    style={{ background: i === 0 ? r.head.tone : "var(--rung-1)" }}
                  />
                  <span>
                    {seg.label}
                    {seg.amount && (
                      <span className="ml-1.5 tnum text-foreground">{seg.amount}</span>
                    )}
                  </span>
                </span>
              ))}
            </div>
            <p className="mt-1.5 text-[11px] text-muted">{r.sourcing}</p>
          </li>
        ))}
      </ul>

      <p className="mt-6 flex gap-2 border-t border-line pt-4 text-sm leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0 text-signal">
          <Icon name="warning" size={16} />
        </span>
        <span>{caveat}</span>
      </p>

      <p className="mt-3 text-sm leading-relaxed text-muted">
        The two bars are close and they are not the same measurement. Sify&apos;s{" "}
        <span className="tnum text-foreground">{sify.sharePct.toFixed(1)}</span> per cent is revenue
        already earned. Netweb&apos;s{" "}
        <span className="tnum text-foreground">{concentration.sharePct.toFixed(1)}</span> per cent is
        work not yet delivered, awarded {anchor.awarded} and due {anchor.deliveryDue}. One is a
        record of who paid. The other is a statement about who is expected to.
      </p>
    </div>
  );
}
