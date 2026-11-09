import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatIslSentence, formatRawGlosses } from '../src/nlp/islSentenceFormatter.js';

test('formatIslSentence - returns empty string on null, undefined, or empty arrays', () => {
  assert.equal(formatIslSentence(null), '');
  assert.equal(formatIslSentence([]), '');
  assert.equal(formatIslSentence(['', '   ']), '');
});

test('formatIslSentence - formats standalone single-word signs properly', () => {
  assert.equal(formatIslSentence(['HELLO']), 'Hello!');
  assert.equal(formatIslSentence(['GOOD_MORNING']), 'Good morning!');
  assert.equal(formatIslSentence(['THANK_YOU']), 'Thank you!');
  assert.equal(formatIslSentence(['PLEASE']), 'Please.');
  assert.equal(formatIslSentence(['SORRY']), 'Sorry.');
  assert.equal(formatIslSentence(['YES']), 'Yes.');
  assert.equal(formatIslSentence(['NO']), 'No.');
  assert.equal(formatIslSentence(['HELP']), 'Please help me!');
  assert.equal(formatIslSentence(['HOSPITAL']), 'Hospital.');
});

test('formatIslSentence - repositions trailing WH-question signs to front (LING-04)', () => {
  // ["YOU", "NAME", "WHAT"] -> "What is your name?"
  assert.equal(formatIslSentence(['YOU', 'NAME', 'WHAT']), 'What is your name?');

  // ["HOSPITAL", "WHERE"] -> "Where is the hospital?"
  assert.equal(formatIslSentence(['HOSPITAL', 'WHERE']), 'Where is the hospital?');

  // ["DOCTOR", "WHERE"] -> "Where is the doctor?"
  assert.equal(formatIslSentence(['DOCTOR', 'WHERE']), 'Where is the doctor?');

  // ["YOU", "HOW"] -> "How are you?"
  assert.equal(formatIslSentence(['YOU', 'HOW']), 'How are you?');

  // ["HELP", "HOW"] -> "How can I help you?"
  assert.equal(formatIslSentence(['HELP', 'HOW']), 'How can I help you?');

  // ["YOU", "GO", "WHERE"] -> "Where are you going?"
  assert.equal(formatIslSentence(['YOU', 'GO', 'WHERE']), 'Where are you going?');

  // ["TIME", "WHAT"] -> "What time is it?"
  assert.equal(formatIslSentence(['TIME', 'WHAT']), 'What time is it?');

  // ["YOU", "WHO"] -> "Who are you?"
  assert.equal(formatIslSentence(['YOU', 'WHO']), 'Who are you?');

  // ["YOU", "SAD", "WHY"] -> "Why are you sad?"
  assert.equal(formatIslSentence(['YOU', 'SAD', 'WHY']), 'Why are you sad?');

  // ["YOU", "COME", "WHEN"] -> "When will you come?"
  assert.equal(formatIslSentence(['YOU', 'COME', 'WHEN']), 'When will you come?');
});

test('formatIslSentence - reorders ISL SOV clauses into English SVO (LING-03)', () => {
  // ["I_ME", "WATER", "WANT"] -> "I want water."
  assert.equal(formatIslSentence(['I_ME', 'WATER', 'WANT']), 'I want water.');

  // ["I_ME", "HOSPITAL", "GO"] -> "I am going to the hospital."
  assert.equal(formatIslSentence(['I_ME', 'HOSPITAL', 'GO']), 'I am going to the hospital.');

  // ["I_ME", "HOME", "GO"] -> "I am going home."
  assert.equal(formatIslSentence(['I_ME', 'HOME', 'GO']), 'I am going home.');

  // ["I_ME", "FOOD", "EAT"] -> "I am eating food."
  assert.equal(formatIslSentence(['I_ME', 'FOOD', 'EAT']), 'I am eating food.');

  // ["I_ME", "DOCTOR", "SEE"] -> "I want to see the doctor."
  assert.equal(formatIslSentence(['I_ME', 'DOCTOR', 'SEE']), 'I want to see the doctor.');
});

test('formatIslSentence - handles predicate adjectives and temporals', () => {
  // ["I_ME", "HAPPY"] -> "I am happy."
  assert.equal(formatIslSentence(['I_ME', 'HAPPY']), 'I am happy.');

  // ["I_ME", "SAD"] -> "I am sad."
  assert.equal(formatIslSentence(['I_ME', 'SAD']), 'I am sad.');

  // ["TODAY", "I_ME", "HAPPY"] -> "I am happy today."
  assert.equal(formatIslSentence(['TODAY', 'I_ME', 'HAPPY']), 'I am happy today.');

  // ["FAMILY", "GOOD"] -> "My family is good."
  assert.equal(formatIslSentence(['FAMILY', 'GOOD']), 'My family is good.');
});

test('formatIslSentence - formats greetings compounded with clauses', () => {
  // ["HELLO", "YOU", "HOW"] -> "Hello! How are you?"
  assert.equal(formatIslSentence(['HELLO', 'YOU', 'HOW']), 'Hello! How are you?');

  // ["HELLO", "YOU", "NAME", "WHAT"] -> "Hello! What is your name?"
  assert.equal(formatIslSentence(['HELLO', 'YOU', 'NAME', 'WHAT']), 'Hello! What is your name?');
});

test('formatIslSentence - formats name introductions with fingerspelling', () => {
  // ["NAME", "RAHUL"] -> "My name is Rahul."
  assert.equal(formatIslSentence(['NAME', 'RAHUL']), 'My name is Rahul.');

  // ["I_ME", "NAME", "PRIYA"] -> "My name is Priya."
  assert.equal(formatIslSentence(['I_ME', 'NAME', 'PRIYA']), 'My name is Priya.');
});

test('formatIslSentence - formats negation clauses', () => {
  // ["I_ME", "UNDERSTAND", "NO"] -> "I do not understand."
  assert.equal(formatIslSentence(['I_ME', 'UNDERSTAND', 'NO']), 'I do not understand.');

  // ["I_ME", "KNOW", "NO"] -> "I do not know."
  assert.equal(formatIslSentence(['I_ME', 'KNOW', 'NO']), 'I do not know.');
});

test('formatIslSentence - formats complex conversational compounds and politeness chaining', () => {
  // Exact user case: ["HELLO", "THANK YOU", "DRINK", "YES", "GOOD"]
  assert.equal(
    formatIslSentence(['HELLO', 'THANK YOU', 'DRINK', 'YES', 'GOOD']),
    'Hello! Thank you! Yes, a drink is good.'
  );

  assert.equal(
    formatIslSentence(['HELLO', 'THANK_YOU', 'DRINK', 'YES', 'GOOD']),
    'Hello! Thank you! Yes, a drink is good.'
  );

  assert.equal(
    formatIslSentence(['HELLO', 'THANK_YOU']),
    'Hello! Thank you!'
  );

  assert.equal(
    formatIslSentence(['YES', 'GOOD']),
    'Yes, that is good.'
  );

  assert.equal(
    formatIslSentence(['DRINK', 'YES']),
    'Yes, I would like a drink.'
  );
});

test('formatIslSentence - formats implicit-subject verbs and desire clauses', () => {
  assert.equal(formatIslSentence(['WATER', 'WANT']), 'I want water.');
  assert.equal(formatIslSentence(['WATER', 'DRINK', 'WANT']), 'I want to drink water.');
  assert.equal(formatIslSentence(['HOME', 'GO']), 'I am going home.');
  assert.equal(formatIslSentence(['HOSPITAL', 'GO']), 'I am going to the hospital.');
});

test('formatIslSentence - Tier 2 transit, commute, and railway questions', () => {
  assert.equal(formatIslSentence(['TICKET', 'PRICE_COST', 'HOW_MUCH']), 'How much is the ticket price?');
  assert.equal(formatIslSentence(['WATER', 'HOW_MUCH']), 'How much is water?');
  assert.equal(formatIslSentence(['PLATFORM', 'WHICH']), 'Which platform is it?');
  assert.equal(formatIslSentence(['TRAIN', 'WHERE']), 'Where is the train?');
  assert.equal(formatIslSentence(['TRAIN', 'ARRIVE', 'WHEN']), 'When will the train arrive?');
  assert.equal(formatIslSentence(['I_ME', 'TRAIN', 'TICKET', 'BUY', 'WANT']), 'I want to buy a train ticket.');
});

test('formatIslSentence - Tier 2 healthcare, medical, and emergency sentences', () => {
  assert.equal(formatIslSentence(['EMERGENCY', 'HELP', 'PLEASE']), 'Please help, it is an emergency!');
  assert.equal(formatIslSentence(['AMBULANCE', 'CALL', 'PLEASE']), 'Please call the ambulance.');
  assert.equal(formatIslSentence(['POLICE', 'CALL', 'PLEASE']), 'Please call the police.');
  assert.equal(formatIslSentence(['I_ME', 'FEVER']), 'I have a fever.');
  assert.equal(formatIslSentence(['I_ME', 'HEADACHE']), 'I have a headache.');
  assert.equal(formatIslSentence(['I_ME', 'MEDICINE', 'NEED']), 'I need medicine.');
  assert.equal(formatIslSentence(['I_ME', 'HUNGRY']), 'I am hungry.');
  assert.equal(formatIslSentence(['I_ME', 'THIRSTY']), 'I am thirsty.');
});

test('formatIslSentence - Tier 2 extended courtesies and daily greetings', () => {
  assert.equal(formatIslSentence(['EXCUSE_ME']), 'Excuse me.');
  assert.equal(formatIslSentence(['GOOD_AFTERNOON']), 'Good afternoon!');
  assert.equal(formatIslSentence(['GOOD_EVENING']), 'Good evening!');
  assert.equal(formatIslSentence(['GOOD_NIGHT']), 'Good night!');
  assert.equal(formatIslSentence(['CONGRATULATIONS']), 'Congratulations!');
  assert.equal(formatIslSentence(['GOODBYE']), 'Goodbye!');
});

test('formatRawGlosses - formats literal gloss transcripts cleanly', () => {
  assert.equal(
    formatRawGlosses(['HELLO', 'THANK_YOU', 'DRINK', 'YES', 'GOOD']),
    'Hello thank you drink yes good.'
  );
  assert.equal(
    formatRawGlosses(['HELLO', 'THANK YOU', 'DRINK', 'YES', 'GOOD']),
    'Hello thank you drink yes good.'
  );
  assert.equal(formatRawGlosses([]), '');
  assert.equal(formatRawGlosses(null), '');
});

test('formatIslSentence - FIX 5: comprehensive 30+ case test matrix (WH, Negation, Time, Unknown glosses)', () => {
  const cases = [
    // 1-5: WH-questions
    { input: ['YOU', 'NAME', 'WHAT'], expected: 'What is your name?' },
    { input: ['HOSPITAL', 'WHERE'], expected: 'Where is the hospital?' },
    { input: ['YOU', 'WHO'], expected: 'Who are you?' },
    { input: ['YOU', 'SAD', 'WHY'], expected: 'Why are you sad?' },
    { input: ['TRAIN', 'ARRIVE', 'WHEN'], expected: 'When will the train arrive?' },

    // 6-10: More WH-questions and transit/quantities
    { input: ['YOU', 'HOW'], expected: 'How are you?' },
    { input: ['PLATFORM', 'WHICH'], expected: 'Which platform is it?' },
    { input: ['TICKET', 'HOW_MUCH'], expected: 'How much is the ticket?' },
    { input: ['TICKET', 'PRICE_COST', 'HOW_MUCH'], expected: 'How much is the ticket price?' },
    { input: ['SEAT', 'HOW_MANY'], expected: 'How many seats are there?' },

    // 11-15: Negation clauses (with verbs, nouns, unknown)
    { input: ['I_ME', 'UNDERSTAND', 'NO'], expected: 'I do not understand.' },
    { input: ['I_ME', 'KNOW', 'NO'], expected: 'I do not know.' },
    { input: ['I_ME', 'FOOD', 'EAT', 'NO'], expected: 'I do not eat food.' },
    { input: ['TICKET', 'NO'], expected: 'No ticket.' },
    { input: ['I_ME', 'COLD_WATER', 'DRINK', 'NO'], expected: 'I do not drink cold water.' },

    // 16-20: Temporal & Time words
    { input: ['TODAY', 'I_ME', 'HAPPY'], expected: 'I am happy today.' },
    { input: ['TOMORROW', 'I_ME', 'HOSPITAL', 'GO'], expected: 'I am going to the hospital tomorrow.' },
    { input: ['YESTERDAY', 'I_ME', 'SAD'], expected: 'I am sad yesterday.' },
    { input: ['NOW', 'WATER', 'WANT'], expected: 'I want water now.' },
    { input: ['TIME', 'WHAT'], expected: 'What time is it?' },

    // 21-25: Healthcare, Emergencies, Feelings
    { input: ['EMERGENCY', 'HELP', 'PLEASE'], expected: 'Please help, it is an emergency!' },
    { input: ['AMBULANCE', 'CALL', 'PLEASE'], expected: 'Please call the ambulance.' },
    { input: ['I_ME', 'FEVER'], expected: 'I have a fever.' },
    { input: ['I_ME', 'MEDICINE', 'NEED'], expected: 'I need medicine.' },
    { input: ['I_ME', 'TIRED'], expected: 'I am tired.' },

    // 26-30: Transit & Greetings
    { input: ['TRAIN', 'WHERE'], expected: 'Where is the train?' },
    { input: ['BUS', 'STATION', 'WHERE'], expected: 'Where is the bus?' },
    { input: ['HELLO', 'YOU', 'HOW'], expected: 'Hello! How are you?' },
    { input: ['GOOD_MORNING', 'THANK_YOU'], expected: 'Good morning! Thank you!' },
    { input: ['PLEASE', 'HELP'], expected: 'Please help me!' },

    // 31-35: Unknown gloss passthrough & safety
    { input: ['CUSTOM_UNSEEN_SIGN'], expected: 'Custom unseen sign.' },
    { input: ['I_ME', 'ORGANIC_TEA', 'WANT'], expected: 'I want organic tea.' },
    { input: ['I_ME', 'APPLE', 'EAT'], expected: 'I am eating apple.' },
    { input: ['ORGANIC_TEA', 'NO'], expected: 'No organic tea.' },
    { input: ['UNKNOWN_SHOP', 'WHERE'], expected: 'Where is the unknown shop?' }
  ];

  for (let i = 0; i < cases.length; i++) {
    const { input, expected } = cases[i];
    const actual = formatIslSentence(input);
    assert.equal(
      actual,
      expected,
      `Case #${i + 1} failed: input=${JSON.stringify(input)} -> got "${actual}", expected "${expected}"`
    );
  }
});

test('refineWithOptionalLlm - optional off-by-default LLM cleanup hook (FIX 5)', async () => {
  const { refineWithOptionalLlm, DEFAULT_LLM_CONFIG } = await import('../src/nlp/llmGrammarHook.js');

  assert.strictEqual(DEFAULT_LLM_CONFIG.enabled, false, 'LLM hook must be disabled by default');

  const glosses = ['I_ME', 'WATER', 'WANT'];
  const draft = 'I want water.';

  // Test 1: When disabled (default), returns draft immediately
  const result1 = await refineWithOptionalLlm(glosses, draft);
  assert.strictEqual(result1, draft);

  // Test 2: When enabled without apiKey, safely returns draft without making requests
  const result2 = await refineWithOptionalLlm(glosses, draft, { enabled: true, apiKey: '' });
  assert.strictEqual(result2, draft);

  // Test 3: Unknown gloss passed through hook
  const result3 = await refineWithOptionalLlm(['CUSTOM_SIGN'], 'Custom sign.', { enabled: false });
  assert.strictEqual(result3, 'Custom sign.');
});
