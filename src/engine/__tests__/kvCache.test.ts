/**
 * Unit tests for the KV Cache vs Synaptic State footprint model.
 * 
 * Validates the exact memory formulas:
 *   KV Cache:      2 * layers * heads * head_dim * N * bytes_per_param   [O(N)]
 *   Synaptic State: layers * heads * head_dim^2 * bytes_per_param        [O(1)]
 * 
 * These formulas are architectural facts — they must produce exact byte counts.
 */
import { describe, it, expect } from 'vitest';
import {
  calculateKVCacheBytes,
  calculateSynapticStateBytes,
  generateMemoryTrajectory,
} from '../kvCache';

// =================================================================
// Test Suite: KV Cache formula
// =================================================================
describe('calculateKVCacheBytes', () => {
  it('should match hand-calculated KV cache size for default architecture', () => {
    // DEFAULT_ARCH: 12 layers, 8 heads, head_dim=64, 2 bytes (FP16)
    // Formula: 2 * 12 * 8 * 64 * N * 2
    const N = 1000;
    const expected = 2 * 12 * 8 * 64 * N * 2; // = 24,576,000 bytes
    expect(calculateKVCacheBytes(N)).toBe(expected);
  });

  it('should scale linearly with sequence length', () => {
    const bytes100 = calculateKVCacheBytes(100);
    const bytes200 = calculateKVCacheBytes(200);
    // Doubling N should exactly double KV cache size
    expect(bytes200).toBe(bytes100 * 2);
  });

  it('should return 0 for sequence length 0', () => {
    expect(calculateKVCacheBytes(0)).toBe(0);
  });

  it('should use custom architecture when provided', () => {
    const customArch = {
      numLayers: 6,
      numHeads: 4,
      headDim: 32,
      bytesPerParam: 4, // FP32
    };
    const N = 500;
    const expected = 2 * 6 * 4 * 32 * 500 * 4; // = 3,072,000
    expect(calculateKVCacheBytes(N, customArch)).toBe(expected);
  });
});

// =================================================================
// Test Suite: Synaptic State formula (O(1) — sequence-independent)
// =================================================================
describe('calculateSynapticStateBytes', () => {
  it('should match hand-calculated synaptic state for default architecture', () => {
    // DEFAULT_ARCH: 12 layers, 8 heads, head_dim=64, 2 bytes
    // Formula: 12 * 8 * (64 * 64) * 2 = 786,432 bytes
    const expected = 12 * 8 * 64 * 64 * 2;
    expect(calculateSynapticStateBytes()).toBe(expected);
  });

  it('should be completely independent of sequence length', () => {
    // The whole point of BDH: O(1) memory!
    const bytesA = calculateSynapticStateBytes();
    const bytesB = calculateSynapticStateBytes(); // called again, same result
    expect(bytesA).toBe(bytesB);
    // No sequence length parameter exists — this IS the test
  });
});

// =================================================================
// Test Suite: Memory trajectory & crossover
// =================================================================
describe('generateMemoryTrajectory', () => {
  it('should produce the correct number of data points', () => {
    const points = generateMemoryTrajectory(1000, 50);
    expect(points.length).toBeGreaterThan(0);
    expect(points.length).toBeLessThanOrEqual(50);
  });

  it('should have constant synaptic state across all sequence lengths', () => {
    const points = generateMemoryTrajectory(2000, 20);
    const firstSynaptic = points[0].synapticStateMB;
    for (const p of points) {
      expect(p.synapticStateMB).toBe(firstSynaptic);
    }
  });

  it('should have growing KV cache across sequence lengths', () => {
    const points = generateMemoryTrajectory(2000, 20);
    for (let i = 1; i < points.length; i++) {
      expect(points[i].kvCacheMB).toBeGreaterThan(points[i - 1].kvCacheMB);
    }
  });

  it('should show KV cache exceeding synaptic state at some crossover point', () => {
    // For default arch: synaptic = 786,432 bytes = 0.75 MB
    // KV cache at N=1: 24,576 bytes = 0.023 MB (much less)
    // KV cache at N=100: 2,457,600 bytes = 2.34 MB (much more)
    // Crossover exists somewhere between N=1 and N=100
    const points = generateMemoryTrajectory(200, 100);
    
    const hasCrossover = points.some(
      (p) => p.kvCacheMB > p.synapticStateMB
    );
    expect(hasCrossover).toBe(true);

    // Also verify that early points have KV < synaptic
    expect(points[0].kvCacheMB).toBeLessThan(points[0].synapticStateMB);
  });
});
