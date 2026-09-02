import type { Pagination } from "@/lib/schema";

/**
 * Printed page numbers against positions in a PDF.
 *
 * One arithmetic, in one place. The mapping used to live as a signed offset in
 * a manifest, and two documents stored that field with opposite conventions, so
 * anyone applying one document's reading to the other moved every citation by
 * four pages. Nothing caught it because nothing computed with it.
 *
 * The idea that makes it safe is the slot: the ordinal position of a printed
 * page in the document, counting from zero. On a single page layout a slot is a
 * PDF page. On a spread the left half of a page comes before its right half, so
 * one PDF page holds two consecutive slots. Both layouts then differ only in
 * how a slot is built, and the rest of the arithmetic is shared.
 */

export type Half = "LEFT" | "RIGHT" | null;

/** Where a PDF position falls in the document's reading order. */
export function slotOf(p: Pagination, pdfIndex: number, half: Half): number {
  return p.printedPagesPerPdfPage === 2
    ? pdfIndex * 2 + (half === "RIGHT" ? 1 : 0)
    : pdfIndex;
}

/** The slot printed page one occupies. Every other page is measured from it. */
export function origin(p: Pagination): number {
  return slotOf(p, p.pdfIndexOfPrintedOne, p.halfOfPrintedOne);
}

/** Where a printed page sits in the PDF. */
export function printedToIndex(p: Pagination, printedPage: number) {
  const slot = origin(p) + printedPage - 1;
  if (p.printedPagesPerPdfPage === 2) {
    return { pdfIndex: Math.floor(slot / 2), half: (slot % 2 ? "RIGHT" : "LEFT") as Half };
  }
  return { pdfIndex: slot, half: null as Half };
}

/** What a PDF position prints as its page number. */
export function indexToPrinted(p: Pagination, pdfIndex: number, half: Half = null): number {
  return slotOf(p, pdfIndex, half) - origin(p) + 1;
}

/**
 * Whether the mapping is claimed to hold at a position.
 *
 * Front matter is often numbered on its own terms, and a document that settles
 * into its numbering part way through is common enough that pretending one rule
 * covers the file is how an offset ends up wrong at one end of it.
 */
export function coversIndex(p: Pagination, pdfIndex: number): boolean {
  return pdfIndex >= p.validFromPdfIndex;
}
