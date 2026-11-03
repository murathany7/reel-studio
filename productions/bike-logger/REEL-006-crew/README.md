# REEL-006 — Meet the parts (silent, 60 fps)

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel (+ landscape, square, banner) |
| Status | `QA passed` (draft for review) |
| Size / length | 1080×1920 · 17.4 s · 60 fps |
| Placement | Organic (`.safe-organic`) |
| Engines | Ad kit (GSAP + SVG) with the brand's parts and world |
| Sound | Silent |
| Approved by / date | Murathan, 2026-11-03 (storyboard), revised the same day (parts, not characters) |

## 2. Why this piece exists

| | |
|---|---|
| **Problem** | Kits that are a pile of anonymous boards: you don't know what each one does until you've wired it |
| **Benefit** | Each part has one job you can name; wire all of them to one Pi and they replay the ride together |
| **Facts shown** | Pi 5 (8 GB, active cooler), Camera Module 3 Wide (102°), USB GPS (u-blox, antenna up), BNO085 (lean, pitch, acceleration), ultrasonic (waterproof probes, in metres), A3144 + spoke magnet (1 pulse per turn), IP65 box |
| **CTA** | murathanyildirim.com/bike-logger |

## 3. Hooks

| Var | Text | Opening visual |
|---|---|---|
| A | BUILD YOUR OWN RIDE RECORDER · **Meet the parts.** (adult: *Everything under the rack.*) | The IP65 box, a slow push-in, the lid opens and light comes up |
| B | **Five sensors. One Pi.** (adult: *Five sensors. One sealed box.*) | Box, push-in, lid opens |
| C | **What's in the box?** | Box held longer, lid opens late |

## 4. Storyboard

| # | Time | Visual | Text |
|---|---|---|---|
| 1 | 0–2.1 | Box, push-in, lid opens with a lamp glow | Hook |
| 2–7 | 2.1–13.2 | Each part rises out of the open box doing its job (1.85 s each), then slides off as the next rises: Pi cooler spinning + LED, camera cone opening to 102°, GPS arcs pulsing, BNO085 tilting with its axes, ultrasonic pinging, Hall sensor with the magnet passing and a TURNS count | `00 · The brain` *Runs the show.* … `05 · Hall sensor` *Counts the wheel.* + spec chips |
| 8 | 13.2–15.8 | All six on a timeline with labels; each lights as the playhead passes | **Wire it. Code it. Ride.** |
| 9 | 15.8–18 | End card with Pi, GPS and Hall sensor | **Bike Logger** · Build your own ride recorder. · URL |

## 6. Fact check

Every chip and line is in the brand README's fact list (live page). Not claimed: price, kit contents, skill level, "easy", any number not listed there.

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

One composition, 10 exports: style `fun` | `adult` × hook `A` | `B` | `C` at 9:16, plus website and feed sizes
(`landscape` 1920×1080 for site heroes and YouTube, `banner` 1200×628 for link ads and Open Graph, `square`
1080×1080), listed in `variants.json`. **Adult** = the same facts in a dry voice, with muted colours, ink outlines
and calmer motion.

- `export/manifest.md`: every file with its axes, length, size, fps and QA result. MP4s are not in git; they are in
  the gallery artifact (`../gallery-assets.json`).
- `qa/variants-sheet.jpg` (one cover per variant) and `qa/<name>/report.md`.

## 7. Rebuild

```bash
node scripts/variants.mjs productions/bike-logger/REEL-006-crew/variants.json --qa
node core/render.mjs video "productions/bike-logger/REEL-006-crew/composition/index.html?style=adult&hook=B&size=landscape" /tmp/REEL-006.mp4
```

## Looks (2026-11-03)

`variants-looks.json` renders the same piece in three more looks (`?look=`): **blueprint** (white line art of
the bike, street and parts on a drafting grid, signals in amber), **daylight** (the light version, brand CTA kept)
and **type** (kinetic typography, words revealed one by one, no part illustrations). Rebuild:
`node scripts/variants.mjs productions/bike-logger/<this folder>/variants-looks.json --qa`.
