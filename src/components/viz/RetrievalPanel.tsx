import React from 'react';
import type { RetrievalResult } from '../../engine/hebbianMemory';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

interface RetrievalPanelProps {
  results: RetrievalResult[];
  selectedIndex: number;
  onSelectIndex: (idx: number) => void;
}

export const RetrievalPanel: React.FC<RetrievalPanelProps> = ({
  results,
  selectedIndex,
  onSelectIndex,
}) => {
  if (!results.length) return null;

  const current = results[selectedIndex] || results[0];
  const sampleDim = Math.min(24, current.expectedValue.length);

  return (
    <div className="w-full flex flex-col gap-3">
      {/* Header with selector */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Truth Beside Estimate (Fidelity Probe)
          </span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold flex items-center gap-1 ${
            current.isAccurate
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {current.isAccurate ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                <span>RECALLED (Cos &ge; 0.70)</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3 h-3" />
                <span>INTERFERENCE FORGETTING</span>
              </>
            )}
          </span>
        </div>

        {/* Association Key Selector */}
        <select
          aria-label="Select stored key association"
          value={selectedIndex}
          onChange={(e) => onSelectIndex(Number(e.target.value))}
          className="bg-white text-slate-800 text-xs rounded border border-slate-300 px-2.5 py-1 font-mono focus:border-indigo-500 shadow-xs outline-none"
        >
          {results.map((r, idx) => (
            <option key={r.pairId} value={idx}>
              #{idx + 1}: {r.keyLabel} ({r.cosineSimilarity.toFixed(2)})
            </option>
          ))}
        </select>
      </div>

      {/* Numerical Metrics Bar */}
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-center shadow-xs">
        <div>
          <span className="text-[10px] uppercase text-slate-500 font-mono block">Query Key</span>
          <span className="text-xs font-bold text-indigo-900 font-mono truncate block">
            {current.keyLabel}
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-slate-500 font-mono block">Cosine Similarity</span>
          <span className={`text-xs font-bold font-mono ${
            current.cosineSimilarity >= 0.75 ? 'text-emerald-600' : current.cosineSimilarity >= 0.60 ? 'text-amber-600' : 'text-rose-600'
          }`}>
            {(current.cosineSimilarity * 100).toFixed(1)}%
          </span>
        </div>
        <div>
          <span className="text-[10px] uppercase text-slate-500 font-mono block">Reconstruction MSE</span>
          <span className="text-xs font-mono font-semibold text-slate-700">
            {current.mseError.toFixed(4)}
          </span>
        </div>
      </div>

      {/* Vector Visualization: Expected (Truth) vs Retrieved (Estimate) */}
      <div className="flex flex-col gap-2 bg-slate-50/80 p-3 rounded-lg border border-slate-200 shadow-xs">
        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <strong>Ground Truth Value Vector</strong> (First {sampleDim} dims)
          </span>
          <span className="font-mono text-slate-500 text-[10px]">Written Value</span>
        </div>
        <div className="grid grid-flow-col auto-cols-fr gap-1 h-6 items-end bg-white p-1 rounded border border-slate-200">
          {Array.from(current.expectedValue.slice(0, sampleDim)).map((val, i) => (
            <div
              key={`exp_${i}`}
              style={{ height: `${Math.max(8, Math.min(100, val * 100))}%` }}
              className="bg-emerald-600/80 rounded-t-sm"
              title={`Dim ${i}: ${val.toFixed(2)}`}
            />
          ))}
        </div>

        <div className="flex items-center justify-center my-0.5 text-slate-400">
          <ArrowRight className="w-3.5 h-3.5 rotate-90" />
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
            <strong>Retrieved Estimate Vector</strong> (v_hat = S &middot; q)
          </span>
          <span className="font-mono text-slate-500 text-[10px]">Readout</span>
        </div>
        <div className="grid grid-flow-col auto-cols-fr gap-1 h-6 items-end bg-white p-1 rounded border border-slate-200">
          {Array.from(current.retrievedValue.slice(0, sampleDim)).map((val, i) => (
            <div
              key={`ret_${i}`}
              style={{ height: `${Math.max(8, Math.min(100, val * 100))}%` }}
              className={`${
                current.isAccurate ? 'bg-indigo-600/80' : 'bg-rose-500/80'
              } rounded-t-sm transition-all duration-300`}
              title={`Dim ${i}: ${val.toFixed(2)}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

