# QA report — REEL-009-ikea-fun-reel.mp4

Generated 2026-11-03 20:49.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 14.000000s | — |

## Motion

```json
{"frames_compared": 419, "moving_frames": 353, "static_frames": 66, "median_pct_pixels_changed_when_moving": 0.727, "hitches": [{"frame": 297, "time": 9.9}], "jumps": [{"frame": 180, "time": 6.0, "pct": 20.0}, {"frame": 282, "time": 9.4, "pct": 19.3}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: black_start:0 black_end:0.2 black_start:2.2 black_end:2.73333

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
