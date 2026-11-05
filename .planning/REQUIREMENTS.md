# Requirements: SignBridge ISL

**Defined:** 2026-11-04  
**Core Value:** Real-time, privacy-preserving, zero-server-cost two-way communication between Deaf ISL signers and hearing text users running 100% in the browser with <50ms message latency and >=30 FPS vision tracking.

## v1 Requirements

Requirements for initial release, mapped directly to roadmap phases.

### Vision Pipeline (The Eyes)

- [x] **VISN-01**: Application accesses webcam stream via `requestVideoFrameCallback` at native 30+ FPS without main-thread UI jank.
- [x] **VISN-02**: Offloads MediaPipe Holistic Landmarker (543 3D keypoints) execution to a dedicated Web Worker (`vision.worker.js`) with WebGL/WASM acceleration.
- [x] **VISN-03**: Performs initial dummy tensor warm-up during worker boot to precompile WebGL shaders and avoid runtime stutter.
- [ ] **VISN-04**: Renders synchronized 2D canvas skeleton overlay with distinct color coding: Left Hand in Sky Blue (`#38BDF8`), Right Hand in Emerald Green (`#34D399`), Upper Pose in White, and Lips/Eyebrows in Amber.
- [ ] **VISN-05**: Displays framing guide box on canvas with Rose Red (`#F43F5E`) alert if hands move outside the active tracking zone.

### Coordinate Math & Motion Gating (The Math)

- [ ] **MATH-01**: Extracts 80 critical landmarks (21 Left Hand + 21 Right Hand + 12 Upper Pose + 26 Face points) and normalizes coordinates by shoulder midpoint (center) and shoulder width (scale) into a `Float32Array(240)` per frame.
- [ ] **MATH-02**: Zero-pads missing hand landmarks (when one hand is hidden) to maintain constant vector dimensions without `NaN` values.
- [ ] **MATH-03**: Maintains a 30-frame FIFO RingBuffer (`30 x 240 = 7,200` floats) representing a 1.0s sliding temporal window.
- [ ] **MATH-04**: Computes rolling wrist velocity over the previous 5 frames to classify motion into `SIGNING_ACTIVE`, `PAUSE_COUNTDOWN`, and `IDLE_COMMIT` states.
- [ ] **MATH-05**: Detects a 1.2s continuous idle hand pause when the buffer has active signs, triggering an automatic sentence commit.

### Two-Handed Alphabet Recognition & Training Tools (The Brain Part 1)

- [ ] **ALPH-01**: Loads and runs a two-handed ISL Alphabet MLP model in `vision.worker.js` via `onnxruntime-web` for static/short-sequence letter recognition (A–Z and 0–9).
- [ ] **ALPH-02**: Calculates Softmax probability distribution and enforces a >=0.75 confidence threshold before accepting letter predictions.
- [ ] **ALPH-03**: Displays top-3 predicted ISL letters with real-time confidence indicator bars on `<SignerStage />`.
- [ ] **ALPH-04**: Provides an in-browser "Developer Training / Keypoint Recorder" drawer allowing users to capture 100-frame normalized ISL keypoint samples and export them as JSON/CSV.

### Pretrained Conversational Word Recognition (The Brain Part 2)

- [ ] **WORD-01**: Integrates pretrained AI4Bharat INCLUDE-50 ISL conversational word temporal model exported to ONNX format.
- [ ] **WORD-02**: Web Worker runs temporal inference on the 30-frame sliding window every 5 frames while `SIGNING_ACTIVE` is true.
- [ ] **WORD-03**: Implements 2-step consecutive confirmation gating: a sign is only accepted if the same gloss has top-1 confidence >=0.75 across two consecutive inference windows.
- [ ] **WORD-04**: Supports at least 50 core everyday ISL signs (Greetings, Pronouns, Questions, Actions, Essentials).

### Computational Linguistics & Sentence Engine (The Linguist)

- [ ] **LING-01**: Manages an active gloss buffer that automatically deduplicates repeated adjacent signs (`["HELLO", "HELLO"]` -> `["HELLO"]`).
- [ ] **LING-02**: Provides manual correction controls including `[Undo Last Sign]` and `[Clear All]` in `<LiveGlossBar />`.
- [ ] **LING-03**: Implements deterministic ISL Subject-Object-Verb (SOV) to English Subject-Verb-Object (SVO) clause reordering in pure JavaScript.
- [ ] **LING-04**: Repositions trailing ISL WH-question markers (`WHAT`, `WHERE`, `WHO`, `WHY`, `HOW`, `WHEN`) to the front of English interrogative sentences with appropriate copula insertion.
- [ ] **LING-05**: Renders a live circular 1.2s countdown ring that triggers sentence completion and displays the formatted English preview string.

### Networking, Subtitles HUD & Cloud Deployment (The Bridge)

- [ ] **NETW-01**: Provides instant room creation and joining via URL parameter (`?room=roomId`) using Supabase Realtime for signaling and presence tracking.
- [ ] **NETW-02**: Establishes peer-to-peer WebRTC `RTCDataChannel("isl-chat")` with Cloudflare STUN/TURN traversal for <20ms direct messaging.
- [ ] **NETW-03**: Implements seamless fallback to Supabase Realtime Broadcast WebSocket if P2P UDP connection fails or is blocked.
- [ ] **NETW-04**: Streams live partial sign tokens (`"Aarav is signing: YOU • NAME..."`) to the text partner in real time as signs are recognized.
- [ ] **NETW-05**: Renders incoming text replies from Person B inside `<IncomingSubtitleOverlay />` directly above the top edge of Person A's webcam canvas (zero eye-travel HUD).
- [ ] **NETW-06**: Production build (`npm run build`) optimized for Cloudflare Pages with immutable model asset caching headers.

## v2 Requirements

Deferred to subsequent releases:
- **EXP-01**: Full 263-word INCLUDE extended vocabulary support.
- **EXP-02**: Bi-directional two-way video calling alongside data channels.
- **EXP-03**: Custom user sign calibration and profile synchronization.
- **EXP-04**: Speech-to-text (TTS/STT) voice input for hearing partner.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Cloud GPU video streaming | Rejected to ensure complete user privacy, eliminate server costs, and prevent network latency |
| Single-handed ASL-only alphabet | ISL is inherently two-handed (25 of 26 letters require both hands interacting) |
| Mandatory user accounts / signups | Unnecessary barrier to entry; room URLs provide instant zero-friction sessions |
| Cloud video recording storage | Adds high storage/bandwidth hosting fees and privacy compliance overhead |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| VISN-01 | Phase 1 | Complete |
| VISN-02 | Phase 1 | Complete |
| VISN-03 | Phase 1 | Complete |
| VISN-04 | Phase 1 | Pending |
| VISN-05 | Phase 1 | Pending |
| MATH-01 | Phase 2 | Pending |
| MATH-02 | Phase 2 | Pending |
| MATH-03 | Phase 2 | Pending |
| MATH-04 | Phase 2 | Pending |
| MATH-05 | Phase 2 | Pending |
| ALPH-01 | Phase 3 | Pending |
| ALPH-02 | Phase 3 | Pending |
| ALPH-03 | Phase 3 | Pending |
| ALPH-04 | Phase 3 | Pending |
| WORD-01 | Phase 4 | Pending |
| WORD-02 | Phase 4 | Pending |
| WORD-03 | Phase 4 | Pending |
| WORD-04 | Phase 4 | Pending |
| LING-01 | Phase 5 | Pending |
| LING-02 | Phase 5 | Pending |
| LING-03 | Phase 5 | Pending |
| LING-04 | Phase 5 | Pending |
| LING-05 | Phase 5 | Pending |
| NETW-01 | Phase 6 | Pending |
| NETW-02 | Phase 6 | Pending |
| NETW-03 | Phase 6 | Pending |
| NETW-04 | Phase 6 | Pending |
| NETW-05 | Phase 6 | Pending |
| NETW-06 | Phase 6 | Pending |

**Coverage:**
- v1 requirements: 29 total
- Mapped to phases: 29
- Unmapped: 0 ✓

---
*Requirements defined: 2026-11-04*
*Last updated: 2026-11-04 after initial definition*
