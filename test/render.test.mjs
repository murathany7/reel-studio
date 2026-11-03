// The renderer's promise: every frame is a pure function of t. Renders the engines demo (Blender plate, Three.js,
// SVG rig + Pixi, GSAP) twice and compares pixels, then a full video through the QA script.
// Needs `npm install` in core/, Google Chrome and ffmpeg; skipped when they are missing (CI has them).
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { ROOT, CHROME, run, tmp, md5, has, pngSize } from "./helpers.mjs";

const DEMO = "examples/engines-demo/index.html";
const missing = [
  !existsSync(path.join(ROOT, "core/node_modules/playwright-core")) && "core/node_modules (npm install in core/)",
  !CHROME && "Google Chrome (or CHROME_PATH)",
  !has("ffmpeg") && "ffmpeg",
].filter(Boolean);
const skip = missing.length ? `needs ${missing.join(", ")}` : false;
const render = (...a) => run(process.execPath, ["core/render.mjs", ...a], { timeout: 300_000 });

// One time per engine: plate, Three.js, SVG rig + Pixi
for (const t of ["1", "3", "4.6"]) {
  test(`still at t=${t} is 1080x1920 and identical across renders`, { skip, timeout: 120_000 }, () => {
    const dir = tmp();
    const a = path.join(dir, "a.png"), b = path.join(dir, "b.png");
    for (const out of [a, b]) {
      const r = render("still", DEMO, out, "--t", t);
      assert.equal(r.code, 0, r.out);
    }
    assert.deepEqual(pngSize(a), { width: 1080, height: 1920 });
    assert.equal(md5(a), md5(b), "two renders of the same frame differ");
  });
}

test("frames at different times differ", { skip, timeout: 120_000 }, () => {
  const dir = tmp();
  render("stills", DEMO, dir, "--at", "2.5,3.5");
  const pngs = run("sh", ["-c", `ls ${dir}/*.png`]).out.trim().split("\n");
  assert.equal(pngs.length, 2, pngs.join());
  assert.notEqual(md5(pngs[0]), md5(pngs[1]), "the clock does not move");
});

test("video renders to spec and passes QA", { skip: skip || (!has("python3") && "needs python3"), timeout: 600_000 }, () => {
  const dir = tmp();
  const mp4 = path.join(dir, "demo.mp4"), qa = path.join(dir, "qa");
  const r = render("video", DEMO, mp4);
  assert.equal(r.code, 0, r.out);
  const q = run("bash", ["scripts/qa-video.sh", mp4, qa]);
  assert.equal(q.code, 0, q.out);
  const report = readFileSync(path.join(qa, "report.md"), "utf8");
  for (const row of ["Size", "Frame rate", "Constant frame rate", "Video codec / pixel format"]) {
    assert.match(report, new RegExp(`\\| ${row.replace(/[/]/g, "\\/")} \\|[^\\n]*✅`), `${row} not ✅\n${report}`);
  }
  assert.ok(existsSync(path.join(qa, "contact_sheet_safezones.jpg")), "no contact sheet");
});
