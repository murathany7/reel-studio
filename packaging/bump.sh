#!/usr/bin/env bash
# Set the version everywhere it lives: package.json, .claude-plugin/plugin.json, python/pyproject.toml.
#   packaging/bump.sh 0.2.2      then commit, push, and publish by hand (packaging/README.md)
set -euo pipefail

v="${1:?usage: packaging/bump.sh <major.minor.patch>}"
[[ "$v" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo "not a version: $v" >&2; exit 1; }
root="$(cd "$(dirname "$0")/.." && pwd)"

for f in package.json .claude-plugin/plugin.json; do
  sed -i.bak -E "s/\"version\": \"[^\"]+\"/\"version\": \"$v\"/" "$root/$f" && rm "$root/$f.bak"
done
sed -i.bak -E "s/^version = \"[^\"]*\"/version = \"$v\"/" "$root/python/pyproject.toml" && rm "$root/python/pyproject.toml.bak"
grep -H -E '"version"|^version' "$root/package.json" "$root/.claude-plugin/plugin.json" "$root/python/pyproject.toml"
