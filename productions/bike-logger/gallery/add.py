#!/usr/bin/env python3
"""Merge "<path> ... → \"/_blob/<id>\"" lines (pasted upload results on stdin) into the gallery asset map."""
import json, re, sys, os
P = "/home/user/reel-studio/productions/bike-logger/gallery-assets.json"
m = json.load(open(P)) if os.path.exists(P) else {"artifact": "https://claude.ai/artifact/K5XziAL1h6YFb1JfaJwxJn", "videos": {}}
for line in sys.stdin:
    r = re.search(r'([A-Za-z0-9-]+)\.mp4".*?→ "(/_blob/[0-9a-f]+)"', line)
    if r: m["videos"][r.group(1)] = r.group(2)
json.dump(m, open(P, "w"), indent=2, sort_keys=True)
json.dump(m["videos"], open(os.path.join(os.path.dirname(__file__), "urls.json"), "w"))
print(len(m["videos"]), "videos mapped")
