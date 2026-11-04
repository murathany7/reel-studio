# REEL-008 — Night signal

> The storyboard for approval. Once the box in §4 is ticked, this README becomes the explainer shipped with the files.

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel |
| Status | `delivered` (final cut approved by Murathan, 2026-11-04, in chat: "Approve final cut") |
| Size | 1080×1920 (9:16) for Reels, plus a 1080×1350 (4:5) feed cut from the same composition |
| Frame rate / length | 30 fps · 16.9 s (9 bars at 128 BPM, one bar = 1.875 s) |
| Language | EN |
| Placement | Organic; copy kept inside the stricter paid `.safe` zone, so the same file also works as an ad |
| Look | `looks/neon-noir` (picked by Murathan in chat, 2026-11-04: "Yes, neon noir") |
| Engines | **Three.js**: the real CAD meshes drawn as neon edges (`EdgesGeometry`) over dark faces, `emissive()` corridor, fog, `bloom()` · **GSAP + SVG** for the HUD (field-of-view wedge, route line, horizon, pulse ring, sonar arcs, timeline lanes) · **canvas** seeded rain · **`looks/fx.js`** glitch on every cut, scanlines, flicker, grain · cuts on the music's downbeats (`Studio.beats`, `Studio.bar`) |
| Sound | Music + SFX, no VO; all meaning on screen, so it plays silent too |
| Requested by / date | Murathan, 2026-11-04: "Yes, neon noir" (a Bike Logger reel in the new look) |
| Approved by / date | Murathan, 2026-11-04, in chat ("Approve, own music") |

## 0. Directions (pick one)

`node scripts/looks.mjs bike-logger`: REEL-001, 002, 006 and 007 all used the signature look; every catalogue look is
untried. The person picked **neon-noir** directly, so no other directions were pitched.

| | Look | Why it fits this brief | Style frame |
|---|---|---|---|
| A | **neon-noir** ✅ | Night rides and five sensors read naturally as a HUD booting up. The brand's own lights become the neons: **lamp** `#ffc46e` → neon-a (headlines, the Pi), **signal** `#84dcff` → neon-b (HUD, CAD edges). Archivo at width 62 is the condensed display, IBM Plex Mono the HUD | `qa/directions/neon-noir.jpg` (t = 1.0 hook, t = 2.4 a part beat) |

**Picked:** neon-noir (Murathan, in chat).

## 1. Brief

- **Request:** a Bike Logger reel in the new neon-noir look.
- **What's new vs REEL-001 to 007:** the first piece that is not in the signature look. The story is a different
  shape too: not "one part per beat" (REEL-006) but a **boot sequence**. The sealed box powers on in the rain, and
  each sensor comes online in the HUD as its real CAD part lights up in neon, until the whole ride is on one timeline.
- **Reference:** `qa/directions/neon-noir.jpg`, `looks/neon-noir/README.md`.
- **Must include:** each of the five sensors named with a spec from the live page; the Pi and the box; one timeline as
  the payoff; the URL.
- **Must avoid:** safety promises or fear (the night is a mood, not a danger; no cars bearing down, no red alarms),
  prices, kit contents, skill level ("easy", "for beginners"), part brands' logos, any number that looks like ride
  data (the HUD clock `02:47` and `ride 01` are labels, not measurements: no speeds, lean angles or distances).

## 2. Why this piece exists

| | |
|---|---|
| **Problem it solves** | "I want to learn hardware with something real, not another blinking LED." |
| **Benefit / takeaway** | Five sensors you wire to a Pi come alive one by one, and end up on one timeline: you can see you'd learn each one |
| **Product fact shown** | Pi 5 8 GB, IP65 box 200 × 120 × 75 mm, Camera Module 3 Wide 102°, USB GPS (u-blox), BNO085 9-axis, A3144 Hall 1 pulse per turn, ultrasonic logged in metres, dashboard + phone app on one timeline, runs offline (README *Facts that can be shown*) |
| **Hook(s)** | A: "Wire five sensors. Ride the night." |
| **CTA** | "Build your own ride recorder" · murathanyildirim.com/bike-logger |
| **Success metric** | Hook rate (3 s views), saves |

## 3. Hook variants

| Var | On-screen text | First spoken line | Opening visual |
|---|---|---|---|
| A ✅ | `● 02:47 · ride 01 · recording` / **Wire five sensors. Ride the night.** | (no VO) | Camera pushing down a corridor of lamp and signal neon frames in fog and rain; glitch in |
| B | `● 02:47` / **Your bike is still logging.** | (no VO) | The sealed box in the dark, one lamp edge flickering on |
| C | **Build the box that records the whole ride.** | (no VO) | The tray CAD drawing itself edge by edge, signal blue |

## 4. Storyboard (for approval)

Every cut is on a downbeat and lands on a short glitch (`LookFx.glitch`, 0.18 s). Headlines: Archivo 900, width 62,
uppercase, white with one lamp-neon line. HUD lines: Plex Mono, signal, typed on (`steps`). Text top-left in the safe
zone with a dark scrim; the CAD part sits in the lower middle. Rain, rolling scanlines and grain throughout.

| # | Time | Visual & motion (engine) | On-screen text | Sound | Notes |
|---|---|---|---|---|---|
| 1 | 0.0–1.9 s (bar 1) | Push down the neon corridor, rain, slight roll (Three.js `emissive` + `bloom`, fog). HUD corners snap in | `● 02:47 · ride 01 · recording` / **WIRE FIVE SENSORS.** **RIDE THE NIGHT.** (lamp) | Sub hit + glitch on 0.0, synth pulse starts | Hook A, as in the style frame |
| 2 | 1.9–3.75 s (bar 2) | Real **tray** CAD as neon edges, slow orbit; the Pi's edges light up lamp, the rest signal (Three.js) | `01 · brain · raspberry pi 5` / **ONE PI. ONE SEALED BOX.** / chips `8 GB` `IP65` `200 × 120 × 75 mm` | Power-on hum, glitch | Style frame t = 2.4 |
| 3 | 3.75–5.6 s (bar 3) | **Camera housing** CAD in neon; a 102° field-of-view wedge sweeps out behind it (SVG over the 3D) | `02 · camera · module 3 wide` / **SEES BEHIND.** / chips `102° wide` `rear-facing` `sealed window` | Shutter tick | |
| 4 | 5.6–7.5 s (bar 4) | Tray zoomed to the **GPS** parts; a route line draws across a dark grid map (SVG, no real place) | `03 · position · usb gps` / **KNOWS WHERE.** / chips `u-blox` `antenna up` | Data blips | u-blox as plain text only |
| 5 | 7.5–9.4 s (bar 5) | Tray zoomed to the **IMU**; an artificial-horizon line tilts left, levels, tilts right (SVG), no numbers | `04 · motion · bno085` / **FEELS EVERY LEAN.** / chips `9-axis` `lean` `pitch` `acceleration` | Low whoosh with the tilt | |
| 6 | 9.4–11.25 s (bar 6) | **Wheel sensor** CAD; the spoke magnet sweeps past and a pulse ring fires on each beat (Three.js + SVG) | `05 · wheel · a3144 hall` / **COUNTS EVERY TURN.** / chips `1 pulse per turn` `speed without GPS` | A tick per pulse, on the beat | |
| 7 | 11.25–13.1 s (bar 7) | **Ultrasonic box** CAD from below; sonar arcs ripple out backwards in signal blue (SVG) | `06 · behind · ultrasonic` / **MEASURES WHAT'S BEHIND.** / chips `waterproof probes` `logged in metres` `with the video` | Soft sonar pings | Signal blue, not brake red: no alarm, no car |
| 8 | 13.1–15.0 s (bar 8) | All parts flash on together; five HUD lanes (camera, GPS, motion, wheel, behind) stack up and one scrubber sweeps across them all (SVG/Pixi); the corridor returns behind | `all sensors · logging` / **ONE TIMELINE.** / `scrub once, everything moves` / chips `dashboard` `Android + iPhone app` | Full beat drops in | Lanes are abstract waveforms, no values or units |
| end | 15.0–16.9 s (bar 9) | Wordmark **BIKE LOGGER** in lamp neon with a tube flicker; rain keeps falling | **BIKE LOGGER** / **Build your own ride recorder.** / `runs offline · your rides stay with you` / tag `murathanyildirim.com/bike-logger` | Last sub hit on the downbeat, rain tail | URL ≥ 1.5 s on screen |

**Voiceover script:** none (silent-safe: every line is on screen ≥ 1.5 s, headlines ≥ 120 px).

**Music / SFX plan:** our own synthetic track like REEL-006/007 (`audio/make_music.py`, ffmpeg `aevalsrc` only, so
it's cleared for commercial use): dark 128 BPM synth pulse, sub kick on each downbeat, closed hats, a filtered pad;
glitch, power-on hum, shutter tick and sonar ping SFX synthesised the same way. Mixed to −14 LUFS. ElevenLabs music
is possible instead once it is authorised (`/mcp`).

**Caption + hashtags:**
> Five sensors, one Pi, one sealed box. Wire them up, ride at night, replay the whole ride on one timeline.
> Build your own ride recorder: murathanyildirim.com/bike-logger
> #raspberrypi #electronics #maker #robotics #bikelogger #diyelectronics

### ✅ Approval

- [x] Storyboard approved (Murathan, 2026-11-04, in chat: "Approve, own music"). *No production before this box is ticked.*
- [x] Final cut approved (Murathan, 2026-11-04, in chat: "Approve final cut"): `export/REEL-008-night-signal-en-9x16.mp4` and `-4x5.mp4`.
- Requested changes: none

## 5. Production log

| Step | Output | Notes |
|---|---|---|
| Directions | `qa/directions/neon-noir.html` → `neon-noir.jpg` | the starter with brand tokens, hook A and the real tray CAD |
| Music / SFX | `audio/music.wav`, `audio/sfx.wav` | `python3 audio/make_music.py`: our own synth (ffmpeg `aevalsrc`), D minor 128 BPM: sub hit, 16th pulse, kick from bar 2, hats and clap in the timeline bar; SFX: a glitch on every cut, power-on, shutter, blips, whoosh, Hall ticks, sonar pings |
| Beat grid | `audio/beats.json` | `scripts/beats.mjs` found 128 BPM but put beat 1 at 0.464 s (bar 1 has no kick), so the grid is set from the generator: beat n = n × 60/128 s |
| Mix | `audio/mix.wav` (`audio/cues.json`) | −13.7 LUFS integrated |
| Composition | `composition/index.html` | from `looks/neon-noir/starter.html`: Three.js CAD as `EdgesGeometry` neon over dark faces, `emissive` corridor, `bloom`; SVG HUD; seeded rain; `LookFx` glitch on every downbeat, scanlines, grain, flicker on the wordmark. Formats 9:16 + 4:5 |
| Render | `export/REEL-008-night-signal-en-9x16.mp4`, `-4x5.mp4` | `--formats all` |
| QA | `qa/report.md` (+ `qa/4x5/report.md`), `qa/beats/` | |

Changes made while producing (no change to the approved copy):
- The amber headline glow sat on top of the glyphs and softened them, so it now sits outside them (two wide shadows) instead of `LookFx.neon`.
- In the timeline bar the corridor made the lanes hard to read: the corridor is off in that bar and the lanes sit on a dark panel.
- The end card's mono line set on one line at 30 px so it stays inside the safe zone.

## 6. Fact check

| Claim on screen | Source |
|---|---|
| Five sensors (camera, GPS, motion, wheel, ultrasonic) | Brand README *Facts that can be shown* (live page "What's in it") |
| Raspberry Pi 5, 8 GB | same |
| IP65 box, 200 × 120 × 75 mm, "sealed" | same (Enclosure) |
| Camera Module 3 Wide, 102° wide, rear-facing, sealed window | same (Camera) |
| USB GPS, u-blox, antenna up | same (Position) |
| BNO085, 9-axis: lean, pitch, acceleration | same (Motion) |
| A3144 Hall, 1 pulse per turn, speed without GPS | same (Wheel) |
| Ultrasonic, waterproof probes, logged in metres with the video | same (Behind) |
| Dashboard and phone app (Android and iPhone), one timeline, scrub once and everything moves | same (Software) |
| Runs offline, your rides stay with you | same (Privacy) |
| "Build your own ride recorder" | Brand positioning (robotics kit, README *Who it is*) |

**Not claimed, because no source says it:** price, kit contents, skill level, battery life, any ride measurement. The
`02:47 · ride 01` HUD label is a mood label, not data.

## 7. Rebuild

```bash
python3 productions/bike-logger/REEL-008-night-signal/audio/make_music.py
python3 scripts/mix_audio.py productions/bike-logger/REEL-008-night-signal/audio/cues.json productions/bike-logger/REEL-008-night-signal/audio/mix.wav
node core/render.mjs video productions/bike-logger/REEL-008-night-signal/composition/index.html \
  productions/bike-logger/REEL-008-night-signal/export/REEL-008-night-signal-en.mp4 \
  --audio productions/bike-logger/REEL-008-night-signal/audio/mix.wav --formats all
scripts/qa-video.sh productions/bike-logger/REEL-008-night-signal/export/REEL-008-night-signal-en-9x16.mp4 productions/bike-logger/REEL-008-night-signal/qa
```
(`audio/beats.json` is written by hand from the generator's grid; see the production log.)
