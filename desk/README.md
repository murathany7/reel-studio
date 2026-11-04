# Desk (optional)

A local review app for productions, **for people who'd rather review on a page than in chat**. Nothing in the kit
needs it: the skills are the product, and your coding agent (Claude Code, Codex, Copilot) writes, renders and checks the pieces either way. If you never
open the desk, nothing changes. It adds no dependencies and doesn't register itself anywhere.

```bash
node desk/server.mjs            # or: npx reel-studio desk   →  http://127.0.0.1:4100
```

| Panel | What it does |
|---|---|
| Player | Loads `composition/index.html?render=1` and drives it with `__ready`, `__meta`, `__seek`, the same calls as `core/render.mjs`. Space play/pause, ←/→ one frame (⇧ one second), S safe zones, N new note |
| Notes | Pin a note to the current frame. Dots on the scrubber. The agent marks notes *fixed* with a reply; you close them after checking |
| Agent | Sends the open notes and/or a request to a headless Claude Code or Codex run and streams what it does. The composition reloads when it's done |
| Render | Still at this frame, preview video, QA (`scripts/qa-video.sh`). Output goes to `qa/desk/`, never `export/` |
| Approve | Storyboard (ticks the README box) and final cut. People only: agents and the MCP server can't approve |
| Storyboard | The production README |

## How the agent is involved, and what it costs

There are three ways, and none needs an API key.

1. **Files.** Notes and approvals live in `productions/<brand>/<ID>/review.json`. In any Claude Code, Codex or Copilot
   session say "apply my desk notes" (the `review-desk` skill).
2. **Send to agent** runs `claude -p` by default (the Claude Code CLI on this machine, signed in as you) from the project root.
   `ANTHROPIC_API_KEY` is removed from its environment, so it always uses your Claude Code login. Its tools are limited
   to Read/Edit/Write/Glob/Grep, `node core/render.mjs`, `scripts/qa-video.sh`, `scripts/extract-frames.sh` and the
   `reel-desk` tools. It runs one session per production (`--resume`). Set `CLAUDE_BIN` to use another `claude`.
   With `REEL_AGENT=codex` it runs `codex exec --json` instead (your Codex login, `OPENAI_API_KEY` removed), in Codex's
   `workspace-write` sandbox (edits inside the project only) with the `reel-desk` tools, resuming one session per
   production (`review.json` → `codex.session`). `CODEX_BIN` picks another `codex`. Copilot has no headless runner here
   yet; use way 1 or 3 from Copilot.
3. **`reel-desk` MCP server** (`desk/mcp.mjs`), optional on top of the optional desk, and not registered by default.
   Add it with `claude mcp add reel-desk --scope project -- node desk/mcp.mjs` (Codex: `codex mcp add reel-desk -- node
   desk/mcp.mjs`; Copilot: an entry in `.vscode/mcp.json`). It lets an agent session see the desk:
   `desk_state`, `list_productions`, `list_notes`, `add_note`, `resolve_note`, `render_frame` (returns the image).
   It has no approval tool.

## Safety

The server listens on 127.0.0.1 only, serves files from the project root only (not `.git` or `.env*`), and refuses
API calls from other origins, so another site open in your browser can't drive it. It has no dependencies.

## Files

| | |
|---|---|
| `server.mjs` | HTTP server: static files with range requests (for plates) + the JSON API + job streams (SSE) |
| `lib.mjs` | Productions, notes, approvals, render commands, the agent prompt. Shared by the server and the MCP server |
| `mcp.mjs` | The `reel-desk` MCP server (stdio JSON-RPC) |
| `index.html`, `app.js`, `desk.css` | The page. No build step |
