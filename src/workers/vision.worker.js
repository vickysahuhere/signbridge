import { FilesetResolver, HolisticLandmarker, HandLandmarker } from '@mediapipe/tasks-vision';
import * as ort from 'onnxruntime-web';

// Polyfill custom_dbg required by MediaPipe Emscripten debug logging in strict mode
if (typeof self !== 'undefined') {
  self.custom_dbg = console.warn.bind(console);
}
if (typeof globalThis !== 'undefined') {
  globalThis.custom_dbg = console.warn.bind(console);
}
import { extractAndNormalizeFrame, getLandmarkArray } from '../vision/normalizeLandmarks.js';
import { LandmarkOneEuro } from '../vision/oneEuro.js';
import { RingBuffer } from '../vision/RingBuffer.js';
import { VelocityGate } from '../vision/velocityGate.js';
import { getTopKPredictions } from '../ai/softmax.js';
import { ISL_ALPHABET_LABELS } from '../ai/islAlphabetLabels.js';
import { ISL_WORD_LABELS } from '../ai/islWordLabels.js';
import { ConsecutiveConfirmationGate } from '../ai/consecutiveConfirmation.js';
import { classifyIslAlphabet, classifyIslWord } from '../ai/islGestureEngine.js';

let holisticLandmarker = null;
let handLandmarker = null;
// One Euro filters per side; reset when the hand disappears
const handFilters = { left: new LandmarkOneEuro(), right: new LandmarkOneEuro() };
let lastHolistic = null;
let holisticTick = 0;
const HOLISTIC_EVERY = 3; // body + face change slowly; hands are tracked every frame

function smoothHand(side, pts, t) {
  if (!pts || pts.length === 0) {
    handFilters[side].reset();
    return [];
  }
  return handFilters[side].filter(pts, t);
}

/**
 * Hands come from the dedicated HandLandmarker (full-frame palm detector + full landmark model).
 * Side is decided geometrically: on an un-mirrored camera frame the person's LEFT hand is on the
 * image's right. Pose wrists are used when available.
 */
function assignHands(handResult, pose) {
  const hands = (handResult?.landmarks || []).filter((h) => h && h.length === 21);
  let left = [];
  let right = [];
  if (hands.length === 1) {
    const h = hands[0];
    const lw = pose?.[15];
    const rw = pose?.[16];
    let isLeft;
    if (lw && rw && (lw.visibility ?? 1) > 0.3 && (rw.visibility ?? 1) > 0.3) {
      const dl = Math.hypot(h[0].x - lw.x, h[0].y - lw.y);
      const dr = Math.hypot(h[0].x - rw.x, h[0].y - rw.y);
      isLeft = dl < dr;
    } else {
      const cat = handResult?.handedness?.[0]?.[0]?.categoryName;
      isLeft = cat ? cat === 'Right' : h[0].x > 0.5; // tasks API labels assume a mirrored image
    }
    if (isLeft) left = h; else right = h;
  } else if (hands.length >= 2) {
    const sorted = [...hands].sort((a, b) => b[0].x - a[0].x);
    left = sorted[0];
    right = sorted[1];
  }
  return { left, right };
}
let isInitialized = false;

let alphabetSession = null;
let isAlphabetModelReady = false;

let wordSession = null;
let isWordModelReady = false;
let frameCounter = 0;

const wordConfirmationGate = new ConsecutiveConfirmationGate({
  confidenceThreshold: 0.85,
  requiredConsecutive: 7,
  cooldownFrames: 8,
  lockUntilRelease: true
});

const alphabetConfirmationGate = new ConsecutiveConfirmationGate({
  confidenceThreshold: 0.85,
  requiredConsecutive: 7,
  cooldownFrames: 7,
  lockUntilRelease: true
});
const WORD_GLOSS_LABELS = ISL_WORD_LABELS.map(w => w.gloss);

// Configure ONNX WASM execution
if (typeof ort !== 'undefined' && ort?.env?.wasm) {
  if (typeof self !== 'undefined' && self.crossOriginIsolated && (self.navigator?.hardwareConcurrency || 1) > 1) {
    ort.env.wasm.numThreads = Math.min(4, Math.max(1, Math.floor((self.navigator.hardwareConcurrency || 2) / 2)));
    console.log(`[vision.worker] ONNX Runtime Web multi-threading enabled: ${ort.env.wasm.numThreads} threads`);
  } else {
    ort.env.wasm.numThreads = 1;
  }
  const baseOrigin = (typeof self !== 'undefined' && self.location?.origin) || '';
  ort.env.wasm.wasmPaths = baseOrigin ? `${baseOrigin}/onnx/` : '/onnx/';
}

// 30-frame temporal buffer storing 240-float feature vectors
const ringBuffer = new RingBuffer(30, 240);

// Motion energy detector and configurable auto-commit pause state machine (default 700ms)
const velocityGate = new VelocityGate({
  activeThreshold: 0.015,
  idleThreshold: 0.008,
  commitDurationMs: 700,
  windowSize: 5
});

const DEFAULT_WASM_PATH = '/mediapipe/wasm';
const DEFAULT_MODEL_URL = '/models/holistic_landmarker.task';
const DEFAULT_ALPHABET_MODEL_URL = '/models/isl_alphabet_mlp.onnx';
const DEFAULT_WORD_MODEL_URL = '/models/isl_include_50.onnx';

/**
 * Initialize Two-Handed ISL Alphabet MLP Model
 */
async function initAlphabetModel(modelPath = DEFAULT_ALPHABET_MODEL_URL) {
  return; // no trained model ships; recognition uses the signs you train in the Teach tab
  try {
    console.log('[vision.worker] Initializing ISL Alphabet MLP from:', modelPath);
    let modelData;

    if (typeof fetch !== 'undefined') {
      try {
        const resp = await fetch(modelPath);
        if (resp.ok) {
          modelData = await resp.arrayBuffer();
        } else {
          console.info(`[vision.worker] No pre-trained alphabet model at ${modelPath} (status ${resp.status}). Using authentic 3D geometric heuristics engine.`);
          return;
        }
      } catch (fetchErr) {
        console.info('[vision.worker] Alphabet model fetch skipped, using geometric heuristics engine:', fetchErr.message);
        return;
      }
    } else {
      modelData = modelPath;
    }

    alphabetSession = await ort.InferenceSession.create(modelData, {
      executionProviders: ['wasm']
    });

    // Run dummy inference warm-up frame [1, 240]
    const dummy = new ort.Tensor('float32', new Float32Array(240), [1, 240]);
    await alphabetSession.run({ input: dummy });

    isAlphabetModelReady = true;
    console.log('[vision.worker] ISL Alphabet MLP initialized and warmed up successfully (<10ms)');
    self.postMessage({ type: 'ALPHABET_MODEL_READY' });
  } catch (err) {
    console.warn('[vision.worker] Alphabet model initialization warning:', err.message);
  }
}

/**
 * Initialize AI4Bharat INCLUDE-50 Temporal Word Model
 */
async function initWordModel(modelPath = DEFAULT_WORD_MODEL_URL) {
  return; // see above
  try {
    console.log('[vision.worker] Initializing AI4Bharat INCLUDE-50 temporal model from:', modelPath);
    let modelData;

    if (typeof fetch !== 'undefined') {
      try {
        const resp = await fetch(modelPath);
        if (resp.ok) {
          modelData = await resp.arrayBuffer();
        } else {
          console.info(`[vision.worker] No pre-trained temporal word model at ${modelPath} (status ${resp.status}). Using authentic 3D geometric heuristics engine.`);
          return;
        }
      } catch (fetchErr) {
        console.info('[vision.worker] Word model fetch skipped, using geometric heuristics engine:', fetchErr.message);
        return;
      }
    } else {
      modelData = modelPath;
    }

    wordSession = await ort.InferenceSession.create(modelData, {
      executionProviders: ['wasm']
    });

    // Run dummy inference warm-up frame [1, 7200]
    const dummy = new ort.Tensor('float32', new Float32Array(7200), [1, 7200]);
    await wordSession.run({ input: dummy });

    isWordModelReady = true;
    console.log('[vision.worker] INCLUDE-50 temporal model initialized and warmed up successfully (<15ms)');
    self.postMessage({ type: 'WORD_MODEL_READY' });
  } catch (err) {
    console.warn('[vision.worker] Word model initialization notice:', err.message);
  }
}

/**
 * Cache and load the Holistic model file using browser Cache Storage for instant future loads
 */
async function fetchAndCacheModel(modelUrl) {
  if (typeof caches !== 'undefined') {
    try {
      const cache = await caches.open('signbridge-models-v1');
      const cachedResponse = await cache.match(modelUrl);
      if (cachedResponse) {
        console.log('[vision.worker] Loaded Holistic model from Cache Storage (<300ms)');
        return URL.createObjectURL(await cachedResponse.blob());
      }

      console.log('[vision.worker] Downloading Holistic model from CDN (~14MB)...');
      const networkResponse = await fetch(modelUrl);
      if (networkResponse.ok) {
        await cache.put(modelUrl, networkResponse.clone());
        console.log('[vision.worker] Cached Holistic model in Cache Storage for instant future boots');
        return URL.createObjectURL(await networkResponse.blob());
      }
    } catch (cacheErr) {
      console.warn('[vision.worker] Cache storage error, falling back to direct URL:', cacheErr);
    }
  }
  return modelUrl;
}

/**
 * Run a dummy offscreen blank canvas frame to precompile WebGL shaders on initial boot
 */
async function runShaderWarmUp(landmarker) {
  try {
    const warmUpStart = performance.now();
    const offscreen = new OffscreenCanvas(64, 48);
    const ctx = offscreen.getContext('2d');
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 64, 48);
    const dummyBitmap = await createImageBitmap(offscreen);

    // Run first inference to force GPU shader compilation
    landmarker.detectForVideo(dummyBitmap, performance.now());
    dummyBitmap.close();

    const warmUpDuration = Math.round(performance.now() - warmUpStart);
    console.log(`[vision.worker] WebGL shaders compiled in warm-up (${warmUpDuration}ms). Future frames will run in <15ms!`);
  } catch (warmUpErr) {
    console.warn('[vision.worker] Shader warm-up skipped or non-critical notice:', warmUpErr);
  }
}

/**
 * Initialize MediaPipe Holistic Landmarker
 */
async function initVision(config = {}) {
  const startTime = performance.now();
  const baseOrigin = (typeof self !== 'undefined' && self.location?.origin) || '';
  const wasmPath = config.wasmPath || (baseOrigin ? `${baseOrigin}/mediapipe/wasm` : DEFAULT_WASM_PATH);
  const rawModelUrl = config.modelUrl || (baseOrigin ? `${baseOrigin}/models/holistic_landmarker.task` : DEFAULT_MODEL_URL);

  try {
    self.postMessage({ type: 'WORKER_STATUS', status: 'loading', message: 'Resolving WASM binaries...' });
    const vision = await FilesetResolver.forVisionTasks(wasmPath);

    // Workaround for "ModuleFactory not set" error in ES Module Web Workers:
    // Pre-fetch and evaluate the loader script into globalThis.ModuleFactory, and delete
    // wasmLoaderPath so createFromOptions uses the local factory directly without dynamic import.
    let cachedFactory = self.ModuleFactory;
    if (!cachedFactory && vision?.wasmLoaderPath) {
      try {
        const resp = await fetch(vision.wasmLoaderPath);
        if (resp.ok) {
          let scriptText = await resp.text();
          if (!scriptText.includes('self.ModuleFactory') && !scriptText.includes('globalThis.ModuleFactory')) {
            scriptText += '\nself.ModuleFactory = ModuleFactory;';
          }
          (0, eval)(scriptText);
          cachedFactory = self.ModuleFactory;
        }
      } catch (loaderErr) {
        console.warn('[vision.worker] ModuleFactory pre-load notice:', loaderErr);
      }
    }

    if (cachedFactory) {
      delete vision.wasmLoaderPath;
    }

    self.postMessage({ type: 'WORKER_STATUS', status: 'loading', message: 'Loading Holistic model...' });
    const resolvedModelPath = await fetchAndCacheModel(rawModelUrl);

    self.postMessage({ type: 'WORKER_STATUS', status: 'compiling', message: 'Initializing WebGL Landmarker...' });
    
    // Attempt GPU acceleration first, fallback to CPU if WebGL fails in worker
    let delegate = 'GPU';
    try {
      if (!self.ModuleFactory && cachedFactory) {
        self.ModuleFactory = cachedFactory;
      }
      holisticLandmarker = await HolisticLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: resolvedModelPath,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        minHandLandmarksConfidence: 0.2,
        minPoseDetectionConfidence: 0.25,
        minPosePresenceConfidence: 0.25,
        minFaceDetectionConfidence: 0.3,
        minFacePresenceConfidence: 0.3
      });
    } catch (gpuError) {
      console.warn('[vision.worker] GPU delegate failed, falling back to CPU:', gpuError);
      delegate = 'CPU';
      if (!self.ModuleFactory && cachedFactory) {
        self.ModuleFactory = cachedFactory;
      }
      holisticLandmarker = await HolisticLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: resolvedModelPath,
          delegate: 'CPU'
        },
        runningMode: 'VIDEO',
        minHandLandmarksConfidence: 0.2,
        minPoseDetectionConfidence: 0.25,
        minPosePresenceConfidence: 0.25,
        minFaceDetectionConfidence: 0.3,
        minFacePresenceConfidence: 0.3
      });
    }

    // Dedicated hand model (much steadier than holistic's wrist-seeded hand crop)
    try {
      if (!self.ModuleFactory && cachedFactory) self.ModuleFactory = cachedFactory;
      const handUrl = baseOrigin ? `${baseOrigin}/models/hand_landmarker.task` : '/models/hand_landmarker.task';
      const handPath = await fetchAndCacheModel(handUrl);
      handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: handPath, delegate },
        runningMode: 'VIDEO',
        numHands: 2,
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minTrackingConfidence: 0.5
      });
      console.log('[vision.worker] HandLandmarker ready (' + delegate + ')');
    } catch (handErr) {
      console.warn('[vision.worker] HandLandmarker unavailable, using holistic hands:', handErr);
      handLandmarker = null;
    }

    // Run WebGL shader compilation warm-up
    await runShaderWarmUp(holisticLandmarker);

    // Initialize ISL Alphabet MLP session
    await initAlphabetModel(config.alphabetModelUrl || DEFAULT_ALPHABET_MODEL_URL);

    // Initialize AI4Bharat INCLUDE-50 Temporal Model session
    await initWordModel(config.wordModelUrl || DEFAULT_WORD_MODEL_URL);

    isInitialized = true;
    const totalBootMs = Math.round(performance.now() - startTime);

    self.postMessage({
      type: 'WORKER_READY',
      delegate,
      latencyMs: totalBootMs
    });
  } catch (err) {
    console.error('[vision.worker] Failed to initialize HolisticLandmarker:', err);
    self.postMessage({
      type: 'WORKER_ERROR',
      error: err.message || 'Failed to initialize MediaPipe Holistic'
    });
  }
}

/**
 * Process a single video frame ImageBitmap
 */
async function processFrame(imageBitmap, timestamp, recognitionMode = 'word') {
  if (!isInitialized || !holisticLandmarker) {
    if (imageBitmap && typeof imageBitmap.close === 'function') {
      imageBitmap.close();
    }
    return;
  }

  const frameStart = performance.now();

  try {
    const tHolisticStart = performance.now();
    const runHolistic = !handLandmarker || !lastHolistic || holisticTick++ % HOLISTIC_EVERY === 0;
    let results;
    if (runHolistic) {
      results = holisticLandmarker.detectForVideo(imageBitmap, timestamp);
      lastHolistic = results;
    } else {
      results = lastHolistic;
    }
    if (handLandmarker) {
      try {
        const handResult = handLandmarker.detectForVideo(imageBitmap, timestamp);
        const poseArr = getLandmarkArray(results.poseLandmarks);
        const { left, right } = assignHands(handResult, poseArr);
        results = {
          ...results,
          leftHandLandmarks: smoothHand('left', left, timestamp),
          rightHandLandmarks: smoothHand('right', right, timestamp)
        };
      } catch (he) {
        console.warn('[vision.worker] hand detect error:', he?.message);
      }
    }
    const holisticMs = Math.round((performance.now() - tHolisticStart) * 10) / 10;

    // Free transferred GPU bitmap immediately
    imageBitmap.close();

    const tNormStart = performance.now();
    // 1. Normalize 80 keypoints into 240 floats (translation & scale invariant)
    const normalized = extractAndNormalizeFrame(results);

    // 2. Push 240-float frame into 30-frame FIFO RingBuffer
    ringBuffer.push(normalized.features);

    // 3. Extract multi-frame dynamic kinematics & update velocity gate
    const kinematics = ringBuffer.getKinematics(18);
    const velocityMotion = velocityGate.update(normalized.leftWrist, normalized.rightWrist, timestamp);
    const motion = {
      ...velocityMotion,
      kinematics,
      isNodding: kinematics.isNodding,
      isWaving: kinematics.isWaving,
      isCircular: kinematics.isCircular,
      isStationary: kinematics.isStationary,
      verticalOscillations: kinematics.verticalOscillations,
      horizontalOscillations: kinematics.horizontalOscillations,
      verticalDisplacement: kinematics.verticalDisplacement,
      horizontalDisplacement: kinematics.horizontalDisplacement
    };
    frameCounter++;
    const normMs = Math.round((performance.now() - tNormStart) * 10) / 10;

    const leftHand = getLandmarkArray(results.leftHandLandmarks);
    const rightHand = getLandmarkArray(results.rightHandLandmarks);
    const pose = getLandmarkArray(results.poseLandmarks);

    const tClassifierStart = performance.now();

    // 4. Run Authentic Two-Handed & One-Handed ISL Alphabet Fingerspelling Classification
    // STRICT MODE ISOLATION: ONLY run alphabet fingerspelling in 'alphabet' mode
    let alphabetPredictions = [];
    let confirmedLetter = null;
    let alphabetGateDelayMs = 0;
    if (recognitionMode === 'alphabet' && (leftHand.length > 0 || rightHand.length > 0)) {
      alphabetPredictions = classifyIslAlphabet(leftHand, rightHand, pose);
      if (alphabetPredictions.length > 0) {
        const topCandidate = alphabetPredictions[0];
        const confirmation = alphabetConfirmationGate.processCandidate(topCandidate);
        if (confirmation.confirmed) {
          confirmedLetter = confirmation.word;
          alphabetGateDelayMs = confirmation.gateDelayMs || 0;
        }
      } else {
        alphabetConfirmationGate.reset();
      }
    } else {
      alphabetConfirmationGate.reset();
    }

    // 5. Run Authentic ISL Word Recognition: ONNX temporal model (if trained) with 3D geometric fallback
    // STRICT MODE ISOLATION: ONLY run word classification in 'word' mode
    let wordPredictions = { topCandidates: [], confirmedWord: null };
    let wordGateDelayMs = 0;
    if (recognitionMode === 'word' && (leftHand.length > 0 || rightHand.length > 0)) {
      let candidates = [];
      let engineSource = 'heuristic_fallback';

      // 5a. If an ONNX temporal sequence model is loaded and ring buffer has 30 frames, run it
      if (isWordModelReady && wordSession && ringBuffer.isFull()) {
        try {
          const temporalFeatures = ringBuffer.getFlattened();
          const inputTensor = new ort.Tensor('float32', temporalFeatures, [1, 7200]);
          const outputs = await wordSession.run({ input: inputTensor });
          if (outputs?.output?.data) {
            const numClasses = outputs.output.data.length;
            const glossLabels = ISL_WORD_LABELS.slice(0, numClasses).map(w => w.gloss);
            const modelCandidates = getTopKPredictions(outputs.output.data, glossLabels, 3, 0.80);
            if (modelCandidates.length > 0 && modelCandidates[0].isConfident) {
              candidates = modelCandidates;
              engineSource = 'onnx_temporal_model';
            }
          }
        } catch (modelErr) {
          console.warn('[vision.worker] ONNX word inference error, falling back to heuristics:', modelErr.message);
        }
      }

      // 5b. Fallback: Authentic 3D joint geometry & kinematics classifier
      if (candidates.length === 0) {
        candidates = classifyIslWord(leftHand, rightHand, pose, motion);
        engineSource = 'geometric_rule_engine';
      }

      if (candidates.length > 0) {
        const topCandidate = { ...candidates[0], engineSource };
        const isStaticHoldSign = ['NAMASTE', 'GOOD', 'BAD', 'LOVE', 'STOP', 'TIME', 'CALL'].includes(topCandidate.label);
        const canConfirm = motion.state === 'SIGNING_ACTIVE' || motion.state === 'PAUSE_COUNTDOWN' || isStaticHoldSign;

        let confirmation = { confirmed: false };
        if (canConfirm) {
          confirmation = wordConfirmationGate.processCandidate(topCandidate);
        } else {
          wordConfirmationGate.reset();
        }

        if (confirmation.confirmed) {
          wordGateDelayMs = confirmation.gateDelayMs || 0;
        }
        wordPredictions = {
          topCandidates: candidates,
          confirmedWord: confirmation.confirmed ? confirmation.word : null,
          engineSource
        };
      } else {
        wordConfirmationGate.reset();
      }
    } else {
      wordConfirmationGate.reset();
    }

    const classifierMs = Math.round((performance.now() - tClassifierStart) * 10) / 10;
    const processingTimeMs = Math.round(performance.now() - frameStart);

    self.postMessage({
      type: 'LANDMARK_RESULTS',
      landmarks: {
        leftHandLandmarks: getLandmarkArray(results.leftHandLandmarks),
        rightHandLandmarks: getLandmarkArray(results.rightHandLandmarks),
        poseLandmarks: getLandmarkArray(results.poseLandmarks),
        faceLandmarks: getLandmarkArray(results.faceLandmarks)
      },
      normalizedFeatures: normalized.features,
      motion,
      bufferSize: ringBuffer.size(),
      alphabetPredictions,
      latestConfirmedLetter: confirmedLetter,
      wordPredictions,
      timestamp,
      processingTimeMs,
      profiling: {
        holisticMs,
        normMs,
        classifierMs,
        totalWorkerMs: processingTimeMs,
        wordGateDelayMs,
        alphabetGateDelayMs
      }
    });
  } catch (err) {
    if (imageBitmap && typeof imageBitmap.close === 'function') {
      imageBitmap.close();
    }
    console.error('[vision.worker] Frame detection error:', err);
    self.postMessage({
      type: 'FRAME_ERROR',
      error: err.message,
      timestamp
    });
  }
}

// Worker message listener
self.onmessage = async (event) => {
  const { type, imageBitmap, timestamp, config, recognitionMode } = event.data || {};

  switch (type) {
    case 'INIT_VISION':
      await initVision(config);
      break;

    case 'INIT_ALPHABET_MODEL':
      await initAlphabetModel(config?.modelPath);
      break;

    case 'PROCESS_FRAME':
      await processFrame(imageBitmap, timestamp, recognitionMode);
      break;

    case 'CLEAR_BUFFER':
      ringBuffer.clear();
      velocityGate.reset();
      self.postMessage({ type: 'BUFFER_CLEARED' });
      break;

    case 'GET_FLATTENED_BUFFER':
      self.postMessage({
        type: 'FLATTENED_BUFFER',
        buffer: ringBuffer.getFlattened(),
        size: ringBuffer.size()
      });
      break;

    case 'CONFIGURE_GATE':
      if (typeof config?.commitDurationMs === 'number') {
        velocityGate.commitDurationMs = config.commitDurationMs;
      }
      if (typeof config?.wordRequiredConsecutive === 'number') {
        wordConfirmationGate.requiredConsecutive = config.wordRequiredConsecutive;
      }
      if (typeof config?.wordCooldownFrames === 'number') {
        wordConfirmationGate.cooldownFrames = config.wordCooldownFrames;
      }
      if (typeof config?.alphabetRequiredConsecutive === 'number') {
        alphabetConfirmationGate.requiredConsecutive = config.alphabetRequiredConsecutive;
      }
      if (typeof config?.alphabetCooldownFrames === 'number') {
        alphabetConfirmationGate.cooldownFrames = config.alphabetCooldownFrames;
      }
      self.postMessage({
        type: 'GATE_CONFIGURED',
        commitDurationMs: velocityGate.commitDurationMs,
        wordRequiredConsecutive: wordConfirmationGate.requiredConsecutive,
        alphabetRequiredConsecutive: alphabetConfirmationGate.requiredConsecutive
      });
      break;

    case 'PING':
      self.postMessage({ type: 'PONG', isInitialized });
      break;

    default:
      console.warn('[vision.worker] Unknown message type received:', type);
  }
};
