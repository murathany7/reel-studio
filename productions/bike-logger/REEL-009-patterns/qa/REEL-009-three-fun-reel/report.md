# QA report — REEL-009-three-fun-reel.mp4

Generated 2026-11-03 20:46.

## Specs

| Check | Value | Result |
|---|---|---|
| Size | 1080x1920 | ✅ |
| Frame rate | 30.000 fps (r=30/1, avg=30/1) | ✅ |
| Constant frame rate | r=30/1 avg=30/1 | ✅ |
| Video codec / pixel format | h264 / yuv420p | ✅ |
| Audio | none  | ⚠️ no audio |
| Duration | 12.200000s | — |

## Motion

```json
{"frames_compared": 365, "moving_frames": 294, "static_frames": 71, "median_pct_pixels_changed_when_moving": 0.695, "hitches": [], "jumps": [{"frame": 186, "time": 6.2, "pct": 20.2}, {"frame": 288, "time": 9.6, "pct": 21.0}]}
```

- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times.
- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in `flagged/`.
- Frozen sections (≥1.5 s): none
- Black sections: black_start:0 black_end:0.2 black_start:2.2 black_end:2.63333

## Visual review

- `contact_sheet_safezones.jpg`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red.
- Then review the key beats frame by frame (`render.mjs stills --at …`) and listen once with sound.
