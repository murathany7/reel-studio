# CLAUDE.md

Marketing videos, reels, ads and posts made with code, using the **Reel Studio** kit
(<https://github.com/murathany7/reel-studio>). One deterministic renderer, several engines on one clock, one folder
per brand, one folder per production.

## Where to look

| Question | Skill / file |
|---|---|
| Making a video, reel, ad or post | `make-video` skill, then the brand folder |
| A new brand | `new-brand` skill |
| Which engine for a look | `pick-engine` skill and `engines/README.md` |
| 3D (Three.js, Blender) | `scene-3d` skill |
| A cartoon character or mascot | `character-2d` skill |
| Recording a brand's live website | `capture-site` skill |
| Reviewing a piece: notes pinned to frames, approvals | `review-desk` skill, `desk/README.md` |
| Render, audio and QA commands | `core/README.md` |
| What is in progress, decided, learned | `STATUS.md` |

| Path | What |
|---|---|
| `core/` | `render.mjs` (HTML → MP4/PNG), `lib/runtime.js` (the `Studio` clock), `lib/base.css` |
| `engines/` | One adapter per engine |
| `desk/` | Review app (`node desk/server.mjs`): frame notes, renders, approvals; `reel-desk` MCP server |
| `scripts/` | Audio mix, transcription, video QA, frame tools |
| `brands/<slug>/` | Facts and their sources, look, voice, `compliance.md` (start from `brands/_template`) |
| `productions/<brand>/<ID>-<slug>/` | One piece (start from `productions/_TEMPLATE`) |

## Golden rules

1. Read `STATUS.md` before starting and update it before finishing.
2. Brief → storyboard → **approval** → production → **frame-by-frame QA** → delivery. No production before approval.
3. Never invent product facts, numbers or testimonials. Every claim traces to a source in the brand's README.
4. Every piece passes its brand's `compliance.md`. Brands never borrow each other's look, facts or voice.
5. Every frame is a pure function of `t` (rules in `engines/README.md`). If two renders of a frame differ, it is a bug.
