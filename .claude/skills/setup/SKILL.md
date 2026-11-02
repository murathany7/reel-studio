---
name: setup
description: Set up Reel Studio in the current project - copy the renderer, engines, scripts and templates into it, install dependencies and check Chrome, ffmpeg and the optional tools. Use right after installing the plugin, when asked to "set up reel studio", or when another skill needs core/render.mjs and it is missing. Also updates the kit with --update.
---

# Setting up Reel Studio in a project

Compositions load `/core/...`, `/engines/...` and `/brands/...` from the project root, so the kit lives in the
project, not only in the plugin. This copies it in once.

1. Kit root: `${CLAUDE_PLUGIN_ROOT}`. If that text is shown literally (not a path), this skill is running from a
   clone of the Reel Studio repo: the kit root is the repo root and nothing needs copying.
2. Run, from the project root:
   ```bash
   bash "${CLAUDE_PLUGIN_ROOT}/scripts/init-project.sh" "${CLAUDE_PLUGIN_ROOT}" .
   ```
   It copies `core/`, `engines/`, `scripts/`, `examples/engines-demo/`, `brands/_template/` and
   `productions/_TEMPLATE/`, adds `CLAUDE.md`, `STATUS.md` and `.gitignore` if missing, never overwrites existing
   files, runs `npm install` in `core/` and prints which tools are found.
   To refresh `core/`, `engines/` and `scripts/` after a plugin update, add `--update` as the third argument.
3. Fix any ❌ the script prints: tell the user the one command for each (e.g. `brew install ffmpeg`). Chrome
   elsewhere → `CHROME_PATH=/path/to/chrome`.
4. Check the machine with one frame (no Blender needed):
   ```bash
   node core/render.mjs still examples/engines-demo/index.html /tmp/reel-studio-check.png --t 3
   ```
   Look at the PNG: a toon donut with "Three.js" above it means rendering works.
5. Next: no brand in `brands/` yet → offer the `new-brand` skill. Otherwise → `make-video`.
