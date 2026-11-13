import React from 'react';
import { Home, BookOpen, Video, BookMarked, Sparkles } from 'lucide-react';

export function MobileBottomNav({
  currentPage = 'home',
  onPageChange,
  onOpenDictionary,
  onOpenChatbot,
  masteredCount = 0,
  unreadCount = 0
}) {
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t-2 border-[#E5E5E5] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-lg flex items-center justify-around select-none"
      aria-label="Mobile Navigation Dock"
    >
      {/* 1. Home */}
      <button
        type="button"
        onClick={() => onPageChange && onPageChange('home')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all ${
          currentPage === 'home'
            ? 'text-[#3C3C3C] font-black'
            : 'text-zinc-400 hover:text-zinc-600 font-bold'
        }`}
      >
        <div
          className={`w-9 h-7 rounded-lg flex items-center justify-center transition-all ${
            currentPage === 'home'
              ? 'bg-[#EDF7EC] text-[#58CC02] border-2 border-[#58CC02] shadow-xs'
              : ''
          }`}
        >
          <Home className="w-4 h-4 stroke-[2.5]" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight leading-none">Home</span>
      </button>

      {/* 2. Learn ISL */}
      <button
        type="button"
        onClick={() => onPageChange && onPageChange('learn')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
          currentPage === 'learn'
            ? 'text-[#2F7202] font-black'
            : 'text-zinc-400 hover:text-zinc-600 font-bold'
        }`}
      >
        <div
          className={`w-9 h-7 rounded-lg flex items-center justify-center transition-all relative ${
            currentPage === 'learn'
              ? 'bg-[#58CC02] text-white border-2 border-[#46A302] border-b-[3px] shadow-xs'
              : ''
          }`}
        >
          <BookOpen className="w-4 h-4 stroke-[2.5]" />
          {masteredCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-[#FFC800] text-[#78350F] text-[8px] font-black border border-amber-600">
              {masteredCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight leading-none">Learn</span>
      </button>

      {/* 3. Sign Call */}
      <button
        type="button"
        onClick={() => onPageChange && onPageChange('chat')}
        className={`flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all relative ${
          currentPage === 'chat'
            ? 'text-[#0284C7] font-black'
            : 'text-zinc-400 hover:text-zinc-600 font-bold'
        }`}
      >
        <div
          className={`w-9 h-7 rounded-lg flex items-center justify-center transition-all relative ${
            currentPage === 'chat'
              ? 'bg-[#1CB0F6] text-white border-2 border-[#1899D6] border-b-[3px] shadow-xs'
              : ''
          }`}
        >
          <Video className="w-4 h-4 stroke-[2.5]" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 px-1 py-0.2 rounded-full bg-[#FF4B4B] text-white text-[8px] font-black border border-rose-700">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight leading-none">Call</span>
      </button>

      {/* 4. Dictionary */}
      <button
        type="button"
        onClick={onOpenDictionary}
        className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-zinc-400 hover:text-zinc-600 font-bold transition-all"
      >
        <div className="w-9 h-7 rounded-lg flex items-center justify-center">
          <BookMarked className="w-4 h-4 stroke-[2.3]" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight leading-none">Signs</span>
      </button>

      {/* 5. Ask AI Guide */}
      <button
        type="button"
        onClick={onOpenChatbot}
        className="flex-1 flex flex-col items-center justify-center py-1 px-1 rounded-xl text-zinc-400 hover:text-zinc-600 font-bold transition-all group"
      >
        <div className="w-9 h-7 rounded-lg flex items-center justify-center bg-amber-50 text-amber-600 border border-amber-200">
          <Sparkles className="w-4 h-4 stroke-[2.5] text-amber-500 fill-amber-500 animate-subtle-bounce" />
        </div>
        <span className="text-[10px] mt-0.5 tracking-tight leading-none text-amber-700 font-black">AI Guide</span>
      </button>
    </nav>
  );
}

export default MobileBottomNav;
