/* Bike Logger world for the ad kit: the bike with its real sensors mounted, the street, and brand scenes
 * (boxHook, ride, replay, tunnel) plus the parts' acts. Load after parts.js, ad-kit.js and scenes.js.
 * Rules: no characters. Every motion shows what the hardware does (the cooler spins, the camera sees 102° behind,
 * the GPS holds or loses its fix, the IMU leans, the ultrasonic pings what is behind, the Hall sensor pulses once
 * per wheel turn when the spoke magnet passes). Riding follows traffic rules: right side of a bike lane, hands on
 * the bars, cars overtake with room. */
(function () {
  const C = Parts.C, AK = window.AdKit;
  const BL = (window.BL = {});
  BL.cast = (key, style) => (Parts[key] ? Parts[key]({ style, id: key }) : "");
  BL.forbid = [/!/, "smart", "dashcam", "easy", "beginners?", "revolutionary", "AI-powered", /keeps? you safe/i, /prevents? accidents?/i, /insurance/i];
  /** Objects, not characters: no hops or squash; a gentle settle instead of a bounce. */
  BL.motion = { hop: 0, pop: "back.out(1.25)", inEase: "power3.out", bounce: 0, wobble: 0.5 };

  /* ---------------- bike + rider (viewBox 0 0 640 420, tyres touch y = 420) ---------------- */
  const RA = [150, 320], FA = [500, 320], BB = [300, 330], R = 100, HIP = [268, 142];
  // Hall sensor on the left seatstay, 70 units up from the axle; the magnet sits on a spoke at the same radius.
  const SS = [115, -150], SSL = Math.hypot(...SS), HALL = [RA[0] + (SS[0] / SSL) * 72, RA[1] + (SS[1] / SSL) * 72];
  const PASS = ((Math.atan2(HALL[1] - RA[1], HALL[0] - RA[0]) * 180) / Math.PI + 360) % 360; // spoke angle at the sensor
  BL.bike = function ({ style = "fun", rider = true } = {}) {
    const A = style === "adult", frame = A ? "#7fb3c9" : C.signal, tyre = "#1b1f24";
    const wheel = (id, [x, y], extra = "") => `<g><circle cx="${x}" cy="${y}" r="${R - 9}" fill="none" stroke="${tyre}" stroke-width="18"/>` +
      `<circle cx="${x}" cy="${y}" r="${R - 9}" fill="none" stroke="${A ? C.ink : "#3a4048"}" stroke-width="3"/>` +
      `<g id="${id}">${Array.from({ length: 16 }, (_, i) => { const a = (i / 16) * Math.PI * 2; return `<line x1="${x}" y1="${y}" x2="${(x + Math.cos(a) * (R - 20)).toFixed(1)}" y2="${(y + Math.sin(a) * (R - 20)).toFixed(1)}" stroke="${C.dim}" stroke-width="2"/>`; }).join("")}${extra}</g>` +
      `<circle cx="${x}" cy="${y}" r="9" fill="${C.chip}"/></g>`;
    const magnet = `<rect id="bmagnet" x="${RA[0] + 64}" y="${RA[1] - 6}" width="16" height="12" rx="3" fill="${C.brake}"/>`;
    const tube = (d, w = 13) => `<path d="${d}" stroke="${frame}" stroke-width="${w}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const cone = (() => { const a = (51 * Math.PI) / 180, r = 230, x = 82, y = 120; // rear camera looks back (left)
      return `<g id="bcone"><path d="M${x} ${y} L${(x - Math.cos(a) * r).toFixed(1)} ${(y - Math.sin(a) * r).toFixed(1)} A${r} ${r} 0 0 0 ${(x - Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)} Z" fill="${C.signal}" opacity=".07"/>` +
        `<path d="M${x} ${y} L${(x - Math.cos(a) * r).toFixed(1)} ${(y - Math.sin(a) * r).toFixed(1)} M${x} ${y} L${(x - Math.cos(a) * r).toFixed(1)} ${(y + Math.sin(a) * r).toFixed(1)}" stroke="${C.signal}" stroke-width="2" stroke-dasharray="5 7" opacity=".45"/></g>`; })();
    const riderSvg = rider ? `<g id="rider">
        <path id="leg-b" d="" stroke="#2a3038" stroke-width="26" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M268 142 L372 64" stroke="${A ? "#5b636d" : C.dim}" stroke-width="40" stroke-linecap="round"/>
        <path d="M368 66 Q392 92 404 120" stroke="${A ? "#5b636d" : C.dim}" stroke-width="18" fill="none" stroke-linecap="round"/>
        <circle cx="392" cy="34" r="27" fill="#c69c74"/>
        <path d="M362 36 A31 31 0 0 1 424 30 L428 38 L360 42 Z" fill="${C.lamp}"/>
        <path id="leg-f" d="" stroke="#3a4048" stroke-width="26" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
      </g>` : "";
    return `<svg class="bl-bike" viewBox="0 0 640 420" overflow="visible">
      ${cone}
      ${wheel("spokes-r", RA, magnet)}${wheel("spokes-f", FA)}
      <path d="M95 195 H245 M110 195 L${RA[0]} ${RA[1]} M232 195 L${RA[0] + 20} ${RA[1] - 40}" stroke="${C.chip}" stroke-width="7" fill="none" stroke-linecap="round"/>
      <svg id="bike-box" x="75" y="17" width="190" height="190" viewBox="0 0 300 300" overflow="visible">${Parts.box({ style, id: "rackbox" })}</svg>
      <g id="bgps"><rect x="150" y="68" width="44" height="18" rx="7" fill="#2a3038" stroke="${C.dim}" stroke-width="1.5"/>
        <g id="barcs">${[12, 22, 32].map((r) => `<path class="arc" d="M${172 - r} ${64} A${r} ${r} 0 0 1 ${172 + r} 64" stroke="${C.signal}" stroke-width="3.5" fill="none" stroke-linecap="round"/>`).join("")}</g></g>
      <g id="bcam"><rect x="80" y="108" width="16" height="24" rx="3" fill="#15191e" stroke="${C.dim}" stroke-width="1.5"/><circle cx="82" cy="120" r="5" fill="#173040"/></g>
      <g id="bsonar"><rect x="86" y="186" width="26" height="16" rx="5" fill="#15191e"/><ellipse cx="86" cy="194" rx="4" ry="9" fill="${C.chip}"/>
        <g id="bpings">${[0, 1, 2].map((i) => `<path class="ping" d="M${70 - i * 16} ${176 - i * 5} q-14 ${18 + i * 5} 0 ${36 + i * 10}" stroke="${C.ink}" stroke-width="3.5" fill="none" stroke-linecap="round" opacity="0"/>`).join("")}</g></g>
      ${tube(`M${RA} L${BB}`)}${tube(`M${RA} L265 170`, 11)}${tube(`M${BB} L262 160`)}${tube(`M${BB} Q372 300 470 215`, 15)}
      ${tube(`M455 160 L470 215 Q488 262 ${FA}`, 12)}${tube(`M455 160 L448 128 L404 122`, 9)}
      <circle id="bpulse" cx="${HALL[0].toFixed(1)}" cy="${HALL[1].toFixed(1)}" r="16" fill="${C.lamp}" opacity="0"/>
      <rect id="bhall" x="${(HALL[0] - 6).toFixed(1)}" y="${(HALL[1] - 8).toFixed(1)}" width="12" height="16" rx="3" fill="#15191e" stroke="${C.lamp}" stroke-width="1.5"/>
      <path d="M232 146 Q258 136 284 146 L280 154 L236 154 Z" fill="${C.line}"/>
      <path d="M448 128 L470 122" stroke="${C.chip}" stroke-width="6" stroke-linecap="round"/><circle cx="472" cy="140" r="10" fill="${C.lamp}"/>
      <g id="crank"><line x1="${BB[0]}" y1="${BB[1]}" x2="${BB[0] + 45}" y2="${BB[1]}" stroke="${C.chip}" stroke-width="7" stroke-linecap="round"/><circle cx="${BB[0]}" cy="${BB[1]}" r="18" fill="none" stroke="${C.chip}" stroke-width="4"/></g>
      ${riderSvg}
    </svg>`;
  };
  /** Pose the bike for distance `dist` (viewBox units): spokes, crank, legs (2-bone IK), Hall pulse. Returns turns. */
  BL.poseBike = function (svg, dist) {
    const a = (dist / R) * (180 / Math.PI);
    for (const [id, [x, y]] of [["spokes-r", RA], ["spokes-f", FA]]) svg.querySelector("#" + id)?.setAttribute("transform", `rotate(${(a % 360).toFixed(2)} ${x} ${y})`);
    const ca = (dist / R) * 0.55;
    svg.querySelector("#crank")?.setAttribute("transform", `rotate(${((ca * 180) / Math.PI % 360).toFixed(2)} ${BB[0]} ${BB[1]})`);
    const leg = (id, ang) => {
      const el = svg.querySelector("#" + id); if (!el) return;
      const P = [BB[0] + Math.cos(ang) * 45, BB[1] + Math.sin(ang) * 45], l1 = 122, l2 = 126;
      const dx = P[0] - HIP[0], dy = P[1] - HIP[1], d = Math.min(Math.hypot(dx, dy), l1 + l2 - 1);
      const k = (l1 * l1 - l2 * l2 + d * d) / (2 * d), h = Math.sqrt(Math.max(0, l1 * l1 - k * k));
      const mx = HIP[0] + (k * dx) / d, my = HIP[1] + (k * dy) / d;
      const k1 = [mx - (h * dy) / d, my + (h * dx) / d], k2 = [mx + (h * dy) / d, my - (h * dx) / d];
      const K = k1[0] > k2[0] ? k1 : k2;
      el.setAttribute("d", `M${HIP[0]} ${HIP[1]} L${K[0].toFixed(1)} ${K[1].toFixed(1)} L${P[0].toFixed(1)} ${P[1].toFixed(1)} l22 2`);
    };
    leg("leg-f", ca); leg("leg-b", ca + Math.PI);
    // Magnet passes the sensor once per turn: glow for ±14° around the pass.
    const off = Math.abs((((a - PASS) % 360) + 540) % 360 - 180);
    const pulse = svg.querySelector("#bpulse"); if (pulse) pulse.setAttribute("opacity", off < 14 ? (0.9 * (1 - off / 14)).toFixed(2) : "0");
    return Math.floor((a - PASS + 360) / 360);
  };

  /* ---------------- street: skyline, lamps, road, bike lane; all from t ---------------- */
  BL.street = function (c, layer, { roadY, speed = 520, t0 = 0, cars = [] } = {}) {
    const W = c.W, rnd = Studio.random(31);
    const mk = (html, z = 0) => { const d = c.el(layer, "div", "", html); Object.assign(d.style, { position: "absolute", left: 0, top: 0, zIndex: z }); return d; };
    const tileW = 1400;
    const bld = Array.from({ length: 12 }, (_, i) => {
      const w = 90 + rnd() * 70, h = 160 + rnd() * 300, x = i * (tileW / 12);
      const win = Array.from({ length: 10 }, () => rnd() < 0.35 ? `<rect x="${(x + 14 + rnd() * (w - 34)).toFixed(0)}" y="${(roadY - 120 - h + 20 + rnd() * (h - 60)).toFixed(0)}" width="12" height="16" fill="${C.lamp}" opacity="${(0.35 + rnd() * 0.5).toFixed(2)}"/>` : "").join("");
      return `<rect x="${x.toFixed(0)}" y="${(roadY - 120 - h).toFixed(0)}" width="${w.toFixed(0)}" height="${(h + 10).toFixed(0)}" fill="#0f1419"/>${win}`;
    }).join("");
    const sky = mk(`<svg width="${tileW * 2}" height="${roadY}">${bld}<g transform="translate(${tileW} 0)">${bld}</g></svg>`);
    const lamps = mk(`<svg width="${360 * 8}" height="${roadY}">${Array.from({ length: 8 }, (_, i) => `<g transform="translate(${i * 360} 0)"><rect x="0" y="${roadY - 420}" width="10" height="320" fill="#20262d"/><path d="M5 ${roadY - 420} q0 -24 40 -24 h20" stroke="#20262d" stroke-width="10" fill="none"/><ellipse cx="66" cy="${roadY - 440}" rx="20" ry="8" fill="${C.lamp}"/><path d="M50 ${roadY - 436} L10 ${roadY - 100} H130 L84 ${roadY - 436} Z" fill="${C.lamp}" opacity=".06"/></g>`).join("")}</svg>`);
    mk(`<svg width="${W}" height="${c.H}"><rect x="0" y="${roadY - 110}" width="${W}" height="${c.H}" fill="#101418"/><rect x="0" y="${roadY - 110}" width="${W}" height="6" fill="#2a3037"/><rect x="0" y="${roadY + 22}" width="${W}" height="4" fill="#3a4048"/></svg>`);
    const dashes = mk(`<svg width="${W + 400}" height="${c.H}">${Array.from({ length: Math.ceil(W / 160) + 4 }, (_, i) => `<rect x="${i * 160}" y="${roadY - 52}" width="80" height="8" fill="${C.ink}" opacity=".7"/>`).join("")}<path d="M0 ${roadY + 8} H${W + 400}" stroke="${C.signal}" stroke-width="4" opacity=".35"/></svg>`);
    const carEls = cars.map((car) => { const d = mk(BL.car(car)); d.style.top = (roadY - 64 - 216) + "px"; d.style.width = "620px"; return { d, car }; });
    const update = (t) => {
      const dist = Math.max(0, t - t0) * speed;
      sky.style.transform = `translateX(${-((dist * 0.15) % tileW).toFixed(1)}px)`;
      lamps.style.transform = `translateX(${(-((dist * 0.6) % 360) - 60).toFixed(1)}px)`;
      dashes.style.transform = `translateX(${-(dist % 160).toFixed(1)}px)`;
      for (const { d, car } of carEls) {  // from behind (left) to ahead (right), on the far side of the lane
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

  BL.placeBike = (c, layer, { cx, contactY, w = 660, style = c.style, rider = true, z = 2 }) => {
    const d = c.el(layer, "div", "", BL.bike({ style, rider }));
    const h = (w * 420) / 640;
    Object.assign(d.style, { position: "absolute", left: (cx - w / 2) + "px", top: (contactY - h) + "px", width: w + "px", height: h + "px", zIndex: z });
    const svg = d.querySelector("svg");
    return { el: d, svg, scale: w / 640, x: cx - w / 2, y: contactY - h,
      at: ([vx, vy]) => [cx - w / 2 + (vx * w) / 640, contactY - h + (vy * w) / 640] };
  };
  /** Ultrasonic pings out of the rear probe from t to t1 (sound leaves, fades). */
  BL.pingBike = (c, svg, t, t1) => {
    const kids = [...svg.querySelectorAll("#bpings .ping")];
    for (let at = t; at < t1 - 0.2; at += 0.36) kids.forEach((k, i) =>
      c.tl.fromTo(k, { opacity: 0, x: 0 }, { opacity: 0.95, x: -10, duration: 0.12, immediateRender: false }, at + i * 0.07).to(k, { opacity: 0, x: -26, duration: 0.2, ease: "power1.in" }, at + i * 0.07 + 0.12));
  };

  /* ---------------- acts: each shows what the part does ---------------- */
  AK.act("fan", (c, a, t, t1) => AK.acts.spin(c, a, t, t1, { part: "fan", turns: Math.max(2, (t1 - t) * 2.2), origin: "122 192", dur: t1 - t, ease: "power1.inOut" }));
  AK.act("led", (c, a, t, t1) => { const l = a.part("led"); if (!l) return; for (let at = t; at < t1; at += 0.5) c.tl.fromTo(l, { opacity: 1 }, { opacity: 0.25, duration: 0.25, yoyo: true, repeat: 1, immediateRender: false, ease: "sine.inOut" }, at); });
  AK.act("cone", (c, a, t) => { const k = a.part("cone"); if (k) c.tl.fromTo(k, { scale: 0.2, opacity: 0, svgOrigin: "150 168" }, { scale: 1, opacity: 1, svgOrigin: "150 168", duration: 0.6, ease: "power2.out", immediateRender: true }, t); });
  AK.act("arcs", (c, a, t, t1, o) => {
    const p = a.part("arcs"); if (!p) return;
    const kids = [...p.children];
    for (let at = t; at < t1 - 0.2; at += 0.9) kids.forEach((k, i) => c.tl.fromTo(k, { opacity: 0.2 }, { opacity: 1, duration: 0.22, ease: "sine.out", immediateRender: false }, at + i * 0.15).to(k, { opacity: 0.35, duration: 0.4, ease: "sine.in" }, at + i * 0.15 + 0.3));
  });
  AK.act("arcsLost", (c, a, t) => { [...a.part("arcs").children].reverse().forEach((k, i) => c.tl.to(k, { opacity: 0.12, stroke: C.dim, duration: 0.3 }, t + i * 0.3)); });
  AK.act("tilt", (c, a, t, t1) => AK.acts.lean(c, a, t, t1, { deg: 16 }));
  AK.act("ping", (c, a, t, t1) => {
    const p = a.part("pings"); if (!p) return;
    const kids = [...p.children];
    for (let at = t; at < t1 - 0.3; at += 0.45) kids.forEach((k, i) => c.tl.fromTo(k, { opacity: 0, x: -8 }, { opacity: 1, x: 6, duration: 0.15, immediateRender: false }, at + i * 0.09).to(k, { opacity: 0, x: 24, duration: 0.22, ease: "power1.in" }, at + i * 0.09 + 0.15));
  });
  // Spoke magnet orbits past the Hall sensor; #pulse glows on each pass; optional TURNS readout.
  AK.act("count", (c, a, t, t1, o) => {
    const m = a.part("magnet"), pulse = a.part("pulse"); if (!m) return;
    const rate = o.rate || 1.2, dur = t1 - t;
    c.tl.fromTo(m, { rotation: 0 }, { rotation: 360 * rate * dur, svgOrigin: "200 205", ease: "none", duration: dur, immediateRender: false }, t);
    const passes = [];  // the magnet (at 262,240 around 200,205) is nearest the sensor after 141° of each turn
    for (let k = 0; ; k++) { const at = t + (141 / 360 + k) / rate; if (at > t1 - 0.05) break; passes.push(at); }
    passes.forEach((at) => c.tl.fromTo(pulse, { opacity: 0.85 }, { opacity: 0, duration: 0.35, ease: "power1.out", immediateRender: false }, at - 0.04));
    if (o.readout !== false) {
      const r = c.el(c.layer, "div", "bl-readout", "TURNS<b>0</b>");
      Object.assign(r.style, { left: (parseFloat(a.wrap.style.left) + a.w * 0.86) + "px", top: (parseFloat(a.wrap.style.top) + a.w * 0.1) + "px" });
      const b = r.querySelector("b");
      Studio.onSeek((tt) => { b.textContent = passes.filter((p) => tt >= p).length; });
      gsap.set(r, { autoAlpha: 0 }); c.tl.to(r, { autoAlpha: 1, duration: 0.25 }, t);
    }
  });
  AK.act("open", (c, a, t) => {
    const lid = a.part("lid"), g = a.part("glow");
    if (lid) c.tl.to(lid, { rotation: -108, svgOrigin: "12 121", duration: 0.55, ease: "power3.inOut" }, t);
    if (g) c.tl.to(g.firstElementChild, { opacity: 0.35, duration: 0.7, ease: "sine.out" }, t + 0.2);
  });
  AK.act("openStill", (c, a) => { const lid = a.part("lid"); if (lid) gsap.set(lid, { rotation: -108, svgOrigin: "12 121" }); const g = a.part("glow"); if (g) gsap.set(g.firstElementChild, { opacity: 0.28 }); });
  /** A slow push-in on any actor: the "camera" moves, the object stays still. */
  AK.act("push", (c, a, t, t1) => c.tl.fromTo(a.wrap, { scale: 1 }, { scale: 1.06, duration: t1 - t, ease: "none", immediateRender: false }, t));

  /* ---------------- brand scenes ---------------- */
  /** The sealed box, then the lid opens and the light comes up. { eyebrow, title, chips } */
  AK.scene("boxHook", (c, s, t0, t1, layer) => {
    c = c.unscaled(layer); layer = c.layer;
    c.reveal(c.text(layer, s), t0 - AK.PRE);
    const w = Math.min(560, (c.R.stageBottom - c.R.stageTop) * 0.85, (c.R.sr - c.R.sl) * 0.9);
    const box = c.actor(layer, "box", { w, bottom: c.R.stageBottom - 30 });
    c.enter(box, t0 - 0.1, "pop");
    c.acts(box, [["push", 0], ["open", (t1 - t0) - 0.9]], t0, t1);
  }, { dur: 2.2 });

  /** Side-on city ride; the bike's sensors react to real events. { beats, events: [{ type: pothole|lean|overtake|wheel, at }], speed } */
  AK.scene("ride", (c, s, t0, t1, layer) => {
    c = c.unscaled(layer); layer = c.layer;
    if (s.beats) c.beats(layer, s.beats, t0, t1);
    const roadY = c.R.stageBottom - 90, speed = s.speed || 520;
    const evs = s.events || [];
    const cars = evs.filter((e) => e.type === "overtake").map((e) => ({ at: t0 + e.at - 0.6, dur: 2.0, style: c.style }));
    const st = BL.street(c, layer, { roadY, speed, t0, cars });
    const bw = Math.min(700, (c.R.sr - c.R.sl) * (c.landscape ? 0.8 : 0.66)), cx = c.R.cx + (c.landscape ? 40 : 90);
    const bike = BL.placeBike(c, layer, { cx, contactY: roadY + 10, w: bw });
    // inset: a close-up of the part doing its job
    const bub = c.el(layer, "div", "bl-bubble"), bs = Math.min(300, bike.y - c.R.stageTop + 150);
    const [bxv, byv] = bike.at([170, 20]);
    Object.assign(bub.style, { width: bs + "px", height: bs + "px", left: Math.max(c.R.sl, bxv - bs * 0.85) + "px", top: (byv - bs - 10) + "px", zIndex: 3 });
    gsap.set(bub, { autoAlpha: 0, scale: 0.6, transformOrigin: "80% 100%" });
    if (evs.length) c.tl.to(bub, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power3.out" }, t0 + evs[0].at - 0.3);
    const strip = c.el(layer, "div", ""), head = c.el(strip, "div", "");
    Object.assign(strip.style, { position: "absolute", left: c.L.l + "px", width: (c.L.r - c.L.l) + "px", top: (c.R.stageBottom - 34) + "px", height: "6px", background: "var(--line)", zIndex: 4 });
    Object.assign(head.style, { position: "absolute", left: 0, top: "-14px", width: "6px", height: "34px", background: C.ink });
    c.tl.fromTo(head, { x: 0 }, { x: c.L.r - c.L.l - 6, ease: "none", duration: t1 - t0, immediateRender: false }, t0);
    const colors = { pothole: C.lamp, lean: "#7a5bd6", overtake: C.brake, wheel: C.signal };
    const partFor = { pothole: "imu", lean: "imu", overtake: "sonar", wheel: "hall" };
    const actFor = { pothole: [["tilt", 0.05]], lean: "tilt", overtake: [["ping", 0.05]], wheel: [["count", 0, { readout: false, rate: 1.6 }]] };
    const bumps = [];
    evs.forEach((e, i) => {
      const at = t0 + e.at, until = i < evs.length - 1 ? t0 + evs[i + 1].at - 0.3 : t1;
      const m = c.el(strip, "div", "");
      Object.assign(m.style, { position: "absolute", left: ((e.at / (t1 - t0)) * (c.L.r - c.L.l) - 9) + "px", top: "-6px", width: "18px", height: "18px", borderRadius: "50%", background: colors[e.type] });
      gsap.set(m, { scale: 0 }); c.tl.to(m, { scale: 1, duration: 0.3, ease: "back.out(1.6)" }, at);
      const a = c.actor(bub, e.actor || partFor[e.type], { w: bs * 0.86, cx: bs / 2, bottom: bs * 0.84 });
      gsap.set(a.wrap, { autoAlpha: 0 });
      c.tl.fromTo(a.wrap, { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: "power2.out", immediateRender: false }, at - 0.25);
      c.acts(a, e.act || actFor[e.type], at, until);
      c.tl.to(a.wrap, { autoAlpha: 0, duration: 0.2 }, until - 0.05);
      if (e.type === "pothole") bumps.push(at, at + (350 * bike.scale) / speed);
      if (e.type === "overtake") BL.pingBike(c, bike.svg, at - 0.5, at + 0.6);
    });
    const holes = evs.filter((e) => e.type === "pothole").map((e) => {
      const hEl = c.el(layer, "div", "", `<svg width="120" height="30"><ellipse cx="60" cy="15" rx="56" ry="11" fill="#05070a"/><ellipse cx="60" cy="12" rx="48" ry="7" fill="#0a0d10"/></svg>`);
      Object.assign(hEl.style, { position: "absolute", top: (roadY - 6) + "px", left: 0, zIndex: 1 }); return { hEl, at: t0 + e.at };
    });
    const frontX = bike.at(FA)[0];
    Studio.onSeek((t) => {
      const dist = st.update(t);
      BL.poseBike(bike.svg, dist / bike.scale);
      let dy = 0;
      for (const b of bumps) { const k = (t - b) / 0.26; if (k > 0 && k < 1) dy -= Math.sin(k * Math.PI) * (c.style === "adult" ? 9 : 14); }
      bike.el.style.transform = `translateY(${dy.toFixed(2)}px)`;
      for (const h of holes) h.hEl.style.transform = `translateX(${(frontX - 60 + (h.at - t) * speed).toFixed(1)}px)`;
    });
  }, { dur: 9 });

  /** The replay: phone with video, map and three charts, scrubbed back and forth. { beats | eyebrow, title } */
  AK.scene("replay", (c, s, t0, t1, layer) => {
    c = c.unscaled(layer); layer = c.layer;
    if (s.beats) c.beats(layer, s.beats, t0, t1); else c.reveal(c.text(layer, s), t0 - AK.PRE);
    const top = c.R.stageTop, h = c.R.stageBottom - top - 10, pw = Math.min(600, h * 0.7, (c.R.sr - c.R.sl) * 0.9), ph = h, px = c.R.cx - pw / 2;
    const phone = c.el(layer, "div", "");
    Object.assign(phone.style, { position: "absolute", left: px + "px", top: top + "px", width: pw + "px", height: ph + "px", borderRadius: "46px", background: "#0b0f13", border: `${c.style === "adult" ? 4 : 10}px solid ${c.style === "adult" ? C.ink : "#2a3037"}`, overflow: "hidden", zIndex: 2 });
    gsap.set(phone, { y: 40, autoAlpha: 0 });
    c.tl.to(phone, { y: 0, autoAlpha: 1, duration: 0.45, ease: "power3.out" }, t0 - 0.1);
    const iw = pw - 40, vh = ph * 0.34;
    const rnd = Studio.random(5);
    const series = (n, f) => Array.from({ length: n }, (_, i) => f(i / (n - 1), rnd));
    const lean = series(60, (x, r) => Math.sin(x * 14) * 0.6 + (r() - 0.5) * 0.3);
    const behind = series(60, (x, r) => (x > 0.48 && x < 0.58 ? -0.7 : 0.4) + (r() - 0.5) * 0.25);
    const speedS = series(60, (x, r) => Math.sin(x * 3) * 0.4 + (r() - 0.5) * 0.15);
    const chart = (vals, col, y, hh) => `<polyline fill="none" stroke="${col}" stroke-width="4" points="${vals.map((v, i) => `${(20 + (i / (vals.length - 1)) * iw).toFixed(1)},${(y + hh / 2 - v * hh * 0.45).toFixed(1)}`).join(" ")}"/>`;
    const my = vh + 40, mh = ph * 0.2, cy0 = my + mh + 30, ch = (ph - cy0 - 50) / 3;
    const route = "M40 " + (my + mh - 20) + " C" + `${iw * 0.3} ${my}, ${iw * 0.5} ${my + mh}, ${iw * 0.7} ${my + 30} S ${iw} ${my + 10}, ${iw + 10} ${my + mh * 0.5}`;
    phone.innerHTML = `<div class="bl-vid" style="position:absolute;left:20px;top:28px;width:${iw}px;height:${vh}px;border-radius:14px;overflow:hidden;background:#101418;isolation:isolate"></div>
      <svg width="${pw}" height="${ph}" style="position:absolute;left:0;top:0">
        <rect x="20" y="${my}" width="${iw}" height="${mh}" rx="12" fill="#10161c"/><path id="route" d="${route}" stroke="${C.signal}" stroke-width="6" fill="none" opacity=".8"/>
        <circle id="dot" r="12" fill="${C.lamp}"/>
        ${[["LEAN", lean, "#9b85e6"], ["BEHIND", behind, C.brake], ["SPEED", speedS, C.signal]].map(([lb, v, col], i) => `<text x="20" y="${cy0 + i * ch + 22}" font-family="IBM Plex Mono" font-size="20" fill="${C.dim}" letter-spacing="2">${lb}</text>${chart(v, col, cy0 + i * ch + 10, ch - 14)}`).join("")}
        <rect id="ph" x="0" y="${my - 6}" width="5" height="${ph - my - 30}" fill="${C.ink}"/>
      </svg>`;
    const vid = phone.querySelector(".bl-vid");
    const lane = c.el(vid, "div", "", `<svg width="${iw * 3}" height="${vh}">${Array.from({ length: 24 }, (_, i) => `<rect x="${i * 80}" y="${vh - 20}" width="40" height="5" fill="${C.ink}" opacity=".6"/><rect x="${i * 120}" y="${vh * 0.15 + (i * 37) % 60}" width="60" height="${vh * 0.5}" fill="#151b22"/>`).join("")}</svg>`);
    Object.assign(lane.style, { position: "absolute", left: 0, top: 0 });
    const mini = c.el(vid, "div", "", BL.bike({ style: c.style }));
    Object.assign(mini.style, { position: "absolute", width: (iw * 0.56) + "px", left: (iw * 0.22) + "px", bottom: "10px" });
    const route_ = phone.querySelector("#route"), dot = phone.querySelector("#dot"), ph_ = phone.querySelector("#ph");
    // playhead: play, scrub back, play again; eased so the scrub never jerks
    const ease = (x) => x * x * (3 - 2 * x);
    const p = (t) => { const k = (t - t0) / (t1 - t0);
      if (k < 0.42) return 0.05 + k * 1.6;
      if (k < 0.62) return 0.722 - ease((k - 0.42) / 0.2) * 0.45;
      return 0.272 + (k - 0.62) * 0.9; };
    const bikeSvg = mini.querySelector("svg");
    Studio.onSeek((t) => {
      if (t < t0 - 0.2 || t > t1 + 0.01) return;
      const q = Math.max(0, Math.min(1, p(t)));
      const L = route_.getTotalLength(), pt = route_.getPointAtLength(q * L);
      dot.setAttribute("cx", pt.x); dot.setAttribute("cy", pt.y);
      ph_.setAttribute("x", (20 + q * iw - 2).toFixed(1));
      lane.style.transform = `translateX(${(-q * iw * 1.8).toFixed(1)}px)`;
      BL.poseBike(bikeSvg, q * 4200);
    });
  }, { dur: 3.2 });

  /** Tunnel: the bike's GPS loses its fix; the Hall sensor keeps pulsing once per wheel turn. { beats, inAt, outAt } */
  AK.scene("tunnel", (c, s, t0, t1, layer) => {
    c = c.unscaled(layer); layer = c.layer;
    const inAt = t0 + (s.inAt ?? 1.6), outAt = t0 + (s.outAt ?? 6.6), speed = s.speed || 480;
    const roadY = c.R.stageBottom - 90;
    const st = BL.street(c, layer, { roadY, speed, t0 });
    const bw = Math.min(680, (c.R.sr - c.R.sl) * (c.landscape ? 0.8 : 0.64)), cx = c.R.cx + (c.landscape ? 30 : 60);
    const bike = BL.placeBike(c, layer, { cx, contactY: roadY + 10, w: bw });
    const startX = cx + (inAt - t0) * speed, len = (outAt - inAt) * speed;
    const tun = c.el(layer, "div", "", `<svg width="${len + 300}" height="${c.H}"><path d="M0 ${roadY - 110} V${c.R.stageTop - 140} H${len + 300} V${roadY - 110}" fill="#07090c"/>
      <rect x="0" y="${c.R.stageTop - 140}" width="60" height="${roadY - c.R.stageTop + 30}" fill="#2a3037"/><rect x="${len + 240}" y="${c.R.stageTop - 140}" width="60" height="${roadY - c.R.stageTop + 30}" fill="#2a3037"/>
      ${Array.from({ length: Math.ceil(len / 260) }, (_, i) => `<rect x="${120 + i * 260}" y="${c.R.stageTop - 110}" width="120" height="14" rx="7" fill="${C.lamp}" opacity=".85"/>`).join("")}</svg>`);
    Object.assign(tun.style, { position: "absolute", left: 0, top: 0, zIndex: 1 });
    const dark = c.el(layer, "div", ""); Object.assign(dark.style, { position: "absolute", inset: 0, background: "#000", zIndex: 2, pointerEvents: "none" });
    gsap.set(dark, { opacity: 0 });
    c.tl.to(dark, { opacity: 0.42, duration: 0.4, ease: "sine.inOut" }, inAt).to(dark, { opacity: 0, duration: 0.5, ease: "sine.inOut" }, outAt);
    bike.el.style.zIndex = 3;
    const arcs = [...bike.svg.querySelectorAll("#barcs .arc")];
    arcs.slice().reverse().forEach((k, i) => c.tl.to(k, { opacity: 0.1, stroke: C.dim, duration: 0.3 }, inAt + 0.2 + i * 0.3));
    arcs.forEach((k, i) => c.tl.to(k, { opacity: 1, stroke: C.signal, duration: 0.25 }, outAt + 0.2 + i * 0.15));
    const [gx, gy] = bike.at([172, 40]);
    const tag = c.el(layer, "div", "bl-tag", "NO FIX");
    Object.assign(tag.style, { left: (gx - 60) + "px", top: (gy - 70) + "px", zIndex: 5 });
    gsap.set(tag, { autoAlpha: 0 }); c.tl.to(tag, { autoAlpha: 1, duration: 0.2 }, inAt + 1.0).to(tag, { autoAlpha: 0, duration: 0.2 }, outAt + 0.2);
    // close-up of the Hall sensor counting, while the wheel keeps turning
    const bs = Math.min(280, bike.y - c.R.stageTop + 120), [hx] = bike.at([150, 0]);
    const bub = c.el(layer, "div", "bl-bubble");
    Object.assign(bub.style, { width: bs + "px", height: bs + "px", left: Math.max(c.R.sl, hx - bs - 20) + "px", top: (bike.y + bike.scale * 200 - bs) + "px", zIndex: 4 });
    gsap.set(bub, { autoAlpha: 0, scale: 0.6, transformOrigin: "100% 100%" });
    c.tl.to(bub, { autoAlpha: 1, scale: 1, duration: 0.4, ease: "power3.out" }, inAt + 1.6).to(bub, { autoAlpha: 0, duration: 0.3 }, t1 - 0.4);
    const hall = c.actor(bub, "hall", { w: bs * 0.86, cx: bs / 2, bottom: bs * 0.84 });
    c.acts(hall, [["count", 0, { readout: false, rate: 1.8 }]], inAt + 1.6, t1);
    const ro = c.el(layer, "div", "bl-readout", "WHEEL TURNS<b>0</b>");
    Object.assign(ro.style, { left: c.R.sl + "px", top: (c.landscape ? c.R.stageTop + 20 : c.R.stageTop - 10) + "px", zIndex: 5 });
    const rb = ro.querySelector("b");
    gsap.set(ro, { autoAlpha: 0 }); c.tl.to(ro, { autoAlpha: 1, duration: 0.25 }, inAt + 1.3);
    if (s.beats) c.beats(layer, s.beats, t0, t1);
    Studio.onSeek((t) => {
      const dist = st.update(t);
      const turns = BL.poseBike(bike.svg, dist / bike.scale);
      tun.style.transform = `translateX(${(startX - (t - t0) * speed).toFixed(1)}px)`;
      rb.textContent = Math.max(0, turns);
    });
  }, { dur: 9 });
})();
