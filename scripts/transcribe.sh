#!/usr/bin/env bash
# Transcribe a video or audio file with whisper.cpp (local, free, offline).
# Writes <out_prefix>.txt (plain), .srt (timed subtitles) and .json (word/segment timings).
#
#   scripts/transcribe.sh <video_or_audio> <out_prefix> [language=auto]
#
# language: auto | en | tr | es | pt | it | fr | de
# Model: $WHISPER_MODEL, default ~/.cache/whisper-cpp/ggml-large-v3-turbo-q5_0.bin
#   (download: curl -L -o ~/.cache/whisper-cpp/ggml-large-v3-turbo-q5_0.bin \
#    https://huggingface.co/ggerganov/whisper.cpp/resolve/main/ggml-large-v3-turbo-q5_0.bin)
set -euo pipefail

in="$1"; out="$2"; lang="${3:-auto}"
model="${WHISPER_MODEL:-$HOME/.cache/whisper-cpp/ggml-large-v3-turbo-q5_0.bin}"
command -v whisper-cli >/dev/null || { echo "whisper-cli missing: brew install whisper-cpp" >&2; exit 1; }
[ -f "$model" ] || { echo "Whisper model not found: $model" >&2; exit 1; }

tmp=$(mktemp -d); trap 'rm -rf "$tmp"' EXIT
# whisper.cpp wants 16 kHz mono WAV.
ffmpeg -v error -y -i "$in" -vn -ac 1 -ar 16000 "$tmp/audio.wav"

whisper-cli -m "$model" -f "$tmp/audio.wav" -l "$lang" -otxt -osrt -ojf -of "$out" -np >/dev/null 2>"$tmp/log" \
  || { cat "$tmp/log" >&2; exit 1; }

echo "Wrote $out.txt, $out.srt, $out.json"
