# QA report — REEL-009-curiosity-fun-banner.mp4

Generated 2026-11-03 22:07.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1200x628 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 9.800000s | — |

## Motion

```json
{"frames_compared": 587, "moving_frames": 298, "static_frames": 289, "median_pct_pixels_changed_when_moving": 0.402, "hitches": [{"frame": 137, "time": 2.283}], "jumps": [{"frame": 102, "time": 1.7, "pct": 100.0}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 8
- Black sections: black_start:0 black_end:0.516667

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
