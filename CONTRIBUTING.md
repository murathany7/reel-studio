# Contributing

Thanks for helping. Reel Studio is a kit for making marketing videos with Claude Code: a renderer, engine adapters,
skills and templates. The most useful contributions:

- **A new engine adapter** (Rive is next) or a fix to an existing one in `engines/`.
- **Skill improvements** in `.claude/skills/`: clearer steps, a pitfall you hit, a better default.
- **Bug reports with a composition** that renders wrong or differently twice.
- **Show what you made**: open a "Show your reel" issue. Good examples may be featured in the README.

## Setup

```bash
git clone https://github.com/murathany7/reel-studio && cd reel-studio
npm ci --prefix core
npm test              # syntax, manifests, npm package, init, render determinism, video QA (~30 s)
npm run test:python   # the PyPI package
```

You need Node 18+, Google Chrome and ffmpeg. The render tests skip themselves when Chrome or ffmpeg is missing.

## Rules the tests enforce

1. **Every frame is a pure function of `t`.** Rendering the same frame twice must give the same pixels. No
   `Date.now()`, unseeded `Math.random()`, `requestAnimationFrame` timing or `mixer.update(delta)`. See `engines/README.md`.
2. **The kit stays brand-neutral.** Brand facts and productions live in `brands/<slug>/` and `productions/`, and never
   ship in the npm or PyPI package.
3. **The versions match** in `package.json`, `.claude-plugin/plugin.json` and `python/pyproject.toml`. Use `packaging/bump.sh`.
4. **The Node and Python CLIs stay the same**: `bin/reel-studio.mjs` and `python/src/reel_studio/cli.py`.

## Pull requests

Keep them small and say what you checked. CI runs the tests on Linux and macOS for every PR. For a visual change,
attach a still before and after (`node core/render.mjs still <page> out.png --t <s>`).

## Releases

Maintainers bump the version with `packaging/bump.sh <version>` and push to `main`. The Release workflow publishes
npm, PyPI, the Homebrew tap and a GitHub Release. Details: `packaging/README.md`.
