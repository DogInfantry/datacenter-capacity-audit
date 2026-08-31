import type { Metadata } from "next";
import Link from "next/link";
import { macro, sisl } from "@/lib/data";
import {
  forecastSpread,
  requiredRunRate,
  peerReturns,
  claimFailures,
  pledgeScale,
  capitalRequirement,
} from "@/lib/diagnostics/macro";
import { Exhibit } from "@/components/Exhibits";
import { ForecastSpread } from "@/components/ForecastSpread";
import { BuildRate } from "@/components/BuildRate";
import { PeerReturns } from "@/components/PeerReturns";
import { DeploymentLedger } from "@/components/DeploymentLedger";
import { HyperscalerPledges } from "@/components/HyperscalerPledges";
import { PowerAndCapital } from "@/components/PowerAndCapital";
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

  const ret = macro.operatorReturns;
  // The peer table is the only primary source on this page, so both the ranking
  // and the check against the issuer's own claim are derived rather than read.
  const peers = peerReturns(ret.rows, ret.fiscalYears);
  const failures = claimFailures(ret.rows, ret.fiscalYears);

  const ai = macro.indiaAI;
  const aiCount = (st: string) => ai.providers.filter((p) => p.status === st).length;

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

  // Three announcements, one country. The pledges are compared with money and
  // the one announcement that named a capacity is compared with capacity.
  const hs = macro.hyperscalers;
  const pledges = pledgeScale(
    hs.pledges,
    hs.cumulative.bnUsd,
    macro.market.currentBnUsd,
    macro.capacity.current.mw,
  );

  // The same forecasts as the first exhibit, priced at the published build cost
  // and set against the outlay of the government scheme in exhibit four.
  const pw = macro.power;
  const ue = macro.unitEconomics;
  const capital = capitalRequirement(
    macro.capacity.forecasts,
    macro.capacity.current.mw,
    ue.capexCrPerMW.low,
    ue.capexCrPerMW.high,
    ai.outlayCr,
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
    {
      icon: "contract",
      k: "Pledged by three firms",
      v: `${pledges.total.toFixed(1)}`,
      u: "bn USD",
      n: `${pledges.rows.map((p) => p.firm).join(", ")}, on horizons of four to five years, against a market that turned over ${macro.market.currentBnUsd} bn USD in ${macro.market.currentYear}.`,
    },
    {
      icon: "grid",
      k: `Grid demand by ${pw.targetLabel}`,
      v: `${pw.targetGw}`,
      u: "GW",
      n: `Against about ${pw.currentGw} GW drawn today, on the ${pw.estimator} estimate. Electricity is what has to arrive before a megawatt earns.`,
      tone: "signal",
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

        <dl className="mt-8 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
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
            result, and it is the clearest measure of how much work the unit is doing.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            One estate is not a national conversion rate. It is the only rate anybody has published
            a filing for, which is the more useful complaint: an
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

        <Exhibit
          n={3}
          title={`Every Indian operator earned less on its capital in ${peers[1].fy} than in ${peers[0].fy}`}
          units="Return on capital employed, per cent, on the definition printed in the source. Indian operators solid, global operators dashed. A gap in a line is a year an operator did not report, never a zero."
          source={ret.source.label}
          page={ret.source.page}
        >
          <PeerReturns rows={ret.rows} fiscalYears={ret.fiscalYears} />

          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            All <span className="tnum text-foreground">{peers[0].domesticCount}</span> Indian
            operators in the table fell between {peers[0].fy} and {peers[1].fy}. The average went
            from <span className="tnum text-foreground">{peers[0].domesticMean?.toFixed(2)}</span>{" "}
            per cent to{" "}
            <span className="tnum text-foreground">{peers[1].domesticMean?.toFixed(2)}</span>, a drop
            of{" "}
            <span className="tnum text-foreground">
              {(100 - ((peers[1].domesticMean ?? 0) / (peers[0].domesticMean ?? 1)) * 100).toFixed(0)}
            </span>{" "}
            per cent in a single year, while the largest global operator moved the other way. Capital
            is going in faster than it is coming back out, across the whole Indian set rather than at
            one company.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The issuer&apos;s own summary of this table, at printed page{" "}
            <span className="tnum">{ret.claim.page}</span>, reads:{" "}
            <span className="text-foreground">&ldquo;{ret.claim.quote}&rdquo;</span> The comparison
            is to global peers. Against the Indian operators printed directly above them it ranks{" "}
            <span className="tnum text-foreground">{peers[0].selfRank}</span> of{" "}
            <span className="tnum text-foreground">{peers[0].domesticCount}</span> in {peers[0].fy}{" "}
            and <span className="tnum text-foreground">{peers[1].selfRank}</span> of{" "}
            <span className="tnum text-foreground">{peers[1].domesticCount}</span> in {peers[1].fy}.
            {failures.length > 0 && (
              <>
                {" "}
                In {failures.map((f) => f.fy).join(" and ")} it did not beat every global peer
                either:{" "}
                <span className="tnum text-foreground">{failures[0].selfValue?.toFixed(2)}</span>{" "}
                against{" "}
                <span className="tnum text-foreground">{failures[0].bestGlobal?.toFixed(2)}</span>.
              </>
            )}
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The source gives a reason on the same page:{" "}
            <span className="text-foreground">&ldquo;{ret.issuerReason.quote}&rdquo;</span> Heavy
            depreciation in a build phase does suppress the ratio, and it is the honest explanation
            for a low reading. It is also the explanation every operator in the Indian half of this
            table could give.
          </p>
        </Exhibit>

        <Exhibit
          n={4}
          title={`A government scheme gave ${ai.providers.length} providers the same deadline, and ${aiCount("NOT_STATED")} of them have no public delivery record at all`}
          units={`Empanelled cloud providers under the IndiaAI Mission, grouped by what has been reported about deployment. Outlay ${ai.outlayCr.toLocaleString("en-IN")} crore.`}
          source={ai.source.label}
        >
          <DeploymentLedger
            providers={ai.providers}
            gpusInstalled={ai.gpusInstalled}
            installedQualifier={ai.installedQualifier}
            installedAsOf={ai.installedAsOf}
          />

          <p className="mt-5 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            This is the clearest place in the sector to watch an announcement separate from a
            delivery, because every one of these providers accepted the same terms on the same date.{" "}
            <span className="tnum text-foreground">{aiCount("MOVED")}</span> are reported as
            deploying and <span className="tnum text-foreground">{aiCount("LAGGED")}</span> as
            behind, and the two behind are among the largest names on the list. Size did not predict
            delivery here, which is the result the capacity pages reach from the other direction.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            The largest group is the one nobody has reported on. For{" "}
            <span className="tnum text-foreground">{aiCount("NOT_STATED")}</span> of the{" "}
            <span className="tnum text-foreground">{ai.providers.length}</span> there is no public
            statement either way, which is a fact about the scheme&apos;s reporting rather than about
            those providers, so they are grouped by what was reported and not ranked against each other.
          </p>
        </Exhibit>

        <Exhibit
          n={5}
          title={`Three firms have pledged ${pledges.timesMarket.toFixed(1)} times what the market they are pledging into earns in a year`}
          units={`Billions of US dollars above, megawatts below. The two panels are separate scales in different units and nothing is drawn across them.`}
          source={`${hs.source.label} Cumulative commitment from ${hs.cumulative.source.label}. National capacity from ${macro.capacity.current.source.label}.`}
        >
          <HyperscalerPledges
            stacked={pledges.stacked}
            total={pledges.total}
            max={pledges.max}
            cumulativeBnUsd={hs.cumulative.bnUsd}
            cumulativeFromYear={hs.cumulative.fromYear}
            cumulativeToLabel={hs.cumulative.toLabel}
            marketBnUsd={macro.market.currentBnUsd}
            marketYear={macro.market.currentYear}
            currentMW={macro.capacity.current.mw}
            currentYear={macro.capacity.current.year}
            siteFirm={pledges.largest ? pledges.largest.firm : null}
            siteMW={pledges.largestSiteMW}
            unnamedCount={pledges.unnamedCount}
          />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            Microsoft, Google and AWS have between them pledged{" "}
            <span className="tnum text-foreground">{pledges.total.toFixed(1)}</span> billion dollars
            to Indian data centres. The market they are pledging into turned over{" "}
            <span className="tnum text-foreground">{macro.market.currentBnUsd}</span> billion in{" "}
            {macro.market.currentYear}. Those pledges sit inside{" "}
            <span className="tnum text-foreground">{hs.cumulative.bnUsd}</span> billion committed by
            every investor since {hs.cumulative.fromYear}, so three foreign firms account for{" "}
            <span className="tnum text-foreground">
              {(pledges.shareOfCumulative * 100).toFixed(0)}
            </span>{" "}
            per cent of everything the sector has been promised in six years.
          </p>
          {pledges.largest && pledges.largestSiteShare !== null && (
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Only one of the three attached a capacity to the money. {pledges.largest.firm} put{" "}
              <span className="tnum text-foreground">
                {(pledges.largestSiteMW as number).toLocaleString("en-IN")}
              </span>{" "}
              MW on the first phase of a single site at Visakhapatnam. India operates{" "}
              <span className="tnum text-foreground">
                {macro.capacity.current.mw.toLocaleString("en-IN")}
              </span>{" "}
              MW in total. One announced phase of one campus is{" "}
              <span className="tnum text-foreground">
                {(pledges.largestSiteShare * 100).toFixed(0)}
              </span>{" "}
              per cent of a national estate that took two decades to build, and it is announced
              rather than built. The other {pledges.unnamedCount} pledges name no capacity at all,
              which means the largest numbers in this sector are denominated in a unit that cannot
              be checked against anything that exists.
            </p>
          )}
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Per gigawatt actually running, the pledges come to{" "}
            <span className="tnum text-foreground">{pledges.perGwLive.toFixed(0)}</span> billion
            dollars, and the whole sector commitment to{" "}
            <span className="tnum text-foreground">
              {pledges.cumulativePerGwLive.toFixed(0)}
            </span>
            . Capital is not what the sector is short of.{" "}
            <Link
              href="/universe"
              className="underline decoration-line underline-offset-4 hover:text-accent"
            >
              The listed names sit here
            </Link>
            , and none of them is the counterparty to any of these three announcements.
          </p>
        </Exhibit>

        <Exhibit
          n={6}
          title={`The grid is asked to carry ${(pw.targetGw / pw.currentGw).toFixed(1)} times today's data centre demand by ${pw.targetLabel}`}
          units={`Gigawatts above, lakh crore rupees below. Grid demand and built IT load capacity are different quantities and are not converted into one another.`}
          source={`Demand from ${pw.source.label} Build cost and cost split from ${ue.source.label} Scheme outlay from ${ai.source.label}`}
        >
          <PowerAndCapital
            currentGw={pw.currentGw}
            targetGw={pw.targetGw}
            targetLabel={pw.targetLabel}
            estimator={pw.estimator}
            builtCurrentGw={macro.capacity.current.mw / 1000}
            builtCurrentYear={macro.capacity.current.year}
            forecastLowGw={spread.low.mw / 1000}
            forecastHighGw={spread.high.mwTop / 1000}
            capital={capital}
            capexLow={ue.capexCrPerMW.low}
            capexHigh={ue.capexCrPerMW.high}
            capexSourceLabel={ue.capexSourceLabel}
            benchmarkLabel={`IndiaAI Mission, whole outlay`}
            marginLow={ue.ebitdaMarginPct.low}
            marginHigh={ue.ebitdaMarginPct.high}
            marginStable={ue.ebitdaMarginPct.stabilising}
            powerShare={ue.powerShareOfOpexPct}
          />

          <p className="mt-6 border-t border-line pt-4 text-sm leading-relaxed text-muted">
            The {pw.estimator} puts data centre electricity demand at{" "}
            <span className="tnum text-foreground">{pw.targetGw}</span> GW by {pw.targetLabel},
            against about <span className="tnum text-foreground">{pw.currentGw}</span> GW today. That
            is <span className="tnum text-foreground">{(pw.targetGw / pw.currentGw).toFixed(1)}</span>{" "}
            times in six years, and it is a different measurement from the capacity forecasts in the
            first exhibit: this is what the buildings draw from the grid, those are what the servers
            inside them are rated for. Both are rising by an order of magnitude and neither is
            delivered by an announcement.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Priced at the published build cost of{" "}
            <span className="tnum text-foreground">{ue.capexCrPerMW.low}</span> to{" "}
            <span className="tnum text-foreground">{ue.capexCrPerMW.high}</span> crore rupees a
            megawatt, the most conservative forecast on this page needs{" "}
            <span className="tnum text-foreground">
              {capital.cheapest.addMW.toLocaleString("en-IN")}
            </span>{" "}
            MW of new capacity costing{" "}
            <span className="tnum text-foreground">{capital.cheapest.lakhCrLow.toFixed(1)}</span> to{" "}
            <span className="tnum text-foreground">{capital.cheapest.lakhCrHigh.toFixed(1)}</span>{" "}
            lakh crore. The IndiaAI Mission, the country&apos;s flagship programme for this
            technology and the scheme in the exhibit above, has a total outlay of{" "}
            <span className="tnum text-foreground">{ai.outlayCr.toLocaleString("en-IN")}</span>{" "}
            crore. The base case alone costs{" "}
            <span className="tnum text-foreground">
              {capital.cheapest.timesBenchmark.toFixed(0)}
            </span>{" "}
            times the whole mission, and it is the red rule at the foot of the chart.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Electricity is{" "}
            <span className="tnum text-foreground">{ue.powerShareOfOpexPct}</span> per cent of what
            these operators spend to run, on a stabilised margin near{" "}
            <span className="tnum text-foreground">{ue.ebitdaMarginPct.stabilising}</span> per cent.
            The single largest recurring cost is the one input that cannot be commissioned by
            writing a cheque, and the transmission that carries it has a measured delay record of
            its own,{" "}
            <Link
              href="/offer"
              className="underline decoration-line underline-offset-4 hover:text-accent"
            >
              drawn against one company&apos;s deployment schedule here
            </Link>
            .
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
