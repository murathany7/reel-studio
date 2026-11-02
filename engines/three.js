/* Three.js layer, drawn by the Studio clock (no requestAnimationFrame).
 *
 *   <script type="importmap">{ "imports": { "three": "/core/node_modules/three/build/three.module.js" } }</script>
 *   <script type="module">
 *     import * as THREE from "three";
 *     import { threeLayer, toon, outline } from "/engines/three.js";
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

export function threeLayer(el, { update = () => {}, fov = 35, background = null, pixelRatio = 1 } = {}) {
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

  Studio.onSeek((t) => { update(t); renderer.render(scene, camera); });
  return { THREE, renderer, scene, camera };
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
