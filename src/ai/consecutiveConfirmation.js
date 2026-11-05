/**
 * 2-Step Consecutive Confirmation Gate.
 *
 * Prevents transient noise spikes, flickering hand movements, and gesture transitions
 * from falsely triggering word detections in Indian Sign Language.
 *
 * Gating Rule:
 * A sign is only confirmed when the top-1 candidate matches the same gloss
 * across at least `requiredConsecutive` (default 2) consecutive temporal inference
 * windows with confidence >= `confidenceThreshold` (default 0.75).
 */

export class ConsecutiveConfirmationGate {
  /**
   * @param {Object} [options={}]
   * @param {number} [options.confidenceThreshold=0.75] - Minimum required confidence per window
   * @param {number} [options.requiredConsecutive=2] - Number of consecutive windows required
   * @param {number} [options.cooldownFrames=6] - Inferences to wait before re-confirming identical word
   */
  constructor(options = {}) {
    this.confidenceThreshold = options.confidenceThreshold ?? 0.75;
    this.requiredConsecutive = options.requiredConsecutive ?? 2;
    this.cooldownFrames = options.cooldownFrames ?? 6;

    this.previousCandidate = null;
    this.consecutiveCount = 0;
    this.cooldownRemaining = 0;
    this.lastConfirmedWord = null;
  }

  /**
   * Evaluate incoming top-1 prediction.
   *
   * @param {{ label: string, confidence: number }|null} top1 - Top candidate from classifier
   * @returns {{ confirmed: boolean, word?: string, confidence?: number, pending: boolean, count: number }}
   */
  processCandidate(top1) {
    // Decrement cooldown if active
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining--;
    }

    if (!top1 || typeof top1.confidence !== 'number' || top1.confidence < this.confidenceThreshold) {
      // Confidence below threshold: reset candidate tracking
      this.previousCandidate = null;
      this.consecutiveCount = 0;
      return { confirmed: false, pending: false, count: 0 };
    }

    // Top-1 confidence meets threshold (>= 0.75)
    if (this.previousCandidate && this.previousCandidate.label === top1.label) {
      this.consecutiveCount++;

      if (this.consecutiveCount >= this.requiredConsecutive) {
        if (this.cooldownRemaining > 0 && this.lastConfirmedWord === top1.label) {
          // Already confirmed recently; suppressing continuous repetition
          return {
            confirmed: false,
            pending: true,
            count: this.consecutiveCount,
            inCooldown: true
          };
        }

        // 2-step consecutive confirmation fulfilled!
        this.lastConfirmedWord = top1.label;
        this.cooldownRemaining = this.cooldownFrames;

        return {
          confirmed: true,
          word: top1.label,
          confidence: top1.confidence,
          pending: false,
          count: this.consecutiveCount
        };
      }

      return {
        confirmed: false,
        pending: true,
        count: this.consecutiveCount
      };
    } else {
      // First high-confidence observation of this label
      this.previousCandidate = { label: top1.label, confidence: top1.confidence };
      this.consecutiveCount = 1;

      return {
        confirmed: false,
        pending: true,
        count: 1
      };
    }
  }

  /**
   * Reset all confirmation state
   */
  reset() {
    this.previousCandidate = null;
    this.consecutiveCount = 0;
    this.cooldownRemaining = 0;
    this.lastConfirmedWord = null;
  }
}
