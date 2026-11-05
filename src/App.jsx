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

export function App() {
  const [fps, setFps] = useState(0);
  const [recognitionMode, setRecognitionMode] = useState('word'); // 'alphabet' | 'word'
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);

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
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans relative overflow-x-hidden">
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

      <main className="flex-1 p-3 sm:p-4 lg:p-6 max-w-7xl mx-auto w-full flex flex-col justify-center">
        {workerError && role === 'signer' && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center">
            Worker Notice: {workerError}
          </div>
        )}

        {/* 12-Column Responsive Workspace */}
        {role === 'signer' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            {/* Left 7 Columns: Vision Stage + LiveGlossBar */}
            <div className="lg:col-span-7 flex flex-col items-center gap-4 w-full">
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

            {/* Right 5 Columns: Two-Way Chat Workspace */}
            <div className="lg:col-span-5 w-full h-[580px] lg:h-[620px]">
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
          /* Text Partner View: Focused Conversational Interface */
          <div className="max-w-3xl mx-auto w-full flex flex-col gap-4">
            <div className="text-center mb-2">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">
                SignBridge Hearing Partner Portal
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto mt-1">
                Connected to ISL Signer in Room <span className="font-mono text-emerald-400 font-bold">#{roomId}</span>. Receive live sign translations and reply by typing below.
              </p>
            </div>

            <div className="h-[620px] w-full">
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

      <footer className="border-t border-slate-800/80 py-3.5 px-6 text-center text-xs text-slate-500 font-mono">
        SignBridge ISL • Phase 6: The Bridge • 100% Client-Side Private Edge AI
      </footer>
    </div>
  );
}

export default App;
