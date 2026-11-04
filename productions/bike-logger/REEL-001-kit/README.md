# REEL-001 — Robotics starter kit (silent)

> Made 2026-11-02 in `../marketing-reels-skill/side-projects/bike-logger-kit/` before this repo existed, then moved
> here: composition ported to `core/` + `brands/bike-logger/tokens.css`, capture ported to `capture/drive.mjs`.
> **v2 (2026-11-02): sharper.** The original capture was soft from 1.5 s on: the site drops its 3D resolution from
> 2x to 1.5x when its first frames look slow, and the capture's 1/30 s steps always looked slow. The drive module now
> settles at 1/60 s steps and checks the canvas resolution; the plate, export and cover were re-made from it.

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel |
| Status | `delivered` |
| Size | 1080×1920 (9:16) |
| Frame rate / length | 30 fps · 28 s |
| Language | EN |
| Placement | Organic (copy inside the organic Reels safe zone; for paid placements the bottom lines fall in Meta's 35% caption zone) |
| Look | signature (night stage, mono eyebrow, wide headline, spec chips, lamp glow); recorded 2026-11-04 |
| Engines | Page capture of the live site's 3D scene (the real CAD parts, already built) + GSAP copy on top |
| Sound | Silent: all meaning carried by on-screen text |
| Approved by / date | Murathan, 2026-11-02 |

## 1. Brief

- **Request:** a reel selling Bike Logger as a **robotics starter kit**: you learn by wiring five real sensors to a Raspberry Pi.
- **Reference:** the live page <https://murathanyildirim.com/bike-logger> (its scene, type and colours).
- **Must avoid:** claims the page does not make (see *Fact check*).

## 2. Why this piece exists

| | |
|---|---|
| **Problem it solves** | Learning robotics from kits that end in a blinking LED; wanting to build something real that you use |
| **Benefit / takeaway** | One build teaches five sensors, a camera and the code that ties them into one replay |
| **Product fact shown** | The five sensors and the synced replay, from the live page |
| **Hook** | "ROBOTICS STARTER KIT · Build your own ride recorder." over the headlight switching on |
| **CTA** | murathanyildirim.com/bike-logger |
| **Success metric** | Hook rate, saves, link taps |

## 4. Storyboard

| Time | Scene (from the site) | On-screen copy |
|---|---|---|
| 0–3.0 | Dark road, the headlight comes on | ROBOTICS STARTER KIT · **Build your own ride recorder.** |
| 3.6–7.4 | The box opens, the tray rises out | THE BRAIN · **One Pi. One sealed box.** · Raspberry Pi 5 / GPS / BNO085 / 3D-printed tray |
| 8.0–10.6 | Rear camera view cone | 01 · CAMERA · **Wire up a rear camera.** · Camera Module 3 Wide / 102° view |
| 11.2–15.2 | A car overtakes, ultrasonic pings, live BEHIND readout | 02 · ULTRASONIC · **Measure every overtake.** · How close the car came / in metres |
| 15.8–18.2 | Wheel close-up, Hall sensor + spoke magnet, SPEED readout | 03 · HALL SENSOR · **Count every wheel turn.** · A3144 + spoke magnet / Speed without GPS |
| 18.8–21.2 | The bike leans, LEAN readout | 04 · 9-AXIS IMU · **Feel every lean.** · BNO085 / Lean / Pitch / Acceleration |
| 21.8–24.4 | Replay dashboard: video, km/h, lean, behind | 05 · CODE IT · **Every sensor. One timeline.** |
| 24.7–28 | Hero shot, dimmed | End card: **Bike Logger** · "Turn any city bike into a rolling robotics lab." · parts line · URL |

### ✅ Approval

- [x] Storyboard approved.

## 5. Production log

| Step | Output | Notes |
|---|---|---|
| Plate | `composition/scene.mp4` | Live page captured frame by frame (`capture/drive.mjs`) at full 2x resolution, 1080×1920, every frame a keyframe. 28 s captures in ≈75 s |
| Composition | `composition/index.html` | GSAP word-by-word reveals; `BEATS` matched to `SHOTS` in `capture/drive.mjs` |
| Render | `export/REEL-001-kit-en.mp4`, `export/cover.png` | 142 s for 840 frames |
| QA | `qa/report.md` | Specs ✅, 30 fps CFR ✅, no hitches, no jumps, no frozen or black sections. No audio ⚠️ (silent by design) |

## 6. Fact check

| Claim | Source |
|---|---|
| Raspberry Pi 5, GPS, BNO085, 3D-printed tray, sealed box | Live page, "Everything inside" and "What's in it" |
| Camera Module 3 Wide, 102° view | Live page, Camera chapter |
| Ultrasonic, how close the car came, in metres | Live page, "Every overtake" |
| A3144 + spoke magnet, speed without GPS | Live page, "Every turn" |
| BNO085 lean, pitch, acceleration | Live page, "Every lean" |
| One timeline | Live page, "One timeline" |
| Runs offline | Live page, footer |

**Not claimed, because the page doesn't say it:** price, what ships in the box, age range, skill level,
"no soldering", programming language, battery life. "Robotics starter kit" is the chosen positioning and "Code it"
says the software is part of the build. Before paid use, confirm the kit contents and add a price or
"what's included" line if wanted.

## 7. Rebuild

```bash
# 1. capture the live 3D scene (needs Chrome with GPU and network)
node engines/capture.mjs https://murathanyildirim.com/bike-logger /tmp/bl-frames \
  --duration 28 --size 540x960 --scale 2 --drive productions/bike-logger/REEL-001-kit/capture/drive.mjs
ffmpeg -framerate 30 -i /tmp/bl-frames/f_%05d.png -c:v libx264 -preset slow -crf 12 -pix_fmt yuv420p -g 1 \
  productions/bike-logger/REEL-001-kit/composition/scene.mp4
# 2. render the overlay (no --audio: the output is silent)
node core/render.mjs video productions/bike-logger/REEL-001-kit/composition/index.html \
  productions/bike-logger/REEL-001-kit/export/REEL-001-kit-en.mp4
scripts/qa-video.sh productions/bike-logger/REEL-001-kit/export/REEL-001-kit-en.mp4 productions/bike-logger/REEL-001-kit/qa
```

`scene.mp4` and the export are gitignored (large media): keep them locally or rebuild them.
