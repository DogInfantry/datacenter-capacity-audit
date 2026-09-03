import type { PillarCoverage } from "@/lib/schema";

/**
 * How far each pillar has got, counted rather than described.
 *
 * The denominator is the subjects a pillar could be put to, meaning entities
 * with a document read by hand or a machine harvest. It is deliberately not the
 * coverage universe: most of the eighteen names in the brief have had nothing
 * filed against them here, and counting them would make the measure look worse
 * for a reason that has nothing to do with the pillars.
 */
export function coverageMatrix(d: PillarCoverage) {
  const rows = d.pillars.map((p) => {
    const covered = new Set(p.covered);
    return {
      ...p,
      cells: d.subjects.map((s) => ({ ...s, covered: covered.has(s.id) })),
      count: p.covered.length,
      sharePct: (p.covered.length / d.subjects.length) * 100,
    };
  });
  const filled = rows.reduce((t, r) => t + r.count, 0);
  const total = d.subjects.length * d.pillars.length;
  return {
    subjects: d.subjects,
    rows,
    filled,
    total,
    sharePct: (filled / total) * 100,
    built: rows.filter((r) => r.state === "BUILT").length,
    terminal: rows.filter((r) => r.state === "TERMINAL").length,
  };
}
