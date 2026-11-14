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
  assert.strictEqual(words.some(w => w.label === 'EVENING'), false, 'Thumbs-up must never trigger EVENING');
  assert.strictEqual(words.some(w => w.label === 'NIGHT'), false, 'Thumbs-up must never trigger NIGHT');
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

test('islGestureEngine - Single-Handed Alphabet Letter C recognized accurately', () => {
  // Hand curved into an open C shape
  const cHand = [
    { x: 0.5, y: 0.6, z: 0 }, // wrist (0)
    { x: 0.52, y: 0.58, z: 0 },
    { x: 0.53, y: 0.55, z: -0.01 },
    { x: 0.52, y: 0.52, z: -0.02 },
    { x: 0.48, y: 0.50, z: -0.03 }, // thumb tip (4)
    { x: 0.48, y: 0.48, z: 0 }, // index MCP (5)
    { x: 0.46, y: 0.43, z: -0.02 }, // index PIP (6)
    { x: 0.43, y: 0.41, z: -0.04 }, // index DIP (7)
    { x: 0.41, y: 0.44, z: -0.03 }, // index Tip (8)
    { x: 0.50, y: 0.48, z: 0 }, // middle MCP (9)
    { x: 0.48, y: 0.43, z: -0.02 },
    { x: 0.45, y: 0.41, z: -0.04 },
    { x: 0.43, y: 0.44, z: -0.03 }, // middle Tip (12)
    { x: 0.52, y: 0.49, z: 0 }, // ring MCP (13)
    { x: 0.50, y: 0.44, z: -0.02 },
    { x: 0.47, y: 0.42, z: -0.04 },
    { x: 0.45, y: 0.45, z: -0.03 }, // ring Tip (16)
    { x: 0.54, y: 0.50, z: 0 }, // pinky MCP (17)
    { x: 0.52, y: 0.46, z: -0.02 },
    { x: 0.49, y: 0.44, z: -0.04 },
    { x: 0.47, y: 0.47, z: -0.03 }  // pinky Tip (20)
  ];

  const letters = classifyIslAlphabet(null, cHand, []);
  assert.ok(letters.length > 0, 'Should return alphabet candidates');
  assert.strictEqual(letters[0].label, 'C');
  assert.ok(letters[0].confidence >= 0.90, 'Confidence should be >= 0.90');
  assert.strictEqual(letters[0].isConfident, true);
});

test('islGestureEngine - Authentic Two-Handed ISL Vowel A recognized accurately', () => {
  // Non-dominant hand: open palm with thumb pointing out
  const baseHand = [
    { x: 0.45, y: 0.60, z: 0 }, // wrist (0)
    { x: 0.43, y: 0.58, z: 0 },
    { x: 0.41, y: 0.55, z: 0 },
    { x: 0.39, y: 0.53, z: 0 },
    { x: 0.36, y: 0.50, z: 0 }, // thumb tip (4)
    { x: 0.45, y: 0.52, z: 0 },
    { x: 0.45, y: 0.45, z: 0 },
    { x: 0.45, y: 0.40, z: 0 },
    { x: 0.45, y: 0.35, z: 0 }, // index tip (8)
    ...Array(12).fill({ x: 0.48, y: 0.40, z: 0 })
  ];

  // Dominant hand: index extended touching the non-dominant thumb tip (0.36, 0.50)
  const pointerHand = [
    { x: 0.55, y: 0.60, z: 0 }, // wrist (0)
    ...Array(4).fill({ x: 0.53, y: 0.58, z: 0 }),
    { x: 0.50, y: 0.55, z: 0 },
    { x: 0.45, y: 0.53, z: 0 },
    { x: 0.40, y: 0.51, z: 0 },
    { x: 0.37, y: 0.50, z: 0 }, // index tip (8) - touching thumb tip at 0.36, 0.50!
    ...Array(12).fill({ x: 0.55, y: 0.58, z: 0 })
  ];

  const letters = classifyIslAlphabet(baseHand, pointerHand, []);
  assert.ok(letters.length > 0, 'Must recognize two-handed vowel touch');
  assert.strictEqual(letters[0].label, 'A', 'Must recognize touching thumb tip as ISL letter A');
  assert.ok(letters[0].confidence >= 0.88);
});

test('islGestureEngine - Single-Handed Alphabet Letter A recognized accurately', () => {
  // Closed fist with thumb resting alongside index finger
  const aFist = [
    { x: 0.5, y: 0.65, z: 0 }, // wrist (0)
    { x: 0.47, y: 0.62, z: 0 },
    { x: 0.46, y: 0.58, z: 0 },
    { x: 0.46, y: 0.54, z: 0 },
    { x: 0.46, y: 0.51, z: 0 }, // thumb tip (4) resting alongside index
    { x: 0.48, y: 0.58, z: 0 }, // index MCP (5)
    { x: 0.48, y: 0.54, z: 0 }, // index PIP (6)
    { x: 0.48, y: 0.59, z: 0 }, // index DIP (7)
    { x: 0.48, y: 0.62, z: 0 }, // index tip (8) - curled inward
    ...Array(4).fill({ x: 0.50, y: 0.62, z: 0 }), // middle curled
    ...Array(4).fill({ x: 0.52, y: 0.62, z: 0 }), // ring curled
    ...Array(4).fill({ x: 0.54, y: 0.62, z: 0 })  // pinky curled
  ];

  const letters = classifyIslAlphabet(null, aFist, []);
  assert.ok(letters.length > 0, 'Must recognize single-handed A');
  assert.strictEqual(letters[0].label, 'A');
  assert.ok(letters[0].confidence >= 0.90);
});

test('islGestureEngine - Two-Handed ISL Vowel E recognized accurately', () => {
  // Base hand: open index tip at (0.45, 0.35)
  const baseHand = [
    { x: 0.45, y: 0.60, z: 0 },
    ...Array(7).fill({ x: 0.45, y: 0.50, z: 0 }),
    { x: 0.45, y: 0.35, z: 0 }, // index tip (8)
    ...Array(12).fill({ x: 0.48, y: 0.40, z: 0 })
  ];

  // Dominant hand: index tip touching base hand index tip at (0.46, 0.35)
  const pointerHand = [
    { x: 0.58, y: 0.60, z: 0 },
    ...Array(7).fill({ x: 0.52, y: 0.50, z: 0 }),
    { x: 0.46, y: 0.35, z: 0 }, // index tip (8)
    ...Array(12).fill({ x: 0.55, y: 0.58, z: 0 })
  ];

  const letters = classifyIslAlphabet(baseHand, pointerHand, []);
  assert.ok(letters.length > 0);
  assert.strictEqual(letters[0].label, 'E', 'Must recognize touching index tip as ISL letter E');
  assert.ok(letters[0].confidence >= 0.88);
});

test('islGestureEngine - TIME gesture (tapping wrist) recognized accurately', () => {
  // Non-dominant left wrist at (0.45, 0.55)
  const leftHand = [
    { x: 0.45, y: 0.55, z: 0 }, // wrist (0)
    ...Array(20).fill({ x: 0.45, y: 0.45, z: 0 })
  ];

  // Dominant right hand: index tip (8) touching non-dominant wrist (0.45, 0.55)
  const rightHand = [
    { x: 0.60, y: 0.65, z: 0 }, // wrist (0)
    ...Array(7).fill({ x: 0.55, y: 0.60, z: 0 }),
    { x: 0.46, y: 0.55, z: 0 }, // index tip (8) touching left wrist
    ...Array(12).fill({ x: 0.62, y: 0.68, z: 0 }) // other fingers curled
  ];

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.4, z: 0 }));
  const words = classifyIslWord(leftHand, rightHand, pose, { state: 'SIGNING_ACTIVE' });
  assert.ok(words.length > 0);
  assert.strictEqual(words[0].label, 'TIME');
  assert.ok(words[0].confidence >= 0.90);
});

test('islGestureEngine - CALL gesture (phone hand near ear) recognized accurately', () => {
  // Right hand in Y-shape (thumb & pinky extended, others curled) near ear (x: 0.70, y: 0.25)
  const phoneHand = [
    { x: 0.70, y: 0.30, z: 0 }, // wrist
    { x: 0.68, y: 0.27, z: 0 },
    { x: 0.66, y: 0.24, z: 0 },
    { x: 0.64, y: 0.21, z: 0 },
    { x: 0.62, y: 0.18, z: 0 }, // thumb extended up/out (4)
    ...Array(4).fill({ x: 0.70, y: 0.32, z: 0 }), // index curled
    ...Array(4).fill({ x: 0.70, y: 0.32, z: 0 }), // middle curled
    ...Array(4).fill({ x: 0.70, y: 0.32, z: 0 }), // ring curled
    { x: 0.72, y: 0.28, z: 0 },
    { x: 0.74, y: 0.25, z: 0 },
    { x: 0.76, y: 0.22, z: 0 },
    { x: 0.78, y: 0.18, z: 0 }  // pinky extended up/out (20)
  ];

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.3, z: 0 }));
  pose[0] = { x: 0.5, y: 0.25, z: 0 }; // nose
  pose[11] = { x: 0.4, y: 0.45, z: 0 }; // left shoulder
  pose[12] = { x: 0.6, y: 0.45, z: 0 }; // right shoulder

  const words = classifyIslWord(null, phoneHand, pose, { state: 'SIGNING_ACTIVE' });
  assert.ok(words.length > 0);
  assert.strictEqual(words[0].label, 'CALL');
  assert.ok(words[0].confidence >= 0.90);
});

test('islGestureEngine - MORNING (sunrise gesture) recognized accurately', () => {
  // Dominant open hand rising upward in upper chest zone with fingers pointing up
  const sunriseHand = [
    { x: 0.65, y: 0.45, z: 0 }, // wrist (0)
    // Thumb:
    { x: 0.62, y: 0.43, z: 0 },
    { x: 0.60, y: 0.40, z: 0 },
    { x: 0.58, y: 0.38, z: 0 },
    { x: 0.56, y: 0.35, z: 0 }, // thumb tip (4)
    // Index:
    { x: 0.63, y: 0.40, z: 0 },
    { x: 0.63, y: 0.35, z: 0 },
    { x: 0.63, y: 0.30, z: 0 },
    { x: 0.63, y: 0.25, z: 0 }, // index tip (8)
    // Middle:
    { x: 0.65, y: 0.39, z: 0 },
    { x: 0.65, y: 0.34, z: 0 },
    { x: 0.65, y: 0.29, z: 0 },
    { x: 0.65, y: 0.23, z: 0 }, // middle tip (12)
    // Ring:
    { x: 0.67, y: 0.40, z: 0 },
    { x: 0.67, y: 0.35, z: 0 },
    { x: 0.67, y: 0.30, z: 0 },
    { x: 0.67, y: 0.25, z: 0 }, // ring tip (16)
    // Pinky:
    { x: 0.69, y: 0.41, z: 0 },
    { x: 0.69, y: 0.37, z: 0 },
    { x: 0.69, y: 0.33, z: 0 },
    { x: 0.69, y: 0.28, z: 0 }  // pinky tip (20)
  ];

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.3, z: 0 }));
  pose[0] = { x: 0.5, y: 0.22, z: 0 }; // nose
  pose[11] = { x: 0.4, y: 0.45, z: 0 }; // left shoulder
  pose[12] = { x: 0.6, y: 0.45, z: 0 }; // right shoulder

  const words = classifyIslWord(null, sunriseHand, pose, { state: 'SIGNING_ACTIVE' });
  assert.ok(words.length > 0);
  assert.strictEqual(words[0].label, 'MORNING');
  assert.ok(words[0].confidence >= 0.90);
});

test('islGestureEngine - AFTERNOON recognized accurately', () => {
  // Dominant flat hand held high near forehead/overhead
  const middayHand = [
    { x: 0.65, y: 0.28, z: 0 }, // wrist (0)
    // Thumb:
    { x: 0.61, y: 0.27, z: 0 },
    { x: 0.58, y: 0.25, z: 0 },
    { x: 0.56, y: 0.23, z: 0 },
    { x: 0.54, y: 0.20, z: 0 }, // thumb tip (4)
    // Index:
    { x: 0.63, y: 0.23, z: 0 },
    { x: 0.63, y: 0.18, z: 0 },
    { x: 0.63, y: 0.14, z: 0 },
    { x: 0.63, y: 0.10, z: 0 }, // index tip (8)
    // Middle:
    { x: 0.65, y: 0.23, z: 0 },
    { x: 0.65, y: 0.18, z: 0 },
    { x: 0.65, y: 0.13, z: 0 },
    { x: 0.65, y: 0.08, z: 0 }, // middle tip (12)
    // Ring:
    { x: 0.67, y: 0.24, z: 0 },
    { x: 0.67, y: 0.19, z: 0 },
    { x: 0.67, y: 0.15, z: 0 },
    { x: 0.67, y: 0.11, z: 0 }, // ring tip (16)
    // Pinky:
    { x: 0.69, y: 0.25, z: 0 },
    { x: 0.69, y: 0.21, z: 0 },
    { x: 0.69, y: 0.17, z: 0 },
    { x: 0.69, y: 0.13, z: 0 }  // pinky tip (20)
  ];

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.3, z: 0 }));
  pose[0] = { x: 0.5, y: 0.22, z: 0 }; // nose
  pose[11] = { x: 0.4, y: 0.45, z: 0 }; // left shoulder
  pose[12] = { x: 0.6, y: 0.45, z: 0 }; // right shoulder

  const words = classifyIslWord(null, middayHand, pose, { state: 'SIGNING_ACTIVE' });
  assert.ok(words.length > 0);
  assert.strictEqual(words[0].label, 'AFTERNOON');
  assert.ok(words[0].confidence >= 0.90);
});

test('islGestureEngine - EVENING recognized accurately', () => {
  // Dominant hand in sunset horizon dip
  const sunsetHand = [
    { x: 0.52, y: 0.55, z: 0 }, // wrist (0)
    // Thumb:
    { x: 0.50, y: 0.56, z: 0 },
    { x: 0.48, y: 0.57, z: 0 },
    { x: 0.47, y: 0.58, z: 0 },
    { x: 0.46, y: 0.59, z: 0 }, // thumb tip (4)
    // Index:
    { x: 0.53, y: 0.57, z: 0 },
    { x: 0.54, y: 0.60, z: 0 },
    { x: 0.55, y: 0.62, z: 0 },
    { x: 0.56, y: 0.64, z: 0 }, // index tip (8)
    // Middle:
    { x: 0.52, y: 0.57, z: 0 },
    { x: 0.53, y: 0.60, z: 0 },
    { x: 0.54, y: 0.62, z: 0 },
    { x: 0.55, y: 0.65, z: 0 }, // middle tip (12)
    // Ring:
    { x: 0.51, y: 0.57, z: 0 },
    { x: 0.52, y: 0.59, z: 0 },
    { x: 0.53, y: 0.62, z: 0 },
    { x: 0.54, y: 0.64, z: 0 }, // ring tip (16)
    // Pinky:
    { x: 0.50, y: 0.57, z: 0 },
    { x: 0.51, y: 0.59, z: 0 },
    { x: 0.52, y: 0.61, z: 0 },
    { x: 0.53, y: 0.63, z: 0 }  // pinky tip (20)
  ];

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.3, z: 0 }));
  pose[0] = { x: 0.5, y: 0.22, z: 0 }; // nose
  pose[11] = { x: 0.4, y: 0.45, z: 0 }; // left shoulder
  pose[12] = { x: 0.6, y: 0.45, z: 0 }; // right shoulder

  const words = classifyIslWord(null, sunsetHand, pose, { state: 'SIGNING_ACTIVE' });
  assert.ok(words.length > 0);
  assert.strictEqual(words[0].label, 'EVENING');
  assert.ok(words[0].confidence >= 0.90);
});

test('islGestureEngine - NIGHT recognized accurately', () => {
  // Crossed wrists in front of chest
  const leftHand = [
    { x: 0.48, y: 0.60, z: 0 }, // wrist
    ...Array(20).fill({ x: 0.46, y: 0.65, z: 0 })
  ];
  const rightHand = [
    { x: 0.52, y: 0.62, z: 0 }, // wrist
    ...Array(20).fill({ x: 0.54, y: 0.66, z: 0 })
  ];

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.3, z: 0 }));
  pose[0] = { x: 0.5, y: 0.22, z: 0 }; // nose
  pose[11] = { x: 0.4, y: 0.45, z: 0 }; // left shoulder
  pose[12] = { x: 0.6, y: 0.45, z: 0 }; // right shoulder

  const words = classifyIslWord(leftHand, rightHand, pose, { state: 'SIGNING_ACTIVE' });
  assert.ok(words.length > 0);
  assert.strictEqual(words[0].label, 'NIGHT');
  assert.ok(words[0].confidence >= 0.90);
});

test('islGestureEngine - rejects resting hand at bottom of frame', () => {
  const restingHand = [
    { x: 0.5, y: 0.92, z: 0 }, // wrist below 0.85
    ...Array(20).fill({ x: 0.5, y: 0.90, z: 0 })
  ];

  const analyzed = analyzeHand(restingHand);
  assert.strictEqual(analyzed, null, 'Resting hand at bottom of frame must be ignored');

  const words = classifyIslWord(null, restingHand, [], { state: 'IDLE' });
  assert.strictEqual(words.length, 0);

  const letters = classifyIslAlphabet(null, restingHand, []);
  assert.strictEqual(letters.length, 0);
});
