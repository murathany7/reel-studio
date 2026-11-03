# Bike Logger

A ride recorder for a city bike: a Raspberry Pi 5 in a sealed box under the rack records GPS, motion, wheel speed,
the distance of cars behind and a rear camera, then replays the whole ride on one synced timeline.
A side project of Murathan Yıldırım, not a company product.

## Who it is

| | |
|---|---|
| Product | Bike Logger: records the whole ride (camera, GPS, lean, rear distance, wheel speed) and replays it on one timeline |
| Website | <https://murathanyildirim.com/bike-logger> (source: `../bikelog/site/`) |
| Audience | **Robotics kit learners** (decided 2026-11-02): people who want to learn hardware and code by building something real, wiring five sensors to a Raspberry Pi and seeing them work on their own bike. Not city cyclists shopping for a safety device |
| Positioning | A **robotics starter kit** with a real result: build your own ride recorder. The payoff they see is the synced replay (video, map, lean, rear distance and speed on one scrubber), which shows every sensor they wired working together |
| Angle in every piece | Learning by building: each sensor is a skill (wire it, read it, code it), the box is something you made. Show the build and the parts, then the working replay |
| Languages | English |
| Platforms | Instagram Reels (first reel: 9:16, silent) |

## Fact sources (never invent facts)

| Source | Path or URL | What it settles |
|---|---|---|
| Live page | <https://murathanyildirim.com/bike-logger>, source `../bikelog/site/index.html` | Chapter copy, the "What's in it" spec list, public wording |
| Repo README | `../bikelog/README.md` | What the software does: dashboard, phone app, two cameras |
| Hardware notes | `../bikelog/hardware/README.md`, `../bikelog/hardware/CLAUDE.md` | Box, tray, parts, fits |
| Product notes | `../bikelog/PRODUCT_ASSESSMENT.md` | Strategy only. Its prices and market figures are "rough and from memory": **never use them on screen** |

### Facts that can be shown (from the live page)

| Part | Fact |
|---|---|
| Brain | Raspberry Pi 5, 8 GB, active cooler |
| Camera | Camera Module 3 Wide, 102° across, rear-facing, sealed window, aimed by hand |
| Position | USB GPS, u-blox, antenna up |
| Motion | BNO085, 9-axis: lean, pitch, acceleration ("corners, potholes, hard brakes") |
| Behind | Ultrasonic, waterproof probes, logged in metres with the video |
| Wheel | A3144 Hall sensor, spoke magnet on the left seatstay, 1 pulse per turn: speed and distance even without GPS |
| Enclosure | IP65 box, 200 × 120 × 75 mm |
| Tray | 3D-printed ASA+, parametric CAD |
| Power | 20 000 mAh, 45 W, own housing |
| Software | Dashboard and phone app (Android and iPhone): one timeline, scrub once and everything moves together |
| Privacy | Runs offline. "Your rides stay with you." |
| Bike shown | Gazelle Vento C7, 28″ ("Nothing changes but the rack") |

### Not claimed (no source says it)

Price, what ships in a kit, age range, skill level, "no soldering", battery life in hours, crash detection,
anything about other people's bikes. Ask before using any of these.

## Look

| | |
|---|---|
| Colours | `tokens.css`: night `#06080a` (background), ink `#eceae4` (text), dim `#868d95` (secondary), line `#262b31` (borders), **lamp `#ffc46e`** (headlight, CTA), **signal `#84dcff`** (labels, data), **brake `#ff4a3d`** (warnings, close passes) |
| Fonts | **Archivo** (variable, width 62–125, weight 300–900) for display; **IBM Plex Mono** 400/500 for labels and data. Loaded from Google Fonts in `tokens.css` |
| Logo | No logo file. The wordmark is "Bike Logger" set in Archivo 900 at width 125, ink on night |
| Mascot / characters | **None, by decision (2026-11-03): no characters, ever.** The parts appear as flat drawings of the real hardware (`assets/cartoon/parts.js`, sheet `productions/bike-logger/REEL-006-crew/refs/parts.png`) and move only the way the hardware works. Two looks: `fun` (brand colours) and `adult` (muted, thin ink outlines). Off-palette colours allowed for realism: PCB green `#2f8f5b`, BNO085 board purple `#6b4fc9` |
| Type style | Big, wide, heavy headlines (`.display`, wdth 125) with tight leading; mono eyebrow above in signal blue, uppercase, letter-spaced; spec chips in mono with a thin line border |
| Illustrated world | `assets/cartoon/bike.js`: side-view bike + rider (hands on the bars, right side of a bike lane) carrying the real sensors (rear camera cone, GPS on the lid, ultrasonic at the rack, magnet on a spoke, Hall sensor on the seatstay that pulses once per real wheel turn), street, cars overtaking with room; scenes `boxHook`, `ride`, `replay`, `tunnel`. `brief.js`: the ad-kit brief in both voices. `theme.css`. Motion: objects rise and settle, never hop or wave; 60 fps |
| Default engines | **Page capture** of the live 3D scene (real CAD parts) + GSAP text. **Three.js** with the real meshes for new angles. **Replay plates** from real ride data |
| References | `assets/reference/kit-reel-cover.png`: the first reel's cover (what the brand looks like in a reel) |

### Visual sources to reuse

| Source | Path | Use |
|---|---|---|
| Live 3D scene | the website, via the `capture-site` skill | Box opening, sensors, car overtaking, lean, replay. Shot table and drive logic: `productions/bike-logger/REEL-001-kit/capture/drive.mjs` |
| CAD meshes | `../bikelog/site/parts.js` (packed for the site), `../bikelog/hardware/cad/out/preview/*.json` | Three.js scenes with the real tray, camera housing, ultrasonic box, wheel sensor |
| Ride replay video | `python3 ../bikelog/site/video/render.py --data <data> --ride <n>` | Real camera + map + charts on one timeline (1920×1080; crop or frame for 9:16) |

## Voice

- Sounds like: an engineer showing their build. Short, concrete, physical. "One Pi. One sealed box." "Every overtake."
- Pattern: a mono eyebrow names the part (`03 · HALL SENSOR`), a 2–4 word headline says what it does, chips give the spec.
- Never sounds like: hype, safety fear, "revolutionary", "AI-powered", exclamation marks.
- Words we use: build, wire up, code it, ride, record, replay, one timeline, sealed, real CAD. Avoid: "smart", "dashcam" (it is more than a camera), "easy" or "for beginners" (skill level is not confirmed).
- Sound: the first reel is silent. No voice chosen yet.

## Compliance

See `compliance.md`.
