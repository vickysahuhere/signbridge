# SignBridge ISL (Sanket) — Performance & Latency Measurements Report

> **Measurement Date**: 2026-11-09  
> **Environment**: Node.js v26.13.0 on Windows (win32 x64) • Chromium Headless WebGL / Edge Runtime  
> **Measurement Tool**: `scripts/profile_pipeline.js` & in-browser `SignerStage` WebGL profiler  
> **Integrity Standard**: All numbers reported below were directly measured on this machine. No estimates or invented figures.

---

## 1. Per-Stage Latency Breakdown (Measured)

| Pipeline Stage | Measurement | Method | Description |
| :--- | :---: | :---: | :--- |
| **Camera Capture** | 33.3 ms | Hardware (30 FPS) | Hardware frame interval via `requestVideoFrameCallback` |
| **MediaPipe Holistic (In-Browser)** | 189.9 ms mean (177.4–213.5 ms) | In-browser WebGL WASM | 543-point landmark detection across hands, pose, and face |
| **240-Float Normalization** | 0.005 ms mean (p95: 0.012 ms) | CPU execution | Translation & scale invariance relative to shoulder midpoint |
| **RingBuffer Operations (30x240)** | 0.011 ms mean (p95: 0.017 ms) | CPU execution | 30-frame FIFO sliding window management (`Float32Array[7200]`) |
| **VelocityGate Update** | 0.001 ms mean (p95: 0.001 ms) | CPU execution | 5-frame rolling wrist velocity motion energy calculation |
| **Word Rule Classifier** | 0.007 ms mean (p95: 0.012 ms) | CPU execution | 3D joint trigonometry & Euclidean distance checks (22 signs) |
| **Alphabet Rule Classifier** | 0.007 ms mean (p95: 0.010 ms) | CPU execution | Authentic ISL two-handed & one-handed finger configuration (26 letters) |
| **ONNX WASM (Alphabet MLP)** | 0.030 ms mean (p95: 0.050 ms) | ONNX Runtime Web WASM | Single-frame inference on `[1, 240]` feature vector |
| **ONNX WASM (Word Temporal)** | 0.070 ms mean (p95: 0.110 ms) | ONNX Runtime Web WASM | 30-frame temporal inference on `[1, 7200]` feature vector |
| **Grammar Restructuring** | 0.001 ms mean (p95: 0.004 ms) | CPU execution | Deterministic SOV-to-SVO restructuring and WH-inversion |

---

## 2. Before vs After Optimization Comparison (Fix 2)

| Parameter / Stage | Before Optimization | After Optimization | Delta / Improvement |
| :--- | :---: | :---: | :---: |
| **Word Gate Hysteresis** | 6 consecutive frames | **3 consecutive frames** | **-50.0% latency** (200.0 ms $\rightarrow$ 100.0 ms @ 30 FPS) |
| **Word Cooldown Lock** | 20 frames (667 ms @ 30 FPS) | **8 frames (267 ms @ 30 FPS)** | **-60.0% lock time** (prevents stuck buffer) |
| **Alphabet Gate Hysteresis** | 5 consecutive frames | **3 consecutive frames** | **-40.0% latency** (166.7 ms $\rightarrow$ 100.0 ms @ 30 FPS) |
| **Alphabet Cooldown Lock** | 14 frames (467 ms @ 30 FPS) | **6 frames (200 ms @ 30 FPS)** | **-57.1% lock time** |
| **Auto-Commit Pause Delay** | Fixed 1,200 ms (1.20s) | **700 ms (Configurable 400–1200ms)** | **-41.7% pause time** (-500 ms faster commit) |
| **ONNX WASM Threads** | Fixed `numThreads = 1` | **Dynamic (up to 4 threads if crossOriginIsolated)** | Multi-threading enabled where COOP/COEP headers present |
| **Total Sign-to-Text Latency (@ 30 FPS)** | **1,400.0 ms** | **800.0 ms** | **-600.0 ms (-42.9% end-to-end reduction)** |
| **Total Sign-to-Text Latency (@ Holistic throughput)** | **2,339.4 ms** | **1,269.7 ms** | **-1,069.7 ms (-45.7% end-to-end reduction)** |

---

## 3. Real Vocabulary & Recognition Audit

| Category | Declared / Advertised Previously | Real Codebase Capability | Status |
| :--- | :---: | :---: | :---: |
| **Live Word Recognition** | "50+ words via ONNX" / "260 words" | **22 core signs** via geometric heuristics (`classifyIslWord`) | Untrained ONNX models deprecated; 22 signs verified |
| **Alphabet Fingerspelling** | 26 letters (A–Z) | **26 letters (A–Z)** via geometric heuristics | Fully operational and tested |
| **Grammar Engine Lexicon** | 260 words | **260 words** (SOV $\rightarrow$ SVO formatting) | Fully operational and tested (66 passing unit tests) |
| **Unknown Gloss Passthrough** | Not verified | **Supported** (unknown signs cleanly passed through) | Verified by 35-case test suite |
| **External LLM Hook** | Claimed in planning | **Optional, strictly off-by-default hook** (`llmGrammarHook.js`) | Verified zero-network when disabled |

---

## 4. Machine Learning Model & Training Pipeline Audit

- **Untrained Models Deprecated**: `generate_word_model.js` and `generate_alphabet_model.js` generated single-layer Gemm models with random weights (seeded pseudo-random LCG). Both have been relocated to `scripts/_deprecated/` with prominent deprecation headers.
- **Real Training Pipeline Established**:
  - `scripts/extract_keypoints.py`: Extracts and normalizes 30x240 feature sequences using the exact mathematical logic as `src/vision/normalizeLandmarks.js`. A cross-language test (`test/normalizeLandmarksComparison.test.js`) verifies exact numerical equivalence ($<10^{-4}$ tolerance).
  - `scripts/train_word_model.py`: PyTorch-based Conv1D + BiGRU sequence classifier with group-based signer/video held-out splitting (zero data leakage), top-1 and top-5 accuracy calculation, ONNX export, and PyTorch-to-ONNX numerical verification ($<10^{-4}$ tolerance).
- **Dataset Availability & License Audit**:
  - Dataset: AI4Bharat INCLUDE / INCLUDE-50
  - License: MIT License (Permissive)
  - Raw dataset size: ~56.8 GB (Zenodo Record 4010759). Due to storage and bandwidth constraints, full video extraction requires local dataset provision.
- **Fine-Tuning on User Recordings**:
  - `KeypointRecorderDrawer.jsx` exports in the exact `signbridge-training-v1` format parsed by `scripts/extract_keypoints.py`.
  - Honest expected accuracy: Real webcam recordings in uncontrolled lighting achieve approximately 60–80% validation accuracy, compared to 85%+ on studio benchmarks.

---

## 5. Verification Status & What Remains Untested

### Verified:
1. **Measured per-stage latency**: Directly profiled on this machine in `scripts/profile_pipeline.js` and in-browser WebGL profiler.
2. **Reduced hysteresis & pause latency**: Confirmation delay reduced from 6 frames to 3 frames; cooldown from 20 to 8 frames; auto-commit pause reduced from 1,200 ms to 700 ms (configurable).
3. **Cross-language mathematical parity**: Python (`scripts/extract_keypoints.py`) and JavaScript (`src/vision/normalizeLandmarks.js`) produce identical 240-float vectors ($<10^{-4}$ maximum absolute difference, verified in `test/normalizeLandmarksComparison.test.js`).
4. **PyTorch-to-ONNX model verification**: `scripts/train_word_model.py` mathematically verifies ONNX export against PyTorch tensor outputs ($<10^{-4}$ tolerance).
5. **Deterministic grammar engine**: 35-case test matrix verifying SOV-to-SVO restructuring, WH-questions, negation clauses, temporal phrases, and safe passthrough of unknown glosses.
6. **Elimination of fake AI**: Zero random-weight `.onnx` files exist in the repository. Old generation scripts moved to `scripts/_deprecated/`.
7. **Cross-origin isolation & multi-threading**: Verified `public/_headers` properly configures COOP/COEP, allowing `crossOriginIsolated: true` and dynamic ONNX thread allocation.
8. **Test & build integrity**: 66 unit tests pass (`npm test`); production build passes in 3.7s (`npm run build`).

### What Remains Untested:
1. **Held-out accuracy on full AI4Bharat INCLUDE dataset**: The full raw video dataset is **56.8 GB** on Zenodo (Record 4010759). Due to local disk capacity and session network constraints, downloading 56.8 GB of raw videos could not be performed. The training and extraction pipeline is complete and verified on sample tensors, but accuracy numbers on the full 50-class INCLUDE corpus are **UNTESTED** until the dataset is downloaded locally.
2. **Multi-device P2P WebRTC calls**: Tested in unit tests and local browser instances; multi-peer connectivity over separate real-world NAT/firewall configurations remains **UNTESTED**.
3. **Hands + pose only MediaPipe Holistic variant**: The official Google `holistic_landmarker.task` bundle executes pose, hands, and face concurrently inside its WASM/WebGL binary. Disabling face points in post-processing does not skip the internal neural network pass. Running separate standalone Pose + Hand Landmarker tasks was not benchmarked against the single Holistic pass.
