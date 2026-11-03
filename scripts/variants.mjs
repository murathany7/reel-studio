#!/usr/bin/env node
/* Render every variant of a production from one composition: a matrix of axes → many MP4s, in parallel.
 *
 *   node scripts/variants.mjs <variants.json> [--jobs 4] [--only pattern=pas,style=adult] [--dry] [--check] [--force] [--qa]
 *
 *   --dry    list the variants and their queries      --check  build each variant (one still) and report errors
 *   --force  re-render up-to-date MP4s                --qa     run qa-video.sh on each export
 *
 * variants.json (paths relative to the file):
 *   {
 *     "id": "REEL-009",
 *     "composition": "composition/index.html",
 *     "out": "export", "qa": "qa",
 *     "name": "{id}-{pattern}-{style}-{size}",          // file name pattern; any axis in {braces}
 *     "axes": { "pattern": ["pas", "bab"], "style": ["fun", "adult"], "size": ["reel"] },
 *     "exclude": [{ "pattern": "bab", "size": "feed" }],  // drop combos matching every key given
 *     "include": [{ "pattern": "pas", "style": "fun", "size": "feed", "hook": "B" }]   // add extra combos
 *   }
 *
 * Each variant renders `composition?axis=value&…` (the page reads Studio.params). Existing MP4s newer than every
 * source file are skipped unless --force. Writes <out>/manifest.json and manifest.md, a cover per variant and a
 * contact sheet <qa>/variants-sheet.jpg; with --qa also runs scripts/qa-video.sh on each into <qa>/<name>/.
 */
import { readFile, writeFile, mkdir, stat, readdir } from "node:fs/promises";
import { spawn } from "node:child_process";
import { cpus } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const argv = process.argv.slice(2);
const flag = (k, d) => { const i = argv.indexOf("--" + k); return i < 0 ? d : argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : true; };
const file = argv.find((a) => !a.startsWith("--") && a.endsWith(".json"));
if (!file) { console.error("usage: variants.mjs <variants.json> [--jobs N] [--only k=v,...] [--dry] [--force] [--qa]"); process.exit(2); }

const cfg = JSON.parse(await readFile(file, "utf8"));
const base = path.dirname(path.resolve(file));
const comp = path.join(base, cfg.composition || "composition/index.html");
const outDir = path.join(base, cfg.out || "export"), qaDir = path.join(base, cfg.qa || "qa");
const jobs = +flag("jobs", Math.max(1, Math.min(6, Math.floor(cpus().length / 2))));

// ---- expand the matrix ----
export function expand({ axes = {}, exclude = [], include = [] }) {
  let combos = [{}];
  for (const [k, vals] of Object.entries(axes)) combos = combos.flatMap((c) => vals.map((v) => ({ ...c, [k]: v })));
  const match = (c, rule) => Object.entries(rule).every(([k, v]) => (Array.isArray(v) ? v.includes(c[k]) : c[k] === v));
  combos = combos.filter((c) => !exclude.some((r) => match(c, r)));
  for (const extra of include) if (!combos.some((c) => JSON.stringify(c) === JSON.stringify(extra))) combos.push(extra);
  return combos;
}
let combos = expand(cfg);
const only = flag("only");
if (typeof only === "string") {
  const rule = Object.fromEntries(only.split(",").map((kv) => kv.split("=")).map(([k, v]) => [k, v.split("|")]));
  combos = combos.filter((c) => Object.entries(rule).every(([k, vs]) => vs.includes(String(c[k]))));
}
const nameOf = (c) => (cfg.name || "{id}-" + Object.keys(c).map((k) => `{${k}}`).join("-"))
  .replace(/\{(\w+)\}/g, (_, k) => (k === "id" ? cfg.id || "VAR" : c[k] ?? ""))
  .replace(/-+/g, "-").replace(/-$/, "");
const variants = combos.map((c) => ({ axes: c, name: nameOf(c), query: new URLSearchParams(c).toString() }));
const dupes = variants.map((v) => v.name).filter((n, i, a) => a.indexOf(n) !== i);
if (dupes.length) { console.error("Two variants share a name (add the axis to \"name\"): " + [...new Set(dupes)].join(", ")); process.exit(2); }

console.log(`${variants.length} variants, ${jobs} at a time → ${path.relative(ROOT, outDir)}`);
if (flag("dry")) { for (const v of variants) console.log("  " + v.name + "   ?" + v.query); process.exit(0); }

const run = (cmd, args, opts = {}) => new Promise((res) => {
  const p = spawn(cmd, args, { cwd: ROOT, ...opts });
  let log = ""; p.stdout?.on("data", (d) => (log += d)); p.stderr?.on("data", (d) => (log += d));
  p.on("close", (code) => res({ code, log }));
});
async function newestSource() {
  let t = 0;
  const walk = async (d) => { for (const e of await readdir(d, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name.startsWith(".")) continue;
    const p = path.join(d, e.name);
    if (e.isDirectory()) await walk(p); else if (/\.(html|js|mjs|css|json|svg)$/.test(e.name)) t = Math.max(t, (await stat(p)).mtimeMs);
  } };
  for (const d of [path.dirname(comp), path.join(ROOT, "engines"), path.join(ROOT, "core/lib"), path.join(ROOT, "brands")]) await walk(d);
  return Math.max(t, (await stat(file)).mtimeMs);
}
if (flag("check")) {
  const tmp = path.join((await import("node:os")).tmpdir(), "variants-check");
  await mkdir(tmp, { recursive: true });
  let i = 0, bad = 0;
  await Promise.all(Array.from({ length: jobs }, async () => { while (i < variants.length) { const v = variants[i++];
    const r = await run("node", ["core/render.mjs", "still", `${path.relative(ROOT, comp)}?${v.query}`, path.join(tmp, v.name + ".png"), "--t", "0.5"]);
    if (r.code) bad++;
    console.log(`${r.code ? "✗" : "✓"} ${v.name}${r.code ? "  " + r.log.split("\n").filter((l) => /rror|guardrail/.test(l)).slice(0, 2).join(" | ") : ""}`);
  } }));
  console.log(`${variants.length - bad}/${variants.length} build`); process.exit(bad ? 1 : 0);
}
// ---- render ----
const srcTime = await newestSource();
await mkdir(outDir, { recursive: true }); await mkdir(path.join(outDir, "covers"), { recursive: true });
const results = [];
let next = 0, done = 0;
const t0 = Date.now();
async function worker() {
  while (next < variants.length) {
    const v = variants[next++];
    const mp4 = path.join(outDir, v.name + ".mp4");
    const fresh = !flag("force") && (await stat(mp4).then((s) => s.mtimeMs > srcTime, () => false));
    const r = fresh ? { code: 0, log: "up to date" } : await run("node", ["core/render.mjs", "video", `${path.relative(ROOT, comp)}?${v.query}`, path.relative(ROOT, mp4)]);
    const res = { ...v, file: path.relative(base, mp4), ok: r.code === 0, skipped: fresh };
    if (res.ok) {
      const probe = await run("ffprobe", ["-v", "error", "-show_entries", "format=duration:stream=width,height", "-of", "json", mp4]);
      try { const j = JSON.parse(probe.log); res.duration = +(+j.format.duration).toFixed(2); res.size = `${j.streams[0].width}x${j.streams[0].height}`; } catch {}
      const cover = path.join(outDir, "covers", v.name + ".jpg");
      await run("ffmpeg", ["-v", "error", "-y", "-ss", String((res.duration || 4) * (cfg.coverAt ?? 0.3)), "-i", mp4, "-frames:v", "1", "-vf", "scale=270:-2", "-q:v", "3", cover]);
      res.cover = path.relative(base, cover);
      if (flag("qa")) {
        const q = await run("bash", ["scripts/qa-video.sh", mp4, path.join(qaDir, v.name)]);
        const rep = await readFile(path.join(qaDir, v.name, "report.md"), "utf8").catch(() => "");
        res.qa = { fails: (rep.match(/❌/g) || []).length, report: path.relative(base, path.join(qaDir, v.name, "report.md")), code: q.code };
      }
    } else res.error = r.log.split("\n").filter((l) => /error|Error|guardrail/.test(l)).slice(0, 4).join(" | ");
    results.push(res);
    done++;
    console.log(`[${done}/${variants.length}] ${res.ok ? (fresh ? "=" : "✓") : "✗"} ${v.name}${res.error ? "  " + res.error : ""}${res.qa ? `  qa ❌×${res.qa.fails}` : ""}`);
  }
}
await Promise.all(Array.from({ length: Math.min(jobs, variants.length) }, worker));
results.sort((a, b) => variants.findIndex((v) => v.name === a.name) - variants.findIndex((v) => v.name === b.name));

// ---- manifest + contact sheet ----
const keys = [...new Set(variants.flatMap((v) => Object.keys(v.axes)))];
const prev = await readFile(path.join(outDir, "manifest.json"), "utf8").then(JSON.parse, () => ({ variants: [] }));
const merged = [...prev.variants.filter((p) => !results.some((r) => r.name === p.name)), ...results];
await writeFile(path.join(outDir, "manifest.json"), JSON.stringify({ id: cfg.id, composition: cfg.composition, variants: merged }, null, 2));
const md = [`# ${cfg.id || ""} variants`, "", `${merged.filter((r) => r.ok).length} of ${merged.length} rendered. Rebuild: \`node scripts/variants.mjs ${path.relative(ROOT, file)}\``, "",
  `| File | ${keys.join(" | ")} | Length | Size | QA |`, `|---|${keys.map(() => "---").join("|")}|---|---|---|`,
  ...merged.map((r) => `| ${r.ok ? `\`${path.basename(r.file)}\`` : "✗ " + r.name} | ${keys.map((k) => r.axes[k] ?? "").join(" | ")} | ${r.duration ?? ""} s | ${r.size ?? ""} | ${r.qa ? (r.qa.fails ? `❌×${r.qa.fails}` : "✅") : ""} |`)].join("\n");
await writeFile(path.join(outDir, "manifest.md"), md + "\n");
const covers = merged.filter((r) => r.cover).map((r) => path.join(base, r.cover));
if (covers.length) {
  await mkdir(qaDir, { recursive: true });
  const cols = Math.min(8, covers.length), rows = Math.ceil(covers.length / cols);
  const list = path.join(qaDir, "variants-sheet.txt");
  await writeFile(list, covers.map((c) => `file '${c}'`).join("\n"));
  await run("ffmpeg", ["-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-vf", `scale=270:480:force_original_aspect_ratio=decrease,pad=270:480:(ow-iw)/2:(oh-ih)/2:color=0x131313,tile=${cols}x${rows}:padding=8:color=0x131313`, "-frames:v", "1", path.join(qaDir, "variants-sheet.jpg")]);
}
const failed = results.filter((r) => !r.ok);
console.log(`${results.length - failed.length}/${results.length} ok in ${((Date.now() - t0) / 1000).toFixed(0)} s. Manifest: ${path.relative(ROOT, path.join(outDir, "manifest.md"))}`);
process.exitCode = failed.length ? 1 : 0;
