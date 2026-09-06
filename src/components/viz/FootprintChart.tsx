import React from 'react';
import { generateMemoryTrajectory, DEFAULT_ARCH } from '../../engine/kvCache';

interface FootprintChartProps {
  currentSequenceLength: number;
}

export const FootprintChart: React.FC<FootprintChartProps> = ({
  currentSequenceLength,
}) => {
  const maxTokens = Math.max(200, Math.min(2000, currentSequenceLength * 1.5));
  const trajectory = generateMemoryTrajectory(maxTokens, 30, DEFAULT_ARCH);

  const maxKVCache = trajectory[trajectory.length - 1].kvCacheMB;
  const fixedSynapticMB = trajectory[0].synapticStateMB;
  const yMax = Math.max(maxKVCache * 1.1, fixedSynapticMB * 1.5);

  const width = 360;
  const height = 180;
  const padding = { top: 20, right: 30, bottom: 30, left: 45 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Scale functions
  const getX = (tokens: number) => padding.left + (tokens / maxTokens) * chartW;
  const getY = (mb: number) => padding.top + chartH - (mb / yMax) * chartH;

  // Generate SVG path for KV Cache (Line ascending O(N))
  const kvPoints = trajectory.map(p => `${getX(p.sequenceLength)},${getY(p.kvCacheMB)}`).join(' ');
  // Current point
  const currentKVMB = (
    (2 * DEFAULT_ARCH.numLayers * DEFAULT_ARCH.numHeads * DEFAULT_ARCH.headDim * currentSequenceLength * DEFAULT_ARCH.bytesPerParam) /
    (1024 * 1024)
  ).toFixed(2);

  return (
    <div className="w-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Memory Footprint (RAM)
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-semibold">
            LIVE CALC
          </span>
        </div>
        <div className="flex items-center gap-4 text-xs font-mono font-medium">
          <div className="flex items-center gap-1.5 text-rose-600">
            <span className="w-2.5 h-1 bg-rose-500 inline-block rounded"></span>
            <span>KV Cache: {currentKVMB} MB</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-600">
            <span className="w-2.5 h-1 bg-indigo-600 inline-block rounded"></span>
            <span>BDH Synapse: {fixedSynapticMB} MB (Fixed)</span>
          </div>
        </div>
      </div>

      <div className="relative w-full bg-slate-50/80 rounded-xl p-2 border border-slate-200 shadow-xs">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          {/* Grid lines */}
          <line x1={padding.left} y1={padding.top} x2={padding.left + chartW} y2={padding.top} stroke="#e2e8f0" strokeDasharray="3,3" />
          <line x1={padding.left} y1={padding.top + chartH / 2} x2={padding.left + chartW} y2={padding.top + chartH / 2} stroke="#e2e8f0" strokeDasharray="3,3" />
          <line x1={padding.left} y1={padding.top + chartH} x2={padding.left + chartW} y2={padding.top + chartH} stroke="#cbd5e1" />

          {/* Axes labels */}
          <text x={padding.left - 8} y={padding.top + 4} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
            {yMax.toFixed(0)}MB
          </text>
          <text x={padding.left - 8} y={padding.top + chartH} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
            0MB
          </text>
          <text x={padding.left + chartW} y={padding.top + chartH + 18} fill="#64748b" fontSize="9" textAnchor="end" fontFamily="monospace">
            N={maxTokens} tokens
          </text>

          {/* BDH Flat Synaptic State Line */}
          <line
            x1={padding.left}
            y1={getY(fixedSynapticMB)}
            x2={padding.left + chartW}
            y2={getY(fixedSynapticMB)}
            stroke="#4f46e5"
            strokeWidth="2.5"
          />

          {/* Transformer KV Cache Line */}
          <polyline
            fill="none"
            stroke="#e11d48"
            strokeWidth="2.5"
            points={kvPoints}
          />

          {/* Current position marker */}
          <line
            x1={getX(currentSequenceLength)}
            y1={padding.top}
            x2={getX(currentSequenceLength)}
            y2={padding.top + chartH}
            stroke="#94a3b8"
            strokeWidth="1.5"
            strokeDasharray="4,4"
          />
          <circle
            cx={getX(currentSequenceLength)}
            cy={getY(parseFloat(currentKVMB))}
            r="4"
            fill="#e11d48"
            className="animate-pulse"
          />
          <circle
            cx={getX(currentSequenceLength)}
            cy={getY(fixedSynapticMB)}
            r="4"
            fill="#4f46e5"
          />
        </svg>
      </div>

      <p className="text-[11px] text-slate-500 mt-2 italic text-center">
        Transformer KV cache scales linearly <span className="text-rose-600 font-mono font-semibold">O(N)</span> with every token. BDH synaptic memory stays completely constant <span className="text-indigo-600 font-mono font-semibold">O(1)</span>.
      </p>
    </div>
  );
};
