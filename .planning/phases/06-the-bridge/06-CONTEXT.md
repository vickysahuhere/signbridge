# Phase 6: The Bridge - Context

**Gathered:** 2026-11-05  
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 6 delivers the real-time networking, two-way communication bridge, zero eye-travel subtitle HUD, and production Cloudflare Pages deployment for SignBridge ISL. It connects Person A (ISL Signer) and Person B (Hearing Text Partner) across the web without server infrastructure by combining Supabase Realtime WebSocket signaling and presence with a peer-to-peer WebRTC `RTCDataChannel("isl-chat")` (<20ms latency) backed by STUN/TURN traversal. It streams live partial sign compositions in real time as gestures are performed, delivers incoming text responses directly inside an ergonomic Top Subtitle HUD overlay above the webcam feed, and configures immutable caching headers for edge delivery.
</domain>

<decisions>
## Implementation Decisions

### Room Matchmaking & Supabase Realtime Signaling (NETW-01, NETW-03)
- **D-01:** Implement `src/network/supabaseClient.js`:
  - Connects to Supabase using `createClient` from `@supabase/supabase-js`.
  - Reads `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`, with reliable public fallback demo credentials for standalone zero-configuration local runs.
  - Subscribes to room channels (`room:${roomId}`) with Realtime Broadcast and Presence tracking.
- **D-02:** Implement `src/hooks/useRoomConnection.js`:
  - URL Room routing: inspects `window.location.search` for `?room=roomId`. If absent, generates a friendly human-readable ID (e.g. `isl-room-42`) and pushes to URL without page reload.
  - Role management: allows toggling between `'signer'` (Person A) and `'text_partner'` (Person B).
  - Dual-transport resilience (`NETW-03`): if WebRTC P2P fails or is blocked by strict firewalls, messages automatically route over Supabase Realtime Broadcast over WebSocket (port 443 HTTPS), ensuring the connection never drops.

### Peer-to-Peer WebRTC DataChannel & Live Sign Streaming (NETW-02, NETW-04)
- **D-03:** Implement `src/network/webrtcManager.js`:
  - Uses standard STUN servers (`stun:stun.cloudflare.com:3478`, `stun:stun.l.google.com:19302`).
  - Person A (Signer/Initiator) creates `RTCDataChannel("isl-chat")`, generates SDP Offer, and exchanges ICE candidates via Supabase broadcast signaling.
  - Person B receives Offer, creates SDP Answer, and connects directly over UDP.
  - Packet protocol:
    - `PARTIAL_SIGNING`: Dispatched as signs are recognized (`{ type: 'PARTIAL_SIGNING', sender, glosses, text }`) (`NETW-04`).
    - `COMMITTED_MESSAGE`: Dispatched upon 1.2s pause completion (`{ type: 'COMMITTED_MESSAGE', id, sender, glosses, text, timestamp }`).
    - `TEXT_REPLY`: Dispatched by Text Partner (`{ type: 'TEXT_REPLY', id, sender, text, timestamp }`).

### Zero Eye-Travel Subtitle HUD & Full Chat Split Layout (NETW-05, NETW-06)
- **D-04:** Build `src/components/IncomingSubtitleOverlay.jsx`:
  - Mounted directly at the top of the webcam feed in `<SignerStage />`.
  - Displays Person B's latest text reply in bold, high-contrast text (`bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-sky-200 text-lg sm:text-xl py-2.5 px-5 rounded-2xl shadow-2xl`).
  - Zero eye-travel ergonomics: signer maintains comfortable eye contact with the webcam while reading replies without looking away to a side monitor.
- **D-05:** Build `src/components/ChatPanel.jsx`:
  - 5-column conversational workspace per `ui.md`.
  - Message thread displaying both ISL signer messages (with gloss pills) and text partner replies.
  - Live typing/signing indicator (`⚡ Aarav is signing: YOU • NAME...`).
  - Quick reply chips (`[Yes]`, `[No]`, `[Please repeat]`, `[Thank you]`).
  - Text input box with Send button.
- **D-06:** Cloudflare Pages Production Deployment (`NETW-06`):
  - Add `public/_headers`:
    - `Cache-Control: public, max-age=31536000, immutable` for `/models/*`.
    - `Cross-Origin-Embedder-Policy: credentialless` and `Cross-Origin-Opener-Policy: same-origin` for SharedArrayBuffer and WASM SIMD threading.
</decisions>

<canonical_refs>
## Canonical References

### Architecture & Network Flow
- `tech.md` §6 — Networking Concept: Hybrid WebRTC (`RTCDataChannel`) + Supabase Realtime in JS
- `tech.md` §6.1 — Dual-Transport Resilience (WebRTC Primary + Supabase Broadcast Fallback)
- `appflow.md` §3 Flow 2 — Room Join & WebRTC Peer-to-Peer Connection Flow (Mermaid Sequence)
- `ui.md` §2 Screen 2 — Main Communication Workspace Wireframe (7-col vision stage + 5-col chat panel)
- `ui.md` §4.1 — Top Subtitle HUD (`<IncomingSubtitleOverlay />`)
</canonical_refs>
