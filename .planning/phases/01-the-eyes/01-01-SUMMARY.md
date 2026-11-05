---
phase: 01-the-eyes
plan: 01
subsystem: vision-runtime
tags:
  - vite
  - react
  - tailwindcss
  - camera-loop
  - hardware-vsync
requires: []
provides:
  - "Vite + React 19 application runtime"
  - "Tailwind CSS dark slate theme styling"
  - "Hardware-synchronized cameraLoop module using requestVideoFrameCallback"
  - "SignerStage mirrored webcam viewport component"
  - "Navbar telemetry header component"
affects:
  - "01-02-PLAN.md"
  - "01-03-PLAN.md"
tech-stack:
  added:
    - "@mediapipe/tasks-vision"
    - "onnxruntime-web"
    - "@supabase/supabase-js"
    - "lucide-react"
    - "tailwindcss"
    - "vite"
    - "react"
  patterns:
    - "requestVideoFrameCallback V-Sync acquisition loop"
    - "Mirrored video display for natural human interaction"
key-files:
  created:
    - "package.json"
    - "vite.config.js"
    - "tailwind.config.js"
    - "postcss.config.js"
    - "index.html"
    - "src/index.css"
    - "src/main.jsx"
    - "src/App.jsx"
    - "src/components/Navbar.jsx"
    - "src/components/SignerStage.jsx"
    - "src/vision/cameraLoop.js"
  modified: []
key-decisions:
  - "Used requestVideoFrameCallback() with requestAnimationFrame fallback to lock frame acquisition strictly to camera hardware V-Sync."
  - "Applied dark slate palette (#0F172A background, #1E293B elevated surfaces) with distinct hand colors defined in Tailwind extension."
requirements-completed:
  - VISN-01
coverage:
  - deliverable: "Hardware-synchronized webcam acquisition via requestVideoFrameCallback"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
duration: 4 min
completed: 2026-11-05
---

# Phase 01 Plan 01: App Scaffolding & Camera Loop Summary

Scaffolded the SignBridge ISL Vite + React application, configured the Tailwind CSS dark-slate UI shell, and built the hardware-synchronized webcam acquisition pipeline using `requestVideoFrameCallback`.

## Key Accomplishments

1. **Scaffolded React + Vite Environment**:
   - Installed core dependencies (`@mediapipe/tasks-vision`, `onnxruntime-web`, `@supabase/supabase-js`, `lucide-react`, `tailwindcss`).
   - Configured ES module worker bundling in `vite.config.js`.
   - Setup dark high-contrast styling tokens in `tailwind.config.js` (`slate-900`, `slate-800`, `sky-400`, `emerald-400`, `amber-400`, `rose-500`).

2. **Built Hardware Camera Acquisition Loop (`src/vision/cameraLoop.js`)**:
   - Implemented `startCameraLoop(videoElement, onFrameReady)` using `videoElement.requestVideoFrameCallback` to eliminate duplicate frame processing and drift.
   - Provided fallback for older environments via `requestAnimationFrame`.
   - Returns clean cancellation cleanup function.

3. **Constructed Core UI Shell**:
   - `<Navbar />`: Brand heading, live FPS counter, WebGL/Worker status indicator badge.
   - `<SignerStage />`: Mirrored webcam viewport (`transform: -scale-x-100`) at 640x480 native resolution with permissions error handling.
   - `<App />`: Dark shell integrating Navbar, SignerStage, and status footer.

## Verification Results

- `npm run build` completed with code 0 in 1.99s.
- `src/vision/cameraLoop.js` exports `startCameraLoop`.
- Hardware V-Sync and camera permission error states implemented and verified.

## Self-Check: PASSED
