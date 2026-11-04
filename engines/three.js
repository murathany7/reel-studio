/* Three.js layer, drawn by the Studio clock (no requestAnimationFrame).
 *
 *   <script type="importmap">{ "imports": { "three": "/core/node_modules/three/build/three.module.js" } }</script>
 *   <script type="module">
 *     import * as THREE from "three";
 *     import { threeLayer, toon, outline, realistic, pbr, emissive, bloom } from "/engines/three.js";
 *     const { scene, camera } = threeLayer(document.getElementById("bg"), {
 *       update(t) { mesh.rotation.y = t * 0.8; },   // pose everything for time t
 *     });
 *   </script>
 *
 * update(t) must set state from t alone (no deltas, no accumulated physics), so
 * any frame can be rendered in any order. For physics, bake the simulation at a
 * fixed step first and look it up by t.
 */
import * as THREE from "three";

export function threeLayer(el, { update = () => {}, fov = 35, background = null, pixelRatio = 1, post = null } = {}) {
  const { width, height } = Studio.meta;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: background === null, preserveDrawingBuffer: true });
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(width, height, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  el.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  if (background !== null) scene.background = new THREE.Color(background);
  const camera = new THREE.PerspectiveCamera(fov, width / height, 0.1, 200);
  camera.position.set(0, 0, 10);

  // post(renderer, scene, camera) → an EffectComposer (see bloom()); it then draws instead of the plain render.
  let composer = null;
  if (post) Studio.wait(Promise.resolve(post(renderer, scene, camera)).then((c) => { composer = c; }));
  Studio.onSeek((t) => { update(t); composer ? composer.render() : renderer.render(scene, camera); });
  return { THREE, renderer, scene, camera };
}

/* Photoreal light: filmic tone mapping, an image-based studio environment for reflections, soft shadows.
 * Call once after threeLayer; then use pbr() materials and a key light with castShadow. */
export async function realistic(renderer, scene, { exposure = 1.0, environment = 0.9, shadows = true } = {}) {
  const { RoomEnvironment } = await import("/core/node_modules/three/examples/jsm/environments/RoomEnvironment.js");
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = exposure;
  renderer.shadowMap.enabled = shadows;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = environment;
  return scene.environment;
}

/* Physically based material: brushed metal, matte plastic, glass-like clearcoat. */
export function pbr(color, { metalness = 0, roughness = 0.45, clearcoat = 0, transmission = 0, ...rest } = {}) {
  return new THREE.MeshPhysicalMaterial({ color, metalness, roughness, clearcoat, transmission, ...rest });
}

/* Glowing tube / sign / screen. Pair with bloom() so it spills light. */
export function emissive(color, intensity = 2.5) {
  return new THREE.MeshStandardMaterial({ color: 0x000000, emissive: color, emissiveIntensity: intensity });
}

/* Bloom post pass for neon and highlights: threeLayer(el, { post: bloom({ strength: 1.2 }) }). Deterministic (GPU only). */
export function bloom({ strength = 1.1, radius = 0.6, threshold = 0.15 } = {}) {
  return async (renderer, scene, camera) => {
    const base = "/core/node_modules/three/examples/jsm/postprocessing/";
    const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all(
      ["EffectComposer", "RenderPass", "UnrealBloomPass", "OutputPass"].map((m) => import(`${base}${m}.js`)));
    const { width, height } = Studio.meta;
    const composer = new EffectComposer(renderer);
    composer.setPixelRatio(renderer.getPixelRatio());
    composer.setSize(width, height);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(width, height), strength, radius, threshold));
    composer.addPass(new OutputPass());
    return composer;
  };
}

/* Cartoon look: hard-stepped shading (`steps` bands) instead of smooth light. */
export function toon(color, { steps = 3 } = {}) {
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) data[i] = Math.round(((i + 1) / steps) * 255);
  const ramp = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  ramp.minFilter = ramp.magFilter = THREE.NearestFilter;
  ramp.needsUpdate = true;
  return new THREE.MeshToonMaterial({ color, gradientMap: ramp });
}

/* Cartoon ink line: an inverted-hull copy of the mesh, slightly larger, back faces only. */
export function outline(mesh, { color = 0x111111, thickness = 0.04 } = {}) {
  const hull = new THREE.Mesh(mesh.geometry, new THREE.MeshBasicMaterial({ color, side: THREE.BackSide }));
  hull.scale.setScalar(1 + thickness);
  mesh.add(hull);
  return hull;
}
