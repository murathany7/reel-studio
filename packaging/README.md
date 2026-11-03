# Packaging

One kit, three registries. The npm package is the source of truth: the PyPI wheel bundles exactly the files
`npm pack` ships (the `files` list in `package.json`), and the Homebrew formula installs the npm tarball.

| Registry | Install | Built from |
|---|---|---|
| npm | `npx reel-studio init` | `package.json`, `bin/reel-studio.mjs` |
| PyPI | `pipx install reel-studio`, `uvx reel-studio init` | `python/` + `packaging/build-python.sh` |
| Homebrew | `brew install murathany7/reel-studio/reel-studio` | `packaging/homebrew/reel-studio.rb` → tap repo `murathany7/homebrew-reel-studio` |

## Release

There is no release workflow for now (removed 2026-11-03); CI (`.github/workflows/ci.yml`) only tests. To release:

```sh
packaging/bump.sh 0.2.4     # package.json, plugin.json, pyproject.toml
git commit -am "v0.2.4" && git push
```

then publish by hand, below.

## Release by hand

1. `npm publish`
2. `packaging/build-python.sh`, then `cd python && uv publish`
3. `packaging/update-formula.sh ../homebrew-reel-studio`, then commit and push the tap

## Tests

```sh
npm test              # test/*.test.mjs: syntax, manifests, npm package contents, init, render determinism, video QA
npm run test:python   # builds the wheel, then python/tests: CLI, kit == npm package, init
```

`bin/reel-studio.mjs` and `python/src/reel_studio/cli.py` do the same thing (call `scripts/init-project.sh`); change both together.
