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
  X
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

  // Teaching view mode: 'blueprint' (crisp vector teaching diagram) | 'demo' (animated motion demonstration) | 'database' (official ISLRTC / FDMSE portal links)
  const [teachingViewMode, setTeachingViewMode] = useState('blueprint');
  const [isDemoPaused, setIsDemoPaused] = useState(false);
  const [demoSpeed, setDemoSpeed] = useState('0.75x');

  // Grounded search terms for official Indian Sign Language databases
  const signSearchTerm = useMemo(() => {
    if (!selectedItem) return '';
    return selectedItem.english || selectedItem.name || selectedItem.label || '';
  }, [selectedItem]);

  const islPortalUrl = useMemo(() => {
    if (!signSearchTerm) return 'https://www.indiansignlanguage.org/';
    return `https://www.indiansignlanguage.org/?s=${encodeURIComponent(signSearchTerm)}`;
  }, [signSearchTerm]);

  const islrtcUrl = useMemo(() => {
    if (!signSearchTerm) return 'https://islrtc.nic.in/';
    return `https://www.youtube.com/results?search_query=${encodeURIComponent('ISLRTC ' + signSearchTerm + ' Indian Sign Language')}`;
  }, [signSearchTerm]);

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
    return ISL_LEARN_ITEMS.filter(item => {
      if (filterMasteredOnly && !masteredSet?.has(item.label)) {
        return false;
      }

      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'alphabet' ? item.type === 'alphabet' : item.category === selectedCategory);

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.label.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory, filterMasteredOnly, masteredSet]);

  const displayedItems = useMemo(() => {
    return filteredItems.slice(0, displayCount);
  }, [filteredItems, displayCount]);

  const categories = [
    { id: 'all', name: `All (${ISL_LEARN_ITEMS.length})` },
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
  ];

  // Derive evaluation metrics
  const score = evaluationResult?.matchScore || 0;
  const checklist = evaluationResult?.checklist || [];
  const primaryGuidance = evaluationResult?.primaryGuidance || 'Position yourself in front of the camera.';
  const isAligned = evaluationResult?.isPostureAligned || evaluationResult?.isMatched || false;

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
      <div className="w-full h-full flex flex-col gap-2.5 min-h-0 overflow-hidden">
        {/* Top Trigger Button: Click to Open Sign Academy Sidebar */}
        <button
          type="button"
          onClick={openAcademy}
          className="cartoon-btn bg-white hover:bg-[#FFF9E5] border-2 border-zinc-900 p-2 sm:p-2.5 rounded-xl shadow-cartoon-sm flex items-center justify-between gap-2 w-full transition-all group flex-shrink-0 cursor-pointer"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#FFC800] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-sm group-hover:scale-105 transition-transform">
              <BookOpen className="w-3.5 h-3.5 text-zinc-900 stroke-[2.2]" />
            </div>
            <div className="text-left min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-xs text-zinc-900">Sign Academy</span>
                <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#1CB0F6] text-zinc-900 font-bold border border-zinc-900">
                  1,000+ Signs
                </span>
              </div>
              <span className="text-[10px] text-zinc-500 font-medium block truncate">
                Click to open course & curriculum
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="cartoon-badge !py-0.5 !px-2 text-[10px] bg-[#58CC02] text-white font-bold flex items-center gap-1 border border-zinc-900">
              <Award className="w-3 h-3 text-white stroke-[2.5]" />
              {masteredSet ? masteredSet.size : 0} Mastered
            </span>
            <ChevronRight className="w-4 h-4 text-zinc-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </button>

        {/* 1. Upper Card: Selected Sign Guide & Biomechanical Blueprint */}
        {selectedItem && (
          <div className="cartoon-card bg-white p-3 flex flex-col gap-2 border-2 border-zinc-900 shadow-cartoon-sm flex-1 min-h-0 overflow-hidden justify-between">
            {/* Header: Level & Name */}
            <div className="flex items-start justify-between gap-2 flex-shrink-0">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono tracking-wider block">
                  Level {currentSignLevel.levelNumber} • {currentSignLevel.badge || currentSignLevel.title}
                </span>
                <h3 className="font-black text-sm sm:text-base text-zinc-900 leading-tight truncate mt-0.5">
                  {selectedItem.name} ({selectedItem.label})
                </h3>
              </div>
              <span className="cartoon-badge !py-0.5 !px-2 text-[10px] bg-[#1CB0F6] text-zinc-900 font-bold truncate max-w-[140px] flex-shrink-0 border border-zinc-900 shadow-sm">
                {selectedItem.english}
              </span>
            </div>

            {/* View Mode Segmented Switcher */}
            <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] rounded-lg border border-zinc-200 flex-shrink-0 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setTeachingViewMode('blueprint')}
                className={`flex-1 py-1 px-1.5 rounded transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                  teachingViewMode === 'blueprint'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="Strict Biomechanical Vector Guide"
              >
                <Crosshair className="w-3 h-3 stroke-[2.2]" />
                <span>Teaching Guide</span>
              </button>
              {selectedItem.image && (
                <button
                  type="button"
                  onClick={() => setTeachingViewMode('demo')}
                  className={`flex-1 py-1 px-1.5 rounded transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                    teachingViewMode === 'demo'
                      ? 'bg-zinc-900 text-white shadow-sm'
                      : 'text-zinc-600 hover:text-zinc-900'
                  }`}
                  title="Recorded Motion Demonstration"
                >
                  <Play className="w-3 h-3 stroke-[2.2]" />
                  <span>Motion Demo</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setTeachingViewMode('database')}
                className={`flex-1 py-1 px-1.5 rounded transition-all text-center flex items-center justify-center gap-1 cursor-pointer ${
                  teachingViewMode === 'database'
                    ? 'bg-zinc-900 text-white shadow-sm'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="Official Indian Sign Language Database (ISLRTC & indiansignlanguage.org)"
              >
                <Globe className="w-3 h-3 stroke-[2.2]" />
                <span>ISL Database</span>
              </button>
            </div>

            {/* Visual Area: Multi-Mode Authentic Demonstration Area */}
            <div className="w-full flex-1 min-h-[140px] max-h-[220px] bg-white rounded-xl border-2 border-zinc-900 shadow-cartoon-sm flex items-center justify-center overflow-hidden p-2 relative group flex-shrink-0">
              {teachingViewMode === 'blueprint' ? (
                hasSvgIllustration(selectedItem.id || selectedItem.label) ? (
                  <div className="w-full h-full flex flex-col items-center justify-center relative">
                    <SignSvgIllustration
                      signId={selectedItem.id || selectedItem.label}
                      className="w-full h-full max-h-[160px] object-contain"
                    />
                    <div className="absolute top-2 left-2 bg-zinc-900/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#58CC02]" />
                      Authentic ISL Vector Blueprint
                    </div>
                  </div>
                ) : selectedItem.image ? (
                  <img
                    src={selectedItem.image}
                    alt={`${selectedItem.name} demonstration`}
                    className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-zinc-700 gap-1.5 w-full text-center px-2">
                    <div className="w-11 h-11 rounded-full bg-[#FFC800] border-2 border-zinc-900 flex items-center justify-center text-zinc-900 shadow-cartoon-sm">
                      <Hand className="w-5 h-5 stroke-[2]" />
                    </div>
                    <div className="text-xs sm:text-sm font-extrabold text-zinc-900">
                      {selectedItem.blueprint?.requiredFingers || 'Clear handshape'}
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">
                      Zone: {selectedItem.blueprint?.zone || 'Mid-chest level'}
                    </div>
                  </div>
                )
              ) : teachingViewMode === 'demo' && selectedItem.image ? (
                <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
                  <img
                    src={selectedItem.image}
                    alt={`${selectedItem.name} demonstration`}
                    className={`w-full h-full object-contain rounded-lg transition-all ${
                      isDemoPaused ? 'opacity-50 grayscale-[30%]' : ''
                    }`}
                    loading="lazy"
                  />
                  {/* Demonstration Controls Overlay */}
                  <div className="absolute top-2 right-2 flex items-center gap-1 bg-zinc-900/85 backdrop-blur-sm px-2 py-1 rounded-md text-white text-[9px] font-mono shadow-sm">
                    <button
                      type="button"
                      onClick={() => setIsDemoPaused(!isDemoPaused)}
                      className="px-1.5 py-0.5 rounded hover:bg-zinc-800 flex items-center gap-1 font-bold cursor-pointer"
                      title={isDemoPaused ? 'Resume playback' : 'Pause at keyframe'}
                    >
                      {isDemoPaused ? <Play className="w-2.5 h-2.5 fill-current" /> : <Pause className="w-2.5 h-2.5 fill-current" />}
                      <span>{isDemoPaused ? 'Resume' : 'Pause'}</span>
                    </button>
                    <span className="text-zinc-500">|</span>
                    <button
                      type="button"
                      onClick={() => setDemoSpeed(prev => prev === '0.5x' ? '0.75x' : prev === '0.75x' ? '1.0x' : '0.5x')}
                      className="px-1 py-0.5 rounded hover:bg-zinc-800 font-extrabold text-[#FFC800] cursor-pointer"
                      title="Toggle teaching speed"
                    >
                      {demoSpeed} Pace
                    </button>
                  </div>
                  <div className="absolute top-2 left-2 bg-zinc-900/90 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1.5 pointer-events-none">
                    <span className={`w-1.5 h-1.5 rounded-full ${isDemoPaused ? 'bg-amber-400' : 'bg-[#58CC02] animate-pulse'}`} />
                    {isDemoPaused ? 'Paused for Posture Alignment' : 'Demonstration Pace'}
                  </div>
                </div>
              ) : (
                /* Official ISL Database Card */
                <div className="w-full h-full p-2.5 flex flex-col justify-between bg-gradient-to-b from-blue-50/70 to-white text-zinc-900">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-blue-900 font-extrabold text-xs">
                      <Globe className="w-3.5 h-3.5 stroke-[2.5]" />
                      <span>Official ISL Teaching Databases</span>
                    </div>
                    <p className="text-[10px] text-zinc-600 leading-tight">
                      Standardized video demonstrations recorded by native Deaf educators:
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-1.5 my-1">
                    <a
                      href={islPortalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border-2 border-zinc-900 bg-[#FAF8F5] hover:bg-amber-100 transition-all flex items-center justify-between text-zinc-900 shadow-sm group"
                    >
                      <div className="min-w-0">
                        <div className="font-extrabold text-[11px] flex items-center gap-1 text-zinc-900">
                          <span>ISL Portal</span>
                          <span className="text-[9px] font-mono text-zinc-500 font-normal">(FDMSE RKMVERI)</span>
                        </div>
                        <div className="text-[9px] text-zinc-500 truncate">
                          Search "{selectedItem.name}" slow video loop
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-zinc-700 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </a>

                    <a
                      href={islrtcUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 rounded-lg border-2 border-zinc-900 bg-[#FAF8F5] hover:bg-red-50 transition-all flex items-center justify-between text-zinc-900 shadow-sm group"
                    >
                      <div className="min-w-0">
                        <div className="font-extrabold text-[11px] flex items-center gap-1 text-zinc-900">
                          <span>ISLRTC National Standard</span>
                          <span className="text-[9px] font-mono text-red-600 font-normal">Govt of India</span>
                        </div>
                        <div className="text-[9px] text-zinc-500 truncate">
                          Official Ministry Deaf instructor video
                        </div>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 text-red-600 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </a>
                  </div>

                  <div className="text-[9px] text-zinc-500 bg-white p-1 rounded border border-zinc-200 text-center font-mono">
                    Grounded in ISLRTC National Curriculum & AI4Bharat
                  </div>
                </div>
              )}
            </div>

            {/* Easy-Going Step-by-Step Motion / Posture Execution Description */}
            <div className="bg-[#FAF8F5] p-2.5 rounded-xl border border-zinc-200 text-xs text-zinc-700 leading-relaxed font-medium flex-shrink-0 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-900 border-b border-zinc-200/80 pb-1">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500 stroke-[2.5]" />
                  <span>Easy-Going Sign Guide</span>
                </span>
                <a
                  href={islPortalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:underline flex items-center gap-0.5 text-[9px] font-mono font-bold"
                  title="Open official Indian Sign Language Portal entry"
                >
                  <span>ISL Portal ↗</span>
                </a>
              </div>

              <div className="text-[11px] text-zinc-800 leading-snug">
                {selectedItem.description}
              </div>

              {selectedItem.tip && (
                <div className="text-[10px] font-semibold text-[#16A34A] bg-[#EDFDF2] px-2 py-1 rounded-md border border-green-200 flex items-center gap-1">
                  <span>💡</span>
                  <span>{selectedItem.tip}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Lower Card: Landmark Target Blueprint & Real-time Alignment Guide */}
        <div className="cartoon-card bg-white p-3 flex flex-col gap-2 flex-1 min-h-0 border-2 border-zinc-900 shadow-cartoon-sm overflow-hidden justify-between">
          {/* Header Row */}
          <div className="flex items-center justify-between border-b border-zinc-200 pb-1.5 flex-shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <div className="w-5 h-5 rounded-md bg-[#58CC02] flex items-center justify-center text-white border border-zinc-900/20 flex-shrink-0">
                <Crosshair className="w-3.5 h-3.5 stroke-[2.5]" />
              </div>
              <span className="font-extrabold text-xs text-zinc-900 truncate">
                {selectedItem?.isCompound && selectedItem?.steps?.[activeStepIndex]
                  ? selectedItem.steps[activeStepIndex].title
                  : 'Landmark Target Blueprint'}
              </span>
            </div>

            <div className="flex items-center gap-1 font-mono text-[10px] font-extrabold flex-shrink-0">
              <span className="text-zinc-500">Match:</span>
              <span className={`px-1.5 py-0.5 rounded border border-zinc-900/30 ${
                score >= 75 ? 'bg-[#58CC02] text-white' : score >= 40 ? 'bg-[#FFC800] text-zinc-900' : 'bg-zinc-200 text-zinc-700'
              }`}>
                {score}%
              </span>
            </div>
          </div>

          {/* Repetition Goal: Complete 3 Times to Pass */}
          <div className="bg-[#FAF8F5] p-2 rounded-xl border border-zinc-200 flex items-center justify-between gap-2 flex-shrink-0">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[9px] font-black uppercase text-zinc-600 font-mono">
                Pass Goal:
              </span>
              <div className="flex items-center gap-1">
                {Array.from({ length: targetReps }).map((_, i) => (
                  <span
                    key={i}
                    className={`px-1.5 py-0.5 rounded text-[10px] font-black border transition-all ${
                      successfulReps > i
                        ? 'bg-[#58CC02] text-white border-zinc-900'
                        : 'bg-white text-zinc-400 border-zinc-300'
                    }`}
                  >
                    {successfulReps > i ? `✓ ${i + 1}` : `${i + 1}/${targetReps}`}
                  </span>
                ))}
              </div>
            </div>
            {onResetPractice && (
              <button
                type="button"
                onClick={onResetPractice}
                className="cartoon-btn !py-0.5 !px-2 text-[10px] font-bold bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-900 shadow-sm flex items-center gap-1 cursor-pointer flex-shrink-0"
                title="Reset repetitions and try again"
              >
                <RotateCcw className="w-3 h-3 stroke-[2.2]" />
                <span>Try Again</span>
              </button>
            )}
          </div>

          {/* Compound Sign Multi-Step Mini Progress Indicator */}
          {selectedItem?.isCompound && selectedItem?.steps && (
            <div className="flex items-center gap-1 p-1 bg-[#FAF8F5] rounded-lg border border-zinc-200 flex-shrink-0">
              {selectedItem.steps.map((st, idx) => {
                const isDone = completedSteps.includes(idx);
                const isCur = idx === activeStepIndex;
                return (
                  <div
                    key={st.id}
                    className={`flex-1 text-center py-1 px-1.5 rounded text-[9px] font-bold border transition-all ${
                      isDone
                        ? 'bg-[#58CC02] text-white border-zinc-900'
                        : isCur
                        ? 'bg-[#FFC800] text-zinc-900 border-zinc-900 shadow-cartoon-sm animate-pulse'
                        : 'bg-white text-zinc-400 border-zinc-200'
                    }`}
                  >
                    {isDone ? '✔ ' : `${idx + 1}. `}{st.title.split(':')[1]?.trim() || st.title}
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic Match Score Progress Bar */}
          <div className="space-y-1 flex-shrink-0">
            <div className="w-full h-2.5 bg-zinc-100 rounded-full border border-zinc-300 overflow-hidden relative">
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  score >= 75 ? 'bg-[#58CC02]' : score >= 40 ? 'bg-[#FFC800]' : 'bg-zinc-400'
                }`}
                style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
              />
            </div>
            <div className="flex justify-between text-[9px] font-bold text-zinc-400 font-mono">
              <span>0% (Idle)</span>
              <span>Target: 75%+</span>
              <span>100% (Perfect)</span>
            </div>
          </div>

          {/* Real-time Guidance Message Box */}
          <div className={`p-2 rounded-xl border-2 flex items-start gap-2 flex-shrink-0 ${
            isAligned
              ? 'bg-[#EBFDF0] border-[#58CC02] text-[#15803D]'
              : score > 30
              ? 'bg-[#FEFCE8] border-[#EAB308] text-[#854D0E]'
              : 'bg-zinc-50 border-zinc-300 text-zinc-700'
          }`}>
            {isAligned ? (
              <CheckCircle2 className="w-4 h-4 text-[#58CC02] flex-shrink-0 mt-0.5 stroke-[2.5]" />
            ) : (
              <Compass className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-bold block leading-snug">
                {primaryGuidance}
              </span>
            </div>
          </div>

          {/* Biomechanical Target Landmark Checklist */}
          <div className="space-y-1 overflow-y-auto flex-1 min-h-0 pr-1">
            {checklist.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-1.5 rounded-lg bg-[#FAF8F5] border border-zinc-200 text-[10px]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                    item.status === 'pass'
                      ? 'bg-[#58CC02] text-white'
                      : item.status === 'warn'
                      ? 'bg-[#FFC800] text-zinc-900'
                      : 'bg-zinc-200 text-zinc-500'
                  }`}>
                    {item.status === 'pass' ? '✓' : '!'}
                  </span>
                  <span className="font-bold text-zinc-800 truncate">
                    {item.label}
                  </span>
                </div>
                <span className="font-mono text-zinc-500 font-medium truncate ml-1 flex-shrink-0">
                  {item.current}
                </span>
              </div>
            ))}
          </div>

          {/* Target Specs Summary */}
          {selectedItem?.blueprint && (
            <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500 font-mono flex-shrink-0">
              <span className="truncate">Zone: {selectedItem.blueprint.zone || 'Mid-chest level (Y: 0.42 - 0.70)'}</span>
              <span className="text-zinc-400 flex-shrink-0 ml-1">ISL Standard</span>
            </div>
          )}
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
          <div className="relative z-10 w-full max-w-[480px] sm:max-w-[520px] h-full bg-[#FAF8F5] border-r-2 border-zinc-900 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-left duration-200">
            {/* Header with Title, Mastered count & Close Button */}
            <div className="px-4 py-3 border-b-2 border-zinc-900 bg-white flex items-center justify-between gap-3 flex-shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-[#FFC800] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
                  <BookOpen className="w-4 h-4 text-zinc-900 stroke-[2.2]" />
                </div>
                <div className="min-w-0">
                  <h2 className="font-black text-base text-zinc-900 leading-tight">
                    Sign Academy
                  </h2>
                  <p className="text-[10px] text-zinc-500 font-medium truncate">
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
            <div className="p-3 border-b border-zinc-200 bg-[#FAF8F5] flex-shrink-0">
              <div className="grid grid-cols-2 gap-1.5 bg-[#F4EFEA] p-1 rounded-xl border border-zinc-300">
                <button
                  onClick={() => setViewMode('course')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
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
                  className={`py-1.5 px-2 rounded-lg text-xs font-black flex items-center justify-center gap-1.5 transition-all ${
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
                  <div className="p-3 rounded-xl bg-[#FFF9E5] border-2 border-zinc-900 shadow-cartoon-sm flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#EAB308] animate-ping" />
                        <span className="text-[10px] font-mono font-bold uppercase text-amber-900">
                          Recommended Next Step
                        </span>
                      </div>
                      <div className="font-extrabold text-sm text-zinc-900 truncate mt-0.5">
                        {nextRecommendedItem.name} ({nextRecommendedItem.label})
                      </div>
                      <p className="text-xs text-zinc-600 truncate">
                        {nextRecommendedItem.english}
                      </p>
                    </div>

                    <button
                      onClick={() => handleSelectAndClose(nextRecommendedItem)}
                      className="cartoon-btn cartoon-btn-primary !py-1.5 !px-3 text-xs font-bold flex items-center gap-1.5 flex-shrink-0"
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
                            : 'border-zinc-200 bg-[#FAF8F5]'
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
                                <span className="font-black text-xs sm:text-sm text-zinc-900 truncate">
                                  Level {lvl.levelNumber}: {lvl.title}
                                </span>
                                {isLevelComplete && (
                                  <span className="cartoon-badge !py-0 !px-1 text-[8px] bg-[#58CC02] text-white">
                                    Complete ✓
                                  </span>
                                )}
                              </div>
                              <p className="text-[10px] text-zinc-500 font-medium truncate">
                                {lvl.subtitle}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className="font-mono text-[10px] font-bold text-zinc-600 bg-white px-2 py-0.5 rounded border border-zinc-200">
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
                            <p className="text-[11px] text-zinc-600 font-medium p-2 bg-[#FAF8F5] rounded-lg border border-zinc-100">
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
                                      key={item.id}
                                      onClick={() => handleSelectAndClose(item)}
                                      className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                                        isSelected
                                          ? 'bg-[#FFC800] border-zinc-900 shadow-cartoon-sm'
                                          : 'bg-[#FAF8F5] border-zinc-200 hover:border-zinc-900 hover:bg-white'
                                      }`}
                                    >
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        <span className="font-mono text-[9px] font-bold text-zinc-400 w-5 text-right flex-shrink-0">
                                          #{idx + 1}
                                        </span>
                                        <div className="min-w-0">
                                          <div className="flex items-center gap-1.5">
                                            <span className="font-extrabold text-xs text-zinc-900 truncate">
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
                  {displayedItems.map(item => {
                    const isSelected = selectedItem?.id === item.id;
                    const isMastered = masteredSet?.has(item.label);

                    return (
                      <button
                        key={item.id}
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
