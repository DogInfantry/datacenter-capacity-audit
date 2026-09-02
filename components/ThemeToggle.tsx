"use client";

import { useEffect, useState } from "react";
import { Icon } from "./Visual";

/**
 * The control the stylesheet was already written for.
 *
 * `app/globals.css` carries three states: no attribute follows the reader's
 * system setting, `data-theme="light"` holds light inside a dark system, and
 * `data-theme="dark"` forces dark. Every token is defined for all three. Until
 * this existed nothing set the attribute, so the only reachable state was the
 * one the operating system chose, and two people looking at the same page had
 * no way to arrive at the same picture.
 *
 * Rendered as three states rather than a switch, because a two way switch
 * cannot express following the system, which is the right default and the one
 * most readers should stay on.
 */

type Choice = "system" | "light" | "dark";
const ORDER: Choice[] = ["system", "light", "dark"];
const LABEL: Record<Choice, string> = { system: "System", light: "Light", dark: "Dark" };
const KEY = "theme";

/** Writing the attribute is the whole mechanism; the stylesheet does the rest. */
function apply(choice: Choice) {
  const root = document.documentElement;
  if (choice === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", choice);
}

export function ThemeToggle() {
  // Starts undefined so the server and the first client render agree. The
  // stored choice is read after mount, which is also when the inline script in
  // the layout has already applied it, so nothing flashes.
  const [choice, setChoice] = useState<Choice | null>(null);

  useEffect(() => {
    let stored: Choice = "system";
    try {
      const raw = window.localStorage.getItem(KEY);
      if (raw === "light" || raw === "dark") stored = raw;
    } catch {
      // A browser refusing storage is a reader who gets the system default,
      // which is the same thing they had before this control existed.
    }
    setChoice(stored);
  }, []);

  const next = () => {
    const now = choice ?? "system";
    const value = ORDER[(ORDER.indexOf(now) + 1) % ORDER.length];
    setChoice(value);
    apply(value);
    try {
      if (value === "system") window.localStorage.removeItem(KEY);
      else window.localStorage.setItem(KEY, value);
    } catch {
      // The attribute is already set, so the page is correct for this visit.
    }
  };

  return (
    <button
      type="button"
      onClick={next}
      // Width is fixed so cycling the label does not shift the nav beside it.
      className="ml-auto inline-flex w-[6.5rem] shrink-0 items-center justify-center gap-1.5 rounded-sm border border-line px-2 py-1 text-xs text-muted transition-colors hover:text-accent"
      aria-label={`Colour theme: ${LABEL[choice ?? "system"]}. Activate to change.`}
    >
      <Icon name="power" size={12} />
      <span suppressHydrationWarning>{choice ? LABEL[choice] : LABEL.system}</span>
    </button>
  );
}
