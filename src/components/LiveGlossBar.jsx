import React from 'react';
import { Undo2, Trash2, Send, Clock, Sparkles, CheckCircle2 } from 'lucide-react';

/**
 * LiveGlossBar
 *
 * Real-time sign composition bar (LING-02, LING-05):
 * - Displays recognized ISL gloss token pills.
 * - Shows live English translation preview reconstructed in real time.
 * - Renders an animated SVG circular 1.2s countdown ring representing pause before auto-send.
 * - Provides manual [Undo Last Sign], [Clear All], and [Send Now] controls.
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

  // SVG Circular countdown calculations (Radius = 18, Circumference = 2 * PI * 18 ≈ 113.1)
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const pauseProgress = Math.max(0, Math.min(1, motionState.pauseProgress || 0));
  const strokeDashoffset = circumference * (1 - pauseProgress);
  const remainingSeconds = Math.max(0, (1 - pauseProgress) * 1.2).toFixed(1);

  return (
    <div className="w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl p-4 lg:p-5 shadow-2xl backdrop-blur-md transition-all">
      {/* Top Header: Title, Token Count & Action Controls */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="font-bold text-sm text-slate-100 tracking-tight">
            Live Sign Composition
          </h3>
          <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-900/80 border border-slate-700 text-slate-300 font-mono">
            {glosses.length} {glosses.length === 1 ? 'sign' : 'signs'}
          </span>
        </div>

        {/* Manual Editing Controls (LING-02) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onUndo}
            disabled={!hasGlosses}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-slate-700/60 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-300 transition shadow-sm"
            title="Undo last sign (LING-02)"
          >
            <Undo2 className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Undo Sign</span>
          </button>

          <button
            onClick={onClear}
            disabled={!hasGlosses}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-900/60 hover:bg-rose-500/20 hover:border-rose-500/40 hover:text-rose-300 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-medium text-slate-300 transition shadow-sm"
            title="Clear all signs (LING-02)"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">Clear</span>
          </button>

          <button
            onClick={onCommit}
            disabled={!hasGlosses}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs transition shadow-md shadow-emerald-500/20"
            title="Send sentence immediately"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Send Now</span>
          </button>
        </div>
      </div>

      {/* Middle Row: Token Pills Stream & 1.2s Circular Pause Progress */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 min-h-[52px]">
        {/* Token Pills Flex Stream */}
        <div className="flex-1 flex flex-wrap items-center gap-2 overflow-x-auto py-1">
          {hasGlosses ? (
            glosses.map((gloss, idx) => (
              <React.Fragment key={`${gloss}-${idx}`}>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs shadow-sm shadow-emerald-500/10 animate-in fade-in zoom-in-95 duration-100">
                  <span>{gloss}</span>
                </div>
                {idx < glosses.length - 1 && (
                  <span className="text-slate-500 font-mono text-xs select-none">→</span>
                )}
              </React.Fragment>
            ))
          ) : (
            <p className="text-xs text-slate-500 italic flex items-center gap-1.5 select-none">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              Sign in front of camera to compose a sentence. Rest hands for 1.2s to auto-send.
            </p>
          )}
        </div>

        {/* 1.2s Pause Countdown Circular Ring (LING-05) */}
        {(isPausing || isCommitted) && hasGlosses && (
          <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/80 shadow-inner flex-shrink-0 animate-in fade-in duration-150">
            {isCommitted ? (
              <div className="flex items-center gap-1.5 text-xs text-sky-300 font-semibold font-mono">
                <CheckCircle2 className="w-4 h-4 text-sky-400" />
                <span>Auto-Committed!</span>
              </div>
            ) : (
              <>
                {/* Radial SVG Ring */}
                <div className="relative w-9 h-9 flex items-center justify-center">
                  <svg className="w-9 h-9 -rotate-90 transform" viewBox="0 0 44 44">
                    {/* Background track */}
                    <circle
                      cx="22"
                      cy="22"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="3.5"
                      fill="transparent"
                      className="text-slate-700"
                    />
                    {/* Active countdown fill */}
                    <circle
                      cx="22"
                      cy="22"
                      r={radius}
                      stroke="currentColor"
                      strokeWidth="3.5"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="text-amber-400 transition-all duration-75"
                    />
                  </svg>
                  <span className="absolute font-mono text-[10px] font-bold text-amber-300">
                    {remainingSeconds}s
                  </span>
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[11px] font-bold text-amber-300">Pausing</span>
                  <span className="text-[10px] text-slate-400 font-mono">Auto-send in 1.2s</span>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom English Translation Preview */}
      {previewText && (
        <div className="mt-3.5 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-sm bg-slate-900/60 rounded-xl px-3.5 py-2 border border-slate-700/40">
          <span className="text-xs font-mono font-semibold text-sky-400 uppercase tracking-wider select-none">
            English Preview:
          </span>
          <span className="text-slate-100 font-medium tracking-wide">
            "{previewText}"
          </span>
        </div>
      )}
    </div>
  );
}

export default LiveGlossBar;
