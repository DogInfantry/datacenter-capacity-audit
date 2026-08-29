import Link from "next/link";

const TABS = [
  { href: "/grid", label: "Grid" },
  { href: "/disclosure", label: "Disclosure" },
  { href: "/financials", label: "Financials" },
  { href: "/prospectus", label: "Prospectus" },
  { href: "/method", label: "Method" },
];

export function Nav() {
  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex w-full min-w-0 max-w-5xl flex-wrap items-baseline gap-x-6 gap-y-2 px-5 py-4">
        <Link href="/" className="font-display text-lg tracking-tight hover:text-accent">
          Built, Installed, Sold
        </Link>
        <ul className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          {TABS.map((t) => (
            <li key={t.href}>
              <Link href={t.href} className="transition-colors hover:text-accent">
                {t.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
