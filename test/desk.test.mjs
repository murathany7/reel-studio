// The desk: its API and its MCP server, against a throwaway project (REEL_STUDIO_ROOT).
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { after, before, test } from "node:test";
import { ROOT, tmp } from "./helpers.mjs";

const proj = tmp("rs-desk-");
const P = "acme/REEL-001-test";
const dir = path.join(proj, "productions", P);
mkdirSync(path.join(dir, "composition"), { recursive: true });
mkdirSync(path.join(proj, "desk"), { recursive: true });
copyFileSync(path.join(ROOT, "productions/_TEMPLATE/README.md"), path.join(dir, "README.md"));
writeFileSync(path.join(dir, "composition/index.html"), "<!doctype html><div id=stage></div>");
const env = { ...process.env, REEL_STUDIO_ROOT: proj };

let server, base;
before(async () => {
  server = spawn(process.execPath, [path.join(ROOT, "desk/server.mjs"), "--port", "0"], { env });
  base = await new Promise((resolve, reject) => {
    server.stdout.on("data", (d) => { const m = /http:\/\/127\.0\.0\.1:\d+/.exec(String(d)); if (m) resolve(m[0]); });
    server.on("exit", (c) => reject(new Error("desk exited " + c)));
  });
});
after(() => server.kill());

const call = async (url, opts = {}) => {
  const r = await fetch(base + url, { ...opts, headers: { "content-type": "application/json", ...opts.headers },
    body: opts.body && JSON.stringify(opts.body) });
  return { status: r.status, body: await r.json().catch(() => null) };
};

test("lists productions and serves the page", async () => {
  const { body } = await call("/api/productions");
  assert.equal(body.length, 1);
  assert.equal(body[0].id, P);
  assert.equal(body[0].composition, `/productions/${P}/composition/index.html`);
  const page = await fetch(base + "/");
  assert.equal(page.status, 200);
});

test("notes: pin, fix, close, delete", async () => {
  const n = (await call(`/api/notes?p=${P}`, { method: "POST", body: { t: 2.5, text: "logo too small" } })).body;
  assert.deepEqual([n.id, n.t, n.status, n.by], [1, 2.5, "open", "human"]);
  assert.equal((await call(`/api/notes/1?p=${P}`, { method: "PATCH", body: { status: "fixed", reply: "bigger" } })).body.status, "fixed");
  assert.equal((await call(`/api/notes/1?p=${P}`, { method: "PATCH", body: { status: "nope" } })).status, 400);
  await call(`/api/notes/1?p=${P}`, { method: "DELETE" });
  assert.deepEqual((await call(`/api/review?p=${P}`)).body.notes, []);
});

test("approving the storyboard ticks the README box", async () => {
  const r = await call(`/api/approve?p=${P}`, { method: "POST", body: { stage: "storyboard", by: "Sam" } });
  assert.equal(r.status, 200);
  const readme = readFileSync(path.join(dir, "README.md"), "utf8");
  assert.match(readme, /^- \[x\] Storyboard approved \(\d{4}-\d\d-\d\d, Sam, in the desk\)\./m);
  assert.match(readme, /^\| Approved by \/ date \| Sam, /m);
  assert.equal((await call(`/api/approve?p=${P}`, { method: "POST", body: { stage: "storyboard" } })).status, 400);
});

test("refuses other origins, bad ids and paths outside the project", async () => {
  assert.equal((await call("/api/productions", { headers: { origin: "https://evil.example" } })).status, 403);
  assert.equal((await call("/api/review?p=../../etc")).status, 400);
  assert.notEqual((await fetch(base + "/.git/config")).status, 200);
  assert.notEqual((await fetch(base + "/%2e%2e/%2e%2e/etc/passwd")).status, 200);
});

function mcp(messages) {
  return new Promise((resolve) => {
    const p = spawn(process.execPath, [path.join(ROOT, "desk/mcp.mjs")], { env });
    let out = "";
    p.stdout.on("data", (d) => {
      out += d;
      const lines = out.split("\n").filter(Boolean);
      if (lines.length >= messages.filter((m) => m.id !== undefined).length) { p.kill(); resolve(lines.map((l) => JSON.parse(l))); }
    });
    for (const m of messages) p.stdin.write(JSON.stringify({ jsonrpc: "2.0", ...m }) + "\n");
  });
}

test("MCP server: tools, notes, no approval tool", async () => {
  const [init, list, add, res, notes] = await mcp([
    { id: 1, method: "initialize", params: { protocolVersion: "2025-06-18" } },
    { method: "notifications/initialized" },
    { id: 2, method: "tools/list" },
    { id: 3, method: "tools/call", params: { name: "add_note", arguments: { production: P, t: 1, text: "text clipped" } } },
    { id: 4, method: "tools/call", params: { name: "resolve_note", arguments: { production: P, id: 1, reply: "moved up 40 px" } } },
    { id: 5, method: "tools/call", params: { name: "list_notes", arguments: { production: P, status: "all" } } },
  ]);
  assert.equal(init.result.serverInfo.name, "reel-desk");
  const names = list.result.tools.map((t) => t.name);
  assert.ok(names.includes("render_frame") && names.includes("resolve_note"));
  assert.ok(!names.some((n) => /approv/.test(n)), "no approval tool");
  assert.equal(JSON.parse(add.result.content[0].text).by, "claude");
  assert.equal(JSON.parse(res.result.content[0].text).status, "fixed");
  assert.equal(JSON.parse(notes.result.content[0].text)[0].reply, "moved up 40 px");
});

test("Send to agent with REEL_AGENT=codex: sandboxed codex exec, key removed, session resumed", async () => {
  // A stand-in codex that records how it was called and prints a few `codex exec --json` events
  const bin = path.join(proj, "fake-codex.mjs"), log = path.join(proj, "codex-calls.jsonl");
  writeFileSync(bin, `#!${process.execPath}
import { appendFileSync } from "node:fs";
appendFileSync(${JSON.stringify(log)}, JSON.stringify({ argv: process.argv.slice(2), key: process.env.OPENAI_API_KEY ?? null }) + "\\n");
for (const ev of [{ type: "thread.started", thread_id: "thread-1" }, { type: "item.completed", item: { type: "agent_message", text: "done" } },
  { type: "turn.completed" }]) console.log(JSON.stringify(ev));
`, { mode: 0o755 });
  const cx = spawn(process.execPath, [path.join(ROOT, "desk/server.mjs"), "--port", "0"],
    { env: { ...env, REEL_AGENT: "codex", CODEX_BIN: bin, OPENAI_API_KEY: "sk-stray" } });
  try {
    const url = await new Promise((resolve) => cx.stdout.on("data", (d) => {
      const m = /http:\/\/127\.0\.0\.1:\d+/.exec(String(d)); if (m) resolve(m[0]);
    }));
    assert.deepEqual(await (await fetch(url + "/api/agent")).json(), { agent: "codex", label: "Codex" });
    const send = async () => {
      const job = await (await fetch(`${url}/api/agent?p=${P}`, { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ notes: [-1], request: "hold the end card longer" }) })).json();
      const events = await (await fetch(`${url}/api/jobs/${job.id}/events`)).text(); // ends when the job is done
      assert.match(events, /"done":true,"code":0/);
      assert.match(events, /session thread-1/);
    };
    await send();
    await send();
    const calls = readFileSync(log, "utf8").trim().split("\n").map((l) => JSON.parse(l));
    assert.deepEqual(calls[0].argv.slice(0, 2), ["exec", "--json"]);
    assert.ok(calls[0].argv.includes('sandbox_mode="workspace-write"'));
    assert.ok(calls[0].argv.some((a) => a.startsWith("mcp_servers.reel-desk.command=")));
    assert.match(calls[0].argv.at(-1), /AGENTS\.md[\s\S]*hold the end card longer/);
    assert.deepEqual(calls[1].argv.slice(0, 3), ["exec", "resume", "--json"]);
    assert.equal(calls[1].argv.at(-2), "thread-1");
    assert.deepEqual(calls.map((c) => c.key), [null, null], "OPENAI_API_KEY must not reach Codex");
    assert.equal(JSON.parse(readFileSync(path.join(dir, "review.json"), "utf8")).codex.session, "thread-1");
  } finally { cx.kill(); }
});
