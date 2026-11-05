---
phase: 01-the-eyes
plan: 03
subsystem: vision-canvas-renderer
tags:
  - canvas-2d
  - skeleton-rendering
  - anatomical-color-coding
  - boundary-alerts
  - safe-framing
requires:
  - "01-01"
  - "01-02"
provides:
  - "drawSkeleton module with distinct ISL two-handed color coding"
  - "checkBoundaryAlert utility detecting wrists in edge margins"
  - "Mirrored synchronized 640x480 canvas overlay on SignerStage"
  - "Rose Red out-of-bounds warning badge and container border animation"
affects:
  - "Phase 2 Math and Normalization pipeline"
tech-stack:
  added: []
  patterns:
    - "Mirrored canvas drawing context (translate + scale(-1, 1)) aligning with mirrored camera"
    - "Anatomical color separation (Sky Blue left hand vs Emerald Green right hand)"
    - "Boundary proximity alert gating"
key-files:
  created:
    - "src/vision/drawSkeleton.js"
  modified:
    - "src/components/SignerStage.jsx"
key-decisions:
  - "Colored Left Hand in Sky Blue (#38BDF8) and Right Hand in Emerald Green (#34D399) to ensure crossed hands during two-handed ISL signing remain immediately distinguishable."
  - "Mirrored the 2D canvas context horizontally (ctx.translate(640, 0); ctx.scale(-1, 1)) to mirror the user's natural webcam feed without coordinate drift."
  - "Implemented a 10% perimeter margin boundary check that alerts the signer in Rose Red (#F43F5E) if hands wander too close to camera edges."
requirements-completed:
  - VISN-04
  - VISN-05
coverage:
  - deliverable: "Synchronized dual-color hand skeleton rendering on canvas"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
  - deliverable: "Boundary alert detection and Rose Red framing indicator"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
duration: 4 min
completed: 2026-11-05
---

# Phase 01 Plan 03: Dual-Layer Canvas Skeleton & Boundary Alerts Summary

Implemented the real-time canvas skeleton rendering engine with anatomical color separation for two-handed Indian Sign Language (Sky Blue left hand vs. Emerald Green right hand) and boundary edge alert detection.

## Key Accomplishments

1. **Built `src/vision/drawSkeleton.js`**:
   - Defined complete 21-joint hand connection topology (`HAND_CONNECTIONS`), 5-segment upper body pose lines (`UPPER_POSE_CONNECTIONS`), and eyebrow/lip contour paths (`FACE_CONTOURS`).
   - Mapped anatomical color tokens:
     - **Left Hand**: Sky Blue (`#38BDF8`)
     - **Right Hand**: Emerald Green (`#34D399`)
     - **Upper Pose**: White (`#FFFFFF`)
     - **Face (Lips/Eyebrows)**: Amber (`#F59E0B`)
   - Implemented subtle dashed rectangular safe framing guide (`rgba(148, 163, 184, 0.25)`).
   - Built `checkBoundaryAlert(landmarks, marginPercent)` checking if wrist coordinates cross into the 10% edge margins.

2. **Integrated Canvas Layer in `<SignerStage />`**:
   - Synchronized a 640x480 `<canvas>` directly over the video stream.
   - Handled coordinate mirroring with `ctx.translate(640, 0); ctx.scale(-1, 1);` so skeletal limbs match the mirrored user movements.
   - Animated Rose Red alert ring and pill badge: `"Keep both hands centered inside the camera frame"`.
   - Added hand color legend and toggle skeleton button (`Show Skeleton` / `Hide Skeleton`).

## Verification Results

- `npm run build` completed cleanly in 1.98s.
- `src/vision/drawSkeleton.js` exports `drawSkeleton` and `checkBoundaryAlert`.
- Requirements `VISN-04` and `VISN-05` completed.

## Self-Check: PASSED
