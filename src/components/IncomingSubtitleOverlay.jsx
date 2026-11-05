import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Sparkles } from 'lucide-react';

/**
 * IncomingSubtitleOverlay (Retro Edition)
 * 
 * Closed Captioning / HUD Overlay on Video Viewport:
 * - Authentic 90s closed-caption box with 3D bevels.
 * - Yellow notepad (#FFFFCC) high-contrast dialog.
 * - 0px border radius, 2px stroke icons.
 */
export function IncomingSubtitleOverlay({ latestReply = null }) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (latestReply && latestReply.text) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 12000); // Display for 12 seconds
      return () => clearTimeout(timer);
    }
  }, [latestReply]);

  if (!latestReply || !isVisible) {
    return null;
  }

  return (
    <aside
      aria-label="Incoming Subtitles"
      className="absolute top-2 inset-x-2 z-30 flex justify-center pointer-events-none"
    >
      <div className="retro-outset bg-[#FFFFCC] text-[#000000] border-2 border-[#000000] p-2 max-w-xl w-full shadow-xl flex items-center justify-between gap-2 pointer-events-auto">
        <div className="flex items-center gap-2 overflow-hidden">
          <div className="w-6 h-6 retro-inset bg-[#000080] text-[#FFFFFF] flex items-center justify-center flex-shrink-0">
            <MessageSquareQuote className="w-4 h-4 stroke-[2px]" />
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <div className="flex items-center gap-2 text-[10px] font-mono font-bold text-[#000080]">
              <span>[SUBTITLES] {latestReply.sender || 'Partner'} SAYS:</span>
              <span className="text-[#808080]">({latestReply.timestamp || 'Just now'})</span>
            </div>
            <p className="text-sm font-bold text-[#000000] tracking-tight truncate">
              "{latestReply.text}"
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono font-bold text-[#000000] px-1.5 py-0.5 retro-inset bg-[#FFFFFF] flex-shrink-0">
          <span>HUD CC [ON]</span>
        </div>
      </div>
    </aside>
  );
}

export default IncomingSubtitleOverlay;
