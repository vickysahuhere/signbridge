/**
 * Coordinate Normalization Module for Indian Sign Language (ISL) Edge AI.
 *
 * Transforms raw MediaPipe 3D coordinates into translation- and scale-invariant
 * 240-float feature vectors (80 keypoints x 3 axes: x, y, z).
 *
 * Selected 80 Keypoints:
 * - 21 Left Hand points (0 to 20)
 * - 21 Right Hand points (0 to 20)
 * - 12 Upper Body Pose points: Nose (0), Shoulders (11, 12), Elbows (13, 14),
 *   Wrists (15, 16), Pinkies (17, 18), Index (19, 20), Left Hip (23)
 * - 26 Facial Expression points: Lips (8 points), Eyebrows (10 points),
 *   Facial Anchors (Eyes, Nose, Chin, Forehead - 8 points)
 */

export const POSE_INDICES = [0, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 23];

export const FACE_INDICES = [
  // Inner & outer lips
  13, 14, 78, 308, 82, 312, 87, 317,
  // Left & right eyebrows (ISL grammatical WH-questions and negation)
  70, 63, 105, 66, 107, 300, 293, 334, 296, 336,
  // Eyes, nose tip, chin, forehead anchors
  33, 133, 362, 263, 1, 4, 152, 10
];

export const TOTAL_KEYPOINTS = 80;
export const FEATURE_DIM = TOTAL_KEYPOINTS * 3; // 240 floats

/**
 * Safely extracts a 1D landmark array regardless of whether MediaPipe returns
 * a 1D array of points [{x, y, z}, ...] or a 2D array of hands/poses [[{x, y, z}, ...]].
 */
export function getLandmarkArray(data) {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  if (Array.isArray(data[0])) return data[0];
  if (typeof data[0] === 'object' && data[0] !== null && 'x' in data[0]) return data;
  return [];
}

/**
 * Normalizes a single frame of Holistic landmarks.
 *
 * @param {Object} holisticResult - Output from MediaPipe HolisticLandmarker.detectForVideo
 * @returns {Object} { features: Float32Array(240), leftWrist, rightWrist, shoulderScale, center }
 */
export function extractAndNormalizeFrame(holisticResult = {}) {
  // Extract landmarks arrays safely tolerating both 2D and 1D arrays
  const pose = getLandmarkArray(holisticResult.poseLandmarks);
  const leftHand = getLandmarkArray(holisticResult.leftHandLandmarks);
  const rightHand = getLandmarkArray(holisticResult.rightHandLandmarks);
  const face = getLandmarkArray(holisticResult.faceLandmarks);

  // 1. Calculate Shoulder Midpoint (Center of Coordinate Space)
  const leftShoulder = pose[11] || { x: 0.4, y: 0.5, z: 0 };
  const rightShoulder = pose[12] || { x: 0.6, y: 0.5, z: 0 };

  const centerX = (leftShoulder.x + rightShoulder.x) / 2;
  const centerY = (leftShoulder.y + rightShoulder.y) / 2;
  const centerZ = ((leftShoulder.z || 0) + (rightShoulder.z || 0)) / 2;

  // 2. Calculate Shoulder Width (Scale Factor for Distance Invariance)
  const dx = leftShoulder.x - rightShoulder.x;
  const dy = leftShoulder.y - rightShoulder.y;
  const shoulderScale = Math.hypot(dx, dy) || 0.25; // Default fallback to avoid division by zero

  const features = new Float32Array(FEATURE_DIM);
  let offset = 0;

  function writePoint(pt) {
    if (!pt || typeof pt.x !== 'number' || typeof pt.y !== 'number' || Number.isNaN(pt.x) || Number.isNaN(pt.y)) {
      features[offset++] = 0.0;
      features[offset++] = 0.0;
      features[offset++] = 0.0;
    } else {
      features[offset++] = (pt.x - centerX) / shoulderScale;
      features[offset++] = (pt.y - centerY) / shoulderScale;
      features[offset++] = ((pt.z || 0) - centerZ) / shoulderScale;
    }
  }

  // 3. Write 21 Left Hand points (0 - 20)
  for (let i = 0; i < 21; i++) {
    writePoint(leftHand[i]);
  }

  // 4. Write 21 Right Hand points (0 - 20)
  for (let i = 0; i < 21; i++) {
    writePoint(rightHand[i]);
  }

  // 5. Write 12 Upper Body Pose points
  for (const idx of POSE_INDICES) {
    writePoint(pose[idx]);
  }

  // 6. Write 26 Facial Expression points
  for (const idx of FACE_INDICES) {
    writePoint(face[idx]);
  }

  return {
    features, // Float32Array(240)
    leftWrist: leftHand[0] ? {
      x: (leftHand[0].x - centerX) / shoulderScale,
      y: (leftHand[0].y - centerY) / shoulderScale,
      z: ((leftHand[0].z || 0) - centerZ) / shoulderScale
    } : (pose[15] ? {
      x: (pose[15].x - centerX) / shoulderScale,
      y: (pose[15].y - centerY) / shoulderScale,
      z: ((pose[15].z || 0) - centerZ) / shoulderScale
    } : null),
    rightWrist: rightHand[0] ? {
      x: (rightHand[0].x - centerX) / shoulderScale,
      y: (rightHand[0].y - centerY) / shoulderScale,
      z: ((rightHand[0].z || 0) - centerZ) / shoulderScale
    } : (pose[16] ? {
      x: (pose[16].x - centerX) / shoulderScale,
      y: (pose[16].y - centerY) / shoulderScale,
      z: ((pose[16].z || 0) - centerZ) / shoulderScale
    } : null),
    shoulderScale,
    center: { x: centerX, y: centerY, z: centerZ }
  };
}
