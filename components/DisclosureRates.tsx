import type { RegisterCompany } from "@/lib/schema";
import { refusalRate, publishedElsewhereSplit, pressurePerCall } from "@/lib/diagnostics/disclosure";
import { Logo } from "./Logo";
import { Icon } from "./Visual";

/**
 * How often a company declines to put a number on its own unit economics.
 *
 * The denominator is drawn, not appended. A refusal rate on its own would say
 * the Indian operator is the most forthcoming of the three, and the reason it
 * can say that is that nobody asks it very much: it faces the fewest unit
 * economics questions per call by a wide margin. Both numbers are the finding,
 * so the bar is the questions pressed and the filled part is the refusals,
 * which puts the rate and its denominator into one mark.
 *
 * Every bar sits on one scale, for the same reason the capacity ladders do.
 * Three bars each indexed to their own width would draw a company asked fifteen
 * questions and a company asked thirty four at the same size, and the asking is
 * half the story.
 */

export function DisclosureRates({ companies }: { companies: RegisterCompany[] }) {
  const rows = companies.map((c) => ({
    c,
    rate: refusalRate(c),
    pressure: pressurePerCall(c),
    split: publishedElsewhereSplit(c.refusals),
  }));
  const max = Math.max(...rows.map((r) => r.rate.pressed));
  const namedASource = rows.reduce((t, r) => t + r.split.namedASource, 0);
  const allRefusals = rows.reduce((t, r) => t + r.split.total, 0);

  return (
    <div>
      <div className="grid gap-5">
        {rows.map(({ c, rate, pressure }) => (
          <div key={c.ticker}>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
              <span className="flex items-center gap-2.5">
                <Logo ticker={c.ticker} name={c.name} size="sm" />
                <span className="text-sm text-foreground">{c.name}</span>
              </span>
              <span className="text-xs text-muted">
                <span className="tnum text-foreground">{rate.refused}</span> refused of{" "}
                <span className="tnum text-foreground">{rate.pressed}</span> pressed &middot;{" "}
                <span className="tnum text-foreground">{(rate.rate * 100).toFixed(1)}</span>%
              </span>
            </div>

            <div className="mt-2 h-7">
              <div
                className="flex h-full overflow-hidden rounded-sm border border-line"
                style={{ width: `${(rate.pressed / max) * 100}%` }}
                role="img"
                aria-label={`${c.name} was pressed ${rate.pressed} times on unit economics and refused ${rate.refused} of them`}
              >
                <span
                  className="h-full shrink-0"
                  style={{
                    width: `${(rate.refused / rate.pressed) * 100}%`,
                    background: "var(--signal)",
                  }}
                />
                <span className="h-full flex-1" style={{ background: "var(--rung-1)" }} />
              </div>
            </div>

            <p className="mt-1.5 text-xs text-muted">
              <span className="tnum">{pressure.perCall.toFixed(2)}</span> unit economics questions a
              call, across <span className="tnum">{pressure.calls}</span> calls
            </p>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-2 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <p>
          <span className="tnum text-foreground">{namedASource}</span> of the{" "}
          <span className="tnum text-foreground">{allRefusals}</span> refusals named somewhere the
          figure could be found. That second measure carries a limit worth stating beside it rather
          than under it: it is coded from what management said out loud, so a refusal naming no
          source is not evidence the figure is unpublished. Both global operators publish quarterly
          supplements that a call answer may simply not mention.
        </p>
      </div>
    </div>
  );
}
