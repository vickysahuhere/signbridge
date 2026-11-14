import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Camera,
  CameraOff,
  Video,
  Sparkles,
  RefreshCw,
  RotateCcw,
  ArrowRight,
  Eye,
  EyeOff,
  Sliders,
  Maximize2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Activity,
  Crosshair,
  Layers,
  Lightbulb,
  X,
  SwitchCamera
} from 'lucide-react';
import { SignSvgIllustration, hasSvgIllustration } from './SignSvgIllustrations.jsx';
import { startCameraLoop } from '../vision/cameraLoop.js';
import { SanketLoader } from './SanketLoader.jsx';
import { useSmoothedLandmarks } from '../vision/useSmoothedLandmarks.js';
import { drawSkeleton, checkBoundaryAlert, HAND_CONNECTIONS } from '../vision/drawSkeleton.js';

export function LearnStage({
  onFrame,
  latestLandmarks,
  isWorkerReady = false,
  onFpsUpdate,
  fps = 0,
  targetSkeleton = null,
  selectedItem = null,
  isMatched = false,
  activeStepIndex = 0,
  completedSteps = [],
  stepSuccessFlash = null,
  successfulReps = 0,
  targetReps = 3,
  onResetPractice,
  onNextSign
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [facingMode, setFacingMode] = useState('user');
  const [showSignCue, setShowSignCue] = useState(false);

  // Studio Display Modes (Default: Camera View ON, Live and Target overlays OFF)
  const [showLiveSkeleton, setShowLiveSkeleton] = useState(false);
  const [showGhostSkeleton, setShowGhostSkeleton] = useState(false);
  const [boundaryAlert, setBoundaryAlert] = useState({ isOutOfFrame: false, message: '' });

  const containerRef = useRef(null);
  const [viewportDims, setViewportDims] = useState({ width: 0, height: 0 });

  // Strictly enforce 16:9 aspect ratio geometry, scaling dynamically to maximum available stage bounds
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const calculate16by9 = () => {
      const clientW = el.clientWidth;
      const clientH = el.clientHeight;
      if (clientW <= 0 || clientH <= 0) return;

      // Fit strictly within 16:9 bounds without ever cropping video
      let w = clientW;
      let h = (w * 9) / 16;
      if (h > clientH) {
        h = clientH;
        w = (h * 16) / 9;
      }
      setViewportDims({ width: Math.round(w), height: Math.round(h) });
    };

    calculate16by9();
    const observer = new ResizeObserver(calculate16by9);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

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

  // Start camera media stream
  const startCamera = useCallback(async (overrideFacing) => {
    setIsLoadingCamera(true);
    setCameraError(null);
    const activeFacing = overrideFacing || facingMode;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          aspectRatio: { ideal: 1.7777777778 },
          frameRate: { ideal: 30 },
          facingMode: activeFacing
        },
        audio: false
      });

      if (videoRef.current) {
        if (videoRef.current.srcObject) {
          try {
            const oldTracks = videoRef.current.srcObject.getTracks();
            oldTracks.forEach(t => t.stop());
          } catch (e) {}
        }
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          if (playErr.name !== 'AbortError' && !playErr.message?.includes('interrupted')) {
            console.warn('[LearnStage] video.play() warning:', playErr);
          }
        }
        setIsCameraActive(true);
        syncCanvasDimensions();
      }
    } catch (err) {
      console.error('[LearnStage] Camera access denied or failed:', err);
      if (err.name !== 'AbortError' && !err.message?.includes('interrupted')) {
        setCameraError(
          err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
            ? 'Camera permission denied. Please allow camera access in browser.'
            : `Video capture error: ${err.message || 'Unknown device error'}`
        );
      }
      setIsCameraActive(false);
    } finally {
      setIsLoadingCamera(false);
    }
  }, [facingMode, syncCanvasDimensions]);

  // Toggle between front and rear cameras
  const toggleCameraFacing = useCallback(() => {
    const nextFacing = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(nextFacing);
    if (isCameraActive) {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
      }
      startCamera(nextFacing);
    }
  }, [facingMode, isCameraActive, startCamera]);

  // Stop camera media stream
  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setBoundaryAlert({ isOutOfFrame: false, message: '' });
    if (onFpsUpdate) onFpsUpdate(0);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  }, [onFpsUpdate]);

  // Automatically start camera on mount for immediate practice
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Wire hardware-synchronized camera loop
  useEffect(() => {
    if (!isCameraActive || !videoRef.current) return;
    const videoEl = videoRef.current;

    const stopLoop = startCameraLoop(videoEl, (video, timestamp) => {
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

      if (onFrame) {
        onFrame(video, timestamp);
      }
    });

    return () => {
      stopLoop();
    };
  }, [isCameraActive, onFrame, onFpsUpdate, syncCanvasDimensions]);

  const shownLandmarks = useSmoothedLandmarks(latestLandmarks);
  // Render Skeleton + Ghost Target (glides between detections)
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    drawSkeleton(ctx, showLiveSkeleton ? shownLandmarks : null, {
      showGuide: true,
      showFace: true,
      showPose: true
    });

    // Draw Target Skeleton Ghost Blueprint when enabled
    if (showGhostSkeleton && targetSkeleton) {
      const drawGhostHand = (pts) => {
        if (!pts || pts.length === 0) return;
        ctx.save();
        ctx.strokeStyle = '#F59E0B';
        ctx.fillStyle = '#F59E0B';
        ctx.lineWidth = 2.5;
        ctx.setLineDash([5, 5]);
        ctx.globalAlpha = 0.65;

        // Draw connections
        for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
          const p1 = pts[startIdx];
          const p2 = pts[endIdx];
          if (!p1 || !p2) continue;
          ctx.beginPath();
          ctx.moveTo(p1.x * canvas.width, p1.y * canvas.height);
          ctx.lineTo(p2.x * canvas.width, p2.y * canvas.height);
          ctx.stroke();
        }

        // Draw joint circles
        for (const p of pts) {
          if (!p) continue;
          ctx.beginPath();
          ctx.arc(p.x * canvas.width, p.y * canvas.height, 3.5, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.restore();
      };

      if (targetSkeleton.leftHand) drawGhostHand(targetSkeleton.leftHand);
      if (targetSkeleton.rightHand) drawGhostHand(targetSkeleton.rightHand);
    }

  }, [shownLandmarks, showLiveSkeleton, showGhostSkeleton, targetSkeleton]);

  useEffect(() => {
    if (latestLandmarks) setBoundaryAlert(checkBoundaryAlert(latestLandmarks));
  }, [latestLandmarks]);

  const hasLeftHand = Boolean(latestLandmarks?.leftHandLandmarks?.length > 0);
  const hasRightHand = Boolean(latestLandmarks?.rightHandLandmarks?.length > 0);

  return (
    <div className="cartoon-card w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white shadow-cartoon-sm">
      {/* 1. Stage Header: Studio Controls */}
      <div className="px-3.5 py-2 border-b-2 border-[#D6EBD3] bg-[#EAF6E8] flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center flex-shrink-0">
            <Video className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span className="font-black text-sm sm:text-base text-zinc-900 truncate">
            Camera
          </span>
        </div>

        {/* Viewport Control Toggles */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Mobile Camera Flip Trigger */}
          {isCameraActive && (
            <button
              type="button"
              onClick={toggleCameraFacing}
              className="cartoon-btn !py-1 !px-2 text-xs font-bold bg-white text-zinc-800 flex items-center gap-1 flex-shrink-0"
              title={`Switch Camera (Currently: ${facingMode})`}
            >
              <SwitchCamera className="w-3.5 h-3.5 stroke-[2.2]" />
              <span className="hidden sm:inline">Flip</span>
            </button>
          )}

          {/* Mobile Sign Cue / Hint Toggle Button */}
          <button
            type="button"
            onClick={() => setShowSignCue(prev => !prev)}
            className={`cartoon-btn !py-1 !px-2 text-xs font-black flex items-center gap-1 ${
              showSignCue ? 'bg-[#FFC800] text-zinc-900 border-zinc-900' : 'bg-white text-zinc-700'
            }`}
            title="Show Sign Gesture Hint"
          >
            <Lightbulb className="w-3.5 h-3.5 stroke-[2.2] text-amber-500 fill-amber-400" />
            <span>Hint</span>
          </button>

          {/* Skeleton Overlay Toggle */}
          <button
            onClick={() => setShowLiveSkeleton(prev => !prev)}
            className={`cartoon-btn !py-1 !px-2 text-xs sm:text-sm font-black ${
              showLiveSkeleton ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-100 text-zinc-600'
            }`}
            title="Toggle Skeleton Landmarks Overlay"
          >
            <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden md:inline">Skeleton</span>
          </button>
        </div>
      </div>

      {/* 2. Main Visual Canvas Area - Strictly 16:9 Aspect Ratio, dynamically filling available stage space */}
      <div
        ref={containerRef}
        className="flex-1 min-h-[220px] w-full flex items-center justify-center bg-[#090A0F] p-1.5 sm:p-2.5 overflow-hidden"
      >
        <div
          style={viewportDims.width > 0 ? { width: `${viewportDims.width}px`, height: `${viewportDims.height}px` } : undefined}
          className="relative aspect-video max-w-full max-h-full w-full h-auto flex items-center justify-center overflow-hidden rounded-xl bg-black shadow-lg"
        >
          {/* Underneath Webcam Feed */}
          <video
            ref={videoRef}
            playsInline
            autoPlay
            muted
            onLoadedMetadata={syncCanvasDimensions}
            className="w-full h-full object-contain transform -scale-x-100 block"
          />

          {/* 60fps Biometric Skeleton & Target Ghost Canvas */}
          <canvas
            ref={canvasRef}
            width={1280}
            height={720}
            className="absolute inset-0 w-full h-full object-contain transform -scale-x-100 pointer-events-none z-10"
          />

          {isCameraActive && !isWorkerReady && (
            <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-2 bg-[#F5F4ED]">
              <SanketLoader label="Loading hand tracking" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-[#11131C]/60">Loading hand tracking</span>
            </div>
          )}

        {/* Mobile Unified Top HUD Bar (< sm) - Prevents collision between Compound & Pass Goal */}
        <div className="sm:hidden absolute top-2 inset-x-2 z-20 flex items-center justify-between gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
          {/* Left: Sign / Step Info */}
          <div className="flex items-center gap-1.5 min-w-0 flex-1">
            <span className="text-[10px] font-black uppercase text-zinc-900 truncate">
              {selectedItem?.isCompound && selectedItem?.steps
                ? `Step ${activeStepIndex + 1}/${selectedItem.steps.length}: ${selectedItem.steps[activeStepIndex]?.title?.split(':')[1]?.trim() || selectedItem.steps[activeStepIndex]?.title || 'Practice'}`
                : selectedItem?.name || selectedItem?.label}
            </span>
          </div>

          {/* Right: Pass Goal Reps */}
          <div className="flex items-center gap-1 flex-shrink-0">
            <span className={`text-[11px] font-black ${isMatched ? 'text-[#16A34A]' : 'text-zinc-800'}`}>
              {successfulReps}/{targetReps}
            </span>
            <div className="flex items-center gap-0.5">
              {Array.from({ length: targetReps }).map((_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-md flex items-center justify-center text-[9px] font-black border ${
                    successfulReps > i
                      ? 'bg-[#58CC02] text-white border-zinc-900'
                      : 'bg-zinc-100 text-zinc-400 border-zinc-300'
                  }`}
                >
                  {successfulReps > i ? '✓' : i + 1}
                </div>
              ))}
            </div>
            {successfulReps > 0 && onResetPractice && (
              <button
                onClick={onResetPractice}
                type="button"
                className="p-1 hover:bg-zinc-100 text-zinc-700 rounded ml-0.5"
                title="Reset reps"
              >
                <RotateCcw className="w-2.5 h-2.5 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>

        {/* Desktop 3-Repetition Pass Goal HUD (>= sm) */}
        <div className="hidden sm:flex absolute top-3 right-3 z-20 items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
          <div className="flex flex-col text-left leading-none">
            <span className="text-[8px] font-mono font-bold uppercase text-zinc-500">
              Pass Goal
            </span>
            <span className={`text-xs font-black ${isMatched ? 'text-[#16A34A]' : 'text-zinc-900'}`}>
              {successfulReps}/{targetReps} Reps
            </span>
          </div>
          <div className="flex items-center gap-1 ml-1">
            {Array.from({ length: targetReps }).map((_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black border transition-all ${
                  successfulReps > i
                    ? 'bg-[#58CC02] text-white border-zinc-900 scale-105'
                    : 'bg-zinc-100 text-zinc-400 border-zinc-300'
                }`}
              >
                {successfulReps > i ? '✓' : i + 1}
              </div>
            ))}
          </div>
          {successfulReps > 0 && onResetPractice && (
            <button
              onClick={onResetPractice}
              type="button"
              className="cartoon-btn !p-1 bg-white hover:bg-zinc-100 text-zinc-700 border border-zinc-900 rounded-md ml-0.5 cursor-pointer"
              title="Try again from 0 reps"
            >
              <RotateCcw className="w-3 h-3 stroke-[2.2]" />
            </button>
          )}
        </div>

        {/* Desktop Compound Sign Multi-Step Progression HUD (>= sm) */}
        {selectedItem?.isCompound && selectedItem?.steps && (
          <div className="hidden sm:flex absolute top-3 left-1/2 -translate-x-1/2 z-20 flex-col items-center gap-1.5 max-w-none">
            <div className="cartoon-card bg-white/95 backdrop-blur-sm px-3 py-1.5 border-2 border-zinc-900 shadow-cartoon-sm flex items-center gap-2">
              <span className="text-[10px] font-black uppercase text-amber-900 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                Compound:
              </span>
              <div className="flex items-center gap-1.5">
                {selectedItem.steps.map((st, idx) => {
                  const isDone = completedSteps.includes(idx);
                  const isCurrent = idx === activeStepIndex;
                  return (
                    <div
                      key={st.id}
                      className={`cartoon-badge !py-0.5 !px-2 text-[10px] font-bold flex items-center gap-1 transition-all ${
                        isDone
                          ? 'bg-[#58CC02] text-white border-2 border-zinc-900'
                          : isCurrent
                          ? 'bg-[#FFC800] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm animate-pulse'
                          : 'bg-zinc-100 text-zinc-400 border border-zinc-300'
                      }`}
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-3 h-3 stroke-[2.5]" />
                      ) : (
                        <span className="w-3 h-3 rounded-full bg-zinc-900/10 flex items-center justify-center text-[8px] font-black">
                          {idx + 1}
                        </span>
                      )}
                      <span>{st.title.split(':')[1]?.trim() || st.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step / Repetition Transition Flash Overlay */}
        {stepSuccessFlash && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-25 pointer-events-none animate-bounce">
            <div className={`cartoon-card px-4 py-2 border-2 border-zinc-900 shadow-cartoon-lg flex items-center gap-2 text-xs font-black ${
              stepSuccessFlash.isTimeout
                ? 'bg-amber-100 text-amber-900 border-amber-800'
                : stepSuccessFlash.isPass
                ? 'bg-[#58CC02] text-white'
                : 'bg-[#FFC800] text-zinc-900'
            }`}>
              <Sparkles className="w-4 h-4 fill-current stroke-[2.5]" />
              <span>
                {stepSuccessFlash.message || (
                  stepSuccessFlash.isTimeout
                    ? stepSuccessFlash.message
                    : `PART ${stepSuccessFlash.stepNumber} LOCKED! Now perform the next step!`
                )}
              </span>
            </div>
          </div>
        )}

        {/* Target Matched & Passed Overlay (Unlocked only when 3 reps completed!) */}
        {isMatched && (
          <div className="absolute inset-0 z-30 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
            <div className="duo-card bg-white p-6 flex flex-col items-center gap-3.5 text-center max-w-sm w-full animate-duo-pop">
              <div className="w-16 h-16 rounded-3xl bg-[#58CC02] border-2 border-[#46A302] border-b-4 text-white flex items-center justify-center">
                <CheckCircle2 className="w-9 h-9 stroke-[3]" />
              </div>
              <div>
                <span className="text-[11px] uppercase font-mono font-black text-[#58CC02] block tracking-wider">
                  SIGN MASTERED!
                </span>
                <h3 className="font-black text-xl text-[#3C3C3C] mt-0.5">
                  {selectedItem?.name} (3/3)
                </h3>
                <p className="text-xs text-zinc-500 font-bold mt-1 leading-relaxed">
                  You successfully performed the sign 3 times! Great muscle memory.
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full mt-2">
                {onResetPractice && (
                  <button
                    type="button"
                    onClick={onResetPractice}
                    className="duo-btn flex-1 !py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Practice this sign again from 0 reps"
                  >
                    <RotateCcw className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Practice Again</span>
                  </button>
                )}
                {onNextSign && (
                  <button
                    type="button"
                    onClick={onNextSign}
                    className="duo-btn duo-btn-green flex-1 !py-2.5 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
                    title="Advance to the next sign on course path"
                  >
                    <span>CONTINUE</span>
                    <ArrowRight className="w-4 h-4 stroke-[3]" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Boundary Alert Banner */}
        {boundaryAlert.isOutOfFrame && (
          <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 cartoon-card bg-[#FFF1F2] border-2 border-[#E11D48] text-[#E11D48] px-3 py-1.5 text-xs font-bold flex items-center gap-1.5 shadow-cartoon-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 stroke-[2.5]" />
            <span>{boundaryAlert.message}</span>
          </div>
        )}

        {/* Camera Permission / Error Banner */}
        {cameraError && (
          <div className="absolute inset-0 z-30 bg-zinc-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center">
            <div className="cartoon-card bg-white p-5 max-w-sm flex flex-col items-center gap-3 border-2 border-zinc-900 shadow-cartoon-lg">
              <div className="w-12 h-12 rounded-2xl bg-[#FEECEC] border-2 border-[#EF4444] text-[#EF4444] flex items-center justify-center shadow-cartoon-sm">
                <CameraOff className="w-6 h-6 stroke-[2.5]" />
              </div>
              <h3 className="font-extrabold text-sm text-zinc-900">Camera Access Required</h3>
              <p className="text-xs text-zinc-600 leading-relaxed">{cameraError}</p>
              <button
                onClick={startCamera}
                disabled={isLoadingCamera}
                className="cartoon-btn bg-[#FFC800] text-zinc-900 w-full"
              >
                <RefreshCw className={`w-3.5 h-3.5 stroke-[2.5] ${isLoadingCamera ? 'animate-spin' : ''}`} />
                <span>Retry Camera</span>
              </button>
            </div>
          </div>
        )}

        {/* Mobile Floating Sign Cue Reference Card */}
        {showSignCue && selectedItem && (
          <div className="absolute bottom-12 left-2 right-2 sm:bottom-3 sm:left-auto sm:right-3 sm:w-80 z-30 cartoon-card bg-white p-2.5 sm:p-3 border-2 border-zinc-900 shadow-cartoon-lg animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-zinc-200">
              <div className="flex items-center gap-1.5 min-w-0">
                <Lightbulb className="w-3.5 h-3.5 text-amber-500 fill-amber-400 flex-shrink-0" />
                <span className="font-extrabold text-xs text-zinc-900 uppercase truncate">
                  {selectedItem.name} Cue
                </span>
              </div>
              <button
                type="button"
                onClick={() => setShowSignCue(false)}
                className="text-zinc-400 hover:text-zinc-900 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2.5">
              {hasSvgIllustration(selectedItem.label) && (
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl bg-amber-50/60 border border-amber-200 flex items-center justify-center p-1 flex-shrink-0">
                  <SignSvgIllustration label={selectedItem.label} className="w-full h-full object-contain" />
                </div>
              )}
              <div className="flex-1 min-w-0 text-xs">
                <p className="font-bold text-zinc-700 leading-snug line-clamp-3">
                  {selectedItem.description || selectedItem.tips || 'Align your hands as shown to match biometric pose.'}
                </p>
                {selectedItem.isCompound && selectedItem.steps && (
                  <p className="mt-1 text-[10px] font-mono font-bold text-amber-800">
                    Step {activeStepIndex + 1}: {selectedItem.steps[activeStepIndex]?.title}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Studio Legend / HUD Badges */}
        <div className="absolute bottom-3 left-3 z-20 flex items-center gap-2 pointer-events-none select-none">
          <div className="cartoon-card-subtle bg-zinc-900/85 backdrop-blur-sm text-white px-2.5 py-1 text-[10px] font-mono border-zinc-700 flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#1CB0F6]" />
              <span>Left Hand</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#34D399]" />
              <span>Right Hand</span>
            </span>
            {showGhostSkeleton && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                  <span>Target Ghost</span>
                </span>
              </>
            )}
          </div>
        </div>

        {/* Live FPS Badge Directly Over Camera Output */}
        {isCameraActive && (
          <div className="absolute bottom-3 right-3 z-20 pointer-events-none select-none">
            <div className="duo-badge bg-[#3C3C3C]/85 backdrop-blur-sm text-white px-2 py-0.5 text-[10px] font-mono border border-zinc-700/80 flex items-center gap-1.5 shadow-sm rounded-md">
              <span className="w-1.5 h-1.5 rounded-full bg-[#58CC02] animate-pulse" />
              <span className="text-zinc-400 font-bold">FPS:</span>
              <span className="text-[#58CC02] font-black">{fps || 30}</span>
            </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
