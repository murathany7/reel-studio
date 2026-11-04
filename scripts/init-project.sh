#!/usr/bin/env bash
# Copy the Reel Studio kit into a project so its skills can render there.
#   scripts/init-project.sh <kit_root> [project_dir] [--update] [--with-skills]
# Copies core/, engines/, looks/ (art directions), scripts/, desk/ (the optional review app), the engines and reel-layer demos and the brand/production templates, adds AGENTS.md
# (read by Codex, Copilot and, through CLAUDE.md's @import, Claude Code), CLAUDE.md, STATUS.md and .gitignore if missing,
# then runs npm install in core/ and checks the tools.
# Existing files are kept; --update refreshes core/, engines/ and scripts/ (and the skills) from the kit (brands and
# productions are never touched). --with-skills also copies the skills into .agents/skills/ (Codex, Copilot) and links
# .claude/skills to it (Claude Code), for installs without the Claude Code plugin, e.g. npx reel-studio init.
set -euo pipefail

update=""; skills=""; args=()
for a in "$@"; do
  case "$a" in
    --update) update="--update" ;;
    --with-skills) skills=1 ;;
    *) args+=("$a") ;;
  esac
done
kit="${args[0]:?usage: init-project.sh <kit_root> [project_dir] [--update] [--with-skills]}"
dest="${args[1]:-.}"
kit="$(cd "$kit" && pwd)"
dest="$(mkdir -p "$dest" && cd "$dest" && pwd)"

if [ "$kit" = "$dest" ]; then
  echo "This is the Reel Studio repo itself; nothing to copy."
else
  copy() {  # copy <src rel> <dest rel> [overwrite]
    mkdir -p "$dest/$2"
    if [ "${3:-}" = overwrite ]; then
      rsync -a --exclude node_modules --exclude __pycache__ --exclude check-metrics "$kit/$1/" "$dest/$2/"
    else
      rsync -a --ignore-existing --exclude node_modules --exclude __pycache__ --exclude check-metrics "$kit/$1/" "$dest/$2/"
    fi
  }
  mode=""; [ "$update" = "--update" ] && mode=overwrite
  copy core core $mode
  copy engines engines $mode
  copy looks looks $mode
  copy scripts scripts $mode
  copy desk desk $mode
  copy brands/_template brands/_template
  copy productions/_TEMPLATE productions/_TEMPLATE
  if [ -n "$skills" ]; then
    copy .agents/skills .agents/skills $mode
    mkdir -p "$dest/.claude"
    if [ -d "$dest/.claude/skills" ] && [ ! -L "$dest/.claude/skills" ]; then
      copy .agents/skills .claude/skills $mode  # a project from before .agents/: keep its own folder up to date
    else
      ln -sfn ../.agents/skills "$dest/.claude/skills"
    fi
  fi
  mkdir -p "$dest/examples/engines-demo/plates"
  cp -n "$kit/examples/engines-demo/index.html" "$kit/examples/engines-demo/README.md" "$kit/examples/engines-demo/talk.visemes.js" "$dest/examples/engines-demo/" 2>/dev/null || true
  cp -n "$kit/examples/engines-demo/plates/blob.mp4" "$dest/examples/engines-demo/plates/" 2>/dev/null || true
  # The reel-layer demo (captions, beats, transitions, formats); not its fetched Rive sample
  rsync -a --ignore-existing --exclude assets "$kit/examples/reel-layer/" "$dest/examples/reel-layer/" 2>/dev/null || true
  [ -e "$dest/CLAUDE.md" ] && ! grep -q '^@AGENTS.md' "$dest/CLAUDE.md" && [ ! -e "$dest/AGENTS.md" ] && legacy=1 || legacy=""
  for f in AGENTS.md CLAUDE.md STATUS.md; do
    [ -e "$dest/$f" ] || sed "s/{{DATE}}/$(date +%F)/" "$kit/templates/project/$f" > "$dest/$f"
  done
  [ -n "$legacy" ] && echo "Note: CLAUDE.md predates AGENTS.md. Move your own rules from CLAUDE.md into AGENTS.md (Codex and Copilot read it), then leave just '@AGENTS.md' in CLAUDE.md."
  [ -e "$dest/.gitignore" ] || cp "$kit/templates/project/gitignore" "$dest/.gitignore"
  # The desk as a named dev server, so the Claude desktop app can open it in its browser pane ("open the desk").
  # Adds the entry to an existing launch.json; leaves one that already has a "desk" entry alone.
  mkdir -p "$dest/.claude"
  node -e '
    const fs = require("fs"), f = process.argv[1];
    let j = { version: "0.0.1", configurations: [] };
    if (fs.existsSync(f)) { try { j = JSON.parse(fs.readFileSync(f, "utf8")); } catch { console.log("Note: .claude/launch.json is not valid JSON; desk entry not added."); process.exit(0); } }
    j.configurations ||= [];
    if (j.configurations.some((c) => c.name === "desk")) process.exit(0);
    j.configurations.push({ name: "desk", runtimeExecutable: "node", runtimeArgs: ["desk/server.mjs", "--port", "4100"], port: 4100 });
    fs.writeFileSync(f, JSON.stringify(j, null, 2) + "\n");
  ' "$dest/.claude/launch.json"
  echo "Kit copied into $dest"
fi

(cd "$dest/core" && npm install --no-audit --no-fund --loglevel=error)

echo
echo "Tools:"
ok() { printf '  ✅ %s\n' "$1"; }
no() { printf '  ❌ %s  → %s\n' "$1" "$2"; }
command -v node >/dev/null && ok "node $(node -v)" || no node "install Node 18+"
command -v ffmpeg >/dev/null && ok ffmpeg || no ffmpeg "brew install ffmpeg"
chrome="${CHROME_PATH:-}"
for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" /usr/bin/google-chrome /usr/bin/google-chrome-stable /usr/bin/chromium; do
  [ -z "$chrome" ] && [ -x "$c" ] && chrome="$c"
done
[ -n "$chrome" ] && ok "Chrome ($chrome)" || no "Google Chrome" "install it, or set CHROME_PATH"
command -v python3 >/dev/null && ok python3 || no python3 "needed for audio mix and QA"
command -v blender >/dev/null || [ -x /Applications/Blender.app/Contents/MacOS/Blender ] && ok "Blender (optional)" || echo "  ➖ Blender not found (optional, only for 3D plates)"
command -v whisper-cli >/dev/null && ok "whisper-cpp (optional)" || echo "  ➖ whisper-cpp not found (optional, for captions and word timings: brew install whisper-cpp)"
{ [ -n "${RHUBARB:-}" ] || command -v rhubarb >/dev/null || ls "$HOME"/.cache/rhubarb-lip-sync/*/rhubarb >/dev/null 2>&1; } \
  && ok "Rhubarb Lip Sync (optional)" \
  || echo "  ➖ Rhubarb Lip Sync not found (optional, for lip sync: see scripts/lipsync.sh)"
python3 -c "import kokoro_onnx, soundfile" 2>/dev/null && ok "Kokoro voice (optional)" \
  || echo "  ➖ Kokoro not found (optional, free AI voiceover: pip install kokoro-onnx soundfile)"
