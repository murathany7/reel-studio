# Packaging

One kit, three registries. The npm package is the source of truth: the PyPI wheel bundles exactly the files
`npm pack` ships (the `files` list in `package.json`), and the Homebrew formula installs the npm tarball.

| Registry | Install | Built from |
|---|---|---|
| npm | `npx reel-studio init` | `package.json`, `bin/reel-studio.mjs` |
| PyPI | `pipx install reel-studio`, `uvx reel-studio init` | `python/` + `packaging/build-python.sh` |
| Homebrew | `brew install murathany7/reel-studio/reel-studio` | `packaging/homebrew/reel-studio.rb` → tap repo `murathany7/homebrew-reel-studio` |

## Release

1. Bump `version` in `package.json` and `.claude-plugin/plugin.json`. The Python version is copied from `package.json`.
2. npm: `npm publish`
3. PyPI: `packaging/build-python.sh`, then `cd python && uv publish` (PyPI token in `UV_PUBLISH_TOKEN`)
4. Homebrew: `packaging/update-formula.sh ../homebrew-reel-studio`, then commit and push the tap

## Check before publishing

```sh
packaging/build-python.sh
uvx --from python/dist/reel_studio-*-py3-none-any.whl reel-studio init /tmp/rs-py   # kit copied, npm install, tools listed
```

`bin/reel-studio.mjs` and `python/src/reel_studio/cli.py` do the same thing (call `scripts/init-project.sh`); change both together.
