/**
 * House rule: no em dashes and no en dashes in prose. Date ranges read "to".
 *
 * This exists because the rule is invisible to a linter and easy to reintroduce
 * one paste at a time. Runs over authored source only, never node_modules.
 */
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";

const GLOBS = [
  "app/**/*.{ts,tsx,css}",
  "lib/**/*.ts",
  "components/**/*.tsx",
  "docs/**/*.md",
  "pipeline/**/*.py",
  "scripts/**/*.mjs",
  "README.md",
  "CLAUDE.md",
  "ROADMAP.md",
  "memory/**/*.md",
];

const BANNED = [
  ["\u2014", "em dash"],
  ["\u2013", "en dash"],
];

let bad = 0;
for (const pattern of GLOBS) {
  for (const file of globSync(pattern, { exclude: (p) => p.includes("node_modules") })) {
    const lines = readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      for (const [ch, name] of BANNED) {
        if (line.includes(ch)) {
          console.error(`${file}:${i + 1}  ${name}: ${line.trim().slice(0, 90)}`);
          bad++;
        }
      }
    });
  }
}

if (bad) {
  console.error(`\n${bad} dash violation${bad === 1 ? "" : "s"}. Rewrite the sentence or use "to".`);
  process.exit(1);
}
console.log("prose check ok");
