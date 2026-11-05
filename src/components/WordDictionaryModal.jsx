import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, Layers, CheckCircle2, Sparkles } from 'lucide-react';
import { ISL_WORD_LABELS, ISL_WORD_CATEGORIES } from '../ai/islWordLabels.js';

export function WordDictionaryModal({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredWords = useMemo(() => {
    return ISL_WORD_LABELS.filter(word => {
      const matchesCategory =
        selectedCategory === 'all' || word.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        word.gloss.toLowerCase().includes(q) ||
        word.english.toLowerCase().includes(q) ||
        word.description.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const categoryCounts = useMemo(() => {
    const counts = { all: ISL_WORD_LABELS.length };
    ISL_WORD_LABELS.forEach(w => {
      counts[w.category] = (counts[w.category] || 0) + 1;
    });
    return counts;
  }, []);

  if (!isOpen) return null;

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'greetings':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'pronouns':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      case 'questions':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'actions':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'essentials':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      default:
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200"
      aria-label="ISL Word Dictionary Modal"
    >
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <BookOpen className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <span>50 Core Indian Sign Language (ISL) Signs</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-mono">
                  INCLUDE-50
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                AI4Bharat vocabulary recognized in real time via browser edge neural network
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Category Filter Toolbar */}
        <div className="p-4 border-b border-slate-800/80 bg-slate-900/60 space-y-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search sign by gloss, English meaning, or gesture motion..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-800/90 border border-slate-700 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded-lg border text-xs font-medium whitespace-nowrap transition ${
                selectedCategory === 'all'
                  ? 'bg-slate-100 text-slate-950 border-slate-100 font-bold shadow-sm'
                  : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              All Signs ({categoryCounts.all})
            </button>
            {ISL_WORD_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1 rounded-lg border text-xs font-medium whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-500 text-slate-950 border-emerald-500 font-bold shadow-sm'
                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.name} ({categoryCounts[cat.id] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* Word Grid Body */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredWords.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-500 text-xs">
              No ISL signs matching "{searchQuery}" in this category.
            </div>
          ) : (
            filteredWords.map(word => (
              <div
                key={word.id}
                className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 hover:border-slate-600 hover:bg-slate-800/80 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-mono font-bold text-sm text-slate-100 tracking-wide">
                      {word.gloss}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full border font-mono ${getCategoryBadgeClass(
                        word.category
                      )}`}
                    >
                      {word.category}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-emerald-300 mb-1.5">
                    {word.english}
                  </h4>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    {word.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex items-center justify-between">
                  <span>Sign ID: #{word.id}</span>
                  <span className="flex items-center gap-1 text-sky-400">
                    <CheckCircle2 className="w-3 h-3" />
                    Pretrained
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 px-5 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>Showing {filteredWords.length} of {ISL_WORD_LABELS.length} signs</span>
          <span className="text-emerald-400 font-semibold">100% Client-Side Edge AI</span>
        </div>
      </div>
    </div>
  );
}

export default WordDictionaryModal;
