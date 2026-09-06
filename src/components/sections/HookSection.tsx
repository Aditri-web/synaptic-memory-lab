import React from 'react';
import { Sparkles, BrainCircuit, ArrowRight, ShieldCheck, Cpu } from 'lucide-react';
import { PRESET_SCENARIOS, type PresetScenario } from '../../engine/presets';
import { SynapticHeatmap } from '../viz/SynapticHeatmap';
import { FootprintChart } from '../viz/FootprintChart';
import { RetrievalPanel } from '../viz/RetrievalPanel';
import type { InterferenceSimulationResult } from '../../engine/interference';

interface HookSectionProps {
  currentPreset: PresetScenario;
  onSelectPreset: (preset: PresetScenario) => void;
  simulationResult: InterferenceSimulationResult;
  onJumpToSandbox: () => void;
}

export const HookSection: React.FC<HookSectionProps> = ({
  currentPreset,
  onSelectPreset,
  simulationResult,
  onJumpToSandbox,
}) => {
  const [selectedProbeIndex, setSelectedProbeIndex] = React.useState(0);

  return (
    <section className="w-full flex flex-col gap-6 py-6 border-b border-slate-800">
      {/* Top Banner: One-Sentence Claim Highlight */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900/90 to-purple-950/50 p-6 border border-indigo-500/20 shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <BrainCircuit className="w-5 h-5" />
            </span>
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-300">
              The 60-Second Hook &bull; Live Mathematical Substrate
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
              Topic: Synaptic Plasticity
            </span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Falsifiable Claim
            </span>
          </div>
        </div>

        <blockquote className="text-lg md:text-xl font-medium text-slate-100 leading-relaxed italic border-l-2 border-indigo-500 pl-4 my-3">
          &ldquo;A fixed-shape synaptic state matrix, updated at every step by a local Hebbian write rule, can store and later recall associative key&rarr;value pairs across an arbitrarily long sequence without allocating new memory per token &mdash; but its capacity is bounded, and past a threshold of stored associations it forgets through cross-talk interference rather than through eviction.&rdquo;
        </blockquote>

        <p className="text-xs text-slate-400 max-w-3xl">
          Observe the simulation running right now below. No blank canvas. No dummy animations. Every dot and curve is calculated live from the Hebbian update equations: <code className="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded font-mono">S_t = &lambda; S_{'{t-1}'} + &eta; (v_t k_t^T)</code>.
        </p>
      </div>

      {/* Preset Selector Buttons */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">
            Step 1: Choose a Guided Scenario (Instant Pre-run)
          </span>
          <span className="text-xs text-slate-500 font-mono">Select any preset below to watch the substrate update live</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_SCENARIOS.map((p) => {
            const isSelected = p.id === currentPreset.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectPreset(p);
                  setSelectedProbeIndex(0);
                }}
                className={`text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-indigo-950/70 border-indigo-500/80 shadow-lg shadow-indigo-950/50'
                    : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200">{p.name}</span>
                    {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>}
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{p.tagline}</p>
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-indigo-300 border-t border-slate-800/80 pt-2 mt-1">
                  <span>N={p.totalPairs} pairs</span>
                  <span>&lambda;={p.lambdaDecay}</span>
                  <span>Sparsity={(p.sparsity * 100).toFixed(0)}%</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Substrate Dual Display */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left: Synaptic Matrix Heatmap & Live Metrics (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-slate-300">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span>Synaptic Matrix ($S_t$)</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
              d={simulationResult.dimension} &times; {simulationResult.dimension}
            </span>
          </div>

          <SynapticHeatmap
            matrix={simulationResult.finalSynapticMatrix}
            dim={simulationResult.dimension}
            sparsity={simulationResult.sparsity}
            highlightUnit={null}
            writeSteps={simulationResult.writeSteps}
            eta={currentPreset.eta}
            lambdaDecay={currentPreset.lambdaDecay}
          />

          <div className="text-[11px] text-slate-400 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800">
            <strong className="text-indigo-300">Expected Outcome: </strong>
            <span>{currentPreset.expectedOutcome}</span>
          </div>
        </div>

        {/* Right: Footprint Chart + Truth Beside Estimate (8 cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <FootprintChart currentSequenceLength={currentPreset.totalPairs * 12} />
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

      {/* CTA: Move to Open Sandbox */}
      <div className="flex items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>Understood the guided preset? Unlock full control in the interactive sandbox below.</span>
        </div>

        <button
          onClick={onJumpToSandbox}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>Open Custom Sandbox</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </section>
  );
};
