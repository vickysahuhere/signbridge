import React, { useState } from 'react';
import {
  Video,
  Activity,
  Zap,
  Clock,
  CheckCircle2,
  Database,
  BookOpen,
  Copy,
  Check,
  Wifi,
  MessageSquare,
  Sparkles,
  Flame,
  Construction,
  Monitor
} from 'lucide-react';

export function Navbar({
  fps = 0,
  workerStatus = 'idle',
  workerLatencyMs = 0,
  motionState = { state: 'IDLE', pauseProgress: 0 },
  recognitionMode = 'word',
  onToggleMode,
  onOpenRecorder,
  onOpenDictionary,
  roomId = '',
  connectionMode = 'p2p',
  rttMs = 18,
  userName = 'User',
  onCopyLink
}) {
  const [copied, setCopied] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);

  const handleCopy = () => {
    if (onCopyLink) {
      onCopyLink();
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusBadge = () => {
    switch (workerStatus) {
      case 'ready':
        return { label: 'AI: READY', colorClass: 'text-[#00AA00]' };
      case 'compiling':
      case 'loading':
        return { label: 'AI: LOAD', colorClass: 'text-[#0000FF]' };
      case 'error':
        return { label: 'AI: ERR', colorClass: 'text-[#FF0000]' };
      default:
        return { label: 'AI: IDLE', colorClass: 'text-[#808080]' };
    }
  };

  const status = getStatusBadge();

  return (
    <header className="retro-outset bg-[#C0C0C0] border-b-2 border-[#000000] shadow-sm select-none flex-shrink-0">
      {/* 1. Main Windows 95/98 Application Title Bar */}
      <div className="retro-window-titlebar flex items-center justify-between px-2 py-0.5">
        <div className="flex items-center gap-2">
          {/* 90s Pixelated Desktop Icon */}
          <div className="w-4 h-4 bg-[#C0C0C0] border border-[#FFFFFF] flex items-center justify-center text-[#000080]">
            <Monitor className="w-3.5 h-3.5 stroke-[2px]" />
          </div>
          {/* Animated Rainbow Headline In Titlebar */}
          <span className="font-heading text-xs sm:text-sm tracking-wide font-black text-rainbow uppercase">
            SIGNBRIDGE ISL '98
          </span>
          <span className="hidden md:inline font-bold text-xs text-[#FFFFFF]">
            - [Indian Sign Language Cyber-Bridge]
          </span>

          {/* Badges in Titlebar */}
          <span className="hidden sm:inline-block bg-[#FFFF00] text-[#000000] text-[9px] px-1 font-mono font-bold animate-pulse-glow">
            ★ NEW! v1.97 ★
          </span>
          <span className="hidden lg:inline-block bg-[#00AA00] text-[#FFFFFF] text-[9px] px-1 font-mono font-bold">
            Y2K READY
          </span>
        </div>

        {/* Windows 95 Window Controls [_] [□] [X] */}
        <div className="flex items-center gap-1">
          <button className="retro-window-btn" title="Minimize" aria-label="Minimize">_</button>
          <button className="retro-window-btn" title="Maximize" aria-label="Maximize">□</button>
          <button className="retro-window-btn" title="Close" aria-label="Close">×</button>
        </div>
      </div>

      {/* 2. Unified Toolbar & Menu Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-1 px-2 py-1 bg-[#C0C0C0] border-t border-[#FFFFFF]">
        {/* Left: Mode Buttons & Knowledge Tools (Unified Interface for Both Users) */}
        <div className="flex items-center gap-1 flex-wrap">
          {/* User Identity Chip */}
          <div className="retro-inset px-2 py-0.5 bg-[#FFFFFF] text-[11px] font-mono font-bold text-[#000080] flex items-center gap-1">
            <span className="text-[#808080]">ME:</span>
            <span>{userName}</span>
          </div>

          {/* Mode Selector (Words vs A-Z) */}
          <div className="flex items-center retro-inset-gray p-0.5 gap-0.5">
            <button
              onClick={() => onToggleMode && onToggleMode('word')}
              className={`retro-btn text-xs !py-0.5 !px-2 ${recognitionMode === 'word' ? 'retro-btn-success' : ''}`}
              title="AI4Bharat 50 Words Neural Model"
            >
              <span>Words</span>
            </button>
            <button
              onClick={() => onToggleMode && onToggleMode('alphabet')}
              className={`retro-btn text-xs !py-0.5 !px-2 ${recognitionMode === 'alphabet' ? 'retro-btn-primary' : ''}`}
              title="Two-Handed Fingerspelling A-Z"
            >
              <span>A–Z</span>
            </button>
          </div>

          {/* 50 Words Dictionary Modal Trigger */}
          {onOpenDictionary && (
            <button
              onClick={onOpenDictionary}
              className="retro-btn text-xs !py-0.5 !px-2 bg-[#FFFFCC] text-[#000000]"
              title="Open 50 ISL Words Reference Table"
            >
              <BookOpen className="w-3 h-3 stroke-[2px] text-[#000080]" />
              <span>Dictionary (50)</span>
            </button>
          )}

          {/* Keypoint Dataset Recorder Trigger */}
          {onOpenRecorder && (
            <button
              onClick={onOpenRecorder}
              className="retro-btn text-xs !py-0.5 !px-2"
              title="Record and Export Keypoint Dataset"
            >
              <Database className="w-3 h-3 stroke-[2px] text-[#800080]" />
              <span>Recorder</span>
            </button>
          )}
        </div>

        {/* Right: Room ID & System Telemetry Status Panels */}
        <div className="flex items-center gap-1 font-mono text-xs flex-wrap">
          {/* Room Slug & Copy Button */}
          {roomId && (
            <div className="flex items-center retro-inset bg-[#FFFFFF] px-1.5 py-0.2 text-xs">
              <span className="text-[#808080] font-bold mr-1 text-[11px]">ROOM:</span>
              <span className="font-bold text-[#000080] text-[11px]">#{roomId}</span>
              <button
                onClick={handleCopy}
                className="ml-1.5 retro-btn !px-1 !py-0 text-[9px]"
                title="Copy Shareable Room Link"
              >
                {copied ? <Check className="w-2.5 h-2.5 text-[#00AA00] stroke-[2px]" /> : <Copy className="w-2.5 h-2.5 stroke-[2px]" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>
            </div>
          )}

          {/* AI Neural Engine Status */}
          <div className="retro-inset px-1.5 py-0.2 bg-[#FFFFCC] text-[11px] font-bold flex items-center gap-1">
            <span className={status.colorClass}>{status.label}</span>
            <span className="text-[9px] text-[#808080]">({workerLatencyMs}ms)</span>
          </div>

          {/* Connection Dial-Up Badge */}
          <div className="retro-inset px-1.5 py-0.2 bg-[#FFFFFF] text-[11px] font-bold flex items-center gap-1">
            <Wifi className="w-2.5 h-2.5 stroke-[2px] text-[#000080]" />
            <span className="text-[#000080]">{connectionMode === 'p2p' ? 'P2P' : 'NET'}</span>
            <span className="text-[#808080] text-[9px]">{rttMs}ms</span>
          </div>

          {/* FPS Counter */}
          <div className="retro-inset px-1.5 py-0.2 bg-[#000000] text-[#00FF00] font-mono text-[11px] font-bold">
            {fps} FPS
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
