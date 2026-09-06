/**
 * Computes exact GPU memory footprint comparison between:
 * 1. Standard Transformer Attention (KV Cache growing linearly with sequence length O(N))
 * 2. Dragon Hatchling Synaptic Memory (Fixed d x d matrix O(1) state)
 */

export interface ModelArchConfig {
  numLayers: number;
  numHeads: number;
  headDim: number;
  bytesPerParam: number; // 2 for FP16/BF16, 4 for FP32
}

export const DEFAULT_ARCH: ModelArchConfig = {
  numLayers: 12,
  numHeads: 8,
  headDim: 64, // total d = 512
  bytesPerParam: 2, // 16-bit precision
};

export interface MemoryComparisonPoint {
  sequenceLength: number;
  kvCacheBytes: number;
  kvCacheMB: number;
  synapticStateBytes: number;
  synapticStateMB: number;
  ratio: number;
}

/**
 * Standard Transformer KV Cache size formula:
 * KV Cache = 2 (Key + Value) * num_layers * num_heads * head_dim * sequence_length * bytes_per_param
 */
export function calculateKVCacheBytes(
  seqLen: number,
  arch: ModelArchConfig = DEFAULT_ARCH
): number {
  return 2 * arch.numLayers * arch.numHeads * arch.headDim * seqLen * arch.bytesPerParam;
}

/**
 * BDH Synaptic State footprint formula:
 * Synaptic State = num_layers * num_heads * (head_dim * head_dim) * bytes_per_param
 * Notice: Completely INDEPENDENT of sequence length N! Constant O(1).
 */
export function calculateSynapticStateBytes(
  arch: ModelArchConfig = DEFAULT_ARCH
): number {
  return arch.numLayers * arch.numHeads * (arch.headDim * arch.headDim) * arch.bytesPerParam;
}

/**
 * Generates comparison series over sequence tokens [1 ... N].
 */
export function generateMemoryTrajectory(
  maxSeqLen: number,
  steps: number = 50,
  arch: ModelArchConfig = DEFAULT_ARCH
): MemoryComparisonPoint[] {
  const points: MemoryComparisonPoint[] = [];
  const fixedSynapticBytes = calculateSynapticStateBytes(arch);
  const fixedSynapticMB = fixedSynapticBytes / (1024 * 1024);

  const stepSize = Math.max(1, Math.floor(maxSeqLen / steps));

  for (let len = 1; len <= maxSeqLen; len += stepSize) {
    const kvBytes = calculateKVCacheBytes(len, arch);
    const kvMB = kvBytes / (1024 * 1024);

    points.push({
      sequenceLength: len,
      kvCacheBytes: kvBytes,
      kvCacheMB: parseFloat(kvMB.toFixed(3)),
      synapticStateBytes: fixedSynapticBytes,
      synapticStateMB: parseFloat(fixedSynapticMB.toFixed(3)),
      ratio: parseFloat((kvBytes / fixedSynapticBytes).toFixed(2)),
    });
  }

  return points;
}
