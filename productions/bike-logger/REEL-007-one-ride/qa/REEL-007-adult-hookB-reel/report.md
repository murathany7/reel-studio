# QA report — REEL-007-adult-hookB-reel.mp4

Generated 2026-11-03 21:27.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 16.200000s | — |

## Motion

```json
{"frames_compared": 971, "moving_frames": 884, "static_frames": 87, "median_pct_pixels_changed_when_moving": 1.765, "hitches": [], "jumps": [{"frame": 636, "time": 10.6, "pct": 54.3}, {"frame": 828, "time": 13.8, "pct": 18.6}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 14.6
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
