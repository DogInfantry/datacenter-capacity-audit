// Charts for the README, generated from data/ so they cannot drift from the
// site. GitHub renders committed SVG, and an SVG is text, so a retrieval model
// reads the labels where a screenshot shows it nothing.
//
// Every chart paints its own background and uses dark ink on light, so it reads
// identically against GitHub's light and dark themes rather than half
// disappearing in one of them.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";

const d = (p) => JSON.parse(readFileSync(new URL(`../data/${p}`, import.meta.url)));
const pros = d("prospectus.json");
const uni = d("universe.json");
const te = d("technoe.json");
mkdirSync(new URL("../docs/img", import.meta.url), { recursive: true });

const BG = "#f7f6f3", INK = "#16181d", MUTE = "#6b7280", LINE = "#dcd9d4";
const ACCENT = "#2f5fd0", SIGNAL = "#c8443c", PALE = "#c9d6f0";
const FONT = "ui-sans-serif,-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif";
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const px = (n) => Math.round(n * 100) / 100;

function svg(w, h, body, title, desc) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-labelledby="t d" font-family="${FONT}">
<title id="t">${esc(title)}</title><desc id="d">${esc(desc)}</desc>
<rect width="${w}" height="${h}" fill="${BG}"/>
${body}
</svg>`;
}
const text = (x, y, s, o = {}) =>
  `<text x="${px(x)}" y="${px(y)}" fill="${o.fill || INK}" font-size="${o.size || 13}" font-weight="${o.weight || 400}" text-anchor="${o.anchor || "start"}"${o.mono ? ' font-variant-numeric="tabular-nums"' : ""}>${esc(s)}</text>`;
const rect = (x, y, w, h, fill, r = 2) =>
  `<rect x="${px(x)}" y="${px(y)}" width="${px(Math.max(w, 0))}" height="${px(h)}" rx="${r}" fill="${fill}"/>`;

/* 1. The capacity ladder, as a funnel. One estate, one date, three numbers. */
{
  const rungs = pros.capacity.rungs;
  const W = 880, PAD = 28, LAB = 132, BARW = W - PAD * 2 - LAB - 96;
  const top = rungs[0].mw;
  let y = 96, out = "";
  out += text(PAD, 40, "One estate, one date, three capacity figures", { size: 19, weight: 600 });
  out += text(PAD, 64, "Sify Infinit Spaces, draft red herring prospectus, printed page 49", { size: 12.5, fill: MUTE });
  for (const r of rungs) {
    const w = (r.mw / top) * BARW;
    const last = r.name === "Operational";
    out += text(PAD, y + 17, r.name, { size: 13.5, weight: 600 });
    out += rect(PAD + LAB, y, w, 26, last ? SIGNAL : ACCENT);
    out += text(PAD + LAB + w + 10, y + 18, `${r.mw} MW`, { size: 13.5, weight: 600, mono: true });
    out += text(PAD, y + 36, r.gloss, { size: 11.5, fill: MUTE });
    y += 62;
  }
  const drop = ((rungs[0].mw - rungs[2].mw) / rungs[0].mw) * 100;
  out += `<line x1="${PAD}" y1="${y - 6}" x2="${W - PAD}" y2="${y - 6}" stroke="${LINE}"/>`;
  out += text(PAD, y + 18, `The headline is ${px(rungs[0].mw / rungs[2].mw * 100 - 100).toFixed(0)} per cent larger than the estate earning revenue.`, { size: 13, weight: 600 });
  out += text(PAD, y + 38, `Eleven days later the same estate was described on a call as "188 megawatts of design capacity, of which about 130-megawatt is built".`, { size: 11.5, fill: MUTE });
  writeFileSync(new URL("../docs/img/capacity-ladder.svg", import.meta.url),
    svg(W, y + 56, out, "The capacity definition ladder",
      `Built ${rungs[0].mw} MW, installed ${rungs[1].mw} MW, operational ${rungs[2].mw} MW. A drop of ${drop.toFixed(0)} per cent from the headline to the capacity earning revenue.`));
  console.log("capacity-ladder.svg");
}

/* 2. Announced against delivered, every operator, one megawatt scale. */
{
  const ops = [...uni.operators].sort((a, b) => b.announcedMW - a.announcedMW);
  const W = 880, PAD = 28, LAB = 176, BARW = W - PAD * 2 - LAB - 118;
  const top = Math.max(...ops.map((o) => o.announcedMW));
  let y = 100, out = "";
  out += text(PAD, 40, "Announced against delivered, on one megawatt scale", { size: 19, weight: 600 });
  out += text(PAD, 64, "Pale bar is announced. Solid bar is what is live. Both are the operator's own figure.", { size: 12.5, fill: MUTE });
  for (const o of ops) {
    const aw = (o.announcedMW / top) * BARW;
    const lw = (o.liveMW / top) * BARW;
    const pct = (o.liveMW / o.announcedMW) * 100;
    out += text(PAD, y + 14, o.operator, { size: 12.5 });
    out += rect(PAD + LAB, y, aw, 19, PALE);
    if (lw > 0) out += rect(PAD + LAB, y, Math.max(lw, 2), 19, pct < 15 ? SIGNAL : ACCENT);
    out += text(W - PAD, y + 14, `${px(o.liveMW)} of ${px(o.announcedMW)} MW   ${pct.toFixed(0)}%`,
      { size: 12, anchor: "end", mono: true, fill: pct < 15 ? SIGNAL : INK });
    y += 31;
  }
  out += `<line x1="${PAD}" y1="${y + 2}" x2="${W - PAD}" y2="${y + 2}" stroke="${LINE}"/>`;
  out += text(PAD, y + 26, "Two operators announcing 8,000 MW between them have delivered nothing at all.", { size: 13, weight: 600 });
  writeFileSync(new URL("../docs/img/announced-vs-delivered.svg", import.meta.url),
    svg(W, y + 44, out, "Announced against delivered capacity by operator",
      ops.map((o) => `${o.operator} ${o.liveMW} of ${o.announcedMW} MW`).join("; ")));
  console.log("announced-vs-delivered.svg");
}

/* 3. What one filer has actually contracted to build, against its own target. */
{
  const W = 880, PAD = 28;
  const target = te.target.mw;
  const live = te.campuses.filter((c) => c.status === "LIVE").reduce((t, c) => t + c.mw, 0);
  const cr = te.commitments.capitalCommitmentMn / 10;
  const mwHigh = cr / 60;
  const BARW = W - PAD * 2 - 150;
  const row = (y, label, mw, fill, note) =>
    text(PAD, y + 14, label, { size: 12.5 }) +
    rect(PAD + 150, y, Math.max((mw / target) * BARW, mw > 0 ? 1.5 : 0), 20, fill) +
    text(PAD + 150 + Math.max((mw / target) * BARW, 1.5) + 9, y + 15, note, { size: 12.5, weight: 600, mono: true });
  let out = "";
  out += text(PAD, 40, "A 250 megawatt target, and the capital actually contracted for", { size: 19, weight: 600 });
  out += text(PAD, 64, "Techno Electric annual report FY2025-26. Target from management discussion, the rest audited.", { size: 12.5, fill: MUTE });
  out += row(96, "Targeted by FY 2029-30", target, PALE, `${target} MW`);
  out += row(128, "Commissioned and live", live, ACCENT, `${live} MW`);
  out += row(160, "Bought by contracted capital", mwHigh, SIGNAL, `${mwHigh.toFixed(2)} MW`);
  out += `<line x1="${PAD}" y1="196" x2="${W - PAD}" y2="196" stroke="${LINE}"/>`;
  out += text(PAD, 220, `The only audited line recording contracts for future capital spending is ${te.commitments.capitalCommitmentMn} million rupees.`, { size: 13, weight: 600 });
  out += text(PAD, 240, `At the sector build cost of 60 to 70 crore per megawatt that buys about a fifth of one megawatt. It is 7.59 times smaller`, { size: 11.5, fill: MUTE });
  out += text(PAD, 256, `than the overdue receivables the company's own auditor drew attention to.`, { size: 11.5, fill: MUTE });
  writeFileSync(new URL("../docs/img/target-vs-contracted.svg", import.meta.url),
    svg(W, 276, out, "A 250 MW target against the capital contracted for",
      `Target ${target} MW, live ${live} MW, and contracted capital of ${te.commitments.capitalCommitmentMn} million rupees buying about ${mwHigh.toFixed(2)} MW.`));
  console.log("target-vs-contracted.svg");
}
