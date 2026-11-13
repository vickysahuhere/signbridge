import React, { useState } from 'react';
import { Undo2, Trash2, Send, Volume2, MessageSquare, CheckCircle2, Sparkles, ArrowRight, X } from 'lucide-react';

export function LiveGlossBar({
  glosses = [],
  previewText = '',
  motionState = { state: 'IDLE', pauseProgress: 0 },
  candidates = [],
  onSelectCandidate = null,
  onRemoveAt = null,
  onUndo,
  onClear,
  onCommit
}) {
  const hasGlosses = glosses && glosses.length > 0;
  const isPausing = motionState.state === 'PAUSE_COUNTDOWN';
  const isCommitted = motionState.state === 'IDLE_COMMIT';
  const [isSpeaking, setIsSpeaking] = useState(false);

  const pauseProgress = Math.max(0, Math.min(1, motionState.pauseProgress || 0));
  const remainingSeconds = Math.max(0, (1 - pauseProgress) * 1.2).toFixed(1);
  const percent = Math.round(pauseProgress * 100);

  const handleSpeak = (e) => {
    e.stopPropagation();
    if (!previewText || typeof window === 'undefined' || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(previewText);
    utterance.rate = 0.95;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="duo-card w-full flex-shrink-0 flex flex-col overflow-hidden bg-white">
      {/* 1. Header Toolbar */}
      <div className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-[#EAF6E8] border-b-2 border-[#D6EBD3] flex items-center justify-between gap-1.5 flex-shrink-0">
        <div className="flex items-center gap-1.5 min-w-0">
          <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-lg bg-[#58CC02] flex items-center justify-center text-white flex-shrink-0">
            <MessageSquare className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-black text-xs sm:text-base text-[#2C3E28] truncate">
            <span className="sm:hidden">Buffer</span>
            <span className="hidden sm:inline">Sign Buffer &amp; Auto-Converter</span>
          </span>
          <span className="duo-badge !py-0.2 !px-1.5 text-[10px] sm:text-xs bg-white text-zinc-700 font-black flex-shrink-0">
            {glosses.length}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          <button
            onClick={onUndo}
            disabled={!hasGlosses}
            className="duo-btn !py-1 !px-2 sm:!px-2.5 text-xs sm:text-sm font-black text-zinc-700 hover:text-zinc-900 bg-white flex-shrink-0"
            title="Undo last sign"
          >
            <Undo2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={onClear}
            disabled={!hasGlosses}
            className="duo-btn !py-1 !px-2 sm:!px-2.5 text-xs sm:text-sm font-black text-zinc-700 hover:text-[#FF4B4B] bg-white flex-shrink-0"
            title="Clear all signs"
          >
            <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={onCommit}
            disabled={!hasGlosses}
            className="duo-btn duo-btn-green font-black !py-1 !px-2 sm:!py-1.5 sm:!px-3 text-xs sm:text-sm flex-shrink-0"
            title="Instant commit now (or simply rest hands to auto-commit)"
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Commit Now</span>
            <span className="sm:hidden">Send</span>
          </button>
        </div>
      </div>

      {/* 2. Optional Quick Candidate Suggestion Strip */}
      {candidates && candidates.length > 0 && (
        <div className="px-2.5 py-1.5 sm:px-3.5 sm:py-2 bg-[#FFF5D1] border-b border-[#E5A500]/30 flex items-center gap-1.5 text-xs overflow-x-auto flex-shrink-0 select-none">
          <span className="font-black text-[#78350F] flex items-center gap-1 whitespace-nowrap text-[10px] sm:text-xs uppercase font-mono flex-shrink-0">
            <Sparkles className="w-3 h-3 text-amber-600 fill-amber-600" />
            <span>Suggested:</span>
          </span>
          <div className="flex items-center gap-1 overflow-x-auto">
            {candidates.map((c) => (
              <button
                key={c.label}
                onClick={() => onSelectCandidate && onSelectCandidate(c.label, 'smart')}
                className="duo-badge !py-0.5 !px-2 text-[10px] sm:text-xs font-black bg-white hover:bg-[#58CC02] hover:text-white hover:border-[#46A302] transition-all flex items-center gap-1 cursor-pointer flex-shrink-0"
                title={`Confidence: ${Math.round(c.confidence * 100)}% - Tap to add`}
              >
                <span>{c.label}</span>
                <span className="text-[#58CC02] group-hover:text-white font-mono text-[9px] font-black">
                  {Math.round(c.confidence * 100)}%
                </span>
                <span className="font-black">+</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Middle: Token Chips Stream */}
      <div className="p-1.5 sm:p-2.5 flex flex-col gap-1.5">
        <div className="min-h-[44px] sm:min-h-[50px] p-1.5 rounded-xl bg-[#F3FAF2] border-2 border-[#D6EBD3] flex items-center justify-between gap-1.5 overflow-hidden">
          {/* Scrollable list of tokens */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
            {hasGlosses ? (
              glosses.map((gloss, idx) => (
                <React.Fragment key={`${gloss}-${idx}`}>
                  <div className="duo-token animate-duo-pop group relative inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 select-none flex-shrink-0">
                    <span className="font-mono font-black tracking-wide text-xs sm:text-sm">{gloss}</span>
                    {onRemoveAt && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAt(idx);
                        }}
                        className="w-4 h-4 rounded-full bg-[#46A302] hover:bg-[#FF4B4B] text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ml-0.5"
                        title={`Remove "${gloss}" (1-click)`}
                        aria-label={`Remove sign ${gloss}`}
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                    )}
                  </div>
                  {idx < glosses.length - 1 && (
                    <ArrowRight className="w-3 h-3 text-zinc-300 flex-shrink-0 stroke-[3]" />
                  )}
                </React.Fragment>
              ))
            ) : (
              <p className="text-[11px] sm:text-xs text-zinc-400 italic select-none flex items-center gap-1 px-1 font-bold">
                <span>Sign in front of camera • Stationary 1.2s auto-converts</span>
              </p>
            )}
          </div>
        </div>

        {/* 4. Bottom: English Translation Preview & Auto-send Meter */}
        <div className="p-2 sm:p-2.5 rounded-xl bg-[#EEFDE5] border-2 border-[#58CC02] border-b-[3px] border-b-[#46A302] flex items-center justify-between gap-1.5 text-xs sm:text-sm flex-wrap">
          <div className="flex items-center gap-1.5 overflow-hidden flex-1 min-w-[160px]">
            <div className="duo-badge bg-[#58CC02] text-white flex items-center gap-1 !py-0.2 !px-1.5 border-[#46A302] flex-shrink-0 text-[10px]">
              <Sparkles className="w-2.5 h-2.5 stroke-[2.5]" />
              <span className="uppercase font-mono font-black">EN:</span>
            </div>
            <p className="font-black text-[#2F7202] text-xs sm:text-sm truncate">
              {previewText ? (
                `"${previewText}"`
              ) : (
                <span className="text-zinc-400 font-bold italic">Awaiting signs...</span>
              )}
            </p>
            {previewText && (
              <button
                type="button"
                onClick={handleSpeak}
                className={`duo-btn duo-btn-blue !py-0.5 !px-2 text-[10px] font-black flex items-center gap-1 ${
                  isSpeaking ? 'animate-pulse' : ''
                }`}
                title="Speak sentence aloud"
              >
                <Volume2 className="w-3 h-3 stroke-[2.5]" />
                <span>Speak</span>
              </button>
            )}
          </div>

          {/* Pause Countdown Progress Meter */}
          {(isPausing || isCommitted) && hasGlosses && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {isCommitted ? (
                <span className="duo-badge bg-[#58CC02] text-white flex items-center gap-1 border-[#46A302] text-[10px] font-black">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  <span>Converted!</span>
                </span>
              ) : (
                <div className="flex items-center gap-1.5 text-[10px] font-black text-[#2F7202]">
                  <span>{remainingSeconds}s</span>
                  <div className="w-14 h-2 bg-white rounded-full overflow-hidden border border-[#58CC02]/40">
                    <div
                      className="bg-[#58CC02] h-full rounded-full transition-all duration-100"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LiveGlossBar;