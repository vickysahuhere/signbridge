import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, AlertCircle, RefreshCw, Eye, Activity } from 'lucide-react';
import { startCameraLoop } from '../vision/cameraLoop.js';
import { drawSkeleton, checkBoundaryAlert } from '../vision/drawSkeleton.js';

export function SignerStage({
  onFrame,
  latestLandmarks,
  isWorkerReady = false,
  onFpsUpdate,
  motionState = { state: 'IDLE', pauseProgress: 0, rollingVelocity: 0 },
  bufferSize = 0
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [boundaryAlert, setBoundaryAlert] = useState({ isOutOfFrame: false, message: '' });

  // FPS calculation refs
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
      console.error('[SignerStage] Camera access denied or failed:', err);
      setCameraError(
        err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in your browser settings to track ISL gestures.'
          : `Failed to access webcam: ${err.message || 'Unknown device error'}`
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

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, 640, 480);
    }
  }, [onFpsUpdate]);

  // Wire hardware-synchronized camera loop
  useEffect(() => {
    if (!isCameraActive || !videoRef.current) return;

    const videoEl = videoRef.current;

    const stopLoop = startCameraLoop(videoEl, (video, timestamp, metadata) => {
      // FPS measurement
      frameCountRef.current += 1;
      const now = performance.now();
      const delta = now - lastFpsCalcTimeRef.current;
      if (delta >= 1000) {
        const calculatedFps = Math.round((frameCountRef.current * 1000) / delta);
        if (onFpsUpdate) onFpsUpdate(calculatedFps);
        frameCountRef.current = 0;
        lastFpsCalcTimeRef.current = now;
      }

      // Dispatch frame to consumer (worker)
      if (onFrame) {
        onFrame(video, timestamp, metadata);
      }
    });

    return () => {
      stopLoop();
    };
  }, [isCameraActive, onFrame, onFpsUpdate]);

  // Render 3D skeleton overlay whenever new landmarks arrive
  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!isCameraActive || !showSkeleton) {
      ctx.clearRect(0, 0, 640, 480);
      return;
    }

    // Check boundary alerts
    const alertResult = checkBoundaryAlert(latestLandmarks, 0.10);
    setBoundaryAlert(alertResult);

    // Render skeleton mirrored horizontally to match mirrored video feed
    ctx.save();
    ctx.translate(640, 0);
    ctx.scale(-1, 1);
    drawSkeleton(ctx, latestLandmarks, { showGuide: true, showFace: true });
    ctx.restore();
  }, [latestLandmarks, isCameraActive, showSkeleton]);

  // Cleanup stream on component unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  return (
    <div className="flex flex-col items-center w-full max-w-4xl mx-auto">
      {/* Viewport Card */}
      <div
        className={`relative w-full max-w-[640px] aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden border-2 transition-all duration-300 shadow-2xl ${
          boundaryAlert.isOutOfFrame
            ? 'border-rose-500 shadow-rose-500/20 ring-4 ring-rose-500/30'
            : isCameraActive
            ? 'border-emerald-500/40 shadow-emerald-500/10'
            : 'border-slate-700/60'
        }`}
      >
        {/* Mirrored Video Feed */}
        <video
          ref={videoRef}
          className="w-full h-full object-cover transform -scale-x-100"
          playsInline
          muted
          autoPlay
        />

        {/* Synchronized 640x480 Canvas Skeleton Overlay */}
        <canvas
          ref={canvasRef}
          width={640}
          height={480}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none z-10"
        />

        {/* Boundary Alert Warning Badge */}
        {boundaryAlert.isOutOfFrame && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/90 text-slate-950 font-bold text-xs shadow-lg backdrop-blur-md animate-pulse">
            <AlertCircle className="w-4 h-4 text-slate-950" />
            <span>{boundaryAlert.message}</span>
          </div>
        )}

        {/* 1.2s Auto-Commit Pause Countdown Progress Bar */}
        {isCameraActive && motionState.state === 'PAUSE_COUNTDOWN' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 w-72 bg-slate-900/90 backdrop-blur-md rounded-xl p-2.5 border border-amber-500/50 shadow-xl shadow-amber-500/10">
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-300 mb-1.5">
              <span className="font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                Auto-Commit Countdown
              </span>
              <span>{Math.round((motionState.pauseProgress || 0) * 100)}%</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700/60">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-amber-400 transition-all duration-75 rounded-full"
                style={{ width: `${Math.min(100, Math.round((motionState.pauseProgress || 0) * 100))}%` }}
              />
            </div>
          </div>
        )}

        {/* Auto-Commit Flash Banner */}
        {isCameraActive && motionState.state === 'IDLE_COMMIT' && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/95 text-slate-950 font-bold text-xs shadow-xl shadow-sky-500/25 backdrop-blur-md animate-bounce">
            <span>✨ Sentence Boundary Emitted</span>
          </div>
        )}

        {/* Hand Color Legend & RingBuffer Telemetry (during active camera) */}
        {isCameraActive && showSkeleton && (
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono pointer-events-auto">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
                <span className="text-slate-300">Left Hand</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Right Hand</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 backdrop-blur-md border border-slate-700/60 text-[11px] font-mono text-slate-400 pointer-events-auto">
              <span>Buffer:</span>
              <span className="text-sky-300 font-semibold">{bufferSize}/30 frames</span>
              <span className="text-slate-600">•</span>
              <span>v:</span>
              <span className="text-emerald-300 font-semibold">{Number(motionState.rollingVelocity || 0).toFixed(3)}</span>
            </div>
          </div>
        )}

        {/* Inactive Camera Placeholder */}
        {!isCameraActive && !cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/90 backdrop-blur-sm z-20">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-4 text-slate-400">
              <Camera className="w-8 h-8 text-sky-400" />
            </div>
            <h3 className="text-lg font-bold text-slate-200 mb-1">Webcam Inactive</h3>
            <p className="text-sm text-slate-400 max-w-md mb-6">
              Enable your camera to initialize real-time 3D landmark tracking at 30+ FPS directly in your browser.
            </p>
            <button
              onClick={startCamera}
              disabled={isLoadingCamera}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all transform active:scale-95 disabled:opacity-50"
            >
              {isLoadingCamera ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Requesting Access...</span>
                </>
              ) : (
                <>
                  <Camera className="w-4 h-4" />
                  <span>Start Camera Feed</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Camera Permission Denied Card */}
        {cameraError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-slate-900/95 backdrop-blur-md z-20">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mb-4 text-rose-400">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-rose-300 mb-2">Camera Access Required</h3>
            <p className="text-sm text-slate-300 max-w-md mb-6 leading-relaxed">
              {cameraError}
            </p>
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-600 text-sm font-semibold transition"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry Permission</span>
            </button>
          </div>
        )}
      </div>

      {/* Camera Controls Bar */}
      <div className="flex items-center justify-between w-full max-w-[640px] mt-4 px-2">
        <div className="flex items-center gap-2">
          {isCameraActive ? (
            <button
              onClick={stopCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-semibold transition"
            >
              <CameraOff className="w-4 h-4" />
              <span>Stop Camera</span>
            </button>
          ) : (
            <button
              onClick={startCamera}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition"
            >
              <Camera className="w-4 h-4" />
              <span>Start Camera</span>
            </button>
          )}

          {isCameraActive && (
            <button
              onClick={() => setShowSkeleton(!showSkeleton)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition ${
                showSkeleton
                  ? 'bg-sky-500/20 border-sky-500/30 text-sky-300'
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>{showSkeleton ? 'Hide Skeleton' : 'Show Skeleton'}</span>
            </button>
          )}
        </div>

        <div className="text-xs text-slate-400 font-mono flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-sky-400" />
            <span>640 x 480 Native</span>
          </span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Mirrored</span>
        </div>
      </div>
    </div>
  );
}

export default SignerStage;
