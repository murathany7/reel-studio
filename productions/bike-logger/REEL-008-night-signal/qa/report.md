# QA report — REEL-008-night-signal-en-9x16.mp4

Generated 2026-11-04 18:45.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | aac @ 48000 Hz | ✅ |
| Duration | 16.866667s | — |
| Loudness (integrated) | -13.7 LUFS | ✅ |
| True peak | -1.4 dBTP | ✅ |
| First frame | has content (`first_frame.jpg`) | ✅ |
| Flashes (most in 1 s) | 0  | ✅ |

## Motion

```json
{"frames_compared": 505, "moving_frames": 505, "static_frames": 0, "median_pct_pixels_changed_when_moving": 23.764, "hitches": [], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.

## Frame review (2026-11-04)

- Beat stills, 9:16 and 4:5, with safe zones: `qa/beats-sheet.jpg`, `qa/beats-4x5-sheet.jpg` (every bar's start, middle and end).
  All copy, chips, the URL and the timeline's lane labels sit inside the paid Reels safe zone (stricter than the organic one).
- Glitch frames at each downbeat (0.05 s before to 0.13 s after) are the intended cuts.
- Fixed during review: amber headline glow softening the glyphs; the corridor drowning the timeline lanes; the end card's
  mono line too wide; the lane labels in the bottom 35% (moved up).
- Determinism: t = 10.3 rendered twice, identical md5 (`7b336b3d…`).
- Sound: −13.7 LUFS integrated, no VO to duck. SFX are generated on the same 128 BPM grid as the cuts, so they line up
  by construction. Not listened to by a person yet.
- Facts: every on-screen claim is in README §6; compliance list passes (no safety promise, no prices, kit contents or
  skill level, no ride numbers, part brands as plain text, no road footage, no riding shown).
