import { FilesetResolver, HolisticLandmarker } from '@mediapipe/tasks-vision';
import { extractAndNormalizeFrame } from '../vision/normalizeLandmarks.js';
import { RingBuffer } from '../vision/RingBuffer.js';
import { VelocityGate } from '../vision/velocityGate.js';

let holisticLandmarker = null;
let isInitialized = false;

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
        minHandDetectionConfidence: 0.5,
        minHandPresenceConfidence: 0.5,
        minHandTrackingConfidence: 0.5,
        minFaceDetectionConfidence: 0.5,
        minFacePresenceConfidence: 0.5,
        minFaceTrackingConfidence: 0.5,
        minPoseDetectionConfidence: 0.5,
        minPosePresenceConfidence: 0.5,
        minPoseTrackingConfidence: 0.5
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
function processFrame(imageBitmap, timestamp) {
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

    const processingTimeMs = Math.round(performance.now() - frameStart);

    self.postMessage({
      type: 'LANDMARK_RESULTS',
      landmarks: {
        leftHandLandmarks: results.leftHandLandmarks || [],
        rightHandLandmarks: results.rightHandLandmarks || [],
        poseLandmarks: results.poseLandmarks || [],
        faceLandmarks: results.faceLandmarks || []
      },
      normalizedFeatures: normalized.features,
      motion,
      bufferSize: ringBuffer.size(),
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

    case 'PROCESS_FRAME':
      processFrame(imageBitmap, timestamp);
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
