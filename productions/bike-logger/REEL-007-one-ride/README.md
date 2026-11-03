# REEL-007 — One ride, one timeline (silent, 60 fps)

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel (+ landscape, banner) |
| Status | `QA passed` (draft for review) |
| Size / length | 1080×1920 · 16.2 s · 60 fps |
| Placement | Organic |
| Engines | Ad kit + the brand's ride, replay and street scenes |
| Sound | Silent |
| Approved by / date | Murathan, 2026-11-03, revised the same day (parts, not characters) |

## 2. Why this piece exists

| | |
|---|---|
| **Problem** | Sensor projects that each print their own log, and none of them line up |
| **Benefit** | Everything you wired is on one timeline: scrub once and every reading moves together |
| **Facts shown** | IMU: lean, potholes (acceleration). Ultrasonic: rear distance in metres. Hall: 1 pulse per turn. Dashboard and app: one timeline |

## 3. Hooks

| Var | Text |
|---|---|
| A | **Ride. Record. Replay.** |
| B | **Five sensors on one bike.** (adult: *Five sensors. One bike.*) |
| C | **Every sensor. One timeline.** |

## 4. Storyboard

| # | Time | Visual (all from the bike's own sensors) | Text |
|---|---|---|---|
| 1 | 0–2.2 | Night street, the bike rides in the bike lane; rear camera cone behind it, GPS arcs on the lid | Hook |
| 2 | 2.2–4.4 | Pothole under the wheels, the bike bumps; inset: the BNO085 tilting; a lamp marker drops on the timeline strip | `03 · IMU` *Logs every pothole.* |
| 3 | 4.4–6.5 | Inset: the BNO085 leans and recovers | *Feels every lean.* |
| 4 | 6.5–8.6 | A car comes from behind and overtakes with room; the rack's ultrasonic pings it; inset: the probe pinging; brake-red marker | `04 · Ultrasonic` *Logs every overtake.* |
| 5 | 8.6–10.6 | The Hall sensor on the seatstay glows each time the spoke magnet passes; inset: sensor and magnet | `05 · Hall sensor` *Counts every turn.* |
| 6 | 10.6–13.8 | Phone with the replay: video, map, lean, behind, speed; the playhead plays, scrubs back, plays | `Code it` *Scrub once. Everything moves.* |
| 7 | 13.8–16.2 | End card with IMU, ultrasonic, Hall sensor | **Bike Logger** · URL |

Riding follows the brand rules: right side of the lane, hands on the bars, the car overtakes with room. No distance numbers on screen; the replay's charts have no values.

## Revision 2026-11-03: real parts, no characters, 60 fps

The first cut drew the parts as cartoon characters (faces, arms, hops). Feedback: *"I don't want these weird
creatures. It should be bike and chips, always making sense and smooth."* So every part is now a flat drawing of the
real hardware (`brands/bike-logger/assets/cartoon/parts.js`, sheet `../REEL-006-crew/refs/parts.png`), and it only
moves the way the hardware works: the Pi's cooler spins and its LED blinks, the camera's 102° cone opens, the GPS
arcs pulse (or fade without a fix), the BNO085's axes lean with the board, the ultrasonic pings, the Hall sensor
glows when the spoke magnet passes. The bike carries the same sensors (rear camera cone, GPS on the lid, ultrasonic
at the rack, magnet on a spoke, Hall sensor on the seatstay) and they react to what happens on the road. Objects
don't bob, hop or wave; entrances rise and settle. Everything renders at 60 fps.

## Variants

One composition, 9 exports: style `fun` | `adult` × hook `A` | `B` | `C` at 9:16, plus website and feed sizes
(`landscape` 1920×1080 for site heroes and YouTube, `banner` 1200×628 for link ads and Open Graph, `square`
1080×1080), listed in `variants.json`. **Adult** = the same facts in a dry voice, with muted colours, ink outlines
and calmer motion.

- `export/manifest.md`: every file with its axes, length, size, fps and QA result. MP4s are not in git; they are in
  the gallery artifact (`../gallery-assets.json`).
- `qa/variants-sheet.jpg` (one cover per variant) and `qa/<name>/report.md`.

## 7. Rebuild

```bash
node scripts/variants.mjs productions/bike-logger/REEL-007-one-ride/variants.json --qa
node core/render.mjs video "productions/bike-logger/REEL-007-one-ride/composition/index.html?style=adult&hook=B&size=landscape" /tmp/REEL-007.mp4
```
