#!/usr/bin/env node
/* Reel Studio desk: a local review app for productions.
 *
 *   node desk/server.mjs [--port 4100]      then open http://127.0.0.1:4100
 *
 * Serves the repo root (so compositions load exactly as the renderer loads them) plus a small JSON API:
 * productions, frame notes, approvals, renders (still / preview video / QA) and "Send to Claude", which runs the
 * local Claude Code CLI headlessly (`claude -p`) with your existing login. No API key: ANTHROPIC_API_KEY is removed
 * from Claude's environment so a key in your shell is never billed by accident.
 * Listens on 127.0.0.1 only. Zero dependencies.
 */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import * as desk from "./lib.mjs";

const { ROOT } = desk;
const HERE = path.dirname(fileURLToPath(import.meta.url));
const argv = process.argv.slice(2);
const PORT = +(argv.includes("--port") ? argv[argv.indexOf("--port") + 1] : process.env.PORT ?? 4100);
const CLAUDE = process.env.CLAUDE_BIN || "claude";
// What a desk-started Claude may do: read and edit the project, render, run QA, use the desk tools. Nothing else.
const ALLOWED = ["Read", "Edit", "Write", "Glob", "Grep", "Bash(node core/render.mjs *)", "Bash(scripts/qa-video.sh *)",
  "Bash(scripts/extract-frames.sh *)", "mcp__reel-desk"];
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".md": "text/markdown; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png",
  ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ttf": "font/ttf", ".otf": "font/otf",
  ".woff2": "font/woff2", ".mp4": "video/mp4", ".webm": "video/webm", ".mov": "video/quicktime", ".mp3": "audio/mpeg",
  ".wav": "audio/wav", ".txt": "text/plain; charset=utf-8", ".csv": "text/plain; charset=utf-8",
};

// ---- jobs: renders and Claude runs, streamed to the page over server-sent events ----
const jobs = new Map();
let nextJob = 1;
function newJob(kind, production) {
  const job = { id: nextJob++, kind, production, lines: [], done: false, code: null, file: null, proc: null, subs: new Set() };
  jobs.set(job.id, job);
  return job;
}
function emit(job, event) {
  if (event.line !== undefined) job.lines.push(event.line);
  for (const res of job.subs) res.write(`data: ${JSON.stringify(event)}\n\n`);
}
function finish(job, code) {
  job.done = true; job.code = code; job.proc = null;
  emit(job, { done: true, code, file: job.file });
  for (const res of job.subs) res.end();
  job.subs.clear();
}
const publicJob = (j) => ({ id: j.id, kind: j.kind, production: j.production, done: j.done, code: j.code, file: j.file });

function startRender(production, kind, t, safe) {
  const { cmd, args, file } = desk.renderArgs(production, kind, t, safe);
  const job = newJob(kind, production);
  job.file = "/" + file;
  emit(job, { line: `$ ${path.basename(cmd)} ${args.join(" ")}` });
  const { proc, done } = desk.runLines(cmd, args, (line) => emit(job, { line }));
  job.proc = proc;
  done.then((code) => finish(job, code));
  return job;
}

/** One line per stream-json event, enough to follow the run. */
function describe(ev) {
  if (ev.type === "system" && ev.subtype === "init") return `session ${ev.session_id} · ${ev.model || ""}`;
  if (ev.type === "assistant") {
    return (ev.message?.content || []).map((b) => {
      if (b.type === "text") return b.text.trim();
      if (b.type === "tool_use") {
        const i = b.input || {};
        const arg = i.command || i.file_path || i.pattern || (i.t !== undefined ? `t=${i.t}` : "") || i.id || "";
        return `→ ${b.name.replace(/^mcp__reel-desk__/, "desk.")} ${String(arg).slice(0, 160)}`;
      }
      return "";
    }).filter(Boolean).join("\n");
  }
  if (ev.type === "result") return `${ev.is_error ? "✗" : "✓"} done in ${((ev.duration_ms || 0) / 1000).toFixed(0)} s, ${ev.num_turns ?? "?"} turns`;
  return "";
}

function startClaude(production, noteIds, extra) {
  const review = desk.readReview(production);
  const notes = review.notes.filter((n) => (noteIds?.length ? noteIds.includes(n.id) : n.status === "open"));
  if (!notes.length && !extra?.trim()) throw new Error("nothing to send: no open notes and no request");
  const prompt = desk.claudePrompt(production, notes, extra);
  const mcp = JSON.stringify({ mcpServers: { "reel-desk": { command: process.execPath, args: [path.join(HERE, "mcp.mjs")],
    env: { REEL_STUDIO_ROOT: ROOT } } } });
  const args = ["-p", prompt, "--output-format", "stream-json", "--verbose", "--mcp-config", mcp,
    "--allowedTools", ALLOWED.join(","), "--permission-mode", "acceptEdits"];
  if (review.claude.session) args.push("--resume", review.claude.session);
  const job = newJob("claude", production);
  emit(job, { line: `Sending ${notes.length} note(s)${extra?.trim() ? " and a request" : ""} to Claude Code${review.claude.session ? " (same session as last time)" : ""}…` });
  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY; // use the Claude Code login, never a stray key
  const proc = spawn(CLAUDE, args, { cwd: ROOT, env, stdio: ["ignore", "pipe", "pipe"] });
  job.proc = proc;
  let buf = "", session = null;
  proc.stdout.on("data", (d) => {
    buf += d;
    const parts = buf.split("\n");
    buf = parts.pop();
    for (const l of parts) {
      if (!l.trim()) continue;
      let ev;
      try { ev = JSON.parse(l); } catch { emit(job, { line: l }); continue; }
      if (ev.session_id) session = ev.session_id;
      const text = describe(ev);
      if (text) emit(job, { line: text });
    }
  });
  proc.stderr.on("data", (d) => String(d).split("\n").filter((l) => l.trim()).forEach((line) => emit(job, { line })));
  proc.on("error", (e) => emit(job, { line: e.code === "ENOENT" ? `Claude Code CLI not found (${CLAUDE}). Install it and sign in once with \`claude\`.` : String(e) }));
  proc.on("close", (code) => {
    if (session) {
      const r = desk.readReview(production); // re-read: Claude resolved notes while it ran
      r.claude = { ...r.claude, session };
      desk.writeReview(production, r);
    }
    finish(job, code ?? 1);
  });
  return job;
}

// ---- HTTP ----
const json = (res, code, body) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
const body = (req) => new Promise((resolve, reject) => {
  let s = "";
  req.on("data", (d) => (s += d)).on("end", () => { try { resolve(s ? JSON.parse(s) : {}); } catch (e) { reject(e); } });
});

async function api(req, res, url) {
  const q = url.searchParams;
  const parts = url.pathname.split("/").filter(Boolean).slice(1); // after "api"
  const m = req.method;
  if (parts[0] === "productions" && m === "GET") return json(res, 200, desk.listProductions());
  if (parts[0] === "review" && m === "GET") return json(res, 200, desk.readReview(q.get("p")));
  if (parts[0] === "readme" && m === "GET") {
    res.writeHead(200, { "content-type": "text/markdown; charset=utf-8" });
    return res.end(await readFile(path.join(desk.prodDir(q.get("p")), "README.md")));
  }
  if (parts[0] === "notes") {
    const p = q.get("p");
    if (m === "POST") return json(res, 200, desk.addNote(p, await body(req)));
    if (m === "PATCH") return json(res, 200, desk.updateNote(p, parts[1], await body(req)));
    if (m === "DELETE") { desk.deleteNote(p, parts[1]); return json(res, 200, { ok: true }); }
  }
  if (parts[0] === "approve" && m === "POST") {
    const b = await body(req);
    return json(res, 200, desk.approve(q.get("p"), b.stage, b.by));
  }
  if (parts[0] === "state" && m === "POST") { desk.writeState(await body(req)); return json(res, 200, { ok: true }); }
  if (parts[0] === "render" && m === "POST") {
    const b = await body(req);
    return json(res, 200, publicJob(startRender(q.get("p"), b.kind, b.t, b.safe)));
  }
  if (parts[0] === "claude" && m === "POST") {
    const b = await body(req);
    return json(res, 200, publicJob(startClaude(q.get("p"), b.notes, b.request)));
  }
  if (parts[0] === "jobs") {
    const job = jobs.get(+parts[1]);
    if (!parts[1]) return json(res, 200, [...jobs.values()].map(publicJob).reverse());
    if (!job) return json(res, 404, { error: "no such job" });
    if (parts[2] === "stop" && m === "POST") { job.proc?.kill("SIGTERM"); return json(res, 200, { ok: true }); }
    if (parts[2] === "events") {
      res.writeHead(200, { "content-type": "text/event-stream", "cache-control": "no-cache", connection: "keep-alive" });
      for (const line of job.lines) res.write(`data: ${JSON.stringify({ line })}\n\n`);
      if (job.done) { res.write(`data: ${JSON.stringify({ done: true, code: job.code, file: job.file })}\n\n`); return res.end(); }
      job.subs.add(res);
      req.on("close", () => job.subs.delete(res));
      return;
    }
    return json(res, 200, publicJob(job));
  }
  json(res, 404, { error: "unknown endpoint" });
}

async function files(req, res, url) {
  let rel = decodeURIComponent(url.pathname);
  if (rel === "/") rel = "/desk/index.html";
  // The desk's own page comes from this folder; everything else from the project root
  const [base, sub] = rel.startsWith("/desk/") ? [HERE, rel.slice(5)] : [ROOT, rel];
  const file = path.join(base, sub);
  if (!file.startsWith(base + path.sep) || /\/\.(git|env)/.test(rel)) throw Object.assign(new Error("forbidden"), { code: 403 });
  const s = await stat(file);
  const data = await readFile(s.isDirectory() ? path.join(file, "index.html") : file);
  const type = TYPES[path.extname(s.isDirectory() ? "x.html" : file).toLowerCase()] || "application/octet-stream";
  // Range requests: Chrome needs them to seek inside <video> plates (same as core/render.mjs)
  const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || "");
  if (range) {
    const start = range[1] ? +range[1] : data.length - +range[2];
    const end = range[1] && range[2] ? Math.min(+range[2], data.length - 1) : data.length - 1;
    res.writeHead(206, { "content-type": type, "accept-ranges": "bytes", "content-range": `bytes ${start}-${end}/${data.length}`, "content-length": end - start + 1 });
    return res.end(data.subarray(start, end + 1));
  }
  res.writeHead(200, { "content-type": type, "accept-ranges": "bytes", "cache-control": "no-store" });
  res.end(data);
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  try {
    if (url.pathname.startsWith("/api/")) {
      // Only the desk page itself may call the API (blocks other sites in your browser from driving it)
      const origin = req.headers.origin;
      if (origin && origin !== `http://${req.headers.host}`) return json(res, 403, { error: "cross-origin" });
      return await api(req, res, url);
    }
    await files(req, res, url);
  } catch (e) {
    if (url.pathname.startsWith("/api/")) return json(res, e.code === 403 ? 403 : 400, { error: e.message });
    res.writeHead(e.code === 403 ? 403 : 404); res.end(e.code === 403 ? "forbidden" : "not found");
  }
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Reel Studio desk: http://127.0.0.1:${server.address().port}  (serving ${ROOT})`);
});
