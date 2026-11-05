# Phase 2: The Math - Context

**Gathered:** 2026-11-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2 builds the core mathematical feature extraction, coordinate geometry normalization, and temporal motion gating pipeline. It converts raw 3D landmark coordinates emitted by MediaPipe Holistic into translation- and scale-invariant 240-float feature vectors, maintains a 30-frame sliding RingBuffer (7,200 floats), and computes wrist motion energy to detect gesture boundaries and trigger automatic sentence completion after a 1.2s hand pause.

Model inference (ONNX), grammar reconstruction, and WebRTC networking belong to later phases.
</domain>

<decisions>
## Implementation Decisions

### 80-Keypoint Selection & Topology
- **D-01:** Filter the 543 MediaPipe Holistic landmarks down to 80 critical points (240 floats per frame):
  - 21 Left Hand points (all fingers and wrist)
  - 21 Right Hand points (all fingers and wrist)
  - 12 Upper Body Pose points: Nose (0), Left/Right Shoulders (11, 12), Elbows (13, 14), Wrists (15, 16), Pinkies (17, 18), Index (19, 20), Left Hip (23)
  - 26 Facial Expression points: Lips (13, 14, 78, 308, 82, 312, 87, 317), Eyebrows (70, 63, 105, 66, 107, 300, 293, 334, 296, 336), Eyes/Nose/Chin (33, 133, 362, 263, 1, 4, 152, 10)
- **D-02:** Zero-Padding: If one or both hands drop out of frame, pad the missing 21 points with `0.0` (never `NaN`), ensuring strict constant vector dimensionality for subsequent neural network layers.

### Shoulder-Centered Scale Normalization
- **D-03:** Origin Centering ($C_t$): Center of coordinates is the 3D midpoint between Left Shoulder (`pose[11]`) and Right Shoulder (`pose[12]`).
- **D-04:** Scale Normalization ($S_t$): Scale factor is the 2D Euclidean distance between left and right shoulders (`Math.hypot(dx, dy) || 0.25`).
- **D-05:** Invariance: Subtract $C_t$ and divide by $S_t$ for all coordinates so signing features remain identical whether the user sits 0.5m or 2.0m away or moves left/right.

### Temporal Buffer & Motion Energy Gating
- **D-06:** RingBuffer: A dedicated circular FIFO buffer storing 30 frames (`30 x 240 = 7,200` floats) representing 1.0 second of motion at 30 FPS.
- **D-07:** Velocity Energy Gating: Compute Euclidean wrist displacement between consecutive frames over a rolling 5-frame window.
- **D-08:** Three discrete motion states:
  - `SIGNING_ACTIVE`: Rolling wrist velocity $\ge \tau_{\text{active}}$ (e.g. 0.015 units/frame)
  - `PAUSE_COUNTDOWN`: Rolling wrist velocity $< \tau_{\text{idle}}$ for $0.1\text{s} - 1.2\text{s}$
  - `IDLE_COMMIT`: Hands resting still for $\ge 1.2\text{s}$ with non-empty buffer, signaling sentence completion.

### Agent's Discretion
- Unit test structure and test vector fixtures.
- Exact threshold constants for `SIGNING_ACTIVE` and `IDLE_COMMIT` with easy tuning knobs.
- Telemetry state broadcast to UI.
</decisions>

<canonical_refs>
## Canonical References

### Technical Architecture & Math
- `tech.md` §3 — Coordinate Normalization Math (formulas for $C_t$, $S_t$, indices)
- `tech.md` §4.1 — Sliding Window Buffer & Wrist Velocity Trigger
- `appflow.md` §4 — Real-Time 30 FPS Webcam to ISL Gloss Loop

### Phase Roadmap & Verification
- `roadmap.md` §Stage 2 — Tasks, learning objectives, and verification exercises
- `.planning/TESTING.md` §Phase 2 — Automated test suites and UAT validation criteria
</canonical_refs>

<specifics>
## Specific Ideas
- Distance Invariance Verification: Unit test comparing coordinates of hands at scale=0.2 vs scale=0.8 confirms normalized distance remains constant.
- Standalone math modules runnable in both Node.js (for automated testing) and browser Web Workers.
</specifics>

<deferred>
## Deferred Ideas
- ONNX alphabet classification -> Phase 3.
- AI4Bharat INCLUDE-50 word sequence model -> Phase 4.
- English sentence grammar synthesis -> Phase 5.
</deferred>

---
*Phase: 02-the-math*
*Context gathered: 2026-11-05*
