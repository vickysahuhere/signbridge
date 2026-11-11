import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Camera,
  CameraOff,
  AlertCircle,
  RefreshCw,
  Activity,
  Video,
  Sparkles,
  HelpCircle,
  Maximize2,
  ArrowRightLeft,
  Hand,
  CheckCircle2,
  X,
  Undo2,
  Trash2,
  LayoutGrid,
  Copy,
  Check,
  ExternalLink,
  Users,
  Radio,
  Hash
} from 'lucide-react';
import { startCameraLoop } from '../vision/cameraLoop.js';
import { drawSkeleton, checkBoundaryAlert } from '../vision/drawSkeleton.js';
import { IncomingSubtitleOverlay } from './IncomingSubtitleOverlay.jsx';

export function SignerStage({
  onFrame,
  latestLandmarks,
  isWorkerReady = false,
  onFpsUpdate,
  fps = 0,
  profilingData = null,
  commitPauseMs = 700,
  onPauseChange = null,
  motionState = { state: 'IDLE', pauseProgress: 0, rollingVelocity: 0 },
  bufferSize = 0,
  alphabetPredictions = [],
  wordPredictions = { topCandidates: [], confirmedWord: null },
  latestConfirmedWord = null,
  latestReply = null,
  recognitionMode = 'word',
  onToggleMode = null,
  localStream = null,
  onStreamChange = null,
  remoteStream = null,
  peerPresence = { isOnline: false, name: '' },
  onOpenGuide = null,
  candidates = [],
  isCandidateLive = false,
  onSelectCandidate = null,
  onDismissCandidates = null,
  onSetInteracting = null,
  currentGlosses = [],
  onUndo = null,
  onClear = null,
  roomId = '',
  onSwitchRoom = null,
  onCopyLink = null
}) {
  const videoRef = useRef(null);
  const localStreamRef = useRef(null);
  const canvasRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [boundaryAlert, setBoundaryAlert] = useState({ isOutOfFrame: false, message: '' });
  const [layoutMode, setLayoutMode] = useState('grid'); // 'grid' | 'local-focus' | 'remote-focus'
  const [showProfiler, setShowProfiler] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isSwitchingRoom, setIsSwitchingRoom] = useState(false);
  const [switchRoomInput, setSwitchRoomInput] = useState('');
  const lastProfileLogRef = useRef(0);

  // Periodic profiling console log
  useEffect(() => {
    if (!isCameraActive || !profilingData) return;
    const now = performance.now();
    if (now - lastProfileLogRef.current > 3000) {
      lastProfileLogRef.current = now;
      const gateDelay = profilingData.wordGateDelayMs || (recognitionMode === 'word' ? 200 : 167);
      const commitDelay = 1200;
      const holistic = profilingData.holisticMs || 0;
      const classifier = profilingData.classifierMs || 0;
      const norm = profilingData.normMs || 0;
      const e2e = Math.round(holistic + norm + classifier + gateDelay + commitDelay);
      console.log('[SignBridge Profiler]', {
        cameraFps: fps,
        holisticMs: holistic,
        ruleModelMs: classifier,
        normMs: norm,
        gateDelayMs: gateDelay,
        commitDelayMs: commitDelay,
        endToEndSignToTextMs: e2e
      });
    }
  }, [isCameraActive, profilingData, fps, recognitionMode]);

  // When remote stream arrives, ensure grid or remote focus
  useEffect(() => {
    if (remoteStream && layoutMode === 'local-focus') {
      setLayoutMode('grid');
    }
  }, [remoteStream]);

    // Keep local video element in sync with the active MediaStream
  useEffect(() => {
    const activeStream = localStream || localStreamRef.current;
    if (videoRef.current && activeStream) {
      if (videoRef.current.srcObject !== activeStream) {
        videoRef.current.srcObject = activeStream;
      }
      if (videoRef.current.paused) {
        videoRef.current.play().catch((err) => {
          console.warn('[SignerStage] Local video play error:', err);
        });
      }
    }
  }, [localStream, isCameraActive, layoutMode]);

  // Attach remote video stream when received (Strictly presentation sink: no worker processing!)
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      if (remoteVideoRef.current.srcObject !== remoteStream) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
      remoteVideoRef.current.play().catch((err) => {
        console.warn('[SignerStage] Remote video playback error:', err);
      });
    }
  }, [remoteStream]);

  const frameCountRef = useRef(0);
  const lastFpsCalcTimeRef = useRef(performance.now());

  // Synchronize canvas resolution with video sensor resolution
  const syncCanvasDimensions = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const vw = videoRef.current.videoWidth;
      const vh = videoRef.current.videoHeight;
      if (vw > 0 && vh > 0) {
        if (canvasRef.current.width !== vw || canvasRef.current.height !== vh) {
          canvasRef.current.width = vw;
          canvasRef.current.height = vh;
        }
      }
    }
  }, []);

  // Start local camera media stream
  const startCamera = useCallback(async () => {
    setIsLoadingCamera(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          aspectRatio: { ideal: 1.7777777778 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        },
        audio: false
      });

      localStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('[SignerStage] play warning:', playErr);
        }
        setIsCameraActive(true);
        syncCanvasDimensions();
      }
      if (onStreamChange) {
        onStreamChange(stream);
      }
    } catch (err) {
      console.error('[SignerStage] Camera access denied or failed:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in browser settings.'
          : `Video capture error: ${err.message || 'Unknown device error'}`
      );
      setIsCameraActive(false);
    } finally {
      setIsLoadingCamera(false);
    }
  }, [onStreamChange, syncCanvasDimensions]);

  // Stop local camera media stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    localStreamRef.current = null;
    if (onStreamChange) {
      onStreamChange(null);
    }
    setIsCameraActive(false);
    setBoundaryAlert({ isOutOfFrame: false, message: '' });
    if (onFpsUpdate) onFpsUpdate(0);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [onFpsUpdate, onStreamChange]);

  // Automatically start camera when SignerStage mounts
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Wire hardware-synchronized camera loop (LOCAL CAMERA ONLY)
  useEffect(() => {
    if (!isCameraActive || !videoRef.current) return;

    const videoEl = videoRef.current;

    const stopLoop = startCameraLoop(videoEl, (video, timestamp, metadata) => {
      syncCanvasDimensions();
      frameCountRef.current += 1;
      const now = performance.now();
      const delta = now - lastFpsCalcTimeRef.current;
      if (delta >= 1000) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / delta);
        if (onFpsUpdate) onFpsUpdate(calculatedFps);
        frameCountRef.current = 0;
        lastFpsCalcTimeRef.current = now;
      }

      // Local hardware inference only: send local frame to worker
      if (onFrame) {
        onFrame(video, timestamp);
      }
    });

    return () => {
      stopLoop();
    };
  }, [isCameraActive, onFrame, onFpsUpdate, syncCanvasDimensions]);

  // Render 3D skeleton and perform boundary detection on each landmark update
  useEffect(() => {
    if (!canvasRef.current || !isCameraActive) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (showSkeleton && latestLandmarks) {
      drawSkeleton(ctx, latestLandmarks);
    }

    if (latestLandmarks) {
      const alertState = checkBoundaryAlert(latestLandmarks, canvas.width, canvas.height);
      setBoundaryAlert(alertState);
    }
  }, [latestLandmarks, showSkeleton, isCameraActive]);

  const hasLeftHand = Boolean(latestLandmarks && latestLandmarks.leftHandLandmarks && latestLandmarks.leftHandLandmarks.length > 0);
  const hasRightHand = Boolean(latestLandmarks && latestLandmarks.rightHandLandmarks && latestLandmarks.rightHandLandmarks.length > 0);
  const hasRemote = Boolean(remoteStream);

  // Active candidate list to display - Strictly isolated by recognitionMode
  const displayList = useMemo(() => {
    const raw = candidates.length > 0
      ? candidates
      : (recognitionMode === 'word' ? (wordPredictions?.topCandidates || []) : (alphabetPredictions || []));
    if (recognitionMode === 'word') {
      return (raw || []).filter(c => !c.isAlphabetHint && !/^[A-Z]$/.test(c.label?.trim()));
    }
    return (raw || []).filter(c => /^[A-Z]$/.test(c.label?.trim()));
  }, [candidates, recognitionMode, wordPredictions, alphabetPredictions]);

  const handleCopyInvite = () => {
    if (onCopyLink) {
      onCopyLink();
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2200);
  };

  const handleCopyCode = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard && roomId) {
      navigator.clipboard.writeText(roomId);
    }
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleSwitchRoomSubmit = (e) => {
    e.preventDefault();
    if (switchRoomInput.trim() && onSwitchRoom) {
      onSwitchRoom(switchRoomInput.trim());
      setIsSwitchingRoom(false);
      setSwitchRoomInput('');
    }
  };

  return (
    <div className="cartoon-card w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
      {/* 1. Header Bar: Stage Identity & Layout Controls */}
      <div className="px-3 py-2.5 border-b-2 border-zinc-900 bg-[#EAF6E8] flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center text-white flex-shrink-0">
            <Video className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-black text-sm sm:text-base text-zinc-900 truncate">
              {hasRemote ? 'Dual-Camera Sign Call' : 'Sign Calling Stage'}
            </span>
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-amber-300 text-amber-950 border border-amber-600/70 shadow-none leading-none flex-shrink-0">
              P2P Call
            </span>
          </div>
          {isCameraActive && (
            <span className="cartoon-badge !py-0.5 !px-2 text-xs bg-[#58CC02] text-white hidden sm:inline-flex font-bold">
              ● Live
            </span>
          )}
        </div>

        {/* View Mode Switcher & Hand Status */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Layout Mode Toggles */}
          <div className="flex items-center bg-white p-0.5 rounded-lg border border-zinc-300">
            <button
              onClick={() => setLayoutMode('grid')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                layoutMode === 'grid'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Dual Camera Grid (Both visible side-by-side)"
            >
              <LayoutGrid className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden sm:inline">Dual Grid</span>
            </button>
            <button
              onClick={() => setLayoutMode(layoutMode === 'local-focus' ? 'grid' : 'local-focus')}
              className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                layoutMode === 'local-focus'
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
              title="Focus Your Camera"
            >
              <Maximize2 className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden sm:inline">You</span>
            </button>
            {hasRemote && (
              <button
                onClick={() => setLayoutMode(layoutMode === 'remote-focus' ? 'grid' : 'remote-focus')}
                className={`px-2.5 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all ${
                  layoutMode === 'remote-focus'
                    ? 'bg-zinc-900 text-white'
                    : 'text-zinc-600 hover:text-zinc-900'
                }`}
                title="Focus Partner Camera"
              >
                <Users className="w-3.5 h-3.5 stroke-[2.2]" />
                <span className="hidden sm:inline">Partner</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-300">
            <span>Hands:</span>
            <span className={hasLeftHand ? 'text-[#58CC02]' : 'text-zinc-400'}>L</span>
            <span>•</span>
            <span className={hasRightHand ? 'text-[#58CC02]' : 'text-zinc-400'}>R</span>
          </div>
        </div>
      </div>

      {/* 2. Main Viewport Area: True Dual-Camera Calling Grid */}
      <div className="p-2 sm:p-2.5 flex-1 min-h-0 flex flex-col justify-between overflow-hidden bg-[#EDF7EC]">
        <div className="relative w-full flex-1 min-h-0 overflow-hidden flex items-center justify-center">
          
          {/* Subtitle Overlay for Incoming Partner Replies */}
          <IncomingSubtitleOverlay latestReply={latestReply} />

          {/* ======================================================== */}
          {/* UNIFIED PERSISTENT STAGE: ZERO UNMOUNTING, ZERO BLACKOUT */}
          {/* ======================================================== */}
          <div
            className={
              layoutMode === 'grid'
                ? "grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 w-full h-full min-h-0 relative"
                : "relative w-full h-full min-h-0"
            }
          >
            {/* PANE 1: LOCAL SIGNER CAMERA (WITH SKELETON AI) */}
            <div
              className={
                layoutMode === 'grid'
                  ? "relative w-full h-full min-h-0 rounded-2xl border-2 border-zinc-900 bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner"
                  : layoutMode === 'local-focus'
                  ? "absolute inset-0 w-full h-full min-h-0 rounded-2xl border-2 border-zinc-900 bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner z-10"
                  : "absolute bottom-3 right-3 z-30 cartoon-card bg-zinc-950 p-1 border-2 border-zinc-900 shadow-cartoon-md max-w-[220px] w-[35%] sm:w-[180px] aspect-[4/3] overflow-hidden cursor-pointer rounded-2xl transition-all hover:scale-105"
              }
              onClick={layoutMode === 'remote-focus' ? () => setLayoutMode('local-focus') : undefined}
              title={layoutMode === 'remote-focus' ? "Click to focus your camera" : undefined}
            >
              {/* Local Signer Header Badge */}
              <div className="absolute top-2.5 left-2.5 z-20 cartoon-badge bg-white/95 backdrop-blur-sm text-zinc-900 text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm border border-zinc-300">
                <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-[#58CC02] animate-pulse' : 'bg-zinc-400'}`} />
                <span>{layoutMode === 'local-focus' ? 'You (Signer Focus)' : 'You (Signer)'}</span>
                {isCameraActive && (
                  <span className="text-[9px] font-mono text-zinc-500 font-bold">• {fps || 30} FPS</span>
                )}
              </div>

              {/* Local Video Stream - object-cover ensures edge-to-edge camera feed without black bars */}
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                disablePictureInPicture
                onLoadedMetadata={syncCanvasDimensions}
                className="absolute inset-0 w-full h-full object-cover -scale-x-100"
              />

              {/* Skeleton Canvas (Local user only) */}
              <canvas
                ref={canvasRef}
                width={1280}
                height={720}
                className={`absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none z-10 ${
                  isCameraActive && showSkeleton ? 'block' : 'hidden'
                }`}
              />

              {/* Camera Off Placeholder Screen */}
              {!isCameraActive && !cameraError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-950 text-white z-10">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-900 border-2 border-zinc-700 flex items-center justify-center mb-2.5 shadow-cartoon">
                    <Camera className="w-6 h-6 text-[#58CC02] stroke-[2.2]" />
                  </div>
                  <h4 className="font-extrabold text-sm text-white mb-1">
                    Your Camera is Inactive
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-xs mb-3 font-medium">
                    Start your camera to enable real-time ISL gesture tracking and video calling.
                  </p>
                  <button
                    onClick={startCamera}
                    disabled={isLoadingCamera}
                    className="cartoon-btn cartoon-btn-mint py-1.5 px-4 text-xs font-black shadow-cartoon-sm"
                  >
                    <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>{isLoadingCamera ? 'Starting Camera...' : 'Start Camera'}</span>
                  </button>
                </div>
              )}

              {/* Out of Frame Alert Notice */}
              {boundaryAlert.isOutOfFrame && isCameraActive && layoutMode !== 'remote-focus' && (
                <div className="absolute top-2 inset-x-2 z-20 flex justify-center pointer-events-none">
                  <div className="cartoon-badge bg-[#FFC800] text-zinc-900 border border-zinc-900 px-2.5 py-0.5 font-bold text-[10px] flex items-center gap-1 shadow-sm">
                    <AlertCircle className="w-3 h-3 text-zinc-900 stroke-[2.5]" />
                    <span>Keep both hands centered inside camera</span>
                  </div>
                </div>
              )}

              {/* Floating Candidate Suggestions Card */}
              {isCameraActive && displayList && displayList.length > 0 && layoutMode !== 'remote-focus' && (
                <div
                  onMouseEnter={() => onSetInteracting && onSetInteracting(true)}
                  onMouseLeave={() => onSetInteracting && onSetInteracting(false)}
                  className="absolute top-2.5 right-2.5 z-20 cartoon-card bg-white p-2.5 border-2 border-zinc-900 shadow-cartoon w-[210px] max-w-[85%] select-none animate-in fade-in duration-150"
                >
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-200">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-ping" />
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-zinc-900 text-white leading-none">
                        Detected Sign
                      </span>
                    </div>
                    {onDismissCandidates && (
                      <button
                        onClick={onDismissCandidates}
                        className="text-zinc-400 hover:text-zinc-900 p-0.5 rounded"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {displayList[0] && (
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-1.5">
                          <span className="font-extrabold text-sm text-zinc-900 truncate">
                            {displayList[0].label}
                          </span>
                          <span className="font-mono text-[10px] text-zinc-500 font-bold">
                            {Math.round(displayList[0].confidence * 100)}%
                          </span>
                        </div>
                      </div>
                      {onSelectCandidate && (
                        <button
                          onClick={() => onSelectCandidate(displayList[0].label, 'smart')}
                          className="cartoon-btn cartoon-btn-mint !py-0.5 !px-2 text-[10px] font-black flex-shrink-0"
                          title="Select top prediction"
                        >
                          Select
                        </button>
                      )}
                    </div>
                  )}

                  {displayList.length > 1 && (
                    <div className="space-y-1 pt-1.5 border-t border-zinc-100">
                      <span className="text-[9px] font-bold text-zinc-400 block uppercase">Other Options</span>
                      <div className="flex flex-wrap gap-1">
                        {displayList.slice(1, 4).map((cand) => (
                          <button
                            key={cand.label}
                            onClick={() => onSelectCandidate && onSelectCandidate(cand.label, 'smart')}
                            className="text-[10px] font-bold px-1.5 py-0.5 bg-zinc-100 hover:bg-[#FFD15C] text-zinc-700 hover:text-zinc-900 rounded border border-zinc-300 transition-colors"
                          >
                            {cand.label} ({Math.round(cand.confidence * 100)}%)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {currentGlosses.length > 0 && (
                    <div className="mt-2 pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px]">
                      <button
                        onClick={onUndo}
                        className="text-zinc-500 hover:text-zinc-900 font-bold flex items-center gap-0.5"
                      >
                        <Undo2 className="w-3 h-3" />
                        <span>Undo</span>
                      </button>
                      <button
                        onClick={onClear}
                        className="text-rose-500 hover:text-rose-700 font-bold flex items-center gap-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* PANE 2: REMOTE PARTNER VIDEO (OR WAITING CARD) */}
            <div
              className={
                layoutMode === 'grid'
                  ? "relative w-full h-full min-h-0 rounded-2xl border-2 border-zinc-900 bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner"
                  : layoutMode === 'remote-focus'
                  ? "absolute inset-0 w-full h-full min-h-0 rounded-2xl border-2 border-zinc-900 bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner z-10"
                  : "absolute bottom-3 right-3 z-30 cartoon-card bg-zinc-950 p-1 border-2 border-zinc-900 shadow-cartoon-md max-w-[220px] w-[35%] sm:w-[180px] aspect-[4/3] overflow-hidden cursor-pointer rounded-2xl transition-all hover:scale-105"
              }
              onClick={layoutMode === 'local-focus' ? () => setLayoutMode('remote-focus') : undefined}
              title={layoutMode === 'local-focus' ? "Click to focus partner camera" : undefined}
            >
              {hasRemote ? (
                <>
                  {/* Partner Header Badge */}
                  <div className="absolute top-2.5 left-2.5 z-20 cartoon-badge bg-white/95 backdrop-blur-sm text-zinc-900 text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm border border-zinc-300">
                    <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-pulse" />
                    <span>{peerPresence?.name || 'Partner'}</span>
                    <span className="text-[9px] font-mono text-[#0284C7] font-bold">• P2P Live</span>
                  </div>

                  {/* Remote Video Stream (Zero AI inference locally: presentation sink only) */}
                  <video
                    ref={remoteVideoRef}
                    playsInline
                    autoPlay
                    className="w-full h-full object-cover"
                  />
                </>
              ) : (
                /* Waiting for Partner Join Card */
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#18181B] text-zinc-200 select-none">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center mb-2.5 shadow-cartoon">
                    <Users className="w-6 h-6 text-sky-400 stroke-[2.2]" />
                  </div>

                  <h4 className="font-extrabold text-sm text-white mb-0.5">
                    Waiting for Call Partner
                  </h4>
                  <p className="text-[11px] text-zinc-400 max-w-xs mb-3 font-medium">
                    Share your room link. Both cameras will appear side-by-side with real-time sign auto-conversion.
                  </p>

                  {/* Room Info Pill with Copy Code */}
                  <div className="flex items-center gap-1.5 mb-3 flex-wrap justify-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300">
                      <span className="text-zinc-500 font-sans text-[10px] font-bold">Room Code:</span>
                      <span className="font-black text-amber-400 tracking-wider">{roomId || 'main'}</span>
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="ml-1 p-1 hover:text-white text-zinc-400 rounded transition-colors"
                        title="Copy Room Code"
                      >
                        {copiedCode ? (
                          <Check className="w-3.5 h-3.5 text-emerald-400 stroke-[2.5]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5 stroke-[2.2]" />
                        )}
                      </button>
                    </div>

                    {copiedCode && (
                      <span className="text-[10px] font-bold text-emerald-400">Code Copied!</span>
                    )}
                  </div>

                  {/* Primary Sharing & Switch Actions */}
                  {!isSwitchingRoom ? (
                    <div className="flex items-center gap-2 flex-wrap justify-center">
                      <button
                        onClick={handleCopyInvite}
                        className="cartoon-btn bg-[#38BDF8] hover:bg-[#0284C7] text-zinc-950 font-black py-1.5 px-3 text-xs flex items-center gap-1.5 shadow-cartoon-sm"
                      >
                        {copiedLink ? (
                          <>
                            <Check className="w-3.5 h-3.5 stroke-[2.5] text-zinc-950" />
                            <span>Link Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Copy Call Link</span>
                          </>
                        )}
                      </button>

                      {onSwitchRoom && (
                        <button
                          type="button"
                          onClick={() => setIsSwitchingRoom(true)}
                          className="cartoon-btn bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-1.5 px-2.5 text-xs flex items-center gap-1"
                          title="Join another room code"
                        >
                          <Hash className="w-3.5 h-3.5" />
                          <span>Join Code</span>
                        </button>
                      )}

                      <a
                        href={`?room=${encodeURIComponent(roomId || 'main')}&page=chat`}
                        target="_blank"
                        rel="noreferrer"
                        className="cartoon-btn bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-1.5 px-2 text-xs flex items-center gap-1"
                        title="Open in new window to test peer call"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Test Peer</span>
                      </a>
                    </div>
                  ) : (
                    <form
                      onSubmit={handleSwitchRoomSubmit}
                      className="flex items-center gap-1.5 max-w-xs w-full bg-zinc-900 p-1.5 rounded-xl border border-zinc-700"
                    >
                      <input
                        type="text"
                        value={switchRoomInput}
                        onChange={(e) => setSwitchRoomInput(e.target.value)}
                        placeholder="Enter room code to join..."
                        autoFocus
                        className="flex-1 px-2.5 py-1 text-xs font-mono font-bold bg-zinc-800 text-white rounded border border-zinc-700 focus:outline-none min-w-0"
                      />
                      <button
                        type="submit"
                        className="cartoon-btn bg-[#38BDF8] text-zinc-950 font-black py-1 px-2.5 text-xs"
                      >
                        Join
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSwitchingRoom(false);
                          setSwitchRoomInput('');
                        }}
                        className="text-xs text-zinc-400 hover:text-white px-1 font-bold"
                      >
                        ✕
                      </button>
                    </form>
                  )}

                  {peerPresence?.isOnline && !hasRemote && (
                    <div className="mt-3 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[11px] font-bold text-emerald-300 flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Partner online ({peerPresence.name}) • Initializing video stream...</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Camera Permission / Device Error Screen */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-950/95 z-40">
              <div className="cartoon-card max-w-sm w-full p-5 bg-white text-center flex flex-col items-center shadow-cartoon-lg">
                <div className="w-12 h-12 rounded-2xl bg-[#FF4B4B] border-2 border-zinc-900 flex items-center justify-center shadow-cartoon mb-3">
                  <AlertCircle className="w-7 h-7 text-white stroke-[2.5]" />
                </div>
                <h3 className="font-extrabold text-base text-zinc-900 mb-1">
                  Camera Access Needed
                </h3>
                <p className="text-xs text-zinc-600 mb-4 leading-relaxed">
                  {cameraError}
                </p>
                <button
                  onClick={startCamera}
                  className="cartoon-btn cartoon-btn-coral w-full py-2 text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          )}

          {/* Telemetry Profiler Panel (Conditional) */}
          {showProfiler && (
            <div className="absolute top-10 left-3 z-40 cartoon-card bg-white p-3 border-2 border-zinc-900 shadow-cartoon-md w-[220px] text-xs font-mono select-none">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-200">
                <span className="font-bold text-zinc-900 text-[11px]">AI Profiler (Local)</span>
                <button
                  onClick={() => setShowProfiler(false)}
                  className="w-4 h-4 text-zinc-400 hover:text-zinc-900 text-xs font-bold"
                >
                  ×
                </button>
              </div>
              <div className="space-y-1 text-[10px] text-zinc-700">
                <div className="flex justify-between">
                  <span>Camera:</span>
                  <span className="font-bold">{fps || 30} FPS</span>
                </div>
                <div className="flex justify-between">
                  <span>Holistic AI:</span>
                  <span className="font-bold">{profilingData?.holisticMs ?? 0} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Rule Model:</span>
                  <span>{profilingData?.classifierMs ?? 0} ms</span>
                </div>
                <div className="flex justify-between">
                  <span>Gate Delay:</span>
                  <span className="text-amber-700 font-bold">
                    {profilingData?.wordGateDelayMs || (recognitionMode === 'word' ? 200 : 167)} ms
                  </span>
                </div>
                <div className="pt-1 mt-1 border-t border-zinc-200 flex justify-between font-bold text-zinc-950">
                  <span>Total Latency:</span>
                  <span className="text-[#16A34A]">
                    ~{Math.round((profilingData?.holisticMs || 0) + (profilingData?.wordGateDelayMs || 150) + commitPauseMs)} ms
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 3. Bottom Controls Bar */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 mt-2 pt-1 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-1 sm:gap-1.5 flex-wrap">
            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="cartoon-btn cartoon-btn-coral !py-1 !px-2 sm:!px-2.5 text-xs font-bold flex-shrink-0"
              >
                <CameraOff className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Stop Camera</span>
              </button>
            ) : (
              <button
                onClick={startCamera}
                disabled={isLoadingCamera}
                className="cartoon-btn cartoon-btn-mint !py-1 !px-2 sm:!px-2.5 text-xs font-bold flex-shrink-0"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Start Camera</span>
              </button>
            )}

            {isCameraActive && (
              <button
                onClick={() => setShowSkeleton(!showSkeleton)}
                className={`cartoon-btn !py-1 !px-2 sm:!px-2.5 text-xs font-bold flex-shrink-0 ${
                  showSkeleton ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-700'
                }`}
                title="Toggle skeleton landmarks overlay"
              >
                <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Skeleton {showSkeleton ? 'On' : 'Off'}</span>
              </button>
            )}

            <button
              onClick={() => setShowProfiler(prev => !prev)}
              className={`cartoon-btn !py-1 !px-2 text-xs font-bold flex-shrink-0 ${
                showProfiler ? 'bg-[#FFC800] text-zinc-900' : 'bg-white text-zinc-600'
              }`}
              title="Toggle Pipeline Latency HUD"
            >
              <span>Telemetry</span>
            </button>

            {currentGlosses && currentGlosses.length > 0 && onUndo && (
              <button
                type="button"
                onClick={onUndo}
                className="cartoon-btn !py-1 !px-2 sm:!px-2.5 text-xs font-extrabold bg-white text-zinc-800 hover:text-zinc-950 flex items-center gap-1 border-2 border-zinc-900 shadow-cartoon-sm flex-shrink-0"
                title="Undo last sign (1-click)"
              >
                <Undo2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Undo ({currentGlosses.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500 flex-shrink-0">
            <span>Buffer:</span>
            <span className="font-bold text-zinc-800">{bufferSize}/30</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignerStage;
