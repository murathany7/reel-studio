# CLAUDE.md

**Reel Studio**: a brand-agnostic kit for making marketing videos, reels, ads and posts with code. One deterministic
renderer, several engines plugged into one clock, one folder per brand, one folder per production.

## Where to look

| Question | Read |
|---|---|
| Making a video, reel, ad or post | `.claude/skills/make-video` (the whole path), then the brand folder |
| Which engine for a look | `.claude/skills/pick-engine` and `engines/README.md` |
| 3D (Three.js, Blender) | `.claude/skills/scene-3d` |
| A cartoon character or mascot | `.claude/skills/character-2d` |
| Recording a brand's live website | `.claude/skills/capture-site` |
| A new brand | `.claude/skills/new-brand` |
| *Optional:* the person reviews in the desk (frame notes, approvals) | `.claude/skills/review-desk`, `desk/README.md` |
| Render, audio and QA commands | `core/README.md` |
| What is in progress, decided, learned | `STATUS.md` |

| Path | What |
|---|---|
| `core/` | `render.mjs` (HTML → MP4/PNG), `lib/runtime.js` (the `Studio` clock), `lib/base.css` (stage, safe zones). `npm install` here once |
| `engines/` | One adapter per engine: `three.js`, `pixi.js`, `svg-rig.js`, `capture.mjs`, `blender/` |
| `desk/` | *Optional* local review app: player, frame notes, renders, approvals, "Send to Claude"; `reel-desk` MCP server (not registered by default). Nothing else depends on it |
| `scripts/` | Audio mix, transcription, video QA, frame extraction, SVG → PNG |
| `brands/<slug>/` | Facts and their sources, look (`tokens.css`, `assets/`), voice, `compliance.md` |
| `productions/<brand>/<ID>-<slug>/` | One piece: README (storyboard → explainer), `refs/`, `composition/`, `audio/`, `qa/`, `export/` |
| `examples/engines-demo/` | A 6 s reel using every tested engine; rebuild it to check a machine |
| `examples/reel-layer/` | 8 s reel for captions, beat cuts, transitions and the four formats |

## Golden rules

1. Read `STATUS.md` before starting and update it before finishing.
2. Brief → storyboard → **approval** → production → **frame-by-frame QA** → delivery. No production before approval.
3. Never invent product facts, numbers or testimonials. Every claim traces to a source listed in the brand's README.
   Never copy competitor copy.
4. Every piece passes its brand's `compliance.md`. Brands never borrow each other's look, facts or voice.
5. Every frame is a pure function of `t` (rules in `engines/README.md`). If two renders of a frame differ, it is a bug.

## Related repos (read-only, for facts)

- `../marketing-reels-skill`: the Yuppo-only kit this grew from (Yuppo brand kit, research, productions).
- `../bikelog`: Bike Logger; its live page was captured for the first `capture-site` reel.

## Checks

```sh
node --check core/render.mjs engines/capture.mjs
node core/render.mjs still examples/engines-demo/index.html /tmp/a.png --t 4.6
node core/render.mjs still examples/engines-demo/index.html /tmp/b.png --t 4.6 && md5 -q /tmp/a.png /tmp/b.png
```
(The demo needs its Blender plate first: see `examples/engines-demo/README.md`.)
