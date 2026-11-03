#!/usr/bin/env node
/* Deterministic renderer for compositions (HTML + GSAP, plus any engine in
 * engines/ that registers with Studio.onSeek: Lottie, Three.js, Pixi, video).
 *
 *   node core/render.mjs video  <composition.html> <out.mp4> [--audio mix.wav] [--safe] [--frames <dir>]
 *   node core/render.mjs still  <composition.html> <out.png> [--t 1.5] [--safe]
 *   node core/render.mjs stills <composition.html> <out_dir> [--every 0.5 | --at 0,1.2,3] [--safe]
 *
 * Paths are relative to the repo root (reel-studio/). The page is served from
 * the repo root over a local HTTP server so assets load with absolute paths
 * like /brands/<name>/assets/..., /core/lib/... and /engines/...
 *
 * Size, fps and duration come from the composition's Studio.setup().
 */
import { existsSync } from "node:fs";
import { createServer } from "node:http";
import { readFile, mkdir, stat } from "node:fs/promises";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
// Google Chrome: CHROME_PATH wins, else the usual install paths on macOS and Linux
const CHROME = process.env.CHROME_PATH || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].find((p) => existsSync(p)) || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const TYPES = {
  ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg", ".webp": "image/webp", ".ttf": "font/ttf", ".otf": "font/otf", ".woff2": "font/woff2",
  ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".mp3": "audio/mpeg", ".wav": "audio/wav",
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
      const file = path.join(ROOT, url);
      if (!file.startsWith(ROOT)) throw new Error("outside root");
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
// draws <video> plates ~10 levels brighter than ffmpeg decodes them (measured 2026-11-02).
// playwright-core is pinned (1.49.1) because 1.64 shifted plate colours the same way.
// WebGL: Metal on macOS; elsewhere (Linux, CI without a GPU) Chrome's software renderer, SwiftShader
const CHROME_ARGS = ["--force-color-profile=srgb", "--hide-scrollbars", "--enable-gpu", "--ignore-gpu-blocklist",
  "--disable-gpu-compositing",
  ...(process.platform === "darwin" ? ["--use-angle=metal"] : ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"])];

async function openPage(input, safe) {
  const server = await serve();
  const { port } = server.address();
  const rel = path.relative(ROOT, path.resolve(input)).split(path.sep).join("/");
  const browser = await chromium.launch({ executablePath: CHROME, args: CHROME_ARGS });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  const errors = [];
  page.on("pageerror", (e) => errors.push(String(e)));
  page.on("console", (m) => m.type() === "error" && !m.text().startsWith("Failed to load resource") && errors.push(m.text()));
  page.on("response", (r) => r.status() >= 400 && !r.url().endsWith("/favicon.ico") && errors.push(`${r.status()} ${r.url()}`));
  await page.goto(`http://127.0.0.1:${port}/${rel}?render=1${safe ? "&safe=1" : ""}`);
  await page.evaluate(() => window.__ready);
  const meta = await page.evaluate(() => window.__meta());
  await page.setViewportSize({ width: meta.width, height: meta.height });
  const stage = page.locator("#stage");
  const shot = async (t, file) => {
    await page.evaluate((tt) => window.__seek(tt), t);
    return stage.screenshot({ path: file, type: "png", animations: "disabled" });
  };
  const close = async () => { await browser.close(); server.close(); };
  return { page, meta, shot, close, errors };
}

function ffmpeg(argv) {
  const p = spawn("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", ...argv], { stdio: ["pipe", "inherit", "inherit"] });
  const done = new Promise((res, rej) => p.on("close", (c) => (c === 0 ? res() : rej(new Error("ffmpeg exited " + c)))));
  return { stdin: p.stdin, done };
}

const { mode, input, output, opts } = args(process.argv.slice(2));
const { meta, shot, close, errors } = await openPage(input, !!opts.safe);
const t0 = Date.now();

try {
  if (mode === "still") {
    await mkdir(path.dirname(path.resolve(output)), { recursive: true });
    await shot(parseFloat(opts.t ?? 0), output);
    console.log(`${output}  (${meta.width}x${meta.height} @ t=${opts.t ?? 0}s)`);
  } else if (mode === "stills") {
    await mkdir(output, { recursive: true });
    const times = opts.at
      ? String(opts.at).split(",").map(Number)
      : Array.from({ length: Math.floor(meta.duration / parseFloat(opts.every ?? 0.5)) + 1 }, (_, i) => +(i * parseFloat(opts.every ?? 0.5)).toFixed(3));
    for (const t of times) {
      const name = path.join(output, `t_${t.toFixed(2).padStart(6, "0")}.png`);
      await shot(Math.min(t, meta.duration - 1 / meta.fps), name);
    }
    console.log(`${times.length} stills → ${output}`);
  } else if (mode === "video") {
    const frames = Math.round(meta.duration * meta.fps);
    const enc = [
      "-f", "image2pipe", "-framerate", String(meta.fps), "-c:v", "png", "-i", "-",
      ...(opts.audio ? ["-i", opts.audio] : []),
      // aq-mode=3 + light deblock keeps smooth brand gradients from banding/shifting between frames.
      "-c:v", "libx264", "-profile:v", "high", "-preset", "slow", "-crf", "16",
      "-x264-params", "aq-mode=3:aq-strength=0.9:deblock=-1,-1", "-g", String(meta.fps * 2),
      "-pix_fmt", "yuv420p", "-r", String(meta.fps), "-fps_mode", "cfr",
      "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
      ...(opts.audio ? ["-c:a", "aac", "-b:a", "192k", "-ar", "48000", "-af", "apad", "-shortest"] : []),
      "-movflags", "+faststart", output,
    ];
    await mkdir(path.dirname(path.resolve(output)), { recursive: true });
    if (opts.frames) await mkdir(opts.frames, { recursive: true });
    const { stdin, done } = ffmpeg(enc);
    for (let i = 0; i < frames; i++) {
      const file = opts.frames ? path.join(opts.frames, `f_${String(i).padStart(5, "0")}.png`) : undefined;
      const buf = await shot(i / meta.fps, file);
      if (!stdin.write(buf)) await new Promise((r) => stdin.once("drain", r));
      if (i % meta.fps === 0) process.stdout.write(`\rframe ${i}/${frames}`);
    }
    stdin.end();
    await done;
    console.log(`\r${output}  (${meta.width}x${meta.height}, ${meta.fps} fps, ${frames} frames, ${meta.duration}s) in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } else {
    throw new Error("unknown mode " + mode);
  }
  if (errors.length) { console.error("Page errors:\n  " + errors.join("\n  ")); process.exitCode = 1; }
} finally {
  await close();
}
