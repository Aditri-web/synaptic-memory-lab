import {
  hebbianWrite,
  synapticRead,
  computeCosineSimilarity,
  generateSparseVector,
  initializeSynapticMatrix,
  type AssociativePair,
  type RetrievalResult,
} from './hebbianMemory';
import { CAPS } from './caps';

export interface InterferenceSimulationResult {
  dimension: number;
  totalPairs: number;
  eta: number;
  lambdaDecay: number;
  sparsity: number;
  results: RetrievalResult[];
  averageSimilarity: number;
  capacityLimitReachedAt: number | null;
  accuracyCurve: { pairsStored: number; meanSimilarity: number }[];
  finalSynapticMatrix: Float32Array;
}

const COMMON_KEYS = [
  'User_Auth_Token', 'Session_Expiry', 'Payment_Intent_ID', 'Cart_Checkout_Hash',
  'Vector_Embedding_Anchor', 'User_Preference_Cluster', 'API_Gateway_Route', 'Cache_Invalidation_Tag',
  'Telemetry_Trace_Span', 'Database_Shard_Key', 'Document_Context_Node', 'Attention_Mask_Offset',
  'Spatial_Graph_Vertex', 'State_Machine_Checkpoint', 'Dialogue_Agent_Goal', 'Dynamic_Lexicon_ID',
  'Sensor_Stream_Epoch', 'Federated_Model_Weight', 'Constraint_Solver_Basis', 'Quantum_Gate_Register'
];

/**
 * Runs a complete multi-association experiment, testing retrieval error
 * at every step to find the exact boundary where memory cross-talk begins.
 */
export function runInterferenceExperiment(
  totalPairs: number,
  dim: number = CAPS.DEFAULT_DIM,
  eta: number = CAPS.DEFAULT_ETA,
  lambdaDecay: number = CAPS.DEFAULT_LAMBDA,
  sparsity: number = CAPS.DEFAULT_SPARSITY
): InterferenceSimulationResult {
  // Clamp parameters to legal CAPS
  const safeDim = Math.max(CAPS.MIN_DIM, Math.min(CAPS.MAX_DIM, dim));
  const safeCount = Math.max(CAPS.MIN_ASSOCIATIONS, Math.min(CAPS.MAX_ASSOCIATIONS, totalPairs));
  
  let matrix = initializeSynapticMatrix(safeDim);
  const pairs: AssociativePair[] = [];
  const accuracyCurve: { pairsStored: number; meanSimilarity: number }[] = [];

  // Generate and sequentially write associative pairs
  for (let i = 0; i < safeCount; i++) {
    const keyLabel = COMMON_KEYS[i % COMMON_KEYS.length] + (i >= COMMON_KEYS.length ? `_${Math.floor(i / COMMON_KEYS.length)}` : '');
    const valueLabel = `Value_Payload_${i + 1}`;

    const keyVec = generateSparseVector(safeDim, sparsity, i * 2);
    const valVec = generateSparseVector(safeDim, sparsity, i * 2 + 1);

    pairs.push({
      id: `pair_${i}`,
      keyLabel,
      valueLabel,
      keyVector: keyVec,
      valueVector: valVec,
      stepAdded: i + 1,
    });

    // Write into synaptic matrix via Hebbian rule
    matrix = hebbianWrite(matrix, safeDim, keyVec, valVec, eta, lambdaDecay);

    // Sample retrieval across all currently stored items every few steps
    if (i === 0 || (i + 1) % Math.max(1, Math.floor(safeCount / 20)) === 0 || i === safeCount - 1) {
      let simSum = 0;
      for (let j = 0; j <= i; j++) {
        const readVal = synapticRead(matrix, safeDim, pairs[j].keyVector);
        simSum += computeCosineSimilarity(pairs[j].valueVector, readVal);
      }
      accuracyCurve.push({
        pairsStored: i + 1,
        meanSimilarity: parseFloat((simSum / (i + 1)).toFixed(3)),
      });
    }
  }

  // Final evaluation for each pair
  const results: RetrievalResult[] = [];
  let totalSim = 0;
  let capacityLimit: number | null = null;

  for (let i = 0; i < pairs.length; i++) {
    const p = pairs[i];
    const retrieved = synapticRead(matrix, safeDim, p.keyVector);
    const sim = computeCosineSimilarity(p.valueVector, retrieved);
    totalSim += sim;

    // Check if retrieval degraded below accuracy threshold (0.65)
    if (sim < 0.65 && capacityLimit === null) {
      capacityLimit = i + 1;
    }

    // Mean squared error across elements
    let mse = 0;
    for (let k = 0; k < safeDim; k++) {
      const diff = p.valueVector[k] - retrieved[k];
      mse += diff * diff;
    }
    mse /= safeDim;

    results.push({
      pairId: p.id,
      keyLabel: p.keyLabel,
      expectedValue: p.valueVector,
      retrievedValue: retrieved,
      cosineSimilarity: parseFloat(sim.toFixed(3)),
      mseError: parseFloat(mse.toFixed(4)),
      isAccurate: sim >= 0.70,
    });
  }

  return {
    dimension: safeDim,
    totalPairs: safeCount,
    eta,
    lambdaDecay,
    sparsity,
    results,
    averageSimilarity: parseFloat((totalSim / safeCount).toFixed(3)),
    capacityLimitReachedAt: capacityLimit,
    accuracyCurve,
    finalSynapticMatrix: matrix,
  };
}
