/* Lip sync on the Studio clock: Rhubarb mouth cues (scripts/lipsync.sh) → a talking character.
 *
 *   scripts/lipsync.sh audio/vo.wav audio/vo.visemes.json --dialog audio/vo.txt   # writes .json and a .js twin
 *   <script src="../audio/vo.visemes.js"></script>      → window.LIPSYNC["vo.visemes"]
 *   <script src="/engines/lipsync.js"></script>
 *   const cues = LipSync.cues("vo.visemes");            // or: await LipSync.load("../audio/vo.visemes.json")
 *
 * Three ways to show it, each a pure function of t:
 *   SVG rig     SvgRig(svg).lipsync(cues, { offset })      draw #mouth-A … #mouth-X, any subset (svg-rig.js)
 *   Mascot PNG  const m = LipSync.mountMouth(el, { cx, cy, w, aspect, shapes: LipSync.mouthSet({ ink, cover }) });
 *               LipSync.addToTimeline(Studio.tl, cues, m, { offset });   // one seek-safe tl.set per cue
 *   3D, any update(t)
 *               const p = LipSync.paramsAt(cues, t, "mouth", { offset });   // { open, wide, round }, 0…1
 *               Three.js: morph targets or scales. Blender: engines/blender/lipsync.py (same tables).
 *
 * Shapes (Rhubarb, Preston Blair set): A closed (M B P) · B slightly open, teeth (K S T EE) · C open (EH AE) ·
 * D wide open (AA) · E rounded (AO ER) · F puckered (UW W) · G teeth on lip (F V) · H tongue up (L) · X rest.
 * `offset` is where the VO starts on the piece's timeline (audio/cues.json): cue times count from the file start.
 * `lead` shows every shape that many seconds early (a frame or two reads as better sync on some voices).
 */
(function () {
  "use strict";

  const SHAPES = { A: "closed (M B P)", B: "slightly open, teeth (K S T EE)", C: "open (EH AE)", D: "wide open (AA)",
                   E: "rounded (AO ER)", F: "puckered (UW W)", G: "teeth on lip (F V)", H: "tongue up (L)", X: "rest" };

  // Nearest drawn shape when a rig leaves some out: Rhubarb's own reduction first (G→A, H→C, X→A), then the
  // two-part rig of svg-rig.js (#mouth-closed is the resting mouth, #mouth-open the talking one).
  const FALLBACK = {
    A: ["A", "X", "closed"], B: ["B", "C", "open"], C: ["C", "B", "H", "D", "open"], D: ["D", "C", "H", "open"],
    E: ["E", "F", "C", "open"], F: ["F", "E", "B", "open"], G: ["G", "A", "X", "closed"], H: ["H", "C", "D", "open"],
    X: ["X", "closed", "A"],
  };

  // Mouth values per shape for rigs driven by numbers (morph targets, shape keys, scales).
  // Mirrors engines/blender/lipsync.py TABLES: change both together. Pass your own table for another rig.
  const TABLES = {
    mouth: {
      A: { open: 0, wide: 0.3, round: 0 }, B: { open: 0.2, wide: 0.5, round: 0 }, C: { open: 0.5, wide: 0.4, round: 0 },
      D: { open: 1, wide: 0.5, round: 0 }, E: { open: 0.5, wide: 0, round: 0.6 }, F: { open: 0.25, wide: 0, round: 1 },
      G: { open: 0.1, wide: 0.4, round: 0 }, H: { open: 0.6, wide: 0.3, round: 0 }, X: { open: 0, wide: 0, round: 0 },
    },
  };

  /** Cues from a window.LIPSYNC key (or a path ending in it), Rhubarb's JSON, or an array → sorted [{start, end, value}]. */
  function cues(src) {
    if (typeof src === "string") {
      const key = src.replace(/^.*\//, "").replace(/\.js(on)?$/, "");
      src = (window.LIPSYNC || {})[key];
      if (!src) throw new Error(`LipSync: window.LIPSYNC["${key}"] is missing (load its .visemes.js first)`);
    }
    const arr = Array.isArray(src) ? src : src && src.mouthCues;
    if (!Array.isArray(arr)) throw new Error("LipSync: expected Rhubarb JSON ({ mouthCues: [...] }) or an array of cues");
    return arr.map((c) => ({ start: +c.start, end: +c.end, value: String(c.value) })).sort((a, b) => a.start - b.start);
  }

  /** Fetch a .visemes.json; the first frame waits for it (Studio.wait). Build the timeline in .then / after await. */
  function load(url) {
    const p = fetch(url).then((r) => {
      if (!r.ok) throw new Error(`LipSync: ${url} → ${r.status}`);
      return r.json();
    }).then(cues);
    if (window.Studio) Studio.wait(p);
    return p;
  }

  function indexAt(list, t) {
    const n = list.length;
    if (!n || t < list[0].start || t >= list[n - 1].end) return -1;
    let lo = 0, hi = n - 1;
    while (lo < hi) { const mid = (lo + hi) >> 1; if (list[mid].end <= t) lo = mid + 1; else hi = mid; }
    return list[lo].start <= t && t < list[lo].end ? lo : -1;
  }

  /** The shape at time t ("X" outside the track). */
  function shapeAt(list, t, offset = 0) {
    const i = indexAt(list, t - offset);
    return i < 0 ? "X" : list[i].value;
  }

  /** True while a shape other than rest is on: for nods, brow lifts and gestures that go with speech. */
  function talking(list, t, offset = 0) { return shapeAt(list, t, offset) !== "X"; }

  function table(name) {
    const tb = typeof name === "string" ? TABLES[name] : name;
    if (!tb || !tb.X) throw new Error(`LipSync: unknown table ${name} (${Object.keys(TABLES).join(" | ")}, or an object with A–H and X)`);
    return tb;
  }

  /** A copy of the table's values for one shape. */
  function params(shape, tbl = "mouth") {
    const tb = table(tbl);
    return Object.assign({}, tb[shape] || tb.X);
  }

  /** Values at time t; the first `blend` seconds (default 0.04) of each cue ramp from the previous shape. */
  function paramsAt(list, t, tbl = "mouth", { offset = 0, blend = 0.04 } = {}) {
    const tt = t - offset, i = indexAt(list, tt);
    const cur = params(i < 0 ? "X" : list[i].value, tbl);
    if (!blend || i <= 0) return cur;
    let u = (tt - list[i].start) / blend;
    if (u >= 1) return cur;
    u = u * u * (3 - 2 * u);
    const prev = params(list[i - 1].value, tbl);
    for (const k in cur) cur[k] = prev[k] + (cur[k] - prev[k]) * u;
    return cur;
  }

  /** The first key in FALLBACK[shape] that `has(key)` accepts, or null. */
  function pick(shape, has) {
    for (const k of FALLBACK[shape] || FALLBACK.X) if (has(k)) return k;
    return null;
  }

  // ---------- Drawn mouths in an SVG (used by SvgRig.lipsync) ----------

  /** { A: el, …, X: el, open: el, closed: el } for the #mouth-* parts found under root. */
  function drawnMouths(root) {
    const parts = {};
    for (const k of [...Object.keys(SHAPES), "open", "closed"]) {
      const el = root.querySelector("#mouth-" + k);
      if (el) parts[k] = el;
    }
    return parts;
  }

  /** Show one part per cue (opacity, one tl.set pair per change); back to the resting part after the last cue. */
  function swapParts(tl, list, parts, { offset = 0, lead = 0 } = {}) {
    tl = tl || Studio.tl;
    const els = [...new Set(Object.values(parts))];
    if (!els.length) return tl;
    const of = (shape) => parts[pick(shape, (k) => k in parts)] || null;
    const rest = of("X") || els[0];
    gsap.set(els, { opacity: 0 });
    gsap.set(rest, { opacity: 1 });
    const at = (t) => Math.max(0, t + offset - lead);
    let cur = rest;
    const show = (el, t) => {
      if (!el || el === cur) return;
      tl.set(cur, { opacity: 0 }, at(t)).set(el, { opacity: 1 }, at(t));
      cur = el;
    };
    for (const c of list) show(of(c.value), c.start);
    if (list.length) show(rest, list[list.length - 1].end);
    return tl;
  }

  // ---------- A mouth drawn over a mascot image ----------

  /** A mouth set in a 100×60 box, one SVG snippet per shape. `cover` paints a rounded patch first to hide the
   *  image's own mouth (use the face colour; null to skip). X is empty: the image's own mouth shows at rest. */
  function mouthSet({ ink = "#222222", cover = null, tongue = "#F6A28E", teeth = "#FFFFFF" } = {}) {
    const patch = cover ? `<rect x="1" y="2" width="98" height="56" rx="28" fill="${cover}"/>` : "";
    const line = `<path d="M33 31H67" fill="none" stroke="${ink}" stroke-width="6" stroke-linecap="round"/>`;
    return {
      X: "",
      A: patch + line,
      B: patch + `<rect x="31" y="26" width="38" height="11" rx="5.5" fill="${ink}"/>`,
      C: patch + `<ellipse cx="50" cy="31" rx="19" ry="11" fill="${ink}"/>`,
      D: patch + `<ellipse cx="50" cy="31" rx="23" ry="17" fill="${ink}"/><ellipse cx="50" cy="41" rx="11" ry="6" fill="${tongue}"/>`,
      E: patch + `<circle cx="50" cy="31" r="11" fill="${ink}"/>`,
      F: patch + `<ellipse cx="50" cy="31" rx="7" ry="9" fill="${ink}"/>`,
      G: patch + line + `<rect x="40" y="24" width="20" height="7" rx="2" fill="${teeth}"/>`,
      H: patch + `<ellipse cx="50" cy="31" rx="19" ry="13" fill="${ink}"/><ellipse cx="50" cy="28" rx="9" ry="6" fill="${tongue}"/>`,
    };
  }

  /** The <svg> for a mouth set; shapes it leaves out fall back to the nearest one it has. */
  function mouthSVG(shapes = mouthSet()) {
    const g = Object.keys(SHAPES).map((k) => {
      const src = pick(k, (s) => shapes[s] != null);
      return `<g class="m m-${k}">${src ? shapes[src] : ""}</g>`;
    }).join("");
    return `<svg viewBox="0 0 100 60" width="100%" height="100%" preserveAspectRatio="xMidYMid meet">${g}</svg>`;
  }

  let cssDone = false;
  function ensureCSS() {
    if (cssDone) return;
    cssDone = true;
    const rules = [".ls-talk { position: relative; }", ".ls-talk > img { display: block; width: 100%; height: auto; }",
                   ".ls-mouth { position: absolute; pointer-events: none; }", ".ls-mouth .m { display: none; }"];
    for (const k of Object.keys(SHAPES)) rules.push(`.ls-mouth[data-viseme="${k}"] .m-${k} { display: inline; }`);
    const s = document.createElement("style");
    s.textContent = rules.join("\n");
    document.head.appendChild(s);
  }

  /** Put a mouth over a character image. container: an element sized as you like, its first child the <img>
   *  (it fills the container's width). cx, cy: the mouth's centre, w: its width, all as fractions of the image;
   *  aspect: the image's width / height. Measure them on the brand's file once and keep them in the brand README.
   *  Returns the mouth element for addToTimeline. */
  function mountMouth(container, { shapes = mouthSet(), cx, cy, w, aspect = 1 } = {}) {
    if (![cx, cy, w].every((v) => typeof v === "number")) throw new Error("LipSync.mountMouth needs cx, cy and w (fractions of the image)");
    ensureCSS();
    container.classList.add("ls-talk");
    const el = document.createElement("div");
    el.className = "ls-mouth";
    el.setAttribute("data-viseme", "X");
    const h = w * 0.6 * aspect; // the 100×60 box's height as a fraction of the image height
    el.style.left = ((cx - w / 2) * 100).toFixed(3) + "%";
    el.style.top = ((cy - h / 2) * 100).toFixed(3) + "%";
    el.style.width = (w * 100).toFixed(3) + "%";
    el.style.height = (h * 100).toFixed(3) + "%";
    el.innerHTML = mouthSVG(shapes);
    container.appendChild(el);
    return el;
  }

  /** Seek-safe: one tl.set(data-viseme) per cue on the timeline (Studio.tl when tl is null). */
  function addToTimeline(tl, list, el, { offset = 0, lead = 0 } = {}) {
    tl = tl || Studio.tl;
    tl.set(el, { attr: { "data-viseme": "X" } }, Math.max(0, offset - lead - 0.001));
    for (const c of list) tl.set(el, { attr: { "data-viseme": c.value } }, Math.max(0, c.start + offset - lead));
    if (list.length) tl.set(el, { attr: { "data-viseme": "X" } }, Math.max(0, list[list.length - 1].end + offset - lead));
    return tl;
  }

  window.LipSync = { SHAPES, FALLBACK, TABLES, cues, load, shapeAt, talking, params, paramsAt, pick, drawnMouths,
                     swapParts, mouthSet, mouthSVG, mountMouth, addToTimeline };
})();
