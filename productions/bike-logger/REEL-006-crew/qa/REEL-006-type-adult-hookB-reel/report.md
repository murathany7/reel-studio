# QA report — REEL-006-type-adult-hookB-reel.mp4

Generated 2026-11-03 21:50.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 18.000000s | — |

## Motion

```json
{"frames_compared": 1079, "moving_frames": 509, "static_frames": 570, "median_pct_pixels_changed_when_moving": 0.244, "hitches": [{"frame": 262, "time": 4.367}, {"frame": 347, "time": 5.783}, {"frame": 569, "time": 9.483}, {"frame": 603, "time": 10.05}, {"frame": 791, "time": 13.183}], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 14.0833 freeze_duration: 1.71667 freeze_start: 16.2
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
