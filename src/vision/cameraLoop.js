/**
 * Hardware-synchronized camera acquisition loop.
 * Uses requestVideoFrameCallback() when available to lock strictly
 * to camera hardware V-Sync and eliminate duplicate frame processing.
 *
 * @param {HTMLVideoElement} videoElement
 * @param {Function} onFrameReady - Callback receiving (videoElement, timestamp, metadata)
 * @returns {Function} cleanup - Function to stop the loop
 */
export function startCameraLoop(videoElement, onFrameReady) {
  let isRunning = true;
  let callbackId = null;

  const hasVideoFrameCallback = typeof videoElement.requestVideoFrameCallback === 'function';

  function frameCallback(now, metadata) {
    if (!isRunning) return;

    try {
      onFrameReady(videoElement, performance.now(), metadata || { mediaTime: videoElement.currentTime });
    } catch (err) {
      console.error('[cameraLoop] Error in frame callback:', err);
    }

    if (!isRunning) return;

    if (hasVideoFrameCallback) {
      callbackId = videoElement.requestVideoFrameCallback(frameCallback);
    } else {
      callbackId = requestAnimationFrame(frameCallback);
    }
  }

  if (hasVideoFrameCallback) {
    callbackId = videoElement.requestVideoFrameCallback(frameCallback);
  } else {
    callbackId = requestAnimationFrame(frameCallback);
  }

  return () => {
    isRunning = false;
    if (callbackId !== null) {
      if (hasVideoFrameCallback && typeof videoElement.cancelVideoFrameCallback === 'function') {
        videoElement.cancelVideoFrameCallback(callbackId);
      } else {
        cancelAnimationFrame(callbackId);
      }
    }
  };
}
