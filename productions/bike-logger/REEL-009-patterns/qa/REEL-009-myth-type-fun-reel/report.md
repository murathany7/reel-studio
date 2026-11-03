# QA report — REEL-009-myth-type-fun-reel.mp4

Generated 2026-11-03 21:56.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 9.900000s | — |

## Motion

```json
{"frames_compared": 593, "moving_frames": 197, "static_frames": 396, "median_pct_pixels_changed_when_moving": 0.519, "hitches": [{"frame": 31, "time": 0.517}, {"frame": 140, "time": 2.333}, {"frame": 240, "time": 4.0}], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 7.7
- Black sections: black_start:1.61667 black_end:2.51667

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
