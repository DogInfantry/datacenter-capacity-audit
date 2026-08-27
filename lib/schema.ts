import { z } from "zod";

/**
 * Provenance is mandatory, everywhere, including on our own seed rows.
 *
 * The product's argument is that announced capacity is reported with more
 * confidence than the evidence carries. A ledger that made the same move would
 * not deserve to be believed, so every claim states where it came from and how
 * far it has actually been checked.
 */
export const Verification = z.enum([
  "PRIMARY", // read out of a filing, a tariff order or a government dataset
  "SECONDARY", // reported by a named third party, not yet traced to the primary
  "UNVERIFIED", // carried in from research notes, still to be checked
]);

export const Source = z.object({
  label: z.string().min(1),
  url: z.string().url().optional(),
  asOf: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/, "use YYYY-MM or YYYY-MM-DD"),
  verification: Verification,
});

/** A claim carries its own evidence, or it does not go on the page. */
const sourced = <T extends z.ZodTypeAny>(value: T) =>
  z.object({ value, source: Source });

export const Campus = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  operator: z.string().min(1),
  listedParent: z.string().nullable(),
  site: z.string().min(1),
  state: z.string().min(1),
  /** Precision is stated, never implied. Operators do not publish coordinates. */
  location: z.object({
    lat: z.number().min(6).max(37),
    lon: z.number().min(68).max(98),
    precision: z.enum(["SITE", "CITY", "DISTRICT", "STATE"]),
  }),
  liveMW: sourced(z.number().min(0)),
  /** Live is not the same as handed over. That gap is the thesis. */
  handedOverMW: sourced(z.number().min(0)).nullable(),
  announcedMW: sourced(z.number().min(0)),
  claimedLiveBy: sourced(z.string()).nullable(),
  note: z.string().optional(),
});

export const BaseRateStats = z.object({
  n: z.number().int().positive(),
  median_months: z.number(),
  mean_months: z.number(),
  cost_weighted_mean_months: z.number().nullable(),
  max_months: z.number(),
  approved_cost_cr: z.number(),
});

export const BaseRate = z.object({
  n: z.number().int().positive(),
  median_months: z.number(),
  mean_months: z.number(),
  min_months: z.number(),
  max_months: z.number(),
  p25_months: z.number(),
  p75_months: z.number(),
  p90_months: z.number(),
  cost_weighted_mean_months: z.number(),
  total_approved_cost_cr: z.number(),
  share_over_12_months: z.number().min(0).max(1),
  by_ownership: z.record(z.string(), BaseRateStats),
  by_agency: z.record(
    z.string(),
    z.object({ n: z.number().int(), median_months: z.number() }),
  ),
  source: z.object({
    title: z.string(),
    publisher: z.string(),
    question: z.string(),
    resource_id: z.string(),
    url: z.string(),
    censoring: z.string(),
  }),
});

/**
 * Capacity as a company describes it on its own calls.
 *
 * Ordering is by `date`, never by `fiscal_label`. The upstream source labels
 * January 2024 as FY2023Q3 and January 2025 as FY2025Q3, so the fiscal tags are
 * not internally consistent and sorting by them silently scrambles the series.
 */
export const CapacityObservation = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  fiscal_label: z.string(),
  design_mw: z.number().positive().optional(),
  built_mw: z.number().positive().optional(),
  commissioned_mw: z.number().positive().optional(),
  contracted_mw: z.number().positive().optional(),
  facilities: z.number().int().positive().optional(),
  cities: z.number().int().positive().optional(),
  quote: z.string().min(1),
});

/** A forward claim, graded only once its horizon has passed. */
export const Claim = z
  .object({
    made_on: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    claim: z.string().min(1),
    value: z.number(),
    unit: z.string(),
    horizon_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    verbatim: z.string().min(1),
    status: z.enum(["OPEN", "MET", "MISSED", "PARTIAL", "UNVERIFIABLE"]),
    resolved_evidence: z.string().nullable(),
  })
  .refine((c) => c.status === "OPEN" || c.resolved_evidence !== null, {
    message: "a graded claim must carry the evidence that graded it",
    path: ["resolved_evidence"],
  })
  .refine((c) => c.horizon_end > c.made_on, {
    message: "horizon_end must fall after made_on",
    path: ["horizon_end"],
  });

/**
 * A refusal. `published_elsewhere` is the field that turns a refusal into a
 * finding: refused in the call but published in a filing is ordinary investor
 * relations practice, refused and published nowhere is a disclosure gap.
 */
export const Refusal = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    asked_by: z.string().nullable(),
    refused_number: z.string().min(1),
    response_quality: z.enum(["CONFIRMED", "PARTIAL", "DEFLECTED", "DECLINED"]),
    topic: z.string().min(1),
    published_elsewhere: z.boolean(),
    published_where: z.string().optional(),
    mechanism_quote: z.string().optional(),
  })
  .refine((r) => !r.published_elsewhere || !!r.published_where, {
    message: "published_elsewhere requires naming where it was published",
    path: ["published_where"],
  });

export const CapacityLadder = z.object({
  company: z.string(),
  name: z.string(),
  exchange: z.string(),
  note: z.string(),
  source: Source,
  definitions: z.record(z.string(), z.string()),
  observations: z.array(CapacityObservation).min(2),
  claims: z.array(Claim),
  refusals: z.array(Refusal),
});

const FilingSource = z.object({
  filing: z.string().min(1),
  publisher: z.string().min(1),
  verification: Verification,
  restated: z.boolean(),
});

/** Values are in filing currency, unconverted. Crore is a display concern. */
export const CompanyFinancials = z.object({
  fy: z.string().regex(/^FY\d{4}$/),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  revenue: z.number().positive(),
  /** Kept where a filer reports both. For Wipro the rupee and dollar lines
   *  diverge across FY2023 to FY2026 and the difference is currency, not
   *  business, so dropping one would flatter the other. */
  revenueUsd: z.number().positive().optional(),
  cfo: z.number().optional(),
  capex: z.number().optional(),
  ppe: z.number().positive().optional(),
  source: FilingSource,
  restated: z.boolean(),
});

export const CompanySegment = z.object({
  name: z.string().min(1),
  fy: z.string().regex(/^FY\d{4}$/),
  revenue: z.number().positive(),
  opex: z.number(),
  depreciation: z.number().positive().optional(),
  /** Items a filer adds back to reach its own adjusted EBITDA: stock
   *  compensation, impairment, transaction costs. Present only where every
   *  component is tagged. Undefined means the add backs could not be built,
   *  which is not the same as their being zero, and `reconcileMargin` refuses
   *  to reconcile rather than assuming the difference away. */
  nonGaapAddBacks: z.number().optional(),
  source: FilingSource,
  note: z.string().optional(),
});

/**
 * A margin the company stated itself, on the record.
 *
 * Adjusted EBITDA margin is non-GAAP and appears in no metric class of the
 * filings store for either Equinix or Digital Realty. Management says it out
 * loud on the call instead, so the call is its primary source. This is the
 * external reference the harvest is checked against, which is why it carries
 * the verbatim quote and the speaker and not merely a number.
 */
export const StatedMargin = z.object({
  period: z.string().min(1),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  value: z.number().positive(),
  unit: z.string().min(1),
  /** Guidance is a band and earns a wider tolerance than a reported actual. */
  isActual: z.boolean(),
  verbatim: z.string().min(1),
  speaker: z.string().min(1),
  speakerRole: z.string().min(1),
  callDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  source: Source,
});

export const CompanyDoc = z
  .object({
    ticker: z.string().min(1),
    name: z.string().min(1),
    exchange: z.string().min(1),
    currency: z.string().min(1),
    fiscalYearEnd: z.string(),
    role: z.string().optional(),
    /** What a segmentation actually means, so the narrative test is not
     *  silently comparing unlike things. Equinix is a pure play, so group
     *  equals segment. Infosys and Wipro segment by industry vertical, not by
     *  AI. NOT_HARVESTED is honest about a gap rather than implying none. */
    segmentBasis: z
      .enum(["BY_SERVICE_LINE", "BY_VERTICAL", "PURE_PLAY", "NOT_HARVESTED"])
      .optional(),
    note: z.string(),
    sourceIndex: z.string().url(),
    financials: z.array(CompanyFinancials).min(2),
    segments: z.array(CompanySegment).default([]),
    /** What management said the margin was, in its own words. Empty for a
     *  filer we have not checked against an outside statement. */
    statedMargins: z.array(StatedMargin).default([]),
  })
  .refine(
    (c) => {
      // a segment can never be larger than the group it sits inside
      const g = new Map(c.financials.map((f) => [f.fy, f.revenue]));
      return c.segments.every((s) => !g.has(s.fy) || s.revenue <= g.get(s.fy)!);
    },
    { message: "segment revenue exceeds group revenue in at least one year", path: ["segments"] },
  );

export type Campus = z.infer<typeof Campus>;
export type CompanyDoc = z.infer<typeof CompanyDoc>;
export type CompanyFinancials = z.infer<typeof CompanyFinancials>;
export type CompanySegment = z.infer<typeof CompanySegment>;
export type StatedMargin = z.infer<typeof StatedMargin>;
export type CapacityLadder = z.infer<typeof CapacityLadder>;
export type Claim = z.infer<typeof Claim>;
export type Refusal = z.infer<typeof Refusal>;
export type BaseRate = z.infer<typeof BaseRate>;
export type Source = z.infer<typeof Source>;
