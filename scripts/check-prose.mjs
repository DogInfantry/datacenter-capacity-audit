/**
 * Two house rules, both invisible to a linter and both easy to reintroduce one
 * paste at a time. Runs over authored source only, never node_modules.
 *
 * 1. No em dashes and no en dashes in prose. Date ranges read "to".
 * 2. No self narration on a product page. An exhibit states what is true and
 *    the source line under it carries the document and the printed page. The
 *    product does not describe its own construction, what it has and has not
 *    opened, or why a chart was drawn the way it was.
 *
 * The second rule applies to what a reader sees, so comments are skipped: the
 * reasoning belongs in the code and stays there. The methodology page is
 * exempt, because describing the method is what that page is for, and so are
 * the three components that render on it and nowhere else.
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
  "ARCHITECTURE.md",
  "ROADMAP.md",
];

const BANNED = [
  ["\u2014", "em dash"],
  ["\u2013", "en dash"],
];

/** Where the voice rule applies. Everything a reader actually meets. */
const VOICE_GLOBS = ["app/**/*.tsx", "components/**/*.tsx", "data/*.json"];

/** The method belongs on the methodology page, and in these three, which
 *  render on it and nowhere else. */
const VOICE_EXEMPT = [
  "app/methodology",
  "components/Sourcing.tsx",
  "components/ReadingRule.tsx",
  "components/InvariantLedger.tsx",
  // Both render only on the methodology page, where describing the method is
  // the whole point.
  "data/invariants.json",
  "data/method.json",
];

/**
 * Phrases that can only be the build talking about itself.
 *
 * Deliberately narrow. A sourcing statement is not self narration and stays:
 * "every figure here is secondary" is what a research note is supposed to say.
 * What comes off is the product describing its own construction.
 */
const VOICE = [
  ["this project", "name the finding, not the thing that produced it"],
  ["this site", "name the finding, not the thing that produced it"],
  ["this repositor", "a reader is not looking at a repository"],
  ["this exhibit", "an exhibit states what is true, it does not describe itself"],
  ["not read", "an absence is a fact about the disclosure, so name the document"],
  ["not been read", "an absence is a fact about the disclosure, so name the document"],
  ["not been opened", "an absence is a fact about the disclosure, so name the document"],
  ["not yet extracted", "an absence is a fact about the disclosure, so name the document"],
  ["not yet carried", "an absence is a fact about the disclosure, so name the document"],
  ["would fill", "say what the document holds, not what it would do for the page"],
  ["the reading stopped", "a reader does not need the build log"],
];

/** Comments carry the reasoning and are exempt. Strips block comments, comment
 *  continuation lines and trailing double slashes, leaving a protocol alone. */
function stripComments(text) {
  let inBlock = false;
  return text.split("\n").map((line) => {
    let out = line;
    if (inBlock) {
      const end = out.indexOf("*/");
      if (end === -1) return "";
      out = out.slice(end + 2);
      inBlock = false;
    }
    for (;;) {
      const start = out.indexOf("/*");
      if (start === -1) break;
      const end = out.indexOf("*/", start + 2);
      if (end === -1) {
        inBlock = true;
        out = out.slice(0, start);
        break;
      }
      out = out.slice(0, start) + out.slice(end + 2);
    }
    if (out.trimStart().startsWith("*")) return "";
    return out.replace(/(^|[^:])\/\/.*$/, "$1");
  });
}

const files = (patterns) => {
  const seen = new Set();
  for (const pattern of patterns) {
    for (const file of globSync(pattern, { exclude: (p) => p.includes("node_modules") })) {
      seen.add(file);
    }
  }
  return [...seen];
};

let bad = 0;

for (const file of files(GLOBS)) {
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

for (const file of files(VOICE_GLOBS)) {
  const normalised = file.split("\\").join("/");
  if (VOICE_EXEMPT.some((e) => normalised.includes(e))) continue;
  const lines = stripComments(readFileSync(file, "utf8"));
  lines.forEach((line, i) => {
    // A `_note` key documents the data file for whoever edits it next and is
    // never rendered, so the voice rule does not reach it.
    if (line.trimStart().startsWith('"_note"')) return;
    const lower = line.toLowerCase();
    for (const [phrase, why] of VOICE) {
      if (lower.includes(phrase)) {
        console.error(`${file}:${i + 1}  self narration "${phrase}": ${why}`);
        console.error(`    ${line.trim().slice(0, 100)}`);
        bad++;
      }
    }
  });
}

if (bad) {
  console.error(`\n${bad} violation${bad === 1 ? "" : "s"}.`);
  process.exit(1);
}
console.log("prose check ok");
