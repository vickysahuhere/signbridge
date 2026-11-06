import React, { useState, useRef, useEffect } from 'react';
import { Send, Zap, Wifi, Clock, MessageSquare, Terminal, Sparkles } from 'lucide-react';
import { formatIslSentence, formatRawGlosses } from '../nlp/islSentenceFormatter.js';

const QUICK_REPLIES = [
  'Yes',
  'No',
  'Thank you!',
  'Please repeat',
  'Where are you now?',
  'I understand'
];

/**
 * ChatPanel (Retro / 90s Nostalgia Edition)
 * 
 * Windows 95 / ICQ / AIM 1997 Two-Way Messenger:
 * - Internal container scrolling ONLY (never triggers window scroll jumps).
 * - Alternating row backgrounds (#FFFFFF / #E8E8E8) with visible grid dividers.
 * - Sunken message feed with authentic IRC-style tags.
 * - Outset 3D quick reply buttons.
 * - Sunken input box with classic [ Send ] button.
 */
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

  // Self-contained scrolling: updates only the inner container without jumping the main page
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
    <div className="retro-window flex flex-col h-full w-full shadow-md min-h-0 overflow-hidden">
      {/* 1. Window Title Bar */}
      <div className="retro-window-titlebar flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <MessageSquare className="w-3.5 h-3.5 stroke-[2px]" />
          <span>SignBridge Instant Messenger - [Chat Session]</span>
        </div>
        <div className="flex items-center gap-1">
          <button className="retro-window-btn" aria-label="Minimize">_</button>
          <button className="retro-window-btn" aria-label="Maximize">□</button>
          <button className="retro-window-btn" aria-label="Close">×</button>
        </div>
      </div>

      {/* 2. Chat Sub-Header / Partner Presence Bar */}
      <div className="flex items-center justify-between px-2 py-1 bg-[#C0C0C0] border-b border-[#808080] text-xs font-mono flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span
            className={`w-2 h-2 ${
              peerPresence.isOnline ? 'bg-[#00AA00]' : 'bg-[#808080]'
            }`}
          />
          <span className="font-bold text-[#000000] text-[11px]">
            {peerPresence.isOnline
              ? `PARTNER ONLINE: ${peerPresence.name || 'Remote Peer'}`
              : 'WAITING FOR PEER...'}
          </span>
        </div>

        <div className="retro-inset px-1.5 py-0.2 bg-[#FFFFFF] text-[10px] text-[#000080] font-bold">
          {connectionMode === 'p2p' ? `DIRECT P2P (${rttMs}ms)` : `NET (${rttMs}ms)`}
        </div>
      </div>

      {/* 3. Scrollable Message Feed with Alternating Row Backgrounds */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-1.5 space-y-1 min-h-0 retro-inset bg-[#FFFFFF]"
      >
        {messages.length === 0 && !incomingPartialSigning && (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-[#808080] text-xs font-mono">
            <Terminal className="w-6 h-6 text-[#808080] mb-1.5 stroke-[2px]" />
            <p className="font-bold text-[#000000]">--- TWO-WAY ISL CHAT LOG ---</p>
            <p className="text-[11px] mt-0.5 max-w-xs text-[#808080]">
              Recognized gestures and typed replies appear here in real time.
            </p>
          </div>
        )}

        {/* Message Feed with Table-like Alternating Rows */}
        {messages.slice().reverse().map((msg, idx) => {
          const isFromSigner = msg.senderRole === 'signer' || Boolean(msg.glosses);
          const isSelf = msg.sender === currentUserName;
          const rowBg = idx % 2 === 0 ? 'bg-[#FFFFFF]' : 'bg-[#E8E8E8]';

          return (
            <div
              key={msg.id}
              className={`p-1.5 border-b border-[#808080] ${rowBg} font-sans text-xs`}
            >
              {/* Header: Sender & Timestamp */}
              <div className="flex items-center justify-between text-[10px] font-mono mb-0.5">
                <div className="flex items-center gap-1">
                  <span className={`font-bold ${isFromSigner ? 'text-[#000080]' : 'text-[#CC0000]'}`}>
                    &lt;{msg.sender}&gt;
                  </span>
                  {isSelf && (
                    <span className="text-[9px] bg-[#FFFF00] text-[#000000] px-1 font-bold">
                      YOU
                    </span>
                  )}
                  {isFromSigner ? (
                    <span className="text-[9px] bg-[#00AA00] text-[#FFFFFF] px-1 font-bold">
                      ISL SIGNED
                    </span>
                  ) : (
                    <span className="text-[9px] bg-[#000080] text-[#FFFFFF] px-1 font-bold">
                      TYPED
                    </span>
                  )}
                </div>
                <span className="text-[#808080] text-[9px]">[{msg.timestamp}]</span>
              </div>

              {/* ISL Gloss Chips (if available) */}
              {msg.glosses && msg.glosses.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap my-0.5 pb-0.5 border-b border-[#C0C0C0]">
                  <span className="text-[9px] font-mono font-bold text-[#000080]">
                    GLOSSES:
                  </span>
                  {msg.glosses.map((gloss, gIdx) => (
                    <span
                      key={gIdx}
                      className="retro-outset text-[9px] font-mono px-1 py-0.2 bg-[#C0C0C0] text-[#000000] font-bold"
                    >
                      {gloss}
                    </span>
                  ))}
                </div>
              )}

              {/* Message Content: When glosses exist, display both Direct translation and Auto Grammar */}
              {msg.glosses && msg.glosses.length > 0 ? (
                <div className="space-y-1 mt-1">
                  {/* Line 1: Direct Literal Gloss Transcript */}
                  <div className="flex items-start gap-1.5 text-xs text-[#555555]">
                    <span className="retro-inset px-1 py-0.2 bg-[#E0E0E0] text-[#333333] font-mono text-[9px] font-bold uppercase flex-shrink-0">
                      DIRECT:
                    </span>
                    <p className="text-xs text-[#444444] font-mono leading-tight italic">
                      "{msg.rawText || formatRawGlosses(msg.glosses)}"
                    </p>
                  </div>

                  {/* Line 2: Auto Grammar English Translation */}
                  <div className="flex items-start gap-1.5 text-xs bg-[#FFFFCC] p-1 border border-[#808080]">
                    <span className="retro-outset px-1 py-0.2 bg-[#000080] text-[#FFFFFF] font-mono text-[9px] font-bold uppercase flex-shrink-0 flex items-center gap-0.5">
                      <Sparkles className="w-2.5 h-2.5 stroke-[2px]" />
                      AUTO GRAMMAR:
                    </span>
                    <p className="text-xs font-bold text-[#000000] leading-tight">
                      "{msg.autoGrammar || msg.text || formatIslSentence(msg.glosses)}"
                    </p>
                  </div>
                </div>
              ) : (
                /* Regular Typed Message */
                <p className="text-xs font-bold text-[#000000] leading-tight">
                  "{msg.text}"
                </p>
              )}
            </div>
          );
        })}

        {/* Live Partial Signing Stream Notice */}
        {incomingPartialSigning && (incomingPartialSigning.previewText || (incomingPartialSigning.glosses && incomingPartialSigning.glosses.length > 0)) && (
          <div className="p-1.5 bg-[#FFFFCC] border-2 border-[#000080] text-xs font-mono animate-blink">
            <div className="flex items-center gap-1 font-bold text-[#000080] mb-0.5">
              <Zap className="w-3 h-3 stroke-[2px] text-[#CC0000]" />
              <span>&gt;&gt; {incomingPartialSigning.sender || 'Signer'} signing live:</span>
            </div>
            {incomingPartialSigning.glosses?.length > 0 && (
              <div className="flex items-center gap-1 flex-wrap mb-1">
                {incomingPartialSigning.glosses.map((g, i) => (
                  <span
                    key={i}
                    className="retro-outset bg-[#000080] text-[#FFFFFF] text-[9px] px-1 font-mono font-bold"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
            <div className="space-y-0.5 pt-0.5 border-t border-[#808080]">
              <div className="flex items-center gap-1 text-[11px] text-[#555555]">
                <span className="font-bold text-[9px] bg-[#E0E0E0] text-[#000000] px-1 retro-inset">DIRECT:</span>
                <span className="italic">"{incomingPartialSigning.rawText || formatRawGlosses(incomingPartialSigning.glosses)}"</span>
              </div>
              <div className="flex items-center gap-1 text-xs text-[#000000]">
                <span className="font-bold text-[9px] bg-[#000080] text-[#FFFFFF] px-1 retro-outset flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5 stroke-[2px]" />
                  AUTO GRAMMAR:
                </span>
                <span className="font-bold">"{incomingPartialSigning.previewText || formatIslSentence(incomingPartialSigning.glosses)}"</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. Quick Reply Toolbar */}
      <div className="px-1.5 py-1 bg-[#C0C0C0] border-t border-[#808080] overflow-x-auto flex items-center gap-1 flex-shrink-0">
        <span className="text-[9px] font-mono font-bold text-[#000000] uppercase flex-shrink-0">
          QUICK:
        </span>
        {QUICK_REPLIES.map((reply) => (
          <button
            key={reply}
            onClick={() => handleQuickReply(reply)}
            className="retro-btn !px-1.5 !py-0.2 text-[11px] font-normal"
          >
            {reply}
          </button>
        ))}
      </div>

      {/* 5. Message Input & Transmit Bar */}
      <form onSubmit={handleSubmit} className="p-1.5 bg-[#C0C0C0] border-t border-[#808080] flex items-center gap-1.5 flex-shrink-0">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type message in cyber-chat log..."
          className="retro-input flex-1 text-xs py-1 px-2"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="retro-btn retro-btn-primary text-xs font-bold py-1 px-2.5"
        >
          <Send className="w-3 h-3 stroke-[2px]" />
          <span>[ SEND ⏎ ]</span>
        </button>
      </form>
    </div>
  );
}

export default ChatPanel;
