/* Text QA on a composition (node core/render.mjs text-qa <composition.html> <qa_dir>): what a viewer can read.
 *
 * Every --every seconds (default 0.25) the page is seeked and each visible block of text (opacity ≥ 0.9) is measured:
 *   - size: its rendered font size in px, transforms included, per 1080 px of the frame's short side (the block's
 *     median over time, so a word caught mid-pop doesn't count)
 *   - contrast: the stage is screenshotted twice, with the text and with all text made transparent. The pixels that
 *     differ are the glyphs (fill, stroke, shadow); the second shot gives what is behind exactly those pixels. The
 *     contrast is the better of the glyphs' darkest and lightest tenth against the median background (WCAG ratio),
 *     so white type with a dark stroke over a bright plate passes, as it reads.
 *   - safe zones (9:16): boxes that reach into the organic or paid Reels UI areas
 *   - hook: the first time a large, readable line is on screen; it must be by 3 s (sound off)
 *
 * Decoration that is not meant to be read (faint watermark glyphs, dial ticks) opts out with data-qa-skip.
 * Only DOM text (HTML and SVG <text>) is seen. Text drawn into a canvas (Pixi, Three.js, Rive) or baked into a plate
 * is not: check those frames by eye.
 */
import { decode } from "./blend.mjs";

export const LIMITS = {
  minPx: 28, warnPx: 40,      // per 1080 px of short side; captions and headlines sit well above
  largePx: 48,                // WCAG "large text": 3:1 is enough at or above this, 4.5:1 below
  hookPx: 56, hookBy: 3,      // a hook line must be at least this big, on screen by this time
};
// Reels UI cover (fractions of the frame): organic = must, paid = should
const ZONES = {
  organic: { top: 0.115, bottom: 0.22, left: 0.06, right: 0.11 },
  paid: { top: 0.14, bottom: 0.35, left: 0.06, right: 0.06 },
};

// In-page: visible text blocks, keyed by a stable id (data-qa-id, given in DOM order on first sight)
export const COLLECT = `(() => {
  const stage = document.getElementById("stage"), sr = stage.getBoundingClientRect();
  window.__qaNext ??= 0;
  const hidden = (e) => { const cs = getComputedStyle(e); return cs.display === "none" || cs.visibility === "hidden"; };
  const alpha = (el) => {
    let a = 1;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      if (hidden(e)) return 0;
      a *= +getComputedStyle(e).opacity;
    }
    return a;
  };
  const scale = (el) => {
    if (el instanceof SVGElement && el.getScreenCTM) { const m = el.getScreenCTM(); return m ? Math.hypot(m.a, m.b) : 1; }
    let s = 1;
    for (let e = el; e && e !== stage; e = e.parentElement) {
      const t = getComputedStyle(e).transform;
      if (t && t !== "none") { const m = new DOMMatrix(t); s *= Math.hypot(m.a, m.b); }
    }
    return s;
  };
  const units = new Map();
  const walker = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  for (let n; (n = walker.nextNode());) {
    if (!n.textContent.trim()) continue;
    const el = n.parentElement;
    if (!el || el.closest("script,style,title,desc,[data-qa-skip]") || alpha(el) < 0.9) continue;
    const range = document.createRange();
    range.selectNodeContents(n);
    const r = range.getBoundingClientRect();
    if (r.width < 1 || r.height < 1) continue;
    let u = el;
    while (u !== stage && u.parentElement && !(u instanceof SVGElement) && getComputedStyle(u).display.startsWith("inline")) u = u.parentElement;
    if (u instanceof SVGElement && u.closest("text")) u = u.closest("text");
    u.dataset.qaId ??= String(window.__qaNext++);
    const px = parseFloat(getComputedStyle(el).fontSize) * scale(el);
    const box = { x0: r.left - sr.left, y0: r.top - sr.top, x1: r.right - sr.left, y1: r.bottom - sr.top };
    const cur = units.get(u.dataset.qaId);
    if (!cur) units.set(u.dataset.qaId, { id: u.dataset.qaId, text: "", px, box });
    else {
      cur.px = Math.max(cur.px, px);  // the block's main size; a word mid-pop is smaller for a moment
      cur.box = { x0: Math.min(cur.box.x0, box.x0), y0: Math.min(cur.box.y0, box.y0),
        x1: Math.max(cur.box.x1, box.x1), y1: Math.max(cur.box.y1, box.y1) };
    }
    const unit = units.get(u.dataset.qaId);
    unit.text = (unit.text + " " + n.textContent.trim()).trim().replace(/\\s+/g, " ");
  }
  return [...units.values()];
})()`;

const HIDE_CSS = `#stage, #stage * { color: transparent !important; -webkit-text-fill-color: transparent !important;
  -webkit-text-stroke-color: transparent !important; text-shadow: none !important; }
  #stage text, #stage tspan, #stage textPath { fill: transparent !important; stroke: transparent !important; }`;
export const HIDE = `(() => { const s = document.createElement("style"); s.id = "__qa_hide"; s.textContent = ${JSON.stringify(HIDE_CSS)}; document.head.append(s); })()`;
export const SHOW = `document.getElementById("__qa_hide")?.remove()`;

// sRGB 8-bit → relative luminance
const LUM = new Float64Array(256).map((_, c) => { const s = c / 255; return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4; });
const ratio = (a, b) => (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
const pct = (sorted, p) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))];

/** Contrast of each unit's glyphs against what is behind them, from the shot with text and the shot without. */
export function measure(withPng, withoutPng, units) {
  const A = decode(withPng), B = decode(withoutPng), ch = A.channels, W = A.width, H = A.height;
  const out = [];
  for (const u of units) {
    const x0 = Math.max(0, Math.floor(u.box.x0) - 4), y0 = Math.max(0, Math.floor(u.box.y0) - 4);
    const x1 = Math.min(W, Math.ceil(u.box.x1) + 4), y1 = Math.min(H, Math.ceil(u.box.y1) + 4);
    const ink = [], bg = [], box = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const i = (y * W + x) * ch;
        const d = Math.max(Math.abs(A.data[i] - B.data[i]), Math.abs(A.data[i + 1] - B.data[i + 1]), Math.abs(A.data[i + 2] - B.data[i + 2]));
        if (d <= 16) continue;
        box.x0 = Math.min(box.x0, x); box.y0 = Math.min(box.y0, y); box.x1 = Math.max(box.x1, x + 1); box.y1 = Math.max(box.y1, y + 1);
        ink.push(0.2126 * LUM[A.data[i]] + 0.7152 * LUM[A.data[i + 1]] + 0.0722 * LUM[A.data[i + 2]]);
        bg.push(0.2126 * LUM[B.data[i]] + 0.7152 * LUM[B.data[i + 1]] + 0.0722 * LUM[B.data[i + 2]]);
      }
    }
    if (ink.length < 30) continue;  // covered, clipped or off the stage
    ink.sort((a, b) => a - b); bg.sort((a, b) => a - b);
    const back = pct(bg, 0.5);
    // The box becomes the ink itself (the font's line box reaches above and below the glyphs). A box cut by the
    // stage edge keeps its layout size, so text sliding in or out still reads as past the edge.
    const cutByEdge = u.box.x0 < 0 || u.box.y0 < 0 || u.box.x1 > W || u.box.y1 > H;
    out.push({ ...u, box: cutByEdge ? u.box : box, contrast: Math.max(ratio(pct(ink, 0.1), back), ratio(pct(ink, 0.9), back)) });
  }
  return out;
}

function zonesHit(box, W, H) {
  // A box past the stage edge is entering or leaving (a push, a slide): not placed there
  if (box.x0 < 0 || box.y0 < 0 || box.x1 > W || box.y1 > H) return "";
  const hit = (z) => box.y0 < z.top * H || box.y1 > (1 - z.bottom) * H || box.x0 < z.left * W || box.x1 > (1 - z.right) * W;
  return hit(ZONES.organic) ? "organic" : hit(ZONES.paid) ? "paid" : "";
}

const median = (xs) => [...xs].sort((a, b) => a - b)[xs.length >> 1];

/** Fold per-time samples into one record per text block. A problem fails when it lasts at least `persist` seconds
 *  (a viewer can't read it); shorter ones (a word mid-pop, a line crossing a moving plate) only warn. */
export function summarise(samples, meta, every, persist = 0.5) {
  const k = Math.min(meta.width, meta.height) / 1080, vertical = meta.width === 1080 && meta.height === 1920;
  const blocks = new Map();
  let hook = null;
  for (const { t, units } of samples) {
    for (const u of units) {
      const px = u.px / k;
      const b = blocks.get(u.id) ?? { id: u.id, text: u.text, first: t, last: t, seen: [] };
      b.last = t;
      if (u.text.length > b.text.length) b.text = u.text;
      const zone = vertical ? zonesHit(u.box, meta.width, meta.height) : "";
      b.seen.push({ t, px, contrast: u.contrast, zone });
      blocks.set(u.id, b);
      // a hook under the app's own buttons and caption isn't seen
      if (!hook && px >= LIMITS.hookPx && u.contrast >= 3 && zone !== "organic") hook = { t, text: u.text };
    }
  }
  const grade = (bad, warnOnly = false) => (!bad.length ? "ok" : !warnOnly && bad.length * every >= persist ? "fail" : "warn");
  const list = [...blocks.values()].map(({ seen, ...b }) => {
    const px = median(seen.map((s) => s.px)), need = px >= LIMITS.largePx ? 3 : 4.5;
    const worst = seen.reduce((w, s) => (s.contrast < w.contrast ? s : w));
    const low = seen.filter((s) => s.contrast < need);
    const organic = seen.filter((s) => s.zone === "organic"), paid = seen.filter((s) => s.zone);
    const zoneAt = (organic[0] ?? paid[0])?.t ?? null;
    const zoneGrade = grade(organic) === "fail" ? "fail" : paid.length ? "warn" : "ok";
    return {
      ...b, px: +px.toFixed(1), size: px < LIMITS.minPx ? "fail" : px < LIMITS.warnPx ? "warn" : "ok",
      need, minContrast: +worst.contrast.toFixed(2), contrastAt: (low[0] ?? worst).t, lowFor: +(low.length * every).toFixed(2),
      contrastResult: grade(low),
      zone: zoneGrade === "ok" ? "" : organic.length ? "organic" : "paid", zoneAt, zoneResult: zoneGrade,
    };
  });
  return { blocks: list, hook, hookOk: !!hook && hook.t <= LIMITS.hookBy };
}

const cut = (s, n = 48) => (s.length > n ? s.slice(0, n - 1) + "…" : s).replace(/\|/g, "\\|");

export function report(name, meta, sum, every) {
  const icon = { ok: "✅", warn: "⚠️", fail: "❌" };
  const issues = sum.blocks.filter((b) => b.size !== "ok" || b.contrastResult !== "ok" || b.zoneResult !== "ok");
  const lines = [
    `# Text QA: ${name}`, "",
    `${meta.width}x${meta.height}, sampled every ${every} s. Sizes are per 1080 px of the short side. ` +
      `Size: ❌ under ${LIMITS.minPx} px, ⚠️ under ${LIMITS.warnPx} px. Contrast: 3:1 at ${LIMITS.largePx} px and up, 4.5:1 below. ` +
      `A problem fails (❌) when it lasts 0.5 s or more; shorter ones warn (⚠️).`, "",
    "| Check | Value | Result |", "|---|---|---|",
    `| Hook by ${LIMITS.hookBy} s (≥ ${LIMITS.hookPx} px, ≥ 3:1, clear of the Reels UI) | ${sum.hook ? `"${cut(sum.hook.text)}" at ${sum.hook.t} s` : "none"} | ${sum.hookOk ? "✅" : "❌ say the point in big type in the first 3 s (sound off)"} |`,
    `| Text blocks | ${sum.blocks.length} | — |`,
    ...[["Too small", (b) => b.size], ["Low contrast", (b) => b.contrastResult], ["In the Reels UI", (b) => b.zoneResult]].map(([name, f]) => {
      const fail = sum.blocks.filter((b) => f(b) === "fail").length, warn = sum.blocks.filter((b) => f(b) === "warn").length;
      return `| ${name} | ${fail} fail, ${warn} warn | ${fail ? "❌" : warn ? "⚠️" : "✅"} |`;
    }),
  ];
  if (issues.length) {
    lines.push("", "## Blocks to fix", "",
      "| Text | On screen | Size (typical) | Contrast (worst) | Reels UI | Evidence |", "|---|---|---|---|---|---|");
    for (const b of issues) {
      lines.push(`| "${cut(b.text)}" | ${b.first}–${b.last} s | ${icon[b.size]} ${b.px} px | ` +
        `${icon[b.contrastResult]} ${b.minContrast}:1, needs ${b.need}${b.lowFor ? `; low for ${b.lowFor} s from ${b.contrastAt} s` : ""} | ` +
        `${b.zone ? `${icon[b.zoneResult]} ${b.zone} @ ${b.zoneAt} s` : "✅"} | ${b.evidence ? `\`${b.evidence}\`` : ""} |`);
    }
  }
  lines.push("", "Only DOM text is measured (HTML, SVG `<text>`). Check text drawn in canvas engines or baked into plates by eye. " +
    "Decoration not meant to be read can opt out with `data-qa-skip`.", "");
  return lines.join("\n");
}
