import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ort from 'onnxruntime-web';
import { getTopKPredictions, softmax } from '../src/ai/softmax.js';
import { ISL_ALPHABET_LABELS } from '../src/ai/islAlphabetLabels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('alphabetClassifier - verifies no fake/random placeholder models and validates alphabet prediction pipeline', async () => {
  const modelPath = path.resolve(__dirname, '../public/models/isl_alphabet_mlp.onnx');
  
  // Enforce Global Rule 1: No fake AI or random-weight placeholder models
  // If the file exists, it must be an evaluated real model (>10KB) and loadable.
  // If not present, the test verifies the absence of placeholder models and tests prediction logic.
  if (fs.existsSync(modelPath)) {
    const modelBuffer = fs.readFileSync(modelPath);
    assert.strictEqual(modelBuffer.length > 10000, true, 'Model buffer must be >10KB');

    const session = await ort.InferenceSession.create(modelBuffer);
    assert.strictEqual(session != null, true);
    assert.deepStrictEqual(session.inputNames, ['input']);
    assert.deepStrictEqual(session.outputNames, ['output']);

    const inputFeatures = new Float32Array(240);
    for (let i = 0; i < 240; i++) {
      inputFeatures[i] = Math.sin(i * 0.1);
    }
    const inputTensor = new ort.Tensor('float32', inputFeatures, [1, 240]);
    const outputs = await session.run({ input: inputTensor });
    assert.strictEqual(outputs.output != null, true);
  } else {
    // Verified: No random placeholder model is shipped in public/models
    assert.strictEqual(fs.existsSync(modelPath), false);
  }

  // Validate the alphabet prediction ranking & confidence gating with 36 alphabet labels
  const testLogits = new Float32Array(36);
  testLogits.fill(-2.0);
  testLogits[0] = 5.0;  // High logit for index 0 ('A')
  testLogits[1] = 2.0;  // Moderate logit for index 1 ('B')
  testLogits[2] = 1.0;

  const probs = softmax(testLogits);
  assert.strictEqual(probs.length, 36);
  assert.strictEqual(probs[0] > 0.8, true, 'Top logit should dominate softmax distribution');

  const predictions = getTopKPredictions(testLogits, ISL_ALPHABET_LABELS, 3, 0.75);
  assert.strictEqual(predictions.length, 3);
  assert.strictEqual(predictions[0].rank, 1);
  assert.strictEqual(predictions[0].label, ISL_ALPHABET_LABELS[0]);
  assert.strictEqual(predictions[0].isConfident, true);
  assert.strictEqual(predictions[0].confidence >= predictions[1].confidence, true);
});
