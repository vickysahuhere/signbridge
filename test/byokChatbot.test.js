import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildPageSystemInstruction,
  PAGE_DEFINITIONS,
  getSignStepByStepGuide
} from '../src/utils/pageContextManager.js';
import {
  getByokConfig,
  saveByokConfig,
  clearByokConfig,
  getMemorySetting,
  setMemorySetting,
  loadChatHistory,
  saveChatHistory,
  clearChatHistory,
  getLocalFallbackResponse,
  sendChatbotMessage,
  formatChatTranscript,
  downloadChatTranscript,
  PROVIDERS,
  SUPPORTED_MODELS,
  PROVIDER_CANDIDATE_MODELS,
  getWorkingModel,
  setWorkingModel,
  buildAlternatingChatMessages,
  fetchLiveActiveModels,
  pruneHistoryForTokenEfficiency
} from '../src/utils/byokChatbotService.js';

test('pageContextManager - builds comprehensive grounded context for Home page', () => {
  const instruction = buildPageSystemInstruction('home', {
    roomId: 'test-room-123',
    masteredCount: 5
  });

  assert.ok(instruction.includes('Home Page (Gateway Portal)'));
  assert.ok(instruction.includes('Learn ISL Studio'));
  assert.ok(instruction.includes('Video Call & Live Chat'));
  assert.ok(instruction.includes('test-room-123'));
  assert.ok(instruction.includes('Mastered Signs: 5'));
  assert.ok(instruction.includes('100% In-Browser Edge AI') || instruction.includes('On-device'));
  assert.ok(instruction.includes('STRICT OPERATIONAL RULES'));
});

test('pageContextManager - injects active learning sign in Learn mode (e.g. Namaste)', () => {
  const mockLearnItem = {
    id: 'namaste',
    label: 'NAMASTE',
    name: 'Namaste',
    category: 'greetings',
    description: 'Press both flat palms together at chest level.',
    tip: 'Keep wrists close and fingers pointing up.'
  };

  const instruction = buildPageSystemInstruction('learn', {
    selectedLearnItem: mockLearnItem,
    successfulReps: 2,
    isSignMastered: false,
    masteredCount: 3
  });

  assert.ok(instruction.includes('Learn ISL Studio'));
  assert.ok(instruction.includes('Active Sign: "Namaste"'));
  assert.ok(instruction.includes('NAMASTE'));
  assert.ok(instruction.includes('2 of 3 repetitions completed'));
  assert.ok(instruction.includes('Provide the step-by-step physical guide for "Namaste"'));
});

test('pageContextManager - fetches call messages only when requested in Chat mode', () => {
  const mockCallMessages = [
    { sender: 'Vicky', text: 'Hello partner!', timestamp: '10:00 AM' },
    { sender: 'Partner', text: 'Good morning! How are you?', timestamp: '10:01 AM' }
  ];

  // 1. Without includeCallChat flag: does NOT dump messages
  const defaultInstruction = buildPageSystemInstruction('chat', {
    roomId: 'isl-sky-42',
    connectionMode: 'p2p',
    glosses: ['HELLO'],
    previewText: 'Hello!',
    callMessages: mockCallMessages,
    includeCallChat: false
  });

  assert.ok(defaultInstruction.includes('isl-sky-42'));
  assert.ok(defaultInstruction.includes('Call messages are NOT shown by default'));
  assert.equal(defaultInstruction.includes('Good morning! How are you?'), false);

  // 2. With includeCallChat flag: injects the messages for summarization
  const requestedInstruction = buildPageSystemInstruction('chat', {
    roomId: 'isl-sky-42',
    connectionMode: 'p2p',
    glosses: ['HELLO'],
    previewText: 'Hello!',
    callMessages: mockCallMessages,
    includeCallChat: true
  });

  assert.ok(requestedInstruction.includes('FETCHED CALL MESSAGES (REQUESTED BY USER)'));
  assert.ok(requestedInstruction.includes('Hello partner!'));
  assert.ok(requestedInstruction.includes('Good morning! How are you?'));
});

test('getSignStepByStepGuide - produces detailed anatomical instructions for signs', () => {
  // Namaste
  const namasteGuide = getSignStepByStepGuide('NAMASTE');
  assert.ok(namasteGuide.includes('NAMASTE'));
  assert.ok(namasteGuide.includes('Anjali Mudra') || namasteGuide.includes('palms'));
  assert.ok(namasteGuide.includes('chest'));
  assert.ok(namasteGuide.includes('3 times'));

  // Hello
  const helloGuide = getSignStepByStepGuide('hello');
  assert.ok(helloGuide.includes('HELLO'));
  assert.ok(helloGuide.includes('forehead') || helloGuide.includes('temple'));
  assert.ok(helloGuide.includes('wave'));

  // Water
  const waterGuide = getSignStepByStepGuide('WATER');
  assert.ok(waterGuide.includes('WATER'));
  assert.ok(waterGuide.includes('chin'));

  // Alphabet letter A
  const letterAGuide = getSignStepByStepGuide('A');
  assert.ok(letterAGuide.includes('Letter **A**'));
  assert.ok(letterAGuide.includes('thumb'));
});

test('byokChatbotService - config and memory persistence', () => {
  clearByokConfig();
  assert.equal(getByokConfig().hasKey, false);

  saveByokConfig({
    apiKey: 'AIzaSyDemoKey123',
    provider: 'gemini',
    model: 'gemini-1.5-flash'
  });

  const saved = getByokConfig();
  assert.equal(saved.hasKey, true);
  assert.equal(saved.apiKey, 'AIzaSyDemoKey123');
  assert.equal(saved.model, 'gemini-1.5-flash');

  // Memory settings
  setMemorySetting(true);
  assert.equal(getMemorySetting(), true);

  const testMessages = [
    { role: 'user', text: 'Hello' },
    { role: 'assistant', text: 'Hi! Welcome to Sanket.' }
  ];
  saveChatHistory(testMessages);
  const loaded = loadChatHistory();
  assert.equal(loaded.length, 2);
  assert.equal(loaded[0].text, 'Hello');

  // Disabling memory clears history
  setMemorySetting(false);
  assert.equal(getMemorySetting(), false);
  assert.equal(loadChatHistory().length, 0);

  clearByokConfig();
  assert.equal(getByokConfig().hasKey, false);
});

test('byokChatbotService - local fallback provides sign guidance and call chat fetching', () => {
  // Step by step sign instruction request
  const stepReply = getLocalFallbackResponse('How do I sign Namaste?', 'home');
  assert.ok(stepReply.includes('NAMASTE'));
  assert.ok(stepReply.includes('palms'));

  // Learn mode current sign awareness
  const mockItem = { name: 'Namaste', label: 'NAMASTE', category: 'greetings' };
  const currentSignReply = getLocalFallbackResponse('What am I learning right now?', 'learn', {
    selectedLearnItem: mockItem,
    successfulReps: 1
  });
  assert.ok(currentSignReply.includes('Namaste'));
  assert.ok(currentSignReply.includes('1 of 3 repetitions'));

  // Chat mode call messages fetch
  const mockMessages = [
    { sender: 'Peer', text: 'Namaste! Are you ready?', timestamp: '09:30' }
  ];
  const callChatReply = getLocalFallbackResponse('What was said in the chat?', 'chat', {
    callMessages: mockMessages
  });
  assert.ok(callChatReply.includes('Recent Call Chat'));
  assert.ok(callChatReply.includes('Namaste! Are you ready?'));
});

test('byokChatbotService - sendChatbotMessage works across all pages in fallback mode', async () => {
  clearByokConfig();

  // On Home
  const homeRes = await sendChatbotMessage({
    message: 'What can I do on this page?',
    history: [],
    page: 'home'
  });
  assert.equal(homeRes.isFromLlm, false);
  assert.ok(homeRes.reply.includes('Learn ISL Studio') || homeRes.reply.includes('Video Call'));

  // On Learn with current sign
  const learnRes = await sendChatbotMessage({
    message: 'How do I do this sign step by step?',
    history: [],
    page: 'learn',
    extraState: {
      selectedLearnItem: { name: 'Namaste', label: 'NAMASTE' }
    }
  });
  assert.ok(learnRes.reply.includes('NAMASTE'));
  assert.ok(learnRes.reply.includes('palms'));
});

test('byokChatbotService - formatChatTranscript formats .txt format cleanly', () => {
  const mockMessages = [
    { id: '1', role: 'user', text: 'How do I sign Namaste?', timestamp: '10:00 AM' },
    { id: '2', role: 'assistant', text: 'Press both flat palms together at chest level.', timestamp: '10:01 AM' }
  ];

  const txtOutput = formatChatTranscript(mockMessages, { format: 'txt', currentPage: 'learn' });

  assert.ok(txtOutput.includes('SANKET (संकेत) ISL - CHAT TRANSCRIPT'));
  assert.ok(txtOutput.includes('Active Context: Learn ISL Studio (learn)'));
  assert.ok(txtOutput.includes('Total Messages: 2'));
  assert.ok(txtOutput.includes('[#1] You [10:00 AM]:'));
  assert.ok(txtOutput.includes('How do I sign Namaste?'));
  assert.ok(txtOutput.includes('[#2] Sanket AI Guide [10:01 AM]:'));
  assert.ok(txtOutput.includes('Press both flat palms together at chest level.'));
  assert.ok(txtOutput.includes('End of Transcript'));
});

test('byokChatbotService - formatChatTranscript formats Word .doc format with HTML styling', () => {
  const mockMessages = [
    { id: '1', role: 'user', text: 'Can you summarize recent call chat?', timestamp: '02:30 PM' },
    { id: '2', role: 'assistant', text: 'Sure! Vicky said "Namaste" and Partner replied "Hello".', timestamp: '02:31 PM' }
  ];

  const docOutput = formatChatTranscript(mockMessages, { format: 'doc', currentPage: 'chat' });

  assert.ok(docOutput.includes('<!DOCTYPE html>'));
  assert.ok(docOutput.includes('xmlns:w=\'urn:schemas-microsoft-com:office:word\''));
  assert.ok(docOutput.includes('Sanket (संकेत) — AI Assistant Chat Transcript'));
  assert.ok(docOutput.includes('Total Messages:</strong> 2'));
  assert.ok(docOutput.includes('#1 — You (User)'));
  assert.ok(docOutput.includes('Can you summarize recent call chat?'));
  assert.ok(docOutput.includes('#2 — Sanket AI Guide'));
  assert.ok(docOutput.includes('Vicky said &quot;Namaste&quot;') || docOutput.includes('Vicky said "Namaste"'));
});

test('byokChatbotService - formatChatTranscript and downloadChatTranscript handle empty state safely', () => {
  // Empty messages
  const emptyTxt = formatChatTranscript([], { format: 'txt' });
  assert.ok(emptyTxt.includes('No messages to display'));

  const emptyDoc = formatChatTranscript([], { format: 'doc' });
  assert.ok(emptyDoc.includes('No messages in transcript'));

  // In Node.js environment without window/document, downloadChatTranscript safely returns false
  const downloadResult = downloadChatTranscript([], { format: 'txt' });
  assert.equal(downloadResult, false);

  const downloadNodeResult = downloadChatTranscript([{ role: 'user', text: 'Hi' }], { format: 'txt' });
  assert.equal(downloadNodeResult, false); // safely returns false in Node environment without crashing
});

test('byokChatbotService - PROVIDERS includes Google Gemini, Groq, OpenRouter, and OpenAI with up-to-date models', () => {
  const providerIds = PROVIDERS.map(p => p.id);
  assert.ok(providerIds.includes('gemini'));
  assert.ok(providerIds.includes('groq'));
  assert.ok(providerIds.includes('openrouter'));
  assert.ok(providerIds.includes('openai'));
  assert.ok(providerIds.includes('custom'));

  // Groq specifics
  const groq = PROVIDERS.find(p => p.id === 'groq');
  assert.equal(groq.keyPrefix, 'gsk_');
  assert.equal(groq.endpoint, 'https://api.groq.com/openai/v1/chat/completions');
  assert.ok(groq.models.some(m => m.id === 'llama-3.3-70b-versatile'));
  assert.ok(groq.models.some(m => m.id === 'llama-3.1-8b-instant'));

  // OpenRouter specifics
  const openrouter = PROVIDERS.find(p => p.id === 'openrouter');
  assert.equal(openrouter.keyPrefix, 'sk-or-');
  assert.equal(openrouter.endpoint, 'https://openrouter.ai/api/v1/chat/completions');
  assert.ok(openrouter.models.some(m => m.id === 'meta-llama/llama-3.3-70b-instruct:free'));
  assert.ok(openrouter.models.some(m => m.id.includes('gemini')));
  assert.ok(openrouter.models.some(m => m.id.includes('deepseek')));

  // SUPPORTED_MODELS contains all providers
  assert.ok(SUPPORTED_MODELS.some(m => m.provider === 'groq'));
  assert.ok(SUPPORTED_MODELS.some(m => m.provider === 'openrouter'));
});

test('byokChatbotService - supports saving Groq and OpenRouter BYOK configurations', () => {
  // Test Groq config save
  saveByokConfig({
    apiKey: 'gsk_testgroqkey12345',
    provider: 'groq',
    model: 'llama-3.3-70b-versatile'
  });

  const groqConfig = getByokConfig();
  assert.equal(groqConfig.provider, 'groq');
  assert.equal(groqConfig.model, 'llama-3.3-70b-versatile');
  assert.equal(groqConfig.apiKey, 'gsk_testgroqkey12345');
  assert.equal(groqConfig.hasKey, true);

  // Test OpenRouter config save
  saveByokConfig({
    apiKey: 'sk-or-v1-abcdef123456',
    provider: 'openrouter',
    model: 'meta-llama/llama-3.3-70b-instruct:free'
  });

  const orConfig = getByokConfig();
  assert.equal(orConfig.provider, 'openrouter');
  assert.equal(orConfig.model, 'meta-llama/llama-3.3-70b-instruct:free');
  assert.equal(orConfig.apiKey, 'sk-or-v1-abcdef123456');
  assert.equal(orConfig.hasKey, true);

  // Reset back to clear
  clearByokConfig();
  assert.equal(getByokConfig().hasKey, false);
});

test('byokChatbotService - auto-model discovery candidates and cache work properly', () => {
  // Candidate models exist for all providers
  assert.ok(PROVIDER_CANDIDATE_MODELS.gemini.length >= 2);
  assert.ok(PROVIDER_CANDIDATE_MODELS.groq.length >= 2);
  assert.ok(PROVIDER_CANDIDATE_MODELS.openrouter.length >= 2);

  // Initial working model resolves to first active candidate
  assert.equal(getWorkingModel('gemini'), PROVIDER_CANDIDATE_MODELS.gemini[0]);
  assert.equal(getWorkingModel('groq'), PROVIDER_CANDIDATE_MODELS.groq[0]);

  // Updating cached working model
  setWorkingModel('groq', 'llama-3.1-8b-instant');
  assert.equal(getWorkingModel('groq'), 'llama-3.1-8b-instant');

  setWorkingModel('openrouter', 'deepseek/deepseek-chat');
  assert.equal(getWorkingModel('openrouter'), 'deepseek/deepseek-chat');

  // Verify decommissioned models gemma2-9b-it and mixtral-8x7b-32768 are NOT present
  assert.equal(PROVIDER_CANDIDATE_MODELS.groq.includes('gemma2-9b-it'), false);
  assert.equal(PROVIDER_CANDIDATE_MODELS.groq.includes('mixtral-8x7b-32768'), false);
});

test('byokChatbotService - buildAlternatingChatMessages guarantees valid LLM role sequencing', () => {
  // Scenario 1: Initial conversation with leading welcome assistant message
  const initialHistory = [
    { id: 'welcome', role: 'assistant', text: 'Namaste! Welcome to Sanket.' }
  ];
  const messages1 = buildAlternatingChatMessages('System prompt instruction', initialHistory, 'Hello AI');

  // Must start with system (if provided), then user (welcome assistant message dropped)
  assert.equal(messages1.length, 2);
  assert.equal(messages1[0].role, 'system');
  assert.equal(messages1[0].content, 'System prompt instruction');
  assert.equal(messages1[1].role, 'user');
  assert.equal(messages1[1].content, 'Hello AI');

  // Scenario 2: Multi-turn conversation with consecutive duplicates
  const multiHistory = [
    { role: 'assistant', text: 'Welcome greeting' },
    { role: 'user', text: 'How to sign water?' },
    { role: 'assistant', text: 'Form a W-handshape near chin.' },
    { role: 'assistant', text: 'Keep hand relaxed.' } // Duplicate assistant
  ];
  const messages2 = buildAlternatingChatMessages('System instruction', multiHistory, 'Got it, thank you!');

  // Consecutive assistants must be merged, leading assistant dropped
  assert.equal(messages2[0].role, 'system');
  assert.equal(messages2[1].role, 'user');
  assert.equal(messages2[1].content, 'How to sign water?');
  assert.equal(messages2[2].role, 'assistant');
  assert.ok(messages2[2].content.includes('Form a W-handshape'));
  assert.ok(messages2[2].content.includes('Keep hand relaxed.'));
  assert.equal(messages2[3].role, 'user');
  assert.equal(messages2[3].content, 'Got it, thank you!');
});

test('byokChatbotService - pruneHistoryForTokenEfficiency compresses long history and prevents quadratic token bloat', () => {
  // Generate a long 12-message history with verbose assistant responses
  const longHistory = [];
  for (let i = 1; i <= 6; i++) {
    longHistory.push({
      id: `u-${i}`,
      role: 'user',
      text: `Question ${i}: How do I do step ${i}?`
    });
    longHistory.push({
      id: `a-${i}`,
      role: 'assistant',
      text: `Answer ${i}: `.repeat(50) // ~550 characters long verbose response
    });
  }

  assert.equal(longHistory.length, 12);

  // Apply token efficiency pruning with maxTurns = 4
  const pruned = pruneHistoryForTokenEfficiency(longHistory, 4, 100);

  // 1. Must only retain the most recent 4 messages
  assert.equal(pruned.length, 4);
  assert.equal(pruned[0].id, 'u-5');
  assert.equal(pruned[1].id, 'a-5');
  assert.equal(pruned[2].id, 'u-6');
  assert.equal(pruned[3].id, 'a-6');

  // 2. Older assistant response (a-5) must be truncated to save tokens
  assert.ok(pruned[1].text.includes('[truncated for context]'));
  assert.ok(pruned[1].text.length < 150);

  // 3. User turns must remain intact for intent preservation
  assert.equal(pruned[0].text, 'Question 5: How do I do step 5?');
  assert.equal(pruned[2].text, 'Question 6: How do I do step 6?');

  // 4. Handles empty or null gracefully
  assert.deepEqual(pruneHistoryForTokenEfficiency([]), []);
  assert.deepEqual(pruneHistoryForTokenEfficiency(null), []);
});

test('byokChatbotService - local fallback provides screen analysis across pages', () => {
  // 1. Learn page screen inspection
  const learnScreen = getLocalFallbackResponse("what's on my screen?", 'learn', {
    selectedLearnItem: { name: 'Namaste', category: 'Greetings' },
    successfulReps: 2,
    isSignMastered: false
  });
  assert.ok(learnScreen.includes('Live Screen Analysis — Learn ISL Studio'));
  assert.ok(learnScreen.includes('Namaste'));
  assert.ok(learnScreen.includes('2 of 3 repetitions'));

  // 2. Chat page screen inspection
  const chatScreen = getLocalFallbackResponse('what do you see on my screen', 'chat', {
    roomId: 'room-xyz',
    glosses: ['HELLO', 'FRIEND'],
    previewText: 'Hello friend',
    callMessages: [{ text: 'Hi!' }]
  });
  assert.ok(chatScreen.includes('Live Screen Analysis — Video Call & Sign Translator'));
  assert.ok(chatScreen.includes('room-xyz'));
  assert.ok(chatScreen.includes('HELLO, FRIEND'));

  // 3. Home page screen inspection
  const homeScreen = getLocalFallbackResponse('look at my screen', 'home');
  assert.ok(homeScreen.includes('Live Screen Analysis — Home Portal'));
  assert.ok(homeScreen.includes('Gateway Portal'));
});
