"""Triage a 563 page prospectus so that human reading goes where evidence is.

Nobody reads a draft red herring prospectus end to end, and selective reading
without a stated rule is cherry picking. This scores every page on two things
that are cheap to measure and hard to fake:

  number density  numeric tokens as a share of words
  hedge density   hedging terms as a share of words

A page thick with figures and thin on "may" and "no assurance" is where the
issuer committed to something. A page thick with hedging and thin on figures is
where it did not. The rule is stated, applied to every page equally, and
published, so a reader can disagree with the ranking on its own terms.

The hedge lexicon is written into the output rather than left in this file. A
derived metric whose word list is hidden is not reproducible, and this project
does not get to publish an unfalsifiable score while documenting other people's
missing denominators.

The prospectus itself is not committed; it is 12 MB. Pass its path and this
verifies the SHA256 against the manifest before scoring anything, so the
exhibit can never describe a different document than the extracts do.

    python pipeline/drhp_triage.py path/to/drhp.pdf
"""

import hashlib
import json
import re
import statistics
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MANIFEST = ROOT / "data" / "raw" / "prospectus" / "drhp_extracts.json"
OUT = ROOT / "data" / "drhp_triage.json"

# Published in the artefact, not hidden here. Terms that defer, qualify or
# disclaim rather than state.
HEDGE_WORDS = [
    "may", "might", "could", "would", "believe", "believes", "expect",
    "expects", "intend", "intends", "anticipate", "anticipates", "estimate",
    "estimates", "potential", "potentially", "possible", "seek", "seeks",
    "strive", "aim", "assurance", "assure", "uncertain", "uncertainty",
    "subject to", "no guarantee", "cannot predict",
]

# Pages below this are covers, dividers and section title pages. Scoring them
# would put noise in both tails.
MIN_WORDS = 80

NUM = re.compile(r"\d[\d,]*\.?\d*")

# Numbered footnote definitions, the shape "(1) Built Capacity is the maximum
# IT load a data center is engineered to support". This is where a document
# defines its own metrics, and it is where "built" turned out to mean designed.
#
# The definitions section proper cannot be detected: it is a two column table
# with the term on the left and the definition on the right, carrying neither
# quotation marks nor the word means. Counting those would need layout aware
# extraction, so this deliberately measures only footnote definitions and the
# field is named for what it actually counts.
DEFINED = re.compile(r"\(\d{1,2}\)\s+([A-Z][A-Za-z ]{3,40}?)\s+(?:is|are|means|refers to)\s+", re.M)
HEDGE = re.compile(r"\b(" + "|".join(w.replace(" ", r"\s+") for w in HEDGE_WORDS) + r")\b", re.I)


def sha256(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(1 << 20), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest():
    d = json.loads(MANIFEST.read_text(encoding="utf-8"))
    sections = {k: v for k, v in d["sectionMap"].items() if not k.startswith("_")}
    return d["manifest"], sections


def section_for(printed_page, sections):
    """The last section whose start page is at or before this one."""
    current = "FRONT MATTER"
    for name, start in sorted(sections.items(), key=lambda kv: kv[1]):
        if printed_page >= start:
            current = name
    return current


def score_page(text):
    words = text.split()
    n = len(words)
    if n < MIN_WORDS:
        return None
    numbers = len(NUM.findall(text))
    hedges = len(HEDGE.findall(text))
    number_density = numbers / n * 100
    hedge_density = hedges / n * 100
    return {
        "words": n,
        "numberDensity": round(number_density, 2),
        "hedgeDensity": round(hedge_density, 3),
        "footnoteDefinitions": len(DEFINED.findall(text)),
        # one plus the hedge density, so a page with no hedging is not divided
        # by zero and a heavily hedged page is penalised proportionally
        "substanceScore": round(number_density / (1 + hedge_density), 2),
    }


def triage(pdf_path):
    import pypdf

    manifest, sections = load_manifest()
    digest = sha256(pdf_path)
    if digest != manifest["sha256"]:
        raise SystemExit(
            "checksum mismatch: this is not the document the extracts describe.\n"
            f"  expected {manifest['sha256']}\n  got      {digest}\n"
            f"  re download from {manifest['url']}"
        )

    reader = pypdf.PdfReader(str(pdf_path))
    offset = manifest["pageOffset"]
    pages = []
    for i, page in enumerate(reader.pages):
        scored = score_page(page.extract_text() or "")
        if scored is None:
            continue
        printed = i - offset
        pages.append({"printedPage": printed, "section": section_for(printed, sections), **scored})

    by_section = {}
    for p in pages:
        by_section.setdefault(p["section"], []).append(p)

    section_rows = []
    for name, rows in by_section.items():
        section_rows.append({
            "section": name,
            "pages": len(rows),
            "shareOfScored": round(len(rows) / len(pages) * 100, 1),
            "numberDensity": round(statistics.mean(r["numberDensity"] for r in rows), 2),
            "hedgeDensity": round(statistics.mean(r["hedgeDensity"] for r in rows), 3),
            "footnoteDefinitions": sum(r["footnoteDefinitions"] for r in rows),
        })
    section_rows.sort(key=lambda r: -r["numberDensity"])

    return {
        "document": {
            "title": "Sify Infinit Spaces Limited, Draft Red Herring Prospectus",
            "documentDate": "2025-10-16",
            "sha256": digest,
            "pdfPages": len(reader.pages),
            "pageOffset": offset,
            "scoredPages": len(pages),
        },
        "method": {
            "numberDensity": "numeric tokens as a percentage of words on the page",
            "hedgeDensity": "hedging terms as a percentage of words on the page",
            "substanceScore": "number density divided by one plus hedge density",
            "minWords": MIN_WORDS,
            "minWordsNote": "pages below this are covers, dividers and section titles",
            "hedgeLexicon": HEDGE_WORDS,
            "lexiconNote": (
                "Published so the score can be argued with. A ranking whose word "
                "list is hidden is not falsifiable."
            ),
        },
        "sections": section_rows,
        "pages": pages,
    }


def demo():
    """Self check. Asserts the findings the site states, so a re run that
    contradicts the page fails here rather than leaving stale prose."""
    data = json.loads(OUT.read_text(encoding="utf-8"))
    secs = {s["section"]: s for s in data["sections"]}

    risk = secs["RISK FACTORS"]
    others = [s for s in data["sections"] if s["section"] != "RISK FACTORS"]
    assert all(risk["hedgeDensity"] > o["hedgeDensity"] for o in others), (
        "risk factors are no longer the most hedged section; the page says they are"
    )

    restated = secs["RESTATED CONSOLIDATED FINANCIAL INFORMATION"]
    assert restated["numberDensity"] > risk["numberDensity"], (
        "audited financials should carry more figures than risk boilerplate"
    )

    top3 = sorted(data["pages"], key=lambda p: -p["numberDensity"])[:3]
    assert any(p["printedPage"] == 49 for p in top3), (
        "printed page 49, the capacity table, left the three densest pages"
    )

    industry = secs["INDUSTRY OVERVIEW"]
    assert industry["shareOfScored"] > 20, (
        "the commissioned market study is no longer a fifth of the document"
    )

    assert data["method"]["hedgeLexicon"], "the lexicon must ship with the score"
    print("drhp_triage self check ok")
    print(f"  scored {data['document']['scoredPages']} of {data['document']['pdfPages']} pages")
    print(f"  risk factors hedge {risk['hedgeDensity']}% against restated {restated['hedgeDensity']}%")
    print(f"  industry overview is {industry['shareOfScored']}% of scored pages")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        result = triage(Path(sys.argv[1]))
        OUT.write_text(json.dumps(result, indent=2), encoding="utf-8")
        print(f"wrote {OUT.relative_to(ROOT)}: {result['document']['scoredPages']} pages scored")
    demo()
