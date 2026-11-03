/* Ad kit: common ad scenarios and persuasion patterns as reusable scenes on the Studio clock.
 *
 *   <link rel="stylesheet" href="/engines/ad-kit/ad-kit.css">
 *   <script src="/core/node_modules/gsap/dist/gsap.min.js"></script>
 *   <script src="/core/lib/runtime.js"></script>
 *   <script src="/engines/svg-rig.js"></script>
 *   <script src="/engines/ad-kit/ad-kit.js"></script>      // core + generic scenes + acts
 *   <script src="/engines/ad-kit/patterns.js"></script>    // persuasion patterns (brief → scenes)
 *   AdKit.build({ style: "fun", size: "reel", placement: "organic", cast, forbid, scenes: [...] })
 *   AdKit.build({ ...AdKit.pattern("pas", brief), style, cast })
 *
 * A scene is { type, dur, ...content }. Scenes play back to back (hard cuts). `cast(key, style)` returns an SVG
 * string for an actor (a brand's characters; feet at y≈278 of a 300×300 viewBox). Brands add scenes with
 * AdKit.scene(name, fn) and actor motions with AdKit.act(name, fn).
 *
 * Guardrails (ethics, enforced): `stat`, `quote`, `urgency` and `authority` scenes refuse to build without a real
 * source; `forbid` (the brand's banned words) is checked against every string in the spec. Errors fail the render.
 */
(function () {
  const AK = { scenes: {}, acts: {}, patterns: {} };
  AK.scene = (name, fn, meta = {}) => (AK.scenes[name] = Object.assign(fn, meta));
  AK.act = (name, fn) => (AK.acts[name] = fn);

  // Motion personality per style. "fun": bouncy, overshoot, big hops. "adult": dry, smaller moves, no squash.
  AK.STYLES = {
    fun:   { pop: "back.out(1.8)", ease: "power2.out", inEase: "power3.out", hop: 90, idle: 10, bounce: 34, flash: true, wobble: 1 },
    adult: { pop: "power3.out",    ease: "power2.out", inEase: "power2.out", hop: 0,  idle: 4,  bounce: 10, flash: false, wobble: .45 },
  };
  AK.SIZES = { reel: [1080, 1920], feed: [1080, 1350], square: [1080, 1080], landscape: [1920, 1080], banner: [1200, 628] };
  /** Scenes start their entrances this long before the cut (while the layer is still hidden), so the first frame after a cut is already moving. */
  AK.PRE = 0.12;

  function safeBox(W, H, placement) {
    if (H === 1920) return placement === "paid" ? { l: 65, r: 1015, t: 269, b: 1248 } : { l: 65, r: 961, t: 221, b: 1498 };
    if (W > H) { const m = Math.round(H * 0.075); return { l: Math.round(W * 0.05), r: Math.round(W * 0.95), t: m, b: H - m }; }
    return { l: 65, r: W - 65, t: 70, b: H - 70 };
  }

  function strings(o, out = []) {
    if (typeof o === "string") out.push(o);
    else if (Array.isArray(o)) o.forEach((v) => strings(v, out));
    else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) if (k !== "source" && k !== "type" && k !== "act" && k !== "actor") strings(v, out);
    return out;
  }

  AK.check = function (spec) {
    for (const s of spec.scenes) {
      const def = AK.scenes[s.type];
      if (!def) throw new Error(`AdKit: unknown scene type "${s.type}"`);
      for (const f of def.requires || []) {
        if (s[f] === undefined || s[f] === null || s[f] === "")
          throw new Error(`AdKit guardrail: scene "${s.type}" needs a real "${f}" (${def.why || "no invented claims"})`);
      }
      if (def.validate) def.validate(s, spec);
    }
    const bad = (spec.forbid || []).map((w) => (Object.prototype.toString.call(w) === "[object RegExp]" ? w : new RegExp(`\\b${w}\\b`, "i")));
    for (const str of strings(spec.scenes)) for (const re of bad) if (re.test(str))
      throw new Error(`AdKit guardrail: "${str}" uses a word the brand forbids (${re})`);
  };

  AK.build = function (spec) {
    const style = spec.style || "fun", S = AK.STYLES[style];
    const [W, H] = AK.SIZES[spec.size || "reel"];
    const L = safeBox(W, H, spec.placement || "organic");
    AK.check(spec);
    let t = 0;
    const plan = spec.scenes.map((s) => { const d = s.dur ?? AK.scenes[s.type].dur ?? 2; const p = { s, t0: t, t1: t + d }; t += d; return p; });
    const tl = Studio.setup({ width: W, height: H, fps: spec.fps || 30, duration: +t.toFixed(3) });
    const stage = document.getElementById("stage");
    stage.classList.add("ak", "ak-" + style, "ak-" + (spec.size || "reel"));
    // k scales every size in px (fonts, actors, spacing) from the 1080-wide reel design.
    const landscape = W > H, k = landscape ? H / 1080 : W / 1080;
    stage.style.setProperty("--ak-s", k.toFixed(4));
    const h = L.b - L.t, textH = Math.round(h * (spec.textShare ?? 0.36));
    // Text region (tl..tr, textTop..textBottom) and stage region (sl..sr, stageTop..stageBottom): stacked in portrait,
    // side by side in landscape (text left, stage right).
    const R = landscape
      ? { tl: L.l, tr: Math.round(L.l + (L.r - L.l) * 0.47), textTop: Math.round(L.t + h * 0.14), textBottom: L.b, sl: Math.round(L.l + (L.r - L.l) * 0.5), sr: L.r, stageTop: L.t, stageBottom: L.b }
      : { tl: L.l, tr: L.r, textTop: L.t, textBottom: L.t + textH, sl: L.l, sr: L.r, stageTop: L.t + textH + Math.round(20 * k), stageBottom: L.b };
    R.cx = Math.round((R.sl + R.sr) / 2);
    const ctx = makeCtx({ tl, W, H, L, R, k, landscape, style, S, spec, cast: spec.cast || (() => ""), rnd: Studio.random(spec.seed || 7) });
    plan.forEach((p, i) => {
      const layer = document.createElement("div");
      layer.className = "ak-scene ak-" + p.s.type;
      stage.appendChild(layer);
      gsap.set(layer, { autoAlpha: 0 });
      tl.set(layer, { autoAlpha: 1 }, p.t0);
      if (i < plan.length - 1) tl.set(layer, { autoAlpha: 0 }, p.t1);
      ctx.scene = p; ctx.layer = layer;
      AK.scenes[p.s.type](ctx, p.s, p.t0, p.t1, layer);
    });
    if (spec.background) stage.style.background = spec.background;
    return { tl, plan, duration: t, ctx };
  };

  function makeCtx(c) {
    const { tl, S } = c;
    const el = (parent, tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; parent.appendChild(e); return e; };
    const ctx = Object.assign(c, {
      el,
      /** Text block in the text region: { eyebrow, title, sub, chips, y, align, size } → element. */
      text(parent, { eyebrow, title, sub, chips, y = 0, align = "left", size, width, full = false } = {}) {
        const box = el(parent, "div", "ak-text");
        const { L, R } = this, left = full ? L.l : R.tl, w = width || (full ? L.r - L.l : R.tr - R.tl);
        Object.assign(box.style, { left: left + "px", width: w + "px", top: (R.textTop + y * this.k) + "px", textAlign: align });
        if (eyebrow) el(box, "div", "ak-eyebrow", eyebrow);
        if (title) { const tt = el(box, "div", "ak-title", title); if (size) tt.style.fontSize = (size * this.k) + "px"; }
        if (sub) el(box, "div", "ak-sub", sub);
        if (chips && chips.length) { const ul = el(box, "ul", "ak-chips"); if (align === "center") ul.style.justifyContent = "center"; chips.forEach((c) => el(ul, "li", "", c)); }
        return box;
      },
      /** Reveal a text block at t: lines rise in, chips follow. Optional hide at `until`. */
      reveal(box, t, until) {
        const kids = [...box.children];
        gsap.set(box, { autoAlpha: 0 });
        tl.set(box, { autoAlpha: 1 }, t);
        kids.forEach((k, i) => {
          const items = k.tagName === "UL" ? [...k.children] : [k];
          tl.fromTo(items, { autoAlpha: 0, y: 36 }, { autoAlpha: 1, y: 0, duration: 0.38, ease: S.inEase, stagger: 0.07, immediateRender: false }, t + i * 0.09);
        });
        if (until != null) tl.to(box, { autoAlpha: 0, duration: 0.15 }, until - 0.15);
        return box;
      },
      /** A sequence of text beats inside one scene: [{ at, eyebrow, title, sub, chips }]. `at` is relative to t0. */
      beats(parent, list, t0, t1, opts = {}) {
        list.forEach((b, i) => {
          const until = i < list.length - 1 ? t0 + list[i + 1].at : (opts.holdLast ? null : t1);
          this.reveal(this.text(parent, { ...b, ...opts }), t0 + b.at, until === t1 ? null : until);
        });
      },
      /** Place an actor so its feet stand at (cx, bottom). Returns { wrap, svg, rig, w }. */
      actor(parent, key, { cx = this.R.cx, bottom = this.R.stageBottom - 20 * this.k, w = 460 * this.k, style = this.style, z } = {}) {
        const wrap = el(parent, "div", "ak-actor", this.cast(key, style));
        Object.assign(wrap.style, { width: w + "px", height: w + "px", left: (cx - w / 2) + "px", top: (bottom - (w * 278) / 300) + "px" });
        if (z != null) wrap.style.zIndex = z;
        gsap.set(wrap, { transformOrigin: "50% 92.7%" });
        const svg = wrap.querySelector("svg");
        const rig = svg && window.SvgRig ? SvgRig(svg) : null;
        return { wrap, svg, rig, w, key, part: (id) => svg && svg.querySelector("#" + id) };
      },
      /** Bring an actor on at t: from "bottom" | "left" | "right" | "drop" | "pop" | { y } (rise by y px from behind a prop). */
      enter(a, t, from = "pop") {
        const d = 0.5;
        gsap.set(a.wrap, { autoAlpha: 0 });
        tl.set(a.wrap, { autoAlpha: 1 }, t);
        if (from === "pop") tl.fromTo(a.wrap, { scale: 0.2 }, { scale: 1, duration: d, ease: S.pop, immediateRender: false }, t);
        else if (from === "left" || from === "right") {
          const dx = (from === "left" ? -1 : 1) * Math.max(900 * this.k, this.W * 0.6);
          tl.fromTo(a.wrap, { x: dx }, { x: 0, duration: d, ease: S.inEase, immediateRender: false }, t);
          if (S.hop) tl.fromTo(a.wrap, { y: 0 }, { y: -S.hop * 0.6 * this.k, duration: d / 2, ease: "sine.out", yoyo: true, repeat: 1, immediateRender: false }, t);
        } else if (from === "drop") tl.fromTo(a.wrap, { y: -this.H * 0.7 }, { y: 0, duration: d + 0.1, ease: S.style === "adult" ? "power2.out" : "bounce.out", immediateRender: false }, t);
        else {
          const y = typeof from === "object" ? from.y : 500 * this.k;
          if (S.hop) {
            tl.fromTo(a.wrap, { y, scale: 0.3 }, { y: -S.hop * this.k, scale: 1, duration: 0.36, ease: "power2.out", immediateRender: false }, t)
              .to(a.wrap, { y: 0, duration: 0.22, ease: "power2.in" }, t + 0.36)
              .to(a.wrap, { scaleY: 0.9, scaleX: 1.06, duration: 0.07 }, t + 0.58)
              .to(a.wrap, { scaleY: 1, scaleX: 1, duration: 0.2, ease: "back.out(3)" }, t + 0.65);
          } else tl.fromTo(a.wrap, { y, scale: 0.3 }, { y: 0, scale: 1, duration: 0.55, ease: S.inEase, immediateRender: false }, t);
        }
        return a;
      },
      /** Take an actor off at t: "left" | "right" | "down" | "fade". */
      exit(a, t, to = "fade") {
        if (to === "fade") tl.to(a.wrap, { autoAlpha: 0, duration: 0.2 }, t);
        else if (to === "down") tl.to(a.wrap, { y: 600 * this.k, duration: 0.35, ease: "power2.in" }, t);
        else tl.to(a.wrap, { x: (to === "left" ? -1 : 1) * Math.max(1000 * this.k, this.W * 0.7), y: S.hop ? -100 * this.k : 0, rotation: (to === "left" ? -1 : 1) * 12 * S.wobble, duration: 0.4, ease: "power2.in" }, t);
        return a;
      },
      /** Run acts on an actor: "wave" | ["wave", 0.6] | [["lean", 0.2, {...}], ...]. Times relative to t0. */
      acts(a, list, t0, t1) {
        if (!list) return;
        const norm = typeof list === "string" ? [[list, 0]] : Array.isArray(list[0]) || typeof list[0] === "object" ? list : [list];
        for (const it of norm) {
          const [name, off = 0, opts = {}] = Array.isArray(it) ? it : [it.name, it.at, it];
          const fn = AK.acts[name];
          if (!fn) throw new Error(`AdKit: unknown act "${name}"`);
          fn(this, a, t0 + off, t1, opts);
        }
      },
      /** Idle + irregular blinks for the whole time an actor is on screen. */
      alive(a, t0, t1, { idle = true } = {}) {
        if (!a.rig) return;
        if (idle) a.rig.idle(t0 + 0.7, t1, { amount: S.idle * this.k });
        const r = Studio.random(Math.round(t0 * 1000) + a.w);
        const times = []; for (let t = t0 + 0.9 + r() * 0.6; t < t1 - 0.2; t += 1.7 + r() * 1.6) times.push(t);
        a.rig.blink(times);
      },
      /** A design space for fixed-geometry scenes: a child layer sized W/k × H/k, scaled by k to fill the frame, and a
       *  context whose W, H, L, R are in that space with k = 1. Brand scenes draw at reel scale and fit any size. */
      unscaled(layer) {
        const k = this.k, inner = el(layer, "div", "");
        Object.assign(inner.style, { position: "absolute", left: 0, top: 0, width: this.W / k + "px", height: this.H / k + "px", transform: `scale(${k})`, transformOrigin: "0 0" });
        inner.style.setProperty("--ak-s", "1");
        const sc = (o) => Object.fromEntries(Object.entries(o).map(([key, v]) => [key, v / k]));
        return Object.assign(Object.create(this), { W: this.W / k, H: this.H / k, L: sc(this.L), R: sc(this.R), k: 1, layer: inner });
      },
      /** Cartoon flash/impact at t (fun only unless forced). */
      flash(parent, t, { force = false, opacity = 0.85 } = {}) {
        if (!S.flash && !force) return;
        const f = el(parent, "div", "ak-flash");
        tl.set(f, { opacity }, t).to(f, { opacity: 0, duration: 0.25, ease: "power1.out" }, t + 0.03);
      },
      /** Number that counts up/down on the clock. */
      counter(elm, from, to, t, dur, fmt = (v) => Math.round(v)) {
        const o = { v: from };
        elm.textContent = fmt(from);
        tl.to(o, { v: to, duration: dur, ease: "power1.inOut", onUpdate: () => (elm.textContent = fmt(o.v)) }, t);
        return elm;
      },
    });
    return ctx;
  }

  /* ---------------- Generic acts (any actor with SvgRig parts) ---------------- */
  AK.act("wave", (c, a, t) => a.rig && a.rig.wave(t, { times: c.style === "adult" ? 1 : 3 }));
  AK.act("talk", (c, a, t, t1, o) => a.rig && a.rig.talk(t, t + (o.dur || 0.8)));
  AK.act("hop", (c, a, t, t1, o) => {
    if (c.S.hop && a.rig) a.rig.hop(t, { height: (o.height || c.S.hop) * c.k });
    else c.tl.to(a.wrap, { y: 8 * c.k, duration: 0.15, yoyo: true, repeat: 1, ease: "sine.inOut" }, t); // adult: a nod
  });
  AK.act("nod", (c, a, t) => c.tl.to(a.wrap, { y: 10 * c.k, duration: 0.14, yoyo: true, repeat: 3, ease: "sine.inOut" }, t));
  // Swings last two frames each (1/15 s) so no two consecutive frames repeat a pose.
  AK.act("shake", (c, a, t, t1, o) => { const n = o.times || 5, d = 1 / 15;
    c.tl.fromTo(a.wrap, { x: -(o.amount || 14) * c.S.wobble * c.k }, { x: (o.amount || 14) * c.S.wobble * c.k, duration: d, yoyo: true, repeat: n, ease: "sine.inOut", immediateRender: false }, t).to(a.wrap, { x: 0, duration: d }, t + d * (n + 1)); });
  AK.act("lean", (c, a, t, t1, o) => {
    const deg = (o.deg || 14) * (c.style === "adult" ? 0.7 : 1);
    c.tl.to(a.wrap, { rotation: -deg, duration: 0.35, ease: "sine.inOut" }, t)
      .to(a.wrap, { rotation: deg, duration: 0.5, ease: "sine.inOut" }, t + 0.35)
      .to(a.wrap, { rotation: 0, duration: 0.35, ease: c.S.pop }, t + 0.85);
  });
  /** Spin a part: { part, turns, dur, origin: "x y" in viewBox units }. */
  AK.act("spin", (c, a, t, t1, o) => {
    const p = a.part(o.part); if (!p) return;
    c.tl.fromTo(p, { rotation: 0 }, { rotation: 360 * (o.turns || 3), duration: o.dur || (t1 - t), ease: o.ease || "power1.in", svgOrigin: o.origin, immediateRender: false }, t);
  });
  /** Pulse a part's opacity: { part, times, gap }. Children with class `.k` pulse in sequence if `seq`. */
  AK.act("pulse", (c, a, t, t1, o) => {
    const p = a.part(o.part); if (!p) return;
    const kids = o.seq ? [...p.children] : [p];
    for (let r = 0; r < (o.times || 3); r++) kids.forEach((k, i) => {
      const at = t + r * (o.gap || 0.6) + i * 0.12;
      c.tl.fromTo(k, { opacity: 0.15 }, { opacity: 1, duration: 0.18, immediateRender: false }, at);
    });
  });
  /** Silhouette: actor drawn black (mystery) until `reveal` (seconds after t). */
  AK.act("silhouette", (c, a, t, t1, o) => {
    gsap.set(a.svg, { filter: "brightness(0) contrast(1)" });
    if (o.reveal != null) c.tl.to(a.svg, { filter: "brightness(1) contrast(1)", duration: c.style === "adult" ? 0.5 : 0.12 }, t + o.reveal);
  });

  window.AdKit = AK;
})();
