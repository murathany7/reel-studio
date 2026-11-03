# QA report — REEL-009-faq-type-fun-reel.mp4

Generated 2026-11-03 21:42.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 10.600000s | — |

## Motion

```json
{"frames_compared": 635, "moving_frames": 157, "static_frames": 478, "median_pct_pixels_changed_when_moving": 0.552, "hitches": [{"frame": 35, "time": 0.583}, {"frame": 137, "time": 2.283}, {"frame": 269, "time": 4.483}, {"frame": 381, "time": 6.35}], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 2.26667 freeze_duration: 1.73333 freeze_start: 6.3 freeze_duration: 1.7 freeze_start: 8.4
- Black sections: none

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
