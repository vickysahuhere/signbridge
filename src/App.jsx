import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { HomePage } from './components/HomePage.jsx';
import { Navbar } from './components/Navbar.jsx';
import { SignerStage } from './components/SignerStage.jsx';
import { LiveGlossBar } from './components/LiveGlossBar.jsx';
import { ChatPanel } from './components/ChatPanel.jsx';
import { LearnSidebar } from './components/LearnSidebar.jsx';
import { LearnStage } from './components/LearnStage.jsx';
import { LearnGuessPanel } from './components/LearnGuessPanel.jsx';
import { KeypointRecorderDrawer } from './components/KeypointRecorderDrawer.jsx';
import { WordDictionaryModal } from './components/WordDictionaryModal.jsx';
import { AboutModal } from './components/AboutModal.jsx';
import { HowItWorksModal } from './components/HowItWorksModal.jsx';
import { FeedbackModal } from './components/FeedbackModal.jsx';
import { captureDOMScreenshot } from './utils/screenshotCapture.js';
import { useVisionWorker } from './hooks/useVisionWorker.js';
import { useRoomConnection } from './hooks/useRoomConnection.js';
import { useWebRTC } from './hooks/useWebRTC.js';
import { GlossBufferManager } from './nlp/glossBufferManager.js';
import { formatIslSentence, formatRawGlosses } from './nlp/islSentenceFormatter.js';
import { ISL_LEARN_ITEMS } from './ai/islTargetLandmarks.js';
import { AlertCircle, ShieldCheck, Video, MessageSquare, BookOpen, Compass, Bug } from 'lucide-react';

export function App() {
  const [fps, setFps] = useState(0);
  const [currentPage, setCurrentPage] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const p = params.get('page') || params.get('mode');
      if (p === 'chat') return 'chat';
      if (p === 'learn') return 'learn';
      // If invited via a shared room link, jump straight into call/chat
      if (params.get('room')) return 'chat';
    }
    return 'home'; // Default primary page is the minimal Home choice portal!
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

  // Learn Mode State: Selected Sign, Mastered Counter & Posture Evaluation
  const [selectedLearnItem, setSelectedLearnItem] = useState(ISL_LEARN_ITEMS[0]);
  const [masteredCount, setMasteredCount] = useState(0);
  const masteredSetRef = useRef(new Set());
  const [isGuideOpen, setIsGuideOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const hasSeen = localStorage.getItem('sanket_has_seen_guide');
      const skipAuto = localStorage.getItem('sanket_skip_guide_auto') === 'true';
      return !hasSeen && !skipAuto;
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

  // 1. Room Connection & Presence (NETW-01, NETW-03)
  const {
    roomId,
    setRoomId,
    userId,
    userName,
    setUserName,
    peerPresence,
    channelInstance,
    sendBroadcastMessage,
    getRoomShareUrl
  } = useRoomConnection();

  // 2. Peer-to-Peer WebRTC Data Channel & Video Stream (NETW-02, NETW-04)
  const {
    connectionMode,
    rttMs,
    remoteStream,
    incomingPartialSigning,
    incomingMessages,
    latestIncomingReply,
    sendPartialSigning,
    sendCommittedSentence,
    sendTextReply
  } = useWebRTC({
    userId,
    userName,
    channelInstance,
    sendBroadcastMessage,
    peerPresence,
    localStream
  });

  // 3. Vision Worker AI Tracking
  const {
    isWorkerReady,
    workerStatus,
    workerLatencyMs,
    latestLandmarks,
    latestNormalizedFeatures,
    alphabetPredictions,
    latestConfirmedLetter,
    wordPredictions,
    latestConfirmedWord,
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
    sendFrame(videoElement, timestamp);
  }, [sendFrame]);

  // Append confirmed word to active gloss buffer (LING-01)
  useEffect(() => {
    if (latestConfirmedWord) {
      const word = typeof latestConfirmedWord === 'object' ? latestConfirmedWord.word : latestConfirmedWord;
      if (word) {
        const added = glossBufferRef.current.push(word, 'word');
        if (added) {
          setGlosses([...glossBufferRef.current.getGlosses()]);
        }
      }
    }
  }, [latestConfirmedWord]);

  // In alphabet mode, append confirmed letter predictions from the hysteresis gate
  useEffect(() => {
    if (recognitionMode === 'alphabet' && latestConfirmedLetter) {
      const letter = typeof latestConfirmedLetter === 'object' ? latestConfirmedLetter.letter : latestConfirmedLetter;
      if (letter) {
        const added = glossBufferRef.current.push(letter, 'letter');
        if (added) {
          setGlosses([...glossBufferRef.current.getGlosses()]);
        }
      }
    }
  }, [recognitionMode, latestConfirmedLetter]);

  // Stabilize candidate predictions (hold for 4.5s so words don't disappear immediately)
  useEffect(() => {
    let rawList = [];
    if (recognitionMode === 'word') {
      if (wordPredictions?.topCandidates && wordPredictions.topCandidates.length > 0) {
        rawList = wordPredictions.topCandidates;
      } else if (alphabetPredictions && alphabetPredictions.length > 0 && alphabetPredictions[0].confidence >= 0.85) {
        rawList = alphabetPredictions.map(a => ({ ...a, isAlphabetHint: true }));
      }
    } else {
      rawList = alphabetPredictions || [];
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

  // Automatic commit on 1.2s pause completion (IDLE_COMMIT)
  useEffect(() => {
    if (recognitionMode === 'word' && motionState.state === 'IDLE_COMMIT' && glossBufferRef.current.size() > 0) {
      handleCommit();
    }
  }, [motionState.state, recognitionMode, handleCommit]);

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

  // Real-time evaluation of posture against the target selected sign
  const postureEvaluation = useMemo(() => {
    if (!selectedLearnItem || !selectedLearnItem.evaluate) return null;
    return selectedLearnItem.evaluate(latestLandmarks);
  }, [selectedLearnItem, latestLandmarks]);

  const isPostureAligned = Boolean(postureEvaluation?.isPostureAligned);

  // Check if live AI prediction matches selected target
  const topCandidate = (recognitionMode === 'word' ? wordPredictions?.topCandidates?.[0] : alphabetPredictions?.[0]);
  const isAiGuessMatch = Boolean(
    topCandidate &&
    topCandidate.label?.toUpperCase().replace(/_/g, ' ') === selectedLearnItem?.label?.toUpperCase().replace(/_/g, ' ') &&
    topCandidate.confidence >= 0.75
  );

  const isSignMastered = isPostureAligned || isAiGuessMatch;

  // Track mastered signs streak
  useEffect(() => {
    if (isSignMastered && selectedLearnItem?.label) {
      if (!masteredSetRef.current.has(selectedLearnItem.label)) {
        masteredSetRef.current.add(selectedLearnItem.label);
        setMasteredCount(masteredSetRef.current.size);
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
    const currentIndex = ISL_LEARN_ITEMS.findIndex(item => item.id === selectedLearnItem.id);
    const nextIndex = (currentIndex + 1) % ISL_LEARN_ITEMS.length;
    const nextItem = ISL_LEARN_ITEMS[nextIndex];
    handleSelectLearnItem(nextItem);
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
    <div className="h-screen max-h-screen w-full flex flex-col bg-[#FAF8F5] text-zinc-900 font-sans overflow-hidden select-none">
      {/* 1. Playful Minimal Navbar */}
      <Navbar
        currentPage={currentPage}
        onPageChange={setCurrentPage}
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
        roomId={roomId}
        connectionMode={connectionMode}
        rttMs={rttMs}
        userName={userName}
        onCopyLink={() => {
          const shareUrl = getRoomShareUrl();
          if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
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
            roomId={roomId}
            onJoinCustomRoom={(newRoom) => {
              if (setRoomId) setRoomId(newRoom);
              setCurrentPage('chat');
            }}
            onOpenDictionary={() => setIsDictionaryOpen(true)}
            onOpenGuide={() => setIsGuideOpen(true)}
            onOpenAbout={() => setIsAboutOpen(true)}
            onOpenFeedback={handleOpenFeedback}
          />
        )}

        {/* =========================================================================
            PAGE 1: LEARN ISL (Learning Studio)
            ========================================================================= */}
        {currentPage === 'learn' && (
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Mobile Tab Switcher in Learn Mode */}
            <div className="pb-2 md:hidden flex-shrink-0">
              <div className="flex bg-[#F4EFEA] p-1 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
                <button
                  onClick={() => setMobileLearnTab('stage')}
                  className={`flex-1 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    mobileLearnTab === 'stage'
                      ? 'bg-[#FFD15C] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                      : 'text-zinc-600'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Skeleton Studio</span>
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
                  <span>Landmark Guide</span>
                </button>
              </div>
            </div>

            {/* Split Learning Studio Layout */}
            <div className="flex-1 min-h-0 w-full flex flex-col md:flex-row gap-3 sm:gap-4 overflow-hidden items-stretch">
              {/* Left Side: Sign Selector, SVG Illustration & Landmark Target Blueprint */}
              <div
                className={`w-full md:w-[320px] lg:w-[360px] h-full min-h-0 overflow-hidden flex-shrink-0 ${
                  mobileLearnTab === 'guide' ? 'flex' : 'hidden md:flex'
                }`}
              >
                <LearnSidebar
                  selectedItem={selectedLearnItem}
                  onSelectItem={handleSelectLearnItem}
                  latestLandmarks={latestLandmarks}
                  evaluationResult={postureEvaluation}
                />
              </div>

              {/* Center & Lower Right: Video/Skeleton Stage + Lower AI Guessing Hub */}
              <div
                className={`flex-1 min-h-0 flex flex-col gap-3 overflow-hidden ${
                  mobileLearnTab === 'stage' ? 'flex' : 'hidden md:flex'
                }`}
              >
                {/* Visual Skeleton Viewport (Black Screen Studio / Camera View) */}
                <LearnStage
                  onFrame={handleFrame}
                  latestLandmarks={latestLandmarks}
                  isWorkerReady={isWorkerReady}
                  onFpsUpdate={setFps}
                  fps={fps}
                  targetSkeleton={selectedLearnItem?.targetSkeleton}
                  selectedItem={selectedLearnItem}
                  isMatched={isSignMastered}
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
                  masteredCount={masteredCount}
                  isMatched={isSignMastered}
                />
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            PAGE 2: LIVE CHAT & CALL (Two-Way Communication Hub)
            ========================================================================= */}
        {currentPage === 'chat' && (
          <div className="flex flex-col h-full min-h-0 overflow-hidden">
            {/* Mobile Tab Switcher in Chat Mode */}
            <div className="pb-1.5 md:hidden flex-shrink-0">
              <div className="flex bg-[#F4EFEA] p-1 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
                <button
                  onClick={() => setMobileTab('stage')}
                  className={`flex-1 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    mobileTab === 'stage'
                      ? 'bg-[#FFD15C] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                      : 'text-zinc-600'
                  }`}
                >
                  <Video className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Sign &amp; Compose</span>
                </button>
                <button
                  onClick={() => setMobileTab('chat')}
                  className={`flex-1 py-1 rounded-lg text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                    mobileTab === 'chat'
                      ? 'bg-[#38BDF8] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                      : 'text-zinc-600'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
                  <span>Live Chat</span>
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
              {/* Left Pane: Camera Viewport on top + Sentence Composer below */}
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
                />

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

              {/* Right Pane: Live Conversation Hub */}
              <div
                className={`w-full md:w-[42%] lg:w-[40%] h-full min-h-0 overflow-hidden flex flex-col flex-1 ${
                  mobileTab === 'chat' ? 'flex' : 'hidden md:flex'
                }`}
              >
                <ChatPanel
                  messages={allMessages}
                  incomingPartialSigning={incomingPartialSigning}
                  onSendMessage={sendTextReply}
                  currentUserRole="peer"
                  currentUserName={userName}
                  peerPresence={peerPresence}
                  connectionMode={connectionMode}
                  rttMs={rttMs}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 3. Clean Minimal Footer */}
      <footer className="h-7 px-4 flex items-center justify-between text-[11px] font-medium text-zinc-500 bg-[#FAF8F5] border-t border-zinc-200/80 flex-shrink-0 select-none">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-700">Sanket (संकेत)</span>
          <span>•</span>
          <span>100% In-Browser Privacy</span>
          <span>•</span>
          <span className="hidden sm:inline">Zero Server Cost</span>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-zinc-400">
            Tip: Rest hands 1.2s to auto-send
          </span>
          <button
            onClick={handleOpenFeedback}
            className="hover:text-zinc-900 font-bold flex items-center gap-1 text-[11px] text-zinc-700"
            title="Report an issue or give feedback with automatic window screenshot"
          >
            <Bug className="w-3.5 h-3.5 stroke-[2.2] text-red-600" />
            <span>Report Issue</span>
          </button>
          <button
            onClick={() => setIsAboutOpen(true)}
            className="hover:text-zinc-900 font-bold flex items-center gap-1 text-[11px]"
          >
            <ShieldCheck className="w-3.5 h-3.5 stroke-[2.2]" />
            <span>System Info</span>
          </button>
        </div>
      </footer>

      {/* Developer Training / Keypoint Dataset Recorder Drawer */}
      <KeypointRecorderDrawer
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        latestNormalizedFeatures={latestNormalizedFeatures}
        motionState={motionState}
      />

      {/* 260-Word ISL Vocabulary Reference Modal */}
      <WordDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
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
      />

      {/* In-Browser Issue Reporter & Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        initialScreenshot={feedbackScreenshot}
        contextData={feedbackContextData}
      />
    </div>
  );
}

export default App;