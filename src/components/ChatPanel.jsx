import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Zap,
  Wifi,
  Clock,
  MessageSquare,
  Sparkles,
  User,
  Check,
  Hand,
  Volume2,
  Copy,
  Trash2,
  Radio,
  CornerDownLeft
} from 'lucide-react';
import { formatIslSentence, formatRawGlosses } from '../nlp/islSentenceFormatter.js';

const QUICK_REPLIES = [
  'Yes',
  'No',
  'Thank you!',
  'Please repeat',
  'I understand',
  'Where are you now?'
];

export function ChatPanel({
  messages = [],
  incomingPartialSigning = null,
  localGlosses = [],
  localPreviewText = '',
  motionState = { state: 'IDLE', pauseProgress: 0 },
  onSendMessage = () => {},
  currentUserRole = 'peer',
  currentUserName = 'User',
  peerPresence = { isOnline: false, role: null, name: '' },
  connectionMode = 'p2p',
  rttMs = 18,
  onClearMessages = null
}) {
  const [inputText, setInputText] = useState('');
  const [copiedTranscript, setCopiedTranscript] = useState(false);
  const [speakingId, setSpeakingId] = useState(null);
  const scrollContainerRef = useRef(null);

  // Auto-scroll to bottom on new messages or partial updates
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, incomingPartialSigning, localGlosses, localPreviewText]);

  // Speech synthesis helper to speak translations aloud
  const handleSpeak = (text, id) => {
    if (!text || typeof window === 'undefined' || !window.speechSynthesis) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      setSpeakingId(id);
      utterance.onend = () => setSpeakingId(null);
      utterance.onerror = () => setSpeakingId(null);
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('[ChatPanel] TTS failed:', err);
      setSpeakingId(null);
    }
  };

  // Copy entire conversation transcript
  const handleCopyTranscript = () => {
    if (messages.length === 0) return;
    const transcript = messages
      .slice()
      .reverse()
      .map((msg) => {
        const text = msg.autoGrammar || msg.text || '';
        const glosses = msg.glosses && msg.glosses.length > 0 ? ` [Signs: ${msg.glosses.join(', ')}]` : '';
        return `[${msg.timestamp || ''}] ${msg.sender}: ${text}${glosses}`;
      })
      .join('\n');

    if (navigator.clipboard) {
      navigator.clipboard.writeText(transcript);
      setCopiedTranscript(true);
      setTimeout(() => setCopiedTranscript(false), 2000);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickReply = (reply) => {
    onSendMessage(reply);
  };

  const pauseProgress = Math.max(0, Math.min(1, motionState?.pauseProgress || 0));
  const remainingSeconds = Math.max(0, (1 - pauseProgress) * 1.2).toFixed(1);

  return (
    <div className="duo-card flex flex-col h-full w-full overflow-hidden bg-white">
      {/* 1. Header: Auto-Conversion Status & Actions */}
      <div className="px-3.5 py-2.5 bg-[#F7F7F7] border-b-2 border-[#E5E5E5] flex items-center justify-between gap-2 flex-shrink-0 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-[#58CC02] border-2 border-[#46A302] border-b-3 flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-black text-xs sm:text-sm text-[#3C3C3C] leading-tight flex items-center gap-1.5">
              <span>Auto-Conversion Stream</span>
              <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                Live
              </span>
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  peerPresence.isOnline ? 'bg-[#58CC02] animate-pulse' : 'bg-zinc-300'
                }`}
              />
              <span>
                {peerPresence.isOnline
                  ? `${peerPresence.name || 'Partner'} connected`
                  : 'Waiting for partner...'}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls & Latency Badge */}
        <div className="flex items-center gap-1.5">
          <div className="duo-badge bg-white text-zinc-800 text-[10px] hidden sm:inline-flex">
            <span>{connectionMode === 'p2p' ? 'Direct P2P' : 'Relay'}</span>
            <span className="font-mono text-zinc-400 font-bold">• {rttMs}ms</span>
          </div>

          {messages.length > 0 && (
            <>
              <button
                type="button"
                onClick={handleCopyTranscript}
                className="duo-btn !py-1 !px-2 text-[10px] font-bold bg-white text-zinc-700 hover:text-zinc-950 flex items-center gap-1"
                title="Copy entire transcript to clipboard"
              >
                {copiedTranscript ? <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" /> : <Copy className="w-3 h-3" />}
                <span className="hidden sm:inline">{copiedTranscript ? 'Copied' : 'Copy'}</span>
              </button>

              {onClearMessages && (
                <button
                  type="button"
                  onClick={onClearMessages}
                  className="duo-btn !py-1 !px-2 text-[10px] font-bold bg-white text-zinc-700 hover:text-[#EF4444] flex items-center gap-1"
                  title="Clear conversation history"
                >
                  <Trash2 className="w-3 h-3" />
                  <span className="hidden sm:inline">Clear</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* 2. Simultaneous Real-Time Guessing Tickers (In-Progress Signing) */}
      <div className="flex flex-col gap-1.5 p-2.5 bg-[#FFFDEB] border-b-2 border-amber-200/80 flex-shrink-0">
        
        {/* LOCAL SIGNER TICKER: What YOU are currently signing */}
        {localGlosses && localGlosses.length > 0 ? (
          <div className="p-2.5 rounded-xl bg-white border-2 border-[#58CC02] shadow-sm animate-in fade-in duration-100">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
              <div className="flex items-center gap-1.5 font-black text-[#227200]">
                <span className="w-2 h-2 rounded-full bg-[#58CC02] animate-pulse" />
                <span>You are signing now (Auto-Converting):</span>
              </div>
              {motionState?.state === 'PAUSE_COUNTDOWN' ? (
                <span className="text-xs font-mono font-bold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300">
                  Auto-commits in {remainingSeconds}s...
                </span>
              ) : (
                <span className="text-xs font-mono font-bold text-emerald-700">
                  ⚡ Live Guessing
                </span>
              )}
            </div>

            {/* Gloss Tokens */}
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              {localGlosses.map((g, i) => (
                <span key={i} className="duo-token !py-1 !px-2.5 !text-xs sm:!text-sm font-black bg-[#EEFDE5] border-[#58CC02]/40 text-[#227200]">
                  {g}
                </span>
              ))}
            </div>

            {/* Fluent Translation Preview */}
            <div className="text-sm sm:text-base font-black text-zinc-900 italic">
              "{localPreviewText || formatIslSentence(localGlosses)}"
            </div>
          </div>
        ) : (
          <div className="px-2 py-1 text-xs sm:text-sm font-bold text-amber-900/80 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Your AI is live. Hands-free auto-commit triggers on pause.</span>
            </span>
            <span className="text-xs font-mono text-zinc-500">Zero send click needed</span>
          </div>
        )}

        {/* REMOTE PARTNER TICKER: What PARTNER is currently signing */}
        {incomingPartialSigning && (incomingPartialSigning.previewText || (incomingPartialSigning.glosses && incomingPartialSigning.glosses.length > 0)) && (
          <div className="p-2.5 rounded-xl bg-white border-2 border-[#0284C7] shadow-sm animate-pulse">
            <div className="flex items-center justify-between text-xs sm:text-sm mb-1.5">
              <div className="flex items-center gap-1.5 font-black text-[#0284C7]">
                <Zap className="w-3.5 h-3.5 text-[#0284C7] fill-[#0284C7]" />
                <span>{incomingPartialSigning.sender || 'Partner'} is signing right now:</span>
              </div>
              <span className="text-xs font-mono text-sky-600 font-bold">
                P2P Streaming
              </span>
            </div>

            {incomingPartialSigning.glosses?.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
                {incomingPartialSigning.glosses.map((g, i) => (
                  <span key={i} className="duo-token !py-1 !px-2.5 !text-xs sm:!text-sm font-black bg-[#DDF4FE] border-[#0284C7]/40 text-[#0284C7]">
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="text-sm sm:text-base font-black text-sky-950 italic">
              "{incomingPartialSigning.previewText || formatIslSentence(incomingPartialSigning.glosses)}"
            </div>
          </div>
        )}

      </div>

      {/* 3. Scrollable Chronological Auto-Conversion Feed */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2.5 min-h-0 bg-[#F4FAF2]"
      >
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400 select-none">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-[#E5E5E5] flex items-center justify-center mb-2 shadow-sm">
              <Sparkles className="w-6 h-6 text-[#58CC02] stroke-[2.2]" />
            </div>
            <p className="font-black text-xs text-zinc-700">Auto-Conversion Feed Ready</p>
            <p className="text-[11px] text-zinc-500 max-w-xs mt-1 font-medium leading-relaxed">
              Start signing! Your gestures are translated in real time and automatically appended here without pressing any send button.
            </p>
          </div>
        )}

        {messages.slice().reverse().map((msg) => {
          const isFromSigner = msg.senderRole === 'signer' || Boolean(msg.glosses);
          const isSelf = msg.sender === currentUserName;
          const displayTranslation = msg.autoGrammar || msg.text || (msg.glosses ? formatIslSentence(msg.glosses) : '');

          return (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl border-2 transition-all ${
                isSelf
                  ? 'bg-white border-[#E5E5E5] border-b-[3px] ml-2 sm:ml-4'
                  : 'bg-[#EEFDE5] border-[#58CC02]/40 border-b-[3px] border-b-[#46A302]/40 mr-2 sm:mr-4'
              }`}
            >
              {/* Header: Sender badge, TTS speaker button & Timestamp */}
              <div className="flex items-center justify-between text-[11px] mb-1.5 pb-1 border-b border-zinc-200/60">
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-[#3C3C3C]">
                    {msg.sender}
                  </span>
                  {isSelf && (
                    <span className="duo-badge !py-0 !px-1.5 text-[9px] bg-[#FFC800] text-[#78350F] border-[#E5A500]">
                      You
                    </span>
                  )}
                  {isFromSigner ? (
                    <span className="duo-badge !py-0 !px-1.5 text-[9px] bg-[#58CC02] text-white border-[#46A302] flex items-center gap-0.5">
                      <Hand className="w-2.5 h-2.5 stroke-[2.5]" />
                      <span>ISL Auto-Converted</span>
                    </span>
                  ) : (
                    <span className="duo-badge !py-0 !px-1.5 text-[9px] bg-[#1CB0F6] text-white border-[#1899D6]">
                      Typed
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {displayTranslation && (
                    <button
                      type="button"
                      onClick={() => handleSpeak(displayTranslation, msg.id)}
                      className={`p-1 rounded-md transition-colors ${
                        speakingId === msg.id ? 'bg-[#58CC02] text-white' : 'text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100'
                      }`}
                      title="Speak translation aloud"
                    >
                      <Volume2 className="w-3.5 h-3.5 stroke-[2.2]" />
                    </button>
                  )}
                  <span className="text-zinc-400 font-mono text-[10px]">{msg.timestamp}</span>
                </div>
              </div>

              {/* Gloss Badges (if sign language) */}
              {msg.glosses && msg.glosses.length > 0 && (
                <div className="flex items-center gap-1.5 flex-wrap my-1.5">
                  <span className="text-xs font-mono font-black text-zinc-500 uppercase mr-0.5">
                    Signs:
                  </span>
                  {msg.glosses.map((gloss, gIdx) => (
                    <span
                      key={gIdx}
                      className="duo-token !py-1 !px-2.5 !text-xs sm:!text-sm font-black"
                    >
                      {gloss}
                    </span>
                  ))}
                </div>
              )}

              {/* Message Content / Auto-Grammar Translation */}
              {msg.glosses && msg.glosses.length > 0 ? (
                <div className="space-y-1.5 mt-1.5">
                  {/* Direct Literal Transcript */}
                  <div className="text-xs sm:text-sm text-zinc-600 font-mono italic">
                    Direct: "{msg.rawText || formatRawGlosses(msg.glosses)}"
                  </div>

                  {/* Auto-Grammar English Translation */}
                  <div className="p-3 rounded-xl bg-white border border-[#58CC02]/40 flex items-start gap-2 shadow-sm">
                    <Sparkles className="w-4 h-4 text-[#58CC02] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                    <p className="text-sm sm:text-base font-black text-[#2F7202] leading-snug">
                      "{displayTranslation}"
                    </p>
                  </div>
                </div>
              ) : (
                /* Regular Typed Message (For Hearing Partner) */
                <p className="text-sm sm:text-base font-black text-[#2C3E28] leading-snug">
                  "{msg.text}"
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* 4. Optional Secondary Input (For Hearing Partners without Sign Language) */}
      <div className="border-t-2 border-[#E5E5E5] bg-[#F7F7F7] flex-shrink-0">
        {/* Quick Reply Toolbar */}
        <div className="px-3 py-1.5 bg-white border-b border-[#E5E5E5] overflow-x-auto flex items-center gap-1.5 flex-shrink-0">
          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-wider flex-shrink-0">
            Quick:
          </span>
          {QUICK_REPLIES.map((reply) => (
            <button
              key={reply}
              onClick={() => handleQuickReply(reply)}
              className="duo-btn !py-0.5 !px-2 text-[11px] font-bold bg-[#F7F7F7] hover:bg-[#1CB0F6] hover:text-white hover:border-[#1899D6]"
            >
              {reply}
            </button>
          ))}
        </div>

        {/* Minimal Typed Message Bar (Hearing Partner Fallback) */}
        <form onSubmit={handleSubmit} className="p-2 sm:p-2.5 flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type optional text reply for hearing partner..."
            className="duo-input flex-1 text-xs py-1.5 px-3"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="duo-btn duo-btn-blue font-black text-xs py-1.5 px-3 flex items-center gap-1"
          >
            <Send className="w-3 h-3 stroke-[2.5]" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
}

export default ChatPanel;
