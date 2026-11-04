"""Lip sync for Blender scene scripts: Rhubarb mouth cues (scripts/lipsync.sh) → mouth values on every frame.

    scripts/lipsync.sh audio/vo.wav audio/vo.visemes.json --dialog audio/vo.txt

    # In a scene script for engines/blender/render.sh (run.py puts engines/blender/ on sys.path):
    import lipsync as L
    cues = L.load("productions/<brand>/<ID>/audio/vo.visemes.json")   # paths from where render.sh runs

    def build(ctx):
        ...
        # A head with shape keys "open", "wide", "round" (0…1), keyed on every frame:
        L.key_shape_keys(head, cues, ctx, offset=VO_START)
        # Or drive anything else from the values, frame by frame:
        for i in range(ctx["frames"]):
            t = i / ctx["fps"]
            m = L.params_at(cues, t, offset=VO_START)                   # {"open": …, "wide": …, "round": …}
            ctx["key"](mouth, "scale", t, (1 + 0.3 * m["wide"] - 0.3 * m["round"], 1, 0.1 + m["open"]))

Shapes are Rhubarb's Preston Blair set: A closed (M B P) · B slightly open, teeth (K S T EE) · C open (EH AE) ·
D wide open (AA) · E rounded (AO ER) · F puckered (UW W) · G teeth on lip (F V) · H tongue up (L) · X rest.
TABLES mirrors engines/lipsync.js: change both together. Pass your own table (a dict with A–H and X) for another rig.
`offset` is where the VO starts on the piece's timeline (audio/cues.json), because cue times count from the start
of the audio file. `blend` ramps the mouth over the first ~40 ms of each cue so it never pops.
"""
import bisect
import json

SHAPES = {
    "A": "closed (M B P)", "B": "slightly open, teeth (K S T EE)", "C": "open (EH AE)", "D": "wide open (AA)",
    "E": "rounded (AO ER)", "F": "puckered (UW W)", "G": "teeth on lip (F V)", "H": "tongue up (L)", "X": "rest",
}

TABLES = {
    "mouth": {
        "A": {"open": 0, "wide": 0.3, "round": 0}, "B": {"open": 0.2, "wide": 0.5, "round": 0},
        "C": {"open": 0.5, "wide": 0.4, "round": 0}, "D": {"open": 1, "wide": 0.5, "round": 0},
        "E": {"open": 0.5, "wide": 0, "round": 0.6}, "F": {"open": 0.25, "wide": 0, "round": 1},
        "G": {"open": 0.1, "wide": 0.4, "round": 0}, "H": {"open": 0.6, "wide": 0.3, "round": 0},
        "X": {"open": 0, "wide": 0, "round": 0},
    },
}


def load(path):
    """Rhubarb JSON → [(start, end, shape)], sorted."""
    with open(path) as f:
        d = json.load(f)
    cues = [(float(c["start"]), float(c["end"]), str(c["value"])) for c in (d["mouthCues"] if isinstance(d, dict) else d)]
    cues.sort()
    return cues


def _index(cues, t):
    """Index of the cue containing t, or -1 outside the track."""
    if not cues or t < cues[0][0] or t >= cues[-1][1]:
        return -1
    i = bisect.bisect_right([c[0] for c in cues], t) - 1
    return i if cues[i][0] <= t < cues[i][1] else -1


def shape_at(cues, t, offset=0.0):
    """The shape at time t ("X" outside the track)."""
    i = _index(cues, t - offset)
    return cues[i][2] if i >= 0 else "X"


def talking(cues, t, offset=0.0):
    """True while a shape other than rest is on (for nods, brow lifts and gestures that go with speech)."""
    return shape_at(cues, t, offset) != "X"


def _table(table):
    tb = TABLES.get(table) if isinstance(table, str) else table
    if not tb or "X" not in tb:
        raise ValueError(f"unknown table {table!r} ({' | '.join(TABLES)}, or a dict with A-H and X)")
    return tb


def params(shape, table="mouth"):
    """A copy of the table's values for one shape."""
    tb = _table(table)
    return dict(tb.get(shape, tb["X"]))


def params_at(cues, t, table="mouth", offset=0.0, blend=0.04):
    """Values at time t; the first `blend` seconds of each cue ramp from the previous shape."""
    tt = t - offset
    i = _index(cues, tt)
    cur = params(cues[i][2] if i >= 0 else "X", table)
    if not blend or i <= 0:
        return cur
    u = (tt - cues[i][0]) / blend
    if u >= 1.0:
        return cur
    u = u * u * (3 - 2 * u)  # smoothstep
    prev = params(cues[i - 1][2], table)
    return {k: prev[k] + (cur[k] - prev[k]) * u for k in cur}


def key_shape_keys(obj, cues, ctx, table="mouth", names=None, offset=0.0, blend=0.04):
    """Key obj's shape keys from the cues on every frame of the plate. `names` maps a table value to a shape key
    name (default: the same name, e.g. "open"); values without a shape key are an error, so a typo can't go silent."""
    names = names or {k: k for k in params("X", table)}
    blocks = obj.data.shape_keys.key_blocks if obj.data.shape_keys else {}
    missing = [n for n in names.values() if n not in blocks]
    if missing:
        raise KeyError(f"{obj.name} has no shape key {missing} (has {[b.name for b in blocks] if blocks else 'none'})")
    for i in range(ctx["frames"]):
        m = params_at(cues, i / ctx["fps"], table, offset, blend)
        for value, name in names.items():
            kb = blocks[name]
            kb.value = m[value]
            kb.keyframe_insert("value", frame=1 + i)  # Blender frames start at 1, like run.py's key()
