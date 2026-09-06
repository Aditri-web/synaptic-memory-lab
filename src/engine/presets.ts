/**
 * Pre-configured deterministic scenarios for the guided 60-second Hook.
 * Ensures judges and learners never see a blank canvas or empty run state.
 */

export interface PresetScenario {
  id: string;
  name: string;
  tagline: string;
  description: string;
  totalPairs: number;
  dim: number;
  eta: number;
  lambdaDecay: number;
  sparsity: number;
  expectedOutcome: string;
}

export const PRESET_SCENARIOS: PresetScenario[] = [
  {
    id: 'sweet-spot',
    name: 'Optimal Synaptic Recall (The Sweet Spot)',
    tagline: 'High retrieval fidelity within stable memory capacity',
    description: '16 semantic key-value pairs written into a 64-dimensional synaptic matrix. Sparse ReLU non-negativity (~5% active) preserves near-orthogonal channels with zero KV cache growth.',
    totalPairs: 16,
    dim: 64,
    eta: 0.5,
    lambdaDecay: 0.98,
    sparsity: 0.05,
    expectedOutcome: 'High Cosine Similarity (>0.90) across all items. Matrix stays bounded; KV cache would already consume 4x memory.',
  },
  {
    id: 'cross-talk-cliff',
    name: 'Capacity Saturation & Cross-Talk Cliff',
    tagline: 'Witnessing the falsifiable limit: where fixed-state memory forgets',
    description: 'Pushing 64 pairs into the same 64-dimensional matrix without expanding dimension. Synaptic weights saturate, and older keys suffer cross-talk interference.',
    totalPairs: 64,
    dim: 64,
    eta: 0.6,
    lambdaDecay: 0.95,
    sparsity: 0.08,
    expectedOutcome: 'Retrieval accuracy drops below 0.65 threshold as the fixed matrix reaches informational capacity limits.',
  },
  {
    id: 'rapid-decay',
    name: 'High Plasticity with Rapid Forgetting (λ = 0.70)',
    tagline: 'Short-term working memory with rolling eviction',
    description: 'Synaptic decay factor λ dropped to 0.70. Newly written pairs overwrite older memory rapidly, mimicking immediate working memory buffer.',
    totalPairs: 28,
    dim: 64,
    eta: 0.8,
    lambdaDecay: 0.70,
    sparsity: 0.05,
    expectedOutcome: 'Recent keys (last 5) achieve perfect recall (>0.95), while earlier keys decay towards zero.',
  },
  {
    id: 'dense-interference-disaster',
    name: 'Dense vs. Sparse Activation Contrast',
    tagline: 'Why BDH enforces ~5% sparsity via ReLU',
    description: 'Increasing activation sparsity from 5% to 35% (dense). Without sparse non-negative gates, interference destroys memory 3x faster.',
    totalPairs: 20,
    dim: 64,
    eta: 0.5,
    lambdaDecay: 0.98,
    sparsity: 0.35,
    expectedOutcome: 'Immediate degradation in retrieval quality due to overlapping dense synaptic writes.',
  },
];
