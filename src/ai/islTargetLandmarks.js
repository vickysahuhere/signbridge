/**
 * Indian Sign Language (ISL) Target Landmark Blueprints & Real-Time Biometric Evaluator.
 *
 * Provides exact 3D reference coordinates, biomechanical target tolerances,
 * and real-time posture matching for ISL signs and authentic two-handed fingerspelling.
 */

import { dist2D, dist3D, analyzeHand, classifyIslAlphabet } from './islGestureEngine.js';
import { ISL_ALPHABET_GUIDE } from './islAlphabetLabels.js';

// Base neutral upper body pose in normalized [0, 1] screen space
export const BASE_POSE_LANDMARKS = Object.freeze([
  { x: 0.50, y: 0.20, z: 0.00 }, // 0: Nose
  { x: 0.52, y: 0.18, z: 0.00 }, // 1: Left eye inner
  { x: 0.53, y: 0.18, z: 0.00 }, // 2: Left eye
  { x: 0.55, y: 0.18, z: 0.00 }, // 3: Left eye outer
  { x: 0.48, y: 0.18, z: 0.00 }, // 4: Right eye inner
  { x: 0.47, y: 0.18, z: 0.00 }, // 5: Right eye
  { x: 0.45, y: 0.18, z: 0.00 }, // 6: Right eye outer
  { x: 0.58, y: 0.22, z: 0.00 }, // 7: Left ear
  { x: 0.42, y: 0.22, z: 0.00 }, // 8: Right ear
  { x: 0.52, y: 0.25, z: 0.00 }, // 9: Mouth left
  { x: 0.48, y: 0.25, z: 0.00 }, // 10: Mouth right
  { x: 0.62, y: 0.38, z: 0.00 }, // 11: Left shoulder (mirrored view)
  { x: 0.38, y: 0.38, z: 0.00 }, // 12: Right shoulder
  { x: 0.68, y: 0.52, z: 0.00 }, // 13: Left elbow
  { x: 0.32, y: 0.52, z: 0.00 }, // 14: Right elbow
  { x: 0.58, y: 0.62, z: 0.00 }, // 15: Left wrist
  { x: 0.42, y: 0.62, z: 0.00 }  // 16: Right wrist
]);

/**
 * Creates 21-joint hand coordinates with specified wrist position and finger offsets.
 */
function createHandSkeleton({ wristX, wristY, wristZ = 0, isRight = true, fingerPose = 'open', scale = 0.08 }) {
  const dir = isRight ? 1 : -1;
  const pts = [];

  // 0: Wrist
  pts[0] = { x: wristX, y: wristY, z: wristZ };

  // Helper to add finger points: [mcp, pip, dip, tip]
  const addFinger = (baseX, baseY, angleRad, lengths, isCurled = false) => {
    let curX = wristX + baseX;
    let curY = wristY + baseY;
    const res = [];
    let curAngle = angleRad;

    for (let i = 0; i < lengths.length; i++) {
      if (isCurled && i >= 1) {
        curAngle += (isRight ? 0.7 : -0.7); // curl inward
      }
      curX += Math.cos(curAngle) * lengths[i] * scale;
      curY += Math.sin(curAngle) * lengths[i] * scale;
      res.push({ x: curX, y: curY, z: wristZ + (isCurled ? 0.02 * i : 0) });
    }
    return res;
  };

  // Finger configs based on pose
  const isFist = fingerPose === 'fist';
  const isThumbsUp = fingerPose === 'thumbs_up';
  const isThumbsDown = fingerPose === 'thumbs_down';
  const isPointing = fingerPose === 'point_up' || fingerPose === 'point_forward' || fingerPose === 'point_chest';
  const isPeace = fingerPose === 'peace';
  const isPhone = fingerPose === 'phone';
  const isCupped = fingerPose === 'cupped';
  const isPinched = fingerPose === 'pinched';

  // 1-4: Thumb
  let thumbCurl = isFist && !isThumbsUp && !isThumbsDown && !isPhone;
  let thumbAngle = isThumbsUp ? -Math.PI / 2 : (isThumbsDown ? Math.PI / 2 : (isRight ? -Math.PI / 3 : -2 * Math.PI / 3));
  if (isRight) {
    thumbAngle = isThumbsUp ? -Math.PI / 2 : (isThumbsDown ? Math.PI / 2 : -Math.PI * 0.4);
  } else {
    thumbAngle = isThumbsUp ? -Math.PI / 2 : (isThumbsDown ? Math.PI / 2 : -Math.PI * 0.6);
  }
  const thumbPts = addFinger(dir * 0.015, -0.01, thumbAngle, [0.35, 0.30, 0.30, 0.35], thumbCurl);
  pts[1] = thumbPts[0];
  pts[2] = thumbPts[1];
  pts[3] = thumbPts[2];
  pts[4] = thumbPts[3];

  // 5-8: Index
  const indexCurl = isFist || isThumbsUp || isThumbsDown || (isPhone);
  const indexAngle = -Math.PI / 2 + dir * 0.05;
  const indexPts = addFinger(dir * 0.01, -0.035, indexAngle, [0.45, 0.35, 0.28, 0.28], indexCurl);
  pts[5] = indexPts[0];
  pts[6] = indexPts[1];
  pts[7] = indexPts[2];
  pts[8] = indexPts[3];

  // 9-12: Middle
  const middleCurl = isFist || isThumbsUp || isThumbsDown || isPointing || isPhone;
  const middleAngle = -Math.PI / 2;
  const middlePts = addFinger(0, -0.04, middleAngle, [0.48, 0.38, 0.30, 0.30], middleCurl);
  pts[9] = middlePts[0];
  pts[10] = middlePts[1];
  pts[11] = middlePts[2];
  pts[12] = middlePts[3];

  // 13-16: Ring
  const ringCurl = isFist || isThumbsUp || isThumbsDown || isPointing || isPeace || isPhone || isPinched;
  const ringAngle = -Math.PI / 2 - dir * 0.05;
  const ringPts = addFinger(-dir * 0.01, -0.035, ringAngle, [0.42, 0.34, 0.28, 0.28], ringCurl);
  pts[13] = ringPts[0];
  pts[14] = ringPts[1];
  pts[15] = ringPts[2];
  pts[16] = ringPts[3];

  // 17-20: Pinky
  const pinkyCurl = isFist || isThumbsUp || isThumbsDown || isPointing || isPeace || isPinched;
  const pinkyAngle = -Math.PI / 2 - dir * 0.12;
  const pinkyPts = addFinger(-dir * 0.02, -0.028, pinkyAngle, [0.36, 0.28, 0.24, 0.24], pinkyCurl);
  pts[17] = pinkyPts[0];
  pts[18] = pinkyPts[1];
  pts[19] = pinkyPts[2];
  pts[20] = pinkyPts[3];

  return pts;
}

/**
 * Full ISL Target Library with realistic landmark blueprints and evaluators.
 */
export const ISL_LEARN_ITEMS = Object.freeze([
  // =========================================================================
  // 1. CORE CONVERSATIONAL SIGNS
  // =========================================================================
  {
    id: 'namaste',
    label: 'NAMASTE',
    name: 'Namaste',
    category: 'greetings',
    type: 'word',
    english: 'Hello / Greetings / Welcome',
    image: '/signs/namaste.jpg',
    description: 'Press both flat palms together in front of your chest in the traditional prayer gesture, with all fingers pointing straight up.',
    tip: 'Keep both wrists close (< 16cm) at mid-chest level and fingers vertical.',
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.58, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      leftWrist: { x: 0.46, y: 0.58 },
      rightWrist: { x: 0.54, y: 0.58 },
      maxWristDist: 0.16,
      maxPalmDist: 0.14,
      requiredFingers: 'Both palms flat, fingers pointing up',
      zone: 'Chest center (Y: 0.45 - 0.70)'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;

      const checklist = [];
      let score = 0;

      // Rule 1: Both hands visible
      const bothHands = Boolean(left && right);
      checklist.push({
        id: 'both_hands',
        label: 'Both hands in camera view',
        status: bothHands ? 'pass' : 'fail',
        current: bothHands ? '2 hands detected' : (left || right ? 'Only 1 hand' : 'No hands'),
        target: '2 hands',
        hint: 'Raise both hands in front of the camera.'
      });
      if (bothHands) score += 25;

      if (!bothHands) {
        return {
          matchScore: score,
          isMatched: false,
          checklist,
          primaryGuidance: 'Please bring both hands into view in front of your chest.'
        };
      }

      // Rule 2: Wrists close together
      const dWrists = dist3D(left.wrist, right.wrist);
      const wristsClose = dWrists < 0.18;
      checklist.push({
        id: 'wrists_close',
        label: 'Hands brought together',
        status: wristsClose ? 'pass' : (dWrists < 0.28 ? 'warn' : 'fail'),
        current: `${Math.round(dWrists * 100)} cm apart`,
        target: '< 18 cm',
        hint: 'Bring your palms closer together.'
      });
      if (wristsClose) score += 25;
      else if (dWrists < 0.28) score += 12;

      // Rule 3: Fingers pointing up
      const fingersUpL = left.points[12].y < left.wrist.y - 0.07;
      const fingersUpR = right.points[12].y < right.wrist.y - 0.07;
      const fingersUp = fingersUpL && fingersUpR;
      checklist.push({
        id: 'fingers_up',
        label: 'Fingers pointing upward',
        status: fingersUp ? 'pass' : 'fail',
        current: fingersUp ? 'Vertical (✔)' : 'Tilted down or sideways',
        target: 'Vertical tips',
        hint: 'Point your fingertips straight up towards your chin.'
      });
      if (fingersUp) score += 25;

      // Rule 4: Located at chest level
      const chestZone = left.wrist.y > 0.40 && left.wrist.y < 0.75;
      checklist.push({
        id: 'chest_zone',
        label: 'Positioned at chest level',
        status: chestZone ? 'pass' : 'fail',
        current: left.wrist.y < 0.40 ? 'Too high' : (left.wrist.y > 0.75 ? 'Too low' : 'Chest height (✔)'),
        target: 'Center chest',
        hint: 'Hold your hands at mid-chest height.'
      });
      if (chestZone) score += 25;

      const isMatched = score >= 75;
      let primaryGuidance = 'Posture aligned! Hold still for recognition.';
      if (!wristsClose) primaryGuidance = 'Bring both palms together at the center.';
      else if (!fingersUp) primaryGuidance = 'Point your fingers straight up.';
      else if (!chestZone) primaryGuidance = 'Raise hands up to chest level.';

      return { matchScore: score, isMatched, checklist, primaryGuidance };
    }
  },

  {
    id: 'hello',
    label: 'HELLO',
    name: 'Hello',
    category: 'greetings',
    type: 'word',
    english: 'Hello / Hi',
    image: '/signs/hello.jpg',
    description: 'Raise your dominant open flat hand near your forehead or temple and wave gently outward.',
    tip: 'Wrist should be raised higher than your shoulder level with fingers open.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.64, wristY: 0.30, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.64, y: 0.30 },
      requiredFingers: 'Open palm (4–5 fingers extended)',
      zone: 'Near temple / forehead (Y < Shoulder)'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const nose = pose?.[0] || { x: 0.5, y: 0.22 };
      const shoulderY = pose?.[11]?.y || 0.40;

      const active = right || left;
      const checklist = [];
      let score = 0;

      // Rule 1: Hand detected
      checklist.push({
        id: 'hand_detected',
        label: 'Hand visible in frame',
        status: active ? 'pass' : 'fail',
        current: active ? 'Hand detected' : 'No hand visible',
        target: '1 hand',
        hint: 'Raise your dominant hand.'
      });
      if (active) score += 25;

      if (!active) {
        return { matchScore: 0, isMatched: false, checklist, primaryGuidance: 'Raise your hand in front of the camera.' };
      }

      // Rule 2: Raised above shoulder
      const isRaised = active.wrist.y < shoulderY + 0.05;
      checklist.push({
        id: 'hand_raised',
        label: 'Hand raised near head level',
        status: isRaised ? 'pass' : 'fail',
        current: isRaised ? 'Near head (✔)' : 'Too low (below shoulder)',
        target: 'Above shoulder',
        hint: 'Raise your hand higher, near your ear or temple.'
      });
      if (isRaised) score += 30;

      // Rule 3: Open palm
      const isOpen = active.isOpenPalm || active.extendedCount >= 4;
      checklist.push({
        id: 'open_palm',
        label: 'Open flat palm',
        status: isOpen ? 'pass' : 'fail',
        current: `${active.extendedCount} fingers extended`,
        target: '4-5 extended',
        hint: 'Open your hand flat with fingers spread.'
      });
      if (isOpen) score += 25;

      // Rule 4: Near head
      const dHead = dist2D(active.wrist, nose);
      const nearHead = dHead < 0.35;
      checklist.push({
        id: 'near_head',
        label: 'Positioned beside temple',
        status: nearHead ? 'pass' : 'warn',
        current: nearHead ? 'Good position (✔)' : 'Move closer to face',
        target: '< 35 cm from nose',
        hint: 'Keep your hand near your temple.'
      });
      if (nearHead) score += 20;

      const isMatched = score >= 75;
      let primaryGuidance = 'Great hello posture! Wave slightly.';
      if (!isRaised) primaryGuidance = 'Raise your hand higher near temple height.';
      else if (!isOpen) primaryGuidance = 'Open your palm fully.';

      return { matchScore: score, isMatched, checklist, primaryGuidance };
    }
  },

  {
    id: 'good',
    label: 'GOOD',
    name: 'Good / Fine',
    category: 'feelings_states',
    type: 'word',
    english: 'Good / Well / Okay',
    image: '/signs/good.jpg',
    description: 'Give a decisive thumbs-up gesture in front of your chest with fingers tightly curled.',
    tip: 'Thumb points straight up, other 4 fingers curled into a fist in the chest zone.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.55, isRight: true, fingerPose: 'thumbs_up' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.54, y: 0.55 },
      requiredFingers: 'Thumb pointing UP, 4 fingers curled',
      zone: 'Chest level'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const h = right || left;

      const checklist = [];
      let score = 0;

      checklist.push({
        id: 'hand_detected',
        label: 'Hand visible in frame',
        status: h ? 'pass' : 'fail',
        current: h ? 'Hand detected' : 'No hand visible',
        target: '1 hand',
        hint: 'Raise your hand in front of your chest.'
      });
      if (h) score += 20;
      if (!h) return { matchScore: 0, isMatched: false, checklist, primaryGuidance: 'Hold your hand in front of chest.' };

      // Rule 2: Thumb extended
      const thumbExt = h.thumb.isExtended;
      checklist.push({
        id: 'thumb_extended',
        label: 'Thumb extended outward',
        status: thumbExt ? 'pass' : 'fail',
        current: thumbExt ? 'Extended (✔)' : 'Tucked in',
        target: 'Extended',
        hint: 'Stick your thumb out.'
      });
      if (thumbExt) score += 30;

      // Rule 3: Thumb pointing UP
      const thumbUp = h.points[4].y < h.points[2].y - 0.03;
      checklist.push({
        id: 'thumb_up',
        label: 'Thumb pointing upward',
        status: thumbUp ? 'pass' : 'fail',
        current: thumbUp ? 'Pointing up (✔)' : 'Sideways or down',
        target: 'Vertical UP',
        hint: 'Point your thumb straight up.'
      });
      if (thumbUp) score += 25;

      // Rule 4: Other fingers curled (fist)
      const fingersCurled = h.curledCount >= 3;
      checklist.push({
        id: 'fingers_curled',
        label: 'Other 4 fingers curled into fist',
        status: fingersCurled ? 'pass' : 'warn',
        current: `${h.curledCount} fingers curled`,
        target: '>= 3 curled',
        hint: 'Curl your index, middle, ring, and pinky into a fist.'
      });
      if (fingersCurled) score += 25;

      const isMatched = score >= 75;
      let primaryGuidance = 'Solid thumbs-up! Hold steady.';
      if (!thumbExt || !thumbUp) primaryGuidance = 'Extend your thumb straight upward.';
      else if (!fingersCurled) primaryGuidance = 'Tuck the other four fingers into your palm.';

      return { matchScore: score, isMatched, checklist, primaryGuidance };
    }
  },

  {
    id: 'thank_you',
    label: 'THANK YOU',
    name: 'Thank You',
    category: 'greetings',
    type: 'word',
    english: 'Thank You / Gratitude',
    image: '/signs/thank_you.jpg',
    description: 'Touch the tips of your dominant flat hand to your chin, then extend your hand forward toward the person.',
    tip: 'Start with fingertips touching chin, palm facing inward.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.50, wristY: 0.40, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.50, y: 0.40 },
      requiredFingers: 'Flat open palm at chin',
      zone: 'Chin / Lower face zone'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const nose = pose?.[0] || { x: 0.5, y: 0.22 };
      const chinY = nose.y + 0.08;
      const h = right || left;

      const checklist = [];
      let score = 0;

      if (!h) {
        return {
          matchScore: 0,
          isMatched: false,
          checklist: [{ id: 'hand', label: 'Hand in view', status: 'fail', current: 'None', target: '1 hand', hint: 'Raise hand.' }],
          primaryGuidance: 'Raise your dominant hand to your chin.'
        };
      }
      score += 25;
      checklist.push({ id: 'hand', label: 'Hand detected', status: 'pass', current: 'Detected (✔)', target: '1 hand', hint: '' });

      // Near chin
      const dChin = dist2D(h.points[12], { x: nose.x, y: chinY });
      const nearChin = dChin < 0.20;
      checklist.push({
        id: 'near_chin',
        label: 'Fingertips at chin level',
        status: nearChin ? 'pass' : 'fail',
        current: `${Math.round(dChin * 100)} cm from chin`,
        target: '< 20 cm',
        hint: 'Bring your fingertips to your chin.'
      });
      if (nearChin) score += 35;

      // Open hand
      const isOpen = h.isOpenPalm || h.extendedCount >= 3;
      checklist.push({
        id: 'flat_hand',
        label: 'Hand flat with fingers straight',
        status: isOpen ? 'pass' : 'warn',
        current: `${h.extendedCount} extended`,
        target: '>= 3 extended',
        hint: 'Keep your hand flat.'
      });
      if (isOpen) score += 25;

      // Wrist below chin
      const wristBelow = h.wrist.y > chinY - 0.02;
      checklist.push({
        id: 'wrist_below',
        label: 'Wrist below chin',
        status: wristBelow ? 'pass' : 'fail',
        current: wristBelow ? 'Good height (✔)' : 'Too high',
        target: 'Wrist below chin',
        hint: 'Rest fingertips on chin, wrist lower.'
      });
      if (wristBelow) score += 15;

      const isMatched = score >= 75;
      let primaryGuidance = 'Touch fingertips to chin and gesture forward.';
      if (!nearChin) primaryGuidance = 'Bring your fingertips up to your chin.';

      return { matchScore: score, isMatched, checklist, primaryGuidance };
    }
  },

  {
    id: 'help',
    label: 'HELP',
    name: 'Help / Assist',
    category: 'healthcare',
    type: 'word',
    english: 'Help / Need Assistance',
    image: '/signs/help.jpg',
    description: 'Place your dominant closed fist on top of your flat non-dominant palm in front of your chest and lift upward.',
    tip: 'One hand forms a flat platform (palm up), other hand sits on it as a fist.',
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.44, wristY: 0.62, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.48, wristY: 0.54, isRight: true, fingerPose: 'fist' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      leftHand: 'Flat palm platform facing upward',
      rightHand: 'Closed fist resting on top of palm',
      wristDistance: '< 16 cm apart',
      zone: 'Mid-chest height'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);

      const checklist = [];
      let score = 0;

      const both = Boolean(left && right);
      checklist.push({
        id: 'both_hands',
        label: 'Both hands active',
        status: both ? 'pass' : 'fail',
        current: both ? '2 hands visible' : 'Need both hands',
        target: '2 hands',
        hint: 'Use both hands in front of chest.'
      });
      if (both) score += 25;
      if (!both) return { matchScore: score, isMatched: false, checklist, primaryGuidance: 'Place one fist on your other flat palm.' };

      // One fist, one palm
      const hasFist = left.isFist || right.isFist;
      const hasPalm = left.isOpenPalm || right.isOpenPalm;
      checklist.push({
        id: 'fist_and_palm',
        label: 'One fist + one flat palm',
        status: (hasFist && hasPalm) ? 'pass' : 'warn',
        current: hasFist && hasPalm ? 'Fist on Palm (✔)' : 'Check hand shapes',
        target: '1 Fist + 1 Palm',
        hint: 'Close one hand into a fist, open the other flat.'
      });
      if (hasFist && hasPalm) score += 35;
      else if (hasFist || hasPalm) score += 15;

      // Hands touching / stacked
      const dWrists = dist3D(left.wrist, right.wrist);
      const isStacked = dWrists < 0.22;
      checklist.push({
        id: 'hands_stacked',
        label: 'Hands resting together',
        status: isStacked ? 'pass' : 'fail',
        current: `${Math.round(dWrists * 100)} cm apart`,
        target: '< 22 cm',
        hint: 'Rest the fist directly onto the flat palm.'
      });
      if (isStacked) score += 40;

      const isMatched = score >= 75;
      let primaryGuidance = 'Fist on palm detected! Great Help sign.';
      if (!isStacked) primaryGuidance = 'Rest the fist right on top of the open palm.';

      return { matchScore: score, isMatched, checklist, primaryGuidance };
    }
  },

  {
    id: 'stop',
    label: 'STOP',
    name: 'Stop / Wait',
    category: 'actions',
    type: 'word',
    english: 'Stop / Halt',
    image: '/signs/stop.jpg',
    description: 'Push your dominant open palm outward towards the camera with all five fingers straight up.',
    tip: 'Hand facing outward firmly at chest height.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.50, wristY: 0.52, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.50, y: 0.52 },
      requiredFingers: '5 fingers extended straight up',
      zone: 'Directly in front of chest'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Hold your open palm forward.' };

      checklist.push({ id: 'hand', label: 'Hand detected', status: 'pass', current: 'Detected (✔)', target: '1 hand', hint: '' });
      score += 20;

      // Open palm 5 fingers
      const allFive = h.extendedCount >= 4;
      checklist.push({
        id: 'all_five',
        label: 'All fingers open & extended',
        status: allFive ? 'pass' : 'fail',
        current: `${h.extendedCount} fingers extended`,
        target: '5 fingers',
        hint: 'Spread all five fingers wide.'
      });
      if (allFive) score += 35;

      // Fingers vertical
      const vertical = h.points[12].y < h.wrist.y - 0.10;
      checklist.push({
        id: 'vertical',
        label: 'Fingers pointing straight up',
        status: vertical ? 'pass' : 'warn',
        current: vertical ? 'Vertical (✔)' : 'Angle fingers upward',
        target: 'Pointing up',
        hint: 'Point your fingers toward ceiling.'
      });
      if (vertical) score += 25;

      // Chest zone
      const chestZone = h.wrist.y > 0.35 && h.wrist.y < 0.78;
      checklist.push({
        id: 'chest_zone',
        label: 'Centered in front of body',
        status: chestZone ? 'pass' : 'fail',
        current: chestZone ? 'Good height (✔)' : 'Adjust height',
        target: 'Chest height',
        hint: 'Hold palm in front of chest.'
      });
      if (chestZone) score += 20;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Clear Stop sign!' : 'Push open palm outward toward camera.' };
    }
  },

  {
    id: 'time',
    label: 'TIME',
    name: 'Time / Clock',
    category: 'time_calendar',
    type: 'word',
    english: 'Time / Clock',
    image: '/signs/time.jpg',
    description: 'Use the index finger of your dominant hand to repeatedly tap the wrist of your non-dominant hand (tapping the wrist twice).',
    tip: 'Keep your non-dominant wrist relaxed in front of you while tapping it with index finger.',
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.44, wristY: 0.60, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.48, wristY: 0.58, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      leftWrist: 'Watch hand at mid-torso',
      rightHand: 'Dominant index pointing at left wrist',
      tapDistance: '< 14 cm from index tip to wrist',
      zone: 'Lower chest / abdomen'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);

      const checklist = [];
      let score = 0;
      const both = Boolean(left && right);
      checklist.push({ id: 'both', label: 'Both hands in view', status: both ? 'pass' : 'fail', current: both ? '2 hands' : 'Need 2 hands', target: '2 hands', hint: '' });
      if (both) score += 25;
      if (!both) return { matchScore: score, isMatched: false, checklist, primaryGuidance: 'Tap your wrist with your other index finger.' };

      // Tap detection: left index to right wrist OR right index to left wrist
      const dLtoR = left.index.isExtended && dist3D(left.points[8], right.wrist);
      const dRtoL = right.index.isExtended && dist3D(right.points[8], left.wrist);
      const minDist = Math.min(dLtoR, dRtoL);
      const isTapping = minDist < 0.16;

      checklist.push({
        id: 'tapping_wrist',
        label: 'Index finger tapping wrist',
        status: isTapping ? 'pass' : (minDist < 0.25 ? 'warn' : 'fail'),
        current: `${Math.round(minDist * 100)} cm to wrist`,
        target: '< 16 cm',
        hint: 'Touch your index finger directly to your opposite wrist.'
      });
      if (isTapping) score += 50;
      else if (minDist < 0.25) score += 25;

      const hasIndex = left.index.isExtended || right.index.isExtended;
      checklist.push({
        id: 'index_extended',
        label: 'Index finger extended',
        status: hasIndex ? 'pass' : 'fail',
        current: hasIndex ? 'Extended (✔)' : 'Fist / curled',
        target: 'Point index',
        hint: 'Extend your index finger to tap.'
      });
      if (hasIndex) score += 25;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Watch tap detected!' : 'Tap your wrist watch point with your index finger.' };
    }
  },

  {
    id: 'call',
    label: 'CALL',
    name: 'Call / Phone',
    category: 'transit',
    type: 'word',
    english: 'Call / Phone / Ring',
    image: '/signs/call.jpg',
    description: 'Form the phone shape (extend your thumb and pinky, curl other three fingers) and hold it beside your ear.',
    tip: 'Y-handshape: Thumb near ear, pinky pointing toward mouth.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.65, wristY: 0.32, isRight: true, fingerPose: 'phone' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      handshape: 'Y-Hand (Thumb + Pinky extended)',
      position: 'Beside ear (Y < Shoulder level)',
      zone: 'Ear / Temple'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const shoulderY = pose?.[11]?.y || 0.40;
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Form phone hand and hold near ear.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected (✔)', target: '1 hand', hint: '' });
      score += 20;

      // Thumb & Pinky extended
      const thumbPinky = h.thumb.isExtended && h.pinky.isExtended;
      checklist.push({
        id: 'thumb_pinky',
        label: 'Thumb and Pinky extended (Phone shape)',
        status: thumbPinky ? 'pass' : 'fail',
        current: thumbPinky ? 'Y-Shape (✔)' : 'Extend thumb & pinky',
        target: 'Thumb + Pinky',
        hint: 'Stick thumb and pinky out, curl middle 3 fingers.'
      });
      if (thumbPinky) score += 35;

      // Middle 3 curled
      const middleCurled = h.middle.isCurled && h.ring.isCurled;
      checklist.push({
        id: 'middle_curled',
        label: 'Index, Middle, Ring curled',
        status: middleCurled ? 'pass' : 'warn',
        current: middleCurled ? 'Curled (✔)' : 'Curl them in',
        target: 'Curled fingers',
        hint: 'Curl middle fingers tightly into palm.'
      });
      if (middleCurled) score += 20;

      // Near ear / head
      const nearEar = h.wrist.y < shoulderY;
      checklist.push({
        id: 'near_ear',
        label: 'Held near ear height',
        status: nearEar ? 'pass' : 'fail',
        current: nearEar ? 'Ear level (✔)' : 'Raise higher',
        target: 'Above shoulder',
        hint: 'Hold your hand up by your ear like a phone.'
      });
      if (nearEar) score += 25;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Phone call sign confirmed!' : 'Hold Y-hand up to your ear.' };
    }
  },

  {
    id: 'love',
    label: 'LOVE',
    name: 'Love / ILY',
    category: 'feelings_states',
    type: 'word',
    english: 'Love / I Love You',
    image: '/signs/love.jpg',
    description: 'Extend your thumb, index finger, and pinky finger simultaneously while keeping middle and ring fingers folded flat.',
    tip: 'Iconic "I Love You" handshape in front of chest.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.52, wristY: 0.54, isRight: true, fingerPose: 'phone' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      handshape: 'Thumb + Index + Pinky extended',
      foldedFingers: 'Middle + Ring folded',
      zone: 'Chest center'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Make ILY sign at chest level.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const ily = h.thumb.isExtended && h.index.isExtended && h.pinky.isExtended;
      checklist.push({
        id: 'three_fingers',
        label: 'Thumb, Index & Pinky extended',
        status: ily ? 'pass' : 'fail',
        current: ily ? 'ILY fingers (✔)' : 'Extend Thumb, Index, Pinky',
        target: '3 fingers up',
        hint: 'Extend your thumb, index, and pinky finger.'
      });
      if (ily) score += 45;

      const twoFolded = h.middle.isCurled && h.ring.isCurled;
      checklist.push({
        id: 'two_folded',
        label: 'Middle & Ring fingers folded',
        status: twoFolded ? 'pass' : 'warn',
        current: twoFolded ? 'Folded (✔)' : 'Fold middle & ring',
        target: '2 fingers curled',
        hint: 'Tuck your middle and ring fingers down.'
      });
      if (twoFolded) score += 35;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'ILY sign confirmed!' : 'Extend thumb, index, and pinky together.' };
    }
  },

  {
    id: 'yes',
    label: 'YES',
    name: 'Yes / Agree',
    category: 'feelings_states',
    type: 'word',
    english: 'Yes / Agree / Correct',
    image: '/signs/yes.jpg',
    description: 'Hold a firm closed fist in front of your chest and nod it up and down like a nodding head.',
    tip: 'Closed fist at mid-chest, knuckles facing forward.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.52, wristY: 0.56, isRight: true, fingerPose: 'fist' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      handshape: 'Closed fist (all fingers curled)',
      wristTarget: { x: 0.52, y: 0.56 },
      zone: 'Mid-chest height'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Hold a fist in front of chest.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const isFist = h.isFist || h.curledCount >= 3;
      checklist.push({
        id: 'fist',
        label: 'Closed solid fist',
        status: isFist ? 'pass' : 'fail',
        current: isFist ? 'Fist formed (✔)' : 'Close your hand',
        target: 'Fist',
        hint: 'Close all fingers tightly into a fist.'
      });
      if (isFist) score += 45;

      const inChest = h.wrist.y > 0.40 && h.wrist.y < 0.75;
      checklist.push({
        id: 'chest',
        label: 'Held in front of chest',
        status: inChest ? 'pass' : 'fail',
        current: inChest ? 'Chest level (✔)' : 'Adjust height',
        target: 'Chest height',
        hint: 'Position your fist in front of your chest.'
      });
      if (inChest) score += 35;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Yes sign recognized!' : 'Hold a closed fist in front of your chest.' };
    }
  },

  {
    id: 'no',
    label: 'NO',
    name: 'No / Disagree',
    category: 'feelings_states',
    type: 'word',
    english: 'No / Disagree / Reject',
    image: '/signs/no.jpg',
    description: 'Extend your index and middle fingers and snap them down firmly onto your thumb tip.',
    tip: 'Fingers snap together like a closing beak.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.52, wristY: 0.54, isRight: true, fingerPose: 'pinched' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      action: 'Index & Middle snap down to thumb tip',
      ringPinky: 'Ring and Pinky curled in',
      zone: 'Chest level'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Snap index and middle onto thumb.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const dThumbIndex = dist3D(h.points[4], h.points[8]);
      const dThumbMiddle = dist3D(h.points[4], h.points[12]);
      const touching = dThumbIndex < 0.10 && dThumbMiddle < 0.12;
      checklist.push({
        id: 'snap',
        label: 'Index & Middle touching Thumb tip',
        status: touching ? 'pass' : 'fail',
        current: touching ? 'Touching (✔)' : 'Bring tips together',
        target: '< 10 cm apart',
        hint: 'Touch index and middle fingertips to thumb.'
      });
      if (touching) score += 50;

      const othersCurled = h.ring.isCurled && h.pinky.isCurled;
      checklist.push({
        id: 'others_curled',
        label: 'Ring and Pinky tucked away',
        status: othersCurled ? 'pass' : 'warn',
        current: othersCurled ? 'Tucked (✔)' : 'Tuck them in',
        target: 'Curled in',
        hint: 'Keep ring and pinky fingers folded.'
      });
      if (othersCurled) score += 30;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'No sign confirmed!' : 'Bring index and middle tips down to touch thumb.' };
    }
  },

  {
    id: 'bad',
    label: 'BAD',
    name: 'Bad / Unwell',
    category: 'feelings_states',
    type: 'word',
    english: 'Bad / Not Good / Poor',
    image: '/signs/bad.jpg',
    description: 'Give a decisive thumbs-down gesture in front of your chest with fingers tightly curled.',
    tip: 'Thumb points straight down towards the floor, 4 other fingers curled into a fist.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.52, isRight: true, fingerPose: 'thumbs_down' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.54, y: 0.52 },
      requiredFingers: 'Thumb pointing DOWN, 4 fingers curled',
      zone: 'Chest / Torso level'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Hold a thumbs-down in front of chest.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const thumbExt = h.thumb.isExtended;
      checklist.push({
        id: 'thumb_ext',
        label: 'Thumb extended outward',
        status: thumbExt ? 'pass' : 'fail',
        current: thumbExt ? 'Extended (✔)' : 'Tucked in',
        target: 'Extended',
        hint: 'Stick thumb outward.'
      });
      if (thumbExt) score += 30;

      const thumbDown = h.points[4].y > h.points[2].y + 0.03;
      checklist.push({
        id: 'thumb_down',
        label: 'Thumb pointing downward',
        status: thumbDown ? 'pass' : 'fail',
        current: thumbDown ? 'Pointing down (✔)' : 'Sideways or up',
        target: 'Vertical DOWN',
        hint: 'Point your thumb straight down.'
      });
      if (thumbDown) score += 25;

      const curled = h.curledCount >= 3;
      checklist.push({
        id: 'fingers_curled',
        label: 'Fingers curled into fist',
        status: curled ? 'pass' : 'warn',
        current: `${h.curledCount} curled`,
        target: '>= 3 curled',
        hint: 'Curl 4 fingers into palm.'
      });
      if (curled) score += 25;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Bad sign confirmed!' : 'Point thumb down with other fingers curled.' };
    }
  },

  {
    id: 'eat',
    label: 'EAT',
    name: 'Eat / Food',
    category: 'daily_life',
    type: 'word',
    english: 'Eat / Food / Meal',
    image: '/signs/eat.jpg',
    description: 'Bring pinched fingertips repeatedly towards your mouth and lips as if eating food.',
    tip: 'Thumb, index, and middle tips pinched together and positioned right in front of lips.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.50, wristY: 0.36, isRight: true, fingerPose: 'pinched' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.50, y: 0.36 },
      requiredFingers: 'Pinched thumb and fingertips',
      zone: 'Directly in front of mouth / lips'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const nose = pose?.[0] || { x: 0.5, y: 0.22 };
      const mouthY = nose.y + 0.05;
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Bring pinched fingers to mouth.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 25;

      const dPinched = dist3D(h.points[4], h.points[8]) + dist3D(h.points[4], h.points[12]);
      const isPinched = dPinched < 0.16;
      checklist.push({
        id: 'pinched',
        label: 'Fingertips pinched to thumb',
        status: isPinched ? 'pass' : 'fail',
        current: isPinched ? 'Pinched (✔)' : 'Open fingers',
        target: 'Pinch tips',
        hint: 'Touch fingertips to thumb pad.'
      });
      if (isPinched) score += 40;

      const nearMouth = dist2D(h.points[8], { x: nose.x, y: mouthY }) < 0.15;
      checklist.push({
        id: 'near_mouth',
        label: 'Hand placed at mouth/lips',
        status: nearMouth ? 'pass' : 'fail',
        current: nearMouth ? 'At mouth (✔)' : 'Move closer to mouth',
        target: '< 15 cm from lips',
        hint: 'Bring your pinched hand right to your mouth.'
      });
      if (nearMouth) score += 35;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Eat sign recognized!' : 'Bring pinched fingertips to your mouth.' };
    }
  },

  {
    id: 'drink',
    label: 'DRINK',
    name: 'Drink / Water',
    category: 'daily_life',
    type: 'word',
    english: 'Drink / Water / Beverage',
    image: '/signs/drink.jpg',
    description: 'Form a C-handshape (holding a small cup) and tilt it upwards directly at your mouth.',
    tip: 'Cupped hand with thumb tilted back, tilted upwards right in front of mouth.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.50, wristY: 0.35, isRight: true, fingerPose: 'cupped' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.50, y: 0.35 },
      requiredFingers: 'Cupped C-shape (holding glass)',
      zone: 'Mouth level, tilted upward'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const nose = pose?.[0] || { x: 0.5, y: 0.22 };
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Hold a cupped hand at your mouth.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const dThumbIndex = dist3D(h.points[4], h.points[8]);
      const isCupped = dThumbIndex > 0.04 && dThumbIndex < 0.18 && !h.isOpenPalm && !h.isFist;
      checklist.push({
        id: 'cupped',
        label: 'C-handshape (holding cup)',
        status: isCupped ? 'pass' : 'fail',
        current: isCupped ? 'Cupped C-shape (✔)' : 'Curv fingers like a cup',
        target: 'C-shape',
        hint: 'Curve fingers and thumb as if holding a small cup.'
      });
      if (isCupped) score += 35;

      const nearMouth = dist2D(h.points[8], nose) < 0.18;
      checklist.push({
        id: 'mouth',
        label: 'Positioned at mouth',
        status: nearMouth ? 'pass' : 'fail',
        current: nearMouth ? 'At mouth (✔)' : 'Bring to mouth',
        target: 'Near lips',
        hint: 'Bring hand up to mouth level.'
      });
      if (nearMouth) score += 25;

      const isTiltedUp = h.wrist.y > h.points[4].y + 0.02;
      checklist.push({
        id: 'tilt',
        label: 'Tilted upward towards mouth',
        status: isTiltedUp ? 'pass' : 'warn',
        current: isTiltedUp ? 'Tilted (✔)' : 'Tilt up',
        target: 'Tilted cup',
        hint: 'Tilt your hand upward as if taking a drink.'
      });
      if (isTiltedUp) score += 20;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Drink sign recognized!' : 'Hold a cupped C-hand at mouth and tilt up.' };
    }
  },

  {
    id: 'you',
    label: 'YOU',
    name: 'You',
    category: 'actions',
    type: 'word',
    english: 'You / Yourself',
    image: '/signs/you.jpg',
    description: 'Point your dominant index finger directly forward toward your conversation partner.',
    tip: 'Index finger extended forward, other 3 fingers curled into palm.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.52, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.54, y: 0.52 },
      requiredFingers: 'Index pointing straight ahead, others curled',
      zone: 'Mid-chest pointing forward'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Point index finger forward.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const idxExt = h.index.isExtended;
      checklist.push({
        id: 'index_ext',
        label: 'Index finger extended',
        status: idxExt ? 'pass' : 'fail',
        current: idxExt ? 'Extended (✔)' : 'Extend index',
        target: 'Extended index',
        hint: 'Point your index finger out.'
      });
      if (idxExt) score += 35;

      const curled = h.curledCount >= 2;
      checklist.push({
        id: 'curled',
        label: 'Other fingers folded',
        status: curled ? 'pass' : 'warn',
        current: `${h.curledCount} curled`,
        target: 'Folded',
        hint: 'Fold middle, ring, and pinky into palm.'
      });
      if (curled) score += 25;

      const pointingFwd = (h.points[8].z || 0) < (h.wrist.z || 0) - 0.02 || (h.points[8].y > h.wrist.y - 0.15);
      checklist.push({
        id: 'pointing_fwd',
        label: 'Pointing forward at partner',
        status: pointingFwd ? 'pass' : 'warn',
        current: pointingFwd ? 'Forward (✔)' : 'Aim forward',
        target: 'Forward',
        hint: 'Aim your index finger forward.'
      });
      if (pointingFwd) score += 20;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'You sign recognized!' : 'Point index finger forward at conversation partner.' };
    }
  },

  {
    id: 'me',
    label: 'ME',
    name: 'Me / I',
    category: 'actions',
    type: 'word',
    english: 'Me / I / Myself',
    image: '/signs/me.jpg',
    description: 'Point your dominant index finger inward directly at your chest.',
    tip: 'Index finger points back at your own sternum, other fingers curled into palm.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.52, isRight: true, fingerPose: 'point_chest' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.54, y: 0.52 },
      requiredFingers: 'Index pointing inward at chest',
      zone: 'Center chest / sternum'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const leftShoulder = pose?.[11] || { x: 0.4, y: 0.45 };
      const rightShoulder = pose?.[12] || { x: 0.6, y: 0.45 };
      const chestCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 + 0.05 };
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Point index finger at your chest.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const idxExt = h.index.isExtended;
      checklist.push({
        id: 'index_ext',
        label: 'Index finger extended',
        status: idxExt ? 'pass' : 'fail',
        current: idxExt ? 'Extended (✔)' : 'Extend index',
        target: 'Extended index',
        hint: 'Extend your index finger.'
      });
      if (idxExt) score += 35;

      const nearChest = dist2D(h.points[8], chestCenter) < 0.18;
      checklist.push({
        id: 'near_chest',
        label: 'Index pointing to chest center',
        status: nearChest ? 'pass' : 'fail',
        current: nearChest ? 'At chest (✔)' : 'Aim at chest',
        target: 'Center chest',
        hint: 'Point your index finger at the center of your chest.'
      });
      if (nearChest) score += 45;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Me / I sign recognized!' : 'Point index finger at your chest.' };
    }
  },

  {
    id: 'please',
    label: 'PLEASE',
    name: 'Please',
    category: 'greetings',
    type: 'word',
    english: 'Please / Kindly',
    image: '/signs/please.jpg',
    description: 'Open flat palm placed on center of chest and rubbed gently in a circular motion.',
    tip: 'Flat open hand rests on center chest with fingers together.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.50, wristY: 0.50, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.50, y: 0.50 },
      requiredFingers: 'Open flat palm on chest',
      zone: 'Center chest rubbing circle'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const leftShoulder = pose?.[11] || { x: 0.4, y: 0.45 };
      const rightShoulder = pose?.[12] || { x: 0.6, y: 0.45 };
      const chestCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 + 0.05 };
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Place open palm on chest.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const isOpen = h.isOpenPalm || h.extendedCount >= 4;
      checklist.push({
        id: 'open_palm',
        label: 'Open flat hand',
        status: isOpen ? 'pass' : 'fail',
        current: isOpen ? 'Flat palm (✔)' : 'Open your hand',
        target: 'Open palm',
        hint: 'Open your hand flat.'
      });
      if (isOpen) score += 40;

      const onChest = dist2D(h.palmCenter, chestCenter) < 0.22;
      checklist.push({
        id: 'on_chest',
        label: 'Positioned on chest center',
        status: onChest ? 'pass' : 'fail',
        current: onChest ? 'On chest (✔)' : 'Place on chest',
        target: 'Center chest',
        hint: 'Place your flat palm over your chest.'
      });
      if (onChest) score += 40;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Please sign recognized!' : 'Place flat palm on chest in circular rub.' };
    }
  },

  {
    id: 'sorry',
    label: 'SORRY',
    name: 'Sorry / Apology',
    category: 'greetings',
    type: 'word',
    english: 'Sorry / Apologies / Forgive',
    image: '/signs/sorry.jpg',
    description: 'Dominant closed fist placed on center of chest and rubbed in a gentle circle.',
    tip: 'Fist rests on chest with thumb upright or resting along index finger.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.50, wristY: 0.50, isRight: true, fingerPose: 'fist' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.50, y: 0.50 },
      requiredFingers: 'Closed fist over heart/chest',
      zone: 'Center chest / Heart zone'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const leftShoulder = pose?.[11] || { x: 0.4, y: 0.45 };
      const rightShoulder = pose?.[12] || { x: 0.6, y: 0.45 };
      const chestCenter = { x: (leftShoulder.x + rightShoulder.x) / 2, y: (leftShoulder.y + rightShoulder.y) / 2 + 0.05 };
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Place closed fist on chest.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const isFist = h.isFist || h.curledCount >= 3;
      checklist.push({
        id: 'fist',
        label: 'Closed fist formed',
        status: isFist ? 'pass' : 'fail',
        current: isFist ? 'Fist formed (✔)' : 'Close hand into fist',
        target: 'Closed fist',
        hint: 'Close your hand into a fist.'
      });
      if (isFist) score += 40;

      const onChest = dist2D(h.wrist, chestCenter) < 0.22;
      checklist.push({
        id: 'on_chest',
        label: 'Placed on chest/heart zone',
        status: onChest ? 'pass' : 'fail',
        current: onChest ? 'On chest (✔)' : 'Place over chest',
        target: 'Chest center',
        hint: 'Hold your fist over your chest/heart.'
      });
      if (onChest) score += 40;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Sorry sign recognized!' : 'Hold fist against chest in gentle circular motion.' };
    }
  },

  {
    id: 'welcome',
    label: 'WELCOME',
    name: 'Welcome',
    category: 'greetings',
    type: 'word',
    english: 'Welcome / Glad to have you',
    image: '/signs/welcome.jpg',
    description: 'Both open palms held facing upward in front of torso, sweeping smoothly inward toward the body.',
    tip: 'Hold both open hands at mid-torso with palms turned upward.',
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.38, wristY: 0.60, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.62, wristY: 0.60, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Both Hands',
      wristTarget: { left: { x: 0.38, y: 0.60 }, right: { x: 0.62, y: 0.60 } },
      requiredFingers: 'Both open flat palms held up',
      zone: 'Mid-torso / Abdomen level'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const checklist = [];
      let score = 0;

      if (!left || !right) {
        return {
          matchScore: 0,
          isMatched: false,
          checklist: [{ id: 'both', label: 'Both hands active', status: 'fail', current: (left || right) ? '1 hand' : 'None', target: '2 hands', hint: 'Raise both open palms.' }],
          primaryGuidance: 'Raise both open palms in front of your body.'
        };
      }

      checklist.push({ id: 'both', label: 'Both hands detected', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
      score += 30;

      const bothOpen = (left.isOpenPalm || left.extendedCount >= 4) && (right.isOpenPalm || right.extendedCount >= 4);
      checklist.push({
        id: 'open',
        label: 'Both palms open flat',
        status: bothOpen ? 'pass' : 'fail',
        current: bothOpen ? 'Open palms (✔)' : 'Open both palms',
        target: 'Both open',
        hint: 'Open both hands flat.'
      });
      if (bothOpen) score += 35;

      const dHands = dist3D(left.wrist, right.wrist);
      const spaced = dHands > 0.16 && dHands < 0.50;
      checklist.push({
        id: 'spacing',
        label: 'Hands spaced at torso width',
        status: spaced ? 'pass' : 'fail',
        current: spaced ? 'Torso width (✔)' : 'Adjust hand distance',
        target: 'Torso width',
        hint: 'Hold both palms about shoulder width apart.'
      });
      if (spaced) score += 35;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Welcome sign recognized!' : 'Hold both open palms up and sweep inward.' };
    }
  },

  {
    id: 'money',
    label: 'MONEY',
    name: 'Money / Cash',
    category: 'daily_life',
    type: 'word',
    english: 'Money / Currency / Price',
    image: '/signs/money.jpg',
    description: 'Rub dominant thumb pad across the tips of your extended index and middle fingers.',
    tip: 'Thumb rubs index & middle finger pads in front of chest, ring and pinky curled.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.52, isRight: true, fingerPose: 'pinched' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.54, y: 0.52 },
      requiredFingers: 'Thumb rubbing index and middle tips',
      zone: 'Chest level'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Rub thumb on index and middle tips.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 20;

      const dThumbIndex = dist3D(h.points[4], h.points[8]);
      const dThumbMiddle = dist3D(h.points[4], h.points[12]);
      const touching = dThumbIndex < 0.11 && dThumbMiddle < 0.11;
      checklist.push({
        id: 'rubbing_tips',
        label: 'Thumb touching index and middle tips',
        status: touching ? 'pass' : 'fail',
        current: touching ? 'Touching (✔)' : 'Bring tips together',
        target: 'Tips touching',
        hint: 'Touch thumb pad to index and middle fingertips.'
      });
      if (touching) score += 45;

      const curled = h.ring.isCurled && h.pinky.isCurled;
      checklist.push({
        id: 'curled',
        label: 'Ring and Pinky curled in',
        status: curled ? 'pass' : 'warn',
        current: curled ? 'Curled (✔)' : 'Fold ring & pinky',
        target: 'Folded',
        hint: 'Curl ring and pinky into your palm.'
      });
      if (curled) score += 35;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Money sign recognized!' : 'Rub thumb pad across index and middle fingertips.' };
    }
  },

  {
    id: 'pain',
    label: 'PAIN',
    name: 'Pain / Hurt',
    category: 'healthcare',
    type: 'word',
    english: 'Pain / Hurt / Ache',
    image: '/signs/pain.jpg',
    description: 'Both index fingers extended and pointing horizontally towards each other in front of chest.',
    tip: 'Extend both index fingers towards each other with other fingers curled into fists.',
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.42, wristY: 0.50, isRight: false, fingerPose: 'point_forward' }),
      rightHand: createHandSkeleton({ wristX: 0.58, wristY: 0.50, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Both Hands',
      wristTarget: { left: { x: 0.42, y: 0.50 }, right: { x: 0.58, y: 0.50 } },
      requiredFingers: 'Both index fingers pointing towards each other',
      zone: 'Center chest'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const checklist = [];
      let score = 0;

      if (!left || !right) {
        return {
          matchScore: 0,
          isMatched: false,
          checklist: [{ id: 'both', label: 'Both hands active', status: 'fail', current: (left || right) ? '1 hand' : 'None', target: '2 hands', hint: 'Raise both index fingers.' }],
          primaryGuidance: 'Extend both index fingers towards each other.'
        };
      }

      checklist.push({ id: 'both', label: 'Both hands detected', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
      score += 25;

      const indicesExt = left.index.isExtended && right.index.isExtended;
      checklist.push({
        id: 'index_ext',
        label: 'Both index fingers extended',
        status: indicesExt ? 'pass' : 'fail',
        current: indicesExt ? 'Extended (✔)' : 'Extend both index fingers',
        target: 'Both index out',
        hint: 'Extend index on both hands.'
      });
      if (indicesExt) score += 35;

      const dTips = dist3D(left.points[8], right.points[8]);
      const tipsFacing = dTips < 0.22;
      checklist.push({
        id: 'tips_facing',
        label: 'Index tips pointing towards each other',
        status: tipsFacing ? 'pass' : 'fail',
        current: tipsFacing ? 'Tips aligned (✔)' : 'Bring tips closer',
        target: '< 22 cm apart',
        hint: 'Point both index fingertips towards each other at chest.'
      });
      if (tipsFacing) score += 40;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Pain sign recognized!' : 'Point both index fingers horizontally towards each other.' };
    }
  },

  {
    id: 'fever',
    label: 'FEVER',
    name: 'Fever / Temperature',
    category: 'healthcare',
    type: 'word',
    english: 'Fever / High Temperature / Sick',
    image: '/signs/fever.jpg',
    description: 'Place the palm or back of your dominant flat hand against your forehead to check heat.',
    tip: 'Hand held flat against the center of your forehead.',
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.50, wristY: 0.20, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Dominant Hand',
      wristTarget: { x: 0.50, y: 0.20 },
      requiredFingers: 'Flat hand on forehead',
      zone: 'Forehead / Brow level'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const nose = pose?.[0] || { x: 0.5, y: 0.22 };
      const h = right || left;

      const checklist = [];
      let score = 0;
      if (!h) return { matchScore: 0, isMatched: false, checklist: [], primaryGuidance: 'Place hand on forehead.' };

      checklist.push({ id: 'hand', label: 'Hand in view', status: 'pass', current: 'Detected', target: '1 hand', hint: '' });
      score += 25;

      const nearHead = dist2D(h.palmCenter, nose) < 0.24;
      checklist.push({
        id: 'near_head',
        label: 'Hand placed on forehead',
        status: nearHead ? 'pass' : 'fail',
        current: nearHead ? 'On forehead (✔)' : 'Touch forehead',
        target: 'Forehead center',
        hint: 'Place your hand against your forehead.'
      });
      if (nearHead) score += 45;

      const aboveNose = h.wrist.y < nose.y + 0.10;
      checklist.push({
        id: 'height',
        label: 'Hand at head height',
        status: aboveNose ? 'pass' : 'warn',
        current: aboveNose ? 'Head height (✔)' : 'Raise higher',
        target: 'Brow height',
        hint: 'Raise your hand up to your brow.'
      });
      if (aboveNose) score += 30;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Fever sign recognized!' : 'Place flat hand on forehead checking temperature.' };
    }
  },

  {
    id: 'want',
    label: 'WANT',
    name: 'Want / Need',
    category: 'actions',
    type: 'word',
    english: 'Want / Need / Desire',
    image: '/signs/want.jpg',
    description: 'Both clawed hands held palms-up at lower chest level, pulling smoothly inward toward your body.',
    tip: 'Both hands with slightly clawed curved fingers at waist/chest level.',
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.40, wristY: 0.58, isRight: false, fingerPose: 'cupped' }),
      rightHand: createHandSkeleton({ wristX: 0.60, wristY: 0.58, isRight: true, fingerPose: 'cupped' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      activeHand: 'Both Hands',
      wristTarget: { left: { x: 0.40, y: 0.58 }, right: { x: 0.60, y: 0.58 } },
      requiredFingers: 'Both hands clawed / cupped upward',
      zone: 'Lower chest / waist'
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const checklist = [];
      let score = 0;

      if (!left || !right) {
        return {
          matchScore: 0,
          isMatched: false,
          checklist: [{ id: 'both', label: 'Both hands active', status: 'fail', current: (left || right) ? '1 hand' : 'None', target: '2 hands', hint: 'Hold both hands in front.' }],
          primaryGuidance: 'Hold both clawed hands in front of lower chest.'
        };
      }

      checklist.push({ id: 'both', label: 'Both hands detected', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
      score += 25;

      const claws = !left.isOpenPalm && !right.isOpenPalm && left.curledCount >= 2 && right.curledCount >= 2;
      checklist.push({
        id: 'claw_hands',
        label: 'Both hands clawed / cupped palms-up',
        status: claws ? 'pass' : 'fail',
        current: claws ? 'Clawed hands (✔)' : 'Curve fingers upward',
        target: 'Curved claw shape',
        hint: 'Curve your fingers like claws facing upward.'
      });
      if (claws) score += 40;

      const lowerChest = left.wrist.y > 0.42 && right.wrist.y > 0.42;
      checklist.push({
        id: 'lower_chest',
        label: 'Positioned at lower chest / waist',
        status: lowerChest ? 'pass' : 'warn',
        current: lowerChest ? 'Lower chest (✔)' : 'Lower your hands',
        target: 'Lower chest level',
        hint: 'Hold hands at lower chest or abdomen level.'
      });
      if (lowerChest) score += 35;

      const isMatched = score >= 75;
      return { matchScore: score, isMatched, checklist, primaryGuidance: isMatched ? 'Want sign recognized!' : 'Hold both clawed hands palms-up pulling inward.' };
    }
  },

  // =========================================================================
    // =========================================================================
  // 2. ISL ALPHABET (FINGERSPELLING: ALL 26 LETTERS A-Z)
  // =========================================================================
  {
    id: 'alphabet_a',
    label: 'A',
    name: 'Letter A',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter A (ISL Vowel #1)',
    image: '/signs/alphabet_a.jpg',
    description: "Touch the tip of your non-dominant thumb with your dominant index finger. (Or single-handed: closed fist with thumb upright along the side).",
    tip: "Vowel #1: Dominant index points to thumb tip of non-dominant hand.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed ISL Vowel #1",
      keyTarget: "Thumb Tip (Joint #4)"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Touch your non-dominant thumb tip with your dominant index finger." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'A');
      if (topPred && topPred.label === 'A') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[4]), dist3D(right.points[8], left.points[4]));
        const ok = d < 0.16;
        checklist.push({ id: 'contact', label: 'Index touching thumb tip', status: ok ? 'pass' : (d < 0.25 ? 'warn' : 'fail'), current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch thumb tip with index finger.' });
        if (ok) score += 35;
        else if (d < 0.25) score += 15;
      } else {
        const h = right || left;
        if (h && h.isFist && h.thumb.isExtended) {
          checklist.push({ id: 'single_a', label: 'Fist with thumb up (Single-hand)', status: 'pass', current: 'Fist + Thumb (✔)', target: 'Fist + Thumb', hint: '' });
          score += 55;
        } else {
          checklist.push({ id: 'hands', label: 'Hand detected', status: h ? 'warn' : 'fail', current: h ? '1 hand' : 'No hands', target: '2 hands', hint: 'Bring both hands into view.' });
        }
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter A confirmed!' : "Touch your non-dominant thumb tip with your dominant index finger.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_b',
    label: 'B',
    name: 'Letter B',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter B',
    image: '/signs/alphabet_b.jpg',
    description: "Both hands form circles with thumb and index touching, joined together like binoculars (or 4 straight fingers upright with thumb folded).",
    tip: "Circles joined together at finger tips or 4 upright fingers.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'pinched' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'pinched' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Binocular Circles",
      keyTarget: "Both Thumb+Index Circles"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Join both hands together forming circles like binoculars." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'B');
      if (topPred && topPred.label === 'B') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.points[8], right.points[8]);
        const ok = d < 0.16;
        checklist.push({ id: 'contact', label: 'Hands joined together', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Bring both hands together.' });
        if (ok) score += 35;
      } else {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'fail', current: '1 hand', target: '2 hands', hint: 'Use both hands.' });
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter B confirmed!' : "Join both hands together forming circles like binoculars.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_c',
    label: 'C',
    name: 'Letter C',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter C',
    image: '/signs/alphabet_c.jpg',
    description: "Hand curved into a clear, open \"C\" shape with thumb and fingers arched facing inward.",
    tip: "Single-handed: Form a curved C arc with thumb below and fingers above.",
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'cupped' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Single-Handed Arc",
      keyTarget: "Open Curved C Arc"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Form an open curved C shape with thumb and fingers." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'C');
      if (topPred && topPred.label === 'C') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      const h = right || left;
      if (h) {
        checklist.push({ id: 'hand', label: 'Hand active', status: 'pass', current: '1 hand (✔)', target: '1 hand', hint: '' });
        score += 25;
        const d = dist3D(h.points[4], h.points[8]);
        const ok = d > 0.06 && d < 0.22;
        checklist.push({ id: 'c_shape', label: 'Curved "C" opening', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm opening', target: '6-22 cm', hint: 'Curve fingers and thumb into a C.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter C confirmed!' : "Form an open curved C shape with thumb and fingers.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_d',
    label: 'D',
    name: 'Letter D',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter D',
    image: '/signs/alphabet_d.jpg',
    description: "Non-dominant index pointing vertically up; dominant thumb and index form a curved semicircle touching its tip and base to form a \"D\".",
    tip: "Form a round D arc against vertical index finger.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'point_up' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'cupped' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed \"D\"",
      keyTarget: "Round D on Upright Index"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Form a round D shape against your upright vertical index finger." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'D');
      if (topPred && topPred.label === 'D') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[8]), dist3D(right.points[8], left.points[8]));
        const ok = d < 0.18;
        checklist.push({ id: 'contact', label: 'Index touching semicircle', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Touch dominant index to non-dominant index.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter D confirmed!' : "Form a round D shape against your upright vertical index finger.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_e',
    label: 'E',
    name: 'Letter E',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter E (ISL Vowel #2)',
    image: '/signs/alphabet_e.jpg',
    description: "Touch the tip of your non-dominant index finger with your dominant index finger.",
    tip: "Vowel #2: Dominant index points to non-dominant index fingertip.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'point_up' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed ISL Vowel #2",
      keyTarget: "Index Fingertip (Joint #8)"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Touch non-dominant index fingertip with dominant index finger." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'E');
      if (topPred && topPred.label === 'E') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.points[8], right.points[8]);
        const ok = d < 0.16;
        checklist.push({ id: 'contact', label: 'Index fingertips touching', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch index fingertips together.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter E confirmed!' : "Touch non-dominant index fingertip with dominant index finger.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_f',
    label: 'F',
    name: 'Letter F',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter F',
    image: '/signs/alphabet_f.jpg',
    description: "Dominant index and middle fingers placed horizontally across non-dominant index and middle fingers.",
    tip: "Two fingers crossed horizontally across two fingers.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'peace' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'peace' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Crossed Fingers",
      keyTarget: "Two Fingers Crossed Horizontally"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Place dominant index and middle horizontally across non-dominant fingers." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'F');
      if (topPred && topPred.label === 'F') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.points[8], right.points[8]);
        const ok = d < 0.16;
        checklist.push({ id: 'crossed', label: 'Fingers crossed together', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Cross index & middle fingers.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter F confirmed!' : "Place dominant index and middle horizontally across non-dominant fingers.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_g',
    label: 'G',
    name: 'Letter G',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter G',
    image: '/signs/alphabet_g.jpg',
    description: "Dominant fist placed on top of or against non-dominant fist (or index and thumb pointing horizontally).",
    tip: "Fists stacked or horizontal index.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'fist' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'fist' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Fists",
      keyTarget: "Both Fists Stacked / Meeting"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Place dominant fist against or stacked on non-dominant fist." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'G');
      if (topPred && topPred.label === 'G') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.wrist, right.wrist);
        const ok = d < 0.22 && (left.isFist || right.isFist);
        checklist.push({ id: 'fists', label: 'Fists touching', status: ok ? 'pass' : 'warn', current: Math.round(d * 100) + ' cm', target: '< 22 cm', hint: 'Close fists together.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter G confirmed!' : "Place dominant fist against or stacked on non-dominant fist.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_h',
    label: 'H',
    name: 'Letter H',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter H',
    image: '/signs/alphabet_h.jpg',
    description: "Dominant flat open palm placed flat across non-dominant open palm.",
    tip: "Flat hand sweeping across palm.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Palm Cross",
      keyTarget: "Flat Open Hands Crossed"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Place dominant flat open palm across non-dominant palm." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'H');
      if (topPred && topPred.label === 'H') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.wrist, right.palmCenter), dist3D(right.wrist, left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'palms', label: 'Palms crossing', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Rest flat hand across palm.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter H confirmed!' : "Place dominant flat open palm across non-dominant palm.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_i',
    label: 'I',
    name: 'Letter I',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter I (ISL Vowel #3)',
    image: '/signs/alphabet_i.jpg',
    description: "Touch the tip of your non-dominant middle finger with your dominant index finger. (Or single-handed: pinky extended straight up from fist).",
    tip: "Vowel #3: Dominant index points to non-dominant middle fingertip.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed ISL Vowel #3",
      keyTarget: "Middle Fingertip (Joint #12)"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Touch non-dominant middle fingertip with dominant index finger." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'I');
      if (topPred && topPred.label === 'I') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[12]), dist3D(right.points[8], left.points[12]));
        const ok = d < 0.16;
        checklist.push({ id: 'middle_touch', label: 'Index touching middle tip', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch middle fingertip.' });
        if (ok) score += 35;
      } else {
        const h = right || left;
        if (h && h.pinky.isExtended && h.curledCount >= 3) {
          checklist.push({ id: 'pinky_up', label: 'Pinky extended upright', status: 'pass', current: 'Pinky Up (✔)', target: 'Pinky up', hint: '' });
          score += 55;
        }
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter I confirmed!' : "Touch non-dominant middle fingertip with dominant index finger.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_j',
    label: 'J',
    name: 'Letter J',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter J',
    image: '/signs/alphabet_j.jpg',
    description: "Dominant index touches non-dominant middle fingertip and draws a \"J\" curve down the palm to the wrist.",
    tip: "Trace down palm from middle finger.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Trace",
      keyTarget: "J-Stroke on Flat Palm"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Touch middle finger and trace a J down the non-dominant palm." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'J');
      if (topPred && topPred.label === 'J') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.palmCenter), dist3D(right.points[8], left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'palm_trace', label: 'Index on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Touch index to palm.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter J confirmed!' : "Touch middle finger and trace a J down the non-dominant palm.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_k',
    label: 'K',
    name: 'Letter K',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter K',
    image: '/signs/alphabet_k.jpg',
    description: "Dominant index finger hooked/bent touching the first knuckle/joint of non-dominant extended index finger.",
    tip: "Hooked finger on index joint.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'point_up' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'cupped' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Hook",
      keyTarget: "Dominant Index Hooked on Knuckle"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Hook dominant index finger onto the knuckle of non-dominant index." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'K');
      if (topPred && topPred.label === 'K') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[6]), dist3D(right.points[8], left.points[6]));
        const ok = d < 0.16;
        checklist.push({ id: 'hook_touch', label: 'Hook on index joint', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch index joint.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter K confirmed!' : "Hook dominant index finger onto the knuckle of non-dominant index.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_l',
    label: 'L',
    name: 'Letter L',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter L',
    image: '/signs/alphabet_l.jpg',
    description: "Extend thumb and index finger at a sharp 90-degree angle to form an \"L\" shape, keeping other three fingers curled.",
    tip: "Clear 90-degree right angle between thumb and index.",
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_up' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "ISL Letter L",
      keyTarget: "Thumb and Index at 90°"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Form an L shape with your thumb and index finger at 90 degrees." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'L');
      if (topPred && topPred.label === 'L') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      const h = right || left;
      if (h) {
        checklist.push({ id: 'hand', label: 'Hand active', status: 'pass', current: '1 hand (✔)', target: '1 hand', hint: '' });
        score += 25;
        const ok = h.thumb.isExtended && h.index.isExtended;
        checklist.push({ id: 'l_shape', label: 'Thumb + Index extended', status: ok ? 'pass' : 'fail', current: ok ? 'L-shape (✔)' : 'Extend thumb & index', target: '90 deg angle', hint: 'Extend thumb and index.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter L confirmed!' : "Form an L shape with your thumb and index finger at 90 degrees.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_m',
    label: 'M',
    name: 'Letter M',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter M',
    image: '/signs/alphabet_m.jpg',
    description: "Dominant 3 fingers (index, middle, ring) resting downward onto non-dominant flat palm.",
    tip: "3 fingers resting on palm.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed 3-Finger Rest",
      keyTarget: "3 Fingers Resting on Palm"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Rest dominant 3 fingers (index, middle, ring) onto non-dominant palm." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'M');
      if (topPred && topPred.label === 'M') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[12], right.palmCenter), dist3D(right.points[12], left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'fingers_palm', label: '3 fingers on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Rest 3 fingers on palm.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter M confirmed!' : "Rest dominant 3 fingers (index, middle, ring) onto non-dominant palm.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_n',
    label: 'N',
    name: 'Letter N',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter N',
    image: '/signs/alphabet_n.jpg',
    description: "Dominant 2 fingers (index, middle) resting downward onto non-dominant flat palm.",
    tip: "2 fingers resting on palm.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'peace' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed 2-Finger Rest",
      keyTarget: "2 Fingers Resting on Palm"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Rest dominant 2 fingers (index, middle) onto non-dominant palm." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'N');
      if (topPred && topPred.label === 'N') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.palmCenter), dist3D(right.points[8], left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'fingers_palm', label: '2 fingers on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Rest 2 fingers on palm.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter N confirmed!' : "Rest dominant 2 fingers (index, middle) onto non-dominant palm.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_o',
    label: 'O',
    name: 'Letter O',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter O (ISL Vowel #4)',
    image: '/signs/alphabet_o.jpg',
    description: "Touch the tip of your non-dominant ring finger with your dominant index finger. (Or single-handed: all fingertips touching thumb tip forming an O).",
    tip: "Vowel #4: Dominant index points to non-dominant ring fingertip.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed ISL Vowel #4",
      keyTarget: "Ring Fingertip (Joint #16)"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Touch non-dominant ring fingertip with dominant index finger." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'O');
      if (topPred && topPred.label === 'O') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[16]), dist3D(right.points[8], left.points[16]));
        const ok = d < 0.16;
        checklist.push({ id: 'ring_touch', label: 'Index touching ring tip', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch ring fingertip.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter O confirmed!' : "Touch non-dominant ring fingertip with dominant index finger.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_p',
    label: 'P',
    name: 'Letter P',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter P',
    image: '/signs/alphabet_p.jpg',
    description: "Dominant thumb and index form a circle loop touching the tip of non-dominant index finger pointing vertically up.",
    tip: "Circle loop touching index tip.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'point_up' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'pinched' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed \"P\"",
      keyTarget: "Circle Touching Vertical Index Tip"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Touch dominant thumb-index circle to the tip of vertical non-dominant index." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'P');
      if (topPred && topPred.label === 'P') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[8]), dist3D(right.points[8], left.points[8]));
        const ok = d < 0.16;
        checklist.push({ id: 'loop_touch', label: 'Loop on index tip', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch circle to index tip.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter P confirmed!' : "Touch dominant thumb-index circle to the tip of vertical non-dominant index.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_q',
    label: 'Q',
    name: 'Letter Q',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter Q',
    image: '/signs/alphabet_q.jpg',
    description: "Dominant thumb and index form a circle hooked around the base of non-dominant extended thumb.",
    tip: "Circle hooked onto thumb.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'thumbs_up' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'pinched' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed \"Q\"",
      keyTarget: "Circle Hooked Around Thumb Base"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Hook dominant thumb-index circle around the base of non-dominant thumb." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'Q');
      if (topPred && topPred.label === 'Q') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[4]), dist3D(right.points[8], left.points[4]));
        const ok = d < 0.16;
        checklist.push({ id: 'thumb_hook', label: 'Circle hooked around thumb', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Hook circle around thumb.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter Q confirmed!' : "Hook dominant thumb-index circle around the base of non-dominant thumb.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_r',
    label: 'R',
    name: 'Letter R',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter R',
    image: '/signs/alphabet_r.jpg',
    description: "Dominant hooked/curved index finger resting on the center of non-dominant flat palm.",
    tip: "Hooked finger on palm.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'cupped' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Hooked Palm",
      keyTarget: "Curved Index on Center Palm"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Rest dominant curved index finger on center of non-dominant flat palm." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'R');
      if (topPred && topPred.label === 'R') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.palmCenter), dist3D(right.points[8], left.palmCenter));
        const ok = d < 0.18;
        checklist.push({ id: 'hook_palm', label: 'Curved index on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Rest curved index on palm.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter R confirmed!' : "Rest dominant curved index finger on center of non-dominant flat palm.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_s',
    label: 'S',
    name: 'Letter S',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter S',
    image: '/signs/alphabet_s.jpg',
    description: "Dominant pinky finger hooked with non-dominant pinky finger, or dominant closed fist resting against non-dominant palm.",
    tip: "Pinkies linked or fist on palm.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'fist' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Fist / Pinky Hook",
      keyTarget: "Fist on Palm or Pinkies Linked"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Rest dominant closed fist against non-dominant palm or link pinkies." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'S');
      if (topPred && topPred.label === 'S') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.palmCenter, right.palmCenter);
        const ok = d < 0.20;
        checklist.push({ id: 'fist_palm', label: 'Fist resting on palm', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 20 cm', hint: 'Rest fist against palm.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter S confirmed!' : "Rest dominant closed fist against non-dominant palm or link pinkies.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_t',
    label: 'T',
    name: 'Letter T',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter T',
    image: '/signs/alphabet_t.jpg',
    description: "Dominant extended index finger touching the side edge of non-dominant flat palm near the pinky base.",
    tip: "Index touching side edge of palm.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Edge Touch",
      keyTarget: "Index Touching Pinky Side Edge of Palm"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Touch dominant index finger to the side pinky edge of non-dominant palm." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'T');
      if (topPred && topPred.label === 'T') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[17]), dist3D(right.points[8], left.points[17]));
        const ok = d < 0.16;
        checklist.push({ id: 'edge_touch', label: 'Index on palm edge', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch side edge of palm.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter T confirmed!' : "Touch dominant index finger to the side pinky edge of non-dominant palm.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_u',
    label: 'U',
    name: 'Letter U',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter U (ISL Vowel #5)',
    image: '/signs/alphabet_u.jpg',
    description: "Touch the tip of your non-dominant pinky finger with your dominant index finger. (Or single-handed: index and middle extended together).",
    tip: "Vowel #5: Dominant index points to non-dominant pinky fingertip.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed ISL Vowel #5",
      keyTarget: "Pinky Fingertip (Joint #20)"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Touch non-dominant pinky fingertip with dominant index finger." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'U');
      if (topPred && topPred.label === 'U') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[20]), dist3D(right.points[8], left.points[20]));
        const ok = d < 0.16;
        checklist.push({ id: 'pinky_touch', label: 'Index touching pinky tip', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Touch pinky tip.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter U confirmed!' : "Touch non-dominant pinky fingertip with dominant index finger.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_v',
    label: 'V',
    name: 'Letter V',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter V',
    image: '/signs/alphabet_v.jpg',
    description: "Extend your index and middle fingers upward in a separated \"V\" (peace sign), with thumb holding down ring and pinky fingers.",
    tip: "Spread index and middle apart into a V.",
    targetSkeleton: {
      leftHand: null,
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'peace' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "ISL Letter V",
      keyTarget: "Separated V Peace Sign"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Spread index and middle fingers into a V peace sign." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'V');
      if (topPred && topPred.label === 'V') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      const h = right || left;
      if (h) {
        checklist.push({ id: 'hand', label: 'Hand active', status: 'pass', current: '1 hand (✔)', target: '1 hand', hint: '' });
        score += 25;
        const ok = h.index.isExtended && h.middle.isExtended && dist3D(h.points[8], h.points[12]) > 0.04;
        checklist.push({ id: 'v_shape', label: 'Index + Middle in V shape', status: ok ? 'pass' : 'fail', current: ok ? 'V shape (✔)' : 'Spread V fingers', target: 'Spread V', hint: 'Extend index and middle in a V.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter V confirmed!' : "Spread index and middle fingers into a V peace sign.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_w',
    label: 'W',
    name: 'Letter W',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter W',
    image: '/signs/alphabet_w.jpg',
    description: "Both hands with open palms, fingers interlaced together (or single-handed 3 fingers spread up).",
    tip: "Interlaced fingers / 3 fingers up.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Interlaced",
      keyTarget: "Interlaced Open Palms"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Interlace fingers of both open palms together facing camera." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'W');
      if (topPred && topPred.label === 'W') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.palmCenter, right.palmCenter);
        const ok = d < 0.18;
        checklist.push({ id: 'interlaced', label: 'Hands interlaced together', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 18 cm', hint: 'Interlace fingers of both palms.' });
        if (ok) score += 35;
      } else {
        const h = right || left;
        if (h && h.index.isExtended && h.middle.isExtended && h.ring.isExtended) {
          checklist.push({ id: 'w_single', label: '3 fingers extended (Single-hand)', status: 'pass', current: '3 Fingers (✔)', target: '3 fingers', hint: '' });
          score += 55;
        }
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter W confirmed!' : "Interlace fingers of both open palms together facing camera.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_x',
    label: 'X',
    name: 'Letter X',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter X',
    image: '/signs/alphabet_x.jpg',
    description: "Both index fingers crossed over each other to form an \"X\".",
    tip: "Crossed index fingers.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'point_forward' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Crossed X",
      keyTarget: "Both Index Fingers Crossed"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Cross both extended index fingers over each other to form an X." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'X');
      if (topPred && topPred.label === 'X') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = dist3D(left.points[8], right.points[8]);
        const ok = d < 0.15;
        checklist.push({ id: 'crossed_x', label: 'Index fingers crossed', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 15 cm', hint: 'Cross index fingers.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter X confirmed!' : "Cross both extended index fingers over each other to form an X.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_y',
    label: 'Y',
    name: 'Letter Y',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter Y',
    image: '/signs/alphabet_y.jpg',
    description: "Dominant index finger placed into the V-crotch between non-dominant extended thumb and index finger (or thumb and pinky extended).",
    tip: "Index in thumb-index crotch.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'point_forward' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Crotch Touch",
      keyTarget: "Index in Thumb-Index Cleft"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Place dominant index finger into the crotch between thumb and index finger." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'Y');
      if (topPred && topPred.label === 'Y') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[2]), dist3D(right.points[8], left.points[2]));
        const ok = d < 0.16;
        checklist.push({ id: 'y_cleft', label: 'Index in thumb cleft', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Place index into thumb cleft.' });
        if (ok) score += 35;
      } else {
        const h = right || left;
        if (h && h.thumb.isExtended && h.pinky.isExtended) {
          checklist.push({ id: 'y_single', label: 'Y-Shape (Thumb+Pinky)', status: 'pass', current: 'Y-Hand (✔)', target: 'Thumb+Pinky', hint: '' });
          score += 55;
        }
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter Y confirmed!' : "Place dominant index finger into the crotch between thumb and index finger.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  },
  {
    id: 'alphabet_z',
    label: 'Z',
    name: 'Letter Z',
    category: 'alphabet',
    type: 'alphabet',
    english: 'Letter Z',
    image: '/signs/alphabet_z.jpg',
    description: "Dominant flat hand resting along the upper edge of non-dominant flat hand.",
    tip: "Flat hand on hand edge.",
    targetSkeleton: {
      leftHand: createHandSkeleton({ wristX: 0.46, wristY: 0.58, isRight: false, fingerPose: 'open' }),
      rightHand: createHandSkeleton({ wristX: 0.54, wristY: 0.54, isRight: true, fingerPose: 'open' }),
      pose: BASE_POSE_LANDMARKS
    },
    blueprint: {
      type: "Two-Handed Flat Hand Edge",
      keyTarget: "Flat Hand Along Opposite Hand Edge"
    },
    evaluate: (landmarks) => {
      const left = analyzeHand(landmarks?.leftHandLandmarks);
      const right = analyzeHand(landmarks?.rightHandLandmarks);
      const pose = landmarks?.poseLandmarks;
      const checklist = [];
      let score = 0;
      if (!left && !right) {
        return { matchScore: 0, isMatched: false, checklist: [{ id: 'hand', label: 'Hand visible', status: 'fail', current: 'None', target: 'Active hand', hint: 'Raise hands.' }], primaryGuidance: "Rest dominant flat hand along the upper edge of non-dominant flat hand." };
      }

      // 1. Biometric Alphabet Classifier Engine
      const candidates = classifyIslAlphabet(landmarks?.leftHandLandmarks, landmarks?.rightHandLandmarks, pose);
      const topPred = candidates[0];
      const matchPred = candidates.find(c => c.label === 'Z');
      if (topPred && topPred.label === 'Z') {
        score += 45;
      } else if (matchPred && matchPred.confidence >= 0.70) {
        score += 25;
      }

      // 2. Specific Biomechanical Verification

      if (left && right) {
        checklist.push({ id: 'hands', label: 'Both hands active', status: 'pass', current: '2 hands (✔)', target: '2 hands', hint: '' });
        score += 25;
        const d = Math.min(dist3D(left.points[8], right.points[17]), dist3D(right.points[8], left.points[17]));
        const ok = d < 0.16;
        checklist.push({ id: 'hand_edge', label: 'Hand along opposite edge', status: ok ? 'pass' : 'fail', current: Math.round(d * 100) + ' cm', target: '< 16 cm', hint: 'Rest hand along edge of palm.' });
        if (ok) score += 35;
      }
    

      const isMatched = score >= 75;
      const primaryGuidance = isMatched ? 'Letter Z confirmed!' : "Rest dominant flat hand along the upper edge of non-dominant flat hand.";
      return { matchScore: Math.min(100, score), isMatched, checklist, primaryGuidance };
    }
  }
]);

/**
 * Quick dictionary lookup by ID or Gloss label
 */
export const ISL_LEARN_MAP = new Map(ISL_LEARN_ITEMS.map(item => [item.label.toUpperCase(), item]));
export const ISL_LEARN_BY_ID = new Map(ISL_LEARN_ITEMS.map(item => [item.id, item]));

export function getLearnItemByLabel(label) {
  if (!label) return ISL_LEARN_ITEMS[0];
  const cleaned = label.trim().toUpperCase();
  return ISL_LEARN_MAP.get(cleaned) || ISL_LEARN_ITEMS[0];
}
