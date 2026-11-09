/**
 * GlossBufferManager
 * 
 * Manages the active sequence of recognized ISL gloss tokens:
 * - Automatically debounces and rejects adjacent duplicate signs (LING-01).
 * - Concatenates contiguous fingerspelled alphabet characters into a single spelled word entity.
 * - Provides manual editing methods: undo last sign and clear all (LING-02).
 */
/**
 * Authentic Indian Sign Language (ISLRTC) Compound Sign Rules.
 * When root signs are produced in sequence within a temporal window,
 * they automatically fuse into their compound sign representation.
 */
export const ISL_COMPOUND_RULES = Object.freeze([
  { parts: ['GOOD', 'MORNING'], compound: 'GOOD_MORNING' },
  { parts: ['GOOD', 'AFTERNOON'], compound: 'GOOD_AFTERNOON' },
  { parts: ['GOOD', 'EVENING'], compound: 'GOOD_EVENING' },
  { parts: ['GOOD', 'NIGHT'], compound: 'GOOD_NIGHT' },
  { parts: ['MORNING', 'EAT'], compound: 'BREAKFAST' },
  { parts: ['AFTERNOON', 'EAT'], compound: 'LUNCH' },
  { parts: ['NIGHT', 'EAT'], compound: 'DINNER' },
  { parts: ['DOCTOR', 'HOUSE'], compound: 'HOSPITAL' },
  { parts: ['DOCTOR', 'HOME'], compound: 'HOSPITAL' },
  { parts: ['MEDICINE', 'SHOP'], compound: 'PHARMACY' }
]);

export class GlossBufferManager {
  constructor() {
    this.buffer = [];
  }

  /**
   * Pushes a recognized sign or character token to the active buffer.
   * @param {string} token - Sign gloss identifier (e.g. 'HOSPITAL') or alphabet character ('A').
   * @param {'word'|'letter'} [type='word'] - Type of the gesture.
   * @returns {boolean} True if the token was appended or merged, false if rejected/deduplicated.
   */
  push(token, type = 'word') {
    if (!token || typeof token !== 'string') return false;
    const cleanToken = token.trim();
    if (!cleanToken) return false;

    const isSingleChar = /^[A-Z0-9]$/i.test(cleanToken);
    const now = Date.now();

    // If pushing a letter and the previous token is a spelled word, concatenate
    if (type === 'letter' && isSingleChar && this.buffer.length > 0) {
      const last = this.buffer[this.buffer.length - 1];
      if (last.isSpelled) {
        // Debounce: prevent adding the exact same character unless at least 450ms has passed
        const lastChar = last.gloss.slice(-1);
        if (lastChar === cleanToken.toUpperCase() && (now - last.timestamp) < 450) {
          return false;
        }
        last.gloss += cleanToken.toUpperCase();
        last.timestamp = now;
        return true;
      }
    }

    // Adjacent duplicate check (LING-01)
    if (this.buffer.length > 0) {
      const last = this.buffer[this.buffer.length - 1];
      if (last.gloss === cleanToken) {
        return false; // Deduplicated
      }

      // Compound Sign Fusion:
      // If preceding token and incoming token form an authentic ISL compound within 4 seconds,
      // fuse them into the unified compound sign entity.
      if (type === 'word' && (now - last.timestamp) < 4000) {
        const matchRule = ISL_COMPOUND_RULES.find(rule =>
          rule.parts[0] === last.gloss && rule.parts[1] === cleanToken
        );
        if (matchRule) {
          last.gloss = matchRule.compound;
          last.isCompound = true;
          last.timestamp = now;
          return true;
        }
      }
    }

    this.buffer.push({
      gloss: cleanToken,
      type,
      isSpelled: type === 'letter' && isSingleChar,
      timestamp: now
    });

    return true;
  }

  /**
   * Removes the most recently added sign from the buffer (LING-02).
   * @returns {string|null} The popped token gloss, or null if buffer was empty.
   */
  undo() {
    if (this.buffer.length === 0) return null;
    const removed = this.buffer.pop();
    return removed ? removed.gloss : null;
  }

  /**
   * Removes a sign token at the specified index from the buffer (1-click remove).
   * @param {number} index - The index of the token to remove.
   * @returns {string|null} The removed token gloss, or null if invalid index.
   */
  removeAt(index) {
    if (typeof index !== 'number' || index < 0 || index >= this.buffer.length) {
      return null;
    }
    const removed = this.buffer.splice(index, 1);
    return removed.length > 0 ? removed[0].gloss : null;
  }

  /**
   * Replaces the most recently added sign in the buffer with an alternative choice.
   * If the buffer is empty, acts as push().
   * @param {string} token - New sign gloss identifier or alphabet character.
   * @param {'word'|'letter'} [type='word'] - Type of the gesture.
   * @returns {boolean} True if replaced or pushed, false if invalid token.
   */
  replaceLast(token, type = 'word') {
    if (!token || typeof token !== 'string') return false;
    const cleanToken = token.trim();
    if (!cleanToken) return false;

    if (this.buffer.length === 0) {
      return this.push(cleanToken, type);
    }

    const isSingleChar = /^[A-Z0-9]$/i.test(cleanToken);
    const now = Date.now();

    this.buffer[this.buffer.length - 1] = {
      gloss: cleanToken,
      type,
      isSpelled: type === 'letter' && isSingleChar,
      timestamp: now
    };
    return true;
  }

  /**
   * Empties the entire buffer (LING-02).
   */
  clear() {
    this.buffer = [];
  }

  /**
   * Returns a copy of the current gloss tokens array.
   * @returns {string[]}
   */
  getGlosses() {
    return this.buffer.map(item => item.gloss);
  }

  /**
   * Returns a copy of the full items array with metadata.
   * @returns {Array<{gloss: string, type: string, isSpelled: boolean, timestamp: number}>}
   */
  getItems() {
    return [...this.buffer];
  }

  /**
   * Number of items currently in the buffer.
   * @returns {number}
   */
  size() {
    return this.buffer.length;
  }

  /**
   * Whether the buffer is empty.
   * @returns {boolean}
   */
  isEmpty() {
    return this.buffer.length === 0;
  }
}

export default GlossBufferManager;
