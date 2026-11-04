# Engines research: adopt another framework, or build our own for reels? (2026-11-03)

> **Built the same day:** captions, beats, CSS and GL transitions, formats, the Rive adapter, parallel workers, plates
> as image frames and Linux beginFrame capture (`STATUS.md`, `examples/reel-layer/`). Hook checks in QA are still open.

**Short answer:** keep our renderer and engine set. Don't switch to Remotion or HyperFrames. What's missing is not
another drawing engine. It's a **reel layer**: captions, beat sync, transitions, format variants and parallel
rendering, built on top of the `Studio` clock. A few techniques are worth borrowing from HyperFrames.

## What else exists

| Tool | What it is | Licence | State (Nov 2026) | Fit for us |
|---|---|---|---|---|
| **HyperFrames** (HeyGen) | HTML/CSS + GSAP, seek-per-frame, frame adapters (GSAP, Lottie, Three, WAAPI, Anime.js), ~450 catalog blocks, shader transitions, agent skills, Lambda | Apache-2.0 | Very active (~78k stars, started Mar 2026) | **Same architecture as ours.** Nothing to migrate to, but worth borrowing from (see below) |
| **Remotion** | React components → video, mature, Lambda rendering | Free for ≤3 people, then a paid company licence (from $25/seat/month; automation is metered) | Mature | No: React rewrite, licence for anyone using the kit at a company of 4+, and it replaces the plain-HTML compositions and QA we already have. The 2026-11-02 decision still holds |
| **Revideo** | TypeScript fork of Motion Canvas with headless and parallel rendering | MIT | 0.11 in Jul 2026; the team's focus moved to a commercial editor | No: generator-based scenes, a different authoring model, and an uncertain roadmap |
| **Motion Canvas** | Vector explainers in TypeScript, synced to VO | MIT | Last stable Dec 2024 | No: stalled |
| **Theatre.js** | Keyframe editor for web/Three.js | Apache-2.0 | Looks inactive | No |
| **Etro, Editframe, Shotstack, Creatomate, JSON2Video, Plainly** | Browser compositors and paid render APIs | Mixed / paid | — | No: per-render fees or real-time export, which goes against "no per-video fees" |
| **Rive (low-level web API)** | `animation.advance(dt)` / `artboard.advance(dt)` + `renderer` on a canvas | MIT runtime | Active | **Yes, as an adapter.** Covers the 🔜 row in `engines/README.md` |

## Worth borrowing from HyperFrames and Replit's renderer

HyperFrames and Replit both published how they make browsers render frame-exactly. Three ideas apply to `core/render.mjs`:

1. **`HeadlessExperimental.beginFrame` on Linux** (chrome-headless-shell + deterministic flags): each frame is one
   seek, one compositor frame, one capture, with no screenshot racing the compositor. They report it works on Linux
   only (macOS/Windows fall back to screenshots), so we'd use it for CI/Docker and keep screenshots on macOS. They also
   note it drops alpha.
2. **Video plates as image frames:** HyperFrames extracts each `<video>` to JPEGs with ffmpeg and swaps in an `<img>`
   per frame. This avoids the whole class of plate bugs we've hit (seek race, colour shift in `STATUS.md`
   *Learnings*). Replit does the same with mp4box.js + WebCodecs onto a canvas.
3. **Parallel chunks:** N Chrome pages/processes each render a frame range, then ffmpeg concatenates the chunks.
   This is already in *Next*; both projects show it works (and recommend one worker for video-heavy pieces).

The HyperFrames catalog (captions, transitions, overlays) is Apache-2.0. Blocks could be ported with attribution if
one fits a brand, but brand looks must stay our own (golden rule 4).

## Build our own: the reel layer

What a reel needs that no general engine gives us, in order of value:

| Piece | What | Builds on |
|---|---|---|
| `Studio.captions(el, words.json, style)` | Word-by-word kinetic captions (karaoke highlight, pop-in, max 2 lines, kept inside the safe zone) from whisper word timings | `scripts/transcribe.sh` (.json), `base.css` safe zones |
| `Studio.beats(cues)` / beat markers | Detect music onsets (ffmpeg/aubio) into a cue list so cuts and hits land on the beat: `tl.add(x, Studio.beat(8))` | `scripts/mix_audio.py`, `audio/cues.json` |
| `Studio.transition(a, b, "wipe", t)` | WebGL shader transitions between layers (gl-transitions-style GLSL, MIT; check before vendoring) | Three.js or a bare WebGL canvas, `preserveDrawingBuffer` |
| Format variants | One composition → 9:16, 4:5, 1:1, 16:9 with per-format layout overrides (`?format=4x5`), rendered in one command | `Studio.setup`, `render.mjs` |
| Hook checks in QA | Flag a piece whose first 1 s has no motion or no text, captions outside the safe zone, or text on screen for less than its reading time | `scripts/qa-video.sh`, `qa_motion.py` |
| Parallel + `beginFrame` renderer | See above | `core/render.mjs` |
| Rive adapter | `engines/rive.js`: on each seek, reset the instance and advance from 0 to `t` in fixed steps (pose from `t` only); cache the last `t` to step forward cheaply during sequential renders | Rive low-level web API |

## Suggested order

1. Captions (most reels need them; we already have word timings).
2. Parallel rendering + plates as image frames (speed, and it removes a known source of bugs).
3. Format variants.
4. Beat sync, shader transitions, Rive adapter as pieces ask for them.

## Sources

- [Remotion alternatives in 2026 (IMG.LY, a vendor)](https://img.ly/blog/remotion-alternatives/)
- [HyperFrames repo](https://github.com/heygen-com/hyperframes) · [HeyGen: HTML to video](https://www.heygen.com/research/html-to-video)
- [Replit: lying to the browser about what time it is](https://blog.replit.com/browsers-dont-want-to-be-cameras)
- [Remotion licence](https://www.remotion.dev/docs/license) · [Remotion pricing](https://www.remotion.dev/docs/license/pricing)
- [Rive web low-level API](https://rive.app/docs/runtimes/web/low-level-api-usage)
- [Theatre.js repo](https://github.com/theatre-js/theatre)
- Comparison blogs (often vendor-written, treat figures as unverified): [vibemotionai](https://vibemotionai.net/blog/remotion-vs-hyperframes), [genmotion](https://genmotion.dev/blog/hyperframes-alternatives), [rendercomp](https://rendercomp.com/blog/best-programmatic-video-tools-2026/)
