import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, resample, describeFrame } from '../src/teach/customSignStore.js';

const rnd = (s) => () => ((s = (s * 16807) % 2147483647) / 2147483647) - 0.5;
const shape = (b) => { const r = rnd(b * 977 + 13); return Array.from({ length: 63 }, () => r() * 2); };
function frame(b, noise, seed) {
  const r = rnd(seed), f = new Float32Array(240), sh = shape(b);
  const ox = 0.3 + r() * 0.2, oy = 0.1 + r() * 0.2;
  for (let j = 0; j < 21; j++) {
    f[j * 3] = ox + sh[j * 3] * 0.1 + r() * noise;
    f[j * 3 + 1] = oy + sh[j * 3 + 1] * 0.1 + r() * noise;
    f[j * 3 + 2] = sh[j * 3 + 2] * 0.1 + r() * noise;
  }
  return f;
}
const mk = (b) => ({ samples: [1, 2, 3].map((i) => Array.from({ length: 12 }, (_, t) => frame(b, 0.004, i * 100 + t))) });

test('resample keeps short clips and caps long ones', () => {
  const f = Array.from({ length: 100 }, (_, i) => frame(1, 0, i + 1));
  assert.equal(resample(f).length, 40);
  assert.equal(resample(f.slice(0, 10)).length, 10);
});

test('descriptor ignores where the hand is in frame', () => {
  const a = describeFrame(frame(2, 0, 1));
  const b = describeFrame(frame(2, 0, 2));
  let d = 0; for (let i = 0; i < 63; i++) d += (a[i] - b[i]) ** 2;
  assert.ok(Math.sqrt(d) < 1e-3);
});

test('classify picks the taught sign and rejects an unknown shape', () => {
  const signs = { A: mk(1), B: mk(2), C: mk(3) };
  assert.equal(classify(frame(2, 0.004, 999), signs).best.word, 'B');
  assert.equal(classify(frame(9, 0.004, 999), signs).best, null);
});
