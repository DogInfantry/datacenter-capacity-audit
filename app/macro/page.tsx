import type { Metadata } from "next";
import Link from "next/link";
import { macro, sisl } from "@/lib/data";
import { forecastSpread, requiredRunRate } from "@/lib/diagnostics/macro";
import { Exhibit } from "@/components/Exhibits";
import { ForecastSpread } from "@/components/ForecastSpread";
import { BuildRate } from "@/components/BuildRate";
import { StatTile, type IconName } from "@/components/Visual";

export const metadata: Metadata = {
  title: "The sector",
  description:
    "India's data centre capacity forecasts disagree by a factor of three, and every one of them is stated in built capacity, the unit that does not earn.",
};

export default function MacroPage() {
  // The conversion is measured, not assumed: the last full filed year on the one
  // Indian estate that prints both built and sold capacity.
  const full = sisl.periods.filter((p) => !p.stub);
  const latest = full[full.length - 1];
  const conversion = latest.operationalMW / latest.builtMW;

  const spread = forecastSpread(macro.capacity.forecasts, conversion);
  const build = [...macro.buildRate].sort((a, b) => a.year - b.year);
  const newest = build[build.length - 1];
  const prior = build[build.length - 2];
  const runRate = requiredRunRate(
    macro.capacity.forecasts,
    macro.capacity.current.mw,
    macro.capacity.current.year,
    newest.addedMW,
  );

  const gw = (mw: number) => (mw / 1000).toFixed(1);

  const tiles: { icon: IconName; k: string; v: string; u: string; n: string; tone?: "signal" }[] = [
    {
      icon: "datacentre",
      k: "Operational today",
      v: gw(macro.capacity.current.mw),
      u: "GW",
      n: macro.capacity.current.note,
    },
    {
      icon: "warning",
      k: "Forecasts disagree by",
      v: `${spread.spreadMultiple.toFixed(1)}x`,
      u: "low to high",
      n: `${spread.low.publisher} at ${gw(spread.low.mw)} GW against the top of the range at ${gw(spread.high.mwTop)} GW.`,
      tone: "signal",
    },
    {
      icon: "power",
      k: `Added in ${newest.year}`,
      v: `${newest.addedMW}`,
      u: "MW",
      n: `Against ${prior.addedMW} MW in ${prior.year}. The build rate is ${(newest.addedMW / prior.addedMW).toFixed(1)} times what it was a year earlier, and still leaves every forecast a long way off.`,
    },
    {
      icon: "capital",
      k: "Market size",
      v: `${macro.market.currentBnUsd} to ${macro.market.forecastBnUsd}`,
      u: "bn USD",
      n: `${macro.market.currentYear} to ${macro.market.forecastYear}. ${macro.market.note}`,
    },
  ];

  return (
    <div className="mx-auto w-full min-w-0 max-w-6xl px-5">
      <section className="py-12 sm:py-16">
        <p className="sc text-accent">The sector</p>
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.08] tracking-tight sm:text-5xl">
          The forecasts disagree by {spread.spreadMultiple.toFixed(1)} times,
          <br />
          and they are counting the wrong thing.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          India&apos;s 2030 data centre capacity is projected at anywhere from {gw(spread.low.mw)}{" "}
          to {gw(spread.high.mwTop)} GW depending on which house you read. That spread is a finding
          rather than a number to average away. What none of them says is that the unit itself
          overstates: every one of these projections counts built capacity, and built capacity is
          not what earns.
        </p>

        <dl className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {tiles.map((t) => (
            <StatTile
              key={t.k}
              icon={t.icon}
              label={t.k}
              value={t.v}
              unit={t.u}
              note={t.n}
              tone={t.tone}
            />
          ))}
        </dl>
      </section>

      <section className="space-y-6 border-t border-line py-12">
        <Exhibit
          n={1}
          title={`Every 2030 forecast is stated in built capacity, and ${(conversion * 100).toFixed(0)} per cent of built capacity earns`}
          units={`Gigawatts. The pale bar is the forecast as published. The dark bar is the same forecast at the sold share measured from a filing, ${latest.label}.`}
          source={`Forecasts from the named research houses. The conversion is derived from the Sify Infinit Spaces prospectus, printed page ${sisl.sitesSource.page}.`}
        >
          <ForecastSpread
            rows={spread.rows}
            max={spread.max}
            currentMW={macro.capacity.current.mw}
            currentYear={macro.capacity.current.year}
            conversion={conversion}
          />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            {macro.capacity.unitNote} On the one Indian estate where a filing prints both numbers,{" "}
            <span className="tnum text-foreground">{latest.builtMW}</span> MW of built capacity
            carried <span className="tnum text-foreground">{latest.operationalMW}</span> MW sold to a
            customer. Applying that share is not a rival forecast. It is the same published numbers
            restated in the unit revenue would have to come from, and it moves the top of the range
            from <span className="tnum text-foreground">{gw(spread.high.mwTop)}</span> GW to{" "}
            <span className="tnum text-foreground">{gw(spread.high.soldMWTop)}</span>.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            One number is worth stopping on. Restated, the very top of the bull range lands at{" "}
            <span className="tnum text-foreground">{gw(spread.high.soldMWTop)}</span> GW, which is
            the same figure as the floor of that same bull range as published,{" "}
            <span className="tnum text-foreground">{gw(spread.high.mw)}</span> GW. The most
            optimistic case, counted in capacity that earns, arrives at the least optimistic case
            counted the way the industry counts. That is a coincidence of arithmetic rather than a
            result, and it is the clearest illustration on this site of how much the unit is doing.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            One estate is not a national conversion rate and this page does not claim it is. It is
            the only rate anybody has published a filing for, which is the more useful complaint: an
            entire sector is being sized in a unit whose conversion to revenue has been measured
            exactly once.{" "}
            <Link
              href="/company/SIFY"
              className="underline decoration-line underline-offset-4 hover:text-accent"
            >
              That estate is read here
            </Link>
            .
          </p>
        </Exhibit>

        <Exhibit
          n={2}
          title={`The most conservative forecast needs ${runRate.easiestMultiple.toFixed(1)} times the capacity India added in its record year`}
          units={`Megawatts a year. Straight line from ${macro.capacity.current.year} to each forecast's own horizon, against the megawatts actually added.`}
          source={`Forecast horizons as published. Capacity added by year from the build rate series, as at ${macro.asOf}.`}
        >
          <BuildRate
            rows={runRate.rows}
            actualAddedMW={newest.addedMW}
            actualYear={newest.year}
            priorAddedMW={prior.addedMW}
            priorYear={prior.year}
            max={runRate.max}
          />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            {newest.year} was the best year India has had. It added{" "}
            <span className="tnum text-foreground">{newest.addedMW}</span> MW,{" "}
            <span className="tnum text-foreground">
              {(newest.addedMW / prior.addedMW).toFixed(1)}
            </span>{" "}
            times the year before. It is still short of every forecast on this page. The least
            demanding of them, {runRate.rows[0].publisher}, needs{" "}
            <span className="tnum text-foreground">{Math.round(runRate.rows[0].perYear)}</span> MW
            every year from here, which is{" "}
            <span className="tnum text-foreground">{runRate.easiestMultiple.toFixed(1)}</span> times
            a record year, sustained for {runRate.rows[0].years}.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The straight line is deliberate. A ramp would move megawatts between years without
            changing the total, and the total is the claim. Nothing here says the forecasts are
            wrong. It says what would have to happen for them to be right, in the one unit the
            sector reports annually, and that the doubling already achieved is not the hard part.
          </p>
        </Exhibit>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Every capacity forecast on this page is a research house projection, tagged secondary, and is
        an ambition rather than a result. Sector figures as at {macro.asOf}. Educational and
        portfolio work, not investment advice.
      </footer>
    </div>
  );
}
