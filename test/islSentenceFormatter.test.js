import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatIslSentence } from '../src/nlp/islSentenceFormatter.js';

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
