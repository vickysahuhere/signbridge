/**
 * 50 Core Indian Sign Language (ISL) Conversational Vocabulary.
 * Based on the AI4Bharat INCLUDE dataset domain taxonomy.
 */

export const ISL_WORD_CATEGORIES = Object.freeze([
  { id: 'greetings', name: 'Greetings & Politeness' },
  { id: 'pronouns', name: 'Pronouns' },
  { id: 'questions', name: 'Questions (WH-)' },
  { id: 'actions', name: 'Actions & Verbs' },
  { id: 'essentials', name: 'Essentials & Places' }
]);

export const ISL_WORD_LABELS = Object.freeze([
  // --- Greetings & Politeness (6) ---
  {
    id: 0,
    gloss: 'HELLO',
    english: 'Hello / Namaste',
    category: 'greetings',
    description: 'Palms pressed together at chest level in traditional Namaste posture, or open palm waved gently near forehead.'
  },
  {
    id: 1,
    gloss: 'GOOD_MORNING',
    english: 'Good Morning',
    category: 'greetings',
    description: 'Thumbs-up moving forward followed by dominant hand rising upward like the morning sun.'
  },
  {
    id: 2,
    gloss: 'WELCOME',
    english: 'Welcome',
    category: 'greetings',
    description: 'Both open palms held upward and swept inward toward the chest welcomingly.'
  },
  {
    id: 3,
    gloss: 'THANK_YOU',
    english: 'Thank You',
    category: 'greetings',
    description: 'Fingertips of dominant flat hand touch chin and extend outward towards text partner.'
  },
  {
    id: 4,
    gloss: 'PLEASE',
    english: 'Please',
    category: 'greetings',
    description: 'Open flat hand rubs in a circular clockwise motion over the center of the chest.'
  },
  {
    id: 5,
    gloss: 'SORRY',
    english: 'Sorry',
    category: 'greetings',
    description: 'Closed fist with thumb extended rotates gently in a circular motion over heart.'
  },

  // --- Pronouns (4) ---
  {
    id: 6,
    gloss: 'I_ME',
    english: 'I / Me',
    category: 'pronouns',
    description: 'Index finger of dominant hand points directly to the center of the chest.'
  },
  {
    id: 7,
    gloss: 'YOU',
    english: 'You',
    category: 'pronouns',
    description: 'Index finger of dominant hand points directly forward towards conversational partner.'
  },
  {
    id: 8,
    gloss: 'WE',
    english: 'We / Us',
    category: 'pronouns',
    description: 'Dominant index finger arcs in an expansive horizontal semi-circle from signer around to front.'
  },
  {
    id: 9,
    gloss: 'THEY',
    english: 'They / Them',
    category: 'pronouns',
    description: 'Dominant hand gestures outward with sweeping motion towards third-party direction.'
  },

  // --- Questions (WH-) (6) ---
  {
    id: 10,
    gloss: 'WHAT',
    english: 'What',
    category: 'questions',
    description: 'Both palms held face up at waist level, oscillating side to side with furrowed eyebrows.'
  },
  {
    id: 11,
    gloss: 'WHERE',
    english: 'Where',
    category: 'questions',
    description: 'Dominant index finger held vertically and shaken gently side-to-side with questioning expression.'
  },
  {
    id: 12,
    gloss: 'WHO',
    english: 'Who',
    category: 'questions',
    description: 'Dominant index finger circles around the mouth or touches chin with furrowed brows.'
  },
  {
    id: 13,
    gloss: 'WHY',
    english: 'Why',
    category: 'questions',
    description: 'Dominant hand moves away from forehead, dropping into a Y-handshape or open palm.'
  },
  {
    id: 14,
    gloss: 'WHEN',
    english: 'When',
    category: 'questions',
    description: 'Dominant index finger circles around non-dominant index fingertip and lands gently.'
  },
  {
    id: 15,
    gloss: 'HOW',
    english: 'How',
    category: 'questions',
    description: 'Both cupped hands with knuckles touching twist upward and open into palms-up position.'
  },

  // --- Actions & Verbs (13) ---
  {
    id: 16,
    gloss: 'GO',
    english: 'Go',
    category: 'actions',
    description: 'Both index fingers point forward and move decisively away from the body.'
  },
  {
    id: 17,
    gloss: 'COME',
    english: 'Come',
    category: 'actions',
    description: 'Both hands with open palms facing inward beckon gently toward the chest.'
  },
  {
    id: 18,
    gloss: 'EAT',
    english: 'Eat',
    category: 'actions',
    description: 'Dominant fingertips pinched together move toward and touch the mouth repeatedly.'
  },
  {
    id: 19,
    gloss: 'DRINK',
    english: 'Drink',
    category: 'actions',
    description: 'Dominant C-handshape tilts upward toward the mouth mimicking holding and drinking from a cup.'
  },
  {
    id: 20,
    gloss: 'HELP',
    english: 'Help',
    category: 'actions',
    description: 'Closed fist with thumb up rests on open palm of non-dominant hand; both elevate together.'
  },
  {
    id: 21,
    gloss: 'WORK',
    english: 'Work',
    category: 'actions',
    description: 'Both fists tap wrists together repeatedly in rhythmic downward striking motion.'
  },
  {
    id: 22,
    gloss: 'STUDY',
    english: 'Study / Learn',
    category: 'actions',
    description: 'Dominant fingertips touch non-dominant open flat palm and draw inward to forehead.'
  },
  {
    id: 23,
    gloss: 'SLEEP',
    english: 'Sleep',
    category: 'actions',
    description: 'Both flat palms pressed together tilt to cheek as head rests gently against them.'
  },
  {
    id: 24,
    gloss: 'WAIT',
    english: 'Wait',
    category: 'actions',
    description: 'Both hands held forward with curved fingers wiggling gently in place.'
  },
  {
    id: 25,
    gloss: 'SEE',
    english: 'See / Look',
    category: 'actions',
    description: 'V-handshape (index and middle fingers) points from eyes forward in line of sight.'
  },
  {
    id: 26,
    gloss: 'KNOW',
    english: 'Know',
    category: 'actions',
    description: 'Fingertips of dominant flat hand tap the temple of the forehead twice.'
  },
  {
    id: 27,
    gloss: 'UNDERSTAND',
    english: 'Understand',
    category: 'actions',
    description: 'Index finger flickers upward from closed fist near temple like a lightbulb turning on.'
  },
  {
    id: 28,
    gloss: 'WANT',
    english: 'Want',
    category: 'actions',
    description: 'Both open palms held face up with curved claw fingers pull inward toward chest.'
  },

  // --- Essentials & Places (21) ---
  {
    id: 29,
    gloss: 'YES',
    english: 'Yes',
    category: 'essentials',
    description: 'Dominant fist nods up and down at wrist mimicking a nodding head.'
  },
  {
    id: 30,
    gloss: 'NO',
    english: 'No',
    category: 'essentials',
    description: 'Index and middle fingers snap down against thumb in quick horizontal closure.'
  },
  {
    id: 31,
    gloss: 'GOOD',
    english: 'Good',
    category: 'essentials',
    description: 'Fingertips touch chin and move downward into an open palm resting in non-dominant hand.'
  },
  {
    id: 32,
    gloss: 'BAD',
    english: 'Bad',
    category: 'essentials',
    description: 'Dominant flat hand touches chin and twists outward and downward abruptly.'
  },
  {
    id: 33,
    gloss: 'HAPPY',
    english: 'Happy',
    category: 'essentials',
    description: 'Open flat hand brushes upward across chest repeatedly in light uplifting strokes.'
  },
  {
    id: 34,
    gloss: 'SAD',
    english: 'Sad',
    category: 'essentials',
    description: 'Both open hands in front of face drop slowly downward as facial expression falls.'
  },
  {
    id: 35,
    gloss: 'HOSPITAL',
    english: 'Hospital',
    category: 'essentials',
    description: 'Index and middle fingers trace a cross symbol on the upper shoulder/arm.'
  },
  {
    id: 36,
    gloss: 'DOCTOR',
    english: 'Doctor',
    category: 'essentials',
    description: 'Three fingertips tap the inside wrist of non-dominant arm checking pulse.'
  },
  {
    id: 37,
    gloss: 'MEDICINE',
    english: 'Medicine',
    category: 'essentials',
    description: 'Middle finger stirs in small circular motion inside non-dominant palm.'
  },
  {
    id: 38,
    gloss: 'POLICE',
    english: 'Police',
    category: 'essentials',
    description: 'C-handshape taps upper left chest over heart mimicking police badge.'
  },
  {
    id: 39,
    gloss: 'WATER',
    english: 'Water',
    category: 'essentials',
    description: 'W-handshape (three middle fingers upright) taps index finger against chin twice.'
  },
  {
    id: 40,
    gloss: 'FOOD',
    english: 'Food',
    category: 'essentials',
    description: 'Fingertips clustered together tap lips twice in rhythmic eating gesture.'
  },
  {
    id: 41,
    gloss: 'TIME',
    english: 'Time',
    category: 'essentials',
    description: 'Dominant index finger taps the wrist of non-dominant hand where a wristwatch sits.'
  },
  {
    id: 42,
    gloss: 'TODAY',
    english: 'Today',
    category: 'essentials',
    description: 'Both Y-handshapes or open palms drop downward firmly in front of body twice.'
  },
  {
    id: 43,
    gloss: 'TOMORROW',
    english: 'Tomorrow',
    category: 'essentials',
    description: 'Dominant thumb touches cheek and arcs forward in positive arc.'
  },
  {
    id: 44,
    gloss: 'YESTERDAY',
    english: 'Yesterday',
    category: 'essentials',
    description: 'Dominant thumb touches chin then moves backward along jawline toward ear.'
  },
  {
    id: 45,
    gloss: 'HOME',
    english: 'Home',
    category: 'essentials',
    description: 'Fingertips touch corner of mouth then move back to touch near ear.'
  },
  {
    id: 46,
    gloss: 'SCHOOL',
    english: 'School',
    category: 'essentials',
    description: 'Flat open hands clap palms together twice in horizontal orientation.'
  },
  {
    id: 47,
    gloss: 'NAME',
    english: 'Name',
    category: 'essentials',
    description: 'Index and middle fingers of both H-hands tap across each other twice.'
  },
  {
    id: 48,
    gloss: 'FRIEND',
    english: 'Friend',
    category: 'essentials',
    description: 'Both hooked index fingers interlock together, then flip and hook the opposite way.'
  },
  {
    id: 49,
    gloss: 'FAMILY',
    english: 'Family',
    category: 'essentials',
    description: 'Both F-handshapes with index and thumb circles touching trace outward circle until pinkies touch.'
  }
]);

export const WORD_COUNT = ISL_WORD_LABELS.length; // 50

export function getWordById(id) {
  if (typeof id !== 'number' || id < 0 || id >= WORD_COUNT) return null;
  return ISL_WORD_LABELS[id];
}

export function getWordByGloss(gloss) {
  if (!gloss || typeof gloss !== 'string') return null;
  const upper = gloss.trim().toUpperCase();
  return ISL_WORD_LABELS.find(w => w.gloss === upper) || null;
}
