/**
 * pageContextManager.js
 * 
 * Provides grounded, real-time page-specific context and sign tutorials
 * for the Sanket BYOK chatbot across all application pages (Home, Learn Studio, Video Call).
 */

import { ISL_ALPHABET_GUIDE } from '../ai/islAlphabetLabels.js';
import { ISL_WORD_LABELS } from '../ai/islWordLabels.js';

export const PAGE_DEFINITIONS = {
  home: {
    name: 'Home Page (Gateway Portal)',
    title: 'Sanket (संकेत) — Indian Sign Language AI Bridge',
    summary: 'The main landing portal where users choose between Learn ISL Studio and Video Call & Live Chat.',
    features: [
      {
        name: 'Learn ISL Studio',
        action: 'Click "Enter Learn Studio"',
        description: '7-level tailored course from Namaste to 2-handed A–Z fingerspelling and 1,000+ signs with live skeleton AI feedback and 3-rep mastery.'
      },
      {
        name: 'Video Call & Live Chat',
        action: 'Click "Start Video Call"',
        description: 'P2P WebRTC video calls with <20ms latency, on-video subtitle HUD, SOV-to-SVO grammar, and 1.2s hands-free auto-commit.'
      },
      {
        name: 'Room Code System',
        action: 'Click "# Join"',
        description: 'Instant encrypted peer rooms globally without accounts.'
      },
      {
        name: '1,000+ Word ISL Dictionary',
        action: 'Click "Dictionary"',
        description: 'Visual reference for 1,000+ ISL gestures across greetings, emergency, food, and alphabet.'
      },
      {
        name: 'App Guide & Walkthrough',
        action: 'Click "How It Works"',
        description: 'Interactive walkthrough on camera framing, lighting, gestures, and hands-free auto-commit.'
      },
      {
        name: 'System Properties & Contributor Panel',
        action: 'Click "About"',
        description: 'Details 8 Golden Invariants, open-source repo, Web Worker pipeline, and privacy guarantees.'
      },
      {
        name: 'Issue Reporter & Feedback',
        action: 'Click "Report Issue"',
        description: 'Captures window screenshot and telemetry for GitHub issues or email reports.'
      }
    ],
    privacyGuarantee: '100% In-Browser Edge AI. Video frames never leave your device. Zero server costs, zero cloud video streaming.',
    commonQuestions: [
      { q: 'What can I do on this page?', a: 'You can choose between "Learn ISL Studio" to practice signs with real-time AI skeleton feedback, or "Video Call & Live Chat" to make a translated call.' },
      { q: 'How does the video call work?', a: 'Click "Start Video Call". You get a private P2P WebRTC room. When you sign in front of the camera, your signs are translated into natural English and shown as subtitles to your partner in real time.' },
      { q: 'Are my camera frames saved on a server?', a: 'No! All AI tracking runs 100% in your browser using WebAssembly. No video or coordinates are ever uploaded.' },
      { q: 'Where do I start if I am a beginner?', a: 'Click "Enter Learn Studio"! Level 1 starts with Namaste (pressing both palms together), followed by 2-handed fingerspelling.' }
    ]
  },
  learn: {
    name: 'Learn ISL Studio',
    title: 'Interactive ISL Learning & Practice Studio',
    summary: 'Self-paced learning studio with 7 progressive levels, real-time MediaPipe skeleton alignment, and a 3-repetition streak mastery loop.',
    features: [
      { name: '7 Progressive Course Levels', description: 'Level 1: Namaste & Greetings; Level 2: Authentic 2-Handed A–Z Fingerspelling; Level 3: Everyday needs; Level 4: Healthcare & Emergency; Level 5: Transit; Level 6: Numbers; Level 7: Conversational sentences.' },
      { name: 'Live Biometric Skeleton Guidance', description: 'Real-time cyan landmark nodes and joint angle alignment overlays on your webcam stream.' },
      { name: '3-Repetition Mastery Loop', description: 'Requires completing each posture steadily 3 times to achieve mastery and advance along the tailored learning path.' },
      { name: 'Multi-Step Compound Signs', description: 'Compound signs (e.g. Good Morning = Good + Morning) guide users through sequential parts.' }
    ],
    privacyGuarantee: '100% On-Device Pose Matching. Vision inference runs locally in client Web Workers.'
  },
  chat: {
    name: 'Video Call & Live Chat (Sign Translator)',
    title: 'Two-Way Communication Hub',
    summary: 'Real-time peer-to-peer sign language translation call with video stream, live subtitles HUD, and instant messaging.',
    features: [
      { name: 'Signer Stage & 60fps Skeleton', description: 'Tracks both hands and upper body with sub-20ms latency.' },
      { name: 'Deterministic SOV-to-SVO Grammar', description: 'Restructures signed tokens into fluent English sentences (e.g. [I, WATER, WANT] -> "I want water.").' },
      { name: 'Hands-Free Auto-Commit', description: 'Rest hands for 1.2s to automatically commit and broadcast your sentence to your peer.' },
      { name: 'Live Heads-Up Subtitles HUD', description: 'Renders incoming translated replies directly on the camera viewport so signers do not need to look away.' },
      { name: 'On-Demand Chat History', description: 'The AI assistant can inspect and summarize messages exchanged in this call when explicitly requested.' }
    ],
    privacyGuarantee: 'Direct P2P WebRTC data channels with public STUN. Zero intermediate relay servers.'
  }
};

/**
 * Returns a step-by-step physical guide for how to perform any specific ISL sign.
 * 
 * @param {string} signNameOrLabel - Name or gloss of the sign (e.g. 'NAMASTE', 'HELLO', 'A', 'WATER')
 * @returns {string} Step-by-step instructional breakdown
 */
export function getSignStepByStepGuide(signNameOrLabel = '') {
  const clean = String(signNameOrLabel || '').toUpperCase().trim().replace(/\s+/g, '_');
  if (!clean) return 'Please specify a sign to learn (e.g. "Namaste", "Hello", "A", "Water", "Good").';

  // 1. Namaste
  if (clean === 'NAMASTE') {
    return `### Step-by-Step: How to Sign **NAMASTE** (Level 1)
1. **Starting Position**: Sit upright facing your camera so your upper chest and both hands are in view.
2. **Handshape**: Open both hands flat with all five fingers pressed straight together.
3. **Placement**: Bring both palms together in front of the center of your chest (Anjali Mudra).
4. **Fingers & Wrists**: Point your fingertips straight vertically upward towards your chin. Keep wrists within 15 cm of each other.
5. **Hold & AI Alignment**: Hold steadily for 500 ms until the target skeleton highlights green.
6. **Mastery Streak**: Relax your hands, then repeat 3 times to achieve mastery!`;
  }

  // 2. Hello
  if (clean === 'HELLO') {
    return `### Step-by-Step: How to Sign **HELLO**
1. **Starting Position**: Raise your dominant hand to shoulder height.
2. **Handshape**: Open flat palm with fingers together, thumb naturally relaxed.
3. **Placement**: Position your palm near your temple or forehead (palm facing slightly forward).
4. **Motion**: Gently wave outward away from your forehead in a polite saluting wave.
5. **Tip**: Make sure your wrist is clearly higher than your shoulder so the AI motion gate detects the waving trajectory.`;
  }

  // 3. Thank You
  if (clean === 'THANK_YOU' || clean === 'THANKYOU' || clean === 'THANKS') {
    return `### Step-by-Step: How to Sign **THANK YOU**
1. **Handshape**: Dominant hand open, flat fingers touching lightly together.
2. **Placement**: Place the tips of your dominant fingers gently against your chin or lower lip.
3. **Motion**: Move your hand forward and slightly downward towards the other person with an open palm.
4. **Facial Expression**: A warm nod or smile reinforces the courtesy in authentic ISL.`;
  }

  // 4. Good / Bad
  if (clean === 'GOOD') {
    return `### Step-by-Step: How to Sign **GOOD**
1. **Handshape**: Form a firm closed fist with your dominant hand.
2. **Thumb Placement**: Extend your thumb straight upwards (standard thumbs-up).
3. **Body Zone**: Hold at mid-chest height, facing forward.
4. **Hold**: Hold steady for 500 ms for the AI classifier to register high confidence.`;
  }

  if (clean === 'BAD') {
    return `### Step-by-Step: How to Sign **BAD**
1. **Handshape**: Form a firm closed fist with your dominant hand.
2. **Thumb Placement**: Extend your thumb straight downwards (thumbs-down).
3. **Motion**: A sharp downward gesture indicates negative sentiment.`;
  }

  // 5. Please / Sorry
  if (clean === 'PLEASE') {
    return `### Step-by-Step: How to Sign **PLEASE**
1. **Handshape**: Open flat palm on your dominant hand.
2. **Placement**: Place your palm flat against the center of your chest.
3. **Motion**: Move your palm in a gentle clockwise circular rubbing motion 2–3 times.`;
  }

  if (clean === 'SORRY') {
    return `### Step-by-Step: How to Sign **SORRY**
1. **Handshape**: Form a closed fist ('A' fist) with your dominant hand.
2. **Placement**: Place the knuckle side of your fist against your chest.
3. **Motion**: Rub in a small circular motion across your heart/chest 2–3 times.`;
  }

  // 6. Water
  if (clean === 'WATER') {
    return `### Step-by-Step: How to Sign **WATER**
1. **Handshape**: Form a 'W' handshape (extend index, middle, and ring fingers upward; thumb holds down pinky).
2. **Placement**: Bring your index finger to touch your chin or side of the mouth.
3. **Motion**: Tap your chin twice gently.`;
  }

  // 7. Time
  if (clean === 'TIME') {
    return `### Step-by-Step: How to Sign **TIME**
1. **Non-Dominant Arm**: Extend your non-dominant arm forward horizontally, wrist facing upward.
2. **Dominant Hand**: Extend your dominant index finger.
3. **Motion**: Tap the back of your non-dominant wrist twice (mimicking a wristwatch).`;
  }

  // 8. Help
  if (clean === 'HELP') {
    return `### Step-by-Step: How to Sign **HELP**
1. **Non-Dominant Hand**: Open flat palm facing upward at chest height (the supporting platform).
2. **Dominant Hand**: Form a thumbs-up fist and place it directly on top of the non-dominant palm.
3. **Motion**: Lift both hands upward together towards the person being helped.`;
  }

  // 9. Authentic ISL Alphabet Check (Two-Handed Standard)
  const letterItem = ISL_ALPHABET_GUIDE.find(item => item.letter.toUpperCase() === clean);
  if (letterItem) {
    return `### Step-by-Step: How to Fingerspell Letter **${letterItem.letter}** in ISL
- **Category**: ${letterItem.category} (${letterItem.type})
- **Hand Configuration**: ${letterItem.description}
- **Pro-Tip**: ${letterItem.tip}
- **AI Tracking Advice**: Hold hands steady in camera view for 400 ms. In Alphabet mode, contiguous letters merge into words automatically!`;
  }

  // 10. General Word Labels Lookup
  const wordItem = ISL_WORD_LABELS.find(w => w.gloss.toUpperCase() === clean || w.id.toUpperCase() === clean);
  if (wordItem) {
    return `### Step-by-Step: How to Sign **${wordItem.english || wordItem.gloss}**
- **Category**: ${wordItem.category?.toUpperCase() || 'GENERAL'}
- **ISL Gloss**: \`${wordItem.gloss}\`
- **Execution**: Perform the sign at chest height facing your webcam.
- **Hold & Release**: Hold posture steadily for 500 ms, then relax hands down to neutral to register the sign.`;
  }

  // Generic fallback
  return `### How to Sign **${clean.replace(/_/g, ' ')}**
1. Position yourself 1.5 to 2 feet in front of your camera with good front lighting.
2. Keep your upper torso, shoulders, and both hands in view.
3. Check our **1,000+ Word ISL Dictionary** (click "Dictionary" in the footer) for animated illustrations.
4. Hold the sign steady at chest or head level for 500 ms for AI confirmation.`;
}

/**
 * Builds the comprehensive prompt instructions for the current page.
 * 
 * @param {string} page - 'home' | 'learn' | 'chat'
 * @param {Object} [extraState={}] - Dynamic session state
 * @returns {string} System instruction string strictly grounding the AI to the page
 */
export function buildPageSystemInstruction(page = 'home', extraState = {}) {
  const pageDef = PAGE_DEFINITIONS[page] || PAGE_DEFINITIONS.home;

  const featuresList = pageDef.features
    .map((f, i) => `${i + 1}. **${f.name}**${f.action ? ` (${f.action})` : ''}: ${f.description}`)
    .join('\n');

  // Dynamic Page Context Details
  let dynamicPageDetails = '';

  // 1. Learn Mode Context: Injects active sign
  if (page === 'learn' && extraState.selectedLearnItem) {
    const item = extraState.selectedLearnItem;
    const isMastered = Boolean(extraState.isSignMastered);
    const reps = extraState.successfulReps || 0;

    dynamicPageDetails = `
CURRENT PRACTICE SIGN IN LEARN STUDIO:
- Active Sign: "${item.name || item.label}" (Gloss: ${item.label})
- Category: ${item.category || 'General'}
- Type: ${item.type || 'Word'}
- Description: ${item.description || 'Standard ISL posture'}
- Practice Tip: ${item.tip || 'Keep hands visible in camera frame'}
- Progress on this Sign: ${reps} of 3 repetitions completed (${isMastered ? 'MASTERED!' : 'In Practice'})
- Overall User Progress: ${extraState.masteredCount || 0} signs mastered
${item.steps ? `- Compound Steps: This sign has ${item.steps.length} sequential parts. Currently on Step ${Number(extraState.activeStepIndex || 0) + 1}.` : ''}

WHEN THE USER ASKS HOW TO SIGN:
Provide the step-by-step physical guide for "${item.name || item.label}". Explain hand placement, finger shape, motion, and how to hold for 3 repetitions.`;
  }

  // 2. Chat / Video Call Mode Context
  if (page === 'chat') {
    const glossStr = Array.isArray(extraState.glosses) && extraState.glosses.length > 0
      ? extraState.glosses.join(' ')
      : 'None (buffer empty)';
    
    dynamicPageDetails = `
ACTIVE VIDEO CALL & TRANSLATOR STATE:
- Room Code: "${extraState.roomId || 'Direct P2P'}"
- Connection Mode: ${extraState.connectionMode || 'P2P WebRTC'}
- Tokens in Live Composer: [${glossStr}]
- Real-Time Formatted English: "${extraState.previewText || ''}"
`;

    // Only include call messages if explicitly asked or flag is true (token-optimized to last 6 messages)
    if (extraState.includeCallChat && Array.isArray(extraState.callMessages) && extraState.callMessages.length > 0) {
      const recentMessages = extraState.callMessages.slice(-6).map(m => {
        const sender = m.sender || (m.senderRole === 'peer' ? 'User' : 'Partner');
        const text = String(m.text || m.rawText || '').slice(0, 120);
        return `[${m.timestamp || ''}] ${sender}: "${text}"`;
      }).join('\n');

      dynamicPageDetails += `
FETCHED CALL MESSAGES (REQUESTED BY USER):
${recentMessages}

INSTRUCTION FOR CALL MESSAGES:
The user explicitly asked about the call messages. Summarize or answer their questions about what was discussed in the call.`;
    } else {
      dynamicPageDetails += `
CALL CHAT STATUS:
Call messages are NOT shown by default. If the user asks "what was said in the chat?", "fetch call messages", or "summarize the call", fetch and summarize the call chat.`;
    }
  }

  // 3. Home Page Context
  if (page === 'home') {
    dynamicPageDetails = `
HOME PORTAL CONTEXT:
The user is on the main gateway portal. They can choose between:
1. "Learn ISL Studio" (Level 1: Namaste, A-Z fingerspelling, 1,000+ signs)
2. "Video Call & Live Chat" (Real-time P2P WebRTC video call with sign translation)
${extraState.roomId ? `- Room ID: "${extraState.roomId}"` : ''}
${extraState.masteredCount !== undefined ? `- Mastered Signs: ${extraState.masteredCount}` : ''}`;
  }

  // 4. Live Screen & Modal Telemetry
  const activeModals = [
    extraState.isDictionaryOpen && '1,000+ Word Dictionary Modal',
    extraState.isGuideOpen && 'App Guide & Walkthrough Modal',
    extraState.isAboutOpen && 'System Properties & About Modal',
    extraState.isFeedbackOpen && 'Issue Reporter & Feedback Modal',
    extraState.isRecorderOpen && 'Keypoint Dataset Recorder Drawer'
  ].filter(Boolean);

  const screenTelemetry = [
    `- Active Route: ${pageDef.name}`,
    `- Recognition Engine: ${extraState.recognitionMode === 'alphabet' ? '2-Handed A-Z Alphabet' : 'Core 50/260+ Word Gestures'}`,
    activeModals.length > 0 ? `- Open Overlay Modals: ${activeModals.join(', ')}` : '- Open Overlay Modals: None (clean page view)'
  ].join('\n');

  dynamicPageDetails += `
LIVE SCREEN TELEMETRY:
${screenTelemetry}
`;

  return `You are Sanket AI, the dedicated in-browser assistant for Sanket (SignBridge ISL).

CURRENT VIEW:
Page: ${pageDef.name}
Summary: ${pageDef.summary}
${dynamicPageDetails}

CORE FEATURES ON THIS PAGE:
${featuresList}

PRIVACY & ARCHITECTURE:
${pageDef.privacyGuarantee || '100% In-Browser Edge AI. Zero server costs, zero cloud video streaming.'}

STRICT OPERATIONAL RULES:
1. Ground answers strictly in the current page (${pageDef.name}) and Sanket features.
2. When asked how to sign, provide clear, step-by-step physical instructions (Handshape, Placement, Motion, Hold Duration).
3. If on video call, ONLY fetch call messages when explicitly asked by the user.
4. Keep answers direct, punchy, and concise (2-4 bullet points or short sentences). Do NOT output thought processes, reasoning drafts, or quotes of instructions. Speak directly to the user.
5. Screen Awareness: You have full visibility into the active screen, live camera view, open modals, and learning/call telemetry. When a screenshot is attached or the user asks what is on their screen, analyze the visual and structural state directly.`;
}
