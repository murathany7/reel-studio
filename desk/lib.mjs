// Shared by the desk server and the desk MCP server: productions, review notes, approvals, renders.
// A production's review lives in productions/<brand>/<ID>/review.json:
//   { "notes": [{ id, t, text, by: "human"|"claude", status: "open"|"fixed"|"closed", reply, at }],
//     "approvals": [{ stage: "storyboard"|"final", by, at }],
//     "claude": { "session": "<id of the last headless Claude run>" } }
// Approvals are written by people only (the desk's buttons), never by Claude or the MCP server.
import { existsSync, readdirSync, readFileSync, writeFileSync, mkdirSync, statSync } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = process.env.REEL_STUDIO_ROOT
  ? path.resolve(process.env.REEL_STUDIO_ROOT)
  : path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
export const STATE = path.join(ROOT, "desk", ".state.json");

const today = () => new Date().toISOString().slice(0, 10);

/** `brand/ID-slug` → absolute folder, refusing anything outside productions/. */
export function prodDir(id) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(id || "") || id.startsWith("_")) throw new Error(`bad production id: ${id}`);
  const dir = path.join(ROOT, "productions", id);
  if (!existsSync(path.join(dir, "README.md"))) throw new Error(`no production ${id}`);
  return dir;
}

function field(readme, name) {
  const m = new RegExp(`^\\|\\s*${name}\\s*\\|\\s*(.*?)\\s*\\|\\s*$`, "mi").exec(readme);
  return m ? m[1].replace(/`/g, "") : "";
}

export function listProductions() {
  const base = path.join(ROOT, "productions");
  const out = [];
  for (const brand of existsSync(base) ? readdirSync(base).sort() : []) {
    if (brand.startsWith("_") || brand.startsWith(".") || !statSync(path.join(base, brand)).isDirectory()) continue;
    for (const name of readdirSync(path.join(base, brand)).sort()) {
      const dir = path.join(base, brand, name);
      if (!existsSync(path.join(dir, "README.md"))) continue;
      const readme = readFileSync(path.join(dir, "README.md"), "utf8");
      const comp = path.join(dir, "composition", "index.html");
      const exportDir = path.join(dir, "export");
      const review = readReview(`${brand}/${name}`);
      out.push({
        id: `${brand}/${name}`, brand,
        title: (/^#\s+(.+)$/m.exec(readme)?.[1] || name).trim(),
        status: field(readme, "Status"),
        composition: existsSync(comp) ? `/productions/${brand}/${name}/composition/index.html` : null,
        exports: existsSync(exportDir) ? readdirSync(exportDir).filter((f) => /\.(mp4|png|jpg)$/i.test(f))
          .map((f) => `/productions/${brand}/${name}/export/${f}`) : [],
        openNotes: review.notes.filter((n) => n.status === "open").length,
        approvals: review.approvals,
      });
    }
  }
  return out;
}

export function readReview(id) {
  const file = path.join(prodDir(id), "review.json");
  const r = existsSync(file) ? JSON.parse(readFileSync(file, "utf8")) : {};
  return { notes: r.notes || [], approvals: r.approvals || [], claude: r.claude || {} };
}

export function writeReview(id, review) {
  writeFileSync(path.join(prodDir(id), "review.json"), JSON.stringify(review, null, 2) + "\n");
  return review;
}

export function addNote(id, { t, text, by = "human" }) {
  if (!text?.trim()) throw new Error("note needs text");
  const r = readReview(id);
  const note = { id: Math.max(0, ...r.notes.map((n) => n.id)) + 1, t: +(+t || 0).toFixed(3), text: text.trim(), by,
    status: "open", reply: "", at: new Date().toISOString() };
  r.notes.push(note);
  writeReview(id, r);
  return note;
}

export function updateNote(id, noteId, patch) {
  const r = readReview(id);
  const note = r.notes.find((n) => n.id === +noteId);
  if (!note) throw new Error(`no note ${noteId}`);
  for (const k of ["status", "reply", "text"]) if (patch[k] !== undefined) note[k] = patch[k];
  if (!["open", "fixed", "closed"].includes(note.status)) throw new Error(`bad status ${note.status}`);
  writeReview(id, r);
  return note;
}

export function deleteNote(id, noteId) {
  const r = readReview(id);
  r.notes = r.notes.filter((n) => n.id !== +noteId);
  writeReview(id, r);
}

/** A person approves the storyboard (ticks the README box) or the final cut. */
export function approve(id, stage, by) {
  if (!["storyboard", "final"].includes(stage)) throw new Error(`bad stage ${stage}`);
  if (!by?.trim()) throw new Error("approval needs a name");
  const dir = prodDir(id);
  const file = path.join(dir, "README.md");
  let readme = readFileSync(file, "utf8");
  const stamp = `${today()}, ${by.trim()}, in the desk`;
  if (stage === "storyboard") {
    readme = readme.replace(/^- \[ \] Storyboard approved\./m, `- [x] Storyboard approved (${stamp}).`);
    readme = readme.replace(/^(\|\s*Approved by \/ date\s*\|)\s*\|\s*$/m, `$1 ${by.trim()}, ${today()} |`);
  } else {
    const line = `- [x] Final cut approved for delivery (${stamp}).`;
    readme = /^- \[x\] Storyboard approved.*$/m.test(readme)
      ? readme.replace(/^- \[x\] Storyboard approved.*$/m, (m) => `${m}\n${line}`)
      : readme.trimEnd() + `\n\n${line}\n`;
  }
  writeFileSync(file, readme);
  const r = readReview(id);
  r.approvals.push({ stage, by: by.trim(), at: new Date().toISOString() });
  writeReview(id, r);
  return r.approvals;
}

/** What the person has open in the desk, for Claude (desk_state). */
export function readState() {
  return existsSync(STATE) ? JSON.parse(readFileSync(STATE, "utf8")) : {};
}
export function writeState(s) {
  writeFileSync(STATE, JSON.stringify({ ...s, at: new Date().toISOString() }, null, 2) + "\n");
}

/** Render outputs from the desk go to qa/desk/ so a delivered export is never overwritten. */
export function renderArgs(id, kind, t = 0, safe = false) {
  const dir = prodDir(id);
  const comp = path.join(dir, "composition", "index.html");
  if (!existsSync(comp)) throw new Error(`${id} has no composition yet`);
  const out = path.join(dir, "qa", "desk");
  mkdirSync(out, { recursive: true });
  const rel = (p) => path.relative(ROOT, p);
  const sf = safe ? ["--safe"] : [];
  if (kind === "still") {
    const file = path.join(out, `still_t${(+t).toFixed(2)}${safe ? "_safe" : ""}.png`);
    return { cmd: process.execPath, args: ["core/render.mjs", "still", rel(comp), rel(file), "--t", String(+t), ...sf], file: rel(file) };
  }
  if (kind === "video") {
    const file = path.join(out, "preview.mp4");
    return { cmd: process.execPath, args: ["core/render.mjs", "video", rel(comp), rel(file), ...sf], file: rel(file) };
  }
  if (kind === "qa") {
    const video = path.join(out, "preview.mp4");
    if (!existsSync(video)) throw new Error("render a preview video first");
    return { cmd: "bash", args: ["scripts/qa-video.sh", rel(video), rel(path.join(out, "qa"))], file: rel(path.join(out, "qa", "report.md")) };
  }
  throw new Error(`bad render kind ${kind}`);
}

/** Run a command from the repo root; onLine gets each output line. `done` resolves to the exit code. */
export function runLines(cmd, args, onLine) {
  const p = spawn(cmd, args, { cwd: ROOT, env: process.env, stdio: ["ignore", "pipe", "pipe"] });
  const done = new Promise((resolve) => {
    let buf = "";
    const feed = (d) => {
      buf += d;
      const parts = buf.split(/\r?\n|\r/);
      buf = parts.pop();
      for (const l of parts) if (l.trim()) onLine(l);
    };
    p.stdout.on("data", feed);
    p.stderr.on("data", feed);
    p.on("error", (e) => { onLine(String(e)); resolve(127); });
    p.on("close", (code) => { if (buf.trim()) onLine(buf); resolve(code ?? 1); });
  });
  return { proc: p, done };
}

/** The prompt a headless Claude run gets from the desk's "Send to Claude". */
export function claudePrompt(id, notes, extra = "") {
  const lines = [
    `You are working on the Reel Studio production productions/${id}/ (follow CLAUDE.md, STATUS.md and the make-video skill).`,
    `The person reviewing it in the desk asked for this. Composition: productions/${id}/composition/index.html.`,
  ];
  if (notes.length) {
    lines.push("", "Review notes pinned to frames (from review.json):");
    for (const n of notes) lines.push(`- #${n.id} at ${n.t.toFixed(2)} s: ${n.text}`);
    lines.push("", "For each note: change the composition, render a still at that time to check it " +
      "(node core/render.mjs still ... --t <t>, or the reel-desk render_frame tool), then call the reel-desk tool " +
      "resolve_note with a one-line reply saying what you changed. If a note needs a decision or a fact you do not have, " +
      "leave it open and reply with the question.");
  }
  if (extra.trim()) lines.push("", "Request: " + extra.trim());
  lines.push("", "Rules: never record or tick an approval (only the person does that in the desk); never invent product facts; " +
    "do not render the final export, the person renders previews from the desk. End with a two-line summary.");
  return lines.join("\n");
}
