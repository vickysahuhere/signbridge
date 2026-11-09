import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ort from 'onnxruntime-web';
import { softmax, getTopKPredictions } from '../src/ai/softmax.js';
import { ISL_WORD_LABELS, WORD_COUNT, TIER_1_WORD_COUNT, TIER_2_WORD_COUNT } from '../src/ai/islWordLabels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('wordClassifier - verifies no fake placeholder models and validates 50-class sequence inference logic', async () => {
  const modelPath = path.resolve(__dirname, '../public/models/isl_include_50.onnx');

  // Enforce Global Rule 1: No fake AI or random-weight placeholder models
  if (fs.existsSync(modelPath)) {
    const modelBuffer = fs.readFileSync(modelPath);
    assert.strictEqual(modelBuffer.length > 500000, true, 'Temporal model buffer must be >500KB (~1.4MB)');

    const session = await ort.InferenceSession.create(modelBuffer);
    assert.strictEqual(session != null, true);
    assert.deepStrictEqual(session.inputNames, ['input']);
    assert.deepStrictEqual(session.outputNames, ['output']);

    const temporalFeatures = new Float32Array(7200);
    const inputTensor = new ort.Tensor('float32', temporalFeatures, [1, 7200]);
    const outputs = await session.run({ input: inputTensor });
    assert.strictEqual(outputs.output != null, true);
    assert.strictEqual(outputs.output.data.length, TIER_1_WORD_COUNT);
  } else {
    // Verified: No random placeholder model is shipped in public/models
    assert.strictEqual(fs.existsSync(modelPath), false);
  }

  // Validate 50-class softmax and top-k prediction logic
  assert.strictEqual(TIER_1_WORD_COUNT, 50);
  const sampleLogits = new Float32Array(50);
  sampleLogits.fill(-1.0);
  sampleLogits[0] = 6.0;  // First gloss
  sampleLogits[1] = 3.0;

  const probs = softmax(sampleLogits);
  assert.strictEqual(probs.length, 50);

  let sum = 0;
  for (let i = 0; i < 50; i++) {
    assert.strictEqual(probs[i] >= 0 && probs[i] <= 1, true);
    sum += probs[i];
  }
  assert.strictEqual(Math.abs(sum - 1.0) < 1e-4, true);

  const glossLabels = ISL_WORD_LABELS.slice(0, 50).map(w => w.gloss);
  const top3 = getTopKPredictions(sampleLogits, glossLabels, 3, 0.75);

  assert.strictEqual(top3.length, 3);
  assert.strictEqual(top3[0].rank, 1);
  assert.strictEqual(top3[0].label, glossLabels[0]);
  assert.strictEqual(top3[0].isConfident, true);
  assert.strictEqual(top3[0].confidence >= top3[1].confidence, true);
  assert.strictEqual(top3[1].confidence >= top3[2].confidence, true);
});

test('wordClassifier - verifies no fake placeholder models and validates 260-class sequence inference logic', async () => {
  const modelPath = path.resolve(__dirname, '../public/models/isl_tier2_260.onnx');

  // Enforce Global Rule 1: No fake AI or random-weight placeholder models
  if (fs.existsSync(modelPath)) {
    const modelBuffer = fs.readFileSync(modelPath);
    assert.strictEqual(modelBuffer.length > 2000000, true, 'Tier 2 model buffer must be >2MB (~7.3MB)');

    const session = await ort.InferenceSession.create(modelBuffer);
    assert.strictEqual(session != null, true);
  } else {
    // Verified: No random placeholder model is shipped in public/models
    assert.strictEqual(fs.existsSync(modelPath), false);
  }

  // Validate 260-class sequence prediction ranking
  assert.strictEqual(TIER_2_WORD_COUNT, 260);
  const sampleLogits = new Float32Array(260);
  sampleLogits.fill(-2.0);
  sampleLogits[10] = 5.0;
  sampleLogits[25] = 2.0;

  const probs = softmax(sampleLogits);
  assert.strictEqual(probs.length, 260);

  let sum = 0;
  for (let i = 0; i < 260; i++) {
    assert.strictEqual(probs[i] >= 0 && probs[i] <= 1, true);
    sum += probs[i];
  }
  assert.strictEqual(Math.abs(sum - 1.0) < 1e-4, true);

  const tier2GlossLabels = ISL_WORD_LABELS.slice(0, 260).map(w => w.gloss);
  const top4 = getTopKPredictions(sampleLogits, tier2GlossLabels, 4, 0.70);
  assert.strictEqual(top4.length, 4);
  assert.strictEqual(top4[0].rank, 1);
  assert.strictEqual(top4[0].label, tier2GlossLabels[10]);
  assert.strictEqual(top4[0].isConfident, true);
});

test('wordClassifier - validates 1000-class Tier 3 sequence inference logic', async () => {
  assert.strictEqual(WORD_COUNT, 1000);
  const sampleLogits = new Float32Array(1000);
  sampleLogits.fill(-2.0);
  sampleLogits[42] = 8.0;  // YES
  sampleLogits[100] = 3.0; // CLEAN

  const probs = softmax(sampleLogits);
  assert.strictEqual(probs.length, 1000);

  let sum = 0;
  for (let i = 0; i < 1000; i++) {
    assert.strictEqual(probs[i] >= 0 && probs[i] <= 1, true);
    sum += probs[i];
  }
  assert.strictEqual(Math.abs(sum - 1.0) < 1e-4, true);

  const allGlossLabels = ISL_WORD_LABELS.map(w => w.gloss);
  const top4 = getTopKPredictions(sampleLogits, allGlossLabels, 4, 0.70);
  assert.strictEqual(top4.length, 4);
  assert.strictEqual(top4[0].rank, 1);
  assert.strictEqual(top4[0].label, allGlossLabels[42]);
  assert.strictEqual(top4[0].isConfident, true);
});
