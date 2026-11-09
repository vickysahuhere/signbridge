import React from 'react';
import {
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Activity,
  ArrowRight,
  Flame,
  Award,
  Zap,
  Clock,
  RotateCcw
} from 'lucide-react';

export function LearnGuessPanel({
  selectedItem,
  wordPredictions = { topCandidates: [], confirmedWord: null },
  alphabetPredictions = [],
  recognitionMode = 'word',
  onToggleMode,
  motionState = { state: 'IDLE', pauseProgress: 0, rollingVelocity: 0 },
  onNextSign,
  masteredCount = 0,
  isMatched = false
}) {
  // Determine top candidates based on mode
  const candidates = recognitionMode === 'word'
    ? (wordPredictions?.topCandidates || [])
    : (alphabetPredictions || []);

  const topCandidate = candidates[0] || null;
  const targetLabel = selectedItem?.label?.toUpperCase() || '';

  // Does the current top guess match the target word?
  const guessMatchesTarget = topCandidate &&
    topCandidate.label?.toUpperCase() === targetLabel &&
    topCandidate.confidence >= 0.75;

  const activeGuess = topCandidate?.label || 'Ready / Watching';
  const activeConfidence = topCandidate ? Math.round(topCandidate.confidence * 100) : 0;

  return (
    <div className="cartoon-card bg-white p-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-2 border-zinc-900 shadow-cartoon-sm flex-shrink-0">
      {/* 1. Left Section: Primary Live AI Guess */}
      <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
        {/* Animated AI Brain Icon */}
        <div className={`w-11 h-11 rounded-2xl border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-cartoon-sm transition-all ${
          guessMatchesTarget || isMatched
            ? 'bg-[#22C55E] text-white scale-105'
            : topCandidate
            ? 'bg-[#FFD15C] text-zinc-900'
            : 'bg-zinc-100 text-zinc-500'
        }`}>
          {guessMatchesTarget || isMatched ? (
            <Award className="w-6 h-6 stroke-[2.5] animate-bounce" />
          ) : (
            <Sparkles className="w-5 h-5 stroke-[2.5]" />
          )}
        </div>

        {/* Live Guess Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] uppercase font-bold text-zinc-400 font-mono">
              Live AI Vision Guess
            </span>
            <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-zinc-100 text-zinc-700">
              {recognitionMode === 'word' ? 'Word Mode' : 'Alphabet Mode'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className={`font-extrabold text-base sm:text-lg tracking-tight truncate ${
              guessMatchesTarget || isMatched ? 'text-[#16A34A]' : 'text-zinc-900'
            }`}>
              {activeGuess}
            </span>

            {topCandidate && (
              <span className={`cartoon-badge !py-0 !px-1.5 text-[10px] font-mono font-bold ${
                guessMatchesTarget || isMatched
                  ? 'bg-[#22C55E] text-white'
                  : 'bg-[#FFD15C] text-zinc-900'
              }`}>
                {activeConfidence}% Match
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Middle Section: Top 3 Candidate Confidence Bars */}
      <div className="w-full sm:w-64 lg:w-80 flex flex-col gap-1.5 bg-[#FAF8F5] p-2 rounded-xl border border-zinc-200">
        <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 font-mono">
          <span>Candidate Rankings</span>
          <span>Target: {targetLabel}</span>
        </div>

        <div className="space-y-1">
          {candidates.slice(0, 3).map((cand, idx) => {
            const isTarget = cand.label?.toUpperCase() === targetLabel;
            const pct = Math.round(cand.confidence * 100);
            return (
              <div key={cand.label || idx} className="flex items-center gap-2 text-[10px]">
                <span className={`w-16 font-bold truncate ${isTarget ? 'text-[#16A34A]' : 'text-zinc-700'}`}>
                  {cand.label}
                </span>
                <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden border border-zinc-300">
                  <div
                    className={`h-full transition-all duration-200 rounded-full ${
                      isTarget ? 'bg-[#22C55E]' : 'bg-[#FFD15C]'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="font-mono text-zinc-500 w-8 text-right font-bold">
                  {pct}%
                </span>
              </div>
            );
          })}
          {candidates.length === 0 && (
            <div className="text-[11px] text-zinc-400 font-medium text-center py-1">
              Signing active — awaiting gesture frames...
            </div>
          )}
        </div>
      </div>

      {/* 3. Right Section: Mastered Streak & Action Controls */}
      <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end flex-shrink-0">
        {/* Streak Counter */}
        <div className="cartoon-card-subtle px-3 py-1.5 bg-[#FEFCE8] border-zinc-900 flex items-center gap-1.5">
          <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
          <div className="text-left leading-none">
            <span className="text-[9px] uppercase font-bold text-zinc-400 block font-mono">Mastered</span>
            <span className="text-xs font-extrabold text-zinc-900">{masteredCount} Signs</span>
          </div>
        </div>

        {/* Next Sign Button */}
        <button
          onClick={onNextSign}
          className={`cartoon-btn !py-1.5 !px-3 text-xs font-extrabold flex items-center gap-1.5 ${
            guessMatchesTarget || isMatched
              ? 'bg-[#22C55E] text-white hover:bg-[#16A34A] border-zinc-900 shadow-cartoon-sm animate-pulse'
              : 'bg-[#FFD15C] text-zinc-900 hover:bg-[#FBBF24] border-zinc-900 shadow-cartoon-sm'
          }`}
          title="Practice next sign"
        >
          <span>Next Sign</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>
    </div>
  );
}
