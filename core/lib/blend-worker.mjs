// Runs blend() off the main thread so render pages don't wait on each other's motion blur (core/render.mjs).
import { parentPort } from "node:worker_threads";
import { blend } from "./blend.mjs";

parentPort.on("message", ({ id, pngs }) => {
  try {
    parentPort.postMessage({ id, out: blend(pngs.map((p) => Buffer.from(p.buffer, p.byteOffset, p.byteLength))) });
  } catch (e) {
    parentPort.postMessage({ id, error: String(e.message || e) });
  }
});
