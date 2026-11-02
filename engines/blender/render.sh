#!/usr/bin/env bash
# Render a Blender scene script to an MP4 plate the composition plays with Studio.video().
#
#   engines/blender/render.sh <scene.py> <out.mp4> [--size 1080x1920] [--fps 30] [--duration 4] [--engine EEVEE|CYCLES|WORKBENCH]
#
# <scene.py> builds the scene with bpy and defines build(ctx); see example_scene.py.
# Frames go to a temp folder, then ffmpeg encodes with every frame a keyframe
# so the browser can seek it frame-exactly. Alpha is not kept: render the
# background in Blender, or put the plate behind transparent HTML layers.
set -euo pipefail
BLENDER="${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}"
here="$(cd "$(dirname "$0")" && pwd)"
scene="$1"; out="$2"; shift 2
frames="$(mktemp -d)/f_"
"$BLENDER" -b --factory-startup -noaudio --python "$here/run.py" -- "$scene" "$frames" "$@" >"${frames%f_}blender.log" 2>&1 \
  || { tail -30 "${frames%f_}blender.log"; exit 1; }
fps=$(awk '/^FPS /{print $2}' "${frames%f_}blender.log")
mkdir -p "$(dirname "$out")"
ffmpeg -hide_banner -loglevel error -y -framerate "$fps" -i "${frames}%05d.png" \
  -c:v libx264 -preset slow -crf 12 -pix_fmt yuv420p -g 1 -movflags +faststart "$out"
echo "$out  ($(ls "${frames%f_}" | grep -c png) frames @ ${fps} fps)"
