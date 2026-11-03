# QA report — REEL-009-foot-type-fun-reel.mp4

Generated 2026-11-03 21:59.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 9.600000s | — |

## Motion

```json
{"frames_compared": 575, "moving_frames": 252, "static_frames": 323, "median_pct_pixels_changed_when_moving": 0.067, "hitches": [{"frame": 31, "time": 0.517}], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 2.41667 freeze_duration: 1.78333 freeze_start: 4.96667 freeze_duration: 2.03333 freeze_start: 7.4
- Black sections: black_start:4.2 black_end:4.4

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
