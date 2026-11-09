import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Wifi, Clock, MessageSquare, Sparkles, User, Check, Hand } from 'lucide-react';
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
  onSendMessage = () => {},
  currentUserRole = 'peer',
  currentUserName = 'User',
  peerPresence = { isOnline: false, role: null, name: '' },
  connectionMode = 'p2p',
  rttMs = 18
}) {
  const [inputText, setInputText] = useState('');
  const scrollContainerRef = useRef(null);

  // Self-contained scrolling to bottom on new message
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
    }
  }, [messages, incomingPartialSigning]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickReply = (reply) => {
    onSendMessage(reply);
  };

  return (
    <div className="cartoon-card flex flex-col h-full w-full overflow-hidden bg-white">
      {/* 1. Header & Partner Presence */}
      <div className="px-3.5 py-2.5 bg-[#FAF8F5] border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-zinc-900 flex items-center justify-center text-white">
            <MessageSquare className="w-3.5 h-3.5 stroke-[2.2]" />
          </div>
          <div>
            <h3 className="font-extrabold text-xs sm:text-sm text-zinc-900 leading-tight">
              Live Conversation
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] font-medium text-zinc-500">
              <span
                className={`w-2 h-2 rounded-full ${
                  peerPresence.isOnline ? 'bg-[#22C55E] animate-pulse' : 'bg-zinc-400'
                }`}
              />
              <span>
                {peerPresence.isOnline
                  ? `${peerPresence.name || 'Partner'} online`
                  : 'Waiting for partner...'}
              </span>
            </div>
          </div>
        </div>

        <div className="cartoon-badge bg-white text-zinc-800 shadow-none text-[10px]">
          <span>{connectionMode === 'p2p' ? 'Direct P2P' : 'Relay'}</span>
          <span className="font-mono text-zinc-400 font-bold">• {rttMs}ms</span>
        </div>
      </div>

      {/* 2. Scrollable Message Feed */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-3 sm:p-3.5 space-y-2.5 min-h-0 bg-[#FAF8F5]"
      >
        {messages.length === 0 && !incomingPartialSigning && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
            <div className="w-12 h-12 rounded-2xl bg-white border-2 border-zinc-200 flex items-center justify-center mb-2 shadow-sm">
              <MessageSquare className="w-6 h-6 text-zinc-300 stroke-[2]" />
            </div>
            <p className="font-extrabold text-xs text-zinc-600">No messages yet</p>
            <p className="text-[11px] text-zinc-400 max-w-xs mt-0.5">
              Signs and typed replies will appear here in real time.
            </p>
          </div>
        )}

        {messages.slice().reverse().map((msg) => {
          const isFromSigner = msg.senderRole === 'signer' || Boolean(msg.glosses);
          const isSelf = msg.sender === currentUserName;

          return (
            <div
              key={msg.id}
              className={`p-3 rounded-2xl border-2 border-zinc-900 shadow-cartoon-sm ${
                isSelf ? 'bg-white ml-2 sm:ml-4' : 'bg-[#FFF9E5] mr-2 sm:mr-4'
              }`}
            >
              {/* Header: Sender badge & Timestamp */}
              <div className="flex items-center justify-between text-[11px] mb-1.5 pb-1 border-b border-zinc-200/80">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-zinc-900">
                    {msg.sender}
                  </span>
                  {isSelf && (
                    <span className="cartoon-badge !py-0 !px-1 text-[9px] bg-[#FFD15C] text-zinc-900">
                      You
                    </span>
                  )}
                  {isFromSigner ? (
                    <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#22C55E] text-white flex items-center gap-0.5">
                      <Hand className="w-2.5 h-2.5" />
                      <span>ISL Signed</span>
                    </span>
                  ) : (
                    <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-zinc-900 text-white">
                      Typed
                    </span>
                  )}
                </div>
                <span className="text-zinc-400 font-mono text-[10px]">{msg.timestamp}</span>
              </div>

              {/* Gloss Badges (if sign language) */}
              {msg.glosses && msg.glosses.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap my-1.5">
                  <span className="text-[9px] font-mono font-bold text-zinc-500 uppercase mr-0.5">
                    Signs:
                  </span>
                  {msg.glosses.map((gloss, gIdx) => (
                    <span
                      key={gIdx}
                      className="cartoon-token !py-0.5 !px-2 !text-[10px]"
                    >
                      {gloss}
                    </span>
                  ))}
                </div>
              )}

              {/* Message Content */}
              {msg.glosses && msg.glosses.length > 0 ? (
                <div className="space-y-1 mt-1.5">
                  {/* Direct Transcript */}
                  <div className="text-[11px] text-zinc-500 font-mono italic">
                    Direct: "{msg.rawText || formatRawGlosses(msg.glosses)}"
                  </div>

                  {/* Auto Grammar English Translation */}
                  <div className="p-2 rounded-xl bg-white border border-zinc-300 flex items-start gap-1.5 shadow-sm">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-xs sm:text-sm font-bold text-zinc-950 leading-snug">
                      "{msg.autoGrammar || msg.text || formatIslSentence(msg.glosses)}"
                    </p>
                  </div>
                </div>
              ) : (
                /* Regular Typed Message */
                <p className="text-xs sm:text-sm font-bold text-zinc-900 leading-snug">
                  "{msg.text}"
                </p>
              )}
            </div>
          );
        })}

        {/* Live Partial Signing Stream Alert Card */}
        {incomingPartialSigning && (incomingPartialSigning.previewText || (incomingPartialSigning.glosses && incomingPartialSigning.glosses.length > 0)) && (
          <div className="p-3 rounded-2xl border-2 border-zinc-900 bg-[#FFF9E5] shadow-cartoon-sm animate-pulse-ring">
            <div className="flex items-center gap-1.5 font-bold text-xs text-zinc-900 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>{incomingPartialSigning.sender || 'Partner'} is signing now...</span>
            </div>

            {incomingPartialSigning.glosses?.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap my-1">
                {incomingPartialSigning.glosses.map((g, i) => (
                  <span
                    key={i}
                    className="cartoon-token !py-0.5 !px-2 !text-[10px]"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-1 pt-1 border-t border-amber-200 text-xs font-bold text-zinc-950">
              "{incomingPartialSigning.previewText || formatIslSentence(incomingPartialSigning.glosses)}"
            </div>
          </div>
        )}
      </div>

      {/* 3. Quick Reply Toolbar */}
      <div className="px-3 py-2 bg-white border-t border-zinc-200 overflow-x-auto flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex-shrink-0">
          Quick:
        </span>
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => handleQuickReply(reply)}
            className="cartoon-btn !py-0.5 !px-2 text-xs font-medium bg-[#FAF8F5] hover:bg-zinc-900 hover:text-white"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* 4. Message Input & Transmit Bar */}
      <form onSubmit={handleSubmit} className="p-2.5 sm:p-3 bg-[#FAF8F5] border-t-2 border-zinc-900 flex items-center gap-2 flex-shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type a message to your partner..."
          className="cartoon-input flex-1 text-xs sm:text-sm py-2 px-3 shadow-none focus:shadow-cartoon-sm"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="cartoon-btn cartoon-btn-primary font-bold text-xs sm:text-sm py-2 px-3.5 shadow-cartoon-sm"
        >
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;