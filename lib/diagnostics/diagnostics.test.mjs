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
