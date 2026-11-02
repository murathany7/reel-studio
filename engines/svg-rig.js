/* SVG character rig for flat 2D cartoon characters, animated on Studio.tl (GSAP).
 * For a character drawn in code (no designer file). Name the parts in the SVG:
 *
 *   #body   whole character (bob, squash)      #eyes   group of eyes (blink)
 *   #mouth-closed, #mouth-open                  mouth shapes (talk)
 *   #arm-l, #arm-r                              arms (wave), pivot at the shoulder (data-pivot to change)
 *
 *   <script src="/engines/svg-rig.js"></script>
 *   const po = SvgRig(document.getElementById("hero"));
 *   po.idle(0, 6);  po.blink([1.2, 3.4]);  po.talk(2.0, 3.6);  po.wave(4.0);
 *
 * Missing parts are skipped, so a simple character can use only #body and #eyes.
 */
(function () {
  window.SvgRig = function (root) {
    const tl = Studio.tl;
    const $ = (id) => root.querySelector("#" + id);
    const body = $("body"), eyes = $("eyes");
    const open = $("mouth-open"), closed = $("mouth-closed");
    const armL = $("arm-l"), armR = $("arm-r");
    if (eyes) gsap.set(eyes, { transformBox: "fill-box", transformOrigin: "50% 50%" });
    if (body) gsap.set(body, { transformBox: "fill-box", transformOrigin: "50% 100%" });
    if (open) gsap.set(open, { opacity: 0 });
    // Arms pivot at the shoulder: the inner, lower corner of each arm's box (override with data-pivot="x% y%").
    if (armR) gsap.set(armR, { transformOrigin: armR.dataset.pivot || "15% 85%" });
    if (armL) gsap.set(armL, { transformOrigin: armL.dataset.pivot || "85% 85%" });

    return {
      /** Gentle breathing bob from `from` to `to` seconds. */
      idle(from, to, { amount = 10, period = 1.6 } = {}) {
        if (!body) return this;
        for (let t = from; t < to; t += period) {
          const d = Math.min(period, to - t) / 2;
          tl.to(body, { y: -amount, scaleY: 1.02, duration: d, ease: "sine.inOut" }, t)
            .to(body, { y: 0, scaleY: 1, duration: d, ease: "sine.inOut" }, t + d);
        }
        return this;
      },
      /** Blink at each time in `times`. */
      blink(times) {
        if (!eyes) return this;
        for (const t of times) {
          tl.to(eyes, { scaleY: 0.1, duration: 0.06, ease: "power1.in" }, t)
            .to(eyes, { scaleY: 1, duration: 0.08, ease: "power1.out" }, t + 0.06);
        }
        return this;
      },
      /** Flap the mouth between `from` and `to` (about 8 shapes a second, like simple lip flap).
       *  Pass `beats` (seconds) instead to open the mouth on word starts from a transcript. */
      talk(from, to, { rate = 8, beats = null } = {}) {
        if (!open || !closed) return this;
        const ts = beats ?? Array.from({ length: Math.floor((to - from) * rate) }, (_, i) => from + i / rate);
        for (const t of ts) {
          tl.set(open, { opacity: 1 }, t).set(closed, { opacity: 0 }, t)
            .set(open, { opacity: 0 }, t + 0.5 / rate).set(closed, { opacity: 1 }, t + 0.5 / rate);
        }
        return this;
      },
      /** Wave the right arm at `at` seconds. */
      wave(at, { times = 3, arm = armR } = {}) {
        if (!arm) return this;
        for (let i = 0; i < times; i++) {
          tl.to(arm, { rotation: -25, duration: 0.15, ease: "sine.inOut" }, at + i * 0.3)
            .to(arm, { rotation: 10, duration: 0.15, ease: "sine.inOut" }, at + i * 0.3 + 0.15);
        }
        tl.to(arm, { rotation: 0, duration: 0.2 }, at + times * 0.3);
        return this;
      },
      /** Squash on landing, stretch on take-off: the classic cartoon bounce. */
      hop(at, { height = 120 } = {}) {
        if (!body) return this;
        tl.to(body, { scaleY: 0.85, scaleX: 1.1, duration: 0.1 }, at)
          .to(body, { y: -height, scaleY: 1.1, scaleX: 0.92, duration: 0.25, ease: "power2.out" }, at + 0.1)
          .to(body, { y: 0, scaleY: 1, scaleX: 1, duration: 0.25, ease: "power2.in" }, at + 0.35)
          .to(body, { scaleY: 0.88, scaleX: 1.08, duration: 0.07 }, at + 0.6)
          .to(body, { scaleY: 1, scaleX: 1, duration: 0.15, ease: "back.out(3)" }, at + 0.67);
        return this;
      },
    };
  };
})();
