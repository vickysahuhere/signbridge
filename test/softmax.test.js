import { test } from 'node:test';
import assert from 'node:assert';
import { softmax, getTopKPredictions } from '../src/ai/softmax.js';
import { ISL_ALPHABET_LABELS } from '../src/ai/islAlphabetLabels.js';

test('softmax - produces valid probability distribution summing strictly to 1.0', () => {
  const logits = [2.0, 1.0, 0.1, -1.0, 3.5];
  const probs = softmax(logits);

  assert.strictEqual(probs instanceof Float32Array, true);
  assert.strictEqual(probs.length, logits.length);

  let sum = 0;
  for (let i = 0; i < probs.length; i++) {
    assert.strictEqual(probs[i] >= 0 && probs[i] <= 1, true);
    assert.strictEqual(Number.isNaN(probs[i]), false);
    sum += probs[i];
  }

  assert.strictEqual(Math.abs(sum - 1.0) < 1e-5, true);
});

test('softmax - numerical stability handles extreme large and small values without NaN or Inf', () => {
  // Extreme values that would cause normal Math.exp() to overflow to Infinity
  const extremeLogits = [1000.0, 999.0, -1000.0, 500.0];
  const probs = softmax(extremeLogits);

  for (let i = 0; i < probs.length; i++) {
    assert.strictEqual(Number.isFinite(probs[i]), true);
    assert.strictEqual(Number.isNaN(probs[i]), false);
  }

  // The largest logit (index 0) must hold nearly all the probability mass
  assert.strictEqual(probs[0] > 0.70, true);
  // Extremely small logit must be near 0
  assert.strictEqual(probs[2] < 1e-10, true);
});

test('getTopKPredictions - ranks candidates in descending order with correct labels', () => {
  // Mock logits where index 0 ('A') has 10.0, index 1 ('B') has 5.0, index 2 ('C') has 2.0
  const logits = new Float32Array(36);
  logits[0] = 10.0; // 'A'
  logits[1] = 5.0;  // 'B'
  logits[2] = 2.0;  // 'C'

  const top3 = getTopKPredictions(logits, ISL_ALPHABET_LABELS, 3, 0.75);

  assert.strictEqual(top3.length, 3);
  assert.strictEqual(top3[0].rank, 1);
  assert.strictEqual(top3[0].label, 'A');
  assert.strictEqual(top3[0].isConfident, true);
  assert.strictEqual(top3[0].confidence > 0.75, true);

  assert.strictEqual(top3[1].rank, 2);
  assert.strictEqual(top3[1].label, 'B');
  assert.strictEqual(top3[1].isConfident, false);

  assert.strictEqual(top3[2].rank, 3);
  assert.strictEqual(top3[2].label, 'C');
  assert.strictEqual(top3[2].isConfident, false);
});

test('getTopKPredictions - enforces confidence threshold gating', () => {
  // Uniform logits -> each class has ~1/36 = ~2.7% probability
  const uniformLogits = new Float32Array(36).fill(1.0);
  const predictions = getTopKPredictions(uniformLogits, ISL_ALPHABET_LABELS, 3, 0.75);

  assert.strictEqual(predictions.length, 3);
  // None should be marked as confident since ~0.027 < 0.75
  assert.strictEqual(predictions[0].isConfident, false);
  assert.strictEqual(predictions[1].isConfident, false);
  assert.strictEqual(predictions[2].isConfident, false);
});
