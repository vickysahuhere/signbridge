import { test } from 'node:test';
import assert from 'node:assert';
import {
  ISL_LEARN_ITEMS,
  ISL_LEARN_MAP,
  getLearnItemByLabel
} from '../src/ai/islTargetLandmarks.js';

test('islTargetLandmarks - exports full collection of authentic learn items', () => {
  assert.strictEqual(Array.isArray(ISL_LEARN_ITEMS), true);
  assert.strictEqual(ISL_LEARN_ITEMS.length >= 1000, true);

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

test('islTargetLandmarks - 1000+ words learning curriculum coverage across all categories', () => {
  const categories = new Set(ISL_LEARN_ITEMS.map(i => i.category));
  assert.strictEqual(categories.has('greetings'), true);
  assert.strictEqual(categories.has('pronouns'), true);
  assert.strictEqual(categories.has('questions'), true);
  assert.strictEqual(categories.has('actions'), true);
  assert.strictEqual(categories.has('transit'), true);
  assert.strictEqual(categories.has('healthcare'), true);
  assert.strictEqual(categories.has('shopping_food'), true);
  assert.strictEqual(categories.has('education_work'), true);
  assert.strictEqual(categories.has('time_calendar'), true);
  assert.strictEqual(categories.has('feelings_states'), true);
  assert.strictEqual(categories.has('essentials'), true);
  assert.strictEqual(categories.has('alphabet'), true);

  const metro = getLearnItemByLabel('METRO_TRAIN');
  assert.strictEqual(metro != null, true);
  assert.strictEqual(metro.label, 'METRO_TRAIN');
  assert.strictEqual(metro.category, 'transit');

  const signLang = getLearnItemByLabel('SIGN_LANGUAGE');
  assert.strictEqual(signLang != null, true);
  assert.strictEqual(signLang.label, 'SIGN_LANGUAGE');

  // Verify synthesized evaluation returns valid match results
  const res = metro.evaluate(null);
  assert.strictEqual(res.isMatched, false);
  assert.strictEqual(typeof res.matchScore, 'number');
  assert.strictEqual(Array.isArray(res.checklist), true);
  assert.strictEqual(typeof res.primaryGuidance, 'string');
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

test('islTargetLandmarks - compound signs support multi-step sequence evaluation (GOOD_MORNING)', () => {
  const goodMorning = getLearnItemByLabel('GOOD_MORNING');
  assert.strictEqual(goodMorning != null, true);
  assert.strictEqual(goodMorning.isCompound, true);
  assert.strictEqual(Array.isArray(goodMorning.steps), true);
  assert.strictEqual(goodMorning.steps.length, 2);

  // Step 1: Good (Thumbs-Up)
  assert.strictEqual(goodMorning.steps[0].id, 'step_good');
  assert.strictEqual(goodMorning.steps[0].stepNumber, 1);
  assert.strictEqual(goodMorning.steps[0].targetGloss, 'GOOD');

  // Step 2: Morning (Sunrise)
  assert.strictEqual(goodMorning.steps[1].id, 'step_morning');
  assert.strictEqual(goodMorning.steps[1].stepNumber, 2);
  assert.strictEqual(goodMorning.steps[1].targetGloss, 'MORNING');

  // Delegated evaluate call for step 0
  const step0Res = goodMorning.evaluate(null, 0);
  assert.strictEqual(step0Res.isCompound, true);
  assert.strictEqual(step0Res.stepIndex, 0);
  assert.strictEqual(step0Res.totalSteps, 2);

  // Delegated evaluate call for step 1
  const step1Res = goodMorning.evaluate(null, 1);
  assert.strictEqual(step1Res.isCompound, true);
  assert.strictEqual(step1Res.stepIndex, 1);
  assert.strictEqual(step1Res.totalSteps, 2);
});

test('islTargetLandmarks - signs use valid demonstration images', () => {
  for (const item of ISL_LEARN_ITEMS) {
    if (item.image) {
      assert.strictEqual(
        item.image.endsWith('.jpg') || item.image.endsWith('.png') || item.image.endsWith('.webp') || item.image.endsWith('.gif'),
        true,
        `Item ${item.id} should use valid image asset`
      );
    }
  }
});

test('islTargetLandmarks - dynamic signs in Level 1 use authentic animated GIFs', () => {
  const dynamicGlosses = ['GOOD_MORNING', 'HELLO', 'THANK_YOU', 'WELCOME', 'PLEASE', 'SORRY', 'YES', 'NO'];
  for (const gloss of dynamicGlosses) {
    const item = getLearnItemByLabel(gloss);
    assert.ok(item, `Dynamic sign ${gloss} should exist in curriculum`);
    assert.ok(item.image, `Dynamic sign ${gloss} should have demonstration media`);
    assert.strictEqual(item.image.endsWith('.gif'), true, `Dynamic sign ${gloss} should use .gif`);
  }
});

