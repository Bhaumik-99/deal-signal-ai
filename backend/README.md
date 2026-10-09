# DealSignal AI - Backend Service

FastAPI-powered backend implementing a bounded agentic research, evidence-grounded qualification, and empirical LLM evaluation suite for B2B sales intelligence.

---

## Architecture Overview

```
                               Client (Vite React UI)
                                         |
                                   HTTP / REST
                                         v
+---------------------------------------------------------------------------------+
|                               FastAPI Engine                                    |
|                                                                                 |
|  +------------------------+  +--------------------------+  +-----------------+  |
|  | SafeHTTPClient (SSRF)  |  | BoundedAgentStateMachine |  | ToolRegistry    |  |
|  | - RFC1918/CGNAT Block  |  | - 8 Deterministic States |  | - 7 Dynamic     |  |
|  | - DNS Rebinding Guard  |  | - Max 3 Iterations       |  |   Research Tools|  |
|  +------------------------+  +--------------------------+  +-----------------+  |
|                                        |                                        |
|                                        v                                        |
|  +------------------------+  +--------------------------+  +-----------------+  |
|  | Evidence Grounding     |  | Deterministic Rubric     |  | 30-Case Eval Lab|  |
|  | - FactClaim Provenance |  | - ICP Fit (0-40)         |  | - Baseline vs   |  |
|  | - Prompt-Injection Def |  | - Size/Industry (0-20)   |  |   Improved Agent|  |
|  | - Contradiction Audits |  | - Signal Relevance (0-25|  | - P@5, NDCG@5,   |  |
|  | - Staleness Checks     |  | - Evidence Quality (0-15)|  |   Error Analysis|  |
|  +------------------------+  +--------------------------+  +-----------------+  |
|                                        |                                        |
+----------------------------------------|----------------------------------------+
                                         v
                         +-------------------------------+
                         |   SQLite / SQLAlchemy Store   |
                         |  (Companies, Runs, Leads)     |
                         +-------------------------------+
```

---

## Dynamic Tools Registry (`backend/tools/registry.py`)

1. `search_company_information`: Queries public web indices for basic company profiles and operational data.
2. `fetch_company_page`: Fetches and extracts body text from validated URLs while enforcing SSRF protection.
3. `search_company_news`: Searches available news feeds for recent company activities, product releases, and funding.
4. `extract_company_facts`: Parses raw textual data into structured `FactClaim` records with supporting excerpts.
5. `verify_evidence`: Audits proposed claims against retrieved source documents to identify contradictions.
6. `score_lead`: Deterministic scoring model assessing prospect fit against configured rubric weights.
7. `generate_outreach`: Drafts personalized B2B outreach strictly grounded in verified facts.

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status, LLM availability, DB connectivity |
| `POST` | `/api/agent/run` | Execute complete bounded research, scoring & draft generation loop |
| `POST` | `/api/research` | Modular research & evidence collection endpoint |
| `POST` | `/api/score` | Modular mathematical lead scoring endpoint |
| `POST` | `/api/outreach` | Modular outreach draft generator |
| `GET` | `/api/eval/latest` | Retrieve latest 30-case evaluation comparison report |
| `GET` | `/api/eval/dataset`| Retrieve 30 ground-truth evaluation cases |
| `POST` | `/api/eval/run` | Trigger on-demand benchmark evaluation rerun |
| `GET` | `/api/companies` | List all discovered companies in database |
| `GET` | `/api/leads` | List workspace leads with search and filter parameters |
| `GET` | `/api/runs/{run_id}` | Retrieve full historical run trace and data |
| `POST` | `/api/leads/{id}/approve` | Mark draft approved by human |
| `PATCH` | `/api/leads/{id}/draft` | Save updated/edited outreach draft |

---

## Running Evaluations & Tests

### Execute the 30-case Evaluation Suite
```bash
python -m backend.eval.runner
```
Outputs versioned evaluation results to:
- `backend/eval/results/eval_latest.json`
- `backend/eval/results/eval_latest.csv`

### Run Pytest Suite
```bash
pytest backend/tests -v
```
