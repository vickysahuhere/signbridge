import React, { useMemo } from 'react';
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
  RotateCcw,
  Milestone
} from 'lucide-react';
import { getLevelForGloss } from '../ai/islCourseCurriculum.js';

export function LearnGuessPanel({
  selectedItem,
  wordPredictions = { topCandidates: [], confirmedWord: null },
  alphabetPredictions = [],
  recognitionMode = 'word',
  onToggleMode,
  motionState = { state: 'IDLE', pauseProgress: 0, rollingVelocity: 0 },
  onNextSign,
  onOpenAcademy,
  masteredCount = 0,
  isMatched = false,
  activeStepIndex = 0,
  completedSteps = [],
  stepSuccessFlash = null,
  successfulReps = 0,
  targetReps = 3,
  onResetPractice
}) {
  const currentLevel = useMemo(() => {
    return getLevelForGloss(selectedItem?.label);
  }, [selectedItem]);
  // Determine top candidates based on mode - Strictly isolated
  const candidates = useMemo(() => {
    const raw = recognitionMode === 'word'
      ? (wordPredictions?.topCandidates || [])
      : (alphabetPredictions || []);
    if (recognitionMode === 'word') {
      return (raw || []).filter(c => !c.isAlphabetHint && !/^[A-Z]$/.test(c.label?.trim()));
    }
    return (raw || []).filter(c => /^[A-Z]$/.test(c.label?.trim()));
  }, [recognitionMode, wordPredictions, alphabetPredictions]);

  const topCandidate = candidates[0] || null;
  const targetLabel = selectedItem?.label?.toUpperCase() || '';

  const activeStep = selectedItem?.isCompound && selectedItem?.steps
    ? selectedItem.steps[activeStepIndex] || selectedItem.steps[0]
    : null;

  const activeStepTarget = activeStep
    ? (activeStepIndex === 0 ? 'GOOD' : 'MORNING')
    : targetLabel;

  // Does the current top guess match the target word or active compound step?
  const guessMatchesTarget = topCandidate && (
    topCandidate.label?.toUpperCase() === targetLabel ||
    topCandidate.label?.toUpperCase() === activeStepTarget
  ) && topCandidate.confidence >= 0.82;

  const activeGuess = topCandidate?.label || 'Ready / Watching';
  const activeConfidence = topCandidate ? Math.round(topCandidate.confidence * 100) : 0;

  return (
    <div className={`duo-card p-2.5 sm:p-3 flex flex-col 2xl:flex-row items-stretch 2xl:items-center justify-between gap-2 sm:gap-3 flex-shrink-0 w-full min-w-0 transition-colors ${
      isMatched ? 'bg-[#EEFDE5] border-[#58CC02] border-b-[4px]' : 'bg-white border-[#E5E5E5]'
    }`}>
      {/* 1. Left & Middle Section: Primary Live AI Guess + Candidate Rankings */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 flex-1 min-w-0">
        {/* 1a. Left Section: Primary Live AI Guess */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {/* Animated AI Brain Icon */}
          <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
            guessMatchesTarget || isMatched
              ? 'bg-[#58CC02] text-white shadow-sm scale-105'
              : topCandidate
              ? 'bg-[#FFC800] text-[#78350F]'
              : 'bg-zinc-100 text-zinc-400'
          }`}>
            {guessMatchesTarget || isMatched ? (
              <Award className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5] animate-bounce" />
            ) : (
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
            )}
          </div>

          {/* Live Guess Info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 whitespace-nowrap">
              <span className="text-[10px] sm:text-xs uppercase font-black text-zinc-500 font-mono tracking-wider">
                {isMatched ? 'Sign Passed' : 'Live AI Vision Guess'}
              </span>
              <span className="duo-badge !py-0.2 !px-1.5 text-[10px] sm:text-xs bg-zinc-100 text-zinc-700 border-zinc-200 font-bold">
                {recognitionMode === 'word' ? 'Words' : 'A–Z'}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-0.5 min-w-0 h-7">
              <span
                className={`font-black text-base sm:text-lg tracking-tight truncate min-w-0 ${
                  guessMatchesTarget || isMatched ? 'text-[#2F7202]' : 'text-[#2C3E28]'
                }`}
                title={isMatched ? `${selectedItem?.name || targetLabel} Mastered!` : activeGuess}
              >
                {isMatched ? `${selectedItem?.name || targetLabel} Mastered!` : activeGuess}
              </span>

              {topCandidate && !isMatched && (
                <span className={`duo-badge !py-0.2 !px-2 text-[10px] sm:text-xs font-mono font-black flex-shrink-0 ${
                  guessMatchesTarget
                    ? 'bg-[#58CC02] text-white border-[#46A302]'
                    : 'bg-[#FFC800] text-[#78350F] border-[#E5A500]'
                }`}>
                  {activeConfidence}% Match
                </span>
              )}
            </div>
          </div>
        </div>

        {/* 1b. Middle Section: Fixed-size Candidate Rankings (hidden on ultra-small mobile to prevent vertical overflow) */}
        {isMatched ? (
          <div className="hidden sm:flex w-full sm:w-64 lg:w-72 h-[76px] items-center gap-2 bg-white/80 p-2 rounded-xl border-2 border-[#58CC02]/40 flex-shrink-0 overflow-hidden">
            <CheckCircle2 className="w-4 h-4 text-[#58CC02] stroke-[3] flex-shrink-0" />
            <span className="text-xs font-black text-[#2F7202] leading-tight">
              Nicely done! You nailed this sign 3 times in a row!
            </span>
          </div>
        ) : (
          <div className="hidden sm:flex w-full sm:w-64 lg:w-72 h-[76px] flex-col justify-between bg-[#F4FAF2] p-2 rounded-xl border-2 border-[#D6EBD3] flex-shrink-0 overflow-hidden">
            <div className="flex items-center justify-between text-[10px] font-black text-zinc-600 font-mono leading-none flex-shrink-0">
              <span className="shrink-0">Candidate Rankings</span>
              <span
                className="truncate max-w-[120px] text-[#2F7202]"
                title={activeStep ? activeStep.title : targetLabel}
              >
                L{currentLevel.levelNumber}: {activeStep ? activeStep.title : targetLabel}
              </span>
            </div>

            <div className="flex-1 flex flex-col justify-center min-h-0 overflow-hidden">
              {candidates.length > 0 ? (
                <div className="flex flex-col gap-1 justify-center min-h-0">
                  {candidates.slice(0, 2).map((cand, idx) => {
                    const isTarget = cand.label?.toUpperCase() === targetLabel;
                    const pct = Math.round(cand.confidence * 100);
                    return (
                      <div key={cand.label || idx} className="flex items-center gap-1.5 text-xs h-4 flex-shrink-0 min-w-0">
                        <span
                          className={`w-20 shrink-0 font-black truncate text-[11px] sm:text-xs ${
                            isTarget ? 'text-[#2F7202]' : 'text-zinc-800'
                          }`}
                          title={cand.label}
                        >
                          {cand.label}
                        </span>
                        <div className="flex-1 min-w-0 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-150 rounded-full ${
                              isTarget ? 'bg-[#58CC02]' : 'bg-[#FFC800]'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="font-mono text-zinc-500 w-7 shrink-0 text-right text-[10px] font-black">
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-[10px] text-zinc-400 font-bold text-center truncate py-1">
                  Show your hands to the camera...
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 2. Action Controls: Reps Goal + Streak counter + Retry + CONTINUE button */}
      <div className="flex items-center gap-1 sm:gap-2 justify-between sm:justify-end flex-wrap flex-shrink-0 pt-1 2xl:pt-0 border-t 2xl:border-t-0 border-zinc-200/60 min-w-0">
        {/* Repetition Progress Pill (hidden on ultra-small mobile since Top HUD already displays it) */}
        <div
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border-2 transition-all flex-shrink-0 ${
            isMatched
              ? 'bg-white border-[#58CC02] border-b-[3px]'
              : 'bg-[#F4FAF2] border-[#D6EBD3]'
          }`}
          title={`${successfulReps} of ${targetReps} reps completed. Sign 3 times to pass.`}
        >
          <div className="leading-none text-left">
            <span className="text-[8px] uppercase font-black text-zinc-500 block font-mono">Goal</span>
            <span className={`text-[11px] sm:text-xs font-black ${isMatched ? 'text-[#2F7202]' : 'text-[#2C3E28]'}`}>
              {successfulReps}/{targetReps} Reps
            </span>
          </div>
          <div className="flex items-center gap-0.5 ml-0.5">
            {Array.from({ length: targetReps }).map((_, i) => (
              <span
                key={i}
                className={`w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center transition-all ${
                  successfulReps > i
                    ? 'bg-[#58CC02] text-white shadow-xs scale-105'
                    : 'bg-zinc-200 text-zinc-400'
                }`}
              >
                {successfulReps > i ? '✓' : i + 1}
              </span>
            ))}
          </div>
        </div>

        {/* Streak Counter / Sign Academy Shortcut */}
        <button
          type="button"
          onClick={onOpenAcademy}
          className="duo-btn duo-btn-gold !py-1 !px-2 sm:!py-1.5 sm:!px-3 text-xs font-black flex-shrink-0"
          title="Click to open Sign Academy"
        >
          <Flame className="w-3.5 h-3.5 text-[#78350F] fill-[#78350F] flex-shrink-0" />
          <span className="font-black">{masteredCount} Mastered</span>
        </button>

        {/* Try Again Button */}
        <button
          type="button"
          onClick={onResetPractice}
          className="duo-btn !py-1 !px-2 sm:!py-1.5 sm:!px-3 text-xs font-black flex-shrink-0"
          title="Reset practice and try this sign again"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Retry</span>
        </button>

        {/* Next Sign Button (CONTINUE) */}
        <button
          onClick={onNextSign}
          className={`duo-btn !py-1 !px-2.5 sm:!py-1.5 sm:!px-4 text-xs font-black flex items-center gap-1 flex-shrink-0 ${
            isMatched ? 'duo-btn-green animate-subtle-bounce' : 'duo-btn-blue'
          }`}
          title="Advance to next sign on course path"
        >
          <span>{isMatched ? 'CONTINUE' : 'NEXT'}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
