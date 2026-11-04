# Technical Architecture & Deep-Dive Learning Guide (`tech.md`)

**Project**: SignBridge ISL — Free, Real-Time Indian Sign Language (ISL) to Text Chat Application  
**Primary Language**: **JavaScript (ES2023+ / ES6 Modules)** — Zero paid backend, 100% browser-first execution.

---

## 1. Core Architectural Philosophy (Why This Stack?)

Traditional sign language apps stream raw webcam video (`640x480 @ 30 FPS`) to a Python backend running on a cloud GPU. That approach has three fatal flaws for a free project:
1. **High Cost**: Cloud GPUs cost $0.50–$2.50/hour.
2. **High Latency**: Uploading video frames over HTTP/WebSockets adds 150–400ms of network lag per frame.
3. **Privacy Risks**: Users do not want raw camera footage uploaded to an external server.

**Our Solution (Edge AI + Peer-to-Peer JavaScript)**:
Everything runs inside **Person A's browser** using JavaScript, **WebGL**, **WebAssembly (WASM)**, and **Web Workers**. The webcam video never leaves Person A's device for AI processing. Only the final recognized text (a few bytes of JSON) is sent across the network to Person B.

| Layer | Technology (JavaScript Ecosystem) | Cost / Free Tier | Why We Use It & What You Will Learn |
| :--- | :--- | :--- | :--- |
| **Frontend Runtime** | **React 19 + Vite (Vanilla JavaScript ES6+)** | 100% Free | Fast HMR bundling, native ES Modules, clean component state management without TypeScript boilerplate overhead. |
| **Multithreading** | **Browser Web Workers API (`new Worker()`)** | Built-in Browser API | Offloads 30 FPS AI math onto a background CPU thread so the chat UI and video never freeze or drop frames. |
| **Vision & Pose Tracking** | **`@mediapipe/tasks-vision` (`HolisticLandmarker`)** | 100% Free (Apache-2.0) | Google's WebGL/WASM tracker that extracts **543 3D coordinates** (both hands, upper body pose, and facial mesh) in ~15ms per frame. |
| **AI Model Inference** | **`onnxruntime-web` (WASM SIMD + WebGL)** | 100% Free (MIT) | Runs our pretrained **AI4Bharat INCLUDE (ISL)** word model (`.onnx`) and **Two-Hand ISL Alphabet MLP** directly inside the browser in <10ms. |
| **Real-Time Signaling & Chat** | **`@supabase/supabase-js` (Realtime Broadcast & Presence)** | Free Tier (200 concurrent users, 2M msgs/month) | Serverless WebSocket channels for room discovery, online status, and instant fallback messaging without writing a Node.js server. |
| **Peer-to-Peer Data & Video** | **Native WebRTC (`RTCPeerConnection` & `RTCDataChannel`)** | Built-in Browser API | Direct browser-to-browser UDP channel (<20ms latency) for streaming live sign captions and optional P2P video. |
| **NAT Traversal** | **Cloudflare STUN + Cloudflare / Metered Free TURN** | Free (1,000 GB/mo on Cloudflare) | Punches through home routers and firewalls so two users on different Wi-Fi/5G networks can connect directly. |
| **Hosting & CDN** | **Cloudflare Pages** | Free Forever (Unlimited static bandwidth) | Hosts our JS bundle and `.onnx`/`.task` model files on a global edge CDN with permanent browser caching. |

---

## 2. Deep Learning Concept 1: How Browser-Side Computer Vision Works in JS

### 2.1 Why `requestVideoFrameCallback` Instead of `setInterval`?
Many beginners use `setInterval(() => detect(), 33)` to grab webcam frames. However, `setInterval` runs on the JavaScript event loop timer, which drifts out of sync with the physical camera hardware—causing you to either process the exact same frame twice (wasting CPU) or skip frames.

Instead, modern browsers provide `videoElement.requestVideoFrameCallback()`. It fires **only when the webcam hardware finishes decoding a brand-new frame**.

```javascript
// src/vision/cameraLoop.js
export function startCameraLoop(videoElement, onFrameReady) {
  let isRunning = true;

  function frameCallback(now, metadata) {
    if (!isRunning) return;
    // metadata.mediaTime gives exact timestamp in seconds of the video frame
    onFrameReady(videoElement, performance.now(), metadata);
    videoElement.requestVideoFrameCallback(frameCallback);
  }

  videoElement.requestVideoFrameCallback(frameCallback);

  return () => {
    isRunning = false;
  };
}
```

### 2.2 Why Indian Sign Language (ISL) Requires Holistic Tracking (543 Keypoints)
Unlike American Sign Language (which uses a one-handed alphabet), **Indian Sign Language (ISL)** is inherently **two-handed and body-anchored**:
* **25 out of 26 ISL alphabet letters** use **both hands** interacting with each other (only the letter 'C' is one-handed).
* Many ISL conversational words have the exact same handshape and differ only in **where the hands touch or move relative to the chest, chin, forehead, or mouth**, plus **non-manual facial expressions** (raised eyebrows for questions, headshakes for negation).

When we run `HolisticLandmarker.detectForVideo()` in JavaScript, it returns an object containing four 3D landmark arrays per frame (each point has `{ x, y, z, visibility }`):
1. `leftHandLandmarks`: **21 points** (Wrist = index `0`, Thumb tip = `4`, Index tip = `8`, Middle tip = `12`, Ring tip = `16`, Pinky tip = `20`).
2. `rightHandLandmarks`: **21 points** (Same anatomical indices `0` to `20`).
3. `poseLandmarks`: **33 body points** (Left shoulder = `11`, Right shoulder = `12`, Left elbow = `13`, Right elbow = `14`, Nose = `0`).
4. `faceLandmarks`: **468 facial mesh points** (We filter 40 key points around the lips, eyebrows, and eyes).

---

## 3. Deep Learning Concept 2: Coordinate Normalization Math in JavaScript

**What you will learn here**: Why raw `(x, y, z)` pixel coordinates fail in Machine Learning, and how to make your AI invariant to camera distance and screen position.

If Person A sits on the left side of their webcam at 1 meter away, their wrist might be at `(x: 0.25, y: 0.60)`. If they move to the right side of the webcam or lean closer, their wrist is now at `(x: 0.75, y: 0.30)`—even though they are performing the **exact same ISL sign**!

To fix this, we implement **Shoulder-Centered & Scale-Normalized Feature Extraction** in pure JavaScript before feeding coordinates to the neural network:

1. **Find the Body Center ($C_t$)**: Compute the midpoint between the left shoulder (`pose[11]`) and right shoulder (`pose[12]`).
2. **Find the Body Scale ($S_t$)**: Compute the Euclidean distance between the left and right shoulders. If the signer leans closer to the camera, $S_t$ grows larger; if they lean back, $S_t$ shrinks.
3. **Normalize Every Point**: Subtract $C_t$ from every hand, pose, and face coordinate, and divide by $S_t$.
4. **Zero-Padding Missing Hands**: In ISL, if one hand drops out of the camera frame, MediaPipe returns `empty` for that hand. We fill those 21 points with `0.0` (never `NaN`, which breaks neural network matrix multiplication).

```javascript
// src/vision/normalizeLandmarks.js

// Selected indices: 21 Left Hand + 21 Right Hand + 12 Upper Pose + 26 Face (Lips/Eyebrows) = 80 Keypoints
const POSE_INDICES = [0, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23];
const FACE_INDICES = [
  13, 14, 78, 308, 82, 312, 87, 317, // Inner & outer lips
  70, 63, 105, 66, 107, 300, 293, 334, 296, 336, // Left & right eyebrows
  33, 133, 362, 263, 1, 4, 152, 10 // Eyes, nose tip, chin, forehead
];

export function extractAndNormalizeFrame(holisticResult) {
  const pose = holisticResult.poseLandmarks?.[0] || [];
  const leftHand = holisticResult.leftHandLandmarks?.[0] || [];
  const rightHand = holisticResult.rightHandLandmarks?.[0] || [];
  const face = holisticResult.faceLandmarks?.[0] || [];

  // 1. Calculate Shoulder Midpoint (Center) and Shoulder Width (Scale)
  const leftShoulder = pose[11] || { x: 0.4, y: 0.5, z: 0 };
  const rightShoulder = pose[12] || { x: 0.6, y: 0.5, z: 0 };

  const centerX = (leftShoulder.x + rightShoulder.x) / 2;
  const centerY = (leftShoulder.y + rightShoulder.y) / 2;
  const centerZ = (leftShoulder.z + rightShoulder.z) / 2;

  const dx = leftShoulder.x - rightShoulder.x;
  const dy = leftShoulder.y - rightShoulder.y;
  const shoulderScale = Math.hypot(dx, dy) || 0.25; // Avoid division by zero

  const features = new Float32Array(80 * 3); // 240 floats per frame
  let offset = 0;

  function writePoint(pt) {
    if (!pt) {
      features[offset++] = 0.0;
      features[offset++] = 0.0;
      features[offset++] = 0.0;
    } else {
      features[offset++] = (pt.x - centerX) / shoulderScale;
      features[offset++] = (pt.y - centerY) / shoulderScale;
      features[offset++] = (pt.z - centerZ) / shoulderScale;
    }
  }

  // 2. Write 21 Left Hand + 21 Right Hand points
  for (let i = 0; i < 21; i++) writePoint(leftHand[i]);
  for (let i = 0; i < 21; i++) writePoint(rightHand[i]);

  // 3. Write 12 Upper Body Pose points
  for (const idx of POSE_INDICES) writePoint(pose[idx]);

  // 4. Write 26 Facial Expression points
  for (const idx of FACE_INDICES) writePoint(face[idx]);

  return {
    features, // Float32Array(240)
    leftWrist: leftHand[0] || null,
    rightWrist: rightHand[0] || null
  };
}
```

---

## 4. Deep Learning Concept 3: Sliding Window Buffer, Motion Gating & ONNX Inference

**What you will learn here**: How temporal sequence models (ST-GCN / BiLSTM / Conformer) process time-series motion in JavaScript using a Ring Buffer and `onnxruntime-web`.

A single video frame cannot distinguish between the ISL sign for `HELLO` and `GOODBYE` because both involve an open palm—the difference is the **motion trajectory over 1 second (30 frames)**.

### 4.1 The 30-Frame Sliding Window & Wrist Velocity Trigger
If we run the AI model when Person A is just resting their hands in their lap, the model will hallucinate random words. To prevent false positives, we compute **Wrist Velocity** ($\bar{v}$) across the last 5 frames:
* **Active Signing State ($\bar{v} \ge \tau_{\text{active}}$)**: Hands are moving; we push the 240 normalized floats into a 30-frame FIFO buffer and run ONNX inference every 5 frames.
* **Pause / Commit State ($\bar{v} < \tau_{\text{idle}}$ for $1.2\text{ seconds}$)**: Person A has finished signing a sentence and lowered or paused their hands; we trigger the **ISL-to-English Sentence Formatter** and send the message!

```javascript
// src/workers/visionWorker.js
import * as ort from 'onnxruntime-web';

let session = null;
const WINDOW_SIZE = 30; // 30 frames = 1.0 second at 30 FPS
const FEATURE_DIM = 240; // 80 landmarks * 3 (x, y, z)
const frameBuffer = [];

export async function initModel(modelUrl = '/models/isl_include_model.onnx') {
  // Use WebAssembly SIMD & WebGL for fast laptop CPU/iGPU execution
  session = await ort.InferenceSession.create(modelUrl, {
    executionProviders: ['wasm', 'webgl']
  });
}

export async function runSequenceInference(frameFeatures) {
  frameBuffer.push(frameFeatures);
  if (frameBuffer.length > WINDOW_SIZE) {
    frameBuffer.shift(); // Keep latest 30 frames
  }
  if (frameBuffer.length < WINDOW_SIZE || !session) return null;

  // Flatten 30 x 240 into a single Float32Array(7200)
  const inputData = new Float32Array(WINDOW_SIZE * FEATURE_DIM);
  for (let t = 0; t < WINDOW_SIZE; t++) {
    inputData.set(frameBuffer[t], t * FEATURE_DIM);
  }

  // Create ONNX tensor with shape [batch_size=1, seq_len=30, features=240]
  const inputTensor = new ort.Tensor('float32', inputData, [1, WINDOW_SIZE, FEATURE_DIM]);
  const outputs = await session.run({ input: inputTensor });
  const logits = outputs.output.data;

  // Compute Softmax probabilities to get top predicted ISL word & confidence
  return getTopPredictionWithSoftmax(logits);
}
```

---

## 5. Deep Learning Concept 4: ISL SOV Grammar to English Reconstruction

**What you will learn here**: Computational linguistics for Indian Sign Language.

Spoken/written English uses **Subject–Verb–Object (SVO)** order (*"I am going to the hospital"* or *"What is your name?"*).  
**Indian Sign Language (ISL)** uses **Subject–Object–Verb (SOV)** order and places **WH-questions (`WHAT`, `WHERE`, `WHO`, `WHY`, `HOW`) and negation (`NO`, `NOT`) at the very end of the sentence**:
* ISL Gloss Sequence: `["YOU", "NAME", "WHAT"]` $\rightarrow$ English: `"What is your name?"`
* ISL Gloss Sequence: `["ME", "HOSPITAL", "GO"]` $\rightarrow$ English: `"I am going to the hospital."`
* ISL Gloss Sequence: `["TODAY", "ME", "HAPPY"]` $\rightarrow$ English: `"I am happy today."`

Our JavaScript `sentenceFormatter.js` module handles this in two layers:
1. **Temporal Debouncer**: Ignores predictions with confidence $<0.75$ and collapses adjacent duplicate emissions (`["NAMASTE", "NAMASTE", "NAMASTE"]` $\rightarrow$ `["NAMASTE"]`).
2. **Deterministic SOV-to-SVO Grammar Engine**: Instantaneously reorders common ISL SOV and WH-final patterns into natural punctuated English in $<1\text{ ms}$ without needing an external paid API.

---

## 6. Networking Concept: Hybrid WebRTC (`RTCDataChannel`) + Supabase Realtime in JS

**What you will learn here**: How real-time multiplayer & chat protocols work under the hood.

1. **Signaling Channel (Supabase Realtime Broadcast)**:
   When User A and User B open `https://your-app.pages.dev/?room=isl-room-101`, neither browser knows the other's IP address. Both join a free Supabase WebSocket channel (`supabase.channel('room:isl-room-101')`).
2. **STUN & TURN Handshake**:
   User A creates an `RTCPeerConnection` configured with Cloudflare's free STUN/TURN servers, opens a data channel (`peer.createDataChannel('isl-chat')`), creates an **SDP Offer**, and broadcasts it over Supabase. User B receives the Offer, generates an **SDP Answer**, and both browsers exchange **ICE Candidates** (network routes) until a direct Peer-to-Peer UDP tunnel opens.
3. **Dual-Transport Resilience**:
   * **Primary Transport**: WebRTC `RTCDataChannel` sends live partial sign tokens (`"Signing: YOU NAME..."`) with `<20ms` P2P latency.
   * **Automatic Fallback**: If a strict college or corporate firewall blocks UDP ports, the app seamlessly falls back to sending JSON packets over the **Supabase Realtime Broadcast WebSocket**, ensuring the chat **never** fails to connect.

---

## 7. Complete Project Directory Structure (JavaScript)

```text
signbridge-isl/
├── public/
│   ├── models/
│   │   ├── holistic_landmarker.task       # Google MediaPipe Holistic weights
│   │   ├── isl_words_include50.onnx       # Pretrained AI4Bharat INCLUDE ISL word model
│   │   ├── isl_alphabet_2hand.onnx        # Two-handed ISL A-Z fingerspelling MLP
│   │   └── isl_labels.json                # Mapping of class IDs -> ISL Glosses
├── src/
│   ├── components/
│   │   ├── Navbar.jsx                     # Room header, connection badge, Mode switch
│   │   ├── SignerStage.jsx                # Webcam <video> + 60fps <canvas> skeleton + Subtitles
│   │   ├── LiveGlossBar.jsx               # Live token pills + Confidence meter + Pause progress
│   │   ├── ChatPanel.jsx                  # Message history + Quick reply chips + Text input
│   │   └── ISLReferenceDrawer.jsx         # Collapsible cheat-sheet of supported ISL signs
│   ├── workers/
│   │   └── vision.worker.js               # Background thread: MediaPipe + Normalization + ONNX
│   ├── vision/
│   │   ├── cameraLoop.js                  # requestVideoFrameCallback manager
│   │   ├── normalizeLandmarks.js          # Shoulder-centered 3D coordinate math
│   │   ├── velocityGate.js                # Wrist motion energy & 1.2s pause detector
│   │   └── drawSkeleton.js                # Color-coded 2D canvas drawing for hands/pose/face
│   ├── nlp/
│   │   └── islSentenceFormatter.js        # Debouncer + ISL (SOV) to English (SVO) converter
│   ├── network/
│   │   ├── supabaseClient.js              # Free Supabase Realtime connection
│   │   └── webrtcManager.js               # RTCPeerConnection + RTCDataChannel + STUN/TURN
│   ├── App.jsx                            # Main application state & room router
│   └── main.jsx                           # Entry point
├── colab_scripts/
│   └── export_isl_openhands_to_onnx.py    # Offline script to convert AI4Bharat PyTorch -> ONNX
├── package.json
└── vite.config.js
```
