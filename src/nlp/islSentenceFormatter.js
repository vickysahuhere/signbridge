/**
 * islSentenceFormatter.js
 * 
 * Deterministic ISL (Subject-Object-Verb) to English (Subject-Verb-Object) Grammar Engine:
 * - Runs 100% client-side in <1ms with 0 external API dependencies (LING-03).
 * - Repositions trailing ISL WH-question markers to front with copulas and question marks (LING-04).
 * - Restructures SOV clauses: Subject + Object + Verb -> Subject + Verb + Object.
 * - Tier 2 Comprehensive Daily English Lexicon: 260 words across transit, medical/emergency,
 *   shopping/food, education/work, time, feelings, and routine conversational exchanges.
 * - Handles greetings, politeness prefixes, pronoun expansions, conversational particles,
 *   implicit first-person subject inferences, compound multi-clause signing, and punctuation.
 */

import { ISL_WORD_LABELS } from '../ai/islWordLabels.js';

// Semantic Lexicon Categories for ISL Tokens
const PRONOUNS = {
  I_ME: { subject: 'I', object: 'me', possessive: 'my', copula: 'am' },
  YOU: { subject: 'you', object: 'you', possessive: 'your', copula: 'are' },
  WE: { subject: 'we', object: 'us', possessive: 'our', copula: 'are' },
  THEY: { subject: 'they', object: 'them', possessive: 'their', copula: 'are' },
  HE_SHE: { subject: 'he/she', object: 'him/her', possessive: 'his/her', copula: 'is' },
  MY_MINE: { subject: 'my', object: 'mine', possessive: 'my', copula: 'is' },
  YOUR_YOURS: { subject: 'your', object: 'yours', possessive: 'your', copula: 'is' },
  OUR: { subject: 'our', object: 'ours', possessive: 'our', copula: 'are' },
  THEIR: { subject: 'their', object: 'theirs', possessive: 'their', copula: 'are' }
};

const WH_QUESTIONS = new Set([
  'WHAT', 'WHERE', 'WHO', 'WHY', 'WHEN', 'HOW', 'WHICH', 'HOW_MUCH', 'HOW_MANY', 'WHOSE'
]);

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
  WANT: { base: 'want', continuous: 'wanting', present: 'want', gerund: 'wanting' },
  NEED: { base: 'need', continuous: 'needing', present: 'need', gerund: 'needing' },
  LIKE: { base: 'like', continuous: 'liking', present: 'like', gerund: 'liking' },
  LOVE: { base: 'love', continuous: 'loving', present: 'love', gerund: 'loving' },
  BUY: { base: 'buy', continuous: 'buying', present: 'buy', gerund: 'buying' },
  SELL: { base: 'sell', continuous: 'selling', present: 'sell', gerund: 'selling' },
  PAY: { base: 'pay', continuous: 'paying', present: 'pay', gerund: 'paying' },
  GIVE: { base: 'give', continuous: 'giving', present: 'give', gerund: 'giving' },
  TAKE: { base: 'take', continuous: 'taking', present: 'take', gerund: 'taking' },
  BRING: { base: 'bring', continuous: 'bringing', present: 'bring', gerund: 'bringing' },
  WALK: { base: 'walk', continuous: 'walking', present: 'walk', gerund: 'walking' },
  RUN: { base: 'run', continuous: 'running', present: 'run', gerund: 'running' },
  STAND: { base: 'stand', continuous: 'standing', present: 'stand', gerund: 'standing' },
  SIT: { base: 'sit', continuous: 'sitting', present: 'sit', gerund: 'sitting' },
  THINK: { base: 'think', continuous: 'thinking', present: 'think', gerund: 'thinking' },
  REMEMBER: { base: 'remember', continuous: 'remembering', present: 'remember', gerund: 'remembering' },
  FORGET: { base: 'forget', continuous: 'forgetting', present: 'forget', gerund: 'forgetting' },
  LEARN: { base: 'learn', continuous: 'learning', present: 'learn', gerund: 'learning' },
  TEACH: { base: 'teach', continuous: 'teaching', present: 'teach', gerund: 'teaching' },
  WAKE_UP: { base: 'wake up', continuous: 'waking up', present: 'wake up', gerund: 'waking up' },
  WASH: { base: 'wash', continuous: 'washing', present: 'wash', gerund: 'washing' },
  CLEAN: { base: 'clean', continuous: 'cleaning', present: 'clean', gerund: 'cleaning' },
  COOK: { base: 'cook', continuous: 'cooking', present: 'cook', gerund: 'cooking' },
  SPEAK: { base: 'speak', continuous: 'speaking', present: 'speak', gerund: 'speaking' },
  LISTEN: { base: 'listen', continuous: 'listening', present: 'listen', gerund: 'listening' },
  LOOK: { base: 'look', continuous: 'looking', present: 'look', gerund: 'looking' },
  OPEN: { base: 'open', continuous: 'opening', present: 'open', gerund: 'opening' },
  CLOSE: { base: 'close', continuous: 'closing', present: 'close', gerund: 'closing' },
  START: { base: 'start', continuous: 'starting', present: 'start', gerund: 'starting' },
  FINISH: { base: 'finish', continuous: 'finishing', present: 'finish', gerund: 'finishing' },
  MEET: { base: 'meet', continuous: 'meeting', present: 'meet', gerund: 'meeting' },
  CALL: { base: 'call', continuous: 'calling', present: 'call', gerund: 'calling' },
  SEND: { base: 'send', continuous: 'sending', present: 'send', gerund: 'sending' },
  TRAVEL: { base: 'travel', continuous: 'traveling', present: 'travel', gerund: 'traveling' },
  STAY: { base: 'stay', continuous: 'staying', present: 'stay', gerund: 'staying' },
  CHANGE: { base: 'change', continuous: 'changing', present: 'change', gerund: 'changing' },
  ASK: { base: 'ask', continuous: 'asking', present: 'ask', gerund: 'asking' },
  ANSWER: { base: 'answer', continuous: 'answering', present: 'answer', gerund: 'answering' },
  LIVE: { base: 'live', continuous: 'living', present: 'live', gerund: 'living' },
  CANCEL: { base: 'cancel', continuous: 'cancelling', present: 'cancel', gerund: 'cancelling' },
  CONFIRM: { base: 'confirm', continuous: 'confirming', present: 'confirm', gerund: 'confirming' },
  ARRIVE: { base: 'arrive', continuous: 'arriving', present: 'arrive', gerund: 'arriving' },
  DEPARTURE: { base: 'depart', continuous: 'departing', present: 'depart', gerund: 'departing' },
  REST: { base: 'rest', continuous: 'resting', present: 'rest', gerund: 'resting' },
  RECOVER: { base: 'recover', continuous: 'recovering', present: 'recover', gerund: 'recovering' }
};

const NOUNS = {
  // Transit & Travel
  TRAIN: { singular: 'the train', bare: 'train', definite: 'the train' },
  BUS: { singular: 'the bus', bare: 'bus', definite: 'the bus' },
  AUTO_RICKSHAW: { singular: 'the auto', bare: 'auto rickshaw', definite: 'the auto rickshaw' },
  TAXI: { singular: 'the taxi', bare: 'taxi', definite: 'the taxi' },
  FLIGHT_AIRPLANE: { singular: 'the flight', bare: 'flight', definite: 'the flight' },
  BICYCLE: { singular: 'the bicycle', bare: 'bicycle', definite: 'the bicycle' },
  MOTORCYCLE: { singular: 'the motorcycle', bare: 'motorcycle', definite: 'the motorcycle' },
  CAR: { singular: 'the car', bare: 'car', definite: 'the car' },
  METRO: { singular: 'the metro', bare: 'metro', definite: 'the metro' },
  STATION: { singular: 'the station', bare: 'station', definite: 'the station' },
  PLATFORM: { singular: 'the platform', bare: 'platform', definite: 'the platform' },
  TICKET: { singular: 'the ticket', bare: 'ticket', definite: 'the ticket' },
  SEAT: { singular: 'the seat', bare: 'seat', definite: 'the seat' },
  LUGGAGE_BAG: { singular: 'the luggage', bare: 'luggage', definite: 'the luggage' },
  ROAD: { singular: 'the road', bare: 'road', definite: 'the road' },
  MAP: { singular: 'the map', bare: 'map', definite: 'the map' },
  DESTINATION: { singular: 'the destination', bare: 'destination', definite: 'the destination' },
  ENTRY: { singular: 'the entrance', bare: 'entrance', definite: 'the entrance' },
  EXIT: { singular: 'the exit', bare: 'exit', definite: 'the exit' },

  // Healthcare & Emergency
  HOSPITAL: { singular: 'the hospital', bare: 'hospital', definite: 'the hospital' },
  DOCTOR: { singular: 'the doctor', bare: 'doctor', definite: 'the doctor' },
  NURSE: { singular: 'the nurse', bare: 'nurse', definite: 'the nurse' },
  CLINIC: { singular: 'the clinic', bare: 'clinic', definite: 'the clinic' },
  EMERGENCY: { singular: 'emergency', bare: 'emergency', definite: 'the emergency' },
  AMBULANCE: { singular: 'the ambulance', bare: 'ambulance', definite: 'the ambulance' },
  MEDICINE: { singular: 'medicine', bare: 'medicine', definite: 'medicine' },
  TABLET_PILL: { singular: 'the medicine tablet', bare: 'tablet', definite: 'the tablet' },
  INJECTION: { singular: 'an injection', bare: 'injection', definite: 'the injection' },
  FEVER: { singular: 'a fever', bare: 'fever', definite: 'the fever' },
  COUGH: { singular: 'a cough', bare: 'cough', definite: 'the cough' },
  COLD_SICK: { singular: 'a cold', bare: 'cold', definite: 'the cold' },
  HEADACHE: { singular: 'a headache', bare: 'headache', definite: 'the headache' },
  STOMACHACHE: { singular: 'a stomachache', bare: 'stomachache', definite: 'the stomachache' },
  PAIN: { singular: 'pain', bare: 'pain', definite: 'the pain' },
  BLOOD: { singular: 'blood', bare: 'blood', definite: 'the blood' },
  BANDAGE: { singular: 'a bandage', bare: 'bandage', definite: 'the bandage' },
  DOCTOR_APPOINTMENT: { singular: 'the doctor appointment', bare: 'appointment', definite: 'the appointment' },
  X_RAY: { singular: 'an X-ray', bare: 'X-ray', definite: 'the X-ray' },
  TEST_REPORT: { singular: 'the test report', bare: 'test report', definite: 'the test report' },
  PRESCRIPTION: { singular: 'the prescription', bare: 'prescription', definite: 'the prescription' },
  PHARMACY: { singular: 'the pharmacy', bare: 'pharmacy', definite: 'the pharmacy' },
  WHEELCHAIR: { singular: 'the wheelchair', bare: 'wheelchair', definite: 'the wheelchair' },
  OXYGEN: { singular: 'oxygen', bare: 'oxygen', definite: 'the oxygen' },
  FIRE: { singular: 'fire', bare: 'fire', definite: 'the fire' },
  ACCIDENT: { singular: 'an accident', bare: 'accident', definite: 'the accident' },
  POLICE: { singular: 'the police', bare: 'police', definite: 'the police' },

  // Shopping, Market, Food & Essentials
  WATER: { singular: 'water', bare: 'water', definite: 'water' },
  FOOD: { singular: 'food', bare: 'food', definite: 'food' },
  MILK: { singular: 'milk', bare: 'milk', definite: 'milk' },
  TEA: { singular: 'tea', bare: 'tea', definite: 'tea' },
  COFFEE: { singular: 'coffee', bare: 'coffee', definite: 'coffee' },
  RICE: { singular: 'rice', bare: 'rice', definite: 'rice' },
  ROTI_BREAD: { singular: 'bread', bare: 'roti/bread', definite: 'the bread' },
  VEGETABLES: { singular: 'vegetables', bare: 'vegetables', definite: 'the vegetables' },
  FRUITS: { singular: 'fruits', bare: 'fruits', definite: 'the fruits' },
  SUGAR: { singular: 'sugar', bare: 'sugar', definite: 'sugar' },
  SALT: { singular: 'salt', bare: 'salt', definite: 'salt' },
  OIL: { singular: 'oil', bare: 'oil', definite: 'oil' },
  SHOP_STORE: { singular: 'the shop', bare: 'shop', definite: 'the shop' },
  MARKET: { singular: 'the market', bare: 'market', definite: 'the market' },
  MONEY: { singular: 'money', bare: 'money', definite: 'money' },
  CASH: { singular: 'cash', bare: 'cash', definite: 'cash' },
  PRICE_COST: { singular: 'the price', bare: 'price', definite: 'the price' },
  CHANGE_COINS: { singular: 'the change', bare: 'change', definite: 'the change' },
  DISCOUNT: { singular: 'a discount', bare: 'discount', definite: 'the discount' },
  BILL_RECEIPT: { singular: 'the bill', bare: 'bill', definite: 'the bill' },
  BAG: { singular: 'the bag', bare: 'bag', definite: 'the bag' },
  CLOTHES: { singular: 'clothes', bare: 'clothes', definite: 'the clothes' },
  SHOES: { singular: 'shoes', bare: 'shoes', definite: 'the shoes' },
  SOAP: { singular: 'soap', bare: 'soap', definite: 'soap' },
  WATER_BOTTLE: { singular: 'the water bottle', bare: 'water bottle', definite: 'the water bottle' },
  BREAKFAST: { singular: 'breakfast', bare: 'breakfast', definite: 'breakfast' },
  LUNCH: { singular: 'lunch', bare: 'lunch', definite: 'lunch' },
  DINNER: { singular: 'dinner', bare: 'dinner', definite: 'dinner' },
  RESTAURANT: { singular: 'the restaurant', bare: 'restaurant', definite: 'the restaurant' },

  // Education, Campus & Workplace
  SCHOOL: { singular: 'school', bare: 'school', definite: 'school' },
  COLLEGE: { singular: 'college', bare: 'college', definite: 'college' },
  OFFICE: { singular: 'the office', bare: 'office', definite: 'the office' },
  CLASSROOM: { singular: 'the classroom', bare: 'classroom', definite: 'the classroom' },
  BOOK: { singular: 'the book', bare: 'book', definite: 'the book' },
  PEN: { singular: 'a pen', bare: 'pen', definite: 'the pen' },
  PENCIL: { singular: 'a pencil', bare: 'pencil', definite: 'the pencil' },
  PAPER: { singular: 'paper', bare: 'paper', definite: 'paper' },
  NOTEBOOK: { singular: 'the notebook', bare: 'notebook', definite: 'the notebook' },
  COMPUTER: { singular: 'the computer', bare: 'computer', definite: 'the computer' },
  INTERNET: { singular: 'the internet', bare: 'internet', definite: 'the internet' },
  PHONE: { singular: 'the phone', bare: 'phone', definite: 'the phone' },
  EMAIL: { singular: 'the email', bare: 'email', definite: 'the email' },
  EXAM_TEST: { singular: 'the exam', bare: 'exam', definite: 'the exam' },
  HOMEWORK: { singular: 'homework', bare: 'homework', definite: 'homework' },
  MEETING: { singular: 'the meeting', bare: 'meeting', definite: 'the meeting' },
  SALARY: { singular: 'the salary', bare: 'salary', definite: 'the salary' },
  JOB: { singular: 'the job', bare: 'job', definite: 'the job' },
  PROJECT: { singular: 'the project', bare: 'project', definite: 'the project' },
  HOLIDAY: { singular: 'the holiday', bare: 'holiday', definite: 'the holiday' },

  // Essentials, Home & Personal
  HOME: { singular: 'home', bare: 'home', definite: 'home' },
  NAME: { singular: 'name', bare: 'name', definite: 'the name' },
  TIME: { singular: 'time', bare: 'time', definite: 'the time' },
  TOILET: { singular: 'the restroom', bare: 'restroom', definite: 'the restroom' },
  FRIEND: { singular: 'friend', bare: 'friend', definite: 'my friend' },
  FAMILY: { singular: 'family', bare: 'family', definite: 'my family' },
  MOTHER: { singular: 'my mother', bare: 'mother', definite: 'my mother' },
  FATHER: { singular: 'my father', bare: 'father', definite: 'my father' },
  BROTHER: { singular: 'my brother', bare: 'brother', definite: 'my brother' },
  SISTER: { singular: 'my sister', bare: 'sister', definite: 'my sister' },
  TEACHER: { singular: 'the teacher', bare: 'teacher', definite: 'the teacher' },
  STUDENT: { singular: 'the student', bare: 'student', definite: 'the student' },
  PASSENGER: { singular: 'the passenger', bare: 'passenger', definite: 'the passenger' }
};

const TEMPORALS = {
  TODAY: 'today',
  TOMORROW: 'tomorrow',
  YESTERDAY: 'yesterday',
  NOW: 'now',
  LATER: 'later',
  MORNING: 'in the morning',
  AFTERNOON: 'in the afternoon',
  EVENING: 'in the evening',
  NIGHT: 'at night'
};

const ADJECTIVES = {
  GOOD: 'good',
  BAD: 'bad',
  HAPPY: 'happy',
  SAD: 'sad',
  FAST: 'fast',
  SLOW: 'slow',
  NEAR: 'near',
  FAR: 'far',
  EXPENSIVE: 'expensive',
  CHEAP: 'cheap',
  HOT: 'hot',
  COLD_TEMP: 'cold',
  HUNGRY: 'hungry',
  THIRSTY: 'thirsty',
  SWEET: 'sweet',
  SPICY: 'spicy',
  FRESH: 'fresh',
  SICK: 'sick',
  HEALTHY: 'healthy',
  SAFE: 'safe',
  DANGER: 'dangerous',
  ANGRY: 'angry',
  TIRED: 'tired',
  BUSY: 'busy',
  READY: 'ready',
  SURE: 'sure',
  MAYBE: 'possible',
  CORRECT: 'correct',
  WRONG: 'wrong',
  BIG: 'big',
  SMALL: 'small'
};

const GREETINGS = {
  HELLO: 'Hello!',
  GOOD_MORNING: 'Good morning!',
  GOOD_AFTERNOON: 'Good afternoon!',
  GOOD_EVENING: 'Good evening!',
  GOOD_NIGHT: 'Good night!',
  WELCOME: 'Welcome!',
  THANK_YOU: 'Thank you!',
  PLEASE: 'Please',
  SORRY: 'Sorry',
  EXCUSE_ME: 'Excuse me',
  CONGRATULATIONS: 'Congratulations!',
  GOODBYE: 'Goodbye!'
};

// Dynamically register Tier 3 1,000-word vocabulary into grammar categories
const EXCLUDED_FROM_NOUNS = new Set(['YES', 'NO', 'NOT', 'PLEASE', 'THANK_YOU', 'SORRY', 'HELLO', 'HELP', 'WELCOME', 'I_ME', 'YOU', 'WE', 'THEY']);

if (Array.isArray(ISL_WORD_LABELS)) {
  for (const w of ISL_WORD_LABELS) {
    if (!w || !w.gloss) continue;
    const gloss = w.gloss;
    const cleanEng = (w.english || '').toLowerCase().replace(/^(the|a|an)\s+/i, '').trim();

    if (w.category === 'actions' && !VERBS[gloss]) {
      VERBS[gloss] = {
        base: cleanEng,
        continuous: cleanEng.endsWith('e') ? `${cleanEng.slice(0, -1)}ing` : `${cleanEng}ing`,
        present: cleanEng,
        gerund: cleanEng.endsWith('e') ? `${cleanEng.slice(0, -1)}ing` : `${cleanEng}ing`
      };
    } else if (['transit', 'healthcare', 'shopping_food', 'education_work', 'essentials'].includes(w.category) && !NOUNS[gloss] && !EXCLUDED_FROM_NOUNS.has(gloss)) {
      NOUNS[gloss] = {
        singular: `the ${cleanEng}`,
        bare: cleanEng,
        definite: `the ${cleanEng}`
      };
    } else if (w.category === 'feelings_states' && !ADJECTIVES[gloss]) {
      ADJECTIVES[gloss] = cleanEng;
    } else if (w.category === 'greetings' && !GREETINGS[gloss]) {
      GREETINGS[gloss] = `${capitalize(cleanEng)}!`;
    }
  }
}

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
    if (GREETINGS[t]) {
      return GREETINGS[t].endsWith('!') || GREETINGS[t].endsWith('.') ? GREETINGS[t] : `${GREETINGS[t]}.`;
    }
    if (t === 'YES') return 'Yes.';
    if (t === 'NO') return 'No.';
    if (t === 'HELP' || t === 'HELP_EMERGENCY') return 'Please help me!';
    if (t === 'EMERGENCY') return 'Emergency!';
    if (t === 'I_ME') return 'Me.';
    if (NOUNS[t]) return `${capitalize(NOUNS[t].bare)}.`;
    if (ADJECTIVES[t]) return `${capitalize(ADJECTIVES[t])}.`;
    return `${capitalize(t.toLowerCase().replace(/_/g, ' '))}.`;
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
    } else if (first === 'GOOD_AFTERNOON') {
      leadingPhrases.push('Good afternoon!');
      workTokens = workTokens.slice(1);
    } else if (first === 'GOOD_EVENING') {
      leadingPhrases.push('Good evening!');
      workTokens = workTokens.slice(1);
    } else if (first === 'GOOD_NIGHT') {
      leadingPhrases.push('Good night!');
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
    } else if (first === 'EXCUSE_ME') {
      leadingPhrases.push('Excuse me,');
      workTokens = workTokens.slice(1);
    } else if (first === 'PLEASE' && workTokens.length > 1) {
      if (workTokens[1] === 'HELP') {
        // ["PLEASE", "HELP"] is directly translated as "Please help me!"
        workTokens = workTokens.slice(1);
      } else {
        leadingPhrases.push('Please,');
        workTokens = workTokens.slice(1);
      }
    } else {
      break;
    }
  }

  // If only greetings were signed:
  if (workTokens.length === 0) {
    return leadingPhrases.join(' ');
  }

  // 3. Extract temporal modifier (e.g. TODAY, TOMORROW, YESTERDAY, NOW)
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
  // PATTERN A: WH-Question Inversion & Quantifiers (LING-04)
  // Check if clause ends with or contains a WH-question word
  // ----------------------------------------------------
  if (WH_QUESTIONS.has(lastToken) || (tokens.length > 1 && WH_QUESTIONS.has(firstToken))) {
    const wh = WH_QUESTIONS.has(lastToken) ? lastToken : firstToken;
    const nonWhTokens = tokens.filter(t => t !== wh);
    const subjectToken = nonWhTokens.find(t => PRONOUNS[t]);
    const nounToken = nonWhTokens.find(t => NOUNS[t]);
    const verbToken = nonWhTokens.find(t => VERBS[t]);
    const adjToken = nonWhTokens.find(t => ADJECTIVES[t]);

    // Sub-pattern A1: ["YOU", "NAME", "WHAT"] -> "What is your name?"
    if (wh === 'WHAT' && tokens.includes('NAME')) {
      const possessive = subjectToken && PRONOUNS[subjectToken] ? PRONOUNS[subjectToken].possessive : 'your';
      return `What is ${possessive} name?`;
    }

    // Sub-pattern A2: ["TIME", "WHAT"] -> "What time is it?"
    if (wh === 'WHAT' && tokens.includes('TIME')) {
      if (nounToken && nounToken !== 'TIME') {
        return `What is the ${NOUNS[nounToken].bare} time?`;
      }
      return 'What time is it?';
    }

    // Sub-pattern A3: HOW MUCH (Price & Fare queries):
    // e.g. ["TICKET", "HOW_MUCH"] -> "How much is the ticket?"
    // e.g. ["TICKET", "PRICE_COST", "HOW_MUCH"] -> "How much is the ticket price?"
    // e.g. ["WATER", "HOW_MUCH"] -> "How much is the water?"
    if (wh === 'HOW_MUCH') {
      if (tokens.includes('TICKET') && tokens.includes('PRICE_COST')) {
        return 'How much is the ticket price?';
      }
      if (nounToken) {
        return `How much is ${NOUNS[nounToken].singular}?`;
      }
      return 'How much does it cost?';
    }

    // Sub-pattern A4: HOW MANY (Quantities):
    // e.g. ["SEAT", "HOW_MANY"] -> "How many seats are there?"
    if (wh === 'HOW_MANY') {
      if (nounToken) {
        const nounPlural = NOUNS[nounToken].bare.endsWith('s') ? NOUNS[nounToken].bare : `${NOUNS[nounToken].bare}s`;
        return `How many ${nounPlural} are there?`;
      }
      return 'How many are there?';
    }

    // Sub-pattern A5: WHICH (Transit/Platform/Train):
    // e.g. ["PLATFORM", "WHICH"] -> "Which platform is it?"
    // e.g. ["TRAIN", "WHICH"] -> "Which train is it?"
    if (wh === 'WHICH') {
      if (nounToken) {
        return `Which ${NOUNS[nounToken].bare} is it?`;
      }
      return 'Which one?';
    }

    // Sub-pattern A6: WHERE (Locations, Transit & Essentials):
    // e.g. ["HOSPITAL", "WHERE"], ["DOCTOR", "WHERE"], ["PLATFORM", "WHERE"]
    if (wh === 'WHERE') {
      if (verbToken === 'GO') {
        const subj = subjectToken ? PRONOUNS[subjectToken].subject : 'you';
        const copula = subjectToken ? PRONOUNS[subjectToken].copula : 'are';
        return `Where ${copula} ${subj} going?`;
      }
      if (nounToken) {
        return `Where is ${NOUNS[nounToken].singular}?`;
      }
      const unknownCandidate = nonWhTokens.find(t => !PRONOUNS[t] && !VERBS[t] && !NOUNS[t]);
      if (unknownCandidate) {
        return `Where is the ${unknownCandidate.toLowerCase().replace(/_/g, ' ')}?`;
      }
      return 'Where is it?';
    }

    // Sub-pattern A7: HOW (State or Assistance):
    // e.g. ["YOU", "HOW"] -> "How are you?"
    // e.g. ["HELP", "HOW"] -> "How can I help you?"
    if (wh === 'HOW') {
      if (tokens.includes('HELP')) {
        return 'How can I help you?';
      }
      if (subjectToken) {
        return `How ${PRONOUNS[subjectToken].copula} ${PRONOUNS[subjectToken].subject}?`;
      }
      return 'How is it?';
    }

    // Sub-pattern A8: WHY (Reasons & Feelings):
    // e.g. ["YOU", "SAD", "WHY"] -> "Why are you sad?"
    if (wh === 'WHY') {
      const subj = subjectToken ? PRONOUNS[subjectToken].subject : 'you';
      const copula = subjectToken ? PRONOUNS[subjectToken].copula : 'are';
      if (adjToken) {
        return `Why ${copula} ${subj} ${ADJECTIVES[adjToken]}?`;
      }
      if (verbToken) {
        return `Why are ${subj} ${VERBS[verbToken].gerund}?`;
      }
      return `Why ${copula} ${subj}?`;
    }

    // Sub-pattern A9: WHEN (Transit schedule & Arrival):
    // e.g. ["TRAIN", "ARRIVE", "WHEN"] -> "When will the train arrive?"
    // e.g. ["YOU", "COME", "WHEN"] -> "When will you come?"
    if (wh === 'WHEN') {
      const subj = subjectToken ? PRONOUNS[subjectToken].subject : (nounToken ? NOUNS[nounToken].singular : 'you');
      if (verbToken) {
        return `When will ${subj} ${VERBS[verbToken].base}?`;
      }
      if (nounToken) {
        return `When is ${NOUNS[nounToken].singular}?`;
      }
      return 'When will it be?';
    }

    // Sub-pattern A10: WHO:
    // e.g. ["YOU", "WHO"] -> "Who are you?"
    if (wh === 'WHO') {
      if (subjectToken) {
        return `Who ${PRONOUNS[subjectToken].copula} ${PRONOUNS[subjectToken].subject}?`;
      }
      return 'Who is that?';
    }

    // Sub-pattern A11: WHAT:
    // e.g. ["YOU", "EAT", "WHAT"] -> "What do you eat?"
    if (wh === 'WHAT') {
      if (verbToken) {
        const subj = subjectToken ? PRONOUNS[subjectToken].subject : 'you';
        return `What do ${subj} ${VERBS[verbToken].base}?`;
      }
      if (nounToken) {
        return `What is ${NOUNS[nounToken].singular}?`;
      }
    }

    // Generic WH fallback: Put WH-word at front
    const remaining = nonWhTokens.map(t => t.toLowerCase().replace(/_/g, ' ')).join(' ');
    const whDisplay = wh.replace(/_/g, ' ').toLowerCase();
    return `${capitalize(whDisplay)} ${remaining}?`;
  }

  // ----------------------------------------------------
  // PATTERN B: Emergency & Urgent Calls
  // e.g. ["EMERGENCY", "HELP", "PLEASE"] -> "Please help, it is an emergency!"
  // e.g. ["AMBULANCE", "CALL", "PLEASE"] -> "Please call the ambulance."
  // e.g. ["POLICE", "CALL", "PLEASE"] -> "Please call the police."
  // ----------------------------------------------------
  if (tokens.includes('EMERGENCY') || tokens.includes('HELP_EMERGENCY')) {
    if (tokens.includes('PLEASE') || tokens.includes('HELP')) {
      return 'Please help, it is an emergency!';
    }
    return 'This is an emergency!';
  }

  if (tokens.includes('CALL')) {
    const targetNoun = tokens.find(t => t === 'AMBULANCE' || t === 'POLICE' || t === 'DOCTOR');
    if (targetNoun) {
      const prefix = tokens.includes('PLEASE') ? 'Please ' : '';
      return `${prefix}call ${NOUNS[targetNoun].singular}.`;
    }
  }

  // ----------------------------------------------------
  // PATTERN C: Name Introductions with Fingerspelling
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
  // PATTERN D: Medical Symptoms & Pain Conditions
  // e.g. ["I_ME", "FEVER"] -> "I have a fever."
  // e.g. ["I_ME", "HEADACHE"] -> "I have a headache."
  // e.g. ["I_ME", "MEDICINE", "NEED"] -> "I need medicine."
  // ----------------------------------------------------
  const medicalConditions = ['FEVER', 'HEADACHE', 'STOMACHACHE', 'COUGH', 'COLD_SICK', 'PAIN'];
  const condToken = tokens.find(t => medicalConditions.includes(t));
  if (condToken) {
    const subjToken = tokens.find(t => PRONOUNS[t]);
    const subj = subjToken ? PRONOUNS[subjToken].subject : 'I';
    if (tokens.includes('NEED') || tokens.includes('WANT')) {
      return `${capitalize(subj)} need medicine for ${NOUNS[condToken].bare}.`;
    }
    return `${capitalize(subj)} have ${NOUNS[condToken].singular}.`;
  }

  // ----------------------------------------------------
  // PATTERN E: Negation with NO / NOT (e.g. ["I_ME", "UNDERSTAND", "NO"])
  // ----------------------------------------------------
  if (lastToken === 'NO' || tokens.includes('NO')) {
    const verbToken = tokens.find(t => VERBS[t]);
    const subjToken = tokens.find(t => PRONOUNS[t]);
    const subj = subjToken ? PRONOUNS[subjToken].subject : 'I';
    const noun = tokens.find(t => NOUNS[t]);
    const unknownNoun = tokens.find(t => t !== 'NO' && !PRONOUNS[t] && !VERBS[t] && !NOUNS[t]);
    const objStr = noun ? NOUNS[noun].bare : (unknownNoun ? unknownNoun.toLowerCase().replace(/_/g, ' ') : '');

    if (verbToken) {
      const suffix = objStr ? ` ${objStr}` : '';
      return `${capitalize(subj)} do not ${VERBS[verbToken].base}${suffix}.`;
    }
    if (noun) {
      return `No ${NOUNS[noun].bare}.`;
    }
    if (unknownNoun) {
      return `No ${unknownNoun.toLowerCase().replace(/_/g, ' ')}.`;
    }
    return 'No.';
  }

  // ----------------------------------------------------
  // PATTERN F: Politeness & Requests (e.g. ["PLEASE", "HELP"], ["HELP", "PLEASE"])
  // ----------------------------------------------------
  if (tokens.includes('HELP')) {
    if (tokens.includes('PLEASE') || tokens.length === 1) {
      return 'Please help me!';
    }
    if (tokens.includes('WANT') || tokens.includes('NEED')) {
      const subjToken = tokens.find(t => PRONOUNS[t]);
      const subj = subjToken ? PRONOUNS[subjToken].subject : 'I';
      return `${capitalize(subj)} need help.`;
    }
  }
  if (tokens.includes('PLEASE') && tokens.includes('WAIT')) {
    return 'Please wait.';
  }

  // ----------------------------------------------------
  // PATTERN G: Conversational Responses with YES / GOOD
  // e.g. ["DRINK", "YES", "GOOD"] -> "Yes, a drink is good."
  // e.g. ["YES", "GOOD"] -> "Yes, that is good."
  // e.g. ["DRINK", "YES"] -> "Yes, I would like a drink."
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
        const item = nonMarkerTokens[0];
        if (item === 'DRINK') return 'Yes, a drink is good.';
        if (item === 'FOOD') return 'Yes, food is good.';
        if (item === 'WATER') return 'Yes, water is good.';
        if (NOUNS[item]) return `Yes, ${NOUNS[item].bare} is good.`;
        if (VERBS[item]) return `Yes, ${VERBS[item].gerund} is good.`;
      }
      const item = nonMarkerTokens[0];
      if (item === 'DRINK') return 'Yes, I would like a drink.';
      if (item === 'FOOD') return 'Yes, I would like food.';
      if (item === 'WATER') return 'Yes, water, thank you.';
      if (NOUNS[item]) return `Yes, ${NOUNS[item].bare}, please.`;

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
  // PATTERN H: SOV to SVO Reordering (LING-03)
  // Handles explicit subjects ("I_ME WATER WANT")
  // and implicit first-person subjects ("WATER WANT", "HOME GO")
  // ----------------------------------------------------
  const subjectToken = PRONOUNS[firstToken] ? firstToken : null;
  const verbToken = tokens.find(t => VERBS[t]);
  const nounToken = tokens.find(t => NOUNS[t]);

  if (verbToken) {
    const subj = subjectToken ? PRONOUNS[subjectToken].subject : 'I';
    const copula = subjectToken ? PRONOUNS[subjectToken].copula : 'am';

    // Compound desire verbs: ["WATER", "DRINK", "WANT"] -> "I want to drink water."
    // ["TRAIN", "TICKET", "BUY", "WANT"] -> "I want to buy a train ticket."
    if (tokens.includes('WANT') && tokens.some(t => VERBS[t] && t !== 'WANT')) {
      const actionVerb = tokens.find(t => VERBS[t] && t !== 'WANT');
      let object = '';
      if (tokens.includes('TRAIN') && tokens.includes('TICKET')) {
        object = ' a train ticket';
      } else if (nounToken) {
        object = ` ${NOUNS[nounToken].bare}`;
      }
      return `${capitalize(subj)} want to ${VERBS[actionVerb].base}${object}.`;
    }

    // Compound necessity: ["MEDICINE", "BUY", "NEED"] -> "I need to buy medicine."
    if (tokens.includes('NEED') && tokens.some(t => VERBS[t] && t !== 'NEED')) {
      const actionVerb = tokens.find(t => VERBS[t] && t !== 'NEED');
      const object = nounToken ? ` ${NOUNS[nounToken].bare}` : '';
      return `${capitalize(subj)} need to ${VERBS[actionVerb].base}${object}.`;
    }

    // NEED alone with noun: ["I_ME", "MEDICINE", "NEED"] -> "I need medicine."
    if (verbToken === 'NEED') {
      const object = nounToken ? ` ${NOUNS[nounToken].bare}` : '';
      return `${capitalize(subj)} need${object}.`;
    }

    // BUY alone: ["I_ME", "TICKET", "BUY"] -> "I am buying the ticket."
    if (verbToken === 'BUY') {
      const object = nounToken ? ` ${NOUNS[nounToken].singular}` : '';
      return `${capitalize(subj)} ${copula} buying${object}.`;
    }

    // Motion verbs: GO, COME
    if (verbToken === 'GO') {
      const destination = nounToken ? NOUNS[nounToken].singular : 'there';
      return `${capitalize(subj)} ${copula} going to ${destination}.`.replace('going to home', 'going home');
    }
    if (verbToken === 'COME') {
      return `${capitalize(subj)} ${copula} coming.`;
    }

    const unknownObject = tokens.find(t => t !== verbToken && t !== subjectToken && !PRONOUNS[t] && !VERBS[t] && !TEMPORALS[t]);
    const objName = unknownObject ? unknownObject.toLowerCase().replace(/_/g, ' ') : '';

    // Action verbs: EAT, DRINK
    if (verbToken === 'EAT') {
      const food = nounToken ? NOUNS[nounToken].bare : (objName || 'food');
      return `${capitalize(subj)} ${copula} eating ${food}.`;
    }
    if (verbToken === 'DRINK') {
      const drink = nounToken ? NOUNS[nounToken].bare : (objName || 'water');
      return `${capitalize(subj)} ${copula} drinking ${drink}.`;
    }

    // WANT
    if (verbToken === 'WANT') {
      const object = nounToken ? NOUNS[nounToken].bare : (objName || 'it');
      return `${capitalize(subj)} want ${object}.`;
    }

    // HELP
    if (verbToken === 'HELP') {
      return `${capitalize(subj)} need help.`;
    }

    // SEE
    if (verbToken === 'SEE') {
      const target = nounToken ? NOUNS[nounToken].singular : (objName || 'it');
      return `${capitalize(subj)} want to see ${target}.`;
    }

    // SLEEP
    if (verbToken === 'SLEEP') {
      return `${capitalize(subj)} want to sleep.`;
    }

    // General Subject + Verb + Noun
    const object = nounToken ? ` ${NOUNS[nounToken].singular}` : (objName ? ` ${objName}` : '');
    return `${capitalize(subj)} ${VERBS[verbToken].present}${object}.`;
  }

  // ----------------------------------------------------
  // PATTERN I: Subject + Adjective (e.g. ["I_ME", "HAPPY"] -> "I am happy.")
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
  // PATTERN J: Noun + Adjective (e.g. ["FAMILY", "GOOD"] -> "My family is good.")
  // ----------------------------------------------------
  if (nounToken) {
    const adjToken = tokens.find(t => ADJECTIVES[t]);
    if (adjToken) {
      return `My ${NOUNS[nounToken].bare} is ${ADJECTIVES[adjToken]}.`;
    }
  }

  // ----------------------------------------------------
  // PATTERN K: Polite Thanks / Closing (e.g. ["THANK_YOU", "FRIEND"])
  // ----------------------------------------------------
  if (tokens.includes('THANK_YOU') && tokens.includes('FRIEND')) {
    return 'Thank you, my friend!';
  }

  // ----------------------------------------------------
  // FALLBACK: Cleanly joined lowercase tokens with period
  // ----------------------------------------------------
  const cleaned = tokens
    .filter(Boolean)
    .map(t => {
      if (PRONOUNS[t]) return PRONOUNS[t].subject;
      if (NOUNS[t]) return NOUNS[t].bare;
      if (VERBS[t]) return VERBS[t].base;
      if (ADJECTIVES[t]) return ADJECTIVES[t];
      return String(t).toLowerCase().replace(/_/g, ' ');
    })
    .join(' ');

  return cleaned ? `${capitalize(cleaned)}.` : '';
}

// Alias for convenience
export const islGlossesToEnglish = formatIslSentence;

export default formatIslSentence;
