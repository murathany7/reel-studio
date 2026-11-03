# REEL-008 — The tunnel (cartoon gag, silent)

> Approved 2026-11-03 and produced. Third of the cartoon series; same cast as REEL-006 (`../REEL-006-crew/refs/cast.png`).
> A short gag built on one fact: the Hall sensor gives speed and distance even without GPS.

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel |
| Status | `QA passed` (draft for review; see *Variants*) |
| Size | 1080×1920 (9:16) |
| Frame rate / length | 30 fps · 11 s |
| Language | EN |
| Placement | Organic (`.safe-organic`); short enough for paid too if the copy moves into `.safe` |
| Engines | **SVG rig + GSAP** (reuses REEL-007's street and bike). No other engine needed |
| Sound | Silent |
| Approved by / date | Murathan, 2026-11-03 ("yeah do it"; cast, names and the two off-palette colours approved with it) |

## 2. Why this piece exists

| | |
|---|---|
| **Problem it solves** | GPS-only projects that lose speed and distance under bridges and in tunnels |
| **Benefit / takeaway** | A second sensor that doesn't need the sky: you learn why real systems carry a backup |
| **Product fact shown** | A3144 Hall + spoke magnet, 1 pulse per turn: speed and distance even without GPS |
| **Hook** | "GPS just went dark." as the bike rolls into a tunnel |
| **CTA** | murathanyildirim.com/bike-logger |

## 3. Hook variants

| Var | On-screen text | Opening visual |
|---|---|---|
| A | **Tunnel ahead.** | Tunnel mouth growing on the right, Fix's arcs full |
| B | **No sky, no GPS.** | Fix's arcs fading to grey one by one |
| C | **Who keeps count in the dark?** | Black frame, only Spin's lamp pulse blinking |

## 4. Storyboard (for approval)

| # | Time | Visual & motion (engine) | On-screen text |
|---|---|---|---|
| 1 | 0.0–2.0 | Bike rides toward a tunnel; **Fix** sits on the box with full signal arcs | **Tunnel ahead.** |
| 2 | 2.0–4.2 | Inside: the frame goes dark except the tunnel lamps; Fix's arcs grey out one by one, its eyes go wide, a `NO FIX` tag over it | 02 · GPS · **Signal gone.** |
| 3 | 4.2–7.4 | **Spin** taps Fix on the shoulder, then keeps counting: magnet passes flash lamp pulses, a speed readout keeps updating, an odometer keeps rolling | 05 · HALL SENSOR · **The wheel still counts.** · `A3144` `spoke magnet` `1 pulse per turn` |
| 4 | 7.4–9.0 | Out into the light: Fix's arcs come back, Fix and Spin high-five | **Speed and distance, even without GPS.** |
| 5 | 9.0–11.0 | End card | **Bike Logger** · Build your own ride recorder. · `murathanyildirim.com/bike-logger` |

The speed readout shows `km/h` ticking as an illustration with no specific value claimed (or blank digits, if
preferred). The odometer counts turns, not a distance figure.

**Caption + hashtags:**
> GPS can't see through a tunnel roof. A Hall sensor and one spoke magnet keep counting wheel turns, so speed and
> distance don't stop. #robotics #raspberrypi #sensors #maker #bike

### ✅ Approval

- [x] Storyboard approved 2026-11-03.
- Requested changes: also make **adult versions, still cartoony** → every piece renders in a second style (below).

## 6. Fact check (planned)

| Claim on screen | Source |
|---|---|
| Speed and distance even without GPS; A3144; spoke magnet; 1 pulse per turn | Brand README *Facts* (live page) |
| USB GPS | same |

**Not claimed:** how far, how fast, battery life, safety.

## Variants (2026-11-03)

One composition, six reels (style `fun` | `adult` × hook `A` | `B` | `C`, section 3) plus website and feed sizes:
`landscape` 1920×1080 (site hero, YouTube), `banner` 1200×628 (link ads, Open Graph) and `square` 1080×1080, listed
in `variants.json` → `include`. The **adult** style is
the same story and facts for a grown-up audience: the crew's adult drawing (ink outlines, half-lidded deadpan eyes,
muted colours), no squash/overshoot or flashes, dry copy (e.g. "Takes every corner personally.").

- Composition: `composition/index.html` (reads `?style=&hook=&size=`), built on the ad kit (`engines/ad-kit`) and
  the brand's cartoon world (`brands/bike-logger/assets/cartoon/`).
- Matrix: `variants.json` → `export/manifest.md` (files, lengths), `qa/variants-sheet.jpg`, `qa/<name>/report.md`.
- The MP4s are not in git (`*.mp4` is ignored); they live in the Artifact gallery linked from `STATUS.md`.

## 7. Rebuild

```bash
node scripts/variants.mjs productions/bike-logger/REEL-008-tunnel/variants.json --qa
node core/render.mjs video "productions/bike-logger/REEL-008-tunnel/composition/index.html?style=adult&hook=B&size=landscape" /tmp/REEL-008.mp4
```
