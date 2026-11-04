#!/usr/bin/env node
/* Which looks a brand has used, and which it has not tried.
 *
 *   node scripts/looks.mjs <brand>     the brand's productions (newest first) with their Look, then the catalogue
 *   node scripts/looks.mjs             every brand
 *
 * Reads the `| Look |` row of each productions/<brand>/<ID>-<slug>/README.md and the folders in looks/ that have a
 * starter.html. Exit code 0 always; a warning line when the brand's last two pieces share a look.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dirs = (p) => (existsSync(p) ? readdirSync(p, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name) : []);

const catalogue = dirs(path.join(ROOT, "looks")).filter((l) => existsSync(path.join(ROOT, "looks", l, "starter.html")));

function productions(brand) {
  const base = path.join(ROOT, "productions", brand);
  return dirs(base).filter((d) => !d.startsWith("_")).map((id) => {
    const readme = path.join(base, id, "README.md");
    const md = existsSync(readme) ? readFileSync(readme, "utf8") : "";
    const row = md.match(/^\|\s*Look\s*\|\s*(.+?)\s*\|\s*$/m);
    const value = row ? row[1].replace(/`/g, "") : "";
    const look = catalogue.find((l) => new RegExp(`\\b${l}\\b`).test(value)) || (value ? value.split(/[ (·,]/)[0] : "");
    const num = Number((id.match(/-(\d+)/) || [])[1] || 0);
    return { id, look, value, num };
  }).sort((a, b) => b.num - a.num);
}

const brands = process.argv[2] ? [process.argv[2]] : dirs(path.join(ROOT, "brands")).filter((b) => !b.startsWith("_"));
for (const brand of brands) {
  if (!existsSync(path.join(ROOT, "brands", brand))) { console.error(`No brand folder brands/${brand}/`); process.exit(1); }
  const list = productions(brand);
  console.log(`\n${brand}`);
  if (!list.length) console.log("  (no productions yet)");
  for (const p of list) console.log(`  ${p.id.padEnd(28)} ${p.value || "(no Look recorded)"}`);
  const used = new Set(list.map((p) => p.look).filter(Boolean));
  const recent = list.slice(0, 2).map((p) => p.look).filter(Boolean);
  console.log(`  not tried yet: ${catalogue.filter((l) => !used.has(l)).join(", ") || "(all tried)"}`);
  if (recent.length === 2 && recent[0] === recent[1]) {
    console.log(`  ⚠ the last two pieces both used "${recent[0]}": pitch at least one different look`);
  }
}
console.log(`\ncatalogue (looks/): ${catalogue.join(", ")}`);
