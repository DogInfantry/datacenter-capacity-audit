import { Icon } from "./Visual";

type Stack = {
  firm: string;
  bnUsd: number;
  from: number;
  to: number;
  horizon: string;
  note: string;
};

/** One tone per firm, ordered by size, on the same ramp the capacity rungs use.
 *  These are three magnitudes of one quantity rather than three identities. */
const TONES = ["var(--rung-4)", "var(--rung-3)", "var(--rung-2)"];

/**
 * Announced money above, delivered capacity below, and nothing drawn across the
 * two.
 *
 * The money panel puts three firms' pledges inside the commitment the whole
 * sector has recorded, with the market's own annual size on the same axis. The
 * capacity panel is a separate scale in a different unit and says so: only one
 * of the three announcements named a capacity at all, so it is the only one
 * that can be set against the estate that exists.
 *
 * Both panels are rows on one axis rather than a chart with floating labels.
 * An absolutely positioned label contributes to page level horizontal overflow
 * even when it is invisible, and this page has to hold at 375 pixels.
 */
export function HyperscalerPledges({
  stacked,
  total,
  max,
  cumulativeBnUsd,
  cumulativeFromYear,
  cumulativeToLabel,
  marketBnUsd,
  marketYear,
  currentMW,
  currentYear,
  siteFirm,
  siteMW,
  unnamedCount,
}: {
  stacked: Stack[];
  total: number;
  max: number;
  cumulativeBnUsd: number;
  cumulativeFromYear: number;
  cumulativeToLabel: string;
  marketBnUsd: number;
  marketYear: number;
  currentMW: number;
  currentYear: number;
  siteFirm: string | null;
  siteMW: number | null;
  unnamedCount: number;
}) {
  const w = (v: number) => `${(v / max) * 100}%`;
  const capMax = Math.max(currentMW, siteMW ?? 0);
  const capW = (v: number) => `${(v / capMax) * 100}%`;
  const bn = (v: number) => (Number.isInteger(v) ? `${v}` : v.toFixed(1));

  return (
    <div className="space-y-7">
      <section>
        <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
          <p className="text-[11px] uppercase tracking-wider text-muted">Announced, in dollars</p>
          <p className="text-[11px] text-muted">Billions of US dollars, one scale</p>
        </div>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-muted">
          {stacked.map((s, i) => (
            <span key={s.firm} className="flex items-center gap-2">
              <span
                aria-hidden
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: TONES[i % TONES.length] }}
              />
              <span className="text-foreground">{s.firm}</span>
              <span className="tnum">{bn(s.bnUsd)}</span>
            </span>
          ))}
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="h-2.5 w-2.5 rounded-sm"
              style={{ background: "var(--grid)" }}
            />
            Everyone else
          </span>
        </div>

        <ul
          className="mt-3 space-y-2"
          role="img"
          aria-label={`Three firms have pledged ${bn(total)} billion dollars, against ${bn(cumulativeBnUsd)} billion committed to Indian data centres by every investor since ${cumulativeFromYear}, and an annual market of ${bn(marketBnUsd)} billion.`}
        >
          <li className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 text-xs sm:grid-cols-[11rem_1fr_3.25rem]">
            <span className="truncate text-foreground">Pledged by three firms</span>
            <span className="relative block h-7 rounded-sm bg-grid">
              {stacked.map((s, i) => (
                <span
                  key={s.firm}
                  className="absolute inset-y-0 rounded-sm"
                  style={{
                    left: w(s.from),
                    width: w(s.bnUsd),
                    background: TONES[i % TONES.length],
                  }}
                />
              ))}
            </span>
            <span className="text-right tnum text-foreground">{bn(total)}</span>
          </li>

          <li className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 text-xs sm:grid-cols-[11rem_1fr_3.25rem]">
            <span className="truncate text-muted">
              Committed since {cumulativeFromYear}, all investors
            </span>
            <span className="relative block h-7 rounded-sm bg-grid">
              <span
                aria-hidden
                className="absolute inset-y-0 left-0 rounded-sm border border-line bg-grid"
                style={{ width: w(cumulativeBnUsd) }}
              />
            </span>
            <span className="text-right tnum text-muted">{bn(cumulativeBnUsd)}</span>
          </li>

          <li className="grid grid-cols-[7.5rem_1fr_3rem] items-center gap-3 text-xs sm:grid-cols-[11rem_1fr_3.25rem]">
            <span className="truncate text-signal">The whole market, {marketYear}, one year</span>
            <span className="relative block h-7 rounded-sm bg-grid">
              <span
                className="absolute inset-y-0 left-0 rounded-sm"
                style={{ width: w(marketBnUsd), background: "var(--signal)" }}
              />
            </span>
            <span className="text-right tnum text-signal">{bn(marketBnUsd)}</span>
          </li>
        </ul>

        <p className="mt-2 text-[11px] leading-relaxed text-muted">
          The commitment bar runs to {cumulativeToLabel} and includes the three pledges above it.
          The pledges do not share a horizon:{" "}
          {stacked.map((s, i) => (
            <span key={s.firm}>
              {i > 0 ? "; " : ""}
              {s.firm} {s.horizon}
            </span>
          ))}
          .
        </p>
      </section>

      {siteMW !== null && siteFirm !== null && (
        <section className="border-t border-line pt-6">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <p className="text-[11px] uppercase tracking-wider text-muted">
              Delivered, in megawatts
            </p>
            <p className="text-[11px] text-muted">A different quantity, a separate scale</p>
          </div>

          <ul
            className="mt-3 space-y-2"
            role="img"
            aria-label={`${currentMW} megawatts operational nationally in ${currentYear}, against ${siteMW} megawatts announced for the first phase of one ${siteFirm} site.`}
          >
            <li className="grid grid-cols-[7.5rem_1fr_4rem] items-center gap-3 text-xs sm:grid-cols-[11rem_1fr_4.25rem]">
              <span className="truncate text-foreground">
                Operational nationally, {currentYear}
              </span>
              <span className="relative block h-7 rounded-sm bg-grid">
                <span
                  className="absolute inset-y-0 left-0 rounded-sm"
                  style={{ width: capW(currentMW), background: "var(--accent-deep)" }}
                />
              </span>
              <span className="text-right tnum text-foreground">
                {currentMW.toLocaleString("en-IN")}
              </span>
            </li>
            <li className="grid grid-cols-[7.5rem_1fr_4rem] items-center gap-3 text-xs sm:grid-cols-[11rem_1fr_4.25rem]">
              <span className="truncate text-signal">{siteFirm}, one site, first phase</span>
              <span className="relative block h-7 rounded-sm bg-grid">
                <span
                  aria-hidden
                  className="absolute inset-y-0 left-0 rounded-sm border border-dashed border-signal"
                  style={{ width: capW(siteMW) }}
                />
              </span>
              <span className="text-right tnum text-signal">{siteMW.toLocaleString("en-IN")}</span>
            </li>
          </ul>
          <p className="mt-2 text-[11px] text-muted">
            Megawatts. Solid is built. Dashed is announced.
          </p>
        </section>
      )}

      <p className="flex gap-1.5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <span>
          The two panels are not drawn on one axis and no rate converts between them. Dollars stay
          dollars and megawatts stay megawatts. <span className="tnum">{unnamedCount}</span> of the
          three announcements attached no capacity figure to the money, which is why only one of
          them appears in the lower panel.
        </span>
      </p>
    </div>
  );
}
