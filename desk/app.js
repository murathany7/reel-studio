// Reel Studio desk page. Drives a composition through the same functions the renderer uses
// (window.__ready, __meta, __seek): the desk never runs its own clock inside the composition.
const $ = (id) => document.getElementById(id);
const api = async (url, opts = {}) => {
  const r = await fetch(url, { headers: { "content-type": "application/json" }, ...opts,
    body: opts.body && JSON.stringify(opts.body) });
  const data = r.headers.get("content-type")?.includes("json") ? await r.json() : await r.text();
  if (!r.ok) throw new Error(data.error || r.statusText);
  return data;
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const store = { get: (k) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k, v) => { try { localStorage.setItem(k, v); } catch {} } };

const S = { list: [], prod: null, meta: null, win: null, t: 0, playing: false, busy: false, review: null, noteFilter: "open" };

// ---------- productions ----------
async function loadList() {
  S.list = await api("/api/productions");
  renderList();
}
function renderList() {
  const f = $("filter").value.toLowerCase();
  const items = S.list.filter((p) => !f || (p.id + p.title).toLowerCase().includes(f));
  let brand = "", html = "";
  for (const p of items) {
    if (p.brand !== brand) { brand = p.brand; html += `<li class="brandname">${esc(brand)}</li>`; }
    const ok = p.approvals.some((a) => a.stage === "final") ? `<span class="pill ok">✓ final</span>` : "";
    html += `<li><button data-id="${esc(p.id)}" class="${S.prod?.id === p.id ? "on" : ""}">
      <span class="t">${esc(p.title.replace(/^[A-Z]+-\d+\s+[—-]\s+/, ""))}</span>
      <span class="s">${esc(p.id.split("/")[1].split("-").slice(0, 2).join("-"))} · ${esc(p.status.split("(")[0].trim() || "—")}
        ${p.openNotes ? `<span class="pill notes">${p.openNotes}</span>` : ""} ${ok} ${p.composition ? "" : `<span class="pill">no comp</span>`}</span>
    </button></li>`;
  }
  $("productions").innerHTML = html || `<li class="muted small">No productions yet. Ask Claude: “make a reel for &lt;brand&gt;”.</li>`;
}
$("productions").onclick = (e) => {
  const b = e.target.closest("button[data-id]");
  if (b) open(b.dataset.id);
};
$("filter").oninput = renderList;

async function open(id, keepT = false) {
  const p = S.list.find((x) => x.id === id);
  if (!p) return;
  S.prod = p; store.set("desk.prod", id);
  history.replaceState(null, "", `#${id}`);
  $("crumb").textContent = p.title;
  $("panel").hidden = false;
  renderList();
  pause();
  await Promise.all([loadReview(), loadReadme()]);
  renderExports();
  const frame = $("comp");
  if (!p.composition) {
    frame.hidden = true; frame.removeAttribute("src"); $("transport").hidden = true; $("empty").hidden = false;
    $("empty").innerHTML = `No composition yet.<br><span class="muted">Read the storyboard on the right. After you approve it, Claude builds <code>composition/index.html</code>.</span>`;
    return;
  }
  const t = keepT ? S.t : 0;
  $("empty").hidden = false; $("empty").textContent = "Loading…";
  // Load exactly as core/render.mjs does: laid out (never display:none) in a 1080×1920 viewport, then resized to
  // the composition's size. Code that measures layout at load (line splitting, fitting) runs the same way as in a render.
  frame.hidden = false; frame.classList.add("loading");
  frame.style.width = "1080px"; frame.style.height = "1920px";
  frame.src = `${p.composition}?render=1&desk=${Date.now()}`;
  frame.onload = async () => {
    try {
      S.win = frame.contentWindow;
      await S.win.__ready;
      S.meta = S.win.__meta();
      frame.style.width = S.meta.width + "px"; frame.style.height = S.meta.height + "px";
      fit(); frame.classList.remove("loading"); $("empty").hidden = true; $("transport").hidden = false;
      setSafe($("safe").checked);
      renderNotes();
      await seek(Math.min(t, S.meta.duration - 1 / S.meta.fps));
    } catch (e) {
      $("empty").hidden = false; $("empty").innerHTML = `Composition failed to load.<br><span class="muted">${esc(e.message || e)}</span>`;
    }
  };
}

function fit() {
  if (!S.meta) return;
  const box = $("stageWrap").getBoundingClientRect();
  const k = Math.min((box.width - 32) / S.meta.width, (box.height - 32) / S.meta.height);
  $("comp").style.transform = `scale(${k}) translate(-50%, -50%)`;
}
addEventListener("resize", fit);

// ---------- clock ----------
const frameOf = (t) => Math.round(t * S.meta.fps);
async function seek(t) {
  if (!S.win || !S.meta) return;
  S.t = Math.max(0, Math.min(t, S.meta.duration));
  drawHead();
  if (S.busy) return; // the next tick or the trailing seek below catches up
  S.busy = true;
  let done;
  do { done = S.t; await S.win.__seek(done); } while (done !== S.t && !S.playing);
  S.busy = false;
  reportState();
}
function drawHead() {
  const k = S.t / S.meta.duration;
  $("head").style.left = k * 100 + "%";
  $("fill").style.width = k * 100 + "%";
  $("time").textContent = `${S.t.toFixed(2)} s · f${frameOf(S.t)}`;
  $("noteAt").textContent = `at ${S.t.toFixed(2)} s (frame ${frameOf(S.t)})`;
}
let t0 = 0;
function play() {
  if (!S.meta) return;
  S.playing = true; $("play").textContent = "❚❚";
  if (S.t >= S.meta.duration - 1 / S.meta.fps) S.t = 0;
  t0 = performance.now() - S.t * 1000;
  const tick = async () => {
    if (!S.playing) return;
    if (!S.busy) await seek(((performance.now() - t0) / 1000) % S.meta.duration);
    requestAnimationFrame(tick);
  };
  tick();
}
function pause() { S.playing = false; $("play").textContent = "▶"; }
const step = (n) => { pause(); seek((frameOf(S.t) + n) / S.meta.fps); };
$("play").onclick = () => (S.playing ? pause() : play());
$("prev").onclick = () => step(-1);
$("next").onclick = () => step(1);

const scrub = $("scrub");
const scrubTo = (e) => { const r = scrub.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * S.meta.duration); };
scrub.onpointerdown = (e) => {
  if (e.target.classList.contains("m")) return;
  pause(); scrub.setPointerCapture(e.pointerId); scrubTo(e);
  scrub.onpointermove = scrubTo;
  scrub.onpointerup = () => { scrub.onpointermove = null; };
};

function setSafe(on) { S.win?.document.documentElement.classList.toggle("show-safe", on); }
$("safe").onchange = (e) => setSafe(e.target.checked);

addEventListener("keydown", (e) => {
  if (e.target.matches("input, textarea") || !S.meta) return;
  if (e.key === " ") { e.preventDefault(); S.playing ? pause() : play(); }
  else if (e.key === "ArrowLeft") step(e.shiftKey ? -S.meta.fps : -1);
  else if (e.key === "ArrowRight") step(e.shiftKey ? S.meta.fps : 1);
  else if (e.key === "Home") { pause(); seek(0); }
  else if (e.key.toLowerCase() === "s") { $("safe").checked = !$("safe").checked; setSafe($("safe").checked); }
  else if (e.key.toLowerCase() === "n") { e.preventDefault(); tab("notes"); pause(); $("noteText").focus(); }
});

let stateTimer;
function reportState() {
  clearTimeout(stateTimer);
  stateTimer = setTimeout(() => api("/api/state", { method: "POST",
    body: { production: S.prod?.id, t: +S.t.toFixed(3), frame: S.meta ? frameOf(S.t) : 0, playing: S.playing } }).catch(() => {}), 400);
}

// ---------- tabs ----------
function tab(name) {
  document.querySelectorAll(".tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === name));
  document.querySelectorAll(".tab").forEach((t) => (t.hidden = t.dataset.tab !== name));
}
document.querySelector(".tabs").onclick = (e) => { const b = e.target.closest("button"); if (b) tab(b.dataset.tab); };

// ---------- notes ----------
async function loadReview() {
  S.review = await api(`/api/review?p=${encodeURIComponent(S.prod.id)}`);
  renderNotes();
}
function renderNotes() {
  const notes = S.review.notes.slice().sort((a, b) => a.t - b.t);
  const open = notes.filter((n) => n.status === "open");
  $("noteCount").textContent = open.length || "";
  const shown = notes.filter((n) => S.noteFilter === "all" || n.status === S.noteFilter);
  $("notes").innerHTML = shown.map((n) => `<li class="note ${n.status}" data-id="${n.id}">
    <div class="h"><a data-t="${n.t}">${n.t.toFixed(2)} s</a> #${n.id} · ${n.by}<span class="sp"></span>
      ${n.status === "open" ? `<button data-act="closed" title="Close without a change">Close</button>` : ""}
      ${n.status === "fixed" ? `<button data-act="closed" title="Checked, looks right">✓ OK</button><button data-act="open">Reopen</button>` : ""}
      ${n.status === "closed" ? `<button data-act="open">Reopen</button>` : ""}
      <button data-act="delete" title="Delete">✕</button></div>
    <p>${esc(n.text)}</p>${n.reply ? `<div class="reply">Claude: ${esc(n.reply)}</div>` : ""}</li>`).join("")
    || `<li class="muted small">${S.noteFilter === "open" ? "No open notes. Scrub to a frame and pin one." : "Nothing here."}</li>`;
  $("marks").innerHTML = S.meta ? notes.filter((n) => n.status !== "closed").map((n) =>
    `<span class="m ${n.status}" style="left:${(n.t / S.meta.duration) * 100}%" data-t="${n.t}" title="#${n.id} ${esc(n.text)}"></span>`).join("") : "";
  $("sendNotes").disabled = !open.length;
}
$("marks").onclick = (e) => { if (e.target.dataset.t) { pause(); seek(+e.target.dataset.t); } };
$("noteFilter").onclick = (e) => {
  const b = e.target.closest("button"); if (!b) return;
  S.noteFilter = b.dataset.f;
  $("noteFilter").querySelectorAll("button").forEach((x) => x.classList.toggle("on", x === b));
  renderNotes();
};
$("notes").onclick = async (e) => {
  if (e.target.dataset.t) { pause(); return seek(+e.target.dataset.t); }
  const act = e.target.dataset.act; if (!act) return;
  const id = e.target.closest(".note").dataset.id;
  const p = encodeURIComponent(S.prod.id);
  if (act === "delete") await api(`/api/notes/${id}?p=${p}`, { method: "DELETE" });
  else await api(`/api/notes/${id}?p=${p}`, { method: "PATCH", body: { status: act } });
  await refreshCounts();
};
$("noteForm").onsubmit = async (e) => {
  e.preventDefault();
  const text = $("noteText").value.trim(); if (!text) return;
  await api(`/api/notes?p=${encodeURIComponent(S.prod.id)}`, { method: "POST", body: { t: S.t, text } });
  $("noteText").value = "";
  await refreshCounts();
};
$("noteText").onkeydown = (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); $("noteForm").requestSubmit(); } };
async function refreshCounts() {
  await loadReview();
  S.list = await api("/api/productions");
  S.prod = S.list.find((x) => x.id === S.prod.id);
  renderList(); renderApprovals();
}

// ---------- jobs (renders, Claude) ----------
function follow(job, logEl, onDone) {
  logEl.textContent = "";
  const es = new EventSource(`/api/jobs/${job.id}/events`);
  es.onmessage = (m) => {
    const ev = JSON.parse(m.data);
    if (ev.line !== undefined) { logEl.textContent += ev.line + "\n"; logEl.scrollTop = logEl.scrollHeight; }
    if (ev.done) { es.close(); onDone(ev); }
  };
  es.onerror = () => { es.close(); onDone({ code: -1 }); };
}
function busy(on, text = "") { $("status").textContent = text; document.body.classList.toggle("busy", on); }

async function sendToClaude(request, withNotes) {
  const openIds = S.review.notes.filter((n) => n.status === "open").map((n) => n.id);
  tab("claude");
  try {
    const job = await api(`/api/claude?p=${encodeURIComponent(S.prod.id)}`, { method: "POST",
      body: { notes: withNotes ? openIds : [-1], request } });
    $("sendAsk").disabled = $("sendNotes").disabled = true; $("stopClaude").hidden = false;
    busy(true, "Claude is working…");
    $("stopClaude").onclick = () => api(`/api/jobs/${job.id}/stop`, { method: "POST" });
    follow(job, $("claudeLog"), async (ev) => {
      $("sendAsk").disabled = false; $("stopClaude").hidden = true;
      busy(false, ev.code === 0 ? "Claude finished. Reloaded the composition." : `Claude stopped (exit ${ev.code}).`);
      await refreshCounts();
      await open(S.prod.id, true);
    });
  } catch (e) { $("claudeLog").textContent = e.message; }
}
$("sendNotes").onclick = () => sendToClaude("", true);
$("sendAsk").onclick = () => sendToClaude($("ask").value, $("withNotes").checked);

async function render(kind) {
  const out = $("renderOut");
  out.innerHTML = "";
  try {
    const job = await api(`/api/render?p=${encodeURIComponent(S.prod.id)}`, { method: "POST",
      body: { kind, t: +S.t.toFixed(3), safe: $("safe").checked } });
    ["rStill", "rVideo", "rQa"].forEach((id) => ($(id).disabled = true));
    busy(true, `Rendering ${kind}…`);
    follow(job, $("renderLog"), (ev) => {
      ["rStill", "rVideo", "rQa"].forEach((id) => ($(id).disabled = false));
      busy(false, ev.code === 0 ? `${kind} done` : `${kind} failed (exit ${ev.code})`);
      if (ev.code !== 0) return;
      const url = `${ev.file}?v=${Date.now()}`;
      if (kind === "still") out.innerHTML = `<a href="${url}" target="_blank"><img src="${url}" alt="Rendered still"></a>`;
      if (kind === "video") out.innerHTML = `<video src="${url}" controls muted></video>`;
      if (kind === "qa") out.innerHTML = `<a href="${url}" target="_blank">Open the QA report</a>`;
    });
  } catch (e) { $("renderLog").textContent = e.message; }
}
$("rStill").onclick = () => render("still");
$("rVideo").onclick = () => render("video");
$("rQa").onclick = () => render("qa");

function renderExports() {
  $("exports").innerHTML = S.prod.exports.map((u) => `<li><a href="${esc(u)}" target="_blank">${esc(u.split("/").pop())}</a></li>`).join("")
    || `<li class="muted small">No exports yet.</li>`;
  renderApprovals();
}

// ---------- approvals (people only) ----------
$("approver").value = store.get("desk.name") || "";
$("approver").onchange = (e) => store.set("desk.name", e.target.value);
function renderApprovals() {
  $("approvals").innerHTML = (S.review?.approvals || []).map((a) =>
    `<li>✓ ${a.stage === "final" ? "Final cut" : "Storyboard"} approved by ${esc(a.by)}, ${a.at.slice(0, 10)}</li>`).join("");
}
async function approveStage(stage) {
  const by = $("approver").value.trim();
  if (!by) { $("approver").focus(); return; }
  if (!confirm(`Approve the ${stage === "final" ? "final cut" : "storyboard"} of ${S.prod.title} as ${by}? This ticks the box in its README.`)) return;
  await api(`/api/approve?p=${encodeURIComponent(S.prod.id)}`, { method: "POST", body: { stage, by } });
  await refreshCounts(); await loadReadme();
}
$("okBoard").onclick = () => approveStage("storyboard");
$("okFinal").onclick = () => approveStage("final");

// ---------- storyboard (README) ----------
async function loadReadme() {
  $("readme").innerHTML = md(await api(`/api/readme?p=${encodeURIComponent(S.prod.id)}`));
}
function inline(s) {
  return esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
    .replace(/\*([^*]+)\*/g, "<i>$1</i>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1");
}
function md(src) {
  const out = [], lines = src.split("\n");
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^```/.test(l)) { const buf = []; while (++i < lines.length && !/^```/.test(lines[i])) buf.push(esc(lines[i])); out.push(`<pre>${buf.join("\n")}</pre>`); }
    else if (/^#{1,4} /.test(l)) { const n = l.match(/^#+/)[0].length; out.push(`<h${n}>${inline(l.slice(n + 1))}</h${n}>`); }
    else if (/^\|/.test(l)) {
      const rows = []; for (; i < lines.length && /^\|/.test(lines[i]); i++) rows.push(lines[i]); i--;
      const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => inline(c.trim()));
      const body = rows.filter((r) => !/^\|[\s:|-]+\|$/.test(r));
      out.push(`<table>${body.map((r, k) => `<tr>${cells(r).map((c) => (k ? `<td>${c}</td>` : `<th>${c}</th>`)).join("")}</tr>`).join("")}</table>`);
    }
    else if (/^> ?/.test(l)) out.push(`<blockquote>${inline(l.replace(/^> ?/, ""))}</blockquote>`);
    else if (/^\s*- /.test(l)) out.push(`<div>• ${inline(l.replace(/^\s*- /, "").replace(/^\[x\]/, "☑").replace(/^\[ \]/, "☐"))}</div>`);
    else if (l.trim()) out.push(`<p>${inline(l)}</p>`);
  }
  return out.join("\n");
}

// ---------- start ----------
await loadList();
const want = decodeURIComponent(location.hash.slice(1)) || store.get("desk.prod");
if (want && S.list.some((p) => p.id === want)) open(want);
addEventListener("hashchange", () => {
  const id = decodeURIComponent(location.hash.slice(1));
  if (id !== S.prod?.id && S.list.some((p) => p.id === id)) open(id);
});
