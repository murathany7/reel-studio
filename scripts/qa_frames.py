"""First-frame and flash checks for a rendered video (called by qa-video.sh).

First frame: frame 0 is the thumbnail in many feeds and the first thing anyone sees. A black or blank frame 0
wastes it.
  - BLACK: mean brightness under 6%
  - EMPTY: almost no detail (brightness spread under 2%)

Flashes (WCAG 2.3.1 "three flashes", general-flash rule, measured per quadrant of the picture, since a flash counts
when it covers about a quarter of the screen): a flash is a pair of opposite changes in relative luminance, each of
at least 0.1, with the darker state under 0.8. More than 3 flashes in any one second fails: it can trigger
seizures, and Meta and TikTok can reject or limit the ad.

Inputs (raw 8-bit gray, written by ffmpeg in qa-video.sh):
  quads.gray   every frame scaled to 2x2 (area average), 4 bytes per frame, limited range (16-235)
  first.gray   frame 0 at 54x96, limited range

usage: python3 qa_frames.py <quads.gray> <first.gray> <fps>
Prints a JSON summary.
"""
import json
import statistics
import sys

quads_path, first_path, fps = sys.argv[1], sys.argv[2], float(sys.argv[3])


def full(y):
    """Limited-range luma (16-235) to 0..1."""
    return min(1.0, max(0.0, (y - 16) / 219))


def lum(v):
    """Gamma-encoded 0..1 to relative luminance (sRGB curve)."""
    return v / 12.92 if v <= 0.04045 else ((v + 0.055) / 1.055) ** 2.4


# --- first frame
first = [full(b) for b in open(first_path, "rb").read()]
mean, spread = statistics.fmean(first), statistics.pstdev(first)
first_flag = "BLACK" if mean < 0.06 else "EMPTY" if spread < 0.02 else ""

# --- flashes, per quadrant
raw = open(quads_path, "rb").read()
frames = len(raw) // 4
MIN_SWING, DARK_MAX = 0.1, 0.8


def flash_times(series):
    """Times (s) of each completed flash: two opposite swings of >= MIN_SWING, darker side < DARK_MAX."""
    swings = []  # (frame, direction)
    lo = hi = series[0] if series else 0
    lo_i = hi_i = 0
    for i, v in enumerate(series):
        # track the excursion since the last counted swing
        if v > hi:
            hi, hi_i = v, i
        if v < lo:
            lo, lo_i = v, i
        if hi - lo >= MIN_SWING and lo < DARK_MAX:
            direction = 1 if hi_i > lo_i else -1
            if not swings or swings[-1][1] != direction:
                swings.append((i, direction))
            lo = hi = v
            lo_i = hi_i = i
    # every second opposite swing completes a flash
    return [swings[k][0] / fps for k in range(1, len(swings), 2)]


worst = {"per_second": 0, "at": None, "quadrant": None}
for q, name in enumerate(["top-left", "top-right", "bottom-left", "bottom-right"]):
    series = [lum(full(raw[f * 4 + q])) for f in range(frames)]
    times = flash_times(series)
    for i, t in enumerate(times):
        n = sum(1 for u in times[i:] if u - t < 1.0 - 1e-6)
        if n > worst["per_second"]:
            worst = {"per_second": n, "at": round(t, 2), "quadrant": name}

print(json.dumps({
    "first_frame": {"mean": round(mean, 3), "spread": round(spread, 3), "flag": first_flag},
    "flashes": worst,
}))
