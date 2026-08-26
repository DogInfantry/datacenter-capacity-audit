import { z } from "zod";
import { BaseRate, Campus } from "./schema";
import baseRateRaw from "@/data/base_rate.json";
import campusesRaw from "@/data/campuses.json";

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

/** Announced minus live, the number the whole project exists to keep visible. */
export function gapMW(c: Campus) {
  return c.announcedMW.value - c.liveMW.value;
}

/** Delivered share of what was announced. Null when nothing is announced. */
export function deliveredShare(c: Campus) {
  return c.announcedMW.value > 0 ? c.liveMW.value / c.announcedMW.value : null;
}
