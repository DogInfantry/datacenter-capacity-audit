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

/**
 * The disclosure register, measured rather than illustrated.
 *
 * Every count here comes from a complete topic partition, never a keyword
 * search: asking the source for "revenue per megawatt" finds only questions
 * phrased that way and quietly biases the denominator. Asking for a whole
 * topic family and taking every row returns the real one.
 */
const FamilyCount = z
  .object({
    family: z.string().min(1),
    pressed: z.number().int().nonnegative(),
    confirmed: z.number().int().nonnegative(),
    partial: z.number().int().nonnegative(),
    deflected: z.number().int().nonnegative(),
    declined: z.number().int().nonnegative(),
    /** Whether the family was complete over its whole history. Several were
     *  not, because the source caps a response at 50 rows and offers no
     *  pagination. The window below is complete regardless, because responses
     *  arrive newest first and reach back past its start. */
    fullHistoryComplete: z.boolean(),
    windowComplete: z.literal(true),
  })
  .refine(
    (f) => f.confirmed + f.partial + f.deflected + f.declined === f.pressed,
    { message: "the four response qualities must account for every question pressed", path: ["pressed"] },
  );

/**
 * `publishedElsewhere` is the dimension that turns a refusal into a finding,
 * but it can only be coded from what management said out loud. A false here
 * means no source was named on the call. It is not evidence that the figure is
 * unpublished, and nothing on the site may claim otherwise.
 */
const RegisterRefusal = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    askedBy: z.string().nullable(),
    topic: z.string().min(1),
    responseQuality: z.enum(["DEFLECTED", "DECLINED"]),
    refusedNumber: z.string().min(1),
    publishedElsewhere: z.boolean(),
    publishedWhere: z.string().optional(),
    family: z.string().min(1),
  })
  .refine((r) => !r.publishedElsewhere || !!r.publishedWhere, {
    message: "a refusal that points somewhere must say where",
    path: ["publishedWhere"],
  });

const RegisterCompany = z
  .object({
    ticker: z.string().min(1),
    name: z.string().min(1),
    callsCovered: z.number().int().positive(),
    pressurePointsAllFamilies: z.number().int().positive(),
    families: z.array(FamilyCount).min(1),
    pressed: z.number().int().nonnegative(),
    refused: z.number().int().nonnegative(),
    refusals: z.array(RegisterRefusal),
  })
  .refine((c) => c.families.reduce((s, f) => s + f.pressed, 0) === c.pressed, {
    message: "the family counts must add up to the stated denominator",
    path: ["pressed"],
  })
  .refine(
    (c) => c.families.reduce((s, f) => s + f.deflected + f.declined, 0) === c.refused,
    { message: "the refusal count must match the family breakdown", path: ["refused"] },
  )
  .refine((c) => c.refusals.length === c.refused, {
    message: "every counted refusal must be listed, so the numerator can be read",
    path: ["refusals"],
  });

export const DisclosureRegister = z
  .object({
    window: z.object({
      start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      note: z.string().min(1),
    }),
    families: z.array(z.string().min(1)).min(1),
    familyNote: z.string().min(1),
    companies: z.array(RegisterCompany).min(2),
  })
  .refine(
    (r) =>
      r.companies.every(
        (c) =>
          c.families.length === r.families.length &&
          c.families.every((f) => r.families.includes(f.family)),
      ),
    {
      // the whole comparison rests on this: a rate computed over a different
      // set of topics is not the same measurement, however similar it looks
      message: "every company must be measured over the identical family set",
      path: ["companies"],
    },
  );

export type DisclosureRegister = z.infer<typeof DisclosureRegister>;
export type RegisterCompany = z.infer<typeof RegisterCompany>;
export type RegisterRefusal = z.infer<typeof RegisterRefusal>;

/**
 * The filed prospectus.
 *
 * A page number is mandatory on every block. A figure attributed to a 563 page
 * document without saying where in it is not checkable, and this project does
 * not render claims a reader cannot follow back to the source.
 */
const cited = z.number().int().positive();

export const Prospectus = z.object({
  document: z.object({
    title: z.string().min(1),
    issuer: z.string().min(1),
    documentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    pdfPages: cited,
    sourceUrl: z.string().url(),
    /** So an extract can be audited against a re download of the same file. */
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
    note: z.string().min(1),
  }),
  offer: z
    .object({
      totalMn: z.number().positive(),
      freshIssueMn: z.number().positive(),
      offerForSaleMn: z.number().positive(),
      currency: z.string().min(1),
      page: cited,
      source: Source,
    })
    .refine((o) => Math.abs(o.freshIssueMn + o.offerForSaleMn - o.totalMn) < 0.01, {
      message: "the fresh issue and the offer for sale must add up to the total offer",
      path: ["totalMn"],
    }),
  capacity: z
    .object({
      asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      page: cited,
      unit: z.string().min(1),
      source: Source,
      /** Ordered widest to narrowest. The whole finding is that the widest one
       *  is defined as an engineering maximum while being called built. */
      rungs: z
        .array(
          z.object({
            name: z.string().min(1),
            mw: z.number().positive(),
            definition: z.string().min(1),
            gloss: z.string().min(1),
          }),
        )
        .min(2),
      headlineClaim: z.object({ quote: z.string().min(1), page: cited }),
      callComparison: z.object({
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        quote: z.string().min(1),
        note: z.string().min(1),
      }),
    })
    .refine((c) => c.rungs.every((r, i) => i === 0 || r.mw <= c.rungs[i - 1].mw), {
      message: "capacity rungs must descend, widest first",
      path: ["rungs"],
    }),
  objects: z.object({
    page: cited,
    unit: z.string().min(1),
    deployedAsOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    /** What the slippage band drawn against this schedule actually measures.
     *  A literal rather than a free string, because the one way to render this
     *  chart dishonestly is to present a transmission delay distribution as a
     *  forecast of data centre construction. Prose carrying that caveat can be
     *  edited away; a required field cannot. */
    scheduleBasis: z.literal("ISTS_TRANSMISSION_ANALOGY"),
    scheduleBasisNote: z.string().min(1),
    certifiedBy: z.string().min(1),
    source: Source,
    rows: z
      .array(
        z
          .object({
            object: z.string().min(1),
            totalEstimatedCost: z.number().positive(),
            deployed: z.number().nonnegative(),
            fromNetProceeds: z.number().nonnegative(),
            fromBorrowings: z.number().nonnegative(),
            fiscal2027: z.number().nonnegative(),
            fiscal2028: z.number().nonnegative(),
            fiscal2029: z.number().nonnegative(),
          })
          .refine((r) => r.deployed <= r.totalEstimatedCost, {
            message: "money already spent cannot exceed the estimated cost of the object",
            path: ["deployed"],
          })
          // Every object reconciles: what is already spent, plus what the offer
          // pays for, plus what is borrowed, equals the cost. That identity is
          // what lets the funding gap exhibit say the borrowings are the
          // issuer's own figure rather than our subtraction.
          .refine(
            (r) =>
              Math.abs(r.deployed + r.fromNetProceeds + r.fromBorrowings - r.totalEstimatedCost) <
              0.01,
            {
              message:
                "deployed plus net proceeds plus borrowings must equal the total estimated cost",
              path: ["fromBorrowings"],
            },
          ),
      )
      .min(1),
  }),
});

export type Prospectus = z.infer<typeof Prospectus>;

/**
 * The reading rule for a 563 page document, published rather than asserted.
 *
 * Nobody reads a prospectus end to end, and selective reading without a stated
 * rule is cherry picking. Every page is scored the same way and the word list
 * behind the score ships with it, so a reader can disagree with the ranking on
 * its own terms rather than taking it on trust.
 */
export const DrhpTriage = z.object({
  document: z.object({
    title: z.string().min(1),
    documentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
    pdfPages: z.number().int().positive(),
    pageOffset: z.number().int(),
    scoredPages: z.number().int().positive(),
  }),
  method: z.object({
    numberDensity: z.string().min(1),
    hedgeDensity: z.string().min(1),
    substanceScore: z.string().min(1),
    minWords: z.number().int().positive(),
    minWordsNote: z.string().min(1),
    /** Without this the score is unfalsifiable, so it is required. */
    hedgeLexicon: z.array(z.string().min(1)).min(5),
    lexiconNote: z.string().min(1),
  }),
  sections: z
    .array(
      z.object({
        section: z.string().min(1),
        pages: z.number().int().positive(),
        shareOfScored: z.number(),
        numberDensity: z.number(),
        hedgeDensity: z.number(),
        footnoteDefinitions: z.number().int().nonnegative(),
      }),
    )
    .min(2),
  pages: z
    .array(
      z.object({
        printedPage: z.number().int(),
        section: z.string().min(1),
        words: z.number().int().positive(),
        numberDensity: z.number(),
        hedgeDensity: z.number(),
        footnoteDefinitions: z.number().int().nonnegative(),
        substanceScore: z.number(),
      }),
    )
    .min(50),
});

/**
 * A prospectus figure must name the printed page it was read from. The PDF index
 * is not the printed page, the two differ by four in this document, and a reader
 * who wants to check a number needs the printed one.
 */
export const PagedSource = Source.extend({ page: z.number().int().positive() });

const SislPeriod = z.object({
  label: z.string().min(1),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** A stub quarter. Its ROCE is filed unannualised and must not be compared to a full year. */
  stub: z.boolean(),
  revenue: z.number().positive(),
  ebitda: z.number().positive(),
  ebitdaMargin: z.number().positive(),
  pbt: z.number(),
  pat: z.number(),
  patMargin: z.number(),
  roce: z.number(),
  netDebt: z.number().positive(),
  netDebtToEbitda: z.number().positive(),
  builtMW: z.number().positive(),
  installedMW: z.number().positive(),
  operationalMW: z.number().positive(),
  dataCentresBuilt: z.number().int().positive(),
});

const SislCost = z.object({
  label: z.string().min(1),
  power: z.number().positive(),
  otherDirect: z.number().positive(),
  employee: z.number().positive(),
  financeCostPL: z.number().positive(),
  /** Borrowing cost capitalised into assets under construction rather than expensed. */
  interestCapitalised: z.number().positive(),
});

export const Sisl = z
  .object({
    entity: z.string().min(1),
    currency: z.string().min(1),
    unit: z.string().min(1),
    periods: z.array(SislPeriod).min(3),
    periodsSource: PagedSource,
    costStack: z.array(SislCost).min(3),
    costStackSource: PagedSource,
    capitalisationRate: z.number().positive(),
    contracts: z
      .array(z.object({ label: z.string().min(1), longContractRevenueShare: z.number().positive() }))
      .min(3),
    contractsSource: PagedSource,
    escalatorMinPct: z.number().positive(),
    escalatorMaxPct: z.number().positive(),
    sites: z
      .array(
        z.object({
          name: z.string().min(1),
          city: z.string().min(1),
          state: z.string().min(1),
          builtMW: z.number().positive(),
          installedMW: z.number().positive(),
          operationalMW: z.number().positive(),
        }),
      )
      .min(10),
    sitesAsOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sitesSource: PagedSource,
    /** Nulls are the issuer's own "not applicable" cells. Never impute them. */
    peers: z
      .array(
        z.object({
          name: z.string().min(1),
          fiscalEnd: z.string().min(1),
          revenue: z.number().positive(),
          ebitda: z.number().nullable(),
          pat: z.number(),
          builtMW: z.number().positive().nullable(),
          operationalMW: z.number().positive().nullable(),
          self: z.boolean(),
        }),
      )
      .min(3),
    peersSource: PagedSource,
    clients: z
      .array(
        z.object({
          label: z.string().min(1),
          top10Amount: z.number().positive(),
          top10Share: z.number().positive(),
          rows: z
            .array(
              z.object({
                rank: z.number().int().positive(),
                amount: z.number().positive(),
                share: z.number().positive(),
                type: z.enum(["Hyperscaler", "Enterprise"]),
              }),
            )
            .length(10),
        }),
      )
      .min(3),
    clientsSource: PagedSource,
    capacityDefinitions: z.object({
      engineeredToSupport: z.object({ quote: z.string().min(1), page: z.number().int().positive() }),
      availableToSell: z.object({ quote: z.string().min(1), page: z.number().int().positive() }),
    }),
  })
  .superRefine((d, ctx) => {
    // The site rows must reconcile to the stated totals. The filing rounds each
    // row to two places, so thirteen rows land a hundredth or two above the
    // printed total. Anything wider than that means a row was mistyped.
    const stub = d.periods.find((p) => p.stub);
    if (stub) {
      for (const k of ["builtMW", "installedMW", "operationalMW"] as const) {
        const sum = d.sites.reduce((t, s) => t + s[k], 0);
        const diff = Math.abs(sum - stub[k]);
        if (diff > 0.05) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ["sites"],
            message: `${k}: sites sum to ${sum.toFixed(2)} against a stated total of ${stub[k]}, a gap of ${diff.toFixed(2)}`,
          });
        }
      }
    }
    // Exactly one peer row is the issuer itself. Without it the peer exhibits
    // cannot tell which bar to highlight.
    if (d.peers.filter((p) => p.self).length !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["peers"],
        message: "exactly one peer row must be marked self",
      });
    }
    // The finding, asserted rather than described.
    //
    // Printed page 46 gives the share of revenue on contracts of at least seven
    // years with five years of average life remaining. Printed page 36 gives
    // revenue by client. In every period the first equals the sum of the top
    // three clients, all three of them Hyperscalers, to the second decimal. The
    // issuer never joins those two tables, and joined they say the long contract
    // base and the client concentration are the same three counterparties.
    //
    // If a future edit breaks the identity, the claim on the page has stopped
    // being true and the build should fail rather than the sentence going stale.
    for (const c of d.clients) {
      const contract = d.contracts.find((x) => x.label === c.label);
      if (!contract) continue;
      const top3 = c.rows
        .filter((r) => r.rank <= 3)
        .reduce((t, r) => t + r.share, 0);
      if (Math.abs(top3 - contract.longContractRevenueShare) > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["clients"],
          message: `${c.label}: top three clients sum to ${top3.toFixed(2)} against a long contract share of ${contract.longContractRevenueShare}. The reconciliation that carries the finding no longer holds.`,
        });
      }
      if (c.rows.filter((r) => r.rank <= 3).some((r) => r.type !== "Hyperscaler")) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["clients"],
          message: `${c.label}: the filing states clients 1, 2 and 3 are Hyperscalers in every period`,
        });
      }
    }
    // The capacity rungs must descend. Built is what a site is engineered to
    // support, installed is what is commissioned, operational is what is sold,
    // so a period where they do not descend means a row was misread.
    for (const p of d.periods) {
      if (!(p.builtMW >= p.installedMW && p.installedMW >= p.operationalMW)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["periods"],
          message: `${p.label}: capacity rungs must descend, got built ${p.builtMW}, installed ${p.installedMW}, operational ${p.operationalMW}`,
        });
      }
    }
    // The whole finding is that one document defines the same figure twice in two
    // places. If they ever land on the same printed page, the finding is gone.
    if (
      d.capacityDefinitions.engineeredToSupport.page ===
      d.capacityDefinitions.availableToSell.page
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capacityDefinitions"],
        message: "the two capacity definitions must cite different printed pages",
      });
    }
  });

const Verdict = z.enum([
  "EXECUTING",
  "PLANNING",
  "ADVANCING",
  "LAGGING",
  "AMBITION_OVER_EXECUTION",
]);

export const Universe = z
  .object({
    asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    operators: z
      .array(
        z.object({
          id: z.string().min(1),
          operator: z.string().min(1),
          listedParent: z.string().min(1),
          ticker: z.string().min(1),
          exchange: z.enum(["NSE", "BSE", "NASDAQ"]),
          announcedMW: z.number().nonnegative(),
          liveMW: z.number().nonnegative(),
          /** Live is not the same as handed over. Null where an operator does not split them. */
          handedOverMW: z.number().nonnegative().nullable(),
          verdict: Verdict,
          note: z.string().min(1),
          source: Source,
        }),
      )
      .min(5),
    watchlist: z
      .array(
        z.object({
          name: z.string().min(1),
          ticker: z.string().min(1),
          bucket: z.enum(["IT_SERVICES", "DC_AI_INFRA", "PICKS_AND_SHOVELS"]),
          role: z.string().min(1),
          verdict: Verdict,
          metric: z.string().min(1),
          note: z.string().min(1),
        }),
      )
      .min(3),
    watchlistSource: Source,
  })
  .superRefine((d, ctx) => {
    for (const o of d.operators) {
      // Nobody can have more live than announced. If that inverts, a row has been
      // read wrong or an announcement has quietly been restated downwards.
      if (o.liveMW > o.announcedMW) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operators"],
          message: `${o.operator}: ${o.liveMW} MW live against ${o.announcedMW} MW announced`,
        });
      }
      // Handed over sits inside live. Anant Raj is the whole reason this field exists.
      if (o.handedOverMW !== null && o.handedOverMW > o.liveMW) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operators"],
          message: `${o.operator}: ${o.handedOverMW} MW handed over exceeds ${o.liveMW} MW live`,
        });
      }
      // Only a figure traced to a filed document inside this repository may claim
      // PRIMARY. Research notes and press reporting are SECONDARY at best.
      if (o.source.verification === "PRIMARY" && !/prospectus|20-F|filing/i.test(o.source.label)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operators"],
          message: `${o.operator}: claims PRIMARY without naming a filed document`,
        });
      }
    }
  });

export const AnantRaj = z
  .object({
    entity: z.string().min(1),
    listedParent: z.string().min(1),
    ticker: z.string().min(1),
    exchange: z.string().min(1),
    role: z.string().min(1),
    ladder: z
      .array(
        z.object({
          rung: z.string().min(1),
          mw: z.number().positive(),
          definition: z.string().min(1),
          kind: z.enum(["AMBITION", "CLAIMED", "DELIVERED"]),
        }),
      )
      .length(3),
    ladderSource: Source,
    conflict: z.object({
      field: z.string().min(1),
      a: z.object({ value: z.number(), source: z.string().min(1) }),
      b: z.object({ value: z.number(), source: z.string().min(1) }),
      note: z.string().min(1),
    }),
    sites: z.array(z.object({ name: z.string().min(1), state: z.string().min(1), operationalMW: z.number().positive() })).min(1),
    targetFiscalYear: z.string().min(1),
    capexUsdBn: z.number().positive(),
    /** What has deliberately not been read. Rendered on the page, not hidden. */
    notRead: z.array(z.string().min(1)).min(1),
  })
  .superRefine((d, ctx) => {
    // The ladder must descend. Announced, then claimed operational, then what is
    // actually handed over. That descent is the entire finding.
    const mw = d.ladder.map((l) => l.mw);
    if (!(mw[0] >= mw[1] && mw[1] >= mw[2])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ladder"],
        message: `the capacity ladder must descend, got ${mw.join(" then ")}`,
      });
    }
    // Nothing here is traced to a filing, so nothing here may claim PRIMARY.
    if (d.ladderSource.verification === "PRIMARY") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ladderSource"],
        message: "no Anant Raj figure is traced to a filing, so it cannot claim PRIMARY",
      });
    }
  });

export type AnantRaj = z.infer<typeof AnantRaj>;

/**
 * Netweb, the name with no megawatts.
 *
 * The other two deep dives are capacity stories and this one cannot be. Netweb
 * builds the servers that go inside somebody else's data centre, so the unit it
 * is measured on is an order book. The refinements below protect the single
 * arithmetic claim the page makes: that one named order sits inside the book it
 * is being measured against, and was awarded before that book was struck.
 */
export const Netweb = z
  .object({
    entity: z.string().min(1),
    listedParent: z.string().min(1),
    ticker: z.string().min(1),
    exchange: z.string().min(1),
    role: z.string().min(1),
    orderBook: z.object({
      valueCr: z.number().positive(),
      asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      note: z.string().min(1),
    }),
    anchorOrder: z.object({
      name: z.string().min(1),
      counterparty: z.string().min(1),
      kind: z.enum(["GOVT", "HYPERSCALER", "ANCHOR_TENANT", "OTHER"]),
      valueCr: z.number().positive(),
      /** Month precision is allowed. The note gives September 2025, not a day. */
      awarded: z.string().regex(/^\d{4}-\d{2}(-\d{2})?$/),
      awardedNote: z.string().min(1),
      deliveryDue: z.string().min(1),
      scope: z.string().min(1),
    }),
    /** Why the share is a ceiling rather than a measurement. Required, because
     *  prose carrying that caveat can be edited away and a field cannot. */
    concentrationCaveat: z.string().min(1),
    revenueMix: z
      .array(
        z.object({
          period: z.string().min(1),
          /** A literal rather than a free string, because the exhibit claims one
           *  period sits inside the other and that claim has to be checkable. */
          span: z.enum(["QUARTER", "NINE_MONTHS"]),
          basis: z.string().min(1),
          aiSharePct: z.number().min(0).max(100),
          note: z.string().min(1),
        }),
      )
      .min(2),
    valuation: z.object({
      trailingPE: z.number().positive(),
      note: z.string().min(1),
    }),
    /** What has deliberately not been read. Rendered on the page, not hidden. */
    notRead: z.array(z.string().min(1)).min(1),
    source: Source,
  })
  .superRefine((d, ctx) => {
    // An order cannot be larger than the book that holds it. If that inverts, a
    // figure was mistyped and the concentration exhibit is arithmetic nonsense.
    if (d.anchorOrder.valueCr > d.orderBook.valueCr) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["anchorOrder", "valueCr"],
        message: `the ${d.anchorOrder.name} order of ${d.anchorOrder.valueCr} cr exceeds the ${d.orderBook.valueCr} cr order book it is measured against`,
      });
    }
    // The book must be struck after the award, or the order is not inside it and
    // the share the page draws is measuring nothing. Both dates are zero padded,
    // so a string comparison is a date comparison, and the award is allowed to
    // carry month precision while the book carries a day.
    if (!(d.orderBook.asOf > d.anchorOrder.awarded)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["orderBook", "asOf"],
        message: `the order book at ${d.orderBook.asOf} does not postdate the award at ${d.anchorOrder.awarded}, so the order cannot be inside it`,
      });
    }
    // The mix exhibit draws a quarter against the nine months that contain it
    // and says so out loud. Exactly one of each, or that sentence is describing
    // rows which are not on the page.
    for (const s of ["QUARTER", "NINE_MONTHS"] as const) {
      const n = d.revenueMix.filter((r) => r.span === s).length;
      if (n !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["revenueMix"],
          message: `revenueMix must carry exactly one ${s} row, found ${n}`,
        });
      }
    }
    // Nothing here is traced to a filing, so nothing here may claim PRIMARY.
    if (d.source.verification === "PRIMARY") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["source"],
        message: "no Netweb figure is traced to a filing, so it cannot claim PRIMARY",
      });
    }
  });

export type Netweb = z.infer<typeof Netweb>;

/**
 * The method: formulas with their denominators, the known limits, and the log
 * of how this project's direction changed.
 *
 * A limits list that only ever grows is a pose. This one records what was
 * closed and by what, which is why `closedBy` is required the moment a limit
 * says it is closed.
 */
export const Method = z
  .object({
    formulas: z
      .array(
        z.object({
          name: z.string().min(1),
          formula: z.string().min(1),
          /** A rate without a denominator is decoration, so this is required. */
          sample: z.string().min(1),
          note: z.string().min(1),
        }),
      )
      .min(1),
    limits: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          status: z.enum(["OPEN", "CLOSED"]),
          limit: z.string().min(1),
          closedBy: z.string().min(1).nullable(),
        }),
      )
      .min(1),
    pivots: z
      .array(
        z.object({
          when: z.string().min(1),
          what: z.string().min(1),
          why: z.string().min(1),
        }),
      )
      .min(1),
  })
  .superRefine((d, ctx) => {
    for (const l of d.limits) {
      // Closing a limit is a claim like any other and has to carry its evidence.
      // Marking one closed without naming what closed it is how a limits list
      // turns into a list of things that stopped being mentioned.
      if ((l.status === "CLOSED") !== (l.closedBy !== null)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["limits"],
          message: `${l.id}: a closed limit must name what closed it, and an open one must not`,
        });
      }
    }
  });

export type Method = z.infer<typeof Method>;

/**
 * The sector layer.
 *
 * Every figure here is a research house projection rather than a filed number,
 * and the exhibit built on it turns that into the finding: the published 2030
 * forecasts disagree by a factor of three, and all of them are stated in built
 * capacity, the unit this project has already shown does not earn.
 */
export const Macro = z
  .object({
    asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    capacity: z.object({
      current: z.object({
        mw: z.number().positive(),
        year: z.number().int().positive(),
        note: z.string().min(1),
        source: Source,
      }),
      unit: z.string().min(1),
      unitNote: z.string().min(1),
      forecasts: z
        .array(
          z.object({
            publisher: z.string().min(1),
            mw: z.number().positive(),
            /** Present only where the publisher gave a band rather than a point. */
            mwHigh: z.number().positive().nullable(),
            byYear: z.number().int().positive(),
            basis: z.string().min(1),
            source: Source,
          }),
        )
        .min(3),
    }),
    buildRate: z
      .array(
        z.object({
          year: z.number().int().positive(),
          addedMW: z.number().positive(),
          source: Source,
        }),
      )
      .min(2),
    market: z.object({
      currentBnUsd: z.number().positive(),
      forecastBnUsd: z.number().positive(),
      currentYear: z.number().int().positive(),
      forecastYear: z.number().int().positive(),
      note: z.string().min(1),
      source: Source,
    }),
  })
  .superRefine((d, ctx) => {
    const f = d.capacity.forecasts;
    for (const row of f) {
      // A 2030 forecast below what is already operational means a row was
      // misread, or a publisher is forecasting a contraction and saying so
      // somewhere this file does not record.
      if (row.mw <= d.capacity.current.mw) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["capacity", "forecasts"],
          message: `${row.publisher} forecasts ${row.mw} MW against ${d.capacity.current.mw} MW already operational`,
        });
      }
      // A band must widen, not invert.
      if (row.mwHigh !== null && row.mwHigh <= row.mw) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["capacity", "forecasts"],
          message: `${row.publisher} gives a band whose top is not above its bottom`,
        });
      }
      // These are projections. Nothing here is read out of a filing.
      if (row.source.verification === "PRIMARY") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["capacity", "forecasts"],
          message: `${row.publisher} is a forecast and cannot claim PRIMARY`,
        });
      }
    }
    // The exhibit's claim is that the houses disagree. One publisher holding
    // both ends of the range would make it a single house's own band drawn as a
    // disagreement, which is a different and much weaker statement.
    const sorted = [...f].sort((a, b) => a.mw - b.mw);
    if (sorted[0].publisher === sorted[sorted.length - 1].publisher) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["capacity", "forecasts"],
        message: "the lowest and highest forecasts come from one publisher, so there is no disagreement to draw",
      });
    }
  });

export type Macro = z.infer<typeof Macro>;

/**
 * The register of this file's own refinements.
 *
 * The methodology page publishes what the build guarantees. A list of
 * guarantees that can quietly stop being true is worth less than no list, so
 * every row carries a literal `fragment` of the message its refinement emits,
 * and the test suite asserts both that each fragment is still present in this
 * source file and that the number of messages here equals the number of rows
 * there. Adding a guard without documenting it fails the tests, and so does
 * leaving a row behind after removing one.
 */
export const Invariants = z
  .object({
    categories: z
      .array(
        z.object({
          id: z.string().min(1),
          name: z.string().min(1),
          gloss: z.string().min(1),
        }),
      )
      .min(1),
    rows: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          schema: z.string().min(1),
          category: z.string().min(1),
          protects: z.string().min(1),
          /** A literal substring of the emitted message, matched against the
           *  source by the tests. Never a paraphrase. */
          fragment: z.string().min(1),
        }),
      )
      .min(1),
  })
  .superRefine((d, ctx) => {
    const known = new Set(d.categories.map((c) => c.id));
    const seen = new Set<string>();
    for (const r of d.rows) {
      if (!known.has(r.category)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rows"],
          message: `${r.id}: unknown category ${r.category}`,
        });
      }
      if (seen.has(r.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["rows"],
          message: `duplicate invariant id ${r.id}`,
        });
      }
      seen.add(r.id);
    }
    // A category with no rows is a heading over an empty promise.
    for (const c of d.categories) {
      if (!d.rows.some((r) => r.category === c.id)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["categories"],
          message: `category ${c.id} is declared but no invariant belongs to it`,
        });
      }
    }
  });

export type Invariants = z.infer<typeof Invariants>;

export type Universe = z.infer<typeof Universe>;
export type Verdict = z.infer<typeof Verdict>;

export type Sisl = z.infer<typeof Sisl>;
export type PagedSource = z.infer<typeof PagedSource>;

export type DrhpTriage = z.infer<typeof DrhpTriage>;

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
