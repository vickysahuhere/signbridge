import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Camera, CameraOff, AlertCircle, RefreshCw, Activity, Video, Monitor, HelpCircle } from 'lucide-react';
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
  currentGlosses = []
}) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState(null);
  const [isLoadingCamera, setIsLoadingCamera] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(true);
  const [boundaryAlert, setBoundaryAlert] = useState({ isOutOfFrame: false, message: '' });
  const [isHoveredCandidate, setIsHoveredCandidate] = useState(false);

  // Attach remote video stream when received
  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
      remoteVideoRef.current.play().catch((err) => {
        console.warn('[SignerStage] Remote video playback error:', err);
      });
    }
  }, [remoteStream]);

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
    <div className="retro-window w-full shadow-md flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* 1. Window Title Bar */}
      <div className="retro-window-titlebar flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <Video className="w-3.5 h-3.5 stroke-[2px]" />
          <span>Capture Window - [ISL Video Feed 640x480 @ 30 FPS]</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="retro-window-btn" aria-label="Minimize">_</button>
          <button className="retro-window-btn" aria-label="Maximize">□</button>
          <button className="retro-window-btn" aria-label="Close">×</button>
        </div>
      </div>

      {/* 2. Main Video Viewport (Takes all remaining height in the window) */}
      <div className="p-1.5 bg-[#C0C0C0] flex-1 min-h-0 flex flex-col justify-between overflow-hidden">
        <div className="relative w-full flex-1 min-h-0 retro-inset bg-[#000000] overflow-hidden flex items-center justify-center">
          {/* Incoming Subtitle HUD */}
          <IncomingSubtitleOverlay latestReply={latestReply} />

          {/* Hidden Video Source Element */}
          <video
            ref={videoRef}
            playsInline
            muted
            disablePictureInPicture
            className={`w-full h-full object-contain -scale-x-100 ${
              isCameraActive ? 'block' : 'hidden'
            }`}
          />

          {/* Transparent Canvas for Skeleton Landmark Overlay */}
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className={`absolute inset-0 w-full h-full object-contain -scale-x-100 pointer-events-none z-10 ${
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

          {/* Active HUD Overlays: Stabilized Candidate Box (Does NOT disappear every second; words stay tappable) */}
          {isCameraActive && (candidates.length > 0 || (recognitionMode === 'word' ? wordPredictions?.topCandidates?.length > 0 : alphabetPredictions?.length > 0)) && (() => {
            const displayList = candidates.length > 0
              ? candidates
              : (recognitionMode === 'word' ? (wordPredictions?.topCandidates || []) : (alphabetPredictions || []));

            if (!displayList || displayList.length === 0) return null;

            return (
              <div
                onMouseEnter={() => {
                  setIsHoveredCandidate(true);
                  if (onSetInteracting) onSetInteracting(true);
                }}
                onMouseLeave={() => {
                  setIsHoveredCandidate(false);
                  if (onSetInteracting) onSetInteracting(false);
                }}
                className="absolute top-1.5 right-1.5 z-20 retro-outset bg-[#C0C0C0] p-1 border border-[#000000] shadow-xl w-[205px] max-w-[85%] select-none"
              >
                {/* Titlebar with status & dismiss */}
                <div className="bg-[#000080] text-[#FFFFFF] px-1.5 py-0.5 text-[9px] font-bold flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1 font-mono">
                    <span>{recognitionMode === 'word' ? 'ISL DETECTED' : 'FINGERSPELLING'}</span>
                    {isCandidateLive ? (
                      <span className="text-[#00FF00] text-[8px] animate-pulse">● LIVE</span>
                    ) : (
                      <span className="text-[#FFFF00] text-[8px]">● HELD</span>
                    )}
                  </div>
                  {onDismissCandidates && (
                    <button
                      onClick={onDismissCandidates}
                      className="retro-btn !p-0 w-3.5 h-3.5 text-[8px] font-bold leading-none flex items-center justify-center hover:bg-[#CC0000] hover:text-[#FFFFFF]"
                      title="Dismiss suggestions"
                    >
                      ×
                    </button>
                  )}
                </div>

                {/* Top Match Hero Card */}
                {displayList[0] && (
                  <div className="retro-inset bg-[#FFFFCC] p-1.5 mb-1 text-black font-sans">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1 mr-1">
                        <div className="text-[8px] font-mono font-bold text-[#808080] uppercase">
                          Top Match #1
                        </div>
                        <div className="font-heading text-sm font-black text-[#000080] truncate">
                          {displayList[0].label}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <span className="font-mono text-[11px] font-bold text-[#008000] bg-[#FFFFFF] px-1 retro-inset inline-block">
                          {Math.round(displayList[0].confidence * 100)}%
                        </span>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-[#808080] h-1.5 my-1 retro-inset p-0.2 flex">
                      <div
                        className="bg-[#00AA00] h-full transition-all duration-150"
                        style={{
                          width: `${Math.min(100, Math.round(displayList[0].confidence * 100))}%`
                        }}
                      />
                    </div>

                    {/* Tap to select / swap hero sign */}
                    {onSelectCandidate && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <button
                          onClick={() => onSelectCandidate(displayList[0].label, 'smart')}
                          className="retro-btn flex-1 !py-0.5 text-[10px] font-bold bg-[#E0E0E0] hover:bg-[#000080] hover:text-[#FFFFFF] flex items-center justify-center gap-1 active:translate-y-[1px]"
                          title={`Tap to select "${displayList[0].label}"`}
                        >
                          <span>+ TAP TO USE</span>
                        </button>
                        {currentGlosses && currentGlosses.length > 0 && currentGlosses[currentGlosses.length - 1] !== displayList[0].label && (
                          <button
                            onClick={() => onSelectCandidate(displayList[0].label, 'replace')}
                            className="retro-btn !py-0.5 !px-1.5 text-[9px] font-mono text-[#000080] hover:bg-[#000080] hover:text-[#FFFFFF] active:translate-y-[1px]"
                            title={`Swap last sign with "${displayList[0].label}"`}
                          >
                            ⇄ Swap
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Alternative Candidates with Good Confidence (Runners-up) */}
                {displayList.length > 1 && (
                  <div className="space-y-1">
                    <div className="text-[8px] font-mono font-bold text-[#000080] uppercase px-0.5 flex items-center justify-between">
                      <span>ALTERNATIVES (TAP TO USE):</span>
                    </div>

                    {displayList.slice(1, 4).map((candidate) => {
                      const isGoodConfidence = candidate.confidence >= 0.20;
                      if (!isGoodConfidence) return null;

                      return (
                        <div
                          key={candidate.label}
                          className="p-1 bg-[#FFFFFF] retro-inset flex flex-col gap-0.5"
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono">
                            <span className="font-bold text-[#000000] truncate max-w-[110px]">
                              #{candidate.rank || ''} {candidate.label}
                            </span>
                            <span className="font-bold text-[#008000]">
                              {Math.round(candidate.confidence * 100)}%
                            </span>
                          </div>

                          {/* Micro progress bar */}
                          <div className="w-full bg-[#E0E0E0] h-1 retro-inset p-0.1 flex">
                            <div
                              className="bg-[#000080] h-full"
                              style={{
                                width: `${Math.min(100, Math.round(candidate.confidence * 100))}%`
                              }}
                            />
                          </div>

                          {/* Quick action buttons */}
                          {onSelectCandidate && (
                            <div className="flex items-center gap-1 mt-0.5">
                              <button
                                onClick={() => onSelectCandidate(candidate.label, 'smart')}
                                className="retro-btn flex-1 !py-0 !px-1 text-[9px] font-bold hover:bg-[#000080] hover:text-[#FFFFFF] active:translate-y-[1px]"
                                title={`Select "${candidate.label}"`}
                              >
                                + Tap
                              </button>
                              {currentGlosses && currentGlosses.length > 0 && (
                                <button
                                  onClick={() => onSelectCandidate(candidate.label, 'replace')}
                                  className="retro-btn !py-0 !px-1 text-[9px] font-mono text-[#000080] hover:bg-[#000080] hover:text-[#FFFFFF] active:translate-y-[1px]"
                                  title={`Swap last sign with "${candidate.label}"`}
                                >
                                  ⇄ Swap
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Picture-in-Picture Remote Peer Video Feed */}
          {remoteStream && (
            <div className="absolute bottom-2 right-2 z-20 retro-window bg-[#C0C0C0] p-0.5 border border-[#000000] shadow-xl max-w-[210px] w-[38%] sm:w-[190px]">
              <div className="retro-window-titlebar !py-0.2 !px-1 text-[9px] flex items-center justify-between">
                <div className="flex items-center gap-1 font-mono font-bold truncate">
                  <span className="w-1.5 h-1.5 bg-[#00AA00] flex-shrink-0 animate-pulse"></span>
                  <span className="truncate">{peerPresence?.name || 'Remote Partner'}</span>
                </div>
                <span className="text-[8px] bg-[#FFFF00] text-[#000000] px-1 font-mono font-bold">
                  P2P
                </span>
              </div>
              <div className="retro-inset bg-[#000000] aspect-[4/3] overflow-hidden flex items-center justify-center">
                <video
                  ref={remoteVideoRef}
                  playsInline
                  autoPlay
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Connected Partner Camera Status Chip */}
          {peerPresence?.isOnline && !remoteStream && (
            <div className="absolute bottom-2 right-2 z-20 retro-outset bg-[#C0C0C0] px-2 py-0.5 text-[10px] font-mono border border-[#000000] shadow-md flex items-center gap-1.5">
              <span className="w-2 h-2 bg-[#00AA00]"></span>
              <span className="font-bold text-[#000000]">{peerPresence?.name || 'Partner'} online</span>
              <span className="text-[#808080] hidden sm:inline">(Cam Off)</span>
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

                {onOpenGuide && (
                  <button
                    onClick={onOpenGuide}
                    className="retro-btn w-full mt-2 py-1 text-xs font-bold bg-[#FFFFCC] text-[#000000] flex items-center justify-center gap-1.5"
                    title="Learn how to sign and explore features"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#000080]" />
                    <span>HOW IT WORKS &amp; FEATURES</span>
                  </button>
                )}
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

                {onOpenGuide && (
                  <button
                    onClick={onOpenGuide}
                    className="retro-btn w-full mt-2 py-1 text-xs font-bold bg-[#FFFFCC] text-[#000000] flex items-center justify-center gap-1.5"
                    title="Learn how to sign and explore features"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-[#000080]" />
                    <span>HOW IT WORKS &amp; FEATURES</span>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* 3. Lower Camera Control & Telemetry Bar */}
        <div className="flex items-center justify-between gap-1.5 mt-1 pt-0.5 border-t border-[#808080] flex-shrink-0">
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
