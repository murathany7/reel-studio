/* Capture backend for core/render.mjs --capture beginframe (Linux).
 *
 * chrome-headless-shell with begin-frame control draws nothing until it is told to: each capture is one
 * HeadlessExperimental.beginFrame that runs every compositor stage and returns that frame's pixels, so no screenshot
 * can race the renderer. Chrome's own (new) headless mode doesn't support it, and macOS/Windows builds of the shell
 * are not reliable with these flags (HyperFrames reports the same), so this is for Linux: CI and the Docker image.
 * Speaks the DevTools protocol over the WebSocket built into Node 22+ (no Puppeteer).
 *
 * Shell: $HEADLESS_SHELL_PATH, else Debian/Ubuntu's chromium-headless-shell, else Playwright's download.
 */
import { spawn } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import os from "node:os";
import path from "node:path";

const FLAGS = ["--deterministic-mode", "--enable-begin-frame-control", "--run-all-compositor-stages-before-draw",
  "--disable-new-content-rendering-timeout", "--disable-threaded-animation", "--disable-threaded-scrolling",
  "--disable-checker-imaging", "--disable-image-animation-resync", "--no-first-run", "--no-default-browser-check",
  "--no-sandbox", "--disable-dev-shm-usage"];

function findShell() {
  const pw = path.join(os.homedir(), ".cache/ms-playwright");
  const fromPlaywright = existsSync(pw)
    ? readdirSync(pw).filter((d) => d.startsWith("chromium_headless_shell")).sort().reverse()
      .map((d) => path.join(pw, d, "chrome-linux/headless_shell")) : [];
  const shell = [process.env.HEADLESS_SHELL_PATH, "/usr/lib/chromium/chromium-headless-shell",
    "/usr/lib/chromium/headless_shell", "/usr/bin/chromium-headless-shell", ...fromPlaywright].find((p) => p && existsSync(p));
  if (!shell) throw new Error("--capture beginframe needs chrome-headless-shell: set HEADLESS_SHELL_PATH (Debian: apt install chromium-headless-shell)");
  return shell;
}

// One shell process per page: several begin-frame-controlled targets in one process crashed the shell (Debian
// chromium-headless-shell 156, 2026-11-03).
async function connect(extraArgs) {
  const proc = spawn(findShell(), [...FLAGS, ...extraArgs, "--remote-debugging-port=0", "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  let err = "";
  const wsUrl = await new Promise((resolve, reject) => {
    proc.stderr.on("data", (d) => {
      err += d;
      const m = /DevTools listening on (ws:\/\/\S+)/.exec(err);
      if (m) resolve(m[1]);
    });
    proc.on("exit", (c) => reject(new Error(`chrome-headless-shell exited ${c}: ${err.trim().slice(-500)}`)));
  });
  const ws = new WebSocket(wsUrl);
  await new Promise((r, j) => { ws.onopen = r; ws.onerror = () => j(new Error("Could not connect to chrome-headless-shell")); });
  let id = 0, dead = null;
  const calls = new Map(), listeners = new Map();
  // If the shell dies, fail every call in flight instead of waiting forever
  const fail = (why) => {
    dead ??= new Error(`chrome-headless-shell stopped (${why}): ${err.trim().slice(-500)}`);
    for (const c of calls.values()) c.reject(dead);
    calls.clear();
  };
  proc.on("exit", (c, sig) => fail(`exit ${c ?? sig}`));
  ws.onclose = () => fail("connection closed");
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id !== undefined) {
      const c = calls.get(m.id);
      calls.delete(m.id);
      if (!c) return;
      if (m.error) c.reject(new Error(`${c.method}: ${m.error.message}`)); else c.resolve(m.result);
    } else listeners.get(m.sessionId)?.(m.method, m.params);
  };
  const send = (method, params = {}, sessionId) => new Promise((resolve, reject) => {
    if (dead) return reject(dead);
    calls.set(++id, { resolve, reject, method });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId && { sessionId }) }));
  });
  const kill = () => { ws.onclose = null; proc.removeAllListeners("exit"); ws.close(); proc.kill(); };
  return { send, listeners, kill };
}

export async function launchShell(extraArgs = []) {
  if (typeof WebSocket === "undefined") throw new Error("--capture beginframe needs Node 22 or newer (built-in WebSocket)");
  if (process.platform !== "linux") console.warn("warning: --capture beginframe is only reliable on Linux");
  findShell();
  const conns = new Set();
  return {
    async newPage(url) {
      const conn = await connect(extraArgs);
      conns.add(conn);
      const { send, listeners } = conn;
      const { browserContextId } = await send("Target.createBrowserContext");
      const { targetId } = await send("Target.createTarget", { url: "about:blank", browserContextId, enableBeginFrameControl: true, width: 1080, height: 1920 });
      const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
      const s = (method, params) => send(method, params, sessionId);
      const errors = [];
      let loaded;
      const onLoad = new Promise((r) => (loaded = r));
      listeners.set(sessionId, (method, p) => {
        if (method === "Page.loadEventFired") loaded();
        else if (method === "Runtime.exceptionThrown") errors.push(p.exceptionDetails.exception?.description || p.exceptionDetails.text);
        else if (method === "Runtime.consoleAPICalled" && p.type === "error") errors.push(p.args.map((a) => a.value ?? a.description).join(" "));
        else if (method === "Network.responseReceived" && p.response.status >= 400 && !p.response.url.endsWith("/favicon.ico")) errors.push(`${p.response.status} ${p.response.url}`);
      });
      await Promise.all([s("Page.enable"), s("Runtime.enable"), s("Network.enable")]);
      await s("Emulation.setDeviceMetricsOverride", { width: 1080, height: 1920, deviceScaleFactor: 1, mobile: false });
      // Nothing is drawn (and some work waits for a frame) until a frame is begun: pump frames while the page works.
      // Every frame keeps its image: a capture with no damage since then returns none, and the last drawn one is
      // then the current picture.
      let last = null;
      const frame = async () => {
        const r = await s("HeadlessExperimental.beginFrame", { screenshot: { format: "png" } });
        if (r.screenshotData) last = Buffer.from(r.screenshotData, "base64");
      };
      const pump = async (work) => {
        let busy = true;
        const loop = (async () => {
          while (busy) {
            await frame().catch(() => {});
            await new Promise((r) => setTimeout(r, 16));
          }
        })();
        try { return await work; } finally { busy = false; await loop; }
      };
      await pump((async () => { await s("Page.navigate", { url }); await onLoad; })());
      const evaluate = async (expression) => {
        const r = await pump(s("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }));
        if (r.exceptionDetails) throw new Error(r.exceptionDetails.exception?.description || r.exceptionDetails.text);
        return r.result.value;
      };
      return {
        errors,
        evaluate,
        async setViewport(width, height) {
          await s("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile: false });
          await pump(new Promise((r) => setTimeout(r, 50)));
        },
        async screenshot() {
          await frame();
          if (!last) throw new Error("beginFrame returned no image for the first frame");
          return last;
        },
        close: async () => { conn.kill(); conns.delete(conn); },
      };
    },
    async close() { for (const c of conns) c.kill(); conns.clear(); },
  };
}
