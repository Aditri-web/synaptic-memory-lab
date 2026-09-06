import React, { useEffect, useRef } from 'react';

interface SynapticHeatmapProps {
  matrix: Float32Array;
  dim: number;
  sparsity: number;
  highlightUnit?: number | null;
}

export const SynapticHeatmap: React.FC<SynapticHeatmapProps> = ({
  matrix,
  dim,
  sparsity,
  highlightUnit = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const cellSize = width / dim;

    // Find max value in matrix for normalization
    let maxVal = 0.0001;
    for (let i = 0; i < matrix.length; i++) {
      if (matrix[i] > maxVal) maxVal = matrix[i];
    }

    ctx.clearRect(0, 0, width, height);

    // Draw individual synaptic weights
    for (let i = 0; i < dim; i++) {
      const rowOffset = i * dim;
      for (let j = 0; j < dim; j++) {
        const val = matrix[rowOffset + j];
        const normalized = Math.min(1, Math.max(0, val / maxVal));

        if (val === 0) {
          ctx.fillStyle = '#0f172a'; // dark background for inactive synapse
        } else {
          // Purple to Cyan/Emerald gradient for active synaptic weights
          const r = Math.round(99 + normalized * (16 - 99));
          const g = Math.round(102 + normalized * (185 - 102));
          const b = Math.round(241 + normalized * (129 - 241));
          const alpha = 0.15 + normalized * 0.85;
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        ctx.fillRect(j * cellSize, i * cellSize, Math.max(1, cellSize - 0.2), Math.max(1, cellSize - 0.2));
      }
    }

    // Highlight row/column if active query is selected
    if (highlightUnit !== null && highlightUnit >= 0 && highlightUnit < dim) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(0, highlightUnit * cellSize, width, cellSize);
    }
  }, [matrix, dim, highlightUnit]);

  // Compute live active synapse percentage
  let activeCount = 0;
  for (let i = 0; i < matrix.length; i++) {
    if (matrix[i] > 0.001) activeCount++;
  }
  const activePercent = ((activeCount / (dim * dim)) * 100).toFixed(1);

  return (
    <div className="flex flex-col items-center">
      <div className="relative p-2 rounded-xl bg-slate-950/80 border border-slate-800 shadow-2xl">
        <canvas
          ref={canvasRef}
          width={280}
          height={280}
          className="rounded-lg cursor-crosshair block"
        />
        <div className="absolute top-3 right-3 bg-slate-900/90 text-xs px-2 py-1 rounded border border-slate-700 text-indigo-300 font-mono">
          {dim} &times; {dim} Synapses
        </div>
      </div>

      <div className="w-full flex justify-between items-center mt-3 text-xs text-slate-400 px-1">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Active Synapses: <strong className="text-slate-200 font-mono">{activePercent}%</strong></span>
        </span>
        <span className="text-slate-500 font-mono">Target Sparsity: {(sparsity * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
};
