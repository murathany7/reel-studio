# QA report — REEL-009-ikea-adult-landscape.mp4

Generated 2026-11-03 22:05.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1920x1080 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 14.000000s | — |

## Motion

```json
{"frames_compared": 839, "moving_frames": 529, "static_frames": 310, "median_pct_pixels_changed_when_moving": 0.543, "hitches": [], "jumps": [{"frame": 564, "time": 9.4, "pct": 19.7}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 9.81667 freeze_duration: 1.58333 freeze_start: 12.3
- Black sections: black_start:2 black_end:2.78333

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
