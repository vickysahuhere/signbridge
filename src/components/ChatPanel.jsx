import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Zap, Wifi, Clock, MessageSquare } from 'lucide-react';

const QUICK_REPLIES = [
  'Yes',
  'No',
  'Thank you!',
  'Please repeat',
  'Where are you now?',
  'I understand'
];

/**
 * ChatPanel
 * 
 * 5-column conversational workspace (NETW-04, ui.md):
 * - Displays message thread with ISL gloss tokens and English text.
 * - Live signing stream indicator ("Aarav is signing...").
 * - Quick reply chips for instant hearing-partner replies.
 * - Text input box with Send button.
 */
export function ChatPanel({
  messages = [],
  incomingPartialSigning = null,
  onSendMessage = () => {},
  currentUserRole = 'text_partner',
  currentUserName = 'Priya',
  peerPresence = { isOnline: false, role: null, name: '' },
  connectionMode = 'p2p',
  rttMs = 18
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
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
    <div className="flex flex-col h-full w-full bg-slate-800/90 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
      {/* 1. Header: Status & Connection Indicator */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/70 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-300">
            <MessageSquare className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-slate-100 tracking-tight flex items-center gap-2">
              Two-Way Bridge Chat
            </h3>
            <div className="flex items-center gap-1.5 text-[11px] font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  peerPresence.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                }`}
              />
              <span className={peerPresence.isOnline ? 'text-emerald-300' : 'text-slate-400'}>
                {peerPresence.isOnline
                  ? `${peerPresence.name || 'Partner'} Online`
                  : 'Waiting for partner...'}
              </span>
            </div>
          </div>
        </div>

        {/* Connection Transport Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-mono font-semibold bg-slate-900/80 border-slate-700">
          <Wifi className={`w-3 h-3 ${connectionMode === 'p2p' ? 'text-emerald-400' : 'text-sky-400'}`} />
          <span className={connectionMode === 'p2p' ? 'text-emerald-300' : 'text-sky-300'}>
            {connectionMode === 'p2p' ? `P2P (${rttMs}ms)` : `WebSocket (${rttMs}ms)`}
          </span>
        </div>
      </div>

      {/* 2. Scrollable Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[320px] max-h-[460px]">
        {messages.length === 0 && !incomingPartialSigning && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 text-xs">
            <Sparkles className="w-8 h-8 text-slate-600 mb-2 stroke-[1.5]" />
            <p className="font-medium text-slate-400">Ready to communicate</p>
            <p className="text-[11px] text-slate-500 max-w-xs mt-1">
              Signs performed by the signer or text typed by the partner will appear here in real time.
            </p>
          </div>
        )}

        {messages.slice().reverse().map((msg) => {
          const isFromSigner = msg.senderRole === 'signer' || Boolean(msg.glosses);
          const isSelf = msg.sender === currentUserName;

          return (
            <div
              key={msg.id}
              className={`flex flex-col gap-1 max-w-[85%] ${
                isSelf ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 px-1">
                <span className="font-semibold text-slate-300">{msg.sender}</span>
                <span>•</span>
                <span>{msg.timestamp}</span>
              </div>

              <div
                className={`p-3 rounded-2xl shadow-md ${
                  isFromSigner
                    ? 'bg-slate-900/90 border border-emerald-500/40 text-slate-100 rounded-tl-sm'
                    : 'bg-sky-600 text-slate-50 border border-sky-400/30 rounded-tr-sm shadow-sky-900/30'
                }`}
              >
                {/* ISL Original Gloss Pills Badge */}
                {msg.glosses && msg.glosses.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mb-2 pb-2 border-b border-slate-700/60">
                    <span className="text-[9px] font-mono text-emerald-400 uppercase font-semibold mr-1">
                      ISL Gloss:
                    </span>
                    {msg.glosses.map((gloss, idx) => (
                      <span
                        key={idx}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold"
                      >
                        {gloss}
                      </span>
                    ))}
                  </div>
                )}

                <p className="text-sm font-medium tracking-wide">
                  "{msg.text}"
                </p>
              </div>
            </div>
          );
        })}

        {/* Live Partial Sign Streaming Indicator (NETW-04) */}
        {incomingPartialSigning && incomingPartialSigning.previewText && (
          <div className="mr-auto max-w-[85%] flex flex-col gap-1 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="flex items-center gap-1 text-[10px] font-mono text-amber-400 px-1 font-semibold">
              <Zap className="w-3 h-3 text-amber-400 animate-bounce" />
              <span>{incomingPartialSigning.sender || 'Signer'} is signing...</span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/40 text-amber-200 rounded-tl-sm shadow-inner">
              {incomingPartialSigning.glosses?.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap mb-1.5">
                  {incomingPartialSigning.glosses.map((g, i) => (
                    <span
                      key={i}
                      className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    >
                      {g}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-xs font-mono italic">
                "{incomingPartialSigning.previewText}"
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Quick Reply Chips */}
      <div className="px-3 py-2 border-t border-slate-700/60 bg-slate-900/40 overflow-x-auto flex items-center gap-1.5 scrollbar-none">
        <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold flex-shrink-0 select-none">
          Quick:
        </span>
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => handleQuickReply(reply)}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-500/20 border border-slate-700 hover:border-sky-500/40 text-slate-300 hover:text-sky-200 text-xs font-medium transition flex-shrink-0 shadow-sm"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* 4. Text Message Input Box */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-700/70 bg-slate-900/80 flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            currentUserRole === 'text_partner'
              ? 'Type a reply to the signer (shows in HUD)...'
              : 'Type a message in chat...'
          }
          className="flex-1 bg-slate-950/80 border border-slate-700/80 focus:border-sky-500 rounded-xl px-3.5 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition focus:ring-1 focus:ring-sky-500/50"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-sky-500/20"
        >
          <Send className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
