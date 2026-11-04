# AGENTS.md

Marketing videos, reels, ads and posts made with code, using the **Reel Studio** kit
(<https://github.com/murathany7/reel-studio>). One deterministic renderer, several engines on one clock, one folder
per brand, one folder per production.

## Where to look

| Question | Skill / file |
|---|---|
| Making a video, reel, ad or post | `make-video` skill, then the brand folder |
| A new brand | `new-brand` skill |
| The look (art direction) of a piece | `looks/README.md`, `node scripts/looks.mjs <brand>` |
| Which engine for a look | `pick-engine` skill and `engines/README.md` |
| 3D (Three.js, Blender) | `scene-3d` skill |
| A cartoon character or mascot | `character-2d` skill |
| Recording a brand's live website | `capture-site` skill |
| *Optional:* the person reviews in the desk (frame notes, approvals) | `review-desk` skill, `desk/README.md` |
| Render, audio and QA commands | `core/README.md` |
| What is in progress, decided, learned | `STATUS.md` |

| Path | What |
|---|---|
| `core/` | `render.mjs` (HTML → MP4/PNG), `lib/runtime.js` (the `Studio` clock), `lib/base.css` |
| `engines/` | One adapter per engine |
| `.agents/skills/` | The skills (Codex and Copilot read them here; Claude Code from `.claude/skills/`) |
| `desk/` | *Optional* review app (`node desk/server.mjs`): frame notes, renders, approvals. Nothing else depends on it |
| `scripts/` | Audio mix, transcription, lip sync, video QA, frame tools |
| `brands/<slug>/` | Identity: facts and their sources, colours, fonts, voice, *Look range*, `compliance.md` (start from `brands/_template`) |
| `looks/` | Art directions with a working starter each; pick one per piece |
| `productions/<brand>/<ID>-<slug>/` | One piece (start from `productions/_TEMPLATE`) |

## Golden rules

1. Read `STATUS.md` before starting and update it before finishing.
2. Brief → storyboard → **approval** → production → **frame-by-frame QA** → delivery. No production before approval.
3. Never invent product facts, numbers or testimonials. Every claim traces to a source in the brand's README.
4. Every piece passes its brand's `compliance.md`. Brands never borrow each other's identity, facts or voice.
   Pick a look per piece from `looks/`; a brand's pieces should not all look alike.
5. Every frame is a pure function of `t` (rules in `engines/README.md`). If two renders of a frame differ, it is a bug.
