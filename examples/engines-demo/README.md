# Engines demo

A 6-second, 1080×1920 test reel that runs every tested engine on one clock. It proves the setup works on a new machine.

| Time | Engine | What it shows |
|---|---|---|
| 0–2 s | Blender plate | A cel-shaded blob hops (`engines/blender/example_scene.py`) |
| 2–4 s | Three.js | A toon-shaded donut with an ink outline spins |
| 4–6 s | SVG rig + Pixi | A drawn character hops, blinks, talks and waves; seeded confetti bursts |
| all | GSAP | Labels and hard cuts |

## Rebuild

```bash
cd core && npm install && cd ..
engines/blender/render.sh engines/blender/example_scene.py examples/engines-demo/plates/blob.mp4 --size 540x960 --duration 2
node core/render.mjs video examples/engines-demo/index.html examples/engines-demo/export/engines-demo.mp4
scripts/qa-video.sh examples/engines-demo/export/engines-demo.mp4 examples/engines-demo/qa
```

Expected QA: size, 30 fps CFR and codec ✅. "No audio" ⚠️ (the demo is silent). Two "jumps" at 2.0 s and 4.0 s,
which are the intended hard cuts. Rendering the same frame twice gives the same md5.
