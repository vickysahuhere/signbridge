import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Heart, Sparkles, Star, Hand } from 'lucide-react';

/**
 * AnimatedOtterBar
 * 
 * Clean, minimal animated otter mascot traversing the bottom bar on the Home page.
 * Features frame-by-frame body part animation:
 *  - 4-frame walking trot: paws & webbed feet alternate, tail wags, body bobs
 *  - 4-frame ISL waving paw (arm & paw wave side-to-side, head tilts)
 *  - 4-frame ISL Namaste prayer (paws press together, head bows with green touchpoint aura)
 *  - 4-frame back-floating (paddling feet, breathing tummy, holding golden star)
 *  - 5-frame somersault tumble (tucks, rolls 360°, and lands)
 *  - Natural periodic eye blinking
 *  - Zero background path lines or word clutter
 */
export function AnimatedOtterBar() {
  const otterElRef = useRef(null);
  const posXRef = useRef(14);
  const [direction, setDirection] = useState(1); // 1 = right, -1 = left
  const [currentAction, setCurrentAction] = useState('walk'); // 'walk' | 'namaste' | 'wave' | 'float' | 'roll' | 'happy'
  const [frame, setFrame] = useState(0); // 0, 1, 2, 3 frame sequence
  const [isBlinking, setIsBlinking] = useState(false);
  const [bubble, setBubble] = useState(null);

  const animFrameRef = useRef(null);
  const lastTimeRef = useRef(Date.now());
  const pauseUntilRef = useRef(0);
  const isInteractingRef = useRef(false);
  const lastMidStrollCheckRef = useRef(Date.now());

  // Frame ticker for body parts animation
  useEffect(() => {
    let frameRate = 130; // ms per frame for walking trot
    if (currentAction === 'wave') frameRate = 150;
    else if (currentAction === 'namaste') frameRate = 350;
    else if (currentAction === 'float') frameRate = 400;
    else if (currentAction === 'roll') frameRate = 120;

    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, frameRate);

    return () => clearInterval(interval);
  }, [currentAction]);

  // Periodic natural eye blinking (every 3.5s)
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true);
      setTimeout(() => setIsBlinking(false), 160);
    }, 3800);

    return () => clearInterval(blinkInterval);
  }, []);

  // Switch action randomly when pausing at boundaries or strolling
  const triggerNextAction = useCallback(() => {
    const actions = ['namaste', 'wave', 'float', 'roll'];
    const chosen = actions[Math.floor(Math.random() * actions.length)];
    setCurrentAction(chosen);
    setFrame(0);

    if (chosen === 'namaste') setBubble('namaste');
    else if (chosen === 'wave') setBubble('wave');
    else if (chosen === 'float') setBubble('star');
    else if (chosen === 'roll') setBubble('sparkle');

    const duration = chosen === 'roll' ? 1600 : chosen === 'float' ? 3200 : 2600;
    pauseUntilRef.current = Date.now() + duration;

    setTimeout(() => {
      setBubble(null);
      setCurrentAction('walk');
    }, duration);
  }, []);

  // Main smooth horizontal walking loop using direct DOM transform to eliminate 60fps React re-renders
  useEffect(() => {
    lastTimeRef.current = Date.now();

    const updatePosition = () => {
      const now = Date.now();
      const delta = Math.min((now - lastTimeRef.current) / 1000, 0.1);
      lastTimeRef.current = now;

      if (!isInteractingRef.current && now > pauseUntilRef.current) {
        const speed = 7.5; // % per second
        let nextX = posXRef.current + direction * speed * delta;

        if (nextX >= 88) {
          nextX = 88;
          setDirection(-1);
          triggerNextAction();
        } else if (nextX <= 8) {
          nextX = 8;
          setDirection(1);
          triggerNextAction();
        } else {
          // Check for periodic pause mid-bar (only once every 7s with controlled probability)
          if (now - lastMidStrollCheckRef.current > 7000) {
            lastMidStrollCheckRef.current = now;
            if (Math.random() < 0.40 && now > pauseUntilRef.current + 5000) {
              triggerNextAction();
            }
          }
        }

        posXRef.current = nextX;
        if (otterElRef.current) {
          otterElRef.current.style.left = `${nextX}%`;
        }
      }

      animFrameRef.current = requestAnimationFrame(updatePosition);
    };

    animFrameRef.current = requestAnimationFrame(updatePosition);
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [direction, triggerNextAction]);

  // Interactive click on otter
  const handleOtterClick = useCallback(() => {
    setCurrentAction('happy');
    setBubble('heart');
    pauseUntilRef.current = Date.now() + 1600;

    setTimeout(() => {
      setBubble(null);
      setCurrentAction('walk');
    }, 1600);
  }, []);

  return (
    <div className="w-full h-full relative overflow-hidden flex items-center select-none pointer-events-auto">
      {/* Otter Mascot Element */}
      <div
        ref={otterElRef}
        className="absolute top-1/2 -translate-y-1/2 transition-transform cursor-pointer select-none"
        style={{
          left: `${posXRef.current}%`,
          transform: `translate(-50%, -50%) scaleX(${currentAction === 'float' ? 1 : direction})`,
          transition: currentAction === 'walk' ? 'none' : 'transform 0.25s ease-out'
        }}
        onClick={handleOtterClick}
        title="Mitra the ISL Otter (Click me!)"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') handleOtterClick();
        }}
      >
        {/* Floating Bubble */}
        {bubble && (
          <div
            className="absolute -top-3.5 left-1/2 -translate-x-1/2 leading-none animate-bounce pointer-events-none z-10"
            style={{ transform: `scaleX(${direction})` }}
          >
            <span className="bg-white/95 p-1 rounded-full border border-zinc-200 shadow-xs inline-flex items-center justify-center">
              {bubble === 'namaste' && <Hand className="w-2.5 h-2.5 text-amber-600 fill-amber-600" />}
              {bubble === 'wave' && <Hand className="w-2.5 h-2.5 text-amber-500 stroke-[2.5]" />}
              {bubble === 'star' && <Star className="w-2.5 h-2.5 text-amber-400 fill-amber-400" />}
              {bubble === 'sparkle' && <Sparkles className="w-2.5 h-2.5 text-emerald-500 fill-emerald-500" />}
              {bubble === 'heart' && <Heart className="w-2.5 h-2.5 text-rose-500 fill-rose-500" />}
            </span>
          </div>
        )}

        {/* Dynamic Otter SVG */}
        <div
          className={`relative transition-all duration-200 ${
            currentAction === 'roll' ? 'animate-spin' : ''
          } ${currentAction === 'happy' ? '-translate-y-1 scale-110' : ''}`}
        >
          <OtterMultiFrameSvg
            action={currentAction}
            frame={frame}
            isBlinking={isBlinking}
          />
        </div>
      </div>
    </div>
  );
}

/**
 * OtterMultiFrameSvg
 * Frame-by-frame vector otter mascot with articulating paws, feet, head, ears, and tail.
 */
function OtterMultiFrameSvg({ action = 'walk', frame = 0, isBlinking = false }) {
  // 1. Walking Trot Cycle: 4 Distinct Frames of Leg/Paw/Tail Positions
  // Frame 0: Back-left forward, Front-right forward, Tail up
  // Frame 1: Mid-stride rise (body rises 1px), feet pass center, Tail mid
  // Frame 2: Back-right forward, Front-left forward, Tail down
  // Frame 3: Mid-stride descent, Tail mid
  const walkBobY = action === 'walk' ? (frame === 1 ? -1.2 : frame === 3 ? 0.3 : 0) : 0;

  // Tail geometry per frame
  let tailD = 'M 14 18 C 7 19, 1 21, -1 19 C -2 17, 5 15, 12 16 Z'; // mid
  if (action === 'walk') {
    if (frame === 0) tailD = 'M 14 17 C 7 18, 1 25, 0 23 C -1 20, 5 14, 12 14 Z'; // up
    else if (frame === 2) tailD = 'M 14 19 C 8 21, 2 17, 0 15 C 0 13, 6 16, 13 18 Z'; // down
  }

  // Back feet positions per frame
  let backFoot1X = 16;
  let backFoot1Y = 25;
  let backFoot2X = 26;
  let backFoot2Y = 25;
  if (action === 'walk') {
    if (frame === 0) {
      backFoot1X = 13.5; backFoot1Y = 25.5;
      backFoot2X = 28; backFoot2Y = 24.5;
    } else if (frame === 1) {
      backFoot1X = 16; backFoot1Y = 24;
      backFoot2X = 25.5; backFoot2Y = 25;
    } else if (frame === 2) {
      backFoot1X = 18.5; backFoot1Y = 24.5;
      backFoot2X = 23; backFoot2Y = 25.5;
    } else if (frame === 3) {
      backFoot1X = 16; backFoot1Y = 25;
      backFoot2X = 25; backFoot2Y = 24;
    }
  }

  // Front paws positions per frame
  let frontPaw1X = 30;
  let frontPaw1Y = 22;
  let frontPaw2X = 34;
  let frontPaw2Y = 23;
  if (action === 'walk') {
    if (frame === 0) {
      frontPaw1X = 28; frontPaw1Y = 21.5;
      frontPaw2X = 35.5; frontPaw2Y = 24;
    } else if (frame === 1) {
      frontPaw1X = 30; frontPaw1Y = 22.5;
      frontPaw2X = 33; frontPaw2Y = 22.5;
    } else if (frame === 2) {
      frontPaw1X = 34; frontPaw1Y = 24;
      frontPaw2X = 28.5; frontPaw2Y = 21.5;
    } else if (frame === 3) {
      frontPaw1X = 31; frontPaw1Y = 22.5;
      frontPaw2X = 30.5; frontPaw2Y = 22.5;
    }
  }

  // Head bob & tilt
  let headY = 12 + walkBobY;
  let headAngle = 0;
  if (action === 'wave') {
    headAngle = frame % 2 === 0 ? 3 : -3;
  } else if (action === 'namaste') {
    headY = frame === 2 ? 13.5 : 12; // gentle bow down
  }

  return (
    <svg
      width="44"
      height="26"
      viewBox="0 0 54 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="overflow-visible filter drop-shadow-[0_1px_1.5px_rgba(0,0,0,0.12)]"
    >
      <defs>
        {/* Rich otter chocolate coat */}
        <linearGradient id="otterFurGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#8C4F27" />
          <stop offset="60%" stopColor="#753F1C" />
          <stop offset="100%" stopColor="#542B10" />
        </linearGradient>

        {/* Soft cream muzzle & chest */}
        <linearGradient id="otterBibGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="100%" stopColor="#F5DEC2" />
        </linearGradient>
      </defs>

      {/* =========================================================
          ACTION POSE: BACK-FLOATING (belly up, holding star)
          ========================================================= */}
      {action === 'float' ? (
        <g transform="translate(2, 6)">
          {/* Paddling Tail */}
          <path
            d={frame % 2 === 0
              ? 'M 4 10 C 1 12, -2 16, -4 14 C -5 12, -3 9, 2 8 Z'
              : 'M 4 9 C 1 10, -3 13, -4 12 C -5 11, -3 8, 2 8 Z'
            }
            fill="#542B10"
            stroke="#18181B"
            strokeWidth="1.2"
          />

          {/* Floating Body (with gentle breathing tummy rise) */}
          <ellipse
            cx="22"
            cy={frame === 1 || frame === 2 ? 10.5 : 11}
            rx="17"
            ry={frame === 1 || frame === 2 ? 7.3 : 6.8}
            fill="url(#otterFurGrad)"
            stroke="#18181B"
            strokeWidth="1.3"
          />
          <ellipse cx="22" cy="10" rx="12" ry="4.5" fill="url(#otterBibGrad)" />

          {/* Otter Head resting on water */}
          <ellipse cx="39" cy="9" rx="8" ry="6.5" fill="url(#otterFurGrad)" stroke="#18181B" strokeWidth="1.3" />
          <ellipse cx="40" cy="8.5" rx="5" ry="4" fill="url(#otterBibGrad)" />

          {/* Rounded Ear */}
          <ellipse cx="37" cy="4" rx="2" ry="1.6" fill="#753F1C" stroke="#18181B" strokeWidth="1" />

          {/* Eyes: Contented "^" curve */}
          <path d="M 37 8 Q 39 6.5 41 8" stroke="#18181B" strokeWidth="1.1" strokeLinecap="round" fill="none" />

          {/* Button nose */}
          <ellipse cx="43.5" cy="8" rx="1.3" ry="1" fill="#18181B" />

          {/* Alternating Paddling Back Feet */}
          <ellipse
            cx="9"
            cy={frame === 0 || frame === 1 ? 16 : 14.5}
            rx="3.5"
            ry="2"
            fill="#542B10"
            stroke="#18181B"
            strokeWidth="1"
          />
          <ellipse
            cx="15"
            cy={frame === 2 || frame === 3 ? 16.2 : 14.8}
            rx="3.5"
            ry="2"
            fill="#542B10"
            stroke="#18181B"
            strokeWidth="1"
          />

          {/* Front Paws holding Golden Star */}
          <g transform={`translate(23, ${frame === 1 || frame === 2 ? 6.5 : 7.2})`}>
            <ellipse cx="0" cy="0" rx="2.2" ry="3" fill="#542B10" stroke="#18181B" strokeWidth="0.9" />
            <ellipse cx="5" cy="0" rx="2.2" ry="3" fill="#542B10" stroke="#18181B" strokeWidth="0.9" />
            {/* Golden Star with glint */}
            <path
              d="M 2.5 -3.2 L 3.3 -1.5 L 5.2 -1.2 L 3.8 0.1 L 4.2 1.9 L 2.5 1 L 0.8 1.9 L 1.2 0.1 L -0.2 -1.2 L 1.7 -1.5 Z"
              fill="#FACC15"
              stroke="#B45309"
              strokeWidth="0.6"
            />
          </g>
        </g>
      ) : (
        /* =========================================================
           ACTION POSES: WALK / WAVING / NAMASTE
           ========================================================= */
        <g>
          {/* Swishing Tail */}
          <path d={tailD} fill="#542B10" stroke="#18181B" strokeWidth="1.3" strokeLinejoin="round" />

          {/* Back Left Foot */}
          <ellipse cx={backFoot1X} cy={backFoot1Y} rx="4.5" ry="2.6" fill="#542B10" stroke="#18181B" strokeWidth="1.2" />

          {/* Plump Otter Body */}
          <ellipse
            cx="24"
            cy={18 + walkBobY}
            rx="12"
            ry="9"
            fill="url(#otterFurGrad)"
            stroke="#18181B"
            strokeWidth="1.3"
          />

          {/* Cream Chest Fur */}
          <path
            d={`M 22 ${13 + walkBobY} C 27 ${13 + walkBobY}, 31 ${16 + walkBobY}, 31 ${20 + walkBobY} C 31 ${23 + walkBobY}, 27 ${24 + walkBobY}, 23 ${24 + walkBobY} C 19 ${24 + walkBobY}, 18 ${20 + walkBobY}, 18 ${16 + walkBobY} Z`}
            fill="url(#otterBibGrad)"
            stroke="#18181B"
            strokeWidth="0.9"
          />

          {/* Back Right Foot */}
          <ellipse cx={backFoot2X} cy={backFoot2Y} rx="4.5" ry="2.6" fill="#542B10" stroke="#18181B" strokeWidth="1.2" />

          {/* Otter Head Group (supports bobs and tilts) */}
          <g transform={`rotate(${headAngle} 36 ${headY})`}>
            {/* Otter Head */}
            <ellipse cx="36" cy={headY} rx="9" ry="8" fill="url(#otterFurGrad)" stroke="#18181B" strokeWidth="1.3" />

            {/* Ear with inner peach */}
            <ellipse
              cx="31"
              cy={headY - 6}
              rx={frame === 1 || frame === 3 ? 2.3 : 2.5}
              ry="2"
              fill="#753F1C"
              stroke="#18181B"
              strokeWidth="1"
            />
            <ellipse cx="31.2" cy={headY - 6} rx="1.2" ry="1" fill="#F5DEC2" />

            {/* Cream Muzzle */}
            <ellipse cx="40" cy={headY + 1.5} rx="5" ry="4" fill="url(#otterBibGrad)" stroke="#18181B" strokeWidth="1" />

            {/* Rosy Cheek Blush */}
            <circle cx="36" cy={headY + 2} r="1.5" fill="#F87171" opacity="0.8" />

            {/* Expressive Eye (Open or Blinking) */}
            {isBlinking || action === 'happy' ? (
              /* Curved closed happy/blink line */
              <path
                d={`M 36.5 ${headY - 1.5} Q 38.5 ${headY - 3.5} 40.5 ${headY - 1.5}`}
                stroke="#18181B"
                strokeWidth="1.3"
                strokeLinecap="round"
                fill="none"
              />
            ) : (
              /* Sparkling dark eye */
              <g>
                <ellipse cx="38" cy={headY - 2} rx="2.6" ry="3" fill="#FFFFFF" stroke="#18181B" strokeWidth="1" />
                <ellipse cx="38.5" cy={headY - 2} rx="1.8" ry="2" fill="#18181B" />
                <circle cx="37.8" cy={headY - 2.8} r="0.8" fill="#FFFFFF" />
              </g>
            )}

            {/* Button Nose */}
            <ellipse cx="43.5" cy={headY + 0.5} rx="1.4" ry="1.1" fill="#18181B" />
            <circle cx="43.2" cy={headY + 0.2} r="0.4" fill="#FFFFFF" />

            {/* Smile */}
            <path
              d={`M 40.5 ${headY + 2.5} Q 42 ${headY + 4} 43.5 ${headY + 2.5}`}
              stroke="#18181B"
              strokeWidth="0.9"
              strokeLinecap="round"
              fill="none"
            />

            {/* Whiskers */}
            <path d={`M 42 ${headY + 2} L 46 ${headY + 1}`} stroke="#4A260F" strokeWidth="0.7" strokeLinecap="round" opacity="0.8" />
            <path d={`M 42 ${headY + 3} L 46 ${headY + 4}`} stroke="#4A260F" strokeWidth="0.7" strokeLinecap="round" opacity="0.8" />
          </g>

          {/* Front Paws / Arms */}
          {action === 'namaste' ? (
            /* ISL Namaste Prayer Paws with gentle bow */
            <g transform={`translate(32, ${frame === 2 ? 15 : 14})`}>
              <ellipse cx="0" cy="0" rx="2.4" ry="3.8" fill="#542B10" stroke="#18181B" strokeWidth="1" />
              <ellipse cx="3" cy="-0.5" rx="2.4" ry="3.8" fill="#542B10" stroke="#18181B" strokeWidth="1" />
              {/* Pressed prayer palms */}
              <ellipse cx="1.5" cy="-2.5" rx="1.8" ry="2.2" fill="#F5DEC2" stroke="#18181B" strokeWidth="0.8" />
              {/* Green ISL touchpoint halo pulse */}
              <circle cx="1.5" cy="-2.5" r={frame === 2 ? 4.5 : 3.5} stroke="#22C55E" strokeWidth="0.7" strokeDasharray="1.5 1.5" opacity={frame === 2 ? 1 : 0.6} />
            </g>
          ) : action === 'wave' ? (
            /* Animated Waving Paw (4 discrete waving angles) */
            <g>
              {/* Left resting paw */}
              <ellipse cx="26" cy="19" rx="3" ry="2.2" fill="#542B10" stroke="#18181B" strokeWidth="1" />

              {/* Waving Paw articulating across frames */}
              <g
                transform={`rotate(${
                  frame === 0 ? 18 : frame === 1 ? 0 : frame === 2 ? -18 : 0
                } 32 16)`}
              >
                <path d="M 31 16 Q 34 9 36 6" stroke="#542B10" strokeWidth="3.2" strokeLinecap="round" />
                <circle cx="36" cy="5.5" r="2.2" fill="#F5DEC2" stroke="#18181B" strokeWidth="0.9" />
              </g>
            </g>
          ) : (
            /* Walking Front Paws alternating */
            <>
              <ellipse cx={frontPaw1X} cy={frontPaw1Y} rx="3.4" ry="2.4" fill="#542B10" stroke="#18181B" strokeWidth="1.1" />
              <ellipse cx={frontPaw2X} cy={frontPaw2Y} rx="3.4" ry="2.4" fill="#542B10" stroke="#18181B" strokeWidth="1.1" />
            </>
          )}
        </g>
      )}
    </svg>
  );
}

export default AnimatedOtterBar;
