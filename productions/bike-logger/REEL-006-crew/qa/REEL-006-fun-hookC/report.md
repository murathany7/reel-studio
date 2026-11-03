# QA report — REEL-006-fun-hookC.mp4

Generated 2026-11-03 20:14.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 18.300000s | — |

## Motion

```json
{"frames_compared": 548, "moving_frames": 505, "static_frames": 43, "median_pct_pixels_changed_when_moving": 1.46, "hitches": [{"frame": 2, "time": 0.067}, {"frame": 17, "time": 0.567}, {"frame": 29, "time": 0.967}, {"frame": 32, "time": 1.067}, {"frame": 73, "time": 2.433}, {"frame": 129, "time": 4.3}, {"frame": 184, "time": 6.133}, {"frame": 295, "time": 9.833}, {"frame": 351, "time": 11.7}], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
