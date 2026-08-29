type Verification = "PRIMARY" | "SECONDARY" | "UNVERIFIED";

/**
 * How much of the site actually rests on a filing.
 *
 * The product's argument is that announced capacity is reported with more
 * confidence than the evidence carries. A methodology page that asserted its
 * own rigour would be making the same move, so this counts instead. Every
 * number on that page is the output of one of these two functions.
 */
export function verificationTally(rows: { source: { verification: Verification } }[]) {
  const tiers: Verification[] = ["PRIMARY", "SECONDARY", "UNVERIFIED"];
  const counts = Object.fromEntries(
    tiers.map((t) => [t, rows.filter((r) => r.source.verification === t).length]),
  ) as Record<Verification, number>;
  return { total: rows.length, counts };
}

/**
 * Every printed page of the prospectus this site cites, deduplicated.
 *
 * A deep walk rather than a list of named fields, because the schema uses one
 * integer for printed pages and nothing else: `PagedSource.page` and the
 * `cited` fields on the prospectus blocks. Adding a new sourced block therefore
 * shows up here without anyone remembering to update a list, which is the whole
 * point of counting rather than typing.
 */
export function citedPages(...docs: unknown[]) {
  const found = new Set<number>();
  const walk = (node: unknown) => {
    if (node === null || typeof node !== "object") return;
    for (const [key, value] of Object.entries(node)) {
      if (key === "page" && typeof value === "number") found.add(value);
      else walk(value);
    }
  };
  docs.forEach(walk);
  return [...found].sort((a, b) => a - b);
}
