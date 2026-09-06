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
| **BDH-CQ ARC-AGI Verified Baseline** | Pathway Technical Report (2026). *BDH-CQ: In-Context Learning from Demonstrations without Chain of Thought.* Verified published benchmark result. | `verified_published_anchor` | **Anchor Point:** 29.5% accuracy at $0.00070/task with 0 CoT tokens. Displayed in `public/data/bdhcq_arcagi_effort_levels.json` and highlighted in the ARC-AGI module. |
| **ARC-AGI Latent Effort Frontier** | Derived consistent with Pathway's published anchor point. | `illustrative_projection_for_teaching` | Latent reasoning evaluation comparing accuracy vs. cost across recurrent refinement steps in `public/data/bdhcq_arcagi_effort_levels.json`. |
| **1B to 600B Parameter Scaling** | Pathway Research (2025/2026). Qualitative architectural principles. Modeled mathematically using standard LLaMA-style GQA parameters (FP16) vs fixed synaptic state at 128k context. | `illustrative_projection_for_teaching` | Precomputed educational reference table in `public/data/bdh_scaling_1b_to_600b.json` comparing RAM vs. throughput. |
| **Synthetic Vector Associative Pairs** | Deterministic pseudo-random generation with sparse non-negative activation in `/src/engine/hebbianMemory.ts`. | `synthetic_live` | Live associative memory simulation computed directly in user's browser with bounded parameters ($d \le 256, N \le 2000$). |

---

## 4. Citation Classification & Verification

> **Transparency note:** We maintain strict taxonomy distinctions between peer-reviewed academic conference literature, academic preprints, and developer publications.

### 🟢 Peer-Reviewed Academic Conference Literature (2022–2026)
These citations have undergone anonymous peer review and are published in recognized conference proceedings:

| # | Citation | Venue | Identifier / DOI | Review Status |
|:---:|:---|:---|:---|:---|
| 1 | Yang, Wang, Shen, Panda, & Kim (2024). *"Gated Linear Attention Transformers with Hardware-Efficient Training."* | ICML 2024 | [PMLR 235:56501–56523 (yang24ab)](https://proceedings.mlr.press/v235/yang24ab.html) &bull; [arXiv:2312.06635](https://arxiv.org/abs/2312.06635) | 🟢 Peer-Reviewed (ICML 2024) |

### 🔷 Foundational Equivalence Reference (Pre-2022 Conference Literature)

| # | Citation | Venue | Identifier / DOI | Review Status |
|:---:|:---|:---|:---|:---|
| 2 | Schlag, Irie, & Schmidhuber (2021). *"Linear Transformers Are Secretly Fast Weight Programmers."* | ICML 2021 | [PMLR 139:9355–9366 (schlag21a)](https://proceedings.mlr.press/v139/schlag21a.html) &bull; [arXiv:2102.11174](https://arxiv.org/abs/2102.11174) | 🔷 Peer-Reviewed (ICML 2021) |

### 🟣 Academic Research Preprints (Working Papers)
These papers originate from recognized industrial research labs and are publicly archived on arXiv:

| # | Citation | Institution | Identifier | Status |
|:---:|:---|:---|:---|:---|
| 3 | Sun, Dong, Huang, Ma, Xia, Xue, Wang, & Wei (2023). *"Retentive Network: A Successor to Transformer for Large Language Models."* | Microsoft Research | [arXiv:2307.08621 [cs.CL]](https://arxiv.org/abs/2307.08621) | 🟣 Academic Preprint (2023) |
| 4 | Behrouz, Zhong, & Mirrokni (2025). *"Titans: Learning to Memorize at Test Time."* | Google Research | [arXiv:2501.00663 [cs.LG]](https://arxiv.org/abs/2501.00663) | 🟣 Academic Preprint (2025) |

### 🟡 Developer Technical Publications (Non-Peer-Reviewed)
These are primary developer sources for BDH-specific architecture details and benchmarks. They have **not** undergone peer review:

| # | Citation | Type | Source Link | Status |
|:---:|:---|:---|:---|:---|
| 5 | Pathway Research (2025/2026). *"From Attention to Synapses: Deriving BDH and The Equations of Reasoning."* | Technical Whitepaper / Blog | [pathway.com](https://pathway.com) | 🟡 Non-Peer-Reviewed Developer Publication |
| 6 | Pathway Research (2026). *"BDH-CQ: In-Context Learning from Demonstrations without Chain-of-Thought."* | Technical Report / Benchmark | [pathway.com](https://pathway.com) | 🟡 Non-Peer-Reviewed Developer Report (29.5% ARC-AGI Anchor) |

---

## 5. Official Toy Model Disclaimer

The live numerical simulator included in this repository is an independent, illustrative toy model designed for educational clarity and conceptual visualization. It is explicitly separate from and not presented as an official checkpoint, proprietary weights, or commercial software from Pathway.
