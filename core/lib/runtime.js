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
 * Preview in a browser (served from the repo root):
 *   .../composition/index.html          plays live, loops
 *   .../composition/index.html?t=2.5    freezes at 2.5 s
 *   .../composition/index.html?safe=1   shows the safe-zone overlay
 */
(function () {
  const params = new URLSearchParams(location.search);
  const hooks = [];
  const pending = [];

  const Studio = {
    meta: null,
    tl: null,
    params,

    setup({ width = 1080, height = 1920, fps = 30, duration }) {
      if (!duration) throw new Error("Studio.setup needs a duration (seconds)");
      this.meta = { width, height, fps, duration };
      const stage = document.getElementById("stage");
      stage.style.width = width + "px";
      stage.style.height = height + "px";
      this.tl = gsap.timeline({ paused: true });
      // Make sure the timeline is exactly `duration` long.
      this.tl.set({}, {}, duration);
      if (params.get("safe") === "1") document.documentElement.classList.add("show-safe");
      return this.tl;
    },

    /** Draw a layer at time t on every seek. Hooks run in registration order. */
    onSeek(fn) { hooks.push(fn); return fn; },

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

    /** Register a <video> element (a pre-rendered plate: Blender, a capture, footage). */
    video(el, { start = 0 } = {}) {
      el.muted = true; el.preload = "auto"; el.pause();
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
  };

  async function seek(t) {
    Studio.tl.seek(t, false);
    for (const fn of hooks) await fn(t);
  }

  window.Studio = Studio;
  window.__seek = seek;
  window.__meta = () => Studio.meta;
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
