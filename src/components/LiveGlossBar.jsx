import React from 'react';
import { Undo2, Trash2, Send, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';

/**
 * LiveGlossBar (Retro / 90s Nostalgia Edition - Proportional & Dense)
 *
 * Real-time sign composition tool:
 * - Compact height (105px total) with zero wasted space.
 * - Bold high-contrast navy token chips (.retro-token).
 * - Compact English translation preview in a classic Notepad panel (#FFFFCC).
 * - Segmented 1.2s auto-send countdown bar.
 * - Tactile 3D action controls.
 */
export function LiveGlossBar({
  glosses = [],
  previewText = '',
  motionState = { state: 'IDLE', pauseProgress: 0 },
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
    <div className="retro-window w-full shadow-md flex-shrink-0 flex flex-col overflow-hidden h-[105px]">
      {/* 1. Header & Controls Toolbar */}
      <div className="flex items-center justify-between px-2 py-0.5 bg-[#000080] text-[#FFFFFF] text-xs font-sans flex-shrink-0">
        <div className="flex items-center gap-1.5 font-bold">
          <MessageSquare className="w-3.5 h-3.5 stroke-[2px]" />
          <span>Live Sentence Composer</span>
          <span className="retro-inset px-1 py-0.2 bg-[#FFFFFF] text-[#000080] font-mono text-[10px] ml-1">
            {glosses.length} {glosses.length === 1 ? 'TOKEN' : 'TOKENS'}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!hasGlosses}
            className="retro-btn !py-0 !px-1.5 text-[10px]"
            title="Undo last sign (LING-02)"
          >
            <Undo2 className="w-3 h-3 stroke-[2px] text-[#000080]" />
            <span>Undo</span>
          </button>

          <button
            onClick={onClear}
            disabled={!hasGlosses}
            className="retro-btn !py-0 !px-1.5 text-[10px]"
            title="Clear all signs (LING-02)"
          >
            <Trash2 className="w-3 h-3 stroke-[2px] text-[#CC0000]" />
            <span>Clear</span>
          </button>

          <button
            onClick={onCommit}
            disabled={!hasGlosses}
            className="retro-btn retro-btn-success font-bold !py-0 !px-2 text-[10px]"
            title="Send sentence immediately"
          >
            <Send className="w-3 h-3 stroke-[2px]" />
            <span>SEND NOW</span>
          </button>
        </div>
      </div>

      {/* 2. Middle Row: Token Stream Box */}
      <div className="px-1.5 py-1 bg-[#C0C0C0] flex-1 min-h-0 flex flex-col justify-between gap-1 overflow-hidden">
        {/* Token Stream Container */}
        <div className="retro-inset bg-[#FFFFFF] px-1.5 py-0.5 h-7 flex items-center gap-1 overflow-x-auto flex-shrink-0">
          {hasGlosses ? (
            glosses.map((gloss, idx) => (
              <React.Fragment key={`${gloss}-${idx}`}>
                <div className="retro-token">
                  <span>{gloss}</span>
                </div>
                {idx < glosses.length - 1 && (
                  <span className="text-[#808080] font-mono font-bold text-xs select-none">
                    →
                  </span>
                )}
              </React.Fragment>
            ))
          ) : (
            <p className="text-[11px] text-[#808080] font-mono italic select-none">
              [ Perform gestures to compose. Rest hands 1.2s to auto-send. ]
            </p>
          )}
        </div>

        {/* 3. Bottom Row: Reconstructed English Translation & Pause Gauge */}
        <div className="retro-inset bg-[#FFFFCC] px-2 py-0.5 h-6 flex items-center justify-between text-xs font-sans flex-shrink-0 border border-[#808080]">
          <div className="flex items-center gap-1.5 overflow-hidden flex-1 mr-2">
            <span className="text-[10px] font-mono font-bold uppercase text-[#000080] whitespace-nowrap">
              ENGLISH:
            </span>
            <span className="font-bold text-[#000000] truncate text-xs">
              {previewText ? `"${previewText}"` : <span className="text-[#808080] font-normal italic">[ Awaiting signs ]</span>}
            </span>
          </div>

          {/* 1.2s Pause Countdown Telemetry Bar (Conditional) */}
          {(isPausing || isCommitted) && hasGlosses && (
            <div className="flex items-center gap-1.5 flex-shrink-0 font-mono text-[10px]">
              {isCommitted ? (
                <span className="text-[#00AA00] font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 stroke-[2px]" />
                  AUTO-SENT!
                </span>
              ) : (
                <div className="flex items-center gap-1 text-[#000080] font-bold">
                  <span>AUTO-SEND ({remainingSeconds}s)</span>
                  <div className="w-16 h-2 bg-[#808080] retro-inset p-0.2 flex">
                    <div
                      className="bg-[#000080] h-full"
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
