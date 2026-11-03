#!/usr/bin/env python3
"""Build the variant gallery page from the production manifests + uploaded asset URLs (urls.json: name -> url)."""
import json, base64, os, sys, html
ROOT = "/home/user/reel-studio/productions/bike-logger"
HERE = os.path.dirname(os.path.abspath(__file__))  # copy of the scratchpad builder; outputs bike-logger-reels.html next to it
urls = json.load(open(os.path.join(HERE, "urls.json"))) if os.path.exists(os.path.join(HERE, "urls.json")) else {}
PIECES = {
  "REEL-006": ("Meet the crew", "The box opens and each part hops out with its job."),
  "REEL-007": ("One ride, one timeline", "A city ride logs a pothole, a lean, an overtake and wheel turns, then the replay scrubs."),
  "REEL-008": ("The tunnel", "GPS loses its fix in a tunnel; the Hall sensor keeps counting."),
  "REEL-009": ("Pattern pack", "The same facts arranged by 19 ad patterns."),
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
HOOKS = {"REEL-006": {"A": "Meet the crew.", "B": "Five sensors. One Pi.", "C": "Who's in the box?"},
         "REEL-007": {"A": "Ride. Record. Replay.", "B": "Your bike has a crew.", "C": "Every sensor. One timeline."},
         "REEL-008": {"A": "Tunnel ahead.", "B": "No sky, no GPS.", "C": "Who keeps count in the dark?"}}
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
              "pattern": a.get("pattern"), "hook": a.get("hook"), "dur": v.get("duration"), "dims": v.get("size"),
              "qa": (v.get("qa") or {}).get("fails"), "cover": img, "url": urls.get(v["name"], "")}
        if it["pattern"]: it["label"], it["basis"] = PAT.get(it["pattern"], (it["pattern"], ""))
        else: it["label"], it["basis"] = PIECES[pid][0], "Hook " + it["hook"] + ": " + HOOKS[pid][it["hook"]]
        items.append(it)
tpl = open(os.path.join(HERE, "template.html")).read()
out = tpl.replace("/*DATA*/[]", json.dumps(items)).replace("/*PIECES*/{}", json.dumps(PIECES)).replace("{{COUNT}}", str(len(items)))
open(os.path.join(HERE, "bike-logger-reels.html"), "w").write(out)
print(len(items), "items,", sum(1 for i in items if i["url"]), "with video,", round(len(out) / 1e6, 2), "MB")
