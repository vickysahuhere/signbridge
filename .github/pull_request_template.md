<!-- 
  SignBridge ISL Pull Request Template
  Ensures clear attribution of work, validation of the 8 Golden Invariants,
  and passing pre-flight quality checks.
-->

## 👤 Contributor & Git User Attribution

- **Git User Name**: <!-- e.g., Jane Doe -->
- **GitHub Username / Handle**: @<!-- e.g., janedoe -->
- **Contributor Type**: 
  - [ ] Human Developer
  - [ ] AI Agent (e.g., Antigravity, Claude, Copilot)
  - [ ] Human + AI Pair Programming
- **Authorship Declaration**:
  > **"This contribution was developed by me (@your-handle)."**

---

## 📝 What Was Done ("This is done by me")

### Summary of Changes:
<!-- Provide a concise 2-4 sentence summary of what you implemented, fixed, or tuned. -->

### Detailed Breakdown:
- [ ] <!-- e.g., Added geometric heuristic for ISL sign 'FAMILY' in islGestureEngine.js -->
- [ ] <!-- e.g., Added grammar restructuring rules for 'FAMILY' in islSentenceFormatter.js -->
- [ ] <!-- e.g., Added unit tests in test/islSentenceFormatter.test.js -->

---

## 🛡️ The 8 Golden Invariants Verification

Please check each box to certify that your changes do **not** break the core system:

- [ ] **1. Zero Backend Servers**: No Node/Python servers or external paid cloud AI APIs were introduced.
- [ ] **2. Off-Main-Thread AI**: MediaPipe Holistic & ONNX Runtime remain exclusively in `src/workers/vision.worker.js`.
- [ ] **3. 240-Float Normalization**: Coordinates are normalized around shoulder midpoint/scale; missing landmarks zero-padded (strictly no `NaN`).
- [ ] **4. Temporal Motion Gating**: 30-frame window (`RingBuffer`) and 1.2s auto-commit pause state machine remain intact.
- [ ] **5. Confirmation Hysteresis**: Consecutive confirmation gates with hysteresis prevent single-frame flickering.
- [ ] **6. Deterministic Linguistics**: LING-01 deduplication, fingerspelling concatenation, and SOV-to-SVO grammar formatting are preserved.
- [ ] **7. Dual-Transport Networking**: WebRTC data channel + Supabase Realtime + BroadcastChannel offline fallback all work.
- [ ] **8. Retro '95 Design System**: Strict 0px border-radius (`border-radius: 0px !important;`) and 3D bevel styling preserved.

---

## 🧪 Pre-Flight Quality Gate Results

Paste or confirm test output before submitting:

- [ ] **Unit Tests Passed** (`npm test`):
  ```
  ✔ 49 passing tests (or higher)
  ```
- [ ] **Production Build Succeeded** (`npm run build`):
  ```
  ✓ built in X.XXs
  ```

---

## 📸 Screenshots or Recordings (if UI was modified)
<!-- Attach screenshot or GIF showing the retro Windows 95 aesthetic preserved -->
