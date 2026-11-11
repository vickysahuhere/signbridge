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
  Radio
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
  onCopyLink = null
}) {
  const videoRef = useRef(null);
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
          {/* DUAL CAMERA GRID VIEW (DEFAULT)                          */}
          {/* ======================================================== */}
          {layoutMode === 'grid' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-2.5 w-full h-full min-h-0">
              
              {/* PANE 1: LOCAL SIGNER CAMERA (WITH SKELETON AI) */}
              <div className="relative w-full h-full min-h-0 rounded-2xl border-2 border-zinc-900 bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner">
                {/* Local Signer Header Badge */}
                <div className="absolute top-2.5 left-2.5 z-20 cartoon-badge bg-white/95 backdrop-blur-sm text-zinc-900 text-[10px] font-extrabold flex items-center gap-1.5 shadow-sm border border-zinc-300">
                  <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-[#58CC02] animate-pulse' : 'bg-zinc-400'}`} />
                  <span>You (Signer)</span>
                  {isCameraActive && (
                    <span className="text-[9px] font-mono text-zinc-500 font-bold">• {fps || 30} FPS</span>
                  )}
                </div>

                {/* Local Video Stream */}
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  disablePictureInPicture
                  onLoadedMetadata={syncCanvasDimensions}
                  className="absolute inset-0 w-full h-full object-contain -scale-x-100"
                />

                {/* Skeleton Canvas (Local user only) */}
                <canvas
                  ref={canvasRef}
                  width={1280}
                  height={720}
                  className={`absolute inset-0 w-full h-full object-contain -scale-x-100 pointer-events-none z-10 ${
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
                {boundaryAlert.isOutOfFrame && isCameraActive && (
                  <div className="absolute top-2 inset-x-2 z-20 flex justify-center pointer-events-none">
                    <div className="cartoon-badge bg-[#FFC800] text-zinc-900 border border-zinc-900 px-2.5 py-0.5 font-bold text-[10px] flex items-center gap-1 shadow-sm">
                      <AlertCircle className="w-3 h-3 text-zinc-900 stroke-[2.5]" />
                      <span>Keep both hands centered inside camera</span>
                    </div>
                  </div>
                )}

                {/* Floating Candidate Suggestions Card */}
                {isCameraActive && displayList && displayList.length > 0 && (
                  <div
                    onMouseEnter={() => onSetInteracting && onSetInteracting(true)}
                    onMouseLeave={() => onSetInteracting && onSetInteracting(false)}
                    className="absolute top-2.5 right-2.5 z-20 cartoon-card bg-white p-2.5 border-2 border-zinc-900 shadow-cartoon w-[210px] max-w-[85%] select-none animate-in fade-in duration-150"
                  >
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-200">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-pulse" />
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-700 font-mono">
                          {displayList[0]?.isAlphabetHint ? 'Letter Match' : 'Detected Sign'}
                        </span>
                      </div>
                      {onDismissCandidates && (
                        <button
                          onClick={onDismissCandidates}
                          className="w-4 h-4 rounded text-zinc-400 hover:text-zinc-900 flex items-center justify-center text-xs font-bold"
                          title="Dismiss"
                        >
                          <X className="w-3 h-3 stroke-[2.5]" />
                        </button>
                      )}
                    </div>

                    {displayList[0] && (
                      <div className="p-2 rounded-xl bg-[#FFF9E5] border border-amber-200 mb-1.5">
                        <div className="flex items-start justify-between gap-1.5 mb-1">
                          <div className="min-w-0">
                            <div className="font-black text-sm sm:text-base text-zinc-950 truncate">
                              {displayList[0].label}
                            </div>
                          </div>
                          <span className="font-mono text-xs font-black text-[#16A34A] bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                            {Math.round(displayList[0].confidence * 100)}%
                          </span>
                        </div>

                        {onSelectCandidate && (
                          <button
                            onClick={() => onSelectCandidate(displayList[0].label, 'smart')}
                            className="cartoon-btn !py-1 !px-2.5 text-xs sm:text-sm w-full bg-white hover:bg-zinc-100 text-zinc-900 font-black"
                          >
                            + Use Sign
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* PANE 2: REMOTE PARTNER VIDEO (OR WAITING CARD) */}
              <div className="relative w-full h-full min-h-0 rounded-2xl border-2 border-zinc-900 bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner">
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
                      className="w-full h-full object-contain"
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

                    {/* Room Info Pill */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-700 text-xs font-mono text-zinc-300 mb-3">
                      <span className="text-zinc-500 font-sans text-[10px] font-bold">Room:</span>
                      <span className="font-black text-amber-400">{roomId || 'main'}</span>
                    </div>

                    {/* Copy Link Button */}
                    <div className="flex items-center gap-2">
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

                      <a
                        href={`?room=${encodeURIComponent(roomId || 'main')}`}
                        target="_blank"
                        rel="noreferrer"
                        className="cartoon-btn bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-bold py-1.5 px-2 text-xs flex items-center gap-1"
                        title="Open in new window to test peer call"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Test Peer</span>
                      </a>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================================== */}
          {/* FOCUS MODES (LOCAL FOCUS OR REMOTE FOCUS WITH PiP)       */}
          {/* ======================================================== */}
          {layoutMode !== 'grid' && (
            <div className="relative w-full h-full min-h-0 rounded-2xl border-2 border-zinc-900 bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner">
              
              {/* PRIMARY FOCUSED VIDEO */}
              {layoutMode === 'local-focus' ? (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    autoPlay
                    muted
                    disablePictureInPicture
                    onLoadedMetadata={syncCanvasDimensions}
                    className="absolute inset-0 w-full h-full object-contain -scale-x-100"
                  />
                  <canvas
                    ref={canvasRef}
                    width={1280}
                    height={720}
                    className={`absolute inset-0 w-full h-full object-contain -scale-x-100 pointer-events-none z-10 ${
                      isCameraActive && showSkeleton ? 'block' : 'hidden'
                    }`}
                  />
                  <div className="absolute top-2.5 left-2.5 z-20 cartoon-badge bg-white/95 text-zinc-900 text-[10px] font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-pulse" />
                    <span>You (Signer Focus)</span>
                  </div>
                </>
              ) : (
                <>
                  <video
                    ref={remoteVideoRef}
                    playsInline
                    autoPlay
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2.5 left-2.5 z-20 cartoon-badge bg-white/95 text-zinc-900 text-[10px] font-extrabold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-pulse" />
                    <span>{peerPresence?.name || 'Partner Focus'}</span>
                  </div>
                </>
              )}

              {/* INSET PiP WINDOW FOR SECONDARY STREAM */}
              <div
                onClick={() => setLayoutMode(layoutMode === 'local-focus' ? 'remote-focus' : 'local-focus')}
                className="absolute bottom-3 right-3 z-30 cartoon-card bg-white p-1 border-2 border-zinc-900 shadow-cartoon-md max-w-[200px] w-[35%] sm:w-[170px] flex flex-col select-none cursor-pointer"
                title="Click to swap focus"
              >
                <div className="px-1.5 py-0.5 text-[9px] font-bold text-zinc-800 flex items-center justify-between border-b border-zinc-200 mb-0.5">
                  <span className="truncate">{layoutMode === 'local-focus' ? (peerPresence?.name || 'Partner') : 'You'}</span>
                  <ArrowRightLeft className="w-2.5 h-2.5" />
                </div>
                <div className="aspect-[4/3] rounded bg-black overflow-hidden flex items-center justify-center">
                  <span className="text-[10px] text-zinc-400 font-bold">PiP Active</span>
                </div>
              </div>

            </div>
          )}

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
