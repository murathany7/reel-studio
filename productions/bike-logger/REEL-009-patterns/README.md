# REEL-009 — Persuasion pattern pack (cartoon, silent)

> One composition, 54 exports: 19 ad patterns × 2 styles at 9:16, plus 16 in other sizes: 4:5 feed, 1:1 square,
> 16:9 landscape (website hero, YouTube) and 1200×628 banner (link ads, Open Graph). Built from the
> brand's brief (`brands/bike-logger/assets/cartoon/brief.js`) with the ad kit (`engines/ad-kit/`). Asked for on
> 2026-11-03: "many different variants … engine templates for common ad scenarios and persuasion used in psychology".

| Field | Value |
|---|---|
| Brand | `brands/bike-logger/` |
| Type | Reel pack (A/B test material) |
| Status | `QA passed` (draft pack for review: pick winners to publish) |
| Size | 1080×1920 (9:16), 1080×1350 (4:5), 1080×1080 (1:1), 1920×1080 (16:9), 1200×628 (1.91:1) |
| Frame rate / length | 60 fps · 8–14 s each (`export/manifest.md`) |
| Placement | Reels: organic safe zone. Feed and square: 70 px margins. Landscape and banner: 5 % sides, 7.5 % top and bottom, text left, stage right |
| Engines | Ad kit (GSAP + SVG) + the brand's parts and world (bike with its sensors, street, replay). No characters (revised 2026-11-03) |
| Sound | Silent |
| Approved by / date | Direction approved by Murathan, 2026-11-03 (request above). Copy is the approved REEL-006–008 copy plus the brief's lines; review before publishing |

## Patterns in the pack

| Pattern | What the viewer sees | Principle (basis) |
|---|---|---|
| `pas` | "Another blinking LED?" → "Five logs. None line up." → the replay → two parts → end card | Problem–agitate–solve |
| `bab` | Tangled wires and loose logs snap onto one timeline | Before–after–bridge; contrast |
| `listicle` | Box opens, six parts numbered 01–06 | Chunking (Miller 1956) |
| `spotlight` | One part held longer (Brain by default; `?feature=` picks another) | Single-minded proposition |
| `demo` | Hook → the replay scrubbed → end card | Show the result |
| `faq` | "No GPS in a tunnel?" → "The wheel still counts." · "Where do rides go?" → "Your rides stay with you." | Two-sided messages (Hovland 1949) |
| `three` | Wire it. Code it. Ride. | Rule of three (Shu & Carlson 2014) |
| `unboxing` | Box opens → all six parts on a timeline, each lighting as the playhead passes | Anticipation (Loewenstein 1987) |
| `curiosity` | A silhouette and "What's in the box?" → "A Raspberry Pi 5." | Information gap (Loewenstein 1994) |
| `interrupt` | A colour jolt, "Wait." → hook | Orienting response (Sokolov 1963) |
| `ikea` | "Don't buy a recorder." → "Build one." (3 steps) → replay → "You built that." | IKEA effect (Norton, Mochon & Ariely 2012) |
| `progress` | A build checklist ticking 0/6 → 6/6 with a progress bar → replay | Goal gradient (Kivetz et al. 2006); no false pre-ticks |
| `myth` | Fact → myth struck out → fact again (speed without GPS) | Truth sandwich (Lewandowsky et al. 2020) |
| `reciprocity` | A free tip: speed = turns × wheel size ÷ time → "Want to wire it up?" | Reciprocity (Cialdini 1984) |
| `foot` | "Start with one sensor." → the Hall sensor → all six parts | Foot in the door (Freedman & Fraser 1966) |
| `story` | The box opens; on a ride the IMU feels a pothole, the ultrasonic measures a car, the Hall sensor counts; the replay | Narrative transportation (Green & Brock 2000) |
| `loss` | "Every ride you don't record is gone": the corner, the pothole… fade → "Record the next one." | Loss framing (Tversky & Kahneman 1981), no fear |
| `contrast` | Blinking LED kit vs Bike Logger, three rows each | Contrast effect |
| `specificity` | 102° · 9-axis · IP65 (200 × 120 × 75 mm) | Precise numbers (Schindler & Yalch 2006) |

**Not in the pack, on purpose:** `social` (no real testimonials or user counts on file), `authority` (no credential
or press), `scarcity` (no real deadline or stock). The kit refuses to build them without a source; ask before any.

## 6. Fact check

Every claim is in the brand README's fact list (live page): Pi 5, 8 GB, active cooler; Camera Module 3 Wide, 102°;
USB GPS, u-blox, antenna up; BNO085 9-axis (lean, pitch, acceleration; potholes); ultrasonic, waterproof probes,
in metres; A3144, spoke magnet, 1 pulse per turn, speed and distance without GPS; IP65, 200 × 120 × 75 mm; one
timeline, scrub once; runs offline, "your rides stay with you". The tip's formula (speed from wheel turns) is
general physics, no number. "Blinking LED kit" names no competitor. **Not claimed:** price, kit contents, skill
level, "easy", safety, any distance or speed value. The charts in the replay have no values on them.

## 7. Rebuild

```bash
node scripts/variants.mjs productions/bike-logger/REEL-009-patterns/variants.json --check
node scripts/variants.mjs productions/bike-logger/REEL-009-patterns/variants.json --qa
node scripts/variants.mjs productions/bike-logger/REEL-009-patterns/variants.json --only pattern=ikea,style=adult --force
```

## Looks (2026-11-03)

`variants-looks.json` renders the same piece in three more looks (`?look=`): **blueprint** (white line art of
the bike, street and parts on a drafting grid, signals in amber), **daylight** (the light version, brand CTA kept)
and **type** (kinetic typography, words revealed one by one, no part illustrations). Rebuild:
`node scripts/variants.mjs productions/bike-logger/<this folder>/variants-looks.json --qa`.
