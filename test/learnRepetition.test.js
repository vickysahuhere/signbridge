import { test } from 'node:test';
import assert from 'node:assert/strict';

/**
 * Unit tests verifying the 3-repetition requirement and retry state machine in Learning mode
 */
test('Learn Repetition Engine - requires exactly 3 completions to pass a sign', () => {
  const TARGET_REPETITIONS = 3;

  class RepetitionTracker {
    constructor() {
      this.reps = 0;
      this.isMastered = false;
      this.awaitingRelease = false;
      this.holdStartTime = null;
    }

    reset() {
      this.reps = 0;
      this.isMastered = false;
      this.awaitingRelease = false;
      this.holdStartTime = null;
    }

    onFrame(isSatisfied, now = Date.now()) {
      if (this.reps >= TARGET_REPETITIONS) {
        this.isMastered = true;
        return { reps: this.reps, isMastered: true, justPassed: false };
      }

      if (this.awaitingRelease) {
        if (!isSatisfied) {
          this.awaitingRelease = false;
        }
        return { reps: this.reps, isMastered: false, awaitingRelease: true };
      }

      if (isSatisfied) {
        if (!this.holdStartTime) {
          this.holdStartTime = now;
        } else if (now - this.holdStartTime >= 450) {
          this.holdStartTime = null;
          this.awaitingRelease = true;
          this.reps += 1;
          const passed = this.reps >= TARGET_REPETITIONS;
          if (passed) {
            this.isMastered = true;
          }
          return { reps: this.reps, isMastered: this.isMastered, justCompletedRep: true, justPassed: passed };
        }
      } else {
        this.holdStartTime = null;
      }

      return { reps: this.reps, isMastered: this.isMastered, awaitingRelease: false };
    }
  }

  const tracker = new RepetitionTracker();

  // Initially 0 reps, not passed
  assert.equal(tracker.reps, 0);
  assert.equal(tracker.isMastered, false);

  // Attempt 1: Start signing
  let res = tracker.onFrame(true, 1000);
  assert.equal(res.reps, 0);
  assert.equal(res.isMastered, false);

  // Still holding < 450ms
  res = tracker.onFrame(true, 1300);
  assert.equal(res.reps, 0);
  assert.equal(res.isMastered, false);

  // Held >= 450ms -> Rep 1 completed!
  res = tracker.onFrame(true, 1500);
  assert.equal(res.reps, 1);
  assert.equal(res.isMastered, false, 'Should NOT pass on 1 repetition');
  assert.equal(res.justCompletedRep, true);

  // If user continues holding without releasing, rep count must NOT increase
  res = tracker.onFrame(true, 2000);
  assert.equal(res.reps, 1);
  assert.equal(res.awaitingRelease, true);

  // User releases posture / hands relax
  res = tracker.onFrame(false, 2100);
  assert.equal(tracker.awaitingRelease, false);

  // Attempt 2: User signs again
  tracker.onFrame(true, 2200);
  res = tracker.onFrame(true, 2700);
  assert.equal(res.reps, 2);
  assert.equal(res.isMastered, false, 'Should NOT pass on 2 repetitions');

  // User releases posture
  tracker.onFrame(false, 2800);

  // Attempt 3: User signs the 3rd time
  tracker.onFrame(true, 2900);
  res = tracker.onFrame(true, 3400);
  assert.equal(res.reps, 3);
  assert.equal(res.isMastered, true, 'MUST pass when 3 repetitions are reached');
  assert.equal(res.justPassed, true);

  // User gets chance to try again still (reset practice)
  tracker.reset();
  assert.equal(tracker.reps, 0);
  assert.equal(tracker.isMastered, false, 'Practice reset should allow trying again from 0');
});
