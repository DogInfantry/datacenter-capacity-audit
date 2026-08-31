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
