/* Ad kit generic scenes. Load after ad-kit.js. Every scene: (ctx, s, t0, t1, layer).
 * Text sits in the safe zone's top 36 % (ctx.R.textTop..textBottom); actors and props in the rest (stageTop..stageBottom). */
(function () {
  const AK = window.AdKit;
  const actorW = (c, k = 0.8) => Math.round(Math.min(520, (c.R.stageBottom - c.R.stageTop) * k));

  /** Statement or hook: { eyebrow, title, sub, chips, actor, act, from, size, beats } */
  AK.scene("title", (c, s, t0, t1, layer) => {
    if (s.beats) c.beats(layer, s.beats, t0, t1);
    else c.reveal(c.text(layer, s), t0 + (s.textAt ?? 0.1));
    if (s.actor) {
      const a = c.enter(c.actor(layer, s.actor, { w: s.w || actorW(c) }), t0 + (s.actorAt ?? 0.2), s.from || "pop");
      c.alive(a, t0, t1); c.acts(a, s.act, t0, t1);
    }
    if (s.flash) c.flash(layer, t0);
  }, { dur: 2 });

  /** Feature spotlight: { eyebrow, title, chips, actor, act, from, base: propKey, baseAct } */
  AK.scene("feature", (c, s, t0, t1, layer) => {
    c.reveal(c.text(layer, s), t0 + 0.15);
    const R = c.R;
    let bottom = R.stageBottom - 20, from = s.from || "bottom", w = s.w || actorW(c, 0.78);
    if (s.base) {
      const bw = Math.min(400, w * 0.85);
      const base = c.actor(layer, s.base, { w: bw, bottom: R.stageBottom - 10, z: 2 });
      c.acts(base, s.baseAct, t0, t1);
      const lidTop = R.stageBottom - 10 - (bw * (278 - 104)) / 300;
      bottom = lidTop - 10;
      w = Math.min(w, Math.round((bottom - R.stageTop) * 1.02));
      from = { y: Math.round(R.stageBottom - 10 - (bw * 78) / 300 - bottom) };
    }
    const a = c.enter(c.actor(layer, s.actor, { w, bottom }), t0 + 0.05, from);
    c.alive(a, t0, t1, { idle: s.idle !== false });
    c.acts(a, s.act, t0, t1);
    if (s.exit) c.exit(a, t1 - 0.4, s.exit);
  }, { dur: 1.9 });

  /** Curiosity gap: a silhouette and a question, then the reveal. { eyebrow, title, answer, chips, actor, reveal } */
  AK.scene("question", (c, s, t0, t1, layer) => {
    const rv = s.reveal ?? (t1 - t0) * 0.55;
    c.reveal(c.text(layer, { eyebrow: s.eyebrow, title: s.title }), t0 + 0.1, t0 + rv);
    c.reveal(c.text(layer, { eyebrow: s.answerEyebrow || s.eyebrow, title: s.answer, chips: s.chips }), t0 + rv + 0.05);
    const a = c.enter(c.actor(layer, s.actor, { w: s.w || actorW(c, 0.8) }), t0 + 0.15, "pop");
    c.acts(a, [["silhouette", 0, { reveal: rv }]], t0, t1);
    c.alive(a, t0 + rv, t1);
    const q = c.el(layer, "div", "ak-title");
    Object.assign(q.style, { position: "absolute", left: 0, right: 0, textAlign: "center", top: (c.R.stageTop + 40) + "px", fontSize: "220px", color: "var(--accent)" });
    q.textContent = "?";
    gsap.set(q, { autoAlpha: 0 });
    c.tl.fromTo(q, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: c.S.pop, immediateRender: false }, t0 + 0.5)
      .to(q, { autoAlpha: 0, scale: 1.4, duration: 0.2 }, t0 + rv);
    c.flash(layer, t0 + rv);
    if (s.act) c.acts(a, s.act, t0 + rv, t1);
  }, { dur: 3.4 });

  /** Pattern interrupt: a hard jolt, then one line. { title, sub, colors } */
  AK.scene("interrupt", (c, s, t0, t1, layer) => {
    const cols = s.colors || ["var(--accent)", "var(--ak-warn, #ff4a3d)", "var(--ink)"];
    const bars = c.el(layer, "div", "");
    Object.assign(bars.style, { position: "absolute", inset: 0 });
    cols.forEach((col, i) => {
      const b = c.el(bars, "div", "");
      Object.assign(b.style, { position: "absolute", left: "-10%", width: "120%", height: "34%", top: (i * 33) + "%", background: col, transform: "skewY(-8deg)" });
      c.tl.fromTo(b, { xPercent: i % 2 ? 110 : -110 }, { xPercent: 0, duration: 0.14, ease: "power4.out", immediateRender: false }, t0 + i * 0.04)
        .to(b, { xPercent: i % 2 ? -110 : 110, duration: 0.16, ease: "power4.in" }, t0 + 0.38 + i * 0.03);
    });
    const box = c.text(layer, { title: s.title, sub: s.sub, align: "center", y: (c.R.textBottom - c.R.textTop) * 0.55, size: s.size || 150 });
    c.reveal(box, t0 + 0.5);
    c.tl.fromTo(box, { scale: 1.8 }, { scale: 1, duration: 0.3, ease: "power4.out", immediateRender: false }, t0 + 0.5)
      .to(box, { x: 10 * c.S.wobble, duration: 0.04, yoyo: true, repeat: 5 }, t0 + 0.8).set(box, { x: 0 }, t0 + 1.04);
  }, { dur: 1.8 });

  /** How it works / rule of three: { eyebrow, title, items: [{ label, sub, actor }], gap } */
  AK.scene("steps", (c, s, t0, t1, layer) => {
    c.reveal(c.text(layer, { eyebrow: s.eyebrow, title: s.title, size: s.size }), t0 + 0.1);
    const n = s.items.length, top = c.R.stageTop, h = c.R.stageBottom - top, rowH = Math.min(230, h / n);
    const gap = s.gap ?? Math.min(0.9, (t1 - t0 - 1.2) / n);
    s.items.forEach((it, i) => {
      const row = c.el(layer, "div", "ak-row");
      Object.assign(row.style, { position: "absolute", left: c.L.l + "px", width: (c.L.r - c.L.l) + "px", top: (top + i * rowH + (rowH - 120) / 2) + "px" });
      row.innerHTML = `<div class="ak-num">${i + 1}</div><div><div class="ak-title" style="font-size:72px;margin:0">${it.label}</div>${it.sub ? `<div class="ak-eyebrow" style="margin-top:10px">${it.sub}</div>` : ""}</div>`;
      const at = t0 + 0.6 + i * gap;
      gsap.set(row, { autoAlpha: 0 });
      c.tl.fromTo(row, { autoAlpha: 0, x: -80 }, { autoAlpha: 1, x: 0, duration: 0.4, ease: c.S.inEase, immediateRender: false }, at);
      if (it.actor) {
        const a = c.enter(c.actor(layer, it.actor, { w: rowH * 1.0, cx: c.L.r - rowH * 0.45, bottom: top + (i + 1) * rowH - 6 }), at + 0.1, "pop");
        c.alive(a, at, t1, { idle: false }); c.acts(a, it.act, at, t1);
      }
    });
  }, { dur: 4 });

  /** Progress / goal gradient / endowed progress: { eyebrow, title, items, done (pre-ticked, must be true), gap, final } */
  AK.scene("checklist", (c, s, t0, t1, layer) => {
    c.reveal(c.text(layer, { eyebrow: s.eyebrow, title: s.title, size: s.size }), t0 + 0.1);
    const n = s.items.length, top = c.R.stageTop, h = c.R.stageBottom - top - 90, rowH = Math.min(110, h / n);
    const pre = s.done || 0, gap = s.gap ?? Math.min(0.55, (t1 - t0 - 1.6) / Math.max(1, n - pre));
    const bar = c.el(layer, "div", ""), fill = c.el(bar, "div", "");
    Object.assign(bar.style, { position: "absolute", left: c.L.l + "px", width: (c.L.r - c.L.l) + "px", top: (c.R.stageBottom - 46) + "px", height: "26px", borderRadius: "13px", background: "var(--ak-line, #333)" });
    Object.assign(fill.style, { height: "100%", width: "100%", borderRadius: "13px", background: "var(--accent)", transformOrigin: "0 50%" });
    const pct = c.el(layer, "div", "ak-eyebrow");
    Object.assign(pct.style, { position: "absolute", right: (c.W - c.L.r) + "px", top: (c.R.stageBottom - 96) + "px" });
    gsap.set(fill, { scaleX: 0 });
    s.items.forEach((label, i) => {
      const row = c.el(layer, "div", "ak-row");
      Object.assign(row.style, { position: "absolute", left: c.L.l + "px", top: (top + i * rowH) + "px", gap: "22px" });
      row.innerHTML = `<svg width="64" height="64" viewBox="0 0 64 64"><rect x="3" y="3" width="58" height="58" rx="10" fill="none" stroke="currentColor" stroke-width="5" opacity=".5"/><path class="tick" d="M16 33 l11 11 l21 -24" fill="none" stroke="var(--accent)" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/></svg><div class="ak-sub" style="margin:0;font-size:48px">${label}</div>`;
      const tick = row.querySelector(".tick");
      gsap.set(tick, { strokeDasharray: 60, strokeDashoffset: 60 });
      const at = i < pre ? t0 + 0.4 + i * 0.08 : t0 + 0.9 + (i - pre) * gap;
      c.tl.fromTo(row, { autoAlpha: 0 }, { autoAlpha: i < pre ? 1 : 0.55, duration: 0.2, immediateRender: false }, t0 + 0.3 + i * 0.05);
      c.tl.to(tick, { strokeDashoffset: 0, duration: 0.2, ease: "power2.out" }, at).to(row, { autoAlpha: 1, duration: 0.1 }, at);
      if (c.S.hop) c.tl.fromTo(row, { scale: 1 }, { scale: 1.06, duration: 0.1, yoyo: true, repeat: 1, immediateRender: false }, at);
      c.tl.to(fill, { scaleX: (i + 1) / n, duration: 0.25, ease: "power2.out" }, at);
    });
    const ats = s.items.map((_, i) => (i < pre ? t0 + 0.4 + i * 0.08 : t0 + 0.9 + (i - pre) * gap));
    Studio.onSeek((t) => { pct.textContent = ats.filter((a) => t >= a).length + " / " + n; });
  }, { dur: 4.5 });

  /** Before → after (with the bridge: the mess snaps into order). { before: {eyebrow,title}, after: {eyebrow,title}, items } */
  AK.scene("beforeAfter", (c, s, t0, t1, layer) => {
    const mid = t0 + (s.split ?? (t1 - t0) * 0.45);
    c.reveal(c.text(layer, s.before), t0 + 0.1, mid);
    c.reveal(c.text(layer, s.after), mid + 0.1);
    const r = Studio.random(s.seed || 11), top = c.R.stageTop, h = c.R.stageBottom - top;
    const wires = c.el(layer, "div", "");
    Object.assign(wires.style, { position: "absolute", left: 0, top: top + "px", width: c.W + "px", height: h + "px" });
    const cols = ["#ff4a3d", "#ffc46e", "#84dcff", "#868d95", "#eceae4"];
    wires.innerHTML = `<svg width="${c.W}" height="${h}">${Array.from({ length: 14 }, () => {
      const p = () => `${Math.round(80 + r() * (c.W - 160))} ${Math.round(40 + r() * (h - 80))}`;
      return `<path d="M${p()} C${p()} ${p()} ${p()} S${p()} ${p()}" stroke="${cols[Math.floor(r() * cols.length)]}" stroke-width="7" fill="none" opacity=".55" stroke-linecap="round"/>`;
    }).join("")}</svg>`;
    c.tl.to(wires, { autoAlpha: 0, duration: 0.3 }, mid);
    const line = c.el(layer, "div", "");
    Object.assign(line.style, { position: "absolute", left: (c.L.l + 150) + "px", top: (top + 10) + "px", width: "4px", height: (h - 20) + "px", background: "var(--accent)" });
    gsap.set(line, { scaleY: 0, transformOrigin: "50% 0" });
    c.tl.to(line, { scaleY: 1, duration: 0.4, ease: "power2.out" }, mid + 0.15);
    const items = s.items || [];
    const rowH = Math.min(120, (h - 40) / items.length);
    items.forEach((label, i) => {
      const chip = c.el(layer, "div", "ak-chips");
      chip.innerHTML = `<li>${label}</li>`;
      const x0 = 80 + r() * (c.W - 480), y0 = top + 40 + r() * (h - 160), rot = (r() - 0.5) * 50;
      Object.assign(chip.style, { position: "absolute", left: 0, top: 0, margin: 0 });
      gsap.set(chip, { x: x0, y: y0, rotation: rot, opacity: 0.6 });
      c.tl.to(chip, { x: c.L.l + 180, y: top + 20 + i * rowH, rotation: 0, opacity: 1, duration: 0.55, ease: c.S.pop }, mid + 0.1 + i * 0.06);
      const dot = c.el(layer, "div", "");
      Object.assign(dot.style, { position: "absolute", left: (c.L.l + 142) + "px", top: (top + 38 + i * rowH) + "px", width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent)" });
      gsap.set(dot, { scale: 0 });
      c.tl.to(dot, { scale: 1, duration: 0.2, ease: c.S.pop }, mid + 0.5 + i * 0.06);
    });
    c.flash(layer, mid, { opacity: 0.5 });
  }, { dur: 4.2 });

  /** Truth sandwich (fact → myth → fact): { fact, myth, chips, source } */
  AK.scene("mythFact", (c, s, t0, t1, layer) => {
    const d = t1 - t0, a = t0 + d * 0.3, b = t0 + d * 0.62;
    c.reveal(c.text(layer, { eyebrow: s.factLabel || "Fact", title: s.fact }), t0 + 0.1, a);
    const myth = c.reveal(c.text(layer, { eyebrow: s.mythLabel || "Myth", title: s.myth, size: 84 }), a + 0.05, b);
    myth.querySelector(".ak-eyebrow").classList.add("ak-warn");
    const strike = c.el(myth, "div", "");
    Object.assign(strike.style, { position: "absolute", left: 0, right: 0, top: "62%", height: "12px", background: "var(--ak-warn, #ff4a3d)", transformOrigin: "0 50%" });
    gsap.set(strike, { scaleX: 0 });
    c.tl.to(strike, { scaleX: 1, duration: 0.3, ease: "power2.inOut" }, a + 0.8);
    c.reveal(c.text(layer, { eyebrow: s.factLabel || "Fact", title: s.fact, chips: s.chips }), b + 0.05);
    if (s.actor) {
      const ac = c.enter(c.actor(layer, s.actor, { w: actorW(c, 0.75) }), t0 + 0.2, "pop");
      c.alive(ac, t0, t1);
      c.acts(ac, [["shake", a + 0.8 - t0, { amount: 12 }], ["hop", b + 0.1 - t0]], t0, t1);
    }
  }, { dur: 5.2, requires: ["source"], why: "a myth-buster's fact must trace to a source" });

  /** Contrast: two columns of rows. { title, eyebrow, left: { label, rows }, right: { label, rows } } (no competitor names) */
  AK.scene("compare", (c, s, t0, t1, layer) => {
    c.reveal(c.text(layer, { eyebrow: s.eyebrow, title: s.title, size: s.size }), t0 + 0.1);
    const top = c.R.stageTop, colW = (c.L.r - c.L.l - 30) / 2;
    [["left", "✕", "ak-warn", 0], ["right", "✓", "ak-hl", 1]].forEach(([k, mark, cls, ci]) => {
      const col = s[k]; const x = c.L.l + ci * (colW + 30);
      const head = c.el(layer, "div", "ak-eyebrow " + (ci ? "" : "ak-dimmed"));
      Object.assign(head.style, { position: "absolute", left: x + "px", top: top + "px", width: colW + "px" });
      head.textContent = col.label;
      gsap.set(head, { autoAlpha: 0 }); c.tl.to(head, { autoAlpha: 1, duration: 0.2 }, t0 + 0.4 + ci * 0.3);
      col.rows.forEach((row, i) => {
        const r = c.el(layer, "div", "");
        Object.assign(r.style, { position: "absolute", left: x + "px", top: (top + 70 + i * 120) + "px", width: colW + "px", font: "600 40px/1.15 var(--font-body)", color: ci ? "var(--ink)" : "var(--ak-dim, #888)" });
        r.innerHTML = `<span class="${cls}" style="font-weight:900;margin-right:14px">${mark}</span>${row}`;
        const at = t0 + 0.7 + i * 0.45 + ci * 0.2;
        gsap.set(r, { autoAlpha: 0 });
        c.tl.fromTo(r, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.3, immediateRender: false }, at);
      });
    });
  }, { dur: 4 });

  /** A number with a source (specificity / social proof by numbers). { value, prefix, suffix, label, eyebrow, source } */
  AK.scene("stat", (c, s, t0, t1, layer) => {
    const box = c.text(layer, { eyebrow: s.eyebrow, y: (c.R.textBottom - c.R.textTop) * 0.4 });
    const big = c.el(box, "div", "ak-title");
    big.style.fontSize = ((s.suffix || "").length + (s.prefix || "").length + String(s.value).length > 4 ? 190 : 260) + "px"; big.style.whiteSpace = "nowrap";
    const num = c.el(big, "span", ""); if (s.suffix) c.el(big, "span", "ak-hl", s.suffix);
    if (s.prefix) big.insertAdjacentHTML("afterbegin", `<span class="ak-hl">${s.prefix}</span>`);
    if (s.label) c.el(box, "div", "ak-sub", s.label);
    c.reveal(box, t0 + 0.1);
    if (s.count === false || s.prefix || String(s.value).length < 2) num.textContent = s.value;
    else c.counter(num, 0, s.value, t0 + 0.2, Math.min(1.2, (t1 - t0) * 0.5), (v) => (Number.isInteger(s.value) ? Math.round(v) : v.toFixed(1)));
    if (s.actor) { const a = c.enter(c.actor(layer, s.actor, { w: actorW(c, 0.5) }), t0 + 0.3, "pop"); c.alive(a, t0, t1); c.acts(a, s.act, t0, t1); }
  }, { dur: 2.6, requires: ["source"], why: "numbers on screen need a source; never invent them" });

  /** Social proof / testimonial. { text, who, source } — refuses without a real person and source. */
  AK.scene("quote", (c, s, t0, t1, layer) => {
    const box = c.text(layer, { eyebrow: s.eyebrow || "", y: 40 });
    c.el(box, "div", "ak-title ak-hl", "“").style.fontSize = "200px";
    const q = c.el(box, "div", "ak-title", s.text); q.style.fontSize = (s.size || 72) + "px"; q.style.marginTop = "-60px";
    c.el(box, "div", "ak-eyebrow", "— " + s.who).style.marginTop = "30px";
    c.reveal(box, t0 + 0.1);
  }, { dur: 3.5, requires: ["who", "source"], why: "testimonials must be real, attributed and on file" });

  /** Authority: a credential or press mention. { title, credential, source } */
  AK.scene("authority", (c, s, t0, t1, layer) => {
    c.reveal(c.text(layer, { eyebrow: s.credential, title: s.title }), t0 + 0.1);
  }, { dur: 2.4, requires: ["credential", "source"], why: "only real credentials, with written permission for third-party marks" });

  /** Scarcity / urgency with a real deadline. { title, until: "YYYY-MM-DD", today: "YYYY-MM-DD", source } */
  AK.scene("urgency", (c, s, t0, t1, layer) => {
    const days = Math.round((Date.parse(s.until) - Date.parse(s.today)) / 864e5);
    const box = c.text(layer, { eyebrow: s.eyebrow || "Ends " + s.until, title: s.title });
    const big = c.el(box, "div", "ak-title ak-hl", `${days} day${days === 1 ? "" : "s"} left`); big.style.marginTop = "40px";
    c.reveal(box, t0 + 0.1);
  }, {
    dur: 2.6, requires: ["until", "today", "source"], why: "urgency only from a real deadline",
    validate(s) { if (!(Date.parse(s.until) > Date.parse(s.today))) throw new Error(`AdKit guardrail: urgency deadline ${s.until} is not after ${s.today}`); },
  });

  /** Reciprocity: teach one useful thing first. { eyebrow, title, lines: [mono lines], actor, act } */
  AK.scene("tip", (c, s, t0, t1, layer) => {
    c.reveal(c.text(layer, { eyebrow: s.eyebrow || "Free tip", title: s.title, size: s.size }), t0 + 0.1);
    const top = c.R.stageTop + 10;
    s.lines.forEach((ln, i) => {
      const d = c.el(layer, "div", "ak-mono");
      Object.assign(d.style, { position: "absolute", left: c.L.l + "px", width: (c.L.r - c.L.l) + "px", top: (top + i * 84) + "px", fontSize: "44px", color: i === s.lines.length - 1 ? "var(--accent)" : "var(--ink)" });
      d.textContent = ln;
      gsap.set(d, { clipPath: "inset(0 100% 0 0)" });
      c.tl.to(d, { clipPath: "inset(0 0% 0 0)", duration: 0.45, ease: "steps(" + Math.max(6, ln.length) + ")" }, t0 + 0.6 + i * 0.6);
    });
    if (s.actor) {
      const ab = c.R.stageBottom - 10, w = Math.min(380, ab - (top + s.lines.length * 84) + 40);
      const a = c.enter(c.actor(layer, s.actor, { w, bottom: ab, cx: c.L.r - w / 2 }), t0 + 0.3, "right");
      c.alive(a, t0, t1); c.acts(a, s.act || [["talk", 0.8, { dur: 1.2 }]], t0, t1);
    }
  }, { dur: 4.2 });

  /** Loss framing: what you'd miss fades away. { eyebrow, title, items, after } */
  AK.scene("vanish", (c, s, t0, t1, layer) => {
    c.reveal(c.text(layer, { eyebrow: s.eyebrow, title: s.title }), t0 + 0.1, s.after ? t1 - 1.0 : null);
    if (s.after) c.reveal(c.text(layer, { title: s.after }), t1 - 0.95);
    const top = c.R.stageTop;
    s.items.forEach((label, i) => {
      const chip = c.el(layer, "ul", "ak-chips");
      chip.innerHTML = `<li style="font-size:40px">${label}</li>`;
      Object.assign(chip.style, { position: "absolute", left: c.L.l + "px", top: (top + i * 110) + "px", margin: 0 });
      gsap.set(chip, { autoAlpha: 0 });
      c.tl.to(chip, { autoAlpha: 1, duration: 0.2 }, t0 + 0.3 + i * 0.12)
        .to(chip, { autoAlpha: 0, filter: "blur(14px)", x: 60, duration: 0.5, ease: "power1.in" }, t0 + 1.2 + i * 0.3);
    });
  }, { dur: 3.6 });

  /** Group shot on a timeline: { eyebrow, title, actors, cols, beat } — everyone moves on the same beat. */
  AK.scene("lineup", (c, s, t0, t1, layer) => {
    c.reveal(c.text(layer, { eyebrow: s.eyebrow, title: s.title, size: s.size }), t0 + 0.1);
    const n = s.actors.length, cols = s.cols || Math.min(3, n), rows = Math.ceil(n / cols);
    const top = c.R.stageTop, h = c.R.stageBottom - top - 70, cellW = (c.L.r - c.L.l) / cols, cellH = h / rows;
    const w = Math.min(cellW * 1.05, cellH * 1.05);
    const actors = s.actors.map((k, i) => {
      const col = i % cols, row = Math.floor(i / cols);
      const a = c.actor(layer, k, { w, cx: c.L.l + cellW * (col + 0.5), bottom: top + cellH * (row + 1) - 8 });
      c.enter(a, t0 + 0.15 + i * 0.07, "pop"); c.alive(a, t0, t1, { idle: false });
      return a;
    });
    const bar = c.el(layer, "div", ""), head = c.el(layer, "div", "");
    const by = c.R.stageBottom - 40;
    Object.assign(bar.style, { position: "absolute", left: c.L.l + "px", width: (c.L.r - c.L.l) + "px", top: by + "px", height: "6px", background: "var(--ak-line, #333)", borderRadius: "3px" });
    Object.assign(head.style, { position: "absolute", left: c.L.l + "px", top: (by - 22) + "px", width: "8px", height: "50px", background: "var(--accent)", borderRadius: "4px" });
    c.tl.fromTo(head, { x: 0 }, { x: c.L.r - c.L.l - 8, duration: t1 - t0 - 0.5, ease: "none", immediateRender: false }, t0 + 0.4);
    const beat = s.beat || 0.5;
    for (let t = t0 + 0.9; t < t1 - 0.3; t += beat) actors.forEach((a) =>
      c.tl.to(a.wrap, { y: -c.S.bounce, duration: beat * 0.35, ease: "power2.out" }, t).to(a.wrap, { y: 0, duration: beat * 0.35, ease: "power2.in" }, t + beat * 0.35));
  }, { dur: 3 });

  /** End card: { wordmark, line, cta, url, actors, eyebrow } */
  AK.scene("endcard", (c, s, t0, t1, layer) => {
    const box = c.text(layer, { eyebrow: s.eyebrow, y: 20 });
    const wm = c.el(box, "div", "ak-wordmark", s.wordmark); wm.style.marginTop = "18px";
    if (s.line) c.el(box, "div", "ak-sub", s.line);
    if (s.url || s.cta) { const d = c.el(box, "div", ""); d.style.marginTop = "34px"; c.el(d, "span", "ak-cta", s.cta || s.url); }
    c.reveal(box, t0 + 0.1);
    if (s.actors) {
      const n = s.actors.length, cellW = (c.L.r - c.L.l) / n, w = Math.min(cellW * 1.15, 300);
      s.actors.forEach((k, i) => {
        const a = c.actor(layer, k, { w, cx: c.L.l + cellW * (i + 0.5), bottom: c.R.stageBottom - 10 });
        c.enter(a, t0 + 0.3 + i * 0.06, { y: 400 }); c.alive(a, t0, t1, { idle: false });
        c.acts(a, [["wave", 0.9 + i * 0.08]], t0, t1);
      });
    }
  }, { dur: 2.4 });
})();
