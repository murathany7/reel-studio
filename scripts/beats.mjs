#!/usr/bin/env node
/* Find the beat grid of a music track, for cutting on the beat (Studio.beats in core/lib/runtime.js).
 *
 *   node scripts/beats.mjs <music.(mp3|wav|m4a…)> <beats.json> [--bpm 128] [--min 70] [--max 180] [--bar 4]
 *
 * Writes { source, duration, bpm, offset, beatsPerBar, beats: [s…], downbeats: [s…], onsets: [s…] }.
 *   beats      a steady grid (reel music rarely drifts): the tempo from the autocorrelation of a spectral-flux
 *              onset curve, the phase where the grid lands on the most onset energy
 *   downbeats  every beatsPerBar-th beat, starting at the beat with the most low-end energy (the kick)
 *   onsets     individual hits (drums, note starts), for accents that are not on the grid
 * --bpm fixes the tempo when it is known (only the phase is searched). Times are seconds from the start of the
 * file; give the music's "start" from audio/cues.json to Studio.beats(..., { offset }).
 * Needs ffmpeg. No other dependencies.
 */
import { spawn } from "node:child_process";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const [input, output, ...rest] = process.argv.slice(2);
if (!input || !output) {
  console.error("usage: beats.mjs <music> <beats.json> [--bpm N] [--min 70] [--max 180] [--bar 4]");
  process.exit(2);
}
const opt = {};
for (let i = 0; i < rest.length; i += 2) opt[rest[i].replace(/^--/, "")] = Number(rest[i + 1]);
const SR = 22050, WIN = 1024, HOP = 256, FPS = SR / HOP;
const minBpm = opt.min || 70, maxBpm = opt.max || 180, perBar = opt.bar || 4;

function decode(file) {
  return new Promise((res, rej) => {
    const p = spawn("ffmpeg", ["-v", "error", "-i", file, "-ac", "1", "-ar", String(SR), "-f", "f32le", "-"]);
    const chunks = [];
    let err = "";
    p.stdout.on("data", (d) => chunks.push(d));
    p.stderr.on("data", (d) => (err += d));
    p.on("error", rej);
    p.on("close", (c) => {
      if (c !== 0) return rej(new Error(`ffmpeg could not decode ${file}: ${err.trim()}`));
      const b = Buffer.concat(chunks);
      res(new Float32Array(b.buffer, b.byteOffset, b.length / 4));
    });
  });
}

// In-place radix-2 FFT (re, im of length WIN)
function fft(re, im) {
  const n = re.length;
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1;
    for (; j & bit; bit >>= 1) j ^= bit;
    j ^= bit;
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len, wr = Math.cos(a), wi = Math.sin(a);
    for (let i = 0; i < n; i += len) {
      let cr = 1, ci = 0;
      for (let k = 0; k < len / 2; k++) {
        const ur = re[i + k], ui = im[i + k];
        const vr = re[i + k + len / 2] * cr - im[i + k + len / 2] * ci;
        const vi = re[i + k + len / 2] * ci + im[i + k + len / 2] * cr;
        re[i + k] = ur + vr; im[i + k] = ui + vi;
        re[i + k + len / 2] = ur - vr; im[i + k + len / 2] = ui - vi;
        [cr, ci] = [cr * wr - ci * wi, cr * wi + ci * wr];
      }
    }
  }
}

// Spectral flux of log magnitudes: all bins, and the low end (< 150 Hz) for downbeats
function onsetCurves(x) {
  const frames = Math.max(0, Math.floor((x.length - WIN) / HOP) + 1);
  const all = new Float32Array(frames), low = new Float32Array(frames);
  const hann = Float32Array.from({ length: WIN }, (_, i) => 0.5 - 0.5 * Math.cos((2 * Math.PI * i) / WIN));
  const lowBins = Math.round((150 * WIN) / SR);
  let prev = new Float32Array(WIN / 2);
  const re = new Float32Array(WIN), im = new Float32Array(WIN);
  for (let f = 0; f < frames; f++) {
    for (let i = 0; i < WIN; i++) { re[i] = x[f * HOP + i] * hann[i]; im[i] = 0; }
    fft(re, im);
    const mag = new Float32Array(WIN / 2);
    let a = 0, l = 0;
    for (let k = 1; k < WIN / 2; k++) {
      mag[k] = Math.log1p(100 * Math.hypot(re[k], im[k]));
      const d = mag[k] - prev[k];
      if (d > 0) { a += d; if (k <= lowBins) l += d; }
    }
    all[f] = a; low[f] = l;
    prev = mag;
  }
  // Keep what rises above the local mean (~0.2 s), so loud passages don't swamp the curve
  const w = Math.round(FPS * 0.1);
  const flat = (c) => c.map((v, i) => {
    let s = 0, n = 0;
    for (let j = Math.max(0, i - w); j <= Math.min(c.length - 1, i + w); j++) { s += c[j]; n++; }
    return Math.max(0, v - s / n);
  });
  return { all: flat(all), low: flat(low) };
}

const at = (c, pos) => {
  const i = Math.floor(pos), k = pos - i;
  return i + 1 < c.length ? c[i] * (1 - k) + c[i + 1] * k : 0;
};

// Tempo: autocorrelation over the allowed range, weighted towards ~120 BPM to avoid half/double-time picks
function tempo(c) {
  const lo = Math.floor((60 / maxBpm) * FPS), hi = Math.ceil((60 / minBpm) * FPS);
  const ac = new Float32Array(hi + 2);
  for (let lag = lo - 1; lag <= hi + 1; lag++) {
    let s = 0;
    for (let i = 0; i + lag < c.length; i++) s += c[i] * c[i + lag];
    ac[lag] = s / (c.length - lag);
  }
  let best = lo, score = -1;
  for (let lag = lo; lag <= hi; lag++) {
    const bpm = (60 * FPS) / lag;
    const w = Math.exp(-0.5 * (Math.log2(bpm / 120) / 0.9) ** 2);
    if (ac[lag] * w > score) { score = ac[lag] * w; best = lag; }
  }
  // Parabolic interpolation for a fractional period
  const [a, b, d] = [ac[best - 1], ac[best], ac[best + 1]];
  const shift = a - 2 * b + d === 0 ? 0 : (0.5 * (a - d)) / (a - 2 * b + d);
  return best + Math.max(-0.5, Math.min(0.5, shift));
}

const x = await decode(input);
const duration = x.length / SR;
const { all, low } = onsetCurves(x);
if (all.length < FPS * 2) throw new Error("Track too short to find a tempo (needs 2 s or more)");
const period = opt.bpm ? (60 / opt.bpm) * FPS : tempo(all);

// Phase: where a grid of this period collects the most onset energy, the low end (kick) counting most: off-beat
// hats are often the loudest broadband hits in reel music
const mean = (c) => c.reduce((a, b) => a + b, 0) / c.length || 1;
const [ma, ml] = [mean(all), mean(low)];
const beatCurve = all.map((v, i) => v / ma + 2 * (low[i] / ml));
let phase = 0, best = -1;
for (let p = 0; p < period; p += 0.25) {
  let s = 0;
  for (let q = p; q < beatCurve.length; q += period) s += at(beatCurve, q);
  if (s > best) { best = s; phase = p; }
}
const toSec = (frame) => (frame * HOP + WIN / 2) / SR;
const round = (s) => Math.round(s * 1000) / 1000;
// Refine: snap each grid beat to the strongest frame within ±10% of a period, then fit a line through the snapped
// beats that carry energy (least squares), so a long track doesn't drift off the grid
let [p0, per] = [phase, period];
if (!opt.bpm) {
  const pts = [];
  for (let k = 0, q = phase; q < beatCurve.length; k++, q += period) {
    const r = Math.round(period * 0.1);
    let bi = -1, bv = 0;
    for (let i = Math.max(0, Math.round(q) - r); i <= Math.min(beatCurve.length - 1, Math.round(q) + r); i++) {
      if (beatCurve[i] > bv) { bv = beatCurve[i]; bi = i; }
    }
    if (bi >= 0 && bv > 1) pts.push([k, bi]);
  }
  if (pts.length >= 4) {
    const n = pts.length, sx = pts.reduce((a, [k]) => a + k, 0), sy = pts.reduce((a, [, y]) => a + y, 0);
    const sxx = pts.reduce((a, [k]) => a + k * k, 0), sxy = pts.reduce((a, [k, y]) => a + k * y, 0);
    per = (n * sxy - sx * sy) / (n * sxx - sx * sx);
    p0 = (sy - per * sx) / n;
    while (p0 - per >= 0) p0 -= per;
  }
}
// The grid starts at the first beat with sound on it (no beats in the silence before the music)
const firstHit = beatCurve.findIndex((v) => v > 1);
const grid = [];
for (let q = p0; toSec(q) < duration; q += per) if (q >= firstHit - per * 0.25) grid.push(q);
const beats = grid.map((q) => round(toSec(q)));

// Downbeats: the bar position with the most low-end onset energy
let bar = 0, barScore = -1;
for (let k = 0; k < perBar; k++) {
  let s = 0;
  for (let i = k; i < grid.length; i += perBar) s += at(low, grid[i]) + 0.25 * at(all, grid[i]);
  if (s > barScore) { barScore = s; bar = k; }
}
const downbeats = beats.filter((_, i) => i >= bar && (i - bar) % perBar === 0);

// Onsets: local peaks above mean + 1.5 sd within ±0.5 s, at least 0.1 s apart
const onsets = [];
const w = Math.round(FPS * 0.5);
let last = -Infinity;
for (let i = 1; i < all.length - 1; i++) {
  if (all[i] < all[i - 1] || all[i] < all[i + 1]) continue;
  let s = 0, s2 = 0, n = 0;
  for (let j = Math.max(0, i - w); j <= Math.min(all.length - 1, i + w); j++) { s += all[j]; s2 += all[j] ** 2; n++; }
  const mean = s / n, sd = Math.sqrt(Math.max(0, s2 / n - mean ** 2));
  if (all[i] > mean + 1.5 * sd && all[i] > 0 && toSec(i) - last >= 0.1) { onsets.push(round(toSec(i))); last = toSec(i); }
}

const out = {
  source: path.basename(input), duration: round(duration), bpm: Math.round(((60 * FPS) / per) * 100) / 100,
  offset: beats[0], beatsPerBar: perBar, beats, downbeats, onsets,
};
await writeFile(output, JSON.stringify(out, null, 1) + "\n");
console.log(`${output}: ${out.bpm} BPM, first beat ${out.offset}s, ${beats.length} beats, ${downbeats.length} bars, ${onsets.length} onsets`);
