import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MessageSquare, Clock, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar.jsx';
import { SignerStage } from './components/SignerStage.jsx';
import { LiveGlossBar } from './components/LiveGlossBar.jsx';
import { KeypointRecorderDrawer } from './components/KeypointRecorderDrawer.jsx';
import { WordDictionaryModal } from './components/WordDictionaryModal.jsx';
import { useVisionWorker } from './hooks/useVisionWorker.js';
import { GlossBufferManager } from './nlp/glossBufferManager.js';
import { formatIslSentence } from './nlp/islSentenceFormatter.js';

export function App() {
  const [fps, setFps] = useState(0);
  const [recognitionMode, setRecognitionMode] = useState('word'); // 'alphabet' | 'word'
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);

  // Linguistic Buffer & Sentence State
  const glossBufferRef = useRef(new GlossBufferManager());
  const [glosses, setGlosses] = useState([]);
  const [committedSentences, setCommittedSentences] = useState([]);

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
    if (latestConfirmedWord) {
      const added = glossBufferRef.current.push(latestConfirmedWord, 'word');
      if (added) {
        setGlosses([...glossBufferRef.current.getGlosses()]);
      }
    }
  }, [latestConfirmedWord]);

  // In alphabet mode, append confirmed letter predictions
  useEffect(() => {
    if (recognitionMode === 'alphabet' && alphabetPredictions && alphabetPredictions.length > 0) {
      const top1 = alphabetPredictions[0];
      if (top1 && top1.isConfident) {
        const added = glossBufferRef.current.push(top1.label, 'letter');
        if (added) {
          setGlosses([...glossBufferRef.current.getGlosses()]);
        }
      }
    }
  }, [recognitionMode, alphabetPredictions]);

  // Commit sentence callback
  const handleCommit = useCallback(() => {
    const currentGlosses = glossBufferRef.current.getGlosses();
    if (currentGlosses.length === 0) return;

    const formattedText = formatIslSentence(currentGlosses);
    const newSentence = {
      id: Date.now(),
      glosses: [...currentGlosses],
      text: formattedText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setCommittedSentences(prev => [newSentence, ...prev]);
    glossBufferRef.current.clear();
    setGlosses([]);
  }, []);

  // Automatic commit on 1.2s pause completion (IDLE_COMMIT) (LING-05)
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
  }, []);

  const previewText = formatIslSentence(glosses);

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
      />

      <main className="flex-1 flex flex-col items-center justify-start p-4 lg:p-8 max-w-7xl mx-auto w-full gap-6">
        <div className="w-full text-center">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            Indian Sign Language Computational Linguistics Engine
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            100% client-side deterministic ISL Subject-Object-Verb (SOV) to English Subject-Verb-Object (SVO) grammar reconstruction with automatic 1.2s pause auto-send.
          </p>
        </div>

        {workerError && (
          <div className="w-full max-w-4xl px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs text-center">
            Worker Notice: {workerError}
          </div>
        )}

        {/* 1. Vision Stage */}
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
          recognitionMode={recognitionMode}
        />

        {/* 2. Real-Time Sign Composition Bar (LING-01, LING-02, LING-05) */}
        <div className="w-full max-w-4xl">
          <LiveGlossBar
            glosses={glosses}
            previewText={previewText}
            motionState={motionState}
            onUndo={handleUndo}
            onClear={handleClear}
            onCommit={handleCommit}
          />
        </div>

        {/* 3. Committed Sentences Feed (Conversation History) */}
        {committedSentences.length > 0 && (
          <div className="w-full max-w-4xl bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 lg:p-5 shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-sky-400" />
                <h3 className="font-bold text-sm text-slate-100">Committed ISL Sentences</h3>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700 text-slate-300 font-mono">
                  {committedSentences.length}
                </span>
              </div>
              <button
                onClick={() => setCommittedSentences([])}
                className="text-xs text-slate-400 hover:text-slate-200 transition"
              >
                Clear History
              </button>
            </div>

            <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
              {committedSentences.map((msg) => (
                <div
                  key={msg.id}
                  className="flex flex-col gap-1 p-3 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {msg.glosses.map((g, i) => (
                        <span
                          key={i}
                          className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {msg.timestamp}
                    </span>
                  </div>
                  <p className="text-sm text-slate-100 font-medium pl-0.5">
                    "{msg.text}"
                  </p>
                </div>
              ))}
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

      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        SignBridge ISL • Phase 5: The Linguist • 100% Client-Side Private Edge AI
      </footer>
    </div>
  );
}

export default App;
