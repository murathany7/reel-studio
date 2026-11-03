# REEL-006 — Meet the crew (cartoon, silent)

> Storyboard for approval. Part of a cartoon series of three (REEL-006, REEL-007, REEL-008) that share one cast:
> the real parts drawn as flat characters. The cast sheet is `refs/cast.png` (drawn by `refs/crew.js`).

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel |
| Status | `storyboard (awaiting approval)` |
| Size | 1080×1920 (9:16) |
| Frame rate / length | 30 fps · 16 s |
| Language | EN |
| Placement | Organic (copy inside `.safe-organic`) |
| Engines | **SVG rig** (`engines/svg-rig.js`) for the crew: hop, blink, wave, squash, all in code, no designer file needed. **GSAP** for type and chips. No 3D, no capture: the look asked for is cartoon, and flat SVG renders fast and md5-stable |
| Sound | Silent: all meaning on screen |
| Approved by / date | |

## 1. Brief

- **Request:** "make some cartoony videos of Bike Logger at murathanyildirim.com/bike-logger" (2026-11-03).
- **Reference:** the brand's facts and look (`brands/bike-logger/README.md`). The live page could not be fetched
  from this session (network policy), so every fact comes from the brand README's list taken from that page.
- **Must avoid:** prices, kit contents, skill level, "easy", safety promises, part-maker logos (`compliance.md`).

## 2. Why this piece exists

| | |
|---|---|
| **Problem it solves** | Kits that are a pile of anonymous boards: you don't know what each one does until you've wired it |
| **Benefit / takeaway** | Each part has one job you can name; wire all five to one Pi and they work as a team |
| **Product fact shown** | The Pi, camera, GPS, IMU, ultrasonic and Hall sensor, each with its job (brand fact list) |
| **Hook** | The sealed box rattles, then pops open: "Meet the crew." |
| **CTA** | murathanyildirim.com/bike-logger |
| **Success metric** | Hook rate, saves, shares |

## 3. Hook variants

| Var | On-screen text | Opening visual |
|---|---|---|
| A | BUILD YOUR OWN RIDE RECORDER · **Meet the crew.** | Closed IP65 box rattling on its own |
| B | **Six parts. One box.** | Parts fall one by one into the open box |
| C | **Who's in the box?** | Two eyes blink in the dark gap under the lid |

## 4. Storyboard (for approval)

| # | Time | Visual & motion (engine) | On-screen text | Notes |
|---|---|---|---|---|
| 1 | 0.0–2.0 | The grey IP65 box sits on a night floor; it rattles twice (anticipation), the lid flips open with a bounce (SVG + GSAP) | BUILD YOUR OWN RIDE RECORDER · **Meet the crew.** | Hook. Box low, text in top third |
| 2 | 2.0–4.0 | **Brain** hops out (squash/stretch), its cooler fan spins up, it waves (SVG rig) | 00 · THE BRAIN · **Runs the show.** · `Raspberry Pi 5` `8 GB` `active cooler` | |
| 3 | 4.0–5.8 | **Cam** hops out, turns its lens to the back, blinks with an aperture iris | 01 · CAMERA · **Watches behind.** · `Camera Module 3 Wide` `102°` | |
| 4 | 5.8–7.6 | **Fix** hops out, antenna up, signal arcs pulse in one by one | 02 · GPS · **Knows where.** · `USB GPS` `u-blox` `antenna up` | |
| 5 | 7.6–9.4 | **Tilt** hops out and leans left, right, then bounces as a pothole bump hits it; x/y/z arrows wobble | 03 · 9-AXIS IMU · **Feels every lean.** · `BNO085` `lean` `pitch` `acceleration` | |
| 6 | 9.4–11.2 | **Ping** hops out, sends sound arcs to the right; they bounce back from a cartoon car's bumper edging in | 04 · ULTRASONIC · **Measures behind.** · `waterproof probes` `in metres` | No number shown (compliance: numbers only from a real ride) |
| 7 | 11.2–13.0 | **Spin** hops out; its magnet buddy circles past on a spoke, each pass flashes a lamp pulse and ticks a counter 1, 2, 3 | 05 · HALL SENSOR · **Counts the wheel.** · `A3144` `spoke magnet` `1 pulse per turn` | |
| 8 | 13.0–16.0 | The crew lines up on a long timeline bar; a playhead sweeps and they all bounce on the same beat. End card | **Wire it. Code it. Ride.** · Bike Logger · `murathanyildirim.com/bike-logger` | End card held 2 s |

**Caption + hashtags:**
> Six parts, one sealed box under the rack. Each one does one job; wire them to a Raspberry Pi and they replay your
> whole ride on one timeline. #robotics #raspberrypi #maker #diyelectronics #bike

### Decisions needed with this storyboard (whole series)

1. **A cast for a brand with no mascot.** The README says *Mascot / characters: none*. Approving this adds the crew
   (`refs/cast.png`) to the brand; I'd save it to `brands/bike-logger/assets/characters/` and note it in the README.
2. **Two colours outside the palette:** Brain and Cam are PCB green (`#3fa66b`), Tilt is purple (`#7a5bd6`), so six
   characters read as six. Alternative: palette only (Brain signal blue, Tilt chip grey); less distinct.
3. **Names:** Brain, Cam, Fix, Tilt, Ping, Spin. Change any.

### ✅ Approval

- [ ] Storyboard approved. *No production before this box is ticked.*
- Requested changes:

## 6. Fact check (planned)

| Claim on screen | Source |
|---|---|
| Raspberry Pi 5, 8 GB, active cooler | Brand README *Facts* (live page) |
| Camera Module 3 Wide, 102°, rear-facing | same |
| USB GPS, u-blox, antenna up | same |
| BNO085, 9-axis: lean, pitch, acceleration | same |
| Ultrasonic, waterproof probes, logged in metres | same |
| A3144 Hall, spoke magnet, 1 pulse per turn | same |
| IP65 box, one timeline replay | same |

**Not claimed:** price, kit contents, skill level, "easy", any distance number.
