// Lip sync: the cue lookups in engines/lipsync.js, their Python twin in engines/blender/lipsync.py (the tables must
// match), the engines demo's cue file, and scripts/lipsync.sh end to end when Rhubarb is installed.
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { test } from "node:test";
import vm from "node:vm";
import { ROOT, run, tmp, has } from "./helpers.mjs";

// The engine is a classic script that sets window.LipSync; the lookups need no DOM.
function engine(...scripts) {
  const window = {};
  const ctx = vm.createContext({ window });
  for (const f of ["engines/lipsync.js", ...scripts]) vm.runInContext(readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
  return window;
}
const { LipSync } = engine();
const plain = (o) => JSON.parse(JSON.stringify(o)); // objects from the vm context have another Object prototype

const CUES = LipSync.cues({ mouthCues: [
  { start: 0.5, end: 0.6, value: "D" }, { start: 0, end: 0.2, value: "X" }, { start: 0.2, end: 0.5, value: "A" },
] });

test("cues are sorted and read from window.LIPSYNC by key or path", () => {
  assert.deepEqual(CUES.map((c) => c.value), ["X", "A", "D"]);
  const w = engine("examples/engines-demo/talk.visemes.js");
  assert.equal(w.LipSync.cues("talk.visemes").length, w.LipSync.cues("../audio/talk.visemes.js").length);
  assert.throws(() => LipSync.cues("nope.visemes"), /LIPSYNC\["nope\.visemes"\] is missing/);
});

test("shapeAt: cue starts are inclusive, ends exclusive, X outside the track, offset shifts it", () => {
  assert.equal(LipSync.shapeAt(CUES, -0.1), "X");
  assert.equal(LipSync.shapeAt(CUES, 0.2), "A");
  assert.equal(LipSync.shapeAt(CUES, 0.4999), "A");
  assert.equal(LipSync.shapeAt(CUES, 0.5), "D");
  assert.equal(LipSync.shapeAt(CUES, 0.6), "X");
  assert.equal(LipSync.shapeAt(CUES, 2.55, 2), "D");
  assert.equal(LipSync.talking(CUES, 0.1), false);
  assert.equal(LipSync.talking(CUES, 0.3), true);
});

test("paramsAt ramps from the previous shape over `blend`, with smoothstep", () => {
  const A = plain(LipSync.params("A")), D = plain(LipSync.params("D"));
  assert.deepEqual(plain(LipSync.paramsAt(CUES, 0.5)), A);           // u = 0: still the previous shape
  assert.deepEqual(plain(LipSync.paramsAt(CUES, 0.55)), D);          // past the 40 ms blend
  const mid = LipSync.paramsAt(CUES, 0.52);                          // u = 0.5 → smoothstep 0.5
  assert.ok(Math.abs(mid.open - (A.open + D.open) / 2) < 1e-9);
  assert.deepEqual(plain(LipSync.paramsAt(CUES, 0.52, "mouth", { blend: 0 })), D);
  const own = { A: { jaw: 0.1 }, D: { jaw: 0.9 }, X: { jaw: 0 } };   // a rig's own table
  assert.equal(LipSync.paramsAt(CUES, 0.58, own).jaw, 0.9);
  assert.throws(() => LipSync.paramsAt(CUES, 0, "nope"), /unknown table/);
});

test("missing mouth shapes fall back to the nearest drawn one", () => {
  const twoPart = (k) => ["open", "closed"].includes(k);
  assert.deepEqual(Object.keys(LipSync.SHAPES).map((s) => LipSync.pick(s, twoPart)),
    ["closed", "open", "open", "open", "open", "open", "closed", "open", "closed"]); // A B C D E F G H X
  const demo = (k) => ["closed", "A", "B", "C", "D", "E", "F"].includes(k);  // the engines demo's character
  assert.equal(LipSync.pick("G", demo), "A");
  assert.equal(LipSync.pick("H", demo), "C");
  assert.equal(LipSync.pick("X", demo), "closed");
  const svg = LipSync.mouthSVG({ X: "", A: "<a/>", C: "<c/>" });
  assert.match(svg, /<g class="m m-G"><a\/><\/g>/);
  assert.match(svg, /<g class="m m-D"><c\/><\/g>/);
});

test("the engines demo's cues fit its talking beat", () => {
  const html = readFileSync(path.join(ROOT, "examples/engines-demo/index.html"), "utf8");
  const offset = +html.match(/lipsync\(LipSync\.cues\("talk\.visemes"\), \{ offset: ([\d.]+) \}\)/)[1];
  const cues = engine("examples/engines-demo/talk.visemes.js").LipSync.cues("talk.visemes");
  assert.ok(cues.every((c) => /^[A-HX]$/.test(c.value)));
  assert.ok(offset >= 4 && offset + cues.at(-1).end <= 6, "the line runs outside the 4–6 s SVG rig scene");
});

test("Python twin: same shapes, tables and values", { skip: !has("python3") && "needs python3" }, () => {
  const times = Array.from({ length: 90 }, (_, i) => i / 100);
  const py = run("python3", ["-B", "-c", `
import json, sys
sys.path.insert(0, "engines/blender")
import lipsync as L
cues = [(c["start"], c["end"], c["value"]) for c in json.loads(sys.argv[1])]
cues.sort()
print(json.dumps({"shapes": L.SHAPES, "tables": L.TABLES,
                  "at": [L.params_at(cues, t) for t in json.loads(sys.argv[2])],
                  "shape": [L.shape_at(cues, t, 0.1) for t in json.loads(sys.argv[2])]}))`,
  JSON.stringify(CUES), JSON.stringify(times)]);
  assert.equal(py.code, 0, py.out);
  const p = JSON.parse(py.out);
  assert.deepEqual(p.shapes, plain(LipSync.SHAPES));
  assert.deepEqual(p.tables, plain(LipSync.TABLES));
  times.forEach((t, i) => {
    const js = LipSync.paramsAt(CUES, t);
    for (const k in js) assert.ok(Math.abs(js[k] - p.at[i][k]) < 1e-9, `params at ${t}: ${k}`);
    assert.equal(p.shape[i], LipSync.shapeAt(CUES, t, 0.1), `shape at ${t}`);
  });
});

const rhubarb = process.env.RHUBARB || (has("rhubarb") && "rhubarb") || (() => {
  const dir = path.join(os.homedir(), ".cache/rhubarb-lip-sync");
  return existsSync(dir) && readdirSync(dir).map((d) => path.join(dir, d, "rhubarb")).find(existsSync);
})();
test("lipsync.sh writes Rhubarb's JSON and the .js twin", {
  skip: (!rhubarb && "Rhubarb not installed") || (!has("ffmpeg") && "needs ffmpeg") || (!has("python3") && "needs python3"),
  timeout: 60_000,
}, () => {
  const dir = tmp();
  const wav = path.join(dir, "tone.wav"), out = path.join(dir, "out/line.visemes.json");
  // A vowel-ish buzz between silences: not speech, but Rhubarb still has to produce a well-formed track.
  run("ffmpeg", ["-v", "error", "-f", "lavfi", "-i", "sine=frequency=220:duration=0.6", "-af", "adelay=300,apad=pad_dur=0.3", wav]);
  const r = run("bash", ["scripts/lipsync.sh", wav, out]);
  assert.equal(r.code, 0, r.out);
  const d = JSON.parse(readFileSync(out, "utf8"));
  assert.ok(d.mouthCues.length > 0 && d.metadata.duration > 1);
  assert.equal(d.metadata.soundFile, undefined, "temp path left in the JSON");
  const w = engine(path.relative(ROOT, out.replace(/\.json$/, ".js")));
  assert.equal(w.LipSync.cues("line.visemes").length, d.mouthCues.length);
});
