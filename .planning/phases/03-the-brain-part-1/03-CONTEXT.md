# Phase 3: The Brain (Part 1) - Context

**Gathered:** 2026-11-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 3 introduces real-time neural network inference into the browser pipeline using `onnxruntime-web`. It focuses on two-handed Indian Sign Language (ISL) Alphabet and Digit recognition (A–Z and 0–9, 36 classes total) on normalized 240-float feature vectors, with Softmax probability calculation, a >=0.75 confidence gating threshold, top-3 prediction HUD telemetry on `<SignerStage />`, and an interactive in-browser "Developer Training / Keypoint Recorder" drawer for capturing and exporting 100-frame normalized gesture datasets as JSON and CSV.

Temporal word recognition (INCLUDE-50 30-frame sequence model), grammatical reordering, and WebRTC belong to Phases 4, 5, and 6.
</domain>

<decisions>
## Implementation Decisions

### ONNX Runtime Web Integration
- **D-01:** Run `onnxruntime-web` directly in `src/workers/vision.worker.js` with WebAssembly (WASM SIMD) execution provider to keep AI inference strictly off the React UI thread.
- **D-02:** Provide an automated script (`scripts/generate_alphabet_model.js`) that uses `protobufjs` to compile the standard ISL Alphabet MLP model (`isl_alphabet_mlp.onnx`) directly into `public/models/isl_alphabet_mlp.onnx`.
- **D-03:** Model topology: Input `[1, 240]` (80 keypoints x 3) -> Dense layer -> Output `[1, 36]` (logits for 26 ISL alphabet letters A–Z and 10 digits 0–9).
- **D-04:** Alphabet labels defined in `src/ai/islAlphabetLabels.js` mapping index 0-25 to `'A'`–`'Z'` and 26-35 to `'0'`–`'9'`.

### Probability Calculation & Confidence Gating
- **D-05:** Compute Softmax in `src/ai/softmax.js` with numerical stability (subtracting maximum logit $\max_i z_i$ before exponentiation).
- **D-06:** Enforce a strict confidence threshold $\ge 0.75$ (`CONFIDENCE_THRESHOLD = 0.75`). Predictions below this threshold are marked unconfirmed/low-confidence to avoid erratic letter flashing.
- **D-07:** Calculate top-3 predicted candidates with probabilities (e.g. `[{ label: 'A', confidence: 0.88 }, { label: 'O', confidence: 0.08 }, { label: 'B', confidence: 0.02 }]`).

### UI Telemetry & Feedback
- **D-08:** In `<SignerStage />`, render a top-3 candidate HUD badge directly above/beside the skeleton stream.
  - Emerald Green (`#10B981`) for locked predictions ($\ge 75\%$).
  - Amber (`#F59E0B`) for active motion / candidates below 75%.
- **D-09:** Add an interactive Fingerspelling / Alphabet mode toggle in the UI so the user can easily switch between Alphabet mode and standard tracking.

### Developer Training & Keypoint Recorder Drawer
- **D-10:** Build `src/components/KeypointRecorderDrawer.jsx` as a slide-out / modal tool:
  - Input for sign label name (e.g. `A`, `B`, `NAMASTE`, `HELLO`).
  - 100-frame keypoint recorder: Captures 100 consecutive normalized 240-float frames from the worker during active signing.
  - Visual recording countdown and frame counter (`Recording: 64/100 frames`).
  - Export actions: Export captured dataset as structured `.json` (`isl_dataset_<label>_<timestamp>.json`) and flattened `.csv` (`isl_dataset_<label>_<timestamp>.csv`).
  - Sample library view displaying recorded gestures and sample counts.

### Agent's Discretion
- Exact layout of Top-3 HUD pill and progress bars.
- Unit testing strategy for Softmax numerical stability and classifier ranking.
</decisions>

<canonical_refs>
## Canonical References

### Architecture & Specification
- `tech.md` §1 & §4 — ONNX Runtime Web in Web Workers (`onnxruntime-web`)
- `tech.md` §2.2 — ISL Two-Handed Alphabet Nature (25 of 26 letters require both hands interacting)
- `appflow.md` §4 & §7 — Mode Switching & Developer Keypoint Recorder
- `ui.md` §2 & §3 — Visual Design System, Top-3 Confidence HUD & Color Palette
</canonical_refs>
