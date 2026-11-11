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
  Moon,
  Sun,
  Activity,
  Crosshair,
  Layers
} from 'lucide-react';
import { startCameraLoop } from '../vision/cameraLoop.js';
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

  // Studio Display Modes (Default: Camera View ON, Live and Target overlays OFF)
  const [isBlackScreen, setIsBlackScreen] = useState(false);
  const [showLiveSkeleton, setShowLiveSkeleton] = useState(false);
  const [showGhostSkeleton, setShowGhostSkeleton] = useState(false);
  const [boundaryAlert, setBoundaryAlert] = useState({ isOutOfFrame: false, message: '' });

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
    } catch (err) {
      console.error('[LearnStage] Camera access denied or failed:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in browser.'
          : `Video capture error: ${err.message || 'Unknown device error'}`
      );
      setIsCameraActive(false);
    } finally {
      setIsLoadingCamera(false);
    }
  }, []);

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
      ctx.clearRect(0, 0, 640, 480);
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

  // Render Skeleton, Ghost Target & Boundary check on every landmark update
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    drawSkeleton(ctx, showLiveSkeleton ? latestLandmarks : null, {
      showGuide: true,
      showFace: true,
      showPose: true,
      isBlackScreen: isBlackScreen
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

    if (latestLandmarks) {
      const alertState = checkBoundaryAlert(latestLandmarks);
      setBoundaryAlert(alertState);
    }
  }, [latestLandmarks, showLiveSkeleton, showGhostSkeleton, targetSkeleton, isBlackScreen]);

  const hasLeftHand = Boolean(latestLandmarks?.leftHandLandmarks?.length > 0);
  const hasRightHand = Boolean(latestLandmarks?.rightHandLandmarks?.length > 0);

  return (
    <div className="cartoon-card w-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white">
      {/* 1. Stage Header: Studio Controls */}
      <div className="px-3.5 py-2 border-b-2 border-zinc-900 bg-[#FAF8F5] flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-6 h-6 rounded-lg bg-zinc-900 text-white flex items-center justify-center flex-shrink-0">
            <Video className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <span className="font-extrabold text-xs sm:text-sm text-zinc-900 truncate">
            {isBlackScreen ? 'Black Screen Motion Studio' : 'Camera Feed & Biometric HUD'}
          </span>
          {isCameraActive && (
            <span className="cartoon-badge !py-0 !px-2 text-[10px] bg-[#58CC02] text-white hidden sm:inline-flex">
              ● Live Tracking
            </span>
          )}
        </div>

        {/* Viewport Control Toggles */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* Black Screen vs Camera Feed Toggle */}
          <button
            onClick={() => setIsBlackScreen(prev => !prev)}
            className={`cartoon-btn !py-0.5 !px-2.5 text-xs font-bold transition-all ${
              isBlackScreen
                ? 'bg-zinc-900 text-white border-zinc-900 shadow-cartoon-sm'
                : 'bg-[#FFC800] text-zinc-900 border-zinc-900 shadow-cartoon-sm'
            }`}
            title="Toggle Black Screen Studio vs Webcam Feed"
          >
            {isBlackScreen ? (
              <>
                <Moon className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Black Screen Studio</span>
              </>
            ) : (
              <>
                <Sun className="w-3.5 h-3.5 stroke-[2.5]" />
                <span className="hidden sm:inline">Camera View</span>
              </>
            )}
          </button>

          {/* Skeleton Overlay Toggle */}
          <button
            onClick={() => setShowLiveSkeleton(prev => !prev)}
            className={`cartoon-btn !py-0.5 !px-2 text-xs font-bold ${
              showLiveSkeleton ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-zinc-100 text-zinc-600'
            }`}
            title="Toggle Skeleton Landmarks Overlay"
          >
            <Activity className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden md:inline">Live: {showLiveSkeleton ? 'ON' : 'OFF'}</span>
          </button>

          {/* Ghost Target Overlay Toggle */}
          <button
            onClick={() => setShowGhostSkeleton(prev => !prev)}
            className={`cartoon-btn !py-0.5 !px-2 text-xs font-bold ${
              showGhostSkeleton ? 'bg-[#FFC800] text-zinc-900 border-zinc-900' : 'bg-zinc-100 text-zinc-600'
            }`}
            title="Toggle Target Blueprint Ghost"
          >
            <Crosshair className="w-3.5 h-3.5 stroke-[2.2]" />
            <span className="hidden lg:inline">Target: {showGhostSkeleton ? 'ON' : 'OFF'}</span>
          </button>

          {/* Hands Status Indicator */}
          <div className="flex items-center gap-1 text-[11px] font-mono font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-lg border border-zinc-300">
            <span>Hands:</span>
            <span className={hasLeftHand ? 'text-[#58CC02]' : 'text-zinc-400'}>L</span>
            <span>•</span>
            <span className={hasRightHand ? 'text-[#58CC02]' : 'text-zinc-400'}>R</span>
          </div>
        </div>
      </div>

      {/* 2. Main Visual Canvas Area */}
      <div className="relative flex-1 min-h-0 w-full overflow-hidden flex items-center justify-center bg-[#090A0F]">
        {/* Underneath Webcam Feed (Visible when isBlackScreen is false) */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 w-full h-full object-cover transform -scale-x-100 ${
            isBlackScreen ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        />

        {/* 60fps Biometric Skeleton & Target Ghost Canvas */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover transform -scale-x-100 pointer-events-none z-10"
        />

        {/* 3-Repetition Pass Goal HUD */}
        <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1.5 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
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

        {/* Compound Sign Multi-Step Progression HUD */}
        {selectedItem?.isCompound && selectedItem?.steps && (
          <div className="absolute top-3 left-3 sm:left-1/2 sm:-translate-x-1/2 z-20 flex flex-col items-center gap-1.5 max-w-[92%] sm:max-w-none">
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
                    : `PART ${stepSuccessFlash.stepNumber} LOCKED! Now perform the next step! 🌟`
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
  );
}
