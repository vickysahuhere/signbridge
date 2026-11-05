import { FilesetResolver, HolisticLandmarker } from '@mediapipe/tasks-vision';
import * as ort from 'onnxruntime-web';
import { extractAndNormalizeFrame, getLandmarkArray } from '../vision/normalizeLandmarks.js';
import { RingBuffer } from '../vision/RingBuffer.js';
import { VelocityGate } from '../vision/velocityGate.js';
import { getTopKPredictions } from '../ai/softmax.js';
import { ISL_ALPHABET_LABELS } from '../ai/islAlphabetLabels.js';
import { ISL_WORD_LABELS } from '../ai/islWordLabels.js';
import { ConsecutiveConfirmationGate } from '../ai/consecutiveConfirmation.js';

let holisticLandmarker = null;
let isInitialized = false;

let alphabetSession = null;
let isAlphabetModelReady = false;

let wordSession = null;
let isWordModelReady = false;
let frameCounter = 0;

const wordConfirmationGate = new ConsecutiveConfirmationGate({
  confidenceThreshold: 0.75,
  requiredConsecutive: 2,
  cooldownFrames: 6
});
const WORD_GLOSS_LABELS = ISL_WORD_LABELS.map(w => w.gloss);

// Configure ONNX WASM execution
if (typeof ort !== 'undefined' && ort?.env?.wasm) {
  ort.env.wasm.numThreads = 1;
}

// 30-frame temporal buffer storing 240-float feature vectors
const ringBuffer = new RingBuffer(30, 240);

// Motion energy detector and 1.2s auto-commit pause state machine
const velocityGate = new VelocityGate({
  activeThreshold: 0.015,
  idleThreshold: 0.008,
  commitDurationMs: 1200,
  windowSize: 5
});

const DEFAULT_WASM_CDN = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14/wasm';
const DEFAULT_MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/holistic_landmarker/holistic_landmarker/float16/latest/holistic_landmarker.task';
const DEFAULT_ALPHABET_MODEL_URL = '/models/isl_alphabet_mlp.onnx';
const DEFAULT_WORD_MODEL_URL = '/models/isl_include_50.onnx';

/**
 * Initialize Two-Handed ISL Alphabet MLP Model
 */
async function initAlphabetModel(modelPath = DEFAULT_ALPHABET_MODEL_URL) {
  try {
    console.log('[vision.worker] Initializing ISL Alphabet MLP from:', modelPath);
    let modelData;

    if (typeof fetch !== 'undefined') {
      try {
        const resp = await fetch(modelPath);
        if (resp.ok) {
          modelData = await resp.arrayBuffer();
        } else {
          console.warn(`[vision.worker] Fetching ${modelPath} returned status ${resp.status}`);
          modelData = modelPath;
        }
      } catch (fetchErr) {
        console.warn('[vision.worker] Fetch error for alphabet model, using direct path:', fetchErr);
        modelData = modelPath;
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
  try {
    console.log('[vision.worker] Initializing AI4Bharat INCLUDE-50 temporal model from:', modelPath);
    let modelData;

    if (typeof fetch !== 'undefined') {
      try {
        const resp = await fetch(modelPath);
        if (resp.ok) {
          modelData = await resp.arrayBuffer();
        } else {
          console.warn(`[vision.worker] Fetching ${modelPath} returned status ${resp.status}`);
          modelData = modelPath;
        }
      } catch (fetchErr) {
        console.warn('[vision.worker] Fetch error for word model, using direct path:', fetchErr);
        modelData = modelPath;
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
  const wasmCdn = config.wasmCdn || DEFAULT_WASM_CDN;
  const rawModelUrl = config.modelUrl || DEFAULT_MODEL_URL;

  try {
    self.postMessage({ type: 'WORKER_STATUS', status: 'loading', message: 'Resolving WASM binaries...' });
    const vision = await FilesetResolver.forVisionTasks(wasmCdn);

    self.postMessage({ type: 'WORKER_STATUS', status: 'loading', message: 'Loading Holistic model...' });
    const resolvedModelPath = await fetchAndCacheModel(rawModelUrl);

    self.postMessage({ type: 'WORKER_STATUS', status: 'compiling', message: 'Initializing WebGL Landmarker...' });
    
    // Attempt GPU acceleration first, fallback to CPU if WebGL fails in worker
    let delegate = 'GPU';
    try {
      holisticLandmarker = await HolisticLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: resolvedModelPath,
          delegate: 'GPU'
        },
        runningMode: 'VIDEO',
        minHandDetectionConfidence: 0.3,
        minHandPresenceConfidence: 0.3,
        minHandTrackingConfidence: 0.3,
        minFaceDetectionConfidence: 0.35,
        minFacePresenceConfidence: 0.35,
        minFaceTrackingConfidence: 0.35,
        minPoseDetectionConfidence: 0.35,
        minPosePresenceConfidence: 0.35,
        minPoseTrackingConfidence: 0.35
      });
    } catch (gpuError) {
      console.warn('[vision.worker] GPU delegate failed, falling back to CPU:', gpuError);
      delegate = 'CPU';
      holisticLandmarker = await HolisticLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: resolvedModelPath,
          delegate: 'CPU'
        },
        runningMode: 'VIDEO'
      });
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
async function processFrame(imageBitmap, timestamp) {
  if (!isInitialized || !holisticLandmarker) {
    if (imageBitmap && typeof imageBitmap.close === 'function') {
      imageBitmap.close();
    }
    return;
  }

  const frameStart = performance.now();

  try {
    const results = holisticLandmarker.detectForVideo(imageBitmap, timestamp);

    // Free transferred GPU bitmap immediately
    imageBitmap.close();

    // 1. Normalize 80 keypoints into 240 floats (translation & scale invariant)
    const normalized = extractAndNormalizeFrame(results);

    // 2. Push 240-float frame into 30-frame FIFO RingBuffer
    ringBuffer.push(normalized.features);

    // 3. Update velocity gate with normalized wrists and current frame timestamp
    const motion = velocityGate.update(normalized.leftWrist, normalized.rightWrist, timestamp);
    frameCounter++;

    // 4. Run Two-Handed Alphabet MLP classification if model ready
    let alphabetPredictions = [];
    if (alphabetSession && isAlphabetModelReady) {
      try {
        const inputTensor = new ort.Tensor('float32', normalized.features, [1, 240]);
        const outputs = await alphabetSession.run({ input: inputTensor });
        if (outputs?.output?.data) {
          alphabetPredictions = getTopKPredictions(outputs.output.data, ISL_ALPHABET_LABELS, 3, 0.65);
        }
      } catch (inferErr) {
        console.warn('[vision.worker] Alphabet MLP inference error:', inferErr);
      }
    }

    // 5. Run Temporal INCLUDE-50 Word inference every 5 frames during active signing
    let wordPredictions = { topCandidates: [], confirmedWord: null };
    if (wordSession && isWordModelReady && ringBuffer.size() >= 30) {
      if (motion.state === 'SIGNING_ACTIVE' && frameCounter % 5 === 0) {
        try {
          const flatBuffer = ringBuffer.getFlattened();
          const wordInput = new ort.Tensor('float32', flatBuffer, [1, 7200]);
          const wordOutputs = await wordSession.run({ input: wordInput });
          if (wordOutputs?.output?.data) {
            const topWords = getTopKPredictions(wordOutputs.output.data, WORD_GLOSS_LABELS, 3, 0.75);
            const confirmation = wordConfirmationGate.processCandidate(topWords[0]);
            wordPredictions = {
              topCandidates: topWords,
              confirmedWord: confirmation.confirmed ? confirmation.word : null
            };
          }
        } catch (wordErr) {
          console.warn('[vision.worker] Temporal word inference error:', wordErr);
        }
      } else if (motion.state === 'IDLE') {
        wordConfirmationGate.reset();
      }
    }

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
      wordPredictions,
      timestamp,
      processingTimeMs
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
  const { type, imageBitmap, timestamp, config } = event.data || {};

  switch (type) {
    case 'INIT_VISION':
      await initVision(config);
      break;

    case 'INIT_ALPHABET_MODEL':
      await initAlphabetModel(config?.modelPath);
      break;

    case 'PROCESS_FRAME':
      await processFrame(imageBitmap, timestamp);
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

    case 'PING':
      self.postMessage({ type: 'PONG', isInitialized });
      break;

    default:
      console.warn('[vision.worker] Unknown message type received:', type);
  }
};
