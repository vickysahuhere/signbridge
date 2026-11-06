/**
 * islSentenceFormatter.js
 * 
 * Deterministic ISL (Subject-Object-Verb) to English (Subject-Verb-Object) Grammar Engine:
 * - Runs 100% client-side in <1ms with 0 external API dependencies (LING-03).
 * - Repositions trailing ISL WH-question markers to front with copulas and question marks (LING-04).
 * - Restructures SOV clauses: Subject + Object + Verb -> Subject + Verb + Object.
 * - Handles greetings, politeness prefixes, pronoun expansions, conversational particles,
 *   implicit first-person subject inferences, compound multi-clause signing, and punctuation.
 */

// Semantic Lexicon Categories for ISL Tokens
const PRONOUNS = {
  I_ME: { subject: 'I', object: 'me', possessive: 'my', copula: 'am' },
  YOU: { subject: 'you', object: 'you', possessive: 'your', copula: 'are' },
  WE: { subject: 'we', object: 'us', possessive: 'our', copula: 'are' },
  THEY: { subject: 'they', object: 'them', possessive: 'their', copula: 'are' }
};

const WH_QUESTIONS = new Set(['WHAT', 'WHERE', 'WHO', 'WHY', 'WHEN', 'HOW']);

const VERBS = {
  GO: { base: 'go', continuous: 'going to', present: 'go', gerund: 'going' },
  COME: { base: 'come', continuous: 'coming', present: 'come', gerund: 'coming' },
  EAT: { base: 'eat', continuous: 'eating', present: 'eat', gerund: 'eating' },
  DRINK: { base: 'drink', continuous: 'drinking', present: 'drink', gerund: 'drinking' },
  HELP: { base: 'help', continuous: 'helping', present: 'help', gerund: 'helping' },
  WORK: { base: 'work', continuous: 'working', present: 'work', gerund: 'working' },
  STUDY: { base: 'study', continuous: 'studying', present: 'study', gerund: 'studying' },
  SLEEP: { base: 'sleep', continuous: 'sleeping', present: 'sleep', gerund: 'sleeping' },
  WAIT: { base: 'wait', continuous: 'waiting', present: 'wait', gerund: 'waiting' },
  SEE: { base: 'see', continuous: 'seeing', present: 'see', gerund: 'seeing' },
  KNOW: { base: 'know', continuous: 'knowing', present: 'know', gerund: 'knowing' },
  UNDERSTAND: { base: 'understand', continuous: 'understanding', present: 'understand', gerund: 'understanding' },
  WANT: { base: 'want', continuous: 'wanting', present: 'want', gerund: 'wanting' }
};

const NOUNS = {
  HOSPITAL: { singular: 'the hospital', bare: 'hospital', definite: 'the hospital' },
  DOCTOR: { singular: 'the doctor', bare: 'doctor', definite: 'the doctor' },
  MEDICINE: { singular: 'medicine', bare: 'medicine', definite: 'medicine' },
  POLICE: { singular: 'the police', bare: 'police', definite: 'the police' },
  WATER: { singular: 'water', bare: 'water', definite: 'water' },
  FOOD: { singular: 'food', bare: 'food', definite: 'food' },
  HOME: { singular: 'home', bare: 'home', definite: 'home' },
  SCHOOL: { singular: 'school', bare: 'school', definite: 'school' },
  NAME: { singular: 'name', bare: 'name', definite: 'the name' },
  FRIEND: { singular: 'friend', bare: 'friend', definite: 'my friend' },
  FAMILY: { singular: 'family', bare: 'family', definite: 'my family' },
  TIME: { singular: 'time', bare: 'time', definite: 'the time' }
};

const TEMPORALS = {
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  YESTERDAY: 'yesterday'
};

const ADJECTIVES = {
  GOOD: 'good',
  BAD: 'bad',
  HAPPY: 'happy',
  SAD: 'sad'
};

const GREETINGS = {
  HELLO: 'Hello!',
  GOOD_MORNING: 'Good morning!',
  WELCOME: 'Welcome!',
  THANK_YOU: 'Thank you!',
  PLEASE: 'Please',
  SORRY: 'Sorry'
};

/**
 * Normalizes a raw gloss token into an uppercase normalized string identifier.
 */
function normalizeGloss(token) {
  if (!token) return '';
  return String(token).trim().toUpperCase().replace(/[\s\/-]+/g, '_');
}

/**
 * Capitalizes the first character of a string.
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Formats an array of recognized ISL gloss tokens into a direct/literal transcription.
 * e.g. ["HELLO", "THANK_YOU", "DRINK", "YES", "GOOD"] -> "Hello thank you drink yes good."
 * @param {string[]} rawGlosses
 * @returns {string}
 */
export function formatRawGlosses(rawGlosses) {
  if (!rawGlosses || !Array.isArray(rawGlosses) || rawGlosses.length === 0) {
    return '';
  }
  const words = rawGlosses
    .map(g => String(g).trim().replace(/_/g, ' ').toLowerCase())
    .filter(Boolean);
  if (words.length === 0) return '';
  const text = words.join(' ');
  return capitalize(text) + '.';
}

/**
 * Formats an array of recognized ISL gloss tokens into a natural English sentence.
 * @param {string[]} rawGlosses - Array of string tokens e.g. ["YOU", "NAME", "WHAT"]
 * @returns {string} Natural formatted English sentence e.g. "What is your name?"
 */
export function formatIslSentence(rawGlosses) {
  if (!rawGlosses || !Array.isArray(rawGlosses) || rawGlosses.length === 0) {
    return '';
  }

  // Filter out any empty items and normalize tokens
  const tokens = rawGlosses.map(normalizeGloss).filter(Boolean);
  if (tokens.length === 0) return '';

  // 1. Single Token Handling
  if (tokens.length === 1) {
    const t = tokens[0];
    if (t === 'HELLO') return 'Hello!';
    if (t === 'GOOD_MORNING') return 'Good morning!';
    if (t === 'WELCOME') return 'Welcome!';
    if (t === 'THANK_YOU') return 'Thank you!';
    if (t === 'PLEASE') return 'Please.';
    if (t === 'SORRY') return 'Sorry.';
    if (t === 'YES') return 'Yes.';
    if (t === 'NO') return 'No.';
    if (t === 'HELP') return 'Please help me!';
    if (t === 'I_ME') return 'Me.';
    if (NOUNS[t]) return `${capitalize(NOUNS[t].bare)}.`;
    if (ADJECTIVES[t]) return `${capitalize(ADJECTIVES[t])}.`;
    return `${capitalize(t.toLowerCase())}.`;
  }

  // 2. Extract leading conversational greetings / politeness markers
  const leadingPhrases = [];
  let workTokens = [...tokens];

  while (workTokens.length > 0) {
    const first = workTokens[0];
    if (first === 'HELLO') {
      leadingPhrases.push('Hello!');
      workTokens = workTokens.slice(1);
    } else if (first === 'GOOD_MORNING') {
      leadingPhrases.push('Good morning!');
      workTokens = workTokens.slice(1);
    } else if (first === 'WELCOME') {
      leadingPhrases.push('Welcome!');
      workTokens = workTokens.slice(1);
    } else if (first === 'THANK_YOU') {
      leadingPhrases.push('Thank you!');
      workTokens = workTokens.slice(1);
    } else if (first === 'SORRY') {
      leadingPhrases.push('Sorry,');
      workTokens = workTokens.slice(1);
    } else if (first === 'PLEASE' && workTokens.length > 1) {
      leadingPhrases.push('Please,');
      workTokens = workTokens.slice(1);
    } else {
      break;
    }
  }

  // If only greetings were signed:
  if (workTokens.length === 0) {
    return leadingPhrases.join(' ');
  }

  // 3. Extract temporal modifier (e.g. TODAY, TOMORROW, YESTERDAY)
  let trailingTemporal = null;
  if (TEMPORALS[workTokens[0]]) {
    trailingTemporal = TEMPORALS[workTokens[0]];
    workTokens = workTokens.slice(1);
  } else if (TEMPORALS[workTokens[workTokens.length - 1]]) {
    trailingTemporal = TEMPORALS[workTokens[workTokens.length - 1]];
    workTokens = workTokens.slice(0, -1);
  }

  if (workTokens.length === 0 && trailingTemporal) {
    const greetingStr = leadingPhrases.join(' ');
    return greetingStr ? `${greetingStr} ${capitalize(trailingTemporal)}.` : `${capitalize(trailingTemporal)}.`;
  }

  // 4. Translate core clause
  let sentenceCore = translateClause(workTokens);

  // 5. Append temporal modifier if present
  if (trailingTemporal && sentenceCore) {
    const punct = sentenceCore.slice(-1);
    const hasPunct = /[.?!]/.test(punct);
    const body = hasPunct ? sentenceCore.slice(0, -1) : sentenceCore;
    const finalPunct = hasPunct ? punct : '.';
    sentenceCore = `${body} ${trailingTemporal}${finalPunct}`;
  }

  // 6. Prepend leading greetings
  if (leadingPhrases.length > 0) {
    const greetingsJoined = leadingPhrases.join(' ');
    // If the greeting ends with comma, ensure clean joining
    if (greetingsJoined.endsWith(',')) {
      sentenceCore = `${greetingsJoined} ${sentenceCore.charAt(0).toLowerCase()}${sentenceCore.slice(1)}`;
    } else {
      sentenceCore = `${greetingsJoined} ${sentenceCore}`;
    }
  }

  return sentenceCore;
}

/**
 * Translates a single clause without outer greetings or temporal modifiers.
 * @param {string[]} tokens
 * @returns {string}
 */
function translateClause(tokens) {
  if (tokens.length === 0) return '';

  const lastToken = tokens[tokens.length - 1];
  const firstToken = tokens[0];

  // ----------------------------------------------------
  // PATTERN A: WH-Question Inversion (LING-04)
  // Check if clause ends with a WH-question word
  // ----------------------------------------------------
  if (WH_QUESTIONS.has(lastToken)) {
    const wh = lastToken;
    const subjectToken = tokens.find(t => PRONOUNS[t]);
    const nounToken = tokens.find(t => NOUNS[t]);
    const verbToken = tokens.find(t => VERBS[t]);

    // Sub-pattern A1: ["YOU", "NAME", "WHAT"] -> "What is your name?"
    if (wh === 'WHAT' && tokens.includes('NAME')) {
      const possessive = subjectToken && PRONOUNS[subjectToken] ? PRONOUNS[subjectToken].possessive : 'your';
      return `What is ${possessive} name?`;
    }

    // Sub-pattern A2: ["TIME", "WHAT"] -> "What time is it?"
    if (wh === 'WHAT' && tokens.includes('TIME')) {
      return 'What time is it?';
    }

    // Sub-pattern A3: ["HOSPITAL", "WHERE"] or ["DOCTOR", "WHERE"] or ["POLICE", "WHERE"]
    if (wh === 'WHERE' && nounToken) {
      return `Where is ${NOUNS[nounToken].singular}?`;
    }

    // Sub-pattern A4: ["YOU", "HOW"] -> "How are you?"
    if (wh === 'HOW' && subjectToken) {
      return `How ${PRONOUNS[subjectToken].copula} ${PRONOUNS[subjectToken].subject}?`;
    }

    // Sub-pattern A5: ["HELP", "HOW"] -> "How can I help you?"
    if (wh === 'HOW' && tokens.includes('HELP')) {
      return 'How can I help you?';
    }

    // Sub-pattern A6: ["YOU", "GO", "WHERE"] -> "Where are you going?"
    if (wh === 'WHERE' && verbToken === 'GO') {
      const subj = subjectToken ? PRONOUNS[subjectToken].subject : 'you';
      const copula = subjectToken ? PRONOUNS[subjectToken].copula : 'are';
      return `Where ${copula} ${subj} going?`;
    }

    // Sub-pattern A7: ["YOU", "EAT", "WHAT"] or ["YOU", "WHAT", "WANT"] -> "What do you want/eat?"
    if (wh === 'WHAT' && verbToken) {
      const subj = subjectToken ? PRONOUNS[subjectToken].subject : 'you';
      return `What do ${subj} ${VERBS[verbToken].base}?`;
    }

    // Sub-pattern A8: ["YOU", "WHO"] -> "Who are you?"
    if (wh === 'WHO' && subjectToken) {
      return `Who ${PRONOUNS[subjectToken].copula} ${PRONOUNS[subjectToken].subject}?`;
    }

    // Sub-pattern A9: ["YOU", "SAD", "WHY"] -> "Why are you sad?"
    if (wh === 'WHY') {
      const adj = tokens.find(t => ADJECTIVES[t]);
      const subj = subjectToken ? PRONOUNS[subjectToken].subject : 'you';
      const copula = subjectToken ? PRONOUNS[subjectToken].copula : 'are';
      if (adj) {
        return `Why ${copula} ${subj} ${ADJECTIVES[adj]}?`;
      }
      return `Why ${copula} ${subj}?`;
    }

    // Sub-pattern A10: ["YOU", "COME", "WHEN"] -> "When will you come?"
    if (wh === 'WHEN') {
      const subj = subjectToken ? PRONOUNS[subjectToken].subject : 'you';
      return `When will ${subj} come?`;
    }

    // Generic WH fallback: Put WH-word at front
    const remaining = tokens.slice(0, -1).map(t => t.toLowerCase()).join(' ');
    return `${capitalize(wh.toLowerCase())} ${remaining}?`;
  }

  // ----------------------------------------------------
  // PATTERN B: Name Introductions with Fingerspelling
  // e.g. ["NAME", "RAHUL"] or ["I_ME", "NAME", "PRIYA"]
  // ----------------------------------------------------
  if (tokens.includes('NAME')) {
    const nameIndex = tokens.indexOf('NAME');
    const nameCandidate = tokens.slice(nameIndex + 1).find(t => !PRONOUNS[t] && !VERBS[t] && !NOUNS[t]);
    if (nameCandidate) {
      const subjToken = tokens.find(t => PRONOUNS[t]);
      const possessive = subjToken && PRONOUNS[subjToken] ? PRONOUNS[subjToken].possessive : 'my';
      return `My name is ${capitalize(nameCandidate.toLowerCase())}.`;
    }
  }

  // ----------------------------------------------------
  // PATTERN C: Negation with NO (e.g. ["I_ME", "UNDERSTAND", "NO"])
  // ----------------------------------------------------
  if (lastToken === 'NO' || tokens.includes('NO')) {
    const verbToken = tokens.find(t => VERBS[t]);
    const subjToken = tokens.find(t => PRONOUNS[t]);
    const subj = subjToken ? PRONOUNS[subjToken].subject : 'I';
    if (verbToken) {
      return `${capitalize(subj)} do not ${VERBS[verbToken].base}.`;
    }
    const noun = tokens.find(t => NOUNS[t]);
    if (noun) {
      return `No ${NOUNS[noun].bare}.`;
    }
  }

  // ----------------------------------------------------
  // PATTERN D: Politeness & Requests (e.g. ["PLEASE", "HELP"], ["HELP", "PLEASE"])
  // ----------------------------------------------------
  if (tokens.includes('HELP')) {
    if (tokens.includes('PLEASE') || tokens.length === 1) {
      return 'Please help me!';
    }
    if (tokens.includes('WANT')) {
      const subjToken = tokens.find(t => PRONOUNS[t]);
      const subj = subjToken ? PRONOUNS[subjToken].subject : 'I';
      return `${capitalize(subj)} need help.`;
    }
  }
  if (tokens.includes('PLEASE') && tokens.includes('WAIT')) {
    return 'Please wait.';
  }

  // ----------------------------------------------------
  // PATTERN E: Conversational Responses with YES / NO / GOOD
  // e.g. ["DRINK", "YES", "GOOD"] -> "Yes, a drink is good."
  // e.g. ["YES", "GOOD"] -> "Yes, that is good."
  // e.g. ["NO", "BAD"] -> "No, that is bad."
  // e.g. ["DRINK", "YES"] -> "Yes, I would like a drink."
  // e.g. ["WATER", "YES"] -> "Yes, water, thank you."
  // ----------------------------------------------------
  if (tokens.includes('YES') || tokens.includes('GOOD')) {
    const hasYes = tokens.includes('YES');
    const hasGood = tokens.includes('GOOD');
    const nonMarkerTokens = tokens.filter(t => t !== 'YES' && t !== 'GOOD');

    if (hasYes && hasGood && nonMarkerTokens.length === 0) {
      return 'Yes, that is good.';
    }

    if (hasYes && nonMarkerTokens.length > 0) {
      const restClause = translateClause(nonMarkerTokens);
      if (hasGood) {
        // e.g. ["DRINK", "YES", "GOOD"]
        const item = nonMarkerTokens[0];
        if (item === 'DRINK') return 'Yes, a drink is good.';
        if (item === 'FOOD') return 'Yes, food is good.';
        if (item === 'WATER') return 'Yes, water is good.';
        if (NOUNS[item]) return `Yes, ${NOUNS[item].bare} is good.`;
        if (VERBS[item]) return `Yes, ${VERBS[item].gerund} is good.`;
      }
      // e.g. ["DRINK", "YES"]
      const item = nonMarkerTokens[0];
      if (item === 'DRINK') return 'Yes, I would like a drink.';
      if (item === 'FOOD') return 'Yes, I would like food.';
      if (item === 'WATER') return 'Yes, water, thank you.';
      if (NOUNS[item]) return `Yes, ${NOUNS[item].bare}, please.`;

      // Cleanly join
      const cleanBody = restClause.replace(/[.]+$/, '');
      return `Yes, ${cleanBody.charAt(0).toLowerCase()}${cleanBody.slice(1)}.`;
    }

    if (hasGood && nonMarkerTokens.length === 1) {
      const item = nonMarkerTokens[0];
      if (item === 'DRINK') return 'A drink is good.';
      if (item === 'FOOD') return 'The food is good.';
      if (item === 'WORK') return 'Work is good.';
      if (item === 'STUDY') return 'Studying is good.';
      if (NOUNS[item]) return `My ${NOUNS[item].bare} is good.`;
    }
  }

  // ----------------------------------------------------
  // PATTERN F: SOV to SVO Reordering (LING-03)
  // Handles both explicit subjects ("I_ME WATER WANT")
  // and implicit first-person subjects ("WATER WANT", "HOME GO")
  // ----------------------------------------------------
  const subjectToken = PRONOUNS[firstToken] ? firstToken : null;
  const verbToken = tokens.find(t => VERBS[t]);
  const nounToken = tokens.find(t => NOUNS[t]);

  if (verbToken) {
    // If no explicit subject pronoun was signed, default to first person ('I')
    const subj = subjectToken ? PRONOUNS[subjectToken].subject : 'I';
    const copula = subjectToken ? PRONOUNS[subjectToken].copula : 'am';

    // Compound desire verbs: ["WATER", "DRINK", "WANT"] -> "I want to drink water."
    if (tokens.includes('WANT') && tokens.some(t => VERBS[t] && t !== 'WANT')) {
      const actionVerb = tokens.find(t => VERBS[t] && t !== 'WANT');
      const object = nounToken ? ` ${NOUNS[nounToken].bare}` : '';
      return `${capitalize(subj)} want to ${VERBS[actionVerb].base}${object}.`;
    }

    // Motion verbs: GO, COME
    if (verbToken === 'GO') {
      const destination = nounToken ? NOUNS[nounToken].singular : 'there';
      return `${capitalize(subj)} ${copula} going to ${destination}.`.replace('going to home', 'going home');
    }
    if (verbToken === 'COME') {
      return `${capitalize(subj)} ${copula} coming.`;
    }

    // Action verbs: EAT, DRINK
    if (verbToken === 'EAT') {
      const food = nounToken ? NOUNS[nounToken].bare : 'food';
      return `${capitalize(subj)} ${copula} eating ${food}.`;
    }
    if (verbToken === 'DRINK') {
      const drink = nounToken ? NOUNS[nounToken].bare : 'water';
      return `${capitalize(subj)} ${copula} drinking ${drink}.`;
    }

    // WANT
    if (verbToken === 'WANT') {
      const object = nounToken ? NOUNS[nounToken].bare : 'it';
      return `${capitalize(subj)} want ${object}.`;
    }

    // HELP
    if (verbToken === 'HELP') {
      return `${capitalize(subj)} need help.`;
    }

    // SEE
    if (verbToken === 'SEE') {
      const target = nounToken ? NOUNS[nounToken].singular : 'it';
      return `${capitalize(subj)} want to see ${target}.`;
    }

    // SLEEP
    if (verbToken === 'SLEEP') {
      return `${capitalize(subj)} want to sleep.`;
    }

    // General Subject + Verb + Noun
    const object = nounToken ? ` ${NOUNS[nounToken].singular}` : '';
    return `${capitalize(subj)} ${VERBS[verbToken].present}${object}.`;
  }

  // ----------------------------------------------------
  // PATTERN G: Subject + Adjective (e.g. ["I_ME", "HAPPY"] -> "I am happy.")
  // ----------------------------------------------------
  if (subjectToken) {
    const adjToken = tokens.find(t => ADJECTIVES[t]);
    if (adjToken) {
      const subj = PRONOUNS[subjectToken].subject;
      const copula = PRONOUNS[subjectToken].copula;
      return `${capitalize(subj)} ${copula} ${ADJECTIVES[adjToken]}.`;
    }
  }

  // ----------------------------------------------------
  // PATTERN H: Noun + Adjective (e.g. ["FAMILY", "GOOD"] -> "My family is good.")
  // ----------------------------------------------------
  if (nounToken) {
    const adjToken = tokens.find(t => ADJECTIVES[t]);
    if (adjToken) {
      return `My ${NOUNS[nounToken].bare} is ${ADJECTIVES[adjToken]}.`;
    }
  }

  // ----------------------------------------------------
  // PATTERN I: Polite Thanks / Closing (e.g. ["THANK_YOU", "FRIEND"])
  // ----------------------------------------------------
  if (tokens.includes('THANK_YOU') && tokens.includes('FRIEND')) {
    return 'Thank you, my friend!';
  }

  // ----------------------------------------------------
  // FALLBACK: Cleanly joined lowercase tokens with period
  // ----------------------------------------------------
  const cleaned = tokens
    .map(t => {
      if (PRONOUNS[t]) return PRONOUNS[t].subject;
      if (NOUNS[t]) return NOUNS[t].bare;
      if (VERBS[t]) return VERBS[t].base;
      if (ADJECTIVES[t]) return ADJECTIVES[t];
      return t.toLowerCase().replace(/_/g, ' ');
    })
    .join(' ');

  return `${capitalize(cleaned)}.`;
}

// Alias for convenience
export const islGlossesToEnglish = formatIslSentence;

export default formatIslSentence;
