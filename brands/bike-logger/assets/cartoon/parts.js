/* Bike Logger parts: the real hardware drawn as flat illustrations (no faces, no limbs). Replaces the crew
 * characters (rejected 2026-11-03: "it should be bike and chips, always making sense").
 *
 *   el.innerHTML = Parts.pi();                    // "fun": brand colours
 *   el.innerHTML = Parts.pi({ style: "adult" });  // muted colours, thin ink outlines
 *
 * Each returns <svg viewBox="0 0 300 300" data-still> (the part rests on y ≈ 272; shadow at 284). Moving parts,
 * animated by the acts in bike.js so motion always shows what the hardware does:
 *   pi #fan (cooler spins) #led   cam #cone (102° view)   gps #arcs .arc (satellite fix) #led
 *   imu #axes (x/y/z follow the board's lean)   sonar #pings .ping (echo)   hall #magnet (spoke magnet) #pulse
 *   box #lid (hinge at 12 121). */
(function () {
  const C = { night: "#06080a", ink: "#eceae4", dim: "#868d95", line: "#262b31", lamp: "#ffc46e", signal: "#84dcff", brake: "#ff4a3d", chip: "#b9bec4" };
  const PAL = {
    fun:   { pcb: "#2f8f5b", pcbEdge: "#22704a", purple: "#6b4fc9", metal: "#c3c8ce", black: "#15191e", puck: "#2a3038", box: "#3a4048", boxEdge: "#4f5660", gold: "#e2b45f", ribbon: "#e9b46a" },
    adult: { pcb: "#2a6e4c", pcbEdge: "#1d5138", purple: "#50418c", metal: "#a9aeb4", black: "#12161a", puck: "#262b32", box: "#30353c", boxEdge: "#454c55", gold: "#c7a159", ribbon: "#cfa064" },
  };
  const kit = (style) => {
    const A = style === "adult", P = PAL[A ? "adult" : "fun"];
    const ol = A ? ` stroke="${C.ink}" stroke-width="3" stroke-linejoin="round"` : "";
    return { A, P, ol };
  };
  const svg = (id, inner) => `<svg class="part" id="${id}" data-still="1" viewBox="0 0 300 300" overflow="visible">${inner}</svg>`;
  const shadow = (cx, rx) => `<ellipse cx="${cx}" cy="284" rx="${rx}" ry="8" fill="#000" opacity=".55"/>`;
  const hole = (x, y, P) => `<circle cx="${x}" cy="${y}" r="7" fill="${P.gold}"/><circle cx="${x}" cy="${y}" r="4" fill="${C.night}"/>`;

  const Parts = {
    C,
    /** Raspberry Pi 5 (8 GB) with the active cooler, GPIO header, USB/Ethernet ports. */
    pi({ id = "pi", style = "fun" } = {}) {
      const { P, ol } = kit(style);
      const pins = Array.from({ length: 20 }, (_, i) => `<rect x="${71 + i * 8}" y="117" width="5" height="5" fill="${P.gold}"/><rect x="${71 + i * 8}" y="125" width="5" height="5" fill="${P.gold}"/>`).join("");
      const fins = Array.from({ length: 9 }, (_, i) => `<rect x="${76 + i * 11}" y="150" width="5" height="84" rx="2" fill="#23282e"/>`).join("");
      return svg(id, shadow(150, 125) + `<g id="body">` +
        `<rect x="30" y="110" width="240" height="160" rx="10" fill="${P.pcb}"${ol}/>` +
        `<rect x="34" y="114" width="232" height="152" rx="8" fill="none" stroke="${P.pcbEdge}" stroke-width="2"/>` +
        hole(44, 124, P) + hole(256, 124, P) + hole(44, 256, P) + hole(206, 256, P) +
        `<rect x="66" y="113" width="164" height="21" rx="2" fill="${P.black}"/>${pins}` +
        `<rect x="68" y="144" width="108" height="96" rx="6" fill="${P.black}"/>${fins}` +
        `<circle cx="122" cy="192" r="36" fill="#0b0e11"/><circle cx="122" cy="192" r="33" fill="none" stroke="#2b3138" stroke-width="2"/>` +
        `<g id="fan">${[0, 60, 120, 180, 240, 300].map((a) => `<path d="M122 192 q15 -8 19 -27 q-15 2 -19 27z" fill="${C.dim}" transform="rotate(${a} 122 192)"/>`).join("")}<circle cx="122" cy="192" r="9" fill="${P.metal}"/></g>` +
        `<rect x="236" y="140" width="42" height="34" rx="3" fill="${P.metal}"/><rect x="242" y="148" width="30" height="6" fill="${C.night}" opacity=".5"/>` +
        `<rect x="236" y="182" width="42" height="34" rx="3" fill="${P.metal}"/><rect x="242" y="190" width="30" height="6" fill="${C.night}" opacity=".5"/>` +
        `<rect x="232" y="224" width="46" height="40" rx="3" fill="${P.metal}"/><rect x="240" y="234" width="30" height="20" rx="2" fill="${C.night}" opacity=".55"/>` +
        `<rect x="192" y="196" width="30" height="30" rx="3" fill="${P.black}"/><circle cx="197" cy="201" r="2" fill="${C.dim}"/>` +
        `<rect x="58" y="262" width="22" height="10" rx="3" fill="${P.metal}"/><rect x="96" y="263" width="16" height="9" rx="2" fill="${P.metal}"/><rect x="124" y="263" width="16" height="9" rx="2" fill="${P.metal}"/>` +
        `<circle id="led" cx="194" cy="246" r="4" fill="#58e08a"/></g>`);
    },
    /** Camera Module 3 Wide: small PCB, lens, ribbon cable; #cone is its 102° field of view. */
    cam({ id = "cam", style = "fun" } = {}) {
      const { P, ol } = kit(style);
      const a = (51 * Math.PI) / 180, r = 150, lx = 150, ly = 168;
      const cone = `<g id="cone"><path d="M${lx} ${ly} L${(lx - Math.sin(a) * r).toFixed(1)} ${(ly - Math.cos(a) * r).toFixed(1)} A${r} ${r} 0 0 1 ${(lx + Math.sin(a) * r).toFixed(1)} ${(ly - Math.cos(a) * r).toFixed(1)} Z" fill="${C.signal}" opacity=".16"/>` +
        `<path d="M${lx} ${ly} L${(lx - Math.sin(a) * r).toFixed(1)} ${(ly - Math.cos(a) * r).toFixed(1)} M${lx} ${ly} L${(lx + Math.sin(a) * r).toFixed(1)} ${(ly - Math.cos(a) * r).toFixed(1)}" stroke="${C.signal}" stroke-width="2.5" stroke-dasharray="6 6" opacity=".8"/>` +
        `<text x="${lx}" y="${ly - r + 34}" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="20" fill="${C.signal}">102°</text></g>`;
      return svg(id, shadow(150, 80) + cone + `<g id="body">` +
        `<path d="M150 232 V258 Q150 272 136 272 H64" stroke="${P.ribbon}" stroke-width="22" fill="none" stroke-linejoin="round"/><path d="M150 232 V258 Q150 272 136 272 H64" stroke="#000" stroke-opacity=".12" stroke-width="22" stroke-dasharray="2 5" fill="none"/>` +
        `<rect x="95" y="122" width="110" height="112" rx="6" fill="${P.pcb}"${ol}/>` + hole(106, 133, P) + hole(194, 133, P) + hole(106, 223, P) + hole(194, 223, P) +
        `<rect x="116" y="134" width="68" height="68" rx="4" fill="${P.black}"/>` +
        `<circle cx="150" cy="168" r="27" fill="#0b0e11"/><circle cx="150" cy="168" r="19" fill="#173040"/><circle cx="150" cy="168" r="9" fill="#08131a"/>` +
        `<circle cx="142" cy="160" r="5" fill="${C.signal}" opacity=".9"/>` +
        `<rect x="112" y="214" width="76" height="20" rx="2" fill="#d9d2c0"/></g>`);
    },
    /** USB GPS puck (u-blox), antenna up; #arcs = satellite signal. */
    gps({ id = "gps", style = "fun" } = {}) {
      const { A, P } = kit(style);
      return svg(id, shadow(150, 95) +
        `<g id="arcs">${[34, 58, 82].map((r, i) => `<path class="arc" d="M${150 - r} ${166 - i * 2} A${r} ${r} 0 0 1 ${150 + r} ${166 - i * 2}" stroke="${C.signal}" stroke-width="7" fill="none" stroke-linecap="round"/>`).join("")}</g>` +
        `<g id="body"><path d="M236 236 q40 6 34 36 L256 272" stroke="${C.dim}" stroke-width="8" fill="none" stroke-linecap="round"/><rect x="248" y="264" width="26" height="14" rx="2" fill="${P.metal}"/>` +
        `<rect x="60" y="180" width="180" height="92" rx="30" fill="${P.puck}"${A ? ` stroke="${C.ink}" stroke-width="3"` : ""}/>` +
        `<rect x="74" y="186" width="152" height="30" rx="15" fill="#39414a"/>` +
        `<circle id="led" cx="208" cy="246" r="5" fill="${C.signal}"/><text x="150" y="252" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="14" fill="${C.dim}" letter-spacing="2">GPS</text></g>`);
    },
    /** BNO085 9-axis IMU breakout; #axes = x/y/z arrows, they lean with the board. */
    imu({ id = "imu", style = "fun" } = {}) {
      const { P, ol } = kit(style);
      const ar = (d, col) => `<path d="${d}" stroke="${col}" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
      return svg(id, shadow(150, 80) + `<g id="body">` +
        `<rect x="78" y="140" width="144" height="132" rx="10" fill="${P.purple}"${ol}/>` + hole(94, 156, P) + hole(206, 156, P) +
        Array.from({ length: 9 }, (_, i) => `<rect x="${94 + i * 14}" y="250" width="8" height="8" fill="${P.gold}"/>`).join("") +
        `<rect x="124" y="172" width="52" height="52" rx="4" fill="${P.black}"/><circle cx="131" cy="179" r="2.5" fill="${C.dim}"/>` +
        `<text x="150" y="240" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="${C.ink}" opacity=".7">BNO085</text>` +
        `<g id="axes" font-family="IBM Plex Mono, monospace" font-size="20" font-weight="500">` +
        ar("M150 198 V92 m-10 12 l10 -12 l10 12", C.signal) + `<text x="160" y="96" fill="${C.signal}">z</text>` +
        ar("M150 198 H262 m-12 -10 l12 10 l-12 10", C.lamp) + `<text x="252" y="186" fill="${C.lamp}">x</text>` +
        ar("M150 198 L218 130 m-15 0 l15 0 l0 15", C.brake) + `<text x="222" y="128" fill="${C.brake}">y</text></g></g>`);
    },
    /** Waterproof ultrasonic sensor: probe on a cable to its driver board; #pings = sound out. */
    sonar({ id = "sonar", style = "fun" } = {}) {
      const { P, ol } = kit(style);
      return svg(id, shadow(140, 110) + `<g id="body">` +
        `<rect x="36" y="226" width="104" height="46" rx="5" fill="${P.pcb}"${ol}/><rect x="70" y="236" width="30" height="22" rx="2" fill="${P.black}"/>` +
        Array.from({ length: 4 }, (_, i) => `<rect x="${46 + i * 7}" y="262" width="4" height="10" fill="${P.gold}"/>`).join("") +
        `<path d="M130 232 C170 232 150 186 176 186" stroke="#20252b" stroke-width="10" fill="none" stroke-linecap="round"/>` +
        `<rect x="160" y="160" width="62" height="52" rx="8" fill="${P.black}"${ol}/>` +
        `<ellipse cx="222" cy="186" rx="10" ry="27" fill="${P.metal}"/><ellipse cx="223" cy="186" rx="6" ry="20" fill="#7f868e"/>` +
        `<g id="pings">${[0, 1, 2].map((i) => `<path class="ping" d="M${240 + i * 20} ${158 - i * 6} q${18 + i * 4} ${28 + i * 6} 0 ${56 + i * 12}" stroke="${C.ink}" stroke-width="5" fill="none" stroke-linecap="round"/>`).join("")}</g>` +
        `<text x="88" y="222" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="${C.dim}">driver</text></g>`);
    },
    /** A3144 Hall sensor (TO-92, three legs) with the spoke magnet on its orbit; #pulse glows on each pass. */
    hall({ id = "hall", style = "fun" } = {}) {
      const { A, P } = kit(style);
      return svg(id, shadow(150, 90) +
        `<circle cx="200" cy="205" r="80" fill="none" stroke="${C.dim}" stroke-width="2" stroke-dasharray="4 8" opacity=".6"/>` +
        `<g id="body"><circle id="pulse" cx="145" cy="180" r="44" fill="${C.lamp}" opacity="0"/>` +
        `<path d="M130 214 V272 M145 214 V272 M160 214 V272" stroke="${P.metal}" stroke-width="5" stroke-linecap="round"/>` +
        `<path d="M118 216 V164 Q118 150 132 150 H158 Q172 150 172 164 V216 Z" fill="${P.black}"${A ? ` stroke="${C.ink}" stroke-width="3"` : ` stroke="#2d333a" stroke-width="2"`}/>` +
        `<text x="145" y="190" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="${C.dim}">3144</text></g>` +
        `<g id="magnet"><rect x="246" y="228" width="34" height="24" rx="5" fill="${P.metal}"/><rect x="246" y="228" width="17" height="24" rx="5" fill="${C.brake}"/>` +
        `<text x="254" y="245" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="${C.night}">N</text><text x="272" y="245" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="12" fill="${C.night}">S</text></g>`);
    },
    /** The IP65 box; #lid hinges at its left end (svgOrigin "12 121"). */
    box({ id = "box", style = "fun" } = {}) {
      const { A, P } = kit(style);
      return svg(id, shadow(150, 130) +
        `<defs><radialGradient id="${id}-glow" cx="50%" cy="100%" r="80%"><stop offset="0" stop-color="${C.lamp}" stop-opacity=".9"/><stop offset="1" stop-color="${C.lamp}" stop-opacity="0"/></radialGradient></defs>` +
        `<g id="glow"><ellipse cx="150" cy="110" rx="150" ry="90" fill="url(#${id}-glow)" opacity="0"/></g>` +
        `<g id="body"><rect x="20" y="130" width="260" height="150" rx="14" fill="${P.box}" stroke="${A ? C.ink : P.boxEdge}" stroke-width="${A ? 3 : 5}"/>` +
        `<rect x="34" y="246" width="40" height="16" rx="4" fill="${C.line}"/><rect x="226" y="246" width="40" height="16" rx="4" fill="${C.line}"/>` +
        `<text x="150" y="226" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="22" fill="${C.dim}" letter-spacing="3">IP65</text></g>` +
        `<g id="lid"><rect x="12" y="104" width="276" height="34" rx="10" fill="${P.boxEdge}" ${A ? `stroke="${C.ink}" stroke-width="3"` : ""}/></g>`);
    },
  };
  Parts.ORDER = ["pi", "cam", "gps", "imu", "sonar", "hall"];
  Parts.NAMES = { pi: "Raspberry Pi 5", cam: "Camera Module 3 Wide", gps: "USB GPS", imu: "BNO085 IMU", sonar: "Ultrasonic", hall: "A3144 Hall sensor", box: "IP65 box" };
  window.Parts = Parts;
})();
