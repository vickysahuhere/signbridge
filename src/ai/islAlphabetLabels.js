/**
 * Indian Sign Language (ISL) Alphabet and Digit Class Labels.
 *
 * 36 Classes:
 * - Indices 0–25: Alphabets 'A' through 'Z'
 * - Indices 26–35: Digits '0' through '9'
 */

export const ISL_ALPHABET_LABELS = Object.freeze([
  // A–Z (26 letters)
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J',
  'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T',
  'U', 'V', 'W', 'X', 'Y', 'Z',
  // 0–9 (10 digits)
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9'
]);

export const CLASS_COUNT = ISL_ALPHABET_LABELS.length; // 36

/**
 * Authentic Indian Sign Language (ISL) Fingerspelling Reference Guide.
 * Grounded in two-handed ISL standard morphology (ISLRTC) with single-handed fallback.
 */
export const ISL_ALPHABET_GUIDE = Object.freeze([
  {
    letter: 'A',
    category: 'Vowel',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Touch the tip of your non-dominant thumb with your dominant index finger. (Or single-handed: closed fist with thumb upright along the side).',
    tip: 'Vowel #1: Non-dominant thumb tip'
  },
  {
    letter: 'B',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Both hands form circles with thumb and index touching, joined together like binoculars (or 4 straight fingers upright with thumb folded).',
    tip: 'Circles joined or 4 fingers up'
  },
  {
    letter: 'C',
    category: 'Consonant',
    type: 'Single-Handed',
    description: 'Hand curved into a clear, open "C" shape facing inward.',
    tip: 'Curved open arc'
  },
  {
    letter: 'D',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Non-dominant index pointing vertically up; dominant thumb and index form a curved semicircle touching its tip and base to form a "D".',
    tip: 'Form a D against vertical index'
  },
  {
    letter: 'E',
    category: 'Vowel',
    type: 'Two-Handed ISL',
    description: 'Touch the tip of your non-dominant index finger with your dominant index finger.',
    tip: 'Vowel #2: Non-dominant index tip'
  },
  {
    letter: 'F',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Dominant index and middle fingers placed horizontally across non-dominant index and middle fingers.',
    tip: 'Two fingers crossed horizontally'
  },
  {
    letter: 'G',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Dominant fist placed on top of or against non-dominant fist (or index and thumb pointing horizontally).',
    tip: 'Fists stacked or horizontal index'
  },
  {
    letter: 'H',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Dominant flat open palm placed flat across non-dominant open palm.',
    tip: 'Flat hand sweeping across palm'
  },
  {
    letter: 'I',
    category: 'Vowel',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Touch the tip of your non-dominant middle finger with your dominant index finger. (Or single-handed: pinky extended straight up from fist).',
    tip: 'Vowel #3: Middle tip / Pinky up'
  },
  {
    letter: 'J',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Dominant index touches non-dominant middle fingertip and draws a "J" curve down the palm to the wrist.',
    tip: 'Trace down palm from middle finger'
  },
  {
    letter: 'K',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Dominant index finger hooked/bent touching the first knuckle/joint of non-dominant extended index finger.',
    tip: 'Hooked finger on index joint'
  },
  {
    letter: 'L',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Dominant extended index finger resting vertically on non-dominant flat palm (forming an "L"). Or thumb and index at 90° angle.',
    tip: 'Vertical index on flat palm / L-shape'
  },
  {
    letter: 'M',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Dominant 3 fingers (index, middle, ring) resting downward onto non-dominant flat palm.',
    tip: '3 fingers resting on palm'
  },
  {
    letter: 'N',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Dominant 2 fingers (index, middle) resting downward onto non-dominant flat palm.',
    tip: '2 fingers resting on palm'
  },
  {
    letter: 'O',
    category: 'Vowel',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Touch the tip of your non-dominant ring finger with your dominant index finger. (Or single-handed: all fingertips touching thumb tip forming an O).',
    tip: 'Vowel #4: Ring tip / O-circle'
  },
  {
    letter: 'P',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Dominant thumb and index form a circle loop touching the tip of non-dominant index finger pointing vertically up.',
    tip: 'Circle loop touching index tip'
  },
  {
    letter: 'Q',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Dominant thumb and index form a circle hooked around the base of non-dominant extended thumb.',
    tip: 'Circle hooked onto thumb'
  },
  {
    letter: 'R',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Dominant hooked/curved index finger resting on the center of non-dominant flat palm.',
    tip: 'Hooked finger on palm'
  },
  {
    letter: 'S',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Dominant pinky finger hooked with non-dominant pinky finger, or dominant closed fist resting against non-dominant palm.',
    tip: 'Pinkies linked or fist on palm'
  },
  {
    letter: 'T',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Dominant extended index finger touching the side edge of non-dominant flat palm near the pinky base.',
    tip: 'Index touching side edge of palm'
  },
  {
    letter: 'U',
    category: 'Vowel',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Touch the tip of your non-dominant pinky finger with your dominant index finger. (Or single-handed: index and middle extended together).',
    tip: 'Vowel #5: Pinky tip'
  },
  {
    letter: 'V',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Dominant index and middle fingers spread in a "V" resting on non-dominant open palm (or single-handed peace sign).',
    tip: 'V on palm / Peace sign'
  },
  {
    letter: 'W',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Both hands with open palms, fingers interlaced together (or single-handed 3 fingers spread up).',
    tip: 'Interlaced fingers / 3 fingers up'
  },
  {
    letter: 'X',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Both index fingers crossed over each other to form an "X".',
    tip: 'Crossed index fingers'
  },
  {
    letter: 'Y',
    category: 'Consonant',
    type: 'Two-Handed ISL / 1-Hand',
    description: 'Dominant index finger placed into the V-crotch between non-dominant extended thumb and index finger (or thumb and pinky extended).',
    tip: 'Index in thumb-index crotch'
  },
  {
    letter: 'Z',
    category: 'Consonant',
    type: 'Two-Handed ISL',
    description: 'Dominant flat hand resting along the upper edge of non-dominant flat hand.',
    tip: 'Flat hand on hand edge'
  }
]);

/**
 * Get class label string by index
 * @param {number} index
 * @returns {string}
 */
export function getLabel(index) {
  if (typeof index !== 'number' || index < 0 || index >= CLASS_COUNT) {
    return '?';
  }
  return ISL_ALPHABET_LABELS[index];
}

/**
 * Get class index by character label
 * @param {string} label
 * @returns {number} Index 0-35, or -1 if not found
 */
export function getIndex(label) {
  if (!label || typeof label !== 'string') return -1;
  return ISL_ALPHABET_LABELS.indexOf(label.toUpperCase());
}
