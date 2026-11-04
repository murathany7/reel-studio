# STATUS

The memory of this repo. Read it first, update it last.

## Now

- 2026-11-04: **0.2.7 released** (bump on `main` → Release workflow): ships the marketer-first skills
  (`make-video`, `new-brand`, `setup`), `scripts/voice.py` (free local AI voice), the `render.mjs` 12M bitrate cap and
  the desk's `launch.json` entry from `init-project.sh`. Tests pass locally (the `init` test needs `rsync` installed).
- 2026-11-04: **no videos in the repo.** README GIFs removed (MP4s live on GitHub Releases; the README links there and
  keeps its still strips); production renders, covers, stills, contact sheets and QA CSV/logs are untracked and
  ignored (`productions/**/export/`, `productions/**/qa/**/*.{jpg,png,csv,log}`), so a production in git is its
  sources and written reports only; `*.gif`, `*.wav`, `*.mp3` and other audio are ignored everywhere. Kept: the two
  tiny inputs the examples need (`examples/engines-demo/plates/blob.mp4` 40 KB, `examples/reel-layer/audio/music.mp3`
  128 KB). History holds only 4.4 MB of media in total (these four files), so nothing was rewritten. The unmerged
  `bike-logger-*` render branches carry covers and QA images, not videos (their MP4s went to the gallery artifact).
- 2026-11-04: **marketers first, and what makes reels work.** Research (Mosseri's ranking signals: watch time,
  likes and **sends** per reach; Emplifi's 10k brand Reels: speech in the first 3 s ≈ +25% 10 s retention, a face ≈
  +10%, text overlays modest; editors: a change every 0.5–1.5 s, loops; Instagram re-encodes to ≈3.5 Mbit/s; originals
  only) is now `make-video`'s *What makes a reel work* (10 rules) and a *Hit check* row in the production template.
  The skills talk like a producer to marketers: `AGENTS.md` *Who you're talking to*; `make-video` *How to talk* and
  a conversation (what and who → 2–3 ideas that pass "would someone send this?" → voice and face → look as pictures →
  script → yes); `new-brand` reads the site first, plays it back, asks only what's missing; `setup` hands over in
  one plain line. `looks/README.md`: a starter is a sketch, not a template; texture light. New `scripts/voice.py`:
  free local AI voice (Kokoro 1.0 int8, Apache 2.0, weights from GitHub releases → `~/.cache/reel-studio/kokoro`),
  lines placed at their start times, word times for `Studio.captions`, warns when a line overruns. **REEL-014** (test):
  REEL-008's visuals with voice from 0.05 s, captions as the headline, a cut every second, 120 BPM, light texture.
- 2026-11-04: **why REEL-009–013 looked bad** (made off-repo, not on any branch, so judged from the starters
  they came from). (1) File size: the encoder was CRF 16 with no cap, and `LookFx.grain` redraws full-frame noise
  every frame, so grain looks exploded: retro-film's 5 s starter = 62 Mbit/s, 100 MB (REEL-012 74 MB, REEL-009 65 MB,
  REEL-011 45 MB), and Instagram then recompresses that to mush. Flat looks (kinetic 0.36 Mbit/s, toon) stayed tiny.
  Fix: `render.mjs` now caps x264 at `-maxrate 12M -bufsize 24M` (first 16M, lowered after REEL-014 hit it) (`REEL_MAXRATE`/`REEL_BUFSIZE` to change); the
  same retro-film clip is 11.7 Mbit/s, 19 MB, and looks the same at full crop. Clean pieces are unaffected (far under
  the cap). (2) Content: the starters are 5 s placeholders (mostly empty frames, small type, words clipped: "you"
  in editorial, "THE" in kinetic-type, a placeholder cube in toon-3d), and the looks README says to copy a starter
  and "replace the copy". Stretched to 15 s with no real product, that reads as a template, and 4 of the 7 starters
  are GSAP + DOM, so the pieces all felt like one engine. REEL-008 (good) had the real tray CAD as its hero.
  Lesson: a look is a treatment, not a layout; the real product (CAD, capture, photo) stays the hero.
- 2026-11-04: **the desk opens from the chat**, for people who aren't technical. `init-project.sh` adds a `desk`
  entry to the project's `.claude/launch.json` (merged into an existing one, never duplicated); `review-desk` opens
  it with `preview_start` in the Claude desktop app's browser pane (elsewhere it starts the server and gives the link)
  instead of handing over a command; `make-video` offers it once, at the first storyboard in a project. Tested on
  scratch projects (fresh, second run, existing `launch.json`) and the copied desk serves them. Not tried yet: "open
  the desk" in the app on a fresh project, or a clean-machine plugin install. Merged `main` (lip sync, 0.2.5) into
  `desk`; `make-video`'s lip-sync lines moved to `.agents/skills/`.
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
- 2026-11-04: **QA checks from the benchmark** (video-director's ideas, our thresholds).
  `qa-video.sh` now fails a black/empty first frame and more than 3 flashes a second (WCAG 2.3.1, per quadrant,
  `scripts/qa_frames.py`). New `node core/render.mjs text-qa <comp> <qa_dir>` (`core/lib/qa-text.mjs`): every
  0.25 s, each visible DOM text block gets its size (median over time, transforms included), contrast (two
  screenshots, with and without text: glyph pixels vs exactly what is behind them, so strokes and shadows count),
  Reels UI zones (9:16), and the 3 s hook; problems lasting ≥ 0.5 s fail, shorter ones warn; exits 1 on a ❌;
  `data-qa-skip` for decoration. First runs: REEL-001 has 19 spec chips at 27 px (❌ under 28) and its headlines in the
  paid-only zone (REEL-001 not changed). Zones are tested on the glyphs' own pixels, not the font's line box (which
  reaches above the letters and flagged headlines set exactly on the safe line). Canvas text (Pixi, Three, Rive) is
  not measured.
- 2026-11-04: **REEL-003 QA pass 2** (yuppo): fixed what the new checks found and re-rendered video and cover: hook
  on screen from frame 0 (frame 0 was blank), label greys #8F8F8F → #5C5C5C and 24–28 → 30–34 px, "Up 06:45" ink on
  orange, hour labels inside the ring, tags clamped off the side rails, last headline 84 px. Text QA has no ❌ (11 small
  labels warn), video QA ✅. Approved in chat ("Approve"): delivered again, silent cut.
- 2026-11-04: **motion blur** in the renderer (idea from product-launch-motion, after a benchmark of similar tools):
  `--motion-blur N [--shutter 0.5]` or `Studio.setup({ motionBlur: true | { samples, shutter } })`. Each frame is
  N screenshots at t … t + shutter/fps, averaged in linear light by `core/lib/blend.mjs` (own PNG decode/encode,
  no dependency; matches ffmpeg's decode of Chrome PNGs byte for byte), one worker thread per render page.
  Deterministic (same md5 twice). Costs about N× render time (reel-layer 8 s: 7.8 s sharp, 59 s at 8 samples;
  blending on the main thread had made it 107 s). 8 samples still shows steps on the fastest pushes (≈200 px/frame); 16 is smoother. Tests:
  `test/blend.test.mjs`, a blur case in `test/render.test.mjs`. Not yet turned on in any production.
- 2026-11-04: **REEL-008** (bike-logger, neon-noir) approved in chat ("Approve, own music"), produced, QA passed in 9:16 and
  4:5, final cut approved ("Approve final cut"): delivered. Not posted yet. Style frames: the real tray CAD as
  neon edges over dark faces works well; amber neon on headlines softens the glyphs, so the glow stays light (`spread` ≈ 0.2).
- 2026-11-04: **looks: one brand, many art directions** (committed on `desk`). Every piece so far copied the previous
  one's layout (Bike Logger: eyebrow + wide headline + chips + glow, `power3.out`; Yuppo: cream pills, `back.out`),
  because the kit only had brand tokens and "copy the engines demo". Now `looks/` holds 7 art directions, each with a
  README (palette mapping, type, layout, motion, texture, engines, sound, avoid), `look.css` (brand tokens fill its
  roles) and a working 5 s `starter.html`: neon-noir (cyberpunk), toon-3d, photoreal, editorial, kinetic-type,
  retro-film, paper-collage. `looks/fx.js`: seeded grain, scanlines, vignette, halftone, leaks, weave, jitter,
  flicker, neon, glitch. `engines/three.js` gained `realistic()`, `pbr()`, `emissive()`, `bloom()` (`post` option).
  `scripts/looks.mjs <brand>` lists the looks a brand used and the ones it has not tried. `make-video` now pitches
  2–3 different directions (section 0 of the production README, style frames in `qa/directions/`) before the
  storyboard, and compositions start from a look's starter, never from an earlier production. Brand READMEs have a
  *Look range* (signature, fits, ask first, never); earlier productions are recorded as `signature`.
  `test/looks.test.mjs`: every starter deterministic, no two looks alike. Contact sheet `docs/media/looks.jpg`.
- 2026-11-04: **Codex and Copilot support, same repo**. `AGENTS.md` is now the instructions file
  (`CLAUDE.md` is `@AGENTS.md` plus a Claude-only note); the skills moved to `.agents/skills/` (Codex and Copilot read
  it; `.claude/skills` is a symlink; the plugin points there). `init` adds `AGENTS.md`, `.agents/skills/` and links
  `.claude/skills`; older projects with a real `.claude/skills/` folder keep it updated, and a CLAUDE.md without
  `@AGENTS.md` gets a note to move its rules. Desk: `REEL_AGENT=codex` runs `codex exec --json` in the
  `workspace-write` sandbox with `reel-desk` over `-c mcp_servers…`, `OPENAI_API_KEY` removed, session resumed per
  production (`review.json` → `codex.session`). Tested with a fake codex only: local codex-cli 0.133 is too old for
  the account's default model, so no real Codex run yet. Copilot has no headless desk runner (it uses the files or
  the MCP server).
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
| Yuppo | `brands/yuppo/` (gitignored: company assets, commercial font) | Ready 2026-11-03, moved from `../marketing-reels-skill/brand/` (full kit in `kit/`); check card `check.html` renders with Pangea Afrikan, Inter and Po | Pangea Afrikan ad licence (paid pieces use Inter Tight meanwhile)? Verified user count and store rating? ElevenLabs MCP needs `/mcp` auth for VO. Talking Po (REEL-006's provisional mouth, awaiting design sign-off): `LipSync.mountMouth(el, { cx: 0.512, cy: 0.502, w: 0.15, aspect: 893 / 1000, shapes: LipSync.mouthSet({ ink: "#272727", cover: "#FF8133", tongue: "#F6A28E" }) })` over `po-baby.png`; copy into the brand README's *Mascot* when the folder is here. Other open questions: `../marketing-reels-skill/STATUS.md` |
| Bike Logger | `brands/bike-logger/` | Ready; check card `check.html` renders with the site's fonts and colours | Price, kit contents and skill level for the kit? Is the project licensed publicly (`../bikelog/BENCHMARK_OPENBIKESENSOR.md` says not yet) — until it is, no piece can say "open source"? A voice for VO pieces? Copy Archivo + Plex Mono into `assets/fonts/` so renders work offline? |

## Productions

| ID | Brand | Title | Status | Export |
|---|---|---|---|---|
| REEL-001 | bike-logger | Robotics starter kit (silent, 28 s) | delivered (v2); copy revision A in the desk for approval | `productions/bike-logger/REEL-001-kit/export/REEL-001-kit-en.mp4` (still v2) |
| REEL-003 | yuppo | One wake-up time, the whole day planned (Three.js day dial + GSAP, silent, 15 s) | QA passed, silent cut (VO + music pending ElevenLabs auth) | `productions/yuppo/REEL-003-one-wake-up/export/REEL-003-one-wake-up-en.mp4` |
| REEL-004 | yuppo | 3 a.m. question? Ask Po (Pixi night sky + Lottie Po + GSAP, silent, 16 s) | QA passed, silent cut (VO + music pending) | `productions/yuppo/REEL-004-ask-po-3am/export/REEL-004-ask-po-3am-en.mp4` |
| REEL-005 | yuppo | What Star parents get, 7-day trial ad (Blender physics plate + GSAP, silent, 14 s) | QA passed, silent cut (music + SFX pending) | `productions/yuppo/REEL-005-star-trial/export/REEL-005-star-trial-en.mp4` |
| REEL-002 | bike-logger | Engines sampler: Three.js tray, Blender camera housing, Pixi sensor streams (silent, 14.8 s) | QA passed, draft for review | `productions/bike-logger/REEL-002-engines/export/REEL-002-engines-en.mp4` |
| REEL-014 | bike-logger | Says it: REEL-008's visuals + AI voice, captions, a cut every second (test of the hit rules, 18 s) | test render, not approved for posting; AI voice to disclose or replace with the maker's | `productions/bike-logger/REEL-014-says-it/export/REEL-014-says-it-en.mp4` |
| REEL-008 | bike-logger | Night signal: boot sequence of the five sensors, first piece in `looks/neon-noir` (Three.js CAD as neon edges + HUD, music, 16.9 s, 9:16 + 4:5) | delivered (final cut approved 2026-11-04); music and SFX are our own synth | `productions/bike-logger/REEL-008-night-signal/export/REEL-008-night-signal-en-9x16.mp4` (and `-4x5.mp4`) |

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
| Lip sync (Rhubarb) | ✅ | Rhubarb 1.14.0 in `~/.cache/rhubarb-lip-sync/`; the macOS build is x86_64 (Rosetta). ~4 s per short line. Tested 2026-11-04 on the SVG rig (demo), a mascot PNG and Blender shape keys; Three.js uses the same `paramsAt` numbers (no Three.js mouth rig built yet). English recogniser; `--phonetic` for other languages (untested) |
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
- 2026-11-04: one repo for every agent: the kit (renderer, engines, brands) is agent-neutral, only the instruction
  layer differs. `AGENTS.md` + `.agents/skills/` are the single source; Claude-only files just point at them.
- 2026-11-02: Bike Logger's audience is robotics kit learners; every piece sells learning by building, with the replay as the payoff.

## Next

- Codex: one real desk run after `npm i -g @openai/codex@latest` (check the `item.*` event names in `describeCodex`
  and that `-c mcp_servers.reel-desk.*` loads the tools). Copilot: try the skills in VS Code agent mode; it reads both
  `.claude/skills` and `.agents/skills`, so check it doesn't list each skill twice.
- Use the reel layer in a real production: captions on a VO piece (needs ElevenLabs auth for Yuppo), beats on real
  music (check `beats.mjs` BPM against the track's stated tempo), a 4:5 cut of an existing reel.
- Run the new tests on GitHub CI (Linux SwiftShader); consider `--capture beginframe` there once it has run a while.
- Release (0.3.0): the npm package now ships `examples/reel-layer/` and the new engines.
- Hook checks in QA (first second has motion and text; captions inside the safe zone), from the research note.

## Learnings

- **beats.mjs and a quiet first bar (2026-11-04, REEL-008):** with no kick in bar 1, it found the right tempo (128 BPM) but
  put beat 1 a beat late (0.464 s) even with `--downbeat 0`. For music we generate, write the grid from the generator.
- **Looks (2026-11-04):** `Studio.transition` owns visibility only: a layer also hidden with `gsap.set(…, { autoAlpha: 0 })`
  stays at opacity 0 after the transition, so don't pre-hide transitioned layers. Bloom: keep `threshold` ≥ 0.2 and
  emissive ≤ 2, or the whole frame washes white and text drowns (neon-noir also needs a dark scrim behind its text).
  Photoreal: glossy faces at grazing camera angles reflect the studio environment and turn white; keep the camera
  higher. Lathe geometry + `anisotropy` shows facet bands (no tangents). CSS `padding: 14%` is a share of the *width*,
  so safe-zone insets go on an absolutely positioned child. `gsap.utils.random` is unseeded: use `Studio.random`.
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
- **`requestVideoFrameCallback` lies in headless renders (2026-11-04):** after a seek on a paused plate it fires at
  most once, with the frame from *before* the seek (`mediaTime` 0 for a seek to 1 s), and never again. Check
  `mediaTime` before trusting it; the 250 ms fallback is what actually waits for paint.
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
