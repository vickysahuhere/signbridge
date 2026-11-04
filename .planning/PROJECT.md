# SignBridge ISL

## What This Is

SignBridge ISL is a free, real-time, browser-first Indian Sign Language (ISL) to Text communication platform. It enables Deaf and Hard-of-Hearing ISL signers to have seamless, low-latency conversations with hearing text users directly in the browser with zero cloud GPU costs and complete video privacy.

The application captures webcam input at 30+ FPS, tracks 543 3D landmarks via MediaPipe Holistic in a dedicated Web Worker, normalizes landmarks for scale/position invariance, and executes on-device neural network inference (onnxruntime-web) for both two-handed ISL alphabets (A–Z) and 50+ conversational words (AI4Bharat INCLUDE). An in-browser computational linguistics engine converts ISL Subject-Object-Verb (SOV) gloss sequences into natural English sentences and delivers them over WebRTC P2P data channels and Supabase Realtime.

## Core Value

Real-time, privacy-preserving, zero-server-cost two-way communication between Deaf ISL signers and hearing text users running 100% in the browser with <50ms message latency and >=30 FPS vision tracking.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] **Stage 1 (The Eyes)**: Scaffold Vite + React (ES6+) app with Web Worker pipeline, webcam feed via `requestVideoFrameCallback`, MediaPipe Holistic 543-point 3D tracking, and 30+ FPS dual-color skeleton canvas overlay (Left: Sky Blue, Right: Emerald Green).
- [ ] **Stage 2 (The Math)**: Shoulder-centered & scale-normalized feature extraction (80 keypoints / 240 floats per frame), 30-frame FIFO ring buffer, and wrist velocity energy detector with 1.2s idle pause commit trigger.
- [ ] **Stage 3 (The Brain Part 1)**: Two-handed ISL Alphabet (A–Z) and digit recognition using onnxruntime-web MLP, live confidence bars (>=0.75 threshold), and an in-browser ISL Keypoint Recorder drawer for training/fine-tuning.
- [ ] **Stage 4 (The Brain Part 2)**: Pretrained temporal sequence model (AI4Bharat INCLUDE-50) running in Web Worker ONNX runtime on 30-frame sliding windows, with 2-step consecutive confirmation and motion gating.
- [ ] **Stage 5 (The Linguist)**: ISL Gloss Buffer Manager with debouncing, undo/clear controls, and deterministic ISL SOV + WH-final to natural English SVO sentence reconstruction engine (`islSentenceFormatter.js`).
- [ ] **Stage 6 (The Bridge)**: WebRTC P2P chat (`RTCPeerConnection` + `RTCDataChannel`) with Cloudflare STUN/TURN, Supabase Realtime signaling and broadcast fallback, top glass HUD subtitle overlay for zero eye-travel reading, and Cloudflare Pages production deployment.

### Out of Scope

- **Cloud GPU Server Streaming**: Sending raw video frames to backend Python/Flask servers — rejected to maintain 100% user privacy, zero infrastructure costs, and sub-50ms latency.
- **One-handed ASL Only Mode**: Standard ASL alphabet models — rejected because ISL is fundamentally two-handed (25 of 26 letters require both hands interacting) and body-anchored.
- **User Authentication / Account Signups**: Mandatory user accounts, database auth, and passwords — rejected to provide zero-friction instant room access for emergency, family, and casual calls.
- **Full Cloud Video Storage / Recording**: Saving call recordings to cloud storage — out of scope for MVP to respect user privacy and eliminate hosting/storage fees.

## Context

- **Source Specifications**: Derived directly from the project's foundational technical blueprints: `appflow.md`, `roadmap.md`, `tech.md`, and `ui.md`.
- **Ecosystem**: Modern JavaScript (React 19, Vite, ES Modules, Web Workers, WebGL/WASM SIMD, WebRTC, Supabase Realtime).
- **Target Audience**: Deaf and hard-of-hearing individuals using ISL as their primary language, talking to family members, doctors, colleagues, or service providers.
- **Ergonomics**: Designed specifically around Deaf ergonomics (avoiding visual attention splitting with top-canvas glass HUD subtitles and color-coded hand tracking).

## Constraints

- **Platform & Language**: 100% JavaScript (ES2023+ / ES6 Modules) and standard web APIs (no paid cloud GPU backend, no Python runtime required in production).
- **Inference Budget**: On-device AI inference must run under 15ms per frame on standard laptop hardware without dropping UI frames.
- **Network Cost**: Zero recurring server costs — using free-tier Cloudflare STUN/TURN, Cloudflare Pages, and Supabase Realtime free tier.
- **Sign Language Fidelity**: Must accurately adhere to Indian Sign Language (ISL) grammar (SOV, WH-question-final) and two-handed keypoint topologies.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Client-Side Web Worker + WebGL/WASM | Keeps 30 FPS computer vision math off the main React UI thread and preserves full privacy | — Pending |
| MediaPipe Holistic 80-Keypoint Subset | Focuses on 21 left + 21 right hand joints, 12 upper body joints, and 26 facial expression points needed for ISL | — Pending |
| Shoulder Normalization (Center + Scale) | Ensures spatial invariance when signers move closer, farther, or laterally from the webcam | — Pending |
| 1.2s Idle Wrist Velocity Auto-Commit | Natural pause detection triggers sentence formation without requiring signers to touch the keyboard/mouse | — Pending |
| Hybrid WebRTC P2P + Supabase Broadcast | Sub-20ms direct UDP data channel with seamless WebSocket fallback through corporate/college firewalls | — Pending |
| Top-Edge Glass HUD Subtitle Overlay | Eliminates visual attention splitting so signer reads replies while looking directly at the camera | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd-transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd-complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-11-04 after initialization*
