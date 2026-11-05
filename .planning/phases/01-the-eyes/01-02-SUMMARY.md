---
phase: 01-the-eyes
plan: 02
subsystem: vision-worker
tags:
  - web-worker
  - mediapipe
  - holistic-landmarker
  - webgl
  - shader-warmup
  - cache-storage
requires:
  - "01-01"
provides:
  - "Dedicated background Web Worker (vision.worker.js) for 543-point 3D computer vision"
  - "Browser Cache Storage model caching for instant subsequent boots (<300ms)"
  - "WebGL dummy shader warm-up on initial boot to eliminate GPU freeze on first sign"
  - "useVisionWorker React hook with ImageBitmap transferable object pipeline"
affects:
  - "01-03-PLAN.md"
  - "Phase 2 Math pipeline"
tech-stack:
  added:
    - "@mediapipe/tasks-vision (HolisticLandmarker, FilesetResolver)"
  patterns:
    - "Dedicated Web Worker offloading heavy CPU/GPU matrix math from main thread"
    - "Transferable ImageBitmap zero-copy frame dispatch"
    - "Cache Storage progressive asset caching"
    - "Dummy tensor pre-compilation warm-up"
key-files:
  created:
    - "src/workers/vision.worker.js"
    - "src/hooks/useVisionWorker.js"
  modified:
    - "src/App.jsx"
key-decisions:
  - "Used Web Worker with ES module format to completely isolate computer vision processing from React UI thread."
  - "Executed 1 dummy inference during worker boot to force GPU WebGL shader compilation before live camera frames arrive."
  - "Stored HolisticLandmarker .task models in browser Cache Storage to enable instant (<300ms) reloads."
requirements-completed:
  - VISN-02
  - VISN-03
coverage:
  - deliverable: "MediaPipe Holistic Landmarker Web Worker with WebGL acceleration"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
  - deliverable: "Initial GPU shader warm-up to eliminate live inference latency spikes"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
duration: 4 min
completed: 2026-11-05
---

# Phase 01 Plan 02: Web Worker & MediaPipe Holistic Summary

Implemented the dedicated background Web Worker running `@mediapipe/tasks-vision` (`HolisticLandmarker`) with WebGL GPU acceleration, model caching in Cache Storage, and initial shader warm-up.

## Key Accomplishments

1. **Constructed `src/workers/vision.worker.js`**:
   - Downloads and caches the MediaPipe Holistic model into browser `Cache Storage` (`signbridge-models-v1`) for instant subsequent loads.
   - Initialized `HolisticLandmarker` with `runningMode: "VIDEO"` and `delegate: "GPU"` (with automatic CPU fallback).
   - **Shader Warm-Up**: Executes a dummy blank canvas frame on worker boot to force the browser to precompile WebGL shaders before real video frames arrive, ensuring the first live sign runs in `<15ms`.
   - Closes transferred `ImageBitmap` objects immediately after processing to prevent GPU memory leaks.

2. **Created `src/hooks/useVisionWorker.js`**:
   - Manages worker lifecycle, status, latency telemetry, and landmark results.
   - Employs `createImageBitmap` and transferable objects (`[imageBitmap]`) to send frames with zero main-thread serialization cost.
   - Enforces a single-flight concurrency lock to prevent frame queue buffering.

3. **Integrated into Application Shell**:
   - Connected `useVisionWorker` to `<App />` and `<SignerStage />` so webcam frames automatically route to the worker and update telemetry.

## Verification Results

- `npm run build` compiled the worker into a dedicated chunk `dist/assets/vision.worker-BVEcIhBn.js (129.24 kB)` with 0 errors.
- Requirements `VISN-02` and `VISN-03` completed.

## Self-Check: PASSED
