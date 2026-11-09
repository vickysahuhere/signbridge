import { test } from 'node:test';
import assert from 'node:assert';
import { analyzeTrajectory, extractKinematicsFromRingBuffer } from '../src/vision/kinematics.js';
import { RingBuffer } from '../src/vision/RingBuffer.js';
import { classifyIslWord } from '../src/ai/islGestureEngine.js';

test('analyzeTrajectory - returns stationary defaults on insufficient frames', () => {
  const result = analyzeTrajectory([{ x: 0.5, y: 0.5 }]);
  assert.strictEqual(result.isStationary, true);
  assert.strictEqual(result.isNodding, false);
  assert.strictEqual(result.isWaving, false);
  assert.strictEqual(result.verticalOscillations, 0);
});

test('analyzeTrajectory - detects vertical nodding motion (for dynamic YES sign)', () => {
  // Simulate fist moving down, up, down, up in Y axis
  const nodPoints = [
    { x: 0.50, y: 0.40 },
    { x: 0.50, y: 0.43 },
    { x: 0.51, y: 0.47 }, // trough (down)
    { x: 0.50, y: 0.44 },
    { x: 0.50, y: 0.39 }, // peak (up)
    { x: 0.51, y: 0.43 },
    { x: 0.50, y: 0.48 }  // trough (down)
  ];

  const result = analyzeTrajectory(nodPoints);
  assert.strictEqual(result.isNodding, true, 'Must detect vertical nodding trajectory');
  assert.ok(result.verticalOscillations >= 2, 'Must count at least 2 vertical direction reversals');
  assert.strictEqual(result.isStationary, false);
  assert.strictEqual(result.isWaving, false);
});

test('analyzeTrajectory - detects horizontal waving motion (for dynamic NO / HELLO)', () => {
  // Simulate hand moving left, right, left, right in X axis
  const wavePoints = [
    { x: 0.40, y: 0.30 },
    { x: 0.45, y: 0.30 },
    { x: 0.50, y: 0.31 }, // right
    { x: 0.44, y: 0.30 },
    { x: 0.38, y: 0.30 }, // left
    { x: 0.45, y: 0.30 },
    { x: 0.51, y: 0.31 }  // right
  ];

  const result = analyzeTrajectory(wavePoints);
  assert.strictEqual(result.isWaving, true, 'Must detect horizontal waving trajectory');
  assert.ok(result.horizontalOscillations >= 2, 'Must count horizontal reversals');
  assert.strictEqual(result.isNodding, false);
  assert.strictEqual(result.isStationary, false);
});

test('analyzeTrajectory - detects stationary hands (rejects false positive dynamic signs)', () => {
  // Simulate stationary fist held still (e.g. resting or holding letter S/A)
  const stillPoints = [
    { x: 0.500, y: 0.400 },
    { x: 0.502, y: 0.401 },
    { x: 0.499, y: 0.399 },
    { x: 0.501, y: 0.400 },
    { x: 0.500, y: 0.402 },
    { x: 0.501, y: 0.401 }
  ];

  const result = analyzeTrajectory(stillPoints);
  assert.strictEqual(result.isStationary, true, 'Must classify motionless hand as stationary');
  assert.strictEqual(result.isNodding, false, 'Must NOT classify stationary hand as nodding');
  assert.strictEqual(result.isWaving, false, 'Must NOT classify stationary hand as waving');
  assert.strictEqual(result.verticalOscillations, 0);
});

test('analyzeTrajectory - detects circular rubbing motion (for PLEASE and SORRY)', () => {
  // Simulate circular trajectory around (0.5, 0.4)
  const circlePoints = [];
  const radius = 0.05;
  for (let i = 0; i < 12; i++) {
    const angle = (i / 12) * 2 * Math.PI;
    circlePoints.push({
      x: 0.5 + Math.cos(angle) * radius,
      y: 0.4 + Math.sin(angle) * radius
    });
  }

  const result = analyzeTrajectory(circlePoints);
  assert.strictEqual(result.isCircular, true, 'Must identify circular rubbing movement');
  assert.strictEqual(result.isStationary, false);
});

test('extractKinematicsFromRingBuffer - integrates seamlessly with RingBuffer sliding window', () => {
  const ringBuffer = new RingBuffer(30, 240);

  // Push 10 frames with vertical nodding in right hand (indices 63 to 125)
  for (let i = 0; i < 10; i++) {
    const frame = new Float32Array(240);
    const yVal = 0.35 + Math.sin(i * 0.8) * 0.05; // Oscillates up and down
    frame[63] = 0.50; // right wrist x
    frame[64] = yVal; // right wrist y
    frame[90] = 0.50; // right middle MCP x
    frame[91] = yVal - 0.05; // right middle MCP y
    ringBuffer.push(frame);
  }

  const kinematics = ringBuffer.getKinematics(10);
  assert.strictEqual(kinematics.isNodding, true, 'RingBuffer kinematics must detect nodding');
  assert.strictEqual(kinematics.isStationary, false);
});

test('islGestureEngine - dynamic YES vs stationary fist ("without it")', () => {
  // Create a fist hand in chest area
  const fistHand = [
    { x: 0.5, y: 0.45, z: 0 }, // wrist (0)
    ...Array(4).fill({ x: 0.49, y: 0.42, z: 0 }), // thumb curled
    ...Array(4).fill({ x: 0.50, y: 0.42, z: 0 }), // index curled
    ...Array(4).fill({ x: 0.51, y: 0.42, z: 0 }), // middle curled
    ...Array(4).fill({ x: 0.52, y: 0.42, z: 0 }), // ring curled
    ...Array(4).fill({ x: 0.53, y: 0.42, z: 0 })  // pinky curled
  ];

  const pose = Array.from({ length: 33 }, () => ({ x: 0.5, y: 0.35, z: 0 }));
  pose[0] = { x: 0.5, y: 0.20, z: 0 }; // nose
  pose[11] = { x: 0.4, y: 0.35, z: 0 }; // left shoulder
  pose[12] = { x: 0.6, y: 0.35, z: 0 }; // right shoulder

  // 1. PERFORMED WITH DYNAMIC MOTION: Nodding fist
  const activeNodMotion = {
    state: 'SIGNING_ACTIVE',
    rollingVelocity: 0.03,
    isNodding: true,
    verticalOscillations: 2,
    isStationary: false
  };

  const yesWithMotion = classifyIslWord(null, fistHand, pose, activeNodMotion);
  assert.ok(yesWithMotion.length > 0, 'Must produce candidates');
  assert.strictEqual(yesWithMotion[0].label, 'YES', 'Must recognize YES when nodding motion is present');
  assert.ok(yesWithMotion[0].confidence >= 0.90, 'Must have high confidence (>= 0.90)');

  // 2. WITHOUT IT (Stationary fist without nodding motion):
  // When the fist is held still, it must NOT trigger YES!
  const stationaryMotion = {
    state: 'IDLE',
    rollingVelocity: 0.002,
    isNodding: false,
    verticalOscillations: 0,
    isStationary: true
  };

  const yesWithoutMotion = classifyIslWord(null, fistHand, pose, stationaryMotion);
  const foundYes = yesWithoutMotion.find(w => w.label === 'YES');
  assert.strictEqual(foundYes, undefined, 'Stationary fist without nodding motion MUST NOT trigger YES');
});
