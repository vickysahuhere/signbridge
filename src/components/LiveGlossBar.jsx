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
      <div className="px-3.5 py-2 bg-[#F7F7F7] border-b-2 border-[#E5E5E5] flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#58CC02] flex items-center justify-center text-white">
            <MessageSquare className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
          <span className="font-black text-xs sm:text-sm text-[#3C3C3C]">
            Sentence Composer
          </span>
          <span className="duo-badge !py-0.5 !px-2 text-[10px] bg-white text-zinc-600">
            {glosses.length} {glosses.length === 1 ? 'sign' : 'signs'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={!hasGlosses}
            className="duo-btn !py-1 !px-2.5 text-xs text-zinc-700 hover:text-zinc-900 bg-white"
            title="Undo last sign"
          >
            <Undo2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={onClear}
            disabled={!hasGlosses}
            className="duo-btn !py-1 !px-2.5 text-xs text-zinc-700 hover:text-[#FF4B4B] bg-white"
            title="Clear all signs"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={onCommit}
            disabled={!hasGlosses}
            className="duo-btn duo-btn-green font-black !py-1 !px-3 text-xs"
            title="Send sentence immediately"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Send Now</span>
          </button>
        </div>
      </div>

      {/* 2. Optional Quick Candidate Suggestion Strip */}
      {candidates && candidates.length > 0 && (
        <div className="px-3 py-1.5 bg-[#FFF5D1] border-b border-[#E5A500]/30 flex items-center gap-2 text-xs overflow-x-auto flex-shrink-0 select-none">
          <span className="font-black text-[#78350F] flex items-center gap-1 whitespace-nowrap text-[10px] uppercase font-mono flex-shrink-0">
            <span>💡 Suggested:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {candidates.map((c) => (
              <button
                key={c.label}
                onClick={() => onSelectCandidate && onSelectCandidate(c.label, 'smart')}
                className="duo-badge !py-0.5 !px-2.5 text-[11px] bg-white hover:bg-[#58CC02] hover:text-white hover:border-[#46A302] transition-all flex items-center gap-1.5 cursor-pointer"
                title={`Confidence: ${Math.round(c.confidence * 100)}% - Tap to add`}
              >
                <span>{c.label}</span>
                <span className="text-[#58CC02] group-hover:text-white font-mono text-[10px] font-black">
                  {Math.round(c.confidence * 100)}%
                </span>
                <span className="font-black">+</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Middle: Token Chips Stream */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-2">
        <div className="min-h-[48px] p-2 rounded-2xl bg-[#F7F7F7] border-2 border-[#E5E5E5] flex items-center justify-between gap-2 overflow-hidden">
          {/* Scrollable list of tokens */}
          <div className="flex-1 min-w-0 flex items-center gap-2 overflow-x-auto py-0.5 scrollbar-thin">
            {hasGlosses ? (
              glosses.map((gloss, idx) => (
                <React.Fragment key={`${gloss}-${idx}`}>
                  <div className="duo-token animate-duo-pop group relative inline-flex items-center gap-1.5 pl-3 pr-2 py-1 select-none flex-shrink-0">
                    <span className="font-mono font-black tracking-wide text-xs">{gloss}</span>
                    {onRemoveAt && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAt(idx);
                        }}
                        className="w-4 h-4 rounded-full bg-[#46A302] hover:bg-[#FF4B4B] text-white flex items-center justify-center transition-colors cursor-pointer flex-shrink-0"
                        title={`Remove "${gloss}" (1-click)`}
                        aria-label={`Remove sign ${gloss}`}
                      >
                        <X className="w-2.5 h-2.5 stroke-[3]" />
                      </button>
                    )}
                  </div>
                  {idx < glosses.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300 flex-shrink-0 stroke-[3]" />
                  )}
                </React.Fragment>
              ))
            ) : (
              <p className="text-xs text-zinc-400 italic select-none flex items-center gap-1.5 px-1 font-bold">
                <span>Sign gestures in front of camera • Hands stationary for 1.2s auto-sends sentence</span>
              </p>
            )}
          </div>

          {/* Direct 1-Click Undo and Remove All Buttons right inside this bar */}
          {hasGlosses && (
            <div className="flex items-center gap-1.5 flex-shrink-0 pl-2 border-l-2 border-[#E5E5E5]">
              <button
                type="button"
                onClick={onUndo}
                className="duo-btn !py-1 !px-2 text-xs font-black bg-white hover:bg-zinc-100 text-zinc-800 flex items-center gap-1 flex-shrink-0"
                title="Undo last sign (1-click)"
              >
                <Undo2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={onClear}
                className="duo-btn !py-1 !px-2 text-xs font-black bg-white hover:bg-red-50 text-zinc-800 hover:text-[#FF4B4B] flex items-center gap-1 flex-shrink-0"
                title="Clear all signs (1-click)"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Bottom: English Translation Preview & Auto-send Meter */}
        <div className="p-2.5 rounded-2xl bg-[#EEFDE5] border-2 border-[#58CC02] border-b-[3px] border-b-[#46A302] flex items-center justify-between gap-2 text-xs flex-wrap">
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-[200px]">
            <div className="duo-badge bg-[#58CC02] text-white flex items-center gap-1 !py-0.5 border-[#46A302] flex-shrink-0">
              <Sparkles className="w-3 h-3 stroke-[2.5]" />
              <span className="text-[10px] uppercase font-mono font-black">English:</span>
            </div>
            <p className="font-black text-[#388402] text-xs sm:text-sm truncate">
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
            <div className="flex items-center gap-2 flex-shrink-0">
              {isCommitted ? (
                <span className="duo-badge bg-[#58CC02] text-white flex items-center gap-1 border-[#46A302] text-[11px]">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  <span>Auto-Sent!</span>
                </span>
              ) : (
                <div className="flex items-center gap-2 text-[11px] font-black text-[#388402]">
                  <span>Auto-send in {remainingSeconds}s</span>
                  <div className="w-20 h-2.5 bg-white rounded-full overflow-hidden border border-[#58CC02]/40">
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