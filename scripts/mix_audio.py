"""Mix voiceover, music and sound effects into one track for a reel.

    python3 scripts/mix_audio.py <cues.json> <out.wav>

cues.json (paths relative to the cues file):
{
  "duration": 15.0,
  "tracks": [
    {"file": "vo.mp3",      "role": "vo",    "start": 0.3},
    {"file": "music.mp3",   "role": "music", "start": 0, "volume": 0.35, "fade_in": 0.4, "fade_out": 1.2},
    {"file": "sfx-pop.mp3", "role": "sfx",   "start": 1.5, "volume": 0.8}
  ]
}

- Music is ducked automatically under any "vo" track (sidechain compression).
- The final mix is loudness-normalised to -14 LUFS, true peak -2.0 dBTP (AAC encoding adds ~0.6 dB, so the MP4 lands under -1.5),
  48 kHz stereo, and trimmed/padded to exactly `duration` seconds.
"""
import json
import os
import subprocess
import sys

cues_path, out = sys.argv[1], sys.argv[2]
cues = json.load(open(cues_path, encoding="utf-8"))
base = os.path.dirname(os.path.abspath(cues_path))
dur = float(cues["duration"])
tracks = cues["tracks"]

inputs, chains, vo_labels, music_labels, other_labels = [], [], [], [], []
for i, t in enumerate(tracks):
    inputs += ["-i", os.path.join(base, t["file"])]
    start = float(t.get("start", 0))
    length = max(0.0, dur - start)
    f = [f"aformat=sample_rates=48000:channel_layouts=stereo", f"atrim=0:{length:.3f}", "asetpts=PTS-STARTPTS"]
    if t.get("fade_in"):
        f.append(f"afade=t=in:st=0:d={t['fade_in']}")
    if t.get("fade_out"):
        f.append(f"afade=t=out:st={max(0.0, length - float(t['fade_out'])):.3f}:d={t['fade_out']}")
    f.append(f"volume={t.get('volume', 1.0)}")
    ms = int(round(start * 1000))
    f.append(f"adelay={ms}|{ms}")
    f.append(f"apad=whole_dur={dur:.3f}")
    label = f"t{i}"
    chains.append(f"[{i}:a]{','.join(f)}[{label}]")
    {"vo": vo_labels, "music": music_labels}.get(t.get("role"), other_labels).append(label)

mix_labels = list(other_labels)
if vo_labels:
    if len(vo_labels) > 1:
        chains.append("".join(f"[{l}]" for l in vo_labels) + f"amix=inputs={len(vo_labels)}:normalize=0[vo]")
    else:
        chains.append(f"[{vo_labels[0]}]anull[vo]")
    if music_labels:
        chains.append("[vo]asplit=2[vokey][vomix]")
        mix_labels.append("vomix")
    else:
        mix_labels.append("vo")
for j, m in enumerate(music_labels):
    if vo_labels:
        key = "vokey" if j == 0 else f"vokey{j}"
        if j > 0:
            chains.append(f"[vokey]asplit=2[vokey][{key}]")  # pragma: rare (several music beds)
        chains.append(f"[{m}][{key}]sidechaincompress=threshold=0.04:ratio=8:attack=15:release=350:makeup=1[{m}d]")
        mix_labels.append(f"{m}d")
    else:
        mix_labels.append(m)

chains.append(
    "".join(f"[{l}]" for l in mix_labels)
    + f"amix=inputs={len(mix_labels)}:normalize=0,loudnorm=I=-14:TP=-2.0:LRA=11,"
    + f"aresample=48000,atrim=0:{dur:.3f}[out]"
)

cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", *inputs,
       "-filter_complex", ";".join(chains), "-map", "[out]", "-ar", "48000", "-ac", "2", out]
subprocess.run(cmd, check=True)
print(f"{out}  ({dur}s, {len(tracks)} tracks, music ducked under VO: {bool(vo_labels and music_labels)})")
