# Paper collage

**Feel:** handmade stop motion. Torn paper shapes on kraft board, letters cut from different papers, tape, a rubber stamp. Crafty and human.

| | |
|---|---|
| Good for | Small brands, makers, education, community, personal stories, anything that wants to feel made by people, not machines |
| Not for | Precision tech, luxury, fast performance ads |
| Palette | Kraft board and white paper (the look's); the brand colours are the coloured papers (`--accent`, `--accent-2`, `--accent-3`); black marker |
| Type | Ransom-note letter blocks (`.pc-letters`), a handwritten line (`--font-hand`), a stamp |
| Layout | Layered paper: big torn shapes low in the frame, notes taped on, letters up top. Slight random tilts (seeded) |
| Motion | Stop motion: every move in steps at 12 drawings a second (`ease: steps(n)`), letters pop in one per drawing, things slide on and off like they were pushed by hand. Cut-outs "boil" with `LookFx.jitter` on twos |
| Texture | Torn edges (`#pc-torn` SVG filter), paper drop shadows, light grain with `multiply` |
| Engines | GSAP + HTML/SVG cut-outs. Photos of real paper textures or the product cut out (PNG with alpha) fit in. SVG rig for a paper puppet |
| Sound | Paper rustles, scissors, a stamp thud, ukulele, glockenspiel, hand claps |
| Avoid | Smooth eases (they break the stop-motion feel), perfect alignment, glossy gradients, unseeded `gsap.utils.random` (use `Studio.random`) |

Starter: `looks/paper-collage/starter.html`.
