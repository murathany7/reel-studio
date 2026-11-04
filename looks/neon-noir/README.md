# Neon noir

**Feel:** cyberpunk night. Rain, neon tubes in fog, glitches on the cut, a HUD reading the scene. Tense and fast.

| | |
|---|---|
| Good for | Tech, gaming, nightlife, security, launches, "the future is here" hooks, anything that wants edge |
| Not for | Calm, wellness, kids, trust-first finance (unless the brand asks for contrast) |
| Palette | Near-black night (`--nn-night`). Two neons: brand `--accent` → `--nn-neon-a`, a cold counter-neon `--nn-neon-b` (cyan by default, or the brand's `--neon-b`). White only for the main line |
| Type | Condensed, uppercase, heavy display; mono for HUD lines (`// 02:47 · sector 9`). Neon glow only on the accent words, never on body text |
| Layout | Text top-left like a terminal, HUD corner brackets, the hero deep in the frame. Dark scrim behind the text so it reads over glow |
| Motion | Fast. Hard cuts every 1–1.7 s, each one on a glitch (`LookFx.glitch` at the cut times). Type appears instantly or types on (`ease: "steps(n)"`). Camera always pushing forward. `expo.out` for the few scaled moves |
| Texture | `LookFx.scanlines` (rolling), `LookFx.vignette` 0.7, light `grain`, `flicker` on the logo, `neon()` glow |
| Engines | Three.js with `emissive()` materials + `bloom()` post + fog. Seeded rain on a canvas. Real product: a GLB with emissive edges, or a page capture shown on a "screen" in the scene |
| Sound | Dark synth pulse, sub hits on the cuts, glitch SFX, a low drone. VO: close, quiet, confident |
| Avoid | Blooming everything white (keep `threshold` ≥ 0.2, emissive ≤ 2), purple-on-purple with no contrast, glitches on every frame (only on cuts), the 80s synthwave grid-and-sun (that is a different look) |

Starter: `looks/neon-noir/starter.html` (5 s: hook, proof typed on, end card).
