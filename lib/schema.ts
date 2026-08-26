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

export type Campus = z.infer<typeof Campus>;
export type BaseRate = z.infer<typeof BaseRate>;
export type Source = z.infer<typeof Source>;
