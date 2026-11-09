import html2canvas from 'html2canvas';

/**
 * screenshotCapture.js
 * 
 * Intelligent in-browser screenshot capture for Sanket:
 * 1. Automatically renders the active DOM tree using html2canvas.
 * 2. Blits live HTML5 <video> frames onto replacement canvases so camera streams aren't blank.
 * 3. Copies landmark and skeleton <canvas> buffers so biometric overlays are preserved.
 * 4. Provides a fallback native screen-capture method via navigator.mediaDevices.getDisplayMedia.
 */

/**
 * Captures an instant screenshot of the current document or target container.
 * @param {HTMLElement} [targetElement]
 * @returns {Promise<string>} Base64 JPEG data URL
 */
export async function captureDOMScreenshot(targetElement = null) {
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return createFallbackScreenshot('Screenshot unavailable in non-browser environment.');
  }

  const element = targetElement || document.getElementById('root') || document.body;

  try {
    const canvas = await html2canvas(element, {
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: '#FAF8F5',
      // Balanced scale: sharp enough to read telemetry and text, lightweight in memory
      scale: typeof window !== 'undefined' ? Math.min(window.devicePixelRatio || 1, 1.5) : 1,
      ignoreElements: (el) => {
        // Exclude feedback modal itself from the screenshot if it happens to be open
        return el.getAttribute('data-feedback-modal') === 'true';
      },
      onclone: (clonedDoc) => {
        // 1. Substitute live <video> elements with canvas snapshots of their active frame
        try {
          const originalVideos = element.querySelectorAll('video');
          const clonedVideos = clonedDoc.querySelectorAll('video');
          originalVideos.forEach((origVideo, i) => {
            const clonedVideo = clonedVideos[i];
            if (clonedVideo && origVideo.videoWidth > 0 && origVideo.videoHeight > 0) {
              try {
                const tempCanvas = clonedDoc.createElement('canvas');
                tempCanvas.width = origVideo.videoWidth;
                tempCanvas.height = origVideo.videoHeight;
                const ctx = tempCanvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(origVideo, 0, 0, tempCanvas.width, tempCanvas.height);
                  tempCanvas.className = clonedVideo.className;
                  tempCanvas.style.cssText = clonedVideo.style.cssText;
                  tempCanvas.style.objectFit = 'cover';
                  if (clonedVideo.parentNode) {
                    clonedVideo.parentNode.replaceChild(tempCanvas, clonedVideo);
                  }
                }
              } catch (err) {
                console.warn('[Screenshot] Video blit caught error:', err);
              }
            }
          });
        } catch (videoErr) {
          console.warn('[Screenshot] Video clone handling warning:', videoErr);
        }

        // 2. Blit 2D skeleton overlays and biometric canvas buffers onto cloned canvases
        try {
          const originalCanvases = element.querySelectorAll('canvas');
          const clonedCanvases = clonedDoc.querySelectorAll('canvas');
          originalCanvases.forEach((origCanvas, i) => {
            const clonedCanvas = clonedCanvases[i];
            if (clonedCanvas && origCanvas.width > 0 && origCanvas.height > 0) {
              try {
                const ctx = clonedCanvas.getContext('2d');
                if (ctx) {
                  ctx.drawImage(origCanvas, 0, 0);
                }
              } catch (canvasErr) {
                // If original canvas is tainted, skip gracefully
                console.warn('[Screenshot] Canvas draw warning:', canvasErr);
              }
            }
          });
        } catch (canvasErr) {
          console.warn('[Screenshot] Canvas clone handling warning:', canvasErr);
        }
      }
    });

    return canvas.toDataURL('image/jpeg', 0.82);
  } catch (err) {
    console.error('[Screenshot] HTML2Canvas capture failed:', err);
    return createFallbackScreenshot(err?.message || 'DOM rendering error');
  }
}

/**
 * Native hardware screen capture using navigator.mediaDevices.getDisplayMedia.
 * Lets the user select the exact browser tab or application window.
 * @returns {Promise<string>} Base64 JPEG data URL
 */
export async function captureNativeWindowScreenshot() {
  if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getDisplayMedia) {
    throw new Error('Native screen capture API is not supported in this browser.');
  }

  const stream = await navigator.mediaDevices.getDisplayMedia({
    video: {
      displaySurface: 'browser'
    },
    audio: false
  });

  try {
    const track = stream.getVideoTracks()[0];
    if (!track) {
      throw new Error('No video track found in screen capture stream.');
    }

    // Try ImageCapture API if supported
    if (typeof window !== 'undefined' && 'ImageCapture' in window) {
      try {
        const imageCapture = new window.ImageCapture(track);
        const bitmap = await imageCapture.grabFrame();
        const canvas = document.createElement('canvas');
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(bitmap, 0, 0);
        return canvas.toDataURL('image/jpeg', 0.85);
      } catch (icErr) {
        console.warn('[Screenshot] ImageCapture failed, falling back to video element:', icErr);
      }
    }

    // Fallback: pipe stream through temporary HTML5 video
    return await new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.autoplay = true;
      video.muted = true;
      video.srcObject = stream;

      const onPlaying = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth || 1280;
          canvas.height = video.videoHeight || 720;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          video.srcObject = null;
          resolve(dataUrl);
        } catch (e) {
          reject(e);
        }
      };

      video.addEventListener('playing', onPlaying, { once: true });
      video.play().catch(reject);

      setTimeout(() => {
        reject(new Error('Screen capture frame timeout'));
      }, 5000);
    });
  } finally {
    stream.getTracks().forEach((track) => track.stop());
  }
}

/**
 * Creates a clean fallback placeholder screenshot when DOM rendering is unavailable.
 */
export function createFallbackScreenshot(reason = '') {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 640;
  canvas.height = 360;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Background
  ctx.fillStyle = '#FAF8F5';
  ctx.fillRect(0, 0, 640, 360);

  // Border
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#18181B';
  ctx.strokeRect(2, 2, 636, 356);

  // Content
  ctx.fillStyle = '#18181B';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.fillText('Sanket — Snapshot Diagnostics', 32, 60);

  ctx.fillStyle = '#52525B';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(`Captured on: ${new Date().toLocaleString()}`, 32, 95);

  if (reason) {
    ctx.fillStyle = '#DC2626';
    ctx.font = '12px monospace';
    ctx.fillText(`Notice: ${reason}`, 32, 130);
  }

  return canvas.toDataURL('image/jpeg', 0.85);
}
