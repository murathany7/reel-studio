// The reel layer: beat detection, captions, transitions, formats, plates as frames, parallel workers, Rive.
// Needs `npm install` in core/, Google Chrome and ffmpeg; skipped when they are missing (CI has them).
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { ROOT, CHROME, run, tmp, md5, has, pngSize } from "./helpers.mjs";

const DEMO = "examples/reel-layer/index.html";
const missing = [
  !existsSync(path.join(ROOT, "core/node_modules/playwright-core")) && "core/node_modules (npm install in core/)",
  !CHROME && "Google Chrome (or CHROME_PATH)",
  !has("ffmpeg") && "ffmpeg",
].filter(Boolean);
const skip = missing.length ? `needs ${missing.join(", ")}` : false;
const render = (...a) => run(process.execPath, ["core/render.mjs", ...a], { timeout: 300_000 });
const md5s = (dir) => Object.fromEntries(readdirSync(dir).filter((f) => f.endsWith(".png")).map((f) => [f, md5(path.join(dir, f))]));

// A synthetic track: kick on every beat (louder on the downbeat), hat on the off-beat, a drone underneath
function track(file, bpm, first, seconds = 20) {
  const P = 60 / bpm, o = first;
  const expr = `gte(t,${o})*((1+1.2*lt(mod(t-${o},4*${P}),0.05))*sin(2*PI*(50+120*exp(-30*mod(t-${o},${P})))*mod(t-${o},${P}))*exp(-12*mod(t-${o},${P}))` +
    ` + 0.25*(random(0)-0.5)*exp(-60*mod(t-${o}-${P}/2,${P}))*gte(t,${o}+${P}/2)) + 0.15*sin(2*PI*220*t)`;
  const r = run("ffmpeg", ["-v", "error", "-y", "-f", "lavfi", "-i", `aevalsrc='${expr}':s=44100:d=${seconds}`, file]);
  assert.equal(r.code, 0, r.out);
}

for (const [bpm, first] of [[120, 0.25], [128, 0.6], [95, 0.1]]) {
  test(`beats.mjs finds ${bpm} BPM, its beats and its downbeats`, { skip: !has("ffmpeg") && "needs ffmpeg", timeout: 60_000 }, () => {
    const dir = tmp(), wav = path.join(dir, "m.wav"), out = path.join(dir, "beats.json");
    track(wav, bpm, first);
    const r = run(process.execPath, ["scripts/beats.mjs", wav, out]);
    assert.equal(r.code, 0, r.out);
    const g = JSON.parse(readFileSync(out, "utf8"));
    const P = 60 / bpm;
    assert.ok(Math.abs(g.bpm - bpm) < 0.5, `bpm ${g.bpm}`);
    for (const b of g.beats) assert.ok(Math.abs(b - (first + Math.round((b - first) / P) * P)) < 0.03, `beat ${b} off the grid`);
    for (const d of g.downbeats) assert.ok(Math.abs(((d - first) / (4 * P)) - Math.round((d - first) / (4 * P))) < 0.05, `downbeat ${d}`);
  });
}

test("reel-layer demo: stills match across runs, orders and worker counts", { skip, timeout: 300_000 }, () => {
  const a = tmp(), b = tmp();
  // captions, iris, push, the GL ripple over the plate
  assert.equal(render("stills", DEMO, a, "--at", "0.6,2.15,4.1,6.1,6.25,7.6", "--workers", "1").code, 0);
  const r = render("stills", DEMO, b, "--at", "7.6,6.25,6.1,4.1,2.15,0.6", "--workers", "3");
  assert.equal(r.code, 0, r.out);
  assert.deepEqual(md5s(b), md5s(a));
  assert.equal(new Set(Object.values(md5s(a))).size, 6, "frames should all differ");
});

test("formats: one composition renders 9:16, 4:5, 1:1 and 16:9", { skip, timeout: 300_000 }, () => {
  const dir = tmp();
  const r = render("still", DEMO, path.join(dir, "f.png"), "--t", "3.3", "--formats", "all");
  assert.equal(r.code, 0, r.out);
  for (const [f, width, height] of [["9x16", 1080, 1920], ["4x5", 1080, 1350], ["1x1", 1080, 1080], ["16x9", 1920, 1080]]) {
    assert.deepEqual(pngSize(path.join(dir, `f-${f}.png`)), { width, height }, f);
  }
  const bad = render("still", "examples/engines-demo/index.html", path.join(dir, "x.png"), "--format", "4x5");
  assert.notEqual(bad.code, 0);
  assert.match(bad.out, /no "4x5" layout/);
});

test("a video renders the same with one worker and with several", { skip, timeout: 600_000 }, () => {
  const dir = tmp();
  const one = path.join(dir, "1.mp4"), many = path.join(dir, "4.mp4");
  assert.equal(render("video", "examples/engines-demo/index.html", one, "--workers", "1").code, 0);
  const r = render("video", "examples/engines-demo/index.html", many, "--workers", "4");
  assert.equal(r.code, 0, r.out);
  assert.equal(md5(many), md5(one));
});

test("a frame in a video matches the same frame rendered alone", { skip, timeout: 300_000 }, () => {
  const dir = tmp();
  assert.equal(render("video", "examples/engines-demo/index.html", path.join(dir, "v.mp4"), "--frames", path.join(dir, "f"), "--workers", "1").code, 0);
  for (const [t, n] of [[1, 30], [3, 90], [5, 150]]) {
    assert.equal(render("still", "examples/engines-demo/index.html", path.join(dir, `s${t}.png`), "--t", String(t)).code, 0);
    assert.equal(md5(path.join(dir, `f/f_${String(n).padStart(5, "0")}.png`)), md5(path.join(dir, `s${t}.png`)), `t=${t}`);
  }
});

test("a missing video plate fails the render with its URL", { skip, timeout: 60_000 }, () => {
  const r = render("still", "test/fixtures/missing-plate.html", path.join(tmp(), "x.png"));
  assert.notEqual(r.code, 0);
  assert.match(r.out, /Video plate failed to load: .*no-such-plate\.mp4/);
});

const RIV = path.join(ROOT, "examples/reel-layer/assets/vehicles.riv");
test("Rive: timeline and state machine frames don't depend on seek order", {
  skip: skip || (!existsSync(RIV) && "needs examples/reel-layer/assets/vehicles.riv (see examples/reel-layer/rive.html)"), timeout: 120_000,
}, () => {
  const a = tmp(), b = tmp();
  assert.equal(render("stills", "examples/reel-layer/rive.html", a, "--at", "0.5,1.2,2,2.8,3.5", "--workers", "1").code, 0);
  assert.equal(render("stills", "examples/reel-layer/rive.html", b, "--at", "3.5,2.8,0.5,2,1.2", "--workers", "2").code, 0);
  assert.deepEqual(md5s(b), md5s(a));
});
