# QA report — REEL-006-type-fun-hookC-square.mp4

Generated 2026-11-03 21:53.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1080 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 18.300000s | — |

## Motion

```json
{"frames_compared": 1097, "moving_frames": 518, "static_frames": 579, "median_pct_pixels_changed_when_moving": 0.2, "hitches": [{"frame": 510, "time": 8.5}, {"frame": 992, "time": 16.533}], "jumps": [{"frame": 144, "time": 2.4, "pct": 19.0}, {"frame": 810, "time": 13.5, "pct": 17.2}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 4.6 freeze_duration: 1.5 freeze_start: 14.1 freeze_duration: 2 freeze_start: 16.5
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
