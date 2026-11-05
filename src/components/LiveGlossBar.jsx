import React from 'react';
import { Undo2, Trash2, Send, Clock, MessageSquare, CheckCircle2 } from 'lucide-react';

/**
 * LiveGlossBar (Retro / 90s Nostalgia Edition - Proportional & Compact)
 *
 * Real-time sign composition tool:
 * - Fitted height that seamlessly complements SignerStage.
 * - Displays recognized ISL gloss tokens in raised 3D chips.
 * - Reconstructed English translation preview in a classic Notepad panel (#FFFFCC).
 * - Segmented 1.2s pause countdown bar.
 * - Outset 3D action controls with tactile press states.
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
    <div className="retro-window w-full shadow-md flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* 1. Window Title Bar */}
      <div className="retro-window-titlebar flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 stroke-[2px]" />
          <span>Live Sentence Composer - [Linguistic Buffer]</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="retro-window-btn" aria-label="Minimize">_</button>
          <button className="retro-window-btn" aria-label="Maximize">□</button>
          <button className="retro-window-btn" aria-label="Close">×</button>
        </div>
      </div>

      {/* 2. Window Content Area */}
      <div className="p-2 bg-[#C0C0C0] flex-1 flex flex-col justify-between gap-1.5 min-h-0 overflow-hidden">
        {/* Top Header Controls Toolbar */}
        <div className="flex items-center justify-between gap-1 pb-1 border-b border-[#808080] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="font-heading text-[11px] font-bold uppercase text-[#000000]">
              Signs:
            </span>
            <div className="retro-inset px-1.5 py-0.2 bg-[#FFFFFF] font-mono text-[11px] font-bold text-[#000080]">
              {glosses.length} {glosses.length === 1 ? 'TOKEN' : 'TOKENS'}
            </div>
          </div>

          {/* Manual Editing Action Buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={onUndo}
              disabled={!hasGlosses}
              className="retro-btn text-xs !py-0.5 !px-1.5"
              title="Undo last sign (LING-02)"
            >
              <Undo2 className="w-3 h-3 stroke-[2px] text-[#000080]" />
              <span>[ Undo ]</span>
            </button>

            <button
              onClick={onClear}
              disabled={!hasGlosses}
              className="retro-btn text-xs !py-0.5 !px-1.5"
              title="Clear all signs (LING-02)"
            >
              <Trash2 className="w-3 h-3 stroke-[2px] text-[#CC0000]" />
              <span>[ Clear ]</span>
            </button>

            <button
              onClick={onCommit}
              disabled={!hasGlosses}
              className="retro-btn retro-btn-success text-xs font-bold !py-0.5 !px-2"
              title="Transmit sentence immediately"
            >
              <Send className="w-3 h-3 stroke-[2px]" />
              <span>[ SEND NOW ]</span>
            </button>
          </div>
        </div>

        {/* Gloss Tokens Horizontal Stream */}
        <div className="retro-inset bg-[#FFFFFF] p-1.5 flex-1 min-h-[38px] max-h-[55px] flex items-center gap-1 overflow-x-auto">
          {hasGlosses ? (
            glosses.map((gloss, idx) => (
              <React.Fragment key={`${gloss}-${idx}`}>
                <div className="retro-outset bg-[#000080] text-[#FFFFFF] px-1.5 py-0.5 font-mono font-bold text-[11px] flex items-center shadow-sm whitespace-nowrap">
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
              [ Perform gestures to compose. Rest hands 1.2s to auto-transmit. ]
            </p>
          )}
        </div>

        {/* 1.2s Pause Countdown Telemetry Bar (Conditional) */}
        {(isPausing || isCommitted) && hasGlosses && (
          <div className="retro-inset bg-[#FFFFCC] p-1 flex items-center justify-between text-[11px] font-mono flex-shrink-0">
            {isCommitted ? (
              <div className="flex items-center gap-1 text-[#00AA00] font-bold">
                <CheckCircle2 className="w-3 h-3 stroke-[2px]" />
                <span>1.2s PAUSE DETECTED: AUTO-TRANSMITTED!</span>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full gap-2">
                <div className="flex items-center gap-1 text-[#000080] font-bold">
                  <Clock className="w-3 h-3 stroke-[2px]" />
                  <span>RESTING: AUTO-SEND IN {remainingSeconds}s</span>
                </div>
                <div className="w-28 h-2 bg-[#808080] retro-inset p-0.2 flex">
                  <div
                    className="bg-[#000080] h-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {/* English Translation Preview Area (Windows Notepad Style) */}
        <div className="retro-inset bg-[#FFFFCC] p-1.5 border border-[#808080] flex-shrink-0">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-mono font-bold uppercase text-[#000080] whitespace-nowrap">
              TRANSLATION:
            </span>
            <span className="text-xs font-bold text-[#000000] font-sans truncate">
              {previewText ? `"${previewText}"` : <span className="text-[#808080] font-normal italic">[ Awaiting input ]</span>}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LiveGlossBar;
