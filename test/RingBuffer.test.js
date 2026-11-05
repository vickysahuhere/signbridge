import { test } from 'node:test';
import assert from 'node:assert';
import { RingBuffer } from '../src/vision/RingBuffer.js';

test('RingBuffer - maintains windowSize capacity and evicts oldest frames (FIFO)', () => {
  const buffer = new RingBuffer(30, 240);

  assert.strictEqual(buffer.size(), 0);
  assert.strictEqual(buffer.isFull(), false);

  // Push 10 frames
  for (let i = 0; i < 10; i++) {
    const frame = new Float32Array(240).fill(i);
    buffer.push(frame);
  }

  assert.strictEqual(buffer.size(), 10);
  assert.strictEqual(buffer.isFull(), false);
  assert.strictEqual(buffer.getLatest()[0], 9);

  // Push 25 more frames (total 35 pushed -> capacity is 30)
  for (let i = 10; i < 35; i++) {
    const frame = new Float32Array(240).fill(i);
    buffer.push(frame);
  }

  assert.strictEqual(buffer.size(), 30);
  assert.strictEqual(buffer.isFull(), true);
  // Oldest frame in buffer should now be frame 5 (0-4 evicted)
  assert.strictEqual(buffer.frames[0][0], 5);
  // Latest frame should be frame 34
  assert.strictEqual(buffer.getLatest()[0], 34);
});

test('RingBuffer - getFlattened outputs contiguous Float32Array of exactly windowSize * featureDim', () => {
  const buffer = new RingBuffer(30, 240);

  // When buffer is partially filled (e.g. 5 frames)
  for (let i = 1; i <= 5; i++) {
    buffer.push(new Float32Array(240).fill(i));
  }

  const flattened = buffer.getFlattened();
  assert.strictEqual(flattened instanceof Float32Array, true);
  assert.strictEqual(flattened.length, 30 * 240); // strictly 7200 floats

  // Earlier unpopulated slots are zero-padded
  assert.strictEqual(flattened[0], 0.0);
  // Last frame's first float should be 5
  assert.strictEqual(flattened[29 * 240], 5.0);
});

test('RingBuffer - clear resets buffer state completely', () => {
  const buffer = new RingBuffer(30, 240);
  buffer.push(new Float32Array(240).fill(1));
  buffer.push(new Float32Array(240).fill(2));

  assert.strictEqual(buffer.size(), 2);
  buffer.clear();
  assert.strictEqual(buffer.size(), 0);
  assert.strictEqual(buffer.isFull(), false);
  assert.strictEqual(buffer.getLatest(), null);
});
