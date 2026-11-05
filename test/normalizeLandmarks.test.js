import { test } from 'node:test';
import assert from 'node:assert';
import {
  extractAndNormalizeFrame,
  FEATURE_DIM,
  TOTAL_KEYPOINTS
} from '../src/vision/normalizeLandmarks.js';

test('normalizeLandmarks - output vector has strictly 240 floats and correct type', () => {
  const dummyHolistic = {
    poseLandmarks: [
      Array.from({ length: 33 }, (_, i) => ({ x: 0.5 + i * 0.01, y: 0.5, z: 0 }))
    ],
    leftHandLandmarks: [
      Array.from({ length: 21 }, (_, i) => ({ x: 0.3 + i * 0.01, y: 0.4, z: 0 }))
    ],
    rightHandLandmarks: [
      Array.from({ length: 21 }, (_, i) => ({ x: 0.7 - i * 0.01, y: 0.4, z: 0 }))
    ],
    faceLandmarks: [
      Array.from({ length: 468 }, (_, i) => ({ x: 0.5, y: 0.2 + i * 0.001, z: 0 }))
    ]
  };

  const result = extractAndNormalizeFrame(dummyHolistic);

  assert.strictEqual(result.features instanceof Float32Array, true);
  assert.strictEqual(result.features.length, 240);
  assert.strictEqual(FEATURE_DIM, 240);
  assert.strictEqual(TOTAL_KEYPOINTS, 80);

  // Check that there are no NaN values
  for (let i = 0; i < result.features.length; i++) {
    assert.strictEqual(Number.isNaN(result.features[i]), false, `Index ${i} should not be NaN`);
  }
});

test('normalizeLandmarks - zero-pads missing hand landmarks without NaN', () => {
  const missingHandsHolistic = {
    poseLandmarks: [
      [
        { x: 0.5, y: 0.5, z: 0 }, // 0
        ...Array(10).fill({ x: 0.5, y: 0.5, z: 0 }),
        { x: 0.4, y: 0.5, z: 0 }, // 11 left shoulder
        { x: 0.6, y: 0.5, z: 0 }, // 12 right shoulder
        ...Array(20).fill({ x: 0.5, y: 0.5, z: 0 })
      ]
    ],
    leftHandLandmarks: [],  // missing
    rightHandLandmarks: null, // missing
    faceLandmarks: []
  };

  const result = extractAndNormalizeFrame(missingHandsHolistic);

  assert.strictEqual(result.features.length, 240);

  // Left hand: first 21 points * 3 = first 63 floats must be strictly 0.0
  for (let i = 0; i < 63; i++) {
    assert.strictEqual(result.features[i], 0.0, `Missing left hand float ${i} must be 0.0`);
  }

  // Right hand: next 21 points * 3 = next 63 floats must be strictly 0.0
  for (let i = 63; i < 126; i++) {
    assert.strictEqual(result.features[i], 0.0, `Missing right hand float ${i} must be 0.0`);
  }

  // None of the 240 floats should be NaN
  for (let i = 0; i < 240; i++) {
    assert.strictEqual(Number.isNaN(result.features[i]), false);
  }
});

test('normalizeLandmarks - spatial & scale invariance across distance and position', () => {
  // Scenario A: User is centered at 1.0m (shoulder width = 0.20, center = 0.5)
  // Hand thumb tip is at x=0.45, index tip is at x=0.42 (dx = 0.03 in raw pixels)
  const userNear = {
    poseLandmarks: [[
      ...Array(11).fill({ x: 0, y: 0, z: 0 }),
      { x: 0.40, y: 0.50, z: 0 }, // Left shoulder
      { x: 0.60, y: 0.50, z: 0 }, // Right shoulder
      ...Array(20).fill({ x: 0, y: 0, z: 0 })
    ]],
    leftHandLandmarks: [[
      { x: 0.40, y: 0.60, z: 0 }, // 0: Wrist
      ...Array(3).fill({ x: 0, y: 0, z: 0 }),
      { x: 0.45, y: 0.65, z: 0 }, // 4: Thumb tip
      ...Array(3).fill({ x: 0, y: 0, z: 0 }),
      { x: 0.42, y: 0.70, z: 0 }, // 8: Index tip
      ...Array(12).fill({ x: 0, y: 0, z: 0 })
    ]],
    rightHandLandmarks: [],
    faceLandmarks: []
  };

  // Scenario B: User stepped back to 2.0m and moved left (scaled by 0.5x, shifted to center = 0.30)
  // Shoulder width = 0.10 (was 0.20)
  // Hand thumb: relative to center in near was dx=-0.05, dy=+0.15 -> scaled 0.5x is dx=-0.025, dy=+0.075 -> x=0.275, y=0.575
  // Hand index: relative to center in near was dx=-0.08, dy=+0.20 -> scaled 0.5x is dx=-0.040, dy=+0.100 -> x=0.260, y=0.600
  const userFar = {
    poseLandmarks: [[
      ...Array(11).fill({ x: 0, y: 0, z: 0 }),
      { x: 0.25, y: 0.50, z: 0 }, // Left shoulder
      { x: 0.35, y: 0.50, z: 0 }, // Right shoulder
      ...Array(20).fill({ x: 0, y: 0, z: 0 })
    ]],
    leftHandLandmarks: [[
      { x: 0.25, y: 0.55, z: 0 }, // 0: Wrist
      ...Array(3).fill({ x: 0, y: 0, z: 0 }),
      { x: 0.275, y: 0.575, z: 0 }, // 4: Thumb tip
      ...Array(3).fill({ x: 0, y: 0, z: 0 }),
      { x: 0.260, y: 0.600, z: 0 }, // 8: Index tip
      ...Array(12).fill({ x: 0, y: 0, z: 0 })
    ]],
    rightHandLandmarks: [],
    faceLandmarks: []
  };

  const resNear = extractAndNormalizeFrame(userNear);
  const resFar = extractAndNormalizeFrame(userFar);

  // Compute normalized relative distance between thumb tip (point 4, offset 4*3=12)
  // and index tip (point 8, offset 8*3=24)
  const thumbNear = { x: resNear.features[12], y: resNear.features[13] };
  const indexNear = { x: resNear.features[24], y: resNear.features[25] };
  const distNear = Math.hypot(thumbNear.x - indexNear.x, thumbNear.y - indexNear.y);

  const thumbFar = { x: resFar.features[12], y: resFar.features[13] };
  const indexFar = { x: resFar.features[24], y: resFar.features[25] };
  const distFar = Math.hypot(thumbFar.x - indexFar.x, thumbFar.y - indexFar.y);

  // The normalized distance MUST be equal regardless of camera distance or user translation!
  assert.strictEqual(
    Math.abs(distNear - distFar) < 1e-4,
    true,
    `Normalized distance near (${distNear}) vs far (${distFar}) must be invariant`
  );
});
