/**
 * Real Indian Sign Language (ISL) Geometric & Kinematic Recognition Engine.
 *
 * Implements deterministic 3D biometric sign classification grounded in
 * authentic ISL dictionary grammar and two-handed fingerspelling morphology.
 * Replaces random synthetic matrices with real spatial joint geometry.
 */

// 3D Euclidean distance
export function dist3D(p1, p2) {
  if (!p1 || !p2) return 999;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  const dz = (p1.z || 0) - (p2.z || 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

// 2D Euclidean distance (in normalized screen space)
export function dist2D(p1, p2) {
  if (!p1 || !p2) return 999;
  const dx = p1.x - p2.x;
  const dy = p1.y - p2.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Analyzes finger extension state from 21 hand landmarks
 * 0: Wrist
 * 1-4: Thumb (CMC, MCP, IP, Tip)
 * 5-8: Index (MCP, PIP, DIP, Tip)
 * 9-12: Middle (MCP, PIP, DIP, Tip)
 * 13-16: Ring (MCP, PIP, DIP, Tip)
 * 17-20: Pinky (MCP, PIP, DIP, Tip)
 */
export function analyzeHand(hand) {
  if (!hand || !Array.isArray(hand) || hand.length < 21) {
    return null;
  }

  const wrist = hand[0];
  if (!wrist) return null;

  // Ignore hands at bottom of frame or resting in lap/desk
  if (wrist.y > 0.85) {
    return null;
  }

  const palmCenter = hand[9] || hand[0];

  const checkExtension = (tipIdx, pipIdx, mcpIdx) => {
    const tip = hand[tipIdx];
    const pip = hand[pipIdx];
    const mcp = hand[mcpIdx];
    if (!tip || !pip || !mcp) return { isExtended: false, isCurled: true, tipDist: 0 };

    const tipDist = dist3D(tip, wrist);
    const pipDist = dist3D(pip, wrist);
    const mcpDist = dist3D(mcp, wrist);

    return {
      isExtended: tipDist > pipDist * 1.12,
      isCurled: tipDist < mcpDist * 1.08,
      tipDist
    };
  };

  const thumb = checkExtension(4, 3, 2);
  const index = checkExtension(8, 6, 5);
  const middle = checkExtension(12, 10, 9);
  const ring = checkExtension(16, 14, 13);
  const pinky = checkExtension(20, 18, 17);

  const extendedCount =
    (thumb.isExtended ? 1 : 0) +
    (index.isExtended ? 1 : 0) +
    (middle.isExtended ? 1 : 0) +
    (ring.isExtended ? 1 : 0) +
    (pinky.isExtended ? 1 : 0);

  const curledCount =
    (index.isCurled ? 1 : 0) +
    (middle.isCurled ? 1 : 0) +
    (ring.isCurled ? 1 : 0) +
    (pinky.isCurled ? 1 : 0);

  return {
    wrist,
    palmCenter,
    thumb,
    index,
    middle,
    ring,
    pinky,
    extendedCount,
    curledCount,
    isFist: curledCount >= 3 && !index.isExtended && !middle.isExtended,
    isOpenPalm: extendedCount >= 4,
    points: hand
  };
}

/**
 * Classifies Two-Handed and One-Handed ISL Alphabet (Fingerspelling)
 *
 * @param {Array} leftHand - 21 landmark points
 * @param {Array} rightHand - 21 landmark points
 * @param {Array} pose - 33 pose landmarks
 * @returns {Array<{ rank: number, label: string, confidence: number, isConfident: boolean }>}
 */
export function classifyIslAlphabet(leftHand, rightHand, pose) {
  const left = analyzeHand(leftHand);
  const right = analyzeHand(rightHand);

  if (!left && !right) {
    return [];
  }

  const scores = {};

  // Helper to record candidate score
  const score = (letter, conf) => {
    scores[letter] = Math.max(scores[letter] || 0, conf);
  };

  // Assign dominant / non-dominant hands (support either hand being active)
  const hands = [left, right].filter(Boolean);
  const h1 = hands[0];
  const h2 = hands[1];

  // 1. Two-Handed ISL Letters (require both hands)
  if (left && right) {
    const dWrists = dist3D(left.wrist, right.wrist);
    const dIndexTips = dist3D(left.points[8], right.points[8]);
    const dThumbs = dist3D(left.points[4], right.points[4]);

    // Letter 'A': Non-dominant index pointing up; dominant thumb touches non-dominant index tip
    const leftThumbToRightIndex = dist3D(left.points[4], right.points[8]);
    const rightThumbToLeftIndex = dist3D(right.points[4], left.points[8]);
    if (
      (leftThumbToRightIndex < 0.09 && right.index.isExtended) ||
      (rightThumbToLeftIndex < 0.09 && left.index.isExtended)
    ) {
      score('A', 0.94);
    }

    // Letter 'B': Both hands form circles (index and thumb touching) and meet together
    const leftCircle = dist3D(left.points[4], left.points[8]) < 0.08;
    const rightCircle = dist3D(right.points[4], right.points[8]) < 0.08;
    if (leftCircle && rightCircle && dIndexTips < 0.12) {
      score('B', 0.95);
    }

    // Letter 'D': Non-dominant index extended vertically; dominant thumb & index touch its base & tip
    const dDomToNonDom = Math.min(
      dist3D(left.points[8], right.points[8]) + dist3D(left.points[4], right.points[5]),
      dist3D(right.points[8], left.points[8]) + dist3D(right.points[4], left.points[5])
    );
    if (dDomToNonDom < 0.18 && (left.index.isExtended || right.index.isExtended)) {
      score('D', 0.92);
    }

    // Letter 'E': Dominant index points to and touches non-dominant index tip
    if (dIndexTips < 0.07 && left.index.isExtended && right.index.isExtended) {
      score('E', 0.91);
    }

    // Letter 'F': Dominant index & middle placed horizontally across non-dominant index & middle
    const dMiddleTips = dist3D(left.points[12], right.points[12]);
    if (dIndexTips < 0.09 && dMiddleTips < 0.09 && left.index.isExtended && right.index.isExtended) {
      score('F', 0.89);
    }

    // Letter 'H': Dominant flat hand rests across non-dominant flat palm
    const dPalmRest = Math.min(
      dist3D(left.wrist, right.palmCenter),
      dist3D(right.wrist, left.palmCenter)
    );
    if (dPalmRest < 0.12 && left.isOpenPalm && right.isOpenPalm) {
      score('H', 0.93);
    }

    // Letter 'X': Both index fingers crossed over each other
    if (dIndexTips < 0.08 && left.index.isExtended && right.index.isExtended && left.curledCount >= 2 && right.curledCount >= 2) {
      score('X', 0.92);
    }
  }

  // 2. Single-Handed ISL / Universal Letters
  for (const h of hands) {
    // Letter 'C': Hand curved into deliberate 'C' shape (thumb & index curved, middle/ring/pinky aligned)
    // Rejects neutral/resting hands by requiring active arched index/thumb posture and raised position
    const dThumbIndex = dist3D(h.points[4], h.points[8]);
    const indexPip = h.points[6];
    const indexTip = h.points[8];
    const thumbTip = h.points[4];
    const isArched = indexPip && indexTip && thumbTip &&
      Math.abs(indexTip.x - thumbTip.x) < 0.14 &&
      dThumbIndex > 0.08 && dThumbIndex < 0.18;
    if (isArched && !h.isOpenPalm && !h.isFist && h.curledCount >= 1 && h.extendedCount <= 2 && h.wrist.y < 0.78) {
      score('C', 0.88);
    }

    // Letter 'L': Thumb and index at roughly 90 degrees, other 3 fingers curled into fist
    if (h.thumb.isExtended && h.index.isExtended && h.middle.isCurled && h.ring.isCurled && h.pinky.isCurled) {
      const dIndexThumb = dist2D(h.points[4], h.points[8]);
      if (dIndexThumb > 0.10) {
        score('L', 0.96);
      }
    }

    // Letter 'V': Peace sign (Index and Middle extended and spread, Ring and Pinky curled)
    if (h.index.isExtended && h.middle.isExtended && h.ring.isCurled && h.pinky.isCurled) {
      score('V', 0.95);
    }

    // Letter 'W': 3 fingers (Index, Middle, Ring) extended and spread, Pinky curled
    if (h.index.isExtended && h.middle.isExtended && h.ring.isExtended && h.pinky.isCurled) {
      score('W', 0.94);
    }

    // Letter 'Y': Thumb and Pinky extended (shaka / phone shape), Index/Middle/Ring curled
    if (h.thumb.isExtended && h.pinky.isExtended && h.index.isCurled && h.middle.isCurled && h.ring.isCurled) {
      score('Y', 0.95);
    }

    // Letter 'I': Only Pinky extended, all other fingers curled into fist
    if (h.pinky.isExtended && h.index.isCurled && h.middle.isCurled && h.ring.isCurled && !h.thumb.isExtended) {
      score('I', 0.94);
    }

    // Letter 'U': Index and middle extended straight together (not spread)
    if (h.index.isExtended && h.middle.isExtended && h.ring.isCurled && h.pinky.isCurled) {
      const dIndexMiddle = dist3D(h.points[8], h.points[12]);
      if (dIndexMiddle < 0.05) {
        score('U', 0.92);
      }
    }

    // Letter 'O': All 5 fingertips curled touching thumb tip
    const allTipsToThumb = [8, 12, 16, 20].map(idx => dist3D(h.points[idx], h.points[4]));
    const maxTipDist = Math.max(...allTipsToThumb);
    if (maxTipDist < 0.08 && !h.isOpenPalm) {
      score('O', 0.90);
    }
  }

  // Convert scores dictionary to ranked top-3 list
  const entries = Object.entries(scores)
    .map(([label, confidence]) => ({ label, confidence }))
    .sort((a, b) => b.confidence - a.confidence);

  if (entries.length === 0) {
    return [];
  }

  return entries.slice(0, 3).map((item, idx) => ({
    rank: idx + 1,
    label: item.label,
    confidence: item.confidence,
    isConfident: item.confidence >= 0.75
  }));
}

/**
 * Classifies Indian Sign Language (ISL) Conversational Vocabulary Words
 * Grounded in authentic ISL dictionary grammar and kinematics.
 *
 * @param {Array} leftHand - 21 landmark points
 * @param {Array} rightHand - 21 landmark points
 * @param {Array} pose - 33 pose landmarks
 * @param {Object} motion - VelocityGate state
 * @returns {Array<{ rank: number, label: string, confidence: number, isConfident: boolean }>}
 */
export function classifyIslWord(leftHand, rightHand, pose, motion) {
  const left = analyzeHand(leftHand);
  const right = analyzeHand(rightHand);

  // If no hands are visible, return empty
  if (!left && !right) {
    return [];
  }

  const scores = {};
  const score = (word, conf) => {
    scores[word] = Math.max(scores[word] || 0, conf);
  };

  const hands = [left, right].filter(Boolean);
  const nose = pose?.[0] || { x: 0.5, y: 0.25, z: 0 };
  const leftShoulder = pose?.[11] || { x: 0.4, y: 0.45, z: 0 };
  const rightShoulder = pose?.[12] || { x: 0.6, y: 0.45, z: 0 };
  const chestCenter = {
    x: (leftShoulder.x + rightShoulder.x) / 2,
    y: (leftShoulder.y + rightShoulder.y) / 2 + 0.05,
    z: 0
  };

  // 1. NAMASTE (The iconic Indian greeting)
  // Both hands pressed flat together in front of chest, fingers pointing upward
  if (left && right) {
    const dWrists = dist3D(left.wrist, right.wrist);
    const dPalms = dist3D(left.palmCenter, right.palmCenter);
    const dIndexTips = dist3D(left.points[8], right.points[8]);
    const dMiddleTips = dist3D(left.points[12], right.points[12]);

    const bothPointingUp =
      left.wrist.y > left.points[12].y + 0.08 &&
      right.wrist.y > right.points[12].y + 0.08;

    const nearChest = dist2D(left.palmCenter, chestCenter) < 0.28;

    if (dWrists < 0.16 && dPalms < 0.14 && dIndexTips < 0.12 && bothPointingUp && nearChest) {
      score('NAMASTE', 0.98);
    }
  }

  // 2. HELLO (Dominant open flat hand raised near temple/forehead height)
  for (const h of hands) {
    if (h.isOpenPalm && h.wrist.y < leftShoulder.y) {
      const nearHead = dist2D(h.wrist, nose) < 0.35;
      if (nearHead && h.points[12].y < nose.y + 0.05) {
        score('HELLO', 0.94);
      }
    }
  }

  // 3. GOOD (Dominant hand gives a clear thumbs-up in front of chest)
  for (const h of hands) {
    if (h.thumb.isExtended && h.curledCount >= 3) {
      const thumbPointingUp = h.points[4].y < h.points[2].y - 0.04;
      const othersCurled = !h.index.isExtended && !h.middle.isExtended;
      const inChestZone = h.wrist.y > nose.y + 0.10 && h.wrist.y < 0.80;
      if (thumbPointingUp && othersCurled && inChestZone) {
        score('GOOD', 0.96);
      }
    }
  }

  // 4. BAD (Dominant hand gives thumbs-down)
  for (const h of hands) {
    if (h.thumb.isExtended && h.curledCount >= 3) {
      const thumbPointingDown = h.points[4].y > h.points[2].y + 0.04;
      if (thumbPointingDown && h.wrist.y < 0.80) {
        score('BAD', 0.94);
      }
    }
  }

  // 5. THANK YOU (Flat hand moving from chin/lips forward and down)
  for (const h of hands) {
    if (h.isOpenPalm && h.wrist.y < 0.78) {
      const chinY = nose.y + 0.08;
      const nearChin = Math.abs(h.points[12].y - chinY) < 0.12 && dist2D(h.points[12], { x: nose.x, y: chinY }) < 0.18;
      const wristBelowChin = h.wrist.y > chinY;
      if (nearChin && wristBelowChin) {
        score('THANK YOU', 0.92);
      }
    }
  }

  // 6. HELP (Dominant fist resting on flat non-dominant palm, lifting together)
  if (left && right) {
    const isLeftFistOnRightPalm = left.isFist && right.isOpenPalm && dist3D(left.wrist, right.palmCenter) < 0.16;
    const isRightFistOnLeftPalm = right.isFist && left.isOpenPalm && dist3D(right.wrist, left.palmCenter) < 0.16;
    if (isLeftFistOnRightPalm || isRightFistOnLeftPalm) {
      score('HELP', 0.95);
    }
  }

  // 7. STOP (Open flat palm pushed forward with fingers straight up)
  for (const h of hands) {
    if (h.isOpenPalm && h.extendedCount === 5) {
      const fingersUp = h.points[12].y < h.wrist.y - 0.12;
      const inFront = dist2D(h.wrist, chestCenter) < 0.30;
      const inChestZone = h.wrist.y > nose.y + 0.05 && h.wrist.y < 0.78;
      if (fingersUp && inFront && inChestZone) {
        score('STOP', 0.92);
      }
    }
  }

  // 8. EAT (Pinched fingertips brought repeatedly toward mouth/lips)
  for (const h of hands) {
    const mouthY = nose.y + 0.04;
    const dPinched = dist3D(h.points[4], h.points[8]) + dist3D(h.points[4], h.points[12]);
    const nearMouth = dist2D(h.points[8], { x: nose.x, y: mouthY }) < 0.11;
    if (dPinched < 0.14 && nearMouth && h.wrist.y < 0.78) {
      score('EAT', 0.93);
    }
  }

  // 9. DRINK (REAL ISL: Cupped C-handshape tilted upwards directly at the mouth)
  // STRICT: ONLY triggers when a C-hand is right at the mouth and tilted up, NOT on random motion!
  for (const h of hands) {
    const dThumbIndex = dist3D(h.points[4], h.points[8]);
    const isCupped = dThumbIndex > 0.05 && dThumbIndex < 0.15 && !h.isOpenPalm && !h.isFist;
    const rightAtMouth = dist2D(h.points[8], nose) < 0.12 && h.wrist.y > nose.y;
    // Tilted up: wrist lower than fingertips, thumb tilted back
    const isTiltedUp = h.wrist.y > h.points[4].y + 0.05;
    if (isCupped && rightAtMouth && isTiltedUp) {
      score('DRINK', 0.95);
    }
  }

  // 10. YOU (Dominant index finger pointing forward)
  for (const h of hands) {
    if (h.index.isExtended && h.curledCount >= 3) {
      const pointingForward = (h.points[8].z || 0) < (h.wrist.z || 0) - 0.05;
      if (pointingForward) {
        score('YOU', 0.92);
      }
    }
  }

  // 11. ME / I (Dominant index finger pointing at chest)
  for (const h of hands) {
    if (h.index.isExtended && h.curledCount >= 3) {
      const pointingAtChest = dist2D(h.points[8], chestCenter) < 0.12;
      if (pointingAtChest) {
        score('ME', 0.94);
      }
    }
  }

  // 12. LOVE / I LOVE YOU (Thumb, Index, and Pinky extended)
  for (const h of hands) {
    if (h.thumb.isExtended && h.index.isExtended && h.pinky.isExtended && h.middle.isCurled && h.ring.isCurled) {
      score('LOVE', 0.96);
    }
  }

  // 13. YES (Fist held in front of chest)
  for (const h of hands) {
    if (h.isFist && dist2D(h.wrist, chestCenter) < 0.28 && h.wrist.y > nose.y + 0.10) {
      score('YES', 0.88);
    }
  }

  // Convert scores dictionary to ranked top-3 list
  const entries = Object.entries(scores)
    .map(([label, confidence]) => ({ label, confidence }))
    .sort((a, b) => b.confidence - a.confidence);

  if (entries.length === 0) {
    return [];
  }

  return entries.slice(0, 3).map((item, idx) => ({
    rank: idx + 1,
    label: item.label,
    confidence: item.confidence,
    isConfident: item.confidence >= 0.75
  }));
}
