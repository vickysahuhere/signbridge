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
      {/* Warm Ambient Aura */}
      <circle cx="170" cy="90" r="75" fill="#FEF3C7" fillOpacity="0.6" />
      <circle cx="170" cy="90" r="62" stroke="#FDE68A" strokeWidth="1.8" strokeDasharray="5 5" />

      {/* Trajectory / Motion Guide Arcs */}
      <path
        d="M50 140 C85 60 215 50 280 110"
        stroke="#F59E0B"
        strokeWidth="2.5"
        strokeDasharray="4 6"
        strokeLinecap="round"
      />
      <path
        d="M75 155 C115 100 200 90 255 145"
        stroke="#10B981"
        strokeWidth="1.8"
        strokeDasharray="3 5"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Floating Alphabet Badge */}
      <g transform="translate(38, 28) rotate(-8)">
        <rect
          x="0"
          y="0"
          width="42"
          height="42"
          rx="10"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.2"
        />
        <rect x="3.5" y="3.5" width="35" height="35" rx="7" fill="#FFD15C" />
        <text
          x="21"
          y="26"
          textAnchor="middle"
          fontSize="18"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          fill="#18181B"
        >
          A
        </text>
        <path d="M0 42 L3 45 L42 45 L42 42 Z" fill="#18181B" opacity="0.3" />
      </g>

      {/* Secondary Floating Practice Badge */}
      <g transform="translate(255, 32) rotate(8)">
        <rect
          x="0"
          y="0"
          width="42"
          height="28"
          rx="7"
          fill="#22C55E"
          stroke="#18181B"
          strokeWidth="2"
        />
        <text
          x="21"
          y="18"
          textAnchor="middle"
          fontSize="11"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
          fill="#FFFFFF"
        >
          ISL
        </text>
      </g>

      {/* Main Stylized Hand (Artistic Biometric Signing Hand) */}
      <g transform="translate(105, 30)">
        {/* Palm & Wrist Contour */}
        <path
          d="M50 125 C38 110 35 90 37 72 C38 60 44 48 48 34 C49 29 55 29 57 34 C58 42 60 54 60 66 L60 72 
             M60 66 C61 50 65 24 69 18 C71 14 77 14 78 19 C80 26 80 44 80 62 L80 68
             M80 62 C82 50 86 28 90 22 C92 18 97 19 99 24 C100 32 99 50 98 65 L98 72
             M98 70 C100 60 105 42 108 36 C110 32 115 34 116 39 C117 46 113 62 110 78 L106 100
             C103 112 92 126 75 126 L50 125 Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Thumb */}
        <path
          d="M40 82 C30 82 18 90 20 102 C22 112 32 116 44 114"
          fill="#FFD15C"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Biometric Landmark Constellation Overlay */}
        <circle cx="65" cy="125" r="4" fill="#22C55E" stroke="#18181B" strokeWidth="1.8" />

        {/* MCP Knuckles */}
        <circle cx="50" cy="80" r="3" fill="#FFD15C" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="70" cy="74" r="3" fill="#FFD15C" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="89" cy="74" r="3" fill="#FFD15C" stroke="#18181B" strokeWidth="1.5" />
        <circle cx="105" cy="80" r="3" fill="#FFD15C" stroke="#18181B" strokeWidth="1.5" />

        {/* Finger Tips (Tracked Points) */}
        <circle cx="53" cy="32" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="74" cy="16" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="95" cy="21" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="112" cy="35" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />
        <circle cx="22" cy="98" r="3.8" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />

        {/* Constellation Link Arcs */}
        <line x1="65" y1="125" x2="70" y2="74" stroke="#22C55E" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="70" y1="74" x2="74" y2="16" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="50" y1="80" x2="53" y2="32" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="89" y1="74" x2="95" y2="21" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="105" y1="80" x2="112" y2="35" stroke="#38BDF8" strokeWidth="1.5" strokeDasharray="3 3" />
        <line x1="65" y1="125" x2="22" y2="98" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="3 3" />
      </g>

      {/* Decorative Sparkles */}
      <g transform="translate(190, 16)">
        <path d="M7 0 L8.5 5 L14 7 L8.5 8.5 L7 14 L5.5 8.5 L0 7 L5.5 5 Z" fill="#F59E0B" />
      </g>
      <g transform="translate(275, 95)">
        <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#22C55E" />
      </g>
    </svg>
  );
}

/**
 * Artistic Vector SVG for Video Call & Sign Translation
 * Two communicating hands reaching across an ethereal P2P bridge,
 * speech-to-sign captions, and real-time connection waves.
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
      {/* Soft Ambient Communication Aura */}
      <circle cx="170" cy="90" r="75" fill="#E0F2FE" fillOpacity="0.6" />
      <circle cx="170" cy="90" r="62" stroke="#BAE6FD" strokeWidth="1.8" strokeDasharray="5 5" />

      {/* P2P Video Call Signal Waves */}
      <path
        d="M125 90 C140 75 140 105 155 90 C170 75 170 105 185 90 C200 75 200 105 215 90"
        stroke="#0284C7"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="170" cy="90" r="5" fill="#38BDF8" stroke="#18181B" strokeWidth="1.8" />

      {/* Floating Translated Caption Ribbon */}
      <g transform="translate(85, 20)">
        <rect
          x="0"
          y="0"
          width="170"
          height="34"
          rx="9"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.2"
        />
        <rect x="3.5" y="3.5" width="163" height="27" rx="6" fill="#F0FDF4" />
        <circle cx="20" cy="17" r="4" fill="#22C55E" />
        <text
          x="34"
          y="21"
          fontSize="11.5"
          fontWeight="800"
          fontFamily="system-ui, sans-serif"
          fill="#18181B"
        >
          "Namaste! How are you?"
        </text>
        <polygon points="80,34 88,42 96,34" fill="#FFFFFF" stroke="#18181B" strokeWidth="1.8" />
        <polygon points="82,33 88,39 94,33" fill="#F0FDF4" />
      </g>

      {/* Left Hand: Signer (Reaching Inward) */}
      <g transform="translate(35, 70)">
        <path
          d="M10 80 C22 68 35 60 50 58 C62 56 72 46 78 35 C80 31 85 32 84 37 C83 45 78 58 72 68 
             M72 68 C80 60 86 48 90 42 C92 38 96 39 95 44 C93 54 85 66 78 75
             M78 75 C84 68 90 60 92 55 C94 51 98 52 97 56 C95 65 86 76 78 83
             C68 93 55 98 38 95 L10 89 Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Thumb */}
        <path
          d="M36 75 C43 65 52 58 59 63 C64 67 62 75 53 82"
          fill="#38BDF8"
          stroke="#18181B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Right Hand: Hearing / Video Partner (Receiving) */}
      <g transform="translate(205, 70)">
        <path
          d="M95 80 C83 68 70 60 55 58 C43 56 33 46 27 35 C25 31 20 32 21 37 C22 45 27 58 33 68 
             M33 68 C25 60 19 48 15 42 C13 38 9 39 10 44 C12 54 20 66 27 75
             M27 75 C21 68 15 60 13 55 C11 51 7 52 8 56 C10 65 19 76 27 83
             C37 93 50 98 67 95 L95 89 Z"
          fill="#FFFFFF"
          stroke="#18181B"
          strokeWidth="2.5"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {/* Thumb */}
        <path
          d="M69 75 C62 65 53 58 46 63 C41 67 43 75 52 82"
          fill="#FFD15C"
          stroke="#18181B"
          strokeWidth="2.2"
          strokeLinecap="round"
        />
      </g>

      {/* Stylized Video Camera Aperture Lens */}
      <g transform="translate(150, 130)">
        <rect
          x="0"
          y="0"
          width="40"
          height="30"
          rx="7"
          fill="#18181B"
          stroke="#18181B"
          strokeWidth="1.8"
        />
        <circle cx="16" cy="15" r="6.5" fill="#38BDF8" />
        <circle cx="16" cy="15" r="2.8" fill="#FFFFFF" />
        <polygon points="29,11 37,7 37,23 29,19" fill="#18181B" />
        <circle cx="7" cy="7" r="2" fill="#EF4444" />
      </g>

      {/* Communication Rays */}
      <g transform="translate(62, 42)">
        <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#38BDF8" />
      </g>
      <g transform="translate(270, 50)">
        <path d="M5 0 L6 4 L10 5 L6 6 L5 10 L4 6 L0 5 L4 4 Z" fill="#FF6B6B" />
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
                <span>Learn ISL</span>
                <span className="text-xs font-bold text-zinc-400 group-hover:text-zinc-900 transition-colors">
                  Studio →
                </span>
              </h2>
              <p className="mt-0.5 text-xs text-zinc-600 font-medium leading-relaxed">
                Master 2-handed ISL alphabets and common signs with live skeleton posture alignment and immediate visual feedback.
              </p>

              {/* Micro Feature List */}
              <div className="mt-2 pt-1.5 border-t border-zinc-100 flex flex-wrap gap-1.5">
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-[#F4EFEA] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" /> 26 A–Z Letters
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-[#F4EFEA] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" /> 50+ Core Signs
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-700 bg-[#F4EFEA] px-2 py-0.5 rounded-md">
                  <CheckCircle2 className="w-2.5 h-2.5 text-[#22C55E]" /> AI Posture Guide
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
