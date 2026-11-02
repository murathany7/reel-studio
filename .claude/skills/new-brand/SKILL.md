---
name: new-brand
description: Set up a new brand (product, app, side project) in brands/<slug>/ so videos can be made for it - facts and their sources, look (colours, fonts, logo, mascot), voice, compliance and default engines. Use before the first video for a brand, or when asked to add a brand.
---

# Adding a brand

1. `cp -R brands/_template brands/<slug>` (lowercase-kebab).
2. **Collect from the source, never from memory.** Website, app repo (UI copy, theme colours, fonts, assets), store
   listing, existing ads. Ask the user for what is not findable. Record each source in *Fact sources*.
3. Fill `README.md`: who it is, audience, positioning, look, voice, default engines. Copy logo, fonts and reference
   images into `assets/` (convert SVG logos to PNG with `scripts/svg-to-png.sh` when needed).
4. Fill `tokens.css` with the real colours and fonts. Check by rendering a quick still: a stage with the logo, the
   colours as swatches and a headline in each font. Look at it.
5. Fill `compliance.md`: keep the *Always* list, add the brand's own rules (sector rules, claims that need sources,
   what the mascot may not do).
6. Add the brand to `STATUS.md` (*Brands*) with any open questions, and to the brand table in `README.md`.

A brand is ready when no ❓ or placeholder is left and the check still looks right.
