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
    <div className={`duo-card p-3 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0 transition-colors ${
      isMatched ? 'bg-[#EEFDE5] border-[#58CC02] border-b-[4px]' : 'bg-white border-[#E5E5E5]'
    }`}>
      {/* 1. Left Section: Primary Live AI Guess */}
      <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
        {/* Animated AI Brain Icon */}
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
          guessMatchesTarget || isMatched
            ? 'bg-[#58CC02] text-white shadow-sm scale-105'
            : topCandidate
            ? 'bg-[#FFC800] text-[#78350F]'
            : 'bg-zinc-100 text-zinc-400'
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
            <span className="text-xs uppercase font-black text-zinc-500 font-mono tracking-wider">
              {isMatched ? 'Sign Passed' : 'Live AI Vision Guess'}
            </span>
            <span className="duo-badge !py-0.5 !px-2 text-xs bg-zinc-100 text-zinc-700 border-zinc-200 font-bold">
              {recognitionMode === 'word' ? 'Words' : 'A–Z'}
            </span>
          </div>

          <div className="flex items-center gap-2 mt-0.5">
            <span className={`font-black text-lg sm:text-xl tracking-tight truncate ${
              guessMatchesTarget || isMatched ? 'text-[#2F7202]' : 'text-[#2C3E28]'
            }`}>
              {isMatched ? `${selectedItem?.name || targetLabel} Mastered!` : activeGuess}
            </span>

            {topCandidate && !isMatched && (
              <span className={`duo-badge !py-0.5 !px-2.5 text-xs font-mono font-black ${
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

      {/* 2. Middle Section: Top 3 Candidate Confidence Bars (or Celebration Message) */}
      {isMatched ? (
        <div className="w-full sm:w-64 lg:w-80 flex items-center gap-2 bg-white/80 p-2.5 rounded-2xl border-2 border-[#58CC02]/40">
          <CheckCircle2 className="w-5 h-5 text-[#58CC02] stroke-[3] flex-shrink-0" />
          <span className="text-sm font-black text-[#2F7202]">
            Nicely done! You nailed this sign 3 times in a row!
          </span>
        </div>
      ) : (
        <div className="w-full sm:w-64 lg:w-80 flex flex-col gap-1.5 bg-[#F4FAF2] p-2.5 rounded-2xl border-2 border-[#D6EBD3]">
          <div className="flex items-center justify-between text-xs font-black text-zinc-600 font-mono">
            <span>Candidate Rankings</span>
            <span className="truncate max-w-[150px] text-[#2F7202]">
              L{currentLevel.levelNumber} Target: {activeStep ? activeStep.title : targetLabel}
            </span>
          </div>

          <div className="space-y-1">
            {candidates.slice(0, 3).map((cand, idx) => {
              const isTarget = cand.label?.toUpperCase() === targetLabel;
              const pct = Math.round(cand.confidence * 100);
              return (
                <div key={cand.label || idx} className="flex items-center gap-2 text-xs">
                  <span className={`w-20 font-black truncate text-xs sm:text-sm ${isTarget ? 'text-[#2F7202]' : 'text-zinc-800'}`}>
                    {cand.label}
                  </span>
                  <div className="flex-1 h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-200 rounded-full ${
                        isTarget ? 'bg-[#58CC02]' : 'bg-[#FFC800]'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="font-mono text-zinc-500 w-8 text-right font-black">
                    {pct}%
                  </span>
                </div>
              );
            })}
            {candidates.length === 0 && (
              <div className="text-[11px] text-zinc-400 font-bold text-center py-1">
                Show your hands to the camera...
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Right Section: Mastered Streak & Action Controls */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0 flex-wrap">
        {/* Repetition Progress Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl border-2 transition-all ${
            isMatched
              ? 'bg-white border-[#58CC02] border-b-[3px]'
              : 'bg-[#F4FAF2] border-[#D6EBD3]'
          }`}
          title={`${successfulReps} of ${targetReps} reps completed. Sign 3 times to pass.`}
        >
          <div className="leading-none text-left">
            <span className="text-[9px] uppercase font-black text-zinc-500 block font-mono">Pass Goal</span>
            <span className={`text-xs sm:text-sm font-black ${isMatched ? 'text-[#2F7202]' : 'text-[#2C3E28]'}`}>
              {successfulReps}/{targetReps} Reps
            </span>
          </div>
          <div className="flex items-center gap-1 ml-1">
            {Array.from({ length: targetReps }).map((_, i) => (
              <span
                key={i}
                className={`w-5 h-5 rounded-full text-xs font-black flex items-center justify-center transition-all ${
                  successfulReps > i
                    ? 'bg-[#58CC02] text-white shadow-sm scale-110'
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
          className="duo-btn duo-btn-gold !py-2 !px-3.5 text-xs sm:text-sm font-black"
          title="Click to open Sign Academy"
        >
          <Flame className="w-4 h-4 text-[#78350F] fill-[#78350F] flex-shrink-0" />
          <span className="font-black">{masteredCount} Mastered</span>
        </button>

        {/* Try Again Button */}
        <button
          type="button"
          onClick={onResetPractice}
          className="duo-btn !py-2 !px-3.5 text-xs sm:text-sm font-black"
          title="Reset practice and try this sign again"
        >
          <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Retry</span>
        </button>

        {/* Next Sign Button (CONTINUE) */}
        <button
          onClick={onNextSign}
          className={`duo-btn !py-2 !px-4 text-xs sm:text-sm font-black flex items-center gap-1.5 ${
            isMatched ? 'duo-btn-green animate-subtle-bounce' : 'duo-btn-blue'
          }`}
          title="Advance to next sign on course path"
        >
          <span>{isMatched ? 'CONTINUE' : 'NEXT SIGN'}</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
