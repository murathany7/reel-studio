# Toon 3D

**Feel:** a toy box come to life. Chunky cel-shaded 3D, ink outlines, squash and stretch, everything bounces.

| | |
|---|---|
| Good for | Consumer apps, kids and family, food, games, mascots, "it's easy" stories, explaining a product with friendly objects |
| Not for | Luxury, serious B2B, medical, anything that must look real |
| Palette | A bright sky gradient (look's own), brand colours as the toys (`--accent`, `--accent-2`, `--accent-3`), one dark ink (`--t3-ink`) for every outline and shadow |
| Type | Fat rounded display, white or brand fill, thick ink stroke painted under the fill (`paint-order: stroke`), a hard drop shadow. Words arrive one at a time |
| Layout | Big title up top, toys in the lower middle on a little ground island, speech bubbles pointing at things |
| Motion | Bouncy. `elastic.out`, `back.out(3)`, `bounce.out`; squash on contact, stretch in the air (pose from `t`, see the starter's `hop`). Scene changes are iris wipes (`Studio.transition(..., { type: "iris" })`). Things never stand still: idle bobbing, orbiting balls |
| Texture | None. Clean and flat-lit, so the outline carries the look |
| Engines | Three.js `toon()` + `outline()` (fast), or Blender `toon()` for a hero shot. SVG rig for a 2D mascot next to the 3D toys. Pixi confetti for the payoff |
| Sound | Boings, pops, plucky ukulele or marimba, a whoosh on each iris |
| Avoid | Realistic lighting or shadows, thin type, more than three toy colours, slow fades |

Starter: `looks/toon-3d/starter.html`.
