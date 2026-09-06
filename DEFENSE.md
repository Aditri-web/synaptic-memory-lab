# Synaptic Memory Lab — Live Evaluation Defense Guide

This document provides mathematically rigorous answers to anticipated evaluator and judge questions, detailing the design decisions, mathematical proofs, and bounds of the **Synaptic Memory Lab**.

---

## 1. Frequently Anticipated Technical Questions

### Q1: "Why is the retrieval fidelity threshold set to 0.70 (and 0.90 for capacity tests)?"
- **Hypersphere Geometry & Noise Margin:** In a $d$-dimensional space ($d \in [16, 256]$), two independently sampled random unit vectors have expected cosine similarity $\mathbb{E}[\cos \theta] = 0$ with standard deviation $\sigma \approx \frac{1}{\sqrt{d}}$.
  - For $d=64$, $\sigma = 0.125$. A threshold of $0.70$ is $5.6\sigma$ above chance ($p < 10^{-7}$).
  - For $d=256$, $\sigma = 0.0625$. A threshold of $0.70$ is $> 11\sigma$ above chance ($p < 10^{-28}$).
- **Associative Superposition:** Because $S_t = \sum_{j=1}^t \lambda^{t-j} \eta (v_j k_j^\top)$, reading with key $q_i \approx k_i$ produces:
  $$\hat{v}_i = S_t k_i = \eta (k_i^\top k_i) v_i + \sum_{j \neq i} \lambda^{t-j} \eta (k_j^\top k_i) v_j$$
  The second term is cross-talk noise. When mean cosine similarity drops below $0.70$, cross-talk variance accounts for $> 30\%$ of retrieved vector energy, indicating that the associative capacity channel is saturated. In the unit tests, $0.90$ is used for $N \ll d$ to verify pristine, noise-free storage.

---

### Q2: "Why are the interactive substrate bounds set to $d \le 256$ and $N \le 2000$?"
- **Interactive 60 FPS Budget ("No Hidden Limits"):** The live in-browser engine computes pure TypedArray matrix updates and vector dot products in client-side JavaScript.
  - At $d=256$, the synaptic matrix requires $256 \times 256 \times 4\text{ bytes} = 262\text{ KB}$ of RAM.
  - Simulating 2,000 sequential outer product writes and sample retrievals completes in $< 12\text{ms}$ in modern V8 engines, fitting safely within the $16.6\text{ms}$ animation frame budget without requiring web workers or inducing frame drops.
- **Pedagogical vs. Production Scale:**
  - The live interactive substrate is designed to teach the *mathematical dynamics* of Hebbian updates, decay, and cross-talk interference.
  - Production model dimensions ($d \in [2048, 16384]$ for 1B to 600B models) are presented in the Pretraining Scaling module using our illustrative architectural model based on standard LLaMA-style GQA parameters.

---

### Q3: "What breaks mathematically if retention decay $\lambda = 1.0$ versus $\lambda < 1.0$?"
- **If $\lambda = 1.0$ (Infinite Retention):**
  - The matrix norm $\|S_t\|_F$ accumulates monotonically:
    $$\mathbb{E}[\|S_t\|_F^2] = \sum_{j=1}^t \eta^2 \|v_j k_j^\top\|_F^2 = t \cdot \eta^2$$
  - The noise floor $\sum_{j \neq i} (k_j^\top k_i) v_j$ grows with $\sqrt{t}$. Once $t > d$, the signal-to-noise ratio drops below 1, causing a catastrophic capacity cliff where *all* stored associations become unrecoverable simultaneously.
- **If $\lambda < 1.0$ (Exponential Forgetting):**
  - Past associations decay with half-life $t_{1/2} = \frac{\ln(0.5)}{\ln(\lambda)}$.
  - The steady-state matrix Frobenius norm is strictly bounded by a geometric series:
    $$\|S_\infty\|_F \le \frac{\eta}{1 - \lambda}$$
  - Cross-talk interference remains bounded for arbitrarily long sequences ($N \rightarrow \infty$), trading long-range recall for operational stability.

---

### Q4: "Why does non-negative sparsity prevent cross-talk interference?"
- **Sparse Non-Negative Orthant:** BDH enforces ReLU non-negative activations with a target sparsity budget of $s \approx 0.05$ (5% active units).
- **Collision Probability:** For two independently generated sparse keys $k_i, k_j \in \mathbb{R}_{\ge 0}^d$ with sparsity $s$:
  - The probability that coordinate $m$ is active in both vectors is $s^2 = (0.05)^2 = 0.0025$ ($0.25\%$).
  - Over dimension $d=64$, the expected number of overlapping active coordinates is $64 \times 0.0025 = 0.16 \ll 1$.
  - Therefore, the inner product $k_i^\top k_j \approx 0$ with high probability, rendering random keys **quasi-orthogonal**.
  - This suppresses the cross-talk term $\sum_{j \neq i} (k_j^\top k_i) v_j \approx 0$, allowing the matrix to pack many more associations into the same $d \times d$ footprint before saturation occurs.

---

### Q5: "What is the exact mathematical crossover point where KV cache RAM exceeds synaptic matrix RAM?"
- **Standard Transformer KV Cache RAM:**
  $$M_{KV}(N) = 2 \cdot L \cdot H_{kv} \cdot d_k \cdot N \cdot b$$
  where $L$ is layer count, $H_{kv}$ is number of key-value heads, $d_k$ is head dimension, $N$ is sequence length, and $b=2\text{ bytes}$ (FP16).
- **Synaptic State RAM:**
  - For a full dense $d \times d$ matrix per layer: $M_{syn} = L \cdot d^2 \cdot b$.
  - Setting $M_{KV}(N^*) = M_{syn}$:
    $$2 \cdot H_{kv} \cdot d_k \cdot N^* = d^2 \implies N^* = \frac{d^2}{2 \cdot H_{kv} \cdot d_k} = \frac{g \cdot d}{2}$$
    where $g = H / H_{kv}$ is the Grouped-Query Attention (GQA) ratio and $d = H \cdot d_k$.
    For a 7B model ($d=4096$, $H=32$, $H_{kv}=8$, $g=4$): $N^* = \frac{4 \cdot 4096}{2} = 8{,}192\text{ tokens}$.
  - For **multi-head linear recurrent attention** (separate $d_k \times d_k$ state per head):
    $$M_{syn} = L \cdot H \cdot d_k^2 \cdot b \implies N^* = \frac{H \cdot d_k^2}{2 \cdot H_{kv} \cdot d_k} = \frac{g \cdot d_k}{2}$$
    For standard $d_k = 128$ and GQA ratio $g = 4$:
    $$N^* = \frac{4 \cdot 128}{2} = \mathbf{256 \text{ tokens}}$$
  - **Conclusion:** Beyond just 256 tokens, the recurrent synaptic state is strictly smaller than the Transformer KV cache. At 128k context length, the KV cache is $\frac{128{,}000}{256} = \mathbf{500\times}$ larger than the recurrent synaptic state.

---

## 2. Teammate Presentation Split & Defense Roles

To demonstrate deep collective ownership during the live judging round, the defense is organized into two complementary presentation roles:

| Focus Area | Speaker A (Theoretical & Mathematical Substrate) | Speaker B (Architectural Scaling & Empirical Frontier) |
|:---|:---|:---|
| **Core Concept** | Paradigm shift from $O(N)$ KV cache to $O(1)$ Hebbian plasticity | In-context learning via recurrent state accumulation without backprop |
| **Equations** | Hebbian write $S_t = \lambda S_{t-1} + \eta v_t k_t^\top$, read $\hat{v}_t = S_{t-1} q_t$ | Sparsity projection $H_t = \text{ReLU}(W_x X_t + W_s \hat{v}_t + b)$, non-SSM distinction |
| **Live Demo** | Guided Hook walkthrough & step-by-step heatmap outer-product animation | Sandbox parameter tuning ($\lambda, \eta$, sparsity) & capacity cliff curve |
| **Evidence** | Primary peer-reviewed citations: Sun et al. (2023), Yang et al. (2024), Schlag et al. (2021) | Pathway technical reports, ARC-AGI benchmark results, and honest illustrative framing |
| **Code Verification**| 34 Vitest unit tests validating closed-form hand-calculated equations | Crossover point arithmetic ($N^* = 256$) and memory scaling across 1B–600B models |

---

## 3. Evidence Discipline Checklist for Live Round

- [x] **Honest Labeling:** All 1B–600B scaling metrics and ARC-AGI effort curves are explicitly labeled in the UI as **Illustrative Pedagogical Projections**, not quoted benchmark tables.
- [x] **Primary Literature Verified:** All academic citations resolved to verified arXiv and PMLR venues with clickable links.
- [x] **Toy Model Boundary:** Live interactive substrate clearly designated as an independent numerical educational tool, separate from Pathway's proprietary weights.
- [x] **Zero AI Slop:** Every paragraph in the application and concept summary defines a concrete mechanism, formula, or empirical boundary.
