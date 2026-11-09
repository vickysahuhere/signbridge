import React from 'react';
import { Undo2, Trash2, Send, Clock, MessageSquare, CheckCircle2, Sparkles, ArrowRight, X } from 'lucide-react';

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

  const pauseProgress = Math.max(0, Math.min(1, motionState.pauseProgress || 0));
  const remainingSeconds = Math.max(0, (1 - pauseProgress) * 1.2).toFixed(1);
  const percent = Math.round(pauseProgress * 100);

  return (
    <div className="cartoon-card w-full flex-shrink-0 flex flex-col overflow-hidden bg-white">
      {/* 1. Header Toolbar */}
      <div className="px-3.5 py-2 bg-[#FAF8F5] border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-zinc-900 flex items-center justify-center text-white">
            <MessageSquare className="w-3 h-3 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-xs sm:text-sm text-zinc-900">
            Sentence Composer
          </span>
          <span className="cartoon-badge !py-0 !px-1.5 text-[10px] bg-white text-zinc-700">
            {glosses.length} {glosses.length === 1 ? 'sign' : 'signs'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={onUndo}
            disabled={!hasGlosses}
            className="cartoon-btn !py-1 !px-2.5 text-xs text-zinc-700 hover:text-zinc-900 bg-white"
            title="Undo last sign"
          >
            <Undo2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">Undo</span>
          </button>

          <button
            onClick={onClear}
            disabled={!hasGlosses}
            className="cartoon-btn !py-1 !px-2.5 text-xs text-zinc-700 hover:text-[#EF4444] bg-white"
            title="Clear all signs"
          >
            <Trash2 className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={onCommit}
            disabled={!hasGlosses}
            className="cartoon-btn cartoon-btn-mint font-extrabold !py-1 !px-3 text-xs shadow-cartoon-sm"
            title="Send sentence immediately"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Send Now</span>
          </button>
        </div>
      </div>

      {/* 2. Optional Quick Candidate Suggestion Strip */}
      {candidates && candidates.length > 0 && (
        <div className="px-3 py-1.5 bg-[#FFF9E5] border-b border-amber-200 flex items-center gap-2 text-xs overflow-x-auto flex-shrink-0 select-none">
          <span className="font-bold text-amber-900 flex items-center gap-1 whitespace-nowrap text-[10px] uppercase font-mono flex-shrink-0">
            <span>💡 Suggested:</span>
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {candidates.map((c) => (
              <button
                key={c.label}
                onClick={() => onSelectCandidate && onSelectCandidate(c.label, 'smart')}
                className="cartoon-badge !py-0.5 !px-2 text-[11px] bg-white hover:bg-zinc-900 hover:text-white transition-all shadow-cartoon-sm flex items-center gap-1"
                title={`Confidence: ${Math.round(c.confidence * 100)}% - Tap to add`}
              >
                <span>{c.label}</span>
                <span className="text-[#16A34A] font-mono text-[10px]">
                  {Math.round(c.confidence * 100)}%
                </span>
                <span className="font-bold">+</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 3. Middle: Token Chips Stream */}
      <div className="p-2.5 sm:p-3 flex flex-col gap-2">
        <div className="min-h-[46px] p-1.5 sm:p-2 rounded-xl bg-[#FAF8F5] border-2 border-zinc-200 flex items-center justify-between gap-2 overflow-hidden">
          {/* Scrollable list of tokens */}
          <div className="flex-1 min-w-0 flex items-center gap-1.5 overflow-x-auto py-0.5 scrollbar-thin">
            {hasGlosses ? (
              glosses.map((gloss, idx) => (
                <React.Fragment key={`${gloss}-${idx}`}>
                  <div className="cartoon-token animate-in zoom-in-95 duration-100 group relative inline-flex items-center gap-1.5 pl-2.5 pr-1.5 py-1 select-none flex-shrink-0">
                    <span className="font-mono font-extrabold tracking-wide text-xs">{gloss}</span>
                    {onRemoveAt && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveAt(idx);
                        }}
                        className="w-4 h-4 rounded-full bg-zinc-700 hover:bg-[#EF4444] text-zinc-300 hover:text-white flex items-center justify-center transition-all cursor-pointer flex-shrink-0"
                        title={`Remove "${gloss}" (1-click)`}
                        aria-label={`Remove sign ${gloss}`}
                      >
                        <X className="w-2.5 h-2.5 stroke-[2.8]" />
                      </button>
                    )}
                  </div>
                  {idx < glosses.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0 stroke-[2.5]" />
                  )}
                </React.Fragment>
              ))
            ) : (
              <p className="text-xs text-zinc-400 italic select-none flex items-center gap-1.5 px-1 font-medium">
                <span>Sign gestures or spell letters in front of camera • Rest hands for 1.2s to auto-send</span>
              </p>
            )}
          </div>

          {/* Direct 1-Click Undo and Remove All Buttons right inside this bar */}
          {hasGlosses && (
            <div className="flex items-center gap-1.5 flex-shrink-0 pl-2 border-l-2 border-zinc-200">
              <button
                type="button"
                onClick={onUndo}
                className="cartoon-btn !py-1 !px-2.5 text-xs font-extrabold bg-white hover:bg-zinc-100 text-zinc-800 border-2 border-zinc-900 shadow-cartoon-sm flex items-center gap-1 flex-shrink-0"
                title="Undo last sign (1-click)"
              >
                <Undo2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Undo</span>
              </button>
              <button
                type="button"
                onClick={onClear}
                className="cartoon-btn !py-1 !px-2.5 text-xs font-extrabold bg-white hover:bg-red-50 text-zinc-800 hover:text-[#EF4444] border-2 border-zinc-900 shadow-cartoon-sm flex items-center gap-1 flex-shrink-0"
                title="Clear all signs (1-click)"
              >
                <Trash2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Clear</span>
              </button>
            </div>
          )}
        </div>

        {/* 4. Bottom: English Translation Preview & Auto-send Meter */}
        <div className="p-2.5 rounded-xl bg-[#FFF9E5] border-2 border-zinc-900 flex items-center justify-between gap-2 text-xs flex-wrap shadow-cartoon-sm">
          <div className="flex items-center gap-2 overflow-hidden flex-1 min-w-[200px]">
            <div className="cartoon-badge bg-[#FFD15C] text-zinc-900 flex items-center gap-1 !py-0.5 shadow-none flex-shrink-0">
              <Sparkles className="w-3 h-3 stroke-[2.5]" />
              <span className="text-[10px] uppercase font-mono font-extrabold">English:</span>
            </div>
            <p className="font-bold text-zinc-950 text-xs sm:text-sm truncate">
              {previewText ? (
                `"${previewText}"`
              ) : (
                <span className="text-zinc-400 font-normal italic">Awaiting signs...</span>
              )}
            </p>
          </div>

          {/* Pause Countdown Progress Meter */}
          {(isPausing || isCommitted) && hasGlosses && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {isCommitted ? (
                <span className="cartoon-badge bg-[#22C55E] text-white flex items-center gap-1 shadow-none text-[11px]">
                  <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                  <span>Auto-Sent!</span>
                </span>
              ) : (
                <div className="flex items-center gap-2 text-[11px] font-bold text-zinc-800">
                  <span>Auto-send in {remainingSeconds}s</span>
                  <div className="w-20 h-2 bg-amber-200 rounded-full overflow-hidden border border-amber-300">
                    <div
                      className="bg-[#22C55E] h-full rounded-full transition-all duration-100"
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