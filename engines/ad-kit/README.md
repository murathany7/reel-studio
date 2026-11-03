# Ad kit

Common ad scenarios and persuasion patterns as reusable scenes on the `Studio` clock. A composition is a
**brief** (the brand's true material) + a **pattern** (how to arrange it) + a **style** (how it moves) + a
**size**. One composition renders every combination; `scripts/variants.mjs` renders the matrix.

```html
<link rel="stylesheet" href="/engines/ad-kit/ad-kit.css">          <!-- after base.css + brand tokens -->
<script src="/core/node_modules/gsap/dist/gsap.min.js"></script>
<script src="/core/lib/runtime.js"></script>
<script src="/engines/svg-rig.js"></script>
<script src="/engines/ad-kit/ad-kit.js"></script>
<script src="/engines/ad-kit/scenes.js"></script>
<script src="/engines/ad-kit/patterns.js"></script>
<script>
  const P = Studio.params;                        // ?pattern=pas&style=adult&size=feed&hook=B
  const spec = AdKit.pattern(P.get("pattern"), brief, { hook: P.get("hook") });
  AdKit.build({ ...spec, style: P.get("style"), size: P.get("size"), cast, forbid });
</script>
```

- `cast(key, style)` returns an actor's SVG (300×300 viewBox, feet at y≈278, SvgRig part ids). Bike Logger's
  crew: `brands/bike-logger/assets/cartoon/crew.js`.
- `forbid`: the brand's banned words (regex or word). Any string in the spec that matches fails the build.
- Sizes: `reel` 1080×1920 (organic or `placement: "paid"` safe zones), `feed` 1080×1350, `square` 1080×1080,
  `landscape` 1920×1080 (website hero, YouTube, landing-page video) and `banner` 1200×628 (link ads, Open Graph).
  Landscape puts text on the left 47 % and the stage on the right; every size in px scales with the frame
  (`ctx.k`, CSS `--ak-s`). A scene with fixed geometry calls `c = c.unscaled(layer)` and draws at reel scale.
- Cuts: scenes start their entrances `AdKit.PRE` (0.12 s) before the cut, while the layer is still hidden, so the
  first frame after a cut is already moving (QA flags repeated frames at cuts as hitches).
- Styles: `fun` (overshoot, hops, flashes) and `adult` (dry: smaller moves, no squash, no flashes). A brand's
  characters and theme can switch look per style too (the crew has an adult drawing; `theme.css` has `.ak-adult`).
- Text sits in the top 36 % of the safe zone, actors and props below it, so every scene works in every size.

## Scenes (`scenes.js`)

| Scene | Use | Content |
|---|---|---|
| `title` | Hook, statement | `eyebrow, title, sub, chips, actor, act, from, beats, flash` |
| `feature` | Feature spotlight | `eyebrow, title, chips, actor, act, from, base, baseAct, exit` |
| `question` | Curiosity gap: silhouette + question, then the reveal | `title, answer, actor, chips, reveal` |
| `interrupt` | Pattern interrupt: colour jolt, one line | `title, sub, colors` |
| `steps` | How it works, rule of three | `eyebrow, title, items: [{ label, sub, actor }]` |
| `checklist` | Goal gradient / endowed progress | `title, items, done` (pre-ticked items must be true) |
| `beforeAfter` | Transformation: the mess snaps into order | `before, after, items` |
| `mythFact` | Truth sandwich: fact → myth → fact | `fact, myth, chips, source` ⛔ needs `source` |
| `compare` | Contrast columns (no competitor names) | `title, left: { label, rows }, right` |
| `stat` | A number that matters | `value, prefix, suffix, label, source` ⛔ needs `source` |
| `quote` | Testimonial / social proof | `text, who, source` ⛔ needs a real person and source |
| `authority` | Credential / press | `title, credential, source` ⛔ |
| `urgency` | Real deadline | `title, until, today, source` ⛔ deadline must be real and in the future |
| `tip` | Reciprocity: teach one thing first | `title, lines, actor` |
| `vanish` | Loss framing: what you'd miss fades | `title, items, after` |
| `lineup` | Group on a timeline, everyone on the beat | `title, actors` |
| `endcard` | Wordmark, line, CTA, waving cast | `wordmark, line, cta, actors` |

Acts (actor motions): `wave talk hop nod shake lean spin pulse silhouette`, plus a brand's own
(`AdKit.act(name, (ctx, actor, t, t1, opts) => …)`). Brand scenes: `AdKit.scene(name, fn, { dur, requires })`.

## Patterns (`patterns.js`)

Every pattern ends on the end card (peak-end rule: Kahneman et al. 1993). `AdKit.patternsFor(brief)` lists the
ones a brief can fill; `AdKit.pattern` names the missing brief fields.

| Pattern | Ad scenario | Principle | Basis |
|---|---|---|---|
| `pas` | Pain-point ad | Problem → agitate → solve | Copywriting formula; tension → relief |
| `bab` | Transformation | Before → after → bridge | Contrast effect |
| `listicle` | Feature list | Chunking; a promised count holds attention | Miller 1956 |
| `spotlight` | Single feature | Single-minded proposition | Reeves, USP |
| `demo` | Product demo | Show the result | Demonstration advertising |
| `faq` | Objection handling | Answer the doubt first | Hovland et al. 1949 (two-sided messages) |
| `three` | How it works | Rule of three | Shu & Carlson 2014 |
| `unboxing` | What's inside | Anticipation, reveal | Loewenstein 1987 |
| `curiosity` | Teaser | Information gap | Loewenstein 1994 |
| `interrupt` | Scroll-stopper | Orienting response | Sokolov 1963 |
| `ikea` | Build-it-yourself | People value what they build | Norton, Mochon & Ariely 2012 |
| `progress` | Build progress | Goal gradient; endowed progress | Kivetz et al. 2006; Nunes & Drèze 2006 |
| `myth` | Myth-buster | Truth sandwich | Lewandowsky et al. 2020 |
| `reciprocity` | Value first | Give, then ask | Cialdini 1984 |
| `foot` | Small first step | Foot in the door | Freedman & Fraser 1966 |
| `story` | Character story | Narrative transportation | Green & Brock 2000 |
| `loss` | What you'd miss | Loss framing (no fear) | Tversky & Kahneman 1981 |
| `contrast` | Comparison | Contrast, anchoring | Tversky & Kahneman 1974 |
| `specificity` | Spec ad | Precise numbers read as credible | Schindler & Yalch 2006 |
| `social` | Testimonial | Social proof ⛔ real quotes only | Cialdini 1984 |
| `authority` | Expert / press | Authority ⛔ real credentials only | Cialdini 1984 |
| `scarcity` | Deadline offer | Scarcity ⛔ real deadline only | Worchel et al. 1975 |

## Ethics, enforced

Persuasion here arranges true material; it never manufactures it. ⛔ scenes refuse to build without a source,
a real person or a real future deadline, and `forbid` blocks the brand's banned words. A failed guardrail fails the
render immediately (`core/render.mjs` stops on page errors). No fake countdowns, invented reviews, fear appeals
or dark patterns: if a brand has no proof, use a pattern that doesn't need it.

## Variants

`node scripts/variants.mjs <production>/variants.json [--dry | --check] [--jobs 4] [--only k=v|v2] [--qa]`
expands `axes` (any query parameter the composition reads), drops `exclude`, adds `include`, renders in parallel,
skips up-to-date files, and writes `export/manifest.json|md`, covers and `qa/variants-sheet.jpg`.
