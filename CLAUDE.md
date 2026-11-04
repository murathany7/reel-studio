@AGENTS.md

## Claude Code only

- The skills are in `.agents/skills/`; `.claude/skills` is a symlink to it, so edit them there.
- The plugin (`.claude-plugin/plugin.json`) ships the same folder. Codex and Copilot read `AGENTS.md` and
  `.agents/skills/` directly, so nothing Claude-specific belongs in either.
