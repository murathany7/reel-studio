# <Brand name>

> Copy this folder to `brands/<slug>/` (lowercase-kebab, e.g. `yuppo`, `bike-logger`) and fill every section.
> The `new-brand` skill walks through it. A brand is ready when every ❓ is gone.

## Who it is

| | |
|---|---|
| Product | (one line: what it is, for whom) |
| Website / store links | |
| Audience | (who watches; what they care about; where they scroll) |
| Positioning | (the one thing it does better) |
| Languages | (first language; later ones) |
| Platforms | Instagram Reels / TikTok / YouTube Shorts / Meta ads / … |

## Fact sources (never invent facts)

Where true product facts come from, in order of trust. Anything not found here is **not claimed**.

| Source | Path or URL | What it settles |
|---|---|---|
| e.g. app UI copy | `../<app-repo>/…` | feature names, exact wording |
| e.g. live website | | specs, prices |

## Look

| | |
|---|---|
| Colours | in `tokens.css` (name, hex, when to use) |
| Fonts | in `assets/fonts/` + `tokens.css` |
| Logo | `assets/logo.svg` (+ rules: clear space, min size, on dark/light) |
| Mascot / characters | (if any: files, engine — SVG rig, Lottie or Rive, what it may and may not do) |
| Assets for looks | (GLB/CAD models, product photos with alpha, footage: what each look can use) |
| References | `assets/reference/` (what to take from each) |

### Look range

The identity above goes into every piece. The art direction is picked per piece from `looks/` (see `looks/README.md`).

| | |
|---|---|
| Signature | (optional: the brand's own look, once it has one. One option, not the default) |
| Fits | (looks from `looks/` that suit the brand, and how its colours map into them) |
| Ask first | (looks that might work with care) |
| Never | (looks the brand's compliance or character rules out, and why) |

## Voice

- Sounds like: …
- Never sounds like: …
- Words we use / avoid: …
- Voiceover voice (ElevenLabs voice id, settings) and music mood: …

## Compliance

See `compliance.md`: what must never appear, claims that need a source, platform rules.
