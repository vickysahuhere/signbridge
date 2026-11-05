/**
 * Color-coded 2D canvas drawing routine for 3D MediaPipe Holistic landmarks.
 * Distinct hand colors are strictly required to disambiguate crossed hands in ISL.
 *
 * Left Hand:  Sky Blue      (#38BDF8)
 * Right Hand: Emerald Green (#34D399)
 * Upper Pose: White         (#FFFFFF)
 * Face Mesh:  Amber         (#F59E0B)
 */

import { getLandmarkArray } from './normalizeLandmarks.js';

// 21 Hand joint connections
export const HAND_CONNECTIONS = [
  // Palm base
  [0, 1], [0, 5], [5, 9], [9, 13], [13, 17], [0, 17],
  // Thumb
  [1, 2], [2, 3], [3, 4],
  // Index
  [5, 6], [6, 7], [7, 8],
  // Middle
  [9, 10], [10, 11], [11, 12],
  // Ring
  [13, 14], [14, 15], [15, 16],
  // Pinky
  [17, 18], [18, 19], [19, 20]
];

// Upper body pose connections (Shoulders, elbows, wrists)
export const UPPER_POSE_CONNECTIONS = [
  [11, 12], // Left shoulder to Right shoulder
  [11, 13], // Left shoulder to Left elbow
  [13, 15], // Left elbow to Left wrist
  [12, 14], // Right shoulder to Right elbow
  [14, 16]  // Right elbow to Right wrist
];

// Key facial contour indices (Eyebrows & lips for non-manual ISL expression)
export const FACE_CONTOURS = {
  leftEyebrow: [70, 63, 105, 66, 107],
  rightEyebrow: [300, 293, 334, 296, 336],
  lips: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 13]
};

export const COLOR_TOKENS = {
  leftHand: '#38BDF8',   // Sky Blue
  rightHand: '#34D399',  // Emerald Green
  pose: '#FFFFFF',       // White
  face: '#F59E0B',       // Amber
  safeBox: 'rgba(148, 163, 184, 0.25)',
  alert: '#F43F5E'       // Rose Red
};

/**
 * Draws a connected set of landmark points
 */
function drawConnections(ctx, landmarks, connections, color, lineWidth = 2, checkVisibility = false) {
  if (!landmarks || landmarks.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  for (const [startIdx, endIdx] of connections) {
    const p1 = landmarks[startIdx];
    const p2 = landmarks[endIdx];

    if (!p1 || !p2) continue;
    // Only check visibility for pose landmarks; hand landmarks do not use visibility
    if (checkVisibility) {
      if (typeof p1.visibility === 'number' && p1.visibility < 0.3) continue;
      if (typeof p2.visibility === 'number' && p2.visibility < 0.3) continue;
    }

    ctx.beginPath();
    ctx.moveTo(p1.x * ctx.canvas.width, p1.y * ctx.canvas.height);
    ctx.lineTo(p2.x * ctx.canvas.width, p2.y * ctx.canvas.height);
    ctx.stroke();
  }
}

/**
 * Draws landmark joint circles
 */
function drawJoints(ctx, landmarks, color, radius = 3, checkVisibility = false) {
  if (!landmarks || landmarks.length === 0) return;

  ctx.fillStyle = color;

  for (const p of landmarks) {
    if (!p) continue;
    if (checkVisibility && typeof p.visibility === 'number' && p.visibility < 0.3) continue;

    ctx.beginPath();
    ctx.arc(p.x * ctx.canvas.width, p.y * ctx.canvas.height, radius, 0, 2 * Math.PI);
    ctx.fill();
  }
}

// 5 fingertip joint indices (Thumb, Index, Middle, Ring, Pinky)
const FINGERTIP_INDICES = [4, 8, 12, 16, 20];

/**
 * Draws prominent glowing fingertips to make finger articulation obvious
 */
function drawFingertips(ctx, landmarks, color, radius = 5.5) {
  if (!landmarks || landmarks.length === 0) return;

  for (const idx of FINGERTIP_INDICES) {
    const p = landmarks[idx];
    if (!p) continue;

    const x = p.x * ctx.canvas.width;
    const y = p.y * ctx.canvas.height;

    // Outer glow ring
    ctx.beginPath();
    ctx.arc(x, y, radius + 2, 0, 2 * Math.PI);
    ctx.fillStyle = color === COLOR_TOKENS.leftHand ? 'rgba(56, 189, 248, 0.4)' : 'rgba(52, 211, 153, 0.4)';
    ctx.fill();

    // Inner bright fingertip dot
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
  }
}

/**
 * Draws sequential contour lines (such as eyebrows and lips)
 */
function drawContour(ctx, landmarks, indices, color, lineWidth = 1.5, closed = false) {
  if (!landmarks || landmarks.length === 0) return;

  ctx.strokeStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();

  let first = true;
  for (const idx of indices) {
    const pt = landmarks[idx];
    if (!pt) continue;

    const x = pt.x * ctx.canvas.width;
    const y = pt.y * ctx.canvas.height;

    if (first) {
      ctx.moveTo(x, y);
      first = false;
    } else {
      ctx.lineTo(x, y);
    }
  }

  if (closed) {
    ctx.closePath();
  }
  ctx.stroke();
}

/**
 * Draws subtle dashed safe-zone framing guide
 */
function drawFramingGuide(ctx, marginPercent = 0.10) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const mx = w * marginPercent;
  const my = h * marginPercent;

  ctx.save();
  ctx.strokeStyle = COLOR_TOKENS.safeBox;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([8, 8]);
  ctx.strokeRect(mx, my, w - 2 * mx, h - 2 * my);
  ctx.restore();
}

/**
 * Main skeleton rendering function
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {Object} landmarks - { leftHandLandmarks, rightHandLandmarks, poseLandmarks, faceLandmarks }
 * @param {Object} options - { showGuide: boolean, showFace: boolean }
 */
export function drawSkeleton(ctx, landmarks, options = {}) {
  const { showGuide = true, showFace = true } = options;
  const { width, height } = ctx.canvas;

  // Clear previous frame
  ctx.clearRect(0, 0, width, height);

  // Safe-zone framing guide
  if (showGuide) {
    drawFramingGuide(ctx);
  }

  if (!landmarks) return;

  const leftHand = getLandmarkArray(landmarks.leftHandLandmarks);
  const rightHand = getLandmarkArray(landmarks.rightHandLandmarks);
  const pose = getLandmarkArray(landmarks.poseLandmarks);
  const face = getLandmarkArray(landmarks.faceLandmarks);

  // 1. Upper Body Pose (White)
  if (pose.length > 0) {
    drawConnections(ctx, pose, UPPER_POSE_CONNECTIONS, COLOR_TOKENS.pose, 2, true);
    drawJoints(ctx, [pose[11], pose[12], pose[13], pose[14]], COLOR_TOKENS.pose, 3, true);
  }

  // 2. Facial Expressions (Amber)
  if (showFace && face.length > 0) {
    drawContour(ctx, face, FACE_CONTOURS.leftEyebrow, COLOR_TOKENS.face, 1.5, false);
    drawContour(ctx, face, FACE_CONTOURS.rightEyebrow, COLOR_TOKENS.face, 1.5, false);
    drawContour(ctx, face, FACE_CONTOURS.lips, COLOR_TOKENS.face, 1.5, true);
  }

  // 3. Left Hand & Fingers (Sky Blue - #38BDF8)
  if (leftHand.length > 0) {
    drawConnections(ctx, leftHand, HAND_CONNECTIONS, COLOR_TOKENS.leftHand, 2.5, false);
    drawJoints(ctx, leftHand, COLOR_TOKENS.leftHand, 3.5, false);
    drawFingertips(ctx, leftHand, COLOR_TOKENS.leftHand, 5.5);
  }

  // 4. Right Hand & Fingers (Emerald Green - #34D399)
  if (rightHand.length > 0) {
    drawConnections(ctx, rightHand, HAND_CONNECTIONS, COLOR_TOKENS.rightHand, 2.5, false);
    drawJoints(ctx, rightHand, COLOR_TOKENS.rightHand, 3.5, false);
    drawFingertips(ctx, rightHand, COLOR_TOKENS.rightHand, 5.5);
  }
}

/**
 * Checks if wrist landmarks are near the outer boundary
 *
 * @param {Object} landmarks
 * @param {number} marginPercent - Default 0.10 (10% from any edge)
 * @returns {{ isOutOfFrame: boolean, message: string }}
 */
export function checkBoundaryAlert(landmarks, marginPercent = 0.10) {
  if (!landmarks) return { isOutOfFrame: false, message: '' };

  const leftHand = getLandmarkArray(landmarks.leftHandLandmarks);
  const rightHand = getLandmarkArray(landmarks.rightHandLandmarks);

  const leftWrist = leftHand[0];
  const rightWrist = rightHand[0];

  const checkPoint = (pt) => {
    if (!pt) return false;
    return pt.x < marginPercent || pt.x > (1 - marginPercent) ||
           pt.y < marginPercent || pt.y > (1 - marginPercent);
  };

  const leftNearEdge = checkPoint(leftWrist);
  const rightNearEdge = checkPoint(rightWrist);

  if (leftNearEdge || rightNearEdge) {
    return {
      isOutOfFrame: true,
      message: 'Keep both hands centered inside the camera frame'
    };
  }

  return { isOutOfFrame: false, message: '' };
}
