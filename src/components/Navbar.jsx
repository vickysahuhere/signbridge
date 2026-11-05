import React, { useState } from 'react';
import {
  Video,
  Cpu,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  Database,
  Sparkles,
  BookOpen,
  Share2,
  Copy,
  Check,
  Wifi,
  User,
  MessageSquare
} from 'lucide-react';

export function Navbar({
  fps = 0,
  workerStatus = 'idle',
  workerLatencyMs = 0,
  motionState = { state: 'IDLE', pauseProgress: 0 },
  recognitionMode = 'word',
  onToggleMode,
  onOpenRecorder,
  onOpenDictionary,
  roomId = '',
  connectionMode = 'p2p',
  rttMs = 18,
  currentRole = 'signer',
  onToggleRole,
  onCopyLink
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (onCopyLink) {
      onCopyLink();
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (workerStatus) {
      case 'ready':
        return {
          label: 'AI Ready',
          dotClass: 'bg-emerald-400 animate-pulse',
          badgeClass: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
        };
      case 'compiling':
      case 'loading':
        return {
          label: 'Compiling...',
          dotClass: 'bg-amber-400 animate-ping',
          badgeClass: 'border-amber-500/30 bg-amber-500/10 text-amber-300'
        };
      case 'error':
        return {
          label: 'Worker Error',
          dotClass: 'bg-rose-500',
          badgeClass: 'border-rose-500/30 bg-rose-500/10 text-rose-300'
        };
      default:
        return {
          label: 'Vision Idle',
          dotClass: 'bg-slate-400',
          badgeClass: 'border-slate-700 bg-slate-800 text-slate-300'
        };
    }
  };

  const getMotionBadge = () => {
    switch (motionState.state) {
      case 'SIGNING_ACTIVE':
        return {
          icon: Zap,
          label: 'Signing',
          badgeClass: 'border-emerald-500/40 bg-emerald-500/20 text-emerald-300 shadow-sm shadow-emerald-500/20 animate-pulse',
          dotClass: 'bg-emerald-400'
        };
      case 'PAUSE_COUNTDOWN':
        const pct = Math.round((motionState.pauseProgress || 0) * 100);
        return {
          icon: Clock,
          label: `Pause ${pct}%`,
          badgeClass: 'border-amber-500/40 bg-amber-500/20 text-amber-300',
          dotClass: 'bg-amber-400 animate-pulse'
        };
      case 'IDLE_COMMIT':
        return {
          icon: CheckCircle2,
          label: 'Committed',
          badgeClass: 'border-sky-500/40 bg-sky-500/20 text-sky-300 ring-1 ring-sky-400/50',
          dotClass: 'bg-sky-400'
        };
      default:
        return {
          icon: Activity,
          label: 'Idle',
          badgeClass: 'border-slate-700/80 bg-slate-800/80 text-slate-400',
          dotClass: 'bg-slate-500'
        };
    }
  };

  const status = getStatusBadge();
  const motion = getMotionBadge();
  const MotionIcon = motion.icon;

  return (
    <header className="border-b border-slate-700/60 bg-slate-800/90 backdrop-blur-md sticky top-0 z-50 px-3 lg:px-6 py-2.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 flex-shrink-0">
            <Video className="w-4 h-4 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-base sm:text-lg text-slate-100 tracking-tight">SignBridge ISL</h1>
              <span className="text-[10px] sm:text-xs px-2 py-0.5 rounded-full bg-slate-700/80 text-sky-300 border border-slate-600 font-mono">
                Phase 6: The Bridge
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Edge AI Real-Time ISL to Text Bridge</p>
          </div>
        </div>

        {/* Center: Room ID & Copy Link */}
        {roomId && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 border border-slate-700 text-xs">
            <span className="text-slate-400 font-mono text-[11px] hidden md:inline">Room:</span>
            <span className="font-mono font-bold text-emerald-400 text-xs">#{roomId}</span>
            <button
              onClick={handleCopy}
              className="ml-1 p-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-slate-100 transition"
              title="Copy Partner Invite Link"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}

        {/* Center / Right Control & Status Bar */}
        <div className="flex items-center gap-2">
          {/* Role Switcher Pill */}
          {onToggleRole && (
            <div className="flex items-center p-0.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-medium">
              <button
                onClick={() => onToggleRole('signer')}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                  currentRole === 'signer'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Video className="w-3 h-3" />
                <span className="hidden sm:inline">Signer</span>
              </button>
              <button
                onClick={() => onToggleRole('text_partner')}
                className={`px-2.5 py-1 rounded-md transition flex items-center gap-1 ${
                  currentRole === 'text_partner'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <MessageSquare className="w-3 h-3" />
                <span className="hidden sm:inline">Text Partner</span>
              </button>
            </div>
          )}

          {/* Mode Selector Pill (Word vs A-Z) */}
          {currentRole === 'signer' && (
            <div className="hidden lg:flex items-center p-0.5 rounded-lg bg-slate-900/80 border border-slate-700 text-xs font-medium">
              <button
                onClick={() => onToggleMode && onToggleMode('word')}
                className={`px-2.5 py-1 rounded-md transition ${
                  recognitionMode === 'word'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Words
              </button>
              <button
                onClick={() => onToggleMode && onToggleMode('alphabet')}
                className={`px-2.5 py-1 rounded-md transition ${
                  recognitionMode === 'alphabet'
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                A–Z
              </button>
            </div>
          )}

          {/* ISL Dictionary (50 Words) Trigger Button */}
          {onOpenDictionary && (
            <button
              onClick={onOpenDictionary}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-medium transition shadow-sm"
              title="Open 50-Word ISL Vocabulary Dictionary"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">ISL Dictionary (50)</span>
            </button>
          )}

          {/* Keypoint Recorder Trigger Button */}
          {onOpenRecorder && currentRole === 'signer' && (
            <button
              onClick={onOpenRecorder}
              className="hidden xl:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 text-xs font-medium transition shadow-sm"
              title="Open Developer Keypoint Dataset Recorder"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Recorder</span>
            </button>
          )}

          {/* Connection Mode Pill */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-xs font-mono">
            <Wifi className={`w-3 h-3 ${connectionMode === 'p2p' ? 'text-emerald-400' : 'text-sky-400'}`} />
            <span className={`font-semibold hidden sm:inline ${connectionMode === 'p2p' ? 'text-emerald-300' : 'text-sky-300'}`}>
              {connectionMode === 'p2p' ? 'P2P' : 'WebSocket'}
            </span>
            <span className="text-slate-500 text-[10px]">{rttMs}ms</span>
          </div>

          {/* FPS Meter (Only in signer mode) */}
          {currentRole === 'signer' && (
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 text-xs font-mono">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-slate-300 font-semibold">{fps} FPS</span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;
