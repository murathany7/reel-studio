---
name: ad-variants
description: Make many ad variants from one composition with the ad kit (engines/ad-kit) - common ad scenarios (pain point, before/after, demo, how it works, FAQ, unboxing, listicle) and persuasion patterns from psychology (curiosity gap, IKEA effect, goal gradient, truth sandwich, reciprocity, foot in the door, loss and contrast framing, social proof, scarcity) crossed with styles, hooks and sizes, rendered as a matrix by scripts/variants.mjs. Use for "make N variants", A/B tests, pattern packs or a new ad from a template.
---

# Ad variants

Read `engines/ad-kit/README.md` (scenes, patterns, guardrails) and the brand's `README.md` + `compliance.md` first.

## 1. Brief (true material only)

Write the brand's brief once: `brands/<slug>/assets/cartoon/brief.js` is the worked example (Bike Logger). Every
string traces to the brand's fact list. Put the brand's banned words in `forbid`. A pattern whose proof the brand
doesn't have (`social`, `authority`, `scarcity`) is skipped and noted, never filled with invented material.

## 2. Storyboard the pack, then stop for approval

List the patterns × styles × hooks × sizes in the production README with one line per pattern (what it shows,
which principle). The matrix is the storyboard; approval covers the pack. New patterns or copy need approval again.

## 3. Composition + matrix

- `composition/index.html` reads `Studio.params` (`pattern`, `style`, `hook`, `size`, any axis you add) and calls
  `AdKit.build({ ...AdKit.pattern(id, brief, opts), style, size, cast, forbid })`. Copy
  `productions/bike-logger/REEL-009-patterns/composition/index.html`.
- `variants.json`: `axes`, `exclude`, `include`, `name`. Then:
  `node scripts/variants.mjs <file> --dry` (list) → `--check` (every variant builds) → full run with `--qa`.
- Look at stills of each pattern before the full run (`node core/render.mjs stills "<comp>?pattern=x" dir --at …`).

## 4. QA and delivery

`qa/variants-sheet.jpg` (one cover per variant) and each `qa/<name>/report.md`. Look at the sheet, open any ❌.
MP4s are gitignored: deliver them outside git (an Artifact gallery with uploaded assets, a release or a drive) and
link that from the production README. `export/manifest.md` lists every file with its axes.

## Adding to the kit

New scene: `AdKit.scene(name, (ctx, s, t0, t1, layer) => …, { dur, requires, why })`; anything that states a claim
gets `requires: ["source"]`. New pattern: `P(id, { name, scenario, principle, basis, needs }, (brief, opts) => scenes)`
in `patterns.js`, ending with the end card; add it to the README table and `test/adkit.test.mjs` still passes.
