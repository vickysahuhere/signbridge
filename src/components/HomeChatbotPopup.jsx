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
  FileDown
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
import { PAGE_DEFINITIONS } from '../utils/pageContextManager.js';
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
  const [selectedModel, setSelectedModel] = useState(() => byokConfig.model || 'gemini-1.5-flash');
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
      return `👋 **Namaste! I am your Sanket AI Guide.**\n\nYou are in **Learn ISL Studio** practicing: **${currentSignName}**.\n\n• Progress: **${extraState.successfulReps || 0} of 3 repetitions**\n• Need help? Ask *"How do I sign ${currentSignName} step-by-step?"* or select a topic below!`;
    }
    if (currentPage === 'chat') {
      return `👋 **Namaste! I am your Sanket AI Guide.**\n\nYou are in **Video Call & Sign Translator** (Room: \`${extraState.roomId || 'Direct P2P'}\`).\n\n• I can help you with signs, explain grammar rules, and **fetch recent call chat** whenever you ask!\n• Ask *"What was said in the chat?"* or click **Fetch Call Chat** below.`;
    }
    return `👋 **Namaste! I am your Sanket AI Guide.**\n\nI have information about everything on this page: **Learn ISL Studio**, **Real-Time Video Calls**, the **1,000+ Word Dictionary**, and our **100% On-Device Privacy Architecture**.\n\nAsk me any question below, or select a quick topic!`;
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
  const [exportToast, setExportToast] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const exportMenuRef = useRef(null);

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

  // Click outside listener for export dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target)) {
        setIsExportMenuOpen(false);
      }
    }
    if (isExportMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isExportMenuOpen]);

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

  // Quick Prompt Chips dynamically adapted to current page
  const quickPrompts = useMemo(() => {
    if (currentPage === 'learn') {
      return [
        `How do I sign ${currentSignName} step-by-step?`,
        `What is the target posture for ${currentSignName}?`,
        'How does the 3-repetition loop work?',
        'How to fingerspell Alphabet A–Z?'
      ];
    }
    if (currentPage === 'chat') {
      return [
        '📥 Fetch recent call chat messages',
        'How does the 1.2s hands-free pause work?',
        'How do I sign Thank You or Help?',
        'Where are my video frames sent?'
      ];
    }
    return [
      'What can I do on this page?',
      'How do I practice Namaste in Learn Studio?',
      'How does the translated video call work?',
      'Is my camera video uploaded anywhere?'
    ];
  }, [currentPage, currentSignName]);

  // Send Message Handler
  const handleSendMessage = async (textToSend) => {
    const query = (textToSend || inputText).trim();
    if (!query || isLoading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response = await sendChatbotMessage({
        message: query,
        history: newMessages.map(m => ({ role: m.role, text: m.text })),
        page: currentPage,
        extraState
      });

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromLlm: response.isFromLlm,
        provider: response.provider,
        modelUsed: response.modelUsed
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          role: 'assistant',
          text: `⚠️ An unexpected error occurred: ${err.message}. Please try again.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
    } finally {
      setIsLoading(false);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 sm:inset-auto sm:bottom-4 sm:right-4 z-50 flex items-end sm:items-auto justify-center sm:justify-end select-none pointer-events-auto"
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
            ? 'w-full h-full sm:w-[540px] sm:h-[680px] sm:max-h-[90vh]'
            : 'w-full h-[520px] sm:w-[420px] sm:h-[540px] sm:max-h-[85vh]'
        } rounded-t-2xl sm:rounded-2xl`}
      >
        {/* =========================================================================
            1. POPUP TITLE BAR
            ========================================================================= */}
        <div className="px-3.5 py-2.5 bg-white border-b-2 border-zinc-900 flex items-center justify-between gap-2 flex-shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-[#FFD15C] border-2 border-zinc-900 flex items-center justify-center flex-shrink-0 shadow-cartoon-sm">
              <Sparkles className="w-3.5 h-3.5 text-zinc-900 fill-zinc-900" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-black text-xs sm:text-sm text-zinc-900 truncate">
                  Sanket AI
                </h3>
                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-200 text-amber-950 border border-amber-500/60">
                  BYOK
                </span>
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
              title="Configure Bring-Your-Own-Key (BYOK)"
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

            {/* Clear Chat */}
            <button
              type="button"
              onClick={handleClearChat}
              className="w-7 h-7 rounded-lg border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center justify-center shadow-cartoon-sm"
              title="Clear chat messages"
            >
              <Trash2 className="w-3.5 h-3.5 stroke-[2] text-zinc-600 hover:text-red-600" />
            </button>

            {/* Export / Save Chat Dropdown */}
            <div className="relative" ref={exportMenuRef}>
              <button
                type="button"
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="h-7 px-2 rounded-lg border-2 border-zinc-900 bg-white hover:bg-zinc-100 flex items-center gap-1 shadow-cartoon-sm text-[11px] font-extrabold text-zinc-800"
                title="Save / Export all chats"
              >
                <Download className="w-3.5 h-3.5 stroke-[2.5] text-amber-600" />
                <span className="hidden xs:inline">Save</span>
                <ChevronDown className="w-2.5 h-2.5 text-zinc-500" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white border-2 border-zinc-900 rounded-xl shadow-cartoon-md p-1.5 z-50 animate-in fade-in zoom-in-95 duration-100 text-xs">
                  <div className="px-2 py-1 text-[9px] font-black uppercase tracking-wider text-zinc-400 border-b border-zinc-100 mb-1">
                    Export Chat Transcript
                  </div>
                  <button
                    type="button"
                    onClick={() => handleExportChat('txt')}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-amber-100/70 font-bold text-zinc-800 flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-amber-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-zinc-900">Plain Text (.txt)</div>
                      <div className="text-[10px] text-zinc-500 font-normal">Clean, fast notepad format</div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleExportChat('doc')}
                    className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-sky-100/70 font-bold text-zinc-800 flex items-center gap-2 mt-1 transition-colors cursor-pointer"
                  >
                    <FileDown className="w-4 h-4 text-sky-600 flex-shrink-0" />
                    <div>
                      <div className="font-bold text-xs text-zinc-900">Word Document (.doc)</div>
                      <div className="text-[10px] text-zinc-500 font-normal">Formatted Word / Google Docs</div>
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
                <span>Bring Your Own Key (BYOK)</span>
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

            <p className="text-[11px] text-zinc-600 font-medium leading-relaxed">
              Your API key is stored <strong>100% locally in your browser</strong>. It is never sent to any Sanket backend or cloud server.
            </p>

            <form onSubmit={handleSaveByok} className="flex flex-col gap-2">
              {/* Provider Selector & Auto-Model Discovery Indicator */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

                <div>
                  <label className="text-[10px] font-bold text-zinc-600 block mb-0.5 flex items-center justify-between">
                    <span>Model Selection</span>
                    <span className="text-[9px] text-emerald-800 font-extrabold bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-400">
                      ⚡ Auto-Managed
                    </span>
                  </label>
                  <div className="w-full px-2 py-1 text-[11px] font-bold text-zinc-800 bg-amber-50/80 border-2 border-zinc-900 rounded-lg flex items-center gap-1.5 min-h-[32px]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 animate-pulse" />
                    <span className="truncate">Auto-detects working model</span>
                  </div>
                </div>
              </div>

              {/* Informative Auto-Discovery Helper */}
              <div className="bg-[#FAF8F5] p-2 rounded-lg border border-zinc-300 text-[10px] text-zinc-600 leading-relaxed">
                🤖 <strong>Auto-Fallback Active</strong>: You don't need to choose models! Sanket automatically tests and falls back across active models ({selectedProvider === 'groq' ? 'Llama 3.3 70B, Llama 3.1 8B, DeepSeek R1' : selectedProvider === 'openrouter' ? 'Llama 3.3 Free, Gemini 2.0 Free, DeepSeek V3' : 'Gemini 1.5/2.0 Flash & Pro'}) to ensure your chat never breaks.
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
                  <p className="text-[9px] text-zinc-400 mt-0.5">
                    Supports Ollama, LM Studio, vLLM, or any custom OpenAI-compatible server.
                  </p>
                </div>
              )}

              {/* API Key Input */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="text-[10px] font-bold text-zinc-600">
                    {currentProviderMeta.name} Key
                  </label>
                  {currentProviderMeta.keyPrefix && (
                    <span className="text-[9px] font-bold text-zinc-400 font-mono">
                      Prefix: {currentProviderMeta.keyPrefix}
                    </span>
                  )}
                </div>
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
                  className="flex-1 cartoon-btn cartoon-btn-primary !py-1 text-xs font-black"
                >
                  Save API Key
                </button>
                {byokConfig.hasKey && (
                  <button
                    type="button"
                    onClick={handleClearByok}
                    className="cartoon-btn !py-1 text-xs font-bold text-red-600 hover:bg-red-50"
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
                    </span>
                    <span className="font-mono text-[9px] text-zinc-400">
                      {msg.isFromLlm
                        ? (msg.modelUsed ? msg.modelUsed.split('/').pop() : 'Auto-Model')
                        : 'Page Grounded'}
                    </span>
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

          <div ref={messagesEndRef} />
        </div>

        {/* =========================================================================
            5. CONTEXTUAL ACTION PILLS & QUICK SUGGESTION CHIPS
            ========================================================================= */}
        <div className="px-3 py-1 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 no-scrollbar">
          {/* Dedicated action button for Chat page */}
          {currentPage === 'chat' && !isLoading && (
            <button
              type="button"
              onClick={() => handleSendMessage('Fetch call chat and summarize recent messages')}
              className="cartoon-badge !py-1 !px-2.5 text-[10px] font-black bg-[#E0F2FE] hover:bg-[#BAE6FD] text-[#0369A1] border-2 border-zinc-900 transition-colors flex-shrink-0 cursor-pointer shadow-cartoon-sm flex items-center gap-1"
              title="Inspect and summarize messages exchanged in this call"
            >
              <span>📥 Fetch Call Chat</span>
            </button>
          )}

          {/* Dedicated action button for Learn page */}
          {currentPage === 'learn' && !isLoading && (
            <button
              type="button"
              onClick={() => handleSendMessage(`How do I sign ${currentSignName} step-by-step?`)}
              className="cartoon-badge !py-1 !px-2.5 text-[10px] font-black bg-[#FFF9E5] hover:bg-[#FFD15C] text-zinc-900 border-2 border-zinc-900 transition-colors flex-shrink-0 cursor-pointer shadow-cartoon-sm flex items-center gap-1"
              title={`Get step-by-step physical instructions for ${currentSignName}`}
            >
              <span>👉 How to Sign {currentSignName}</span>
            </button>
          )}

          {/* Quick Prompts (shown when <= 4 messages) */}
          {messages.length <= 4 && !isLoading && quickPrompts.map((prompt, i) => (
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
          <div className="flex items-center gap-1.5">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about this page or signs..."
              disabled={isLoading}
              className="flex-1 px-3 py-1.5 text-xs font-semibold bg-[#FAF8F5] border-2 border-zinc-900 rounded-xl focus:outline-none focus:shadow-cartoon-sm disabled:opacity-50"
            />
            <button
              type="button"
              onClick={() => handleSendMessage()}
              disabled={!inputText.trim() || isLoading}
              className="cartoon-btn cartoon-btn-primary !py-1.5 !px-3 text-xs font-black disabled:opacity-40"
              title="Send message"
            >
              <Send className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          <div className="mt-1 flex items-center justify-between text-[10px] text-zinc-400 font-semibold px-0.5">
            <span>Enter to send</span>
            <span>
              {byokConfig.hasKey ? (
                <span className="text-emerald-600 font-bold">
                  ✓ BYOK Key Active
                </span>
              ) : (
                <span className="text-zinc-500">
                  Offline mode • Enter BYOK key for LLM
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
