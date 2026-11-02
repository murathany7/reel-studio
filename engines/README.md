# Engines

Every engine plugs into one clock. The renderer asks the page for time `t`, and every layer draws itself at `t`.
That is what makes every frame deterministic and checkable, whatever drew it.

## Which engine for which look

| Look | Engine | File | Status |
|---|---|---|---|
| Moving text, app UI demos, ad layouts, end cards | **HTML/CSS + GSAP** | built into `core/lib/runtime.js` (`Studio.tl`) | ✅ tested |
| Flat 2D cartoon character drawn in code | **SVG rig + GSAP** | `svg-rig.js` (`idle`, `blink`, `talk`, `wave`, `hop`) | ✅ tested |
| 2D animation from a designer (After Effects) | **Lottie** | `Studio.lottie(el, path)` in the runtime | ✅ ported from the Yuppo renderer |
| 2D character with states, from Rive | **Rive** | — | 🔜 planned: needs a `.riv` file to build and test against |
| Particles, confetti, many sprites, 2D game-like motion | **Pixi.js v8** | `pixi.js` (`pixiLayer`) | ✅ tested |
| 3D product, CAD, camera moves, 3D cartoon (toon + outline) | **Three.js** | `three.js` (`threeLayer`, `toon`, `outline`) | ✅ tested |
| High-end 3D cartoon, real lighting, physics, simulations | **Blender** (headless, Python) | `blender/render.sh` + a scene script → MP4 plate | ✅ tested (Blender 5.2, Eevee) |
| A live website or web app you own (its own 3D scene, UI) | **Page capture** | `capture.mjs` → PNG sequence → MP4 plate | ✅ used for the Bike Logger reel |
| Real-looking footage | AI video generation or stock, as a plate | `Studio.video(el)` | Footage only. Never shows product facts; check the brand's compliance |

**Rule of thumb:** start with GSAP. Add one engine for the hero visual. More than two engines in one piece usually means the idea is unclear.

## Two kinds of engine

- **Live layers** run in the composition page and are drawn on every seek: GSAP, SVG rig, Lottie, Pixi, Three.js.
  They can be stacked freely (`<div class="layer">` per engine) and all share the GSAP timeline for cuts and fades.
- **Plates** are rendered first, then played as a `<video>` layer with `Studio.video(el, { start })`: Blender,
  page capture, footage. Encode plates with `-g 1` (every frame a keyframe) so seeking is frame-exact.

## Determinism rules (all engines)

1. **Pose from `t` only.** `update(t)` sets every position, rotation and colour from `t`. No `+= delta`, no state carried between frames. The renderer can ask for any frame in any order.
2. **No hidden clocks.** No `requestAnimationFrame` loops, `setTimeout`, CSS animations or transitions, `Date.now()`, or video autoplay.
3. **No unseeded randomness.** Use `Studio.random(seed)`.
4. **Physics:** simulate at a fixed step ahead of time (or in Blender), store the result, look it up by `t`.
5. **Wait for loading.** Anything async goes through `Studio.wait(promise)` so frame 0 is never half-loaded.
6. **WebGL needs `preserveDrawingBuffer: true`** (the adapters set it) so screenshots see the canvas.
7. **Don't change the Chrome flags or the pinned playwright-core casually.** GPU compositing or a newer Playwright
   made `<video>` plates ~10 levels too bright (see `CHROME_ARGS` in `core/render.mjs` and *Learnings* in `STATUS.md`).

Check with: `node core/render.mjs still <comp> a.png --t 3` twice, then `md5 -q a.png b.png`. They must match.

## Adding an engine

Write `engines/<name>.js` that creates its canvas or DOM inside a layer element, registers loading with
`Studio.wait`, and draws with `Studio.onSeek((t) => …)`. Add a scene to `examples/engines-demo/`, render stills,
check two renders match, then add a row to the table above.
