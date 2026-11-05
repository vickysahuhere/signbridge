# Roadmap: SignBridge ISL

## Overview

SignBridge ISL is built across 6 progressive, testable phases—transitioning from browser hardware access and real-time computer vision in Web Workers, through coordinate geometry and on-device ONNX neural network inference, to computational linguistics and peer-to-peer WebRTC networking. Every phase delivers a fully verified capability.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3, 4, 5, 6): Planned milestone work

- [ ] **Phase 1: The Eyes** - Webcam pipeline, MediaPipe Holistic 3D tracking in Web Worker, and 60 FPS color-coded canvas overlay
- [ ] **Phase 2: The Math** - Shoulder-centered coordinate normalization, 30-frame ring buffer, and wrist velocity motion gating
- [ ] **Phase 3: The Brain (Part 1)** - Two-handed ISL Alphabet (A–Z) recognition with onnxruntime-web and developer keypoint recorder
- [ ] **Phase 4: The Brain (Part 2)** - Pretrained AI4Bharat INCLUDE-50 ISL conversational word sequence recognition
- [ ] **Phase 5: The Linguist** - ISL gloss buffer manager, debouncing, and deterministic SOV-to-English sentence reconstruction
- [ ] **Phase 6: The Bridge** - WebRTC P2P DataChannel chat, Supabase Realtime fallback, webcam HUD subtitles, and Cloudflare Pages deployment

## Phase Details

### Phase 1: The Eyes
**Goal**: Build a high-performance browser computer vision pipeline running MediaPipe Holistic inside a dedicated Web Worker to extract 543 3D landmarks at 30+ FPS without blocking the React UI thread.
**Depends on**: Nothing (first phase)
**Requirements**: VISN-01, VISN-02, VISN-03, VISN-04, VISN-05
**Success Criteria** (what must be TRUE):
  1. User can allow webcam access and view a smooth mirrored video feed in `<SignerStage />` running via `requestVideoFrameCallback`.
  2. MediaPipe Holistic models download and cache into browser Cache Storage/IndexedDB, running in `vision.worker.js` with WebGL acceleration.
  3. Canvas renders a color-coded 3D skeleton in real time: Left Hand in Sky Blue (`#38BDF8`), Right Hand in Emerald Green (`#34D399`), Upper Pose in White, and Face in Amber.
  4. Moving hands outside the framing box triggers a visible Rose Red (`#F43F5E`) alert border.
**Plans**: 3/3 plans executed

Plans:
- [x] 01-01: Vite + React project scaffolding, Tailwind CSS setup, dark UI layout shell, and camera permission handling via `requestVideoFrameCallback`.
- [x] 01-02: Background Web Worker (`vision.worker.js`) integration with `@mediapipe/tasks-vision`, shader warm-up, and model caching.
- [x] 01-03: Dual-layer canvas rendering (`drawSkeleton.js`) with distinct hand color coding and out-of-frame boundary detection.

---

### Phase 2: The Math
**Goal**: Build the mathematical feature extraction and motion gating pipeline that transforms raw 3D landmarks into translation- and scale-invariant vectors, tracking wrist velocity to detect gesture boundaries.
**Depends on**: Phase 1
**Requirements**: MATH-01, MATH-02, MATH-03, MATH-04, MATH-05
**Success Criteria** (what must be TRUE):
  1. Landmark extractor normalizes 80 keypoints (240 floats) relative to shoulder midpoint and shoulder width, ensuring distance invariance from 0.5m to 2.0m.
  2. Missing hand detections are zero-padded with `0.0` without generating `NaN` or crashing the vector pipeline.
  3. A 30-frame FIFO RingBuffer stores the rolling 7,200-float sliding temporal sequence.
  4. Rolling wrist velocity computes real-time energy states (`SIGNING_ACTIVE`, `PAUSE_COUNTDOWN`, `IDLE_COMMIT`).
  5. Pausing hands for >=1.2 seconds triggers the `IDLE_COMMIT` event when the active sign buffer is non-empty.
**Plans**: 2 plans

Plans:
- [ ] 02-01: Implement `normalizeLandmarks.js` for shoulder-centered translation & scale normalization with zero-padding and create `RingBuffer.js`.
- [ ] 02-02: Implement `velocityGate.js` for wrist velocity energy calculation, 5-frame rolling average, and 1.2s pause timer emission.

---

### Phase 3: The Brain (Part 1)
**Goal**: Integrate `onnxruntime-web` to classify two-handed ISL alphabets (A–Z) and digits, complete with an in-browser training recorder to capture and test custom ISL gestures.
**Depends on**: Phase 2
**Requirements**: ALPH-01, ALPH-02, ALPH-03, ALPH-04
**Success Criteria** (what must be TRUE):
  1. Two-handed ISL Alphabet MLP runs inside `vision.worker.js` in <10ms via `onnxruntime-web`.
  2. Top-1 prediction locks in only when Softmax confidence meets or exceeds the 0.75 threshold.
  3. Top-3 predicted letters and animated confidence bars render in the UI.
  4. Developer Training Drawer allows recording 100-frame normalized samples of two-handed ISL signs and downloading them as JSON/CSV.
**Plans**: 2 plans

Plans:
- [ ] 03-01: ONNX Runtime Web worker integration, model loading, and Softmax classification pipeline with confidence thresholding.
- [ ] 03-02: Developer Keypoint Recorder drawer UI and live top-3 prediction display in `<SignerStage />`.

---

### Phase 4: The Brain (Part 2)
**Goal**: Integrate pretrained temporal sequence models for recognizing 50+ conversational ISL words from AI4Bharat INCLUDE dataset with 2-step consecutive confirmation gating.
**Depends on**: Phase 3
**Requirements**: WORD-01, WORD-02, WORD-03, WORD-04
**Success Criteria** (what must be TRUE):
  1. Pretrained INCLUDE-50 word model (`.onnx`) loads and executes on 30-frame sliding windows every 5 frames during `SIGNING_ACTIVE`.
  2. 2-step consecutive confirmation rejects single-frame noise spikes and accepts words only when the same gloss wins top-1 with >=0.75 confidence across two consecutive windows.
  3. Everyday conversational ISL words (`NAMASTE`, `YOU`, `NAME`, `WHAT`, `HELP`, `DOCTOR`, `GO`, `HOSPITAL`) are accurately classified and emitted to the UI.
**Plans**: 2 plans

Plans:
- [ ] 04-01: INCLUDE-50 model loading, class label mapping (`isl_labels.json`), and sliding window tensor processing in `vision.worker.js`.
- [ ] 04-02: 2-step consecutive confirmation filter, mode toggling between ISL Word Mode and A-Z Alphabet Mode, and live gloss pill preview.

---

### Phase 5: The Linguist
**Goal**: Implement the in-browser computational linguistics engine that debounces recognized signs and deterministically converts ISL Subject-Object-Verb (SOV) gloss sequences into natural English sentences.
**Depends on**: Phase 4
**Requirements**: LING-01, LING-02, LING-03, LING-04, LING-05
**Success Criteria** (what must be TRUE):
  1. Gloss Buffer Manager prevents adjacent duplicates and allows the user to undo or clear signs (`[Undo Last Sign]`, `[Clear All]`).
  2. Circular 1.2s pause progress ring visualizes the countdown to automatic sentence dispatch.
  3. Deterministic grammar engine reorders ISL SOV clauses into natural English (`["ME", "WATER", "WANT"]` -> `"I want water."`).
  4. Trailing WH-question signs (`WHAT`, `WHERE`, `WHO`, `WHY`, `HOW`) are relocated to the sentence start with appropriate copulas and question marks (`["YOU", "NAME", "WHAT"]` -> `"What is your name?"`).
**Plans**: 2 plans

Plans:
- [ ] 05-01: Gloss buffer manager with debouncing, manual edit buttons, and animated 1.2s circular countdown ring in `<LiveGlossBar />`.
- [ ] 05-02: Pure JS rule-based grammar transformer (`islSentenceFormatter.js`) handling SOV inversion, WH-final restructuring, copula insertion, and punctuation.

---

### Phase 6: The Bridge
**Goal**: Establish real-time peer-to-peer WebRTC chat with Cloudflare STUN/TURN, Supabase Realtime signaling and broadcast fallback, top glass HUD subtitle overlays, and Cloudflare Pages production deployment.
**Depends on**: Phase 5
**Requirements**: NETW-01, NETW-02, NETW-03, NETW-04, NETW-05, NETW-06
**Success Criteria** (what must be TRUE):
  1. Signer and Text Partner join private rooms via URL parameters (`?room=id`) using Supabase Presence and Broadcast signaling.
  2. P2P WebRTC `RTCDataChannel("isl-chat")` opens with <20ms latency, streaming live typing/signing previews and committed messages.
  3. If strict UDP firewalls block WebRTC, system automatically falls back to Supabase Realtime Broadcast over WebSocket without dropped messages.
  4. Text Partner's incoming replies display in the high-contrast Top Glass HUD Subtitle Banner directly above Person A's webcam canvas (zero eye-travel ergonomics).
  5. Application builds for production and deploys cleanly to Cloudflare Pages with immutable model asset caching.
**Plans**: 3 plans

Plans:
- [ ] 06-01: Supabase Realtime client setup (`supabaseClient.js`), room presence, role selection (Signer vs. Text Partner), and fallback broadcast channel.
- [ ] 06-02: WebRTC manager (`webrtcManager.js`) with STUN/TURN ICE negotiation, `RTCDataChannel` message dispatch, and live sign preview streaming.
- [ ] 06-03: Zero eye-travel HUD subtitle overlay (`<IncomingSubtitleOverlay />`), full UI integration, and Cloudflare Pages build/cache configuration.

---

## Progress

**Execution Order:**
Phases execute in numeric order: 1 -> 2 -> 3 -> 4 -> 5 -> 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. The Eyes | 3/3 | In Progress | - |
| 2. The Math | 0/2 | Not started | - |
| 3. The Brain (Part 1) | 0/2 | Not started | - |
| 4. The Brain (Part 2) | 0/2 | Not started | - |
| 5. The Linguist | 0/2 | Not started | - |
| 6. The Bridge | 0/3 | Not started | - |
