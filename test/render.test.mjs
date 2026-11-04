// The renderer's promise: every frame is a pure function of t. Renders the engines demo (Blender plate, Three.js,
// SVG rig + Pixi, lip sync, GSAP) twice and compares pixels, then a full video through the QA script.
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

// One time per engine: plate, Three.js, SVG rig + Pixi, lip sync (the B mouth, mid-line)
for (const t of ["1", "3", "4.6", "5.25"]) {
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
  for (const row of ["Size", "Frame rate", "Constant frame rate", "Video codec / pixel format", "First frame", "Flashes \\(most in 1 s\\)"]) {
    assert.match(report, new RegExp(`\\| ${row.replace(/[/]/g, "\\/")} \\|[^\\n]*✅`), `${row} not ✅\n${report}`);
  }
  assert.ok(existsSync(path.join(qa, "contact_sheet_safezones.jpg")), "no contact sheet");
});

test("motion blur is deterministic and blurs a moving frame", { skip, timeout: 120_000 }, () => {
  const dir = tmp();
  const [sharp, a, b] = ["sharp", "a", "b"].map((n) => path.join(dir, `${n}.png`));
  // Mid push-left in the reel-layer example: everything on screen is moving
  const at = ["--t", "4.2"], comp = "examples/reel-layer/index.html";
  assert.equal(render("still", comp, sharp, ...at).code, 0);
  for (const out of [a, b]) {
    const r = render("still", comp, out, ...at, "--motion-blur", "4");
    assert.equal(r.code, 0, r.out);
  }
  assert.deepEqual(pngSize(a), { width: 1080, height: 1920 });
  assert.equal(md5(a), md5(b), "two blurred renders of the same frame differ");
  assert.notEqual(md5(a), md5(sharp), "motion blur changed nothing on a moving frame");
});

test("text-qa finds the hook, small, faint and covered text, and skips decoration", { skip, timeout: 120_000 }, () => {
  const dir = tmp();
  const r = render("text-qa", "test/fixtures/text-qa.html", dir);
  assert.equal(r.code, 1, "problems must exit 1\n" + r.out);
  const { hook, hookOk, blocks } = JSON.parse(readFileSync(path.join(dir, "text.json"), "utf8"));
  assert.ok(hookOk && hook.text === "Big hook" && hook.t === 0.5, JSON.stringify(hook));
  const by = Object.fromEntries(blocks.map((b) => [b.text, b]));
  assert.equal(by["tiny print"].size, "fail");
  assert.equal(by["faint words"].contrastResult, "fail");
  assert.equal(by["under the UI"].zoneResult, "fail");
  assert.equal(by["Big hook"].size, "ok");
  assert.equal(by["Big hook"].contrastResult, "ok");
  assert.ok(!by["???"], "data-qa-skip text was measured");
  assert.ok(existsSync(path.join(dir, "text.md")));
});

test("video QA fails a strobe and a black first frame", { skip: skip || (!has("python3") && "needs python3"), timeout: 120_000 }, () => {
  const dir = tmp();
  const mp4 = path.join(dir, "strobe.mp4");
  // 5 flashes a second: 3 frames black, 3 white
  const f = run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", "color=black:s=1080x1920:r=30:d=2",
    "-vf", "geq=lum='if(lt(mod(N\\,6)\\,3)\\,16\\,235)':cb=128:cr=128", "-pix_fmt", "yuv420p", mp4]);
  assert.equal(f.code, 0, f.out);
  const q = run("bash", ["scripts/qa-video.sh", mp4, path.join(dir, "qa")]);
  assert.equal(q.code, 0, q.out);
  assert.match(q.out, /\| First frame \| BLACK[^\n]*❌/);
  assert.match(q.out, /\| Flashes \(most in 1 s\) \| 5 [^\n]*❌/);
});
