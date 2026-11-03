/* Bike Logger crew (DRAFT, awaiting approval): the real parts drawn as flat cartoon characters.
 * Each returns an <svg> string with SvgRig part ids (#body, #eyes, #mouth-closed, #mouth-open, #arm-l, #arm-r).
 * Colours only from brands/bike-logger/tokens.css. */
(function () {
  const C = { night: "#06080a", ink: "#eceae4", dim: "#868d95", line: "#262b31", lamp: "#ffc46e", signal: "#84dcff", brake: "#ff4a3d", chip: "#b9bec4" };
  const eye = (x, y, r = 17, look = 3) =>
    `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${r * 1.15}" fill="${C.ink}"/>` +
    `<circle cx="${x + look}" cy="${y + 3}" r="${r * 0.55}" fill="${C.night}"/>` +
    `<circle cx="${x + look + r * 0.22}" cy="${y - r * 0.12}" r="${r * 0.18}" fill="${C.ink}"/>`;
  const mouth = (x, y, w = 22) =>
    `<path id="mouth-closed" d="M${x - w} ${y} Q${x} ${y + w * 0.9} ${x + w} ${y}" stroke="${C.night}" stroke-width="7" fill="none" stroke-linecap="round"/>` +
    `<path id="mouth-open" d="M${x - w} ${y} Q${x} ${y + w * 1.6} ${x + w} ${y} Z" fill="${C.night}"/>`;
  const arm = (id, x1, y1, x2, y2, col = C.ink) =>
    `<g id="${id}"><path d="M${x1} ${y1} Q${(x1 + x2) / 2} ${y1 - 18} ${x2} ${y2}" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round"/><circle cx="${x2}" cy="${y2}" r="11" fill="${col}"/></g>`;
  const legs = (x1, x2, y, col = C.ink) =>
    `<path d="M${x1} ${y} v26 h-12 M${x2} ${y} v26 h12" stroke="${col}" stroke-width="9" fill="none" stroke-linecap="round" stroke-linejoin="round"/>`;
  const shadow = (cx, y, rx) => `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="10" fill="#000" opacity=".45"/>`;
  const svg = (id, inner) => `<svg class="crew" id="${id}" viewBox="0 0 300 300" overflow="visible">${inner}</svg>`;

  window.Crew = {
    C,
    // Raspberry Pi 5 with the active cooler as a hat. The leader.
    pi: (id = "pi") => svg(id, shadow(150, 286, 95) + `<g id="body">` +
      legs(110, 190, 248) +
      arm("arm-l", 52, 190, 18, 150) + arm("arm-r", 248, 190, 282, 150) +
      `<rect x="45" y="118" width="210" height="135" rx="18" fill="#3fa66b"/>` +
      `<rect x="45" y="118" width="210" height="135" rx="18" fill="none" stroke="#2c7a4d" stroke-width="5"/>` +
      Array.from({ length: 10 }, (_, i) => `<rect x="${66 + i * 17}" y="128" width="9" height="9" rx="1.5" fill="${C.lamp}"/>`).join("") +
      `<rect x="200" y="214" width="40" height="28" rx="4" fill="${C.chip}"/>` +
      // cooler hat
      `<rect x="98" y="72" width="104" height="50" rx="10" fill="${C.line}"/><circle cx="150" cy="96" r="20" fill="${C.night}"/>` +
      `<g id="fan">${[0, 72, 144, 216, 288].map(a => `<path d="M150 96 q12 -6 14 -18 q-12 2 -14 18z" fill="${C.dim}" transform="rotate(${a} 150 96)"/>`).join("")}</g>` +
      `<g id="eyes">${eye(118, 172)}${eye(182, 172)}</g>` + mouth(150, 212) + `</g>`),

    // Camera Module 3 Wide: the lens is its one big eye; ribbon cable for a tail.
    cam: (id = "cam") => svg(id, shadow(150, 286, 80) + `<g id="body">` +
      `<path d="M150 250 q-10 30 -60 30 q-40 0 -70 -14" stroke="${C.lamp}" stroke-width="16" fill="none"/>` +
      legs(118, 182, 248) +
      arm("arm-l", 80, 180, 40, 150) + arm("arm-r", 220, 180, 260, 150) +
      `<rect x="72" y="100" width="156" height="152" rx="16" fill="#3fa66b"/>` +
      `<rect x="96" y="114" width="108" height="108" rx="14" fill="${C.line}"/>` +
      `<g id="eyes"><circle cx="150" cy="168" r="44" fill="${C.night}"/><circle cx="150" cy="168" r="30" fill="#1b3442"/>` +
      `<circle cx="150" cy="168" r="17" fill="${C.night}"/><circle cx="138" cy="154" r="9" fill="${C.signal}"/><circle cx="162" cy="182" r="4" fill="${C.signal}" opacity=".7"/></g>` +
      `<g id="mouth-closed"><path d="M134 236 Q150 246 166 236" stroke="${C.night}" stroke-width="6" fill="none" stroke-linecap="round"/></g>` +
      `<g id="mouth-open"><ellipse cx="150" cy="238" rx="12" ry="8" fill="${C.night}"/></g></g>`),

    // u-blox USB GPS puck, antenna up, signal arcs over its head.
    gps: (id = "gps") => svg(id, shadow(150, 286, 85) + `<g id="body">` +
      `<g id="arcs">${[30, 52, 74].map((r, i) => `<path d="M${150 - r} ${110 - i * 4} A${r} ${r} 0 0 1 ${150 + r} ${110 - i * 4}" stroke="${C.signal}" stroke-width="8" fill="none" stroke-linecap="round" opacity="${1 - i * 0.25}"/>`).join("")}</g>` +
      legs(115, 185, 248) +
      arm("arm-l", 62, 200, 26, 168) + arm("arm-r", 238, 200, 274, 168) +
      `<rect x="55" y="140" width="190" height="112" rx="48" fill="${C.ink}"/>` +
      `<rect x="100" y="146" width="100" height="16" rx="8" fill="${C.chip}"/>` +
      `<path d="M150 250 q6 22 40 30" stroke="${C.dim}" stroke-width="9" fill="none"/>` +
      `<g id="eyes">${eye(120, 192, 15)}${eye(180, 192, 15)}</g>` + mouth(150, 226, 18) + `</g>`),

    // BNO085 9-axis IMU: a small square board, x/y/z arrows orbiting.
    imu: (id = "imu") => svg(id, shadow(150, 286, 70) + `<g id="body">` +
      legs(125, 175, 250) +
      arm("arm-l", 92, 196, 54, 160) + arm("arm-r", 208, 196, 246, 160) +
      `<rect x="85" y="130" width="130" height="122" rx="12" fill="#7a5bd6"/>` +
      Array.from({ length: 6 }, (_, i) => `<circle cx="${100 + i * 20}" cy="142" r="5" fill="${C.lamp}"/>`).join("") +
      `<rect x="112" y="160" width="76" height="76" rx="8" fill="${C.night}"/>` +
      `<g id="eyes">${eye(134, 192, 12)}${eye(166, 192, 12)}</g>` + mouth(150, 220, 13) +
      `<g id="axes" font-family="IBM Plex Mono, monospace" font-size="22" font-weight="500">` +
      `<path d="M150 112 v-40 m-10 12 l10 -12 l10 12" stroke="${C.signal}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="160" y="80" fill="${C.signal}">z</text>` +
      `<path d="M236 112 l36 -20 m-14 -2 l14 2 l-6 12" stroke="${C.lamp}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="270" y="122" fill="${C.lamp}">x</text>` +
      `<path d="M64 112 l-36 -20 m14 -2 l-14 2 l6 12" stroke="${C.brake}" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><text x="14" y="122" fill="${C.brake}">y</text></g></g>`),

    // Waterproof ultrasonic: two probe eyes on a red board, sound pings to the side.
    sonar: (id = "sonar") => svg(id, shadow(150, 286, 95) + `<g id="body">` +
      legs(112, 188, 248) +
      arm("arm-l", 50, 196, 16, 160) + arm("arm-r", 250, 196, 284, 160) +
      `<rect x="40" y="132" width="220" height="120" rx="16" fill="${C.brake}"/>` +
      `<g id="eyes">` + [100, 200].map(x => `<circle cx="${x}" cy="182" r="38" fill="${C.chip}"/><circle cx="${x}" cy="182" r="29" fill="${C.line}"/>` +
        `<circle cx="${x + 4}" cy="185" r="14" fill="${C.night}"/><circle cx="${x + 8}" cy="178" r="5" fill="${C.ink}"/>`).join("") + `</g>` +
      `<g id="pings">${[18, 38, 58].map((r, i) => `<path d="M${270 + r * 0.4} ${150 - r * 0.2} q${r * 0.6} ${32 + r * 0.2} 0 ${64 + r * 0.4}" stroke="${C.ink}" stroke-width="7" fill="none" stroke-linecap="round" opacity="${0.9 - i * 0.25}" transform="translate(${r * 0.6} 0)"/>`).join("")}</g>` +
      mouth(150, 232, 16) + `</g>`),

    // A3144 Hall sensor: a tiny TO-92 chip standing on its three wire legs, with its spoke magnet buddy.
    hall: (id = "hall") => svg(id, shadow(140, 286, 60) + `<g id="body">` +
      `<path d="M120 236 v40 h-12 M140 236 v42 M160 236 v40 h12" stroke="${C.chip}" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/>` +
      arm("arm-l", 96, 196, 60, 166, C.chip) + arm("arm-r", 184, 196, 218, 166, C.chip) +
      `<path d="M95 238 V170 q0 -46 45 -46 q45 0 45 46 V238 Z" fill="${C.line}"/>` +
      `<path d="M95 238 V170 q0 -46 45 -46 q45 0 45 46 V238 Z" fill="none" stroke="${C.dim}" stroke-width="4"/>` +
      `<g id="eyes">${eye(124, 178, 13)}${eye(156, 178, 13)}</g>` +
      `<path id="mouth-closed" d="M128 212 Q140 222 152 212" stroke="${C.ink}" stroke-width="6" fill="none" stroke-linecap="round"/>` +
      `<ellipse id="mouth-open" cx="140" cy="215" rx="11" ry="9" fill="${C.ink}"/>` +
      `<text x="140" y="150" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="16" fill="${C.dim}">3144</text></g>` +
      `<g id="magnet"><circle cx="262" cy="240" r="24" fill="${C.chip}"/><circle cx="262" cy="240" r="14" fill="${C.dim}"/>` +
      `<circle cx="255" cy="236" r="4" fill="${C.night}"/><circle cx="270" cy="236" r="4" fill="${C.night}"/><path d="M256 248 q6 5 12 0" stroke="${C.night}" stroke-width="3" fill="none" stroke-linecap="round"/></g>`),

    // The IP65 box: home for the crew. Lid hinges open (#lid).
    box: (id = "box") => svg(id, shadow(150, 286, 130) +
      `<g id="body"><rect x="20" y="130" width="260" height="150" rx="14" fill="#3a4048"/><rect x="20" y="130" width="260" height="150" rx="14" fill="none" stroke="#4f5660" stroke-width="5"/>` +
      `<rect x="34" y="246" width="40" height="16" rx="4" fill="${C.line}"/><rect x="226" y="246" width="40" height="16" rx="4" fill="${C.line}"/>` +
      `<text x="150" y="226" text-anchor="middle" font-family="IBM Plex Mono, monospace" font-size="22" fill="${C.dim}" letter-spacing="3">IP65</text></g>` +
      `<g id="lid"><rect x="12" y="104" width="276" height="34" rx="10" fill="#4f5660"/></g>`),
  };
})();
