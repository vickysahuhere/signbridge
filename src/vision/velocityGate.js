/**
 * Motion Energy & Wrist Velocity Gating Module for Indian Sign Language (ISL).
 *
 * Tracks rolling wrist velocity over a 5-frame moving window to detect when
 * a signer is actively signing gestures vs resting hands.
 *
 * Implements a 1.2-second idle pause countdown that triggers an IDLE_COMMIT
 * event to automatically trigger grammatical sentence structuring without
 * requiring physical keyboard or mouse interactions.
 */

export const MOTION_STATES = Object.freeze({
  IDLE: 'IDLE',
  SIGNING_ACTIVE: 'SIGNING_ACTIVE',
  PAUSE_COUNTDOWN: 'PAUSE_COUNTDOWN',
  IDLE_COMMIT: 'IDLE_COMMIT'
});

export class VelocityGate {
  /**
   * @param {Object} [options={}]
   * @param {number} [options.activeThreshold=0.015] - Rolling velocity threshold to enter SIGNING_ACTIVE
   * @param {number} [options.idleThreshold=0.008] - Velocity threshold to trigger PAUSE_COUNTDOWN
   * @param {number} [options.commitDurationMs=1200] - Duration of rest in ms required for IDLE_COMMIT
   * @param {number} [options.windowSize=5] - Moving average frame window size
   */
  constructor(options = {}) {
    this.activeThreshold = options.activeThreshold ?? 0.015;
    this.idleThreshold = options.idleThreshold ?? 0.008;
    this.commitDurationMs = options.commitDurationMs ?? 1200;
    this.windowSize = options.windowSize ?? 5;

    this.state = MOTION_STATES.IDLE;
    this.prevLeftWrist = null;
    this.prevRightWrist = null;
    this.velocityWindow = [];
    this.pauseStartTime = null;
    this.hasSigned = false;
  }

  /**
   * Update gate with normalized wrist positions and timestamp.
   *
   * @param {Object|null} leftWrist - Normalized {x, y, z} of left wrist
   * @param {Object|null} rightWrist - Normalized {x, y, z} of right wrist
   * @param {number} [timestamp] - Current timestamp in milliseconds (defaults to performance.now())
   * @returns {{ state: string, rollingVelocity: number, pauseProgress: number, elapsedPauseMs: number }}
   */
  update(leftWrist, rightWrist, timestamp = performance.now()) {
    let leftDist = null;
    let rightDist = null;

    if (leftWrist && this.prevLeftWrist) {
      const dx = leftWrist.x - this.prevLeftWrist.x;
      const dy = leftWrist.y - this.prevLeftWrist.y;
      const dz = (leftWrist.z || 0) - (this.prevLeftWrist.z || 0);
      leftDist = Math.hypot(dx, dy, dz);
    }

    if (rightWrist && this.prevRightWrist) {
      const dx = rightWrist.x - this.prevRightWrist.x;
      const dy = rightWrist.y - this.prevRightWrist.y;
      const dz = (rightWrist.z || 0) - (this.prevRightWrist.z || 0);
      rightDist = Math.hypot(dx, dy, dz);
    }

    // Cache current wrists for next delta calculation
    this.prevLeftWrist = leftWrist ? { ...leftWrist } : null;
    this.prevRightWrist = rightWrist ? { ...rightWrist } : null;

    // Highest velocity across both wrists represents active signing energy
    let instVelocity = 0;
    if (leftDist !== null && rightDist !== null) {
      instVelocity = Math.max(leftDist, rightDist);
    } else if (leftDist !== null) {
      instVelocity = leftDist;
    } else if (rightDist !== null) {
      instVelocity = rightDist;
    }

    // Maintain 5-frame moving average window
    this.velocityWindow.push(instVelocity);
    if (this.velocityWindow.length > this.windowSize) {
      this.velocityWindow.shift();
    }

    const rollingVelocity =
      this.velocityWindow.reduce((acc, v) => acc + v, 0) / this.velocityWindow.length;

    let pauseProgress = 0.0;
    let elapsedPauseMs = 0;

    // State machine logic
    if (rollingVelocity >= this.activeThreshold) {
      this.state = MOTION_STATES.SIGNING_ACTIVE;
      this.hasSigned = true;
      this.pauseStartTime = null;
      pauseProgress = 0.0;
      elapsedPauseMs = 0;
    } else if (rollingVelocity < this.idleThreshold) {
      if (this.state === MOTION_STATES.SIGNING_ACTIVE || this.state === MOTION_STATES.PAUSE_COUNTDOWN) {
        if (this.pauseStartTime === null) {
          this.pauseStartTime = timestamp;
        }
        elapsedPauseMs = Math.max(0, timestamp - this.pauseStartTime);
        pauseProgress = Math.min(1.0, elapsedPauseMs / this.commitDurationMs);

        if (elapsedPauseMs >= this.commitDurationMs) {
          this.state = MOTION_STATES.IDLE_COMMIT;
          this.pauseStartTime = null;
          this.hasSigned = false;
        } else {
          this.state = MOTION_STATES.PAUSE_COUNTDOWN;
        }
      } else if (this.state === MOTION_STATES.IDLE_COMMIT) {
        // Commit event was emitted in the previous frame; transition cleanly back to IDLE
        this.state = MOTION_STATES.IDLE;
        this.pauseStartTime = null;
        this.hasSigned = false;
        pauseProgress = 0.0;
        elapsedPauseMs = 0;
      } else {
        this.state = MOTION_STATES.IDLE;
        this.pauseStartTime = null;
        pauseProgress = 0.0;
        elapsedPauseMs = 0;
      }
    } else {
      // Hysteresis band between idleThreshold and activeThreshold
      if (this.state === MOTION_STATES.PAUSE_COUNTDOWN && this.pauseStartTime !== null) {
        elapsedPauseMs = Math.max(0, timestamp - this.pauseStartTime);
        pauseProgress = Math.min(1.0, elapsedPauseMs / this.commitDurationMs);
        if (elapsedPauseMs >= this.commitDurationMs) {
          this.state = MOTION_STATES.IDLE_COMMIT;
          this.pauseStartTime = null;
          this.hasSigned = false;
        }
      } else if (this.state === MOTION_STATES.IDLE_COMMIT) {
        this.state = MOTION_STATES.IDLE;
        this.pauseStartTime = null;
        this.hasSigned = false;
      }
    }

    return {
      state: this.state,
      rollingVelocity,
      pauseProgress,
      elapsedPauseMs
    };
  }

  /**
   * Reset all velocity tracking history and state.
   */
  reset() {
    this.state = MOTION_STATES.IDLE;
    this.prevLeftWrist = null;
    this.prevRightWrist = null;
    this.velocityWindow = [];
    this.pauseStartTime = null;
    this.hasSigned = false;
  }
}
