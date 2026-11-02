#!/usr/bin/env node
// npx reel-studio init [dir] [--update]: copy the Reel Studio kit and its Claude Code skills into a project.
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const KIT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const [cmd, ...rest] = process.argv.slice(2);

if (cmd === "init") {
  if (process.platform === "win32") {
    console.error("reel-studio init needs bash and rsync (macOS, Linux or WSL).");
    process.exit(1);
  }
  const r = spawnSync("bash", [path.join(KIT, "scripts/init-project.sh"), KIT, ...rest, "--with-skills"], { stdio: "inherit" });
  if (r.status === 0) {
    console.log(`
Done. Open this folder in Claude Code and ask:
  "Add my product as a new brand: https://…"
  "Make a 15 s reel for <brand> about <feature>"`);
  }
  process.exit(r.status ?? 1);
}

console.log(`Reel Studio: marketing videos made with code, run by Claude Code.

  npx reel-studio init [dir]           copy the kit and skills into dir (default: here) and install it
  npx reel-studio init [dir] --update  refresh core/, engines/, scripts/ and skills from this version

Claude Code plugin instead:  /plugin marketplace add murathany7/reel-studio
More: https://github.com/murathany7/reel-studio`);
process.exit(cmd && cmd !== "help" && cmd !== "--help" ? 1 : 0);
