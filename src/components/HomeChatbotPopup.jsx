import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MessageSquare,
  Sparkles,
  Key,
  X,
  Send,
  Trash2,
  ExternalLink,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Database,
  Maximize2,
  Minimize2,
  Download,
  FileText,
  FileDown,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  MoreVertical,
  GripHorizontal,
  BookOpen,
  Zap,
  AudioWaveform
} from 'lucide-react';
import {
  getByokConfig,
  saveByokConfig,
  clearByokConfig,
  getMemorySetting,
  setMemorySetting,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  sendChatbotMessage,
  downloadChatTranscript,
  PROVIDERS,
  SUPPORTED_MODELS
} from '../utils/byokChatbotService.js';
import { PAGE_DEFINITIONS, buildPageSystemInstruction } from '../utils/pageContextManager.js';
import { captureDOMScreenshot } from '../utils/screenshotCapture.js';
import {
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
  speakText,
  playGeminiAudio,
  stopSpeaking,
  VoiceRecognizer,
  GeminiVoiceRecorder
} from '../utils/speechService.js';
import { GeminiLiveSession } from '../utils/geminiLiveService.js';
import ChatTextFormatter from './ChatTextFormatter.jsx';

export function HomeChatbotPopup({
  isOpen,
  onClose,
  currentPage = 'home',
  extraState = {},
  onNavigateToMode,
  onOpenDictionary,
  onOpenGuide
}) {
  // BYOK Configuration State
  const [byokConfig, setByokConfig] = useState(getByokConfig);
  const [apiKeyInput, setApiKeyInput] = useState(() => byokConfig.apiKey || '');
  const [selectedModel, setSelectedModel] = useState(() => byokConfig.model || 'gemini-2.5-flash');
  const [selectedProvider, setSelectedProvider] = useState(() => byokConfig.provider || 'gemini');
  const [customEndpoint, setCustomEndpoint] = useState(() => byokConfig.endpoint || '');
  const [showKeyText, setShowKeyText] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [keySaveMessage, setKeySaveMessage] = useState(null);

  const currentProviderMeta = useMemo(() => {
    return PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];
  }, [selectedProvider]);

  const handleProviderChange = (providerId) => {
    setSelectedProvider(providerId);
    const pMeta = PROVIDERS.find(p => p.id === providerId);
    if (pMeta) {
      setSelectedModel(pMeta.defaultModel);
      setCustomEndpoint(providerId === 'custom' ? (pMeta.endpoint || 'http://localhost:11434/v1/chat/completions') : '');
    }
  };

  // Memory Persistence State
  const [saveInMemory, setSaveInMemory] = useState(getMemorySetting);

  const currentSignName = extraState.selectedLearnItem?.name || 'Namaste';

  // Dynamic initial greeting generator based on active page
  const getInitialGreeting = useCallback(() => {
    if (currentPage === 'learn') {
      return `**Namaste! I am your Sanket AI Guide.**\n\nYou are in **Learn ISL Studio** practicing: **${currentSignName}**.\n\n• Progress: **${extraState.successfulReps || 0} of 3 repetitions**\n• Need help? Ask *"How do I sign ${currentSignName} step-by-step?"* or select a topic below!`;
    }
    if (currentPage === 'chat') {
      return `**Namaste! I am your Sanket AI Guide.**\n\nYou are in **Video Call & Sign Translator** (Room: \`${extraState.roomId || 'Direct P2P'}\`).\n\n• I can help you with signs, explain grammar rules, and **fetch recent call chat** whenever you ask!\n• Ask *"What was said in the chat?"* or click **Fetch Call Chat** below.`;
    }
    return `**Namaste! I am your Sanket AI Guide.**\n\nI have information about everything on this page: **Learn ISL Studio**, **Real-Time Video Calls**, the **1,000+ Word Dictionary**, and our **100% On-Device Privacy Architecture**.\n\nAsk me any question below, or select a quick topic!`;
  }, [currentPage, currentSignName, extraState.successfulReps, extraState.roomId]);

  // Conversation State
  const [messages, setMessages] = useState(() => {
    const saved = loadChatHistory();
    if (saved && saved.length > 0) return saved;
    return [
      {
        id: 'welcome',
        role: 'assistant',
        text: getInitialGreeting(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'page-context'
      }
    ];
  });
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [exportToast, setExportToast] = useState(null);

  // Voice & Speech State (100% In-Browser Web Speech API)
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeSpeakingId, setActiveSpeakingId] = useState(null);
  const [autoSpeak, setAutoSpeak] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sanket_chatbot_auto_speak');
        return saved !== null ? saved === 'true' : true;
      } catch (e) {}
    }
    return true;
  });
  const [isContinuousVoice, setIsContinuousVoice] = useState(false);
  const isContinuousVoiceRef = useRef(false);

  useEffect(() => {
    isContinuousVoiceRef.current = isContinuousVoice;
  }, [isContinuousVoice]);

  // Screen Vision State (Multimodal DOM / Canvas Screenshot for Gemini)
  const [screenVisionEnabled, setScreenVisionEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('sanket_chatbot_screen_vision');
        return saved !== null ? saved === 'true' : true;
      } catch (e) {}
    }
    return true;
  });
  const [isCapturingScreen, setIsCapturingScreen] = useState(false);

  // Gemini Live WebSocket Real-Time Voice State
  const geminiLiveRef = useRef(null);
  const [isLiveConnected, setIsLiveConnected] = useState(false);
  const isLiveConnectedRef = useRef(false); // ref for timeout closures (avoids stale state)
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);
  const [liveAiTranscript, setLiveAiTranscript] = useState('');
  const [liveUserTranscript, setLiveUserTranscript] = useState('');
  const liveConnectionTimeoutRef = useRef(null);
  const speechRecognizerRef = useRef(null);
  const geminiRecorderRef = useRef(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const exportMenuRef = useRef(null);
  const moreMenuRef = useRef(null);

  // Draggable window state for desktop screens
  const [position, setPosition] = useState(() => {
    if (typeof window === 'undefined') return null;
    try {
      const saved = localStorage.getItem('sanket_ai_popup_pos');
      if (saved) {
        const p = JSON.parse(saved);
        if (typeof p.x === 'number' && typeof p.y === 'number') return p;
      }
    } catch {}
    return null;
  });
  const dragRef = useRef({ isDragging: false, startX: 0, startY: 0, initialX: 0, initialY: 0 });

  // Update default position on open or window resize
  useEffect(() => {
    if (!isOpen) return;

    const handleResize = () => {
      if (typeof window === 'undefined' || window.innerWidth < 640) {
        setPosition(null);
        return;
      }
      const popupW = isExpanded ? 540 : 420;
      const popupH = isExpanded ? 680 : 540;
      const defaultX = Math.max(16, window.innerWidth - popupW - 16);
      const defaultY = Math.max(16, window.innerHeight - popupH - 45);

      setPosition(prev => {
        if (!prev) return { x: defaultX, y: defaultY };
        const maxX = Math.max(16, window.innerWidth - popupW - 16);
        const maxY = Math.max(16, window.innerHeight - popupH - 16);
        return {
          x: Math.min(Math.max(16, prev.x), maxX),
          y: Math.min(Math.max(16, prev.y), maxY)
        };
      });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, isExpanded]);

  const handlePointerDown = (e) => {
    if (typeof window === 'undefined' || window.innerWidth < 640) return;
    // Don't drag if user clicked buttons, inputs, selects or dropdown menu
    if (e.target.closest('button, input, select, textarea, a, .dropdown-menu')) return;

    const popupW = isExpanded ? 540 : 420;
    const popupH = isExpanded ? 680 : 540;
    const curX = position?.x ?? Math.max(16, window.innerWidth - popupW - 16);
    const curY = position?.y ?? Math.max(16, window.innerHeight - popupH - 45);

    dragRef.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      initialX: curX,
      initialY: curY
    };

    const handlePointerMove = (moveEvt) => {
      if (!dragRef.current.isDragging) return;
      const dx = moveEvt.clientX - dragRef.current.startX;
      const dy = moveEvt.clientY - dragRef.current.startY;
      const maxX = Math.max(16, window.innerWidth - popupW - 16);
      const maxY = Math.max(16, window.innerHeight - popupH - 16);

      const nextX = Math.min(Math.max(16, dragRef.current.initialX + dx), maxX);
      const nextY = Math.min(Math.max(16, dragRef.current.initialY + dy), maxY);

      setPosition({ x: nextX, y: nextY });
    };

    const handlePointerUp = () => {
      dragRef.current.isDragging = false;
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      setPosition(cur => {
        if (cur) {
          try {
            localStorage.setItem('sanket_ai_popup_pos', JSON.stringify(cur));
          } catch {}
        }
        return cur;
      });
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
  };

  // Cleanup speech synthesis, recognizer and live session on unmount
  useEffect(() => {
    return () => {
      stopSpeaking();
      clearTimeout(liveConnectionTimeoutRef.current);
      if (geminiLiveRef.current) {
        geminiLiveRef.current.stop();
        geminiLiveRef.current = null;
      }
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.abort();
      }
      if (geminiRecorderRef.current) {
        geminiRecorderRef.current.abort();
      }
    };
  }, []);

  // Gracefully stop live audio session if popup closes
  useEffect(() => {
    if (!isOpen) {
      clearTimeout(liveConnectionTimeoutRef.current);
      if (geminiLiveRef.current) {
        geminiLiveRef.current.stop();
        geminiLiveRef.current = null;
      }
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.abort();
      }
      if (geminiRecorderRef.current) {
        geminiRecorderRef.current.abort();
      }
      setIsListening(false);
      setIsContinuousVoice(false);
      isContinuousVoiceRef.current = false;
      setIsLiveConnected(false);
      isLiveConnectedRef.current = false;
      setIsLiveConnecting(false);
      setLiveAiTranscript('');
      setLiveUserTranscript('');
      handleStopSpeaking();
    }
  }, [isOpen]);

  // Auto-scroll to bottom of conversation
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(scrollToBottom, 100);
      inputRef.current?.focus();
    }
  }, [isOpen, scrollToBottom]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  // Click outside listener for dropdown menus
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target)) {
        setIsMoreMenuOpen(false);
      }
    }
    if (isExportMenuOpen || isMoreMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen, isMoreMenuOpen]);

  // Sync memory persistence
  useEffect(() => {
    if (saveInMemory) {
      saveChatHistory(messages);
    }
  }, [messages, saveInMemory]);

  // Handle Memory Toggle
  const handleToggleMemory = (e) => {
    const newValue = e.target.checked;
    setSaveInMemory(newValue);
    setMemorySetting(newValue);
    if (!newValue) {
      clearChatHistory();
    }
  };

  // Handle Clear Chat
  const handleClearChat = () => {
    const reset = [
      {
        id: Date.now(),
        role: 'assistant',
        text: `Memory cleared! I am ready to help you with the **${PAGE_DEFINITIONS[currentPage]?.name || 'Home Page'}**. What would you like to know?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        provider: 'page-context'
      }
    ];
    setMessages(reset);
    clearChatHistory();
  };

  // Handle Save BYOK
  const handleSaveByok = (e) => {
    e.preventDefault();
    saveByokConfig({
      apiKey: apiKeyInput,
      provider: selectedProvider,
      model: selectedModel,
      endpoint: customEndpoint
    });
    setByokConfig(getByokConfig());
    setKeySaveMessage({ type: 'success', text: 'API Key saved to browser storage!' });
    setTimeout(() => {
      setKeySaveMessage(null);
      setIsSettingsOpen(false);
    }, 1500);
  };

  // Handle Clear BYOK Key
  const handleClearByok = () => {
    clearByokConfig();
    setApiKeyInput('');
    setByokConfig(getByokConfig());
    setKeySaveMessage({ type: 'info', text: 'API Key removed. Reverted to local guidance mode.' });
    setTimeout(() => setKeySaveMessage(null), 2000);
  };

  // Handle Export Chat Transcript
  const handleExportChat = (format = 'txt') => {
    try {
      const isWord = format === 'doc' || format === 'word';
      const success = downloadChatTranscript(messages, {
        format: isWord ? 'doc' : 'txt',
        currentPage
      });
      if (success) {
        setExportToast({
          type: 'success',
          text: isWord
            ? 'Chat exported as Word document (.doc)!'
            : 'Chat saved as text file (.txt)!'
        });
        setTimeout(() => setExportToast(null), 3500);
      } else {
        setExportToast({
          type: 'error',
          text: 'No chat messages to export yet.'
        });
        setTimeout(() => setExportToast(null), 3000);
      }
    } catch (err) {
      console.error('Failed to export chat transcript:', err);
      setExportToast({
        type: 'error',
        text: 'Failed to download transcript.'
      });
      setTimeout(() => setExportToast(null), 3000);
    }
    setIsExportMenuOpen(false);
  };

  // Handle Toggle Auto-Speak
  const handleToggleAutoSpeak = () => {
    const next = !autoSpeak;
    setAutoSpeak(next);
    if (!next) {
      stopSpeaking();
      setIsSpeaking(false);
      setActiveSpeakingId(null);
    }
    try {
      localStorage.setItem('sanket_chatbot_auto_speak', String(next));
    } catch (e) {}
  };

  // Handle Toggle Screen Vision
  const handleToggleScreenVision = () => {
    const next = !screenVisionEnabled;
    setScreenVisionEnabled(next);
    try {
      localStorage.setItem('sanket_chatbot_screen_vision', String(next));
    } catch (e) {}
  };

  // Stop active speech synthesizer
  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setActiveSpeakingId(null);
  };

  // Play / Speak message text
  const handleSpeakMessage = (msg) => {
    if (activeSpeakingId === msg.id) {
      handleStopSpeaking();
      return;
    }

    handleStopSpeaking();
    setActiveSpeakingId(msg.id);
    setIsSpeaking(true);

    const onDone = () => {
      setIsSpeaking(false);
      setActiveSpeakingId(null);
    };

    if (msg.audio && msg.audio.base64) {
      playGeminiAudio(msg.audio.base64, msg.audio.mimeType, {
        onStart: () => setIsSpeaking(true),
        onEnd: onDone,
        onError: () => {
          speakText(msg.text, {
            onStart: () => setIsSpeaking(true),
            onEnd: onDone,
            onError: onDone
          });
        }
      });
    } else {
      speakText(msg.text, {
        onStart: () => setIsSpeaking(true),
        onEnd: onDone,
        onError: onDone
      });
    }
  };

  // Quick Prompt Chips dynamically adapted to current page
  const quickPrompts = useMemo(() => {
    const base = ['What is on my screen?'];
    if (currentPage === 'learn') {
      return [
        ...base,
        `How do I sign ${currentSignName} step-by-step?`,
        `What is the target posture for ${currentSignName}?`,
        'How does the 3-repetition loop work?'
      ];
    }
    if (currentPage === 'chat') {
      return [
        ...base,
        'Fetch recent call chat messages',
        'How does the 1.2s hands-free pause work?',
        'How do I sign Thank You or Help?'
      ];
    }
    return [
      ...base,
      'What can I do on this page?',
      'How do I practice Namaste in Learn Studio?',
      'How does the translated video call work?'
    ];
  }, [currentPage, currentSignName]);

  // Send Message Handler with Screen Vision & Voice Output
  const handleSendMessage = async (textToSend, options = {}) => {
    const isAudioOnly = Boolean(options.audioInputBase64);
    const query = (textToSend || inputText).trim();
    if (!query && !isAudioOnly) return;

    // If Gemini Live Session is actively connected and this is a text message, send directly over live stream
    if (geminiLiveRef.current && isLiveConnected && query && !isAudioOnly) {
      geminiLiveRef.current.sendTextMessage(query);
      const userMessage = {
        id: Date.now(),
        role: 'user',
        text: query,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMessage]);
      setInputText('');
      return;
    }

    if (isLoading) return;

    // Stop active microphone
    if (speechRecognizerRef.current && isListening) {
      speechRecognizerRef.current.stop();
    }
    if (geminiRecorderRef.current && isListening) {
      geminiRecorderRef.current.stop();
    }
    setIsListening(false);
    handleStopSpeaking();

    // Check if we should capture a screenshot for visual screen understanding
    let screenshotDataUrl = options.screenshotDataUrl || null;
    const isAskingScreen = isAudioOnly ||
      query.toLowerCase().includes('screen') ||
      query.toLowerCase().includes('what do you see') ||
      query.toLowerCase().includes('look at') ||
      query.toLowerCase().includes('posture') ||
      query.toLowerCase().includes('camera') ||
      query.toLowerCase().includes('signing') ||
      options.forceScreenshot;

    if (!screenshotDataUrl && screenVisionEnabled && isAskingScreen) {
      setIsCapturingScreen(true);
      try {
        screenshotDataUrl = await captureDOMScreenshot();
      } catch (err) {
        console.warn('[HomeChatbotPopup] Screen capture warning:', err);
      } finally {
        setIsCapturingScreen(false);
      }
    }

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: isAudioOnly ? 'Spoken Voice Question' : query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      hasScreenshot: Boolean(screenshotDataUrl),
      isVoiceInput: isAudioOnly
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    const shouldVocalize = isAudioOnly || autoSpeak || isContinuousVoiceRef.current;

    try {
      const response = await sendChatbotMessage({
        message: query,
        history: newMessages.map(m => ({ role: m.role, text: m.text })),
        page: currentPage,
        extraState,
        screenshotDataUrl,
        wantsAudio: Boolean(shouldVocalize),
        audioInputBase64: options.audioInputBase64 || null,
        audioInputMimeType: options.audioInputMimeType || 'audio/webm'
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromLlm: response.isFromLlm,
        provider: response.provider,
        modelUsed: response.modelUsed,
        audio: response.audio || null
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If user spoke or voice mode is enabled, speak the answer aloud
      if (shouldVocalize) {
        setActiveSpeakingId(assistantMessage.id);

        const onFinishedSpeaking = () => {
          setIsSpeaking(false);
          setActiveSpeakingId(null);
          // Continuous hands-free voice loop: automatically listen again for next user question!
          if (isContinuousVoiceRef.current) {
            setTimeout(() => {
              if (isContinuousVoiceRef.current) {
                startWebSpeechLoop();
              }
            }, 400);
          }
        };

        // If Gemini returned native AI studio audio, play Gemini's actual studio voice!
        if (response.audio && response.audio.base64) {
          playGeminiAudio(response.audio.base64, response.audio.mimeType, {
            onStart: () => setIsSpeaking(true),
            onEnd: onFinishedSpeaking,
            onError: (err) => {
              console.warn('[HomeChatbotPopup] Gemini native audio error, falling back to TTS:', err);
              // Fallback to browser TTS if audio playback failed
              speakText(response.reply, {
                onStart: () => setIsSpeaking(true),
                onEnd: onFinishedSpeaking,
                onError: onFinishedSpeaking
              });
            }
          });
        } else {
          // Other keys (Groq, OpenAI, OpenRouter) or local fallback: use browser TTS
          speakText(response.reply, {
            onStart: () => setIsSpeaking(true),
            onEnd: onFinishedSpeaking,
            onError: onFinishedSpeaking
          });
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: `An unexpected error occurred: ${err.message}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  // Dedicated 1-Click "What's on my screen?" Visual Inspector
  const handleAskAboutScreen = async () => {
    setIsCapturingScreen(true);
    let screenshotDataUrl = null;
    try {
      screenshotDataUrl = await captureDOMScreenshot();
    } catch (err) {
      console.warn('[HomeChatbotPopup] Screen snapshot error:', err);
    } finally {
      setIsCapturingScreen(false);
    }

    // If Gemini Live Session is connected, stream the screen frame directly to the live vision context!
    if (geminiLiveRef.current && isLiveConnected) {
      if (screenshotDataUrl) {
        geminiLiveRef.current.sendScreenFrame(screenshotDataUrl);
        geminiLiveRef.current.sendTextMessage(
          "Look at what is currently on my screen and tell me what you see, what sign or mode is active, and guide me."
        );
      }
      return;
    }

    const screenPrompt = "Look at what is currently on my screen and tell me what you see, what sign or mode is active, and provide guidance.";
    handleSendMessage(screenPrompt, { screenshotDataUrl, forceScreenshot: true });
  };

  // Start Real-Time Gemini Live Audio Session over WebSockets
  const startGeminiLive = async () => {
    handleStopSpeaking();
    setIsListening(true);
    setIsLiveConnecting(true);
    setIsContinuousVoice(true);
    isContinuousVoiceRef.current = true;
    setAutoSpeak(true);

    let initialScreenshot = null;
    if (screenVisionEnabled) {
      setIsCapturingScreen(true);
      try {
        initialScreenshot = await captureDOMScreenshot();
      } catch (err) {
        console.warn('[HomeChatbotPopup] Live screen capture warning:', err);
      } finally {
        setIsCapturingScreen(false);
      }
    }

    const systemInstruction = buildPageSystemInstruction(currentPage, extraState);

    // Abort any existing session
    if (geminiLiveRef.current) {
      geminiLiveRef.current.stop();
      geminiLiveRef.current = null;
    }

    // 5-second connection timeout: if setupComplete never fires, fall back to Web Speech
    // Uses a ref (isLiveConnectedRef) to avoid stale closure over React state.
    if (liveConnectionTimeoutRef.current) {
      clearTimeout(liveConnectionTimeoutRef.current);
    }
    liveConnectionTimeoutRef.current = setTimeout(() => {
      if (!isLiveConnectedRef.current) {
        console.warn('[GeminiLive] Setup timeout — falling back to Web Speech recognizer.');
        setIsLiveConnecting(false);
        if (geminiLiveRef.current) {
          geminiLiveRef.current.stop();
          geminiLiveRef.current = null;
        }
        startWebSpeechLoop();
      }
    }, 8000);

    // Try Live-capable models in priority order (v1beta endpoint, current models 2025)
    const liveModels = [
      'gemini-3.8-live',
      'gemini-2.0-flash-live-001',
      'gemini-2.0-flash-exp'
    ];

    let liveStarted = false;
    for (const liveModel of liveModels) {
      try {
        const session = new GeminiLiveSession({
          apiKey: byokConfig.apiKey,
          model: liveModel,
          voiceName: 'Puck',
          systemInstruction,
          onConnected: () => {
            clearTimeout(liveConnectionTimeoutRef.current);
            isLiveConnectedRef.current = true;
            setIsLiveConnected(true);
            setIsLiveConnecting(false);
            setIsListening(true);
            setLiveUserTranscript('');
            setLiveAiTranscript('');
            if (initialScreenshot) {
              session.sendScreenFrame(initialScreenshot);
            }
          },
          onTranscript: ({ role, text }) => {
            if (role === 'user') {
              setLiveUserTranscript(text);
            } else {
              setLiveAiTranscript(text);
            }
          },
          onAudioChunk: () => {
            setIsSpeaking(true);
          },
          onInterrupted: () => {
            setIsSpeaking(false);
            setLiveAiTranscript('');
          },
          onTurnComplete: ({ replyText, userText }) => {
            setIsSpeaking(false);
            const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            if (userText && userText.trim()) {
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now(),
                  role: 'user',
                  text: userText.trim(),
                  timestamp: nowTime,
                  isVoiceInput: true,
                  hasScreenshot: Boolean(initialScreenshot)
                }
              ]);
            }

            if (replyText && replyText.trim()) {
              setMessages(prev => [
                ...prev,
                {
                  id: Date.now() + 1,
                  role: 'assistant',
                  text: replyText.trim(),
                  timestamp: nowTime,
                  isFromLlm: true,
                  provider: 'gemini-live',
                  modelUsed: liveModel
                }
              ]);
            }

            setLiveAiTranscript('');
            setLiveUserTranscript('');
          },
          onError: (err) => {
            console.warn('[GeminiLiveSession] WebSocket error:', err?.message || err);
            clearTimeout(liveConnectionTimeoutRef.current);
            isLiveConnectedRef.current = false;
            setIsLiveConnected(false);
            setIsLiveConnecting(false);
            // Fall back to Web Speech recognizer which shows interim words
            if (isContinuousVoiceRef.current) {
              startWebSpeechLoop();
            }
          },
          onClose: (evt) => {
            console.info('[GeminiLiveSession] closed:', evt?.code, evt?.reason);
            clearTimeout(liveConnectionTimeoutRef.current);
            isLiveConnectedRef.current = false;
            setIsLiveConnected(false);
            setIsLiveConnecting(false);
          }
        });

        geminiLiveRef.current = session;
        await session.start();
        liveStarted = true;
        break; // Success — stop trying other models
      } catch (err) {
        console.warn(`[GeminiLive] model ${liveModel} failed:`, err?.message || err);
        if (geminiLiveRef.current) {
          geminiLiveRef.current.stop();
          geminiLiveRef.current = null;
        }
        // try next model
      }
    }

    if (!liveStarted) {
      clearTimeout(liveConnectionTimeoutRef.current);
      isLiveConnectedRef.current = false;
      setIsLiveConnecting(false);
      console.warn('[GeminiLive] All live models failed, falling back to Web Speech.');
      startWebSpeechLoop();
    }
  };

  // Web Speech API continuous loop — shows interim words in input, auto-sends on pause,
  // then uses Gemini REST for the reply + browser TTS for the spoken answer.
  // Used for all non-Gemini keys AND as fallback when Gemini Live WS fails.
  const startWebSpeechLoop = () => {
    handleStopSpeaking();
    if (!isSpeechRecognitionSupported()) {
      console.warn('[HomeChatbotPopup] Web Speech not supported.');
      return;
    }

    if (geminiRecorderRef.current) geminiRecorderRef.current.abort();
    if (speechRecognizerRef.current) speechRecognizerRef.current.abort();

    setIsListening(true);

    speechRecognizerRef.current = new VoiceRecognizer({
      onStart: () => {
        setIsListening(true);
      },
      onResult: ({ transcript }) => {
        // Show interim words live in the input bar as user speaks
        setInputText(transcript);
      },
      onSpeechEnd: (spokenText) => {
        if (spokenText && spokenText.trim() && !isLoading) {
          setIsListening(false);
          handleSendMessage(spokenText.trim());
        }
      },
      onError: (err) => {
        if (err !== 'no-speech') {
          setIsListening(false);
        }
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          alert('Microphone permission was denied. Please allow microphone access in your browser to use voice chat.');
          setIsContinuousVoice(false);
          isContinuousVoiceRef.current = false;
        }
      },
      onEnd: () => {
        // After an utterance finishes, restart recognizer for the continuous loop
        if (isContinuousVoiceRef.current && !isLoading) {
          setTimeout(() => {
            if (isContinuousVoiceRef.current) {
              startWebSpeechLoop();
            }
          }, 300);
        } else if (!isContinuousVoiceRef.current) {
          setIsListening(false);
        }
      }
    });

    speechRecognizerRef.current.start();
  };

  // REST Speech Fallback (for non-Gemini keys)
  const startRestListening = () => {
    // For all keys: use Web Speech API (shows interim transcript, then sends text via REST)
    // This avoids the silent GeminiVoiceRecorder approach that showed nothing while speaking.
    setIsContinuousVoice(true);
    isContinuousVoiceRef.current = true;
    setAutoSpeak(true);
    startWebSpeechLoop();
  };

  // 1. One-Shot Speech-to-Text (STT): Dictate into input box without continuous loop
  const handleToggleStt = () => {
    // If already listening in STT mode, stop it
    if (isListening && !isContinuousVoice && !isLiveConnected && !isLiveConnecting) {
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.abort();
      }
      setIsListening(false);
      return;
    }

    // Stop any other active voice or live session first
    if (isContinuousVoice || isLiveConnected || isLiveConnecting) {
      setIsContinuousVoice(false);
      isContinuousVoiceRef.current = false;
      clearTimeout(liveConnectionTimeoutRef.current);
      if (geminiLiveRef.current) {
        geminiLiveRef.current.stop();
        geminiLiveRef.current = null;
      }
      setIsLiveConnected(false);
      isLiveConnectedRef.current = false;
      setIsLiveConnecting(false);
    }

    handleStopSpeaking();
    if (!isSpeechRecognitionSupported()) {
      alert('Speech Recognition is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
      return;
    }

    if (speechRecognizerRef.current) speechRecognizerRef.current.abort();
    setIsListening(true);

    speechRecognizerRef.current = new VoiceRecognizer({
      onStart: () => {
        setIsListening(true);
      },
      onResult: ({ transcript }) => {
        // Dictate text directly into input field in real time
        setInputText(transcript);
      },
      onSpeechEnd: (spokenText) => {
        setIsListening(false);
        if (spokenText && spokenText.trim()) {
          setInputText(spokenText.trim());
        }
      },
      onError: (err) => {
        if (err !== 'no-speech') {
          setIsListening(false);
        }
        if (err === 'not-allowed' || err === 'service-not-allowed') {
          alert('Microphone permission was denied. Please allow microphone access to dictate.');
        }
      },
      onEnd: () => {
        setIsListening(false);
      }
    });

    speechRecognizerRef.current.start();
  };

  // 2. Continuous Real-Time Voice Conversation (Live Voice Chat)
  const handleToggleLiveVoice = () => {
    if (isContinuousVoice || isLiveConnected || isLiveConnecting) {
      // Stop continuous voice chat
      setIsContinuousVoice(false);
      isContinuousVoiceRef.current = false;
      clearTimeout(liveConnectionTimeoutRef.current);
      if (geminiLiveRef.current) {
        geminiLiveRef.current.stop();
        geminiLiveRef.current = null;
      }
      if (speechRecognizerRef.current) {
        speechRecognizerRef.current.abort();
      }
      setIsListening(false);
      setIsLiveConnected(false);
      isLiveConnectedRef.current = false;
      setIsLiveConnecting(false);
      setLiveAiTranscript('');
      setLiveUserTranscript('');
      handleStopSpeaking();
      return;
    }

    // If STT was active, cancel it first
    if (isListening && speechRecognizerRef.current) {
      speechRecognizerRef.current.abort();
      setIsListening(false);
    }

    // Start live bidirectional voice
    if (byokConfig.hasKey && byokConfig.provider === 'gemini') {
      startGeminiLive();
    } else {
      startRestListening();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 640;
  const hasCustomPos = Boolean(position && isDesktop);

  return (
    <div
      className={`fixed z-50 select-none pointer-events-auto ${
        hasCustomPos
          ? ''
          : 'inset-0 sm:inset-auto sm:bottom-4 sm:right-4 flex items-end sm:items-auto justify-center sm:justify-end'
      }`}
      style={
        hasCustomPos
          ? { left: `${position.x}px`, top: `${position.y}px` }
          : undefined
      }
      role="dialog"
      aria-label="Sanket AI Chatbot"
    >
      {/* Mobile backdrop overlay */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs sm:hidden -z-10"
        onClick={onClose}
      />

      {/* Main Popup Window */}
      <div
        className={`cartoon-card bg-[#EDF7EC] border-2 border-zinc-900 shadow-cartoon-lg flex flex-col overflow-hidden transition-all duration-200 ${
          isExpanded
            ? 'w-full h-[96dvh] sm:w-[540px] sm:h-[680px] sm:max-h-[90vh]'
            : 'w-full h-[90dvh] max-h-[90dvh] sm:w-[420px] sm:h-[540px] sm:max-h-[85vh]'
        } rounded-t-2xl sm:rounded-2xl`}
      >
        {/* =========================================================================
            1. POPUP TITLE BAR (Movable / Draggable on Desktop)
            ========================================================================= */}
        <div
          onPointerDown={handlePointerDown}
          className="px-3.5 py-2.5 bg-white border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0 sm:cursor-grab active:sm:cursor-grabbing select-none"
          title="Click and drag to move window"
        >
          <div className="flex items-center gap-2 min-w-0">
            <GripHorizontal className="w-3.5 h-3.5 text-zinc-400 hidden sm:block flex-shrink-0" />
            <div className="w-7 h-7 rounded-lg bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
              <Sparkles className="w-3.5 h-3.5 text-zinc-900 fill-zinc-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-xs sm:text-sm text-zinc-900 truncate">
                  Sanket AI
                </h3>
              </div>
              <p className="text-[10px] text-zinc-500 font-bold truncate">
                {currentPage === 'learn'
                  ? `Learn: ${currentSignName} (${extraState.successfulReps || 0}/3 reps)`
                  : currentPage === 'chat'
                  ? `Call: ${extraState.roomId ? `Room ${extraState.roomId}` : 'Direct P2P'}`
                  : 'Context: Home Portal'}
              </p>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* BYOK Key Toggle */}
            <button
              type="button"
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className={`px-2 py-1 text-[11px] font-extrabold rounded-lg border-2 border-zinc-900 flex items-center gap-1 shadow-cartoon-sm transition-all ${
                byokConfig.hasKey
                  ? 'bg-[#DCFCE7] text-[#15803D]'
                  : 'bg-[#FFF9E5] text-zinc-800'
              }`}
              title="Configure AI API Key"
            >
              <Key className="w-3 h-3 stroke-[2.5]" />
              <span className="hidden xs:inline">
                {byokConfig.hasKey
                  ? `Key: ${PROVIDERS.find(p => p.id === byokConfig.provider)?.name?.split(' ')[0] || 'Active'}`
                  : 'Add Key'}
              </span>
              {isSettingsOpen ? (
                <ChevronUp className="w-3 h-3" />
              ) : (
                <ChevronDown className="w-3 h-3" />
              )}
            </button>

            {/* Three Dots (...) More Options Menu */}
            <div className="relative" ref={moreMenuRef}>
              <button
                type="button"
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className={`w-7 h-7 rounded-lg border-2 border-zinc-900 flex items-center justify-center shadow-cartoon-sm transition-all ${
                  isMoreMenuOpen ? 'bg-amber-100' : 'bg-white hover:bg-zinc-100 text-zinc-800'
                }`}
                title="More Tools & Options"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4 stroke-[2.5]" />
              </button>

              {isMoreMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white border-2 border-zinc-900 rounded-xl shadow-cartoon-md p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 mb-1">
                    AI Tools & Options
                  </div>

                  {/* 1. Screen Vision Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleScreenVision();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-sky-50 font-bold text-zinc-800 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-sky-600 flex-shrink-0 stroke-[2.5]" />
                      <div>
                        <div className="font-bold text-xs text-zinc-900">Screen Vision</div>
                        <div className="text-[10px] text-zinc-500 font-normal">Attach screen & video feed</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                      screenVisionEnabled
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                    }`}>
                      {screenVisionEnabled ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  {/* 2. Spoken Voice (TTS) Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      handleToggleAutoSpeak();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-emerald-50 font-bold text-zinc-800 flex items-center justify-between transition-colors cursor-pointer mt-0.5"
                  >
                    <div className="flex items-center gap-2">
                      {autoSpeak ? (
                        <Volume2 className="w-4 h-4 text-emerald-600 flex-shrink-0 stroke-[2.5]" />
                      ) : (
                        <VolumeX className="w-4 h-4 text-zinc-400 flex-shrink-0 stroke-[2]" />
                      )}
                      <div>
                        <div className="font-bold text-xs text-zinc-900">Spoken Voice (TTS)</div>
                        <div className="text-[10px] text-zinc-500 font-normal">Read responses aloud</div>
                      </div>
                    </div>
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded border ${
                      autoSpeak
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                        : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                    }`}>
                      {autoSpeak ? 'ON' : 'OFF'}
                    </span>
                  </button>

                  <div className="border-t border-zinc-100 my-1"></div>

                  {/* 3. Export Transcripts */}
                  <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-zinc-400">
                    Export Chat Transcript
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportChat('txt');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-amber-100/70 font-bold text-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-zinc-900">Plain Text (.txt)</div>
                      <div className="text-[10px] text-zinc-500 font-normal">Fast notepad format</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      handleExportChat('doc');
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-sky-100/70 font-bold text-zinc-800 flex items-center gap-2 mt-0.5 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-zinc-900">Word Document (.doc)</div>
                      <div className="text-[10px] text-zinc-500 font-normal">Formatted Word / Docs</div>
                    </div>
                  </button>

                  <div className="border-t border-zinc-100 my-1"></div>

                  {/* 4. Clear Chat History */}
                  <button
                    type="button"
                    onClick={() => {
                      handleClearChat();
                      setIsMoreMenuOpen(false);
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-rose-50 font-bold text-rose-700 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-rose-600 flex-shrink-0 stroke-[2]" />
                    <div>
                      <div className="font-bold text-xs text-rose-700">Clear Chat History</div>
                      <div className="text-[10px] text-rose-400 font-normal">Reset conversation memory</div>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Expand / Minimize */}
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="hidden sm:flex w-7 h-7 rounded-lg border-2 border-zinc-900 bg-white hover:bg-zinc-100 items-center justify-center shadow-cartoon-sm"
              title={isExpanded ? 'Restore size' : 'Expand window'}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5 stroke-[2] text-zinc-700" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 stroke-[2] text-zinc-700" />
              )}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-lg border-2 border-zinc-900 bg-white hover:bg-[#FEECEC] hover:text-red-600 flex items-center justify-center shadow-cartoon-sm"
              title="Close Chatbot"
            >
              <X className="w-4 h-4 stroke-[2.5] text-zinc-900" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. COLLAPSIBLE BYOK SETTINGS DRAWER
            ========================================================================= */}
        {isSettingsOpen && (
          <div className="bg-white border-b-2 border-zinc-900 p-3 flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-150 flex-shrink-0 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-black text-zinc-900 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-amber-600 stroke-[2.5]" />
                <span>AI API Key Settings</span>
              </span>
              {currentProviderMeta.keyUrl && (
                <a
                  href={currentProviderMeta.keyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] font-bold text-sky-700 hover:text-sky-900 flex items-center gap-0.5 underline"
                >
                  <span>{currentProviderMeta.keyUrlLabel}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              )}
            </div>

            <form onSubmit={handleSaveByok} className="flex flex-col gap-2">
              {/* Provider Selector */}
              <div>
                <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                  AI Provider
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => handleProviderChange(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs font-bold bg-[#FAF8F5] border-2 border-zinc-900 rounded-lg focus:outline-none"
                >
                  {PROVIDERS.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Custom Endpoint Input (shown only for custom / local provider) */}
              {selectedProvider === 'custom' && (
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                    API Endpoint URL
                  </label>
                  <input
                    type="text"
                    value={customEndpoint}
                    onChange={(e) => setCustomEndpoint(e.target.value)}
                    placeholder="http://localhost:11434/v1/chat/completions"
                    className="w-full px-2 py-1 text-xs font-mono font-medium bg-[#FAF8F5] border-2 border-zinc-900 rounded-lg focus:outline-none"
                  />
                </div>
              )}

              {/* API Key Input */}
              <div>
                <label className="text-[10px] font-bold text-zinc-600 block mb-0.5">
                  {currentProviderMeta.name} Key
                </label>
                <div className="relative">
                  <input
                    type={showKeyText ? 'text' : 'password'}
                    value={apiKeyInput}
                    onChange={(e) => setApiKeyInput(e.target.value)}
                    placeholder={currentProviderMeta.keyPlaceholder || 'Enter API Key...'}
                    className="w-full pl-2.5 pr-8 py-1.5 text-xs font-mono font-medium bg-[#FAF8F5] border-2 border-zinc-900 rounded-lg focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeyText(!showKeyText)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-900"
                    title={showKeyText ? 'Hide key' : 'Show key'}
                  >
                    {showKeyText ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Save & Clear Buttons */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 cartoon-btn cartoon-btn-primary !py-1.5 text-xs font-black"
                >
                  Save API Key
                </button>
                {byokConfig.hasKey && (
                  <button
                    type="button"
                    onClick={handleClearByok}
                    className="cartoon-btn !py-1.5 text-xs font-bold text-red-600 hover:bg-red-50"
                  >
                    Remove
                  </button>
                )}
              </div>

              {keySaveMessage && (
                <div className="text-[11px] font-bold text-emerald-700 bg-emerald-50 p-1.5 rounded-lg border border-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{keySaveMessage.text}</span>
                </div>
              )}
            </form>
          </div>
        )}

        {/* =========================================================================
            3. MEMORY OPTION & EXPORT BAR
            ========================================================================= */}
        <div className="px-3 py-1.5 bg-[#E5F3E4] border-b border-zinc-300 flex items-center justify-between text-xs flex-shrink-0">
          <label className="flex items-center gap-1.5 font-bold text-zinc-700 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={saveInMemory}
              onChange={handleToggleMemory}
              className="w-3.5 h-3.5 accent-[#FFD15C] rounded border-2 border-zinc-900 cursor-pointer"
            />
            <Database className="w-3 h-3 text-zinc-600" />
            <span>Save chat in memory</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleExportChat('txt')}
              className="font-bold text-[10px] text-zinc-700 hover:text-amber-800 flex items-center gap-1 hover:underline cursor-pointer"
              title="Save all chat messages as .txt"
            >
              <Download className="w-3 h-3 text-amber-600 stroke-[2.5]" />
              <span>Save .txt</span>
            </button>
            <span className="text-zinc-300 font-normal">|</span>
            <button
              type="button"
              onClick={() => handleExportChat('doc')}
              className="font-bold text-[10px] text-zinc-700 hover:text-sky-800 flex items-center gap-1 hover:underline cursor-pointer"
              title="Save all chat messages as Word .doc"
            >
              <FileDown className="w-3 h-3 text-sky-600 stroke-[2.5]" />
              <span>Save .doc</span>
            </button>
          </div>
        </div>

        {/* Temporary Export Feedback Toast */}
        {exportToast && (
          <div
            className={`px-3 py-1.5 text-[11px] font-bold border-b border-zinc-300 flex items-center justify-between animate-in slide-in-from-top-1 ${
              exportToast.type === 'error'
                ? 'bg-rose-50 text-rose-800'
                : 'bg-emerald-50 text-emerald-800'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-emerald-600" />
              <span>{exportToast.text}</span>
            </span>
            <button
              type="button"
              onClick={() => setExportToast(null)}
              className="text-zinc-400 hover:text-zinc-800 p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* =========================================================================
            4. MESSAGES SCROLL AREA
            ========================================================================= */}
        <div className="flex-1 min-h-0 overflow-y-auto p-3 flex flex-col gap-2.5">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[88%] p-2.5 rounded-xl border-2 border-zinc-900 text-xs leading-relaxed select-text ${
                  msg.role === 'user'
                    ? 'bg-[#FFD15C] text-zinc-900 shadow-cartoon-sm font-semibold rounded-br-xs'
                    : 'bg-white text-zinc-900 shadow-cartoon-sm rounded-bl-xs'
                }`}
              >
                {/* User message screenshot badge or voice badge */}
                {msg.role === 'user' && (msg.hasScreenshot || msg.isVoiceInput) && (
                  <div className="flex items-center gap-2 mb-1 pb-0.5 text-[9px] font-black text-amber-950/70 border-b border-amber-400/40">
                    {msg.isVoiceInput && (
                      <span className="flex items-center gap-0.5 text-rose-900">
                        <Mic className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Voice Question</span>
                      </span>
                    )}
                    {msg.hasScreenshot && (
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-2.5 h-2.5 stroke-[2.5]" />
                        <span>Screen Attached</span>
                      </span>
                    )}
                  </div>
                )}

                {/* Assistant header tag */}
                {msg.role === 'assistant' && (
                  <div className="flex items-center justify-between gap-2 mb-1 pb-1 border-b border-zinc-100 text-[10px] font-black text-zinc-500">
                    <span className="flex items-center gap-1 text-zinc-800">
                      <Sparkles className="w-3 h-3 text-amber-500" />
                      <span>Sanket Guide</span>
                      {msg.modelUsed && (
                        <span className="text-[9px] font-mono font-medium text-amber-950 bg-amber-100 px-1 rounded border border-amber-300">
                          {msg.modelUsed.split('/').pop()}
                        </span>
                      )}
                      {msg.audio && (
                        <span className="text-[9px] font-bold text-rose-800 bg-rose-100 px-1 rounded border border-rose-300 flex items-center gap-0.5">
                          <Radio className="w-2.5 h-2.5 animate-pulse text-rose-600" />
                          <span>Gemini Voice</span>
                        </span>
                      )}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSpeakMessage(msg)}
                        className={`p-0.5 rounded hover:bg-zinc-100 transition-colors cursor-pointer ${
                          activeSpeakingId === msg.id ? 'text-amber-600' : 'text-zinc-400 hover:text-zinc-700'
                        }`}
                        title={activeSpeakingId === msg.id ? "Stop reading aloud" : "Read message aloud"}
                      >
                        {activeSpeakingId === msg.id ? (
                          <VolumeX className="w-3 h-3 stroke-[2.5] animate-pulse" />
                        ) : (
                          <Volume2 className="w-3 h-3 stroke-[2]" />
                        )}
                      </button>
                      <span className="font-mono text-[9px] text-zinc-400">
                        {msg.isFromLlm
                          ? (msg.modelUsed ? msg.modelUsed.split('/').pop() : 'Auto-Model')
                          : 'Page Grounded'}
                      </span>
                    </div>
                  </div>
                )}

                {/* Formatted Text Content */}
                <ChatTextFormatter
                  text={msg.text}
                  isUser={msg.role === 'user'}
                />
              </div>

              {/* Timestamp */}
              <span className="text-[9px] text-zinc-400 mt-0.5 px-1 font-mono">
                {msg.timestamp}
              </span>
            </div>
          ))}

          {/* Thinking / Streaming Indicator */}
          {isLoading && (
            <div className="flex items-start">
              <div className="p-2.5 rounded-xl border-2 border-zinc-900 bg-white shadow-cartoon-sm text-xs flex items-center gap-2 text-zinc-700">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                <span className="font-bold">Sanket AI is thinking...</span>
              </div>
            </div>
          )}

          {/* Live Voice Real-Time Speech Feedback Bubbles */}
          {(liveUserTranscript || liveAiTranscript) && (
            <div className="flex flex-col gap-1.5">
              {liveUserTranscript && (
                <div className="flex justify-end">
                  <div className="max-w-[85%] p-2 rounded-xl border-2 border-zinc-900 bg-[#FFF9E5] text-xs text-zinc-900 shadow-cartoon-sm flex items-center gap-1.5">
                    <Mic className="w-3 h-3 text-rose-600 animate-pulse flex-shrink-0" />
                    <span className="italic font-medium">{liveUserTranscript}</span>
                  </div>
                </div>
              )}
              {liveAiTranscript && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] p-2 rounded-xl border-2 border-zinc-900 bg-white text-xs text-zinc-900 shadow-cartoon-sm flex items-center gap-1.5">
                    <Radio className="w-3 h-3 text-rose-600 animate-pulse flex-shrink-0" />
                    <span className="font-semibold text-zinc-800">{liveAiTranscript}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* =========================================================================
            5. CONTEXTUAL ACTION PILLS & QUICK SUGGESTION CHIPS
            ========================================================================= */}
        <div className="px-3 py-1 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 no-scrollbar">
          {/* Dedicated action button: What's on my screen? */}
          {!isLoading && (
            <button
              type="button"
              onClick={handleAskAboutScreen}
              disabled={isCapturingScreen}
              className="cartoon-badge !py-1 !px-2.5 text-[10px] font-black bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border-2 border-zinc-900 transition-colors flex-shrink-0 cursor-pointer shadow-cartoon-sm flex items-center gap-1"
              title="Instant multimodal screen snapshot: Ask Sanket AI what is on your screen"
            >
              <Eye className="w-3 h-3 stroke-[2.5]" />
              <span>What's on my screen?</span>
            </button>
          )}

          {/* Dedicated action button for Chat page */}
          {currentPage === 'chat' && !isLoading && (
            <button
              type="button"
              onClick={() => handleSendMessage('Fetch call chat and summarize recent messages')}
              className="cartoon-badge !py-1 !px-2.5 text-[10px] font-black bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border-2 border-zinc-900 transition-colors flex-shrink-0 cursor-pointer shadow-cartoon-sm flex items-center gap-1.5"
              title="Inspect and summarize messages exchanged in this call"
            >
              <MessageSquare className="w-3 h-3 stroke-[2.5]" />
              <span>Fetch Call Chat</span>
            </button>
          )}

          {/* Dedicated action button for Learn page */}
          {currentPage === 'learn' && !isLoading && (
            <button
              type="button"
              onClick={() => handleSendMessage(`How do I sign ${currentSignName} step-by-step?`)}
              className="cartoon-badge !py-1 !px-2.5 text-[10px] font-black bg-[#FFF9E5] hover:bg-[#FFD15C] text-zinc-900 border-2 border-zinc-900 transition-colors flex-shrink-0 cursor-pointer shadow-cartoon-sm flex items-center gap-1.5"
              title={`Get step-by-step physical instructions for ${currentSignName}`}
            >
              <BookOpen className="w-3 h-3 stroke-[2.5]" />
              <span>How to Sign {currentSignName}</span>
            </button>
          )}

          {/* Quick Prompts (shown when <= 4 messages) */}
          {messages.length <= 4 && !isLoading && quickPrompts.filter(p => !p.includes('What is on my screen')).map((prompt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleSendMessage(prompt)}
              className="cartoon-badge !py-1 !px-2 text-[10px] font-bold bg-white hover:bg-[#FFF9E5] hover:border-zinc-900 transition-colors flex-shrink-0 cursor-pointer"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* =========================================================================
            6. MESSAGE INPUT BAR
            ========================================================================= */}
        <div className="p-2.5 bg-white border-t-2 border-zinc-900 flex-shrink-0">
          {/* Subtle Screen Capture Feedback */}
          {isCapturingScreen && (
            <div className="mb-2 px-2.5 py-1 bg-sky-50 border-2 border-sky-400 rounded-xl flex items-center gap-2 text-[11px] text-sky-950 font-bold animate-pulse">
              <Eye className="w-3.5 h-3.5 text-sky-600 animate-spin" />
              <span>Capturing screen snapshot for Gemini multimodal analysis...</span>
            </div>
          )}

          <div className="flex items-center gap-1.5">
            {/* Instant Screen Analysis Button */}
            <button
              type="button"
              onClick={handleAskAboutScreen}
              disabled={isLoading || isCapturingScreen}
              className={`cartoon-btn !py-1.5 !px-2 text-xs font-black flex items-center justify-center transition-all ${
                isCapturingScreen ? 'bg-sky-200 text-sky-950 animate-pulse' : 'bg-white hover:bg-sky-50 text-sky-800'
              }`}
              title="Instant Screen Vision: Inspect camera & DOM"
            >
              <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {/* Input Field */}
            <div className="relative flex-1 flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  isLiveConnecting
                    ? 'Connecting to Gemini Live...'
                    : isLiveConnected
                    ? (isSpeaking ? 'Gemini is speaking aloud...' : 'Gemini Live active — speak anytime...')
                    : isListening
                    ? (inputText || 'Listening... speak to dictate')
                    : isSpeaking
                    ? 'Speaking answer aloud...'
                    : isLoading
                    ? 'Sanket AI is thinking...'
                    : 'Ask or dictate about this page or signs...'
                }
                disabled={isLoading}
                className="w-full pl-3 pr-8 py-1.5 text-xs font-semibold bg-[#FAF8F5] border-2 border-zinc-900 rounded-xl focus:outline-none focus:shadow-cartoon-sm disabled:opacity-50"
              />

              {/* 1. Speech-to-Text (STT) Inline Microphone Dictation Icon */}
              <button
                type="button"
                onClick={handleToggleStt}
                disabled={isLoading}
                className={`absolute right-1.5 p-1 rounded-lg transition-all ${
                  isListening && !isContinuousVoice && !isLiveConnected
                    ? 'text-rose-600 bg-rose-100 animate-pulse'
                    : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200/60'
                }`}
                title={
                  isListening && !isContinuousVoice && !isLiveConnected
                    ? 'Dictation active (speaking converts to text). Click to stop.'
                    : 'Speech-to-Text: Dictate message into input bar'
                }
                aria-label="Dictate message with microphone"
              >
                {isListening && !isContinuousVoice && !isLiveConnected ? (
                  <Mic className="w-3.5 h-3.5 stroke-[2.5] text-rose-600 animate-bounce" />
                ) : (
                  <Mic className="w-3.5 h-3.5 stroke-[2]" />
                )}
              </button>
            </div>

            {/* Text Send Button */}
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="cartoon-btn cartoon-btn-primary !py-1.5 !px-3 text-xs font-black disabled:opacity-40"
              title="Send text message"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>

            {/* 2. Live Bidirectional Voice Chat Callout Button (Circular waveform with sparkle) */}
            <button
              type="button"
              onClick={handleToggleLiveVoice}
              disabled={isLoading}
              className={`relative rounded-full p-2 border-2 border-zinc-900 transition-all flex items-center justify-center flex-shrink-0 cursor-pointer ${
                isLiveConnecting
                  ? 'bg-amber-400 text-white animate-pulse border-amber-950 shadow-cartoon-sm'
                  : isLiveConnected
                  ? 'bg-rose-500 text-white animate-pulse border-rose-950 shadow-cartoon-sm'
                  : isContinuousVoice
                  ? 'bg-emerald-500 text-white animate-pulse border-emerald-950 shadow-cartoon-sm'
                  : 'bg-white hover:bg-[#FFF9E5] text-zinc-900 hover:border-zinc-950 shadow-cartoon-sm active:scale-95'
              }`}
              title={
                isLiveConnecting
                  ? 'Connecting to Gemini Live Voice Chat...'
                  : isLiveConnected
                  ? 'Gemini Live Voice Chat active. Click to end voice conversation.'
                  : isContinuousVoice
                  ? 'Voice chat active. Click to end conversation.'
                  : 'Start Live Voice Chat (Real-time spoken AI conversation)'
              }
              aria-label="Start Real-Time Voice Conversation"
            >
              <div className="relative flex items-center justify-center">
                <AudioWaveform className={`w-4 h-4 stroke-[2.2] ${
                  isLiveConnected || isContinuousVoice ? 'text-white animate-pulse' : 'text-zinc-900'
                }`} />
                <Sparkles className="w-2 h-2 text-amber-500 fill-amber-500 absolute -top-1 -right-1" />
              </div>
            </button>
          </div>

          <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-400 font-semibold px-0.5">
            <div className="flex items-center gap-2">
              <span>
                {isLiveConnecting
                  ? 'Connecting to Gemini Live...'
                  : isLiveConnected
                  ? 'Gemini Real-Time Voice Active'
                  : isContinuousVoice
                  ? 'Voice Loop Active'
                  : 'Enter or speak to send'}
              </span>
              {autoSpeak && !isContinuousVoice && (
                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                  <Volume2 className="w-2.5 h-2.5" />
                  <span>Voice On</span>
                </span>
              )}
              {screenVisionEnabled && (
                <span className="text-sky-700 font-bold flex items-center gap-0.5">
                  <Eye className="w-2.5 h-2.5" />
                  <span>Screen Vision</span>
                </span>
              )}
            </div>
            <span>
              {byokConfig.hasKey ? (
                <span className="text-emerald-600 font-bold">
                  ✓ API Key Active
                </span>
              ) : (
                <span className="text-zinc-500">
                  Offline mode • Add API key for live LLM
                </span>
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomeChatbotPopup;
