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
