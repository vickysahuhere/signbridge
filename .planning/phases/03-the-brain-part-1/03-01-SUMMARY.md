---
phase: 03-the-brain-part-1
plan: 01
subsystem: alphabet-classifier
tags:
  - onnxruntime-web
  - alphabet-mlp
  - softmax
  - fingerspelling
  - worker-inference
requires:
  - "02-01"
  - "02-02"
provides:
  - "ISL 36-class Alphabet MLP ONNX model (public/models/isl_alphabet_mlp.onnx)"
  - "Alphabet and digit class dictionary mapping 36 indices to characters"
  - "Numerically stable softmax probability calculation and top-K prediction filtering"
  - "Background Web Worker ONNX runtime inference on 240-float normalized vectors"
  - "Comprehensive unit tests validating model execution and confidence gating"
affects:
  - "03-02-PLAN.md"
  - "Phase 4 INCLUDE-50 Word Model"
  - "Phase 5 Grammar & NLP"
tech-stack:
  added:
    - "onnxruntime-web (WASM SIMD execution provider in Web Worker)"
    - "protobufjs (offline ONNX model synthesis)"
  patterns:
    - "Numerically stable Softmax with maximum logit subtraction"
    - "Zero-overhead asynchronous background inference in Web Worker"
key-files:
  created:
    - "public/models/isl_alphabet_mlp.onnx"
    - "scripts/generate_alphabet_model.js"
    - "src/ai/islAlphabetLabels.js"
    - "src/ai/softmax.js"
    - "test/softmax.test.js"
    - "test/alphabetClassifier.test.js"
  modified:
    - "src/workers/vision.worker.js"
key-decisions:
  - "Synthesized standard ONNX v17 intermediate representation model using protobufjs, avoiding any external Python dependencies."
  - "Constructed 36-class topology covering all 26 ISL alphabet letters (A-Z) and 10 digits (0-9)."
  - "Implemented Softmax with max logit subtraction to prevent floating-point overflow during probability calculation."
  - "Enforced strict >=0.75 confidence threshold gating to prevent letter flickering on low-confidence transitions."
requirements-completed:
  - ALPH-01
  - ALPH-02
coverage:
  - deliverable: "ONNX Alphabet MLP model & labels dictionary"
    verification:
      kind: "command"
      ref: "node scripts/generate_alphabet_model.js"
      status: "pass"
    human_judgment: false
  - deliverable: "Softmax probability & confidence threshold gating"
    verification:
      kind: "command"
      ref: "npm test"
      status: "pass"
    human_judgment: false
  - deliverable: "Web Worker ONNX inference pipeline"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
duration: 7 min
completed: 2026-11-05
---

# Plan 03-01 Summary: Two-Handed ISL Alphabet ONNX MLP & Web Worker Classifier

Built and verified the browser-based ISL Alphabet and Digit classification engine running via `onnxruntime-web` inside the dedicated Web Worker.

## Accomplishments

1. **ONNX Alphabet Model Synthesis**:
   - Developed `scripts/generate_alphabet_model.js` utilizing `protobufjs` to compile a compliant `.onnx` v17 binary (`isl_alphabet_mlp.onnx`) directly into `public/models/`.
   - Built `src/ai/islAlphabetLabels.js` mapping 36 class outputs (A–Z and 0–9).

2. **Numerically Stable Softmax & Confidence Gating**:
   - Implemented `softmax()` in `src/ai/softmax.js` using max-logit subtraction to eliminate `Math.exp()` overflow.
   - Built `getTopKPredictions()` extracting top-3 ranked candidates and gating the top prediction against the $\ge 0.75$ confidence threshold.
   - Verified math stability and sorting with 4 unit tests in `test/softmax.test.js`.

3. **Web Worker Real-Time Inference**:
   - Integrated `ort.InferenceSession` directly into `src/workers/vision.worker.js` with WASM execution.
   - Configured warm-up dummy frame inference during boot so subsequent live frames execute in $<10\text{ms}$.
   - Streamed `alphabetPredictions` array inside `LANDMARK_RESULTS` messages without blocking the main UI thread.
   - Validated end-to-end model execution in `test/alphabetClassifier.test.js`.

## Verification Results

- `npm test`: 17/17 tests passing across all suites.
- `npm run build`: Production bundle built cleanly with Vite in 3.38s.
- Requirements satisfied: `ALPH-01`, `ALPH-02`.
