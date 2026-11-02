"""Frame-to-frame smoothness check for a rendered video.

Input: per-frame "visible change" values from ffmpeg, i.e. the share of
pixels whose brightness changed by more than 6/255 between consecutive
frames (format=gray, tblend difference, threshold, signalstats YAVG). The
threshold ignores invisible encoder noise (the 1–2 level shifts H.264 makes
on smooth gradients) and keeps real motion.

Flags:
  - HITCH: a frame with no visible change while motion runs on both sides
    (a duplicated frame mid-move, which shows as a stutter)
  - JUMP:  a frame where far more of the picture changes than in its
    neighbours (a pop, a snapping element, or an intended hard cut; check it)

usage: python3 qa_motion.py <metadata.txt> <fps> <out.csv>
Writes <out>.csv and <out>_flags.txt; prints a JSON summary.
"""
import json
import re
import statistics
import sys

path, fps, out_csv = sys.argv[1], float(sys.argv[2]), sys.argv[3]

# Output i of tblend = change from source frame i to frame i+1, so label it frame i+1.
changes = []
for line in open(path, encoding="utf-8"):
    m = re.search(r"lavfi\.signalstats\.YAVG=([0-9.]+)", line)
    if m:
        changes.append(float(m.group(1)) / 255 * 100)  # % of pixels visibly changed

STILL = 0.005   # % of pixels: below this, nothing visible changed
MOVING = 0.05   # % of pixels: above this, something is visibly moving
JUMP_MIN = 15   # % of pixels changing in one frame before we call it a jump

hitches, jumps = [], []
for i, c in enumerate(changes):
    frame = i + 1
    prev_c = changes[i - 1] if i > 0 else None
    next_c = changes[i + 1] if i + 1 < len(changes) else None
    if c < STILL and prev_c is not None and next_c is not None and prev_c > MOVING and next_c > MOVING:
        hitches.append(frame)
    window = [x for x in changes[max(0, i - 6): i] + changes[i + 1: i + 7] if x > STILL]
    base = statistics.median(window) if window else 0.0
    if c > JUMP_MIN and c > 4 * max(base, 1.0):
        jumps.append(frame)

with open(out_csv, "w", encoding="utf-8") as f:
    f.write("frame,time_s,pct_pixels_changed,flag\n")
    for i, c in enumerate(changes):
        frame = i + 1
        flag = "HITCH" if frame in hitches else "JUMP" if frame in jumps else ""
        f.write(f"{frame},{frame / fps:.3f},{c:.4f},{flag}\n")

with open(out_csv.rsplit(".", 1)[0] + "_flags.txt", "w", encoding="utf-8") as f:
    f.write("".join(f"hitch:{n}\n" for n in hitches) + "".join(f"jump:{n}\n" for n in jumps))

moving = [c for c in changes if c > STILL]
print(json.dumps({
    "frames_compared": len(changes),
    "moving_frames": len(moving),
    "static_frames": len(changes) - len(moving),
    "median_pct_pixels_changed_when_moving": round(statistics.median(moving), 3) if moving else 0,
    "hitches": [{"frame": f, "time": round(f / fps, 3)} for f in hitches],
    "jumps": [{"frame": f, "time": round(f / fps, 3), "pct": round(changes[f - 1], 1)} for f in jumps],
}))
