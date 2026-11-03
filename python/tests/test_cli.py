# Tests for the PyPI package. Run after packaging/build-python.sh (it creates src/reel_studio/kit):
#   cd python && uv run --with . python -m unittest discover -s tests -v
import contextlib
import io
import json
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from reel_studio import __version__, cli

ROOT = Path(__file__).resolve().parents[2]


def call(*args):
    out = io.StringIO()
    with contextlib.redirect_stdout(out), contextlib.redirect_stderr(out):
        code = cli.main(list(args))
    return code, out.getvalue()


class Cli(unittest.TestCase):
    def test_help(self):
        code, out = call("help")
        self.assertEqual(code, 0)
        self.assertIn("reel-studio init [dir]", out)

    def test_unknown_command(self):
        self.assertEqual(call("nope")[0], 1)

    def test_version_matches_package_json(self):
        code, out = call("--version")
        self.assertEqual(code, 0)
        self.assertEqual(out.strip(), __version__)
        self.assertEqual(__version__, json.loads((ROOT / "package.json").read_text())["version"])

    def test_missing_tools_are_named(self):
        with mock.patch("shutil.which", lambda t: None if t == "npm" else "/usr/bin/" + t):
            code, out = call("init")
        self.assertEqual(code, 1)
        self.assertIn("npm", out)

    @unittest.skipIf(sys.platform == "win32", "posix only")
    def test_windows_is_refused(self):
        with mock.patch.object(sys, "platform", "win32"):
            code, out = call("init")
        self.assertEqual(code, 1)
        self.assertIn("WSL", out)


class Kit(unittest.TestCase):
    def test_kit_is_exactly_the_npm_package(self):
        r = subprocess.run(["npm", "pack", "--dry-run", "--json", "--ignore-scripts"], cwd=ROOT,
                           capture_output=True, text=True, check=True)
        npm = {f["path"] for f in json.loads(r.stdout[r.stdout.index("["):])[0]["files"]} - {"package.json"}
        kit = {str(p.relative_to(cli.KIT)) for p in cli.KIT.rglob("*") if p.is_file()}
        self.assertEqual(kit, npm)

    def test_init_copies_the_kit(self):
        with tempfile.TemporaryDirectory() as d:
            code, out = call("init", d)
            self.assertEqual(code, 0, out)
            for f in ("core/render.mjs", ".claude/skills/make-video/SKILL.md", "CLAUDE.md",
                      "core/node_modules/playwright-core/package.json"):
                self.assertTrue((Path(d) / f).exists(), f)


if __name__ == "__main__":
    unittest.main()
