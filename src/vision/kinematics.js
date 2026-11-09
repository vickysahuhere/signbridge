/**
 * Dynamic Kinematics & Trajectory Analysis Module for Indian Sign Language (ISL).
 *
 * Tracks multi-frame motion trajectories (vertical nodding, horizontal waving,
 * circular rubbing, and stationary rest states) across the sliding RingBuffer window.
 *
 * Grounded in authentic ISL dynamic sign recognition:
 * - YES: Fist nodding vertically up and down from the wrist like a nodding head.
 * - NO: Hand / index finger wagging horizontally side to side.
 * - PLEASE / SORRY: Flat palm or fist rubbing in circular motion over chest.
 * - STATIONARY: Rejection of static fists to avoid false positives (e.g. resting hands or letter S/A).
 */

/**
 * Analyzes the trajectory of a 2D/3D point sequence across recent frames.
 *
 * @param {Array<{x: number, y: number, z?: number}>} points - Sequence of point coordinates
 * @param {Object} [options={}]
 * @param {number} [options.noiseThreshold=0.006] - Minimum step to reject sensor jitter
 * @param {number} [options.nodMinDisplacement=0.035] - Minimum Y displacement for a nod
 * @param {number} [options.waveMinDisplacement=0.040] - Minimum X displacement for a wave
 * @returns {{
 *   dx: number,
 *   dy: number,
 *   verticalOscillations: number,
 *   horizontalOscillations: number,
 *   isNodding: boolean,
 *   isWaving: boolean,
 *   isCircular: boolean,
 *   isStationary: boolean
 * }}
 */
export function analyzeTrajectory(points = [], options = {}) {
  const noiseThreshold = options.noiseThreshold ?? 0.006;
  const nodMinDisplacement = options.nodMinDisplacement ?? 0.035;
  const waveMinDisplacement = options.waveMinDisplacement ?? 0.040;

  if (!points || points.length < 4) {
    return {
      dx: 0,
      dy: 0,
      verticalOscillations: 0,
      horizontalOscillations: 0,
      isNodding: false,
      isWaving: false,
      isCircular: false,
      isStationary: true
    };
  }

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;

  for (const pt of points) {
    if (typeof pt.x === 'number' && !Number.isNaN(pt.x)) {
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
    }
    if (typeof pt.y === 'number' && !Number.isNaN(pt.y)) {
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
  }

  if (!Number.isFinite(minX) || !Number.isFinite(minY)) {
    return {
      dx: 0,
      dy: 0,
      verticalOscillations: 0,
      horizontalOscillations: 0,
      isNodding: false,
      isWaving: false,
      isCircular: false,
      isStationary: true
    };
  }

  const dx = Math.max(0, maxX - minX);
  const dy = Math.max(0, maxY - minY);

  // 1. Filter out minor sensor jitter in Y (vertical)
  const filteredY = [];
  for (const p of points) {
    if (typeof p.y === 'number' && !Number.isNaN(p.y)) {
      if (filteredY.length === 0 || Math.abs(p.y - filteredY[filteredY.length - 1]) >= noiseThreshold) {
        filteredY.push(p.y);
      }
    }
  }

  let verticalOscillations = 0;
  let lastDirY = 0;
  for (let i = 1; i < filteredY.length; i++) {
    const dir = Math.sign(filteredY[i] - filteredY[i - 1]);
    if (dir !== 0) {
      if (lastDirY !== 0 && dir !== lastDirY) {
        verticalOscillations++;
      }
      lastDirY = dir;
    }
  }

  // 2. Filter out minor sensor jitter in X (horizontal)
  const filteredX = [];
  for (const p of points) {
    if (typeof p.x === 'number' && !Number.isNaN(p.x)) {
      if (filteredX.length === 0 || Math.abs(p.x - filteredX[filteredX.length - 1]) >= noiseThreshold) {
        filteredX.push(p.x);
      }
    }
  }

  let horizontalOscillations = 0;
  let lastDirX = 0;
  for (let i = 1; i < filteredX.length; i++) {
    const dir = Math.sign(filteredX[i] - filteredX[i - 1]);
    if (dir !== 0) {
      if (lastDirX !== 0 && dir !== lastDirX) {
        horizontalOscillations++;
      }
      lastDirX = dir;
    }
  }

  // Kinematic classifications
  // Vertical nod: Significant vertical displacement, at least 1 reversal, dy dominates dx
  const isNodding = dy >= nodMinDisplacement && verticalOscillations >= 1 && (dy >= 1.15 * dx || dx < 0.03);

  // Horizontal wave: Significant horizontal displacement, at least 1 reversal, dx dominates dy
  const isWaving = dx >= waveMinDisplacement && horizontalOscillations >= 1 && (dx >= 1.15 * dy || dy < 0.03);

  // Circular rubbing: Significant motion in both axes with reversals
  const isCircular = dx >= 0.030 && dy >= 0.030 && (verticalOscillations >= 1 || horizontalOscillations >= 1);

  // Stationary: Virtually no motion and no oscillations
  const isStationary = dx < 0.025 && dy < 0.025 && verticalOscillations === 0 && horizontalOscillations === 0;

  return {
    dx: Math.round(dx * 1000) / 1000,
    dy: Math.round(dy * 1000) / 1000,
    verticalOscillations,
    horizontalOscillations,
    isNodding,
    isWaving,
    isCircular,
    isStationary
  };
}

/**
 * Extracts kinematics for left hand, right hand, and head from the sliding RingBuffer.
 *
 * @param {Object} ringBuffer - RingBuffer instance with .frames array
 * @param {number} [windowFrames=18] - Number of recent frames to analyze (default ~600ms at 30fps)
 * @returns {Object} Comprehensive kinematics state
 */
export function extractKinematicsFromRingBuffer(ringBuffer, windowFrames = 18) {
  const defaultNeutral = {
    dx: 0,
    dy: 0,
    verticalOscillations: 0,
    horizontalOscillations: 0,
    isNodding: false,
    isWaving: false,
    isCircular: false,
    isStationary: true
  };

  if (!ringBuffer || !Array.isArray(ringBuffer.frames) || ringBuffer.frames.length < 4) {
    return {
      leftHand: defaultNeutral,
      rightHand: defaultNeutral,
      head: defaultNeutral,
      dominant: defaultNeutral,
      isNodding: false,
      isWaving: false,
      isCircular: false,
      isStationary: true,
      verticalOscillations: 0,
      horizontalOscillations: 0,
      verticalDisplacement: 0,
      horizontalDisplacement: 0
    };
  }

  const frames = ringBuffer.frames.slice(-Math.max(4, windowFrames));

  const leftPoints = [];
  const rightPoints = [];
  const headPoints = [];

  for (const f of frames) {
    if (!f || f.length < 240) continue;

    // Left hand point 9 (middle MCP) or point 0 (wrist)
    // Left hand points: 0-62. Point 0 = indices 0,1,2. Point 9 = indices 27,28,29.
    const hasLeftHand = f[0] !== 0 || f[1] !== 0 || f[27] !== 0 || f[28] !== 0;
    if (hasLeftHand) {
      leftPoints.push({
        x: f[27] !== 0 ? f[27] : f[0],
        y: f[28] !== 0 ? f[28] : f[1],
        z: f[29] !== 0 ? f[29] : f[2]
      });
    }

    // Right hand point 9 (middle MCP) or point 0 (wrist)
    // Right hand base = 63. Point 0 = indices 63,64,65. Point 9 = indices 90,91,92.
    const hasRightHand = f[63] !== 0 || f[64] !== 0 || f[90] !== 0 || f[91] !== 0;
    if (hasRightHand) {
      rightPoints.push({
        x: f[90] !== 0 ? f[90] : f[63],
        y: f[91] !== 0 ? f[91] : f[64],
        z: f[92] !== 0 ? f[92] : f[65]
      });
    }

    // Upper Body Nose: Pose index 0 = offset 126, 127, 128
    const hasHead = f[126] !== 0 || f[127] !== 0;
    if (hasHead) {
      headPoints.push({
        x: f[126],
        y: f[127],
        z: f[128]
      });
    }
  }

  const leftKinematics = analyzeTrajectory(leftPoints);
  const rightKinematics = analyzeTrajectory(rightPoints);
  const headKinematics = analyzeTrajectory(headPoints);

  // Pick dominant hand based on highest dynamic displacement
  const leftEnergy = leftKinematics.dx * leftKinematics.dx + leftKinematics.dy * leftKinematics.dy;
  const rightEnergy = rightKinematics.dx * rightKinematics.dx + rightKinematics.dy * rightKinematics.dy;

  const dominant = rightEnergy >= leftEnergy ? rightKinematics : leftKinematics;

  // Head nod non-manual marker reinforcement
  const isNodding = dominant.isNodding || (headKinematics.isNodding && dominant.dy >= 0.02);
  const isWaving = dominant.isWaving || (headKinematics.isWaving && dominant.dx >= 0.02);
  const isCircular = dominant.isCircular;
  const isStationary = dominant.isStationary && headKinematics.isStationary;

  return {
    leftHand: leftKinematics,
    rightHand: rightKinematics,
    head: headKinematics,
    dominant,
    isNodding,
    isWaving,
    isCircular,
    isStationary,
    verticalOscillations: dominant.verticalOscillations,
    horizontalOscillations: dominant.horizontalOscillations,
    verticalDisplacement: dominant.dy,
    horizontalDisplacement: dominant.dx
  };
}
