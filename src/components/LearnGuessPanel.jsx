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
  onResetPractice,
  untrained = false,
  targetMatched = false,
  onManualPass,
  onTrain
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
    ? (activeStep.targetGloss || activeStep.title?.replace(/^Part \d+:\s*/i, '') || targetLabel)
    : targetLabel;

  // Does the current top guess match the target word or active compound step?
  const topCandidateLabel = topCandidate?.label?.toUpperCase() || '';
  const topCandidateNorm = topCandidateLabel.replace(/_/g, ' ');
  const targetLabelNorm = targetLabel.replace(/_/g, ' ');
  const activeStepTargetNorm = activeStepTarget.replace(/_/g, ' ');

  // Match comes from the same matcher that counts repetitions (passed in), not a separate threshold
  const guessMatchesTarget = Boolean(targetMatched);
  const norm = (x) => (x || '').toUpperCase().replace(/[_\s]+/g, '_');

  const activeGuess = topCandidate?.label || 'Ready / Watching';
  const activeConfidence = topCandidate ? Math.round(topCandidate.confidence * 100) : 0;

  return (
    <div className={`duo-card p-2 sm:p-2.5 flex flex-col lg:flex-row lg:flex-wrap xl:flex-nowrap items-stretch lg:items-center justify-between gap-2.5 flex-shrink-0 w-full min-w-0 xl:h-[68px] xl:overflow-hidden transition-colors shadow-cartoon-sm ${
      isMatched ? 'bg-[#EEFDE5] border-[#58CC02] border-b-[4px]' : 'bg-white border-[#E5E5E5]'
    }`}>
      {/* 1. Left Section: Primary Live AI Vision Guess */}
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        {/* Animated AI Brain Icon */}
        <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
          guessMatchesTarget || isMatched
            ? 'bg-[#58CC02] text-white shadow-sm scale-105'
            : topCandidate
            ? 'bg-[#FFC800] text-[#78350F]'
            : 'bg-zinc-100 text-zinc-400'
        }`}>
          {guessMatchesTarget || isMatched ? (
            <Award className="w-5 h-5 stroke-[2.5] animate-bounce" />
          ) : (
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          )}
        </div>

        {/* Live Guess Info */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-[10px] uppercase font-black text-zinc-500 font-mono tracking-wider">
              {isMatched ? 'Sign Passed' : 'AI sees'}
            </span>
            <span className="duo-badge !py-0.2 !px-1.5 text-[9px] bg-zinc-100 text-zinc-700 border-zinc-200 font-bold">
              {recognitionMode === 'word' ? 'Words' : 'A–Z'}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#58CC02] animate-pulse" />
          </div>

          <div className="flex items-center gap-2 mt-0.5 min-w-0">
            <span
              className={`font-black text-sm sm:text-base tracking-tight truncate min-w-0 ${
                guessMatchesTarget || isMatched ? 'text-[#2F7202]' : topCandidate ? 'text-[#2C3E28]' : 'text-zinc-500 font-bold'
              }`}
              title={isMatched ? `${selectedItem?.name || targetLabel} Mastered!` : activeGuess}
            >
              {isMatched ? `${selectedItem?.name || targetLabel} Mastered!` : untrained ? 'Not trained yet' : topCandidate ? activeGuess : 'Ready • Sign when ready'}
            </span>

            {topCandidate && !isMatched && (
              <span className={`duo-badge !py-0.2 !px-1.5 text-[10px] font-mono font-black flex-shrink-0 ${
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

      {/* 2. Middle Section: Integrated Candidate Probabilities Bar */}
      {isMatched ? (
        <div className="hidden 2xl:flex items-center gap-2 h-[50px] w-64 bg-[#EAF6E8] px-3 rounded-xl border border-[#D6EBD3] text-xs font-black text-[#2F7202] flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-[#58CC02] stroke-[3] flex-shrink-0" />
          <span>Target Mastered! Complete 3/3!</span>
        </div>
      ) : candidates.length > 0 ? (
        <div className="hidden 2xl:flex flex-col justify-center h-[50px] w-64 bg-[#F4FAF2] px-2.5 rounded-xl border border-[#D6EBD3] flex-shrink-0">
          <div className="flex items-center justify-between text-[9px] font-black text-zinc-500 font-mono leading-tight mb-1">
            <span>Candidate Rankings</span>
            <span className="text-[#2F7202] truncate max-w-[100px]">
              Target: {activeStep ? activeStep.title : targetLabel}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            {candidates.slice(0, 2).map((cand, idx) => {
              const isTarget = norm(cand.label) === norm(activeStepTarget);
              const pct = Math.round(cand.confidence * 100);
              return (
                <div key={cand.label || idx} className="flex items-center gap-1.5 text-xs h-3.5 flex-shrink-0 min-w-0">
                  <span
                    className={`w-16 shrink-0 font-bold truncate text-[10px] ${
                      isTarget ? 'text-[#2F7202]' : 'text-zinc-700'
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
                  <span className="font-mono text-zinc-500 w-6 shrink-0 text-right text-[9px] font-black">
                    {pct}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="hidden 2xl:flex items-center gap-2 h-[50px] w-64 bg-[#FAF8F5] px-2.5 rounded-xl border border-zinc-200 text-zinc-500 text-xs font-medium flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#FFC800] animate-pulse flex-shrink-0" />
          <span className="text-[11px] font-bold text-zinc-500">Show your hands</span>
        </div>
      )}

      {/* 3. Action Controls: Streak counter + Retry + CONTINUE button */}
      <div className="flex flex-wrap xl:flex-nowrap items-center gap-1.5 sm:gap-2 justify-between sm:justify-end flex-shrink-0 min-w-0">
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

        {untrained && onTrain && (
          <button type="button" onClick={onTrain} className="duo-btn duo-btn-blue !py-1 !px-2 sm:!py-1.5 sm:!px-3 text-xs font-black flex-shrink-0">
            <span>Train it</span>
          </button>
        )}
        {untrained && onManualPass && !isMatched && (
          <button type="button" onClick={onManualPass} className="duo-btn duo-btn-green !py-1 !px-2 sm:!py-1.5 sm:!px-3 text-xs font-black flex-shrink-0" title="Count this attempt yourself">
            <span>I did it</span>
          </button>
        )}

        {/* Try Again Button */}
        <button
          type="button"
          onClick={onResetPractice}
          className="duo-btn !py-1 !px-2 sm:!py-1.5 sm:!px-3 text-xs font-black flex items-center gap-1 flex-shrink-0 cursor-pointer"
          title="Reset practice and try this sign again"
        >
          <RotateCcw className="w-3 h-3 stroke-[2.5]" />
          <span>Retry</span>
        </button>

        {/* Next Sign Button (CONTINUE) */}
        <button
          onClick={onNextSign}
          className={`duo-btn !py-1 !px-2.5 sm:!py-1.5 sm:!px-4 text-xs font-black flex items-center gap-1 flex-shrink-0 cursor-pointer ${
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
