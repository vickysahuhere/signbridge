import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, BookOpen, CheckCircle2, HelpCircle, Layers, Sparkles } from 'lucide-react';
import { ISL_WORD_LABELS, ISL_WORD_CATEGORIES } from '../ai/islWordLabels.js';
import { ISL_ALPHABET_GUIDE } from '../ai/islAlphabetLabels.js';

export const LIVE_VISION_GLOSSES = new Set([
  'BAD', 'CALL', 'DRINK', 'EAT', 'FEVER', 'GOOD', 'HELLO', 'HELP',
  'LOVE', 'ME', 'MONEY', 'NAMASTE', 'NO', 'PAIN', 'PLEASE', 'SORRY',
  'STOP', 'TIME', 'WANT', 'WELCOME', 'YES', 'YOU'
]);

export function WordDictionaryModal({ isOpen, onClose, onSelectForPractice }) {
  const [activeTab, setActiveTab] = useState('words'); // 'words' | 'alphabet'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [displayLimit, setDisplayLimit] = useState(80);

  useEffect(() => {
    setDisplayLimit(80);
  }, [searchQuery, selectedCategory]);

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

  const filteredAlphabet = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ISL_ALPHABET_GUIDE;
    return ISL_ALPHABET_GUIDE.filter(item =>
      item.letter.toLowerCase().includes(q) ||
      item.description.toLowerCase().includes(q) ||
      item.tip.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }, [searchQuery]);

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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-sm select-none"
      aria-label="ISL Word Dictionary Modal"
    >
      <div className="cartoon-card w-full max-w-4xl max-h-[90vh] flex flex-col shadow-cartoon-lg bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* 1. Header */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center shadow-cartoon-sm flex-shrink-0">
              <BookOpen className="w-4 h-4 text-zinc-900 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-zinc-900">
                ISL Sign Dictionary
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {activeTab === 'words' ? `${ISL_WORD_LABELS.length} Lexicon Words (Tier 3 Daily English)` : '26 A–Z Two-Handed Letters'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center justify-center shadow-cartoon-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4 stroke-[2.5] text-zinc-900" />
          </button>
        </div>

        {/* 2. Mode Selector & Filters */}
        <div className="p-3.5 bg-white border-b border-zinc-200 space-y-3 flex-shrink-0">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center bg-[#F4EFEA] p-1 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
              <button
                onClick={() => {
                  setActiveTab('words');
                  setSearchQuery('');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'words'
                    ? 'bg-[#FFD15C] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                    : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
                }`}
              >
                1,000+ Lexicon Words ({ISL_WORD_LABELS.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('alphabet');
                  setSearchQuery('');
                }}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === 'alphabet'
                    ? 'bg-[#38BDF8] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                    : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
                }`}
              >
                A–Z Fingerspelling (26)
              </button>
            </div>

            <div className="cartoon-badge bg-[#FAF8F5] text-zinc-700 shadow-none text-xs">
              Showing {activeTab === 'words' ? filteredWords.length : filteredAlphabet.length} items
            </div>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2 stroke-[2.2]" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={activeTab === 'words' ? "Search by sign, English meaning, or gesture action..." : "Search alphabet by letter or tip..."}
              className="cartoon-input w-full pl-9 pr-8 text-xs sm:text-sm py-2 shadow-none focus:shadow-cartoon-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs font-bold text-zinc-400 hover:text-zinc-900"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Tabs (Words mode) */}
          {activeTab === 'words' && (
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-bold border-2 transition-all whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-zinc-900 text-white border-zinc-900 shadow-cartoon-sm'
                    : 'bg-[#FAF8F5] text-zinc-700 border-zinc-200 hover:border-zinc-900'
                }`}
              >
                All ({categoryCounts.all})
              </button>
              {ISL_WORD_CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg font-bold border-2 transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-cartoon-sm'
                      : 'bg-[#FAF8F5] text-zinc-700 border-zinc-200 hover:border-zinc-900'
                  }`}
                >
                  {cat.name} ({categoryCounts[cat.id] || 0})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Table / Cards Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#FAF8F5]">
          {activeTab === 'words' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredWords.length === 0 ? (
                <div className="col-span-2 p-10 text-center text-zinc-400 font-medium">
                  No signs matching "{searchQuery}"
                </div>
              ) : (
                <>
                  {filteredWords.slice(0, displayLimit).map((word) => (
                    <div
                      key={word.id}
                      className="cartoon-card p-3 bg-white border-2 border-zinc-900 hover:shadow-cartoon-md transition-all flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-extrabold text-sm text-zinc-950 font-mono tracking-wide">
                              {word.gloss}
                            </span>
                            {LIVE_VISION_GLOSSES.has(word.gloss) ? (
                              <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#EDFDF2] text-[#16A34A] border border-green-300 font-bold">
                                🟢 Live 3D Vision
                              </span>
                            ) : (
                              <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#FAF8F5] text-zinc-400 border border-zinc-200">
                                Lexicon
                              </span>
                            )}
                          </div>
                          <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#FAF8F5] text-zinc-600 shadow-none uppercase font-mono">
                            {word.category}
                          </span>
                        </div>
                        <p className="font-bold text-xs text-amber-800 mb-1.5">
                          English: "{word.english}"
                        </p>
                        <p className="text-[11px] text-zinc-600 leading-relaxed">
                          {word.description}
                        </p>
                      </div>
                      <div className="text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 flex items-center justify-between">
                        <span>Sign ID #{word.id}</span>
                        {onSelectForPractice && (
                          <button
                            onClick={() => onSelectForPractice(word.gloss)}
                            className="cartoon-btn !py-0.5 !px-2 text-[10px] bg-[#FFD15C] hover:bg-[#FFE082] text-zinc-900 border border-zinc-900 flex items-center gap-1 font-bold shadow-none"
                            title="Practice this sign in Sign Academy"
                          >
                            <Sparkles className="w-3 h-3 text-zinc-900" />
                            Practice Sign
                          </button>
                        )}
                      </div>
                    </div>
                  ))}

                  {filteredWords.length > displayLimit && (
                    <div className="col-span-full pt-2 pb-1 text-center">
                      <button
                        onClick={() => setDisplayLimit(prev => prev + 100)}
                        className="cartoon-btn bg-white hover:bg-zinc-100 text-zinc-900 border-2 border-zinc-900 px-4 py-2 text-xs font-extrabold shadow-cartoon-sm"
                      >
                        Show More (+100 of {filteredWords.length - displayLimit} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {filteredAlphabet.length === 0 ? (
                <div className="col-span-3 p-10 text-center text-zinc-400 font-medium">
                  No letters matching "{searchQuery}"
                </div>
              ) : (
                filteredAlphabet.map((item) => (
                  <div
                    key={item.letter}
                    className="cartoon-card p-3 bg-white border-2 border-zinc-900 hover:shadow-cartoon-md transition-all flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="w-10 h-10 rounded-xl bg-[#38BDF8] border-2 border-zinc-900 flex items-center justify-center font-black text-xl text-zinc-950 shadow-cartoon-sm">
                          {item.letter}
                        </div>
                        <span className={`cartoon-badge !py-0 !px-2 text-[10px] ${
                          item.category === 'Vowel' ? 'bg-[#FFD15C] text-zinc-900' : 'bg-zinc-100 text-zinc-700'
                        } shadow-none`}>
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[10px] font-mono font-bold text-zinc-500 uppercase mb-1">
                        {item.type}
                      </div>
                      <p className="text-xs text-zinc-800 font-medium leading-relaxed mb-2">
                        {item.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-100">
                      <div className="text-[11px] font-semibold text-[#16A34A] bg-[#EDFDF2] p-1.5 rounded-lg border border-green-200 flex-1">
                        💡 {item.tip}
                      </div>
                      {onSelectForPractice && (
                        <button
                          onClick={() => onSelectForPractice(item.letter)}
                          className="cartoon-btn !py-1 !px-2 text-[10px] bg-[#38BDF8] hover:bg-[#7dd3fc] text-zinc-900 border border-zinc-900 flex items-center gap-1 font-bold shadow-none flex-shrink-0"
                          title="Practice this letter in Sign Academy"
                        >
                          <Sparkles className="w-3 h-3 text-zinc-900" />
                          Practice
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className="p-3 bg-[#FAF8F5] border-t-2 border-zinc-900 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="cartoon-btn cartoon-btn-primary !px-5 !py-1.5 text-xs font-bold"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  );
}

export default WordDictionaryModal;