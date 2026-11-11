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
  Info,
  Bug
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
  onOpenFeedback,
  onOpenChatbot,
  roomId = '',
  onSwitchRoom = null,
  connectionMode = 'p2p',
  rttMs = 18,
  userName = 'User',
  onCopyLink
}) {
  const [copied, setCopied] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomInputValue, setRoomInputValue] = useState('');

  const handleCopy = () => {
    if (onCopyLink) {
      onCopyLink();
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="w-full px-2 py-1.5 sm:px-4 sm:py-2.5 flex-shrink-0">
      <div className="duo-card px-1.5 py-1 sm:px-3 sm:py-1.5 flex items-center justify-between gap-1 sm:gap-2 lg:gap-3 bg-white w-full min-w-0">
        {/* Left: Brand & Main Mode Selector */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-0">
          {/* Logo Mark - Click to navigate Home */}
          <button
            type="button"
            onClick={() => onPageChange && onPageChange('home')}
            className="flex items-center gap-1 sm:gap-2 text-left cursor-pointer hover:opacity-95 transition-transform active:scale-95 flex-shrink-0"
            title="Go to Home"
          >
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-[#58CC02] border-2 border-[#46A302] border-b-[3px] sm:border-b-4 flex items-center justify-center flex-shrink-0">
              <Hand className="w-3 h-3 sm:w-4 sm:h-4 text-white stroke-[2.5]" />
            </div>
            <div className="flex items-center gap-1 sm:gap-1.5 leading-none">
              <span className="font-extrabold text-xs sm:text-base tracking-tight text-[#3C3C3C] hidden min-[340px]:inline">
                Sanket
              </span>
              <span className="duo-badge !py-0 !px-1.5 text-[8px] sm:text-[9px] bg-[#58CC02] text-white border-[#46A302] hidden sm:inline-block">
                ISL
              </span>
            </div>
          </button>

          <div className="h-4 sm:h-5 w-[1.5px] sm:w-[2px] bg-zinc-200 hidden min-[360px]:block flex-shrink-0" />

          {/* Primary Page Navigation: Home vs Learn ISL vs Live Chat */}
          <div className="flex items-center bg-[#F7F7F7] p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border-2 border-[#E5E5E5] flex-shrink-0">
            <button
              onClick={() => onPageChange && onPageChange('home')}
              className={`px-1.5 min-[400px]:px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ${
                currentPage === 'home'
                  ? 'bg-white text-[#3C3C3C] border-2 border-[#E5E5E5] border-b-[3px] border-b-[#CECECE]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Home Screen"
            >
              <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] flex-shrink-0" />
              <span className="hidden min-[400px]:inline">Home</span>
            </button>
            <button
              onClick={() => onPageChange && onPageChange('learn')}
              className={`px-1.5 min-[400px]:px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ${
                currentPage === 'learn'
                  ? 'bg-[#58CC02] text-white border-2 border-[#58CC02] border-b-[3px] border-b-[#46A302]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Practice & Learn ISL with Biometric Guides"
            >
              <BookOpen className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] flex-shrink-0" />
              <span className="hidden xl:inline">Learn ISL</span>
              <span className="hidden min-[400px]:inline xl:hidden">Learn</span>
            </button>
            <button
              onClick={() => onPageChange && onPageChange('chat')}
              className={`px-1.5 min-[400px]:px-2 sm:px-2.5 lg:px-3 py-0.5 sm:py-1 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-black transition-all flex items-center gap-1 sm:gap-1.5 flex-shrink-0 ${
                currentPage === 'chat'
                  ? 'bg-[#1CB0F6] text-white border-2 border-[#1CB0F6] border-b-[3px] border-b-[#1899D6]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Real-Time Dual-Camera Video Call & Live ISL Auto-Translator"
            >
              <Video className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5] flex-shrink-0" />
              <span className="hidden xl:inline">Sign Call</span>
              <span className="hidden min-[400px]:inline xl:hidden">Call</span>
            </button>
          </div>

          {/* Mode Switcher Pills: Words vs A-Z Letters (only in active Learn or Chat pages on wide screens) */}
          {currentPage !== 'home' && (
            <>
              <div className="h-5 w-[2px] bg-zinc-200 hidden xl:block flex-shrink-0" />
              <div className="hidden xl:flex items-center bg-[#F7F7F7] p-0.5 sm:p-1 rounded-2xl border-2 border-[#E5E5E5] flex-shrink-0">
                <button
                  onClick={() => onToggleMode && onToggleMode('word')}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 flex-shrink-0 ${
                    recognitionMode === 'word'
                      ? 'bg-[#FFC800] text-[#78350F] border-2 border-[#FFC800] border-b-[3px] border-b-[#E5A500]'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                  title="Daily Vocabulary Signs"
                >
                  <span>Words</span>
                </button>
                <button
                  onClick={() => onToggleMode && onToggleMode('alphabet')}
                  className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1 flex-shrink-0 ${
                    recognitionMode === 'alphabet'
                      ? 'bg-[#1CB0F6] text-white border-2 border-[#1CB0F6] border-b-[3px] border-b-[#1899D6]'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                  title="Two-Handed Fingerspelling A-Z"
                >
                  <span>A–Z</span>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Center: Share Room Link / Switch Code (Visible in Chat Mode on desktop) */}
        {currentPage === 'chat' && roomId && (
          <div className="hidden xl:flex items-center gap-1.5 bg-[#F7F7F7] border-2 border-[#E5E5E5] rounded-xl px-2 py-1 flex-shrink-0">
            {!isEditingRoom ? (
              <>
                <span className="text-[11px] font-mono font-bold text-zinc-500 truncate">
                  Room <span className="text-[#3C3C3C]">#{roomId}</span>
                </span>
                <button
                  onClick={handleCopy}
                  className={`duo-btn !py-0.5 !px-2 text-[10px] font-bold ${
                    copied ? 'duo-btn-green' : 'bg-white hover:bg-zinc-50'
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
                {onSwitchRoom && (
                  <button
                    onClick={() => {
                      setRoomInputValue(roomId);
                      setIsEditingRoom(true);
                    }}
                    className="duo-btn !py-0.5 !px-1.5 text-[10px] font-bold bg-zinc-100 hover:bg-zinc-200 text-zinc-700"
                    title="Switch to another room code"
                  >
                    Switch
                  </button>
                )}
              </>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (roomInputValue.trim() && onSwitchRoom) {
                    onSwitchRoom(roomInputValue.trim());
                    setIsEditingRoom(false);
                  }
                }}
                className="flex items-center gap-1"
              >
                <input
                  type="text"
                  value={roomInputValue}
                  onChange={(e) => setRoomInputValue(e.target.value)}
                  placeholder="Code..."
                  className="px-1.5 py-0.5 text-[11px] font-mono font-bold bg-white border border-zinc-300 rounded w-24 focus:outline-none"
                  autoFocus
                />
                <button
                  type="submit"
                  className="duo-btn duo-btn-blue !py-0.5 !px-1.5 text-[10px] font-bold"
                >
                  Go
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingRoom(false)}
                  className="text-[10px] text-zinc-400 hover:text-zinc-700 font-bold px-1"
                >
                  ✕
                </button>
              </form>
            )}
          </div>
        )}

        {/* Right: Modals & Telemetry status - Responsively sized */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {onOpenChatbot && (
            <button
              onClick={onOpenChatbot}
              className="duo-btn bg-[#FFF9E5] hover:bg-[#FFD15C] !py-1 !px-1.5 sm:!px-2.5 text-xs text-zinc-900 border-2 border-zinc-900 flex items-center gap-1 shadow-cartoon-sm transition-all flex-shrink-0"
              title="Open Sanket AI Chatbot (BYOK)"
              aria-label="Ask AI Chatbot"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
              <span className="hidden lg:inline font-bold">Ask AI</span>
            </button>
          )}

          {onOpenDictionary && (
            <button
              onClick={onOpenDictionary}
              className="duo-btn !py-1 !px-1.5 sm:!px-2.5 text-xs bg-white hover:bg-zinc-50 flex items-center gap-1 flex-shrink-0"
              title="Open ISL Visual Sign Dictionary"
              aria-label="Open Sign Dictionary"
            >
              <BookOpen className="w-3.5 h-3.5 text-[#3C3C3C] stroke-[2.2] flex-shrink-0" />
              <span className="hidden 2xl:inline">Dictionary</span>
            </button>
          )}

          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="duo-btn duo-btn-gold !py-1 !px-1.5 sm:!px-2.5 text-xs flex items-center gap-1 flex-shrink-0"
              title="Learn how to sign & explore features"
              aria-label="Application Guide"
            >
              <HelpCircle className="w-3.5 h-3.5 text-[#78350F] stroke-[2.2] flex-shrink-0" />
              <span className="hidden xl:inline">Guide</span>
            </button>
          )}

          {onOpenFeedback && (
            <button
              onClick={onOpenFeedback}
              className="duo-btn !py-1 !px-1.5 sm:!px-2.5 text-xs bg-[#FFDFDF] hover:bg-[#FF4B4B] hover:text-white text-[#EA2B2B] border-[#FF4B4B]/30 flex items-center gap-1 flex-shrink-0"
              title="Report an issue with automatic window screenshot"
              aria-label="Report Issue"
            >
              <Bug className="w-3.5 h-3.5 stroke-[2.2] flex-shrink-0" />
              <span className="hidden 2xl:inline">Feedback</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;