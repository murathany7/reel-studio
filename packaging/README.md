# Packaging

One kit, three registries. The npm package is the source of truth: the PyPI wheel bundles exactly the files
`npm pack` ships (the `files` list in `package.json`), and the Homebrew formula installs the npm tarball.

| Registry | Install | Built from |
|---|---|---|
| npm | `npx reel-studio init` | `package.json`, `bin/reel-studio.mjs` |
| PyPI | `pipx install reel-studio`, `uvx reel-studio init` | `python/` + `packaging/build-python.sh` |
| Homebrew | `brew install murathany7/reel-studio/reel-studio` | `packaging/homebrew/reel-studio.rb` → tap repo `murathany7/homebrew-reel-studio` |

## Release (by hand)

Publishing is manual for now: there is no release workflow. CI (`.github/workflows/ci.yml`) only tests. Release from a
clean, green `main`:

```sh
packaging/bump.sh 0.2.4                     # package.json, plugin.json, pyproject.toml
git commit -am "v0.2.4" && git push         # wait for CI to pass
npm publish --access public                 # npm (asks for 2FA in the browser)
packaging/build-python.sh && (cd python && uv publish)          # PyPI (a PyPI API token)
packaging/update-formula.sh ../homebrew-reel-studio             # then commit and push the tap
npm pack --pack-destination dist && gh release create v0.2.4 --generate-notes dist/*.tgz python/dist/*
```

Docker image (optional), amd64 + arm64 on GHCR:

```sh
docker buildx build --platform linux/amd64,linux/arm64 --push \
  -t ghcr.io/murathany7/reel-studio:0.2.4 -t ghcr.io/murathany7/reel-studio:latest .
```

## Tests

```sh
npm test              # test/*.test.mjs: syntax, manifests, npm package contents, init, render determinism, video QA
npm run test:python   # builds the wheel, then python/tests: CLI, kit == npm package, init
```

`bin/reel-studio.mjs` and `python/src/reel_studio/cli.py` do the same thing (call `scripts/init-project.sh`); change both together.
