import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as ort from 'onnxruntime-web';
import { getTopKPredictions } from '../src/ai/softmax.js';
import { ISL_ALPHABET_LABELS } from '../src/ai/islAlphabetLabels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('alphabetClassifier - loads public/models/isl_alphabet_mlp.onnx and executes inference', async () => {
  const modelPath = path.resolve(__dirname, '../public/models/isl_alphabet_mlp.onnx');
  assert.strictEqual(fs.existsSync(modelPath), true, 'Model file must exist at public/models/isl_alphabet_mlp.onnx');

  const modelBuffer = fs.readFileSync(modelPath);
  assert.strictEqual(modelBuffer.length > 10000, true, 'Model buffer must be >10KB');

  // Create ONNX inference session
  const session = await ort.InferenceSession.create(modelBuffer);
  assert.strictEqual(session != null, true);

  // Validate input/output names
  assert.deepStrictEqual(session.inputNames, ['input']);
  assert.deepStrictEqual(session.outputNames, ['output']);

  // Create 240-float normalized test input
  const inputFeatures = new Float32Array(240);
  for (let i = 0; i < 240; i++) {
    inputFeatures[i] = Math.sin(i * 0.1);
  }

  const inputTensor = new ort.Tensor('float32', inputFeatures, [1, 240]);
  const outputs = await session.run({ input: inputTensor });

  assert.strictEqual(outputs.output != null, true);
  assert.strictEqual(outputs.output.data.length, 36);
  assert.deepStrictEqual(outputs.output.dims, [1, 36]);

  // Pass output logits into getTopKPredictions
  const predictions = getTopKPredictions(outputs.output.data, ISL_ALPHABET_LABELS, 3, 0.75);

  assert.strictEqual(predictions.length, 3);
  assert.strictEqual(predictions[0].rank, 1);
  assert.strictEqual(typeof predictions[0].label, 'string');
  assert.strictEqual(typeof predictions[0].confidence, 'number');
  assert.strictEqual(typeof predictions[0].isConfident, 'boolean');
  assert.strictEqual(predictions[0].confidence >= predictions[1].confidence, true);
  assert.strictEqual(predictions[1].confidence >= predictions[2].confidence, true);
});
