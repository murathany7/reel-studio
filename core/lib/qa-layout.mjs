/* Layout QA on a composition (node core/render.mjs layout-qa <composition.html> <qa_dir>): what is broken on screen.
 *
 * Every --every seconds (default 0.25; or --at 1,2.5) the page is seeked and the live DOM inspected. "Text" is any
 * element with its own visible text (opacity > 0.05):
 *   - clipped: text cut by an overflow: hidden/clip ancestor (a label in a rounded tile, the stage edge)
 *   - broken-word: a word split across two lines ("Jewel / lery")
 *   - wrap: more lines than data-qa-lines="N" allows (❌); a 1–3 word text that wraps (⚠️)
 *   - overlap: two texts drawn over each other, or text over a logo (img/svg with "logo" in its id, class, src or alt,
 *     .logo, data-qa="logo|keep-clear")
 *   - safe: text, logo or image in a .safe / .safe-organic box that sits outside it (text-qa grades all text against
 *     the Reels UI; this is the box the composition itself chose)
 *   - image: a visible <img> that failed or has not loaded
 *   - blank: nothing on the stage but its background (⚠️)
 *
 * A problem on an element that is moving or fading at that moment (its box or opacity changes within a frame either
 * side) is only ⚠️, and clipping while moving (a slide-in past the stage edge, a mask reveal) is not reported; --strict
 * makes both ❌. Text wholly under an opaque layer (a card or banner over a screen) does not count as overlapping.
 *
 * Opt out: data-qa-skip (decoration, as in text-qa) or data-qa-ignore="overlap safe" (those checks only; bare means
 * all, e.g. the UI inside a mock phone). Only DOM text is seen, not text drawn in a canvas or baked into a plate.
 */

// Runs in the page after a seek. Returns every problem at this frame, boxes in stage pixels.
function inspect(t) {
  const stage = document.getElementById("stage");
  const S = stage.getBoundingClientRect();
  const issues = [];
  const box = (r) => ({ x: Math.round(r.left - S.left), y: Math.round(r.top - S.top), w: Math.round(r.right - r.left), h: Math.round(r.bottom - r.top) });
  const onStage = (r) => r.right > S.left && r.left < S.right && r.bottom > S.top && r.top < S.bottom;
  const ignored = (el, check) => {
    if (el.closest("[data-qa-skip]")) return true;
    const a = el.closest("[data-qa-ignore]");
    if (!a) return false;
    const v = a.getAttribute("data-qa-ignore").trim();
    return !v || v.split(/\s+/).includes(check);
  };
  const visible = (el) => {
    if (getComputedStyle(el).visibility !== "visible") return false;
    let o = 1;
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === "none") return false;
      o *= parseFloat(cs.opacity);
    }
    return o > 0.05;
  };
  const sel = (el) => {
    const parts = [];
    for (let e = el; e && e !== stage; e = e.parentElement) {
      if (e.id) { parts.unshift("#" + CSS.escape(e.id)); break; }
      let s = e.tagName.toLowerCase();
      const cls = [...e.classList].slice(0, 2);
      if (cls.length) s += "." + cls.map((c) => CSS.escape(c)).join(".");
      const same = e.parentElement ? [...e.parentElement.children].filter((c) => c.tagName === e.tagName) : [];
      if (same.length > 1) s += `:nth-of-type(${same.indexOf(e) + 1})`;
      parts.unshift(s);
      if (e.parentElement === stage) parts.unshift("#stage");
    }
    return parts.join(" > ");
  };
  const snippet = (el, n) => (el.textContent || el.getAttribute("src") || "").trim().replace(/\s+/g, " ").slice(0, n);
  const rectsOf = (node) => {
    const r = document.createRange();
    r.selectNodeContents(node);
    return [...r.getClientRects()].filter((q) => q.width > 0.5 && q.height > 0.5);
  };
  // How many lines a set of rects sits on, by vertical centre
  const lines = (rects) => {
    const ls = [];
    for (const r of [...rects].sort((a, b) => a.top - b.top)) {
      const cy = (r.top + r.bottom) / 2, last = ls[ls.length - 1];
      if (!last || Math.abs(cy - last.cy) >= Math.min(r.height, last.h) / 2) ls.push({ cy, h: r.height });
    }
    return ls.length;
  };
  // A Range rect is the font's content area, taller than the line when line-height < ~1.2: cut it to the line
  const lineHeight = (el) => {
    const cs = getComputedStyle(el), lh = parseFloat(cs.lineHeight);
    return Number.isFinite(lh) ? lh : parseFloat(cs.fontSize) * 1.2;
  };
  const core = (r, lh) => {
    const h = Math.min(r.height, lh), mid = (r.top + r.bottom) / 2;
    return { left: r.left, right: r.right, top: mid - h / 2, bottom: mid + h / 2 };
  };
  const hit = (a, b, min = 4) => {
    const ix = Math.min(a.right, b.right) - Math.max(a.left, b.left), iy = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
    return ix > min && iy > min && iy > 0.2 * Math.min(a.bottom - a.top, b.bottom - b.top);
  };
  const union = (rs) => rs.reduce((u, r) => ({ left: Math.min(u.left, r.left), top: Math.min(u.top, r.top), right: Math.max(u.right, r.right), bottom: Math.max(u.bottom, r.bottom) }),
    { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity });
  const add = (type, severity, el, detail, boxes, { pair, ...extra } = {}) => issues.push({
    type, severity, selector: el ? sel(el) : null, text: el ? snippet(el, 60) : null,
    detail, boxes: boxes.map(box), els: [el, pair].filter(Boolean), ...extra,
  });
  const opaque = (el) => {
    const cs = getComputedStyle(el), c = cs.backgroundColor.match(/[\d.]+/g) || [];
    return cs.backgroundImage !== "none" || c.length === 3 || (c.length === 4 && +c[3] > 0.9);
  };
  // The lower of two texts sits wholly under an opaque layer that holds the upper one: hidden, not overlapping
  const covered = (a, b, at) => {
    const stack = document.elementsFromPoint((at.left + at.right) / 2, (at.top + at.bottom) / 2);
    const ia = stack.findIndex((e) => a.el.contains(e)), ib = stack.findIndex((e) => b.el.contains(e));
    if (ia < 0 || ib < 0) return false;
    const [top, low] = ia < ib ? [ia, b] : [ib, a], lu = union(low.rects);
    return stack.slice(top, Math.max(ia, ib)).some((e) => {
      if (e.contains(low.el) || !opaque(e)) return false;
      const r = e.getBoundingClientRect();
      return r.left <= lu.left && r.top <= lu.top && r.right >= lu.right && r.bottom >= lu.bottom;
    });
  };

  // Every element with its own visible text
  const texts = new Map();
  const tw = document.createTreeWalker(stage, NodeFilter.SHOW_TEXT);
  for (let n = tw.nextNode(); n; n = tw.nextNode()) {
    const el = n.parentElement;
    if (!n.data.trim() || !el || el.closest("script, style, title, desc, #__qa_layout")) continue;
    if (!texts.has(el)) texts.set(el, []);
    texts.get(el).push(n);
  }
  const entries = [];
  for (const [el, nodes] of texts) {
    if (!visible(el)) continue;
    const rects = nodes.flatMap(rectsOf).filter(onStage);
    if (rects.length) entries.push({ el, nodes, rects, lh: lineHeight(el) });
  }

  // clipped: text partly outside a clipping ancestor (the element's own overflow included)
  for (const e of entries) {
    if (ignored(e.el, "clipped")) continue;
    for (let a = e.el; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      const cx = cs.overflowX !== "visible", cy = cs.overflowY !== "visible";
      if (!cx && !cy) continue;
      const r = a.getBoundingClientRect(), k = a.offsetWidth ? r.width / a.offsetWidth : 1;
      const c = { left: r.left + a.clientLeft * k, top: r.top + a.clientTop * k };
      c.right = c.left + a.clientWidth * k; c.bottom = c.top + a.clientHeight * k;
      const cut = e.rects.filter((q) => {
        const vtol = Math.max(2, (q.height - e.lh) / 2 + 2, 0.12 * q.height);
        const touches = q.right > c.left && q.left < c.right && q.bottom > c.top && q.top < c.bottom;
        return touches && ((cx && (q.left < c.left - 2 || q.right > c.right + 2)) || (cy && (q.top < c.top - vtol || q.bottom > c.bottom + vtol)));
      });
      if (cut.length) {
        const u = union(cut), px = Math.round(Math.max(c.left - u.left, u.right - c.right, c.top - u.top, u.bottom - c.bottom));
        add("clipped", "fail", e.el, `cut ${px}px by ${a === stage ? "the stage edge" : sel(a)}`, cut, { other: sel(a), otherBox: box(c) });
        break;
      }
    }
  }

  // broken-word and wrap
  for (const e of entries) {
    if (ignored(e.el, "wrap")) continue;
    let broken = false;
    for (const n of e.nodes) {
      for (const m of n.data.matchAll(/[^\s\-‐–—/]{2,}/g)) {
        const r = document.createRange();
        r.setStart(n, m.index); r.setEnd(n, m.index + m[0].length);
        const rs = [...r.getClientRects()].filter((q) => q.width > 0.5);
        if (lines(rs) > 1) { broken = true; add("broken-word", "fail", e.el, `"${m[0]}" is split across lines`, rs); }
      }
    }
    const words = e.nodes.map((n) => n.data).join(" ").trim().split(/\s+/).length, n = lines(e.rects);
    if (n > 1 && words <= 3 && !broken && !e.el.querySelector("br") && !e.el.closest("[data-qa-lines]")) {
      add("wrap", "warn", e.el, `${words} word${words > 1 ? "s" : ""} on ${n} lines (mark data-qa-lines="${n}" if meant)`, e.rects);
    }
  }
  for (const el of stage.querySelectorAll("[data-qa-lines]")) {
    if (!visible(el) || ignored(el, "wrap")) continue;
    const want = parseInt(el.getAttribute("data-qa-lines"), 10);
    const rs = [...el.querySelectorAll("*"), el].flatMap((x) => [...x.childNodes].filter((c) => c.nodeType === 3 && c.data.trim()).flatMap(rectsOf));
    const n = lines(rs);
    if (n > want) add("wrap", "fail", el, `${n} lines, data-qa-lines="${want}"`, rs);
  }

  // overlap: text over text, text over a logo
  for (let i = 0; i < entries.length; i++) {
    for (let j = i + 1; j < entries.length; j++) {
      const a = entries[i], b = entries[j];
      if (a.el.contains(b.el) || b.el.contains(a.el) || ignored(a.el, "overlap") || ignored(b.el, "overlap")) continue;
      const pairs = a.rects.flatMap((p) => b.rects.filter((q) => hit(core(p, a.lh), core(q, b.lh))).map((q) => [p, q]));
      if (!pairs.length) continue;
      const p = core(pairs[0][0], a.lh), q = core(pairs[0][1], b.lh);
      if (covered(a, b, { left: Math.max(p.left, q.left), top: Math.max(p.top, q.top), right: Math.min(p.right, q.right), bottom: Math.min(p.bottom, q.bottom) })) continue;
      add("overlap", "fail", a.el, `overlaps ${sel(b.el)} "${snippet(b.el, 40)}"`, pairs.map((x) => x[0]),
        { other: sel(b.el), otherBox: box(union(pairs.map((x) => x[1]))), pair: b.el });
    }
  }
  const isLogo = (el) => /logo/i.test([el.id, el.getAttribute("class"), el.getAttribute("src"), el.getAttribute("alt"), el.getAttribute("aria-label")].join(" "))
    || /^(logo|keep-clear)$/.test(el.dataset.qa || "");
  const logos = [...stage.querySelectorAll("img, svg, [data-qa], .logo")].filter((el) => isLogo(el) && !el.parentElement.closest("svg") && visible(el));
  for (const logo of logos) {
    const lr = logo.getBoundingClientRect();
    for (const e of entries) {
      if (logo.contains(e.el) || e.el.contains(logo) || ignored(e.el, "overlap")) continue;
      const over = e.rects.filter((q) => hit(core(q, e.lh), lr));
      if (over.length) add("overlap", "fail", e.el, `over the logo ${sel(logo)}`, over, { other: sel(logo), otherBox: box(lr), pair: logo });
    }
  }

  // safe: text, logos and images in a safe box stay inside it
  const outside = (q, z) => q.left < z.left - 2 || q.top < z.top - 2 || q.right > z.right + 2 || q.bottom > z.bottom + 2;
  const media = [...stage.querySelectorAll("img, svg, video, canvas, .logo, [data-qa='logo']")]
    .filter((el) => !el.parentElement.closest("svg") && visible(el))
    .map((el) => ({ el, rects: [el.getBoundingClientRect()].filter(onStage) }));
  for (const e of [...entries, ...media]) {
    const zone = e.el.closest(".safe, .safe-organic");
    if (!zone || ignored(e.el, "safe")) continue;
    const z = zone.getBoundingClientRect(), bad = e.rects.filter((q) => outside(e.lh ? core(q, e.lh) : q, z));
    if (bad.length) add("safe", "fail", e.el, `outside its ${zone.classList.contains("safe") ? ".safe" : ".safe-organic"} box`, bad, { otherBox: box(z) });
  }

  // image: failed or not loaded
  for (const img of stage.querySelectorAll("img")) {
    if (!visible(img) || ignored(img, "image") || (img.complete && img.naturalWidth > 0)) continue;
    add("image", "fail", img, `${img.complete ? "failed to load" : "not loaded"}: ${img.getAttribute("src")}`, [img.getBoundingClientRect()]);
  }

  // blank: no text and no media of any size
  const big = (r) => (r.right - r.left) * (r.bottom - r.top) > 0.01 * S.width * S.height;
  if (!entries.length && !media.some((m) => m.rects.some(big))) add("blank", "warn", null, "nothing on the stage but its background", []);

  // In motion: the element (or what it collides with) changes box or opacity within a frame either side of t.
  // Measured on the GSAP timeline alone, which is then put back at t.
  const state = (el) => {
    const r = el.getBoundingClientRect();
    let o = 1;
    for (let e = el; e; e = e.parentElement) o *= parseFloat(getComputedStyle(e).opacity);
    return [r.left, r.top, r.width, r.height, o * 100];
  };
  const els = [...new Set(issues.flatMap((i) => i.els))], moved = new Set();
  if (els.length) {
    const now = els.map(state), dt = 1 / Studio.meta.fps;
    for (const tt of [Math.max(0, t - dt), Math.min(Studio.meta.duration, t + dt)]) {
      Studio.tl.seek(tt, false);
      els.forEach((el, i) => state(el).some((v, k) => Math.abs(v - now[i][k]) > 1.5) && moved.add(el));
    }
    Studio.tl.seek(t, false);
  }
  return issues.map(({ els, ...i }) => ({ ...i, moving: els.some((el) => moved.has(el)) }));
}

export const INSPECT = (t) => `(${inspect})(${t})`;

const AMBER = "#ffb000", RED = "#ff2d55";
const boxesOf = (issue) => [...issue.boxes.map((b) => ({ ...b, c: RED })), ...(issue.otherBox ? [{ ...issue.otherBox, c: AMBER }] : [])];

/** In-page: outline one problem's boxes on the stage (DRAW) until the screenshot is taken (ERASE). */
export const DRAW = (issue) => `(() => {
  const boxes = ${JSON.stringify(boxesOf(issue))}, o = document.createElement("div");
  o.id = "__qa_layout";
  o.style.cssText = "position:absolute;inset:0;pointer-events:none;z-index:2147483647";
  for (const b of boxes) {
    const d = document.createElement("div");
    d.style.cssText = "position:absolute;left:" + (b.x - 3) + "px;top:" + (b.y - 3) + "px;width:" + (b.w + 6) + "px;height:" + (b.h + 6) +
      "px;outline:4px " + (b.c === "${AMBER}" ? "dashed" : "solid") + " " + b.c;
    o.appendChild(d);
  }
  document.getElementById("stage").appendChild(o);
})()`;
export const ERASE = `document.getElementById("__qa_layout").remove()`;

/** Crop around the problem; what it collides with too, unless that is most of the stage (its edge, a safe box). */
export function cropOf(issue, W, H, pad = 80) {
  const own = boxesOf(issue).filter((b) => b.c !== AMBER || b.w * b.h < 0.25 * W * H);
  const x = Math.max(0, Math.min(...own.map((b) => b.x)) - pad), y = Math.max(0, Math.min(...own.map((b) => b.y)) - pad);
  const x1 = Math.min(W, Math.max(...own.map((b) => b.x + b.w)) + pad), y1 = Math.min(H, Math.max(...own.map((b) => b.y + b.h)) + pad);
  return { x, y, w: Math.max(2, x1 - x), h: Math.max(2, y1 - y) };
}

/** Add this frame's problem to the run: one group per problem (same check and elements) however often it recurs.
 *  Returns the group when it is new (it needs its evidence shot), else null. */
export function record(groups, issue, t, strict) {
  if (issue.moving && !strict && issue.type === "clipped") return null;  // a slide-in, a mask reveal: on purpose
  const severity = issue.moving && !strict ? "warn" : issue.severity;
  const key = [issue.type, issue.selector, issue.other, issue.detail.replace(/\d+/g, "")].join("|");
  let g = groups.find((x) => x.key === key), fresh = null;
  if (!g) {
    g = fresh = { key, id: groups.length + 1, ...issue, severity, times: [] };
    groups.push(g);
  }
  if (severity === "fail") g.severity = "fail";
  g.moving = g.severity === "warn" && (g.moving || issue.moving);
  if (g.times.at(-1) !== t) g.times.push(t);
  return fresh;
}

const TYPES = ["clipped", "broken-word", "wrap", "overlap", "safe", "image", "blank"];

// Sample times as ranges of consecutive samples: "0.25–1.50 s, 4.00 s"
function span(g, times) {
  const rs = [];
  for (const t of g.times) {
    const last = rs.at(-1);
    if (last && times.indexOf(t) === times.indexOf(last[1]) + 1) last[1] = t; else rs.push([t, t]);
  }
  return rs.map(([a, b]) => (a === b ? a.toFixed(2) : `${a.toFixed(2)}–${b.toFixed(2)}`)).join(", ") + " s";
}

export function report(name, meta, groups, times) {
  const count = (ty, sev) => groups.filter((g) => g.type === ty && g.severity === sev).length || "";
  return [
    `# Layout QA: ${name}`, "",
    `${meta.width}x${meta.height}, ${times.length} frames inspected.`, "",
    "| Check | ❌ | ⚠️ |", "|---|---|---|",
    ...TYPES.map((ty) => `| ${ty} | ${count(ty, "fail")} | ${count(ty, "warn")} |`), "",
    groups.length ? "## Problems" : "No layout problems found. ✅",
    ...groups.flatMap((g) => ["",
      `### ${g.severity === "fail" ? "❌" : "⚠️"} ${g.id}. ${g.type}, ${span(g, times)}${g.moving ? " (in motion)" : ""}`, "",
      g.selector ? `\`${g.selector}\`${g.text ? ` "${g.text}"` : ""}: ${g.detail}` : g.detail,
      ...(g.evidence ? ["", `![${g.type} at ${g.times[0].toFixed(2)} s](${g.evidence})`] : []),
    ]), "",
    "Red: the problem. Amber dashed: what it collides with (clipping box, other text, logo, safe box).",
    "⚠️ in motion: the element was moving or fading; fine if it settles. Fix every ❌, or mark an intended case with",
    "`data-qa-ignore=\"<check>\"` / `data-qa-lines=\"N\"` and say why in the production README.", "",
  ].join("\n");
}
