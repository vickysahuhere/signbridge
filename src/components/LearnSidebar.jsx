import React, { useState, useMemo } from 'react';
import {
  Search,
  BookOpen,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Layers,
  Crosshair,
  Compass,
  Hand
} from 'lucide-react';
import { ISL_LEARN_ITEMS } from '../ai/islTargetLandmarks.js';

export function LearnSidebar({
  selectedItem,
  onSelectItem,
  latestLandmarks,
  evaluationResult
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filtered items based on search and category
  const filteredItems = useMemo(() => {
    return ISL_LEARN_ITEMS.filter(item => {
      const matchesCategory =
        selectedCategory === 'all' ||
        (selectedCategory === 'alphabet' ? item.type === 'alphabet' : item.category === selectedCategory);

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.label.toLowerCase().includes(q) ||
        item.name.toLowerCase().includes(q) ||
        item.english.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', name: 'All' },
    { id: 'greetings', name: 'Greetings' },
    { id: 'actions', name: 'Actions' },
    { id: 'feelings_states', name: 'States' },
    { id: 'daily_life', name: 'Daily' },
    { id: 'healthcare', name: 'Health' },
    { id: 'alphabet', name: 'A–Z Letters' }
  ];

  // Derive evaluation metrics
  const score = evaluationResult?.matchScore || 0;
  const checklist = evaluationResult?.checklist || [];
  const primaryGuidance = evaluationResult?.primaryGuidance || 'Position yourself in front of the camera.';
  const isAligned = evaluationResult?.isPostureAligned || false;

  return (
    <div className="w-full md:w-[320px] lg:w-[360px] flex flex-col h-full min-h-0 gap-3 overflow-y-auto md:overflow-hidden flex-shrink-0">
      {/* 1. Sign Selector & Browser Window */}
      <div className="cartoon-card bg-white flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Title & Category Bar */}
        <div className="px-3 py-2 border-b-2 border-zinc-900 bg-[#FAF8F5] flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
              <BookOpen className="w-3.5 h-3.5 text-zinc-900 stroke-[2.2]" />
            </div>
            <span className="font-extrabold text-xs sm:text-sm text-zinc-900 truncate">
              Sign Academy
            </span>
          </div>
          <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-zinc-900 text-white">
            {filteredItems.length} Signs
          </span>
        </div>

        {/* Search Input & Quick Filter Pills */}
        <div className="p-2.5 border-b border-zinc-200 bg-white space-y-2 flex-shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 stroke-[2.5]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search sign or alphabet..."
              className="cartoon-input !py-1 !pl-8 !pr-2 !text-xs w-full bg-[#FAF8F5]"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-0.5 rounded-md text-[11px] font-bold whitespace-nowrap transition-all border ${
                  selectedCategory === cat.id
                    ? 'bg-[#FFD15C] text-zinc-900 border-zinc-900 shadow-cartoon-sm'
                    : 'bg-zinc-100 text-zinc-600 border-zinc-300 hover:text-zinc-900'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Sign List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1.5">
          {filteredItems.map(item => {
            const isSelected = selectedItem?.id === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectItem(item)}
                className={`w-full text-left p-2 rounded-xl border-2 transition-all flex items-center justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-[#FFD15C] border-zinc-900 shadow-cartoon-sm scale-[1.01]'
                    : 'bg-[#FAF8F5] border-zinc-200 hover:border-zinc-900 hover:bg-white'
                }`}
              >
                {/* Thumbnail Preview */}
                <div className="w-9 h-9 rounded-lg border border-zinc-900/30 overflow-hidden bg-white flex-shrink-0 shadow-sm flex items-center justify-center">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <Hand className="w-4 h-4 text-zinc-400 stroke-[1.8]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-zinc-900 truncate">
                      {item.name}
                    </span>
                    <span className={`cartoon-badge !py-0 !px-1 text-[8px] uppercase ${
                      item.type === 'alphabet' ? 'bg-[#38BDF8] text-zinc-900' : 'bg-white text-zinc-700'
                    }`}>
                      {item.type === 'alphabet' ? 'Letter' : item.category}
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-medium truncate mt-0.5">
                    {item.english}
                  </p>
                </div>

                <div className={`w-5 h-5 rounded-lg border flex items-center justify-center flex-shrink-0 ${
                  isSelected ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-400 border-zinc-300'
                }`}>
                  <ArrowRight className="w-3 h-3 stroke-[2.5]" />
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Sign Showcase: SVG Diagram + Instructions */}
        {selectedItem && (
          <div className="border-t-2 border-zinc-900 bg-[#FAF8F5] p-2.5 flex-shrink-0 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-zinc-500 font-mono">
                  Visual Blueprint
                </span>
                <h3 className="font-extrabold text-sm text-zinc-900 leading-tight">
                  {selectedItem.name} ({selectedItem.label})
                </h3>
              </div>
              <span className="cartoon-badge !py-0.5 !px-2 text-[10px] bg-[#38BDF8] text-zinc-900 font-bold">
                {selectedItem.english}
              </span>
            </div>

            {/* Authentic ISL Demonstration Photo */}
            <div className="w-full h-36 bg-white rounded-xl border-2 border-zinc-900 shadow-cartoon-sm flex items-center justify-center overflow-hidden p-1.5 relative group">
              {selectedItem.image ? (
                <img
                  src={selectedItem.image}
                  alt={`${selectedItem.name} demonstration`}
                  className="w-full h-full object-contain rounded-lg transition-transform group-hover:scale-105"
                  loading="lazy"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-zinc-400 gap-1">
                  <Hand className="w-8 h-8 stroke-[1.5]" />
                  <span className="text-[10px] font-bold">Image preview</span>
                </div>
              )}
              <div className="absolute top-1.5 left-2 bg-zinc-900/85 backdrop-blur-sm text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-sm flex items-center gap-1.5 pointer-events-none">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                Authentic Demonstration
              </div>
            </div>

            <p className="text-[11px] text-zinc-700 leading-relaxed font-medium bg-white p-2 rounded-lg border border-zinc-200">
              {selectedItem.description}
            </p>
          </div>
        )}
      </div>

      {/* 2. Lower Left Blueprint: "Landmark Target Blueprint & Alignment Guide" */}
      <div className="cartoon-card bg-white p-3 flex flex-col gap-2.5 flex-shrink-0 border-2 border-zinc-900 shadow-cartoon-sm">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-md bg-[#22C55E] flex items-center justify-center text-white">
              <Crosshair className="w-3.5 h-3.5 stroke-[2.5]" />
            </div>
            <span className="font-extrabold text-xs text-zinc-900">
              Landmark Target Blueprint
            </span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[10px] font-extrabold">
            <span className="text-zinc-500">Match:</span>
            <span className={`px-1.5 py-0.5 rounded ${
              score >= 75 ? 'bg-[#22C55E] text-white' : score >= 40 ? 'bg-[#FFD15C] text-zinc-900' : 'bg-zinc-200 text-zinc-700'
            }`}>
              {score}%
            </span>
          </div>
        </div>

        {/* Dynamic Match Score Progress Bar */}
        <div className="space-y-1">
          <div className="w-full h-2.5 bg-zinc-100 rounded-full border border-zinc-300 overflow-hidden relative">
            <div
              className={`h-full transition-all duration-300 rounded-full ${
                score >= 75 ? 'bg-[#22C55E]' : score >= 40 ? 'bg-[#FFD15C]' : 'bg-zinc-400'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <div className="flex justify-between text-[9px] font-bold text-zinc-400 font-mono">
            <span>0% (Idle)</span>
            <span>Target: 75%+</span>
            <span>100% (Perfect)</span>
          </div>
        </div>

        {/* Live Action Guidance Message Box */}
        <div className={`p-2 rounded-xl border-2 flex items-start gap-2 ${
          isAligned
            ? 'bg-[#EBFDF0] border-[#22C55E] text-[#15803D]'
            : score > 30
            ? 'bg-[#FEFCE8] border-[#EAB308] text-[#854D0E]'
            : 'bg-zinc-50 border-zinc-300 text-zinc-700'
        }`}>
          {isAligned ? (
            <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5 stroke-[2.5]" />
          ) : (
            <Compass className="w-4 h-4 text-zinc-600 flex-shrink-0 mt-0.5 stroke-[2.5]" />
          )}
          <div className="min-w-0 flex-1">
            <span className="text-[11px] font-bold block leading-snug">
              {primaryGuidance}
            </span>
          </div>
        </div>

        {/* Biomechanical Target Landmark Checklist */}
        <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
          {checklist.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-1.5 rounded-lg bg-[#FAF8F5] border border-zinc-200 text-[10px]"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span className={`w-3.5 h-3.5 rounded flex items-center justify-center text-[9px] font-bold ${
                  item.status === 'pass'
                    ? 'bg-[#22C55E] text-white'
                    : item.status === 'warn'
                    ? 'bg-[#FFD15C] text-zinc-900'
                    : 'bg-zinc-200 text-zinc-500'
                }`}>
                  {item.status === 'pass' ? '✓' : '!'}
                </span>
                <span className="font-bold text-zinc-800 truncate">
                  {item.label}
                </span>
              </div>
              <span className="font-mono text-zinc-500 font-medium truncate ml-1 flex-shrink-0">
                {item.current}
              </span>
            </div>
          ))}
        </div>

        {/* Target Specs Summary */}
        {selectedItem?.blueprint && (
          <div className="pt-1 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
            <span>Zone: {selectedItem.blueprint.zone || 'Chest Level'}</span>
            <span className="text-zinc-400">ISL Standard</span>
          </div>
        )}
      </div>
    </div>
  );
}
