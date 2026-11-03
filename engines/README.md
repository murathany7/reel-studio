# Engines

Every engine plugs into one clock. The renderer asks the page for time `t`, and every layer draws itself at `t`.
That is what makes every frame deterministic and checkable, whatever drew it.

## Which engine for which look

| Look | Engine | File | Status |
|---|---|---|---|
| Moving text, app UI demos, ad layouts, end cards | **HTML/CSS + GSAP** | built into `core/lib/runtime.js` (`Studio.tl`) | ✅ tested |
| Flat 2D cartoon character drawn in code | **SVG rig + GSAP** | `svg-rig.js` (`idle`, `blink`, `talk`, `wave`, `hop`) | ✅ tested |
| 2D animation from a designer (After Effects) | **Lottie** | `Studio.lottie(el, path)` in the runtime | ✅ ported from the Yuppo renderer |
| 2D character with states, from Rive | **Rive** | `rive.js` (`riveLayer`: timeline or state machine with timed inputs) | ✅ tested with Rive's public `vehicles.riv` |
| Particles, confetti, many sprites, 2D game-like motion | **Pixi.js v8** | `pixi.js` (`pixiLayer`) | ✅ tested |
| 3D product, CAD, camera moves, 3D cartoon (toon + outline) | **Three.js** | `three.js` (`threeLayer`, `toon`, `outline`) | ✅ tested |
| High-end 3D cartoon, real lighting, physics, simulations | **Blender** (headless, Python) | `blender/render.sh` + a scene script → MP4 plate | ✅ tested (Blender 5.2, Eevee) |
| A live website or web app you own (its own 3D scene, UI) | **Page capture** | `capture.mjs` → PNG sequence → MP4 plate | ✅ used for the Bike Logger reel |
| Real-looking footage | AI video generation or stock, as a plate | `Studio.video(el)` | Footage only. Never shows product facts; check the brand's compliance |
| Transitions between layers with pixels (dissolve, ripple, zoom blur, glitch, pixelate) | **WebGL shaders** | `gl-transitions.js` (`glTransition`) | ✅ tested |

Reel helpers in the runtime, on the same clock (`core/README.md`): `Studio.captions` (word-by-word captions from
whisper timings), `Studio.beats` / `bar` / `beat` / `snap` / `beatPhase` (cut on the music, from
`scripts/beats.mjs`), `Studio.transition` (wipe, iris, push, slide, zoom, whip, blinds, flash on any layer),
`Studio.swap` (a hard cut), and formats (`Studio.setup({ formats })`, `--formats all`). Working example:
`examples/reel-layer/`.

**Rule of thumb:** start with GSAP. Add one engine for the hero visual. More than two engines in one piece usually means the idea is unclear.

## Two kinds of engine

- **Live layers** run in the composition page and are drawn on every seek: GSAP, SVG rig, Lottie, Pixi, Three.js.
  They can be stacked freely (`<div class="layer">` per engine) and all share the GSAP timeline for cuts and fades.
- **Plates** are rendered first, then shown as a `<video>` layer with `Studio.video(el, { start })`: Blender,
  page capture, footage. In a render, the renderer decodes each plate to PNG frames with ffmpeg once (cached) and
  shows frame `floor((t - start) × plate fps)` in an `<img>` styled like the video, so Chrome never decodes video:
  colours are ffmpeg's and nothing can race a seek. Give a plate a size in CSS (it is a layer). Previews and the desk
  still play the `<video>`; there `-g 1` (every frame a keyframe) keeps seeking frame-exact.

## Determinism rules (all engines)

1. **Pose from `t` only.** `update(t)` sets every position, rotation and colour from `t`. No `+= delta`, no state carried between frames. The renderer can ask for any frame in any order.
2. **No hidden clocks.** No `requestAnimationFrame` loops, `setTimeout`, CSS animations or transitions, `Date.now()`, or video autoplay.
3. **No unseeded randomness.** Use `Studio.random(seed)`.
4. **Physics:** simulate at a fixed step ahead of time (or in Blender), store the result, look it up by `t`.
5. **Wait for loading.** Anything async goes through `Studio.wait(promise)` so frame 0 is never half-loaded.
6. **WebGL needs `preserveDrawingBuffer: true`** (the adapters set it) so screenshots see the canvas.
7. **Don't change the Chrome flags casually.** GPU compositing made `<video>` plates ~10 levels too bright (see
   `CHROME_ARGS` in `core/render.mjs` and *Learnings* in `STATUS.md`). Renders no longer decode video, but previews do.
8. **Layers that read other layers' pixels** (`gl-transitions.js`) register with `Studio.onSeek(fn, { late: true })`
   so they run after every layer has drawn.

Check with: `node core/render.mjs still <comp> a.png --t 3` twice, then `md5 -q a.png b.png`. They must match.
Stateful engines (a Rive state machine): also render stills in two orders (`--workers 1`, then `--workers 2` with the
times reversed) and compare. `npm test` checks a video renders the same with 1 and 4 workers, and its frames match
stills of the same times.

## Adding an engine

Write `engines/<name>.js` that creates its canvas or DOM inside a layer element, registers loading with
`Studio.wait`, and draws with `Studio.onSeek((t) => …)`. Add a scene to `examples/engines-demo/`, render stills,
check two renders match, then add a row to the table above.
