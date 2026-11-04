# Editorial

**Feel:** a print magazine spread that moves. Serif headlines, a grid, hairline rules, a spot colour. Smart and calm.

| | |
|---|---|
| Good for | Considered products, publishing, design, finance and trust, founders' stories, explainers with real substance |
| Not for | Loud promos, gaming, kids |
| Palette | Paper (`--ed-paper`) and ink. The brand accent is a spot colour (`--ed-spot`): one italic word, the big numeral, a drop cap. Photos in greyscale or duotone |
| Type | Book serif display (`--ed-serif`, or the brand's `--font-serif`), italic for emphasis, a tracked sans for labels and mastheads. Real typographic details: drop caps, numerals, columns |
| Layout | A strict grid: masthead with issue number, rules, two columns, a photo slot (`.ed-photo` with a brand image). Each scene is a "page" |
| Motion | Unhurried. Lines unmask upward (`clip-path` + `expo.out`), rules draw left to right, photos wipe in, pages slide up like a scroll. 0.6–1.1 s moves, nothing bounces |
| Texture | Light halftone (0.06) and paper grain with `multiply` |
| Engines | GSAP only, plus photos or footage stills. Ken Burns on photos (`backgroundPosition` or `scale` over the shot) |
| Sound | Piano, soft strings, or near-silence with page-turn and pen foley. VO: a narrator, not an announcer |
| Avoid | Neon, glow, drop shadows, more than one spot colour, centring everything (use the grid) |

Starter: `looks/editorial/starter.html`.
