/**
 * islSentenceFormatter.js
 * 
 * Deterministic ISL (Subject-Object-Verb) to English (Subject-Verb-Object) Grammar Engine:
 * - Runs 100% client-side in <1ms with 0 external API dependencies (LING-03).
 * - Repositions trailing ISL WH-question markers to front with copulas and question marks (LING-04).
 * - Restructures SOV clauses: Subject + Object + Verb -> Subject + Verb + Object.
 * - Handles greetings, politeness prefixes, pronoun expansions, and punctuation.
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
  GO: { base: 'go', continuous: 'going to', present: 'go' },
  COME: { base: 'come', continuous: 'coming', present: 'come' },
  EAT: { base: 'eat', continuous: 'eating', present: 'eat' },
  DRINK: { base: 'drink', continuous: 'drinking', present: 'drink' },
  HELP: { base: 'help', continuous: 'helping', present: 'help' },
  WORK: { base: 'work', continuous: 'working', present: 'work' },
  STUDY: { base: 'study', continuous: 'studying', present: 'study' },
  SLEEP: { base: 'sleep', continuous: 'sleeping', present: 'sleep' },
  WAIT: { base: 'wait', continuous: 'waiting', present: 'wait' },
  SEE: { base: 'see', continuous: 'seeing', present: 'see' },
  KNOW: { base: 'know', continuous: 'knowing', present: 'know' },
  UNDERSTAND: { base: 'understand', continuous: 'understanding', present: 'understand' },
  WANT: { base: 'want', continuous: 'wanting', present: 'want' }
};

const NOUNS = {
  HOSPITAL: { singular: 'the hospital', bare: 'hospital' },
  DOCTOR: { singular: 'the doctor', bare: 'doctor' },
  MEDICINE: { singular: 'medicine', bare: 'medicine' },
  POLICE: { singular: 'the police', bare: 'police' },
  WATER: { singular: 'water', bare: 'water' },
  FOOD: { singular: 'food', bare: 'food' },
  HOME: { singular: 'home', bare: 'home' },
  SCHOOL: { singular: 'school', bare: 'school' },
  NAME: { singular: 'name', bare: 'name' },
  FRIEND: { singular: 'friend', bare: 'friend' },
  FAMILY: { singular: 'family', bare: 'family' },
  TIME: { singular: 'time', bare: 'time' }
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
  PLEASE: 'Please.',
  SORRY: 'Sorry.'
};

/**
 * Capitalizes the first character of a string.
 */
function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
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

  // Filter out any empty items and uppercase tokens
  const tokens = rawGlosses.map(g => String(g).trim().toUpperCase()).filter(Boolean);
  if (tokens.length === 0) return '';

  // 1. Single Token Handling
  if (tokens.length === 1) {
    const t = tokens[0];
    if (GREETINGS[t]) return GREETINGS[t];
    if (t === 'YES') return 'Yes.';
    if (t === 'NO') return 'No.';
    if (t === 'HELP') return 'Please help me!';
    if (t === 'I_ME') return 'Me.';
    if (NOUNS[t]) return `${capitalize(NOUNS[t].bare)}.`;
    if (ADJECTIVES[t]) return `${capitalize(ADJECTIVES[t])}.`;
    return `${capitalize(t.toLowerCase())}.`;
  }

  // 2. Separate leading greeting if present (e.g. HELLO + rest of sentence)
  let leadingGreeting = null;
  let workTokens = [...tokens];

  if (GREETINGS[workTokens[0]]) {
    leadingGreeting = GREETINGS[workTokens[0]];
    workTokens = workTokens.slice(1);
    if (workTokens.length === 0) {
      return leadingGreeting;
    }
  }

  // 3. Extract leading temporal modifier if present (e.g. TODAY + rest)
  let trailingTemporal = null;
  if (TEMPORALS[workTokens[0]]) {
    trailingTemporal = TEMPORALS[workTokens[0]];
    workTokens = workTokens.slice(1);
  } else if (TEMPORALS[workTokens[workTokens.length - 1]]) {
    trailingTemporal = TEMPORALS[workTokens[workTokens.length - 1]];
    workTokens = workTokens.slice(0, -1);
  }

  const sentenceCore = translateClause(workTokens);

  // Reassemble greeting + clause + temporal
  let fullSentence = sentenceCore;
  if (trailingTemporal && fullSentence) {
    // Insert temporal modifier before final punctuation
    const punct = fullSentence.slice(-1);
    const body = fullSentence.slice(0, -1);
    fullSentence = `${body} ${trailingTemporal}${punct}`;
  }

  if (leadingGreeting) {
    const cleanGreeting = leadingGreeting.replace(/[!.]/, '');
    fullSentence = `${cleanGreeting}! ${fullSentence}`;
  }

  return fullSentence;
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

    // Sub-pattern A3: ["HOSPITAL", "WHERE"] or ["DOCTOR", "WHERE"] -> "Where is the hospital?"
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
  // e.g. ["NAME", "RAHUL"] or ["I_ME", "NAME", "RAHUL"]
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
  // PATTERN D: SOV to SVO Reordering (LING-03)
  // e.g. ["I_ME", "WATER", "WANT"] -> "I want water."
  // e.g. ["I_ME", "HOSPITAL", "GO"] -> "I am going to the hospital."
  // ----------------------------------------------------
  const subjectToken = PRONOUNS[firstToken] ? firstToken : null;
  const verbToken = tokens.find(t => VERBS[t]);
  const nounToken = tokens.find(t => NOUNS[t]);

  if (subjectToken && verbToken) {
    const subj = PRONOUNS[subjectToken].subject;
    const copula = PRONOUNS[subjectToken].copula;

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

    // General Subject + Verb + Noun
    const object = nounToken ? ` ${NOUNS[nounToken].singular}` : '';
    return `${capitalize(subj)} ${VERBS[verbToken].present}${object}.`;
  }

  // ----------------------------------------------------
  // PATTERN E: Subject + Adjective (e.g. ["I_ME", "HAPPY"] -> "I am happy.")
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
  // PATTERN F: Noun + Adjective (e.g. ["FAMILY", "GOOD"] -> "My family is good.")
  // ----------------------------------------------------
  if (nounToken) {
    const adjToken = tokens.find(t => ADJECTIVES[t]);
    if (adjToken) {
      return `My ${NOUNS[nounToken].bare} is ${ADJECTIVES[adjToken]}.`;
    }
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
      return t.toLowerCase();
    })
    .join(' ');

  return `${capitalize(cleaned)}.`;
}

// Alias for convenience
export const islGlossesToEnglish = formatIslSentence;

export default formatIslSentence;
