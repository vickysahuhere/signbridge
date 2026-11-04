# Testing & Verification Specification: SignBridge ISL

This document defines the exact test criteria, verification methods, and validation checklists for each phase of the project to ensure robust execution.

---

## Phase 1: The Eyes (Webcam & 3D Holistic Tracking)

### Automated Checks
- [ ] `npm run build` passes with zero bundling errors.
- [ ] Web Worker (`vision.worker.js`) compiles and spawns without runtime errors.
- [ ] `@mediapipe/tasks-vision` assets load without 404 or CORS errors.

### Interactive & Manual UAT
1. **Camera Feed & FPS**:
   - Open browser, grant camera permission.
   - Verify video feed is mirrored horizontally (`scaleX(-1)`).
   - Verify frame rate counter shows $\ge 30\text{ FPS}$ using `requestVideoFrameCallback`.
2. **Color-Coded Skeleton**:
   - Raise both hands in front of camera.
   - Left hand joints/bones must render in Sky Blue (`#38BDF8`).
   - Right hand joints/bones must render in Emerald Green (`#34D399`).
   - Upper body pose lines must render in White.
   - Face points (lips/eyebrows) must render in Amber (`#F59E0B`).
3. **Boundary Alert**:
   - Move hands near the edges of the video viewport.
   - Framing box must shift to Rose Red (`#F43F5E`) alert state.

---

## Phase 2: The Math (Coordinate Normalization & Velocity Gating)

### Automated Checks
- [ ] Unit tests for `normalizeLandmarks.js`:
  - Output vector is strictly length 240 (`Float32Array(240)`).
  - Missing hand landmarks are padded with `0.0` (zero `NaN` values).
  - Shoulder midpoint is centered at `(0, 0, 0)`.
- [ ] Unit tests for `RingBuffer.js`:
  - FIFO buffer keeps maximum 30 frames (`Float32Array(7200)`).
  - Evicts oldest frame when capacity is exceeded.

### Interactive & Manual UAT
1. **Distance Scale Invariance**:
   - Stand 0.5m from webcam; inspect normalized distance between thumb and index fingertips.
   - Step back to 1.5m; normalized distance should remain within $\pm 5\%$ tolerance.
2. **Wrist Velocity Energy Gating**:
   - Move hands rapidly -> Telemetry displays `SIGNING_ACTIVE`.
   - Hold hands still for 0.5s -> State shifts to `PAUSE_COUNTDOWN`.
   - Hold hands still for $\ge 1.2\text{s}$ -> State triggers `IDLE_COMMIT`.

---

## Phase 3: The Brain (Part 1) (Two-Handed ISL Alphabet Recognition)

### Automated Checks
- [ ] `onnxruntime-web` initializes with WebAssembly SIMD/WebGL without throwing.
- [ ] Alphabet model inference executes in $<15\text{ms}$ per evaluation.
- [ ] Softmax distribution sums to $1.0 \pm 0.001$.

### Interactive & Manual UAT
1. **Alphabet Classification**:
   - Switch to **ISL Alphabet Mode**.
   - Sign two-handed ISL letter `A` and `B`.
   - Verify top-1 prediction reaches $\ge 0.75$ confidence and locks in.
   - Verify top-3 predictions and confidence bars update in `<SignerStage />`.
2. **Developer Keypoint Recorder**:
   - Open Developer Training drawer.
   - Click "Record Sample", perform a sign for 100 frames.
   - Verify export produces a clean JSON array of normalized 42-keypoint vectors.

---

## Phase 4: The Brain (Part 2) (Pretrained Conversational ISL Words)

### Automated Checks
- [ ] `isl_words_include50.onnx` and `isl_labels.json` load properly from `public/models/`.
- [ ] Model accepts input tensor of shape `[1, 30, 240]` and produces valid logit outputs.
- [ ] 2-step consecutive confirmation logic properly rejects single-window confidence spikes.

### Interactive & Manual UAT
1. **Word Recognition**:
   - Sign `NAMASTE` / `HELLO` in front of the camera.
   - Verify the 30-frame sliding window processes the movement.
   - Confirm green pill `[ NAMASTE ]` appears in `<LiveGlossBar />` with $\ge 75\%$ confidence.
2. **Sequential Signs**:
   - Sign `YOU` followed by `NAME` followed by `WHAT`.
   - Verify gloss pills populate in order: `[ YOU ] [ NAME ] [ WHAT ]`.

---

## Phase 5: The Linguist (ISL SOV to English Sentence Reconstruction)

### Automated Checks
- [ ] Unit tests for `islSentenceFormatter.js`:
  - `["ME", "WATER", "WANT"]` -> `"I want water."`
  - `["YOU", "NAME", "WHAT"]` -> `"What is your name?"`
  - `["YOU", "HOW"]` -> `"How are you?"`
  - `["TODAY", "ME", "HAPPY"]` -> `"I am happy today."`
  - Adjacent duplicates: `["HELLO", "HELLO"]` -> `"Hello."`

### Interactive & Manual UAT
1. **Gloss Buffer & Edit Controls**:
   - Add several gloss pills.
   - Click `[Undo Last Sign]` -> removes latest pill.
   - Click `[Clear All]` -> empties buffer.
2. **1.2s Idle Auto-Send**:
   - Sign `YOU` -> `NAME` -> `WHAT`, then lower hands.
   - Watch the 1.2s circular countdown ring fill up.
   - Verify pills automatically convert to `"What is your name?"` and append to the chat log.

---

## Phase 6: The Bridge (WebRTC P2P Chat & Cloud Deployment)

### Automated Checks
- [ ] Supabase client initializes with environment variables without errors.
- [ ] WebRTC peer connection initializes with STUN/TURN ICE configurations.
- [ ] `npm run build` generates production bundle with optimized static assets.

### Interactive & Manual UAT
1. **Signaling & P2P Connection**:
   - Open app in two browser tabs or devices with `?room=test-room`.
   - Tab 1: Role = ISL Signer; Tab 2: Role = Text Partner.
   - Confirm connection status changes to `● P2P Connected`.
2. **Live Sign Streaming**:
   - Sign words in Tab 1; confirm Tab 2 displays real-time indicator (`"⚡ Signer is signing: YOU • NAME..."`).
3. **Zero Eye-Travel HUD Subtitles**:
   - Type a reply in Tab 2 (`"Hello! Nice to meet you."`) and send.
   - Confirm Tab 1 displays the message in the high-contrast Top Glass HUD directly above the webcam canvas.
4. **Fallback Resilience**:
   - Simulate UDP disconnect / block; confirm messages continue delivering over Supabase Realtime Broadcast.
