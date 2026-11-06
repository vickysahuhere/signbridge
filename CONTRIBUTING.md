# 🤝 Contributing to SignBridge ISL (संकेत / Sanket)

Thank you for your interest in contributing to **SignBridge ISL**!

SignBridge is an open-source, edge-AI platform dedicated to bridging communication between the **Indian Sign Language (ISL)** Deaf / Hard-of-Hearing community and hearing individuals. Our mission is to make assistive communication **100% free, fast, private, and accessible directly in the browser**.

> [!IMPORTANT]
> **Working with AI Agents or LLMs?**  
> If you are an AI assistant (or a human directing an AI agent), please review **[`AGENTS.md`](./AGENTS.md)**. It outlines the non-negotiable architectural invariants, data contracts, and recipes designed to prevent breaking the real-time vision loop or grammar engine.

---

## 📌 Table of Contents

- [Code of Conduct & Accessibility Mission](#-code-of-conduct--accessibility-mission)
- [Current Phase: Translator Phase](#-current-phase-translator-phase)
- [Development Setup](#-development-setup)
- [Key Architectural Guidelines](#-key-architectural-guidelines)
- [Contribution Rules: How Not to Break Things](#-contribution-rules-how-not-to-break-things)
- [Git User Setup & PR Authorship ("This is Done by Me")](#-git-user-setup--pr-authorship-this-is-done-by-me)
- [Testing & Quality Gates](#-testing--quality-gates)
- [Submitting a Pull Request](#-submitting-a-pull-request)
- [Questions & Support](#-questions--support)

---

## 🤟 Code of Conduct & Accessibility Mission

1. **Authentic Indian Sign Language (ISL)**: ISL is a distinct, complete language with its own grammar, morphology, and syntax (Subject-Object-Verb, two-handed alphabet). We respect ISL rules and never treat it merely as "English gestures".
2. **Privacy First**: We do not stream camera video to external servers or cloud APIs. All computer vision and AI must remain 100% on-device in the browser.
3. **Inclusive Design**: Maintain accessible UI, high contrast, clear visual feedback for sign confirmation, and heads-up subtitles so Deaf users can communicate effortlessly.

---

## 📍 Current Phase: Translator Phase

We are actively in the **Translator Phase**:
- **Primary Focus**: On-device 30 FPS skeleton tracking, 3D biometric gesture classification, motion gating, and automated ISL-to-English grammar translation.
- **Secondary / Upcoming**: Extended multi-peer WebRTC room telepresence, audio synthesis, and dictionary expansion.

Contributions that improve sign detection accuracy, reduce latency, improve grammar restructuring, or expand the authenticated vocabulary are highly prioritized.

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or later (Node 20+ recommended).
- **Modern Browser**: Chrome, Edge, Firefox, or Safari with WebGL & WebAssembly support.
- A functional webcam for live testing.

### Installation & Run

```bash
# 1. Clone the repository
git clone https://github.com/vicky/signbridge-isl.git
cd sanket

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev

# 4. Open browser at http://localhost:5180
```

### Environment Variables (Optional)
The project works 100% offline using an in-memory cross-tab `BroadcastChannel`. To enable cloud-synchronized multi-device rooms, copy `.env.example` to `.env`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## 📐 Key Architectural Guidelines

| Layer | Location | Rules & Expectations |
| :--- | :--- | :--- |
| **Vision & AI Web Worker** | `src/workers/vision.worker.js` | All MediaPipe Holistic and ONNX Runtime Web executions run strictly in this worker. Never run model inference on the React main thread. Always close `ImageBitmap` buffers. |
| **Coordinate Normalization** | `src/vision/normalizeLandmarks.js` | Must output `Float32Array(240)` centered on shoulder midpoint and scaled by shoulder distance. Fill missing points with `0.0`, never `NaN`. |
| **Motion & Pause Gating** | `src/vision/velocityGate.js` | 4-state machine (`IDLE`, `SIGNING_ACTIVE`, `PAUSE_COUNTDOWN`, `IDLE_COMMIT`). 1.2s pause automatically commits the sentence. |
| **Confirmation Hysteresis** | `src/ai/consecutiveConfirmation.js` | Signs require multi-frame confirmation ($\ge 0.80$ confidence over 6–8 frames) and lock until release. |
| **Linguistic Buffer** | `src/nlp/glossBufferManager.js` | Deduplicates adjacent identical signs (LING-01), merges contiguous fingerspelled characters, supports undo/clear (LING-02). |
| **Grammar Engine** | `src/nlp/islSentenceFormatter.js` | Deterministic ISL (SOV) to English (SVO) restructuring (LING-03) and trailing WH-question repositioning (LING-04). |
| **Networking** | `src/network/` | WebRTC `RTCDataChannel` primary transport; Supabase Realtime WebSocket fallback; `BroadcastChannel` offline fallback. |
| **Design System** | `src/index.css` | Authentic Windows 95 / GeoCities retro styling. Strict `0px` border-radius, 3D outset/inset bevels, and vintage color palette. |

---

## ⚠️ Contribution Rules: How Not to Break Things

Before making changes, ensure you adhere to these guidelines:

1. **Never introduce external server dependencies**: No backend Node.js APIs, Python microservices, or paid LLM API endpoints.
2. **Never break the 240-float tensor shape**: Upstream models and scripts expect `[1, 240]` per frame and `[1, 7200]` for 30-frame temporal windows.
3. **Preserve the offline fallback**: Local tests and single-machine testing depend on `BroadcastChannel` when Supabase credentials are absent.
4. **Preserve the retro UI identity**: Do not replace the 90s Windows 95 aesthetic with generic modern UI cards or rounded pill buttons.
5. **Always close `ImageBitmap` instances**: Unclosed bitmaps leak GPU memory and cause WebGL context losses.
6. **Keep changes covered by tests**: Add corresponding unit tests in `test/` for any new sign, grammar rule, or utility.

---

## 👤 Git User Setup & PR Authorship ("This is Done by Me")

To ensure all contributions are properly credited to you or your team, set up your Git identity before committing:

### 1. Check & Set Your Git User
```bash
# Verify current identity
git config user.name
git config user.email

# Set for this repository only:
git config user.name "Your Full Name"
git config user.email "your.email@example.com"

# Or set globally across your machine:
git config --global user.name "Your Full Name"
git config --global user.email "your.email@example.com"
```

### 2. Claiming Your Work in Pull Requests
When you open a Pull Request, our template (`.github/pull_request_template.md`) automatically prompts you to claim your contribution with an explicit authorship declaration:

> **"This contribution was developed by me (@your-handle)."**

In the PR body:
- **State who you are**: Provide your Git username and GitHub `@handle`.
- **Clarify if AI assisted you**: Indicate if this was written manually, generated by an agent (e.g. Antigravity), or created via pair programming.
- **Write "This is done by me"**: Clearly list the components, sign kinematics, or tests you wrote.
- **Verify the 8 Golden Invariants**: Check off the safety boxes and confirm tests pass.

---

## 🧪 Testing & Quality Gates

Run the automated test suite and production build before submitting any code:

```bash
# Run unit tests (built-in Node test runner, zero extra test dependencies)
npm test

# Run production build
npm run build
```

Both commands **must pass with zero failures and zero errors**.

---

## 🚀 Submitting a Pull Request

1. **Create a branch**:
   ```bash
   git checkout -b feat/add-family-sign
   # or
   git checkout -b fix/webrtc-reconnect
   ```
2. **Commit following Conventional Commits**:
   - `feat(ai): ...`
   - `fix(nlp): ...`
   - `docs(readme): ...`
   - `test(vision): ...`
3. **Push and create a PR**:
   - Describe the changes made.
   - Confirm that `npm test` and `npm run build` pass.
   - Mention any changes to gesture heuristics or grammar tables.

---

## 💬 Questions & Support

- Check [`README.md`](./README.md) for architecture diagrams and an overview of the vision pipeline.
- Check [`AGENTS.md`](./AGENTS.md) for deep technical specifications and agent playbooks.
- Check [`tech.md`](./tech.md) and [`appflow.md`](./appflow.md) for detailed deep-dive guides.
