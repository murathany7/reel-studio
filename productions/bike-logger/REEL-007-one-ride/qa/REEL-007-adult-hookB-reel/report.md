# QA report — REEL-007-adult-hookB-reel.mp4

Generated 2026-11-03 20:36.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 16.200000s | — |

## Motion

```json
{"frames_compared": 485, "moving_frames": 458, "static_frames": 27, "median_pct_pixels_changed_when_moving": 2.782, "hitches": [], "jumps": [{"frame": 4, "time": 0.133, "pct": 53.6}, {"frame": 318, "time": 10.6, "pct": 15.4}, {"frame": 322, "time": 10.733, "pct": 41.1}, {"frame": 414, "time": 13.8, "pct": 19.5}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
