# Core renderer

Turns an HTML composition into a **frame-exact MP4** or **PNG**. For every frame it calls `window.__seek(t)`,
waits for every engine to draw, screenshots the stage in Chrome, and pipes the PNGs into ffmpeg.

Requirements: Node 18+, Google Chrome, ffmpeg. Run `npm install` in `core/` once. Blender (optional) for 3D plates.

## Commands (from the repo root)

```bash
# Video (size, fps, duration from Studio.setup), optional mixed audio track
node core/render.mjs video  productions/<brand>/<ID>/composition/index.html productions/<brand>/<ID>/export/<ID>.mp4 --audio <mix.wav>

# One frame (post, cover, or a beat to check). --safe draws the Reels safe zones
node core/render.mjs still  <composition.html> <out.png> --t 2.4 [--safe]

# Many frames for review
node core/render.mjs stills <composition.html> <out_dir> --every 0.5
node core/render.mjs stills <composition.html> <out_dir> --at 0,0.4,1.2,3.0 --safe

# Audio: VO + music (auto-ducked) + SFX → one track at -14 LUFS
python3 scripts/mix_audio.py <audio/cues.json> <audio/mix.wav>

# Variants: one composition, a matrix of query params (?style=adult&pattern=pas) → many MP4s, in parallel
node scripts/variants.mjs productions/<brand>/<ID>/variants.json [--dry | --check] [--jobs 4] [--qa]

# QA: specs, 30 fps CFR, loudness, hitches/jumps, frozen/black, safe-zone sheet
scripts/qa-video.sh <video.mp4> <qa_dir> [1080x1920] [30]
```

Preview live: serve the repo root (`python3 -m http.server 8080`) and open the composition.
Add `?t=2.5` to freeze a frame, `?safe=1` for the safe-zone overlay.

## Writing a composition

```html
<link rel="stylesheet" href="/core/lib/base.css">
<link rel="stylesheet" href="/brands/<brand>/tokens.css">
<div id="stage">
  <div class="layer" id="bg"></div>          <!-- one layer per engine -->
  <div class="safe"> … text … </div>
</div>
<script src="/core/node_modules/gsap/dist/gsap.min.js"></script>
<script src="/core/lib/runtime.js"></script>
<script>
  const tl = Studio.setup({ width: 1080, height: 1920, fps: 30, duration: 12 });
  tl.from(".hook", { y: 60, opacity: 0, duration: 0.5, ease: "back.out(2)" }, 0.1);
</script>
```

Engines (Three.js, Pixi, SVG rig, Lottie, plates): see `engines/README.md` and the working example in
`examples/engines-demo/index.html`.

| Runtime API | |
|---|---|
| `Studio.setup({ width, height, fps, duration })` | Size the stage; returns the paused GSAP timeline `Studio.tl` |
| `Studio.onSeek(fn)` | `fn(t)` draws a layer at time `t` (may return a promise) |
| `Studio.wait(promise)` | Hold frame 0 until it settles |
| `Studio.random(seed)` | Seeded random number generator |
| `Studio.lottie(el, path, { start, loop, speed })` | Lottie layer |
| `Studio.video(el, { start })` | Pre-rendered plate (Blender, capture, footage) |
