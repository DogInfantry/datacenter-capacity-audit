/**
 * The company's stated schedule, against the grid's record of running late.
 *
 * This is the one exhibit where all three registers meet. The prospectus says
 * when the money lands. The Ministry of Power's own tabling of its late
 * transmission projects says how far a large infrastructure schedule typically
 * slips. Putting them on one axis is the whole thesis.
 *
 * What it is not: a forecast of how late these towers will be. The base rate
 * measures inter state transmission, not data centre construction, and
 * pretending otherwise would be exactly the error this project exists to point
 * at. A campus interconnects through transmission, and the prospectus itself
 * describes an on site 230 kV substation at Chennai 02 on printed page 111, so
 * the band is the interconnection delay the schedule is exposed to. That
 * distinction is carried in data as `scheduleBasis`, not in prose, because
 * prose drifts and a required field does not.
 *
 * Arithmetic is done in whole months from an anchor rather than with dates.
 * Month counting is exact; date arithmetic across month lengths is not, and
 * this project already carries a gotcha about trusting period labels.
 */

/** October 2025, the month the prospectus is dated. The axis starts here. */
export const ANCHOR = { year: 2025, month: 10 } as const;

export function monthsFromAnchor(year: number, month: number) {
  return (year - ANCHOR.year) * 12 + (month - ANCHOR.month);
}

/**
 * Indian fiscal years end on 31 March and are named for the calendar year they
 * end in. Fiscal 2029 runs April 2028 to March 2029.
 */
export const fiscalYearEndMonth = (fy: number) => monthsFromAnchor(fy, 3);
export const fiscalYearStartMonth = (fy: number) => monthsFromAnchor(fy - 1, 4);

const FISCALS = [2027, 2028, 2029] as const;

type ObjectRow = {
  object: string;
  fiscal2027: number;
  fiscal2028: number;
  fiscal2029: number;
};

/**
 * The span an object's money actually occupies.
 *
 * An object with nothing scheduled in a year does not stretch to cover it. The
 * debt repayment sits in Fiscal 2027 alone and is drawn that way.
 */
export function objectWindow(row: ObjectRow) {
  const funded = FISCALS.filter((fy) => row[`fiscal${fy}` as keyof ObjectRow]);
  if (funded.length === 0) return null;
  const firstFy = funded[0];
  const lastFy = funded[funded.length - 1];
  return {
    firstFy,
    lastFy,
    start: fiscalYearStartMonth(firstFy),
    end: fiscalYearEndMonth(lastFy),
  };
}

export type Slip = { key: string; label: string; months: number; at: number };

/**
 * Where the stated end lands after the observed slippage.
 *
 * The rates are passed in rather than hardcoded, so a pipeline refresh of
 * `data/base_rate.json` moves the chart. A chart that hardcodes 13.7 months has
 * quietly stopped being a measurement and become an illustration.
 */
export function slipBand(
  endMonth: number,
  base: {
    median_months: number;
    cost_weighted_mean_months: number;
    p90_months: number;
  },
): Slip[] {
  return [
    {
      key: "median",
      label: "median",
      months: base.median_months,
      at: endMonth + base.median_months,
    },
    {
      key: "costWeighted",
      label: "cost weighted",
      months: base.cost_weighted_mean_months,
      at: endMonth + base.cost_weighted_mean_months,
    },
    {
      key: "p90",
      label: "90th percentile",
      months: base.p90_months,
      at: endMonth + base.p90_months,
    },
  ];
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** A month offset rendered back into a readable calendar label. */
export function monthLabel(m: number) {
  const total = ANCHOR.month - 1 + Math.round(m);
  const year = ANCHOR.year + Math.floor(total / 12);
  return `${MONTHS[((total % 12) + 12) % 12]} ${year}`;
}
