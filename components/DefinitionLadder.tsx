const RUNGS = [
  { key: "Design capacity", mw: 188, on: "2025-10-27", tone: "var(--ord-1)",
    gloss: "Ready for sale. Not built.", drhp: "Built" },
  { key: "Built", mw: 130, on: "2025-10-27", tone: "var(--ord-2)",
    gloss: "Physically constructed.", drhp: "Installed" },
  { key: "Commissioned", mw: 120, on: "2025-01-17", tone: "var(--ord-3)",
    gloss: "Installed and live.", drhp: "Operational" },
  { key: "Contracted", mw: 110, on: "2025-01-17", tone: "var(--ord-4)",
    gloss: "Taken by a paying customer.", drhp: "Operational" },
];

const MAX = 200;

/**
 * Four numbers, all called capacity.
 *
 * The rungs deliberately carry different dates and say so. The top two are from
 * the October 2025 call, the bottom two from January 2025, and collapsing them
 * into one snapshot would be the exact error the project exists to point at.
 * The finding is not a clean funnel, it is that one company reports four
 * different figures under one word and coverage quotes whichever is largest.
 *
 * The `drhp` field is the word the filed prospectus uses for the same rung, and
 * it is here because without it this site contradicts itself. This ladder is
 * the vocabulary of the earnings calls, where 188 is design capacity and 130 is
 * built. The prospectus calls 188 built and 131.88 installed. A reader moving
 * between the disclosure page and the prospectus page would otherwise meet the
 * same estate described twice, with the same words attached to different
 * numbers. The mismatch is the finding, so it is labelled rather than
 * flattened.
 */
export function DefinitionLadder() {
  return (
    <figure className="mt-8">
      <ul className="space-y-2.5" role="list">
        {RUNGS.map((r) => (
          <li key={r.key}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
              <span className="font-medium">{r.key}</span>
              <span className="text-xs text-muted">
                <span className="tnum">{r.mw} MW</span> · as at {r.on}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2">
              <div
                className="h-3.5 rounded-sm"
                style={{ width: `${(r.mw / MAX) * 100}%`, background: r.tone }}
              />
              <span className="text-xs text-muted">
                {r.gloss}{" "}
                <span className="opacity-70">
                  Prospectus calls this {r.drhp.toLowerCase()}.
                </span>
              </span>
            </div>
          </li>
        ))}
      </ul>
      <figcaption className="mt-4 text-xs leading-relaxed text-muted">
        Sify&apos;s own words, across two calls. The top two rungs are from 27
        October 2025, the bottom two from 17 January 2025, so this is not a
        single-date funnel and is not drawn as one. The point is that four
        different figures travel under the single word capacity, and a headline
        is free to pick the largest.
      </figcaption>
      <figcaption className="mt-3 text-xs leading-relaxed text-muted">
        The right hand note on each rung is the word the filed prospectus uses
        for the same thing. They do not line up. What the calls call design
        capacity, the prospectus calls built; what the calls call built, the
        prospectus calls installed. The same estate, with the vocabulary shifted
        one rung. That is why this ladder and the prospectus page appear to
        disagree about what built means, and the disagreement belongs to the
        company rather than to the reporting of it.
      </figcaption>
    </figure>
  );
}
