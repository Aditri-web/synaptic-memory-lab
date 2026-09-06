# MEMORY & PROJECT RUNBOOK

**Project Name:** Synaptic Memory Lab  
**Track:** DataForge 2026 — Pathway Track: Explain the Frontier (NeurIPS 2026 Education Alignment)  
**Topic:** Synaptic Plasticity as Short-Term Memory & In-Context Learning with Recurrent Memory in Dragon Hatchling (BDH / BDH-CQ)  
**One-Sentence Falsifiable Claim:**  
> *"A fixed-shape synaptic state matrix, updated at every step by a local Hebbian write rule, can store and later recall associative key→value pairs across an arbitrarily long sequence without allocating new memory per token — but its capacity is bounded, and past a threshold of stored associations it forgets through cross-talk interference rather than through eviction."*

---

## 1. Project Directory & Environment
- **Workspace Location:** `/Users/aditrisingh/.gemini/antigravity-ide/scratch/synaptic-memory-lab`
- **Tech Stack:**
  - React 18 + Vite + TypeScript (Strict Mode)
  - Tailwind CSS + Lucide Icons + Custom Canvas/SVG Visualizations
  - Client-Side Numerical Simulation Engine (TypedArrays, pure TS/JS, zero server latency)
  - Static JSON Reference Benchmarks (`/data`)
- **Key Constraints & Rules:**
  - **No generic AI slop**: Dense, mathematically accurate equations, clear definitions, evidence attribution.
  - **Truth beside estimate**: All retrieval queries show original written values vs. retrieved estimate vector.
  - **Fast feedback (<1s)**: Hard caps `d <= 256`, `N <= 2000` with precomputed fallback data for larger scale.
  - **Never misclassify BDH as SSM**: BDH-GPU is ReLU-low-rank with linear attention.
  - **Toy Model Disclosure**: Explicitly mark in-browser engine as an illustrative numerical substrate, not an official BDH checkpoint.

---

## 2. Architecture & Modules Layout
- `src/engine/`:
  - `hebbianMemory.ts`: $S_t = \lambda S_{t-1} + \eta (v_t k_t^\top)$, read step $\hat{v}_t = S_{t-1} q_t$, Frobenius norm, cosine similarity.
  - `kvCache.ts`: Exact memory footprint arithmetic ($2 \times \text{layers} \times \text{heads} \times d_k \times N \times \text{bytes}$).
  - `interference.ts`: Associative recall benchmark generator, cross-talk interference detection at capacity.
  - `presets.ts`: Deterministic seeded presets for the 60-second guided "Hook" walkthrough.
  - `caps.ts`: Shared parameter bounds (`d`, `N`, $\eta$, $\lambda$) preventing UI/engine divergence.
- `src/components/`:
  - `viz/SynapticHeatmap.tsx`: Live Canvas/SVG rendering of $S_t$ state matrix and activity patterns.
  - `viz/FootprintChart.tsx`: Live vs Precomputed KV-cache vs Synaptic RAM line chart.
  - `viz/RetrievalPanel.tsx`: Truth-vs-estimate vector bars, cosine similarity gauge, error indicator.
  - `viz/InterferenceCurve.tsx`: Capacity boundary curve showing the exact point of cross-talk forgetting.
  - `sections/HookSection.tsx`: 60-second pre-run guided scenario showing the core contrast.
  - `sections/SandboxSection.tsx`: Full interactive parameter control (N, d, $\lambda$, $\eta$, sparsity).
  - `sections/BDHModuleSection.tsx`: In-depth, primary-source-cited BDH & BDH-CQ deep dive with evidence badges.
- `public/data/`:
  - Precomputed reference results (`bdh_scaling_1b_to_600b.json`, `bdh_sudoku_extreme.json`, `bdhcq_arcagi_effort_levels.json`).

---

## 3. Progress Log

| Timestamp | Phase | Action / Milestone | Status |
|---|---|---|---|
| 2026-09-06 13:20 | Phase 0/1 | Initialized Vite React-TS project in `/Users/aditrisingh/.gemini/antigravity-ide/scratch/synaptic-memory-lab` | Complete |
| 2026-09-06 13:21 | Phase 1 | Created initial `memory.md` tracking architecture, rules, and rubric | Complete |
| 2026-09-06 13:23 | Phase 1 | Configured Tailwind CSS v4 `@tailwindcss/vite` & index.css design tokens | Complete |
| 2026-09-06 13:25 | Phase 2 | Implemented `caps.ts`, `hebbianMemory.ts`, `kvCache.ts`, `interference.ts`, `presets.ts` | Complete |
| 2026-09-06 13:26 | Phase 2 | Created static benchmark datasets in `public/data/` for 1B-600B scaling & ARC-AGI | Complete |
| 2026-09-06 13:27 | Phase 2 | Built interactive visualizations: `SynapticHeatmap.tsx`, `FootprintChart.tsx`, `RetrievalPanel.tsx` | Complete |
| 2026-09-06 13:28 | Phase 3 | Built guided sections: `HookSection.tsx`, `SandboxSection.tsx`, `BDHModuleSection.tsx` | Complete |
| 2026-09-06 13:30 | Phase 4 | Full production build (`npm run build`) passed with zero TS errors | Complete |
| 2026-09-06 13:36 | Phase 4 | Browser validation via Playwright agent: 100% components verified, 0 console errors | Complete |

---

## 4. Current State & Verification Summary
- **Live Server:** Running at `http://127.0.0.1:5173/`
- **Substrate Fidelity:** Live $S_t = \lambda S_{t-1} + \eta (v_t k_t^\top)$ matrix updates in browser with typed Float32Arrays.
- **Truth Beside Estimate:** Ground truth vectors side-by-side with retrieved estimate vectors and dynamic cosine similarity gauges.
- **Falsifiable Capacity Limit:** Cross-talk degradation triggers dynamically when associations exceed matrix capacity.
- **BDH Integration:** Fully sourced equations, pretraining 1B–600B scaling tables, ARC-AGI latent reasoning Pareto charts, and toy-model disclosures.
