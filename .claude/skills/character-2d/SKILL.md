---
name: character-2d
description: Animate a 2D cartoon character or mascot in a video - an SVG rig drawn in code (engines/svg-rig.js), a designer's Lottie file, or a Rive file. Covers part naming, idle/blink/talk/wave/hop, lip sync to a voiceover (Rhubarb mouth shapes, also on a mascot that only exists as a PNG), and the brand's mascot rules.
---

# 2D characters

Read the brand's mascot rules first (`brands/<slug>/README.md`, *Mascot*). A brand mascot is only drawn from the
brand's own files; never redraw it from memory.

## SVG rig (no designer file)

1. Draw the character as an inline `<svg>` from simple shapes in the brand colours. Name the parts:
   `#body`, `#eyes`, `#mouth-closed`, `#mouth-open`, `#arm-l`, `#arm-r` (any can be left out).
2. `const c = SvgRig(svgEl)` then chain: `.idle(from, to)`, `.blink([t…])`, `.talk(from, to)`, `.wave(t)`, `.hop(t)`.
3. Arms pivot at the inner, lower corner of the arm's box. If an arm swings off the body, set `data-pivot="x% y%"` on it.
4. Speaking a voiceover: lip sync (next section). Without Rhubarb, a cheaper lip flap: word starts from
   `scripts/transcribe.sh audio/vo.wav audio/vo` passed as `.talk(0, 0, { beats: [...] })`.
5. Reuse: once a character is approved, save its SVG in `brands/<slug>/assets/characters/` and add it to the brand README.

## Lip sync (a character speaks the voiceover)

1. Cues per VO line: `scripts/lipsync.sh audio/vo.wav audio/vo.visemes.json --dialog audio/vo.txt` (Rhubarb Lip
   Sync; install note in the script). Use the approved script as the dialog file. Seconds for each line.
2. Load `<script src="../audio/vo.visemes.js">` and `<script src="/engines/lipsync.js">` in the composition.
3. **SVG rig:** draw the mouth shapes as `#mouth-A` … `#mouth-H`, with `#mouth-closed` (or `#mouth-X`) as the resting
   mouth. A (lips pressed), B (slightly open, teeth), C (open), D (wide open), E (O), F (OO) carry most of it; G (F/V)
   and H (L) fall back to A and C if not drawn. Then `.lipsync(LipSync.cues("vo.visemes"), { offset: <VO start> })`,
   one call per line. Use `.talk()` or `.lipsync()` for a line, not both. Example: `examples/engines-demo/index.html`.
4. **Mascot that only exists as an image** (a PNG from the brand): `LipSync.mountMouth(wrapper, { cx, cy, w, aspect,
   shapes: LipSync.mouthSet({ ink, cover }) })` draws a mouth over it (`cover` = the face colour, hiding the image's
   own mouth while talking; at rest the image's mouth shows). `cx`, `cy`, `w` are fractions of the image: measure
   once, check stills at a few cues, and keep the numbers in the brand README (*Mascot*). Then
   `LipSync.addToTimeline(Studio.tl, cues, mouth, { offset })`.
5. A drawn mouth on a brand's mascot is new artwork: the brand owner approves it before anything with it is published.
6. Keep the face alive while it talks: a blink every 2–4 s, a small nod on stressed words. `LipSync.talking(cues, t,
   offset)` says when the character is speaking.
7. QA: stills at a few cue times next to the cue file (does each mouth match the sound?), then one listen with the mix.

Rules and the 3D side: `engines/README.md`, *Lip sync*.

## Lottie (designer file)

`Studio.lottie(el, "/brands/<slug>/assets/lottie/<file>.json", { start, loop, speed })`. Load
`/core/node_modules/lottie-web/build/player/lottie.min.js` before the runtime. Check that the file uses no
expressions or effects lottie-web cannot draw (render a still, compare with the designer's preview).

## Rive (designer file)

Not built yet. When the first `.riv` arrives: write `engines/rive.js` with the low-level runtime
(`@rive-app/canvas-advanced`): load the file, then on each seek reset the artboard and advance the animation or
state machine to `t` (state machines cannot jump, so step from 0 at a fixed rate). Test with two md5-matching
renders, then update `engines/README.md`.

## Character craft

- Anticipation before a move (a small squash before a hop), overshoot after (`back.out`).
- Blink every 2–4 s at irregular intervals. A still character looks dead.
- Hold poses long enough to read (≥ 0.4 s) on a phone.
