# QA report — REEL-008-adult-hookA-reel.mp4

Generated 2026-11-03 20:38.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 11.200000s | — |

## Motion

```json
{"frames_compared": 335, "moving_frames": 309, "static_frames": 26, "median_pct_pixels_changed_when_moving": 2.422, "hitches": [], "jumps": [{"frame": 6, "time": 0.2, "pct": 52.2}, {"frame": 276, "time": 9.2, "pct": 58.8}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: black_start:0 black_end:0.2

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
