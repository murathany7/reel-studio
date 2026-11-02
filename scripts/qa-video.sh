#!/usr/bin/env bash
# Quality check for a finished reel / video ad. Writes <qa_dir>/report.md plus
# evidence images. Run it on every export before delivering (the qa-deliver step in .claude/skills/make-video).
#
#   scripts/qa-video.sh <video.mp4> <qa_dir> [expected WxH=1080x1920] [fps=30]
#
# Checks: format specs, constant frame rate, loudness (-14 LUFS / -1 dBTP),
# frame-to-frame smoothness (hitches, jumps), frozen and black sections,
# and a contact sheet with the paid-Reels safe zones drawn on it.
set -euo pipefail

in="$1"; qa="$2"; want_size="${3:-1080x1920}"; want_fps="${4:-30}"
here="$(cd "$(dirname "$0")" && pwd)"
mkdir -p "$qa/flagged"
rep="$qa/report.md"

probe() { ffprobe -v error -select_streams "$1" -show_entries "stream=$2" -of default=nw=1:nk=1 "$in" | head -1; }
w=$(probe v:0 width); h=$(probe v:0 height)
rfr=$(probe v:0 r_frame_rate); afr=$(probe v:0 avg_frame_rate)
vcodec=$(probe v:0 codec_name); pix=$(probe v:0 pix_fmt)
acodec=$(probe a:0 codec_name || true); arate=$(probe a:0 sample_rate || true)
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in")
fps=$(awk -F/ '{ printf "%.3f", $1/$2 }' <<<"$rfr")

ok() { [ "$1" = "$2" ] && echo "✅" || echo "❌ (want $2)"; }

{
  echo "# QA report — $(basename "$in")"
  echo
  echo "Generated $(date '+%Y-%m-%d %H:%M')."
  echo
  echo "## Specs"
  echo
  echo "| Check | Value | Result |"
  echo "|---|---|---|"
  echo "| Size | ${w}x${h} | $(ok "${w}x${h}" "$want_size") |"
  echo "| Frame rate | $fps fps (r=$rfr, avg=$afr) | $(ok "$(printf '%.0f' "$fps")" "$want_fps") |"
  echo "| Constant frame rate | r=$rfr avg=$afr | $( [ "$rfr" = "$afr" ] && echo ✅ || echo '⚠️ variable') |"
  echo "| Video codec / pixel format | $vcodec / $pix | $(ok "$vcodec/$pix" "h264/yuv420p") |"
  echo "| Audio | ${acodec:-none} ${arate:+@ $arate Hz} | $( [ -z "$acodec" ] && echo '⚠️ no audio' || ok "$acodec/$arate" "aac/48000") |"
  echo "| Duration | ${dur}s | — |"
} > "$rep"

# Loudness
if [ -n "$acodec" ]; then
  ffmpeg -nostats -hide_banner -i "$in" -filter_complex ebur128=peak=true -f null - 2> "$qa/loudness.log" || true
  I=$(grep -A12 "Summary:" "$qa/loudness.log" | awk '/I:/ {print $2; exit}')
  TP=$(grep -A20 "Summary:" "$qa/loudness.log" | awk '/Peak:/ {print $2; exit}')
  li=$(awk -v i="$I" 'BEGIN{ print (i >= -16 && i <= -12) ? "✅" : "⚠️ aim for -14" }')
  lt=$(awk -v t="$TP" 'BEGIN{ print (t <= -1.0) ? "✅" : "⚠️ above -1 dBTP" }')
  { echo "| Loudness (integrated) | $I LUFS | $li |"; echo "| True peak | $TP dBTP | $lt |"; } >> "$rep"
fi

# Smoothness: per-frame difference
ffmpeg -v error -i "$in" -vf "format=gray,tblend=all_mode=difference,lut=c0='if(gt(val\,6)\,255\,0)',signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=$qa/diff.txt" -f null - || true
motion=$(python3 "$here/qa_motion.py" "$qa/diff.txt" "$fps" "$qa/motion.csv")
rm -f "$qa/diff.txt"

# Freeze and black detection
ffmpeg -v info -nostats -i "$in" -vf "freezedetect=n=0.001:d=1.5,blackdetect=d=0.2:pix_th=0.05" -an -f null - 2> "$qa/detect.log" || true
freezes=$(grep -oE 'freeze_(start|duration): [0-9.]+' "$qa/detect.log" | paste -sd' ' - || true)
blacks=$(grep -oE 'black_start:[0-9.]+ black_end:[0-9.]+' "$qa/detect.log" | paste -sd' ' - || true)
rm -f "$qa/detect.log"

# Evidence frames for each flag (previous + flagged frame side by side)
for f in $(cat "$qa/motion_flags.txt"); do
  kind=${f%%:*}; n=${f##*:}
  ffmpeg -v error -y -i "$in" -vf "select='between(n,$((n-1)),$n)',scale=360:-2,tile=2x1" -frames:v 1 "$qa/flagged/${kind}_frame_${n}.jpg" || true
done

# Contact sheet every 0.5 s with safe zones (paid Reels: top 14%, bottom 35%, sides 6%)
safe="drawbox=x=0:y=0:w=iw:h=ih*0.14:color=red@0.3:t=fill,drawbox=x=0:y=ih*0.65:w=iw:h=ih*0.35:color=red@0.3:t=fill,drawbox=x=0:y=0:w=iw*0.06:h=ih:color=red@0.3:t=fill,drawbox=x=iw*0.94:y=0:w=iw*0.06:h=ih:color=red@0.3:t=fill"
n=$(awk -v d="$dur" 'BEGIN{ printf "%d", d*2 }'); cols=6; rows=$(( (n + cols - 1) / cols ))
ffmpeg -v error -y -i "$in" -vf "fps=2,$safe,scale=216:-2,tile=${cols}x${rows}:padding=4:color=white" -frames:v 1 "$qa/contact_sheet_safezones.jpg" || true

{
  echo
  echo "## Motion"
  echo
  echo '```json'
  echo "$motion"
  echo '```'
  echo
  echo "- **Hitches** (a duplicate frame during motion) cause visible stutter. Fix the timeline at those times."
  echo "- **Jumps** are frames that change much more than their neighbours. Fine if it's an intended hard cut; otherwise add easing or a transition. Evidence is in \`flagged/\`."
  echo "- Frozen sections (≥1.5 s): ${freezes:-none}"
  echo "- Black sections: ${blacks:-none}"
  echo
  echo "## Visual review"
  echo
  echo "- \`contact_sheet_safezones.jpg\`: every 0.5 s (left→right, top→bottom; tile k = k×0.5 s) with paid-Reels unsafe areas in red. No text, logo, mascot or CTA may sit in red."
  echo "- Then review the key beats frame by frame (\`render.mjs stills --at …\`) and listen once with sound."
} >> "$rep"

cat "$rep"
