import React, { useState } from 'react';
import { Monitor, Cpu, GitPullRequest, ShieldCheck, CheckCircle2, X } from 'lucide-react';

export function AboutModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'git' | 'invariants'

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-sm select-none"
      aria-label="System Properties and Contributor Panel"
    >
      <div className="cartoon-card w-full max-w-2xl flex flex-col shadow-cartoon-lg bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Title Bar */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-zinc-900">
                Sanket — System &amp; Contributor Panel
              </h2>
              <p className="text-xs text-zinc-500 font-medium">Architecture, Git Attribution &amp; 8 Invariants</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center justify-center shadow-cartoon-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5] text-zinc-900" />
          </button>
        </div>

        {/* Tab Header */}
        <div className="px-4 pt-3 flex gap-2 border-b border-zinc-200 bg-white flex-shrink-0">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all ${
              activeTab === 'general'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('git')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all ${
              activeTab === 'git'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            Git Attribution
          </button>
          <button
            onClick={() => setActiveTab('invariants')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all ${
              activeTab === 'invariants'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            The 8 Invariants
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] text-zinc-900 text-xs min-h-[260px] max-h-[60vh] overflow-y-auto">
          {activeTab === 'general' && (
            <div className="space-y-3">
              <div className="cartoon-card p-4 bg-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
                  <Monitor className="w-6 h-6 text-zinc-900 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-zinc-900">SignBridge ISL (संकेत / Sanket)</h3>
                  <p className="text-xs text-zinc-500 font-medium">Version 0.1.0 • Client-Side Edge AI</p>
                  <p className="text-xs text-[#16A34A] font-bold">100% In-Browser Edge Execution • $0 Cloud Cost</p>
                </div>
              </div>

              <div className="cartoon-card p-3 bg-white space-y-2 font-mono text-[11px]">
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="font-bold text-zinc-600">Vision Pipeline:</span>
                  <span className="font-bold text-zinc-900">MediaPipe Holistic (WASM SIMD)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="font-bold text-zinc-600">Normalized Features:</span>
                  <span className="font-bold text-zinc-900">Float32Array(240)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="font-bold text-zinc-600">Inference Engine:</span>
                  <span className="font-bold text-zinc-900">3D Kinematics &amp; ONNX Runtime (WASM)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="font-bold text-zinc-600">Grammar Engine:</span>
                  <span className="font-bold text-zinc-900">Deterministic ISL (SOV) to English (SVO)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-100">
                  <span className="font-bold text-zinc-600">P2P Transport:</span>
                  <span className="font-bold text-zinc-900">WebRTC RTCDataChannel (&lt;20ms)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'git' && (
            <div className="space-y-3">
              <div className="cartoon-card p-3.5 bg-white space-y-2">
                <div className="flex items-center gap-2 font-extrabold text-xs text-zinc-900">
                  <GitPullRequest className="w-4 h-4 stroke-[2.2]" />
                  <span>Pull Request Attribution Protocol</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Whenever you submit a pull request, explicitly claim your contribution in the PR template:
                </p>
                <div className="p-2 rounded-xl bg-[#FFF9E5] border border-amber-200 font-mono text-xs font-bold text-amber-900">
                  "This contribution was developed by me (@your-handle)."
                </div>
              </div>
            </div>
          )}

          {activeTab === 'invariants' && (
            <div className="space-y-2">
              {[
                '1. Zero Backend Servers: 100% in-browser edge AI.',
                '2. Off-Main-Thread AI: MediaPipe & ONNX live ONLY in Worker.',
                '3. 240-Float Normalization: Strict Float32Array(240); no NaN.',
                '4. Temporal Motion Gating: 30-frame window; configurable auto-commit pause (default 700ms).',
                '5. Confirmation Hysteresis: Multi-frame debounce; lock until reset.',
                '6. Deterministic Linguistics: LING-01 to 04 grammar contracts unbroken.',
                '7. Dual-Transport Networking: WebRTC + Supabase + BroadcastChannel.',
                '8. Premium Minimal & Cartoonish UI: High contrast, flat colors, tactile feedback.'
              ].map((rule, idx) => (
                <div key={idx} className="cartoon-card p-2.5 bg-white flex items-center gap-2.5 text-[11px] font-mono">
                  <CheckCircle2 className="w-4 h-4 text-[#16A34A] flex-shrink-0 stroke-[2.5]" />
                  <span className="font-medium text-zinc-800">{rule}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-[#FAF8F5] border-t-2 border-zinc-900 flex justify-end">
          <button
            onClick={onClose}
            className="cartoon-btn cartoon-btn-primary !px-5 !py-1 text-xs font-bold"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

export default AboutModal;