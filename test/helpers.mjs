// Shared helpers for the test suite (node --test test/).
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", ...opts });
  return { code: r.status, out: (r.stdout || "") + (r.stderr || "") };
}

export function tmp(prefix = "rs-test-") {
  return mkdtempSync(path.join(tmpdir(), prefix));
}

export const json = (rel) => JSON.parse(readFileSync(path.join(ROOT, rel), "utf8"));
export const md5 = (file) => createHash("md5").update(readFileSync(file)).digest("hex");
export const has = (cmd) => spawnSync("sh", ["-c", `command -v ${cmd}`]).status === 0;

// Same lookup as core/render.mjs
export const CHROME = process.env.CHROME_PATH || [
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser",
].find((p) => existsSync(p));

// Width and height from a PNG's IHDR chunk
export function pngSize(file) {
  const b = readFileSync(file);
  return { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
}

// Files npm would publish, from `npm pack --dry-run --json`
export function packFiles() {
  const r = run("npm", ["pack", "--dry-run", "--json", "--ignore-scripts"]);
  if (r.code !== 0) throw new Error(r.out);
  return JSON.parse(r.out.slice(r.out.indexOf("["))) [0].files.map((f) => f.path).sort();
}
