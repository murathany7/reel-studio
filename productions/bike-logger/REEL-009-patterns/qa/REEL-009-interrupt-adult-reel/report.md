# QA report — REEL-009-interrupt-adult-reel.mp4

Generated 2026-11-03 20:47.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 9.800000s | — |

## Motion

```json
{"frames_compared": 293, "moving_frames": 247, "static_frames": 46, "median_pct_pixels_changed_when_moving": 0.501, "hitches": [], "jumps": [{"frame": 1, "time": 0.033, "pct": 90.5}, {"frame": 16, "time": 0.533, "pct": 37.3}, {"frame": 17, "time": 0.567, "pct": 41.2}, {"frame": 18, "time": 0.6, "pct": 26.2}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): freeze_start: 8.26667
- Black sections: black_start:0.7 black_end:1.6

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
