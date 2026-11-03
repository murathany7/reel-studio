#!/usr/bin/env bash
# Point the Homebrew formula at the published npm tarball of package.json's version.
#   packaging/update-formula.sh            after npm publish
#   packaging/update-formula.sh <tap_dir>  also copy it into a checkout of murathany7/homebrew-reel-studio
set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
formula="$root/packaging/homebrew/reel-studio.rb"
version="$(node -p "require('$root/package.json').version")"
url="https://registry.npmjs.org/reel-studio/-/reel-studio-$version.tgz"
sha="$(curl -fsSL "$url" | shasum -a 256 | cut -d' ' -f1)" || { echo "reel-studio $version is not on npm yet: npm publish first" >&2; exit 1; }

sed -i.bak -E "s#^  url \".*\"#  url \"$url\"#; s#^  sha256 \".*\"#  sha256 \"$sha\"#" "$formula" && rm "$formula.bak"
echo "Formula → $version ($sha)"

if [ -n "${1:-}" ]; then
  mkdir -p "$1/Formula"
  cp "$formula" "$1/Formula/reel-studio.rb"
  echo "Copied to $1/Formula/reel-studio.rb: commit and push the tap"
fi
