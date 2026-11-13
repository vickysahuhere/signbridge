import React, { useState, useEffect, useRef } from 'react';

/**
 * Mitra the ISL Otter Mascot — Hand-Crafted 4.0-Second Studio Animation Loop
 * 
 * Cadence: Smooth 60fps/24fps native screen cadence over an exact 4.000s narrative cycle.
 * 
 * Four-Act Narrative Arc:
 * 1. 0.0s – 1.0s (p: 0.00 -> 0.25):
 *    Contented idle breathing, gentle tail harmonic swish, and sweet natural double-blink.
 * 2. 1.0s – 2.0s (p: 0.25 -> 0.50):
 *    Paws gracefully lift along an organic arc and press together in authentic ISL "Namaste"
 *    prayer, accompanied by a polite head bow, smiling eyes (^ ^), and glowing MediaPipe AI tracking reticles.
 * 3. 2.0s – 3.0s (p: 0.50 -> 0.75):
 *    Joyful celebration flourish! Body stretches with bouncy squash-and-stretch, head tilts playfully,
 *    mouth beams open in a happy smile (:D), right paw waves high in the air, and golden sparkles pop!
 * 4. 3.0s – 4.0s (p: 0.75 -> 1.00):
 *    Smooth follow-through as paws glide back down along a relaxed bezier curve, body settles with
 *    soft inertia damping, seamlessly matching p=0.0 for an infinite, gapless loop.
 */
const LOOP_DURATION_MS = 4000; // Exactly 4.000 seconds

export default function AnimatedHeroOtter({ className = 'w-14 h-14 sm:w-16 sm:h-16' }) {
  const [progress, setProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const animRef = useRef(null);
  const startTimeRef = useRef(performance.now());
  const clickOffsetRef = useRef(0);

  // Time-Accurate Native Screen Refresh Loop
  useEffect(() => {
    const tick = (now) => {
      const adjustedNow = now + clickOffsetRef.current;
      const elapsed = (adjustedNow - startTimeRef.current) % LOOP_DURATION_MS;
      setProgress(elapsed / LOOP_DURATION_MS);
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  // Click to jump straight to joyful wave celebration (at p = 0.50)
  const handleClick = () => {
    const now = performance.now();
    const currentElapsed = (now + clickOffsetRef.current - startTimeRef.current) % LOOP_DURATION_MS;
    const targetElapsed = 2000; // 2.0s in = wave start
    clickOffsetRef.current += (targetElapsed - currentElapsed);
  };

  return (
    <div
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative select-none cursor-pointer transition-transform duration-200 active:scale-90 ${
        isHovered ? 'scale-105' : ''
      } ${className}`}
      title="Mitra — ISL Otter Mascot • Click to celebrate!"
      aria-label="Mitra the ISL Otter Mascot"
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        <defs>
          {/* Ambient Warm Golden Aura */}
          <radialGradient id="artAura" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
            <stop offset="65%" stopColor="#FEF3C7" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
          </radialGradient>

          {/* Master Fur Lighting (Chestnut honey with sunlit rim highlight) */}
          <linearGradient id="artFur" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#A46B3E" />
            <stop offset="38%" stopColor="#8C542A" />
            <stop offset="100%" stopColor="#5A3112" />
          </linearGradient>

          {/* Velvety Cream Chest & Muzzle Bib */}
          <linearGradient id="artBib" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#FFFDF8" />
            <stop offset="45%" stopColor="#FFF2DC" />
            <stop offset="100%" stopColor="#F6DEC0" />
          </linearGradient>

          {/* Paw Fur Gradient */}
          <linearGradient id="pawFur" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#8C542A" />
            <stop offset="100%" stopColor="#5A3112" />
          </linearGradient>
        </defs>

        {/* Ambient Halo Glow */}
        <circle cx="60" cy="62" r="50" fill="url(#artAura)" />

        {/* 4.0-Second Master Drawn Character */}
        <ArtworkOtterCharacter p={progress} />
      </svg>
    </div>
  );
}

/**
 * Pure Vector Character Renderer:
 * Coordinates all kinematics, facial acting, paws, and AI tracking across the 4-second cycle.
 */
function ArtworkOtterCharacter({ p }) {
  // --------------------------------------------------------------------------
  // 1. KINEMATICS & ORGANIC HARMONIC CURVES
  // --------------------------------------------------------------------------

  // Idle Breathing (natural 2-cycle rhythm across 4 seconds)
  const breath = Math.sin(p * 4 * Math.PI) * 1.5;

  // Tail: Dual-frequency organic swish with smooth inertia
  const tailSway = Math.sin(p * 2 * Math.PI) * 8 + Math.cos(p * 4 * Math.PI) * 2.5;

  // Head and Body Default Coordinates
  let headY = 46 + breath * 0.5;
  let headTilt = 0;
  let bodyY = 74;
  let bodyScaleY = 1;
  let bodyScaleX = 1;

  let isNamaste = false;
  let isWaving = false;
  let isOpenSmile = false;
  let showSparkles = false;
  let isBlinking = false;
  let isSereneEyes = false;

  // Natural double-blink in Phase 1 (p: 0.135 -> 0.185: ~0.55s - 0.75s)
  if (p >= 0.135 && p <= 0.185) {
    isBlinking = true;
  }

  // Phase 2: Authentic ISL Namaste Greeting (p: 0.25 -> 0.50, 1.0s – 2.0s)
  if (p >= 0.25 && p < 0.50) {
    const subP = (p - 0.25) / 0.25; // 0.0 -> 1.0
    isNamaste = true;
    // Respectful head bow: dips downward smoothly, holds, then rises
    const bowFactor = Math.sin(subP * Math.PI);
    headY += bowFactor * 3.6;
    headTilt = Math.sin(subP * Math.PI * 2) * 1.2;

    // Peaceful smiling eyes (^ ^) during peak prayer hold
    if (subP >= 0.25 && subP <= 0.85) {
      isSereneEyes = true;
    }
  }

  // Phase 3: Joyful Wave & Celebration (p: 0.50 -> 0.75, 2.0s – 3.0s)
  if (p >= 0.50 && p < 0.75) {
    const subP = (p - 0.50) / 0.25; // 0.0 -> 1.0
    isWaving = true;
    isOpenSmile = true;
    showSparkles = true;

    // Bouncy squash & stretch
    const stretchLift = Math.sin(subP * Math.PI);
    bodyScaleY = 1 + stretchLift * 0.05;
    bodyScaleX = 1 - stretchLift * 0.03;
    bodyY = 74 - stretchLift * 3.5;
    headY = 46 - stretchLift * 4.5;
    headTilt = Math.sin(subP * 4 * Math.PI) * 3.5;
  }

  // Phase 4: Gentle Follow-Through & Settle Back (p: 0.75 -> 1.00, 3.0s – 4.0s)
  if (p >= 0.75) {
    const subP = (p - 0.75) / 0.25; // 0.0 -> 1.0
    // Decaying settle bounce
    const settleBounce = Math.sin(subP * Math.PI * 2) * Math.exp(-subP * 3) * 2;
    bodyY = 74 + settleBounce;
    headY = 46 + settleBounce * 0.6;
  }

  // --------------------------------------------------------------------------
  // 2. PAW POSITIONS & TRAJECTORIES (ORGANIC BEZIER INTERPOLATION)
  // --------------------------------------------------------------------------
  let leftPawX = 42;
  let leftPawY = 77 + breath;
  let rightPawX = 78;
  let rightPawY = 77 + breath;

  let leftPawAngle = 0;
  let rightPawAngle = 0;

  if (p < 0.25) {
    // Resting on belly / lap
    leftPawX = 42;
    leftPawY = 77 + breath;
    rightPawX = 78;
    rightPawY = 77 + breath;
  } else if (p >= 0.25 && p < 0.50) {
    // Arc upward into Namaste: paws meet in center (56, 61) & (64, 61)
    const subP = (p - 0.25) / 0.25;
    const tEase = easeInOutCubic(subP);
    leftPawX = 42 + (56 - 42) * tEase;
    leftPawY = 77 + (61 - 77) * tEase;
    rightPawX = 78 + (64 - 78) * tEase;
    rightPawY = 77 + (61 - 77) * tEase;

    // Tilt inward to face palms together
    leftPawAngle = tEase * 18;
    rightPawAngle = -tEase * 18;
  } else if (p >= 0.50 && p < 0.75) {
    // Left paw open outward (36, 56), right paw waving up high (84, 40)
    const subP = (p - 0.50) / 0.25;
    const waveCycle = Math.sin(subP * 6 * Math.PI) * 5;

    leftPawX = 36;
    leftPawY = 56;
    leftPawAngle = -22;

    rightPawX = 84 + waveCycle;
    rightPawY = 40 - Math.abs(waveCycle) * 0.4;
    rightPawAngle = waveCycle * 4 + 20;
  } else {
    // Glide gently back down to belly
    const subP = (p - 0.75) / 0.25;
    const tEase = easeInOutCubic(subP);

    leftPawX = 36 + (42 - 36) * tEase;
    leftPawY = 56 + (77 - 56) * tEase;
    leftPawAngle = -22 * (1 - tEase);

    rightPawX = 84 + (78 - 84) * tEase;
    rightPawY = 40 + (77 - 40) * tEase;
    rightPawAngle = 20 * (1 - tEase);
  }

  // Arm Shoulder Anchor Points
  const leftShoulderX = 40;
  const leftShoulderY = 64 + (bodyY - 74);
  const rightShoulderX = 80;
  const rightShoulderY = 64 + (bodyY - 74);

  // Arm Paths with Natural Elbow Midpoints
  const leftElbowX = (leftShoulderX + leftPawX) / 2 - 4;
  const leftElbowY = (leftShoulderY + leftPawY) / 2 + 2;
  const leftArmD = `M ${leftShoulderX} ${leftShoulderY} Q ${leftElbowX} ${leftElbowY} ${leftPawX} ${leftPawY}`;

  const rightElbowX = (rightShoulderX + rightPawX) / 2 + 4;
  const rightElbowY = (rightShoulderY + rightPawY) / 2 + 2;
  const rightArmD = `M ${rightShoulderX} ${rightShoulderY} Q ${rightElbowX} ${rightElbowY} ${rightPawX} ${rightPawY}`;

  return (
    <g id="mitra-master-character">
      {/* 1. Curved Otter Tail (Behind Body) */}
      <g transform={`rotate(${tailSway} 80 86)`}>
        {/* Tail Outline */}
        <path
          d="M 80 86 C 96 88, 108 93, 110 101 C 111 107, 104 110, 94 107 C 85 104, 78 96, 76 90 Z"
          fill="#18181B"
        />
        {/* Tail Fur */}
        <path
          d="M 80 84 C 96 86, 108 91, 110 99 C 111 105, 104 108, 94 105 C 85 102, 78 94, 76 88 Z"
          fill="#5A3112"
          stroke="#18181B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
      </g>

      {/* 2. Plump Seated Otter Torso */}
      <g transform={`translate(60, ${bodyY}) scale(${bodyScaleX}, ${bodyScaleY}) translate(-60, -74)`}>
        {/* Torso Outline */}
        <ellipse cx="60" cy="76" rx="34" ry="27" fill="#18181B" />
        {/* Main Fur Torso */}
        <ellipse cx="60" cy="74" rx="33" ry="26" fill="url(#artFur)" stroke="#18181B" strokeWidth="2.4" />

        {/* Cream Belly & Chest Fur (Soft Pear Bib) */}
        <path
          d="M 46 64 C 46 58, 74 58, 74 64 C 80 73, 78 87, 72 93 C 66 97, 54 97, 48 93 C 42 87, 40 73, 46 64 Z"
          fill="url(#artBib)"
          stroke="#18181B"
          strokeWidth="1.8"
          strokeLinejoin="round"
        />
        {/* Belly Fur Textures */}
        <path d="M 56 82 C 58 84, 62 84, 64 82" stroke="#E2BF95" strokeWidth="1.4" strokeLinecap="round" fill="none" />
      </g>

      {/* 3. Arms connecting shoulders to wrists (Outlines FIRST, fur ON TOP) */}
      {/* Left Arm Outline */}
      <path
        d={leftArmD}
        stroke="#18181B"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left Arm Fur */}
      <path
        d={leftArmD}
        stroke="url(#pawFur)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* Right Arm Outline */}
      <path
        d={rightArmD}
        stroke="#18181B"
        strokeWidth="9"
        strokeLinecap="round"
        fill="none"
      />
      {/* Right Arm Fur */}
      <path
        d={rightArmD}
        stroke="url(#pawFur)"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
      />

      {/* 4. Expressive Otter Head */}
      <g transform={`translate(0, ${headY - 46}) rotate(${headTilt} 60 46)`}>
        {/* Head Outline */}
        <ellipse cx="60" cy="48" rx="28" ry="23" fill="#18181B" />
        {/* Head Fur */}
        <ellipse cx="60" cy="46" rx="27" ry="22" fill="url(#artFur)" stroke="#18181B" strokeWidth="2.4" />

        {/* Cute Rounded Otter Ears with Inertia Twitch */}
        <g>
          {/* Left Ear */}
          <circle cx="36" cy="38" r="6" fill="#7A451E" stroke="#18181B" strokeWidth="2" />
          <circle cx="36" cy="38" r="3.5" fill="#FCE2C4" />
          {/* Right Ear */}
          <circle cx="84" cy="38" r="6" fill="#7A451E" stroke="#18181B" strokeWidth="2" />
          <circle cx="84" cy="38" r="3.5" fill="#FCE2C4" />
        </g>

        {/* Broad Cream Muzzle */}
        <path
          d="M 46 51 C 46 43, 54 41, 60 44 C 66 41, 74 43, 74 51 C 76 60, 68 64, 60 64 C 52 64, 44 60, 46 51 Z"
          fill="url(#artBib)"
          stroke="#18181B"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Rosy Blushing Cheeks */}
        <ellipse cx="44" cy="53" rx="4.5" ry="3.5" fill="#FFA58C" opacity="0.85" />
        <ellipse cx="76" cy="53" rx="4.5" ry="3.5" fill="#FFA58C" opacity="0.85" />

        {/* Glossy Button Nose */}
        <path
          d="M 56 48 C 56 45, 64 45, 64 48 C 64 51, 61 53, 60 53 C 59 53, 56 51, 56 48 Z"
          fill="#1F1713"
          stroke="#18181B"
          strokeWidth="1.6"
        />
        <circle cx="58.5" cy="47" r="1" fill="#FFFFFF" opacity="0.9" />

        {/* Cheerful Mouth Rendering */}
        {isOpenSmile ? (
          // Joyful Open Anime Smile (:D) with cute tongue
          <g>
            <path
              d="M 54 53 Q 60 61 66 53 Z"
              fill="#EF4444"
              stroke="#18181B"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            {/* Tongue */}
            <path
              d="M 56 57 Q 60 55 64 57 Q 60 60 56 57 Z"
              fill="#F87171"
            />
          </g>
        ) : (
          // Classic Sweet Smile
          <>
            <path d="M 60 53 L 60 55" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
            <path
              d="M 55 55 C 57 57.5, 60 57.5, 60 55 C 60 57.5, 63 57.5, 65 55"
              stroke="#18181B"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </>
        )}

        {/* Cute Whiskers */}
        <path d="M 48 53 L 38 52" stroke="#4A260F" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
        <path d="M 48 56 L 39 58" stroke="#4A260F" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
        <path d="M 72 53 L 82 52" stroke="#4A260F" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />
        <path d="M 72 56 L 81 58" stroke="#4A260F" strokeWidth="1.1" strokeLinecap="round" opacity="0.85" />

        {/* Eyes (Naturally Keyframed) */}
        {isBlinking ? (
          // Natural Curved Eyelash Blink
          <>
            <path d="M 47 43 Q 51 46 55 43" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M 65 43 Q 69 46 73 43" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </>
        ) : isSereneEyes ? (
          // Respectful Namaste Smiling Eyes (^ ^)
          <>
            <path d="M 47 44 Q 51 40 55 44" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
            <path d="M 65 44 Q 69 40 73 44" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" fill="none" />
          </>
        ) : (
          // Sparkling Wide Expressive Anime Eyes
          <>
            {/* Left Eye */}
            <ellipse cx="51" cy="42" rx="5" ry="6.5" fill="#18181B" />
            <circle cx="49.5" cy="40" r="2.2" fill="#FFFFFF" />
            <circle cx="52.5" cy="44.5" r="1.1" fill="#FFFFFF" />
            {/* Right Eye */}
            <ellipse cx="69" cy="42" rx="5" ry="6.5" fill="#18181B" />
            <circle cx="67.5" cy="40" r="2.2" fill="#FFFFFF" />
            <circle cx="70.5" cy="44.5" r="1.1" fill="#FFFFFF" />
          </>
        )}
      </g>

      {/* 5. Authentic Otter Paws (With Cream Paw Pads & Digits) */}
      {isNamaste ? (
        // Authentic Namaste Gesture: Two paws pressed together flat in center
        <g id="namaste-paws" className="animate-in fade-in duration-100">
          {/* Subtle warm prayer shadow */}
          <ellipse cx="60" cy="62" rx="10" ry="8" fill="#18181B" opacity="0.15" />
          {/* Left pressed paw */}
          <g transform={`translate(${leftPawX}, ${leftPawY}) rotate(${leftPawAngle})`}>
            <ellipse cx="0" cy="0" rx="5.5" ry="7" fill="#FFEAD8" stroke="#18181B" strokeWidth="2" />
            <ellipse cx="-1" cy="0" rx="3" ry="4.5" fill="#FCE2C4" />
            {/* Fingers pointing upward */}
            <circle cx="-1" cy="-6" r="1.4" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
            <circle cx="1.5" cy="-5" r="1.4" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
          </g>
          {/* Right pressed paw */}
          <g transform={`translate(${rightPawX}, ${rightPawY}) rotate(${rightPawAngle})`}>
            <ellipse cx="0" cy="0" rx="5.5" ry="7" fill="#FFEAD8" stroke="#18181B" strokeWidth="2" />
            <ellipse cx="1" cy="0" rx="3" ry="4.5" fill="#FCE2C4" />
            {/* Fingers pointing upward */}
            <circle cx="1" cy="-6" r="1.4" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
            <circle cx="-1.5" cy="-5" r="1.4" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
          </g>
        </g>
      ) : (
        // Standard / Waving Paws
        <>
          {/* Left Paw */}
          <g transform={`translate(${leftPawX}, ${leftPawY}) rotate(${leftPawAngle})`}>
            <ellipse cx="0" cy="0" rx="6.5" ry="5.5" fill="#FFEAD8" stroke="#18181B" strokeWidth="2" />
            <ellipse cx="0" cy="0.5" rx="3.5" ry="3" fill="#FCE2C4" />
            <circle cx="-3" cy="-3.5" r="1.3" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
            <circle cx="0" cy="-4.5" r="1.3" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
            <circle cx="3" cy="-3.5" r="1.3" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
          </g>
          {/* Right Paw */}
          <g transform={`translate(${rightPawX}, ${rightPawY}) rotate(${rightPawAngle})`}>
            <ellipse cx="0" cy="0" rx="6.5" ry="5.5" fill="#FFEAD8" stroke="#18181B" strokeWidth="2" />
            <ellipse cx="0" cy="0.5" rx="3.5" ry="3" fill="#FCE2C4" />
            <circle cx="-3" cy="-3.5" r="1.3" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
            <circle cx="0" cy="-4.5" r="1.3" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
            <circle cx="3" cy="-3.5" r="1.3" fill="#FFEAD8" stroke="#18181B" strokeWidth="1" />
          </g>
        </>
      )}

      {/* 6. MediaPipe AI Landmark Nodes (Pulsing during Namaste Gesture) */}
      {isNamaste && (
        <g id="ai-namaste-overlay" className="animate-in fade-in duration-200">
          {/* Soft Glowing Green Connection Line between Wrists */}
          <line
            x1={leftPawX}
            y1={leftPawY}
            x2={rightPawX}
            y2={rightPawY}
            stroke="#22C55E"
            strokeWidth="1.8"
            strokeDasharray="2 2"
          />
          {/* Tracking Hub Nodes */}
          <circle cx={leftPawX} cy={leftPawY} r="3" fill="#22C55E" stroke="#18181B" strokeWidth="1.2" />
          <circle cx={rightPawX} cy={rightPawY} r="3" fill="#22C55E" stroke="#18181B" strokeWidth="1.2" />

          {/* Golden Knuckle Hub Nodes */}
          <circle cx={leftPawX + 3} cy={leftPawY - 4} r="2.2" fill="#FFC800" stroke="#18181B" strokeWidth="1" />
          <circle cx={rightPawX - 3} cy={rightPawY - 4} r="2.2" fill="#FFC800" stroke="#18181B" strokeWidth="1" />

          {/* Fingertip Target Reticle */}
          <circle cx="60" cy={leftPawY - 7} r="5" stroke="#38BDF8" strokeWidth="1.4" strokeDasharray="2 2" />
          <circle cx="60" cy={leftPawY - 7} r="2.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="60" cy={leftPawY - 7} r="1.2" fill="#FFFFFF" />
        </g>
      )}

      {/* 7. Golden Achievement Sparkles (Blooming during Joyful Wave) */}
      {showSparkles && (
        <g id="celebration-sparkles" className="animate-in fade-in zoom-in duration-150">
          {/* Top Left Golden Star */}
          <g transform="translate(22, 20)">
            <path d="M5 0 L6.2 3.8 L10 5 L6.2 6.2 L5 10 L3.8 6.2 L0 5 L3.8 3.8 Z" fill="#FFC800" />
          </g>
          {/* Top Right Emerald Star */}
          <g transform="translate(94, 18)">
            <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#58CC02" />
          </g>
          {/* Middle Cyan Star */}
          <g transform="translate(98, 60)">
            <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#38BDF8" />
          </g>
        </g>
      )}
    </g>
  );
}

/**
 * Standard cubic ease-in-out for silky smooth organic character interpolation
 */
function easeInOutCubic(x) {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}
