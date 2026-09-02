"""Recover a document's printed page numbering from the folios it prints.

Every primary claim on this site names a printed page. The mapping from that
printed page to a position in the PDF was, until this script existed, a sentence
in a manifest that nobody could re-check: one document recorded "four pages that
print their own number" without saying which four. A sentence like that cannot be
wrong in any detectable way, which is the problem.

What this does instead is read the folios the document prints on itself, propose
the mapping that the largest number of them agree on, and emit the disagreeing
pages as well as the agreeing ones. The output is meant to be pasted into a
manifest as a `pagination` block and then asserted at build time, so the claim
and its evidence travel together.

Two layouts are handled:

  SINGLE  one printed page per PDF page. index = printed - 1 + pdfIndexOfPrintedOne
  SPREAD  two printed pages per PDF page, left then right. A printed page is half
          a PDF page, and which half matters, because the folio on a spread sits
          near the gutter and a naive split of the extracted string puts it on
          the wrong side. Position is taken from the text run's own coordinates.

The mapping is fitted rather than assumed, and the fit is reported with the count
that supports it. A document whose front matter is numbered separately shows up
here as a block of disagreeing early pages rather than as a silently wrong
offset, which is what `validFromPdfIndex` in the output records.

Usage:
    python pipeline/find_folios.py <file.pdf> [--spread] [--anchors 4]
"""
import argparse
import json
import re
from collections import Counter
from pathlib import Path

from pypdf import PdfReader

# A folio is a short run of digits and nothing else. Roman numerals are not
# collected: where a document uses them they belong to front matter numbered on
# its own terms, and folding the two together is the error.
FOLIO = re.compile(r"^\d{1,4}$")

# Folios sit in the margins. The band is generous because these documents are
# designed rather than typeset to a standard, and a tight band silently drops
# the evidence on exactly the pages that most need checking.
TOP_BAND = 0.14
BOTTOM_BAND = 0.86


def runs(page):
    """Every text run on a page, with the position it was drawn at."""
    found = []

    def visit(text, cm, tm, font, size):
        stripped = text.strip()
        if stripped:
            found.append({"text": stripped, "x": tm[4], "y": tm[5]})

    page.extract_text(visitor_text=visit)
    return found


def candidates(page, spread):
    """Folio candidates on one PDF page, as (half, value) pairs.

    `half` is None for a single page layout, and LEFT or RIGHT for a spread.
    A page can offer several candidates. Nothing is filtered on whether a value
    looks plausible, because plausibility is the thing being tested.

    A spread does not necessarily print its two folios at its two outer edges.
    The one this was written against sets both in a single run at the left edge,
    sometimes twice over, so "196 197" and "72 7372 73" are both one run holding
    the pair. Position therefore cannot decide which half a folio belongs to, and
    a consecutive pair inside one run is read as left then right. Where no such
    pair exists the outer edge rule still applies, because a document that prints
    its folios separately is the other reasonable design.
    """
    width = float(page.mediabox.width)
    height = float(page.mediabox.height)
    out = []
    for run in runs(page):
        near_edge = run["y"] < height * TOP_BAND or run["y"] > height * BOTTOM_BAND
        if not near_edge:
            continue
        if spread:
            numbers = [int(n) for n in re.findall(r"\d{1,4}", run["text"])]
            pair = next(
                ((a, b) for a, b in zip(numbers, numbers[1:]) if b == a + 1), None
            )
            if pair:
                out.append(("LEFT", pair[0]))
                out.append(("RIGHT", pair[1]))
                continue
        value = folio_value(run["text"])
        if value is None:
            continue
        half = None
        if spread:
            half = "LEFT" if run["x"] < width / 2 else "RIGHT"
        out.append((half, value))
    return out


def folio_value(text):
    """The folio a margin run carries, or None.

    A folio is not always a run of its own. One document here sets it inside the
    running foot, so the run reads "Anant Raj Limited 225", and on the facing
    page the digits are not even separated by a space. Taking the trailing digits
    of a margin run recovers those; requiring the whole run to be digits finds
    only the fifth of that document where the foot happens to be set differently,
    which is how a mapping ends up resting on one contiguous block of pages.
    """
    if FOLIO.match(text):
        return int(text)
    trailing = re.search(r"(\d{1,4})\s*$", text)
    return int(trailing.group(1)) if trailing else None


def slot(index, half, spread):
    """The ordinal position of a printed page in the document, counting from zero.

    On a spread the left half of index n comes before its right half, so the two
    halves are consecutive slots. This is what lets one arithmetic serve both
    layouts.
    """
    if not spread:
        return index
    return index * 2 + (1 if half == "RIGHT" else 0)


def fit(reader, spread):
    """Propose the mapping the most printed folios agree on.

    Each observed folio implies one offset between slot and printed number. The
    modal offset wins. A tie cannot be broken honestly, so it is reported.
    """
    observed = []
    for index in range(len(reader.pages)):
        for half, value in candidates(reader.pages[index], spread):
            observed.append((index, half, value))

    votes = Counter(slot(i, h, spread) - v for i, h, v in observed)
    if not votes:
        return None, [], observed
    ranked = votes.most_common()
    if len(ranked) > 1 and ranked[0][1] == ranked[1][1]:
        raise SystemExit(
            f"two offsets are equally supported, {ranked[0]} and {ranked[1]}. "
            "Inspect the document by hand rather than letting this guess."
        )
    offset = ranked[0][0]
    agreeing = [(i, h, v) for i, h, v in observed if slot(i, h, spread) - v == offset]
    return offset, agreeing, observed


def main():
    ap = argparse.ArgumentParser(description="Recover printed page numbering from folios.")
    ap.add_argument("pdf", type=Path)
    ap.add_argument("--spread", action="store_true",
                    help="two printed pages per PDF page, left then right")
    ap.add_argument("--anchors", type=int, default=4,
                    help="how many anchors to emit, spread across the document")
    args = ap.parse_args()

    reader = PdfReader(str(args.pdf))
    offset, agreeing, observed = fit(reader, args.spread)
    if offset is None:
        raise SystemExit("no folio was found anywhere in this document")

    # printed 1 sits at the slot where printed minus offset lands on one.
    slot_of_one = 1 + offset
    if args.spread:
        index_of_one, parity = divmod(slot_of_one, 2)
        half_of_one = "RIGHT" if parity else "LEFT"
    else:
        index_of_one, half_of_one = slot_of_one, None

    # Where the mapping starts holding. A document whose front matter is numbered
    # separately disagrees at the start and then settles, and saying so is more
    # useful than pretending one rule covers the whole file.
    agreeing.sort()
    disagreeing = sorted(set(observed) - set(agreeing))
    valid_from = 0
    if disagreeing and agreeing:
        first_agreeing = agreeing[0][0]
        if any(i < first_agreeing for i, _, _ in disagreeing):
            valid_from = first_agreeing

    # Anchors spread across the document rather than clustered, because a run of
    # neighbours all agreeing says less than the same count spanning the file.
    step = max(1, len(agreeing) // max(1, args.anchors))
    picked = agreeing[::step][: args.anchors]

    out = {
        "kind": "SPREAD" if args.spread else "SINGLE",
        "printedPagesPerPdfPage": 2 if args.spread else 1,
        "pdfIndexOfPrintedOne": index_of_one,
        "halfOfPrintedOne": half_of_one,
        "validFromPdfIndex": valid_from,
        "anchors": [
            {"pdfIndex": i, "printedPage": v, "half": h} for i, h, v in picked
        ],
    }
    print(json.dumps(out, indent=2))
    print(f"\n# {len(agreeing)} folios agree, {len(disagreeing)} disagree, "
          f"across {len(reader.pages)} PDF pages")
    if disagreeing:
        shown = ", ".join(f"index {i} prints {v}" for i, _, v in disagreeing[:12])
        print(f"# disagreeing: {shown}")


if __name__ == "__main__":
    main()
