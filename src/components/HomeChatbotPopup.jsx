import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Send, Mic, MicOff, Sparkles, Volume2, Trash2, MessageCircle, AudioLines } from 'lucide-react';
import ChatTextFormatter from './ChatTextFormatter.jsx';
import { askGemini, hasGeminiKey } from '../utils/gemini.js';
import { speakText, stopSpeaking, isSpeechRecognitionSupported } from '../utils/speechService.js';

const isHindiText = (t) => /[\u0900-\u097F]/.test(t || '');
const HISTORY_KEY = 'sanket_ai_chat_v2';
const SUGGESTIONS = {
  home: ['What can Sanket do?', 'How do I start learning?'],
  learn: ['How do I do this sign?', 'Give me a tip'],
  chat: ['How do I join a call?', 'How do I sign a sentence?'],
  teach: ['How do I train a sign?'],
  test: ['How does the quiz work?']
};

function loadHistory() {
  try {
    const raw = JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
    return Array.isArray(raw) ? raw.slice(-30) : [];
  } catch { return []; }
}

export function HomeChatbotPopup({ isOpen, onClose, currentPage = 'home', extraState = {} }) {
  const [tab, setTab] = useState('chat'); // 'chat' | 'voice'
  const [messages, setMessages] = useState(loadHistory);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lang, setLang] = useState('en');

  // voice
  const [voiceState, setVoiceState] = useState('idle'); // idle | listening | thinking | speaking
  const [hasHiVoice, setHasHiVoice] = useState(true);
  useEffect(() => {
    const check = () => {
      const v = window.speechSynthesis?.getVoices?.() || [];
      if (v.length) setHasHiVoice(v.some((x) => x.lang.toLowerCase().startsWith('hi')));
    };
    check();
    window.speechSynthesis?.addEventListener?.('voiceschanged', check);
    return () => window.speechSynthesis?.removeEventListener?.('voiceschanged', check);
  }, []);
  const [heard, setHeard] = useState('');
  const [spoken, setSpoken] = useState('');
  const recRef = useRef(null);
  const abortRef = useRef(null);
  const tabRef = useRef(tab);
  const loopRef = useRef(false);
  const messagesRef = useRef(messages);
  const scrollRef = useRef(null);
  tabRef.current = tab;
  messagesRef.current = messages;

  useEffect(() => {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(messages.slice(-30))); } catch { /* ignore */ }
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, busy, tab]);

  const stopVoice = useCallback(() => {
    loopRef.current = false;
    try { recRef.current?.abort(); } catch { /* ignore */ }
    recRef.current = null;
    abortRef.current?.abort();
    stopSpeaking();
    setVoiceState('idle');
  }, []);

  // closing the panel or leaving the Voice tab must release the mic and silence the voice
  useEffect(() => { if (!isOpen || tab !== 'voice') stopVoice(); }, [isOpen, tab, stopVoice]);
  useEffect(() => () => stopVoice(), [stopVoice]);

  const send = useCallback(async (text, { voice = false, langOverride } = {}) => {
    const q = (text || '').trim();
    if (!q) return null;
    setError('');
    const next = [...messagesRef.current, { role: 'user', text: q }];
    setMessages(next);
    setBusy(true);
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    try {
      const reply = await askGemini(next, { page: currentPage, extraState, voice, lang: langOverride || lang, signal: ctrl.signal });
      setMessages((m) => [...m, { role: 'assistant', text: reply }]);
      return reply;
    } catch (e) {
      if (e.name !== 'AbortError') setError(e.message === 'NO_KEY' ? 'NO_KEY' : e.message);
      return null;
    } finally {
      setBusy(false);
    }
  }, [currentPage, extraState, lang]);

  const submit = (e) => {
    e?.preventDefault();
    if (busy) return;
    const q = input;
    setInput('');
    send(q);
  };

  /* ---------------- Voice AI ---------------- */
  const listen = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopSpeaking();
    const rec = new SR();
    rec.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    rec.interimResults = true;
    rec.continuous = false;
    let finalText = '';
    let failed = false;
    rec.onstart = () => { setVoiceState('listening'); setHeard(''); };
    rec.onresult = (ev) => {
      let t = '';
      for (let i = 0; i < ev.results.length; i++) t += ev.results[i][0].transcript;
      finalText = t;
      setHeard(t);
    };
    rec.onerror = (ev) => {
      failed = true;
      loopRef.current = false;
      if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') setError('Microphone permission is blocked.');
      else if (ev.error !== 'no-speech' && ev.error !== 'aborted') setError('Voice input failed. Try again.');
    };
    rec.onend = async () => {
      if (recRef.current !== rec) return;
      recRef.current = null;
      if (!loopRef.current) { setVoiceState('idle'); return; }
      const said = finalText.trim();
      if (!said || failed) { loopRef.current = false; setVoiceState('idle'); return; }
      setVoiceState('thinking');
      const reply = await send(said, { voice: true, langOverride: isHindiText(said) ? 'hi' : lang });
      if (!loopRef.current || tabRef.current !== 'voice') { setVoiceState('idle'); return; }
      if (!reply) { loopRef.current = false; setVoiceState('idle'); return; }
      setSpoken(reply);
      setVoiceState('speaking');
      speakText(reply, {
        lang: isHindiText(reply) ? 'hi-IN' : 'en-IN',
        onEnd: () => { if (loopRef.current) listen(); else setVoiceState('idle'); },
        onError: () => { loopRef.current = false; setVoiceState('idle'); }
      });
    };
    recRef.current = rec;
    try { rec.start(); } catch { setVoiceState('idle'); }
  }, [lang, send]);

  const toggleVoice = () => {
    if (voiceState !== 'idle') { stopVoice(); return; }
    setError('');
    setSpoken('');
    loopRef.current = true;
    listen();
  };

  const clearChat = () => { stopVoice(); setMessages([]); setSpoken(''); setHeard(''); setError(''); };

  if (!isOpen) return null;

  const langToggle = (cls) => (
    <div className="flex rounded-xl bg-zinc-100 p-0.5 font-black">
      {[['en', 'English'], ['hi', 'हिन्दी']].map(([id, label]) => (
        <button key={id} type="button" onClick={() => { stopVoice(); setLang(id); }}
          className={`${cls} rounded-lg ${lang === id ? 'bg-white shadow text-[#3C3C3C]' : 'text-zinc-500'}`}>{label}</button>
      ))}
    </div>
  );
  const noKey = !hasGeminiKey();
  const sr = isSpeechRecognitionSupported();
  const chips = SUGGESTIONS[currentPage] || SUGGESTIONS.home;
  const stateLabel = (lang === 'hi'
    ? { idle: 'बोलने के लिए दबाएँ', listening: 'सुन रहा हूँ…', thinking: 'सोच रहा हूँ…', speaking: 'बोल रहा हूँ… रोकने के लिए दबाएँ' }
    : { idle: 'Tap to talk', listening: 'Listening…', thinking: 'Thinking…', speaking: 'Speaking… tap to stop' })[voiceState];

  return (
    <div className="fixed inset-0 z-[90] flex items-end sm:items-center justify-end p-0 sm:p-5 pointer-events-none">
      <div className="absolute inset-0 bg-black/20 pointer-events-auto sm:bg-transparent" onClick={onClose} />
      <div className="relative pointer-events-auto w-full sm:w-[400px] h-[85vh] sm:h-[600px] max-h-full duo-card flex flex-col overflow-hidden bg-white">
        {/* header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b-2 border-zinc-100">
          <div className="w-8 h-8 rounded-xl bg-[#FFF5D1] border-2 border-[#FFC800] flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#78350F]" />
          </div>
          <div className="font-black text-[#3C3C3C] flex-1">Sanket AI</div>
          {tab === 'chat' && langToggle('text-xs px-2 py-1')}
          {messages.length > 0 && (
            <button type="button" onClick={clearChat} title="Clear chat" className="p-1.5 rounded-lg text-zinc-400 hover:bg-zinc-100">
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button type="button" onClick={onClose} title="Close" className="p-1.5 rounded-lg text-zinc-500 hover:bg-zinc-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* tabs */}
        <div className="grid grid-cols-2 gap-1 p-1.5 bg-zinc-50 border-b-2 border-zinc-100">
          {[['chat', 'Chat', MessageCircle], ['voice', 'Voice AI', AudioLines]].map(([id, label, Icon]) => (
            <button key={id} type="button" onClick={() => setTab(id)}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl text-sm font-black ${tab === id ? 'bg-[#58CC02] text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}>
              <Icon className="w-4 h-4" />{label}
            </button>
          ))}
        </div>

        {noKey && (
          <div className="m-3 p-3 rounded-xl bg-[#FFF5D1] border-2 border-[#FFC800] text-xs font-bold text-[#78350F]">
            Add your Gemini key: open the <code className="font-black">.env</code> file, set <code className="font-black">VITE_GEMINI_API_KEY=your_key</code>, then restart the app.
          </div>
        )}

        {tab === 'chat' ? (
          <>
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center gap-3 text-zinc-500">
                  <div className="font-black text-[#3C3C3C]">Ask me anything about Sanket</div>
                  <div className="flex flex-wrap justify-center gap-1.5">
                    {chips.map((c) => (
                      <button key={c} type="button" disabled={noKey || busy} onClick={() => send(c)}
                        className="px-3 py-1.5 rounded-full border-2 border-zinc-200 text-xs font-black text-zinc-600 hover:border-[#58CC02] disabled:opacity-50">{c}</button>
                    ))}
                  </div>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'bg-[#58CC02] text-white font-bold' : 'bg-zinc-100 text-[#3C3C3C]'}`}>
                    <ChatTextFormatter text={m.text} isUser={m.role === 'user'} />
                    {m.role === 'assistant' && (
                      <button type="button" title="Read aloud" onClick={() => speakText(m.text, { lang: isHindiText(m.text) ? 'hi-IN' : 'en-IN' })}
                        className="mt-1 text-zinc-400 hover:text-zinc-600"><Volume2 className="w-3.5 h-3.5" /></button>
                    )}
                  </div>
                </div>
              ))}
              {busy && <div className="text-xs font-black text-zinc-400 px-1">Thinking…</div>}
              {error && error !== 'NO_KEY' && <div className="text-xs font-bold text-red-600 px-1">{error}</div>}
            </div>
            <form onSubmit={submit} className="p-2.5 border-t-2 border-zinc-100 flex gap-2">
              <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Type a message"
                disabled={noKey}
                className="flex-1 min-w-0 px-3 py-2 rounded-xl border-2 border-zinc-200 text-sm font-semibold outline-none focus:border-[#58CC02]" />
              <button type="submit" disabled={noKey || busy || !input.trim()} title="Send"
                className="duo-btn duo-btn-green !px-3 disabled:opacity-50"><Send className="w-4 h-4" /></button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-between px-4 py-5 min-h-0">
            {langToggle('text-sm px-4 py-1.5')}
            <div className="flex-1 w-full overflow-y-auto text-center space-y-3 min-h-0 mt-3">
              {heard && <p className="text-sm font-bold text-zinc-500">“{heard}”</p>}
              {spoken && <p className="text-base font-bold text-[#3C3C3C]">{spoken}</p>}
              {!heard && !spoken && <p className="text-sm font-bold text-zinc-400 pt-6">{lang === 'hi' ? 'बोलिए — Sanket सुनेगा और जवाब देगा।' : 'Talk to Sanket. It listens, answers out loud, then listens again.'}</p>}
              {error && error !== 'NO_KEY' && <p className="text-xs font-bold text-red-600">{error}</p>}
              {lang === 'hi' && !hasHiVoice && <p className="text-xs font-bold text-amber-700">No Hindi voice on this device, so replies show as text only. Chrome on Android, Windows (Hindi voice pack) or Mac usually has one.</p>}
              {!sr && <p className="text-xs font-bold text-red-600">Voice input needs Chrome or Edge.</p>}
            </div>
            <button type="button" onClick={toggleVoice} disabled={noKey || !sr}
              className={`mt-3 w-24 h-24 rounded-full flex items-center justify-center border-4 transition-all disabled:opacity-40
                ${voiceState === 'idle' ? 'bg-[#58CC02] border-[#46A302] text-white' : voiceState === 'listening' ? 'bg-[#FF4B4B] border-[#EA2B2B] text-white animate-pulse' : 'bg-[#FFC800] border-[#E5B400] text-[#78350F]'}`}>
              {voiceState === 'idle' ? <Mic className="w-9 h-9" /> : voiceState === 'listening' ? <MicOff className="w-9 h-9" /> : <AudioLines className="w-9 h-9" />}
            </button>
            <div className="mt-2 text-xs font-black text-zinc-500">{stateLabel}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomeChatbotPopup;
