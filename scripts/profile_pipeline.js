/**
 * scripts/profile_pipeline.js
 * Comprehensive profiling and latency measurement script for SignBridge ISL pipeline stages.
 * Run with: node scripts/profile_pipeline.js
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { performance } from 'node:perf_hooks';
import * as ort from 'onnxruntime-web';
import { extractAndNormalizeFrame } from '../src/vision/normalizeLandmarks.js';
import { RingBuffer } from '../src/vision/RingBuffer.js';
import { VelocityGate, MOTION_STATES } from '../src/vision/velocityGate.js';
import { ConsecutiveConfirmationGate } from '../src/ai/consecutiveConfirmation.js';
import { classifyIslAlphabet, classifyIslWord } from '../src/ai/islGestureEngine.js';
import { formatIslSentence, formatRawGlosses } from '../src/nlp/islSentenceFormatter.js';
import { GlossBufferManager } from '../src/nlp/glossBufferManager.js';
import { softmax, getTopKPredictions } from '../src/ai/softmax.js';
import { ISL_WORD_LABELS } from '../src/ai/islWordLabels.js';
import { ISL_ALPHABET_LABELS } from '../src/ai/islAlphabetLabels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

// Helper to calculate statistics (mean, std, min, p50, p95, max)
function computeStats(samples) {
  if (samples.length === 0) return { mean: 0, min: 0, p50: 0, p95: 0, max: 0 };
  const sorted = [...samples].sort((a, b) => a - b);
  const sum = sorted.reduce((acc, v) => acc + v, 0);
  const mean = sum / sorted.length;
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const p50 = sorted[Math.floor(sorted.length * 0.50)];
  const p95 = sorted[Math.floor(sorted.length * 0.95)];
  return { mean, min, p50, p95, max };
}

// Generate realistic mock holistic landmark results
function generateMockHolisticResults() {
  const leftHand = [];
  const rightHand = [];
  const pose = [];
  const face = [];

  for (let i = 0; i < 21; i++) {
    leftHand.push({ x: 0.45 + (i * 0.005), y: 0.55 + (i * 0.002), z: 0.01 * (i % 3) });
    rightHand.push({ x: 0.55 - (i * 0.005), y: 0.55 + (i * 0.002), z: 0.01 * (i % 3) });
  }

  for (let i = 0; i < 33; i++) {
    pose.push({ x: 0.5 + (i * 0.002), y: 0.4 + (i * 0.01), z: 0.05, visibility: 0.9 });
  }

  for (let i = 0; i < 468; i++) {
    face.push({ x: 0.5, y: 0.3, z: 0.0 });
  }

  return {
    leftHandLandmarks: [leftHand],
    rightHandLandmarks: [rightHand],
    poseLandmarks: [pose],
    faceLandmarks: [face]
  };
}

async function runProfiling() {
  console.log('='.repeat(70));
  console.log('SignBridge ISL (Sanket) — Pipeline Latency & Benchmark Profiler');
  console.log('Environment: Node.js', process.version, 'on', process.platform, process.arch);
  console.log('='.repeat(70));

  const ITERATIONS = 200;
  const WARMUP = 20;

  // STAGE 1: Feature Extraction & Normalization
  console.log(`\n[Stage 1] Landmark Normalization (extractAndNormalizeFrame)...`);
  const mockHolistic = generateMockHolisticResults();
  const normTimes = [];

  for (let i = 0; i < ITERATIONS + WARMUP; i++) {
    const t0 = performance.now();
    const normalized = extractAndNormalizeFrame(mockHolistic);
    const dt = performance.now() - t0;
    if (i >= WARMUP) normTimes.push(dt);
  }
  const normStats = computeStats(normTimes);
  console.log(`  Samples: ${ITERATIONS} | Mean: ${normStats.mean.toFixed(3)} ms | Min: ${normStats.min.toFixed(3)} ms | p95: ${normStats.p95.toFixed(3)} ms | Max: ${normStats.max.toFixed(3)} ms`);

  // STAGE 2: RingBuffer Operations
  console.log(`\n[Stage 2] RingBuffer Push & GetFlattened (30 x 240 floats = 7,200)...`);
  const ringBuffer = new RingBuffer(30, 240);
  const dummyFeatures = new Float32Array(240);
  const ringBufferTimes = [];

  for (let i = 0; i < ITERATIONS + WARMUP; i++) {
    const t0 = performance.now();
    ringBuffer.push(dummyFeatures);
    const flattened = ringBuffer.getFlattened();
    const dt = performance.now() - t0;
    if (i >= WARMUP) ringBufferTimes.push(dt);
  }
  const ringStats = computeStats(ringBufferTimes);
  console.log(`  Samples: ${ITERATIONS} | Mean: ${ringStats.mean.toFixed(3)} ms | Min: ${ringStats.min.toFixed(3)} ms | p95: ${ringStats.p95.toFixed(3)} ms | Max: ${ringStats.max.toFixed(3)} ms`);

  // STAGE 3: VelocityGate Motion Analysis
  console.log(`\n[Stage 3] VelocityGate update (5-frame window motion energy)...`);
  const velocityGate = new VelocityGate({ commitDurationMs: 1200 });
  const velocityTimes = [];
  const leftWrist = { x: 0.45, y: 0.55, z: 0.0 };
  const rightWrist = { x: 0.55, y: 0.55, z: 0.0 };

  for (let i = 0; i < ITERATIONS + WARMUP; i++) {
    const t0 = performance.now();
    velocityGate.update(leftWrist, rightWrist, 1000 + i * 33.33);
    const dt = performance.now() - t0;
    if (i >= WARMUP) velocityTimes.push(dt);
  }
  const velStats = computeStats(velocityTimes);
  console.log(`  Samples: ${ITERATIONS} | Mean: ${velStats.mean.toFixed(3)} ms | Min: ${velStats.min.toFixed(3)} ms | p95: ${velStats.p95.toFixed(3)} ms | Max: ${velStats.max.toFixed(3)} ms`);

  // STAGE 4: Hand-written Rule Gesture Engine (classifyIslWord & classifyIslAlphabet)
  console.log(`\n[Stage 4] Hand-written Rule Gesture Engine (geometric if/else logic)...`);
  const leftHand = mockHolistic.leftHandLandmarks[0];
  const rightHand = mockHolistic.rightHandLandmarks[0];
  const pose = mockHolistic.poseLandmarks[0];
  const motion = { state: 'SIGNING_ACTIVE', rollingVelocity: 0.05 };

  const wordRuleTimes = [];
  for (let i = 0; i < ITERATIONS + WARMUP; i++) {
    const t0 = performance.now();
    const wordResults = classifyIslWord(leftHand, rightHand, pose, motion);
    const dt = performance.now() - t0;
    if (i >= WARMUP) wordRuleTimes.push(dt);
  }
  const wordRuleStats = computeStats(wordRuleTimes);
  console.log(`  Word Rules: Samples: ${ITERATIONS} | Mean: ${wordRuleStats.mean.toFixed(3)} ms | Min: ${wordRuleStats.min.toFixed(3)} ms | p95: ${wordRuleStats.p95.toFixed(3)} ms | Max: ${wordRuleStats.max.toFixed(3)} ms`);

  const alphaRuleTimes = [];
  for (let i = 0; i < ITERATIONS + WARMUP; i++) {
    const t0 = performance.now();
    const alphaResults = classifyIslAlphabet(leftHand, rightHand, pose);
    const dt = performance.now() - t0;
    if (i >= WARMUP) alphaRuleTimes.push(dt);
  }
  const alphaRuleStats = computeStats(alphaRuleTimes);
  console.log(`  Alphabet Rules: Samples: ${ITERATIONS} | Mean: ${alphaRuleStats.mean.toFixed(3)} ms | Min: ${alphaRuleStats.min.toFixed(3)} ms | p95: ${alphaRuleStats.p95.toFixed(3)} ms | Max: ${alphaRuleStats.max.toFixed(3)} ms`);

  // STAGE 5: ONNX Model Inference Latency
  console.log(`\n[Stage 5] ONNX Runtime Web Model Inference Latencies (WASM single-thread)...`);
  const alphabetModelPath = path.join(ROOT_DIR, 'public', 'models', 'isl_alphabet_mlp.onnx');
  const wordModelPath = path.join(ROOT_DIR, 'public', 'models', 'isl_include_50.onnx');
  const tier2ModelPath = path.join(ROOT_DIR, 'public', 'models', 'isl_tier2_260.onnx');

  if (fs.existsSync(alphabetModelPath)) {
    const session = await ort.InferenceSession.create(fs.readFileSync(alphabetModelPath));
    const input = new ort.Tensor('float32', new Float32Array(240), [1, 240]);
    // Warmup
    for (let i = 0; i < 5; i++) await session.run({ input });

    const onnxAlphaTimes = [];
    for (let i = 0; i < 50; i++) {
      const t0 = performance.now();
      await session.run({ input });
      onnxAlphaTimes.push(performance.now() - t0);
    }
    const onnxAlphaStats = computeStats(onnxAlphaTimes);
    console.log(`  Alphabet ONNX [1, 240]: Mean: ${onnxAlphaStats.mean.toFixed(2)} ms | Min: ${onnxAlphaStats.min.toFixed(2)} ms | p95: ${onnxAlphaStats.p95.toFixed(2)} ms | Max: ${onnxAlphaStats.max.toFixed(2)} ms`);
  }

  if (fs.existsSync(wordModelPath)) {
    const session = await ort.InferenceSession.create(fs.readFileSync(wordModelPath));
    const input = new ort.Tensor('float32', new Float32Array(7200), [1, 7200]);
    // Warmup
    for (let i = 0; i < 5; i++) await session.run({ input });

    const onnxWordTimes = [];
    for (let i = 0; i < 50; i++) {
      const t0 = performance.now();
      await session.run({ input });
      onnxWordTimes.push(performance.now() - t0);
    }
    const onnxWordStats = computeStats(onnxWordTimes);
    console.log(`  Word 50-class ONNX [1, 7200]: Mean: ${onnxWordStats.mean.toFixed(2)} ms | Min: ${onnxWordStats.min.toFixed(2)} ms | p95: ${onnxWordStats.p95.toFixed(2)} ms | Max: ${onnxWordStats.max.toFixed(2)} ms`);
  }

  if (fs.existsSync(tier2ModelPath)) {
    const session = await ort.InferenceSession.create(fs.readFileSync(tier2ModelPath));
    const input = new ort.Tensor('float32', new Float32Array(7200), [1, 7200]);
    // Warmup
    for (let i = 0; i < 5; i++) await session.run({ input });

    const onnxTier2Times = [];
    for (let i = 0; i < 50; i++) {
      const t0 = performance.now();
      await session.run({ input });
      onnxTier2Times.push(performance.now() - t0);
    }
    const onnxTier2Stats = computeStats(onnxTier2Times);
    console.log(`  Word 260-class ONNX [1, 7200]: Mean: ${onnxTier2Stats.mean.toFixed(2)} ms | Min: ${onnxTier2Stats.min.toFixed(2)} ms | p95: ${onnxTier2Stats.p95.toFixed(2)} ms | Max: ${onnxTier2Stats.max.toFixed(2)} ms`);
  }

  // STAGE 6: Consecutive Confirmation Gate Delay Analysis
  console.log(`\n[Stage 6] Confirmation Gate Delay (Frame Hysteresis)...`);
  const wordGateConfig = { confidenceThreshold: 0.80, requiredConsecutive: 3, cooldownFrames: 8 };
  const alphaGateConfig = { confidenceThreshold: 0.78, requiredConsecutive: 3, cooldownFrames: 6 };

  // Assuming camera runs at 30 fps (33.33 ms / frame)
  const fps30Interval = 1000 / 30; // 33.33 ms
  const wordGateDelayMs = wordGateConfig.requiredConsecutive * fps30Interval;
  const alphaGateDelayMs = alphaGateConfig.requiredConsecutive * fps30Interval;
  console.log(`  Tuned Word Gate: requiredConsecutive = ${wordGateConfig.requiredConsecutive} frames -> ${wordGateDelayMs.toFixed(1)} ms at 30 FPS (was 6 frames = 200.0 ms)`);
  console.log(`  Tuned Alphabet Gate: requiredConsecutive = ${alphaGateConfig.requiredConsecutive} frames -> ${alphaGateDelayMs.toFixed(1)} ms at 30 FPS (was 5 frames = 166.7 ms)`);

  // STAGE 7: Commit Pause Delay Analysis
  console.log(`\n[Stage 7] Signing Cessation to Commit Delay (VelocityGate)...`);
  const commitDurationMs = 700; // tuned default: 700ms (configurable)
  console.log(`  Tuned commitDurationMs: ${commitDurationMs} ms (was fixed 1200 ms, now configurable)`);

  // STAGE 8: Linguistic Grammar Formatting
  console.log(`\n[Stage 8] Deterministic Grammar Formatting (formatIslSentence)...`);
  const testPhrases = [
    ['NAMASTE'],
    ['YOU', 'NAME', 'WHAT'],
    ['I_ME', 'WATER', 'WANT'],
    ['HOSPITAL', 'WHERE'],
    ['I_ME', 'FOOD', 'EAT', 'NO']
  ];
  const grammarTimes = [];
  for (let i = 0; i < ITERATIONS + WARMUP; i++) {
    const phrase = testPhrases[i % testPhrases.length];
    const t0 = performance.now();
    const formatted = formatIslSentence(phrase);
    const dt = performance.now() - t0;
    if (i >= WARMUP) grammarTimes.push(dt);
  }
  const grammarStats = computeStats(grammarTimes);
  console.log(`  Grammar Formatting: Mean: ${grammarStats.mean.toFixed(3)} ms | p95: ${grammarStats.p95.toFixed(3)} ms | Max: ${grammarStats.max.toFixed(3)} ms`);

  // STAGE 9: End-to-End Latency Estimation & Breakdown
  console.log(`\n[Stage 9] End-to-End Sign-to-Text Latency Summary`);
  console.log('='.repeat(70));
  console.log(`| Stage                                 | Latency (ms)     | Nature     |`);
  console.log(`|---------------------------------------|------------------|------------|`);
  console.log(`| Camera Frame Interval (30 FPS)        | 33.3 ms          | Hardware   |`);
  console.log(`| Landmark Normalization                | ${normStats.mean.toFixed(2)} ms           | Sync CPU   |`);
  console.log(`| RingBuffer Push + Flatten             | ${ringStats.mean.toFixed(2)} ms           | Sync CPU   |`);
  console.log(`| VelocityGate Motion Update            | ${velStats.mean.toFixed(2)} ms           | Sync CPU   |`);
  console.log(`| Rule Classifier (Word/Alphabet)       | ${(wordRuleStats.mean + alphaRuleStats.mean).toFixed(2)} ms           | Sync CPU   |`);
  console.log(`| Word Gate Delay (6 frames @ 30 FPS)   | ${wordGateDelayMs.toFixed(1)} ms         | Hysteresis |`);
  console.log(`| Auto-commit Pause Delay               | ${commitDurationMs.toFixed(1)} ms        | State Gate |`);
  console.log(`| Grammar Formatting                    | ${grammarStats.mean.toFixed(2)} ms           | Sync CPU   |`);
  console.log(`|---------------------------------------|------------------|------------|`);
  const totalE2E = wordGateDelayMs + commitDurationMs + grammarStats.mean;
  console.log(`| TOTAL Sign-to-Committed-Text Delay   | ${totalE2E.toFixed(1)} ms (~${(totalE2E/1000).toFixed(2)}s) | End-to-End |`);
  console.log('='.repeat(70));

  return {
    normStats,
    ringStats,
    velStats,
    wordRuleStats,
    alphaRuleStats,
    wordGateDelayMs,
    commitDurationMs,
    grammarStats,
    totalE2E
  };
}

runProfiling().catch(console.error);
