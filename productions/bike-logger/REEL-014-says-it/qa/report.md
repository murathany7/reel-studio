# QA report — REEL-014-says-it-en.mp4

Generated 2026-11-04 21:54.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | aac @ 48000 Hz | ✅ |
| Duration | 18.000000s | — |
| Loudness (integrated) | -14.3 LUFS | ✅ |
| True peak | -0.9 dBTP | ⚠️ above -1 dBTP |
| First frame | has content (`first_frame.jpg`) | ✅ |
| Flashes (most in 1 s) | 0  | ✅ |

## Motion

```json
{"frames_compared": 539, "moving_frames": 539, "static_frames": 0, "median_pct_pixels_changed_when_moving": 11.875, "hitches": [], "jumps": [{"frame": 60, "time": 2.0, "pct": 86.4}, {"frame": 120, "time": 4.0, "pct": 51.5}, {"frame": 180, "time": 6.0, "pct": 45.6}, {"frame": 240, "time": 8.0, "pct": 67.7}, {"frame": 360, "time": 12.0, "pct": 44.5}, {"frame": 390, "time": 13.0, "pct": 37.7}, {"frame": 420, "time": 14.0, "pct": 50.9}, {"frame": 435, "time": 14.5, "pct": 28.9}, {"frame": 480, "time": 16.0, "pct": 99.4}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
