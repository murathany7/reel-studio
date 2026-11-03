# QA report — REEL-006-adult-hookA-landscape.mp4

Generated 2026-11-03 20:30.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1920x1080 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 18.000000s | — |

## Motion

```json
{"frames_compared": 539, "moving_frames": 497, "static_frames": 42, "median_pct_pixels_changed_when_moving": 0.873, "hitches": [{"frame": 118, "time": 3.933}, {"frame": 229, "time": 7.633}, {"frame": 340, "time": 11.333}], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
