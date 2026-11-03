# REEL-011 — The box in 3D (Three.js, silent, 60 fps)

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel (+ landscape, square, banner) |
| Status | `QA passed` (draft for review) |
| Size / length | 1080×1920 · 11.8 s · 60 fps |
| Engines | Three.js (`engines/three.js`: toon + ink outline) in `brands/bike-logger/assets/cartoon/box3d.mjs`, ad kit for text and the end card. Frames md5-stable |
| Looks | illustrated (toon), daylight |
| Approved by / date | Direction asked for on 2026-11-03; review before publishing |

## Storyboard

| Time | Visual | Text |
|---|---|---|
| 0–2.6 | The closed IP65 box at its real proportions (200 × 120 × 75 mm), GPS puck on the lid, slow orbit from above | Hook: *Open the box.* · *Sealed outside. A Pi inside.* (eyebrow IP65 · 200 × 120 × 75 mm) · *One Pi. One sealed box.* |
| 1.6–2.7 | The lid swings open on its back hinge; warm light inside | |
| 2.6–5.0 | Push in from above: the Raspberry Pi 5 on its tray, GPIO header, USB and Ethernet ports, the active cooler spinning up | *A Raspberry Pi 5.* · 8 GB · active cooler |
| 5.0–7.4 | Still closer; the camera module's lens at the sealed window in the wall | *Cooler on. Camera at the window.* |
| 7.4–9.4 | Pull back and keep orbiting | *Nothing changes but the rack.* |
| 9.4–11.8 | End card with the Pi, GPS and camera | **Bike Logger** · URL |

Facts: IP65, 200 × 120 × 75 mm, Raspberry Pi 5 8 GB with active cooler, Camera Module 3 Wide behind a sealed
window, USB GPS antenna up, "Nothing changes but the rack" (brand README, live page). The model is simplified, not CAD.

## Rebuild

```bash
node scripts/variants.mjs productions/bike-logger/REEL-011-box3d/variants.json --qa
```
