// Ad kit: patterns build, guardrails refuse invented claims, the variant matrix expands. No browser needed.
import assert from "node:assert/strict";
import { readFileSync, writeFileSync, mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import vm from "node:vm";
import { test } from "node:test";
import { ROOT, run } from "./helpers.mjs";

function kit() {
  const ctx = { window: {} };
  vm.createContext(ctx);
  for (const f of ["engines/ad-kit/ad-kit.js", "engines/ad-kit/scenes.js", "engines/ad-kit/patterns.js"])
    vm.runInContext(readFileSync(path.join(ROOT, f), "utf8"), ctx, { filename: f });
  return ctx.window.AdKit;
}

test("every pattern documents its principle, basis and needs", () => {
  const AK = kit();
  assert.ok(Object.keys(AK.patterns).length >= 20);
  for (const p of Object.values(AK.patterns)) {
    for (const k of ["name", "scenario", "principle", "basis"]) assert.ok(p[k], `${p.id} has no ${k}`);
    assert.ok(Array.isArray(p.needs) && p.needs.includes("brand"), `${p.id} must end on the brand's end card`);
  }
});

test("patterns name the brief fields they miss", () => {
  const AK = kit();
  assert.throws(() => AK.pattern("pas", { brand: {} }), /needs brief\.problem, brief\.agitate/);
  const s = AK.pattern("three", { brand: { wordmark: "X" }, steps: [{ label: "a" }, { label: "b" }, { label: "c" }], features: [{ title: "f" }] });
  assert.equal(s.scenes.at(-1).type, "endcard");
  for (const sc of s.scenes) assert.ok(AK.scenes[sc.type], sc.type);
});

test("guardrails refuse unsourced claims, fake deadlines and banned words", () => {
  const AK = kit();
  const chk = (scenes, forbid) => () => AK.check({ scenes, forbid });
  assert.throws(chk([{ type: "stat", value: 98, suffix: "%" }]), /needs a real "source"/);
  assert.throws(chk([{ type: "quote", text: "Love it" }]), /needs a real "who"/);
  assert.throws(chk([{ type: "urgency", title: "Ends soon", until: "2026-01-01", today: "2026-02-01", source: "x" }]), /not after/);
  assert.throws(chk([{ type: "title", title: "So easy!" }], [/!/]), /forbids/);
  assert.throws(chk([{ type: "nope" }]), /unknown scene/);
  assert.doesNotThrow(chk([{ type: "stat", value: 102, suffix: "°", source: "spec sheet" }, { type: "title", title: "Build it." }], [/!/, "easy"]));
});

test("variants.mjs expands axes, excludes and includes", () => {
  const dir = mkdtempSync(path.join(tmpdir(), "var-"));
  const f = path.join(dir, "variants.json");
  writeFileSync(f, JSON.stringify({ id: "T", name: "{id}-{a}-{b}", axes: { a: ["x", "y"], b: [1, 2] },
    exclude: [{ a: "y", b: 2 }], include: [{ a: "z", b: 9 }] }));
  const r = run(process.execPath, ["scripts/variants.mjs", f, "--dry"]);
  assert.equal(r.code, 0, r.out);
  const names = r.out.split("\n").map((l) => l.trim().split(/\s+/)[0]).filter((n) => n.startsWith("T-"));
  assert.deepEqual(names, ["T-x-1", "T-x-2", "T-y-1", "T-z-9"]);
});
