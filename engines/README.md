# Engines

Every engine plugs into one clock. The renderer asks the page for time `t`, and every layer draws itself at `t`.
That is what makes every frame deterministic and checkable, whatever drew it.

## Which engine for which look

| Look | Engine | File | Status |
|---|---|---|---|
| Moving text, app UI demos, ad layouts, end cards | **HTML/CSS + GSAP** | built into `core/lib/runtime.js` (`Studio.tl`) | ✅ tested |
| Flat 2D cartoon character drawn in code | **SVG rig + GSAP** | `svg-rig.js` (`idle`, `blink`, `talk`, `lipsync`, `wave`, `hop`) | ✅ tested |
| A character that speaks a voiceover (SVG rig, mascot PNG, Three.js, Blender) | **Lip sync** (Rhubarb Lip Sync) | `lipsync.js`, `blender/lipsync.py`, `scripts/lipsync.sh` | ✅ tested |
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

## Lip sync

Rhubarb Lip Sync turns a voice track into mouth shapes over time. One cue file then drives any character. Install
Rhubarb once (one binary, see the header of `scripts/lipsync.sh`), then per VO line:

```bash
scripts/lipsync.sh audio/vo.wav audio/vo.visemes.json --dialog audio/vo.txt   # → vo.visemes.json + vo.visemes.js
```

Load the cues with `<script src="../audio/vo.visemes.js">` and `<script src="/engines/lipsync.js">`, then
`const cues = LipSync.cues("vo.visemes")`:

| Character | How |
|---|---|
| SVG rig | Draw `#mouth-A` … `#mouth-H` and `#mouth-X` (any subset), then `SvgRig(svg).lipsync(cues, { offset })` |
| Mascot that only exists as an image | `const m = LipSync.mountMouth(el, { cx, cy, w, aspect, shapes: LipSync.mouthSet({ ink, cover }) })`, then `LipSync.addToTimeline(Studio.tl, cues, m, { offset })` |
| Three.js | In `update(t)`: `LipSync.paramsAt(cues, t, "mouth", { offset })` gives `{ open, wide, round }` (0…1) for morph targets or scales |
| Blender | In the scene script: `import lipsync as L`, then `L.key_shape_keys(obj, L.load("…/vo.visemes.json"), ctx, offset=…)` keys shape keys `open`, `wide`, `round` on every frame |

- **Shapes** (Rhubarb's Preston Blair set): A closed (M B P) · B slightly open, teeth · C open · D wide open ·
  E rounded (O) · F puckered (OO, W) · G teeth on lip (F V) · H tongue up (L) · X rest. A rig can leave any of them
  out: `FALLBACK` in `lipsync.js` uses the nearest one drawn (G→A, H→C, X→A…), so a two-mouth rig
  (`#mouth-closed`, `#mouth-open`) works too. The engines demo draws A–F and lets G and H fall back.
- **`offset`** is where the line starts on the timeline (the same number as in `audio/cues.json`): cue times count
  from the start of the audio file. One cue file per VO line; lines must not overlap on one character.
- **Accuracy:** `--dialog` with the approved script makes the English recogniser much better. Other languages:
  `--phonetic` (less accurate).
- **Tables:** `TABLES.mouth` in `lipsync.js` and `blender/lipsync.py` must stay equal (`npm test` checks). Pass your
  own table for a rig with other controls.
- **Life around the mouth** (blinks, a nod on a stressed word, gestures) is still animated by hand.
  `LipSync.talking(cues, t, offset)` says when the character is speaking.
- **QA:** render stills at a few cue times and check each mouth against the cue file, then listen once with the mix.

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
