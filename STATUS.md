# STATUS

The memory of this repo. Read it first, update it last.

## Now

- Repo scaffolded 2026-11-02: core renderer (generalised from `../marketing-reels-skill/renderer`), engine
  adapters, skills, brand and production templates, engines demo.
- 2026-11-02: Bike Logger brand added (facts, look, voice, compliance, brand-check still).
- 2026-11-02: REEL-001 (Bike Logger kit reel) moved in and re-rendered; matches the original delivery. The original
  folder `../marketing-reels-skill/side-projects/bike-logger-kit/` is still there (untracked) and can be deleted.

- 2026-11-02: published as open source (MIT) at github.com/murathany7/reel-studio. README visuals live in
  `docs/media/` (GIFs and strips made from the exports with ffmpeg); full MP4s go on GitHub Releases, since `*.mp4` is gitignored.
- 2026-11-02: installable as a Claude Code plugin (`.claude-plugin/`, the repo is its own marketplace). The `setup`
  skill runs `scripts/init-project.sh`, which copies `core/`, `engines/`, `scripts/`, templates and the engines demo
  into the user's project (compositions load `/core/...` from the project root, so the kit must live there).
  The demo's Blender plate is now in git (38 KB) so a fresh setup can render it without Blender.

## Brands

| Brand | Folder | State | Open questions |
|---|---|---|---|
| Bike Logger | `brands/bike-logger/` | Ready; check card `check.html` renders with the site's fonts and colours | Price, kit contents and skill level for the kit? A voice for VO pieces? Copy Archivo + Plex Mono into `assets/fonts/` so renders work offline? |

## Productions

| ID | Brand | Title | Status | Export |
|---|---|---|---|---|
| REEL-001 | bike-logger | Robotics starter kit (silent, 28 s) | delivered | `productions/bike-logger/REEL-001-kit/export/REEL-001-kit-en.mp4` |

## Engines

| Engine | State | Notes |
|---|---|---|
| GSAP | ✅ | |
| SVG rig | ✅ | GSAP ignores CSS `transform-origin` on SVG; the rig sets pivots itself (`data-pivot` to override) |
| Lottie | ✅ ported | Not re-tested in this repo; first brand with a Lottie file should render a still to confirm |
| Pixi v8 | ✅ | `autoStart: false`, ticker stopped, drawn on seek |
| Three.js r170 | ✅ | `preserveDrawingBuffer: true`; WebGL needs the GPU flags in `core/render.mjs` (`CHROME_ARGS`) |
| Blender 5.2 | ✅ | Eevee. Backdrop must be camera-only or it flattens toon bands. 2 s at 540×960 ≈ 17 s |
| Page capture | ✅ | REEL-001's drive module reproduces the original capture (PSNR ≈41 dB on a 4 s test). Generic `capture.mjs` tested on a rAF test page: frame n = n/fps, two runs identical. Serve pages with HTTP Range support if they seek `<video>` (python's http.server does not) |
| Rive | 🔜 | Needs a `.riv` to build and test the adapter |

## Decisions

- 2026-11-02: one renderer, many engines on one clock, instead of one engine per style or a framework like
  Remotion (keeps plain HTML, no licence, keeps the existing QA). Revisit if rendering needs to run in parallel or in the cloud.
- 2026-11-02: productions are grouped by brand: `productions/<brand>/<ID>-<slug>/`.
- 2026-11-02: Bike Logger's audience is robotics kit learners; every piece sells learning by building, with the replay as the payoff.

## Next

- Parallel rendering (split frames across several Chrome pages) once pieces with Three.js or captures get long.
- Rive adapter when a `.riv` file exists.
- Decide whether Yuppo moves here as `brands/yuppo/` or stays in `../marketing-reels-skill`.

## Learnings

- **Missing video plate (2026-11-02):** a `<video>` whose file 404s fires `error` before the page script runs, so
  `Studio.video()` waited forever. It now checks `el.error` / `networkState` up front and fails the render with the
  plate's URL.
- **Chrome path:** `core/render.mjs`, `engines/capture.mjs` and `scripts/svg-to-png.sh` honour `CHROME_PATH`, then
  try the usual macOS and Linux install paths.
- **Video plate colours (2026-11-02):** with GPU compositing (default when GPU flags are on) or with
  playwright-core 1.64, Chrome draws `<video>` ~10 levels brighter than ffmpeg decodes it, so plates come out
  washed. Fix in `core/render.mjs`: `--disable-gpu-compositing` (WebGL still on the GPU) and playwright-core pinned
  to 1.49.1. Without any GPU flags, 1.49.1 has no WebGL at all. Check after any Chrome or Playwright update:
  render a plate frame and compare a pixel with `ffmpeg -vf select=eq(n\,N)`.
- **Soft captures (2026-11-02):** the Bike Logger site drops to 1.5x resolution when its first frames average over
  1/40 s, which virtual 1/30 s steps always do. REEL-001 v2 settles at 1/60 s and asserts full canvas resolution.
- Hard cuts show up as "jumps" in `qa-video.sh`; note them as intended in the QA report.
