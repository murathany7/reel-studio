# QA report — REEL-009-specificity-type-fun-reel.mp4

Generated 2026-11-03 22:06.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 60.000 fps (r=60/1, avg=60/1) | ✅ |
| Constant frame rate | r=60/1 avg=60/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 9.200000s | — |

## Motion

```json
{"frames_compared": 551, "moving_frames": 169, "static_frames": 382, "median_pct_pixels_changed_when_moving": 0.846, "hitches": [{"frame": 72, "time": 1.2}, {"frame": 148, "time": 2.467}, {"frame": 150, "time": 2.5}], "jumps": []}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 2.43333 freeze_duration: 1.96667 freeze_start: 4.93333 freeze_duration: 1.66667 freeze_start: 7
- Black sections: black_start:0 black_end:0.45

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
