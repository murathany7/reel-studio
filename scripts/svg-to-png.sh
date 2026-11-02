#!/usr/bin/env bash
# Render an SVG to a transparent PNG at a given height, using headless Chrome
# (no ImageMagick / rsvg needed). Used to make overlay-ready brand assets for
# video tools that can't read SVG (ffmpeg, CapCut, etc.).
#
#   scripts/svg-to-png.sh <in.svg> <out.png> [height_px=1200]
set -euo pipefail

in="$1"; out="$2"; h="${3:-1200}"
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$chrome" ] || { echo "Google Chrome not found at $chrome" >&2; exit 1; }

# Aspect ratio from the viewBox (falls back to width/height attributes).
vb=$(grep -oE 'viewBox="[^"]+"' "$in" | head -1 | sed -E 's/viewBox="([^"]+)"/\1/' || true)
if [ -n "$vb" ]; then
  read -r _ _ vw vh <<<"$vb"
else
  vw=$(grep -oE ' width="[0-9.]+' "$in" | head -1 | grep -oE '[0-9.]+')
  vh=$(grep -oE ' height="[0-9.]+' "$in" | head -1 | grep -oE '[0-9.]+')
fi
w=$(awk -v vw="$vw" -v vh="$vh" -v h="$h" 'BEGIN { printf "%d", (vw / vh) * h + 0.5 }')

tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
abs_in="$(cd "$(dirname "$in")" && pwd)/$(basename "$in")"
cat >"$tmp/page.html" <<HTML
<html><body style="margin:0;background:transparent">
<img src="file://$abs_in" style="display:block;width:${w}px;height:${h}px">
</body></html>
HTML

"$chrome" --headless=new --disable-gpu --hide-scrollbars \
  --allow-file-access-from-files --user-data-dir="$tmp/profile" \
  --default-background-color=00000000 \
  --window-size="${w},${h}" --screenshot="$out" "file://$tmp/page.html" >/dev/null 2>&1

echo "$out (${w}x${h})"
