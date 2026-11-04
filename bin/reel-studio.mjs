#!/usr/bin/env node
// npx reel-studio init [dir] [--update]: copy the Reel Studio kit and its agent skills into a project.
// npx reel-studio desk [--port 4100]: open the review desk of the project in this folder.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
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
Done. Open this folder in Claude Code, Codex or GitHub Copilot (agent mode) and ask:
  "Add my product as a new brand: https://…"
  "Make a 15 s reel for <brand> about <feature>"
Optional, to review on a page instead of in chat:  npx reel-studio desk`);
  }
  process.exit(r.status ?? 1);
}

if (cmd === "desk") {
  // The project's own copy, so the desk serves the project (its brands, productions and kit version)
  const server = path.resolve("desk/server.mjs");
  if (!existsSync(server)) {
    console.error("No desk/ here. Run `npx reel-studio init` in this folder first (or `--update` an older project).");
    process.exit(1);
  }
  process.exit(spawnSync(process.execPath, [server, ...rest], { stdio: "inherit" }).status ?? 1);
}

console.log(`Reel Studio: marketing videos made with code, run by your coding agent (Claude Code, Codex, Copilot).

  npx reel-studio init [dir]           copy the kit and skills into dir (default: here) and install it
  npx reel-studio init [dir] --update  refresh core/, engines/, scripts/, desk/ and skills from this version
  npx reel-studio desk [--port 4100]   optional review page: play, pin notes, send them to your agent, approve

Claude Code plugin instead:  /plugin marketplace add murathany7/reel-studio
More: https://github.com/murathany7/reel-studio`);
process.exit(cmd && cmd !== "help" && cmd !== "--help" ? 1 : 0);
