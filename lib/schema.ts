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

/**
 * One figure with the filing that served it.
 *
 * The row below carries a single source, which was true while every field on it
 * came from one harvest of one concept family. It stopped being true the moment
 * the three cash conversion inputs were pulled: the store serves Equinix's total
 * assets for 2022 from the FY2023 10-K and its investing cash for the same year
 * from the FY2024 10-K, and the row itself is recorded against a third. A shared
 * source would have to name one of them and be wrong about the other two.
 */
const HarvestedFigure = z.object({ value: z.number(), source: FilingSource });

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
  /** Profit after tax, signed. A loss is a negative number and not an absence,
   *  and that distinction carries the whole finding on one of these filers. */
  pat: HarvestedFigure.optional(),
  /** The denominator of the accrual ratio. Absent on the most recent year of
   *  both US filers, because a 10-K prints its balance sheet one year behind
   *  the cash flow filed alongside it and the store serves what was printed. */
  totalAssets: HarvestedFigure.optional(),
  /** Net cash used in investing, with its filed sign, matching the convention
   *  `SislCashFlow` already uses so nothing depends on remembering which way an
   *  outflow points. */
  cfi: HarvestedFigure.optional(),
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
  )
  .refine(
    // Property, plant and equipment is one line inside total assets, so a total
    // smaller than its own component means the two were harvested against
    // different periods or different units. Both are silent failures otherwise:
    // the accrual ratio would still divide and still return a plausible number.
    (c) =>
      c.financials.every((f) => !f.totalAssets || !f.ppe || f.totalAssets.value > f.ppe),
    {
      message: "total assets are smaller than the property, plant and equipment inside them",
      path: ["financials"],
    },
  )
  .refine(
    // The three cash conversion inputs are harvested per period rather than per
    // filing, and a value without the filing that served it cannot be cited on
    // a page. An empty filing string is the shape a partial harvest leaves.
    (c) =>
      c.financials.every((f) =>
        [f.pat, f.totalAssets, f.cfi].every((h) => !h || h.source.filing.length > 0),
      ),
    {
      message: "a harvested figure carries no filing to cite it against",
      path: ["financials"],
    },
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
/**
 * How a document's printed page numbers map onto positions in its PDF.
 *
 * Every primary claim here names a printed page, so this mapping is load
 * bearing for the whole site, and until it was written down as data it was a
 * sentence in a manifest that nobody could check. Two documents recorded the
 * same field name with opposite sign conventions: one meant index equals
 * printed plus four, the other meant printed equals index minus two. Applying
 * either reading to the other document moves every citation.
 *
 * So the mapping is stored as a position rather than an offset. `pdfIndexOfPrintedOne`
 * names where printed page one sits, and a position cannot be read backwards.
 * The anchors beside it are folios the document prints on itself, recovered by
 * `pipeline/find_folios.py`, and the refinement below recomputes each one from
 * the declared mapping. The claim and the evidence for it therefore travel
 * together, and editing one without the other fails the build.
 *
 * A spread sets two printed pages on one PDF page, so a printed page is half a
 * PDF page and which half it is has to be recorded. `validFromPdfIndex` marks
 * where the mapping starts holding, because front matter is often numbered on
 * its own terms and pretending one rule covers the file is how an offset ends
 * up quietly wrong at one end of a document.
 */
export const Pagination = z
  .object({
    kind: z.enum(["SINGLE", "SPREAD"]),
    printedPagesPerPdfPage: z.union([z.literal(1), z.literal(2)]),
    pdfIndexOfPrintedOne: z.number().int().nonnegative(),
    halfOfPrintedOne: z.enum(["LEFT", "RIGHT"]).nullable(),
    validFromPdfIndex: z.number().int().nonnegative(),
    /** Folios the document prints on itself. Evidence, not decoration. */
    anchors: z
      .array(
        z.object({
          pdfIndex: z.number().int().nonnegative(),
          printedPage: z.number().int().positive(),
          half: z.enum(["LEFT", "RIGHT"]).nullable(),
        }),
      )
      .min(2),
    derivedBy: z.string().min(1),
  })
  .superRefine((p, ctx) => {
    const spread = p.printedPagesPerPdfPage === 2;
    const slot = (pdfIndex: number, half: "LEFT" | "RIGHT" | null) =>
      spread ? pdfIndex * 2 + (half === "RIGHT" ? 1 : 0) : pdfIndex;
    const origin = slot(p.pdfIndexOfPrintedOne, p.halfOfPrintedOne);

    // The check the whole block exists for. Each anchor is a page the document
    // numbered itself; recomputing it from the declared mapping is what turns
    // the mapping from an assertion into a measurement.
    for (const a of p.anchors) {
      const predicted = slot(a.pdfIndex, a.half) - origin + 1;
      if (predicted !== a.printedPage) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["anchors"],
          message: `the declared pagination does not reproduce a folio the document prints: index ${a.pdfIndex} would be printed page ${predicted}, and the document prints ${a.printedPage}`,
        });
      }
      if (a.pdfIndex < p.validFromPdfIndex) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["anchors"],
          message: `an anchor sits before the index the mapping is declared to hold from`,
        });
      }
      if (spread !== (a.half !== null)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["anchors"],
          message: `an anchor names a half on a single page layout, or omits one on a spread`,
        });
      }
    }
    // Anchors on one page, or the same page twice, are a coincidence rather
    // than a check. Two distinct pages are the minimum that can disagree.
    if (new Set(p.anchors.map((a) => `${a.pdfIndex}:${a.half}`)).size < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["anchors"],
        message: `a pagination needs at least two distinct anchors to be checkable`,
      });
    }
    if (spread !== (p.halfOfPrintedOne !== null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["halfOfPrintedOne"],
        message: `a spread must say which half carries printed page one, and a single page layout must not`,
      });
    }
  });

export type Pagination = z.infer<typeof Pagination>;

export const DrhpTriage = z.object({
  document: z.object({
    title: z.string().min(1),
    documentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    sha256: z.string().regex(/^[0-9a-f]{64}$/),
    pdfPages: z.number().int().positive(),
    pagination: Pagination,
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

/**
 * The risk register.
 *
 * This is the first surface on this site whose grading is a judgement rather
 * than a reading. Everything else is read, derived or refused, so the register
 * has to carry its own honesty in required fields rather than in prose a later
 * edit can quietly drop. `measured` states whether the magnitude drawn beside a
 * row is derived from data in this repository or merely asserted, `page` states
 * which printed page the row rests on, and the register above the rows has to
 * say out loud that the position in the matrix is ours and not the issuer's.
 *
 * The categories are the six forensic pillars of the project brief rather than
 * a taxonomy invented here. That makes the register the qualitative half of a
 * framework whose scoring half is blocked for want of a cash flow statement,
 * and it makes the pillars carrying no row a visible hole rather than a silence.
 */
export const RiskPillar = z.enum([
  "REVENUE_QUALITY",
  "CASH_CONVERSION",
  "BALANCE_SHEET",
  "GOVERNANCE",
  "BUSINESS_MODEL",
  "VALUATION",
]);

const Grade = z.enum(["LOW", "MED", "HIGH"]);

export const RiskItem = z
  .object({
    id: z.string().regex(/^[a-z0-9-]+$/),
    risk: z.string().min(1),
    category: RiskPillar,
    severity: Grade,
    likelihood: Grade,
    mitigant: z.string().min(1),
    /** True when the magnitude beside this row is derived at render from data
     *  in this repository. The derivation lives in lib/diagnostics/risk.ts, and
     *  a test asserts that every measured id is a key in it, so a row cannot
     *  claim a derived figure that nothing derives. */
    measured: z.boolean(),
    note: z.string().min(1),
    /** The printed page the row rests on, or null where nothing was read. */
    page: z.number().int().positive().nullable(),
    source: Source,
  })
  .superRefine((r, ctx) => {
    // A printed page is what the primary tier means on this site. A secondary
    // row that attaches one is borrowing a filing's authority, and a row that
    // cites a page while calling itself secondary understates what it rests on.
    if ((r.page !== null) !== (r.source.verification === "PRIMARY")) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["page"],
        message: `${r.id}: a risk citing a printed page must be primary, and one without a page cannot be`,
      });
    }
    // The standard failure of a risk register is asserting a catastrophe with
    // nothing behind it. The worst cell is the one a reader looks at first, so
    // it is the one cell that has to be earned rather than graded.
    if (r.severity === "HIGH" && r.likelihood === "HIGH" && !r.measured) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["measured"],
        message: `${r.id}: the worst cell of the matrix cannot hold an unmeasured risk`,
      });
    }
  });

export const RiskRegister = z.object({
  /** That the position in the matrix is this project's own judgement, stated in
   *  the data rather than in prose, because prose can be edited away. */
  gradingNote: z.string().min(1),
  /** Why some pillars carry no row at all, and what document would fill them. */
  unevidencedNote: z.string().min(1),
  rows: z.array(RiskItem).min(4),
});

/**
 * A register on a page where no filing has been read.
 *
 * Netweb carries no primary figure anywhere, and a risk row is the easiest
 * place for one to appear, because a risk sounds like a fact and a printed page
 * attached to it would go unchallenged.
 *
 * Anant Raj used this until its annual report was read. Once a document is
 * open, a blanket ban stops protecting anything and starts hiding the rows that
 * earned a page, so that name moved to the base register and a per row check.
 */
export const SecondaryRiskRegister = RiskRegister.superRefine((reg, ctx) => {
  for (const r of reg.rows) {
    if (r.page !== null || r.source.verification === "PRIMARY") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["rows"],
        message: `${r.id}: no risk row on a page with no filing may cite one`,
      });
    }
  }
});

export type RiskItem = z.infer<typeof RiskItem>;
export type RiskRegister = z.infer<typeof RiskRegister>;
export type RiskPillar = z.infer<typeof RiskPillar>;

const SislPeriod = z.object({
  label: z.string().min(1),
  periodEnd: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** A stub quarter. Its ROCE is filed unannualised and must not be compared to a full year. */
  stub: z.boolean(),
  /**
   * Which entity the column reports.
   *
   * The statements are titled Restated Consolidated throughout, and the column
   * header printed above them says otherwise for the two older periods. Storing
   * it per period is what lets the guard below establish that the four columns
   * are still comparable rather than assuming it.
   */
  basis: z.enum(["CONSOLIDATED", "STANDALONE"]),
  /** The associate's share of profit in this period. Zero is the reason a
   *  standalone column can sit in the same series as a consolidated one. */
  associateShareOfProfit: z.number(),
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

/**
 * The restated consolidated cash flow, one row per filed period.
 *
 * Stored with the parts as well as the total, because the filing prints both
 * and storing only the total would throw away the check. Every amount is a
 * magnitude: tax paid and capital expenditure are outflows in the statement and
 * are held here as positive numbers, with the direction carried by the field
 * name rather than by a sign that a later edit could flip unnoticed.
 */
const SislCashFlow = z
  .object({
    label: z.string().min(1),
    cashFromOperations: z.number().positive(),
    taxPaid: z.number().positive(),
    cfo: z.number().positive(),
    capex: z.number().positive(),
    /** Depreciation and amortisation, from the same statement. It is the bridge
     *  from the published EBITDA to the EBIT that the return on capital formula
     *  needs, and the document prints it in only this one place. */
    depreciation: z.number().positive(),
    /** Land and lease acquisition, which the statement reports separately from
     *  the purchase of property, plant and equipment. Kept apart rather than
     *  folded into capex, because folding it in would quietly enlarge the gap
     *  the exhibit draws. */
    rightOfUse: z.number().positive(),
    /** Net cash used in investing, held with its filed sign so the accrual
     *  ratio does not depend on remembering which way it points. */
    cfi: z.number(),
  })
  .refine((r) => Math.abs(r.cashFromOperations - r.taxPaid - r.cfo) < 0.01, {
    message: "cash generated from operations less tax paid must equal net cash from operations",
    path: ["cfo"],
  });

/**
 * The restated consolidated balance sheet, reduced to what the return on
 * capital formula consumes.
 *
 * Borrowings and lease liabilities are held apart rather than summed, because
 * which of the two belongs inside "total borrowings" is the whole question. The
 * formula the document prints does not say, and only one of the two readings
 * reproduces the numbers the issuer publishes.
 */
const SislBalance = z.object({
  label: z.string().min(1),
  netWorth: z.number().positive(),
  /** The denominator of the accrual ratio, and the one line on this statement
   *  that nothing else here uses. */
  totalAssets: z.number().positive(),
  borrowings: z.number().positive(),
  leaseLiabilities: z.number().positive(),
  cash: z.number().positive(),
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
    /**
     * The legal section, read for what it says about the disclosure itself.
     *
     * The materiality threshold is never printed as a number. It is printed as
     * a formula over three figures that live in the financial statements, so it
     * is derived rather than stored, and the bases below name which figure each
     * test takes rather than carrying a value that could drift from it.
     */
    governance: z.object({
      materiality: z.object({
        adoptedOn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        documentDated: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        rule: z.literal("LOWER_OF"),
        tests: z
          .array(
            z.object({
              label: z.string().min(1),
              basis: z.enum(["NET_WORTH", "REVENUE", "AVG_ABS_PAT_3"]),
              rate: z.number().positive().max(1),
            }),
          )
          .min(2),
        carveOut: z.string().min(1),
        source: PagedSource,
      }),
      creditors: z.object({
        thresholdSharePct: z.number().positive(),
        thresholdMn: z.number().positive(),
        asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        materialCount: z.number().int().nonnegative(),
        materialMn: z.number().nonnegative(),
        otherCount: z.number().int().nonnegative(),
        otherMn: z.number().nonnegative(),
        source: PagedSource,
      }),
      /** Matters with a number attached. */
      quantified: z
        .array(z.object({ matter: z.string().min(1), amountMn: z.number().positive(), page: z.number().int().positive() }))
        .min(1),
      /** Matters the issuer says reached it other than by service, with its own
       *  words for how. The count is of proceedings, not of entries. */
      unserved: z
        .array(
          z.object({
            matter: z.string().min(1),
            count: z.number().int().positive(),
            foundVia: z.string().min(1),
            quote: z.string().min(1),
            page: z.number().int().positive(),
          }),
        )
        .min(1),
      unservedSource: PagedSource,
      /**
       * The associate, and what the issuer has lent, subscribed and guaranteed
       * to it.
       *
       * This block exists because of a guard three sections up. The four filed
       * columns survive as one series only because the associate contributed
       * nothing to profit in the standalone years, and that is asserted here as
       * an invariant. The related party note says what else the associate is:
       * the counterparty to a loan, a preference share subscription, a security
       * deposit and a corporate guarantee. Immaterial to the income statement
       * and a quarter of net worth is not a contradiction, but a reader told
       * only the first half would draw the wrong conclusion from it.
       */
      associate: z.object({
        name: z.string().min(1),
        ownershipPct: z.number().positive().max(100),
        exposures: z
          .array(
            z.object({
              label: z.string().min(1),
              asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
              loanReceivableMn: z.number().nonnegative(),
              preferenceSharesMn: z.number().nonnegative(),
              securityDepositMn: z.number().nonnegative(),
              /** Off balance sheet, and the line whose direction the document
               *  contradicts itself about. */
              guaranteeGivenMn: z.number().nonnegative(),
              page: z.number().int().positive(),
            }),
          )
          .min(2),
        /** The column heading over the guarantee row, and the footnote hanging
         *  off the same row. They point opposite ways: one has the associate
         *  guaranteeing the issuer, the other has the issuer guaranteeing the
         *  associate's term loan. Both are stored because the page shows both
         *  rather than picking the reading that suits the argument. */
        headingWords: z.string().min(1),
        footnoteQuote: z.string().min(1),
        source: PagedSource,
      }),
      /**
       * Key management remuneration, and what the disclosed line leaves out.
       *
       * In the last full year the related party note's key management column
       * covers one officer, and the note says in a footnote that the others are
       * inside an expense transfer from the parent. The amount cross charged is
       * printed, so the shortfall is a figure rather than an inference. In the
       * stub quarter the same line covers all three officers, so the disclosure
       * changes meaning between two adjacent columns of one table.
       */
      keyManagement: z.object({
        label: z.string().min(1),
        /** The figure the key management column actually shows. */
        disclosedMn: z.number().nonnegative(),
        /** How many officers that column covers in this period. */
        officersCovered: z.number().int().positive(),
        /** How many the company names as key management in the same note. */
        officersNamed: z.number().int().positive(),
        /** Remuneration the footnote says is inside the expense transfer
         *  instead. A floor rather than a total: the note says the transfer
         *  includes this much, not that this is all of it. */
        crossChargedMn: z.number().nonnegative(),
        /** The transfer it sits inside, for scale. */
        expenseTransferMn: z.number().positive(),
        coverageQuote: z.string().min(1),
        crossChargeQuote: z.string().min(1),
        source: PagedSource,
      }),
    }),
    basisSource: PagedSource,
    cashFlow: z.array(SislCashFlow).min(3),
    cashFlowSource: PagedSource,
    balanceSheet: z.array(SislBalance).min(3),
    balanceSheetSource: PagedSource,
    /** Where the document prints the formula, which is inside the commissioned
     *  industry report rather than beside the figures the issuer claims. */
    roceFormulaSource: PagedSource,
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
    /**
     * Revenue from the largest customers, as the audited note states it.
     *
     * The client table on printed 36 and the long contract share on printed 46
     * already describe these same counterparties, and a guard below asserts
     * that those two agree. Both are risk factors: written by the issuer, for
     * the issuer's document, about itself. This is the third statement of the
     * same fact and the only one inside the examined financial information.
     */
    majorCustomer: z
      .array(
        z.object({
          label: z.string().min(1),
          amountMn: z.number().positive(),
          /** How many customers the note aggregates. Stored rather than assumed
           *  at three, because a note that changed its own count in a later
           *  period would otherwise be compared against the wrong slice of the
           *  client table without anything noticing. */
          customers: z.number().int().positive(),
        }),
      )
      .min(3),
    majorCustomerSource: PagedSource,
    capacityDefinitions: z.object({
      engineeredToSupport: z.object({ quote: z.string().min(1), page: z.number().int().positive() }),
      availableToSell: z.object({ quote: z.string().min(1), page: z.number().int().positive() }),
    }),
    risks: RiskRegister,
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
    // The third leg, and the only audited one.
    //
    // The identity above joins two risk factors, which is weaker evidence than
    // it looks: both are written by the issuer, for the issuer's document,
    // about itself. Note 33 to the restated financial information states the
    // same revenue as an amount, inside the accounts the auditor examined, and
    // it lands on the same figure to the paisa in every filed period.
    //
    // Only this leg is asserted. Note 33 against the long contract share would
    // be a second test of one fact, since that link already follows through the
    // guard above.
    for (const m of d.majorCustomer) {
      const c = d.clients.find((x) => x.label === m.label);
      if (!c) continue;
      const top = c.rows
        .filter((r) => r.rank <= m.customers)
        .reduce((t, r) => t + r.amount, 0);
      if (Math.abs(top - m.amountMn) > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["majorCustomer"],
          message: `${m.label}: the audited note reports ${m.amountMn} from ${m.customers} customers against ${top.toFixed(2)} in the client table. The risk factor and the examined accounts no longer agree.`,
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
    // The published return on capital must reconcile to the balance sheet.
    //
    // The document prints the formula in one place and the answers in another,
    // and never joins them. Rebuilt from its own numbers, three of the four
    // published figures land on the second decimal. The fourth cannot be
    // rebuilt at all, because an average needs a prior year the balance sheet
    // does not carry. This guard holds the three that can be checked; if the
    // arithmetic drifts, the exhibit is claiming a reconciliation that has
    // stopped happening.
    const bs = new Map(d.balanceSheet.map((b) => [b.label, b]));
    // Assets exceed equity in every filed period, which is an identity rather
    // than a finding. It is asserted because total assets arrived as one column
    // of a four column statement and a column read one place across would
    // change the accrual ratio without looking wrong.
    for (const b of d.balanceSheet) {
      if (b.totalAssets <= b.netWorth) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["balanceSheet"],
          message: `${b.label}: total assets do not exceed net worth, so a column has been read across`,
        });
      }
    }
    // Every filed period spends more on investing than it recovers. That is the
    // estate being built, and it is what makes the accrual ratio move with the
    // build rather than with earnings quality on this filer. If a period ever
    // turns positive the caveat published beside the ratio stops applying.
    for (const c of d.cashFlow) {
      if (c.cfi >= 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["cashFlow"],
          message: `${c.label}: investing cash is no longer an outflow, so the accrual ratio caveat needs rewriting`,
        });
      }
    }
    // The four columns a reader takes as one series are not one reporting
    // entity. Two are consolidated and two are standalone, and the document
    // titles all four Restated Consolidated. What makes the series comparable
    // anyway is that the associate contributed nothing in the standalone years,
    // so standalone and consolidated would have been the same statement. That
    // is the condition, so it is the thing asserted: a standalone column
    // carrying an associate share stops the series being like for like and
    // every exhibit spanning all four periods would need rewriting.
    for (const p of d.periods) {
      if (p.basis === "STANDALONE" && p.associateShareOfProfit !== 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["periods"],
          message: `${p.label}: a standalone column carries an associate share, so the four period series is no longer like for like`,
        });
      }
    }
    // The basis changes once, forward in time. Consolidation begins and does not
    // stop, so the newest column is the consolidated one.
    if (d.periods[d.periods.length - 1].basis !== "CONSOLIDATED") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["periods"],
        message: `the most recent period is no longer the consolidated one`,
      });
    }
    // The materiality policy was adopted before the document that publishes it,
    // which is the ordinary order and is asserted so that a later reading cannot
    // quietly invert it while the page describes a sequence.
    const gov = d.governance;
    if (!(gov.materiality.adoptedOn <= gov.materiality.documentDated)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["governance"],
        message: `the materiality policy is dated after the document that publishes it`,
      });
    }
    // The finding the exhibit rests on. Of the three tests the policy takes the
    // lower of, the profit one binds, and it binds by a wide margin because
    // profit is small against both net worth and turnover. If earnings ever grow
    // into either of the other tests the disclosure bar jumps several times over
    // without the policy changing a word, and the sentence saying so is gone.
    const fullPeriods = d.periods.filter((p) => !p.stub);
    const latest = fullPeriods[fullPeriods.length - 1];
    const sheet = d.balanceSheet.find((b) => b.label === latest.label);
    if (sheet) {
      const avgAbsPat =
        fullPeriods.slice(-3).reduce((t, p) => t + Math.abs(p.pat), 0) /
        Math.min(3, fullPeriods.length);
      const byBasis = { NET_WORTH: sheet.netWorth, REVENUE: latest.revenue, AVG_ABS_PAT_3: avgAbsPat };
      const values = gov.materiality.tests.map((t) => t.rate * byBasis[t.basis]);
      const binding = gov.materiality.tests[values.indexOf(Math.min(...values))];
      if (binding.basis !== "AVG_ABS_PAT_3") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["governance", "materiality"],
          message: `the disclosure threshold is no longer set by the profit test, so the exhibit's claim about it has changed`,
        });
      }
    }
    const dep = new Map(d.cashFlow.map((c) => [c.label, c.depreciation]));
    const employed = (b: z.infer<typeof SislBalance>) =>
      b.netWorth + b.borrowings + b.leaseLiabilities - b.cash;
    d.periods.forEach((p, i) => {
      const here = bs.get(p.label);
      const prior = i > 0 ? bs.get(d.periods[i - 1].label) : undefined;
      const da = dep.get(p.label);
      if (!here || !prior || da === undefined) return;
      const ebit = p.ebitda - da;
      const computed = (ebit / ((employed(prior) + employed(here)) / 2)) * 100;
      if (Math.abs(computed - p.roce) > 0.05) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["periods", i, "roce"],
          message: `${p.label}: the published return on capital no longer reconciles to the balance sheet, ${computed.toFixed(2)} against ${p.roce}`,
        });
      }
    });
    // The estate was built with money the business did not generate, and that
    // is the claim the cash flow exhibit makes out loud. Across every filed
    // period taken together, spending on property, plant and equipment exceeds
    // the cash operations produced. If that ever inverts, the exhibit's
    // headline has stopped being true and the build should say so.
    const totalCapex = d.cashFlow.reduce((t, r) => t + r.capex, 0);
    const totalCfo = d.cashFlow.reduce((t, r) => t + r.cfo, 0);
    if (totalCapex <= totalCfo) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["cashFlow"],
        message: `capital expenditure of ${totalCapex.toFixed(2)} no longer exceeds the ${totalCfo.toFixed(2)} of cash operations produced`,
      });
    }
    // A risk row may only cite a printed page this file already reads.
    //
    // The register is authored from what was read, and the instruction standing
    // over this block is that the prospectus is not reopened. A page number
    // appearing here and nowhere else in the file would mean a figure arrived
    // without the source block that lets a reader check it.
    const read = new Set([
      d.periodsSource.page,
      d.costStackSource.page,
      d.cashFlowSource.page,
      d.contractsSource.page,
      d.sitesSource.page,
      d.peersSource.page,
      d.clientsSource.page,
      d.capacityDefinitions.engineeredToSupport.page,
      d.capacityDefinitions.availableToSell.page,
      d.governance.materiality.source.page,
      d.governance.creditors.source.page,
      d.governance.unservedSource.page,
      ...d.governance.unserved.map((u) => u.page),
      ...d.governance.quantified.map((q) => q.page),
      d.governance.associate.source.page,
      ...d.governance.associate.exposures.map((e) => e.page),
      d.governance.keyManagement.source.page,
      d.majorCustomerSource.page,
    ]);

    // The key management line must cover fewer officers than the note names, or
    // the finding it carries has gone away.
    //
    // This is the whole point of storing both counts. A disclosed remuneration
    // figure covering every officer named is an ordinary disclosure and the page
    // should stop calling it a shortfall. A guard on the amounts would not catch
    // that, since the amounts would still be there.
    // Net debt must equal borrowings plus lease liabilities less cash.
    //
    // This is the finding, asserted rather than described. The formula the
    // document prints for capital employed never says whether a lease is a
    // borrowing, and the return on capital rebuild only lands on the published
    // figures if it is. That is an inference from a result. This identity is the
    // direct statement of the same convention, from a line printed beside the
    // one that needed it, and it holds in every filed period. If it stops
    // holding, the page's claim that the issuer treats leases as debt has
    // stopped being true and the build should fail instead of the sentence
    // going stale.
    for (const p of d.periods) {
      const b = d.balanceSheet.find((x) => x.label === p.label);
      if (!b) continue;
      const rebuilt = b.borrowings + b.leaseLiabilities - b.cash;
      if (Math.abs(rebuilt - p.netDebt) > 0.01) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["periods"],
          message: `${p.label}: net debt of ${p.netDebt} is not borrowings plus lease liabilities less cash, which give ${rebuilt.toFixed(2)}. The issuer may have stopped counting leases as debt.`,
        });
      }
    }

    const km = d.governance.keyManagement;
    if (km.officersCovered >= km.officersNamed) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["governance", "keyManagement"],
        message: `the key management line now covers ${km.officersCovered} of ${km.officersNamed} officers named, so it no longer understates anything`,
      });
    }

    // Every period the associate exposure is stated for must be a period this
    // file already carries a balance sheet for.
    //
    // The exhibit divides the exposure by net worth at the same date, and a
    // period with no balance sheet would either throw or, worse, silently pick
    // up a neighbouring year's net worth and print a plausible percentage
    // against the wrong denominator.
    for (const e of d.governance.associate.exposures) {
      if (!d.balanceSheet.some((b) => b.label === e.label)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["governance", "associate"],
          message: `associate exposure is stated for ${e.label}, which has no balance sheet in this file`,
        });
      }
    }
    for (const r of d.risks.rows) {
      if (r.page !== null && !read.has(r.page)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["risks"],
          message: `${r.id}: cites printed page ${r.page}, which this file does not cite anywhere else`,
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
          /**
           * Set where the operator's own filing has been read and states no
           * power capacity at all, so the megawatt columns beside it are
           * carried from research and cannot be upgraded by reading harder.
           *
           * Naming that is the point. A figure nobody has checked and a figure
           * the company does not publish in this unit are different problems,
           * and only the first is fixed by opening the document. The string is
           * the reason, so a page states it rather than showing a blank.
           */
          capacityNotFiled: z.string().min(1).optional(),
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
      // A row whose filing states no capacity cannot claim a primary source for
      // the capacity beside it. The filing has been read; that is what makes the
      // claim checkable, and what it says is that the number is not in there.
      if (o.capacityNotFiled && o.source.verification === "PRIMARY") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operators"],
          message: `${o.ticker}: its filing states no power capacity, so the megawatt columns cannot claim a primary source`,
        });
      }
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
      if (o.source.verification === "PRIMARY" && !/prospectus|20-F|filing|annual report/i.test(o.source.label)) {
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
    /**
     * The audited consolidated statements, read from the same annual report as
     * the capacity ladder above.
     *
     * Held in the unit the statements print, lakhs of rupees, and converted
     * nowhere. The block exists for its last field. The capacity this company
     * is priced on belongs to a subsidiary whose own numbers are printed twice
     * in this report and appear nowhere in the group income statement, because
     * the group reports one segment and that segment is real estate.
     */
    financials: z.object({
      unit: z.literal("INR lakh"),
      fiscalYear: z.string().min(1),
      priorFiscalYear: z.string().min(1),
      profitAndLoss: z.object({
        revenue: z.number().positive(),
        revenuePrior: z.number().positive(),
        otherIncome: z.number(),
        totalIncome: z.number().positive(),
        costOfSalesAndConstruction: z.number().positive(),
        employeeBenefits: z.number().positive(),
        financeCosts: z.number().positive(),
        depreciation: z.number().positive(),
        otherExpenses: z.number().positive(),
        totalExpenses: z.number().positive(),
        profitBeforeTax: z.number(),
        profitBeforeTaxPrior: z.number(),
        profitAfterTax: z.number(),
        profitAfterTaxPrior: z.number(),
        source: PagedSource,
      }),
      balanceSheet: z.object({
        totalAssets: z.number().positive(),
        totalEquity: z.number().positive(),
        investmentProperty: z.number().nonnegative(),
        propertyPlantAndEquipment: z.number().nonnegative(),
        capitalWorkInProgress: z.number().nonnegative(),
        inventories: z.number().nonnegative(),
        borrowingsNonCurrent: z.number().nonnegative(),
        borrowingsCurrent: z.number().nonnegative(),
        leaseLiabilityNonCurrent: z.number().nonnegative(),
        leaseLiabilityCurrent: z.number().nonnegative(),
        cashAndEquivalents: z.number().nonnegative(),
        source: PagedSource,
      }),
      cashFlow: z.object({
        operatingProfitBeforeWorkingCapital: z.number(),
        cashGeneratedFromOperations: z.number(),
        incomeTax: z.number(),
        netCashFromOperations: z.number(),
        netCashFromOperationsPrior: z.number(),
        /** Presented inside operating activities as a working capital line,
         *  while repayment of borrowings appears again under financing. Stored
         *  because the classification is the observation. */
        currentBorrowingsInsideOperating: z.number(),
        currentBorrowingsInsideOperatingPrior: z.number(),
        /** The label the statement prints beside it, kept so an exhibit can
         *  quote the report rather than paraphrase what it did. */
        currentBorrowingsInsideOperatingPrintedAs: z.string().min(1),
        /** The same category of item again, in the finance section, on its own
         *  printed page. Stored so the double presentation can be asserted
         *  instead of described, which is what the cash conversion exhibit
         *  rests on. Held as a negative, matching the bracket convention the
         *  statement prints and the operating side line above. */
        financingRepaymentOfBorrowings: z.object({
          amount: z.number(),
          amountPrior: z.number(),
          printedAs: z.string().min(1),
          source: PagedSource,
        }),
        acquisitionOfPropertyPlantAndEquipment: z.number().nonnegative(),
        acquisitionOfInvestmentProperty: z.number().nonnegative(),
        additionsToCapitalWorkInProgress: z.number().nonnegative(),
        additionsToRightOfUse: z.number().nonnegative(),
        /** The investing section's own total, signed as filed. */
        netCashFromInvesting: z.number(),
        netCashFromInvestingPrior: z.number(),
        source: PagedSource,
      }),
      segment: z.object({
        reportableSegments: z.number().int().positive(),
        description: z.string().min(1),
        quote: z.string().min(1),
        customerConcentrationQuote: z.string().min(1),
        source: PagedSource,
      }),
      ratios: z.object({
        returnOnEquityPct: z.number(),
        returnOnEquityPctPrior: z.number(),
        /** Printed as a decimal in the source, not as a percentage. */
        returnOnCapitalEmployed: z.number(),
        returnOnCapitalEmployedPrior: z.number(),
        debtToEquity: z.number(),
        debtToEquityPrior: z.number(),
        roceFormula: z.string().min(1),
        source: PagedSource,
      }),
      dataCentreArm: z.object({
        entity: z.string().min(1),
        holdingPct: z.number().positive().max(100),
        shareCapital: z.number(),
        reservesAndSurplus: z.number(),
        totalAssets: z.number().positive(),
        totalLiabilities: z.number().positive(),
        turnover: z.number().nonnegative(),
        profitBeforeTax: z.number(),
        profitAfterTax: z.number(),
        source: PagedSource,
        /** The same subsidiary again, as the consolidated entity table prints
         *  it. Both are stored so the identity can be asserted. */
        groupShare: z.object({
          netAssetsPct: z.number(),
          netAssetsAmount: z.number(),
          profitPct: z.number(),
          profitAmount: z.number(),
          source: PagedSource,
        }),
      }),
    }),
    notRead: z.array(z.string().min(1)).min(1),
    /**
     * A register carrying two tiers of evidence at once.
     *
     * Not the secondary register below: the annual report has been read, so a
     * row resting on it may cite its printed page. The rule that stops an
     * overclaim moves from the register to the row, and is asserted in the
     * refinement at the foot of this schema.
     */
    risks: RiskRegister,
    /**
     * The annual report, read in two passes.
     *
     * Kept beside the research note ladder rather than replacing it, because the
     * two disagree and the disagreement is the point. The note carries a number
     * the company published; the report carries the qualifier the company
     * published next to it.
     */
    annualReport: z.object({
      fiscalYear: z.string().min(1),
      manifest: z.object({
        url: z.string().url(),
        hostedBy: z.string().min(1),
        sha256: z.string().regex(/^[0-9a-f]{64}$/),
        bytes: z.number().int().positive(),
        pdfPages: z.number().int().positive(),
        pagination: Pagination,
      }),
      auditOpinion: z.object({
        type: z.enum(["UNMODIFIED", "QUALIFIED", "ADVERSE", "DISCLAIMER"]),
        auditor: z.string().min(1),
        scope: z.string().min(1),
        page: z.number().int().positive(),
      }),
      rungs: z
        .array(
          z.object({
            rung: z.string().min(1),
            mw: z.number().positive(),
            kind: z.enum(["AMBITION", "CLAIMED", "DELIVERED"]),
            definition: z.string().min(1),
            page: z.number().int().positive(),
          }),
        )
        .min(3),
      composition: z
        .array(
          z.object({
            part: z.string().min(1),
            mw: z.number().positive(),
            operational: z.boolean(),
            note: z.string().min(1),
          }),
        )
        .min(2),
      compositionSource: PagedSource,
    }),
    /**
     * Governance, from the notes rather than from a rating.
     *
     * Two things this report discloses that nothing else on this page reaches.
     * Related party lending, which stepped up sharply in one year, and a list
     * of counterparties struck off the register that the company still carries
     * balances with. Amounts are in the unit `financials.unit` declares.
     */
    governance: z.object({
      relatedParty: z.object({
        lending: z
          .array(
            z.object({
              counterparty: z.string().min(1),
              /** The balance outstanding at each year end. */
              outstandingLakh: z.number().nonnegative(),
              outstandingPriorLakh: z.number().nonnegative(),
              /** What the transactions table says was granted during each year.
               *  Held apart from the balance because on one of these rows the
               *  two do not roll forward into each other and the report prints
               *  no repayment to close the gap. */
              grantedLakh: z.number().nonnegative(),
              grantedPriorLakh: z.number().nonnegative(),
            }),
          )
          .min(2),
        /** The company's own characterisation, quoted rather than paraphrased,
         *  because it is an assertion rather than a figure and the page should
         *  show it as one. */
        armsLengthQuote: z.string().min(1),
        source: PagedSource,
      }),
      /**
       * Note 45, other statutory information: counterparties struck off under
       * Section 248 of the Companies Act that the company still shows balances
       * with. The relationship column is the report's own, and it matters: the
       * largest balance on the list is not with a related party.
       */
      struckOff: z.object({
        rows: z
          .array(
            z.object({
              name: z.string().min(1),
              kind: z.enum(["RECEIVABLE", "PAYABLE"]),
              relationship: z.enum(["RELATED_PARTY", "OTHERS"]),
              amountLakh: z.number().nonnegative(),
              amountPriorLakh: z.number().nonnegative(),
            }),
          )
          .min(2),
        source: PagedSource,
      }),
    }),
  })
  .superRefine((d, ctx) => {
    // The headline capacity figure must equal its own stated parts.
    //
    // This is the finding. The report prints a single number in its highlights
    // and, elsewhere, the three pieces it is made of, only one of which is
    // operational. If those stop adding up, either a part was mistyped or the
    // company has restated the headline, and both need looking at rather than
    // rendering.
    const claimed = d.annualReport.rungs.find((r) => r.kind === "CLAIMED");
    const parts = d.annualReport.composition.reduce((t, c) => t + c.mw, 0);
    if (claimed && Math.abs(parts - claimed.mw) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["annualReport", "composition"],
        message: `the headline capacity figure must equal the parts the report says it is made of, got ${parts} against ${claimed.mw}`,
      });
    }
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
    // The page's claim about the struck off list, asserted rather than written.
    //
    // The list sits inside the related party section's neighbourhood and four of
    // its rows are related parties, so the obvious reading is that this is a
    // related party problem. It is not: the largest balance on it, by two orders
    // of magnitude, is with a counterparty the report itself classifies as
    // Others. The page says so, and if a later edit moved that row the sentence
    // would be wrong rather than merely stale.
    const struck = d.governance.struckOff.rows;
    const largest = struck.reduce((a, b) => (b.amountLakh > a.amountLakh ? b : a));
    if (largest.relationship !== "OTHERS") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["governance", "struckOff"],
        message: `the largest struck off balance is now with a ${largest.relationship}, and the page says it is not`,
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

    const fin = d.financials;
    const pl = fin.profitAndLoss;
    // The income statement must add up to the profit printed under it. Every
    // line is typed from one page, and a mistyped expense would change the
    // margin the page quotes while changing nothing a reader could see.
    if (Math.abs(pl.totalIncome - pl.totalExpenses - pl.profitBeforeTax) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials", "profitAndLoss"],
        message: `the consolidated income statement does not reconcile to its own profit before tax`,
      });
    }
    // Cash generated from operations, less the tax paid against it, is the
    // filed operating figure. All three are printed and all three are stored.
    const cf = fin.cashFlow;
    if (Math.abs(cf.cashGeneratedFromOperations + cf.incomeTax - cf.netCashFromOperations) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials", "cashFlow"],
        message: `cash generated from operations less income tax must equal the filed operating cash flow`,
      });
    }
    // Borrowings reach the reader twice, from two sections, on two pages. The
    // movement sits among the working capital adjustments while the repayment
    // sits under finance activities, and both filed years do it. A page that
    // says so has to be held to the document saying so.
    const borrowings = cf.financingRepaymentOfBorrowings;
    if (
      cf.currentBorrowingsInsideOperating >= 0 ||
      cf.currentBorrowingsInsideOperatingPrior >= 0 ||
      borrowings.amount >= 0 ||
      borrowings.amountPrior >= 0 ||
      borrowings.source.page === cf.source.page
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials", "cashFlow"],
        message: `borrowings must be an outflow in both the operating and the finance sections, each on its own printed page`,
      });
    }
    // The finding itself. Capital expenditure is the four lines the investing
    // section prints, and whether the year paid for its own building turns on
    // where one working capital line sits. If a restatement ever lands both
    // readings on the same side of one, the sentence the exhibit is built
    // around is gone and the build stops rather than the sentence going
    // quietly wrong.
    const capexLines =
      cf.acquisitionOfPropertyPlantAndEquipment +
      cf.acquisitionOfInvestmentProperty +
      cf.additionsToCapitalWorkInProgress +
      cf.additionsToRightOfUse;
    const coverFiled = capexLines / cf.netCashFromOperations;
    const coverRestated = capexLines / (cf.netCashFromOperations - cf.currentBorrowingsInsideOperating);
    if (!(coverFiled > 1 && coverRestated < 1)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials", "cashFlow"],
        message: `the capex cover must change side when that line leaves operating activities, got ${coverFiled.toFixed(2)} as filed against ${coverRestated.toFixed(2)} without it`,
      });
    }
    // The subsidiary is printed twice in the same report, in the statement of
    // subsidiaries and in the consolidated entity table. Asserting the identity
    // is what lets the exhibit call the figure the report's own rather than a
    // subtraction performed here.
    const arm = fin.dataCentreArm;
    const armNet = arm.shareCapital + arm.reservesAndSurplus;
    if (
      Math.abs(armNet - (arm.totalAssets - arm.totalLiabilities)) > 0.01 ||
      Math.abs(armNet - arm.groupShare.netAssetsAmount) > 0.01
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials", "dataCentreArm"],
        message: `the data centre subsidiary net assets do not agree across the two pages that print them`,
      });
    }
    if (Math.abs(arm.profitAfterTax - arm.groupShare.profitAmount) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials", "dataCentreArm"],
        message: `the data centre subsidiary result does not agree across the two pages that print it`,
      });
    }
    // The finding. The arm this company is priced on is a rounding error in the
    // revenue the group actually reports.
    if (arm.turnover / pl.revenue > 0.1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials", "dataCentreArm"],
        message: `the data centre arm is no longer a small share of group revenue`,
      });
    }
    // And the second half of it. A profitable arm would be a different page.
    if (arm.profitAfterTax >= 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials", "dataCentreArm"],
        message: `the data centre arm no longer loses money`,
      });
    }
    // One reportable segment, and it is real estate. If the group ever reports
    // the data centre separately, the central claim on this page changes and
    // the exhibit has to be rebuilt rather than quietly left standing.
    if (fin.segment.reportableSegments !== 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials", "segment"],
        message: `the group no longer reports a single segment`,
      });
    }
    // The pillar's headline, and the reason it is worth publishing. Operating
    // cash is a fraction of the profit reported beside it, and it stays a
    // fraction on the other reading of the borrowings classification too. A
    // finding that survives both readings of a disputed presentation does not
    // depend on picking the right one, and if either ever clears the threshold
    // the sentence resting on it is gone.
    const conversionFiled = cf.netCashFromOperations / pl.profitAfterTax;
    const conversionRestated =
      (cf.netCashFromOperations - cf.currentBorrowingsInsideOperating) / pl.profitAfterTax;
    if (!(conversionFiled < 0.5 && conversionRestated < 0.5)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["financials"],
        message: `operating cash must stay under half the profit reported beside it on both readings, got ${conversionFiled.toFixed(2)} as filed and ${conversionRestated.toFixed(2)} without the borrowings line`,
      });
    }
    // A risk row may cite only a page this file already records. A page number
    // appearing on a risk and nowhere else would mean a magnitude arrived
    // without the source block that lets a reader check it, which is the exact
    // failure the register exists to avoid. Sify has the same rule as a test;
    // here it is a build guard, because this register mixes a research note
    // ladder with rows that rest on an audited statement.
    const recordedPages = new Set<number>([
      d.annualReport.auditOpinion.page,
      d.annualReport.compositionSource.page,
      ...d.annualReport.rungs.map((r) => r.page),
      pl.source.page,
      fin.balanceSheet.source.page,
      cf.source.page,
      cf.financingRepaymentOfBorrowings.source.page,
      fin.segment.source.page,
      fin.ratios.source.page,
      arm.source.page,
      arm.groupShare.source.page,
    ]);
    for (const row of d.risks.rows) {
      if (row.page !== null && !recordedPages.has(row.page)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["risks", "rows"],
          message: `${row.id}: a risk row cites a printed page this file does not record`,
        });
      }
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
    risks: SecondaryRiskRegister,
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
export type E2E = z.infer<typeof E2E>;

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
/**
 * The peer benchmarking table, the only primary figures on the sector page.
 *
 * Values are nullable because the source prints NA for operators that had not
 * reported the year, and an absence drawn as a zero would invent a collapse.
 * Return on capital may be negative; one of the three global names is.
 */
const OperatorReturn = z.object({
  name: z.string().min(1),
  market: z.enum(["DOMESTIC", "GLOBAL"]),
  self: z.boolean(),
  roce: z.array(z.number().nullable()),
  depreciationRate: z.array(z.number().nullable()),
});

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
    indiaAI: z.object({
      outlayCr: z.number().positive(),
      gpusInstalled: z.number().int().positive(),
      installedQualifier: z.string().min(1),
      installedAsOf: z.string().min(1),
      providers: z
        .array(
          z.object({
            name: z.string().min(1),
            /** Set only where the provider is a covered name on this site. */
            ticker: z.string().min(1).nullable(),
            status: z.enum(["MOVED", "LAGGED", "NOT_STATED"]),
            /** GPUs offered to the scheme, where a figure was published. */
            offeredGpus: z.number().int().positive().nullable(),
            note: z.string().min(1),
          }),
        )
        .min(5),
      source: Source,
    }),
    hyperscalers: z.object({
      cumulative: z.object({
        bnUsd: z.number().positive(),
        fromYear: z.number().int().positive(),
        toLabel: z.string().min(1),
        note: z.string().min(1),
        source: Source,
      }),
      pledges: z
        .array(
          z.object({
            firm: z.string().min(1),
            bnUsd: z.number().positive(),
            horizon: z.string().min(1),
            /** Set only where the announcement named a capacity. Two of the
             *  three did not, and a null is the fact rather than a gap. */
            announcedSiteMW: z.number().positive().nullable(),
            note: z.string().min(1),
          }),
        )
        .min(3),
      source: Source,
    }),
    power: z.object({
      currentGw: z.number().positive(),
      currentNote: z.string().min(1),
      targetGw: z.number().positive(),
      /** The fiscal label as the estimator published it, for display. */
      targetLabel: z.string().min(1),
      /** The same horizon as an integer, because a fiscal label cannot be
       *  subtracted from a calendar year. */
      targetYear: z.number().int().positive(),
      estimator: z.string().min(1),
      source: Source,
    }),
    unitEconomics: z.object({
      capexCrPerMW: z.object({ low: z.number().positive(), high: z.number().positive() }),
      capexSourceLabel: z.string().min(1),
      ebitdaMarginPct: z.object({
        low: z.number().positive(),
        high: z.number().positive(),
        stabilising: z.number().positive(),
      }),
      powerShareOfOpexPct: z.number().positive().max(100),
      source: Source,
    }),
    operatorReturns: z.object({
      fiscalYears: z.array(z.string().min(1)).min(2),
      claim: z.object({ quote: z.string().min(1), page: z.number().int().positive() }),
      issuerReason: z.object({ quote: z.string().min(1), page: z.number().int().positive() }),
      rows: z.array(OperatorReturn).min(4),
      source: PagedSource,
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
    // A published offer must sit inside the national installed total.
    //
    // The exhibit says one provider offered more than half of every processor
    // the scheme has installed. Past a hundred per cent that sentence stops
    // being a comparison and starts being a sign that two different quantities
    // have been put in the same ratio.
    const ai = d.indiaAI;
    for (const p of ai.providers) {
      if (p.offeredGpus !== null && p.offeredGpus > ai.gpusInstalled) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["indiaAI", "providers"],
          message: `${p.name} offered more processors than the scheme has installed nationally`,
        });
      }
    }
    // The execution ledger needs both sides to exist. A scheme where nobody is
    // reported as behind, or nobody as ahead, carries no separation between
    // announcement and delivery and the exhibit has nothing to show.
    const moved = ai.providers.filter((p) => p.status === "MOVED").length;
    const lagged = ai.providers.filter((p) => p.status === "LAGGED").length;
    if (moved === 0 || lagged === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["indiaAI", "providers"],
        message: `the deployment ledger needs a provider on each side, got ${moved} ahead and ${lagged} behind`,
      });
    }
    // Every operator must carry a reading for every fiscal year the table
    // covers, present or explicitly absent. A short row would silently shift
    // every value after it into the wrong year.
    const r = d.operatorReturns;
    for (const row of r.rows) {
      if (row.roce.length !== r.fiscalYears.length ||
          row.depreciationRate.length !== r.fiscalYears.length) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["operatorReturns", "rows"],
          message: `${row.name} does not carry one reading per fiscal year the peer table covers`,
        });
      }
    }
    // The finding: every Indian operator's return on capital fell in the second
    // year of the table. If one of them rises, the sector page is claiming a
    // decline that its own primary source no longer shows.
    const domestic = r.rows.filter((x) => x.market === "DOMESTIC");
    const rose = domestic.filter(
      (x) => x.roce[0] !== null && x.roce[1] !== null && x.roce[1] >= x.roce[0],
    );
    if (rose.length > 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["operatorReturns", "rows"],
        message: `every domestic operator's return on capital fell across the first two years, but ${rose.map((x) => x.name).join(", ")} did not`,
      });
    }

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

    const h = d.hyperscalers;
    const pledged = h.pledges.reduce((t, p) => t + p.bnUsd, 0);
    // The exhibit's headline is that three firms have pledged a multiple of the
    // annual size of the market they are pledging into. Below that line it is
    // an ordinary capital cycle and the exhibit has nothing to say.
    if (pledged <= d.market.currentBnUsd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hyperscalers", "pledges"],
        message: `three firms pledging ${pledged} no longer exceed the annual market they are pledged into`,
      });
    }
    // Three firms cannot have pledged more than every investor has committed.
    // Past that point the two figures are counting different things and the
    // exhibit is drawing one inside the other for no reason.
    if (pledged > h.cumulative.bnUsd) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hyperscalers"],
        message: `three firms have pledged more than the sector's whole recorded commitment`,
      });
    }
    // A pledge is an announcement. This is the same rule the forecasts carry,
    // and it exists because a widely quoted figure is still not a filed one.
    if (h.source.verification === "PRIMARY" || h.cumulative.source.verification === "PRIMARY") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hyperscalers"],
        message: `a pledge is an announcement and cannot claim PRIMARY`,
      });
    }
    // The sentence the capacity half of the exhibit exists to carry: one
    // announced site is most of what the entire country currently operates.
    const namedSite = Math.max(0, ...h.pledges.map((p) => p.announcedSiteMW ?? 0));
    if (namedSite <= d.capacity.current.mw / 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["hyperscalers", "pledges"],
        message: `the largest single announced site is under half of national live capacity`,
      });
    }

    // A demand curve needs somewhere to go. If the estimate stops sitting above
    // what data centres already draw, the grid is not the constraint this page
    // says it is.
    const pw = d.power;
    if (pw.targetGw <= pw.currentGw) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["power"],
        message: `the power demand estimate does not rise above what data centres draw today`,
      });
    }

    const ue = d.unitEconomics;
    // The capital requirement is drawn as a band from the low cost to the high
    // cost. Inverted, it draws backwards and reads as a saving.
    if (ue.capexCrPerMW.high <= ue.capexCrPerMW.low) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unitEconomics", "capexCrPerMW"],
        message: `the capex per megawatt band inverts`,
      });
    }
    // A stabilising figure quoted outside its own published range means two
    // different measurements have been carried in as one.
    if (
      ue.ebitdaMarginPct.stabilising < ue.ebitdaMarginPct.low ||
      ue.ebitdaMarginPct.stabilising > ue.ebitdaMarginPct.high
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unitEconomics", "ebitdaMarginPct"],
        message: `the stabilising margin sits outside the published margin range`,
      });
    }
    // The page argues the grid is the binding constraint partly because power
    // is the largest thing an operator buys. Under half it is one cost among
    // several and the argument is weaker than the page states it.
    if (ue.powerShareOfOpexPct <= 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["unitEconomics"],
        message: `power is no longer the majority of operating cost`,
      });
    }
  });

export type Macro = z.infer<typeof Macro>;

/**
 * Techno Electric, the third operator read from a filed document.
 *
 * It is here because the coverage universe carried this name at 36 megawatts
 * live, from a research note, and the company's own annual report does not
 * support that figure. One campus is described as commissioned and live and it
 * is 24 megawatts, and the same bullet says a second phase of it is still being
 * planned, which is the same trap the other two names set in their own words.
 *
 * The report is laid out as two page spreads, so a printed page is half a PDF
 * page. Every page below was resolved by the horizontal position of the text
 * rather than by a formula over the index.
 */
export const TechnoElectric = z
  .object({
    entity: z.string().min(1),
    listedParent: z.string().min(1),
    ticker: z.string().min(1),
    exchange: z.enum(["NSE", "BSE", "NASDAQ"]),
    role: z.string().min(1),
    annualReport: z.object({
      fiscalYear: z.string().min(1),
      manifest: z.object({
        url: z.string().url(),
        hostedBy: z.string().min(1),
        sha256: z.string().regex(/^[0-9a-f]{64}$/),
        bytes: z.number().int().positive(),
        pdfPages: z.number().int().positive(),
        pagination: Pagination,
      }),
    }),
    campuses: z
      .array(
        z.object({
          name: z.string().min(1),
          mw: z.number().positive(),
          status: z.enum(["LIVE", "UNDER_CONSTRUCTION", "ANNOUNCED"]),
          /** The report's own words for the status, quoted rather than graded. */
          statusWords: z.string().min(1),
          /** What the report says the first phase of the campus is, where it
           *  says. Null where the report gives no phasing. */
          firstPhaseMW: z.number().positive().nullable(),
          page: z.number().int().positive(),
        }),
      )
      .min(3),
    campusesSource: PagedSource,
    target: z.object({
      mw: z.number().positive(),
      by: z.string().min(1),
      words: z.string().min(1),
      page: z.number().int().positive(),
    }),
    targetSource: PagedSource,
    edgeNetwork: z.object({
      locations: z.number().int().positive(),
      states: z.number().int().positive(),
      counterparty: z.string().min(1),
      contract: z.string().min(1),
      /** Null, and the note beside it says the disclosure is a count of sites
       *  rather than a capacity. */
      mw: z.number().positive().nullable(),
      mwNote: z.string().min(1),
      page: z.number().int().positive(),
    }),
    edgeNetworkSource: PagedSource,
    commitments: z.object({
      capitalCommitmentMn: z.number().nonnegative(),
      capitalCommitmentPriorMn: z.number().nonnegative(),
      capitalWords: z.string().min(1),
      contingent: z
        .array(
          z.object({
            head: z.string().min(1),
            amountMn: z.number().nonnegative(),
            amountPriorMn: z.number().nonnegative(),
            paidUnderProtestMn: z.number().nonnegative(),
            paidUnderProtestPriorMn: z.number().nonnegative(),
          }),
        )
        .min(1),
      contingentTotalMn: z.number().positive(),
      contingentTotalPriorMn: z.number().positive(),
      provisionQuote: z.string().min(1),
      standalonePage: z.number().int().positive(),
      consolidatedPage: z.number().int().positive(),
      source: PagedSource,
    }),
    /** What the accounts separate, which for this filer is nothing. The terms
     *  searched are stored beside the result so the absence can be re-run. */
    segmentation: z.object({
      reported: z.boolean(),
      termsSearched: z.array(z.string().min(1)).min(3),
      printedPagesSearched: z.number().int().positive(),
      ambitionWords: z.string().min(1),
      ambitionPage: z.number().int().positive(),
      source: PagedSource,
    }),
    governance: z.object({
      emphasisOfMatter: z.object({
        amountMn: z.number().positive(),
        subject: z.string().min(1),
        overdueQuote: z.string().min(1),
        provisionQuote: z.string().min(1),
        opinionQuote: z.string().min(1),
        standalonePage: z.number().int().positive(),
        consolidatedPage: z.number().int().positive(),
        source: PagedSource,
      }),
      struckOff: z.object({
        rows: z
          .array(
            z.object({
              name: z.string().min(1),
              kind: z.enum(["RECEIVABLE", "PAYABLE"]),
              relationship: z.enum(["RELATED_PARTY", "OTHERS"]),
              amountMn: z.number().nonnegative(),
              natureWords: z.string().min(1),
              relationshipWords: z.string().min(1),
            }),
          )
          .min(1),
        denialQuote: z.string().min(1),
        clauseNumeral: z.string().min(1),
        standalonePage: z.number().int().positive(),
        consolidatedPage: z.number().int().positive(),
        source: PagedSource,
      }),
    }),
  })
  .superRefine((d, ctx) => {
    const live = d.campuses.filter((c) => c.status === "LIVE").reduce((t, c) => t + c.mw, 0);
    const portfolio = d.campuses.reduce((t, c) => t + c.mw, 0);
    // The same descent every other name on this site is held to. What is live
    // sits inside what is being built, which sits inside what is targeted. An
    // inversion means a campus was misread or a target was quietly restated.
    if (!(live <= portfolio && portfolio <= d.target.mw)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["campuses"],
        message: `the campus ladder must descend from the target through the portfolio to what is live, got ${d.target.mw} then ${portfolio} then ${live}`,
      });
    }
    // The finding. One campus carries a headline figure and a first phase that
    // is a fraction of it, which is the announced against delivered gap inside
    // a single site rather than across an estate.
    for (const c of d.campuses) {
      if (c.firstPhaseMW !== null && c.firstPhaseMW / c.mw > 0.1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["campuses"],
          message: `${c.name}: a stated first phase is no longer a small fraction of the campus it belongs to`,
        });
      }
    }
    // The comparison the page leads on. A filer targeting 250 MW prints, in both
    // sets of accounts, contracts for future capital spending smaller than the
    // tax demands it is disputing. A reversal removes the comparison.
    if (d.commitments.capitalCommitmentMn >= d.commitments.contingentTotalMn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["commitments"],
        message: `contracted capital now exceeds the tax it disputes, at ${d.commitments.capitalCommitmentMn} against ${d.commitments.contingentTotalMn}`,
      });
    }
    // Fires when the disclosure improves, which is the point. The page states
    // that the data centre business cannot be sized apart from the engineering
    // business funding it, and a segment note settles that the other way.
    if (d.segmentation.reported) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["segmentation"],
        message: `the report now separates the data centre business, so a reader can size it apart from the rest`,
      });
    }
    // The contradiction is the finding, so both halves are asserted rather than
    // either alone. One clause tables a balance and the next denies there is one.
    if (d.governance.struckOff.rows.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["governance", "struckOff"],
        message: `the struck off note no longer tables a balance beside the sentence denying there is one`,
      });
    }
    // The two figures the page sets against each other, both audited, one drawn
    // to the auditor's attention and one the company committed to spend.
    if (d.governance.emphasisOfMatter.amountMn <= d.commitments.capitalCommitmentMn) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["governance", "emphasisOfMatter"],
        message: `the overdue balances drawn to the auditor's attention no longer exceed the capital the company has contracted`,
      });
    }
    // A printed page has to be able to exist in the document. The spread layout
    // means the printed range runs to about twice the PDF page count, and a
    // citation outside it is a misread offset rather than a typo.
    const maxPrinted = d.annualReport.manifest.pdfPages * 2;
    const cited = [
      ...d.campuses.map((c) => c.page),
      d.target.page,
      d.edgeNetwork.page,
      d.campusesSource.page,
      d.targetSource.page,
      d.edgeNetworkSource.page,
      d.commitments.standalonePage,
      d.commitments.consolidatedPage,
      d.commitments.source.page,
      d.segmentation.ambitionPage,
      d.segmentation.source.page,
      d.governance.emphasisOfMatter.standalonePage,
      d.governance.emphasisOfMatter.consolidatedPage,
      d.governance.emphasisOfMatter.source.page,
      d.governance.struckOff.standalonePage,
      d.governance.struckOff.consolidatedPage,
      d.governance.struckOff.source.page,
    ];
    for (const page of cited) {
      if (page > maxPrinted) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["annualReport"],
          message: `a cited printed page falls outside the document it is attributed to`,
        });
      }
    }
  });

export type TechnoElectric = z.infer<typeof TechnoElectric>;

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
/**
 * E2E Networks, the fourth document read and the only filer here that publishes
 * no capacity at all.
 *
 * Two measures come out of it and neither is about megawatts. The first is a
 * growth quality question: the company reports a year up seventy three per cent
 * and, in the same report, an exit run rate that annualises below the year it
 * has just finished. The second is an earnings quality question: what the
 * operations produced before tax against what arrived as other income.
 *
 * Amounts are in the unit the statements print, lakh, except the monthly
 * recurring revenue, which the report gives in crore. Both are stored as
 * printed and neither is converted, so the unit travels with the figure.
 */
export const E2E = z
  .object({
    _note: z.string().min(1),
    entity: z.string().min(1),
    ticker: z.string().min(1),
    fiscalYear: z.string().min(1),
    priorFiscalYear: z.string().min(1),
    unit: z.string().min(1),
    /** The income statement as the report summarises it, twice. */
    performance: z.object({
      revenueLakh: z.number().positive(),
      revenueLakhPrior: z.number().positive(),
      ebitdaLakh: z.number(),
      depreciationLakh: z.number().nonnegative(),
      financeCostsLakh: z.number().nonnegative(),
      otherIncomeLakh: z.number(),
      otherIncomeLakhPrior: z.number(),
      profitBeforeTaxLakh: z.number(),
      /** The report prints the same table in two sections. Both pages are
       *  recorded, because a figure printed twice is a stronger citation than
       *  the same figure cited once. */
      pages: z.array(z.number().int().positive()).min(1),
    }),
    /** The only operating rate the company publishes, and it is in crore. */
    recurring: z.object({
      monthlyCrore: z.number().positive(),
      monthlyCrorePrior: z.number().positive(),
      asOf: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      asOfPrior: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      quote: z.string().min(1),
      page: z.number().int().positive(),
    }),
    /** What the report does not say, kept beside what it does. */
    notRead: z.array(z.string().min(1)).min(1),
    pagination: z.object({
      pdfIndexOfPrintedOne: z.number().int().positive(),
      foliosAgreeing: z.number().int().positive(),
      pdfPages: z.number().int().positive(),
      sha256: z.string().regex(/^[0-9a-f]{64}$/),
      url: z.string().url(),
    }),
    source: PagedSource,
  })
  .superRefine((d, ctx) => {
    const p = d.performance;
    // The summary table must reconcile to the profit printed under it. Every
    // line is typed from one page, and a mistyped one would move a ratio the
    // page quotes while changing nothing a reader could see.
    const built = p.ebitdaLakh - p.depreciationLakh - p.financeCostsLakh + p.otherIncomeLakh;
    if (Math.abs(built - p.profitBeforeTaxLakh) > 0.01) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["performance"],
        // Worded away from the Anant Raj guard on purpose. That one owns the
        // phrase about reconciling, and the ledger test requires every
        // documented fragment to identify exactly one guard, so two guards
        // checking the same kind of thing must still say it differently. Do not
        // quote the other guard's wording here either: the test greps this
        // source, and a comment counts.
        message: `the summary income statement does not add up to the profit before tax printed under it, building ${built.toFixed(2)} against ${p.profitBeforeTaxLakh}`,
      });
    }
    // The finding, asserted rather than described: annualising the exit rate
    // must land below the year just reported. If a later year closes that gap,
    // the sentence on the page has stopped being true.
    if (d.recurring.monthlyCrore * 12 * 100 >= p.revenueLakh) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["recurring"],
        message: "the exit run rate no longer annualises below the year reported beside it",
      });
    }
  });

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
