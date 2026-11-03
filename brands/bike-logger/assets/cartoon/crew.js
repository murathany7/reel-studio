/* Bike Logger crew: the real parts drawn as flat cartoon characters (approved 2026-11-03).
 *
 *   <script src="/brands/bike-logger/assets/cartoon/crew.js"></script>
 *   el.innerHTML = Crew.pi();                    // "fun" style (round eyes, bouncy)
 *   el.innerHTML = Crew.pi({ style: "adult" });  // grown-up cartoon: ink outlines, half-lidded eyes, muted colours
 *
 * Each returns an <svg viewBox="0 0 300 300"> with SvgRig part ids (#body, #eyes, #mouth-closed, #mouth-open,
 * #arm-l, #arm-r) and extras to animate: pi #fan, cam #lens, gps #arcs (.arc), imu #axes, sonar #pings (.ping),
 * hall #magnet #pulse, box #lid. Feet stand at y ≈ 278.
 * Colours: brand tokens, plus PCB green and IMU purple (approved as the only off-palette colours). */
(function () {
  const C = { night: "#06080a", ink: "#eceae4", dim: "#868d95", line: "#262b31", lamp: "#ffc46e", signal: "#84dcff", brake: "#ff4a3d", chip: "#b9bec4" };
  const PAL = {
    fun:   { green: "#3fa66b", greenEdge: "#2c7a4d", purple: "#7a5bd6", red: C.brake, puck: C.ink, box: "#3a4048", boxEdge: "#4f5660" },
    adult: { green: "#2f7552", greenEdge: "#1f5238", purple: "#57479a", red: "#d9493d", puck: "#d9d6cc", box: "#30353c", boxEdge: "#454c55" },
  };

  function kit(style) {
    const A = style === "adult", P = PAL[A ? "adult" : "fun"];
    const limbW = A ? 6 : 9, out = A ? `stroke="${C.ink}" stroke-width="3.5" stroke-linejoin="round"` : "";
    const eye = (x, y, r, lid) => {
      if (!A) return `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${C.ink}"/>` +
        `<circle cx="${x + 3}" cy="${y + 3}" r="${r * 0.55}" fill="${C.night}"/>` +
        `<circle cx="${x + 3 + r * 0.22}" cy="${y - r * 0.12}" r="${r * 0.18}" fill="${C.ink}"/>`;
      // Adult: almond eye, small pupil, heavy upper lid (deadpan), brow line.
      const rx = r * 1.05, ry = r * 0.8;
      return `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${C.ink}"/>` +
        `<circle cx="${x + 2}" cy="${y + ry * 0.3}" r="${r * 0.36}" fill="${C.night}"/>` +
        `<path d="M${x - rx - 1} ${y + 1} A${rx + 1} ${ry + 1} 0 0 1 ${x + rx + 1} ${y + 1} Z" fill="${lid}"/>` +
        `<path d="M${x - rx} ${y + 1} H${x + rx}" stroke="${C.night}" stroke-width="3.5" stroke-linecap="round"/>` +
        `<path d="M${x - rx} ${y - ry - 9} L${x + rx} ${y - ry - 12}" stroke="${C.night}" stroke-width="5" stroke-linecap="round"/>`;
    };
    const mouth = (x, y, w, col = C.night) => A
      ? `<path id="mouth-closed" d="M${x - w * 0.7} ${y + 2} Q${x + w * 0.2} ${y + 5} ${x + w * 0.75} ${y - 3}" stroke="${col}" stroke-width="4.5" fill="none" stroke-linecap="round"/>` +
        `<ellipse id="mouth-open" cx="${x}" cy="${y + 3}" rx="${w * 0.45}" ry="${w * 0.3}" fill="${col}"/>`
      : `<path id="mouth-closed" d="M${x - w} ${y} Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${col}" stroke-width="7" fill="none" stroke-linecap="round"/>` +
        `<path id="mouth-open" d="M${x - w} ${y} Q${x} ${y + w * 1.6} ${x + w} ${y} Z" fill="${col}"/>`;
    const arm = (id, x1, y1, x2, y2, col = C.ink) =>
      `<g id="${id}"><path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 - (A ? 6 : 18)} ${x2} ${y2}" stroke="${col}" stroke-width="${limbW}" fill="none" stroke-linecap="round"/>` +
      `<circle cx="${x2}" cy="${y2}" r="${A ? 7 : 11}" fill="${col}"/></g>`;
    const legs = (x1, x2, y, col = C.ink) =>
      `<path d="M${x1} ${y} v${A ? 30 : 26} h-${A ? 14 : 12} M${x2} ${y} v${A ? 30 : 26} h${A ? 14 : 12}" stroke="${col}" stroke-width="${limbW}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
    const shadow = (cx, rx) => `<ellipse cx="${cx}" cy="284" rx="${rx}" ry="9" fill="#000" opacity=".5"/>`;
    return { A, P, out, eye, mouth, arm, legs, shadow };
  }
  const svg = (id, inner) => `<svg class="crew" id="${id}" viewBox="0 0 300 300" overflow="visible">${inner}</svg>`;

  const Crew = {
    C,
    // Raspberry Pi 5, active cooler worn as a hat.
    pi({ id = "pi", style = "fun" } = {}) {
      const { A, P, out, eye, mouth, arm, legs, shadow } = kit(style);
      return svg(id, shadow(150, 95) + `<g id="body">` + legs(110, 190, 250) +
        arm("arm-l", 52, 190, 18, 150) + arm("arm-r", 248, 190, 282, 150) +
        `<rect x="45" y="118" width="210" height="135" rx="${A ? 10 : 18}" fill="${P.green}" ${out}/>` +
        (A ? "" : `<rect x="45" y="118" width="210" height="135" rx="18" fill="none" stroke="${P.greenEdge}" stroke-width="5"/>`) +
        Array.from({ length: 10 }, (_, i) => `<rect x="${66 + i * 17}" y="128" width="9" height="9" rx="1.5" fill="${C.lamp}"/>`).join("") +
        `<rect x="200" y="214" width="40" height="28" rx="4" fill="${C.chip}"/>` +
        `<rect x="98" y="72" width="104" height="50" rx="10" fill="${C.line}" ${out}/><circle cx="150" cy="96" r="20" fill="${C.night}"/>` +
        `<g id="fan">${[0, 72, 144, 216, 288].map(a => `<path d="M150 96 q12 -6 14 -18 q-12 2 -14 18z" fill="${C.dim}" transform="rotate(${a} 150 96)"/>`).join("")}</g>` +
        `<g id="eyes">${eye(118, 172, 17, P.green)}${eye(182, 172, 17, P.green)}</g>` + mouth(150, 212, 22) + `</g>`);
    },
    // Camera Module 3 Wide: the lens is its eye; ribbon cable tail.
    cam({ id = "cam", style = "fun" } = {}) {
      const { A, P, out, mouth, arm, legs, shadow } = kit(style);
      return svg(id, shadow(150, 80) + `<g id="body">` +
        `<path d="M150 250 q-10 30 -60 30 q-40 0 -70 -14" stroke="${C.lamp}" stroke-width="${A ? 12 : 16}" fill="none"/>` +
        legs(118, 182, 250) + arm("arm-l", 80, 180, 40, 150) + arm("arm-r", 220, 180, 260, 150) +
        `<rect x="72" y="100" width="156" height="152" rx="${A ? 8 : 16}" fill="${P.green}" ${out}/>` +
        `<rect x="96" y="114" width="108" height="108" rx="${A ? 8 : 14}" fill="${C.line}"/>` +
        `<g id="eyes"><circle cx="150" cy="168" r="44" fill="${C.night}"/><g id="lens"><circle cx="150" cy="168" r="30" fill="#1b3442"/>` +
        `<circle cx="150" cy="168" r="17" fill="${C.night}"/><circle cx="138" cy="154" r="9" fill="${C.signal}"/><circle cx="162" cy="182" r="4" fill="${C.signal}" opacity=".7"/></g>` +
        (A ? `<path d="M106 168 A44 44 0 0 1 194 168 Z" fill="${C.line}"/><path d="M106 168 H194" stroke="${C.night}" stroke-width="4"/>` : "") + `</g>` +
        mouth(150, 236, 14) + `</g>`);
    },
    // USB GPS puck (u-blox), antenna up, signal arcs overhead.
    gps({ id = "gps", style = "fun" } = {}) {
      const { A, P, out, eye, mouth, arm, legs, shadow } = kit(style);
      return svg(id, shadow(150, 85) + `<g id="body">` +
        `<g id="arcs">${[30, 52, 74].map((r, i) => `<path class="arc" d="M${150 - r} ${110 - i * 4} A${r} ${r} 0 0 1 ${150 + r} ${110 - i * 4}" stroke="${C.signal}" stroke-width="${A ? 6 : 8}" fill="none" stroke-linecap="round"/>`).join("")}</g>` +
        legs(115, 185, 250) + arm("arm-l", 62, 200, 26, 168) + arm("arm-r", 238, 200, 274, 168) +
        `<rect x="55" y="140" width="190" height="112" rx="${A ? 36 : 48}" fill="${P.puck}" ${A ? `stroke="${C.night}" stroke-width="3.5"` : ""}/>` +
        `<rect x="100" y="146" width="100" height="16" rx="8" fill="${C.chip}"/>` +
        `<path d="M150 252 q6 22 40 28" stroke="${C.dim}" stroke-width="${A ? 6 : 9}" fill="none"/>` +
        `<g id="eyes">${eye(120, 192, 15, P.puck)}${eye(180, 192, 15, P.puck)}</g>` + mouth(150, 226, 18) + `</g>`);
    },
    // BNO085 9-axis IMU, x/y/z arrows overhead.
    imu({ id = "imu", style = "fun" } = {}) {
      const { A, P, out, eye, mouth, arm, legs, shadow } = kit(style);
      const ar = (d, col) => `<path d="${d}" stroke="${col}" stroke-width="${A ? 5 : 6}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      return svg(id, shadow(150, 70) + `<g id="body">` + legs(125, 175, 250) +
        arm("arm-l", 92, 196, 54, 160) + arm("arm-r", 208, 196, 246, 160) +
        `<rect x="85" y="130" width="130" height="122" rx="${A ? 8 : 12}" fill="${P.purple}" ${out}/>` +
        Array.from({ length: 6 }, (_, i) => `<circle cx="${100 + i * 20}" cy="142" r="5" fill="${C.lamp}"/>`).join("") +
        `<rect x="112" y="160" width="76" height="76" rx="8" fill="${C.night}"/>` +
        `<g id="eyes">${eye(134, 192, 12, C.night)}${eye(166, 192, 12, C.night)}</g>` + mouth(150, 220, 13, A ? C.ink : C.night) +
        `<g id="axes" font-family="IBM Plex Mono, monospace" font-size="22" font-weight="500">` +
        ar("M150 112 v-40 m-10 12 l10 -12 l10 12", C.signal) + `<text x="160" y="80" fill="${C.signal}">z</text>` +
        ar("M236 112 l36 -20 m-14 -2 l14 2 l-6 12", C.lamp) + `<text x="270" y="122" fill="${C.lamp}">x</text>` +
        ar("M64 112 l-36 -20 m14 -2 l-14 2 l6 12", C.brake) + `<text x="14" y="122" fill="${C.brake}">y</text></g></g>`);
    },
    // Waterproof ultrasonic: two probe eyes, pings to the right.
    sonar({ id = "sonar", style = "fun" } = {}) {
      const { A, P, out, mouth, arm, legs, shadow } = kit(style);
      return svg(id, shadow(150, 95) + `<g id="body">` + legs(112, 188, 250) +
        arm("arm-l", 50, 196, 16, 160) + arm("arm-r", 250, 196, 284, 160) +
        `<rect x="40" y="132" width="220" height="120" rx="${A ? 10 : 16}" fill="${P.red}" ${out}/>` +
        `<g id="eyes">` + [100, 200].map(x => `<circle cx="${x}" cy="182" r="38" fill="${C.chip}"/><circle cx="${x}" cy="182" r="29" fill="${C.line}"/>` +
          `<circle cx="${x + 4}" cy="185" r="${A ? 10 : 14}" fill="${C.night}"/><circle cx="${x + 8}" cy="178" r="${A ? 3 : 5}" fill="${C.ink}"/>` +
          (A ? `<path d="M${x - 29} 182 A29 29 0 0 1 ${x + 29} 182 Z" fill="${C.line}"/><path d="M${x - 29} 182 H${x + 29}" stroke="${C.night}" stroke-width="4"/>` : "")).join("") + `</g>` +
        `<g id="pings">${[0, 1, 2].map(i => `<path class="ping" d="M282 150 q26 32 0 64" stroke="${C.ink}" stroke-width="${A ? 5 : 7}" fill="none" stroke-linecap="round" transform="translate(${i * 22} 0)"/>`).join("")}</g>` +
        mouth(150, 232, 16) + `</g>`);
    },
    // A3144 Hall sensor on three wire legs, spoke magnet buddy, lamp pulse dot on its head.
    hall({ id = "hall", style = "fun" } = {}) {
      const { A, P, eye, arm, shadow } = kit(style);
      const body = `M95 238 V170 q0 -46 45 -46 q45 0 45 46 V238 Z`;
      return svg(id, shadow(140, 60) + `<g id="body">` +
        `<path d="M120 236 v40 h-12 M140 236 v42 M160 236 v40 h12" stroke="${C.chip}" stroke-width="${A ? 5 : 7}" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
        arm("arm-l", 96, 196, 60, 166, C.chip) + arm("arm-r", 184, 196, 218, 166, C.chip) +
        `<path d="${body}" fill="${C.line}"/><path d="${body}" fill="none" stroke="${A ? C.ink : C.dim}" stroke-width="${A ? 3.5 : 4}"/>` +
        `<circle id="pulse" cx="140" cy="112" r="10" fill="${C.lamp}" opacity="0"/>` +
        `<g id="eyes">${eye(124, 178, 13, C.line)}${eye(156, 178, 13, C.line)}</g>` +
        (A ? `<path id="mouth-closed" d="M130 214 H150" stroke="${C.ink}" stroke-width="4.5" stroke-linecap="round"/>`
           : `<path id="mouth-closed" d="M128 212 Q140 222 152 212" stroke="${C.ink}" stroke-width="6" fill="none" stroke-linecap="round"/>`) +
        `<ellipse id="mouth-open" cx="140" cy="215" rx="${A ? 8 : 11}" ry="${A ? 6 : 9}" fill="${C.ink}"/>` +
        `<text x="140" y="144" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="16" fill="${C.dim}">3144</text></g>` +
        `<g id="magnet"><circle cx="262" cy="240" r="24" fill="${C.chip}"/><circle cx="262" cy="240" r="14" fill="${C.dim}"/>` +
        (A ? `<path d="M252 236 h7 M265 236 h7 M257 248 h10" stroke="${C.night}" stroke-width="3" stroke-linecap="round"/>`
           : `<circle cx="255" cy="236" r="4" fill="${C.night}"/><circle cx="270" cy="236" r="4" fill="${C.night}"/><path d="M256 248 q6 5 12 0" stroke="${C.night}" stroke-width="3" fill="none" stroke-linecap="round"/>`) + `</g>`);
    },
    // The IP65 box; #lid hinges at its left end (svgOrigin "12 121").
    box({ id = "box", style = "fun" } = {}) {
      const { A, P, shadow } = kit(style);
      return svg(id, shadow(150, 130) +
        `<g id="body"><rect x="20" y="130" width="260" height="150" rx="14" fill="${P.box}" stroke="${A ? C.ink : P.boxEdge}" stroke-width="${A ? 3.5 : 5}"/>` +
        `<rect x="34" y="246" width="40" height="16" rx="4" fill="${C.line}"/><rect x="226" y="246" width="40" height="16" rx="4" fill="${C.line}"/>` +
        `<text x="150" y="226" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="22" fill="${C.dim}" letter-spacing="3">IP65</text></g>` +
        `<g id="lid"><rect x="12" y="104" width="276" height="34" rx="10" fill="${P.boxEdge}" ${A ? `stroke="${C.ink}" stroke-width="3.5"` : ""}/></g>`);
    },
  };
  Crew.ORDER = ["pi", "cam", "gps", "imu", "sonar", "hall"];
  window.Crew = Crew;
})();
