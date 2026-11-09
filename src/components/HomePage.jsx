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
  Hash
} from 'lucide-react';

/**
 * Artistic Vector SVG for Learn ISL
 * Handcrafted vector artwork depicting human gesture learning,
 * biometric landmark constellations, and kinetic motion curves.
 */
function ArtisticLearnIllustration({ className = 'w-full h-auto' }) {
  return (
    <svg
      viewBox="0 0 340 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Soft Radial Ambient Glow */}
        <radialGradient id="learnAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FEF3C7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#FEF3C7" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Ambient Backdrop Glow & Orbital Guides */}
      <circle cx="170" cy="95" r="78" fill="url(#learnAura)" />
      <circle cx="170" cy="95" r="66" stroke="#FDE68A" strokeWidth="1.6" strokeDasharray="5 6" />

      {/* Dynamic Trajectory / Motion Guides */}
      <path
        d="M 38 138 C 72 44, 238 38, 302 118"
        stroke="#F59E0B"
        strokeWidth="2.4"
        strokeDasharray="5 6"
        strokeLinecap="round"
      />
      <path
        d="M 64 152 C 108 82, 208 76, 274 140"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeDasharray="3 5"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* 2. Top-Left: Tactile 3D Floating Alphabet Tile "A" */}
      <g transform="translate(24, 20) rotate(-7)">
        {/* Drop Shadow */}
        <rect x="4" y="4" width="48" height="48" rx="12" fill="#18181B" />
        {/* White Border Frame */}
        <rect x="0" y="0" width="48" height="48" rx="12" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.4" />
        {/* Sunny Yellow Face */}
        <rect x="3.5" y="3.5" width="41" height="41" rx="9" fill="#FFD15C" />
        {/* Beveled Top Highlight */}
        <path d="M 5 13 C 5 8, 8 5, 14 5 L 39 5 C 34 5, 7 8, 5 19 Z" fill="#FFFFFF" fillOpacity="0.5" />
        {/* Letter A */}
        <text
          x="24"
          y="31"
          textAnchor="middle"
          fontSize="23"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#18181B"
        >
          A
        </text>
        {/* Sub-label */}
        <text
          x="24"
          y="39"
          textAnchor="middle"
          fontSize="6.5"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
          fill="#78350F"
          letterSpacing="0.08em"
        >
          ISL
        </text>
      </g>

      {/* 3. Top-Right: AI Verification Chip "AI • 99%" */}
      <g transform="translate(242, 22) rotate(6)">
        {/* Drop Shadow */}
        <rect x="3" y="3" width="72" height="30" rx="9" fill="#18181B" />
        {/* Chip Body */}
        <rect x="0" y="0" width="72" height="30" rx="9" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.2" />
        <rect x="2.5" y="2.5" width="67" height="25" rx="7" fill="#F0FDF4" />
        {/* Pulsing Active Radar Dot */}
        <circle cx="13" cy="15" r="4.5" fill="#22C55E" />
        <circle cx="13" cy="15" r="7" stroke="#22C55E" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />
        {/* Chip Text */}
        <text
          x="23"
          y="18.5"
          fontSize="9.5"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#18181B"
          letterSpacing="0.04em"
        >
          AI • 99%
        </text>
      </g>

      {/* 4. Bottom-Right: Level 1 Milestone Tag */}
      <g transform="translate(254, 122)">
        <rect x="2.5" y="2.5" width="64" height="23" rx="7" fill="#18181B" />
        <rect x="0" y="0" width="64" height="23" rx="7" fill="#FFFBEB" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="12" cy="11.5" r="4" fill="#F59E0B" />
        <text
          x="20"
          y="15"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#78350F"
          letterSpacing="0.04em"
        >
          LEVEL 1
        </text>
      </g>

      {/* 5. Main Hand & 21-Node Biometric Constellation */}
      <g id="hand-group">
        {/* Hand Drop Shadow */}
        <path
          d="M 148 168 C 146 153, 143 144, 139 136 C 132 126, 117 117, 109 107 C 103 99, 107 91, 115 91 C 123 91, 135 103, 143 99 C 143 90, 144 62, 146 52 C 147 44, 156 44, 157 52 C 158 63, 159 75, 160 80 C 161 63, 164 42, 167 34 C 169 26, 179 26, 181 34 C 183 43, 182 66, 183 81 C 184 66, 187 48, 189 40 C 191 32, 199 32, 201 40 C 202 49, 202 70, 203 88 C 204 76, 207 62, 209 55 C 211 49, 219 49, 220 56 C 221 66, 218 97, 215 119 C 212 139, 204 155, 197 168 Z"
          fill="#18181B"
        />

        {/* Hand Base (Crisp White with Dark Ink Outline) */}
        <path
          d="M 144 165 C 142 150, 139 141, 135 133 C 128 123, 113 114, 105 104 C 99 96, 103 88, 111 88 C 119 88, 131 100, 139 96 C 139 87, 140 59, 142 49 C 143 41, 152 41, 153 49 C 154 60, 155 72, 156 77 C 157 60, 160 39, 163 31 C 165 23, 175 23, 177 31 C 179 40, 178 63, 179 78 C 180 63, 183 45, 185 37 C 187 29, 195 29, 197 37 C 198 46, 198 67, 199 85 C 200 73, 203 59, 205 52 C 207 46, 215 46, 216 53 C 217 63, 214 94, 211 116 C 208 136, 200 152, 193 165 Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Palm Creases for Anatomical Depth */}
        <path
          d="M 139 96 C 145 114, 153 130, 168 142"
          stroke="#E4E4E7"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
        <path
          d="M 154 86 C 170 90, 186 92, 202 93"
          stroke="#E4E4E7"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Tactile Wrist Cuff (Sunny Yellow) */}
        <rect x="141" y="158" width="54" height="8" rx="3" fill="#FFD15C" stroke="#18181B" strokeWidth="2.4" />

        {/* --- MediaPipe Skeletal Links (Bones) --- */}
        {/* Palm Links (Wrist to MCP Knuckles) */}
        <line x1="168" y1="152" x2="133" y2="124" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="168" y1="152" x2="147" y2="86" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="168" y1="152" x2="167" y2="82" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="168" y1="152" x2="186" y2="85" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />
        <line x1="168" y1="152" x2="203" y2="92" stroke="#22C55E" strokeWidth="1.8" strokeDasharray="3 3" />

        {/* Finger Bones (MCP to Tips) */}
        {/* Thumb */}
        <line x1="133" y1="124" x2="120" y2="112" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="120" y1="112" x2="112" y2="100" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="112" y1="100" x2="108" y2="89" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />

        {/* Index */}
        <line x1="147" y1="86" x2="147" y2="67" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="147" y1="67" x2="148" y2="52" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="148" y1="52" x2="148" y2="43" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />

        {/* Middle */}
        <line x1="167" y1="82" x2="168" y2="59" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="168" y1="59" x2="169" y2="44" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="169" y1="44" x2="170" y2="26" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />

        {/* Ring */}
        <line x1="186" y1="85" x2="188" y2="64" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="188" y1="64" x2="190" y2="48" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="190" y1="48" x2="191" y2="33" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />

        {/* Pinky */}
        <line x1="203" y1="92" x2="206" y2="76" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="206" y1="76" x2="209" y2="62" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />
        <line x1="209" y1="62" x2="211" y2="50" stroke="#0284C7" strokeWidth="2" strokeDasharray="3 3" />

        {/* --- MediaPipe Keypoint Nodes --- */}
        {/* Wrist Root Node */}
        <circle cx="168" cy="152" r="7.5" fill="none" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="168" cy="152" r="4" fill="#22C55E" stroke="#18181B" strokeWidth="1.8" />

        {/* MCP Knuckles (Yellow Anchors) */}
        <circle cx="133" cy="124" r="3" fill="#FFD15C" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="147" cy="86" r="3" fill="#FFD15C" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="167" cy="82" r="3" fill="#FFD15C" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="186" cy="85" r="3" fill="#FFD15C" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="203" cy="92" r="3" fill="#FFD15C" stroke="#18181B" strokeWidth="1.6" />

        {/* PIP / DIP Mid Joints */}
        <circle cx="120" cy="112" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="112" cy="100" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />

        <circle cx="147" cy="67" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="148" cy="52" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />

        <circle cx="168" cy="59" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="169" cy="44" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />

        <circle cx="188" cy="64" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="190" cy="48" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />

        <circle cx="206" cy="76" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
        <circle cx="209" cy="62" r="2.5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />

        {/* Tracked Fingertip Targets (Glowing Cyan Reticles) */}
        {/* Thumb Tip */}
        <circle cx="108" cy="89" r="6" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 2" />
        <circle cx="108" cy="89" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="108" cy="89" r="1.5" fill="#FFFFFF" />

        {/* Index Tip */}
        <circle cx="148" cy="43" r="6" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 2" />
        <circle cx="148" cy="43" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="148" cy="43" r="1.5" fill="#FFFFFF" />

        {/* Middle Tip (Primary Focus Reticle) */}
        <circle cx="170" cy="26" r="7.5" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="170" cy="26" r="4.2" fill="#38BDF8" stroke="#18181B" strokeWidth="2" />
        <circle cx="170" cy="26" r="1.8" fill="#FFFFFF" />
        {/* Reticle Crosshairs */}
        <line x1="160" y1="26" x2="164" y2="26" stroke="#0284C7" strokeWidth="1.5" />
        <line x1="176" y1="26" x2="180" y2="26" stroke="#0284C7" strokeWidth="1.5" />
        <line x1="170" y1="16" x2="170" y2="20" stroke="#0284C7" strokeWidth="1.5" />
        <line x1="170" y1="32" x2="170" y2="36" stroke="#0284C7" strokeWidth="1.5" />

        {/* Ring Tip */}
        <circle cx="191" cy="33" r="6" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 2" />
        <circle cx="191" cy="33" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="191" cy="33" r="1.5" fill="#FFFFFF" />

        {/* Pinky Tip */}
        <circle cx="211" cy="50" r="6" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 2" />
        <circle cx="211" cy="50" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="211" cy="50" r="1.5" fill="#FFFFFF" />
      </g>

      {/* 6. Decorative Sparkles & Accents */}
      <g transform="translate(195, 12)">
        <path d="M7 0 L8.5 5.5 L14 7 L8.5 8.5 L7 14 L5.5 8.5 L0 7 L5.5 5.5 Z" fill="#F59E0B" />
      </g>
      <g transform="translate(68, 86)">
        <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#38BDF8" />
      </g>
      <g transform="translate(286, 78)">
        <path d="M6 0 L7.5 4.5 L12 6 L7.5 7.5 L6 12 L4.5 7.5 L0 6 L4.5 4.5 Z" fill="#22C55E" />
      </g>
    </svg>
  );
}

/**
 * Artistic Vector SVG for Video Call & Sign Translation
 * High-concept vector artwork showing two communicating hands meeting across
 * a high-speed P2P video camera bridge, with real-time translation speech bubble,
 * biometric AI keypoints on the signing hand, and voice waveforms on the hearing partner.
 */
function ArtisticCallIllustration({ className = 'w-full h-auto' }) {
  return (
    <svg
      viewBox="0 0 340 180"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        {/* Soft Radial Ambient Bridge Glow */}
        <radialGradient id="callAura" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#E0F2FE" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 1. Ambient Communication Glow & Orbital Guides */}
      <circle cx="170" cy="106" r="78" fill="url(#callAura)" />
      <circle cx="170" cy="106" r="64" stroke="#BAE6FD" strokeWidth="1.6" strokeDasharray="5 5" />

      {/* Real-Time P2P Waveform Stream */}
      <path
        d="M 80 110 C 108 84, 134 128, 170 108 C 206 88, 232 130, 260 108"
        stroke="#0284C7"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M 85 116 C 112 92, 136 134, 170 114 C 204 94, 228 136, 255 114"
        stroke="#38BDF8"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeDasharray="4 4"
        opacity="0.8"
      />

      {/* Data Packet Nodes */}
      <circle cx="120" cy="98" r="3.5" fill="#FFD15C" stroke="#18181B" strokeWidth="1.5" />
      <circle cx="220" cy="122" r="3.5" fill="#22C55E" stroke="#18181B" strokeWidth="1.5" />

      {/* 2. Top-Center: Live Translated Subtitle Speech Bubble Ribbon */}
      <g transform="translate(50, 14)">
        {/* Drop Shadow */}
        <rect x="3.5" y="3.5" width="240" height="42" rx="12" fill="#18181B" />
        {/* Speech Card Body */}
        <rect x="0" y="0" width="240" height="42" rx="12" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.4" />
        {/* Soft Green Inset */}
        <rect x="3" y="3" width="234" height="36" rx="9" fill="#F0FDF4" />

        {/* Live Broadcast Indicator */}
        <circle cx="18" cy="21" r="4.5" fill="#22C55E" />
        <circle cx="18" cy="21" r="8" stroke="#22C55E" strokeWidth="1.2" strokeDasharray="2 2" opacity="0.6" />

        {/* Subtitle Text */}
        <text
          x="32"
          y="25.5"
          fontSize="13"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#18181B"
          letterSpacing="-0.01em"
        >
          "Namaste! How are you?"
        </text>

        {/* ISL -> ENG Translation Badge */}
        <rect x="188" y="11" width="44" height="20" rx="6" fill="#DCFCE7" stroke="#16A34A" strokeWidth="1.2" />
        <text
          x="210"
          y="24.5"
          textAnchor="middle"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#15803D"
        >
          ISL ⇄ EN
        </text>

        {/* Centered Speech Bubble Tail */}
        <polygon points="112,42 120,51 128,42" fill="#FFFFFF" stroke="#18181B" strokeWidth="2" />
        <polygon points="113,41 120,48 127,41" fill="#F0FDF4" />
      </g>

      {/* 3. Left Hand: ISL Signer (Expressive Gesture with AI Vision Landmark Tracking) */}
      <g id="signer-hand" transform="translate(14, 62)">
        {/* Drop Shadow */}
        <path
          d="M 12 104 C 18 90, 26 80, 36 74 C 44 64, 52 46, 56 32 C 58 26, 64 26, 67 31 C 70 38, 71 52, 69 62 C 73 54, 78 40, 83 34 C 86 30, 92 30, 94 35 C 97 44, 95 60, 91 70 C 94 65, 99 55, 102 52 C 105 48, 110 50, 110 55 C 111 65, 104 80, 96 92 C 84 106, 68 114, 46 114 L 12 108 Z"
          fill="#18181B"
        />
        {/* Main Hand Body */}
        <path
          d="M 9 101 C 15 87, 23 77, 33 71 C 41 61, 49 43, 53 29 C 55 23, 61 23, 64 28 C 67 35, 68 49, 66 59 C 70 51, 75 37, 80 31 C 83 27, 89 27, 91 32 C 94 41, 92 57, 88 67 C 91 62, 96 52, 99 49 C 102 45, 107 47, 107 52 C 108 62, 101 77, 93 89 C 81 103, 65 111, 43 111 L 9 105 Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Thumb (Curved Outward) */}
        <path
          d="M 28 80 C 20 78, 12 84, 13 92 C 14 98, 22 102, 34 99"
          fill="#FFD15C"
          stroke="#18181B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Wrist Cuff (Sunny Yellow) */}
        <rect x="8" y="99" width="34" height="8" rx="3" fill="#FFD15C" stroke="#18181B" strokeWidth="2.2" />

        {/* AI Landmark Points & Skeleton Overlay on Signer's Hand */}
        {/* Fingertips (Cyan Target Nodes) */}
        <circle cx="58" cy="27" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="58" cy="27" r="1.5" fill="#FFFFFF" />

        <circle cx="85" cy="30" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="85" cy="30" r="1.5" fill="#FFFFFF" />

        <circle cx="103" cy="51" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="103" cy="51" r="1.5" fill="#FFFFFF" />

        <circle cx="13" cy="92" r="3.2" fill="#38BDF8" stroke="#18181B" strokeWidth="1.6" />

        {/* Knuckles & Palm Hub (Mint Green) */}
        <circle cx="64" cy="62" r="3.2" fill="#22C55E" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="82" cy="68" r="3.2" fill="#22C55E" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="44" cy="88" r="3.5" fill="#22C55E" stroke="#18181B" strokeWidth="1.5" />

        {/* AI Skeleton Linkages */}
        <line x1="44" y1="88" x2="64" y2="62" stroke="#22C55E" strokeWidth="1.6" strokeDasharray="2.5 2.5" />
        <line x1="44" y1="88" x2="82" y2="68" stroke="#22C55E" strokeWidth="1.6" strokeDasharray="2.5 2.5" />
        <line x1="64" y1="62" x2="58" y2="27" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="2.5 2.5" />
        <line x1="82" y1="68" x2="85" y2="30" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="2.5 2.5" />
        <line x1="82" y1="68" x2="103" y2="51" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="2.5 2.5" />
      </g>

      {/* 4. Right Hand: Hearing / Video Partner (Receiving / Greeting with Voice Waveforms) */}
      <g id="receiver-hand" transform="translate(204, 62)">
        {/* Drop Shadow */}
        <path
          d="M 112 104 C 106 90, 98 80, 88 74 C 80 64, 72 46, 68 32 C 66 26, 60 26, 57 31 C 54 38, 53 52, 55 62 C 51 54, 46 40, 41 34 C 38 30, 32 30, 30 35 C 27 44, 29 60, 33 70 C 30 65, 25 55, 22 52 C 19 48, 14 50, 14 55 C 13 65, 20 80, 28 92 C 40 106, 56 114, 78 114 L 112 108 Z"
          fill="#18181B"
        />
        {/* Main Hand Body */}
        <path
          d="M 109 101 C 103 87, 95 77, 85 71 C 77 61, 69 43, 65 29 C 63 23, 57 23, 54 28 C 51 35, 50 49, 52 59 C 48 51, 43 37, 38 31 C 35 27, 29 27, 27 32 C 24 41, 26 57, 30 67 C 27 62, 22 52, 19 49 C 16 45, 11 47, 11 52 C 10 62, 17 77, 25 89 C 37 103, 53 111, 75 111 L 109 105 Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Thumb (Curved Outward) */}
        <path
          d="M 90 80 C 98 78, 106 84, 105 92 C 104 98, 96 102, 84 99"
          fill="#38BDF8"
          stroke="#18181B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />

        {/* Wrist Cuff (Sky Blue) */}
        <rect x="76" y="99" width="34" height="8" rx="3" fill="#38BDF8" stroke="#18181B" strokeWidth="2.2" />

        {/* Active Equalizer Voice Soundwaves Blooming from Peer */}
        <g transform="translate(10, 8)">
          <rect x="0" y="16" width="3.5" height="18" rx="1.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.2" />
          <rect x="6" y="8" width="3.5" height="34" rx="1.8" fill="#22C55E" stroke="#18181B" strokeWidth="1.2" />
          <rect x="12" y="18" width="3.5" height="14" rx="1.8" fill="#FFD15C" stroke="#18181B" strokeWidth="1.2" />
          <rect x="18" y="4" width="3.5" height="42" rx="1.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.2" />
        </g>
      </g>

      {/* 5. Center Hub: Smart Video Camera & P2P Engine */}
      <g transform="translate(148, 94)">
        {/* Camera Drop Shadow */}
        <rect x="3" y="3" width="44" height="32" rx="8" fill="#18181B" />
        <polygon points="47,19 57,13 57,29 47,23" fill="#18181B" />

        {/* Camera Body */}
        <rect x="0" y="0" width="44" height="32" rx="8" fill="#18181B" stroke="#18181B" strokeWidth="2" />
        <polygon points="44,16 54,10 54,26 44,20" fill="#18181B" stroke="#18181B" strokeWidth="1.5" />

        {/* Lens Aperture Optics */}
        <circle cx="18" cy="16" r="10" fill="#0F172A" stroke="#38BDF8" strokeWidth="2" />
        <circle cx="16" cy="14" r="4" fill="#38BDF8" fillOpacity="0.8" />
        <circle cx="15" cy="13" r="1.8" fill="#FFFFFF" />

        {/* Live Red Recording LED */}
        <circle cx="36" cy="8" r="2.5" fill="#EF4444" />
      </g>

      {/* 6. Latency Speed Tag below Camera */}
      <g transform="translate(142, 142)">
        <rect x="1.5" y="1.5" width="56" height="18" rx="5" fill="#18181B" />
        <rect x="0" y="0" width="56" height="18" rx="5" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.6" />
        <circle cx="9" cy="9" r="2.8" fill="#22C55E" />
        <text
          x="16"
          y="12.5"
          fontSize="8"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#15803D"
          letterSpacing="0.04em"
        >
          ⚡ &lt; 20ms
        </text>
      </g>

      {/* 7. Decorative Sparkles & Rays */}
      <g transform="translate(48, 36)">
        <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#38BDF8" />
      </g>
      <g transform="translate(290, 32)">
        <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#FFD15C" />
      </g>
      <g transform="translate(136, 68)">
        <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#22C55E" />
      </g>
      <g transform="translate(202, 68)">
        <path d="M4 0 L5 3 L8 4 L5 5 L4 8 L3 5 L0 4 L3 3 Z" fill="#F59E0B" />
      </g>
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
  onOpenFeedback
}) {
  const [customRoomInput, setCustomRoomInput] = useState('');
  const [showRoomInput, setShowRoomInput] = useState(false);

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
    <div className="w-full flex-1 min-h-0 flex flex-col items-center justify-between px-3 sm:px-6 py-1 sm:py-2.5 max-w-5xl mx-auto">
      {/* 1. Header Minimal Branding & Purpose */}
      <div className="text-center max-w-2xl mb-2 sm:mb-3 flex-shrink-0">
        {/* Subtle Tagline Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-white border-2 border-zinc-900 shadow-cartoon-sm text-[10px] sm:text-[11px] font-black tracking-wide text-zinc-900 mb-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD15C] fill-[#FFD15C]" />
          <span>संकेत • SANKET ISL</span>
          <span className="text-zinc-300 font-normal">|</span>
          <span className="text-zinc-600 font-bold">Edge AI Vision Bridge</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-2xl sm:text-3xl lg:text-[2rem] font-black text-zinc-900 tracking-tight leading-tight">
          Indian Sign Language,{' '}
          <span className="relative inline-block">
            <span className="relative z-10">simplified.</span>
            <span
              className="absolute -bottom-0.5 left-0 right-0 h-2 bg-[#FFD15C] -rotate-1 rounded-sm -z-0 opacity-80"
              aria-hidden="true"
            />
          </span>
        </h1>

        <p className="mt-1 text-xs sm:text-[13px] text-zinc-600 font-medium max-w-lg mx-auto leading-normal">
          Choose where you want to start: practice signs with real-time skeleton AI guidance, or start an instant translated video call.
        </p>
      </div>

      {/* 2. Primary Choice Arena: Dual Minimal Portals */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch max-w-4xl">
        {/* =========================================================================
            CARD 1: LEARN ISL
            ========================================================================= */}
        <div
          onClick={() => onSelectMode('learn')}
          className="cartoon-card bg-white p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 hover:shadow-cartoon transition-all duration-150 border-2 border-zinc-900 relative"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectMode('learn')}
        >
          <div>
            {/* Card Accent Top Banner */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FFF9E5] border-2 border-zinc-900 text-[10px] font-black text-zinc-900">
                <Compass className="w-3 h-3 text-[#F59E0B] stroke-[2.5]" />
                <span>PRACTICE &amp; MASTER</span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 font-mono">
                Self-Paced
              </span>
            </div>

            {/* Artistic SVG Illustration */}
            <div className="w-full max-w-[210px] sm:max-w-[230px] mx-auto py-0.5 group-hover:scale-[1.02] transition-transform duration-200">
              <ArtisticLearnIllustration />
            </div>

            {/* Text Content */}
            <div className="mt-1 text-left">
              <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight flex items-center justify-between">
                <span>Learn ISL Curriculum</span>
                <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">
                  Studio →
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-zinc-600 font-medium leading-relaxed">
                Tailored 7-level course: start with Namaste, master two-handed A–Z fingerspelling, health, transit, and 1,000+ signs with live AI skeleton guidance.
              </p>

              {/* Micro Feature List */}
              <div className="mt-2 pt-1.5 border-t border-zinc-100 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-[#F4EFEA] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" /> Start with Namaste
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-[#F4EFEA] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" /> 7 Tailored Levels
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-[#F4EFEA] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" /> 1,000+ Lexicon Signs
                </span>
              </div>
            </div>
          </div>

          {/* Primary CTA Button */}
          <div className="mt-3 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectMode('learn');
              }}
              className="w-full cartoon-btn cartoon-btn-primary !py-2 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5 group-hover:bg-[#FFD15C]"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>Enter Learn Studio</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            CARD 2: VIDEO CALL & LIVE CHAT
            ========================================================================= */}
        <div
          onClick={() => onSelectMode('chat')}
          className="cartoon-card bg-white p-3.5 sm:p-4 lg:p-5 flex flex-col justify-between cursor-pointer group hover:-translate-y-1 hover:shadow-cartoon transition-all duration-150 border-2 border-zinc-900 relative"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectMode('chat')}
        >
          <div>
            {/* Card Accent Top Banner */}
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#E0F2FE] border-2 border-zinc-900 text-[10px] font-black text-zinc-900">
                  <Video className="w-3 h-3 text-[#0284C7] stroke-[2.5]" />
                  <span>REAL-TIME CALL</span>
                </div>
                <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-amber-300 text-amber-950 border border-amber-600/70 shadow-sm leading-none">
                  BETA
                </span>
              </div>
              <span className="text-[10px] font-bold text-zinc-400 font-mono">
                P2P Encrypted
              </span>
            </div>

            {/* Artistic SVG Illustration */}
            <div className="w-full max-w-[210px] sm:max-w-[230px] mx-auto py-0.5 group-hover:scale-[1.02] transition-transform duration-200">
              <ArtisticCallIllustration />
            </div>

            {/* Text Content */}
            <div className="mt-1 text-left">
              <h2 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <span>Video Call &amp; Chat</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-amber-300 text-amber-950 border border-amber-600/70 shadow-cartoon-sm">
                    BETA
                  </span>
                </span>
                <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">
                  Connect →
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-zinc-600 font-medium leading-relaxed">
                Connect face-to-face with friends or hearing colleagues with live sign-to-English translation and closed captions.
              </p>

              {/* Micro Feature List */}
              <div className="mt-2 pt-1.5 border-t border-zinc-100 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-[#F4EFEA] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" /> Direct P2P Video
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-[#F4EFEA] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" /> Live Subtitle HUD
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-[#F4EFEA] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" /> SOV-to-SVO Grammar
                </span>
              </div>
            </div>
          </div>

          {/* Call Actions (Direct Start or Custom Room Code) */}
          <div className="mt-3 pt-1 flex flex-col gap-1.5">
            {!showRoomInput ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMode('chat');
                  }}
                  className="flex-1 cartoon-btn cartoon-btn-secondary !py-2 text-xs sm:text-sm font-black flex items-center justify-center gap-1.5"
                >
                  <Video className="w-4 h-4 stroke-[2.5]" />
                  <span>Start Video Call</span>
                  <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-amber-300 text-amber-950 border border-amber-600/70">
                    BETA
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoomInput(true);
                  }}
                  className="cartoon-btn bg-white hover:bg-zinc-100 !py-2 !px-2.5 text-xs font-bold"
                  title="Join an existing room code"
                >
                  <Hash className="w-3.5 h-3.5 text-zinc-700" />
                  <span className="hidden sm:inline">Join</span>
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
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold bg-[#FAF8F5] border-2 border-zinc-900 rounded-xl focus:outline-none"
                />
                <button
                  type="submit"
                  className="cartoon-btn cartoon-btn-secondary !py-1.5 !px-3 text-xs font-black"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => setShowRoomInput(false)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-1"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* 3. Bottom Minimal Trust & Technical Credentials */}
      <div className="mt-3 pt-2 flex-shrink-0 w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 text-zinc-500 text-[11px] font-semibold">
        <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
          <span className="flex items-center gap-1 text-zinc-700">
            <Zap className="w-3 h-3 text-[#FFD15C] fill-[#FFD15C]" />
            <span>100% In-Browser Edge AI</span>
          </span>
          <span className="flex items-center gap-1 text-zinc-700">
            <ShieldCheck className="w-3 h-3 text-[#22C55E]" />
            <span>Zero Video Saved</span>
          </span>
          <span className="flex items-center gap-1 text-zinc-700">
            <Globe className="w-3 h-3 text-[#38BDF8]" />
            <span>Direct P2P WebRTC</span>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[11px]">
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
