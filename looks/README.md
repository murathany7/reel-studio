# Looks

A **look** is the art direction of one piece: palette treatment, type, layout, motion grammar, texture, engines and
sound, chosen together. A **brand** is who is speaking: facts, logo, colours, fonts, voice, compliance.

Keep the two apart. One brand can make a cyberpunk teaser, a toon 3D explainer and a photoreal product film, and each
still reads as that brand: its logo, its colours mapped into the look, its facts, its voice. Brand colours fill the
look's roles (each look's README says which), and the brand's `compliance.md` can rule a look out.

## The catalogue

| Look | Feel | Hero engine | Pace | Starter |
|---|---|---|---|---|
| [neon-noir](neon-noir/) | Cyberpunk night: neon in fog and rain, HUD, glitch cuts | Three.js `emissive` + `bloom` | fast, hard cuts | `neon-noir/starter.html` |
| [toon-3d](toon-3d/) | Toy box: cel-shaded 3D, ink outlines, squash and stretch | Three.js `toon` + `outline` | bouncy | `toon-3d/starter.html` |
| [photoreal](photoreal/) | Premium product film: real materials, studio light, slow camera | Three.js `realistic` + `pbr`, Blender Cycles | slow, continuous | `photoreal/starter.html` |
| [editorial](editorial/) | A magazine spread that moves: serif, grid, rules, spot colour | GSAP + photos | unhurried | `editorial/starter.html` |
| [kinetic-type](kinetic-type/) | Type is the picture: two colours, one word per beat | GSAP | on the beat | `kinetic-type/starter.html` |
| [retro-film](retro-film/) | Warm 70s Super 8: sunburst, stacked type, grain, weave | GSAP + SVG, footage | slow drift | `retro-film/starter.html` |
| [paper-collage](paper-collage/) | Handmade stop motion: torn paper, letter blocks, tape | GSAP + HTML cut-outs | stepped, 12 fps | `paper-collage/starter.html` |

Each starter is a working 5 s, 9:16 piece with placeholder copy. Render one to see the look:
`node core/render.mjs stills looks/<look>/starter.html /tmp/<look> --every 0.5`.
The contact sheet of all seven: `docs/media/looks.jpg`.

A brand may also have a **signature** look of its own (its README, *Look range*): what its earlier pieces used.
It is one option on the menu, not the default.

## Choosing a look (every storyboard)

1. Run `node scripts/looks.mjs <brand>`: the looks the brand's earlier pieces used, newest first, and the ones it
   has not tried.
2. Read the brand's *Look range* (looks it fits, looks it rules out) and the brief (audience, placement, mood,
   references in `refs/`).
3. **Pitch 2–3 directions that differ from each other** in the storyboard (section 0): look, one line on why it
   fits this brief, one style frame each (`node core/render.mjs still` of the starter with the brand's tokens and the
   real hook line). At least one of them is a look the brand's last two pieces did not use.
4. The person picks. Write the look into the README's *Look* field. No pick, no production.

Reusing the brand's last look is fine when the person asks for it or the piece is part of a series (say so in the
README). Never start a new piece by copying an earlier production's composition: start from the chosen look's
starter (or a blank composition), so the layout, type and motion come from the look, not from habit.

## Using a look in a composition

```html
<link rel="stylesheet" href="/core/lib/base.css">
<link rel="stylesheet" href="/brands/<slug>/tokens.css">   <!-- identity: colours, fonts, logo -->
<link rel="stylesheet" href="/looks/<look>/look.css">       <!-- art direction: maps the brand into the look -->
<script src="/looks/fx.js"></script>                        <!-- texture and post effects, when the look uses them -->
```

Copy the starter into `productions/<brand>/<ID>/composition/index.html`, add the brand's tokens line, replace the
copy with the storyboard's, put in the brand's logo, product (GLB, CAD, page capture, photo) and audio. Keep the
look's motion grammar; change the beats.

Brands can steer a look with optional tokens: `--accent-2`, `--accent-3`, `--neon-a`, `--neon-b`, `--paper`,
`--font-serif`, `--font-mono`, `--font-hand`, `--font-display-condensed`, `--font-display-rounded`,
`--font-display-heavy`, `--font-display-light`, `--font-display-retro`. Without them a look uses its own defaults.

## `fx.js` (texture and post, all pure functions of `t`)

| Call | Does |
|---|---|
| `LookFx.grain(parent, { amount, size, fps, blend })` | Seeded film/sensor grain, new every 1/fps s |
| `LookFx.scanlines(parent, { gap, opacity, roll })` | CRT lines, optional rolling band |
| `LookFx.vignette(parent, { amount, color, inner })` | Dark or tinted corners |
| `LookFx.halftone(parent, { cell, dot, opacity, blend })` | Print dots |
| `LookFx.leaks(parent, { colors, opacity, speed })` | Drifting warm light leaks |
| `LookFx.weave(el, { px, deg, fps })` | Film gate weave |
| `LookFx.jitter(els, { px, deg, fps })` | Stop-motion "boil" on cut-outs |
| `LookFx.flicker(el, { rate, depth, from })` | Neon tube or exposure flicker |
| `LookFx.neon(el, { color, spread })` | Neon glow on text |
| `LookFx.glitch(el, { at: [times], dur, strength, split })` | Displaced bands and RGB split at the given times |

Element effects use the CSS `translate`, `rotate`, `opacity` and `filter` properties, so they stack with GSAP
tweens (which set `transform`). Grain redraws a canvas every frame; on long pieces keep `size` ≥ 2.

Three.js helpers for looks (`engines/three.js`): `realistic()`, `pbr()`, `emissive()`, `bloom()`, plus `toon()` and
`outline()`.

## Adding a look

`looks/<slug>/` with `README.md` (the table: feel, good for, not for, palette and how brand colours map, type,
layout, motion, texture, engines, sound, avoid), `look.css` (variables with brand fallbacks: `var(--accent, …)`)
and `starter.html` (5 s, 9:16, placeholder copy, every frame deterministic). Render stills, check two renders of a
frame match, add a row above and a tile to `docs/media/looks.jpg`. A new look earns its place when its stills could
not be mistaken for any other look's.
