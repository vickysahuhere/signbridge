import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ort from 'onnxruntime-web';
import { softmax, getTopKPredictions } from '../src/ai/softmax.js';
import { ISL_WORD_LABELS, WORD_COUNT } from '../src/ai/islWordLabels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('wordClassifier - loads public/models/isl_include_50.onnx and executes temporal sequence inference', async () => {
  const modelPath = path.resolve(__dirname, '../public/models/isl_include_50.onnx');
  assert.strictEqual(fs.existsSync(modelPath), true, 'Model file must exist at public/models/isl_include_50.onnx');

  const modelBuffer = fs.readFileSync(modelPath);
  assert.strictEqual(modelBuffer.length > 500000, true, 'Temporal model buffer must be >500KB (~1.4MB)');

  // Create ONNX inference session
  const session = await ort.InferenceSession.create(modelBuffer);
  assert.strictEqual(session != null, true);

  // Validate input/output names
  assert.deepStrictEqual(session.inputNames, ['input']);
  assert.deepStrictEqual(session.outputNames, ['output']);

  // Create 7,200-float sliding window input (30 frames x 240 floats)
  const temporalFeatures = new Float32Array(7200);
  for (let i = 0; i < 7200; i++) {
    temporalFeatures[i] = Math.cos(i * 0.05) * 0.5;
  }

  const inputTensor = new ort.Tensor('float32', temporalFeatures, [1, 7200]);
  const outputs = await session.run({ input: inputTensor });

  assert.strictEqual(outputs.output != null, true);
  assert.strictEqual(outputs.output.data.length, WORD_COUNT);
  assert.strictEqual(WORD_COUNT, 50);
  assert.deepStrictEqual(outputs.output.dims, [1, 50]);

  // Pass output logits into softmax
  const probs = softmax(outputs.output.data);
  assert.strictEqual(probs.length, 50);

  let sum = 0;
  for (let i = 0; i < 50; i++) {
    assert.strictEqual(probs[i] >= 0 && probs[i] <= 1, true);
    sum += probs[i];
  }
  assert.strictEqual(Math.abs(sum - 1.0) < 1e-4, true);

  // Extract top-3 predictions
  const glossLabels = ISL_WORD_LABELS.map(w => w.gloss);
  const top3 = getTopKPredictions(outputs.output.data, glossLabels, 3, 0.75);

  assert.strictEqual(top3.length, 3);
  assert.strictEqual(top3[0].rank, 1);
  assert.strictEqual(typeof top3[0].label, 'string');
  assert.strictEqual(typeof top3[0].confidence, 'number');
  assert.strictEqual(top3[0].confidence >= top3[1].confidence, true);
  assert.strictEqual(top3[1].confidence >= top3[2].confidence, true);
});
