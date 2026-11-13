import { useState, useEffect, useRef, useCallback } from 'react';

export function useVisionWorker() {
  const workerRef = useRef(null);
  const [isWorkerReady, setIsWorkerReady] = useState(false);
  const [workerStatus, setWorkerStatus] = useState('idle');
  const [workerLatencyMs, setWorkerLatencyMs] = useState(0);
  const [latestLandmarks, setLatestLandmarks] = useState(null);
  const [latestNormalizedFeatures, setLatestNormalizedFeatures] = useState(null);
  const [alphabetPredictions, setAlphabetPredictions] = useState([]);
  const [latestConfirmedLetter, setLatestConfirmedLetter] = useState(null);
  const [wordPredictions, setWordPredictions] = useState({ topCandidates: [], confirmedWord: null });
  const [latestConfirmedWord, setLatestConfirmedWord] = useState(null);
  const [motionState, setMotionState] = useState({
    state: 'IDLE',
    rollingVelocity: 0,
    pauseProgress: 0,
    elapsedPauseMs: 0
  });
  const [bufferSize, setBufferSize] = useState(0);
  const [workerError, setWorkerError] = useState(null);
  const [profilingData, setProfilingData] = useState({
    holisticMs: 0,
    normMs: 0,
    classifierMs: 0,
    totalWorkerMs: 0,
    wordGateDelayMs: 0,
    alphabetGateDelayMs: 0
  });

  // Prevent queuing frames when worker is busy
  const isProcessingFrameRef = useRef(false);

  useEffect(() => {
    let worker = null;

    try {
      worker = new Worker(new URL('../workers/vision.worker.js', import.meta.url), {
        type: 'module'
      });
      workerRef.current = worker;
      setWorkerStatus('loading');

      worker.onmessage = (event) => {
        const data = event.data || {};

        switch (data.type) {
          case 'WORKER_STATUS':
            setWorkerStatus(data.status);
            break;

          case 'WORKER_READY':
            setIsWorkerReady(true);
            setWorkerStatus('ready');
            setWorkerLatencyMs(data.latencyMs || 0);
            console.log(`[useVisionWorker] Worker ready with ${data.delegate} acceleration`);
            break;

          case 'LANDMARK_RESULTS':
            isProcessingFrameRef.current = false;
            setLatestLandmarks(data.landmarks);
            setWorkerLatencyMs(data.processingTimeMs);
            if (data.normalizedFeatures) {
              setLatestNormalizedFeatures(data.normalizedFeatures);
            }
            if (Array.isArray(data.alphabetPredictions)) {
              setAlphabetPredictions(data.alphabetPredictions);
            }
            if (data.latestConfirmedLetter) {
              setLatestConfirmedLetter({
                letter: data.latestConfirmedLetter,
                id: `${data.latestConfirmedLetter}_${data.timestamp || Date.now()}`
              });
            }
            if (data.wordPredictions) {
              setWordPredictions(data.wordPredictions);
              if (data.wordPredictions.confirmedWord) {
                setLatestConfirmedWord({
                  word: data.wordPredictions.confirmedWord,
                  id: `${data.wordPredictions.confirmedWord}_${data.timestamp || Date.now()}`
                });
              }
            }
            if (data.motion) {
              setMotionState(data.motion);
            }
            if (typeof data.bufferSize === 'number') {
              setBufferSize(data.bufferSize);
            }
            if (data.profiling) {
              setProfilingData(data.profiling);
            }
            break;

          case 'FRAME_ERROR':
            isProcessingFrameRef.current = false;
            break;

          case 'WORKER_ERROR':
            isProcessingFrameRef.current = false;
            setWorkerStatus('error');
            setWorkerError(data.error);
            setIsWorkerReady(false);
            break;

          default:
            break;
        }
      };

      worker.onerror = (err) => {
        isProcessingFrameRef.current = false;
        console.error('[useVisionWorker] Web Worker top-level error:', err);
        setWorkerStatus('error');
        setWorkerError(err.message || 'Worker thread execution error');
      };

      // Trigger initialization
      worker.postMessage({ type: 'INIT_VISION' });
    } catch (err) {
      console.error('[useVisionWorker] Failed to create Web Worker:', err);
      setWorkerStatus('error');
      setWorkerError(err.message);
    }

    return () => {
      if (worker) {
        worker.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  // Dispatch frame to background worker
  const sendFrame = useCallback(async (videoElement, timestamp, recognitionMode = 'word') => {
    if (!workerRef.current || !isWorkerReady || isProcessingFrameRef.current) {
      return;
    }

    if (!videoElement || videoElement.readyState < 2) {
      return;
    }

    let imageBitmap = null;
    try {
      isProcessingFrameRef.current = true;
      imageBitmap = await createImageBitmap(videoElement);
      workerRef.current.postMessage(
        {
          type: 'PROCESS_FRAME',
          imageBitmap,
          timestamp,
          recognitionMode
        },
        [imageBitmap]
      );
    } catch (err) {
      isProcessingFrameRef.current = false;
      if (imageBitmap && typeof imageBitmap.close === 'function') {
        try {
          imageBitmap.close();
        } catch (_) {}
      }
      // Normal during video pauses or tab switching
    }
  }, [isWorkerReady]);

  // Clear 30-frame temporal buffer and reset velocity gate
  const clearBuffer = useCallback(() => {
    if (workerRef.current && isWorkerReady) {
      workerRef.current.postMessage({ type: 'CLEAR_BUFFER' });
    }
  }, [isWorkerReady]);

  // Dynamically configure gating and pause duration
  const configureGate = useCallback((config) => {
    if (workerRef.current && isWorkerReady) {
      workerRef.current.postMessage({ type: 'CONFIGURE_GATE', config });
    }
  }, [isWorkerReady]);

  return {
    isWorkerReady,
    workerStatus,
    workerLatencyMs,
    latestLandmarks,
    latestNormalizedFeatures,
    alphabetPredictions,
    latestConfirmedLetter,
    wordPredictions,
    latestConfirmedWord,
    motionState,
    bufferSize,
    workerError,
    profilingData,
    sendFrame,
    clearBuffer,
    configureGate
  };
}

export default useVisionWorker;
