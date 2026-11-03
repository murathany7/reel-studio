# Reel layer demo

An 8-second test reel for the reel helpers in `core/lib/runtime.js`, laid out for four formats from one composition.

| Time | What it shows |
|---|---|
| 0–2.2 s | Title card that pulses on every beat (`Studio.beatPhase`) |
| 2.0 s | `Studio.transition` iris, timed on the downbeat of bar 1 (`Studio.bar(1)`) |
| 4.0 s | `Studio.transition` push-left into a Three.js layer |
| 5.9 s | `glTransition` ripple from the Three.js canvas into a Blender plate (`engines/gl-transitions.js`) |
| all | `Studio.captions` in the `pop` style, from hand-timed words in `audio/words.json` |

The music (`audio/music.mp3`) is a synthetic 120 BPM loop and `audio/beats.json` is its grid from `scripts/beats.mjs`.
Rebuild both with `examples/reel-layer/make-audio.sh`.

## Rebuild

```bash
node core/render.mjs video examples/reel-layer/index.html examples/reel-layer/export/reel-layer.mp4 --audio examples/reel-layer/audio/music.mp3 --formats all
scripts/qa-video.sh examples/reel-layer/export/reel-layer-9x16.mp4 examples/reel-layer/qa
scripts/qa-video.sh examples/reel-layer/export/reel-layer-16x9.mp4 examples/reel-layer/qa/16x9 1920x1080
```

Expected QA: size, 30 fps CFR and codec ✅; loudness ⚠️ (the synthetic music is not normalised: a real piece goes
through `scripts/mix_audio.py`). "Jumps" at ~2.25 s, 4.27 s and 6.25 s are the iris, the push and the ripple. "Hitches"
just before some beats are the title pulse settling to rest (it eases to a standstill before the next beat).

## Rive check

`rive.html` draws Rive's public sample file with `engines/rive.js`: a timeline on top, a state machine fired by
timed inputs below. The sample is not in the repo:

```bash
mkdir -p examples/reel-layer/assets && curl -o examples/reel-layer/assets/vehicles.riv https://cdn.rive.app/animations/vehicles.riv
node core/render.mjs stills examples/reel-layer/rive.html /tmp/rive --at 0.5,1.2,2,2.8,3.5
```

`npm test` renders it in two orders when the file is there, and skips that check when it is not.
