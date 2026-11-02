#!/usr/bin/env node
/* Frame-exact capture of a live web page you own (a product site's 3D scene,
 * a web app, a dashboard) into a PNG sequence, to use as a <video> plate.
 *
 *   node engines/capture.mjs <url> <out_dir> --duration 10 [--size 540x960 --scale 2 --fps 30 --drive drive.mjs]
 *
 * The page's clock (performance.now, Date.now) and requestAnimationFrame are
 * replaced with a virtual clock stepped once per frame, so a page that animates
 * on its own timer comes out the same every run. The optional --drive module
 * moves the page through the shot:
 *
 *   export async function setup(page) { ... }     // hide UI, inject CSS, settle the scene
 *   export async function frame(page, t) { ... }  // scroll / click / set state for time t
 *
 * Then: ffmpeg -framerate 30 -i <out_dir>/f_%05d.png -c:v libx264 -crf 12 -pix_fmt yuv420p -g 1 plate.mp4
 * (-g 1 = every frame a keyframe, so the composition can seek it exactly).
 * Worked example: productions/bike-logger/REEL-001-kit/capture/drive.mjs.
 */
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("../core/node_modules/playwright-core");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const [url, out, ...rest] = process.argv.slice(2);
const opt = (k, d) => { const i = rest.indexOf("--" + k); return i >= 0 ? rest[i + 1] : d; };
if (!url || !out) { console.error("usage: capture.mjs <url> <out_dir> --duration s [--size WxH --scale n --fps n --drive file.mjs]"); process.exit(2); }
const [W, H] = opt("size", "540x960").split("x").map(Number);
const scale = +opt("scale", 2), fps = +opt("fps", 30), duration = +opt("duration", 0);
if (!duration) { console.error("--duration is required"); process.exit(2); }
const drive = opt("drive") ? await import(pathToFileURL(path.resolve(opt("drive")))) : {};

await mkdir(out, { recursive: true });
// GPU compositing on, as in the original Bike Logger capture. If the captured page plays <video>, add
// --disable-gpu-compositing (as core/render.mjs does) or its video comes out ~10 levels too bright.
const browser = await chromium.launch({
  executablePath: CHROME,
  args: ["--force-color-profile=srgb", "--hide-scrollbars", "--enable-gpu", "--use-angle=metal", "--ignore-gpu-blocklist"],
});
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: scale });
page.on("pageerror", (e) => console.error("pageerror:", String(e)));
await page.addInitScript(() => {
  let vt = 0; const q = []; const d0 = Date.now();
  performance.now = () => vt;
  Date.now = () => d0 + vt;
  window.requestAnimationFrame = (cb) => { q.push(cb); return q.length; };
  window.__step = (dt) => { vt += dt * 1000; q.splice(0).forEach((cb) => cb(vt)); };
});
// No analytics while capturing.
await page.route(/googletagmanager|google-analytics|plausible|segment\.io/, (r) => r.abort());
await page.goto(url, { waitUntil: "networkidle" });
await page.evaluate(() => document.fonts.ready);
await page.addStyleTag({ content: "html { scroll-behavior: auto !important; }" });
if (drive.setup) await drive.setup(page);

const frames = Math.round(duration * fps);
const t0 = Date.now();
for (let n = 0; n < frames; n++) {
  if (drive.frame) await drive.frame(page, n / fps);
  // Frame n shows the page at exactly n / fps (frame 0 runs pending callbacks at time 0).
  await page.evaluate((dt) => window.__step(dt), n === 0 ? 0 : 1 / fps);
  await page.screenshot({ path: path.join(out, `f_${String(n).padStart(5, "0")}.png`) });
  if (n % fps === 0) process.stdout.write(`\rframe ${n}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
await browser.close();
console.log(`\rcaptured ${frames} frames (${W * scale}x${H * scale}) → ${out}`);
