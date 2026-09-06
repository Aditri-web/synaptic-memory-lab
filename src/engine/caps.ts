/**
 * Hard caps and bounds configuration for the live simulation engine and UI.
 * Prevents UI and numerical engine drift.
 */
export const CAPS = {
  // Live simulation dimension bounds
  MIN_DIM: 16,
  MAX_DIM: 256,
  DEFAULT_DIM: 64,

  // Sequence length / association count bounds
  MIN_ASSOCIATIONS: 2,
  MAX_ASSOCIATIONS: 1000,
  DEFAULT_ASSOCIATIONS: 24,

  // Threshold where interference is guaranteed to become clearly visible
  // For d=64, capacity limit is roughly ~0.15 * d^2 or orthogonal bounds ~ 0.5 * d
  INTERFERENCE_THRESHOLD_RATIO: 0.65,

  // Hebbian learning rate η bounds
  MIN_ETA: 0.05,
  MAX_ETA: 1.5,
  DEFAULT_ETA: 0.5,

  // Memory retention factor λ bounds
  MIN_LAMBDA: 0.5,
  MAX_LAMBDA: 1.0,
  DEFAULT_LAMBDA: 0.98,

  // Sparsity ratio (non-zero activations in BDH ReLU)
  MIN_SPARSITY: 0.02,
  MAX_SPARSITY: 0.5,
  DEFAULT_SPARSITY: 0.05, // 5% active units in reported BDH runs

  // Max live calculation time budget
  MAX_BUDGET_MS: 150,
} as const;
