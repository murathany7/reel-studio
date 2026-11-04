# Photoreal

**Feel:** a premium product film. Real materials, soft studio light, slow camera, quiet type. The product is the hero.

| | |
|---|---|
| Good for | Hardware, devices, kits, cosmetics, drinks, anything physical that has a CAD file or a GLB; "built to last", "made with care" |
| Not for | Pieces with lots of copy, playful stories, apps with no physical object (use UI or editorial) |
| Palette | Neutral graphite backdrop (`--pr-bg-top/bottom`) or a warm seamless. Brand colour in the product's materials and one thin accent (`--pr-accent`: rules, kicker) |
| Type | Light weight, small, tracked-out kicker, a thin accent rule. Text never sits on the product; it gets its own space |
| Layout | Product in the lower middle with its soft floor shadow; type top-left or centred above. Lots of empty space |
| Motion | Slow and continuous. Camera orbit, push-in, macro pass across a detail, pull-back hero. Smoothstep or `power2.inOut`, never overshoot. Type fades up 0.9 s. Crossfades between scenes. Final render with `motionBlur: true` |
| Texture | Very light grain (0.02–0.03), soft vignette. Optional letterbox (`.pr-bars`) for a cinema feel |
| Engines | Three.js `realistic()` (ACES tone mapping, studio environment, soft shadows) + `pbr()` materials on the real CAD/GLB. For hero quality: Blender with Cycles (`engines/blender/render.sh … --engine CYCLES`), area lights, depth of field. Footage plates for hands or places (never to show features) |
| Sound | Restrained: a low piano or ambient pad, tactile foley (click, slide, metal), a single soft hit on the logo. VO: calm, few words |
| Avoid | Fake-looking plastic (raise metalness, lower roughness, add a rim light), blown-out reflections at grazing angles (camera higher), fast cuts, bounce, glow, more than two lines of type per shot |

Starter: `looks/photoreal/starter.html` (a lathed aluminium puck; swap in the brand's own model).
