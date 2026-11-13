import React, { useState } from 'react';
import {
  Monitor,
  Cpu,
  GitPullRequest,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  RotateCcw,
  Terminal,
  AlertTriangle
} from 'lucide-react';

export function AboutModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('git'); // Defaults to 'git' when inspecting dev/git
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedClone, setCopiedClone] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [clearSuccess, setClearSuccess] = useState(false);

  const GIT_REPO_URL = 'https://github.com/vickysahuhere/signbridge';
  const CLONE_CMD = 'git clone https://github.com/vickysahuhere/signbridge.git';

  const handleCopyUrl = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(GIT_REPO_URL);
      setCopiedUrl(true);
      setTimeout(() => setCopiedUrl(false), 2000);
    }
  };

  const handleCopyClone = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(CLONE_CMD);
      setCopiedClone(true);
      setTimeout(() => setCopiedClone(false), 2000);
    }
  };

  const handleClearAllCache = async () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete all app cache?\n\nThis will reset:\n• Mastered sign learning streak & progress\n• Cached user profile & room preferences\n• Locally saved feedback reports\n• Browser CacheStorage & IndexedDB\n\nThe app will reload with a fresh state.'
    );

    if (!confirmed) return;

    setIsClearing(true);

    try {
      // 1. Wipe localStorage
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.clear();
      }

      // 2. Wipe sessionStorage
      if (typeof window !== 'undefined' && window.sessionStorage) {
        window.sessionStorage.clear();
      }

      // 3. Wipe CacheStorage (service worker / runtime caches)
      if (typeof window !== 'undefined' && 'caches' in window) {
        try {
          const cacheKeys = await window.caches.keys();
          await Promise.all(cacheKeys.map(k => window.caches.delete(k)));
        } catch (err) {
          console.warn('[Dev] Failed to clear CacheStorage:', err);
        }
      }

      // 4. Wipe IndexedDB databases
      if (typeof window !== 'undefined' && 'indexedDB' in window && window.indexedDB.databases) {
        try {
          const dbs = await window.indexedDB.databases();
          for (const db of dbs) {
            if (db.name) {
              window.indexedDB.deleteDatabase(db.name);
            }
          }
        } catch (err) {
          console.warn('[Dev] Failed to clear IndexedDB:', err);
        }
      }

      setClearSuccess(true);

      // 5. Reload app with ?guide=true so it immediately pops up the fresh App Guide after reset!
      setTimeout(() => {
        window.location.href = window.location.origin + window.location.pathname + '?guide=true';
      }, 750);
    } catch (e) {
      console.error('[Dev] Error while clearing cache:', e);
      setIsClearing(false);
      alert('Encountered an error while clearing cache. Check console for details.');
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-zinc-950/60 backdrop-blur-sm select-none"
      aria-label="System Properties and Contributor Panel"
      role="dialog"
    >
      <div className="cartoon-card w-full max-w-2xl h-[95dvh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-cartoon-lg bg-white overflow-hidden rounded-t-2xl sm:rounded-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Title Bar */}
        <div className="px-4 py-3 bg-[#EAF6E8] border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
              <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-zinc-900">
                Sanket — System &amp; Contributor Panel
              </h2>
              <p className="text-xs text-zinc-500 font-medium">Architecture, Git Repository &amp; 8 Invariants</p>
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
            onClick={() => setActiveTab('git')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'git'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <GitPullRequest className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>Git &amp; Dev</span>
          </button>
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Monitor className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>General</span>
          </button>
          <button
            onClick={() => setActiveTab('invariants')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 ${
              activeTab === 'invariants'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>The 8 Invariants</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] text-zinc-900 text-xs min-h-[300px] max-h-[64vh] overflow-y-auto">
          {/* TAB 1: GIT & DEV */}
          {activeTab === 'git' && (
            <div className="space-y-3.5">
              {/* Git Repository Link Box */}
              <div className="cartoon-card p-3.5 bg-white space-y-2 border-2 border-zinc-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-extrabold text-xs text-zinc-900">
                    <GitPullRequest className="w-4 h-4 text-zinc-900 stroke-[2.2]" />
                    <span>Official Git Repository</span>
                  </div>
                  <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#1CB0F6] text-zinc-900 font-bold">
                    Open Source
                  </span>
                </div>

                <div className="p-2.5 rounded-xl bg-[#FAF8F5] border-2 border-zinc-900 flex items-center justify-between gap-2 flex-wrap">
                  <a
                    href={GIT_REPO_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-xs font-extrabold text-zinc-900 hover:text-blue-700 underline flex items-center gap-1 break-all"
                    title="Open repository on GitHub"
                  >
                    <span>{GIT_REPO_URL}</span>
                    <ExternalLink className="w-3 h-3 flex-shrink-0" />
                  </a>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={handleCopyUrl}
                      className="cartoon-btn !py-1 !px-2 text-[11px] font-bold bg-white hover:bg-zinc-100 flex items-center gap-1"
                      title="Copy Git URL to clipboard"
                    >
                      {copiedUrl ? (
                        <>
                          <Check className="w-3 h-3 text-[#16A34A] stroke-[2.5]" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 stroke-[2.2]" />
                          <span>Copy URL</span>
                        </>
                      )}
                    </button>
                    <a
                      href={GIT_REPO_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="cartoon-btn cartoon-btn-primary !py-1 !px-2.5 text-[11px] font-bold flex items-center gap-1"
                    >
                      <span>Open GitHub</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Clone Command */}
                <div className="p-2 rounded-xl bg-zinc-900 text-zinc-100 font-mono text-[11px] flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-0.5">
                    <Terminal className="w-3 h-3 text-zinc-400 flex-shrink-0" />
                    <span className="text-zinc-200 select-all font-semibold">{CLONE_CMD}</span>
                  </div>
                  <button
                    onClick={handleCopyClone}
                    className="p-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors flex-shrink-0"
                    title="Copy clone command"
                  >
                    {copiedClone ? (
                      <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* PR Attribution Protocol */}
              <div className="cartoon-card p-3.5 bg-white space-y-2 border-2 border-zinc-900">
                <div className="flex items-center gap-2 font-extrabold text-xs text-zinc-900">
                  <CheckCircle2 className="w-4 h-4 text-[#58CC02] stroke-[2.2]" />
                  <span>Pull Request Attribution Protocol</span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Whenever you submit a pull request, explicitly claim your contribution in the PR template:
                </p>
                <div className="p-2.5 rounded-xl bg-[#FFF9E5] border border-amber-300 font-mono text-xs font-bold text-amber-900 select-all">
                  "This contribution was developed by me (@your-handle)."
                </div>
              </div>

              {/* Developer Cache & Storage Reset Tool */}
              <div className="cartoon-card p-3.5 bg-[#FFF5F5] border-2 border-red-500/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-600 stroke-[2.2]" />
                    <span className="font-extrabold text-xs text-zinc-900">Developer Reset: Browser App Cache</span>
                  </div>
                  <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-red-600 text-white font-black tracking-wider uppercase">
                    DEV ONLY
                  </span>
                </div>

                <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                  Delete all locally stored app state (mastered signs learning streak, skip guide preference, stored feedback reports, and session caches) to start completely from scratch:
                </p>

                <div className="pt-1 flex items-center gap-2 flex-wrap">
                  <button
                    onClick={handleClearAllCache}
                    disabled={isClearing || clearSuccess}
                    className={`cartoon-btn !py-1.5 !px-3 text-xs font-black transition-all flex items-center gap-1.5 ${
                      clearSuccess
                        ? 'bg-[#58CC02] text-white border-zinc-900'
                        : 'bg-red-50 hover:bg-red-500 hover:text-white text-red-700 border-2 border-zinc-900 shadow-cartoon-sm'
                    }`}
                    title="Wipes localStorage, sessionStorage, and cache storage, then reloads"
                  >
                    {clearSuccess ? (
                      <>
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>Cache Cleared! Reloading...</span>
                      </>
                    ) : isClearing ? (
                      <>
                        <RotateCcw className="w-3.5 h-3.5 animate-spin" />
                        <span>Clearing Cache...</span>
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
                        <span>Delete All App Cache &amp; Reset</span>
                      </>
                    )}
                  </button>

                  <span className="text-[10px] text-zinc-500 font-mono">
                    Wipes: localStorage + sessionStorage + caches
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: GENERAL */}
          {activeTab === 'general' && (
            <div className="space-y-3">
              <div className="cartoon-card p-4 bg-white flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#FFC800] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
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

          {/* TAB 3: THE 8 INVARIANTS */}
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
        <div className="p-3 bg-[#EAF6E8] border-t-2 border-zinc-900 flex justify-between items-center">
          <div className="text-[11px] font-mono text-zinc-500 font-bold">
            Git: <span className="text-zinc-800">github.com/vickysahuhere/signbridge</span>
          </div>
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
