// What npm publishes: everything init needs, nothing private.
import assert from "node:assert/strict";
import { test } from "node:test";
import { json, packFiles } from "./helpers.mjs";

const files = packFiles();

test("npm package ships the kit", () => {
  for (const f of [
    "bin/reel-studio.mjs", "core/render.mjs", "core/lib/runtime.js", "core/lib/base.css", "core/package-lock.json",
    "engines/three.js", "engines/pixi.js", "engines/svg-rig.js", "engines/capture.mjs", "engines/blender/run.py",
    "engines/gl-transitions.js", "engines/rive.js", "looks/README.md", "looks/fx.js", "looks/neon-noir/starter.html", "scripts/looks.mjs", "core/lib/beginframe.mjs", "scripts/beats.mjs",
    "engines/lipsync.js", "engines/blender/lipsync.py", "scripts/lipsync.sh",
    "desk/server.mjs", "desk/mcp.mjs", "desk/lib.mjs", "desk/index.html", "desk/app.js",
    "scripts/init-project.sh", "scripts/qa-video.sh", "scripts/mix_audio.py",
    "templates/project/AGENTS.md", "templates/project/CLAUDE.md", "templates/project/STATUS.md", "templates/project/gitignore",
    "brands/_template/README.md", "productions/_TEMPLATE/README.md",
    "examples/engines-demo/index.html", "examples/engines-demo/plates/blob.mp4", "examples/engines-demo/talk.visemes.js",
    "examples/reel-layer/index.html", "examples/reel-layer/audio/beats.json", "examples/reel-layer/audio/words.json",
    ".agents/skills/make-video/SKILL.md", "LICENSE", "README.md",
  ]) assert.ok(files.includes(f), `missing ${f}`);
});

test("npm package leaves out brands, productions and repo-only files", () => {
  const leaks = files.filter((f) =>
    (/^brands\//.test(f) && !f.startsWith("brands/_template/")) ||
    (/^productions\//.test(f) && !f.startsWith("productions/_TEMPLATE/")) ||
    /^(docs|python|packaging|test|\.github)\//.test(f) ||
    /node_modules|\.DS_Store|__pycache__|metrics|desk\/\.state\.json/.test(f) ||
    ["STATUS.md", "CLAUDE.md", "AGENTS.md"].includes(f) || /skills\/check-metrics/.test(f));
  assert.deepEqual(leaks, []);
});

test("npm package stays small", () => {
  assert.ok(files.length < 120, `${files.length} files`);  // 100 at 0.2.6 (looks + lip sync), 0.6 MB
});

test("bin entry points at a shipped file", () => {
  for (const p of Object.values(json("package.json").bin)) assert.ok(files.includes(p), p);
});
