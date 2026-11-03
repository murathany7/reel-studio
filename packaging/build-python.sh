#!/usr/bin/env bash
# Build the PyPI package in python/: bundle the exact files of the npm package (npm pack) as reel_studio/kit,
# take the version from package.json, then build the wheel and sdist into python/dist/.
#   packaging/build-python.sh            build
#   cd python && uv publish            upload (needs a PyPI token)
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
py="$root/python"
kit="$py/src/reel_studio/kit"
version="$(node -p "require('$root/package.json').version")"
tmp="$(mktemp -d)"; trap 'rm -rf "$tmp"' EXIT

(cd "$root" && npm pack --silent --pack-destination "$tmp" >/dev/null)
rm -rf "$kit" "$py/dist"
mkdir -p "$kit"
tar xzf "$tmp"/reel-studio-*.tgz -C "$tmp"
cp -R "$tmp/package/." "$kit/"
rm -f "$kit/package.json"  # npm-only; the kit never reads it

sed -i.bak -E "s/^version = \"[^\"]*\"/version = \"$version\"/" "$py/pyproject.toml" && rm "$py/pyproject.toml.bak"

(cd "$py" && uv build --quiet)
echo "Built reel-studio $version:"
ls -1 "$py/dist"
