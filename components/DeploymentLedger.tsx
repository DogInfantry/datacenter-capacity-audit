import { Logo } from "./Logo";
import { Icon } from "./Visual";

type Provider = {
  name: string;
  ticker: string | null;
  status: "MOVED" | "LAGGED" | "NOT_STATED";
  offeredGpus: number | null;
  note: string;
};

const GROUPS = [
  { status: "MOVED" as const, label: "Deploying", tone: "var(--accent-deep)" },
  { status: "LAGGED" as const, label: "Behind", tone: "var(--signal)" },
  { status: "NOT_STATED" as const, label: "Nothing reported either way", tone: "var(--muted)" },
];

/**
 * The empanelled providers, grouped by what has been reported about delivery.
 *
 * Grouped rather than ranked. A rank would imply an ordering inside each group
 * that the source does not support: it names who is ahead and who is behind and
 * says nothing about the distance between them.
 *
 * The third group is the largest and is the honest one. Half the field has no
 * public deployment record at all, which is a fact about the scheme's reporting
 * rather than about those providers, and it is drawn at the same weight as the
 * other two so it cannot be read as a middle ranking.
 */
export function DeploymentLedger({
  providers,
  gpusInstalled,
  installedQualifier,
  installedAsOf,
}: {
  providers: Provider[];
  gpusInstalled: number;
  installedQualifier: string;
  installedAsOf: string;
}) {
  const offer = providers.find((p) => p.offeredGpus !== null);
  const share = offer ? ((offer.offeredGpus as number) / gpusInstalled) * 100 : null;

  return (
    <div>
      <div className="grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
        {GROUPS.map((g) => {
          const rows = providers.filter((p) => p.status === g.status);
          return (
            <div key={g.status} className="bg-card p-4">
              <p className="flex items-baseline gap-2">
                <span
                  aria-hidden
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: g.tone }}
                />
                <span className="tnum font-display text-2xl tracking-tight">{rows.length}</span>
                <span className="text-xs text-muted">of {providers.length}</span>
              </p>
              <p className="mt-1 text-xs uppercase tracking-wider text-muted">{g.label}</p>
              <ul className="mt-3 space-y-2">
                {rows.map((p) => (
                  <li key={p.name} className="flex items-center gap-2 text-sm">
                    {p.ticker ? (
                      <Logo ticker={p.ticker} name={p.name} size="sm" />
                    ) : (
                      <span
                        aria-hidden
                        className="inline-block h-1.5 w-1.5 shrink-0 rounded-full"
                        style={{ background: g.tone }}
                      />
                    )}
                    <span className={g.status === "NOT_STATED" ? "text-muted" : ""}>{p.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      {offer && share !== null && (
        <div className="mt-5 rounded-md border border-line bg-card p-4">
          <p className="text-sm">
            <span className="font-medium">{offer.name}</span>{" "}
            <span className="text-muted">offered</span>{" "}
            <span className="tnum text-foreground">
              {(offer.offeredGpus as number).toLocaleString("en-IN")}
            </span>{" "}
            <span className="text-muted">processors on its own, against</span>{" "}
            <span className="tnum text-foreground">{gpusInstalled.toLocaleString("en-IN")}</span>{" "}
            <span className="text-muted">
              {installedQualifier} installed across the whole scheme by {installedAsOf}.
            </span>
          </p>
          <span className="mt-3 block h-6 rounded-sm bg-grid">
            <span
              className="tnum flex h-6 items-center justify-end rounded-sm pr-2 text-[11px]"
              style={{
                width: `${share}%`,
                background: "var(--accent-deep)",
                color: "var(--on-accent)",
              }}
            >
              {share.toFixed(0)}%
            </span>
          </span>
          <p className="mt-2 flex gap-1.5 text-xs leading-relaxed text-muted">
            <span className="mt-0.5 shrink-0">
              <Icon name="warning" size={13} />
            </span>
            <span>
              An offer is not an installation. The bar sets one provider&apos;s commitment against
              the national total actually installed. Those are different quantities and are labelled
              as such, because no provider level installed figure has been published.
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
