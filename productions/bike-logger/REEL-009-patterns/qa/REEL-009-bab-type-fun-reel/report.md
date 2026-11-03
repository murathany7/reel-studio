# QA report — REEL-009-bab-type-fun-reel.mp4

Generated 2026-11-03 22:23.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 12.400000s | — |

## Motion

```json
{"frames_compared": 743, "moving_frames": 444, "static_frames": 299, "median_pct_pixels_changed_when_moving": 0.49, "hitches": [{"frame": 149, "time": 2.483}], "jumps": [{"frame": 120, "time": 2.0, "pct": 19.0}, {"frame": 239, "time": 3.983, "pct": 100.0}, {"frame": 588, "time": 9.8, "pct": 21.2}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 4.68333 freeze_duration: 1.71667 freeze_start: 10.2
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
