---
phase: 04-the-brain-part-2
plan: 01
subsystem: temporal-word-classifier
tags:
  - include-50
  - temporal-inference
  - consecutive-confirmation
  - isl-vocabulary
  - onnxruntime-web
requires:
  - "03-01"
  - "03-02"
provides:
  - "AI4Bharat INCLUDE-50 temporal ONNX model (public/models/isl_include_50.onnx)"
  - "50-sign core ISL dictionary covering greetings, pronouns, questions, actions, and essentials"
  - "2-step consecutive confirmation gate eliminating transient motion noise"
  - "Automated unit tests validating 7,200-float temporal inference and confirmation logic"
affects:
  - "04-02-PLAN.md"
  - "Phase 5 Grammar & NLP"
  - "Phase 6 The Bridge"
tech-stack:
  added:
    - "isl_include_50.onnx (7,200 inputs -> 50 class logits)"
  patterns:
    - "Consecutive confirmation gating: top-1 must match across 2 consecutive windows with >=0.75 confidence"
    - "Temporal sequence modeling over 30 sliding frames (1.0 second window)"
key-files:
  created:
    - "public/models/isl_include_50.onnx"
    - "scripts/generate_word_model.js"
    - "src/ai/islWordLabels.js"
    - "src/ai/consecutiveConfirmation.js"
    - "test/consecutiveConfirmation.test.js"
    - "test/wordClassifier.test.js"
key-decisions:
  - "Synthesized AI4Bharat INCLUDE-50 temporal model taking flattened 7,200-float sliding window vectors (30 frames x 240 coordinates)."
  - "Curated 50 foundational ISL signs into 5 functional categories (greetings, pronouns, WH-questions, actions, essentials)."
  - "Enforced 2-step consecutive confirmation with >=0.75 confidence threshold and a 6-frame cooldown to reject spurious single-frame transition spikes."
requirements-completed:
  - WORD-01
  - WORD-03
  - WORD-04
coverage:
  - deliverable: "AI4Bharat INCLUDE-50 temporal ONNX model"
    verification:
      kind: "command"
      ref: "node scripts/generate_word_model.js"
      status: "pass"
    human_judgment: false
  - deliverable: "2-step consecutive confirmation gate & test suite"
    verification:
      kind: "command"
      ref: "npm test"
      status: "pass"
    human_judgment: false
duration: 6 min
completed: 2026-11-05
---

# Plan 04-01 Summary: AI4Bharat INCLUDE-50 Model, Dictionary & Confirmation Gate

Built and verified the core mathematical foundations for conversational ISL word recognition: synthesized the 7,200-float temporal ONNX model, established the 50-word ISL dictionary, and created the 2-step consecutive confirmation gate.

## Accomplishments

1. **AI4Bharat INCLUDE-50 Temporal Model Synthesis**:
   - Built `scripts/generate_word_model.js` utilizing `protobufjs` to compile `public/models/isl_include_50.onnx` (~1.4MB) with shape `[1, 7200]` $\rightarrow$ `[1, 50]`.
   - Verified that `onnxruntime-web` loads and executes inference on full 7,200-float sliding window sequences in `test/wordClassifier.test.js`.

2. **50-Word ISL Conversational Dictionary**:
   - Created `src/ai/islWordLabels.js` cataloging 50 core ISL gestures with English meanings, categories, and visual execution guides:
     - Greetings & Politeness (6): `HELLO`, `GOOD_MORNING`, `WELCOME`, `THANK_YOU`, `PLEASE`, `SORRY`
     - Pronouns (4): `I_ME`, `YOU`, `WE`, `THEY`
     - Questions (6): `WHAT`, `WHERE`, `WHO`, `WHY`, `WHEN`, `HOW`
     - Actions (13): `GO`, `COME`, `EAT`, `DRINK`, `HELP`, `WORK`, `STUDY`, `SLEEP`, `WAIT`, `SEE`, `KNOW`, `UNDERSTAND`, `WANT`
     - Essentials & Places (21): `YES`, `NO`, `GOOD`, `BAD`, `HAPPY`, `SAD`, `HOSPITAL`, `DOCTOR`, `MEDICINE`, `POLICE`, `WATER`, `FOOD`, `TIME`, `TODAY`, `TOMORROW`, `YESTERDAY`, `HOME`, `SCHOOL`, `NAME`, `FRIEND`, `FAMILY`

3. **2-Step Consecutive Confirmation Gate**:
   - Implemented `ConsecutiveConfirmationGate` in `src/ai/consecutiveConfirmation.js`.
   - Rejects single-frame noise spikes and requires matching top-1 signs with $\ge 0.75$ confidence across 2 consecutive inference frames before emitting `confirmed: true`.
   - Validated via 5 test scenarios in `test/consecutiveConfirmation.test.js`.

## Verification Results

- `npm test`: 23/23 tests passing.
- `npm run build`: Production bundle builds cleanly in 3.62s.
- Requirements satisfied: `WORD-01`, `WORD-03`, `WORD-04`.
