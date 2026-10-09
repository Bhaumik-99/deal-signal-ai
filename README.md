# DealSignal AI — Evidence-Led Agentic B2B Sales Intelligence & Autonomous Campaign Engine

> **Never send another hallucinated cold email.**  
> DealSignal AI searches the live internet for verified enterprise accounts matching your precise ICP, extracts real commercial expansion triggers with strict primary-source citation auditing, and empowers revenue teams to review, customize, and dispatch real emails over SMTP with complete human-in-the-loop co-pilot control.

DealSignal AI replaces shallow, hallucination-prone LLM wrappers with an explicit agent state machine, dynamic tool registry, untrusted web content defenses (SSRF filtering, prompt injection sanitization), mathematical qualification scoring (0–100), self-verifying outreach generation with zero fabrications, a production-grade SMTP email dispatching engine, and an empirical **30-case LLM Evaluation Lab** comparing baseline vs improved agent architectures.

---

## Visual Architecture & System Workflows

### 1. End-to-End System Architecture

```mermaid
flowchart TD
    subgraph Frontend["React 19 + TypeScript + Vite SPA"]
        UI_Dash["Executive Overview & Metrics"]
        UI_Search["Global Real-Time Account Scout (1-100 accounts)"]
        UI_Editor["Split / Continuous Email Review Editor"]
        UI_Campaign["Campaign Workstation & Co-Pilot Chat Center"]
        UI_SMTP["SMTP Settings & Live Connection Tester"]
        UI_Eval["30-Case LLM Evaluation Benchmark Lab"]
    end

    subgraph API_Gateway["FastAPI Application Gateway (Port 8000)"]
        direction TB
        Endpoint_Search["/api/global-search (Live Web Discovery)"]
        Endpoint_Agent["/api/agent/run (Autonomous Research DAG)"]
        Endpoint_Email["/api/email/send & /api/email/batch-send"]
        Endpoint_SMTP["/api/email/settings & test-connection"]
        Endpoint_Eval["/api/eval/run & /api/eval/latest"]
    end

    subgraph Agent_Core["Agentic Reasoning & Intelligence Engine"]
        State_Machine["Bounded Agent State Machine (Planning -> Retrieval -> Verification)"]
        Tool_Registry["Dynamic Tool Registry (7 Autonomous Tools)"]
        Scoring_Rubric["Deterministic Lead Scoring (0-100 Mathematical Rubric)"]
        Outreach_Gen["Fact-Grounded Outreach Synthesizer (0 Fabrications)"]
    end

    subgraph Security_Defense["Evidence Provenance & Security Fortress"]
        SSRF_Guard["SSRF Guard (Blocks Loopback, RFC1918, Link-Local)"]
        Injection_Filter["Prompt-Injection Sanitizer & Overrides Stripper"]
        Contradiction_Auditor["Contradiction Auditor & Staleness Guard (180d)"]
        Evidence_Vault["FactClaim Provenance Matrix & Exact Quotes"]
    end

    subgraph Delivery_Engine["Real SMTP Email Delivery Subsystem"]
        SMTP_MIME["MIME Multipart Generator (Plaintext + Styled HTML)"]
        SMTP_Auth["STARTTLS / Direct SSL Encrypted Transport"]
        SMTP_Providers["Gmail App Passwords / Outlook / Brevo / Custom Relays"]
        Audit_Logger["Persistent Dispatch Logger (data/sent_emails.json)"]
    end

    UI_Search -->|Prospecting Parameters| Endpoint_Search
    UI_Editor -->|Reviewed Drafts| Endpoint_Email
    UI_SMTP -->|SMTP Credentials| Endpoint_SMTP
    UI_Campaign -->|Human Messages / Takeover| Endpoint_Email

    Endpoint_Search --> State_Machine
    Endpoint_Agent --> State_Machine
    State_Machine <--> Tool_Registry
    Tool_Registry --> SSRF_Guard --> Injection_Filter --> Evidence_Vault
    Evidence_Vault --> Contradiction_Auditor --> Scoring_Rubric --> Outreach_Gen

    Endpoint_Email --> Delivery_Engine
    Delivery_Engine --> SMTP_MIME --> SMTP_Auth --> SMTP_Providers
    Delivery_Engine --> Audit_Logger
```

---

### 2. Autonomous Web Prospecting & Dispatch Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Sales Leader / SDR
    participant WebUI as DealSignal Web UI
    participant Backend as FastAPI Backend
    participant Scraper as Live Web Crawler & DDG
    participant Auditor as Evidence Provenance & Defense
    participant SMTP as Real SMTP Mail Relay
    participant Prospect as Prospect Mail Server

    User->>WebUI: Configure ICP (Sector, Size, ARR, Region, Signal, Target Role, Max 100)
    WebUI->>Backend: POST /api/global-search
    Backend->>Scraper: Execute multi-query live internet search
    Scraper-->>Backend: Raw HTML content, careers & expansion data
    Backend->>Auditor: Sanitize prompt injections & block SSRF
    Backend->>Auditor: Extract FactClaims with exact quote excerpts
    Backend->>Backend: Calculate 0-100 ICP fit score & generate personalized draft
    Backend-->>WebUI: Return Discovered Accounts + Pre-generated Outreach Drafts
    
    User->>WebUI: Click "Start Campaign for All Accounts"
    WebUI->>WebUI: Open Review Modal (Split Editor / Continuous Feed)
    User->>WebUI: Customize subject lines, bodies, recipient email (to_email)
    User->>WebUI: Enter mandatory Campaign Name & Click "Launch Campaign"
    
    WebUI->>Backend: POST /api/email/batch-send (Payloads with to_email, subject, body)
    Backend->>SMTP: Authenticate (STARTTLS/SSL) & Send MIME Email
    SMTP->>Prospect: Deliver to recipient inbox
    SMTP-->>Backend: 250 OK Delivered
    Backend->>Backend: Record timestamped log in data/sent_emails.json
    Backend-->>WebUI: Dispatch summary (Sent count, errors, log ID)
    WebUI-->>User: Update Campaign Workstation & set prospect status to "Waiting for reply"
```

---

### 3. Human-in-the-Loop Campaign Co-Pilot State Machine

```mermaid
stateDiagram-v2
    [*] --> Discovered: Live Web Search (ICP Match)
    Discovered --> DraftReview: Pre-generate Grounded Email Drafts
    
    state DraftReview {
        [*] --> SplitEditor: Individual Account Deep-Dive
        [*] --> ContinuousFeed: Batch Scroll All Emails
        SplitEditor --> EditPayload: Edit Subject, Body, Recipient Email
        ContinuousFeed --> EditPayload: Edit Subject, Body, Recipient Email
        EditPayload --> NameCampaign: Provide Compulsory Campaign Name
    }

    DraftReview --> Dispatched: Launch Campaign (POST /api/email/batch-send)
    
    state CampaignWorkstation {
        Dispatched --> WaitingForReply: Status: Waiting for prospect response
        WaitingForReply --> AutoPilotActive: AI Co-Pilot cadence monitoring
        
        state HumanIntervention {
            AutoPilotActive --> AutoPilotPaused: Click "Pause & Write" / Stop Auto-Pilot
            AutoPilotPaused --> ManualDrafting: Textarea unlocks for SDR
            ManualDrafting --> HumanSendSMTP: Enter to Send (Dispatches real email via SMTP)
            HumanSendSMTP --> AutoPilotPaused: Email Delivered & Thread Updated
            AutoPilotPaused --> AutoPilotActive: Click "Resume Auto-Pilot"
        }
        
        WaitingForReply --> ProspectReplied: Prospect responds to email
        ProspectReplied --> HumanIntervention: High-intent conversation routed to human
    }

    CampaignWorkstation --> [*]: Deal Closed / Follow-up Sequence Completed
```

---

### 4. Zero-Fabrication Evidence Grounding & Citation Audit Pipeline

```mermaid
flowchart LR
    A["Raw Scraped Web Content"] --> B["SSRF & IP Defense<br/>(RFC1918 / Loopback filter)"]
    B --> C["Prompt Injection Defense<br/>(Override & prompt stripping)"]
    C --> D["FactClaim Extractor<br/>(Key facts + verbatim citations)"]
    D --> E["Cross-Source Verifier<br/>(URL checks & hash validation)"]
    E --> F["Contradiction Auditor<br/>(Headcount & Funding conflicts)"]
    F --> G["Sentence-by-Sentence Audit<br/>(Outreach claims verification)"]
    G --> H{"Every Claim Backed?"}
    H -->|Yes| I["✓ 0 Fabrications Verified<br/>(Display verified audit badge)"]
    H -->|No| J["Redact / Flag Claim<br/>(Omit unverified statement)"]
```

---

### 5. Deterministic Lead Scoring Rubric Architecture

```mermaid
flowchart TD
    ICP["ICP Fit Score (0 - 40 pts)<br/>Sector, Business Model, Domain alignment"] --> Sum["Scoring Aggregator"]
    Size["Firmographic Fit (0 - 20 pts)<br/>Employee Headcount & ARR match"] --> Sum
    Signal["Commercial Intent Signals (0 - 25 pts)<br/>Hiring, Capital Raises, Tech Expansion"] --> Sum
    Qual["Evidence Quality (0 - 15 pts)<br/>Primary Source Quotes & Temporal Recency"] --> Sum
    
    Sum --> Penalty["Uncertainty Penalty Subtraction<br/>(Deductions for stale & conflicting claims)"]
    Penalty --> Final["Normalized Final Score (0 - 100 Scale)"]
    
    Final --> Decision{"Qualification Tier"}
    Decision -->|>= 70| High["High ICP Tier (Priority Outbound)"]
    Decision -->|50 - 69| Med["Medium ICP Tier (Nurture Sequence)"]
    Decision -->|< 50| Low["Low ICP Tier (Reject / De-prioritize)"]
```

---

### 6. Empirical 30-Case Benchmark Evaluation Architecture

```mermaid
flowchart TD
    Dataset["30 Ground-Truth Test Cases<br/>(Growth, Funding, Negatives, Prompt Probes, Stale News)"]
    
    subgraph Benchmarks["Dual Agent Benchmark Execution"]
        Baseline["Baseline Agent<br/>(Unconstrained, Shallow Wrap)"]
        Improved["Improved Agent<br/>(State Machine, Provenance Vault, Tool Registry)"]
    end
    
    subgraph Metrics_Engine["Empirical Metrics Engine"]
        M1["Fact Extraction Accuracy: 64.6% -> 93.5% (+28.9%)"]
        M2["Evidence Support Rate: 61.4% -> 96.8% (+35.4%)"]
        M3["Hallucination Reduction: 35.0% -> 2.0% (-33.0%)"]
        M4["Ranking Precision@5 (1.000) & NDCG@5 (1.000)"]
    end
    
    subgraph Visual_Lab["Interactive Evaluation Lab (UI)"]
        Lab_Comp["A/B Comparative Metrics Cards"]
        Lab_Errors["Systematic Error Distribution Explorer"]
        Lab_Cases["30-Case Deep-Dive Drawer & Ground Truth"]
    end
    
    Dataset --> Baseline
    Dataset --> Improved
    Baseline --> Metrics_Engine
    Improved --> Metrics_Engine
    Metrics_Engine --> Visual_Lab
```

---

## Core Engineering Systems

### 1. Dynamic Tool Registry (`backend/tools/registry.py`)
Rather than blindly running fixed pipelines, the agent dynamically decides which tool to invoke based on missing evidence requirements:
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

### 5. Real Email Delivery & SMTP Engine (`backend/services/email_service.py`)
- **No Mock or Simulated Delays**: Real emails are delivered via standard SMTP protocols using Python's standard library `smtplib` and `email.mime`.
- **Supported Providers**:
  - **Google Workspace / Gmail**: Port 587 with STARTTLS or Port 465 with SSL using Google App Passwords.
  - **Microsoft Outlook / Office 365**: Port 587 (`smtp.office365.com`).
  - **Brevo (Sendinblue)**: Port 587 (`smtp-relay.brevo.com`).
  - **Custom SMTP Relays / Amazon SES / Postmark**: Any standard RFC 5321 compliant host.
- **Live Connection Tester**: Test credentials and dispatch a verification email before launching campaigns.
- **Persistent Dispatch Audit Trail**: All outbound emails, recipients, message IDs, timestamps, and delivery statuses are saved to `data/sent_emails.json`.
- **Precondition Verification**: If credentials are not yet configured, the system cleanly prompts the user with the SMTP configuration modal (`HTTP 428 Precondition Required`).

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
```

*(Optional)* Configure SMTP delivery via environment variables or directly in the UI under **Email & SMTP Settings**:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-character-app-password
SMTP_FROM_EMAIL=your-email@gmail.com
SMTP_FROM_NAME="DealSignal Growth Team"
SMTP_USE_TLS=true
SMTP_USE_SSL=false
```

> **Gmail Quick Setup Tip**: Go to your Google Account -> Security -> 2-Step Verification -> App passwords. Generate an App password named "DealSignal" and enter the 16-character key into the SMTP settings dialog.

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

### Run Pytest Suite (26/26 Passing)
```bash
pytest backend/tests -v
```
Covers:
- **Email Service**: Settings persistence, mocked SMTP transmission, batch dispatch, and log queries (`test_email_service.py`)
- **Tool Registry**: Dynamic discovery and tool execution
- **Security & Prompt Defense**: SSRF blocking, private IP rejection, injection sanitization
- **Evidence Consistency**: Contradiction auditing and source excerpt hashing
- **Metric Math**: Precision@5, NDCG@5, Support Rate calculation
- **30-Case Benchmark Dataset**: Schema validation and completeness
- **State Machine**: Bounded state transitions and sufficiency checking

### Build Frontend Bundle
```bash
npm run build
```

---

## REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health status and LLM configuration check |
| `POST`| `/api/global-search` | Live internet prospecting search across 1-100 accounts |
| `POST`| `/api/agent/run` | Execute complete bounded research state machine |
| `POST`| `/api/research` | Search and retrieve grounded facts |
| `POST`| `/api/score` | Deterministic prospect scoring (0–100) |
| `POST`| `/api/outreach` | Generate grounded personalized outreach |
| `GET` | `/api/email/settings` | Get current SMTP configuration (password masked) |
| `POST`| `/api/email/settings` | Update SMTP delivery credentials and provider |
| `POST`| `/api/email/test-connection` | Verify SMTP credentials and optionally send a test email |
| `POST`| `/api/email/send` | Dispatch a single real email via configured SMTP relay |
| `POST`| `/api/email/batch-send` | Dispatch a batch campaign of real emails via SMTP |
| `GET` | `/api/email/logs` | Fetch delivery history and audit trail from `sent_emails.json` |
| `GET` | `/api/eval/latest` | Retrieve latest 30-case evaluation comparison report |
| `GET` | `/api/eval/dataset`| Retrieve 30 ground-truth evaluation cases |
| `POST`| `/api/eval/run` | Trigger on-demand benchmark evaluation rerun |

---

## Safety & Production Guidelines
- **Human In The Loop**: Outreach drafts are reviewed in either Split View or Continuous Feed mode prior to dispatch; users can pause AI auto-pilot at any moment to send manual emails.
- **SSRF Protection**: External URLs are pre-filtered to prevent SSRF against private subnets, cloud metadata services, and internal endpoints.
- **Data Minimization**: Collects only public corporate signals; personal private data is never retained.
- **Bounded Resource Budgets**: Enforces max 3 iterations, strict HTTP request timeouts, and 2MB payload caps to prevent runaway executions.
