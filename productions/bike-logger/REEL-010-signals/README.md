# REEL-010 — Five signals (data look, silent, 60 fps)

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel (+ landscape, square) |
| Status | `QA passed` (draft for review) |
| Size / length | 1080×1920 · 12.4 s · 60 fps |
| Engines | Ad kit + `brands/bike-logger/assets/cartoon/signals.js` (SVG traces redrawn from t on every frame) |
| Looks | illustrated (night), blueprint, daylight |
| Approved by / date | Direction asked for on 2026-11-03 ("do different variants, more different variants the better"); review before publishing |

## Why

| | |
|---|---|
| **Problem** | Five sensors, five logs, nothing lines up |
| **Benefit** | One clock: the same moment sits on every line, which is what the replay shows |
| **Facts** | Camera, GPS, BNO085 (lean, acceleration), ultrasonic (behind), Hall (1 pulse per turn); speed and distance without GPS; one timeline |

## Storyboard

| Time | Visual | Text |
|---|---|---|
| 0–2.4 | Rows appear one by one: CAMERA (frames), GPS (fixes), IMU (lean + acceleration), ULTRASONIC (behind), HALL (square-wave pulses) scrolling past a playhead with a clock | Hook: *Five sensors. One clock.* · *What your bike feels.* (adult: *Your ride, as data.*) · *Every line is a sensor.* |
| 2.4–4.8 | A pothole: a spike on acceleration, a band across all rows labelled POTHOLE | *Each one writes its own line.* |
| 4.8–7.4 | A car from behind: the ultrasonic dips, the camera frames turn red, band OVERTAKE | *A pothole. A car. A tunnel.* |
| 7.4–10 | A tunnel: GPS fixes go hollow while the Hall pulses keep coming, band TUNNEL | *Same moment, every line.* |
| 10–12.4 | End card | **Bike Logger** · URL |

The ride is simulated: shapes only, no values, units or rates on screen (the camera's and GPS's sample rates are
not in the fact list, so the spacing is illustrative).

## Rebuild

```bash
node scripts/variants.mjs productions/bike-logger/REEL-010-signals/variants.json --qa
```
