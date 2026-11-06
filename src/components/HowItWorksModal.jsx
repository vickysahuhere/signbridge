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
  Printer,
  X
} from 'lucide-react';

/**
 * HowItWorksModal
 * 
 * Non-technical, user-friendly guide explaining:
 * 1. How Sanket works (step-by-step visual workflow)
 * 2. Key features (50 signs, A-Z fingerspelling, auto-grammar, live subtitles, privacy)
 * 3. Tips for the best sign recognition accuracy
 * 4. Common FAQs for everyday signers and hearing chat partners
 * 
 * Styled in authentic Windows 95 / Retro '98 aesthetic with 0px border radius and 3D bevels.
 */
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
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#000000]/60 select-none font-sans"
      aria-label="How SignBridge ISL Works and Features Guide"
      role="dialog"
    >
      <div className="retro-window w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl border-2 border-[#000000] bg-[#C0C0C0]">
        {/* Title Bar */}
        <div className="retro-window-titlebar flex items-center justify-between px-2 py-1">
          <div className="flex items-center gap-1.5">
            <HelpCircle className="w-3.5 h-3.5 stroke-[2px] text-[#FFFF00]" />
            <span className="font-bold text-xs sm:text-sm text-[#FFFFFF]">
              SignBridge ISL (संकेत) — Welcome Guide &amp; Features
            </span>
          </div>
          <button
            onClick={handleClose}
            className="retro-window-btn"
            title="Close Guide"
            aria-label="Close Guide"
          >
            ×
          </button>
        </div>

        {/* Sub-header Banner */}
        <div className="bg-[#FFFFCC] border-b border-[#808080] p-2.5 flex items-center gap-2.5">
          <div className="w-9 h-9 bg-[#000080] text-[#FFFFFF] flex items-center justify-center flex-shrink-0 border border-[#000040]">
            <Sparkles className="w-5 h-5 text-[#FFFF00]" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-[#000080] uppercase tracking-wide">
              Connecting Deaf Signers &amp; Hearing Friends in Real Time
            </h2>
            <p className="text-[11px] text-[#333333]">
              No software to install, 100% private in your browser, and completely free forever.
            </p>
          </div>
        </div>

        {/* Tab Header Navigation */}
        <div className="px-3 pt-2.5 flex gap-1 border-b border-[#808080] bg-[#C0C0C0] overflow-x-auto">
          <button
            onClick={() => setActiveTab('how-it-works')}
            className={`px-3 py-1.5 text-xs font-bold border-t-2 border-l-2 border-r-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'how-it-works'
                ? 'bg-[#C0C0C0] border-[#FFFFFF] border-r-[#808080] border-b-0 -mb-[1px] z-10 text-[#000080]'
                : 'bg-[#B0B0B0] border-[#808080] text-[#404040] hover:bg-[#B8B8B8]'
            }`}
          >
            <Hand className="w-3.5 h-3.5" />
            <span>1. How It Works</span>
          </button>
          <button
            onClick={() => setActiveTab('features')}
            className={`px-3 py-1.5 text-xs font-bold border-t-2 border-l-2 border-r-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'features'
                ? 'bg-[#C0C0C0] border-[#FFFFFF] border-r-[#808080] border-b-0 -mb-[1px] z-10 text-[#000080]'
                : 'bg-[#B0B0B0] border-[#808080] text-[#404040] hover:bg-[#B8B8B8]'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>2. Key Features</span>
          </button>
          <button
            onClick={() => setActiveTab('tips')}
            className={`px-3 py-1.5 text-xs font-bold border-t-2 border-l-2 border-r-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'tips'
                ? 'bg-[#C0C0C0] border-[#FFFFFF] border-r-[#808080] border-b-0 -mb-[1px] z-10 text-[#000080]'
                : 'bg-[#B0B0B0] border-[#808080] text-[#404040] hover:bg-[#B8B8B8]'
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>3. Tips &amp; Accuracy</span>
          </button>
          <button
            onClick={() => setActiveTab('faq')}
            className={`px-3 py-1.5 text-xs font-bold border-t-2 border-l-2 border-r-2 flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'faq'
                ? 'bg-[#C0C0C0] border-[#FFFFFF] border-r-[#808080] border-b-0 -mb-[1px] z-10 text-[#000080]'
                : 'bg-[#B0B0B0] border-[#808080] text-[#404040] hover:bg-[#B8B8B8]'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>4. FAQs</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-3 sm:p-4 bg-[#C0C0C0] text-[#000000] text-xs flex-1 overflow-y-auto min-h-[300px]">
          {/* TAB 1: HOW IT WORKS */}
          {activeTab === 'how-it-works' && (
            <div className="space-y-3">
              <div className="retro-inset p-2 bg-[#FFFFFF] border border-[#808080]">
                <p className="text-[11px] leading-relaxed text-[#202020]">
                  <strong>SignBridge ISL</strong> translates Indian Sign Language directly into English in real time.
                  Follow these 4 simple steps to start chatting:
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {/* Step 1 */}
                <div className="retro-outset p-3 bg-[#FFFFFF] flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#000080] text-[#FFFFFF] text-[10px] font-bold px-1.5 py-0.5">
                        STEP 1
                      </span>
                      <Camera className="w-4 h-4 text-[#000080]" />
                      <h4 className="font-bold text-xs text-[#000080]">Turn On Your Camera</h4>
                    </div>
                    <p className="text-[11px] text-[#404040]">
                      Click <strong>Start Camera</strong> and sit so your head, shoulders, and both hands are clearly in view.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-[#008000] font-bold bg-[#E8F5E9] p-1 border border-[#C8E6C9]">
                    ✓ No green screen or special webcam needed!
                  </div>
                </div>

                {/* Step 2 */}
                <div className="retro-outset p-3 bg-[#FFFFFF] flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#000080] text-[#FFFFFF] text-[10px] font-bold px-1.5 py-0.5">
                        STEP 2
                      </span>
                      <Hand className="w-4 h-4 text-[#000080]" />
                      <h4 className="font-bold text-xs text-[#000080]">Sign Your Words or Letters</h4>
                    </div>
                    <p className="text-[11px] text-[#404040]">
                      Sign naturally (e.g. <em>Namaste</em>, <em>Help</em>, <em>Water</em>, <em>Thank You</em>) or spell names in <strong>A–Z</strong> fingerspelling mode.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-[#000080] font-bold bg-[#E8EAF6] p-1 border border-[#C5CAE9]">
                    ✓ Watch recognized sign badges appear on screen!
                  </div>
                </div>

                {/* Step 3 */}
                <div className="retro-outset p-3 bg-[#FFFFFF] flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#000080] text-[#FFFFFF] text-[10px] font-bold px-1.5 py-0.5">
                        STEP 3
                      </span>
                      <Sparkles className="w-4 h-4 text-[#000080]" />
                      <h4 className="font-bold text-xs text-[#000080]">Automatic English Sentences</h4>
                    </div>
                    <p className="text-[11px] text-[#404040]">
                      The built-in grammar helper rearranges Indian Sign Language word order into fluent, polished English sentences.
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-[#800080] font-bold bg-[#F3E5F5] p-1 border border-[#E1BEE7]">
                    ✓ e.g. [I, WATER, WANT] → "I want water."
                  </div>
                </div>

                {/* Step 4 */}
                <div className="retro-outset p-3 bg-[#FFFFFF] flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="bg-[#000080] text-[#FFFFFF] text-[10px] font-bold px-1.5 py-0.5">
                        STEP 4
                      </span>
                      <Send className="w-4 h-4 text-[#000080]" />
                      <h4 className="font-bold text-xs text-[#000080]">Rest Hands to Send</h4>
                    </div>
                    <p className="text-[11px] text-[#404040]">
                      When you finish a sentence, simply lower your hands or pause for 1 second. The app automatically confirms and sends your message!
                    </p>
                  </div>
                  <div className="mt-2 text-[10px] text-[#D97706] font-bold bg-[#FFFBEB] p-1 border border-[#FDE68A]">
                    ✓ No need to reach for a mouse or keyboard!
                  </div>
                </div>
              </div>

              {/* Connecting with a Friend */}
              <div className="retro-inset p-3 bg-[#FFFFCC] border border-[#808080] flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#000080] flex-shrink-0" />
                  <div>
                    <h5 className="font-bold text-xs text-[#000080]">Want to chat with someone?</h5>
                    <p className="text-[11px] text-[#404040]">
                      Click the <strong>COPY</strong> button next to <strong>ROOM</strong> at the top bar and send the link to a hearing friend, colleague, or doctor.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: KEY FEATURES */}
          {activeTab === 'features' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Feature 1 */}
                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#000080]">
                    <Hand className="w-4 h-4 text-[#000080]" />
                    <span>50 Common ISL Words</span>
                  </div>
                  <p className="text-[11px] text-[#404040]">
                    Covers everyday conversational words including greetings (Namaste, Hello), healthcare (Doctor, Hospital, Medicine, Pain), daily needs (Water, Food), and family.
                  </p>
                </div>

                {/* Feature 2 */}
                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#000080]">
                    <Zap className="w-4 h-4 text-[#000080]" />
                    <span>Two-Handed A–Z Alphabet</span>
                  </div>
                  <p className="text-[11px] text-[#404040]">
                    Switch to <strong>A–Z Mode</strong> to spell out personal names, specific street addresses, or any custom vocabulary using authentic two-handed Indian fingerspelling.
                  </p>
                </div>

                {/* Feature 3 */}
                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#000080]">
                    <Eye className="w-4 h-4 text-[#000080]" />
                    <span>Live Heads-Up Subtitles</span>
                  </div>
                  <p className="text-[11px] text-[#404040]">
                    When your chat partner replies with text or speech, subtitles appear directly over your camera video feed so you never have to glance away from the screen.
                  </p>
                </div>

                {/* Feature 4 */}
                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#000080]">
                    <Sparkles className="w-4 h-4 text-[#000080]" />
                    <span>Smart Sentence Builder</span>
                  </div>
                  <p className="text-[11px] text-[#404040]">
                    Indian Sign Language uses a different grammar order than English. Our smart formatter automatically turns questions, negations, and verbs into natural English sentences.
                  </p>
                </div>

                {/* Feature 5 */}
                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#000080]">
                    <Lock className="w-4 h-4 text-[#008000]" />
                    <span>100% Private &amp; Secure</span>
                  </div>
                  <p className="text-[11px] text-[#404040]">
                    Your camera video NEVER leaves your device! Recognition happens entirely in your browser using local AI. No images, videos, or facial data are ever saved or uploaded to the cloud.
                  </p>
                </div>

                {/* Feature 6 */}
                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-[#000080]">
                    <Smile className="w-4 h-4 text-[#008000]" />
                    <span>Free Forever &amp; No Installs</span>
                  </div>
                  <p className="text-[11px] text-[#404040]">
                    No accounts to create, no subscriptions, and nothing to download. Open in Chrome, Edge, Brave, or Safari on your computer, tablet, or phone.
                  </p>
                </div>
              </div>

              {/* Dictionary Callout */}
              <div className="retro-inset p-2.5 bg-[#FFFFCC] flex items-center justify-between gap-2">
                <div className="text-[11px] text-[#000000]">
                  <strong>Need to see how each sign is performed?</strong> Browse our 50-word visual guide with diagrams and descriptions.
                </div>
                {onOpenDictionary && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenDictionary();
                    }}
                    className="retro-btn !px-2 !py-1 text-xs font-bold bg-[#FFFFFF] text-[#000080] flex items-center gap-1 flex-shrink-0"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Open Dictionary</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: TIPS & ACCURACY */}
          {activeTab === 'tips' && (
            <div className="space-y-2.5">
              <div className="retro-inset p-2 bg-[#FFFFFF]">
                <p className="text-[11px] text-[#333333]">
                  Get the most reliable, accurate sign recognition with these simple best practices:
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-2 retro-outset bg-[#FFFFFF] flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-[#FFFFCC] border border-[#808080] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#000080]">
                    1
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#000080]">Good, Front-Facing Lighting</h5>
                    <p className="text-[11px] text-[#404040]">
                      Make sure light falls directly on your face and hands (sit facing a window or lamp). Avoid strong bright lights directly behind you, which create dark silhouettes.
                    </p>
                  </div>
                </div>

                <div className="p-2 retro-outset bg-[#FFFFFF] flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-[#FFFFCC] border border-[#808080] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#000080]">
                    2
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#000080]">Keep Both Hands in Frame</h5>
                    <p className="text-[11px] text-[#404040]">
                      Position the camera at chest/table height so your upper torso, shoulders, and full hand movements are comfortably visible within the video box.
                    </p>
                  </div>
                </div>

                <div className="p-2 retro-outset bg-[#FFFFFF] flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-[#FFFFCC] border border-[#808080] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#000080]">
                    3
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#000080]">Hold Each Sign for a Split Second</h5>
                    <p className="text-[11px] text-[#404040]">
                      To avoid accidental false detections while moving between signs, the system confirms a sign once held for a fraction of a second.
                    </p>
                  </div>
                </div>

                <div className="p-2 retro-outset bg-[#FFFFFF] flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-[#FFFFCC] border border-[#808080] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#000080]">
                    4
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#000080]">Rest Hands to Finish Sentence</h5>
                    <p className="text-[11px] text-[#404040]">
                      When you are done signing your thought, simply lower your hands to your lap or rest them on the desk. Sanket notices the pause and automatically delivers your sentence.
                    </p>
                  </div>
                </div>

                <div className="p-2 retro-outset bg-[#FFFFFF] flex items-start gap-2.5">
                  <div className="w-6 h-6 bg-[#FFFFCC] border border-[#808080] flex items-center justify-center flex-shrink-0 text-xs font-bold text-[#000080]">
                    5
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[#000080]">Use A–Z Mode for Names and Places</h5>
                    <p className="text-[11px] text-[#404040]">
                      If you need to sign a person's name or a city that isn't in the 50-word list, toggle to <strong>A–Z</strong> mode in the top toolbar to spell it letter-by-letter.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: FAQs */}
          {activeTab === 'faq' && (
            <div className="space-y-2.5">
              <div className="retro-inset p-2 bg-[#FFFFFF]">
                <h4 className="font-bold text-xs text-[#000080]">Frequently Asked Questions</h4>
              </div>

              <div className="space-y-2 text-[11px]">
                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="font-bold text-[#000080]">Q: Is my camera video saved or sent to any server?</div>
                  <div className="text-[#333333]">
                    <strong>A: Never.</strong> All sign recognition and AI calculations run directly on your own computer or phone through your web browser. No video, coordinates, or audio ever touch any cloud server.
                  </div>
                </div>

                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="font-bold text-[#000080]">Q: How does a hearing person talk back to me?</div>
                  <div className="text-[#333333]">
                    <strong>A:</strong> Your hearing friend can type in the <strong>Chat &amp; Captions</strong> panel on the right or tap quick-reply chips. Their message will show up right over your video as live subtitles.
                  </div>
                </div>

                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="font-bold text-[#000080]">Q: Does it cost money or require an account?</div>
                  <div className="text-[#333333]">
                    <strong>A:</strong> No. SignBridge ISL is an open, zero-cost public project designed to bridge the communication gap without barriers or sign-up forms.
                  </div>
                </div>

                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="font-bold text-[#000080]">Q: What if I sign a word by accident?</div>
                  <div className="text-[#333333]">
                    <strong>A:</strong> You can click the <strong>Undo</strong> button on the live sign bar at the bottom of the video, or click <strong>Clear</strong> to start the sentence over.
                  </div>
                </div>

                <div className="retro-outset p-2.5 bg-[#FFFFFF] space-y-1">
                  <div className="font-bold text-[#000080]">Q: What browsers work best?</div>
                  <div className="text-[#333333]">
                    <strong>A:</strong> Google Chrome, Microsoft Edge, Brave, and other modern Chromium-based browsers give the best performance and fastest AI speed.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-2.5 sm:p-3 bg-[#C0C0C0] border-t border-[#808080] flex flex-wrap items-center justify-between gap-2">
          {/* Don't show again checkbox */}
          <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-[#333333]">
            <input
              type="checkbox"
              checked={dontShowAgain}
              onChange={handleToggleDontShow}
              className="accent-[#000080]"
            />
            <span>Don't show this welcome guide automatically on launch</span>
          </label>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="retro-btn !px-2.5 !py-1 text-xs font-bold flex items-center gap-1 bg-[#FFFFFF] text-[#000000]"
              title="Print or save this guide as a PDF"
            >
              <Printer className="w-3.5 h-3.5 text-[#000080]" />
              <span>Print / Save PDF</span>
            </button>

            {onOpenDictionary && (
              <button
                onClick={() => {
                  handleClose();
                  onOpenDictionary();
                }}
                className="retro-btn !px-3 !py-1 text-xs font-bold flex items-center gap-1 bg-[#FFFFCC] text-[#000000]"
                title="View the 50 Indian Sign Language gestures"
              >
                <BookOpen className="w-3.5 h-3.5 text-[#000080]" />
                <span>50-Word Dictionary</span>
              </button>
            )}

            <button
              onClick={handleClose}
              className="retro-btn retro-btn-primary !px-4 !py-1 text-xs font-bold"
              title="Close guide and start using Sanket"
            >
              Got It! Start Signing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HowItWorksModal;
