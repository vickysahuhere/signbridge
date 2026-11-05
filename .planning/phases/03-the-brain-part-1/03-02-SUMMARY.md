---
phase: 03-the-brain-part-1
plan: 02
subsystem: alphabet-ui-and-recorder
tags:
  - top-3-hud
  - confidence-bars
  - keypoint-recorder
  - dataset-export
  - developer-tools
requires:
  - "03-01"
provides:
  - "Top-3 Alphabet Prediction HUD on SignerStage with real-time confidence indicator bars"
  - "Visual confidence lock indication (Emerald Green >=75% vs Amber <75%)"
  - "Navbar mode selector pill between Alphabet and Word recognition"
  - "KeypointRecorderDrawer component capturing 100 consecutive normalized 240-float frames"
  - "One-click export of captured gesture datasets to standard JSON and CSV formats"
affects:
  - "Phase 4 INCLUDE-50 Word Model"
  - "Phase 5 Grammar & NLP"
tech-stack:
  patterns:
    - "HUD overlay placed directly in signer field of vision for zero eye travel"
    - "Browser-native CSV and JSON dataset blob downloads"
key-files:
  created:
    - "src/components/KeypointRecorderDrawer.jsx"
  modified:
    - "src/components/SignerStage.jsx"
    - "src/components/Navbar.jsx"
    - "src/hooks/useVisionWorker.js"
    - "src/App.jsx"
key-decisions:
  - "Rendered Top-3 prediction HUD over the top-right of the video viewport so signers can observe classification confidence while maintaining posture facing the camera."
  - "Built 100-frame keypoint recorder with 3-second countdown and live progress meter, exporting CSVs ready for pandas/PyTorch ML training without external tooling."
requirements-completed:
  - ALPH-03
  - ALPH-04
coverage:
  - deliverable: "Top-3 Alphabet prediction HUD with confidence indicators"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
  - deliverable: "Developer training keypoint recorder with JSON/CSV export"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
duration: 6 min
completed: 2026-11-05
---

# Plan 03-02 Summary: Top-3 Alphabet Prediction HUD & Keypoint Dataset Recorder

Surfaced real-time fingerspelling classification feedback directly onto the video stage and built an in-browser Developer Training / Keypoint Recorder drawer for capturing and exporting ISL landmark datasets.

## Accomplishments

1. **Top-3 Alphabet Prediction HUD**:
   - Built a floating HUD on `<SignerStage />` displaying the top predicted ISL character alongside runners-up 2 and 3.
   - Implemented dynamic confidence coloring: locked predictions ($\ge 75\%$) render in Emerald Green with a lock badge, while active buffering/searching renders in Amber.
   - Added micro-progress bars visually displaying confidence percentages.

2. **In-Browser Keypoint Dataset Recorder Drawer**:
   - Created `src/components/KeypointRecorderDrawer.jsx` accessible via the `[Keypoint Recorder]` button in the Navbar.
   - Equipped with a 3-second countdown and a 100-frame automated capture buffer storing normalized 240-float feature vectors.
   - Implemented one-click exports:
     - `isl_<label>_<timestamp>.json`: structured JSON format with metadata.
     - `isl_<label>_<timestamp>.csv`: flattened 240-column CSV format with landmark headers, immediately ready for Python/scikit-learn/PyTorch ML workflows.
     - `isl_dataset_bundle_<timestamp>.json`: multi-sample dataset batch export.

3. **Complete End-to-End Integration**:
   - Streamed `latestNormalizedFeatures` and `alphabetPredictions` from `vision.worker.js` through `useVisionWorker.js` to `SignerStage` and `KeypointRecorderDrawer`.
   - Added A–Z Alphabet vs Word mode switcher in `Navbar.jsx`.

## Verification Results

- `npm test`: 17/17 tests passing.
- `npm run build`: Production bundle compiled cleanly in 2.90s.
- Requirements satisfied: `ALPH-03`, `ALPH-04`.
