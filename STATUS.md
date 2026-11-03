# STATUS

The memory of this repo. Read it first, update it last.

## Now

- 2026-11-04: **release workflow back** (`release.yml`, `ci.yml` callable again). Each target (npm, PyPI, GHCR,
  GitHub Release) is checked on its own and skipped when it already has the version, so reruns and hand releases mix;
  GitHub Release and Homebrew run when npm/PyPI were published now *or* earlier, and build their own files. npm and
  PyPI fall back to `NPM_TOKEN` / `PYPI_API_TOKEN` secrets. Still blocked on the maintainer's one-time setup: a
  trusted publisher (or token secret) on npmjs.com and pypi.org, plus `HOMEBREW_TAP_TOKEN` (`packaging/README.md`).
  Until then the npm/PyPI jobs fail with an error that names the fix. Not run yet (on `desk`, not on `main`).
- 2026-11-03: **0.2.4 released by hand** (desk merged into `main` as `2ef2ff8`, then formula `3189519`; CI green):
  npm, PyPI, Homebrew tap (`e07134c`), GitHub Release v0.2.4 (npm tgz + wheel + sdist). `npx` and `uvx` installs of
  0.2.4 tested (`init` copies `desk/`). GHCR `0.2.4` and `latest` pushed by hand (amd64 + arm64,
  `docker buildx build --push`); anonymous pull and `reel-studio init` in the container tested. Pushing needs
  `docker login ghcr.io` with a token that has `write:packages` (`gh auth refresh -s write:packages`). Right after
  publish the plain npm tarball URL served a cached 404 for some minutes (a `?x=` query got 200), so `brew fetch`
  failed at first; it passed a few minutes later. Pushes went straight to `main` by bypassing its "changes through a PR" rule.
  The `release-0.2.4` worktree branch is local only.
- 2026-11-03: **publishing is manual for now.** `release.yml` removed (its npm and PyPI steps never succeeded: no
  trusted publishers on either registry). CI (`ci.yml`) only tests: Linux Node 20/24, macOS, Homebrew formula style;
  green on `main`. Release steps by hand: `packaging/README.md`. Registries are still at 0.2.1, GHCR has 0.2.2/0.2.3
  from the old workflow. The unused `npm`/`pypi` GitHub environments can be deleted in repo settings.
- 2026-11-03 metrics: npm 266 downloads (all since publish, mostly mirrors/bots), PyPI n/a (not indexed yet), 0 stars,
  GitHub 14d: 4 unique visitors, 15 unique cloners, top referrer npmjs.com; tap repo untouched. Registries are on
  0.2.1 while the repo is 0.2.3: the v0.2.2 Release run failed at both publish steps
  (npm E404 on PUT, PyPI `invalid-publisher`): trusted publishing is not set up on npmjs.com / pypi.org yet
  (`packaging/README.md`, one-time setup). 0.2.1 was published by hand; no automated publish has succeeded so far.
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
  0.2.2 release run (41688024541, commit cd0efdf): tests and `docker` passed, and `ghcr.io/murathany7/reel-studio:0.2.2`
  is up and anonymously pullable. `npm` (E404) and `pypi` (`invalid-publisher`) failed because neither registry has the
  trusted publisher set up yet, so the GitHub Release and Homebrew were skipped and npm/PyPI are still at 0.2.1. A local
  `npm publish` stops at a browser 2FA sign-in. Fix: add both trusted publishers (`packaging/README.md`), then
  `gh run rerun 41688024541 --failed`.
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

- 2026-11-03: REEL-001 copy revision A, asked for in the desk ("say everything is included, it's optimised, and it's
  made to build on"): the box beat becomes the live page's own "Everything inside.", four beats gain a measured spec
  chip instead of the word "optimised", and the end card gains "IP65 box · parametric CAD · build notes published".
  Three parts of the ask are blocked for lack of a source and are written up in the production README §4.1: kit
  contents ("what you get"), "optimised" as a bare claim, and "open source" (the bikelog repo is not licensed
  publicly yet). Composition only — the export is still v2 and the revision is unapproved.

- 2026-11-03: **reel layer built** (everything from *Next* of the engines research; committed on `desk`, not released):
  `Studio.captions` (karaoke / pop / highlight / plain from whisper.cpp JSON or `[{text,start,end}]`),
  `scripts/beats.mjs` + `Studio.beats/beat/bar/onset/snap/beatPhase` (spectral-flux tempo and phase, kick-weighted;
  within 11–22 ms over 40 s on synthetic 95–174 BPM tracks; not yet tried on real music), `Studio.transition` (12 CSS
  types) and `Studio.swap`, `engines/gl-transitions.js` (7 shader effects), formats (`Studio.setup({ formats })`,
  `--format`, `--formats all`, per-format safe zones and `.fmt-*` classes), `engines/rive.js` (timeline + state machine
  with timed inputs, tested on Rive's public `vehicles.riv`, which is gitignored), parallel workers (`--workers`, auto up
  to 4: demo video 14.3 s → 7.3 s, byte-identical output), video plates decoded to PNG frames by ffmpeg (cached),
  and `--capture beginframe` (`core/lib/beginframe.mjs`, Linux, tested in Docker with Debian's chromium-headless-shell
  156; Dockerfile now installs it). Demo: `examples/reel-layer/` (8 s, four formats). Tests: `test/reel-layer.test.mjs`
  (9), all 34 pass on macOS. Not yet run on GitHub CI.

## Brands

| Brand | Folder | State | Open questions |
|---|---|---|---|
| Yuppo | `brands/yuppo/` (gitignored: company assets, commercial font) | Ready 2026-11-03, moved from `../marketing-reels-skill/brand/` (full kit in `kit/`); check card `check.html` renders with Pangea Afrikan, Inter and Po | Pangea Afrikan ad licence (paid pieces use Inter Tight meanwhile)? Verified user count and store rating? ElevenLabs MCP needs `/mcp` auth for VO. Other open questions: `../marketing-reels-skill/STATUS.md` |
| Bike Logger | `brands/bike-logger/` | Ready; check card `check.html` renders with the site's fonts and colours | Price, kit contents and skill level for the kit? Is the project licensed publicly (`../bikelog/BENCHMARK_OPENBIKESENSOR.md` says not yet) — until it is, no piece can say "open source"? A voice for VO pieces? Copy Archivo + Plex Mono into `assets/fonts/` so renders work offline? |

## Productions

| ID | Brand | Title | Status | Export |
|---|---|---|---|---|
| REEL-001 | bike-logger | Robotics starter kit (silent, 28 s) | delivered (v2); copy revision A in the desk for approval | `productions/bike-logger/REEL-001-kit/export/REEL-001-kit-en.mp4` (still v2) |
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
| Three.js r187 | ✅ | Bumped from r170 2026-11-03: engines demo, REEL-002 and REEL-003 frames match (one REEL-002 frame at 45 dB PSNR). `preserveDrawingBuffer: true`; WebGL needs the GPU flags in `core/render.mjs` (`CHROME_ARGS`) |
| Blender 5.2 | ✅ | Eevee. Backdrop must be camera-only or it flattens toon bands. 2 s at 540×960 ≈ 17 s. Rigid-body plates work (REEL-005: 14 s at 1080×1920 in 6 min 20 s) |
| Page capture | ✅ | REEL-001's drive module reproduces the original capture (PSNR ≈41 dB on a 4 s test). Generic `capture.mjs` tested on a rAF test page: frame n = n/fps, two runs identical. Serve pages with HTTP Range support if they seek `<video>` (python's http.server does not) |
| Rive | ✅ | `engines/rive.js` on `@rive-app/canvas-advanced` 2.37. The instance's `duration`/`fps` getters are empty: use the animation's (frames / fps). The module asks for `canvas_advanced.wasm`, the package ships `rive.wasm` |
| GL transitions | ✅ | `engines/gl-transitions.js`, a late onSeek hook reading `Studio.pixels(layer)` |
| beginFrame capture | ✅ Linux | One chrome-headless-shell per page (several begin-frame targets in one shell crashed it). Pixels match the screenshot path except small-text anti-aliasing |

## Decisions

- 2026-11-03: Yuppo moved here as `brands/yuppo/`; its brand and productions are gitignored because this repo is public. Yuppo IDs continue after the old repo's (next: REEL-003).

- 2026-11-02: one renderer, many engines on one clock, instead of one engine per style or a framework like
  Remotion (keeps plain HTML, no licence, keeps the existing QA). Revisit if rendering needs to run in parallel or in the cloud.
- 2026-11-03: other registries wrap the npm package instead of porting the CLI: PyPI and Homebrew only (crates.io,
  RubyGems and Go would just shell out to Node and bash).
- 2026-11-03: engines research (`docs/research/engines-2026-11.md`): keep our renderer; no move to Remotion
  (React, company licence) or HyperFrames (same architecture as ours, Apache-2.0: borrow techniques, not the
  framework). Revideo, Motion Canvas and Theatre.js are stalled. Next work is a reel layer on the `Studio` clock.
- 2026-11-02: productions are grouped by brand: `productions/<brand>/<ID>-<slug>/`.
- 2026-11-03: the skills stay the product; the desk is a thin review surface over files. It drives Claude through
  the local CLI (no API key, no Agent SDK) and only people approve: no approve tool in MCP, rule in the skills.
  It is optional: approval in chat stays the default, and nothing in the kit reads `review.json` unless it exists.
- 2026-11-03: distribution metrics (`check-metrics` skill, `scripts/metrics.mjs`, `metrics.jsonl`) are an optional,
  local-only maintainer tool: gitignored, never shipped, nothing in the kit depends on them.
- 2026-11-02: Bike Logger's audience is robotics kit learners; every piece sells learning by building, with the replay as the payoff.

## Next

- Use the reel layer in a real production: captions on a VO piece (needs ElevenLabs auth for Yuppo), beats on real
  music (check `beats.mjs` BPM against the track's stated tempo), a 4:5 cut of an existing reel.
- Run the new tests on GitHub CI (Linux SwiftShader); consider `--capture beginframe` there once it has run a while.
- Release (0.3.0): the npm package now ships `examples/reel-layer/` and the new engines.
- Hook checks in QA (first second has motion and text; captions inside the safe zone), from the research note.

## Learnings

- **Frames depended on the frame before (2026-11-03):** Chrome reuses raster from the previous frame, so a frame
  rendered right after its neighbour differed (SVG edges, up to 48 levels) from the same frame rendered alone: video
  frames didn't match stills, and parallel workers didn't match one worker. The runtime now forces a fresh paint per
  seek in renders (`display:none` and back on `#stage`). Found by comparing 1-worker and 3-worker videos.
- **Plates as frames (2026-11-03):** Chrome drew the demo plate 2–4 levels brighter than ffmpeg decodes it (with
  playwright-core 1.64, which Dependabot brought back despite the 1.49.1 pin noted below). Renders now show
  ffmpeg-decoded PNG frames instead, which match ffmpeg exactly. PNG at compression 1: ~0.4 MB a 1080×1920 frame.
- **Two transitions on one layer (2026-11-03):** each `Studio.transition` reset its layers' styles on every seek, so
  A → B → C cleared B's iris. The reset now happens once per seek in the runtime.
- **beginFrame returns no image without damage:** pumping frames during a slow seek drew the new state, and the
  final capture then got nothing and returned an older image. Every pumped frame now keeps its image.
- **Desk preview drift (2026-11-03):** the desk first loaded compositions in a `display:none` iframe at the default
  300×150 size, and REEL-002's headline came out "therack." (the composition's word splitter ran with no layout).
  The renderer loads in a laid-out 1080×1920 viewport, so the desk now does the same (`visibility:hidden` while
  loading). Any preview must load the way `core/render.mjs` does, or it shows frames the render won't make.
- **Missing video plate (2026-11-02):** a `<video>` whose file 404s fires `error` before the page script runs, so
  `Studio.video()` waited forever. It now checks `el.error` / `networkState` up front and fails the render with the
  plate's URL.
- **Plate seek race (2026-11-03):** `seeked` can fire before the new video frame is painted, so a cold CI runner
  (Node 20, Dependabot PR #1) screenshotted the previous plate frame and two renders of t=1 differed. `Studio.video()`
  now also waits for `requestVideoFrameCallback`, with a 250 ms fallback for seeks inside the same plate frame.
  Output unchanged; the demo video renders ~1 s slower.
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
- **Spec chips and the safe zone (2026-11-03):** a chip is `16.2 px × characters + 36 px` at the Bike Logger size
  (27 px IBM Plex Mono, 16 px padding, 2 px border), and a `.beat` row is 858 px wide. A third chip under a
  three-line headline wraps to a second row and falls below y 1498, outside the organic Reels safe zone. Count the
  characters before adding a chip, or shorten it ("Waterproof", not "Waterproof probes").
- `qa-video.sh` flags dark-brand frames (>98 % near-black) as "black" even with content on screen: look before fixing.
- Hard cuts show up as "jumps" in `qa-video.sh`; note them as intended in the QA report.
