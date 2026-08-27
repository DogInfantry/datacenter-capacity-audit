import type { Source } from "@/lib/schema";

const LABEL: Record<Source["verification"], string> = {
  PRIMARY: "primary",
  SECONDARY: "secondary",
  UNVERIFIED: "unverified",
};

/**
 * Every number on this site carries one of these. The verification tag is not
 * decoration: a figure traced to a filing and a figure carried in from a
 * research note are different kinds of claim, and the reader is told which.
 */
export function Cite({ source }: { source: Source }) {
  return (
    <span className="group relative inline-flex items-baseline">
      <span className="ml-1.5 cursor-help rounded-sm border border-line px-1 text-[10px] uppercase tracking-wide text-muted">
        {LABEL[source.verification]}
      </span>
      <span
        role="note"
        className="pointer-events-none absolute bottom-full left-0 z-10 mb-2 w-[min(18rem,calc(100vw-2.5rem))] rounded-sm border border-line bg-card p-3 text-xs leading-relaxed text-muted opacity-0 shadow-lg transition-opacity group-hover:opacity-100 group-focus-within:opacity-100"
      >
        {source.label}
        <span className="mt-1 block text-[11px] opacity-70">As of {source.asOf}</span>
      </span>
    </span>
  );
}
