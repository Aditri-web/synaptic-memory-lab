/**
 * Unit tests for the Hebbian Synaptic Memory engine.
 * 
 * These tests validate the core mathematical operations against
 * hand-calculated known values from the primary literature:
 * 
 *   S_t = λ * S_{t-1} + η * (v_t * k_t^T)     [Hebbian write]
 *   v̂_t = S_{t-1} * q_t                        [Synaptic read]
 * 
 * Reference: Hopfield & Krotov (2022), "Dense Associative Memories
 * and Modern Hebbian Learning" — NeurIPS / Physical Review Research.
 */
import { describe, it, expect } from 'vitest';
import {
  hebbianWrite,
  synapticRead,
  computeCosineSimilarity,
  computeFrobeniusNorm,
  generateSparseVector,
  initializeSynapticMatrix,
} from '../hebbianMemory';

// ----- Helpers -----
function makeVec(values: number[]): Float32Array {
  return new Float32Array(values);
}

/**
 * Hand-compute the outer product v * k^T as a flattened d×d matrix.
 */
function outerProduct(v: Float32Array, k: Float32Array): Float32Array {
  const d = v.length;
  const result = new Float32Array(d * d);
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      result[i * d + j] = v[i] * k[j];
    }
  }
  return result;
}

// =================================================================
// Test Suite: hebbianWrite
// =================================================================
describe('hebbianWrite', () => {
  it('should produce η * (v * k^T) from a zero matrix (single write)', () => {
    // With S_0 = 0, λ arbitrary, we expect: S_1 = λ*0 + η*(v*k^T) = η*(v*k^T)
    const d = 4;
    const k = makeVec([1, 0, 0, 0]);
    const v = makeVec([0, 1, 0, 0]);
    const eta = 0.5;
    const lambda = 0.98;
    const S0 = initializeSynapticMatrix(d);

    const S1 = hebbianWrite(S0, d, k, v, eta, lambda);

    // Expected: S1[i][j] = η * v[i] * k[j]
    const expected = outerProduct(v, k);
    for (let i = 0; i < d * d; i++) {
      expect(S1[i]).toBeCloseTo(eta * expected[i], 5);
    }
  });

  it('should apply decay λ to previous matrix state', () => {
    // Write once, then write again with a different pair.
    // S_2 = λ * S_1 + η * (v_2 * k_2^T)
    // S_1 contribution should be scaled by λ.
    const d = 4;
    const k1 = makeVec([1, 0, 0, 0]);
    const v1 = makeVec([0, 0, 1, 0]);
    const k2 = makeVec([0, 1, 0, 0]);
    const v2 = makeVec([0, 0, 0, 1]);
    const eta = 1.0;
    const lambda = 0.5;
    const S0 = initializeSynapticMatrix(d);

    const S1 = hebbianWrite(S0, d, k1, v1, eta, lambda);
    const S2 = hebbianWrite(S1, d, k2, v2, eta, lambda);

    // S1[2][0] = η * v1[2] * k1[0] = 1.0 * 1 * 1 = 1.0
    expect(S1[2 * d + 0]).toBeCloseTo(1.0, 5);

    // S2[2][0] = λ * S1[2][0] + η * v2[2] * k2[0] = 0.5 * 1.0 + 1.0 * 0 * 0 = 0.5
    expect(S2[2 * d + 0]).toBeCloseTo(0.5, 5);

    // S2[3][1] = λ * S1[3][1] + η * v2[3] * k2[1] = 0.5 * 0 + 1.0 * 1 * 1 = 1.0
    expect(S2[3 * d + 1]).toBeCloseTo(1.0, 5);
  });

  it('should produce superposition of two outer products when λ=1', () => {
    // With λ=1, η=1: S_2 = v_1*k_1^T + v_2*k_2^T (no decay)
    const d = 4;
    const k1 = makeVec([1, 0, 0, 0]);
    const v1 = makeVec([1, 0, 0, 0]);
    const k2 = makeVec([0, 1, 0, 0]);
    const v2 = makeVec([0, 1, 0, 0]);
    const eta = 1.0;
    const lambda = 1.0;
    const S0 = initializeSynapticMatrix(d);

    const S1 = hebbianWrite(S0, d, k1, v1, eta, lambda);
    const S2 = hebbianWrite(S1, d, k2, v2, eta, lambda);

    // Expected: S2 = outer(v1,k1) + outer(v2,k2)
    // This is a 4x4 matrix with 1.0 at [0][0] and [1][1], 0 elsewhere
    expect(S2[0 * d + 0]).toBeCloseTo(1.0, 5); // v1[0]*k1[0]
    expect(S2[1 * d + 1]).toBeCloseTo(1.0, 5); // v2[1]*k2[1]
    expect(S2[0 * d + 1]).toBeCloseTo(0.0, 5); // cross-term should be 0
    expect(S2[1 * d + 0]).toBeCloseTo(0.0, 5);
  });
});

// =================================================================
// Test Suite: synapticRead
// =================================================================
describe('synapticRead', () => {
  it('should recover the written value when queried with the exact key', () => {
    // Write (k, v) into empty matrix, then read with q = k.
    // Expected: v̂ = S * k = η * (v * k^T) * k = η * v * (k^T * k) = η * v * ||k||^2
    // For unit vector k: ||k||^2 = 1, so v̂ = η * v
    const d = 4;
    const k = makeVec([1, 0, 0, 0]); // unit basis vector
    const v = makeVec([0, 0.6, 0.8, 0]); // known unit vector (0.6^2 + 0.8^2 = 1)
    const eta = 1.0;
    const lambda = 1.0;
    const S0 = initializeSynapticMatrix(d);

    const S1 = hebbianWrite(S0, d, k, v, eta, lambda);
    const retrieved = synapticRead(S1, d, k);

    // synapticRead applies ReLU + normalization, so the direction should match v
    // Since v is already non-negative and the read should recover η*v direction
    const sim = computeCosineSimilarity(v, retrieved);
    expect(sim).toBeGreaterThan(0.99);
  });

  it('should return zero vector when reading from zero matrix', () => {
    const d = 4;
    const S0 = initializeSynapticMatrix(d);
    const q = makeVec([1, 0, 0, 0]);

    const result = synapticRead(S0, d, q);

    // All zeros (no ReLU activation, norm is 0, so no normalization)
    for (let i = 0; i < d; i++) {
      expect(result[i]).toBe(0);
    }
  });

  it('should retrieve orthogonal pairs independently (no cross-talk)', () => {
    // Write two pairs with orthogonal keys, query each independently.
    const d = 4;
    const k1 = makeVec([1, 0, 0, 0]);
    const v1 = makeVec([0.6, 0.8, 0, 0]); // unit
    const k2 = makeVec([0, 1, 0, 0]);
    const v2 = makeVec([0, 0, 0.6, 0.8]); // unit, orthogonal to v1
    const eta = 1.0;
    const lambda = 1.0;
    const S0 = initializeSynapticMatrix(d);

    let S = hebbianWrite(S0, d, k1, v1, eta, lambda);
    S = hebbianWrite(S, d, k2, v2, eta, lambda);

    // Query with k1 should recover v1 direction, not v2
    const r1 = synapticRead(S, d, k1);
    expect(computeCosineSimilarity(v1, r1)).toBeGreaterThan(0.99);

    // Query with k2 should recover v2 direction, not v1
    const r2 = synapticRead(S, d, k2);
    expect(computeCosineSimilarity(v2, r2)).toBeGreaterThan(0.99);
  });
});

// =================================================================
// Test Suite: computeCosineSimilarity
// =================================================================
describe('computeCosineSimilarity', () => {
  it('should return 1.0 for identical vectors', () => {
    const a = makeVec([0.6, 0.8, 0, 0]);
    expect(computeCosineSimilarity(a, a)).toBeCloseTo(1.0, 5);
  });

  it('should return 0.0 for orthogonal vectors', () => {
    const a = makeVec([1, 0, 0, 0]);
    const b = makeVec([0, 1, 0, 0]);
    expect(computeCosineSimilarity(a, b)).toBeCloseTo(0.0, 5);
  });

  it('should return 0.0 when one vector is all zeros', () => {
    const a = makeVec([1, 2, 3, 4]);
    const b = makeVec([0, 0, 0, 0]);
    expect(computeCosineSimilarity(a, b)).toBe(0);
  });

  it('should compute correct value for known vectors', () => {
    // a = [3, 4], b = [4, 3]
    // dot = 12+12 = 24, |a| = 5, |b| = 5 → cos = 24/25 = 0.96
    const a = makeVec([3, 4]);
    const b = makeVec([4, 3]);
    expect(computeCosineSimilarity(a, b)).toBeCloseTo(24 / 25, 4);
  });
});

// =================================================================
// Test Suite: computeFrobeniusNorm
// =================================================================
describe('computeFrobeniusNorm', () => {
  it('should return 0 for zero matrix', () => {
    const S = initializeSynapticMatrix(4);
    expect(computeFrobeniusNorm(S)).toBe(0);
  });

  it('should equal η for a single outer product of unit vectors', () => {
    // S = η * (v * k^T), ||v|| = ||k|| = 1
    // ||S||_F = η * ||v||_2 * ||k||_2 = η * 1 * 1 = η
    const d = 4;
    const k = makeVec([1, 0, 0, 0]); // unit
    const v = makeVec([0, 1, 0, 0]); // unit
    const eta = 0.7;
    const S0 = initializeSynapticMatrix(d);
    const S1 = hebbianWrite(S0, d, k, v, eta, 1.0);

    expect(computeFrobeniusNorm(S1)).toBeCloseTo(eta, 4);
  });
});

// =================================================================
// Test Suite: generateSparseVector
// =================================================================
describe('generateSparseVector', () => {
  it('should produce a unit vector (norm ≈ 1)', () => {
    const vec = generateSparseVector(64, 0.05, 42);
    let normSq = 0;
    for (let i = 0; i < vec.length; i++) normSq += vec[i] * vec[i];
    expect(Math.sqrt(normSq)).toBeCloseTo(1.0, 3);
  });

  it('should have approximately correct sparsity fraction', () => {
    const dim = 64;
    const sparsity = 0.05;
    const vec = generateSparseVector(dim, sparsity, 7);
    const nonZero = Array.from(vec).filter((x) => x > 0).length;
    const expectedActive = Math.max(1, Math.round(dim * sparsity));
    expect(nonZero).toBe(expectedActive);
  });

  it('should be non-negative (BDH ReLU constraint)', () => {
    const vec = generateSparseVector(64, 0.1, 99);
    for (let i = 0; i < vec.length; i++) {
      expect(vec[i]).toBeGreaterThanOrEqual(0);
    }
  });

  it('should be deterministic for the same seed', () => {
    const a = generateSparseVector(32, 0.1, 42);
    const b = generateSparseVector(32, 0.1, 42);
    for (let i = 0; i < a.length; i++) {
      expect(a[i]).toBe(b[i]);
    }
  });
});
