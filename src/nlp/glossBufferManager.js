/**
 * GlossBufferManager
 * 
 * Manages the active sequence of recognized ISL gloss tokens:
 * - Automatically debounces and rejects adjacent duplicate signs (LING-01).
 * - Concatenates contiguous fingerspelled alphabet characters into a single spelled word entity.
 * - Provides manual editing methods: undo last sign and clear all (LING-02).
 */
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

    // If pushing a letter and the previous token is a spelled word, concatenate
    if (type === 'letter' && isSingleChar && this.buffer.length > 0) {
      const last = this.buffer[this.buffer.length - 1];
      if (last.isSpelled) {
        last.gloss += cleanToken.toUpperCase();
        last.timestamp = Date.now();
        return true;
      }
    }

    // Adjacent duplicate check (LING-01)
    if (this.buffer.length > 0) {
      const last = this.buffer[this.buffer.length - 1];
      if (last.gloss === cleanToken) {
        return false; // Deduplicated
      }
    }

    this.buffer.push({
      gloss: cleanToken,
      type,
      isSpelled: type === 'letter' && isSingleChar,
      timestamp: Date.now()
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
