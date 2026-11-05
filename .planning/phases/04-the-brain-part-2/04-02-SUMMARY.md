---
phase: 04-the-brain-part-2
plan: 02
subsystem: temporal-word-inference-pipeline
tags:
  - web-worker
  - temporal-cadence
  - word-dictionary-modal
  - signer-stage-hud
  - confirmed-word-banner
requires:
  - "04-01"
provides:
  - "5-frame temporal inference cadence (~6 Hz) in vision.worker.js on 7,200-float RingBuffer windows"
  - "2-step consecutive confirmation gate integrated directly into Web Worker pipeline"
  - "Real-time Top-3 Word Prediction HUD on SignerStage with lock indicators"
  - "Confirmed ISL Word lock banner during active signing"
  - "WordDictionaryModal component providing searchable reference across 50 ISL signs"
affects:
  - "Phase 5 Grammar & NLP"
  - "Phase 6 The Bridge"
tech-stack:
  added:
    - "WordDictionaryModal (searchable 50-word catalog)"
  patterns:
    - "5-frame cadence temporal evaluation: slashes CPU/GPU load while retaining ~166ms recognition latency"
    - "Dual-mode recognition architecture: toggle between Fingerspelling Alphabet and Conversational Words"
key-files:
  created:
    - "src/components/WordDictionaryModal.jsx"
  modified:
    - "src/workers/vision.worker.js"
    - "src/hooks/useVisionWorker.js"
    - "src/components/SignerStage.jsx"
    - "src/components/Navbar.jsx"
    - "src/App.jsx"
key-decisions:
  - "Executed temporal ONNX inference only every 5 frames while motionState is SIGNING_ACTIVE and RingBuffer has >=30 frames."
  - "Maintained dual HUD architecture allowing signers to toggle between Alphabet fingerspelling and Conversational Word recognition."
  - "Added searchable 50-sign vocabulary modal accessible directly from navigation bar."
requirements-completed:
  - WORD-02
coverage:
  - deliverable: "5-frame cadence temporal inference in Web Worker"
    verification:
      kind: "command"
      ref: "npm test"
      status: "pass"
    human_judgment: false
  - deliverable: "Production bundle compile"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
duration: 7 min
completed: 2026-11-05
---

# Plan 04-02 Summary: 5-Frame Temporal Cadence, Word HUD & ISL Dictionary

Integrated the AI4Bharat INCLUDE-50 temporal inference pipeline into the Web Worker with 5-frame power-saving cadence, rendered the live Word HUD and confirmation banner on the Signer Stage, and delivered the interactive 50-word ISL dictionary modal.

## Accomplishments

1. **Web Worker 5-Frame Temporal Cadence**:
   - Initialized `initWordModel` in `src/workers/vision.worker.js`, warming up `isl_include_50.onnx`.
   - Connected `RingBuffer.getFlattened()` (`Float32Array(7200)`) to the ONNX session input tensor.
   - Constrained inference to run only when `motion.state === 'SIGNING_ACTIVE'` and `frameCount % 5 === 0`, reducing compute cycles by over 80%.
   - Wired `ConsecutiveConfirmationGate` to gate predictions, emitting `confirmedWord` only when top-1 prediction matches across 2 consecutive windows with $\ge 0.75$ confidence.

2. **Signer Stage Word Mode HUD & Confirmed Banner**:
   - Updated `src/components/SignerStage.jsx` to render the Top-3 Word Prediction HUD (candidate glosses, lock icons, confidence progress bars).
   - Displayed prominent emerald banner: `CONFIRMED: [GLOSS]` upon 2-step confirmation lock.
   - Seamlessly toggles between Alphabet and Word modes.

3. **Interactive 50-Word ISL Vocabulary Modal**:
   - Created `src/components/WordDictionaryModal.jsx` featuring real-time search, category filtering (All, Greetings, Pronouns, Questions, Actions, Essentials), English translations, and gesture execution guides.
   - Connected modal toggle via `[ISL Dictionary (50)]` button in `src/components/Navbar.jsx`.
   - Wired `wordPredictions` and `latestConfirmedWord` telemetry in `src/hooks/useVisionWorker.js` and `src/App.jsx`.

## Verification Results

- `npm test`: 23/23 tests pass.
- `npm run build`: Vite bundled cleanly in 3.30s.
- Requirement satisfied: `WORD-02`.
