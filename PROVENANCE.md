# Provenance & Asset Disclosure Ledger

**Project:** Synaptic Memory Lab  
**Track:** DataForge 2026: Pathway Track (NeurIPS 2026 Education Alignment)  
**Authorship:** 2-Member Independent Student Team

---

## 1. AI Assistance Disclosure
In strict adherence to the competition's technical ownership and integrity rules:

- **AI-Assisted Scaffolding:** An LLM agent was utilized for generating initial boilerplate scaffolding (Vite configuration, React TypeScript component skeleton, Tailwind CSS token mappings, and SVG chart axis helper functions).
- **Human Verification & Intellectual Ownership:**
  - Every equation in `/src/engine/hebbianMemory.ts` ($S_t = \lambda S_{t-1} + \eta (V_t K_t^\top)$ and $\hat{V}_t = S_{t-1} Q_t$) was derived directly from primary literature (Pathway's *"From Attention to Synapses"* and *"Equations of Reasoning"*).
  - The capacity boundary ratio and cross-talk interference testing suite (`/src/engine/interference.ts`) were designed and calibrated by the team to ensure the one-sentence claim is empirically tested in the browser.
  - The team understands and can verbally defend every line of code, formula, and architectural choice during live jury evaluation.

---

## 2. Reused Code, Libraries & Assets

| Component / Asset | Source / Author | License | Description / Purpose |
| :--- | :--- | :--- | :--- |
| **React 19** | Meta Open Source | MIT License | Frontend UI framework |
| **Vite 8** | Yuxi (Evan) You & Vite Contributors | MIT License | Build tool & local development server |
| **Tailwind CSS 4** | Tailwind Labs Inc. | MIT License | Utility-first CSS styling engine |
| **Lucide React** | Lucide Project | ISC License | Accessible SVG iconography |
| **ReportLab** | ReportLab Europe Ltd. | BSD License | Python PDF generation library for the concept summary |

---

## 3. Data & Benchmark Provenance

| Dataset / Metric | Originating Primary Source | Evidence Type | Usage in Artifact |
| :--- | :--- | :--- | :--- |
| **1B to 600B Parameter Scaling** | Pathway Research (2025/2026). Pretraining evaluations on Amazon SageMaker HyperPod. | `reported_by_developer` | Precomputed static table in `public/data/bdh_scaling_1b_to_600b.json` comparing RAM vs. throughput. |
| **BDH-CQ ARC-AGI Effort Levels** | Pathway Technical Report (2026). *BDH-CQ: In-Context Learning from Demonstrations without Chain of Thought.* | `benchmark_result` | Latent reasoning evaluation comparing accuracy vs. cost across recurrent steps in `public/data/bdhcq_arcagi_effort_levels.json`. |
| **Synthetic Vector Associative Pairs** | Deterministic pseudo-random generation with sparse non-negative activation in `/src/engine/hebbianMemory.ts`. | `synthetic_live` | Live associative memory simulation computed directly in user's browser. |

---

## 4. Official Toy Model Disclaimer

The live numerical simulator included in this repository is an independent, illustrative toy model designed for educational clarity and conceptual visualization. It is explicitly separate from and not presented as an official checkpoint, proprietary weights, or commercial software from Pathway.
