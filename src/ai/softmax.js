import { ISL_ALPHABET_LABELS } from './islAlphabetLabels.js';

/**
 * Numerically stable Softmax function.
 *
 * Subtracts the maximum logit before exponentiation to prevent floating-point
 * overflow (e.g. exp(1000) -> Infinity), ensuring stable probabilities that
 * strictly sum to 1.0.
 *
 * @param {ArrayLike<number>} logits - Array or TypedArray of raw neural network outputs
 * @returns {Float32Array} Normalized probability distribution summing to 1.0
 */
export function softmax(logits) {
  if (!logits || logits.length === 0) {
    return new Float32Array(0);
  }

  const n = logits.length;
  const probs = new Float32Array(n);

  // 1. Find max logit for numerical stability
  let maxLogit = -Infinity;
  for (let i = 0; i < n; i++) {
    if (logits[i] > maxLogit) {
      maxLogit = logits[i];
    }
  }

  // Handle all -Infinity or empty
  if (!Number.isFinite(maxLogit)) {
    const uniform = 1.0 / n;
    probs.fill(uniform);
    return probs;
  }

  // 2. Compute exponentials and accumulate sum
  let sumExp = 0.0;
  for (let i = 0; i < n; i++) {
    const expVal = Math.exp(logits[i] - maxLogit);
    probs[i] = expVal;
    sumExp += expVal;
  }

  // 3. Normalize probabilities
  const invSum = sumExp > 0 ? 1.0 / sumExp : 1.0;
  for (let i = 0; i < n; i++) {
    probs[i] *= invSum;
  }

  return probs;
}

/**
 * Extract Top-K prediction candidates with confidence threshold gating.
 *
 * @param {ArrayLike<number>} logitsOrProbs - Raw logits or probabilities
 * @param {string[]} [labels=ISL_ALPHABET_LABELS] - Array of class label strings
 * @param {number} [k=3] - Number of top candidates to return (default 3)
 * @param {number} [threshold=0.75] - Minimum confidence required for isConfident=true
 * @param {boolean} [applySoftmax=true] - Whether to apply softmax if inputs are raw logits
 * @returns {Array<{ rank: number, index: number, label: string, confidence: number, isConfident: boolean }>}
 */
export function getTopKPredictions(
  logitsOrProbs,
  labels = ISL_ALPHABET_LABELS,
  k = 3,
  threshold = 0.75,
  applySoftmax = true
) {
  if (!logitsOrProbs || logitsOrProbs.length === 0) {
    return [];
  }

  const probs = applySoftmax ? softmax(logitsOrProbs) : logitsOrProbs;
  const n = probs.length;
  const actualK = Math.min(k, n);

  // Pair each index with its probability
  const indexed = [];
  for (let i = 0; i < n; i++) {
    indexed.push({ index: i, confidence: probs[i] });
  }

  // Sort descending by confidence
  indexed.sort((a, b) => b.confidence - a.confidence);

  // Slice top K candidates
  const topK = [];
  for (let r = 0; r < actualK; r++) {
    const item = indexed[r];
    const label = labels[item.index] || `Class_${item.index}`;
    topK.push({
      rank: r + 1,
      index: item.index,
      label,
      confidence: item.confidence,
      isConfident: item.confidence >= threshold
    });
  }

  return topK;
}
