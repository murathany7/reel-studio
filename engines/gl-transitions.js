/* Pixel transitions between two layers that have pixels: Three.js or Pixi canvases, video plates, images.
 * For DOM layers (text, SVG, HTML), use Studio.transition (wipes, pushes, iris…) in the runtime instead.
 *
 *   <div class="layer" id="a"> … a Three.js canvas … </div>
 *   <div class="layer" id="b"><video id="plate" src="plates/b.mp4"></video></div>
 *   <div class="layer" id="fx"></div>                 <!-- above both: the transition draws here -->
 *   <script type="module">
 *     import { glTransition } from "/engines/gl-transitions.js";
 *     glTransition(document.getElementById("fx"), { from: "#a", to: "#b", at: 2, duration: 0.6, effect: "ripple" });
 *   </script>
 *
 * effect: "fade", "dissolve", "wipe", "zoom", "ripple", "glitch", "pixelate".
 * Before `at` only `from` shows and after `at + duration` only `to` (as Studio.swap). In between, this layer shows
 * the mix and hides nothing: layers above it (text) stay on top. Sources are read after every other layer has
 * drawn (a late Studio.onSeek hook), each fitted like object-fit: cover. Everything comes from t (and `seed`).
 */
const VERT = `attribute vec2 pos; varying vec2 uv;
void main() { uv = pos * 0.5 + 0.5; gl_Position = vec4(pos, 0.0, 1.0); }`;

const HEAD = `precision highp float;
varying vec2 uv;
uniform sampler2D ta, tb;
uniform vec4 ca, cb;      // cover fit: scale.xy, offset.xy
uniform float p, seed;
uniform vec2 res;
vec4 A(vec2 q) { return texture2D(ta, clamp(q * ca.xy + ca.zw, 0.0, 1.0)); }
vec4 B(vec2 q) { return texture2D(tb, clamp(q * cb.xy + cb.zw, 0.0, 1.0)); }
float hash(vec2 q) { return fract(sin(dot(q + seed, vec2(12.9898, 78.233))) * 43758.5453); }
float noise(vec2 q) {
  vec2 i = floor(q), f = fract(q); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
}
`;

const EFFECTS = {
  fade: `void main() { gl_FragColor = mix(A(uv), B(uv), p); }`,
  // Soft-edged noise dissolve
  dissolve: `void main() {
    float n = noise(uv * res / 90.0) * 0.7 + noise(uv * res / 18.0) * 0.3;
    gl_FragColor = mix(A(uv), B(uv), smoothstep(n - 0.08, n + 0.08, p * 1.16 - 0.08));
  }`,
  // Diagonal wipe with a soft edge, left to right
  wipe: `void main() {
    float d = dot(uv - 0.5, normalize(vec2(1.0, 0.35))) + 0.5;
    gl_FragColor = mix(A(uv), B(uv), 1.0 - smoothstep(p * 1.3 - 0.15, p * 1.3, d));
  }`,
  // Radial zoom blur through the cut
  zoom: `void main() {
    vec2 c = uv - 0.5; float k = sin(p * 3.14159);
    vec4 a = vec4(0.0), b = vec4(0.0);
    for (int i = 0; i < 16; i++) {
      float s = float(i) / 15.0 * 0.18 * k;
      a += A(0.5 + c * (1.0 - p * 0.4) * (1.0 - s));
      b += B(0.5 + c * (1.25 - p * 0.25) * (1.0 - s));
    }
    gl_FragColor = mix(a / 16.0, b / 16.0, smoothstep(0.35, 0.65, p));
  }`,
  // Water ripple from the centre
  ripple: `void main() {
    vec2 c = (uv - 0.5) * vec2(res.x / res.y, 1.0); float d = length(c);
    float amp = sin(p * 3.14159) * 0.035;
    vec2 q = uv + normalize(c + 1e-5) * sin(d * 38.0 - p * 22.0) * amp;
    gl_FragColor = mix(A(q), B(q), smoothstep(0.25, 0.75, p));
  }`,
  // RGB split and slice jitter, hard switch in the middle
  glitch: `void main() {
    float k = sin(p * 3.14159), slice = floor(uv.y * 24.0), st = floor(p * 14.0);
    float j = (hash(vec2(slice, st)) - 0.5) * 0.18 * k * step(0.55, hash(vec2(st, slice * 0.37)));
    vec2 q = uv + vec2(j, 0.0); float s = 0.012 * k;
    vec4 x = p < 0.5 ? vec4(A(q + vec2(s, 0)).r, A(q).g, A(q - vec2(s, 0)).b, 1.0)
                     : vec4(B(q + vec2(s, 0)).r, B(q).g, B(q - vec2(s, 0)).b, 1.0);
    gl_FragColor = x;
  }`,
  // Pixels grow, switch, shrink
  pixelate: `void main() {
    float k = 1.0 - abs(2.0 * p - 1.0); float cell = mix(1.0, 70.0, k * k);
    vec2 q = (floor(uv * res / cell) + 0.5) * cell / res;
    gl_FragColor = p < 0.5 ? A(q) : B(q);
  }`,
};

const $ = (x) => (typeof x === "string" ? document.querySelector(x) : x);

export function glTransition(el, { from, to, at, duration = 0.6, effect = "dissolve", ease = "power2.inOut", seed = 1 } = {}) {
  if (!EFFECTS[effect]) throw new Error(`Unknown GL transition "${effect}" (${Object.keys(EFFECTS).join(", ")})`);
  if (typeof at !== "number") throw new Error("glTransition needs `at` (seconds)");
  from = $(from); to = $(to);
  const { width, height } = Studio.meta;
  const canvas = document.createElement("canvas");
  canvas.width = width; canvas.height = height;
  el.appendChild(canvas);
  const gl = canvas.getContext("webgl", { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: false });

  const shader = (type, src) => {
    const s = gl.createShader(type);
    gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(`GL transition "${effect}": ${gl.getShaderInfoLog(s)}`);
    return s;
  };
  const prog = gl.createProgram();
  gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
  gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, HEAD + EFFECTS[effect]));
  gl.linkProgram(prog);
  gl.useProgram(prog);
  gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const pos = gl.getAttribLocation(prog, "pos");
  gl.enableVertexAttribArray(pos);
  gl.vertexAttribPointer(pos, 2, gl.FLOAT, false, 0, 0);
  const u = (n) => gl.getUniformLocation(prog, n);
  const tex = [0, 1].map((i) => {
    const t = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0 + i);
    gl.bindTexture(gl.TEXTURE_2D, t);
    for (const [k, v] of [[gl.TEXTURE_MIN_FILTER, gl.LINEAR], [gl.TEXTURE_MAG_FILTER, gl.LINEAR],
      [gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE], [gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE]]) gl.texParameteri(gl.TEXTURE_2D, k, v);
    return t;
  });
  gl.uniform1i(u("ta"), 0); gl.uniform1i(u("tb"), 1);
  gl.uniform2f(u("res"), width, height);
  gl.uniform1f(u("seed"), seed);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);

  // object-fit: cover of a source into the stage, as uv scale and offset
  const cover = (src) => {
    const w = src.videoWidth || src.naturalWidth || src.width, h = src.videoHeight || src.naturalHeight || src.height;
    const r = (w / h) / (width / height);
    return r > 1 ? [1 / r, 1, (1 - 1 / r) / 2, 0] : [1, r, 0, (1 - r) / 2];
  };
  const curve = gsap.parseEase(ease);
  Studio.swap(from, to, at, at + duration);
  Studio.onSeek((t) => {
    const raw = (t - at) / duration;
    const on = raw >= 0 && raw < 1;
    el.classList.toggle("st-off", !on);
    if (!on) return;
    for (const [i, layer, name] of [[0, from, "ca"], [1, to, "cb"]]) {
      const src = Studio.pixels(layer);
      if (!src) throw new Error("glTransition: a source layer has no canvas, img or video to read");
      gl.activeTexture(gl.TEXTURE0 + i);
      gl.bindTexture(gl.TEXTURE_2D, tex[i]);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, src);
      gl.uniform4f(u(name), ...cover(src));
    }
    gl.uniform1f(u("p"), curve(raw));
    gl.viewport(0, 0, width, height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, { late: true });
  return { canvas, effects: Object.keys(EFFECTS) };
}

export const GL_EFFECTS = Object.keys(EFFECTS);
