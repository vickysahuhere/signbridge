import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Download,
  Trash2,
  Database,
  FileText,
  FileSpreadsheet,
  AlertTriangle
} from 'lucide-react';

export function KeypointRecorderDrawer({
  isOpen,
  onClose,
  latestNormalizedFeatures,
  motionState
}) {
  const [labelName, setLabelName] = useState('A');
  const [signerName, setSignerName] = useState('Signer_1');
  const [targetFrames, setTargetFrames] = useState(100);

  // Recording state
  const [isCountingDown, setIsCountingDown] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedFrames, setRecordedFrames] = useState([]);
  const [recordedSamples, setRecordedSamples] = useState([]);

  const isRecordingRef = useRef(false);
  const framesBufferRef = useRef([]);

  // Countdown timer before capture begins
  useEffect(() => {
    let timer = null;
    if (isCountingDown) {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        setIsCountingDown(false);
        setIsRecording(true);
        isRecordingRef.current = true;
        framesBufferRef.current = [];
        setRecordedFrames([]);
      }
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  // Frame collector
  useEffect(() => {
    if (!isRecordingRef.current || !latestNormalizedFeatures) return;

    const frameClone = new Float32Array(latestNormalizedFeatures);
    framesBufferRef.current.push(frameClone);
    setRecordedFrames([...framesBufferRef.current]);

    if (framesBufferRef.current.length >= targetFrames) {
      isRecordingRef.current = false;
      setIsRecording(false);

      const newSample = {
        id: `sample_${Date.now()}`,
        label: labelName.trim().toUpperCase(),
        signer: signerName.trim(),
        timestamp: new Date().toISOString(),
        frameCount: framesBufferRef.current.length,
        featureDim: 240,
        frames: framesBufferRef.current.map(f => Array.from(f))
      };

      setRecordedSamples(prev => [newSample, ...prev]);
    }
  }, [latestNormalizedFeatures, targetFrames, labelName, signerName]);

  const startRecordingFlow = () => {
    if (!labelName.trim()) return;
    setCountdown(3);
    setIsCountingDown(true);
  };

  const cancelRecording = () => {
    setIsCountingDown(false);
    setIsRecording(false);
    isRecordingRef.current = false;
    framesBufferRef.current = [];
    setRecordedFrames([]);
  };

  const exportSampleJSON = (sample) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sample, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `isl_${sample.label}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportSampleCSV = (sample) => {
    const headers = ['frame'];
    for (let k = 0; k < 80; k++) {
      headers.push(`k${k}_x`, `k${k}_y`, `k${k}_z`);
    }
    headers.push('label');

    const rows = [headers.join(',')];
    sample.frames.forEach((frame, idx) => {
      const row = [idx + 1, ...frame, sample.label];
      rows.push(row.join(','));
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(rows.join('\n'));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', csvContent);
    downloadAnchor.setAttribute('download', `isl_${sample.label}_${Date.now()}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAllJSON = () => {
    if (recordedSamples.length === 0) return;
    const bundle = {
      project: 'SignBridge ISL Dataset',
      exportedAt: new Date().toISOString(),
      sampleCount: recordedSamples.length,
      samples: recordedSamples
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(bundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `isl_dataset_bundle_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const deleteSample = (id) => {
    setRecordedSamples(prev => prev.filter(s => s.id !== id));
  };

  if (!isOpen) return null;

  return (
    <aside
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white border-l-2 border-zinc-900 shadow-2xl flex flex-col select-none animate-in slide-in-from-right duration-200"
      aria-label="Keypoint Dataset Recorder Drawer"
    >
      {/* Title Bar */}
      <div className="px-4 py-3 bg-[#FAF8F5] border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
            <Database className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-zinc-900">Dataset Recorder</h3>
            <p className="text-xs text-zinc-500 font-medium">Capture 240-dim biometric keypoints</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-xl border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center justify-center shadow-cartoon-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
          title="Close Utility"
          aria-label="Close Utility"
        >
          <X className="w-4 h-4 stroke-[2.5] text-zinc-900" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#FAF8F5] text-xs">
        {/* Form Container */}
        <div className="cartoon-card p-3.5 bg-white space-y-3">
          <div className="font-extrabold text-xs text-zinc-900 uppercase tracking-wider pb-1 border-b border-zinc-200">
            Capture Configuration
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                Gesture Label:
              </label>
              <input
                type="text"
                value={labelName}
                onChange={e => setLabelName(e.target.value)}
                placeholder="e.g. A, B, NAMASTE, HELLO"
                disabled={isRecording || isCountingDown}
                className="cartoon-input w-full font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Signer ID:
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  disabled={isRecording || isCountingDown}
                  className="cartoon-input w-full font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-zinc-700 mb-1">
                  Target Frames:
                </label>
                <input
                  type="number"
                  value={targetFrames}
                  onChange={e => setTargetFrames(Number(e.target.value) || 100)}
                  disabled={isRecording || isCountingDown}
                  className="cartoon-input w-full font-mono"
                />
              </div>
            </div>

            {/* Trigger Button */}
            {!isRecording && !isCountingDown ? (
              <button
                onClick={startRecordingFlow}
                className="cartoon-btn cartoon-btn-primary w-full py-2 font-bold text-xs mt-2"
              >
                <Play className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Start Recording ({targetFrames} frames)</span>
              </button>
            ) : isCountingDown ? (
              <div className="cartoon-card p-3 bg-[#FFF9E5] text-center border-amber-300">
                <span className="text-3xl font-black font-mono text-[#EF4444] animate-bounce block">
                  {countdown}
                </span>
                <span className="text-xs font-bold text-zinc-800">Get Ready to Sign...</span>
              </div>
            ) : (
              <div className="cartoon-card p-3 bg-[#FFF9E5] space-y-2 border-amber-300">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-900">
                  <span>Recording in progress...</span>
                  <span className="font-mono">{recordedFrames.length} / {targetFrames}</span>
                </div>
                <div className="w-full bg-amber-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#22C55E] h-full rounded-full transition-all duration-100"
                    style={{ width: `${(recordedFrames.length / targetFrames) * 100}%` }}
                  />
                </div>
                <button
                  onClick={cancelRecording}
                  className="cartoon-btn cartoon-btn-coral w-full text-xs py-1.5 mt-1"
                >
                  Cancel Recording
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Vector Feed Status */}
        <div className="cartoon-card p-2.5 bg-white flex items-center justify-between text-[11px] font-mono">
          <span className="font-bold text-zinc-500">Vector Stream:</span>
          <span className={latestNormalizedFeatures ? 'text-[#16A34A] font-bold' : 'text-zinc-400'}>
            {latestNormalizedFeatures ? '● Online (240 floats)' : 'Waiting for camera'}
          </span>
        </div>

        {/* Recorded Samples Table */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-xs text-zinc-900 uppercase">
              Recorded Samples ({recordedSamples.length})
            </h4>
            {recordedSamples.length > 0 && (
              <button
                onClick={exportAllJSON}
                className="cartoon-btn !py-0.5 !px-2 text-xs"
              >
                <Download className="w-3 h-3 stroke-[2.2]" />
                <span>Export All</span>
              </button>
            )}
          </div>

          {recordedSamples.length === 0 ? (
            <div className="cartoon-card p-6 text-center text-zinc-400 text-xs">
              No samples recorded this session yet.
            </div>
          ) : (
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
              {recordedSamples.map((sample) => (
                <div
                  key={sample.id}
                  className="cartoon-card p-2.5 bg-white flex items-center justify-between gap-2"
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-zinc-900">
                        {sample.label}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500">
                        ({sample.frameCount} frames)
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-400 font-mono">
                      {new Date(sample.timestamp).toLocaleTimeString()} • {sample.signer}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportSampleJSON(sample)}
                      className="cartoon-btn !p-1 text-xs"
                      title="Export as JSON"
                    >
                      <FileText className="w-3 h-3 stroke-[2.2]" />
                    </button>
                    <button
                      onClick={() => exportSampleCSV(sample)}
                      className="cartoon-btn !p-1 text-xs"
                      title="Export as CSV"
                    >
                      <FileSpreadsheet className="w-3 h-3 stroke-[2.2]" />
                    </button>
                    <button
                      onClick={() => deleteSample(sample.id)}
                      className="cartoon-btn cartoon-btn-coral !p-1 text-xs"
                      title="Delete Sample"
                    >
                      <Trash2 className="w-3 h-3 stroke-[2.2]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export default KeypointRecorderDrawer;