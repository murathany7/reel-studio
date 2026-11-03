#!/usr/bin/env python3
"""Build the variant gallery page from the production manifests + uploaded asset URLs (urls.json: name -> url)."""
import json, base64, os, sys, html
ROOT = "/home/user/reel-studio/productions/bike-logger"
HERE = os.path.dirname(os.path.abspath(__file__))
urls = json.load(open(os.path.join(ROOT, "gallery-assets.json")))["videos"]
PIECES = {
  "REEL-006": ("Meet the parts", "The box opens and each part rises out, doing its job: the cooler spins, the camera sees 102° behind, the GPS gets a fix."),
  "REEL-007": ("One ride, one timeline", "On a city ride the bike's own sensors log a pothole, a lean, an overtake and every wheel turn, then the replay scrubs."),
  "REEL-008": ("The tunnel", "In a tunnel the GPS loses its fix; the Hall sensor keeps pulsing once per wheel turn."),
  "REEL-009": ("Pattern pack", "The same facts arranged by 19 ad patterns."),
  "REEL-010": ("Five signals", "Each sensor's own trace on one clock: the pothole, the overtake and the tunnel line up on every row."),
  "REEL-011": ("The box in 3D", "The IP65 box at its real proportions opens; the Pi 5's cooler spins inside."),
}
PAT = {
 "pas": ("Problem, agitate, solve", "Pain-point ad"), "bab": ("Before, after, bridge", "Transformation"),
 "listicle": ("Numbered list", "Chunking (Miller 1956)"), "spotlight": ("One feature", "Single-minded proposition"),
 "demo": ("Product demo", "Show the result"), "faq": ("Objection, answer", "Two-sided messages (Hovland 1949)"),
 "three": ("How it works in three", "Rule of three (Shu & Carlson 2014)"), "unboxing": ("What's inside", "Anticipation (Loewenstein 1987)"),
 "curiosity": ("Curiosity gap", "Information gap (Loewenstein 1994)"), "interrupt": ("Pattern interrupt", "Orienting response (Sokolov 1963)"),
 "ikea": ("IKEA effect", "Norton, Mochon & Ariely 2012"), "progress": ("Goal gradient", "Kivetz, Urminsky & Zheng 2006"),
 "myth": ("Truth sandwich", "Lewandowsky et al. 2020"), "reciprocity": ("Give first", "Reciprocity (Cialdini 1984)"),
 "foot": ("Foot in the door", "Freedman & Fraser 1966"), "story": ("Mini story", "Narrative transportation (Green & Brock 2000)"),
 "loss": ("Loss framing", "Tversky & Kahneman 1981"), "contrast": ("Contrast", "Contrast effect, anchoring"),
 "specificity": ("Specific numbers", "Schindler & Yalch 2006"),
}
HOOKS = {"REEL-006": {"A": "Meet the parts.", "B": "Five sensors. One Pi.", "C": "What's in the box?"},
         "REEL-007": {"A": "Ride. Record. Replay.", "B": "Five sensors on one bike.", "C": "Every sensor. One timeline."},
         "REEL-008": {"A": "Tunnel ahead.", "B": "No sky, no GPS.", "C": "Who keeps count in the dark?"},
         "REEL-010": {"A": "Five sensors. One clock.", "B": "What your bike feels.", "C": "Every line is a sensor."},
         "REEL-011": {"A": "Open the box.", "B": "Sealed outside. A Pi inside.", "C": "One Pi. One sealed box."}}
items = []
for d in sorted(os.listdir(ROOT)):
    m = os.path.join(ROOT, d, "export", "manifest.json")
    if not os.path.exists(m): continue
    man = json.load(open(m))
    for v in man["variants"]:
        if not v.get("ok"): continue
        cover = os.path.join(ROOT, d, v["cover"]) if v.get("cover") else None
        img = "data:image/jpeg;base64," + base64.b64encode(open(cover, "rb").read()).decode() if cover and os.path.exists(cover) else ""
        a = v["axes"]; pid = man["id"]
        it = {"name": v["name"], "piece": pid, "style": a.get("style", "fun"), "size": a.get("size", "reel"),
              "pattern": a.get("pattern"), "hook": a.get("hook"), "look": a.get("look", "cartoon"), "dur": v.get("duration"), "dims": v.get("size"), "fps": v.get("fps"),
              "qa": (v.get("qa") or {}).get("fails"), "cover": img, "url": urls.get(v["name"], "")}
        if it["pattern"]: it["label"], it["basis"] = PAT.get(it["pattern"], (it["pattern"], ""))
        else: it["label"], it["basis"] = PIECES[pid][0], "Hook " + it["hook"] + ": " + HOOKS[pid][it["hook"]]
        items.append(it)
tpl = open(os.path.join(HERE, "template.html")).read()
out = tpl.replace("/*DATA*/[]", json.dumps(items)).replace("/*PIECES*/{}", json.dumps(PIECES)).replace("{{COUNT}}", str(len(items)))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.join(HERE, "bike-logger-reels.html")
open(OUT, "w").write(out)
print(len(items), "items,", sum(1 for i in items if i["url"]), "with video,", round(len(out) / 1e6, 2), "MB")
