# Reel Studio

Agency-quality reels, ads and posts, made by Claude Code. Open source and free; your Claude subscription does the
rest. No editor, no timeline, no per-video fees.

```bash
pipx install reel-studio      # or: uv tool install reel-studio
reel-studio init              # copy the kit and skills here and install the renderer
```

Or without installing: `uvx reel-studio init`.

The renderer runs on Node, so you also need **Node 18+, Google Chrome and ffmpeg**. Blender is optional, for 3D plates.
Then open the folder in Claude Code and ask:

> *Add my product as a new brand: https://my-product.com*
> *Make a 15 s reel for &lt;brand&gt; about &lt;feature&gt;*

This package ships the same kit as `npx reel-studio init`. Docs, examples and the Claude Code plugin:
https://github.com/murathany7/reel-studio
