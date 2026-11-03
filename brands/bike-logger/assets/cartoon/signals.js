/* Bike Logger "Five signals" scene: each sensor's own trace, scrolling past one playhead on one clock.
 * One simulated ride drives every row, so events line up across rows the way the replay shows them:
 * a pothole is a spike on the IMU, an overtaking car is a dip on the ultrasonic (and a marker on the camera row),
 * a tunnel is a gap in GPS fixes while the Hall pulses keep coming. No values or units beyond the brand's facts.
 *   { type: "signals", dur, beats, rowsAt: [s, s, s, s, s], rate }  — load after bike.js */
(function () {
  const AK = window.AdKit, C = Parts.C;
  // The ride, as functions of ride time τ (s).
  const POTHOLE = 4.2, CAR = [7.0, 8.6], TUNNEL = [10.2, 12.6];
  const lean = (τ) => Math.sin(τ * 0.9) * 0.55 + Math.sin(τ * 2.3 + 1) * 0.12;
  const accel = (τ) => { const k = τ - POTHOLE; return Math.abs(k) < 0.35 ? Math.cos((k / 0.35) * Math.PI) * 0.5 + 0.5 : 0; };
  const behind = (τ) => { if (τ < CAR[0] || τ > CAR[1]) return 1; const k = (τ - CAR[0]) / (CAR[1] - CAR[0]); return 1 - Math.sin(k * Math.PI) * 0.72; };
  const fix = (τ) => !(τ > TUNNEL[0] && τ < TUNNEL[1]);
  const PERIOD = 0.42; // one wheel turn at the ride's speed (illustrative)
  const ROWS = [
    { key: "cam", label: "CAMERA", col: C.signal },
    { key: "gps", label: "GPS", col: C.signal },
    { key: "imu", label: "IMU · LEAN", col: "#9b85e6" },
    { key: "sonar", label: "ULTRASONIC · BEHIND", col: C.brake },
    { key: "hall", label: "HALL · WHEEL", col: C.lamp },
  ];
  AK.scene("signals", (c, s, t0, t1, layer) => {
    c = c.unscaled(layer); layer = c.layer;
    if (s.beats) c.beats(layer, s.beats, t0, t1);
    const rate = s.rate || 1.25, span = s.window || 5.5;              // ride seconds visible across the trace
    const left = c.R.sl, right = c.R.sr, top = c.R.stageTop + 10, bottom = c.R.stageBottom - 30;
    const rowH = (bottom - top) / ROWS.length, labW = 0, tw = right - left, ph = left + tw * 0.72; // playhead x
    const svgNS = "http://www.w3.org/2000/svg";
    const root = c.el(layer, "div", "bl-signals");
    Object.assign(root.style, { position: "absolute", left: 0, top: 0, width: c.W + "px", height: c.H + "px", zIndex: 2 });
    root.innerHTML = `<svg width="${c.W}" height="${c.H}" overflow="visible">
      <g id="bands"></g>
      ${ROWS.map((r, i) => { const y = top + i * rowH; return `<g class="row" id="row-${r.key}">
        <line x1="${left}" y1="${y + rowH - 6}" x2="${right}" y2="${y + rowH - 6}" stroke="${C.line}" stroke-width="2"/>
        <text x="${left}" y="${y + 30}" font-family="IBM Plex Mono, monospace" font-size="24" letter-spacing="3" fill="${r.col}">${r.label}</text>
        <g class="trace" transform="translate(0 ${y + 44})"></g></g>`; }).join("")}
      <line id="playhead" x1="${ph}" y1="${top - 10}" x2="${ph}" y2="${bottom}" stroke="${C.ink}" stroke-width="3"/>
      <text id="clock" x="${ph + 12}" y="${top - 18}" font-family="IBM Plex Mono, monospace" font-size="22" fill="${C.ink}">00:00.0</text>
    </svg>`;
    const sv = root.querySelector("svg"), bands = sv.querySelector("#bands");
    const rows = ROWS.map((r) => ({ ...r, g: sv.querySelector(`#row-${r.key}`), tr: sv.querySelector(`#row-${r.key} .trace`) }));
    const H = rowH - 62; // trace height
    const xOf = (τ, now) => ph - ((now - τ) / span) * (ph - left);
    // rows appear one by one (each lights up), then all stay
    const at = s.rowsAt || [0.2, 0.9, 1.6, 2.3, 3.0];
    rows.forEach((r, i) => { gsap.set(r.g, { opacity: 0 }); c.tl.to(r.g, { opacity: 1, duration: 0.4, ease: "sine.out" }, t0 + at[i]); });
    const clock = sv.querySelector("#clock");
    const line = (pts, col, w = 4) => `<polyline fill="none" stroke="${col}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round" points="${pts}"/>`;
    Studio.onSeek((t) => {
      if (t < t0 - 0.2 || t > t1 + 0.01) return;
      const now = 2 + Math.max(0, t - t0) * rate, from = now - span * (ph - left) / (ph - left), to = now + span * (right - ph) / (ph - left);
      const N = 160, step = (to - from) / N;
      const sample = (f) => Array.from({ length: N + 1 }, (_, i) => { const τ = from + i * step; return [xOf(τ, now), f(τ)]; });
      const past = (τ) => τ <= now;
      for (const r of rows) {
        let html = "";
        if (r.key === "imu") {
          const pts = sample(lean).filter(([x], i) => past(from + i * step));
          html = line(pts.map(([x, v]) => `${x.toFixed(1)},${(H / 2 - v * H * 0.42).toFixed(1)}`).join(" "), r.col) +
            line(sample(accel).filter((_, i) => past(from + i * step)).map(([x, v]) => `${x.toFixed(1)},${(H - v * H * 0.9).toFixed(1)}`).join(" "), C.lamp, 3);
        } else if (r.key === "sonar") {
          const pts = sample(behind).filter((_, i) => past(from + i * step));
          html = line(pts.map(([x, v]) => `${x.toFixed(1)},${(H - v * H * 0.9).toFixed(1)}`).join(" "), r.col);
        } else if (r.key === "hall") {
          let d = "", first = true;
          for (let i = 0; i <= N; i++) { const τ = from + i * step; if (!past(τ)) break; const hi = ((τ % PERIOD) + PERIOD) % PERIOD < PERIOD * 0.18;
            const x = xOf(τ, now).toFixed(1), y = (hi ? H * 0.1 : H * 0.85).toFixed(1); d += (first ? "M" : "L") + x + " " + y; first = false; }
          html = `<path d="${d}" fill="none" stroke="${r.col}" stroke-width="4" stroke-linejoin="miter"/>`;
        } else if (r.key === "gps") {
          for (let k = Math.ceil(from); k <= Math.floor(now); k++) { const x = xOf(k, now);
            html += fix(k) ? `<circle cx="${x.toFixed(1)}" cy="${H / 2}" r="9" fill="${r.col}"/>` : `<circle cx="${x.toFixed(1)}" cy="${H / 2}" r="9" fill="none" stroke="${C.dim}" stroke-width="2"/>`; }
        } else if (r.key === "cam") {
          const fstep = 1 / 6;
          for (let k = Math.ceil(from / fstep); k * fstep <= now; k++) { const τ = k * fstep, x = xOf(τ, now), car = τ > CAR[0] && τ < CAR[1];
            html += `<rect x="${(x - 4).toFixed(1)}" y="${H * 0.15}" width="8" height="${H * 0.7}" rx="2" fill="${car ? C.brake : "#1d3a4a"}" opacity="${car ? 0.9 : 0.8}"/>`; }
        }
        r.tr.innerHTML = html;
      }
      // event bands across all rows: the same moment on every line
      let b = "";
      for (const [name, a, z] of [["pothole", POTHOLE - 0.35, POTHOLE + 0.35], ["overtake", CAR[0], CAR[1]], ["tunnel", TUNNEL[0], TUNNEL[1]]]) {
        if (a > now) continue; const x1 = Math.max(left, xOf(a, now)), x2 = Math.min(ph, xOf(Math.min(z, now), now)); if (x2 < left) continue;
        b += `<rect x="${x1.toFixed(1)}" y="${top - 6}" width="${Math.max(2, x2 - x1).toFixed(1)}" height="${bottom - top + 6}" fill="${C.ink}" opacity=".06"/>` +
          `<text x="${(x1 + 6).toFixed(1)}" y="${bottom + 24}" font-family="IBM Plex Mono, monospace" font-size="20" fill="${C.dim}" letter-spacing="2">${name.toUpperCase()}</text>`;
      }
      bands.innerHTML = b;
      const sec = now - 2; clock.textContent = `00:${String(Math.floor(sec)).padStart(2, "0")}.${Math.floor((sec % 1) * 10)}`;
    });
  }, { dur: 10 });
})();
