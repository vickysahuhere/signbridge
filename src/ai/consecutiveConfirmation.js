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
   * @param {boolean} [options.lockUntilRelease=true] - Require user to relax hand before repeating same token
   */
  constructor(options = {}) {
    this.confidenceThreshold = options.confidenceThreshold ?? 0.75;
    this.requiredConsecutive = options.requiredConsecutive ?? 2;
    this.cooldownFrames = options.cooldownFrames ?? 6;
    this.lockUntilRelease = options.lockUntilRelease ?? true;

    this.previousCandidate = null;
    this.consecutiveCount = 0;
    this.cooldownRemaining = 0;
    this.lastConfirmedWord = null;
    this.isLocked = false;
    this.candidateStartTime = 0;
  }

  /**
   * Evaluate incoming top-1 prediction.
   *
   * @param {{ label: string, confidence: number }|null} top1 - Top candidate from classifier
   * @returns {{ confirmed: boolean, word?: string, confidence?: number, pending: boolean, count: number, inCooldown?: boolean, isLocked?: boolean }}
   */
  processCandidate(top1) {
    // Decrement cooldown if active
    if (this.cooldownRemaining > 0) {
      this.cooldownRemaining--;
    }

    if (!top1 || typeof top1.confidence !== 'number' || top1.confidence < this.confidenceThreshold) {
      // Confidence below threshold or hand removed: reset tracking and unlock repeat
      this.previousCandidate = null;
      this.consecutiveCount = 0;
      this.isLocked = false;
      this.lastConfirmedWord = null;
      this.cooldownRemaining = 0;
      this.candidateStartTime = 0;
      return { confirmed: false, pending: false, count: 0 };
    }

    // If candidate label changed, unlock
    if (this.previousCandidate && this.previousCandidate.label !== top1.label) {
      this.isLocked = false;
    }

    // Top-1 confidence meets threshold
    if (this.previousCandidate && this.previousCandidate.label === top1.label) {
      this.consecutiveCount++;

      if (this.consecutiveCount >= this.requiredConsecutive) {
        // Enforce lockUntilRelease to stop runaway continuous spamming
        if (this.lockUntilRelease && this.isLocked && this.lastConfirmedWord === top1.label) {
          return {
            confirmed: false,
            pending: false,
            count: this.consecutiveCount,
            inCooldown: true,
            isLocked: true
          };
        }

        if (this.cooldownRemaining > 0 && this.lastConfirmedWord === top1.label) {
          // Already confirmed recently; suppressing continuous repetition
          return {
            confirmed: false,
            pending: true,
            count: this.consecutiveCount,
            inCooldown: true
          };
        }

        // Consecutive confirmation fulfilled!
        const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const gateDelayMs = this.candidateStartTime ? Math.round(now - this.candidateStartTime) : 0;
        this.lastConfirmedWord = top1.label;
        this.cooldownRemaining = this.cooldownFrames;
        this.isLocked = true;

        return {
          confirmed: true,
          word: top1.label,
          confidence: top1.confidence,
          pending: false,
          count: this.consecutiveCount,
          gateDelayMs
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
      this.candidateStartTime = typeof performance !== 'undefined' ? performance.now() : Date.now();

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
    this.isLocked = false;
    this.candidateStartTime = 0;
  }
}
