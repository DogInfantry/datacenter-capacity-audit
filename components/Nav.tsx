"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";

/**
 * The tab bar.
 *
 * It was a row of muted text with no resting affordance, no indication of which
 * page a reader was on, and no order that meant anything. Arriving cold, you
 * could not tell the items were controls, let alone where to start.
 *
 * Three things fix that and none of them is decoration. The items sit near full
 * text contrast rather than muted, so they read as controls at rest. The current
 * one carries an accent rule meeting the header's own bottom border, which is
 * the ordinary tab idiom and answers where am I without a word. And the order is
 * a reading order rather than the order the routes happened to be built in.
 *
 * Companies leads because it is the deepest work here: three companies read at
 * length from filed documents. The sector and the universe set the scene, the
 * comparison puts the names against each other, the offer is one transaction in
 * detail, and the method is how any of it was arrived at.
 */
const TABS: { href: string; label: string }[] = [
  { href: "/company", label: "Companies" },
  { href: "/macro", label: "The sector" },
  { href: "/universe", label: "Universe" },
  { href: "/compare", label: "Compare" },
  { href: "/pillars", label: "Pillars" },
  { href: "/offer", label: "The offer" },
  { href: "/methodology", label: "Method" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <header className="border-b border-line">
      <nav className="mx-auto flex w-full min-w-0 max-w-5xl flex-wrap items-center gap-x-5 gap-y-1 px-5 pt-4">
        <Link
          href="/"
          aria-current={pathname === "/" ? "page" : undefined}
          className="order-1 pb-4 font-display text-lg tracking-tight transition-colors hover:text-accent"
        >
          Built, Installed, Sold
        </Link>

        {/* Ordered rather than reordered in the markup, so the reading order and
            the tab order stay as they are. On a narrow screen the tab list takes
            a full row of its own and the theme control rides up beside the
            wordmark, which is the row it was wasting: seven tabs, a wordmark and
            a control wrapped onto three rows and stood 181 pixels tall at 375
            wide, a fifth of the viewport before any content.

            The tabs still wrap to two rows there, deliberately. One scrolling
            row would fit and would put destinations off screen, which is the
            failure this nav already made once by omission. */}
        <ul className="order-3 flex min-w-0 basis-full flex-wrap gap-x-1 text-sm sm:order-2 sm:basis-auto">
          {TABS.map((t) => {
            // A deep dive keeps its own tab lit, so a reader four exhibits into
            // a company page still knows which section they are inside.
            const active = pathname === t.href || pathname.startsWith(`${t.href}/`);
            return (
              <li key={t.href}>
                <Link
                  href={t.href}
                  aria-current={active ? "page" : undefined}
                  className={
                    "inline-block border-b-2 px-2 pb-3.5 transition-colors " +
                    (active
                      ? "border-accent font-medium text-foreground"
                      : "border-transparent text-foreground/75 hover:border-line hover:text-accent")
                  }
                >
                  {t.label}
                </Link>
              </li>
            );
          })}
        </ul>

        <span className="order-2 ml-auto pb-4 sm:order-3 sm:pb-3.5">
          <ThemeToggle />
        </span>
      </nav>
    </header>
  );
}
