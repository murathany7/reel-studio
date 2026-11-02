---
name: scene-3d
description: Build a 3D shot for a video - live in the composition with Three.js (engines/three.js) or as a pre-rendered Blender plate (engines/blender). Covers toon/cartoon looks, product and CAD models, camera moves, physics, and keeping every frame deterministic.
---

# 3D shots

## Three.js (live layer)

- Use `threeLayer(el, { update(t), background, fov })` from `/engines/three.js`. Add an import map for `three`
  (see `examples/engines-demo/index.html`).
- `update(t)` sets every transform from `t`. Camera moves: keyframe with a GSAP tween on a plain object
  (`tl.to(cam, { x: 4, z: 8, duration: 2 }, 3)`) and copy it into `camera.position` in `update`.
- Models: `GLTFLoader` from `three/addons/loaders/GLTFLoader.js` (add `"three/addons/": "/core/node_modules/three/examples/jsm/"`
  to the import map). Wrap the load in `Studio.wait(...)`. Put model files in the brand's `assets/models/` or the production's `composition/`.
- Cartoon look: `toon(color, { steps })` + `outline(mesh, { thickness })`. Hard light: one `DirectionalLight` + low `AmbientLight`.
- Animated GLB clips: create an `AnimationMixer`, then in `update` call `mixer.setTime(t - start)`. Never `mixer.update(delta)`.
- Physics: bake it (simulate at a fixed 1/120 s step into an array before the first frame) and look up by `t`.

## Blender (plate)

- A scene script defines `build(ctx)`; copy `engines/blender/example_scene.py`. `ctx` gives `toon(rgb)`,
  `key(obj, "location", t, value)`, `size`, `fps`, `duration`, `frames`, `scene`.
- Render: `engines/blender/render.sh scene.py composition/plates/<name>.mp4 --size 1080x1920 --duration 4 [--engine EEVEE|CYCLES|WORKBENCH]`.
  Draft at `--size 540x960`, final at full size.
- Backdrop colour: show it to the camera only (Light Path "Is Camera Ray" mix, as in the example), or it lights the
  scene and flattens toon bands.
- Colour management is set to *Standard* so brand hex colours come out as typed.
- Physics and simulations: bake them in the scene script before rendering.
- In the composition: `<video src="plates/<name>.mp4">` + `Studio.video(el, { start })`. Plates have no alpha; put
  text and characters on top with HTML layers.

## Check

Render the key beats as stills and look at them. For Three.js, render one frame twice and compare md5s. Note render
times in the production log.
