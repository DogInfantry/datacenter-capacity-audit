import type { CompareRow, CompareSubject } from "@/lib/diagnostics/compare";
import { Icon } from "./Visual";
import { Logo } from "./Logo";

/**
 * Two operators side by side, with every row marked for whether it is actually
 * a comparison.
 *
 * A comparison table's usual failure is that an empty cell reads as a zero, so
 * an absent figure is drawn as a sentence naming the document that carries it.
 * Both companies' accounts have now been read and no cell in the financial
 * table is empty, but the branch stays because the next company added will
 * arrive with holes before it arrives without them.
 *
 * The rows that are genuinely like for like are marked on their face.
 * Everything else is a level, and levels do not travel between two companies
 * that use different words, or different denominators, for the same thing.
 */
const fmt = (n: number) => n.toLocaleString("en-IN", { maximumFractionDigits: n < 1000 ? 2 : 0 });

export function CompareTable({
  subjects,
  rows,
}: {
  subjects: CompareSubject[];
  rows: CompareRow[];
}) {
  const shown = subjects.filter((s) => !s.excluded);

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] border-collapse text-sm">
          <caption className="sr-only">
            Two data centre operators compared. One row here is like for like; the rest are
            levels, which sit side by side without asking the same question.
          </caption>
          <thead>
            <tr className="border-b border-line text-left align-bottom">
              <th className="w-[42%] py-3 pr-4 font-medium text-muted">Measure</th>
              {shown.map((s) => (
                <th key={s.ticker} scope="col" className="py-3 pr-4 font-medium">
                  <span className="flex items-center gap-2">
                    <Logo ticker={s.ticker} name={s.name} size="md" tone="var(--accent-deep)" />
                    <span className="truncate">{s.name}</span>
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.metric} className="border-b border-line align-top">
                <th scope="row" className="py-3 pr-4 text-left font-normal">
                  <span className="flex flex-wrap items-baseline gap-2">
                    <span className="font-medium">{r.metric}</span>
                    {r.comparable && (
                      <span className="shrink-0 rounded-sm border border-accent px-1.5 py-px text-[10px] uppercase tracking-wider text-accent">
                        like for like
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted">{r.basis}</span>
                </th>
                {shown.map((s) => {
                  const c = r.cells[s.ticker];
                  return (
                    <td key={s.ticker} className="py-3 pr-4">
                      {c && c.value !== null ? (
                        <>
                          <span className="tnum font-display text-xl tracking-tight">
                            {fmt(c.value)}
                          </span>
                          <span className="mt-0.5 block text-xs text-muted">{c.unit}</span>
                        </>
                      ) : (
                        <span className="flex gap-1.5 text-xs leading-relaxed text-muted">
                          <span className="mt-0.5 shrink-0 text-signal">
                            <Icon name="warning" size={13} />
                          </span>
                          <span>
                            <span className="block text-foreground">No figure cited</span>
                            {c?.missing}
                          </span>
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {subjects
        .filter((s) => s.excluded)
        .map((s) => (
          <p
            key={s.ticker}
            className="mt-5 flex gap-2 rounded-md border border-dashed border-line p-4 text-sm leading-relaxed text-muted"
          >
            <span className="mt-0.5 shrink-0">
              <Logo ticker={s.ticker} name={s.name} size="sm" />
            </span>
            <span>
              <span className="text-foreground">{s.name} is not in this table.</span> {s.excluded}
            </span>
          </p>
        ))}
    </div>
  );
}
