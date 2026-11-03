/* Bike Logger cartoon world for the ad kit: the bike + rider (side view), the street, and brand scenes
 * (boxHook, ride, replay, tunnel) plus the crew's own acts. Load after crew.js, ad-kit.js and scenes.js.
 * Riding follows the brand rules: right side of a bike lane, hands on the bars, cars overtake with room. */
(function () {
  const C = Crew.C, AK = window.AdKit;
  const BL = (window.BL = {});
  BL.cast = (key, style) => (Crew[key] ? Crew[key]({ style, id: key }) : "");
  BL.forbid = [/!/, "smart", "dashcam", "easy", "beginners?", "revolutionary", "AI-powered", /keeps? you safe/i, /prevents? accidents?/i, /insurance/i];

  /* ---------------- bike + rider (viewBox 0 0 640 420, tyres touch y = 420) ---------------- */
  const RA = [150, 320], FA = [500, 320], BB = [300, 330], R = 100, HIP = [268, 142];
  BL.bike = function ({ style = "fun", rider = true, peek = true } = {}) {
    const A = style === "adult", frame = A ? "#7fb3c9" : C.signal, tyre = "#1b1f24";
    const wheel = (id, [x, y]) => `<g><circle cx="${x}" cy="${y}" r="${R - 9}" fill="none" stroke="${tyre}" stroke-width="18"/>` +
      `<circle cx="${x}" cy="${y}" r="${R - 9}" fill="none" stroke="${A ? C.ink : "#3a4048"}" stroke-width="${A ? 2.5 : 3}" transform="scale(1)"/>` +
      `<g id="${id}">${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return `<line x1="${x}" y1="${y}" x2="${(x + Math.cos(a) * (R - 20)).toFixed(1)}" y2="${(y + Math.sin(a) * (R - 20)).toFixed(1)}" stroke="${C.dim}" stroke-width="2"/>`; }).join("")}</g>` +
      `<circle cx="${x}" cy="${y}" r="9" fill="${C.chip}"/></g>`;
    const tube = (d, w = 13) => `<path d="${d}" stroke="${frame}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const eyesPeek = peek ? `<g id="peek">${[112, 158, 204].map((x) => `<circle cx="${x}" cy="93" r="7" fill="${C.ink}"/><circle cx="${x + 14}" cy="93" r="7" fill="${C.ink}"/><circle cx="${x + 2}" cy="94" r="3.5" fill="${C.night}"/><circle cx="${x + 16}" cy="94" r="3.5" fill="${C.night}"/>`).join("")}</g>` : "";
    const riderSvg = rider ? `<g id="rider">
        <path id="leg-b" d="" stroke="#2a3038" stroke-width="26" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M268 142 L372 64" stroke="${A ? "#5b636d" : C.dim}" stroke-width="40" stroke-linecap="round"/>
        <path d="M368 66 Q392 92 404 120" stroke="${A ? "#5b636d" : C.dim}" stroke-width="18" fill="none" stroke-linecap="round"/>
        <circle cx="392" cy="34" r="27" fill="#c69c74"/>
        <path d="M362 36 A31 31 0 0 1 424 30 L428 38 L360 42 Z" fill="${C.lamp}"/>
        <path id="leg-f" d="" stroke="#3a4048" stroke-width="26" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>` : "";
    return `<svg class="bl-bike" viewBox="0 0 640 420" overflow="visible">
      ${wheel("spokes-r", RA)}${wheel("spokes-f", FA)}
      <path d="M95 195 H245 M110 195 L${RA[0]} ${RA[1]} M232 195 L${RA[0] + 20} ${RA[1] - 40}" stroke="${C.chip}" stroke-width="7" fill="none" stroke-linecap="round"/>
      ${eyesPeek}
      <svg id="bike-box" x="75" y="17" width="190" height="190" viewBox="0 0 300 300" overflow="visible">${Crew.box({ style, id: "rackbox" })}</svg>
      ${tube(`M${RA} L${BB}`)}${tube(`M${RA} L265 170`, 11)}${tube(`M${BB} L262 160`)}${tube(`M${BB} Q372 300 470 215`, 15)}
      ${tube(`M455 160 L470 215 Q488 262 ${FA}`, 12)}${tube(`M455 160 L448 128 L404 122`, 9)}
      <path d="M232 146 Q258 136 284 146 L280 154 L236 154 Z" fill="${C.line}"/>
      <path d="M448 128 L470 122" stroke="${C.chip}" stroke-width="6" stroke-linecap="round"/><circle cx="472" cy="140" r="10" fill="${C.lamp}"/>
      <g id="crank"><line x1="${BB[0]}" y1="${BB[1]}" x2="${BB[0] + 45}" y2="${BB[1]}" stroke="${C.chip}" stroke-width="7" stroke-linecap="round"/><circle cx="${BB[0]}" cy="${BB[1]}" r="18" fill="none" stroke="${C.chip}" stroke-width="4"/></g>
      ${riderSvg}
    </svg>`;
  };
  // Pose the bike for distance `dist` (viewBox units travelled): spokes, crank, legs (2-bone IK).
  BL.poseBike = function (svg, dist) {
    const a = (dist / R) * (180 / Math.PI);
    for (const [id, [x, y]] of [["spokes-r", RA], ["spokes-f", FA]]) svg.querySelector("#" + id)?.setAttribute("transform", `rotate(${(a % 360).toFixed(2)} ${x} ${y})`);
    const ca = (dist / R) * 0.55; // crank turns slower than the wheel in the drawing (gear ratio, cartoon)
    svg.querySelector("#crank")?.setAttribute("transform", `rotate(${((ca * 180) / Math.PI % 360).toFixed(2)} ${BB[0]} ${BB[1]})`);
    const leg = (id, ang) => {
      const el = svg.querySelector("#" + id); if (!el) return;
      const P = [BB[0] + Math.cos(ang) * 45, BB[1] + Math.sin(ang) * 45], l1 = 122, l2 = 126;
      const dx = P[0] - HIP[0], dy = P[1] - HIP[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - 1);
      const k = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - k * k));
      const mx = HIP[0] + (k * dx) / d, my = HIP[1] + (k * dy) / d;
      const knee = [mx - (h * dy) / d, my + (h * dx) / d], knee2 = [mx + (h * dy) / d, my - (h * dx) / d];
      const K = knee[0] > knee2[0] ? knee : knee2;
      el.setAttribute("d", `M${HIP[0]} ${HIP[1]} L${K[0].toFixed(1)} ${K[1].toFixed(1)} L${P[0].toFixed(1)} ${P[1].toFixed(1)} l22 2`);
    };
    leg("leg-f", ca); leg("leg-b", ca + Math.PI);
  };

  /* ---------------- street: skyline, lamps, road, bike lane; all scrolled from t ---------------- */
  BL.street = function (c, layer, { roadY, speed = 520, t0 = 0, cars = [] } = {}) {
    const W = c.W, rnd = Studio.random(31), top = c.R.stageTop - 120;
    const mk = (cls, html, z = 0) => { const d = c.el(layer, "div", cls, html); Object.assign(d.style, { position: "absolute", left: 0, top: 0, zIndex: z }); return d; };
    const tileW = 1400;
    const bld = Array.from({ length: 12 }, (_, i) => {
      const w = 90 + rnd() * 70, h = 160 + rnd() * 300, x = i * (tileW / 12);
      const win = Array.from({ length: 10 }, () => rnd() < 0.35 ? `<rect x="${(x + 14 + rnd() * (w - 34)).toFixed(0)}" y="${(roadY - 120 - h + 20 + rnd() * (h - 60)).toFixed(0)}" width="12" height="16" fill="${C.lamp}" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>` : "").join("");
      return `<rect x="${x.toFixed(0)}" y="${(roadY - 120 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 10).toFixed(0)}" fill="#0f1419"/>${win}`;
    }).join("");
    const sky = mk("", `<svg width="${tileW * 2}" height="${roadY}">${bld}<g transform="translate(${tileW} 0)">${bld}</g></svg>`);
    const lampsHtml = Array.from({ length: 8 }, (_, i) => `<g transform="translate(${i * 360} 0)"><rect x="0" y="${roadY - 420}" width="10" height="320" fill="#20262d"/><path d="M5 ${roadY - 420} q0 -24 40 -24 h20" stroke="#20262d" stroke-width="10" fill="none"/><ellipse cx="66" cy="${roadY - 440}" rx="20" ry="8" fill="${C.lamp}"/><path d="M50 ${roadY - 436} L10 ${roadY - 100} H130 L84 ${roadY - 436} Z" fill="${C.lamp}" opacity=".06"/></g>`).join("");
    const lamps = mk("", `<svg width="${360 * 8}" height="${roadY}">${lampsHtml}</svg>`);
    const road = mk("", `<svg width="${W}" height="${c.H}"><rect x="0" y="${roadY - 110}" width="${W}" height="${c.H}" fill="#101418"/><rect x="0" y="${roadY - 110}" width="${W}" height="6" fill="#2a3037"/><rect x="0" y="${roadY + 22}" width="${W}" height="4" fill="#3a4048"/></svg>`);
    const dashes = mk("", `<svg width="${W + 400}" height="${c.H}">${Array.from({ length: 9 }, (_, i) => `<rect x="${i * 160}" y="${roadY - 52}" width="80" height="8" fill="${C.ink}" opacity=".7"/>`).join("")}<path d="M0 ${roadY + 8} H${W + 400}" stroke="${C.signal}" stroke-width="4" stroke-dasharray="2 0" opacity=".35"/></svg>`);
    const carEls = cars.map((car) => {
      const d = mk("", BL.car(car), 0);
      d.style.top = (roadY - 64 - 216) + "px"; d.style.width = "620px";
      return { d, car };
    });
    const update = (t) => {
      const k = Math.max(0, t - t0), dist = k * speed;
      sky.style.transform = `translateX(${-((dist * 0.15) % tileW).toFixed(1)}px)`;
      lamps.style.transform = `translateX(${(-((dist * 0.6) % 360) - 60).toFixed(1)}px)`;
      dashes.style.transform = `translateX(${-(dist % 160).toFixed(1)}px)`;
      for (const { d, car } of carEls) {  // overtakes from behind (left) to ahead (right), on the far side of the lane
        const p = (t - car.at) / car.dur;
        d.style.visibility = p > -0.05 && p < 1.05 ? "visible" : "hidden";
        d.style.transform = `translateX(${(-660 + p * (W + 720)).toFixed(1)}px)`;
      }
      return dist;
    };
    return { update };
  };
  BL.car = ({ color = "#3a4048", style = "fun" } = {}) => `<svg viewBox="0 0 430 150" width="100%"><path d="M10 110 Q8 70 60 64 L130 22 Q150 12 200 12 H280 Q312 12 336 40 L362 66 Q420 72 422 110 V122 H10 Z" fill="${color}" ${style === "adult" ? `stroke="${C.ink}" stroke-width="3"` : ""}/>` +
    `<path d="M140 32 Q154 24 196 24 H226 V64 H96 Z M238 24 H278 Q300 24 318 44 L336 64 H238 Z" fill="#1b3442"/><circle cx="96" cy="122" r="27" fill="#1b1f24"/><circle cx="96" cy="122" r="10" fill="${C.chip}"/><circle cx="340" cy="122" r="27" fill="#1b1f24"/><circle cx="340" cy="122" r="10" fill="${C.chip}"/>` +
    `<rect x="402" y="82" width="20" height="14" rx="4" fill="${C.lamp}"/><rect x="8" y="80" width="14" height="14" rx="3" fill="${C.brake}"/></svg>`;

  // Place the bike in a layer so its tyres touch `contactY`, centred on `cx`, `w` px wide.
  BL.placeBike = (c, layer, { cx, contactY, w = 660, style = c.style, rider = true, z = 2 }) => {
    const d = c.el(layer, "div", "", BL.bike({ style, rider }));
    const h = (w * 420) / 640;
    Object.assign(d.style, { position: "absolute", left: (cx - w / 2) + "px", top: (contactY - h) + "px", width: w + "px", height: h + "px", zIndex: z });
    const svg = d.querySelector("svg");
    gsap.set(svg.querySelector("#rackbox #lid"), { rotation: -14, svgOrigin: "12 121" });
    return { el: d, svg, scale: w / 640, x: cx - w / 2, y: contactY - h,
      at: ([vx, vy]) => [cx - w / 2 + (vx * w) / 640, contactY - h + (vy * w) / 640] };
  };

  /* ---------------- crew acts ---------------- */
  AK.act("fan", (c, a, t, t1) => AK.acts.spin(c, a, t, t1, { part: "fan", turns: 4, origin: "150 96", dur: t1 - t }));
  AK.act("arcs", (c, a, t, t1, o) => AK.acts.pulse(c, a, t, t1, { part: "arcs", seq: true, times: o.times || 3, gap: 0.5 }));
  AK.act("arcsLost", (c, a, t) => {
    [...a.part("arcs").children].reverse().forEach((k, i) => c.tl.to(k, { opacity: 0.12, stroke: C.dim, duration: 0.25 }, t + i * 0.3));
  });
  AK.act("arcsBack", (c, a, t) => {
    [...a.part("arcs").children].forEach((k, i) => c.tl.to(k, { opacity: 1, stroke: C.signal, duration: 0.2 }, t + i * 0.15));
  });
  AK.act("look", (c, a, t) => { const l = a.part("lens"); if (l) c.tl.to(l, { x: -9, duration: 0.25 }, t).to(l, { x: 9, duration: 0.4 }, t + 0.5).to(l, { x: 0, duration: 0.25 }, t + 1.1); });
  AK.act("tilt", (c, a, t, t1) => {
    AK.acts.lean(c, a, t, t1, { deg: 16 });
    const ax = a.part("axes"); if (ax) c.tl.to(ax, { rotation: 18, svgOrigin: "150 120", duration: 0.35, yoyo: true, repeat: 3, ease: "sine.inOut" }, t);
  });
  AK.act("ping", (c, a, t, t1, o) => {
    const p = a.part("pings"); if (!p) return;
    const kids = [...p.children];
    for (let r = 0; r < (o.times || 3); r++) kids.forEach((k, i) => {
      const at = t + r * 0.55 + i * 0.1;
      c.tl.fromTo(k, { opacity: 0, x: 0 }, { opacity: 1, x: 18, duration: 0.18, immediateRender: false }, at).to(k, { opacity: 0.15, x: 34, duration: 0.25 }, at + 0.18);
    });
  });
  // Spoke magnet orbits past the Hall sensor; each pass flashes #pulse and ticks a TURNS readout.
  AK.act("count", (c, a, t, t1, o) => {
    const m = a.part("magnet"), pulse = a.part("pulse"); if (!m) return;
    const rate = o.rate || 1.4, dur = t1 - t - 0.1;
    c.tl.fromTo(m, { rotation: 0 }, { rotation: 360 * rate * dur, svgOrigin: "200 205", ease: "none", duration: dur, immediateRender: false }, t);
    const passes = [];
    for (let k = 0; ; k++) { const at = t + (141 / 360 + k) / rate; if (at > t1 - 0.1) break; passes.push(at); }
    passes.forEach((at) => c.tl.fromTo(pulse, { opacity: 1 }, { opacity: 0, duration: 0.3, immediateRender: false }, at));
    if (o.readout !== false) {
      const r = c.el(c.layer, "div", "bl-readout", "TURNS<b>0</b>");
      const box = a.wrap.getBoundingClientRect ? null : null;
      Object.assign(r.style, { left: (parseFloat(a.wrap.style.left) + a.w * 0.82) + "px", top: (parseFloat(a.wrap.style.top) + a.w * 0.08) + "px" });
      const b = r.querySelector("b");
      Studio.onSeek((tt) => { b.textContent = passes.filter((p) => tt >= p).length; });
      gsap.set(r, { autoAlpha: 0 }); c.tl.to(r, { autoAlpha: 1, duration: 0.2 }, t);
    }
  });
  AK.act("open", (c, a, t) => { const lid = a.part("lid"); if (lid) c.tl.to(lid, { rotation: -108, svgOrigin: "12 121", duration: 0.4, ease: c.S.pop }, t); });
  AK.act("openStill", (c, a) => { const lid = a.part("lid"); if (lid) gsap.set(lid, { rotation: -108, svgOrigin: "12 121" }); });
  AK.act("rattle", (c, a, t) => { const d = 1 / 15, r = 3 * (c.S.wobble + 0.3);
    c.tl.fromTo(a.wrap, { rotation: -r }, { rotation: r, duration: d, yoyo: true, repeat: 3, ease: "sine.inOut", immediateRender: false }, t).to(a.wrap, { rotation: 0, duration: d }, t + 4 * d); });

  /* ---------------- brand scenes ---------------- */
  /** The sealed box rattles, then opens. { eyebrow, title, chips } */
  AK.scene("boxHook", (c, s, t0, t1, layer) => {
    c = c.unscaled(layer); layer = c.layer;
    c.reveal(c.text(layer, s), t0 - AK.PRE);
    const w = Math.min(560, (c.R.stageBottom - c.R.stageTop) * 0.85, (c.R.sr - c.R.sl) * 0.9);
    const box = c.actor(layer, "box", { w, bottom: c.R.stageBottom - 30 });
    c.acts(box, [["rattle", 0.35], ["rattle", 0.85], ["open", (t1 - t0) - 0.65]], t0, t1);
    // eyes in the dark gap once the lid lifts
    const eyes = c.el(layer, "div", "", `<svg viewBox="0 0 300 60" width="${w * 0.7}">${[60, 140, 220].map((x) => `<g class="pk"><ellipse cx="${x}" cy="30" rx="11" ry="13" fill="${C.ink}"/><ellipse cx="${x + 26}" cy="30" rx="11" ry="13" fill="${C.ink}"/><circle cx="${x + 2}" cy="33" r="5" fill="${C.night}"/><circle cx="${x + 28}" cy="33" r="5" fill="${C.night}"/></g>`).join("")}</svg>`);
    Object.assign(eyes.style, { position: "absolute", left: (c.R.cx - w * 0.35) + "px", top: (c.R.stageBottom - 30 - (w * (278 - 112)) / 300) + "px" });
    gsap.set(eyes, { autoAlpha: 0 });
    c.tl.to(eyes, { autoAlpha: 1, duration: 0.1 }, t1 - 0.45);
    c.flash(layer, t1 - 0.65, { opacity: 0.4 });
  }, { dur: 2.2 });

  /** Side-on city ride with sensor events. { beats, events: [{ type: pothole|lean|overtake|wheel, at, actor }], speed } */
  AK.scene("ride", (c, s, t0, t1, layer) => {
    c = c.unscaled(layer); layer = c.layer;
    if (s.beats) c.beats(layer, s.beats, t0, t1);
    const roadY = c.R.stageBottom - 90, speed = s.speed || 520;
    const cars = (s.events || []).filter((e) => e.type === "overtake").map((e) => ({ at: t0 + e.at - 0.3, dur: 1.7, style: c.style }));
    const st = BL.street(c, layer, { roadY, speed, t0, cars });
    const bw = Math.min(700, (c.R.sr - c.R.sl) * (c.landscape ? 0.8 : 0.66)), cx = c.R.cx + (c.landscape ? 40 : 90);
    const bike = BL.placeBike(c, layer, { cx, contactY: roadY + 10, w: bw });
    const peek = bike.svg.querySelector("#peek");
    // bubble callout above the box
    const bub = c.el(layer, "div", "bl-bubble"), bs = Math.min(300, c.R.stageTop > 0 ? (bike.y - c.R.stageTop) + 150 : 280);
    const [bxv, byv] = bike.at([170, 20]);
    Object.assign(bub.style, { width: bs + "px", height: bs + "px", left: Math.max(c.R.sl, bxv - bs * 0.85) + "px", top: (byv - bs - 10) + "px", zIndex: 3 });
    gsap.set(bub, { autoAlpha: 0, scale: 0.3, transformOrigin: "80% 100%" });
    const evs = s.events || [];
    if (evs.length) c.tl.to(bub, { autoAlpha: 1, scale: 1, duration: 0.3, ease: c.S.pop }, t0 + evs[0].at - 0.25);
    // timeline strip with markers
    const strip = c.el(layer, "div", ""), head = c.el(strip, "div", "");
    Object.assign(strip.style, { position: "absolute", left: c.L.l + "px", width: (c.L.r - c.L.l) + "px", top: (c.R.stageBottom - 34) + "px", height: "6px", background: "var(--line)", zIndex: 4 });
    Object.assign(head.style, { position: "absolute", left: 0, top: "-14px", width: "6px", height: "34px", background: C.ink });
    c.tl.fromTo(head, { x: 0 }, { x: c.L.r - c.L.l - 6, ease: "none", duration: t1 - t0, immediateRender: false }, t0);
    const colors = { pothole: C.lamp, lean: "#7a5bd6", overtake: C.brake, wheel: C.signal };
    const actorFor = { pothole: "imu", lean: "imu", overtake: "sonar", wheel: "hall" };
    const actFor = { pothole: [["hop", 0.1], ["shake", 0.5]], lean: "tilt", overtake: [["ping", 0.2]], wheel: [["count", 0, { readout: false, rate: 1.6 }]] };
    const bumps = [];
    evs.forEach((e, i) => {
      const at = t0 + e.at, until = i < evs.length - 1 ? t0 + evs[i + 1].at - 0.25 : t1;
      const m = c.el(strip, "div", "");
      Object.assign(m.style, { position: "absolute", left: (((e.at) / (t1 - t0)) * (c.L.r - c.L.l) - 9) + "px", top: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: colors[e.type] });
      gsap.set(m, { scale: 0 }); c.tl.to(m, { scale: 1, duration: 0.25, ease: c.S.pop }, at);
      const a = c.actor(bub, e.actor || actorFor[e.type], { w: bs * 0.9, cx: bs / 2, bottom: bs * 0.86 });
      c.enter(a, at - 0.2, "pop"); c.alive(a, at, until, { idle: false });
      c.acts(a, e.act || actFor[e.type], at, until);
      c.tl.to(a.wrap, { autoAlpha: 0, duration: 0.12 }, until - 0.02);
      if (e.type === "pothole") bumps.push(at, at + (350 * bike.scale) / speed);
    });
    // pothole on the road, passes under the wheels at the event time
    const holes = evs.filter((e) => e.type === "pothole").map((e) => {
      const hEl = c.el(layer, "div", "", `<svg width="120" height="30"><ellipse cx="60" cy="15" rx="56" ry="11" fill="#05070a"/><ellipse cx="60" cy="12" rx="48" ry="7" fill="#0a0d10"/></svg>`);
      Object.assign(hEl.style, { position: "absolute", top: (roadY - 6) + "px", left: 0, zIndex: 1 }); return { hEl, at: t0 + e.at };
    });
    const frontX = bike.at(FA)[0];
    Studio.onSeek((t) => {
      const dist = st.update(t);
      BL.poseBike(bike.svg, (dist / bike.scale));
      let dy = 0;
      for (const b of bumps) { const k = (t - b) / 0.22; if (k > 0 && k < 1) dy -= Math.sin(k * Math.PI) * (c.style === "adult" ? 8 : 18); }
      bike.el.style.transform = `translateY(${dy.toFixed(1)}px)`;
      for (const h of holes) h.hEl.style.transform = `translateX(${(frontX - 60 + (h.at - t) * speed).toFixed(1)}px)`;
      if (peek) peek.style.opacity = Math.max(0, Math.min(1, (t - t0 - 0.6) * 3));
    });
  }, { dur: 9 });

  /** The replay: phone with video, map and three charts, scrubbed; crew reacts. { beats } */
  AK.scene("replay", (c, s, t0, t1, layer) => {
    c = c.unscaled(layer); layer = c.layer;
    if (s.beats) c.beats(layer, s.beats, t0, t1); else c.reveal(c.text(layer, s), t0 - AK.PRE);
    const top = c.R.stageTop, h = c.R.stageBottom - top - 10, pw = Math.min(560, h * 0.68), ph = h, px = c.R.cx - pw / 2;
    const phone = c.el(layer, "div", "");
    Object.assign(phone.style, { position: "absolute", left: px + "px", top: top + "px", width: pw + "px", height: ph + "px", borderRadius: "46px", background: "#0b0f13", border: `${c.style === "adult" ? 4 : 10}px solid ${c.style === "adult" ? C.ink : "#2a3037"}`, overflow: "hidden", zIndex: 2 });
    const iw = pw - 40, vh = ph * 0.34;
    const rnd = Studio.random(5);
    const series = (n, f) => Array.from({ length: n }, (_, i) => f(i / (n - 1), rnd));
    const lean = series(60, (x, r) => Math.sin(x * 14) * 0.6 + (r() - 0.5) * 0.3);
    const behind = series(60, (x, r) => (x > 0.48 && x < 0.58 ? -0.7 : 0.4) + (r() - 0.5) * 0.25);
    const speedS = series(60, (x, r) => Math.sin(x * 3) * 0.4 + (r() - 0.5) * 0.15);
    const chart = (vals, col, y, hh) => `<polyline fill="none" stroke="${col}" stroke-width="4" points="${vals.map((v, i) => `${(20 + (i / (vals.length - 1)) * iw).toFixed(1)},${(y + hh / 2 - v * hh * 0.45).toFixed(1)}`).join(" ")}"/>`;
    const my = vh + 40, mh = ph * 0.2, cy0 = my + mh + 30, ch = (ph - cy0 - 50) / 3;
    const route = "M40 " + (my + mh - 20) + " C" + `${iw * 0.3} ${my}, ${iw * 0.5} ${my + mh}, ${iw * 0.7} ${my + 30} S ${iw} ${my + 10}, ${iw + 10} ${my + mh * 0.5}`;
    phone.innerHTML = `<div class="bl-vid" style="position:absolute;left:20px;top:28px;width:${iw}px;height:${vh}px;border-radius:14px;overflow:hidden;background:#101418"></div>
      <svg width="${pw}" height="${ph}" style="position:absolute;left:0;top:0">
        <rect x="20" y="${my}" width="${iw}" height="${mh}" rx="12" fill="#10161c"/><path id="route" d="${route}" stroke="${C.signal}" stroke-width="6" fill="none" opacity=".8"/>
        <circle id="dot" r="12" fill="${C.lamp}"/>
        ${[["LEAN", lean, "#9b85e6"], ["BEHIND", behind, C.brake], ["SPEED", speedS, C.signal]].map(([lb, v, col], i) => `<text x="20" y="${cy0 + i * ch + 22}" font-family="IBM Plex Mono" font-size="20" fill="${C.dim}" letter-spacing="2">${lb}</text>${chart(v, col, cy0 + i * ch + 10, ch - 14)}`).join("")}
        <rect id="ph" x="0" y="${my - 6}" width="5" height="${ph - my - 30}" fill="${C.ink}"/>
      </svg>`;
    const vid = phone.querySelector(".bl-vid");
    const mini = c.el(vid, "div", "", BL.bike({ style: c.style, peek: false }));
    Object.assign(mini.style, { position: "absolute", width: (iw * 0.56) + "px", left: (iw * 0.22) + "px", bottom: "10px" });
    const lane = c.el(vid, "div", "", `<svg width="${iw * 3}" height="${vh}">${Array.from({ length: 24 }, (_, i) => `<rect x="${i * 80}" y="${vh - 20}" width="40" height="5" fill="${C.ink}" opacity=".6"/><rect x="${i * 120}" y="${vh * 0.15 + (i * 37) % 60}" width="60" height="${vh * 0.5}" fill="#151b22"/>`).join("")}</svg>`);
    Object.assign(lane.style, { position: "absolute", left: 0, top: 0, zIndex: -1 });
    vid.style.isolation = "isolate";
    const route_ = phone.querySelector("#route"), dot = phone.querySelector("#dot"), ph_ = phone.querySelector("#ph"), len = 1;
    // playhead: play forward, scrub back fast, play again (all from t)
    const p = (t) => { const k = (t - t0) / (t1 - t0); if (k < 0.45) return 0.05 + k * 1.5; if (k < 0.6) return 0.725 - ((k - 0.45) / 0.15) * 0.45; return 0.275 + (k - 0.6) * 0.9; };
    const bikeSvg = mini.querySelector("svg");
    // crew in the corners react on the scrub
    const sw = Math.min(200, (c.R.sr - c.R.sl - pw) / 2 + 40);
    const left = c.actor(layer, "pi", { w: sw, cx: Math.max(c.R.sl + sw * 0.4, px - sw * 0.25), bottom: c.R.stageBottom - 4, z: 3 });
    const right = c.actor(layer, "cam", { w: sw, cx: Math.min(c.R.sr - sw * 0.4, px + pw + sw * 0.25), bottom: c.R.stageBottom - 4, z: 3 });
    [left, right].forEach((a, i) => { c.enter(a, t0 - 0.06 + i * 0.1, "pop"); c.alive(a, t0, t1, { idle: false }); c.acts(a, [["hop", (t1 - t0) * 0.45], ["hop", (t1 - t0) * 0.6]], t0, t1); });
    Studio.onSeek((t) => {
      if (t < t0 - 0.01 || t > t1 + 0.01) return;
      const q = Math.max(0, Math.min(1, p(t)));
      const L = route_.getTotalLength(), pt = route_.getPointAtLength(q * L);
      dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
      ph_.setAttribute("x", (20 + q * iw - 2).toFixed(1));
      lane.style.transform = `translateX(${(-q * iw * 1.8).toFixed(1)}px)`;
      BL.poseBike(bikeSvg, q * 4200);
    });
  }, { dur: 3.2 });

  /** Tunnel gag: GPS loses its fix, the Hall sensor keeps counting. { beats, inAt, outAt } */
  AK.scene("tunnel", (c, s, t0, t1, layer) => {
    c = c.unscaled(layer); layer = c.layer;
    const inAt = t0 + (s.inAt ?? 1.6), outAt = t0 + (s.outAt ?? 6.6), speed = s.speed || 480;
    const roadY = c.R.stageBottom - 90;
    const st = BL.street(c, layer, { roadY, speed, t0 });
    const bw = Math.min(680, (c.R.sr - c.R.sl) * (c.landscape ? 0.8 : 0.64)), cx = c.R.cx + (c.landscape ? 30 : 60);
    const bike = BL.placeBike(c, layer, { cx, contactY: roadY + 10, w: bw });
    // tunnel body: from the portal (reaches the bike at inAt) to the exit (passes the bike at outAt)
    const bikeX = cx, startX = bikeX + (inAt - t0) * speed, len = (outAt - inAt) * speed;
    const tun = c.el(layer, "div", "", `<svg width="${len + 300}" height="${c.H}"><path d="M0 ${roadY - 110} V${c.R.stageTop - 140} H${len + 300} V${roadY - 110}" fill="#07090c"/><path d="M0 ${roadY - 108} V${c.R.stageTop - 60} Q150 ${c.R.stageTop - 170} 300 ${c.R.stageTop - 60} V${roadY - 108}" fill="#030405" opacity="0"/>
      <rect x="0" y="${c.R.stageTop - 140}" width="60" height="${roadY - c.R.stageTop + 30}" fill="#2a3037"/><rect x="${len + 240}" y="${c.R.stageTop - 140}" width="60" height="${roadY - c.R.stageTop + 30}" fill="#2a3037"/>
      ${Array.from({ length: Math.ceil(len / 260) }, (_, i) => `<rect x="${120 + i * 260}" y="${c.R.stageTop - 110}" width="120" height="14" rx="7" fill="${C.lamp}" opacity=".85"/>`).join("")}</svg>`);
    Object.assign(tun.style, { position: "absolute", left: 0, top: 0, zIndex: 1 });
    const dark = c.el(layer, "div", ""); Object.assign(dark.style, { position: "absolute", inset: 0, background: "#000", zIndex: 2, pointerEvents: "none" });
    gsap.set(dark, { opacity: 0 });
    c.tl.to(dark, { opacity: 0.45, duration: 0.3 }, inAt).to(dark, { opacity: 0, duration: 0.4 }, outAt);
    bike.el.style.zIndex = 3;
    // Fix rides on top of the box; Spin rides by the rear wheel
    const [fx, fy] = bike.at([170, 30]), [sx, sy] = bike.at([210, 300]);
    const fix = c.actor(layer, "gps", { w: bw * 0.34, cx: fx, bottom: fy + 8, z: 4 });
    const spin = c.actor(layer, "hall", { w: bw * 0.28, cx: sx - 120, bottom: roadY - 6, z: 4 });
    c.enter(fix, t0 - 0.06, "pop"); c.alive(fix, t0, t1, { idle: false });
    c.enter(spin, inAt + 1.2, "pop"); c.alive(spin, inAt + 1.2, t1, { idle: false });
    c.acts(fix, [["arcs", 0.3, { times: 2 }], ["arcsLost", inAt - t0 + 0.2], ["shake", inAt - t0 + 1.0, { amount: 8 }], ["arcsBack", outAt - t0 + 0.2], ["hop", outAt - t0 + 0.6]], t0, t1);
    c.acts(spin, [["count", 0.3, { readout: false, rate: 1.8 }], ["hop", outAt - inAt - 1.2 + 0.6]], inAt + 1.2, t1);
    const tag = c.el(layer, "div", "bl-tag", "NO FIX");
    Object.assign(tag.style, { left: (fx - 70) + "px", top: (fy - bw * 0.36) + "px", zIndex: 5 });
    gsap.set(tag, { autoAlpha: 0 }); c.tl.to(tag, { autoAlpha: 1, duration: 0.1 }, inAt + 0.9).to(tag, { autoAlpha: 0, duration: 0.1 }, outAt + 0.1);
    // readout keeps counting in the dark: turns from the wheel, not from GPS
    const ro = c.el(layer, "div", "bl-readout", "WHEEL TURNS<b>0</b>");
    Object.assign(ro.style, { left: c.R.sl + "px", top: (c.landscape ? c.R.stageTop + 20 : c.R.stageTop - 10) + "px", zIndex: 5 });
    const rb = ro.querySelector("b");
    gsap.set(ro, { autoAlpha: 0 }); c.tl.to(ro, { autoAlpha: 1, duration: 0.2 }, inAt + 1.3);
    if (s.beats) c.beats(layer, s.beats, t0, t1);
    [...layer.querySelectorAll(".ak-text")].forEach((e) => (e.style.zIndex = 6));
    Studio.onSeek((t) => {
      const dist = st.update(t);
      BL.poseBike(bike.svg, dist / bike.scale);
      tun.style.transform = `translateX(${(startX - (t - t0) * speed).toFixed(1)}px)`;
      rb.textContent = Math.floor(dist / bike.scale / (2 * Math.PI * R));
    });
  }, { dur: 9 });
})();
