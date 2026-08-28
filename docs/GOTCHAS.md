# Gotchas

Each of these cost real time to find once. They are recorded so they cost nothing the second time.

## Reading filings

**Segment operating expense flips sign between filings.** Sify FY2023 is filed negative and every
other year positive. The magnitudes agree; only the convention differs. `assertSameSign` exists to
fail loudly rather than let a margin silently invert.

**Concept names drift between filers.** Infosys tags recent capital expenditure as "Expenditure on
property, plant and equipment and intangibles"; Sify and Wipro use "Purchase of property plant and
equipment classified as investing activities". The Infosys line includes intangibles and is not
strictly comparable. Query the available concepts before assuming a name.

**A wrong concept does not error, it answers a different question.** Querying Digital Realty for
`revenues` returns `Equity method investment summarized financial information revenue`, roughly
twenty times too small. The total revenue concept is `Revenue`. This is the expensive class of
mistake, because nothing fails.

**Adjusted EBITDA is in no metric class, for any filer.** It is not GAAP, so it is not XBRL tagged,
and a filings query returns zero rows. The figure lives in the earnings call transcripts instead,
as a dated verbatim quote with a named speaker. When a measure is non-GAAP, reach for the
transcripts, not the filings.

**Digital Realty tags share based compensation in shares, not dollars.** The only matching concept
is `Share based compensation arrangement by share based payment award shares issued in period`.
There is no dollar expense series, so its adjusted EBITDA cannot be rebuilt from tagged data. Its
impairment concept also stops at 2022, which is exactly where the derived margin starts drifting.

**Equinix has no annual operating income series before 2020**, and its segment class is quarterly
from 2023 with a separate annual run from 2017 to 2021 and a gap at 2022. Annual detail that looks
missing is often present under a different concept: `Depreciation depletion and amortization` does
have an annual series back to 2016 even though a keyword search filtered to annual returned
nothing useful. Query by concept before concluding absence.

**A missing add back is not a zero add back.** `reconcileMargin` returns NOT_RECONCILABLE when the
non-GAAP add backs cannot be built, rather than treating them as nought. A filer that does not tag
its stock compensation has not told us it pays none.

## Reading transcripts

**The 50 row cap has no pagination.** `limit` is validated at 50 or less and there is no `offset`
parameter. Six of eight topic partitions came back at exactly 50 and were silently censored. The
only reliable completeness test is `rows returned < limit`.

**`truncated: false` is a lie when the response is capped.** It reported false on a 50 row response
drawn from a set of 239. Never trust the flag; compare the row count against the limit.

**Rows arrive newest first, which is what rescues a windowed analysis.** Because every capped
response reached back past the start of the analysis window, the window itself was complete even
where the full history was not. Check that the oldest returned row predates the window start
before assuming a capped response is unusable, and before spending calls on per quarter paging.

**Partition by topic family, never by keyword.** Filtering by family with no query returns the
complete family. Adding a query silently turns a partition into a ranked search and destroys the
denominator, which is the whole point of the measure.

**A quarter filter takes one exact quarter, never a year.** `FY2025` returns zero rows while
`FY2025Q2` works. Paging a capped family across a full history therefore costs 42 calls.

**Response quality arrives lower case** (`confirmed`, `partial`, `deflected`, `declined`) while the
schema enum is upper case. Map on ingest.

**Field names differ from the ones stored here.** The source calls them `topic_pressed`,
`pressing_firms` and `specific_ask`; the register uses `topic`, `askedBy` and `refusedNumber`.

**Fiscal labels are unreliable.** The transcript source tags January 2024 as FY2023Q3 and January
2025 as FY2025Q3. Order by calendar date, always.

## Reading the prospectus

**Printed page numbers are not PDF indices.** The offset is 4: PDF zero based index equals printed
page plus 4, verified against four section headings. Cite printed pages, because that is what a
reader can follow.

**The binary is not committed.** It is 12 MB. `data/raw/prospectus/drhp_extracts.json` carries the
URL, a SHA256 and the page offset instead, so any extract can be audited against a re download.
This is a deliberate departure from one file per source, recorded rather than hidden.

## Layer 0

**`data/raw/filings/SIFY` and `data/raw/transcripts/SIFY` are incomplete.** Layer 0 is real from the
Equinix and Digital Realty harvest onward, and the test suite reads those files rather than
retyping their numbers, so the layer has a consumer and cannot rot silently. Sify predates the
practice and is the one remaining backfill. Say that, rather than claiming the layer exists
everywhere.

## Tooling

**Python `write_text` defaults to cp1252 on Windows** and corrupts UTF-8. Always pass
`encoding="utf-8"`. It silently broke two files once. The same encoding trap appears when printing
non-ASCII to a Windows console; set `PYTHONIOENCODING=utf-8`.

**Floating point bites the obvious assertion.** `(41 + 13.7) - 41` is `13.700000000000003`, not
`13.7`. Compare with a tolerance.

**`next start` survives `pkill`.** Kill by port, or serve a stale build and debug a phantom.

**Turbopack dev reports a hydration mismatch from `next/font`** that does not exist in the
production build. Check production before chasing one.

**`overflow-x-auto` does not save you inside a flex column.** `body` is `flex flex-col`, so the page
root needs `min-w-0` or it refuses to shrink below a table's `min-w` and the whole page scrolls
sideways instead of the table.

**Re-validate the palette whenever a hue changes**, in both themes, against this site's own
surfaces. The first palette shipped with two hues 10.1 apart on the normal vision scale against a
floor of 15, and full colour readers could not separate them.
