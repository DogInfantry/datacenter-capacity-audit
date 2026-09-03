import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

// The modules are TypeScript, so the test exercises the arithmetic directly
// against the committed data. If a future refactor changes a formula, these
// numbers move and the test says so.
const co = JSON.parse(readFileSync(new URL("../../data/companies/sify.json", import.meta.url)));

const cr = (v) => v / 1e7;
const fin = Object.fromEntries(co.financials.map((r) => [r.fy, r]));
const seg = Object.fromEntries(co.segments.map((r) => [r.fy, r]));

test("segment revenue never exceeds group revenue", () => {
  for (const s of co.segments) {
    if (fin[s.fy]) assert.ok(s.revenue <= fin[s.fy].revenue, `${s.fy} segment > group`);
  }
});

test("data centre margin sits in the colocation band once mature", () => {
  const m = (fy) => (seg[fy].revenue - Math.abs(seg[fy].opex)) / seg[fy].revenue;
  // the sector reports 40 to 50 per cent for stabilised colocation; a read
  // outside that band means the series is being parsed wrongly
  assert.ok(m("FY2026") > 0.4 && m("FY2026") < 0.5, `FY2026 margin ${m("FY2026")}`);
  assert.ok(m("FY2025") > 0.4 && m("FY2025") < 0.5, `FY2025 margin ${m("FY2025")}`);
});

test("the FY2023 opex sign anomaly is handled, not hidden", () => {
  const signs = new Set(co.segments.map((s) => Math.sign(s.opex)));
  // the raw filings disagree on sign; the data keeps what was filed and the
  // note records why, so this asserts the anomaly still exists to be handled
  assert.ok(co.segments.some((s) => s.note?.includes("negative sign")),
    "the sign anomaly lost its explanatory note");
  assert.ok(signs.size >= 1);
});

test("capex outran operating cash flow every year from FY2022", () => {
  const years = ["FY2022", "FY2023", "FY2024", "FY2025", "FY2026"];
  for (const fy of years) {
    assert.ok(fin[fy].capex > fin[fy].cfo, `${fy} capex did not exceed CFO`);
  }
});

test("the cumulative funding gap is the size the prospectus is raising", () => {
  const years = ["FY2022", "FY2023", "FY2024", "FY2025", "FY2026"];
  const capex = years.reduce((s, fy) => s + fin[fy].capex, 0);
  const cfo = years.reduce((s, fy) => s + fin[fy].cfo, 0);
  const gapCr = cr(capex - cfo);
  // this is the load-bearing claim of the financials page: five years of
  // outspending internal cash, then a fresh issue of about that size
  assert.ok(gapCr > 1800 && gapCr < 2300, `gap ${gapCr.toFixed(0)} cr outside expected range`);
});

test("data centre share of group revenue rose, and is stated correctly", () => {
  const share = (fy) => seg[fy].revenue / fin[fy].revenue;
  assert.ok(share("FY2026") > share("FY2021"), "share did not rise");
  assert.ok(Math.abs(share("FY2026") - 0.39) < 0.01, `FY2026 share ${share("FY2026")}`);
});

// ---- cross company, added when coverage widened past one name ----

const others = ["wipro", "infosys", "equinix", "digitalrealty"].map((n) =>
  JSON.parse(readFileSync(new URL(`../../data/companies/${n}.json`, import.meta.url))),
);
const all = [co, ...others];
const byTicker = Object.fromEntries(all.map((c) => [c.ticker, c]));

test("no two companies in the set share a comparison unit by accident", () => {
  // three companies, two currencies. the point is not that they match, it is
  // that the code must never add across them
  const currencies = new Set(all.map((c) => c.currency));
  assert.ok(currencies.size > 1, "test is vacuous if every filer uses one currency");
});

test("capex over CFO is currency free and separates the business models", () => {
  const ratio = (c, fy) => {
    const r = c.financials.find((x) => x.fy === fy);
    return r && r.cfo && r.capex ? r.capex / r.cfo : null;
  };
  const heavy = ratio(all.find((c) => c.ticker === "SIFY"), "FY2026");
  const lightW = ratio(all.find((c) => c.ticker === "WIT"), "FY2026");
  const lightI = ratio(all.find((c) => c.ticker === "INFY"), "FY2026");
  assert.ok(heavy > 1, `asset heavy operator should outspend cash flow, got ${heavy}`);
  assert.ok(lightW < 0.3, `asset light services should not, got ${lightW}`);
  assert.ok(lightI < 0.3, `asset light services should not, got ${lightI}`);
  // the headline claim: roughly an order of magnitude apart
  assert.ok(heavy / lightW > 5, `spread too small: ${heavy / lightW}`);
});

test("Wipro rose in rupees and fell in dollars, which is why both are kept", () => {
  const w = all.find((c) => c.ticker === "WIT");
  const at = (fy) => w.financials.find((x) => x.fy === fy);
  assert.ok(at("FY2026").revenue > at("FY2023").revenue, "rupee line did not rise");
  assert.ok(at("FY2026").revenueUsd < at("FY2023").revenueUsd, "dollar line did not fall");
});

test("every company doc carries a currency and a segment basis", () => {
  for (const c of all) {
    assert.ok(c.currency, `${c.ticker} has no currency`);
    // segments may be empty, but the doc must say why rather than imply none exist
    if (!c.segments || c.segments.length === 0) {
      assert.ok(c.segmentBasis === "NOT_HARVESTED", `${c.ticker} has no segments and no reason given`);
    }
  }
});

// ---- the external check, added when the harvest was validated for the first time ----
//
// Everything above compares the project against itself. These compare it
// against what the companies said out loud. The reconstruction is the filer's
// own definition of adjusted EBITDA: operating income plus depreciation plus
// the add backs. Segment opex is stored excluding depreciation, so revenue
// less opex is already operating income plus depreciation.

const TOLERANCE_ACTUAL_BP = 150;
const TOLERANCE_GUIDE_BP = 250;

const marginOf = (revenue, opex, addBacks) =>
  (revenue - Math.abs(opex) + (addBacks ?? 0)) / revenue;
const bp = (a, b) => (a - b) * 10000;

test("Equinix Q2 2025 reconstructs to the margin its chief executive stated", () => {
  // read from Layer 0 rather than retyped here, so the test breaks if the
  // evidence and the normalised doc ever drift apart
  const raw = JSON.parse(
    readFileSync(new URL("../../data/raw/filings/EQIX/facts.json", import.meta.url)),
  );
  const q = "2025-04-01/2025-06-30";
  const revenue = raw.concepts["revenue"].quarterly[q];
  const opInc = raw.concepts["Operating income loss"].quarterly[q];
  const da = raw.concepts["Depreciation depletion and amortization"].quarterly[q];
  // the stock compensation series is keyed on the prior period end because the
  // server derives the quarter by subtracting Q1 from the first half
  const sbc = raw.concepts["Share based compensation"].quarterly["2025-03-31/2025-06-30"];

  for (const [name, v] of Object.entries({ revenue, opInc, da, sbc })) {
    assert.ok(typeof v === "number", `Layer 0 is missing ${name} for ${q}`);
  }

  const reconstructed = (opInc + da + sbc) / revenue;
  const stated = 0.5; // "Adjusted EBITDA margins increased to 50% of revenues"
  const delta = bp(reconstructed, stated);
  assert.ok(
    Math.abs(delta) <= TOLERANCE_ACTUAL_BP,
    `Q2 2025 reconstruction ${(reconstructed * 100).toFixed(2)}% is ${delta.toFixed(0)} bp from the stated 50%`,
  );
});

test("Equinix FY2025 reconstructs inside the tolerance for a guided figure", () => {
  const eq = byTicker.EQIX;
  const seg = eq.segments.find((s) => s.fy === "FY2025");
  const stated = eq.statedMargins.find((s) => s.period === "FY2025");
  assert.ok(seg && stated, "FY2025 segment row or stated margin is missing");
  assert.equal(stated.isActual, false, "the FY2025 reference is guidance, not an actual");

  const reconstructed = marginOf(seg.revenue, seg.opex, seg.nonGaapAddBacks);
  const delta = bp(reconstructed, stated.value / 100);
  assert.ok(
    Math.abs(delta) <= TOLERANCE_GUIDE_BP,
    `FY2025 reconstruction ${(reconstructed * 100).toFixed(2)}% is ${delta.toFixed(0)} bp from the guided ${stated.value}%`,
  );
});

test("the add backs are what close the gap, so dropping them must fail the check", () => {
  // guards against the reconstruction passing for the wrong reason. if this
  // ever passes without add backs, the tolerance has gone slack
  const eq = byTicker.EQIX;
  const seg = eq.segments.find((s) => s.fy === "FY2025");
  const stated = eq.statedMargins.find((s) => s.period === "FY2025");
  const withoutAddBacks = marginOf(seg.revenue, seg.opex, undefined);
  assert.ok(
    Math.abs(bp(withoutAddBacks, stated.value / 100)) > TOLERANCE_GUIDE_BP,
    "the derived margin alone already sits inside tolerance, so the check proves nothing",
  );
});

test("Digital Realty reconciles in FY2018 and cannot be reconciled at all", () => {
  const dlr = byTicker.DLR;

  // no year carries add backs: share based compensation is tagged in shares,
  // impairment stops at 2022, transaction costs are not tagged
  for (const s of dlr.segments) {
    assert.equal(
      s.nonGaapAddBacks,
      undefined,
      `${s.fy} claims add backs that this filer does not tag`,
    );
  }

  // the derived margin still lands inside the band the chief financial officer
  // guided to, in the one year the accounts were simple enough
  const y2018 = dlr.segments.find((s) => s.fy === "FY2018");
  const derived2018 = marginOf(y2018.revenue, y2018.opex, undefined);
  assert.ok(
    derived2018 > 0.57 && derived2018 < 0.59,
    `FY2018 derived margin ${(derived2018 * 100).toFixed(2)}% left the 57 to 59 band`,
  );

  // and it has drifted far below the stated figure by FY2023
  const y2023 = dlr.segments.find((s) => s.fy === "FY2023");
  const stated2023 = dlr.statedMargins.find((s) => s.period === "FY2023");
  const gap = Math.abs(bp(marginOf(y2023.revenue, y2023.opex, undefined), stated2023.value / 100));
  assert.ok(gap > 500, `FY2023 gap of ${gap.toFixed(0)} bp is smaller than the finding claims`);
});

test("a year with no reference is marked unverified rather than left looking checked", () => {
  const dlr = byTicker.DLR;
  for (const fy of ["FY2023", "FY2024", "FY2025"]) {
    const s = dlr.segments.find((x) => x.fy === fy);
    assert.equal(
      s.source.verification,
      "UNVERIFIED",
      `${fy} is not marked UNVERIFIED despite reconciling against nothing`,
    );
  }
});

// ---- the disclosure register, once it became a rate rather than five examples ----

const reg = JSON.parse(
  readFileSync(new URL("../../data/disclosure_register.json", import.meta.url)),
);
const regCo = (t) => reg.companies.find((c) => c.ticker === t);
const rate = (c) => c.refused / c.pressed;

test("every company is measured over the identical family set", () => {
  // the comparison is meaningless otherwise. a rate over a different set of
  // topics is a different measurement however similar the number looks
  for (const c of reg.companies) {
    assert.equal(c.families.length, reg.families.length, `${c.ticker} family count differs`);
    for (const f of c.families) {
      assert.ok(reg.families.includes(f.family), `${c.ticker} measured over ${f.family}`);
    }
  }
});

test("no rate is shown without the denominator it came from", () => {
  for (const c of reg.companies) {
    assert.ok(c.pressed > 0, `${c.ticker} has a rate with no denominator`);
    const summed = c.families.reduce((s, f) => s + f.pressed, 0);
    assert.equal(summed, c.pressed, `${c.ticker} denominator does not match its parts`);
  }
});

test("the window is complete for every family, even where full history was capped", () => {
  // the source caps a response at 50 rows and has no pagination, so several
  // families are incomplete over their whole history. responses arrive newest
  // first and reach back past the window start, so the window itself is whole
  for (const c of reg.companies) {
    for (const f of c.families) {
      assert.equal(f.windowComplete, true, `${c.ticker} ${f.family} window is not complete`);
    }
  }
});

test("a partial answer is never counted as a refusal", () => {
  for (const c of reg.companies) {
    const refusedParts = c.families.reduce((s, f) => s + f.deflected + f.declined, 0);
    assert.equal(refusedParts, c.refused, `${c.ticker} numerator drifted from its parts`);
    const partials = c.families.reduce((s, f) => s + f.partial, 0);
    assert.ok(partials >= 0);
    // if partials were folded in, the rate would move; assert they are not
    assert.notEqual(c.refused, refusedParts + partials, `${c.ticker} counts partial as refusal`);
  }
});

test("every counted refusal is listed, so the numerator can be read", () => {
  for (const c of reg.companies) {
    assert.equal(c.refusals.length, c.refused, `${c.ticker} numerator is not enumerable`);
    for (const r of c.refusals) {
      assert.ok(["DECLINED", "DEFLECTED"].includes(r.responseQuality));
      if (r.publishedElsewhere) {
        assert.ok(r.publishedWhere, `${c.ticker} points somewhere without saying where`);
      }
    }
  }
});

test("the finding cuts against the easy story, and stays that way or fails", () => {
  // the naive version of this project's thesis is that the Indian operator
  // refuses where global peers disclose. it does not. if a data refresh ever
  // inverts this, the prose on the page becomes wrong and this test says so
  assert.ok(
    rate(regCo("SIFY")) < rate(regCo("EQIX")),
    `Sify refused ${rate(regCo("SIFY"))}, Equinix ${rate(regCo("EQIX"))}: the page says Sify refuses less`,
  );
  assert.ok(
    rate(regCo("SIFY")) < rate(regCo("DLR")),
    "the page says Sify refuses less often than Digital Realty too",
  );
});

test("Sify is pressed on unit economics far less often than its peers", () => {
  // the other half of the finding, and the reason the rate alone misleads
  const perCall = (c) => c.pressed / c.callsCovered;
  assert.ok(
    perCall(regCo("SIFY")) < perCall(regCo("DLR")),
    "the page claims Sify faces less questioning per call than Digital Realty",
  );
});

// ---- the prospectus, once the filed document was actually read ----

const pros = JSON.parse(readFileSync(new URL("../../data/prospectus.json", import.meta.url)));

test("every prospectus figure cites the printed page it was read from", () => {
  // a figure attributed to a 563 page document without saying where in it is
  // not checkable, which is the one thing this project refuses to render
  for (const [name, block] of Object.entries(pros)) {
    if (name === "document") continue;
    assert.ok(Number.isInteger(block.page) && block.page > 0, `${name} has no page cite`);
    assert.ok(
      block.page <= pros.document.pdfPages,
      `${name} cites page ${block.page}, beyond the ${pros.document.pdfPages} page document`,
    );
  }
  assert.ok(pros.capacity.headlineClaim.page > 0, "the headline claim has no page cite");
});

test("the offer components add up to the stated total", () => {
  const o = pros.offer;
  assert.equal(o.freshIssueMn + o.offerForSaleMn, o.totalMn);
  assert.equal(o.totalMn, 37000, "the offer is 37,000 million rupees, read from printed page 79");
});

test("the capacity rungs descend, and built is the widest", () => {
  const r = pros.capacity.rungs;
  for (let i = 1; i < r.length; i++) {
    assert.ok(r[i].mw <= r[i - 1].mw, `${r[i].name} is wider than ${r[i - 1].name}`);
  }
  assert.equal(r[0].name, "Built");
  // the finding: the widest rung is defined in terms of design, not construction
  assert.match(
    r[0].definition,
    /engineered to support|design specifications/,
    "the built rung lost the definition that makes it a design figure",
  );
});

test("the headline capacity overstates the revenue earning estate", () => {
  const [built, , operational] = pros.capacity.rungs;
  const over = built.mw / operational.mw - 1;
  // the page states this as a percentage; if the data moves, the prose is wrong
  assert.ok(over > 0.6 && over < 0.7, `overstatement is ${(over * 100).toFixed(1)}%`);
});

test("money already spent never exceeds the estimated cost of an object", () => {
  for (const r of pros.objects.rows) {
    assert.ok(r.deployed <= r.totalEstimatedCost, `${r.object} has spent more than it costs`);
  }
});

test("the object at the starting line is still at the starting line", () => {
  // the page claims 0.1 per cent. if a refresh moves it, the claim is stale
  const rabale = pros.objects.rows.find((r) => /Rabale/.test(r.object));
  const pctSpent = (rabale.deployed / rabale.totalEstimatedCost) * 100;
  assert.ok(pctSpent < 1, `Rabale is ${pctSpent.toFixed(2)}% spent, the page says under 1%`);
});

test("the Layer 0 extract carries a checksum so a figure can be audited", () => {
  const raw = JSON.parse(
    readFileSync(new URL("../../data/raw/prospectus/drhp_extracts.json", import.meta.url)),
  );
  assert.match(raw.manifest.sha256, /^[0-9a-f]{64}$/);
  assert.equal(
    raw.manifest.sha256,
    pros.document.sha256,
    "the extract and the data disagree on which file was read",
  );
  assert.equal(raw.manifest.pagination.pdfIndexOfPrintedOne, 5,
    "the position of printed page one is what makes a cite followable");
});

// ---- the document triage, which decides what gets read at all ----

const triage = JSON.parse(
  readFileSync(new URL("../../data/drhp_triage.json", import.meta.url)),
);

test("the triage describes the same document the extracts do", () => {
  const raw = JSON.parse(
    readFileSync(new URL("../../data/raw/prospectus/drhp_extracts.json", import.meta.url)),
  );
  assert.equal(triage.document.sha256, raw.manifest.sha256, "the triage scored a different file");
  assert.equal(triage.document.pdfPages, raw.manifest.pdfPages);
  // the same document described in two files. if they ever disagree, one of
  // them is citing pages that do not exist where it says they do
  assert.deepEqual(triage.document.pagination, raw.manifest.pagination,
    "the two files describing the prospectus disagree about its pagination");
});

test("the hedging lexicon ships with the score", () => {
  // a ranking whose word list is hidden cannot be argued with, which would make
  // it exactly the kind of unfalsifiable claim this project exists to catch
  assert.ok(triage.method.hedgeLexicon.length >= 5, "the lexicon is missing or trivial");
  assert.ok(triage.method.hedgeLexicon.includes("may"));
  assert.ok(triage.method.minWords > 0, "the page length threshold must be stated");
});

test("every scored page belongs to a section the map knows", () => {
  const known = new Set(triage.sections.map((s) => s.section));
  for (const p of triage.pages) {
    assert.ok(known.has(p.section), `page ${p.printedPage} has section ${p.section}`);
  }
  const summed = triage.sections.reduce((s, x) => s + x.pages, 0);
  assert.equal(summed, triage.pages.length, "section counts do not add up to the page count");
  assert.equal(triage.document.scoredPages, triage.pages.length);
});

test("risk factors are the most hedged section, which is the claim on the page", () => {
  const risk = triage.sections.find((s) => s.section === "RISK FACTORS");
  const others = triage.sections.filter((s) => s.section !== "RISK FACTORS");
  for (const o of others) {
    assert.ok(
      risk.hedgeDensity > o.hedgeDensity,
      `${o.section} now hedges more than risk factors, and the page says otherwise`,
    );
  }
  // and the page claims it is more than twice any other section
  const next = Math.max(...others.map((o) => o.hedgeDensity));
  assert.ok(risk.hedgeDensity > 2 * next, `risk ${risk.hedgeDensity} against next ${next}`);
});

test("audited financials carry more figures than risk boilerplate", () => {
  const restated = triage.sections.find((s) => s.section.startsWith("RESTATED"));
  const risk = triage.sections.find((s) => s.section === "RISK FACTORS");
  assert.ok(restated.numberDensity > risk.numberDensity);
});

test("the rule finds the page that produced the capacity finding", () => {
  // printed 49 is the capacity table. the triage ranked it top without being
  // told what was on it, which is the only evidence the method is not circular
  const top3 = [...triage.pages].sort((a, b) => b.numberDensity - a.numberDensity).slice(0, 3);
  assert.ok(top3.some((p) => p.printedPage === 49), "page 49 left the three densest pages");
  const p49 = triage.pages.find((p) => p.printedPage === 49);
  assert.ok(p49.footnoteDefinitions >= 4, "page 49 should carry the capacity definitions");
});

test("self definition is rare, which is why where it happens matters", () => {
  const total = triage.sections.reduce((s, x) => s + x.footnoteDefinitions, 0);
  assert.ok(total > 0 && total < 40, `${total} footnote definitions is outside the stated range`);
});

// ---- the schedule against the slippage base rate ----

const slipRate = JSON.parse(readFileSync(new URL("../../data/base_rate.json", import.meta.url)));

// mirrors lib/diagnostics/schedule.ts, which is TypeScript
const ANCHOR = { year: 2025, month: 10 };
const monthsFromAnchor = (y, m) => (y - ANCHOR.year) * 12 + (m - ANCHOR.month);
const fyEnd = (fy) => monthsFromAnchor(fy, 3);
const fyStart = (fy) => monthsFromAnchor(fy - 1, 4);
const band = (end, b) => [
  end + b.median_months,
  end + b.cost_weighted_mean_months,
  end + b.p90_months,
];

test("Indian fiscal years end in March, not December", () => {
  // Fiscal 2029 runs April 2028 to March 2029. Reading it as a calendar year
  // would move every bar on the chart nine months to the right
  assert.equal(fyEnd(2029), monthsFromAnchor(2029, 3));
  assert.equal(fyStart(2027), monthsFromAnchor(2026, 4));
  assert.ok(fyEnd(2029) > fyStart(2027), "the window must run forwards");
  assert.equal(fyEnd(2029) - fyStart(2027), 35, "April 2026 to March 2029 is 35 months apart");
});

test("the slip band widens, and its order is never scrambled", () => {
  const [median, costWeighted, p90] = band(fyEnd(2029), slipRate);
  assert.ok(median < costWeighted, "cost weighted slippage exceeds the median in this data");
  assert.ok(costWeighted < p90, "the ninetieth percentile is the far edge");
});

test("the slip band is derived from the base rate file, not from literals", () => {
  // the load bearing test. a chart that hardcodes 13.7 months has stopped
  // being a measurement and become an illustration
  const real = band(fyEnd(2029), slipRate);
  const doubled = band(fyEnd(2029), {
    median_months: slipRate.median_months * 2,
    cost_weighted_mean_months: slipRate.cost_weighted_mean_months * 2,
    p90_months: slipRate.p90_months * 2,
  });
  for (let i = 0; i < real.length; i++) {
    assert.notEqual(real[i], doubled[i], "changing the base rate did not move the band");
  }
  // and the values that reach the page are the ones actually in the file
  // a tolerance, because 41 + 13.7 - 41 is 13.700000000000003 in binary floating point
  assert.ok(
    Math.abs(real[1] - fyEnd(2029) - slipRate.cost_weighted_mean_months) < 1e-9,
    "the band offset is not the cost weighted mean from the file",
  );
});

test("the chart records what its band actually measures", () => {
  // the one way to render this dishonestly is to present a transmission delay
  // distribution as a forecast of data centre construction. a required literal
  // survives an edit to the prose that a caveat sentence would not
  assert.equal(pros.objects.scheduleBasis, "ISTS_TRANSMISSION_ANALOGY");
  assert.match(pros.objects.scheduleBasisNote, /not a forecast/i);
});

test("an object is only drawn across the years its money is actually in", () => {
  const debt = pros.objects.rows.find((r) => /Repayment/.test(r.object));
  assert.ok(debt.fiscal2027 > 0 && !debt.fiscal2028 && !debt.fiscal2029);
  const construction = pros.objects.rows.filter((r) => !/Repayment/.test(r.object));
  for (const c of construction) {
    assert.ok(c.fiscal2029 > 0, `${c.object} should still be spending in Fiscal 2029`);
  }
});

test("fiscal labels are not comparable across the set, so period end is the key", () => {
  const endYear = (r) => Number(r.periodEnd.slice(0, 4));
  const marchClosers = all.filter((c) => c.fiscalYearEnd === "03-31").map((c) => c.ticker);
  const decemberClosers = all.filter((c) => c.fiscalYearEnd === "12-31").map((c) => c.ticker);
  assert.ok(marchClosers.length > 0 && decemberClosers.length > 0,
    "the test is vacuous unless the set mixes fiscal conventions");

  // the same FY label means different period ends across the set, which is
  // exactly why the comparison table must key on the period end
  const endsForFy2025 = new Set(
    all
      .map((c) => c.financials.find((f) => f.fy === "FY2025"))
      .filter(Boolean)
      .map((f) => f.periodEnd),
  );
  assert.ok(endsForFy2025.size > 1, "FY2025 resolved to one period end, so the collision is untested");

  // within one company, a period end year must identify exactly one row
  for (const c of all) {
    const years = c.financials.map(endYear);
    assert.equal(new Set(years).size, years.length, `${c.ticker} has two rows ending in one year`);
  }
});

// ---- Netweb, the name measured on an order book rather than megawatts ----
const nw = JSON.parse(readFileSync(new URL("../../data/netweb.json", import.meta.url)));

test("the anchor order fits inside the book it is measured against", () => {
  // if this inverts, the share the page draws is above 100 per cent and the
  // exhibit is arithmetic nonsense rather than a finding
  assert.ok(nw.anchorOrder.valueCr <= nw.orderBook.valueCr,
    `${nw.anchorOrder.valueCr} cr order against a ${nw.orderBook.valueCr} cr book`);
});

test("the order book postdates the award, so the order is actually in it", () => {
  // both dates are zero padded, so the string comparison is a date comparison,
  // and the award is allowed month precision while the book carries a day
  assert.ok(nw.orderBook.asOf > nw.anchorOrder.awarded,
    `book at ${nw.orderBook.asOf} does not postdate the award at ${nw.anchorOrder.awarded}`);
});

test("the concentration and the remainder reconcile to the book", () => {
  const rest = nw.orderBook.valueCr - nw.anchorOrder.valueCr;
  assert.equal(nw.anchorOrder.valueCr + rest, nw.orderBook.valueCr);
  const share = (nw.anchorOrder.valueCr / nw.orderBook.valueCr) * 100;
  // the load bearing claim of the page: one counterparty is most of the book
  assert.ok(share > 60 && share < 75, `share ${share.toFixed(1)} outside the claimed range`);
});

test("no Netweb figure claims to be traced to a filing", () => {
  // no Netweb document has been opened in this repository, and the page says so
  assert.equal(nw.source.verification, "SECONDARY");
  assert.ok(nw.notRead.length > 0, "a page this thin has to list what it did not read");
  assert.ok(nw.concentrationCaveat.length > 0, "the ceiling caveat is not optional");
});

// ---- the invariant ledger, checked against the source it describes ----
const inv = JSON.parse(readFileSync(new URL("../../data/invariants.json", import.meta.url)));
const schemaSrc = readFileSync(new URL("../schema.ts", import.meta.url), "utf8");
// The Invariants schema is itself refined, and those messages guard the ledger
// rather than the data. Count only what comes before it, or the register would
// be required to document its own registrar.
const guardedSrc = schemaSrc.slice(0, schemaSrc.indexOf("export const Invariants"));

test("every documented invariant still exists in the schema source", () => {
  for (const r of inv.rows) {
    assert.ok(guardedSrc.includes(r.fragment),
      `${r.id}: the message fragment "${r.fragment}" is no longer in lib/schema.ts`);
  }
});

test("no invariant exists without being documented", () => {
  // if these diverge, either a guard was added and not written up, or a row was
  // left behind after its guard was deleted. Both make the methodology page lie.
  const messages = (guardedSrc.match(/message:/g) ?? []).length;
  assert.equal(messages, inv.rows.length,
    `lib/schema.ts emits ${messages} messages but the ledger documents ${inv.rows.length}`);
});

test("each fragment identifies exactly one guard", () => {
  for (const r of inv.rows) {
    const hits = guardedSrc.split(r.fragment).length - 1;
    assert.equal(hits, 1, `${r.id}: fragment matches ${hits} places, so it does not identify one guard`);
  }
});

// ---- the reading rule, checked against the pages it was supposed to find ----
const tri = JSON.parse(readFileSync(new URL("../../data/drhp_triage.json", import.meta.url)));
const triSisl = JSON.parse(readFileSync(new URL("../../data/sisl.json", import.meta.url)));
const triPros = JSON.parse(readFileSync(new URL("../../data/prospectus.json", import.meta.url)));

const citedPageList = (() => {
  const found = new Set();
  const walk = (n) => {
    if (n === null || typeof n !== "object") return;
    for (const [k, v] of Object.entries(n)) {
      if (k === "page" && typeof v === "number") found.add(v);
      else walk(v);
    }
  };
  walk(triSisl); walk(triPros);
  return [...found].sort((a, b) => a - b);
})();

const rankedPages = [...tri.pages].sort((a, b) => b.substanceScore - a.substanceScore);
const rankOfPage = new Map(rankedPages.map((p, i) => [p.printedPage, i + 1]));

test("the reading rule ranks the two capacity definition pages at the very top", () => {
  // the site's headline finding is that one figure is defined two ways. both of
  // those pages are dense footnotes, which is what the score rewards, so if they
  // ever fall out of the top few the exhibit's first claim is wrong
  const a = rankOfPage.get(triSisl.capacityDefinitions.engineeredToSupport.page);
  const b = rankOfPage.get(triSisl.capacityDefinitions.availableToSell.page);
  assert.ok(a <= 3 || b <= 3, `capacity definition pages rank ${a} and ${b}, neither in the top 3`);
});

test("the rule misses the contract page, which is the exhibit's whole point", () => {
  // printed 46 carries the long contract revenue share. it is a risk factor,
  // thick with hedging, so the score buries it. if a future scoring change
  // surfaces it, the exhibit's second claim stops being true
  const rank = rankOfPage.get(triSisl.contractsSource.page);
  const cutoff = Math.round(rankedPages.length * 0.1);
  assert.ok(rank > cutoff,
    `the contract page ranks ${rank}, inside the top decile of ${cutoff}, so the rule no longer misses it`);
});

test("the cited pages split between the rule and reading, and both sides are populated", () => {
  const cutoff = Math.round(rankedPages.length * 0.1);
  const ranks = citedPageList.map((p) => rankOfPage.get(p)).filter((r) => r !== undefined);
  const byRule = ranks.filter((r) => r <= cutoff).length;
  assert.equal(ranks.length, citedPageList.length, "a cited page is missing from the scored set");
  // an exhibit claiming the rule half worked needs both halves to exist
  assert.ok(byRule > 0, "no cited page came from the rule, so the rule found nothing");
  assert.ok(byRule < ranks.length, "every cited page came from the rule, so there is no gap to show");
});

// ---- the sector layer ----
const mac = JSON.parse(readFileSync(new URL("../../data/macro.json", import.meta.url)));
const macSisl = JSON.parse(readFileSync(new URL("../../data/sisl.json", import.meta.url)));

const soldShare = (() => {
  const full = macSisl.periods.filter((p) => !p.stub);
  const l = full[full.length - 1];
  return l.operationalMW / l.builtMW;
})();

test("the forecast spread is wide enough to be the finding it is called", () => {
  const f = [...mac.capacity.forecasts].sort((a, b) => a.mw - b.mw);
  const multiple = (f[f.length - 1].mwHigh ?? f[f.length - 1].mw) / f[0].mw;
  // the page leads on the houses disagreeing by about three times. if that
  // collapses, the headline is describing a consensus
  assert.ok(multiple >= 2.5, `forecasts span only ${multiple.toFixed(1)}x`);
});

test("the restated bull top still lands on the published bull floor", () => {
  // the page stops on this coincidence by name. it depends on the sold share
  // derived from the filing, so if that moves the sentence stops being true
  const bull = mac.capacity.forecasts.find((f) => f.mwHigh !== null);
  const restatedTop = (bull.mwHigh * soldShare) / 1000;
  const publishedFloor = bull.mw / 1000;
  assert.equal(restatedTop.toFixed(1), publishedFloor.toFixed(1),
    `restated top ${restatedTop.toFixed(2)} no longer matches the published floor ${publishedFloor.toFixed(2)}`);
});

test("restating never inflates a forecast", () => {
  // applying a sold share below one must reduce every published number. a
  // conversion above one would mean more capacity earns than exists
  assert.ok(soldShare > 0 && soldShare < 1, `sold share ${soldShare} is outside zero to one`);
  for (const f of mac.capacity.forecasts) {
    assert.ok(f.mw * soldShare < f.mw, `${f.publisher} restated above its published figure`);
  }
});

// ---- the risk register, and what it is allowed to claim ----
const rsisl = JSON.parse(readFileSync(new URL("../../data/sisl.json", import.meta.url)));
const rreg = rsisl.risks;
const riskSrc = readFileSync(new URL("./risk.ts", import.meta.url), "utf8");

test("every measured risk has a derivation, and the derivation is in one place", () => {
  // a row marked measured claims a figure comes out of the filed numbers. if
  // nothing derives it, the page prints a magnitude nobody can trace, which is
  // the exact failure this register exists to avoid
  for (const r of rreg.rows.filter((x) => x.measured)) {
    assert.ok(riskSrc.includes(`"${r.id}"`) || riskSrc.includes(`\n    ${r.id}: {`),
      `${r.id} is marked measured but lib/diagnostics/risk.ts derives no magnitude for it`);
  }
});

test("a risk cites only a page this file already reads", () => {
  // the standing instruction is that the prospectus is not reopened. a page
  // number on a risk and nowhere else would mean a figure arrived without the
  // source block that lets a reader check it
  const read = new Set([
    rsisl.periodsSource.page, rsisl.costStackSource.page, rsisl.cashFlowSource.page,
    rsisl.contractsSource.page,
    rsisl.sitesSource.page, rsisl.peersSource.page, rsisl.clientsSource.page,
    rsisl.capacityDefinitions.engineeredToSupport.page,
    rsisl.capacityDefinitions.availableToSell.page,
    rsisl.governance.materiality.source.page,
    rsisl.governance.creditors.source.page,
    rsisl.governance.unservedSource.page,
    ...rsisl.governance.unserved.map((u) => u.page),
    ...rsisl.governance.quantified.map((q) => q.page),
  ]);
  for (const r of rreg.rows) {
    if (r.page !== null) assert.ok(read.has(r.page), `${r.id} cites unread page ${r.page}`);
  }
});

test("the worst cell is occupied, and everything in it is measured", () => {
  // this is the exhibit's headline. if the cell empties, the title is
  // describing a claim the data no longer makes
  const worst = rreg.rows.filter((r) => r.severity === "HIGH" && r.likelihood === "HIGH");
  assert.ok(worst.length > 0, "the worst cell is empty, so the exhibit has no headline");
  assert.ok(worst.every((r) => r.measured), "an unmeasured risk reached the worst cell");
});

test("the pillars nothing has been read for stay visibly empty", () => {
  // the register's footer claims some of the brief's six pillars carry no row
  // because the documents behind them are unread. if that stops being true the
  // footer is describing a hole somebody has since filled
  const pillars = ["REVENUE_QUALITY", "CASH_CONVERSION", "BALANCE_SHEET",
    "GOVERNANCE", "BUSINESS_MODEL", "VALUATION"];
  const empty = pillars.filter((p) => !rreg.rows.some((r) => r.category === p));
  // Two until the outstanding litigation at printed 463 was read. The claim is
  // that a gap stays visible, not that a particular number of them survives, and
  // the one left is valuation, which a draft prospectus cannot close because it
  // carries no price band.
  assert.deepEqual(empty, ["VALUATION"],
    `the gaps on this register are now ${empty.join(", ") || "none"}, so the footer needs rewriting`);
  assert.ok(rreg.unevidencedNote.length > 0, "an empty pillar has to say what would fill it");
  assert.ok(rreg.gradingNote.length > 0, "the grading has to admit it is a judgement");
});

// ---- the register on the page where no filing was read ----
//
// Anant Raj was here until its annual report was read. It now carries rows on
// both tiers and is checked below on the rule that replaced the blanket ban.
const areg = JSON.parse(readFileSync(new URL("../../data/anantraj.json", import.meta.url))).risks;
const secondaryRegisters = [
  ["Netweb", JSON.parse(readFileSync(new URL("../../data/netweb.json", import.meta.url))).risks],
];
const mixedRegisters = [["Anant Raj", areg], ...secondaryRegisters];

test("a secondary register cites no filing anywhere", () => {
  // a risk sounds like a fact, so it is the easiest place for a page number to
  // appear unchallenged on a page whose every other figure is a research note
  for (const [who, reg] of secondaryRegisters) {
    for (const r of reg.rows) {
      assert.equal(r.page, null, `${who}: ${r.id} cites a printed page and no filing was read`);
      assert.notEqual(r.source.verification, "PRIMARY", `${who}: ${r.id} claims the primary tier`);
    }
  }
});

test("on a mixed register a page and the primary tier travel together", () => {
  // the rule that replaced the blanket ban. a row resting on the annual report
  // may cite its page; a row resting on the research note may not borrow one
  const arData = JSON.parse(readFileSync(new URL("../../data/anantraj.json", import.meta.url)));
  const recorded = new Set([
    arData.annualReport.auditOpinion.page,
    arData.annualReport.compositionSource.page,
    ...arData.annualReport.rungs.map((r) => r.page),
    arData.financials.profitAndLoss.source.page,
    arData.financials.balanceSheet.source.page,
    arData.financials.cashFlow.source.page,
    arData.financials.cashFlow.financingRepaymentOfBorrowings.source.page,
    arData.financials.segment.source.page,
    arData.financials.ratios.source.page,
    arData.financials.dataCentreArm.source.page,
    arData.financials.dataCentreArm.groupShare.source.page,
  ]);
  for (const r of areg.rows) {
    assert.equal(r.page !== null, r.source.verification === "PRIMARY",
      `${r.id}: a page and the primary tier must travel together`);
    if (r.page !== null) {
      assert.ok(recorded.has(r.page), `${r.id} cites page ${r.page}, which this file does not record`);
    }
  }
  assert.ok(areg.rows.some((r) => r.page !== null), "no row rests on the report that was read");
  assert.ok(areg.rows.some((r) => r.page === null), "the research note rows have vanished");
});

test("every secondary magnitude is derived somewhere too", () => {
  for (const [who, reg] of secondaryRegisters) {
    for (const r of reg.rows.filter((x) => x.measured)) {
      assert.ok(riskSrc.includes(`"${r.id}"`),
        `${who}: ${r.id} is marked measured but nothing in risk.ts derives it`);
    }
  }
});

test("each register earns its worst cell, and leaves the unread pillars empty", () => {
  const pillars = ["REVENUE_QUALITY", "CASH_CONVERSION", "BALANCE_SHEET",
    "GOVERNANCE", "BUSINESS_MODEL", "VALUATION"];
  for (const [who, reg] of [["Sify", rreg], ...mixedRegisters]) {
    const worst = reg.rows.filter((r) => r.severity === "HIGH" && r.likelihood === "HIGH");
    assert.ok(worst.length > 0, `${who}: the worst cell is empty`);
    assert.ok(worst.every((r) => r.measured), `${who}: an unmeasured risk reached the worst cell`);
    const empty = pillars.filter((p) => !reg.rows.some((r) => r.category === p));
    // At least one gap stays visible on every register. Sify was at two until
    // the litigation section was read; the claim is that gaps are shown, not
    // that a particular number of them survives.
    assert.ok(empty.length >= 1, `${who}: every pillar now carries a row, so the footer claims a gap that is gone`);
  }
});

test("the deeper document reaches one pillar the other cannot", () => {
  // this claim has been rewritten twice, each time by a reading rather than by
  // an argument. first no two registers covered the same pillars; then the Anant
  // Raj annual report closed that gap and the claim became what sat underneath
  // identical coverage; now the prospectus reaches governance and the annual
  // report has not, so the difference is one pillar and it is the one a legal
  // section supports
  const set = (reg) => [...new Set(reg.rows.map((r) => r.category))].sort();
  const only = set(rreg).filter((c) => !set(areg).includes(c));
  assert.deepEqual(only, ["GOVERNANCE"],
    `the prospectus register now reaches ${only.join(", ") || "nothing"} the annual report does not`);
  assert.ok(set(areg).every((c) => set(rreg).includes(c)),
    "the annual report register has reached a pillar the prospectus has not, which inverts the claim");
  const paged = (reg) => reg.rows.filter((r) => r.page !== null).length / reg.rows.length;
  assert.equal(paged(rreg), 1, "the prospectus register no longer rests entirely on printed pages");
  assert.ok(paged(areg) > 0 && paged(areg) < 0.5,
    `the Anant Raj register rests on a page for ${(paged(areg) * 100).toFixed(0)} per cent of its rows`);
  // Netweb still reaches a pillar neither of them does, on no filing at all
  const nw = secondaryRegisters[0][1];
  assert.notDeepEqual(set(nw), set(rreg), "Netweb now covers the same pillars as the filed register");
});

// ---- the restated statement of cash flow, printed 355 ----
const cf = rsisl.cashFlow;

test("the cash flow statement reconciles to its own subtotal", () => {
  // the filing prints cash generated from operations, the tax paid against it
  // and the net figure. all three are stored so a mistyped row is caught rather
  // than quietly changing the size of the gap the exhibit draws
  for (const r of cf) {
    assert.ok(Math.abs(r.cashFromOperations - r.taxPaid - r.cfo) < 0.01,
      `${r.label}: ${r.cashFromOperations} less ${r.taxPaid} is not ${r.cfo}`);
  }
});

test("capex outran operations overall, and exactly one period covered itself", () => {
  // both halves of the exhibit's headline. the first is the invariant in the
  // schema, the second is the sentence in the title, and a title is worth
  // nothing if nothing checks it
  const capex = cf.reduce((s, r) => s + r.capex, 0);
  const cfo = cf.reduce((s, r) => s + r.cfo, 0);
  assert.ok(capex > cfo, `cumulative capex ${capex} no longer exceeds cfo ${cfo}`);
  const covered = cf.filter((r) => r.capex <= r.cfo);
  assert.equal(covered.length, 1, `${covered.length} periods covered their own capex, expected 1`);
  // and it is not the last one: the quarter after it goes back under
  assert.notEqual(covered[0].label, cf[cf.length - 1].label,
    "the covered period is now the latest one, so the title's ordering claim is wrong");
});

test("cash conversion stopped being an empty pillar when the statement was read", () => {
  // the register named printed 355 as the document that would fill this pillar.
  // it has been read, so the pillar has to carry a row and cite that page
  const row = rreg.rows.find((r) => r.category === "CASH_CONVERSION");
  assert.ok(row, "the cash flow statement was read but cash conversion carries no row");
  assert.equal(row.page, rsisl.cashFlowSource.page,
    "the cash conversion row does not cite the statement it rests on");
});

// ---- the published return on capital, rebuilt from printed 353 and 355 ----
const bsByLabel = Object.fromEntries(rsisl.balanceSheet.map((b) => [b.label, b]));
const depByLabel = Object.fromEntries(rsisl.cashFlow.map((c) => [c.label, c.depreciation]));
const employed = (b, leases) => b.netWorth + b.borrowings + (leases ? b.leaseLiabilities : 0) - b.cash;

const rebuilt = (leases) =>
  rsisl.periods.map((p, i) => {
    const here = bsByLabel[p.label];
    const prior = i > 0 ? bsByLabel[rsisl.periods[i - 1].label] : undefined;
    const da = depByLabel[p.label];
    if (!here || !prior || da === undefined) return { label: p.label, value: null, printed: p.roce };
    const avg = (employed(prior, leases) + employed(here, leases)) / 2;
    return { label: p.label, value: ((p.ebitda - da) / avg) * 100, printed: p.roce };
  });

test("every checkable return on capital rebuilds to the second decimal", () => {
  // the exhibit's headline. the document prints the formula in one place and the
  // answers in another and never joins them, so this is the join, asserted
  const rows = rebuilt(true).filter((r) => r.value !== null);
  assert.ok(rows.length >= 2, "too few periods can be rebuilt to make the claim");
  for (const r of rows) {
    assert.ok(Math.abs(r.value - r.printed) < 0.005,
      `${r.label}: rebuilt ${r.value.toFixed(4)} against published ${r.printed}`);
  }
});

test("the reading that excludes lease liabilities does not reproduce the figures", () => {
  // the second half of the finding. the printed definition says total
  // borrowings and does not say whether leases are inside it. if both readings
  // ever agreed, there would be no ambiguity left to report
  const rows = rebuilt(false).filter((r) => r.value !== null);
  for (const r of rows) {
    assert.ok(r.value - r.printed > 0.1,
      `${r.label}: excluding leases now lands within rounding, so the ambiguity is gone`);
  }
});

test("the period that cannot be rebuilt is the highest published figure", () => {
  // this is why the gap matters rather than being a footnote
  const unchecked = rebuilt(true).filter((r) => r.value === null);
  assert.equal(unchecked.length, 1, `${unchecked.length} periods cannot be rebuilt, expected 1`);
  const highest = [...rsisl.periods].sort((a, b) => b.roce - a.roce)[0];
  assert.equal(unchecked[0].label, highest.label,
    "the unverifiable period is no longer the highest, so the exhibit overstates the problem");
});

// ---- the Anant Raj annual report, the first filing read for that name ----
const ar = JSON.parse(readFileSync(new URL("../../data/anantraj.json", import.meta.url))).annualReport;

test("the headline capacity equals the parts the report says it is made of", () => {
  // the finding. the company prints one number in its highlights and the three
  // pieces elsewhere, and only one piece is operational
  const claimed = ar.rungs.find((r) => r.kind === "CLAIMED");
  const parts = ar.composition.reduce((t, c) => t + c.mw, 0);
  assert.ok(claimed, "no claimed rung to check the parts against");
  assert.ok(Math.abs(parts - claimed.mw) < 0.01, `parts ${parts} against headline ${claimed.mw}`);
});

test("only one part of the headline is operational, and it is the small one", () => {
  const live = ar.composition.filter((c) => c.operational);
  const notYet = ar.composition.filter((c) => !c.operational);
  assert.equal(live.length, 1, `${live.length} operational parts, expected 1`);
  const liveMw = live.reduce((t, c) => t + c.mw, 0);
  const restMw = notYet.reduce((t, c) => t + c.mw, 0);
  assert.ok(restMw > liveMw, "the operational part is no longer the minority, so the title is wrong");
});

test("every annual report figure carries a printed page, and the document is pinned", () => {
  // a figure from a manually acquired pdf is worthless without the checksum
  // that says which pdf, because nobody can re-download it and check otherwise
  assert.match(ar.manifest.sha256, /^[0-9a-f]{64}$/, "no usable checksum for the annual report");
  assert.ok(ar.manifest.url.startsWith("https://"), "no url to re-download from");
  for (const r of ar.rungs) assert.ok(Number.isInteger(r.page) && r.page > 0, `${r.rung} has no page`);
  assert.ok(ar.auditOpinion.page > 0, "the audit opinion cites no page");
});

// ---- the comparison, and what it refuses to compare ----
const cmpSisl = rsisl;
const cmpAr = JSON.parse(readFileSync(new URL("../../data/anantraj.json", import.meta.url)));

test("the like for like ratio uses each company's own two published figures", () => {
  // the row the whole page rests on. both numbers must come from the same
  // document for the same company, or the ratio is comparing across sources
  const fy = cmpSisl.periods.filter((p) => !p.stub).at(-1);
  const claimed = cmpAr.annualReport.rungs.find((r) => r.kind === "CLAIMED");
  const live = cmpAr.annualReport.rungs.find((r) => r.rung === "Operationalised");
  for (const [who, num, den] of [["Sify", fy.operationalMW, fy.builtMW], ["Anant Raj", live.mw, claimed.mw]]) {
    assert.ok(num > 0 && den > 0, `${who} is missing one side of the ratio`);
    assert.ok(num < den, `${who}: what earns is not below the headline, so the ratio is not a shortfall`);
  }
});

test("the two operators earn on very different shares of what they headline", () => {
  // if these ever converge the page's opening sentence stops being a finding
  const fy = cmpSisl.periods.filter((p) => !p.stub).at(-1);
  const claimed = cmpAr.annualReport.rungs.find((r) => r.kind === "CLAIMED");
  const live = cmpAr.annualReport.rungs.find((r) => r.rung === "Operationalised");
  const a = (fy.operationalMW / fy.builtMW) * 100;
  const b = (live.mw / claimed.mw) * 100;
  assert.ok(Math.abs(a - b) > 20, `shares are ${a.toFixed(1)} and ${b.toFixed(1)}, too close to lead on`);
});

// ---- the peer benchmarking table, printed 260 ----
const macRet = JSON.parse(readFileSync(new URL("../../data/macro.json", import.meta.url))).operatorReturns;

test("every operator carries one reading per fiscal year the table covers", () => {
  // a short row would shift every value after it into the wrong year, silently
  const n = macRet.fiscalYears.length;
  for (const r of macRet.rows) {
    assert.equal(r.roce.length, n, `${r.name} has ${r.roce.length} return readings, expected ${n}`);
    assert.equal(r.depreciationRate.length, n, `${r.name} depreciation rate is the wrong length`);
  }
});

test("every Indian operator's return on capital fell in the second year", () => {
  // the exhibit's headline, and the reason it is a sector finding rather than a
  // company one
  const dom = macRet.rows.filter((r) => r.market === "DOMESTIC");
  assert.ok(dom.length >= 4, "too few domestic operators to call it a sector");
  for (const r of dom) {
    assert.ok(r.roce[0] !== null && r.roce[1] !== null, `${r.name} cannot be compared across years`);
    assert.ok(r.roce[1] < r.roce[0], `${r.name} rose from ${r.roce[0]} to ${r.roce[1]}`);
  }
});

test("the issuer ranks mid table at home while claiming to beat its global peers", () => {
  // the second finding. the claim is quoted in the data and is about global
  // peers only; this asserts the domestic ranking it does not mention
  const self = macRet.rows.find((r) => r.self);
  assert.ok(self, "no issuer row marked self");
  assert.match(macRet.claim.quote, /global peers/i, "the quoted claim is no longer about global peers");
  for (const i of [0, 1]) {
    const dom = macRet.rows.filter((r) => r.market === "DOMESTIC" && r.roce[i] !== null);
    const better = dom.filter((r) => r.roce[i] > self.roce[i]).length;
    assert.ok(better > 0, `the issuer leads every domestic peer in year ${i}, so the ranking claim is wrong`);
  }
  // and in at least one year its own table contradicts the global claim
  const glo = macRet.rows.filter((r) => r.market === "GLOBAL");
  const lost = macRet.fiscalYears.some((_, i) =>
    self.roce[i] !== null && glo.some((g) => g.roce[i] !== null && g.roce[i] >= self.roce[i]));
  assert.ok(lost, "the table no longer contradicts the claim in any year");
});

// ---- the pledges, and the one that named a capacity ----
const macHs = mac.hyperscalers;

test("three firms have pledged a multiple of the market they are pledging into", () => {
  // the exhibit's headline. below about twice the annual market this is an
  // ordinary capital cycle and the sentence stops being worth printing
  const total = macHs.pledges.reduce((t, p) => t + p.bnUsd, 0);
  const times = total / mac.market.currentBnUsd;
  assert.ok(times >= 2, `pledges are only ${times.toFixed(1)} times the annual market`);
  assert.ok(total <= macHs.cumulative.bnUsd,
    `three firms pledged ${total} against ${macHs.cumulative.bnUsd} committed by everyone`);
});

test("exactly one pledge named a capacity, and that one site is most of the estate", () => {
  // the capacity half of the exhibit rests entirely on this row. the other two
  // are drawn nowhere below the money panel, and the page says why
  const named = macHs.pledges.filter((p) => p.announcedSiteMW !== null);
  assert.equal(named.length, 1, `${named.length} pledges name a capacity, the exhibit is written for one`);
  const share = named[0].announcedSiteMW / mac.capacity.current.mw;
  assert.ok(share > 0.5,
    `the announced site is ${(share * 100).toFixed(0)} per cent of national live capacity, too small to lead on`);
});

// ---- the grid, and what the forecasts cost ----
test("the demand estimate rises by an order of magnitude, in its own unit", () => {
  // the page calls the grid the binding constraint. that rests on the estimate
  // rising steeply, and on it staying a different measurement from built
  // capacity, which is why nothing here divides one by the other
  const times = mac.power.targetGw / mac.power.currentGw;
  assert.ok(times >= 5, `demand rises only ${times.toFixed(1)} times, which is not a constraint`);
  assert.ok(mac.power.targetYear > mac.capacity.current.year,
    "the demand horizon is not ahead of the capacity base year");
});

test("the cheapest forecast costs many times the whole government programme", () => {
  // the sentence the capital panel exists for. both sides are published figures
  // in rupees and nothing is converted to reach it
  const ue = mac.unitEconomics;
  const cheapest = [...mac.capacity.forecasts].sort((a, b) => a.mw - b.mw)[0];
  const crLow = (cheapest.mw - mac.capacity.current.mw) * ue.capexCrPerMW.low;
  const times = crLow / mac.indiaAI.outlayCr;
  assert.ok(times >= 5,
    `the base case costs ${times.toFixed(1)} times the mission outlay, too close to lead on`);
  assert.ok(ue.powerShareOfOpexPct > 50, "power is no longer the majority of operating cost");
});

// ---- the consolidated statements, and the arm inside them ----
const arFin = cmpAr.financials;

test("the consolidated statements reconcile to their own subtotals", () => {
  // every line is typed from one printed page each. a mistyped expense would
  // change a margin the page quotes while changing nothing a reader could see
  const pl = arFin.profitAndLoss;
  assert.ok(Math.abs(pl.totalIncome - pl.totalExpenses - pl.profitBeforeTax) < 0.01,
    `income statement does not reconcile: ${pl.totalIncome} less ${pl.totalExpenses}`);
  const cf = arFin.cashFlow;
  assert.ok(Math.abs(cf.cashGeneratedFromOperations + cf.incomeTax - cf.netCashFromOperations) < 0.01,
    "cash generated less tax does not equal the filed operating cash flow");
});

test("the data centre subsidiary is printed twice and the two pages agree", () => {
  // this is what lets the exhibit call the figure the report's own rather than
  // a subtraction performed here. the pages are different and both are cited
  const a = arFin.dataCentreArm;
  const net = a.shareCapital + a.reservesAndSurplus;
  assert.ok(Math.abs(net - (a.totalAssets - a.totalLiabilities)) < 0.01, "net assets do not tie");
  assert.ok(Math.abs(net - a.groupShare.netAssetsAmount) < 0.01, "the two pages disagree on net assets");
  assert.ok(Math.abs(a.profitAfterTax - a.groupShare.profitAmount) < 0.01, "the two pages disagree on the result");
  assert.notEqual(a.source.page, a.groupShare.source.page, "both figures cite one page, so there is no second reading");
});

test("the arm the company is priced on is a rounding error in its revenue", () => {
  // the exhibit's headline, and the whole reason the page exists in this shape
  const a = arFin.dataCentreArm;
  const share = (a.turnover / arFin.profitAndLoss.revenue) * 100;
  assert.ok(share < 5, `the data centre arm is ${share.toFixed(1)} per cent of revenue, too large to call small`);
  assert.ok(a.profitAfterTax < 0, "the arm no longer loses money");
  assert.ok(a.totalLiabilities > a.totalAssets, "the arm no longer has negative net assets");
});

test("one reportable segment, and it is not data centres", () => {
  // if the group ever reports the arm separately the page's central claim
  // changes, and this should fail rather than the sentence going quietly wrong
  const seg = arFin.segment;
  assert.equal(seg.reportableSegments, 1, "the group no longer reports a single segment");
  assert.doesNotMatch(seg.description, /data|centre|center|cloud/i,
    "the single segment now mentions data centres, so the finding has moved");
  assert.match(seg.quote, /single reportable segment/i, "the quoted disclosure no longer says what the page says it says");
});

// ---- the comparison rows the second reading filled ----
test("the like for like revenue row compares two data centre businesses, not two groups", () => {
  // setting a pure play's revenue against a property developer's group revenue
  // would be the exact false equivalence this page exists to prevent
  const fy = cmpSisl.periods.filter((p) => !p.stub).at(-1);
  const armMn = arFin.dataCentreArm.turnover / 10;
  const groupMn = arFin.profitAndLoss.revenue / 10;
  assert.ok(armMn < groupMn / 10,
    "the arm is no longer small enough for the group row to be asking a different question");
  const multiple = fy.revenue / armMn;
  assert.ok(multiple > 10,
    `the two data centre businesses are only ${multiple.toFixed(1)} times apart, too close to lead on`);
});

test("the two published returns on capital do not share a denominator", () => {
  // the page says the higher number is the different formula rather than the
  // better return. that sentence needs the two formulas to actually differ
  assert.match(arFin.ratios.roceFormula, /closing/i,
    "the Anant Raj denominator is no longer described as a closing one");
  assert.match(rsisl.roceFormulaSource.label, /average capital employed/i,
    "the Sify formula no longer averages capital employed, so the two now agree");
});

// ---- cash conversion, and the line that decides it ----

test("capital expenditure is the four lines the investing section prints", () => {
  const cf = arFin.cashFlow;
  const capex =
    cf.acquisitionOfPropertyPlantAndEquipment +
    cf.acquisitionOfInvestmentProperty +
    cf.additionsToCapitalWorkInProgress +
    cf.additionsToRightOfUse;
  // read off printed page 224, line by line, and summed here rather than taken
  // from a total the statement never strikes
  assert.equal(Number(capex.toFixed(2)), 9914.6);
});

test("borrowings are an outflow in both sections, on their own pages", () => {
  const cf = arFin.cashFlow;
  const fin = cf.financingRepaymentOfBorrowings;
  assert.ok(cf.currentBorrowingsInsideOperating < 0, "the operating side line is not an outflow");
  assert.ok(fin.amount < 0, "the finance side line is not an outflow");
  // both filed years present it the same way, which is what makes it a habit
  assert.ok(cf.currentBorrowingsInsideOperatingPrior < 0 && fin.amountPrior < 0);
  assert.notEqual(fin.source.page, cf.source.page,
    "the two sections are no longer printed on different pages");
  assert.equal(fin.source.verification, "PRIMARY");
});

test("the capex cover changes side when the borrowings line leaves operating", () => {
  const cf = arFin.cashFlow;
  const capex =
    cf.acquisitionOfPropertyPlantAndEquipment +
    cf.acquisitionOfInvestmentProperty +
    cf.additionsToCapitalWorkInProgress +
    cf.additionsToRightOfUse;
  const filed = capex / cf.netCashFromOperations;
  const restated = capex / (cf.netCashFromOperations - cf.currentBorrowingsInsideOperating);
  // the whole sentence of the exhibit: the spending does not move, the answer does
  assert.ok(filed > 1, `as filed the cover is ${filed.toFixed(2)}, which no longer exceeds one`);
  assert.ok(restated < 1, `restated the cover is ${restated.toFixed(2)}, which no longer falls under one`);
  assert.equal(filed.toFixed(2), "1.03");
  assert.equal(restated.toFixed(2), "0.56");
});

// ---- the third operator read from a filing ----
const te = JSON.parse(readFileSync(new URL("../../data/technoe.json", import.meta.url)));
const uni = JSON.parse(readFileSync(new URL("../../data/universe.json", import.meta.url)));

test("the coverage row carries the figure the filing supports, not the research note", () => {
  // the reason this document was opened. the row said 36 MW live, from a
  // research note. the company names one campus as commissioned and live and
  // it is 24. if the two ever drift apart again the plot and the matrix start
  // printing a number the filing does not support
  const row = uni.operators.find((o) => o.ticker === "TECHNOE");
  const live = te.campuses.filter((c) => c.status === "LIVE").reduce((t, c) => t + c.mw, 0);
  assert.equal(row.liveMW, live, `the universe row says ${row.liveMW} MW live, the filing says ${live}`);
  assert.equal(row.announcedMW, te.target.mw);
  assert.equal(row.source.verification, "PRIMARY");
});

test("the campus ladder descends, and the portfolio is the report's own three", () => {
  const live = te.campuses.filter((c) => c.status === "LIVE").reduce((t, c) => t + c.mw, 0);
  const portfolio = te.campuses.reduce((t, c) => t + c.mw, 0);
  assert.equal(te.campuses.length, 3, "the report names three hyperscale campuses");
  assert.equal(portfolio, 48);
  assert.equal(live, 24);
  assert.ok(live <= portfolio && portfolio <= te.target.mw);
  // the share the whole comparison rests on: what is live against what is aimed at
  assert.equal(((live / te.target.mw) * 100).toFixed(1), "9.6");
});

test("a stated first phase is a fraction of the campus it belongs to", () => {
  // the finding inside a single site. Noida is a 16 MW campus whose first phase
  // the report puts at 500 kW
  const phased = te.campuses.filter((c) => c.firstPhaseMW !== null);
  assert.ok(phased.length > 0, "no campus carries a stated first phase any more");
  for (const c of phased) {
    assert.ok(c.firstPhaseMW / c.mw < 0.1,
      `${c.name}: first phase ${c.firstPhaseMW} is no longer small against ${c.mw}`);
  }
});

test("the edge network is a count of sites, and is never counted as capacity", () => {
  // 102 locations with no megawatt figure beside them. treating a site count as
  // capacity is exactly the error this project exists to catch
  assert.equal(te.edgeNetwork.mw, null);
  assert.ok(te.edgeNetwork.mwNote.length > 0);
  const portfolio = te.campuses.reduce((t, c) => t + c.mw, 0);
  assert.equal(portfolio, 48, "the portfolio has absorbed something that is not a campus");
});

test("every printed page cited for this filer can exist in the document", () => {
  // the report is laid out as two page spreads, so the printed range runs to
  // about twice the PDF page count and a bad offset shows up here first
  const max = te.annualReport.manifest.pdfPages * 2;
  const pages = [...te.campuses.map((c) => c.page), te.target.page, te.edgeNetwork.page,
    te.campusesSource.page, te.targetSource.page, te.edgeNetworkSource.page,
    te.commitments.standalonePage, te.commitments.consolidatedPage, te.commitments.source.page,
    te.segmentation.ambitionPage, te.segmentation.source.page,
    te.governance.emphasisOfMatter.standalonePage, te.governance.emphasisOfMatter.consolidatedPage,
    te.governance.emphasisOfMatter.source.page,
    te.governance.struckOff.standalonePage, te.governance.struckOff.consolidatedPage,
    te.governance.struckOff.source.page];
  for (const pg of pages) assert.ok(pg > 0 && pg <= max, `printed page ${pg} cannot exist in ${max}`);
});

test("the contracted capital buys a fraction of one megawatt at the sector rate", () => {
  // the finding. an audited line recording contracts on capital account, against
  // a capacity target printed in the same document as management commentary
  const capexLow = 60, capexHigh = 70;
  const commitmentCr = te.commitments.capitalCommitmentMn / 10;
  const mwHigh = commitmentCr / capexLow;
  assert.ok(mwHigh < 1, `contracted capital now buys ${mwHigh} MW, so the comparison has moved`);
  assert.ok(te.target.mw / mwHigh > 1000, "the target is no longer three orders above what is contracted");
});

test("two audited figures dwarf the capital the company has contracted", () => {
  assert.ok(te.commitments.contingentTotalMn > te.commitments.capitalCommitmentMn);
  assert.ok(te.governance.emphasisOfMatter.amountMn > te.commitments.capitalCommitmentMn);
  // the contingent total is the sum of its own rows, so a head cannot go missing
  const summed = te.commitments.contingent.reduce((t, r) => t + r.amountMn, 0);
  assert.ok(Math.abs(summed - te.commitments.contingentTotalMn) < 0.01,
    `heads sum to ${summed} against a printed total of ${te.commitments.contingentTotalMn}`);
  const summedPrior = te.commitments.contingent.reduce((t, r) => t + r.amountPriorMn, 0);
  assert.ok(Math.abs(summedPrior - te.commitments.contingentTotalPriorMn) < 0.01,
    `prior heads sum to ${summedPrior} against ${te.commitments.contingentTotalPriorMn}`);
});

test("the struck off note tables a balance and denies having one", () => {
  // both halves have to be present for the page to state the contradiction
  assert.ok(te.governance.struckOff.rows.length >= 1);
  assert.match(te.governance.struckOff.denialQuote, /do not have any transactions with struck off/i);
  assert.equal(te.governance.struckOff.clauseNumeral, "ii");
});

test("the accounts separate nothing, and the terms searched are recorded", () => {
  assert.equal(te.segmentation.reported, false);
  assert.ok(te.segmentation.termsSearched.length >= 3,
    "an absence stated without the terms searched cannot be re-run");
  assert.ok(te.segmentation.printedPagesSearched >= te.annualReport.manifest.pdfPages,
    "the search has to cover at least as many printed pages as the document has PDF pages");
});

// ---- printed pages against positions in a PDF ----
//
// The arithmetic is mirrored here rather than imported, the same way every
// other diagnostic in this file is, so the committed data is checked even where
// no route loads it. `data/raw/prospectus/drhp_extracts.json` is one of those:
// nothing validates it at build, and it describes the document every prospectus
// citation on the site rests on.

const paginations = [
  ["Sify DRHP", JSON.parse(readFileSync(new URL("../../data/raw/prospectus/drhp_extracts.json", import.meta.url))).manifest.pagination],
  ["Anant Raj", JSON.parse(readFileSync(new URL("../../data/anantraj.json", import.meta.url))).annualReport.manifest.pagination],
  ["Techno Electric", JSON.parse(readFileSync(new URL("../../data/technoe.json", import.meta.url))).annualReport.manifest.pagination],
];

const slotOf = (p, pdfIndex, half) =>
  p.printedPagesPerPdfPage === 2 ? pdfIndex * 2 + (half === "RIGHT" ? 1 : 0) : pdfIndex;
const originOf = (p) => slotOf(p, p.pdfIndexOfPrintedOne, p.halfOfPrintedOne);
const toIndex = (p, printed) => {
  const slot = originOf(p) + printed - 1;
  return p.printedPagesPerPdfPage === 2
    ? { pdfIndex: Math.floor(slot / 2), half: slot % 2 ? "RIGHT" : "LEFT" }
    : { pdfIndex: slot, half: null };
};

test("every stored pagination reproduces the folios its document prints", () => {
  for (const [who, p] of paginations) {
    assert.ok(p.anchors.length >= 2, `${who}: a mapping needs at least two anchors`);
    for (const a of p.anchors) {
      const predicted = slotOf(p, a.pdfIndex, a.half) - originOf(p) + 1;
      assert.equal(predicted, a.printedPage,
        `${who}: index ${a.pdfIndex} would print ${predicted}, the document prints ${a.printedPage}`);
      assert.ok(a.pdfIndex >= p.validFromPdfIndex, `${who}: an anchor precedes its own valid range`);
    }
  }
});

test("a wrong mapping fails the same check, so the check can fail", () => {
  // an assertion nothing can break is decoration. this shifts a real mapping by
  // one page and requires the anchors to reject it
  const [, real] = paginations[0];
  const shifted = { ...real, pdfIndexOfPrintedOne: real.pdfIndexOfPrintedOne + 1 };
  const bad = real.anchors.filter(
    (a) => slotOf(shifted, a.pdfIndex, a.half) - originOf(shifted) + 1 !== a.printedPage,
  );
  assert.equal(bad.length, real.anchors.length, "shifting the mapping fooled the anchors");
});

test("printed pages resolve to the PDF positions the reading actually used", () => {
  // regressions on citations confirmed by opening the page and reading it, not
  // by trusting the arithmetic that is being tested
  const [, sify] = paginations[0];
  const [, ar] = paginations[1];
  const [, te] = paginations[2];
  assert.deepEqual(toIndex(ar, 224), { pdfIndex: 226, half: null });
  assert.deepEqual(toIndex(ar, 225), { pdfIndex: 227, half: null });
  assert.deepEqual(toIndex(sify, 17), { pdfIndex: 21, half: null });
  // the two page spread, where both halves of one PDF page are consecutive
  assert.deepEqual(toIndex(te, 72), { pdfIndex: 38, half: "LEFT" });
  assert.deepEqual(toIndex(te, 73), { pdfIndex: 38, half: "RIGHT" });
  assert.deepEqual(toIndex(te, 196), { pdfIndex: 100, half: "LEFT" });
});

test("the mapping round trips, on both layouts", () => {
  for (const [who, p] of paginations) {
    for (const printed of [10, 50, 111, 200]) {
      const at = toIndex(p, printed);
      const back = slotOf(p, at.pdfIndex, at.half) - originOf(p) + 1;
      assert.equal(back, printed, `${who}: printed ${printed} did not survive a round trip`);
    }
  }
});

test("every printed page cited for a read document resolves inside it", () => {
  // a citation that lands past the end of the PDF is a misread mapping, and it
  // is the failure that survives longest because the number still looks fine
  const arDoc = JSON.parse(readFileSync(new URL("../../data/anantraj.json", import.meta.url)));
  const [, ar] = paginations[1];
  const cited = [
    arDoc.annualReport.auditOpinion.page,
    arDoc.annualReport.compositionSource.page,
    ...arDoc.annualReport.rungs.map((r) => r.page),
    arDoc.financials.profitAndLoss.source.page,
    arDoc.financials.balanceSheet.source.page,
    arDoc.financials.cashFlow.source.page,
    arDoc.financials.cashFlow.financingRepaymentOfBorrowings.source.page,
    arDoc.financials.segment.source.page,
    arDoc.financials.ratios.source.page,
  ];
  for (const page of cited) {
    const { pdfIndex } = toIndex(ar, page);
    assert.ok(pdfIndex >= 0 && pdfIndex < arDoc.annualReport.manifest.pdfPages,
      `printed page ${page} resolves to index ${pdfIndex}, outside the document`);
  }
});

// ---- the third ladder on the comparison ----

test("the third operator reaches the ladders and none of the financial rows", () => {
  // its megawatts are filed and cited, its statements are not drawn on, and a
  // financial row built from nothing is the false equivalence the page refuses
  const live = te.campuses.filter((c) => c.status === "LIVE").reduce((t, c) => t + c.mw, 0);
  const portfolio = te.campuses.reduce((t, c) => t + c.mw, 0);
  assert.equal(portfolio, 48);
  assert.equal(live, 24);
  assert.equal(((live / portfolio) * 100).toFixed(1), "50.0");
  // the ladder must still descend, like every other one on the site
  assert.ok(live <= portfolio);
});

test("the widest rung of the third ladder is named as a sum, not as a headline", () => {
  // the report prints three campuses and never adds them up. calling the total
  // a headline would lend it an authority no printed figure gives it
  const printed = te.campuses.map((c) => c.mw);
  assert.equal(printed.length, 3);
  assert.equal(printed.reduce((a, b) => a + b, 0), 48);
  // and the real headline, the one the company repeats, is an ambition that the
  // ladder deliberately excludes
  assert.equal(te.target.mw, 250);
  assert.ok(te.target.mw > 48, "the target has stopped being larger than the portfolio");
});

test("what is live is a small share of what is targeted", () => {
  const live = te.campuses.filter((c) => c.status === "LIVE").reduce((t, c) => t + c.mw, 0);
  assert.equal(((live / te.target.mw) * 100).toFixed(1), "9.6");
});

// ---- cash conversion, the brief's second pillar ----

const cq = JSON.parse(readFileSync(new URL("../../data/sisl.json", import.meta.url)));
const cqAr = JSON.parse(readFileSync(new URL("../../data/anantraj.json", import.meta.url))).financials;
const configSrc = readFileSync(new URL("../config.ts", import.meta.url), "utf8");
const sloan = (ni, cfo, cfi, ta) => (ni - cfo - cfi) / ta;

test("the thresholds live in config and nowhere else", () => {
  // a band written into a component would let the rule a reader is shown drift
  // from the rule that coloured the cell, which is the quietest way for a
  // scorecard to start lying
  for (const n of ["0.8", "0.5", "0.25"]) {
    assert.ok(configSrc.includes(n), `lib/config.ts no longer states the ${n} threshold`);
  }
  const comp = readFileSync(new URL("../../components/CashConversion.tsx", import.meta.url), "utf8");
  assert.ok(!/0\.8|0\.5\b|0\.25/.test(comp.replace(/py-0\.5|gap-0\.5|mt-0\.5/g, "")),
    "a threshold has been written into the component instead of read from config");
});

test("Anant Raj fails cash conversion on both readings of its own statement", () => {
  const pat = cqAr.profitAndLoss.profitAfterTax;
  const filed = cqAr.cashFlow.netCashFromOperations;
  const restated = filed - cqAr.cashFlow.currentBorrowingsInsideOperating;
  assert.ok(filed / pat < 0.5, `as filed ${(filed / pat).toFixed(2)} is no longer under the red line`);
  assert.ok(restated / pat < 0.5, `restated ${(restated / pat).toFixed(2)} is no longer under the red line`);
  assert.equal((filed / pat).toFixed(2), "0.23");
});

test("the two measures disagree on Anant Raj, which is the finding", () => {
  // one asks whether profit became cash and the other whether the balance sheet
  // is accumulating accruals. only the first is failing, and a pillar that
  // averaged them would report the midpoint of a contradiction
  const pat = cqAr.profitAndLoss.profitAfterTax;
  const conv = cqAr.cashFlow.netCashFromOperations / pat;
  const acc = sloan(pat, cqAr.cashFlow.netCashFromOperations,
    cqAr.cashFlow.netCashFromInvesting, cqAr.balanceSheet.totalAssets);
  assert.ok(conv < 0.5, "cash conversion is no longer red");
  assert.ok(Math.abs(acc) < 0.25, "the accrual ratio is no longer inside the band");
});

test("Sify converts profit to cash in every filed period", () => {
  for (const p of cq.periods) {
    const cf = cq.cashFlow.find((c) => c.label === p.label);
    assert.ok(p.pat > 0, `${p.label}: the ratio would have to be refused, not computed`);
    assert.ok(cf.cfo / p.pat > 1, `${p.label}: conversion fell to ${(cf.cfo / p.pat).toFixed(2)}`);
  }
});

test("Sify's accrual ratio tracks the build, not the earnings", () => {
  // the caveat published beside the measure. it peaks in the heavy capex years
  // and falls away in the year capital spending fell, with nothing happening to
  // the earnings in between
  const at = (label) => {
    const p = cq.periods.find((x) => x.label === label);
    const cf = cq.cashFlow.find((c) => c.label === label);
    const bs = cq.balanceSheet.find((b) => b.label === label);
    return sloan(p.pat, cf.cfo, cf.cfi, bs.totalAssets);
  };
  const heavy = at("FY2024");
  const light = at("FY2025");
  assert.ok(Math.abs(heavy) > Math.abs(light) * 3,
    `the build years no longer dominate: ${heavy.toFixed(3)} against ${light.toFixed(3)}`);
  assert.ok(Math.abs(heavy) < 0.25, "the peak has crossed the danger line, so the caveat needs rewriting");
  const capexHeavy = cq.cashFlow.find((c) => c.label === "FY2024").capex;
  const capexLight = cq.cashFlow.find((c) => c.label === "FY2025").capex;
  assert.ok(capexHeavy > capexLight * 2, "capital spending no longer explains the fall");
});

test("total assets and investing cash were read from the right columns", () => {
  // both arrived as one column of a four column restated statement, matched to
  // the stored rows on the operating figure that appears in both
  for (const b of cq.balanceSheet) {
    const p = cq.periods.find((x) => x.label === b.label);
    assert.ok(b.totalAssets > b.netWorth, `${b.label}: assets do not exceed equity`);
    assert.ok(b.totalAssets > p.revenue, `${b.label}: assets below revenue, which is not this business`);
  }
  for (const c of cq.cashFlow) assert.ok(c.cfi < 0, `${c.label}: investing is no longer an outflow`);
  // assets grow monotonically across the filed periods, as an estate under
  // construction does
  const ta = cq.balanceSheet.map((b) => b.totalAssets);
  assert.deepEqual(ta, [...ta].sort((a, b) => a - b), "total assets no longer ascend");
});

// ---- the four columns are not one reporting entity ----

test("two of the four filed columns are standalone, and the document says so", () => {
  // the statements are titled restated consolidated throughout. the column
  // header above them, and the auditor's examination report, say otherwise for
  // the two older periods
  const basis = cq.periods.map((p) => [p.label, p.basis]);
  assert.deepEqual(basis, [
    ["FY2023", "STANDALONE"],
    ["FY2024", "STANDALONE"],
    ["FY2025", "CONSOLIDATED"],
    ["Q1 FY2026", "CONSOLIDATED"],
  ]);
  assert.equal(cq.basisSource.page, 353);
  assert.equal(cq.basisSource.verification, "PRIMARY");
});

test("the standalone columns carry no associate, which is what keeps the series comparable", () => {
  // the condition the whole four period series rests on. a consolidated
  // statement for those years would have been the same statement
  for (const p of cq.periods.filter((x) => x.basis === "STANDALONE")) {
    assert.equal(p.associateShareOfProfit, 0, `${p.label} carries an associate share`);
  }
  assert.ok(cq.periods.some((p) => p.associateShareOfProfit !== 0),
    "no period carries an associate at all, so the distinction has stopped existing");
});

test("the associate only registers in the stub, and by how much", () => {
  const stub = cq.periods.find((p) => p.stub);
  const share = Math.abs(stub.associateShareOfProfit) / stub.pat;
  assert.equal((share * 100).toFixed(1), "8.4");
  // and it is immaterial in the full year beside it
  const fy = cq.periods.filter((p) => !p.stub).at(-1);
  assert.ok(Math.abs(fy.associateShareOfProfit) / fy.pat < 0.001,
    "the associate has become material in the full year, so the caveat needs rewriting");
});

// ---- the subsidiary against the segment its parent reports ----

const segCo = JSON.parse(readFileSync(new URL("../../data/companies/sify.json", import.meta.url)));

test("the parent segment and the subsidiary accounts differ by a fixed amount", () => {
  // the finding. two filings, neither citing the other, measuring the same
  // business. a gap that holds its size while the business grows is an item
  // inside one boundary and outside the other, not a measurement drifting
  const bySeg = new Map(segCo.segments.map((s) => [s.fy, s.revenue / 1e6]));
  const rows = cq.periods
    .filter((p) => !p.stub && bySeg.has(p.label))
    .map((p) => ({ fy: p.label, gap: p.revenue - bySeg.get(p.label), rev: p.revenue }));

  assert.equal(rows.length, 3, "the overlap between the two filings has changed");
  const gaps = rows.map((r) => r.gap);
  const spread = Math.max(...gaps) - Math.min(...gaps);
  const growth = (rows.at(-1).rev - rows[0].rev) / rows[0].rev;

  assert.ok(gaps.every((g) => g > 0), "the subsidiary no longer reports more than the parent segment");
  assert.ok(spread < 1, `the gap moved by ${spread.toFixed(2)} million, so it is no longer fixed`);
  assert.ok(growth > 0.35, "the business stopped growing, so a constant gap says less");
  assert.equal(gaps[0].toFixed(2), "87.79");
});

test("the gap does not notice the change of reporting basis", () => {
  // two of the three overlapping years are the subsidiary standalone and one is
  // consolidated. if the gap tracked the perimeter of the company it would move
  // when the perimeter did
  const bySeg = new Map(segCo.segments.map((s) => [s.fy, s.revenue / 1e6]));
  const byBasis = { STANDALONE: [], CONSOLIDATED: [] };
  for (const p of cq.periods.filter((x) => !x.stub && bySeg.has(x.label))) {
    byBasis[p.basis].push(p.revenue - bySeg.get(p.label));
  }
  assert.ok(byBasis.STANDALONE.length > 0 && byBasis.CONSOLIDATED.length > 0,
    "the overlap no longer spans both reporting bases");
  const mean = (a) => a.reduce((t, v) => t + v, 0) / a.length;
  assert.ok(Math.abs(mean(byBasis.STANDALONE) - mean(byBasis.CONSOLIDATED)) < 1,
    "the gap now moves with the reporting basis, so it may belong to the perimeter after all");
});

// Customer concentration, stated three times in one filing and joined nowhere
// in it. Two of the three are risk factors, so their agreeing proves less than
// it looks; the third sits inside the examined accounts.
const csisl = JSON.parse(readFileSync(new URL("../../data/sisl.json", import.meta.url)));

test("the audited note and the client table report the same customer revenue", () => {
  assert.ok(csisl.majorCustomer.length >= 3, "too few periods to call this a series");
  for (const m of csisl.majorCustomer) {
    const c = csisl.clients.find((x) => x.label === m.label);
    assert.ok(c, `${m.label}: the audited note names a period with no client table`);
    const table = c.rows
      .filter((r) => r.rank <= m.customers)
      .reduce((t, r) => t + r.amount, 0);
    assert.ok(Math.abs(table - m.amountMn) <= 0.01,
      `${m.label}: note 33 reports ${m.amountMn} against ${table.toFixed(2)} in the client table`);
  }
});

test("the audited amount over revenue is the long contract share the risk factor prints", () => {
  for (const m of csisl.majorCustomer) {
    const p = csisl.periods.find((x) => x.label === m.label);
    const k = csisl.contracts.find((x) => x.label === m.label);
    if (!p || !k) continue;
    const share = (m.amountMn / p.revenue) * 100;
    assert.ok(Math.abs(share - k.longContractRevenueShare) <= 0.01,
      `${m.label}: audited share ${share.toFixed(2)} against a printed ${k.longContractRevenueShare}`);
  }
});

test("the note aggregates the same number of customers in every period", () => {
  // A note that quietly changed its own count would be compared against the
  // wrong slice of the client table, and both figures would still look right.
  const counts = new Set(csisl.majorCustomer.map((m) => m.customers));
  assert.equal(counts.size, 1, `the note aggregates ${[...counts].join(" and ")} customers`);
});
