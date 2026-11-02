/* Pixi.js (v8) 2D WebGL layer, drawn by the Studio clock: particles, sprites, many moving things.
 *
 *   <script type="importmap">{ "imports": { "pixi.js": "/core/node_modules/pixi.js/dist/pixi.mjs" } }</script>
 *   <script type="module">
 *     import { pixiLayer } from "/engines/pixi.js";
 *     const { app, PIXI } = await pixiLayer(document.getElementById("fx"), {
 *       update(t) { star.rotation = t; },   // pose everything for time t
 *     });
 *   </script>
 *
 * As with Three.js, update(t) sets state from t alone. Use Studio.random(seed)
 * for scatter, then compute positions from t (e.g. y = y0 + speed * t).
 */
import * as PIXI from "pixi.js";

export async function pixiLayer(el, { update = () => {}, background = null } = {}) {
  const { width, height } = Studio.meta;
  const app = new PIXI.Application();
  const ready = app.init({
    width, height, autoStart: false, antialias: true, preference: "webgl", resolution: 1,
    backgroundAlpha: background === null ? 0 : 1, background: background ?? 0x000000,
    preserveDrawingBuffer: true,
  });
  Studio.wait(ready);
  await ready;
  app.ticker.stop();
  el.appendChild(app.canvas);
  Studio.onSeek((t) => { update(t); app.renderer.render(app.stage); });
  return { app, PIXI };
}
