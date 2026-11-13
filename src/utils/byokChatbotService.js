/**
 * byokChatbotService.js
 * 
 * Bring-Your-Own-Key (BYOK) Client-Side Chatbot Service for Sanket ISL.
 * 
 * STRICT INVARIANTS:
 * 1. 100% In-Browser Execution — No intermediate Node or Python backend servers.
 * 2. Privacy Preserving — API keys and chat messages are stored locally in the user's browser.
 * 3. Page Context Grounding — Injects knowledge of the active page and features into each conversation.
 * 4. Memory Management — Option to persist chat history locally or keep volatile in-memory.
 */

import { buildPageSystemInstruction, PAGE_DEFINITIONS, getSignStepByStepGuide } from './pageContextManager.js';

export const STORAGE_KEYS = {
  API_KEY: 'sanket_chatbot_byok_api_key',
  PROVIDER: 'sanket_chatbot_byok_provider',
  MODEL: 'sanket_chatbot_byok_model',
  ENDPOINT: 'sanket_chatbot_byok_endpoint',
  SAVE_MEMORY: 'sanket_chatbot_save_memory',
  HISTORY: 'sanket_chatbot_history'
};

export const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Google Gemini',
    badge: 'Free Tier',
    keyPrefix: 'AIzaSy',
    keyPlaceholder: 'AIzaSy...',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyUrlLabel: 'Get Free Gemini Key',
    defaultModel: 'gemini-3.5-flash-lite',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta',
    models: [
      { id: 'gemini-3.5-flash-lite', name: 'Gemini 3.5 Flash-Lite (Recommended, Ultra-Fast)' },
      { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
      { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash' },
      { id: 'gemini-3.8-flash', name: 'Gemini 3.8 Flash' }
    ]
  },
  {
    id: 'groq',
    name: 'Groq Cloud',
    badge: 'Ultra-Fast',
    keyPrefix: 'gsk_',
    keyPlaceholder: 'gsk_...',
    keyUrl: 'https://console.groq.com/keys',
    keyUrlLabel: 'Get Free Groq Key',
    defaultModel: 'llama-3.3-70b-versatile',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    models: [
      { id: 'llama-3.3-70b-versatile', name: 'Llama 3.3 70B Versatile (Flagship)' },
      { id: 'llama-3.1-8b-instant', name: 'Llama 3.1 8B Instant (Ultra-Fast)' },
      { id: 'deepseek-r1-distill-llama-70b', name: 'DeepSeek R1 Distill 70B (Reasoning)' },
      { id: 'qwen-2.5-32b', name: 'Qwen 2.5 32B Instruct' }
    ]
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    badge: 'Multi-Model',
    keyPrefix: 'sk-or-',
    keyPlaceholder: 'sk-or-v1-...',
    keyUrl: 'https://openrouter.ai/keys',
    keyUrlLabel: 'Get OpenRouter Key',
    defaultModel: 'meta-llama/llama-3.3-70b-instruct:free',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    models: [
      { id: 'meta-llama/llama-3.3-70b-instruct:free', name: 'Llama 3.3 70B (Free Tier)' },
      { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free Tier)' },
      { id: 'deepseek/deepseek-chat', name: 'DeepSeek V3' },
      { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1' },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Meta Llama 3.3 70B' },
      { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet' },
      { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini' }
    ]
  },
  {
    id: 'openai',
    name: 'OpenAI Direct',
    badge: 'Standard',
    keyPrefix: 'sk-',
    keyPlaceholder: 'sk-...',
    keyUrl: 'https://platform.openai.com/api-keys',
    keyUrlLabel: 'Get OpenAI Key',
    defaultModel: 'gpt-4o-mini',
    endpoint: 'https://api.openai.com/v1/chat/completions',
    models: [
      { id: 'gpt-4o-mini', name: 'GPT-4o Mini (Fast & Cheap)' },
      { id: 'gpt-4o', name: 'GPT-4o (Omni Flagship)' }
    ]
  },
  {
    id: 'custom',
    name: 'Custom / Local (Ollama, LM Studio)',
    badge: 'Local AI',
    keyPrefix: '',
    keyPlaceholder: 'Optional API Key (or leave blank)',
    keyUrl: 'https://ollama.com',
    keyUrlLabel: 'Ollama Setup Guide',
    defaultModel: 'llama3',
    endpoint: 'http://localhost:11434/v1/chat/completions',
    models: [
      { id: 'llama3', name: 'Llama 3 (Local)' },
      { id: 'mistral', name: 'Mistral (Local)' },
      { id: 'qwen2.5', name: 'Qwen 2.5 (Local)' }
    ]
  }
];

export const SUPPORTED_MODELS = PROVIDERS.flatMap(p =>
  p.models.map(m => ({
    id: m.id,
    name: `${m.name}`,
    provider: p.id
  }))
);

/**
 * Priority candidate models to automatically discover and use per provider.
 * The system automatically cascades through these models until finding an active, responsive one.
 */
export const PROVIDER_CANDIDATE_MODELS = {
  gemini: [
    'gemini-3.5-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.5-flash',
    'gemini-3.8-flash',
    'gemma-4-26b-a4b-it'
  ],
  groq: [
    'llama-3.3-70b-versatile',
    'llama-3.1-8b-instant',
    'deepseek-r1-distill-llama-70b',
    'qwen-2.5-32b'
  ],
  openrouter: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemini-2.0-flash-exp:free',
    'deepseek/deepseek-chat',
    'deepseek/deepseek-r1',
    'meta-llama/llama-3.3-70b-instruct',
    'openai/gpt-4o-mini',
    'anthropic/claude-3.5-sonnet'
  ],
  openai: ['gpt-4o-mini', 'gpt-4o', 'gpt-3.5-turbo'],
  custom: ['llama3', 'mistral', 'qwen2.5', 'default']
};

export const workingModelCache = new Map();
const fetchedModelsCache = new Map();

/**
 * Cleans internal thinking, scratchpad reasoning, and draft monologues
 * emitted by reasoning models (DeepSeek R1, Gemma, Qwen, etc.) so only the
 * clean final answer is delivered to the user.
 *
 * @param {string} text - Raw model output
 * @returns {string} Stripped clean response text
 */
export function cleanModelOutput(text = '') {
  if (!text || typeof text !== 'string') return '';
  let cleaned = text.trim();

  // 1. Strip standard <think>...</think> or <thought>...</thought> tags
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  cleaned = cleaned.replace(/<thought>[\s\S]*?<\/thought>/gi, '').trim();

  // 2. Strip raw scratchpad reasoning monologues (e.g. Gemma/DeepSeek echoing internal prompt breakdown)
  // Example pattern:
  // "gemma-4-26b-a4b-it\nUser says: ...\nContext: ...\nRules: ...\nGreeting: ...Hello! I'm Sanket AI..."
  if (
    /^(gemma|[a-z0-9_-]+)?\s*(User says:|Context:|Persona:|Rules:|I need to respond)/i.test(cleaned) ||
    (cleaned.includes('User says:') && cleaned.includes('Persona:'))
  ) {
    // Check if there is an unquoted final greeting or reply transition
    const lastHello = cleaned.lastIndexOf("Hello! I'm");
    const lastHi = cleaned.lastIndexOf("Hi! I'm");
    const lastSanket = cleaned.lastIndexOf("I'm Sanket AI");

    const splitPos = Math.max(lastHello, lastHi, lastSanket);
    if (splitPos !== -1) {
      cleaned = cleaned.substring(splitPos).trim();
    } else {
      // Filter out scratchpad metadata lines
      const lines = cleaned.split('\n');
      const valid = [];
      let pastScratchpad = false;
      for (const line of lines) {
        const trimmed = line.trim();
        if (!pastScratchpad) {
          if (
            /^(User says:|Context:|Current Active Sign:|Persona:|The user is|I need to|I should|Rules:|Greeting:|Status:|Keep it)/i.test(trimmed) ||
            /^[a-z0-9_.-]+$/i.test(trimmed) ||
            (trimmed.startsWith('"') && trimmed.endsWith('"'))
          ) {
            continue;
          }
          pastScratchpad = true;
        }
        if (pastScratchpad) {
          valid.push(line);
        }
      }
      if (valid.length > 0) {
        cleaned = valid.join('\n').trim();
      }
    }
  }

  return cleaned || text.trim();
}

export function getWorkingModel(provider = 'gemini') {
  return workingModelCache.get(provider) || PROVIDER_CANDIDATE_MODELS[provider]?.[0] || 'auto';
}

export function setWorkingModel(provider, model) {
  if (provider && model) {
    workingModelCache.set(provider, model);
  }
}

/**
 * Prunes and compresses chat history to minimize token consumption:
 * 1. Retains only the most recent `maxTurns` (default: 6 messages, e.g. 3 back-and-forth turns).
 * 2. Compresses older assistant responses exceeding `maxAssistantChars` (default: 280 chars),
 *    preventing historical essay responses from quadratic token bloat.
 * 3. Keeps user's past prompts intact so contextual intent is preserved.
 *
 * @param {Array} history - Full chat history
 * @param {number} [maxTurns=6] - Number of recent turns to retain
 * @param {number} [maxAssistantChars=280] - Max character length for older assistant turns
 * @returns {Array} Token-optimized history array
 */
export function pruneHistoryForTokenEfficiency(history = [], maxTurns = 6, maxAssistantChars = 280) {
  if (!Array.isArray(history) || history.length === 0) return [];

  // Window to the most recent turns
  const recent = history.slice(-maxTurns);

  return recent.map((item, idx) => {
    if (!item || !item.text) return item;

    // For assistant messages (except the very last turn if it's right before user), compress length
    if (item.role === 'assistant' && item.text.length > maxAssistantChars && idx < recent.length - 1) {
      return {
        ...item,
        text: item.text.slice(0, maxAssistantChars).trim() + '... [truncated for context]'
      };
    }
    return item;
  });
}

/**
 * Ensures message history strictly follows the required alternating conversation pattern:
 * system (optional, first) -> user -> assistant -> user -> ...
 * Drops leading assistant messages (e.g. initial welcome greeting), merges duplicate adjacent roles,
 * prunes history for token efficiency, and ensures the payload ends with the current user message.
 */
export function buildAlternatingChatMessages(
  systemInstruction,
  history = [],
  currentMessage = '',
  options = {}
) {
  const maxTurns = options.maxTurns ?? 6;
  const maxAssistantChars = options.maxAssistantChars ?? 280;
  const optimizedHistory = pruneHistoryForTokenEfficiency(history, maxTurns, maxAssistantChars);

  const result = [];
  if (systemInstruction) {
    result.push({ role: 'system', content: systemInstruction });
  }

  const turns = [];
  for (const h of optimizedHistory) {
    if (!h.text || !h.text.trim()) continue;
    // Skip leading assistant messages (e.g. welcome greeting) before any user turn
    if (turns.length === 0 && h.role === 'assistant') continue;

    const role = h.role === 'assistant' ? 'assistant' : 'user';
    const last = turns[turns.length - 1];
    if (last && last.role === role) {
      last.content += '\n' + h.text.trim();
    } else {
      turns.push({ role, content: h.text.trim() });
    }
  }

  // Append current user message
  if (currentMessage && currentMessage.trim()) {
    const last = turns[turns.length - 1];
    if (last && last.role === 'user') {
      last.content += '\n' + currentMessage.trim();
    } else {
      turns.push({ role: 'user', content: currentMessage.trim() });
    }
  }

  return [...result, ...turns];
}

/**
 * Dynamically queries the provider's /models endpoint to fetch active, supported models live.
 */
export async function fetchLiveActiveModels(provider, apiKey) {
  if (!apiKey || !apiKey.trim()) return null;
  const cacheKey = `${provider}:${apiKey.slice(-6)}`;
  if (fetchedModelsCache.has(cacheKey)) {
    return fetchedModelsCache.get(cacheKey);
  }

  try {
    let modelsUrl = '';
    const headers = { 'Authorization': `Bearer ${apiKey.trim()}` };

    if (provider === 'gemini') {
      modelsUrl = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`;
      const res = await fetch(modelsUrl);
      if (res.ok) {
        const data = await res.json();
        const modelList = Array.isArray(data?.models) ? data.models : [];
        const activeChatModels = modelList
          .filter(m => {
            const methods = m.supportedGenerationMethods || [];
            return methods.includes('generateContent');
          })
          .map(m => (m.name || '').replace(/^models\//, ''))
          .filter(Boolean);

        if (activeChatModels.length > 0) {
          fetchedModelsCache.set(cacheKey, activeChatModels);
          return activeChatModels;
        }
      }
      return null;
    } else if (provider === 'groq') {
      modelsUrl = 'https://api.groq.com/openai/v1/models';
    } else if (provider === 'openrouter') {
      modelsUrl = 'https://openrouter.ai/api/v1/models';
    } else {
      return null;
    }

    const res = await fetch(modelsUrl, { headers });
    if (!res.ok) return null;

    const data = await res.json();
    const modelList = Array.isArray(data?.data) ? data.data : [];

    const activeChatModels = modelList
      .filter(m => {
        const id = (m.id || '').toLowerCase();
        if (m.active === false) return false;
        // Skip audio, vision-only, embeddings, moderation/guardrails
        if (
          id.includes('whisper') ||
          id.includes('tts') ||
          id.includes('orpheus') ||
          id.includes('guard') ||
          id.includes('safeguard') ||
          id.includes('embed') ||
          id.includes('decommissioned')
        ) {
          return false;
        }
        return true;
      })
      .map(m => m.id);

    if (activeChatModels.length > 0) {
      fetchedModelsCache.set(cacheKey, activeChatModels);
      return activeChatModels;
    }
  } catch (err) {
    console.warn(`[BYOK] Live models lookup for ${provider} skipped:`, err.message);
  }

  return null;
}

const fallbackMemoryStore = new Map();

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    try {
      const testKey = '__sanket_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return window.localStorage;
    } catch (e) {
      // Private mode or storage blocked
    }
  }
  return {
    getItem: (k) => (fallbackMemoryStore.has(k) ? fallbackMemoryStore.get(k) : null),
    setItem: (k, v) => fallbackMemoryStore.set(k, String(v)),
    removeItem: (k) => fallbackMemoryStore.delete(k),
    clear: () => fallbackMemoryStore.clear()
  };
}

export function getByokConfig() {
  try {
    const storage = getStorage();
    const apiKey = storage.getItem(STORAGE_KEYS.API_KEY) || '';
    const provider = storage.getItem(STORAGE_KEYS.PROVIDER) || 'gemini';
    let model = storage.getItem(STORAGE_KEYS.MODEL) || 'gemini-3.5-flash-lite';
    // Automatically upgrade ancient decommissioned Gemini 1.0 models to the active production model
    if (provider === 'gemini' && (model === 'gemini-1.0-pro' || model === 'gemini-1.5-pro' || model === 'gemini-pro')) {
      model = 'gemini-3.5-flash-lite';
      storage.setItem(STORAGE_KEYS.MODEL, 'gemini-3.5-flash-lite');
    }
    const endpoint = storage.getItem(STORAGE_KEYS.ENDPOINT) || '';

    return {
      apiKey,
      provider,
      model,
      endpoint,
      hasKey: Boolean(apiKey.trim())
    };
  } catch (err) {
    return {
      apiKey: '',
      provider: 'gemini',
      model: 'gemini-2.5-flash',
      endpoint: '',
      hasKey: false
    };
  }
}

export function saveByokConfig({ apiKey, provider = 'gemini', model = 'gemini-3.5-flash-lite', endpoint = '' }) {
  try {
    const storage = getStorage();
    if (apiKey !== undefined) {
      if (apiKey) {
        storage.setItem(STORAGE_KEYS.API_KEY, apiKey.trim());
      } else {
        storage.removeItem(STORAGE_KEYS.API_KEY);
      }
    }
    if (provider) storage.setItem(STORAGE_KEYS.PROVIDER, provider);
    if (model) storage.setItem(STORAGE_KEYS.MODEL, model);
    if (endpoint !== undefined) {
      if (endpoint) {
        storage.setItem(STORAGE_KEYS.ENDPOINT, endpoint.trim());
      } else {
        storage.removeItem(STORAGE_KEYS.ENDPOINT);
      }
    }
  } catch (err) {
    console.warn('[BYOK] Failed to save config to storage:', err);
  }
}

export function clearByokConfig() {
  try {
    const storage = getStorage();
    storage.removeItem(STORAGE_KEYS.API_KEY);
    storage.removeItem(STORAGE_KEYS.PROVIDER);
    storage.removeItem(STORAGE_KEYS.MODEL);
    storage.removeItem(STORAGE_KEYS.ENDPOINT);
  } catch (err) {
    console.warn('[BYOK] Failed to clear config:', err);
  }
}

export function getMemorySetting() {
  try {
    const storage = getStorage();
    const saved = storage.getItem(STORAGE_KEYS.SAVE_MEMORY);
    return saved !== null ? saved === 'true' : true;
  } catch (err) {
    return true;
  }
}

export function setMemorySetting(saveInMemory) {
  try {
    const storage = getStorage();
    storage.setItem(STORAGE_KEYS.SAVE_MEMORY, String(Boolean(saveInMemory)));
    if (!saveInMemory) {
      storage.removeItem(STORAGE_KEYS.HISTORY);
    }
  } catch (err) {
    console.warn('[BYOK] Failed to save memory preference:', err);
  }
}

export function loadChatHistory() {
  try {
    const shouldSave = getMemorySetting();
    if (!shouldSave) return [];
    const storage = getStorage();
    const saved = storage.getItem(STORAGE_KEYS.HISTORY);
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.warn('[BYOK] Failed to parse saved chat history:', err);
    return [];
  }
}

export function saveChatHistory(messages) {
  try {
    const shouldSave = getMemorySetting();
    if (!shouldSave) return;
    if (!Array.isArray(messages)) return;
    const truncated = messages.slice(-40);
    const storage = getStorage();
    storage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(truncated));
  } catch (err) {
    console.warn('[BYOK] Failed to persist chat history:', err);
  }
}

export function clearChatHistory() {
  try {
    const storage = getStorage();
    storage.removeItem(STORAGE_KEYS.HISTORY);
  } catch (err) {
    console.warn('[BYOK] Failed to clear chat history:', err);
  }
}

/**
 * Format chat conversation history into an exportable document string.
 * Supports Plain Text (.txt) and Word Document (.doc via Word-compatible HTML).
 * 
 * @param {Array} messages - Chat messages array
 * @param {Object} options - { format: 'txt' | 'doc' | 'word', currentPage: string }
 * @returns {string} Formatted transcript text or HTML
 */
export function formatChatTranscript(messages = [], { format = 'txt', currentPage = 'home' } = {}) {
  const dateStr = new Date().toLocaleString();
  const pageDef = PAGE_DEFINITIONS[currentPage];
  const pageName = pageDef ? (pageDef.name || pageDef.title) : currentPage;
  const isWord = format === 'doc' || format === 'word';

  if (!Array.isArray(messages) || messages.length === 0) {
    if (isWord) {
      return `<!DOCTYPE html><html><body><h1>Sanket ISL - Chat Transcript</h1><p>No messages in transcript.</p></body></html>`;
    }
    return `SANKET (संकेत) ISL - CHAT TRANSCRIPT\nExport Date: ${dateStr}\n\n(No messages to display)\n`;
  }

  if (isWord) {
    const messageBlocks = messages.map((m, idx) => {
      const isUser = m.role === 'user';
      const sender = isUser ? 'You (User)' : 'Sanket AI Guide';
      const time = m.timestamp ? ` [${m.timestamp}]` : '';
      const rawText = m.text || '';
      // Escape HTML chars
      const escaped = rawText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n/g, '<br/>')
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>');

      const bgColor = isUser ? '#FFF9E5' : '#F8FAFC';
      const borderColor = isUser ? '#F59E0B' : '#3B82F6';
      const roleColor = isUser ? '#B45309' : '#1D4ED8';

      return `
        <div style="margin-bottom: 14px; padding: 12px 14px; background-color: ${bgColor}; border-left: 4px solid ${borderColor}; border-radius: 4px; font-family: 'Calibri', 'Segoe UI', Arial, sans-serif;">
          <div style="font-size: 10pt; font-weight: bold; color: ${roleColor}; margin-bottom: 4px;">
            #${idx + 1} — ${sender} <span style="font-weight: normal; color: #64748B; font-size: 9pt;">${time}</span>
          </div>
          <div style="font-size: 10.5pt; line-height: 1.5; color: #1E293B;">
            ${escaped}
          </div>
        </div>
      `;
    }).join('\n');

    return `<!DOCTYPE html>
<html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset="utf-8">
  <title>Sanket ISL - Chat Transcript</title>
  <style>
    body { font-family: 'Calibri', 'Segoe UI', Arial, sans-serif; margin: 30px; color: #1E293B; background: #FFFFFF; }
    h1 { color: #0F172A; font-size: 18pt; margin-bottom: 4px; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px; }
    .subtitle { color: #64748B; font-size: 10pt; margin-bottom: 16px; }
    .meta-box { background: #F1F5F9; padding: 10px 14px; border-radius: 6px; font-size: 9.5pt; margin-bottom: 20px; line-height: 1.4; }
    .footer { margin-top: 30px; padding-top: 10px; border-top: 1px solid #E2E8F0; font-size: 8.5pt; color: #94A3B8; text-align: center; }
  </style>
</head>
<body>
  <h1>Sanket (संकेत) — AI Assistant Chat Transcript</h1>
  <div class="subtitle">100% In-Browser Edge AI Indian Sign Language (ISL) Platform</div>
  
  <div class="meta-box">
    <strong>Export Date:</strong> ${dateStr}<br/>
    <strong>Active Context:</strong> ${pageName} (${currentPage})<br/>
    <strong>Total Messages:</strong> ${messages.length}
  </div>

  <div class="messages">
    ${messageBlocks}
  </div>

  <div class="footer">
    Generated client-side by Sanket ISL • Zero Server Costs • Zero Cloud Storage • Private & On-Device
  </div>
</body>
</html>`;
  }

  // Plain text (.txt) format
  const header = [
    '========================================================================',
    '                   SANKET (संकेत) ISL - CHAT TRANSCRIPT                  ',
    '========================================================================',
    `Export Date   : ${dateStr}`,
    `Active Context: ${pageName} (${currentPage})`,
    `Total Messages: ${messages.length}`,
    '------------------------------------------------------------------------',
    ''
  ].join('\n');

  const body = messages.map((m, idx) => {
    const isUser = m.role === 'user';
    const sender = isUser ? 'You' : 'Sanket AI Guide';
    const time = m.timestamp ? ` [${m.timestamp}]` : '';
    const divider = '-'.repeat(40);
    return `[#${idx + 1}] ${sender}${time}:\n${m.text || ''}\n${divider}`;
  }).join('\n\n');

  const footer = [
    '',
    '========================================================================',
    'End of Transcript — Sanket (संकेत) On-Device Indian Sign Language Bridge',
    'Zero Cloud Servers • 100% Client-Side Privacy',
    '========================================================================'
  ].join('\n');

  return `${header}\n${body}\n${footer}`;
}

/**
 * Client-side browser download for chat transcripts in .txt or Word .doc formats.
 * 
 * @param {Array} messages - Chat messages array
 * @param {Object} options - { format: 'txt' | 'doc', currentPage: string, filename?: string }
 * @returns {boolean} True if download triggered successfully
 */
export function downloadChatTranscript(messages, { format = 'txt', currentPage = 'home', filename } = {}) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return false;
  }

  const isWord = format === 'doc' || format === 'word';
  const content = formatChatTranscript(messages, { format: isWord ? 'doc' : 'txt', currentPage });
  const extension = isWord ? 'doc' : 'txt';
  const mimeType = isWord ? 'application/msword;charset=utf-8' : 'text/plain;charset=utf-8';

  const defaultFilename = filename || `sanket_chat_${currentPage}_${new Date().toISOString().slice(0, 10)}.${extension}`;

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    try {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = defaultFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      return true;
    } catch (err) {
      console.error('[BYOK] Error downloading chat transcript:', err);
      return false;
    }
  }

  return false;
}

/**
 * Intelligent local responder for when the user is testing without an API key.
 * Answers questions about the current page, sign step-by-step guidance, and call chat queries.
 */
export function getLocalFallbackResponse(userPrompt, page = 'home', extraState = {}) {
  const query = userPrompt.toLowerCase().trim();
  const pageDef = PAGE_DEFINITIONS[page] || PAGE_DEFINITIONS.home;

  // 1. On-Demand Call Chat Fetch (Chat Page)
  const isAskingCallChat = query.includes('call chat') ||
    query.includes('fetch chat') ||
    query.includes('fetch message') ||
    query.includes('what was said') ||
    query.includes('summarize call') ||
    query.includes('summarize chat') ||
    query.includes('recent message');

  if (isAskingCallChat || extraState.includeCallChat) {
    if (page === 'chat' || extraState.callMessages) {
      const messages = extraState.callMessages || [];
      if (messages.length === 0) {
        return `**Call Chat Status**:\nNo messages have been sent in this call yet. Perform signs in front of the camera or type a reply in the chat on the right to start communicating!`;
      }

      const formatted = messages.slice(-10).map((m, idx) => {
        const sender = m.sender || (m.senderRole === 'peer' ? 'You' : 'Partner');
        const text = m.text || m.rawText || '';
        return `${idx + 1}. **${sender}** (${m.timestamp || 'Just now'}): "${text}"`;
      }).join('\n');

      return `**Recent Call Chat (${messages.length} total messages)**:\n\n${formatted}\n\n*Ask me anything specific about these messages!*`;
    }
  }

  // 1b. Live Screen Awareness & Visual Inspection
  const isAskingScreen = query.includes('on my screen') ||
    query.includes('on the screen') ||
    query.includes('what do you see') ||
    query.includes('look at my screen') ||
    query.includes('look at screen') ||
    query.includes('screen analysis') ||
    query.includes('describe screen') ||
    query.includes('whats on screen') ||
    query.includes("what's on screen");

  if (isAskingScreen) {
    if (page === 'learn') {
      const item = extraState.selectedLearnItem;
      const signName = item?.name || 'Namaste';
      const reps = extraState.successfulReps || 0;
      const isMastered = Boolean(extraState.isSignMastered);
      const stepInfo = item?.steps ? ` (Step ${Number(extraState.activeStepIndex || 0) + 1} of ${item.steps.length})` : '';
      return `**Live Screen Analysis — Learn ISL Studio**:\n` +
        `• **Active Sign on Screen**: **${signName}**${stepInfo} (${item?.category || 'General'})\n` +
        `• **Camera & Skeleton Feed**: Real-time MediaPipe biometric skeleton overlay tracking hands and upper posture\n` +
        `• **Repetition Counter**: **${reps} of 3 repetitions** completed ${isMastered ? '(Sign Mastered!)' : '(In Progress)'}\n` +
        `• **Visible Layout**: Visual target guide on left, live webcam stage on center-right\n` +
        `• **Next Step**: Hold posture steadily for ~500ms to register your repetition!`;
    }
    if (page === 'chat') {
      const room = extraState.roomId || 'Direct P2P Room';
      const glosses = Array.isArray(extraState.glosses) && extraState.glosses.length > 0 ? extraState.glosses.join(', ') : 'None (idle)';
      const preview = extraState.previewText || 'Waiting for signing...';
      const callMsgCount = Array.isArray(extraState.callMessages) ? extraState.callMessages.length : 0;
      return `**Live Screen Analysis — Video Call & Sign Translator**:\n` +
        `• **Active View**: Split-screen video call & live instant messenger\n` +
        `• **Room Status**: \`${room}\` (${extraState.connectionMode || 'P2P WebRTC'})\n` +
        `• **Live Token Composer**: [${glosses}]\n` +
        `• **Formatted English Preview**: "${preview}"\n` +
        `• **Call Messages on Screen**: ${callMsgCount} message(s) exchanged\n` +
        `• **Subtitle HUD**: Active on webcam stage for heads-up translation.`;
    }
    return `**Live Screen Analysis — Home Portal**:\n` +
      `• **Active View**: Sanket Gateway Portal\n` +
      `• **Visible Modules**: "Learn ISL Studio" card, "Video Call & Live Chat" card, Room Join panel, Navigation bar\n` +
      `• **System Status**: 100% On-Device Edge AI (zero server costs, video never uploaded)\n` +
      `• **Available Options**: Click **Enter Learn Studio** to practice signs or **Start Video Call** to connect with a peer!`;
  }

  // 2. Step-by-Step Sign Performance Guide (Universal across all pages)
  const isAskingHowToSign = query.includes('how to sign') ||
    query.includes('how do i sign') ||
    query.includes('how to do') ||
    query.includes('how to perform') ||
    query.includes('step by step') ||
    query.includes('steps to') ||
    query.includes('guide for') ||
    query.includes('tutorial') ||
    query.includes('teach me');

  if (isAskingHowToSign) {
    // If user asked about a specific sign (e.g. "how to sign water", "how do I sign Namaste", "how to sign letter A")
    let targetSign = '';

    // Check if user specified a common sign in prompt
    const knownKeywords = [
      'namaste', 'hello', 'good', 'bad', 'thank you', 'thanks', 'please', 'sorry',
      'help', 'water', 'time', 'doctor', 'hospital', 'food', 'eat', 'yes', 'no'
    ];

    for (const kw of knownKeywords) {
      if (query.includes(kw)) {
        targetSign = kw;
        break;
      }
    }

    // Check single letters (e.g. "letter a", "sign b", "c")
    const letterMatch = query.match(/(?:letter|alphabet)\s+([a-z])\b/i) || query.match(/\bhow (?:do i|to) sign ([a-z])\b/i);
    if (letterMatch) {
      targetSign = letterMatch[1];
    }

    // If no sign extracted but on Learn page, use currently active practice sign!
    if (!targetSign && page === 'learn' && extraState.selectedLearnItem) {
      targetSign = extraState.selectedLearnItem.label || extraState.selectedLearnItem.name;
    }

    if (targetSign) {
      return getSignStepByStepGuide(targetSign);
    }
  }

  // 3. Learn Page Context: Current Sign Awareness ("what am I learning?", "current sign")
  if (page === 'learn' && (query.includes('current sign') || query.includes('what am i learning') || query.includes('what sign') || query.includes('my sign'))) {
    const item = extraState.selectedLearnItem;
    if (item) {
      const reps = extraState.successfulReps || 0;
      const isMastered = Boolean(extraState.isSignMastered);
      return `**Current Learning Goal: ${item.name}**\n• Category: **${item.category || 'General'}**\n• Progress: **${reps} of 3 repetitions** (${isMastered ? 'Mastered!' : 'In Progress'})\n• Description: ${item.description || 'Standard ISL posture'}\n• Pro-Tip: ${item.tip || 'Keep hands visible in camera frame'}\n\nAsk me *"How do I sign ${item.name} step-by-step?"* for full anatomical guidance!`;
    }
  }

  // 4. Page feature questions
  if (query.includes('what can i do') || query.includes('how to use') || query.includes('help') || query.includes('features')) {
    const bullets = pageDef.features.map(f => `• **${f.name}**: ${f.description}`).join('\n');
    return `Welcome to **${pageDef.name}**! Here is what you can do on this page:\n\n${bullets}\n\n*Tip: Add your free Google Gemini API key using the "Add Key" button above for open-ended conversation!*`;
  }

  if (query.includes('learn') || query.includes('practice') || query.includes('namaste') || query.includes('studio') || query.includes('level')) {
    if (extraState.selectedLearnItem && page === 'learn') {
      return getSignStepByStepGuide(extraState.selectedLearnItem.label || extraState.selectedLearnItem.name);
    }
    return `In **Learn ISL Studio**, you can master Indian Sign Language through a 7-level tailored curriculum:\n• **Level 1**: Starts with **Namaste** (two palms pressed together at chest) plus basic responses.\n• **Level 2**: 2-Handed A–Z Fingerspelling.\n• **Real-Time AI**: Uses MediaPipe skeleton tracking. Hold each posture correctly 3 times to master it!\n\nClick **"Enter Learn Studio"** to start practicing.`;
  }

  if (query.includes('video') || query.includes('call') || query.includes('chat') || query.includes('room') || query.includes('connect')) {
    return `The **Video Call & Live Chat (BETA)** allows real-time two-way communication between Deaf signers and hearing partners:\n• **P2P Latency**: Sub-20ms direct WebRTC.\n• **Live Subtitles**: Translates signs and renders them right onto the webcam feed.\n• **Grammar Engine**: Automatically formats ISL Subject-Object-Verb into English Subject-Verb-Object.\n• **Hands-Free**: Rest hands for 1.2s to auto-send your sentence!\n\nClick **"Start Video Call"** or enter a room code on this page to begin.`;
  }

  if (query.includes('safe') || query.includes('privacy') || query.includes('server') || query.includes('camera') || query.includes('record')) {
    return `**100% In-Browser Privacy Guarantee**:\n• Video frames and hand coordinates **NEVER** leave your device or touch a cloud server.\n• All AI computer vision runs locally in your browser using WebAssembly and WebGL.\n• Direct calls use peer-to-peer WebRTC encryption.\n• Zero cloud inference costs, zero data collection.`;
  }

  if (query.includes('dictionary') || query.includes('words') || query.includes('vocabulary') || query.includes('signs')) {
    return `Sanket includes an interactive **1,000+ Word ISL Dictionary**!\n• Explore authentic Indian Sign Language gestures across Greetings, Emergency, Questions, Food, Transit, and Numbers.\n• Each sign includes visual guides and a direct "Practice in Studio" shortcut.\n• Click **"Dictionary"** in the navigation to open it.`;
  }

  if (query.includes('guide') || query.includes('walkthrough') || query.includes('how it works')) {
    return `Click **"New to Sanket? Open App Guide"** or **"How It Works"** to view the interactive walkthrough! It explains camera placement, lighting, and how hands-free signing works.`;
  }

  // Active page context fallback
  if (page === 'learn' && extraState.selectedLearnItem) {
    return `You are currently in **Learn ISL Studio** practicing **${extraState.selectedLearnItem.name}**!\n\n• Progress: ${extraState.successfulReps || 0}/3 repetitions.\n• Ask: *"How do I sign ${extraState.selectedLearnItem.name}?"* for a step-by-step breakdown.`;
  }

  if (page === 'chat') {
    return `You are in the **Video Call & Sign Translator**!\n• Room: **${extraState.roomId || 'Direct P2P'}**\n• To see recent call chat, ask: *"Fetch call chat"* or *"What was said in the call?"*.\n• You can also ask me how to perform any specific sign!`;
  }

  return `I'm your **${pageDef.name}** assistant for Sanket (SignBridge ISL)!\n\nI can help you:\n1. Provide **step-by-step guides** for any ISL sign (e.g. Namaste, Hello, A–Z, Water).\n2. Fetch and summarize **call messages** when asked.\n3. Guide you through all features on this page.\n\n*To ask open-ended questions, tap "Add Key" above to add your free Gemini key!*`;
}

/**
 * Sends a message to the BYOK AI provider (Gemini or OpenAI format).
 * Falls back to local smart response if no key is supplied.
 */
export async function sendChatbotMessage({
  message = '',
  history = [],
  page = 'home',
  extraState = {},
  screenshotDataUrl = null,
  wantsAudio = false,
  audioInputBase64 = null,
  audioInputMimeType = 'audio/webm'
}) {
  const config = getByokConfig();
  const trimmedKey = config.apiKey?.trim();

  // If user query asks about call chat in call mode, set includeCallChat flag
  const queryLower = (message || '').toLowerCase();
  const stateCopy = { ...extraState };
  if (
    queryLower.includes('chat') ||
    queryLower.includes('call message') ||
    queryLower.includes('fetch chat') ||
    queryLower.includes('what was said') ||
    queryLower.includes('summarize call') ||
    queryLower.includes('summarize chat')
  ) {
    stateCopy.includeCallChat = true;
  }

  // If no API key is configured by the user, return grounded local response
  if (!trimmedKey) {
    const localReply = getLocalFallbackResponse(message || 'help', page, stateCopy);
    return {
      reply: localReply,
      isFromLlm: false,
      provider: 'local-fallback'
    };
  }

  const systemInstruction = buildPageSystemInstruction(page, stateCopy);

  // 1. Google Gemini API (Automatic Model Discovery & Cascading Fallback)
  if (config.provider === 'gemini') {
    const liveModels = await fetchLiveActiveModels('gemini', trimmedKey);
    const staticCandidates = PROVIDER_CANDIDATE_MODELS.gemini;

    let candidateModels = [];
    if (liveModels && liveModels.length > 0) {
      const preferred = staticCandidates.filter(m => liveModels.includes(m));
      const remaining = liveModels.filter(m => !preferred.includes(m) && !m.includes('tts') && !m.includes('embedding'));
      candidateModels = preferred.length > 0 ? [...preferred, ...remaining] : liveModels;
    } else {
      candidateModels = staticCandidates;
    }

    if (workingModelCache.has('gemini') && candidateModels.includes(workingModelCache.get('gemini'))) {
      candidateModels = [workingModelCache.get('gemini'), ...candidateModels.filter(m => m !== workingModelCache.get('gemini'))];
    }

    // Format multi-turn conversation into Gemini contents array, ensuring it begins with user
    const contents = [];
    const turns = buildAlternatingChatMessages('', history, message || (audioInputBase64 ? 'Voice Message' : ''));
    for (let i = 0; i < turns.length; i++) {
      const t = turns[i];
      const isLastTurn = i === turns.length - 1;
      const parts = [];

      // If user provided a screenshot and this is the active user turn, attach image part
      if (isLastTurn && t.role === 'user') {
        if (screenshotDataUrl) {
          const cleanBase64 = screenshotDataUrl.replace(/^data:image\/\w+;base64,/, '');
          if (cleanBase64) {
            parts.push({
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64
              }
            });
          }
        }

        // Direct multimodal audio recording from microphone
        if (audioInputBase64) {
          parts.push({
            inlineData: {
              mimeType: audioInputMimeType || 'audio/webm',
              data: audioInputBase64
            }
          });
        }
      }

      if (t.content && t.content.trim() && t.content !== 'Voice Message') {
        parts.push({ text: t.content });
      } else if (audioInputBase64 && isLastTurn && t.role === 'user') {
        parts.push({ text: "Listen to my speech in the attached audio and answer my question directly." });
      } else if (parts.length === 0) {
        parts.push({ text: t.content || "Hello" });
      }

      contents.push({
        role: t.role === 'assistant' ? 'model' : 'user',
        parts
      });
    }

    let lastError = null;

    for (const model of candidateModels) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${trimmedKey}`;

      const requestBody = {
        system_instruction: {
          parts: [{ text: systemInstruction }]
        },
        contents,
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 600,
          ...(wantsAudio ? {
            responseModalities: ["AUDIO"],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: {
                  voiceName: "Puck"
                }
              }
            }
          } : {})
        }
      };

      try {
        let response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(requestBody)
        });

        // If audio modality was rejected with 400, retry without audio modality
        if (!response.ok && wantsAudio && (response.status === 400 || response.status === 404)) {
          const fallbackBody = {
            system_instruction: {
              parts: [{ text: systemInstruction }]
            },
            contents,
            generationConfig: {
              temperature: 0.4,
              maxOutputTokens: 500
            }
          };
          const textOnlyRes = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fallbackBody)
          });
          if (textOnlyRes.ok) {
            response = textOnlyRes;
          }
        }

        if (response.ok) {
          const data = await response.json();
          const parts = data?.candidates?.[0]?.content?.parts || [];
          let candidateText = '';
          let audioData = null;

          for (const p of parts) {
            if (p.text) {
              candidateText += p.text;
            }
            if (p.inlineData && p.inlineData.data) {
              audioData = {
                mimeType: p.inlineData.mimeType || 'audio/wav',
                base64: p.inlineData.data
              };
            }
          }

          candidateText = cleanModelOutput(candidateText.trim());

          // If user wanted audio feedback and the model only returned text, generate native speech with Gemini TTS
          if (wantsAudio && candidateText && !audioData) {
            try {
              const ttsUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash-lite-tts:generateContent?key=${trimmedKey}`;
              const ttsRes = await fetch(ttsUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  contents: [{ parts: [{ text: candidateText.slice(0, 300) }] }],
                  generationConfig: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                      voiceConfig: {
                        prebuiltVoiceConfig: {
                          voiceName: 'Puck'
                        }
                      }
                    }
                  }
                })
              });
              if (ttsRes.ok) {
                const ttsData = await ttsRes.json();
                const audioPart = ttsData?.candidates?.[0]?.content?.parts?.[0]?.inlineData;
                if (audioPart && audioPart.data) {
                  audioData = {
                    mimeType: audioPart.mimeType || 'audio/wav',
                    base64: audioPart.data
                  };
                }
              }
            } catch (ttsErr) {
              console.warn('[BYOK] Native TTS synthesis skipped, will use browser speech:', ttsErr);
            }
          }

          if (!candidateText && audioData) {
            candidateText = "[Gemini Voice Answer]";
          }

          if (candidateText || audioData) {
            workingModelCache.set('gemini', model);
            return {
              reply: candidateText || "Voice response received.",
              audio: audioData,
              isFromLlm: true,
              provider: 'gemini',
              modelUsed: model
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || `API error (${response.status})`;

        if (response.status === 400 || response.status === 403) {
          const lower = errorMsg.toLowerCase();
          if (
            lower.includes('api_key') ||
            lower.includes('api key') ||
            lower.includes('invalid') ||
            lower.includes('not valid') ||
            lower.includes('credential') ||
            lower.includes('permission_denied')
          ) {
            return {
              reply: `**Gemini API Key Error**: ${errorMsg}.\n\nPlease check your Gemini API key in the "BYOK Settings" panel. You can generate a free key at [Google AI Studio](https://aistudio.google.com/app/apikey).`,
              isFromLlm: false,
              provider: 'error'
            };
          }
        }

        lastError = errorMsg;
        console.warn(`[BYOK] Gemini model ${model} unavailable (${response.status}), trying next candidate...`);
      } catch (networkErr) {
        lastError = networkErr.message;
      }
    }

    return {
      reply: `Gemini models currently unavailable (${lastError}). Here is local guidance:\n\n` + getLocalFallbackResponse(message || 'help', page, stateCopy),
      isFromLlm: false,
      provider: 'fallback'
    };
  }

  // 2. Groq Cloud (Automatic Model Discovery & Cascading Fallback)
  if (config.provider === 'groq') {
    const endpoint = config.endpoint || 'https://api.groq.com/openai/v1/chat/completions';

    // Query active models dynamically from Groq if available
    const liveModels = await fetchLiveActiveModels('groq', trimmedKey);
    const staticCandidates = PROVIDER_CANDIDATE_MODELS.groq || ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];

    let candidateModels = [];
    if (liveModels && liveModels.length > 0) {
      const preferred = staticCandidates.filter(m => liveModels.includes(m));
      const remaining = liveModels.filter(m => !preferred.includes(m));
      candidateModels = [...preferred, ...remaining];
    } else {
      candidateModels = staticCandidates;
    }

    if (workingModelCache.has('groq') && candidateModels.includes(workingModelCache.get('groq'))) {
      candidateModels = [workingModelCache.get('groq'), ...candidateModels.filter(m => m !== workingModelCache.get('groq'))];
    }

    // Build strictly alternating messages (system -> user -> assistant -> user)
    const messages = buildAlternatingChatMessages(systemInstruction, history, message);
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${trimmedKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.4,
            max_completion_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = cleanModelOutput(data?.choices?.[0]?.message?.content?.trim());

          if (candidateText) {
            workingModelCache.set('groq', model);
            return {
              reply: candidateText,
              isFromLlm: true,
              provider: 'groq',
              modelUsed: model
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || `API error (${response.status})`;

        if (response.status === 401 || response.status === 403) {
          return {
            reply: `**Groq API Key Error**: ${errorMsg}.\n\nPlease check your key in the BYOK settings panel or generate a free key at [Groq Console](https://console.groq.com/keys).`,
            isFromLlm: false,
            provider: 'error'
          };
        }

        lastError = errorMsg;
        console.warn(`[BYOK] Groq model ${model} unavailable (${response.status}: ${errorMsg}), trying next candidate...`);
      } catch (err) {
        lastError = err.message;
      }
    }

    return {
      reply: `Groq models currently unavailable (${lastError}). Here is local guidance:\n\n` + getLocalFallbackResponse(message, page, stateCopy),
      isFromLlm: false,
      provider: 'fallback'
    };
  }

  // 3. OpenRouter API (Automatic Model Discovery & Cascading Fallback)
  if (config.provider === 'openrouter') {
    const endpoint = config.endpoint || 'https://openrouter.ai/api/v1/chat/completions';

    const liveModels = await fetchLiveActiveModels('openrouter', trimmedKey);
    const staticCandidates = PROVIDER_CANDIDATE_MODELS.openrouter || ['meta-llama/llama-3.3-70b-instruct:free'];

    let candidateModels = [];
    if (liveModels && liveModels.length > 0) {
      const preferred = staticCandidates.filter(m => liveModels.includes(m));
      const remaining = liveModels.filter(m => !preferred.includes(m));
      candidateModels = [...preferred, ...remaining];
    } else {
      candidateModels = staticCandidates;
    }

    if (workingModelCache.has('openrouter') && candidateModels.includes(workingModelCache.get('openrouter'))) {
      candidateModels = [workingModelCache.get('openrouter'), ...candidateModels.filter(m => m !== workingModelCache.get('openrouter'))];
    }

    const messages = buildAlternatingChatMessages(systemInstruction, history, message);
    const referer = typeof window !== 'undefined' && window.location ? window.location.origin : 'https://sanket-isl.org';
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${trimmedKey}`,
            'HTTP-Referer': referer,
            'X-Title': 'Sanket ISL AI Assistant'
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.4,
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = cleanModelOutput(data?.choices?.[0]?.message?.content?.trim());

          if (candidateText) {
            workingModelCache.set('openrouter', model);
            return {
              reply: candidateText,
              isFromLlm: true,
              provider: 'openrouter',
              modelUsed: model
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData?.error?.message || `API error (${response.status})`;

        if (response.status === 401 || response.status === 403) {
          return {
            reply: `**OpenRouter API Key Error**: ${errorMsg}.\n\nPlease check your key in the BYOK settings panel or generate a key at [OpenRouter](https://openrouter.ai/keys).`,
            isFromLlm: false,
            provider: 'error'
          };
        }

        lastError = errorMsg;
        console.warn(`[BYOK] OpenRouter model ${model} unavailable (${response.status}: ${errorMsg}), trying next candidate...`);
      } catch (err) {
        lastError = err.message;
      }
    }

    return {
      reply: `OpenRouter models currently unavailable (${lastError}). Here is local guidance:\n\n` + getLocalFallbackResponse(message, page, stateCopy),
      isFromLlm: false,
      provider: 'fallback'
    };
  }

  // 4. OpenAI or Custom Endpoint
  if (config.provider === 'openai' || config.provider === 'custom' || config.endpoint) {
    const endpoint = config.endpoint || 'https://api.openai.com/v1/chat/completions';
    const candidateModels = [
      workingModelCache.get(config.provider),
      ...(PROVIDER_CANDIDATE_MODELS[config.provider] || ['gpt-4o-mini', 'gpt-4o'])
    ].filter((m, idx, arr) => m && arr.indexOf(m) === idx);

    const messages = buildAlternatingChatMessages(systemInstruction, history, message);
    let lastError = null;

    for (const model of candidateModels) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${trimmedKey}`
          },
          body: JSON.stringify({
            model,
            messages,
            temperature: 0.4,
            max_tokens: 500
          })
        });

        if (response.ok) {
          const data = await response.json();
          const candidateText = cleanModelOutput(data?.choices?.[0]?.message?.content?.trim());

          if (candidateText) {
            workingModelCache.set(config.provider, model);
            return {
              reply: candidateText,
              isFromLlm: true,
              provider: config.provider,
              modelUsed: model
            };
          }
        }

        const errorData = await response.json().catch(() => ({}));
        lastError = errorData?.error?.message || `Status ${response.status}`;
      } catch (err) {
        lastError = err.message;
      }
    }

    return {
      reply: `Endpoint error (${lastError}). Here is local guidance:\n\n` + getLocalFallbackResponse(message, page, stateCopy),
      isFromLlm: false,
      provider: 'fallback'
    };
  }

  return {
    reply: getLocalFallbackResponse(message, page, stateCopy),
    isFromLlm: false,
    provider: 'local-fallback'
  };
}
