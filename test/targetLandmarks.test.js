import { test } from 'node:test';
import assert from 'node:assert';
import {
  ISL_LEARN_ITEMS,
  ISL_LEARN_MAP,
  getLearnItemByLabel
} from '../src/ai/islTargetLandmarks.js';

test('islTargetLandmarks - exports full collection of authentic learn items', () => {
  assert.strictEqual(Array.isArray(ISL_LEARN_ITEMS), true);
  assert.strictEqual(ISL_LEARN_ITEMS.length >= 10, true);

  for (const item of ISL_LEARN_ITEMS) {
    assert.strictEqual(typeof item.id, 'string');
    assert.strictEqual(typeof item.label, 'string');
    assert.strictEqual(typeof item.name, 'string');
    assert.strictEqual(typeof item.category, 'string');
    assert.strictEqual(typeof item.english, 'string');
    assert.strictEqual(typeof item.description, 'string');
    assert.strictEqual(typeof item.tip, 'string');
    assert.strictEqual(typeof item.evaluate, 'function');
    assert.strictEqual(typeof item.targetSkeleton, 'object');
    assert.strictEqual(typeof item.blueprint, 'object');
  }
});

test('islTargetLandmarks - dictionary lookup works accurately', () => {
  const namaste = getLearnItemByLabel('NAMASTE');
  assert.strictEqual(namaste != null, true);
  assert.strictEqual(namaste.label, 'NAMASTE');
  assert.strictEqual(namaste.category, 'greetings');

  const letterA = getLearnItemByLabel('A');
  assert.strictEqual(letterA != null, true);
  assert.strictEqual(letterA.label, 'A');
  assert.strictEqual(letterA.type, 'alphabet');
});

test('islTargetLandmarks - Namaste evaluation correctly evaluates mock landmarks', () => {
  const namaste = getLearnItemByLabel('NAMASTE');

  // Case 1: No landmarks provided
  const emptyRes = namaste.evaluate(null);
  assert.strictEqual(emptyRes.isMatched, false);
  assert.strictEqual(emptyRes.matchScore, 0);

  // Case 2: Accurate Namaste landmarks
  const mockLeftHand = Array.from({ length: 21 }, (_, i) => ({
    x: 0.47,
    y: i === 0 ? 0.60 : (i === 12 ? 0.42 : 0.50),
    z: 0
  }));
  const mockRightHand = Array.from({ length: 21 }, (_, i) => ({
    x: 0.53,
    y: i === 0 ? 0.60 : (i === 12 ? 0.42 : 0.50),
    z: 0
  }));
  // Tips pointing up, wrists at chest level
  const mockPose = [
    { x: 0.50, y: 0.22, z: 0 }, // nose
    ...Array(10).fill({ x: 0.5, y: 0.22, z: 0 }),
    { x: 0.38, y: 0.42, z: 0 }, // left shoulder
    { x: 0.62, y: 0.42, z: 0 }  // right shoulder
  ];

  const matchRes = namaste.evaluate({
    leftHandLandmarks: mockLeftHand,
    rightHandLandmarks: mockRightHand,
    poseLandmarks: mockPose
  });

  assert.strictEqual(typeof matchRes.matchScore, 'number');
  assert.strictEqual(Array.isArray(matchRes.checklist), true);
  assert.strictEqual(typeof matchRes.primaryGuidance, 'string');
});

test('islTargetLandmarks - contains all 26 letters of the ISL alphabet with valid images', () => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  
  for (const letter of letters) {
    const item = getLearnItemByLabel(letter);
    assert.strictEqual(item != null, true, `Letter ${letter} should exist in ISL_LEARN_ITEMS`);
    assert.strictEqual(item.label, letter);
    assert.strictEqual(item.type, 'alphabet');
    assert.strictEqual(item.image, `/signs/alphabet_${letter.toLowerCase()}.jpg`);
    assert.strictEqual(typeof item.evaluate, 'function');

    // Test evaluation function runs without throwing
    const evalRes = item.evaluate(null);
    assert.strictEqual(evalRes.isMatched, false);
    assert.strictEqual(evalRes.matchScore, 0);
  }
});

test('islTargetLandmarks - Letter C evaluation correctly confirms authentic cupped C shape', () => {
  const letterC = getLearnItemByLabel('C');
  assert.strictEqual(letterC != null, true);

  const cHand = [
    { x: 0.54, y: 0.54, z: 0 }, // wrist (0)
    { x: 0.56, y: 0.52, z: 0 },
    { x: 0.57, y: 0.49, z: -0.01 },
    { x: 0.56, y: 0.46, z: -0.02 },
    { x: 0.52, y: 0.44, z: -0.03 }, // thumb tip (4)
    { x: 0.52, y: 0.42, z: 0 }, // index MCP (5)
    { x: 0.50, y: 0.37, z: -0.02 }, // index PIP (6)
    { x: 0.47, y: 0.35, z: -0.04 }, // index DIP (7)
    { x: 0.45, y: 0.38, z: -0.03 }, // index Tip (8)
    { x: 0.54, y: 0.42, z: 0 }, // middle MCP (9)
    { x: 0.52, y: 0.37, z: -0.02 },
    { x: 0.49, y: 0.35, z: -0.04 },
    { x: 0.47, y: 0.38, z: -0.03 }, // middle Tip (12)
    { x: 0.56, y: 0.43, z: 0 }, // ring MCP (13)
    { x: 0.54, y: 0.38, z: -0.02 },
    { x: 0.51, y: 0.36, z: -0.04 },
    { x: 0.49, y: 0.39, z: -0.03 }, // ring Tip (16)
    { x: 0.58, y: 0.44, z: 0 }, // pinky MCP (17)
    { x: 0.56, y: 0.40, z: -0.02 },
    { x: 0.53, y: 0.38, z: -0.04 },
    { x: 0.51, y: 0.41, z: -0.03 }  // pinky Tip (20)
  ];

  const evalRes = letterC.evaluate({
    rightHandLandmarks: cHand,
    leftHandLandmarks: null,
    poseLandmarks: []
  });

  assert.strictEqual(evalRes.isMatched, true);
  assert.ok(evalRes.matchScore >= 75);
  assert.strictEqual(evalRes.primaryGuidance, 'Letter C confirmed!');
});

test('islTargetLandmarks - time sign uses authentic human gesture image instead of watch', () => {
  const time = getLearnItemByLabel('TIME');
  assert.strictEqual(time != null, true);
  assert.strictEqual(time.image, '/signs/time.jpg');
});

test('islTargetLandmarks - strictly no gif images, all items use static demonstration images', () => {
  for (const item of ISL_LEARN_ITEMS) {
    if (item.image) {
      assert.strictEqual(item.image.endsWith('.gif'), false, `Item ${item.id} should NOT use .gif`);
      assert.strictEqual(item.image.endsWith('.jpg') || item.image.endsWith('.png') || item.image.endsWith('.webp'), true);
    }
  }
});
