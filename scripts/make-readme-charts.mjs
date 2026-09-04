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

/* 4. The hero. Every operator's announcement summed, against what is live.
 *
 * Nothing here is positioned at a guessed x offset. The first version put the
 * second figure at a fixed 300px and the first one ran straight through it,
 * because SVG has no text metrics at generation time. Anything that could
 * collide is either on its own line or anchored to the opposite edge. */
{
  const ops = uni.operators;
  const announced = ops.reduce((t, o) => t + o.announcedMW, 0);
  const live = ops.reduce((t, o) => t + o.liveMW, 0);
  const pct = (live / announced) * 100;
  const W = 880, H = 250, PAD = 32, BARW = W - PAD * 2;
  const nf = (n) => n.toLocaleString("en-US", { maximumFractionDigits: 0 });
  let out = "";
  out += text(PAD, 46, "INDIA'S LISTED DATA CENTRE BUILDOUT", { size: 12, fill: MUTE, weight: 700 });
  out += text(PAD, 112, `${pct.toFixed(1)}%`, { size: 58, weight: 700, fill: SIGNAL });
  out += text(PAD + 152, 92, "of everything announced", { size: 20, weight: 600 });
  out += text(PAD + 152, 116, "is carrying load today", { size: 20, weight: 600 });
  out += rect(PAD, 146, BARW, 26, PALE);
  out += rect(PAD, 146, (live / announced) * BARW, 26, SIGNAL);
  out += text(PAD, 196, `${nf(announced)} MW announced`, { size: 15, weight: 600, mono: true });
  out += text(W - PAD, 196, `${live.toFixed(2)} MW live`, { size: 15, weight: 600, fill: SIGNAL, anchor: "end", mono: true });
  out += `<line x1="${PAD}" y1="212" x2="${W - PAD}" y2="212" stroke="${LINE}"/>`;
  out += text(PAD, 232, `${ops.length} operators. Every figure is the operator's own. The red sliver is the whole of the delivered estate.`, { size: 12, fill: MUTE });
  writeFileSync(new URL("../docs/img/hero.svg", import.meta.url),
    svg(W, H, out, "Announced against live capacity across India's listed data centre operators",
      `${nf(announced)} MW announced against ${live.toFixed(2)} MW live, which is ${pct.toFixed(1)} per cent.`));
  console.log("hero.svg");
}

/* 5. What one operator promised on a call, against what it then commissioned. */
{
  const sify = d("sify_capacity.json");
  const obs = sify.observations.map((o) => ({ date: o.date, mw: o.commissioned_mw ?? o.built_mw }))
    .filter((o) => Number.isFinite(o.mw));
  const claims = sify.claims.filter((c) => c.status === "MISSED");
  const W = 880, H = 380, PAD = 34, L = 58, B = H - 74;
  const t0 = Date.parse(obs[0].date);
  const t1 = Math.max(Date.parse(obs[obs.length - 1].date), ...claims.map((c) => Date.parse(c.horizon_end)));
  const top = Math.max(...obs.map((o) => o.mw), ...claims.map((c) => c.value)) * 1.15;
  const X = (d0) => L + ((Date.parse(d0) - t0) / (t1 - t0)) * (W - L - PAD);
  const Y = (mw) => B - (mw / top) * (B - 96);
  let out = "";
  out += text(PAD, 40, "What was promised on a call, against what was then commissioned", { size: 19, weight: 600 });
  out += text(PAD, 64, "Sify Technologies. Blue line is capacity management said was commissioned. Red marks are dated promises.", { size: 12.5, fill: MUTE });
  for (const g of [0, 50, 100, 150]) {
    if (g > top) continue;
    out += `<line x1="${L}" y1="${px(Y(g))}" x2="${W - PAD}" y2="${px(Y(g))}" stroke="${LINE}"/>`;
    out += text(L - 8, Y(g) + 4, String(g), { size: 11, fill: MUTE, anchor: "end", mono: true });
  }
  out += `<polyline fill="none" stroke="${ACCENT}" stroke-width="2.5" points="${obs.map((o) => `${px(X(o.date))},${px(Y(o.mw))}`).join(" ")}"/>`;
  for (const o of obs) out += `<circle cx="${px(X(o.date))}" cy="${px(Y(o.mw))}" r="3.5" fill="${ACCENT}"/>`;
  // The promises are drawn as dated markers, not as points on the megawatt axis.
  // One of them is incremental ("100 MW of the announced 200 MW expansion goes
  // live"), so giving it a y position would invite a comparison against total
  // commissioned capacity that the claim does not support. What is true of both
  // is the date they fell due and that neither was met.
  claims.forEach((c, i) => {
    const x = X(c.horizon_end);
    out += `<line x1="${px(x)}" y1="88" x2="${px(x)}" y2="${px(B)}" stroke="${SIGNAL}" stroke-width="1.4" stroke-dasharray="4 3"/>`;
    out += `<path d="M ${px(x - 5)} ${px(94 + i * 20)} L ${px(x + 5)} ${px(104 + i * 20)} M ${px(x + 5)} ${px(94 + i * 20)} L ${px(x - 5)} ${px(104 + i * 20)}" stroke="${SIGNAL}" stroke-width="2"/>`;
    out += text(x - 11, 103 + i * 20, `${c.claim} · missed`, { size: 11, fill: SIGNAL, weight: 600, anchor: "end" });
  });
  out += text(L, B + 20, obs[0].date, { size: 11, fill: MUTE, mono: true });
  out += text(W - PAD, B + 20, obs[obs.length - 1].date, { size: 11, fill: MUTE, anchor: "end", mono: true });
  out += `<line x1="${PAD}" y1="${B + 34}" x2="${W - PAD}" y2="${B + 34}" stroke="${LINE}"/>`;
  out += text(PAD, B + 56, `Both dated promises were missed. Commissioned capacity went from ${obs[0].mw} MW to ${obs[obs.length - 1].mw} MW over the window.`, { size: 12.5, weight: 600 });
  writeFileSync(new URL("../docs/img/promises-vs-delivery.svg", import.meta.url),
    svg(W, H, out, "Dated capacity promises against commissioned capacity",
      claims.map((c) => `${c.claim}, status ${c.status}`).join("; ")));
  console.log("promises-vs-delivery.svg");
}

/* 6. Refusal, with the asking drawn rather than footnoted. */
{
  const reg = d("disclosure_register.json");
  const rows = reg.companies.map((c) => {
    const pressed = c.families.reduce((t, f) => t + f.pressed, 0);
    const refused = c.families.reduce((t, f) => t + f.deflected + f.declined, 0);
    return { name: c.name, calls: c.callsCovered, pressed, refused, perCall: pressed / c.callsCovered };
  }).sort((a, b) => b.pressed - a.pressed);
  const W = 880, PAD = 30, LAB = 190, BARW = W - PAD * 2 - LAB - 168;
  const top = Math.max(...rows.map((r) => r.pressed));
  let y = 104, out = "";
  out += text(PAD, 40, "Who refuses, and who was actually asked", { size: 19, weight: 600 });
  out += text(PAD, 64, "Bar length is how often the question was pressed. The filled part is how often it was refused.", { size: 12.5, fill: MUTE });
  out += text(PAD, 82, "A company nobody presses has little to refuse, so the denominator is drawn rather than footnoted.", { size: 12.5, fill: MUTE });
  for (const r of rows) {
    out += text(PAD, y + 15, r.name, { size: 12.5 });
    out += rect(PAD + LAB, y, (r.pressed / top) * BARW, 22, PALE);
    out += rect(PAD + LAB, y, (r.refused / top) * BARW, 22, SIGNAL);
    out += text(PAD + LAB + (r.pressed / top) * BARW + 10, y + 16,
      `${r.refused} refused of ${r.pressed} pressed   ${r.perCall.toFixed(2)} a call`, { size: 12, mono: true });
    y += 34;
  }
  out += `<line x1="${PAD}" y1="${y + 4}" x2="${W - PAD}" y2="${y + 4}" stroke="${LINE}"/>`;
  out += text(PAD, y + 28, "The Indian operator refuses least by rate. It is also the one asked least.", { size: 13, weight: 600 });
  writeFileSync(new URL("../docs/img/who-refuses.svg", import.meta.url),
    svg(W, y + 46, out, "Refusal rates over the number of questions actually pressed",
      rows.map((r) => `${r.name}: ${r.refused} refused of ${r.pressed} pressed, ${r.perCall.toFixed(2)} per call`).join("; ")));
  console.log("who-refuses.svg");
}
