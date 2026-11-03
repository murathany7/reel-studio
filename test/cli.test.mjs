// `reel-studio init` end to end: copies the kit, keeps the user's files, --update refreshes the kit.
// Runs npm install in the new project, so it needs network the first time.
import assert from "node:assert/strict";
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { ROOT, run, tmp } from "./helpers.mjs";

const cli = (...a) => run(process.execPath, [path.join(ROOT, "bin/reel-studio.mjs"), ...a]);

test("help exits 0, unknown command exits 1", () => {
  const h = cli("help");
  assert.equal(h.code, 0);
  assert.match(h.out, /reel-studio init \[dir\]/);
  assert.equal(cli("nope").code, 1);
});

test("init copies the kit and skills, and installs the renderer", { timeout: 180_000 }, () => {
  const dir = tmp();
  const r = cli("init", dir);
  assert.equal(r.code, 0, r.out);
  for (const f of [
    "core/render.mjs", "engines/three.js", "scripts/qa-video.sh", "brands/_template/README.md",
    "productions/_TEMPLATE/README.md", "examples/engines-demo/plates/blob.mp4", ".claude/skills/make-video/SKILL.md",
    "CLAUDE.md", "STATUS.md", ".gitignore", "core/node_modules/playwright-core/package.json",
  ]) assert.ok(existsSync(path.join(dir, f)), `missing ${f}`);
  assert.doesNotMatch(readFileSync(path.join(dir, "STATUS.md"), "utf8"), /\{\{DATE\}\}/);
  assert.ok(!existsSync(path.join(dir, "brands/bike-logger")), "brand work copied");

  // A second init keeps what the user changed; --update refreshes the kit but never their notes
  const status = path.join(dir, "STATUS.md"), render = path.join(dir, "core/render.mjs");
  writeFileSync(status, "my notes\n");
  writeFileSync(render, "// edited\n");
  assert.equal(cli("init", dir).code, 0);
  assert.equal(readFileSync(render, "utf8"), "// edited\n");
  assert.equal(cli("init", dir, "--update").code, 0);
  assert.equal(readFileSync(render, "utf8"), readFileSync(path.join(ROOT, "core/render.mjs"), "utf8"));
  assert.equal(readFileSync(status, "utf8"), "my notes\n");
});
