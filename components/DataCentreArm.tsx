import { Icon, Pictogram, StatTile } from "./Visual";

/**
 * One square in a hundred.
 *
 * The pictogram is the whole exhibit. A percentage is a word, and one point
 * zero per cent read as a word slides past a reader who has just been told this
 * company operates 28 MW of data centre capacity. Ninety nine empty squares do
 * not slide past.
 *
 * The three tiles beneath it are the same subsidiary from the other angles the
 * report gives: what it earned, what it made, and what it is worth. Each
 * carries the printed page it came from, because two separate pages print this
 * company and they agree.
 */
export function DataCentreArm({
  entity,
  holdingPct,
  turnover,
  groupRevenue,
  turnoverSharePct,
  pat,
  groupPat,
  netAssets,
  totalAssets,
  totalLiabilities,
  subsidiaryPage,
  groupTablePage,
  unit,
  fiscalYear,
}: {
  entity: string;
  holdingPct: number;
  turnover: number;
  groupRevenue: number;
  turnoverSharePct: number;
  pat: number;
  groupPat: number;
  netAssets: number;
  totalAssets: number;
  totalLiabilities: number;
  subsidiaryPage: number;
  groupTablePage: number;
  unit: string;
  fiscalYear: string;
}) {
  const n = (v: number) => Math.abs(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });
  const signed = (v: number) => `${v < 0 ? "minus " : ""}${n(v)}`;

  return (
    <div className="space-y-6">
      <Pictogram
        filledPct={turnoverSharePct}
        filledLabel={`from ${entity}`}
        emptyLabel="from everything else the group does"
        columns={20}
        unit="rupees of group revenue"
      />

      <dl className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
        <StatTile
          icon="capital"
          label={`Turnover, ${fiscalYear}`}
          value={n(turnover)}
          unit={unit}
          note={`${turnoverSharePct.toFixed(1)} per cent of the group's ${n(groupRevenue)}. Printed page ${subsidiaryPage}.`}
        />
        <StatTile
          icon="warning"
          label="Result for the year"
          value={signed(pat)}
          unit={unit}
          note={`The group made ${n(groupPat)} in the same year. Printed pages ${subsidiaryPage} and ${groupTablePage}, which agree.`}
          tone="signal"
        />
        <StatTile
          icon="datacentre"
          label="Net assets"
          value={signed(netAssets)}
          unit={unit}
          note={`Total assets ${n(totalAssets)} against liabilities of ${n(totalLiabilities)}. Wholly owned, ${holdingPct} per cent.`}
          tone="signal"
        />
      </dl>

      <p className="flex gap-1.5 border-t border-line pt-4 text-xs leading-relaxed text-muted">
        <span className="mt-0.5 shrink-0">
          <Icon name="warning" size={13} />
        </span>
        <span>
          Figures are the subsidiary&apos;s own, not an allocation. They appear in the statement of
          subsidiaries and again in the consolidated entity table, and the two agree to the paisa.
          Neither appears in the group income statement, which reports one segment.
        </span>
      </p>
    </div>
  );
}
