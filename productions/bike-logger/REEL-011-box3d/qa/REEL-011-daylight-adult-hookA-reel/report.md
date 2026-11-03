# QA report — REEL-011-daylight-adult-hookA-reel.mp4

Generated 2026-11-03 22:13.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 11.800000s | — |

## Motion

```json
{"frames_compared": 707, "moving_frames": 620, "static_frames": 87, "median_pct_pixels_changed_when_moving": 1.478, "hitches": [], "jumps": [{"frame": 130, "time": 2.167, "pct": 15.3}, {"frame": 143, "time": 2.383, "pct": 21.3}, {"frame": 564, "time": 9.4, "pct": 60.1}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 10.2167
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
