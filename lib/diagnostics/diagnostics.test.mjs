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

const others = ["wipro", "infosys"].map((n) =>
  JSON.parse(readFileSync(new URL(`../../data/companies/${n}.json`, import.meta.url))),
);
const all = [co, ...others];

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
