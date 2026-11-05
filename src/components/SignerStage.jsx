import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, AlertCircle, RefreshCw, Eye, Activity, Lock, Sparkles, Check, Video, Monitor } from 'lucide-react';
import { startCameraLoop } from '../vision/cameraLoop.js';
import { drawSkeleton, checkBoundaryAlert } from '../vision/drawSkeleton.js';
import { IncomingSubtitleOverlay } from './IncomingSubtitleOverlay.jsx';

export function SignerStage({
  onFrame,
  latestLandmarks,
  isWorkerReady = false,
  onFpsUpdate,
  motionState = { state: 'IDLE', pauseProgress: 0, rollingVelocity: 0 },
  bufferSize = 0,
  alphabetPredictions = [],
  latestConfirmedLetter = null,
  wordPredictions = { topCandidates: [], confirmedWord: null },
  latestConfirmedWord = null,
  latestReply = null,
  recognitionMode = 'word',
  onToggleMode = null
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
          ? 'Camera permission denied. Please enable camera access in your browser to track ISL signs.'
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

      // Delegate frame to Web Worker via parent callback
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
      drawSkeleton(ctx, latestLandmarks, canvas.width, canvas.height);
    }

    if (latestLandmarks) {
      const alertState = checkBoundaryAlert(latestLandmarks, canvas.width, canvas.height);
      setBoundaryAlert(alertState);
    }
  }, [latestLandmarks, showSkeleton, isCameraActive]);

  const hasLeftHand = Boolean(latestLandmarks && latestLandmarks.leftHandLandmarks && latestLandmarks.leftHandLandmarks.length > 0);
  const hasRightHand = Boolean(latestLandmarks && latestLandmarks.rightHandLandmarks && latestLandmarks.rightHandLandmarks.length > 0);

  return (
    <div className="retro-window w-full shadow-md flex-shrink-0 flex flex-col">
      {/* 1. Window Title Bar */}
      <div className="retro-window-titlebar flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 stroke-[2px]" />
          <span>Capture Window - [640x480 @ 30 FPS]</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="retro-window-btn" aria-label="Minimize">_</button>
          <button className="retro-window-btn" aria-label="Maximize">□</button>
          <button className="retro-window-btn" aria-label="Close">×</button>
        </div>
      </div>

      {/* 2. Window Body Content */}
      <div className="p-2 bg-[#C0C0C0]">
        {/* Main Video Viewport (Proportionate height, fits desktop viewport without scrolling) */}
        <div className="relative w-full h-[220px] sm:h-[260px] max-w-[640px] mx-auto retro-inset bg-[#000000] overflow-hidden">
          {/* Incoming Subtitle HUD */}
          <IncomingSubtitleOverlay latestReply={latestReply} />

          {/* Hidden Video Source Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            className={`w-full h-full object-cover -scale-x-100 ${
              isCameraActive ? 'block' : 'hidden'
            }`}
          />

          {/* Transparent Canvas for Skeleton Landmark Overlay */}
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className={`absolute inset-0 w-full h-full object-cover -scale-x-100 pointer-events-none z-10 ${
              isCameraActive ? 'block' : 'hidden'
            }`}
          />

          {/* Out-of-frame Boundary Alert Notice */}
          {boundaryAlert.isOutOfFrame && isCameraActive && (
            <div className="absolute top-1.5 inset-x-1.5 z-20 flex justify-center pointer-events-none">
              <div className="retro-outset bg-[#FFFF00] text-[#000000] border-2 border-[#000000] px-2 py-0.5 font-mono font-bold text-[10px] flex items-center gap-1 shadow-md">
                <AlertCircle className="w-3 h-3 text-[#FF0000] stroke-[2px]" />
                <span>WARNING: {boundaryAlert.message}</span>
              </div>
            </div>
          )}

          {/* Active HUD Overlays (Upper Right: Top Candidate Recognition Box) */}
          {isCameraActive && recognitionMode === 'word' && wordPredictions.topCandidates && wordPredictions.topCandidates.length > 0 && (
            <div className="absolute top-1.5 right-1.5 z-20 retro-outset bg-[#C0C0C0] p-1 border border-[#000000] shadow-md max-w-[190px]">
              <div className="bg-[#000080] text-[#FFFFFF] px-1 py-0.2 text-[9px] font-bold flex items-center justify-between mb-0.5">
                <span>ISL RECOGNITION</span>
                <span className="text-[#00FF00] font-mono text-[8px]">LIVE</span>
              </div>

              {wordPredictions.topCandidates[0] && (
                <div className="retro-inset bg-[#FFFFCC] p-1 mb-0.5 text-black font-sans">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-xs font-bold text-[#000080]">
                      {wordPredictions.topCandidates[0].label}
                    </span>
                    <span className="font-mono text-[10px] font-bold text-[#00AA00]">
                      {Math.round(wordPredictions.topCandidates[0].confidence * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-[#808080] h-1.5 mt-0.5 retro-inset p-0.2 flex">
                    <div
                      className="bg-[#00AA00] h-full"
                      style={{
                        width: `${Math.min(100, Math.round(wordPredictions.topCandidates[0].confidence * 100))}%`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Runners-up 2 and 3 */}
              <div className="space-y-0.2">
                {wordPredictions.topCandidates.slice(1, 3).map((candidate) => (
                  <div
                    key={candidate.rank}
                    className="flex items-center justify-between px-1 py-0.2 bg-[#FFFFFF] retro-inset text-[9px] font-mono"
                  >
                    <span className="font-bold text-[#000000]">
                      #{candidate.rank} {candidate.label}
                    </span>
                    <span className="text-[#808080]">
                      {Math.round(candidate.confidence * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active HUD Overlays (Alphabet Fingerspelling Mode) */}
          {isCameraActive && recognitionMode === 'alphabet' && alphabetPredictions && alphabetPredictions.length > 0 && (
            <div className="absolute top-1.5 right-1.5 z-20 retro-outset bg-[#C0C0C0] p-1 border border-[#000000] shadow-md max-w-[170px]">
              <div className="bg-[#000080] text-[#FFFFFF] px-1 py-0.2 text-[9px] font-bold flex items-center justify-between mb-0.5">
                <span>FINGER SPELLING (A-Z)</span>
                <span className="text-[#FFFF00] font-mono text-[8px]">ACTIVE</span>
              </div>

              {alphabetPredictions[0] && (
                <div className="retro-inset bg-[#FFFFCC] p-1 mb-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-heading text-lg font-black text-[#000080]">
                      {alphabetPredictions[0].label}
                    </span>
                    <div className="text-right">
                      <span className="font-mono text-[10px] font-bold text-[#00AA00]">
                        {Math.round(alphabetPredictions[0].confidence * 100)}%
                      </span>
                      {latestConfirmedLetter === alphabetPredictions[0].label ? (
                        <div className="text-[8px] bg-[#00AA00] text-white px-1 font-bold animate-pulse">
                          TYPED
                        </div>
                      ) : alphabetPredictions[0].isConfident ? (
                        <div className="text-[8px] bg-[#000080] text-white px-1 font-bold">
                          HOLD...
                        </div>
                      ) : null}
                    </div>
                  </div>
                  <div className="w-full bg-[#808080] h-1.5 mt-0.5 retro-inset p-0.2 flex">
                    <div
                      className="bg-[#0000FF] h-full"
                      style={{
                        width: `${Math.min(100, Math.round(alphabetPredictions[0].confidence * 100))}%`
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inactive Camera Placeholder Screen */}
          {!isCameraActive && !cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-[#000080] text-[#FFFFFF] z-20">
              <div className="retro-outset bg-[#C0C0C0] text-[#000000] p-3 max-w-xs w-full border-2 border-[#000000] shadow-xl">
                <div className="bg-[#000080] text-[#FFFFFF] px-1.5 py-0.2 font-bold text-[11px] mb-2 flex items-center justify-between">
                  <span>SYSTEM DIALOG</span>
                  <span>[X]</span>
                </div>

                <div className="flex items-center gap-2 mb-2 text-left">
                  <div className="w-8 h-8 retro-inset bg-[#FFFFFF] flex items-center justify-center flex-shrink-0 text-[#000080]">
                    <Monitor className="w-5 h-5 stroke-[2px]" />
                  </div>
                  <div>
                    <h4 className="font-heading text-xs font-bold text-[#000000]">Webcam Inactive</h4>
                    <p className="text-[10px] text-[#000000]">
                      Initialize device to track 3D gestures.
                    </p>
                  </div>
                </div>

                <button
                  onClick={startCamera}
                  disabled={isLoadingCamera}
                  className="retro-btn retro-btn-primary w-full py-1 text-xs font-bold"
                >
                  {isLoadingCamera ? (
                    <>
                      <RefreshCw className="w-3 h-3 stroke-[2px] animate-spin" />
                      <span>INITIALIZING...</span>
                    </>
                  ) : (
                    <>
                      <Camera className="w-3 h-3 stroke-[2px]" />
                      <span>START CAMERA FEED</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Camera Permission Error Screen */}
          {cameraError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-3 text-center bg-[#000080] text-[#FFFFFF] z-20">
              <div className="retro-outset bg-[#C0C0C0] text-[#000000] p-3 max-w-xs w-full border-2 border-[#000000] shadow-xl">
                <div className="bg-[#CC0000] text-[#FFFFFF] px-1.5 py-0.2 font-bold text-[11px] mb-2 flex items-center justify-between">
                  <span>DEVICE ERROR</span>
                  <span>[!]</span>
                </div>
                <div className="flex items-center gap-2 mb-2 text-left">
                  <AlertCircle className="w-6 h-6 text-[#CC0000] stroke-[2px] flex-shrink-0" />
                  <p className="text-[10px] text-[#000000] leading-tight">
                    {cameraError}
                  </p>
                </div>
                <button
                  onClick={startCamera}
                  className="retro-btn retro-btn-danger w-full py-1 text-xs font-bold"
                >
                  <RefreshCw className="w-3 h-3 stroke-[2px]" />
                  <span>RETRY CAMERA</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3. Lower Camera Control & Telemetry Bar */}
        <div className="flex items-center justify-between gap-1.5 mt-1.5 pt-1 border-t border-[#808080]">
          <div className="flex items-center gap-1">
            {isCameraActive ? (
              <button
                onClick={stopCamera}
                className="retro-btn retro-btn-danger text-xs !py-0.5 !px-2"
              >
                <CameraOff className="w-3 h-3 stroke-[2px]" />
                <span>[ Stop ]</span>
              </button>
            ) : (
              <button
                onClick={startCamera}
                className="retro-btn retro-btn-success text-xs !py-0.5 !px-2"
              >
                <Camera className="w-3 h-3 stroke-[2px]" />
                <span>[ Start ]</span>
              </button>
            )}

            {isCameraActive && (
              <button
                onClick={() => setShowSkeleton(!showSkeleton)}
                className={`retro-btn text-xs !py-0.5 !px-1.5 ${showSkeleton ? 'retro-btn-primary' : ''}`}
              >
                <Activity className="w-3 h-3 stroke-[2px]" />
                <span>Skeleton {showSkeleton ? 'ON' : 'OFF'}</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px]">
            <div className="retro-inset px-1 py-0.2 bg-[#C0C0C0] text-[#000000]">
              L: <span className={hasLeftHand ? 'text-[#00AA00] font-bold' : 'text-[#808080]'}>{hasLeftHand ? 'OK' : '--'}</span>
            </div>
            <div className="retro-inset px-1 py-0.2 bg-[#C0C0C0] text-[#000000]">
              R: <span className={hasRightHand ? 'text-[#00AA00] font-bold' : 'text-[#808080]'}>{hasRightHand ? 'OK' : '--'}</span>
            </div>
            <div className="retro-inset px-1 py-0.2 bg-[#C0C0C0] text-[#000000]">
              BUF: <span className="font-bold text-[#000080]">{bufferSize}/30</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignerStage;
