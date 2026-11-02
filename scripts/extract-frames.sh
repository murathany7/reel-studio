#!/usr/bin/env bash
# Break a reference ad/reel into things an AI can actually look at:
#   - metadata (duration, resolution, fps)
#   - dense frames for the hook (first 3 s at 4 fps)
#   - 1 frame per second for the rest
#   - scene-cut frames (where the editor cut)
#   - a contact sheet of the whole video
#   - the audio track as 16 kHz mono WAV (for transcription)
#
#   scripts/extract-frames.sh <video> <out_dir>
#
# Example:
#   scripts/extract-frames.sh ads-inbox/huckleberry-nap.mp4 ads-analysis/AD-001-huckleberry-nap
set -euo pipefail

in="$1"; out="$2"
command -v ffmpeg >/dev/null || { echo "ffmpeg is required (brew install ffmpeg)" >&2; exit 1; }
mkdir -p "$out/frames/hook" "$out/frames/1fps" "$out/frames/cuts"

ffprobe -v error -show_entries format=duration:stream=codec_type,width,height,r_frame_rate \
  -of default=noprint_wrappers=1 "$in" > "$out/metadata.txt"
dur=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$in" | cut -d. -f1)

# Hook: first 3 seconds, 4 frames per second, timestamp burned in the filename.
ffmpeg -v error -y -t 3 -i "$in" -vf "fps=4,scale=540:-2" "$out/frames/hook/hook_%02d.jpg"

# Whole video: 1 frame per second (frame N = second N-1).
ffmpeg -v error -y -i "$in" -vf "fps=1,scale=540:-2" "$out/frames/1fps/sec_%03d.jpg"

# Scene cuts (threshold 0.3). The log gives the cut timestamps.
ffmpeg -v error -y -i "$in" \
  -vf "select='gt(scene,0.3)',metadata=print:file=$out/cuts.log,scale=540:-2" -vsync vfr \
  "$out/frames/cuts/cut_%03d.jpg" || true
grep -oE 'pts_time:[0-9.]+' "$out/cuts.log" | cut -d: -f2 > "$out/cut_times.txt" || true
rm -f "$out/cuts.log"

# Contact sheet: up to 30 evenly spaced frames, 6 columns.
n=30; [ "${dur:-0}" -gt 0 ] && rate=$(awk -v n=$n -v d="$dur" 'BEGIN{printf "%.4f", n/d}') || rate=1
ffmpeg -v error -y -i "$in" -vf "fps=$rate,scale=240:-2,tile=6x5:padding=4:color=white" \
  -frames:v 1 "$out/contact_sheet.jpg" || true

# Audio for transcription (skipped if the video has no audio stream).
if ffprobe -v error -select_streams a -show_entries stream=index -of csv=p=0 "$in" | grep -q .; then
  ffmpeg -v error -y -i "$in" -vn -ac 1 -ar 16000 "$out/audio.wav"
  # Auto-transcribe (language auto-detected) when whisper.cpp is set up.
  here="$(cd "$(dirname "$0")" && pwd)"
  if command -v whisper-cli >/dev/null; then
    "$here/transcribe.sh" "$out/audio.wav" "$out/transcript" auto || echo "Transcription failed (see above)"
  fi
fi

echo "Duration: ${dur}s"
echo "Scene cuts: $(wc -l < "$out/cut_times.txt" | tr -d ' ')"
echo "Wrote: $out/{metadata.txt,contact_sheet.jpg,cut_times.txt,frames/,audio.wav}"
