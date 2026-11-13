import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Sparkles, GripVertical } from 'lucide-react';

const STORAGE_KEY = 'sanket_ai_launcher_pos';

export function MovableChatbotLauncher({ isOpen, onOpen, currentPage }) {
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (typeof parsed.x === 'number' && typeof parsed.y === 'number') {
          return parsed;
        }
      }
    } catch {}
    return null;
  });

  const buttonRef = useRef(null);
  const dragRef = useRef({
    isDragging: false,
    hasMoved: false,
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  // Calculate default position based on current page and window size
  const getDefaultPosition = useCallback(() => {
    if (typeof window === 'undefined') return { x: 0, y: 0 };
    const btnW = 160;
    const btnH = 46;
    const margin = 20;

    // For Learn page, place it in the upper-right corner below navbar so it never obstructs bottom ranking cards
    const defaultY = currentPage === 'learn'
      ? 76
      : Math.max(margin, window.innerHeight - btnH - 48);
    const defaultX = Math.max(margin, window.innerWidth - btnW - margin);

    return { x: defaultX, y: defaultY };
  }, [currentPage]);

  // Keep within viewport on window resize
  useEffect(() => {
    const handleResize = () => {
      setPosition(prev => {
        if (!prev) return getDefaultPosition();
        const btnW = buttonRef.current?.offsetWidth || 160;
        const btnH = buttonRef.current?.offsetHeight || 46;
        const maxX = Math.max(12, window.innerWidth - btnW - 12);
        const maxY = Math.max(12, window.innerHeight - btnH - 12);

        return {
          x: Math.min(Math.max(12, prev.x), maxX),
          y: Math.min(Math.max(12, prev.y), maxY)
        };
      });
    };

    if (!position) {
      setPosition(getDefaultPosition());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [getDefaultPosition, position]);

  const handlePointerDown = (e) => {
    // Only drag with primary mouse button or touch
    if (e.button !== 0 && e.pointerType === 'mouse') return;

    const el = buttonRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const curX = position ? position.x : rect.left;
    const curY = position ? position.y : rect.top;

    dragRef.current = {
      isDragging: true,
      hasMoved: false,
      startX: e.clientX,
      startY: e.clientY,
      initialX: curX,
      initialY: curY
    };

    try {
      el.setPointerCapture(e.pointerId);
    } catch {}
  };

  const handlePointerMove = (e) => {
    if (!dragRef.current.isDragging) return;

    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;

    if (!dragRef.current.hasMoved && Math.hypot(dx, dy) > 4) {
      dragRef.current.hasMoved = true;
    }

    if (dragRef.current.hasMoved) {
      const btnW = buttonRef.current?.offsetWidth || 160;
      const btnH = buttonRef.current?.offsetHeight || 46;
      const maxX = Math.max(12, window.innerWidth - btnW - 12);
      const maxY = Math.max(12, window.innerHeight - btnH - 12);

      const nextX = Math.min(Math.max(12, dragRef.current.initialX + dx), maxX);
      const nextY = Math.min(Math.max(12, dragRef.current.initialY + dy), maxY);

      setPosition({ x: nextX, y: nextY });
    }
  };

  const handlePointerUp = (e) => {
    if (!dragRef.current.isDragging) return;

    const wasMoved = dragRef.current.hasMoved;
    dragRef.current.isDragging = false;

    try {
      buttonRef.current?.releasePointerCapture(e.pointerId);
    } catch {}

    if (wasMoved) {
      // Save custom user position
      setPosition(currentPos => {
        if (currentPos) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentPos));
          } catch {}
        }
        return currentPos;
      });
    } else {
      // Clicked without moving -> open chatbot
      onOpen();
    }
  };

  if (isOpen) return null;

  const currentPos = position || getDefaultPosition();

  return (
    <div
      ref={buttonRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      style={{
        left: `${currentPos.x}px`,
        top: `${currentPos.y}px`,
        touchAction: 'none'
      }}
      className="hidden md:flex fixed z-40 select-none cursor-grab active:cursor-grabbing items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#FFD15C] hover:bg-[#F5C240] border-2 border-zinc-900 shadow-cartoon text-xs sm:text-sm font-black text-zinc-900 transition-shadow active:shadow-cartoon-sm hover:scale-[1.02] active:scale-[0.98]"
      title="Drag to move anywhere • Click to ask Sanket AI"
      aria-label="Ask Sanket AI Chatbot (Draggable button)"
    >
      <GripVertical className="w-3.5 h-3.5 text-zinc-700/70 -ml-0.5 flex-shrink-0" />
      <div className="relative flex-shrink-0">
        <Sparkles className="w-4 h-4 text-zinc-900 fill-zinc-900 animate-subtle-bounce" />
        <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full border border-zinc-900" />
      </div>
      <span className="font-black whitespace-nowrap">Ask Sanket AI</span>
    </div>
  );
}
