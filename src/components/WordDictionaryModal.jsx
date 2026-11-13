import React, { useState, useMemo, useEffect } from 'react';
import { X, Search, BookOpen, CheckCircle2, HelpCircle, Layers, Sparkles, Globe, ExternalLink, Lightbulb } from 'lucide-react';
import { ISL_WORD_LABELS, ISL_WORD_CATEGORIES } from '../ai/islWordLabels.js';
import { ISL_ALPHABET_GUIDE } from '../ai/islAlphabetLabels.js';
import { getLearnItemByLabel } from '../ai/islTargetLandmarks.js';

export const LIVE_VISION_GLOSSES = new Set([
  'AFTERNOON', 'BAD', 'CALL', 'DRINK', 'EAT', 'EVENING', 'FEVER', 'GOOD',
  'GOOD_AFTERNOON', 'GOOD_EVENING', 'GOOD_MORNING', 'GOOD_NIGHT', 'HELLO', 'HELP',
  'LOVE', 'ME', 'MONEY', 'MORNING', 'NAMASTE', 'NIGHT', 'NO', 'PAIN', 'PLEASE', 'SORRY',
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
    const q = searchQuery.trim().toLowerCase();
    const matches = ISL_WORD_LABELS.filter(word => {
      const matchesCategory =
        selectedCategory === 'all' || word.category === selectedCategory;
      if (!matchesCategory) return false;
      if (!q) return true;

      const gloss = word.gloss.toLowerCase();
      const english = (word.english || '').toLowerCase();

      // Single char search: match start of gloss or word tokens only
      if (q.length === 1) {
        if (gloss === q || gloss.startsWith(q)) return true;
        const tokens = `${gloss} ${english}`.split(/[\s,()/-]+/);
        return tokens.some(t => t.startsWith(q));
      }

      if (gloss.includes(q) || english.includes(q)) return true;
      if (q.length >= 3 && word.description.toLowerCase().includes(q)) return true;
      return false;
    });

    if (!q) return matches;

    return matches.sort((a, b) => {
      const aGloss = a.gloss.toLowerCase();
      const bGloss = b.gloss.toLowerCase();
      const aEng = (a.english || '').toLowerCase();
      const bEng = (b.english || '').toLowerCase();

      const getScore = (gloss, eng) => {
        if (gloss === q) return 1000;
        if (gloss.startsWith(q)) return 800;
        if (eng.startsWith(q)) return 600;
        if (gloss.includes(q)) return 400;
        if (eng.includes(q)) return 300;
        return 100;
      };

      const diff = getScore(bGloss, bEng) - getScore(aGloss, aEng);
      if (diff !== 0) return diff;
      return aGloss.localeCompare(bGloss);
    });
  }, [searchQuery, selectedCategory]);

  const filteredAlphabet = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return ISL_ALPHABET_GUIDE;

    const matches = ISL_ALPHABET_GUIDE.filter(item => {
      const letter = item.letter.toLowerCase();
      if (q.length === 1) {
        return letter === q || item.category.toLowerCase().startsWith(q);
      }
      return (
        letter.includes(q) ||
        item.category.toLowerCase().includes(q) ||
        (q.length >= 3 && (item.description.toLowerCase().includes(q) || item.tip.toLowerCase().includes(q)))
      );
    });

    return matches.sort((a, b) => {
      const aLetter = a.letter.toLowerCase();
      const bLetter = b.letter.toLowerCase();
      if (aLetter === q && bLetter !== q) return -1;
      if (bLetter === q && aLetter !== q) return 1;
      return aLetter.localeCompare(bLetter);
    });
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
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 bg-zinc-950/60 backdrop-blur-sm select-none"
      aria-label="ISL Word Dictionary Modal"
    >
      <div className="cartoon-card w-full max-w-4xl h-[95dvh] sm:h-auto sm:max-h-[90vh] flex flex-col shadow-cartoon-lg bg-white overflow-hidden rounded-t-2xl sm:rounded-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* 1. Header */}
        <div className="px-4 py-3 bg-[#EAF6E8] border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFC800] border-2 border-zinc-900 flex items-center justify-center shadow-cartoon-sm flex-shrink-0">
              <BookOpen className="w-4 h-4 text-zinc-900 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-zinc-900">
                ISL Sign Dictionary
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-xs sm:text-sm text-zinc-600 font-bold">
                  {activeTab === 'words' ? `${ISL_WORD_LABELS.length} Lexicon Words (Tier 3 Daily English)` : '26 A–Z Two-Handed Letters'}
                </p>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  <Globe className="w-2.5 h-2.5" />
                  Grounded in ISLRTC & FDMSE Standards
                </span>
              </div>
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
            <div className="flex items-center bg-[#E5F3E4] p-1 rounded-xl border-2 border-zinc-900 shadow-cartoon-sm">
              <button
                onClick={() => {
                  setActiveTab('words');
                  setSearchQuery('');
                }}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all flex-shrink-0 ${
                  activeTab === 'words'
                    ? 'bg-[#FFC800] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                    : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
                }`}
              >
                <span className="hidden sm:inline">1,000+ Lexicon Words</span>
                <span className="sm:hidden">Words</span> ({ISL_WORD_LABELS.length})
              </button>
              <button
                onClick={() => {
                  setActiveTab('alphabet');
                  setSearchQuery('');
                }}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-black transition-all flex-shrink-0 ${
                  activeTab === 'alphabet'
                    ? 'bg-[#1CB0F6] text-zinc-900 border-2 border-zinc-900 shadow-cartoon-sm'
                    : 'text-zinc-600 hover:text-zinc-900 border-2 border-transparent'
                }`}
              >
                <span className="hidden sm:inline">A–Z Fingerspelling</span>
                <span className="sm:hidden">A–Z</span> (26)
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
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#EDF7EC]">
          {activeTab === 'words' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredWords.length === 0 ? (
                <div className="col-span-2 p-10 text-center text-zinc-400 font-medium">
                  No signs matching "{searchQuery}"
                </div>
              ) : (
                <>
                  {filteredWords.slice(0, displayLimit).map((word) => {
                    const learnItem = getLearnItemByLabel(word.gloss);
                    const imgUrl = learnItem?.image;
                    const isGif = imgUrl?.endsWith('.gif');

                    return (
                      <div
                        key={word.id}
                        className="cartoon-card p-3.5 bg-white border-2 border-zinc-900 hover:shadow-cartoon-md transition-all flex flex-col justify-between gap-2.5"
                      >
                        <div className="flex gap-3 items-start">
                          {imgUrl && (
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#EAF6E8] rounded-xl border-2 border-zinc-900 overflow-hidden flex-shrink-0 relative group p-1 flex items-center justify-center">
                              <img
                                src={imgUrl}
                                alt={word.gloss}
                                className="w-full h-full object-contain rounded-lg"
                                loading="lazy"
                              />
                              <span className={`absolute bottom-0.5 right-0.5 text-[9px] font-black px-1.5 py-0.5 rounded ${
                                isGif ? 'bg-purple-600 text-white' : 'bg-zinc-900 text-white'
                              }`}>
                                {isGif ? 'GIF' : 'PHOTO'}
                              </span>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-black text-base sm:text-lg text-zinc-950 font-mono tracking-wide">
                                  {word.gloss}
                                </span>
                                {LIVE_VISION_GLOSSES.has(word.gloss) ? (
                                  <span className="cartoon-badge !py-0.5 !px-2 text-[10px] sm:text-xs bg-[#EDFDF2] text-[#16A34A] border border-green-300 font-black inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse flex-shrink-0" />
                                    <span>Live 3D Vision</span>
                                  </span>
                                ) : (
                                  <span className="cartoon-badge !py-0.5 !px-2 text-[10px] sm:text-xs bg-[#FAF8F5] text-zinc-500 border border-zinc-200 font-bold">
                                    Lexicon
                                  </span>
                                )}
                              </div>
                              <span className="cartoon-badge !py-0.5 !px-2 text-[10px] sm:text-xs bg-[#FAF8F5] text-zinc-600 shadow-none uppercase font-mono font-bold">
                                {word.category}
                              </span>
                            </div>
                            <p className="font-extrabold text-sm text-amber-900 mb-1">
                              English: "{word.english}"
                            </p>
                            <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed line-clamp-3">
                              {word.description}
                            </p>
                          </div>
                        </div>
                        <div className="text-xs font-mono text-zinc-500 pt-2 border-t border-zinc-100 flex items-center justify-between gap-1.5 flex-wrap">
                        <div className="flex items-center gap-2">
                          <span>Sign ID #{word.id}</span>
                          <a
                            href={`https://www.indiansignlanguage.org/?s=${encodeURIComponent(word.english || word.gloss)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:text-blue-900 hover:underline flex items-center gap-0.5 text-xs font-bold"
                            title="Open slow video demonstration in Indian Sign Language Portal"
                          >
                            <Globe className="w-3 h-3" />
                            <span>ISL Portal</span>
                            <ExternalLink className="w-2.5 h-2.5 stroke-[2.5]" />
                          </a>
                        </div>
                        {onSelectForPractice && (
                          <button
                            onClick={() => onSelectForPractice(word.gloss)}
                            className="cartoon-btn !py-1 !px-2.5 text-xs bg-[#FFC800] hover:bg-[#FFE082] text-zinc-900 border border-zinc-900 flex items-center gap-1.5 font-bold shadow-none"
                            title="Practice this sign in Sign Academy"
                          >
                            <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                            Practice Sign
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

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
                filteredAlphabet.map((item) => {
                  const letterImg = `/signs/alphabet_${item.letter.toLowerCase()}.jpg`;
                  return (
                    <div
                      key={item.letter}
                      className="cartoon-card p-3 bg-white border-2 border-zinc-900 hover:shadow-cartoon-md transition-all flex flex-col justify-between gap-2"
                    >
                      <div>
                        <div className="flex items-center gap-2.5 mb-2">
                          <div className="w-14 h-14 bg-[#EAF6E8] rounded-xl border-2 border-zinc-900 overflow-hidden flex-shrink-0 p-1 flex items-center justify-center">
                            <img
                              src={letterImg}
                              alt={`Letter ${item.letter}`}
                              className="w-full h-full object-contain rounded-lg"
                              loading="lazy"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-2xl text-zinc-950 font-mono">
                                {item.letter}
                              </span>
                              <span className={`cartoon-badge !py-0.5 !px-2 text-xs font-bold ${
                                item.category === 'Vowel' ? 'bg-[#FFC800] text-zinc-900' : 'bg-zinc-100 text-zinc-700'
                              } shadow-none`}>
                                {item.category}
                              </span>
                            </div>
                            <div className="text-xs font-mono font-bold text-zinc-600 uppercase">
                              {item.type}
                            </div>
                          </div>
                        </div>
                        <p className="text-xs sm:text-sm text-zinc-800 font-bold leading-relaxed mb-2">
                          {item.description}
                        </p>
                      </div>
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-zinc-100">
                      <div className="text-xs sm:text-sm font-bold text-[#16A34A] bg-[#EDFDF2] p-1.5 rounded-lg border border-green-200 flex-1 flex items-center gap-1.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" />
                        <span>{item.tip}</span>
                      </div>
                      {onSelectForPractice && (
                        <button
                          onClick={() => onSelectForPractice(item.letter)}
                          className="cartoon-btn !py-1 !px-2.5 text-xs bg-[#1CB0F6] hover:bg-[#7dd3fc] text-zinc-900 border border-zinc-900 flex items-center gap-1 font-bold shadow-none flex-shrink-0"
                          title="Practice this letter in Sign Academy"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-zinc-900" />
                          Practice
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            </div>
          )}
        </div>

        {/* 4. Footer */}
        <div className="p-3 bg-[#EAF6E8] border-t-2 border-zinc-900 flex items-center justify-end flex-shrink-0">
          <button
            onClick={onClose}
            className="cartoon-btn cartoon-btn-primary !px-5 !py-2 text-xs sm:text-sm font-black"
          >
            Close Dictionary
          </button>
        </div>
      </div>
    </div>
  );
}

export default WordDictionaryModal;
