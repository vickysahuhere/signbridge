import { test } from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { extractAndNormalizeFrame } from '../src/vision/normalizeLandmarks.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

test('normalizeLandmarksComparison - JS and Python normalization produce identical 240-float vectors', (t) => {
  const fixturePath = path.resolve(__dirname, 'fixtures/sample_landmarks.json');
  assert.strictEqual(fs.existsSync(fixturePath), true, 'Fixture file must exist');

  const rawJson = fs.readFileSync(fixturePath, 'utf-8');
  const landmarks = JSON.parse(rawJson);

  // 1. Run JavaScript normalization
  const jsResult = extractAndNormalizeFrame(landmarks);
  assert.strictEqual(jsResult.features.length, 240);

  // 2. Run Python normalization using scripts/extract_keypoints.py
  const pythonScript = `
import json, sys
import numpy as np
from scripts.extract_keypoints import normalize_frame_landmarks

with open(r"${fixturePath.replace(/\\/g, '\\\\')}", "r", encoding="utf-8") as f:
    data = json.load(f)

feats = normalize_frame_landmarks(
    data.get("leftHandLandmarks"),
    data.get("rightHandLandmarks"),
    data.get("poseLandmarks"),
    data.get("faceLandmarks")
)
print(json.dumps([round(float(x), 6) for x in feats]))
`;

  const candidates = [process.env.PYTHON, 'python3', 'python'].filter(Boolean);
  let stdout = null;
  for (const exe of candidates) {
    try {
      stdout = execFileSync(exe, ['-c', pythonScript], { encoding: 'utf-8' });
      break;
    } catch { /* try next */ }
  }
  if (stdout === null) return t.skip('Python (with numpy) not available');
  const pyFeatures = JSON.parse(stdout.trim());

  assert.strictEqual(pyFeatures.length, 240);

  // 3. Compare all 240 float values (tolerance: 1e-4)
  for (let i = 0; i < 240; i++) {
    const jsVal = jsResult.features[i];
    const pyVal = pyFeatures[i];
    const diff = Math.abs(jsVal - pyVal);
    assert.strictEqual(
      diff < 1e-4,
      true,
      `Feature index ${i} mismatch: JS=${jsVal}, Python=${pyVal}, diff=${diff}`
    );
  }
});
