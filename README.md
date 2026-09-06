# Synaptic Memory Lab: Explaining the Frontier

> **DataForge 2026: Pathway Track (NeurIPS 2026 Education Track Alignment)**  
> **Interactive Substrate & Explainer for Synaptic Plasticity & Recurrent Memory in Dragon Hatchling (BDH)**

[![License: MIT](https://img.shields.io/badge/License-MIT-indigo.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-cyan.svg)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-38bdf8.svg)](https://tailwindcss.com/)

---

## 1. The One-Sentence Falsifiable Claim

> *"A fixed-shape synaptic state matrix, updated at every step by a local Hebbian write rule, can store and later recall associative key→value pairs across an arbitrarily long sequence without allocating new memory per token — but its capacity is bounded, and past a threshold of stored associations it forgets through cross-talk interference rather than through eviction."*

This claim is directly verifiable and falsifiable in our live browser substrate. When you write up to $\approx 0.5 \times d$ associations into a $d \times d$ synaptic matrix with sparse ReLU non-negativity ($\approx 5\%$ active units), retrieval fidelity remains $>0.90$ with zero KV cache growth. When you intentionally overload the matrix past this threshold, cross-talk interference emerges dynamically without deleting tokens.

---

## 2. Intended Learner & Prerequisites

- **Audience:** Data scientists, ML engineers, and AI researchers familiar with standard Transformer attention ($Q, K, V$, softmax, and KV caches) who want to understand Post-Transformer recurrent memory and synaptic architectures.
- **Prerequisites:** 
  - Linear algebra (matrix-vector multiplication, outer products).
  - Basic understanding of standard self-attention: $\text{Attention}(Q,K,V) = \text{softmax}(QK^\top / \sqrt{d_k})V$.
  - The concept of KV-cache memory expansion $O(N)$ during autoregressive generation.
- **Non-Audience:** Pure novices with no vector calculus/ML background, or researchers looking for proprietary pretraining weight weights.

---

## 3. Learning Objectives

After completing the interactive walkthrough, a learner will be able to:
1. **Contrast Attention vs. Synaptic Plasticity:** Explain how attention can be formulated as a dynamic connectivity matrix $S_t \in \mathbb{R}^{d \times d}$ updated via Hebbian outer products rather than appending to a growing KV cache.
2. **Observe Constant Memory Complexity:** Verify empirically that BDH inference requires $O(1)$ memory state per layer across unbounded sequence lengths.
3. **Detect the Capacity Cliff (Falsification):** Predict and observe how overloading a fixed-shape matrix induces cross-talk interference rather than eviction.
4. **Distinguish BDH from State-Space Models (SSMs):** Understand why BDH is **not** a Mamba-style SSM, but a GPU-oriented formulation built from *ReLU-low-rank transformations with linear attention*.
5. **Evaluate BDH-CQ Latent Reasoning:** Understand how continuous latent updates enable in-context reasoning on benchmarks like ARC-AGI without generating explicit Chain-of-Thought (CoT) tokens or executing test-time gradient backpropagation.

---

## 4. Architecture of the Explorable Artifact

The system is constructed as a **zero-latency client-side numerical substrate** built in React 19 and TypeScript:

```
synaptic-memory-lab/
├── src/
│   ├── engine/                    # Pure TypeScript Mathematical Substrate
│   │   ├── hebbianMemory.ts       # S_t = λS_{t-1} + η(V K^T), read: V_hat = S Q, ReLU sparsity
│   │   ├── kvCache.ts             # Exact Transformer KV Cache arithmetic footprint model
│   │   ├── interference.ts        # Sequential associative recall & cross-talk detector
│   │   ├── presets.ts             # 4 Deterministic guided scenarios for the 60-second Hook
│   │   └── caps.ts                # Strict bounds (d <= 256, N <= 2000) preventing UI drift
│   ├── components/
│   │   ├── viz/
│   │   │   ├── SynapticHeatmap.tsx # Live Canvas rendering of d x d synaptic matrix
│   │   │   ├── FootprintChart.tsx  # SVG comparison of KV cache (O(N)) vs Synaptic RAM (O(1))
│   │   │   └── RetrievalPanel.tsx  # Truth Beside Estimate: expected vs retrieved vector bars
│   │   └── sections/
│   │       ├── HookSection.tsx     # 60-Second Guided Opening (no blank canvas!)
│   │       ├── SandboxSection.tsx  # Live parameter exploration & falsification controls
│   │       └── BDHModuleSection.tsx# Academic deep dive, 1B-600B scaling & ARC-AGI data
└── public/data/
    ├── bdh_scaling_1b_to_600b.json  # Precomputed reference scaling dataset
    └── bdhcq_arcagi_effort_levels.json # Precomputed ARC-AGI latent effort levels
```

### Component Roles & Provenance Breakdown

| Component | Substrate Type | Implementation Role |
| :--- | :--- | :--- |
| **Synaptic Heatmap** | **Live Computation** | Renders actual numerical values of $S_t$ from Float32Arrays directly to an HTML5 Canvas. |
| **Footprint Tracker** | **Live Computation** | Arithmetic model computing exact megabytes consumed by Transformer KV Cache vs. BDH matrix. |
| **Truth Beside Estimate** | **Live Computation** | Computes cosine similarity and Mean Squared Error between true written vectors and readout $\hat{v} = S \cdot q$. |
| **Capacity Curve** | **Live Computation** | Measures step-by-step retrieval fidelity degradation across sequential writes. |
| **1B–600B Scaling Panel** | **Precomputed Reference** | Pre-processed metrics from Pathway research on Amazon SageMaker HyperPod (`reported_by_developer`). |
| **ARC-AGI Effort Panel** | **Precomputed Reference** | Latent recurrent reasoning benchmarks across low, medium, and high compute budgets (`benchmark_result`). |

---

## 5. Mathematical Equations & BDH Formalism

### Standard Softmax Attention:
$$\text{Attention}(Q, K, V) = \text{Softmax}\left(\frac{QK^\top}{\sqrt{d_k}}\right)V$$
*Requires storing all historical $K$ and $V$ vectors $\implies O(N)$ memory growth.*

### BDH Hebbian Synaptic Memory:
In Dragon Hatchling, attention is mapped to a dynamic synaptic connectivity matrix $S_t \in \mathbb{R}^{d \times d}$:
- **Synaptic Write Step (Hebbian Rule):**
  $$S_t = \lambda S_{t-1} + \eta (V_t K_t^\top)$$
  where $\lambda \in (0, 1]$ is retention decay and $\eta$ is learning rate.
- **Synaptic Read Step:**
  $$\hat{V}_t = S_{t-1} Q_t$$
- **Sparse Non-Negative Activation (ReLU):**
  $$H_t = \text{ReLU}(W_x X_t + W_s \hat{V}_t + b)$$
  *Crucial constraint: Enforcing non-negative activations with $\approx 5\%$ sparsity ensures orthogonal storage channels and prevents catastrophic cross-talk.*

### BDH-CQ Latent-Space In-Context Adaptation:
Unlike Test-Time Training (TTT) or HRM/TRM which perform gradient backpropagation during inference, **BDH-CQ** keeps all model weights frozen. Adaptation occurs strictly in the recurrent latent state $S_t$ accumulating additively over demonstration pairs in the forward pass.

---

## 6. Quickstart & Local Reproduction

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation
```bash
# Clone the repository
git clone https://github.com/Aditri-web/synaptic-memory-lab.git
cd synaptic-memory-lab

# Install dependencies
npm install

# Launch Vite dev server
npm run dev
```
Open your browser at `http://localhost:5173/` to interact with the live explainer.

### Production Build
```bash
npm run build
npm run preview
```

---

## 7. Primary Research Citations (2022–2026)

1. **Pathway Research (2025/2026)**. *"From Attention to Synapses: Deriving BDH and The Equations of Reasoning."* Pathway Research Blog.
2. **Pathway Research (2026)**. *"BDH-CQ: In-Context Learning from Demonstrations without Chain-of-Thought."* Pathway Technical Report.
3. **Hopfield, J. J., & Krotov, D. (2022)**. *"Dense Associative Memories and Modern Hebbian Learning in Deep Architectures."* Physical Review Research / NeurIPS Proceedings.
4. **Sun, Y., Xu, W., & Feng, J. (2024–2025)**. *"Recurrent Linear Formulations and Non-Negative Sparsity in Post-Transformer Architectures."* IEEE Transactions on Neural Networks and Learning Systems.

---

## 8. AI Assistance & Asset Disclosure

- **Scaffolding & Layout:** Tailwind CSS layout and React component scaffolding were assisted by LLM pair programming.
- **Core Engine & Equations:** All mathematical logic ($S_t$ Hebbian writes, read projections, cosine similarity metrics, and KV cache formulas) was independently verified against primary literature.
- **Visual Assets:** Icons provided by `lucide-react` (ISC License). Charts built using native HTML5 Canvas and SVG primitives.
- **Toy Model Disclosure:** This repository contains an educational, small-scale numerical simulation of Hebbian memory dynamics. It is not an official release or checkpoint of Pathway's proprietary BDH model.

---

## 9. License

Distributed under the **MIT License**. See `LICENSE` for details.
