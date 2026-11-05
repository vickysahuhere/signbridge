import React, { useState, useMemo } from 'react';
import { X, Search, BookOpen, CheckCircle2, HelpCircle } from 'lucide-react';
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#000000]/60 select-none"
      aria-label="ISL Word Dictionary Modal"
    >
      <div className="retro-window w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border-2 border-[#000000]">
        {/* 1. Windows 95 Title Bar */}
        <div className="retro-window-titlebar">
          <div className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 stroke-[2px]" />
            <span>ISL Vocabulary Database - [INCLUDE-50 Neural Dictionary]</span>
          </div>
          <button
            onClick={onClose}
            className="retro-window-btn"
            title="Close Dialog"
            aria-label="Close Dialog"
          >
            ×
          </button>
        </div>

        {/* 2. Dialog Toolbar & Filters */}
        <div className="p-3 bg-[#C0C0C0] border-b border-[#808080] space-y-2">
          <div className="flex items-center justify-between text-xs font-sans">
            <div>
              <span className="font-bold text-[#000080]">
                AI4Bharat 50 Core Signs
              </span>
              <span className="text-[#808080] ml-2">
                (Client-side browser inference via ONNX Runtime)
              </span>
            </div>
            <div className="retro-inset px-2 py-0.5 bg-[#FFFFCC] text-[10px] font-mono font-bold text-[#000000]">
              TOTAL: {ISL_WORD_LABELS.length} SIGNS
            </div>
          </div>

          {/* Search Input Box */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-[#000000]">
              SEARCH:
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by gloss, English meaning, or gesture motion..."
              className="retro-input flex-1 text-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="retro-btn text-xs py-0.5"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`retro-btn text-xs ${
                selectedCategory === 'all' ? 'retro-btn-primary' : ''
              }`}
            >
              All ({categoryCounts.all})
            </button>
            {ISL_WORD_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`retro-btn text-xs ${
                  selectedCategory === cat.id ? 'retro-btn-primary' : ''
                }`}
              >
                {cat.name} ({categoryCounts[cat.id] || 0})
              </button>
            ))}
          </div>
        </div>

        {/* 3. Word Table with Alternating Row Backgrounds */}
        <div className="flex-1 overflow-y-auto p-2 bg-[#FFFFFF] retro-inset">
          <table className="w-full text-left text-xs font-sans border-collapse">
            <thead>
              <tr className="bg-[#C0C0C0] border-b-2 border-[#808080] text-[11px] font-mono font-bold">
                <th className="p-2 border-r border-[#808080]">ID</th>
                <th className="p-2 border-r border-[#808080]">GLOSS</th>
                <th className="p-2 border-r border-[#808080]">ENGLISH MEANING</th>
                <th className="p-2 border-r border-[#808080]">CATEGORY</th>
                <th className="p-2">GESTURE DESCRIPTION</th>
              </tr>
            </thead>
            <tbody>
              {filteredWords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-[#808080] font-mono">
                    No ISL signs matching "{searchQuery}" in this category.
                  </td>
                </tr>
              ) : (
                filteredWords.map((word, idx) => (
                  <tr
                    key={word.id}
                    className={`border-b border-[#808080] ${
                      idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#E8E8E8]'
                    }`}
                  >
                    <td className="p-2 font-mono font-bold text-[#808080] border-r border-[#808080] whitespace-nowrap">
                      #{word.id}
                    </td>
                    <td className="p-2 font-mono font-bold text-[#000080] border-r border-[#808080] whitespace-nowrap">
                      {word.gloss}
                    </td>
                    <td className="p-2 font-bold text-[#000000] border-r border-[#808080] whitespace-nowrap">
                      {word.english}
                    </td>
                    <td className="p-2 border-r border-[#808080] whitespace-nowrap">
                      <span className="retro-outset text-[10px] font-mono px-1.5 py-0.5 bg-[#C0C0C0] text-[#000000] font-bold">
                        {word.category}
                      </span>
                    </td>
                    <td className="p-2 text-[#000000] text-[11px] leading-snug">
                      {word.description}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* 4. Footer Status & Close Button */}
        <div className="p-2.5 px-3 bg-[#C0C0C0] border-t border-[#808080] flex items-center justify-between text-xs font-sans">
          <span className="font-mono text-[#808080]">
            Showing {filteredWords.length} of {ISL_WORD_LABELS.length} loaded vocabulary tokens
          </span>
          <button
            onClick={onClose}
            className="retro-btn retro-btn-primary px-6 py-1 font-bold text-xs"
          >
            [ OK / CLOSE ]
          </button>
        </div>
      </div>
    </div>
  );
}

export default WordDictionaryModal;
