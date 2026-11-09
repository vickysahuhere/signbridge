import React, { useState } from 'react';
import {
  Home,
  Video,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  Database,
  BookOpen,
  Copy,
  Check,
  Wifi,
  MessageSquare,
  Sparkles,
  HelpCircle,
  Hand,
  Info
} from 'lucide-react';

export function Navbar({
  currentPage = 'home',
  onPageChange,
  fps = 0,
  workerStatus = 'idle',
  workerLatencyMs = 0,
  motionState = { state: 'IDLE', pauseProgress: 0 },
  recognitionMode = 'word',
  onToggleMode,
  onOpenRecorder,
  onOpenDictionary,
  onOpenGuide,
  onOpenAbout,
  roomId = '',
  connectionMode = 'p2p',
  rttMs = 18,
  userName = 'User',
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
        return { label: 'AI Ready', bg: 'bg-[#22C55E]', text: 'text-white', dot: 'bg-white' };
      case 'compiling':
      case 'loading':
        return { label: 'AI Loading', bg: 'bg-[#38BDF8]', text: 'text-zinc-900', dot: 'bg-zinc-900' };
      case 'error':
        return { label: 'AI Error', bg: 'bg-[#FF6B6B]', text: 'text-white', dot: 'bg-white' };
      default:
        return { label: 'AI Idle', bg: 'bg-zinc-200', text: 'text-zinc-700', dot: 'bg-zinc-500' };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="w-full px-2 py-1.5 sm:px-4 sm:py-2.5 flex-shrink-0">
      <div className="cartoon-card px-2.5 py-1.5 sm:px-3.5 sm:py-2 flex items-center justify-between gap-2 sm:gap-3 flex-nowrap">
        {/* Left: Brand & Main Mode Selector */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Logo Mark - Click to navigate Home */}
          <button
            type="button"
            onClick={() => onPageChange && onPageChange('home')}
            className="flex items-center gap-1.5 sm:gap-2 text-left cursor-pointer hover:opacity-90 transition-opacity"
            title="Go to Home"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center shadow-cartoon-sm flex-shrink-0">
              <Hand className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-900 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-zinc-900">
                  Sanket
                </span>
                <span className="cartoon-badge !py-0 !px-1 text-[8px] sm:text-[9px] bg-[#FFD15C] text-zinc-900 hidden sm:inline-block">
                  ISL
                </span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 font-mono hidden lg:inline">
                संकेत • Edge AI
              </span>
            </div>
          </button>

          <div className="h-5 w-[2px] bg-zinc-200 hidden sm:block" />

          {/* Primary Page Navigation: Home vs Learn ISL vs Live Chat */}
          <div className="flex items-center bg-[#F4EFEA] p-0.5 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
            <button
              onClick={() => onPageChange && onPageChange('home')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                currentPage === 'home'
                  ? 'bg-white text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                  : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
              }`}
              title="Home Screen"
            >
              <Home className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="inline">Home</span>
            </button>
            <button
              onClick={() => onPageChange && onPageChange('learn')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1 ${
                currentPage === 'learn'
                  ? 'bg-[#FFD15C] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                  : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
              }`}
              title="Practice & Learn ISL with Biometric Guides"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
              <span className="sm:hidden">Learn</span>
              <span className="hidden sm:inline">Learn ISL</span>
            </button>
            <button
              onClick={() => onPageChange && onPageChange('chat')}
              className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center gap-1.5 ${
                currentPage === 'chat'
                  ? 'bg-[#38BDF8] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                  : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
              }`}
              title="Real-Time ISL Video & Text Messenger (Beta)"
            >
              <Video className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="sm:hidden">Call</span>
              <span className="hidden sm:inline">Call &amp; Chat</span>
              <span className="text-[9px] font-black tracking-wider uppercase px-1 py-0.5 rounded bg-amber-300 text-amber-950 border border-amber-600/70 leading-none">
                BETA
              </span>
            </button>
          </div>

          {/* Mode Switcher Pills: Words vs A-Z Letters (only in active Learn or Chat pages) */}
          {currentPage !== 'home' && (
            <>
              <div className="h-5 w-[2px] bg-zinc-200 hidden md:block" />
              <div className="hidden lg:flex items-center bg-[#F4EFEA] p-0.5 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
                <button
                  onClick={() => onToggleMode && onToggleMode('word')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    recognitionMode === 'word'
                      ? 'bg-[#FFD15C] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                      : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
                  }`}
                  title="Daily Vocabulary Signs"
                >
                  <span>Words</span>
                </button>
                <button
                  onClick={() => onToggleMode && onToggleMode('alphabet')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                    recognitionMode === 'alphabet'
                      ? 'bg-[#38BDF8] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                      : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
                  }`}
                  title="Two-Handed Fingerspelling A-Z"
                >
                  <span>A–Z</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Center: Share Room Link (Visible in Chat Mode) */}
        {currentPage === 'chat' && roomId && (
          <div className="hidden md:flex items-center gap-1.5 bg-[#FAF8F5] border-2 border-zinc-900 rounded-xl px-2.5 py-1 shadow-cartoon-sm flex-shrink-0">
            <span className="text-[11px] font-mono font-bold text-zinc-500">
              Room <span className="text-zinc-900">#{roomId}</span>
            </span>
            <button
              onClick={handleCopy}
              className={`cartoon-btn !py-0.5 !px-2 text-[10px] font-bold ${
                copied ? 'cartoon-btn-mint' : 'bg-white hover:bg-zinc-100'
              }`}
              title="Copy Shareable Room Link"
            >
              {copied ? (
                <>
                  <Check className="w-2.5 h-2.5 stroke-[2.5]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-2.5 h-2.5 stroke-[2.2]" />
                  <span>Share</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Right: Modals & Telemetry status */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {onOpenDictionary && (
            <button
              onClick={onOpenDictionary}
              className="cartoon-btn !py-1 !px-2 text-xs bg-white hover:bg-zinc-50"
              title="Open ISL Visual Sign Dictionary"
            >
              <BookOpen className="w-3.5 h-3.5 text-zinc-800 stroke-[2.2]" />
              <span className="hidden sm:inline">Dictionary</span>
            </button>
          )}

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="cartoon-btn !py-1 !px-2 text-xs bg-[#FFF9E5] hover:bg-[#FFD15C]"
              title="Learn how to sign & explore features"
            >
              <HelpCircle className="w-3.5 h-3.5 text-zinc-900 stroke-[2.2]" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          )}

          {/* AI Status Badge */}
          <div className={`cartoon-badge !py-0.5 !px-1.5 sm:!py-1 sm:!px-2.5 ${status.bg} ${status.text} shadow-none text-[10px] sm:text-[11px]`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
            <span className="hidden sm:inline">{status.label}</span>
            <span className="sm:hidden font-bold">AI</span>
            <span className="text-[9px] font-mono opacity-80 hidden md:inline">({workerLatencyMs}ms)</span>
          </div>

          {/* FPS Badge (Only shown in active camera sessions) */}
          {currentPage !== 'home' && (
            <div className="cartoon-badge bg-zinc-900 text-white font-mono shadow-none text-[10px] hidden sm:inline-flex">
              {fps} FPS
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;