---
phase: 02-the-math
plan: 01
subsystem: normalization-math
tags:
  - coordinate-normalization
  - spatial-invariance
  - scale-invariance
  - ring-buffer
  - unit-testing
requires:
  - "01-02"
provides:
  - "extractAndNormalizeFrame module extracting 80 keypoints into Float32Array(240)"
  - "Shoulder-centered coordinate translation and shoulder-width scale normalization"
  - "Robust zero-padding for missing hands with zero NaN generation"
  - "RingBuffer class storing rolling 30-frame temporal sequences (7,200 floats)"
  - "Automated unit test suite via node:test"
affects:
  - "02-02-PLAN.md"
  - "Phase 3 Alphabet MLP"
  - "Phase 4 INCLUDE-50 Word Model"
tech-stack:
  added:
    - "node:test (unit testing harness)"
  patterns:
    - "Spatial invariance via shoulder midpoint centering and shoulder width scaling"
    - "Circular FIFO buffer with preallocated memory for zero-GC operation"
key-files:
  created:
    - "src/vision/normalizeLandmarks.js"
    - "src/vision/RingBuffer.js"
    - "test/normalizeLandmarks.test.js"
    - "test/RingBuffer.test.js"
  modified:
    - "package.json"
key-decisions:
  - "Extracted 80 essential keypoints (21 left hand, 21 right hand, 12 upper pose, 26 facial contours) resulting in strict Float32Array(240) representation."
  - "Zero-padded missing hands with 0.0 to guarantee non-NaN constant matrix shape for neural network input."
  - "Structured RingBuffer to return contiguous Float32Array(7200) ready for direct onnxruntime-web input tensors."
requirements-completed:
  - MATH-01
  - MATH-02
  - MATH-03
coverage:
  - deliverable: "80-keypoint coordinate extraction and scale-invariant normalization"
    verification:
      kind: "command"
      ref: "npm test"
      status: "pass"
    human_judgment: false
  - deliverable: "30-frame temporal RingBuffer"
    verification:
      kind: "command"
      ref: "npm test"
      status: "pass"
    human_judgment: false
duration: 4 min
completed: 2026-11-05
---

# Phase 02 Plan 01: Coordinate Normalization & RingBuffer Summary

Implemented the mathematical normalization engine (`normalizeLandmarks.js`) and sliding 30-frame temporal window buffer (`RingBuffer.js`), validated by a unit test suite.

## Key Accomplishments

1. **Constructed `src/vision/normalizeLandmarks.js`**:
   - Filtered down 543 Holistic landmarks to 80 essential ISL keypoints (`FEATURE_DIM = 240`).
   - Centered coordinates at the 3D shoulder midpoint ($C_t$) and normalized scale by the Euclidean distance between shoulders ($S_t$).
   - Safely zero-padded missing hands with `0.0` ensuring zero `NaN` values.

2. **Built `src/vision/RingBuffer.js`**:
   - Circular FIFO buffer managing rolling 30-frame sliding windows (1.0 second at 30 FPS).
   - Pre-allocated `getFlattened()` returning a single contiguous `Float32Array(7200)` ready for ONNX sequence models.

3. **Created Automated Unit Test Suite**:
   - `test/normalizeLandmarks.test.js`: Verified 240-float vector size, absence of `NaN`, zero-padding, and verified that relative normalized distance between fingertips is invariant when camera distance changes from 1.0m to 2.0m.
   - `test/RingBuffer.test.js`: Verified capacity constraint (30 frames), oldest frame eviction (FIFO), and `getFlattened` layout.
   - All 6 unit tests pass via `npm test`.

## Verification Results

- `npm test` exited with code 0 (6 tests passed, 0 failed).
- `npm run build` succeeded in 1.95s.
- Requirements `MATH-01`, `MATH-02`, and `MATH-03` completed.

## Self-Check: PASSED
