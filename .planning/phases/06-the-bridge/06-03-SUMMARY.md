---
phase: 06-the-bridge
plan: 03
subsystem: subtitles-hud-and-edge-deployment
tags:
  - subtitles-hud
  - zero-eye-travel
  - chat-panel
  - split-workspace
  - cloudflare-pages
  - immutable-caching
requires:
  - "06-01"
  - "06-02"
provides:
  - "IncomingSubtitleOverlay component providing zero eye-travel subtitles above webcam (NETW-05)"
  - "ChatPanel component featuring 5-column conversational workspace, quick replies, and live signing indicator"
  - "Responsive 12-column split layout in App.jsx connecting vision stage and two-way chat"
  - "Cloudflare Pages public/_headers setting immutable model caching and COOP/COEP WASM SIMD headers (NETW-06)"
affects:
  - "Production Deployment"
tech-stack:
  added:
    - "IncomingSubtitleOverlay (src/components/IncomingSubtitleOverlay.jsx)"
    - "ChatPanel (src/components/ChatPanel.jsx)"
    - "Cloudflare headers (public/_headers)"
  patterns:
    - "Zero eye-travel ergonomics: incoming replies presented as high-contrast HUD banner directly over webcam bezel"
    - "Role-adaptive layout: dual-column workspace for ISL Signer vs focused text terminal for Hearing Partner"
key-files:
  created:
    - "src/components/IncomingSubtitleOverlay.jsx"
    - "src/components/ChatPanel.jsx"
    - "public/_headers"
  modified:
    - "src/components/SignerStage.jsx"
    - "src/components/Navbar.jsx"
    - "src/App.jsx"
key-decisions:
  - "Positioned IncomingSubtitleOverlay right below the top bezel of the webcam feed so Deaf signers maintain natural eye contact while reading text responses."
  - "Built 5-column ChatPanel with one-click quick reply chips ([Yes], [No], [Please repeat], [Thank you])."
  - "Added Cloudflare Pages _headers ensuring immutable 1-year browser cache for .onnx and .task models."
requirements-completed:
  - NETW-05
  - NETW-06
coverage:
  - deliverable: "Production bundle compile and headers copy"
    verification:
      kind: "command"
      ref: "npm run build"
      status: "pass"
    human_judgment: false
duration: 7 min
completed: 2026-11-05
---

# Plan 06-03 Summary: Subtitles HUD, Chat Panel & Cloudflare Edge Deployment

Completed the two-way real-time communication system: created the zero eye-travel `<IncomingSubtitleOverlay />` HUD banner, built the 5-column `<ChatPanel />` with quick replies and live sign streaming, wired the responsive 12-column split-screen layout in `App.jsx`, and configured Cloudflare Pages edge deployment caching in `public/_headers`.

## Accomplishments

1. **Zero Eye-Travel Subtitle HUD (`src/components/IncomingSubtitleOverlay.jsx`)**:
   - Mounted directly at the top bezel of `<SignerStage />` (`NETW-05`).
   - High-contrast glass HUD with glowing cyan accent ring (`text-slate-100`, `border-sky-500/40`).
   - Displays incoming text replies with sender badge and timestamp, auto-dismissing after 12 seconds.

2. **5-Column Conversational Chat Workspace (`src/components/ChatPanel.jsx`)**:
   - Displays full conversational message feed showing original ISL gloss pill badges alongside English translations.
   - Real-time signing indicator: `⚡ Aarav is signing: "What is your..."` (`NETW-04`).
   - Quick reply chips: `[Yes]`, `[No]`, `[Thank you!]`, `[Please repeat]`, `[Where are you now?]`, `[I understand]`.
   - Accessible input box with Enter-to-send support.

3. **Cloudflare Pages Production Edge Headers (`public/_headers`)**:
   - `Cache-Control: public, max-age=31536000, immutable` for `/models/*` and `/assets/*` (`NETW-06`).
   - `Cross-Origin-Embedder-Policy: credentialless` and `Cross-Origin-Opener-Policy: same-origin` to enable multi-threaded WASM SIMD execution.
   - Automatically copied by Vite into `dist/_headers`.

4. **12-Column Split Layout & Navbar Enhancements (`src/App.jsx`, `src/components/Navbar.jsx`)**:
   - Role switcher toggle: `Signer` vs `Text Partner`.
   - Real-time P2P (<20ms) vs WebSocket connection mode badge.
   - Room link copy button with visual feedback.

## Verification Results

- `npm test`: 43/43 unit tests pass.
- `npm run build`: Production bundle compiled cleanly in 3.19s with `dist/_headers` verified.
- Requirements satisfied: `NETW-05`, `NETW-06`.
