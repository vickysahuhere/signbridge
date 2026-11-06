import React, { useState } from 'react';
import { Monitor, Cpu, GitPullRequest, ShieldCheck, CheckCircle2 } from 'lucide-react';

/**
 * AboutModal (Retro Edition)
 * 
 * Authentic Windows 95 System Properties / Agent & Contributor Panel:
 * - Tabbed navigation (General, Contributors & Git, 8 Invariants)
 * - Highlights Git user attribution ("This is done by me")
 * - 0px border-radius, authentic 3D outset/inset styling
 */
export function AboutModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'git' | 'invariants'

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#000000]/60 select-none font-sans"
      aria-label="System Properties and Contributor Panel"
    >
      <div className="retro-window w-full max-w-2xl flex flex-col shadow-2xl border-2 border-[#000000] bg-[#C0C0C0]">
        {/* Title Bar */}
        <div className="retro-window-titlebar">
          <div className="flex items-center gap-1.5">
            <Monitor className="w-3.5 h-3.5 stroke-[2px]" />
            <span className="font-bold text-xs">SignBridge ISL '98 - System & Contributor Panel</span>
          </div>
          <button
            onClick={onClose}
            className="retro-window-btn"
            title="Close Dialog"
            aria-label="Close Dialog"
          >
            ×
          </button>
        </div>

        {/* Tab Header */}
        <div className="px-3 pt-3 flex gap-1 border-b border-[#808080] bg-[#C0C0C0]">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1 text-xs font-bold border-t-2 border-l-2 border-r-2 ${
              activeTab === 'general'
                ? 'bg-[#C0C0C0] border-[#FFFFFF] border-r-[#808080] border-b-0 -mb-[1px] z-10'
                : 'bg-[#B0B0B0] border-[#808080] text-[#404040]'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`px-3 py-1 text-xs font-bold border-t-2 border-l-2 border-r-2 ${
              activeTab === 'git'
                ? 'bg-[#C0C0C0] border-[#FFFFFF] border-r-[#808080] border-b-0 -mb-[1px] z-10'
                : 'bg-[#B0B0B0] border-[#808080] text-[#404040]'
            }`}
          >
            Git & Authorship
          </button>
          <button
            onClick={() => setActiveTab('invariants')}
            className={`px-3 py-1 text-xs font-bold border-t-2 border-l-2 border-r-2 ${
              activeTab === 'invariants'
                ? 'bg-[#C0C0C0] border-[#FFFFFF] border-r-[#808080] border-b-0 -mb-[1px] z-10'
                : 'bg-[#B0B0B0] border-[#808080] text-[#404040]'
            }`}
          >
            The 8 Invariants
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 bg-[#C0C0C0] text-[#000000] text-xs min-h-[280px] max-h-[60vh] overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 retro-inset bg-[#000080] text-[#FFFFFF] flex items-center justify-center flex-shrink-0">
                  <Monitor className="w-8 h-8 stroke-[2px]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#000080]">SignBridge ISL (संकेत / Sanket)</h3>
                  <p className="text-[11px] text-[#404040]">Version 0.1.0 • Translator Phase</p>
                  <p className="text-[11px] text-[#404040]">100% Client-Side In-Browser Neural Network</p>
                </div>
              </div>

              <div className="retro-inset p-3 bg-[#FFFFFF] space-y-1.5 font-mono text-[11px]">
                <div className="flex justify-between">
                  <span className="font-bold text-[#000080]">Vision Pipeline:</span>
                  <span>MediaPipe Holistic (543 pts)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#000080]">Feature Vector:</span>
                  <span>Float32Array(240) [Normalized]</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#000080]">Neural Engine:</span>
                  <span>ONNX Runtime Web (WASM SIMD)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#000080]">Grammar Engine:</span>
                  <span>Deterministic ISL (SOV) to English (SVO)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#000080]">P2P Transport:</span>
                  <span>WebRTC RTCDataChannel (&lt;20ms)</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-bold text-[#000080]">Cloud Hosting Cost:</span>
                  <span className="text-[#008000] font-bold">$0.00 / Free Forever</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'git' && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#000080]">
                <GitPullRequest className="w-4 h-4 stroke-[2px]" />
                <span>Pull Request Attribution & Authorship Standard</span>
              </div>

              <div className="retro-inset p-2.5 bg-[#FFFFCC] border border-[#808080] text-[11px] space-y-1">
                <span className="font-bold text-[#000000]">📝 Authorship Declaration:</span>
                <p className="text-[#000080] font-mono italic">
                  "This contribution was developed by me (@your-handle)."
                </p>
                <p className="text-[10px] text-[#404040]">
                  Whenever you submit a pull request, claim your work explicitly in the PR template. Both human contributors and AI agents must clearly document who wrote the code.
                </p>
              </div>

              <div className="retro-inset p-2.5 bg-[#FFFFFF] space-y-2 font-mono text-[11px]">
                <div className="font-bold text-[#000080]">Configure Your Git Identity:</div>
                <div className="bg-[#EFEFEF] p-1.5 border border-[#C0C0C0] text-[10px]">
                  git config user.name "Your Name"<br />
                  git config user.email "your.email@example.com"
                </div>
                <div className="text-[10px] text-[#404040]">
                  Detailed guidelines are documented in <strong>AGENTS.md</strong> and <strong>CONTRIBUTING.md</strong>.
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invariants' && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#000080]">
                <ShieldCheck className="w-4 h-4 stroke-[2px]" />
                <span>The 8 Golden Invariants (The "Never Break" Rules)</span>
              </div>

              <div className="space-y-1.5 font-mono text-[10px]">
                {[
                  '1. Zero Backend Servers: 100% in-browser edge AI.',
                  '2. Off-Main-Thread AI: MediaPipe & ONNX live ONLY in Worker.',
                  '3. 240-Float Normalization: Strict Float32Array(240); no NaN.',
                  '4. Temporal Motion Gating: 30-frame window; 1.2s auto-commit pause.',
                  '5. Confirmation Hysteresis: Multi-frame debounce; lock until reset.',
                  '6. Deterministic Linguistics: LING-01 to 04 grammar contracts unbroken.',
                  '7. Dual-Transport Networking: WebRTC + Supabase + BroadcastChannel.',
                  '8. Retro \'95 Design: 0px border-radius; Windows 3D bevels.'
                ].map((rule, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 p-1 retro-inset bg-[#FFFFFF]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#008000] flex-shrink-0 stroke-[2px]" />
                    <span>{rule}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="p-3 bg-[#C0C0C0] border-t border-[#808080] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="retro-btn !px-4 !py-1 text-xs font-bold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default AboutModal;
