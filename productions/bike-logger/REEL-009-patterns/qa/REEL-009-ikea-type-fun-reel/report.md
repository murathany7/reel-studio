# QA report — REEL-009-ikea-type-fun-reel.mp4

Generated 2026-11-03 21:52.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 14.000000s | — |

## Motion

```json
{"frames_compared": 839, "moving_frames": 461, "static_frames": 378, "median_pct_pixels_changed_when_moving": 0.419, "hitches": [{"frame": 139, "time": 2.317}, {"frame": 141, "time": 2.35}, {"frame": 589, "time": 9.817}], "jumps": [{"frame": 360, "time": 6.0, "pct": 15.1}, {"frame": 564, "time": 9.4, "pct": 17.0}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 9.75 freeze_duration: 1.65 freeze_start: 11.8
- Black sections: black_start:2 black_end:2.61667 black_start:9.4 black_end:9.63333

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
