import { test } from 'node:test';
import assert from 'node:assert';
import { VelocityGate, MOTION_STATES } from '../src/vision/velocityGate.js';

test('VelocityGate - exports expected MOTION_STATES enum', () => {
  assert.strictEqual(MOTION_STATES.IDLE, 'IDLE');
  assert.strictEqual(MOTION_STATES.SIGNING_ACTIVE, 'SIGNING_ACTIVE');
  assert.strictEqual(MOTION_STATES.PAUSE_COUNTDOWN, 'PAUSE_COUNTDOWN');
  assert.strictEqual(MOTION_STATES.IDLE_COMMIT, 'IDLE_COMMIT');
});

test('VelocityGate - stationary wrists initially remain in IDLE state', () => {
  const gate = new VelocityGate({ commitDurationMs: 1200 });

  // Stationary wrist at (0.2, 0.5, 0)
  const wrist = { x: 0.2, y: 0.5, z: 0 };
  let result;
  for (let i = 0; i < 5; i++) {
    result = gate.update(wrist, null, 1000 + i * 33);
  }

  assert.strictEqual(result.state, MOTION_STATES.IDLE);
  assert.strictEqual(result.rollingVelocity, 0);
  assert.strictEqual(result.pauseProgress, 0);
});

test('VelocityGate - moving wrists transition to SIGNING_ACTIVE', () => {
  const gate = new VelocityGate({ activeThreshold: 0.015, windowSize: 5 });

  let result;
  let t = 1000;
  // Wrist moves at 0.03 normalized units per frame
  for (let i = 0; i < 6; i++) {
    const wrist = { x: 0.2 + i * 0.03, y: 0.5, z: 0 };
    result = gate.update(wrist, null, t);
    t += 33;
  }

  assert.strictEqual(result.state, MOTION_STATES.SIGNING_ACTIVE);
  assert.strictEqual(result.rollingVelocity >= 0.015, true);
  assert.strictEqual(result.pauseProgress, 0);
});

test('VelocityGate - stopping motion triggers PAUSE_COUNTDOWN and progresses towards 1.0', () => {
  const gate = new VelocityGate({
    activeThreshold: 0.015,
    idleThreshold: 0.008,
    commitDurationMs: 1200,
    windowSize: 3
  });

  let t = 1000;
  // Step 1: Active signing movement
  for (let i = 0; i < 5; i++) {
    gate.update({ x: 0.2 + i * 0.04, y: 0.5, z: 0 }, null, t);
    t += 33;
  }
  assert.strictEqual(gate.state, MOTION_STATES.SIGNING_ACTIVE);

  // Step 2: Hands stop moving at current position
  const stoppedWrist = { x: 0.4, y: 0.5, z: 0 };

  // Fill moving average window with stationary frames to drop below idleThreshold
  for (let i = 0; i < 3; i++) {
    gate.update(stoppedWrist, null, t);
    t += 33;
  }

  // Next frame should now be in PAUSE_COUNTDOWN
  let pauseRes = gate.update(stoppedWrist, null, t);
  assert.strictEqual(pauseRes.state, MOTION_STATES.PAUSE_COUNTDOWN);

  // Advance time by 600ms (50% through the 1200ms commit countdown)
  t += 600;
  pauseRes = gate.update(stoppedWrist, null, t);
  assert.strictEqual(pauseRes.state, MOTION_STATES.PAUSE_COUNTDOWN);
  assert.strictEqual(pauseRes.pauseProgress >= 0.45 && pauseRes.pauseProgress <= 0.65, true);
});

test('VelocityGate - 1.2s pause triggers IDLE_COMMIT then transitions back to IDLE', () => {
  const gate = new VelocityGate({
    activeThreshold: 0.015,
    idleThreshold: 0.008,
    commitDurationMs: 1200,
    windowSize: 3
  });

  let t = 1000;
  // Active signing
  for (let i = 0; i < 4; i++) {
    gate.update({ x: 0.2 + i * 0.05, y: 0.5, z: 0 }, null, t);
    t += 33;
  }
  assert.strictEqual(gate.state, MOTION_STATES.SIGNING_ACTIVE);

  // Hands stop moving - feed stationary frames to clear moving average window
  const restWrist = { x: 0.4, y: 0.5, z: 0 };
  let pauseRes;
  for (let i = 0; i < 5; i++) {
    pauseRes = gate.update(restWrist, null, t);
    t += 33;
  }
  assert.strictEqual(pauseRes.state, MOTION_STATES.PAUSE_COUNTDOWN);

  // Advance by full 1250ms (>= 1200ms commitDurationMs)
  t += 1250;
  const commitRes = gate.update(restWrist, null, t);

  assert.strictEqual(commitRes.state, MOTION_STATES.IDLE_COMMIT);
  assert.strictEqual(commitRes.pauseProgress, 1.0);

  // Following frame should cleanly transition to IDLE
  t += 33;
  const nextRes = gate.update(restWrist, null, t);
  assert.strictEqual(nextRes.state, MOTION_STATES.IDLE);
  assert.strictEqual(nextRes.pauseProgress, 0.0);
});

test('VelocityGate - reset() clears all state back to initial IDLE', () => {
  const gate = new VelocityGate();
  gate.update({ x: 0.1, y: 0.1, z: 0 }, null, 100);
  gate.update({ x: 0.5, y: 0.5, z: 0 }, null, 133);
  gate.update({ x: 0.9, y: 0.9, z: 0 }, null, 166);

  gate.reset();
  assert.strictEqual(gate.state, MOTION_STATES.IDLE);
  assert.strictEqual(gate.prevLeftWrist, null);
  assert.strictEqual(gate.prevRightWrist, null);
  assert.strictEqual(gate.velocityWindow.length, 0);
});
