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
  Hash,
  HelpCircle,
  MessageSquare,
  Hand
} from 'lucide-react';
import { HomeChatbotPopup } from './HomeChatbotPopup.jsx';
import AnimatedHeroOtter from './AnimatedHeroOtter.jsx';

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
        {/* Otter Coat Rich Gradients (Otter's Natural Colors) */}
        <linearGradient id="otterFurMain" x1="50%" y1="10%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#9E6439" />
          <stop offset="48%" stopColor="#844F27" />
          <stop offset="100%" stopColor="#643613" />
        </linearGradient>

        <linearGradient id="otterBibMain" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="45%" stopColor="#FFF4DF" />
          <stop offset="100%" stopColor="#F5DFBD" />
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

      {/* 5. Central Character: Mitra the ISL Otter Learner (Anatomically Polished Mascot) */}
      <g id="duo-learner-character">
        {/* Curved Otter Tail resting on right */}
        <path
          d="M 218 140 C 236 142, 248 150, 249 160 C 250 168, 240 173, 226 170 C 218 168, 212 160, 214 150 Z"
          fill="#522C0E"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Natural Seated Otter Torso in Cozy Purple Hoodie (Seamless Silhouette, No Donut!) */}
        <path
          d="M 160 88 C 146 96, 140 114, 138 132 C 136 150, 134 164, 140 171 C 146 176, 214 176, 220 171 C 226 164, 224 150, 222 132 C 220 114, 214 96, 200 88 Z"
          fill="#18181B"
        />
        <path
          d="M 160 86 C 146 94, 140 112, 138 130 C 136 148, 134 162, 140 169 C 146 174, 214 174, 220 169 C 226 162, 224 148, 222 130 C 220 112, 214 94, 200 86 Z"
          fill="#8B5CF6"
          stroke="#18181B"
          strokeWidth="2.8"
          strokeLinejoin="round"
        />

        {/* Hoodie Bottom Ribbed Hem */}
        <path
          d="M 140 160 C 152 165, 208 165, 220 160 L 220 168 C 210 173, 150 173, 140 168 Z"
          fill="#7C3AED"
          stroke="#18181B"
          strokeWidth="2"
        />

        {/* Hoodie Kangaroo Pocket */}
        <path
          d="M 158 144 C 168 140, 192 140, 202 144 C 205 158, 203 162, 200 163 C 188 165, 172 165, 160 163 C 157 162, 155 158, 158 144 Z"
          fill="#EDE9FE"
          stroke="#18181B"
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Hoodie Drawstring V & Collar */}
        <path d="M 172 88 L 180 102 L 188 88" stroke="#6D28D9" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <circle cx="178" cy="107" r="1.5" fill="#FFFFFF" />
        <circle cx="182" cy="107" r="1.5" fill="#FFFFFF" />

        {/* Natural Arms Extending from Shoulders to Center Chest */}
        {/* Left Sleeve */}
        <path
          d="M 144 104 C 138 116, 142 128, 154 136 C 158 139, 164 138, 166 134 C 168 130, 162 122, 156 114 C 152 108, 148 104, 144 104 Z"
          fill="#7C3AED"
          stroke="#18181B"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        {/* Right Sleeve */}
        <path
          d="M 216 104 C 222 116, 218 128, 206 136 C 202 139, 196 138, 194 134 C 192 130, 198 122, 204 114 C 208 108, 212 104, 216 104 Z"
          fill="#7C3AED"
          stroke="#18181B"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Otter Head Base */}
        <ellipse cx="180" cy="62" rx="36" ry="29" fill="#18181B" />
        <ellipse cx="180" cy="60" rx="36" ry="28" fill="url(#otterFurMain)" stroke="#18181B" strokeWidth="2.8" />

        {/* Rounded Otter Ears */}
        <g>
          <path d="M 145 50 C 137 45, 137 32, 149 35 C 156 37, 158 48, 153 54 Z" fill="#7A451E" stroke="#18181B" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 144 47 C 140 43, 141 36, 148 38 C 152 39, 153 44, 150 48 Z" fill="#FCE2C4" />
        </g>
        <g>
          <path d="M 215 50 C 223 45, 223 32, 211 35 C 204 37, 202 48, 207 54 Z" fill="#7A451E" stroke="#18181B" strokeWidth="2.4" strokeLinejoin="round" />
          <path d="M 216 47 C 220 43, 219 36, 212 38 C 208 39, 207 44, 210 48 Z" fill="#FCE2C4" />
        </g>

        {/* Playful Snapback Cap (Duolingo Gold) */}
        <path d="M 152 44 C 152 26, 164 16, 180 16 C 196 16, 208 26, 208 44 Z" fill="#18181B" />
        <path d="M 151 42 C 151 24, 163 14, 180 14 C 197 14, 209 24, 209 42 Z" fill="#FFC800" stroke="#18181B" strokeWidth="2.6" />
        <circle cx="180" cy="13" r="3.5" fill="#58CC02" stroke="#18181B" strokeWidth="1.8" />
        <path d="M 144 43 C 159 39, 201 39, 216 43 C 214 49, 208 51, 180 50 C 152 51, 146 49, 144 43 Z" fill="#E5A500" stroke="#18181B" strokeWidth="2.6" strokeLinejoin="round" />

        {/* Broad Cream Muzzle */}
        <path
          d="M 156 65 C 156 55, 167 52, 175 56 C 177 57, 183 57, 185 56 C 193 52, 204 55, 204 65 C 206 77, 195 83, 180 83 C 165 83, 154 77, 156 65 Z"
          fill="url(#otterBibMain)"
          stroke="#18181B"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Rosy Cheeks */}
        <ellipse cx="152" cy="68" rx="6" ry="4.5" fill="#FFA58C" opacity="0.85" />
        <ellipse cx="208" cy="68" rx="6" ry="4.5" fill="#FFAA8A" opacity="0.85" />

        {/* Big Sparkling Expressive Eyes */}
        <ellipse cx="164" cy="54" rx="7.5" ry="9" fill="#18181B" />
        <circle cx="162.5" cy="51.5" r="3.2" fill="#FFFFFF" />
        <circle cx="166.5" cy="57" r="1.4" fill="#FFFFFF" />

        <ellipse cx="196" cy="54" rx="7.5" ry="9" fill="#18181B" />
        <circle cx="194.5" cy="51.5" r="3.2" fill="#FFFFFF" />
        <circle cx="198.5" cy="57" r="1.4" fill="#FFFFFF" />

        {/* Otter Button Nose */}
        <path
          d="M 174 63 C 174 58.5, 186 58.5, 186 63 C 186 68, 182 70.5, 180 70.5 C 178 70.5, 174 68, 174 63 Z"
          fill="#1F1713"
          stroke="#18181B"
          strokeWidth="1.8"
        />
        <ellipse cx="178" cy="61.5" rx="2.5" ry="1.2" fill="#FFFFFF" opacity="0.85" />

        {/* Cheerful Smile */}
        <path d="M 180 70.5 L 180 73.5" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
        <path d="M 173 73.5 C 176 76.5, 180 76.5, 180 73.5 C 180 76.5, 184 76.5, 187 73.5" stroke="#18181B" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Cute Whiskers */}
        <path d="M 160 70 C 150 69, 142 72, 136 75" stroke="#4A260F" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
        <path d="M 161 74 C 151 75, 143 80, 138 84" stroke="#4A260F" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
        <path d="M 200 70 C 210 69, 218 72, 224 75" stroke="#4A260F" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />
        <path d="M 199 74 C 209 75, 217 80, 222 84" stroke="#4A260F" strokeWidth="1.2" strokeLinecap="round" opacity="0.85" />

        {/* 6. Adorable, Proportionate Otter Paws in Authentic ISL Posture */}
        {/* Left Paw (Mirrored Viewer Left) */}
        <g id="learner-left-paw">
          {/* Fur wrist cuff */}
          <ellipse cx="164" cy="132" rx="7" ry="4" fill="#643613" stroke="#18181B" strokeWidth="2" />
          {/* Paw Palm & Fingers */}
          <path
            d="M 158 132 C 156 122, 157 114, 161 107 C 163 103, 168 104, 169 108 C 170 112, 170 118, 171 122 C 173 117, 175 110, 178 111 C 181 112, 181 117, 179 122 C 180 126, 178 134, 170 135 Z"
            fill="#FFEAD8"
            stroke="#18181B"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Soft Paw Pad accent */}
          <ellipse cx="166" cy="126" rx="3.5" ry="4" fill="#FCE2C4" />
        </g>

        {/* Right Paw (Viewer Right) */}
        <g id="learner-right-paw">
          {/* Fur wrist cuff */}
          <ellipse cx="196" cy="132" rx="7" ry="4" fill="#643613" stroke="#18181B" strokeWidth="2" />
          {/* Paw Palm & Fingers */}
          <path
            d="M 202 132 C 204 122, 203 114, 199 107 C 197 103, 192 104, 191 108 C 190 112, 190 118, 189 122 C 187 117, 185 110, 182 111 C 179 112, 179 117, 181 122 C 180 126, 182 134, 190 135 Z"
            fill="#FFEAD8"
            stroke="#18181B"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Soft Paw Pad accent */}
          <ellipse cx="194" cy="126" rx="3.5" ry="4" fill="#FCE2C4" />
        </g>

        {/* 7. MediaPipe AI Vision Skeleton (Precision Scaled to Otter Paws) */}
        <g id="ai-vision-skeleton">
          {/* Palm Linkages (Wrist to Knuckles) */}
          <line x1="164" y1="132" x2="162" y2="122" stroke="#22C55E" strokeWidth="1.6" strokeDasharray="2 2" />
          <line x1="164" y1="132" x2="168" y2="120" stroke="#22C55E" strokeWidth="1.6" strokeDasharray="2 2" />
          <line x1="164" y1="132" x2="174" y2="122" stroke="#22C55E" strokeWidth="1.6" strokeDasharray="2 2" />

          <line x1="196" y1="132" x2="198" y2="122" stroke="#22C55E" strokeWidth="1.6" strokeDasharray="2 2" />
          <line x1="196" y1="132" x2="192" y2="120" stroke="#22C55E" strokeWidth="1.6" strokeDasharray="2 2" />
          <line x1="196" y1="132" x2="186" y2="122" stroke="#22C55E" strokeWidth="1.6" strokeDasharray="2 2" />

          {/* Finger Bones (Cyan Dotted Links to Tips) */}
          <line x1="162" y1="122" x2="161" y2="108" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="2 2" />
          <line x1="168" y1="120" x2="169" y2="106" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="2 2" />
          <line x1="174" y1="122" x2="177" y2="111" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="2 2" />

          <line x1="198" y1="122" x2="199" y2="108" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="2 2" />
          <line x1="192" y1="120" x2="191" y2="106" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="2 2" />
          <line x1="186" y1="122" x2="183" y2="111" stroke="#0284C7" strokeWidth="1.6" strokeDasharray="2 2" />

          {/* Wrist Hub Nodes */}
          <circle cx="164" cy="132" r="3.2" fill="#22C55E" stroke="#18181B" strokeWidth="1.4" />
          <circle cx="196" cy="132" r="3.2" fill="#22C55E" stroke="#18181B" strokeWidth="1.4" />

          {/* Knuckle Hub Nodes */}
          <circle cx="162" cy="122" r="2.2" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="168" cy="120" r="2.2" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="174" cy="122" r="2.2" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />

          <circle cx="198" cy="122" r="2.2" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="192" cy="120" r="2.2" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="186" cy="122" r="2.2" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />

          {/* Fingertip Reticles (High-Tech Glowing Cyan Target Rings) */}
          <circle cx="161" cy="108" r="4.5" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="161" cy="108" r="2.6" fill="#38BDF8" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="161" cy="108" r="1" fill="#FFFFFF" />

          <circle cx="169" cy="106" r="4.5" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="169" cy="106" r="2.6" fill="#38BDF8" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="169" cy="106" r="1" fill="#FFFFFF" />

          <circle cx="199" cy="108" r="4.5" stroke="#38BDF8" strokeWidth="1" strokeDasharray="2 2" />
          <circle cx="199" cy="108" r="2.6" fill="#38BDF8" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="199" cy="108" r="1" fill="#FFFFFF" />

          {/* Primary Crosshair Target Reticle on Right Index */}
          <circle cx="191" cy="106" r="6" stroke="#38BDF8" strokeWidth="1.4" strokeDasharray="2 2" />
          <circle cx="191" cy="106" r="3.2" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
          <circle cx="191" cy="106" r="1.2" fill="#FFFFFF" />
          <line x1="183" y1="106" x2="187" y2="106" stroke="#0284C7" strokeWidth="1.2" />
          <line x1="195" y1="106" x2="199" y2="106" stroke="#0284C7" strokeWidth="1.2" />
          <line x1="191" y1="98" x2="191" y2="102" stroke="#0284C7" strokeWidth="1.2" />
          <line x1="191" y1="110" x2="191" y2="114" stroke="#0284C7" strokeWidth="1.2" />
        </g>
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
 * and speed badge ("< 20ms").
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
        <clipPath id="screenViewportClip"><rect x="5" y="16" width="92" height="92" rx="10" /></clipPath>
        <linearGradient id="duoScreenFacet" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#F0F9FF" />
          <stop offset="100%" stopColor="#E0F2FE" />
        </linearGradient>
        {/* Otter Coat Rich Gradients (Otter's Natural Colors) */}
        <linearGradient id="otterFurMain" x1="50%" y1="10%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#9E6439" />
          <stop offset="48%" stopColor="#844F27" />
          <stop offset="100%" stopColor="#643613" />
        </linearGradient>

        <linearGradient id="otterBibMain" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="45%" stopColor="#FFF4DF" />
          <stop offset="100%" stopColor="#F5DFBD" />
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

      {/* 3. Left Side: Mitra the ISL Otter Signer (Anatomically Polished Mascot) */}
      <g id="duo-signer">
        {/* Curved Otter Tail peeking out on left */}
        <path
          d="M 36 142 C 22 145, 12 153, 10 162 C 9 168, 16 171, 26 168 C 34 165, 40 156, 40 148 Z"
          fill="#522C0E"
          stroke="#18181B"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Signer Torso / Sporty Jersey (Duolingo Macaw Blue) - Natural Pear-Shaped Body, No Donut! */}
        <path
          d="M 52 82 C 40 90, 36 104, 34 122 C 32 140, 30 154, 36 160 C 42 165, 92 165, 98 160 C 102 154, 100 140, 98 122 C 96 104, 92 90, 80 82 Z"
          fill="#18181B"
        />
        <path
          d="M 52 80 C 40 88, 36 102, 34 120 C 32 138, 30 152, 36 158 C 42 163, 92 163, 98 158 C 102 152, 100 138, 98 120 C 96 102, 92 88, 80 80 Z"
          fill="#1CB0F6"
          stroke="#18181B"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        {/* Sporty Jersey Accent Stripe & Collar */}
        <path d="M 33 138 C 45 142, 87 142, 99 138 L 99 146 C 87 150, 45 150, 33 146 Z" fill="#1899D6" />
        <path d="M 58 80 L 66 94 L 74 80" stroke="#FFFFFF" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />

        {/* Left Arm Resting at side */}
        <path
          d="M 40 98 C 33 108, 32 120, 35 130 C 37 136, 42 136, 44 132 C 45 124, 46 112, 48 104 Z"
          fill="#1899D6"
          stroke="#18181B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Right Arm Actively Raised in Signing Gesture */}
        <path
          d="M 88 98 C 96 104, 104 110, 110 114 C 114 117, 118 115, 118 110 C 116 103, 108 97, 98 90 Z"
          fill="#1899D6"
          stroke="#18181B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Otter Head */}
        <ellipse cx="66" cy="56" rx="28" ry="24" fill="#18181B" />
        <ellipse cx="66" cy="54" rx="28" ry="23" fill="url(#otterFurMain)" stroke="#18181B" strokeWidth="2.6" />

        {/* Rounded Otter Ears */}
        <g>
          <path d="M 38 46 C 31 41, 31 30, 41 32 C 47 34, 48 44, 44 49 Z" fill="#7A451E" stroke="#18181B" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 37 44 C 34 41, 35 35, 40 37 C 43 38, 44 42, 41 45 Z" fill="#FCE2C4" />
        </g>
        <g>
          <path d="M 94 46 C 101 41, 101 30, 91 32 C 85 34, 84 44, 88 49 Z" fill="#7A451E" stroke="#18181B" strokeWidth="2.2" strokeLinejoin="round" />
          <path d="M 95 44 C 98 41, 97 35, 92 37 C 89 38, 88 42, 91 45 Z" fill="#FCE2C4" />
        </g>

        {/* Broad Cream Muzzle */}
        <path
          d="M 48 58 C 48 50, 56 47, 63 51 C 64 52, 68 52, 69 51 C 76 47, 84 50, 84 58 C 86 68, 77 73, 66 73 C 55 73, 46 68, 48 58 Z"
          fill="url(#otterBibMain)"
          stroke="#18181B"
          strokeWidth="2.2"
          strokeLinejoin="round"
        />

        {/* Rosy Cheeks */}
        <circle cx="45" cy="61" r="4.5" fill="#FFAA8A" opacity="0.85" />
        <circle cx="87" cy="61" r="4.5" fill="#FFAA8A" opacity="0.85" />

        {/* Sparkling Expressive Eyes (Looking toward the Video Call) */}
        <ellipse cx="55" cy="50" rx="5.5" ry="7" fill="#18181B" />
        <circle cx="56" cy="48" r="2.4" fill="#FFFFFF" />
        <circle cx="58" cy="52" r="1.1" fill="#FFFFFF" />

        <ellipse cx="77" cy="50" rx="5.5" ry="7" fill="#18181B" />
        <circle cx="78" cy="48" r="2.4" fill="#FFFFFF" />
        <circle cx="80" cy="52" r="1.1" fill="#FFFFFF" />

        {/* Otter Button Nose */}
        <path
          d="M 62 57 C 62 53, 70 53, 70 57 C 70 61, 67 63, 66 63 C 65 63, 62 61, 62 57 Z"
          fill="#1F1713"
          stroke="#18181B"
          strokeWidth="1.6"
        />
        <circle cx="65" cy="55.5" r="1.2" fill="#FFFFFF" opacity="0.85" />

        {/* Cheerful Smile */}
        <path d="M 66 63 L 66 65.5" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M 60 65.5 C 63 68, 66 68, 66 65.5 C 66 68, 69 68, 72 65.5" stroke="#18181B" strokeWidth="1.8" strokeLinecap="round" fill="none" />

        {/* Cute Whiskers */}
        <path d="M 50 62 L 38 63" stroke="#4A260F" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <path d="M 51 66 L 39 69" stroke="#4A260F" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <path d="M 82 62 L 94 63" stroke="#4A260F" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        <path d="M 81 66 L 93 69" stroke="#4A260F" strokeWidth="1" strokeLinecap="round" opacity="0.8" />

        {/* Raised Expressive Otter Signing Paw (Proportionate & Cute) */}
        <g id="signer-signing-paw">
          {/* Fur wrist cuff */}
          <ellipse cx="114" cy="112" rx="5" ry="3" fill="#643613" stroke="#18181B" strokeWidth="1.8" />
          {/* Paw palm & signing digits */}
          <path
            d="M 112 112 C 108 104, 107 96, 110 90 C 112 86, 117 87, 118 91 C 119 95, 119 100, 120 104 C 122 99, 125 93, 128 94 C 131 95, 131 100, 129 105 C 130 108, 128 114, 122 115 Z"
            fill="#FFEAD8"
            stroke="#18181B"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          {/* Soft Paw Pad */}
          <ellipse cx="117" cy="106" rx="2.8" ry="3.5" fill="#FCE2C4" />

          {/* AI Vision Landmark Overlay on Otter's Paw */}
          <line x1="114" y1="112" x2="112" y2="103" stroke="#22C55E" strokeWidth="1.4" strokeDasharray="2 2" />
          <line x1="114" y1="112" x2="119" y2="102" stroke="#22C55E" strokeWidth="1.4" strokeDasharray="2 2" />
          <line x1="114" y1="112" x2="125" y2="104" stroke="#22C55E" strokeWidth="1.4" strokeDasharray="2 2" />

          <line x1="112" y1="103" x2="110" y2="90" stroke="#0284C7" strokeWidth="1.4" strokeDasharray="2 2" />
          <line x1="119" y1="102" x2="118" y2="88" stroke="#0284C7" strokeWidth="1.4" strokeDasharray="2 2" />
          <line x1="125" y1="104" x2="128" y2="93" stroke="#0284C7" strokeWidth="1.4" strokeDasharray="2 2" />

          <circle cx="114" cy="112" r="2.8" fill="#22C55E" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="112" cy="103" r="2" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="119" cy="102" r="2" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="125" cy="104" r="2" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />

          {/* Fingertips Reticles */}
          <circle cx="110" cy="90" r="3" fill="#38BDF8" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="110" cy="90" r="1" fill="#FFFFFF" />
          <circle cx="128" cy="93" r="3" fill="#38BDF8" stroke="#18181B" strokeWidth="1.2" />
          <circle cx="128" cy="93" r="1" fill="#FFFFFF" />

          {/* Main Target Reticle on Index */}
          <circle cx="118" cy="88" r="5" stroke="#38BDF8" strokeWidth="1.2" strokeDasharray="2 2" />
          <circle cx="118" cy="88" r="3" fill="#38BDF8" stroke="#18181B" strokeWidth="1.4" />
          <circle cx="118" cy="88" r="1.1" fill="#FFFFFF" />
        </g>
      </g>

      {/* 4. Right Side: The Otter Hearing Partner inside Video Call Screen */}
      <g id="duo-partner-screen" transform="translate(230, 54)">
        {/* Video Tablet / Screen Frame */}
        <rect x="4" y="4" width="102" height="116" rx="14" fill="#18181B" />
        <rect x="0" y="2" width="102" height="116" rx="14" fill="#E5E5E5" stroke="#18181B" strokeWidth="2.6" />
        <rect x="0" y="0" width="102" height="114" rx="14" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
        <rect x="5" y="16" width="92" height="92" rx="10" fill="url(#duoScreenFacet)" stroke="#18181B" strokeWidth="1.8" />

        {/* Clipped video viewport content */}
        <g clipPath="url(#screenViewportClip)">
          {/* Partner Torso wearing cozy amber sweater - Natural shoulders grounded in frame, No Donut! */}
          <path
            d="M 34 82 C 26 88, 20 96, 16 108 L 86 108 C 82 96, 76 88, 68 82 Z"
            fill="#18181B"
          />
          <path
            d="M 34 80 C 26 86, 20 94, 16 106 L 86 106 C 82 94, 76 86, 68 80 Z"
            fill="#FFC800"
            stroke="#18181B"
            strokeWidth="2.2"
          />
          {/* Sweater Ribbed Neckband */}
          <path d="M 43 80 C 47 84, 55 84, 59 80" stroke="#D97706" strokeWidth="2.4" strokeLinecap="round" fill="none" />

          {/* Otter Head */}
          <ellipse cx="51" cy="58" rx="22" ry="19" fill="#18181B" />
          <ellipse cx="51" cy="56" rx="22" ry="18" fill="url(#otterFurMain)" stroke="#18181B" strokeWidth="2.2" />

          {/* Broad Cream Muzzle */}
          <path
            d="M 37 60 C 37 53, 43 51, 49 54 C 50 55, 52 55, 53 54 C 59 51, 65 53, 65 60 C 67 68, 59 72, 51 72 C 43 72, 35 68, 37 60 Z"
            fill="url(#otterBibMain)"
            stroke="#18181B"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />

          {/* Rosy Cheeks */}
          <circle cx="35" cy="62" r="3.5" fill="#FFAA8A" opacity="0.85" />
          <circle cx="67" cy="62" r="3.5" fill="#FFAA8A" opacity="0.85" />

          {/* Sparkling Eyes */}
          <ellipse cx="43" cy="53" rx="4" ry="5.5" fill="#18181B" />
          <circle cx="42" cy="51.5" r="1.8" fill="#FFFFFF" />
          <ellipse cx="59" cy="53" rx="4" ry="5.5" fill="#18181B" />
          <circle cx="58" cy="51.5" r="1.8" fill="#FFFFFF" />

          {/* Button Nose */}
          <ellipse cx="51" cy="59" rx="2" ry="1.5" fill="#1F1713" />
          <circle cx="50.2" cy="58.2" r="0.7" fill="#FFFFFF" />

          {/* Smile */}
          <path d="M 47 65 Q 51 68 55 65" stroke="#18181B" strokeWidth="1.5" strokeLinecap="round" fill="none" />

          {/* Whiskers */}
          <path d="M 38 63 L 30 63" stroke="#4A260F" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M 39 66 L 31 68" stroke="#4A260F" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M 64 63 L 72 63" stroke="#4A260F" strokeWidth="0.8" strokeLinecap="round" />
          <path d="M 63 66 L 71 68" stroke="#4A260F" strokeWidth="0.8" strokeLinecap="round" />

          {/* Audio Headset / Headphones over Otter Ears */}
          <path d="M 30 56 C 30 36, 40 32, 51 32 C 62 32, 72 36, 72 56" stroke="#FF4B4B" strokeWidth="3.4" strokeLinecap="round" fill="none" />
          {/* Ear Cups */}
          <rect x="26" y="50" width="7" height="14" rx="3.5" fill="#FF4B4B" stroke="#18181B" strokeWidth="1.8" />
          <rect x="69" y="50" width="7" height="14" rx="3.5" fill="#FF4B4B" stroke="#18181B" strokeWidth="1.8" />
          {/* Microphone Boom */}
          <path d="M 30 62 C 30 69, 38 73, 45 73" stroke="#18181B" strokeWidth="2.2" strokeLinecap="round" fill="none" />
          <circle cx="46" cy="73" r="2.5" fill="#FFC800" stroke="#18181B" strokeWidth="1.2" />
        </g>

        {/* Top Tablet Camera Dot */}
        <circle cx="51" cy="9" r="3" fill="#18181B" />
        <circle cx="51" cy="9" r="1.2" fill="#38BDF8" />
        {/* Live Green Screen LED */}
        <circle cx="62" cy="9" r="1.8" fill="#22C55E" />

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

      {/* 6. Latency Speed Tag below Camera (< 20ms) */}
      <g transform="translate(150, 142)">
        <rect x="2" y="2" width="58" height="20" rx="6" fill="#18181B" />
        <rect x="0" y="1" width="58" height="20" rx="6" fill="#46A302" stroke="#18181B" strokeWidth="1.8" />
        <rect x="0" y="0" width="58" height="19" rx="6" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="9" cy="9.5" r="3" fill="#22C55E" />
        {/* SVG Lightning Bolt Icon */}
        <path d="M 17 4 L 14 9.5 L 17 9.5 L 15 15 L 20 8.5 L 17 8.5 Z" fill="#EAB308" />
        <text
          x="23"
          y="13"
          fontSize="8.5"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, sans-serif"
          fill="#15803D"
          letterSpacing="0.04em"
        >
          &lt; 20ms
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
 * Hero Mascot: "Mitra" the ISL Otter Companion
 * Expressive, adorable otter mascot in natural warm otter tones, greeting
 * learners with the authentic ISL "NAMASTE" prayer paws.
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

        {/* Otter Coat Rich Gradients (Otter's Natural Colors) */}
        <linearGradient id="otterFurMain" x1="50%" y1="10%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#9E6439" />
          <stop offset="48%" stopColor="#844F27" />
          <stop offset="100%" stopColor="#643613" />
        </linearGradient>

        <linearGradient id="otterBib" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="45%" stopColor="#FFF4DF" />
          <stop offset="100%" stopColor="#F5DFBD" />
        </linearGradient>
        {/* Otter Coat Rich Gradients (Otter's Natural Colors) */}
        <linearGradient id="otterFurMain" x1="50%" y1="10%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#9E6439" />
          <stop offset="48%" stopColor="#844F27" />
          <stop offset="100%" stopColor="#643613" />
        </linearGradient>

        <linearGradient id="otterBibMain" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#FFFDF7" />
          <stop offset="45%" stopColor="#FFF4DF" />
          <stop offset="100%" stopColor="#F5DFBD" />
        </linearGradient>
      </defs>

      {/* Ambient Glow Aura */}
      <circle cx="80" cy="85" r="58" fill="url(#mascotAura)" />
      <circle cx="80" cy="85" r="50" stroke="#FDE68A" strokeWidth="1.6" strokeDasharray="4 4" opacity="0.8" />

      {/* Floating Sparkles & Stars */}
      <g transform="translate(14, 22)">
        <path d="M5 0 L6.2 3.5 L9.5 5 L6.2 6.5 L5 10 L3.8 6.5 L0.5 5 L3.8 3.5 Z" fill="#FFC800" />
      </g>
      <g transform="translate(136, 28)">
        <path d="M4 0 L5 2.8 L8 4 L5 5.2 L4 8 L3 5.2 L0 4 L3 2.8 Z" fill="#58CC02" />
      </g>
      <g transform="translate(132, 108)">
        <path d="M4 0 L5 2.8 L8 4 L5 5.2 L4 8 L3 5.2 L0 4 L3 2.8 Z" fill="#38BDF8" />
      </g>

      {/* Cute Curved Otter Tail on Lower Right */}
      <path
        d="M 112 108 C 128 110, 142 116, 144 125 C 145 132, 137 137, 126 135 C 115 133, 106 124, 104 118 Z"
        fill="#522C0E"
        stroke="#18181B"
        strokeWidth="2.6"
        strokeLinejoin="round"
      />

      {/* Otter Ears (Cute, rounded, characteristic otter ears on sides of head) */}
      {/* Left Ear */}
      <g>
        <path
          d="M 43 49 C 34 44, 34 29, 47 32 C 55 35, 57 47, 52 54 Z"
          fill="#7A451E"
          stroke="#18181B"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M 42 46 C 37 42, 38 34, 46 36 C 50 37, 51 43, 47 48 Z" fill="#FCE2C4" />
      </g>
      {/* Right Ear */}
      <g>
        <path
          d="M 117 49 C 126 44, 126 29, 113 32 C 105 35, 103 47, 108 54 Z"
          fill="#7A451E"
          stroke="#18181B"
          strokeWidth="2.6"
          strokeLinejoin="round"
        />
        <path d="M 118 46 C 123 42, 122 34, 114 36 C 110 37, 109 43, 113 48 Z" fill="#FCE2C4" />
      </g>

      {/* Plump Otter Body / Silhouette */}
      {/* Drop 3D Shadow */}
      <ellipse cx="80" cy="98" rx="43" ry="44" fill="#18181B" />
      {/* 3D Bottom Shade */}
      <ellipse cx="80" cy="94" rx="43" ry="43" fill="#522C0E" />
      {/* Main Body Fur */}
      <ellipse cx="80" cy="90" rx="43" ry="42" fill="url(#otterFurMain)" stroke="#18181B" strokeWidth="2.8" />

      {/* Broad Cream Belly & Chest Fur (High Contrast Bib) */}
      <path
        d="M 60 82 C 60 76, 100 76, 100 82 C 108 94, 106 117, 98 124 C 90 130, 70 130, 62 124 C 54 117, 52 94, 60 82 Z"
        fill="url(#otterBib)"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinejoin="round"
      />
      {/* Subtle Belly Fur Accents */}
      <path d="M 74 108 C 77 111, 83 111, 86 108" stroke="#E2BF95" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M 72 117 C 76 121, 84 121, 88 117" stroke="#E2BF95" strokeWidth="2" strokeLinecap="round" fill="none" />

      {/* Otter Head */}
      {/* Head 3D Depth */}
      <ellipse cx="80" cy="65" rx="39" ry="33" fill="#18181B" />
      <ellipse cx="80" cy="63" rx="39" ry="32" fill="#5A3110" />
      <ellipse cx="80" cy="61" rx="39" ry="31" fill="url(#otterFurMain)" stroke="#18181B" strokeWidth="2.8" />
      {/* Forehead Warm Sheen */}
      <ellipse cx="80" cy="46" rx="18" ry="9" fill="#B37542" opacity="0.6" />

      {/* Adorable Broad Otter Muzzle (Cheeks & Chin) */}
      <path
        d="M 54 66 C 54 55, 66 52, 75 56 C 77 57, 83 57, 85 56 C 94 52, 106 55, 106 66 C 108 79, 96 85, 80 85 C 64 85, 52 79, 54 66 Z"
        fill="url(#otterBib)"
        stroke="#18181B"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />

      {/* Rosy Blushing Cheeks */}
      <ellipse cx="49" cy="69" rx="6.5" ry="4.5" fill="#FFA58C" opacity="0.85" />
      <ellipse cx="111" cy="69" rx="6.5" ry="4.5" fill="#FFA58C" opacity="0.85" />

      {/* Big Sparkling Otter Eyes */}
      {/* Left Eye */}
      <ellipse cx="58" cy="53" rx="12.5" ry="14" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
      <ellipse cx="60.5" cy="53" rx="8" ry="9.5" fill="#29180E" />
      <ellipse cx="61" cy="54" rx="5" ry="6.5" fill="#140A04" />
      <circle cx="58" cy="49" r="3.4" fill="#FFFFFF" />
      <circle cx="63.5" cy="56.5" r="1.5" fill="#FFFFFF" />

      {/* Right Eye */}
      <ellipse cx="102" cy="53" rx="12.5" ry="14" fill="#FFFFFF" stroke="#18181B" strokeWidth="2.6" />
      <ellipse cx="99.5" cy="53" rx="8" ry="9.5" fill="#29180E" />
      <ellipse cx="99" cy="54" rx="5" ry="6.5" fill="#140A04" />
      <circle cx="97" cy="49" r="3.4" fill="#FFFFFF" />
      <circle cx="102.5" cy="56.5" r="1.5" fill="#FFFFFF" />

      {/* Distinctive Otter Button Nose (Glossy Charcoal/Black) */}
      <path
        d="M 73 63 C 73 58, 87 58, 87 63 C 87 68.5, 82 71.5, 80 71.5 C 78 71.5, 73 68.5, 73 63 Z"
        fill="#1F1713"
        stroke="#18181B"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx="77.5" cy="61.5" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.85" />

      {/* Philtrum & Cheerful Otter Mouth */}
      <path d="M 80 71.5 L 80 75" stroke="#18181B" strokeWidth="2" strokeLinecap="round" />
      <path
        d="M 72 75 C 75.5 78.5, 80 78.5, 80 75 C 80 78.5, 84.5 78.5, 88 75"
        stroke="#18181B"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Whisker Dots on Puffy Muzzle */}
      <circle cx="67" cy="71" r="1.1" fill="#7A451E" />
      <circle cx="63" cy="74.5" r="1.1" fill="#7A451E" />
      <circle cx="67.5" cy="77" r="1.1" fill="#7A451E" />
      <circle cx="93" cy="71" r="1.1" fill="#7A451E" />
      <circle cx="97" cy="74.5" r="1.1" fill="#7A451E" />
      <circle cx="92.5" cy="77" r="1.1" fill="#7A451E" />

      {/* Delicate Whiskers */}
      <path d="M 61 72 C 49 70, 39 74, 32 78" stroke="#4A260F" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      <path d="M 62 76 C 49 78, 40 84, 34 89" stroke="#4A260F" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      <path d="M 99 72 C 111 70, 121 74, 128 78" stroke="#4A260F" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
      <path d="M 98 76 C 111 78, 120 84, 126 89" stroke="#4A260F" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />

      {/* Authentic ISL "NAMASTE" Forearms & Otter Paws */}
      {/* Left Forearm */}
      <path
        d="M 43 96 C 40 108, 52 118, 66 114 C 72 112, 78 104, 78 96 C 69 94, 51 89, 43 96 Z"
        fill="#844F27"
        stroke="#18181B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Right Forearm */}
      <path
        d="M 117 96 C 120 108, 108 118, 94 114 C 88 112, 82 104, 82 96 C 91 94, 109 89, 117 96 Z"
        fill="#844F27"
        stroke="#18181B"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {/* Center Pressed Otter Paws (Hands In Authentic Namaste) */}
      <g transform="translate(71, 93)">
        {/* Left Paw / Digits */}
        <path
          d="M 4 21 L 7 3.5 C 7.5 1, 9 1, 9 3.5 L 9 21 Z"
          fill="#FFF4DF"
          stroke="#18181B"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />
        {/* Right Paw / Digits */}
        <path
          d="M 14 21 L 11 3.5 C 10.5 1, 9 1, 9 3.5 L 9 21 Z"
          fill="#FFF4DF"
          stroke="#18181B"
          strokeWidth="1.9"
          strokeLinejoin="round"
        />

        {/* Cute Paw Finger Separator Lines */}
        <path d="M 6.5 13 L 6.5 19" stroke="#E2BF95" strokeWidth="1.4" strokeLinecap="round" />
        <path d="M 11.5 13 L 11.5 19" stroke="#E2BF95" strokeWidth="1.4" strokeLinecap="round" />

        {/* Tiny AI Vision Reticle on the Prayer Paws */}
        <circle cx="9" cy="3.5" r="3" stroke="#22C55E" strokeWidth="1" strokeDasharray="1.5 1.5" />
        <circle cx="9" cy="3.5" r="1.4" fill="#22C55E" />
      </g>

      {/* Cute Webbed Otter Back Paws / Feet */}
      <ellipse cx="63" cy="133" rx="8.5" ry="4.5" fill="#522C0E" stroke="#18181B" strokeWidth="2.2" />
      <circle cx="58.5" cy="134" r="1.2" fill="#FFF4DF" />
      <circle cx="63" cy="135" r="1.2" fill="#FFF4DF" />
      <circle cx="67.5" cy="134" r="1.2" fill="#FFF4DF" />

      <ellipse cx="97" cy="133" rx="8.5" ry="4.5" fill="#522C0E" stroke="#18181B" strokeWidth="2.2" />
      <circle cx="92.5" cy="134" r="1.2" fill="#FFF4DF" />
      <circle cx="97" cy="135" r="1.2" fill="#FFF4DF" />
      <circle cx="101.5" cy="134" r="1.2" fill="#FFF4DF" />
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
    <div className="w-full max-w-5xl mx-auto my-1 sm:my-auto flex flex-col items-center px-2.5 sm:px-6 py-2 sm:py-5">
      {/* 1. Header Minimal Branding & Duolingo Mascot Welcome */}
      <div className="w-full max-w-4xl mb-4 sm:mb-5 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/95 p-3 sm:p-4 rounded-3xl border-2 border-[#E5E5E5] border-b-[4px] shadow-sm">
        {/* Left: 24 FPS Animated Mascot (10 dynamic states) & Clean Minimal Headline */}
        <div className="flex items-center gap-3 sm:gap-4 text-left w-full sm:w-auto min-w-0">
          {/* Mitra 24 FPS Mascot */}
          <div className="relative flex-shrink-0">
            <AnimatedHeroOtter className="w-13 h-13 sm:w-16 sm:h-16" />
            <span className="absolute -bottom-1 -right-0.5 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-white border border-[#18181B] text-[8px] font-black text-[#15803D] shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
              <span>AI</span>
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <h1 className="text-lg sm:text-2xl font-black text-[#18181B] tracking-tight leading-tight">
              Indian Sign Language,{' '}
              <span className="text-[#58CC02] relative inline-block">
                <span>made simple.</span>
                <span
                  className="absolute -bottom-0.5 left-0 right-0 h-2 bg-[#D7FFB8] -rotate-1 rounded-full -z-0 opacity-80"
                  aria-hidden="true"
                />
              </span>
            </h1>
          </div>
        </div>

        {/* Right: Quick App Guide & AI Chatbot Launchers */}
        <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-end pt-1 sm:pt-0 border-t sm:border-t-0 border-zinc-100">
          {onOpenGuide && (
            <button
              type="button"
              onClick={onOpenGuide}
              className="duo-btn duo-btn-gold !py-2 !px-3 sm:!px-4 text-xs font-black shadow-sm flex items-center gap-1.5 flex-shrink-0"
              title="Open interactive application guide and walkthrough"
            >
              <HelpCircle className="w-4 h-4 stroke-[2.5]" />
              <span>Quick Guide</span>
              <ArrowRight className="w-3 h-3 stroke-[2.5]" />
            </button>
          )}
          <button
            type="button"
            onClick={onOpenChatbot}
            className="duo-btn bg-white hover:bg-[#FFF9E5] border-2 border-zinc-900 text-zinc-900 !py-2 !px-3 sm:!px-4 text-xs font-black shadow-sm flex items-center gap-1.5 transition-all flex-shrink-0"
            title="Open Sanket AI Chatbot"
          >
            <Sparkles className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>Ask AI Guide</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher for Quick Arena Jump (< md) */}
      <div className="w-full flex md:hidden bg-[#E5F3E4] p-1.5 rounded-2xl border-2 border-[#18181B] mb-3 shadow-cartoon-sm flex-shrink-0 max-w-md">
        <button
          type="button"
          onClick={() => setMobileHomeTab('learn')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mobileHomeTab === 'learn'
              ? 'bg-[#58CC02] text-white border-2 border-[#46A302] border-b-[3px] shadow-sm'
              : 'text-zinc-600'
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          <span>Learn ISL</span>
        </button>
        <button
          type="button"
          onClick={() => setMobileHomeTab('chat')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
            mobileHomeTab === 'chat'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] border-b-[3px] shadow-sm'
              : 'text-zinc-600'
          }`}
        >
          <Video className="w-4 h-4 stroke-[2.5]" />
          <span>Sign Call</span>
        </button>
      </div>

      {/* 2. Primary Choice Arena: Dual Mode Cards (Well-Proportioned, Cohesive, Delightful) */}
      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 items-stretch max-w-4xl">
        {/* =========================================================================
            CARD 1: LEARN ISL (Duolingo Green Theme)
            ========================================================================= */}
        <div
          onClick={() => onSelectMode('learn')}
          className={`duo-card bg-white p-4 sm:p-5 flex-col cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-150 relative ${
            mobileHomeTab === 'learn' ? 'flex' : 'hidden md:flex'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectMode('learn')}
        >
          {/* Card Accent Top Banner */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EEFDE5] border-2 border-[#58CC02] text-[11px] font-black text-[#388402]">
              <Compass className="w-3.5 h-3.5 text-[#58CC02] stroke-[2.5]" />
              <span>PRACTICE &amp; MASTER</span>
            </div>
            <span className="text-[11px] font-bold text-zinc-400 font-mono">
              7 Levels • Self-Paced
            </span>
          </div>

          {/* Dedicated Artwork Stage Frame */}
          <div className="w-full h-[145px] sm:h-[160px] my-2 rounded-2xl bg-gradient-to-b from-amber-50/50 via-emerald-50/30 to-emerald-50/50 border border-emerald-100 flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform duration-200 overflow-hidden flex-shrink-0">
            <ArtisticLearnIllustration className="w-full h-full object-contain" />
          </div>

          {/* Content Block */}
          <div className="mt-2 text-left flex flex-col flex-grow">
            <h2 className="text-lg sm:text-xl font-black text-[#3C3C3C] tracking-tight flex items-center justify-between">
              <span>Learn ISL Curriculum</span>
              <span className="text-xs sm:text-sm font-black text-[#58CC02] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                Start <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </h2>
            <p className="mt-1.5 text-xs sm:text-[13.5px] text-zinc-600 font-bold leading-relaxed">
              Interactive 7-level progressive course: start with Namaste, master two-handed A–Z fingerspelling, and practice 1,000+ signs with instant AI feedback.
            </p>
          </div>

          {/* Primary CTA Button */}
          <div className="mt-4 sm:mt-5 pt-1 flex-shrink-0">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelectMode('learn');
              }}
              className="w-full duo-btn duo-btn-green !py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm"
            >
              <BookOpen className="w-4 h-4 stroke-[2.5]" />
              <span>START LEARNING (LEVEL 1)</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            CARD 2: VIDEO CALL & LIVE TRANSLATOR (Macaw Blue Theme)
            ========================================================================= */}
        <div
          onClick={() => onSelectMode('chat')}
          className={`duo-card bg-white p-4 sm:p-5 flex-col cursor-pointer group hover:-translate-y-1 hover:shadow-lg transition-all duration-150 relative ${
            mobileHomeTab === 'chat' ? 'flex' : 'hidden md:flex'
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onSelectMode('chat')}
        >
          {/* Card Accent Top Banner */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#DDF4FE] border-2 border-[#1CB0F6] text-[11px] font-black text-[#0284C7]">
              <Video className="w-3.5 h-3.5 text-[#1CB0F6] stroke-[2.5]" />
              <span>SIGN VIDEO CALL</span>
            </div>
            <span className="text-[11px] font-bold text-zinc-400 font-mono">
              P2P Encrypted • &lt;20ms
            </span>
          </div>

          {/* Dedicated Artwork Stage Frame */}
          <div className="w-full h-[145px] sm:h-[160px] my-2 rounded-2xl bg-gradient-to-b from-sky-50/50 via-blue-50/30 to-sky-50/50 border border-sky-100 flex items-center justify-center p-2 group-hover:scale-[1.02] transition-transform duration-200 overflow-hidden flex-shrink-0">
            <ArtisticCallIllustration className="w-full h-full object-contain" />
          </div>

          {/* Content Block */}
          <div className="mt-2 text-left flex flex-col flex-grow">
            <h2 className="text-lg sm:text-xl font-black text-[#3C3C3C] tracking-tight flex items-center justify-between">
              <span>Sign Video Call &amp; Auto-Translator</span>
              <span className="text-xs sm:text-sm font-black text-[#1CB0F6] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                Start Call <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </span>
            </h2>
            <p className="mt-1.5 text-xs sm:text-[13.5px] text-zinc-600 font-bold leading-relaxed">
              Direct peer-to-peer video calling with real-time on-device sign detection and automatic ISL-to-English grammar translation.
            </p>
          </div>

          {/* Primary CTA Button & Join Trigger */}
          <div className="mt-4 sm:mt-5 pt-1 flex flex-col gap-2 flex-shrink-0">
            {!showRoomInput ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectMode('chat');
                  }}
                  className="flex-1 duo-btn duo-btn-blue !py-3 text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-sm min-w-0"
                >
                  <Video className="w-4 h-4 stroke-[2.5] flex-shrink-0" />
                  <span className="truncate">START SIGN CALL</span>
                  <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowRoomInput(true);
                  }}
                  className="cartoon-btn bg-white hover:bg-zinc-100 !py-2.5 !px-3 text-xs font-bold flex items-center gap-1.5 flex-shrink-0 border-2 border-zinc-900 shadow-sm"
                  title="Join an existing room code"
                >
                  <Hash className="w-4 h-4 text-zinc-700 flex-shrink-0" />
                  <span>Join</span>
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleJoinSubmit}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={customRoomInput}
                  onChange={(e) => setCustomRoomInput(e.target.value)}
                  placeholder="Enter room code..."
                  autoFocus
                  className="flex-1 px-3 py-2 text-xs font-bold bg-[#FAF8F5] border-2 border-zinc-900 rounded-xl focus:outline-none min-w-0"
                />
                <button
                  type="submit"
                  className="cartoon-btn cartoon-btn-secondary !py-2 !px-3.5 text-xs font-black flex-shrink-0"
                >
                  Join
                </button>
                <button
                  type="button"
                  onClick={() => setShowRoomInput(false)}
                  className="text-xs font-bold text-zinc-500 hover:text-zinc-900 px-1.5 flex-shrink-0"
                >
                  Cancel
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
