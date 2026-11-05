# Phase 4: The Brain (Part 2) - Context

**Gathered:** 2026-11-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 4 builds the conversational word recognition subsystem of SignBridge ISL. It processes rolling 30-frame temporal sequences (7,200 normalized floats) stored in the RingBuffer to classify 50 core everyday Indian Sign Language (ISL) words derived from the AI4Bharat INCLUDE dataset. To conserve battery and CPU/GPU power, temporal inference runs every 5 frames (~166ms) only while `motion.state === 'SIGNING_ACTIVE'`. To prevent hallucinated gestures or single-frame flickers during movement, a 2-step consecutive confirmation gate requires the same sign to win top-1 with >=0.75 confidence across two consecutive evaluation windows.

Grammar translation (SOV to SVO) and WebRTC networking belong to Phases 5 and 6.
</domain>

<decisions>
## Implementation Decisions

### 50 Core ISL Vocabulary (AI4Bharat INCLUDE Subset)
- **D-01:** Define 50 core everyday ISL signs in `src/ai/islWordLabels.js` organized across 5 semantic domains:
  1. Greetings & Politeness: `HELLO`, `GOOD_MORNING`, `WELCOME`, `THANK_YOU`, `PLEASE`, `SORRY`
  2. Pronouns: `I_ME`, `YOU`, `WE`, `THEY`
  3. Interrogatives (WH-Questions): `WHAT`, `WHERE`, `WHO`, `WHY`, `WHEN`, `HOW`
  4. Actions & Verbs: `GO`, `COME`, `EAT`, `DRINK`, `HELP`, `WORK`, `STUDY`, `SLEEP`, `WAIT`, `SEE`, `KNOW`, `UNDERSTAND`, `WANT`
  5. Essentials & Places: `YES`, `NO`, `GOOD`, `BAD`, `HAPPY`, `SAD`, `HOSPITAL`, `DOCTOR`, `MEDICINE`, `POLICE`, `WATER`, `FOOD`, `TIME`, `TODAY`, `TOMORROW`, `YESTERDAY`, `HOME`, `SCHOOL`, `NAME`, `FRIEND`, `FAMILY`

### Temporal ONNX Model Architecture
- **D-02:** Model topology: Input `[1, 7200]` (flattened 30 frames x 240 floats) $\rightarrow$ Dense projection $\rightarrow$ Output `[1, 50]` (logits for 50 ISL signs).
- **D-03:** Provide an automated synthesis script (`scripts/generate_word_model.js`) that produces `public/models/isl_include_50.onnx` with Xavier initialization and category priors, validated directly with `onnxruntime-web`.

### Cadence & Power Conservation (Every 5 Frames)
- **D-04:** Rather than running heavy temporal inference on all 30 frames per second, the Web Worker maintains a counter `inferenceTick % 5 === 0` to execute temporal classification only every 5th frame (~6 inferences/second).
- **D-05:** Inference only executes when `motion.state === 'SIGNING_ACTIVE'` and `ringBuffer.size() >= 30`, preventing false positives when hands are resting or still.

### 2-Step Consecutive Confirmation Gate
- **D-06:** Implement `src/ai/consecutiveConfirmation.js`:
  - Tracks candidate gloss and confidence across consecutive inference frames.
  - Condition: A word is emitted as `CONFIRMED` if and only if `top1.label === prevTop1.label` AND `top1.confidence >= 0.75` AND `prevTop1.confidence >= 0.75`.
  - Rejection: Resets candidate if confidence dips below 0.75 or if the top gloss changes.

### UI Feedback & ISL Dictionary Panel
- **D-07:** In `<SignerStage />`, render the confirmed word badge with lock status: `[Top-1: HOSPITAL (91%) LOCKED]`.
- **D-08:** Build `src/components/WordDictionaryModal.jsx` allowing users to view all 50 supported ISL signs categorized by domain with visual search.
</decisions>

<canonical_refs>
## Canonical References

### Architecture & Specification
- `tech.md` §4 — Sliding Window Buffer, Motion Gating & ONNX Inference
- `tech.md` §4.1 — 30-Frame Sliding Window & Wrist Velocity Trigger
- `appflow.md` §4 — Real-Time 30 FPS Webcam to ISL Gloss Loop (every 5 frames, 2-step confirmation)
- `ui.md` §2 Screen 2 — Main Communication Workspace Wireframe (`[Top-1: HOSPITAL (91%)] [ISL Dictionary (50)]`)
</canonical_refs>
