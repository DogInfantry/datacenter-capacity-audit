import type { RegisterCompany, RegisterRefusal } from "@/lib/schema";

/**
 * How often a company declines to put a number on its own unit economics.
 *
 * The numerator is deliberately narrow. `partial` is an answer, just an
 * incomplete one, and folding it into the numerator would let the measure say
 * whatever the author wanted. Only `declined` and `deflected` count as a
 * refusal.
 *
 * The denominator is every question asked in the same two topic families, for
 * every company, over the same window. That partition is the whole reason this
 * is a rate rather than a handful of examples: a keyword search for "revenue
 * per megawatt" would find only the questions phrased that way, and the
 * denominator would then be a property of the search rather than of the calls.
 */
export type Rate = {
  pressed: number;
  refused: number;
  partial: number;
  confirmed: number;
  /** Never shown on its own. A rate without its denominator is decoration. */
  rate: number;
};

export function refusalRate(c: RegisterCompany): Rate {
  const sum = (k: "confirmed" | "partial" | "deflected" | "declined") =>
    c.families.reduce((s, f) => s + f[k], 0);
  const refused = sum("deflected") + sum("declined");
  return {
    pressed: c.pressed,
    refused,
    partial: sum("partial"),
    confirmed: sum("confirmed"),
    rate: c.pressed > 0 ? refused / c.pressed : 0,
  };
}

/**
 * The second dimension, and the one to be careful about.
 *
 * A refusal that points at a published document is ordinary investor relations
 * practice. A refusal that points nowhere is a disclosure gap. But this can
 * only be coded from what management actually said on the call, so
 * `namedNoSource` means no source was named out loud. It is not evidence that
 * the figure is unpublished, and the site must not present it as such.
 */
export function publishedElsewhereSplit(refusals: RegisterRefusal[]) {
  const named = refusals.filter((r) => r.publishedElsewhere);
  return {
    namedASource: named.length,
    namedNoSource: refusals.length - named.length,
    total: refusals.length,
    pointers: named,
  };
}

/** How often analysts press at all, per call. Coverage differs sharply. */
export function pressurePerCall(c: RegisterCompany) {
  return { pressed: c.pressed, calls: c.callsCovered, perCall: c.pressed / c.callsCovered };
}
