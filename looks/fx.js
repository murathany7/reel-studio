/* Texture and post effects for looks (looks/README.md), drawn by the Studio clock.
 *
 *   <script src="/looks/fx.js"></script>
 *   const stage = document.getElementById("stage");
 *   LookFx.grain(stage, { amount: 0.12 });
 *   LookFx.glitch(document.getElementById("title"), { at: [1.2, 3.4] });
 *
 * Every effect is a pure function of t: noise is seeded by the frame number, so two renders of a frame match.
 * Effects that move an element (weave, jitter, flicker, glitch) use the CSS `translate`, `rotate`, `opacity` and
 * `filter` properties, not `transform`, so they stack with GSAP tweens on the same element. Overlays (grain,
 * scanlines, vignette, halftone, leaks) are added on top of everything inside the element given (usually #stage).
 */
(function () {
  const frame = (t, fps) => Math.floor(t * fps + 1e-6);
  const inWindow = (t, at, dur) => at.some((a) => t >= a && t < a + dur);
  let ids = 0;

  function overlay(parent, css, z = 8000) {
    const el = document.createElement("div");
    el.className = "look-fx";
    el.style.cssText = `position:absolute;inset:0;pointer-events:none;z-index:${z};${css}`;
    parent.appendChild(el);
    return el;
  }

  window.LookFx = {
    /** Film or sensor grain: new seeded noise every 1/fps s. `size` = grain size in px (the canvas is that much smaller). */
    grain(parent, { amount = 0.1, size = 2, fps = 24, seed = 1, blend = "overlay", mono = true } = {}) {
      const { width, height } = Studio.meta;
      const c = document.createElement("canvas");
      c.width = Math.ceil(width / size); c.height = Math.ceil(height / size);
      const el = overlay(parent, `mix-blend-mode:${blend};opacity:${amount * 4};`, 8100);
      c.style.cssText = "width:100%;height:100%;image-rendering:pixelated;";
      el.appendChild(c);
      const ctx = c.getContext("2d");
      const img = ctx.createImageData(c.width, c.height);
      Studio.onSeek((t) => {
        const rnd = Studio.random(seed * 7919 + frame(t, fps));
        const d = img.data;
        for (let i = 0; i < d.length; i += 4) {
          const v = rnd() * 255;
          d[i] = v; d[i + 1] = mono ? v : rnd() * 255; d[i + 2] = mono ? v : rnd() * 255; d[i + 3] = 255;
        }
        ctx.putImageData(img, 0, 0);
      });
      return el;
    },

    /** CRT / monitor lines. `roll` px/s moves a brighter band down the screen (0 = still). */
    scanlines(parent, { gap = 4, opacity = 0.22, roll = 0, color = "0,0,0" } = {}) {
      const el = overlay(parent, `background:repeating-linear-gradient(to bottom, rgba(${color},${opacity}) 0 ${gap / 2}px, transparent ${gap / 2}px ${gap}px);`, 8050);
      if (roll) {
        const band = overlay(el, "background:linear-gradient(to bottom, transparent, rgba(255,255,255,.06), transparent);height:22%;inset:auto 0 auto 0;", 1);
        Studio.onSeek((t) => { band.style.top = `${((t * roll) % (Studio.meta.height * 1.3)) - Studio.meta.height * 0.25}px`; });
      }
      return el;
    },

    /** Darkened (or tinted) corners. */
    vignette(parent, { amount = 0.55, color = "0,0,0", inner = 45 } = {}) {
      return overlay(parent, `background:radial-gradient(ellipse at 50% 50%, transparent ${inner}%, rgba(${color},${amount}) 100%);`, 8020);
    },

    /** Print halftone dots over the frame (`blend` multiply on light looks, screen on dark ones). */
    halftone(parent, { cell = 9, dot = 1.6, color = "0,0,0", opacity = 0.18, blend = "multiply" } = {}) {
      return overlay(parent, `background-image:radial-gradient(rgba(${color},1) ${dot}px, transparent ${dot + 0.6}px);background-size:${cell}px ${cell}px;opacity:${opacity};mix-blend-mode:${blend};`, 8030);
    },

    /** Warm light leaks drifting across the frame (film, retro). `colors` = CSS colours, one blob each. */
    leaks(parent, { colors = ["#ff7a2f", "#ffcf6e"], opacity = 0.45, speed = 0.12, seed = 3 } = {}) {
      const el = overlay(parent, `mix-blend-mode:screen;opacity:${opacity};`, 8040);
      const rnd = Studio.random(seed);
      const blobs = colors.map((c) => {
        const b = document.createElement("div");
        b.style.cssText = `position:absolute;width:90%;height:60%;border-radius:50%;filter:blur(120px);background:${c};`;
        el.appendChild(b);
        return { b, px: rnd() * 6.28, py: rnd() * 6.28, sx: 0.6 + rnd(), sy: 0.6 + rnd() };
      });
      Studio.onSeek((t) => {
        for (const p of blobs) {
          p.b.style.left = `${-20 + 60 * (0.5 + 0.5 * Math.sin(p.px + t * speed * 6.28 * p.sx))}%`;
          p.b.style.top = `${-20 + 80 * (0.5 + 0.5 * Math.sin(p.py + t * speed * 6.28 * p.sy))}%`;
        }
      });
      return el;
    },

    /** Film gate weave: the whole picture drifts a pixel or two, new offset each frame. */
    weave(el, { px = 1.5, deg = 0.08, fps = 24, seed = 5 } = {}) {
      Studio.onSeek((t) => {
        const rnd = Studio.random(seed * 104729 + frame(t, fps));
        el.style.translate = `${(rnd() - 0.5) * 2 * px}px ${(rnd() - 0.5) * 2 * px}px`;
        el.style.rotate = `${(rnd() - 0.5) * 2 * deg}deg`;
      });
    },

    /** Hand-made "boil": cut-outs and drawings shift a little on twos or threes (stop-motion feel). */
    jitter(els, { px = 2.5, deg = 0.8, fps = 12, seed = 11 } = {}) {
      const list = typeof els === "string" ? [...document.querySelectorAll(els)] : [].concat(els);
      Studio.onSeek((t) => {
        list.forEach((el, i) => {
          const rnd = Studio.random(seed + i * 7907 + frame(t, fps) * 31);
          el.style.translate = `${(rnd() - 0.5) * 2 * px}px ${(rnd() - 0.5) * 2 * px}px`;
          el.style.rotate = `${(rnd() - 0.5) * 2 * deg}deg`;
        });
      });
    },

    /** Neon / failing-tube flicker: mostly on, seeded dips. `rate` = dips per second on average. */
    flicker(el, { rate = 1.2, depth = 0.65, fps = 30, seed = 13, from = 0 } = {}) {
      Studio.onSeek((t) => {
        if (t < from) { el.style.opacity = ""; return; }
        const rnd = Studio.random(seed * 15485863 + frame(t, fps));
        el.style.opacity = rnd() < rate / fps ? String(1 - depth * (0.5 + rnd() / 2)) : "";
      });
    },

    /** Neon glow on text: layered text-shadows in `color` (uses currentColor when not given). */
    neon(el, { color = "currentColor", spread = 1 } = {}) {
      const s = (r) => `0 0 ${r * spread}px ${color}`;
      el.style.textShadow = [s(2), s(8), s(22), s(48), s(90)].join(",");
    },

    /** Digital glitch at each time in `at` for `dur` s: displaced horizontal bands and an RGB split. */
    glitch(el, { at = [], dur = 0.16, strength = 60, split = 10, fps = 30, seed = 17 } = {}) {
      const id = `lookfx-glitch-${++ids}`;
      const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("width", 0); svg.setAttribute("height", 0);
      svg.style.position = "absolute";
      svg.innerHTML = `<filter id="${id}" x="-10%" y="-10%" width="120%" height="120%" color-interpolation-filters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.0001 0.06" numOctaves="1" seed="1" result="n"/>
        <feDisplacementMap in="SourceGraphic" in2="n" scale="0" xChannelSelector="R" yChannelSelector="A" result="d"/>
        <feColorMatrix in="d" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r"/>
        <feOffset in="r" dx="0" result="ro"/>
        <feColorMatrix in="d" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" result="gb"/>
        <feOffset in="gb" dx="0" result="gbo"/>
        <feBlend in="ro" in2="gbo" mode="screen"/>
      </filter>`;
      document.body.appendChild(svg);
      const [turb, disp, , ro, , gbo] = svg.querySelector("filter").children;
      Studio.onSeek((t) => {
        if (!inWindow(t, at, dur)) { el.style.filter = ""; return; }
        const rnd = Studio.random(seed * 6151 + frame(t, fps));
        turb.setAttribute("seed", String(1 + Math.floor(rnd() * 999)));
        disp.setAttribute("scale", String(strength * (0.4 + rnd() * 0.6)));
        const dx = split * (0.5 + rnd() * 0.5);
        ro.setAttribute("dx", String(dx)); gbo.setAttribute("dx", String(-dx));
        el.style.filter = `url(#${id})`;
      });
    },
  };
})();
