---
name: character-2d
description: Animate a 2D cartoon character or mascot in a video - an SVG rig drawn in code (engines/svg-rig.js), a designer's Lottie file, or a Rive file. Covers part naming, idle/blink/talk/wave/hop, lip flap synced to voiceover, and the brand's mascot rules.
---

# 2D characters

Read the brand's mascot rules first (`brands/<slug>/README.md`, *Mascot*). A brand mascot is only drawn from the
brand's own files; never redraw it from memory.

## SVG rig (no designer file)

1. Draw the character as an inline `<svg>` from simple shapes in the brand colours. Name the parts:
   `#body`, `#eyes`, `#mouth-closed`, `#mouth-open`, `#arm-l`, `#arm-r` (any can be left out).
2. `const c = SvgRig(svgEl)` then chain: `.idle(from, to)`, `.blink([t…])`, `.talk(from, to)`, `.wave(t)`, `.hop(t)`.
3. Arms pivot at the inner, lower corner of the arm's box. If an arm swings off the body, set `data-pivot="x% y%"` on it.
4. Lip flap synced to voiceover: `scripts/transcribe.sh audio/vo.wav audio/vo` gives word timings (JSON). Pass the
   word start times as `.talk(0, 0, { beats: [...] })`.
5. Reuse: once a character is approved, save its SVG in `brands/<slug>/assets/characters/` and add it to the brand README.

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
