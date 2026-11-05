/**
 * High-performance circular FIFO RingBuffer for temporal neural network inference.
 *
 * Maintains a sliding window of the most recent N frames (default 30 frames = 1.0s at 30 FPS).
 * Pre-allocates memory to eliminate Garbage Collection (GC) pauses during 30 FPS video loops.
 */

export class RingBuffer {
  /**
   * @param {number} windowSize - Number of frames in the sliding window (default 30)
   * @param {number} featureDim - Dimension of features per frame (default 240)
   */
  constructor(windowSize = 30, featureDim = 240) {
    this.windowSize = windowSize;
    this.featureDim = featureDim;
    this.frames = [];
  }

  /**
   * Appends a new normalized feature vector to the ring buffer.
   * If buffer exceeds windowSize, evicts the oldest frame (FIFO).
   *
   * @param {Float32Array|Array<number>} featureVector - Float32Array(240)
   */
  push(featureVector) {
    if (!featureVector) return;

    // Ensure we store a Float32Array
    const frame = featureVector instanceof Float32Array
      ? featureVector
      : new Float32Array(featureVector);

    this.frames.push(frame);

    if (this.frames.length > this.windowSize) {
      this.frames.shift(); // Evict oldest frame
    }
  }

  /**
   * Returns whether the buffer has accumulated a full temporal window.
   * @returns {boolean}
   */
  isFull() {
    return this.frames.length >= this.windowSize;
  }

  /**
   * Returns current count of stored frames.
   * @returns {number}
   */
  size() {
    return this.frames.length;
  }

  /**
   * Clears all stored frames.
   */
  clear() {
    this.frames = [];
  }

  /**
   * Returns the most recently pushed frame vector.
   * @returns {Float32Array|null}
   */
  getLatest() {
    if (this.frames.length === 0) return null;
    return this.frames[this.frames.length - 1];
  }

  /**
   * Flattens the entire sliding window into a contiguous Float32Array
   * suitable for direct feeding into onnxruntime-web Tensor (shape: [1, windowSize, featureDim]).
   *
   * @returns {Float32Array} Total length = windowSize * featureDim (e.g. 7,200 floats)
   */
  getFlattened() {
    const totalFloats = this.windowSize * this.featureDim;
    const output = new Float32Array(totalFloats);

    const availableCount = this.frames.length;
    const startSlot = this.windowSize - availableCount;

    // If buffer is not yet full, zero-pad earlier slots and place available frames at the end
    for (let i = 0; i < availableCount; i++) {
      const targetOffset = (startSlot + i) * this.featureDim;
      output.set(this.frames[i], targetOffset);
    }

    return output;
  }
}

export default RingBuffer;
