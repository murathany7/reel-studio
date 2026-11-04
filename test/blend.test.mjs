// Motion blur's frame average (core/lib/blend.mjs): lossless PNG round trip, linear-light mixing, determinism.
import assert from "node:assert/strict";
import { test } from "node:test";
import { blend, decode, encode } from "../core/lib/blend.mjs";

const img = (width, height, channels, fill) => {
  const data = Buffer.alloc(width * height * channels);
  for (let i = 0; i < data.length; i++) data[i] = fill(i);
  return encode({ width, height, channels, data });
};

test("encode → decode is lossless (RGB and RGBA)", () => {
  for (const ch of [3, 4]) {
    const png = img(37, 11, ch, (i) => (i * 7919) % 256);
    const back = decode(png);
    assert.equal(back.width, 37);
    assert.equal(back.channels, ch);
    assert.deepEqual(back.data, decode(img(37, 11, ch, (i) => (i * 7919) % 256)).data);
    assert.equal(back.data[123], (123 * 7919) % 256);
  }
});

test("blending identical frames changes nothing", () => {
  const png = img(16, 9, 3, (i) => (i * 31) % 256);
  assert.deepEqual(decode(blend([png, png, png])).data, decode(png).data);
});

test("black and white average in linear light (188, not 128); alpha averages straight", () => {
  const black = img(2, 2, 4, (i) => (i % 4 === 3 ? 255 : 0));
  const white = img(2, 2, 4, (i) => (i % 4 === 3 ? 0 : 255));
  const { data } = decode(blend([black, white]));
  assert.deepEqual([...data.subarray(0, 4)], [188, 188, 188, 128]);
});

test("the same subframes always give the same bytes", () => {
  const a = img(64, 64, 3, (i) => i % 251), b = img(64, 64, 3, (i) => (i * 3) % 256);
  assert.ok(blend([a, b]).equals(blend([a, b])));
});
