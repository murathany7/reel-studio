# STATUS

The memory of this repo. Read it first, update it last.

## Now

- 2026-11-04: **lip sync** ported from `../marketing-reels-skill` (Rhubarb Lip Sync 1.14.0): `scripts/lipsync.sh`
  (cues + a `.js` twin), `engines/lipsync.js` (cues, `paramsAt`, `mountMouth` + `addToTimeline` for a mascot PNG),
  `SvgRig.lipsync()` (draw `#mouth-A`…`#mouth-X`, missing shapes fall back to the nearest drawn one), and
  `engines/blender/lipsync.py` (`key_shape_keys`; `run.py` now puts `engines/blender/` and the scene's folder on
  `sys.path`). Made brand-neutral: Yuppo's Po mouth set is `LipSync.mouthSet({ ink, cover, tongue })` (byte-identical
  to Po's with Po's colours, see Brands), and the Yuppo parent/baby tables gave way to one generic `mouth` table
  (`open`, `wide`, `round`). The engines demo's character lip-syncs "Bob loves a big wave!" at 4.9 s (cues from a
  macOS voice; the demo stays silent). Tested: `npm test` (new `test/lipsync.test.mjs`: lookups, JS = Python tables
  and values, the script end to end when Rhubarb is installed; md5 at the demo's 5.25 s), stills of every mouth in
  the demo, a mascot-PNG overlay, and Blender shape keys (keyed values = `params_at` on all 45 frames). CI has no
  Rhubarb, so the script's end-to-end test skips there. Not in the Docker image. Not released yet.
- 2026-11-04: **SVG rig blink fixed:** `transformBox: "fill-box"` on top of GSAP's own SVG origin moved the eyes far
  down on every blink (below the mouth in the demo since its first version). Body squash still anchors at the feet.
- 2026-11-04: **release workflow back** (`release.yml`, `ci.yml` callable again). Each target (npm, PyPI, GHCR,
  GitHub Release) is checked on its own and skipped when it already has the version, so reruns and hand releases mix;
  GitHub Release and Homebrew run when npm/PyPI were published now *or* earlier, and build their own files. npm and
  PyPI fall back to `NPM_TOKEN` / `PYPI_API_TOKEN` secrets. **0.2.5 is the first automated release** (run
  41737408861): npm (with provenance), PyPI and GHCR published from the workflow, so both trusted publishers are
  validated. Gotchas on the way: PyPI's publisher had the form's placeholder `workflow.yml` instead of `release.yml`;
  npm's trusted publisher only allows `npm stage publish` until "Allow npm publish" is ticked (else 403 "OIDC
  permission denied"). The GitHub Release step failed (`npm pack` into a missing `dist/`, fixed). `HOMEBREW_TAP_TOKEN`
  not set, so the tap needs `packaging/update-formula.sh` by hand.
- 2026-11-04: **plate seek flake fixed** (CI run 41737408876, Ubuntu, Node 24: two different Blender plate frames at
  t=1). Cause: headless Chrome reports the *old* frame once through `requestVideoFrameCallback` right after a fresh
  page's first seek, then never calls back again. `Studio.video()` took that as "new frame painted". It now only
  accepts a frame that can be the target's; otherwise the 250 ms fallback (which every later seek always used). Demo
  stills byte-identical to before; render tests pass on macOS.
- 2026-11-03: **publishing is manual for now.** `release.yml` removed (its npm and PyPI steps never succeeded: no
  trusted publishers on either registry). CI (`ci.yml`) only tests: Linux Node 20/24, macOS, Homebrew formula style;
  green on `main`. Release steps by hand: `packaging/README.md`. Registries are still at 0.2.1, GHCR has 0.2.2/0.2.3
  from the old workflow. The unused `npm`/`pypi` GitHub environments can be deleted in repo settings.
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
- 2026-11-03: 0.2.3: PyPI page (`python/README.md`) rebuilt as a marketing page like npm's, Bike Logger only. PyPI
  can't resolve relative paths, so every image and link there is an absolute `raw.githubusercontent.com/.../main/` URL
  (images follow `main`). Checked with `readme-renderer`, the library PyPI uses (all images and centring survive).
- 2026-11-03: distribution to do by hand (the maintainer, not an agent): Claude plugin directory at
  claude.ai/directory/manage (submit any time); awesome-claude-code via its web issue form only, from 2026-11-16 (repo
  must be 14 days old, human-submitted); Show HN, Reddit, Product Hunt, one reel a week on short-video platforms.
- 2026-11-03: **desk** (`desk/`, not released yet): an **optional** local review app (the chat flow is unchanged), `node desk/server.mjs` or `npx reel-studio desk` →
  http://127.0.0.1:4100. A frame-exact player driven by `__seek`, notes pinned to frames (`review.json` per
  production, tracked), still / preview / QA renders into `qa/desk/` (gitignored), the storyboard README, and approve
  buttons (storyboard ticks the README box; final cut adds a line). "Send to Claude" runs `claude -p` with the
  person's Claude Code login (`ANTHROPIC_API_KEY` stripped, tools limited, one `--resume` session per production).
  `desk/mcp.mjs` is the optional `reel-desk` MCP server, not registered by default (`init` doesn't touch `.mcp.json`;
  add it with `claude mcp add reel-desk --scope project -- node desk/mcp.mjs`) with `desk_state`, `list_notes`, `add_note`, `resolve_note`, `render_frame` and no approval tool. Skill: `review-desk`.
  Tested: `test/desk.test.mjs`, the page in the browser pane on REEL-002, and one real `claude -p` run that
  resolved a note through the MCP server (7 s). Not tested yet: on Linux/Docker, or a Claude run that edits a composition.

## Brands

| Brand | Folder | State | Open questions |
|---|---|---|---|
| Yuppo | `brands/yuppo/` (gitignored: company assets, commercial font) | Ready 2026-11-03, moved from `../marketing-reels-skill/brand/` (full kit in `kit/`); check card `check.html` renders with Pangea Afrikan, Inter and Po | Pangea Afrikan ad licence (paid pieces use Inter Tight meanwhile)? Verified user count and store rating? ElevenLabs MCP needs `/mcp` auth for VO. Talking Po (REEL-006's provisional mouth, awaiting design sign-off): `LipSync.mountMouth(el, { cx: 0.512, cy: 0.502, w: 0.15, aspect: 893 / 1000, shapes: LipSync.mouthSet({ ink: "#272727", cover: "#FF8133", tongue: "#F6A28E" }) })` over `po-baby.png`; copy into the brand README's *Mascot* when the folder is here. Other open questions: `../marketing-reels-skill/STATUS.md` |
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
| Lip sync (Rhubarb) | ✅ | Rhubarb 1.14.0 in `~/.cache/rhubarb-lip-sync/`; the macOS build is x86_64 (Rosetta). ~4 s per short line. Tested 2026-11-04 on the SVG rig (demo), a mascot PNG and Blender shape keys; Three.js uses the same `paramsAt` numbers (no Three.js mouth rig built yet). English recogniser; `--phonetic` for other languages (untested) |
| Rive | 🔜 | Needs a `.riv` to build and test the adapter |

## Decisions

- 2026-11-03: Yuppo moved here as `brands/yuppo/`; its brand and productions are gitignored because this repo is public. Yuppo IDs continue after the old repo's (next: REEL-003).

- 2026-11-02: one renderer, many engines on one clock, instead of one engine per style or a framework like
  Remotion (keeps plain HTML, no licence, keeps the existing QA). Revisit if rendering needs to run in parallel or in the cloud.
- 2026-11-03: other registries wrap the npm package instead of porting the CLI: PyPI and Homebrew only (crates.io,
  RubyGems and Go would just shell out to Node and bash).
- 2026-11-02: productions are grouped by brand: `productions/<brand>/<ID>-<slug>/`.
- 2026-11-03: the skills stay the product; the desk is a thin review surface over files. It drives Claude through
  the local CLI (no API key, no Agent SDK) and only people approve: no approve tool in MCP, rule in the skills.
  It is optional: approval in chat stays the default, and nothing in the kit reads `review.json` unless it exists.
- 2026-11-03: distribution metrics (`check-metrics` skill, `scripts/metrics.mjs`, `metrics.jsonl`) are an optional,
  local-only maintainer tool: gitignored, never shipped, nothing in the kit depends on them.
- 2026-11-02: Bike Logger's audience is robotics kit learners; every piece sells learning by building, with the replay as the payoff.

## Next

- Parallel rendering (split frames across several Chrome pages) once pieces with Three.js or captures get long.
- Rive adapter when a `.riv` file exists.

## Learnings

- **GSAP and CSS `transform-box` on SVG (2026-11-04):** GSAP already resolves `transformOrigin` percentages on SVG
  from the bounding box. Adding `transformBox: "fill-box"` applies the origin twice, so a `scaleY` blink slid the
  eyes down by half the face. Set `transformOrigin` alone.
- **`__pycache__` in the kit (2026-11-04):** importing `engines/blender/lipsync.py` (tests, Blender) writes
  `engines/blender/__pycache__/`, which `npm pack` would publish. `package.json` `files` now excludes `**/__pycache__`.
- **Desk preview drift (2026-11-03):** the desk first loaded compositions in a `display:none` iframe at the default
  300×150 size, and REEL-002's headline came out "therack." (the composition's word splitter ran with no layout).
  The renderer loads in a laid-out 1080×1920 viewport, so the desk now does the same (`visibility:hidden` while
  loading). Any preview must load the way `core/render.mjs` does, or it shows frames the render won't make.
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
- **`requestVideoFrameCallback` lies in headless renders (2026-11-04):** after a seek on a paused plate it fires at
  most once, with the frame from *before* the seek (`mediaTime` 0 for a seek to 1 s), and never again. Check
  `mediaTime` before trusting it; the 250 ms fallback is what actually waits for paint.
- **Plate seek race (2026-11-03):** `seeked` can fire before the new video frame is painted, so a cold CI runner
  (Node 20, Dependabot PR #1) screenshotted the previous plate frame and two renders of t=1 differed. `Studio.video()`
  now also waits for `requestVideoFrameCallback`, with a 250 ms fallback for seeks inside the same plate frame.
  Output unchanged; the demo video renders ~1 s slower.
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
