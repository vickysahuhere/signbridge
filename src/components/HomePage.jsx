import React, { useState } from 'react';
import {
  BookOpen,
  Video,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Zap,
  Globe,
  Compass,
  CheckCircle2,
  Hash,
  HelpCircle,
  MessageSquare
} from 'lucide-react';
import { HomeChatbotPopup } from './HomeChatbotPopup.jsx';

/**
 * Artistic Vector SVG for Learn ISL (Duolingo-Inspired Art Direction)
 * Charismatic learner character actively practicing authentic Indian Sign Language,
 * featuring expressive character art, on-device MediaPipe AI landmark constellation,
 * 3D tactile alphabet tile "A", streak flame chip, and 3-star milestone mastery ribbon.
 */
function ArtisticLearnIllustration({ className = 'w-full h-auto' }) {
  return (
    <svg
      viewBox="0 0 360 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Soft Ambient Radiance */}
        <radialGradient id="duoLearnAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.85" />
          <stop offset="65%" stopColor="#EEFDE5" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        {/* Golden Cube Gradient */}
        <linearGradient id="duoGoldFacet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFE066" />
          <stop offset="100%" stopColor="#FFC800" />
        </linearGradient>
        {/* Mint Chip Gradient */}
        <linearGradient id="duoMintFacet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F0FDF4" />
          <stop offset="100%" stopColor="#DCFCE7" />
        </linearGradient>
      </defs>

      {/* 1. Ambient Backdrop Glow & Orbital Guides */}
      <circle cx="180" cy="102" r="82" fill="url(#duoLearnAura)" />
      <circle cx="180" cy="102" r="68" stroke="#FDE68A" strokeWidth="1.6" strokeDasharray="5 5" opacity="0.8" />
      <circle cx="180" cy="102" r="84" stroke="#DCFCE7" strokeWidth="1.2" strokeDasharray="3 6" opacity="0.6" />

      {/* Dynamic Trajectory / Kinetic Motion Arc */}
      <path
        d="M 52 145 C 92 48, 268 44, 312 135"
        stroke="#58CC02"
        strokeWidth="2.4"
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
      <path
        d="M 72 158 C 114 86, 236 82, 288 150"
        stroke="#1CB0F6"
        strokeWidth="1.8"
        strokeDasharray="4 5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* 2. Top-Left: Tactile 3D Duolingo Alphabet Cube "A" */}
      <g transform="translate(20, 16) rotate(-6)">
        {/* Drop Shadow */}
        <rect x="4" y="4" width="50" height="50" rx="14" fill="#18181B" />
        {/* Beveled Bottom Depth */}
        <rect x="0" y="2" width="50" height="50" rx="14" fill="#E5A500" stroke="#18181B" strokeWidth="2.5" />
        {/* Main Golden Surface */}
        <rect x="0" y="0" width="50" height="46" rx="14" fill="url(#duoGoldFacet)" stroke="#18181B" strokeWidth="2.5" />
        {/* Specular Top-Left Highlight */}
        <path d="M 6 15 C 6 9, 9 6, 16 6 L 38 6 C 26 6, 8 10, 6 22 Z" fill="#FFFFFF" fillOpacity="0.6" />
        {/* Bold Letter A */}
        <text
          x="25"
          y="32"
          textAnchor="middle"
          fontSize="24"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#18181B"
        >
          A
        </text>
        {/* Sub-label */}
        <text
          x="25"
          y="41"
          textAnchor="middle"
          fontSize="7"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#78350F"
          letterSpacing="0.08em"
        >
          ISL
        </text>
      </g>

      {/* 3. Top-Right: Duolingo Stacked Gamification Chips */}
      {/* 3a. AI Match Radar Pill */}
      <g transform="translate(244, 16) rotate(4)">
        {/* Drop Shadow */}
        <rect x="3.5" y="3.5" width="86" height="30" rx="10" fill="#18181B" />
        {/* 3D Border & Body */}
        <rect x="0" y="2" width="86" height="30" rx="10" fill="#46A302" stroke="#18181B" strokeWidth="2.4" />
        <rect x="0" y="0" width="86" height="28" rx="10" fill="url(#duoMintFacet)" stroke="#18181B" strokeWidth="2.4" />
        {/* Glowing Radar Pip */}
        <circle cx="14" cy="14" r="4.5" fill="#22C55E" />
        <circle cx="14" cy="14" r="7.5" stroke="#22C55E" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.7" />
        {/* Text */}
        <text
          x="26"
          y="17.5"
          fontSize="9.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#15803D"
          letterSpacing="0.03em"
        >
          AI • 99%
        </text>
        {/* Mini Flame */}
        <path d="M 72 8 C 71 11, 76 13, 76 16 C 76 18.5, 74 20.5, 71.5 20.5 C 69 20.5, 67 18.5, 67 16 C 67 14, 69 11, 72 8 Z" fill="#FF4B4B" />
        <path d="M 71.5 12 C 71 14, 73.5 15, 73.5 16.5 C 73.5 17.5, 72.5 18.5, 71.5 18.5 C 70.5 18.5, 69.5 17.5, 69.5 16.5 C 69.5 15.5, 70.5 13.5, 71.5 12 Z" fill="#FFC800" />
      </g>

      {/* 3b. 3-Star Mastery Badge (Stacked neatly below AI chip) */}
      <g transform="translate(246, 54)">
        {/* Shadow */}
        <rect x="2.5" y="2.5" width="84" height="24" rx="8" fill="#18181B" />
        <rect x="0" y="1" width="84" height="24" rx="8" fill="#E5A500" stroke="#18181B" strokeWidth="2" />
        <rect x="0" y="0" width="84" height="23" rx="8" fill="#FFFBEB" stroke="#18181B" strokeWidth="2" />
        {/* 3 Golden Stars */}
        <g transform="translate(7, 4.5)">
          <path d="M5 0 L6.2 3.8 L10 3.8 L7 6 L8.2 9.8 L5 7.5 L1.8 9.8 L3 6 L0 3.8 L3.8 3.8 Z" fill="#FFC800" stroke="#18181B" strokeWidth="0.8" />
        </g>
        <g transform="translate(18, 4.5)">
          <path d="M5 0 L6.2 3.8 L10 3.8 L7 6 L8.2 9.8 L5 7.5 L1.8 9.8 L3 6 L0 3.8 L3.8 3.8 Z" fill="#FFC800" stroke="#18181B" strokeWidth="0.8" />
        </g>
        <g transform="translate(29, 4.5)">
          <path d="M5 0 L6.2 3.8 L10 3.8 L7 6 L8.2 9.8 L5 7.5 L1.8 9.8 L3 6 L0 3.8 L3.8 3.8 Z" fill="#FFC800" stroke="#18181B" strokeWidth="0.8" />
        </g>
        <text
          x="44"
          y="15.5"
          fontSize="7.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#78350F"
          letterSpacing="0.04em"
        >
          MASTERED
        </text>
      </g>

      {/* 4. Bottom-Left: Floating +15 XP Badge */}
      <g transform="translate(26, 76) rotate(-4)">
        <rect x="2" y="2" width="56" height="22" rx="7" fill="#18181B" />
        <rect x="0" y="1" width="56" height="22" rx="7" fill="#1899D6" stroke="#18181B" strokeWidth="1.8" />
        <rect x="0" y="0" width="56" height="21" rx="7" fill="#DDF4FE" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="10" cy="10.5" r="3" fill="#1CB0F6" />
        <text
          x="18"
          y="14"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#0369A1"
          letterSpacing="0.04em"
        >
          +15 XP
        </text>
      </g>

      {/* 5. Central Character: The Happy Duolingo-Style ISL Learner */}
      <g id="duo-learner-character" transform="translate(112, 38)">
        {/* Character Torso / Cozy Hoodie (Duolingo Purple) */}
        {/* Hoodie Drop Shadow */}
        <path
          d="M 28 142 C 28 116, 44 98, 70 98 C 96 98, 112 116, 112 142 Z"
          fill="#18181B"
        />
        {/* Hoodie Body */}
        <path
          d="M 26 138 C 26 112, 42 95, 68 95 C 94 95, 110 112, 110 138 Z"
          fill="#CE82FF"
          stroke="#18181B"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />
        {/* Hoodie Bottom Hem Shade */}
        <path
          d="M 27 132 C 40 136, 96 136, 109 132 L 110 138 C 94 142, 42 142, 26 138 Z"
          fill="#A559D9"
        />
        {/* Hoodie Strings */}
        <path d="M 60 102 C 60 114, 57 122, 57 124" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="57" cy="125" r="2" fill="#FFC800" stroke="#18181B" strokeWidth="1" />
        <path d="M 76 102 C 76 114, 79 122, 79 124" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <circle cx="79" cy="125" r="2" fill="#FFC800" stroke="#18181B" strokeWidth="1" />

        {/* Neck */}
        <rect x="61" y="86" width="14" height="12" rx="3" fill="#FFE2CD" stroke="#18181B" strokeWidth="2.4" />

        {/* Head Base */}
        <ellipse cx="68" cy="58" rx="30" ry="32" fill="#FFE2CD" stroke="#18181B" strokeWidth="2.8" />

        {/* Cute Ears */}
        <circle cx="37" cy="58" r="6.5" fill="#FFE2CD" stroke="#18181B" strokeWidth="2.4" />
        <circle cx="99" cy="58" r="6.5" fill="#FFE2CD" stroke="#18181B" strokeWidth="2.4" />

        {/* Playful Snapback Cap (Duolingo Gold) */}
        {/* Cap Shadow */}
        <path d="M 38 48 C 38 28, 50 18, 68 18 C 86 18, 98 28, 98 48 Z" fill="#18181B" />
        {/* Cap Dome */}
        <path d="M 37 46 C 37 26, 49 16, 68 16 C 87 16, 99 26, 99 46 Z" fill="#FFC800" stroke="#18181B" strokeWidth="2.6" />
        {/* Cap Button */}
        <circle cx="68" cy="15" r="3.5" fill="#58CC02" stroke="#18181B" strokeWidth="1.8" />
        {/* Cap Visor / Brim */}
        <path d="M 30 46 C 45 42, 91 42, 106 46 C 104 52, 98 54, 68 53 C 38 54, 32 52, 30 46 Z" fill="#E5A500" stroke="#18181B" strokeWidth="2.6" strokeLinejoin="round" />

        {/* Stylized Hair Tufts peeking under cap */}
        <path d="M 40 47 C 44 54, 46 56, 48 49" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" fill="#18181B" />
        <path d="M 88 49 C 90 56, 92 54, 96 47" stroke="#18181B" strokeWidth="2.4" strokeLinecap="round" fill="#18181B" />

        {/* Rosy Cheerful Blushing Cheeks */}
        <circle cx="48" cy="68" r="5.5" fill="#FFAA8A" opacity="0.85" />
        <circle cx="88" cy="68" r="5.5" fill="#FFAA8A" opacity="0.85" />

        {/* Duolingo Big Sparkling Expressive Eyes */}
        {/* Left Eye */}
        <ellipse cx="53" cy="58" rx="6.5" ry="8" fill="#18181B" />
        <circle cx="51.5" cy="55.5" r="2.8" fill="#FFFFFF" />
        <circle cx="55.5" cy="60.5" r="1.2" fill="#FFFFFF" />

        {/* Right Eye */}
        <ellipse cx="83" cy="58" rx="6.5" ry="8" fill="#18181B" />
        <circle cx="81.5" cy="55.5" r="2.8" fill="#FFFFFF" />
        <circle cx="85.5" cy="60.5" r="1.2" fill="#FFFFFF" />

        {/* Friendly Curved Eyebrows */}
        <path d="M 47 48 C 51 45, 57 46, 59 48" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 77 48 C 79 46, 85 45, 89 48" stroke="#18181B" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Cute Open Beaming Smile */}
        <path d="M 60 69 C 60 77, 76 77, 76 69 Z" fill="#FF4B4B" stroke="#18181B" strokeWidth="2.4" strokeLinejoin="round" />
        <path d="M 64 73 C 65 71, 71 71, 72 73 Z" fill="#FFAA8A" />
      </g>

      {/* 6. Main Signing Hands in Authentic ISL Posture (Namaste / Cupped "A") */}
      {/* Hand Group with Drop Shadows & Outlines */}
      <g id="duo-signing-hands">
        {/* Left Hand (Mirrored Viewer Left - Handshape A / Open Support) */}
        <g transform="translate(126, 96)">
          {/* Shadow */}
          <path
            d="M 12 56 C 8 48, 4 36, 7 24 C 9 16, 17 15, 20 22 C 22 28, 22 36, 21 42 C 24 34, 27 22, 31 16 C 34 11, 41 12, 42 18 C 44 26, 42 36, 41 42 C 45 36, 50 28, 54 26 C 58 24, 63 27, 62 33 C 61 42, 57 52, 52 60 C 46 68, 38 72, 28 72 L 12 66 Z"
            fill="#18181B"
          />
          {/* Hand Body */}
          <path
            d="M 10 53 C 6 45, 2 33, 5 21 C 7 13, 15 12, 18 19 C 20 25, 20 33, 19 39 C 22 31, 25 19, 29 13 C 32 8, 39 9, 40 15 C 42 23, 40 33, 39 39 C 43 33, 48 25, 52 23 C 56 21, 61 24, 60 30 C 59 39, 55 49, 50 57 C 44 65, 36 69, 26 69 L 10 63 Z"
            fill="#FFEAD8"
            stroke="#18181B"
            strokeWidth="2.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Thumb */}
          <path
            d="M 18 42 C 12 40, 6 46, 7 52 C 8 57, 14 60, 22 58"
            fill="#FFEAD8"
            stroke="#18181B"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Yellow Wrist Cuff */}
          <rect x="12" y="60" width="28" height="7" rx="3" fill="#FFC800" stroke="#18181B" strokeWidth="2.2" />
        </g>

        {/* Right Hand (Viewer Right - Dominant Handshape forming Authentic ISL letter / gesture) */}
        <g transform="translate(182, 92)">
          {/* Shadow */}
          <path
            d="M 14 62 C 10 50, 6 36, 9 20 C 11 12, 19 12, 21 19 C 23 27, 23 38, 22 45 C 26 36, 30 20, 34 14 C 37 8, 45 9, 46 16 C 48 26, 45 38, 44 46 C 48 39, 54 28, 58 26 C 62 24, 68 28, 66 35 C 64 46, 59 58, 52 68 C 45 76, 35 80, 24 80 L 14 72 Z"
            fill="#18181B"
          />
          {/* Hand Body */}
          <path
            d="M 11 58 C 7 46, 3 32, 6 16 C 8 8, 16 8, 18 15 C 20 23, 20 34, 19 41 C 23 32, 27 16, 31 10 C 34 4, 42 5, 43 12 C 45 22, 42 34, 41 42 C 45 35, 51 24, 55 22 C 59 20, 65 24, 63 31 C 61 42, 56 54, 49 64 C 42 72, 32 76, 21 76 L 11 68 Z"
            fill="#FFEAD8"
            stroke="#18181B"
            strokeWidth="2.6"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
          {/* Thumb Curled in Authentic Gesture */}
          <path
            d="M 16 38 C 10 36, 4 44, 6 52 C 8 58, 16 62, 26 59"
            fill="#FFEAD8"
            stroke="#18181B"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Yellow Wrist Cuff */}
          <rect x="14" y="66" width="30" height="7" rx="3" fill="#FFC800" stroke="#18181B" strokeWidth="2.2" />
        </g>
      </g>

      {/* 7. MediaPipe AI Landmark Overlay & Target Constellation */}
      <g id="ai-vision-skeleton">
        {/* Palm Linkages (Wrist to Knuckles) */}
        {/* Left Hand Palm */}
        <line x1="140" y1="152" x2="142" y2="134" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="140" y1="152" x2="152" y2="130" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="140" y1="152" x2="162" y2="132" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />
        {/* Right Hand Palm */}
        <line x1="210" y1="156" x2="198" y2="132" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="210" y1="156" x2="212" y2="126" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="210" y1="156" x2="228" y2="132" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />

        {/* Finger Bones (Cyan Dotted Links to Tips) */}
        <line x1="142" y1="134" x2="144" y2="115" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="152" y1="130" x2="155" y2="109" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="162" y1="132" x2="168" y2="114" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="3 3" />

        <line x1="198" y1="132" x2="200" y2="107" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="212" y1="126" x2="213" y2="102" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="228" y1="132" x2="236" y2="114" stroke="#0284C7" strokeWidth="1.8" strokeDasharray="3 3" />

        {/* Wrist & Knuckle Hub Nodes */}
        <circle cx="140" cy="152" r="3.8" fill="#22C55E" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="210" cy="156" r="3.8" fill="#22C55E" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="142" cy="134" r="2.8" fill="#FFC800" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="152" cy="130" r="2.8" fill="#FFC800" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="162" cy="132" r="2.8" fill="#FFC800" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="198" cy="132" r="2.8" fill="#FFC800" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="212" cy="126" r="2.8" fill="#FFC800" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="228" cy="132" r="2.8" fill="#FFC800" stroke="#18181B" strokeWidth="1.4" />

        {/* Fingertip Reticles (High-Tech Glowing Cyan Target Rings) */}
        {/* Left Index */}
        <circle cx="144" cy="115" r="5.5" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 2" />
        <circle cx="144" cy="115" r="3.4" fill="#38BDF8" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="144" cy="115" r="1.3" fill="#FFFFFF" />

        {/* Left Middle */}
        <circle cx="155" cy="109" r="5.5" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 2" />
        <circle cx="155" cy="109" r="3.4" fill="#38BDF8" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="155" cy="109" r="1.3" fill="#FFFFFF" />

        {/* Right Index (Primary Tracking Reticle with Crosshairs) */}
        <circle cx="200" cy="107" r="7" stroke="#38BDF8" strokeWidth="1.4" strokeDasharray="2 2" />
        <circle cx="200" cy="107" r="4" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="200" cy="107" r="1.5" fill="#FFFFFF" />
        <line x1="191" y1="107" x2="195" y2="107" stroke="#0284C7" strokeWidth="1.4" />
        <line x1="205" y1="107" x2="209" y2="107" stroke="#0284C7" strokeWidth="1.4" />
        <line x1="200" y1="98" x2="200" y2="102" stroke="#0284C7" strokeWidth="1.4" />
        <line x1="200" y1="112" x2="200" y2="116" stroke="#0284C7" strokeWidth="1.4" />

        {/* Right Middle */}
        <circle cx="213" cy="102" r="5.5" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 2" />
        <circle cx="213" cy="102" r="3.4" fill="#38BDF8" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="213" cy="102" r="1.3" fill="#FFFFFF" />
      </g>

      {/* 8. Duolingo Sparkles & Gamification Accents */}
      <g transform="translate(94, 22)">
        <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="#FFC800" />
      </g>
      <g transform="translate(230, 84)">
        <path d="M5 0 L6 3.5 L9.5 5 L6 6.5 L5 10 L4 6.5 L0.5 5 L4 3.5 Z" fill="#58CC02" />
      </g>
      <g transform="translate(68, 92)">
        <path d="M5 0 L6 3.5 L9.5 5 L6 6.5 L5 10 L4 6.5 L0.5 5 L4 3.5 Z" fill="#38BDF8" />
      </g>
    </svg>
  );
}

/**
 * Artistic Vector SVG for Video Call & Sign Translation (Duolingo-Inspired Art Direction)
 * High-concept vector artwork showing two communicating characters:
 * 1. An expressive ISL signer with on-device AI landmark tracking nodes on their hands.
 * 2. A smiling hearing peer framed within a video call tablet with live voice soundwaves.
 * Connected by a real-time P2P bridge with live translated subtitle speech bubble
 * and lightning speed badge ("⚡ < 20ms").
 */
function ArtisticCallIllustration({ className = 'w-full h-auto' }) {
  return (
    <svg
      viewBox="0 0 360 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Soft Radial Ambient Bridge Glow */}
        <radialGradient id="duoCallAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#DCFCE7" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
        {/* Screen Bevel Gradient */}
        <linearGradient id="duoScreenFacet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
      </defs>

      {/* 1. Ambient Communication Glow & Orbital Guides */}
      <circle cx="180" cy="110" r="82" fill="url(#duoCallAura)" />
      <circle cx="180" cy="110" r="66" stroke="#BAE6FD" strokeWidth="1.6" strokeDasharray="5 5" opacity="0.8" />

      {/* Real-Time P2P Waveform Stream */}
      <path
        d="M 80 114 C 112 86, 140 134, 180 112 C 220 90, 248 136, 280 112"
        stroke="#0284C7"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M 86 120 C 116 94, 142 140, 180 118 C 218 96, 244 142, 274 118"
        stroke="#38BDF8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.85"
      />

      {/* Data Packet Nodes */}
      <circle cx="128" cy="102" r="4" fill="#FFC800" stroke="#18181B" strokeWidth="1.8" />
      <circle cx="234" cy="126" r="4" fill="#22C55E" stroke="#18181B" strokeWidth="1.8" />

      {/* 2. Top-Center: Live Translated Subtitle Speech Ribbon (Duolingo Style) */}
      <g transform="translate(42, 12)">
        {/* Drop Shadow */}
        <rect x="4" y="4" width="276" height="42" rx="14" fill="#18181B" />
        {/* Speech Card Body */}
        <rect x="0" y="2" width="276" height="42" rx="14" fill="#46A302" stroke="#18181B" strokeWidth="2.5" />
        <rect x="0" y="0" width="276" height="40" rx="14" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.5" />
        {/* Soft Mint Inset Surface */}
        <rect x="3" y="3" width="270" height="34" rx="11" fill="#F0FDF4" />

        {/* Live Broadcast Indicator (Pulsing Green Dot) */}
        <circle cx="18" cy="20" r="4.5" fill="#22C55E" />
        <circle cx="18" cy="20" r="8" stroke="#22C55E" strokeWidth="1.4" strokeDasharray="2 2" opacity="0.6" />

        {/* Subtitle Text */}
        <text
          x="32"
          y="24.5"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#18181B"
          letterSpacing="-0.01em"
        >
          "Namaste! How are you?"
        </text>

        {/* ISL -> ENG Translation Badge */}
        <rect x="216" y="10" width="50" height="20" rx="7" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.4" />
        <text
          x="241"
          y="23"
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#15803D"
        >
          ISL ⇄ EN
        </text>

        {/* Speech Bubble Tail pointing down towards the Signer */}
        <polygon points="76,40 84,50 92,40" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
        <polygon points="77,39 84,47 91,39" fill="#F0FDF4" />
      </g>

      {/* 3. Left Side: The ISL Signer Character (Duolingo Style) */}
      <g id="duo-signer" transform="translate(18, 56)">
        {/* Signer Torso / Jersey (Duolingo Macaw Blue) */}
        <path d="M 12 118 C 12 96, 26 84, 48 84 C 70 84, 84 96, 84 118 Z" fill="#18181B" />
        <path d="M 10 115 C 10 93, 24 81, 46 81 C 68 81, 82 93, 82 115 Z" fill="#1CB0F6" stroke="#18181B" strokeWidth="2.6" />
        <path d="M 11 110 C 24 114, 68 114, 81 110 L 82 115 C 68 119, 24 119, 10 115 Z" fill="#1899D6" />

        {/* Neck */}
        <rect x="40" y="73" width="12" height="10" rx="2" fill="#FFE2CD" stroke="#18181B" strokeWidth="2.2" />

        {/* Head */}
        <ellipse cx="46" cy="52" rx="22" ry="24" fill="#FFE2CD" stroke="#18181B" strokeWidth="2.5" />

        {/* Curly Stylized Hair (Duolingo Character Dark) */}
        <path d="M 24 48 C 24 30, 36 24, 48 24 C 60 24, 68 32, 68 48 C 65 42, 58 44, 48 44 C 38 44, 30 42, 24 48 Z" fill="#18181B" stroke="#18181B" strokeWidth="2" />

        {/* Rosy Cheek */}
        <circle cx="34" cy="58" r="4.5" fill="#FFAA8A" opacity="0.85" />
        <circle cx="58" cy="58" r="4.5" fill="#FFAA8A" opacity="0.85" />

        {/* Sparkle Eyes */}
        <ellipse cx="37" cy="50" rx="4.5" ry="6" fill="#18181B" />
        <circle cx="36" cy="48" r="2" fill="#FFFFFF" />
        <ellipse cx="55" cy="50" rx="4.5" ry="6" fill="#18181B" />
        <circle cx="54" cy="48" r="2" fill="#FFFFFF" />

        {/* Cheerful Smile */}
        <path d="M 40 59 C 40 65, 52 65, 52 59 Z" fill="#FF4B4B" stroke="#18181B" strokeWidth="2" />

        {/* Raised Expressive Signing Hands */}
        {/* Hand 1 (Front Hand with Landmark Vision Reticle) */}
        <g transform="translate(52, 68)">
          <path
            d="M 8 36 C 4 28, 2 18, 5 10 C 7 5, 13 5, 15 11 C 17 16, 17 22, 16 26 C 19 20, 22 11, 26 7 C 29 3, 35 4, 35 9 C 36 15, 33 22, 31 27 C 34 23, 38 18, 42 17 C 46 16, 50 19, 49 24 C 47 31, 41 38, 34 42 L 18 45 Z"
            fill="#FFEAD8"
            stroke="#18181B"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Thumb */}
          <path d="M 12 28 C 8 28, 4 33, 6 38 C 7 41, 12 43, 18 41" fill="#FFEAD8" stroke="#18181B" strokeWidth="2" />
          {/* Wrist Cuff */}
          <rect x="8" y="42" width="18" height="5" rx="2" fill="#FFC800" stroke="#18181B" strokeWidth="1.8" />

          {/* AI Vision Landmark Overlay on Signer's Hand */}
          <line x1="16" y1="42" x2="16" y2="28" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
          <line x1="16" y1="28" x2="15" y2="11" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
          <line x1="16" y1="28" x2="26" y2="7" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="2.5 2.5" />
          <line x1="16" y1="28" x2="35" y2="9" stroke="#0284C7" strokeWidth="1.5" strokeDasharray="2.5 2.5" />

          <circle cx="16" cy="42" r="3" fill="#22C55E" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="16" cy="28" r="2.5" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />
          {/* Fingertips Reticles */}
          <circle cx="15" cy="11" r="3.2" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
          <circle cx="15" cy="11" r="1.2" fill="#FFFFFF" />
          <circle cx="26" cy="7" r="3.2" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
          <circle cx="26" cy="7" r="1.2" fill="#FFFFFF" />
          <circle cx="35" cy="9" r="3.2" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
          <circle cx="35" cy="9" r="1.2" fill="#FFFFFF" />
        </g>
      </g>

      {/* 4. Right Side: The Hearing Video Partner inside Video Call Screen */}
      <g id="duo-partner-screen" transform="translate(230, 54)">
        {/* Video Tablet / Screen Frame */}
        {/* Drop Shadow */}
        <rect x="4" y="4" width="102" height="116" rx="14" fill="#18181B" />
        {/* Beveled Bottom Depth */}
        <rect x="0" y="2" width="102" height="116" rx="14" fill="#E5E5E5" stroke="#18181B" strokeWidth="2.6" />
        {/* Screen Bezel Body */}
        <rect x="0" y="0" width="102" height="114" rx="14" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
        {/* Screen Display Inset */}
        <rect x="5" y="16" width="92" height="92" rx="10" fill="url(#duoScreenFacet)" stroke="#18181B" strokeWidth="1.8" />

        {/* Top Tablet Camera Dot */}
        <circle cx="51" cy="9" r="3" fill="#18181B" />
        <circle cx="51" cy="9" r="1.2" fill="#38BDF8" />
        {/* Live Green Screen LED */}
        <circle cx="62" cy="9" r="1.8" fill="#22C55E" />

        {/* Video Call Partner Character */}
        {/* Partner Torso */}
        <path d="M 22 108 C 22 92, 34 84, 51 84 C 68 84, 80 92, 80 108 Z" fill="#FFC800" stroke="#18181B" strokeWidth="2.2" />

        {/* Head */}
        <ellipse cx="51" cy="58" rx="18" ry="20" fill="#FFE2CD" stroke="#18181B" strokeWidth="2.2" />

        {/* Friendly Hair */}
        <path d="M 33 54 C 33 38, 43 34, 51 34 C 59 34, 69 38, 69 54 C 66 48, 60 50, 51 50 C 42 50, 36 48, 33 54 Z" fill="#78350F" stroke="#18181B" strokeWidth="1.8" />

        {/* Audio Headset / Headphones (Hearing Partner) */}
        <path d="M 31 56 C 31 40, 41 36, 51 36 C 61 36, 71 40, 71 56" stroke="#FF4B4B" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Ear Cups */}
        <rect x="28" y="52" width="6" height="12" rx="3" fill="#FF4B4B" stroke="#18181B" strokeWidth="1.6" />
        <rect x="68" y="52" width="6" height="12" rx="3" fill="#FF4B4B" stroke="#18181B" strokeWidth="1.6" />
        {/* Microphone Boom */}
        <path d="M 31 62 C 31 68, 38 72, 44 72" stroke="#18181B" strokeWidth="2" strokeLinecap="round" fill="none" />
        <circle cx="45" cy="72" r="2.2" fill="#FFC800" stroke="#18181B" strokeWidth="1" />

        {/* Eyes & Cheerful Smile */}
        <ellipse cx="44" cy="57" rx="3.5" ry="5" fill="#18181B" />
        <circle cx="43" cy="55.5" r="1.4" fill="#FFFFFF" />
        <ellipse cx="58" cy="57" rx="3.5" ry="5" fill="#18181B" />
        <circle cx="57" cy="55.5" r="1.4" fill="#FFFFFF" />
        <path d="M 46 64 C 46 69, 56 69, 56 64 Z" fill="#FF4B4B" stroke="#18181B" strokeWidth="1.6" />

        {/* Active Equalizer Soundwaves Blooming from Peer */}
        <g transform="translate(10, 24)">
          <rect x="0" y="8" width="3" height="12" rx="1.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1" />
          <rect x="5" y="2" width="3" height="24" rx="1.5" fill="#22C55E" stroke="#18181B" strokeWidth="1" />
          <rect x="10" y="10" width="3" height="9" rx="1.5" fill="#FFC800" stroke="#18181B" strokeWidth="1" />
          <rect x="15" y="0" width="3" height="28" rx="1.5" fill="#FF4B4B" stroke="#18181B" strokeWidth="1" />
        </g>
      </g>

      {/* 5. Center Hub: Smart Video Camera & P2P Engine */}
      <g transform="translate(156, 92)">
        {/* Camera Drop Shadow */}
        <rect x="3" y="3" width="46" height="34" rx="9" fill="#18181B" />
        <polygon points="49,20 59,14 59,30 49,24" fill="#18181B" />

        {/* Camera Body */}
        <rect x="0" y="2" width="46" height="34" rx="9" fill="#3C3C3C" stroke="#18181B" strokeWidth="2.2" />
        <rect x="0" y="0" width="46" height="32" rx="9" fill="#18181B" stroke="#18181B" strokeWidth="2.2" />
        <polygon points="46,16 56,10 56,26 46,20" fill="#18181B" stroke="#18181B" strokeWidth="2" strokeLinejoin="round" />

        {/* Lens Optics */}
        <circle cx="19" cy="16" r="10" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="17" cy="14" r="4" fill="#38BDF8" fillOpacity="0.8" />
        <circle cx="16" cy="13" r="1.8" fill="#FFFFFF" />

        {/* Live Red Recording LED */}
        <circle cx="38" cy="8" r="2.8" fill="#EF4444" />
      </g>

      {/* 6. Latency Speed Tag below Camera (⚡ < 20ms) */}
      <g transform="translate(150, 142)">
        <rect x="2" y="2" width="58" height="20" rx="6" fill="#18181B" />
        <rect x="0" y="1" width="58" height="20" rx="6" fill="#46A302" stroke="#18181B" strokeWidth="1.8" />
        <rect x="0" y="0" width="58" height="19" rx="6" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="10" cy="9.5" r="3" fill="#22C55E" />
        <text
          x="18"
          y="13"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#15803D"
          letterSpacing="0.04em"
        >
          ⚡ &lt; 20ms
        </text>
      </g>

      {/* 7. Decorative Duolingo Sparkles & Rays */}
      <g transform="translate(44, 38)">
        <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#38BDF8" />
      </g>
      <g transform="translate(304, 32)">
        <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#FFC800" />
      </g>
      <g transform="translate(142, 68)">
        <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#22C55E" />
      </g>
      <g transform="translate(216, 70)">
        <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#FF4B4B" />
      </g>
    </svg>
  );
}



/**
 * Duolingo-Style Hero Mascot: "Mitra" the ISL Owl Companion
 * Adorable, expressive mascot greeting learners with the authentic ISL "NAMASTE",
 * accompanied by an interactive speech bubble, streak flame, and AI status.
 */
function HeroMascotArt({ className = 'w-20 h-20 sm:w-24 sm:h-24' }) {
  return (
    <svg
      viewBox="0 0 160 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Soft Radial Mascot Aura */}
        <radialGradient id="mascotAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Ambient Glow */}
      <circle cx="80" cy="85" r="58" fill="url(#mascotAura)" />
      <circle cx="80" cy="85" r="50" stroke="#FDE68A" strokeWidth="1.6" strokeDasharray="4 4" opacity="0.8" />

      {/* Floating Sparkles & Streak Star */}
      <g transform="translate(14, 24)">
        <path d="M5 0 L6 3.5 L9.5 5 L6 6.5 L5 10 L4 6.5 L0.5 5 L4 3.5 Z" fill="#FFC800" />
      </g>
      <g transform="translate(136, 32)">
        <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#58CC02" />
      </g>
      <g transform="translate(130, 105)">
        <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#38BDF8" />
      </g>

      {/* Mascot Body: Round, Plump Duolingo Green Owl / Buddy */}
      {/* Body Shadow */}
      <ellipse cx="80" cy="94" rx="42" ry="46" fill="#18181B" />
      {/* 3D Bottom Shade */}
      <ellipse cx="80" cy="91" rx="42" ry="46" fill="#46A302" />
      {/* Main Feather Green Body */}
      <ellipse cx="80" cy="88" rx="42" ry="45" fill="#58CC02" stroke="#18181B" strokeWidth="2.8" />

      {/* Cute Little Feather Ear Tufts */}
      <path d="M 44 52 C 40 38, 48 30, 56 42 Z" fill="#58CC02" stroke="#18181B" strokeWidth="2.4" strokeLinejoin="round" />
      <path d="M 116 52 C 120 38, 112 30, 104 42 Z" fill="#58CC02" stroke="#18181B" strokeWidth="2.4" strokeLinejoin="round" />

      {/* Cheerful Golden Tummy Patch */}
      <ellipse cx="80" cy="98" rx="26" ry="25" fill="#FFF4D0" stroke="#18181B" strokeWidth="2.2" />
      {/* Subtle Tummy Feather Chevrons */}
      <path d="M 74 92 C 77 95, 83 95, 86 92" stroke="#FFC800" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M 72 102 C 76 106, 84 106, 88 102" stroke="#FFC800" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Rosy Blushing Cheeks */}
      <ellipse cx="49" cy="86" rx="6.5" ry="4.5" fill="#FFAA8A" opacity="0.9" />
      <ellipse cx="111" cy="86" rx="6.5" ry="4.5" fill="#FFAA8A" opacity="0.9" />

      {/* Iconic Duolingo Big Sparkling Eyes */}
      {/* Left Eye */}
      <ellipse cx="58" cy="72" rx="14" ry="16" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
      <ellipse cx="61" cy="72" rx="8" ry="10" fill="#18181B" />
      <circle cx="58" cy="68" r="3.5" fill="#FFFFFF" />
      <circle cx="64" cy="76" r="1.5" fill="#FFFFFF" />

      {/* Right Eye */}
      <ellipse cx="102" cy="72" rx="14" ry="16" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
      <ellipse cx="99" cy="72" rx="8" ry="10" fill="#18181B" />
      <circle cx="96" cy="68" r="3.5" fill="#FFFFFF" />
      <circle cx="102" cy="76" r="1.5" fill="#FFFFFF" />

      {/* Cute Curved Orange Beak */}
      <path d="M 73 78 C 73 72, 87 72, 87 78 C 87 88, 80 92, 80 92 C 80 92, 73 88, 73 78 Z" fill="#FF8C00" stroke="#18181B" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="78" cy="80" r="1" fill="#FFFFFF" />

      {/* Authentic ISL "NAMASTE" Prayer Wings / Hands in Front */}
      {/* Left Wing */}
      <path
        d="M 44 98 C 42 110, 54 120, 68 116 C 74 114, 78 106, 78 98 C 70 96, 52 92, 44 98 Z"
        fill="#58CC02"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      {/* Right Wing */}
      <path
        d="M 116 98 C 118 110, 106 120, 92 116 C 86 114, 82 106, 82 98 C 90 96, 108 92, 116 98 Z"
        fill="#58CC02"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Center Pressed Palms (Namaste Seam) */}
      <g transform="translate(71, 95)">
        {/* Left Hand Tip */}
        <path d="M 4 20 L 7 4 C 7.5 1, 9 1, 9 4 L 9 20 Z" fill="#FFE2CD" stroke="#18181B" strokeWidth="2" />
        {/* Right Hand Tip */}
        <path d="M 14 20 L 11 4 C 10.5 1, 9 1, 9 4 L 9 20 Z" fill="#FFE2CD" stroke="#18181B" strokeWidth="2" />
        {/* Tiny AI Vision Reticle on the Prayer Hands */}
        <circle cx="9" cy="4" r="3" stroke="#22C55E" strokeWidth="1" strokeDasharray="1.5 1.5" />
        <circle cx="9" cy="4" r="1.5" fill="#22C55E" />
      </g>

      {/* Cute Little Orange Feet */}
      <ellipse cx="64" cy="133" rx="8" ry="4" fill="#FF8C00" stroke="#18181B" strokeWidth="2" />
      <ellipse cx="96" cy="133" rx="8" ry="4" fill="#FF8C00" stroke="#18181B" strokeWidth="2" />
    </svg>
  );
}

/**
 * HomePage Component
 * Minimalist, art-directed portal where users choose directly whether
 * to enter LEARN mode or CALL mode.
 */
export function HomePage({
  onSelectMode,
  roomId = '',
  onJoinCustomRoom,
  onOpenDictionary,
  onOpenAbout,
  onOpenGuide,
  onOpenFeedback,
  onOpenChatbot,
  extraState = {}
}) {
  const [customRoomInput, setCustomRoomInput] = useState('');
  const [showRoomInput, setShowRoomInput] = useState(false);
  const [mobileHomeTab, setMobileHomeTab] = useState('learn'); // 'learn' | 'chat' on mobile

  const handleJoinSubmit = (e) => {
    e.preventDefault();
    const clean = customRoomInput.trim().toLowerCase().replace(/[^a-z0-9-_]/g, '');
    if (clean && onJoinCustomRoom) {
      onJoinCustomRoom(clean);
    } else {
      onSelectMode('chat');
    }
  };

  return (
    <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-between px-2 sm:px-4 md:px-6 py-1 sm:py-2 max-w-5xl mx-auto">
      {/* 1. Header Minimal Branding & Duolingo Mascot Welcome (Compact & Uncluttered) */}
      <div className="w-full max-w-4xl mb-2 sm:mb-2.5 flex-shrink-0 flex flex-col md:flex-row items-center justify-between gap-2 sm:gap-3 bg-white/90 p-2 sm:p-2.5 rounded-2xl border-2 border-[#E5E5E5] border-b-[3px] shadow-sm">
        {/* Left: Mascot & Headline */}
        <div className="flex items-center gap-2.5 sm:gap-3 text-left w-full md:w-auto min-w-0">
          {/* Mitra Mascot */}
          <div className="relative flex-shrink-0 cursor-pointer hover:scale-105 active:scale-95 transition-transform">
            <HeroMascotArt className="w-11 h-11 sm:w-13 sm:h-13" />
            <span className="absolute -bottom-1 -right-0.5 inline-flex items-center gap-0.5 px-1 py-0.2 rounded-full bg-white border border-[#18181B] text-[7.5px] font-black text-[#15803D] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span>AI</span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="inline-flex items-center gap-1 text-[10px] font-black text-[#58CC02] bg-[#EEFDE5] px-2 py-0.5 rounded-full border border-[#58CC02]/30">
                <Sparkles className="w-2.5 h-2.5 fill-[#58CC02]" /> 100% Free Edge AI
              </span>
              <span className="text-[11px] font-bold text-zinc-400 font-mono hidden sm:inline">
                संकेत • SANKET ISL
              </span>
              <span className="text-[11px] font-bold text-zinc-600 hidden min-[480px]:inline">
                👋 Namaste!
              </span>
            </div>
            <h1 className="text-base sm:text-lg lg:text-xl font-black text-[#3C3C3C] tracking-tight leading-tight mt-0.5">
              Indian Sign Language,{' '}
              <span className="text-[#58CC02] relative inline-block">
                <span>made simple.</span>
                <span
                  className="absolute -bottom-0.5 left-0 right-0 h-1.5 bg-[#D7FFB8] -rotate-1 rounded-full -z-0 opacity-80"
                  aria-hidden="true"
                />
              </span>
            </h1>
            <p className="text-[11px] sm:text-xs text-zinc-600 font-bold truncate max-w-sm sm:max-w-lg md:max-w-xl">
              Learn 1,000+ signs with live AI feedback or start a real-time translated call.
            </p>
          </div>
        </div>

        {/* Right: Quick App Guide & AI Chatbot Launchers */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0 w-full md:w-auto justify-end">
          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="duo-btn duo-btn-gold !py-1.5 !px-2.5 sm:!px-3 text-xs font-black shadow-sm flex items-center gap-1 flex-shrink-0"
              title="Open interactive application guide and walkthrough"
            >
              <HelpCircle className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Quick Guide</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5] hidden min-[400px]:inline" />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenChatbot}
            className="duo-btn bg-white hover:bg-[#FFF9E5] border-2 border-zinc-900 text-zinc-900 !py-1.5 !px-2.5 sm:!px-3 text-xs font-black shadow-sm flex items-center gap-1.5 transition-all flex-shrink-0"
            title="Open Sanket AI Chatbot (BYOK)"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Ask AI Guide</span>
            <span className="text-[9px] font-black uppercase px-1 py-0.5 rounded bg-amber-200 text-amber-950 border border-amber-600/60 leading-none">
              BYOK
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher for Quick Arena Jump (< md) */}
      <div className="w-full flex md:hidden bg-[#E5F3E4] p-1 rounded-2xl border-2 border-[#18181B] mb-2 shadow-cartoon-sm flex-shrink-0 max-w-sm">
        <button
          type="button"
          onClick={() => setMobileHomeTab('learn')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mobileHomeTab === 'learn'
              ? 'bg-[#58CC02] text-white border-2 border-[#46A302] border-b-[3px] shadow-sm'
              : 'text-zinc-600'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Learn ISL</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileHomeTab('chat')}
          className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mobileHomeTab === 'chat'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] border-b-[3px] shadow-sm'
              : 'text-zinc-600'
          }`}
        >
          <Video className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Sign Call</span>
        </button>
      </div>

      {/* 2. Primary Choice Arena: Dual Minimal Portals (Both Action Buttons Above-The-Fold) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-4 items-stretch max-w-4xl flex-1 min-h-0">
        {/* =========================================================================
            CARD 1: LEARN ISL (Duolingo Green Theme)
            ========================================================================= */}
        <div
          onClick={() => onSelectMode('learn')}
          className={`duo-card bg-white p-3 sm:p-4 flex-col justify-between cursor-pointer group hover:-translate-y-0.5 transition-all duration-150 relative ${
            mobileHomeTab === 'learn' ? 'flex' : 'hidden md:flex'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectMode('learn')}
        >
          <div className="flex flex-col flex-1 min-h-0">
            {/* Card Accent Top Banner */}
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#EEFDE5] border-2 border-[#58CC02] text-[10px] font-black text-[#388402]">
                <Compass className="w-3 h-3 text-[#58CC02] stroke-[2.5]" />
                <span>PRACTICE &amp; MASTER</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 font-mono">
                Self-Paced
              </span>
            </div>

            {/* Artistic SVG Illustration (Responsively scaled so card never causes vertical overflow) */}
            <div className="w-full max-w-[240px] sm:max-w-[270px] max-h-[50px] min-[400px]:max-h-[70px] sm:max-h-[105px] md:max-h-[120px] mx-auto py-0.5 group-hover:scale-[1.02] transition-transform duration-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <ArtisticLearnIllustration className="w-full h-auto max-h-[120px]" />
            </div>

            {/* Text Content */}
            <div className="mt-1.5 text-left flex-1 min-h-0 flex flex-col justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#3C3C3C] tracking-tight flex items-center justify-between">
                  <span>Learn ISL Curriculum</span>
                  <span className="text-xs sm:text-sm font-black text-[#58CC02] group-hover:translate-x-1 transition-transform">
                    Start →
                  </span>
                </h2>
                <p className="mt-1 text-[11px] sm:text-xs text-zinc-700 font-bold leading-snug">
                  Step-by-step 7 levels: start with Namaste, master two-handed A–Z fingerspelling, daily needs, transit, and 1,000+ signs with live AI feedback.
                </p>
              </div>

              {/* Micro Feature List */}
              <div className="mt-2 pt-1.5 border-t border-zinc-100 flex flex-wrap gap-1 flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#388402] bg-[#EEFDE5] px-2 py-0.5 rounded-md border border-[#58CC02]/30">
                  <CheckCircle2 className="w-3 h-3 text-[#58CC02]" /> Namaste (L1)
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#388402] bg-[#EEFDE5] px-2 py-0.5 rounded-md border border-[#58CC02]/30">
                  <CheckCircle2 className="w-3 h-3 text-[#58CC02]" /> 3 Reps to Master
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#388402] bg-[#EEFDE5] px-2 py-0.5 rounded-md border border-[#58CC02]/30">
                  <CheckCircle2 className="w-3 h-3 text-[#58CC02]" /> 1,000+ Sign Lexicon
                </span>
              </div>
            </div>
          </div>

          {/* Primary CTA Button (Prominently placed above-the-fold) */}
          <div className="mt-2.5 pt-1 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectMode('learn');
              }}
              className="w-full duo-btn duo-btn-green !py-2.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>START LEARNING (LEVEL 1)</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            CARD 2: VIDEO CALL & LIVE TRANSLATOR (Macaw Blue Theme)
            ========================================================================= */}
        <div
          onClick={() => onSelectMode('chat')}
          className={`duo-card bg-white p-3 sm:p-4 flex-col justify-between cursor-pointer group hover:-translate-y-0.5 transition-all duration-150 relative ${
            mobileHomeTab === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectMode('chat')}
        >
          <div className="flex flex-col flex-1 min-h-0">
            {/* Card Accent Top Banner */}
            <div className="flex items-center justify-between mb-1.5 flex-shrink-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#DDF4FE] border-2 border-[#1CB0F6] text-[10px] font-black text-[#0284C7]">
                <Video className="w-3 h-3 text-[#1CB0F6] stroke-[2.5]" />
                <span>SIGN VIDEO CALL</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-500 font-mono">
                P2P Encrypted • &lt;20ms
              </span>
            </div>

            {/* Artistic SVG Illustration (Responsively scaled so card never causes vertical overflow) */}
            <div className="w-full max-w-[240px] sm:max-w-[270px] max-h-[50px] min-[400px]:max-h-[70px] sm:max-h-[105px] md:max-h-[120px] mx-auto py-0.5 group-hover:scale-[1.02] transition-transform duration-200 flex items-center justify-center flex-shrink-0 overflow-hidden">
              <ArtisticCallIllustration className="w-full h-auto max-h-[120px]" />
            </div>

            {/* Text Content */}
            <div className="mt-1.5 text-left flex-1 min-h-0 flex flex-col justify-between">
              <div>
                <h2 className="text-base sm:text-lg font-black text-[#3C3C3C] tracking-tight flex items-center justify-between">
                  <span>Sign Video Call &amp; Auto-Translator</span>
                  <span className="text-xs sm:text-sm font-black text-[#1CB0F6] group-hover:translate-x-1 transition-transform">
                    Start Call →
                  </span>
                </h2>
                <p className="mt-1 text-[11px] sm:text-xs text-zinc-700 font-bold leading-snug">
                  Dual-camera video calling with simultaneous sign guessing and automatic ISL-to-English translation. No manual "Send" needed.
                </p>
              </div>

              {/* Micro Feature List */}
              <div className="mt-2 pt-1.5 border-t border-zinc-100 flex flex-wrap gap-1 flex-shrink-0">
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#0284C7] bg-[#DDF4FE] px-2 py-0.5 rounded-md border border-[#1CB0F6]/30">
                  <CheckCircle2 className="w-3 h-3 text-[#1CB0F6]" /> Dual-Camera Grid
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#0284C7] bg-[#DDF4FE] px-2 py-0.5 rounded-md border border-[#1CB0F6]/30">
                  <CheckCircle2 className="w-3 h-3 text-[#1CB0F6]" /> Hands-Free Auto-Commit
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black text-[#0284C7] bg-[#DDF4FE] px-2 py-0.5 rounded-md border border-[#1CB0F6]/30">
                  <CheckCircle2 className="w-3 h-3 text-[#1CB0F6]" /> Distributed Edge AI
                </span>
              </div>
            </div>
          </div>

          {/* Call Actions (Direct Start or Custom Room Code) */}
          <div className="mt-2.5 pt-1 flex flex-col gap-1.5 flex-shrink-0">
            {!showRoomInput ? (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMode('chat');
                  }}
                  className="flex-1 duo-btn duo-btn-blue !py-2.5 text-xs sm:text-sm font-black flex items-center justify-center gap-2 min-w-0"
                >
                  <Video className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                  <span className="truncate">START SIGN CALL</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoomInput(true);
                  }}
                  className="cartoon-btn bg-white hover:bg-zinc-100 !py-2 !px-2.5 text-xs font-bold flex items-center gap-1 flex-shrink-0"
                  title="Join an existing room code"
                >
                  <Hash className="w-3.5 h-3.5 text-zinc-700 flex-shrink-0" />
                  <span>Join</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleJoinSubmit}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1.5"
              >
                <input
                  type="text"
                  value={customRoomInput}
                  onChange={(e) => setCustomRoomInput(e.target.value)}
                  placeholder="Enter room code..."
                  autoFocus
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold bg-[#FAF8F5] border-2 border-zinc-900 rounded-xl focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  className="cartoon-btn cartoon-btn-secondary !py-1.5 !px-3 text-xs font-black flex-shrink-0"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => setShowRoomInput(false)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-1 flex-shrink-0"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Minimal Trust & Technical Credentials */}
      <div className="mt-2 pt-1 flex-shrink-0 w-full max-w-4xl flex flex-wrap items-center justify-between gap-1.5 text-zinc-500 text-[10.5px] sm:text-[11px] font-semibold border-t border-zinc-200/60">
        <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-zinc-700">
            <Zap className="w-3 h-3 text-[#FFD15C] fill-[#FFD15C] flex-shrink-0" />
            <span>100% In-Browser Edge AI</span>
          </span>
          <span className="flex items-center gap-1 text-zinc-700">
            <ShieldCheck className="w-3 h-3 text-[#22C55E] flex-shrink-0" />
            <span>Zero Video Saved</span>
          </span>
          <span className="flex items-center gap-1 text-zinc-700">
            <Globe className="w-3 h-3 text-[#38BDF8] flex-shrink-0" />
            <span>Direct P2P WebRTC</span>
          </span>
        </div>

        <div className="flex items-center gap-2.5 sm:gap-3 text-[10.5px] sm:text-[11px] flex-wrap">
          <button
            onClick={onOpenChatbot}
            className="hover:text-zinc-900 underline underline-offset-2 transition-colors font-bold text-amber-700 flex items-center gap-1"
          >
            <Sparkles className="w-3 h-3 text-amber-500 fill-amber-500 flex-shrink-0" />
            <span>AI Chatbot</span>
          </button>
          {onOpenDictionary && (
            <button
              onClick={onOpenDictionary}
              className="hover:text-zinc-900 underline underline-offset-2 transition-colors"
            >
              Dictionary
            </button>
          )}
          {onOpenGuide && (
            <button
              onClick={onOpenGuide}
              className="hover:text-zinc-900 underline underline-offset-2 transition-colors"
            >
              How It Works
            </button>
          )}
          {onOpenAbout && (
            <button
              onClick={onOpenAbout}
              className="hover:text-zinc-900 underline underline-offset-2 transition-colors"
            >
              About
            </button>
          )}
          {onOpenFeedback && (
            <button
              onClick={onOpenFeedback}
              className="hover:text-zinc-900 underline underline-offset-2 transition-colors font-bold text-zinc-700"
            >
              Report Issue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default HomePage;
