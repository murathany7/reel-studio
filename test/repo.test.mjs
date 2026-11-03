// Static checks: every script parses, manifests agree, skills are well formed.
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { ROOT, run, json } from "./helpers.mjs";

const tracked = run("git", ["ls-files"]).out.split("\n").filter(Boolean)
  .filter((f) => !/^(brands|productions)\/(?!_)/.test(f)); // brand and production work is not kit code
const ofType = (re) => tracked.filter((f) => re.test(f) && existsSync(path.join(ROOT, f)));

test("JavaScript files parse", () => {
  for (const f of ofType(/\.(mjs|js)$/)) {
    const r = run(process.execPath, ["--check", f]);
    assert.equal(r.code, 0, `${f}\n${r.out}`);
  }
});

test("shell scripts parse", () => {
  for (const f of ofType(/\.sh$/)) {
    const r = run("bash", ["-n", f]);
    assert.equal(r.code, 0, `${f}\n${r.out}`);
  }
});

test("Python files compile", () => {
  const files = ofType(/\.py$/);
  const r = run("python3", ["-c", "import ast,sys\nfor f in sys.argv[1:]: ast.parse(open(f).read(), f)", ...files]);
  assert.equal(r.code, 0, r.out);
});

test("JSON files are valid", () => {
  for (const f of ofType(/\.json$/)) assert.doesNotThrow(() => json(f), f);
});

test("versions match in package.json, plugin.json and pyproject.toml", () => {
  const v = json("package.json").version;
  assert.match(v, /^\d+\.\d+\.\d+$/);
  assert.equal(json(".claude-plugin/plugin.json").version, v, "plugin.json");
  const py = readFileSync(path.join(ROOT, "python/pyproject.toml"), "utf8").match(/^version = "([^"]+)"/m)[1];
  assert.equal(py, v, "python/pyproject.toml");
});

test("every skill has name and description frontmatter matching its folder", () => {
  const dir = path.join(ROOT, json(".claude-plugin/plugin.json").skills);
  const skills = readdirSync(dir);
  assert.ok(skills.length >= 7, `found ${skills.length} skills`);
  for (const s of skills) {
    const md = readFileSync(path.join(dir, s, "SKILL.md"), "utf8");
    const fm = md.match(/^---\n([\s\S]*?)\n---\n/);
    assert.ok(fm, `${s}: no frontmatter`);
    assert.match(fm[1], new RegExp(`^name: ${s}$`, "m"), `${s}: name`);
    const desc = fm[1].match(/^description: (.+)$/m);
    assert.ok(desc && desc[1].length >= 40 && desc[1].length <= 1024, `${s}: description length`);
  }
});

test("marketplace lists the plugin from the repo root", () => {
  const m = json(".claude-plugin/marketplace.json");
  const p = m.plugins.find((x) => x.name === json(".claude-plugin/plugin.json").name);
  assert.ok(p, "plugin missing from marketplace.json");
  assert.equal(p.source, "./");
});

test("Homebrew formula installs this package's npm tarball", () => {
  const rb = readFileSync(path.join(ROOT, "packaging/homebrew/reel-studio.rb"), "utf8");
  assert.match(rb, /url "https:\/\/registry\.npmjs\.org\/reel-studio\/-\/reel-studio-\d+\.\d+\.\d+\.tgz"/);
  assert.match(rb, /depends_on "node"/);
  assert.match(rb, /depends_on "ffmpeg"/);
});

test("the Node and Python CLIs offer the same commands", () => {
  const node = readFileSync(path.join(ROOT, "bin/reel-studio.mjs"), "utf8");
  const py = readFileSync(path.join(ROOT, "python/src/reel_studio/cli.py"), "utf8");
  for (const src of [node, py]) {
    assert.match(src, /scripts\/init-project\.sh/);
    assert.match(src, /--with-skills/);
    assert.match(src, /init \[dir\] --update/);
  }
});
