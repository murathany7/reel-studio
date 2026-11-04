# Core renderer

Turns an HTML composition into a **frame-exact MP4** or **PNG**. For every frame it calls `window.__seek(t)`,
waits for every engine to draw, screenshots the stage in Chrome, and pipes the PNGs into ffmpeg.

Requirements: Node 18+, Google Chrome, ffmpeg. Run `npm install` in `core/` once. Blender (optional) for 3D plates,
Rhubarb Lip Sync (optional) for characters that speak.

## Commands (from the repo root)

```bash
# Video (size, fps, duration from Studio.setup), optional mixed audio track
node core/render.mjs video  productions/<brand>/<ID>/composition/index.html productions/<brand>/<ID>/export/<ID>.mp4 --audio <mix.wav>

# Every format the composition declares (Studio.setup({ formats })) → <ID>-9x16.mp4, <ID>-4x5.mp4 …; or one: --format 4x5
node core/render.mjs video  <composition.html> export/<ID>.mp4 --formats all

# Parallel pages (default: auto, up to 4). The output is the same for any N
node core/render.mjs video  <composition.html> <out.mp4> --workers 4

# Motion blur: average 8 subframes per frame in linear light, shutter open half the frame (180°).
# Fast pushes, whips and spins stop strobing. About 8× the render time; 16 for very fast moves; 1 turns it off.
# Or set it in the composition: Studio.setup({ …, motionBlur: true }) / motionBlur: { samples: 16, shutter: 0.5 }
node core/render.mjs video  <composition.html> <out.mp4> --motion-blur 8 [--shutter 0.5]

# Linux (CI, Docker): capture with HeadlessExperimental.beginFrame in chrome-headless-shell (or REEL_CAPTURE=beginframe)
node core/render.mjs video  <composition.html> <out.mp4> --capture beginframe

# One frame (post, cover, or a beat to check). --safe draws the Reels safe zones
node core/render.mjs still  <composition.html> <out.png> --t 2.4 [--safe]

# Many frames for review
node core/render.mjs stills <composition.html> <out_dir> --every 0.5
node core/render.mjs stills <composition.html> <out_dir> --at 0,0.4,1.2,3.0 --safe

# Audio: VO + music (auto-ducked) + SFX → one track at -14 LUFS
python3 scripts/mix_audio.py <audio/cues.json> <audio/mix.wav>

# Beat grid of the music, for Studio.beats: bpm, beats, downbeats, onsets
node scripts/beats.mjs <audio/music.mp3> <audio/beats.json> [--bpm 128]

# Lip sync: mouth shapes from a VO line (Rhubarb) → vo.visemes.json + vo.visemes.js (engines/README.md, Lip sync)
scripts/lipsync.sh <audio/vo.wav> <audio/vo.visemes.json> --dialog <audio/vo.txt>

# QA: specs, 30 fps CFR, loudness, hitches/jumps, frozen/black, black or empty first frame, flashes (> 3/s),
# safe-zone sheet
scripts/qa-video.sh <video.mp4> <qa_dir> [1080x1920] [30]

# Text QA on the composition: hook by 3 s, size, contrast against what is behind each glyph, text under the Reels UI
# → <qa_dir>/text.md, text.json, flagged/text_*.jpg. Exits 1 on a ❌. data-qa-skip opts decoration out
node core/render.mjs text-qa <composition.html> <qa_dir> [--every 0.25] [--format 4x5]
```

Preview live: serve the repo root (`python3 -m http.server 8080`) and open the composition.
Add `?t=2.5` to freeze a frame, `?safe=1` for the safe-zone overlay, `?format=4x5` for another format.

Video plates (`Studio.video`) are decoded to PNG frames with ffmpeg the first time a render needs them and cached
in `$REEL_PLATE_CACHE` (default `<tmp>/reel-studio-plates`, about 0.4 MB a frame at 1080×1920). Delete it any time.
In a render every frame is painted from scratch, so a frame is the same whether it is rendered alone, in a video or
by another worker.

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

Engines (Three.js, Pixi, SVG rig, Lottie, plates, lip sync): see `engines/README.md` and the working example in
`examples/engines-demo/index.html`.

| Runtime API | |
|---|---|
| `Studio.setup({ width, height, fps, duration })` | Size the stage; returns the paused GSAP timeline `Studio.tl` |
| `Studio.onSeek(fn)` | `fn(t)` draws a layer at time `t` (may return a promise) |
| `Studio.wait(promise)` | Hold frame 0 until it settles |
| `Studio.random(seed)` | Seeded random number generator |
| `Studio.lottie(el, path, { start, loop, speed })` | Lottie layer |
| `Studio.video(el, { start })` | Pre-rendered plate (Blender, capture, footage) |
| `Studio.onSeek(fn, { late: true })` | Run after every other layer has drawn (reads their pixels) |
| `Studio.setup({ …, motionBlur: true })` | Motion blur in every render of this piece (`{ samples = 8, shutter = 0.5 }`); `--motion-blur` / `--shutter` override it. Stills get it too, so QA frames match the video |
| `Studio.setup({ …, formats: ["4x5", "1x1", "16x9"] })` | Other formats this layout supports; `<html>` gets `fmt-<name>` |
| `Studio.format`, `Studio.pick({ "16x9": a, default: b })` | The format being rendered; a value per format |
| `Studio.captions(el, words, { style, offset, maxChars, lines, gap, upper })` | Word-by-word captions from `[{ text, start, end }]` or whisper.cpp JSON (`scripts/transcribe.sh`). Styles: `karaoke`, `pop`, `highlight`, `plain`. Tokens: `--caption-size`, `--caption-ink`, `--caption-accent`, `--caption-stroke`, `--caption-font` |
| `await Studio.beats(src, { offset })` | Load a beat grid (`scripts/beats.mjs`, or `{ bpm, offset }`) |
| `Studio.beat(n)`, `Studio.bar(n)`, `Studio.onset(n)`, `Studio.snap(t)`, `Studio.beatPhase(t)` | Times of beats, downbeats and hits; the nearest beat; 0→1 between beats (for pulses) |
| `Studio.transition(from, to, { at, duration, type, ease })` | `fade`, `wipe-left/right/up/down`, `iris`, `diamond`, `blinds`, `push-*`, `slide-*`, `zoom`, `whip-left/right`, `flash`. Owns both layers' visibility, and their clip-path, transform, filter and opacity while it runs |
| `Studio.swap(from, to, at)` | A hard cut: `from` until `at`, `to` after |
| `Studio.pixels(el)` | The canvas, img or video to read a layer's pixels from |
