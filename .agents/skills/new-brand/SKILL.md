---
name: new-brand
description: Set up a new brand (product, app, side project) in brands/<slug>/ so videos can be made for it - facts and their sources, look (colours, fonts, logo, mascot), voice, compliance and default engines. Use before the first video for a brand, or when asked to add a brand.
---

# Adding a brand

1. `cp -R brands/_template brands/<slug>` (lowercase-kebab).
2. **Collect from the source, never from memory.** Website, app repo (UI copy, theme colours, fonts, assets), store
   listing, existing ads. Ask the user for what is not findable. Record each source in *Fact sources*.
3. Fill `README.md`: who it is, audience, positioning, identity (colours, fonts, logo, mascot), voice, and its
   *Look range*: which looks in `looks/` fit it, which need care, which its character or compliance rules out, and how
   its colours map into them. Keep identity and art direction apart: the brand folder never fixes one layout, type
   style or motion for every piece. Copy logo, fonts and reference
   images into `assets/` (convert SVG logos to PNG with `scripts/svg-to-png.sh` when needed).
4. Fill `tokens.css` with the real colours and fonts (and the optional tokens looks use when the brand has them:
   `--accent-2`, `--accent-3`, `--font-serif`, `--font-mono`, `--font-display-heavy`…, `looks/README.md`). Check by rendering a quick still: a stage with the logo, the
   colours as swatches and a headline in each font. Look at it.
5. Fill `compliance.md`: keep the *Always* list, add the brand's own rules (sector rules, claims that need sources,
   what the mascot may not do).
6. Add the brand to `STATUS.md` (*Brands*) with any open questions, and to the brand table in `README.md`.

5b. Render the brand in two or three looks from its *Fits* list (each look's starter with the brand's tokens) and look
   at them: each should read as this brand and as a clearly different look. Save them in `assets/reference/looks/`.

A brand is ready when no ❓ or placeholder is left and the check still looks right.
