import { z } from "zod";
import { BaseRate, CapacityLadder, Campus } from "./schema";
import baseRateRaw from "@/data/base_rate.json";
import campusesRaw from "@/data/campuses.json";
import sifyRaw from "@/data/sify_capacity.json";

/** Fail the build loudly, with the path to the offending field. */
function parse<T extends z.ZodTypeAny>(schema: T, raw: unknown, what: string): z.infer<T> {
  const r = schema.safeParse(raw);
  if (!r.success) {
    throw new Error(
      `${what} failed validation:\n` +
        r.error.issues.map((i) => `  ${i.path.join(".") || "(root)"}: ${i.message}`).join("\n"),
    );
  }
  return r.data;
}

export const baseRate = parse(BaseRate, baseRateRaw, "data/base_rate.json");
export const campuses = parse(z.array(Campus).min(1), campusesRaw, "data/campuses.json");
export const sify = parse(CapacityLadder, sifyRaw, "data/sify_capacity.json");

/** Announced minus live, the number the whole project exists to keep visible. */
export function gapMW(c: Campus) {
  return c.announcedMW.value - c.liveMW.value;
}

/** Delivered share of what was announced. Null when nothing is announced. */
export function deliveredShare(c: Campus) {
  return c.announcedMW.value > 0 ? c.liveMW.value / c.announcedMW.value : null;
}

/** Ordered by calendar date, because the fiscal labels upstream are inconsistent. */
export function ladder(l: CapacityLadder) {
  return [...l.observations].sort((a, b) => a.date.localeCompare(b.date));
}

/** Delivered against promised, for a claim that has been graded. */
export function claimGap(l: CapacityLadder, madeOn: string) {
  const obs = ladder(l);
  const at = (d: string) =>
    [...obs].reverse().find((o) => o.date <= d)?.commissioned_mw ?? null;
  const c = l.claims.find((x) => x.made_on === madeOn);
  if (!c) return null;
  const start = at(c.made_on);
  const end = at(c.horizon_end);
  return start !== null && end !== null
    ? { promised: c.value, delivered: end - start, start, end }
    : null;
}
