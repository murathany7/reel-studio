# Packaging

One kit, three registries. The npm package is the source of truth: the PyPI wheel bundles exactly the files
`npm pack` ships (the `files` list in `package.json`), and the Homebrew formula installs the npm tarball.

| Registry | Install | Built from |
|---|---|---|
| npm | `npx reel-studio init` | `package.json`, `bin/reel-studio.mjs` |
| PyPI | `pipx install reel-studio`, `uvx reel-studio init` | `python/` + `packaging/build-python.sh` |
| Homebrew | `brew install murathany7/reel-studio/reel-studio` | `packaging/homebrew/reel-studio.rb` → tap repo `murathany7/homebrew-reel-studio` |

## Release (automatic)

```sh
packaging/bump.sh 0.2.2     # package.json, plugin.json, pyproject.toml
git commit -am "v0.2.2" && git push
```

On every push to `main`, `.github/workflows/release.yml` checks whether `package.json`'s version is on npm. If it is
not, it runs the full test suite, then publishes npm (with provenance) and PyPI (trusted publishing), creates the
`v<version>` tag and GitHub Release with the packages attached, and bumps the Homebrew tap. Pushes that do not change
the version only run CI (`.github/workflows/ci.yml`).

## One-time setup (maintainer)

| Where | What |
|---|---|
| npmjs.com → reel-studio → Settings → Trusted publishing | GitHub Actions, `murathany7/reel-studio`, workflow `release.yml`, environment `npm` |
| pypi.org → reel-studio → Publishing → Add a trusted publisher | GitHub, `murathany7/reel-studio`, workflow `release.yml`, environment `pypi` |
| GitHub → murathany7/reel-studio → Settings → Secrets → Actions | `HOMEBREW_TAP_TOKEN`: a fine-grained token with Contents read/write on `murathany7/homebrew-reel-studio` only |

Without `HOMEBREW_TAP_TOKEN` the release still publishes npm and PyPI and leaves a warning; update the tap by hand.

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
