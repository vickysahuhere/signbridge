# 🤖 AGENTS.md — AI Agent Contributor Guidelines & Architecture Manual

> **Scope**: This document is the **authoritative operational manual and strict rulebook** for any AI agent, LLM assistant, or automated system inspecting, refactoring, fixing, or extending **SignBridge ISL (संकेत / Sanket)**.
>
> **Core Objective**: Enable autonomous agents to make safe, robust, high-quality contributions without breaking the real-time AI vision loop, the linguistic translation engine, the WebRTC signaling channels, or the intentional Windows 95 / retro GeoCities aesthetic.

---

## 📑 Table of Contents

1. [Executive Summary & System Philosophy](#1-executive-summary--system-philosophy)
2. [The 8 Golden Invariants (The "Never Break" Rules)](#2-the-8-golden-invariants-the-never-break-rules)
3. [Repository Topology & File Map](#3-repository-topology--file-map)
4. [Deep-Dive Subsystem Contracts](#4-deep-dive-subsystem-contracts)
   - [4.1 Vision & Web Worker Pipeline (`src/workers/`, `src/vision/`)](#41-vision--web-worker-pipeline)
   - [4.2 AI Models & Gesture Classification (`src/ai/`)](#42-ai-models--gesture-classification)
   - [4.3 Linguistic & Grammar Engine (`src/nlp/`)](#43-linguistic--grammar-engine)
   - [4.4 Networking & Dual-Transport WebRTC (`src/network/`, `src/hooks/`)](#44-networking--dual-transport-webrtc)
   - [4.5 UI & Design System (`src/components/`, `src/index.css`)](#45-ui--design-system)
5. [Common Failure Modes & Anti-Patterns for Agents](#5-common-failure-modes--anti-patterns-for-agents)
6. [Agent Contribution Playbooks (Step-by-Step Recipes)](#6-agent-contribution-playbooks-step-by-step-recipes)
   - [Playbook A: Adding a New ISL Sign / Word](#playbook-a-adding-a-new-isl-sign--word)
   - [Playbook B: Tuning an ISL Alphabet Letter](#playbook-b-tuning-an-isl-alphabet-letter)
   - [Playbook C: Adding Grammar Rules to the ISL-to-English Engine](#playbook-c-adding-grammar-rules-to-the-isl-to-english-engine)
   - [Playbook D: Modifying UI Components](#playbook-d-modifying-ui-components)
   - [Playbook E: Updating WebRTC or Realtime Signaling](#playbook-e-updating-webrtc-or-realtime-signaling)
7. [Verification & Pre-Flight Quality Gates](#7-verification--pre-flight-quality-gates)

---

## 1. Executive Summary & System Philosophy

SignBridge ISL is an **on-device, zero-cost, privacy-preserving bridge** between Indian Sign Language (ISL) users and hearing text partners.

### Fundamental Operating Principles:
1. **100% In-Browser Edge Execution**: The AI runs entirely inside the user's browser using WebGL and WebAssembly (WASM). No video frame, coordinate tensor, or image is ever uploaded to a server or cloud GPU.
2. **Zero Cloud Infrastructure Costs**: The project runs completely free. Signaling uses free-tier Supabase Realtime (with an in-memory cross-tab fallback); NAT traversal uses free public Cloudflare/Google STUN; hosting uses Cloudflare Pages static CDN.
3. **Sub-20ms P2P Latency**: Direct browser-to-browser UDP data channels stream partial signing packets and translations in real time.
4. **Current Milestone — The Translator Phase**: We are currently focused on perfecting **sign accuracy, motion segmentation, on-device gesture recognition, and natural ISL-to-English grammar translation**. Multi-user video calls are downstream.

---

## 2. The 8 Golden Invariants (The "Never Break" Rules)

Whenever you edit or generate code in this repository, you **MUST STRICTLY SATISFY** these 8 invariants:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        THE 8 GOLDEN INVARIANTS                         │
├────────────────────────────────────────────────────────────────────────┤
│ 1. ZERO BACKEND SERVERS        │ Never introduce Node/Python backends   │
│ 2. OFF-MAIN-THREAD AI          │ MediaPipe & ONNX live ONLY in Worker   │
│ 3. 240-FLOAT NORMALIZATION     │ Strictly Float32Array(240); no NaN!    │
│ 4. TEMPORAL MOTION GATING      │ 30-frame window; 1.2s auto-commit pause│
│ 5. CONFIRMATION HYSTERESIS     │ Multi-frame debounce; lock until reset │
│ 6. DETERMINISTIC LINGUISTICS   │ LING-01, 02, 03, 04 contracts unbroken │
│ 7. DUAL-TRANSPORT NETWORKING   │ P2P WebRTC + Supabase + BroadcastChan  │
│ 8. RETRO '95 DESIGN SYSTEM     │ 0px border-radius; Windows 3D bevels   │
└────────────────────────────────────────────────────────────────────────┘
```

### Invariant 1: Zero Backend Servers or Cloud AI APIs
- **DO NOT** introduce a Python backend, FastAPI server, Express server, or paid LLM/AI inference API (such as OpenAI, Anthropic, or paid Gemini Cloud endpoints) for core recognition or translation.
- All vision tracking, neural network inference, and grammar restructuring run **locally in client-side JavaScript**.

### Invariant 2: AI Computations Belong Strictly in the Web Worker
- `src/workers/vision.worker.js` runs MediaPipe Holistic Landmarker and ONNX Runtime Web.
- **DO NOT** import `@mediapipe/tasks-vision` or `onnxruntime-web` into React components or the main thread.
- Frame transmission from React to Worker uses `createImageBitmap(videoElement)` with transferable objects.
- `createImageBitmap` objects **MUST** be explicitly closed (`imageBitmap.close()`) in both worker execution paths and exception handlers to avoid browser GPU memory leaks.
- The `isProcessingFrameRef` lock in `useVisionWorker.js` drops incoming video frames while the worker is busy. **DO NOT remove this throttle**, or the worker queue will buffer indefinitely and induce catastrophic lag.

### Invariant 3: The 240-Float Normalization Contract
- `extractAndNormalizeFrame(holisticResult)` in `src/vision/normalizeLandmarks.js` **must always return a `Float32Array(240)`**:
  - `21 Left Hand points * 3 = 63 floats` (indices 0 to 62)
  - `21 Right Hand points * 3 = 63 floats` (indices 63 to 125)
  - `12 Upper Pose points * 3 = 36 floats` (indices 126 to 161)
  - `26 Facial Mesh points * 3 = 78 floats` (indices 162 to 239)
- Coordinates are centered at the **shoulder midpoint** and scaled by **shoulder distance** (`shoulderScale = Math.hypot(dx, dy) || 0.25`).
- If a hand or face is partially/completely missing from the camera frame, fill missing points with `0.0`. **NEVER permit `NaN` or `undefined`**, which corrupts downstream matrix multiplications.

### Invariant 4: Sliding Window & Velocity Gating State Machine
- `RingBuffer` is locked to `windowSize = 30` frames and `featureDim = 240` (flattened shape: `[1, 7200]`).
- `VelocityGate` tracks rolling wrist movement across a 5-frame window. It has 4 states:
  `IDLE` $\rightarrow$ `SIGNING_ACTIVE` $\rightarrow$ `PAUSE_COUNTDOWN` $\rightarrow$ `IDLE_COMMIT`.
- When hands stay stationary or drop for **1.2 seconds** (`commitDurationMs = 1200`), it emits `IDLE_COMMIT`, which triggers the grammar formatter and transmits the sentence without requiring keyboard/mouse input.
- Do not bypass this state machine; without it, resting hands generate continuous false-positive gesture hallucinations.

### Invariant 5: Multi-Frame Confirmation & Dwell Hysteresis
- Signs are never confirmed on a single frame.
- `ConsecutiveConfirmationGate` requires consecutive frames meeting `confidenceThreshold` (words: $\ge 0.80$ for 6 frames; alphabet: $\ge 0.80$ for 8 frames).
- `lockUntilRelease: true` prevents a held handshape from spamming the buffer repeatedly. The signer must return to neutral or change gesture before a new instance is emitted.

### Invariant 6: Deterministic Linguistic Contracts
- **LING-01**: `GlossBufferManager` automatically deduplicates adjacent identical tokens (`['NAMASTE', 'NAMASTE']` $\rightarrow$ `['NAMASTE']`).
- **Fingerspelling Concatenation**: Contiguous letter tokens are automatically merged into a single word string (e.g. `'S'`, `'A'`, `'N'`, `'K'`, `'E'`, `'T'` $\rightarrow$ `'SANKET'`).
- **LING-02**: Must support manual `.undo()` and `.clear()`.
- **LING-03**: `formatIslSentence()` converts ISL Subject-Object-Verb (SOV) order to English Subject-Verb-Object (SVO) order.
- **LING-04**: Trailing ISL WH-question markers (`WHAT`, `WHERE`, `WHO`, `WHY`, `WHEN`, `HOW`) are repositioned to the front of the English sentence with appropriate copulas and a trailing question mark.

### Invariant 7: Dual-Transport Networking & Offline Fallback
- Primary transport: WebRTC `RTCDataChannel("isl-chat")` (<20ms P2P UDP).
- Secondary transport: Supabase Realtime broadcast WebSocket.
- Offline / Test fallback: If Supabase credentials (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) are missing, `supabaseClient.js` falls back to browser `BroadcastChannel`. **Unit tests and local development must pass without Supabase accounts**.

### Invariant 8: The Windows 95 / Retro GeoCities Design System
- **Strict 0px border radius everywhere**: `*, *::before, *::after { border-radius: 0px !important; }`.
- Authentic 3D beveled surfaces (`retro-outset`, `retro-inset`, `retro-window`, `retro-btn`).
- Palette: `#C0C0C0` neutral grey, `#000080` navy titlebars, `#FFFFCC` yellow notepad alerts, high-contrast black/white typography.
- **DO NOT** replace this retro aesthetic with rounded modern cards, floating pastel gradients, or shadcn components. The retro theme is an intentional identity of the project.

---

## 3. Repository Topology & File Map

```
signbridge-isl/
├── public/
│   ├── _headers                        # COOP/COEP headers for WASM SharedArrayBuffer
│   ├── mediapipe/wasm/                 # Google MediaPipe WASM binaries & loaders
│   ├── models/
│   │   ├── holistic_landmarker.task   # MediaPipe Holistic bundle (hands + pose + face)
│   │   ├── isl_alphabet_mlp.onnx       # A-Z ISL fingerspelling neural net
│   │   └── isl_include_50.onnx         # 50-word temporal sequence model
│   └── onnx/                           # ONNX Runtime Web WASM SIMD & thread workers
├── scripts/
│   ├── generate_alphabet_model.js      # Pure JS protobuf generator for alphabet ONNX
│   └── generate_word_model.js          # Pure JS protobuf generator for temporal ONNX
├── src/
│   ├── ai/
│   │   ├── consecutiveConfirmation.js  # Hysteresis confirmation gate
│   │   ├── islAlphabetLabels.js        # 26 ISL fingerspelling letter metadata
│   │   ├── islGestureEngine.js         # 3D biometric joint & kinematics classifier
│   │   ├── islWordLabels.js            # 50 core ISL vocabulary taxonomy
│   │   └── softmax.js                  # Numerically stable softmax & top-k ranker
│   ├── components/
│   │   ├── ChatPanel.jsx               # Instant messenger window + quick reply chips
│   │   ├── IncomingSubtitleOverlay.jsx # Closed-captioning HUD on webcam
│   │   ├── KeypointRecorderDrawer.jsx  # Dataset recorder & gesture benchmark tool
│   │   ├── LiveGlossBar.jsx            # Live token chips + pause progress + controls
│   │   ├── Navbar.jsx                  # Windows 95 menu bar & connection monitor
│   │   ├── SignerStage.jsx             # Video viewport + 60fps skeleton canvas
│   │   └── WordDictionaryModal.jsx     # Interactive 50-word ISL visual reference
│   ├── hooks/
│   │   ├── useRoomConnection.js        # Room ID router & presence state
│   │   ├── useVisionWorker.js          # Worker lifecycle & frame bridge
│   │   └── useWebRTC.js                # WebRTC state machine & dual-transport bridge
│   ├── network/
│   │   ├── supabaseClient.js           # Supabase Realtime + BroadcastChannel fallback
│   │   └── webrtcManager.js            # PeerConnection + DataChannel manager
│   ├── nlp/
│   │   ├── glossBufferManager.js       # Debouncing & fingerspelling merger
│   │   └── islSentenceFormatter.js     # Deterministic SOV -> SVO grammar engine
│   ├── vision/
│   │   ├── cameraLoop.js               # requestVideoFrameCallback hardware sync
│   │   ├── drawSkeleton.js             # Canvas renderer & boundary alert
│   │   ├── normalizeLandmarks.js       # Shoulder-relative 3D coordinate normalization
│   │   ├── RingBuffer.js               # 30-frame temporal FIFO buffer
│   │   └── velocityGate.js             # Wrist velocity & 1.2s auto-commit pause gate
│   ├── workers/
│   │   └── vision.worker.js            # Off-main-thread vision & AI inference engine
│   ├── App.jsx                         # Main state coordinator & role layout
│   ├── index.css                       # Retro design system CSS & tokens
│   └── main.jsx                        # React root entry point
├── test/                               # Native node:test suite (49 passing tests)
├── package.json                        # Scripts & dependencies
└── vite.config.js                      # Vite + ES Worker + COOP/COEP config
```

---

## 4. Deep-Dive Subsystem Contracts

### 4.1 Vision & Web Worker Pipeline

#### `src/vision/cameraLoop.js`
- Uses `videoElement.requestVideoFrameCallback(callback)` when available, falling back to `requestAnimationFrame`.
- Synchronizes frame capture with camera hardware updates rather than arbitrary timer intervals.
- Yields the video element, high-resolution timestamp, and frame metadata to `SignerStage`.

#### `src/workers/vision.worker.js`
- Receives message `{ type: 'PROCESS_FRAME', imageBitmap, timestamp }`.
- Runs MediaPipe `HolisticLandmarker.detectForVideo(imageBitmap, timestamp)`.
- Immediately closes `imageBitmap.close()` to release the GPU buffer.
- Normalizes landmarks via `extractAndNormalizeFrame()`.
- Updates `RingBuffer` and `VelocityGate`.
- Executes both:
  1. `classifyIslAlphabet()` for 2-handed & 1-handed fingerspelling.
  2. `classifyIslWord()` for 3D geometric & kinematic sign classification.
- Filters predictions through `wordConfirmationGate` and `alphabetConfirmationGate`.
- Emits `{ type: 'LANDMARK_RESULTS', landmarks, normalizedFeatures, motion, alphabetPredictions, wordPredictions, ... }` to main thread.

> [!WARNING]
> **MediaPipe ES Module Worker Quirk**: In Vite's ES module workers, MediaPipe Emscripten throws `ModuleFactory is not defined` if `wasmLoaderPath` is executed dynamically. `vision.worker.js` contains a specific loader fetch + `eval` that defines `self.ModuleFactory = ModuleFactory; delete vision.wasmLoaderPath;`. **DO NOT alter or remove this block**.

### 4.2 AI Models & Gesture Classification

#### `src/ai/islGestureEngine.js`
- Pure math & joint trigonometry running over 21-point hand skeletons and 33-point pose landmarks.
- Hand Analysis (`analyzeHand(hand)`):
  - Checks if wrist is at bottom of screen (`wrist.y > 0.85`), ignoring hands resting in lap.
  - Measures finger extension via Euclidean distance comparison: `dist3D(tip, wrist) > dist3D(pip, wrist) * 1.12`.
  - Determines curled state: `dist3D(tip, wrist) < dist3D(mcp, wrist) * 1.08`.
  - Computes `extendedCount`, `curledCount`, `isFist`, and `isOpenPalm`.
- Gesture Classifiers:
  - `classifyIslWord(leftHand, rightHand, pose, motion)`: Identifies signs such as `NAMASTE`, `HELLO`, `GOOD`, `THANK_YOU`, `HELP`, `WATER`, `DOCTOR`, `HOSPITAL`, etc., checking spatial relations (e.g. palms together for Namaste, touch chin for Thank You, thumbs-up for Good).
  - `classifyIslAlphabet(leftHand, rightHand, pose)`: Implements authentic ISL two-handed letters (A, B, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z) and one-handed 'C'.

#### `src/ai/consecutiveConfirmation.js`
- Class `ConsecutiveConfirmationGate`:
  - `confidenceThreshold`: Minimum confidence required to increment counter (default `0.80`).
  - `requiredConsecutive`: Consecutive matching frames needed before `confirmed: true` (e.g. 6 frames for words $\approx 200\text{ms}$; 8 frames for alphabet).
  - `lockUntilRelease`: Once confirmed, will not confirm again until the candidate changes or drops to neutral.

### 4.3 Linguistic & Grammar Engine

#### `src/nlp/glossBufferManager.js`
- `push(token, type)`:
  - Validates token string.
  - If `type === 'letter'` and preceding token is spelled, appends letter (with 450ms debounce for duplicate consecutive identical characters).
  - Deduplicates adjacent identical word signs.
- `undo()`: Removes the last token from buffer.
- `clear()`: Clears all tokens.

#### `src/nlp/islSentenceFormatter.js`
- Deterministic SOV-to-SVO grammar restructuring:
  - Standard ISL order: `[SUBJECT, OBJECT, VERB]` $\rightarrow$ Formats to English: `Subject + Verb + Object` (e.g. `['I_ME', 'WATER', 'WANT']` $\rightarrow$ *"I want water."*).
  - Trailing WH-questions: `['YOU', 'NAME', 'WHAT']` $\rightarrow$ *"What is your name?"*; `['HOSPITAL', 'WHERE']` $\rightarrow$ *"Where is the hospital?"*.
  - Negation: `['I_ME', 'FOOD', 'EAT', 'NO']` $\rightarrow$ *"I do not eat food."*.
  - Greetings & single signs: Handled via `GREETINGS` table with proper punctuation.

### 4.4 Networking & Dual-Transport WebRTC

#### `src/network/webrtcManager.js`
- Creates `RTCPeerConnection` with Cloudflare & Google public STUN servers:
  ```javascript
  export const STUN_SERVERS = [
    { urls: 'stun:stun.cloudflare.com:3478' },
    { urls: 'stun:stun.l.google.com:19302' }
  ];
  ```
- Creates `RTCDataChannel("isl-chat", { ordered: true })`.
- If data channel is not `'open'`, triggers `onFallbackTrigger(packet)` to route via Supabase Realtime WebSocket broadcast.
- Packet schemas:
  - `PARTIAL_SIGNING`: `{ type: 'PARTIAL_SIGNING', glosses, previewText, sender, timestamp }`
  - `COMMITTED_SENTENCE`: `{ type: 'COMMITTED_SENTENCE', id, glosses, text, sender, senderRole, timestamp }`
  - `TEXT_REPLY`: `{ type: 'TEXT_REPLY', id, text, sender, senderRole, timestamp }`

#### `src/network/supabaseClient.js`
- Verifies if `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are valid non-placeholder strings.
- When unconfigured or offline, uses browser `BroadcastChannel` with an identical API (`sendBroadcast`, `trackPresence`, `onBroadcast`, `onPresenceSync`).

### 4.5 UI & Design System

- Design rules defined in `src/index.css`:
  - `border-radius: 0px !important;`
  - `retro-window`: Inset border container with titlebar styling.
  - `retro-outset`: 3D raised button/card bevel.
  - `retro-inset`: Sunken input/status display bevel.
  - `retro-token`: High-contrast token chips for sign badges.
  - `IncomingSubtitleOverlay`: Renders heads-up subtitles on top of the webcam feed so Deaf signers do not need to look away.

---

## 5. Common Failure Modes & Anti-Patterns for Agents

| Anti-Pattern | Why It Breaks the System | Correct Pattern |
| :--- | :--- | :--- |
| **Importing MediaPipe or ONNX on main thread** | Blocks the UI thread, causing severe frame drops and freezing React input. | Keep all inference inside `src/workers/vision.worker.js`. Main thread only consumes postMessage events. |
| **Forgetting to close `ImageBitmap`** | Every unclosed bitmap leaks browser GPU VRAM. After a few hundred frames, the browser tab crashes with WebGL context loss. | Always call `imageBitmap.close()` in both success and error blocks. |
| **Producing `NaN` in normalization** | Neural network matrix multiplication and geometric trigonometry propagate `NaN` indefinitely, breaking all downstream gestures. | Zero-pad missing landmarks: `features[offset++] = 0.0`. |
| **Bypassing the Velocity Gate** | Without motion gating, the AI continuously predicts signs when hands are resting on the lap or desk. | Ensure predictions only evaluate when `motionState` is active or validly transitioned. |
| **Bypassing `ConsecutiveConfirmationGate`** | Single-frame outputs cause rapid flickering/hallucination between adjacent classes. | Route raw candidate outputs through the confirmation gate. |
| **Removing BroadcastChannel fallback** | Breaks unit tests (`npm test`) and makes local development impossible without live Supabase cloud keys. | Always maintain dual-mode support in `src/network/supabaseClient.js`. |
| **Adding border-radius or modern Tailwind rounded classes** | Violates the project's core design system identity and visual styling. | Use strict 0px radius, 3D outset/inset bevels, and vintage system colors. |
| **Overwriting `.onnx` files without testing** | Corrupts model dimensions expected by the worker (`[1, 240]` or `[1, 7200]`). | If generating models, run `node scripts/generate_*.js` and verify with `npm test`. |

---

## 6. Agent Contribution Playbooks (Step-by-Step Recipes)

### Playbook A: Adding a New ISL Sign / Word

To add a new conversational sign (e.g. `MEDICINE` or `FAMILY`):

1. **Register Label in Metadata**:
   - Open `src/ai/islWordLabels.js`.
   - Add entry to `ISL_WORD_LABELS` with unique `id`, uppercase `gloss`, `english` description, and `category`.
2. **Implement Geometric Kinematics**:
   - Open `src/ai/islGestureEngine.js`.
   - In `classifyIslWord()`, add geometric conditions based on authentic ISL grammar (e.g. relative distance between thumb/fingers, position relative to chest/chin, or hand orientation).
   - Return `{ label: 'YOUR_GLOSS', confidence: 0.92, isConfident: true }`.
3. **Add Grammar Rules**:
   - Open `src/nlp/islSentenceFormatter.js`.
   - Add semantic mapping to `NOUNS`, `VERBS`, `ADJECTIVES`, or `PRONOUNS`.
   - Handle formatting in `formatIslSentence()`.
4. **Write Unit Tests**:
   - Open `test/islGestureEngine.test.js` and `test/islSentenceFormatter.test.js`.
   - Add test cases verifying correct classification and natural English sentence output.
5. **Run Pre-Flight**:
   - Run `npm test` and `npm run build`.

---

### Playbook B: Tuning an ISL Alphabet Letter

1. Open `src/ai/islAlphabetLabels.js` to inspect letter definitions and hand configuration notes (e.g. which letters require two hands).
2. Open `src/ai/islGestureEngine.js` inside `classifyIslAlphabet()`.
3. Tune joint distance thresholds or finger extension checks (`analyzeHand`).
4. Update `test/alphabetClassifier.test.js` or `test/islGestureEngine.test.js`.
5. Run `npm test` to verify no regression across other 25 letters.

---

### Playbook C: Adding Grammar Rules to the ISL-to-English Engine

1. Open `src/nlp/islSentenceFormatter.js`.
2. Determine grammatical category:
   - Pronoun expansion (`I_ME` $\rightarrow$ "I", possessive "my", copula "am").
   - Verb conjugation (`GO` $\rightarrow$ "going to", present "go").
   - WH-question repositioning (`WHAT`, `WHERE`, `WHO`, `WHY`, `WHEN`, `HOW`).
   - Negation clauses (`NO`, `NOT`).
3. Add test cases to `test/islSentenceFormatter.test.js`.
4. Run `npm test`.

---

### Playbook D: Modifying UI Components

1. Follow the retro Windows 95 aesthetic:
   - Use `retro-window`, `retro-btn`, `retro-outset`, `retro-inset`, `retro-token`.
   - Ensure all icons use `stroke-[2px]`.
   - Keep borders sharp (0px border radius).
2. For video overlays, place elements inside `SignerStage.jsx` or as absolute children above the canvas.
3. Test responsiveness across desktop (side-by-side) and mobile viewports.
4. Run `npm run build` to confirm asset bundling.

---

### Playbook E: Updating WebRTC or Realtime Signaling

1. Keep packet structures backward compatible.
2. Ensure `onFallbackTrigger` handles disconnections gracefully.
3. Test in `test/webrtcManager.test.js` and `test/roomConnection.test.js`.
4. Never assume WebRTC UDP ports are open; always verify the Supabase/BroadcastChannel fallback path works.

---

## 7. Verification & Pre-Flight Quality Gates

Before concluding any task or submitting a commit, execute this mandatory verification protocol:

```bash
# 1. Execute full unit test suite (MUST pass 100% of tests with 0 failures)
npm test

# 2. Execute production Vite build (MUST compile with 0 errors)
npm run build
```

### Self-Audit Questions for Agents:
- [ ] Did I maintain 100% in-browser processing without introducing external server dependencies?
- [ ] Are all MediaPipe and ONNX operations confined to `vision.worker.js`?
- [ ] Does `extractAndNormalizeFrame()` still produce exactly 240 floats without any `NaN` values?
- [ ] Are all `ImageBitmap` instances closed after processing?
- [ ] Does `GlossBufferManager` preserve deduplication (LING-01) and fingerspelling concatenation?
- [ ] Does `islSentenceFormatter` produce grammatical English for WH-questions and SOV sentences?
- [ ] Does the app still work offline or without Supabase environment variables?
- [ ] Did I preserve the retro Windows 95 / GeoCities design tokens (0px border-radius, 3D bevels)?
- [ ] Did `npm test` pass all tests?
- [ ] Did `npm run build` succeed cleanly?
