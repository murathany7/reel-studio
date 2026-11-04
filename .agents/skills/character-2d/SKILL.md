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

`riveLayer(el, "/brands/<slug>/assets/<file>.riv", { animation | stateMachine, start, loop, inputs })` from
`engines/rive.js`. A timeline (`animation`) is posed straight from `t`. A state machine is stepped from 0 at the frame
rate, so give its inputs as times: `inputs: [{ at: 1.2, name: "wave" }, { at: 2, name: "mood", value: 2 }]` (no value
= trigger). Render a few stills in two orders (`--workers 1`, then `--workers 2` with the times reversed) and check
the md5s match. `examples/reel-layer/rive.html` is a working check page.

## Character craft

- Anticipation before a move (a small squash before a hop), overshoot after (`back.out`).
- Blink every 2–4 s at irregular intervals. A still character looks dead.
- Hold poses long enough to read (≥ 0.4 s) on a phone.
