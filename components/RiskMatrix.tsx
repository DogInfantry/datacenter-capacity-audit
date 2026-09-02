import type { RiskRegister } from "@/lib/schema";
import {
  matrixCells,
  numbered,
  pillarCoverage,
  worstCell,
  type Measure,
} from "@/lib/diagnostics/risk";
import { Icon } from "./Visual";

/**
 * The risk register, drawn as a matrix.
 *
 * Three decisions worth stating, because each is the opposite of what a risk
 * matrix usually does.
 *
 * The cells are not a heat map. A colour ramp across nine cells would encode
 * severity twice, once by position and once by hue, and the second encoding
 * would carry no information the first does not. Only the worst cell is tinted,
 * and it carries a border and a written label as well, never colour alone.
 *
 * A chip is filled when the magnitude beside its row is derived from the filing
 * and outlined when the row is judgement. That is the vocabulary the estate
 * exhibit already uses for towers that sell nothing, and it is what stops the
 * matrix reading as though every cell were equally well evidenced.
 *
 * The chips are anchors into the numbered list below rather than tooltips. A
 * tooltip inside a scrolling wrapper is invisible to the page level overflow
 * test this project runs, it does not print, and the list has to exist anyway.
 */

const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: 2 });

const GRADE_LABEL: Record<string, string> = { LOW: "Low", MED: "Medium", HIGH: "High" };

function Chip({ n, measured, worst }: { n: number; measured: boolean; worst: boolean }) {
  const tone = worst ? "var(--signal)" : "var(--accent)";
  return (
    <a
      href={`#risk-${n}`}
      className="inline-flex h-7 w-7 items-center justify-center rounded-[5px] font-mono text-xs tabular-nums transition-opacity hover:opacity-70"
      style={
        measured
          ? { background: tone, color: "var(--on-accent)" }
          : { border: `1px solid ${tone}`, color: tone }
      }
    >
      {String(n).padStart(2, "0")}
    </a>
  );
}

export function RiskMatrix({
  register,
  measures,
}: {
  register: RiskRegister;
  measures: Record<string, Measure>;
}) {
  const rows = numbered(register.rows);
  const grid = matrixCells(rows);
  const worst = worstCell(rows);
  const pillars = pillarCoverage(register.rows);
  const measured = rows.filter((r) => r.measured).length;
  // A register whose grades never reach the bottom of either scale is a
  // selected list rather than a survey, and the exhibit says so rather than
  // letting an empty column read as an absence of low risks.
  const lows = rows.filter((r) => r.severity === "LOW" || r.likelihood === "LOW").length;
  // Counted rather than tested. A register can hold rows from a filing beside
  // rows from a research note, and a single flag would describe every row by
  // whichever kind happened to appear first, which is the overclaim these
  // pages are careful to avoid.
  const filed = rows.filter((r) => r.page !== null).length;

  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--accent)" }}
          />
          Magnitude derived from the recorded numbers
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ border: "1px solid var(--accent)" }}
          />
          Graded, no figure behind it
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--signal)" }}
          />
          Severe and likely together
        </span>
      </div>

      <div className="overflow-x-auto">
        {/* Held to a readable width rather than stretched. Nine cells holding
            two digit chips across a six column page reads as an empty grid with
            numbers lost in it. */}
        <table className="w-full min-w-[20rem] max-w-[34rem] border-collapse text-xs">
          <caption className="sr-only">
            Risks by severity and likelihood. Each cell lists the numbered risks that fall in it,
            and each number links to its entry in the list below.
          </caption>
          <thead>
            <tr className="text-muted">
              <th className="w-24 py-1.5 pr-3 text-left font-medium">
                <span className="text-[10px] uppercase tracking-wider">Severity</span>
              </th>
              {grid[0].cells.map((c) => (
                <th key={c.likelihood} scope="col" className="py-1.5 text-center font-medium">
                  {GRADE_LABEL[c.likelihood]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grid.map((r) => (
              <tr key={r.severity}>
                <th scope="row" className="py-1.5 pr-3 text-left font-medium text-muted">
                  {GRADE_LABEL[r.severity]}
                </th>
                {r.cells.map((c) => (
                  <td
                    key={c.likelihood}
                    className="border border-line p-2 align-top"
                    style={
                      c.worst
                        ? { background: "var(--accent-soft)", borderColor: "var(--signal)" }
                        : { background: "var(--card)" }
                    }
                  >
                    <span className="flex flex-wrap justify-center gap-1.5">
                      {c.rows.map((row) => (
                        <Chip key={row.id} n={row.n} measured={row.measured} worst={c.worst} />
                      ))}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-[10px] uppercase tracking-wider text-muted">Likelihood, across</p>

      <ol className="mt-6 space-y-4">
        {rows.map((r) => {
          const m = r.measured ? measures[r.id] : undefined;
          return (
            <li key={r.id} id={`risk-${r.n}`} className="scroll-mt-24 border-t border-line pt-4">
              <div className="flex gap-3">
                <span className="shrink-0">
                  <Chip
                    n={r.n}
                    measured={r.measured}
                    worst={r.severity === "HIGH" && r.likelihood === "HIGH"}
                  />
                </span>
                <div className="min-w-0">
                  <p className="font-medium leading-snug">{r.risk}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-wider text-muted">
                    {GRADE_LABEL[r.severity]} severity, {GRADE_LABEL[r.likelihood].toLowerCase()}{" "}
                    likelihood
                    {r.page !== null ? ` · printed page ${r.page}` : ""}
                  </p>

                  {m ? (
                    <p className="mt-2 text-sm">
                      <span className="tnum font-display text-2xl tracking-tight">
                        {fmt(m.value)}
                      </span>{" "}
                      <span className="text-muted">
                        {m.unit}. {m.basis}.
                      </span>
                    </p>
                  ) : (
                    <p className="mt-2 flex gap-2 text-sm text-muted">
                      <span className="mt-0.5 shrink-0 text-signal">
                        <Icon name="warning" size={14} />
                      </span>
                      <span>
                        No magnitude. This row is graded, and nothing on the page pretends otherwise.
                      </span>
                    </p>
                  )}

                  <p className="mt-2 text-sm leading-relaxed text-muted">{r.note}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    <span className="text-foreground">Mitigant.</span> {r.mitigant}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 border-t border-line pt-4">
        <p className="exhibit-label">Pillar coverage</p>
        <ul className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
          {pillars.map((p) => (
            <li key={p.pillar} className="bg-card p-3">
              <p className={p.count > 0 ? "text-sm font-medium" : "text-sm text-muted"}>{p.label}</p>
              <p className="mt-0.5 text-xs text-muted">
                {p.count > 0 ? (
                  <>
                    <span className="tnum text-foreground">{p.count}</span>{" "}
                    {p.count === 1 ? "risk" : "risks"}
                  </>
                ) : (
                  "no row, nothing read"
                )}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-muted">{register.unevidencedNote}</p>
        <p className="mt-3 text-sm leading-relaxed text-muted">
          <span className="text-foreground">
            {worst.length} of {rows.length}
          </span>{" "}
          risks sit in the worst cell, and{" "}
          <span className="text-foreground">
            {measured} of {rows.length}
          </span>{" "}
          carry a figure derived from the recorded numbers rather than a grade
          {filed > 0 ? (
            <>
              , and <span className="text-foreground">{filed}</span> rest on a printed page
            </>
          ) : (
            ", and none rests on a printed page"
          )}
          . {register.gradingNote}
        </p>
        {lows === 0 && (
          <p className="mt-3 text-sm leading-relaxed text-muted">
            No row is graded low on either axis, so the bottom row and the left column of the matrix
            stand empty. That is a property of the register rather than of the company: these are the
            risks worth writing down, not a survey of every risk the filing lists.
          </p>
        )}
      </div>
    </div>
  );
}
