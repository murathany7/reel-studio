# QA report — REEL-006-fun-hookA.mp4

Generated 2026-11-03 20:14.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 18.000000s | — |

## Motion

```json
{"frames_compared": 539, "moving_frames": 506, "static_frames": 33, "median_pct_pixels_changed_when_moving": 1.434, "hitches": [{"frame": 2, "time": 0.067}, {"frame": 17, "time": 0.567}, {"frame": 29, "time": 0.967}, {"frame": 32, "time": 1.067}, {"frame": 64, "time": 2.133}, {"frame": 120, "time": 4.0}, {"frame": 175, "time": 5.833}, {"frame": 286, "time": 9.533}, {"frame": 342, "time": 11.4}], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
