#!/usr/bin/env node
/* reel-desk: an optional MCP server (stdio, zero dependencies) that lets Claude Code see the desk.
 * Not registered by default. To add it to a project:
 *   claude mcp add reel-desk --scope project -- node desk/mcp.mjs
 * (The desk's own "Send to Claude" passes it with --mcp-config, so that works without registering.)
 *
 * Tools: desk_state (what the person has open), list_productions, list_notes, add_note (Claude's own QA findings),
 * resolve_note (mark a note fixed with a reply; the person closes it after checking), render_frame (a still, returned
 * as an image). There is deliberately no approval tool: approvals are made by people in the desk.
 * Talks to no network service; renders run core/render.mjs locally.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import * as desk from "./lib.mjs";

let VERSION = "0";
try { VERSION = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf8")).version || VERSION; } catch {}
const prod = { type: "string", description: "Production id, brand/ID-slug, e.g. bike-logger/REEL-002-engines" };

const tools = {
  desk_state: {
    description: "What the person has open in the Reel Studio desk right now: production and time (s). Use it to resolve 'this frame' or 'here'.",
    inputSchema: { type: "object", properties: {} },
    run: () => {
      const s = desk.readState();
      return s.production ? s : { note: "The desk has not been opened yet (node desk/server.mjs)." };
    },
  },
  list_productions: {
    description: "Every production with its status, composition, exports, open note count and approvals.",
    inputSchema: { type: "object", properties: {} },
    run: () => desk.listProductions(),
  },
  list_notes: {
    description: "Review notes pinned to frames of a production. Each has id, t (seconds), text, by, status (open|fixed|closed) and reply.",
    inputSchema: { type: "object", properties: { production: prod, status: { type: "string", enum: ["open", "fixed", "closed", "all"] } }, required: ["production"] },
    run: ({ production, status = "open" }) => desk.readReview(production).notes.filter((n) => status === "all" || n.status === status),
  },
  add_note: {
    description: "Pin your own finding (e.g. from frame-by-frame QA) to a time so the person sees it on the desk timeline.",
    inputSchema: { type: "object", properties: { production: prod, t: { type: "number" }, text: { type: "string" } }, required: ["production", "t", "text"] },
    run: ({ production, t, text }) => desk.addNote(production, { t, text, by: "claude" }),
  },
  resolve_note: {
    description: "After changing the composition for a note, mark it fixed with a one-line reply. To ask a question instead, keep status open and put the question in reply. Only the person closes notes.",
    inputSchema: { type: "object", properties: { production: prod, id: { type: "number" }, reply: { type: "string" },
      status: { type: "string", enum: ["fixed", "open"], default: "fixed" } }, required: ["production", "id", "reply"] },
    run: ({ production, id, reply, status = "fixed" }) => desk.updateNote(production, id, { status, reply }),
  },
  render_frame: {
    description: "Render one frame of a production's composition with the real renderer and return it as an image. Saved in qa/desk/.",
    inputSchema: { type: "object", properties: { production: prod, t: { type: "number" }, safe: { type: "boolean", description: "Draw the safe zones" } }, required: ["production", "t"] },
    run: async ({ production, t, safe = false }) => {
      const { cmd, args, file } = desk.renderArgs(production, "still", t, safe);
      const out = [];
      const code = await desk.runLines(cmd, args, (l) => out.push(l)).done;
      if (code !== 0) throw new Error(`render failed (exit ${code}):\n${out.join("\n")}`);
      return { content: [
        { type: "text", text: `${file} (t=${t}s)${out.length > 1 ? "\n" + out.slice(1).join("\n") : ""}` },
        { type: "image", mimeType: "image/png", data: readFileSync(path.join(desk.ROOT, file)).toString("base64") },
      ] };
    },
  },
};

const send = (msg) => process.stdout.write(JSON.stringify({ jsonrpc: "2.0", ...msg }) + "\n");

async function handle(msg) {
  const { id, method, params = {} } = msg;
  if (id === undefined) return; // notifications (initialized, cancelled)
  if (method === "initialize") {
    return send({ id, result: { protocolVersion: params.protocolVersion || "2025-06-18", capabilities: { tools: {} },
      serverInfo: { name: "reel-desk", version: VERSION },
      instructions: "Reel Studio desk: review notes pinned to frames, and frame renders. Never approve on the person's behalf." } });
  }
  if (method === "ping") return send({ id, result: {} });
  if (method === "tools/list") {
    return send({ id, result: { tools: Object.entries(tools).map(([name, t]) => ({ name, description: t.description, inputSchema: t.inputSchema })) } });
  }
  if (method === "tools/call") {
    const tool = tools[params.name];
    if (!tool) return send({ id, error: { code: -32602, message: `unknown tool ${params.name}` } });
    try {
      const r = await tool.run(params.arguments || {});
      return send({ id, result: r?.content ? r : { content: [{ type: "text", text: JSON.stringify(r, null, 2) }] } });
    } catch (e) {
      return send({ id, result: { isError: true, content: [{ type: "text", text: e.message }] } });
    }
  }
  send({ id, error: { code: -32601, message: `method not found: ${method}` } });
}

createInterface({ input: process.stdin }).on("line", (line) => {
  if (!line.trim()) return;
  let msg;
  try { msg = JSON.parse(line); } catch { return send({ id: null, error: { code: -32700, message: "parse error" } }); }
  handle(msg);
});
