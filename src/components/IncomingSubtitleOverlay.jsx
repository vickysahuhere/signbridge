import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Sparkles } from 'lucide-react';

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
      className="absolute top-3 inset-x-3 z-30 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div className="cartoon-card bg-[#FFF9E5] text-zinc-950 border-2 border-zinc-900 p-3 max-w-lg w-full shadow-cartoon-md flex items-center justify-between gap-3 pointer-events-auto">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
            <MessageSquareQuote className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
              <span>{latestReply.sender || 'Partner'} says:</span>
              <span>•</span>
              <span className="font-mono">{latestReply.timestamp || 'Just now'}</span>
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-zinc-950 truncate leading-snug">
              "{latestReply.text}"
            </p>
          </div>
        </div>

        <span className="cartoon-badge !py-0.5 !px-2 text-[10px] bg-white text-zinc-700 shadow-none hidden sm:inline-flex flex-shrink-0">
          Subtitles On
        </span>
      </div>
    </aside>
  );
}

export default IncomingSubtitleOverlay;