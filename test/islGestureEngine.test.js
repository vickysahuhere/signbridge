import { test } from 'node:test';
import assert from 'node:assert';
import {
  dist3D,
  dist2D,
  analyzeHand,
  classifyIslAlphabet,
  classifyIslWord
} from '../src/ai/islGestureEngine.js';

test('islGestureEngine - dist3D calculates accurate euclidean distance', () => {
  const p1 = { x: 0, y: 0, z: 0 };
  const p2 = { x: 3, y: 4, z: 0 };
  assert.strictEqual(dist3D(p1, p2), 5);
});

test('islGestureEngine - NAMASTE gesture recognized with high confidence', () => {
  // Simulate two hands pressed together in front of chest pointing up
  const leftHand = [
    { x: 0.48, y: 0.55, z: 0 }, // wrist (0)
    ...Array(3).fill({ x: 0.48, y: 0.52, z: 0 }),
    { x: 0.49, y: 0.45, z: 0 }, // thumb tip (4)
    ...Array(3).fill({ x: 0.48, y: 0.48, z: 0 }),
    { x: 0.49, y: 0.38, z: 0 }, // index tip (8)
    ...Array(3).fill({ x: 0.48, y: 0.47, z: 0 }),
    { x: 0.49, y: 0.36, z: 0 }, // middle tip (12)
    ...Array(3).fill({ x: 0.48, y: 0.48, z: 0 }),
    { x: 0.49, y: 0.39, z: 0 }, // ring tip (16)
    ...Array(3).fill({ x: 0.48, y: 0.50, z: 0 }),
    { x: 0.49, y: 0.42, z: 0 }  // pinky tip (20)
  ];

  const rightHand = [
    { x: 0.52, y: 0.55, z: 0 }, // wrist (0)
    ...Array(3).fill({ x: 0.52, y: 0.52, z: 0 }),
    { x: 0.51, y: 0.45, z: 0 }, // thumb tip (4)
    ...Array(3).fill({ x: 0.52, y: 0.48, z: 0 }),
    { x: 0.51, y: 0.38, z: 0 }, // index tip (8)
    ...Array(3).fill({ x: 0.52, y: 0.47, z: 0 }),
    { x: 0.51, y: 0.36, z: 0 }, // middle tip (12)
    ...Array(3).fill({ x: 0.52, y: 0.48, z: 0 }),
    { x: 0.51, y: 0.39, z: 0 }, // ring tip (16)
    ...Array(3).fill({ x: 0.52, y: 0.50, z: 0 }),
    { x: 0.51, y: 0.42, z: 0 }  // pinky tip (20)
  ];

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.4, z: 0 }));
  pose[11] = { x: 0.4, y: 0.45, z: 0 }; // left shoulder
  pose[12] = { x: 0.6, y: 0.45, z: 0 }; // right shoulder

  const words = classifyIslWord(leftHand, rightHand, pose, { state: 'SIGNING_ACTIVE' });
  assert.ok(words.length > 0, 'Should return word candidates');
  assert.strictEqual(words[0].label, 'NAMASTE');
  assert.ok(words[0].confidence >= 0.90);
  assert.strictEqual(words[0].isConfident, true);
});

test('islGestureEngine - GOOD (thumbs-up) recognized accurately', () => {
  const thumbUpHand = [
    { x: 0.5, y: 0.6, z: 0 }, // wrist (0)
    { x: 0.5, y: 0.55, z: 0 },
    { x: 0.5, y: 0.50, z: 0 },
    { x: 0.5, y: 0.45, z: 0 },
    { x: 0.5, y: 0.38, z: 0 }, // thumb tip pointing UP (4)
    ...Array(4).fill({ x: 0.5, y: 0.58, z: 0 }), // index curled
    ...Array(4).fill({ x: 0.5, y: 0.58, z: 0 }), // middle curled
    ...Array(4).fill({ x: 0.5, y: 0.58, z: 0 }), // ring curled
    ...Array(4).fill({ x: 0.5, y: 0.58, z: 0 })  // pinky curled
  ];

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.3, z: 0 }));
  pose[0] = { x: 0.5, y: 0.2, z: 0 }; // nose

  const words = classifyIslWord(null, thumbUpHand, pose, { state: 'SIGNING_ACTIVE' });
  assert.ok(words.length > 0);
  assert.strictEqual(words[0].label, 'GOOD');
  assert.ok(words[0].confidence >= 0.90);
});

test('islGestureEngine - Alphabet Letter L recognized accurately', () => {
  // Thumb and index extended at ~90 deg, other fingers curled
  const lHand = [
    { x: 0.5, y: 0.6, z: 0 }, // wrist (0)
    { x: 0.45, y: 0.55, z: 0 },
    { x: 0.42, y: 0.55, z: 0 },
    { x: 0.38, y: 0.55, z: 0 },
    { x: 0.33, y: 0.55, z: 0 }, // thumb tip extended to the left (4)
    { x: 0.5, y: 0.55, z: 0 },
    { x: 0.5, y: 0.48, z: 0 },
    { x: 0.5, y: 0.42, z: 0 },
    { x: 0.5, y: 0.35, z: 0 }, // index tip extended UP (8)
    ...Array(4).fill({ x: 0.5, y: 0.58, z: 0 }), // middle curled
    ...Array(4).fill({ x: 0.5, y: 0.58, z: 0 }), // ring curled
    ...Array(4).fill({ x: 0.5, y: 0.58, z: 0 })  // pinky curled
  ];

  const letters = classifyIslAlphabet(null, lHand, []);
  assert.ok(letters.length > 0);
  assert.strictEqual(letters[0].label, 'L');
  assert.ok(letters[0].confidence >= 0.90);
});
