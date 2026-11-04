#!/usr/bin/env bash
# Lip-sync timing from a voice track with Rhubarb Lip Sync (mouth shapes A–H + X, the Preston Blair set).
#
#   scripts/lipsync.sh <vo.wav|mp3|…> <out.json> [--dialog <script.txt>] [--basic] [--phonetic]
#
#   out.json  Rhubarb's JSON: {"metadata":{"duration":…},"mouthCues":[{"start":0.0,"end":0.12,"value":"X"}, …]}
#             plus out.js, the same cues as window.LIPSYNC["<basename>"] for a <script> tag (no fetch at render time).
#             Read them with engines/lipsync.js (SVG rig, mascot image, Three.js) or engines/blender/lipsync.py.
#             Cue times are seconds from the start of the audio file: pass the VO's start in the mix as `offset`.
#   --dialog  The spoken text (the approved VO script, one take per file). Makes the English recogniser much more
#             accurate. scripts/transcribe.sh writes one if there is no script.
#   --basic   Only the six basic shapes A–F (no G, H, X). Default: all nine.
#   --phonetic  Language-independent recogniser, for VO that is not English (less accurate).
#
# Install: Rhubarb is one binary (not in Homebrew). Looked for in $RHUBARB, on PATH, then in
# ~/.cache/rhubarb-lip-sync/*/rhubarb. Download the macOS or Linux zip from
# https://github.com/DanielSWolf/rhubarb-lip-sync/releases (tested: v1.14.0) and unzip it into ~/.cache/rhubarb-lip-sync/.
# The macOS build is x86_64: Apple Silicon needs Rosetta (softwareupdate --install-rosetta).
set -euo pipefail
usage="usage: lipsync.sh <vo.wav> <out.json> [--dialog file] [--basic] [--phonetic]"
IN="${1:?$usage}"
OUT="${2:?$usage}"
shift 2
DIALOG=""; SHAPES="GHX"; RECOG="pocketSphinx"
while [ $# -gt 0 ]; do
  case "$1" in
    --dialog) DIALOG="${2:?--dialog needs a file}"; shift 2 ;;
    --basic) SHAPES=""; shift ;;
    --phonetic) RECOG="phonetic"; shift ;;
    *) echo "unknown option: $1" >&2; echo "$usage" >&2; exit 2 ;;
  esac
done
[ -f "$IN" ] || { echo "no such audio file: $IN" >&2; exit 1; }
[ -z "$DIALOG" ] || [ -f "$DIALOG" ] || { echo "no such dialog file: $DIALOG" >&2; exit 1; }

find_rhubarb() {
  if [ -n "${RHUBARB:-}" ] && [ -x "$RHUBARB" ]; then echo "$RHUBARB"; return; fi
  if command -v rhubarb >/dev/null 2>&1; then command -v rhubarb; return; fi
  local c
  for c in "$HOME"/.cache/rhubarb-lip-sync/*/rhubarb; do [ -x "$c" ] && { echo "$c"; return; }; done
  return 1
}
BIN="$(find_rhubarb)" || {
  echo "Rhubarb Lip Sync not found. Download the zip for your OS from" >&2
  echo "https://github.com/DanielSWolf/rhubarb-lip-sync/releases and unzip it into ~/.cache/rhubarb-lip-sync/" >&2
  exit 1
}

# Rhubarb reads WAV/OGG only: make a 16 kHz mono WAV (the recogniser's native rate) from anything.
TMP="$(mktemp -d)"; trap 'rm -rf "$TMP"' EXIT
WAV="$TMP/vo.wav"
ffmpeg -v error -y -i "$IN" -vn -ac 1 -ar 16000 -c:a pcm_s16le "$WAV"

mkdir -p "$(dirname "$OUT")"
ARGS=(-f json -r "$RECOG" -o "$OUT" --extendedShapes "$SHAPES")
[ -n "$DIALOG" ] && ARGS+=(--dialogFile "$DIALOG")
"$BIN" "${ARGS[@]}" "$WAV" 2> "$TMP/log" || {
  cat "$TMP/log" >&2
  grep -q "Bad CPU type" "$TMP/log" && echo "→ the macOS build needs Rosetta: softwareupdate --install-rosetta" >&2
  exit 1
}

# A .js twin next to the .json, so a composition can load the cues with a <script> tag:
#   <script src="audio/vo.visemes.js"></script>  →  window.LIPSYNC["vo.visemes"]
python3 - "$OUT" <<'PY'
import collections, json, os, sys
out = sys.argv[1]
d = json.load(open(out))
d.get("metadata", {}).pop("soundFile", None)          # a temp path; the cues are what matter
json.dump(d, open(out, "w"), separators=(",", ":"))
key = os.path.basename(os.path.splitext(out)[0])
with open(os.path.splitext(out)[0] + ".js", "w") as f:
    f.write("window.LIPSYNC = window.LIPSYNC || {};\nwindow.LIPSYNC[%s] = %s;\n"
            % (json.dumps(key), json.dumps(d, separators=(",", ":"))))
cues = d["mouthCues"]
counts = collections.Counter(c["value"] for c in cues)
talk = sum(c["end"] - c["start"] for c in cues if c["value"] != "X")
print(f"{out}: {len(cues)} cues over {d['metadata']['duration']:.2f} s, mouth moving {talk:.2f} s, shapes "
      + " ".join(f"{k}:{v}" for k, v in sorted(counts.items())))
PY
