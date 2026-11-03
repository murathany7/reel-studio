# QA report — REEL-006-adult-hookB-banner.mp4

Generated 2026-11-03 20:32.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1200x628 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 18.000000s | — |

## Motion

```json
{"frames_compared": 539, "moving_frames": 511, "static_frames": 28, "median_pct_pixels_changed_when_moving": 0.986, "hitches": [{"frame": 23, "time": 0.767}, {"frame": 118, "time": 3.933}, {"frame": 229, "time": 7.633}, {"frame": 340, "time": 11.333}], "jumps": [{"frame": 474, "time": 15.8, "pct": 15.0}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: black_start:0 black_end:0.2

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
