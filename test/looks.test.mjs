// Looks (looks/): each one is complete, its starter renders, every frame is a pure function of t, and the looks
// really differ from each other. Rendering needs core/node_modules, Chrome and ffmpeg; skipped when missing.
import assert from "node:assert/strict";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { ROOT, CHROME, run, tmp, md5, has, pngSize } from "./helpers.mjs";

const looks = readdirSync(path.join(ROOT, "looks"), { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
const missing = [
  !existsSync(path.join(ROOT, "core/node_modules/playwright-core")) && "core/node_modules (npm install in core/)",
  !CHROME && "Google Chrome (or CHROME_PATH)",
  !has("ffmpeg") && "ffmpeg",
].filter(Boolean);
const skip = missing.length ? `needs ${missing.join(", ")}` : false;
const render = (...a) => run(process.execPath, ["core/render.mjs", ...a], { timeout: 300_000 });

test("every look has a README, look.css and a starter, and is in the catalogue", () => {
  assert.ok(looks.length >= 7, `found ${looks.length} looks`);
  const catalogue = readFileSync(path.join(ROOT, "looks/README.md"), "utf8");
  for (const l of looks) {
    for (const f of ["README.md", "look.css", "starter.html"]) assert.ok(existsSync(path.join(ROOT, "looks", l, f)), `${l}/${f}`);
    assert.match(catalogue, new RegExp(`\\[${l}\\]\\(${l}/\\)`), `${l} missing from looks/README.md`);
    const html = readFileSync(path.join(ROOT, "looks", l, "starter.html"), "utf8");
    assert.match(html, new RegExp(`/looks/${l}/look.css`), `${l} starter does not load its look.css`);
    assert.doesNotMatch(html, /Math\.random|gsap\.utils\.random|Date\.now|requestAnimationFrame|setTimeout/, `${l} starter has a hidden clock or unseeded randomness`);
    // Brand colours must be able to reach the look: at least one var(--accent…) fallback in look.css.
    assert.match(readFileSync(path.join(ROOT, "looks", l, "look.css"), "utf8"), /var\(--accent/, `${l}/look.css ignores the brand accent`);
  }
});

test("looks.mjs lists a brand's looks and the ones it has not tried", () => {
  const r = run(process.execPath, ["scripts/looks.mjs", "_none_"]);
  assert.notEqual(r.code, 0, "an unknown brand should fail");
  const all = run(process.execPath, ["scripts/looks.mjs"]);
  assert.equal(all.code, 0, all.out);
  for (const l of looks) assert.match(all.out, new RegExp(l));
});

test("every starter renders the same frame twice, and no two looks look alike", { skip, timeout: 600_000 }, () => {
  const dir = tmp();
  const frames = {};
  for (const l of looks) {
    const a = path.join(dir, `${l}-a.png`), b = path.join(dir, `${l}-b.png`);
    for (const out of [a, b]) {
      const r = render("still", `looks/${l}/starter.html`, out, "--t", "1.62");
      assert.equal(r.code, 0, `${l}: ${r.out}`);
    }
    assert.deepEqual(pngSize(a), { width: 1080, height: 1920 }, l);
    assert.equal(md5(a), md5(b), `${l}: two renders of the same frame differ`);
    frames[l] = a;
  }
  // Distinct looks: compare tiny greyscale thumbnails; any pair this close would read as the same look.
  const gray = (f) => run("sh", ["-c", `ffmpeg -loglevel error -i '${f}' -vf scale=12:20,format=gray -f rawvideo - | od -An -v -tu1`])
    .out.trim().split(/\s+/).map(Number);
  const px = Object.fromEntries(looks.map((l) => [l, gray(frames[l])]));
  for (let i = 0; i < looks.length; i++) for (let j = i + 1; j < looks.length; j++) {
    const a = px[looks[i]], b = px[looks[j]];
    const diff = a.reduce((s, v, k) => s + Math.abs(v - b[k]), 0) / a.length;
    assert.ok(diff > 12, `${looks[i]} and ${looks[j]} are too alike (mean diff ${diff.toFixed(1)})`);
  }
});
