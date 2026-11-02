<h1 align="center">🎬 Reel Studio</h1>

<p align="center"><b>Make marketing reels, ads and posts with code, for any brand, with Claude Code.</b><br>
Plain HTML pages on one clock → headless Chrome → MP4. Every frame is reproducible.</p>

<p align="center">
  <img src="docs/media/bike-logger-reel.gif" width="240" alt="Bike Logger reel">
  &nbsp;&nbsp;
  <img src="docs/media/engines-demo.gif" width="240" alt="Engines demo reel">
</p>
<p align="center"><sub>Left: <b>Bike Logger</b> kit reel (28 s, made by an agent from the product's live site) · Right: one 6 s reel using every engine<br>
Full-quality MP4s: <a href="https://github.com/murathany7/reel-studio/releases/latest">Releases</a></sub></p>

---

## How it works

<p align="center"><img src="docs/media/pipeline.svg" width="860" alt="Brief → Storyboard → You approve → HTML on one clock → Frame QA → MP4"></p>

You ask Claude Code: *"make a reel for &lt;brand&gt;"*. It writes a brief and a storyboard, waits for your yes, builds the
piece as an HTML page, renders every frame, checks them, and delivers a folder with the video and how it was made.

## Example: Bike Logger

A robotics kit reel, built by capturing the product's own 3D web page and laying brand copy on top.

<p align="center"><img src="docs/media/bike-logger-strip.jpg" alt="Frames from the Bike Logger reel"></p>

| What | Where |
|---|---|
| 🏷️ The brand: facts + sources, colours, fonts, voice, rules | [`brands/bike-logger/`](brands/bike-logger) |
| 📝 Brief → storyboard → fact check → delivery notes | [`productions/bike-logger/REEL-001-kit/README.md`](productions/bike-logger/REEL-001-kit/README.md) |
| 🧩 The composition (one HTML page) | [`composition/index.html`](productions/bike-logger/REEL-001-kit/composition/index.html) |
| 🔍 The QA report | [`qa/report.md`](productions/bike-logger/REEL-001-kit/qa/report.md) |

<table><tr>
<td width="50%"><img src="brands/bike-logger/assets/reference/brand-check.png" alt="Brand check card"><br><sub><b>Brand check</b>: one still that proves the brand's look renders right before any video is made.</sub></td>
<td width="50%"><img src="docs/media/qa-contact-sheet.jpg" alt="QA contact sheet with safe zones"><br><sub><b>Frame QA</b>: a contact sheet with the platform's safe zones drawn over it, plus a motion check that flags jumps.</sub></td>
</tr></table>

## Engines, all on one clock

<p align="center"><img src="docs/media/engines-strip.jpg" alt="Blender, Three.js, SVG rig and Pixi frames"></p>

| Look | Engine |
|---|---|
| Text, UI, layouts | HTML/CSS + GSAP |
| Cartoon character | SVG rig · Lottie |
| Particles | Pixi.js |
| 3D, toon 3D | Three.js |
| Premium 3D, physics | Blender (pre-rendered plate) |
| Your live website | Page capture |

Mix them freely in one piece. Rules for keeping each frame a pure function of `t`: [`engines/README.md`](engines/README.md).

## Install

**In Claude Code** (recommended), two commands:

```
/plugin marketplace add murathany7/reel-studio
/plugin install reel-studio@reel-studio
```

Then, in the folder where your videos should live, ask:

> *Set up Reel Studio here*

It copies the renderer into the folder, installs it and checks Chrome and ffmpeg. You need
**Node 18+, Google Chrome and ffmpeg** (`brew install ffmpeg`). Blender is optional, for 3D plates.

**Or clone it** and work inside the repo:

```bash
git clone https://github.com/murathany7/reel-studio && cd reel-studio
cd core && npm install && cd ..
```

## Use

> *Add my product as a new brand: https://my-product.com* → facts, colours, fonts, voice, rules
> *Make a 15 s reel for &lt;brand&gt; about &lt;feature&gt;* → brief and storyboard, then the video once you approve

## What's inside

```
core/          renderer (HTML → MP4/PNG) and the Studio clock
engines/       one adapter per engine
brands/        one folder per brand  (_template to start)
productions/   one folder per piece  (brief, composition, audio, QA, export)
scripts/       audio mix, transcription, QA, frame tools
.claude/skills setup · make-video · new-brand · pick-engine · scene-3d · character-2d · capture-site
```

## Contributing

Open source and early. New engine adapters, brand examples and QA checks are all welcome; open an issue or a PR.

## License

[MIT](LICENSE). Brand folders (logos, copy, product facts) belong to their owners and are included only as examples.
