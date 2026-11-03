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
- 2026-11-02: `docs/media/bike-logger-reel.gif`, `bike-logger-strip.jpg` and `qa-contact-sheet.jpg` regenerated
  from the sharp REEL-001 v2. GIF: whole reel at 1.4x speed, 8 fps, 240 px, 128 colours, no dither (4.3 MB).
  Strip: 6 beats (2.4, 5.8, 9.8, 13.6, 17.4, 23.4 s), 270×480 tiles, 8 px #131313 gaps.
- 2026-11-02: installable as a Claude Code plugin (`.claude-plugin/`, the repo is its own marketplace). The `setup`
  skill runs `scripts/init-project.sh`, which copies `core/`, `engines/`, `scripts/`, templates and the engines demo
  into the user's project (compositions load `/core/...` from the project root, so the kit must live there).
  The demo's Blender plate is now in git (38 KB) so a fresh setup can render it without Blender.
- 2026-11-02: npm package `reel-studio` (root `package.json`, `bin/reel-studio.mjs`): `npx reel-studio init` runs
  `init-project.sh --with-skills`, which also copies the skills into `.claude/skills/`. Keep `version` equal in
  `package.json` and `.claude-plugin/plugin.json`.
- 2026-11-03: npm 0.2.0 had 266 downloads on publish day (mostly mirrors and bots), 15 unique repo cloners.
  Version 0.2.1 (scene-3d skill notes) published 2026-11-03 on npm, PyPI and the Homebrew tap
  (github.com/murathany7/homebrew-reel-studio); each install tested. Descriptions on the registries still carry the
  old wording until 0.2.2 ("agency-quality reels, no per-video fees" positioning is in the repo). Keywords in
  `package.json` and `python/pyproject.toml` now cover the GitHub topics (20, GitHub's cap); they reach the
  registries with 0.2.2. PyPI wheel
  (`python/`, built by `packaging/build-python.sh`) bundles the `npm pack` files; Homebrew formula
  (`packaging/homebrew/reel-studio.rb`) installs the npm tarball and needs tap repo `murathany7/homebrew-reel-studio`.
  Both tested locally (`reel-studio init` + a still render; `brew test` and `brew audit --strict` pass). Release steps:
  `packaging/README.md`.
- 2026-11-03: CI (`.github/workflows/ci.yml`) runs `npm test` + `npm run test:python` on Linux (Node 20, 24) and macOS
  for every push and PR: syntax, manifests, npm package contents, `init`, render determinism (md5 of the engines demo
  at 1, 3, 4.6 s), a full video through `qa-video.sh`. Release (`release.yml`) publishes when `package.json`'s version
  is not on npm: `packaging/bump.sh <v>` + push. Needs one-time trusted-publisher setup on npm and PyPI and a
  `HOMEBREW_TAP_TOKEN` secret (`packaging/README.md`). `core/render.mjs` uses SwiftShader for WebGL off macOS.
- 2026-11-03: Docker image (`Dockerfile`: Node 22, Chromium, ffmpeg, Noto/DejaVu fonts, the kit from `npm pack`).
  Tested locally: `reel-studio init`, md5-stable stills, the engines demo video. `release.yml` job `docker` pushes
  `ghcr.io/murathany7/reel-studio:<v>` and `:latest` (amd64 + arm64); after its first push, set the GHCR package to
  public once (GitHub → Packages → reel-studio → Package settings).
- 2026-11-03: distribution to do by hand (the maintainer, not an agent): Claude plugin directory at
  claude.ai/directory/manage (submit any time); awesome-claude-code via its web issue form only, from 2026-11-16 (repo
  must be 14 days old, human-submitted); Show HN, Reddit, Product Hunt, one reel a week on short-video platforms.

## Brands

| Brand | Folder | State | Open questions |
|---|---|---|---|
| Yuppo | `brands/yuppo/` (gitignored: company assets, commercial font) | Ready 2026-11-03, moved from `../marketing-reels-skill/brand/` (full kit in `kit/`); check card `check.html` renders with Pangea Afrikan, Inter and Po | Pangea Afrikan ad licence (paid pieces use Inter Tight meanwhile)? Verified user count and store rating? ElevenLabs MCP needs `/mcp` auth for VO. Other open questions: `../marketing-reels-skill/STATUS.md` |
| Bike Logger | `brands/bike-logger/` | Ready; check card `check.html` renders with the site's fonts and colours | Price, kit contents and skill level for the kit? A voice for VO pieces? Copy Archivo + Plex Mono into `assets/fonts/` so renders work offline? |

## Productions

| ID | Brand | Title | Status | Export |
|---|---|---|---|---|
| REEL-001 | bike-logger | Robotics starter kit (silent, 28 s) | delivered | `productions/bike-logger/REEL-001-kit/export/REEL-001-kit-en.mp4` |
| REEL-003 | yuppo | One wake-up time, the whole day planned (Three.js day dial + GSAP, silent, 15 s) | QA passed, silent cut (VO + music pending ElevenLabs auth) | `productions/yuppo/REEL-003-one-wake-up/export/REEL-003-one-wake-up-en.mp4` |
| REEL-004 | yuppo | 3 a.m. question? Ask Po (Pixi night sky + Lottie Po + GSAP, silent, 16 s) | QA passed, silent cut (VO + music pending) | `productions/yuppo/REEL-004-ask-po-3am/export/REEL-004-ask-po-3am-en.mp4` |
| REEL-005 | yuppo | What Star parents get, 7-day trial ad (Blender physics plate + GSAP, silent, 14 s) | QA passed, silent cut (music + SFX pending) | `productions/yuppo/REEL-005-star-trial/export/REEL-005-star-trial-en.mp4` |
| REEL-002 | bike-logger | Engines sampler: Three.js tray, Blender camera housing, Pixi sensor streams (silent, 14.8 s) | QA passed, draft for review | `productions/bike-logger/REEL-002-engines/export/REEL-002-engines-en.mp4` |

## Engines

| Engine | State | Notes |
|---|---|---|
| GSAP | ✅ | |
| SVG rig | ✅ | GSAP ignores CSS `transform-origin` on SVG; the rig sets pivots itself (`data-pivot` to override) |
| Lottie | ✅ | Tested 2026-11-03 with Yuppo's Po files (REEL-004): seeks frame-exactly, md5-stable. Load `/core/node_modules/lottie-web/build/player/lottie.min.js` before the runtime |
| Pixi v8 | ✅ | `autoStart: false`, ticker stopped, drawn on seek |
| Three.js r170 | ✅ | `preserveDrawingBuffer: true`; WebGL needs the GPU flags in `core/render.mjs` (`CHROME_ARGS`) |
| Blender 5.2 | ✅ | Eevee. Backdrop must be camera-only or it flattens toon bands. 2 s at 540×960 ≈ 17 s. Rigid-body plates work (REEL-005: 14 s at 1080×1920 in 6 min 20 s) |
| Page capture | ✅ | REEL-001's drive module reproduces the original capture (PSNR ≈41 dB on a 4 s test). Generic `capture.mjs` tested on a rAF test page: frame n = n/fps, two runs identical. Serve pages with HTTP Range support if they seek `<video>` (python's http.server does not) |
| Rive | 🔜 | Needs a `.riv` to build and test the adapter |

## Decisions

- 2026-11-03: Yuppo moved here as `brands/yuppo/`; its brand and productions are gitignored because this repo is public. Yuppo IDs continue after the old repo's (next: REEL-003).

- 2026-11-02: one renderer, many engines on one clock, instead of one engine per style or a framework like
  Remotion (keeps plain HTML, no licence, keeps the existing QA). Revisit if rendering needs to run in parallel or in the cloud.
- 2026-11-03: other registries wrap the npm package instead of porting the CLI: PyPI and Homebrew only (crates.io,
  RubyGems and Go would just shell out to Node and bash).
- 2026-11-02: productions are grouped by brand: `productions/<brand>/<ID>-<slug>/`.
- 2026-11-02: Bike Logger's audience is robotics kit learners; every piece sells learning by building, with the replay as the payoff.

## Next

- Parallel rendering (split frames across several Chrome pages) once pieces with Three.js or captures get long.
- Rive adapter when a `.riv` file exists.

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
- **HTML labels on 3D (2026-11-02):** Three.js refreshes world matrices only inside `render()`. Before projecting
  a point to place a tag, call `camera.updateMatrixWorld()` and the object's parent `updateMatrixWorld()`, or the
  tag follows the previously rendered frame.
- **Blender rigid bodies in background (2026-11-03):** `bpy.ops.ptcache.bake_all()` ends a `-b` run silently (no
  render, no error), and a plain animation render left every body at rest. Step the scene with `scene.frame_set(f)`
  for every frame at the end of `build()`; the render then reads the filled cache. Delay a body's drop by keyframing
  `rigid_body.kinematic` True → False at its release frame.
- **Blender plate on a flat brand colour (2026-11-03):** a lit floor never matches the page colour and its horizon
  shows as a band. Tilt the camera so no horizon is in frame, key with a sun (no falloff), and make the floor an
  emission of the brand colour multiplied by a ramp on `ShaderToRGB` of a diffuse, so only shadows darken it.
- **Check every Lottie before using it (2026-11-03):** Yuppo's `success.json` Po frowns; brand rules forbid a sad Po.
  Render a grid of a brand's Lotties at a few times before picking one.
- **zsh does not word-split `$var`:** `set -- $x` in a loop passes one argument, so paths break with
  `window.__meta is not a function` (the page 404'd). Use a function with explicit arguments.
- `qa-video.sh` flags dark-brand frames (>98 % near-black) as "black" even with content on screen: look before fixing.
- Hard cuts show up as "jumps" in `qa-video.sh`; note them as intended in the QA report.
