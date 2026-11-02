#!/usr/bin/env bash
# Copy the Reel Studio kit into a project so its skills can render there.
#   scripts/init-project.sh <kit_root> [project_dir] [--update] [--with-skills]
# Copies core/, engines/, scripts/, the engines demo and the brand/production templates, adds CLAUDE.md,
# STATUS.md and .gitignore if missing, then runs npm install in core/ and checks the tools.
# Existing files are kept; --update refreshes core/, engines/ and scripts/ (and the skills) from the kit (brands and
# productions are never touched). --with-skills also copies the skills into .claude/skills/ (for installs without
# the Claude Code plugin, e.g. npx reel-studio init).
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
      rsync -a --exclude node_modules --exclude __pycache__ "$kit/$1/" "$dest/$2/"
    else
      rsync -a --ignore-existing --exclude node_modules --exclude __pycache__ "$kit/$1/" "$dest/$2/"
    fi
  }
  mode=""; [ "$update" = "--update" ] && mode=overwrite
  copy core core $mode
  copy engines engines $mode
  copy scripts scripts $mode
  copy brands/_template brands/_template
  copy productions/_TEMPLATE productions/_TEMPLATE
  [ -n "$skills" ] && copy .claude/skills .claude/skills $mode
  mkdir -p "$dest/examples/engines-demo/plates"
  cp -n "$kit/examples/engines-demo/index.html" "$kit/examples/engines-demo/README.md" "$dest/examples/engines-demo/" 2>/dev/null || true
  cp -n "$kit/examples/engines-demo/plates/blob.mp4" "$dest/examples/engines-demo/plates/" 2>/dev/null || true
  for f in CLAUDE.md STATUS.md; do
    [ -e "$dest/$f" ] || sed "s/{{DATE}}/$(date +%F)/" "$kit/templates/project/$f" > "$dest/$f"
  done
  [ -e "$dest/.gitignore" ] || cp "$kit/templates/project/gitignore" "$dest/.gitignore"
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
command -v whisper-cli >/dev/null && ok "whisper-cpp (optional)" || echo "  ➖ whisper-cpp not found (optional, for captions and lip sync: brew install whisper-cpp)"
