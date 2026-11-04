# Phase 1: The Eyes - Context

**Gathered:** 2026-11-04  
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the foundational browser computer vision and hardware acquisition pipeline for SignBridge ISL. It establishes a Vite + React (JavaScript ES6+) application, a dark-slate UI shell with high contrast, webcam access using `requestVideoFrameCallback`, an isolated Web Worker (`vision.worker.js`) running Google MediaPipe Holistic (543 3D landmarks) via WebGL/WASM with asset caching and initial GPU shader warm-up, a 30+ FPS dual-layer synchronized canvas overlay with distinctive hand colors (Left: Sky Blue, Right: Emerald Green, Pose: White, Face: Amber), and visual framing/boundary alert detection.

Mathematical normalization, ONNX model inference, linguistic conversion, and WebRTC networking belong to later phases.
</domain>

<decisions>
## Implementation Decisions

### Project Foundation & Technology Stack
- **D-01:** Framework: Vite + React (vanilla JavaScript ES6+ / ES2023 Modules). No TypeScript build overhead.
- **D-02:** Styling & Icons: Tailwind CSS with dark-first color palette (`#0F172A` canvas background, `#1E293B` elevated cards) + Lucide React icons.
- **D-03:** Dependencies: `@mediapipe/tasks-vision`, `onnxruntime-web`, `@supabase/supabase-js`, `lucide-react`, `tailwindcss`.

### Camera & Frame Acquisition Pipeline
- **D-04:** Use `videoElement.requestVideoFrameCallback()` instead of `setInterval` or `requestAnimationFrame` to lock strictly to camera hardware V-Sync and eliminate duplicate frame processing.
- **D-05:** Mirror webcam feed (`transform: scaleX(-1)`) so signing motions mirror natural human interaction.
- **D-06:** Canvas and video fixed internal aspect ratio of 640x480 for consistent coordinate resolution.

### Web Worker & MediaPipe Holistic Architecture
- **D-07:** Run MediaPipe HolisticLandmarker completely in a dedicated Web Worker (`src/workers/vision.worker.js`) to keep the React UI at 60 FPS without jank.
- **D-08:** Delegate: `"GPU"` with WebGL fallback.
- **D-09:** Shader warm-up: Run 1 dummy inference on worker boot with zero tensors (`Float32Array(7200)`) so the browser precompiles WebGL shaders during app launch.
- **D-10:** Model caching: Cache `.task` files in browser Cache Storage / IndexedDB so subsequent visits load instantly (<300ms).

### Canvas Skeleton Rendering & Visual Feedback
- **D-11:** Color coding:
  - Left Hand joints & bones: Sky Blue (`#38BDF8`)
  - Right Hand joints & bones: Emerald Green (`#34D399`)
  - Upper Body Pose lines: White (`#FFFFFF`)
  - Lips and Eyebrow Mesh: Amber (`#F59E0B`)
  Different hand colors are strictly required to disambiguate crossed hands in two-handed ISL signs.
- **D-12:** Framing Guide: Render a subtle dashed safe-zone box. If wrist coordinates approach viewport borders (<10% margin), highlight canvas border in Rose Red (`#F43F5E`).

### Agent's Discretion
- Component folder layout details (adhering to `tech.md` §7).
- Worker event naming conventions (e.g., `INIT_VISION`, `WORKER_READY`, `PROCESS_FRAME`, `FRAME_RESULT`).
- FPS counter calculation and telemetry bar micro-interactions.
</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Technical Architecture
- `tech.md` §1 — Core architectural philosophy (browser edge AI, zero server cost)
- `tech.md` §2.1 — `requestVideoFrameCallback` vs `setInterval` camera loop implementation
- `tech.md` §2.2 — MediaPipe Holistic 543-keypoint topology and ISL two-handed requirements
- `tech.md` §7 — Directory structure and file layout

### Application Flow & State Machine
- `appflow.md` §2 — Boot, model caching, and shader warm-up flow
- `appflow.md` §4 — Real-time 30 FPS webcam to landmark loop

### UI & Ergonomics
- `ui.md` §1 — Ergonomic principles for Deaf/hard-of-hearing users
- `ui.md` §2 — Screen 2 workspace wireframe (Left Panel: ISL Vision Stage)
- `ui.md` §3 — Dark-first color palette and hand color distinction rationale
- `ui.md` §4.1 — `<SignerStage />` dual-layer canvas specification

### Phase Roadmap & Verification
- `roadmap.md` §Stage 1 — Step-by-step build tasks and verification exercises
- `.planning/TESTING.md` §Phase 1 — Acceptance criteria, automated checks, and interactive UAT checklist
</canonical_refs>

<specifics>
## Specific Ideas

- Crossing hands in front of the chest must clearly show Sky Blue and Emerald Green lines overlapping without rendering glitches or frame drops.
- Telemetry counter should display actual processed FPS, landmarker latency (ms), and worker status.
</specifics>

<deferred>
## Deferred Ideas

- Shoulder-centered coordinate normalization math and wrist velocity gating -> Phase 2.
- In-browser ONNX model inference and ISL Alphabet classifier -> Phase 3.
- Pretrained INCLUDE-50 word recognition -> Phase 4.
- SOV-to-English grammar engine -> Phase 5.
- WebRTC P2P DataChannel connection and Supabase fallback -> Phase 6.
</deferred>

---
*Phase: 01-the-eyes*
*Context gathered: 2026-11-04*
