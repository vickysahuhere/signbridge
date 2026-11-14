import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { HomePage } from './components/HomePage.jsx';
import { Navbar } from './components/Navbar.jsx';
import { SignerStage } from './components/SignerStage.jsx';
import { LiveGlossBar } from './components/LiveGlossBar.jsx';
import { ChatPanel } from './components/ChatPanel.jsx';
import { LearnSidebar } from './components/LearnSidebar.jsx';
import { LearnStage } from './components/LearnStage.jsx';
import { TeachStage } from './components/TeachStage.jsx';
import { TestStage } from './components/TestStage.jsx';
import { MobileBottomNav } from './components/MobileBottomNav.jsx';
import { MovableChatbotLauncher } from './components/MovableChatbotLauncher.jsx';
import { useCustomSigns } from './teach/customSignStore.js';
import { useCustomSignMatcher } from './teach/useCustomSignMatcher.js';
import { LearnGuessPanel } from './components/LearnGuessPanel.jsx';
import { KeypointRecorderDrawer } from './components/KeypointRecorderDrawer.jsx';
import { WordDictionaryModal } from './components/WordDictionaryModal.jsx';
import { AboutModal } from './components/AboutModal.jsx';
import { HowItWorksModal } from './components/HowItWorksModal.jsx';
import { FeedbackModal } from './components/FeedbackModal.jsx';
import { captureDOMScreenshot } from './utils/screenshotCapture.js';
import { useVisionWorker } from './hooks/useVisionWorker.js';
import { useCall } from './call/useCall.js';
import { readCodeFromUrl, formatCallCode } from './call/callCode.js';
import { CallLobby } from './components/CallLobby.jsx';
import { GlossBufferManager } from './nlp/glossBufferManager.js';
import { formatIslSentence, formatRawGlosses } from './nlp/islSentenceFormatter.js';
import { ISL_LEARN_ITEMS, getLearnItemByLabel } from './ai/islTargetLandmarks.js';
import { getNextRecommendedSign } from './ai/islCourseCurriculum.js';
import { AlertCircle, Video, Compass, Sparkles } from 'lucide-react';
import { HomeChatbotPopup } from './components/HomeChatbotPopup.jsx';
import { ErrorBoundary } from './components/ErrorBoundary.jsx';

export function App() {
  const [fps, setFps] = useState(0);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('page') || params.get('mode');
      if (readCodeFromUrl(window.location.search) || p === 'chat') return 'chat';
      if (p === 'learn') return 'learn';
      if (p === 'teach') return 'teach';
      if (p === 'test') return 'test';
    }
    return 'home'; // Home page is default when no room or mode param is given
  });
  const [recognitionMode, setRecognitionMode] = useState('word'); // 'alphabet' | 'word'
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackScreenshot, setFeedbackScreenshot] = useState(null);
  const [isCapturingScreenshot, setIsCapturingScreenshot] = useState(false);
  const [mobileTab, setMobileTab] = useState('stage'); // 'stage' | 'chat'
  const [mobileLearnTab, setMobileLearnTab] = useState('stage'); // 'stage' | 'guide'
  const [isAcademyOpen, setIsAcademyOpen] = useState(false);

  // Learn Mode State: Selected Sign, Mastered Counter & Posture Evaluation (Starts at Level 1: NAMASTE)
  const [selectedLearnItem, setSelectedLearnItem] = useState(() => getLearnItemByLabel('NAMASTE') || ISL_LEARN_ITEMS[0]);
  const [masteredCount, setMasteredCount] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sanket_mastered_signs');
        if (saved) {
          const parsed = JSON.parse(saved);
          return Array.isArray(parsed) ? parsed.length : 0;
        }
      } catch (e) {}
    }
    return 0;
  });
  const masteredSetRef = useRef(new Set());

  // Restore mastered signs on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sanket_mastered_signs');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          masteredSetRef.current = new Set(parsed);
          setMasteredCount(masteredSetRef.current.size);
        }
      }
    } catch (e) {}
  }, []);
  // Auto-open guide for first-time visitors or after clearing cache / ?guide=true
  const [isGuideOpen, setIsGuideOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const params = new URLSearchParams(window.location.search);
        if (params.get('guide') === 'true' || window.location.hash === '#guide') {
          return true;
        }
        const hasSeen = localStorage.getItem('sanket_has_seen_guide');
        const skip = localStorage.getItem('sanket_skip_guide_auto');
        return false;
      } catch (e) {
        return false;
      }
    }
    return false;
  });

  // Linguistic Buffer State
  const glossBufferRef = useRef(new GlossBufferManager());
  const [glosses, setGlosses] = useState([]);
  const [localCommittedSentences, setLocalCommittedSentences] = useState([]);

  // Stabilized candidates with decay hold time so they don't disappear immediately
  const [persistedCandidates, setPersistedCandidates] = useState([]);
  const [isCandidateLive, setIsCandidateLive] = useState(false);
  const candidateTimeoutRef = useRef(null);
  const liveTimeoutRef = useRef(null);
  const isInteractingWithCandidatesRef = useRef(false);
  const [localStream, setLocalStream] = useState(null);

  // 1. Code-based call (host creates a code, guest joins with it)
  const [userName, setUserNameState] = useState(() => {
    try {
      const saved = sessionStorage.getItem('sanket_user_name');
      if (saved) return saved;
    } catch {}
    return `Guest ${Math.floor(1000 + Math.random() * 9000)}`;
  });
  const setUserName = useCallback((name) => {
    const n = (name || '').trim().slice(0, 24);
    setUserNameState(n || 'Guest');
    try { sessionStorage.setItem('sanket_user_name', n); } catch {}
  }, []);
  const [teachWord, setTeachWord] = useState('');
  const [pendingJoinCode, setPendingJoinCode] = useState(() =>
    typeof window !== 'undefined' ? readCodeFromUrl(window.location.search) : ''
  );
  const call = useCall({ userName, localStream });
  const {
    phase: callPhase,
    code: roomId,
    peerPresence,
    connectionMode,
    rttMs,
    remoteStream,
    incomingPartialSigning,
    incomingMessages,
    latestIncomingReply,
    sendPartialSigning,
    sendCommittedSentence,
    sendTextReply
  } = call;
  const inCall = callPhase === 'connected';

  const handlePageChange = useCallback((id) => {
    if (inCall && id !== 'chat') {
      if (!window.confirm('Leave the call?')) return;
      call.leave();
    }
    if (!inCall && id !== 'chat' && callPhase !== 'idle') call.leave();
    setCurrentPage(id);
  }, [inCall, callPhase, call]);

  // 3. Vision Worker AI Tracking
  const {
    isWorkerReady,
    workerStatus,
    workerLatencyMs,
    latestLandmarks,
    latestNormalizedFeatures,
    alphabetPredictions: heuristicLetters,
    latestConfirmedLetter: heuristicConfirmedLetter,
    wordPredictions: heuristicWords,
    latestConfirmedWord: heuristicConfirmedWord,
    motionState,
    bufferSize,
    workerError,
    profilingData,
    sendFrame,
    configureGate
  } = useVisionWorker();
  const [commitPauseMs, setCommitPauseMs] = useState(700);

  const handlePauseChange = useCallback((newPauseMs) => {
    setCommitPauseMs(newPauseMs);
    configureGate({ commitDurationMs: newPauseMs });
  }, [configureGate]);

  const handleFrame = useCallback((videoElement, timestamp) => {
    sendFrame(videoElement, timestamp, recognitionMode);
  }, [sendFrame, recognitionMode]);


  // Recognition: matches live frames against the signs you have trained (Teach tab).
  const customSigns = useCustomSigns();
  const isLetter = (w) => /^[A-Z]$/.test(w);
  const matchState = useCustomSignMatcher({
    features: latestNormalizedFeatures,
    signs: customSigns,
    enabled: currentPage === 'chat' || currentPage === 'learn',
    kind: recognitionMode === 'alphabet' ? 'letters' : 'words',
    onConfirm: (word) => {
      if (currentPage !== 'chat') return;
      const letter = isLetter(word);
      if ((recognitionMode === 'alphabet') !== letter) return;
      if (glossBufferRef.current.push(word.replace(/_/g, ' '), letter ? 'letter' : 'word')) {
        setGlosses([...glossBufferRef.current.getGlosses()]);
      }
    }
  });
  const toCandidates = (list) =>
    list.slice(0, 3).map((r) => ({ label: r.word.replace(/_/g, ' '), confidence: Math.max(0.05, Math.min(0.99, 1 - r.ratio * 0.45)), key: r.word }));
  // Trained (kNN) candidates first, then the built-in ISL engine (1000+ sign vocabulary).
  const mergeCands = (trained, engine) => {
    const seen = new Set();
    const out = [];
    for (const c of [...trained, ...(engine || [])]) {
      const k = (c.label || '').toUpperCase().replace(/[_\s]+/g, ' ');
      if (!k || seen.has(k)) continue;
      seen.add(k);
      out.push(c);
    }
    return out.slice(0, 4);
  };
  const wordPredictions = useMemo(
    () => ({
      topCandidates: mergeCands(
        toCandidates(matchState.ranking.filter((r) => !isLetter(r.word) && r.ratio < 1.6)),
        (heuristicWords?.topCandidates || []).filter((c) => !c.isAlphabetHint && !/^[A-Z]$/.test(c.label?.trim()))
      ),
      confirmedWord: null
    }),
    [matchState, heuristicWords]
  );
  const alphabetPredictions = useMemo(
    () => mergeCands(
      toCandidates(matchState.ranking.filter((r) => isLetter(r.word) && r.ratio < 1.6)),
      (heuristicLetters || []).filter((c) => /^[A-Z]$/.test(c.label?.trim()))
    ),
    [matchState, heuristicLetters]
  );
  const latestConfirmedWord = null;

  // Engine-confirmed signs go into the call sentence too (trained signs confirm via the matcher above).
  useEffect(() => {
    if (currentPage !== 'chat' || recognitionMode !== 'word' || !heuristicConfirmedWord) return;
    const w = typeof heuristicConfirmedWord === 'object' ? heuristicConfirmedWord.word : heuristicConfirmedWord;
    if (w && !/^[A-Z]$/.test(w.trim()) && glossBufferRef.current.push(w, 'word')) {
      setGlosses([...glossBufferRef.current.getGlosses()]);
    }
  }, [currentPage, recognitionMode, heuristicConfirmedWord]);
  useEffect(() => {
    if (currentPage !== 'chat' || recognitionMode !== 'alphabet' || !heuristicConfirmedLetter) return;
    const l = typeof heuristicConfirmedLetter === 'object' ? heuristicConfirmedLetter.letter : heuristicConfirmedLetter;
    if (l && glossBufferRef.current.push(l, 'letter')) {
      setGlosses([...glossBufferRef.current.getGlosses()]);
    }
  }, [currentPage, recognitionMode, heuristicConfirmedLetter]);

  // Stabilize candidate predictions (hold for 3.5s so signs don't disappear immediately)
  useEffect(() => {
    let rawList = [];
    if (recognitionMode === 'word') {
      // Strictly filter out any single letters or hints in word mode
      const validCandidates = (wordPredictions?.topCandidates || []).filter(
        c => !c.isAlphabetHint && !/^[A-Z]$/.test(c.label?.trim())
      );
      if (validCandidates.length > 0) {
        rawList = validCandidates;
      }
    } else {
      // In alphabet mode, strictly keep single letter predictions
      rawList = (alphabetPredictions || []).filter(
        c => /^[A-Z]$/.test(c.label?.trim())
      );
    }

    if (rawList && rawList.length > 0) {
      if (candidateTimeoutRef.current) clearTimeout(candidateTimeoutRef.current);
      if (liveTimeoutRef.current) clearTimeout(liveTimeoutRef.current);

      setPersistedCandidates(rawList);
      setIsCandidateLive(true);

      liveTimeoutRef.current = setTimeout(() => {
        setIsCandidateLive(false);
      }, 700);

      candidateTimeoutRef.current = setTimeout(() => {
        if (!isInteractingWithCandidatesRef.current) {
          setPersistedCandidates([]);
        }
      }, 4500);
    }
  }, [wordPredictions, alphabetPredictions, recognitionMode]);

  // Reset candidates if recognition mode changes
  useEffect(() => {
    if (candidateTimeoutRef.current) clearTimeout(candidateTimeoutRef.current);
    if (liveTimeoutRef.current) clearTimeout(liveTimeoutRef.current);
    setPersistedCandidates([]);
    setIsCandidateLive(false);
  }, [recognitionMode]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (candidateTimeoutRef.current) clearTimeout(candidateTimeoutRef.current);
      if (liveTimeoutRef.current) clearTimeout(liveTimeoutRef.current);
    };
  }, []);

  // Candidate selection / tap handler
  const handleSelectCandidate = useCallback((candidateLabel, action = 'smart') => {
    if (!candidateLabel) return;
    const isSingleLetter = /^[A-Z]$/i.test(candidateLabel.trim());
    if (recognitionMode === 'word' && isSingleLetter) return;
    const type = (recognitionMode === 'alphabet' || isSingleLetter) ? 'letter' : 'word';

    if (action === 'replace') {
      glossBufferRef.current.replaceLast(candidateLabel, type);
    } else if (action === 'append') {
      glossBufferRef.current.push(candidateLabel, type);
    } else {
      const currentGlosses = glossBufferRef.current.getGlosses();
      if (currentGlosses.length > 0) {
        const lastGloss = currentGlosses[currentGlosses.length - 1];
        const isLastGlossInCandidates = persistedCandidates.some(c => c.label === lastGloss);

        if (isLastGlossInCandidates && lastGloss !== candidateLabel) {
          glossBufferRef.current.replaceLast(candidateLabel, type);
        } else {
          glossBufferRef.current.push(candidateLabel, type);
        }
      } else {
        glossBufferRef.current.push(candidateLabel, type);
      }
    }

    setGlosses([...glossBufferRef.current.getGlosses()]);
  }, [recognitionMode, persistedCandidates]);

  const handleDismissCandidates = useCallback(() => {
    if (candidateTimeoutRef.current) clearTimeout(candidateTimeoutRef.current);
    if (liveTimeoutRef.current) clearTimeout(liveTimeoutRef.current);
    setPersistedCandidates([]);
    setIsCandidateLive(false);
  }, []);

  const previewText = formatIslSentence(glosses);
  const rawPreviewText = formatRawGlosses(glosses);

  // Stream live partial signing tokens to remote partner in real time (NETW-04)
  const prevGlossesLenRef = useRef(0);
  useEffect(() => {
    if (glosses.length > 0 || previewText || prevGlossesLenRef.current > 0) {
      sendPartialSigning({ glosses, previewText, rawText: rawPreviewText });
    }
    prevGlossesLenRef.current = glosses.length;
  }, [glosses, previewText, rawPreviewText, sendPartialSigning]);

  // Commit sentence callback (LING-05)
  const handleCommit = useCallback(() => {
    const currentGlosses = glossBufferRef.current.getGlosses();
    if (currentGlosses.length === 0) return;

    const formattedText = formatIslSentence(currentGlosses);
    const rawText = formatRawGlosses(currentGlosses);
    const newSentence = {
      id: Date.now(),
      glosses: [...currentGlosses],
      text: formattedText,
      rawText: rawText,
      autoGrammar: formattedText,
      sender: userName,
      senderRole: 'peer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLocalCommittedSentences(prev => [newSentence, ...prev]);
    sendCommittedSentence(newSentence);
    glossBufferRef.current.clear();
    setGlosses([]);
    setPersistedCandidates([]);
  }, [userName, sendCommittedSentence]);

  // Automatic commit on 1.2s pause completion (IDLE_COMMIT) - Hands-free for both word & alphabet modes
  useEffect(() => {
    if (motionState.state === 'IDLE_COMMIT' && glossBufferRef.current.size() > 0) {
      handleCommit();
    }
  }, [motionState.state, handleCommit]);

  // Manual editing actions (LING-02)
  const handleUndo = useCallback(() => {
    glossBufferRef.current.undo();
    setGlosses([...glossBufferRef.current.getGlosses()]);
  }, []);

  const handleClear = useCallback(() => {
    glossBufferRef.current.clear();
    setGlosses([]);
    setPersistedCandidates([]);
  }, []);

  const handleRemoveGloss = useCallback((index) => {
    glossBufferRef.current.removeAt(index);
    setGlosses([...glossBufferRef.current.getGlosses()]);
  }, []);

  // Step progression state for compound signs (e.g. Good Morning = Good -> Morning)
  const TARGET_REPETITIONS = 3;
  const [successfulReps, setSuccessfulReps] = useState(0);
  const repHoldTimerRef = useRef(null);
  const stepHoldTimerRef = useRef(null);
  const abortGraceTimerRef = useRef(null);
  const repAwaitingReleaseRef = useRef(false);
  const [activeStepIndex, setActiveStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [stepSuccessFlash, setStepSuccessFlash] = useState(null);
  const [isSequenceMastered, setIsSequenceMastered] = useState(false);
  const stepTimeoutRef = useRef(null);
  const flashTimerRef = useRef(null);
  const flashLater = useCallback((ms) => {
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    flashTimerRef.current = setTimeout(() => setStepSuccessFlash(null), ms);
  }, []);
  const [manualOk, setManualOk] = useState(false);

  // Reset practice repetitions, steps and mastery
  const handleResetPractice = useCallback(() => {
    setSuccessfulReps(0);
    setIsSequenceMastered(false);
    setActiveStepIndex(0);
    setCompletedSteps([]);
    setStepSuccessFlash({
      message: 'Practice reset! Sign 3 times to pass.'
    });
    flashLater(2000);
    if (repHoldTimerRef.current) clearTimeout(repHoldTimerRef.current);
    if (stepHoldTimerRef.current) clearTimeout(stepHoldTimerRef.current);
    if (abortGraceTimerRef.current) clearTimeout(abortGraceTimerRef.current);
    repHoldTimerRef.current = null;
    stepHoldTimerRef.current = null;
    abortGraceTimerRef.current = null;
    repAwaitingReleaseRef.current = false;
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
  }, []);

  // Reset steps, reps and sequence mastery when selected item changes
  useEffect(() => {
    setSuccessfulReps(0);
    setActiveStepIndex(0);
    setCompletedSteps([]);
    setStepSuccessFlash(null);
    setManualOk(false);
    if (flashTimerRef.current) clearTimeout(flashTimerRef.current);
    setIsSequenceMastered(false);
    if (repHoldTimerRef.current) clearTimeout(repHoldTimerRef.current);
    if (stepHoldTimerRef.current) clearTimeout(stepHoldTimerRef.current);
    if (abortGraceTimerRef.current) clearTimeout(abortGraceTimerRef.current);
    repHoldTimerRef.current = null;
    stepHoldTimerRef.current = null;
    abortGraceTimerRef.current = null;
    repAwaitingReleaseRef.current = false;
    if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
  }, [selectedLearnItem?.id]);

  // Real-time evaluation of posture against the target selected sign (or active step of compound sign)
  const postureEvaluation = useMemo(() => {
    if (!selectedLearnItem || !selectedLearnItem.evaluate) return null;
    return selectedLearnItem.evaluate(latestLandmarks, activeStepIndex);
  }, [selectedLearnItem, latestLandmarks, activeStepIndex]);

  const isCurrentStepAligned = Boolean(
    postureEvaluation?.isPostureAligned ||
    (postureEvaluation?.isMatched && (postureEvaluation?.matchScore ?? 100) >= 75)
  );

  // Check if live AI prediction matches active step or target with robust confidence
  const topCandidate = (recognitionMode === 'word' ? wordPredictions?.topCandidates?.[0] : alphabetPredictions?.[0]);
  const activeStepTarget = useMemo(() => {
    if (selectedLearnItem?.isCompound && selectedLearnItem?.steps?.[activeStepIndex]) {
      const step = selectedLearnItem.steps[activeStepIndex];
      return step.targetGloss || step.title?.replace(/^Part \d+:\s*/i, '').toUpperCase() || 'GOOD';
    }
    return selectedLearnItem?.label?.toUpperCase().replace(/_/g, ' ');
  }, [selectedLearnItem, activeStepIndex]);

  const isAiGuessMatch = Boolean(
    topCandidate && (
      topCandidate.label?.toUpperCase().replace(/_/g, ' ') === activeStepTarget ||
      (!selectedLearnItem?.isCompound && topCandidate.label?.toUpperCase().replace(/_/g, ' ') === selectedLearnItem?.label?.toUpperCase().replace(/_/g, ' '))
    ) &&
    topCandidate.confidence >= 0.78
  );

  const norm = (x) => (x || '').toUpperCase().replace(/[_\s]+/g, '_');
  const targetKey = norm(activeStepTarget);
  const trainedKey = Object.keys(customSigns).find((k) => norm(k) === targetKey);
  const learnUntrained = false;
  const trainedMatch = Boolean(trainedKey && matchState.best && norm(matchState.best.word) === norm(trainedKey));
  // Trained sign matches win; otherwise the built-in per-sign checker (1000+ signs) decides.
  const isStepSatisfied = trainedMatch || isCurrentStepAligned || isAiGuessMatch || manualOk;
  const handleManualPass = useCallback(() => {
    setManualOk(true);
    setTimeout(() => setManualOk(false), 900);
  }, []);

  // Feedback for the Learn sidebar, driven by the same matcher that decides pass/fail
  const learnEvaluation = useMemo(() => {
    const hasHands = Boolean(
      (latestLandmarks?.leftHandLandmarks?.length || 0) + (latestLandmarks?.rightHandLandmarks?.length || 0)
    );
    const pretty = (w) => (w || '').replace(/_/g, ' ');
    if (!selectedLearnItem) return null;
    if (!trainedKey) return postureEvaluation;
    const entry = matchState.ranking.find((r) => norm(r.word) === norm(trainedKey));
    if (!hasHands) {
      return { matchScore: 0, isMatched: false, isPostureAligned: false, primaryGuidance: 'Show your hand to the camera.' };
    }
    if (trainedMatch) {
      return { matchScore: Math.max(85, Math.round(100 * (1 - (entry?.ratio ?? 0.4) * 0.6))), isMatched: true, isPostureAligned: true, primaryGuidance: 'That is it. Hold it steady.' };
    }
    const score = entry ? Math.max(5, Math.min(80, Math.round(100 * (1 - entry.ratio * 0.6)))) : 5;
    const other = matchState.best?.word;
    return {
      matchScore: score,
      isMatched: false,
      isPostureAligned: false,
      primaryGuidance: other ? `That looks like ${pretty(other)}. Match the picture.` : 'Not quite. Copy the picture and hold it steady.'
    };
  }, [selectedLearnItem, trainedKey, trainedMatch, matchState, latestLandmarks, postureEvaluation]);

  // Multi-step compound state machine & 3-repetition mastery loop with asynchronous hold timer
  useEffect(() => {
    if (!selectedLearnItem) return;

    // If target repetitions already achieved, sign is mastered
    if (successfulReps >= TARGET_REPETITIONS) {
      return;
    }

    // Release hysteresis: If user just completed a rep, require relaxing/releasing posture before starting next rep
    if (repAwaitingReleaseRef.current) {
      if (!isStepSatisfied) {
        repAwaitingReleaseRef.current = false;
      }
      return;
    }

    // When posture drops: debounce cancellation by 120ms to absorb 1-frame camera noise
    if (!isStepSatisfied) {
      if (!abortGraceTimerRef.current && (repHoldTimerRef.current || stepHoldTimerRef.current)) {
        abortGraceTimerRef.current = setTimeout(() => {
          if (repHoldTimerRef.current) {
            clearTimeout(repHoldTimerRef.current);
            repHoldTimerRef.current = null;
          }
          if (stepHoldTimerRef.current) {
            clearTimeout(stepHoldTimerRef.current);
            stepHoldTimerRef.current = null;
          }
          abortGraceTimerRef.current = null;
        }, 120);
      }
      return;
    }

    // Posture is satisfied! Cancel any pending abort grace
    if (abortGraceTimerRef.current) {
      clearTimeout(abortGraceTimerRef.current);
      abortGraceTimerRef.current = null;
    }

    // 1. Non-compound signs: require steady hold of 500ms before registering repetition
    if (!selectedLearnItem.isCompound || !selectedLearnItem.steps) {
      if (!repHoldTimerRef.current) {
        repHoldTimerRef.current = setTimeout(() => {
          repHoldTimerRef.current = null;
          repAwaitingReleaseRef.current = true;

          setSuccessfulReps(prev => {
            const next = prev + 1;
            if (next >= TARGET_REPETITIONS) {
              setIsSequenceMastered(true);
              setStepSuccessFlash({
                isPass: true,
                repNumber: 3,
                message: `${selectedLearnItem.name.toUpperCase()} PASSED! 3 of 3 complete! Outstanding! 🌟`
              });
            } else {
              setStepSuccessFlash({
                isRep: true,
                repNumber: next,
                message: `Repetition ${next} of 3 complete! Relax hands and sign again! 👍`
              });
            }
            return next;
          });

          flashLater(2400);
        }, 500);
      }
      return;
    }

    // 2. Compound signs (e.g. Good Morning = Good -> Morning)
    const totalSteps = selectedLearnItem.steps.length;

    if (!stepHoldTimerRef.current) {
      stepHoldTimerRef.current = setTimeout(() => {
        stepHoldTimerRef.current = null;

        if (activeStepIndex < totalSteps - 1) {
          const finishedIdx = activeStepIndex;
          const nextIdx = activeStepIndex + 1;

          setCompletedSteps(prev => (prev.includes(finishedIdx) ? prev : [...prev, finishedIdx]));
          setStepSuccessFlash({
            stepNumber: finishedIdx + 1,
            title: selectedLearnItem.steps[finishedIdx].title,
            message: `PART ${finishedIdx + 1} LOCKED! Now perform Part ${nextIdx + 1}!`
          });
          setActiveStepIndex(nextIdx);

          flashLater(1800);

          // Grace period: User has 8 seconds to perform next step
          if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
          stepTimeoutRef.current = setTimeout(() => {
            setActiveStepIndex(0);
            setCompletedSteps([]);
            setStepSuccessFlash({
              isTimeout: true,
              message: 'Sequence reset: Start with Part 1 again.'
            });
            flashLater(2200);
          }, 8000);
        } else {
          // Final step of compound sign complete -> 1 full repetition complete!
          if (stepTimeoutRef.current) clearTimeout(stepTimeoutRef.current);
          repAwaitingReleaseRef.current = true;

          setSuccessfulReps(prev => {
            const next = prev + 1;
            if (next >= TARGET_REPETITIONS) {
              setCompletedSteps(prevSteps => (prevSteps.includes(activeStepIndex) ? prevSteps : [...prevSteps, activeStepIndex]));
              setIsSequenceMastered(true);
              setStepSuccessFlash({
                isPass: true,
                repNumber: 3,
                message: `${selectedLearnItem.name.toUpperCase()} PASSED! 3 of 3 complete! 🌟`
              });
            } else {
              setActiveStepIndex(0);
              setCompletedSteps([]);
              setStepSuccessFlash({
                isRep: true,
                repNumber: next,
                message: `Repetition ${next} of 3 complete! Now perform the full sequence again! 👍`
              });
            }
            return next;
          });

          flashLater(2400);
        }
      }, 500);
    }
  }, [isStepSatisfied, activeStepIndex, selectedLearnItem?.id, successfulReps]);

  const isSignMastered = isSequenceMastered && successfulReps >= TARGET_REPETITIONS;

  // Target skeleton for the active step (switches dynamically between steps in compound signs)
  const activeTargetSkeleton = useMemo(() => {
    if (selectedLearnItem?.isCompound && selectedLearnItem?.steps?.[activeStepIndex]) {
      return selectedLearnItem.steps[activeStepIndex].targetSkeleton;
    }
    return selectedLearnItem?.targetSkeleton;
  }, [selectedLearnItem, activeStepIndex]);

  // Track mastered signs streak & persist to local storage
  useEffect(() => {
    if (isSignMastered && selectedLearnItem?.label) {
      if (!masteredSetRef.current.has(selectedLearnItem.label)) {
        masteredSetRef.current.add(selectedLearnItem.label);
        setMasteredCount(masteredSetRef.current.size);
        try {
          localStorage.setItem('sanket_mastered_signs', JSON.stringify([...masteredSetRef.current]));
        } catch (e) {}
      }
    }
  }, [isSignMastered, selectedLearnItem]);

  const handleSelectLearnItem = useCallback((item) => {
    setSelectedLearnItem(item);
    if (item.type === 'alphabet' && recognitionMode !== 'alphabet') {
      setRecognitionMode('alphabet');
    } else if (item.type === 'word' && recognitionMode !== 'word') {
      setRecognitionMode('word');
    }
  }, [recognitionMode]);

  const handleNextSign = useCallback(() => {
    // Advance along the course path; never fall back to the first sign (that made Continue loop on Hello)
    const nextGloss = getNextRecommendedSign(selectedLearnItem?.label, masteredSetRef.current, ISL_LEARN_ITEMS);
    const clean = (nextGloss || '').trim().toUpperCase();
    const nextItem = ISL_LEARN_ITEMS.find((i) => i.label.toUpperCase() === clean || i.label.toUpperCase().replace(/\s+/g, '_') === clean.replace(/\s+/g, '_'));
    if (nextItem && nextItem.id !== selectedLearnItem?.id) {
      handleSelectLearnItem(nextItem);
    } else {
      const currentIndex = ISL_LEARN_ITEMS.findIndex(item => item.id === selectedLearnItem.id);
      const nextIndex = (currentIndex + 1) % ISL_LEARN_ITEMS.length;
      handleSelectLearnItem(ISL_LEARN_ITEMS[nextIndex]);
    }
  }, [selectedLearnItem, handleSelectLearnItem]);

  // Merge local committed sentences with remote messages
  const allMessages = [...localCommittedSentences, ...incomingMessages].reduce((acc, msg) => {
    if (!acc.some(m => m.id === msg.id)) {
      acc.push(msg);
    }
    return acc;
  }, []);

  // Diagnostic context bundle for issue reporting
  const feedbackContextData = useMemo(() => ({
    currentPage,
    recognitionMode,
    fps,
    workerStatus,
    workerLatencyMs,
    motionState,
    roomId,
    connectionMode,
    rttMs,
    recentGlosses: glosses,
    committedSentencesCount: localCommittedSentences.length
  }), [
    currentPage,
    recognitionMode,
    fps,
    workerStatus,
    workerLatencyMs,
    motionState,
    roomId,
    connectionMode,
    rttMs,
    glosses,
    localCommittedSentences.length
  ]);

  // Open feedback modal with an automatic instant snapshot of the active window
  const handleOpenFeedback = useCallback(async () => {
    setIsCapturingScreenshot(true);
    try {
      const dataUrl = await captureDOMScreenshot();
      setFeedbackScreenshot(dataUrl);
    } catch (err) {
      console.warn('[Feedback] Window screenshot capture skipped:', err);
      setFeedbackScreenshot(null);
    } finally {
      setIsCapturingScreenshot(false);
      setIsFeedbackOpen(true);
    }
  }, []);

  return (
    <div className="h-[100dvh] min-h-[100dvh] max-h-[100dvh] w-full flex flex-col bg-[#EDF7EC] text-zinc-900 font-sans overflow-hidden select-none pb-14 md:pb-0">
      {/* 1. Playful Minimal Navbar */}
      <Navbar
        currentPage={currentPage}
        onPageChange={handlePageChange}
        fps={fps}
        workerStatus={workerStatus}
        workerLatencyMs={workerLatencyMs}
        motionState={motionState}
        recognitionMode={recognitionMode}
        onToggleMode={setRecognitionMode}
        onOpenRecorder={() => setIsRecorderOpen(true)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
        onOpenAbout={() => setIsAboutOpen(true)}
        onOpenFeedback={handleOpenFeedback}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        callCode={inCall || callPhase === 'waiting' ? roomId : ''}
        inCall={inCall}
        onLeaveCall={call.leave}
        rttMs={rttMs}
        onCopyLink={() => {
          if (roomId && navigator.clipboard) {
            navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?join=${roomId}`);
          }
        }}
      />

      {/* Main Content Workspace Area */}
      <main className={`flex-1 min-h-0 w-full px-3 pb-2 sm:px-4 sm:pb-3 flex flex-col justify-stretch ${
        currentPage === 'home' ? 'overflow-y-auto' : 'overflow-hidden'
      }`}>
        {workerError && (
          <div className="mb-2 cartoon-card bg-[#FEECEC] border-2 border-zinc-900 p-2.5 text-xs text-[#EF4444] font-bold flex items-center gap-2 flex-shrink-0 shadow-cartoon-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{workerError}</span>
          </div>
        )}

        {/* =========================================================================
            PAGE 0: HOME PAGE (Minimal Choice Arena: Learn vs Call)
            ========================================================================= */}
        {currentPage === 'home' && (
          <HomePage
            onSelectMode={(mode) => setCurrentPage(mode)}
            extraState={{ masteredCount, roomId, recognitionMode }}
            onJoinCode={(c) => {
              setPendingJoinCode(c);
              setCurrentPage('chat');
            }}
            onOpenDictionary={() => setIsDictionaryOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
            onOpenFeedback={handleOpenFeedback}
            onOpenChatbot={() => setIsChatbotOpen(true)}
          />
        )}

        {/* =========================================================================
            PAGE 1: LEARN ISL (Learning Studio)
            ========================================================================= */}
        {currentPage === 'learn' && (
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Mobile Tab Switcher in Learn Mode */}
            <div className="pb-2 md:hidden flex-shrink-0">
              <div className="flex bg-[#E5F3E4] p-1 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
                <button
                  onClick={() => setMobileLearnTab('stage')}
                  className={`flex-1 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    mobileLearnTab === 'stage'
                      ? 'bg-[#FFD15C] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                      : 'text-zinc-600'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Practice</span>
                </button>
                <button
                  onClick={() => setMobileLearnTab('guide')}
                  className={`flex-1 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    mobileLearnTab === 'guide'
                      ? 'bg-[#38BDF8] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                      : 'text-zinc-600'
                  }`}
                >
                  <Compass className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Lesson</span>
                </button>
              </div>
            </div>

            {/* Split Learning Studio Layout */}
            <div className="flex-1 min-h-0 w-full flex flex-col md:flex-row gap-3 sm:gap-4 overflow-hidden items-stretch">
              {/* Left Side: Dedicated Full Practice Blueprint & Real-Time Alignment Guide */}
              <div
                className={`w-full md:w-[410px] lg:w-[470px] xl:w-[520px] 2xl:w-[560px] h-full min-h-0 overflow-hidden flex-shrink-0 ${
                  mobileLearnTab === 'guide' ? 'flex' : 'hidden md:flex'
                }`}
              >
                <LearnSidebar
                  selectedItem={selectedLearnItem}
                  onSelectItem={handleSelectLearnItem}
                  latestLandmarks={latestLandmarks}
                  evaluationResult={learnEvaluation}
                  masteredSet={masteredSetRef.current}
                  isAcademyOpen={isAcademyOpen}
                  onOpenAcademy={() => setIsAcademyOpen(true)}
                  onCloseAcademy={() => setIsAcademyOpen(false)}
                  activeStepIndex={activeStepIndex}
                  completedSteps={completedSteps}
                  successfulReps={successfulReps}
                  targetReps={TARGET_REPETITIONS}
                  onResetPractice={handleResetPractice}
                />
              </div>

              {/* Center & Lower Right: Video/Skeleton Stage + Lower AI Guessing Hub */}
              <div
                className={`flex-1 min-h-0 flex flex-col gap-3 overflow-hidden ${
                  mobileLearnTab === 'stage' ? 'flex' : 'hidden md:flex'
                }`}
              >
                {/* Visual Skeleton Viewport (Camera Feed HUD) */}
                <LearnStage
                  onFrame={handleFrame}
                  latestLandmarks={latestLandmarks}
                  isWorkerReady={isWorkerReady}
                  onFpsUpdate={setFps}
                  fps={fps}
                  targetSkeleton={activeTargetSkeleton}
                  selectedItem={selectedLearnItem}
                  isMatched={isSignMastered}
                  activeStepIndex={activeStepIndex}
                  completedSteps={completedSteps}
                  stepSuccessFlash={stepSuccessFlash}
                  successfulReps={successfulReps}
                  targetReps={TARGET_REPETITIONS}
                  onResetPractice={handleResetPractice}
                  onNextSign={handleNextSign}
                />

                {/* Lower Panel: Live AI Guessing Hub */}
                <LearnGuessPanel
                  selectedItem={selectedLearnItem}
                  wordPredictions={wordPredictions}
                  alphabetPredictions={alphabetPredictions}
                  recognitionMode={recognitionMode}
                  onToggleMode={setRecognitionMode}
                  motionState={motionState}
                  onNextSign={handleNextSign}
                  onOpenAcademy={() => setIsAcademyOpen(true)}
                  masteredCount={masteredCount}
                  isMatched={isSignMastered}
                  activeStepIndex={activeStepIndex}
                  completedSteps={completedSteps}
                  stepSuccessFlash={stepSuccessFlash}
                  successfulReps={successfulReps}
                  targetReps={TARGET_REPETITIONS}
                  onResetPractice={handleResetPractice}
                  untrained={learnUntrained}
                  targetMatched={trainedMatch}
                  onManualPass={handleManualPass}
                  onTrain={() => {
                    setTeachWord((selectedLearnItem?.label || '').toUpperCase());
                    handlePageChange('teach');
                  }}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGE 2: LIVE CALL & AUTO-TRANSLATOR (Dual-Camera Hub)
            ========================================================================= */}
        {currentPage === 'teach' && (
          <TeachStage
            onFrame={handleFrame}
            latestLandmarks={latestLandmarks}
            latestNormalizedFeatures={latestNormalizedFeatures}
            isWorkerReady={isWorkerReady}
            initialWord={teachWord}
          />
        )}

        {currentPage === 'test' && (
          <ErrorBoundary title="Testing Error" onReset={() => setCurrentPage('test')}>
            <TestStage
              onFrame={handleFrame}
              latestLandmarks={latestLandmarks}
              latestNormalizedFeatures={latestNormalizedFeatures}
              isWorkerReady={isWorkerReady}
              onGoTeach={() => handlePageChange('teach')}
              engineLetters={alphabetPredictions}
              engineWords={wordPredictions?.topCandidates || []}
            />
          </ErrorBoundary>
        )}

        {currentPage === 'chat' && !inCall && (
          <CallLobby
            call={call}
            localStream={localStream}
            onStreamChange={setLocalStream}
            userName={userName}
            onNameChange={setUserName}
            initialCode={pendingJoinCode}
            onCodeConsumed={() => setPendingJoinCode('')}
          />
        )}

        {currentPage === 'chat' && inCall && (
          <ErrorBoundary title="Calling & Translation Stage Error" onReset={() => setCurrentPage('chat')}>
            <div className="flex flex-col h-full min-h-0 overflow-hidden">
              {/* Mobile Tab Switcher in Sign Call Mode */}
              <div className="pb-1.5 md:hidden flex-shrink-0">
                <div className="flex bg-[#E5F3E4] p-1 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
                  <button
                    onClick={() => setMobileTab('stage')}
                    className={`flex-1 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      mobileTab === 'stage'
                        ? 'bg-[#FFD15C] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                        : 'text-zinc-600'
                    }`}
                  >
                    <Video className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Dual Video Stage</span>
                  </button>
                  <button
                    onClick={() => setMobileTab('chat')}
                    className={`flex-1 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      mobileTab === 'chat'
                        ? 'bg-[#38BDF8] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                        : 'text-zinc-600'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 stroke-[2.2]" />
                    <span>Auto-Conversion Feed</span>
                    {allMessages.length > 0 && (
                      <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-white text-zinc-900 shadow-none">
                        {allMessages.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {/* Side-by-side flex panes on tablet & desktop screens */}
              <div className="flex flex-col md:flex-row gap-3 sm:gap-4 h-full min-h-0 overflow-hidden items-stretch">
                {/* Left Pane: Dual Camera Viewport on top + Sign Buffer below */}
                <div
                  className={`w-full md:w-[58%] lg:w-[60%] flex flex-col gap-3 sm:gap-4 h-full min-h-0 overflow-hidden flex-shrink-0 ${
                    mobileTab === 'stage' ? 'flex' : 'hidden md:flex'
                  }`}
                >
                  <SignerStage
                    onFrame={handleFrame}
                    onFpsUpdate={setFps}
                    fps={fps}
                    profilingData={profilingData}
                    commitPauseMs={commitPauseMs}
                    onPauseChange={handlePauseChange}
                    latestLandmarks={latestLandmarks}
                    isWorkerReady={isWorkerReady}
                    motionState={motionState}
                    bufferSize={bufferSize}
                    alphabetPredictions={alphabetPredictions}
                    wordPredictions={wordPredictions}
                    latestConfirmedWord={latestConfirmedWord}
                    latestReply={latestIncomingReply}
                    recognitionMode={recognitionMode}
                    onToggleMode={setRecognitionMode}
                    localStream={localStream}
                  onStreamChange={setLocalStream}
                    remoteStream={remoteStream}
                    peerPresence={peerPresence}
                    onOpenGuide={() => setIsGuideOpen(true)}
                    candidates={persistedCandidates}
                    isCandidateLive={isCandidateLive}
                    onSelectCandidate={handleSelectCandidate}
                    onDismissCandidates={handleDismissCandidates}
                    onSetInteracting={(isInteracting) => {
                      isInteractingWithCandidatesRef.current = isInteracting;
                      if (!isInteracting && persistedCandidates.length > 0) {
                        if (candidateTimeoutRef.current) clearTimeout(candidateTimeoutRef.current);
                        candidateTimeoutRef.current = setTimeout(() => {
                          if (!isInteractingWithCandidatesRef.current) {
                            setPersistedCandidates([]);
                          }
                        }, 3500);
                      }
                    }}
                    currentGlosses={glosses}
                    onUndo={handleUndo}
                    onClear={handleClear}
                    roomId={formatCallCode(roomId)}
                    onCopyLink={() => {
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?join=${roomId}`);
                      }
                    }}
                  />

                  {Object.keys(customSigns).length === 0 && (
                    <div className="duo-card px-4 py-3 flex items-center justify-between gap-3 flex-shrink-0">
                      <span className="text-sm font-bold text-[#636A62]">No signs trained yet</span>
                      <button type="button" className="duo-btn duo-btn-blue !py-1.5 !px-4 !text-xs" onClick={() => handlePageChange('teach')}>Train</button>
                    </div>
                  )}

                  <LiveGlossBar
                    glosses={glosses}
                    previewText={previewText}
                    motionState={motionState}
                    candidates={persistedCandidates}
                    onSelectCandidate={handleSelectCandidate}
                    onRemoveAt={handleRemoveGloss}
                    onUndo={handleUndo}
                    onClear={handleClear}
                    onCommit={handleCommit}
                  />
                </div>

                {/* Right Pane: Live Scrollable Auto-Conversion Feed */}
                <div
                  className={`w-full md:w-[42%] lg:w-[40%] h-full min-h-0 overflow-hidden flex flex-col flex-1 ${
                    mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
                  }`}
                >
                  <ChatPanel
                    messages={allMessages}
                    incomingPartialSigning={incomingPartialSigning}
                    localGlosses={glosses}
                    localPreviewText={previewText}
                    motionState={motionState}
                    onSendMessage={sendTextReply}
                    currentUserRole="peer"
                    currentUserName={userName}
                    peerPresence={peerPresence}
                    connectionMode={connectionMode}
                    rttMs={rttMs}
                    onClearMessages={() => setLocalCommittedSentences([])}
                  />
                </div>
              </div>
            </div>
          </ErrorBoundary>
        )}
      </main>

      {/* Developer Training / Keypoint Dataset Recorder Drawer */}
      <KeypointRecorderDrawer
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        latestNormalizedFeatures={latestNormalizedFeatures}
        motionState={motionState}
      />

      {/* 1,000+ Word ISL Vocabulary Reference Modal */}
      <WordDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
        onSelectForPractice={(label) => {
          const item = getLearnItemByLabel(label);
          if (item) {
            handleSelectLearnItem(item);
            setCurrentPage('learn');
            setIsDictionaryOpen(false);
          }
        }}
      />

      {/* System Properties, Agent Rules & Contributor Modal */}
      <AboutModal
        isOpen={isAboutOpen}
        onClose={() => setIsAboutOpen(false)}
      />

      {/* Non-Technical Features & How-It-Works Guide Modal */}
      <HowItWorksModal
        isOpen={isGuideOpen}
        onClose={() => setIsGuideOpen(false)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onNavigateToMode={(mode) => setCurrentPage(mode)}
        onSelectForPractice={(label) => {
          const item = getLearnItemByLabel(label);
          if (item) {
            handleSelectLearnItem(item);
            setCurrentPage('learn');
            setIsGuideOpen(false);
          }
        }}
      />

      {/* In-Browser Issue Reporter & Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        initialScreenshot={feedbackScreenshot}
        contextData={feedbackContextData}
      />

      {/* Global Movable Floating Chatbot Launcher Button (Drag anywhere on desktop; mobile uses bottom dock) */}
      <MovableChatbotLauncher
        isOpen={isChatbotOpen}
        onOpen={() => setIsChatbotOpen(true)}
        currentPage={currentPage}
      />

      {/* Mobile Bottom Navigation Dock (< md: thumb navigation) */}
      <MobileBottomNav
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenChatbot={() => setIsChatbotOpen(true)}
        masteredCount={masteredCount}
        unreadCount={allMessages.length}
      />

      {/* Global Sanket AI Chatbot Popup (Real-time page context, BYOK, memory & sign tutorials) */}
      <HomeChatbotPopup
        isOpen={isChatbotOpen}
        onClose={() => setIsChatbotOpen(false)}
        currentPage={currentPage}
        extraState={{
          selectedLearnItem,
          activeStepIndex,
          successfulReps,
          isSignMastered,
          masteredCount,
          roomId,
          connectionMode,
          glosses,
          previewText,
          callMessages: allMessages,
          recognitionMode,
          isDictionaryOpen,
          isGuideOpen,
          isAboutOpen,
          isFeedbackOpen,
          isRecorderOpen
        }}
        onNavigateToMode={(mode) => setCurrentPage(mode)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        onOpenGuide={() => setIsGuideOpen(true)}
      />
    </div>
  );
}

export default App;