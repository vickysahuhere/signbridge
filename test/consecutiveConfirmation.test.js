import { test } from 'node:test';
import assert from 'node:assert';
import { ConsecutiveConfirmationGate } from '../src/ai/consecutiveConfirmation.js';

test('ConsecutiveConfirmationGate - single high-confidence prediction remains pending without confirming', () => {
  const gate = new ConsecutiveConfirmationGate({ confidenceThreshold: 0.75, requiredConsecutive: 2 });

  const result = gate.processCandidate({ label: 'HOSPITAL', confidence: 0.88 });

  assert.strictEqual(result.confirmed, false);
  assert.strictEqual(result.pending, true);
  assert.strictEqual(result.count, 1);
});

test('ConsecutiveConfirmationGate - two consecutive matching predictions with >=0.75 trigger confirmed: true', () => {
  const gate = new ConsecutiveConfirmationGate({ confidenceThreshold: 0.75, requiredConsecutive: 2 });

  // Step 1: First observation of 'HOSPITAL'
  const res1 = gate.processCandidate({ label: 'HOSPITAL', confidence: 0.85 });
  assert.strictEqual(res1.confirmed, false);
  assert.strictEqual(res1.count, 1);

  // Step 2: Second consecutive observation of 'HOSPITAL'
  const res2 = gate.processCandidate({ label: 'HOSPITAL', confidence: 0.89 });
  assert.strictEqual(res2.confirmed, true);
  assert.strictEqual(res2.word, 'HOSPITAL');
  assert.strictEqual(res2.confidence, 0.89);
});

test('ConsecutiveConfirmationGate - changing label resets counter and rejects confirmation', () => {
  const gate = new ConsecutiveConfirmationGate({ confidenceThreshold: 0.75, requiredConsecutive: 2 });

  // Frame 1: 'HELLO' (80%)
  const res1 = gate.processCandidate({ label: 'HELLO', confidence: 0.80 });
  assert.strictEqual(res1.confirmed, false);
  assert.strictEqual(res1.count, 1);

  // Frame 2: Label fluctuates to 'WATER' (78%)
  const res2 = gate.processCandidate({ label: 'WATER', confidence: 0.78 });
  assert.strictEqual(res2.confirmed, false);
  assert.strictEqual(res2.count, 1); // Reset to 1 for the new candidate

  // Frame 3: Next frame is 'HELLO' again
  const res3 = gate.processCandidate({ label: 'HELLO', confidence: 0.82 });
  assert.strictEqual(res3.confirmed, false);
  assert.strictEqual(res3.count, 1);
});

test('ConsecutiveConfirmationGate - low confidence (<0.75) resets pending state', () => {
  const gate = new ConsecutiveConfirmationGate({ confidenceThreshold: 0.75, requiredConsecutive: 2 });

  // Frame 1: High confidence (82%)
  gate.processCandidate({ label: 'DOCTOR', confidence: 0.82 });

  // Frame 2: Dips below threshold (65%)
  const res2 = gate.processCandidate({ label: 'DOCTOR', confidence: 0.65 });
  assert.strictEqual(res2.confirmed, false);
  assert.strictEqual(res2.pending, false);
  assert.strictEqual(res2.count, 0);

  // Frame 3: Rises again, but starts over at count 1
  const res3 = gate.processCandidate({ label: 'DOCTOR', confidence: 0.80 });
  assert.strictEqual(res3.confirmed, false);
  assert.strictEqual(res3.count, 1);
});

test('ConsecutiveConfirmationGate - reset() clears all internal state', () => {
  const gate = new ConsecutiveConfirmationGate();
  gate.processCandidate({ label: 'HELP', confidence: 0.90 });

  gate.reset();
  assert.strictEqual(gate.previousCandidate, null);
  assert.strictEqual(gate.consecutiveCount, 0);
  assert.strictEqual(gate.lastConfirmedWord, null);
});
