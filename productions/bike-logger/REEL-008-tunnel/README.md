# REEL-008 — The tunnel (silent, 60 fps)

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel (+ landscape, banner, square) |
| Status | `QA passed` (draft for review) |
| Size / length | 1080×1920 · 11.2 s · 60 fps |
| Placement | Organic; short enough for paid |
| Engines | Ad kit + the brand's tunnel scene |
| Sound | Silent |
| Approved by / date | Murathan, 2026-11-03, revised the same day (parts, not characters) |

## 2. Why this piece exists

| | |
|---|---|
| **Problem** | GPS-only projects lose speed and distance under bridges and in tunnels |
| **Benefit** | A second sensor that doesn't need the sky: why real systems carry a backup |
| **Fact shown** | A3144 Hall + spoke magnet, 1 pulse per turn: speed and distance even without GPS |

## 3. Hooks

| Var | Text |
|---|---|
| A | **Tunnel ahead.** (adult: *Tunnel.*) |
| B | **No sky, no GPS.** |
| C | **Who keeps count in the dark?** (adult: *Who counts in the dark?*) |

## 4. Storyboard

| # | Time | Visual | Text |
|---|---|---|---|
| 1 | 0–2.2 | The bike rides toward a tunnel; GPS arcs full on the box lid | Hook |
| 2 | 2.2–4.2 | Inside: darker, ceiling lamps passing; the GPS arcs grey out one by one; `NO FIX` tag over the puck | `02 · GPS` *Signal gone.* |
| 3 | 4.2–7.0 | The Hall sensor keeps glowing once per wheel turn; inset close-up of sensor + magnet; WHEEL TURNS keeps counting (from the real wheel rotation) | `05 · Hall sensor` *The wheel still counts.* + chips |
| 4 | 7.0–9.0 | Out into the light; GPS arcs return | *Speed and distance, even without GPS.* |
| 5 | 9.0–11.2 | End card with GPS and Hall sensor | **Bike Logger** · URL |

The turn count is the drawing's own wheel turns, not a claimed distance or speed.

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
node scripts/variants.mjs productions/bike-logger/REEL-008-tunnel/variants.json --qa
node core/render.mjs video "productions/bike-logger/REEL-008-tunnel/composition/index.html?style=adult&hook=B&size=landscape" /tmp/REEL-008.mp4
```
