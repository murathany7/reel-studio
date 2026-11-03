# QA report — REEL-009-pas-adult-reel.mp4

Generated 2026-11-03 20:42.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 13.900000s | — |

## Motion

```json
{"frames_compared": 416, "moving_frames": 370, "static_frames": 46, "median_pct_pixels_changed_when_moving": 0.541, "hitches": [{"frame": 104, "time": 3.467}], "jumps": [{"frame": 123, "time": 4.1, "pct": 19.6}, {"frame": 225, "time": 7.5, "pct": 17.8}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 12.3667
- Black sections: black_start:0 black_end:0.2

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
