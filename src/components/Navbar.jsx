import React, { useState, useRef, useEffect } from 'react';
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
  HelpCircle,
  Hand,
  Info,
  Bug,
  MoreVertical,
  GraduationCap,
  ClipboardCheck,
  PhoneOff
} from 'lucide-react';
import { formatCallCode } from '../call/callCode.js';
import { OtterLogoIcon } from './OtterLogo.jsx';

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
  callCode = '',
  inCall = false,
  onLeaveCall,
  rttMs = null,
  onCopyLink
}) {
  const roomId = callCode ? formatCallCode(callCode) : '';
  const onSwitchRoom = null;
  const [copied, setCopied] = useState(false);
  const [isEditingRoom, setIsEditingRoom] = useState(false);
  const [roomInputValue, setRoomInputValue] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

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
            title="Sanket ISL Home (Mitra the Otter)"
          >
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-xl bg-[#FFF8EB] border-2 border-amber-200 border-b-[3px] flex items-center justify-center flex-shrink-0 overflow-hidden shadow-xs hover:border-amber-300">
              <OtterLogoIcon className="w-6 h-6 sm:w-8 sm:h-8" />
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

          {/* Primary Page Navigation: Desktop Pill Bar (Hidden on phone, handled by bottom dock) */}
          <div className="hidden md:flex items-center bg-[#F7F7F7] p-0.5 sm:p-1 rounded-xl sm:rounded-2xl border-2 border-[#E5E5E5] flex-shrink-0">
            <button
              onClick={() => onPageChange && onPageChange('home')}
              className={`px-2 lg:px-3 py-1 rounded-lg sm:rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 ${
                currentPage === 'home'
                  ? 'bg-white text-[#3C3C3C] border-2 border-[#E5E5E5] border-b-[3px] border-b-[#CECECE]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Home Screen"
            >
              <Home className="w-3.5 h-3.5 stroke-[2.5] flex-shrink-0" />
              <span>Home</span>
            </button>
            <button
              onClick={() => onPageChange && onPageChange('learn')}
              className={`px-2 lg:px-3 py-1 rounded-lg sm:rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 ${
                currentPage === 'learn'
                  ? 'bg-[#58CC02] text-white border-2 border-[#58CC02] border-b-[3px] border-b-[#46A302]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Practice & Learn ISL with Biometric Guides"
            >
              <BookOpen className="w-3.5 h-3.5 stroke-[2.5] flex-shrink-0" />
              <span className="hidden xl:inline">Learn ISL</span>
              <span className="xl:hidden">Learn</span>
            </button>
            <button
              onClick={() => onPageChange && onPageChange('chat')}
              className={`px-2 lg:px-3 py-1 rounded-lg sm:rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 ${
                currentPage === 'chat'
                  ? 'bg-[#1CB0F6] text-white border-2 border-[#1CB0F6] border-b-[3px] border-b-[#1899D6]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Real-Time Dual-Camera Video Call & Live ISL Auto-Translator"
            >
              <Video className="w-3.5 h-3.5 stroke-[2.5] flex-shrink-0" />
              <span className="hidden xl:inline">Sign Call</span>
              <span className="xl:hidden">Call</span>
            </button>
            <button
              onClick={() => onPageChange && onPageChange('teach')}
              className={`px-2 lg:px-3 py-1 rounded-lg sm:rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 ${
                currentPage === 'teach'
                  ? 'bg-[#CE82FF] text-white border-2 border-[#CE82FF] border-b-[3px] border-b-[#A559D9]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Teach Sanket your own signs"
            >
              <GraduationCap className="w-3.5 h-3.5 stroke-[2.5] flex-shrink-0" />
              <span>Teach</span>
            </button>
            <button
              onClick={() => onPageChange && onPageChange('test')}
              className={`px-2 lg:px-3 py-1 rounded-lg sm:rounded-xl text-xs font-black transition-all flex items-center gap-1.5 flex-shrink-0 ${
                currentPage === 'test'
                  ? 'bg-[#FFC800] text-[#78350F] border-2 border-[#FFC800] border-b-[3px] border-b-[#E5A500]'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
              title="Test how well Sanket recognises your signs"
            >
              <ClipboardCheck className="w-3.5 h-3.5 stroke-[2.5] flex-shrink-0" />
              <span>Testing</span>
            </button>
          </div>

          {/* Mobile Current Mode Indicator Badge (< md) */}
          <div className="flex md:hidden items-center gap-1">
            {currentPage === 'chat' && (
              <div className="flex items-center gap-1">
                <span className="duo-badge !py-0.5 !px-2 text-[10px] bg-[#DDF4FE] text-[#0284C7] border-[#1CB0F6]/40 font-black">
                  📹 {roomId ? `Call ${roomId}` : 'Sign Call'}
                </span>
              </div>
            )}
            {currentPage === 'teach' && (
              <span className="duo-badge !py-0.5 !px-2 text-[10px] bg-[#F7ECFF] text-[#A559D9] border-[#CE82FF]/40 font-black">
                🎓 Teach
              </span>
            )}
            {currentPage === 'test' && (
              <span className="duo-badge !py-0.5 !px-2 text-[10px] bg-[#FFF5D1] text-[#78350F] border-[#FFC800]/60 font-black">
                🧪 Testing
              </span>
            )}
          </div>

          {/* Mode Switcher Pills: Words vs A-Z Letters (only in active Chat/Call page on wide screens) */}
          {(currentPage === 'chat' && inCall) && (
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
                  Code <span className="text-[#3C3C3C]">{roomId}</span>
                </span>
                <button
                  onClick={handleCopy}
                  className={`duo-btn !py-0.5 !px-2 text-[10px] font-bold ${
                    copied ? 'duo-btn-green' : 'bg-white hover:bg-zinc-50'
                  }`}
                  title="Copy the call link"
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
                {onLeaveCall && (
                  <button
                    onClick={onLeaveCall}
                    className="duo-btn !py-0.5 !px-2 text-[10px] font-bold bg-[#FFDFDF] hover:bg-[#FF4B4B] hover:text-white text-[#EA2B2B]"
                    title="Leave this call"
                  >
                    <PhoneOff className="w-2.5 h-2.5 stroke-[2.5]" />
                    <span>Leave</span>
                  </button>
                )}
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

        {/* Right: Feedback & Overflow Menu (Guide, Dictionary) */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
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

          {/* Three dots overflow menu for Guide and Dictionary */}
          {(onOpenDictionary || onOpenGuide) && (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className={`duo-btn !py-1 !px-1.5 sm:!px-2 text-xs flex items-center justify-center flex-shrink-0 transition-all ${
                  isMenuOpen
                    ? 'bg-zinc-200 border-zinc-400 text-zinc-900'
                    : 'bg-white hover:bg-zinc-50 text-zinc-700'
                }`}
                title="More options (Guide, Dictionary)"
                aria-label="More options"
                aria-expanded={isMenuOpen}
              >
                <MoreVertical className="w-3.5 h-3.5 stroke-[2.4]" />
              </button>

              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-44 bg-white border-2 border-zinc-900 rounded-xl shadow-cartoon-md p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 flex flex-col gap-1">
                  {onOpenGuide && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenGuide();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 font-bold text-xs text-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <HelpCircle className="w-4 h-4 text-[#78350F] stroke-[2.2] flex-shrink-0" />
                      <span>Guide</span>
                    </button>
                  )}
                  {onOpenDictionary && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsMenuOpen(false);
                        onOpenDictionary();
                      }}
                      className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-zinc-100 font-bold text-xs text-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <BookOpen className="w-4 h-4 text-[#3C3C3C] stroke-[2.2] flex-shrink-0" />
                      <span>Dictionary</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Navbar;