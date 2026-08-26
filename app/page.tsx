import { Cite } from "@/components/Cite";
import { baseRate, campuses, gapMW } from "@/lib/data";

const psu = baseRate.by_ownership.CENTRAL_PSU;
const priv = baseRate.by_ownership.PRIVATE_TSP;

const fmt = (n: number) => n.toLocaleString("en-IN");

/** Crore figures are rounded. Paise on a Rs 25,000 crore total is precision
 *  the underlying tabling does not carry, and this project argues against
 *  exactly that. */
const cr = (n: number) => Math.round(n).toLocaleString("en-IN");

export default function Home() {
  const announced = campuses.reduce((s, c) => s + c.announcedMW.value, 0);
  const live = campuses.reduce((s, c) => s + c.liveMW.value, 0);
  const ratio = (
    priv.cost_weighted_mean_months! / psu.cost_weighted_mean_months!
  ).toFixed(1);

  return (
    <div className="mx-auto max-w-5xl px-5">
      <section className="py-16 sm:py-24">
        <p className="sc text-accent">The Gigawatt Gap</p>
        <h1 className="mt-5 max-w-3xl font-serif text-4xl leading-[1.1] tracking-tight sm:text-5xl">
          India announced a gigawatt data centre buildout. The grid decides how
          much of it lands.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
          Announcements are measured in gigawatts. Delivery is measured in
          megawatts. Most analysis of that gap argues about company intent. This
          one measures the infrastructure instead, starting with how late Indian
          transmission actually runs, according to the Ministry of Power&apos;s
          own record.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">The finding</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Inter-state transmission slips a cost weighted{" "}
          <span className="tnum text-accent">
            {baseRate.cost_weighted_mean_months} months
          </span>
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          Across {baseRate.n} delayed inter-state transmission projects worth ₹
          {cr(baseRate.total_approved_cost_cr)} crore, the median slip is{" "}
          <span className="tnum">{baseRate.median_months} months</span>. Weight
          by approved cost and it nearly doubles, to{" "}
          <span className="tnum">{baseRate.cost_weighted_mean_months}</span>.
          Large projects slip harder than small ones, and a gigawatt scale
          campus needs a large project.
        </p>

        <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-sm border border-line bg-line sm:grid-cols-4">
          {[
            ["Median slip", baseRate.median_months + " mo"],
            ["Cost weighted", baseRate.cost_weighted_mean_months + " mo"],
            ["90th percentile", baseRate.p90_months + " mo"],
            [
              "Slip past a year",
              Math.round(baseRate.share_over_12_months * 100) + "%",
            ],
          ].map(([k, v]) => (
            <div key={k} className="bg-card p-4">
              <dt className="text-xs text-muted">{k}</dt>
              <dd className="mt-1 font-serif text-2xl tnum">{v}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-4 text-xs leading-relaxed text-muted">
          Source: {baseRate.source.title}. {baseRate.source.publisher},{" "}
          {baseRate.source.question}.{" "}
          <a
            className="underline decoration-line underline-offset-2 hover:text-accent"
            href={baseRate.source.url}
          >
            data.gov.in resource
          </a>
          .
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Read it as a floor</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Every project on this list was still running
        </h2>
        <p className="mt-4 max-w-2xl leading-relaxed text-muted">
          The list records projects that were ongoing and already late when the
          answer was tabled. The delay recorded against each one is the slip{" "}
          <em>anticipated at that moment</em>, not the slip finally realised.
          Every observation is right censored, so the true figure is at least
          this large and probably larger. That cuts in favour of the argument
          made here, which is why it is stated plainly rather than buried.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">Who is late</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          Private developers slip about {ratio} times harder than the state
          utility
        </h2>

        <div className="mt-8 space-y-5">
          <OwnershipBar
            label="Power Grid, the central utility"
            months={psu.cost_weighted_mean_months!}
            n={psu.n}
            cost={psu.approved_cost_cr}
            max={baseRate.max_months}
            colour="bg-psu"
          />
          <OwnershipBar
            label="Private transmission developers"
            months={priv.cost_weighted_mean_months!}
            n={priv.n}
            cost={priv.approved_cost_cr}
            max={baseRate.max_months}
            colour="bg-private"
          />
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          <strong className="text-foreground">
            This cut is thin and it is labelled thin.
          </strong>{" "}
          Seven private projects, three of them under one group. That is enough
          to raise the question of whether ownership predicts delivery, and not
          enough to answer it. Widening the sample from the National Electricity
          Plan and Grid-India monthly reports is the next piece of work, and the
          claim moves only if the wider sample agrees.
        </p>
      </section>

      <section className="border-t border-line py-14">
        <p className="sc text-accent">The ledger, first three rows</p>
        <h2 className="mt-3 font-serif text-3xl tracking-tight">
          <span className="tnum">{fmt(announced)} MW</span> announced,{" "}
          <span className="tnum">{fmt(live)} MW</span> live
        </h2>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[42rem] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="py-2 pr-4 font-medium">Campus</th>
                <th className="py-2 pr-4 font-medium">State</th>
                <th className="py-2 pr-4 text-right font-medium">Live MW</th>
                <th className="py-2 pr-4 text-right font-medium">Handed over</th>
                <th className="py-2 pr-4 text-right font-medium">
                  Announced MW
                </th>
                <th className="py-2 text-right font-medium">Gap</th>
              </tr>
            </thead>
            <tbody>
              {campuses.map((c) => (
                <tr key={c.id} className="border-b border-line align-top">
                  <td className="py-3 pr-4">
                    <span className="font-medium">{c.operator}</span>
                    <span className="block text-xs text-muted">
                      {c.site} · {c.location.precision.toLowerCase()} precision
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted">{c.state}</td>
                  <td className="py-3 pr-4 text-right tnum">
                    {c.liveMW.value}
                    <Cite source={c.liveMW.source} />
                  </td>
                  <td className="py-3 pr-4 text-right tnum">
                    {c.handedOverMW ? (
                      <>
                        {c.handedOverMW.value}
                        <Cite source={c.handedOverMW.source} />
                      </>
                    ) : (
                      <span className="text-muted">not disclosed</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-right tnum">
                    {fmt(c.announcedMW.value)}
                    <Cite source={c.announcedMW.source} />
                  </td>
                  <td className="py-3 text-right tnum text-accent">
                    {fmt(gapMW(c))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          Hover any tag to see where a number came from and how far it has been
          checked. Most of these are <em>unverified</em>, carried in from
          research notes and not yet traced to a filing. A ledger about
          overconfident reporting does not get to be overconfident about itself.
        </p>
      </section>

      <footer className="border-t border-line py-10 text-xs leading-relaxed text-muted">
        Educational and portfolio work. Not investment advice, not a research
        product, and not affiliated with any company named. Figures marked
        unverified have not been traced to a primary filing.
      </footer>
    </div>
  );
}

function OwnershipBar({
  label,
  months,
  n,
  cost,
  max,
  colour,
}: {
  label: string;
  months: number;
  n: number;
  cost: number;
  max: number;
  colour: string;
}) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
        <span>{label}</span>
        <span className="tnum text-xs text-muted">
          {months} mo cost weighted · n={n} · ₹{cr(cost)} cr
        </span>
      </div>
      <div className="mt-2 h-3 w-full rounded-sm bg-accent-soft">
        <div
          className={"h-3 rounded-sm " + colour}
          style={{ width: (months / max) * 100 + "%" }}
        />
      </div>
    </div>
  );
}
