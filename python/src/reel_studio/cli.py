# reel-studio init [dir] [--update]: copy the Reel Studio kit and its agent skills into a project.
# Same as bin/reel-studio.mjs; the kit in kit/ is the npm package's files, copied in by packaging/build-python.sh.
import shutil
import subprocess
import sys
from pathlib import Path

from . import __version__

KIT = Path(__file__).resolve().parent / "kit"

USAGE = f"""Reel Studio {__version__}: marketing videos made with code, run by your coding agent (Claude Code, Codex, Copilot).

  reel-studio init [dir]           copy the kit and skills into dir (default: here) and install it
  reel-studio init [dir] --update  refresh core/, engines/, looks/, scripts/ and skills from this version

Needs Node 18+, Google Chrome and ffmpeg (the renderer runs on Node).
Claude Code plugin instead:  /plugin marketplace add murathany7/reel-studio
More: https://github.com/murathany7/reel-studio"""


def main(argv=None):
    args = sys.argv[1:] if argv is None else argv
    cmd, rest = (args[0], args[1:]) if args else (None, [])

    if cmd in ("--version", "-V"):
        print(__version__)
        return 0

    if cmd == "init":
        if sys.platform == "win32":
            print("reel-studio init needs bash and rsync (macOS, Linux or WSL).", file=sys.stderr)
            return 1
        missing = [t for t in ("bash", "rsync", "npm") if not shutil.which(t)]
        if missing:
            print(f"reel-studio init needs {', '.join(missing)} on PATH (npm comes with Node 18+).", file=sys.stderr)
            return 1
        r = subprocess.run(["bash", str(KIT / "scripts/init-project.sh"), str(KIT), *rest, "--with-skills"])
        if r.returncode == 0:
            print("""
Done. Open this folder in Claude Code, Codex or GitHub Copilot (agent mode) and ask:
  "Add my product as a new brand: https://…"
  "Make a 15 s reel for <brand> about <feature>\"""")
        return r.returncode

    print(USAGE)
    return 1 if cmd and cmd not in ("help", "--help", "-h") else 0
