import React, { useState, useEffect } from 'react';
import { MessageSquareQuote, Sparkles } from 'lucide-react';

/**
 * IncomingSubtitleOverlay
 * 
 * Top Glass HUD Subtitle Banner (NETW-05):
 * - Positioned right below the top bezel of the webcam stage for zero eye-travel ergonomics.
 * - Allows Deaf ISL signer to read hearing partner's incoming text responses while looking directly into the camera.
 * - High-contrast glassmorphic design with subtle auto-dismissal.
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
    <aside aria-label="Incoming Subtitles" className="absolute top-4 inset-x-4 z-30 flex justify-center pointer-events-none animate-in fade-in slide-in-from-top-3 duration-300">
      <div className="max-w-2xl w-full bg-slate-950/90 backdrop-blur-md border border-sky-500/40 text-slate-100 py-3 px-5 rounded-2xl shadow-2xl shadow-sky-950/50 flex items-center justify-between gap-3 ring-1 ring-sky-400/30">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300 flex-shrink-0">
            <MessageSquareQuote className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold font-mono text-sky-300 tracking-wide uppercase">
                {latestReply.sender || 'Partner'} Replied:
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {latestReply.timestamp || 'Just now'}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-100 tracking-tight truncate drop-shadow-sm">
              "{latestReply.text}"
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1 text-[10px] font-mono text-sky-400/80 px-2.5 py-1 rounded-lg bg-sky-500/10 border border-sky-500/20 flex-shrink-0">
          <Sparkles className="w-3 h-3 text-sky-400" />
          <span>HUD Subtitles</span>
        </div>
      </div>
    </aside>
  );
}

export default IncomingSubtitleOverlay;
