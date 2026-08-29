type OrderBook = { valueCr: number; asOf: string };
type AnchorOrder = { name: string; valueCr: number; awarded: string; deliveryDue: string };

/**
 * One order as a share of the book that holds it.
 *
 * The research note reports the order book and the IndiaAI Mission award as two
 * separate facts and never divides one by the other. The division is the
 * exhibit, and it is the same shape as the client concentration finding on the
 * Sify pages in a different unit: there it is revenue, here it is backlog.
 *
 * The share is a ceiling rather than a measurement, because anything already
 * delivered against the order has left the book by the date the book is stated.
 * That caveat is a required field on the data file rather than a flag computed
 * here, since it is a fact about the sourcing and not about the arithmetic.
 */
export function orderBookConcentration(book: OrderBook, order: AnchorOrder) {
  const sharePct = (order.valueCr / book.valueCr) * 100;
  return {
    bookCr: book.valueCr,
    anchorCr: order.valueCr,
    /** Everything else. Every other customer, every other order, added together. */
    restCr: book.valueCr - order.valueCr,
    sharePct,
    restSharePct: 100 - sharePct,
  };
}
