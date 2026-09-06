import React, { useState } from 'react';
import { PRESET_SCENARIOS, type PresetScenario } from './engine/presets';
import { runInterferenceExperiment, type InterferenceSimulationResult } from './engine/interference';
import { HookSection } from './components/sections/HookSection';
import { SandboxSection } from './components/sections/SandboxSection';
import { BDHModuleSection } from './components/sections/BDHModuleSection';
import { Brain, ShieldCheck, Download } from 'lucide-react';

export function App() {
  const [currentPreset, setCurrentPreset] = useState<PresetScenario>(PRESET_SCENARIOS[0]);
  const [activeTab, setActiveTab] = useState<'hook' | 'sandbox' | 'bdh'>('hook');

  // Compute live state for the active Hook scenario
  const hookSimulationResult: InterferenceSimulationResult = React.useMemo(() => {
    return runInterferenceExperiment(
      currentPreset.totalPairs,
      currentPreset.dim,
      currentPreset.eta,
      currentPreset.lambdaDecay,
      currentPreset.sparsity
    );
  }, [currentPreset]);

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col items-center">
      {/* Top Navigation Bar */}
      <header className="w-full sticky top-0 z-50 backdrop-blur-md bg-[#070b12]/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/20">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm md:text-base tracking-tight text-white">
                  Synaptic Memory Lab
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700/60 font-mono">
                  DataForge 2026
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono hidden sm:block">
                Hebbian Synaptic Memory &bull; Dragon Hatchling (BDH) Explainer Substrate
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center gap-1.5 md:gap-3">
            <button
              onClick={() => setActiveTab('hook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'hook'
                  ? 'bg-indigo-600/90 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              The Hook (Guided)
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'sandbox'
                  ? 'bg-indigo-600/90 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              Synaptic Sandbox
            </button>
            <button
              onClick={() => setActiveTab('bdh')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === 'bdh'
                  ? 'bg-indigo-600/90 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              BDH Deep Dive
            </button>
            <a
              href="./DataForge_2026_One_Page_Concept_Summary.pdf"
              download="DataForge_2026_One_Page_Concept_Summary.pdf"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600/90 hover:bg-emerald-500 text-white shadow-md transition-all ml-1"
            >
              <Download className="w-3.5 h-3.5" />
              <span>1-Page Summary PDF</span>
            </a>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8 flex-1">
        {/* Render sections depending on active tab, with easy continuous scroll */}
        {activeTab === 'hook' && (
          <HookSection
            currentPreset={currentPreset}
            onSelectPreset={setCurrentPreset}
            simulationResult={hookSimulationResult}
            onJumpToSandbox={() => setActiveTab('sandbox')}
          />
        )}

        {activeTab === 'sandbox' && (
          <SandboxSection />
        )}

        {activeTab === 'bdh' && (
          <BDHModuleSection />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#05080e] py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Built for <strong>DataForge 2026: Pathway Track</strong> &bull; NeurIPS 2026 Education Alignment</span>
          </div>
          <div className="font-mono text-[11px] text-slate-400">
            2-Member Engineering &bull; Pure Client Substrate &bull; Zero Flaky APIs
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
