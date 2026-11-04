# <ID> — <working title>

> Copy this folder to `productions/<brand>/<ID>-<slug>/` (e.g. `productions/bike-logger/REEL-001-kit`).
> This README is the **storyboard for approval** first, then the **explainer** shipped with the final files.

| Field | Value |
|---|---|
| Brand | `brands/<slug>/` |
| Type | Reel / video ad / Story · Post · Carousel |
| Status | `brief` → `storyboard (awaiting approval)` → `approved` → `in production` → `QA passed` → `delivered` → `published` |
| Size | 1080×1920 (9:16) · 1080×1350 (4:5) · *other if requested* |
| Frame rate / length | 30 fps · __ s |
| Language | |
| Placement | organic / paid / both |
| Look | `looks/<look>` (picked from the directions in section 0) |
| Engines | GSAP + … (and why, from `engines/README.md`) |
| Sound | VO + music · music only · silent (all meaning on screen) |
| Approved by / date | |

## 0. Directions (pick one)

`node scripts/looks.mjs <brand>` lists the looks the brand already used. Pitch 2–3 that differ from each other; at
least one the brand's last two pieces did not use. Style frame: the look's starter with the brand's tokens and the
real hook (`qa/directions/<look>.png`).

| | Look | Why it fits this brief | Style frame |
|---|---|---|---|
| A | | | |
| B | | | |
| C | | | |

**Picked:** … (by the person, in chat or the desk)

## 1. Brief

- **Request:**
- **Reference images / videos:** `refs/…` (what to take from each: layout, mood, colour, pacing)
- **Must include / must avoid:**

## 2. Why this piece exists

| | |
|---|---|
| **Problem it solves** | (the viewer's moment, in their words) |
| **Benefit / takeaway** | |
| **Product fact shown** | (and its source from the brand's fact list) |
| **Hook(s)** | |
| **CTA** | |
| **Success metric** | hook rate / saves / shares / CTR / installs |

## 3. Hook variants

| Var | On-screen text | First spoken line | Opening visual |
|---|---|---|---|
| A | | | |
| B | | | |
| C | | | |

## 4. Storyboard (for approval)

| # | Time | Visual & motion (engine) | On-screen text | VO / sound | Notes (safe zone, assets) |
|---|---|---|---|---|---|
| 1 | 0.0–1.5 s | | | | |
| 2 | | | | | |
| end | | End card | | | |

**Voiceover script:**
> …

**Music / SFX plan:**

**Caption + hashtags:**
> …

### ✅ Approval

- [ ] Storyboard approved. *No production before this box is ticked.*
- Requested changes:

## 5. Production log

| Step | Output | Notes |
|---|---|---|
| Plates (Blender / capture) | `composition/plates/…` | command used |
| VO / SFX / music | `audio/…` | voice, prompt |
| Mix | `audio/mix.wav` (`audio/cues.json`) | |
| Composition | `composition/index.html` | |
| Render | `export/<ID>-<lang>.mp4` / `.png` | |
| QA | `qa/report.md` | hitches / jumps / safe zone / loudness, frame review notes |

## 6. Fact check

| Claim on screen or in VO | Source |
|---|---|
| | |

**Not claimed, because no source says it:** …

## 7. Rebuild

```bash
# exact commands to rebuild every output from this folder
```
