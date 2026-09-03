import { z } from "zod";
import {
  BaseRate,
  CapacityLadder,
  CompanyDoc,
  DisclosureRegister,
  PillarCoverage,
  Prospectus,
  DrhpTriage,
  Sisl,
  Universe,
  AnantRaj,
  TechnoElectric,
  Netweb,
  Invariants,
  Method,
  Macro,
  E2E,
} from "./schema";
import invariantsRaw from "@/data/invariants.json";
import methodRaw from "@/data/method.json";
import macroRaw from "@/data/macro.json";
import sislRaw from "@/data/sisl.json";
import universeRaw from "@/data/universe.json";
import anantRajRaw from "@/data/anantraj.json";
import technoeRaw from "@/data/technoe.json";
import netwebRaw from "@/data/netweb.json";
import registerRaw from "@/data/disclosure_register.json";
import prospectusRaw from "@/data/prospectus.json";
import triageRaw from "@/data/drhp_triage.json";
import baseRateRaw from "@/data/base_rate.json";
import pillarsRaw from "@/data/pillars.json";
import sifyRaw from "@/data/sify_capacity.json";
import e2eRaw from "@/data/e2e.json";
import sifyCoRaw from "@/data/companies/sify.json";
import wiproRaw from "@/data/companies/wipro.json";
import infosysRaw from "@/data/companies/infosys.json";
import equinixRaw from "@/data/companies/equinix.json";
import digitalRealtyRaw from "@/data/companies/digitalrealty.json";

/** Fail the build loudly, with the path to the offending field. */
function parse<T extends z.ZodTypeAny>(schema: T, raw: unknown, what: string): z.infer<T> {
  const r = schema.safeParse(raw);
  if (!r.success) {
    throw new Error(
      `${what} failed validation:\n` +
        r.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n"),
    );
  }
  return r.data;
}

export const baseRate = parse(BaseRate, baseRateRaw, "data/base_rate.json");
export const pillarCoverage = parse(PillarCoverage, pillarsRaw, "data/pillars.json");
export const sify = parse(CapacityLadder, sifyRaw, "data/sify_capacity.json");
export const e2e = parse(E2E, e2eRaw, "data/e2e.json");
export const sifyCo = parse(CompanyDoc, sifyCoRaw, "data/companies/sify.json");
export const wipro = parse(CompanyDoc, wiproRaw, "data/companies/wipro.json");
export const infosys = parse(CompanyDoc, infosysRaw, "data/companies/infosys.json");
export const equinix = parse(CompanyDoc, equinixRaw, "data/companies/equinix.json");
export const digitalRealty = parse(
  CompanyDoc,
  digitalRealtyRaw,
  "data/companies/digitalrealty.json",
);

export const disclosureRegister = parse(
  DisclosureRegister,
  registerRaw,
  "data/disclosure_register.json",
);

export const prospectus = parse(Prospectus, prospectusRaw, "data/prospectus.json");

export const drhpTriage = parse(DrhpTriage, triageRaw, "data/drhp_triage.json");

/** The issuing entity's own restated numbers, read from the filed prospectus. */
export const sisl = parse(Sisl, sislRaw, "data/sisl.json");

/** The coverage universe: announced against delivered megawatts. */
export const universe = parse(Universe, universeRaw, "data/universe.json");

/** The third operator read from a filing, and the one that corrects a figure
 *  the coverage universe had carried from a research note. */
export const technoe = parse(TechnoElectric, technoeRaw, "data/technoe.json");

/** The research note ladder, and the audited annual report read against it. */
export const anantRaj = parse(AnantRaj, anantRajRaw, "data/anantraj.json");

/** Order book rather than megawatts, because this one builds the servers. */
export const netweb = parse(Netweb, netwebRaw, "data/netweb.json");

/**
 * Tickers with a deep-dive route, in one place.
 *
 * Three files need to know this: the route that generates the pages, the front
 * page that decides which cards carry a link, and the coverage matrix. Kept as
 * three lists they drift, and the failure is silent, which is how this project
 * previously ended up with a data file rendering on no page at all.
 */
export const COVERED_TICKERS = ["SIFY", "ANANTRAJ", "NETWEB"] as const;

/** What the build guarantees, published rather than asserted. Checked against
 *  the source of `lib/schema.ts` by the test suite. */
export const invariants = parse(Invariants, invariantsRaw, "data/invariants.json");

/** Formulas with their denominators, the known limits, and the pivot log. */
export const method = parse(Method, methodRaw, "data/method.json");

/** The sector layer. Research house projections, never filed figures. */
export const macro = parse(Macro, macroRaw, "data/macro.json");

/**
 * Full fiscal years only, indexed to the first of them.
 *
 * The stub quarter is excluded rather than annualised. Its return on capital is
 * filed on an unannualised basis, so putting it on an indexed line beside three
 * full years would compare three months of return against twelve and invent a
 * collapse the filing does not claim. The collapse in the stub is real and it is
 * stated in words elsewhere; it is not drawn here.
 */
export function indexedToFirst<K extends "builtMW" | "roce" | "revenue" | "operationalMW">(
  key: K,
) {
  const full = sisl.periods.filter((p) => !p.stub);
  const base = full[0][key];
  return full.map((p) => ({ label: p.label, raw: p[key], index: (p[key] / base) * 100 }));
}

/** Every company harvested so far, data centre operators first. */
export const companies = [sifyCo, equinix, digitalRealty, wipro, infosys];

/**
 * The calendar year a reporting period ends in.
 *
 * Fiscal labels are not comparable across this set. Sify, Wipro and Infosys
 * close on 31 March; Equinix and Digital Realty close on 31 December. FY2026
 * therefore means a year ending March 2026 for one filer and a year ending
 * December 2026 for another, and keying a comparison on the label would put
 * them in the same column while quietly measuring different things. The period
 * end is the fact. The label is the company's own convention.
 *
 * This is the same failure the capacity ladder already guards against by
 * ordering on calendar date rather than fiscal quarter.
 */
export const periodEndYear = (r: { periodEnd: string }) =>
  Number(r.periodEnd.slice(0, 4));

/** Every period end year present across the set, ascending. */
export function coverageYears(cs: CompanyDoc[] = companies) {
  const years = new Set<number>();
  for (const c of cs) for (const f of c.financials) years.add(periodEndYear(f));
  return [...years].sort((a, b) => a - b);
}

/** A company's row for one period end year, or null if it did not report one. */
export function financialsForYear(c: CompanyDoc, year: number) {
  return c.financials.find((f) => periodEndYear(f) === year) ?? null;
}

/** Ordered by calendar date, because the fiscal labels upstream are inconsistent. */
export function ladder(l: CapacityLadder) {
  return [...l.observations].sort((a, b) => a.date.localeCompare(b.date));
}

/** Delivered against promised, for a claim that has been graded. */
export function claimGap(l: CapacityLadder, madeOn: string) {
  const obs = ladder(l);
  const at = (d: string) =>
    [...obs].reverse().find((o) => o.date <= d)?.commissioned_mw ?? null;
  const c = l.claims.find((x) => x.made_on === madeOn);
  if (!c) return null;
  const start = at(c.made_on);
  const end = at(c.horizon_end);
  return start !== null && end !== null
    ? { promised: c.value, delivered: end - start, start, end }
    : null;
}
