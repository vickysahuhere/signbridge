import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { SignerStage } from './components/SignerStage.jsx';
import { LiveGlossBar } from './components/LiveGlossBar.jsx';
import { ChatPanel } from './components/ChatPanel.jsx';
import { KeypointRecorderDrawer } from './components/KeypointRecorderDrawer.jsx';
import { WordDictionaryModal } from './components/WordDictionaryModal.jsx';
import { useVisionWorker } from './hooks/useVisionWorker.js';
import { useRoomConnection } from './hooks/useRoomConnection.js';
import { useWebRTC } from './hooks/useWebRTC.js';
import { GlossBufferManager } from './nlp/glossBufferManager.js';
import { formatIslSentence } from './nlp/islSentenceFormatter.js';
import { Monitor, BookOpen, Database } from 'lucide-react';

export function App() {
  const [fps, setFps] = useState(0);
  const [recognitionMode, setRecognitionMode] = useState('word'); // 'alphabet' | 'word'
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Clock in bottom Windows 95 taskbar
  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      setCurrentTime(d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Linguistic Buffer State
  const glossBufferRef = useRef(new GlossBufferManager());
  const [glosses, setGlosses] = useState([]);
  const [localCommittedSentences, setLocalCommittedSentences] = useState([]);

  // 1. Room Connection & Presence (NETW-01, NETW-03)
  const {
    roomId,
    role,
    setRole,
    userName,
    peerPresence,
    channelInstance,
    sendBroadcastMessage,
    getRoomShareUrl
  } = useRoomConnection();

  // 2. Peer-to-Peer WebRTC Data Channel (NETW-02, NETW-04)
  const {
    connectionMode,
    rttMs,
    incomingPartialSigning,
    incomingMessages,
    latestIncomingReply,
    sendPartialSigning,
    sendCommittedSentence,
    sendTextReply
  } = useWebRTC({
    role,
    userName,
    channelInstance,
    sendBroadcastMessage,
    peerPresence
  });

  // 3. Vision Worker AI Tracking
  const {
    isWorkerReady,
    workerStatus,
    workerLatencyMs,
    latestLandmarks,
    latestNormalizedFeatures,
    alphabetPredictions,
    wordPredictions,
    latestConfirmedWord,
    motionState,
    bufferSize,
    workerError,
    sendFrame
  } = useVisionWorker();

  const handleFrame = useCallback((videoElement, timestamp) => {
    sendFrame(videoElement, timestamp);
  }, [sendFrame]);

  // Append confirmed word to active gloss buffer (LING-01)
  useEffect(() => {
    if (role === 'signer' && latestConfirmedWord) {
      const added = glossBufferRef.current.push(latestConfirmedWord, 'word');
      if (added) {
        setGlosses([...glossBufferRef.current.getGlosses()]);
      }
    }
  }, [role, latestConfirmedWord]);

  // In alphabet mode, append confirmed letter predictions
  useEffect(() => {
    if (role === 'signer' && recognitionMode === 'alphabet' && alphabetPredictions && alphabetPredictions.length > 0) {
      const top1 = alphabetPredictions[0];
      if (top1 && top1.isConfident) {
        const added = glossBufferRef.current.push(top1.label, 'letter');
        if (added) {
          setGlosses([...glossBufferRef.current.getGlosses()]);
        }
      }
    }
  }, [role, recognitionMode, alphabetPredictions]);

  const previewText = formatIslSentence(glosses);

  // Stream live partial signing tokens to remote partner in real time (NETW-04)
  useEffect(() => {
    if (role === 'signer') {
      sendPartialSigning({ glosses, previewText });
    }
  }, [role, glosses, previewText, sendPartialSigning]);

  // Commit sentence callback (LING-05)
  const handleCommit = useCallback(() => {
    const currentGlosses = glossBufferRef.current.getGlosses();
    if (currentGlosses.length === 0) return;

    const formattedText = formatIslSentence(currentGlosses);
    const newSentence = {
      id: Date.now(),
      glosses: [...currentGlosses],
      text: formattedText,
      sender: userName,
      senderRole: 'signer',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLocalCommittedSentences(prev => [newSentence, ...prev]);
    sendCommittedSentence(newSentence);
    glossBufferRef.current.clear();
    setGlosses([]);
  }, [userName, sendCommittedSentence]);

  // Automatic commit on 1.2s pause completion (IDLE_COMMIT)
  useEffect(() => {
    if (role === 'signer' && motionState.state === 'IDLE_COMMIT' && glossBufferRef.current.size() > 0) {
      handleCommit();
    }
  }, [role, motionState.state, handleCommit]);

  // Manual editing actions (LING-02)
  const handleUndo = useCallback(() => {
    glossBufferRef.current.undo();
    setGlosses([...glossBufferRef.current.getGlosses()]);
  }, []);

  const handleClear = useCallback(() => {
    glossBufferRef.current.clear();
    setGlosses([]);
  }, []);

  // Merge local committed sentences with remote messages
  const allMessages = [...localCommittedSentences, ...incomingMessages].reduce((acc, msg) => {
    if (!acc.some(m => m.id === msg.id)) {
      acc.push(msg);
    }
    return acc;
  }, []);

  return (
    <div className="h-screen max-h-screen w-full flex flex-col text-[#000000] font-sans overflow-hidden select-none">
      {/* 1. Authentic 90s GeoCities Marquee Announcement Bar */}
      <div className="bg-[#000080] text-[#FFFFFF] border-b-2 border-[#000000] py-0.5 px-2 overflow-hidden flex items-center select-none shadow-sm flex-shrink-0 h-6">
        <span className="bg-[#FFFF00] text-[#000000] font-mono font-bold text-[9px] px-1 py-0.2 mr-1.5 flex-shrink-0 animate-pulse-glow">
          NEWS
        </span>
        <div className="overflow-hidden whitespace-nowrap flex-1">
          <div className="marquee-content font-mono text-[11px] font-bold tracking-wide">
            <span className="text-[#FFFF00]">★ SIGNBRIDGE ISL '98 ★</span>{' '}
            <span className="text-[#FFFFFF]">100% PRIVATE CLIENT-SIDE NEURAL NETWORK</span> •{' '}
            <span className="text-[#00FF00]">50 CORE ISL WORDS + A-Z FINGER SPELLING</span> •{' '}
            <span className="text-[#00FFFF]">BEST VIEWED AT 800x600 IN NETSCAPE 4.0 OR IE 4.0</span> •{' '}
            <span className="text-[#FF5555]">Y2K COMPLIANT</span> •{' '}
            <span className="text-[#FFFFCC]">DIAL-UP OPTIMIZED 56.6 KBPS</span> •{' '}
            <span className="text-[#00FF00]">ZERO LATENCY EDGE AI ★</span>
          </div>
        </div>
      </div>

      {/* 2. Compact Windows 95 Navigation & Menu Bar */}
      <Navbar
        fps={fps}
        workerStatus={workerStatus}
        workerLatencyMs={workerLatencyMs}
        motionState={motionState}
        recognitionMode={recognitionMode}
        onToggleMode={setRecognitionMode}
        onOpenRecorder={() => setIsRecorderOpen(true)}
        onOpenDictionary={() => setIsDictionaryOpen(true)}
        roomId={roomId}
        connectionMode={connectionMode}
        rttMs={rttMs}
        currentRole={role}
        onToggleRole={setRole}
        onCopyLink={() => {
          const shareUrl = getRoomShareUrl(role === 'signer' ? 'text_partner' : 'signer');
          if (navigator.clipboard) {
            navigator.clipboard.writeText(shareUrl);
          }
        }}
      />

      {/* 3. Main Workspace Area: Rock-solid two-pane desktop communication layout */}
      <main className="flex-1 min-h-0 w-full p-2 flex flex-col justify-stretch overflow-hidden">
        {workerError && role === 'signer' && (
          <div className="mb-1 retro-outset bg-[#FFFFCC] border-2 border-[#CC0000] p-1 text-[11px] text-[#CC0000] font-mono font-bold flex items-center gap-1.5 flex-shrink-0">
            <span>[!] SYSTEM NOTICE:</span>
            <span>{workerError}</span>
          </div>
        )}

        {role === 'signer' ? (
          /* Side-by-side flex panes on all tablet & desktop screens (md:flex-row) */
          <div className="flex flex-col md:flex-row gap-2 h-full min-h-0 overflow-hidden items-stretch">
            {/* Left Pane (58% width): Generous Video Stage on top + Compact Sentence Composer below */}
            <div className="w-full md:w-[58%] lg:w-[60%] flex flex-col gap-2 h-full min-h-0 overflow-hidden flex-shrink-0">
              <SignerStage
                onFrame={handleFrame}
                onFpsUpdate={setFps}
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
              />

              <LiveGlossBar
                glosses={glosses}
                previewText={previewText}
                motionState={motionState}
                onUndo={handleUndo}
                onClear={handleClear}
                onCommit={handleCommit}
              />
            </div>

            {/* Right Pane (42% width): Instant Messenger matching full height */}
            <div className="w-full md:w-[42%] lg:w-[40%] h-full min-h-0 overflow-hidden flex flex-col flex-1">
              <ChatPanel
                messages={allMessages}
                incomingPartialSigning={null}
                onSendMessage={sendTextReply}
                currentUserRole={role}
                currentUserName={userName}
                peerPresence={peerPresence}
                connectionMode={connectionMode}
                rttMs={rttMs}
              />
            </div>
          </div>
        ) : (
          /* Hearing Partner Focused View */
          <div className="max-w-3xl mx-auto w-full h-full flex flex-col gap-2 min-h-0 overflow-hidden">
            <div className="retro-window p-2 text-center bg-[#C0C0C0] flex-shrink-0">
              <div className="bg-[#000080] text-[#FFFFFF] px-2 py-0.5 font-bold text-xs mb-1">
                HEARING PARTNER TERMINAL - ROOM #{roomId}
              </div>
              <p className="text-[11px] font-sans text-[#000000]">
                Connected to Deaf ISL Signer. Live sign translations appear in real time below.
              </p>
            </div>

            <div className="flex-1 min-h-0 h-full overflow-hidden">
              <ChatPanel
                messages={allMessages}
                incomingPartialSigning={incomingPartialSigning}
                onSendMessage={sendTextReply}
                currentUserRole={role}
                currentUserName={userName}
                peerPresence={peerPresence}
                connectionMode={connectionMode}
                rttMs={rttMs}
              />
            </div>
          </div>
        )}
      </main>

      {/* 4. Docked Windows 95 Taskbar & Status Dock at Bottom */}
      <footer className="h-7 retro-outset bg-[#C0C0C0] border-t-2 border-[#000000] flex items-center justify-between px-1.5 text-xs select-none flex-shrink-0 z-30 shadow-md">
        {/* Left: Start Button & Active Tasks */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => alert("SignBridge ISL '98\\n\\nStart Menu:\\n• ISL Dictionary (50 Words)\\n• Keypoint Dataset Recorder\\n• 100% Client-Side Private AI\\n• Y2K Compliant")}
            className="retro-btn !px-2 !py-0.5 font-heading text-xs font-black flex items-center gap-1 active:translate-y-[1px]"
          >
            <span className="text-[#000080] font-bold">⊞</span>
            <span>Start</span>
          </button>

          <div className="retro-inset px-2 py-0.5 bg-[#FFFFFF] text-[11px] font-bold text-[#000080] hidden sm:flex items-center gap-1">
            <Monitor className="w-3 h-3 stroke-[2px]" />
            <span>SignBridge '98</span>
          </div>

          <button
            onClick={() => setIsDictionaryOpen(true)}
            className="retro-btn !px-1.5 !py-0.5 text-[11px] hidden md:flex items-center gap-1"
          >
            <BookOpen className="w-3 h-3 stroke-[2px] text-[#000080]" />
            <span>Dictionary</span>
          </button>

          {role === 'signer' && (
            <button
              onClick={() => setIsRecorderOpen(true)}
              className="retro-btn !px-1.5 !py-0.5 text-[11px] hidden md:flex items-center gap-1"
            >
              <Database className="w-3 h-3 stroke-[2px] text-[#800080]" />
              <span>Recorder</span>
            </button>
          )}
        </div>

        {/* Center: Hit Counter & WebRing Quick Links */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-mono font-bold hidden lg:inline">VISITORS:</span>
            <div className="retro-hit-counter text-[11px] !py-0 !px-1.5">
              0048291
            </div>
          </div>

          <div className="hidden xl:flex items-center gap-1 text-[10px] font-mono">
            <span className="font-bold text-[#000080]">WebRing:</span>
            <a href="#prev" onClick={(e) => e.preventDefault()} className="retro-link font-bold">[&lt;]</a>
            <a href="#dir" onClick={(e) => e.preventDefault()} className="retro-link font-bold">[Hub]</a>
            <a href="#next" onClick={(e) => e.preventDefault()} className="retro-link font-bold">[&gt;]</a>
          </div>

          <a
            href="#guestbook"
            onClick={(e) => {
              e.preventDefault();
              alert("SignBridge ISL '98 Guestbook:\\n\\n142 signatures recorded since 1997. Welcome to our retro homepage!");
            }}
            className="retro-link text-[10px] font-mono font-bold hidden sm:inline"
          >
            [Guestbook (142)]
          </a>
        </div>

        {/* Right: System Tray & Clock */}
        <div className="flex items-center gap-1 font-mono text-[10px]">
          <div className="retro-inset px-1.5 py-0.2 bg-[#C0C0C0] text-[#00AA00] font-bold hidden sm:block">
            Y2K OK
          </div>
          <div className="retro-inset px-1.5 py-0.2 bg-[#C0C0C0] text-[#000080] font-bold hidden sm:block">
            56.6k
          </div>
          <div className="retro-inset px-1.5 py-0.2 bg-[#C0C0C0] text-[#000000] font-bold">
            {currentTime || '11:48 PM'}
          </div>
        </div>
      </footer>

      {/* Developer Training / Keypoint Dataset Recorder Drawer */}
      <KeypointRecorderDrawer
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        latestNormalizedFeatures={latestNormalizedFeatures}
        motionState={motionState}
      />

      {/* 50-Word ISL Vocabulary Reference Modal */}
      <WordDictionaryModal
        isOpen={isDictionaryOpen}
        onClose={() => setIsDictionaryOpen(false)}
      />
    </div>
  );
}

export default App;
