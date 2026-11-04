/* Motion blur: average the PNG screenshots of one frame's subframes into one PNG.
 *
 * The average is taken in linear light (sRGB decoded, summed, encoded again), as a camera shutter would, so a
 * bright edge moving over a dark one blurs without the dark fringe a plain average of sRGB values leaves. Integer
 * maths only: the same subframes always give the same bytes.
 *
 * Reads 8-bit, non-interlaced RGB or RGBA PNGs (what Chrome's screenshots are); no dependencies.
 */
import { inflateSync, deflateSync } from "node:zlib";

const SIG = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
// zlib.crc32 needs Node 22; the kit supports 18+
const CRC = new Uint32Array(256).map((_, n) => {
  for (let k = 0; k < 8; k++) n = n & 1 ? 0xedb88320 ^ (n >>> 1) : n >>> 1;
  return n;
});
const crc32 = (buf, crc = 0) => {
  crc ^= 0xffffffff;
  for (const b of buf) crc = CRC[(crc ^ b) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
};

// sRGB 8-bit → linear 16-bit, and back (exact to the nearest 8-bit code)
const TO_LIN = new Uint16Array(256);
for (let c = 0; c < 256; c++) {
  const s = c / 255;
  TO_LIN[c] = Math.round((s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4) * 65535);
}
const TO_SRGB = new Uint8Array(65536);
for (let c = 0, v = 0; v < 65536; v++) {
  // smallest c whose linear value is nearest to v
  while (c < 255 && Math.abs(TO_LIN[c + 1] - v) <= Math.abs(TO_LIN[c] - v)) c++;
  TO_SRGB[v] = c;
}

export function decode(buf) {
  if (!buf.subarray(0, 8).equals(SIG)) throw new Error("blend: not a PNG");
  let width, height, channels, idat = [];
  for (let o = 8; o < buf.length;) {
    const len = buf.readUInt32BE(o), type = buf.toString("latin1", o + 4, o + 8), body = buf.subarray(o + 8, o + 8 + len);
    if (type === "IHDR") {
      width = body.readUInt32BE(0); height = body.readUInt32BE(4);
      const [depth, color, , , interlace] = body.subarray(8, 13);
      if (depth !== 8 || interlace !== 0 || (color !== 2 && color !== 6)) {
        throw new Error(`blend: unsupported PNG (depth ${depth}, colour type ${color}, interlace ${interlace})`);
      }
      channels = color === 6 ? 4 : 3;
    } else if (type === "IDAT") idat.push(body);
    else if (type === "IEND") break;
    o += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels, out = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y++) {
    const f = raw[y * (stride + 1)], src = y * (stride + 1) + 1, row = y * stride, up = row - stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= channels ? out[row + x - channels] : 0;
      const b = y > 0 ? out[up + x] : 0;
      const c = x >= channels && y > 0 ? out[up + x - channels] : 0;
      let p = raw[src + x];
      if (f === 1) p += a;
      else if (f === 2) p += b;
      else if (f === 3) p += (a + b) >> 1;
      else if (f === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        p += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      out[row + x] = p;
    }
  }
  return { width, height, channels, data: out };
}

function chunk(type, body) {
  const head = Buffer.alloc(8);
  head.writeUInt32BE(body.length, 0);
  head.write(type, 4, "latin1");
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body, crc32(Buffer.from(type, "latin1"))) >>> 0);
  return Buffer.concat([head, body, crc]);
}

export function encode({ width, height, channels, data }) {
  const stride = width * channels, raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    // filter "Up": cheap, and compresses gradients well
    const dst = y * (stride + 1), row = y * stride;
    raw[dst] = 2;
    for (let x = 0; x < stride; x++) raw[dst + 1 + x] = data[row + x] - (y > 0 ? data[row - stride + x] : 0);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0); ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = channels === 4 ? 6 : 2;
  return Buffer.concat([SIG, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw, { level: 3 })), chunk("IEND", Buffer.alloc(0))]);
}

/** Average PNG buffers (same size) into one PNG buffer. */
export function blend(pngs) {
  if (pngs.length === 1) return pngs[0];
  const first = decode(pngs[0]);
  const { width, height, channels } = first;
  const n = pngs.length, len = width * height * channels, sum = new Uint32Array(len);
  for (let k = 0; k < n; k++) {
    // one decoded subframe in memory at a time
    const m = k ? decode(pngs[k]) : first, data = m.data;
    if (m.width !== width || m.height !== height || m.channels !== channels) throw new Error("blend: subframes differ in size");
    if (channels === 3) for (let i = 0; i < len; i++) sum[i] += TO_LIN[data[i]];
    else for (let i = 0; i < len; i++) sum[i] += (i & 3) === 3 ? data[i] * 257 : TO_LIN[data[i]];
  }
  const out = Buffer.alloc(len), half = n >> 1;
  for (let i = 0; i < len; i++) {
    const v = Math.floor((sum[i] + half) / n);
    out[i] = channels === 4 && i % 4 === 3 ? Math.round(v / 257) : TO_SRGB[v];
  }
  return encode({ width, height, channels, data: out });
}
