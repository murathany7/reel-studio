# Launch posts (drafts)

Attach: the Bike Logger MP4 from the v0.1.0 release, and the engines demo.
Repo: https://github.com/murathany7/reel-studio

---

## X / Threads (thread)

**1/**
Agency-quality reels, made by Claude Code. Free and open source: your Claude subscription does the rest.

I asked it for a reel about my side project.

It read my site, wrote a storyboard, waited for my OK, recorded the site's own 3D scene frame by frame, put the copy on top, checked every frame and gave me this. 👇

[video: Bike Logger reel]

**2/**
It's called Reel Studio, and it's open source.

Every video is a plain HTML page on one clock. GSAP, SVG characters, Pixi, Three.js, Blender plates and captures of your live site all draw at time t. Headless Chrome screenshots each frame, ffmpeg encodes.

**3/**
Because each frame depends only on t, rendering a frame twice gives the same pixels. So Claude can check its own work frame by frame: safe zones, jumps, black frames, loudness.

[image: QA contact sheet]

**4/**
One folder per brand (facts + sources, colours, fonts, voice, rules), so it never makes up a product claim.

Install in Claude Code:
/plugin marketplace add murathany7/reel-studio

or: npx reel-studio init · pipx install reel-studio · brew install murathany7/reel-studio/reel-studio

No editor, no timeline, no per-video fees.

github.com/murathany7/reel-studio

---

## Show HN

**Title:** Show HN: Reel Studio – marketing videos as HTML pages, rendered frame by frame by Claude Code

**Text:**
I make small products and never have time to make videos for them. Reel Studio is the kit I built so Claude Code can do it.

A video is one HTML page with a single clock. Each engine draws its layer at time t: GSAP for text, an SVG rig for cartoon characters, Pixi for particles, Three.js for 3D, plus pre-rendered Blender plates or a frame-exact capture of your own live site. A small Node renderer seeks Chrome to each frame, screenshots it and pipes the PNGs into ffmpeg.

Since every frame is a pure function of t, any frame can be re-rendered alone, and two renders give the same md5. That makes QA automatic: safe-zone contact sheets, a motion check that flags jumps and frozen frames, loudness.

The workflow is in Claude Code skills: brief → storyboard → you approve → build → frame QA → a delivered folder that documents how it was made. Brand facts live in one folder with their sources, so the agent doesn't invent claims.

Example: a 28 s reel for a bike-logger robotics kit, made by capturing the product's own 3D web page.

MIT, and there are no per-video fees: it runs on the Claude Code you already have. Install as a Claude Code plugin, `npx reel-studio init`, `pipx install reel-studio` or `brew install murathany7/reel-studio/reel-studio`. Feedback on the engine model very welcome.

https://github.com/murathany7/reel-studio

---

## Reddit (r/ClaudeAI, r/ClaudeCode)

**Title:** Agency-quality marketing reels with just your Claude subscription: Claude Code storyboards, renders and frame-checks them (free, open source)

**Body:**
Reel Studio is a set of Claude Code skills plus a small renderer. You say "make a 15 s reel for <brand> about <feature>", and Claude:

1. writes a brief and a storyboard, and waits for your yes
2. builds the video as one HTML page (GSAP / SVG characters / Pixi / Three.js / Blender / a capture of your live site, all on one clock)
3. renders it frame by frame in headless Chrome → MP4
4. runs QA on the frames (safe zones, jumps, frozen frames, loudness) and fixes what fails
5. delivers a folder with the video and how it was made

The example in the repo is a 28 s reel for my bike-logger robotics kit, made from the product's own 3D web page.

No editor, no timeline, no per-video fees. (AI voiceover through ElevenLabs is optional and billed by ElevenLabs.)

Install: `/plugin marketplace add murathany7/reel-studio` then `/plugin install reel-studio@reel-studio`, or `npx reel-studio init`, `pipx install reel-studio`, `brew install murathany7/reel-studio/reel-studio`.

Repo (MIT): https://github.com/murathany7/reel-studio

Would love feedback, and brand examples if you try it.

---

## LinkedIn

Agency-quality marketing reels, with no agency and no per-video fees.

I open-sourced Reel Studio: a kit that lets Claude Code make marketing videos with code, on the Claude subscription you already have.

You give it a brand and a brief. It writes the storyboard, waits for your approval, builds the video as an HTML page, renders every frame, checks them and delivers the MP4.

Here's the first one, a 28-second reel for my Bike Logger robotics kit, built from the product's own 3D web page. 👇

Free and MIT licensed: github.com/murathany7/reel-studio

#opensource #claudecode #marketing #video

---

## Places to submit (each needs your OK or your account)

- npm, PyPI and Homebrew: 0.2.1 published 2026-11-03. Release steps: `packaging/README.md`
- awesome-claude-code style lists on GitHub: one PR adding a line
- Anthropic's plugin directory: submit from the docs' "Submit to Anthropic's directory" page
- Product Hunt: later, once there are 2–3 brand examples
