/* Rive layer (a designer's .riv file), drawn by the Studio clock with Rive's low-level web runtime.
 *
 *   <script type="module">
 *     import { riveLayer } from "/engines/rive.js";
 *     await riveLayer(document.getElementById("mascot"), "/brands/acme/assets/mascot.riv", {
 *       animation: "idle", start: 0, loop: true,            // a timeline: pose = time, nothing carried over
 *     });
 *     await riveLayer(el, "/brands/acme/assets/mascot.riv", {
 *       stateMachine: "State Machine 1",                    // a state machine: stepped from 0 at the frame rate
 *       inputs: [{ at: 1.2, name: "wave" }, { at: 2, name: "mood", value: 2 }],  // trigger, number or boolean
 *     });
 *   </script>
 *
 * Timelines are posed directly from t (instance.time), so any frame renders the same in any order. A state
 * machine has state, so it is stepped from 0 in fixed steps of 1/fps; seeking forward on the same grid continues
 * the same steps, seeking back starts again from 0. Either way frame n is the same whatever order frames come in.
 * fit: "contain", "cover", "fill", "fitWidth", "fitHeight", "none", "scaleDown"; alignment: "center", "topCenter"…
 * Needs npm install in core/ (@rive-app/canvas-advanced).
 */
import RiveCanvas from "/core/node_modules/@rive-app/canvas-advanced/canvas_advanced.mjs";

let runtime;
// The module asks for canvas_advanced.wasm; the package ships it as rive.wasm
const rive = () => (runtime ??= RiveCanvas({
  locateFile: (f) => `/core/node_modules/@rive-app/canvas-advanced/${f.endsWith(".wasm") ? "rive.wasm" : f}`,
}));

export async function riveLayer(el, src, { artboard: boardName, animation, stateMachine, start = 0, speed = 1,
  loop = true, fit = "contain", alignment = "center", inputs = [] } = {}) {
  const ready = (async () => {
    const r = await rive();
    const res = await fetch(src);
    if (!res.ok) throw new Error(`Rive file failed to load: ${src} (${res.status})`);
    return { r, file: await r.load(new Uint8Array(await res.arrayBuffer())) };
  })();
  Studio.wait(ready);
  const { r, file } = await ready;
  const { width, height, fps } = Studio.meta;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  el.appendChild(canvas);
  const renderer = r.makeRenderer(canvas);
  const frame = { minX: 0, minY: 0, maxX: width, maxY: height };
  const dt = 1 / fps;

  let board, inst, sm, dur = 0, steps = 0;
  const make = () => {
    inst?.delete(); sm?.delete(); board?.delete();
    board = boardName ? file.artboardByName(boardName) : file.defaultArtboard();
    if (!board) throw new Error(`Rive: no artboard "${boardName}" in ${src}`);
    if (stateMachine) {
      const def = typeof stateMachine === "number" ? board.stateMachineByIndex(stateMachine) : board.stateMachineByName(stateMachine);
      if (!def) throw new Error(`Rive: no state machine "${stateMachine}" in ${src}`);
      sm = new r.StateMachineInstance(def, board);
    } else {
      const def = animation === undefined || typeof animation === "number"
        ? board.animationByIndex(animation ?? 0) : board.animationByName(animation);
      if (!def) throw new Error(`Rive: no animation "${animation}" in ${src}`);
      inst = new r.LinearAnimationInstance(def, board);
      dur = def.duration / def.fps;  // frames / fps (the instance's own duration getter is empty)
    }
    steps = 0;
  };
  make();
  const input = (name) => {
    for (let i = 0; i < sm.inputCount(); i++) if (sm.input(i).name === name) return sm.input(i);
    throw new Error(`Rive: no input "${name}" in state machine "${stateMachine}"`);
  };
  const setInput = ({ name, value }) => {
    const x = input(name);
    if (value === undefined) x.asTrigger().fire();
    else if (typeof value === "boolean") x.asBool().value = value;
    else x.asNumber().value = value;
  };

  Studio.onSeek((t) => {
    const local = Math.max(0, (t - start) * speed);
    if (sm) {
      const target = Math.round(local / dt);
      if (target < steps) make();
      for (; steps < target; steps++) {
        for (const i of inputs) if (i.at - start >= steps * dt && i.at - start < (steps + 1) * dt) setInput(i);
        sm.advance(dt);
        board.advance(dt);
      }
    } else {
      inst.time = loop && dur > 0 ? local % dur : Math.min(local, dur);
      inst.apply(1);
      board.advance(0);
    }
    renderer.clear();
    renderer.save();
    renderer.align(r.Fit[fit], r.Alignment[alignment], frame, board.bounds);
    board.draw(renderer);
    renderer.restore();
    renderer.flush?.();
    r.resolveAnimationFrame();
  });
  return { canvas, file, get artboard() { return board; } };
}
