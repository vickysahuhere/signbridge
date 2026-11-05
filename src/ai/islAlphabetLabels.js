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
