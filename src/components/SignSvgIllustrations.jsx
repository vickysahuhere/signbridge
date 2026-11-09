import React from 'react';

/**
 * High-Contrast, Cartoon Neo-Brutalist Vector SVG Illustrations for ISL Signs & Letters.
 * Crisp black strokes (2.5px), sunny yellow accents (#FFD15C), mint greens (#22C55E),
 * and dynamic motion arrows matching the Sanket design language.
 */

export function SignSvgIllustration({ signId, className = 'w-full h-full' }) {
  const normalizedId = (signId || '').toLowerCase().replace(/[\s_-]+/g, '_');

  switch (normalizedId) {
    case 'namaste':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          {/* Subtle prayer glow aura */}
          <circle cx="120" cy="100" r="82" fill="#FFD15C" fillOpacity="0.18" />
          <circle cx="120" cy="100" r="64" stroke="#FFD15C" strokeWidth="2" strokeDasharray="6 6" />

          {/* Left Hand (mirrored view) */}
          <g transform="translate(10, 0)">
            <path
              d="M100 160 C92 145 88 120 90 95 C91 80 94 65 98 48 C99 42 104 42 106 48 C108 55 110 70 110 88 L110 160 Z"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Thumb */}
            <path
              d="M90 120 C82 120 74 130 76 142 C78 152 86 156 94 156"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="2.5"
            />
          </g>

          {/* Right Hand */}
          <g transform="translate(-10, 0)">
            <path
              d="M140 160 C148 145 152 120 150 95 C149 80 146 65 142 48 C141 42 136 42 134 48 C132 55 130 70 130 88 L130 160 Z"
              fill="#FFD15C"
              stroke="#18181B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Thumb */}
            <path
              d="M150 120 C158 120 166 130 164 142 C162 152 154 156 146 156"
              fill="#FFD15C"
              stroke="#18181B"
              strokeWidth="2.5"
            />
          </g>

          {/* Center Seam of Palms Pressed Together */}
          <line x1="120" y1="52" x2="120" y2="160" stroke="#18181B" strokeWidth="3" strokeLinecap="round" />

          {/* Upward Energy Motion Arrows */}
          <path d="M120 40 L120 22 M114 28 L120 22 L126 28" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M78 80 C86 86 96 90 106 90" stroke="#18181B" strokeWidth="2" strokeDasharray="3 3" />
          <path d="M162 80 C154 86 144 90 134 90" stroke="#18181B" strokeWidth="2" strokeDasharray="3 3" />
        </svg>
      );

    case 'hello':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#38BDF8" fillOpacity="0.14" />
          {/* Head contour reference */}
          <circle cx="70" cy="115" r="35" stroke="#D4CEBF" strokeWidth="2" strokeDasharray="4 4" fill="#FAF8F5" />
          <text x="60" y="120" fill="#A8A190" fontSize="12" fontWeight="bold">HEAD</text>

          {/* Waving Open Hand */}
          <g transform="translate(110, 40) rotate(12)">
            {/* Palm */}
            <path
              d="M20 70 C20 45 35 40 50 40 C65 40 80 45 80 70 L75 110 C75 118 68 125 50 125 C32 125 25 118 25 110 Z"
              fill="#FFD15C"
              stroke="#18181B"
              strokeWidth="2.5"
            />
            {/* 4 Extended Fingers */}
            <rect x="25" y="10" width="10" height="40" rx="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <rect x="38" y="5" width="10" height="45" rx="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <rect x="51" y="8" width="10" height="42" rx="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <rect x="64" y="16" width="10" height="34" rx="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            {/* Thumb */}
            <path d="M22 68 C10 68 5 80 12 92 C16 98 22 96 25 90" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
          </g>

          {/* Dynamic Wave Motion Arc */}
          <path d="M150 25 C170 20 190 28 200 42" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
          <path d="M196 34 L202 44 L190 44" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'good':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#22C55E" fillOpacity="0.14" />
          {/* Fist with Thumb UP */}
          <g transform="translate(75, 45)">
            {/* Fist body */}
            <rect x="20" y="55" width="65" height="55" rx="14" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            {/* Folded fingers lines */}
            <line x1="20" y1="70" x2="80" y2="70" stroke="#18181B" strokeWidth="2" />
            <line x1="20" y1="86" x2="80" y2="86" stroke="#18181B" strokeWidth="2" />
            <line x1="20" y1="98" x2="75" y2="98" stroke="#18181B" strokeWidth="2" />

            {/* Thumb Pointing Straight UP */}
            <path
              d="M20 65 C12 65 6 45 10 22 C14 8 26 8 28 22 C30 35 32 50 35 60 Z"
              fill="#FFD15C"
              stroke="#18181B"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            {/* Wrist connection */}
            <path d="M35 110 L30 140 L70 140 L75 110" fill="#FAF8F5" stroke="#18181B" strokeWidth="2.5" />
          </g>

          {/* Upward affirmation bursts */}
          <path d="M92 35 L92 18 M84 25 L92 18 L100 25" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="155" cy="50" r="4" fill="#22C55E" />
          <circle cx="170" cy="65" r="3" fill="#22C55E" />
        </svg>
      );

    case 'thank_you':
    case 'thank you':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#FFD15C" fillOpacity="0.16" />
          {/* Chin reference outline */}
          <path d="M70 50 C70 90 95 105 120 105 C130 105 140 100 145 95" stroke="#D4CEBF" strokeWidth="2.5" strokeDasharray="4 4" />
          <text x="75" y="75" fill="#A8A190" fontSize="11" fontWeight="bold">CHIN</text>

          {/* Flat Hand touching chin moving outward */}
          <g transform="translate(100, 60)">
            <path
              d="M10 40 L60 10 C68 6 78 12 75 22 L55 55 C50 62 40 65 30 65 L10 65 Z"
              fill="#FFFFFF"
              stroke="#18181B"
              strokeWidth="2.5"
            />
            {/* Fingertips touching chin zone */}
            <circle cx="12" cy="42" r="5" fill="#FFD15C" stroke="#18181B" strokeWidth="2" />
            <path d="M25 35 L68 12" stroke="#18181B" strokeWidth="2" />
            <path d="M28 45 L62 25" stroke="#18181B" strokeWidth="2" />
          </g>

          {/* Forward arc arrow */}
          <path d="M125 120 C150 135 180 130 195 110" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeDasharray="4 4" />
          <path d="M190 102 L198 108 L192 118" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'help':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#38BDF8" fillOpacity="0.16" />
          {/* Base Hand (flat palm facing UP) */}
          <g transform="translate(50, 105)">
            <rect x="10" y="20" width="120" height="24" rx="8" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <line x1="30" y1="20" x2="30" y2="44" stroke="#18181B" strokeWidth="1.5" />
            <line x1="60" y1="20" x2="60" y2="44" stroke="#18181B" strokeWidth="1.5" />
            <line x1="90" y1="20" x2="90" y2="44" stroke="#18181B" strokeWidth="1.5" />
          </g>

          {/* Dominant Fist resting on the flat palm */}
          <g transform="translate(85, 50)">
            <rect x="10" y="25" width="55" height="48" rx="12" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
            <line x1="10" y1="40" x2="60" y2="40" stroke="#18181B" strokeWidth="2" />
            <line x1="10" y1="54" x2="60" y2="54" stroke="#18181B" strokeWidth="2" />
            {/* Thumb on side */}
            <path d="M8 35 C0 35 -2 50 8 58" stroke="#18181B" strokeWidth="2.5" fill="#FFD15C" />
          </g>

          {/* Lifting upward motion arrows */}
          <path d="M165 85 L165 45 M157 55 L165 45 L173 55" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M70 85 L70 55 M64 63 L70 55 L76 63" stroke="#22C55E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );

    case 'stop':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#FF6B6B" fillOpacity="0.14" />
          {/* Flat Palm Facing Direct Forward */}
          <g transform="translate(80, 35)">
            <rect x="15" y="45" width="55" height="60" rx="10" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
            {/* 4 Fingers straight UP */}
            <rect x="18" y="10" width="10" height="40" rx="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <rect x="30" y="5" width="10" height="45" rx="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <rect x="42" y="8" width="10" height="42" rx="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <rect x="54" y="16" width="10" height="34" rx="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            {/* Thumb out */}
            <path d="M15 65 C2 65 -2 78 8 90" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
          </g>

          {/* Stop Impact Waves */}
          <path d="M50 70 C40 85 40 115 50 130" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
          <path d="M190 70 C200 85 200 115 190 130" stroke="#FF6B6B" strokeWidth="3" strokeLinecap="round" strokeDasharray="3 3" />
        </svg>
      );

    case 'time':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#FFD15C" fillOpacity="0.15" />
          {/* Watch Wrist */}
          <g transform="translate(60, 95)">
            <rect x="10" y="10" width="75" height="35" rx="6" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            {/* Watch Dial */}
            <circle cx="50" cy="27" r="14" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
            <line x1="50" y1="27" x2="50" y2="18" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
            <line x1="50" y1="27" x2="57" y2="27" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Tapping Dominant Index Finger */}
          <g transform="translate(110, 35)">
            <path
              d="M10 20 L20 70 C22 80 20 85 15 88"
              stroke="#18181B"
              strokeWidth="3"
              strokeLinecap="round"
            />
            <rect x="5" y="15" width="16" height="60" rx="8" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" transform="rotate(-15)" />
            {/* Tap contact dot */}
            <circle cx="0" cy="85" r="5" fill="#22C55E" />
          </g>

          {/* Tap impact rings */}
          <path d="M100 110 C105 106 115 106 120 110" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M96 116 C104 110 116 110 124 116" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'call':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#38BDF8" fillOpacity="0.15" />
          {/* Ear outline */}
          <path d="M65 70 C60 85 62 110 75 120 C82 112 80 80 72 70" stroke="#D4CEBF" strokeWidth="2" strokeDasharray="3 3" fill="#FAF8F5" />
          <text x="65" y="60" fill="#A8A190" fontSize="11" fontWeight="bold">EAR</text>

          {/* Y-Hand Shape (Phone) */}
          <g transform="translate(100, 50)">
            {/* Fist center */}
            <rect x="25" y="35" width="45" height="40" rx="10" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <line x1="25" y1="50" x2="70" y2="50" stroke="#18181B" strokeWidth="1.5" />
            <line x1="25" y1="62" x2="70" y2="62" stroke="#18181B" strokeWidth="1.5" />

            {/* Thumb (Earpiece) pointing up-left */}
            <path
              d="M30 40 C20 30 10 20 8 10 C6 2 16 0 22 8 C28 16 32 28 35 38"
              fill="#FFD15C"
              stroke="#18181B"
              strokeWidth="2.5"
            />
            {/* Pinky (Mouthpiece) pointing down-left */}
            <path
              d="M60 70 C68 85 75 95 78 105 C80 112 70 115 64 108 C58 100 55 88 52 75"
              fill="#FFD15C"
              stroke="#18181B"
              strokeWidth="2.5"
            />
          </g>

          {/* Radio / Ring waves */}
          <path d="M85 45 C75 35 65 35 55 45" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M90 35 C75 22 60 22 45 35" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );

    case 'love':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#FF6B6B" fillOpacity="0.16" />
          {/* I Love You (ILY) Handshape */}
          <g transform="translate(85, 40)">
            {/* Palm */}
            <rect x="15" y="45" width="48" height="48" rx="10" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            {/* Middle and ring folded */}
            <rect x="28" y="45" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" strokeWidth="2" />
            <rect x="40" y="45" width="10" height="24" rx="4" fill="#FAF8F5" stroke="#18181B" strokeWidth="2" />

            {/* Index extended straight UP */}
            <rect x="16" y="8" width="10" height="42" rx="5" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
            {/* Pinky extended straight UP */}
            <rect x="52" y="16" width="10" height="34" rx="5" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
            {/* Thumb extended sideways */}
            <path d="M16 65 C2 65 -4 55 0 45 C4 38 12 40 18 48" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
          </g>

          {/* Floating hearts */}
          <path d="M175 60 C175 50 160 50 160 62 C160 74 175 84 175 84 C175 84 190 74 190 62 C190 50 175 50 175 60 Z" fill="#FF6B6B" stroke="#18181B" strokeWidth="2" />
        </svg>
      );

    case 'a':
    case 'alphabet_a':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#FFD15C" fillOpacity="0.18" />
          {/* Non-dominant open hand showing thumb */}
          <g transform="translate(45, 60)">
            <rect x="25" y="30" width="55" height="50" rx="8" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            {/* Thumb pointing up-right */}
            <path d="M65 40 C75 32 85 28 92 35 C98 42 90 52 80 58" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
            {/* Thumb tip target marker */}
            <circle cx="92" cy="35" r="7" fill="#22C55E" stroke="#18181B" strokeWidth="2" />
          </g>

          {/* Dominant Index touching thumb tip */}
          <g transform="translate(130, 40)">
            <path d="M5 55 L35 85 L45 75 L15 45 Z" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <circle cx="5" cy="55" r="4" fill="#22C55E" />
          </g>

          <text x="120" y="175" textAnchor="middle" fill="#18181B" fontSize="13" fontWeight="bold">Touch Thumb Tip</text>
        </svg>
      );

    case 'b':
    case 'alphabet_b':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#38BDF8" fillOpacity="0.16" />
          {/* Two circles meeting like binoculars */}
          <g transform="translate(60, 60)">
            {/* Left Circle */}
            <circle cx="35" cy="40" r="24" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <circle cx="35" cy="40" r="10" fill="#FAF8F5" stroke="#18181B" strokeWidth="2" />

            {/* Right Circle touching */}
            <circle cx="85" cy="40" r="24" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
            <circle cx="85" cy="40" r="10" fill="#FAF8F5" stroke="#18181B" strokeWidth="2" />
          </g>
          <text x="120" y="165" textAnchor="middle" fill="#18181B" fontSize="13" fontWeight="bold">Two Circles Joined</text>
        </svg>
      );

    case 'c':
    case 'alphabet_c':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#22C55E" fillOpacity="0.15" />
          {/* Hand curved in C-arc */}
          <g transform="translate(75, 45)">
            <path
              d="M50 15 C20 15 5 40 5 65 C5 90 20 115 50 115 C60 115 70 108 72 98 C74 88 64 85 55 85 C35 85 28 75 28 65 C28 55 35 45 55 45 C64 45 74 42 72 32 C70 22 60 15 50 15 Z"
              fill="#FFD15C"
              stroke="#18181B"
              strokeWidth="2.5"
            />
          </g>
          <text x="120" y="170" textAnchor="middle" fill="#18181B" fontSize="13" fontWeight="bold">Curved "C" Shape</text>
        </svg>
      );

    case 'l':
    case 'alphabet_l':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#FFD15C" fillOpacity="0.18" />
          {/* 90-degree L handshape */}
          <g transform="translate(85, 40)">
            <rect x="20" y="45" width="45" height="45" rx="8" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            {/* Index straight UP */}
            <rect x="20" y="8" width="12" height="42" rx="6" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
            {/* Thumb straight OUT 90 degrees */}
            <path d="M20 65 L-12 65 C-18 65 -18 77 -12 77 L20 77" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" />
            {/* Right-angle square guide */}
            <rect x="8" y="52" width="12" height="12" fill="none" stroke="#22C55E" strokeWidth="2" strokeDasharray="2 2" />
          </g>
          <text x="120" y="165" textAnchor="middle" fill="#18181B" fontSize="13" fontWeight="bold">90° Right Angle</text>
        </svg>
      );

    case 'v':
    case 'alphabet_v':
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#38BDF8" fillOpacity="0.15" />
          {/* Peace V Shape */}
          <g transform="translate(85, 35)">
            <rect x="20" y="55" width="45" height="45" rx="8" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            {/* Index tilted left */}
            <rect x="15" y="10" width="11" height="50" rx="5" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" transform="rotate(-15, 20, 35)" />
            {/* Middle tilted right */}
            <rect x="42" y="10" width="11" height="52" rx="5" fill="#FFD15C" stroke="#18181B" strokeWidth="2.5" transform="rotate(15, 47, 35)" />
          </g>
          <text x="120" y="165" textAnchor="middle" fill="#18181B" fontSize="13" fontWeight="bold">Peace / V Spread</text>
        </svg>
      );

    default:
      // Generic high-contrast Hand Sign Badge
      return (
        <svg viewBox="0 0 240 200" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
          <circle cx="120" cy="100" r="75" fill="#FFD15C" fillOpacity="0.18" />
          <g transform="translate(90, 45)">
            <rect x="10" y="35" width="48" height="55" rx="10" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
            <rect x="12" y="10" width="9" height="30" rx="4" fill="#FFD15C" stroke="#18181B" strokeWidth="2" />
            <rect x="23" y="6" width="9" height="34" rx="4" fill="#FFD15C" stroke="#18181B" strokeWidth="2" />
            <rect x="34" y="9" width="9" height="31" rx="4" fill="#FFD15C" stroke="#18181B" strokeWidth="2" />
            <rect x="45" y="16" width="9" height="24" rx="4" fill="#FFD15C" stroke="#18181B" strokeWidth="2" />
          </g>
          <text x="120" y="165" textAnchor="middle" fill="#18181B" fontSize="13" fontWeight="bold">ISL Sign Posture</text>
        </svg>
      );
  }
}
