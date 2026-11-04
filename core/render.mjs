#!/usr/bin/env node
/* Deterministic renderer for compositions (HTML + GSAP, plus any engine in
 * engines/ that registers with Studio.onSeek: Lottie, Three.js, Pixi, video).
 *
 *   node core/render.mjs video  <composition.html> <out.mp4> [--audio mix.wav] [--safe] [--frames <dir>] [--workers N]
 *   node core/render.mjs still  <composition.html> <out.png> [--t 1.5] [--safe]
 *   node core/render.mjs stills <composition.html> <out_dir> [--every 0.5 | --at 0,1.2,3] [--safe] [--workers N]
 *   node core/render.mjs text-qa <composition.html> <qa_dir> [--every 0.25]
 *                         text size, contrast, the 3 s hook and Reels safe zones → <qa_dir>/text.md (core/lib/qa-text.mjs);
 *                         exits 1 when something fails
 *
 *   --format 4x5          render one of the formats the composition declares (Studio.setup({ formats }))
 *   --formats all|4x5,1x1 render several: <out>-<format>.mp4 / .png / <out_dir>-<format>
 *   --workers N           Chrome pages rendering frames in parallel (default: auto, up to 4). Frames are written
 *                         in order to one encoder, so the video is the same whatever N is.
 *   --motion-blur N       average N subframes per frame in linear light (default: Studio.setup({ motionBlur }), else
 *                         off; 8 looks smooth, 1 turns it off). Renders take about N times as long
 *   --shutter 0.5         part of the frame interval the shutter is open (0.5 = 180°; 1 = full smear)
 *   --capture beginframe  Linux: capture with HeadlessExperimental.beginFrame in chrome-headless-shell (each frame is
 *                         one compositor frame, nothing can race the screenshot). Needs Node 22+ and the shell
 *                         (HEADLESS_SHELL_PATH, or Debian's chromium-headless-shell). Default: screenshots, or
 *                         $REEL_CAPTURE.
 *
 * Paths are relative to the repo root (reel-studio/). The page is served from
 * the repo root over a local HTTP server so assets load with absolute paths
 * like /brands/<name>/assets/..., /core/lib/... and /engines/...
 *
 * Size, fps and duration come from the composition's Studio.setup().
 * Video plates (Studio.video) are decoded to PNG frames with ffmpeg once (cached in $REEL_PLATE_CACHE, default
 * <tmp>/reel-studio-plates) and shown frame by frame, so Chrome never decodes video in a render.
 */
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { readFile, mkdir, stat, writeFile, readdir, rename, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { Worker } from "node:worker_threads";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Google Chrome: CHROME_PATH wins, else the usual install paths on macOS and Linux
const CHROME = process.env.CHROME_PATH || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].find((p) => existsSync(p)) || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PLATE_CACHE = process.env.REEL_PLATE_CACHE || path.join(os.tmpdir(), "reel-studio-plates");
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ttf": "font/ttf", ".otf": "font/otf", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".mp3": "audio/mpeg", ".wav": "audio/wav",
  ".riv": "application/octet-stream", ".wasm": "application/wasm",
};

function args(argv) {
  const [mode, input, output, ...rest] = argv;
  const opts = {};
  for (let i = 0; i < rest.length; i++) {
    const k = rest[i].replace(/^--/, "");
    const next = rest[i + 1];
    if (next === undefined || next.startsWith("--")) opts[k] = true;
    else { opts[k] = next; i++; }
  }
  if (!mode || !input || !output) {
    console.error("usage: render.mjs <video|still|stills> <composition.html> <out> [options]");
    process.exit(2);
  }
  return { mode, input, output, opts };
}

function serve() {
  const server = createServer(async (req, res) => {
    try {
      const url = decodeURIComponent(new URL(req.url, "http://x").pathname);
      // Decoded plate frames live outside the repo, in the plate cache
      const [base, rel] = url.startsWith("/__plates/") ? [PLATE_CACHE, url.slice(10)] : [ROOT, url];
      const file = path.join(base, rel);
      if (!file.startsWith(base)) throw new Error("outside root");
      const s = await stat(file);
      const data = await readFile(s.isDirectory() ? path.join(file, "index.html") : file);
      const type = TYPES[path.extname(file).toLowerCase()] || "application/octet-stream";
      // Range requests: Chrome needs them to seek inside larger <video> files.
      const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
      if (range) {
        const start = range[1] ? +range[1] : data.length - +range[2];
        const end = range[1] && range[2] ? Math.min(+range[2], data.length - 1) : data.length - 1;
        res.writeHead(206, { "content-type": type, "accept-ranges": "bytes", "content-range": `bytes ${start}-${end}/${data.length}`, "content-length": end - start + 1 });
        return res.end(data.subarray(start, end + 1));
      }
      res.writeHead(200, { "content-type": type, "accept-ranges": "bytes" });
      res.end(data);
    } catch {
      res.writeHead(404); res.end("not found");
    }
  });
  return new Promise((resolve) => server.listen(0, "127.0.0.1", () => resolve(server)));
}

// WebGL (Three.js, Pixi) on the GPU, but compositing in software: with GPU compositing Chrome
// draws <video> plates ~10 levels brighter than ffmpeg decodes them (measured 2026-11-02). Renders no longer
// play <video> (plates are decoded to frames), but previews still do.
// WebGL: Metal on macOS; elsewhere (Linux, CI without a GPU) Chrome's software renderer, SwiftShader
const CHROME_ARGS = ["--force-color-profile=srgb", "--hide-scrollbars", "--enable-gpu", "--ignore-gpu-blocklist",
  "--disable-gpu-compositing",
  ...(process.platform === "darwin" ? ["--use-angle=metal"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])];

function run(cmd, argv) {
  return new Promise((res, rej) => {
    const p = spawn(cmd, argv, { stdio: ["ignore", "pipe", "pipe"] });
    let out = "", err = "";
    p.stdout.on("data", (d) => (out += d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", rej);
    p.on("close", (c) => (c === 0 ? res(out) : rej(new Error(`${cmd} exited ${c}: ${err.trim()}`))));
  });
}

// Decode a plate to PNG frames once; the cache key changes when the file does.
const plateJobs = new Map();
function decodePlate(file) {
  if (!plateJobs.has(file)) plateJobs.set(file, (async () => {
    const s = await stat(file);
    const key = createHash("sha1").update(`${file}|${s.size}|${s.mtimeMs}|png1`).digest("hex").slice(0, 16);
    const dir = path.join(PLATE_CACHE, key);
    const info = path.join(dir, "plate.json");
    if (existsSync(info)) return { key, ...JSON.parse(await readFile(info, "utf8")) };
    const rate = (await run("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=r_frame_rate",
      "-of", "csv=p=0", file])).trim();
    const [num, den = 1] = rate.split("/").map(Number);
    const tmp = `${dir}.tmp-${process.pid}`;
    await rm(tmp, { recursive: true, force: true });
    await mkdir(tmp, { recursive: true });
    process.stdout.write(`decoding plate ${path.relative(ROOT, file)} … `);
    // Every decoded frame as it is (no resampling): frame n is shown from n / fps, as a <video> would.
    await run("ffmpeg", ["-hide_banner", "-loglevel", "error", "-i", file, "-map", "0:v:0", "-fps_mode", "passthrough",
      "-pix_fmt", "rgb24", "-compression_level", "1", path.join(tmp, "%06d.png")]);
    const count = (await readdir(tmp)).filter((f) => f.endsWith(".png")).length;
    const meta = { count, fps: num / den, source: path.relative(ROOT, file) };
    await writeFile(path.join(tmp, "plate.json"), JSON.stringify(meta));
    await rename(tmp, dir).catch(() => rm(tmp, { recursive: true, force: true }));  // another render won the race
    console.log(`${count} frames`);
    return { key, ...meta };
  })());
  return plateJobs.get(file);
}

async function preparePlates(evaluate) {
  const list = await evaluate("window.__plates()");
  const use = [];
  for (const p of list) {
    if (!p.src) throw new Error("A Studio.video() plate has no src");
    const u = new URL(p.src);
    const file = path.join(ROOT, decodeURIComponent(u.pathname));
    if (!u.hostname.startsWith("127.0.0.1") || !existsSync(file)) throw new Error(`Video plate failed to load: ${p.src}`);
    const f = await decodePlate(file);
    use.push({ i: p.i, base: `/__plates/${f.key}`, count: f.count, fps: f.fps, ext: "png" });
  }
  if (use.length) await evaluate(`window.__usePlates(${JSON.stringify(use)})`);
}

// One browser for the whole run; each worker (and each format) gets its own page.
async function session(capture) {
  const server = await serve();
  const { port } = server.address();
  let browser;
  if (capture === "beginframe") {
    const { launchShell } = await import("./lib/beginframe.mjs");
    browser = await launchShell(CHROME_ARGS);
  } else {
    const pw = await chromium.launch({ executablePath: CHROME, args: CHROME_ARGS });
    browser = {
      async newPage(url) {
        const ctx = await pw.newContext({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
        const page = await ctx.newPage();
        const errors = [];
        page.on("pageerror", (e) => errors.push(String(e)));
        page.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && errors.push(m.text()));
        page.on("response", (r) => r.status() >= 400 && !r.url().endsWith("/favicon.ico") && errors.push(`${r.status()} ${r.url()}`));
        await page.goto(url);
        const stage = page.locator("#stage");
        return {
          errors,
          evaluate: (expr) => page.evaluate(expr),
          setViewport: (width, height) => page.setViewportSize({ width, height }),
          screenshot: () => stage.screenshot({ type: "png", animations: "disabled" }),
          close: () => ctx.close(),
        };
      },
      close: () => pw.close(),
    };
  }
  return { port, browser, close: async () => { await browser.close(); server.close(); } };
}

async function openPage(ses, input, { safe, format }) {
  const rel = path.relative(ROOT, path.resolve(input)).split(path.sep).join("/");
  const q = `render=1&plates=frames${safe ? "&safe=1" : ""}${format ? `&format=${format}` : ""}`;
  const p = await ses.browser.newPage(`http://127.0.0.1:${ses.port}/${rel}?${q}`);
  try {
    await p.evaluate("window.__ready");
  } catch (e) {
    throw new Error(`${e.message.split("\n")[0]}${p.errors.length ? "\n  " + p.errors.join("\n  ") : ""}`);
  }
  const meta = await p.evaluate("window.__meta()");
  await p.setViewport(meta.width, meta.height);
  await preparePlates(p.evaluate);
  const { samples, shutter } = motionBlur(meta);
  const blender = samples > 1 ? blendWorker() : null;
  // Motion blur: the shutter opens at t and stays open for `shutter` of the frame interval; `samples` subframes
  // evenly spaced inside it are averaged (core/lib/blend.mjs). The last subframe stays before the next frame.
  const shot = async (t, file) => {
    const subs = [];
    for (let k = 0; k < samples; k++) {
      await p.evaluate(`window.__seek(${t + (k / samples) * (shutter / meta.fps)})`);
      subs.push(await p.screenshot(meta));
    }
    const buf = blender ? await blender.blend(subs) : subs[0];
    if (file) await writeFile(file, buf);
    return buf;
  };
  const close = async () => { await blender?.close(); await p.close(); };
  return { meta, shot, page: p, errors: p.errors, close };
}

// Subframes per frame and shutter: --motion-blur <samples> / --shutter <0..1> win over Studio.setup({ motionBlur })
function motionBlur(meta) {
  const samples = Math.max(1, parseInt(opts["motion-blur"] ?? meta.motionBlur?.samples ?? 1, 10) || 1);
  const shutter = parseFloat(opts.shutter ?? meta.motionBlur?.shutter ?? 0.5);
  if (!(shutter > 0 && shutter <= 1)) throw new Error(`--shutter must be in (0, 1], got ${opts.shutter}`);
  return { samples, shutter };
}

// One blend thread per page: blending 8 full-size PNGs takes ~200 ms of CPU, which would serialise the pages
function blendWorker() {
  const w = new Worker(new URL("./lib/blend-worker.mjs", import.meta.url));
  const waiting = new Map();
  let next = 0;
  w.on("message", ({ id, out, error }) => {
    const job = waiting.get(id);
    waiting.delete(id);
    error ? job.rej(new Error(error)) : job.res(Buffer.from(out.buffer, out.byteOffset, out.byteLength));
  });
  w.on("error", (e) => { for (const job of waiting.values()) job.rej(e); waiting.clear(); });
  return {
    blend: (pngs) => new Promise((res, rej) => { const id = next++; waiting.set(id, { res, rej }); w.postMessage({ id, pngs }); }),
    close: () => w.terminate(),
  };
}

function ffmpeg(argv) {
  const p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...argv], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => p.on("close", (c) => (c === 0 ? res() : rej(new Error("ffmpeg exited " + c)))));
  return { stdin: p.stdin, done };
}

// Pages to render with: --workers N, or enough to keep ~60 frames each, up to 4 and a third of the cores.
function workerCount(frames) {
  if (opts.workers && opts.workers !== "auto") return Math.max(1, parseInt(opts.workers, 10));
  const cores = os.availableParallelism?.() ?? os.cpus().length;
  return Math.max(1, Math.min(4, Math.floor(cores / 3), Math.ceil(frames / 60)));
}

// Render frames 0..n-1 on several pages; deliver(i, buf) is called in frame order.
async function renderFrames(pages, n, timeOf, fileOf, deliver) {
  const N = pages.length;
  const ready = new Map();
  let next = 0, writing = Promise.resolve(), advanced, notify;
  const reset = () => (advanced = new Promise((r) => (notify = r)));
  reset();
  const flush = async () => {
    while (ready.has(next)) {
      const buf = ready.get(next);
      ready.delete(next);
      await deliver(next, buf);
      next++;
      notify(); reset();
    }
  };
  await Promise.all(pages.map(async (pg, k) => {
    for (let i = k; i < n; i += N) {
      // Don't run far ahead of the encoder (bounded memory)
      while (i - next > N * 3) await advanced;
      const buf = await pg.shot(timeOf(i), fileOf(i));
      ready.set(i, buf);
      writing = writing.then(flush);
    }
  }));
  await writing;
}

// Text QA: sample the timeline, measure every visible text block, write <qa_dir>/text.md + text.json + evidence
async function textQa(pg, qaDir) {
  const qa = await import("./lib/qa-text.mjs");
  const { meta, page } = pg;
  const every = parseFloat(opts.every ?? 0.25);
  const last = meta.duration - 1 / meta.fps;
  const times = Array.from({ length: Math.floor(last / every) + 1 }, (_, i) => +(i * every).toFixed(3));
  const sample = async (t) => {
    await page.evaluate(`window.__seek(${t})`);
    const units = await page.evaluate(qa.COLLECT);
    if (!units.length) return { t, units: [] };
    const withText = await page.screenshot(meta);
    await page.evaluate(qa.HIDE);
    const without = await page.screenshot(meta);
    await page.evaluate(qa.SHOW);
    return { t, units: qa.measure(withText, without, units), shot: withText };
  };
  const samples = [];
  for (const t of times) {
    const { shot, ...s } = await sample(t);
    samples.push(s);
    process.stdout.write(`\rtext-qa ${t.toFixed(2)}/${last.toFixed(2)} s`);
  }
  const sum = qa.summarise(samples, meta, every);
  // Evidence: the worst moment of each block with a problem, its box drawn in red
  await mkdir(path.join(qaDir, "flagged"), { recursive: true });
  for (const b of sum.blocks) {
    const at = b.contrastResult !== "ok" ? b.contrastAt : b.zoneResult !== "ok" ? b.zoneAt : b.size !== "ok" ? b.first : null;
    if (at === null) continue;
    const { shot, units } = await sample(at);
    const u = units.find((x) => x.id === b.id);
    if (!shot || !u) continue;
    const png = path.join(qaDir, "flagged", `text_${b.id}_t${at}.png`);
    const { x0, y0, x1, y1 } = u.box;
    await writeFile(png, shot);
    await run("ffmpeg", ["-v", "error", "-y", "-i", png, "-vf",
      `drawbox=x=${Math.round(x0) - 6}:y=${Math.round(y0) - 6}:w=${Math.round(x1 - x0) + 12}:h=${Math.round(y1 - y0) + 12}:color=red:t=6`,
      "-update", "1", "-frames:v", "1", png.replace(/\.png$/, ".jpg")]);
    await rm(png);
    b.evidence = path.join("flagged", path.basename(png).replace(/\.png$/, ".jpg"));
  }
  await writeFile(path.join(qaDir, "text.json"), JSON.stringify({ meta, every, ...sum }, null, 2));
  const md = qa.report(path.relative(ROOT, path.resolve(input)), meta, sum, every);
  await writeFile(path.join(qaDir, "text.md"), md);
  console.log("\r" + md);
  const failed = !sum.hookOk || sum.blocks.some((b) => [b.size, b.contrastResult, b.zoneResult].includes("fail"));
  if (failed) process.exitCode = 1;
}

const suffixed = (out, fmt) => {
  const ext = path.extname(out);
  return ext ? out.slice(0, -ext.length) + `-${fmt}` + ext : `${out}-${fmt}`;
};

async function renderOne(ses, format, output) {
  const first = await openPage(ses, input, { safe: !!opts.safe, format });
  const { meta } = first;
  const pages = [first];
  const errors = () => pages.flatMap((p) => p.errors);
  const t0 = Date.now();
  try {
    if (mode === "still") {
      await mkdir(path.dirname(path.resolve(output)), { recursive: true });
      await first.shot(parseFloat(opts.t ?? 0), output);
      console.log(`${output}  (${meta.width}x${meta.height} @ t=${opts.t ?? 0}s)`);
    } else if (mode === "stills" || mode === "video") {
      let times, enc;
      if (mode === "stills") {
        await mkdir(output, { recursive: true });
        const every = parseFloat(opts.every ?? 0.5);
        times = opts.at
          ? String(opts.at).split(",").map(Number)
          : Array.from({ length: Math.floor(meta.duration / every) + 1 }, (_, i) => +(i * every).toFixed(3));
      } else {
        times = Array.from({ length: Math.round(meta.duration * meta.fps) }, (_, i) => i / meta.fps);
        await mkdir(path.dirname(path.resolve(output)), { recursive: true });
        if (opts.frames) await mkdir(opts.frames, { recursive: true });
        enc = ffmpeg([
          "-f", "image2pipe", "-framerate", String(meta.fps), "-c:v", "png", "-i", "-",
          ...(opts.audio ? ["-i", opts.audio] : []),
          // aq-mode=3 + light deblock keeps smooth brand gradients from banding/shifting between frames.
          // maxrate/bufsize: clean frames stay at CRF 16 (far under the cap); animated grain/noise alone pushed
          // retro-film to 62 Mbit/s (100 MB for 5 s). Instagram re-encodes to ~3.5 Mbit/s anyway; upload guides say 8–12.
          "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "16",
          "-maxrate", process.env.REEL_MAXRATE || "12M", "-bufsize", process.env.REEL_BUFSIZE || "24M",
          "-x264-params", "aq-mode=3:aq-strength=0.9:deblock=-1,-1", "-g", String(meta.fps * 2),
          "-pix_fmt", "yuv420p", "-r", String(meta.fps), "-fps_mode", "cfr",
          "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
          ...(opts.audio ? ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-af", "apad", "-shortest"] : []),
          "-movflags", "+faststart", output,
        ]);
      }
      const n = times.length;
      const N = Math.min(workerCount(n), n);
      pages.push(...await Promise.all(Array.from({ length: N - 1 }, () => openPage(ses, input, { safe: !!opts.safe, format }))));
      const fileOf = mode === "stills"
        ? (i) => path.join(output, `t_${times[i].toFixed(2).padStart(6, "0")}.png`)
        : (i) => (opts.frames ? path.join(opts.frames, `f_${String(i).padStart(5, "0")}.png`) : undefined);
      const timeOf = mode === "stills" ? (i) => Math.min(times[i], meta.duration - 1 / meta.fps) : (i) => times[i];
      await renderFrames(pages, n, timeOf, fileOf, async (i, buf) => {
        if (!enc) return;
        if (!enc.stdin.write(buf)) await new Promise((r) => enc.stdin.once("drain", r));
        if (i % meta.fps === 0) process.stdout.write(`\rframe ${i}/${n}`);
      });
      if (enc) {
        enc.stdin.end();
        await enc.done;
        const mb = motionBlur(meta);
        const blurNote = mb.samples > 1 ? `, motion blur ${mb.samples}×${mb.shutter}` : "";
        console.log(`\r${output}  (${meta.width}x${meta.height}, ${meta.fps} fps, ${n} frames, ${meta.duration}s, ${N} worker${N > 1 ? "s" : ""}${blurNote}) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
      } else console.log(`${n} stills → ${output}`);
    } else if (mode === "text-qa") {
      await textQa(first, output);
    } else {
      throw new Error("unknown mode " + mode);
    }
    if (errors().length) { console.error("Page errors:\n  " + [...new Set(errors())].join("\n  ")); process.exitCode = 1; }
  } finally {
    await Promise.all(pages.map((p) => p.close()));
  }
}

const { mode, input, output, opts } = args(process.argv.slice(2));
const ses = await session(opts.capture || process.env.REEL_CAPTURE || "screenshot");
try {
  if (opts.formats) {
    let list = String(opts.formats).split(",");
    if (opts.formats === "all") {
      const probe = await openPage(ses, input, { safe: false });
      list = probe.meta.formats;
      await probe.close();
    }
    for (const f of list) await renderOne(ses, f, suffixed(output, f));
  } else {
    await renderOne(ses, opts.format, output);
  }
} catch (e) {
  console.error(String(e.message || e));
  process.exitCode = 1;
} finally {
  await ses.close();
}
