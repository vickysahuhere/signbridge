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
  X,
  ArrowRight,
  Video,
  Sliders,
  Keyboard,
  Compass,
  Check,
  RotateCcw,
  Play,
  Layers,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { SignSvgIllustration } from './SignSvgIllustrations.jsx';

export function HowItWorksModal({
  isOpen,
  onClose,
  onOpenDictionary,
  onNavigateToMode,
  onSelectForPractice
}) {
  const [activeTab, setActiveTab] = useState('quickstart'); // 'quickstart' | 'modes' | 'ai-engine' | 'gestures' | 'camera' | 'faq'
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [simulatedGlosses, setSimulatedGlosses] = useState(['I_ME', 'WATER', 'WANT']);

  // Pre-configured interactive grammar examples
  const GRAMMAR_EXAMPLES = [
    {
      label: 'Desire / Request',
      tokens: ['I_ME', 'WATER', 'WANT'],
      english: 'I want water.',
      rule: 'SOV (Subject-Object-Verb) reordered into English SVO with natural copula/pronouns.'
    },
    {
      label: 'WH-Question',
      tokens: ['YOU', 'NAME', 'WHAT'],
      english: 'What is your name?',
      rule: 'Trailing WH-question signs (WHAT, WHERE, WHO) repositioned to front with question mark.'
    },
    {
      label: 'Location Query',
      tokens: ['HOSPITAL', 'WHERE'],
      english: 'Where is the hospital?',
      rule: 'Directional inquiries automatically prepend "Where is" and form clean English questions.'
    },
    {
      label: 'Negation',
      tokens: ['I_ME', 'FOOD', 'EAT', 'NO'],
      english: 'I do not eat food.',
      rule: 'Trailing NO / NOT negation is integrated into the verb auxiliary ("do not eat").'
    },
    {
      label: 'Fingerspelling Introduction',
      tokens: ['I_ME', 'NAME', 'S', 'A', 'N', 'K', 'E', 'T'],
      english: 'My name is Sanket.',
      rule: 'Contiguous A–Z letters are automatically merged into a single word token.'
    }
  ];

  const FEATURED_PRACTICE_SIGNS = [
    { id: 'namaste', label: 'NAMASTE', name: 'Namaste', category: 'Greetings', desc: 'Palms pressed together at chest level in front of sternum.' },
    { id: 'hello', label: 'HELLO', name: 'Hello', category: 'Greetings', desc: 'Open palm raised near temple, waving gently outward.' },
    { id: 'good', label: 'GOOD', name: 'Good', category: 'Descriptors', desc: 'Closed fist with thumb extended straight upward.' },
    { id: 'thank_you', label: 'THANK_YOU', name: 'Thank You', category: 'Courtesies', desc: 'Fingertips touch the chin, then extend gracefully forward.' },
    { id: 'water', label: 'WATER', name: 'Water', category: 'Needs', desc: 'Cupped hand tilted toward mouth simulating drinking water.' },
    { id: 'help', label: 'HELP', name: 'Help', category: 'Urgent', desc: 'Closed fist resting on a flat upward-facing palm, lifted upward.' },
    { id: 'doctor', label: 'DOCTOR', name: 'Doctor', category: 'Healthcare', desc: 'Index and middle fingers tap the inside wrist pulse.' },
    { id: 'letter_a', label: 'A', name: 'Letter A', category: 'Fingerspelling', desc: 'Left index fingertip placed at the tip of the right thumb.' },
    { id: 'letter_c', label: 'C', name: 'Letter C', category: 'Fingerspelling', desc: 'Dominant hand curved in a half-moon "C" profile.' }
  ];

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

  const handlePracticeSign = (signLabel) => {
    handleClose();
    if (onSelectForPractice) {
      onSelectForPractice(signLabel);
    } else if (onNavigateToMode) {
      onNavigateToMode('learn');
    }
  };

  const handleGoToMode = (mode) => {
    handleClose();
    if (onNavigateToMode) {
      onNavigateToMode(mode);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 md:p-6 bg-zinc-950/70 backdrop-blur-sm select-none"
      aria-label="Sanket Application Guide"
      role="dialog"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          handleClose();
        }
      }}
    >
      <div className="cartoon-card w-full max-w-4xl max-h-[94vh] flex flex-col shadow-cartoon-lg bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Title Bar */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-b-2 border-zinc-900 flex items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center shadow-cartoon-sm flex-shrink-0">
              <Sparkles className="w-4 h-4 text-zinc-900 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-sm sm:text-base text-zinc-900 leading-tight">
                  Sanket App Guide &amp; Master Manual
                </h2>
                <span className="cartoon-badge !py-0 !px-1.5 text-[9px] bg-[#22C55E] text-white hidden sm:inline-block">
                  संकेत 100% In-Browser
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">
                Indian Sign Language Real-Time Recognition, Practice Studio &amp; Video Messenger
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-xl border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center justify-center shadow-cartoon-sm active:translate-x-[1px] active:translate-y-[1px] transition-all flex-shrink-0"
            title="Close Guide"
            aria-label="Close Guide"
          >
            <X className="w-4 h-4 stroke-[2.5] text-zinc-900" />
          </button>
        </div>

        {/* Tab Header Navigation */}
        <div className="px-3 sm:px-4 pt-2.5 flex gap-1 sm:gap-2 border-b-2 border-zinc-900 bg-[#F4EFEA] overflow-x-auto flex-shrink-0 scrollbar-none">
          {[
            { id: 'quickstart', label: '1. Quick Start', icon: Zap },
            { id: 'modes', label: '2. App Modes', icon: Layers },
            { id: 'ai-engine', label: '3. AI & Grammar', icon: Sparkles },
            { id: 'gestures', label: '4. Practice Signs', icon: Hand },
            { id: 'camera', label: '5. Camera & Posture', icon: Camera },
            { id: 'faq', label: '6. FAQs & Privacy', icon: HelpCircle }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-black rounded-t-xl border-2 border-b-0 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                  isActive
                    ? 'bg-white border-zinc-900 text-zinc-900 -mb-[2px] z-10 shadow-[0_-2px_0_#18181B]'
                    : 'bg-[#F4EFEA] border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-[#EAE4DC]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 stroke-[2.5] ${isActive ? 'text-zinc-900' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] text-zinc-900 text-xs flex-1 overflow-y-auto min-h-[340px]">
          {/* TAB 1: QUICK START */}
          {activeTab === 'quickstart' && (
            <div className="space-y-4">
              <div className="cartoon-card p-3.5 bg-white border-2 border-zinc-900 flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <h3 className="font-black text-sm text-zinc-900">How Sanket Works in 4 Steps</h3>
                  <p className="text-xs text-zinc-600 font-medium mt-0.5">
                    Communicate naturally without keyboards or specialized gloves — powered entirely on-device by MediaPipe and ONNX.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGoToMode('learn')}
                    className="cartoon-btn cartoon-btn-primary !py-1 !px-2.5 text-xs font-black"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Try Learn Mode</span>
                  </button>
                  <button
                    onClick={() => handleGoToMode('chat')}
                    className="cartoon-btn !py-1 !px-2.5 text-xs font-black bg-[#38BDF8] hover:bg-[#0284C7] hover:text-white"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Try Video Call</span>
                  </button>
                </div>
              </div>

              {/* 4 Interactive Process Steps */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Step 1 */}
                <div className="cartoon-card p-3.5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="cartoon-badge !py-0.5 !px-2 text-[10px] bg-[#FFD15C] text-zinc-900 font-black">
                          STEP 1
                        </span>
                        <h4 className="font-black text-xs text-zinc-900">Position &amp; Start Camera</h4>
                      </div>
                      <Camera className="w-4 h-4 text-zinc-700 stroke-[2.2]" />
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                      Sit 1.5 to 2 feet in front of your webcam. Ensure good front lighting and that your upper torso, shoulders, and both hands are comfortably in view.
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] text-[#16A34A] font-bold bg-[#EDFDF2] p-2 rounded-xl border border-green-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>100% on-device AI. No camera video is ever uploaded or recorded.</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="cartoon-card p-3.5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="cartoon-badge !py-0.5 !px-2 text-[10px] bg-[#38BDF8] text-zinc-900 font-black">
                          STEP 2
                        </span>
                        <h4 className="font-black text-xs text-zinc-900">Sign Words or Spell Letters</h4>
                      </div>
                      <Hand className="w-4 h-4 text-zinc-700 stroke-[2.2]" />
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                      Perform conversational ISL signs (e.g. <em>Namaste</em>, <em>Help</em>, <em>Water</em>, <em>Good</em>). Switch to <strong>A–Z</strong> mode to spell names or specific terms using authentic Indian two-handed fingerspelling.
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] text-zinc-800 font-bold bg-[#F4EFEA] p-2 rounded-xl border border-zinc-200 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#22C55E] flex-shrink-0" />
                    <span>Recognized tokens appear in the Live Composer automatically.</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="cartoon-card p-3.5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="cartoon-badge !py-0.5 !px-2 text-[10px] bg-[#FFD15C] text-zinc-900 font-black">
                          STEP 3
                        </span>
                        <h4 className="font-black text-xs text-zinc-900">Deterministic English Grammar</h4>
                      </div>
                      <Sparkles className="w-4 h-4 text-zinc-700 stroke-[2.2]" />
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                      ISL uses natural Subject-Object-Verb (SOV) order. Sanket automatically restructures sign tokens into fluent, natural English Subject-Verb-Object (SVO) sentences with questions and copulas.
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] text-amber-900 font-bold bg-[#FFF9E5] p-2 rounded-xl border border-amber-200 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>e.g. [I, WATER, WANT] → "I want water."</span>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="cartoon-card p-3.5 bg-white flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="cartoon-badge !py-0.5 !px-2 text-[10px] bg-[#22C55E] text-white font-black">
                          STEP 4
                        </span>
                        <h4 className="font-black text-xs text-zinc-900">Rest Hands to Auto-Send</h4>
                      </div>
                      <Send className="w-4 h-4 text-zinc-700 stroke-[2.2]" />
                    </div>
                    <p className="text-xs text-zinc-600 leading-relaxed font-medium">
                      When finished signing a phrase, lower your hands to your lap or rest stationary for 700ms–1.2s. The motion sensor detects the pause and automatically commits the sentence hands-free!
                    </p>
                  </div>
                  <div className="mt-3 text-[11px] text-[#16A34A] font-bold bg-[#EDFDF2] p-2 rounded-xl border border-green-200 flex items-center gap-1.5">
                    <Sliders className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>Pause duration is adjustable via the slider on the webcam HUD.</span>
                  </div>
                </div>
              </div>

              {/* Interactive Grammar Preview Simulator */}
              <div className="cartoon-card p-3.5 bg-white border-2 border-zinc-900">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#22C55E]" />
                    <h4 className="font-black text-xs text-zinc-900">Interactive Grammar Simulator</h4>
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 font-mono">ISL SOV → English SVO</span>
                </div>
                <p className="text-xs text-zinc-600 font-medium mb-3">
                  Click any example below to see how Sanket transforms signed raw gloss tokens into natural English:
                </p>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {GRAMMAR_EXAMPLES.map((eg, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSimulatedGlosses(eg.tokens)}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg border-2 transition-all ${
                        JSON.stringify(simulatedGlosses) === JSON.stringify(eg.tokens)
                          ? 'bg-[#FFD15C] border-zinc-900 text-zinc-900 shadow-cartoon-sm'
                          : 'bg-[#FAF8F5] border-zinc-200 text-zinc-600 hover:border-zinc-900 hover:text-zinc-900'
                      }`}
                    >
                      {eg.label}
                    </button>
                  ))}
                </div>

                {(() => {
                  const match = GRAMMAR_EXAMPLES.find(eg => JSON.stringify(eg.tokens) === JSON.stringify(simulatedGlosses)) || GRAMMAR_EXAMPLES[0];
                  return (
                    <div className="bg-[#FAF8F5] p-3 rounded-xl border-2 border-zinc-900 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-black uppercase text-zinc-500">Raw ISL Glosses:</span>
                        <div className="flex items-center gap-1 flex-wrap">
                          {match.tokens.map((token, i) => (
                            <span key={i} className="cartoon-badge !py-0.5 !px-2 bg-white text-zinc-900 border border-zinc-900 font-mono font-bold text-[11px]">
                              {token}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap pt-1 border-t border-zinc-200">
                        <span className="text-[10px] font-black uppercase text-[#22C55E]">English Output:</span>
                        <span className="text-sm font-black text-zinc-900 bg-white px-2.5 py-1 rounded-lg border border-zinc-900 shadow-cartoon-sm">
                          "{match.english}"
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 font-medium italic pt-0.5">
                        💡 {match.rule}
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* TAB 2: APP MODES */}
          {activeTab === 'modes' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {/* Mode 1: Home Arena */}
                <div className="cartoon-card p-4 bg-white flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-[#F4EFEA] border-2 border-zinc-900 flex items-center justify-center mb-2.5 shadow-cartoon-sm">
                      <Zap className="w-4 h-4 text-zinc-900 stroke-[2.5]" />
                    </div>
                    <h4 className="font-black text-sm text-zinc-900">Home Arena</h4>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed mt-1">
                      The starting lobby. Switch directly between <strong>Learn ISL Studio</strong> or <strong>Video Call &amp; Chat</strong>, enter custom room codes to join friends, or access the dictionary.
                    </p>
                    <ul className="mt-3 space-y-1 text-[11px] font-medium text-zinc-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[2.5]" />
                        <span>Instant choice interface</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[2.5]" />
                        <span>Join custom room codes</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[2.5]" />
                        <span>AI status &amp; telemetry monitor</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleGoToMode('home')}
                    className="mt-4 cartoon-btn bg-white hover:bg-zinc-50 w-full text-xs font-black"
                  >
                    Go to Home Page
                  </button>
                </div>

                {/* Mode 2: Learn ISL Studio */}
                <div className="cartoon-card p-4 bg-white flex flex-col justify-between border-2 border-zinc-900 shadow-cartoon-md">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center mb-2.5 shadow-cartoon-sm">
                      <BookOpen className="w-4 h-4 text-zinc-900 stroke-[2.5]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-zinc-900">Learn ISL Studio</h4>
                      <span className="cartoon-badge !py-0 !px-1.5 text-[8px] bg-[#FFD15C] text-zinc-900 font-black">7 Levels</span>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed mt-1">
                      Guided practice studio. Align your hands with the 3D target skeleton ghosts. Hold valid posture to increment your <strong>3-Repetition Streak</strong> and unlock sequential signs!
                    </p>
                    <ul className="mt-3 space-y-1 text-[11px] font-medium text-zinc-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[2.5]" />
                        <span>Teal target ghost skeleton guide</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[2.5]" />
                        <span>3-Repetition mastery verification</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[2.5]" />
                        <span>Compound sign multi-step sequences</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleGoToMode('learn')}
                    className="mt-4 cartoon-btn cartoon-btn-primary w-full text-xs font-black"
                  >
                    Enter Learn Studio
                  </button>
                </div>

                {/* Mode 3: Video Call & Chat */}
                <div className="cartoon-card p-4 bg-white flex flex-col justify-between">
                  <div>
                    <div className="w-8 h-8 rounded-xl bg-[#38BDF8] border-2 border-zinc-900 flex items-center justify-center mb-2.5 shadow-cartoon-sm">
                      <Video className="w-4 h-4 text-zinc-900 stroke-[2.5]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-black text-sm text-zinc-900">Video Call &amp; Chat</h4>
                      <span className="cartoon-badge !py-0 !px-1.5 text-[8px] bg-amber-300 text-amber-950 font-black">BETA</span>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed mt-1">
                      Real-time peer-to-peer communication. Deaf signers sign in front of camera while hearing partners can type or tap quick-reply chips. Subtitles appear right on the webcam!
                    </p>
                    <ul className="mt-3 space-y-1 text-[11px] font-medium text-zinc-600">
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[2.5]" />
                        <span>Sub-20ms direct WebRTC P2P</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[2.5]" />
                        <span>Heads-up subtitle overlay on camera</span>
                      </li>
                      <li className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-[#22C55E] stroke-[2.5]" />
                        <span>Hands-free auto-commit motion gating</span>
                      </li>
                    </ul>
                  </div>
                  <button
                    onClick={() => handleGoToMode('chat')}
                    className="mt-4 cartoon-btn bg-[#38BDF8] hover:bg-[#0284C7] hover:text-white w-full text-xs font-black"
                  >
                    Launch Video Call
                  </button>
                </div>
              </div>

              {/* Mode Comparison Table */}
              <div className="cartoon-card p-3.5 bg-white border-2 border-zinc-900 overflow-x-auto">
                <h4 className="font-black text-xs text-zinc-900 mb-2">Feature Breakdown by Mode</h4>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b-2 border-zinc-900 bg-[#FAF8F5] text-zinc-700">
                      <th className="py-1.5 px-2 font-black">Capability</th>
                      <th className="py-1.5 px-2 font-black">Learn Studio</th>
                      <th className="py-1.5 px-2 font-black">Call &amp; Chat</th>
                      <th className="py-1.5 px-2 font-black">Home Lobby</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200 font-medium">
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-zinc-900">Biometric Skeleton Tracking</td>
                      <td className="py-1.5 px-2 text-[#22C55E] font-bold">✓ 3D Ghost Guide</td>
                      <td className="py-1.5 px-2 text-[#22C55E] font-bold">✓ Live Skeleton HUD</td>
                      <td className="py-1.5 px-2 text-zinc-400">—</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-zinc-900">Recognition Modes</td>
                      <td className="py-1.5 px-2">Words &amp; A-Z Letters</td>
                      <td className="py-1.5 px-2">Words &amp; A-Z Letters</td>
                      <td className="py-1.5 px-2 text-zinc-400">—</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-zinc-900">English Sentence Composer</td>
                      <td className="py-1.5 px-2 text-zinc-500">Live AI Guessing Hub</td>
                      <td className="py-1.5 px-2 text-[#22C55E] font-bold">✓ Full Live Gloss Bar</td>
                      <td className="py-1.5 px-2 text-zinc-400">—</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-zinc-900">P2P Video Connection</td>
                      <td className="py-1.5 px-2 text-zinc-400">—</td>
                      <td className="py-1.5 px-2 text-[#22C55E] font-bold">✓ WebRTC + Room Code</td>
                      <td className="py-1.5 px-2 text-zinc-500">Join room input</td>
                    </tr>
                    <tr>
                      <td className="py-1.5 px-2 font-bold text-zinc-900">Sign Practice Mastery</td>
                      <td className="py-1.5 px-2 text-[#22C55E] font-bold">✓ 3 Repetitions Loop</td>
                      <td className="py-1.5 px-2 text-zinc-400">—</td>
                      <td className="py-1.5 px-2 text-zinc-400">—</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: AI & GRAMMAR */}
          {activeTab === 'ai-engine' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* 1. Words vs A-Z Mode */}
                <div className="cartoon-card p-3.5 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center font-black text-xs">
                      1
                    </span>
                    <h4 className="font-black text-xs text-zinc-900">Words Mode vs. A–Z Fingerspelling</h4>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                    Toggle between modes via the top navigation bar or the switcher buttons on the video controls:
                  </p>
                  <div className="space-y-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-[#FFF9E5] border border-amber-300">
                      <div className="font-extrabold text-xs text-zinc-900 flex items-center justify-between">
                        <span>Word Mode (Whole Signs)</span>
                        <span className="cartoon-badge !py-0 !px-1.5 text-[8px] bg-[#FFD15C] text-zinc-900">Daily Signs</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 font-medium mt-1 leading-normal">
                        Recognizes 22 core conversational gestures (Namaste, Hello, Good, Water, Help, Doctor, Time, Hospital, Thank You, etc.) using 3D joint distances and velocity vectors.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-[#E0F2FE] border border-sky-300">
                      <div className="font-extrabold text-xs text-zinc-900 flex items-center justify-between">
                        <span>A–Z Alphabet Mode</span>
                        <span className="cartoon-badge !py-0 !px-1.5 text-[8px] bg-[#38BDF8] text-zinc-900">Fingerspelling</span>
                      </div>
                      <p className="text-[11px] text-zinc-600 font-medium mt-1 leading-normal">
                        Authentic Indian two-handed fingerspelling (plus single-handed C). Useful for spelling out personal names, specific medication brands, or unmapped words.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 2. Motion Gating & Auto-Commit */}
                <div className="cartoon-card p-3.5 bg-white space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-[#22C55E] border-2 border-zinc-900 flex items-center justify-center font-black text-xs text-white">
                      2
                    </span>
                    <h4 className="font-black text-xs text-zinc-900">Hands-Free Motion Gating</h4>
                  </div>
                  <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                    Sanket tracks your wrist kinematics across a 5-frame velocity window to prevent false predictions when hands are resting:
                  </p>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-zinc-200 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-700">
                      <span>Signing Active</span>
                      <ArrowRight className="w-3 h-3" />
                      <span>Pause Countdown</span>
                      <ArrowRight className="w-3 h-3" />
                      <span className="text-[#22C55E]">Auto Commit</span>
                    </div>
                    <div className="w-full bg-zinc-200 h-2 rounded-full overflow-hidden border border-zinc-900">
                      <div className="bg-[#22C55E] h-full w-3/4 rounded-full" />
                    </div>
                    <p className="text-[11px] text-zinc-600 font-medium leading-normal">
                      When your hands drop or stay still for your configured pause interval (default: <strong>700ms</strong>, adjustable up to 1200ms), Sanket marks the phrase complete and broadcasts it.
                    </p>
                  </div>
                  <div className="text-[11px] font-bold text-zinc-700 bg-white p-2 rounded-lg border border-zinc-200">
                    💡 <em>Tip: You can also tap the "Send" button or press Enter anytime for manual dispatch!</em>
                  </div>
                </div>
              </div>

              {/* 3. Deterministic Linguistic Engine Contracts */}
              <div className="cartoon-card p-3.5 bg-white space-y-2 border-2 border-zinc-900">
                <h4 className="font-black text-xs text-zinc-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>The 4 Deterministic Linguistic Contracts (Zero Hallucination)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-zinc-200">
                    <span className="cartoon-badge !py-0 !px-1 text-[9px] bg-zinc-900 text-white font-mono">LING-01</span>
                    <h5 className="font-bold text-xs text-zinc-900 mt-1">Deduplication &amp; Spelling Concatenation</h5>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Consecutive duplicate signs are suppressed automatically. Contiguous single letters automatically fuse into capitalized word tokens (e.g. ['H', 'E', 'L', 'P'] → "HELP").
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-zinc-200">
                    <span className="cartoon-badge !py-0 !px-1 text-[9px] bg-zinc-900 text-white font-mono">LING-02</span>
                    <h5 className="font-bold text-xs text-zinc-900 mt-1">Single-Click Undo &amp; Token Removal</h5>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Accidentally signed a word? Click the "×" on any token badge in the composer to delete it, or hit Undo to remove the latest sign.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-zinc-200">
                    <span className="cartoon-badge !py-0 !px-1 text-[9px] bg-zinc-900 text-white font-mono">LING-03</span>
                    <h5 className="font-bold text-xs text-zinc-900 mt-1">SOV to SVO Syntactic Reordering</h5>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      ISL places the verb at the end of the clause. The engine identifies Subject, Object, and Verb markers and rearranges them into natural English sentence structure.
                    </p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#FAF8F5] border border-zinc-200">
                    <span className="cartoon-badge !py-0 !px-1 text-[9px] bg-zinc-900 text-white font-mono">LING-04</span>
                    <h5 className="font-bold text-xs text-zinc-900 mt-1">Trailing WH-Question Transformation</h5>
                    <p className="text-[11px] text-zinc-600 mt-0.5">
                      Signs like WHAT, WHERE, WHO, WHY, WHEN, HOW placed at the end of an ISL sentence are hoisted to the front with appropriate English interrogative copulas.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: PRACTICE SIGNS CHEATSHEET & PLAYGROUND */}
          {activeTab === 'gestures' && (
            <div className="space-y-3.5">
              <div className="cartoon-card p-3.5 bg-white flex items-center justify-between gap-3 flex-wrap border-2 border-zinc-900">
                <div>
                  <h4 className="font-black text-xs text-zinc-900">Interactive Sign Cheatsheet &amp; Practice Launcher</h4>
                  <p className="text-xs text-zinc-600 font-medium mt-0.5">
                    Click <strong>"Practice in Learn Studio"</strong> on any sign below to instantly load it into the 3D ghost skeleton coach:
                  </p>
                </div>
                {onOpenDictionary && (
                  <button
                    onClick={() => {
                      handleClose();
                      onOpenDictionary();
                    }}
                    className="cartoon-btn bg-white hover:bg-zinc-50 text-xs font-black"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open 1,000+ Dictionary</span>
                  </button>
                )}
              </div>

              {/* Grid of Featured Signs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {FEATURED_PRACTICE_SIGNS.map((sign) => (
                  <div
                    key={sign.id}
                    className="cartoon-card p-3 bg-white flex flex-col justify-between hover:border-zinc-900 hover:shadow-cartoon transition-all"
                  >
                    <div>
                      {/* Sign Illustration Preview */}
                      <div className="w-full h-32 bg-[#FAF8F5] rounded-xl border-2 border-zinc-900 p-2 mb-2 flex items-center justify-center overflow-hidden">
                        <SignSvgIllustration signId={sign.id} className="w-full h-full max-h-28 object-contain" />
                      </div>

                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-sm text-zinc-900">{sign.name}</span>
                        <span className="cartoon-badge !py-0 !px-1.5 text-[8px] bg-[#F4EFEA] text-zinc-700 font-bold">
                          {sign.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
                        {sign.desc}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePracticeSign(sign.label)}
                      className="mt-3 cartoon-btn cartoon-btn-primary !py-1 text-xs font-black w-full flex items-center justify-center gap-1"
                    >
                      <Play className="w-3 h-3 fill-zinc-900" />
                      <span>Practice in Learn Studio</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: CAMERA & POSTURE */}
          {activeTab === 'camera' && (
            <div className="space-y-4">
              <div className="cartoon-card p-4 bg-white border-2 border-zinc-900">
                <h4 className="font-black text-sm text-zinc-900 mb-2">Ideal Camera Framing &amp; Biometric Lighting</h4>
                <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                  MediaPipe Holistic tracks 240 biometric coordinate points across both hands, shoulders, chest, and face simultaneously. Follow these 4 framing tips for 99%+ recognition accuracy:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  {/* Tip 1 */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-zinc-900">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center font-black text-xs text-zinc-900">
                        1
                      </div>
                      <h5 className="font-black text-xs text-zinc-900">Upper Torso &amp; Shoulder Distance</h5>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                      Sit approximately <strong>1.5 to 2.5 feet</strong> from the camera. Both shoulders and hands must be comfortably visible within the frame. Coordinates are normalized relative to shoulder width.
                    </p>
                  </div>

                  {/* Tip 2 */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-zinc-900">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#38BDF8] border-2 border-zinc-900 flex items-center justify-center font-black text-xs text-zinc-900">
                        2
                      </div>
                      <h5 className="font-black text-xs text-zinc-900">Front Lighting (Avoid Backlights)</h5>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                      Face a window or soft room light. Avoid sitting directly with a bright sunny window behind your back, as dark silhouettes make hand joint segmentation difficult.
                    </p>
                  </div>

                  {/* Tip 3 */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-zinc-900">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#22C55E] border-2 border-zinc-900 flex items-center justify-center font-black text-xs text-white">
                        3
                      </div>
                      <h5 className="font-black text-xs text-zinc-900">Brief 300ms Pose Hold</h5>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                      To prevent random motion blur or accidental hand sweeps from triggering tokens, hold the final sign posture for a split second (6-8 frames). The green confirmation radar will lock in the sign!
                    </p>
                  </div>

                  {/* Tip 4 */}
                  <div className="p-3 rounded-xl bg-[#FAF8F5] border-2 border-zinc-900">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-6 h-6 rounded-lg bg-[#FF6B6B] border-2 border-zinc-900 flex items-center justify-center font-black text-xs text-white">
                        4
                      </div>
                      <h5 className="font-black text-xs text-zinc-900">Neutral Rest on Desk or Lap</h5>
                    </div>
                    <p className="text-xs text-zinc-600 font-medium leading-relaxed">
                      Between sentences or while thinking, relax hands down to your lap or desk (lower 15% of frame). Sanket's lap gate automatically ignores resting hands to prevent phantom signs.
                    </p>
                  </div>
                </div>
              </div>

              {/* Keyboard Shortcuts Helper */}
              <div className="cartoon-card p-3.5 bg-white border-2 border-zinc-900">
                <div className="flex items-center gap-2 mb-2">
                  <Keyboard className="w-4 h-4 text-zinc-800 stroke-[2.2]" />
                  <h4 className="font-black text-xs text-zinc-900">Keyboard &amp; Quick Controls</h4>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-[#FAF8F5] rounded-lg border border-zinc-200">
                    <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-zinc-400 text-[10px]">Enter</span>
                    <span className="block text-zinc-600 text-[11px] font-medium mt-1">Manual Send Sentence</span>
                  </div>
                  <div className="p-2 bg-[#FAF8F5] rounded-lg border border-zinc-200">
                    <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-zinc-400 text-[10px]">Space / Rest</span>
                    <span className="block text-zinc-600 text-[11px] font-medium mt-1">Auto-Commit Pause</span>
                  </div>
                  <div className="p-2 bg-[#FAF8F5] rounded-lg border border-zinc-200">
                    <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-zinc-400 text-[10px]">1-Click ×</span>
                    <span className="block text-zinc-600 text-[11px] font-medium mt-1">Remove Token Chip</span>
                  </div>
                  <div className="p-2 bg-[#FAF8F5] rounded-lg border border-zinc-200">
                    <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-zinc-400 text-[10px]">Quick Chips</span>
                    <span className="block text-zinc-600 text-[11px] font-medium mt-1">Hearing 1-tap replies</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: FAQS & PRIVACY */}
          {activeTab === 'faq' && (
            <div className="space-y-3">
              {[
                {
                  q: 'Is my video camera feed recorded or sent to any cloud server?',
                  a: 'Never. Sanket runs 100% locally in your browser using Google MediaPipe WASM and ONNX Runtime Web via SIMD and WebGL. No video frames, coordinates, or images ever leave your device. You can verify this in your browser DevTools Network tab — zero image data is sent.'
                },
                {
                  q: 'How does a hearing person communicate back with me during a call?',
                  a: 'Hearing callers can type replies directly in the Chat panel or click the 1-tap Quick Reply chips (e.g. "Yes", "Understood", "Need more info"). Their text replies pop up as closed captions right on top of your webcam feed so you never have to break eye contact!'
                },
                {
                  q: 'How do I invite a friend to my call session?',
                  a: 'In Video Call & Chat mode, look at the top bar. You will see "Room #XXXXX" with a "Share" button. Click "Share" to copy your instant room link. Anyone who opens that link joins your encrypted peer-to-peer room directly.'
                },
                {
                  q: 'What should I do if the AI predicts an incorrect sign?',
                  a: 'You can tap the "Undo" button in the Live Gloss Bar or click the "×" on the token badge to remove it. You can also pick from the alternative candidate cards displayed above the composer if another sign had close probability.'
                },
                {
                  q: 'Why does my camera show low FPS (under 15 FPS)?',
                  a: 'Make sure hardware acceleration is enabled in your browser settings (Chrome / Edge Settings > System > Use graphics acceleration when available). Also close heavy background applications or extra webcam apps.'
                },
                {
                  q: 'Does Sanket cost money or require creating an account?',
                  a: 'No. Sanket is free, open source, and requires zero user sign-ups, credit cards, or accounts.'
                }
              ].map((faq, idx) => (
                <div key={idx} className="cartoon-card p-3.5 bg-white space-y-1 border-2 border-zinc-900">
                  <div className="font-black text-xs text-zinc-900 flex items-start gap-1.5">
                    <span className="text-[#38BDF8] font-bold">Q:</span>
                    <span>{faq.q}</span>
                  </div>
                  <div className="text-xs text-zinc-600 leading-relaxed font-medium pl-4">
                    {faq.a}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Controls */}
        <div className="p-3.5 bg-[#FAF8F5] border-t-2 border-zinc-900 flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-zinc-700">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleToggleDontShow}
              className="w-4 h-4 accent-zinc-900 rounded cursor-pointer"
            />
            <span>Don't show this guide automatically on startup</span>
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
                <span>Dictionary</span>
              </button>
            )}

            <button
              onClick={handleClose}
              className="cartoon-btn cartoon-btn-primary text-xs font-black !px-4"
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
