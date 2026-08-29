import type { ReactNode } from "react";

/**
 * The infographic vocabulary: icons, company marks, pictograms and icon-led stat
 * tiles. Everything here is drawn as inline SVG in the site palette.
 *
 * Nothing is fetched. No external asset, no trademark exposure, one coherent
 * visual system rather than four company house styles fighting the palette, and
 * it all survives the print route and the PDF export.
 */

export type IconName =
  | "datacentre"
  | "power"
  | "contract"
  | "client"
  | "grid"
  | "capital"
  | "clock"
  | "warning";

const PATHS: Record<IconName, ReactNode> = {
  datacentre: (
    <>
      <rect x="4" y="4" width="16" height="5" rx="1" />
      <rect x="4" y="12" width="16" height="5" rx="1" />
      <path d="M7.5 6.5h.01M7.5 14.5h.01" />
    </>
  ),
  power: <path d="M13 2 5 13h6l-1 9 8-11h-6l1-9Z" />,
  contract: (
    <>
      <path d="M6 2h8l4 4v16H6z" />
      <path d="M14 2v4h4M9 12h6M9 16h4" />
    </>
  ),
  client: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5 20a7 7 0 0 1 14 0" />
    </>
  ),
  grid: (
    <>
      <path d="M12 3v18M4 8h16M4 16h16" />
      <circle cx="12" cy="8" r="1.6" />
      <circle cx="12" cy="16" r="1.6" />
    </>
  ),
  capital: <path d="M3 20h18M6 20v-7M11 20V8M16 20v-4M21 20V4" />,
  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5.5l3.5 2" />
    </>
  ),
  warning: (
    <>
      <path d="M12 3 2.5 20h19L12 3Z" />
      <path d="M12 10v4.5M12 17.5h.01" />
    </>
  ),
};

export function Icon({
  name,
  size = 20,
  className = "",
}: {
  name: IconName;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      focusable="false"
      className={className}
    >
      {PATHS[name]}
    </svg>
  );
}

/**
 * Company marks, drawn rather than fetched.
 *
 * A monogram plus a fixed step off this site's ramp, so the four operators are
 * separable at a glance without reproducing anybody's trademark. The letters
 * come from the company name; the colour is ours, not theirs.
 */
const MARKS: Record<string, { short: string; tone: string }> = {
  "Sify Infinit Spaces": { short: "SI", tone: "var(--accent-deep)" },
  NEXTDC: { short: "NX", tone: "var(--accent)" },
  "Digital Realty": { short: "DR", tone: "var(--rung-2)" },
  Equinix: { short: "EQ", tone: "var(--rung-1)" },
};

export function Monogram({ name, size = 26 }: { name: string; size?: number }) {
  const m = MARKS[name] ?? { short: name.slice(0, 2).toUpperCase(), tone: "var(--muted)" };
  return (
    <span
      aria-hidden
      className="inline-flex shrink-0 items-center justify-center rounded-[5px] font-mono font-semibold"
      style={{
        width: size,
        height: size,
        background: m.tone,
        color: "var(--on-accent)",
        fontSize: size * 0.4,
        letterSpacing: "0.02em",
      }}
    >
      {m.short}
    </span>
  );
}

/**
 * A hundred squares, filled to a share.
 *
 * A percentage is a word. A hundred squares with sixty filled is a picture of
 * the same fact, and the forty that stay empty are the point.
 */
export function Pictogram({
  filledPct,
  filledLabel,
  emptyLabel,
  columns = 20,
  unit = "megawatts",
}: {
  filledPct: number;
  filledLabel: string;
  emptyLabel: string;
  columns?: number;
  /** What the hundred squares are a hundred of. A screen reader is told the
   *  unit out loud, so it cannot be left as whatever the first caller happened
   *  to be counting. */
  unit?: string;
}) {
  const filled = Math.round(filledPct);
  return (
    <div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
        role="img"
        aria-label={`${filled} of every 100 ${unit}: ${filledLabel}. The remaining ${100 - filled}: ${emptyLabel}.`}
      >
        {Array.from({ length: 100 }, (_, i) => (
          <span
            key={i}
            className="aspect-square rounded-[2px]"
            style={{ background: i < filled ? "var(--accent)" : "var(--grid)" }}
          />
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs">
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--accent)" }}
          />
          <span className="tnum font-medium">{filled}</span>
          <span className="text-muted">{filledLabel}</span>
        </span>
        <span className="flex items-center gap-2">
          <span
            aria-hidden
            className="h-2.5 w-2.5 rounded-sm"
            style={{ background: "var(--grid)" }}
          />
          <span className="tnum font-medium">{100 - filled}</span>
          <span className="text-muted">{emptyLabel}</span>
        </span>
      </div>
    </div>
  );
}

/** A stat tile that carries an icon instead of being a naked number. */
export function StatTile({
  icon,
  label,
  value,
  unit,
  note,
  tone = "accent",
}: {
  icon: IconName;
  label: string;
  value: string;
  unit?: string;
  note?: string;
  tone?: "accent" | "signal" | "muted";
}) {
  const colour =
    tone === "signal" ? "text-signal" : tone === "muted" ? "text-muted" : "text-accent";
  return (
    <div className="bg-card p-5">
      <div className={`flex items-center gap-2 ${colour}`}>
        <Icon name={icon} size={18} />
        <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      </div>
      <p className="mt-2 font-display text-3xl tracking-tight tnum">
        {value}
        {unit && <span className="ml-1.5 text-sm font-normal text-muted">{unit}</span>}
      </p>
      {note && <p className="mt-2 text-xs leading-relaxed text-muted">{note}</p>}
    </div>
  );
}
