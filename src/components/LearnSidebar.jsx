import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Layers,
  Crosshair,
  Compass,
  Hand,
  Check,
  ChevronDown,
  ChevronRight,
  Flame,
  Award,
  Milestone,
  HeartPulse,
  Type,
  Users,
  Train,
  Laptop,
  Globe,
  Play,
  Pause,
  ExternalLink,
  RotateCcw,
  X,
  Lightbulb,
  Maximize2,
  Minimize2,
  Target
} from 'lucide-react';
import { SignSvgIllustration, hasSvgIllustration } from './SignSvgIllustrations.jsx';
import { ISL_LEARN_ITEMS, getLearnItemByLabel } from '../ai/islTargetLandmarks.js';
import {
  ISL_COURSE_LEVELS,
  CORE_PATH_GLOSSES,
  getLevelForGloss,
  getNextRecommendedSign,
  calculateCourseProgress
} from '../ai/islCourseCurriculum.js';

export function LearnSidebar({
  selectedItem,
  onSelectItem,
  latestLandmarks,
  evaluationResult,
  masteredSet,
  isAcademyOpen: controlledIsOpen,
  onOpenAcademy,
  onCloseAcademy,
  activeStepIndex = 0,
  completedSteps = [],
  successfulReps = 0,
  targetReps = 3,
  onResetPractice
}) {
  // Navigation Mode: 'course' (guided level path) | 'lexicon' (search all 1,051 signs)
  const [viewMode, setViewMode] = useState('course');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayCount, setDisplayCount] = useState(50);
  const [filterMasteredOnly, setFilterMasteredOnly] = useState(false);
  const [gifLayout, setGifLayout] = useState('portrait'); // 'portrait' | 'landscape' | 'square'
  const [isExpandedDemo, setIsExpandedDemo] = useState(false);

  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.currentTarget;
    if (naturalHeight > naturalWidth * 1.15) {
      setGifLayout('portrait');
    } else if (naturalWidth > naturalHeight * 1.15) {
      setGifLayout('landscape');
    } else {
      setGifLayout('square');
    }
  };


  // Sidebar slide-over drawer open/close state
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const isAcademyOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;

  const openAcademy = () => {
    if (onOpenAcademy) onOpenAcademy();
    setInternalIsOpen(true);
  };

  const closeAcademy = () => {
    if (onCloseAcademy) onCloseAcademy();
    setInternalIsOpen(false);
  };

  // Close sidebar on Escape key
  useEffect(() => {
    if (!isAcademyOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        closeAcademy();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAcademyOpen]);

  // Active expanded level in course view (defaults to selected sign's level)
  const currentSignLevel = useMemo(() => {
    return getLevelForGloss(selectedItem?.label);
  }, [selectedItem]);

  const [expandedLevelId, setExpandedLevelId] = useState(currentSignLevel.id);

  // Sync expanded level when selectedItem changes
  useEffect(() => {
    if (currentSignLevel?.id) {
      setExpandedLevelId(currentSignLevel.id);
    }
  }, [currentSignLevel]);

  // Reset display count when category or search changes
  useEffect(() => {
    setDisplayCount(50);
  }, [searchQuery, selectedCategory, filterMasteredOnly]);

  // Next recommended sign along the course path
  const nextRecommendedGloss = useMemo(() => {
    return getNextRecommendedSign(selectedItem?.label, masteredSet, ISL_LEARN_ITEMS);
  }, [selectedItem, masteredSet]);

  const nextRecommendedItem = useMemo(() => {
    return getLearnItemByLabel(nextRecommendedGloss);
  }, [nextRecommendedGloss]);

  // Course progress stats
  const courseStats = useMemo(() => {
    return calculateCourseProgress(masteredSet);
  }, [masteredSet]);

  // Filtered items based on search, category and mastery status (Lexicon view)
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    // 1. Initial filter
    const matches = ISL_LEARN_ITEMS.filter(item => {
      if (filterMasteredOnly && !masteredSet?.has(item.label)) {
        return false;
      }

      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'alphabet' ? item.type === 'alphabet' : item.category === selectedCategory);

      if (!matchesCategory) return false;
      if (!q) return true;

      const label = item.label.toLowerCase();
      const name = item.name.toLowerCase();
      const english = (item.english || '').toLowerCase();

      // Single character query (e.g. "a"):
      // Strictly match exact letter, letter name, words starting with letter, or alphabet type.
      // Do NOT search paragraph descriptions for 1-char queries to avoid matching all 1,000+ words!
      if (q.length === 1) {
        if (label === q) return true;
        if (item.type === 'alphabet' && label === q) return true;
        if (name === q || name === `letter ${q}`) return true;
        if (label.startsWith(q)) return true;
        if (name.startsWith(q)) return true;
        const words = `${name} ${english}`.split(/[\s,()/-]+/);
        return words.some(w => w.startsWith(q));
      }

      // Multi-character query:
      if (label.includes(q) || name.includes(q) || english.includes(q)) return true;
      // Only search long description text when query is at least 3 characters
      if (q.length >= 3 && item.description.toLowerCase().includes(q)) return true;
      return false;
    });

    if (!q) return matches;

    // 2. Sort by match relevance so exact and prefix matches appear first!
    return matches.sort((a, b) => {
      const aLabel = a.label.toLowerCase();
      const bLabel = b.label.toLowerCase();
      const aName = a.name.toLowerCase();
      const bName = b.name.toLowerCase();
      const aEnglish = (a.english || '').toLowerCase();
      const bEnglish = (b.english || '').toLowerCase();

      const computeScore = (item, label, name, english) => {
        // Highest priority: Exact match (e.g. searching "a" for Alphabet "A")
        if (label === q) return 1000;
        if (item.type === 'alphabet' && label === q) return 980;
        if (name === q || name === `letter ${q}`) return 950;

        // Starts with query
        if (label.startsWith(q)) return 800;
        if (name.startsWith(q)) return 700;

        // Word in name starts with query
        const nameWords = name.split(/[\s,()/-]+/);
        if (nameWords.some(w => w.startsWith(q))) return 600;

        // English description / gloss starts with query
        if (english.startsWith(q)) return 500;

        // Substring matches
        if (label.includes(q)) return 400;
        if (name.includes(q)) return 300;
        if (english.includes(q)) return 200;

        return 100;
      };

      const scoreA = computeScore(a, aLabel, aName, aEnglish);
      const scoreB = computeScore(b, bLabel, bName, bEnglish);

      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
      return a.label.localeCompare(b.label);
    });
  }, [searchQuery, selectedCategory, filterMasteredOnly, masteredSet]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, displayCount);
  }, [filteredItems, displayCount]);

  const categories = useMemo(() => [
    { id: 'all', name: searchQuery ? `All (${filteredItems.length})` : `All (${ISL_LEARN_ITEMS.length})` },
    { id: 'greetings', name: 'Greetings' },
    { id: 'pronouns', name: 'People' },
    { id: 'questions', name: 'Questions' },
    { id: 'actions', name: 'Actions' },
    { id: 'essentials', name: 'Essentials' },
    { id: 'transit', name: 'Transit' },
    { id: 'healthcare', name: 'Health' },
    { id: 'shopping_food', name: 'Food & Shop' },
    { id: 'education_work', name: 'Work & Tech' },
    { id: 'time_calendar', name: 'Time & Dates' },
    { id: 'feelings_states', name: 'States' },
    { id: 'alphabet', name: 'A–Z Letters' }
  ], [searchQuery, filteredItems.length]);

  // Derive evaluation metrics
  const score = evaluationResult?.matchScore || 0;
  const checklist = evaluationResult?.checklist || [];
  const primaryGuidance = evaluationResult?.primaryGuidance || 'Position yourself in front of the camera.';
  const isAligned = evaluationResult?.isPostureAligned || evaluationResult?.isMatched || false;

  // Real-time breakdown of checklist into completed vs immediate next action
  const totalChecks = checklist.length;
  const passedChecks = checklist.filter(item => item.status === 'pass').length;
  const nextActionItem = useMemo(() => {
    if (!checklist || checklist.length === 0) return null;
    return checklist.find(item => item.status === 'fail') || checklist.find(item => item.status === 'warn') || null;
  }, [checklist]);
  const isAllPassed = totalChecks > 0 && passedChecks === totalChecks;

  // Level icon helper
  const renderLevelIcon = (iconName) => {
    switch (iconName) {
      case 'Hand': return <Hand className="w-3.5 h-3.5" />;
      case 'Type': return <Type className="w-3.5 h-3.5" />;
      case 'HeartPulse': return <HeartPulse className="w-3.5 h-3.5" />;
      case 'Users': return <Users className="w-3.5 h-3.5" />;
      case 'Train': return <Train className="w-3.5 h-3.5" />;
      case 'Laptop': return <Laptop className="w-3.5 h-3.5" />;
      case 'Globe': return <Globe className="w-3.5 h-3.5" />;
      default: return <Milestone className="w-3.5 h-3.5" />;
    }
  };

  const handleSelectAndClose = (item) => {
    onSelectItem(item);
    closeAcademy();
  };

  return (
    <>
      {/* =========================================================================
          LEFT SIDE VIEW: DEDICATED FULL PRACTICE BLUEPRINT & LANDMARK GUIDE
          Takes the whole left side so it gets generous space and clear layout!
          ========================================================================= */}
      <div className="w-full h-full flex flex-col gap-2.5 min-h-0 overflow-y-auto no-scrollbar pr-0.5">
        {/* Top Trigger Button: Click to Open Sign Academy Sidebar */}
        <button
          type="button"
          onClick={openAcademy}
          className="cartoon-btn bg-white hover:bg-[#FFF9E5] border-2 border-zinc-900 p-2 sm:p-2.5 rounded-xl shadow-cartoon-sm flex items-center justify-between gap-2 w-full transition-all group flex-shrink-0 cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <div className="w-7 h-7 rounded-lg bg-[#FFC800] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-3.5 h-3.5 text-zinc-900 stroke-[2.2]" />
            </div>
            <div className="text-left min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-0">
                <span className="font-black text-xs sm:text-sm text-zinc-900 truncate">Sign Academy</span>
                <span className="text-[10px] font-black uppercase px-1.5 py-0.2 rounded-full bg-[#1CB0F6] text-zinc-900 border border-zinc-900 whitespace-nowrap flex-shrink-0 hidden xs:inline-block">
                  1,000+ Signs
                </span>
              </div>
              <span className="text-[11px] text-zinc-600 font-bold block truncate">
                Course &amp; Curriculum
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#58CC02] text-white border border-zinc-900 flex items-center gap-1 whitespace-nowrap shadow-sm">
              <Award className="w-3 h-3 text-white stroke-[2.5]" />
              <span>{masteredSet ? masteredSet.size : 0} Mastered</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-500 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
          </div>
        </button>

        {/* 1. Upper Card: Selected Sign Guide & Biomechanical Blueprint */}
        {selectedItem && (
          <div className="cartoon-card bg-white p-3 sm:p-3.5 flex flex-col gap-2 border-2 border-zinc-900 shadow-cartoon-sm flex-1 min-h-[200px] overflow-hidden">
            {/* Header: Level & Name */}
            <div className="flex items-start justify-between gap-2 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <span className="text-[11px] uppercase font-bold text-zinc-500 font-mono tracking-wider block">
                  Level {currentSignLevel.levelNumber} • {currentSignLevel.badge || currentSignLevel.title}
                </span>
                <h3 className="font-black text-sm sm:text-base text-zinc-900 leading-tight truncate mt-0.5">
                  {selectedItem.name} ({selectedItem.label})
                </h3>
              </div>
              <span className="cartoon-badge !py-0.5 !px-2 text-[11px] bg-[#1CB0F6] text-zinc-900 font-black truncate max-w-[130px] flex-shrink-0 border border-zinc-900 shadow-sm">
                {selectedItem.english}
              </span>
            </div>

            {/* Scrollable / Flexible Card Content so texts NEVER hide */}
            <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-2.5 pr-0.5">
              {/* Visual Area: Teaching Demonstration GIF / Image - Dynamically adjusts to GIF size & orientation */}
              <div
                className={`w-full bg-[#FAF8F5] rounded-xl border-2 border-zinc-900 shadow-cartoon-sm flex items-center justify-center overflow-hidden p-2 relative group flex-shrink-0 transition-all duration-200 ${
                  !selectedItem.image
                    ? 'h-[72px]'
                    : isExpandedDemo
                    ? 'h-[320px] sm:h-[360px]'
                    : gifLayout === 'portrait'
                    ? 'h-[180px] sm:h-[210px]'
                    : gifLayout === 'landscape'
                    ? 'aspect-video min-h-[140px] max-h-[190px]'
                    : 'h-[170px] sm:h-[190px]'
                }`}
              >
                {selectedItem.image ? (
                  selectedItem.image.endsWith('.mp4') ? (
                    <video
                      src={selectedItem.image}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-auto h-full max-w-full object-contain rounded-lg shadow-sm"
                    />
                  ) : (
                    <img
                      src={selectedItem.image}
                      alt={`${selectedItem.name} demonstration`}
                      onLoad={handleImageLoad}
                      onError={(e) => {
                        const mp4Url = selectedItem.image.replace(/\.(gif|jpg|png)$/i, '.mp4');
                        if (!e.currentTarget.dataset.retried) {
                          e.currentTarget.dataset.retried = 'true';
                          e.currentTarget.src = mp4Url;
                        }
                      }}
                      className="w-auto h-full max-w-full object-contain rounded-lg transition-transform group-hover:scale-[1.01] shadow-sm"
                      loading="eager"
                    />
                  )
                ) : (
                  <div className="flex items-center gap-3 w-full px-2 text-left">
                    <div className="w-10 h-10 rounded-full bg-[#FFC800] border-2 border-zinc-900 flex items-center justify-center text-zinc-900 flex-shrink-0">
                      <Hand className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-zinc-900 leading-snug line-clamp-2">
                      {selectedItem.blueprint?.requiredFingers || 'Clear handshape'}
                    </div>
                  </div>
                )}

                {/* Enlarge / Standard Size Toggle Button */}
                {selectedItem.image && (
                  <button
                    type="button"
                    onClick={() => setIsExpandedDemo(prev => !prev)}
                    className="absolute top-2 right-2 bg-white/95 hover:bg-white text-zinc-900 px-2 py-1 rounded-lg border border-zinc-900 shadow-sm transition-all z-10 text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                    title={isExpandedDemo ? "Restore Standard Size" : "Enlarge Demonstration"}
                  >
                    {isExpandedDemo ? (
                      <>
                        <Minimize2 className="w-3 h-3 stroke-[2.5]" />
                        <span className="hidden sm:inline">Fit</span>
                      </>
                    ) : (
                      <>
                        <Maximize2 className="w-3 h-3 stroke-[2.5]" />
                        <span className="hidden sm:inline">Enlarge</span>
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Step-by-Step Motion & Pacing Guidance - Fully Visible without cutoff */}
              <div className="bg-[#EAF6E8] p-2.5 rounded-xl border border-[#D6EBD3] text-xs sm:text-sm text-zinc-800 leading-relaxed font-medium flex flex-col gap-1.5 flex-shrink-0">
                <div className="text-xs sm:text-sm text-zinc-800 leading-snug font-bold">
                  {selectedItem.description}
                </div>

                {selectedItem.tip && (
                  <div className="text-xs font-bold text-[#16A34A] bg-[#EDFDF2] px-2 py-1 rounded-md border border-green-200 flex items-start gap-1.5 leading-snug">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{selectedItem.tip}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 2. Lower Card: Live Posture Alignment Guide */}
        <div className="bg-white rounded-2xl border-2 border-zinc-900 shadow-cartoon-sm p-3 sm:p-3.5 flex flex-col gap-2.5 flex-shrink-0 max-h-[50%] overflow-y-auto">
          {/* Header & Repetition Goal Bar (Integrated & Compact) */}
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-zinc-100 flex-shrink-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-xl bg-gradient-to-br from-[#58CC02] to-[#46A302] flex items-center justify-center text-white shadow-xs border border-zinc-900/10 flex-shrink-0">
                <Target className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-black text-xs sm:text-sm text-zinc-900 truncate tracking-tight">
                {selectedItem?.isCompound && selectedItem?.steps?.[activeStepIndex]
                  ? selectedItem.steps[activeStepIndex].title
                  : 'Live Posture Guide'}
              </span>
            </div>

            {/* Reps Goal & Match Score side-by-side */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {/* Repetition Goal Pills */}
              <div className="flex items-center gap-1 bg-[#F4F4F5] px-2 py-1 rounded-xl border border-zinc-200/80">
                <span className="text-[9px] font-black uppercase text-zinc-500 tracking-wider mr-0.5">Reps</span>
                {Array.from({ length: targetReps }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-4 h-4 rounded-md text-[9px] font-black flex items-center justify-center transition-all ${
                      successfulReps > i
                        ? 'bg-[#58CC02] text-white shadow-xs'
                        : 'bg-white text-zinc-400 border border-zinc-300'
                    }`}
                  >
                    {successfulReps > i ? '✓' : i + 1}
                  </span>
                ))}
              </div>

              {/* Match Score Badge */}
              <div className={`px-2 py-1 rounded-xl text-[11px] font-black font-mono flex items-center gap-1.5 border transition-all ${
                score >= 75
                  ? 'bg-[#EBFDF0] text-[#15803D] border-[#86EFAC]'
                  : score >= 40
                  ? 'bg-[#FEFCE8] text-[#A16207] border-[#FDE047]'
                  : 'bg-zinc-100 text-zinc-600 border-zinc-200'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  score >= 75 ? 'bg-[#22C55E] animate-pulse' : score >= 40 ? 'bg-[#EAB308]' : 'bg-zinc-400'
                }`} />
                <span>{score}%</span>
              </div>

              {onResetPractice && (
                <button
                  type="button"
                  onClick={onResetPractice}
                  className="w-6 h-6 rounded-xl bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border border-zinc-300 hover:border-zinc-900 flex items-center justify-center transition-all cursor-pointer shadow-xs active:scale-95"
                  title="Reset practice repetitions"
                >
                  <RotateCcw className="w-3 h-3 stroke-[2.2]" />
                </button>
              )}
            </div>
          </div>

          {/* Compound Sign Multi-Step Mini Progress Indicator */}
          {selectedItem?.isCompound && selectedItem?.steps && (
            <div className="flex items-center gap-1.5 p-1.5 bg-[#F4FBF4] rounded-xl border border-[#D6EBD3] flex-shrink-0">
              {selectedItem.steps.map((st, idx) => {
                const isDone = completedSteps.includes(idx);
                const isCur = idx === activeStepIndex;
                return (
                  <div
                    key={st.id}
                    className={`flex-1 text-center py-1 px-1.5 rounded-lg text-xs font-black border transition-all ${
                      isDone
                        ? 'bg-[#58CC02] text-white border-zinc-900 shadow-xs'
                        : isCur
                        ? 'bg-[#FFC800] text-zinc-900 border-zinc-900 shadow-sm animate-pulse'
                        : 'bg-white text-zinc-500 border-zinc-200'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3.5 h-3.5 inline mr-0.5 stroke-[3]" />
                    ) : (
                      `${idx + 1}. `
                    )}
                    {st.title.split(':')[1]?.trim() || st.title}
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic Match Score Progress Bar (Polished Pill) */}
          <div className="space-y-1 flex-shrink-0">
            <div className="w-full h-2.5 bg-zinc-100 rounded-full border border-zinc-200/90 overflow-hidden relative shadow-inner">
              {/* Target Threshold Notch at 75% */}
              <div
                className="absolute top-0 bottom-0 left-[75%] w-0.5 bg-zinc-400/80 z-10"
                title="Goal threshold (75%)"
              />
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  score >= 75
                    ? 'bg-gradient-to-r from-[#58CC02] to-[#46A302]'
                    : score >= 40
                    ? 'bg-gradient-to-r from-[#FFD15C] to-[#E5A500]'
                    : 'bg-zinc-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] font-bold text-zinc-400 px-0.5 font-mono leading-none">
              <span>0%</span>
              <span className="text-[9.5px] font-black text-zinc-500 uppercase tracking-wider">
                Goal: 75%+
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* CENTER HERO: ACTIVE COACHING DIRECTIVE */}
          <div className={`p-3 rounded-2xl border-2 flex flex-col gap-2 transition-all flex-shrink-0 ${
            isAllPassed || isAligned
              ? 'bg-gradient-to-r from-[#F0FDF4] to-[#DCFCE7] border-[#86EFAC] text-emerald-950 shadow-xs'
              : nextActionItem?.status === 'fail'
              ? 'bg-gradient-to-r from-[#FFFDF5] to-[#FEF9E7] border-[#FDE68A] text-zinc-900 shadow-xs'
              : 'bg-gradient-to-r from-[#F0F9FF] to-[#E0F2FE] border-[#BAE6FD] text-zinc-900 shadow-xs'
          }`}>
            <div className="flex items-center justify-between gap-1.5">
              <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                isAllPassed || isAligned
                  ? 'bg-[#58CC02] text-white shadow-xs'
                  : 'bg-[#FFC800] text-[#78350F] border border-[#E5A500]'
              }`}>
                {isAllPassed || isAligned ? (
                  <>
                    <Sparkles className="w-3 h-3 text-white stroke-[2.5]" />
                    <span>Target Aligned!</span>
                  </>
                ) : (
                  <>
                    <span className="text-amber-800">👉</span>
                    <span>Current Step</span>
                  </>
                )}
              </span>

              <span className="text-[10.5px] font-bold text-zinc-500 font-mono">
                {isAllPassed || isAligned
                  ? 'Hold Steady (1s)'
                  : `${passedChecks} of ${totalChecks} conditions met`}
              </span>
            </div>

            {/* Main Action Instruction in Bold Center */}
            <div className="font-black text-xs sm:text-sm text-zinc-900 leading-snug">
              {isAllPassed || isAligned
                ? 'All requirements satisfied! Hold this exact sign steady to register the repetition.'
                : nextActionItem?.hint || nextActionItem?.label || primaryGuidance}
            </div>

          </div>

          {/* REQUIREMENTS MATRIX */}
          <div className="flex flex-col gap-1.5 flex-1 min-h-0 justify-center">
            <div className="flex items-center justify-between text-[10px] font-black uppercase text-zinc-500 tracking-wider">
              <span>Checklist</span>
              <span className="font-mono text-[#15803D] font-bold">{passedChecks}/{totalChecks}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {checklist.map((item, idx) => {
                const isPass = item.status === 'pass';
                const isCurrent = item === nextActionItem;
                const isLastOdd = checklist.length % 2 === 1 && idx === checklist.length - 1;
                return (
                  <div
                    key={item.id || idx}
                    className={`flex items-center justify-between p-2 rounded-xl border text-xs transition-all ${
                      isLastOdd ? 'col-span-2' : ''
                    } ${
                      isPass
                        ? 'bg-[#F0FDF4] border-[#86EFAC]/80 text-[#15803D]'
                        : isCurrent
                        ? 'bg-[#FFFBEB] border-2 border-[#FFC800] text-zinc-900 shadow-xs'
                        : 'bg-zinc-50/80 border-zinc-200/80 text-zinc-500'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={`w-4 h-4 rounded-md flex items-center justify-center text-[10px] font-black flex-shrink-0 ${
                        isPass
                          ? 'bg-[#58CC02] text-white shadow-xs'
                          : isCurrent
                          ? 'bg-[#FFC800] text-[#78350F]'
                          : 'bg-zinc-200 text-zinc-400'
                      }`}>
                        {isPass ? '✓' : isCurrent ? '!' : '○'}
                      </span>
                      <span className="font-bold text-[11.5px] truncate leading-tight">
                        {item.label}
                      </span>
                    </div>

                    <span className={`text-[10px] font-bold ml-1 flex-shrink-0 text-right px-1.5 py-0.2 rounded-md ${
                      isPass
                        ? 'text-emerald-700 bg-emerald-100/60 font-black'
                        : isCurrent
                        ? 'text-amber-800 bg-amber-100/80 font-black'
                        : 'text-zinc-500 bg-zinc-100'
                    }`}>
                      {isPass ? 'Done' : item.current}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      {/* =========================================================================
          SIGN ACADEMY SIDEBAR DRAWER (By click available, giving it full dedicated space!)
          ========================================================================= */}
      {isAcademyOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Subtle Dark Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={closeAcademy}
          />

          {/* Slide-over Sidebar Panel */}
          <div className="relative z-10 w-full max-w-[480px] sm:max-w-[520px] h-full bg-[#EDF7EC] border-r-2 border-zinc-900 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
            {/* Header with Title, Mastered count & Close Button */}
            <div className="px-4 py-3 border-b-2 border-zinc-900 bg-white flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FFC800] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
                  <BookOpen className="w-4 h-4 text-zinc-900 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-base sm:text-lg text-zinc-900 leading-tight">
                    Sign Academy
                  </h2>
                  <p className="text-xs text-zinc-600 font-semibold truncate">
                    Guided Course & 1,000+ ISL Vocabulary
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="cartoon-badge !py-1 !px-2.5 text-xs bg-[#58CC02] text-white font-bold flex items-center gap-1 border border-zinc-900 shadow-sm">
                  <Award className="w-3.5 h-3.5 text-white stroke-[2.5]" />
                  {masteredSet ? masteredSet.size : 0} Mastered
                </span>

                <button
                  onClick={closeAcademy}
                  className="w-8 h-8 rounded-lg border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center justify-center text-zinc-900 shadow-cartoon-sm transition-all cursor-pointer"
                  title="Close Sign Academy (Esc)"
                >
                  <X className="w-4 h-4 stroke-[2.5]" />
                </button>
              </div>
            </div>

            {/* Primary View Toggle: Guided Course vs All 1,000+ Signs */}
            <div className="p-3 border-b border-zinc-200 bg-[#EAF6E8] flex-shrink-0">
              <div className="grid grid-cols-2 gap-1.5 bg-[#E5F3E4] p-1 rounded-xl border border-zinc-300">
                <button
                  onClick={() => setViewMode('course')}
                  className={`py-1.5 px-2 rounded-lg text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
                    viewMode === 'course'
                      ? 'bg-[#FFC800] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                      : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
                  }`}
                >
                  <Milestone className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Guided Course</span>
                </button>
                <button
                  onClick={() => setViewMode('lexicon')}
                  className={`py-1.5 px-2 rounded-lg text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 transition-all ${
                    viewMode === 'lexicon'
                      ? 'bg-[#1CB0F6] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                      : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
                  }`}
                >
                  <Search className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>All 1,000+ Signs</span>
                </button>
              </div>
            </div>

            {/* =========================================================================
                VIEW A: GUIDED COURSE ROADMAP (Start with Namaste -> Levels 1 through 7)
                ========================================================================= */}
            {viewMode === 'course' && (
              <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-3">
                {/* 1. Recommended Next Sign Banner */}
                {nextRecommendedItem && (
                  <div className="p-3.5 rounded-xl bg-[#FFF9E5] border-2 border-zinc-900 shadow-cartoon-sm flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping" />
                        <span className="text-xs font-mono font-bold uppercase text-amber-900">
                          Recommended Next Step
                        </span>
                      </div>
                      <div className="font-black text-base text-zinc-900 truncate mt-0.5">
                        {nextRecommendedItem.name} ({nextRecommendedItem.label})
                      </div>
                      <p className="text-xs sm:text-sm text-zinc-600 truncate font-semibold">
                        {nextRecommendedItem.english}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectAndClose(nextRecommendedItem)}
                      className="cartoon-btn cartoon-btn-primary !py-2 !px-3.5 text-xs sm:text-sm font-black flex items-center gap-1.5 flex-shrink-0"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Practice</span>
                    </button>
                  </div>
                )}

                {/* 2. Structured Level List */}
                <div className="space-y-2.5">
                  {ISL_COURSE_LEVELS.map((lvl) => {
                    const isExpanded = expandedLevelId === lvl.id;
                    const stats = courseStats.levelStats.find(s => s.levelId === lvl.id);
                    const isLevelComplete = stats && stats.pct === 100;
                    const hasSelectedSign = lvl.glosses.includes(selectedItem?.label) || (lvl.isLexiconLevel && !CORE_PATH_GLOSSES.includes(selectedItem?.label));

                    return (
                      <div
                        key={lvl.id}
                        className={`rounded-xl border-2 transition-all overflow-hidden ${
                          hasSelectedSign
                            ? 'border-zinc-900 bg-white shadow-cartoon-sm'
                            : 'border-zinc-200 bg-[#EAF6E8]'
                        }`}
                      >
                        {/* Level Accordion Header */}
                        <button
                          onClick={() => setExpandedLevelId(isExpanded ? null : lvl.id)}
                          className="w-full p-2.5 sm:p-3 flex items-center justify-between gap-2.5 text-left hover:bg-zinc-50 transition-colors"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div
                              className="w-8 h-8 rounded-lg border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm"
                              style={{ backgroundColor: lvl.accentColor }}
                            >
                              {renderLevelIcon(lvl.icon)}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-sm sm:text-base text-zinc-900 truncate">
                                  Level {lvl.levelNumber}: {lvl.title}
                                </span>
                                {isLevelComplete && (
                                  <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#58CC02] text-white">
                                    Complete ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-zinc-600 font-semibold truncate">
                                {lvl.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-mono text-xs font-black text-zinc-700 bg-white px-2 py-0.5 rounded border border-zinc-200">
                              {stats ? `${stats.mastered}/${stats.total}` : '0%'}
                            </span>
                            {isExpanded ? (
                              <ChevronDown className="w-4 h-4 text-zinc-500" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-zinc-500" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Level Content */}
                        {isExpanded && (
                          <div className="p-2.5 border-t border-zinc-200 bg-white space-y-2">
                            <p className="text-xs sm:text-sm text-zinc-700 font-medium p-2.5 bg-[#EAF6E8] rounded-lg border border-zinc-100">
                              {lvl.description}
                            </p>

                            {/* Sign Items inside Level */}
                            {!lvl.isLexiconLevel ? (
                              <div className="space-y-1.5 pt-1">
                                {lvl.glosses.map((gloss, idx) => {
                                  const item = getLearnItemByLabel(gloss);
                                  if (!item) return null;
                                  const isSelected = selectedItem?.id === item.id;
                                  const isMastered = masteredSet?.has(item.label) || masteredSet?.has(item.label.replace(/_/g, ' '));
                                  const isStartSign = lvl.startSign === item.label;

                                  return (
                                    <button
                                      key={`${item.id}-${idx}`}
                                      onClick={() => handleSelectAndClose(item)}
                                      className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                                        isSelected
                                          ? 'bg-[#FFC800] border-zinc-900 shadow-cartoon-sm'
                                          : 'bg-[#EAF6E8] border-zinc-200 hover:border-zinc-900 hover:bg-white'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="font-mono text-[10px] font-bold text-zinc-400 w-5 text-right flex-shrink-0">
                                          #{idx + 1}
                                        </span>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-black text-sm sm:text-base text-zinc-900 truncate">
                                              {item.name}
                                            </span>
                                            {item.image?.endsWith('.gif') && (
                                              <span className="cartoon-badge !py-0 !px-1 text-[8px] bg-purple-100 text-purple-900 border border-purple-300 font-bold">
                                                GIF
                                              </span>
                                            )}
                                            {isStartSign && (
                                              <span className="cartoon-badge !py-0 !px-1 text-[8px] bg-amber-400 text-zinc-950 font-black">
                                                Start Sign
                                              </span>
                                            )}
                                            {isMastered && (
                                              <span className="cartoon-badge !py-0 !px-1 text-[8px] bg-[#58CC02] text-white">
                                                ✓ Mastered
                                              </span>
                                            )}
                                          </div>
                                          <span className="text-[10px] text-zinc-500 font-medium block truncate">
                                            {item.english}
                                          </span>
                                        </div>
                                      </div>

                                      <div className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                                        isSelected ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-400 border-zinc-300'
                                      }`}>
                                        <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                                      </div>
                                    </button>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="p-4 text-center bg-[#FAF8F5] rounded-xl border border-zinc-200 space-y-2.5">
                                <p className="text-xs text-zinc-700 font-medium leading-relaxed">
                                  Ready to explore all 1,025 vocabulary words across daily conversation, transit, grocery, health, and tech?
                                </p>
                                <button
                                  onClick={() => setViewMode('lexicon')}
                                  className="cartoon-btn cartoon-btn-primary !py-1.5 !px-4 text-xs font-bold"
                                >
                                  Open Full 1,000+ Lexicon
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* =========================================================================
                VIEW B: FULL 1,000+ LEXICON EXPLORER (Category pills & search)
                ========================================================================= */}
            {viewMode === 'lexicon' && (
              <>
                {/* Search Input & Quick Filter Pills */}
                <div className="p-3 border-b border-zinc-200 bg-white space-y-2.5 flex-shrink-0">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 stroke-[2.5]" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search 1,000+ signs or alphabet..."
                      className="cartoon-input !py-1.5 !pl-9 !pr-3 !text-xs w-full bg-[#FAF8F5]"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                    {categories.map(cat => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border ${
                          selectedCategory === cat.id
                            ? 'bg-[#FFC800] text-zinc-900 border-zinc-900 shadow-cartoon-sm'
                            : 'bg-zinc-100 text-zinc-600 border-zinc-300 hover:text-zinc-900'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Interactive Sign List */}
                <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                  {displayedItems.map((item, idx) => {
                    const isSelected = selectedItem?.id === item.id;
                    const isMastered = masteredSet?.has(item.label);

                    return (
                      <button
                        key={`${item.id}-${idx}`}
                        onClick={() => handleSelectAndClose(item)}
                        className={`w-full text-left p-2.5 rounded-xl border-2 transition-all flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#FFC800] border-zinc-900 shadow-cartoon-sm scale-[1.01]'
                            : 'bg-[#FAF8F5] border-zinc-200 hover:border-zinc-900 hover:bg-white'
                        }`}
                      >
                        {/* Thumbnail Preview */}
                        <div className="w-10 h-10 rounded-lg border border-zinc-900/30 overflow-hidden bg-white flex-shrink-0 shadow-sm flex items-center justify-center relative">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <Hand className="w-4 h-4 text-zinc-500 stroke-[1.8]" />
                          )}
                          {isMastered && (
                            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#58CC02] border border-zinc-900 flex items-center justify-center">
                              <Check className="w-2.5 h-2.5 text-white stroke-[3]" />
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-zinc-900 truncate">
                              {item.name}
                            </span>
                            <span className={`cartoon-badge !py-0 !px-1.5 text-[8px] uppercase ${
                              item.type === 'alphabet' ? 'bg-[#1CB0F6] text-zinc-900' : 'bg-white text-zinc-700'
                            }`}>
                              {item.type === 'alphabet' ? 'Letter' : item.category}
                            </span>
                            {isMastered && (
                              <span className="cartoon-badge !py-0 !px-1 text-[8px] bg-[#58CC02] text-white">
                                Mastered
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                            {item.english}
                          </p>
                        </div>

                        <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-400 border-zinc-300'
                        }`}>
                          <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                        </div>
                      </button>
                    );
                  })}

                  {displayedItems.length < filteredItems.length && (
                    <div className="pt-2 pb-1 text-center">
                      <button
                        onClick={() => setDisplayCount(prev => prev + 50)}
                        className="cartoon-btn bg-white hover:bg-zinc-100 text-zinc-900 border-2 border-zinc-900 px-3 py-2 text-xs font-extrabold shadow-cartoon-sm flex items-center justify-center gap-1.5 w-full"
                      >
                        <span>Show More Signs (+50 of {filteredItems.length - displayedItems.length} remaining)</span>
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  )}

                  {filteredItems.length === 0 && (
                    <div className="p-8 text-center text-zinc-400 font-medium text-xs">
                      No signs matching your search filter.
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
