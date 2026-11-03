# QA report — REEL-009-demo-fun-landscape.mp4

Generated 2026-11-03 22:04.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1920x1080 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 8.000000s | — |

## Motion

```json
{"frames_compared": 479, "moving_frames": 380, "static_frames": 99, "median_pct_pixels_changed_when_moving": 0.55, "hitches": [], "jumps": [{"frame": 120, "time": 2.0, "pct": 22.9}, {"frame": 324, "time": 5.4, "pct": 23.4}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 6.26667
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
