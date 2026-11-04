"""Free, local voiceover with Kokoro (open-weights TTS, Apache 2.0; runs offline on the CPU).

    python3 scripts/voice.py <script.json> <out_prefix>

script.json (start = when the line begins in the piece, seconds):
{
  "voice": "am_michael", "speed": 1.05, "lang": "en-us",
  "lines": [
    {"start": 0.10, "text": "My bike remembers every ride."},
    {"start": 2.05, "text": "One Raspberry Pi, in a sealed box."}
  ]
}

Writes <out_prefix>.wav (all lines placed at their start, 48 kHz) and <out_prefix>.json: the words with their times,
ready for Studio.captions(el, "<out_prefix>.json"). Word times are estimated from each line's spoken length (silence
trimmed, split by letters); good for captions, check them on the stills. A line longer than the gap to the next one
is reported, so the storyboard can be fixed instead of the voice overlapping itself.

Use it for drafts and for pieces where a synthetic voice is fine (disclose AI voice where the platform asks).
ElevenLabs (better voices, paid) or the person's own recording replace it with the same cues.json.

Setup, once: pip install kokoro-onnx soundfile. The model (~120 MB) downloads to ~/.cache/reel-studio/kokoro on the
first run. Voices: am_michael, am_adam, am_eric, af_heart, af_bella, af_nicole, bf_emma, bm_george, … (en-us / en-gb).
"""
import json
import os
import re
import sys
import urllib.request

import numpy as np

CACHE = os.path.expanduser("~/.cache/reel-studio/kokoro")
BASE = "https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/"
FILES = ["kokoro-v1.0.int8.onnx", "voices-v1.0.bin"]
SR_OUT = 48000


def model():
    os.makedirs(CACHE, exist_ok=True)
    for f in FILES:
        p = os.path.join(CACHE, f)
        if not os.path.exists(p):
            print(f"Downloading {f} …", file=sys.stderr)
            urllib.request.urlretrieve(BASE + f, p + ".part")
            os.replace(p + ".part", p)
    from kokoro_onnx import Kokoro
    return Kokoro(*(os.path.join(CACHE, f) for f in FILES))


def trim(x, sr, floor=0.02):
    """Drop leading/trailing silence; returns the trimmed samples."""
    loud = np.flatnonzero(np.abs(x) > floor * max(1e-9, np.abs(x).max()))
    if not len(loud):
        return x
    pad = int(0.02 * sr)
    return x[max(0, loud[0] - pad): loud[-1] + pad]


def word_times(text, start, dur):
    words = text.split()
    # weight = letters + a little for every word (short words still take time) + pauses after punctuation
    w = [len(re.sub(r"[^\w']", "", x)) + 1.5 for x in words]
    pause = [0.6 * w[i] if re.search(r"[,.;:!?]$", x) and i < len(words) - 1 else 0 for i, x in enumerate(words)]
    total = sum(w) + sum(pause)
    out, t = [], start
    for x, wi, pi in zip(words, w, pause):
        d = dur * wi / total
        out.append({"text": x, "start": round(t, 3), "end": round(t + d, 3)})
        t += d + dur * pi / total
    return out


def main():
    script_path, prefix = sys.argv[1], sys.argv[2]
    s = json.load(open(script_path, encoding="utf-8"))
    k = model()
    lines = sorted(s["lines"], key=lambda l: l["start"])
    clips, words = [], []
    for i, line in enumerate(lines):
        x, sr = k.create(line["text"], voice=line.get("voice", s.get("voice", "am_michael")),
                         speed=line.get("speed", s.get("speed", 1.0)), lang=s.get("lang", "en-us"))
        x = trim(np.asarray(x, dtype=np.float32), sr)
        # resample to 48 kHz (linear is fine for speech at this ratio)
        n = int(round(len(x) * SR_OUT / sr))
        x = np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x).astype(np.float32)
        dur = len(x) / SR_OUT
        nxt = lines[i + 1]["start"] if i + 1 < len(lines) else None
        flag = f"  ⚠️ runs {line['start'] + dur - nxt:.2f} s into the next line" if nxt and line["start"] + dur > nxt else ""
        print(f"{line['start']:6.2f}  {dur:4.2f} s  {line['text']}{flag}")
        clips.append((line["start"], x))
        words += word_times(line["text"], line["start"], dur)
    end = max(st + len(x) / SR_OUT for st, x in clips) + 0.2
    mix = np.zeros(int(end * SR_OUT), dtype=np.float32)
    for st, x in clips:
        a = int(round(st * SR_OUT))
        mix[a:a + len(x)] += x
    mix *= 0.89 / max(1e-9, np.abs(mix).max())
    import soundfile as sf
    sf.write(prefix + ".wav", mix, SR_OUT, subtype="PCM_16")
    json.dump({"source": os.path.basename(script_path), "words": words}, open(prefix + ".json", "w"), indent=1)
    print(f"Wrote {prefix}.wav, {prefix}.json ({len(words)} words)")


if __name__ == "__main__":
    main()
