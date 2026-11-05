import React, { useState, useCallback } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { SignerStage } from './components/SignerStage.jsx';
import { KeypointRecorderDrawer } from './components/KeypointRecorderDrawer.jsx';
import { useVisionWorker } from './hooks/useVisionWorker.js';

export function App() {
  const [fps, setFps] = useState(0);
  const [recognitionMode, setRecognitionMode] = useState('alphabet'); // 'alphabet' | 'word'
  const [isRecorderOpen, setIsRecorderOpen] = useState(false);

  const {
    isWorkerReady,
    workerStatus,
    workerLatencyMs,
    latestLandmarks,
    latestNormalizedFeatures,
    alphabetPredictions,
    motionState,
    bufferSize,
    workerError,
    sendFrame
  } = useVisionWorker();

  const handleFrame = useCallback((videoElement, timestamp) => {
    sendFrame(videoElement, timestamp);
  }, [sendFrame]);

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
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="w-full text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            Indian Sign Language Two-Handed Alphabet AI
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Real-time ONNX Runtime Web neural network classifying 36 ISL letters & digits in &lt;10ms, backed by in-browser keypoint dataset capture.
          </p>
        </div>

        {workerError && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs">
            Worker Notice: {workerError}
          </div>
        )}

        <SignerStage
          onFrame={handleFrame}
          onFpsUpdate={setFps}
          latestLandmarks={latestLandmarks}
          isWorkerReady={isWorkerReady}
          motionState={motionState}
          bufferSize={bufferSize}
          alphabetPredictions={alphabetPredictions}
          recognitionMode={recognitionMode}
        />
      </main>

      {/* Developer Training / Keypoint Dataset Recorder Drawer */}
      <KeypointRecorderDrawer
        isOpen={isRecorderOpen}
        onClose={() => setIsRecorderOpen(false)}
        latestNormalizedFeatures={latestNormalizedFeatures}
        motionState={motionState}
      />

      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        SignBridge ISL • Phase 3: The Brain (Part 1) • 100% Client-Side Private Edge AI
      </footer>
    </div>
  );
}

export default App;
