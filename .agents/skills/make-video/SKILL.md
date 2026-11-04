---
name: make-video
description: Make a marketing video, reel, ad, post or carousel for any brand in brands/. Covers the whole path - brief, art direction (a look from looks/, different from the brand's recent pieces), storyboard, approval, plates and audio, composition, render, frame-by-frame QA and a documented delivery folder. Use for any "make a reel / ad / post / video for <brand>" request.
---

# Making a marketing video

## Start

1. No `core/render.mjs` in the project → run the `setup` skill first. Read `STATUS.md` (open work, decisions, learnings).
2. Find the brand in `brands/<slug>/`. Read its `README.md` and `compliance.md`. No brand folder yet → run the
   `new-brand` skill first. Never borrow one brand's look, facts or voice for another.
3. Create `productions/<brand>/<ID>-<slug>/` from `productions/_TEMPLATE/`. IDs: `REEL-###`, `POST-###`, never reused.

## 1. Directions, storyboard, then stop

**Pick the look first** (`looks/README.md`). The brand gives identity (facts, logo, colours, fonts, voice); the look
gives the art direction (palette treatment, type, layout, motion, texture, engines, sound). A brand's pieces should
not all look alike:

1. `node scripts/looks.mjs <brand>`: what the brand's earlier pieces used and what it has not tried. Read the brand's
   *Look range* (fits, ask first, never).
2. Section 0 of the README: pitch **2–3 directions that differ from each other** (e.g. neon-noir vs photoreal vs
   paper-collage), at least one the last two pieces did not use, each with one line on why it fits the brief. Render
   one style frame per direction: the look's starter with the brand's tokens and the real hook line → `qa/directions/`.
   Look at them side by side; if two could be mistaken for each other, replace one.
3. Reuse the brand's last look only when the person asks or the piece is part of a series (say so).

Then fill sections 1–4 for the direction the person likes best (or for each, briefly, if they want to choose from
storyboards): the problem, the benefit, 3 hook variants, one row per beat (time, visual, **engine**, on-screen text,
sound), caption. Pick engines with the `pick-engine` skill and say why; the look's README names its usual engines.
State size, length, placement and sound (VO / music / silent), and the other formats wanted (4:5 feed, 1:1, 16:9):
one composition renders them all.

**Stop and ask for approval** in chat: the look and the storyboard. No plates, audio or composition before the box is ticked. (If the person uses
the optional desk, they may approve there instead: `review-desk` skill. Never tick the box on your own.)

## 2. Produce

| Step | How |
|---|---|
| Plates | 3D: `scene-3d` skill (Three.js live, or Blender → MP4). Live site: `capture-site` skill. Footage: `Studio.video` |
| Character | `character-2d` skill (SVG rig, Lottie, Rive) |
| Audio | ElevenLabs MCP (`.mcp.json`) for VO, SFX and music → `audio/`. Cue sheet `audio/cues.json` → `python3 scripts/mix_audio.py audio/cues.json audio/mix.wav`. Word timings for captions or lip flap: `scripts/transcribe.sh` |
| Beat grid | Music → `node scripts/beats.mjs audio/music.mp3 audio/beats.json`. In the composition `await Studio.beats("../audio/beats.json", { offset: <music start> })`, then cut on `Studio.bar(n)` / `Studio.beat(n)`. Check the BPM it prints against the track |
| Captions | VO pieces: `Studio.captions(el, "../audio/vo.json", { offset: <VO start>, style: "karaoke" \| "pop" \| "highlight" })` from the whisper JSON. Check the words against the script (whisper mishears names) |
| Composition | `composition/index.html`, started from `looks/<look>/starter.html`, **never from an earlier production's composition** (that is how every piece ends up the same). Load `/core/lib/base.css`, then `/brands/<slug>/tokens.css`, then `/looks/<look>/look.css` (+ `/looks/fx.js` for texture). Keep the look's type, motion and texture; bring in the brand's logo, product and copy. Engine patterns: `examples/engines-demo/index.html`; captions, beats, transitions and formats: `examples/reel-layer/index.html`. Text and CTA inside `.safe` (paid) or `.safe-organic` |
| Formats | `Studio.setup({ …, formats: ["4x5", "1x1", "16x9"] })`; per-format CSS under `.fmt-4x5` etc., values with `Studio.pick({...})` |
| Render | `node core/render.mjs video <comp> export/<ID>-<lang>.mp4 --audio audio/mix.wav` (posts: `still`). Other formats: `--formats all` → `export/<ID>-<lang>-4x5.mp4` … QA each one |

## 3. QA (never skip)

1. `scripts/qa-video.sh export/<ID>.mp4 qa` → `qa/report.md`. Every ❌ fixed. Every jump either an intended cut
   (say so in the report) or fixed.
2. `node core/render.mjs stills <comp> qa/beats --at <every beat start and end> --safe`, then **look at each one**:
   text inside the safe zone, nothing cut off, no half-loaded asset, no overlap, spelling, brand colours, and the
   look held: its type, motion and texture all the way through (no beat drifting back to a previous piece's style).
3. Determinism spot check when a WebGL or plate engine is used: render one frame twice, the md5s match.
4. Listen once with sound: VO in sync with text, music ducked under VO, −14 LUFS.
5. Fact check: every claim in section 6 of the README has a source. Compliance list passes.

## 4. Deliver

Fill README sections 5–7 (production log, fact check, rebuild commands). Status `delivered`. Update `STATUS.md`:
the production row (with its look), anything learned (what worked, an engine quirk, a look that needed tuning) in
*Learnings*.

## Defaults (state them in every storyboard)

| | |
|---|---|
| Reel / video ad / Story | 1080×1920, 9:16, 30 fps CFR, H.264, −14 LUFS. Paid 9–20 s, organic 15–45 s |
| Post / carousel | 1080×1350, 4:5 |
| Safe zone, paid Reels | top 14%, bottom 35%, sides 6% (`.safe`) |
| Safe zone, organic Reels | top 11.5%, bottom 22%, left 6%, right 11% (`.safe-organic`) |
| Silent pieces | All meaning on screen; captions ≥ 42 px; each line held ≥ 1.5 s |
| VO pieces | Burned-in captions (`Studio.captions`): many people watch with the sound off |
| Other formats | 4:5 feed 1080×1350, 1:1 1080×1080, 16:9 1920×1080; `.safe` is a 6% margin (16:9: 8% top/bottom, 5% sides) |
