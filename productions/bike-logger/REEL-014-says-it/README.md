# REEL-014 — Says it (test)

A **test, not for posting yet**: REEL-008's approved visuals with the hit-reel findings applied (`make-video`,
*What makes a reel work*), so the two can be watched side by side and the difference is the voice, captions, pacing
and loop, not the look.

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel |
| Status | `test render, QA passed` (made on request "play with it more", 2026-11-04; no storyboard approval, so not deliverable). 12.7 MB, 12.6 Mbit/s; text QA no ❌ (spec chips 32 px warn), video QA ✅ (true peak −0.9 dBTP warn) |
| Size | 1080×1920 (9:16) |
| Frame rate / length | 30 fps · 18 s (9 bars at 120 BPM) |
| Language | English |
| Placement | organic |
| Look | `looks/neon-noir`, a deliberate variant of REEL-008 (same composition, changed) |
| Engines | Three.js (real CAD as neon edges) + GSAP + SVG HUD, as REEL-008 |
| Sound | AI VO (Kokoro `am_michael`, local, `scripts/voice.py`) + REEL-008's synth bed at 120 BPM + SFX |
| Voice / face | AI voice, first person (to be disclosed, or replaced by the maker's own recording) · no face |

## Hit check

| Hook in 1 s | Voice | Face | Real product | Change ≤ 1.5 s | Worth sending | Captions | Loops | Clean images | Original |
|---|---|---|---|---|---|---|---|---|---|
| ✅ "My bike remembers every ride." spoken from 0.05 s | ✅ AI | ❌ none (brand has no mascot; the maker on camera would fix it) | ✅ real CAD | ✅ a cut every 1 s (two angles per shot) | ➖ better than a feature list, still a tour of parts | ✅ captions are the headline | ✅ end card over the corridor of frame 0 | ✅ grain 0.03, scanlines 0.14 | ✅ |

## Script

| Time | Picture | Voice (= caption) | Chips |
|---|---|---|---|
| 0–2 | Neon corridor, REC eyebrow | My bike remembers every ride. | |
| 2–4 | Tray, Pi lit; cut to a closer angle at 3 s | One Pi. One sealed box. | 8 GB · IP65 · 200 × 120 × 75 mm |
| 4–6 | Camera housing, 102° wedge | A wide camera, looking behind. | 102° wide · rear-facing · sealed window |
| 6–8 | Tray, GPS lit, route draws | GPS knows where I went. | u-blox · antenna up |
| 8–10 | Tray leans, horizon tilts | A motion sensor feels every lean. | 9-axis · lean · pitch · acceleration |
| 10–12 | Wheel sensor, magnet pulses | A magnet counts every wheel turn. | 1 pulse per turn · speed without GPS |
| 12–14 | Ultrasonic box, sonar arcs | Sonar measures the gap behind. | waterproof probes · logged in metres · with the video |
| 14–16 | Five lanes, one scrubber | Scrub once. Everything moves. | dashboard · Android + iPhone app |
| 16–18 | Wordmark over the corridor | Wire it yourself. Bike Logger. | runs offline · URL |

## Fact check

Every line is from the brand README's *Facts that can be shown*: Pi 5 in an IP65 box (200 × 120 × 75 mm), Camera
Module 3 Wide 102° rear-facing, USB GPS u-blox, BNO085 lean/pitch/acceleration, A3144 Hall + spoke magnet 1 pulse per
turn, ultrasonic distance of what's behind ("sonar": plain word for ultrasonic ranging), one timeline ("scrub once
and everything moves together"), runs offline. "Remembers every ride" = records the whole ride. "Wire it yourself" =
the robotics-kit angle (no claim about kit contents or skill level). Compliance: AI voice must be disclosed if posted.

## Rebuild

```sh
python3 scripts/voice.py productions/bike-logger/REEL-014-says-it/audio/script.json productions/bike-logger/REEL-014-says-it/audio/vo
python3 productions/bike-logger/REEL-014-says-it/audio/make_music.py
python3 scripts/mix_audio.py productions/bike-logger/REEL-014-says-it/audio/cues.json productions/bike-logger/REEL-014-says-it/audio/mix.wav
node core/render.mjs video productions/bike-logger/REEL-014-says-it/composition/index.html productions/bike-logger/REEL-014-says-it/export/REEL-014-says-it-en.mp4 --audio productions/bike-logger/REEL-014-says-it/audio/mix.wav
```
