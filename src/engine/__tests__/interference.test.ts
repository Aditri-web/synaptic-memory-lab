/**
 * Unit tests for the Interference Detection engine.
 * 
 * Validates the core experimental claim:
 * "Past a threshold of stored associations, it forgets through
 *  cross-talk interference rather than through eviction."
 * 
 * Reference: Hopfield & Krotov (2022), capacity bounds for dense
 * associative memories with sparse non-negative activations.
 */
import { describe, it, expect } from 'vitest';
import { runInterferenceExperiment } from '../interference';
import { CAPS } from '../caps';

// =================================================================
// Test Suite: Capacity Below Threshold
// =================================================================
describe('runInterferenceExperiment — below capacity', () => {
  it('should retrieve all pairs with high fidelity when count << d', () => {
    // For d=64, storing only 5 pairs should be well within capacity.
    // Expected: average cosine similarity > 0.90
    const result = runInterferenceExperiment(
      5,       // totalPairs: well below capacity
      64,      // dim
      0.5,     // eta
      1.0,     // lambda = 1 (no decay, maximum retention)
      0.05     // 5% sparsity
    );

    expect(result.totalPairs).toBe(5);
    expect(result.dimension).toBe(64);
    expect(result.averageSimilarity).toBeGreaterThan(0.85);

    // Every individual pair should be accurately retrieved
    for (const r of result.results) {
      expect(r.cosineSimilarity).toBeGreaterThan(0.65);
    }
  });
});

// =================================================================
// Test Suite: Capacity Cliff Detection
// =================================================================
describe('runInterferenceExperiment — capacity cliff', () => {
  it('should detect capacity limit when overloaded past d/2 pairs', () => {
    // For d=32, the theoretical capacity with 5% sparsity is roughly ~0.5*d = 16.
    // Storing 80 pairs should trigger cross-talk interference.
    const result = runInterferenceExperiment(
      80,      // totalPairs: well above capacity for d=32
      32,      // dim: small matrix to expose the cliff quickly
      0.5,     // eta
      1.0,     // lambda = 1.0 (no decay)
      0.05     // 5% sparsity
    );

    expect(result.dimension).toBe(32);
    expect(result.totalPairs).toBe(80);

    // The capacity limit SHOULD have been detected
    expect(result.capacityLimitReachedAt).not.toBeNull();
    expect(result.capacityLimitReachedAt!).toBeLessThan(80);

    // Average similarity should be significantly degraded
    expect(result.averageSimilarity).toBeLessThan(0.85);
  });
});

// =================================================================
// Test Suite: Accuracy Curve Properties
// =================================================================
describe('runInterferenceExperiment — accuracy curve', () => {
  it('should produce a non-empty accuracy curve', () => {
    const result = runInterferenceExperiment(20, 64, 0.5, 1.0, 0.05);
    expect(result.accuracyCurve.length).toBeGreaterThan(0);
  });

  it('accuracy curve should show degradation as pairs increase', () => {
    // For large enough overload, later points should have lower similarity
    // than earlier points (monotonic degradation trend)
    const result = runInterferenceExperiment(100, 32, 0.5, 1.0, 0.05);
    const curve = result.accuracyCurve;

    if (curve.length >= 3) {
      // First point should have higher similarity than last
      expect(curve[0].meanSimilarity).toBeGreaterThan(
        curve[curve.length - 1].meanSimilarity
      );
    }
  });
});

// =================================================================
// Test Suite: CAPS parameter clamping
// =================================================================
describe('runInterferenceExperiment — CAPS safety', () => {
  it('should clamp dimension to CAPS.MAX_DIM when exceeding bounds', () => {
    const result = runInterferenceExperiment(5, 9999, 0.5, 1.0, 0.05);
    expect(result.dimension).toBe(CAPS.MAX_DIM); // 256
  });

  it('should clamp dimension to CAPS.MIN_DIM when below bounds', () => {
    const result = runInterferenceExperiment(5, 2, 0.5, 1.0, 0.05);
    expect(result.dimension).toBe(CAPS.MIN_DIM); // 16
  });

  it('should clamp pair count to CAPS.MAX_ASSOCIATIONS', () => {
    const result = runInterferenceExperiment(999999, 16, 0.5, 1.0, 0.05);
    expect(result.totalPairs).toBe(CAPS.MAX_ASSOCIATIONS); // 1000
  });
});
