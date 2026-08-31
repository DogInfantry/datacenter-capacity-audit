type Forecast = {
  publisher: string;
  mw: number;
  mwHigh: number | null;
  byYear: number;
  basis: string;
};

/**
 * The published 2030 capacity forecasts, and the same forecasts in the unit
 * that earns.
 *
 * Every house states its number in built capacity. This project has measured,
 * from a filing, what share of built capacity is actually sold to a customer on
 * the one Indian estate where both figures are printed. Applying that share is
 * not a forecast of its own: it is the same numbers restated in the unit the
 * revenue would have to come from. The conversion is passed in rather than held
 * here, so it stays tied to the filing it was read from.
 */
/**
 * What each forecast requires per year, against what the country actually
 * built last year.
 *
 * The arithmetic is deliberately the simplest possible: the gap between today
 * and the target, divided by the years available. No S curve, no ramp, no
 * assumption about when capacity lands. A smoother path would move megawatts
 * between years without changing the total, and the total is the point.
 */
export function requiredRunRate(
  forecasts: Forecast[],
  currentMW: number,
  currentYear: number,
  actualAddedMW: number,
) {
  const rows = forecasts
    .map((f) => {
      const years = f.byYear - currentYear;
      const perYear = (f.mw - currentMW) / years;
      const perYearTop = ((f.mwHigh ?? f.mw) - currentMW) / years;
      return {
        publisher: f.publisher,
        byYear: f.byYear,
        years,
        perYear,
        perYearTop,
        multiple: perYear / actualAddedMW,
        multipleTop: perYearTop / actualAddedMW,
      };
    })
    .sort((a, b) => a.perYear - b.perYear);

  return {
    rows,
    actualAddedMW,
    /** Even the least demanding forecast needs this multiple of last year. */
    easiestMultiple: rows[0].multiple,
    max: Math.max(...rows.map((r) => r.perYearTop), actualAddedMW),
  };
}

export function forecastSpread(forecasts: Forecast[], conversion: number) {
  const rows = [...forecasts]
    .sort((a, b) => a.mw - b.mw)
    .map((f) => ({
      ...f,
      /** The top of a band, or the point itself where no band was given. */
      mwTop: f.mwHigh ?? f.mw,
      soldMW: f.mw * conversion,
      soldMWTop: (f.mwHigh ?? f.mw) * conversion,
    }));

  const low = rows[0];
  const high = rows[rows.length - 1];

  return {
    rows,
    conversion,
    low,
    high,
    /** How far apart the houses are, at the widest reading of the range. */
    spreadMultiple: high.mwTop / low.mw,
    /** The scale for drawing: the widest number anybody published. */
    max: high.mwTop,
  };
}

type ReturnRow = {
  name: string;
  market: "DOMESTIC" | "GLOBAL";
  self: boolean;
  roce: (number | null)[];
  depreciationRate: (number | null)[];
};

/**
 * The peer benchmarking table, read against the claim made about it.
 *
 * The issuer states its return on capital is significantly higher than its
 * global peers. The same table carries five Indian operators, and the claim
 * says nothing about them. This computes both comparisons for every year, so
 * the page can put the claim beside the table it was drawn from.
 *
 * A year where an operator reported nothing is excluded from that year's
 * ranking rather than counted as a zero, which would invent a last place.
 */
export function peerReturns(rows: ReturnRow[], fiscalYears: string[]) {
  return fiscalYears.map((fy, i) => {
    const at = (r: ReturnRow) => r.roce[i];
    const reported = rows.filter((r) => at(r) !== null);
    const domestic = reported.filter((r) => r.market === "DOMESTIC");
    const global = reported.filter((r) => r.market === "GLOBAL");
    const self = rows.find((r) => r.self);
    const selfValue = self ? at(self) : null;
    const ranked = [...domestic].sort((a, b) => (at(b) as number) - (at(a) as number));
    const bestGlobal = global.length ? Math.max(...global.map((r) => at(r) as number)) : null;
    return {
      fy,
      domesticMean: domestic.length
        ? domestic.reduce((t, r) => t + (at(r) as number), 0) / domestic.length
        : null,
      domesticCount: domestic.length,
      selfValue,
      selfRank: self ? ranked.findIndex((r) => r.self) + 1 : 0,
      bestGlobal,
      /** False in any year the issuer's own table contradicts its claim. */
      beatsEveryGlobal: selfValue !== null && bestGlobal !== null ? selfValue > bestGlobal : null,
    };
  });
}

/** The years where the claim to beating every global peer does not hold. */
export function claimFailures(rows: ReturnRow[], fiscalYears: string[]) {
  return peerReturns(rows, fiscalYears).filter((y) => y.beatsEveryGlobal === false);
}

type Pledge = {
  firm: string;
  bnUsd: number;
  horizon: string;
  announcedSiteMW: number | null;
  note: string;
};

/**
 * The pledges, set only against quantities they can honestly be compared with.
 *
 * Money against money, megawatts against megawatts. Nothing here converts a
 * currency. The pledges are published in dollars and the capital requirement
 * below is published in rupees, and the rate that would join them is a figure
 * this project has not read, so the two stay in the units they arrived in. The
 * unit both halves of the page do share is the megawatt.
 *
 * Only one of the three announcements named a capacity, so `largest` is the
 * single site the capacity comparison can be built from, and the count that
 * named nothing is returned beside it rather than hidden.
 *
 * The stack offsets are computed here rather than in the component, because a
 * running total carried across a map during render is a React compiler error.
 */
export function pledgeScale(
  pledges: Pledge[],
  cumulativeBnUsd: number,
  marketBnUsd: number,
  currentMW: number,
) {
  const rows = [...pledges].sort((a, b) => b.bnUsd - a.bnUsd);

  const stacked = rows.reduce<
    { firm: string; bnUsd: number; from: number; to: number; horizon: string; note: string }[]
  >((acc, p) => {
    const from = acc.length ? acc[acc.length - 1].to : 0;
    acc.push({
      firm: p.firm,
      bnUsd: p.bnUsd,
      from,
      to: from + p.bnUsd,
      horizon: p.horizon,
      note: p.note,
    });
    return acc;
  }, []);
  const total = stacked.length ? stacked[stacked.length - 1].to : 0;

  const named = rows.filter((p) => p.announcedSiteMW !== null);
  const largest = named.length
    ? named.reduce((best, p) =>
        (p.announcedSiteMW as number) > (best.announcedSiteMW as number) ? p : best,
      )
    : null;

  return {
    rows,
    stacked,
    total,
    /** The money scale. Every bar in that panel is drawn against this. */
    max: Math.max(cumulativeBnUsd, total, marketBnUsd),
    cumulativeBnUsd,
    marketBnUsd,
    shareOfCumulative: total / cumulativeBnUsd,
    timesMarket: total / marketBnUsd,
    /** Dollars pledged for every gigawatt the country actually operates. */
    perGwLive: total / (currentMW / 1000),
    cumulativePerGwLive: cumulativeBnUsd / (currentMW / 1000),
    largest,
    largestSiteMW: largest ? (largest.announcedSiteMW as number) : null,
    largestSiteShare: largest ? (largest.announcedSiteMW as number) / currentMW : null,
    namedCount: named.length,
    unnamedCount: rows.length - named.length,
  };
}

/**
 * What each capacity forecast costs to build, in the unit the cost is published
 * in.
 *
 * A forecast states megawatts. Megawatts are bought at a price per megawatt.
 * Multiplying the two turns a capacity projection into a capital requirement,
 * which is the form in which a reader can judge whether it is plausible. It is
 * arithmetic on two published figures rather than a forecast of its own.
 *
 * The band is the published cost band, low cost against high cost. It is not an
 * uncertainty interval and does not widen with the horizon.
 *
 * The benchmark is passed in so the comparison stays in one currency. A dollar
 * figure cannot be drawn on this axis without an exchange rate, and there is
 * not one anywhere in this repository.
 */
export function capitalRequirement(
  forecasts: Forecast[],
  currentMW: number,
  crPerMwLow: number,
  crPerMwHigh: number,
  benchmarkCr: number,
) {
  const rows = [...forecasts]
    .sort((a, b) => a.mw - b.mw)
    .map((f) => {
      const addMW = f.mw - currentMW;
      const addMWTop = (f.mwHigh ?? f.mw) - currentMW;
      const crLow = addMW * crPerMwLow;
      const crHigh = addMWTop * crPerMwHigh;
      return {
        publisher: f.publisher,
        byYear: f.byYear,
        addMW,
        addMWTop,
        banded: f.mwHigh !== null,
        crLow,
        crHigh,
        /** One lakh crore is a hundred thousand crore. These figures run to
         *  several of them, and crore alone stops being readable. */
        lakhCrLow: crLow / 1e5,
        lakhCrHigh: crHigh / 1e5,
        timesBenchmark: crLow / benchmarkCr,
      };
    });

  return {
    rows,
    max: Math.max(...rows.map((r) => r.crHigh)),
    benchmarkCr,
    benchmarkLakhCr: benchmarkCr / 1e5,
    crPerMwLow,
    crPerMwHigh,
    cheapest: rows[0],
  };
}
