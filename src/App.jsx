import React, { useState } from 'react';
import { Navbar } from './components/Navbar.jsx';
import { SignerStage } from './components/SignerStage.jsx';

export function App() {
  const [fps, setFps] = useState(0);
  const [workerStatus, setWorkerStatus] = useState('idle');
  const [workerLatencyMs, setWorkerLatencyMs] = useState(0);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      <Navbar
        fps={fps}
        workerStatus={workerStatus}
        workerLatencyMs={workerLatencyMs}
      />

      <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="w-full text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-100 tracking-tight mb-2">
            Indian Sign Language Vision & Skeleton Core
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            High-performance browser computer vision pipeline running MediaPipe Holistic in a dedicated Web Worker at 30+ FPS.
          </p>
        </div>

        <SignerStage
          onFpsUpdate={setFps}
        />
      </main>

      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500 font-mono">
        SignBridge ISL • Phase 1: The Eyes • 100% Client-Side Private Edge AI
      </footer>
    </div>
  );
}

export default App;
