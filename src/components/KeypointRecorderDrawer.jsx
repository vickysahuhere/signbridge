import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Play,
  Download,
  Trash2,
  Database,
  CheckCircle,
  FileText,
  FileSpreadsheet,
  AlertCircle,
  Clock
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
        // Countdown reached 0 -> Start actual recording
        setIsCountingDown(false);
        setIsRecording(true);
        isRecordingRef.current = true;
        framesBufferRef.current = [];
        setRecordedFrames([]);
      }
    }
    return () => clearTimeout(timer);
  }, [isCountingDown, countdown]);

  // Frame collector: triggers on each incoming normalized feature vector
  useEffect(() => {
    if (!isRecordingRef.current || !latestNormalizedFeatures) return;

    // Clone frame vector
    const frameClone = new Float32Array(latestNormalizedFeatures);
    framesBufferRef.current.push(frameClone);
    setRecordedFrames([...framesBufferRef.current]);

    if (framesBufferRef.current.length >= targetFrames) {
      // Completed capturing targetFrames
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

  // Download single sample as JSON
  const exportSampleJSON = (sample) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(sample, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `isl_${sample.label}_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Download single sample as CSV
  const exportSampleCSV = (sample) => {
    // Build CSV Header: frame,k0_x,k0_y,k0_z,...,k79_z,label
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

  // Download all captured samples as a single JSON dataset bundle
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
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-700/80 shadow-2xl flex flex-col backdrop-blur-xl animate-in slide-in-from-right duration-200"
      aria-label="Keypoint Dataset Recorder Drawer"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-300 flex items-center justify-center border border-purple-500/40">
            <Database className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100">Keypoint Dataset Recorder</h3>
            <p className="text-[11px] text-slate-400">Capture 100-frame normalized ISL samples</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 font-sans text-xs">
        {/* Sign Label Form */}
        <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 space-y-3">
          <div>
            <label className="block text-[11px] font-mono text-slate-300 mb-1">
              Sign / Gesture Label
            </label>
            <input
              type="text"
              value={labelName}
              onChange={e => setLabelName(e.target.value)}
              placeholder="e.g. A, B, NAMASTE, HELLO"
              disabled={isRecording || isCountingDown}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono font-bold focus:outline-none focus:border-sky-500 transition"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Signer Tag
              </label>
              <input
                type="text"
                value={signerName}
                onChange={e => setSignerName(e.target.value)}
                disabled={isRecording || isCountingDown}
                className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-mono text-slate-400 mb-1">
                Target Frames
              </label>
              <input
                type="number"
                value={targetFrames}
                onChange={e => setTargetFrames(Number(e.target.value) || 100)}
                disabled={isRecording || isCountingDown}
                className="w-full px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 font-mono focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          {/* Trigger Recording Button */}
          {!isRecording && !isCountingDown ? (
            <button
              onClick={startRecordingFlow}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-slate-950 font-bold text-xs shadow-lg shadow-purple-500/20 transition active:scale-98"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Record Gesture ({targetFrames} Frames)</span>
            </button>
          ) : isCountingDown ? (
            <div className="flex flex-col items-center justify-center py-3 bg-purple-500/10 rounded-xl border border-purple-500/30">
              <span className="text-2xl font-black font-mono text-purple-300 animate-bounce">
                {countdown}
              </span>
              <span className="text-[11px] text-purple-200 mt-1">Get ready to sign...</span>
            </div>
          ) : (
            <div className="space-y-2 py-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-purple-300">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-purple-400 animate-ping" />
                  Recording: {recordedFrames.length} / {targetFrames} frames
                </span>
                <span>{Math.round((recordedFrames.length / targetFrames) * 100)}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-gradient-to-r from-purple-500 to-sky-400 transition-all duration-75"
                  style={{ width: `${(recordedFrames.length / targetFrames) * 100}%` }}
                />
              </div>
              <button
                onClick={cancelRecording}
                className="w-full py-1.5 text-center text-[11px] text-rose-400 hover:text-rose-300"
              >
                Cancel Capture
              </button>
            </div>
          )}
        </div>

        {/* Live Vector Feed Status */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-[11px] font-mono text-slate-400">
          <span>Normalized Vector:</span>
          <span className={latestNormalizedFeatures ? 'text-emerald-400 font-semibold' : 'text-slate-500'}>
            {latestNormalizedFeatures ? 'Streaming (240 floats)' : 'Waiting for camera...'}
          </span>
        </div>

        {/* Session Recorded Samples */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200">
              Session Samples ({recordedSamples.length})
            </h4>
            {recordedSamples.length > 0 && (
              <button
                onClick={exportAllJSON}
                className="flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 font-medium"
              >
                <Download className="w-3 h-3" />
                <span>Export All (JSON)</span>
              </button>
            )}
          </div>

          {recordedSamples.length === 0 ? (
            <div className="p-6 text-center rounded-xl border border-dashed border-slate-800 text-slate-500">
              No samples recorded yet. Enter a label above and start recording.
            </div>
          ) : (
            <div className="space-y-2">
              {recordedSamples.map(sample => (
                <div
                  key={sample.id}
                  className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between hover:border-slate-600 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold font-mono text-sky-300">
                        {sample.label}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-700 text-slate-300 font-mono">
                        {sample.frameCount} frames
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {new Date(sample.timestamp).toLocaleTimeString()} • {sample.signer}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => exportSampleJSON(sample)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-sky-300 transition"
                      title="Export as JSON"
                    >
                      <FileText className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => exportSampleCSV(sample)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-emerald-300 transition"
                      title="Export as CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteSample(sample.id)}
                      className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition"
                      title="Delete Sample"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
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
