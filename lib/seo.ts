import { COVERED_TICKERS } from "@/lib/data";

/**
 * Everything that identifies the site to something that is not a person.
 *
 * The name sits in one place because it is the thing most likely to change, and
 * because a name written into a dozen files is how a rename becomes a project.
 * Every route that carries metadata reads it from here.
 */
export const SITE = {
  name: "Built, Installed, Sold",
  url: "https://datacenter-capacity-audit.vercel.app",
  locale: "en_IN",
  description:
    "India's listed data centre and AI infrastructure names, with announced capacity and delivered capacity kept in separate columns. Every figure carries the filing and the printed page it was read from.",
} as const;

/**
 * The addressable routes, kept beside the company list they depend on so a new
 * deep dive cannot be added without appearing in the sitemap. A route missing
 * from here is invisible to a crawler that does not follow links.
 */
export const ROUTES = [
  "/",
  "/company",
  "/universe",
  "/compare",
  "/macro",
  "/offer",
  "/pillars",
  "/methodology",
  ...COVERED_TICKERS.map((t) => `/company/${t}`),
] as const;

/**
 * Structured data, which is the part a search engine and a language model read
 * rather than infer. The site is a dataset before it is anything else, so it
 * says so, and the questions below are the ones the pages actually answer.
 */
export function websiteLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "en",
  };
}

export function datasetLd(input: {
  documentsRead: number;
  invariants: number;
  citedPages: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Dataset",
    name: `${SITE.name}: announced against delivered data centre capacity in India`,
    description: `Hand verified capacity, financial and disclosure data on India's listed data centre and AI infrastructure names, drawn from ${input.documentsRead} filings read page by page, five machine harvested filers and one government dataset. ${input.invariants} build invariants fail the build when a published claim stops being true.`,
    url: SITE.url,
    license: "https://opensource.org/licenses/MIT",
    isAccessibleForFree: true,
    creator: { "@type": "Person", name: "DogInfantry" },
    keywords: [
      "data centre capacity",
      "India",
      "megawatts",
      "equity research",
      "SEC filings",
      "earnings calls",
      "forensic accounting",
    ],
    measurementTechnique:
      "Primary document reading with printed page citation, machine harvest of SEC tagged filings, and build time validation of every published claim",
    variableMeasured: [
      "built capacity in megawatts",
      "installed capacity in megawatts",
      "operational capacity in megawatts",
      "cash conversion",
      "disclosure refusal rate",
    ],
  };
}

export function faqLd(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({
      "@type": "Question",
      name: i.q,
      acceptedAnswer: { "@type": "Answer", text: i.a },
    })),
  };
}

export function techArticleLd(input: { headline: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: input.headline,
    description: input.description,
    url: `${SITE.url}${input.path}`,
    isPartOf: { "@type": "WebSite", name: SITE.name, url: SITE.url },
    inLanguage: "en",
  };
}
