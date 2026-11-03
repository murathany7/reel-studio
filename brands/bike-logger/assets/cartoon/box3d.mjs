/* Bike Logger 3D box scene (Three.js, toon + ink outline): the IP65 enclosure at its real proportions
 * (200 × 120 × 75 mm), the lid opens, the camera pushes in on the Raspberry Pi 5 with its cooler spinning,
 * the GPS puck sits on the lid and the camera module looks out of the back wall. Every pose comes from t.
 *   import { registerBox3d } from "/brands/bike-logger/assets/cartoon/box3d.mjs"; registerBox3d();
 *   scene: { type: "box3d", dur, beats, openAt } */
import * as THREE from "three";
import { threeLayer, toon, outline } from "/engines/three.js";

export function registerBox3d() {
  const AK = window.AdKit;
  AK.scene("box3d", (c, s, t0, t1, layer) => {
    const host = c.el(layer, "div", "layer");
    const A = c.style === "adult";
    const openAt = t0 + (s.openAt ?? 1.8);
    const mat = (hex) => toon(hex, { steps: A ? 4 : 3 });
    const ink = (m, th = 0.025) => (outline(m, { color: A ? 0xeceae4 : 0x06080a, thickness: th }), m);
    const box = (w, h, d, hex, th) => ink(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(hex)), th);
    const at = (m, x, y, z) => (m.position.set(x, y, z), m);

    const root = new THREE.Group();
    // enclosure: bottom + four walls (open, so the inside can be seen), 4 × 1.5 × 2.4 units
    const G = A ? 0x30353c : 0x3a4048, wt = 0.12;
    root.add(at(box(4, wt, 2.4, G), 0, wt / 2, 0));
    root.add(at(box(4, 1.5, wt, G), 0, 0.75, -1.2 + wt / 2), at(box(4, 1.5, wt, G), 0, 0.75, 1.2 - wt / 2));
    root.add(at(box(wt, 1.5, 2.4, G), -2 + wt / 2, 0.75, 0), at(box(wt, 1.5, 2.4, G), 2 - wt / 2, 0.75, 0));
    // Raspberry Pi 5 on standoffs
    const pi = new THREE.Group();
    pi.add(box(2.1, 0.07, 1.4, A ? 0x2a6e4c : 0x2f8f5b, 0.015));
    pi.add(at(box(0.95, 0.22, 0.85, 0x15191e, 0.02), -0.35, 0.15, 0.05));                  // cooler
    const fan = new THREE.Group();
    for (let i = 0; i < 6; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.02, 0.09), mat(0x868d95)); b.position.x = 0.19; const g = new THREE.Group(); g.rotation.y = (i / 6) * Math.PI * 2; g.add(b); fan.add(g); }
    fan.add(new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.04, 16), mat(0xb9bec4)));
    pi.add(at(fan, -0.35, 0.28, 0.05));
    pi.add(at(box(1.5, 0.09, 0.14, 0x15191e, 0.01), -0.05, 0.08, -0.6));                  // GPIO header
    for (let i = 0; i < 20; i++) pi.add(at(new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.06, 0.035), mat(0xe2b45f)), -0.75 + i * 0.075, 0.15, -0.6));
    pi.add(at(box(0.36, 0.22, 0.42, 0xc3c8ce, 0.015), 0.92, 0.14, -0.33), at(box(0.36, 0.22, 0.42, 0xc3c8ce, 0.015), 0.92, 0.14, 0.15));   // USB
    pi.add(at(box(0.4, 0.26, 0.36, 0xc3c8ce, 0.015), 0.9, 0.16, 0.5));                    // Ethernet
    root.add(at(pi, -0.4, 0.78, 0));   // on its tray, near the rim
    // camera module on the back wall, lens through a sealed window
    const cam = new THREE.Group();
    cam.add(box(0.5, 0.5, 0.05, A ? 0x2a6e4c : 0x2f8f5b, 0.015));
    cam.add(at(new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.16, 24), mat(0x0b0e11)), 0, 0, 0.1).rotateX(Math.PI / 2));
    root.add(at(cam, 1.45, 0.75, 1.2 - wt - 0.06));
    // lid on a hinge along the back edge; GPS puck on top
    const hinge = at(new THREE.Group(), 0, 1.5, -1.2);
    const lid = at(box(4.1, 0.2, 2.5, A ? 0x454c55 : 0x4f5660), 0, 0.1, 1.25);
    const gps = at(ink(new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.46, 0.18, 32), mat(0x2a3038)), 0.02), 0.9, 0.29, 1.0);
    hinge.add(lid, gps); root.add(hinge);
    // warm light from inside once open
    const glow = new THREE.PointLight(0xffc46e, 0, 6); glow.position.set(0, 1.2, 0); root.add(glow);

    const { scene, camera, renderer } = threeLayer(host, {
      fov: 30,
      update(t) {
        const k = Math.max(0, t - t0), d = t1 - t0;
        const o = Math.min(1, Math.max(0, (t - openAt) / 1.1)), e = o * o * (3 - 2 * o);
        hinge.rotation.x = -e * 1.95;
        glow.intensity = e * 6;
        fan.rotation.y = -k * (4 + Math.min(1, k / 1.5) * 10);
        // camera: slow orbit, push in on the Pi after the lid opens, pull back at the end
        const push = Math.min(1, Math.max(0, (t - openAt - 0.6) / 2.2)), pull = Math.min(1, Math.max(0, (t - (t1 - 2.4)) / 2.2));
        const ease = (x) => x * x * (3 - 2 * x);
        // high, from the front, looking down into the box; push in from above, then pull back
        const dist = 12.5 - ease(push) * 3.4 + ease(pull) * 2.8, ang = -0.55 + k * 0.1, h = 9.5 - ease(push) * 1.0 + ease(pull) * 0.8;
        camera.position.set(Math.sin(ang) * dist, h, Math.cos(ang) * dist);
        camera.lookAt(-0.3 * ease(push) * (1 - pull), 0.6, 0.1);
      },
    });
    scene.add(root);
    const sun = new THREE.DirectionalLight(0xffffff, 2.6); sun.position.set(4, 9, 6); scene.add(sun);
    scene.add(new THREE.AmbientLight(0xffffff, 0.55));
    // frame the model on the stage region (below the text in portrait, right of it in landscape)
    const cy = (c.R.stageTop + c.R.stageBottom) / 2;
    camera.setViewOffset(c.W, c.H, c.W / 2 - c.R.cx, c.H / 2 - cy, c.W, c.H);
    if (s.beats) c.beats(layer, s.beats, t0, t1);
  }, { dur: 9 });
}
