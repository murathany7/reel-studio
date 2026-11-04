# QA report — REEL-008-night-signal-en-4x5.mp4

Generated 2026-11-04 18:45.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1350 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | aac @ 48000 Hz | ✅ |
| Duration | 16.866667s | — |
| Loudness (integrated) | -13.7 LUFS | ✅ |
| True peak | -1.4 dBTP | ✅ |
| First frame | has content (`first_frame.jpg`) | ✅ |
| Flashes (most in 1 s) | 1 (at 16.23 s, bottom-right) | ✅ |

## Motion

```json
{"frames_compared": 505, "moving_frames": 505, "static_frames": 0, "median_pct_pixels_changed_when_moving": 24.978, "hitches": [], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
