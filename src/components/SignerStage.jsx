import React, { useRef, useState, useEffect, useCallback } from 'react';
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
  Trash2
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
  onClear = null
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [boundaryAlert, setBoundaryAlert] = useState({ isOutOfFrame: false, message: '' });
  const [isSwapped, setIsSwapped] = useState(false);
  const [showProfiler, setShowProfiler] = useState(false);
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

  // When remote stream arrives, default to Remote in Big stage, Local in PiP
  useEffect(() => {
    if (remoteStream) {
      setIsSwapped(false);
    }
  }, [remoteStream]);

  // Attach remote video stream when received
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

  // Start camera media stream
  const startCamera = useCallback(async () => {
    setIsLoadingCamera(true);
    setCameraError(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 },
          facingMode: 'user'
        },
        audio: false
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
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
  }, [onStreamChange]);

  // Stop camera media stream
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
      ctx.clearRect(0, 0, 640, 480);
    }
  }, [onFpsUpdate, onStreamChange]);

  // Wire hardware-synchronized camera loop
  useEffect(() => {
    if (!isCameraActive || !videoRef.current) return;

    const videoEl = videoRef.current;

    const stopLoop = startCameraLoop(videoEl, (video, timestamp, metadata) => {
      frameCountRef.current += 1;
      const now = performance.now();
      const delta = now - lastFpsCalcTimeRef.current;
      if (delta >= 1000) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / delta);
        if (onFpsUpdate) onFpsUpdate(calculatedFps);
        frameCountRef.current = 0;
        lastFpsCalcTimeRef.current = now;
      }

      if (onFrame) {
        onFrame(video, timestamp);
      }
    });

    return () => {
      stopLoop();
    };
  }, [isCameraActive, onFrame, onFpsUpdate]);

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
  const isRemoteBig = hasRemote && !isSwapped;

  // Active candidate list to display
  const displayList = candidates.length > 0
    ? candidates
    : (recognitionMode === 'word' ? (wordPredictions?.topCandidates || []) : (alphabetPredictions || []));

  return (
    <div className="cartoon-card w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
      {/* 1. Header Bar: Stage Identity & Quick Controls */}
      <div className="px-3.5 py-2 border-b-2 border-zinc-900 bg-[#FAF8F5] flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center text-white flex-shrink-0">
            <Video className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-extrabold text-xs sm:text-sm text-zinc-900 truncate">
              {hasRemote
                ? `Live Video Call — ${isRemoteBig ? (peerPresence?.name || 'Partner') : 'Your Camera'}`
                : 'ISL Camera Feed'}
            </span>
            <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-amber-300 text-amber-950 border border-amber-600/70 shadow-none leading-none flex-shrink-0">
              BETA
            </span>
          </div>
          {isCameraActive && (
            <span className="cartoon-badge !py-0 !px-2 text-[10px] bg-[#58CC02] text-white hidden sm:inline-flex">
              ● Active
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {hasRemote && (
            <button
              onClick={() => setIsSwapped(prev => !prev)}
              className="cartoon-btn !py-0.5 !px-2 text-xs bg-[#FFC800] text-zinc-900"
              title="Swap Big and Small video feeds"
            >
              <ArrowRightLeft className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden sm:inline">Swap View</span>
            </button>
          )}

          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-300">
            <span>Hands:</span>
            <span className={hasLeftHand ? 'text-[#58CC02]' : 'text-zinc-400'}>L</span>
            <span>•</span>
            <span className={hasRightHand ? 'text-[#58CC02]' : 'text-zinc-400'}>R</span>
          </div>
        </div>
      </div>

      {/* 2. Main Viewport Area */}
      <div className="p-2.5 sm:p-3 flex-1 min-h-0 flex flex-col justify-between overflow-hidden bg-[#FAF8F5]">
        <div className="relative w-full flex-1 min-h-0 rounded-2xl border-2 border-zinc-900 bg-zinc-950 overflow-hidden flex items-center justify-center shadow-inner">
          {/* Subtitle Overlay for Incoming Partner Replies */}
          <IncomingSubtitleOverlay latestReply={latestReply} />

          {/* ======================================================== */}
          {/* CONTAINER 1: LOCAL CAMERA VIEWPORT (WITH 3D SKELETON)   */}
          {/* ======================================================== */}
          <div
            className={
              isRemoteBig
                ? "absolute bottom-3 right-3 z-30 cartoon-card bg-white p-1 border-2 border-zinc-900 shadow-cartoon-md max-w-[210px] w-[40%] sm:w-[190px] flex flex-col select-none transition-all"
                : "absolute inset-0 w-full h-full z-0 flex items-center justify-center bg-zinc-950 overflow-hidden"
            }
          >
            {/* If Local is in PiP, show mini header with swap button */}
            {isRemoteBig && (
              <div className="px-1.5 py-0.5 text-[10px] font-bold text-zinc-800 flex items-center justify-between border-b border-zinc-200 mb-0.5 flex-shrink-0">
                <span className="flex items-center gap-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${isCameraActive ? 'bg-[#58CC02]' : 'bg-[#EF4444]'}`} />
                  <span>You</span>
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsSwapped(true);
                  }}
                  className="text-zinc-600 hover:text-zinc-900 font-mono text-[9px] flex items-center gap-0.5"
                  title="Make self view big"
                >
                  <Maximize2 className="w-2.5 h-2.5" />
                  <span>Swap</span>
                </button>
              </div>
            )}

            {/* Video wrapper */}
            <div
              className={
                isRemoteBig
                  ? "relative aspect-[4/3] rounded-lg overflow-hidden bg-black flex items-center justify-center cursor-pointer"
                  : "w-full h-full relative overflow-hidden flex items-center justify-center"
              }
              onClick={isRemoteBig ? () => setIsSwapped(true) : undefined}
            >
              <video
                ref={videoRef}
                playsInline
                muted
                disablePictureInPicture
                className={`w-full h-full object-contain -scale-x-100 ${
                  isCameraActive ? 'block' : 'hidden'
                }`}
              />

              {/* Skeleton Canvas (Local user only) */}
              <canvas
                ref={canvasRef}
                width={640}
                height={480}
                className={`absolute inset-0 w-full h-full object-contain -scale-x-100 pointer-events-none z-10 ${
                  isCameraActive && showSkeleton ? 'block' : 'hidden'
                }`}
              />

              {/* Live FPS Overlay Directly Over Camera Output */}
              {isCameraActive && (
                <div className="absolute top-2.5 left-2.5 z-20 pointer-events-none select-none">
                  <div className="duo-badge bg-[#3C3C3C]/85 backdrop-blur-sm text-white px-2 py-0.5 font-mono text-[10px] border border-zinc-700/80 flex items-center gap-1.5 shadow-sm rounded-md">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#58CC02] animate-pulse" />
                    <span className="text-zinc-400 font-bold">FPS:</span>
                    <span className="text-[#58CC02] font-black">{fps || 30}</span>
                  </div>
                </div>
              )}

              {/* PiP Out of frame indicator */}
              {isRemoteBig && boundaryAlert.isOutOfFrame && isCameraActive && (
                <div className="absolute bottom-1 inset-x-1 z-20 flex justify-center pointer-events-none">
                  <span className="cartoon-badge !py-0 !px-1.5 text-[8px] bg-[#FFC800] text-zinc-900">
                    Keep In View
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* ======================================================== */}
          {/* CONTAINER 2: REMOTE PEER VIDEO (ZERO SKELETON OVERLAY)   */}
          {/* ======================================================== */}
          {hasRemote && (
            <div
              className={
                isRemoteBig
                  ? "absolute inset-0 w-full h-full z-0 flex items-center justify-center bg-zinc-950 overflow-hidden"
                  : "absolute bottom-3 right-3 z-30 cartoon-card bg-white p-1 border-2 border-zinc-900 shadow-cartoon-md max-w-[210px] w-[40%] sm:w-[190px] flex flex-col select-none transition-all"
              }
            >
              {!isRemoteBig && (
                <div className="px-1.5 py-0.5 text-[10px] font-bold text-zinc-800 flex items-center justify-between border-b border-zinc-200 mb-0.5 flex-shrink-0">
                  <span className="flex items-center gap-1 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#58CC02] animate-pulse" />
                    <span className="truncate">{peerPresence?.name || 'Partner'}</span>
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSwapped(false);
                    }}
                    className="text-zinc-600 hover:text-zinc-900 font-mono text-[9px] flex items-center gap-0.5"
                    title="Make partner big"
                  >
                    <Maximize2 className="w-2.5 h-2.5" />
                    <span>Swap</span>
                  </button>
                </div>
              )}

              <div
                className={
                  !isRemoteBig
                    ? "relative aspect-[4/3] rounded-lg overflow-hidden bg-black flex items-center justify-center cursor-pointer"
                    : "w-full h-full relative overflow-hidden flex items-center justify-center"
                }
                onClick={!isRemoteBig ? () => setIsSwapped(false) : undefined}
              >
                <video
                  ref={remoteVideoRef}
                  playsInline
                  autoPlay
                  className={`w-full h-full ${!isRemoteBig ? 'object-cover' : 'object-contain'}`}
                />

                {isRemoteBig && (
                  <div className="absolute top-3 left-3 z-20 cartoon-badge bg-white text-zinc-900 flex items-center gap-1.5 shadow-cartoon-sm">
                    <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-pulse" />
                    <span>{peerPresence?.name || 'Partner'}</span>
                    <span className="text-[10px] font-mono text-zinc-500">• Live</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Out of Frame Alert Notice */}
          {!isRemoteBig && boundaryAlert.isOutOfFrame && isCameraActive && (
            <div className="absolute top-3 inset-x-3 z-20 flex justify-center pointer-events-none">
              <div className="cartoon-badge bg-[#FFC800] text-zinc-900 border-2 border-zinc-900 px-3 py-1 font-bold text-xs flex items-center gap-1.5 shadow-cartoon-sm">
                <AlertCircle className="w-3.5 h-3.5 text-zinc-900 stroke-[2.5]" />
                <span>Please keep both hands centered inside camera</span>
              </div>
            </div>
          )}

          {/* Floating Candidate Suggestions Card (When Camera is Active & Signs are Detected) */}
          {isCameraActive && displayList && displayList.length > 0 && (
            <div
              onMouseEnter={() => onSetInteracting && onSetInteracting(true)}
              onMouseLeave={() => onSetInteracting && onSetInteracting(false)}
              className="absolute top-3 right-3 z-20 cartoon-card bg-white p-2.5 border-2 border-zinc-900 shadow-cartoon w-[210px] max-w-[85%] select-none animate-in fade-in duration-150"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-200">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-pulse" />
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-zinc-700">
                    {displayList[0]?.isAlphabetHint ? 'Letter Match' : 'Detected Sign'}
                  </span>
                </div>
                {onDismissCandidates && (
                  <button
                    onClick={onDismissCandidates}
                    className="w-4 h-4 rounded-md text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 flex items-center justify-center text-xs font-bold"
                    title="Dismiss"
                  >
                    <X className="w-3 h-3 stroke-[2.5]" />
                  </button>
                )}
              </div>

              {/* Hero Top Match */}
              {displayList[0] && (
                <div className="p-2 rounded-xl bg-[#FFF9E5] border border-amber-200 mb-2">
                  <div className="flex items-start justify-between gap-1 mb-1">
                    <div className="min-w-0">
                      <div className="text-[9px] font-mono font-bold text-amber-800 uppercase">
                        Top Match
                      </div>
                      <div className="font-extrabold text-sm text-zinc-950 truncate">
                        {displayList[0].label}
                      </div>
                    </div>
                    <span className="font-mono text-xs font-black text-[#16A34A] bg-white px-1.5 py-0.5 rounded-md border border-zinc-200">
                      {Math.round(displayList[0].confidence * 100)}%
                    </span>
                  </div>

                  {/* Confidence Progress */}
                  <div className="w-full bg-amber-200 h-1.5 rounded-full overflow-hidden mb-2">
                    <div
                      className="bg-[#58CC02] h-full rounded-full transition-all duration-150"
                      style={{ width: `${Math.min(100, Math.round(displayList[0].confidence * 100))}%` }}
                    />
                  </div>

                  {/* Action buttons */}
                  {onSelectCandidate && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onSelectCandidate(displayList[0].label, 'smart')}
                        className="cartoon-btn !py-1 text-xs flex-1 bg-white hover:bg-zinc-100 text-zinc-900 font-bold"
                        title={`Tap to use ${displayList[0].label}`}
                      >
                        <span>+ Tap to Use</span>
                      </button>
                      {currentGlosses && currentGlosses.length > 0 && currentGlosses[currentGlosses.length - 1] !== displayList[0].label && (
                        <button
                          onClick={() => onSelectCandidate(displayList[0].label, 'replace')}
                          className="cartoon-btn !py-1 !px-2 text-xs bg-white text-zinc-700"
                          title="Swap last sign"
                        >
                          ⇄ Swap
                        </button>
                      )}
                    </div>
                  )}

                  {/* 1-Click Undo / Clear actions inside Detected Sign HUD */}
                  {currentGlosses && currentGlosses.length > 0 && onUndo && (
                    <div className="flex items-center gap-1 mt-1.5 pt-1.5 border-t border-amber-200">
                      <button
                        type="button"
                        onClick={onUndo}
                        className="cartoon-btn !py-0.5 !px-1.5 text-[10px] font-bold bg-white text-zinc-800 hover:text-zinc-950 flex-1 flex items-center justify-center gap-1"
                        title="Undo last detected sign (1-click)"
                      >
                        <Undo2 className="w-2.5 h-2.5 stroke-[2.2]" />
                        <span>Undo Last</span>
                      </button>
                      {onClear && (
                        <button
                          type="button"
                          onClick={onClear}
                          className="cartoon-btn !py-0.5 !px-1.5 text-[10px] font-bold bg-white text-zinc-800 hover:text-[#EF4444] flex items-center justify-center gap-1"
                          title="Clear all signs (1-click)"
                        >
                          <Trash2 className="w-2.5 h-2.5 stroke-[2.2]" />
                          <span>Clear</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Runner-Up Suggestions */}
              {displayList.length > 1 && (
                <div className="space-y-1">
                  <div className="text-[9px] font-bold text-zinc-400 uppercase tracking-wider px-0.5">
                    Other Suggestions:
                  </div>
                  {displayList.slice(1, 3).map((candidate) => (
                    <div
                      key={candidate.label}
                      className="flex items-center justify-between p-1 rounded-lg bg-zinc-50 border border-zinc-200 text-xs"
                    >
                      <span className="font-bold text-zinc-800 text-[11px] truncate max-w-[90px]">
                        {candidate.label}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-[10px] text-zinc-500 font-bold">
                          {Math.round(candidate.confidence * 100)}%
                        </span>
                        {onSelectCandidate && (
                          <button
                            onClick={() => onSelectCandidate(candidate.label, 'smart')}
                            className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-zinc-200 hover:bg-zinc-900 hover:text-white"
                          >
                            +
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Friendly Inactive Camera Welcome Screen */}
          {!hasRemote && !isCameraActive && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-950/95 z-20">
              <div className="cartoon-card max-w-sm w-full p-5 sm:p-6 bg-white text-center flex flex-col items-center shadow-cartoon-lg">
                {/* Cheerful Animated Hand Mark */}
                <div className="w-14 h-14 rounded-2xl bg-[#FFC800] border-2 border-zinc-900 flex items-center justify-center shadow-cartoon mb-3 animate-subtle-bounce">
                  <Hand className="w-8 h-8 text-zinc-900 stroke-[2.2]" />
                </div>

                <h3 className="font-extrabold text-lg text-zinc-900 tracking-tight mb-1">
                  Ready to Start Signing?
                </h3>
                <p className="text-xs text-zinc-600 mb-4 max-w-xs leading-relaxed">
                  Turn on your camera to begin recognizing Indian Sign Language in real time. 100% private in your browser.
                </p>

                <button
                  onClick={startCamera}
                  disabled={isLoadingCamera}
                  className="cartoon-btn cartoon-btn-mint w-full py-2.5 text-sm font-extrabold flex items-center justify-center gap-2 shadow-cartoon"
                >
                  {isLoadingCamera ? (
                    <>
                      <RefreshCw className="w-4 h-4 stroke-[2.5] animate-spin" />
                      <span>Starting Camera...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4 stroke-[2.5]" />
                      <span>Start Camera</span>
                    </>
                  )}
                </button>

                {onOpenGuide && (
                  <button
                    onClick={onOpenGuide}
                    className="mt-3 text-xs font-bold text-zinc-600 hover:text-zinc-900 flex items-center gap-1.5 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>How it works &amp; features guide</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Camera Permission / Device Error Screen */}
          {!hasRemote && cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center bg-zinc-950/95 z-20">
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
            <div className="absolute top-10 left-3 z-30 cartoon-card bg-white p-3 border-2 border-zinc-900 shadow-cartoon-md w-[220px] text-xs font-mono select-none">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-200">
                <span className="font-bold text-zinc-900 text-[11px]">AI Profiler</span>
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
        <div className="flex items-center justify-between gap-2 mt-2 pt-1 flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5">
            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="cartoon-btn cartoon-btn-coral !py-1 !px-2.5 text-xs font-bold"
              >
                <CameraOff className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Stop Camera</span>
              </button>
            ) : (
              <button
                onClick={startCamera}
                disabled={isLoadingCamera}
                className="cartoon-btn cartoon-btn-mint !py-1 !px-2.5 text-xs font-bold"
              >
                <Camera className="w-3.5 h-3.5 stroke-[2.2]" />
                <span>Start Camera</span>
              </button>
            )}

            {isCameraActive && (
              <button
                onClick={() => setShowSkeleton(!showSkeleton)}
                className={`cartoon-btn !py-1 !px-2.5 text-xs font-bold ${
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
              className={`cartoon-btn !py-1 !px-2 text-xs font-bold ${
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
                className="cartoon-btn !py-1 !px-2.5 text-xs font-extrabold bg-white text-zinc-800 hover:text-zinc-950 flex items-center gap-1 border-2 border-zinc-900 shadow-cartoon-sm"
                title="Undo last sign (1-click)"
              >
                <Undo2 className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Undo ({currentGlosses.length})</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 text-[11px] font-mono text-zinc-500">
            <span>Buffer:</span>
            <span className="font-bold text-zinc-800">{bufferSize}/30</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignerStage;
