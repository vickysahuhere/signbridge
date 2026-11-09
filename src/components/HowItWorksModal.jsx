import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Camera,
  Hand,
  Sparkles,
  Send,
  Users,
  Lightbulb,
  CheckCircle2,
  Lock,
  BookOpen,
  MessageSquare,
  Zap,
  Eye,
  Smile,
  ShieldCheck,
  X
} from 'lucide-react';

export function HowItWorksModal({ isOpen, onClose, onOpenDictionary }) {
  const [activeTab, setActiveTab] = useState('how-it-works'); // 'how-it-works' | 'features' | 'tips' | 'faq'
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPref = localStorage.getItem('sanket_skip_guide_auto') === 'true';
      setDontShowAgain(savedPref);
    }
  }, []);

  const handleClose = () => {
    if (typeof window !== 'undefined') {
      if (dontShowAgain) {
        localStorage.setItem('sanket_skip_guide_auto', 'true');
      } else {
        localStorage.removeItem('sanket_skip_guide_auto');
      }
      localStorage.setItem('sanket_has_seen_guide', 'true');
    }
    onClose();
  };

  const handleToggleDontShow = (e) => {
    const checked = e.target.checked;
    setDontShowAgain(checked);
    if (typeof window !== 'undefined') {
      if (checked) {
        localStorage.setItem('sanket_skip_guide_auto', 'true');
      } else {
        localStorage.removeItem('sanket_skip_guide_auto');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-zinc-950/60 backdrop-blur-sm select-none"
      aria-label="How Sanket Works Guide"
      role="dialog"
    >
      <div className="cartoon-card w-full max-w-3xl max-h-[92vh] flex flex-col shadow-cartoon-lg bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Title Bar */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center shadow-cartoon-sm flex-shrink-0">
              <Sparkles className="w-4 h-4 text-zinc-900 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-sm sm:text-base text-zinc-900">
                Welcome to Sanket (संकेत)
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                Indian Sign Language Real-Time AI Bridge
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center justify-center shadow-cartoon-sm active:translate-x-[1px] active:translate-y-[1px] transition-all"
            title="Close Guide"
            aria-label="Close Guide"
          >
            <X className="w-4 h-4 stroke-[2.5] text-zinc-900" />
          </button>
        </div>

        {/* Tab Header Navigation */}
        <div className="px-4 pt-3 flex gap-2 border-b border-zinc-200 bg-white overflow-x-auto flex-shrink-0">
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'how-it-works'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>1. How It Works</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'features'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Key Features</span>
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tips'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>3. Tips &amp; Accuracy</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 text-xs font-bold rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'faq'
                ? 'bg-[#FAF8F5] border-zinc-900 text-zinc-900 -mb-[1px] z-10'
                : 'bg-white border-transparent text-zinc-500 hover:text-zinc-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. FAQs</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] text-zinc-900 text-xs flex-1 overflow-y-auto min-h-[300px]">
          {/* TAB 1: HOW IT WORKS */}
          {activeTab === 'how-it-works' && (
            <div className="space-y-3.5">
              <div className="cartoon-card p-3.5 bg-white border-2 border-zinc-900">
                <p className="text-xs sm:text-sm leading-relaxed text-zinc-700 font-medium">
                  <strong>Sanket</strong> bridges Indian Sign Language and English directly in your browser. Follow these 4 easy steps to start communicating:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Step 1 */}
                <div className="cartoon-card p-3.5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#FFD15C] text-zinc-900">
                        STEP 1
                      </span>
                      <Camera className="w-4 h-4 text-zinc-900" />
                      <h4 className="font-extrabold text-xs text-zinc-900">Start Your Camera</h4>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Click <strong>Start Camera</strong> and sit comfortably so your upper body and both hands are in view.
                    </p>
                  </div>
                  <div className="mt-2.5 text-[11px] text-[#16A34A] font-bold bg-[#EDFDF2] p-1.5 rounded-lg border border-green-200">
                    ✓ 100% on-device. No video ever uploaded.
                  </div>
                </div>

                {/* Step 2 */}
                <div className="cartoon-card p-3.5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#38BDF8] text-zinc-900">
                        STEP 2
                      </span>
                      <Hand className="w-4 h-4 text-zinc-900" />
                      <h4 className="font-extrabold text-xs text-zinc-900">Sign Words or Letters</h4>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      Perform conversational signs (e.g. <em>Namaste</em>, <em>Help</em>, <em>Water</em>, <em>Thank You</em>) or switch to <strong>A–Z</strong> mode to spell names.
                    </p>
                  </div>
                  <div className="mt-2.5 text-[11px] text-zinc-800 font-bold bg-[#FAF8F5] p-1.5 rounded-lg border border-zinc-200">
                    ✓ Recognized tokens appear instantly in composer!
                  </div>
                </div>

                {/* Step 3 */}
                <div className="cartoon-card p-3.5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#FFD15C] text-zinc-900">
                        STEP 3
                      </span>
                      <Sparkles className="w-4 h-4 text-zinc-900" />
                      <h4 className="font-extrabold text-xs text-zinc-900">Automatic English Grammar</h4>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      ISL has its own natural grammar (SOV). Sanket rearranges your signs into fluent, natural English sentences automatically.
                    </p>
                  </div>
                  <div className="mt-2.5 text-[11px] text-amber-900 font-bold bg-[#FFF9E5] p-1.5 rounded-lg border border-amber-200">
                    ✓ e.g. [I, WATER, WANT] → "I want water."
                  </div>
                </div>

                {/* Step 4 */}
                <div className="cartoon-card p-3.5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#22C55E] text-white">
                        STEP 4
                      </span>
                      <Send className="w-4 h-4 text-zinc-900" />
                      <h4 className="font-extrabold text-xs text-zinc-900">Rest Hands to Send</h4>
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed">
                      When finished signing, lower your hands or pause for 700ms (configurable). The message sends automatically without touching the mouse!
                    </p>
                  </div>
                  <div className="mt-2.5 text-[11px] text-[#16A34A] font-bold bg-[#EDFDF2] p-1.5 rounded-lg border border-green-200">
                    ✓ Hands-free auto-commit motion gating
                  </div>
                </div>
              </div>

              {/* Share link callout */}
              <div className="cartoon-card p-3 bg-[#FFF9E5] border-2 border-zinc-900 flex items-center justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-2.5">
                  <Users className="w-5 h-5 text-zinc-900 flex-shrink-0" />
                  <div>
                    <h5 className="font-extrabold text-xs text-zinc-900">Invite a Hearing Chat Partner</h5>
                    <p className="text-[11px] text-zinc-600">
                      Copy the room link in the top bar to chat with friends, colleagues, or healthcare providers in real time.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEY FEATURES */}
          {activeTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="cartoon-card p-3.5 bg-white space-y-1">
                <div className="flex items-center gap-2 font-extrabold text-xs text-zinc-900">
                  <Hand className="w-4 h-4 text-zinc-900" />
                  <span>22 Core Signs + 26 A–Z Alphabet</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  22 verified 3D geometric signs and full two-handed A–Z fingerspelling, with a 260-word grammar restructuring lexicon.
                </p>
              </div>

              <div className="cartoon-card p-3.5 bg-white space-y-1">
                <div className="flex items-center gap-2 font-extrabold text-xs text-zinc-900">
                  <Zap className="w-4 h-4 text-zinc-900" />
                  <span>Two-Handed A–Z Alphabet</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Authentic Indian fingerspelling support for spelling out names, specific addresses, or custom words.
                </p>
              </div>

              <div className="cartoon-card p-3.5 bg-white space-y-1">
                <div className="flex items-center gap-2 font-extrabold text-xs text-zinc-900">
                  <Eye className="w-4 h-4 text-zinc-900" />
                  <span>Heads-Up Subtitles</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Incoming replies appear directly over your video feed as closed captions so you never lose eye contact.
                </p>
              </div>

              <div className="cartoon-card p-3.5 bg-white space-y-1">
                <div className="flex items-center gap-2 font-extrabold text-xs text-zinc-900">
                  <Lock className="w-4 h-4 text-[#16A34A]" />
                  <span>100% Private On-Device</span>
                </div>
                <p className="text-[11px] text-zinc-600 leading-relaxed">
                  Camera video NEVER leaves your device. Local WebAssembly &amp; WebGL neural networks ensure complete privacy.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: TIPS & ACCURACY */}
          {activeTab === 'tips' && (
            <div className="space-y-2.5">
              {[
                { title: 'Good Front Lighting', desc: 'Face a window or soft lamp. Avoid bright backlights that create dark silhouettes.' },
                { title: 'Keep Hands Centered', desc: 'Position camera at chest height so both hands and shoulders fit comfortably in the frame.' },
                { title: 'Hold Signs for a Split Second', desc: 'Holding handshapes briefly ensures crisp, multi-frame debounce confirmation.' },
                { title: 'Rest Hands to Finish Sentence', desc: 'Rest your hands on your lap or desk when you finish signing to trigger auto-send.' }
              ].map((tip, idx) => (
                <div key={idx} className="cartoon-card p-3 bg-white flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 text-xs font-black text-zinc-900 shadow-cartoon-sm">
                    {idx + 1}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-xs text-zinc-900">{tip.title}</h5>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">{tip.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: FAQs */}
          {activeTab === 'faq' && (
            <div className="space-y-2.5">
              {[
                { q: 'Is my video recorded or sent to a server?', a: 'Never. All AI inference runs locally in your browser using WebAssembly. No frames or images leave your machine.' },
                { q: 'How does a hearing person communicate with me?', a: 'They can type in the Chat panel or use Quick Reply chips. Subtitles pop up right on your camera feed!' },
                { q: 'Does it cost anything or need an account?', a: 'No. Sanket is free, open, and requires zero sign-up or accounts.' },
                { q: 'What if I sign a word by accident?', a: 'Click Undo in the sentence composer to remove the last sign, or click Clear to start over.' }
              ].map((faq, idx) => (
                <div key={idx} className="cartoon-card p-3 bg-white space-y-1">
                  <div className="font-extrabold text-xs text-zinc-900">Q: {faq.q}</div>
                  <div className="text-[11px] text-zinc-600 leading-relaxed font-medium">A: {faq.a}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#FAF8F5] border-t-2 border-zinc-900 flex flex-wrap items-center justify-between gap-2.5 flex-shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-zinc-600">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleToggleDontShow}
              className="w-4 h-4 accent-zinc-900 rounded"
            />
            <span>Don't show this automatically on launch</span>
          </label>

          <div className="flex items-center gap-2">
            {onOpenDictionary && (
              <button
                onClick={() => {
                  handleClose();
                  onOpenDictionary();
                }}
                className="cartoon-btn bg-white hover:bg-zinc-50 text-xs font-bold"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Open Dictionary</span>
              </button>
            )}

            <button
              onClick={handleClose}
              className="cartoon-btn cartoon-btn-primary text-xs font-extrabold !px-4"
            >
              Got It, Let's Sign!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksModal;