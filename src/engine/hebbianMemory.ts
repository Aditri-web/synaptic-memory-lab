import { CAPS } from './caps';

/**
 * Core mathematical engine for Hebbian synaptic memory updates in BDH.
 * 
 * Synaptic state matrix S_t in R^{d x d}
 * Write step: S_t = λ * S_{t-1} + η * (v_t * k_t^T)
 * Read step:  v̂_t = S_{t-1} * q_t
 * Non-negative activation (BDH ReLU sparsity): H_t = ReLU(W_x * X_t + W_s * v̂_t + b)
 */

export interface AssociativePair {
  id: string;
  keyLabel: string;
  valueLabel: string;
  keyVector: Float32Array;
  valueVector: Float32Array;
  stepAdded: number;
}

export interface RetrievalResult {
  pairId: string;
  keyLabel: string;
  expectedValue: Float32Array;
  retrievedValue: Float32Array;
  cosineSimilarity: number;
  mseError: number;
  isAccurate: boolean;
}

export interface SimulationState {
  dimension: number;
  eta: number;
  lambdaDecay: number;
  sparsity: number;
  synapticMatrix: Float32Array; // Flattened d x d matrix
  frobeniusNorm: number;
  pairs: AssociativePair[];
  historyMetrics: {
    step: number;
    frobeniusNorm: number;
    meanCosineSim: number;
    activeSparsityFraction: number;
  }[];
}

/**
 * Generates a pseudo-random unit vector with controllable sparsity.
 */
export function generateSparseVector(dim: number, sparsity: number, seedOffset: number): Float32Array {
  const vec = new Float32Array(dim);
  const activeCount = Math.max(1, Math.round(dim * sparsity));
  
  // Seeded simple deterministic PRNG for reproducible runs
  let seed = 1337 + seedOffset * 37;
  function random(): number {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  }

  // Pick sparse non-zero indices
  const indices: number[] = [];
  while (indices.length < activeCount) {
    const idx = Math.floor(random() * dim);
    if (!indices.includes(idx)) {
      indices.push(idx);
    }
  }

  // In BDH, activations are non-negative (ReLU)
  let normSq = 0;
  for (const idx of indices) {
    const val = 0.1 + random() * 0.9; // strictly positive
    vec[idx] = val;
    normSq += val * val;
  }

  // Normalize to unit length
  const norm = Math.sqrt(normSq) || 1;
  for (const idx of indices) {
    vec[idx] /= norm;
  }

  return vec;
}

/**
 * Initializes a blank zero-filled synaptic matrix of size d x d.
 */
export function initializeSynapticMatrix(dim: number): Float32Array {
  return new Float32Array(dim * dim);
}

/**
 * Executes the Hebbian Write step: S_t = λ * S_{t-1} + η * (V_t * K_t^T)
 * Modifies matrix in-place or returns updated state.
 */
export function hebbianWrite(
  currentMatrix: Float32Array,
  dim: number,
  key: Float32Array,
  val: Float32Array,
  eta: number = CAPS.DEFAULT_ETA,
  lambdaDecay: number = CAPS.DEFAULT_LAMBDA
): Float32Array {
  const nextMatrix = new Float32Array(dim * dim);

  for (let i = 0; i < dim; i++) {
    const vi = val[i];
    const rowOffset = i * dim;
    for (let j = 0; j < dim; j++) {
      const kj = key[j];
      const prevVal = currentMatrix[rowOffset + j];
      
      // Hebbian outer-product write with decay
      const updated = lambdaDecay * prevVal + eta * (vi * kj);
      nextMatrix[rowOffset + j] = updated;
    }
  }

  return nextMatrix;
}

/**
 * Executes the Synaptic Read step: v̂_t = S * q_t
 */
export function synapticRead(
  matrix: Float32Array,
  dim: number,
  queryKey: Float32Array
): Float32Array {
  const result = new Float32Array(dim);

  for (let i = 0; i < dim; i++) {
    let sum = 0;
    const rowOffset = i * dim;
    for (let j = 0; j < dim; j++) {
      sum += matrix[rowOffset + j] * queryKey[j];
    }
    // BDH ReLU non-negativity constraint on readout
    result[i] = Math.max(0, sum);
  }

  // Normalize result vector for fair cosine similarity comparison
  let normSq = 0;
  for (let i = 0; i < dim; i++) {
    normSq += result[i] * result[i];
  }
  const norm = Math.sqrt(normSq);
  if (norm > 0) {
    for (let i = 0; i < dim; i++) {
      result[i] /= norm;
    }
  }

  return result;
}

/**
 * Computes Cosine Similarity between ground truth and retrieved estimate.
 */
export function computeCosineSimilarity(a: Float32Array, b: Float32Array): number {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : Math.max(-1, Math.min(1, dot / denom));
}

/**
 * Computes Frobenius Norm of the d x d matrix.
 */
export function computeFrobeniusNorm(matrix: Float32Array): number {
  let sumSq = 0;
  for (let i = 0; i < matrix.length; i++) {
    sumSq += matrix[i] * matrix[i];
  }
  return Math.sqrt(sumSq);
}
