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
packaging/bump.sh 0.2.5     # package.json, plugin.json, pyproject.toml
git commit -am "v0.2.5" && git push
```

On every push to `main`, `.github/workflows/release.yml` checks each target on its own (npm, PyPI, GHCR, the GitHub
Release) for `package.json`'s version. If any is missing, it runs the full test suite, publishes only the missing
ones, then creates the `v<version>` GitHub Release (npm tgz, wheel, sdist) and bumps the Homebrew tap. A rerun after
a partial failure, or after a release by hand, only does what is left. Pushes that do not change the version only
run CI (`.github/workflows/ci.yml`).

## One-time setup (maintainer)

Each registry needs **one** of the two ways to publish. Trusted publishing is preferred (no secrets, npm provenance).
The 0.2.2 and 0.2.3 runs failed here: npm `E404` on PUT and PyPI `invalid-publisher` both mean this is not set up.

| Where | Trusted publishing (preferred) | Or a token secret |
|---|---|---|
| npm | npmjs.com → reel-studio → Settings → Trusted publishing: GitHub Actions, `murathany7/reel-studio`, workflow `release.yml`, environment `npm` | `NPM_TOKEN`: a granular token with publish rights on `reel-studio`, bypassing 2FA |
| PyPI | pypi.org → reel-studio → Publishing → Add a trusted publisher: GitHub, `murathany7/reel-studio`, workflow `release.yml`, environment `pypi` | `PYPI_API_TOKEN`: a token scoped to the `reel-studio` project |
| Homebrew | | `HOMEBREW_TAP_TOKEN`: a fine-grained token with Contents read/write on `murathany7/homebrew-reel-studio` only |

Secrets go in GitHub → murathany7/reel-studio → Settings → Secrets → Actions. Without `HOMEBREW_TAP_TOKEN` the
release still publishes and leaves a warning; update the tap by hand. GHCR needs nothing (it uses the run's token).
After fixing a failed run: `gh run rerun <id> --failed`, or Actions → Release → Run workflow.

## Release by hand

```sh
npm publish --access public                                     # npm (asks for 2FA in the browser)
packaging/build-python.sh && (cd python && uv publish)          # PyPI (a PyPI API token)
packaging/update-formula.sh ../homebrew-reel-studio             # then commit and push the tap
npm pack --pack-destination dist && gh release create v0.2.5 --generate-notes dist/*.tgz python/dist/*
docker buildx build --platform linux/amd64,linux/arm64 --push \
  -t ghcr.io/murathany7/reel-studio:0.2.5 -t ghcr.io/murathany7/reel-studio:latest .
```

## Tests

```sh
npm test              # test/*.test.mjs: syntax, manifests, npm package contents, init, render determinism, video QA
npm run test:python   # builds the wheel, then python/tests: CLI, kit == npm package, init
```

`bin/reel-studio.mjs` and `python/src/reel_studio/cli.py` do the same thing (call `scripts/init-project.sh`); change both together.
