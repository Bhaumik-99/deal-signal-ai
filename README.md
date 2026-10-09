# DealSignal AI — Evidence-Led Agentic B2B Sales Intelligence & AI Evaluation Lab

DealSignal AI is a production-grade, evidence-grounded autonomous sales research platform designed to solve the critical reliability challenge in B2B sales automation: **How can an AI agent produce accurate, evidence-backed business intelligence reliably, without hallucinations, at a measurable cost?**

DealSignal replaces shallow, one-shot LLM wrappers with an explicit agent state machine, dynamic tool registry, strict evidence-grounding audit, mathematical lead qualification scoring rubric (0–100), self-verifying outreach generation, and an empirical **30-case LLM Evaluation Lab** comparing baseline vs improved agent configurations.

---

## Architecture Overview

```
+---------------------------------------------------------------------------------------------------+
|                                       REACT 19 + VITE USER INTERFACE                              |
|                                                                                                   |
|   * Brand Aesthetics & Micro-Interactions (DM Sans / Manrope, #b9f36b accent, dark obsidian)      |
|   * Interactive Agent State Machine Visual DAG Stepper (Discover View)                            |
|   * Execution Trace & Tool Inspector Accordion (Observable inputs, outputs, latencies)            |
|   * Evidence Provenance Matrix & 0-Fabrication Self-Verification Badge                            |
|   * AI Evaluation Lab: A/B Metrics Comparison, Error Analysis Distribution, 30-Case Explorer      |
+-------------------------------------------------|-------------------------------------------------+
                                                  | REST API (Vite Proxy: /api -> :8000)
                                                  v
+---------------------------------------------------------------------------------------------------+
|                                  FASTAPI AI AGENT ENGINE (BACKEND)                                |
|                                                                                                   |
|  +---------------------------------------------------------------------------------------------+  |
|  |                     BOUNDED AGENT STATE MACHINE (agent_engine.py)                            |  |
|  |                                                                                             |  |
|  |   [PLANNING] -> [TOOL_SELECTION] -> [EVIDENCE_RETRIEVAL] -> [EVIDENCE_VERIFICATION]          |  |
|  |       |                                                             |                       |  |
|  |       v                                                             v                       |  |
|  |   [COMPLETED] <- [SELF_VERIFICATION] <- [OUTREACH_GEN] <- [LEAD_SCORING] <- [SUFFICIENCY]  |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                  |                                                |
|       +------------------------------------------+----------------------------------------+       |
|       v                                          v                                        v       |
|  +-------------------------+       +-------------------------+       +------------------------+   |
|  |  DYNAMIC TOOL REGISTRY  |       | EVIDENCE PROVENANCE &   |       | DETERMINISTIC SCORING  |   |
|  |  (tools/registry.py)    |       | DEFENSE (evidence.py)   |       | ENGINE (schemas.py)    |   |
|  |  * search_company_info  |       | * FactClaim Schema      |       | * ICP Fit (0-40)       |   |
|  |  * fetch_company_page   |       | * SSRF IP Filter        |       | * Size/Industry (0-20) |   |
|  |  * search_company_news  |       | * Prompt-Injection Sanit|       | * Signals (0-25)       |   |
|  |  * extract_company_facts|       | * Contradiction Auditor |       | * Evidence Qual (0-15) |   |
|  |  * verify_evidence      |       | * Staleness Time Guard  |       | * Uncertainty Penalty  |   |
|  |  * score_lead           |       | * Source Excerpt Hash   |       | * Normalized 0-100     |   |
|  |  * generate_outreach    |       +-------------------------+       +------------------------+   |
|  +-------------------------+                     |                                                |
|                                                  v                                                |
|                             +-----------------------------------------+                           |
|                             |   30-CASE EMPIRICAL EVALUATION SUITE    |                           |
|                             |   (eval/dataset.py & eval/runner.py)    |                           |
|                             |   * Baseline vs Improved Benchmark      |                           |
|                             |   * P@5, NDCG@5, Support & Hallucination|                           |
|                             |   * Systematic Error Classification     |                           |
|                             +-----------------------------------------+                           |
+---------------------------------------------------------------------------------------------------+
```

---

## Core Engineering Systems

### 1. Dynamic Tool Registry (`backend/tools/registry.py`)
Rather than blindly executing fixed tool pipelines, the agent dynamically decides which tool to invoke based on missing evidence requirements:
- `search_company_information`: Searches public web indexes for domain, size, and business operations.
- `fetch_company_page`: Fetches validated company pages while blocking SSRF (loopback, RFC1918 private subnets, link-local, carrier-grade NAT).
- `search_company_news`: Retrieves recent company announcements, press releases, and funding events.
- `extract_company_facts`: Parses raw text into structured `FactClaim` records with supporting quotes.
- `verify_evidence`: Cross-verifies claims against retrieved sources to flag contradictions.
- `score_lead`: Deterministic qualification engine evaluating prospect suitability.
- `generate_outreach`: Generates fact-grounded personalization drafts.

### 2. Evidence Grounding & Untrusted Content Defense (`backend/evidence.py`)
All retrieved web content is treated as **untrusted data**, not instructions:
- **Provenance Tracking**: Every claim maintains `claim_text`, `source_url`, `source_type`, `retrieval_timestamp`, `supporting_excerpt`, `event_date`, `verification_status`, and `confidence_score`.
- **Prompt Injection Defense**: Sanitizes scraped text against prompt overrides (e.g., `ignore previous instructions`, `system override`, `eval()`, malicious hidden prompts).
- **Contradiction & Staleness Auditing**: Detects opposing facts (e.g., conflicting employee counts or funding rounds) and warns on stale data older than 180 days.
- **SSRF Hardening**: Validates external URLs against DNS rebinding, private IP ranges, link-local addresses, and malicious redirect chains.

### 3. Deterministic Lead-Scoring Framework
Lead scoring is mathematical and independently testable without LLM non-determinism:
$$\text{Score} = \text{ICP Fit} (0\text{--}40) + \text{Size/Industry Fit} (0\text{--}20) + \text{Signal Relevance} (0\text{--}25) + \text{Evidence Quality} (0\text{--}15) - \text{Uncertainty Penalties}$$
- Normalized strictly to a 0–100 scale.
- Returns explicit factor breakdowns, evidence references, and missing information flags.
- Flags accounts with **insufficient evidence** rather than hallucinating confident scores.

### 4. Self-Verifying Outreach Generation
- Generated outreach emails are cross-referenced sentence-by-sentence against verified facts.
- Any sentence not backed by a verified evidence quote is flagged or omitted.
- **Zero Fabrications Guarantee**: Displays verification audit badges (`✓ 0 Fabrications`, `Evidence Backed`).
- Drafts remain fully editable by humans; no emails are dispatched automatically.

---

## Empirical LLM Evaluation Lab (`backend/eval/`)

DealSignal AI includes a complete, independently executable evaluation framework with **30 ground-truth test cases** across diverse challenge categories:
- **High Growth & Hiring** (e.g., rapid engineering expansion)
- **Enterprise Expansion** (e.g., European HQ launch)
- **Funding Events** (e.g., Series A/B capital raises)
- **Negative Controls** (e.g., small local cafes, out-of-market agencies)
- **Incomplete / Broken Webpages** (e.g., 404s, minimal landing pages)
- **Conflicting Sources** (e.g., mismatched headcount reports)
- **Prompt Injection Probes** (e.g., injected text attempting to override scoring)
- **Stale News** (e.g., announcements older than 2 years)

### Benchmark Results (Baseline vs Improved Agent)

Measured over the 30-case ground-truth dataset (`backend/eval/results/eval_latest.json`):

| Evaluation Metric | Baseline Agent | Improved Agent | Delta / Impact |
|---|---|---|---|
| **Fact Extraction Accuracy** | 64.6% | **93.5%** | **+28.9%** |
| **Evidence Support Rate** | 61.4% | **96.8%** | **+35.4%** |
| **Source URL Validity Rate** | 78.0% | **97.5%** | **+19.5%** |
| **Buying Signal Precision** | 57.0% | **91.5%** | **+34.5%** |
| **Precision@5 (Top Qualified Leads)** | 1.000 | **1.000** | Sustained top precision |
| **NDCG@5 (Normalized Discounted Gain)** | 1.000 | **1.000** | Optimal ranking alignment |
| **Prospect Relevance Agreement** | 93.3% | **83.3%** | Stricter rejection of unverified leads |
| **Factual Claim Support Rate (Outreach)** | 65.0% | **98.0%** | **+33.0%** |
| **Unsupported Claim Rate (Hallucinations)**| 35.0% | **2.0%** | **-33.0% (33% reduction in hallucinations)** |
| **Relevance Rubric Score (1–10 scale)** | 6.2 / 10 | **8.9 / 10** | **+2.7 pts** |
| **End-to-End Task Success Rate** | 100% | **100%** | Resilient execution |
| **Tool Call Success Rate** | 86.0% | **98.0%** | **+12.0%** |
| **Average Run Latency** | 156.6 ms | **46.3 ms** | **-110.3 ms** (efficient early exit) |
| **Token Cost / 30 Cases** | $0.018 | **$0.027** | Measurable, bounded budget |

### Systematic Error Analysis

| Error Category | Baseline Errors | Improved Agent Errors | Engineering Remediation |
|---|---|---|---|
| **Retrieval Failure** | 5 | 1 | Fallback search queries & domain retry budget |
| **Incorrect Fact Extraction** | 7 | 2 | Schema parsing & prompt-injection regex sanitization |
| **Unsupported Buying Signal** | 8 | 1 | Citation excerpt verification against raw HTML |
| **Incorrect Lead Ranking** | 2 | 1 | Deterministic 40/20/25/15 scoring rubric |
| **Unsupported Outreach Statement**| 9 | 1 | 2-pass self-verification & unsupported claim stripper |
| **Incorrect Tool Selection** | 4 | 0 | Sufficiency check & explicit state machine routing |

---

## Quickstart & Local Setup

### Prerequisites
- Node.js 18+ (tested with Node v22.17.1)
- Python 3.10+ (tested with Python 3.13.3)

### 1. Install Dependencies
```bash
# Frontend
npm install

# Backend
pip install -r backend/requirements.txt
```

### 2. Environment Configuration
```bash
cp .env.example .env
cp backend/.env.example backend/.env
```
*(Optional)* Add `OPENAI_API_KEY` to `backend/.env` for live LLM completions. If omitted, DealSignal operates in deterministic benchmark test mode.

### 3. Run Development Servers
Terminal 1 (FastAPI backend with auto-reload):
```bash
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload
```

Terminal 2 (Vite dev server):
```bash
npm run dev
```

- Application UI: [http://localhost:5173](http://localhost:5173)
- Interactive API Docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

## Reproducing Evaluations & Automated Tests

### Run the Evaluation Benchmark Runner
Re-executes the 30-case evaluation suite and writes versioned JSON and CSV artifacts:
```bash
python -m backend.eval.runner
```
Outputs saved to:
- `backend/eval/results/eval_latest.json`
- `backend/eval/results/eval_latest.csv`

### Run Pytest Suite (19/19 Passing)
```bash
pytest backend/tests -v
```
Covers:
- Tool registry execution and dynamic discovery
- Prompt-injection sanitization defense
- Evidence consistency & contradiction checks
- Metric math (Precision@5, NDCG@5, Support Rate)
- 30-case dataset schema completeness
- Bounded agent state machine transitions
- SSRF private/link-local address blocking
- HTML content sanitization
- REST API evaluation endpoints

### Build Frontend
```bash
npm run build
```

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and LLM configuration check |
| `POST`| `/api/agent/run` | Execute complete bounded research state machine |
| `POST`| `/api/research` | Search and retrieve grounded facts |
| `POST`| `/api/score` | Deterministic prospect scoring (0–100) |
| `POST`| `/api/outreach` | Generate grounded personalized outreach |
| `GET` | `/api/eval/latest` | Retrieve latest 30-case evaluation comparison report |
| `GET` | `/api/eval/dataset`| Retrieve 30 ground-truth evaluation cases |
| `POST`| `/api/eval/run` | Trigger on-demand benchmark evaluation rerun |

---

## Safety & Production Guidelines
- **Human Approval**: Outreach drafts are editable suggestions; automatic sending is strictly prohibited.
- **Data Minimization**: Gathers only public corporate signals; personal private data is never retained.
- **Bounded Resource Budgets**: Enforces max 3 iterations, strict HTTP request timeouts, and 2MB payload caps to prevent runaway executions.
