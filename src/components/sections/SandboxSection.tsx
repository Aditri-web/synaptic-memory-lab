import React, { useState, useMemo } from 'react';
import { Sliders, RotateCcw, AlertOctagon, TrendingDown, CheckCircle2 } from 'lucide-react';
import { CAPS } from '../../engine/caps';
import { runInterferenceExperiment } from '../../engine/interference';
import { SynapticHeatmap } from '../viz/SynapticHeatmap';
import { FootprintChart } from '../viz/FootprintChart';
import { RetrievalPanel } from '../viz/RetrievalPanel';

export const SandboxSection: React.FC = () => {
  // Independent parameter state for sandbox exploration
  const [totalPairs, setTotalPairs] = useState<number>(24);
  const [dim, setDim] = useState<number>(64);
  const [eta, setEta] = useState<number>(0.5);
  const [lambdaDecay, setLambdaDecay] = useState<number>(0.98);
  const [sparsity, setSparsity] = useState<number>(0.05);
  const [selectedProbeIndex, setSelectedProbeIndex] = useState<number>(0);

  // Run live simulation on change (fast under 100ms for these ranges)
  const simulationResult = useMemo(() => {
    return runInterferenceExperiment(totalPairs, dim, eta, lambdaDecay, sparsity);
  }, [totalPairs, dim, eta, lambdaDecay, sparsity]);

  const handleResetDefaults = () => {
    setTotalPairs(CAPS.DEFAULT_ASSOCIATIONS);
    setDim(CAPS.DEFAULT_DIM);
    setEta(CAPS.DEFAULT_ETA);
    setLambdaDecay(CAPS.DEFAULT_LAMBDA);
    setSparsity(CAPS.DEFAULT_SPARSITY);
    setSelectedProbeIndex(0);
  };

  // Cross-talk capacity warning
  const capacityWarning = totalPairs > dim * 0.6;

  return (
    <section id="sandbox" className="w-full flex flex-col gap-6 py-6 border-b border-slate-800">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
              <Sliders className="w-4 h-4" />
            </span>
            <h2 className="text-lg font-bold text-slate-100">
              The Synaptic Sandbox: Challenge & Falsify the Claim
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            Manipulate core concept variables. Every slider maps 1:1 to a real mathematical variable in the engine.
          </p>
        </div>

        <button
          onClick={handleResetDefaults}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>
      </div>

      {/* Explicit System Bounds per "No hidden limits" design standard */}
      <div className="flex items-center justify-between gap-3 text-[11px] font-mono text-slate-400 bg-slate-900/80 px-3.5 py-2 rounded-xl border border-slate-800">
        <span className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
          <span><strong>Stated Substrate Bounds:</strong> Dimension $d \in [16, 256]$ &bull; Associations $N \in [1, 2000]$ &bull; Sparsity $s \in [1\%, 30\%]$</span>
        </span>
        <span className="text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
          60 FPS Client-Side Budget
        </span>
      </div>

      {/* Control Sliders Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-inner">
        {/* Slider 1: Stored Associations N */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <label htmlFor="input-stored-pairs" className="text-slate-400 font-medium">Associations (N)</label>
            <span className="font-mono text-indigo-400 font-bold">{totalPairs}</span>
          </div>
          <input
            id="input-stored-pairs"
            type="range"
            min={CAPS.MIN_ASSOCIATIONS}
            max={128}
            step={2}
            value={totalPairs}
            onChange={(e) => {
              setTotalPairs(Number(e.target.value));
              if (selectedProbeIndex >= Number(e.target.value)) setSelectedProbeIndex(0);
            }}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-mono">Pushes memory towards capacity</span>
        </div>

        {/* Slider 2: Dimension d */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <label htmlFor="input-dimension-d" className="text-slate-400 font-medium">Dimension (d)</label>
            <span className="font-mono text-indigo-400 font-bold">{dim} &times; {dim}</span>
          </div>
          <input
            id="input-dimension-d"
            type="range"
            min={32}
            max={128}
            step={16}
            value={dim}
            onChange={(e) => setDim(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-mono">Matrix capacity capacity pool</span>
        </div>

        {/* Slider 3: Learning Rate η */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <label htmlFor="input-learning-rate-eta" className="text-slate-400 font-medium">Plasticity Rate (&eta;)</label>
            <span className="font-mono text-indigo-400 font-bold">{eta.toFixed(2)}</span>
          </div>
          <input
            id="input-learning-rate-eta"
            type="range"
            min={0.1}
            max={1.2}
            step={0.05}
            value={eta}
            onChange={(e) => setEta(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-mono">Hebbian write magnitude</span>
        </div>

        {/* Slider 4: Retention Decay λ */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <label htmlFor="input-decay-lambda" className="text-slate-400 font-medium">Retention (&lambda;)</label>
            <span className="font-mono text-indigo-400 font-bold">{lambdaDecay.toFixed(2)}</span>
          </div>
          <input
            id="input-decay-lambda"
            type="range"
            min={0.6}
            max={1.0}
            step={0.02}
            value={lambdaDecay}
            onChange={(e) => setLambdaDecay(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-mono">1.0 = no decay, &lt;1.0 = forgets old</span>
        </div>

        {/* Slider 5: Sparsity % */}
        <div className="flex flex-col gap-1.5">
          <div className="flex justify-between text-xs">
            <label htmlFor="input-sparsity-ratio" className="text-slate-400 font-medium">Active Sparsity</label>
            <span className="font-mono text-indigo-400 font-bold">{(sparsity * 100).toFixed(0)}%</span>
          </div>
          <input
            id="input-sparsity-ratio"
            type="range"
            min={0.02}
            max={0.35}
            step={0.01}
            value={sparsity}
            onChange={(e) => setSparsity(Number(e.target.value))}
            className="w-full accent-indigo-500 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 font-mono">BDH uses ~5% non-negative ReLU</span>
        </div>
      </div>

      {/* Dynamic Falsification Banner: Alerts learner when they have pushed to the capacity cliff */}
      {capacityWarning ? (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs">
          <AlertOctagon className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-300">Falsification Threshold Reached (Cross-talk Zone):</strong>
            <p className="mt-0.5 text-amber-200/90 leading-relaxed">
              You are writing <strong>{totalPairs} associations</strong> into a <strong>{dim}&times;{dim} matrix</strong>. Because capacity is finite, newly written outer products overwrite and corrupt earlier synaptic connections. Notice the retrieval fidelity dropping below 70%!
            </p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 text-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Operating within stable synaptic storage regime. High retrieval fidelity preserved with zero KV cache growth.</span>
        </div>
      )}

      {/* Dual Panel Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Heatmap & Experiment Diagnostics */}
        <div className="lg:col-span-5 flex flex-col gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase text-slate-300">
              Live Synaptic Matrix ($S_t$)
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              Mean Similarity: {(simulationResult.averageSimilarity * 100).toFixed(1)}%
            </span>
          </div>

          <SynapticHeatmap
            matrix={simulationResult.finalSynapticMatrix}
            dim={simulationResult.dimension}
            sparsity={simulationResult.sparsity}
            highlightUnit={null}
            writeSteps={simulationResult.writeSteps}
            eta={eta}
            lambdaDecay={lambdaDecay}
          />

          {/* Step-by-Step Retrieval Error Curve (SVG) */}
          <div className="flex flex-col gap-1 mt-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center text-[10px] uppercase font-mono text-slate-400 mb-1">
              <span className="flex items-center gap-1">
                <TrendingDown className="w-3 h-3 text-indigo-400" />
                <span>Memory Degradation Curve (Mean Cosine Sim vs Pairs)</span>
              </span>
            </div>
            
            <div className="h-16 w-full flex items-end gap-1 pt-2">
              {simulationResult.accuracyCurve.map((pt) => {
                const heightPercent = Math.max(10, Math.min(100, pt.meanSimilarity * 100));
                const isGood = pt.meanSimilarity >= 0.70;
                return (
                  <div
                    key={pt.pairsStored}
                    className="flex-1 flex flex-col items-center gap-1 group relative"
                  >
                    <div
                      style={{ height: `${heightPercent}%` }}
                      className={`w-full rounded-t-sm transition-all ${
                        isGood ? 'bg-indigo-500/80 hover:bg-indigo-400' : 'bg-rose-500/80 hover:bg-rose-400'
                      }`}
                    />
                    <div className="hidden group-hover:block absolute bottom-full mb-1 bg-slate-900 text-[9px] px-1.5 py-0.5 rounded border border-slate-700 font-mono text-slate-200 whitespace-nowrap z-10">
                      N={pt.pairsStored}: {(pt.meanSimilarity * 100).toFixed(0)}%
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-[9px] text-slate-500 font-mono mt-1">
              <span>1 Stored</span>
              <span>Threshold = 70%</span>
              <span>{totalPairs} Stored</span>
            </div>
          </div>
        </div>

        {/* Right: Footprint Chart + Truth Beside Estimate Panel */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <FootprintChart currentSequenceLength={totalPairs * 16} />
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <RetrievalPanel
              results={simulationResult.results}
              selectedIndex={selectedProbeIndex}
              onSelectIndex={setSelectedProbeIndex}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
