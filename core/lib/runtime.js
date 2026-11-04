/* Composition runtime: one clock for every engine.
 *
 * A composition is an HTML page that:
 *   1. loads /core/node_modules/gsap/dist/gsap.min.js, /core/lib/base.css and this file
 *   2. calls Studio.setup({ width, height, fps, duration })
 *   3. builds its motion on Studio.tl (a paused GSAP timeline), in seconds
 *   4. registers anything else that moves with Studio.onSeek(fn): fn(t) draws
 *      that layer at time t (it may return a promise). Engine adapters in
 *      /engines/ do this for you (Lottie, Three.js, Pixi, <video>).
 *   5. registers anything that must load first with Studio.wait(promise)
 *
 * The renderer calls window.__seek(t) for every frame and screenshots it, so
 * every frame is deterministic. Avoid CSS animations/transitions, setTimeout,
 * requestAnimationFrame loops and Math.random() (use Studio.random(seed)).
 *
 * Reel helpers on the same clock: Studio.captions (word-by-word captions from word timings), Studio.beats (cut on
 * the music), Studio.transition (wipes, pushes, iris… between two layers), formats (one composition → 9:16, 4:5,
 * 1:1, 16:9; Studio.format, Studio.pick).
 *
 * Preview in a browser (served from the repo root):
 *   .../composition/index.html               plays live, loops
 *   .../composition/index.html?t=2.5         freezes at 2.5 s
 *   .../composition/index.html?safe=1        shows the safe-zone overlay
 *   .../composition/index.html?format=4x5    another format the composition declares
 */
(function () {
  const params = new URLSearchParams(location.search);
  const hooks = [];
  const lateHooks = [];
  const pending = [];
  const plates = [];
  const swaps = [];

  // Export sizes per format. 9x16 is the default; a composition lists the others it supports in Studio.setup.
  const FORMATS = { "9x16": [1080, 1920], "4x5": [1080, 1350], "1x1": [1080, 1080], "16x9": [1920, 1080] };
  const clamp01 = (x) => Math.max(0, Math.min(1, x));

  const Studio = {
    meta: null,
    tl: null,
    params,
    FORMATS,

    /** Size the stage. `formats` lists the other formats this composition is laid out for (e.g. ["4x5", "1x1"]);
     *  ?format= (the renderer's --format) picks one, and <html> gets the class fmt-<name> for CSS overrides.
     *  `motionBlur` (true, or { samples = 8, shutter = 0.5 }) makes the renderer average `samples` subframes over
     *  `shutter` of each frame interval (0.5 = a 180° film shutter); --motion-blur / --shutter override it. */
    setup({ width = 1080, height = 1920, fps = 30, duration, formats = [], motionBlur = false }) {
      if (!duration) throw new Error("Studio.setup needs a duration (seconds)");
      const base = Object.keys(FORMATS).find((k) => FORMATS[k][0] === width && FORMATS[k][1] === height) || "custom";
      const all = [base, ...formats.filter((f) => f !== base)];
      for (const f of all) if (f !== "custom" && !FORMATS[f]) throw new Error(`Unknown format "${f}" (${Object.keys(FORMATS).join(", ")})`);
      const format = params.get("format") || base;
      if (!all.includes(format)) throw new Error(`This composition has no "${format}" layout (it declares ${all.join(", ")})`);
      if (format !== base) [width, height] = FORMATS[format];
      const blur = motionBlur === true ? {} : motionBlur || { samples: 1 };
      this.meta = { width, height, fps, duration, format, formats: all,
        motionBlur: { samples: blur.samples ?? 8, shutter: blur.shutter ?? 0.5 } };
      document.documentElement.classList.add("fmt-" + format);
      const stage = document.getElementById("stage");
      stage.style.width = width + "px";
      stage.style.height = height + "px";
      this.tl = gsap.timeline({ paused: true });
      // Make sure the timeline is exactly `duration` long.
      this.tl.set({}, {}, duration);
      if (params.get("safe") === "1") document.documentElement.classList.add("show-safe");
      return this.tl;
    },

    /** The format being rendered ("9x16", "4x5", "1x1", "16x9"). */
    get format() { return this.meta?.format; },

    /** A value per format: Studio.pick({ "9x16": 1.0, "16x9": 0.7, default: 0.9 }). */
    pick(map) { return this.format in map ? map[this.format] : map.default; },

    /** Draw a layer at time t on every seek. Hooks run in registration order; `late` hooks run after all others
     *  (for layers that read other layers' pixels, like engines/gl-transitions.js). */
    onSeek(fn, { late = false } = {}) { (late ? lateHooks : hooks).push(fn); return fn; },

    /** Hold the first frame until this promise settles (assets, engine init). */
    wait(promise) { pending.push(promise); return promise; },

    /** Seeded PRNG (mulberry32): same seed, same numbers, every render. */
    random(seed = 1) {
      let a = seed >>> 0;
      return () => {
        a = (a + 0x6d2b79f5) >>> 0;
        let t = a;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },

    /** Register a Lottie animation (needs lottie.min.js). `start` = second it begins. */
    lottie(el, path, { start = 0, loop = false, speed = 1 } = {}) {
      const anim = lottie.loadAnimation({ container: el, renderer: "svg", loop: false, autoplay: false, path });
      this.wait(new Promise((res) => anim.addEventListener("DOMLoaded", res)));
      this.onSeek((t) => {
        const total = anim.totalFrames;
        let f = Math.max(0, (t - start) * anim.frameRate * speed);
        f = loop ? f % total : Math.min(f, total - 1);
        anim.goToAndStop(f, true);
      });
      return anim;
    },

    /** Register a <video> element (a pre-rendered plate: Blender, a capture, footage).
     *  In a render the renderer decodes the plate to still frames with ffmpeg and the runtime shows them in an
     *  <img> that copies the video's computed style every frame (so GSAP tweens on the video still apply).
     *  Chrome never decodes the video then: no seek races, and colours are ffmpeg's. Previews play the video. */
    video(el, { start = 0 } = {}) {
      el.muted = true; el.pause();
      const plate = { el, start, img: null };
      plates.push(plate);
      if (params.get("plates") === "frames") {
        plate.src = el.currentSrc || el.src || el.querySelector("source")?.src;
        // An empty <video> paints nothing; the <img> next to it shows the frames (__usePlates).
        el.removeAttribute("src");
        for (const s of el.querySelectorAll("source")) s.remove();
        el.load();
        this.onSeek((t) => plate.img && showPlateFrame(plate, t));
        return el;
      }
      el.preload = "auto";
      this.wait(new Promise((res, rej) => {
        // A missing or broken plate fails the render instead of hanging it (the error may have fired already)
        const fail = () => rej(new Error(`Video plate failed to load: ${el.currentSrc || el.src}`));
        if (el.readyState >= 2) return res();
        if (el.error || el.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) return fail();
        el.addEventListener("loadeddata", res, { once: true });
        el.addEventListener("error", fail, { once: true });
      }));
      this.onSeek((t) => new Promise((res) => {
        const target = Math.max(0, Math.min(t - start, (el.duration || 0) - 0.001));
        if (Math.abs(el.currentTime - target) < 0.0005) return res();
        // "seeked" can fire before the new frame is painted, and a screenshot then catches the old one (seen on a
        // cold CI runner): also wait for the frame to be presented. A seek within the same plate frame presents
        // nothing new, so that wait gives up after a moment; the old frame is the right one then.
        // Headless Chrome can also report the frame from *before* the seek (mediaTime 0 right after the first seek
        // to 1 s, then no callback ever again), which let a cold runner's screenshot catch the old frame. So only a
        // frame that can be the target's counts: not after the target, and past the old position when seeking
        // forward. Anything else waits for the fallback.
        const from = el.currentTime, eps = 0.0005;
        let seeked = false, shown = !el.requestVideoFrameCallback, timer;
        const done = () => seeked && shown && (clearTimeout(timer), res());
        const onFrame = (_, m) => {
          if (m.mediaTime <= target + eps && (target < from || m.mediaTime > from + eps)) { shown = true; done(); }
          else if (!shown) el.requestVideoFrameCallback(onFrame);
        };
        if (!shown) el.requestVideoFrameCallback(onFrame);
        el.addEventListener("seeked", () => {
          seeked = true;
          timer = setTimeout(() => { shown = true; done(); }, 250);
          done();
        }, { once: true });
        el.currentTime = target;
      }));
      return el;
    },

    /** What to read a layer's pixels from (a canvas, an <img> or a <video>; a plate's frame <img> in a render). */
    pixels(el) {
      const plate = plates.find((p) => p.el === el || el.contains?.(p.el));
      if (plate) return plate.img || plate.el;
      return el.matches?.("canvas, img, video") ? el : el.querySelector?.("canvas, img, video");
    },

    /* ---------------------------------------------------------------- captions */

    /** Word-by-word captions. `words`: a URL or an array of { text, start, end } (seconds), or whisper.cpp's full
     *  JSON (scripts/transcribe.sh → <prefix>.json). Words are grouped into pages of up to `lines` lines of
     *  `maxChars`; a page also ends at a pause longer than `gap` or at the end of a sentence.
     *  style: "karaoke" (said words take the accent), "pop" (each word pops in as it is said),
     *         "highlight" (a box behind the word being said), "plain" (whole page, no word timing).
     *  offset: when the voice starts in the piece (the VO's "start" in audio/cues.json).
     *  Styling: .captions in base.css, overridable with --caption-* tokens in the brand's tokens.css. */
    captions(el, words, { style = "karaoke", offset = 0, maxChars = 18, lines = 2, gap = 0.6, hold = 0.5,
                          upper = false, pop = 0.14 } = {}) {
      const api = { el, pages: [] };
      const build = (data) => {
        const list = parseWords(data).map((w) => ({ ...w, start: w.start + offset, end: w.end + offset }));
        api.pages = pageWords(list, { maxChars, lines, gap, hold });
        el.classList.add("captions", "captions-" + style);
        el.replaceChildren(...api.pages.map((p) => {
          p.el = div("cap-page");
          for (const line of p.lines) {
            const l = p.el.appendChild(div("cap-line"));
            line.forEach((w, i) => {
              if (i) l.append(" ");
              w.el = l.appendChild(document.createElement("span"));
              w.el.className = "cap-word";
              w.el.textContent = upper ? w.text.toUpperCase() : w.text;
            });
          }
          return p.el;
        }));
      };
      const draw = (t) => {
        for (const p of api.pages) {
          const on = t >= p.start && t < p.end;
          p.el.style.display = on ? "" : "none";
          if (!on) continue;
          const words = p.lines.flat();
          // The word being said stays "now" until the next one starts, so a pause doesn't flicker.
          const now = words.findLast((w) => w.start <= t);
          for (const w of words) {
            const said = t >= w.start;
            w.el.classList.toggle("is-said", said);
            w.el.classList.toggle("is-now", w === now);
            if (style === "pop") {
              const k = clamp01((t - w.start) / pop);
              w.el.style.transform = said ? `scale(${(0.6 + 0.4 * gsap.parseEase("back.out(2.5)")(k)).toFixed(4)})` : "";
            }
          }
        }
      };
      if (typeof words === "string") {
        this.wait(fetch(words).then((r) => {
          if (!r.ok) throw new Error(`Caption words failed to load: ${words} (${r.status})`);
          return r.json();
        }).then(build));
      } else build(words);
      this.onSeek(draw);
      return api;
    },

    /* ---------------------------------------------------------------- beats */

    /** Beat grid for cutting on the music. `src`: a URL or the object written by scripts/beats.mjs
     *  ({ bpm, offset, beats: [s…], downbeats: [s…], onsets: [s…] }), or just { bpm, offset } for a known tempo.
     *  `offset` shifts every time (the music's "start" in audio/cues.json). Returns a promise of the grid;
     *  Studio.beat(n), Studio.bar(n), Studio.onset(n), Studio.snap(t) and Studio.beatPhase(t) work once it settles.
     *    const beats = await Studio.beats("../audio/beats.json", { offset: 0 });
     *    tl.set("#b", { autoAlpha: 1 }, Studio.bar(2));            // a cut on the downbeat of bar 2 */
    beats(src, { offset = 0 } = {}) {
      const p = (typeof src === "string" ? fetch(src).then((r) => {
        if (!r.ok) throw new Error(`Beats failed to load: ${src} (${r.status})`);
        return r.json();
      }) : Promise.resolve(src)).then((g) => {
        const period = 60 / g.bpm;
        const first = g.beats?.length ? g.beats[0] : g.offset || 0;
        const shift = (a) => a?.map((x) => x + offset);
        grid = { ...g, period, first: first + offset, beats: shift(g.beats), downbeats: shift(g.downbeats), onsets: shift(g.onsets) };
        return grid;
      });
      return this.wait(p);
    },
    /** Time of beat n (0-based), from the detected list, else from the tempo. */
    beat(n) { const g = needGrid(); return g.beats?.[n] ?? g.first + n * g.period; },
    /** Time of the downbeat of bar n (0-based, 4 beats a bar unless the grid says otherwise). */
    bar(n) { const g = needGrid(); return g.downbeats?.[n] ?? this.beat(n * (g.beatsPerBar || 4)); },
    /** Time of onset n (a hit in the music: drum, note start), if scripts/beats.mjs found any. */
    onset(n) { return needGrid().onsets?.[n]; },
    /** The beat nearest to t. */
    snap(t) { const g = needGrid(); return this.beat(Math.max(0, Math.round((t - g.first) / g.period))); },
    /** 0 on a beat, rising to 1 just before the next: for pulses in onSeek (scale = 1 + 0.05 * (1 - phase)). */
    beatPhase(t) { const g = needGrid(); const k = (t - g.first) / g.period; return k < 0 ? 1 : k - Math.floor(k); },

    /* ---------------------------------------------------------------- transitions */

    /** A transition from one layer to another, drawn from t: before `at` only `from` shows, after `at + duration`
     *  only `to` shows, in between `to` comes in over `from`.
     *  type: "fade", "wipe-left|right|up|down", "iris", "diamond", "blinds", "push-left|right|up|down",
     *        "slide-left|right|up|down", "zoom", "whip-left|right", "flash".
     *  The transition owns the two layers' visibility, and their clip-path, transform, filter and opacity while it
     *  runs: animate what is inside a layer, not the layer itself. Pixel effects (dissolve, ripple, glitch…)
     *  between canvases, plates and images: engines/gl-transitions.js. */
    transition(from, to, { at, duration = 0.5, type = "wipe-left", ease = "power2.inOut" } = {}) {
      from = el(from); to = el(to);
      if (typeof at !== "number") throw new Error("Studio.transition needs `at` (seconds)");
      const curve = gsap.parseEase(ease);
      const flash = type === "flash" ? document.getElementById("stage").appendChild(div("st-flash")) : null;
      this.swap(from, to, at, at + duration);
      // seek() resets these layers' styles once per frame (a layer can be in two transitions: A → B → C)
      transitioned.add(from).add(to);
      this.onSeek((t) => {
        if (flash) flash.style.opacity = "0";
        const raw = (t - at) / duration;
        if (raw < 0 || raw >= 1) return;
        const p = curve(clamp01(raw));
        const [kind, dir] = type.split("-");
        const sign = dir === "left" || dir === "up" ? -1 : 1;
        const axis = dir === "up" || dir === "down" ? "Y" : "X";
        const pct = (x) => (x * 100).toFixed(3) + "%";
        switch (kind) {
          case "fade": to.style.opacity = p.toFixed(4); break;
          case "wipe": {
            const r = pct(1 - p);
            const inset = { left: `0 0 0 ${r}`, right: `0 ${r} 0 0`, up: `${r} 0 0 0`, down: `0 0 ${r} 0` }[dir || "left"];
            // wipe-left: the edge travels right to left, so the new layer shows from the right first
            to.style.clipPath = `inset(${inset})`;
            break;
          }
          case "iris": to.style.clipPath = `circle(${(p * 75).toFixed(3)}% at 50% 50%)`; break;
          case "diamond": {
            const d = (p * 100).toFixed(3);
            to.style.clipPath = `polygon(50% ${50 - d}%, ${50 + +d}% 50%, 50% ${50 + +d}%, ${50 - d}% 50%)`;
            break;
          }
          case "blinds": {
            const m = `repeating-linear-gradient(90deg, #000 0 ${(p * 120).toFixed(3)}px, transparent ${(p * 120).toFixed(3)}px 120px)`;
            to.style.maskImage = to.style.webkitMaskImage = p >= 0.999 ? "" : m;
            break;
          }
          case "push":
            from.style.transform = `translate${axis}(${pct(sign * p)})`;
            to.style.transform = `translate${axis}(${pct(sign * (p - 1))})`;
            break;
          case "slide": to.style.transform = `translate${axis}(${pct(-sign * (1 - p))})`; break;
          case "zoom":
            from.style.transform = `scale(${(1 + 0.25 * p).toFixed(4)})`;
            from.style.opacity = (1 - p).toFixed(4);
            to.style.transform = `scale(${(1.15 - 0.15 * p).toFixed(4)})`;
            to.style.opacity = p.toFixed(4);
            break;
          case "whip": {
            const blur = (Math.sin(Math.PI * clamp01(raw)) * 40).toFixed(2);
            from.style.transform = `translateX(${pct(sign * p)})`;
            to.style.transform = `translateX(${pct(sign * (p - 1))})`;
            from.style.filter = to.style.filter = `blur(${blur}px)`;
            break;
          }
          case "flash": {
            // Up to white, cut at the peak, back down
            const k = clamp01(raw);
            flash.style.opacity = (k < 0.5 ? k * 2 : (1 - k) * 2).toFixed(4);
            if (k < 0.5) to.classList.add("st-off"); else from.classList.add("st-off");
            break;
          }
          default: throw new Error(`Unknown transition type "${type}"`);
        }
      });
    },

    /** Show `from` until `at`, `to` from `at` on (both between `at` and `end`). Used by transitions; also a plain
     *  hard cut: Studio.swap("#a", "#b", 2). */
    swap(from, to, at, end = at) { swaps.push({ from: el(from), to: el(to), at, end }); },
  };

  /* ---------------------------------------------------------------- helpers */

  let grid = null;
  const transitioned = new Set();
  const TOUCHED = ["clipPath", "transform", "filter", "opacity", "maskImage", "webkitMaskImage"];
  const needGrid = () => {
    if (!grid) throw new Error("Studio.beats(...) has not loaded yet: await it before using Studio.beat/bar/snap");
    return grid;
  };
  const div = (cls) => Object.assign(document.createElement("div"), { className: cls });
  const el = (x) => {
    const e = typeof x === "string" ? document.querySelector(x) : x;
    if (!e) throw new Error(`No element for ${x}`);
    return e;
  };

  // Words from: [{ text|word, start, end }] | { words: [...] } | whisper.cpp -ojf JSON ({ transcription: [...] }).
  function parseWords(data) {
    if (Array.isArray(data)) return data.map((w) => ({ text: String(w.text ?? w.word).trim(), start: +w.start, end: +w.end }));
    if (Array.isArray(data.words)) return parseWords(data.words);
    if (!Array.isArray(data.transcription)) throw new Error("Caption words: expected an array, { words } or whisper.cpp JSON");
    const words = [];
    for (const seg of data.transcription) {
      for (const tok of seg.tokens || []) {
        if (/^\s*\[_/.test(tok.text) || !tok.text.trim()) continue;  // [_BEG_], [_TT_n] and other specials
        const start = tok.offsets.from / 1000, end = tok.offsets.to / 1000;
        const last = words[words.length - 1];
        // whisper splits words into tokens; a token that starts with a space starts a new word
        if (!last || /^\s/.test(tok.text) || /^[^\p{L}\p{N}']/u.test(last.text.slice(-1))) {
          words.push({ text: tok.text.trim(), start, end });
        } else { last.text += tok.text; last.end = end; }
      }
    }
    return words.filter((w) => w.text);
  }

  function pageWords(words, { maxChars, lines, gap, hold }) {
    const pages = [];
    let page = null;
    words.forEach((w, i) => {
      const prev = words[i - 1];
      const line = page?.lines[page.lines.length - 1];
      const breakPage = !page || w.start - prev.end > gap || /[.!?…]$/.test(prev.text);
      if (breakPage) { page = { lines: [[w]] }; pages.push(page); return; }
      const len = line.reduce((n, x) => n + x.text.length + 1, -1);
      if (len + 1 + w.text.length <= maxChars) line.push(w);
      else if (page.lines.length < lines) page.lines.push([w]);
      else { page = { lines: [[w]] }; pages.push(page); }
    });
    pages.forEach((p, i) => {
      const all = p.lines.flat();
      p.start = all[0].start;
      p.end = Math.min(all[all.length - 1].end + hold, pages[i + 1] ? pages[i + 1].lines[0][0].start : Infinity);
      p.text = all.map((w) => w.text).join(" ");
    });
    return pages;
  }

  // A plate in a render: frame n of the ffmpeg-decoded plate in an <img> styled like the video.
  const PLATE_STYLE = ["display", "visibility", "opacity", "position", "top", "left", "right", "bottom", "width",
    "height", "margin", "transform", "transform-origin", "object-fit", "object-position", "filter", "border-radius",
    "clip-path", "mix-blend-mode", "z-index", "box-sizing"];
  async function showPlateFrame(plate, t) {
    const { el, img, frames } = plate;
    const n = Math.max(0, Math.min(frames.count - 1, Math.floor((t - plate.start) * frames.fps + 1e-6)));
    const cs = getComputedStyle(el);
    img.style.cssText = PLATE_STYLE.map((k) => `${k}:${cs.getPropertyValue(k)}`).join(";");
    if (plate.n === n) return;
    plate.n = n;
    img.src = `${frames.base}/${String(n + 1).padStart(6, "0")}.${frames.ext}`;
    await img.decode();
  }

  async function seek(t) {
    Studio.tl.seek(t, false);
    // Cuts and transitions decide which layers show; .st-off (base.css) wins over GSAP's inline visibility.
    const off = new Set();
    for (const s of swaps) { if (t < s.at) off.add(s.to); if (t >= s.end) off.add(s.from); }
    for (const s of swaps) for (const e of [s.from, s.to]) e.classList.toggle("st-off", off.has(e));
    for (const e of transitioned) for (const k of TOUCHED) e.style[k] = "";
    for (const fn of hooks) await fn(t);
    for (const fn of lateHooks) await fn(t);
    // In a render, paint every frame from scratch. Chrome reuses raster from the previous frame, so a frame drawn
    // right after its neighbour could differ (edge anti-aliasing, up to 48 levels) from the same frame drawn alone:
    // video frames didn't match stills, and parallel workers didn't match one worker (2026-11-03).
    if (renderMode) {
      const stage = document.getElementById("stage"), d = stage.style.display;
      stage.style.display = "none";
      void stage.offsetHeight;
      stage.style.display = d;
    }
  }
  const renderMode = params.get("render") === "1";

  window.Studio = Studio;
  window.__seek = seek;
  window.__meta = () => Studio.meta;
  // The renderer reads the plates, decodes them with ffmpeg and hands back where their frames are.
  window.__plates = () => plates.map((p, i) => ({ i, src: p.src }));
  window.__usePlates = async (list) => {
    for (const { i, base, count, fps, ext } of list) {
      const p = plates[i];
      p.frames = { base, count, fps, ext };
      p.img = document.createElement("img");
      p.img.className = "st-plate";
      p.el.after(p.img);
    }
  };
  window.__ready = (async () => {
    await new Promise((r) => (document.readyState === "complete" ? r() : addEventListener("load", r)));
    await document.fonts.ready;
    // Module scripts may register more work while earlier work loads: wait until it settles.
    for (let n = 0; n < pending.length; n = pending.length) await Promise.all(pending.slice(n));
    await Promise.all([...document.images].map((img) => (img.complete ? null : new Promise((r) => (img.onload = img.onerror = r)))));
    if (!Studio.meta) throw new Error("Composition never called Studio.setup()");
    return true;
  })();

  // Browser preview: freeze at ?t=, otherwise play in a loop. The renderer passes ?render=1.
  window.__ready.then(() => {
    if (params.get("render") === "1") return;
    if (params.has("t")) return seek(parseFloat(params.get("t")));
    const t0 = performance.now();
    let busy = false;
    const loop = async () => {
      if (!busy) { busy = true; await seek(((performance.now() - t0) / 1000) % Studio.meta.duration); busy = false; }
      requestAnimationFrame(loop);
    };
    loop();
  });
})();
