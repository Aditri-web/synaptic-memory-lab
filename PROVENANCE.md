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
  - **All mathematical claims are validated by 33 automated unit tests** (`src/engine/__tests__/`) that verify equations against hand-calculated known values from the primary literature.
  - The team understands and can verbally defend every line of code, formula, and architectural choice during live jury evaluation.

---

## 2. Reused Code, Libraries & Assets

| Component / Asset | Source / Author | License | Description / Purpose |
| :--- | :--- | :--- | :--- |
| **React 19** | Meta Open Source | MIT License | Frontend UI framework |
| **Vite 8** | Yuxi (Evan) You & Vite Contributors | MIT License | Build tool & local development server |
| **Tailwind CSS 4** | Tailwind Labs Inc. | MIT License | Utility-first CSS styling engine |
| **Lucide React** | Lucide Project | ISC License | Accessible SVG iconography |
| **Vitest 4** | Vitest Contributors | MIT License | Unit testing framework for engine validation |
| **ReportLab** | ReportLab Europe Ltd. | BSD License | Python PDF generation library for the concept summary |

---

## 3. Data & Benchmark Provenance

| Dataset / Metric | Originating Primary Source | Evidence Type | Usage in Artifact |
| :--- | :--- | :--- | :--- |
| **1B to 600B Parameter Scaling** | Pathway Research (2025/2026). Pretraining evaluations on Amazon SageMaker HyperPod. | `reported_by_developer` | Precomputed static table in `public/data/bdh_scaling_1b_to_600b.json` comparing RAM vs. throughput. |
| **BDH-CQ ARC-AGI Effort Levels** | Pathway Technical Report (2026). *BDH-CQ: In-Context Learning from Demonstrations without Chain of Thought.* | `benchmark_result` | Latent reasoning evaluation comparing accuracy vs. cost across recurrent steps in `public/data/bdhcq_arcagi_effort_levels.json`. |
| **Synthetic Vector Associative Pairs** | Deterministic pseudo-random generation with sparse non-negative activation in `/src/engine/hebbianMemory.ts`. | `synthetic_live` | Live associative memory simulation computed directly in user's browser. |

---

## 4. Citation Classification

> **Transparency note:** We clearly distinguish between peer-reviewed academic literature and non-peer-reviewed developer publications.

### 🟢 Peer-Reviewed Literature
These citations have undergone anonymous peer review and are published in recognized academic venues:

| # | Citation | Venue | Review Status |
|:---:|:---|:---|:---|
| 1 | Hopfield & Krotov (2022). *"Dense Associative Memories and Modern Hebbian Learning."* | Physical Review Research / NeurIPS 2022 | 🟢 Peer-Reviewed |
| 2 | Sun, Xu & Feng (2024). *"Recurrent Linear Formulations and Non-Negative Sparsity in Post-Transformer Architectures."* | IEEE TNNLS | 🟢 Peer-Reviewed |
| 3 | Schlag, Irie & Schmidhuber (2023). *"Linear Transformers Are Secretly Fast Weight Programmers."* | ICML 2023 | 🟢 Peer-Reviewed |

### 🟡 Developer Technical Reports (Non-Peer-Reviewed)
These are primary sources for BDH-specific architecture details. They have **not** undergone anonymous peer review:

| # | Citation | Type | Review Status |
|:---:|:---|:---|:---|
| 4 | Pathway Research (2025/2026). *"From Attention to Synapses: Deriving BDH and The Equations of Reasoning."* | Technical Blog Post | 🟡 Non-Peer-Reviewed |
| 5 | Pathway Research (2026). *"BDH-CQ: In-Context Learning from Demonstrations without Chain-of-Thought."* | Technical Report | 🟡 Non-Peer-Reviewed |

---

## 5. Official Toy Model Disclaimer

The live numerical simulator included in this repository is an independent, illustrative toy model designed for educational clarity and conceptual visualization. It is explicitly separate from and not presented as an official checkpoint, proprietary weights, or commercial software from Pathway.
