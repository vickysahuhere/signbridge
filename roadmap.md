# Learning-Focused Staged Development Roadmap (`roadmap.md`)

**Project**: SignBridge ISL — Free, Real-Time Indian Sign Language (ISL) to Text Chat Application  
**Primary Language**: **JavaScript (ES6+)** (with a single optional Google Colab script for exporting pretrained ISL weights to `.onnx`)

This roadmap is structured into **6 progressive, hands-on stages**. Every stage builds a working, testable milestone while teaching you a core pillar of modern AI engineering, Computer Vision math, and Real-Time Distributed Systems in JavaScript.

---

## Overview of the 6 Stages

| Stage | Milestone Name | Core Concepts You Will Learn | Deliverable You Can Demo | Est. Time |
| :--- | :--- | :--- | :--- | :--- |
| **Stage 1** | **The Eyes: Webcam & 3D Holistic Skeleton in JS** | Browser media streams, `requestVideoFrameCallback`, WebGL shaders, 543-point 3D topology, Web Workers | A 60 FPS webcam mirror drawing color-coded 3D skeletons on both hands, upper body, and face | 3–4 Days |
| **Stage 2** | **The Math: Coordinate Normalization & Motion Gating** | Translational & scale invariance, Euclidean distance, ring buffers, wrist velocity energy detectors | A live telemetry dashboard showing shoulder-normalized coordinates and `IDLE` vs. `SIGNING` state detection | 3 Days |
| **Stage 3** | **The Brain (Part 1): Two-Handed ISL Alphabet Recognition** | Neural network inference in JS (`onnxruntime-web`), Softmax probabilities, recording custom ISL keypoints in the browser | Live recognition of two-handed ISL alphabets (A–Z) and numbers (0–9) to spell out words | 4–5 Days |
| **Stage 4** | **The Brain (Part 2): Pretrained ISL Word Recognition (INCLUDE)** | Temporal sequence models (ST-GCN / BiLSTM), sliding 30-frame windows, exporting PyTorch to ONNX | Real-time recognition of 50+ everyday ISL conversational words (`NAMASTE`, `HOW`, `YOU`, `HELP`, `DOCTOR`) | 5–6 Days |
| **Stage 5** | **The Linguist: ISL SOV-to-English Sentence Engine** | Temporal debouncing, state machines, ISL Subject-Object-Verb (SOV) & WH-final grammar reconstruction | Signing `YOU` $\rightarrow$ `NAME` $\rightarrow$ `WHAT` + pausing 1.2s automatically outputs `"What is your name?"` | 3 Days |
| **Stage 6** | **The Bridge: WebRTC P2P Chat & Free Edge Deployment** | WebRTC (`RTCPeerConnection`, `RTCDataChannel`), STUN/TURN NAT traversal, Supabase Realtime, Cloudflare CDN | Two people on different devices having a live ISL-to-Text and Text-to-HUD conversation at $0 cost | 4–5 Days |

---

## Stage 1: The Eyes — Webcam & 3D Holistic Skeleton in JavaScript

### What You Will Learn
* How browser media pipelines work (`navigator.mediaDevices.getUserMedia`) and why `requestVideoFrameCallback` beats `setInterval` for computer vision.
* How Google's `@mediapipe/tasks-vision` uses WebAssembly and WebGL to track **543 3D landmarks** simultaneously in the browser.
* How to offload heavy vision processing into a **JavaScript Web Worker** (`src/workers/vision.worker.js`) so the React UI stays silky smooth at 60 FPS.

### Step-by-Step Build Tasks
1. Scaffold a Vite + React (JavaScript) app:
   ```bash
   npm create vite@latest signbridge-isl -- --template react
   cd signbridge-isl
   npm install @mediapipe/tasks-vision onnxruntime-web @supabase/supabase-js lucide-react tailwindcss
   ```
2. Build `<SignerStage />` with a `<video>` element and an overlaid `<canvas>` (`width=640, height=480`).
3. Initialize `HolisticLandmarker.createFromOptions()` with `runningMode: "VIDEO"` and `delegate: "GPU"`.
4. Write `drawSkeleton.js` to draw the **Left Hand in Sky Blue (`#38BDF8`)**, **Right Hand in Emerald Green (`#34D399`)**, **Upper Body Pose in White**, and **Lips/Eyebrows in Amber**.

### Checkpoint Exercise (How to Verify You Mastered Stage 1)
* Cross your left and right hands in front of your chest (as in ISL two-handed signs like `MOTHER`, `HELP`, or letter `B`). Verify on the canvas that the blue and green hand skeletons track smoothly at **$\ge 30\text{ FPS}$** without freezing the browser tab.

---

## Stage 2: The Math — Coordinate Normalization & Wrist Velocity Gating

### What You Will Learn
* **Spatial Invariance Math**: Why raw camera coordinates `(x, y, z)` break machine learning models when a user sits closer or leans left/right, and how linear algebra (centering on the shoulder midpoint and dividing by shoulder width) solves it.
* **Signal Processing for Gesture Boundaries**: How to calculate frame-to-frame wrist velocity ($v_t = \|\mathbf{w}_t - \mathbf{w}_{t-1}\|_2$) to detect when a person starts signing vs. when they pause their hands.

### Step-by-Step Build Tasks
1. Write `src/vision/normalizeLandmarks.js` to extract 80 key landmarks (21 Left Hand + 21 Right Hand + 12 Upper Pose + 26 Face points) and normalize them into a `Float32Array(240)` vector per frame.
2. Build a `RingBuffer` class in JavaScript that holds the most recent 30 frames (`30 x 240 = 7,200` floats).
3. Write `src/vision/velocityGate.js` to compute rolling wrist speed over the last 5 frames and emit three states:
   * `SIGNING_ACTIVE` (hands moving above threshold)
   * `PAUSE_COUNTDOWN` (hands still for `0.1s – 1.2s`)
   * `IDLE_COMMIT` (hands still for $\ge 1.2\text{s}$)

### Checkpoint Exercise (How to Verify You Mastered Stage 2)
* Stand 0.5 meters from your webcam, then step back to 2.0 meters. Print the normalized distance between your index fingertip and thumb tip in the console—verify that the normalized number stays virtually constant regardless of how far you stand from the camera!

---

## Stage 3: The Brain (Part 1) — Two-Handed ISL Alphabet & Custom Recorder in JS

### What You Will Learn
* How to run neural network inference directly inside JavaScript using **`onnxruntime-web`** (or a lightweight JS Multi-Layer Perceptron).
* How **Softmax probability** works ($P(y_i) = \frac{e^{z_i}}{\sum_j e^{z_j}}$) and why confidence thresholding ($\ge 0.75$) is essential for real-time UX.
* **Bonus Hands-On ML Skill**: How to build an in-browser **"ISL Keypoint Recorder"** that exports normalized 42-hand-keypoint CSV/JSON samples straight from your webcam so you can add or fine-tune any two-handed ISL alphabet letter in 2 minutes!

### Step-by-Step Build Tasks
1. Load the 2-handed 42-keypoint (84/126-float) ISL Alphabet classifier in `vision.worker.js` using `ort.InferenceSession.create()`.
2. Add a small **"Developer Training Mode"** drawer in the UI that lets you record 100 frames of any ISL two-handed alphabet sign, save the normalized coordinates as JSON, or test live predictions.
3. Display the top-3 predicted ISL letters and their confidence bars in `<SignerStage />`.

### Checkpoint Exercise (How to Verify You Mastered Stage 3)
* Switch the UI to **ISL Alphabet Mode** and sign 5 two-handed ISL letters (e.g., `A`, `B`, `C`, `M`, `N`) and spell your first name. Verify each letter locks in cleanly when held steady for 0.4 seconds.

---

## Stage 4: The Brain (Part 2) — Pretrained Conversational ISL Word Recognition

### What You Will Learn
* How **Spatio-Temporal models (ST-GCN / BiLSTM / 1D-Conformer)** recognize dynamic motion across 30 frames (1 second) rather than static single frames.
* How to take a research checkpoint from **[AI4Bharat's OpenHands / INCLUDE repository](https://github.com/AI4Bharat/INCLUDE)** in a free Google Colab notebook and export it to a portable `.onnx` file (`torch.onnx.export`) that runs in JavaScript with zero Python dependencies in production.

### Step-by-Step Build Tasks
1. Run the one-time Google Colab export script (`colab_scripts/export_isl_openhands_to_onnx.py`) to export the pretrained **INCLUDE-50** (50 common ISL conversational words) model to `public/models/isl_words_include50.onnx` + `isl_labels.json`.
2. Wire the 30-frame sliding window buffer from Stage 2 into `session.run()` inside `vision.worker.js` (running inference every 5 frames whenever `velocityGate` reports `SIGNING_ACTIVE`).
3. Implement **2-Step Consecutive Confirmation**: only emit a word gloss if the same word wins Top-1 with confidence $\ge 0.75$ on two consecutive sliding windows.

### Checkpoint Exercise (How to Verify You Mastered Stage 4)
* Perform 10 everyday ISL words from INCLUDE-50 (`HELLO/NAMASTE`, `HOW`, `YOU`, `I/ME`, `GOOD`, `THANK-YOU`, `HELP`, `DOCTOR`, `HOME`, `WHAT`) and verify they appear as green pills in `<LiveGlossBar />` in real time.

---

## Stage 5: The Linguist — ISL (SOV) to English Sentence Reconstruction

### What You Will Learn
* Why Indian Sign Language is a full natural language with its own **Subject-Object-Verb (SOV)** and **WH-Question-Final** syntax, not just word-for-word English on the hands.
* How to write a clean, zero-latency **Natural Language Processing (NLP) rule & template engine in JavaScript** (`src/nlp/islSentenceFormatter.js`) that transforms raw gloss arrays into natural English sentences.

### Step-by-Step Build Tasks
1. Build the **Gloss Buffer Manager** that suppresses consecutive duplicate words (`["HELLO", "HELLO"]` $\rightarrow$ `["HELLO"]`) and supports `[⌫ Undo Last Sign]` and `[✕ Clear]`.
2. Connect the `1.2s` idle hand pause timer from Stage 2 to trigger `formatISLGlossToEnglish(glossArray)`:
   * Reorders SOV clauses (`["ME", "WATER", "WANT"]` $\rightarrow$ `"I want water."`).
   * Moves trailing WH-words (`WHAT`, `WHERE`, `WHO`, `WHY`, `HOW`, `WHEN`) to the front of interrogative sentences (`["YOU", "NAME", "WHAT"]` $\rightarrow$ `"What is your name?"`).
   * Injects appropriate copulas/auxiliaries (*am, is, are*) and punctuation (`?` vs `.`).

### Checkpoint Exercise (How to Verify You Mastered Stage 5)
* Sign `HELLO` $\rightarrow$ `YOU` $\rightarrow$ `HOW` and rest your hands for 1.2 seconds. Watch the circular pause timer complete and transform the three pills into `"Hello, how are you?"` in the chat log.

---

## Stage 6: The Bridge — WebRTC P2P Chat, HUD Subtitles & Free Cloud Deployment

### What You Will Learn
* How **WebRTC (`RTCPeerConnection` and `RTCDataChannel`)** establishes a direct browser-to-browser connection across the internet.
* How **STUN** discovers public IP addresses and how **TURN** relays packets through strict firewalls.
* How to use **Supabase Realtime (Broadcast & Presence)** for serverless signaling and automatic WebSocket fallback.
* How to deploy a high-performance Edge AI web app to **Cloudflare Pages** with `Cache-Control: immutable` headers for `.onnx` models.

### Step-by-Step Build Tasks
1. Create a free project on [Supabase](https://supabase.com/) and copy the public `SUPABASE_URL` and `SUPABASE_ANON_KEY` into `.env`.
2. Write `src/network/webrtcManager.js` to handle room joining, SDP Offer/Answer exchange via Supabase Broadcast, and `RTCDataChannel("isl-chat")` messaging.
3. Connect `<LiveGlossBar />` so live partial sign tokens (`"Aarav is signing: YOU • NAME..."`) stream to Person B in real time, and committed sentences append to `<ChatPanel />`.
4. Render Person B's incoming text replies inside `<IncomingSubtitleOverlay />` at the top of Person A's webcam canvas.
5. Push the repository to GitHub and connect it to **Cloudflare Pages** (`npm run build`, output directory `dist`).

### Final End-to-End Verification Test
* Open your live `https://signbridge-isl.pages.dev` URL on your **laptop** (as Person A, the ISL signer) and on your **smartphone over mobile data** (as Person B, the text user).
* Have a complete 4-turn conversation where Person A only uses ISL in front of the webcam and Person B only types text replies on their phone—confirming `<50ms` message delivery, `30+ FPS` browser vision, and **$0.00 infrastructure cost**.
