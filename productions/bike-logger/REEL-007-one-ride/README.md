# REEL-007 — One ride, one timeline (cartoon, silent)

> Approved 2026-11-03 and produced. Second of the cartoon series; same cast as REEL-006 (`../REEL-006-crew/refs/cast.png`).

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel |
| Status | `QA passed` (draft for review; see *Variants*) |
| Size | 1080×1920 (9:16) |
| Frame rate / length | 30 fps · 16 s |
| Language | EN |
| Placement | Organic (`.safe-organic`) |
| Engines | **SVG + GSAP** for a side-on cartoon city ride (bike, box on the rack, crew peeking out, parallax street in 3 layers). **SVG rig** for the crew. **Pixi** only for seeded road dashes and speed lines (cheap, many sprites, a pure function of `t`) |
| Sound | Silent |
| Approved by / date | Murathan, 2026-11-03 ("yeah do it"; cast, names and the two off-palette colours approved with it) |

## 1. Brief

- **Request:** cartoony videos of Bike Logger (2026-11-03). This one sells the payoff: the synced replay.
- **Must avoid:** safety promises, close-pass numbers, phone in hand, riding against traffic (`compliance.md`).

## 2. Why this piece exists

| | |
|---|---|
| **Problem it solves** | Sensor projects that each print their own log, and none of them line up |
| **Benefit / takeaway** | Everything you wired is on one timeline: scrub once and every reading moves together |
| **Product fact shown** | Dashboard / phone app, one timeline; lean, rear distance, wheel speed (brand fact list) |
| **Hook** | A cartoon bike rides in; the box lid lifts and five pairs of eyes look out |
| **CTA** | murathanyildirim.com/bike-logger |
| **Success metric** | Hook rate, watch-through, link taps |

## 3. Hook variants

| Var | On-screen text | Opening visual |
|---|---|---|
| A | **Ride. Record. Replay.** | Bike rolls in from the left, crew peeks out of the box |
| B | **Your bike has a crew.** | Close on the box under the rack, lid lifts, eyes blink |
| C | **Every sensor. One timeline.** | The replay scrubber first, then rewind into the ride |

## 4. Storyboard (for approval)

| # | Time | Visual & motion (engine) | On-screen text | Notes |
|---|---|---|---|---|
| 1 | 0.0–2.2 | Flat night street, a city bike with the box on the rear rack rolls in (SVG, GSAP parallax, Pixi road dashes). Lid lifts, the crew's eyes look out | **Ride. Record. Replay.** | Rider on the right side of a bike lane, hands on the bars |
| 2 | 2.2–4.4 | Pothole: the bike hops, **Tilt** bounces in the box; a lamp "bump" tick drops onto a timeline strip at the bottom | 03 · IMU · **Logs every pothole.** | Timeline strip sits above the 22 % bottom zone |
| 3 | 4.4–6.6 | Corner: the whole bike leans, **Tilt** leans with it; a lean gauge swings | **Feels every lean.** | |
| 4 | 6.6–9.0 | A cartoon car overtakes on the left with room to spare; **Ping**'s arcs bounce off it; a brake-red band marks the moment on the strip | 04 · ULTRASONIC · **Logs every overtake.** · `in metres` | No number; car overtakes legally |
| 5 | 9.0–10.8 | Wheel close-up: **Spin** counts magnet passes, counter ticks | **Counts every turn.** | |
| 6 | 10.8–13.6 | Cut to a cartoon phone (no hand) with the replay: video, map, lean, behind, speed. A finger-free playhead scrubs back; the street scene above rewinds in sync, the crew all point at the same moment | 05 · CODE IT · **Scrub once. Everything moves.** | The payoff beat |
| 7 | 13.6–16.0 | End card: the crew waves from the box | **Bike Logger** · Build your own ride recorder. · `murathanyildirim.com/bike-logger` | |

**Caption + hashtags:**
> Five sensors and a camera, one sealed box, one timeline. Scrub the replay and the video, map, lean, rear distance
> and speed all move together. #robotics #raspberrypi #maker #cycling #embedded

### ✅ Approval

- [x] Storyboard approved 2026-11-03.
- Requested changes: also make **adult versions, still cartoony** → every piece renders in a second style (below).

## 6. Fact check (planned)

| Claim on screen | Source |
|---|---|
| Lean, potholes (acceleration) from the IMU | Brand README *Facts*: BNO085 "corners, potholes, hard brakes" |
| Rear distance logged in metres with the video | same |
| Wheel turns counted | same: A3144, 1 pulse per turn |
| One timeline, scrub once and everything moves | same: Software |

**Not claimed:** close-pass numbers, safety, "dashcam", price, skill level.

## Variants (2026-11-03)

One composition, six exports: style `fun` | `adult` × hook `A` | `B` | `C` (section 3). The **adult** style is
the same story and facts for a grown-up audience: the crew's adult drawing (ink outlines, half-lidded deadpan eyes,
muted colours), no squash/overshoot or flashes, dry copy (e.g. "Takes every corner personally.").

- Composition: `composition/index.html` (reads `?style=&hook=&size=`), built on the ad kit (`engines/ad-kit`) and
  the brand's cartoon world (`brands/bike-logger/assets/cartoon/`).
- Matrix: `variants.json` → `export/manifest.md` (files, lengths), `qa/variants-sheet.jpg`, `qa/<name>/report.md`.
- The MP4s are not in git (`*.mp4` is ignored); they live in the Artifact gallery linked from `STATUS.md`.

## 7. Rebuild

```bash
node scripts/variants.mjs productions/bike-logger/REEL-007-one-ride/variants.json --qa
node core/render.mjs video "productions/bike-logger/REEL-007-one-ride/composition/index.html?style=adult&hook=B" /tmp/REEL-007.mp4
```
