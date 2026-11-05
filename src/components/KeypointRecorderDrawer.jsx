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
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md retro-outset bg-[#C0C0C0] border-l-2 border-[#000000] shadow-2xl flex flex-col select-none"
      aria-label="Keypoint Dataset Recorder Drawer"
    >
      {/* 1. Title Bar */}
      <div className="retro-window-titlebar">
        <div className="flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5 stroke-[2px]" />
          <span>Dataset Recorder - [Feature Vector Utility]</span>
        </div>
        <button
          onClick={onClose}
          className="retro-window-btn"
          title="Close Utility"
          aria-label="Close Utility"
        >
          ×
        </button>
      </div>

      {/* 2. Construction Warning Stripes Banner (Checklist Item #11) */}
      <div className="retro-stripes h-4 border-b border-[#000000] flex items-center justify-center">
        <span className="bg-[#FFFF00] text-[#000000] font-mono font-bold text-[9px] px-2 tracking-widest border border-[#000000]">
          CAUTION: AI TRAINING ZONE • LIVE RECORDING
        </span>
      </div>

      {/* 3. Drawer Body */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 font-sans text-xs bg-[#C0C0C0]">
        {/* Form Container */}
        <div className="retro-window p-2.5 bg-[#C0C0C0]">
          <div className="font-heading text-xs font-bold text-[#000080] mb-2 uppercase border-b border-[#808080] pb-1">
            Capture Parameters
          </div>

          <div className="space-y-2">
            <div>
              <label className="block text-[11px] font-mono font-bold text-[#000000] mb-0.5">
                GESTURE LABEL:
              </label>
              <input
                type="text"
                value={labelName}
                onChange={e => setLabelName(e.target.value)}
                placeholder="e.g. A, B, NAMASTE, HELLO"
                disabled={isRecording || isCountingDown}
                className="retro-input w-full font-mono font-bold"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#000000] mb-0.5">
                  SIGNER ID:
                </label>
                <input
                  type="text"
                  value={signerName}
                  onChange={e => setSignerName(e.target.value)}
                  disabled={isRecording || isCountingDown}
                  className="retro-input w-full font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono font-bold text-[#000000] mb-0.5">
                  TARGET FRAMES:
                </label>
                <input
                  type="number"
                  value={targetFrames}
                  onChange={e => setTargetFrames(Number(e.target.value) || 100)}
                  disabled={isRecording || isCountingDown}
                  className="retro-input w-full font-mono"
                />
              </div>
            </div>

            {/* Trigger Button */}
            {!isRecording && !isCountingDown ? (
              <button
                onClick={startRecordingFlow}
                className="retro-btn retro-btn-primary w-full py-2 font-bold text-xs mt-2"
              >
                <Play className="w-3.5 h-3.5 stroke-[2px]" />
                <span>[ START RECORDING ({targetFrames} FRAMES) ]</span>
              </button>
            ) : isCountingDown ? (
              <div className="retro-inset bg-[#FFFFCC] p-3 text-center">
                <span className="text-2xl font-black font-mono text-[#CC0000] animate-bounce block">
                  {countdown}
                </span>
                <span className="text-[11px] font-bold text-[#000000]">GET READY TO SIGN...</span>
              </div>
            ) : (
              <div className="retro-inset bg-[#FFFFCC] p-2 space-y-1">
                <div className="flex items-center justify-between text-[11px] font-mono font-bold text-[#000080]">
                  <span>RECORDING IN PROGRESS...</span>
                  <span>{recordedFrames.length} / {targetFrames}</span>
                </div>
                {/* 90s Segmented Progress Bar */}
                <div className="w-full bg-[#808080] h-3 retro-inset p-0.5 flex">
                  <div
                    className="bg-[#00AA00] h-full"
                    style={{ width: `${(recordedFrames.length / targetFrames) * 100}%` }}
                  />
                </div>
                <button
                  onClick={cancelRecording}
                  className="retro-btn retro-btn-danger w-full text-[11px] py-1 mt-1"
                >
                  [ CANCEL RECORDING ]
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Live Vector Feed Status */}
        <div className="retro-inset bg-[#FFFFFF] p-2 flex items-center justify-between text-[11px] font-mono">
          <span className="text-[#808080] font-bold">VECTOR STREAM:</span>
          <span className={latestNormalizedFeatures ? 'text-[#00AA00] font-bold' : 'text-[#808080]'}>
            {latestNormalizedFeatures ? 'ONLINE (240 FLOATS)' : 'WAITING FOR CAMERA'}
          </span>
        </div>

        {/* Recorded Samples Table */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <h4 className="font-heading text-xs font-bold text-[#000000] uppercase">
              Recorded Samples ({recordedSamples.length})
            </h4>
            {recordedSamples.length > 0 && (
              <button
                onClick={exportAllJSON}
                className="retro-btn !px-2 !py-0.5 text-[11px]"
              >
                <Download className="w-3 h-3 stroke-[2px]" />
                <span>Export All (JSON)</span>
              </button>
            )}
          </div>

          {recordedSamples.length === 0 ? (
            <div className="retro-inset bg-[#FFFFFF] p-6 text-center text-[#808080] font-mono text-xs">
              [ NO SAMPLES RECORDED THIS SESSION ]
            </div>
          ) : (
            <div className="space-y-1 retro-inset bg-[#FFFFFF] p-1 max-h-[220px] overflow-y-auto">
              {recordedSamples.map((sample, idx) => (
                <div
                  key={sample.id}
                  className={`p-1.5 border-b border-[#808080] flex items-center justify-between ${
                    idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#E8E8E8]'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-xs text-[#000080]">
                        {sample.label}
                      </span>
                      <span className="retro-inset px-1 text-[9px] font-mono bg-[#C0C0C0]">
                        {sample.frameCount} frames
                      </span>
                    </div>
                    <p className="text-[10px] text-[#808080] font-mono">
                      {new Date(sample.timestamp).toLocaleTimeString()} • {sample.signer}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => exportSampleJSON(sample)}
                      className="retro-btn !p-1 text-[10px]"
                      title="Export as JSON"
                    >
                      <FileText className="w-3 h-3 stroke-[2px]" />
                    </button>
                    <button
                      onClick={() => exportSampleCSV(sample)}
                      className="retro-btn !p-1 text-[10px]"
                      title="Export as CSV"
                    >
                      <FileSpreadsheet className="w-3 h-3 stroke-[2px]" />
                    </button>
                    <button
                      onClick={() => deleteSample(sample.id)}
                      className="retro-btn retro-btn-danger !p-1 text-[10px]"
                      title="Delete Sample"
                    >
                      <Trash2 className="w-3 h-3 stroke-[2px]" />
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
